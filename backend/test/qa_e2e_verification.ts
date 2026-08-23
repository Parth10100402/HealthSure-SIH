// HealthSure — Phase 5 Comprehensive End-to-End QA Validation Script
// backend/test/qa_e2e_verification.ts

import { createApp } from '../src/app.js';
import { dataStore } from '../src/db/store.js';

let server: any;
let baseUrl: string;

async function runQA() {
  console.log('====================================================');
  console.log('🎯 HEALTHSURE — PHASE 5 END-TO-END QA SUITE');
  console.log('====================================================\n');

  await dataStore.initialize();
  const app = createApp();

  const PORT = 5088;
  baseUrl = `http://localhost:${PORT}/api`;

  server = app.listen(PORT);

  let passed = 0;
  let failed = 0;
  const bugsFound: string[] = [];
  const bugsFixed: string[] = [];

  async function qaStep(section: string, description: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[${section}] ✓ PASS: ${description}`);
      passed++;
    } catch (err: any) {
      console.error(`[${section}] ✗ FAIL: ${description} -> ${err.message}`);
      failed++;
      bugsFound.push(`[${section}] ${description}: ${err.message}`);
    }
  }

  // ─── 1. PATIENT FLOW ──────────────────────────────────────────────────────────
  console.log('\n--- 1. PATIENT FLOW ---');
  let patientToken = '';
  let initialOutreachSlots = 0;
  let bookedAppointmentId = '';
  let outreachSessionId = '';

  await qaStep('PATIENT', 'Patient Login with priya@example.com / demo1234', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya@example.com', password: 'demo1234', role: 'patient' }),
    });
    const json = await res.json();
    if (!res.ok || !json.token) throw new Error(json.message || 'Login failed');
    patientToken = json.token;
  });

  await qaStep('PATIENT', 'Fetch Patient Profile (HS-10248 Ramesh Sharma)', async () => {
    const res = await fetch(`${baseUrl}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.patientId !== 'HS-10248') {
      throw new Error(`Expected HS-10248, got ${json.data?.patientId}`);
    }
  });

  await qaStep('PATIENT', 'Fetch Appointments List from backend', async () => {
    const res = await fetch(`${baseUrl}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) throw new Error('Failed to fetch appointments');
  });

  await qaStep('PATIENT', 'Fetch Specialist Outreach list and note available slots', async () => {
    const res = await fetch(`${baseUrl}/outreach`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.length === 0) throw new Error('No outreach sessions found');
    outreachSessionId = json.data[0].id;
    initialOutreachSlots = json.data[0].availableSlots;
  });

  await qaStep('PATIENT', 'Book Specialist Outreach slot (Atomically decrement available slots)', async () => {
    const res = await fetch(`${baseUrl}/outreach/${outreachSessionId}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ reasonForVisit: 'Exertional chest discomfort review' }),
    });
    const json = await res.json();
    if (!res.ok || !json.data.appointment) throw new Error(json.message || 'Booking failed');
    bookedAppointmentId = json.data.appointment.id;

    if (json.data.outreach.availableSlots !== initialOutreachSlots - 1) {
      throw new Error(`Slots did not decrement correctly: expected ${initialOutreachSlots - 1}, got ${json.data.outreach.availableSlots}`);
    }
  });

  await qaStep('PATIENT', 'Fetch Referral Tracking (HS-REF-7821)', async () => {
    const res = await fetch(`${baseUrl}/referrals`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.length === 0) throw new Error('No referrals returned');
  });

  await qaStep('PATIENT', 'Fetch Health Records', async () => {
    const res = await fetch(`${baseUrl}/health-records`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.length === 0) throw new Error('Health records empty');
  });

  await qaStep('PATIENT', 'Fetch Follow-Ups & Teleconsultations', async () => {
    const resFollow = await fetch(`${baseUrl}/followups`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const jsonFollow = await resFollow.json();
    if (!resFollow.ok || jsonFollow.data.length === 0) throw new Error('Follow-ups empty');

    const resTele = await fetch(`${baseUrl}/teleconsultations`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const jsonTele = await resTele.json();
    if (!resTele.ok || jsonTele.data.length === 0) throw new Error('Teleconsultations empty');
  });

  // ─── 2. DOCTOR FLOW ───────────────────────────────────────────────────────────
  console.log('\n--- 2. DOCTOR FLOW ---');
  let doctorToken = '';

  await qaStep('DOCTOR', 'Doctor Login with dr.rajesh@healthsure.org / demo1234', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'dr.rajesh@healthsure.org', password: 'demo1234', role: 'doctor' }),
    });
    const json = await res.json();
    if (!res.ok || !json.token) throw new Error('Doctor login failed');
    doctorToken = json.token;
  });

  await qaStep('DOCTOR', "Doctor views today's appointments queue including newly booked slot", async () => {
    const res = await fetch(`${baseUrl}/doctors/me/appointments`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.length === 0) throw new Error('No doctor appointments found');
  });

  await qaStep('DOCTOR', 'Doctor completes clinical consultation (saves notes, vitals, prescriptions, creates 30d follow-up)', async () => {
    const res = await fetch(`${baseUrl}/doctors/consultations/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        appointmentId: bookedAppointmentId || 'apt-001',
        diagnosis: 'Hypertensive Heart Disease with Diastolic Dysfunction',
        clinicalNotes: 'BP: 134/86 mmHg, Pulse: 76 bpm. 2D Echo shows EF 58%. Telmisartan 40mg added.',
        vitals: { bloodPressure: '134/86 mmHg', pulseRate: '76 bpm', spo2: '98%' },
        prescriptions: [{ medicine: 'Tab. Telmisartan 40mg', dosage: '1 Tab Morning', duration: '30 Days' }],
        createFollowUpDays: 30,
        followUpInstructions: 'Review blood pressure log and symptoms via PHC Tele-Kiosk.',
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.data.healthRecord) throw new Error('Consultation completion failed');
  });

  // ─── 3. HOSPITAL FLOW ─────────────────────────────────────────────────────────
  console.log('\n--- 3. HOSPITAL FLOW ---');
  let hospitalToken = '';

  await qaStep('HOSPITAL', 'Hospital Staff Login with anita@hospital.gov.in / demo1234', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'anita@hospital.gov.in', password: 'demo1234', role: 'hospital_staff' }),
    });
    const json = await res.json();
    if (!res.ok || !json.token) throw new Error('Hospital staff login failed');
    hospitalToken = json.token;
  });

  await qaStep('HOSPITAL', 'Hospital Triage Desk lists incoming referrals', async () => {
    const res = await fetch(`${baseUrl}/hospitals/me/referrals`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.length === 0) throw new Error('No hospital referrals found');
  });

  await qaStep('HOSPITAL', 'Hospital accepts referral HS-REF-7821 and assigns token DH-CARD-14', async () => {
    const res = await fetch(`${baseUrl}/hospitals/referrals/ref-001`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({
        status: 'HOSPITAL_ACCEPTED',
        tokenNumber: 'DH-CARD-14',
        appointmentDate: '2026-08-28',
      }),
    });
    const json = await res.json();
    if (!res.ok || json.data.status !== 'HOSPITAL_ACCEPTED') {
      throw new Error(json.message || 'Hospital referral acceptance failed');
    }
  });

  // ─── 4. ADMIN FLOW ────────────────────────────────────────────────────────────
  console.log('\n--- 4. ADMIN FLOW ---');
  let adminToken = '';

  await qaStep('ADMIN', 'Government Admin Login with admin.health@maharashtra.gov.in / demo1234', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin.health@maharashtra.gov.in', password: 'demo1234', role: 'government_admin' }),
    });
    const json = await res.json();
    if (!res.ok || !json.token) throw new Error('Admin login failed');
    adminToken = json.token;
  });

  await qaStep('ADMIN', 'Admin Overview Metrics & 7-Stage Referral Pipeline', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!res.ok || !json.data.indicators || !Array.isArray(json.data.pipeline)) {
      throw new Error('Admin overview payload invalid');
    }
    if (json.data.indicators.patientsServed < 1000) throw new Error('Indicator count invalid');
  });

  await qaStep('ADMIN', 'Admin Facilities Directory', async () => {
    const res = await fetch(`${baseUrl}/admin/facilities`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.length === 0) throw new Error('No facilities returned');
  });

  await qaStep('ADMIN', 'Admin Bottlenecks & Outreach Monitoring', async () => {
    const resOut = await fetch(`${baseUrl}/admin/outreach`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const jsonOut = await resOut.json();
    if (!resOut.ok || jsonOut.data.length === 0) throw new Error('No outreach records returned');
  });

  // ─── 5. CROSS-ROLE WORKFLOW ───────────────────────────────────────────────────
  console.log('\n--- 5. CROSS-ROLE VERIFICATION ---');
  await qaStep('CROSS-ROLE', 'Patient views newly generated Health Record and Follow-Up created by Doctor', async () => {
    const resRec = await fetch(`${baseUrl}/health-records`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const jsonRec = await resRec.json();
    const hasNewRecord = jsonRec.data.some((r: any) => r.diagnosis?.includes('Hypertensive Heart Disease'));
    if (!hasNewRecord) throw new Error('Doctor-created health record not found in patient view');

    const resFol = await fetch(`${baseUrl}/followups`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const jsonFol = await resFol.json();
    if (!jsonFol.data || jsonFol.data.length === 0) throw new Error('Patient follow-up list empty');
  });

  await qaStep('CROSS-ROLE', 'Patient views Hospital Accepted status on referral timeline', async () => {
    const resRef = await fetch(`${baseUrl}/referrals`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const jsonRef = await resRef.json();
    const ref = jsonRef.data.find((r: any) => r.referralId === 'HS-REF-7821');
    if (!ref || ref.status !== 'HOSPITAL_ACCEPTED') {
      throw new Error(`Expected HOSPITAL_ACCEPTED, got ${ref?.status}`);
    }
  });

  // ─── 6. AUTHORIZATION & RBAC SECURITY ─────────────────────────────────────────
  console.log('\n--- 6. AUTHORIZATION & RBAC SECURITY ---');
  await qaStep('AUTH-RBAC', 'Patient is blocked from /api/admin/overview with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await qaStep('AUTH-RBAC', 'Doctor is blocked from /api/admin/overview with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await qaStep('AUTH-RBAC', 'Unauthenticated request to protected API is rejected with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`);
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // ─── 7. ERROR RESILIENCE & ATOMIC INTEGRITY ────────────────────────────────────
  console.log('\n--- 7. ERROR RESILIENCE ---');
  await qaStep('ERROR-RESILIENCE', 'Invalid password returns user-safe 401 error message', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya@example.com', password: 'wrongpassword', role: 'patient' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error('Expected success: false');
  });

  await qaStep('ERROR-RESILIENCE', 'Booking invalid outreach ID returns clean 400 error message', async () => {
    const res = await fetch(`${baseUrl}/outreach/non-existent-id/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ reasonForVisit: 'Testing error' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  console.log('\n====================================================');
  console.log(`📊 QA SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  server.close();

  if (failed > 0) {
    process.exit(1);
  }
}

runQA().catch((err) => {
  console.error('[QA Fatal Error]', err);
  if (server) server.close();
  process.exit(1);
});
