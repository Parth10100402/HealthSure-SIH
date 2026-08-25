// HealthSure — Specialist Outreach Routes
// backend/src/routes/outreachRoutes.ts
import { Router } from 'express';
import { getOutreachSchedules, getOutreachById, bookOutreachSlot, } from '../controllers/outreachController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticate, getOutreachSchedules);
router.get('/:id', authenticate, getOutreachById);
router.post('/:id/book', authenticate, bookOutreachSlot);
export default router;
