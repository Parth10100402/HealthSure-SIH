// HealthSure — Teleconsultation Controller (Persistent WebRTC Signaling)
// backend/src/controllers/teleconsultController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';
import { getPrisma } from '../db/prisma.js';

export const getTeleconsultations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, patientId, doctorId } = (req as any).user || {};

    let list = [...dataStore.teleconsultations];

    if (role === 'PATIENT' && patientId) {
      list = list.filter((t) => t.patientId === patientId);
    } else if (role === 'DOCTOR' && doctorId) {
      list = list.filter((t) => t.doctorId === doctorId);
    }

    // Enrich with appointment date/time and names
    const enriched = list.map((t) => {
      const apt = dataStore.appointments.find((a) => a.id === t.appointmentId);
      const doc = dataStore.doctors.find((d) => d.id === t.doctorId);
      const pat = dataStore.patients.find((p) => p.id === t.patientId);

      const hosp = doc ? dataStore.facilities.find((f) => f.id === doc.hospitalId) : null;
      return {
        ...t,
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

    res.json({
      success: true,
      data: {
        ...t,
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

// ── WebRTC Persistent & Synchronized Signaling Mailbox ────────────────────────
interface SignalingMessage {
  id: string;
  sessionId: string;
  senderRole: 'patient' | 'doctor';
  type: 'offer' | 'answer' | 'candidate' | 'status' | 'leave';
  payload: any;
  timestamp: number;
}

// In-process memory store for fast local lookup
const inMemorySignalingStore = new Map<string, SignalingMessage[]>();

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

    // Diagnostic logging (No private SDP or media logged)
    console.log(`[Signal] POST sessionId=${id} senderRole=${senderRole} type=${type} id=${messageId}`);

    // 1. Update in-memory store
    const messages = inMemorySignalingStore.get(id) || [];
    const fresh = messages.filter((m) => timestamp - m.timestamp < 300000); // 5 min TTL
    fresh.push(newMsg);
    inMemorySignalingStore.set(id, fresh);

    // 2. Persist to PostgreSQL if Prisma is available
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
        console.warn(`[Signal] Prisma persistence warning (falling back to memory): `, dbErr);
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

    let pending: SignalingMessage[] = [];

    // 1. Query PostgreSQL if Prisma is available
    const prisma = getPrisma();
    if (prisma) {
      try {
        const rows = await prisma.teleconsultSignal.findMany({
          where: {
            sessionId: id,
            ...(role ? { senderRole: { not: role } } : {}),
            timestamp: { gt: BigInt(since) },
          },
          orderBy: { timestamp: 'asc' },
        });

        pending = rows.map((r) => ({
          id: r.id,
          sessionId: r.sessionId,
          senderRole: r.senderRole as any,
          type: r.type as any,
          payload: JSON.parse(r.payload),
          timestamp: Number(r.timestamp),
        }));
      } catch (dbErr) {
        // Fallback to in-memory store if DB query encounters an issue
        const messages = inMemorySignalingStore.get(id) || [];
        pending = messages.filter((m) => {
          const matchRole = !role || m.senderRole !== role;
          const matchTime = m.timestamp > since;
          return matchRole && matchTime;
        });
      }
    } else {
      // Memory store fallback
      const messages = inMemorySignalingStore.get(id) || [];
      pending = messages.filter((m) => {
        const matchRole = !role || m.senderRole !== role;
        const matchTime = m.timestamp > since;
        return matchRole && matchTime;
      });
    }

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

    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.teleconsultSignal.deleteMany({
          where: { sessionId: id },
        });
      } catch {
        // Ignore reset errors
      }
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
