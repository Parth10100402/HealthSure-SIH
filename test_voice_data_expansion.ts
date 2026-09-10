/**
 * HealthSure — Voice Data Expansion Verification Script
 * test_voice_data_expansion.ts
 *
 * Tests the 15 Section 13 queries against the expanded demo healthcare data:
 * 1. "Friday ko kaunse doctors available hain?"
 * 2. "Friday ko cardiologist kaun available hai?"
 * 3. "Saturday ko kaunse specialists available hain?"
 * 4. "Monday morning kaunse doctor milenge?"
 * 5. "Friday evening kaunse doctor available hain?"
 * 6. "11 baje kaunse doctor ke slots khali hain?"
 * 7. "Dr. Ananya ke Friday ke slots batao"
 * 8. "Dr. Rahul Verma ka sabse pehla slot kab hai?"
 * 9. "Friday ko sabse pehle kaunsa doctor available hai?"
 * 10. "Weekend par skin doctor milega kya?"
 * 11. "Next Wednesday ko heart specialist available hai?"
 * 12. "PHC Khed mein Friday ko kaunsa doctor hai?"
 * 13. "Friday ko teleconsultation ke liye kaun available hai?"
 * 14. "Saturday ko outreach camp kahan hai?"
 * 15. "Mujhe 3 baje Friday ko appointment chahiye"
 * 16. Multi-turn booking of a discovered slot with token verification
 */

import { voiceAgent } from './src/services/voiceAgentService';
import { patientService } from './src/services/patientService';

