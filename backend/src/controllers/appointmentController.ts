import { publishCloudAppointment } from '../db/cloudSync.js';
// HealthSure — Appointments Controller with Canonical DateTime & Atomic Transactions
// backend/src/controllers/appointmentController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';
import { createAppointmentSchema } from '../schemas/validationSchemas.js';
import type { AppointmentEntity } from '../types/index.js';
import { createUtcInstantFromIst, formatAppointmentTime, formatAppointmentDate } from '../utils/dateTime.js';

export const getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, mode, doctorId, patientId } = req.query;

    let list = [...dataStore.appointments];

    // Filter by role if patient
    if (req.user?.role === 'PATIENT') {
      const patient = dataStore.patients.find((p) => p.userId === req.user?.userId);
      const pid = patient?.id || req.user.patientId;
      if (pid) list = list.filter((a) => a.patientId === pid);
    } else if (req.user?.role === 'DOCTOR') {
      const doctor = dataStore.doctors.find((d) => d.userId === req.user?.userId);
      const did = doctor?.id || req.user.doctorId;
      if (did) list = list.filter((a) => a.doctorId === did);
    }

    if (status) list = list.filter((a) => a.status === (status as string).toUpperCase());
    if (mode) list = list.filter((a) => a.mode === (mode as string).toUpperCase());
    if (doctorId) list = list.filter((a) => a.doctorId === doctorId);
    if (patientId) list = list.filter((a) => a.patientId === patientId);

    // Enrich with patient, doctor, facility, and canonical datetime
    const enriched = list.map((a) => {
      const pat = dataStore.patients.find((p) => p.id === a.patientId);
      const doc = dataStore.doctors.find((d) => d.id === a.doctorId);
      const fac = dataStore.facilities.find((f) => f.id === a.facilityId);
      const tele = dataStore.teleconsultations.find((t) => t.appointmentId === a.id || t.id === a.id);

      const scheduledAt = a.scheduledAt || createUtcInstantFromIst(a.date, a.startTime);
      const displayTime = formatAppointmentTime(scheduledAt);
      const displayDate = formatAppointmentDate(scheduledAt);

      return {
        ...a,
        scheduledAt,
        date: displayDate,
        startTime: displayTime,
        time: displayTime,
        patientName: pat?.fullName || 'Patient',
        patientMobile: pat?.mobile,
        doctorName: doc?.name || 'Dr. Specialist',
        speciality: doc?.speciality || 'General Medicine',
        facilityName: fac?.name || 'District Hospital Ratnagiri',
        teleconsultId: tele?.id || 'tele-001',
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

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);

    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    const pat = dataStore.patients.find((p) => p.id === apt.patientId);
    const doc = dataStore.doctors.find((d) => d.id === apt.doctorId);
    const fac = dataStore.facilities.find((f) => f.id === apt.facilityId);

    const scheduledAt = apt.scheduledAt || createUtcInstantFromIst(apt.date, apt.startTime);
    const displayTime = formatAppointmentTime(scheduledAt);
    const displayDate = formatAppointmentDate(scheduledAt);

    res.json({
      success: true,
      data: {
        ...apt,
        scheduledAt,
        date: displayDate,
        startTime: displayTime,
        time: displayTime,
        patient: pat,
        doctor: doc,
        facility: fac,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = createAppointmentSchema.parse(req.body);

    // Idempotency check — ignore CANCELLED appointments (they can be re-booked)
    if (body.idempotencyKey) {
      const existing = dataStore.appointments.find(
        (a) => a.idempotencyKey === body.idempotencyKey && a.status !== 'CANCELLED'
      );
      if (existing) {
        res.status(200).json({
          success: true,
          data: existing,
          message: 'Appointment retrieved via idempotency key.',
        });
        return;
      }
    }

    let patientId = body.patientId;
    if (!patientId && req.user?.role === 'PATIENT') {
      const pat = dataStore.patients.find((p) => p.userId === req.user?.userId);
      patientId = pat?.id || dataStore.patients[0].id;
    } else if (!patientId) {
      patientId = dataStore.patients[0].id;
    }

    // Atomic slot check if linked to outreach
    if (body.outreachId) {
      const outreach = dataStore.outreachSchedules.find((o) => o.id === body.outreachId || o.outreachId === body.outreachId);
      if (outreach) {
        if (outreach.availableSlots <= 0) {
          res.status(409).json({ success: false, message: 'Selected specialist outreach slot is no longer available.' });
          return;
        }
        outreach.availableSlots -= 1;
        outreach.updatedAt = new Date();
      }
    }

    // Canonical UTC instant
    let scheduledAt = body.scheduledAt;
    if (!scheduledAt) {
      scheduledAt = createUtcInstantFromIst(body.date || '2026-08-28', body.startTime || '10:30 AM');
    }

    const displayDate = formatAppointmentDate(scheduledAt);
    const displayTime = formatAppointmentTime(scheduledAt);

    const newApt: AppointmentEntity = {
      id: 'apt-' + Date.now(),
      appointmentId: `HS-APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      doctorId: body.doctorId,
      facilityId: body.facilityId,
      outreachId: body.outreachId,
      referralId: body.referralId,
      scheduledAt,
      date: displayDate,
      startTime: displayTime,
      endTime: body.endTime || '11:00 AM',
      mode: body.mode,
      status: 'CONFIRMED',
      token: `TOKEN-${Math.floor(10 + Math.random() * 90)}`,
      reasonForVisit: body.reasonForVisit || 'Specialist Consultation',
      idempotencyKey: body.idempotencyKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.appointments.unshift(newApt);
    publishCloudAppointment(newApt);

    if (newApt.mode === 'TELECONSULTATION') {
      const teleId = `tele-${newApt.id}`;
      dataStore.teleconsultations.unshift({
        id: teleId,
        appointmentId: newApt.id,
        patientId: newApt.patientId,
        doctorId: newApt.doctorId,
        status: 'SCHEDULED',
        networkMode: 'HD_VIDEO',
        durationSeconds: 0,
        clinicalNotes: 'WebRTC P2P Teleconsultation Session',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      data: newApt,
      message: 'Appointment successfully scheduled.',
    });
  } catch (error) {
    next(error);
  }
};

export const patchAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);

    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    Object.assign(apt, req.body, { updatedAt: new Date() });

    res.json({
      success: true,
      data: apt,
      message: 'Appointment updated.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const apt = dataStore.appointments.find((a) => a.id === id || a.appointmentId === id);

    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    apt.status = 'CANCELLED';
    apt.updatedAt = new Date();

    // If it was linked to outreach, release slot
    if (apt.outreachId) {
      const outreach = dataStore.outreachSchedules.find((o) => o.id === apt.outreachId || o.outreachId === apt.outreachId);
      if (outreach && outreach.availableSlots < outreach.totalSlots) {
        outreach.availableSlots += 1;
        outreach.updatedAt = new Date();
      }
    }

    publishCloudAppointment(apt);

    res.json({
      success: true,
      data: apt,
      message: 'Appointment cancelled.',
    });
  } catch (error) {
    next(error);
  }
};
