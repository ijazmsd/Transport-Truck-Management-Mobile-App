import React, { useState } from 'react';
import { Truck, TruckStatus, Company, Expense, Trip } from '../types';
import { formatCurrency, checkExpiryStatus } from '../services/calculations';
import {
  Truck as TruckIcon,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Gauge,
  X,
  Trash2,
  Edit2,
  ChevronRight,
} from 'lucide-react';

interface Props {
  trucks: Truck[];
  trips: Trip[];
  expenses: Expense[];
  company: Company;
  onSaveTruck: (truck: Truck) => void;
  onDeleteTruck: (truckId: string) => void;
}

export const TrucksView: React.FC<Props> = ({
  trucks,
  trips,
  expenses,
  company,
  onSaveTruck,
  onDeleteTruck,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    regNumber: '',
    truckType: '10 Wheeler Heavy Rigid',
    make: 'Hino',
    model: '500 Series FM',
    year: new Date().getFullYear(),
    color: 'Industrial White',
    chassisNumber: '',
    engineNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 10000000,
    currentMileage: 50000,
    status: 'Available' as TruckStatus,
    notes: '',
  });

  const filteredTrucks = trucks.filter((t) => {
    const matchesSearch =
      t.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingTruck(null);
    setFormData({
      regNumber: '',
      truckType: '10 Wheeler Heavy Rigid',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: 'White',
      chassisNumber: `CH-${Math.floor(100000 + Math.random() * 900000)}`,
      engineNumber: `ENG-${Math.floor(100000 + Math.random() * 900000)}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 12000000,
      currentMileage: 0,
      status: 'Available',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (truck: Truck) => {
    setEditingTruck(truck);
    setFormData({
      regNumber: truck.regNumber,
      truckType: truck.truckType,
      make: truck.make,
      model: truck.model,
      year: truck.year,
      color: truck.color,
      chassisNumber: truck.chassisNumber,
      engineNumber: truck.engineNumber,
      purchaseDate: truck.purchaseDate,
      purchasePrice: truck.purchasePrice,
      currentMileage: truck.currentMileage,
      status: truck.status,
      notes: truck.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.regNumber.trim() || !formData.make.trim()) {
      alert('Please fill in Registration Number and Make.');
      return;
    }

    const truckToSave: Truck = {
      id: editingTruck ? editingTruck.id : `trk_${Date.now()}`,
      regNumber: formData.regNumber.trim().toUpperCase(),
      truckType: formData.truckType,
      make: formData.make.trim(),
      model: formData.model.trim(),
      year: Number(formData.year),
      color: formData.color,
      chassisNumber: formData.chassisNumber,
      engineNumber: formData.engineNumber,
      purchaseDate: formData.purchaseDate,
      purchasePrice: Number(formData.purchasePrice),
      currentMileage: Number(formData.currentMileage),
      status: formData.status,
      notes: formData.notes,
      createdAt: editingTruck ? editingTruck.createdAt : Date.now(),
      updatedAt: Date.now(),
      documents: editingTruck?.documents || [
        {
          id: `doc_${Date.now()}_1`,
          truckId: editingTruck ? editingTruck.id : `trk_${Date.now()}`,
          docType: 'Registration',
          docNumber: `REG-${formData.regNumber}`,
          issueDate: formData.purchaseDate,
          expiryDate: '2030-01-01',
        },
        {
          id: `doc_${Date.now()}_2`,
          truckId: editingTruck ? editingTruck.id : `trk_${Date.now()}`,
          docType: 'Insurance',
          docNumber: `INS-${formData.regNumber}`,
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        },
      ],
    };

    onSaveTruck(truckToSave);
    setIsModalOpen(false);
    if (selectedTruck && selectedTruck.id === truckToSave.id) {
      setSelectedTruck(truckToSave);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3 bg-slate-50 text-slate-900">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Fleet Management</h1>
          <p className="text-xs text-slate-500">{trucks.length} Commercial Vehicles Registered</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Truck</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by registration, make or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Available', 'On Trip', 'Maintenance', 'Inactive'].map((status) => (
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

      {/* Trucks List */}
      {filteredTrucks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 my-6">
          <TruckIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-slate-700">No Trucks Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Try changing your search keywords' : 'Add your first fleet vehicle to get started.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Truck
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTrucks.map((truck) => {
            const truckExpenses = expenses.filter((e) => e.truckId === truck.id);
            const totalTruckExp = truckExpenses.reduce((acc, curr) => acc + curr.amount, 0);
            const truckTrips = trips.filter((t) => t.truckId === truck.id);

            // Document alerts
            const expiringDocs = (truck.documents || []).filter((doc) => {
              const { status } = checkExpiryStatus(doc.expiryDate);
              return status !== 'Valid';
            });

            return (
              <div
                key={truck.id}
                onClick={() => setSelectedTruck(truck)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-blue-300 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 tracking-tight font-mono">
                        {truck.regNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          truck.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : truck.status === 'On Trip'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : truck.status === 'Maintenance'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {truck.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      {truck.make} {truck.model} ({truck.year}) • {truck.truckType}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Odometer</span>
                    <span className="font-bold text-slate-700 font-mono">
                      {truck.currentMileage.toLocaleString()} km
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lifetime Trips</span>
                    <span className="font-bold text-slate-700">{truckTrips.length} Completed</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Expenses</span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(totalTruckExp, company.currency)}
                    </span>
                  </div>
                </div>

                {expiringDocs.length > 0 && (
                  <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 flex items-center gap-1.5 text-[10px] text-amber-800 font-medium">
                    <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>
                      {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} require renewal
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Truck Detail Modal */}
      {selectedTruck && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-semibold">Truck Details</span>
                <h3 className="text-base font-bold font-mono">{selectedTruck.regNumber}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedTruck);
                  }}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete truck ${selectedTruck.regNumber}?`)) {
                      onDeleteTruck(selectedTruck.id);
                      setSelectedTruck(null);
                    }
                  }}
                  className="p-1.5 text-rose-300 hover:text-rose-100 bg-rose-950/40 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedTruck(null)}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Specs Box */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Make & Model</span>
                    <span className="font-bold text-slate-800">
                      {selectedTruck.make} {selectedTruck.model} ({selectedTruck.year})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Truck Type</span>
                    <span className="font-bold text-slate-800">{selectedTruck.truckType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Chassis Number</span>
                    <span className="font-mono text-slate-700 font-semibold">{selectedTruck.chassisNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Engine Number</span>
                    <span className="font-mono text-slate-700 font-semibold">{selectedTruck.engineNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Purchase Price</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(selectedTruck.purchasePrice, company.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Current Mileage</span>
                    <span className="font-bold font-mono text-slate-800">
                      {selectedTruck.currentMileage.toLocaleString()} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents & Expiry Section */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Truck Compliance Documents</span>
                </h4>

                <div className="space-y-2">
                  {(selectedTruck.documents || []).length === 0 ? (
                    <p className="text-slate-400 italic text-[11px]">No documents attached yet.</p>
                  ) : (
                    selectedTruck.documents?.map((doc) => {
                      const { status, daysRemaining, badgeColor } = checkExpiryStatus(doc.expiryDate);
                      return (
                        <div
                          key={doc.id}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{doc.docType}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{doc.docNumber}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Expires: {doc.expiryDate}</div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              {status}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days ago`}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedTruck.notes && (
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-slate-700">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">Notes</span>
                  <p className="text-[11px]">{selectedTruck.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold">{editingTruck ? 'Edit Truck' : 'Add New Truck'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LES-9021"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Make / Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hino, Isuzu, FAW"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. 500 FM Series"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Truck Type</label>
                  <select
                    value={formData.truckType}
                    onChange={(e) => setFormData({ ...formData, truckType: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="6 Wheeler Medium Truck">6 Wheeler Medium Truck</option>
                    <option value="10 Wheeler Heavy Rigid">10 Wheeler Heavy Rigid</option>
                    <option value="14 Wheeler Multi-Axle">14 Wheeler Multi-Axle</option>
                    <option value="22 Wheeler Prime Mover (Trailer)">22 Wheeler Prime Mover (Trailer)</option>
                    <option value="Flatbed Container Carrier">Flatbed Container Carrier</option>
                    <option value="Oil / Chemical Tanker">Oil / Chemical Tanker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TruckStatus })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Current Mileage (km)</label>
                  <input
                    type="number"
                    value={formData.currentMileage}
                    onChange={(e) => setFormData({ ...formData, currentMileage: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Purchase Price</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Chassis / Engine Info</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Chassis Number"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                    className="bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Engine Number"
                    value={formData.engineNumber}
                    onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                    className="bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Notes / Equipment</label>
                <textarea
                  rows={2}
                  placeholder="e.g. GPS Tracking ID, dual tanks, tarpaulin condition"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg text-xs"
                />
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
                  {editingTruck ? 'Save Changes' : 'Register Truck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
