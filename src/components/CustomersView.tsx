import React, { useState } from 'react';
import { Customer, CustomerTransaction, Company, Trip, PaymentMethod } from '../types';
import { calculateCustomerBalance, formatCurrency } from '../services/calculations';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  CreditCard,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Printer,
  Share2,
  ChevronRight,
} from 'lucide-react';

interface Props {
  customers: Customer[];
  transactions: CustomerTransaction[];
  trips: Trip[];
  company: Company;
  onSaveCustomer: (customer: Customer) => void;
  onAddTransaction: (transaction: CustomerTransaction) => void;
  onPrintDocument?: (docType: 'customer_invoice', data: any) => void;
}

export const CustomersView: React.FC<Props> = ({
  customers,
  transactions,
  trips,
  company,
  onSaveCustomer,
  onAddTransaction,
  onPrintDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Form State for Customer
  const [customerForm, setCustomerForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    openingBalance: 0,
    creditLimit: 1000000,
    notes: '',
  });

  // Payment Entry State
  const [paymentForm, setPaymentForm] = useState({
    amount: 50000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer' as PaymentMethod,
    referenceNumber: '',
    description: 'Payment received against outstanding invoices',
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      alert('Please fill Name and Phone');
      return;
    }

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      name: customerForm.name.trim(),
      companyName: customerForm.companyName.trim(),
      phone: customerForm.phone.trim(),
      email: customerForm.email.trim(),
      address: customerForm.address.trim(),
      openingBalance: Number(customerForm.openingBalance),
      creditLimit: Number(customerForm.creditLimit),
      notes: customerForm.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveCustomer(newCust);
    setIsAddModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentForm.amount <= 0) {
      alert('Enter valid payment amount');
      return;
    }

    const tx: CustomerTransaction = {
      id: `tx_${Date.now()}`,
      customerId: selectedCustomer.id,
      type: 'Payment',
      amount: Number(paymentForm.amount),
      date: paymentForm.date,
      description: paymentForm.description,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
      createdAt: Date.now(),
    };

    onAddTransaction(tx);
    setIsPaymentModalOpen(false);
    alert('Payment recorded successfully into local ledger!');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3 bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Customer Accounts & Ledgers</h1>
          <p className="text-xs text-slate-500">{customers.length} Client Accounts</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search customer by name, business or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Customer List */}
      <div className="space-y-2.5">
        {filteredCustomers.map((customer) => {
          const balance = calculateCustomerBalance(customer, transactions);

          return (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-blue-300 cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{customer.name}</h3>
                  {customer.companyName && (
                    <div className="text-xs text-slate-500 font-medium">{customer.companyName}</div>
                  )}
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{customer.phone}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Outstanding Balance</span>
                  <div
                    className={`font-black text-sm font-mono ${
                      balance.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(balance.currentBalance, company.currency)}
                  </div>
                  {balance.isOverLimit && (
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                      Over Credit Limit
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Invoices: {formatCurrency(balance.totalInvoices, company.currency)}</span>
                <span>Payments: {formatCurrency(balance.totalPayments, company.currency)}</span>
                <span className="font-semibold text-blue-600 flex items-center">
                  Ledger <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Ledger & Statement Sheet */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-semibold">Account Ledger Statement</span>
                <h3 className="text-base font-bold">{selectedCustomer.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Receive Payment</span>
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {/* Balance Summary Box */}
              {(() => {
                const bal = calculateCustomerBalance(selectedCustomer, transactions);
                const custTxs = transactions.filter((t) => t.customerId === selectedCustomer.id);

                return (
                  <>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Current Balance Payable</span>
                        <span className="text-lg font-black text-rose-600 font-mono">
                          {formatCurrency(bal.currentBalance, company.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Credit Limit</span>
                        <span className="font-bold text-slate-700 font-mono">
                          {formatCurrency(selectedCustomer.creditLimit, company.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Ledger Entries */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                          Transaction History ({custTxs.length})
                        </span>
                        <button
                          onClick={() => {
                            if (onPrintDocument) {
                              const relatedTrip = trips.find((t) => t.customerId === selectedCustomer.id);
                              onPrintDocument('customer_invoice', { customer: selectedCustomer, trip: relatedTrip });
                            } else {
                              alert('PDF Statement generated.');
                            }
                          }}
                          className="text-blue-600 font-semibold text-xs flex items-center gap-1 hover:underline"
                        >
                          <Printer className="w-3.5 h-3.5" /> Export Invoice / Statement
                        </button>
                      </div>

                      {custTxs.length === 0 ? (
                        <p className="text-slate-400 italic text-center py-4">No transactions recorded yet.</p>
                      ) : (
                        custTxs.map((tx) => {
                          const isDebit = tx.type === 'Trip Invoice' || (tx.type === 'Adjustment' && tx.amount > 0);

                          return (
                            <div
                              key={tx.id}
                              className="bg-white border border-slate-200 rounded-xl p-2.5 flex justify-between items-start"
                            >
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                  {isDebit ? (
                                    <span className="text-rose-600 text-[10px] font-mono px-1 py-0.2 bg-rose-50 border border-rose-200 rounded">
                                      INVOICE
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 text-[10px] font-mono px-1 py-0.2 bg-emerald-50 border border-emerald-200 rounded">
                                      PAYMENT
                                    </span>
                                  )}
                                  <span className="text-xs">{tx.description}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  Date: {tx.date} {tx.paymentMethod ? `• via ${tx.paymentMethod}` : ''}{' '}
                                  {tx.referenceNumber ? `(Ref: ${tx.referenceNumber})` : ''}
                                </div>
                              </div>

                              <div className="text-right font-mono font-bold text-xs">
                                <span className={isDebit ? 'text-rose-600' : 'text-emerald-600'}>
                                  {isDebit ? '+' : '-'}
                                  {formatCurrency(tx.amount, company.currency)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-emerald-700 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-emerald-200 uppercase font-semibold">Record Payment</span>
                <h3 className="text-sm font-bold">{selectedCustomer.name}</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Payment Amount ({company.currency}) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as PaymentMethod })
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

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reference / Cheque Number</label>
                <input
                  type="text"
                  placeholder="e.g. HBL-FT-9910"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl shadow-sm"
                >
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold">Add New Customer Account</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Customer / Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Rehman Steel Mills"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Company / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Industrial Complex Ltd"
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="accounts@company.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Opening Balance</label>
                  <input
                    type="number"
                    value={customerForm.openingBalance}
                    onChange={(e) => setCustomerForm({ ...customerForm, openingBalance: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Credit Limit</label>
                  <input
                    type="number"
                    value={customerForm.creditLimit}
                    onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Address / Terminal Location</label>
                <input
                  type="text"
                  placeholder="Plot 4, Industrial Area"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-300 rounded-lg"
                />
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
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
