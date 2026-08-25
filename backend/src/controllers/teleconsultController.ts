// HealthSure — Rebuilt Serverless-Safe Teleconsultation Controller
// backend/src/controllers/teleconsultController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';
import { getPrisma } from '../db/prisma.js';

// ── WebRTC Signaling Message Interface ──────────────────────────────────────
interface SignalingMessage {
  id: string;
  sessionId: string;
  senderRole: 'patient' | 'doctor';
  type: 'offer' | 'answer' | 'candidate' | 'presence' | 'leave';
  payload: any;
  timestamp: number;
}

// In-process memory store for fast local lookup
const inMemorySignalingStore = new Map<string, SignalingMessage[]>();

// Session presence tracking
interface SessionPresence {
  patientJoined: boolean;
  doctorJoined: boolean;
  patientJoinedAt?: number;
  doctorJoinedAt?: number;
  status: 'SCHEDULED' | 'WAITING_FOR_DOCTOR' | 'WAITING_FOR_PATIENT' | 'CONNECTING' | 'CONNECTED' | 'COMPLETED';
}

const sessionPresenceStore = new Map<string, SessionPresence>();

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
      const apt = dataStore.appointments.find((a) => a.id === t.appointmentId);
      const doc = dataStore.doctors.find((d) => d.id === t.doctorId);
      const pat = dataStore.patients.find((p) => p.id === t.patientId);
      const hosp = doc ? dataStore.facilities.find((f) => f.id === doc.hospitalId) : null;
      const presence = sessionPresenceStore.get(t.id);

      return {
        ...t,
        status: presence ? presence.status : t.status,
        patientJoined: presence ? presence.patientJoined : false,
        doctorJoined: presence ? presence.doctorJoined : false,
        date: apt ? apt.date : '2026-08-28',
        time: apt ? apt.startTime : '10:30 AM',
        doctorName: doc ? doc.name : 'Dr. Ananya Mehta',
        speciality: doc ? doc.speciality : 'Cardiology',
        hospital: hosp ? hosp.name : 'District Hospital Ratnagiri',
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
    const { id } = req.params;
    const t = dataStore.teleconsultations.find((item) => item.id === id || item.appointmentId === id);

    if (!t) {
      res.status(404).json({ success: false, message: 'Teleconsultation session not found.' });
      return;
    }

    const apt = dataStore.appointments.find((a) => a.id === t.appointmentId);
    const doc = dataStore.doctors.find((d) => d.id === t.doctorId);
    const pat = dataStore.patients.find((p) => p.id === t.patientId);
    const hosp = doc ? dataStore.facilities.find((f) => f.id === doc.hospitalId) : null;
    const presence = sessionPresenceStore.get(t.id);

    res.json({
      success: true,
      data: {
        ...t,
        status: presence ? presence.status : t.status,
        patientJoined: presence ? presence.patientJoined : false,
        doctorJoined: presence ? presence.doctorJoined : false,
        date: apt ? apt.date : '2026-08-28',
        time: apt ? apt.startTime : '10:30 AM',
        doctorName: doc ? doc.name : 'Dr. Ananya Mehta',
        speciality: doc ? doc.speciality : 'Cardiology',
        hospital: hosp ? hosp.name : 'District Hospital Ratnagiri',
        patientName: pat ? pat.fullName : 'Parth Sharma',
        instructions:
          'Connect 5 mins prior. Keep previous ECG & Prescription ready. If 2G mode activates, video will switch to audio priority.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTeleconsultSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    let presence = sessionPresenceStore.get(id);

    // If local memory is empty or cold, synchronize presence from cloud relay
    if (!presence || (!presence.patientJoined && !presence.doctorJoined)) {
      try {
        const relayRes = await fetch(`https://ntfy.sh/healthsure-tele-${encodeURIComponent(id)}/json?poll=1&since=5m`);
        if (relayRes.ok) {
          const text = await relayRes.text();
          const lines = text.trim().split('\n');
          for (const line of lines) {
            if (!line) continue;
            try {
              const event = JSON.parse(line);
              if (event.event === 'message' && event.message) {
                const msg: SignalingMessage = JSON.parse(event.message);
                if (msg && msg.type === 'presence' && msg.payload) {
                  if (!presence) {
                    presence = { patientJoined: false, doctorJoined: false, status: 'SCHEDULED' };
                  }
                  if (msg.payload.role === 'patient') presence.patientJoined = true;
                  if (msg.payload.role === 'doctor') presence.doctorJoined = true;
                  if (presence.patientJoined && presence.doctorJoined) presence.status = 'CONNECTING';
                  else if (presence.patientJoined) presence.status = 'WAITING_FOR_DOCTOR';
                  else if (presence.doctorJoined) presence.status = 'WAITING_FOR_PATIENT';
                }
              }
            } catch {}
          }
          if (presence) sessionPresenceStore.set(id, presence);
        }
      } catch {}
    }

    if (!presence) {
      presence = {
        patientJoined: false,
        doctorJoined: false,
        status: 'SCHEDULED',
      };
    }

    const tele = dataStore.teleconsultations.find((t) => t.id === id || t.appointmentId === id);

    res.json({
      success: true,
      data: {
        sessionId: id,
        status: presence.status,
        patientJoined: presence.patientJoined,
        doctorJoined: presence.doctorJoined,
        durationSeconds: tele ? tele.durationSeconds : 0,
        networkMode: tele ? tele.networkMode : 'ADAPTIVE_2G_AUDIO',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const joinTeleconsult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { role } = req.body; // 'patient' | 'doctor'

    let presence = sessionPresenceStore.get(id);
    if (!presence) {
      presence = {
        patientJoined: false,
        doctorJoined: false,
        status: 'SCHEDULED',
      };
      sessionPresenceStore.set(id, presence);
    }

    if (role === 'patient') {
      presence.patientJoined = true;
      presence.patientJoinedAt = Date.now();
    } else if (role === 'doctor') {
      presence.doctorJoined = true;
      presence.doctorJoinedAt = Date.now();
    }

    if (presence.patientJoined && presence.doctorJoined) {
      presence.status = 'CONNECTING';
    } else if (presence.patientJoined) {
      presence.status = 'WAITING_FOR_DOCTOR';
    } else if (presence.doctorJoined) {
      presence.status = 'WAITING_FOR_PATIENT';
    }

    // Broadcast presence signal
    const timestamp = Date.now();
    const presenceMsg: SignalingMessage = {
      id: `sig-${timestamp}-presence-${role}`,
      sessionId: id,
      senderRole: role as any,
      type: 'presence',
      payload: { role, status: presence.status },
      timestamp,
    };

    // Update memory
    const messages = inMemorySignalingStore.get(id) || [];
    messages.push(presenceMsg);
    inMemorySignalingStore.set(id, messages);

    // Relay via ntfy.sh
    fetch(`https://ntfy.sh/healthsure-tele-${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      body: JSON.stringify(presenceMsg),
    }).catch(() => {});

    console.log(`[Teleconsult] JOIN sessionId=${id} role=${role} status=${presence.status}`);

    res.json({
      success: true,
      data: presence,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveTeleconsult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { role } = req.body;

    let presence = sessionPresenceStore.get(id);
    if (presence) {
      if (role === 'patient') presence.patientJoined = false;
      if (role === 'doctor') presence.doctorJoined = false;
      presence.status = 'COMPLETED';
    }

    const timestamp = Date.now();
    const leaveMsg: SignalingMessage = {
      id: `sig-${timestamp}-leave-${role}`,
      sessionId: id,
      senderRole: role as any,
      type: 'leave',
      payload: { role },
      timestamp,
    };

    // Relay via ntfy.sh
    fetch(`https://ntfy.sh/healthsure-tele-${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      body: JSON.stringify(leaveMsg),
    }).catch(() => {});

    console.log(`[Teleconsult] LEAVE sessionId=${id} role=${role}`);

    res.json({
      success: true,
      message: 'Left consultation session.',
    });
  } catch (error) {
    next(error);
  }
};

// ── WebRTC Serverless Multi-Tier Signaling Engine ───────────────────────────
export const sendSignal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { senderRole, type, payload } = req.body;

    if (!senderRole || !type) {
      res.status(400).json({ success: false, message: 'Missing senderRole or type in signaling message.' });
      return;
    }

    const timestamp = Date.now();
    const messageId = `sig-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;
    
    const newMsg: SignalingMessage = {
      id: messageId,
      sessionId: id,
      senderRole,
      type,
      payload,
      timestamp,
    };

    console.log(`[Signal] POST sessionId=${id} senderRole=${senderRole} type=${type} id=${messageId}`);

    // 1. In-process memory store
    const messages = inMemorySignalingStore.get(id) || [];
    const fresh = messages.filter((m) => timestamp - m.timestamp < 300000); // 5 min TTL
    fresh.push(newMsg);
    inMemorySignalingStore.set(id, fresh);

    // 2. Global Serverless Pub/Sub Relay (ntfy.sh)
    fetch(`https://ntfy.sh/healthsure-tele-${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch((relayErr) => {
      console.warn(`[Signal] Cloud relay publish warning: `, relayErr);
    });

    // 3. PostgreSQL persistence (if Prisma is available)
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.teleconsultSignal.create({
          data: {
            id: messageId,
            sessionId: id,
            senderRole,
            type,
            payload: JSON.stringify(payload),
            timestamp: BigInt(timestamp),
          },
        });
      } catch (dbErr) {
        // Fallback to relay
      }
    }

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
    const id = String(req.params.id);
    const role = (req.query.role as string) || '';
    const since = parseInt((req.query.since as string) || '0', 10);

    const mergedMap = new Map<string, SignalingMessage>();

    // 1. Gather from in-memory cache
    const memoryMsgs = inMemorySignalingStore.get(id) || [];
    memoryMsgs.forEach((m) => mergedMap.set(m.id, m));

    // 2. Gather from global Serverless Pub/Sub Relay (ntfy.sh)
    try {
      const relayRes = await fetch(`https://ntfy.sh/healthsure-tele-${encodeURIComponent(id)}/json?poll=1&since=5m`);
      if (relayRes.ok) {
        const text = await relayRes.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line) continue;
          try {
            const event = JSON.parse(line);
            if (event.event === 'message' && event.message) {
              const msg: SignalingMessage = JSON.parse(event.message);
              if (msg && msg.id && msg.sessionId === id) {
                mergedMap.set(msg.id, msg);
                // Also backfill local memory
                if (!memoryMsgs.some((m) => m.id === msg.id)) {
                  memoryMsgs.push(msg);
                }
              }
            }
          } catch {}
        }
        inMemorySignalingStore.set(id, memoryMsgs);
      }
    } catch (relayErr) {
      // Memory fallback
    }

    // 3. Gather from PostgreSQL if Prisma is available
    const prisma = getPrisma();
    if (prisma) {
      try {
        const rows = await prisma.teleconsultSignal.findMany({
          where: {
            sessionId: id,
            timestamp: { gt: BigInt(since) },
          },
          orderBy: { timestamp: 'asc' },
        });

        rows.forEach((r) => {
          if (!mergedMap.has(r.id)) {
            mergedMap.set(r.id, {
              id: r.id,
              sessionId: r.sessionId,
              senderRole: r.senderRole as any,
              type: r.type as any,
              payload: JSON.parse(r.payload),
              timestamp: Number(r.timestamp),
            });
          }
        });
      } catch (dbErr) {
        // Continue with merged map
      }
    }

    // Filter by role and timestamp
    const allSignals = Array.from(mergedMap.values());
    const pending = allSignals
      .filter((m) => {
        const matchRole = !role || m.senderRole !== role;
        const matchTime = m.timestamp > since;
        return matchRole && matchTime;
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    console.log(`[Signal] GET sessionId=${id} receiverRole=${role} signalsFound=${pending.length} since=${since}`);

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
    const id = String(req.params.id);
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
    const { id } = req.params;
    const { status, networkMode, clinicalNotes, durationSeconds } = req.body;

    const item = dataStore.teleconsultations.find((t) => t.id === id || t.appointmentId === id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Teleconsultation session not found.' });
      return;
    }

    if (status) item.status = status;
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
