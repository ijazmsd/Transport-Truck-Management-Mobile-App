import React, { useState } from 'react';
import {
  Truck,
  User as UserIcon,
  Navigation,
  Fuel,
  Receipt,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  MapPin,
  Calendar,
  Building2,
  Plus,
} from 'lucide-react';
import { User, Trip, FuelEntry, Expense, DriverSalarySettlement, Company, Currency } from '../types';

interface Props {
  currentUser: User;
  company: Company;
  trips: Trip[];
  fuelEntries: FuelEntry[];
  expenses: Expense[];
  salarySettlements: DriverSalarySettlement[];
  onRequestLogout: () => void;
  onAddFuelEntry?: () => void;
  onAddExpense?: () => void;
}

export const DriverDashboardView: React.FC<Props> = ({
  currentUser,
  company,
  trips,
  fuelEntries,
  expenses,
  salarySettlements,
  onRequestLogout,
  onAddFuelEntry,
  onAddExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'trips' | 'fuel' | 'expenses' | 'salary'>('trips');

  // Filter items for current driver
  const myTrips = trips.filter(
    (t) =>
      t.driverName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      currentUser.notes?.includes(t.truckNumber)
  );

  const activeTrip = myTrips.find((t) => t.status === 'In Transit' || t.status === 'Loading');

  const myFuel = fuelEntries.filter((f) =>
    f.driverName?.toLowerCase().includes(currentUser.name.toLowerCase())
  );

  const myExpenses = expenses.filter(
    (e) =>
      e.recordedBy?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      e.category === 'Driver Allowance'
  );

  const mySalaries = salarySettlements.filter((s) =>
    s.driverName?.toLowerCase().includes(currentUser.name.toLowerCase())
  );

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Driver Header */}
      <header className="bg-slate-800/90 border-b border-slate-700/80 px-4 py-3.5 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{currentUser.name}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  Driver Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>{company.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onRequestLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-600 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-4">
        {/* Active Trip Banner */}
        {activeTrip ? (
          <div className="p-4 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/40 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                <span>Current Active Trip</span>
              </span>
              <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                {activeTrip.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-white mb-2">
              <span>{activeTrip.origin}</span>
              <span className="text-slate-400 text-xs">➔</span>
              <span>{activeTrip.destination}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-500/20 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Truck</span>
                <span className="font-bold text-white font-mono">{activeTrip.truckNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Freight</span>
                <span className="font-bold text-emerald-400">Rs. {activeTrip.freightAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Bilty No.</span>
                <span className="font-mono text-white">{activeTrip.biltyNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Ready for Assignment</h4>
                <p className="text-[11px] text-slate-400">No active in-transit trip assigned currently.</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 font-semibold">
              Available
            </span>
          </div>
        )}

        {/* Action Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-800/90 border border-slate-700 rounded-2xl">
          {[
            { id: 'trips', label: 'My Trips', count: myTrips.length },
            { id: 'fuel', label: 'Fuel Logs', count: myFuel.length },
            { id: 'expenses', label: 'Allowance/Expenses', count: myExpenses.length },
            { id: 'salary', label: 'Salary Ledger', count: mySalaries.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 min-h-[300px]">
          {activeTab === 'trips' && (
            <div className="space-y-2.5">
              {myTrips.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No trips assigned to you yet.
                </div>
              ) : (
                myTrips.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-900/80 border border-slate-700 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{t.origin} ➔ {t.destination}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Truck: {t.truckNumber}</span>
                        <span>•</span>
                        <span>Date: {t.startDate}</span>
                        <span>•</span>
                        <span>Bilty: #{t.biltyNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        Rs. {t.freightAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">Advance: Rs. {t.advancePaid.toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'fuel' && (
            <div className="space-y-2.5">
              {myFuel.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No fuel logs registered yet.
                </div>
              ) : (
                myFuel.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-900/80 border border-slate-700 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span>{f.liters} Liters @ Rs. {f.pricePerLiter}/L</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Station: {f.stationName} • Truck: {f.truckNumber} • {f.date}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-amber-400">
                      Rs. {f.totalCost.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-2.5">
              {myExpenses.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No driver expenses recorded.
                </div>
              ) : (
                myExpenses.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 bg-slate-900/80 border border-slate-700 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{e.category}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {e.description} • {e.date}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-rose-400">
                      -Rs. {e.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-2.5">
              {mySalaries.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No salary payout records found.
                </div>
              ) : (
                mySalaries.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-900/80 border border-slate-700 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {s.month} Settlement
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Base: Rs. {s.baseSalary.toLocaleString()} + Trips Comm: Rs. {s.tripCommission.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-emerald-400">
                      Rs. {s.netPayable.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
