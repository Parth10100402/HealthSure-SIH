# HealthSure — Rural Healthcare Continuity & Referral Platform

> **Smart India Hackathon (SIH) Prototype** | **Problem Statement ID: 26133**  
> Strengthening Public Healthcare Access across Rural Sub-Centres, PHCs, Specialist Outreach, and District Hospitals.

---

## 🏗 Architecture Overview

```
HEALTHSURE/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Modular Patient, Doctor, Hospital & Admin UI
│   │   ├── pages/        # Portals & Sub-routes
│   │   ├── services/     # Centralized API service layer (with Bearer JWT)
│   │   ├── lib/i18n/     # Multilingual engine (15 Indian languages)
│   │   └── types/        # TypeScript interfaces
│
├── backend/              # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/           # Prisma schema & PostgreSQL / SQLite migration models
│   ├── src/
│   │   ├── config/       # Environment & JWT configuration
│   │   ├── controllers/  # REST controllers
│   │   ├── db/           # In-memory relational store & seed runners
│   │   ├── middleware/   # JWT Auth & Role-Based Access Control (RBAC)
│   │   ├── routes/       # Modular REST route definitions
│   │   ├── schemas/      # Zod input validation schemas
│   │   ├── types/        # Backend TypeScript types
│   │   ├── app.ts        # Express application configuration
│   │   └── server.ts     # Server bootstrap
│   └── test/             # Automated end-to-end API test suite
│
├── docs/                 # API documentation & architecture guides
└── README.md
```

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo database (Users, Facilities, Outreach, Referrals)
npm test         # Runs 15-step automated end-to-end API test suite
npm run dev      # Starts REST API server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Identifier / Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Patient** | `priya@example.com` / `HS-10248` | `demo1234` | Patient Portal, Outreach booking, Referrals, Follow-ups |
| **Doctor** | `dr.rajesh@healthsure.org` / `DOC-CARD-1042` | `demo1234` | Today's OPD queue, Consultation desk, Referral creator |
| **Hospital Staff** | `anita@hospital.gov.in` / `DH-RAT-001` | `demo1234` | Triage desk, Bed capacity, Specialist slot scheduling |
| **Govt Admin** | `admin.health@maharashtra.gov.in` / `ADM-MH-001` | `demo1234` | Public health oversight, 7-stage referral pipeline, Bottlenecks |

---

## 🔄 Critical End-to-End Workflow

1. **Patient**: Logs in ➔ Navigates to **Specialist Outreach** ➔ Selects Cardiology at PHC Khed ➔ Atomically reserves slot (available slots decrease from 6 to 5, appointment created).
2. **Doctor**: Logs in ➔ Opens **Today's Queue** ➔ Views Ramesh Sharma ➔ Completes consultation with clinical notes ➔ Initiates referral to District Hospital Ratnagiri.
3. **Hospital Staff**: Logs in ➔ Views **Incoming Referrals** ➔ Accepts referral `HS-REF-7821` ➔ Schedules token `DH-CARD-14`.
4. **Patient**: Checks **Referral Tracking** ➔ Real-time status shows *Hospital Accepted* and *Appointment Scheduled*.
5. **Doctor**: Completes review ➔ Health Record created ➔ 30-day Follow-Up tracker generated.
6. **Government Admin**: Logs in ➔ Monitors aggregate network indicators, 7-stage pipeline progression, and facility bottlenecks.

---

## 🌐 Multilingual Accessibility
Native localization support across **15 Indian Languages**:
English, Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu (with RTL layout), Bhojpuri, Konkani.
