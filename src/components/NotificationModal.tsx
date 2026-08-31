import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  CreditCard,
  UserCheck,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { AppNotification, NotificationCategory, UserRole } from '../types';

interface Props {
  isOpen: boolean;
  notifications: AppNotification[];
  currentRole: UserRole;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  onActionClick?: (notification: AppNotification) => void;
}

export const NotificationModal: React.FC<Props> = ({
  isOpen,
  notifications,
  currentRole,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onActionClick,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Filter notifications relevant to current user role and active category tab
  const roleFiltered = notifications.filter((n) => {
    if (!n.targetRole || n.targetRole === 'all') return true;
    return n.targetRole === currentRole;
  });

  const displayedList = roleFiltered.filter((n) => {
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  const unreadTotal = roleFiltered.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category?: NotificationCategory, type?: string) => {
    switch (category) {
      case 'expense':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'user':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'subscription':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'document':
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">Notifications</h2>
                {unreadTotal > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadTotal} New
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">TruckBook Fleet & Account Alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadTotal > 0 && (
              <button
                onClick={onMarkAllRead}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Mark All Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'expense', label: 'Expenses' },
            { id: 'user', label: 'Users' },
            { id: 'subscription', label: 'Subscription' },
            { id: 'document', label: 'Documents' },
          ].map((tab) => {
            const count = roleFiltered.filter((n) =>
              tab.id === 'all' ? true : n.category === tab.id
            ).length;
            const hasUnread = roleFiltered.some(
              (n) => !n.isRead && (tab.id === 'all' ? true : n.category === tab.id)
            );

            return (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`py-1 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                  filterCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      filterCategory === tab.id
                        ? 'bg-blue-800 text-blue-100'
                        : hasUnread
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
          {displayedList.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">No Notifications</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                You're all caught up! New alerts and workflow triggers will appear here.
              </p>
            </div>
          ) : (
            displayedList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) onMarkRead(notif.id);
                  if (onActionClick) onActionClick(notif);
                }}
                className={`pt-2.5 first:pt-0 pb-1 cursor-pointer transition rounded-xl p-2.5 ${
                  !notif.isRead
                    ? 'bg-blue-50/60 border border-blue-200/80 shadow-xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getCategoryIcon(notif.category, notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold truncate ${
                          !notif.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {notif.date}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getSeverityBadge(
                            notif.severity
                          )}`}
                        >
                          {notif.category || 'System'}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onActionClick && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notif.isRead) onMarkRead(notif.id);
                              onActionClick(notif);
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(notif.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Showing real-time events for role: <span className="font-bold text-slate-700">{currentRole}</span>
        </div>
      </div>
    </div>
  );
};
