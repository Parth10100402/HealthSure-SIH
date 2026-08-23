import express from 'express';
import { db } from '../config/firebaseAdmin.js';

const router = express.Router();

// GET /api/family-members
router.get('/family-members', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('familyMembers').get();
      if (!snapshot.empty) {
        const members = snapshot.docs.map(doc => doc.data());
        return res.json({ success: true, data: members });
      }
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    console.error('[familyRoutes] Error fetching family members:', error);
    return res.status(500).json({ success: false, message: 'Error fetching family members' });
  }
});

// POST /api/family-members
router.post('/family-members', async (req, res) => {
  try {
    const member = req.body;
    if (!member.id) member.id = 'mem-' + Date.now();
    member.updatedAt = new Date().toISOString();

    if (db) {
      await db.collection('familyMembers').doc(member.id).set(member, { merge: true });
      console.log(`[familyRoutes] Family member ${member.name} (${member.id}) saved to Firestore`);
    }

    return res.json({ success: true, data: member });
  } catch (error) {
    console.error('[familyRoutes] Error saving family member:', error);
    return res.status(500).json({ success: false, message: 'Error saving family member' });
  }
});

export default router;
