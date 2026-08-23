// HealthSure — Voice / IVR Phone Assistance Simulator
// frontend/src/components/patient/VoiceIVRModal.tsx

import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Activity,
  X,
  CheckCircle2,
  Calendar,
  Share2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { HEALTHSURE_IVR_NUMBER, HEALTHSURE_IVR_TEL } from '../../config/constants';

interface VoiceIVRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CallStep =
  | 'idle'
  | 'calling'
  | 'language_select'
  | 'main_menu'
  | 'appt_status'
  | 'referral_status'
  | 'followup_status'
  | 'health_help';

export const VoiceIVRModal: React.FC<VoiceIVRModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<CallStep>('calling');
  const [selectedLanguage, setSelectedLanguage] = useState<'Hindi' | 'Marathi' | 'English'>('Hindi');
  const [callDuration, setCallDuration] = useState(0);

  React.useEffect(() => {
    if (!isOpen) {
      setStep('calling');
      setCallDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Auto move from 'calling' to language selection after 1.5s
    const connectTimeout = setTimeout(() => {
      setStep('language_select');
    }, 1500);

    return () => {
      clearInterval(timer);
      clearTimeout(connectTimeout);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleKeypadPress = (digit: string) => {
    if (step === 'language_select') {
      if (digit === '1') {
        setSelectedLanguage('Hindi');
        setStep('main_menu');
      } else if (digit === '2') {
        setSelectedLanguage('Marathi');
        setStep('main_menu');
      } else if (digit === '3') {
        setSelectedLanguage('English');
        setStep('main_menu');
      }
    } else if (step === 'main_menu') {
      if (digit === '1') setStep('appt_status');
      if (digit === '2') setStep('referral_status');
      if (digit === '3') setStep('followup_status');
      if (digit === '4') setStep('health_help');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ivr-title"
      >
        {/* Call Header */}
        <div className="bg-[#073B3A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#087F6D] flex items-center justify-center animate-pulse">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="ivr-title" className="text-sm font-bold leading-none">
                HealthSure Voice • Toll-Free IVR
              </h3>
              <p className="text-xs text-[#A7D9CE] mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                Connected • {HEALTHSURE_IVR_NUMBER} ({formatDuration(callDuration)})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A7D9CE] hover:text-white p-1 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#4FD1C5]"
            aria-label="Close voice simulator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Call options banner */}
        <div className="bg-[#EAF7F2] dark:bg-[#073B3A]/40 px-4 py-2 border-b border-[#087F6D]/20 text-[11px] text-[#073B3A] dark:text-[#A7D9CE] flex items-center justify-between">
          <span>Automated Telephone Helpline System</span>
          <a
            href={HEALTHSURE_IVR_TEL}
            className="font-bold px-2 py-0.5 rounded bg-[#087F6D] text-white hover:bg-[#073B3A] transition-colors"
          >
            Dial {HEALTHSURE_IVR_NUMBER}
          </a>
        </div>

        {/* Interactive Simulated Voice Prompt Screen */}
        <div className="p-6 space-y-5">
          {/* Step 1: Connecting */}
          {step === 'calling' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A]/60 flex items-center justify-center mx-auto text-[#087F6D] animate-spin">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#17324D] dark:text-[#E2EEF4]">
                Connecting to HealthSure IVR Helpline…
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                Toll-free server responding
              </p>
            </div>
          )}

          {/* Step 2: Language Selection */}
          {step === 'language_select' && (
            <div className="space-y-4">
              <div className="bg-[#F5F9F7] dark:bg-[#0F2929] p-4 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-2">
                <div className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  Automated Voice Announcement:
                </div>
                <p className="text-xs sm:text-sm text-[#17324D] dark:text-[#E2EEF4] leading-relaxed">
                  "हेल्थश्युअर में आपका स्वागत है। हिन्दी के लिए 1 दबाएं। मराठीसाठी 2 दाबा। For English, press 3."
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleKeypadPress('1')}
                  className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A] text-center transition-all"
                >
                  <span className="block text-lg font-bold text-[#087F6D] dark:text-[#4FD1C5]">1</span>
                  <span className="text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]">हिन्दी</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('2')}
                  className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A] text-center transition-all"
                >
                  <span className="block text-lg font-bold text-[#087F6D] dark:text-[#4FD1C5]">2</span>
                  <span className="text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]">मराठी</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('3')}
                  className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A] text-center transition-all"
                >
                  <span className="block text-lg font-bold text-[#087F6D] dark:text-[#4FD1C5]">3</span>
                  <span className="text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]">English</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Main IVR Menu */}
          {step === 'main_menu' && (
            <div className="space-y-4">
              <div className="bg-[#F5F9F7] dark:bg-[#0F2929] p-3.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1">
                <div className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  Voice Menu ({selectedLanguage}):
                </div>
                <p className="text-xs text-[#17324D] dark:text-[#E2EEF4]">
                  {selectedLanguage === 'Hindi'
                    ? 'अपॉइंटमेंट के लिए 1 दबाएं, रेफरल स्थिति के लिए 2 दबाएं, फॉलो-अप के लिए 3 दबाएं।'
                    : selectedLanguage === 'Marathi'
                    ? 'अपॉइंटमेंटसाठी 1 दाबा, रेफरल स्थितीसाठी 2 दाबा, फॉलो-अपसाठी 3 दाबा.'
                    : 'Press 1 for Appointments, 2 for Referrals, 3 for Follow-ups.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleKeypadPress('1')}
                  className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] bg-[#F5F9F7]/50 dark:bg-[#0F2929]/50 text-left space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Calendar className="w-4 h-4 text-[#087F6D]" />
                    <span className="font-bold text-xs text-[#087F6D]">Key 1</span>
                  </div>
                  <div className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {selectedLanguage === 'Hindi' ? 'अपॉइंटमेंट' : selectedLanguage === 'Marathi' ? 'अपॉइंटमेंट' : 'Appointments'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('2')}
                  className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] bg-[#F5F9F7]/50 dark:bg-[#0F2929]/50 text-left space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Share2 className="w-4 h-4 text-[#087F6D]" />
                    <span className="font-bold text-xs text-[#087F6D]">Key 2</span>
                  </div>
                  <div className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {selectedLanguage === 'Hindi' ? 'रेफरल स्थिति' : selectedLanguage === 'Marathi' ? 'रेफरल स्थिती' : 'Referral Status'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('3')}
                  className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] bg-[#F5F9F7]/50 dark:bg-[#0F2929]/50 text-left space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Clock className="w-4 h-4 text-[#087F6D]" />
                    <span className="font-bold text-xs text-[#087F6D]">Key 3</span>
                  </div>
                  <div className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {selectedLanguage === 'Hindi' ? 'फॉलो-अप' : selectedLanguage === 'Marathi' ? 'फॉलो-अप' : 'Follow-up Date'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('4')}
                  className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] bg-[#F5F9F7]/50 dark:bg-[#0F2929]/50 text-left space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <HelpCircle className="w-4 h-4 text-[#087F6D]" />
                    <span className="font-bold text-xs text-[#087F6D]">Key 4</span>
                  </div>
                  <div className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {selectedLanguage === 'Hindi' ? 'हेल्पडेस्क' : selectedLanguage === 'Marathi' ? 'मदत कक्ष' : 'Helpdesk'}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Sub-steps Responses */}
          {step === 'appt_status' && (
            <div className="space-y-4">
              <div className="bg-[#EAF7F2] dark:bg-[#073B3A]/40 p-4 rounded-xl border border-[#087F6D]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  <CheckCircle2 className="w-4 h-4" />
                  Voice Response Audio:
                </div>
                <p className="text-xs sm:text-sm text-[#17324D] dark:text-[#E2EEF4] leading-relaxed">
                  "नमस्ते रमेश शर्मा जी। आपका अगला अपॉइंटमेंट <strong>28 अगस्त 2026</strong> को सुबह <strong>10:30 बजे</strong> जिला अस्पताल रत्नागिरी में <strong>डॉ. अनन्या मेहता</strong> के साथ है। टोकन नंबर <strong>DH-CARD-14</strong> है।"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('main_menu')}
                className="w-full py-2.5 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929]"
              >
                ← Back to Main Menu
              </button>
            </div>
          )}

          {step === 'referral_status' && (
            <div className="space-y-4">
              <div className="bg-[#EAF7F2] dark:bg-[#073B3A]/40 p-4 rounded-xl border border-[#087F6D]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  <CheckCircle2 className="w-4 h-4" />
                  Voice Response Audio:
                </div>
                <p className="text-xs sm:text-sm text-[#17324D] dark:text-[#E2EEF4] leading-relaxed">
                  "आपका रेफरल <strong>HS-REF-7821</strong> जिला अस्पताल द्वारा <strong>स्वीकृत (Hospital Accepted)</strong> कर लिया गया है। कृपया समय पर ओपीडी रूम 104 पर पहुंचें।"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('main_menu')}
                className="w-full py-2.5 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929]"
              >
                ← Back to Main Menu
              </button>
            </div>
          )}

          {step === 'followup_status' && (
            <div className="space-y-4">
              <div className="bg-[#EAF7F2] dark:bg-[#073B3A]/40 p-4 rounded-xl border border-[#087F6D]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  <CheckCircle2 className="w-4 h-4" />
                  Voice Response Audio:
                </div>
                <p className="text-xs sm:text-sm text-[#17324D] dark:text-[#E2EEF4] leading-relaxed">
                  "आपका अगला रूटीन बीपी चेकअप <strong>05 सितंबर 2026</strong> को आपके नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC खेड) में निर्धारित है।"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('main_menu')}
                className="w-full py-2.5 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929]"
              >
                ← Back to Main Menu
              </button>
            </div>
          )}

          {step === 'health_help' && (
            <div className="space-y-4">
              <div className="bg-[#EAF7F2] dark:bg-[#073B3A]/40 p-4 rounded-xl border border-[#087F6D]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  <CheckCircle2 className="w-4 h-4" />
                  Voice Response Audio:
                </div>
                <p className="text-xs sm:text-sm text-[#17324D] dark:text-[#E2EEF4] leading-relaxed">
                  "PHC खेड प्राथमिक स्वास्थ्य केंद्र हेल्पडेस्क से जुड़ने के लिए लाइन पर बने रहें। आपातकालीन स्थिति में 108 पर कॉल करें।"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('main_menu')}
                className="w-full py-2.5 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929]"
              >
                ← Back to Main Menu
              </button>
            </div>
          )}

          {/* Call Controls Footer */}
          <div className="pt-2 border-t border-[#DDE8E4] dark:border-[#1A3A3A] flex items-center justify-between">
            <a
              href="tel:18002094477"
              className="text-xs font-bold text-[#087F6D] hover:underline flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial Helpline: 1800-209-4477</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-rose-600"
              aria-label="End IVR phone call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VoiceAssistantCard: React.FC<{ onOpenCall: () => void }> = ({ onOpenCall }) => {
  return (
    <div className="rounded-2xl border border-[#087F6D]/30 bg-gradient-to-br from-[#EAF7F2] to-white dark:from-[#073B3A]/40 dark:to-[#0A2020] p-5 sm:p-6 space-y-4 relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#087F6D]/15 text-[#087F6D] dark:text-[#4FD1C5] text-[11px] font-bold">
            <PhoneCall className="w-3 h-3" />
            HealthSure Voice • Low-Connectivity Phone Assistance
          </div>
          <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
            No internet? Call HealthSure Toll-Free (1800-209-4477)
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] max-w-md leading-relaxed">
            Check appointment tokens, referral status, and specialist outreach dates via interactive voice calls in Hindi, Marathi, and English.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Real Native Phone Dialer Link on Mobile / Device */}
        <a
          href="tel:18002094477"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 transition-all shadow-xs"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call 1800-209-4477</span>
        </a>

        {/* Interactive IVR Simulator Button */}
        <button
          type="button"
          onClick={onOpenCall}
          className="inline-flex items-center gap-2 rounded-xl border border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A] text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all"
        >
          <span>Explore Interactive IVR Demo</span>
        </button>

        <span className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
          Works on any basic feature phone • Free of cost
        </span>
      </div>
    </div>
  );
};
