export type Currency = 'PKR' | 'USD' | 'EUR' | 'INR' | 'AED' | 'SAR';

export type TruckStatus = 'Available' | 'On Trip' | 'Maintenance' | 'Inactive';

export type DriverStatus = 'Active' | 'On Trip' | 'On Leave' | 'Inactive';

export type SalaryType = 'Monthly' | 'Per Trip' | 'Percentage';

export type TripStatus = 'Draft' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export type UserRole = 'Admin' | 'Manager' | 'Driver';

export type UserStatus = 'Pending Approval' | 'Active' | 'Rejected' | 'Deactivated';

export type SubscriptionPlanId = 'monthly' | 'half_yearly' | 'yearly';

export type SubscriptionStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Suspended' | 'Pending';

export type ExpenseStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export type ExpenseCategory =
  | 'Fuel'
  | 'Toll'
  | 'Maintenance'
  | 'Driver Advance'
  | 'Driver Salary'
  | 'Loading'
  | 'Unloading'
  | 'Insurance'
  | 'Registration'
  | 'Repair'
  | 'Food'
  | 'Accommodation'
  | 'Parking'
  | 'Office'
  | 'Other';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Company Card' | 'Other';

export type DocType = 'Registration' | 'Insurance' | 'Fitness Certificate' | 'Route Permit' | 'Other';

export type ExpiryStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export type SupplierType =
  | 'Fuel Pump'
  | 'Workshop'
  | 'Tyre Dealer'
  | 'Spare Parts'
  | 'Insurance Agent'
  | 'Toll Provider'
  | 'Other';

export type MaintenanceType =
  | 'Engine Oil'
  | 'Oil Filter'
  | 'Air Filter'
  | 'Fuel Filter'
  | 'Brake Service'
  | 'Tyre Replacement'
  | 'Wheel Alignment'
  | 'Battery Replacement'
  | 'Transmission Fluid'
  | 'Clutch & Gearbox'
  | 'General Overhaul';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  driverId?: string; // Links to Driver entity if role === 'Driver'
  companyId?: string;
  subscriptionId?: string;
  avatar?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  durationMonths: number;
  price: number;
  badge?: string;
  description: string;
  features: string[];
  isActive: boolean;
}

export type NotificationCategory =
  | 'document'
  | 'maintenance'
  | 'trip'
  | 'payment'
  | 'user'
  | 'subscription'
  | 'expense';

export interface Subscription {
  id: string;
  userId?: string;
  companyId: string;
  planId: SubscriptionPlanId;
  planName: string;
  durationMonths: number;
  startDate: string; // ISO format
  expiryDate: string; // ISO format
  status: SubscriptionStatus;
  pricePaid: number;
  paymentMethod?: PaymentMethod;
  autoRenew: boolean;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Company {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  currency: Currency;
  taxNumber?: string;
  logoUrl?: string;
  subscriptionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TruckDocument {
  id: string;
  truckId: string;
  docType: DocType;
  docNumber: string;
  issueDate: string; // ISO format
  expiryDate: string; // ISO format
  notes?: string;
  attachmentUrl?: string;
}

export interface Truck {
  id: string;
  regNumber: string;
  truckType: string;
  make: string;
  model: string;
  year: number;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentMileage: number;
  status: TruckStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  documents?: TruckDocument[];
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  cnic: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address: string;
  joiningDate: string;
  salaryType: SalaryType;
  salary: number; // monthly amount, per-trip rate, or percentage (e.g. 10)
  status: DriverStatus;
  assignedTruckId?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  openingBalance: number;
  creditLimit: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: SupplierType;
  phone: string;
  email?: string;
  address: string;
  openingBalance: number; // Positive = we owe them
  creditLimit: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  truckId?: string;
  tripId?: string;
  type: 'Opening Balance' | 'Bill' | 'Payment' | 'Adjustment';
  amount: number; // positive for bill (increase debt), negative for payment (settle debt)
  date: string;
  description: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  createdAt: number;
}

export interface FuelEntry {
  id: string;
  truckId: string;
  tripId?: string;
  driverId?: string;
  supplierId?: string; // Fuel Pump
  fuelDate: string;
  quantityLiters: number;
  ratePerLiter: number;
  totalCost: number;
  odometerReading: number;
  previousOdometer?: number;
  kmDriven?: number;
  fuelEfficiencyKmpl?: number; // kmDriven / quantityLiters
  isFullTank: boolean;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface MaintenanceRecord {
  id: string;
  truckId: string;
  serviceType: MaintenanceType;
  serviceDate: string;
  odometerAtService: number;
  cost: number;
  supplierId?: string; // Workshop
  partsReplaced?: string;
  nextServiceOdometer?: number;
  nextServiceDate?: string;
  notes?: string;
  createdAt: number;
}

export interface DriverSalarySettlement {
  id: string;
  driverId: string;
  monthPeriod: string; // e.g. "2026-08"
  baseSalary: number;
  tripAllowances: number;
  tripCommissions: number;
  advancesDeducted: number;
  netPayable: number;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: number;
}

export interface Trip {
  id: string;
  tripNumber: string;
  truckId: string;
  driverId: string;
  customerId: string;
  supplierId?: string;
  fromLocation: string;
  toLocation: string;
  tripDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  loadingLocation: string;
  unloadingLocation: string;
  cargoDescription: string;
  cargoWeight: number; // in Tons or Kg
  tripRate: number;
  loadingCharges: number;
  unloadingCharges: number;
  otherIncome: number;
  advanceReceived: number;
  status: TripStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  tripId?: string;
  truckId?: string;
  driverId?: string;
  userId?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  receiptUrl?: string;
  status?: ExpenseStatus;
  rejectionReason?: string;
  approvedAt?: number;
  approvedBy?: string;
  // Specific for Fuel expenses
  fuelStation?: string;
  liters?: number;
  pricePerLiter?: number;
  odometerReading?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  tripId?: string;
  type: 'Opening Balance' | 'Trip Invoice' | 'Payment' | 'Adjustment';
  amount: number; // positive for debit/invoice, negative for credit/payment
  date: string;
  description: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  userId?: string; // target user id, or undefined for broadcast / admin
  targetRole?: UserRole | 'all';
  title: string;
  message: string;
  category: 'document' | 'maintenance' | 'trip' | 'payment' | 'user' | 'subscription' | 'expense';
  type?: 'registration' | 'approval' | 'rejection' | 'subscription' | 'expense' | 'system';
  severity: 'info' | 'warning' | 'urgent' | 'success';
  date: string;
  isRead: boolean;
  actionUrl?: string;
  relatedId?: string;
  createdAt: number;
}

export interface TimeRangeFilter {
  label: 'Today' | 'This Week' | 'This Month' | 'This Year';
  startDate: string;
  endDate: string;
}
