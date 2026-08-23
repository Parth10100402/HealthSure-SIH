# HealthSure Integrations

This directory isolates all **third-party service integrations** from the core application.

Each subdirectory is a self-contained module for one external service.
Integration modules are called **only from the backend** — never directly from the frontend.

---

## Structure

```
integrations/
├── maps/                Google Maps — facility locator, routing
├── teleconsultation/    WebRTC / Agora — video consultation
├── ivr/                 IVR / Telephony — voice assistance (Twilio / Exotel)
├── notifications/       Push notifications — FCM / OneSignal
├── sms/                 SMS OTP — MSG91 / Twilio SMS
└── README.md
```

## Planned Integrations

| Integration | Provider | Phase | Status |
|-------------|----------|-------|--------|
| Maps & Facility Locator | Google Maps API | Phase 4 | 🔜 Planned |
| Video Teleconsultation | Agora / WebRTC | Phase 5 | 🔜 Planned |
| IVR Voice Assistance | Exotel / Twilio | Phase 6 | 🔜 Planned |
| SMS OTP | MSG91 / Twilio | Phase 2 | 🔜 Planned |
| Push Notifications | FCM / OneSignal | Phase 3 | 🔜 Planned |

## Design Principles

- Each integration lives in its own folder with its own `package.json` if needed
- Integration modules export a clean API consumed by backend services
- API keys and secrets are **always environment variables** — never hardcoded
- Integration modules are **replaceable** — swapping MSG91 for Twilio should not require changes outside `integrations/sms/`

## Adding a New Integration

1. Create a folder under `integrations/<service-name>/`
2. Add a `README.md` documenting the integration interface
3. Implement the adapter pattern — export standard function signatures
4. Add required environment variables to `backend/.env.example`
5. Call the integration only from `backend/services/`
