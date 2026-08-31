import React, { useState } from 'react';
import {
  Company,
  Expense,
  Trip,
  Truck,
  Driver,
  Customer,
  AppNotification,
  User,
  Subscription,
} from '../types';
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
  Sparkles,
  Users,
  ShieldAlert,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface Props {
  company: Company;
  trucks: Truck[];
  drivers: Driver[];
  customers: Customer[];
  trips: Trip[];
  expenses: Expense[];
  notifications: AppNotification[];
  currentUser?: User;
  activeSubscription?: Subscription;
  allUsers?: User[];
  onNavigate: (tab: string) => void;
  onSelectTrip: (trip: Trip) => void;
  onSelectTruck: (truck: Truck) => void;
  onCreateTrip: () => void;
  onCreateExpense: () => void;
  onOpenSubscription?: () => void;
  onOpenUserManagement?: () => void;
}

export const DashboardView: React.FC<Props> = ({
  company,
  trucks,
  drivers,
  customers,
  trips,
  expenses,
  notifications,
  currentUser,
  activeSubscription,
  allUsers = [],
  onNavigate,
  onSelectTrip,
  onSelectTruck,
  onCreateTrip,
  onCreateExpense,
  onOpenSubscription,
  onOpenUserManagement,
}) => {
  const [timeFilter, setTimeFilter] = useState<'Today' | 'This Week' | 'This Month' | 'This Year'>('This Month');

  const isDriver = currentUser?.role === 'Driver';

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
  const totalCustomerReceivables = 445000;

  // Pending Approvals & Requests
  const pendingExpenses = expenses.filter((e) => e.status === 'Pending');
  const pendingUsers = allUsers.filter((u) => u.status === 'Pending Approval');
  const unreadAlerts = notifications.filter((n) => !n.isRead);

  // Driver specific stats
  const driverTrips = trips.filter((t) => t.driverId === currentUser?.driverId);
  const driverActiveTrip = driverTrips.find((t) => t.status === 'In Progress') || driverTrips[0];
  const driverExpenses = expenses.filter(
    (e) => e.userId === currentUser?.id || e.driverId === currentUser?.driverId
  );
  const driverApprovedExpenses = driverExpenses
    .filter((e) => e.status === 'Approved')
    .reduce((a, b) => a + b.amount, 0);
  const driverPendingExpenses = driverExpenses
    .filter((e) => e.status === 'Pending')
    .reduce((a, b) => a + b.amount, 0);

  // Calculate subscription remaining days
  let subDaysLeft = 0;
  if (activeSubscription) {
    const exp = new Date(activeSubscription.expiryDate).getTime();
    subDaysLeft = Math.max(0, Math.ceil((exp - Date.now()) / 86400000));
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3.5 bg-slate-50 text-slate-900">
      
      {/* Subscription Banner / Card */}
      {activeSubscription && (
        <div
          onClick={onOpenSubscription}
          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
            activeSubscription.status === 'Active'
              ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border-indigo-800'
              : activeSubscription.status === 'Expiring Soon'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeSubscription.status === 'Active'
                  ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-400/30'
                  : 'bg-black/20 text-current'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold truncate">{activeSubscription.planName}</span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                    activeSubscription.status === 'Active'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                      : 'bg-black/30 text-white'
                  }`}
                >
                  {activeSubscription.status}
                </span>
              </div>
              <p
                className={`text-[10px] truncate ${
                  activeSubscription.status === 'Active' ? 'text-slate-400' : 'opacity-90'
                }`}
              >
                {subDaysLeft} days remaining • Expires {activeSubscription.expiryDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold shrink-0">
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Top Greeting & Role Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>●</span> {currentUser ? `Welcome, ${currentUser.name}` : 'Welcome Back'}
            </div>
            <h1 className="text-base font-bold tracking-tight text-white mt-0.5">{company.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Role: <span className="font-semibold text-blue-300">{currentUser?.role || 'Admin'}</span> •{' '}
              {company.city}, {company.country}
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-800 text-blue-300 border border-slate-700 rounded-lg text-xs font-mono font-medium">
            {company.currency}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
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

      {/* Pending Admin Approvals Section */}
      {!isDriver && (pendingExpenses.length > 0 || pendingUsers.length > 0) && (
        <div className="grid grid-cols-2 gap-2">
          {pendingUsers.length > 0 && (
            <div
              onClick={onOpenUserManagement}
              className="p-3 bg-blue-50 border border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100/70 transition space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between text-blue-800">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black bg-blue-200/80 px-1.5 py-0.2 rounded-full">
                  {pendingUsers.length}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">User Registrations</h4>
              <p className="text-[10px] text-slate-500">Pending Admin review</p>
            </div>
          )}

          {pendingExpenses.length > 0 && (
            <div
              onClick={() => onNavigate('expenses')}
              className="p-3 bg-amber-50 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100/70 transition space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between text-amber-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black bg-amber-200/80 px-1.5 py-0.2 rounded-full">
                  {pendingExpenses.length}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Driver Slips</h4>
              <p className="text-[10px] text-slate-500">Awaiting expense audit</p>
            </div>
          )}
        </div>
      )}

      {/* Driver Experience Dashboard */}
      {isDriver ? (
        <div className="space-y-3">
          {/* Driver Active Trip Card */}
          {driverActiveTrip ? (
            <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Assigned Active Trip
                </span>
                <span className="text-xs font-bold text-slate-900">{driverActiveTrip.tripNumber}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {driverActiveTrip.fromLocation} → {driverActiveTrip.toLocation}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cargo: {driverActiveTrip.cargoType} • {driverActiveTrip.cargoWeight} Tons
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => onSelectTrip(driverActiveTrip)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition text-center"
                >
                  View Trip Bilty
                </button>
                <button
                  onClick={onCreateExpense}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Slip</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center">
              <TruckIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
              <h4 className="text-xs font-bold text-slate-800">No Active Trip Assigned</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Contact office manager to assign your next long-haul dispatch.
              </p>
            </div>
          )}

          {/* Driver Claims Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Approved Claims</span>
              <div className="text-sm font-bold text-emerald-900 mt-0.5">
                {formatCurrency(driverApprovedExpenses, company.currency)}
              </div>
              <span className="text-[10px] text-emerald-700">Reimbursed / Settled</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Pending Review</span>
              <div className="text-sm font-bold text-amber-900 mt-0.5">
                {formatCurrency(driverPendingExpenses, company.currency)}
              </div>
              <span className="text-[10px] text-amber-700">Submitted slips</span>
            </div>
          </div>
        </div>
      ) : (
        /* Admin & Fleet Overview Card */
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
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onCreateTrip}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip Bilty</span>
        </button>
        <button
          onClick={onCreateExpense}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-800 border border-slate-200 py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <CreditCard className="w-4 h-4 text-slate-600" />
          <span>{isDriver ? 'Submit Slip' : 'Add Expense'}</span>
        </button>
      </div>

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
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Trips</h2>
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
    </div>
  );
};
