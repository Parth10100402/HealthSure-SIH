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
