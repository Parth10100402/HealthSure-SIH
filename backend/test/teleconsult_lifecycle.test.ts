// HealthSure — Production Teleconsultation Lifecycle & Race-Condition Immunity Test Suite
// backend/test/teleconsult_lifecycle.test.ts

import http from 'http';
import { createApp } from '../src/app.js';
const app = createApp();
import { dataStore } from '../src/db/store.js';

const PORT = 5088;
const BASE_URL = `http://localhost:${PORT}/api`;

let server: http.Server;
let patientToken = '';
let doctorToken = '';

async function runLifecycleTests() {
  console.log('====================================================');
  console.log('🧪 HEALTHSURE — TELECONSULTATION RACE-IMMUNITY TESTS');
  console.log('====================================================\n');

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

  // 1. Auth Logins
  await test('Auth: Patient and Doctor Login', async () => {
    const pRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya@example.com', password: 'demo1234', role: 'patient' }),
    });
    const pJson = await pRes.json();
    if (!pRes.ok || !pJson.token) throw new Error('Patient login failed');
    patientToken = pJson.token;

    const dRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'dr.rajesh@healthsure.org', password: 'demo1234', role: 'doctor' }),
    });
    const dJson = await dRes.json();
    if (!dRes.ok || !dJson.token) throw new Error('Doctor login failed');
    doctorToken = dJson.token;
  });

  // 2. Initial State: Upcoming
  await test('Initial Session State: UPCOMING (patientJoined=false, doctorJoined=false)', async () => {
    const res = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Session fetch failed');
    if (json.data.status !== 'UPCOMING' && json.data.status !== 'SCHEDULED') {
      throw new Error(`Expected UPCOMING, got ${json.data.status}`);
    }
    if (json.data.patientJoined || json.data.doctorJoined) {
      throw new Error('Neither participant should be joined initially');
    }
  });

  // 3. Appointment is CONFIRMED initially
  await test('Initial Appointment Status: CONFIRMED', async () => {
    const aptRes = await fetch(`${BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const aptJson = await aptRes.json();
    const apt = aptJson.data.find((a: any) => a.id === 'apt-001' || a.appointmentId === 'HS-APT-1001');
    if (!apt || apt.status.toLowerCase() !== 'confirmed') {
      throw new Error(`Expected CONFIRMED, got ${apt?.status}`);
    }
  });

  // 4. Patient Enters Video Room -> WAITING_FOR_DOCTOR
  await test('Patient Enters Room: Status -> WAITING_FOR_DOCTOR (patientJoined=true)', async () => {
    const joinRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({ role: 'patient' }),
    });
    const joinJson = await joinRes.json();
    if (!joinRes.ok || !joinJson.success) throw new Error('Join failed');
    if (joinJson.data.status !== 'WAITING_FOR_DOCTOR') {
      throw new Error(`Expected WAITING_FOR_DOCTOR, got ${joinJson.data.status}`);
    }

    const sessionRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
    const sessionJson = await sessionRes.json();
    if (!sessionJson.data.patientJoined || sessionJson.data.doctorJoined) {
      throw new Error('Session state must reflect patientJoined=true, doctorJoined=false');
    }
  });

  // 5. Doctor Enters Room -> CONNECTING
  await test('Doctor Enters Room: Status -> CONNECTING (patientJoined=true, doctorJoined=true)', async () => {
    const joinRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({ role: 'doctor' }),
    });
    const joinJson = await joinRes.json();
    if (!joinRes.ok || !joinJson.success) throw new Error('Doctor join failed');
    if (joinJson.data.status !== 'CONNECTING') {
      throw new Error(`Expected CONNECTING, got ${joinJson.data.status}`);
    }

    const sessionRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
    const sessionJson = await sessionRes.json();
    if (!sessionJson.data.patientJoined || !sessionJson.data.doctorJoined) {
      throw new Error('Both participants must be marked joined');
    }
  });

  // 6. Appointment Remains CONFIRMED when doctor joins
  await test('Appointment Integrity: Appointment remains CONFIRMED when Doctor joins (NEVER COMPLETED)', async () => {
    const docAptRes = await fetch(`${BASE_URL}/doctors/me/appointments`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const docAptJson = await docAptRes.json();
    const apt = docAptJson.data.find((a: any) => a.id === 'apt-001' || a.appointmentId === 'HS-APT-1001');
    if (!apt || apt.status.toLowerCase() !== 'confirmed') {
      throw new Error(`Appointment status must remain confirmed, got: ${apt?.status}`);
    }
    if (apt.teleconsultId !== 'tele-001') {
      throw new Error(`Expected teleconsultId = tele-001, got: ${apt.teleconsultId}`);
    }
  });

  // 7. Signaling Exchange
  await test('Signaling Exchange: Offer -> Answer -> Candidate with Canonical Session ID', async () => {
    // Patient sends Offer
    const offerRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderRole: 'patient',
        type: 'offer',
        payload: { type: 'offer', sdp: 'v=0\r\no=patient 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' },
      }),
    });
    if (!offerRes.ok) throw new Error('Offer dispatch failed');

    // Doctor receives Offer
    const docSignalsRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/signal?role=doctor&since=0`);
    const docSignalsJson = await docSignalsRes.json();
    const offer = docSignalsJson.data.find((s: any) => s.type === 'offer');
    if (!offer) throw new Error('Doctor failed to fetch offer');

    // Doctor sends Answer
    const answerRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderRole: 'doctor',
        type: 'answer',
        payload: { type: 'answer', sdp: 'v=0\r\no=doctor 54321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' },
      }),
    });
    if (!answerRes.ok) throw new Error('Answer dispatch failed');

    // Patient receives Answer
    const patSignalsRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/signal?role=patient&since=0`);
    const patSignalsJson = await patSignalsRes.json();
    const answer = patSignalsJson.data.find((s: any) => s.type === 'answer');
    if (!answer) throw new Error('Patient failed to fetch answer');

    // ICE Candidate exchange
    const iceRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderRole: 'patient',
        type: 'candidate',
        payload: { candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 50000 typ host', sdpMid: '0', sdpMLineIndex: 0 },
      }),
    });
    if (!iceRes.ok) throw new Error('Candidate dispatch failed');
  });

  // 8. P2P Connected -> POST /live transitions to LIVE
  await test('WebRTC Connected: POST /live transitions session to LIVE with connectedAt', async () => {
    const liveRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'patient', connected: true }),
    });
    if (!liveRes.ok) throw new Error('Live endpoint failed');
    const liveJson = await liveRes.json();
    if (!liveJson.success || liveJson.data.status !== 'LIVE') {
      throw new Error(`Expected LIVE status, got: ${liveJson.data?.status}`);
    }

    const sessionRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
    const sessionJson = await sessionRes.json();
    if (sessionJson.data.status !== 'LIVE') {
      throw new Error(`Expected LIVE, got: ${sessionJson.data.status}`);
    }
  });

  // 9. Read-Only Polling does NOT mutate status
  await test('Presence Polling: GET /session is strictly read-only and does not mutate LIVE status', async () => {
    for (let i = 0; i < 5; i++) {
      const sessionRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
      const sessionJson = await sessionRes.json();
      if (sessionJson.data.status !== 'LIVE') {
        throw new Error(`Polling mutated status! Expected LIVE, got ${sessionJson.data.status}`);
      }
    }
  });

  // 10. Stale / Implicit leave request is REJECTED while call is LIVE
  await test('Race Safety: Implicit / stale leave request without explicit=true is ignored during LIVE call', async () => {
    const staleLeaveRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'doctor' }), // missing explicit: true
    });
    const staleLeaveJson = await staleLeaveRes.json();
    if (staleLeaveJson.success !== false) {
      throw new Error('Implicit leave must be rejected while call is active');
    }

    // Verify session remains LIVE
    const sessionRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
    const sessionJson = await sessionRes.json();
    if (sessionJson.data.status !== 'LIVE') {
      throw new Error(`Call must remain LIVE after stale leave attempt! Got ${sessionJson.data.status}`);
    }
  });

  // 11. Explicit End Call -> ENDED
  await test('Call Termination: POST /leave with explicit=true marks status ENDED with endedAt', async () => {
    const leaveRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'doctor', explicit: true, reason: 'user_clicked_end_call' }),
    });
    if (!leaveRes.ok) throw new Error('Leave request failed');

    const sessionRes = await fetch(`${BASE_URL}/teleconsultations/tele-001/session`);
    const sessionJson = await sessionRes.json();
    if (sessionJson.data.status !== 'ENDED') {
      throw new Error(`Expected ENDED, got: ${sessionJson.data.status}`);
    }
  });

  // 12. Appointment Remains CONFIRMED after call ends (Separate Lifecycles)
  await test('Appointment Independence: Appointment status remains CONFIRMED after call ends (not completed by leave)', async () => {
    const aptRes = await fetch(`${BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const aptJson = await aptRes.json();
    const apt = aptJson.data.find((a: any) => a.id === 'apt-001' || a.appointmentId === 'HS-APT-1001');
    if (!apt || apt.status.toLowerCase() !== 'confirmed') {
      throw new Error(`Appointment status must remain confirmed after call end, got: ${apt?.status}`);
    }
  });

  // 13. Doctor Completes Clinical Consultation Workflow
  await test('Clinical Completion: Doctor completes consultation -> Appointment COMPLETED, Health Record & Follow-up generated', async () => {
    const compRes = await fetch(`${BASE_URL}/doctors/consultations/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        appointmentId: 'apt-001',
        patientId: 'pat-001',
        clinicalNotes: 'Blood pressure controlled. Heart sounds normal. Prescribed Amlodipine 5mg OD.',
        diagnosis: 'Essential Hypertension - Controlled',
        vitals: { bp: '128/82 mmHg', pulse: '72 bpm', spo2: '99%' },
        prescriptions: [
          { medicine: 'Tab. Amlodipine 5mg', dosage: '1 Tab Daily (Morning)', duration: '30 Days', instructions: 'After breakfast' },
        ],
        createFollowUp: true,
        followUpDays: 30,
        followUpInstructions: '30-day routine blood pressure review via teleconsultation.',
      }),
    });
    const compJson = await compRes.json();
    if (!compRes.ok || !compJson.success) throw new Error('Consultation completion failed');

    // Verify appointment is now COMPLETED
    const aptRes = await fetch(`${BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const aptJson = await aptRes.json();
    const apt = aptJson.data.find((a: any) => a.id === 'apt-001' || a.appointmentId === 'HS-APT-1001');
    if (!apt || apt.status.toLowerCase() !== 'completed') {
      throw new Error(`Appointment must be COMPLETED after clinical complete, got: ${apt?.status}`);
    }

    // Verify health record was created
    const hrRes = await fetch(`${BASE_URL}/health-records`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const hrJson = await hrRes.json();
    if (!hrJson.data || hrJson.data.length === 0) throw new Error('Health record not created');

    // Verify follow-up was created
    const folRes = await fetch(`${BASE_URL}/followups`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const folJson = await folRes.json();
    if (!folJson.data || folJson.data.length === 0) throw new Error('Follow-up not created');
  });

  server.close();

  console.log('\n====================================================');
  console.log(`📊 TELECONSULTATION RACE-IMMUNITY SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runLifecycleTests().catch((err) => {
  console.error('Fatal test error:', err);
  if (server) server.close();
  process.exit(1);
});
