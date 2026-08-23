-- HealthSure Database — Initial Schema
-- backend/database/migrations/001_initial_schema.sql
--
-- Phase 2+: Run this against PostgreSQL to create the initial schema.
-- For Firestore, this serves as reference documentation only.

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  role            TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'hospital_staff', 'government_admin')),
  password_hash   TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  preferred_lang  TEXT DEFAULT 'en',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure phone or email is provided
  CONSTRAINT users_contact_check CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (LOWER(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_idx ON users (phone) WHERE phone IS NOT NULL;

-- ─── Patient Profiles ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patient_profiles (
  id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender        TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  village       TEXT,
  district      TEXT,
  state         TEXT DEFAULT 'Maharashtra',
  abha_id       TEXT UNIQUE  -- Ayushman Bharat Health Account ID
);

-- ─── Doctor Profiles ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctor_profiles (
  id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  medical_reg_no    TEXT UNIQUE NOT NULL,
  speciality        TEXT NOT NULL,
  facility_id       UUID,  -- FK to facilities (Phase 4)
  is_available      BOOLEAN DEFAULT TRUE,
  consultation_type TEXT[] DEFAULT ARRAY['in-person']  -- in-person, teleconsult
);

-- ─── OTP Sessions ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS otp_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile      TEXT NOT NULL,
  otp_hash    TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('login', 'register', 'reset_password')),
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-expire OTP sessions
CREATE INDEX IF NOT EXISTS otp_sessions_expires_idx ON otp_sessions (expires_at);
