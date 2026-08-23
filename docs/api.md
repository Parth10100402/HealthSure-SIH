# HealthSure REST API Documentation
Version: 1.0.0 (Phase 5)

## Base URL
- Development: `http://localhost:5000/api`
- Production / Docker: `http://localhost:${PORT}/api`

---

## Authentication & Authorization

All authenticated endpoints require the `Authorization` header with a valid JSON Web Token (JWT):
```http
Authorization: Bearer <jwt-token>
```

### Roles
- `PATIENT`: Beneficiary access to profiles, personal appointments, health records, referrals, and teleconsultations.
- `DOCTOR`: Medical officers and specialists access to queue, triage, referrals, and clinical notes.
- `HOSPITAL_STAFF`: Institutional bed capacity, triage desk, diagnostic services, and outreach camp management.
- `ADMIN`: Directorate of Health Services aggregate oversight, inter-facility pipeline, bottlenecks, and audits.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user with email, mobile, or ID + password.
```json
// Request
{
  "identifier": "priya@example.com",
  "password": "demo1234",
  "role": "patient"
}

// Response (200 OK)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-patient-001",
    "fullName": "Ramesh Sharma",
    "email": "priya@example.com",
    "role": "patient",
    "preferredLanguage": "en",
    "patientId": "HS-10248"
  },
  "message": "Sign in successful."
}
```

### `POST /api/auth/send-otp`
Dispatches a 6-digit cryptographically generated OTP via the active SMS Gateway (`mock`, `fast2sms`, `exotel`, `twilio`) to registered mobile numbers. Enforces a 60-second resend cooldown and 5-minute validity.
```json
// Request
{
  "mobile": "9876543210"
}

// Response (200 OK - Note: OTP is never returned in API payload)
{
  "success": true,
  "message": "OTP sent successfully to registered mobile number.",
  "expiresIn": 300,
  "cooldownSeconds": 60,
  "provider": "mock"
}
```

### `POST /api/auth/verify-otp`
Verifies the submitted 6-digit OTP against the bcrypt hash in the database. Enforces a maximum 5-attempt brute-force rate limit.
```json
// Request
{
  "mobile": "9876543210",
  "otp": "208169",
  "role": "patient"
}

// Response (200 OK)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-patient-001",
    "fullName": "Ramesh Sharma",
    "phone": "+91 9876543210",
    "role": "patient",
    "preferredLanguage": "en",
    "patientId": "HS-10248"
  },
  "message": "Signed in successfully with Mobile OTP."
}
```

### `GET /api/auth/me`
Fetches currently authenticated user context based on Bearer token.

---

## 2. Patient & Appointments Endpoints

### `GET /api/patients/me`
Returns patient demographics, village, registered PHC, and ABHA credentials.

### `GET /api/appointments`
Returns filtered list of appointments for the authenticated caller.

### `POST /api/appointments`
Creates a confirmed appointment.

---

## 3. Specialist Outreach (MMU) Endpoints

### `GET /api/outreach`
Lists all scheduled specialist outreach camps with available vs total slots.

### `POST /api/outreach/:id/book`
**Atomic Slot Reservation**: Atomically decrements `availableSlots`, prevents overbooking, creates a confirmed appointment, and notifies the patient.
```json
// Request
{
  "reasonForVisit": "Exertional chest discomfort evaluation"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "appointment": {
      "id": "apt-1787489000",
      "appointmentId": "HS-APT-8821",
      "token": "MMU-07",
      "status": "CONFIRMED",
      "date": "2026-08-28"
    },
    "outreach": {
      "outreachId": "OUT-MH-01",
      "availableSlots": 5,
      "totalSlots": 24
    }
  },
  "message": "Specialist outreach appointment successfully confirmed."
}
```

---

## 4. Clinical Referrals Endpoints

### `GET /api/referrals`
Returns clinical referral records matching query parameters (`status`, `priority`, `patientId`).

### `POST /api/referrals`
Creates a new referral from PHC to District Hospital.

### `PATCH /api/referrals/:id`
Updates referral pipeline stage (`CREATED` ➔ `HOSPITAL_ACCEPTED` ➔ `APPOINTMENT_SCHEDULED` ➔ `PATIENT_VISIT` ➔ `CONSULTATION_COMPLETED` ➔ `FOLLOW_UP` ➔ `COMPLETED`).

---

## 5. Doctor & Consultation Endpoints

### `GET /api/doctors/me/appointments`
Returns today's active patient queue for the doctor.

### `POST /api/doctors/consultations/complete`
Atomically completes appointment, creates Health Record with clinical notes, vitals, and prescriptions, and schedules the follow-up tracker.

---

## 6. Government Admin Monitoring Endpoints (RBAC: `ADMIN`)

### `GET /api/admin/overview`
Returns high-level key public health indicators (Patients Served, Active Referrals, Completion Rate, Outreach, Teleconsults), 7-stage referral pipeline breakdown, and System Bottlenecks.

### `GET /api/admin/facilities`
Returns facility directory with performance, footfall, and operational status.

### `GET /api/admin/outreach`
Returns weekly MMU doctor deployment and capacity utilization %.

### `GET /api/admin/reports`
Returns public health report cards with metadata for PDF/CSV exports.
