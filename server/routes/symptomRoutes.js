import express from 'express';
import { db } from '../config/firebaseAdmin.js';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

// POST /api/symptoms/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { symptomText, familyMemberId, familyMemberName } = req.body;
    if (!symptomText || typeof symptomText !== 'string') {
      return res.status(400).json({ success: false, message: 'symptomText is required' });
    }

    let aiResult = null;

    if (GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const systemPrompt = `You are a Senior Emergency Clinical Triage AI. Analyze the patient's described symptoms and return a structured JSON evaluation.
Return ONLY valid JSON matching this schema:
{
  "symptomText": "${symptomText.replace(/"/g, '\\"')}",
  "urgency": "Low" | "Moderate" | "Emergency",
  "possibleConditions": [
    { "name": "Condition Name", "matchPct": 85, "desc": "Brief clinical description..." }
  ],
  "recommendedSpecialist": "Cardiologist | Neurologist | Pulmonologist | Gastroenterologist | Orthopaedic Surgeon | General Physician",
  "suggestedActions": [
    "Action item 1",
    "Action item 2"
  ],
  "disclaimer": "This AI clinical triage is for informational decision support and does not replace emergency medical evaluation."
}`;

        const requestBody = {
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nPatient Described Symptoms:\n${symptomText}`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(25000)
        });

        if (response.ok) {
          const geminiData = await response.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            aiResult = JSON.parse(rawText);
          }
        }
      } catch (geminiErr) {
        console.warn('[symptomRoutes] Gemini API error, falling back to rule-based parser:', geminiErr.message);
      }
    }

    // Rule-Based Triage Fallback
    if (!aiResult) {
      const lower = symptomText.toLowerCase();
      if (lower.includes('chest') || lower.includes('heart') || lower.includes('breath') || lower.includes('arm pain')) {
        aiResult = {
          symptomText,
          urgency: 'Emergency',
          possibleConditions: [
            { name: 'Angina Pectoris / Acute Coronary Syndrome', matchPct: 88, desc: 'Ischemic chest discomfort requiring immediate ECG evaluation.' },
            { name: 'Costochondritis', matchPct: 45, desc: 'Inflammation of chest wall cartilage.' }
          ],
          recommendedSpecialist: 'Cardiologist',
          suggestedActions: [
            'Trigger Emergency SOS if experiencing shortness of breath or radiating pain',
            'Go to nearest ER with 24/7 cardiac cath lab facility',
            'Avoid physical exertion and stay seated'
          ],
          disclaimer: 'This AI clinical triage is for informational support and does not replace emergency medical evaluation.'
        };
      } else if (lower.includes('headache') || lower.includes('dizzy') || lower.includes('numb') || lower.includes('seizure')) {
        aiResult = {
          symptomText,
          urgency: 'Moderate',
          possibleConditions: [
            { name: 'Migraine with Aura', matchPct: 75, desc: 'Neurovascular headache episode.' },
            { name: 'Tension Headache', matchPct: 60, desc: 'Musculoskeletal neck and scalp tension.' }
          ],
          recommendedSpecialist: 'Neurologist',
          suggestedActions: [
            'Schedule neurological consultation',
            'Maintain hydration and record episode frequency',
            'Rest in a quiet, darkened room'
          ],
          disclaimer: 'This AI clinical triage is for informational support and does not replace emergency medical evaluation.'
        };
      } else {
        aiResult = {
          symptomText,
          urgency: 'Low',
          possibleConditions: [
            { name: 'Mild Viral / General Fatigue', matchPct: 70, desc: 'Systemic inflammatory response to routine viral strain.' }
          ],
          recommendedSpecialist: 'General Physician',
          suggestedActions: [
            'Book consultation with General Physician',
            'Monitor temperature and maintain hydration',
            'Ensure adequate rest'
          ],
          disclaimer: 'This AI clinical triage is for informational support and does not replace emergency medical evaluation.'
        };
      }
    }

    const triageRecord = {
      id: 'TRG-' + Date.now(),
      familyMemberId: familyMemberId || 'mem-1',
      familyMemberName: familyMemberName || 'Parth Sharma',
      timestamp: new Date().toISOString(),
      ...aiResult
    };

    // Save triage to Firestore
    if (db) {
      try {
        await db.collection('symptomAnalyses').doc(triageRecord.id).set(triageRecord);
        if (familyMemberId) {
          await db.collection('familyMembers').doc(familyMemberId).collection('symptoms').doc(triageRecord.id).set(triageRecord);
        }
        console.log(`[symptomRoutes] Symptom triage ${triageRecord.id} saved to Firestore`);
      } catch (fsErr) {
        console.error('[symptomRoutes] Firestore save error:', fsErr.message);
      }
    }

    return res.json({ success: true, data: triageRecord });
  } catch (error) {
    console.error('[symptomRoutes] Error analyzing symptoms:', error);
    return res.status(500).json({ success: false, message: 'Internal server error analyzing symptoms' });
  }
});

// POST /api/symptoms/save
router.post('/save', async (req, res) => {
  try {
    const triageRecord = req.body;
    if (!triageRecord.id) triageRecord.id = 'TRG-' + Date.now();
    triageRecord.timestamp = new Date().toISOString();

    if (db) {
      await db.collection('symptomAnalyses').doc(triageRecord.id).set(triageRecord);
      if (triageRecord.familyMemberId) {
        await db.collection('familyMembers').doc(triageRecord.familyMemberId).collection('symptoms').doc(triageRecord.id).set(triageRecord);
      }
    }
    return res.json({ success: true, data: triageRecord });
  } catch (error) {
    console.error('[symptomRoutes] Error saving symptom triage:', error);
    return res.status(500).json({ success: false, message: 'Error saving symptom triage' });
  }
});

// GET /api/symptoms/list
router.get('/list', async (req, res) => {
  try {
    const { memberId } = req.query;
    if (db) {
      let query = db.collection('symptomAnalyses');
      if (memberId) {
        query = query.where('familyMemberId', '==', memberId);
      }
      const snapshot = await query.orderBy('timestamp', 'desc').limit(20).get();
      const list = snapshot.docs.map(doc => doc.data());
      return res.json({ success: true, data: list });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    console.error('[symptomRoutes] Error listing symptoms:', error);
    return res.json({ success: true, data: [] });
  }
});

export default router;
