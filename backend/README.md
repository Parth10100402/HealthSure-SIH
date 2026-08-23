# HealthSure Backend

Node.js · Express · Firebase Admin · Firestore

This directory contains **only** server-side business logic, authentication, authorization,
database operations, and API endpoints. No UI code. No frontend assets.

---

## Structure

```
backend/
├── app/
│   └── server.js              Express app entry point
├── api/
│   ├── index.js               API router entry
│   └── routes/
│       ├── authRoutes.js      POST /api/auth/login, /register, /me
│       ├── dashboardRoutes.js GET  /api/dashboard/*
│       ├── doctorRoutes.js    GET  /api/doctors/*
│       ├── familyRoutes.js    GET/POST /api/family/*
│       ├── reportRoutes.js    GET/POST /api/reports/*
│       └── symptomRoutes.js   POST /api/symptoms/analyze
├── auth/                      Auth middleware & JWT utilities (Phase 2+)
├── models/                    Data models / Firestore document schemas
├── schemas/                   Validation schemas (Zod / Joi)
├── services/                  Business logic services
├── database/
│   ├── migrations/            Database migration scripts
│   └── seeds/
│       └── seed.js            Development seed data
├── config/
│   └── firebaseAdmin.js       Firebase Admin SDK initialization
├── .env.example               Environment variable template
└── README.md
```

## Commands

```bash
npm install
npm run dev        # Start with nodemon → http://localhost:5000
npm start          # Production start
```

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

**NEVER commit `.env` or `serviceAccountKey.json` to version control.**

## API Conventions

- All endpoints prefixed with `/api/`
- JSON request/response
- Auth endpoints use JWT Bearer tokens
- Error format: `{ success: false, message: "..." }`
- Success format: `{ success: true, data: {...} }`

## Security Rules

- Secrets are environment variables only — never hardcoded
- `serviceAccountKey.json` is git-ignored
- All protected routes verify JWT in `Authorization: Bearer <token>` header
- CORS is restricted to allowed origins only

## Phase Status

| Module | Status |
|--------|--------|
| Auth routes (login, register, session) | ✅ Exists (legacy) — needs refactor for Phase 2 |
| Dashboard routes | 🔜 Phase 2 |
| Doctor routes | 🔜 Phase 3 |
| Hospital routes | 🔜 Phase 4 |
| Admin routes | 🔜 Phase 5 |
