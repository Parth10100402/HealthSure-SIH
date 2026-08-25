// HealthSure — Help & Community Assistance Page
// frontend/src/pages/patient/HelpSupportPage.tsx

import React, { useState } from 'react';
import {
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { VoiceIVRModal } from '../../components/patient/VoiceIVRModal';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { HEALTHSURE_IVR_NUMBER } from '../../config/constants';

export const HelpSupportPage: React.FC = () => {
  const t = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const faqs = [
    {
      q: 'How does Specialist Outreach work in rural areas?',
      a: `Experienced doctors visit PHC Khed on scheduled dates. You can book a free slot in advance through this portal or via HealthSure Voice (${HEALTHSURE_IVR_NUMBER}). This eliminates the need to travel 45+ km to the District Hospital.`,
    },
    {
      q: 'What should I do after my PHC doctor issues a Referral?',
      a: 'When your PHC doctor issues a referral, it is digitally pre-cleared by the destination hospital. Once accepted, you can book an appointment slot directly. Show your digital Referral Pass / QR code at the District Hospital reception for priority token processing.',
    },
    {
      q: 'How do I use HealthSure if I have no smartphone or internet in my village?',
      a: `You can dial our toll-free phone number (${HEALTHSURE_IVR_NUMBER}) from any basic 2G feature phone. The automated voice assistant guides you in Marathi, Hindi, or English to check appointment dates, tokens, and referral statuses.`,
    },
    {
      q: 'Are medicines and diagnostic tests at the PHC free of cost?',
      a: 'Yes, all essential medicines and routine diagnostic tests listed in the HealthSure catalog are provided free of cost under National Health Mission guidelines at PHC Khed.',
    },
    {
      q: 'How do I join a Teleconsultation call with poor network?',
      a: 'Our teleconsultation video room automatically detects slow cellular connectivity and switches into low-bandwidth 2G audio mode.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.helpPageTitle}
        </h1>
      </div>

      {/* Helpline Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#073B3A] via-[#0A4B43] to-[#0D5950] text-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-lg sm:text-xl font-bold">{t.callHelpline}: <span className="font-mono text-[#4FD1C5]">{HEALTHSURE_IVR_NUMBER}</span></h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${HEALTHSURE_IVR_NUMBER}`}
              role="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-3 transition-all shadow-md cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Helpline</span>
            </a>

            <button
              type="button"
              onClick={() => setVoiceModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-semibold px-4 py-3 transition-all cursor-pointer"
            >
              <span>IVR Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency & PHC Helplines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{t.ambulance108}</span>
          </div>
          <div className="text-xl font-extrabold text-rose-600">108 / 102</div>
        </div>

        <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-[#087F6D] dark:text-[#4FD1C5] font-bold text-xs">
            <Building2 className="w-4 h-4" />
            <span>{t.phcHelpline}</span>
          </div>
          <div className="text-xl font-bold text-[#17324D] dark:text-[#E2EEF4]">+91 2356 261234</div>
        </div>

        <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-[#087F6D] dark:text-[#4FD1C5] font-bold text-xs">
            <Building2 className="w-4 h-4" />
            <span>{t.womenHelpline104}</span>
          </div>
          <div className="text-xl font-bold text-[#17324D] dark:text-[#E2EEF4]">104</div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4] border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
          Frequently Asked Questions (FAQ)
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 bg-[#F5F9F7]/60 dark:bg-[#0F2929]/50 hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A]/30 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#087F6D] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 text-xs text-[#64748B] dark:text-[#7B9EA8] bg-white dark:bg-[#0A2020] leading-relaxed border-t border-[#DDE8E4] dark:border-[#1A3A3A]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <VoiceIVRModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
    </div>
  );
};
