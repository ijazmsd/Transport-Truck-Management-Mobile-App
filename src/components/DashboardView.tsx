import React, { useState } from 'react';
import { Company, Currency, Expense, Trip, Truck, Driver, Customer, AppNotification } from '../types';
import { calculateTripIncome, calculateTripExpenses, formatCurrency } from '../services/calculations';
import {
  TrendingUp,
  TrendingDown,
  Truck as TruckIcon,
  Navigation,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  Layers,
  Fuel,
  CreditCard,
  Plus,
} from 'lucide-react';

interface Props {
  company: Company;
  trucks: Truck[];
  drivers: Driver[];
  customers: Customer[];
  trips: Trip[];
  expenses: Expense[];
  notifications: AppNotification[];
  onNavigate: (tab: string) => void;
  onSelectTrip: (trip: Trip) => void;
  onSelectTruck: (truck: Truck) => void;
  onCreateTrip: () => void;
  onCreateExpense: () => void;
}

export const DashboardView: React.FC<Props> = ({
  company,
  trucks,
  drivers,
  customers,
  trips,
  expenses,
  notifications,
  onNavigate,
  onSelectTrip,
  onSelectTruck,
  onCreateTrip,
  onCreateExpense,
}) => {
  const [timeFilter, setTimeFilter] = useState<'Today' | 'This Week' | 'This Month' | 'This Year'>('This Month');

  // Compute Financial Aggregates
  const totalIncome = trips.reduce((acc, trip) => acc + calculateTripIncome(trip), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const marginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Fleet Aggregates
  const availableTrucks = trucks.filter((t) => t.status === 'Available').length;
  const onTripTrucks = trucks.filter((t) => t.status === 'On Trip').length;
  const maintenanceTrucks = trucks.filter((t) => t.status === 'Maintenance').length;

  // Trip Aggregates
  const activeTrips = trips.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
  const completedTrips = trips.filter((t) => t.status === 'Completed').length;

  // Customer Receivables
  const totalCustomerReceivables = 445000; // Simulated ledger balance

  // Unread Alerts
  const unreadAlerts = notifications.filter((n) => !n.isRead);

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-4 bg-slate-50 text-slate-900">
      {/* Top Greeting & Company Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <span>●</span> Good Morning
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white mt-0.5">{company.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{company.address}</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-800 text-blue-300 border border-slate-700 rounded-lg text-xs font-mono font-medium">
            {company.currency}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
          {(['Today', 'This Week', 'This Month', 'This Year'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Net Profit Highlight Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-emerald-100 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {timeFilter} Net Profit
          </span>
          <span className="bg-emerald-500/30 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/20">
            {marginPercent}% Margin
          </span>
        </div>
        <div className="text-2xl font-black tracking-tight">{formatCurrency(netProfit, company.currency)}</div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-500/30 text-xs">
          <div>
            <div className="text-emerald-200 text-[11px]">Total Revenue</div>
            <div className="font-bold text-sm text-white">{formatCurrency(totalIncome, company.currency)}</div>
          </div>
          <div>
            <div className="text-emerald-200 text-[11px]">Total Expenses</div>
            <div className="font-bold text-sm text-white">{formatCurrency(totalExpenses, company.currency)}</div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onCreateTrip}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip Entry</span>
        </button>
        <button
          onClick={onCreateExpense}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-800 border border-slate-200 py-2.5 px-3 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <CreditCard className="w-4 h-4 text-slate-600" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Alerts Carousel / Urgent Notifications */}
      {unreadAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Critical Action Required ({unreadAlerts.length})</span>
            </div>
            <button
              onClick={() => onNavigate('more')}
              className="text-amber-700 text-xs font-semibold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {unreadAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="bg-white/80 rounded-xl p-2.5 border border-amber-200/60 text-xs">
                <div className="font-semibold text-slate-900">{alert.title}</div>
                <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fleet Status Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TruckIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fleet Status</h2>
              <p className="text-[11px] text-slate-500">{trucks.length} Total Registered Trucks</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('fleet')}
            className="text-xs font-medium text-blue-600 flex items-center gap-0.5 hover:underline"
          >
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
            <div className="text-emerald-700 text-lg font-black">{availableTrucks}</div>
            <div className="text-[11px] text-emerald-800 font-medium">Available</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5">
            <div className="text-blue-700 text-lg font-black">{onTripTrucks}</div>
            <div className="text-[11px] text-blue-800 font-medium">On Trip</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
            <div className="text-amber-700 text-lg font-black">{maintenanceTrucks}</div>
            <div className="text-[11px] text-amber-800 font-medium">Maintenance</div>
          </div>
        </div>
      </div>

      {/* Active & Recent Trips */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active & Recent Trips</h2>
              <p className="text-[11px] text-slate-500">{activeTrips} In Progress / {completedTrips} Completed</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('trips')}
            className="text-xs font-medium text-blue-600 flex items-center gap-0.5 hover:underline"
          >
            All Trips <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {trips.slice(0, 3).map((trip) => {
            const truck = trucks.find((t) => t.id === trip.truckId);
            const driver = drivers.find((d) => d.id === trip.driverId);
            const customer = customers.find((c) => c.id === trip.customerId);
            const tripIncome = calculateTripIncome(trip);

            return (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 rounded-xl p-3 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{trip.tripNumber}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          trip.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : trip.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium mt-1">
                      {trip.fromLocation} → {trip.toLocation}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      {formatCurrency(tripIncome, company.currency)}
                    </div>
                    <div className="text-[10px] text-slate-500">{trip.cargoWeight} Tons</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>🚛 {truck?.regNumber || 'Unassigned'}</span>
                  <span>👤 {driver?.name?.split(' ')[0] || 'Driver'}</span>
                  <span>🏢 {customer?.name?.split(' ')[0] || 'Customer'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accounting Quick Overview */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Receivables & Balances</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-slate-500 text-[11px]">Customer Outstanding</div>
            <div className="text-sm font-bold text-rose-600 mt-0.5">
              {formatCurrency(totalCustomerReceivables, company.currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">From 3 active customer ledgers</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-slate-500 text-[11px]">Driver Advances Held</div>
            <div className="text-sm font-bold text-amber-600 mt-0.5">
              {formatCurrency(15000, company.currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Settled upon trip completion</div>
          </div>
        </div>
      </div>
    </div>
  );
};
