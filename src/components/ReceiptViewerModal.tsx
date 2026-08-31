import React from 'react';
import { X, ZoomIn, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Expense } from '../types';

interface Props {
  isOpen: boolean;
  expense: Expense | null;
  currency: string;
  onClose: () => void;
  onApprove?: (expenseId: string) => void;
  onReject?: (expense: Expense) => void;
  isAdminOrManager?: boolean;
}

export const ReceiptViewerModal: React.FC<Props> = ({
  isOpen,
  expense,
  currency,
  onClose,
  onApprove,
  onReject,
  isAdminOrManager = false,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-800 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-xs font-bold leading-tight">{expense.category} Receipt</h3>
              <p className="text-[10px] text-slate-400">
                {currency} {expense.amount.toLocaleString()} • {expense.date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Image / Content */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-950 flex flex-col items-center justify-center min-h-[260px]">
          {expense.receiptUrl ? (
            <div className="relative group w-full flex justify-center">
              <img
                src={expense.receiptUrl}
                alt="Expense Receipt"
                className="max-h-[340px] w-auto object-contain rounded-lg border border-slate-800 shadow-md"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-slate-300 flex items-center gap-1">
                <ZoomIn className="w-3 h-3" />
                <span>Verified Upload</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-slate-400">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No Receipt Photo Attached</p>
              <p className="text-[10px] text-slate-500 mt-1">
                This expense was recorded as a manual ledger entry.
              </p>
            </div>
          )}

          {/* Details Box */}
          <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  expense.status === 'Approved'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : expense.status === 'Pending'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {expense.status || 'Approved'}
              </span>
            </div>

            {expense.fuelStation && (
              <div className="flex justify-between">
                <span className="text-slate-500">Fuel Station:</span>
                <span className="font-semibold text-slate-200">{expense.fuelStation}</span>
              </div>
            )}

            {expense.liters && (
              <div className="flex justify-between">
                <span className="text-slate-500">Volume & Rate:</span>
                <span className="font-semibold text-slate-200">
                  {expense.liters} L @ Rs.{expense.pricePerLiter || 0}/L
                </span>
              </div>
            )}

            {expense.odometerReading && (
              <div className="flex justify-between">
                <span className="text-slate-500">Odometer:</span>
                <span className="font-semibold text-slate-200">{expense.odometerReading.toLocaleString()} km</span>
              </div>
            )}

            {expense.description && (
              <div className="pt-1 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px]">Note:</span>
                <p className="text-[11px] text-slate-300 italic">{expense.description}</p>
              </div>
            )}

            {expense.rejectionReason && (
              <div className="p-2 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300 text-[11px]">
                <span className="font-bold block text-[10px] text-rose-400">Rejection Reason:</span>
                {expense.rejectionReason}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          {isAdminOrManager && expense.status === 'Pending' && onApprove && onReject ? (
            <>
              <button
                onClick={() => onReject(expense)}
                className="flex-1 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => onApprove(expense.id)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Close Viewer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
