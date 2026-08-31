import React, { useState } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionPlanId, PaymentMethod } from '../types';

interface Props {
  plans: SubscriptionPlan[];
  onRegisterClient: (payload: {
    userName: string;
    userEmail: string;
    userPhone: string;
    companyName: string;
    password: string;
    city: string;
    address?: string;
    planId?: SubscriptionPlanId;
    paymentMethod?: PaymentMethod;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  onNavigateToLogin: (successMsg?: string) => void;
}

export const RegisterView: React.FC<Props> = ({
  plans,
  onRegisterClient,
  onNavigateToLogin,
}) => {
  // Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('+92 ');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Optional plan selection during onboarding
  const [includePlan, setIncludePlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');

  // UI state
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successDialog, setSuccessDialog] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // 1. Validation
    const cleanName = userName.trim();
    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanPhone = userPhone.trim();
    const cleanCompany = companyName.trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }
    if (!cleanPhone || cleanPhone === '+92') {
      setFormError('Please enter your active contact phone number.');
      return;
    }
    if (!cleanCompany) {
      setFormError('Please enter your Transport Fleet / Company Name.');
      return;
    }
    if (!cleanPassword) {
      setFormError('Please create a password for your account.');
      return;
    }
    if (cleanPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (cleanPassword !== cleanConfirm) {
      setFormError('Password and Confirm Password do not match. Please verify.');
      return;
    }
    if (!agreedToTerms) {
      setFormError('Please agree to the Terms of Service & Multi-Tenant Data Policy.');
      return;
    }

    setLoading(true);
    try {
      const response = await onRegisterClient({
        userName: cleanName,
        userEmail: cleanEmail,
        userPhone: cleanPhone,
        companyName: cleanCompany,
        password: cleanPassword,
        city,
        address: address.trim(),
        planId: includePlan ? selectedPlanId : undefined,
        paymentMethod: includePlan ? paymentMethod : undefined,
      });

      if (!response.success) {
        setFormError(response.error || 'Registration could not be completed. Please try again.');
        setLoading(false);
        return;
      }

      // Success notification
      const successMessage =
        response.message ||
        'Registration successful! Your account has been created. Please login to continue.';
      setSuccessDialog(successMessage);

      // Auto redirect to /login after brief moment
      setTimeout(() => {
        onNavigateToLogin(
          'Account created successfully. Please login with your email and password.'
        );
      }, 1600);
    } catch (err: any) {
      setFormError(err?.message || 'Registration failed due to an unexpected error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 shadow-xl shadow-blue-500/20 border border-blue-400/30 mb-2.5">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Register Transport Company
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Create your TruckBook SaaS tenant account in minutes
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Success Overlay Dialog */}
          {successDialog && (
            <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Registration Successful!</h3>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                {successDialog}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <span>Redirecting to Login page...</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onNavigateToLogin(
                    'Account created successfully. Please login with your email and password.'
                  )
                }
                className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Go to Login Now
              </button>
            </div>
          )}

          {/* Validation Error Message */}
          {formError && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700 text-rose-200 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Validation Error</span>
                <span className="text-[11px] leading-relaxed text-rose-300">{formError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Details Section */}
            <div className="border-b border-slate-700/60 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-2.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>1. Transport Fleet / Company Info</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-name">
                    Transport Company Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Al-Madina Goods Transport"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-city">
                    Operating City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="company-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-address">
                    Terminal / Stand Address
                  </label>
                  <input
                    id="company-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot / Stand / Road (optional)"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Administrator Account Details */}
            <div className="border-b border-slate-700/60 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-2.5">
                <User className="w-3.5 h-3.5" />
                <span>2. Company Administrator Account</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="admin-name">
                    Administrator Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-name"
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Tariq Malik"
                      className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="admin-phone">
                    Phone / WhatsApp Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-phone"
                      type="tel"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="admin-email">
                    Login Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="admin@yourcompany.pk"
                      className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="register-password">
                    Password (min 6 chars) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="confirm-password">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Plan Selection toggle */}
            <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includePlan}
                  onChange={(e) => setIncludePlan(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span>Select & Attach Subscription Plan Now (Optional)</span>
              </label>

              {includePlan && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fadeIn">
                  {plans.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition text-xs ${
                        selectedPlanId === p.id
                          ? 'bg-blue-600/30 border-blue-500 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold truncate">{p.name}</div>
                      <div className="text-[11px] font-mono text-blue-300 font-bold mt-0.5">
                        Rs. {p.price.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{p.durationMonths} Month(s)</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="text-xs pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span className="text-[11px] leading-relaxed text-slate-400">
                  I agree to TruckBook's Multi-Tenant Data Isolation Agreement and SaaS Service Terms.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Tenant Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have account footer */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => onNavigateToLogin()}
              className="text-blue-400 font-bold hover:underline ml-1"
            >
              Sign In to Your Fleet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
