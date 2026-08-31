import {
  Currency,
  Expense,
  Trip,
  Customer,
  CustomerTransaction,
  TruckDocument,
  ExpiryStatus,
  Supplier,
  SupplierTransaction,
  FuelEntry,
  MaintenanceRecord,
  Driver,
  Truck,
} from '../types';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PKR: 'Rs.',
  USD: '$',
  EUR: '€',
  INR: '₹',
  AED: 'AED',
  SAR: 'SAR',
};

export function formatCurrency(amount: number, currency: Currency = 'PKR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || 'Rs.';
  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (amount < 0) {
    return `-${symbol} ${formattedNumber}`;
  }
  return `${symbol} ${formattedNumber}`;
}

export function calculateTripIncome(trip: Trip): number {
  return (
    (trip.tripRate || 0) +
    (trip.loadingCharges || 0) +
    (trip.unloadingCharges || 0) +
    (trip.otherIncome || 0)
  );
}

export function calculateTripExpenses(tripId: string, allExpenses: Expense[]): {
  total: number;
  breakdown: Record<string, number>;
  expensesList: Expense[];
} {
  const tripExpenses = allExpenses.filter((e) => e.tripId === tripId);
  const breakdown: Record<string, number> = {};
  let total = 0;

  for (const exp of tripExpenses) {
    total += exp.amount;
    breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
  }

  return {
    total,
    breakdown,
    expensesList: tripExpenses,
  };
}

export function calculateTripProfit(
  trip: Trip,
  allExpenses: Expense[]
): {
  income: number;
  expenses: number;
  netProfit: number;
  marginPercent: number;
  isProfitable: boolean;
} {
  const income = calculateTripIncome(trip);
  const { total: expenses } = calculateTripExpenses(trip.id, allExpenses);
  const netProfit = income - expenses;
  const marginPercent = income > 0 ? (netProfit / income) * 100 : 0;

  return {
    income,
    expenses,
    netProfit,
    marginPercent: Math.round(marginPercent * 10) / 10,
    isProfitable: netProfit >= 0,
  };
}

export function calculateCustomerBalance(
  customer: Customer,
  transactions: CustomerTransaction[]
): {
  openingBalance: number;
  totalInvoices: number;
  totalPayments: number;
  currentBalance: number;
  isOverLimit: boolean;
} {
  const custTx = transactions.filter((t) => t.customerId === customer.id);
  let invoices = 0;
  let payments = 0;

  for (const tx of custTx) {
    if (tx.type === 'Trip Invoice' || (tx.type === 'Adjustment' && tx.amount > 0)) {
      invoices += Math.abs(tx.amount);
    } else if (tx.type === 'Payment' || (tx.type === 'Adjustment' && tx.amount < 0)) {
      payments += Math.abs(tx.amount);
    }
  }

  const currentBalance = (customer.openingBalance || 0) + invoices - payments;
  const isOverLimit = customer.creditLimit > 0 && currentBalance > customer.creditLimit;

  return {
    openingBalance: customer.openingBalance || 0,
    totalInvoices: invoices,
    totalPayments: payments,
    currentBalance,
    isOverLimit,
  };
}

export function calculateSupplierBalance(
  supplier: Supplier,
  transactions: SupplierTransaction[]
): {
  openingBalance: number;
  totalBills: number;
  totalPayments: number;
  currentBalance: number;
  isOverLimit: boolean;
} {
  const supTx = transactions.filter((t) => t.supplierId === supplier.id);
  let bills = 0;
  let payments = 0;

  for (const tx of supTx) {
    if (tx.type === 'Bill' || (tx.type === 'Adjustment' && tx.amount > 0)) {
      bills += Math.abs(tx.amount);
    } else if (tx.type === 'Payment' || (tx.type === 'Adjustment' && tx.amount < 0)) {
      payments += Math.abs(tx.amount);
    }
  }

  const currentBalance = (supplier.openingBalance || 0) + bills - payments;
  const isOverLimit = supplier.creditLimit > 0 && currentBalance > supplier.creditLimit;

  return {
    openingBalance: supplier.openingBalance || 0,
    totalBills: bills,
    totalPayments: payments,
    currentBalance,
    isOverLimit,
  };
}

