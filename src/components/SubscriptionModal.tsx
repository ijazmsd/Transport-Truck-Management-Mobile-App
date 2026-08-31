import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap,
  Clock,
  Building,
  Check,
} from 'lucide-react';
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanId,
  Company,
  SubscriptionStatus,
  PaymentMethod,
} from '../types';

interface Props {
  isOpen: boolean;
  activeSubscription?: Subscription;
  plans: SubscriptionPlan[];
  company: Company;
  onClose: () => void;
  onSelectPlan: (
    planId: SubscriptionPlanId,
    durationMonths: number,
    pricePaid: number,
    paymentMethod: PaymentMethod
  ) => void;
  onRenewCurrent: (subId: string, durationMonths: number) => void;
  onSimulateStatus?: (status: SubscriptionStatus, daysLeft: number) => void;
}

export const SubscriptionModal: React.FC<Props> = ({
  isOpen,
  activeSubscription,
  plans,
  company,
  onClose,
  onSelectPlan,
  onRenewCurrent,
  onSimulateStatus,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(
    activeSubscription?.planId || 'half_yearly'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    'Bank Transfer'
  );
  const [refNumber, setRefNumber] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];

  // Calculate days remaining
  let daysRemaining = 0;
  if (activeSubscription) {
    const exp = new Date(activeSubscription.expiryDate).getTime();
    daysRemaining = Math.max(0, Math.ceil((exp - Date.now()) / 86400000));
  }

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectPlan(
      currentPlan.id,
      currentPlan.durationMonths,
      currentPlan.price,
      paymentMethod
    );
    setSuccessMessage(
      `Congratulations! ${currentPlan.name} is now Active until next renewal.`
    );
    setShowCheckout(false);
  };

  const handleQuickRenew = () => {
    if (!activeSubscription) return;
    onRenewCurrent(activeSubscription.id, activeSubscription.durationMonths);
    setSuccessMessage('Subscription successfully renewed!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Subscription Plans & Billing</h2>
              <p className="text-[10px] text-slate-300">{company.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 font-semibold">{successMessage}</div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-600 font-bold text-[10px] underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Current Active Plan Status Card */}
          {activeSubscription && (
            <div
              className={`p-3.5 rounded-2xl border transition ${
                activeSubscription.status === 'Active'
                  ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                  : activeSubscription.status === 'Expiring Soon'
                  ? 'bg-amber-50 border-amber-300 shadow-2xs'
                  : 'bg-rose-50 border-rose-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Current Plan
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                        activeSubscription.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : activeSubscription.status === 'Expiring Soon'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {activeSubscription.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {activeSubscription.planName}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {daysRemaining} Days
                  </span>
                  <span className="block text-[10px] text-slate-500">Remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Activated:</span>
                  <span className="font-semibold text-slate-800">{activeSubscription.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Expires On:</span>
                  <span className="font-semibold text-slate-800">{activeSubscription.expiryDate}</span>
                </div>
              </div>

              {daysRemaining <= 14 && (
                <div className="mt-2.5 pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-amber-800 font-medium">
                    Renewal approaching soon!
                  </span>
                  <button
                    onClick={handleQuickRenew}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Quick Renew</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Checkout Simulator Form if toggled */}
          {showCheckout ? (
            <form onSubmit={handleCheckoutSubmit} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-900">Confirm {currentPlan.name}</h4>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Change Plan
                </button>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Total Payable:</span>
                <span className="text-sm font-extrabold text-indigo-700">
                  {company.currency} {currentPlan.price.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Bank Transfer', 'Credit/Debit Card', 'EasyPaisa/JazzCash', 'Cash'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method as PaymentMethod)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                        paymentMethod === method
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Transaction / Ref Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. HBL-ONL-998124"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Activate Plan</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Select Plan Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                  Select Subscription Duration
                </h4>

                <div className="space-y-2.5">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer relative ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            {plan.badge}
                          </span>
                        )}

                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <h5 className="text-xs font-bold text-slate-900">{plan.name}</h5>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 ml-5">
                              {plan.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900">
                              {company.currency} {plan.price.toLocaleString()}
                            </span>
                            <span className="block text-[9px] text-slate-400">
                              /{plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} mos`}
                            </span>
                          </div>
                        </div>

                        {/* Feature bullets */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                          {plan.features.slice(0, 4).map((f, idx) => (
                            <div key={idx} className="flex items-center gap-1 truncate">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Continue with {currentPlan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {/* Interactive Simulation & Test Controls for Evaluator */}
          {onSimulateStatus && (
            <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-300 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tester Controls (Simulate State)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Simulate different subscription lifecycle states to test app notifications and enforcement banners:
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => onSimulateStatus('Active', 60)}
                  className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-[10px] font-bold"
                >
                  Active (60d)
                </button>
                <button
                  onClick={() => onSimulateStatus('Expiring Soon', 3)}
                  className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-[10px] font-bold"
                >
                  Expiring (3d)
                </button>
                <button
                  onClick={() => onSimulateStatus('Expired', 0)}
                  className="py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg text-[10px] font-bold"
                >
                  Expired (0d)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
