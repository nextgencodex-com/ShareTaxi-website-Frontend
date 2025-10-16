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
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Users,
  Car,
  DollarSign,
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
  luggage?: string;
  price?: string;
  notes?: string;
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
  luggage?: string;
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
  // Helper to safely extract a location string from either a string or an object like {location: string}
  const formatLocation = (v: unknown) => {
    if (!v && v !== 0) return 'N/A'
    if (typeof v === 'string') return v
    try {
      const rec = v as Record<string, unknown>
      if (rec && typeof rec.location === 'string') return rec.location
      // Fallback to stringify simple objects
      if (typeof rec === 'object') return String((rec.location as unknown) ?? JSON.stringify(rec))
    } catch {
      // ignore and fallback
    }
    return String(v)
  }

  // ---- persisted lists (localStorage-backed) ----
  const [sharedRides, setSharedRides] = useState<RideData[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<RideData[]>([]);
  const [personalRides, setPersonalRides] = useState<RideData[]>([]);
  const [vehicleCatalog, setVehicleCatalog] = useState<VehicleData[]>([]);

  // vehicle bookings API state
  const [vehicleBookingsLoading, setVehicleBookingsLoading] = useState<boolean>(false);
  const [vehicleBookingsError, setVehicleBookingsError] = useState<string | null>(null);

  // helper: convert possible Firestore Timestamp / string / Date-like value to ISO string
  const toISOStringSafe = (v: unknown) => {
    if (typeof v === 'string') return v;
    if (v instanceof Date) return v.toISOString();
    if (v && typeof (v as Record<string, unknown>).toDate === 'function') {
      try {
        return (v as { toDate: () => Date }).toDate().toISOString();
      } catch {
        return new Date().toISOString();
      }
    }
    return new Date().toISOString();
  };

  // helper: format a value into a string suitable for <input type="datetime-local" /> (local timezone)
  const formatToLocalDateTimeInput = (v: unknown) => {
    try {
      let d: Date;
      if (typeof v === 'string' || v instanceof String) d = new Date(String(v));
      else if (v instanceof Date) d = v;
      else if (v && typeof (v as Record<string, unknown>).toDate === 'function') {
        const asRec = v as { toDate?: () => Date };
        d = typeof asRec.toDate === 'function' ? asRec.toDate() : new Date(String(v ?? ''));
      } else d = new Date(String(v ?? ''));

      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => n.toString().padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  // format phone (basic): accepts strings like '2222222222' and returns '222 222 2222' or with +94 if needed
  const formatPhone = (phone?: string | null) => {
    if (!phone) return null;
    const digits = phone.replace(/[^0-9]/g, '');
    // if length looks like local (9-10) assume local and format groups
    if (digits.length === 10) return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
    if (digits.length === 9) return `${digits.slice(0,2)} ${digits.slice(2,5)} ${digits.slice(5)}`;
    return digits;
  };

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

      // Load rates from backend if available
      (async () => {
        try {
          const res = await fetch('http://localhost:5000/api/rates');
          if (!res.ok) throw new Error(`API ${res.status}`);
          const json = await res.json();
          const rates = json?.data?.rates;
          if (rates) {
            setRatePerKm(String(rates.ratePerKm ?? ''));
            setRateLKRPerKm(String(rates.rateLKRPerKm ?? ''));
            setExchangeRate(String(rates.exchangeRate ?? ''));
            setCurrentSavedRate(`Current Rate: $${Number(rates.ratePerKm).toFixed(2)} per KM (Rs.${Number(rates.rateLKRPerKm).toFixed(2)})`);
          }
        } catch {
          // fall back to any stored local values if backend isn't available
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
        }
      })();
    } catch (_e) {
      const err = _e as Error | string | null;
      console.error("Failed to load admin data:", err);
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
    try {
      // allow explicit demo seeding via localStorage flag 'admin_enable_demo' === '1'
      const allowDemoSeed = localStorage.getItem('admin_enable_demo') === '1'
      // if there is no persisted data and demo seeding is allowed, seed defaults
      if (allowDemoSeed && !localStorage.getItem(localKeys.SHARED_RIDES)) {
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
            luggage: "0",
            price: "25.00",
            customer: { fullName: "Alice Customer", email: "alice@example.com", phone: "711234567" },
            type: "shared",
          },
        ];
        persistSharedRides(seed);
      }
      if (allowDemoSeed && !localStorage.getItem(localKeys.VEHICLE_CATALOG)) {
        const seedV: VehicleData[] = [
          { id: 1, name: "Toyota Innova", price: "50", passengers: "6", luggage: "2", handCarry: "4", image: "/images/toyota-innova.jpg", features: ["A/C", "GPS"], gradient: "bg-gradient-to-br from-blue-400 to-blue-600", buttonColor: "bg-blue-600 hover:bg-blue-700" },
        ];
        persistVehicleCatalog(seedV);
      }
    } catch (_e) {
      const err = _e as Error | string | null;
      console.error("Failed to seed admin demo data:", err);
    }
  }, []); // run once

  // Fetch live shared rides from API and map to RideData; keep local storage as fallback
  const [sharedLoading, setSharedLoading] = useState<boolean>(false)
  const [sharedError, setSharedError] = useState<string | null>(null)
  const [personalLoading, setPersonalLoading] = useState<boolean>(false)
  const [personalError, setPersonalError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchShared = async () => {
      setSharedLoading(true)
      setSharedError(null)
      try {
        const res = await fetch("http://localhost:5000/api/shared-rides")
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        const apiRides = json?.data?.rides as unknown
        if (Array.isArray(apiRides) && mounted) {
          const mapped: RideData[] = apiRides.map((raw) => {
            const r = raw as Record<string, unknown>
            const idVal = r.id
            const id = typeof idVal === 'number' ? idVal : Date.now() + Math.floor(Math.random() * 1000)
            const bookingId = typeof idVal === 'string' ? idVal : undefined
            // posted date may come as ISO string or Firestore timestamp-like object; normalize to ISO string
            const postedRaw = r.postedDate ?? r.createdAt ?? r.time;
            let postedDateIso: string;
            if (typeof postedRaw === 'string') postedDateIso = postedRaw;
            else if (postedRaw && typeof postedRaw === 'object') {
              const p = postedRaw as Record<string, unknown>;
              const secs = typeof p._seconds === 'number' ? p._seconds : (typeof p.seconds === 'number' ? p.seconds : undefined);
              postedDateIso = typeof secs === 'number' ? new Date(secs * 1000).toISOString() : new Date().toISOString();
            } else postedDateIso = new Date().toISOString();
            const seatsObj = (r.seats as Record<string, unknown>) || undefined
            const available = typeof r.availableSeats === 'number' ? r.availableSeats : (seatsObj && typeof seatsObj.available === 'number' ? (seatsObj.available as number) : 0)
            const total = typeof r.totalSeats === 'number' ? r.totalSeats : (seatsObj && typeof seatsObj.total === 'number' ? (seatsObj.total as number) : 0)
            const priceVal = typeof r.price === 'number' ? (r.price as number).toFixed(2) : (typeof r.price === 'string' ? r.price : undefined)
            const driverObj = (r.driver as Record<string, unknown>) || undefined
            const pickupObj = (r.pickup as Record<string, unknown>) || undefined
            const destObj = (r.destination as Record<string, unknown>) || undefined

            return {
              id,
              bookingId,
              timeAgo: "just now",
              postedDate: postedDateIso,
              frequency: typeof r.frequency === 'string' ? r.frequency : "one-time",
              status: typeof r.status === 'string' ? r.status : "Pending",
              driver: { name: typeof r.driverName === 'string' ? r.driverName : (driverObj && typeof driverObj.name === 'string' ? (driverObj.name as string) : "Unknown"), image: typeof r.driverImage === 'string' ? r.driverImage : (driverObj && typeof driverObj.image === 'string' ? (driverObj.image as string) : "/professional-driver-headshot.jpg") },
              vehicle: typeof r.vehicle === 'string' ? r.vehicle : "",
              pickup: { location: typeof r.pickupLocation === 'string' ? r.pickupLocation : (pickupObj && typeof pickupObj.location === 'string' ? (pickupObj.location as string) : ""), type: "Pickup point" },
              destination: { location: typeof r.destinationLocation === 'string' ? r.destinationLocation : (destObj && typeof destObj.location === 'string' ? (destObj.location as string) : ""), type: "Destination" },
              // Prefer explicit time string from API (e.g. "12-2 AM"); otherwise derive from postedDate
              time: typeof r.time === 'string' && String(r.time).trim() !== '' ? String(r.time) : new Date(postedDateIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              duration: typeof r.duration === 'string' ? r.duration : "",
              // Preserve rawPayload so the View Details dialog can surface original frontend payload fields
              rawPayload: (r.rawPayload ?? r) as Record<string, unknown>,
              seats: { available, total },
              passengers: typeof r.passengers === 'string' ? r.passengers : String(total || ""),
              handCarry: typeof r.handCarry === 'string' ? r.handCarry : "",
              price: priceVal,
              customer: { fullName: "N/A", email: "N/A", phone: "N/A" },
              type: "shared",
            } as RideData
          })

          // Persist and replace shared rides
          persistSharedRides(mapped)
        }
      } catch (_e) {
        const err = _e as Error | string | null;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Failed to load vehicle bookings from API:', msg);
        if (mounted) setVehicleBookingsError(msg);
      } finally {
        if (mounted) setSharedLoading(false)
      }
    }

    fetchShared()
    return () => { mounted = false }
  }, [])

  // Fetch live private (vehicle) bookings from API and map to RideData; keep local storage as fallback
  useEffect(() => {
    let mounted = true;
    const fetchBookings = async () => {
      setVehicleBookingsLoading(true);
      setVehicleBookingsError(null);
      try {
        const res = await fetch('http://localhost:5000/api/private-rides');
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        const apiRides = json?.data?.rides as unknown;
        if (Array.isArray(apiRides) && mounted) {
          const mapped: RideData[] = apiRides.map((raw) => {
            const r = raw as Record<string, unknown>;
            const idVal = r.id ?? r._id ?? r.bookingId ?? Date.now() + Math.floor(Math.random() * 1000);
            const id = typeof idVal === 'number' ? idVal : Date.now() + Math.floor(Math.random() * 1000);
            const bookingId = typeof r.bookingId === 'string' ? r.bookingId : (typeof r.id === 'string' ? r.id : undefined);
            const posted = r.postedDate ?? r.createdAt ?? r.time ?? new Date().toISOString();
            const postedDate = toISOStringSafe(posted);
            const priceVal = typeof r.price === 'number' ? (r.price as number).toFixed(2) : (typeof r.price === 'string' ? r.price : undefined);
            const customerObj = (r.customer as Record<string, unknown>) || undefined;
            const pickupObj = (r.pickup as Record<string, unknown>) || undefined;
            const destObj = (r.destination as Record<string, unknown>) || undefined;
            const driverObj = (r.driver as Record<string, unknown>) || undefined;
            const seatsObj = (r.seats as Record<string, unknown>) || undefined;

            return {
              id,
              bookingId,
              timeAgo: 'just now',
              postedDate,
              frequency: typeof r.frequency === 'string' ? r.frequency : 'one-time',
              status: typeof r.status === 'string' ? r.status : 'Pending',
              driver: { name: typeof r.driverName === 'string' ? r.driverName : (driverObj && typeof driverObj.name === 'string' ? (driverObj.name as string) : 'Company Driver'), image: driverObj && typeof driverObj.image === 'string' ? (driverObj.image as string) : '/professional-driver-headshot.jpg' },
              vehicle: typeof r.vehicle === 'string' ? r.vehicle : (typeof r.vehicleName === 'string' ? r.vehicleName : ''),
              notes: typeof r.notes === 'string' ? r.notes : (typeof r.notes === 'string' ? r.notes : undefined),
              pickup: { location: typeof r.pickupLocation === 'string' ? r.pickupLocation : (pickupObj && typeof pickupObj.location === 'string' ? (pickupObj.location as string) : ''), type: 'Pickup point' },
              destination: { location: typeof r.destinationLocation === 'string' ? r.destinationLocation : (destObj && typeof destObj.location === 'string' ? (destObj.location as string) : ''), type: 'Destination' },
              time: typeof r.time === 'string' ? r.time : new Date(postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              duration: typeof r.duration === 'string' ? r.duration : '',
              seats: { available: typeof r.availableSeats === 'number' ? (r.availableSeats as number) : (seatsObj && typeof seatsObj.available === 'number' ? (seatsObj.available as number) : 0), total: typeof r.totalSeats === 'number' ? (r.totalSeats as number) : (seatsObj && typeof seatsObj.total === 'number' ? (seatsObj.total as number) : 0) },
              passengers: typeof r.passengers === 'string' ? r.passengers : String((seatsObj && seatsObj.total) || ''),
              handCarry: typeof r.handCarry === 'string' ? r.handCarry : '',
              price: priceVal,
              customer: { fullName: typeof customerObj?.fullName === 'string' ? (customerObj.fullName as string) : (typeof r.customerName === 'string' ? r.customerName : 'Private Customer'), email: typeof customerObj?.email === 'string' ? (customerObj.email as string) : (typeof r.customerEmail === 'string' ? r.customerEmail : 'N/A'), phone: typeof customerObj?.phone === 'string' ? (customerObj.phone as string) : (typeof r.customerPhone === 'string' ? r.customerPhone : 'N/A') },
              type: 'private',
            } as RideData;
          });

          persistVehicleBookings(mapped);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Failed to load vehicle bookings from API:', msg);
        if (mounted) setVehicleBookingsError(msg);
      } finally {
        if (mounted) setVehicleBookingsLoading(false);
      }
    };

    fetchBookings();
    return () => { mounted = false };
  }, []);

  // Fetch personal bookings from API and map to RideData; keep local storage as fallback
  useEffect(() => {
    let mounted = true;
    const fetchPersonal = async () => {
      setPersonalLoading(true);
      setPersonalError(null);
      try {
        const res = await fetch('http://localhost:5000/api/personal-rides');
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        const apiBookings = json?.data?.bookings as unknown;
        if (Array.isArray(apiBookings) && mounted) {
          const mapped: RideData[] = (apiBookings as Record<string, unknown>[]).map((raw) => {
            const r = raw as Record<string, unknown>;
            const idVal = r.id ?? r._id ?? r.bookingId ?? Date.now() + Math.floor(Math.random() * 1000);
            const id = typeof idVal === 'number' ? idVal : Date.now() + Math.floor(Math.random() * 1000);
            const bookingId = typeof r.bookingId === 'string' ? r.bookingId : (typeof r.id === 'string' ? r.id : undefined);
            const posted = r.postedDate ?? r.createdAt ?? r.time ?? new Date().toISOString();
            const postedDate = toISOStringSafe(posted);
            const customerObj = (r.customer as Record<string, unknown>) || undefined;
            const pickupObj = (r.pickup as Record<string, unknown>) || undefined;
            const destObj = (r.destination as Record<string, unknown>) || undefined;
            const driverObj = (r.driver as Record<string, unknown>) || undefined;
            const seatsObj = (r.seats as Record<string, unknown>) || undefined;

            const priceVal = typeof r.price === 'number' ? (r.price as number).toFixed(2) : (typeof r.price === 'string' ? r.price : undefined);

            return {
              id,
              bookingId,
              timeAgo: 'just now',
              postedDate,
              frequency: typeof r.frequency === 'string' ? r.frequency : 'one-time',
              status: typeof r.status === 'string' ? r.status : 'Pending',
              driver: { name: typeof r.driverName === 'string' ? r.driverName : (driverObj && typeof driverObj.name === 'string' ? (driverObj.name as string) : 'Company Driver'), image: driverObj && typeof driverObj.image === 'string' ? (driverObj.image as string) : '/professional-driver-headshot.jpg' },
              vehicle: typeof r.vehicle === 'string' ? r.vehicle : (typeof r.vehicleName === 'string' ? r.vehicleName : ''),
              notes: typeof r.notes === 'string' ? r.notes : undefined,
              pickup: { location: typeof r.pickupLocation === 'string' ? r.pickupLocation : (pickupObj && typeof pickupObj.location === 'string' ? (pickupObj.location as string) : ''), type: 'Pickup point' },
              destination: { location: typeof r.destinationLocation === 'string' ? r.destinationLocation : (destObj && typeof destObj.location === 'string' ? (destObj.location as string) : ''), type: 'Destination' },
              time: typeof r.time === 'string' ? r.time : new Date(postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              duration: typeof r.duration === 'string' ? r.duration : '',
              // Preserve rawPayload so the View Details dialog can surface original frontend payload fields
              rawPayload: (r.rawPayload ?? r) as Record<string, unknown>,
              seats: { available: typeof r.availableSeats === 'number' ? (r.availableSeats as number) : (seatsObj && typeof seatsObj.available === 'number' ? (seatsObj.available as number) : 0), total: typeof r.totalSeats === 'number' ? (r.totalSeats as number) : (seatsObj && typeof seatsObj.total === 'number' ? (seatsObj.total as number) : 0) },
              passengers: typeof r.passengers === 'string' ? r.passengers : String((seatsObj && seatsObj.total) || ''),
              handCarry: typeof r.handCarry === 'string' ? r.handCarry : '',
              price: priceVal,
              customer: { fullName: typeof customerObj?.fullName === 'string' ? (customerObj.fullName as string) : (typeof r.customerName === 'string' ? r.customerName : 'Private Customer'), email: typeof customerObj?.email === 'string' ? (customerObj.email as string) : (typeof r.customerEmail === 'string' ? r.customerEmail : 'N/A'), phone: typeof customerObj?.phone === 'string' ? (customerObj.phone as string) : (typeof r.customerPhone === 'string' ? r.customerPhone : 'N/A') },
              type: 'personal',
            } as RideData;
          });

          persistPersonalRides(mapped);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Failed to load personal bookings from API:', msg);
        if (mounted) setPersonalError(msg);
      } finally {
        if (mounted) setPersonalLoading(false);
      }
    };

    fetchPersonal();
    return () => { mounted = false };
  }, []);

  /* ---------- Shared Ride / Vehicle Add handlers (reuse your original logic) ---------- */
  // For brevity we maintain simplified forms internal to this file but reuse validation spirit.

  // Shared ride form state
  const [rideForm, setRideForm] = useState({
    pickupLocation: "",
    destinationLocation: "",
    rideDate: "",
    pickupTime: "",
    ampm: "AM",
    luggage: "0",
    handCarry: "0",
    availableSeats: "",
    totalSeats: "",
    price: "",
    frequency: "one-time",
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
    if (!form.pickupLocation.trim()) errors.pickupLocation = "Pickup location is required";
    if (!form.destinationLocation.trim()) errors.destinationLocation = "Destination is required";
    if (!form.rideDate) errors.rideDate = "Date is required";
    if (!form.pickupTime) errors.pickupTime = "Pickup time is required";
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
    (async () => {
      // Construct payload for API
      const payload = {
        pickupLocation: rideForm.pickupLocation.trim(),
        destinationLocation: rideForm.destinationLocation.trim(),
        rideDate: rideForm.rideDate,
        pickupTime: rideForm.pickupTime,
        ampm: rideForm.ampm,
        luggage: rideForm.luggage,
        handCarry: rideForm.handCarry,
        availableSeats: Number.parseInt(rideForm.availableSeats || '0'),
        totalSeats: Number.parseInt(rideForm.totalSeats || '0'),
        price: rideForm.price,
        frequency: rideForm.frequency,
        source: 'admin',
      } as Record<string, unknown>;

      try {
        const res = await fetch('http://localhost:5000/api/shared-rides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          // Attempt to map server response into our RideData shape
          const serverRide = json?.data?.ride as Record<string, unknown> | undefined;
          const idVal = serverRide?.id ?? serverRide?._id ?? serverRide?.bookingId ?? Date.now();
          const id = typeof idVal === 'number' ? idVal : Date.now();
          const bookingId = typeof serverRide?.bookingId === 'string' ? serverRide?.bookingId : (typeof idVal === 'string' ? idVal : undefined);

          const persisted: RideData = {
            id,
            bookingId,
            timeAgo: 'Just now',
            postedDate: new Date().toISOString(),
            frequency: rideForm.frequency,
            driver: { name: 'Admin Added', image: '/professional-driver-headshot.jpg' },
            vehicle: 'To be assigned',
            pickup: { location: rideForm.pickupLocation.trim(), type: 'Pickup point' },
            destination: { location: rideForm.destinationLocation.trim(), type: 'Destination' },
            time: `${rideForm.rideDate} ${rideForm.pickupTime} ${rideForm.ampm}`,
            duration: 'TBD',
            seats: { available: Number.parseInt(String(payload.availableSeats || '0')), total: Number.parseInt(String(payload.totalSeats || '0')) },
            passengers: '1',
            luggage: rideForm.luggage,
            handCarry: rideForm.handCarry,
            price: rideForm.price,
            customer: { fullName: 'N/A', email: `user${Date.now()}@example.com`, phone: 'N/A' },
            type: 'shared',
          };

          // Persist the server-provided ride
          persistSharedRides([persisted, ...sharedRides]);
          onAddRide?.(persisted);
        } else {
          // On server error, fallback to local persist
          console.warn('Server failed to create shared ride', res.status);
          const fallback: RideData = {
            id: Date.now(),
            bookingId: generateBookingId(),
            timeAgo: 'Just now',
            postedDate: new Date().toISOString(),
            frequency: rideForm.frequency,
            driver: { name: 'Admin Added', image: '/professional-driver-headshot.jpg' },
            vehicle: 'To be assigned',
            pickup: { location: rideForm.pickupLocation.trim(), type: 'Pickup point' },
            destination: { location: rideForm.destinationLocation.trim(), type: 'Destination' },
            time: `${rideForm.rideDate} ${rideForm.pickupTime} ${rideForm.ampm}`,
            duration: 'TBD',
            seats: { available: Number.parseInt(rideForm.availableSeats || '0'), total: Number.parseInt(rideForm.totalSeats || '0') },
            passengers: '1',
            luggage: rideForm.luggage,
            handCarry: rideForm.handCarry,
            price: rideForm.price,
            customer: { fullName: 'N/A', email: `user${Date.now()}@example.com`, phone: 'N/A' },
            type: 'shared',
          };
          persistSharedRides([fallback, ...sharedRides]);
          onAddRide?.(fallback);
        }
      } catch (err) {
        console.error('Failed to POST shared ride to API:', err);
        // Fallback to local persist
        const fallback: RideData = {
          id: Date.now(),
          bookingId: generateBookingId(),
          timeAgo: 'Just now',
          postedDate: new Date().toISOString(),
          frequency: rideForm.frequency,
          driver: { name: 'Admin Added', image: '/professional-driver-headshot.jpg' },
          vehicle: 'To be assigned',
          pickup: { location: rideForm.pickupLocation.trim(), type: 'Pickup point' },
          destination: { location: rideForm.destinationLocation.trim(), type: 'Destination' },
          time: `${rideForm.rideDate} ${rideForm.pickupTime} ${rideForm.ampm}`,
          duration: 'TBD',
          seats: { available: Number.parseInt(rideForm.availableSeats || '0'), total: Number.parseInt(rideForm.totalSeats || '0') },
          passengers: '1',
          luggage: rideForm.luggage,
          handCarry: rideForm.handCarry,
          price: rideForm.price,
          customer: { fullName: 'N/A', email: `user${Date.now()}@example.com`, phone: 'N/A' },
          type: 'shared',
        };
        persistSharedRides([fallback, ...sharedRides]);
        onAddRide?.(fallback);
      } finally {
        // reset form and UI state
        setRideForm({
          pickupLocation: '',
          destinationLocation: '',
          rideDate: '',
          pickupTime: '',
          ampm: 'AM',
          luggage: '0',
          handCarry: '0',
          availableSeats: '',
          totalSeats: '',
          price: '',
          frequency: 'one-time',
        });
        setIsRideSubmitting(false);
        setActivePage('sharedRequests');
        setRateStatus('✅ Shared ride added');
        setTimeout(() => setRateStatus(''), 2500);
      }
    })();
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

    (async () => {
      try {
        const payload = {
          name: vehicleForm.name.trim(),
          price: vehicleForm.price,
          passengers: vehicleForm.passengers,
          luggage: vehicleForm.luggage,
          handCarry: vehicleForm.handCarry,
          image: imagePath,
          features: [vehicleForm.feature1, vehicleForm.feature2, vehicleForm.feature3].filter((f) => f && f.trim()),
          // visual-only styling is optional for server; include for parity
          gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        } as Record<string, unknown>;

        const res = await fetch('http://localhost:5000/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Server responded ${res.status}: ${txt}`);
        }

        const json = await res.json();
        const serverVehicle = json?.data?.vehicle;

        if (!serverVehicle) {
          throw new Error('Invalid server response when creating vehicle');
        }

        // Update local UI state only (do not persist to localStorage)
        setVehicleCatalog([serverVehicle as VehicleData, ...vehicleCatalog]);
        onAddVehicle?.(serverVehicle as VehicleData);

        setVehicleForm({ name: "", price: "", passengers: "4", luggage: "", handCarry: "2", image: "", imageFile: null, feature1: "", feature2: "", feature3: "" });
        setRateStatus("✅ Vehicle added");
        setTimeout(() => setRateStatus(""), 2500);
        setActivePage("vehicleBookings");
      } catch (err) {
        console.error('Failed to create vehicle on server:', err);
        setRateStatus(`❌ Failed to add vehicle: ${err instanceof Error ? err.message : String(err)}`);
        setTimeout(() => setRateStatus(''), 4000);
      } finally {
        setIsVehicleSubmitting(false);
      }
    })();
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
    // Persist to backend and then update local display
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ratePerKm: usdRate, rateLKRPerKm: lkrRate, exchangeRate: currentExchangeRate }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        const saved = json?.data?.rates;
        if (saved) {
          setRatePerKm(String(saved.ratePerKm ?? ''));
          setRateLKRPerKm(String(saved.rateLKRPerKm ?? ''));
          setExchangeRate(String(saved.exchangeRate ?? ''));
          setCurrentSavedRate(`Current Rate: $${Number(saved.ratePerKm).toFixed(2)} per KM (Rs.${Number(saved.rateLKRPerKm).toFixed(2)})`);
          setRateStatus('✅ Rate saved successfully!');
          setTimeout(() => setRateStatus(''), 3000);
          return;
        }
        throw new Error('Invalid response');
      } catch (err) {
        console.error('Failed to save rate to server, falling back to localStorage:', err);
        localStorage.setItem("ratePerKm", usdRate.toString());
        localStorage.setItem("rateLKRPerKm", lkrRate.toFixed(2));
        localStorage.setItem("exchangeRate", currentExchangeRate.toString());
        setCurrentSavedRate(`Current Rate: $${usdRate.toFixed(2)} per KM (Rs.${lkrRate.toFixed(2)})`);
        setRateStatus("✅ Rate saved locally (server unavailable)");
        setTimeout(() => setRateStatus(""), 3000);
      }
    })();
  };

  const removeRate = () => {
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rates', { method: 'DELETE' });
        if (!res.ok) throw new Error(`API ${res.status}`);
        // clear local UI
        setRatePerKm('');
        setRateLKRPerKm('');
        setExchangeRate('');
        setCurrentSavedRate('');
        setRateStatus('❌ Rate removed');
        setTimeout(() => setRateStatus(''), 3000);
        return;
      } catch (err) {
        console.error('Failed to delete rate on server, clearing local storage as fallback:', err);
        localStorage.removeItem("ratePerKm");
        localStorage.removeItem("rateLKRPerKm");
        localStorage.removeItem("exchangeRate");
        setRatePerKm("");
        setRateLKRPerKm("");
        setExchangeRate("");
        setCurrentSavedRate("");
        setRateStatus("❌ Rate removed locally (server unavailable)");
        setTimeout(() => setRateStatus(""), 3000);
      }
    })();
  };

  /* ---------- Status update helpers ---------- */
  const updateSharedRideStatus = (id: number, status: string) => {
    const ride = sharedRides.find((r) => r.id === id)
    const updated = sharedRides.map((ride) => ride.id === id ? { ...ride, status } : ride);
    // Persist local change optimistically
    persistSharedRides(updated);

    // If the ride maps to a remote API id, attempt to update the remote resource
    const remoteId = ride?.bookingId
    if (remoteId) {
      (async () => {
        try {
          const body = {
            status,
            // Optionally send some useful fields so API can reconcile state
            driverName: ride?.driver?.name,
            vehicle: ride?.vehicle,
            pickupLocation: ride?.pickup?.location,
            destinationLocation: ride?.destination?.location,
          }
          const res = await fetch(`http://localhost:5000/api/shared-rides/${encodeURIComponent(remoteId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(body),
          })
          if (!res.ok) {
            console.warn('Remote update failed', res.status)
            // Optionally: surface an admin notification. For now, log and continue.
          }
        } catch (err) {
          console.error('Failed to update remote shared ride status:', err)
        }
      })()
    }
  };

  const updateVehicleBookingStatus = (id: number, status: string) => {
    // Optimistically update local state
    const previous = vehicleBookings;
    const updated = vehicleBookings.map((booking) => booking.id === id ? { ...booking, status } : booking);
    persistVehicleBookings(updated);

    // If this booking maps to a remote private-ride id, attempt remote update
    const bookingItem = vehicleBookings.find((b) => b.id === id);
    const remoteId = bookingItem?.bookingId;
    if (remoteId) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/private-rides/${encodeURIComponent(remoteId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ status }),
          });

          if (!res.ok) {
            console.warn('Remote status update failed', res.status);
            // revert optimistic change
            persistVehicleBookings(previous);
          }
        } catch (err) {
          console.error('Failed to update remote private ride status:', err);
          // revert optimistic change
          persistVehicleBookings(previous);
        }
      })();
    }
  };

  const updatePersonalRideStatus = (id: number, status: string) => {
    const previous = personalRides;
    const updated = personalRides.map((ride) => ride.id === id ? { ...ride, status } : ride);

    // Optimistically persist the change locally
    persistPersonalRides(updated);

    // Find the ride so we can determine remote id (prefer bookingId)
    const rideItem = personalRides.find((r) => r.id === id);
    const remoteId = rideItem && (rideItem.bookingId || (typeof rideItem.id === 'string' ? rideItem.id : undefined));

    if (!remoteId) return; // nothing to update remotely

    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/personal-rides/${encodeURIComponent(remoteId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (!res.ok) {
          console.warn('Remote personal ride status update failed', res.status);
          // revert optimistic change
          persistPersonalRides(previous);
        }
      } catch (err) {
        console.error('Failed to update remote personal ride status:', err);
        // revert optimistic change
        persistPersonalRides(previous);
      }
    })();
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
              {sharedLoading && <span className="ml-3 text-xs text-slate-500">Loading…</span>}
              {sharedError && <span className="ml-3 text-xs text-red-500">API error</span>}
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
                        {/* Prefer server-provided pickupDate when available; it may be an ISO string or a Firestore Timestamp-like object */}
                        {(() => {
                          const rec = it as unknown as Record<string, unknown>;
                          // Prefer rawPayload.pickupDate (string) first, then top-level pickupDate (timestamp), then postedDate
                          const pdRaw = (rec.rawPayload && (rec.rawPayload as Record<string, unknown>)?.pickupDate) ?? rec.pickupDate ?? rec.postedDate;
                          // normalize Firestore timestamp-like objects
                          let dateObj: Date | null = null;
                          if (typeof pdRaw === 'string') dateObj = new Date(pdRaw);
                          else if (pdRaw && typeof pdRaw === 'object') {
                            const pRec = pdRaw as Record<string, unknown>;
                            const secs = typeof pRec._seconds === 'number' ? pRec._seconds : (typeof pRec.seconds === 'number' ? pRec.seconds : undefined);
                            if (typeof secs === 'number') dateObj = new Date(secs * 1000);
                          } else if (pdRaw instanceof Date) dateObj = pdRaw;
                          // Fallback to postedDate if nothing else
                          if (!dateObj && typeof rec.postedDate === 'string') dateObj = new Date(rec.postedDate as string);

                          const dateStr = dateObj ? dateObj.toLocaleDateString() : 'N/A';
                          // time: prefer explicit ride time field then fallback to pickupDate time
                          const timeStr = (it.time && String(it.time).trim() !== '') ? String(it.time) : (dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                          return (
                            <>
                              <span className="font-medium">{dateStr}</span>
                              <span className="text-xs text-slate-500">{timeStr}</span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{formatLocation(it.pickup)}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                        <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{formatLocation(it.destination)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell text-slate-600">
                      <div className="min-w-0">
                        {(() => {
                          const rec = it as unknown as Record<string, unknown>;
                          const drv = it.driver as unknown as Record<string, unknown> | undefined;
                          const driverName = drv && typeof drv.name === 'string' ? drv.name as string : (typeof rec.driverName === 'string' ? rec.driverName as string : it.customer?.email ?? 'N/A');
                          const driverPhone = it.customer?.phone ? `+94${it.customer.phone}` : (drv && typeof drv.phone === 'string' ? `+94${drv.phone}` : 'N/A');
                          return (
                            <>
                              <div className="truncate font-medium">{driverName}</div>
                              <div className="text-xs text-slate-500">{driverPhone}</div>
                            </>
                          );
                        })()}
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
                      <div className="flex items-center gap-3">
                        {getStatusBadge(it.status)}
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
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
            {vehicleBookingsLoading && <span className="ml-3 text-xs text-slate-500">Loading…</span>}
            {vehicleBookingsError && <span className="ml-3 text-xs text-red-500">API error</span>}
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
                    <td className="py-4 px-6 text-slate-700 font-medium">{it.notes || it.vehicle}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{it.customer?.fullName || it.customer?.email || it.bookingId || "N/A"}</div>
                        <div className="text-xs text-slate-500">{it.customer?.phone ? `+94 ${formatPhone(it.customer.phone) || it.customer.phone}` : "N/A"}</div>
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
            {personalLoading && <span className="ml-3 text-xs text-slate-500">Loading…</span>}
            {personalError && <span className="ml-3 text-xs text-red-500">API error</span>}
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
                      <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{formatLocation(it.pickup)}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                      <span className="text-slate-700 truncate max-w-sm lg:max-w-md">{formatLocation(it.destination)}</span>
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
    const ride = sharedRides.find((r) => r.id === id)
    const updated = sharedRides.filter((r) => r.id !== id);
    // Optimistically remove locally
    persistSharedRides(updated);

    // If the ride has a bookingId that likely maps to the API id, attempt remote delete
    const remoteId = ride?.bookingId
    if (remoteId) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/shared-rides/${encodeURIComponent(remoteId)}`, {
            method: 'DELETE',
          })
          if (!res.ok) {
            console.warn('Remote delete failed', res.status)
            // Optionally: re-add locally or show message. For now, notify in console.
          }
        } catch (err) {
          console.error('Failed to delete remote shared ride:', err)
        }
      })()
    }
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
  const [tempDate, setTempDate] = useState(() => formatToLocalDateTimeInput(ride.postedDate));

  // Keep tempDate in sync when parent updates ride.postedDate
  useEffect(() => {
    setTempDate(formatToLocalDateTimeInput(ride.postedDate));
  }, [ride.postedDate]);

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      // validate tempDate
      if (!tempDate) return;
      let d: Date;
      try {
        d = new Date(tempDate);
        if (isNaN(d.getTime())) return;
      } catch {
        return;
      }

      const iso = d.toISOString();
      setSaving(true);
      try {
        // Prefer bookingId for remote id if present, else use numeric id
        const remoteId = ride.bookingId ?? ride.id;
        const idForUrl = encodeURIComponent(String(remoteId));
        const res = await fetch(`http://localhost:5000/api/shared-rides/${idForUrl}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ postedDate: iso }),
        });

        if (!res.ok) {
          // Remote failed — persist locally as a fallback and log
          console.warn('Remote update failed', res.status);
          onUpdate(ride.id, iso);
        } else {
          // Remote succeeded — update local view. If server returns updated ride, we could merge it.
          onUpdate(ride.id, iso);
        }
      } catch (err) {
        console.error('Failed to update remote shared ride:', err);
        // Fallback to local persist so admin sees the change offline
        onUpdate(ride.id, iso);
      } finally {
        setSaving(false);
        setEditMode(false);
      }
    };

    const handleCancel = () => {
      setTempDate(formatToLocalDateTimeInput(ride.postedDate));
      setEditMode(false);
    };

    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm truncate">{formatLocation(ride.pickup)}</span>
              <span className="text-gray-500">→</span>
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm truncate">{formatLocation(ride.destination)}</span>
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
                  <Button size="sm" onClick={handleSave} className="bg-green-500" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
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
    const booking = vehicleBookings.find((r) => r.id === id);
    const updated = vehicleBookings.filter((r) => r.id !== id);
    // Optimistically remove locally
    persistVehicleBookings(updated);

    // If this booking maps to a remote private-ride id, attempt remote delete
    const remoteId = booking?.bookingId;
    if (remoteId) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/private-rides/${encodeURIComponent(remoteId)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
          });
          if (!res.ok) {
            console.warn('Remote delete failed', res.status);
            // Optionally: re-add locally or show a notification. For now just log.
          }
        } catch (err) {
          console.error('Failed to delete remote private ride:', err);
        }
      })();
    }
  };
  const handleDeletePersonal = (id: number) => {
    const ride = personalRides.find((r) => r.id === id);
    const previous = personalRides;
    const updated = personalRides.filter((r) => r.id !== id);

    // Optimistically remove locally
    persistPersonalRides(updated);

    // Determine remote id: prefer bookingId (string from API) then fallback to id
    const remoteId = (ride && (ride.bookingId || (typeof ride.id === 'string' ? ride.id : undefined))) as string | undefined;
    if (remoteId) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/personal-rides/${encodeURIComponent(remoteId)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
          });
          if (!res.ok) {
            console.warn('Remote personal booking delete failed', res.status);
            // revert optimistic change
            persistPersonalRides(previous);
          }
        } catch (err) {
          console.error('Failed to delete remote personal booking:', err);
          // revert optimistic change
          persistPersonalRides(previous);
        }
      })();
    }
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
                                {formatLocation(activity.pickup)} → {formatLocation(activity.destination)}
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
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <Input
                          type="date"
                          value={rideForm.rideDate}
                          onChange={(e) => setRideForm({ ...rideForm, rideDate: e.target.value })}
                        />
                        {rideErrors.rideDate && <p className="text-red-500 text-sm">{rideErrors.rideDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Pickup Time</label>
                        <div className="flex gap-2">
                          <Select value={rideForm.pickupTime} onValueChange={(value) => setRideForm({ ...rideForm, pickupTime: value })}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12-2">12-2</SelectItem>
                              <SelectItem value="2-4">2-4</SelectItem>
                              <SelectItem value="4-6">4-6</SelectItem>
                              <SelectItem value="6-8">6-8</SelectItem>
                              <SelectItem value="8-10">8-10</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={rideForm.ampm} onValueChange={(value) => setRideForm({ ...rideForm, ampm: value })}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {rideErrors.pickupTime && <p className="text-red-500 text-sm">{rideErrors.pickupTime}</p>}
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

                    <div>
                      <label className="block text-sm font-medium mb-2">Hand Carry</label>
                      <Input value={rideForm.handCarry} onChange={(e) => setRideForm({ ...rideForm, handCarry: e.target.value })} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Price (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            value={rideForm.price} 
                            onChange={(e) => setRideForm({ ...rideForm, price: e.target.value })} 
                            className="pl-8"
                            placeholder="0.00"
                          />
                        </div>
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
                          </SelectContent>
                        </Select>
                      </div>
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

           {/*  Rates */}
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
              {/* normalize fields supporting multiple payload shapes (admin local objects, API bookings, rawPayload) */}
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const item: any = selectedItem as any
                const rp = item.rawPayload || {}
                const bookingId = item.bookingId || item.id || item._id || (rp && rp.id) || 'N/A'
                const type = item.type || item.rideType || rp.rideType || 'N/A'
                const driverName = (item.driver && item.driver.name) || (rp.driver && rp.driver.name) || 'N/A'
                const vehicle = item.vehicle || rp.vehicle || 'N/A'
                const pickupLoc = formatLocation(item.pickup ?? item.pickupLocation ?? rp.pickup ?? rp.pickupLocation)
                const destLoc = formatLocation(item.destination ?? item.destinationLocation ?? rp.destination ?? rp.destinationLocation)
                const time = item.time || rp.time || 'N/A'
                const duration = item.duration || rp.duration || 'N/A'
                const frequency = item.frequency || rp.frequency || 'N/A'
                // Prefer counts from rawPayload (original frontend payload) when available,
                // because item.seats may have been normalized/fallbacked to 0 earlier.
                const seatsAvailable = (rp.seats && typeof rp.seats.available === 'number') ? rp.seats.available : ((item.seats && typeof item.seats.available === 'number') ? item.seats.available : (item.availableSeats ?? 'N/A'))
                const seatsTotal = (rp.seats && typeof rp.seats.total === 'number') ? rp.seats.total : ((item.seats && typeof item.seats.total === 'number') ? item.seats.total : (item.totalSeats ?? 'N/A'))
                const price = (item.price && String(item.price)) || (rp.price && String(rp.price)) || 'N/A'
                const notes = item.notes || rp.notes || item.specialRequests || 'None'

                // created/posted date - support Firestore timestamp shapes
                const createdAtRaw = item.createdAt || item.postedDate || rp.postedDate || rp.createdAt || null
                let createdAtFormatted = 'N/A'
                if (createdAtRaw) {
                  try {
                    if (typeof createdAtRaw === 'object' && (createdAtRaw._seconds || createdAtRaw.seconds)) {
                      const secs = Number(createdAtRaw._seconds ?? createdAtRaw.seconds)
                      createdAtFormatted = new Date(secs * 1000).toLocaleString()
                    } else {
                      createdAtFormatted = new Date(createdAtRaw).toLocaleString()
                    }
                  } catch (err) {
                    console.warn('Failed to format createdAt for admin view dialog', err)
                    createdAtFormatted = String(createdAtRaw)
                  }
                }

                // passenger id and pickup date (from raw payload or item)
                const passengerId = item.passengerId ?? rp.passengerId ?? 'N/A'
                const pickupDateRaw = rp.pickupDate ?? item.pickupDate ?? null
                let pickupDateFormatted = 'N/A'
                if (pickupDateRaw) {
                  try {
                    if (typeof pickupDateRaw === 'string') pickupDateFormatted = new Date(pickupDateRaw).toLocaleString()
                    else if (typeof pickupDateRaw === 'object' && (pickupDateRaw._seconds || pickupDateRaw.seconds)) {
                      const secs = Number(pickupDateRaw._seconds ?? pickupDateRaw.seconds)
                      pickupDateFormatted = new Date(secs * 1000).toLocaleString()
                    } else pickupDateFormatted = String(pickupDateRaw)
                  } catch {
                    pickupDateFormatted = String(pickupDateRaw)
                  }
                }

                return (
                  <>
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                        <p className="text-sm">{bookingId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="text-sm capitalize">{type}</p>
                      </div>
                    </div>

                    {/* Extra identifiers */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Passenger ID</label>
                        <p className="text-sm">{passengerId || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pickup Date</label>
                        <p className="text-sm">{pickupDateFormatted || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Route</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{pickupLoc}</span>
                        <span className="text-gray-500">→</span>
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{destLoc}</span>
                      </div>
                    </div>

                    {/* Driver/Vehicle */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Driver</label>
                        <p className="text-sm">{driverName}</p>
                        {/* show driver contact when available (search multiple potential locations) */}
                        {(() => {
                          const drvFromItem = item.driver || undefined
                          const drvFromRp = rp && rp.driver ? rp.driver : undefined
                          const driverPhone = drvFromItem?.phone || drvFromRp?.phone || item.driverPhone || rp?.personalData?.phone || item.customer?.phone || 'N/A'
                          const driverEmail = drvFromItem?.email || drvFromRp?.email || item.driverEmail || rp?.personalData?.email || item.customer?.email || 'N/A'
                          return (
                            <div className="text-xs text-slate-500 mt-1">
                              <div>📞 {driverPhone !== 'N/A' ? `${driverPhone}` : 'Phone: N/A'}</div>
                              <div>✉️ {driverEmail !== 'N/A' ? driverEmail : 'Email: N/A'}</div>
                            </div>
                          )
                        })()}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                        <p className="text-sm">{vehicle}</p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <p className="text-sm">{time}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <p className="text-sm">{duration}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Frequency</label>
                        <p className="text-sm">{frequency}</p>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Seats Available</label>
                        <p className="text-sm">{seatsAvailable}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Seats</label>
                        <p className="text-sm">{seatsTotal}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <p className="text-sm">{price && price.toString().startsWith('$') ? price : (price !== 'N/A' ? `$${price}` : 'N/A')}</p>
                      </div>
                    </div>

                    {/* Notes / Customer (if present) */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <p className="text-sm">{notes}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Customer</label>
                            {(() => {
                              // Helper: return a non-empty trimmed string or undefined
                              const maybeStr = (val: unknown) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : undefined)

                              // Recursive shallow scanner to find first matching key among targets
                              const findInObj = (obj: unknown, targets: string[], depth = 0): string | undefined => {
                                if (!obj || depth > 4) return undefined
                                if (typeof obj === 'string') return maybeStr(obj)
                                if (typeof obj !== 'object') return undefined
                                try {
                                  for (const key of Object.keys(obj as object)) {
                                    const lower = key.toLowerCase()
                                    // direct match
                                    for (const t of targets) {
                                      if (lower === t.toLowerCase()) {
                                        const val = (obj as Record<string, unknown>)[key]
                                        const s = maybeStr(val)
                                        if (s) return s
                                      }
                                    }
                                  }
                                  // search children
                                  for (const key of Object.keys(obj as object)) {
                                    const child = (obj as Record<string, unknown>)[key]
                                    const res = findInObj(child, targets, depth + 1)
                                    if (res) return res
                                  }
                                } catch {
                                  return undefined
                                }
                                return undefined
                              }

                              // Targets for each field
                              const nameTargets = ['fullname', 'fullName', 'name', 'customername', 'customerName']
                              const emailTargets = ['email', 'customeremail', 'customerEmail']
                              const phoneTargets = ['phone', 'customerphone', 'customerPhone', 'mobile']

                              // Check explicit top-level fields first
                              const explicitName = maybeStr(item?.customer?.fullName) || maybeStr(item?.customerName) || maybeStr(item?.customer?.name)
                              const explicitEmail = maybeStr(item?.customer?.email) || maybeStr(item?.customerEmail)
                              const explicitPhone = maybeStr(item?.customer?.phone) || maybeStr(item?.customerPhone)

                              // Compose search roots: item, rp, rp.rawPayload (if present)
                              const roots = [item, rp, rp && rp.rawPayload, rp && rp.rawPayload && rp.rawPayload.rawPayload]

                              const name = explicitName || roots.map(r => findInObj(r, nameTargets)).find(Boolean) || 'N/A'
                              const email = explicitEmail || roots.map(r => findInObj(r, emailTargets)).find(Boolean) || 'N/A'
                              const phoneRaw = explicitPhone || roots.map(r => findInObj(r, phoneTargets)).find(Boolean) || 'N/A'
                              const formattedPhone = phoneRaw !== 'N/A' ? (formatPhone(String(phoneRaw)) ?? String(phoneRaw)) : 'N/A'

                              if (name === 'N/A' && email === 'N/A' && formattedPhone === 'N/A') {
                                return <p className="text-sm text-gray-500">No customer data available</p>
                              }

                              return (
                                <div>
                                  <p className="text-sm">{name}</p>
                                  {email !== 'N/A' && <p className="text-xs text-gray-500">{email}</p>}
                                  {formattedPhone !== 'N/A' && <p className="text-xs text-gray-500">{formattedPhone}</p>}
                                </div>
                              )
                            })()}
                          </div>
                        </div>

                    {/* Dates */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Posted</label>
                        <p className="text-sm">{createdAtFormatted}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time Ago</label>
                        <p className="text-sm">{item.timeAgo || rp.timeAgo || 'N/A'}</p>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
