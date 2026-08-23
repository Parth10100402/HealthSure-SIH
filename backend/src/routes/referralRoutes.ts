// HealthSure — Referral Routes
// backend/src/routes/referralRoutes.ts

import { Router } from 'express';
import {
  getReferrals,
  getReferralById,
  createReferral,
  patchReferral,
} from '../controllers/referralController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getReferrals);
router.post('/', authenticate, createReferral);
router.get('/:id', authenticate, getReferralById);
router.patch('/:id', authenticate, patchReferral);

export default router;
