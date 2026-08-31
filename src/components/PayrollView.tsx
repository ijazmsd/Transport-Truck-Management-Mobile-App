import React, { useState } from 'react';
import {
  Driver,
  Trip,
  Expense,
  DriverSalarySettlement,
  Currency,
  PaymentMethod,
} from '../types';
import {
  calculateDriverPayrollBreakdown,
  formatCurrency,
} from '../services/calculations';
import {
  Users,
  Calendar,
  DollarSign,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  ArrowRight,
  TrendingDown,
  Gift,
} from 'lucide-react';

interface PayrollViewProps {
  drivers: Driver[];
  trips: Trip[];
  expenses: Expense[];
  settlements: DriverSalarySettlement[];
  currency: Currency;
  onSaveSettlement: (settlement: DriverSalarySettlement) => void;
  onPrintDocument: (
    docType: 'driver_payslip',
    data: {
      driver: Driver;
      monthPeriod: string;
      breakdown: {
        baseSalary: number;
        tripAllowances: number;
        tripCommissions: number;
        advancesDeducted: number;
        netPayable: number;
        tripsDoneCount: number;
      };
      settlement?: DriverSalarySettlement;
    }
  ) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  drivers,
  trips,
  expenses,
  settlements,
  currency,
  onSaveSettlement,
  onPrintDocument,
}) => {
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. "2026-08"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);

  // Settlement Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleDate, setSettleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('Bank Transfer');
  const [settleRef, setSettleRef] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  // Total Fleet Payroll for the selected month
  let totalNetPayableMonth = 0;
  let totalPaidMonth = 0;

  const driverPayrollSummaries = drivers.map((driver) => {
    const breakdown = calculateDriverPayrollBreakdown(
      driver,
      trips,
      expenses,
      selectedMonth
    );

    const existingSettlement = settlements.find(
      (s) => s.driverId === driver.id && s.monthPeriod === selectedMonth
    );

    totalNetPayableMonth += breakdown.netPayable;
    if (existingSettlement) {
      totalPaidMonth += existingSettlement.paidAmount;
    }

    return {
      driver,
      breakdown,
      settlement: existingSettlement,
      isSettled: !!existingSettlement,
    };
  });

  const openSettleModal = (
    driver: Driver,
    breakdown: ReturnType<typeof calculateDriverPayrollBreakdown>
  ) => {
    setActiveDriver(driver);
    setSettleAmount(breakdown.netPayable);
    setSettleDate(new Date().toISOString().split('T')[0]);
    setSettleMethod('Bank Transfer');
    setSettleRef(`SAL-${selectedMonth.replace('-', '')}-${driver.name.substring(0, 3).toUpperCase()}`);
    setSettleNotes(`Salary settlement for ${selectedMonth}`);
    setIsSettleModalOpen(true);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDriver || settleAmount <= 0) return;

    const breakdown = calculateDriverPayrollBreakdown(
      activeDriver,
      trips,
      expenses,
      selectedMonth
    );

    const settlement: DriverSalarySettlement = {
      id: `sal_${selectedMonth.replace('-', '')}_${activeDriver.id}`,
      driverId: activeDriver.id,
      monthPeriod: selectedMonth,
      baseSalary: breakdown.baseSalary,
      tripAllowances: breakdown.tripAllowances,
      tripCommissions: breakdown.tripCommissions,
      advancesDeducted: breakdown.advancesDeducted,
      netPayable: breakdown.netPayable,
      paidAmount: Number(settleAmount),
      paymentDate: settleDate,
      paymentMethod: settleMethod,
      referenceNumber: settleRef.trim() || undefined,
      notes: settleNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    onSaveSettlement(settlement);
    setIsSettleModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-indigo-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Driver Salary & Payroll</h2>
              <p className="text-xs text-indigo-200/70">Wages, Advances, Commissions & Pay Slips</p>
            </div>
          </div>

          {/* Month Picker */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-indigo-500/30">
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            <input
              id="payroll-month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* 2 Summary KPI Cards */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-900/50">
          <div>
            <span className="text-[11px] text-indigo-200/70 block">Total Net Wages for {selectedMonth}</span>
            <span className="text-lg font-bold text-amber-300">
              {formatCurrency(totalNetPayableMonth, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-indigo-200/70 block">Total Settled / Paid</span>
            <span className="text-lg font-bold text-emerald-400">
              {formatCurrency(totalPaidMonth, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Driver Payroll Cards List */}
      <div className="space-y-3">
        {driverPayrollSummaries.map(({ driver, breakdown, settlement, isSettled }) => {
          return (
            <div
              key={driver.id}
              id={`driver-payroll-card-${driver.id}`}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 hover:border-indigo-300 transition"
            >
              {/* Driver Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-indigo-700 text-sm border border-slate-200 shrink-0">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{driver.name}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {driver.salaryType} ({formatCurrency(driver.salary, currency)})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {breakdown.tripsDoneCount} Trips this month
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {isSettled ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      PAID ({formatCurrency(settlement.paidAmount, currency)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      DUE ({formatCurrency(breakdown.netPayable, currency)})
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Calculation Breakdown Table */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-200/80">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Base Wages ({driver.salaryType}):</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(breakdown.baseSalary, currency)}
                  </span>
                </div>

                {breakdown.tripCommissions > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Trip Commissions / Incentive:</span>
                    <span className="font-semibold text-indigo-600">
                      +{formatCurrency(breakdown.tripCommissions, currency)}
                    </span>
                  </div>
                )}

                {breakdown.advancesDeducted > 0 && (
                  <div className="flex justify-between items-center text-rose-600">
                    <span>Trip Advances Taken (Deductions):</span>
                    <span className="font-semibold">
                      -{formatCurrency(breakdown.advancesDeducted, currency)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                  <span className="text-slate-900">Net Payable Amount:</span>
                  <span className="text-sm text-indigo-700">
                    {formatCurrency(breakdown.netPayable, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  id={`print-slip-btn-${driver.id}`}
                  onClick={() =>
                    onPrintDocument('driver_payslip', {
                      driver,
                      monthPeriod: selectedMonth,
                      breakdown,
                      settlement,
                    })
                  }
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pay Slip</span>
                </button>

                {!isSettled ? (
                  <button
                    id={`settle-btn-${driver.id}`}
                    onClick={() => openSettleModal(driver, breakdown)}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Settle & Pay</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Paid on {settlement?.paymentDate} ({settlement?.paymentMethod})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settle Payroll Modal */}
      {isSettleModalOpen && activeDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  Salary Settlement: {activeDriver.name} ({selectedMonth})
                </h3>
              </div>
              <button onClick={() => setIsSettleModalOpen(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Settlement Amount ({currency}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={settleAmount || ''}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={settleDate}
                    onChange={(e) => setSettleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={settleMethod}
                    onChange={(e) => setSettleMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash Voucher</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online">Online / EasyPaisa / JazzCash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Reference / Transaction #</label>
                <input
                  type="text"
                  placeholder="e.g. HBL-FT-991024 or Cheque #8812"
                  value={settleRef}
                  onChange={(e) => setSettleRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Full settlement with zero advance carried forward"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Record & Clear Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
