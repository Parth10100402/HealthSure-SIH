import React, { useState } from 'react';
import { 
  Crown
} from 'lucide-react';
import { PaymentGatewayModal } from './PaymentGatewayModal';

export const PremiumView: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semi' | 'annual'>('annual');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* HEADER SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs uppercase tracking-wider border border-amber-500/20">
          <Crown className="w-4 h-4" /> HealthSure Premium
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Unlock Unlimited <span className="text-teal-600 dark:text-teal-400">Healthcare Access</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
          Comprehensive AI medical report analysis, personal health command center, and independent family health management.
        </p>
      </div>

      {/* 3-TIER PRICING CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        {/* Tier 1: Monthly */}
        <div 
          onClick={() => setSelectedPlan('monthly')}
          className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border cursor-pointer transition-all space-y-6 flex flex-col justify-between ${
            selectedPlan === 'monthly'
              ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Plan</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹499</span>
              <span className="text-xs text-slate-400 font-medium">/ month</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Flexible month-to-month access.</p>
          </div>

          <button
            onClick={() => { setSelectedPlan('monthly'); setShowPaymentModal(true); }}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Select Monthly
          </button>
        </div>

        {/* Tier 2: 6 Months */}
        <div 
          onClick={() => setSelectedPlan('semi')}
          className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border cursor-pointer transition-all space-y-6 flex flex-col justify-between ${
            selectedPlan === 'semi'
              ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">6-Month Plan</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹2,499</span>
              <span className="text-xs text-slate-400 font-medium">/ 6 months</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Save 17% on bi-annual subscription.</p>
          </div>

          <button
            onClick={() => { setSelectedPlan('semi'); setShowPaymentModal(true); }}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Select 6 Months
          </button>
        </div>

        {/* Tier 3: Annual (BEST VALUE HIGHLIGHTED) */}
        <div 
          onClick={() => setSelectedPlan('annual')}
          className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all space-y-6 flex flex-col justify-between relative ${
            selectedPlan === 'annual'
              ? 'border-teal-500 ring-4 ring-teal-500/10 shadow-lg'
              : 'border-teal-500/40'
          }`}
        >
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
            BEST VALUE
          </span>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Annual Plan</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹3,599</span>
              <span className="text-xs text-slate-400 font-medium">/ year</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">₹300/month equivalent. Best savings.</p>
          </div>

          <button
            onClick={() => { setSelectedPlan('annual'); setShowPaymentModal(true); }}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-colors"
          >
            Upgrade to Annual
          </button>
        </div>

      </div>

      {/* PAYMENT GATEWAY MODAL */}
      {showPaymentModal && (
        <PaymentGatewayModal
          onClose={() => setShowPaymentModal(false)}
          selectedPlan={selectedPlan}
        />
      )}

    </div>
  );
};
