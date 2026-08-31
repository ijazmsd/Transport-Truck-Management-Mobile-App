import React, { useState } from 'react';
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Coins,
  CheckCircle2,
  ArrowRight,
  Shield,
  Truck,
  Sparkles,
} from 'lucide-react';
import { Company, Currency, User } from '../types';

interface Props {
  company: Company;
  currentUser: User;
  onSaveCompanySetup: (data: {
    registrationNumber: string;
    taxNumber: string;
    city: string;
    address: string;
    phone: string;
    currency: Currency;
  }) => Promise<void>;
  onComplete: () => void;
}

export const CompanySetupView: React.FC<Props> = ({
  company,
  currentUser,
  onSaveCompanySetup,
  onComplete,
}) => {
  const [regNo, setRegNo] = useState(company.registrationNumber || 'REG-PK-' + Math.floor(100000 + Math.random() * 900000));
  const [taxNo, setTaxNo] = useState(company.taxNumber || 'NTN-786-' + Math.floor(1000 + Math.random() * 9000));
  const [city, setCity] = useState(company.city || 'Lahore');
  const [address, setAddress] = useState(company.address || 'Truck Stand #4, Badami Bagh Hub');
  const [phone, setPhone] = useState(company.phone || currentUser.phone || '+92 300 1234567');
  const [currency, setCurrency] = useState<Currency>(company.currency || 'PKR');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSaveCompanySetup({
        registrationNumber: regNo.trim(),
        taxNumber: taxNo.trim(),
        city: city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        currency,
      });
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1200);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-3 border border-blue-400/30">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white sm:text-2xl">Complete Company Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Finalize your transport fleet credentials to activate full Bilty & Trip operations
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {success ? (
            <div className="text-center py-6 animate-fadeIn">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Setup Completed!</h3>
              <p className="text-xs text-slate-300 mt-1">Opening your fleet dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                  {company.name.charAt(0)}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">{company.name}</div>
                  <div className="text-slate-400 text-[11px]">Tenant ID: {company.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-reg-no">
                    Govt. Registration / License No. <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="company-reg-no"
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. REG-PK-89234"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-tax-no">
                    National Tax Number (NTN / STRN)
                  </label>
                  <input
                    id="company-tax-no"
                    type="text"
                    value={taxNo}
                    onChange={(e) => setTaxNo(e.target.value)}
                    placeholder="e.g. NTN-98234-1"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-city-input">
                    Fleet Headquarters City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="company-city-input"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Rawalpindi"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-currency">
                    Operating Currency
                  </label>
                  <select
                    id="company-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PKR">Pakistani Rupee (PKR - ₨)</option>
                    <option value="USD">US Dollar (USD - $)</option>
                    <option value="AED">UAE Dirham (AED - د.إ)</option>
                    <option value="SAR">Saudi Riyal (SAR - ﷼)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-phone">
                    Primary Office Contact Phone
                  </label>
                  <input
                    id="company-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="company-full-address">
                    Main Terminal / Stand Address
                  </label>
                  <textarea
                    id="company-full-address"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Gate 3, New Goods Transport Terminal, Ring Road"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Finish Setup & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
