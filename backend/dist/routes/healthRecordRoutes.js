// HealthSure — Health Record Routes
// backend/src/routes/healthRecordRoutes.ts
import { Router } from 'express';
import { getHealthRecords, getHealthRecordById, createHealthRecord, } from '../controllers/healthRecordController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticate, getHealthRecords);
router.post('/', authenticate, createHealthRecord);
router.get('/:id', authenticate, getHealthRecordById);
export default router;
