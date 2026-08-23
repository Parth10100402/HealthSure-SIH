# HealthSure Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER / APP                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FRONTEND (React + Vite)                            │   │
│  │                                                     │   │
│  │  pages/ → components/ → hooks/ → services/         │   │
│  │                              │                      │   │
│  │              API calls only  │  (fetch / axios)     │   │
│  └──────────────────────────────┼──────────────────────┘   │
└─────────────────────────────────┼───────────────────────────┘
                                  │ HTTP/REST  (JSON)
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                                │
│                                                             │
│  api/routes/ → services/ → models/ → database/             │
│                    │                                        │
│                    └──── integrations/ (external calls)     │
└─────────────────────────────────────────────────────────────┘
              │                        │
              ▼                        ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│  DATABASE           │  │  EXTERNAL SERVICES               │
│  Firestore / PG     │  │  Maps · SMS · Video · IVR · FCM  │
└─────────────────────┘  └──────────────────────────────────┘
```

## Layers

### Frontend (`frontend/`)
- React 19 + TypeScript + Vite + Tailwind CSS v4
- **Communicates with backend only through `src/services/` functions**
- No database access. No secrets. No server-side logic.
- State management: React Context (Phase 1-2) → Zustand (Phase 3+, TBD)

### Backend (`backend/`)
- Node.js + Express
- JWT authentication
- Firebase Admin SDK for Firestore access
- Business logic in `services/`
- Route handlers in `api/routes/`
- Data models in `models/`

### Integrations (`integrations/`)
- Each external service isolated in its own module
- Adapter pattern — stable interface, swappable implementations
- Called only from backend services

### Database
- **Primary**: Google Firestore (document database)
- **Planned**: PostgreSQL for relational data (appointments, records)
- Migrations in `backend/database/migrations/`

## Authentication Flow

```
User → Role Selection → Login Form
     → (POST /api/auth/login) → Backend verifies credentials
     → JWT issued → stored in frontend memory / httpOnly cookie
     → Protected routes check JWT on every request
```

## Role-Based Access

| Role | Frontend Route | Backend Auth Level |
|------|---------------|-------------------|
| Patient | `/patient` | PATIENT |
| Doctor | `/doctor` | DOCTOR |
| Hospital Staff | `/hospital` | HOSPITAL_STAFF |
| Government Admin | `/admin` | GOVERNMENT_ADMIN |

## Phase-by-Phase Plan

| Phase | Frontend | Backend | Integrations |
|-------|----------|---------|-------------|
| 1 | Auth experience ✅ | Mock (inline) | None |
| 2 | Patient portal | Real auth API | SMS OTP |
| 3 | Doctor portal | Patient + Doctor APIs | — |
| 4 | Hospital portal | Hospital APIs | Maps |
| 5 | Admin portal | Admin + analytics APIs | — |
| 6 | All | Teleconsult, IVR | WebRTC, IVR |
