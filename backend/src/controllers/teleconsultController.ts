// HealthSure — Production Teleconsultation Controller & Server-Authoritative State Machine
// backend/src/controllers/teleconsultController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';
import { getPrisma } from '../db/prisma.js';

// ── WebRTC Signaling Message Interface ──────────────────────────────────────
export interface SignalingMessage {
  id: string;
  sessionId: string;
  senderRole: 'patient' | 'doctor';
  type: 'offer' | 'answer' | 'candidate' | 'ice' | 'presence' | 'live' | 'leave';
  payload: any;
  timestamp: number;
}

// In-process memory store for fast local lookup
const inMemorySignalingStore = new Map<string, SignalingMessage[]>();

// Session presence tracking
export interface SessionPresence {
  sessionId: string;
  appointmentId?: string;
  patientJoined: boolean;
  doctorJoined: boolean;
  patientJoinedAt?: number;
  doctorJoinedAt?: number;
  connectedAt?: number;
  endedAt?: number;
  status: 'UPCOMING' | 'WAITING_FOR_PATIENT' | 'WAITING_FOR_DOCTOR' | 'CONNECTING' | 'LIVE' | 'ENDED' | 'FAILED';
  durationSeconds: number;
}

export const sessionPresenceStore = new Map<string, SessionPresence>();

/**
 * Resolves appointment ID, teleconsultation ID, or token to canonical session ID ('tele-001')
 */
export function resolveCanonicalSessionId(id: string): string {
  if (!id) return 'tele-001';
  const clean = String(id).trim();
  const tele = dataStore.teleconsultations.find(
    (t) => t.id === clean || t.appointmentId === clean || `tele-${t.appointmentId}` === clean
  );
  if (tele) return tele.id;
  if (clean === 'apt-001' || clean === 'apt1' || clean === 'HS-APT-1001' || clean === 'tele-001' || clean === 'HS-APT-3012') {
    return 'tele-001';
  }
  return clean;
}

// ── Centralized Server-Authoritative State Machine ──────────────────────────
export interface TransitionContext {
  sessionId: string;
  to: 'UPCOMING' | 'WAITING_FOR_PATIENT' | 'WAITING_FOR_DOCTOR' | 'CONNECTING' | 'LIVE' | 'ENDED' | 'FAILED';
  role?: string;
  endpoint: string;
  reason: string;
  actor: string;
  requestId?: string;
  explicitUserAction?: boolean;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  UPCOMING: ['WAITING_FOR_DOCTOR', 'WAITING_FOR_PATIENT', 'CONNECTING', 'LIVE'],
  WAITING_FOR_DOCTOR: ['CONNECTING', 'LIVE', 'ENDED'],
  WAITING_FOR_PATIENT: ['CONNECTING', 'LIVE', 'ENDED'],
  CONNECTING: ['LIVE', 'FAILED', 'ENDED'],
  LIVE: ['ENDED', 'FAILED', 'LIVE'], // LIVE -> LIVE is idempotent
  FAILED: ['CONNECTING', 'LIVE', 'ENDED'],
  ENDED: [], // terminal state
};

export function transitionTeleconsultationState(ctx: TransitionContext): boolean {
  const { sessionId, to, role, endpoint, reason, actor, requestId = Math.random().toString(36).substring(2, 8), explicitUserAction } = ctx;
  const now = new Date().toISOString();

  let presence = sessionPresenceStore.get(sessionId);
  if (!presence) {
    presence = {
      sessionId,
      patientJoined: false,
      doctorJoined: false,
      status: 'UPCOMING',
      durationSeconds: 0,
    };
    sessionPresenceStore.set(sessionId, presence);
  }

  const currentStatus = presence.status;

  // Reject accidental / implicit transitions to ENDED while call is active
  if (to === 'ENDED' && !explicitUserAction && (currentStatus === 'LIVE' || currentStatus === 'CONNECTING')) {
    console.warn(
      `[${now}][${sessionId}][${role || 'SYSTEM'}][${requestId}] REJECTED_TRANSITION: Cannot transition ${currentStatus} -> ENDED without explicitUserAction! endpoint=${endpoint} reason=${reason}`
    );
    return false;
  }

  // Idempotent state transition
  if (currentStatus === to) {
    return true;
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(to)) {
    console.warn(
      `[${now}][${sessionId}][${role || 'SYSTEM'}][${requestId}] ILLEGAL_TRANSITION: ${currentStatus} -> ${to} is not allowed! endpoint=${endpoint} reason=${reason}`
    );
    return false;
  }

  const oldStatus = presence.status;
  presence.status = to;

  if (to === 'LIVE' && !presence.connectedAt) {
    presence.connectedAt = Date.now();
  }
  if (to === 'ENDED') {
    presence.endedAt = Date.now();
    presence.patientJoined = false;
    presence.doctorJoined = false;
  }

  // Sync with in-memory entity
  const tele = dataStore.teleconsultations.find((t) => t.id === sessionId || t.appointmentId === sessionId);
  if (tele) {
    tele.status = to;
    if (to === 'LIVE' && !tele.startedAt) tele.startedAt = new Date();
    if (to === 'ENDED') tele.endedAt = new Date();
  }

  console.log(
    `[${now}][${sessionId}][${role || 'SYSTEM'}][${requestId}] SESSION_STATE_TRANSITION: ${oldStatus} -> ${to} | endpoint=${endpoint} | caller=${actor} | reason=${reason} | explicit=${!!explicitUserAction}`
  );

  return true;
}

