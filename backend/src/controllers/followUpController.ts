// HealthSure — Follow-Ups Controller
// backend/src/controllers/followUpController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';
import { createFollowUpSchema, updateFollowUpStatusSchema } from '../schemas/validationSchemas.js';
import type { FollowUpEntity } from '../types/index.js';

export const getFollowUps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, status } = req.query;

    let list = [...dataStore.followUps];

    if (req.user?.role === 'PATIENT') {
      const pat = dataStore.patients.find((p) => p.userId === req.user?.userId);
      const pid = pat?.id || req.user.patientId;
      if (pid) list = list.filter((f) => f.patientId === pid);
    } else if (patientId) {
      list = list.filter((f) => f.patientId === patientId);
    }

    if (status) {
      list = list.filter((f) => f.status === (status as string).toUpperCase());
    }

    const enriched = list.map((f) => {
      const pat = dataStore.patients.find((p) => p.id === f.patientId);
      const doc = dataStore.doctors.find((d) => d.id === f.doctorId);
      const fac = dataStore.facilities.find((fac) => fac.id === f.facilityId);

      return {
        ...f,
        patientName: pat?.fullName,
        patientHealthId: pat?.patientId,
        doctorName: doc?.name || 'Dr. Ananya Mehta',
        facility: fac?.name || 'PHC Khed',
        facilityName: fac?.name || 'PHC Khed',
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

export const createFollowUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = createFollowUpSchema.parse(req.body);

    const newFollowUp: FollowUpEntity = {
      id: 'fol-' + Date.now(),
      patientId: body.patientId,
      doctorId: body.doctorId,
      facilityId: body.facilityId,
      appointmentId: body.appointmentId,
      speciality: body.speciality,
      dueDate: body.dueDate,
      mode: body.mode,
      status: 'UPCOMING',
      priority: body.priority,
      instructions: body.instructions,
      title: body.title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.followUps.unshift(newFollowUp);

    res.status(201).json({
      success: true,
      data: newFollowUp,
      message: 'Follow-up created.',
    });
  } catch (error) {
    next(error);
  }
};

export const patchFollowUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const body = updateFollowUpStatusSchema.parse(req.body);

    const fol = dataStore.followUps.find((f) => f.id === id);
    if (!fol) {
      res.status(404).json({ success: false, message: 'Follow-up record not found.' });
      return;
    }

    fol.status = body.status;
    fol.updatedAt = new Date();

    res.json({
      success: true,
      data: fol,
      message: `Follow-up marked as ${fol.status}.`,
    });
  } catch (error) {
    next(error);
  }
};
