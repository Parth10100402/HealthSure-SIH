import { Router } from 'express';
import {
  getTeleconsultations,
  getTeleconsultById,
  patchTeleconsult,
  sendSignal,
  getSignals,
  clearSignals,
} from '../controllers/teleconsultController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getTeleconsultations);
router.get('/:id', authenticate, getTeleconsultById);
router.patch('/:id', authenticate, patchTeleconsult);

// WebRTC Signaling Endpoints
router.post('/:id/signal', sendSignal);
router.get('/:id/signal', getSignals);
router.delete('/:id/signal', clearSignals);

export default router;
