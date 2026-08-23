// HealthSure — Phase 6A Real SMS OTP Automated Test Suite
// backend/test/otp.test.ts

import { createApp } from '../src/app.js';
import { dataStore } from '../src/db/store.js';
import { smsService } from '../src/services/sms/smsService.js';
import { MockSmsProvider } from '../src/services/sms/mockSmsProvider.js';
import { Fast2SmsProvider } from '../src/services/sms/fast2SmsProvider.js';
import { ExotelSmsProvider } from '../src/services/sms/exotelSmsProvider.js';
import { TwilioSmsProvider } from '../src/services/sms/twilioSmsProvider.js';
import bcrypt from 'bcryptjs';

let server: any;
let baseUrl: string;

async function runOtpTests() {
  process.env.SMS_PROVIDER = 'mock';
  console.log('────────────────────────────────────────────────────');
  console.log('🧪 Running HealthSure Phase 6A SMS OTP Test Suite');
  console.log('────────────────────────────────────────────────────');

  await dataStore.initialize();
  const app = createApp();

  const PORT = 5087;
  baseUrl = `http://localhost:${PORT}/api`;
  server = app.listen(PORT);

  let passed = 0;
  let failed = 0;

  async function test(title: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${title}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${title} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Send OTP to registered patient mobile
  await test('POST /api/auth/send-otp sends OTP to registered mobile (+91 9876543210)', async () => {
    const res = await fetch(`${baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210' }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to send OTP');
    if (json.otp) throw new Error('SECURITY VIOLATION: OTP was returned in API response!');
    if (json.expiresIn !== 300) throw new Error(`Expected expiresIn: 300, got ${json.expiresIn}`);
  });

  // 2. Resend cooldown (< 60s) returns 429
  await test('POST /api/auth/send-otp enforces 60s resend cooldown', async () => {
    const res = await fetch(`${baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210' }),
    });
    if (res.status !== 429) throw new Error(`Expected 429 Too Many Requests, got ${res.status}`);
    const json = await res.json();
    if (!json.cooldownRemaining) throw new Error('Missing cooldownRemaining in response');
  });

  // 3. Unregistered mobile returns 404
  await test('POST /api/auth/send-otp rejects unregistered mobile numbers with 404', async () => {
    const res = await fetch(`${baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9999900000' }),
    });
    if (res.status !== 404) throw new Error(`Expected 404 Not Found, got ${res.status}`);
    const json = await res.json();
    if (!json.message.includes('not registered')) throw new Error(`Unexpected message: ${json.message}`);
  });

  // 4. Incorrect OTP verification increments attempts and returns remaining attempts
  await test('POST /api/auth/verify-otp rejects incorrect OTP and reports remaining attempts', async () => {
    const res = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', otp: '000000' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    const json = await res.json();
    if (json.attemptsRemaining !== 4) throw new Error(`Expected 4 attempts remaining, got ${json.attemptsRemaining}`);
  });

  // 5. Exceeding 5 failed attempts blocks the session with 429
  await test('POST /api/auth/verify-otp blocks session after 5 failed attempts with 429', async () => {
    for (let i = 0; i < 4; i++) {
      await fetch(`${baseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '9876543210', otp: '000000' }),
      });
    }
    const res = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', otp: '000000' }),
    });
    if (res.status !== 429) throw new Error(`Expected 429 Too Many Requests, got ${res.status}`);
    const json = await res.json();
    if (!json.message.includes('blocked') && !json.message.includes('Too many')) {
      throw new Error(`Unexpected message: ${json.message}`);
    }
  });

  // 6. Expired OTP is rejected
  await test('POST /api/auth/verify-otp rejects expired OTP sessions', async () => {
    // Manually create expired session in store
    const session = await dataStore.createOrUpdateOtpSession('9876543210', '123456', -10, 5);
    session.expiresAt = new Date(Date.now() - 10000); // 10s in the past

    const res = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', otp: '123456' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request for expired OTP, got ${res.status}`);
    const json = await res.json();
    if (!json.message.includes('expired')) throw new Error(`Unexpected message: ${json.message}`);
  });

  // 7. Correct OTP verifies and returns valid JWT session
  let patientToken = '';
  await test('POST /api/auth/verify-otp verifies valid OTP and returns JWT token', async () => {
    // Create known OTP session
    await dataStore.createOrUpdateOtpSession('9876543210', '789123', 300, 5);

    const res = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', otp: '789123', role: 'patient' }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.token) throw new Error(json.message || 'Verification failed');
    patientToken = json.token;
    if (json.user.role !== 'patient') throw new Error(`Expected patient role, got ${json.user.role}`);
  });

  // 8. Patient authenticated via OTP can access protected patient APIs
  await test('Patient authenticated via OTP can access GET /api/patients/me', async () => {
    const res = await fetch(`${baseUrl}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data.patientId !== 'HS-10248') {
      throw new Error(`Expected HS-10248, got ${json.data?.patientId}`);
    }
  });

  // 9. Provider abstraction error handling when unconfigured
  await test('SMS Providers handle unconfigured credentials safely', async () => {
    const fast2sms = new Fast2SmsProvider();
    const exotel = new ExotelSmsProvider();
    const twilio = new TwilioSmsProvider();

    const fRes = await fast2sms.sendOtp('9876543210', '123456');
    const eRes = await exotel.sendOtp('9876543210', '123456');
    const tRes = await twilio.sendOtp('9876543210', '123456');

    if (fRes.success || eRes.success || tRes.success) {
      throw new Error('Unconfigured provider should not claim success!');
    }
    if (!fRes.error || !eRes.error || !tRes.error) {
      throw new Error('Missing error description from unconfigured providers');
    }
  });

  // 10. Existing password login continues to work alongside OTP
  await test('Existing password login continues to work for all roles', async () => {
    const pRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya@example.com', password: 'demo1234', role: 'patient' }),
    });
    if (!pRes.ok) throw new Error('Patient password login broken');

    const dRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'dr.rajesh@healthsure.org', password: 'demo1234', role: 'doctor' }),
    });
    if (!dRes.ok) throw new Error('Doctor password login broken');
  });

  // 11. Fast2SMS Quick SMS provider validation
  await test('Fast2SMS Quick SMS provider rejects invalid numbers and handles errors safely', async () => {
    const fast2sms = new Fast2SmsProvider();
    // Test invalid number validation
    process.env.SMS_API_KEY = 'test-dummy-key';
    process.env.FAST2SMS_ROUTE = 'q';
    
    const invalidNumRes = await fast2sms.sendOtp('123', '123456');
    if (invalidNumRes.success) throw new Error('Expected failure on invalid mobile format');
    if (!invalidNumRes.error?.includes('10-digit')) throw new Error('Expected 10-digit validation error');

    // Clean up test env
    delete process.env.SMS_API_KEY;
  });

  // 12. Registration OTP rejects already registered mobile numbers
  await test('POST /api/auth/send-otp (purpose: registration) rejects existing registered mobile', async () => {
    const res = await fetch(`${baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '+91 9876543210', purpose: 'registration' }),
    });
    if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    const json = await res.json();
    if (!json.message.includes('already registered')) throw new Error(`Unexpected message: ${json.message}`);
  });

  // 13. Registration OTP allows new unregistered mobile numbers
  const newPatientMobile = '9876599999';
  await test('POST /api/auth/send-otp (purpose: registration) sends OTP to new mobile', async () => {
    const res = await fetch(`${baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: `+91-${newPatientMobile}`, purpose: 'registration' }),
    });
    if (!res.ok) throw new Error(`Registration send-otp failed: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  });

  // 14. Registration fails with invalid OTP and creates NO account
  await test('POST /api/auth/register-with-otp rejects incorrect OTP without creating account', async () => {
    const res = await fetch(`${baseUrl}/auth/register-with-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test New Patient',
        phone: newPatientMobile,
        otp: '000000',
        village: 'Chiplun',
      }),
    });
    if (res.ok) throw new Error('Registration should NOT succeed with invalid OTP!');
    const json = await res.json();
    if (!json.message.includes('Invalid OTP')) throw new Error(`Unexpected message: ${json.message}`);

    // Verify user was NOT created
    const createdUser = dataStore.users.find((u) => u.phone?.includes(newPatientMobile));
    if (createdUser) throw new Error('SECURITY VIOLATION: Account was created despite invalid OTP!');
  });

  // 15. Registration succeeds with valid OTP and normalizes +91
  await test('POST /api/auth/register-with-otp creates verified account with valid OTP', async () => {
    // Seed valid OTP for new patient
    await dataStore.createOrUpdateOtpSession(newPatientMobile, '654321', 300, 5);

    const res = await fetch(`${baseUrl}/auth/register-with-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikas Patil',
        phone: `+91 ${newPatientMobile}`,
        otp: '654321',
        village: 'Guhagar',
        preferredLanguage: 'mr',
      }),
    });
    if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.token || !json.user) throw new Error('Invalid response payload');
    if (json.user.role !== 'patient') throw new Error(`Expected patient role, got ${json.user.role}`);

    // Verify in database
    const createdUser = dataStore.users.find((u) => u.phone?.includes(newPatientMobile));
    if (!createdUser) throw new Error('User not found in database');
    const createdPatient = dataStore.patients.find((p) => p.userId === createdUser.id);
    if (!createdPatient || !createdPatient.patientId.startsWith('HS-')) {
      throw new Error('Patient record or Health ID missing');
    }
  });

  // 16. DEMO_MODE=true OTP flow
  await test('DEMO_MODE=true allows instant zero-credit OTP verification for judges and demo users', async () => {
    process.env.DEMO_MODE = 'true';
    const demoMobile = '9876543210';
    
    // Request OTP in demo mode
    const res = await fetch(`${baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: demoMobile, purpose: 'login' }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
    if (!json.demoMode) throw new Error('Expected demoMode: true');
    if (!json.demoOtp || json.demoOtp.length !== 6) throw new Error('Expected 6-digit demoOtp in demo mode');

    // Verify OTP using the returned demo code
    const vRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: demoMobile, otp: json.demoOtp, role: 'patient' }),
    });
    const vJson = await vRes.json();
    if (!vRes.ok || !vJson.success || !vJson.token) throw new Error(vJson.message);
  });

  console.log('────────────────────────────────────────────────────');
  console.log(`📊 OTP Test Results: ${passed} passed, ${failed} failed.`);
  console.log('────────────────────────────────────────────────────');

  server.close();
  if (failed > 0) process.exit(1);
}

runOtpTests().catch((err) => {
  console.error('Test Runner Error:', err);
  if (server) server.close();
  process.exit(1);
});
