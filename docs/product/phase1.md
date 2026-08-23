# HealthSure — Phase 1 Product Documentation

## Overview

Phase 1 delivers the complete authentication experience for HealthSure — the entry point to the entire platform.

---

## User Roles

| Role | Description | Portal Route |
|------|-------------|-------------|
| Patient | Rural patients accessing healthcare services | `/patient` |
| Doctor | Physicians, specialists, medical officers | `/doctor` |
| Hospital Staff | Nurses, admin, ward staff | `/hospital` |
| Government Admin | District/state public health officers | `/admin` |

---

## Authentication Flows

### Flow 1: Role Selection → Password Login

1. User visits `/login`
2. Selects their role from 4 cards
3. Clicks "Continue"
4. Enters mobile/email + password
5. Clicks "Sign In"
6. Redirected to their portal (`/patient`, `/doctor`, etc.)

### Flow 2: Role Selection → OTP Login

1. User selects role → clicks "Continue with OTP"
2. Enters mobile number → clicks "Send OTP"
3. Receives mock OTP (prototype: `123456`)
4. Enters 6-digit OTP in the input boxes (auto-advances)
5. OTP verified → redirected to portal

### Flow 3: New Registration

1. On login screen → clicks "Create account"
2. Role-specific form appears with relevant fields:
   - **Patient**: Name, Mobile, Email (opt), DOB, Gender, Location, Language
   - **Doctor**: Name, Reg No., Speciality, Facility, Mobile, Email, Password
   - **Hospital Staff**: Name, Facility, Designation, Mobile, Email, Password
   - **Government Admin**: Name, Department, District, Official Email, Mobile, Password
3. Submits → "Account created" success screen → redirected to portal

### Flow 4: Forgot Password

1. On login screen → clicks "Forgot password?"
2. Enters registered mobile/email
3. Receives OTP (mock: `123456`)
4. Enters OTP → verified
5. Sets new password (min 8 chars)
6. Success → back to login

---

## UI Features

- **Theme**: Light mode (default) and Dark mode toggle
- **Language**: English, Hindi, Marathi selector
- **Responsive**: Full desktop 2-panel layout, mobile single-column
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators, large touch targets

---

## Prototype Credentials

| Role | Identifier | Password / OTP |
|------|-----------|----------------|
| Doctor | `dr.rajesh@healthsure.org` | `demo1234` |
| Hospital Staff | `anita@hospital.gov.in` | `demo1234` |
| Government Admin | `suresh.patil@gov.in` | `demo1234` |
| Patient | Any mobile | OTP: `123456` |

Any OTP flow accepts `123456` as the mock verification code.

---

## What Is NOT in Phase 1

The following modules will be built in subsequent phases:
- Patient health records
- Appointment booking / queue management
- Doctor discovery
- Hospital finder
- Referral tracking
- Diagnostic/medicine availability
- Teleconsultation
- Government dashboards
- Multilingual voice assistance
