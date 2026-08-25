// HealthSure — Appointment Routes
// backend/src/routes/appointmentRoutes.ts
import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, patchAppointment, deleteAppointment, } from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticate, getAppointments);
router.post('/', authenticate, createAppointment);
router.get('/:id', authenticate, getAppointmentById);
router.patch('/:id', authenticate, patchAppointment);
router.delete('/:id', authenticate, deleteAppointment);
export default router;
