import React from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Code,
  Smartphone,
  ArrowLeft,
  Bell,
  Building2,
} from 'lucide-react';
import { User, Company } from '../types';
import { UserSwitcher } from './UserSwitcher';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  isCodeView: boolean;
  onToggleCodeView: () => void;
  onBack?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  currentUser?: User;
  allUsers?: User[];
  onSelectUser?: (user: User) => void;
  onOpenUserManagement?: () => void;
  onOpenRegistration?: () => void;
  companies?: Company[];
  activeTenantId?: string;
  onSwitchTenant?: (tenantId: string) => void;
  onOpenClientRegistration?: () => void;
  currentCompany?: Company;
}

export const MobileFrame: React.FC<Props> = ({
  children,
  activeTab,
  isCodeView,
  onToggleCodeView,
  onBack,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  currentUser,
  allUsers = [],
  onSelectUser,
  onOpenUserManagement,
  onOpenRegistration,
  companies = [],
  activeTenantId,
  onSwitchTenant,
  onOpenClientRegistration,
  currentCompany,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md h-screen sm:h-[92vh] max-h-[920px] bg-slate-100 rounded-none sm:rounded-[36px] shadow-2xl border-0 sm:border-8 border-slate-950 flex flex-col relative overflow-hidden ring-1 ring-slate-800/40">
        
        {/* Android Status Bar */}
        <div className="h-7 bg-slate-900 text-white px-5 flex justify-between items-center text-[11px] font-medium z-30 select-none">
          <span className="font-semibold tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <Battery className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Top App Header with Notification Bell & User Switcher & Flutter Code Toggle */}
        <div className="bg-slate-900 text-white px-3.5 py-2 flex justify-between items-center border-b border-slate-800 z-30 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button onClick={onBack} className="p-1 -ml-1 text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                <Smartphone className="w-3 h-3 shrink-0" />
                <span className="truncate">TruckBook</span>
                {currentCompany && currentUser?.role !== 'Provider Admin' && (
                  <span className="text-[9px] text-slate-400 font-normal truncate max-w-[85px]">
                    • {currentCompany.name}
                  </span>
                )}
                {currentUser?.role === 'Provider Admin' && (
                  <span className="text-[9px] text-amber-400 font-extrabold truncate">
                    • Root Provider
                  </span>
                )}
              </div>
              <h1 className="text-xs font-bold text-slate-200 capitalize truncate">
                {isCodeView
                  ? 'Flutter Source Code'
                  : currentUser?.role === 'Provider Admin' && activeTab === 'dashboard'
                  ? 'SaaS Super Admin'
                  : `${activeTab} View`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Notification Bell 🔔 */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full px-1 flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Role & User & Tenant Switcher */}
            {currentUser && onSelectUser && onOpenUserManagement && onOpenRegistration && (
              <UserSwitcher
                currentUser={currentUser}
                allUsers={allUsers}
                onSelectUser={onSelectUser}
                onOpenUserManagement={onOpenUserManagement}
                onOpenRegistration={onOpenRegistration}
                companies={companies}
                activeTenantId={activeTenantId}
                onSwitchTenant={onSwitchTenant}
                onOpenClientRegistration={onOpenClientRegistration}
              />
            )}

            {/* Code / Preview Toggle */}
            <button
              onClick={onToggleCodeView}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold border transition-all ${
                isCodeView
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-800/90 border-slate-700 text-blue-300 hover:bg-slate-700'
              }`}
              title={isCodeView ? 'Switch to App Preview' : 'View Flutter / Dart Code'}
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCodeView ? 'App' : 'Flutter'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Screen View */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
};
