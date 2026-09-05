// HealthSure — Teleconsultation Routes
// backend/src/routes/teleconsultRoutes.ts

import { Router } from 'express';
import {
  getTeleconsultations,
  getTeleconsultById,
  getTeleconsultSession,
  joinTeleconsult,
  liveTeleconsult,
  leaveTeleconsult,
  patchTeleconsult,
  sendSignal,
  getSignals,
  clearSignals,
  getIceServersConfig,
} from '../controllers/teleconsultController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getTeleconsultations);
router.get('/ice-servers', getIceServersConfig);
router.get('/:id', authenticate, getTeleconsultById);
router.get('/:id/session', getTeleconsultSession);
router.post('/:id/join', joinTeleconsult);
router.post('/:id/live', liveTeleconsult);
router.post('/:id/leave', leaveTeleconsult);
router.patch('/:id', authenticate, patchTeleconsult);

// WebRTC Serverless-Safe Signaling Endpoints
router.post('/:id/signal', sendSignal);
router.get('/:id/signal', getSignals);
router.delete('/:id/signal', clearSignals);

export default router;
