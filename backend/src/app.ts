// HealthSure — Express Application Setup
// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { dataStore } from './db/store.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import outreachRoutes from './routes/outreachRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import healthRecordRoutes from './routes/healthRecordRoutes.js';
import followUpRoutes from './routes/followUpRoutes.js';
import teleconsultRoutes from './routes/teleconsultRoutes.js';
import diagnosticRoutes from './routes/diagnosticRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const createApp = () => {
  const app = express();

  // CORS Configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logger
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API ${req.method}] ${req.url}`);
    }
    next();
  });

  // Ensure In-Memory Database is seeded during serverless cold-starts
  app.use(async (_req, _res, next) => {
    try {
      await dataStore.initialize();
    } catch (e) {
      console.error('[DataStore] Cold-start initialization error:', e);
    }
    next();
  });

  // Health Check Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'HealthSure REST API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Voice Call Provider Interface Stub
  app.post('/api/voice/call', (req, res) => {
    const { destinationPhone, recipientName, purpose } = req.body;
    res.json({
      success: true,
      callId: 'call-' + Date.now(),
      status: 'INITIATED',
      message: `Voice call dispatched to ${recipientName || 'Beneficiary'} (${destinationPhone || '01141185137'}). Purpose: ${purpose || 'Continuity reminder'}.`,
    });
  });

  // Mount Modular Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/outreach', outreachRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/hospitals', hospitalRoutes);
  app.use('/api/referrals', referralRoutes);
  app.use('/api/health-records', healthRecordRoutes);
  app.use('/api/followups', followUpRoutes);
  app.use('/api/teleconsultations', teleconsultRoutes);
  app.use('/api/diagnostics', diagnosticRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 Route Handler
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found.',
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
