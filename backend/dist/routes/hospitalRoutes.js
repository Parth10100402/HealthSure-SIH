// HealthSure — Hospital Staff Routes
// backend/src/routes/hospitalRoutes.ts
import { Router } from 'express';
import { getMyHospitalProfile, getHospitalReferrals, patchHospitalReferral, } from '../controllers/hospitalController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/me', authenticate, getMyHospitalProfile);
router.get('/me/referrals', authenticate, getHospitalReferrals);
router.patch('/referrals/:id', authenticate, patchHospitalReferral);
export default router;
