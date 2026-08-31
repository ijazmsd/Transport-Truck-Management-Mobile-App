import React, { useState } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Truck,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Settings,
  DollarSign,
  Download,
  Calendar,
  Lock,
  Edit2,
  Save,
  X,
  Sparkles,
} from 'lucide-react';
import { Company, SubscriptionPlan, PaymentRecord, Subscription, User } from '../types';

interface Props {
  companies: Company[];
  activeTenantId: string;
  onSwitchTenant: (tenantId: string) => void;
  onOpenRegisterClient: () => void;
  allSubscriptions: Subscription[];
  allPayments: PaymentRecord[];
  plans: SubscriptionPlan[];
  onUpdatePlan: (updatedPlan: SubscriptionPlan) => void;
  onToggleCompanyStatus?: (companyId: string) => void;
  allUsers: User[];
  allTrucksCount: number;
  allDriversCount: number;
}

export const ProviderAdminView: React.FC<Props> = ({
  companies,
  activeTenantId,
  onSwitchTenant,
  onOpenRegisterClient,
  allSubscriptions,
  allPayments,
  plans,
  onUpdatePlan,
  onToggleCompanyStatus,
  allUsers,
  allTrucksCount,
  allDriversCount,
}) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'billing'>('tenants');
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Financial Metrics
  const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const activeSubsCount = allSubscriptions.filter((s) => s.status === 'Active').length;
  const expiringSubsCount = allSubscriptions.filter((s) => s.status === 'Expiring Soon').length;

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      onUpdatePlan(editingPlan);
      setEditingPlan(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
      {/* Provider Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 shrink-0 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-extrabold tracking-wide uppercase text-blue-400">
                  TruckBook Provider Portal
                </h2>
                <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded border border-blue-400/40 font-bold">
                  SaaS Root Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Multi-Tenant Management & Platform Analytics
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRegisterClient}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client</span>
          </button>
        </div>

        {/* Global SaaS Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-center">
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Clients</span>
            <span className="text-sm font-extrabold text-white">{companies.length}</span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
            <span className="text-[10px] text-emerald-400 block font-semibold">Active Subs</span>
            <span className="text-sm font-extrabold text-emerald-400">{activeSubsCount}</span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
            <span className="text-[10px] text-blue-300 block font-semibold">SaaS Revenue</span>
            <span className="text-xs font-extrabold text-blue-300">
              PKR {(totalRevenue / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
            <span className="text-[10px] text-amber-400 block font-semibold">Expiring</span>
            <span className="text-sm font-extrabold text-amber-400">{expiringSubsCount}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-3 flex gap-4 text-xs font-bold text-slate-600 shrink-0">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`py-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'tenants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Client Companies ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`py-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'plans'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subscription Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`py-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'billing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Platform Billing ({allPayments.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TAB 1: CLIENT TENANTS LIST */}
        {activeTab === 'tenants' && (
          <div className="space-y-2.5">
            {companies.map((comp) => {
              const compSub = allSubscriptions.find((s) => s.tenantId === comp.id && s.status === 'Active') ||
                allSubscriptions.find((s) => s.tenantId === comp.id);
              const isActiveTenant = comp.id === activeTenantId;

              return (
                <div
                  key={comp.id}
                  className={`bg-white rounded-2xl p-3.5 border transition shadow-2xs ${
                    isActiveTenant
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0 border border-blue-200">
                        {comp.logo ? (
                          <img src={comp.logo} alt={comp.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          comp.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-900 truncate">{comp.name}</h3>
                          {isActiveTenant && (
                            <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                              Active Context
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {comp.city} • {comp.phone} • {comp.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          comp.isSaaSActive !== false
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {comp.isSaaSActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>

                  {/* Subscription details */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">Plan:</span>
                      <span className="font-bold text-indigo-700 text-xs">
                        {compSub ? compSub.planName : 'No Active Plan'}
                      </span>
                      {compSub && (
                        <span className="text-[10px] text-slate-400">
                          (Expires: {compSub.expiryDate})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSwitchTenant(comp.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                          isActiveTenant
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isActiveTenant ? 'Viewing' : 'Switch Context'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SUBSCRIPTION PLANS MANAGER */}
        {activeTab === 'plans' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Platform Pricing & Quota Tiers
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure SaaS tier pricing, truck quotas, and driver limits.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{plan.name}</h4>
                        {plan.badge && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{plan.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900">
                        PKR {plan.price.toLocaleString()}
                      </span>
                      <span className="block text-[9px] text-slate-400">
                        /{plan.durationMonths} mos
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 py-1.5 bg-slate-50 rounded-xl text-center text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Max Trucks</span>
                      <span className="font-bold text-slate-800">{plan.maxTrucks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Max Drivers</span>
                      <span className="font-bold text-slate-800">{plan.maxDrivers}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Max Users</span>
                      <span className="font-bold text-slate-800">{plan.maxUsers}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => setEditingPlan({ ...plan })}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Plan Pricing & Quotas</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan Edit Modal */}
            {editingPlan && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleSavePlan}
                  className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl space-y-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900">Edit {editingPlan.name}</h3>
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={editingPlan.price}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, price: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Max Trucks
                      </label>
                      <input
                        type="number"
                        value={editingPlan.maxTrucks}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, maxTrucks: Number(e.target.value) })
                        }
                        className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Max Drivers
                      </label>
                      <input
                        type="number"
                        value={editingPlan.maxDrivers}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, maxDrivers: Number(e.target.value) })
                        }
                        className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Max Users
                      </label>
                      <input
                        type="number"
                        value={editingPlan.maxUsers}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, maxUsers: Number(e.target.value) })
                        }
                        className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PLATFORM BILLING & INVOICES */}
        {activeTab === 'billing' && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Global Payment Records & Invoices
                </h3>
                <p className="text-[11px] text-slate-500">
                  Transactions processed across all transport companies.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {allPayments.map((p) => {
                const payerCompany = companies.find((c) => c.id === p.tenantId);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900">
                          {payerCompany ? payerCompany.name : p.tenantId}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Ref: {p.referenceNumber} • Method: {p.paymentMethod}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-600">
                          PKR {p.amount.toLocaleString()}
                        </span>
                        <span className="block text-[9px] text-slate-400">{p.paymentDate}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-500">Invoice: {p.invoiceNumber}</span>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.2 rounded-full font-bold">
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
