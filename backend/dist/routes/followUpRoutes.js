// HealthSure — Follow-Up Routes
// backend/src/routes/followUpRoutes.ts
import { Router } from 'express';
import { getFollowUps, createFollowUp, patchFollowUp, } from '../controllers/followUpController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticate, getFollowUps);
router.post('/', authenticate, createFollowUp);
router.patch('/:id', authenticate, patchFollowUp);
export default router;