// ── Teleconsultation Handlers ───────────────────────────────────────────────

export const getTeleconsultations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, patientId, doctorId } = (req as any).user || {};

    let list = [...dataStore.teleconsultations];

    if (role === 'PATIENT' && patientId) {
      list = list.filter((t) => t.patientId === patientId);
    } else if (role === 'DOCTOR' && doctorId) {
      list = list.filter((t) => t.doctorId === doctorId);
    }

    // Enrich with appointment date/time, presence, and names
    const enriched = list.map((t) => {
      const apt = dataStore.appointments.find((a) => a.id === t.appointmentId || a.appointmentId === t.appointmentId);
      const doc = dataStore.doctors.find((d) => d.id === t.doctorId);
      const pat = dataStore.patients.find((p) => p.id === t.patientId);
      const hosp = doc ? dataStore.facilities.find((f) => f.id === doc.hospitalId) : null;
      const presence = sessionPresenceStore.get(t.id);

      let sessionStatus = presence ? presence.status : (t.status || 'UPCOMING');

      return {
        ...t,
        status: sessionStatus,
        patientJoined: presence ? presence.patientJoined : false,
        doctorJoined: presence ? presence.doctorJoined : false,
        date: apt ? apt.date : '2026-08-28',
        time: apt ? apt.startTime : '10:30 AM',
        doctorName: doc ? doc.name : 'Dr. Ananya Mehta',
        speciality: doc ? doc.speciality : 'Cardiology',
        hospital: hosp ? hosp.name : 'District Hospital Ratnagiri Telemedicine Node',
        patientName: pat ? pat.fullName : 'Parth Sharma',
        instructions:
          'Connect 5 mins prior. Keep previous ECG & Prescription ready. If 2G mode activates, video will switch to audio priority.',
      };
    });

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeleconsultById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    const t = dataStore.teleconsultations.find((item) => item.id === id || item.appointmentId === id);

    if (!t) {
      res.status(404).json({ success: false, message: 'Teleconsultation session not found.' });
      return;
    }

    const apt = dataStore.appointments.find((a) => a.id === t.appointmentId || a.appointmentId === t.appointmentId);
    const doc = dataStore.doctors.find((d) => d.id === t.doctorId);
    const pat = dataStore.patients.find((p) => p.id === t.patientId);
    const hosp = doc ? dataStore.facilities.find((f) => f.id === doc.hospitalId) : null;
    const presence = sessionPresenceStore.get(t.id);

    res.json({
      success: true,
      data: {
        ...t,
        status: presence ? presence.status : (t.status || 'UPCOMING'),
        patientJoined: presence ? presence.patientJoined : false,
        doctorJoined: presence ? presence.doctorJoined : false,
        date: apt ? apt.date : '2026-08-28',
        time: apt ? apt.startTime : '10:30 AM',
        doctorName: doc ? doc.name : 'Dr. Ananya Mehta',
        speciality: doc ? doc.speciality : 'Cardiology',
        hospital: hosp ? hosp.name : 'District Hospital Ratnagiri Telemedicine Node',
        patientName: pat ? pat.fullName : 'Parth Sharma',
        instructions:
          'Connect 5 mins prior. Keep previous ECG & Prescription ready. If 2G mode activates, video will switch to audio priority.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET Session Status (Strictly Read-Only) ──────────────────────────────────
export const getTeleconsultSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    let presence = sessionPresenceStore.get(id);

    // If local memory is empty, initialize default UPCOMING presence without mutating
    if (!presence) {
      presence = {
        sessionId: id,
        patientJoined: false,
        doctorJoined: false,
        status: 'UPCOMING',
        durationSeconds: 0,
      };
      sessionPresenceStore.set(id, presence);
    }

    const tele = dataStore.teleconsultations.find((t) => t.id === id || t.appointmentId === id);

    res.json({
      success: true,
      data: {
        sessionId: id,
        appointmentId: tele ? tele.appointmentId : 'apt-001',
        status: presence.status,
        patientJoined: presence.patientJoined,
        doctorJoined: presence.doctorJoined,
        patientJoinedAt: presence.patientJoinedAt,
        doctorJoinedAt: presence.doctorJoinedAt,
        connectedAt: presence.connectedAt,
        endedAt: presence.endedAt,
        durationSeconds: tele ? tele.durationSeconds : 0,
        networkMode: tele ? tele.networkMode : 'ADAPTIVE_2G_AUDIO',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Join Teleconsultation (Caller / Callee enters room) ──────────────────────
export const joinTeleconsult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    const { role } = req.body; // 'patient' | 'doctor'
    const now = Date.now();

    let presence = sessionPresenceStore.get(id);
    if (!presence || presence.status === 'ENDED' || (role === 'patient' && !presence.doctorJoined)) {
      // Clear stale signals from earlier completed calls
      inMemorySignalingStore.delete(id);
      const prisma = getPrisma();
      if (prisma) {
        try {
          await prisma.teleconsultSignal.deleteMany({ where: { sessionId: id } });
        } catch {}
      }

      presence = {
        sessionId: id,
        patientJoined: false,
        doctorJoined: false,
        status: 'UPCOMING',
        durationSeconds: 0,
      };
      sessionPresenceStore.set(id, presence);
    }

    if (role === 'patient') {
      presence.patientJoined = true;
      presence.patientJoinedAt = now;
    } else if (role === 'doctor') {
      presence.doctorJoined = true;
      presence.doctorJoinedAt = now;
    }

    let targetStatus: 'WAITING_FOR_DOCTOR' | 'WAITING_FOR_PATIENT' | 'CONNECTING' = 'WAITING_FOR_DOCTOR';
    if (presence.patientJoined && presence.doctorJoined) {
      targetStatus = 'CONNECTING';
    } else if (presence.patientJoined) {
      targetStatus = 'WAITING_FOR_DOCTOR';
    } else if (presence.doctorJoined) {
      targetStatus = 'WAITING_FOR_PATIENT';
    }

    // Apply authoritative state transition
    transitionTeleconsultationState({
      sessionId: id,
      to: targetStatus,
      role,
      endpoint: '/join',
      reason: `${role}_joined_room`,
      actor: role,
      explicitUserAction: true,
    });

    // Broadcast presence signal — write to DB first (serverless-safe)
    const presenceMsg: SignalingMessage = {
      id: `sig-${now}-presence-${role}`,
      sessionId: id,
      senderRole: role as any,
      type: 'presence',
      payload: { role, status: presence.status, patientJoined: presence.patientJoined, doctorJoined: presence.doctorJoined },
      timestamp: now,
    };

    // DB write first (authoritative)
    await persistSignalToDB(presenceMsg);

    // Memory cache write
    const messages = inMemorySignalingStore.get(id) || [];
    messages.push(presenceMsg);
    inMemorySignalingStore.set(id, messages);

    res.json({
      success: true,
      data: presence,
    });
  } catch (error) {
    next(error);
  }
};

// ── Live Teleconsultation (Idempotent confirmation of WebRTC P2P connection) ─
export const liveTeleconsult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    const { role } = req.body;
    const now = Date.now();

    const transitioned = transitionTeleconsultationState({
      sessionId: id,
      to: 'LIVE',
      role,
      endpoint: '/live',
      reason: 'webrtc_p2p_connected',
      actor: role || 'webrtc',
      explicitUserAction: true,
    });

    const presence = sessionPresenceStore.get(id);

    // Persist live signal to DB for cross-instance visibility
    const liveMsg: SignalingMessage = {
      id: `sig-${now}-live-${role || 'peer'}`,
      sessionId: id,
      senderRole: (role || 'patient') as any,
      type: 'live',
      payload: { connected: true, timestamp: now },
      timestamp: now,
    };

    await persistSignalToDB(liveMsg);

    const messages = inMemorySignalingStore.get(id) || [];
    messages.push(liveMsg);
    inMemorySignalingStore.set(id, messages);

    res.json({
      success: transitioned,
      data: presence,
      message: 'Teleconsultation is LIVE.',
    });
  } catch (error) {
    next(error);
  }
};

// ── Leave Teleconsultation (Explicit End Call Only) ─────────────────────────
export const leaveTeleconsult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    const { role, explicit, reason } = req.body;
    const now = Date.now();

    let presence = sessionPresenceStore.get(id);
    const currentStatus = presence ? presence.status : 'UPCOMING';

    // If call is LIVE or CONNECTING and this is NOT an explicit user click, ignore accidental leave
    if ((currentStatus === 'LIVE' || currentStatus === 'CONNECTING') && explicit !== true && reason !== 'user_clicked_end_call') {
      console.warn(`[Teleconsult] IGNORED_IMPLICIT_LEAVE: sessionId=${id} role=${role} currentStatus=${currentStatus}`);
      res.json({
        success: false,
        message: 'Implicit leave request ignored while consultation is active.',
        data: presence,
      });
      return;
    }

    const transitioned = transitionTeleconsultationState({
      sessionId: id,
      to: 'ENDED',
      role,
      endpoint: '/leave',
      reason: reason || 'user_explicit_end_call',
      actor: role,
      explicitUserAction: true,
    });

    // Persist leave signal to DB so other instances know call ended
    const leaveMsg: SignalingMessage = {
      id: `sig-${now}-leave-${role}`,
      sessionId: id,
      senderRole: role as any,
      type: 'leave',
      payload: { role, explicit: true },
      timestamp: now,
    };

    await persistSignalToDB(leaveMsg);

    const messages = inMemorySignalingStore.get(id) || [];
    messages.push(leaveMsg);
    inMemorySignalingStore.set(id, messages);

    res.json({
      success: transitioned,
      message: 'Left consultation session.',
    });
  } catch (error) {
    next(error);
  }
};

