// HealthSure Backend — User Model
// backend/models/User.js
//
// Defines the shape of a User document in Firestore.
// In Phase 2, this will include Firestore CRUD operations.

/**
 * @typedef {Object} User
 * @property {string} id              - Unique user ID
 * @property {string} fullName        - Full name
 * @property {string} email           - Email address (may be empty for patients)
 * @property {string} phone           - Mobile number (primary identifier)
 * @property {'patient'|'doctor'|'hospital_staff'|'government_admin'} role
 * @property {boolean} isPremium      - Premium status
 * @property {string} planType        - Plan label
 * @property {string} createdAt       - ISO 8601 creation timestamp
 * @property {boolean} isVerified     - Identity verified flag
 * @property {boolean} isActive       - Account active flag
 *
 * Patient-specific:
 * @property {string} [dateOfBirth]
 * @property {string} [gender]
 * @property {string} [location]
 * @property {string} [preferredLanguage]
 *
 * Doctor-specific:
 * @property {string} [medicalRegNumber]
 * @property {string} [speciality]
 * @property {string} [facility]
 *
 * Hospital Staff-specific:
 * @property {string} [designation]
 *
 * Government Admin-specific:
 * @property {string} [department]
 * @property {string} [district]
 */

// TODO (Phase 2): Implement Firestore CRUD operations
// const { db } = require('../config/firebaseAdmin');
//
// const COLLECTION = 'users';
//
// async function findById(id) { ... }
// async function findByEmail(email) { ... }
// async function findByPhone(phone) { ... }
// async function create(userData) { ... }
// async function update(id, updates) { ... }

module.exports = {};
