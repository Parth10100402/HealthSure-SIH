// HealthSure — Patient Routes
// backend/src/routes/patientRoutes.ts
import { Router } from 'express';
import { getMyPatientProfile, updateMyPatientProfile } from '../controllers/patientController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/me', authenticate, getMyPatientProfile);
router.put('/me', authenticate, updateMyPatientProfile);
export default router;
