// HealthSure — Government & Public Health Admin Routes
// backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import { getAdminOverview, getAdminFacilities, getAdminReferrals, getAdminOutreach, getAdminTeleconsultations, getAdminFollowUps, getAdminReports, } from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
const router = Router();
// Protect all admin endpoints with RBAC (only ADMIN / GOVERNMENT_ADMIN allowed)
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));
router.get('/overview', getAdminOverview);
router.get('/facilities', getAdminFacilities);
router.get('/referrals', getAdminReferrals);
router.get('/outreach', getAdminOutreach);
router.get('/teleconsultations', getAdminTeleconsultations);
router.get('/followups', getAdminFollowUps);
router.get('/reports', getAdminReports);
export default router;
