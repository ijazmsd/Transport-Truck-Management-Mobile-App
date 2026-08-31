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
  User,
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionStatus,
  UserStatus,
  PaymentMethod,
  PaymentRecord,
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
import { NotificationModal } from './components/NotificationModal';
import { UserManagementModal } from './components/UserManagementModal';
import { UserRegistrationModal } from './components/UserRegistrationModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DriverExpenseModal } from './components/DriverExpenseModal';
import { ClientRegistrationModal } from './components/ClientRegistrationModal';
import { ProviderAdminView } from './components/ProviderAdminView';
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
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldAlert,
  LogIn,
  UserCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [fleetSubTab, setFleetSubTab] = useState<'trucks' | 'drivers' | 'maintenance'>('trucks');
  const [financeSubTab, setFinanceSubTab] = useState<
    'expenses' | 'fuel' | 'customers' | 'suppliers' | 'payroll'
  >('expenses');
  const [isCodeView, setIsCodeView] = useState<boolean>(false);
  const [initialExpenseTripId, setInitialExpenseTripId] = useState<string | undefined>(undefined);

  // Modals state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isClientRegistrationOpen, setIsClientRegistrationOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isDriverExpenseOpen, setIsDriverExpenseOpen] = useState(false);

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

  // Core Data States loaded from Local Storage / SQLite engine
  const [company, setCompany] = useState<Company>(() => db.getCompany());
  const [companies, setCompanies] = useState<Company[]>(() => db.getCompanies());
  const [activeTenantId, setActiveTenantId] = useState<string>(() => db.getActiveTenantId());
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
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());
  const [activeSubscription, setActiveSubscription] = useState<Subscription | undefined>(() =>
    db.getActiveSubscription()
  );
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() =>
    db.getSubscriptionPlans()
  );
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>(() =>
    db.getSubscriptions()
  );
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>(() =>
    db.getPayments()
  );

  // Sync state from DB
  const refreshState = () => {
    setCompany(db.getCompany());
    setCompanies(db.getCompanies());
    setActiveTenantId(db.getActiveTenantId());
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
    setUsers(db.getUsers());
    setCurrentUser(db.getCurrentUser());
    setActiveSubscription(db.getActiveSubscription());
    setSubscriptionPlans(db.getSubscriptionPlans());
    setAllSubscriptions(db.getSubscriptions());
    setAllPayments(db.getPayments());
  };

  // Check subscription alerts periodically
  useEffect(() => {
    db.checkSubscriptionAlerts();
    setNotifications(db.getNotifications());
  }, []);

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

  // Expense Approval Workflow Handlers
  const handleApproveExpense = (expenseId: string) => {
    db.approveExpense(expenseId, `${currentUser.name} (${currentUser.role})`);
    refreshState();
  };

  const handleRejectExpense = (expenseId: string, reason: string) => {
    db.rejectExpense(expenseId, reason, `${currentUser.name} (${currentUser.role})`);
    refreshState();
  };

  // User & RBAC Management Handlers
  const handleSelectUser = (user: User) => {
    db.setCurrentUserId(user.id);
    setCurrentUser(user);
    refreshState();
  };

  const handleApproveUser = (userId: string) => {
    db.approveUser(userId, `${currentUser.name} (${currentUser.role})`);
    refreshState();
  };

  const handleRejectUser = (userId: string, reason: string) => {
    db.rejectUser(userId, reason, `${currentUser.name} (${currentUser.role})`);
    refreshState();
  };

  const handleToggleUserStatus = (userId: string, status: UserStatus) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      db.saveUser({ ...user, status, updatedAt: Date.now() });
      refreshState();
    }
  };

  const handleSaveUser = (user: User) => {
    db.saveUser(user);
    refreshState();
  };

  const handleRegisterUser = (userData: Partial<User>) => {
    const user: User = {
      id: userData.id || `usr_${Date.now()}`,
      name: userData.name || 'New Driver',
      phone: userData.phone || '+92 300 0000000',
      email: userData.email,
      role: userData.role || 'Driver',
      status: 'Pending Approval',
      notes: userData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    db.saveUser(user);

    // Notify Admin
    db.addNotification({
      title: 'New Registration Request',
      message: `${user.name} requested to join Al-Madina Transport as a ${user.role}. Phone: ${user.phone}.`,
      type: 'registration',
      category: 'user',
      targetRole: 'Admin',
      relatedId: user.id,
      severity: 'warning',
    });

    refreshState();
  };

  // Subscription Management Handlers
  const handleSelectPlan = (
    planId: SubscriptionPlanId,
    durationMonths: number,
    pricePaid: number,
    paymentMethod: PaymentMethod
  ) => {
    db.createSubscription(planId, durationMonths, pricePaid, paymentMethod);
    refreshState();
  };

  const handleRenewCurrentSubscription = (subId: string, durationMonths: number) => {
    db.renewSubscription(subId, durationMonths);
    refreshState();
  };

  const handleSimulateSubscriptionStatus = (status: SubscriptionStatus, daysLeft: number) => {
    const sub = db.getActiveSubscription();
    if (sub) {
      const expDate = new Date(Date.now() + daysLeft * 86400000).toISOString().split('T')[0];
      const updatedSub: Subscription = {
        ...sub,
        status,
        expiryDate: expDate,
        updatedAt: Date.now(),
      };
      db.saveSubscription(updatedSub);
      db.checkSubscriptionAlerts();
      refreshState();
    }
  };

  // SaaS Multi-Tenant Handlers
  const handleRegisterClient = (data: {
    userName: string;
    userEmail: string;
    userPhone: string;
    companyName: string;
    city: string;
    address: string;
    planId: SubscriptionPlanId;
    paymentMethod: PaymentMethod;
  }) => {
    const result = db.registerClient(data);
    setIsClientRegistrationOpen(false);
    // Auto switch to the newly registered client admin
    db.setActiveTenantId(result.company.id);
    db.setCurrentUserId(result.user.id);
    refreshState();
  };

  const handleSwitchTenant = (tenantId: string) => {
    db.setActiveTenantId(tenantId);
    // Switch to first user in that tenant
    const tenantUsers = db.getUsers().filter((u) => u.tenantId === tenantId);
    if (tenantUsers.length > 0) {
      db.setCurrentUserId(tenantUsers[0].id);
    }
    refreshState();
  };

  const handleUpdatePlan = (updatedPlan: SubscriptionPlan) => {
    db.saveSubscriptionPlan(updatedPlan);
    refreshState();
  };

  const handleToggleCompanyStatus = (companyId: string) => {
    const comp = companies.find((c) => c.id === companyId);
    if (comp) {
      const updated: Company = {
        ...comp,
        isSaaSActive: comp.isSaaSActive === false ? true : false,
        updatedAt: Date.now(),
      };
      db.saveCompany(updated);
      refreshState();
    }
  };

  // Notification Handlers
  const handleMarkNotificationRead = (id: string) => {
    db.markNotificationRead(id);
    refreshState();
  };

  const handleMarkAllNotificationsRead = () => {
    db.markAllNotificationsRead();
    refreshState();
  };

  const handleDeleteNotification = (id: string) => {
    db.deleteNotification(id);
    refreshState();
  };

  const handleNotificationAction = (notification: AppNotification) => {
    setIsNotificationOpen(false);
    if (notification.category === 'expense' || notification.type === 'expense') {
      setActiveTab('finance');
      setFinanceSubTab('expenses');
    } else if (notification.category === 'user' || notification.type === 'registration') {
      setIsUserManagementOpen(true);
    } else if (notification.category === 'subscription' || notification.type === 'subscription') {
      setIsSubscriptionOpen(true);
    } else if (notification.category === 'document') {
      setActiveTab('fleet');
      setFleetSubTab('trucks');
    }
  };

  // Supplier & Fuel Handlers
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

  const unreadNotificationsCount = notifications.filter((n) => {
    if (n.isRead) return false;
    if (!n.targetRole || n.targetRole === 'all') return true;
    return n.targetRole === currentUser.role;
  }).length;

  // Account Status Gate: If user is Pending Approval or Rejected
  const isAccountRestricted = currentUser.status === 'Pending Approval' || currentUser.status === 'Rejected';

  return (
    <MobileFrame
      activeTab={activeTab}
      isCodeView={isCodeView}
      onToggleCodeView={() => setIsCodeView(!isCodeView)}
      unreadNotificationsCount={unreadNotificationsCount}
      onOpenNotifications={() => setIsNotificationOpen(true)}
      currentUser={currentUser}
      allUsers={users}
      onSelectUser={handleSelectUser}
      onOpenUserManagement={() => setIsUserManagementOpen(true)}
      onOpenRegistration={() => setIsRegistrationOpen(true)}
      companies={companies}
      activeTenantId={activeTenantId}
      onSwitchTenant={handleSwitchTenant}
      onOpenClientRegistration={() => setIsClientRegistrationOpen(true)}
      currentCompany={company}
    >
      {isCodeView ? (
        <FlutterCodeViewer />
      ) : isAccountRestricted ? (
        /* Account Restricted / Pending State Screen */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-100 text-slate-900 overflow-y-auto">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-sm ${
              currentUser.status === 'Pending Approval'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-rose-100 text-rose-600'
            }`}
          >
            {currentUser.status === 'Pending Approval' ? (
              <Clock className="w-8 h-8" />
            ) : (
              <ShieldAlert className="w-8 h-8" />
            )}
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
              currentUser.status === 'Pending Approval'
                ? 'bg-amber-200 text-amber-900'
                : 'bg-rose-200 text-rose-900'
            }`}
          >
            Account {currentUser.status}
          </span>

          <h2 className="text-lg font-extrabold text-slate-900">{currentUser.name}</h2>
          <p className="text-xs text-slate-600 max-w-xs mt-1.5 leading-relaxed">
            {currentUser.status === 'Pending Approval'
              ? 'Your account request is currently awaiting Administrator review. Access to trip logs, bilty invoices, and payroll will be enabled once approved.'
              : 'Your account access has been declined by the Fleet Admin. Please contact operations dispatch.'}
          </p>

          <div className="w-full max-w-xs space-y-2 mt-6">
            <button
              onClick={() => {
                // Switch back to Admin to review or continue testing
                const adminUser = users.find((u) => u.role === 'Admin' || u.role === 'Company Admin') || users[0];
                handleSelectUser(adminUser);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Switch Back to Admin</span>
            </button>

            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              Submit New Registration
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Subscription Expired Warning Banner (if applicable) */}
          {activeSubscription && activeSubscription.status === 'Expired' && currentUser.role !== 'Provider Admin' && (
            <div className="bg-rose-600 text-white px-3.5 py-2 flex items-center justify-between text-xs shadow-md shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                <span className="truncate font-semibold">
                  Subscription Expired! Renew to keep fleet sync active.
                </span>
              </div>
              <button
                onClick={() => setIsSubscriptionOpen(true)}
                className="px-2.5 py-0.5 bg-white text-rose-700 font-bold rounded-lg text-[11px] shrink-0 hover:bg-rose-50 transition shadow-xs"
              >
                Renew Now
              </button>
            </div>
          )}

          {/* Main Dashboard / Provider Admin Screen */}
          {activeTab === 'dashboard' && currentUser.role === 'Provider Admin' && (
            <ProviderAdminView
              companies={companies}
              activeTenantId={activeTenantId}
              onSwitchTenant={handleSwitchTenant}
              onOpenRegisterClient={() => setIsClientRegistrationOpen(true)}
              allSubscriptions={allSubscriptions}
              allPayments={allPayments}
              plans={subscriptionPlans}
              onUpdatePlan={handleUpdatePlan}
              onToggleCompanyStatus={handleToggleCompanyStatus}
              allUsers={users}
              allTrucksCount={trucks.length}
              allDriversCount={drivers.length}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role !== 'Provider Admin' && (
            <DashboardView
              company={company}
              trucks={trucks}
              drivers={drivers}
              customers={customers}
              trips={trips}
              expenses={expenses}
              notifications={notifications}
              currentUser={currentUser}
              activeSubscription={activeSubscription}
              allUsers={users}
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
                setIsDriverExpenseOpen(true);
              }}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
              onOpenUserManagement={() => setIsUserManagementOpen(true)}
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
                setIsDriverExpenseOpen(true);
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
                    currentUser={currentUser}
                    onSaveExpense={handleSaveExpense}
                    onDeleteExpense={handleDeleteExpense}
                    onApproveExpense={handleApproveExpense}
                    onRejectExpense={handleRejectExpense}
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
              currentUser={currentUser}
              activeSubscription={activeSubscription}
              onUpdateCompany={handleUpdateCompany}
              onResetDatabase={handleResetDatabase}
              onOpenCodeViewer={() => setIsCodeView(true)}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
              onOpenUserManagement={() => setIsUserManagementOpen(true)}
              onOpenNotifications={() => setIsNotificationOpen(true)}
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

          {/* Notification Modal Drawer */}
          <NotificationModal
            isOpen={isNotificationOpen}
            notifications={notifications}
            currentRole={currentUser.role}
            onClose={() => setIsNotificationOpen(false)}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onDeleteNotification={handleDeleteNotification}
            onActionClick={handleNotificationAction}
          />

          {/* User Management & RBAC Modal */}
          <UserManagementModal
            isOpen={isUserManagementOpen}
            users={users}
            currentUser={currentUser}
            trucks={trucks}
            onClose={() => setIsUserManagementOpen(false)}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onToggleStatus={handleToggleUserStatus}
            onSaveUser={handleSaveUser}
            onDeleteUser={(id) => {
              db.deleteUser(id);
              refreshState();
            }}
            onSwitchUser={(user) => {
              handleSelectUser(user);
              setIsUserManagementOpen(false);
            }}
          />

          {/* User Registration Request Modal */}
          <UserRegistrationModal
            isOpen={isRegistrationOpen}
            trucks={trucks}
            onClose={() => setIsRegistrationOpen(false)}
            onSubmit={handleRegisterUser}
          />

          {/* Subscription & Billing Modal */}
          <SubscriptionModal
            isOpen={isSubscriptionOpen}
            activeSubscription={activeSubscription}
            plans={subscriptionPlans}
            company={company}
            onClose={() => setIsSubscriptionOpen(false)}
            onSelectPlan={handleSelectPlan}
            onRenewCurrent={handleRenewCurrentSubscription}
            onSimulateStatus={handleSimulateSubscriptionStatus}
          />

          {/* Driver Expense & Fuel Submission Modal */}
          <DriverExpenseModal
            isOpen={isDriverExpenseOpen}
            currentUser={currentUser}
            trips={trips}
            trucks={trucks}
            initialTripId={initialExpenseTripId}
            onClose={() => {
              setIsDriverExpenseOpen(false);
              setInitialExpenseTripId(undefined);
            }}
            onSubmitExpense={(exp) => handleSaveExpense(exp as Expense)}
          />

          {/* SaaS Client Onboarding & Registration Wizard */}
          <ClientRegistrationModal
            isOpen={isClientRegistrationOpen}
            plans={subscriptionPlans}
            onClose={() => setIsClientRegistrationOpen(false)}
            onCompleteRegistration={handleRegisterClient}
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
