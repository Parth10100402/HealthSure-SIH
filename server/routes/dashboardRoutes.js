import express from 'express';
import { db } from '../config/firebaseAdmin.js';

const router = express.Router();

// GET /api/dashboard/overview
router.get('/overview', async (req, res) => {
  try {
    const { patientName = 'Parth Sharma' } = req.query;

    let hospitalsCount = 50;
    let doctorsCount = 200;
    let patientsCount = 10000;
    let activities = [];

    if (db) {
      try {
        const [hospSnap, docSnap, apptSnap, repSnap] = await Promise.all([
          db.collection('hospitals').get(),
          db.collection('doctors').get(),
          db.collection('appointments').orderBy('createdAt', 'desc').limit(5).get(),
          db.collection('reports').orderBy('createdAt', 'desc').limit(5).get()
        ]);

        if (!hospSnap.empty) hospitalsCount = hospSnap.size;
        if (!docSnap.empty) doctorsCount = docSnap.size;

        const apptActivities = apptSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.id || doc.id,
            type: 'appointment',
            title: `Appointment Confirmed: ${data.doctorName || data.doctor || 'Specialist'}`,
            details: `${data.hospitalName || 'Hospital'} • Token #${data.tokenNumber || '12'}`,
            timestamp: data.date || 'Today',
            status: 'Confirmed'
          };
        });

        const repActivities = repSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.id || doc.id,
            type: 'report',
            title: `Decoded ${data.reportType || data.title || 'Lab Report'}`,
            details: `Score: ${data.healthScore || 90}/100 • Risk: ${data.riskLevel || 'Optimal'}`,
            timestamp: data.date || 'Today',
            status: 'Analyzed'
          };
        });

        activities = [...repActivities, ...apptActivities].slice(0, 5);
      } catch (err) {
        console.warn('[dashboardRoutes] Firestore query warning:', err.message);
      }
    }

    // Default Fallback Activities if empty
    if (activities.length === 0) {
      activities = [
        { id: 'act-1', type: 'report', title: 'Complete Blood Count (CBC) Decoded', details: 'Hemoglobin 14.5 g/dL • Score 92/100', timestamp: 'Today, 08:30 AM', status: 'Analyzed' },
        { id: 'act-2', type: 'appointment', title: 'Confirmed: Dr. Rajesh Kumar (Cardiologist)', details: 'Max Super Speciality Hospital • Token #12', timestamp: 'Today, 10:15 AM', status: 'Confirmed' },
        { id: 'act-3', type: 'medicine', title: 'Rx Dosage Recorded: Telmisartan 40mg', details: 'Fasting Blood Pressure 120/80 mmHg', timestamp: 'Yesterday', status: 'Logged' }
      ];
    }

    const hour = new Date().getHours();
    let greetingTime = 'Good Morning';
    if (hour >= 12 && hour < 17) greetingTime = 'Good Afternoon';
    if (hour >= 17) greetingTime = 'Good Evening';

    return res.json({
      success: true,
      data: {
        greetingTime,
        patientName,
        healthScore: 92,
        stats: {
          hospitalsCount,
          doctorsCount,
          patientsCount,
          satisfactionRate: 98
        },
        latestReport: {
          title: 'Complete Blood Count (CBC)',
          date: new Date().toLocaleDateString(),
          score: 92
        },
        upcomingConsultation: {
          doctor: 'Dr. Rajesh Kumar (Cardiologist)',
          time: 'Today, 04:30 PM',
          token: '12'
        },
        pendingRxRemindersCount: 1,
        activities
      }
    });
  } catch (error) {
    console.error('[dashboardRoutes] Error getting dashboard overview:', error);
    return res.status(500).json({ success: false, message: 'Error getting dashboard overview' });
  }
});

export default router;
