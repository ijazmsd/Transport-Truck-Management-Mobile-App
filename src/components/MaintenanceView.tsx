import React, { useState } from 'react';
import { MaintenanceRecord, MaintenanceType, Truck, Supplier, Currency } from '../types';
import { checkMaintenanceStatus, formatCurrency } from '../services/calculations';
import {
  Wrench,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface MaintenanceViewProps {
  maintenanceRecords: MaintenanceRecord[];
  trucks: Truck[];
  suppliers: Supplier[];
  currency: Currency;
  onSaveRecord: (record: MaintenanceRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

const SERVICE_TYPES: MaintenanceType[] = [
  'Engine Oil',
  'Oil Filter',
  'Air Filter',
  'Fuel Filter',
  'Brake Service',
  'Tyre Replacement',
  'Wheel Alignment',
  'Battery Replacement',
  'Transmission Fluid',
  'Clutch & Gearbox',
  'General Overhaul',
];

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  maintenanceRecords,
  trucks,
  suppliers,
  currency,
  onSaveRecord,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTruckFilter, setSelectedTruckFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formTruckId, setFormTruckId] = useState('');
  const [formServiceType, setFormServiceType] = useState<MaintenanceType>('Engine Oil');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formOdometer, setFormOdometer] = useState<number>(0);
  const [formCost, setFormCost] = useState<number>(35000);
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formPartsReplaced, setFormPartsReplaced] = useState('');
  const [formNextOdometer, setFormNextOdometer] = useState<number>(0);
  const [formNextDate, setFormNextDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Calculate alerts across fleet
  const totalFleetSpend = maintenanceRecords.reduce((sum, r) => sum + r.cost, 0);

  const fleetAlerts = trucks.flatMap((trk) => {
    const { upcomingServices } = checkMaintenanceStatus(trk, maintenanceRecords);
    return upcomingServices.map((srv) => ({
      truck: trk,
      ...srv,
    }));
  });

  const overdueAlerts = fleetAlerts.filter((a) => a.isOverdue);
  const dueSoonAlerts = fleetAlerts.filter((a) => !a.isOverdue && a.kmRemaining <= 1500);

  const filteredRecords = maintenanceRecords.filter((record) => {
    const truck = trucks.find((t) => t.id === record.truckId);
    const matchesSearch =
      (truck?.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      record.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.partsReplaced?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const matchesTruck = selectedTruckFilter === 'All' || record.truckId === selectedTruckFilter;
    return matchesSearch && matchesTruck;
  });

  const openAddModal = (truckId?: string) => {
    const targetTruck = truckId ? trucks.find((t) => t.id === truckId) : trucks[0];
    const trkId = targetTruck ? targetTruck.id : '';
    setFormTruckId(trkId);
    setFormServiceType('Engine Oil');
    setFormDate(new Date().toISOString().split('T')[0]);

    const currOdo = targetTruck ? targetTruck.currentMileage : 150000;
    setFormOdometer(currOdo);
    setFormNextOdometer(currOdo + 10000); // default 10,000 km lube interval

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    setFormNextDate(futureDate.toISOString().split('T')[0]);

    setFormCost(45000);
    setFormSupplierId(suppliers.find((s) => s.category === 'Workshop')?.id || '');
    setFormPartsReplaced('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleTruckSelect = (truckId: string) => {
    setFormTruckId(truckId);
    const trk = trucks.find((t) => t.id === truckId);
    if (trk) {
      setFormOdometer(trk.currentMileage);
      setFormNextOdometer(trk.currentMileage + 10000);
    }
  };

  const handleServiceTypeChange = (type: MaintenanceType) => {
    setFormServiceType(type);
    if (type === 'Engine Oil') {
      setFormNextOdometer(formOdometer + 10000);
      setFormCost(48000);
      setFormPartsReplaced('Engine Oil 15W-40 (28L), Oil Filter, Fuel Filter');
    } else if (type === 'Brake Service') {
      setFormNextOdometer(formOdometer + 25000);
      setFormCost(28000);
      setFormPartsReplaced('Brake shoe relining, air valve seal kit');
    } else if (type === 'Tyre Replacement') {
      setFormNextOdometer(formOdometer + 60000);
      setFormCost(95000);
      setFormPartsReplaced('Radial Truck Tyres 295/80R22.5 (2 Units)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTruckId || formCost <= 0) return;

    const record: MaintenanceRecord = {
      id: `maint_${Date.now()}`,
      truckId: formTruckId,
      serviceType: formServiceType,
      serviceDate: formDate,
      odometerAtService: Number(formOdometer),
      cost: Number(formCost),
      supplierId: formSupplierId || undefined,
      partsReplaced: formPartsReplaced.trim() || undefined,
      nextServiceOdometer: formNextOdometer > 0 ? Number(formNextOdometer) : undefined,
      nextServiceDate: formNextDate || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    onSaveRecord(record);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Dashboard */}
      <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-rose-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Preventative Maintenance</h2>
              <p className="text-xs text-rose-200/70">Fleet Service Intervals & Overhauls</p>
            </div>
          </div>
          <button
            id="log-maintenance-btn"
            onClick={() => openAddModal()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Service</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-rose-900/50 text-center">
          <div className="bg-slate-900/80 rounded-xl p-2 border border-rose-500/20">
            <span className="text-[10px] text-rose-200/70 block">Total Maintenance Spend</span>
            <span className="text-base font-bold text-rose-400">
              {formatCurrency(totalFleetSpend, currency)}
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-2 border border-rose-500/20">
            <span className="text-[10px] text-rose-200/70 block">Overdue Services</span>
            <span className="text-base font-bold text-rose-300">
              {overdueAlerts.length} Trucks
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-2 border border-rose-500/20">
            <span className="text-[10px] text-rose-200/70 block">Due Soon (&lt;1,500 km)</span>
            <span className="text-base font-bold text-amber-300">
              {dueSoonAlerts.length} Trucks
            </span>
          </div>
        </div>
      </div>

      {/* Service Alert Cards if any */}
      {(overdueAlerts.length > 0 || dueSoonAlerts.length > 0) && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Service Due Reminders</span>
          </h3>
          <div className="space-y-1.5">
            {overdueAlerts.map((alert, idx) => (
              <div
                key={`overdue-${idx}`}
                className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-rose-900">{alert.truck.regNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800">
                      OVERDUE
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {alert.serviceType} was due at {alert.dueOdometer?.toLocaleString()} km (Current: {alert.truck.currentMileage.toLocaleString()} km)
                  </p>
                </div>
                <button
                  onClick={() => openAddModal(alert.truck.id)}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 shrink-0"
                >
                  Service Now
                </button>
              </div>
            ))}

            {dueSoonAlerts.map((alert, idx) => (
              <div
                key={`duesoon-${idx}`}
                className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-amber-900">{alert.truck.regNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                      DUE IN {alert.kmRemaining} KM
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {alert.serviceType} upcoming at {alert.dueOdometer?.toLocaleString()} km
                  </p>
                </div>
                <button
                  onClick={() => openAddModal(alert.truck.id)}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 shrink-0"
                >
                  Schedule
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter by Truck & Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="maintenance-search-input"
            type="text"
            placeholder="Search service logs by truck, type or replaced parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
          />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedTruckFilter('All')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedTruckFilter === 'All'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Trucks ({maintenanceRecords.length})
          </button>
          {trucks.map((t) => {
            const count = maintenanceRecords.filter((r) => r.truckId === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTruckFilter(t.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedTruckFilter === t.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.regNumber} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Maintenance Records List */}
      <div className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-200">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No service records found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "+ Log Service" to record oil changes, tyre replacements, and brake repairs.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const truck = trucks.find((t) => t.id === record.truckId);
            const workshop = suppliers.find((s) => s.id === record.supplierId);
            return (
              <div
                key={record.id}
                id={`maintenance-card-${record.id}`}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-rose-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm border border-rose-200 shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {truck?.regNumber || 'Unknown Truck'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {record.serviceType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        Performed on <strong>{record.serviceDate}</strong> &bull; Odometer: <strong>{record.odometerAtService.toLocaleString()} km</strong>
                      </p>

                      {record.partsReplaced && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          Parts: {record.partsReplaced}
                        </p>
                      )}

                      {workshop && (
                        <p className="text-[11px] text-indigo-600 font-medium flex items-center mt-1">
                          <Building2 className="w-3 h-3 mr-1" />
                          {workshop.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-rose-600 block">
                      {formatCurrency(record.cost, currency)}
                    </span>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 mt-2 inline-block transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Next service reminder badge */}
                {(record.nextServiceOdometer || record.nextServiceDate) && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center text-slate-700">
                      <Clock className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                      Next Service Target: <strong>{record.nextServiceOdometer ? `${record.nextServiceOdometer.toLocaleString()} km` : record.nextServiceDate}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {record.nextServiceDate && `By ${record.nextServiceDate}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5" />
                <h3 className="font-bold text-sm">Log Maintenance & Service</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-rose-200 hover:text-white">
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
                    onChange={(e) => handleTruckSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.regNumber} ({t.make})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Service Type *</label>
                  <select
                    value={formServiceType}
                    onChange={(e) => handleServiceTypeChange(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Service Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Service Cost ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formCost || ''}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    required
                    value={formOdometer || ''}
                    onChange={(e) => setFormOdometer(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Workshop / Vendor</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">-- Internal / Cash --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Parts Replaced / Work Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Engine Oil 15W-40 (28L), Genuine Oil filter, Brake shoe relining"
                  value={formPartsReplaced}
                  onChange={(e) => setFormPartsReplaced(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Next Service Due Auto Setup */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Service Odo (km)</label>
                  <input
                    type="number"
                    value={formNextOdometer || ''}
                    onChange={(e) => setFormNextOdometer(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={formNextDate}
                    onChange={(e) => setFormNextDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Recommended gear oil inspection in next visit"
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
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 shadow-sm"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
