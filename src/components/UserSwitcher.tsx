import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserCheck, Shield, Truck, ChevronDown, UserPlus, LogOut, Check } from 'lucide-react';

interface Props {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onOpenUserManagement: () => void;
  onOpenRegistration: () => void;
}

export const UserSwitcher: React.FC<Props> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onOpenUserManagement,
  onOpenRegistration,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-3 h-3 text-purple-400" />;
      case 'Manager':
        return <UserCheck className="w-3 h-3 text-blue-400" />;
      case 'Driver':
        return <Truck className="w-3 h-3 text-emerald-400" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'Manager':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Driver':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

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
            <span className="text-[11px] font-bold text-white leading-none truncate max-w-[80px]">
              {currentUser.name.split(' ')[0]}
            </span>
            <span
              className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded border ${getRoleBadgeColor(
                currentUser.role
              )}`}
            >
              {currentUser.role}
            </span>
          </div>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-1.5 animate-fadeIn">
            <div className="px-2 py-1.5 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch User / Role
              </span>
              <span className="text-[10px] text-blue-400 font-semibold">Demo RBAC</span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1 no-scrollbar">
              {allUsers.map((user) => {
                const isSelected = currentUser.id === user.id;
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
                            className={`text-[9px] font-bold px-1 rounded ${getRoleBadgeColor(user.role)}`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`text-[9px] font-semibold ${
                              user.status === 'Active'
                                ? 'text-emerald-400'
                                : user.status === 'Pending Approval'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            • {user.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-slate-800 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenRegistration();
                }}
                className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Request New Registration</span>
              </button>

              {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
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
