"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  X,
  MapPin,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  Menu,
  Search,
  Eye,
  Trash2,
  Plus,
  Settings,
  BarChart3,
  Clock,
  Calendar,
} from "lucide-react";
import { Footer } from "@/components/footer";

/**
 * AdminPanel
 *
 * - Left sidebar with navigation
 * - Pages:
 *   - Shared Rides Requests (table)
 *   - Vehicle Bookings (table)
 *   - Personal Rides (table — hides contact info)
 *   - Add Shared Ride (form) -> also saves to localStorage and calls onAddRide prop
 *   - Add Vehicle (form) -> saves to localStorage and calls onAddVehicle prop
 *   - Rates (your rate editor)
 *
 * NOTE: This is a single-file refactor that reuses most of your original logic.
 */

/* ---------- Types ---------- */
interface RideData {
  id: number;
  bookingId?: string; // optional duplicated readable id
  timeAgo: string;
  postedDate: string | Date;
  frequency: string;
  status?: string; // optional status field: Pending, Confirmed, In Progress, Completed, Cancelled
  driver: {
    name: string;
    image: string;
  };
  vehicle: string;
  pickup: {
    location: string;
    type: string;
  };
  destination: {
    location: string;
    type: string;
  };
  time: string;
  duration: string;
  seats: {
    available: number;
    total: number;
  };
  passengers?: string;
  handCarry?: string;
  price?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  // for private vehicle bookings (vehicle booking records) we will store customer info too
  type?: "shared" | "private" | "personal";
}

interface VehicleData {
  id: number;
  name: string;
  price: string;
  passengers: string;
  handCarry: string;
  image: string;
  features: string[];
  gradient?: string;
  buttonColor?: string;
}

interface AdminPanelProps {
  onBack?: () => void;
  onAddRide?: (ride: RideData) => void;
  onAddVehicle?: (vehicle: VehicleData) => void;
}

/* ---------- Helper utilities ---------- */

const generateBookingId = () =>
  "BK-" + Date.now().toString(36).toUpperCase().slice(-8);

const localKeys = {
  SHARED_RIDES: "admin_shared_rides_v1",
  VEHICLE_BOOKINGS: "admin_vehicle_bookings_v1",
  PERSONAL_RIDES: "admin_personal_rides_v1",
  VEHICLE_CATALOG: "admin_vehicle_catalog_v1",
};

/* ---------- Main component ---------- */

