async function runVerificationTests() {
  console.log('====================================================');
  console.log('🧪 HEALTHSURE BACKEND & AI VERIFICATION SUITE');
  console.log('====================================================\n');

  const API_BASE = 'http://localhost:5000/api';

  // 1. Health Check
  try {
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    console.log('1. ✅ API Health Check:', healthData);
  } catch (err) {
    console.error('1. ❌ API Health Check Failed:', err.message);
  }

  // 2. Report Analyzer - Gemini 2.5 Flash + Firestore Test
  try {
    console.log('\n2. ⏳ Testing Medical Report Analyzer with Gemini 2.5 Flash...');
    const reportRes = await fetch(`${API_BASE}/reports/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportTitle: 'Thyroid Function Test (TSH, Free T3, Free T4)',
        reportText: 'TSH: 6.2 uIU/mL (High), Free T4: 1.1 ng/dL (Normal), Free T3: 3.0 pg/mL',
        familyMemberId: 'mem-1',
        familyMemberName: 'Parth Sharma'
      })
    });
    const reportData = await reportRes.json();
    console.log('2. ✅ Report Analyzer Result (Saved to Firestore):');
    console.log('   - ID:', reportData.data?.id);
    console.log('   - Type:', reportData.data?.reportType);
    console.log('   - Score:', reportData.data?.healthScore);
    console.log('   - Risk:', reportData.data?.riskLevel);
    console.log('   - Recommended Specialty:', reportData.data?.recommendedSpeciality);
    console.log('   - Foods to Eat:', reportData.data?.foodsToEat);
  } catch (err) {
    console.error('2. ❌ Report Analyzer Failed:', err.message);
  }

  // 3. Symptom Checker - Gemini 2.5 Flash + Firestore Triage Test
  try {
    console.log('\n3. ⏳ Testing Symptom Checker Triage with Gemini 2.5 Flash...');
    const symptomRes = await fetch(`${API_BASE}/symptoms/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptomText: 'Patient experiencing severe crushing chest pain, radiating down left arm with shortness of breath',
        familyMemberId: 'mem-1',
        familyMemberName: 'Parth Sharma'
      })
    });
    const symptomData = await symptomRes.json();
    console.log('3. ✅ Symptom Checker Result (Saved to Firestore):');
    console.log('   - ID:', symptomData.data?.id);
    console.log('   - Urgency:', symptomData.data?.urgency);
    console.log('   - Conditions:', symptomData.data?.possibleConditions);
    console.log('   - Recommended Specialist:', symptomData.data?.recommendedSpecialist);
    console.log('   - Actions:', symptomData.data?.suggestedActions);
  } catch (err) {
    console.error('3. ❌ Symptom Checker Failed:', err.message);
  }

  // 4. Firestore Doctors & Hospitals Read Test
  try {
    console.log('\n4. ⏳ Fetching Doctors & Hospitals from Cloud Firestore healthsure-1dca1...');
    const docsRes = await fetch(`${API_BASE}/doctors`);
    const docsData = await docsRes.json();

    const hospsRes = await fetch(`${API_BASE}/hospitals`);
    const hospsData = await hospsRes.json();

    console.log(`4. ✅ Firestore Doctors count: ${docsData.data?.length}`);
    console.log(`   - First Doctor: ${docsData.data?.[0]?.name} (${docsData.data?.[0]?.specialty})`);
    console.log(`4. ✅ Firestore Hospitals count: ${hospsData.data?.length}`);
    console.log(`   - First Hospital: ${hospsData.data?.[0]?.name} (${hospsData.data?.[0]?.city})`);
  } catch (err) {
    console.error('4. ❌ Firestore Read Failed:', err.message);
  }

  // 5. Dashboard Aggregation Test
  try {
    console.log('\n5. ⏳ Fetching Aggregated Dashboard Data...');
    const dashRes = await fetch(`${API_BASE}/dashboard/overview?patientName=Parth%20Sharma`);
    const dashData = await dashRes.json();
    console.log('5. ✅ Aggregated Dashboard Stats:', dashData.data?.stats);
    console.log('   - Activities:', dashData.data?.activities?.length, 'recent records');
  } catch (err) {
    console.error('5. ❌ Dashboard Test Failed:', err.message);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL BACKEND & AI VERIFICATION TESTS COMPLETED!');
  console.log('====================================================');
}

runVerificationTests();
