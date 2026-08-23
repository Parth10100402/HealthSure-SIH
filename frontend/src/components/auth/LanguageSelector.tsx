import React from 'react';
import { Globe } from 'lucide-react';
import { LANGUAGES } from './types';
import type { Language } from './types';
import { useAuth } from '../../context/AuthContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useAuth();

  return (
    <div className="relative flex items-center gap-1.5">
      <Globe
        className="w-4 h-4 text-[#64748B] dark:text-[#A7D9CE] shrink-0"
        aria-hidden="true"
      />
      <label htmlFor="language-select" className="sr-only">
        Select language
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="
          appearance-none bg-transparent
          text-sm font-medium text-[#17324D] dark:text-[#E2EEF4]
          border-none outline-none cursor-pointer
          pr-1 focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2 rounded
        "
        aria-label="Language"
      >
        {LANGUAGES.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-white dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
          >
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
};
