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
} from '../types';
import {
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
} from './mockData';

const STORAGE_KEYS = {
  COMPANY: 'truckbook_company_v2',
  TRUCKS: 'truckbook_trucks_v2',
  DRIVERS: 'truckbook_drivers_v2',
  CUSTOMERS: 'truckbook_customers_v2',
  TRIPS: 'truckbook_trips_v2',
  EXPENSES: 'truckbook_expenses_v2',
  TRANSACTIONS: 'truckbook_transactions_v2',
  NOTIFICATIONS: 'truckbook_notifications_v2',
  SUPPLIERS: 'truckbook_suppliers_v2',
  SUPPLIER_TX: 'truckbook_supplier_tx_v2',
  FUEL_ENTRIES: 'truckbook_fuel_entries_v2',
  MAINTENANCE: 'truckbook_maintenance_v2',
  SALARY_SETTLEMENTS: 'truckbook_salary_settlements_v2',
  USERS: 'truckbook_users_v2',
  SUBSCRIPTIONS: 'truckbook_subscriptions_v2',
  SUBSCRIPTION_PLANS: 'truckbook_sub_plans_v2',
  CURRENT_USER_ID: 'truckbook_current_user_id_v2',
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

  // USERS & RBAC
  getUsers(): User[] {
    return this.getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...user, updatedAt: Date.now() };
    } else {
      users.unshift({ ...user, createdAt: Date.now(), updatedAt: Date.now() });

      // Notify admin if new pending user
      if (user.status === 'Pending Approval') {
        this.addNotification({
          id: `notif_reg_${Date.now()}`,
          title: 'New Registration Request',
          message: `${user.name} (${user.role}) has requested access. Review in User Management.`,
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

    // Notify user
    this.addNotification({
      id: `notif_appr_${Date.now()}`,
      userId: user.id,
      title: 'Account Approved!',
      message: `Your TruckBook account has been approved${approvedBy ? ` by ${approvedBy}` : ''}. Welcome aboard!`,
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
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.setStorage(STORAGE_KEYS.USERS, users);
  }

  getCurrentUser(): User {
    const currentId = this.getStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_admin');
    const user = this.getUserById(currentId);
    if (user) return user;
    const users = this.getUsers();
    return users[0] || INITIAL_USERS[0];
  }

  setCurrentUserId(userId: string): void {
    this.setStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  // SUBSCRIPTIONS & PLANS
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.getStorage<SubscriptionPlan[]>(STORAGE_KEYS.SUBSCRIPTION_PLANS, INITIAL_SUBSCRIPTION_PLANS);
  }

  updateSubscriptionPlanPrice(planId: SubscriptionPlanId, newPrice: number): void {
    const plans = this.getSubscriptionPlans().map((p) => (p.id === planId ? { ...p, price: newPrice } : p));
    this.setStorage(STORAGE_KEYS.SUBSCRIPTION_PLANS, plans);
  }

  getSubscriptions(): Subscription[] {
    return this.getStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  }

  getActiveSubscription(): Subscription | undefined {
    const subs = this.getSubscriptions();
    const active = subs.find((s) => s.status === 'Active' || s.status === 'Expiring Soon');
    if (active) {
      // Calculate days remaining and update status if expired or expiring soon
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
    const subs = this.getSubscriptions();
    const index = subs.findIndex((s) => s.id === sub.id);
    if (index >= 0) {
      subs[index] = sub;
    } else {
      subs.unshift(sub);
    }
    this.setStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  }

  createSubscription(
    planId: SubscriptionPlanId,
    durationMonths: number,
    pricePaid?: number,
    paymentMethod: any = 'Bank Transfer',
    userId?: string,
    companyId = 'comp_01'
  ): Subscription {
    const plans = this.getSubscriptionPlans();
    const plan = plans.find((p) => p.id === planId) || plans[0];
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    // Deactivate previous active subscriptions
    const subs = this.getSubscriptions().map((s) => {
      if (s.status === 'Active' || s.status === 'Expiring Soon') {
        return { ...s, status: 'Expired' as const };
      }
      return s;
    });

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      companyId,
      userId,
      planId,
      planName: plan.name,
      durationMonths,
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: 'Active',
      pricePaid: pricePaid ?? plan.price,
      paymentMethod,
      autoRenew: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    subs.unshift(newSub);
    this.setStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);

    // Update company subscription ID
    const comp = this.getCompany();
    comp.subscriptionId = newSub.id;
    this.updateCompany(comp);

    // Send notification
    this.addNotification({
      id: `notif_sub_${Date.now()}`,
      title: 'Subscription Activated!',
      message: `${plan.name} (${durationMonths} Months) has been successfully activated. Valid until ${newSub.expiryDate}.`,
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

  renewSubscription(subId: string, durationMonths = 6): void {
    const sub = this.getSubscriptions().find((s) => s.id === subId);
    if (!sub) return;
    const currExp = new Date(sub.expiryDate);
    const baseDate = currExp.getTime() > Date.now() ? currExp : new Date();
    baseDate.setMonth(baseDate.getMonth() + durationMonths);

    sub.expiryDate = baseDate.toISOString().split('T')[0];
    sub.status = 'Active';
    this.saveSubscription(sub);

    this.addNotification({
      id: `notif_renew_${Date.now()}`,
      title: 'Subscription Renewed',
      message: `Your fleet subscription has been extended until ${sub.expiryDate}.`,
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
    const sub = this.getSubscriptions().find((s) => s.id === subId);
    if (!sub) return;
    sub.status = 'Suspended';
    this.saveSubscription(sub);

    this.addNotification({
      id: `notif_canc_${Date.now()}`,
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

  // COMPANY
  getCompany(): Company {
    return this.getStorage<Company>(STORAGE_KEYS.COMPANY, INITIAL_COMPANY);
  }

  updateCompany(company: Company): void {
    this.setStorage(STORAGE_KEYS.COMPANY, company);
  }

  setCurrency(currency: Currency): void {
    const comp = this.getCompany();
    comp.currency = currency;
    comp.updatedAt = Date.now();
    this.updateCompany(comp);
  }

  // TRUCKS
  getTrucks(): Truck[] {
    return this.getStorage<Truck[]>(STORAGE_KEYS.TRUCKS, INITIAL_TRUCKS);
  }

  saveTruck(truck: Truck): void {
    const trucks = this.getTrucks();
    const index = trucks.findIndex((t) => t.id === truck.id);
    if (index >= 0) {
      trucks[index] = { ...truck, updatedAt: Date.now() };
    } else {
      trucks.unshift({ ...truck, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.TRUCKS, trucks);
  }

  deleteTruck(truckId: string): void {
    const trucks = this.getTrucks().filter((t) => t.id !== truckId);
    this.setStorage(STORAGE_KEYS.TRUCKS, trucks);
  }

  // DRIVERS
  getDrivers(): Driver[] {
    return this.getStorage<Driver[]>(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
  }

  saveDriver(driver: Driver): void {
    const drivers = this.getDrivers();
    const index = drivers.findIndex((d) => d.id === driver.id);
    if (index >= 0) {
      drivers[index] = { ...driver, updatedAt: Date.now() };
    } else {
      drivers.unshift({ ...driver, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.DRIVERS, drivers);
  }

  deleteDriver(driverId: string): void {
    const drivers = this.getDrivers().filter((d) => d.id !== driverId);
    this.setStorage(STORAGE_KEYS.DRIVERS, drivers);
  }

  // CUSTOMERS
  getCustomers(): Customer[] {
    return this.getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  saveCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      customers[index] = { ...customer, updatedAt: Date.now() };
    } else {
      customers.unshift({ ...customer, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  deleteCustomer(customerId: string): void {
    const customers = this.getCustomers().filter((c) => c.id !== customerId);
    this.setStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // SUPPLIERS
  getSuppliers(): Supplier[] {
    return this.getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  saveSupplier(supplier: Supplier): void {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex((s) => s.id === supplier.id);
    if (index >= 0) {
      suppliers[index] = { ...supplier, updatedAt: Date.now() };
    } else {
      suppliers.unshift({ ...supplier, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  deleteSupplier(supplierId: string): void {
    const suppliers = this.getSuppliers().filter((s) => s.id !== supplierId);
    this.setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // SUPPLIER TRANSACTIONS
  getSupplierTransactions(): SupplierTransaction[] {
    return this.getStorage<SupplierTransaction[]>(STORAGE_KEYS.SUPPLIER_TX, INITIAL_SUPPLIER_TRANSACTIONS);
  }

  addSupplierTransaction(tx: SupplierTransaction): void {
    const txs = this.getSupplierTransactions();
    txs.unshift(tx);
    this.setStorage(STORAGE_KEYS.SUPPLIER_TX, txs);
  }

  deleteSupplierTransaction(id: string): void {
    const txs = this.getSupplierTransactions().filter((t) => t.id !== id);
    this.setStorage(STORAGE_KEYS.SUPPLIER_TX, txs);
  }

  // FUEL ENTRIES
  getFuelEntries(): FuelEntry[] {
    return this.getStorage<FuelEntry[]>(STORAGE_KEYS.FUEL_ENTRIES, INITIAL_FUEL_ENTRIES);
  }

  saveFuelEntry(entry: FuelEntry): void {
    const entries = this.getFuelEntries();
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.unshift(entry);

      // Also create an associated expense record
      this.saveExpense({
        id: `exp_fuel_${entry.id}`,
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

      // If supplier is linked, create a supplier bill transaction
      if (entry.supplierId) {
        this.addSupplierTransaction({
          id: `stx_fuel_${Date.now()}`,
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

      // Update truck current mileage if new odometer reading is higher
      const trucks = this.getTrucks();
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
    const entries = this.getFuelEntries().filter((e) => e.id !== entryId);
    this.setStorage(STORAGE_KEYS.FUEL_ENTRIES, entries);
  }

  // MAINTENANCE
  getMaintenanceRecords(): MaintenanceRecord[] {
    return this.getStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_RECORDS);
  }

  saveMaintenanceRecord(record: MaintenanceRecord): void {
    const list = this.getMaintenanceRecords();
    const index = list.findIndex((m) => m.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);

      // Create an expense record for this maintenance
      this.saveExpense({
        id: `exp_maint_${record.id}`,
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

      // If supplier workshop is linked, create supplier bill
      if (record.supplierId) {
        this.addSupplierTransaction({
          id: `stx_maint_${Date.now()}`,
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
    const list = this.getMaintenanceRecords().filter((m) => m.id !== id);
    this.setStorage(STORAGE_KEYS.MAINTENANCE, list);
  }

  // SALARY SETTLEMENTS
  getSalarySettlements(): DriverSalarySettlement[] {
    return this.getStorage<DriverSalarySettlement[]>(STORAGE_KEYS.SALARY_SETTLEMENTS, INITIAL_SALARY_SETTLEMENTS);
  }

  saveSalarySettlement(settlement: DriverSalarySettlement): void {
    const list = this.getSalarySettlements();
    const index = list.findIndex((s) => s.id === settlement.id);
    if (index >= 0) {
      list[index] = settlement;
    } else {
      list.unshift(settlement);

      // Create salary expense entry
      this.saveExpense({
        id: `exp_sal_${settlement.id}`,
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

  // TRIPS
  getTrips(): Trip[] {
    return this.getStorage<Trip[]>(STORAGE_KEYS.TRIPS, INITIAL_TRIPS);
  }

  saveTrip(trip: Trip): void {
    const trips = this.getTrips();
    const index = trips.findIndex((t) => t.id === trip.id);
    if (index >= 0) {
      trips[index] = { ...trip, updatedAt: Date.now() };
    } else {
      trips.unshift({ ...trip, createdAt: Date.now(), updatedAt: Date.now() });

      // Auto create invoice transaction if customer exists
      if (trip.customerId) {
        const totalIncome =
          (trip.tripRate || 0) + (trip.loadingCharges || 0) + (trip.unloadingCharges || 0) + (trip.otherIncome || 0);
        this.addCustomerTransaction({
          id: `tx_${Date.now()}_inv`,
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
    const trips = this.getTrips().filter((t) => t.id !== tripId);
    this.setStorage(STORAGE_KEYS.TRIPS, trips);
  }

  // EXPENSES
  getExpenses(): Expense[] {
    return this.getStorage<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  saveExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = { ...expense, updatedAt: Date.now() };
    } else {
      expenses.unshift({ ...expense, createdAt: Date.now(), updatedAt: Date.now() });

      // If pending expense added by driver, notify admin
      if (expense.status === 'Pending') {
        this.addNotification({
          id: `notif_exp_sub_${Date.now()}`,
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
    const expenses = this.getExpenses();
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    expense.status = 'Approved';
    expense.approvedBy = approvedBy;
    expense.approvedAt = Date.now();
    expense.updatedAt = Date.now();
    this.saveExpense(expense);

    // Notify driver
    this.addNotification({
      id: `notif_exp_appr_${Date.now()}`,
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
    const expenses = this.getExpenses();
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    expense.status = 'Rejected';
    expense.rejectionReason = reason;
    expense.updatedAt = Date.now();
    this.saveExpense(expense);

    // Notify driver
    this.addNotification({
      id: `notif_exp_rej_${Date.now()}`,
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
    const expenses = this.getExpenses().filter((e) => e.id !== expenseId);
    this.setStorage(STORAGE_KEYS.EXPENSES, expenses);
  }

  // TRANSACTIONS
  getTransactions(): CustomerTransaction[] {
    return this.getStorage<CustomerTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  addCustomerTransaction(tx: CustomerTransaction): void {
    const txs = this.getTransactions();
    txs.unshift(tx);
    this.setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  // NOTIFICATIONS
  getNotifications(): AppNotification[] {
    return this.getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  addNotification(
    notification: Partial<AppNotification> & {
      title: string;
      message: string;
      category: NotificationCategory;
    }
  ): AppNotification {
    const list = this.getNotifications();
    const fullNotification: AppNotification = {
      id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  deleteNotification(id: string): void {
    const list = this.getNotifications().filter((n) => n.id !== id);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // Check and dispatch automatic subscription alerts (7 days, 3 days, 1 day, expired)
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
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }
}

export const db = new LocalDatabaseManager();

