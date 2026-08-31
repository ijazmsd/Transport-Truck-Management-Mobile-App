import {
  Company,
  Truck,
  Driver,
  Customer,
  Trip,
  Expense,
  CustomerTransaction,
  AppNotification,
  Currency,
  Supplier,
  SupplierTransaction,
  FuelEntry,
  MaintenanceRecord,
  DriverSalarySettlement,
  User,
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanId,
  UserStatus,
  UserRole,
  NotificationCategory,
  PaymentRecord,
  PaymentMethod,
  AuthSession,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_COMPANY,
  INITIAL_TRUCKS,
  INITIAL_DRIVERS,
  INITIAL_CUSTOMERS,
  INITIAL_TRIPS,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIER_TRANSACTIONS,
  INITIAL_FUEL_ENTRIES,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_SALARY_SETTLEMENTS,
  INITIAL_USERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_PAYMENTS,
} from './mockData';

const STORAGE_KEYS = {
  COMPANIES: 'truckbook_companies_saas_v3',
  COMPANY: 'truckbook_company_saas_v3',
  TRUCKS: 'truckbook_trucks_saas_v3',
  DRIVERS: 'truckbook_drivers_saas_v3',
  CUSTOMERS: 'truckbook_customers_saas_v3',
  TRIPS: 'truckbook_trips_saas_v3',
  EXPENSES: 'truckbook_expenses_saas_v3',
  TRANSACTIONS: 'truckbook_transactions_saas_v3',
  NOTIFICATIONS: 'truckbook_notifications_saas_v3',
  SUPPLIERS: 'truckbook_suppliers_saas_v3',
  SUPPLIER_TX: 'truckbook_supplier_tx_saas_v3',
  FUEL_ENTRIES: 'truckbook_fuel_entries_saas_v3',
  MAINTENANCE: 'truckbook_maintenance_saas_v3',
  SALARY_SETTLEMENTS: 'truckbook_salary_settlements_saas_v3',
  USERS: 'truckbook_users_saas_v3',
  SUBSCRIPTIONS: 'truckbook_subscriptions_saas_v3',
  SUBSCRIPTION_PLANS: 'truckbook_sub_plans_saas_v3',
  PAYMENTS: 'truckbook_payments_saas_v3',
  CURRENT_USER_ID: 'truckbook_current_user_id_saas_v3',
  ACTIVE_TENANT_ID: 'truckbook_active_tenant_id_saas_v3',
  AUTH_SESSION: 'truckbook_auth_session_saas_v3',
};

class LocalDatabaseManager {
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  // ==========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================
  getSession(): AuthSession | null {
    const session = this.getStorage<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
    if (!session) return null;

    // Check session expiry
    if (Date.now() > session.expiresAt) {
      this.logout();
      return null;
    }

    // Verify user exists and is active
    const user = this.getUserById(session.userId);
    if (!user || user.status === 'Rejected' || user.status === 'Suspended' || user.status === 'Deactivated') {
      this.logout();
      return null;
    }

    return session;
  }

  saveSession(session: AuthSession): void {
    this.setStorage(STORAGE_KEYS.AUTH_SESSION, session);
  }