// ── DB-primary signal write helper ──────────────────────────────────────────
async function persistSignalToDB(msg: SignalingMessage): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.teleconsultSignal.create({
      data: {
        id: msg.id,
        sessionId: msg.sessionId,
        senderRole: msg.senderRole,
        type: msg.type,
        payload: JSON.stringify(msg.payload),
        timestamp: BigInt(msg.timestamp),
      },
    });
  } catch (dbErr: any) {
    if (!dbErr?.message?.includes('Unique constraint') && !dbErr?.message?.includes('duplicate')) {
      console.warn('[Signal] DB write error:', dbErr?.message);
    }
  }
}

// ── DB-primary signal read helper ────────────────────────────────────────────
async function readSignalsFromDB(sessionId: string, since: number): Promise<SignalingMessage[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const rows = await prisma.teleconsultSignal.findMany({
      where: { sessionId, timestamp: { gt: BigInt(since) } },
      orderBy: { timestamp: 'asc' },
      take: 200,
    });
    return rows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      senderRole: r.senderRole as any,
      type: r.type as any,
      payload: (() => { try { return JSON.parse(r.payload); } catch { return r.payload; } })(),
      timestamp: Number(r.timestamp),
    }));
  } catch {
    return [];
  }
}

// ── WebRTC Serverless Multi-Tier Signaling Engine ───────────────────────────
export const sendSignal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    const { senderRole, type, payload } = req.body;

    if (!senderRole || !type) {
      res.status(400).json({ success: false, message: 'Missing senderRole or type in signaling message.' });
      return;
    }

    const timestamp = Date.now();
    const messageId = `sig-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

    // Normalize type (e.g. 'ice' -> 'candidate')
    const normalizedType = type === 'ice' ? 'candidate' : type;

    const newMsg: SignalingMessage = {
      id: messageId,
      sessionId: id,
      senderRole,
      type: normalizedType,
      payload,
      timestamp,
    };

    // If signal is live, transition to LIVE
    if (normalizedType === 'live') {
      transitionTeleconsultationState({
        sessionId: id,
        to: 'LIVE',
        role: senderRole,
        endpoint: '/signal',
        reason: 'received_live_signal',
        actor: senderRole,
        explicitUserAction: true,
      });
    }

    // 1. DB write FIRST — authoritative across all Vercel instances
    await persistSignalToDB(newMsg);

    // 2. In-process memory cache (local read optimization)
    const messages = inMemorySignalingStore.get(id) || [];
    const fresh = messages.filter((m) => timestamp - m.timestamp < 300000); // 5 min TTL
    fresh.push(newMsg);
    inMemorySignalingStore.set(id, fresh);

    // 3. Fire-and-forget ntfy.sh relay (secondary channel only — do NOT block on this)
    fetch(`https://ntfy.sh/healthsure-tele-${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});

    res.json({
      success: true,
      data: { messageId, timestamp },
    });
  } catch (error) {
    next(error);
  }
};

