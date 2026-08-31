import React, { useState } from 'react';
import {
  Truck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Building2,
  KeyRound,
  Crown,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../types';

interface Props {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  onNavigateToRegister: () => void;
  onNavigateToPlans?: () => void;
  initialSuccessMessage?: string | null;
  initialWarningMessage?: string | null;
}

export const LoginView: React.FC<Props> = ({
  onLogin,
  onNavigateToRegister,
  onNavigateToPlans,
  initialSuccessMessage,
  initialWarningMessage,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(initialSuccessMessage || null);
  const [warningBanner, setWarningBanner] = useState<string | null>(initialWarningMessage || null);
  const [showQuickLogins, setShowQuickLogins] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessBanner(null);
    setWarningBanner(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const result = await onLogin(email.trim(), password.trim(), rememberMe);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    setWarningBanner(null);
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 shadow-xl shadow-blue-500/20 border border-blue-400/30 mb-3 animate-fadeIn">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Truck<span className="text-blue-400">Book</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Transport Fleet Management & Bilty Logistics SaaS
        </p>
      </div>

      {/* Main Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Sign In to Your Account</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your fleet credentials to access your portal
            </p>
          </div>

          {/* Success Banner (e.g. from Registration) */}
          {successBanner && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Account Created!</span>
                <span className="text-[11px] leading-relaxed text-emerald-300">{successBanner}</span>
              </div>
            </div>
          )}

          {/* Warning Banner (e.g. Session Expired or Protected Route Access) */}
          {warningBanner && (
            <div className="mb-4 p-3 bg-amber-950/80 border border-amber-700 text-amber-200 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Notice</span>
                <span className="text-[11px] leading-relaxed text-amber-300">{warningBanner}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700 text-rose-200 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Authentication Failed</span>
                <span className="text-[11px] leading-relaxed text-rose-300">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                />
                <span>Remember this session</span>
              </label>

              <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to TruckBook</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 border-t border-slate-700/60 relative">
            <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-slate-800 px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              New Client?
            </span>
          </div>

          {/* Register Action */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="w-full py-2.5 px-3 bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Register Transport Company (SaaS)</span>
            </button>

            {onNavigateToPlans && (
              <button
                type="button"
                onClick={onNavigateToPlans}
                className="w-full py-1.5 px-2 text-[11px] text-slate-400 hover:text-blue-300 flex items-center justify-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>View SaaS Pricing & Subscription Plans</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Fast Logins Drawer for Testing all 12 Scenarios */}
        <div className="mt-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Quick-Fill Accounts (Testing)</span>
            </div>
            <button
              onClick={() => setShowQuickLogins(!showQuickLogins)}
              className="text-[10px] text-slate-400 hover:text-white transition"
            >
              {showQuickLogins ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showQuickLogins && (
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@truckbook.com')}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>Company Admin</span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">admin@truckbook.com</div>
                </div>
                <span className="text-[9px] bg-purple-950 text-purple-300 px-1 rounded border border-purple-800">
                  Active
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('rashid.driver@truckbook.com')}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-400" />
                    <span>Fleet Driver</span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">rashid.driver@truckbook.com</div>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-800">
                  Driver
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('operations@truckbook.com')}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span>Operations Mgr</span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">operations@truckbook.com</div>
                </div>
                <span className="text-[9px] bg-blue-950 text-blue-300 px-1 rounded border border-blue-800">
                  Manager
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('provider@truckbook.com')}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Provider Admin</span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">provider@truckbook.com</div>
                </div>
                <span className="text-[9px] bg-amber-950 text-amber-300 px-1 rounded border border-amber-800">
                  SaaS Root
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('owner@induscargo.pk')}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>Expired Client</span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">owner@induscargo.pk</div>
                </div>
                <span className="text-[9px] bg-rose-950 text-rose-300 px-1 rounded border border-rose-800">
                  Expired Sub
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('newclient@example.com')}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>No Subscription</span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">newclient@example.com</div>
                </div>
                <span className="text-[9px] bg-amber-950 text-amber-300 px-1 rounded border border-amber-800">
                  /plans
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
