import React, { useState } from 'react';
import { User, UserRole, Company } from '../types';
import {
  UserCheck,
  Shield,
  Truck,
  ChevronDown,
  UserPlus,
  Building2,
  Check,
  Crown,
  Calculator,
  PlusCircle,
} from 'lucide-react';

interface Props {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onOpenUserManagement: () => void;
  onOpenRegistration: () => void;
  companies?: Company[];
  activeTenantId?: string;
  onSwitchTenant?: (tenantId: string) => void;
  onOpenClientRegistration?: () => void;
}

export const UserSwitcher: React.FC<Props> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onOpenUserManagement,
  onOpenRegistration,
  companies = [],
  activeTenantId,
  onSwitchTenant,
  onOpenClientRegistration,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'users' | 'tenants'>('users');

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Provider Admin':
        return <Crown className="w-3 h-3 text-amber-400" />;
      case 'Admin':
      case 'Company Admin':
        return <Shield className="w-3 h-3 text-purple-400" />;
      case 'Manager':
        return <UserCheck className="w-3 h-3 text-blue-400" />;
      case 'Accountant':
        return <Calculator className="w-3 h-3 text-cyan-400" />;
      case 'Driver':
        return <Truck className="w-3 h-3 text-emerald-400" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Provider Admin':
        return 'bg-amber-950/90 text-amber-300 border-amber-700/90';
      case 'Admin':
      case 'Company Admin':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'Manager':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Accountant':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      case 'Driver':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

  const currentCompany = companies.find((c) => c.id === activeTenantId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 transition shadow-2xs"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white border border-slate-600 shrink-0">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            currentUser.name.charAt(0)
          )}
        </div>
        <div className="text-left hidden xs:block">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-white leading-none truncate max-w-[75px]">
              {currentUser.name.split(' ')[0]}
            </span>
            <span
              className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded border ${getRoleBadgeColor(
                currentUser.role
              )}`}
            >
              {currentUser.role === 'Provider Admin' ? 'SaaS Root' : currentUser.role}
            </span>
          </div>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2.5 text-xs space-y-2 animate-fadeIn">
            {/* Header Switcher Tabs */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex gap-2">
                <button
                  onClick={() => setTab('users')}
                  className={`text-[10px] font-bold uppercase tracking-wider pb-0.5 border-b-2 transition ${
                    tab === 'users' ? 'border-blue-400 text-blue-400' : 'border-transparent text-slate-400'
                  }`}
                >
                  Switch User ({allUsers.length})
                </button>
                {companies.length > 0 && (
                  <button
                    onClick={() => setTab('tenants')}
                    className={`text-[10px] font-bold uppercase tracking-wider pb-0.5 border-b-2 transition ${
                      tab === 'tenants' ? 'border-blue-400 text-blue-400' : 'border-transparent text-slate-400'
                    }`}
                  >
                    Tenants ({companies.length})
                  </button>
                )}
              </div>
              <span className="text-[9px] text-indigo-400 font-semibold bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-800">
                Multi-Tenant
              </span>
            </div>

            {/* USERS TAB */}
            {tab === 'users' && (
              <div className="max-h-56 overflow-y-auto space-y-1 no-scrollbar">
                {allUsers.map((user) => {
                  const isSelected = currentUser.id === user.id;
                  const userComp = companies.find((c) => c.id === user.tenantId);

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        setIsOpen(false);
                      }}
                      className={`w-full p-1.5 rounded-xl flex items-center justify-between text-left transition ${
                        isSelected
                          ? 'bg-blue-600/30 border border-blue-500/50 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0 border border-slate-700">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-slate-100">{user.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-[8px] font-bold px-1 py-0.2 rounded border ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                            {userComp && (
                              <span className="text-[9px] text-slate-400 truncate max-w-[80px]">
                                • {userComp.name.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TENANTS TAB */}
            {tab === 'tenants' && (
              <div className="max-h-56 overflow-y-auto space-y-1.5 no-scrollbar">
                {companies.map((comp) => {
                  const isCurrent = comp.id === activeTenantId;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        if (onSwitchTenant) {
                          onSwitchTenant(comp.id);
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition border ${
                        isCurrent
                          ? 'bg-blue-600/30 border-blue-500/60 text-white'
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {comp.logo ? (
                            <img src={comp.logo} alt={comp.name} className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-slate-100">{comp.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{comp.city} • {comp.phone}</p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-medium">Switch</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-1.5 border-t border-slate-800 space-y-1">
              {onOpenClientRegistration && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenClientRegistration();
                  }}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/70 hover:to-indigo-800/70 text-blue-200 border border-blue-700/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Register New Company (SaaS)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenRegistration();
                }}
                className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Request Staff / Driver Account</span>
              </button>

              {(currentUser.role === 'Admin' ||
                currentUser.role === 'Company Admin' ||
                currentUser.role === 'Provider Admin' ||
                currentUser.role === 'Manager') && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenUserManagement();
                  }}
                  className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>User & RBAC Management</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
