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
    }
    this.setStorage(STORAGE_KEYS.EXPENSES, expenses);
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

  markNotificationRead(id: string): void {
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
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
  }
}

export const db = new LocalDatabaseManager();

