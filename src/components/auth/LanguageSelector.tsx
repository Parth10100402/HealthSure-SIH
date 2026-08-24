import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { LANGUAGES } from './types';
import type { Language } from './types';
import { useAuth } from '../../context/AuthContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useAuth();

  return (
    <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] hover:border-[#087F6D] transition-colors">
      <Globe
        className="w-3.5 h-3.5 text-[#087F6D] dark:text-[#4FD1C5] shrink-0"
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
          text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]
          border-none outline-none cursor-pointer
          pr-4 focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2
        "
        aria-label="Language selection"
      >
        {LANGUAGES.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-white dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4] font-medium"
          >
            {lang.nativeLabel} ({lang.label})
          </option>
        ))}
      </select>
      <ChevronDown
        className="w-3 h-3 text-[#64748B] dark:text-[#7B9EA8] absolute right-2 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};
