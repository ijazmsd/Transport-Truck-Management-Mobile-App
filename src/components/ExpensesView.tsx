import React, { useState } from 'react';
import { Expense, ExpenseCategory, PaymentMethod, Company, Truck, Driver, Trip } from '../types';
import { formatCurrency } from '../services/calculations';
import {
  CreditCard,
  Search,
  Plus,
  Fuel,
  Wrench,
  DollarSign,
  Tag,
  Calendar,
  X,
  FileText,
  Filter,
  Camera,
  Image,
} from 'lucide-react';

interface Props {
  expenses: Expense[];
  trucks: Truck[];
  drivers: Driver[];
  trips: Trip[];
  company: Company;
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  initialTripId?: string;
}

export const ExpensesView: React.FC<Props> = ({
  expenses,
  trucks,
  drivers,
  trips,
  company,
  onSaveExpense,
  onDeleteExpense,
  initialTripId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!initialTripId);

  const [formData, setFormData] = useState({
    tripId: initialTripId || '',
    truckId: trucks[0]?.id || '',
    driverId: drivers[0]?.id || '',
    category: 'Fuel' as ExpenseCategory,
    amount: 15000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash' as PaymentMethod,
    description: '',
  });

  const CATEGORIES: ExpenseCategory[] = [
    'Fuel',
    'Toll',
    'Maintenance',
    'Driver Advance',
    'Driver Salary',
    'Loading',
    'Unloading',
    'Insurance',
    'Registration',
    'Repair',
    'Office',
    'Other',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpenseSum = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description.trim()) {
      alert('Please provide valid expense description and amount.');
      return;
    }

    const exp: Expense = {
      id: `exp_${Date.now()}`,
      tripId: formData.tripId || undefined,
      truckId: formData.truckId || undefined,
      driverId: formData.driverId || undefined,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      description: formData.description.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveExpense(exp);
    setIsAddModalOpen(false);
    setFormData({
      tripId: '',
      truckId: trucks[0]?.id || '',
      driverId: drivers[0]?.id || '',
      category: 'Fuel',
      amount: 5000,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      description: '',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3 bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Expense Register</h1>
          <p className="text-xs text-slate-500">
            Total Filtered: {formatCurrency(totalExpenseSum, company.currency)}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Search and Category Chips */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Entries List */}
      <div className="space-y-2.5">
        {filteredExpenses.map((exp) => {
          const trip = trips.find((t) => t.id === exp.tripId);
          const truck = trucks.find((t) => t.id === exp.truckId);
          const driver = drivers.find((d) => d.id === exp.driverId);

          return (
            <div
              key={exp.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {exp.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">{exp.description}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-2">
                  <span>📅 {exp.date}</span>
                  <span>💳 {exp.paymentMethod}</span>
                  {truck && <span>🚛 {truck.regNumber}</span>}
                  {trip && <span>📦 {trip.tripNumber}</span>}
                  {driver && <span>👤 {driver.name.split(' ')[0]}</span>}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-rose-600 font-mono">
                  {formatCurrency(exp.amount, company.currency)}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this expense entry?')) {
                      onDeleteExpense(exp.id);
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-500 mt-1"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold">Log New Expense</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expense Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Amount ({company.currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description / Narration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 200 Liters Diesel at Highway bypass"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Attach to Trip (Optional)</label>
                  <select
                    value={formData.tripId}
                    onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">-- General Overhead --</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tripNumber} ({t.fromLocation} → {t.toLocation})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Truck Vehicle</label>
                  <select
                    value={formData.truckId}
                    onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">-- None --</option>
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.regNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
