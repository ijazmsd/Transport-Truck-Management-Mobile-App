import React, { useState, useEffect, useCallback } from 'react';
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
  AuthSession,
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
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { CompanySetupView } from './components/CompanySetupView';
import { SubscriptionExpiredView } from './components/SubscriptionExpiredView';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { DriverDashboardView } from './components/DriverDashboardView';
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
  LogOut,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

export type AppRoute =
  | 'login'
  | 'register'
  | 'plans'
  | 'company-setup'
  | 'subscription-expired'
  | 'driver-dashboard'
  | 'app';

export default function App() {
  // Navigation & Route States
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [fleetSubTab, setFleetSubTab] = useState<'trucks' | 'drivers' | 'maintenance'>('trucks');
  const [financeSubTab, setFinanceSubTab] = useState<
    'expenses' | 'fuel' | 'customers' | 'suppliers' | 'payroll'
  >('expenses');
  const [isCodeView, setIsCodeView] = useState<boolean>(false);
  const [initialExpenseTripId, setInitialExpenseTripId] = useState<string | undefined>(undefined);

  // Authentication State
  const [session, setSession] = useState<AuthSession | null>(() => db.getSession());
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);
  const [loginWarningMsg, setLoginWarningMsg] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

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

  // Core Data States loaded from DB
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
  const refreshState = useCallback(() => {
    const currentSession = db.getSession();
    setSession(currentSession);
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
  }, []);

  // Determine route based on session and user status
  const evaluateRoute = useCallback((currentSession: AuthSession | null) => {
    if (!currentSession || !currentSession.user) {
      setCurrentRoute('login');
      return;
    }

    const user = currentSession.user;

    // Provider Admin bypasses tenant subscription checks
    if (user.role === 'Provider Admin') {
      setCurrentRoute('app');
      setActiveTab('dashboard');
      return;
    }

    // Check account status
    if (user.status === 'Suspended' || user.status === 'Disabled' || user.status === 'Pending Approval') {
      setCurrentRoute('app');
      return;
    }

    // Check Driver role
    if (user.role === 'Driver') {
      // Drivers also require active company subscription
      const sub = db.getActiveSubscription();
      if (sub && sub.status === 'Expired') {
        setCurrentRoute('subscription-expired');
        return;
      }
      setCurrentRoute('driver-dashboard');
      return;
    }

    // Company Admin, Manager, Accountant checks:
    const sub = db.getActiveSubscription();
    const comp = db.getCompany();

    if (!sub) {
      setCurrentRoute('plans');
      return;
    }

    if (sub.status === 'Expired') {
      setCurrentRoute('subscription-expired');
      return;
    }

    if (comp.onboardingCompleted === false) {
      setCurrentRoute('company-setup');
      return;
    }

    // Default to main application dashboard
    setCurrentRoute('app');
    setActiveTab('dashboard');
  }, []);

  // Check subscription alerts and validate session on initial mount
  useEffect(() => {
    db.checkSubscriptionAlerts();
    refreshState();

    const activeSession = db.getSession();
    evaluateRoute(activeSession);

    const timer = setTimeout(() => {
      setIsCheckingSession(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [evaluateRoute, refreshState]);

  // Auth Handler: Login
  const handleLogin = async (email: string, pass: string, rememberMe: boolean) => {
    try {
      const result = db.login(email, pass, rememberMe);
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Invalid email or password.',
        };
      }
      refreshState();
      setLoginSuccessMsg(null);
      setLoginWarningMsg(null);
      evaluateRoute(result.session || db.getSession());
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Invalid email or password.',
      };
    }
  };

  // Auth Handler: Register Client
  const handleRegisterClient = async (payload: {
    userName: string;
    userEmail: string;
    userPhone: string;
    companyName: string;
    password: string;
    city: string;
    address?: string;
    planId?: SubscriptionPlanId;
    paymentMethod?: PaymentMethod;
  }) => {
    try {
      const result = db.registerClient(payload);
      refreshState();
      return {
        success: true,
        message: `Registration successful! Your company ${result.company.name} has been registered. Please login to continue.`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Registration failed. An account with this email may already exist.',
      };
    }
  };

  // Auth Handler: Logout
  const handleConfirmLogout = () => {
    db.logout();
    refreshState();
    setIsLogoutModalOpen(false);
    setLoginSuccessMsg(null);
    setLoginWarningMsg('You have been logged out securely.');
    setCurrentRoute('login');
  };

  // Company Setup Completion
  const handleCompleteCompanySetup = (data: {
    name: string;
    phone: string;
    email: string;
    taxId: string;
    bankDetails: string;
    currency: any;
    defaultOrigin: string;
    defaultDestination: string;
    notes?: string;
  }) => {
    db.completeCompanySetup(data);
    refreshState();
    setCurrentRoute('app');
    setActiveTab('dashboard');
  };

  // Plan Selection Handler
  const handleSelectPlan = (
    planId: SubscriptionPlanId,
    durationMonths: number,
    pricePaid: number,
    paymentMethod: PaymentMethod
  ) => {
    db.createSubscription(planId, durationMonths, pricePaid, paymentMethod);
    refreshState();
    setIsSubscriptionOpen(false);

    // If currently on plans screen, transition to company setup or app
    const comp = db.getCompany();
    if (comp.onboardingCompleted === false) {
      setCurrentRoute('company-setup');
    } else {
      setCurrentRoute('app');
    }
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
    db.loginAsUser(user.id);
    refreshState();
    const activeSess = db.getSession();
    evaluateRoute(activeSess);
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
      message: `${user.name} requested to join ${company.name} as a ${user.role}. Phone: ${user.phone}.`,
      type: 'registration',
      category: 'user',
      targetRole: 'Admin',
      relatedId: user.id,
      severity: 'warning',
    });

    refreshState();
  };

  const handleRenewCurrentSubscription = (subId: string, durationMonths: number) => {
    db.renewSubscription(subId, durationMonths);
    refreshState();
    setCurrentRoute('app');
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

  // SaaS Tenant Switcher (Super Admin or Testing)
  const handleSwitchTenant = (tenantId: string) => {
    db.setActiveTenantId(tenantId);
    const tenantUsers = db.getUsers().filter((u) => u.tenantId === tenantId);
    if (tenantUsers.length > 0) {
      db.loginAsUser(tenantUsers[0].id);
    }
    refreshState();
    const activeSess = db.getSession();
    evaluateRoute(activeSess);
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

  // Account Status Gate: If user is Pending Approval or Suspended or Rejected
  const isAccountRestricted =
    currentUser.status === 'Pending Approval' ||
    currentUser.status === 'Rejected' ||
    currentUser.status === 'Suspended' ||
    currentUser.status === 'Disabled';

  // 1. Initial Session Checking Splash Screen
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20 border border-blue-400/30 animate-pulse">
          <TruckIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-extrabold text-white">TruckBook</h2>
        <p className="text-xs text-slate-400 mt-1">Checking your session...</p>
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-blue-400 font-medium">
          <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <span>Verifying multi-tenant credentials...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated / Login View
  if (currentRoute === 'login') {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentRoute('register')}
          onNavigateToPlans={() => setIsSubscriptionOpen(true)}
          initialSuccessMessage={loginSuccessMsg}
          initialWarningMessage={loginWarningMsg}
        />
        {/* Subscription Modal can be viewed from login for plans */}
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
      </>
    );
  }

  // 3. Client Registration View
  if (currentRoute === 'register') {
    return (
      <RegisterView
        plans={subscriptionPlans}
        onRegisterClient={handleRegisterClient}
        onNavigateToLogin={(successMsg) => {
          setLoginSuccessMsg(
            successMsg || 'Account created successfully. Please login with your email and password.'
          );
          setLoginWarningMsg(null);
          setCurrentRoute('login');
        }}
      />
    );
  }

  // 4. Plans / Subscription Gate View (For new registered clients with no active subscription)
  if (currentRoute === 'plans') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 shadow-xl shadow-amber-500/20 mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Choose Your Subscription Plan</h1>
          <p className="mt-1 text-xs text-slate-300">
            Welcome, <strong className="text-white">{currentUser.name}</strong>! Select a subscription plan for{' '}
            <strong className="text-white">{company.name}</strong> to unlock your fleet dispatch portal.
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-slate-800/90 border rounded-3xl p-5 flex flex-col justify-between shadow-xl backdrop-blur-md relative overflow-hidden ${
                  plan.isPopular ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-700/80'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}

                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-2 mb-1">
                    Rs. {plan.price.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mb-4">
                    Billed every {plan.durationMonths} month(s)
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() =>
                    handleSelectPlan(plan.id, plan.durationMonths, plan.price, 'Bank Transfer')
                  }
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                    plan.isPopular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <span>Select & Activate Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center justify-center gap-1.5 mx-auto transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out of {currentUser.email}</span>
            </button>
          </div>
        </div>

        <LogoutConfirmModal
          isOpen={isLogoutModalOpen}
          user={currentUser}
          company={company}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      </div>
    );
  }

  // 5. Company Setup View (If client subscribed but haven't completed company setup)
  if (currentRoute === 'company-setup') {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <CompanySetupView
          company={company}
          currentUser={currentUser}
          onCompleteSetup={handleCompleteCompanySetup}
          onRequestLogout={() => setIsLogoutModalOpen(true)}
        />
        <LogoutConfirmModal
          isOpen={isLogoutModalOpen}
          user={currentUser}
          company={company}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      </div>
    );
  }

  // 6. Subscription Expired View (For clients/drivers whose company subscription is expired)
  if (currentRoute === 'subscription-expired') {
    return (
      <>
        <SubscriptionExpiredView
          company={company}
          activeSubscription={activeSubscription}
          currentUser={currentUser}
          onOpenRenewModal={() => setIsSubscriptionOpen(true)}
          onRequestLogout={() => setIsLogoutModalOpen(true)}
        />
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
        <LogoutConfirmModal
          isOpen={isLogoutModalOpen}
          user={currentUser}
          company={company}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      </>
    );
  }

  // 7. Driver Dedicated Dashboard View
  if (currentRoute === 'driver-dashboard') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md h-screen sm:h-[92vh] max-h-[920px] bg-slate-900 rounded-none sm:rounded-[36px] shadow-2xl border-0 sm:border-8 border-slate-950 flex flex-col overflow-hidden relative">
          <DriverDashboardView
            currentUser={currentUser}
            company={company}
            trips={trips}
            fuelEntries={fuelEntries}
            expenses={expenses}
            salarySettlements={settlements}
            onRequestLogout={() => setIsLogoutModalOpen(true)}
            onAddFuelEntry={() => {
              setActiveTab('finance');
              setFinanceSubTab('fuel');
              setCurrentRoute('app');
            }}
            onAddExpense={() => setIsDriverExpenseOpen(true)}
          />

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

          <LogoutConfirmModal
            isOpen={isLogoutModalOpen}
            user={currentUser}
            company={company}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleConfirmLogout}
          />
        </div>
      </div>
    );
  }

  // 8. Main Application (Company Admin / Manager / Accountant / Provider Admin)
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
      onRequestLogout={() => setIsLogoutModalOpen(true)}
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
              : currentUser.status === 'Suspended'
              ? 'Your account has been suspended. Please contact fleet operations support.'
              : 'Your account access is disabled. Please contact operations dispatch.'}
          </p>

          <div className="w-full max-w-xs space-y-2 mt-6">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out / Switch Account</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Subscription Expired Warning Banner */}
          {activeSubscription &&
            activeSubscription.status === 'Expired' &&
            currentUser.role !== 'Provider Admin' && (
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
              onRequestLogout={() => setIsLogoutModalOpen(true)}
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

          {/* Logout Confirmation Modal */}
          <LogoutConfirmModal
            isOpen={isLogoutModalOpen}
            user={currentUser}
            company={company}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleConfirmLogout}
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
            onCompleteRegistration={(data) => {
              handleRegisterClient({
                ...data,
                password: 'password123',
              });
              setIsClientRegistrationOpen(false);
            }}
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

