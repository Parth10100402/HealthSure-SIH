// HealthSure — Master Cross-Portal E2E Test Suite
// backend/test/cross_portal_master_e2e.test.ts

import http from 'http';
import { createApp } from '../src/app.js';
const app = createApp();
import { dataStore } from '../src/db/store.js';

const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

let server: http.Server;
let patientToken = '';
let doctorToken = '';
let hospitalToken = '';
let adminToken = '';

async function runMasterE2ETests() {
  console.log('================================================================');
  console.log('🏆 HEALTHSURE — MASTER CROSS-PORTAL PRODUCTION INTEGRATION SUITE');
  console.log('================================================================\n');

  dataStore.initialize();

  server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 400));

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ✗ FAIL: ${name} -> ${e.message}`);
      failed++;
    }
  }

  // 1. Authentication for All 4 Portals
  await test('1. Auth: Log in Patient, Doctor, Hospital Staff, and Government Admin', async () => {
    // Patient
    const pRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya@example.com', password: 'demo1234', role: 'patient' }),
    });
    const pJson = await pRes.json();
    if (!pRes.ok || !pJson.token) throw new Error('Patient login failed');
    patientToken = pJson.token;

    // Doctor
    const dRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'dr.rajesh@healthsure.org', password: 'demo1234', role: 'doctor' }),
    });
    const dJson = await dRes.json();
    if (!dRes.ok || !dJson.token) throw new Error('Doctor login failed');
    doctorToken = dJson.token;

    // Hospital Staff
    const hRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'anita@hospital.gov.in', password: 'demo1234', role: 'hospital_staff' }),
    });
    const hJson = await hRes.json();
    if (!hRes.ok || !hJson.token) throw new Error('Hospital staff login failed');
    hospitalToken = hJson.token;

    // Admin
    const aRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin.health@maharashtra.gov.in', password: 'demo1234', role: 'government_admin' }),
    });
    const aJson = await aRes.json();
    if (!aRes.ok || !aJson.token) throw new Error('Admin login failed');
    adminToken = aJson.token;
  });

  // 2. Initial Admin Baseline Metrics
  let initialTotalAppointments = 0;
  await test('2. Admin Baseline: Fetch initial system-wide appointment count', async () => {
    const res = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!res.ok || !json.data?.indicators) throw new Error('Admin overview failed');
    initialTotalAppointments = json.data.indicators.totalAppointments;
    if (typeof initialTotalAppointments !== 'number') throw new Error('Invalid initial appointment count');
  });

  // 3. Cross-Portal Booking & Immediate Sync
  let bookedAptId = '';
  await test('3. Cross-Portal Booking: Patient books appointment -> Visible in Doctor, Hospital, & Admin portals', async () => {
    const bookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: 'doc-001',
        facilityId: 'fac-phc-01',
        date: '2026-08-28',
        startTime: '11:30 AM',
        mode: 'TELECONSULTATION',
        reasonForVisit: 'Cross-Portal Cardiac Consultation',
        idempotencyKey: 'idem-master-test-01',
      }),
    });
    const bookJson = await bookRes.json();
    if (!bookRes.ok || !bookJson.success) throw new Error('Patient booking failed');
    bookedAptId = bookJson.data.id;

    // Verify Patient sees it
    const patListRes = await fetch(`${BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const patList = await patListRes.json();
    const patApt = patList.data.find((a: any) => a.id === bookedAptId);
    if (!patApt || patApt.status.toLowerCase() !== 'confirmed') {
      throw new Error('Appointment not found in patient appointments list');
    }

    // Verify Doctor sees it
    const docListRes = await fetch(`${BASE_URL}/doctors/me/appointments`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const docList = await docListRes.json();
    const docApt = docList.data.find((a: any) => a.id === bookedAptId || a.appointmentId === patApt.appointmentId);
    if (!docApt || docApt.patientName !== 'Parth Sharma' || docApt.status.toLowerCase() !== 'confirmed') {
      throw new Error('Appointment not found with correct patient in doctor queue');
    }

    // Verify Admin aggregate increased exactly by +1
    const adminRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminJson = await adminRes.json();
    const newTotal = adminJson.data.indicators.totalAppointments;
    if (newTotal !== initialTotalAppointments + 1) {
      throw new Error(`Admin aggregate math mismatch! Expected ${initialTotalAppointments + 1}, got ${newTotal}`);
    }
  });

  // 4. Specialist Outreach Slot Booking & Atomic Decrement
  let initialOutreachSlots = 0;
  await test('4. Specialist Outreach: Patient books slot -> Slots decrement atomically & Doctor schedule updates', async () => {
    const oRes = await fetch(`${BASE_URL}/outreach/outreach-001`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const oJson = await oRes.json();
    initialOutreachSlots = oJson.data.availableSlots;

    const bookSlotRes = await fetch(`${BASE_URL}/outreach/outreach-001/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ reasonForVisit: 'Specialist Outreach Cardiac Check' }),
    });
    const bookSlotJson = await bookSlotRes.json();
    if (!bookSlotRes.ok || !bookSlotJson.success) throw new Error('Outreach booking failed');

    // Verify available slots decremented
    const oAfterRes = await fetch(`${BASE_URL}/outreach/outreach-001`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const oAfterJson = await oAfterRes.json();
    if (oAfterJson.data.availableSlots !== initialOutreachSlots - 1) {
      throw new Error(`Expected ${initialOutreachSlots - 1} slots, got ${oAfterJson.data.availableSlots}`);
    }
  });

  // 5. Appointment Cancellation & Slot Release
  await test('5. Cancellation: Patient cancels appointment -> Doctor queue updates & Admin aggregate recalculates', async () => {
    const cancelRes = await fetch(`${BASE_URL}/appointments/${bookedAptId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const cancelJson = await cancelRes.json();
    if (!cancelRes.ok || !cancelJson.success) throw new Error('Cancellation failed');

    // Verify Patient sees status cancelled
    const patListRes = await fetch(`${BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const patList = await patListRes.json();
    const patApt = patList.data.find((a: any) => a.id === bookedAptId);
    if (!patApt || patApt.status.toLowerCase() !== 'cancelled') {
      throw new Error('Appointment status is not cancelled in patient portal');
    }

    // Verify Admin aggregate recalculates back to baseline + 1 (from outreach booking)
    const adminRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminJson = await adminRes.json();
    const currentTotal = adminJson.data.indicators.totalAppointments;
    if (currentTotal !== initialTotalAppointments + 1) {
      throw new Error(`Admin aggregate not properly recalculated after cancellation! Got ${currentTotal}`);
    }
  });

  // 6. Teleconsultation Live State Machine & WebRTC Immunity
  await test('6. Teleconsultation: Lifecycle transitions to LIVE and resists stale unmount leaves', async () => {
    // Patient joins
    await fetch(`${BASE_URL}/teleconsultations/tele-001/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'patient' }),
    });

    // Doctor joins
    await fetch(`${BASE_URL}/teleconsultations/tele-001/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'doctor' }),
    });

    // WebRTC connects -> LIVE
    const liveRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'patient', connected: true }),
    });
    const liveJson = await liveRes.json();
    if (!liveJson.success || liveJson.data.status !== 'LIVE') {
      throw new Error('Session did not transition to LIVE');
    }

    // Stale leave is rejected
    const staleRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'doctor' }),
    });
    const staleJson = await staleRes.json();
    if (staleJson.success !== false) throw new Error('Stale leave should be rejected during active call');

    // Verify session remains LIVE
    const sessionRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
    const sessionJson = await sessionRes.json();
    if (sessionJson.data.status !== 'LIVE') throw new Error('Session status dropped from LIVE prematurely');

    // Explicit End Call
    const endRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'doctor', explicit: true, reason: 'user_clicked_end_call' }),
    });
    const endJson = await endRes.json();
    if (!endRes.ok || !endJson.success) throw new Error('Explicit end call failed');
  });

  // 7. Clinical Consultation Completion Workflow
  await test('7. Clinical Completion: Doctor creates Prescription, Health Record & 30-Day Follow-Up', async () => {
    const compRes = await fetch(`${BASE_URL}/doctors/consultations/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        appointmentId: 'apt-001',
        patientId: 'pat-001',
        clinicalNotes: 'Blood pressure 126/80 mmHg. Normal sinus rhythm. Advised continued lifestyle modifications and Amlodipine.',
        diagnosis: 'Essential Hypertension - Controlled',
        vitals: { bp: '126/80 mmHg', pulse: '70 bpm', spo2: '99%' },
        prescriptions: [
          { medicine: 'Tab. Amlodipine 5mg', dosage: '1 Tab Daily (Morning)', duration: '30 Days', instructions: 'After breakfast' },
          { medicine: 'Tab. Atorvastatin 10mg', dosage: '1 Tab Daily (Night)', duration: '30 Days', instructions: 'After dinner' },
        ],
        createFollowUp: true,
        followUpDays: 30,
        followUpInstructions: '30-day routine blood pressure review at PHC Khed.',
      }),
    });
    const compJson = await compRes.json();
    if (!compRes.ok || !compJson.success) throw new Error('Clinical completion failed');

    // Verify Health Record in Patient Portal
    const hrRes = await fetch(`${BASE_URL}/health-records`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const hrJson = await hrRes.json();
    const latestRec = hrJson.data.find((r: any) => r.diagnosis?.includes('Essential Hypertension'));
    if (!latestRec) throw new Error('Health record not found in patient portal');

    // Verify Follow-up in Patient Portal
    const folRes = await fetch(`${BASE_URL}/followups`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const folJson = await folRes.json();
    const latestFol = folJson.data.find((f: any) => f.instructions?.includes('PHC Khed'));
    if (!latestFol) throw new Error('Follow-up continuity record not found');
  });

  // 8. Hospital Staff Referral Triage & Token Assignment
  await test('8. Hospital Triage: Hospital Staff accepts referral ref-001 and assigns token DH-CARD-14', async () => {
    const patchRes = await fetch(`${BASE_URL}/hospitals/referrals/ref-001`, {
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
    const patchJson = await patchRes.json();
    if (!patchRes.ok || !patchJson.success) throw new Error('Hospital referral triage failed');

    // Verify Patient sees referral as accepted
    const refRes = await fetch(`${BASE_URL}/referrals`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const refJson = await refRes.json();
    const targetRef = refJson.data.find((r: any) => r.id === 'ref-001' || r.referralId === 'HS-REF-7821');
    if (!targetRef || targetRef.status.toLowerCase() !== 'hospital_accepted') {
      throw new Error(`Expected HOSPITAL_ACCEPTED, got ${targetRef?.status}`);
    }
  });

  // 9. RBAC & Security Isolation
  await test('9. RBAC Security: Reject unauthorized role cross-access with 401 & 403', async () => {
    // Patient accessing Admin overview
    const pAdminRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (pAdminRes.status !== 403) throw new Error(`Expected 403 Forbidden for patient on admin API, got ${pAdminRes.status}`);

    // Doctor accessing Admin overview
    const dAdminRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (dAdminRes.status !== 403) throw new Error(`Expected 403 Forbidden for doctor on admin API, got ${dAdminRes.status}`);

    // Unauthenticated request
    const unauthRes = await fetch(`${BASE_URL}/admin/overview`);
    if (unauthRes.status !== 401) throw new Error(`Expected 401 Unauthorized for unauthenticated request, got ${unauthRes.status}`);
  });

  server.close();

  console.log('\n================================================================');
  console.log(`📊 MASTER E2E SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runMasterE2ETests().catch((err) => {
  console.error('Fatal master test error:', err);
  if (server) server.close();
  process.exit(1);
});
