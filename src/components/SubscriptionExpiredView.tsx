import React, { useState } from 'react';
import {
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Lock,
  LogOut,
  RefreshCw,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { Company, Subscription, SubscriptionPlan, SubscriptionPlanId, PaymentMethod, User } from '../types';

interface Props {
  company: Company;
  subscription?: Subscription;
  plans: SubscriptionPlan[];
  currentUser: User;
  onRenewSubscription: (planId: SubscriptionPlanId, paymentMethod: PaymentMethod) => Promise<void>;
  onRequestLogout: () => void;
}

export const SubscriptionExpiredView: React.FC<Props> = ({
  company,
  subscription,
  plans,
  currentUser,
  onRenewSubscription,
  onRequestLogout,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(
    subscription?.planId || 'semi_annual'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [loading, setLoading] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleRenew = async () => {
    setLoading(true);
    try {
      await onRenewSubscription(selectedPlanId, paymentMethod);
      setRenewSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Top Header Card */}
        <div className="bg-slate-800/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/60">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Subscription Expired</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full">
                    Suspended
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.name}</span>
                  <span>•</span>
                  <span>Expired on {subscription?.expiryDate || 'Recently'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onRequestLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-600"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Safe Data Assurance */}
          <div className="mb-6 p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white block">Your Fleet Data is Safe & Preserved</span>
              Your trips, biltys, driver settlements, customer ledgers, and maintenance logs are securely stored in your tenant database. Renewing your subscription immediately restores full access.
            </div>
          </div>

          {/* Success Dialog */}
          {renewSuccess ? (
            <div className="p-6 bg-emerald-950/80 border border-emerald-700 rounded-2xl text-center animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1">Subscription Renewed Successfully!</h3>
              <p className="text-xs text-emerald-300 mb-4">
                Your company subscription has been renewed. You can now access your dashboard.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Choose a Renewal Plan</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map((p) => {
                    const isSelected = selectedPlanId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{p.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className="text-sm font-mono font-bold text-blue-300 mt-1">
                            Rs. {p.price.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {p.durationMonths} Month{p.durationMonths > 1 ? 's' : ''} access
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-700/40 text-[9px] text-slate-400 space-y-0.5">
                          <div>• Max Trucks: {p.maxTrucks}</div>
                          <div>• Max Drivers: {p.maxDrivers}</div>
                          <div>• Max Users: {p.maxUsers}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Bank Transfer', 'EasyPaisa', 'JazzCash', 'Credit Card'] as PaymentMethod[]).map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`p-2 rounded-xl border text-xs font-semibold text-center transition ${
                          paymentMethod === m
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {m}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleRenew}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Activating Subscription...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      Renew Subscription Now (Rs. {selectedPlan.price.toLocaleString()})
                    </span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-blue-400" />
                  <span>Need assistance? Call TruckBook SaaS Desk at +92 300 8782526</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
