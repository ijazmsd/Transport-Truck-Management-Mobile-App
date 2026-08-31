import React from 'react';
import {
  Trip,
  Customer,
  Supplier,
  SupplierTransaction,
  Driver,
  DriverSalarySettlement,
  Currency,
  Truck,
} from '../types';
import { formatCurrency, calculateTripIncome } from '../services/calculations';
import { Printer, X, Download, Share2, FileCheck, CheckCircle2 } from 'lucide-react';

export type PrintableDocumentType =
  | 'bilty'
  | 'customer_invoice'
  | 'supplier_statement'
  | 'driver_payslip';

export interface PrintDocumentModalProps {
  isOpen: boolean;
  docType: PrintableDocumentType;
  data: any;
  currency: Currency;
  onClose: () => void;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  docType,
  data,
  currency,
  onClose,
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Actions Toolbar */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Official Document Preview
              </h3>
              <p className="text-[11px] text-slate-400">
                {docType === 'bilty' && 'Standard Goods Consignment Note (Bilty / LR)'}
                {docType === 'customer_invoice' && 'Freight Tax Invoice & Trip Statement'}
                {docType === 'supplier_statement' && 'Supplier Ledger Account Statement'}
                {docType === 'driver_payslip' && 'Driver Monthly Salary Slip Voucher'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas Document Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 text-slate-900 print:p-0 print:bg-white print:m-0">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 max-w-xl mx-auto text-xs">
            
            {/* 1. BILTY / LORRY RECEIPT (LR) */}
            {docType === 'bilty' && (() => {
              const trip: Trip = data.trip;
              const customer: Customer = data.customer;
              const driver: Driver = data.driver;
              const truck: Truck = data.truck;
              const netBalance = calculateTripIncome(trip) - (trip.advanceReceived || 0);

              return (
                <div className="space-y-4 font-sans">
                  {/* Header */}
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        TRUCKBOOK LOGISTICS
                      </h1>
                      <p className="text-[11px] text-slate-600">Goods Transport & Heavy Haulage Fleet Services</p>
                      <p className="text-[10px] text-slate-500">Head Office: Transport Nagar, National Highway N-5</p>
                      <p className="text-[10px] text-slate-500">Contact: +92 300 9876543 | NTN: 8812903-4</p>
                    </div>
                    <div className="text-right border-2 border-slate-900 p-2 rounded-md">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">BILTY / LR NO</span>
                      <span className="text-base font-black text-indigo-700">{trip.tripNumber}</span>
                      <span className="text-[10px] block text-slate-600 mt-0.5">Date: {trip.tripDate}</span>
                    </div>
                  </div>

                  {/* Route & Vehicle Matrix */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                    <div>
                      <p><strong>Truck No:</strong> <span className="font-bold text-slate-900">{truck?.regNumber || trip.truckId}</span> ({truck?.make || 'Truck'})</p>
                      <p><strong>Driver:</strong> {driver?.name || 'Assigned Driver'} ({driver?.phone || 'N/A'})</p>
                      <p><strong>Driver CNIC:</strong> {driver?.cnic || '35201-XXXXXXXX-X'}</p>
                    </div>
                    <div>
                      <p><strong>From (Origin):</strong> <span className="font-bold text-slate-900">{trip.fromLocation}</span></p>
                      <p><strong>To (Destination):</strong> <span className="font-bold text-slate-900">{trip.toLocation}</span></p>
                      <p><strong>Trip Status:</strong> <span className="uppercase font-semibold text-indigo-700">{trip.status}</span></p>
                    </div>
                  </div>

                  {/* Consignor & Consignee */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-300 p-2.5 rounded-lg">
                      <h4 className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-1">
                        Consignor (Sender / Customer)
                      </h4>
                      <p className="font-bold text-slate-900 text-xs">{customer?.name || 'Direct Shipper'}</p>
                      <p className="text-[11px] text-slate-600">{customer?.phone || '+92 300 0000000'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{customer?.address || 'Loading Terminal'}</p>
                    </div>
                    <div className="border border-slate-300 p-2.5 rounded-lg">
                      <h4 className="font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-1">
                        Consignee (Receiver)
                      </h4>
                      <p className="font-bold text-slate-900 text-xs">{customer?.name || 'Consignee Shipper'}</p>
                      <p className="text-[11px] text-slate-600">Location: {trip.toLocation}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Delivery Warehouse Terminal</p>
                    </div>
                  </div>

                  {/* Cargo Particulars */}
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2 text-left border-r border-slate-300">Description of Goods</th>
                        <th className="p-2 text-center border-r border-slate-300">Packages</th>
                        <th className="p-2 text-center border-r border-slate-300">Weight</th>
                        <th className="p-2 text-right">Freight Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-300">
                          <p className="font-bold text-slate-900">{trip.cargoDescription || 'Commercial Freight Cargo'}</p>
                          <p className="text-[10px] text-slate-500">Route: {trip.fromLocation} to {trip.toLocation}</p>
                        </td>
                        <td className="p-2 text-center border-r border-slate-300">1 Full Load</td>
                        <td className="p-2 text-center border-r border-slate-300 font-bold">
                          {trip.cargoWeight ? `${trip.cargoWeight} Tons` : 'Bulk'}
                        </td>
                        <td className="p-2 text-right font-bold">{formatCurrency(trip.tripRate, currency)}</td>
                      </tr>
                      {trip.loadingCharges > 0 && (
                        <tr className="border-b border-slate-200 text-slate-600">
                          <td colSpan={3} className="p-1.5 pl-2 text-left border-r border-slate-300">Loading Charges</td>
                          <td className="p-1.5 pr-2 text-right">+{formatCurrency(trip.loadingCharges, currency)}</td>
                        </tr>
                      )}
                      {trip.unloadingCharges > 0 && (
                        <tr className="border-b border-slate-200 text-slate-600">
                          <td colSpan={3} className="p-1.5 pl-2 text-left border-r border-slate-300">Unloading Charges</td>
                          <td className="p-1.5 pr-2 text-right">+{formatCurrency(trip.unloadingCharges, currency)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Financial Settlement on Bilty */}
                  <div className="flex justify-end">
                    <div className="w-64 border border-slate-300 rounded-lg p-2.5 bg-slate-50 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Freight:</span>
                        <strong className="text-slate-900">{formatCurrency(calculateTripIncome(trip), currency)}</strong>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Advance Paid:</span>
                        <strong>-{formatCurrency(trip.advanceReceived || 0, currency)}</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-300 pt-1 text-slate-900 font-bold">
                        <span>Balance to Pay on Delivery:</span>
                        <span className="text-indigo-700">{formatCurrency(netBalance, currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Signatures */}
                  <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-500">
                    <div className="border-t border-slate-400 pt-1 mt-6">
                      <p className="font-semibold text-slate-700">Consignor / Sender</p>
                    </div>
                    <div className="border-t border-slate-400 pt-1 mt-6">
                      <p className="font-semibold text-slate-700">Driver Signature</p>
                    </div>
                    <div className="border-t border-slate-400 pt-1 mt-6">
                      <p className="font-semibold text-slate-700">Receiver / Stamp</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. CUSTOMER FREIGHT INVOICE */}
            {docType === 'customer_invoice' && (() => {
              const trip: Trip | undefined = data.trip;
              const customer: Customer = data.customer;
              const invoiceNum = trip ? `INV-${trip.tripNumber}` : `INV-${customer?.id?.substring(5) || '101'}`;
              const totalAmount = trip ? calculateTripIncome(trip) : (customer?.openingBalance || 0);
              const advancePaid = trip ? (trip.advanceReceived || 0) : 0;
              const netDue = totalAmount - advancePaid;

              return (
                <div className="space-y-4 font-sans">
                  {/* Company Top Bar */}
                  <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-3">
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-indigo-900">
                        TRUCKBOOK TRANSPORT CO.
                      </h1>
                      <p className="text-[11px] text-slate-600">Nationwide Goods Transportation & Fleet Management</p>
                      <p className="text-[10px] text-slate-500">Email: billing@truckbook.local | NTN: 8812903-4</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 block uppercase">INVOICE</span>
                      <span className="font-bold text-xs text-indigo-700">{invoiceNum}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Date: {trip?.tripDate || new Date().toISOString().split('T')[0]}</p>
                    </div>
                  </div>

                  {/* Bill To */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To:</span>
                      <h3 className="font-bold text-slate-900 text-sm">{customer?.name || 'Valued Customer'}</h3>
                      <p className="text-slate-600">{customer?.phone}</p>
                      <p className="text-slate-500 text-[10px]">{customer?.address}</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <p><strong>Status:</strong> <span className="text-indigo-700 font-bold uppercase">{trip?.status || 'Active'}</span></p>
                      <p><strong>Reference:</strong> {trip?.tripNumber || 'Ledger Statement'}</p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2 text-left border-r border-slate-300">Trip / Route Description</th>
                        <th className="p-2 text-center border-r border-slate-300">Weight</th>
                        <th className="p-2 text-right border-r border-slate-300">Rate</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trip ? (
                        <>
                          <tr className="border-b border-slate-200">
                            <td className="p-2 border-r border-slate-300">
                              <p className="font-bold text-slate-900">{trip.fromLocation} &rarr; {trip.toLocation}</p>
                              <p className="text-[10px] text-slate-500">Cargo: {trip.cargoDescription} (Truck: {trip.truckId})</p>
                            </td>
                            <td className="p-2 text-center border-r border-slate-300">{trip.cargoWeight ? `${trip.cargoWeight} T` : 'Full Load'}</td>
                            <td className="p-2 text-right border-r border-slate-300">{formatCurrency(trip.tripRate, currency)}</td>
                            <td className="p-2 text-right font-bold">{formatCurrency(trip.tripRate, currency)}</td>
                          </tr>
                          {trip.loadingCharges > 0 && (
                            <tr className="border-b border-slate-200">
                              <td colSpan={3} className="p-2 text-left border-r border-slate-300">Loading & Handling Charges</td>
                              <td className="p-2 text-right font-semibold">{formatCurrency(trip.loadingCharges, currency)}</td>
                            </tr>
                          )}
                          {trip.unloadingCharges > 0 && (
                            <tr className="border-b border-slate-200">
                              <td colSpan={3} className="p-2 text-left border-r border-slate-300">Unloading Charges</td>
                              <td className="p-2 text-right font-semibold">{formatCurrency(trip.unloadingCharges, currency)}</td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-300">
                            <p className="font-bold text-slate-900">Account Statement & Outstanding Invoices</p>
                            <p className="text-[10px] text-slate-500">Total verified freight billing and adjustments</p>
                          </td>
                          <td className="p-2 text-center border-r border-slate-300">-</td>
                          <td className="p-2 text-right border-r border-slate-300">{formatCurrency(totalAmount, currency)}</td>
                          <td className="p-2 text-right font-bold">{formatCurrency(totalAmount, currency)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Summary Totals */}
                  <div className="flex justify-between items-start pt-2">
                    <div className="text-[10px] text-slate-500 space-y-1">
                      <p className="font-bold text-slate-700 uppercase">Bank Payment Details:</p>
                      <p>Bank: Habib Bank Limited (HBL)</p>
                      <p>Title: TruckBook Transport Fleet</p>
                      <p>IBAN: PK36 HABB 0000 1234 5678 9012</p>
                    </div>

                    <div className="w-56 space-y-1 border border-slate-300 rounded-lg p-2.5 bg-slate-50">
                      <div className="flex justify-between">
                        <span>Invoice Total:</span>
                        <strong className="text-slate-900">{formatCurrency(totalAmount, currency)}</strong>
                      </div>
                      {advancePaid > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Advance Paid:</span>
                          <strong>-{formatCurrency(advancePaid, currency)}</strong>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-300 pt-1 text-slate-900 font-bold">
                        <span>Net Due:</span>
                        <span className="text-indigo-700 text-sm">{formatCurrency(netDue, currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
                    <p>Thank you for choosing TruckBook Transport Services.</p>
                    <p>Authorized Signature & Stamp</p>
                  </div>
                </div>
              );
            })()}

            {/* 3. SUPPLIER STATEMENT */}
            {docType === 'supplier_statement' && (() => {
              const supplier: Supplier = data.supplier;
              const txList: SupplierTransaction[] = data.transactions || [];
              let runningBal = supplier?.openingBalance || 0;
              return (
                <div className="space-y-4 font-sans">
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                    <div>
                      <h1 className="text-xl font-black text-slate-900 uppercase">
                        VENDOR ACCOUNT STATEMENT
                      </h1>
                      <p className="text-[11px] text-slate-600">TruckBook Logistics & Fleet Operations</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 block">Statement Date</span>
                      <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Vendor Account:</span>
                      <h3 className="font-bold text-slate-900 text-sm">{supplier?.name}</h3>
                      <p className="text-slate-600">{supplier?.category} &bull; {supplier?.phone}</p>
                      <p className="text-slate-500 text-[10px]">{supplier?.address}</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2 text-left border-r border-slate-300">Date</th>
                        <th className="p-2 text-left border-r border-slate-300">Description</th>
                        <th className="p-2 text-right border-r border-slate-300">Bill (+)</th>
                        <th className="p-2 text-right border-r border-slate-300">Paid (-)</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td className="p-2 border-r border-slate-300">-</td>
                        <td className="p-2 border-r border-slate-300 font-semibold">Opening Balance</td>
                        <td className="p-2 text-right border-r border-slate-300">-</td>
                        <td className="p-2 text-right border-r border-slate-300">-</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(supplier?.openingBalance || 0, currency)}</td>
                      </tr>
                      {txList.map((tx) => {
                        const isBill = tx.type === 'Bill';
                        if (isBill) runningBal += tx.amount;
                        else runningBal -= tx.amount;
                        return (
                          <tr key={tx.id} className="border-b border-slate-200">
                            <td className="p-2 border-r border-slate-300">{tx.date}</td>
                            <td className="p-2 border-r border-slate-300">
                              <p className="font-medium text-slate-900">{tx.description}</p>
                              {tx.referenceNumber && <p className="text-[10px] text-slate-400">Ref: {tx.referenceNumber}</p>}
                            </td>
                            <td className="p-2 text-right border-r border-slate-300 font-semibold text-rose-600">
                              {isBill ? formatCurrency(tx.amount, currency) : '-'}
                            </td>
                            <td className="p-2 text-right border-r border-slate-300 font-semibold text-emerald-600">
                              {!isBill ? formatCurrency(tx.amount, currency) : '-'}
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              {formatCurrency(runningBal, currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-2">
                    <div className="bg-slate-900 text-white p-3 rounded-lg w-64 flex justify-between items-center">
                      <span className="text-xs font-semibold">Net Payable Balance:</span>
                      <span className="text-base font-bold text-amber-300">{formatCurrency(runningBal, currency)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 4. DRIVER PAY SLIP */}
            {docType === 'driver_payslip' && (() => {
              const driver: Driver = data.driver;
              const breakdown = data.breakdown;
              const settlement: DriverSalarySettlement = data.settlement;
              const monthPeriod = data.monthPeriod;
              return (
                <div className="space-y-4 font-sans">
                  <div className="border-b-2 border-indigo-700 pb-3 flex justify-between items-start">
                    <div>
                      <h1 className="text-xl font-black text-slate-900">
                        DRIVER SALARY PAY VOUCHER
                      </h1>
                      <p className="text-[11px] text-slate-600">TruckBook Logistics & Fleet Payroll</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 block uppercase">Month Period</span>
                      <span className="text-sm font-black text-indigo-700">{monthPeriod}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver Details:</span>
                      <h3 className="font-bold text-slate-900 text-sm">{driver?.name}</h3>
                      <p className="text-slate-600">CNIC: {driver?.cnic || '35201-XXXXXXXX-X'} &bull; {driver?.phone}</p>
                      <p className="text-slate-500 text-[10px]">Wage Structure: {driver?.salaryType} Basis</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <p><strong>Trips Completed:</strong> {breakdown?.tripsDoneCount || 0}</p>
                      {settlement && <p className="text-emerald-700 font-bold mt-1">PAID on {settlement.paymentDate}</p>}
                    </div>
                  </div>

                  {/* Earnings & Deductions Tables */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-300 rounded-lg p-2.5">
                      <h4 className="font-bold text-[11px] text-indigo-900 uppercase border-b border-slate-200 pb-1 mb-2">
                        Earnings & Allowances
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Base Salary:</span>
                          <strong>{formatCurrency(breakdown?.baseSalary || 0, currency)}</strong>
                        </div>
                        {breakdown?.tripCommissions > 0 && (
                          <div className="flex justify-between text-indigo-700">
                            <span>Trip Commissions:</span>
                            <strong>+{formatCurrency(breakdown.tripCommissions, currency)}</strong>
                          </div>
                        )}
                        {breakdown?.tripAllowances > 0 && (
                          <div className="flex justify-between text-indigo-700">
                            <span>Trip Allowances:</span>
                            <strong>+{formatCurrency(breakdown.tripAllowances, currency)}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-300 rounded-lg p-2.5">
                      <h4 className="font-bold text-[11px] text-rose-900 uppercase border-b border-slate-200 pb-1 mb-2">
                        Deductions & Advances
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-rose-700">
                          <span>Trip Advances Deducted:</span>
                          <strong>-{formatCurrency(breakdown?.advancesDeducted || 0, currency)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Box */}
                  <div className="bg-indigo-900 text-white p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-semibold">Net Take-Home Salary:</span>
                    <span className="text-xl font-bold text-amber-300">
                      {formatCurrency(breakdown?.netPayable || 0, currency)}
                    </span>
                  </div>

                  {/* Signatures */}
                  <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                    <div className="border-t border-slate-400 pt-1 mt-6">
                      <p className="font-semibold text-slate-700">Driver Signature / Thumb Impression</p>
                    </div>
                    <div className="border-t border-slate-400 pt-1 mt-6">
                      <p className="font-semibold text-slate-700">Accountant / Fleet Manager Stamp</p>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
};
