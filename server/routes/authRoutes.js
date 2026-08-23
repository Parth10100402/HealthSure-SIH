import express from 'express';
import { db } from '../config/firebaseAdmin.js';

const router = express.Router();

// Pre-seeded User Database Store (backed by Firestore + Persistent Fallback)
const IN_MEMORY_USERS = [
  {
    id: 'user-demo-1',
    fullName: 'Parth Sharma',
    email: 'parth@healthsure.org',
    password: 'password123',
    phone: '+91 98765 43210',
    isPremium: false,
    planType: 'Free Plan',
    createdAt: new Date('2026-08-01').toISOString()
  }
];

// Helper: Token Generator & Session Storage
const ACTIVE_SESSIONS = new Map();
ACTIVE_SESSIONS.set('token-demo-parth-sharma', IN_MEMORY_USERS[0]);

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter valid details.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = IN_MEMORY_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      fullName: fullName.trim(),
      email: cleanEmail,
      password: password.trim(),
      phone: phone || '+91 98765 00000',
      isPremium: false,
      planType: 'Free Plan',
      createdAt: new Date().toISOString()
    };

    IN_MEMORY_USERS.push(newUser);

    if (db) {
      try {
        await db.collection('users').doc(newUser.id).set(sanitizeUser(newUser));
      } catch (fsErr) {
        console.warn('[authRoutes] Firestore write error:', fsErr.message);
      }
    }

    const token = `token-${newUser.id}-${Date.now()}`;
    ACTIVE_SESSIONS.set(token, newUser);

    return res.json({
      success: true,
      token,
      user: sanitizeUser(newUser),
      message: 'Account created successfully.'
    });
  } catch (error) {
    console.error('[authRoutes] Register error:', error);
    return res.status(500).json({ success: false, message: 'Unable to connect. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Incorrect email or password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = IN_MEMORY_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    // If Firestore is available, attempt DB fetch
    if (!user && db) {
      try {
        const snapshot = await db.collection('users').where('email', '==', cleanEmail).limit(1).get();
        if (!snapshot.empty) {
          user = snapshot.docs[0].data();
        }
      } catch (fsErr) {
        console.warn('[authRoutes] Firestore search error:', fsErr.message);
      }
    }

    if (!user || (user.password && user.password !== password.trim())) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    const token = `token-${user.id}-${Date.now()}`;
    ACTIVE_SESSIONS.set(token, user);

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('[authRoutes] Login error:', error);
    return res.status(500).json({ success: false, message: 'Unable to connect. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized session.' });
    }

    const token = authHeader.split(' ')[1];
    const user = ACTIVE_SESSIONS.get(token);

    if (!user) {
      // Default fallback for demo token
      if (token === 'token-demo-parth-sharma') {
        ACTIVE_SESSIONS.set(token, IN_MEMORY_USERS[0]);
        return res.json({ success: true, user: sanitizeUser(IN_MEMORY_USERS[0]) });
      }
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to connect. Please try again.' });
  }
});

// PUT /api/auth/premium
router.put('/premium', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized session.' });
    }

    const token = authHeader.split(' ')[1];
    const user = ACTIVE_SESSIONS.get(token) || IN_MEMORY_USERS[0];

    const { planType } = req.body;
    const planName = planType || 'Annual Premium Plan (₹3,599/yr)';

    user.isPremium = true;
    user.planType = planName;
    user.premiumExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    if (db) {
      try {
        await db.collection('users').doc(user.id).set({
          isPremium: true,
          planType: planName,
          premiumExpiry: user.premiumExpiry
        }, { merge: true });
      } catch (fsErr) {
        console.warn('[authRoutes] Firestore premium update error:', fsErr.message);
      }
    }

    ACTIVE_SESSIONS.set(token, user);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      message: 'Successfully upgraded to Premium Membership!'
    });
  } catch (error) {
    console.error('[authRoutes] Premium update error:', error);
    return res.status(500).json({ success: false, message: 'Unable to update premium plan. Please try again.' });
  }
});

export default router;