export const getSignals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    const role = (req.query.role as string) || '';
    const since = parseInt((req.query.since as string) || '0', 10);

    // 1. Read from DB first — authoritative across all Vercel lambda instances
    const dbSignals = await readSignalsFromDB(id, since);

    // 2. Merge with local in-memory cache (catches signals written by THIS instance)
    const mergedMap = new Map<string, SignalingMessage>();
    dbSignals.forEach((m) => mergedMap.set(m.id, m));

    const memoryMsgs = inMemorySignalingStore.get(id) || [];
    memoryMsgs
      .filter((m) => m.timestamp > since)
      .forEach((m) => { if (!mergedMap.has(m.id)) mergedMap.set(m.id, m); });

    // Filter: exclude sender's own role messages, only include messages newer than `since`
    const pending = Array.from(mergedMap.values())
      .filter((m) => {
        const notOwnMessage = !role || m.senderRole !== role;
        const isNewEnough = m.timestamp > since;
        return notOwnMessage && isNewEnough;
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      success: true,
      data: pending,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
};

export const clearSignals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    inMemorySignalingStore.delete(id);
    sessionPresenceStore.delete(id);

    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.teleconsultSignal.deleteMany({
          where: { sessionId: id },
        });
      } catch {}
    }

    res.json({
      success: true,
      message: 'Signaling session reset.',
    });
  } catch (error) {
    next(error);
  }
};

