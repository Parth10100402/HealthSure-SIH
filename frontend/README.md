# HealthSure Frontend

React · TypeScript · Vite · Tailwind CSS v4

This directory contains **only** UI, pages, components, hooks, frontend state, and API service call functions.
It does **not** contain any backend logic, database credentials, or server-side code.

---

## Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/              Authentication UI components
│   │   └── ui/                Shared reusable UI primitives
│   ├── context/               React context providers (AuthContext, etc.)
│   ├── hooks/                 Custom React hooks
│   ├── lib/                   Utility functions, helpers, constants
│   ├── pages/                 Page-level components (portal placeholders)
│   ├── services/              API service functions (calls backend)
│   └── types/                 Shared TypeScript types
├── public/                    Static assets (logo, icons)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Commands

```bash
npm run dev        # Start dev server → http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # Run oxlint
```

## Environment Variables

Copy `.env.local.example` to `.env.local` for local development:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_APP_ENV` | `development` or `production` |

**Rules:**
- Only `VITE_` prefixed variables are exposed to the browser
- Never put secrets, tokens, or database credentials here

## API Communication

The frontend talks to the backend **exclusively** through service functions in `src/services/`.

```
Browser → src/services/authService.ts → /api/auth/* → Backend
```

In Phase 1, all services use **mock implementations** with the same function signatures as real API calls.
Connecting to a real backend requires only updating the function bodies — not changing any component code.

## Design System

| Token | Light | Dark |
|-------|-------|------|
| Background | `#F5F9F7` | `#051818` |
| Card | `#FFFFFF` | `#0A2020` |
| Primary teal | `#087F6D` | `#087F6D` |
| Border | `#DDE8E4` | `#1A3A3A` |
| Text primary | `#17324D` | `#E2EEF4` |
| Text secondary | `#64748B` | `#7B9EA8` |

Font: **Inter** (via Google Fonts)
