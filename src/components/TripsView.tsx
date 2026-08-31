import React, { useState } from 'react';
import { Trip, Truck, Driver, Customer, Expense, Company, TripStatus } from '../types';
import { calculateTripProfit, calculateTripIncome, calculateTripExpenses, formatCurrency } from '../services/calculations';
import {
  Navigation,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  CreditCard,
  User,
  Truck as TruckIcon,
  CheckCircle,
  Clock,
  X,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Printer,
} from 'lucide-react';

interface Props {
  trips: Trip[];
  trucks: Truck[];
  drivers: Driver[];
  customers: Customer[];
  expenses: Expense[];
  company: Company;
  onSaveTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onAddExpenseForTrip: (tripId: string) => void;
  onPrintDocument?: (docType: 'bilty' | 'customer_invoice', data: any) => void;
}

export const TripsView: React.FC<Props> = ({
  trips,
  trucks,
  drivers,
  customers,
  expenses,
  company,
  onSaveTrip,
  onDeleteTrip,
  onAddExpenseForTrip,
  onPrintDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Trip Form State
  const [formData, setFormData] = useState({
    tripNumber: `TRP-2026-00${Math.floor(150 + Math.random() * 850)}`,
    truckId: trucks[0]?.id || '',
    driverId: drivers[0]?.id || '',
    customerId: customers[0]?.id || '',
    fromLocation: 'Lahore',
    toLocation: 'Karachi Port',
    tripDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    loadingLocation: 'Main Industrial Terminal',
    unloadingLocation: 'Customer Depot / QICT',
    cargoDescription: 'General Manufactured Goods',
    cargoWeight: 28,
    tripRate: 220000,
    loadingCharges: 3000,
    unloadingCharges: 3000,
    otherIncome: 0,
    advanceReceived: 100000,
    status: 'In Progress' as TripStatus,
    notes: '',
  });

  const filteredTrips = trips.filter((t) => {
    const truck = trucks.find((k) => k.id === t.truckId);
    const driver = drivers.find((d) => d.id === t.driverId);
    const customer = customers.find((c) => c.id === t.customerId);

    const matchesSearch =
      t.tripNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (truck?.regNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormData({
      tripNumber: `TRP-2026-00${Math.floor(150 + Math.random() * 850)}`,
      truckId: trucks.find((t) => t.status === 'Available')?.id || trucks[0]?.id || '',
      driverId: drivers.find((d) => d.status === 'Active')?.id || drivers[0]?.id || '',
      customerId: customers[0]?.id || '',
      fromLocation: 'Lahore',
      toLocation: 'Karachi Port',
      tripDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      loadingLocation: 'Yard Gate 1',
      unloadingLocation: 'Customer Dock',
      cargoDescription: 'Industrial Cargo',
      cargoWeight: 25,
      tripRate: 240000,
      loadingCharges: 4000,
      unloadingCharges: 4000,
      otherIncome: 0,
      advanceReceived: 120000,
      status: 'In Progress',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tripNumber || !formData.truckId || !formData.driverId || !formData.customerId) {
      alert('Please fill all required trip details');
      return;
    }

    const newTrip: Trip = {
      id: `trp_${Date.now()}`,
      tripNumber: formData.tripNumber,
      truckId: formData.truckId,
      driverId: formData.driverId,
      customerId: formData.customerId,
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      tripDate: formData.tripDate,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      loadingLocation: formData.loadingLocation,
      unloadingLocation: formData.unloadingLocation,
      cargoDescription: formData.cargoDescription,
      cargoWeight: Number(formData.cargoWeight),
      tripRate: Number(formData.tripRate),
      loadingCharges: Number(formData.loadingCharges),
      unloadingCharges: Number(formData.unloadingCharges),
      otherIncome: Number(formData.otherIncome),
      advanceReceived: Number(formData.advanceReceived),
      status: formData.status,
      notes: formData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveTrip(newTrip);
    setIsModalOpen(false);
  };

  const handleStatusChange = (trip: Trip, newStatus: TripStatus) => {
    const updated: Trip = {
      ...trip,
      status: newStatus,
      actualDeliveryDate:
        newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : trip.actualDeliveryDate,
      updatedAt: Date.now(),
    };
    onSaveTrip(updated);
    if (selectedTrip && selectedTrip.id === trip.id) {
      setSelectedTrip(updated);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3 bg-slate-50 text-slate-900">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Trip Dispatch & Ledger</h1>
          <p className="text-xs text-slate-500">{trips.length} Total Trips in System</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search trip #, route, truck or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'In Progress', 'Completed', 'Assigned', 'Draft', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 my-6">
          <Navigation className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-slate-700">No Trips Found</h2>
          <p className="text-xs text-slate-500 mt-1">Create your first transport consignment to start tracking profit.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Create Trip
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTrips.map((trip) => {
            const truck = trucks.find((t) => t.id === trip.truckId);
            const driver = drivers.find((d) => d.id === trip.driverId);
            const customer = customers.find((c) => c.id === trip.customerId);
            const profit = calculateTripProfit(trip, expenses);

            return (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-blue-300 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 font-mono">{trip.tripNumber}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          trip.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : trip.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 mt-1">
                      <span>{trip.fromLocation}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.toLocation}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      {formatCurrency(profit.income, company.currency)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        profit.isProfitable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      Profit: {formatCurrency(profit.netProfit, company.currency)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="truncate">
                    <span className="text-slate-400 block text-[10px]">Truck</span>
                    <span className="font-semibold">{truck?.regNumber || 'N/A'}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400 block text-[10px]">Driver</span>
                    <span className="font-semibold">{driver?.name?.split(' ')[0] || 'N/A'}</span>
                  </div>
                  <div className="truncate text-right">
                    <span className="text-slate-400 block text-[10px]">Customer</span>
                    <span className="font-semibold">{customer?.name?.split(' ')[0] || 'N/A'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trip Profit Breakdown Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-semibold">Trip Financial Statement</span>
                <h3 className="text-base font-bold font-mono">{selectedTrip.tripNumber}</h3>
              </div>
              <div className="flex items-center space-x-1">
                {onPrintDocument && (
                  <>
                    <button
                      onClick={() => {
                        const trk = trucks.find((t) => t.id === selectedTrip.truckId);
                        const drv = drivers.find((d) => d.id === selectedTrip.driverId);
                        const cst = customers.find((c) => c.id === selectedTrip.customerId);
                        onPrintDocument('bilty', { trip: selectedTrip, truck: trk, driver: drv, customer: cst });
                      }}
                      title="Print Bilty / LR"
                      className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-[11px] font-semibold transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Bilty</span>
                    </button>
                    <button
                      onClick={() => {
                        const cst = customers.find((c) => c.id === selectedTrip.customerId);
                        onPrintDocument('customer_invoice', { trip: selectedTrip, customer: cst });
                      }}
                      title="Print Freight Invoice"
                      className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-semibold transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Route & Status Banner */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <span>{selectedTrip.fromLocation}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>{selectedTrip.toLocation}</span>
                  </div>
                  <span className="font-semibold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {selectedTrip.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>Cargo: {selectedTrip.cargoDescription} ({selectedTrip.cargoWeight} Tons)</div>
                  <div>Loading Date: {selectedTrip.tripDate}</div>
                </div>
              </div>

              {/* Centralized Calculation Breakdown Box */}
              {(() => {
                const summary = calculateTripProfit(selectedTrip, expenses);
                const { breakdown, expensesList } = calculateTripExpenses(selectedTrip.id, expenses);

                return (
                  <div className="space-y-3">
                    {/* Financial Summary Card */}
                    <div
                      className={`p-3.5 rounded-2xl border text-white ${
                        summary.isProfitable
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-500'
                          : 'bg-gradient-to-br from-rose-600 to-pink-700 border-rose-500'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs opacity-90 mb-1">
                        <span>Net Profit Calculation</span>
                        <span>{summary.marginPercent}% Margin</span>
                      </div>
                      <div className="text-2xl font-black">{formatCurrency(summary.netProfit, company.currency)}</div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/20 text-xs">
                        <div>
                          <div className="opacity-80 text-[10px]">Total Trip Income</div>
                          <div className="font-bold">{formatCurrency(summary.income, company.currency)}</div>
                        </div>
                        <div>
                          <div className="opacity-80 text-[10px]">Total Trip Expenses</div>
                          <div className="font-bold">{formatCurrency(summary.expenses, company.currency)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Line Items */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between">
                        <span>Income Breakdown</span>
                        <span>Amount</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Agreed Freight Rate</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(selectedTrip.tripRate, company.currency)}
                        </span>
                      </div>
                      {selectedTrip.loadingCharges > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Loading Charges</span>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(selectedTrip.loadingCharges, company.currency)}
                          </span>
                        </div>
                      )}
                      {selectedTrip.unloadingCharges > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Unloading Charges</span>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(selectedTrip.unloadingCharges, company.currency)}
                          </span>
                        </div>
                      )}
                      {selectedTrip.otherIncome > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Other Allowances</span>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(selectedTrip.otherIncome, company.currency)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expenses Breakdown */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between">
                        <span>Trip Expenses ({expensesList.length} Items)</span>
                        <span>Amount</span>
                      </div>
                      {expensesList.length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">No expenses logged for this trip.</p>
                      ) : (
                        Object.entries(breakdown).map(([category, amount]) => (
                          <div key={category} className="flex justify-between text-slate-600">
                            <span>{category}</span>
                            <span className="font-semibold text-rose-600">
                              {formatCurrency(amount, company.currency)}
                            </span>
                          </div>
                        ))
                      )}

                      <button
                        onClick={() => {
                          onAddExpenseForTrip(selectedTrip.id);
                          setSelectedTrip(null);
                        }}
                        className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log New Expense
                      </button>
                    </div>

                    {/* Status Management Bar */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Update Trip Status
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleStatusChange(selectedTrip, 'In Progress')}
                          className={`py-2 rounded-xl font-semibold text-xs border ${
                            selectedTrip.status === 'In Progress'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedTrip, 'Completed')}
                          className={`py-2 rounded-xl font-semibold text-xs border ${
                            selectedTrip.status === 'Completed'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedTrip, 'Cancelled')}
                          className={`py-2 rounded-xl font-semibold text-xs border ${
                            selectedTrip.status === 'Cancelled'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          Cancel Trip
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* New Trip Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold">New Trip Consignment Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrip} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Trip Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.tripNumber}
                    onChange={(e) => setFormData({ ...formData, tripNumber: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Trip Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.tripDate}
                    onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Truck *</label>
                <select
                  value={formData.truckId}
                  onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-semibold"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.regNumber} ({t.make} {t.model} - {t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Select Driver *</label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.salaryType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Select Customer *</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">From Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore"
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">To Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi Port"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cargo Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Cotton Bales"
                    value={formData.cargoDescription}
                    onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Weight (Tons)</label>
                  <input
                    type="number"
                    value={formData.cargoWeight}
                    onChange={(e) => setFormData({ ...formData, cargoWeight: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Trip Rate ({company.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.tripRate}
                    onChange={(e) => setFormData({ ...formData, tripRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Advance Received</label>
                  <input
                    type="number"
                    value={formData.advanceReceived}
                    onChange={(e) => setFormData({ ...formData, advanceReceived: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl shadow-sm"
                >
                  Dispatch Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
