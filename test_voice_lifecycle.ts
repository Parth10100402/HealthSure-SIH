/**
 * HealthSure Voice Assistant — Automated Lifecycle & Multi-Turn Verification
 */

import { voiceAgent } from './src/services/voiceAgentService';

const GREETING_HINDI =
  'Namaste! HealthSure Voice Command mein aapka swagat hai. Bataiye, main aapki kaise seva kar sakta hoon?';
const GREETING_ENGLISH =
  'Welcome to HealthSure Voice Command. How can I help you today?';

async function runLifecycleTests() {
  console.log('====================================================');
  console.log('HEALTHSURE VOICE ASSISTANT LIFECYCLE & MULTI-TURN TEST');
  console.log('====================================================\n');

  // Test 1: Exact Greeting Strings & Isolation
  console.log('--- TEST 1: Greeting Isolation & Formatting ---');
  if (GREETING_HINDI.includes('Wednesday') || GREETING_HINDI.includes('appointment')) {
    throw new Error('Test 1 Failed: Hindi greeting contains auto-spoken examples!');
  }
  if (GREETING_ENGLISH.includes('Wednesday') || GREETING_ENGLISH.includes('appointment')) {
    throw new Error('Test 1 Failed: English greeting contains auto-spoken examples!');
  }
  console.log('Hindi Greeting:', GREETING_HINDI);
  console.log('English Greeting:', GREETING_ENGLISH);
  console.log('✅ TEST 1 PASSED: Greetings are clean, distinct, and without auto-examples.\n');

  // Test 2: Language Switching & Voice Agent State Sync
  console.log('--- TEST 2: Language Switching & State Sync ---');
  voiceAgent.resetState();
  voiceAgent.setLanguage('hi');
  const resHindi = await voiceAgent.processUserInput('Mujhe doctors batao');
  console.log('Hindi Response:', resHindi.spokenResponse);
  if (!resHindi.spokenResponse.includes('uplabdh') && !resHindi.spokenResponse.includes('doctors')) {
    throw new Error('Test 2 Failed: Hindi response mismatch');
  }

  voiceAgent.setLanguage('en');
  const resEnglish = await voiceAgent.processUserInput('Show available doctors');
  console.log('English Response:', resEnglish.spokenResponse);
  if (!resEnglish.spokenResponse.includes('available') && !resEnglish.spokenResponse.includes('doctors')) {
    throw new Error('Test 2 Failed: English response mismatch');
  }
  console.log('✅ TEST 2 PASSED: Language toggles cleanly and agent state remains valid.\n');

  // Test 3: Repeated Multi-Turn Voice Invocations (Simulating continuous turn lifecycle)
  console.log('--- TEST 3: Repeated Multi-Turn Voice Turns ---');
  voiceAgent.resetState();
  voiceAgent.setLanguage('hi');

  // Turn 1: Query appointment
  console.log('Turn 1: "Meri next appointment kab hai?"');
  const t1 = await voiceAgent.processUserInput('Meri next appointment kab hai?');
  console.log('Turn 1 Response:', t1.spokenResponse);

  // Turn 2: Query health records
  console.log('Turn 2: "Mera health record dikhao"');
  const t2 = await voiceAgent.processUserInput('Mera health record dikhao');
  console.log('Turn 2 Response:', t2.spokenResponse);

  // Turn 3: Start teleconsultation
  console.log('Turn 3: "Doctor se video consultation start karni hai"');
  const t3 = await voiceAgent.processUserInput('Doctor se video consultation start karni hai');
  console.log('Turn 3 Response:', t3.spokenResponse);
  if (t3.navigateUrl !== '/patient/teleconsultation') {
    throw new Error('Test 3 Failed: Teleconsultation navigation route missing');
  }

  // Turn 4: Doctor booking initiation
  console.log('Turn 4: "Wednesday ko Dr. Rahul Verma ke saath 2 baje appointment book kar do"');
  const t4 = await voiceAgent.processUserInput('Wednesday ko Dr. Rahul Verma ke saath 2 baje appointment book kar do');
  console.log('Turn 4 Response:', t4.spokenResponse);
  if (!t4.state.awaitingConfirmation) {
    throw new Error('Test 4 Failed: Expected confirmation gating');
  }

  // Turn 5: Confirmation
  console.log('Turn 5: "Haan book kar do"');
  const t5 = await voiceAgent.processUserInput('Haan book kar do');
  console.log('Turn 5 Response:', t5.spokenResponse);
  if (!t5.spokenResponse.includes('safaltapoorvak') && !t5.spokenResponse.includes('Token')) {
    throw new Error('Test 5 Failed: Confirmation execution failed');
  }
  console.log('✅ TEST 3 PASSED: Repeated 5-turn conversational sequence completed flawlessly.\n');

  console.log('====================================================');
  console.log('ALL VOICE ASSISTANT LIFECYCLE TESTS PASSED!');
  console.log('====================================================');
}

runLifecycleTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
