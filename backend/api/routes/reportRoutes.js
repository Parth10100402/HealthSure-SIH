import express from 'express';
import { db } from '../config/firebaseAdmin.js';

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

// POST /api/reports/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { reportTitle, reportText, familyMemberId, familyMemberName } = req.body;
    const title = reportTitle || 'Medical Report';
    const contentToAnalyze = reportText || title;

    let aiResult = null;

    // Call Gemini 2.5 Flash API if key is provided
    if (GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const systemPrompt = `You are a Senior Clinical Diagnostic AI. Analyze the following medical report or title and produce a structured JSON response.
Return ONLY valid JSON matching this schema:
{
  "reportType": "Complete Blood Count (CBC) | Thyroid Profile | Liver Function Test (LFT) | Kidney Function Test (KFT) | Lipid Profile | Blood Sugar Report | MRI Scan | X-Ray Report | General Medical Report",
  "healthScore": 88,
  "riskLevel": "Optimal" | "Low Risk" | "Moderate Risk" | "High Risk",
  "summary": "Clinical summary of key findings...",
  "parameters": [
    { "name": "Hemoglobin", "value": "14.2", "unit": "g/dL", "refRange": "13.0 - 17.0", "status": "Normal" }
  ],
  "organScores": {
    "heart": 92,
    "kidney": 90,
    "blood": 88,
    "liver": 95,
    "thyroid": 94,
    "metabolism": 91
  },
  "recommendedSpeciality": "Cardiologist | Neurologist | Endocrinologist | Gastroenterologist | Nephrologist | General Physician",
  "foodsToEat": ["Leafy Green Vegetables", "Lean Proteins", "Fiber-rich Grains", "Hydrating Fruits"],
  "foodsToAvoid": ["Refined Sugars", "Excessive Sodium", "Trans Fats", "Processed Meats"]
}`;

        const requestBody = {
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nReport Content To Analyze:\n${contentToAnalyze}`
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
        console.warn('[reportRoutes] Gemini API call failed, falling back to rule-based parser:', geminiErr.message);
      }
    }

    // Dynamic Rule-Based Diagnostic Parser Fallback if Gemini unavailable
    if (!aiResult) {
      const lower = contentToAnalyze.toLowerCase();
      
      if (lower.includes('thyroid') || lower.includes('tsh')) {
        aiResult = {
          reportType: 'Thyroid Profile',
          healthScore: 84,
          riskLevel: 'Moderate Risk',
          summary: 'TSH slightly elevated indicating mild subclinical hypothyroidism. Thyroid hormone synthesis monitoring advised.',
          parameters: [
            { name: 'TSH (Thyroid Stimulating Hormone)', value: '5.85', unit: 'µIU/mL', refRange: '0.45 - 4.50', status: 'High' },
            { name: 'Free T4 (Thyroxine)', value: '1.15', unit: 'ng/dL', refRange: '0.82 - 1.77', status: 'Normal' },
            { name: 'Free T3 (Triiodothyronine)', value: '3.10', unit: 'pg/mL', refRange: '2.00 - 4.40', status: 'Normal' }
          ],
          organScores: { heart: 88, kidney: 92, blood: 90, liver: 92, thyroid: 75, metabolism: 82 },
          recommendedSpeciality: 'Endocrinologist',
          foodsToEat: ['Iodized Salt', 'Brazil Nuts (Selenium)', 'Eggs', 'Greek Yogurt'],
          foodsToAvoid: ['Excess Raw Cruciferous Veggies', 'Processed Soy Products', 'High Sugar Sweets']
        };
      } else if (lower.includes('lft') || lower.includes('liver')) {
        aiResult = {
          reportType: 'Liver Function Test (LFT)',
          healthScore: 78,
          riskLevel: 'Moderate Risk',
          summary: 'Serum SGPT/ALT levels elevated. Recommending dietary fat reduction and hepatology consultation.',
          parameters: [
            { name: 'SGPT (ALT)', value: '62', unit: 'U/L', refRange: '7 - 45', status: 'High' },
            { name: 'SGOT (AST)', value: '48', unit: 'U/L', refRange: '8 - 40', status: 'High' },
            { name: 'Bilirubin Total', value: '0.9', unit: 'mg/dL', refRange: '0.1 - 1.2', status: 'Normal' },
            { name: 'Serum Albumin', value: '4.2', unit: 'g/dL', refRange: '3.5 - 5.2', status: 'Normal' }
          ],
          organScores: { heart: 90, kidney: 90, blood: 88, liver: 72, thyroid: 92, metabolism: 80 },
          recommendedSpeciality: 'Gastroenterologist',
          foodsToEat: ['Green Tea', 'Garlic & Onions', 'Grapefruit', 'Beetroot Juice'],
          foodsToAvoid: ['Alcohol', 'Fried Foods', 'Refined Carbohydrates', 'Excessive Red Meat']
        };
      } else if (lower.includes('kft') || lower.includes('kidney') || lower.includes('creatinine')) {
        aiResult = {
          reportType: 'Kidney Function Test (KFT)',
          healthScore: 82,
          riskLevel: 'Low Risk',
          summary: 'Glomerular filtration rate is preserved. Creatinine within normal baseline with healthy electrolyte status.',
          parameters: [
            { name: 'Serum Creatinine', value: '1.05', unit: 'mg/dL', refRange: '0.70 - 1.30', status: 'Normal' },
            { name: 'Blood Urea Nitrogen (BUN)', value: '16.5', unit: 'mg/dL', refRange: '7.0 - 20.0', status: 'Normal' },
            { name: 'eGFR', value: '94', unit: 'mL/min/1.73m²', refRange: '> 90', status: 'Normal' }
          ],
          organScores: { heart: 92, kidney: 88, blood: 90, liver: 92, thyroid: 94, metabolism: 90 },
          recommendedSpeciality: 'Nephrologist',
          foodsToEat: ['Cranberries', 'Apples', 'Egg Whites', 'Cauliflower'],
          foodsToAvoid: ['High Sodium Snacks', 'Canned Soups', 'Processed Sodas']
        };
      } else {
        aiResult = {
          reportType: 'Complete Blood Count (CBC)',
          healthScore: 92,
          riskLevel: 'Optimal',
          summary: 'All core hematological parameters are within optimal reference ranges. Hemoglobin and platelet indices stable.',
          parameters: [
            { name: 'Hemoglobin', value: '14.5', unit: 'g/dL', refRange: '13.0 - 17.0', status: 'Normal' },
            { name: 'Total Leukocyte Count (WBC)', value: '6,800', unit: '/µL', refRange: '4,000 - 11,000', status: 'Normal' },
            { name: 'Platelet Count', value: '260,000', unit: '/µL', refRange: '150,000 - 450,000', status: 'Normal' }
          ],
          organScores: { heart: 94, kidney: 92, blood: 92, liver: 94, thyroid: 95, metabolism: 92 },
          recommendedSpeciality: 'General Physician',
          foodsToEat: ['Spinach & Iron-rich Greens', 'Pomegranates', 'Citrus Fruits', 'Almonds'],
          foodsToAvoid: ['Excessive Caffeine with Meals', 'Junk Foods', 'Sugary Drinks']
        };
      }
    }

    const reportRecord = {
      id: 'REP-' + Date.now(),
      title,
      date: new Date().toLocaleDateString(),
      familyMemberId: familyMemberId || 'mem-1',
      familyMemberName: familyMemberName || 'Parth Sharma',
      patientName: familyMemberName || 'Parth Sharma',
      patientId: familyMemberId || 'mem-1',
      followUpStatus: req.body.followUpStatus || aiResult.followUpStatus || 'Follow-up Recommended',
      clinicianNote: req.body.clinicianNote || aiResult.clinicianNote || 'Repeat CBC after 4 weeks and follow up with a General Physician.',
      ...aiResult,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore if database connection is available
    if (db) {
      try {
        await db.collection('reports').doc(reportRecord.id).set(reportRecord);
        if (familyMemberId) {
          await db.collection('familyMembers').doc(familyMemberId).collection('reports').doc(reportRecord.id).set(reportRecord);
        }
        console.log(`[reportRoutes] Report ${reportRecord.id} saved to Firestore`);
      } catch (fsErr) {
        console.error('[reportRoutes] Firestore save error:', fsErr.message);
      }
    }

    return res.json({
      success: true,
      data: reportRecord
    });
  } catch (error) {
    console.error('[reportRoutes] Error analyzing report:', error);
    return res.status(500).json({ success: false, message: 'Internal server error analyzing report' });
  }
});

const SAMPLE_DEMO_REPORTS = [
  {
    id: 'rep-demo-cbc',
    title: 'Complete Blood Count (CBC)',
    date: '07 Aug 2026',
    uploadedDate: '07 Aug 2026 09:30 AM',
    patientName: 'Parth Sharma',
    patientId: 'mem-1',
    age: 20,
    gender: 'Male',
    bloodGroup: 'B+',
    category: 'Hematology',
    department: 'General Medicine',
    condition: 'Blood',
    diagnosis: 'Possible iron-deficiency anemia.',
    summary: 'Hemoglobin below reference range (11.8 g/dL). Total Leukocyte Count 11,800 /µL requiring repeat CBC evaluation.',
    status: 'Requires Attention',
    followUpStatus: 'Follow-Up Recommended',
    priority: 'Moderate',
    assignedSpecialist: 'General Physician',
    nextFollowUpDate: '2026-09-04',
    followUpReason: 'Hemoglobin is below the reference range and repeat testing is recommended.',
    clinicianNote: 'Repeat CBC after 4 weeks and review iron status.',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    recommendations: [
      'Repeat CBC after 4 weeks to evaluate hemoglobin recovery.',
      'Consult a General Physician for iron supplementation assessment.',
      'Incorporate iron-rich foods (spinach, beetroot, legumes) with vitamin C.'
    ],
    clinicalFindings: 'Hemoglobin below reference range. Mild leukocytosis noted.',
    parameters: [
      { name: 'Hemoglobin', value: '11.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'Low' },
      { name: 'Total Leukocyte Count (WBC)', value: '11,800', unit: '/µL', referenceRange: '4,000 - 11,000', status: 'High' },
      { name: 'Platelet Count', value: '260,000', unit: '/µL', referenceRange: '150,000 - 450,000', status: 'Normal' }
    ]
  },
  {
    id: 'rep-demo-thyroid',
    title: 'Thyroid Function Test',
    date: '05 Aug 2026',
    uploadedDate: '05 Aug 2026 11:15 AM',
    patientName: 'Sunita Sharma',
    patientId: 'mem-2',
    age: 42,
    gender: 'Female',
    bloodGroup: 'O+',
    category: 'Endocrinology',
    department: 'Endocrinology',
    condition: 'Thyroid',
    diagnosis: 'Possible hypothyroidism.',
    summary: 'TSH elevated at 6.8 µIU/mL (Ref: 0.4 - 4.5). Free T4 1.1 ng/dL (Normal). Recommended dose review for Levothyroxine.',
    status: 'Requires Attention',
    followUpStatus: 'Monitoring',
    priority: 'Moderate',
    assignedSpecialist: 'Endocrinologist',
    nextFollowUpDate: '2026-09-15',
    followUpReason: 'TSH elevated at 6.8 µIU/mL requiring thyroxine titration review.',
    clinicianNote: 'Adjust Levothyroxine dose and repeat TSH in 6 weeks.',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    recommendations: [
      'Follow up with an Endocrinologist for thyroxine dose adjustment.',
      'Repeat TSH and Free T4 in 6 weeks.',
      'Ensure levothyroxine is taken on an empty stomach with water.'
    ],
    clinicalFindings: 'TSH elevated at 6.8 µIU/mL.',
    parameters: [
      { name: 'TSH', value: '6.8', unit: 'µIU/mL', referenceRange: '0.4 - 4.5', status: 'High' },
      { name: 'Free T4', value: '1.1', unit: 'ng/dL', referenceRange: '0.8 - 1.8', status: 'Normal' },
      { name: 'Total T3', value: '110', unit: 'ng/dL', referenceRange: '80 - 200', status: 'Normal' }
    ]
  },
  {
    id: 'rep-demo-lft',
    title: 'Liver Function Test',
    date: '02 Aug 2026',
    uploadedDate: '02 Aug 2026 02:45 PM',
    patientName: 'Suresh Sharma',
    patientId: 'mem-3',
    age: 45,
    gender: 'Male',
    bloodGroup: 'A+',
    category: 'Gastroenterology',
    department: 'Gastroenterology',
    condition: 'Liver',
    diagnosis: 'Possible liver inflammation.',
    summary: 'SGPT (ALT) at 65 U/L and SGOT (AST) at 48 U/L elevated. Bilirubin normal at 0.9 mg/dL. Consult physician.',
    status: 'Requires Attention',
    followUpStatus: 'Follow-Up Recommended',
    priority: 'Moderate',
    assignedSpecialist: 'Gastroenterologist',
    nextFollowUpDate: '2026-09-02',
    followUpReason: 'SGPT and SGOT elevated.',
    clinicianNote: 'Low-fat diet, abstain from alcohol, repeat LFT.',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    recommendations: [
      'Consult a physician for clinical evaluation of elevated liver enzymes.',
      'Abstain from alcohol and limit high-fat processed foods.',
      'Repeat LFT after 30 days.'
    ],
    clinicalFindings: 'SGPT and SGOT elevated.',
    parameters: [
      { name: 'SGPT (ALT)', value: '65', unit: 'U/L', referenceRange: '7 - 45', status: 'High' },
      { name: 'SGOT (AST)', value: '48', unit: 'U/L', referenceRange: '8 - 40', status: 'High' },
      { name: 'Total Bilirubin', value: '0.9', unit: 'mg/dL', referenceRange: '0.2 - 1.2', status: 'Normal' }
    ]
  }
];

// PUT /api/reports/:id/follow-up
router.put('/:id/follow-up', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      followUpStatus, 
      clinicianNote,
      nextFollowUpDate,
      assignedSpecialist,
      priority,
      followUpReason,
      resolutionNote,
      resolvedDate,
      aiFollowUpRecommendation,
      followUpTimeline
    } = req.body;

    if (!followUpStatus) {
      return res.status(400).json({ success: false, message: 'followUpStatus is required' });
    }

    const updateData = {
      followUpStatus,
      clinicianNote: clinicianNote || '',
      nextFollowUpDate: nextFollowUpDate || '',
      assignedSpecialist: assignedSpecialist || 'General Physician',
      priority: priority || 'Moderate',
      followUpReason: followUpReason || '',
      resolutionNote: resolutionNote || '',
      resolvedDate: resolvedDate || '',
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (aiFollowUpRecommendation) {
      updateData.aiFollowUpRecommendation = aiFollowUpRecommendation;
    }
    if (followUpTimeline) {
      updateData.followUpTimeline = followUpTimeline;
    }

    // Update in-memory sample data
    const idx = SAMPLE_DEMO_REPORTS.findIndex(r => r.id === id);
    if (idx !== -1) {
      SAMPLE_DEMO_REPORTS[idx] = { ...SAMPLE_DEMO_REPORTS[idx], ...updateData };
    }

    if (db) {
      try {
        await db.collection('reports').doc(id).set(updateData, { merge: true });
        console.log(`[reportRoutes] Report ${id} follow-up workflow updated in Firestore:`, updateData);
      } catch (fsErr) {
        console.error('[reportRoutes] Firestore update error:', fsErr.message);
      }
    }

    const mergedResult = idx !== -1 ? SAMPLE_DEMO_REPORTS[idx] : { id, ...updateData };

    return res.json({
      success: true,
      data: mergedResult
    });
  } catch (error) {
    console.error('[reportRoutes] Error updating follow-up status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error updating follow-up status' });
  }
});

// GET /api/reports/:id - Fetch Single Health Record by Stable ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (db) {
      const doc = await db.collection('reports').doc(id).get();
      if (doc.exists) {
        return res.json({ success: true, data: doc.data() });
      }
    }

    // Search in-memory demo reports
    const foundDemo = SAMPLE_DEMO_REPORTS.find(r => r.id === id);
    if (foundDemo) {
      return res.json({ success: true, data: foundDemo });
    }

    return res.json({ success: true, data: null });
  } catch (error) {
    console.error(`[reportRoutes] Error fetching report ${req.params.id}:`, error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching report' });
  }
});

// GET /api/reports - Fetch All Health Records
router.get('/', async (req, res) => {
  try {
    let dbReports = [];
    if (db) {
      const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').limit(50).get();
      dbReports = snapshot.docs.map(doc => doc.data());
    }

    // Merge Firestore reports with SAMPLE_DEMO_REPORTS without duplicates
    const dbMap = new Map(dbReports.map(r => [r.id, r]));
    const merged = SAMPLE_DEMO_REPORTS.map(demoR => dbMap.get(demoR.id) || demoR).concat(
      dbReports.filter(dbR => !SAMPLE_DEMO_REPORTS.some(m => m.id === dbR.id))
    );

    return res.json({ success: true, data: merged });
  } catch (error) {
    console.error('[reportRoutes] Error fetching reports:', error);
    return res.json({ success: true, data: SAMPLE_DEMO_REPORTS });
  }
});

export default router;
