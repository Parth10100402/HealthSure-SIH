import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Building, 
  CheckCircle2, 
  RotateCw, 
  X, 
  ArrowRight
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen?: boolean;
  onClose: () => void;
  defaultPlan?: string;
  selectedPlan?: string;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({ 
  isOpen = true, 
  onClose,
  defaultPlan = 'Annual Family Plan (₹3,599/yr)',
  selectedPlan: propSelectedPlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(propSelectedPlan || defaultPlan);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  
  // Payment Form States
  const [upiId, setUpiId] = useState<string>('user@upi');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState<string>('PARTH SHARMA');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('892');

  // Processing States
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [processingStep, setProcessingStep] = useState<string>('Connecting to Banking Network...');

  if (!isOpen) return null;

  const plans = [
    { name: 'Monthly Care Plan', price: '₹499', period: 'per month', text: '₹499/mo' },
    { name: '6-Month Health Pass', price: '₹2,499', period: 'per 6 months', text: '₹2,499/6mo' },
    { name: 'Annual Family Plan', price: '₹3,599', period: 'per year', text: '₹3,599/yr', bestValue: true }
  ];

  const currentPrice = selectedPlan.includes('499') ? '₹499' : selectedPlan.includes('2,499') ? '₹2,499' : '₹3,599';

  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentState('processing');
    setProcessingStep('Encrypting 256-bit Payment Credentials...');

    setTimeout(() => {
      setProcessingStep(`Authorizing ${currentPrice} Transaction via Bank Gateway...`);
    }, 1000);

    setTimeout(() => {
      setProcessingStep('Verifying Payment & Updating HealthSure Account...');
    }, 2000);

    setTimeout(() => {
      setPaymentState('success');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-100 relative overflow-hidden shadow-2xl">
        
        {/* Subtle Glow Backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">HealthSure Payment Gateway</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                  256-Bit SSL Secured
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Complete payment to instantly unlock Premium Features.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PAYMENT PROCESSING STATE */}
        {paymentState === 'processing' && (
          <div className="p-10 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
              <RotateCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Processing Payment</h3>
              <p className="text-xs text-blue-400 font-bold font-mono">{processingStep}</p>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">Please do not refresh or close this window.</p>
          </div>
        )}

        {/* PAYMENT SUCCESS STATE */}
        {paymentState === 'success' && (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Payment Successful! 🎉</h3>
              <p className="text-xs text-slate-300 font-medium">
                Your account has been upgraded to <strong>HealthSure Premium</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Transaction Ref:</span>
                <span className="text-white font-bold">TXN-HS-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="text-emerald-400 font-bold">{currentPrice}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              Continue to Dashboard & Premium Features
            </button>
          </div>
        )}

        {/* PAYMENT FORM (IDLE STATE) */}
        {paymentState === 'idle' && (
          <form onSubmit={handleProceedPayment} className="space-y-5">
            
            {/* PLAN SELECTOR CHIPS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                1. Select Premium Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {plans.map((p) => {
                  const isSelected = selectedPlan.includes(p.price);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setSelectedPlan(`${p.name} (${p.price})`)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p.bestValue && (
                        <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full absolute -top-2 right-2">
                          Best Value
                        </span>
                      )}
                      <span className="text-[11px] font-bold block">{p.name}</span>
                      <span className="text-base font-black text-blue-400 block mt-0.5">{p.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                2. Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building className="w-4 h-4 text-purple-400" />
                  <span>Net Banking</span>
                </button>
              </div>
            </div>

            {/* PAYMENT METHOD INPUT DETAILS */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              {paymentMethod === 'upi' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Enter VPA / UPI ID</label>
                    <span className="text-[10px] text-blue-400 font-bold">GPay • PhonePe • Paytm</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or username@okicici"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="PARTH SHARMA"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Select Bank</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium outline-none">
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY & SUBMIT */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Amount Due</span>
                <span className="text-2xl font-black text-emerald-400">{currentPrice}</span>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
