import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load Environment Variables from root .env and server .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootEnv = path.resolve(__dirname, '../.env');
const serverEnv = path.resolve(__dirname, './.env');

if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
if (fs.existsSync(serverEnv)) dotenv.config({ path: serverEnv });

import reportRoutes from './routes/reportRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON Parser
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[API ${req.method}] ${req.url}`);
  next();
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api', doctorRoutes); // mounts /api/doctors, /api/hospitals, /api/appointments
app.use('/api', familyRoutes); // mounts /api/family-members
app.use('/api/dashboard', dashboardRoutes); // mounts /api/dashboard/overview

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'HealthSure Express REST API',
    geminiKeyActive: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)
  });
});

// Export app for Vercel Serverless Function
export default app;

// Start Express Server locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 HealthSure Express API Server running on Port ${PORT}`);
    console.log(`👉 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}
