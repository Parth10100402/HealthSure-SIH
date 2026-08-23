// HealthSure — Centralized Application Constants & Configuration
// frontend/src/config/constants.ts

export const HEALTHSURE_IVR_CONFIG = {
  // Existing HealthSure Exotel / Toll-Free IVR Helpline Number
  PHONE_NUMBER: '1800-209-4477',
  RAW_PHONE_NUMBER: '18002094477',
  TEL_HREF: 'tel:18002094477',
  TITLE: 'Call HealthSure',
  DESCRIPTION: 'Need healthcare assistance? Call our HealthSure IVR — works even without internet.',
  BADGE_24X7: '24×7 automated healthcare assistance',
  BADGE_OFFLINE: 'Internet not required for phone access',
  CALL_ACTION_LABEL: 'Call HealthSure',
  CALLING_FEEDBACK: 'Calling HealthSure IVR...',
} as const;

export const HEALTHSURE_IVR_NUMBER = HEALTHSURE_IVR_CONFIG.PHONE_NUMBER;
export const HEALTHSURE_IVR_TEL = HEALTHSURE_IVR_CONFIG.TEL_HREF;
