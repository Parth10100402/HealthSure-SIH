// HealthSure — Centralized Application Constants & Configuration
// frontend/src/config/constants.ts

export const HEALTHSURE_IVR_CONFIG = {
  // Real HealthSure Exotel / Toll-Free IVR Helpline Number
  PHONE_NUMBER: '01141185137',
  RAW_PHONE_NUMBER: '01141185137',
  TEL_HREF: 'tel:01141185137',
  TITLE: 'Call HealthSure',
  DESCRIPTION: 'Need healthcare assistance? Call our HealthSure IVR — works even without internet.',
  BADGE_24X7: '24×7 automated healthcare assistance',
  BADGE_OFFLINE: 'Internet not required for phone access',
  CALL_ACTION_LABEL: 'Call HealthSure',
  CALLING_FEEDBACK: 'Calling HealthSure IVR...',
} as const;

export const HEALTHSURE_IVR_NUMBER = HEALTHSURE_IVR_CONFIG.PHONE_NUMBER;
export const HEALTHSURE_IVR_TEL = HEALTHSURE_IVR_CONFIG.TEL_HREF;