  login(
    email: string,
    password: string,
    rememberMe = false
  ): {
    success: boolean;
    user?: User;
    session?: AuthSession;
    redirectPath?: string;
    error?: string;
  } {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!normalizedEmail || !cleanPassword) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    const allUsers = this.getAllUsers();
    const user = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Validate password (supports stored password or fallback password123)
    const expectedPassword = user.password || 'password123';
    if (cleanPassword !== expectedPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Check account status
    if (user.status === 'Suspended' || user.status === 'Rejected' || user.status === 'Deactivated') {
      return { success: false, error: 'Your account has been disabled. Please contact support.' };
    }

    if (user.status === 'Pending Approval') {
      return {
        success: false,
        error: 'Your account is pending administrator approval. Please check back shortly.',
      };
    }

    // Generate authenticated session
    const sessionToken = `tb_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const sessionDuration = rememberMe ? 30 * 86400000 : 7 * 86400000;
    const authSession: AuthSession = {
      token: sessionToken,
      userId: user.id,
      tenantId: user.tenantId || user.companyId,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + sessionDuration,
      rememberMe,
    };

    this.saveSession(authSession);
    this.setCurrentUserId(user.id);

    if (user.tenantId) {
      this.setActiveTenantId(user.tenantId);
    }

    const redirectPath = this.getLoginRedirectPath(user);

    return {
      success: true,
      user,
      session: authSession,
      redirectPath,
    };
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TENANT_ID);
    } catch (e) {
      console.error('Failed during logout cleanup', e);
    }
  }

  getLoginRedirectPath(user: User): string {
    if (user.role === 'Provider Admin') {
      return '/provider/dashboard';
    }

    if (user.role === 'Driver') {
      return '/driver-dashboard';
    }

    if (user.role === 'Manager' || user.role === 'Accountant') {
      return '/dashboard';
    }

    // For Company Admin & Fleet Owners, check subscription status & onboarding state
    const tenantId = user.tenantId || user.companyId || this.getActiveTenantId();
    const activeSub = this.getActiveSubscription(tenantId);

    if (!activeSub) {
      return '/plans';
    }

    if (activeSub.status === 'Expired') {
      return '/subscription-expired';
    }

    const company = this.getCompany(tenantId);
    if (
      company &&
      company.onboardingStatus === 'subscribed' &&
      (!company.registrationNumber || company.registrationNumber.trim() === '')
    ) {
      return '/company-setup';
    }

    return '/dashboard';
  }

  // ==========================================
  // TENANT ISOLATION HELPERS
  // ==========================================
  getActiveTenantId(): string {
    const user = this.getCurrentUser();
    if (user && user.role !== 'Provider Admin' && user.tenantId) {
      return user.tenantId;
    }
    const storedTenant = this.getStorage<string | null>(STORAGE_KEYS.ACTIVE_TENANT_ID, null);
    if (storedTenant) return storedTenant;
    if (user?.tenantId) return user.tenantId;
    return 'comp_01';
  }

  setActiveTenantId(tenantId: string): void {
    this.setStorage(STORAGE_KEYS.ACTIVE_TENANT_ID, tenantId);
  }

  // ==========================================
  // MULTI-TENANT COMPANIES & ONBOARDING
  // ==========================================
  getCompanies(): Company[] {
    return this.getStorage<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  }

  getCompany(tenantId?: string): Company {
    const targetTenantId = tenantId || this.getActiveTenantId();
    const companies = this.getCompanies();
    const found = companies.find((c) => c.id === targetTenantId);
    if (found) return found;
    return companies[0] || INITIAL_COMPANY;
  }

  saveCompany(company: Company): void {
    const companies = this.getCompanies();
    const index = companies.findIndex((c) => c.id === company.id);
    if (index >= 0) {
      companies[index] = { ...company, updatedAt: Date.now() };
    } else {
      companies.unshift({ ...company, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.COMPANIES, companies);
    this.setStorage(STORAGE_KEYS.COMPANY, company);
  }

  updateCompany(company: Company): void {
    this.saveCompany(company);
  }

  setCurrency(currency: Currency): void {
    const comp = this.getCompany();
    comp.currency = currency;
    comp.updatedAt = Date.now();
    this.saveCompany(comp);
  }

  // SaaS Client Onboarding & Registration (Without auto-login)
  registerClient(payload: {
    userName: string;
    userEmail: string;
    userPhone: string;
    companyName: string;
    password: string;
    planId?: SubscriptionPlanId;
    paymentMethod?: PaymentMethod;
    city?: string;
    address?: string;
  }): {
    success: boolean;
    user?: User;
    company?: Company;
    subscription?: Subscription;
    message: string;
    error?: string;
  } {
    const normalizedEmail = payload.userEmail.trim().toLowerCase();

    // 1. Validation
    if (!payload.userName.trim()) {
      return { success: false, message: '', error: 'Full name is required.' };
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, message: '', error: 'Please enter a valid email address.' };
    }
    if (!payload.userPhone.trim()) {
      return { success: false, message: '', error: 'Phone number is required.' };
    }
    if (!payload.companyName.trim()) {
      return { success: false, message: '', error: 'Transport company name is required.' };
    }
    if (!payload.password || payload.password.trim().length < 6) {
      return { success: false, message: '', error: 'Password must be at least 6 characters.' };
    }

    // 2. Check for duplicate email across all users
    const allUsers = this.getAllUsers();
    const existing = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return {
        success: false,
        message: '',
        error: 'An account with this email address already exists. Please login or use a different email.',
      };
    }

    const tenantId = `comp_${Date.now()}`;
    const userId = `usr_${Date.now()}`;
    let subId: string | undefined = undefined;
    let newSubscription: Subscription | undefined = undefined;

    // 3. Create Subscription if plan selected
    if (payload.planId) {
      const plans = this.getSubscriptionPlans();
      const selectedPlan = plans.find((p) => p.id === payload.planId) || plans[0];
      subId = `sub_${Date.now()}`;
      const payId = `pay_${Date.now()}`;

      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + selectedPlan.durationMonths);

      newSubscription = {
        id: subId,
        tenantId,
        companyId: tenantId,
        userId,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        durationMonths: selectedPlan.durationMonths,
        startDate: startDate.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        status: 'Active',
        pricePaid: selectedPlan.price,
        paymentMethod: payload.paymentMethod || 'Bank Transfer',
        paymentStatus: 'Completed',
        autoRenew: true,
        maxUsers: selectedPlan.maxUsers,
        maxDrivers: selectedPlan.maxDrivers,
        maxTrucks: selectedPlan.maxTrucks,
        notes: `Initial onboarding subscription for ${selectedPlan.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.saveSubscription(newSubscription);

      // Create Payment Record
      const newPayment: PaymentRecord = {
        id: payId,
        tenantId,
        subscriptionId: subId,
        userId,
        amount: selectedPlan.price,
        currency: 'PKR',
        paymentMethod: payload.paymentMethod || 'Bank Transfer',
        status: 'Success',
        transactionRef: `ONBOARD-${Date.now().toString().slice(-6)}`,
        planName: selectedPlan.name,
        billingCycle: `${selectedPlan.durationMonths} Month(s)`,
        createdAt: Date.now(),
      };
      this.addPayment(newPayment);
    }

    // 4. Create Company
    const newCompany: Company = {
      id: tenantId,
      name: payload.companyName.trim(),
      phone: payload.userPhone.trim(),
      email: normalizedEmail,
      city: payload.city || 'Lahore',
      address: payload.address || 'Main Transport Terminal',
      country: 'Pakistan',
      currency: 'PKR',
      status: 'Active',
      ownerUserId: userId,
      subscriptionId: subId,
      onboardingStatus: subId ? 'subscribed' : 'registered',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.saveCompany(newCompany);

    // 5. Create User (Company Admin) with Password
    const newUser: User = {
      id: userId,
      name: payload.userName.trim(),
      email: normalizedEmail,
      phone: payload.userPhone.trim(),
      password: payload.password.trim(),
      role: 'Company Admin',
      status: 'Active',
      tenantId: tenantId,
      companyId: tenantId,
      notes: `Company Admin and Owner of ${payload.companyName}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.saveUser(newUser);

    // 6. Welcome Notification
    this.addNotification({
      id: `notif_welcome_${Date.now()}`,
      tenantId: tenantId,
      userId: userId,
      title: 'Welcome to TruckBook SaaS!',
      message: `Your transport company "${payload.companyName}" account has been created. Please sign in to configure your fleet.`,
      category: 'subscription',
      type: 'system',
      severity: 'success',
      targetRole: 'Admin',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      createdAt: Date.now(),
    });

    // NOTE: Explicitly DO NOT auto-login. The client will be redirected to /login.
    return {
      success: true,
      user: newUser,
      company: newCompany,
      subscription: newSubscription,
      message: 'Registration successful! Your account has been created. Please login to continue.',
    };
  }

  // Complete Company Setup Profile
  completeCompanySetup(
    tenantId: string,
    details: {
      registrationNumber?: string;
      taxNumber?: string;
      city?: string;
      address?: string;
      phone?: string;
      currency?: Currency;
    }
  ): Company {
    const company = this.getCompany(tenantId);
    const updated: Company = {
      ...company,
      ...details,
      onboardingStatus: 'completed',
      updatedAt: Date.now(),
    };
    this.saveCompany(updated);
    return updated;
  }

  // ==========================================
  // USERS & RBAC (TENANT ISOLATED)
  // ==========================================
  getUsers(tenantId?: string): User[] {
    const allUsers = this.getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const currentUser = this.getCurrentUserRaw();
    
    // If Provider Admin and no specific tenant requested, can view all
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allUsers;
    }

    const targetTenant = tenantId || this.getActiveTenantId();
    return allUsers.filter((u) => {
      if (u.role === 'Provider Admin') return true;
      const userTenant = u.tenantId || u.companyId || 'comp_01';
      return userTenant === targetTenant;
    });
  }

  getAllUsers(): User[] {
    return this.getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getAllUsers().find((u) => u.id === id);
  }

  private getCurrentUserRaw(): User | undefined {
    const currentId = this.getStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_admin');
    return this.getAllUsers().find((u) => u.id === currentId);
  }

  saveUser(user: User): void {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === user.id);
    const tenantId = user.tenantId || user.companyId || this.getActiveTenantId();
    const userToSave: User = {
      ...user,
      tenantId,
      companyId: tenantId,
    };

    if (index >= 0) {
      users[index] = { ...userToSave, updatedAt: Date.now() };
    } else {
      users.unshift({ ...userToSave, createdAt: Date.now(), updatedAt: Date.now() });

      // Notify tenant admins if new pending user
      if (user.status === 'Pending Approval') {
        this.addNotification({
          id: `notif_reg_${Date.now()}`,
          tenantId: tenantId,
          title: 'New User Registration Request',
          message: `${user.name} (${user.role}) requested access to your company fleet. Review in Users & Roles.`,
          category: 'user',
          type: 'registration',
          severity: 'warning',
          targetRole: 'Admin',
          date: new Date().toISOString().split('T')[0],
          isRead: false,
          relatedId: user.id,
          createdAt: Date.now(),
        });
      }
    }
    this.setStorage(STORAGE_KEYS.USERS, users);
  }

  approveUser(userId: string, approvedBy?: string): void {
    const user = this.getUserById(userId);
    if (!user) return;
    user.status = 'Active';
    if (approvedBy) user.notes = (user.notes ? user.notes + '\n' : '') + `Approved by ${approvedBy}`;
    user.updatedAt = Date.now();
    this.saveUser(user);

    this.addNotification({
      id: `notif_appr_${Date.now()}`,
      tenantId: user.tenantId,
      userId: user.id,
      title: 'Account Approved!',
      message: `Your TruckBook account has been approved${approvedBy ? ` by ${approvedBy}` : ''}. You have full operational access.`,
      category: 'user',
      type: 'approval',
      severity: 'success',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      createdAt: Date.now(),
    });
  }

  rejectUser(userId: string, reason?: string, rejectedBy?: string): void {
    const user = this.getUserById(userId);
    if (!user) return;
    user.status = 'Rejected';
    const note = [reason ? `Rejected reason: ${reason}` : 'Rejected', rejectedBy ? `by ${rejectedBy}` : ''].filter(Boolean).join(' ');
    user.notes = (user.notes ? user.notes + '\n' : '') + note;
    user.updatedAt = Date.now();
    this.saveUser(user);

    this.addNotification({
      id: `notif_rej_${Date.now()}`,
      tenantId: user.tenantId,
      userId: user.id,
      title: 'Registration Rejected',
      message: reason ? `Your account request was declined: ${reason}` : `Your account request was declined by the administrator.`,
      category: 'user',
      type: 'rejection',
      severity: 'urgent',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      createdAt: Date.now(),
    });
  }

  toggleUserStatus(userId: string, status: UserStatus): void {
    const user = this.getUserById(userId);
    if (!user) return;
    user.status = status;
    user.updatedAt = Date.now();
    this.saveUser(user);
  }

  deleteUser(userId: string): void {
    const users = this.getAllUsers().filter((u) => u.id !== userId);
    this.setStorage(STORAGE_KEYS.USERS, users);
  }

  getAuthenticatedUser(): User | null {
    const session = this.getSession();
    if (!session) return null;
    const user = this.getUserById(session.userId);
    if (!user || user.status === 'Suspended' || user.status === 'Rejected' || user.status === 'Deactivated') {
      return null;
    }
    return user;
  }

  getCurrentUser(): User | null {
    const authUser = this.getAuthenticatedUser();
    if (authUser) return authUser;
    const currentId = this.getStorage<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
    if (currentId) {
      const user = this.getUserById(currentId);
      if (user) return user;
    }
    return null;
  }

  setCurrentUserId(userId: string): void {
    this.setStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
    const user = this.getUserById(userId);
    if (user?.tenantId) {
      this.setActiveTenantId(user.tenantId);
    }
  }

  // ==========================================
  // SUBSCRIPTION & PLAN QUOTAS (SAAS)
  // ==========================================
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.getStorage<SubscriptionPlan[]>(STORAGE_KEYS.SUBSCRIPTION_PLANS, INITIAL_SUBSCRIPTION_PLANS);
  }

  saveSubscriptionPlan(plan: SubscriptionPlan): void {
    const plans = this.getSubscriptionPlans();
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      plans[index] = { ...plan, updatedAt: Date.now() };
    } else {
      plans.push({ ...plan, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.SUBSCRIPTION_PLANS, plans);
  }

  updateSubscriptionPlanPrice(planId: SubscriptionPlanId, newPrice: number): void {
    const plans = this.getSubscriptionPlans().map((p) => (p.id === planId ? { ...p, price: newPrice, updatedAt: Date.now() } : p));
    this.setStorage(STORAGE_KEYS.SUBSCRIPTION_PLANS, plans);
  }

  getSubscriptions(tenantId?: string): Subscription[] {
    const allSubs = this.getStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    const currentUser = this.getCurrentUserRaw();

    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allSubs;
    }

    const targetTenant = tenantId || this.getActiveTenantId();
    return allSubs.filter((s) => (s.tenantId || s.companyId || 'comp_01') === targetTenant);
  }

  getAllSubscriptions(): Subscription[] {
    return this.getStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  }

  getActiveSubscription(tenantId?: string): Subscription | undefined {
    const subs = this.getSubscriptions(tenantId);
    const active = subs.find((s) => s.status === 'Active' || s.status === 'Expiring Soon');
    if (active) {
      const expTime = new Date(active.expiryDate).getTime();
      const now = Date.now();
      const daysLeft = Math.ceil((expTime - now) / 86400000);
      if (daysLeft <= 0 && active.status !== 'Expired') {
        active.status = 'Expired';
        this.saveSubscription(active);
      } else if (daysLeft <= 7 && active.status === 'Active') {
        active.status = 'Expiring Soon';
        this.saveSubscription(active);
      }
    }
    return active;
  }

  saveSubscription(sub: Subscription): void {
    const subs = this.getAllSubscriptions();
    const index = subs.findIndex((s) => s.id === sub.id);
    const tenantId = sub.tenantId || sub.companyId || this.getActiveTenantId();
    const subToSave = { ...sub, tenantId, companyId: tenantId };

    if (index >= 0) {
      subs[index] = subToSave;
    } else {
      subs.unshift(subToSave);
    }
    this.setStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  }

  createSubscription(
    planId: SubscriptionPlanId,
    durationMonths: number,
    pricePaid?: number,
    paymentMethod: PaymentMethod = 'Bank Transfer',
    userId?: string,
    tenantId?: string
  ): Subscription {
    const targetTenant = tenantId || this.getActiveTenantId();
    const plans = this.getSubscriptionPlans();
    const plan = plans.find((p) => p.id === planId) || plans[0];
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    // Deactivate previous active subscriptions for this tenant
    const allSubs = this.getAllSubscriptions().map((s) => {
      const sTenant = s.tenantId || s.companyId || 'comp_01';
      if (sTenant === targetTenant && (s.status === 'Active' || s.status === 'Expiring Soon')) {
        return { ...s, status: 'Expired' as const };
      }
      return s;
    });

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      tenantId: targetTenant,
      companyId: targetTenant,
      userId: userId || this.getCurrentUser()?.id || 'usr_admin',
      planId,
      planName: plan.name,
      durationMonths,
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: 'Active',
      pricePaid: pricePaid ?? plan.price,
      paymentMethod,
      paymentStatus: 'Completed',
      autoRenew: true,
      maxUsers: plan.maxUsers,
      maxDrivers: plan.maxDrivers,
      maxTrucks: plan.maxTrucks,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    allSubs.unshift(newSub);
    this.setStorage(STORAGE_KEYS.SUBSCRIPTIONS, allSubs);

    // Record payment
    this.addPayment({
      id: `pay_${Date.now()}`,
      tenantId: targetTenant,
      subscriptionId: newSub.id,
      userId: newSub.userId || '',
      amount: newSub.pricePaid || plan.price,
      currency: 'PKR',
      paymentMethod,
      status: 'Success',
      transactionRef: `SUB-${Date.now().toString().slice(-6)}`,
      planName: plan.name,
      billingCycle: `${durationMonths} Month(s)`,
      createdAt: Date.now(),
    });

    // Update company subscription ID
    const comp = this.getCompany(targetTenant);
    comp.subscriptionId = newSub.id;
    this.saveCompany(comp);

    // Send notification
    this.addNotification({
      id: `notif_sub_${Date.now()}`,
      tenantId: targetTenant,
      title: 'Subscription Plan Activated!',
      message: `${plan.name} (${durationMonths} Months) is now active. Quotas: ${plan.maxUsers} Users, ${plan.maxDrivers} Drivers, ${plan.maxTrucks} Trucks.`,
      category: 'subscription',
      type: 'subscription',
      severity: 'success',
      targetRole: 'Admin',
      date: newSub.startDate,
      isRead: false,
      createdAt: Date.now(),
    });

    return newSub;
  }

  renewSubscription(subId: string, durationMonths = 6, paymentMethod: PaymentMethod = 'Bank Transfer'): void {
    const sub = this.getAllSubscriptions().find((s) => s.id === subId);
    if (!sub) return;
    const currExp = new Date(sub.expiryDate);
    const baseDate = currExp.getTime() > Date.now() ? currExp : new Date();
    baseDate.setMonth(baseDate.getMonth() + durationMonths);

    sub.expiryDate = baseDate.toISOString().split('T')[0];
    sub.status = 'Active';
    sub.updatedAt = Date.now();
    this.saveSubscription(sub);

    // Record payment
    this.addPayment({
      id: `pay_renew_${Date.now()}`,
      tenantId: sub.tenantId || 'comp_01',
      subscriptionId: sub.id,
      userId: sub.userId || this.getCurrentUser().id,
      amount: sub.pricePaid || 24000,
      currency: 'PKR',
      paymentMethod,
      status: 'Success',
      transactionRef: `RENEW-${Date.now().toString().slice(-6)}`,
      planName: sub.planName,
      billingCycle: `${durationMonths} Month(s)`,
      createdAt: Date.now(),
    });

    this.addNotification({
      id: `notif_renew_${Date.now()}`,
      tenantId: sub.tenantId,
      title: 'Subscription Successfully Renewed',
      message: `Your fleet subscription for ${sub.planName} has been extended until ${sub.expiryDate}.`,
      category: 'subscription',
      type: 'subscription',
      severity: 'success',
      targetRole: 'Admin',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      createdAt: Date.now(),
    });
  }

  cancelSubscription(subId: string): void {
    const sub = this.getAllSubscriptions().find((s) => s.id === subId);
    if (!sub) return;
    sub.status = 'Suspended';
    sub.updatedAt = Date.now();
    this.saveSubscription(sub);

    this.addNotification({
      id: `notif_canc_${Date.now()}`,
      tenantId: sub.tenantId,
      title: 'Subscription Suspended',
      message: `Fleet subscription #${sub.id} was suspended.`,
      category: 'subscription',
      type: 'subscription',
      severity: 'warning',
      targetRole: 'Admin',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      createdAt: Date.now(),
    });
  }

