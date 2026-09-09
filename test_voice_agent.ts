/**
 * Automated Verification Script for HealthSure Voice Healthcare Agent
 *
 * Tests the full conversational flow:
 * 1. Discover doctors for Wednesday ("Mujhe Wednesday ko available doctors batao")
 * 2. Multi-turn booking flow with slot accumulation:
 *    - "Ananya ke saath 11 baje appointment book kar do" -> Asks for confirmation
 *    - "Haan" -> Confirms, books real appointment, generates token
 * 3. Verify real appointment appears in appointment list
 * 4. Cancellation flow with confirmation safety check:
 *    - "Appointment cancel kar do" -> Asks confirmation
 *    - "Haan" -> Confirms cancellation
 * 5. Health records lookup: "Mera health record dikhao"
 * 6. Referral lookup: "Meri referral status kya hai"
 * 7. Teleconsultation trigger: "Doctor se video consultation start karni hai"
 * 8. Emergency detection: "Emergency hai madad karo"
 */

import { voiceAgent } from './src/services/voiceAgentService';
import { patientService } from './src/services/patientService';

async function runTests() {
  console.log('====================================================');
  console.log('HEALTHSURE VOICE HEALTHCARE AGENT AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  voiceAgent.resetState();
  voiceAgent.setLanguage('hi');

  // TEST 1: Doctor Discovery on Wednesday
  console.log('--- TEST 1: Doctor Discovery ("Mujhe Wednesday ko available doctors batao") ---');
  const res1 = await voiceAgent.processUserInput('Mujhe Wednesday ko available doctors batao');
  console.log('Agent Response:', res1.spokenResponse);
  console.log('Action Card:', res1.actionCard?.type, res1.actionCard?.data?.doctors?.length, 'doctors');
  if (!res1.spokenResponse.includes('Wednesday') || !res1.actionCard?.data?.doctors) {
    throw new Error('Test 1 Failed: Doctors not discovered for Wednesday');
  }
  console.log('✅ TEST 1 PASSED: Real doctors returned from system.\n');

  // TEST 2: Multi-turn Booking - Doctor & Time specified (Date retained from context or extracted)
  console.log('--- TEST 2: Slot Filling ("Ananya ke saath 11 baje appointment book kar do") ---');
  const res2 = await voiceAgent.processUserInput('Ananya ke saath 11 baje appointment book kar do');
  console.log('Agent Response:', res2.spokenResponse);
  console.log('State pendingAction:', res2.state.pendingAction);
  console.log('State awaitingConfirmation:', res2.state.awaitingConfirmation);
  console.log('Action Card Type:', res2.actionCard?.type);
  if (res2.state.pendingAction !== 'BOOK_APPOINTMENT' || !res2.state.awaitingConfirmation) {
    throw new Error('Test 2 Failed: Did not gate booking with confirmation');
  }
  console.log('✅ TEST 2 PASSED: Booking prepared & awaiting confirmation.\n');

  // TEST 3: User Confirms Booking ("Haan")
  console.log('--- TEST 3: Confirmation Execution ("Haan") ---');
  const res3 = await voiceAgent.processUserInput('Haan');
  console.log('Agent Response:', res3.spokenResponse);
  console.log('Navigate URL:', res3.navigateUrl);
  if (!res3.spokenResponse.includes('safaltapoorvak') || !res3.spokenResponse.includes('Token')) {
    throw new Error('Test 3 Failed: Booking execution failed');
  }
  console.log('✅ TEST 3 PASSED: Appointment successfully booked with token.\n');

  // TEST 4: Verify Appointment Lookup ("Meri next appointment kab hai")
  console.log('--- TEST 4: Appointment Lookup ("Meri next appointment kab hai") ---');
  const res4 = await voiceAgent.processUserInput('Meri next appointment kab hai');
  console.log('Agent Response:', res4.spokenResponse);
  if (!res4.spokenResponse.includes('Ananya') && !res4.spokenResponse.includes('Token')) {
    throw new Error('Test 4 Failed: Could not find booked appointment');
  }
  console.log('✅ TEST 4 PASSED: Appointment verified in patient queue.\n');

  // TEST 5: Cancellation Intent with Confirmation Gating
  console.log('--- TEST 5: Cancellation Intent ("Appointment cancel kar do") ---');
  const res5 = await voiceAgent.processUserInput('Appointment cancel kar do');
  console.log('Agent Response:', res5.spokenResponse);
  console.log('Pending Action:', res5.state.pendingAction);
  console.log('Awaiting Confirmation:', res5.state.awaitingConfirmation);
  if (res5.state.pendingAction !== 'CANCEL_APPOINTMENT' || !res5.state.awaitingConfirmation) {
    throw new Error('Test 5 Failed: Cancellation was not gated with confirmation');
  }
  console.log('✅ TEST 5 PASSED: Cancellation confirmation card generated.\n');

  // TEST 6: User Confirms Cancellation ("Haan cancel kar do")
  console.log('--- TEST 6: Confirm Cancellation ("Haan cancel kar do") ---');
  const res6 = await voiceAgent.processUserInput('Haan cancel kar do');
  console.log('Agent Response:', res6.spokenResponse);
  if (!res6.spokenResponse.includes('cancel kar di gayi')) {
    throw new Error('Test 6 Failed: Cancellation execution failed');
  }
  console.log('✅ TEST 6 PASSED: Appointment cancellation successfully executed.\n');

  // TEST 7: Health Records Lookup ("Mera health record dikhao")
  console.log('--- TEST 7: Health Records Lookup ("Mera health record dikhao") ---');
  const res7 = await voiceAgent.processUserInput('Mera health record dikhao');
  console.log('Agent Response:', res7.spokenResponse);
  console.log('Action Card:', res7.actionCard?.type, res7.actionCard?.data?.records?.length, 'records');
  if (res7.actionCard?.type !== 'RECORDS_SUMMARY' || !res7.actionCard?.data?.records?.length) {
    throw new Error('Test 7 Failed: Health records lookup failed');
  }
  console.log('✅ TEST 7 PASSED: Real health records retrieved.\n');

  // TEST 8: Referral Status Query ("Meri referral status kya hai")
  console.log('--- TEST 8: Referral Status Query ("Meri referral status kya hai") ---');
  const res8 = await voiceAgent.processUserInput('Meri referral status kya hai');
  console.log('Agent Response:', res8.spokenResponse);
  console.log('Action Card:', res8.actionCard?.type, res8.actionCard?.data?.id);
  if (res8.actionCard?.type !== 'REFERRAL_CARD' || !res8.actionCard?.data?.id) {
    throw new Error('Test 8 Failed: Referral lookup failed');
  }
  console.log('✅ TEST 8 PASSED: Real referral card retrieved.\n');

  // TEST 9: Teleconsultation Trigger ("Doctor se video consultation start karni hai")
  console.log('--- TEST 9: Teleconsultation Trigger ("Doctor se video consultation start karni hai") ---');
  const res9 = await voiceAgent.processUserInput('Doctor se video consultation start karni hai');
  console.log('Agent Response:', res9.spokenResponse);
  console.log('Navigate URL:', res9.navigateUrl);
  if (res9.navigateUrl !== '/patient/teleconsultation') {
    throw new Error('Test 9 Failed: Teleconsultation navigation failed');
  }
  console.log('✅ TEST 9 PASSED: Teleconsultation session navigation triggered.\n');

  // TEST 10: Emergency SOS ("Emergency hai madad karo")
  console.log('--- TEST 10: Emergency SOS ("Emergency hai madad karo") ---');
  const res10 = await voiceAgent.processUserInput('Emergency hai madad karo');
  console.log('Agent Response:', res10.spokenResponse);
  if (!res10.spokenResponse.includes('108') || !res10.spokenResponse.includes('07314624692')) {
    throw new Error('Test 10 Failed: Emergency trigger did not provide 108 or helpline number');
  }
  console.log('✅ TEST 10 PASSED: Emergency response & helpline provided.\n');

  console.log('====================================================');
  console.log('ALL 10 VOICE HEALTHCARE AGENT TESTS PASSED WITH FLYING COLORS!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('FAILED TEST:', err);
  process.exit(1);
});
