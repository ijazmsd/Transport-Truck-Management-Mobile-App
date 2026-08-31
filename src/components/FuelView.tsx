import React, { useState } from 'react';
import { FuelEntry, Truck, Driver, Supplier, Trip, Currency, PaymentMethod } from '../types';
import { calculateFuelFleetMetrics, formatCurrency } from '../services/calculations';
import {
  Fuel,
  Plus,
  Search,
  Gauge,
  TrendingUp,
  DollarSign,
  Truck as TruckIcon,
  Calendar,
  Trash2,
  X,
  Zap,
  CheckCircle2,
  Building2,
  User,
} from 'lucide-react';

interface FuelViewProps {
  fuelEntries: FuelEntry[];
  trucks: Truck[];
  drivers: Driver[];
  suppliers: Supplier[];
  trips: Trip[];
  currency: Currency;
  onSaveFuelEntry: (entry: FuelEntry) => void;
  onDeleteFuelEntry: (entryId: string) => void;
}

export const FuelView: React.FC<FuelViewProps> = ({
  fuelEntries,
  trucks,
  drivers,
  suppliers,
  trips,
  currency,
  onSaveFuelEntry,
  onDeleteFuelEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTruckFilter, setSelectedTruckFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formTruckId, setFormTruckId] = useState('');
  const [formTripId, setFormTripId] = useState('');
  const [formDriverId, setFormDriverId] = useState('');
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formFuelDate, setFormFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [formQuantityLiters, setFormQuantityLiters] = useState<number>(200);
  const [formRatePerLiter, setFormRatePerLiter] = useState<number>(300);
  const [formOdometer, setFormOdometer] = useState<number>(0);
  const [formPrevOdometer, setFormPrevOdometer] = useState<number>(0);
  const [formIsFullTank, setFormIsFullTank] = useState(true);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Cash');
  const [formNotes, setFormNotes] = useState('');

  const fleetMetrics = calculateFuelFleetMetrics(fuelEntries);

  const filteredEntries = fuelEntries.filter((entry) => {
    const truck = trucks.find((t) => t.id === entry.truckId);
    const driver = drivers.find((d) => d.id === entry.driverId);
    const matchesSearch =
      (truck?.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (driver?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const matchesTruck = selectedTruckFilter === 'All' || entry.truckId === selectedTruckFilter;
    return matchesSearch && matchesTruck;
  });

  const openAddModal = (preselectedTruckId?: string) => {
    const truck = preselectedTruckId
      ? trucks.find((t) => t.id === preselectedTruckId)
      : trucks[0];

    const targetTruckId = truck ? truck.id : '';
    setFormTruckId(targetTruckId);

    // Find the latest fuel entry or odometer for this truck
    const lastEntry = fuelEntries
      .filter((e) => e.truckId === targetTruckId)
      .sort((a, b) => new Date(b.fuelDate).getTime() - new Date(a.fuelDate).getTime())[0];

    const prevOdo = lastEntry ? lastEntry.odometerReading : truck ? truck.currentMileage : 0;
    setFormPrevOdometer(prevOdo);
    setFormOdometer(prevOdo > 0 ? prevOdo + 650 : 150000);
    setFormTripId('');
    setFormDriverId(truck ? drivers.find((d) => d.assignedTruckId === truck.id)?.id || '' : '');
    setFormSupplierId(suppliers.find((s) => s.category === 'Fuel Pump')?.id || '');
    setFormFuelDate(new Date().toISOString().split('T')[0]);
    setFormQuantityLiters(220);
    setFormRatePerLiter(300);
    setFormIsFullTank(true);
    setFormPaymentMethod('Cash');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleTruckChange = (truckId: string) => {
    setFormTruckId(truckId);
    const trk = trucks.find((t) => t.id === truckId);
    const lastEntry = fuelEntries
      .filter((e) => e.truckId === truckId)
      .sort((a, b) => new Date(b.fuelDate).getTime() - new Date(a.fuelDate).getTime())[0];

    const prevOdo = lastEntry ? lastEntry.odometerReading : trk ? trk.currentMileage : 0;
    setFormPrevOdometer(prevOdo);
    if (formOdometer <= prevOdo) {
      setFormOdometer(prevOdo + 600);
    }
    if (trk) {
      const assignedDriver = drivers.find((d) => d.assignedTruckId === trk.id);
      if (assignedDriver) setFormDriverId(assignedDriver.id);
    }
  };

  // Real-time calculations in form
  const computedTotalCost = Math.round(formQuantityLiters * formRatePerLiter);
  const computedKmDriven = formOdometer > formPrevOdometer ? formOdometer - formPrevOdometer : 0;
  const computedKmpl =
    computedKmDriven > 0 && formQuantityLiters > 0
      ? Math.round((computedKmDriven / formQuantityLiters) * 100) / 100
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTruckId || formQuantityLiters <= 0) return;

    const entry: FuelEntry = {
      id: `fuel_${Date.now()}`,
      truckId: formTruckId,
      tripId: formTripId || undefined,
      driverId: formDriverId || undefined,
      supplierId: formSupplierId || undefined,
      fuelDate: formFuelDate,
      quantityLiters: Number(formQuantityLiters),
      ratePerLiter: Number(formRatePerLiter),
      totalCost: computedTotalCost,
      odometerReading: Number(formOdometer),
      previousOdometer: formPrevOdometer > 0 ? Number(formPrevOdometer) : undefined,
      kmDriven: computedKmDriven > 0 ? computedKmDriven : undefined,
      fuelEfficiencyKmpl: computedKmpl > 0 ? computedKmpl : undefined,
      isFullTank: formIsFullTank,
      paymentMethod: formPaymentMethod,
      notes: formNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    onSaveFuelEntry(entry);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Fleet Fuel Metrics Dashboard Card */}
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 text-white rounded-2xl p-4 shadow-lg border border-amber-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Fuel Management & Economy</h2>
              <p className="text-xs text-amber-200/70">Refueling Logs & Km/L Analytics</p>
            </div>
          </div>
          <button
            id="add-fuel-log-btn"
            onClick={() => openAddModal()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Fuel</span>
          </button>
        </div>

        {/* 4-KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-amber-900/50">
          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-amber-500/20">
            <span className="text-[10px] text-amber-200/70 block">Total Fuel Spend</span>
            <span className="text-base font-bold text-amber-400">
              {formatCurrency(fleetMetrics.totalCost, currency)}
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-amber-500/20">
            <span className="text-[10px] text-amber-200/70 block">Total Diesel</span>
            <span className="text-base font-bold text-white">
              {fleetMetrics.totalLiters.toLocaleString()} Liters
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-amber-500/20">
            <span className="text-[10px] text-amber-200/70 block">Fleet Average Km/L</span>
            <div className="flex items-center space-x-1">
              <span className="text-base font-bold text-emerald-400">{fleetMetrics.averageKmpl}</span>
              <span className="text-[11px] text-slate-300">km/L</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-amber-500/20">
            <span className="text-[10px] text-amber-200/70 block">Fuel Cost / Km</span>
            <span className="text-base font-bold text-indigo-300">
              {formatCurrency(fleetMetrics.averageCostPerKm, currency)}/km
            </span>
          </div>
        </div>
      </div>

      {/* Per-Truck Fuel Efficiency Quick Breakdown */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold text-slate-800 flex items-center justify-between">
          <span>Truck Fuel Economy Comparison</span>
          <span className="text-[11px] text-slate-400 font-normal">Real-time telemetry</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {trucks.map((truck) => {
            const summary = fleetMetrics.truckSummaries.find((s) => s.truckId === truck.id);
            const kmpl = summary?.avgKmpl || 0;
            const isGood = kmpl >= 3.2;
            return (
              <div
                key={truck.id}
                className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{truck.regNumber}</p>
                  <p className="text-[10px] text-slate-500">{truck.make} {truck.model}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {summary?.totalLiters || 0} L consumed &bull; {summary?.totalKm || 0} km logged
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      isGood
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <Zap className="w-3 h-3 mr-0.5" />
                    {kmpl > 0 ? `${kmpl} km/L` : 'No Data'}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {formatCurrency(summary?.totalCost || 0, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter by Truck & Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="fuel-search-input"
            type="text"
            placeholder="Search fuel entries by truck, driver or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedTruckFilter('All')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedTruckFilter === 'All'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Trucks ({fuelEntries.length})
          </button>
          {trucks.map((t) => {
            const count = fuelEntries.filter((e) => e.truckId === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTruckFilter(t.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedTruckFilter === t.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.regNumber} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Fuel Entries List */}
      <div className="space-y-2.5">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-200">
            <Fuel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No fuel entries logged</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "+ Log Fuel" to record diesel quantity and odometer reading.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const truck = trucks.find((t) => t.id === entry.truckId);
            const driver = drivers.find((d) => d.id === entry.driverId);
            const supplier = suppliers.find((s) => s.id === entry.supplierId);
            return (
              <div
                key={entry.id}
                id={`fuel-entry-${entry.id}`}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-amber-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-200 shrink-0">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {truck?.regNumber || 'Unknown Truck'}
                        </span>
                        <span className="text-[11px] text-slate-400">{entry.fuelDate}</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-0.5">
                        <strong>{entry.quantityLiters} Liters</strong> @ {formatCurrency(entry.ratePerLiter, currency)}/L
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-1">
                        {driver && (
                          <span className="flex items-center text-slate-600">
                            <User className="w-3 h-3 mr-1 text-slate-400" />
                            {driver.name}
                          </span>
                        )}
                        {supplier && (
                          <span className="flex items-center text-indigo-600 font-medium">
                            <Building2 className="w-3 h-3 mr-1" />
                            {supplier.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 block">
                      {formatCurrency(entry.totalCost, currency)}
                    </span>
                    {entry.fuelEfficiencyKmpl ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                        {entry.fuelEfficiencyKmpl} km/L
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-1">Full tank</span>
                    )}
                  </div>
                </div>

                {/* Telemetry info row */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span>
                      Odometer: <strong>{entry.odometerReading.toLocaleString()} km</strong>
                    </span>
                    {entry.kmDriven && (
                      <span>
                        Run: <strong className="text-slate-700">+{entry.kmDriven} km</strong>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteFuelEntry(entry.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Fuel Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Fuel className="w-5 h-5" />
                <h3 className="font-bold text-sm">Log Fuel Refueling & Km/L</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Truck *</label>
                  <select
                    required
                    value={formTruckId}
                    onChange={(e) => handleTruckChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.regNumber} ({t.make})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formFuelDate}
                    onChange={(e) => setFormFuelDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fuel Pump / Station</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">-- Cash / Other Station --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Driver</label>
                  <select
                    value={formDriverId}
                    onChange={(e) => setFormDriverId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">-- Unassigned --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Liters & Rate */}
              <div className="grid grid-cols-2 gap-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diesel Quantity (Liters) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formQuantityLiters || ''}
                    onChange={(e) => setFormQuantityLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rate per Liter ({currency}) *</label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={formRatePerLiter || ''}
                    onChange={(e) => setFormRatePerLiter(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
                <div className="col-span-2 flex justify-between items-center text-xs font-bold text-amber-900 pt-1">
                  <span>Calculated Fuel Cost:</span>
                  <span className="text-sm text-rose-700">{formatCurrency(computedTotalCost, currency)}</span>
                </div>
              </div>

              {/* Odometer & Km/L calculation */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Previous Odo (km)</label>
                  <input
                    type="number"
                    value={formPrevOdometer || ''}
                    onChange={(e) => setFormPrevOdometer(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Odo (km) *</label>
                  <input
                    type="number"
                    required
                    value={formOdometer || ''}
                    onChange={(e) => setFormOdometer(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="col-span-2 flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-600">
                    Distance Driven: <strong>{computedKmDriven} km</strong>
                  </span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Economy: {computedKmpl > 0 ? `${computedKmpl} km/L` : '0 km/L'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online">PSO Fuel Card / M-Tag</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFullTank}
                      onChange={(e) => setFormIsFullTank(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span>Full Tank Refuel</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Station Details</label>
                <input
                  type="text"
                  placeholder="e.g. Refueled at PSO Motorway M-5 service area"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 shadow-sm"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
