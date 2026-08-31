import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  Building2,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionPlanId, PaymentMethod } from '../types';

interface Props {
  isOpen: boolean;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onCompleteRegistration: (data: {
    userName: string;
    userEmail: string;
    userPhone: string;
    companyName: string;
    city: string;
    address: string;
    planId: SubscriptionPlanId;
    paymentMethod: PaymentMethod;
  }) => void;
}

export const ClientRegistrationModal: React.FC<Props> = ({
  isOpen,
  plans,
  onClose,
  onCompleteRegistration,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('half_yearly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [refNumber, setRefNumber] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1] || plans[0];

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setFormError('Please enter your transport company name');
      return;
    }
    if (!userName.trim()) {
      setFormError('Please enter administrator / owner name');
      return;
    }
    if (!userPhone.trim()) {
      setFormError('Please enter a valid phone number');
      return;
    }
    setFormError('');
    setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
    setTimeout(() => {
      onCompleteRegistration({
        companyName,
        userName,
        userEmail: userEmail || `${userName.toLowerCase().replace(/\s+/g, '')}@truckbook.pk`,
        userPhone,
        city,
        address: address || 'Main Transport Hub',
        planId: selectedPlanId,
        paymentMethod,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Register Transport Company</h2>
              <p className="text-[10px] text-blue-200">TruckBook SaaS Multi-Tenant Onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        <div className="bg-slate-900/90 px-4 py-2 flex items-center justify-between text-[10px] font-semibold text-slate-300 border-b border-slate-800">
          <div className={`flex items-center gap-1 ${step >= 1 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
            <span>Account</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-700" />
          <div className={`flex items-center gap-1 ${step >= 2 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
            <span>Plan</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-700" />
          <div className={`flex items-center gap-1 ${step >= 3 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
            <span>Payment</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-700" />
          <div className={`flex items-center gap-1 ${step === 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>✓</span>
            <span>Ready</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {formError && (
            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {formError}
            </div>
          )}

          {/* STEP 1: Company & Admin Profile */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Transport Company Details
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Create a dedicated, isolated workspace for your fleet operations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kohistan Goods Transport Co."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Lahore / Karachi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hub / Stand</label>
                  <input
                    type="text"
                    placeholder="e.g. Badami Bagh Stand"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Company Owner / Admin
                </h3>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malik Imran"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          placeholder="+92 300 1234567"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          placeholder="admin@fleet.pk"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Select Subscription Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Subscription Plan Selection */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Subscription Tier
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Choose a plan scaled to your fleet capacity. You can upgrade anytime.
                </p>
              </div>

              <div className="space-y-2.5">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                          {plan.badge}
                        </span>
                      )}

                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{plan.name}</h4>
                            <span className="text-[10px] text-blue-700 font-semibold">
                              Up to {plan.maxTrucks} Trucks • {plan.maxDrivers} Drivers • {plan.maxUsers} Users
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-900">
                            PKR {plan.price.toLocaleString()}
                          </span>
                          <span className="block text-[9px] text-slate-500">
                            /{plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} mos`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                        {plan.features.slice(0, 4).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1 truncate">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment & Confirmation */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-3.5">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Payment & Plan Activation
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confirm subscription billing details for {companyName || 'your company'}.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Tier:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Duration:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.durationMonths} Month(s)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Included Quotas:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.maxTrucks} Trucks / {selectedPlan.maxDrivers} Drivers</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 text-base">PKR {selectedPlan.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Bank Transfer', 'Credit/Debit Card', 'EasyPaisa/JazzCash', 'Cash'] as PaymentMethod[]).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Reference / Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. HBL-ONL-998124 or EP-8823"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant activation: workspace data and dashboard will be provisioned immediately.</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Activate & Launch Fleet</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success & Provisioning */}
          {step === 4 && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Provisioning Company Workspace...</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Setting up tenant data isolation, role policies, and {selectedPlan.name} quotas for <strong>{companyName}</strong>.
              </p>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-blue-600 animate-pulse rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
