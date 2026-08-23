// HealthSure — useTranslation hook with fallback Proxy
// src/lib/i18n/useTranslation.ts

import { useAuth } from '../../context/AuthContext';
import { translations } from './translations';
import type { Translations } from './translations';

/**
 * Returns the translation object for the currently selected language.
 * Uses a Proxy fallback to ensure missing keys safely return English text.
 */
export function useTranslation(): Translations {
  const auth = useAuth();
  const lang = auth?.language || 'en';
  const currentDict = translations[lang] || translations.en;
  const enDict = translations.en;

  return new Proxy(currentDict, {
    get(target, prop: string) {
      if (prop in target && target[prop as keyof Translations]) {
        return target[prop as keyof Translations];
      }
      if (prop in enDict && enDict[prop as keyof Translations]) {
        return enDict[prop as keyof Translations];
      }
      return '';
    },
  });
}
