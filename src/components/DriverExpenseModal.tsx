import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Camera,
  Upload,
  Fuel,
  Receipt,
  CheckCircle2,
  DollarSign,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Expense,
  ExpenseCategory,
  Trip,
  Truck as TruckType,
  User,
  ExpenseStatus,
} from '../types';

interface Props {
  isOpen: boolean;
  currentUser: User;
  trips: Trip[];
  trucks: TruckType[];
  initialTripId?: string;
  onClose: () => void;
  onSubmitExpense: (expense: Partial<Expense>) => void;
}

const SAMPLE_RECEIPT_PRESETS = [
  {
    label: 'Diesel Fuel Slip',
    url: 'https://images.unsplash.com/photo-1554415707-9e49016a3505?w=600&auto=format&fit=crop&q=80',
    category: 'Fuel' as ExpenseCategory,
  },
  {
    label: 'Motorway Toll Slip',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    category: 'Toll' as ExpenseCategory,
  },
  {
    label: 'Roadside Repair Bill',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    category: 'Maintenance' as ExpenseCategory,
  },
];

export const DriverExpenseModal: React.FC<Props> = ({
  isOpen,
  currentUser,
  trips,
  trucks,
  initialTripId,
  onClose,
  onSubmitExpense,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [amount, setAmount] = useState<number | ''>('');
  const [tripId, setTripId] = useState<string>(initialTripId || '');
  const [truckId, setTruckId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Other'>('Cash');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');

  // Fuel specific telemetry
  const [fuelStation, setFuelStation] = useState('PSO Motorway Service Station');
  const [liters, setLiters] = useState<number | ''>(100);
  const [pricePerLiter, setPricePerLiter] = useState<number | ''>(300);
  const [odometerReading, setOdometerReading] = useState<number | ''>(148200);

  useEffect(() => {
    if (initialTripId) {
      setTripId(initialTripId);
      const trip = trips.find((t) => t.id === initialTripId);
      if (trip) setTruckId(trip.truckId);
    } else if (trips.length > 0 && !tripId) {
      const activeTrip = trips.find((t) => t.status === 'In Progress') || trips[0];
      setTripId(activeTrip.id);
      setTruckId(activeTrip.truckId);
    }
  }, [initialTripId, trips]);

  // Auto calculate fuel total
  useEffect(() => {
    if (category === 'Fuel' && liters && pricePerLiter) {
      setAmount(Number(liters) * Number(pricePerLiter));
    }
  }, [category, liters, pricePerLiter]);

  if (!isOpen) return null;

  const handleTripChange = (newTripId: string) => {
    setTripId(newTripId);
    const trip = trips.find((t) => t.id === newTripId);
    if (trip) setTruckId(trip.truckId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const isDriver = currentUser.role === 'Driver';
    const status: ExpenseStatus = isDriver ? 'Pending' : 'Approved';

    const newExpense: Partial<Expense> = {
      id: `exp_${Date.now()}`,
      tripId: tripId || undefined,
      truckId: truckId || undefined,
      driverId: currentUser.driverId,
      userId: currentUser.id,
      category,
      amount: Number(amount),
      date,
      paymentMethod,
      description: description.trim() || `${category} expense reported by ${currentUser.name}`,
      receiptUrl: receiptUrl || undefined,
      status,
      approvedBy: isDriver ? undefined : `${currentUser.name} (${currentUser.role})`,
      approvedAt: isDriver ? undefined : Date.now(),
      fuelStation: category === 'Fuel' ? fuelStation : undefined,
      liters: category === 'Fuel' && liters ? Number(liters) : undefined,
      pricePerLiter: category === 'Fuel' && pricePerLiter ? Number(pricePerLiter) : undefined,
      odometerReading: category === 'Fuel' && odometerReading ? Number(odometerReading) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSubmitExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {currentUser.role === 'Driver' ? 'Submit Driver Expense' : 'Record Fleet Expense'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {currentUser.role === 'Driver' ? 'Pending Admin / Manager Verification' : 'Direct Ledger Entry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {currentUser.role === 'Driver' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Expenses submitted by drivers are queued as <strong>Pending Approval</strong> and forwarded to the office dashboard for review.
              </p>
            </div>
          )}

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Expense Category</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  'Fuel',
                  'Toll',
                  'Food',
                  'Maintenance',
                  'Parking',
                  'Police',
                  'Loading',
                  'Driver Advance',
                ] as ExpenseCategory[]
              ).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (cat === 'Fuel' && !receiptUrl) {
                      setReceiptUrl(SAMPLE_RECEIPT_PRESETS[0].url);
                    }
                  }}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold text-center transition border ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="text-xs font-bold text-slate-400 absolute left-3 top-2.5">Rs</span>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Trip Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Related Trip</label>
            <select
              value={tripId}
              onChange={(e) => handleTripChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">-- General Fleet Expense (No Trip) --</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tripNumber} ({t.fromLocation} → {t.toLocation}) • {t.status}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Specific Fields */}
          {category === 'Fuel' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                <Fuel className="w-4 h-4 text-amber-600" />
                <span>Fuel Slip Details</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  Pump / Fuel Station Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. PSO Sadiqabad Bypass Pump"
                  value={fuelStation}
                  onChange={(e) => setFuelStation(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Liters</label>
                  <input
                    type="number"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Rate / L</label>
                  <input
                    type="number"
                    value={pricePerLiter}
                    onChange={(e) =>
                      setPricePerLiter(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Odometer (km)</label>
                  <input
                    type="number"
                    value={odometerReading}
                    onChange={(e) =>
                      setOdometerReading(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Receipt Upload & Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt / Slip Photo
            </label>

            {receiptUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-100 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={receiptUrl}
                    alt="Receipt preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Receipt Attached</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Ready for submission</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptUrl('')}
                  className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/40">
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Take Photo or Upload Slip</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Instant Preset Buttons for quick demo testing */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    Presets:
                  </span>
                  {SAMPLE_RECEIPT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setReceiptUrl(preset.url)}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] font-semibold text-slate-600 whitespace-nowrap transition flex items-center gap-1"
                    >
                      <ImageIcon className="w-2.5 h-2.5 text-blue-500" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. En-route meal with helper at Sukkur bypass dhabba"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {currentUser.role === 'Driver' ? 'Submit for Office Approval' : 'Save Expense Entry'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
