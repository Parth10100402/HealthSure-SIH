import React from 'react';
import { Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const t = useTranslation();

  return (
    <div className="min-h-screen w-full bg-[#F5F9F7] dark:bg-[#051818] flex flex-col lg:flex-row transition-colors duration-200">

      {/* Top bar — Mobile only */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] lg:hidden sticky top-0 z-20 shadow-xs">
        <div className="flex items-center">
          <img
            src="/healthsure-logo.png"
            alt="HealthSure"
            className="h-8 w-auto object-contain max-w-[180px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      {/* ── LEFT PANEL — Desktop brand panel ─────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[40%] max-w-[460px] min-h-screen
          bg-gradient-to-b from-[#0D5950] via-[#0A4B43] to-[#073B3A] dark:from-[#093C36] dark:to-[#041A1A]
          border-r border-[#087F6D]/30
          px-8 xl:px-12 py-10 sticky top-0 h-screen overflow-y-auto"
        aria-hidden="true"
      >
        {/* Brand content */}
        <div className="space-y-8">
          {/* Official Logo with high-contrast clean badge */}
          <div className="inline-flex items-center bg-white/95 dark:bg-white/90 rounded-xl px-4 py-2.5 shadow-sm border border-white/20">
            <img
              src="/healthsure-logo.png"
              alt="HealthSure"
              className="h-9 w-auto object-contain max-w-[210px]"
            />
          </div>

          <div className="space-y-3 pt-2">
            <h1 className="text-3xl font-bold text-white leading-tight">
              {t.panelHeadline}
              <br />
              <span className="text-[#4FD1C5]">{t.panelHeadlineAccent}</span>
            </h1>
            <p className="text-[#A7D9CE] text-sm leading-relaxed">
              {t.panelDescription}
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3 pt-2" role="list">
            {[t.panelFeature1, t.panelFeature2, t.panelFeature3, t.panelFeature4].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-[#A7D9CE]">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#087F6D]/40 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#4FD1C5]" fill="none" viewBox="0 0 10 10">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom neutral trust indicator */}
        <div className="pt-8">
          <div className="h-px bg-[#087F6D]/20 mb-4" />
          <div className="flex items-center gap-2 text-xs text-[#A7D9CE]">
            <Shield className="w-3.5 h-3.5 text-[#4FD1C5] flex-shrink-0" />
            <span>{t.secureAccess}</span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL — Form area ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-between px-4 sm:px-8 py-6 sm:py-8 lg:py-10 min-h-screen lg:min-h-0 overflow-y-auto">

        {/* Desktop top controls bar */}
        <div className="hidden lg:flex w-full max-w-[460px] mx-auto items-center justify-end gap-3 pb-4">
          <LanguageSelector />
          <ThemeToggle />
        </div>

        {/* Form card */}
        <div className="w-full max-w-[460px] mx-auto my-auto">
          <div className="bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-sm p-6 sm:p-8">
            {children}
          </div>

          {/* Neutral footer */}
          <p className="mt-6 text-center text-xs text-[#64748B] dark:text-[#7B9EA8] flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.secureAccess}</span>
          </p>
        </div>

        {/* Bottom spacer for desktop alignment */}
        <div className="hidden lg:block h-2" />
      </main>

    </div>
  );
};