async function runDataExpansionTests() {
  console.log('========================================================================');
  console.log('HEALTHSURE EXPANDED DEMO HEALTHCARE DATA — VOICE QUERY VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      console.log(`   Response: ${detail}\n`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Detail: ${detail}\n`);
      failed++;
    }
  }

  // 1. Friday doctors query
  voiceAgent.resetState();
  const q1 = await voiceAgent.processUserInput('Friday ko kaunse doctors available hain?');
  assert(
    q1.spokenResponse.includes('Friday') && (q1.spokenResponse.includes('16') || q1.spokenResponse.includes('doctor')) && (q1.actionCard?.data?.doctors?.length ?? 0) > 0,
    'Query 1: Friday available doctors',
    q1.spokenResponse
  );

  // 2. Friday cardiologist query
  voiceAgent.resetState();
  const q2 = await voiceAgent.processUserInput('Friday ko cardiologist kaun available hai?');
  assert(
    (q2.spokenResponse.includes('Ananya') || q2.spokenResponse.includes('Amit')) && q2.spokenResponse.includes('Cardiology'),
    'Query 2: Friday cardiologist',
    q2.spokenResponse
  );

  // 3. Saturday specialists query
  voiceAgent.resetState();
  const q3 = await voiceAgent.processUserInput('Saturday ko kaunse specialists available hain?');
  assert(
    q3.spokenResponse.includes('Saturday') && (q3.actionCard?.data?.doctors?.length ?? 0) > 0,
    'Query 3: Saturday specialists',
    q3.spokenResponse
  );

  // 4. Monday morning doctors query
  voiceAgent.resetState();
  const q4 = await voiceAgent.processUserInput('Monday morning kaunse doctor milenge?');
  assert(
    (q4.spokenResponse.includes('Monday') || q4.spokenResponse.includes('subah')) && (q4.actionCard?.data?.doctors?.length ?? 0) > 0,
    'Query 4: Monday morning doctors',
    q4.spokenResponse
  );

  // 5. Friday evening doctors query
  voiceAgent.resetState();
  const q5 = await voiceAgent.processUserInput('Friday evening kaunse doctor available hain?');
  assert(
    (q5.spokenResponse.includes('Friday') || q5.spokenResponse.includes('shaam')) && (q5.actionCard?.data?.doctors?.length ?? 0) > 0,
    'Query 5: Friday evening doctors',
    q5.spokenResponse
  );

  // 6. 11 AM slots query
  voiceAgent.resetState();
  const q6 = await voiceAgent.processUserInput('11 baje kaunse doctor ke slots khali hain?');
  assert(
    q6.spokenResponse.includes('11:00 AM') && (q6.actionCard?.data?.doctors?.length ?? 0) > 0,
    'Query 6: 11 AM available doctor slots',
    q6.spokenResponse
  );

  // 7. Dr. Ananya's Friday slots query
  voiceAgent.resetState();
  const q7 = await voiceAgent.processUserInput('Dr. Ananya ke Friday ke slots batao');
  assert(
    q7.spokenResponse.includes('Ananya') && q7.spokenResponse.includes('Friday') && (q7.spokenResponse.includes('10:00 AM') || q7.spokenResponse.includes('11:00 AM')),
    'Query 7: Dr. Ananya Friday slots & occupancy',
    q7.spokenResponse
  );

  // 8. Dr. Rahul Verma earliest slot
  voiceAgent.resetState();
  const q8 = await voiceAgent.processUserInput('Dr. Rahul Verma ka sabse pehla slot kab hai?');
  assert(
    q8.spokenResponse.includes('Rahul Verma') && (q8.spokenResponse.includes('09:00 AM') || q8.spokenResponse.includes('pehla slot')),
    'Query 8: Dr. Rahul Verma earliest slot',
    q8.spokenResponse
  );

  // 9. Earliest doctor on Friday
  voiceAgent.resetState();
  const q9 = await voiceAgent.processUserInput('Friday ko sabse pehle kaunsa doctor available hai?');
  assert(
    q9.spokenResponse.includes('Friday') && (q9.spokenResponse.includes('09:00 AM') || q9.spokenResponse.includes('pehle')),
    'Query 9: Friday earliest doctor',
    q9.spokenResponse
  );

  // 10. Weekend skin doctor query
  voiceAgent.resetState();
  const q10 = await voiceAgent.processUserInput('Weekend par skin doctor milega kya?');
  assert(
    q10.spokenResponse.includes('Priya Shah') || q10.spokenResponse.includes('Dermatology'),
    'Query 10: Weekend skin doctor',
    q10.spokenResponse
  );

  // 11. Next Wednesday heart specialist query
  voiceAgent.resetState();
  const q11 = await voiceAgent.processUserInput('Next Wednesday ko heart specialist available hai?');
  assert(
    (q11.spokenResponse.includes('Ananya') || q11.spokenResponse.includes('Cardiology')) && q11.spokenResponse.includes('Wednesday'),
    'Query 11: Next Wednesday heart specialist',
    q11.spokenResponse
  );

  // 12. PHC Khed Friday doctor query
  voiceAgent.resetState();
  const q12 = await voiceAgent.processUserInput('PHC Khed mein Friday ko kaunsa doctor hai?');
  assert(
    q12.spokenResponse.includes('PHC Khed') && (q12.spokenResponse.includes('Rajesh Patil') || q12.spokenResponse.includes('Rahul Shah')),
    'Query 12: PHC Khed Friday doctors',
    q12.spokenResponse
  );

  // 13. Friday teleconsultation query
  voiceAgent.resetState();
  const q13 = await voiceAgent.processUserInput('Friday ko teleconsultation ke liye kaun available hai?');
  assert(
    q13.spokenResponse.includes('teleconsultation') && (q13.actionCard?.data?.doctors?.length ?? 0) > 0,
    'Query 13: Friday teleconsultation availability',
    q13.spokenResponse
  );

  // 14. Saturday outreach camp query
  voiceAgent.resetState();
  const q14 = await voiceAgent.processUserInput('Saturday ko outreach camp kahan hai?');
  assert(
    (q14.spokenResponse.includes('Saturday') || q14.spokenResponse.includes('Specialist Outreach')) && (q14.actionCard?.data?.outreach?.length ?? 0) > 0,
    'Query 14: Saturday outreach camp',
    q14.spokenResponse
  );

  // 15. Friday 3 PM slot request
  voiceAgent.resetState();
  const q15 = await voiceAgent.processUserInput('Mujhe 3 baje Friday ko appointment chahiye');
  assert(
    q15.spokenResponse.includes('Friday') && (q15.spokenResponse.includes('03:00 PM') || q15.spokenResponse.includes('doctor')),
    'Query 15: Friday 3 PM slot request',
    q15.spokenResponse
  );

  // 16. Multi-turn booking of Friday 3 PM slot with Dr. Rahul Verma
  const q16a = await voiceAgent.processUserInput('Dr. Rahul Verma');
  assert(
    q16a.spokenResponse.includes('Rahul Verma') && q16a.spokenResponse.includes('03:00 PM') && q16a.state.awaitingConfirmation,
    'Query 16a: Multi-turn appointment preparation',
    q16a.spokenResponse
  );

  const q16b = await voiceAgent.processUserInput('Haan book kar do');
  assert(
    q16b.spokenResponse.includes('safaltapoorvak') && q16b.spokenResponse.includes('Token'),
    'Query 16b: Appointment confirmed and booked with real token',
    q16b.spokenResponse
  );

  // 17. Verify booking appears in appointment queue
  const apts = await patientService.getAppointments();
  const bookedApt = apts.find((a) => a.doctorName.includes('Rahul Verma') && a.time === '03:00 PM');
  assert(
    Boolean(bookedApt),
    'Query 17: Booked appointment verified in patient queue',
    `Found appointment ID: ${bookedApt?.id}, Token: ${bookedApt?.tokenNumber}`
  );

  console.log('========================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDataExpansionTests().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
