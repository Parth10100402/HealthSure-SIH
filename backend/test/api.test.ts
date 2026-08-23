// HealthSure — End-to-End Automated Backend API Tests
// backend/test/api.test.ts

import { createApp } from '../src/app.js';
import { dataStore } from '../src/db/store.js';

let server: any;
let baseUrl: string;

async function runTests() {
  console.log('────────────────────────────────────────────────────');
  console.log('🧪 Running HealthSure Phase 5 Backend API Test Suite');
  console.log('────────────────────────────────────────────────────');

  await dataStore.initialize();
  const app = createApp();

  const PORT = 5099;
  baseUrl = `http://localhost:${PORT}/api`;

  server = app.listen(PORT);
  console.log(`[Test Server] Started test runner on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health returns healthy status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'healthy') {
      throw new Error(`Expected 200 healthy, got ${res.status} ${JSON.stringify(data)}`);
    }
  });

  // 2. Auth: Patient Login
  let patientToken = '';
  await test('POST /api/auth/login logs in Patient (Ramesh Sharma)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'priya@example.com',
        password: 'demo1234',
        role: 'patient',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(`Login failed: ${data.message}`);
    }
    patientToken = data.token;
  });

  // 3. Auth: Doctor Login
  let doctorToken = '';
  await test('POST /api/auth/login logs in Doctor (Dr. Ananya Mehta)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'dr.rajesh@healthsure.org',
        password: 'demo1234',
        role: 'doctor',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(`Doctor login failed: ${data.message}`);
    }
    doctorToken = data.token;
  });

  // 4. Auth: Hospital Staff Login
  let hospitalToken = '';
  await test('POST /api/auth/login logs in Hospital Staff (Anita Sharma)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'anita@hospital.gov.in',
        password: 'demo1234',
        role: 'hospital_staff',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(`Hospital staff login failed: ${data.message}`);
    }
    hospitalToken = data.token;
  });

  // 5. Auth: Admin Login
  let adminToken = '';
  await test('POST /api/auth/login logs in Government Admin (ADM-MH-001)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin.health@maharashtra.gov.in',
        password: 'demo1234',
        role: 'government_admin',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(`Admin login failed: ${data.message}`);
    }
    adminToken = data.token;
  });

  // 6. Role Authorization: Patient blocked from Admin API
  await test('Role Authorization: Patient is blocked from /api/admin/overview with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    }
  });

  // 7. Role Authorization: Admin successfully accesses /api/admin/overview
  await test('Role Authorization: Admin successfully accesses /api/admin/overview', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.data.indicators) {
      throw new Error(`Expected 200 with indicators, got ${res.status}`);
    }
  });

  // 8. Specialist Outreach: Fetch schedules and verify available slots
  let outreachId = '';
  let initialSlots = 0;
  await test('GET /api/outreach returns outreach schedule with available slots', async () => {
    const res = await fetch(`${baseUrl}/outreach`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const data = await res.json();
    if (!res.ok || data.data.length === 0) {
      throw new Error(`Failed to fetch outreach: ${data.message}`);
    }
    outreachId = data.data[0].id;
    initialSlots = data.data[0].availableSlots;
  });

  // 9. Atomic Slot Booking
  await test('POST /api/outreach/:id/book atomically reserves a slot and creates appointment', async () => {
    const res = await fetch(`${baseUrl}/outreach/${outreachId}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        reasonForVisit: 'Chest pain review during outreach camp',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.appointment) {
      throw new Error(`Booking failed: ${data.message}`);
    }

    if (data.data.outreach.availableSlots !== initialSlots - 1) {
      throw new Error(`Expected available slots to decrease to ${initialSlots - 1}, got ${data.data.outreach.availableSlots}`);
    }
  });

  // 10. Doctor views Appointments
  await test("GET /api/doctors/me/appointments allows doctor to view today's patient queue", async () => {
    const res = await fetch(`${baseUrl}/doctors/me/appointments`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data)) {
      throw new Error(`Failed to get doctor appointments: ${data.message}`);
    }
  });

  // 11. Doctor Creates Referral
  let createdReferralId = '';
  await test('POST /api/referrals creates clinical referral from PHC to District Hospital', async () => {
    const res = await fetch(`${baseUrl}/referrals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        patientId: dataStore.patients[0].id,
        referringFacilityId: dataStore.facilities[0].id,
        receivingHospitalId: dataStore.facilities[4].id,
        speciality: 'Cardiology',
        reason: 'Echocardiography confirmation and specialist review',
        priority: 'NORMAL',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.referralId) {
      throw new Error(`Referral creation failed: ${data.message}`);
    }
    createdReferralId = data.data.id;
  });

  // 12. Hospital Accepts Referral and Schedules Appointment
  await test('PATCH /api/hospitals/referrals/:id accepts referral and assigns token', async () => {
    const res = await fetch(`${baseUrl}/hospitals/referrals/${createdReferralId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hospitalToken}`,
      },
      body: JSON.stringify({
        status: 'HOSPITAL_ACCEPTED',
        tokenNumber: 'DH-CARD-15',
        appointmentDate: '2026-08-28',
      }),
    });
    const data = await res.json();
    if (!res.ok || data.data.status !== 'HOSPITAL_ACCEPTED') {
      throw new Error(`Hospital accept failed: ${data.message}`);
    }
  });

  // 13. Doctor Completes Consultation & Creates Health Record + Follow-Up
  await test('POST /api/doctors/consultations/complete creates health record & follow-up', async () => {
    const apt = dataStore.appointments[0];
    const res = await fetch(`${baseUrl}/doctors/consultations/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        appointmentId: apt.id,
        diagnosis: 'Hypertensive Heart Disease (Controlled)',
        clinicalNotes: 'BP 132/84 mmHg. 2D Echo shows EF 58%. Amlodipine 5mg continued.',
        createFollowUpDays: 30,
        followUpInstructions: 'Review at PHC Tele-Kiosk in 30 days.',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data.healthRecord) {
      throw new Error(`Consultation completion failed: ${data.message}`);
    }
  });

  // 14. Patient sees updated Follow-Up
  await test('GET /api/followups allows patient to view upcoming follow-up continuity', async () => {
    const res = await fetch(`${baseUrl}/followups`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const data = await res.json();
    if (!res.ok || data.data.length === 0) {
      throw new Error(`Patient follow-up fetch failed: ${data.message}`);
    }
  });

  // 15. Admin sees updated system indicators
  await test('GET /api/admin/overview returns updated network continuity indicators', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (!res.ok || data.data.indicators.patientsServed < 1000) {
      throw new Error(`Admin indicators verification failed: ${data.message}`);
    }
  });

  console.log('────────────────────────────────────────────────────');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed.`);
  console.log('────────────────────────────────────────────────────');

  server.close();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[Test Error]', err);
  if (server) server.close();
  process.exit(1);
});
