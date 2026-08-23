// HealthSure — Teleconsultation Routes
// backend/src/routes/teleconsultRoutes.ts

import { Router } from 'express';
import {
  getTeleconsultations,
  getTeleconsultById,
  patchTeleconsult,
} from '../controllers/teleconsultController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getTeleconsultations);
router.get('/:id', authenticate, getTeleconsultById);
router.patch('/:id', authenticate, patchTeleconsult);

export default router;