  // Check Subscription Limits
  canAddUser(tenantId?: string): { allowed: boolean; current: number; max: number; message?: string } {
    const targetTenant = tenantId || this.getActiveTenantId();
    const sub = this.getActiveSubscription(targetTenant);
    const users = this.getUsers(targetTenant);
    const current = users.length;
    const max = sub?.maxUsers || 5;

    if (current >= max) {
      return {
        allowed: false,
        current,
        max,
        message: `User limit reached (${current}/${max}). Please upgrade your plan to add more team members.`,
      };
    }
    return { allowed: true, current, max };
  }

  canAddDriver(tenantId?: string): { allowed: boolean; current: number; max: number; message?: string } {
    const targetTenant = tenantId || this.getActiveTenantId();
    const sub = this.getActiveSubscription(targetTenant);
    const drivers = this.getDrivers(targetTenant);
    const current = drivers.length;
    const max = sub?.maxDrivers || 20;

    if (current >= max) {
      return {
        allowed: false,
        current,
        max,
        message: `Driver limit reached (${current}/${max}). Upgrade your subscription to register additional drivers.`,
      };
    }
    return { allowed: true, current, max };
  }

  canAddTruck(tenantId?: string): { allowed: boolean; current: number; max: number; message?: string } {
    const targetTenant = tenantId || this.getActiveTenantId();
    const sub = this.getActiveSubscription(targetTenant);
    const trucks = this.getTrucks(targetTenant);
    const current = trucks.length;
    const max = sub?.maxTrucks || 20;

    if (current >= max) {
      return {
        allowed: false,
        current,
        max,
        message: `Truck vehicle limit reached (${current}/${max}). Upgrade your plan to manage more fleet vehicles.`,
      };
    }
    return { allowed: true, current, max };
  }

