export interface FlutterFile {
  path: string;
  name: string;
  category: 'core' | 'database' | 'models' | 'services' | 'repositories' | 'main';
  content: string;
}

export const FLUTTER_STEP1_FILES: FlutterFile[] = [
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    category: 'main',
    content: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/database/app_database.dart';
import 'core/theme/app_theme.dart';
import 'core/routing/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Lock to portrait mode for optimal one-handed fleet operation
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize SQLite database instance & run migrations
  final database = AppDatabase.instance;
  await database.init();

  runApp(
    const ProviderScope(
      child: TruckBookApp(),
    ),
  );
}

class TruckBookApp extends ConsumerWidget {
  const TruckBookApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'TruckBook Fleet & Transport',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}`,
  },
  {
    path: 'lib/core/constants/app_colors.dart',
    name: 'app_colors.dart',
    category: 'core',
    content: `import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary Brand Palettes (Transport Industrial Slate & Blue)
  static const Color primary = Color(0xFF0F2B48);
  static const Color primaryContainer = Color(0xFF1E3A5F);
  static const Color onPrimary = Color(0xFFFFFFFF);

  static const Color secondary = Color(0xFF2563EB); // Royal Blue accent
  static const Color secondaryContainer = Color(0xFFDBEAFE);
  static const Color onSecondaryContainer = Color(0xFF1E40AF);

  // Surface & Canvas
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);
  static const Color borderLight = Color(0xFFE2E8F0);

  // Dark Theme Colors
  static const Color backgroundDark = Color(0xFF0B132B);
  static const Color surfaceDark = Color(0xFF1C2541);
  static const Color borderDark = Color(0xFF2E3A59);

  // Financial & Operational Semantics
  static const Color profitGreen = Color(0xFF10B981);
  static const Color profitGreenLight = Color(0xFFD1FAE5);
  static const Color expenseRed = Color(0xFFEF4444);
  static const Color expenseRedLight = Color(0xFFFEE2E2);
  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color warningAmberLight = Color(0xFFFEF3C7);
  static const Color infoBlue = Color(0xFF3B82F6);
  static const Color infoBlueLight = Color(0xFFEFF6FF);

  // Status Badges
  static const Color statusAvailable = Color(0xFF10B981);
  static const Color statusOnTrip = Color(0xFF3B82F6);
  static const Color statusMaintenance = Color(0xFFF59E0B);
  static const Color statusInactive = Color(0xFF6B7280);
}`,
  },
  {
    path: 'lib/core/database/database_constants.dart',
    name: 'database_constants.dart',
    category: 'database',
    content: `class DatabaseConstants {
  DatabaseConstants._();

  static const String databaseName = 'truckbook_local.db';
  static const int databaseVersion = 1;

  // Table Names
  static const String tableCompany = 'companies';
  static const String tableTrucks = 'trucks';
  static const String tableTruckDocuments = 'truck_documents';
  static const String tableDrivers = 'drivers';
  static const String tableCustomers = 'customers';
  static const String tableSuppliers = 'suppliers';
  static const String tableTrips = 'trips';
  static const String tableExpenses = 'expenses';
  static const String tableFuelRecords = 'fuel_records';
  static const String tableMaintenance = 'maintenance_records';
  static const String tableCustomerTx = 'customer_transactions';
  static const String tableSupplierTx = 'supplier_transactions';
  static const String tableNotifications = 'notifications';
  static const String tableSettings = 'app_settings';
}`,
  },
  {
    path: 'lib/core/database/app_database.dart',
    name: 'app_database.dart',
    category: 'database',
    content: `import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'database_constants.dart';

class AppDatabase {
  static final AppDatabase instance = AppDatabase._init();
  static Database? _database;

  AppDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB(DatabaseConstants.databaseName);
    return _database!;
  }

  Future<void> init() async {
    _database = await _initDB(DatabaseConstants.databaseName);
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: DatabaseConstants.databaseVersion,
      onCreate: _createDB,
      onConfigure: _configureDB,
    );
  }

  Future<void> _configureDB(Database db) async {
    // Enable Foreign Key constraints in SQLite
    await db.execute('PRAGMA foreign_keys = ON');
  }

  Future<void> _createDB(Database db, int version) async {
    const textType = 'TEXT NOT NULL';
    const textNullable = 'TEXT';
    const intType = 'INTEGER NOT NULL';
    const realType = 'REAL NOT NULL';

    // 1. Company Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableCompany} (
        id \$textType PRIMARY KEY,
        name \$textType,
        phone \$textType,
        email \$textNullable,
        address \$textNullable,
        currency \$textType,
        logo_path \$textNullable,
        created_at \$intType,
        updated_at \$intType
      )
    ''');

    // 2. Trucks Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableTrucks} (
        id \$textType PRIMARY KEY,
        reg_number \$textType UNIQUE,
        truck_type \$textType,
        make \$textType,
        model \$textType,
        year \$intType,
        color \$textType,
        chassis_number \$textType,
        engine_number \$textType,
        purchase_date \$textType,
        purchase_price \$realType,
        current_mileage \$intType,
        status \$textType,
        notes \$textNullable,
        created_at \$intType,
        updated_at \$intType
      )
    ''');

    // 3. Truck Documents Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableTruckDocuments} (
        id \$textType PRIMARY KEY,
        truck_id \$textType,
        doc_type \$textType,
        doc_number \$textType,
        issue_date \$textType,
        expiry_date \$textType,
        notes \$textNullable,
        attachment_path \$textNullable,
        FOREIGN KEY (truck_id) REFERENCES \${DatabaseConstants.tableTrucks} (id) ON DELETE CASCADE
      )
    ''');

    // 4. Drivers Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableDrivers} (
        id \$textType PRIMARY KEY,
        name \$textType,
        phone \$textType,
        cnic \$textType,
        license_number \$textType,
        license_expiry_date \$textType,
        address \$textType,
        joining_date \$textType,
        salary_type \$textType,
        salary \$realType,
        status \$textType,
        assigned_truck_id \$textNullable,
        notes \$textNullable,
        created_at \$intType,
        updated_at \$intType,
        FOREIGN KEY (assigned_truck_id) REFERENCES \${DatabaseConstants.tableTrucks} (id) ON DELETE SET NULL
      )
    ''');

    // 5. Customers Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableCustomers} (
        id \$textType PRIMARY KEY,
        name \$textType,
        company_name \$textNullable,
        phone \$textType,
        email \$textNullable,
        address \$textNullable,
        opening_balance \$realType DEFAULT 0.0,
        credit_limit \$realType DEFAULT 0.0,
        notes \$textNullable,
        created_at \$intType,
        updated_at \$intType
      )
    ''');

    // 6. Trips Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableTrips} (
        id \$textType PRIMARY KEY,
        trip_number \$textType UNIQUE,
        truck_id \$textType,
        driver_id \$textType,
        customer_id \$textType,
        supplier_id \$textNullable,
        from_location \$textType,
        to_location \$textType,
        trip_date \$textType,
        expected_delivery_date \$textType,
        actual_delivery_date \$textNullable,
        loading_location \$textType,
        unloading_location \$textType,
        cargo_description \$textType,
        cargo_weight \$realType,
        trip_rate \$realType,
        loading_charges \$realType DEFAULT 0.0,
        unloading_charges \$realType DEFAULT 0.0,
        other_income \$realType DEFAULT 0.0,
        advance_received \$realType DEFAULT 0.0,
        status \$textType,
        notes \$textNullable,
        created_at \$intType,
        updated_at \$intType,
        FOREIGN KEY (truck_id) REFERENCES \${DatabaseConstants.tableTrucks} (id),
        FOREIGN KEY (driver_id) REFERENCES \${DatabaseConstants.tableDrivers} (id),
        FOREIGN KEY (customer_id) REFERENCES \${DatabaseConstants.tableCustomers} (id)
      )
    ''');

    // 7. Expenses Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableExpenses} (
        id \$textType PRIMARY KEY,
        trip_id \$textNullable,
        truck_id \$textNullable,
        driver_id \$textNullable,
        category \$textType,
        amount \$realType,
        date \$textType,
        payment_method \$textType,
        description \$textType,
        receipt_path \$textNullable,
        created_at \$intType,
        updated_at \$intType,
        FOREIGN KEY (trip_id) REFERENCES \${DatabaseConstants.tableTrips} (id) ON DELETE CASCADE,
        FOREIGN KEY (truck_id) REFERENCES \${DatabaseConstants.tableTrucks} (id) ON DELETE SET NULL,
        FOREIGN KEY (driver_id) REFERENCES \${DatabaseConstants.tableDrivers} (id) ON DELETE SET NULL
      )
    ''');

    // 8. Customer Transactions Table
    await db.execute('''
      CREATE TABLE \${DatabaseConstants.tableCustomerTx} (
        id \$textType PRIMARY KEY,
        customer_id \$textType,
        trip_id \$textNullable,
        type \$textType,
        amount \$realType,
        date \$textType,
        description \$textType,
        payment_method \$textNullable,
        reference_number \$textNullable,
        created_at \$intType,
        FOREIGN KEY (customer_id) REFERENCES \${DatabaseConstants.tableCustomers} (id) ON DELETE CASCADE,
        FOREIGN KEY (trip_id) REFERENCES \${DatabaseConstants.tableTrips} (id) ON DELETE SET NULL
      )
    ''');

    // Create Indexes for Fast Search and Filter
    await db.execute('CREATE INDEX idx_truck_status ON \${DatabaseConstants.tableTrucks}(status)');
    await db.execute('CREATE INDEX idx_trip_status ON \${DatabaseConstants.tableTrips}(status)');
    await db.execute('CREATE INDEX idx_trip_date ON \${DatabaseConstants.tableTrips}(trip_date)');
    await db.execute('CREATE INDEX idx_expense_trip ON \${DatabaseConstants.tableExpenses}(trip_id)');
    await db.execute('CREATE INDEX idx_cust_tx ON \${DatabaseConstants.tableCustomerTx}(customer_id)');
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}`,
  },
  {
    path: 'lib/core/services/trip_profit_service.dart',
    name: 'trip_profit_service.dart',
    category: 'services',
    content: `import '../../features/trips/domain/models/trip_model.dart';
import '../../features/expenses/domain/models/expense_model.dart';

class TripFinancialSummary {
  final double totalIncome;
  final double totalExpenses;
  final double netProfit;
  final double profitMargin;
  final bool isProfitable;
  final Map<String, double> expenseCategoryBreakdown;

  const TripFinancialSummary({
    required this.totalIncome,
    required this.totalExpenses,
    required this.netProfit,
    required this.profitMargin,
    required this.isProfitable,
    required this.expenseCategoryBreakdown,
  });
}

class TripProfitService {
  TripProfitService._();

  static double calculateIncome(TripModel trip) {
    return trip.tripRate +
        trip.loadingCharges +
        trip.unloadingCharges +
        trip.otherIncome;
  }

  static TripFinancialSummary calculateSummary(
    TripModel trip,
    List<ExpenseModel> tripExpenses,
  ) {
    final income = calculateIncome(trip);
    double expensesTotal = 0.0;
    final breakdown = <String, double>{};

    for (final expense in tripExpenses) {
      expensesTotal += expense.amount;
      breakdown[expense.category] =
          (breakdown[expense.category] ?? 0.0) + expense.amount;
    }

    final netProfit = income - expensesTotal;
    final margin = income > 0 ? (netProfit / income) * 100 : 0.0;

    return TripFinancialSummary(
      totalIncome: income,
      totalExpenses: expensesTotal,
      netProfit: netProfit,
      profitMargin: double.parse(margin.toStringAsFixed(1)),
      isProfitable: netProfit >= 0,
      expenseCategoryBreakdown: breakdown,
    );
  }
}`,
  },
  {
    path: 'lib/features/trips/domain/models/trip_model.dart',
    name: 'trip_model.dart',
    category: 'models',
    content: `import 'package:uuid/uuid.dart';

enum TripStatus { draft, assigned, inProgress, completed, cancelled }

class TripModel {
  final String id;
  final String tripNumber;
  final String truckId;
  final String driverId;
  final String customerId;
  final String? supplierId;
  final String fromLocation;
  final String toLocation;
  final String tripDate;
  final String expectedDeliveryDate;
  final String? actualDeliveryDate;
  final String loadingLocation;
  final String unloadingLocation;
  final String cargoDescription;
  final double cargoWeight;
  final double tripRate;
  final double loadingCharges;
  final double unloadingCharges;
  final double otherIncome;
  final double advanceReceived;
  final TripStatus status;
  final String? notes;
  final int createdAt;
  final int updatedAt;

  TripModel({
    String? id,
    required this.tripNumber,
    required this.truckId,
    required this.driverId,
    required this.customerId,
    this.supplierId,
    required this.fromLocation,
    required this.toLocation,
    required this.tripDate,
    required this.expectedDeliveryDate,
    this.actualDeliveryDate,
    required this.loadingLocation,
    required this.unloadingLocation,
    required this.cargoDescription,
    required this.cargoWeight,
    required this.tripRate,
    this.loadingCharges = 0.0,
    this.unloadingCharges = 0.0,
    this.otherIncome = 0.0,
    this.advanceReceived = 0.0,
    this.status = TripStatus.assigned,
    this.notes,
    int? createdAt,
    int? updatedAt,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now().millisecondsSinceEpoch,
        updatedAt = updatedAt ?? DateTime.now().millisecondsSinceEpoch;

  double get totalIncome => tripRate + loadingCharges + unloadingCharges + otherIncome;
  double get remainingBalance => totalIncome - advanceReceived;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'trip_number': tripNumber,
      'truck_id': truckId,
      'driver_id': driverId,
      'customer_id': customerId,
      'supplier_id': supplierId,
      'from_location': fromLocation,
      'to_location': toLocation,
      'trip_date': tripDate,
      'expected_delivery_date': expectedDeliveryDate,
      'actual_delivery_date': actualDeliveryDate,
      'loading_location': loadingLocation,
      'unloading_location': unloadingLocation,
      'cargo_description': cargoDescription,
      'cargo_weight': cargoWeight,
      'trip_rate': tripRate,
      'loading_charges': loadingCharges,
      'unloading_charges': unloadingCharges,
      'other_income': otherIncome,
      'advance_received': advanceReceived,
      'status': status.name,
      'notes': notes,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  factory TripModel.fromMap(Map<String, dynamic> map) {
    return TripModel(
      id: map['id'] as String,
      tripNumber: map['trip_number'] as String,
      truckId: map['truck_id'] as String,
      driverId: map['driver_id'] as String,
      customerId: map['customer_id'] as String,
      supplierId: map['supplier_id'] as String?,
      fromLocation: map['from_location'] as String,
      toLocation: map['to_location'] as String,
      tripDate: map['trip_date'] as String,
      expectedDeliveryDate: map['expected_delivery_date'] as String,
      actualDeliveryDate: map['actual_delivery_date'] as String?,
      loadingLocation: map['loading_location'] as String,
      unloadingLocation: map['unloading_location'] as String,
      cargoDescription: map['cargo_description'] as String,
      cargoWeight: (map['cargo_weight'] as num).toDouble(),
      tripRate: (map['trip_rate'] as num).toDouble(),
      loadingCharges: (map['loading_charges'] as num?)?.toDouble() ?? 0.0,
      unloadingCharges: (map['unloading_charges'] as num?)?.toDouble() ?? 0.0,
      otherIncome: (map['other_income'] as num?)?.toDouble() ?? 0.0,
      advanceReceived: (map['advance_received'] as num?)?.toDouble() ?? 0.0,
      status: TripStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => TripStatus.draft,
      ),
      notes: map['notes'] as String?,
      createdAt: map['created_at'] as int,
      updatedAt: map['updated_at'] as int,
    );
  }
}`,
  },
  {
    path: 'lib/features/trucks/domain/models/truck_model.dart',
    name: 'truck_model.dart',
    category: 'models',
    content: `import 'package:uuid/uuid.dart';

enum TruckStatus { available, onTrip, maintenance, inactive }

class TruckModel {
  final String id;
  final String regNumber;
  final String truckType;
  final String make;
  final String model;
  final int year;
  final String color;
  final String chassisNumber;
  final String engineNumber;
  final String purchaseDate;
  final double purchasePrice;
  final int currentMileage;
  final TruckStatus status;
  final String? notes;
  final int createdAt;
  final int updatedAt;

  TruckModel({
    String? id,
    required this.regNumber,
    required this.truckType,
    required this.make,
    required this.model,
    required this.year,
    required this.color,
    required this.chassisNumber,
    required this.engineNumber,
    required this.purchaseDate,
    required this.purchasePrice,
    required this.currentMileage,
    this.status = TruckStatus.available,
    this.notes,
    int? createdAt,
    int? updatedAt,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now().millisecondsSinceEpoch,
        updatedAt = updatedAt ?? DateTime.now().millisecondsSinceEpoch;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'reg_number': regNumber,
      'truck_type': truckType,
      'make': make,
      'model': model,
      'year': year,
      'color': color,
      'chassis_number': chassisNumber,
      'engine_number': engineNumber,
      'purchase_date': purchaseDate,
      'purchase_price': purchasePrice,
      'current_mileage': currentMileage,
      'status': status.name,
      'notes': notes,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  factory TruckModel.fromMap(Map<String, dynamic> map) {
    return TruckModel(
      id: map['id'] as String,
      regNumber: map['reg_number'] as String,
      truckType: map['truck_type'] as String,
      make: map['make'] as String,
      model: map['model'] as String,
      year: map['year'] as int,
      color: map['color'] as String,
      chassisNumber: map['chassis_number'] as String,
      engineNumber: map['engine_number'] as String,
      purchaseDate: map['purchase_date'] as String,
      purchasePrice: (map['purchase_price'] as num).toDouble(),
      currentMileage: map['current_mileage'] as int,
      status: TruckStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => TruckStatus.available,
      ),
      notes: map['notes'] as String?,
      createdAt: map['created_at'] as int,
      updatedAt: map['updated_at'] as int,
    );
  }
}`,
  },
  {
    path: 'lib/features/trucks/data/repositories/truck_repository.dart',
    name: 'truck_repository.dart',
    category: 'repositories',
    content: `import 'package:sqflite/sqflite.dart';
import '../../../../core/database/app_database.dart';
import '../../../../core/database/database_constants.dart';
import '../../domain/models/truck_model.dart';

abstract class ITruckRepository {
  Future<List<TruckModel>> getAllTrucks();
  Future<TruckModel?> getTruckById(String id);
  Future<int> insertTruck(TruckModel truck);
  Future<int> updateTruck(TruckModel truck);
  Future<int> deleteTruck(String id);
  Future<List<TruckModel>> searchTrucks(String query);
}

class TruckRepository implements ITruckRepository {
  final AppDatabase _dbProvider;

  TruckRepository({AppDatabase? dbProvider})
      : _dbProvider = dbProvider ?? AppDatabase.instance;

  @override
  Future<List<TruckModel>> getAllTrucks() async {
    final db = await _dbProvider.database;
    final result = await db.query(
      DatabaseConstants.tableTrucks,
      orderBy: 'created_at DESC',
    );
    return result.map((map) => TruckModel.fromMap(map)).toList();
  }

  @override
  Future<TruckModel?> getTruckById(String id) async {
    final db = await _dbProvider.database;
    final result = await db.query(
      DatabaseConstants.tableTrucks,
      where: 'id = ?',
      whereArgs: [id],
    );
    if (result.isNotEmpty) {
      return TruckModel.fromMap(result.first);
    }
    return null;
  }

  @override
  Future<int> insertTruck(TruckModel truck) async {
    final db = await _dbProvider.database;
    return await db.insert(
      DatabaseConstants.tableTrucks,
      truck.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  @override
  Future<int> updateTruck(TruckModel truck) async {
    final db = await _dbProvider.database;
    return await db.update(
      DatabaseConstants.tableTrucks,
      truck.toMap(),
      where: 'id = ?',
      whereArgs: [truck.id],
    );
  }

  @override
  Future<int> deleteTruck(String id) async {
    final db = await _dbProvider.database;
    return await db.delete(
      DatabaseConstants.tableTrucks,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  @override
  Future<List<TruckModel>> searchTrucks(String query) async {
    final db = await _dbProvider.database;
    final result = await db.query(
      DatabaseConstants.tableTrucks,
      where: 'reg_number LIKE ? OR make LIKE ? OR model LIKE ?',
      whereArgs: ['%$query%', '%$query%', '%$query%'],
    );
    return result.map((map) => TruckModel.fromMap(map)).toList();
  }
}`,
  },
  {
    path: 'lib/data/models/supplier_model.dart',
    name: 'supplier_model.dart',
    category: 'models',
    content: `class SupplierModel {
  final String id;
  final String name;
  final String category; // Fuel Pump, Workshop, Tyre Dealer, Spare Parts, Toll Provider
  final String phone;
  final String? email;
  final String address;
  final double openingBalance;
  final double creditLimit;
  final String? notes;
  final int createdAt;

  const SupplierModel({
    required this.id,
    required this.name,
    required this.category,
    required this.phone,
    this.email,
    required this.address,
    this.openingBalance = 0.0,
    this.creditLimit = 0.0,
    this.notes,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'phone': phone,
      'email': email,
      'address': address,
      'opening_balance': openingBalance,
      'credit_limit': creditLimit,
      'notes': notes,
      'created_at': createdAt,
    };
  }

  factory SupplierModel.fromMap(Map<String, dynamic> map) {
    return SupplierModel(
      id: map['id'] as String,
      name: map['name'] as String,
      category: map['category'] as String,
      phone: map['phone'] as String,
      email: map['email'] as String?,
      address: map['address'] as String,
      openingBalance: (map['opening_balance'] as num?)?.toDouble() ?? 0.0,
      creditLimit: (map['credit_limit'] as num?)?.toDouble() ?? 0.0,
      notes: map['notes'] as String?,
      createdAt: (map['created_at'] as num).toInt(),
    );
  }
}`,
  },
  {
    path: 'lib/data/models/fuel_entry_model.dart',
    name: 'fuel_entry_model.dart',
    category: 'models',
    content: `class FuelEntryModel {
  final String id;
  final String truckId;
  final String? tripId;
  final String? driverId;
  final String? supplierId;
  final String fuelDate;
  final double quantityLiters;
  final double ratePerLiter;
  final double totalCost;
  final double odometerReading;
  final double? previousOdometer;
  final double? kmDriven;
  final double? fuelEfficiencyKmpl;
  final bool isFullTank;
  final String paymentMethod;
  final String? notes;
  final int createdAt;

  const FuelEntryModel({
    required this.id,
    required this.truckId,
    this.tripId,
    this.driverId,
    this.supplierId,
    required this.fuelDate,
    required this.quantityLiters,
    required this.ratePerLiter,
    required this.totalCost,
    required this.odometerReading,
    this.previousOdometer,
    this.kmDriven,
    this.fuelEfficiencyKmpl,
    this.isFullTank = true,
    required this.paymentMethod,
    this.notes,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'truck_id': truckId,
      'trip_id': tripId,
      'driver_id': driverId,
      'supplier_id': supplierId,
      'fuel_date': fuelDate,
      'quantity_liters': quantityLiters,
      'rate_per_liter': ratePerLiter,
      'total_cost': totalCost,
      'odometer_reading': odometerReading,
      'previous_odometer': previousOdometer,
      'km_driven': kmDriven,
      'fuel_efficiency_kmpl': fuelEfficiencyKmpl,
      'is_full_tank': isFullTank ? 1 : 0,
      'payment_method': paymentMethod,
      'notes': notes,
      'created_at': createdAt,
    };
  }

  factory FuelEntryModel.fromMap(Map<String, dynamic> map) {
    return FuelEntryModel(
      id: map['id'] as String,
      truckId: map['truck_id'] as String,
      tripId: map['trip_id'] as String?,
      driverId: map['driver_id'] as String?,
      supplierId: map['supplier_id'] as String?,
      fuelDate: map['fuel_date'] as String,
      quantityLiters: (map['quantity_liters'] as num).toDouble(),
      ratePerLiter: (map['rate_per_liter'] as num).toDouble(),
      totalCost: (map['total_cost'] as num).toDouble(),
      odometerReading: (map['odometer_reading'] as num).toDouble(),
      previousOdometer: (map['previous_odometer'] as num?)?.toDouble(),
      kmDriven: (map['km_driven'] as num?)?.toDouble(),
      fuelEfficiencyKmpl: (map['fuel_efficiency_kmpl'] as num?)?.toDouble(),
      isFullTank: (map['is_full_tank'] as int?) == 1,
      paymentMethod: map['payment_method'] as String? ?? 'Cash',
      notes: map['notes'] as String?,
      createdAt: (map['created_at'] as num).toInt(),
    );
  }
}`,
  },
  {
    path: 'lib/data/models/maintenance_record_model.dart',
    name: 'maintenance_record_model.dart',
    category: 'models',
    content: `class MaintenanceRecordModel {
  final String id;
  final String truckId;
  final String serviceType;
  final String serviceDate;
  final double odometerAtService;
  final double cost;
  final String? supplierId;
  final String? partsReplaced;
  final double? nextServiceOdometer;
  final String? nextServiceDate;
  final String? notes;
  final int createdAt;

  const MaintenanceRecordModel({
    required this.id,
    required this.truckId,
    required this.serviceType,
    required this.serviceDate,
    required this.odometerAtService,
    required this.cost,
    this.supplierId,
    this.partsReplaced,
    this.nextServiceOdometer,
    this.nextServiceDate,
    this.notes,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'truck_id': truckId,
      'service_type': serviceType,
      'service_date': serviceDate,
      'odometer_at_service': odometerAtService,
      'cost': cost,
      'supplier_id': supplierId,
      'parts_replaced': partsReplaced,
      'next_service_odometer': nextServiceOdometer,
      'next_service_date': nextServiceDate,
      'notes': notes,
      'created_at': createdAt,
    };
  }

  factory MaintenanceRecordModel.fromMap(Map<String, dynamic> map) {
    return MaintenanceRecordModel(
      id: map['id'] as String,
      truckId: map['truck_id'] as String,
      serviceType: map['service_type'] as String,
      serviceDate: map['service_date'] as String,
      odometerAtService: (map['odometer_at_service'] as num).toDouble(),
      cost: (map['cost'] as num).toDouble(),
      supplierId: map['supplier_id'] as String?,
      partsReplaced: map['parts_replaced'] as String?,
      nextServiceOdometer: (map['next_service_odometer'] as num?)?.toDouble(),
      nextServiceDate: map['next_service_date'] as String?,
      notes: map['notes'] as String?,
      createdAt: (map['created_at'] as num).toInt(),
    );
  }
}`,
  },
  {
    path: 'lib/services/pdf_invoice_service.dart',
    name: 'pdf_invoice_service.dart',
    category: 'services',
    content: `import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:path_provider/path_provider.dart';
import '../data/models/trip_model.dart';
import '../data/models/customer_model.dart';
import '../data/models/truck_model.dart';
import '../data/models/driver_model.dart';

class PdfInvoiceService {
  static Future<File> generateBiltyReceipt({
    required TripModel trip,
    required TruckModel truck,
    required DriverModel driver,
    required CustomerModel customer,
  }) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Transporter Header
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('TRUCKBOOK LOGISTICS', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                      pw.Text('Nationwide Heavy Transport Fleet & Logistics', style: const pw.TextStyle(fontSize: 10)),
                      pw.Text('Head Office: National Highway N-5, Terminal 4', style: const pw.TextStyle(fontSize: 9)),
                    ],
                  ),
                  pw.Container(
                    padding: const pw.EdgeInsets.all(8),
                    decoration: pw.BoxDecoration(border: pw.Border.all()),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('BILTY / LR NO: \${trip.biltyNumber ?? trip.tripNumber}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Date: \${trip.tripDate}', style: const pw.TextStyle(fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
              pw.SizedBox(height: 16),
              
              // Route & Truck Details
              pw.Container(
                padding: const pw.EdgeInsets.all(8),
                color: PdfColors.grey200,
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Truck: \${truck.regNumber} (\${truck.make})'),
                    pw.Text('Route: \${trip.fromLocation} -> \${trip.toLocation}'),
                    pw.Text('Driver: \${driver.name}'),
                  ],
                ),
              ),
              pw.SizedBox(height: 16),

              // Consignor & Consignee
              pw.Row(
                children: [
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('CONSIGNOR (Shipper):', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text(customer.name),
                        pw.Text(customer.phone),
                        pw.Text(customer.address),
                      ],
                    ),
                  ),
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('CONSIGNEE (Receiver):', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text(customer.name),
                        pw.Text('Location: \${trip.toLocation}'),
                      ],
                    ),
                  ),
                ],
              ),
              pw.SizedBox(height: 24),

              // Cargo Table
              pw.Table.fromTextArray(
                headers: ['Cargo Description', 'Weight (Tons)', 'Freight Rate', 'Total Amount'],
                data: [
                  [trip.cargoDescription, '\${trip.cargoWeight} Tons', 'Rs. \${trip.tripRate}', 'Rs. \${trip.tripRate}'],
                ],
              ),
              pw.SizedBox(height: 16),

              // Financial Settlement
              pw.Align(
                alignment: pw.Alignment.centerRight,
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text('Total Freight: Rs. \${trip.tripRate}'),
                    pw.Text('Advance Paid: Rs. \${trip.advanceReceived}'),
                    pw.Text('Balance Due at Delivery: Rs. \${trip.tripRate - trip.advanceReceived}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ],
                ),
              ),
              pw.Spacer(),

              // Signatures
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('____________________\\nConsignor Signature'),
                  pw.Text('____________________\\nDriver Signature'),
                  pw.Text('____________________\\nConsignee Stamp'),
                ],
              ),
            ],
          );
        },
      ),
    );

    final output = await getTemporaryDirectory();
    final file = File('\${output.path}/bilty_\${trip.id}.pdf');
    await file.writeAsBytes(await pdf.save());
    return file;
  }
}`,
  },
  {
    path: 'lib/services/local_notification_service.dart',
    name: 'local_notification_service.dart',
    category: 'services',
    content: `import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class LocalNotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const InitializationSettings initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);

    await _notificationsPlugin.initialize(initializationSettings);
  }

  static Future<void> showExpiryNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'expiry_alerts_channel',
      'Document & Service Expiry Alerts',
      channelDescription: 'Alerts for truck fitness, insurance, and service due milestones',
      importance: Importance.high,
      priority: Priority.high,
    );

    const NotificationDetails notificationDetails = NotificationDetails(android: androidDetails);
    await _notificationsPlugin.show(id, title, body, notificationDetails);
  }
}`,
  },
];

