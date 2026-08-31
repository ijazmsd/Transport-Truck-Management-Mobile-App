import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { User, Company } from '../types';

interface Props {
  isOpen: boolean;
  user: User | null;
  company?: Company;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<Props> = ({
  isOpen,
  user,
  company,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1.5">Log Out of TruckBook?</h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Are you sure you want to end your active session for{' '}
          <strong className="text-white">{user?.name || 'your account'}</strong>
          {company?.name ? ` at ${company.name}` : ''}?
        </p>

        <div className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-2xl mb-5 text-[11px] text-slate-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>All local tenant cached credentials will be cleared securely.</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
