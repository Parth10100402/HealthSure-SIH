// HealthSure — Diagnostics Routes
// backend/src/routes/diagnosticRoutes.ts

import { Router } from 'express';
import {
  getDiagnosticServices,
  getDiagnosticReports,
} from '../controllers/diagnosticController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getDiagnosticServices);
router.get('/reports', authenticate, getDiagnosticReports);

export default router;