  // ==========================================
  // PAYMENTS & BILLING HISTORY (SAAS)
  // ==========================================
  getPayments(tenantId?: string): PaymentRecord[] {
    const allPayments = this.getStorage<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const currentUser = this.getCurrentUserRaw();

    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allPayments;
    }

    const targetTenant = tenantId || this.getActiveTenantId();
    return allPayments.filter((p) => (p.tenantId || 'comp_01') === targetTenant);
  }

  getAllPayments(): PaymentRecord[] {
    return this.getStorage<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }

  addPayment(payment: PaymentRecord): void {
    const allPayments = this.getAllPayments();
    allPayments.unshift(payment);
    this.setStorage(STORAGE_KEYS.PAYMENTS, allPayments);
  }

  // ==========================================
  // TRUCKS (TENANT ISOLATED)
  // ==========================================
  getTrucks(tenantId?: string): Truck[] {
    const allTrucks = this.getStorage<Truck[]>(STORAGE_KEYS.TRUCKS, INITIAL_TRUCKS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allTrucks;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return allTrucks.filter((t) => (t.tenantId || 'comp_01') === targetTenant);
  }

  getAllTrucks(): Truck[] {
    return this.getStorage<Truck[]>(STORAGE_KEYS.TRUCKS, INITIAL_TRUCKS);
  }

  saveTruck(truck: Truck): void {
    const trucks = this.getAllTrucks();
    const tenantId = truck.tenantId || this.getActiveTenantId();
    const truckToSave = { ...truck, tenantId };
    const index = trucks.findIndex((t) => t.id === truck.id);

    if (index >= 0) {
      trucks[index] = { ...truckToSave, updatedAt: Date.now() };
    } else {
      trucks.unshift({ ...truckToSave, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.TRUCKS, trucks);
  }

  deleteTruck(truckId: string): void {
    const trucks = this.getAllTrucks().filter((t) => t.id !== truckId);
    this.setStorage(STORAGE_KEYS.TRUCKS, trucks);
  }

  // ==========================================
  // DRIVERS (TENANT ISOLATED)
  // ==========================================
  getDrivers(tenantId?: string): Driver[] {
    const allDrivers = this.getStorage<Driver[]>(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allDrivers;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return allDrivers.filter((d) => (d.tenantId || 'comp_01') === targetTenant);
  }

  getAllDrivers(): Driver[] {
    return this.getStorage<Driver[]>(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
  }

  saveDriver(driver: Driver): void {
    const drivers = this.getAllDrivers();
    const tenantId = driver.tenantId || this.getActiveTenantId();
    const driverToSave = { ...driver, tenantId };
    const index = drivers.findIndex((d) => d.id === driver.id);

    if (index >= 0) {
      drivers[index] = { ...driverToSave, updatedAt: Date.now() };
    } else {
      drivers.unshift({ ...driverToSave, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.DRIVERS, drivers);
  }

  deleteDriver(driverId: string): void {
    const drivers = this.getAllDrivers().filter((d) => d.id !== driverId);
    this.setStorage(STORAGE_KEYS.DRIVERS, drivers);
  }

  // ==========================================
  // CUSTOMERS (TENANT ISOLATED)
  // ==========================================
  getCustomers(tenantId?: string): Customer[] {
    const allCustomers = this.getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allCustomers;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return allCustomers.filter((c) => (c.tenantId || 'comp_01') === targetTenant);
  }

  getAllCustomers(): Customer[] {
    return this.getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  saveCustomer(customer: Customer): void {
    const customers = this.getAllCustomers();
    const tenantId = customer.tenantId || this.getActiveTenantId();
    const customerToSave = { ...customer, tenantId };
    const index = customers.findIndex((c) => c.id === customer.id);

    if (index >= 0) {
      customers[index] = { ...customerToSave, updatedAt: Date.now() };
    } else {
      customers.unshift({ ...customerToSave, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  deleteCustomer(customerId: string): void {
    const customers = this.getAllCustomers().filter((c) => c.id !== customerId);
    this.setStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // ==========================================
  // SUPPLIERS (TENANT ISOLATED)
  // ==========================================
  getSuppliers(tenantId?: string): Supplier[] {
    const allSuppliers = this.getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allSuppliers;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return allSuppliers.filter((s) => (s.tenantId || 'comp_01') === targetTenant);
  }

  getAllSuppliers(): Supplier[] {
    return this.getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  saveSupplier(supplier: Supplier): void {
    const suppliers = this.getAllSuppliers();
    const tenantId = supplier.tenantId || this.getActiveTenantId();
    const supplierToSave = { ...supplier, tenantId };
    const index = suppliers.findIndex((s) => s.id === supplier.id);

    if (index >= 0) {
      suppliers[index] = { ...supplierToSave, updatedAt: Date.now() };
    } else {
      suppliers.unshift({ ...supplierToSave, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  deleteSupplier(supplierId: string): void {
    const suppliers = this.getAllSuppliers().filter((s) => s.id !== supplierId);
    this.setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // ==========================================
  // SUPPLIER TRANSACTIONS (TENANT ISOLATED)
  // ==========================================
  getSupplierTransactions(tenantId?: string): SupplierTransaction[] {
    const all = this.getStorage<SupplierTransaction[]>(STORAGE_KEYS.SUPPLIER_TX, INITIAL_SUPPLIER_TRANSACTIONS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return all;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return all.filter((t) => (t.tenantId || 'comp_01') === targetTenant);
  }

  getAllSupplierTransactions(): SupplierTransaction[] {
    return this.getStorage<SupplierTransaction[]>(STORAGE_KEYS.SUPPLIER_TX, INITIAL_SUPPLIER_TRANSACTIONS);
  }

  addSupplierTransaction(tx: SupplierTransaction): void {
    const txs = this.getAllSupplierTransactions();
    const tenantId = tx.tenantId || this.getActiveTenantId();
    txs.unshift({ ...tx, tenantId });
    this.setStorage(STORAGE_KEYS.SUPPLIER_TX, txs);
  }

  deleteSupplierTransaction(id: string): void {
    const txs = this.getAllSupplierTransactions().filter((t) => t.id !== id);
    this.setStorage(STORAGE_KEYS.SUPPLIER_TX, txs);
  }

  // ==========================================
  // FUEL ENTRIES (TENANT ISOLATED)
  // ==========================================
  getFuelEntries(tenantId?: string): FuelEntry[] {
    const all = this.getStorage<FuelEntry[]>(STORAGE_KEYS.FUEL_ENTRIES, INITIAL_FUEL_ENTRIES);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return all;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return all.filter((e) => (e.tenantId || 'comp_01') === targetTenant);
  }

  getAllFuelEntries(): FuelEntry[] {
    return this.getStorage<FuelEntry[]>(STORAGE_KEYS.FUEL_ENTRIES, INITIAL_FUEL_ENTRIES);
  }

  saveFuelEntry(entry: FuelEntry): void {
    const entries = this.getAllFuelEntries();
    const tenantId = entry.tenantId || this.getActiveTenantId();
    const entryToSave = { ...entry, tenantId };
    const index = entries.findIndex((e) => e.id === entry.id);

    if (index >= 0) {
      entries[index] = entryToSave;
    } else {
      entries.unshift(entryToSave);

      // Create linked expense record
      this.saveExpense({
        id: `exp_fuel_${entry.id}`,
        tenantId: tenantId,
        truckId: entry.truckId,
        tripId: entry.tripId,
        driverId: entry.driverId,
        category: 'Fuel',
        amount: entry.totalCost,
        date: entry.fuelDate,
        paymentMethod: entry.paymentMethod,
        status: 'Approved',
        description: `Fuel Log: ${entry.quantityLiters}L @ ${entry.ratePerLiter}/L (Odo: ${entry.odometerReading} km)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      if (entry.supplierId) {
        this.addSupplierTransaction({
          id: `stx_fuel_${Date.now()}`,
          tenantId: tenantId,
          supplierId: entry.supplierId,
          truckId: entry.truckId,
          tripId: entry.tripId,
          type: 'Bill',
          amount: entry.totalCost,
          date: entry.fuelDate,
          description: `Fuel Purchase ${entry.quantityLiters}L @ rate ${entry.ratePerLiter}`,
          paymentMethod: entry.paymentMethod,
          createdAt: Date.now(),
        });
      }

      // Update truck odometer
      const trucks = this.getAllTrucks();
      const trk = trucks.find((t) => t.id === entry.truckId);
      if (trk && entry.odometerReading > trk.currentMileage) {
        trk.currentMileage = entry.odometerReading;
        trk.updatedAt = Date.now();
        this.setStorage(STORAGE_KEYS.TRUCKS, trucks);
      }
    }
    this.setStorage(STORAGE_KEYS.FUEL_ENTRIES, entries);
  }

  deleteFuelEntry(entryId: string): void {
    const entries = this.getAllFuelEntries().filter((e) => e.id !== entryId);
    this.setStorage(STORAGE_KEYS.FUEL_ENTRIES, entries);
  }

  // ==========================================
  // MAINTENANCE RECORDS (TENANT ISOLATED)
  // ==========================================
  getMaintenanceRecords(tenantId?: string): MaintenanceRecord[] {
    const all = this.getStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return all;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return all.filter((m) => (m.tenantId || 'comp_01') === targetTenant);
  }

  getAllMaintenanceRecords(): MaintenanceRecord[] {
    return this.getStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
  }

  saveMaintenanceRecord(record: MaintenanceRecord): void {
    const list = this.getAllMaintenanceRecords();
    const tenantId = record.tenantId || this.getActiveTenantId();
    const recordToSave = { ...record, tenantId };
    const index = list.findIndex((m) => m.id === record.id);

    if (index >= 0) {
      list[index] = recordToSave;
    } else {
      list.unshift(recordToSave);

      this.saveExpense({
        id: `exp_maint_${record.id}`,
        tenantId: tenantId,
        truckId: record.truckId,
        category: 'Maintenance',
        amount: record.cost,
        date: record.serviceDate,
        paymentMethod: 'Bank Transfer',
        status: 'Approved',
        description: `Service: ${record.serviceType} (Odo: ${record.odometerAtService} km) - ${record.partsReplaced || ''}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      if (record.supplierId) {
        this.addSupplierTransaction({
          id: `stx_maint_${Date.now()}`,
          tenantId: tenantId,
          supplierId: record.supplierId,
          truckId: record.truckId,
          type: 'Bill',
          amount: record.cost,
          date: record.serviceDate,
          description: `Workshop Service: ${record.serviceType}`,
          paymentMethod: 'Bank Transfer',
          createdAt: Date.now(),
        });
      }
    }
    this.setStorage(STORAGE_KEYS.MAINTENANCE, list);
  }

  deleteMaintenanceRecord(id: string): void {
    const list = this.getAllMaintenanceRecords().filter((m) => m.id !== id);
    this.setStorage(STORAGE_KEYS.MAINTENANCE, list);
  }

  // ==========================================
  // SALARY SETTLEMENTS (TENANT ISOLATED)
  // ==========================================
  getSalarySettlements(tenantId?: string): DriverSalarySettlement[] {
    const all = this.getStorage<DriverSalarySettlement[]>(STORAGE_KEYS.SALARY_SETTLEMENTS, INITIAL_SALARY_SETTLEMENTS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return all;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return all.filter((s) => (s.tenantId || 'comp_01') === targetTenant);
  }

  getAllSalarySettlements(): DriverSalarySettlement[] {
    return this.getStorage<DriverSalarySettlement[]>(STORAGE_KEYS.SALARY_SETTLEMENTS, INITIAL_SALARY_SETTLEMENTS);
  }

  saveSalarySettlement(settlement: DriverSalarySettlement): void {
    const list = this.getAllSalarySettlements();
    const tenantId = settlement.tenantId || this.getActiveTenantId();
    const setToSave = { ...settlement, tenantId };
    const index = list.findIndex((s) => s.id === settlement.id);

    if (index >= 0) {
      list[index] = setToSave;
    } else {
      list.unshift(setToSave);

      this.saveExpense({
        id: `exp_sal_${settlement.id}`,
        tenantId: tenantId,
        driverId: settlement.driverId,
        category: 'Driver Salary',
        amount: settlement.paidAmount,
        date: settlement.paymentDate,
        paymentMethod: settlement.paymentMethod,
        status: 'Approved',
        description: `Salary settlement for ${settlement.monthPeriod} (Ref: ${settlement.referenceNumber || 'N/A'})`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    this.setStorage(STORAGE_KEYS.SALARY_SETTLEMENTS, list);
  }

  // ==========================================
  // TRIPS (TENANT ISOLATED)
  // ==========================================
  getTrips(tenantId?: string): Trip[] {
    const allTrips = this.getStorage<Trip[]>(STORAGE_KEYS.TRIPS, INITIAL_TRIPS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allTrips;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return allTrips.filter((t) => (t.tenantId || 'comp_01') === targetTenant);
  }

  getAllTrips(): Trip[] {
    return this.getStorage<Trip[]>(STORAGE_KEYS.TRIPS, INITIAL_TRIPS);
  }

  saveTrip(trip: Trip): void {
    const trips = this.getAllTrips();
    const tenantId = trip.tenantId || this.getActiveTenantId();
    const tripToSave = { ...trip, tenantId };
    const index = trips.findIndex((t) => t.id === trip.id);

    if (index >= 0) {
      trips[index] = { ...tripToSave, updatedAt: Date.now() };
    } else {
      trips.unshift({ ...tripToSave, createdAt: Date.now(), updatedAt: Date.now() });

      if (trip.customerId) {
        const totalIncome =
          (trip.tripRate || 0) + (trip.loadingCharges || 0) + (trip.unloadingCharges || 0) + (trip.otherIncome || 0);
        this.addCustomerTransaction({
          id: `tx_${Date.now()}_inv`,
          tenantId: tenantId,
          customerId: trip.customerId,
          tripId: trip.id,
          type: 'Trip Invoice',
          amount: totalIncome,
          date: trip.tripDate,
          description: `Invoice for Trip ${trip.tripNumber} (${trip.fromLocation} to ${trip.toLocation})`,
          createdAt: Date.now(),
        });

        if (trip.advanceReceived && trip.advanceReceived > 0) {
          this.addCustomerTransaction({
            id: `tx_${Date.now()}_adv`,
            tenantId: tenantId,
            customerId: trip.customerId,
            tripId: trip.id,
            type: 'Payment',
            amount: trip.advanceReceived,
            date: trip.tripDate,
            description: `Advance received on trip loading`,
            createdAt: Date.now(),
          });
        }
      }
    }
    this.setStorage(STORAGE_KEYS.TRIPS, trips);
  }

  deleteTrip(tripId: string): void {
    const trips = this.getAllTrips().filter((t) => t.id !== tripId);
    this.setStorage(STORAGE_KEYS.TRIPS, trips);
  }

  // ==========================================
  // EXPENSES (TENANT ISOLATED)
  // ==========================================
  getExpenses(tenantId?: string): Expense[] {
    const allExpenses = this.getStorage<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return allExpenses;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return allExpenses.filter((e) => (e.tenantId || 'comp_01') === targetTenant);
  }

  getAllExpenses(): Expense[] {
    return this.getStorage<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  saveExpense(expense: Expense): void {
    const expenses = this.getAllExpenses();
    const tenantId = expense.tenantId || this.getActiveTenantId();
    const expToSave = { ...expense, tenantId };
    const index = expenses.findIndex((e) => e.id === expense.id);

    if (index >= 0) {
      expenses[index] = { ...expToSave, updatedAt: Date.now() };
    } else {
      expenses.unshift({ ...expToSave, createdAt: Date.now(), updatedAt: Date.now() });

      if (expense.status === 'Pending') {
        this.addNotification({
          id: `notif_exp_sub_${Date.now()}`,
          tenantId: tenantId,
          title: 'Driver Expense Submitted',
          message: `A new ${expense.category} expense of Rs. ${expense.amount.toLocaleString()} was submitted for review.`,
          category: 'expense',
          type: 'expense',
          severity: 'warning',
          targetRole: 'Admin',
          date: expense.date,
          isRead: false,
          relatedId: expense.id,
          createdAt: Date.now(),
        });
      }
    }
    this.setStorage(STORAGE_KEYS.EXPENSES, expenses);
  }

  approveExpense(expenseId: string, approvedBy: string): void {
    const expenses = this.getAllExpenses();
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    expense.status = 'Approved';
    expense.approvedBy = approvedBy;
    expense.approvedAt = Date.now();
    expense.updatedAt = Date.now();
    this.saveExpense(expense);

    this.addNotification({
      id: `notif_exp_appr_${Date.now()}`,
      tenantId: expense.tenantId,
      userId: expense.userId,
      title: 'Expense Approved',
      message: `Your ${expense.category} expense of Rs. ${expense.amount.toLocaleString()} has been approved.`,
      category: 'expense',
      type: 'approval',
      severity: 'success',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      relatedId: expense.id,
      createdAt: Date.now(),
    });
  }

  rejectExpense(expenseId: string, reason: string, rejectedBy: string): void {
    const expenses = this.getAllExpenses();
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    expense.status = 'Rejected';
    expense.rejectionReason = reason;
    expense.updatedAt = Date.now();
    this.saveExpense(expense);

    this.addNotification({
      id: `notif_exp_rej_${Date.now()}`,
      tenantId: expense.tenantId,
      userId: expense.userId,
      title: 'Expense Rejected',
      message: `Your ${expense.category} expense of Rs. ${expense.amount.toLocaleString()} was rejected: ${reason}`,
      category: 'expense',
      type: 'rejection',
      severity: 'urgent',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      relatedId: expense.id,
      createdAt: Date.now(),
    });
  }

  deleteExpense(expenseId: string): void {
    const expenses = this.getAllExpenses().filter((e) => e.id !== expenseId);
    this.setStorage(STORAGE_KEYS.EXPENSES, expenses);
  }

  // ==========================================
  // TRANSACTIONS (TENANT ISOLATED)
  // ==========================================
  getTransactions(tenantId?: string): CustomerTransaction[] {
    const all = this.getStorage<CustomerTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const currentUser = this.getCurrentUserRaw();
    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return all;
    }
    const targetTenant = tenantId || this.getActiveTenantId();
    return all.filter((t) => (t.tenantId || 'comp_01') === targetTenant);
  }

  getAllTransactions(): CustomerTransaction[] {
    return this.getStorage<CustomerTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  addCustomerTransaction(tx: CustomerTransaction): void {
    const txs = this.getAllTransactions();
    const tenantId = tx.tenantId || this.getActiveTenantId();
    txs.unshift({ ...tx, tenantId });
    this.setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  // ==========================================
  // NOTIFICATIONS (TENANT & USER AWARE)
  // ==========================================
  getNotifications(tenantId?: string): AppNotification[] {
    const all = this.getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const currentUser = this.getCurrentUserRaw();

    if (currentUser?.role === 'Provider Admin' && !tenantId) {
      return all;
    }

    const targetTenant = tenantId || this.getActiveTenantId();
    return all.filter((n) => {
      // If notification has a specific userId target
      if (n.userId && currentUser && n.userId === currentUser.id) return true;
      // Filter by tenant
      const notifTenant = n.tenantId || 'comp_01';
      return notifTenant === targetTenant;
    });
  }

  getAllNotifications(): AppNotification[] {
    return this.getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  addNotification(
    notification: Partial<AppNotification> & {
      title: string;
      message: string;
      category: NotificationCategory;
    }
  ): AppNotification {
    const list = this.getAllNotifications();
    const tenantId = notification.tenantId || this.getActiveTenantId();
    const fullNotification: AppNotification = {
      id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenantId: tenantId,
      userId: notification.userId,
      targetRole: notification.targetRole || 'all',
      title: notification.title,
      message: notification.message,
      category: notification.category,
      type: notification.type || 'system',
      severity: notification.severity || 'info',
      date: notification.date || new Date().toISOString().split('T')[0],
      isRead: notification.isRead ?? false,
      actionUrl: notification.actionUrl,
      relatedId: notification.relatedId,
      createdAt: notification.createdAt || Date.now(),
    };
    list.unshift(fullNotification);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    return fullNotification;
  }

  markNotificationRead(id: string): void {
    const list = this.getAllNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  markAllNotificationsRead(): void {
    const activeTenant = this.getActiveTenantId();
    const currentUser = this.getCurrentUser();
    const list = this.getAllNotifications().map((n) => {
      if (currentUser.role === 'Provider Admin' || (n.tenantId || 'comp_01') === activeTenant) {
        return { ...n, isRead: true };
      }
      return n;
    });
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  deleteNotification(id: string): void {
    const list = this.getAllNotifications().filter((n) => n.id !== id);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  checkSubscriptionAlerts(): void {
    const activeSub = this.getActiveSubscription();
    if (!activeSub) return;
    const expTime = new Date(activeSub.expiryDate).getTime();
    const now = Date.now();
    const daysLeft = Math.ceil((expTime - now) / 86400000);

    const notifs = this.getNotifications();
    const todayStr = new Date().toISOString().split('T')[0];

    const alreadyNotified = (key: string) =>
      notifs.some((n) => n.relatedId === `${activeSub.id}_${key}`);

    if (daysLeft <= 0 && !alreadyNotified('expired')) {
      this.addNotification({
        id: `notif_exp_${Date.now()}`,
        tenantId: activeSub.tenantId,
        title: 'Subscription Expired',
        message: 'Your TruckBook subscription has expired. Please renew to restore full operational access.',
        category: 'subscription',
        type: 'subscription',
        severity: 'urgent',
        targetRole: 'Admin',
        date: todayStr,
        isRead: false,
        relatedId: `${activeSub.id}_expired`,
        createdAt: Date.now(),
      });
    } else if (daysLeft === 1 && !alreadyNotified('1day')) {
      this.addNotification({
        id: `notif_exp1_${Date.now()}`,
        tenantId: activeSub.tenantId,
        title: 'Subscription Expiring Tomorrow',
        message: 'Your TruckBook subscription will expire tomorrow. Renew now to avoid interruption.',
        category: 'subscription',
        type: 'subscription',
        severity: 'urgent',
        targetRole: 'Admin',
        date: todayStr,
        isRead: false,
        relatedId: `${activeSub.id}_1day`,
        createdAt: Date.now(),
      });
    } else if (daysLeft <= 3 && daysLeft > 1 && !alreadyNotified('3days')) {
      this.addNotification({
        id: `notif_exp3_${Date.now()}`,
        tenantId: activeSub.tenantId,
        title: 'Subscription Expiring in 3 Days',
        message: `Your TruckBook subscription will expire in ${daysLeft} days.`,
        category: 'subscription',
        type: 'subscription',
        severity: 'warning',
        targetRole: 'Admin',
        date: todayStr,
        isRead: false,
        relatedId: `${activeSub.id}_3days`,
        createdAt: Date.now(),
      });
    } else if (daysLeft <= 7 && daysLeft > 3 && !alreadyNotified('7days')) {
      this.addNotification({
        id: `notif_exp7_${Date.now()}`,
        tenantId: activeSub.tenantId,
        title: 'Subscription Expiring in 7 Days',
        message: 'Your TruckBook subscription will expire in 7 days.',
        category: 'subscription',
        type: 'subscription',
        severity: 'info',
        targetRole: 'Admin',
        date: todayStr,
        isRead: false,
        relatedId: `${activeSub.id}_7days`,
        createdAt: Date.now(),
      });
    }
  }

  // RESET TO DEFAULT
  resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.COMPANY);
    localStorage.removeItem(STORAGE_KEYS.TRUCKS);
    localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.TRIPS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIER_TX);
    localStorage.removeItem(STORAGE_KEYS.FUEL_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
    localStorage.removeItem(STORAGE_KEYS.SALARY_SETTLEMENTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_PLANS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TENANT_ID);
  }
}

export const db = new LocalDatabaseManager();

