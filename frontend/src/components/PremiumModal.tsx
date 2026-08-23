import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  X, 
  Zap
} from 'lucide-react';
import { PaymentGatewayModal } from './PaymentGatewayModal';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('Annual Family Plan (₹3,599/yr)');
  const [isGatewayOpen, setIsGatewayOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Care Plan',
      price: '₹499',
      period: 'per month',
      popular: false,
      badge: 'Flexible'
    },
    {
      id: 'halfyearly',
      name: '6-Month Health Pass',
      price: '₹2,499',
      period: 'per 6 months',
      popular: false,
      badge: 'Save 16%'
    },
    {
      id: 'annual',
      name: 'Annual Family Plan',
      price: '₹3,599',
      period: 'per year',
      popular: true,
      badge: 'BEST VALUE • Save 40%'
    }
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100 relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-black text-white">HealthSure Premium</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                    Full Unlocked Access
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Unlock Health Dashboard vitals, multi-member family vault, and AI diagnostics.
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plan Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isSelected = selectedPlan.includes(p.price);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(`${p.name} (${p.price})`)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
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
                    <h4 className="text-sm font-bold text-white">{p.name}</h4>
                    <div className="mt-1">
                      <span className="text-2xl font-black text-amber-400">{p.price}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">{p.period}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full Platform Access</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature List */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-semibold text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              Included in Premium Membership:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlimited AI Medical Report Analyses</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Health Dashboard & Vitals Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Member Family Vault Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Longitudinal Biomarker Trend Graphing</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 font-medium">
              256-Bit SSL Encrypted Payment Gateway
            </span>

            <button
              onClick={() => {
                onClose();
                setIsGatewayOpen(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Proceed to Payment</span>
            </button>
          </div>

        </div>
      </div>

      {/* INTERACTIVE PAYMENT GATEWAY MODAL */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        defaultPlan={selectedPlan}
      />
    </>
  );
};
