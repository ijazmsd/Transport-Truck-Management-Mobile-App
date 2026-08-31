import React, { useState } from 'react';
import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  Company,
  Truck,
  Driver,
  Trip,
  User,
  ExpenseStatus,
} from '../types';
import { formatCurrency } from '../services/calculations';
import {
  CreditCard,
  Search,
  Plus,
  Fuel,
  Wrench,
  DollarSign,
  Tag,
  Calendar,
  X,
  FileText,
  Filter,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ReceiptViewerModal } from './ReceiptViewerModal';
import { DriverExpenseModal } from './DriverExpenseModal';

interface Props {
  expenses: Expense[];
  trucks: Truck[];
  drivers: Driver[];
  trips: Trip[];
  company: Company;
  currentUser?: User;
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onApproveExpense?: (expenseId: string) => void;
  onRejectExpense?: (expenseId: string, reason: string) => void;
  initialTripId?: string;
}

export const ExpensesView: React.FC<Props> = ({
  expenses,
  trucks,
  drivers,
  trips,
  company,
  currentUser,
  onSaveExpense,
  onDeleteExpense,
  onApproveExpense,
  onRejectExpense,
  initialTripId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [isDriverExpenseModalOpen, setIsDriverExpenseModalOpen] = useState(false);
  const [selectedReceiptExpense, setSelectedReceiptExpense] = useState<Expense | null>(null);

  // Reject Reason Sub-modal
  const [rejectingExpense, setRejectingExpense] = useState<Expense | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState(
    'Receipt image is unreadable or expense does not match trip route.'
  );

  const CATEGORIES: ExpenseCategory[] = [
    'Fuel',
    'Toll',
    'Maintenance',
    'Driver Advance',
    'Driver Salary',
    'Loading',
    'Unloading',
    'Insurance',
    'Registration',
    'Repair',
    'Office',
    'Other',
  ];

  const isAdminOrManager = !currentUser || currentUser.role === 'Admin' || currentUser.role === 'Manager';

  // Role-filtered view: If logged in as Driver, they see their own expenses by default + general fleet
  const roleFilteredExpenses = expenses.filter((e) => {
    if (!currentUser || currentUser.role !== 'Driver') return true;
    return e.userId === currentUser.id || e.driverId === currentUser.driverId;
  });

  const filteredExpenses = roleFilteredExpenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.fuelStation && e.fuelStation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'All' || (e.status || 'Approved') === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const pendingApprovals = expenses.filter((e) => e.status === 'Pending');
  const totalExpenseSum = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleConfirmReject = () => {
    if (!rejectingExpense || !onRejectExpense) return;
    onRejectExpense(rejectingExpense.id, rejectionReasonText);
    setRejectingExpense(null);
    if (selectedReceiptExpense?.id === rejectingExpense.id) {
      setSelectedReceiptExpense(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3 bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Expense Register</h1>
          <p className="text-xs text-slate-500">
            Total Filtered: {formatCurrency(totalExpenseSum, company.currency)}
          </p>
        </div>
        <button
          onClick={() => setIsDriverExpenseModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{currentUser?.role === 'Driver' ? 'Submit Expense' : 'Log Expense'}</span>
        </button>
      </div>

      {/* Pending Approvals Alert Banner for Admins/Managers */}
      {isAdminOrManager && pendingApprovals.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {pendingApprovals.length} Pending Driver Expense{pendingApprovals.length > 1 ? 's' : ''}
              </h4>
              <p className="text-[10px] text-amber-800">Review fuel & trip receipts submitted by drivers</p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Pending')}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-xs"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses, fuel stations, slips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'All', label: 'All Expenses' },
            { id: 'Pending', label: `Pending (${pendingApprovals.length})` },
            { id: 'Approved', label: 'Approved' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Entries List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-4">
            <CreditCard className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">No Expenses Found</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No matching expense records for the selected filters.
            </p>
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const trip = trips.find((t) => t.id === exp.tripId);
            const truck = trucks.find((t) => t.id === exp.truckId);
            const driver = drivers.find((d) => d.id === exp.driverId);
            const expStatus: ExpenseStatus = exp.status || 'Approved';

            return (
              <div
                key={exp.id}
                className={`bg-white rounded-2xl p-3.5 border transition ${
                  expStatus === 'Pending'
                    ? 'border-amber-300 bg-amber-50/30 shadow-xs'
                    : expStatus === 'Rejected'
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {exp.category}
                      </span>

                      {/* Approval Status Badge */}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                          expStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : expStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {expStatus === 'Approved' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {expStatus === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                        {expStatus === 'Rejected' && <AlertCircle className="w-2.5 h-2.5" />}
                        <span>{expStatus}</span>
                      </span>

                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {exp.description}
                      </span>
                    </div>

                    {/* Fuel details if present */}
                    {exp.category === 'Fuel' && (exp.liters || exp.fuelStation) && (
                      <div className="text-[11px] text-amber-900 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/80 flex items-center gap-2">
                        <Fuel className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">
                          {exp.fuelStation || 'Fuel Pump'}
                          {exp.liters ? ` • ${exp.liters} L @ Rs.${exp.pricePerLiter || 0}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Meta tags */}
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-0.5">
                      <span>📅 {exp.date}</span>
                      <span>💳 {exp.paymentMethod}</span>
                      {truck && <span>🚛 {truck.regNumber}</span>}
                      {trip && <span>📦 {trip.tripNumber}</span>}
                      {driver && <span>👤 {driver.name.split(' ')[0]}</span>}
                      {exp.approvedBy && (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Verified by {exp.approvedBy}
                        </span>
                      )}
                    </div>

                    {/* Rejection Note */}
                    {exp.rejectionReason && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
                        <span className="font-bold">Reason:</span> {exp.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Right side: Amount & Actions */}
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <div className="text-sm font-black text-rose-600 font-mono">
                      {formatCurrency(exp.amount, company.currency)}
                    </div>

                    {/* Receipt image trigger button */}
                    {exp.receiptUrl && (
                      <button
                        onClick={() => setSelectedReceiptExpense(exp)}
                        className="mt-1.5 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>View Slip</span>
                      </button>
                    )}

                    {isAdminOrManager && expStatus === 'Pending' ? (
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => setRejectingExpense(exp)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onApproveExpense && onApproveExpense(exp.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                        >
                          Approve
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm('Delete this expense entry?')) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="text-[10px] text-slate-400 hover:text-rose-500 mt-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Driver Expense & Fuel Submission Modal */}
      {isDriverExpenseModalOpen && (
        <DriverExpenseModal
          isOpen={isDriverExpenseModalOpen}
          currentUser={
            currentUser || {
              id: 'usr_admin',
              name: 'Tariq Mehmood',
              phone: '+92 300 8472911',
              role: 'Admin',
              status: 'Active',
            }
          }
          trips={trips}
          trucks={trucks}
          initialTripId={initialTripId}
          onClose={() => setIsDriverExpenseModalOpen(false)}
          onSubmitExpense={(newExp) => onSaveExpense(newExp as Expense)}
        />
      )}

      {/* Receipt Image Lightbox Viewer */}
      {selectedReceiptExpense && (
        <ReceiptViewerModal
          isOpen={!!selectedReceiptExpense}
          expense={selectedReceiptExpense}
          currency={company.currency}
          onClose={() => setSelectedReceiptExpense(null)}
          onApprove={(id) => {
            if (onApproveExpense) onApproveExpense(id);
            setSelectedReceiptExpense(null);
          }}
          onReject={(exp) => setRejectingExpense(exp)}
          isAdminOrManager={isAdminOrManager}
        />
      )}

      {/* Reject Reason Sub-Modal */}
      {rejectingExpense && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-xs font-bold">Reject Expense Claim</h3>
            </div>
            <p className="text-[11px] text-slate-600">
              Enter reason for rejecting claim of {company.currency}{' '}
              {rejectingExpense.amount.toLocaleString()}. The driver will be notified.
            </p>
            <textarea
              rows={3}
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingExpense(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
