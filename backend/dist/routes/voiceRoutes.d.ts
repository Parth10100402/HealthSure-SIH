declare const router: import("express-serve-static-core").Router;
/**
 * Centralized TTS voice configuration by language
 */
export declare const getTTSVoice: (language?: string) => string;
export default router;