export function AdminPanel({ onBack, onAddRide, onAddVehicle }: AdminPanelProps) {
  // ---- navigation ----
  const pages = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "sharedRequests", label: "Shared Rides", icon: Users },
    { key: "vehicleBookings", label: "Vehicle Bookings", icon: Car },
    { key: "personalRides", label: "Personal Rides", icon: Clock },
    { key: "addSharedRide", label: "Add Ride", icon: Plus },
    { key: "addVehicle", label: "Add Vehicle", icon: Car },
    { key: "manageDates", label: "Manage Dates", icon: Calendar },
    { key: "rates", label: "Rates", icon: Settings },
  ] as const;

  const [activePage, setActivePage] = useState<typeof pages[number]["key"]>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ---- Dialog states ---
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RideData | null>(null);

  // ---- persisted lists (localStorage-backed) ----
  const [sharedRides, setSharedRides] = useState<RideData[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<RideData[]>([]);
  const [personalRides, setPersonalRides] = useState<RideData[]>([]);
  const [vehicleCatalog, setVehicleCatalog] = useState<VehicleData[]>([]);

  // ---- Rate state (reused from your original) ----
  const [ratePerKm, setRatePerKm] = useState("");
  const [rateLKRPerKm, setRateLKRPerKm] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [rateStatus, setRateStatus] = useState("");
  const [currentSavedRate, setCurrentSavedRate] = useState("");
  const [rateError, setRateError] = useState("");

  /* ---------- load persisted data on mount ---------- */
  useEffect(() => {
    try {
      const s = localStorage.getItem(localKeys.SHARED_RIDES);
      const v = localStorage.getItem(localKeys.VEHICLE_BOOKINGS);
      const p = localStorage.getItem(localKeys.PERSONAL_RIDES);
      const vc = localStorage.getItem(localKeys.VEHICLE_CATALOG);

      if (s) setSharedRides(JSON.parse(s));
      if (v) setVehicleBookings(JSON.parse(v));
      if (p) setPersonalRides(JSON.parse(p));
      if (vc) setVehicleCatalog(JSON.parse(vc));

      const savedRate = localStorage.getItem("ratePerKm");
      const savedLKRRate = localStorage.getItem("rateLKRPerKm");
      const savedExchangeRate = localStorage.getItem("exchangeRate");

      if (savedRate) {
        const usdRate = parseFloat(savedRate);
        setRatePerKm(usdRate.toString());
        if (savedLKRRate && savedExchangeRate) {
          setRateLKRPerKm(savedLKRRate);
          setExchangeRate(savedExchangeRate);
          setCurrentSavedRate(`Current Rate: $${usdRate.toFixed(2)} per KM (Rs.${parseFloat(savedLKRRate).toFixed(2)})`);
        } else {
          setCurrentSavedRate(`Current Rate: $${usdRate.toFixed(2)} per KM`);
        }
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    }
  }, []);

  /* ---------- save helpers ---------- */
  const persistSharedRides = (list: RideData[]) => {
    setSharedRides(list);
    localStorage.setItem(localKeys.SHARED_RIDES, JSON.stringify(list));
  };
  const persistVehicleBookings = (list: RideData[]) => {
    setVehicleBookings(list);
    localStorage.setItem(localKeys.VEHICLE_BOOKINGS, JSON.stringify(list));
  };
  const persistPersonalRides = (list: RideData[]) => {
    setPersonalRides(list);
    localStorage.setItem(localKeys.PERSONAL_RIDES, JSON.stringify(list));
  };
  const persistVehicleCatalog = (list: VehicleData[]) => {
    setVehicleCatalog(list);
    localStorage.setItem(localKeys.VEHICLE_CATALOG, JSON.stringify(list));
  };

  /* ---------- small demo seed (if empty) ---------- */
  useEffect(() => {
    if (sharedRides.length === 0) {
      const seed: RideData[] = [
        {
          id: Date.now(),
          bookingId: generateBookingId(),
          timeAgo: "2 min ago",
          postedDate: new Date().toISOString(),
          frequency: "one-time",
          status: "Pending",
          driver: { name: "Alice", image: "/professional-driver-headshot.jpg" },
          vehicle: "Toyota Innova",
          pickup: { location: "Galle", type: "Pickup" },
          destination: { location: "Colombo", type: "Destination" },
          time: "8:00 AM",
          duration: "2h",
          seats: { available: 3, total: 6 },
          passengers: "3",
          handCarry: "2",
          price: "25.00",
          customer: { fullName: "Alice Customer", email: "alice@example.com", phone: "711234567" },
          type: "shared",
        },
      ];
      persistSharedRides(seed);
    }
    if (vehicleCatalog.length === 0) {
      const seedV: VehicleData[] = [
        { id: 1, name: "Toyota Innova", price: "50", passengers: "6", handCarry: "4", image: "/images/toyota-innova.jpg", features: ["A/C", "GPS"], gradient: "bg-gradient-to-br from-blue-400 to-blue-600", buttonColor: "bg-blue-600 hover:bg-blue-700" },
      ];
      persistVehicleCatalog(seedV);
    }
  }, []); // run once

  /* ---------- Shared Ride / Vehicle Add handlers (reuse your original logic) ---------- */
  // For brevity we maintain simplified forms internal to this file but reuse validation spirit.

  // Shared ride form state
  const [rideForm, setRideForm] = useState({
    driverName: "",
    driverImage: "",
    vehicle: "",
    pickupLocation: "",
    destinationLocation: "",
    time: "",
    duration: "",
    passengers: "1",
    luggage: "0",
    handCarry: "0",
    availableSeats: "",
    totalSeats: "",
    price: "",
    frequency: "one-time",
    postedDate: new Date().toISOString().slice(0, 16), // Default to current date/time
  });

  const [rideErrors, setRideErrors] = useState<Record<string, string>>({});
  const [isRideSubmitting, setIsRideSubmitting] = useState(false);

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    price: "",
    passengers: "4",
    luggage: "2",
    handCarry: "2",
    image: "",
    imageFile: null as File | null,
    feature1: "",
    feature2: "",
    feature3: "",
  });
  const [vehicleErrors, setVehicleErrors] = useState<Record<string, string>>({});
  const [isVehicleSubmitting, setIsVehicleSubmitting] = useState(false);

  /* ---------- Validation (kept similar to your original) ---------- */
  const validateRideForm = (form: typeof rideForm) => {
    const errors: Record<string, string> = {};
    if (!form.driverName.trim()) errors.driverName = "Driver name is required";
    if (!form.vehicle.trim()) errors.vehicle = "Vehicle is required";
    if (!form.pickupLocation.trim()) errors.pickupLocation = "Pickup location is required";
    if (!form.destinationLocation.trim()) errors.destinationLocation = "Destination is required";
    if (!form.time) errors.time = "Time is required";
    if (!form.duration.trim()) errors.duration = "Duration is required";
    const availableSeats = Number.parseInt(form.availableSeats || "0");
    const totalSeats = Number.parseInt(form.totalSeats || "0");
    if (isNaN(availableSeats) || availableSeats < 0) errors.availableSeats = "Available seats must be a positive number";
    if (isNaN(totalSeats) || totalSeats < 1) errors.totalSeats = "Total seats must be at least 1";
    if (!isNaN(availableSeats) && !isNaN(totalSeats) && availableSeats > totalSeats) errors.availableSeats = "Available cannot exceed total seats";
    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) errors.price = "Price must be a positive number";
    return errors;
  };

  const validateVehicleForm = (form: typeof vehicleForm) => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Vehicle name is required";
    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) errors.price = "Price must be a positive number";
    if (!form.feature1.trim()) errors.feature1 = "At least one feature is required";
    return errors;
  };

  /* ---------- Add Shared Ride ---------- */
  const handleRideSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const errors = validateRideForm(rideForm);
    setRideErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsRideSubmitting(true);

    setTimeout(() => {
      const newRide: RideData = {
        id: Date.now(),
        bookingId: generateBookingId(),
        timeAgo: "Just now",
        postedDate: new Date(rideForm.postedDate).toISOString(),
        frequency: rideForm.frequency,
        driver: { name: rideForm.driverName.trim(), image: rideForm.driverImage || "/professional-driver-headshot.jpg" },
        vehicle: rideForm.vehicle.trim(),
        pickup: { location: rideForm.pickupLocation.trim(), type: "Pickup point" },
        destination: { location: rideForm.destinationLocation.trim(), type: "Destination" },
        time: rideForm.time,
        duration: rideForm.duration.trim(),
        seats: { available: Number.parseInt(rideForm.availableSeats || "0"), total: Number.parseInt(rideForm.totalSeats || "0") },
        passengers: rideForm.passengers,
        luggage: rideForm.luggage,
        handCarry: rideForm.handCarry,
        price: rideForm.price,
        customer: { fullName: "N/A", email: `user${Date.now()}@example.com`, phone: "N/A" },
        type: "shared",
      };

      // Persist locally
      const updated = [newRide, ...sharedRides];
      persistSharedRides(updated);

      // call prop if given
      onAddRide?.(newRide);

      // reset
      setRideForm({
        driverName: "",
        driverImage: "",
        vehicle: "",
        pickupLocation: "",
        destinationLocation: "",
        time: "",
        duration: "",
        passengers: "1",
        luggage: "0",
        handCarry: "0",
        availableSeats: "",
        totalSeats: "",
        price: "",
        frequency: "one-time",
        postedDate: new Date().toISOString().slice(0, 16),
      });
      setIsRideSubmitting(false);
      setActivePage("sharedRequests");
      setRateStatus("✅ Shared ride added");
      setTimeout(() => setRateStatus(""), 2500);
    }, 600);
  };

  /* ---------- Add Vehicle ---------- */
  const handleVehicleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const errors = validateVehicleForm(vehicleForm);
    setVehicleErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsVehicleSubmitting(true);

    // Handle image file upload if present
    const imagePath = vehicleForm.imageFile
      ? `/images/${vehicleForm.imageFile.name}`
      : vehicleForm.image || "/images/toyota-innova.jpg";

    setTimeout(() => {
      const newVehicle: VehicleData = {
        id: Date.now(),
        name: vehicleForm.name.trim(),
        price: vehicleForm.price,
        passengers: vehicleForm.passengers,
        luggage: vehicleForm.luggage,
        handCarry: vehicleForm.handCarry,
        image: imagePath,
        features: [vehicleForm.feature1, vehicleForm.feature2, vehicleForm.feature3].filter((f) => f.trim()),
        gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
      };
      const updated = [newVehicle, ...vehicleCatalog];
      persistVehicleCatalog(updated);
      onAddVehicle?.(newVehicle);

      setVehicleForm({ name: "", price: "", passengers: "4", handCarry: "2", image: "", imageFile: null, feature1: "", feature2: "", feature3: "" });
      setIsVehicleSubmitting(false);
      setActivePage("vehicleBookings");
      setRateStatus("✅ Vehicle added");
      setTimeout(() => setRateStatus(""), 2500);
    }, 600);
  };

  /* ---------- Create a private vehicle booking record (simulate booking) ---------- */
  const createVehicleBooking = (vehicle: VehicleData) => {
    // Creates a booking with customer fields (simulate)
    const newBooking: RideData = {
      id: Date.now(),
      bookingId: generateBookingId(),
      timeAgo: "Now",
      postedDate: new Date().toISOString(),
      frequency: "one-time",
      driver: { name: "Company Driver", image: "/professional-driver-headshot.jpg" },
      vehicle: vehicle.name,
      pickup: { location: "Unknown", type: "Pickup point" },
      destination: { location: "Unknown", type: "Destination" },
      time: "TBD",
      duration: "TBD",
      seats: { available: 0, total: parseInt(vehicle.passengers || "4") },
      passengers: vehicle.passengers,
      handCarry: vehicle.handCarry,
      price: vehicle.price,
      customer: { fullName: "Private Customer", email: `customer${Date.now()}@example.com`, phone: "77XXXXXXX" },
      type: "private",
    };

    const updated = [newBooking, ...vehicleBookings];
    persistVehicleBookings(updated);
    setActivePage("vehicleBookings");
  };

  /* ---------- Rates logic (same as your original, extracted) ---------- */
  const updateLKRFromUSD = (usdRate: string, exchangeRateValue: string) => {
    if (!usdRate || !exchangeRateValue) return "";
    const usd = parseFloat(usdRate);
    const exchange = parseFloat(exchangeRateValue);
    if (isNaN(usd) || isNaN(exchange) || exchange === 0) return "";
    return (usd * exchange).toFixed(2);
  };

  const updateUSDFromLKR = (lkrRate: string, exchangeRateValue: string) => {
    if (!lkrRate || !exchangeRateValue) return "";
    const lkr = parseFloat(lkrRate);
    const exchange = parseFloat(exchangeRateValue);
    if (isNaN(lkr) || isNaN(exchange) || exchange === 0) return "";
    return (lkr / exchange).toFixed(2);
  };

  const handleUSDRateChange = (usdValue: string) => {
    setRatePerKm(usdValue);
    const exchange = parseFloat(exchangeRate) || 330;
    setRateLKRPerKm(updateLKRFromUSD(usdValue, exchange.toString()));
    setRateError("");
  };

  const handleLKRRRateChange = (lkrValue: string) => {
    setRateLKRPerKm(lkrValue);
    const exchange = parseFloat(exchangeRate) || 330;
    setRatePerKm(updateUSDFromLKR(lkrValue, exchange.toString()));
    setRateError("");
  };

  const handleExchangeRateChange = (exchangeValue: string) => {
    setExchangeRate(exchangeValue);
    const exchange = parseFloat(exchangeValue) || 330;
    setRateLKRPerKm(updateLKRFromUSD(ratePerKm, exchange.toString()));
  };

  const validateRate = (rate: string) => {
    const rateNum = parseFloat(rate);
    if (!rate || isNaN(rateNum) || rateNum <= 0) {
      return "Please enter a valid positive rate per KM";
    }
    return "";
  };

  const saveRate = () => {
    setRateError("");
    const error = validateRate(ratePerKm);
    if (error) {
      setRateError(error);
      return;
    }
    const usdRate = parseFloat(ratePerKm);
    const currentExchangeRate = parseFloat(exchangeRate) || 330;
    const lkrRate = parseFloat(rateLKRPerKm) || usdRate * currentExchangeRate;
    localStorage.setItem("ratePerKm", usdRate.toString());
    localStorage.setItem("rateLKRPerKm", lkrRate.toFixed(2));
    localStorage.setItem("exchangeRate", currentExchangeRate.toString());
    setCurrentSavedRate(`Current Rate: $${usdRate.toFixed(2)} per KM (Rs.${lkrRate.toFixed(2)})`);
    setRateStatus("✅ Rate saved successfully!");
    setTimeout(() => setRateStatus(""), 3000);
  };

  const removeRate = () => {
    localStorage.removeItem("ratePerKm");
    localStorage.removeItem("rateLKRPerKm");
    localStorage.removeItem("exchangeRate");
    setRatePerKm("");
    setRateLKRPerKm("");
    setExchangeRate("");
    setCurrentSavedRate("");
    setRateStatus("❌ Rate removed! Users cannot calculate rates until you set a new one.");
    setTimeout(() => setRateStatus(""), 5000);
  };

  /* ---------- Status update helpers ---------- */
  const updateSharedRideStatus = (id: number, status: string) => {
    const updated = sharedRides.map((ride) => ride.id === id ? { ...ride, status } : ride);
    persistSharedRides(updated);
  };

  const updateVehicleBookingStatus = (id: number, status: string) => {
    const updated = vehicleBookings.map((booking) => booking.id === id ? { ...booking, status } : booking);
    persistVehicleBookings(updated);
  };

  const updatePersonalRideStatus = (id: number, status: string) => {
    const updated = personalRides.map((ride) => ride.id === id ? { ...ride, status } : ride);
    persistPersonalRides(updated);
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-emerald-100 text-emerald-800',
      'Cancelled': 'bg-red-100 text-red-800',
    } as const;

    const badgeClass = statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {status || 'Pending'}
      </span>
    );
  };

  /* ---------- Table components (small, internal) ---------- */

  const SharedRidesTable: React.FC<{
    items: RideData[];
    onDelete?: (id: number) => void;
    onOpen?: (item: RideData) => void;
  }> = ({ items, onDelete, onOpen }) => {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl w-full">
        <CardHeader className="border-b border-slate-200/50">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Shared Rides Requests ({items.length})
            </span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search rides..."
                className="pl-10 bg-slate-50/50 border-slate-200/50 focus:border-blue-300"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Booking ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 min-w-[140px]">Date & Time</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Route</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 hidden lg:table-cell">Seats</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">{it.bookingId}</td>
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex flex-col">
                        <span className="font-medium">{it.postedDate ? new Date(it.postedDate).toLocaleDateString() : "N/A"}</span>
                        <span className="text-xs text-slate-500">{it.postedDate ? new Date(it.postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{it.pickup.location}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                        <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{it.destination.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell text-slate-600">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{it.customer?.email || "N/A"}</div>
                        <div className="text-xs text-slate-500">+94{it.customer?.phone || "N/A"}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <span className="badge bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {it.seats.available}/{it.seats.total}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Select
                        value={it.status || "Pending"}
                        onValueChange={(value) => updateSharedRideStatus(it.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => onOpen?.(it)} className="bg-blue-500 hover:bg-blue-600">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete?.(it.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-slate-300" />
                        <p className="text-slate-500">No shared ride requests found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const VehicleBookingsTable: React.FC<{ items: RideData[]; onDelete?: (id: number) => void; }> = ({ items, onDelete }) => (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl w-full">
      <CardHeader className="border-b border-slate-200/50">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600" />
            Vehicle Bookings ({items.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Booking ID</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Date & Time</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Vehicle</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Price</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">{it.bookingId}</td>
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex flex-col">
                        <span className="font-medium">{it.postedDate ? new Date(it.postedDate).toLocaleDateString() : "N/A"}</span>
                        <span className="text-xs text-slate-500">{it.postedDate ? new Date(it.postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{it.vehicle}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{it.customer?.email || "N/A"}</div>
                        <div className="text-xs text-slate-500">{it.customer?.phone ? `+94${it.customer.phone}` : "N/A"}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{it.price ? `$${it.price}` : "—"}</td>
                    <td className="py-4 px-6">
                      <Select
                        value={it.status || "Pending"}
                        onValueChange={(value) => updateVehicleBookingStatus(it.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => openViewDialog(it)} className="bg-blue-500 hover:bg-blue-600">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete?.(it.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Car className="h-12 w-12 text-slate-300" />
                        <p className="text-slate-500">No vehicle bookings found.</p>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const PersonalRidesTable: React.FC<{ items: RideData[]; onDelete?: (id: number) => void; }> = ({ items, onDelete }) => (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl w-full">
      <CardHeader className="border-b border-slate-200/50">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Personal Rides ({items.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Booking ID</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Date & Time</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Route</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Time</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100 hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 text-slate-600 font-mono text-xs">{it.bookingId}</td>
                  <td className="py-4 px-6 text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-medium">{it.postedDate ? new Date(it.postedDate).toLocaleDateString() : "N/A"}</span>
                      <span className="text-xs text-slate-500">{it.postedDate ? new Date(it.postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{it.pickup.location}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                      <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{it.destination.location}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{it.time}</td>
                  <td className="py-4 px-6">
                    <Select
                      value={it.status || "Pending"}
                      onValueChange={(value) => updatePersonalRideStatus(it.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" onClick={() => openViewDialog(it)} className="bg-blue-500 hover:bg-blue-600">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete?.(it.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="h-12 w-12 text-slate-300" />
                      <p className="text-slate-500">No personal rides found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  /* ---------- Action handlers for tables ---------- */
  const handleDeleteShared = (id: number) => {
    const updated = sharedRides.filter((r) => r.id !== id);
    persistSharedRides(updated);
  };

  const updateRideDate = (rideId: number, newDate: string) => {
    const updated = sharedRides.map((ride) =>
      ride.id === rideId ? { ...ride, postedDate: new Date(newDate).toISOString() } : ride
    );
    persistSharedRides(updated);
  };

  /* ---------- Manage Dates Component ---------- */
  const ManageDateItem: React.FC<{ ride: RideData; onUpdate: (id: number, date: string) => void }> = ({ ride, onUpdate }) => {
    const [editMode, setEditMode] = useState(false);
    const [tempDate, setTempDate] = useState(new Date(ride.postedDate).toISOString().slice(0, 16));

    const handleSave = () => {
      onUpdate(ride.id, tempDate);
      setEditMode(false);
    };

    const handleCancel = () => {
      setTempDate(new Date(ride.postedDate).toISOString().slice(0, 16));
      setEditMode(false);
    };

    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm truncate">{ride.pickup.location}</span>
              <span className="text-gray-500">→</span>
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm truncate">{ride.destination.location}</span>
            </div>
            <p className="text-sm text-gray-600">
              {ride.bookingId} • {ride.driver.name} • {ride.vehicle}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {ride.frequency} • {ride.seats.available}/{ride.seats.total} seats
            </p>
          </div>
          <div className="text-right ml-4">
            {editMode ? (
              <div className="space-y-2">
                <Input
                  type="datetime-local"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-48"
                />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleSave} className="bg-green-500">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {new Date(ride.postedDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(ride.postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                  Edit Date
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const handleDeleteVehicleBooking = (id: number) => {
    const updated = vehicleBookings.filter((r) => r.id !== id);
    persistVehicleBookings(updated);
  };
  const handleDeletePersonal = (id: number) => {
    const updated = personalRides.filter((r) => r.id !== id);
    persistPersonalRides(updated);
  };

  /* ---------- Dialog handlers ---------- */
  const openViewDialog = (item: RideData) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };
  const closeViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedItem(null);
  };

  // Calculate dashboard statistics
  const totalRevenue = useMemo(() => {
    const sharedRevenue = sharedRides.reduce((sum, ride) => sum + parseFloat(ride.price || "0"), 0);
    const bookingRevenue = vehicleBookings.reduce((sum, booking) => sum + parseFloat(booking.price || "0"), 0);
    return sharedRevenue + bookingRevenue;
  }, [sharedRides, vehicleBookings]);

  const handlePageChange = (pageKey: typeof pages[number]["key"]) => {
    setActivePage(pageKey);
    setIsSidebarOpen(false); // Close mobile sidebar after selection
  };

  /* ---------- Render UI ---------- */
//Removed container width constraint and increased table column widths to utilize more screen space.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-full md:max-w-screen-2xl">
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                onClick={() => {
                  // Clear localStorage first before going back
                  localStorage.clear();
                  // Redirect to home page
                  window.location.href = '/';
                  // Call the onBack function to update state
                  onBack();
                }}
                size="sm"
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
            )}
            <span className="text-xs text-slate-600 bg-white/50 px-2 py-1 rounded-full">
              {rateStatus || currentSavedRate}
            </span>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Sidebar */}
          <aside className={`lg:col-span-1 fixed lg:sticky top-6 left-0 w-full max-w-xs lg:max-w-none h-full lg:h-fit z-50 lg:z-auto transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            <div className="bg-white/80 backdrop-blur-lg border border-white/50 rounded-2xl lg:rounded-xl shadow-xl lg:shadow-lg p-6 m-4 lg:m-0 h-[calc(100vh-2rem)] lg:h-fit overflow-y-auto">
              {/* Logo/Header */}
              <div className="hidden lg:flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Admin Panel
                    </h2>
                    <p className="text-xs text-slate-500">Management Dashboard</p>
                  </div>
                </div>
                {/* Back to Home button for desktop */}
                {onBack && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // Clear localStorage first before going back
                      localStorage.clear();
                      // Redirect to home page
                      window.location.href = '/';
                      // Call the onBack function to update state
                      onBack();
                    }}
                    size="sm"
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Home
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {pages.map((p) => {
                  const IconComponent = p.icon;
                  const isActive = activePage === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => handlePageChange(p.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-700 hover:bg-slate-100/50 hover:text-blue-600"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{p.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Footer Info */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="text-xs text-slate-500 text-center">
                  Version 1.0.0
                  <br />
                  © 2025 Taxi Admin
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-5 space-y-6">
            {/* Dashboard */}
            {activePage === "dashboard" && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Revenue Card */}
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                          <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Bookings Card */}
                  <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Total Bookings</p>
                          <p className="text-2xl font-bold text-white">{vehicleBookings.length + sharedRides.length + personalRides.length}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shared Rides Card */}
                  <Card className="bg-gradient-to-br from-purple-500 to-violet-600 border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Shared Rides</p>
                          <p className="text-2xl font-bold text-white">{sharedRides.length}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vehicles Card */}
                  <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Vehicle Fleet</p>
                          <p className="text-2xl font-bold text-white">{vehicleCatalog.length}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <Car className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {[...sharedRides, ...vehicleBookings, ...personalRides]
                        .sort((a, b) => new Date(b.postedDate || 0).getTime() - new Date(a.postedDate || 0).getTime())
                        .slice(0, 5)
                        .map((activity) => (
                          <div key={activity.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-full">
                              {activity.type === "shared" ? (
                                <Users className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Car className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {activity.bookingId} - {activity.vehicle}
                              </p>
                              <p className="text-xs text-slate-500">
                                {activity.pickup.location} → {activity.destination.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">{activity.timeAgo}</p>
                            </div>
                          </div>
                        ))}
                      {sharedRides.length === 0 && vehicleBookings.length === 0 && personalRides.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Shared Requests */}
            {activePage === "sharedRequests" && (
              <>
                <SharedRidesTable items={sharedRides} onDelete={handleDeleteShared} onOpen={openViewDialog} />
              </>
            )}

            {/* Vehicle Bookings */}
            {activePage === "vehicleBookings" && (
              <>
                <VehicleBookingsTable items={vehicleBookings} onDelete={handleDeleteVehicleBooking} />
                <div className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Catalog ({vehicleCatalog.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        {vehicleCatalog.map((v) => (
                          <div key={v.id} className="border rounded p-3">
                            <div className="text-lg font-semibold">{v.name}</div>
                            <div className="text-sm text-gray-600">Passengers: {v.passengers} • Price: ${v.price}</div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" onClick={() => createVehicleBooking(v)}>Create Booking</Button>
                              <Button size="sm" variant="ghost" onClick={() => {
                                const updated = vehicleCatalog.filter(item => item.id !== v.id);
                                persistVehicleCatalog(updated);
                              }}>Remove</Button>
                            </div>
                          </div>
                        ))}
                        {vehicleCatalog.length === 0 && <div className="text-sm text-gray-500">No vehicles in catalog.</div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Personal Rides */}
            {activePage === "personalRides" && (
              <>
                <PersonalRidesTable items={personalRides} onDelete={handleDeletePersonal} />
              </>
            )}

            {/* Add Shared Ride */}
            {activePage === "addSharedRide" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Shared Ride</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleRideSubmit(); }} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Driver Name</label>
                        <Input value={rideForm.driverName} onChange={(e) => setRideForm({ ...rideForm, driverName: e.target.value })} />
                        {rideErrors.driverName && <p className="text-red-500 text-sm">{rideErrors.driverName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Driver Image (URL or upload handled separately)</label>
                        <Input value={rideForm.driverImage} onChange={(e) => setRideForm({ ...rideForm, driverImage: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Vehicle</label>
                      <Input value={rideForm.vehicle} onChange={(e) => setRideForm({ ...rideForm, vehicle: e.target.value })} />
                      {rideErrors.vehicle && <p className="text-red-500 text-sm">{rideErrors.vehicle}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Pickup Location</label>
                        <Input value={rideForm.pickupLocation} onChange={(e) => setRideForm({ ...rideForm, pickupLocation: e.target.value })} />
                        {rideErrors.pickupLocation && <p className="text-red-500 text-sm">{rideErrors.pickupLocation}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Destination Location</label>
                        <Input value={rideForm.destinationLocation} onChange={(e) => setRideForm({ ...rideForm, destinationLocation: e.target.value })} />
                        {rideErrors.destinationLocation && <p className="text-red-500 text-sm">{rideErrors.destinationLocation}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Time</label>
                        <Input value={rideForm.time} onChange={(e) => setRideForm({ ...rideForm, time: e.target.value })} />
                        {rideErrors.time && <p className="text-red-500 text-sm">{rideErrors.time}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Duration</label>
                        <Input value={rideForm.duration} onChange={(e) => setRideForm({ ...rideForm, duration: e.target.value })} />
                        {rideErrors.duration && <p className="text-red-500 text-sm">{rideErrors.duration}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Available Seats</label>
                        <Input value={rideForm.availableSeats} type="number" onChange={(e) => setRideForm({ ...rideForm, availableSeats: e.target.value })} />
                        {rideErrors.availableSeats && <p className="text-red-500 text-sm">{rideErrors.availableSeats}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Total Seats</label>
                        <Input value={rideForm.totalSeats} type="number" onChange={(e) => setRideForm({ ...rideForm, totalSeats: e.target.value })} />
                        {rideErrors.totalSeats && <p className="text-red-500 text-sm">{rideErrors.totalSeats}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Passengers</label>
                        <Input value={rideForm.passengers} onChange={(e) => setRideForm({ ...rideForm, passengers: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Hand Carry</label>
                        <Input value={rideForm.handCarry} onChange={(e) => setRideForm({ ...rideForm, handCarry: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Price</label>
                        <Input value={rideForm.price} onChange={(e) => setRideForm({ ...rideForm, price: e.target.value })} />
                        {rideErrors.price && <p className="text-red-500 text-sm">{rideErrors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Frequency</label>
                        <Select value={rideForm.frequency} onValueChange={(value) => setRideForm({ ...rideForm, frequency: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one-time">One Time</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Posted Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={rideForm.postedDate}
                        onChange={(e) => setRideForm({ ...rideForm, postedDate: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Set when this ride was posted (defaults to now)</p>
                    </div>

                    <div>
                      <Button type="button" onClick={() => handleRideSubmit()} disabled={isRideSubmitting} className="bg-yellow-500 w-full">
                        {isRideSubmitting ? "Adding Ride..." : "Add Shared Ride"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Add Vehicle */}
            {activePage === "addVehicle" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleVehicleSubmit(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Vehicle Name</label>
                      <Input value={vehicleForm.name} onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })} />
                      {vehicleErrors.name && <p className="text-red-500 text-sm">{vehicleErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <Input value={vehicleForm.price} onChange={(e) => setVehicleForm({ ...vehicleForm, price: e.target.value })} />
                      {vehicleErrors.price && <p className="text-red-500 text-sm">{vehicleErrors.price}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Passengers</label>
                        <Input value={vehicleForm.passengers} onChange={(e) => setVehicleForm({ ...vehicleForm, passengers: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Hand Carry</label>
                        <Input value={vehicleForm.handCarry} onChange={(e) => setVehicleForm({ ...vehicleForm, handCarry: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Vehicle Image URL or Upload</label>
                      <Input value={vehicleForm.image} onChange={(e) => setVehicleForm({ ...vehicleForm, image: e.target.value })} />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVehicleForm({ ...vehicleForm, imageFile: file });
                            setVehicleForm({ ...vehicleForm, image: `/images/${file.name}` });
                          }
                        }}
                        className="mt-2"
                      />
                      {vehicleForm.imageFile && (
                        <p className="text-sm text-green-600 mt-1">Selected: {vehicleForm.imageFile.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Features (first is required)</label>
                      <Input value={vehicleForm.feature1} onChange={(e) => setVehicleForm({ ...vehicleForm, feature1: e.target.value })} />
                      {vehicleErrors.feature1 && <p className="text-red-500 text-sm">{vehicleErrors.feature1}</p>}
                      <Input value={vehicleForm.feature2} onChange={(e) => setVehicleForm({ ...vehicleForm, feature2: e.target.value })} />
                      <Input value={vehicleForm.feature3} onChange={(e) => setVehicleForm({ ...vehicleForm, feature3: e.target.value })} />
                    </div>

                    <div>
                      <Button type="button" onClick={() => handleVehicleSubmit()} disabled={isVehicleSubmitting} className="bg-yellow-500 w-full">
                        {isVehicleSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Manage Dates */}
            {activePage === "manageDates" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Dates - Edit Posted Dates for Rides</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    View and edit the posted dates for all shared rides. Changes are saved automatically.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Filter Tabs */}
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Rides ({sharedRides.length})</TabsTrigger>
                        <TabsTrigger value="recent">Recent (Last 7 days)</TabsTrigger>
                        <TabsTrigger value="old">Older (Before 7 days)</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="mt-6">
                        <div className="space-y-4">
                          {sharedRides.map((ride) => (
                            <ManageDateItem key={ride.id} ride={ride} onUpdate={updateRideDate} />
                          ))}
                          {sharedRides.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <Calendar className="mx-auto h-12 w-12 opacity-50" />
                              <p className="mt-2">No rides available to manage dates for.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="recent" className="mt-6">
                        <div className="space-y-4">
                          {sharedRides
                            .filter((ride) => {
                              const rideDate = new Date(ride.postedDate);
                              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                              return rideDate >= sevenDaysAgo;
                            })
                            .map((ride) => (
                              <ManageDateItem key={ride.id} ride={ride} onUpdate={updateRideDate} />
                            ))
                          }
                        </div>
                      </TabsContent>

                      <TabsContent value="old" className="mt-6">
                        <div className="space-y-4">
                          {sharedRides
                            .filter((ride) => {
                              const rideDate = new Date(ride.postedDate);
                              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                              return rideDate < sevenDaysAgo;
                            })
                            .map((ride) => (
                              <ManageDateItem key={ride.id} ride={ride} onUpdate={updateRideDate} />
                            ))
                          }
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rates */}
            {activePage === "rates" && (
              <Card>
                <CardHeader>
                  <CardTitle>🚖 Admin: Set Price per KM</CardTitle>
                  {currentSavedRate && <div className="text-sm text-gray-600 font-medium bg-blue-50 p-2 rounded mt-2">{currentSavedRate}</div>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">USD ↔ LKR Exchange Rate</label>
                      <Input value={exchangeRate} onChange={(e) => handleExchangeRateChange(e.target.value)} placeholder="e.g. 330" />
                      <p className="text-xs text-gray-500 mt-1">Current market rate: ~330 LKR = 1 USD</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rate ($ per KM)</label>
                        <Input value={ratePerKm} onChange={(e) => handleUSDRateChange(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Rate (Rs. per KM)</label>
                        <Input value={rateLKRPerKm} onChange={(e) => handleLKRRRateChange(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveRate} className="flex-1 bg-green-500">💾 Save Rate</Button>
                      {currentSavedRate && <Button onClick={removeRate} className="flex-1 bg-red-500">🗑️ Remove Rate</Button>}
                    </div>

                    {rateError && <p className="text-red-500">{rateError}</p>}
                    {rateStatus && <p className={`text-center font-bold ${rateStatus.includes("✅") ? "text-green-600" : "text-red-600"}`}>{rateStatus}</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <Footer />

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={closeViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedItem?.bookingId}</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                  <p className="text-sm">{selectedItem.bookingId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm capitalize">{selectedItem.type || "N/A"}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Route</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{selectedItem.pickup.location}</span>
                  <span className="text-gray-500">→</span>
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{selectedItem.destination.location}</span>
                </div>
              </div>

              {/* Driver Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Driver</label>
                  <p className="text-sm">{selectedItem.driver.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                  <p className="text-sm">{selectedItem.vehicle}</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <p className="text-sm">{selectedItem.time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-sm">{selectedItem.duration}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <p className="text-sm">{selectedItem.frequency}</p>
                </div>
              </div>

              {/* Capacity */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seats Available</label>
                  <p className="text-sm">{selectedItem.seats.available}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Seats</label>
                  <p className="text-sm">{selectedItem.seats.total}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passengers</label>
                  <p className="text-sm">{selectedItem.passengers || "N/A"}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hand Carry</label>
                  <p className="text-sm">{selectedItem.handCarry || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <p className="text-sm">{selectedItem.price ? `$${selectedItem.price}` : "N/A"}</p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedItem.customer && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Customer Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-sm">{selectedItem.customer.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm">{selectedItem.customer.email || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm">+94{selectedItem.customer.phone || "N/A"}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Posted</label>
                  <p className="text-sm">{selectedItem.postedDate ? new Date(selectedItem.postedDate).toLocaleString() : "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Ago</label>
                  <p className="text-sm">{selectedItem.timeAgo}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
