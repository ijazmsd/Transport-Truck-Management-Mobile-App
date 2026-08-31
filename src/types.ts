export type Currency = 'PKR' | 'USD' | 'EUR' | 'INR' | 'AED' | 'SAR';

export type TruckStatus = 'Available' | 'On Trip' | 'Maintenance' | 'Inactive';

export type DriverStatus = 'Active' | 'On Trip' | 'On Leave' | 'Inactive';

export type SalaryType = 'Monthly' | 'Per Trip' | 'Percentage';

export type TripStatus = 'Draft' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export type UserRole = 'Provider Admin' | 'Company Admin' | 'Manager' | 'Accountant' | 'Driver' | 'Admin';

export type UserStatus = 'Pending Approval' | 'Active' | 'Rejected' | 'Suspended' | 'Deactivated';

export type OnboardingStatus = 'registered' | 'subscribed' | 'company_created' | 'completed';

export type SubscriptionPlanId = 'monthly' | 'half_yearly' | 'yearly' | string;

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

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Company Card' | 'Credit/Debit Card' | 'EasyPaisa/JazzCash' | 'Stripe (Mock)' | 'Other';

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
  password?: string;
  role: UserRole;
  status: UserStatus;
  tenantId?: string; // Tenant / Transport Company ID (undefined for Provider Admin)
  companyId?: string; // Alias for backward compatibility
  driverId?: string; // Links to Driver entity if role === 'Driver'
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
  maxUsers: number;
  maxDrivers: number;
  maxTrucks: number;
  storageGb?: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type NotificationCategory =
  | 'document'
  | 'maintenance'
  | 'trip'
  | 'payment'
  | 'user'
  | 'subscription'
  | 'expense'
  | 'provider'
  | 'company';

export interface Subscription {
  id: string;
  tenantId: string;
  userId?: string;
  companyId?: string;
  planId: SubscriptionPlanId;
  planName: string;
  durationMonths: number;
  startDate: string; // ISO format
  expiryDate: string; // ISO format
  status: SubscriptionStatus;
  pricePaid: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'Completed' | 'Pending' | 'Failed';
  autoRenew: boolean;
  maxUsers: number;
  maxDrivers: number;
  maxTrucks: number;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  status: 'Success' | 'Pending' | 'Failed';
  transactionRef: string;
  planName: string;
  billingCycle: string;
  createdAt: number;
}

export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  country?: string;
  currency: Currency;
  timeZone?: string;
  status?: 'Active' | 'Suspended' | 'Pending';
  ownerUserId?: string;
  taxNumber?: string;
  logoUrl?: string;
  subscriptionId?: string;
  onboardingStatus?: OnboardingStatus;
  createdAt: number;
  updatedAt: number;
}

export type Tenant = Company;

export interface TruckDocument {
  id: string;
  truckId: string;
  tenantId?: string;
  docType: DocType;
  docNumber: string;
  issueDate: string; // ISO format
  expiryDate: string; // ISO format
  notes?: string;
  attachmentUrl?: string;
}

export interface Truck {
  id: string;
  tenantId?: string;
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
  tenantId?: string;
  name: string;
  phone: string;
  email?: string;
  cnic: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address: string;
  joiningDate: string;
  salaryType: SalaryType;
  salary: number; // monthly amount, per-trip rate, or percentage (e.g. 10)
  status: DriverStatus;
  assignedTruckId?: string;
  loginEmail?: string;
  tempPassword?: string;
  inviteSent?: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string;
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
  tenantId?: string; // Scoped to tenant, or undefined for platform provider
  userId?: string; // target user id, or undefined for broadcast / admin
  targetRole?: UserRole | 'all';
  isProviderNotification?: boolean;
  title: string;
  message: string;
  category: NotificationCategory;
  type?: 'registration' | 'approval' | 'rejection' | 'subscription' | 'expense' | 'system' | 'payment';
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

