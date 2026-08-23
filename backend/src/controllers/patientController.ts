// HealthSure — Patient Controller
// backend/src/controllers/patientController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';
import { updatePatientProfileSchema } from '../schemas/validationSchemas.js';

export const getMyPatientProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let patient = dataStore.patients.find((p) => p.userId === userId || p.id === req.user?.patientId);

    if (!patient) {
      // Return default demo patient
      patient = dataStore.patients[0];
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyPatientProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = updatePatientProfileSchema.parse(req.body);
    const userId = req.user?.userId;

    let patient = dataStore.patients.find((p) => p.userId === userId || p.id === req.user?.patientId);
    if (!patient) {
      patient = dataStore.patients[0];
    }

    Object.assign(patient, updates, { updatedAt: new Date() });

    // Also update user's language if preferredLanguage changed
    if (updates.preferredLanguage && userId) {
      const user = dataStore.users.find((u) => u.id === userId);
      if (user) {
        user.preferredLang = updates.preferredLanguage;
      }
    }

    res.json({
      success: true,
      data: patient,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
