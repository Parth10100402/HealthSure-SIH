// HealthSure Backend — Auth Service
// backend/services/authService.js
//
// Server-side authentication business logic.
// Phase 2: Implement real JWT + Firestore auth here.
// The frontend services/authService.ts will call these endpoints via HTTP.

const crypto = require('crypto');

// TODO (Phase 2): Import real dependencies
// const jwt = require('jsonwebtoken');
// const { db } = require('../config/firebaseAdmin');
// const User = require('../models/User');
// const { sendOTP } = require('../../integrations/sms');

/**
 * Generate a secure random OTP of given length.
 * @param {number} length
 * @returns {string}
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

/**
 * Hash a password using a secure algorithm.
 * TODO (Phase 2): Use bcrypt.hash(password, 12)
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  // Placeholder — replace with bcrypt in Phase 2
  return Buffer.from(password).toString('base64');
}

/**
 * Verify a plain password against a hashed one.
 * TODO (Phase 2): Use bcrypt.compare(password, hash)
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, hash) {
  // Placeholder — replace with bcrypt in Phase 2
  return Buffer.from(password).toString('base64') === hash;
}

/**
 * Issue a JWT token for a user.
 * TODO (Phase 2): Use jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
 * @param {{ id: string, role: string, email: string }} payload
 * @returns {string}
 */
function issueToken(payload) {
  // Placeholder — replace with real JWT in Phase 2
  return `mock-token-${payload.id}-${Date.now()}`;
}

module.exports = {
  generateOTP,
  hashPassword,
  verifyPassword,
  issueToken,
};
