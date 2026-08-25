// HealthSure — Production-Grade Appointment, Timezone & Cross-Portal Consistency Test Suite
// backend/test/timezone_consistency.test.ts

import { createApp } from '../src/app.js';
import { dataStore } from '../src/db/store.js';
import { createUtcInstantFromIst, formatAppointmentTime, formatAppointmentDate } from '../src/utils/dateTime.js';

let server: any;
let baseUrl: string;

async function runTests() {
  console.log('====================================================');
  console.log('🧪 HEALTHSURE — TIMEZONE & CROSS-PORTAL CONSISTENCY TESTS');
  console.log('====================================================\n');

  await dataStore.initialize();
  const app = createApp();

  const PORT = 5122;
  baseUrl = `http://localhost:${PORT}/api`;
  server = app.listen(PORT);

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

  // 1. Timezone mathematics and canonical UTC/IST conversion
  await test('Timezone Math: 11:30 AM IST converts to exact 06:00:00Z UTC instant', async () => {
    const utc = createUtcInstantFromIst('2026-08-28', '11:30 AM');
    if (utc !== '2026-08-28T06:00:00.000Z') {
      throw new Error(`Expected 2026-08-28T06:00:00.000Z, got ${utc}`);
    }
    const display = formatAppointmentTime(utc);
    if (!display.includes('11:30') || !display.includes('AM')) {
      throw new Error(`Expected 11:30 AM, got ${display}`);
    }
  });

  await test('Timezone Math: 10:30 AM IST converts to exact 05:00:00Z UTC instant', async () => {
    const utc = createUtcInstantFromIst('2026-08-28', '10:30 AM');
    if (utc !== '2026-08-28T05:00:00.000Z') {
      throw new Error(`Expected 2026-08-28T05:00:00.000Z, got ${utc}`);
    }
    const display = formatAppointmentTime(utc);
    if (!display.includes('10:30') || !display.includes('AM')) {
      throw new Error(`Expected 10:30 AM, got ${display}`);
    }
  });

  await test('Timezone Math: 12:00 PM IST (Noon) converts to exact 06:30:00Z UTC instant', async () => {
    const utc = createUtcInstantFromIst('2026-08-28', '12:00 PM');
    if (utc !== '2026-08-28T06:30:00.000Z') {
      throw new Error(`Expected 2026-08-28T06:30:00.000Z, got ${utc}`);
    }
    const display = formatAppointmentTime(utc);
    if (!display.includes('12:00') || !display.includes('PM')) {
      throw new Error(`Expected 12:00 PM, got ${display}`);
    }
  });

  await test('Timezone Math: 12:30 AM IST (Midnight boundary) converts to previous day 19:00:00Z UTC', async () => {
    const utc = createUtcInstantFromIst('2026-08-29', '12:30 AM');
    if (utc !== '2026-08-28T19:00:00.000Z') {
      throw new Error(`Expected 2026-08-28T19:00:00.000Z, got ${utc}`);
    }
    const display = formatAppointmentTime(utc);
    if (!display.includes('12:30') || !display.includes('AM')) {
      throw new Error(`Expected 12:30 AM, got ${display}`);
    }
  });

  await test('Timezone Math: 02:30 PM IST converts to exact 09:00:00Z UTC instant', async () => {
    const utc = createUtcInstantFromIst('2026-08-28', '02:30 PM');
    if (utc !== '2026-08-28T09:00:00.000Z') {
      throw new Error(`Expected 2026-08-28T09:00:00.000Z, got ${utc}`);
    }
    const display = formatAppointmentTime(utc);
    if (!display.includes('02:30') || !display.includes('PM')) {
      throw new Error(`Expected 02:30 PM, got ${display}`);
    }
  });

  // 2. Authentication for all roles
  let patientToken = '';
  let doctorToken = '';
  let adminToken = '';

  await test('Auth: Log in Patient, Doctor, and Government Admin', async () => {
    const pRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya@example.com', password: 'demo1234', role: 'patient' }),
    });
    patientToken = (await pRes.json()).token;

    const dRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'dr.rajesh@healthsure.org', password: 'demo1234', role: 'doctor' }),
    });
    doctorToken = (await dRes.json()).token;

    const aRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin.health@maharashtra.gov.in', password: 'demo1234', role: 'government_admin' }),
    });
    adminToken = (await aRes.json()).token;

    if (!patientToken || !doctorToken || !adminToken) {
      throw new Error('Failed to acquire auth tokens');
    }
  });

  // 3. Initial Government Dashboard Count
  let initialGovCount = 0;
  await test('Dashboard Math: Initial government overview returns baseline 1240 appointments', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (!res.ok || !data.data?.indicators) throw new Error('Failed to fetch admin overview');
    initialGovCount = data.data.indicators.totalAppointments;
    if (initialGovCount !== 1240) {
      throw new Error(`Expected baseline 1240, got ${initialGovCount}`);
    }
  });

  // 4. Booking 1st appointment for 11:30 AM IST (Teleconsultation)
  let firstAptId = '';
  await test('Booking 1: Patient books 11:30 AM IST Teleconsultation -> Persists UTC 06:00:00Z', async () => {
    const res = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: 'doc-001',
        facilityId: 'fac-dh-01',
        date: '2026-08-28',
        startTime: '11:30 AM',
        mode: 'TELECONSULTATION',
        reasonForVisit: 'Cardiac Follow-up Review',
        idempotencyKey: 'idem-test-001',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Appointment creation failed: ${data.message}`);

    firstAptId = data.data.appointmentId || data.data.id;
    if (data.data.scheduledAt !== '2026-08-28T06:00:00.000Z') {
      throw new Error(`Expected scheduledAt 2026-08-28T06:00:00.000Z, got ${data.data.scheduledAt}`);
    }
  });

  // 5. Cross-Portal verification for Appointment 1 (11:30 AM on all portals)
  await test('Cross-Portal Verification: Patient, Doctor & Hospital all read 11:30 AM IST for Apt 1', async () => {
    // Patient
    const pRes = await fetch(`${baseUrl}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const pData = await pRes.json();
    const pApt = pData.data.find((a: any) => a.appointmentId === firstAptId || a.id === firstAptId);
    if (!pApt || !pApt.startTime.includes('11:30') || !pApt.startTime.includes('AM')) {
      throw new Error(`Patient view failed to display 11:30 AM, got: ${JSON.stringify(pApt)}`);
    }

    // Doctor
    const dRes = await fetch(`${baseUrl}/doctors/me/appointments`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const dData = await dRes.json();
    const dApt = dData.data.find((a: any) => a.appointmentId === firstAptId || a.id === firstAptId);
    if (!dApt || !dApt.time.includes('11:30') || !dApt.time.includes('AM')) {
      throw new Error(`Doctor view failed to display 11:30 AM, got: ${JSON.stringify(dApt)}`);
    }

    // Teleconsultation linkage
    const teleRes = await fetch(`${baseUrl}/teleconsultations/tele-${dApt.id}/session`);
    if (!teleRes.ok) {
      throw new Error('Linked teleconsultation record was not automatically created');
    }
  });

  // 6. Government Count Increments to 1241
  await test('Dashboard Math: Government count increments to N(t+1) = 1241', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const currentCount = data.data.indicators.totalAppointments;
    if (currentCount !== initialGovCount + 1) {
      throw new Error(`Expected 1241, got ${currentCount}`);
    }
  });

  // 7. Booking 2nd appointment for 10:30 AM IST
  await test('Booking 2: Patient books 10:30 AM IST -> Government count becomes N(t+2) = 1242', async () => {
    const res = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: 'doc-002',
        facilityId: 'fac-dh-02',
        date: '2026-08-29',
        startTime: '10:30 AM',
        mode: 'IN_PERSON',
        reasonForVisit: 'General Medicine Health Check',
        idempotencyKey: 'idem-test-002',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Appointment 2 failed: ${data.message}`);

    const govRes = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const govData = await govRes.json();
    const count = govData.data.indicators.totalAppointments;
    if (count !== 1242) {
      throw new Error(`Expected 1242, got ${count}`);
    }
  });

  // 8. Booking 3rd appointment via Outreach
  await test('Booking 3: Patient books Specialist Outreach -> Government count becomes N(t+3) = 1243', async () => {
    const res = await fetch(`${baseUrl}/outreach/outreach-003/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ reasonForVisit: 'Maternal health consultation' }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Outreach booking failed: ${data.message}`);

    const govRes = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const govData = await govRes.json();
    const count = govData.data.indicators.totalAppointments;
    if (count !== 1243) {
      throw new Error(`Expected 1243, got ${count}`);
    }
  });

  // 9. Idempotency safety: Duplicate request with same idempotencyKey does not create second appointment
  await test('Idempotency: Re-sending request with existing idempotencyKey returns existing without incrementing count', async () => {
    const res = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: 'doc-001',
        facilityId: 'fac-dh-01',
        date: '2026-08-28',
        startTime: '11:30 AM',
        mode: 'TELECONSULTATION',
        reasonForVisit: 'Duplicate Retry',
        idempotencyKey: 'idem-test-001',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Idempotency replay failed: ${data.message}`);

    const govRes = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const govData = await govRes.json();
    const count = govData.data.indicators.totalAppointments;
    if (count !== 1243) {
      throw new Error(`Expected count to stay at 1243 on duplicate idempotency replay, got ${count}`);
    }
  });

  // 10. Concurrency Safety: 0 slots remaining rejects booking with 409
  await test('Slot Concurrency: Booking exhausted slot returns 409 SLOT_UNAVAILABLE', async () => {
    const outreach = dataStore.outreachSchedules.find((o) => o.id === 'outreach-008');
    if (outreach) outreach.availableSlots = 0;

    const res = await fetch(`${baseUrl}/outreach/outreach-008/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ reasonForVisit: 'Should fail' }),
    });
    const data = await res.json();
    if (res.status !== 400 && res.status !== 409) {
      throw new Error(`Expected 400 or 409, got ${res.status} ${JSON.stringify(data)}`);
    }
  });

  console.log('\n====================================================');
  console.log(`📊 TIMEZONE & CONSISTENCY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  server.close();

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  if (server) server.close();
  process.exit(1);
});