export const patchTeleconsult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = String(req.params.id);
    const id = resolveCanonicalSessionId(rawId);
    const { status, networkMode, clinicalNotes, durationSeconds } = req.body;

    const item = dataStore.teleconsultations.find((t) => t.id === id || t.appointmentId === id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Teleconsultation session not found.' });
      return;
    }

    if (status) {
      transitionTeleconsultationState({
        sessionId: id,
        to: status,
        endpoint: '/patch',
        reason: 'patch_teleconsult',
        actor: 'api_caller',
        explicitUserAction: true,
      });
    }
    if (networkMode) item.networkMode = networkMode;
    if (clinicalNotes) item.clinicalNotes = clinicalNotes;
    if (durationSeconds !== undefined) item.durationSeconds = durationSeconds;
    item.updatedAt = new Date();

    res.json({
      success: true,
      data: item,
      message: 'Teleconsultation session updated.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dynamic ICE/STUN/TURN Configuration Endpoint
 * Resolves reliable STUN endpoints and dynamic/env-configured TURN servers.
 * Excludes any broken or untrusted openrelay endpoints.
 */
export const getIceServersConfig = async (req: Request, res: Response): Promise<void> => {
  const stunServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
  ];

  const iceServers: any[] = [...stunServers];

  // 1. Dynamic Metered API if METERED_DOMAIN & METERED_API_KEY are configured
  const meteredDomain = process.env.METERED_DOMAIN || process.env.VITE_METERED_DOMAIN;
  const meteredApiKey = process.env.METERED_API_KEY || process.env.VITE_METERED_API_KEY;

  if (meteredDomain && meteredApiKey) {
    try {
      const resp = await fetch(`https://${meteredDomain}/api/v1/turn/credentials?apiKey=${meteredApiKey}`, {
        // 3 second abort timeout
        signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(3000) : undefined,
      });
      if (resp.ok) {
        const meteredServers = await resp.json();
        if (Array.isArray(meteredServers) && meteredServers.length > 0) {
          iceServers.unshift(...meteredServers);
        }
      }
    } catch (e: any) {
      console.warn('[ICE] Dynamic Metered lookup deferred / unavailable:', e.message);
    }
  }

  // 2. Custom TURN server via environment variables (TURN_URL / VITE_TURN_URL)
  const turnUrl = process.env.TURN_URL || process.env.VITE_TURN_URL;
  const turnUsername = process.env.TURN_USERNAME || process.env.VITE_TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL || process.env.VITE_TURN_CREDENTIAL;

  if (turnUrl) {
    const urls = turnUrl.includes(',') ? turnUrl.split(',').map((s) => s.trim()) : turnUrl;
    iceServers.unshift({
      urls,
      username: turnUsername || undefined,
      credential: turnCredential || undefined,
    });
  }

  res.json({
    success: true,
    data: {
      iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    },
  });
};

