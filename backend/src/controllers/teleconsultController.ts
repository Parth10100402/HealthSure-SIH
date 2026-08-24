// HealthSure — Teleconsultations Controller
// backend/src/controllers/teleconsultController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';

export const getTeleconsultations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = dataStore.teleconsultations.map((t) => {
      const apt = dataStore.appointments.find((a) => a.id === t.appointmentId);
      const pat = dataStore.patients.find((p) => p.id === t.patientId);
      const doc = dataStore.doctors.find((d) => d.id === t.doctorId);
      const fac = dataStore.facilities.find((f) => f.id === apt?.facilityId);

      return {
        ...t,
        date: apt?.date || '2026-08-28',
        time: apt?.startTime || '10:30 AM',
        doctorName: doc?.name || 'Dr. Ananya Mehta',
        speciality: doc?.speciality || 'Cardiology',
        patientName: pat?.fullName || 'Ramesh Sharma',
        patientHealthId: pat?.patientId || 'HS-10248',
        hospital: fac?.name || 'District Hospital Ratnagiri',
        instructions: 'Please join 5 minutes prior to slot from your local PHC tele-kiosk or HealthSure mobile portal.',
      };
    });

    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeleconsultById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = dataStore.teleconsultations.find((t) => t.id === id || t.appointmentId === id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Teleconsultation session not found.' });
      return;
    }

    const doc = dataStore.doctors.find((d) => d.id === item.doctorId);
    const pat = dataStore.patients.find((p) => p.id === item.patientId);

    res.json({
      success: true,
      data: {
        ...item,
        doctor: doc,
        patient: pat,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── WebRTC In-Memory Signaling Mailbox ──────────────────────────────────────
interface SignalingMessage {
  id: string;
  senderRole: 'patient' | 'doctor';
  type: 'offer' | 'answer' | 'candidate' | 'status' | 'leave';
  payload: any;
  timestamp: number;
}

const signalingStore = new Map<string, SignalingMessage[]>();

export const sendSignal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { senderRole, type, payload } = req.body;

    if (!senderRole || !type) {
      res.status(400).json({ success: false, message: 'Missing senderRole or type in signaling message.' });
      return;
    }

    const messages = signalingStore.get(id) || [];
    const newMsg: SignalingMessage = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderRole,
      type,
      payload,
      timestamp: Date.now(),
    };

    // Clean messages older than 5 minutes
    const now = Date.now();
    const fresh = messages.filter((m) => now - m.timestamp < 300000);
    fresh.push(newMsg);
    signalingStore.set(id, fresh);

    res.json({
      success: true,
      data: { messageId: newMsg.id, timestamp: newMsg.timestamp },
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

    const messages = signalingStore.get(id) || [];
    // Deliver messages sent by the other role since the given timestamp
    const pending = messages.filter((m) => {
      const matchRole = !role || m.senderRole !== role;
      const matchTime = m.timestamp > since;
      return matchRole && matchTime;
    });

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
    signalingStore.delete(id);
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



