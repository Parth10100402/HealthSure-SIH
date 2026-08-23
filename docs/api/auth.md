# HealthSure API Documentation

## Authentication API — Phase 1

All endpoints: `POST /api/auth/*`

---

### POST `/api/auth/login`

Authenticate with credentials.

**Request:**
```json
{
  "identifier": "dr.rajesh@healthsure.org",
  "password": "password123",
  "role": "doctor"
}
```

**Response (success):**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-doctor-001",
    "fullName": "Dr. Rajesh Kumar",
    "email": "dr.rajesh@healthsure.org",
    "phone": "+91 9876543211",
    "role": "doctor",
    "isPremium": false,
    "createdAt": "2026-08-23T10:00:00.000Z"
  }
}
```

**Response (error):**
```json
{
  "success": false,
  "message": "Incorrect credentials. Please check your details and try again."
}
```

---

### POST `/api/auth/register`

Register a new account.

**Request:**
```json
{
  "role": "patient",
  "fullName": "Priya Desai",
  "phone": "+91 9876543210",
  "email": "priya@example.com",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "location": "Wardha, Maharashtra",
  "preferredLanguage": "mr"
}
```

**Request (doctor):**
```json
{
  "role": "doctor",
  "fullName": "Dr. Anita Singh",
  "phone": "+91 9876543215",
  "email": "anita@healthsure.org",
  "password": "securepassword",
  "medicalRegNumber": "MH-2019-45678",
  "speciality": "General Medicine",
  "facility": "PHC Nandurbar"
}
```

**Response (success):**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": { "...": "user object" },
  "message": "Account created successfully."
}
```

---

### POST `/api/auth/otp/send`

Send OTP to mobile number.

**Request:**
```json
{
  "mobile": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully.",
  "sessionId": "otp-session-token"
}
```

---

### POST `/api/auth/otp/verify`

Verify OTP and authenticate.

**Request:**
```json
{
  "mobile": "+919876543210",
  "otp": "123456",
  "sessionId": "otp-session-token",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": { "...": "user object" }
}
```

---

### GET `/api/auth/me`

Validate session and return current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": { "...": "user object" }
}
```

---

### POST `/api/auth/password/reset-otp`

Send password reset OTP.

**Request:**
```json
{
  "identifier": "priya@example.com"
}
```

---

### POST `/api/auth/password/reset`

Reset password with OTP verification.

**Request:**
```json
{
  "identifier": "priya@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

---

## Error Codes

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

## Rate Limiting (Planned)

| Endpoint | Limit |
|----------|-------|
| `/api/auth/login` | 5 requests / minute per IP |
| `/api/auth/otp/send` | 3 requests / 10 minutes per mobile |
| `/api/auth/register` | 10 requests / hour per IP |
