import React, { useState } from 'react';
import { Company, Currency } from '../types';
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
} from 'lucide-react';

interface Props {
  company: Company;
  onUpdateCompany: (company: Company) => void;
  onResetDatabase: () => void;
  onOpenCodeViewer: () => void;
}

export const SettingsView: React.FC<Props> = ({
  company,
  onUpdateCompany,
  onResetDatabase,
  onOpenCodeViewer,
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
          <h1 className="text-base font-bold text-slate-900 tracking-tight">System & Fleet Settings</h1>
          <p className="text-xs text-slate-500">Offline SQLite & Company Profile</p>
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
            if (confirm('Reset database to clean seed state? This will restore sample trucks, drivers, and trips.')) {
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
        TruckBook Mobile App — Android Production Suite v1.0.0 (Phase 1 MVP)
      </div>
    </div>
  );
};
