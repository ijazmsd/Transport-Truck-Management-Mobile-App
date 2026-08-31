import React, { useState, useEffect } from 'react';
import {
  Company,
  Truck,
  Driver,
  Customer,
  Trip,
  Expense,
  CustomerTransaction,
  AppNotification,
  Supplier,
  SupplierTransaction,
  FuelEntry,
  MaintenanceRecord,
  DriverSalarySettlement,
} from './types';
import { db } from './data/db';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { TrucksView } from './components/TrucksView';
import { DriversView } from './components/DriversView';
import { CustomersView } from './components/CustomersView';
import { TripsView } from './components/TripsView';
import { ExpensesView } from './components/ExpensesView';
import { SettingsView } from './components/SettingsView';
import { SuppliersView } from './components/SuppliersView';
import { FuelView } from './components/FuelView';
import { MaintenanceView } from './components/MaintenanceView';
import { PayrollView } from './components/PayrollView';
import { PrintDocumentModal, PrintableDocumentType } from './components/PrintDocumentModal';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import {
  Truck as TruckIcon,
  Users,
  CreditCard,
  Building2,
  Fuel,
  Wrench,
  DollarSign,
  Receipt,
  FileCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [fleetSubTab, setFleetSubTab] = useState<'trucks' | 'drivers' | 'maintenance'>('trucks');
  const [financeSubTab, setFinanceSubTab] = useState<
    'expenses' | 'fuel' | 'customers' | 'suppliers' | 'payroll'
  >('expenses');
  const [isCodeView, setIsCodeView] = useState<boolean>(false);
  const [initialExpenseTripId, setInitialExpenseTripId] = useState<string | undefined>(undefined);

  // Print Document Engine State
  const [printableModal, setPrintableModal] = useState<{
    isOpen: boolean;
    docType: PrintableDocumentType;
    data: any;
  }>({
    isOpen: false,
    docType: 'bilty',
    data: null,
  });

  // Core Data States loaded from Local SQLite / Storage
  const [company, setCompany] = useState<Company>(() => db.getCompany());
  const [trucks, setTrucks] = useState<Truck[]>(() => db.getTrucks());
  const [drivers, setDrivers] = useState<Driver[]>(() => db.getDrivers());
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [trips, setTrips] = useState<Trip[]>(() => db.getTrips());
  const [expenses, setExpenses] = useState<Expense[]>(() => db.getExpenses());
  const [transactions, setTransactions] = useState<CustomerTransaction[]>(() => db.getTransactions());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.getSuppliers());
  const [supplierTransactions, setSupplierTransactions] = useState<SupplierTransaction[]>(() =>
    db.getSupplierTransactions()
  );
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => db.getFuelEntries());
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() =>
    db.getMaintenanceRecords()
  );
  const [settlements, setSettlements] = useState<DriverSalarySettlement[]>(() =>
    db.getSalarySettlements()
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() => db.getNotifications());

  const refreshState = () => {
    setCompany(db.getCompany());
    setTrucks(db.getTrucks());
    setDrivers(db.getDrivers());
    setCustomers(db.getCustomers());
    setTrips(db.getTrips());
    setExpenses(db.getExpenses());
    setTransactions(db.getTransactions());
    setSuppliers(db.getSuppliers());
    setSupplierTransactions(db.getSupplierTransactions());
    setFuelEntries(db.getFuelEntries());
    setMaintenanceRecords(db.getMaintenanceRecords());
    setSettlements(db.getSalarySettlements());
    setNotifications(db.getNotifications());
  };

  // CRUD Handlers
  const handleSaveTruck = (truck: Truck) => {
    db.saveTruck(truck);
    refreshState();
  };

  const handleDeleteTruck = (truckId: string) => {
    db.deleteTruck(truckId);
    refreshState();
  };

  const handleSaveDriver = (driver: Driver) => {
    db.saveDriver(driver);
    refreshState();
  };

  const handleDeleteDriver = (driverId: string) => {
    db.deleteDriver(driverId);
    refreshState();
  };

  const handleSaveCustomer = (customer: Customer) => {
    db.saveCustomer(customer);
    refreshState();
  };

  const handleAddTransaction = (tx: CustomerTransaction) => {
    db.addCustomerTransaction(tx);
    refreshState();
  };

  const handleSaveTrip = (trip: Trip) => {
    db.saveTrip(trip);
    refreshState();
  };

  const handleDeleteTrip = (tripId: string) => {
    db.deleteTrip(tripId);
    refreshState();
  };

  const handleSaveExpense = (expense: Expense) => {
    db.saveExpense(expense);
    refreshState();
  };

  const handleDeleteExpense = (expenseId: string) => {
    db.deleteExpense(expenseId);
    refreshState();
  };

  const handleSaveSupplier = (supplier: Supplier) => {
    db.saveSupplier(supplier);
    refreshState();
  };

  const handleDeleteSupplier = (supplierId: string) => {
    db.deleteSupplier(supplierId);
    refreshState();
  };

  const handleAddSupplierTransaction = (tx: SupplierTransaction) => {
    db.addSupplierTransaction(tx);
    refreshState();
  };

  const handleDeleteSupplierTransaction = (id: string) => {
    db.deleteSupplierTransaction(id);
    refreshState();
  };

  const handleSaveFuelEntry = (entry: FuelEntry) => {
    db.saveFuelEntry(entry);
    refreshState();
  };

  const handleDeleteFuelEntry = (id: string) => {
    db.deleteFuelEntry(id);
    refreshState();
  };

  const handleSaveMaintenanceRecord = (record: MaintenanceRecord) => {
    db.saveMaintenanceRecord(record);
    refreshState();
  };

  const handleDeleteMaintenanceRecord = (id: string) => {
    db.deleteMaintenanceRecord(id);
    refreshState();
  };

  const handleSaveSettlement = (settlement: DriverSalarySettlement) => {
    db.saveSalarySettlement(settlement);
    refreshState();
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    db.updateCompany(updatedCompany);
    refreshState();
  };

  const handleResetDatabase = () => {
    db.resetDatabase();
    refreshState();
  };

  const openDocumentPrint = (docType: PrintableDocumentType, data: any) => {
    setPrintableModal({
      isOpen: true,
      docType,
      data,
    });
  };

  const activeTripsCount = trips.filter(
    (t) => t.status === 'In Progress' || t.status === 'Assigned'
  ).length;

  return (
    <MobileFrame
      activeTab={activeTab}
      isCodeView={isCodeView}
      onToggleCodeView={() => setIsCodeView(!isCodeView)}
    >
      {isCodeView ? (
        <FlutterCodeViewer />
      ) : (
        <>
          {/* Main Dashboard Screen */}
          {activeTab === 'dashboard' && (
            <DashboardView
              company={company}
              trucks={trucks}
              drivers={drivers}
              customers={customers}
              trips={trips}
              expenses={expenses}
              notifications={notifications}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setIsCodeView(false);
              }}
              onSelectTrip={() => {
                setActiveTab('trips');
              }}
              onSelectTruck={() => {
                setActiveTab('fleet');
                setFleetSubTab('trucks');
              }}
              onCreateTrip={() => {
                setActiveTab('trips');
              }}
              onCreateExpense={() => {
                setActiveTab('finance');
                setFinanceSubTab('expenses');
              }}
            />
          )}

          {/* Trips Screen */}
          {activeTab === 'trips' && (
            <TripsView
              trips={trips}
              trucks={trucks}
              drivers={drivers}
              customers={customers}
              expenses={expenses}
              company={company}
              onSaveTrip={handleSaveTrip}
              onDeleteTrip={handleDeleteTrip}
              onAddExpenseForTrip={(tripId) => {
                setInitialExpenseTripId(tripId);
                setActiveTab('finance');
                setFinanceSubTab('expenses');
              }}
              onPrintDocument={openDocumentPrint}
            />
          )}

          {/* Fleet Screen (Trucks, Drivers & Maintenance Tabs) */}
          {activeTab === 'fleet' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-white border-b border-slate-200 px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFleetSubTab('trucks')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                    fleetSubTab === 'trucks'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <TruckIcon className="w-3.5 h-3.5" />
                  <span>Trucks ({trucks.length})</span>
                </button>
                <button
                  onClick={() => setFleetSubTab('drivers')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                    fleetSubTab === 'drivers'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Drivers ({drivers.length})</span>
                </button>
                <button
                  onClick={() => setFleetSubTab('maintenance')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                    fleetSubTab === 'maintenance'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Maintenance ({maintenanceRecords.length})</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {fleetSubTab === 'trucks' && (
                  <TrucksView
                    trucks={trucks}
                    trips={trips}
                    expenses={expenses}
                    company={company}
                    onSaveTruck={handleSaveTruck}
                    onDeleteTruck={handleDeleteTruck}
                  />
                )}
                {fleetSubTab === 'drivers' && (
                  <DriversView
                    drivers={drivers}
                    trucks={trucks}
                    trips={trips}
                    company={company}
                    onSaveDriver={handleSaveDriver}
                    onDeleteDriver={handleDeleteDriver}
                  />
                )}
                {fleetSubTab === 'maintenance' && (
                  <MaintenanceView
                    maintenanceRecords={maintenanceRecords}
                    trucks={trucks}
                    suppliers={suppliers}
                    currency={company.currency}
                    onSaveRecord={handleSaveMaintenanceRecord}
                    onDeleteRecord={handleDeleteMaintenanceRecord}
                  />
                )}
              </div>
            </div>
          )}

          {/* Finance Screen (Expenses, Fuel, Customers, Suppliers & Payroll Tabs) */}
          {activeTab === 'finance' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Financial Sub Navigation Ribbon */}
              <div className="bg-white border-b border-slate-200 px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => {
                    setFinanceSubTab('expenses');
                    setInitialExpenseTripId(undefined);
                  }}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                    financeSubTab === 'expenses'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Expenses</span>
                </button>

                <button
                  onClick={() => {
                    setFinanceSubTab('fuel');
                    setInitialExpenseTripId(undefined);
                  }}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                    financeSubTab === 'fuel'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Fuel className="w-3.5 h-3.5" />
                  <span>Fuel Logs</span>
                </button>

                <button
                  onClick={() => {
                    setFinanceSubTab('customers');
                    setInitialExpenseTripId(undefined);
                  }}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                    financeSubTab === 'customers'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Customers</span>
                </button>

                <button
                  onClick={() => {
                    setFinanceSubTab('suppliers');
                    setInitialExpenseTripId(undefined);
                  }}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                    financeSubTab === 'suppliers'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Suppliers</span>
                </button>

                <button
                  onClick={() => {
                    setFinanceSubTab('payroll');
                    setInitialExpenseTripId(undefined);
                  }}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                    financeSubTab === 'payroll'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Driver Payroll</span>
                </button>
              </div>

              {/* Body Content for Active Subtab */}
              <div className="flex-1 overflow-y-auto p-3">
                {financeSubTab === 'expenses' && (
                  <ExpensesView
                    expenses={expenses}
                    trucks={trucks}
                    drivers={drivers}
                    trips={trips}
                    company={company}
                    onSaveExpense={handleSaveExpense}
                    onDeleteExpense={handleDeleteExpense}
                    initialTripId={initialExpenseTripId}
                  />
                )}

                {financeSubTab === 'fuel' && (
                  <FuelView
                    fuelEntries={fuelEntries}
                    trucks={trucks}
                    drivers={drivers}
                    suppliers={suppliers}
                    trips={trips}
                    currency={company.currency}
                    onSaveFuelEntry={handleSaveFuelEntry}
                    onDeleteFuelEntry={handleDeleteFuelEntry}
                  />
                )}

                {financeSubTab === 'customers' && (
                  <CustomersView
                    customers={customers}
                    transactions={transactions}
                    trips={trips}
                    company={company}
                    onSaveCustomer={handleSaveCustomer}
                    onAddTransaction={handleAddTransaction}
                    onPrintDocument={openDocumentPrint}
                  />
                )}

                {financeSubTab === 'suppliers' && (
                  <SuppliersView
                    suppliers={suppliers}
                    transactions={supplierTransactions}
                    trucks={trucks}
                    trips={trips}
                    currency={company.currency}
                    onSaveSupplier={handleSaveSupplier}
                    onDeleteSupplier={handleDeleteSupplier}
                    onAddTransaction={handleAddSupplierTransaction}
                    onDeleteTransaction={handleDeleteSupplierTransaction}
                    onPrintDocument={openDocumentPrint}
                  />
                )}

                {financeSubTab === 'payroll' && (
                  <PayrollView
                    drivers={drivers}
                    trips={trips}
                    expenses={expenses}
                    settlements={settlements}
                    currency={company.currency}
                    onSaveSettlement={handleSaveSettlement}
                    onPrintDocument={openDocumentPrint}
                  />
                )}
              </div>
            </div>
          )}

          {/* Settings & Database Screen */}
          {activeTab === 'more' && (
            <SettingsView
              company={company}
              onUpdateCompany={handleUpdateCompany}
              onResetDatabase={handleResetDatabase}
              onOpenCodeViewer={() => setIsCodeView(true)}
            />
          )}

          {/* Persistent Material 3 Bottom Navigation */}
          <BottomNavBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsCodeView(false);
            }}
            activeTripsCount={activeTripsCount}
          />

          {/* Print / PDF Document Modal */}
          <PrintDocumentModal
            isOpen={printableModal.isOpen}
            docType={printableModal.docType}
            data={printableModal.data}
            currency={company.currency}
            onClose={() => setPrintableModal({ ...printableModal, isOpen: false })}
          />
        </>
      )}
    </MobileFrame>
  );
}