export function calculateFuelFleetMetrics(fuelEntries: FuelEntry[]): {
  totalLiters: number;
  totalCost: number;
  totalKmDriven: number;
  averageKmpl: number;
  averageCostPerKm: number;
  truckSummaries: Array<{
    truckId: string;
    totalLiters: number;
    totalCost: number;
    totalKm: number;
    avgKmpl: number;
  }>;
} {
  let totalLiters = 0;
  let totalCost = 0;
  let totalKmDriven = 0;

  const perTruckMap: Record<
    string,
    { liters: number; cost: number; km: number; validEfficiencyCount: number; sumKmpl: number }
  > = {};

  for (const entry of fuelEntries) {
    totalLiters += entry.quantityLiters;
    totalCost += entry.totalCost;
    if (entry.kmDriven) totalKmDriven += entry.kmDriven;

    if (!perTruckMap[entry.truckId]) {
      perTruckMap[entry.truckId] = { liters: 0, cost: 0, km: 0, validEfficiencyCount: 0, sumKmpl: 0 };
    }
    perTruckMap[entry.truckId].liters += entry.quantityLiters;
    perTruckMap[entry.truckId].cost += entry.totalCost;
    if (entry.kmDriven) perTruckMap[entry.truckId].km += entry.kmDriven;
    if (entry.fuelEfficiencyKmpl && entry.fuelEfficiencyKmpl > 0) {
      perTruckMap[entry.truckId].validEfficiencyCount += 1;
      perTruckMap[entry.truckId].sumKmpl += entry.fuelEfficiencyKmpl;
    }
  }

  const truckSummaries = Object.entries(perTruckMap).map(([truckId, data]) => ({
    truckId,
    totalLiters: data.liters,
    totalCost: data.cost,
    totalKm: data.km,
    avgKmpl:
      data.validEfficiencyCount > 0
        ? Math.round((data.sumKmpl / data.validEfficiencyCount) * 100) / 100
        : data.liters > 0 && data.km > 0
        ? Math.round((data.km / data.liters) * 100) / 100
        : 0,
  }));

  const averageKmpl =
    totalKmDriven > 0 && totalLiters > 0 ? Math.round((totalKmDriven / totalLiters) * 100) / 100 : 0;
  const averageCostPerKm =
    totalKmDriven > 0 ? Math.round((totalCost / totalKmDriven) * 10) / 10 : 0;

  return {
    totalLiters,
    totalCost,
    totalKmDriven,
    averageKmpl,
    averageCostPerKm,
    truckSummaries,
  };
}

export function checkMaintenanceStatus(
  truck: Truck,
  records: MaintenanceRecord[]
): {
  upcomingServices: Array<{
    serviceType: string;
    dueOdometer?: number;
    dueDate?: string;
    kmRemaining: number;
    isOverdue: boolean;
    statusBadge: string;
  }>;
  totalServiceSpend: number;
} {
  const truckRecords = records.filter((r) => r.truckId === truck.id);
  const totalServiceSpend = truckRecords.reduce((sum, r) => sum + r.cost, 0);

  const upcomingServices = truckRecords
    .filter((r) => r.nextServiceOdometer || r.nextServiceDate)
    .map((r) => {
      const dueOdo = r.nextServiceOdometer || 0;
      const kmRemaining = dueOdo - truck.currentMileage;
      const isOverdue = dueOdo > 0 && kmRemaining <= 0;
      let statusBadge = 'bg-emerald-500/10 text-emerald-600 border-emerald-200';

      if (isOverdue) {
        statusBadge = 'bg-rose-500/10 text-rose-600 border-rose-200';
      } else if (kmRemaining <= 1500) {
        statusBadge = 'bg-amber-500/10 text-amber-600 border-amber-200';
      }

      return {
        serviceType: r.serviceType,
        dueOdometer: r.nextServiceOdometer,
        dueDate: r.nextServiceDate,
        kmRemaining,
        isOverdue,
        statusBadge,
      };
    });

  return {
    upcomingServices,
    totalServiceSpend,
  };
}

export function calculateDriverPayrollBreakdown(
  driver: Driver,
  trips: Trip[],
  expenses: Expense[],
  periodMonth: string // e.g. "2026-08"
): {
  baseSalary: number;
  tripAllowances: number;
  tripCommissions: number;
  advancesDeducted: number;
  netPayable: number;
  tripsDoneCount: number;
} {
  // Filter trips for this driver completed/logged in the period
  const driverTrips = trips.filter(
    (t) => t.driverId === driver.id && t.tripDate.startsWith(periodMonth)
  );

  let baseSalary = 0;
  let tripCommissions = 0;
  let tripAllowances = 0;

  if (driver.salaryType === 'Monthly') {
    baseSalary = driver.salary || 0;
  } else if (driver.salaryType === 'Per Trip') {
    baseSalary = (driver.salary || 0) * driverTrips.length;
  } else if (driver.salaryType === 'Percentage') {
    // Percentage of total trip rates or profit
    const totalTripRevenue = driverTrips.reduce((acc, t) => acc + calculateTripIncome(t), 0);
    tripCommissions = Math.round((totalTripRevenue * (driver.salary || 0)) / 100);
  }

  // Calculate driver advances logged during this month in expenses
  const driverExpenses = expenses.filter(
    (e) =>
      e.driverId === driver.id &&
      e.date.startsWith(periodMonth) &&
      (e.category === 'Driver Advance' || e.category === 'Driver Salary')
  );

  const advancesDeducted = driverExpenses
    .filter((e) => e.category === 'Driver Advance')
    .reduce((sum, e) => sum + e.amount, 0);

  const netPayable = Math.max(0, baseSalary + tripAllowances + tripCommissions - advancesDeducted);

  return {
    baseSalary,
    tripAllowances,
    tripCommissions,
    advancesDeducted,
    netPayable,
    tripsDoneCount: driverTrips.length,
  };
}

export function checkExpiryStatus(expiryDateStr: string): {
  status: ExpiryStatus;
  daysRemaining: number;
  badgeColor: string;
} {
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  // reset time
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'Expired',
      daysRemaining: diffDays,
      badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200',
    };
  } else if (diffDays <= 30) {
    return {
      status: 'Expiring Soon',
      daysRemaining: diffDays,
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    };
  } else {
    return {
      status: 'Valid',
      daysRemaining: diffDays,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    };
  }
}

