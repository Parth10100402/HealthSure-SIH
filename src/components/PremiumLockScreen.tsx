import React, { useState } from 'react';
import { Crown, Lock, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { PaymentGatewayModal } from './PaymentGatewayModal';

interface PremiumLockScreenProps {
  featureName?: string;
  title?: string;
  description?: string;
}

export const PremiumLockScreen: React.FC<PremiumLockScreenProps> = ({
  featureName = 'Health Dashboard',
  title = 'This feature is available in HealthSure Premium',
  description = 'Upgrade your plan to unlock advanced health tracking, longitudinal vitals insights, and family health vault storage.'
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Annual Family Plan (₹3,599/yr)');

  const plans = [
    { name: 'Monthly Care Plan', price: '₹499', period: 'per month', badge: 'Flexible' },
    { name: '6-Month Health Pass', price: '₹2,499', period: 'per 6 months', badge: 'Save 16%' },
    { name: 'Annual Family Plan', price: '₹3,599', period: 'per year', badge: 'BEST VALUE • Save 40%', popular: true }
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 space-y-8 text-center relative overflow-hidden shadow-2xl">
        
        {/* Glow Ambient Backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* CROWN LOCK ICON */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <Crown className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-blue-400 flex items-center justify-center shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-2 max-w-xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider inline-block">
            {featureName} • Locked Feature
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* PRICING SELECTOR CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {plans.map((p) => {
            const isSelected = selectedPlan.includes(p.price);
            return (
              <div
                key={p.name}
                onClick={() => setSelectedPlan(`${p.name} (${p.price})`)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 scale-[1.02]'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.badge && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border block w-fit ${
                    p.popular 
                      ? 'bg-amber-500 text-slate-950 border-amber-400' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {p.badge}
                  </span>
                )}

                <div>
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <div className="mt-1">
                    <span className="text-2xl font-black text-amber-400">{p.price}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{p.period}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full Access Included</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTION BUTTON */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5 mx-auto"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>Buy Premium Version</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Activation • 256-Bit SSL Encrypted Checkout</span>
          </p>
        </div>

      </div>

      {/* INTERACTIVE PAYMENT GATEWAY MODAL */}
      <PaymentGatewayModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        defaultPlan={selectedPlan}
      />
    </div>
  );
};
