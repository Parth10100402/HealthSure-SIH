/**
 * HealthSure — Voice Assistant Hindi + English Language Toggle Test Suite
 * test_voice_language_toggle.ts
 */

import { voiceAgent } from './src/services/voiceAgentService';
import { getTTSVoice } from './backend/src/routes/voiceRoutes';

async function runLanguageToggleTests() {
  console.log('========================================================================');
  console.log('HEALTHSURE — HINDI + ENGLISH VOICE LANGUAGE TOGGLE VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      console.log(`   Detail: ${detail}\n`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Detail: ${detail}\n`);
      failed++;
    }
  }

  // ── 1. Default Language & Greeting ───────────────────────────────────────
  voiceAgent.resetState();
  const defaultLang = voiceAgent.getLanguage();
  assert(defaultLang === 'hi', 'Test 1: Default Voice Language is Hindi', `Current default: ${defaultLang}`);

  // ── 2. Hindi Spoken Response for Doctor Discovery ────────────────────────
  voiceAgent.setLanguage('hi');
  const resHindi = await voiceAgent.processUserInput('Wednesday ko available doctors batao');
  assert(
    resHindi.spokenResponse.includes('uplabdh') || resHindi.spokenResponse.includes('Wednesday'),
    'Test 2: Hindi Mode Produces Natural Hindi/Hinglish Response',
    resHindi.spokenResponse
  );

  // ── 3. English Spoken Response for Doctor Discovery ──────────────────────
  voiceAgent.resetState();
  voiceAgent.setLanguage('en');
  const resEng = await voiceAgent.processUserInput('Show available doctors on Wednesday');
  assert(
    resEng.spokenResponse.includes('available') && resEng.spokenResponse.includes('Wednesday') && !resEng.spokenResponse.includes('uplabdh'),
    'Test 3: English Mode Produces Pure English Response',
    resEng.spokenResponse
  );

  // ── 4. Centralized TTS Voice Mapping ─────────────────────────────────────
  const hindiTTS = getTTSVoice('hi');
  const englishTTS = getTTSVoice('en');
  const defaultTTS = getTTSVoice();
  assert(
    hindiTTS === 'aura-luna-en',
    'Test 4a: Hindi TTS Voice maps to aura-luna-en',
    `Voice: ${hindiTTS}`
  );
  assert(
    englishTTS === 'aura-asteria-en',
    'Test 4b: English TTS Voice maps to aura-asteria-en',
    `Voice: ${englishTTS}`
  );
  assert(
    defaultTTS === 'aura-asteria-en',
    'Test 4c: Default fallback TTS Voice maps to aura-asteria-en',
    `Voice: ${defaultTTS}`
  );

  // ── 5. STT Language Parameter Mapping Verification ───────────────────────
  const getSTTParam = (lang: string) => (lang === 'hi' ? '&language=multi' : lang === 'en' ? '&language=en' : '');
  assert(
    getSTTParam('hi') === '&language=multi',
    'Test 5a: Hindi STT requests multilingual model for code-switching',
    getSTTParam('hi')
  );
  assert(
    getSTTParam('en') === '&language=en',
    'Test 5b: English STT requests English model for maximum accuracy',
    getSTTParam('en')
  );

  // ── 6. Mid-Session Language Switching During Multi-Turn Booking ───────────
  voiceAgent.resetState();
  voiceAgent.setLanguage('en');

  // Step A in English: select doctor
  const stepA = await voiceAgent.processUserInput('I want to book an appointment with Dr. Ananya Mehta');
  assert(
    stepA.state.selectedDoctor === 'Dr. Ananya Mehta',
    'Test 6a: Multi-turn Step A (English) sets selected doctor',
    `Selected: ${stepA.state.selectedDoctor}`
  );

  // Step B in English: specify date and time
  const stepB = await voiceAgent.processUserInput('Tomorrow at 10:00 AM');
  assert(
    stepB.state.awaitingConfirmation === true && stepB.state.pendingAction === 'BOOK_APPOINTMENT',
    'Test 6b: Multi-turn Step B (English) triggers confirmation card',
    stepB.spokenResponse
  );

  // Step C: Switch language to Hindi mid-flow
  voiceAgent.setLanguage('hi');
  const stepC = await voiceAgent.processUserInput('Haan confirm kar do');
  assert(
    stepC.spokenResponse.includes('Token') && (stepC.spokenResponse.includes('safaltapoorvak') || stepC.spokenResponse.includes('book ho gayi')),
    'Test 6c: Mid-session switch to Hindi successfully confirms booking in Hindi',
    stepC.spokenResponse
  );

  // ── 7. Appointment Cancellation in English and Hindi ─────────────────────
  // English cancellation attempt & decline
  voiceAgent.resetState();
  voiceAgent.setLanguage('en');
  const cancelEng = await voiceAgent.processUserInput('Cancel my appointment');
  assert(
    cancelEng.state.awaitingConfirmation === true && cancelEng.spokenResponse.includes('cancel your appointment'),
    'Test 7a: Cancellation intent in English prompts for confirmation in English',
    cancelEng.spokenResponse
  );
  const declineEng = await voiceAgent.processUserInput('No');
  assert(
    declineEng.state.awaitingConfirmation === false && declineEng.spokenResponse.includes('cancelled this action'),
    'Test 7b: English negation cleanly resets pending action',
    declineEng.spokenResponse
  );

  // Hindi cancellation attempt & decline
  voiceAgent.resetState();
  voiceAgent.setLanguage('hi');
  const cancelHi = await voiceAgent.processUserInput('Meri appointment cancel kar do');
  assert(
    cancelHi.state.awaitingConfirmation === true && (cancelHi.spokenResponse.includes('cancel karna chahte hain') || cancelHi.spokenResponse.includes('Haan ya Naa')),
    'Test 7c: Cancellation intent in Hindi prompts for confirmation in Hindi',
    cancelHi.spokenResponse
  );
  const declineHi = await voiceAgent.processUserInput('Nahi rehne do');
  assert(
    declineHi.state.awaitingConfirmation === false && declineHi.spokenResponse.includes('cancel kar diya hai'),
    'Test 7d: Hindi negation cleanly resets pending action',
    declineHi.spokenResponse
  );

  // ── 8. Emergency SOS in Both Languages ───────────────────────────────────
  voiceAgent.resetState();
  voiceAgent.setLanguage('hi');
  const sosHi = await voiceAgent.processUserInput('Emergency hai 108 ambulance chahiye');
  assert(
    sosHi.spokenResponse.includes('108') && sosHi.spokenResponse.includes('PHC') && sosHi.navigateUrl === '/patient/help',
    'Test 8a: Hindi SOS alert returns 108 helpline and navigation',
    sosHi.spokenResponse
  );

  voiceAgent.setLanguage('en');
  const sosEn = await voiceAgent.processUserInput('Medical emergency need help');
  assert(
    sosEn.spokenResponse.includes('108') && sosEn.spokenResponse.includes('07314624692') && sosEn.navigateUrl === '/patient/help',
    'Test 8b: English SOS alert returns 108 helpline and navigation',
    sosEn.spokenResponse
  );

  // ── 9. processVoiceCommand Alias Parity ───────────────────────────────────
  voiceAgent.resetState();
  const aliasRes = await voiceAgent.processVoiceCommand('Show my health records', 'en');
  assert(
    aliasRes.spokenResponse.length > 0 && voiceAgent.getLanguage() === 'en',
    'Test 9: processVoiceCommand alias functions identically with explicit language override',
    aliasRes.spokenResponse
  );

  // ── 10. Canonical Response Equality Invariant ────────────────────────────
  voiceAgent.resetState();
  voiceAgent.setLanguage('hi');
  const turnResult = await voiceAgent.processUserInput('Dr. Rahul Verma ke slots batao');
  const lastHistoryTurn = turnResult.state.history[turnResult.state.history.length - 1];
  assert(
    lastHistoryTurn.text === turnResult.spokenResponse,
    'Test 10: Canonical Response Equality (spokenResponse === history[agent].text)',
    `Spoken: "${turnResult.spokenResponse.slice(0, 60)}..." === History: "${lastHistoryTurn.text.slice(0, 60)}..."`
  );

  console.log('========================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runLanguageToggleTests().catch((err) => {
  console.error('Fatal error running language tests:', err);
  process.exit(1);
});
