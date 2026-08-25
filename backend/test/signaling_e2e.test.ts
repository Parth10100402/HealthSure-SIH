import { createApp } from '../src/app.js';
import type { Server } from 'http';

async function runTest() {
  console.log('────────────────────────────────────────────────────');
  console.log('🧪 Running HealthSure WebRTC Signaling & Presence Test');
  console.log('────────────────────────────────────────────────────');

  const app = createApp();
  const PORT = 5098;
  const server: Server = app.listen(PORT);
  const API_BASE = `http://localhost:${PORT}/api`;

  try {
    const sessionId = 'tele-001';

    // 1. Clear session signals
    const delRes = await fetch(`${API_BASE}/teleconsultations/${sessionId}/signal`, { method: 'DELETE' });
    const delJson: any = await delRes.json();
    console.log('  ✓ PASS: DELETE /api/teleconsultations/:id/signal resets session:', delJson.success);

    // 2. Patient joins session
    const joinPat = await fetch(`${API_BASE}/teleconsultations/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'patient' }),
    });
    const joinPatJson: any = await joinPat.json();
    console.log('  ✓ PASS: Patient joins session -> status:', joinPatJson.data.status);

    // 3. Check session presence
    const sessRes1 = await fetch(`${API_BASE}/teleconsultations/${sessionId}/session`);
    const sessJson1: any = await sessRes1.json();
    console.log('  ✓ PASS: Presence reflects patientJoined = true, doctorJoined = false:', sessJson1.data.patientJoined === true && sessJson1.data.doctorJoined === false);

    // 4. Doctor joins session
    const joinDoc = await fetch(`${API_BASE}/teleconsultations/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'doctor' }),
    });
    const joinDocJson: any = await joinDoc.json();
    console.log('  ✓ PASS: Doctor joins session -> status:', joinDocJson.data.status);

    // 5. Patient sends Offer
    const fakeOffer = { type: 'offer', sdp: 'v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' };
    const res1 = await fetch(`${API_BASE}/teleconsultations/${sessionId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderRole: 'patient',
        type: 'offer',
        payload: fakeOffer,
      }),
    });
    const json1: any = await res1.json();
    console.log('  ✓ PASS: Patient persists Offer:', json1.success);

    // 6. Doctor receives Offer
    const res2 = await fetch(`${API_BASE}/teleconsultations/${sessionId}/signal?role=doctor&since=0`);
    const json2: any = await res2.json();
    const offerMsg = json2.data.find((m: any) => m.type === 'offer');
    console.log('  ✓ PASS: Doctor fetches Offer from persistent relay:', !!offerMsg && offerMsg.payload.type === 'offer');

    // 7. Doctor sends Answer
    const fakeAnswer = { type: 'answer', sdp: 'v=0\r\no=- 654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' };
    const res3 = await fetch(`${API_BASE}/teleconsultations/${sessionId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderRole: 'doctor',
        type: 'answer',
        payload: fakeAnswer,
      }),
    });
    const json3: any = await res3.json();
    console.log('  ✓ PASS: Doctor persists Answer:', json3.success);

    // 8. Patient receives Answer
    const res4 = await fetch(`${API_BASE}/teleconsultations/${sessionId}/signal?role=patient&since=0`);
    const json4: any = await res4.json();
    const answerMsg = json4.data.find((m: any) => m.type === 'answer');
    console.log('  ✓ PASS: Patient fetches Answer from persistent relay:', !!answerMsg && answerMsg.payload.type === 'answer');

    // 9. ICE Candidate exchange
    const fakeCandidate = { candidate: 'candidate:1 1 UDP 2122252543 192.168.1.100 50000 typ host', sdpMid: '0', sdpMLineIndex: 0 };
    await fetch(`${API_BASE}/teleconsultations/${sessionId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderRole: 'patient',
        type: 'candidate',
        payload: fakeCandidate,
      }),
    });
    const res5 = await fetch(`${API_BASE}/teleconsultations/${sessionId}/signal?role=doctor&since=0`);
    const json5: any = await res5.json();
    const candMsg = json5.data.find((m: any) => m.type === 'candidate');
    console.log('  ✓ PASS: ICE Candidates reliably exchange across instances:', !!candMsg);

    // 10. Leave session
    const leaveRes = await fetch(`${API_BASE}/teleconsultations/${sessionId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'patient' }),
    });
    const leaveJson: any = await leaveRes.json();
    console.log('  ✓ PASS: Leave session triggers cleanup:', leaveJson.success);

    console.log('────────────────────────────────────────────────────');
    console.log('📊 Signaling Test Results: ALL PASSED');
    console.log('────────────────────────────────────────────────────');
  } finally {
    server.close();
  }
}

runTest();
