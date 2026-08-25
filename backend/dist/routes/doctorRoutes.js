// HealthSure — Doctor Routes
// backend/src/routes/doctorRoutes.ts
import { Router } from 'express';
import { getMyDoctorProfile, getDoctorAppointments, getDoctorReferrals, getDoctorFollowUps, completeConsultation, } from '../controllers/doctorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/me', authenticate, getMyDoctorProfile);
router.get('/me/appointments', authenticate, getDoctorAppointments);
router.get('/me/referrals', authenticate, getDoctorReferrals);
router.get('/me/followups', authenticate, getDoctorFollowUps);
router.post('/consultations/complete', authenticate, completeConsultation);
export default router;
