import React, { useState } from 'react';
import { Company, Currency, Subscription, User } from '../types';
import {
  Settings,
  Building,
  DollarSign,
  Database,
  RotateCcw,
  Shield,
  Bell,
  Smartphone,
  Save,
  CheckCircle,
  FileCode,
  Sparkles,
  Users,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

interface Props {
  company: Company;
  currentUser?: User;
  activeSubscription?: Subscription;
  onUpdateCompany: (company: Company) => void;
  onResetDatabase: () => void;
  onOpenCodeViewer: () => void;
  onOpenSubscription?: () => void;
  onOpenUserManagement?: () => void;
  onOpenNotifications?: () => void;
}

export const SettingsView: React.FC<Props> = ({
  company,
  currentUser,
  activeSubscription,
  onUpdateCompany,
  onResetDatabase,
  onOpenCodeViewer,
  onOpenSubscription,
  onOpenUserManagement,
  onOpenNotifications,
}) => {
  const [formData, setFormData] = useState({
    name: company.name,
    phone: company.phone,
    email: company.email,
    address: company.address,
    currency: company.currency,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const currencies: { code: Currency; label: string }[] = [
    { code: 'PKR', label: 'Pakistani Rupee (PKR - Rs.)' },
    { code: 'USD', label: 'US Dollar (USD - $)' },
    { code: 'EUR', label: 'Euro (EUR - €)' },
    { code: 'INR', label: 'Indian Rupee (INR - ₹)' },
    { code: 'AED', label: 'UAE Dirham (AED)' },
    { code: 'SAR', label: 'Saudi Riyal (SAR)' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Company = {
      ...company,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      currency: formData.currency,
      updatedAt: Date.now(),
    };
    onUpdateCompany(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-4 bg-slate-50 text-slate-900">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">System & Account Settings</h1>
          <p className="text-xs text-slate-500">Fleet Profile, Billing & User Roles</p>
        </div>
        <button
          onClick={onOpenCodeViewer}
          className="flex items-center gap-1.5 bg-slate-900 text-blue-300 border border-slate-700 px-3 py-1.5 rounded-xl font-medium text-xs shadow-xs"
        >
          <FileCode className="w-4 h-4 text-blue-400" />
          <span>Flutter Source</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Company settings and currency updated successfully!</span>
        </div>
      )}

      {/* Subscription & Billing Quick Card */}
      {activeSubscription && onOpenSubscription && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-indigo-800/60 space-y-3 text-xs">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Subscription & Billing</h3>
                <p className="text-[10px] text-slate-300">{activeSubscription.planName}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                activeSubscription.status === 'Active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {activeSubscription.status}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Valid Until</span>
              <span className="font-bold text-slate-200">{activeSubscription.expiryDate}</span>
            </div>
            <button
              onClick={onOpenSubscription}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
            >
              <span>Manage Plans</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* User & RBAC Management Card */}
      {onOpenUserManagement && (
        <div
          onClick={onOpenUserManagement}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">User & RBAC Permissions</h3>
              <p className="text-[10px] text-slate-500">Approve drivers, managers, and assign roles</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      )}

      {/* Notification Center Trigger */}
      {onOpenNotifications && (
        <div
          onClick={onOpenNotifications}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Notification History</h3>
              <p className="text-[10px] text-slate-500">View alert log and workflow audit trail</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      )}

      {/* Company Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-xs">
        <h2 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
          <Building className="w-4 h-4 text-blue-600" />
          <span>Company Information</span>
        </h2>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Company / Fleet Business Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Primary Phone</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Head Office / Terminal Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Base Operating Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
            className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-semibold"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>

      {/* Database Management Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-xs">
        <h2 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
          <Database className="w-4 h-4 text-slate-700" />
          <span>Local Device Storage (SQLite)</span>
        </h2>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
          <div>• Database: <span className="font-mono font-bold text-slate-800">truckbook_local.db</span></div>
          <div>• Offline Mode: <span className="font-bold text-emerald-600">Active (100% On-Device)</span></div>
          <div>• Storage Engine: <span className="font-bold text-slate-800">SQLite + SharedPreferences</span></div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Reset database to clean seed state? This will restore sample trucks, drivers, trips, users, and subscriptions.')) {
              onResetDatabase();
            }
          }}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium py-2 rounded-xl flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Clean Seed Database</span>
        </button>
      </div>

      {/* App Version Info */}
      <div className="text-center text-slate-400 text-[11px] pt-2">
        TruckBook Mobile App — Android Production Suite v1.2.0 (RBAC & Subscriptions)
      </div>
    </div>
  );
};
