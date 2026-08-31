import React, { useState } from 'react';
import {
  Supplier,
  SupplierTransaction,
  SupplierType,
  PaymentMethod,
  Currency,
  Truck,
  Trip,
} from '../types';
import { calculateSupplierBalance, formatCurrency } from '../services/calculations';
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
} from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  transactions: SupplierTransaction[];
  trucks: Truck[];
  trips: Trip[];
  currency: Currency;
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onAddTransaction: (tx: SupplierTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onPrintDocument: (docType: 'supplier_statement', data: { supplier: Supplier; transactions: SupplierTransaction[] }) => void;
}

const SUPPLIER_CATEGORIES: SupplierType[] = [
  'Fuel Pump',
  'Workshop',
  'Tyre Dealer',
  'Spare Parts',
  'Insurance Agent',
  'Toll Provider',
  'Other',
];

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  transactions,
  trucks,
  trips,
  currency,
  onSaveSupplier,
  onDeleteSupplier,
  onAddTransaction,
  onDeleteTransaction,
  onPrintDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Modals
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Form states for new/edit supplier
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<SupplierType>('Fuel Pump');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState<number>(0);
  const [formCreditLimit, setFormCreditLimit] = useState<number>(500000);
  const [formNotes, setFormNotes] = useState('');

  // Form state for Record Bill
  const [billAmount, setBillAmount] = useState<number>(0);
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [billDescription, setBillDescription] = useState('');
  const [billTruckId, setBillTruckId] = useState<string>('');
  const [billTripId, setBillTripId] = useState<string>('');

  // Form state for Record Payment
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate totals
  const totalOutstanding = suppliers.reduce((sum, s) => {
    const { currentBalance } = calculateSupplierBalance(s, transactions);
    return sum + currentBalance;
  }, 0);

  const openAddSupplier = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormCategory('Fuel Pump');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormOpeningBalance(0);
    setFormCreditLimit(500000);
    setFormNotes('');
    setIsSupplierModalOpen(true);
  };

  const openEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormName(supplier.name);
    setFormCategory(supplier.category);
    setFormPhone(supplier.phone);
    setFormEmail(supplier.email || '');
    setFormAddress(supplier.address);
    setFormOpeningBalance(supplier.openingBalance || 0);
    setFormCreditLimit(supplier.creditLimit || 0);
    setFormNotes(supplier.notes || '');
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const supplier: Supplier = {
      id: editingSupplier ? editingSupplier.id : `sup_${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      address: formAddress.trim(),
      openingBalance: Number(formOpeningBalance) || 0,
      creditLimit: Number(formCreditLimit) || 0,
      notes: formNotes.trim() || undefined,
      createdAt: editingSupplier ? editingSupplier.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSaveSupplier(supplier);
    setIsSupplierModalOpen(false);
    if (selectedSupplier && selectedSupplier.id === supplier.id) {
      setSelectedSupplier(supplier);
    }
  };

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || billAmount <= 0) return;

    const tx: SupplierTransaction = {
      id: `stx_${Date.now()}`,
      supplierId: selectedSupplier.id,
      truckId: billTruckId || undefined,
      tripId: billTripId || undefined,
      type: 'Bill',
      amount: Number(billAmount),
      date: billDate,
      description: billDescription.trim() || 'Vendor purchase bill',
      paymentMethod: 'Bank Transfer',
      createdAt: Date.now(),
    };

    onAddTransaction(tx);
    setIsBillModalOpen(false);
    setBillAmount(0);
    setBillDescription('');
    setBillTruckId('');
    setBillTripId('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || paymentAmount <= 0) return;

    const tx: SupplierTransaction = {
      id: `stx_${Date.now()}`,
      supplierId: selectedSupplier.id,
      type: 'Payment',
      amount: Number(paymentAmount),
      date: paymentDate,
      paymentMethod,
      referenceNumber: paymentRef.trim() || undefined,
      description: paymentDesc.trim() || `Payment to ${selectedSupplier.name}`,
      createdAt: Date.now(),
    };

    onAddTransaction(tx);
    setIsPaymentModalOpen(false);
    setPaymentAmount(0);
    setPaymentRef('');
    setPaymentDesc('');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-lg border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Suppliers & Vendors</h2>
              <p className="text-xs text-slate-300">Fuel Pumps, Workshops & Spare Parts</p>
            </div>
          </div>
          <button
            id="add-supplier-btn"
            onClick={openAddSupplier}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
          <div>
            <span className="text-[11px] text-slate-300 block">Total Payable to Vendors</span>
            <span className="text-lg font-bold text-amber-300">
              {formatCurrency(totalOutstanding, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-300 block">Active Suppliers</span>
            <span className="text-lg font-bold text-indigo-200">{suppliers.length} Registered</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="supplier-search-input"
            type="text"
            placeholder="Search suppliers by name, phone or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        {/* Category horizontal tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            id="cat-all-btn"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({suppliers.length})
          </button>
          {SUPPLIER_CATEGORIES.map((cat) => {
            const count = suppliers.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}-btn`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-2.5">
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No suppliers found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your fuel pumps, workshops, and spare part suppliers.
            </p>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => {
            const { currentBalance, totalBills, totalPayments } = calculateSupplierBalance(
              supplier,
              transactions
            );
            return (
              <div
                key={supplier.id}
                id={`supplier-card-${supplier.id}`}
                onClick={() => setSelectedSupplier(supplier)}
                className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-sm hover:border-indigo-300 hover:shadow transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-slate-200 shrink-0">
                      {supplier.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                        {supplier.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {supplier.category}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          {supplier.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Balance Owed</span>
                    <span
                      className={`text-sm font-bold ${
                        currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(currentBalance, currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span>
                      Bills: <strong className="text-slate-700">{formatCurrency(totalBills, currency)}</strong>
                    </span>
                    <span>
                      Paid: <strong className="text-emerald-700">{formatCurrency(totalPayments, currency)}</strong>
                    </span>
                  </div>
                  <span className="text-indigo-600 font-medium text-[11px] hover:underline">
                    View Ledger &rarr;
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Supplier Detail & Ledger Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedSupplier.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedSupplier.name}</h3>
                  <p className="text-xs text-slate-500">{selectedSupplier.category} &bull; {selectedSupplier.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  id="print-supplier-stmt-btn"
                  onClick={() => {
                    const supTx = transactions.filter((t) => t.supplierId === selectedSupplier.id);
                    onPrintDocument('supplier_statement', { supplier: selectedSupplier, transactions: supTx });
                  }}
                  title="Print Account Statement"
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  id="edit-supplier-btn"
                  onClick={() => openEditSupplier(selectedSupplier)}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  id="close-supplier-detail-btn"
                  onClick={() => setSelectedSupplier(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Financial Balance Card */}
              {(() => {
                const bal = calculateSupplierBalance(selectedSupplier, transactions);
                return (
                  <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-300">Net Balance Payable</span>
                        <h4 className="text-xl font-bold text-amber-300">
                          {formatCurrency(bal.currentBalance, currency)}
                        </h4>
                      </div>
                      <div className="text-right text-xs space-y-0.5">
                        <p className="text-slate-300">Total Invoiced: <strong className="text-white">{formatCurrency(bal.totalBills, currency)}</strong></p>
                        <p className="text-slate-300">Total Paid: <strong className="text-emerald-400">{formatCurrency(bal.totalPayments, currency)}</strong></p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons: Add Bill & Record Payment */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="record-bill-btn"
                  onClick={() => setIsBillModalOpen(true)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-medium text-xs border border-rose-200 transition"
                >
                  <Receipt className="w-4 h-4" />
                  <span>+ Record Bill</span>
                </button>
                <button
                  id="record-payment-btn"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-medium text-xs border border-emerald-200 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>+ Make Payment</span>
                </button>
              </div>

              {/* Vendor Ledger History */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                  Transaction & Bill History
                </h4>
                {(() => {
                  const supTx = transactions.filter((t) => t.supplierId === selectedSupplier.id);
                  if (supTx.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 py-3 text-center italic">
                        No transactions recorded for this supplier yet.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {supTx.map((tx) => {
                        const isPayment = tx.type === 'Payment';
                        return (
                          <div
                            key={tx.id}
                            className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isPayment
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {isPayment ? (
                                  <ArrowDownLeft className="w-4 h-4" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800">{tx.description}</p>
                                <p className="text-[11px] text-slate-400">
                                  {tx.date} &bull; {tx.paymentMethod || 'Credit'}
                                  {tx.referenceNumber && ` (Ref: ${tx.referenceNumber})`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs font-bold ${
                                  isPayment ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {isPayment ? '-' : '+'}
                                {formatCurrency(tx.amount, currency)}
                              </span>
                              <button
                                onClick={() => onDeleteTransaction(tx.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition"
                                title="Delete transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Vendor Info Details */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200 text-slate-600">
                <p><strong>Address:</strong> {selectedSupplier.address}</p>
                {selectedSupplier.email && <p><strong>Email:</strong> {selectedSupplier.email}</p>}
                {selectedSupplier.notes && <p><strong>Notes:</strong> {selectedSupplier.notes}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier / Vendor'}
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierSubmit} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PSO National Fuel Station"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SupplierType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {SUPPLIER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Address / Station Location</label>
                <input
                  type="text"
                  placeholder="e.g. Near Sadiqabad Toll Plaza, N-5 Bypass"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Opening Balance (We Owe)</label>
                  <input
                    type="number"
                    value={formOpeningBalance}
                    onChange={(e) => setFormOpeningBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Credit Limit</label>
                  <input
                    type="number"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 15 days diesel billing cycle. M-Tag card #4412"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Bill Modal */}
      {isBillModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Vendor Bill / Purchase</h3>
              <button onClick={() => setIsBillModalOpen(false)} className="text-rose-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBillSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bill Amount ({currency}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 72000"
                  value={billAmount || ''}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Link Truck (Optional)</label>
                  <select
                    value={billTruckId}
                    onChange={(e) => setBillTruckId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">-- None --</option>
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.regNumber} ({t.make})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bill Description</label>
                <input
                  type="text"
                  placeholder="e.g. 240 Liters diesel / Clutch plate repair"
                  value={billDescription}
                  onChange={(e) => setBillDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBillModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 shadow-sm"
                >
                  Add to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Payment to {selectedSupplier.name}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Paid Amount ({currency}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 50000"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online">Online / Mobile Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Reference / Cheque #</label>
                <input
                  type="text"
                  placeholder="e.g. HBL-FT-991024 or Cheque #7719"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Part payment towards August diesel bill"
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
