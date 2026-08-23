import express from 'express';
import { db } from '../config/firebaseAdmin.js';

const router = express.Router();

// GET /api/doctors
router.get('/doctors', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('doctors').get();
      if (!snapshot.empty) {
        const doctors = snapshot.docs.map(doc => doc.data());
        return res.json({ success: true, data: doctors });
      }
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    console.error('[doctorRoutes] Error fetching doctors:', error);
    return res.status(500).json({ success: false, message: 'Error fetching doctors' });
  }
});

// GET /api/hospitals
router.get('/hospitals', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('hospitals').get();
      if (!snapshot.empty) {
        const hospitals = snapshot.docs.map(doc => doc.data());
        return res.json({ success: true, data: hospitals });
      }
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    console.error('[doctorRoutes] Error fetching hospitals:', error);
    return res.status(500).json({ success: false, message: 'Error fetching hospitals' });
  }
});

// POST /api/appointments
router.post('/appointments', async (req, res) => {
  try {
    const appointment = req.body;
    if (!appointment.id) appointment.id = 'APT-' + Date.now();
    appointment.createdAt = new Date().toISOString();

    if (db) {
      await db.collection('appointments').doc(appointment.id).set(appointment);
      if (appointment.patientId) {
        await db.collection('familyMembers').doc(appointment.patientId).collection('appointments').doc(appointment.id).set(appointment);
      }
      console.log(`[doctorRoutes] Appointment ${appointment.id} saved to Firestore`);
    }

    return res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('[doctorRoutes] Error saving appointment:', error);
    return res.status(500).json({ success: false, message: 'Error saving appointment' });
  }
});

// GET /api/appointments
router.get('/appointments', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('appointments').orderBy('createdAt', 'desc').get();
      const appointments = snapshot.docs.map(doc => doc.data());
      return res.json({ success: true, data: appointments });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    console.error('[doctorRoutes] Error fetching appointments:', error);
    return res.json({ success: true, data: [] });
  }
});

export default router;
