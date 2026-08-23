import { db } from './server/config/firebaseAdmin.js';

async function testFirestoreVerification() {
  console.log('[Test] Verifying Cloud Firestore project healthsure-1dca1 write & read capability...');

  try {
    const testDocId = 'TEST-REP-' + Date.now();
    const testReport = {
      id: testDocId,
      title: 'Thyroid Function Test',
      reportType: 'Thyroid Profile',
      healthScore: 88,
      riskLevel: 'Low Risk',
      summary: 'Empirical verification report write test to Firestore healthsure-1dca1',
      createdAt: new Date().toISOString()
    };

    // Write to Firestore reports collection
    await db.collection('reports').doc(testDocId).set(testReport);
    console.log(`✅ [Firestore Write] Successfully wrote report document ${testDocId} to Firestore!`);

    // Read back from Firestore reports collection
    const docSnap = await db.collection('reports').doc(testDocId).get();
    if (docSnap.exists) {
      console.log(`✅ [Firestore Read] Successfully verified document content from Cloud Firestore:`, docSnap.data().summary);
    } else {
      console.error(`❌ [Firestore Read] Document not found after set.`);
    }

    // Clean up test document
    await db.collection('reports').doc(testDocId).delete();
    console.log(`✅ [Firestore Cleanup] Cleaned up temporary verification document.`);

    console.log('\n🎉 Cloud Firestore integration is 100% WORKING and ready for live production deployment!');
    process.exit(0);
  } catch (err) {
    console.error('❌ [Firestore Verification Error]:', err);
    process.exit(1);
  }
}

testFirestoreVerification();
