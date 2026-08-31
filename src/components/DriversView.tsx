import React, { useState } from 'react';
import { Driver, DriverStatus, SalaryType, Company, Truck, Trip } from '../types';
import { formatCurrency, checkExpiryStatus } from '../services/calculations';
import {
  Users,
  Search,
  Plus,
  Phone,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Truck as TruckIcon,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  trucks: Truck[];
  trips: Trip[];
  company: Company;
  onSaveDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
}

export const DriversView: React.FC<Props> = ({
  drivers,
  trucks,
  trips,
  company,
  onSaveDriver,
  onDeleteDriver,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: '',
    licenseNumber: '',
    licenseExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salaryType: 'Monthly' as SalaryType,
    salary: 50000,
    status: 'Active' as DriverStatus,
    assignedTruckId: '',
    notes: '',
  });

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.cnic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '+92 300 ',
      cnic: '35201-',
      licenseNumber: 'HTV-',
      licenseExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salaryType: 'Monthly',
      salary: 50000,
      status: 'Active',
      assignedTruckId: trucks[0]?.id || '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      cnic: driver.cnic,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      address: driver.address,
      joiningDate: driver.joiningDate,
      salaryType: driver.salaryType,
      salary: driver.salary,
      status: driver.status,
      assignedTruckId: driver.assignedTruckId || '',
      notes: driver.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in Driver Name and Phone Number.');
      return;
    }

    const driverToSave: Driver = {
      id: editingDriver ? editingDriver.id : `drv_${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      cnic: formData.cnic.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      licenseExpiryDate: formData.licenseExpiryDate,
      address: formData.address.trim(),
      joiningDate: formData.joiningDate,
      salaryType: formData.salaryType,
      salary: Number(formData.salary),
      status: formData.status,
      assignedTruckId: formData.assignedTruckId || undefined,
      notes: formData.notes,
      createdAt: editingDriver ? editingDriver.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSaveDriver(driverToSave);
    setIsModalOpen(false);
    if (selectedDriver && selectedDriver.id === driverToSave.id) {
      setSelectedDriver(driverToSave);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3 bg-slate-50 text-slate-900">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Driver Directory</h1>
          <p className="text-xs text-slate-500">{drivers.length} Commercial Drivers Enrolled</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver by name, phone or CNIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Active', 'On Trip', 'On Leave', 'Inactive'].map((status) => (
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

      {/* Drivers List */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 my-6">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-slate-700">No Drivers Found</h2>
          <p className="text-xs text-slate-500 mt-1">Enroll your drivers to assign them to trucks and trips.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDrivers.map((driver) => {
            const assignedTruck = trucks.find((t) => t.id === driver.assignedTruckId);
            const driverTrips = trips.filter((t) => t.driverId === driver.id);
            const { status: licenseStatus, daysRemaining, badgeColor } = checkExpiryStatus(
              driver.licenseExpiryDate
            );

            return (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-blue-300 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{driver.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          driver.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : driver.status === 'On Trip'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {driver.phone} • CNIC: {driver.cnic}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Salary Model</span>
                    <span className="font-bold text-slate-800">
                      {driver.salaryType === 'Percentage'
                        ? `${driver.salary}% Profit`
                        : `${formatCurrency(driver.salary, company.currency)} ${
                            driver.salaryType === 'Per Trip' ? '/Trip' : '/Mo'
                          }`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Truck</span>
                    <span className="font-bold font-mono text-slate-700">
                      {assignedTruck?.regNumber || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">License Expiry</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                      {licenseStatus}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-semibold">Driver Profile</span>
                <h3 className="text-base font-bold">{selectedDriver.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(selectedDriver)}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete driver ${selectedDriver.name}?`)) {
                      onDeleteDriver(selectedDriver.id);
                      setSelectedDriver(null);
                    }
                  }}
                  className="p-1.5 text-rose-300 hover:text-rose-100 bg-rose-950/40 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Contact Phone</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedDriver.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">CNIC / ID #</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedDriver.cnic}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">HTV License Number</span>
                  <span className="font-mono text-slate-700 font-bold">{selectedDriver.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">License Expiry Date</span>
                  <span className="font-bold text-slate-800">{selectedDriver.licenseExpiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Joining Date</span>
                  <span className="text-slate-700 font-semibold">{selectedDriver.joiningDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Agreed Compensation</span>
                  <span className="font-bold text-emerald-700">
                    {selectedDriver.salaryType === 'Percentage'
                      ? `${selectedDriver.salary}% of Trip Profit`
                      : formatCurrency(selectedDriver.salary, company.currency)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Residential Address
                </span>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-slate-700">
                  {selectedDriver.address || 'No address logged.'}
                </div>
              </div>

              {selectedDriver.notes && (
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-slate-700">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">Notes</span>
                  <p className="text-[11px]">{selectedDriver.notes}</p>
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
              <h3 className="text-sm font-bold">{editingDriver ? 'Edit Driver' : 'Register New Driver'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Tariq"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">CNIC / ID Number</label>
                  <input
                    type="text"
                    placeholder="35201-1234567-1"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">HTV License Number</label>
                  <input
                    type="text"
                    placeholder="HTV-LHR-1234"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Salary Model</label>
                  <select
                    value={formData.salaryType}
                    onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as SalaryType })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Monthly">Monthly Fixed</option>
                    <option value="Per Trip">Per Trip Rate</option>
                    <option value="Percentage">Percentage of Profit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {formData.salaryType === 'Percentage' ? 'Percentage Share (%)' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Assign Truck</label>
                  <select
                    value={formData.assignedTruckId}
                    onChange={(e) => setFormData({ ...formData, assignedTruckId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  >
                    <option value="">-- None --</option>
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.regNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DriverStatus })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="On Trip">On Trip</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Village / City address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  {editingDriver ? 'Save Changes' : 'Enroll Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
