import { Router } from 'express';
import { login, register, getMe, logout, sendOtp, verifyOtp, registerWithOtp } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/register-with-otp', registerWithOtp);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

// Real SMS OTP Endpoints
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Backwards-compatible aliases
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;

