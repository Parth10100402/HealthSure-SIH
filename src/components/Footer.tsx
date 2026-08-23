import React, { useState } from 'react';
import { 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { MOCK_FAQS } from '../data/mockData';
import { LogoIcon } from './LogoIcon';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <footer className="mt-16 border-t border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Everything you need to know about clinical diagnosis, privacy, cost estimation, and appointment tokens.
            </p>
          </div>

          <div className="space-y-3">
            {MOCK_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl glass-card border overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 text-left font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-200 dark:border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 24/7 Helpline Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-black flex items-center justify-center sm:justify-start gap-2">
              <Phone className="w-5 h-5 animate-bounce" /> 24/7 National Emergency & Triage Hotline
            </h4>
            <p className="text-xs text-blue-100 font-medium">
              Toll-Free Immediate Consultation: 1800-HEALTH-SURE (1800-432-584-7873)
            </p>
          </div>

          <button
            onClick={() => onNavigate('symptoms')}
            className="px-6 py-3 rounded-2xl bg-white text-blue-700 hover:bg-slate-100 font-black text-xs shadow-md hover:scale-105 transition-all flex items-center space-x-1.5"
          >
            <span>Start Free Triage</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Brand Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
          
          {/* Logo Title */}
          <div className="flex items-center space-x-3">
            <LogoIcon className="w-8 h-8" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Health<span className="text-blue-600 dark:text-blue-400">Sure</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold block">
                Protecting Your Health
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ABDM & HIPAA Compliant Healthcare Triage System</span>
          </div>

          <div>
            © 2026 HealthSure Inc. All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  );
};
