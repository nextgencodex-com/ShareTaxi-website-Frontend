"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar as CalendarIcon, ChevronDown, MapPin, ChevronUp, AlertTriangle } from "lucide-react"
import dynamic from 'next/dynamic'
import { BookingDetailsPopup } from "./booking-details-popup"
import { PersonalDetailsPopup } from "./personal-rides/personal-details-popup"
import { useIsMobile } from "@/hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, startOfDay, addDays } from "date-fns"
import { calculateSimpleFare, calculateIndividualFare, getTripMultiplier } from "@/lib/pricing"

const Map = dynamic(() => import('./map'), { ssr: false })

interface Destination {
  id: string
  location: string
}

interface BookingSectionProps {
  onAddSharedRide?: (bookingData: unknown) => void
}

export function BookingSection({ onAddSharedRide }: BookingSectionProps) {
  const isMobile = useIsMobile()
  const [showMapMobile, setShowMapMobile] = useState(false)

  const [tripType, setTripType] = useState("one-way")
  const [rideType, setRideType] = useState("shared")
  const [pickupStart, setPickupStart] = useState("")
  const [pickupEnd, setPickupEnd] = useState("")

  // Helpers to format and compare time values
  const formatTimeForPayload = (value: string) => {
    // expects "HH:MM" (24h) or empty string
    if (!value) return ""
    const [hhStr, mmStr] = value.split(":")
    const hh = parseInt(hhStr || "0", 10)
    const mm = parseInt(mmStr || "0", 10)
    const hour12 = hh % 12 === 0 ? 12 : hh % 12
    return `${hour12}.${mm.toString().padStart(2, '0')}`
  }
  const [passengers, setPassengers] = useState(1)
  // Total seats available in a vehicle (constant)
  const TOTAL_SEATS = 10
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [fromPlace, setFromPlace] = useState<{
    placeId?: string
    lat?: number
    lng?: number
    address?: string
    name?: string
  } | null>(null)
  const [toPlace, setToPlace] = useState<{
    placeId?: string
    lat?: number
    lng?: number
    address?: string
    name?: string
  } | null>(null)
  // default pickup date: tomorrow (local date) in yyyy-MM-dd format
  const _tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const [date, setDate] = useState<string>(_tomorrow)

  const [mapDistance, setMapDistance] = useState<string | null>(null)
  const [mapDuration, setMapDuration] = useState<string | null>(null)

  const [destinations, setDestinations] = useState<Destination[]>([
    { id: '1', location: '' },
    { id: '2', location: '' }
  ])

  const [startingPoint, setStartingPoint] = useState("")

  const [showBookingPopup, setShowBookingPopup] = useState(false)
  const [showPersonalRidesPopup, setShowPersonalRidesPopup] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Fare calculator state for each trip type
  const [oneWayDistance, setOneWayDistance] = useState("")
  const [roundTripDistance, setRoundTripDistance] = useState("")
  const [multiCityDistance, setMultiCityDistance] = useState("")
  const [fareResults, setFareResults] = useState<{ [key: string]: string }>({})
  // backend-provided rate (per km) — prefer this over localStorage
  const [backendRatePerKm, setBackendRatePerKm] = useState<number | null>(null)

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  
  const calculateFareForType = useCallback((tripType: string, distance: number) => {
    if (!distance || distance <= 0) {
      setFareResults(prev => ({ ...prev, [tripType]: "⚠️ Please enter a valid distance." }))
      return
    }

   
    const localRate = parseFloat(localStorage.getItem("ratePerKm") || "0")
    const ratePerKmRaw = typeof backendRatePerKm === 'number' && !isNaN(backendRatePerKm) && backendRatePerKm > 0
      ? backendRatePerKm
      : (localRate > 0 ? localRate : 0)
    
    // Don't calculate if we don't have a valid rate yet
    if (ratePerKmRaw <= 0) {
      const currentRate = localStorage.getItem("ratePerKm")
      const rateInfo = currentRate ? ` (localStorage: ${currentRate})` : ""
      setFareResults(prev => ({ ...prev, [tripType]: `⚠️ No rate configured. Please set a rate in admin panel first.${rateInfo}` }))
      return
    }
    
    const ratePerKm = ratePerKmRaw

    
    const tripMultiplier = getTripMultiplier(tripType as "one-way" | "round-trip" | "multi-city")

    let fareDisplay = ""
    if (rideType === "shared") {
      const basePerPersonFare = calculateSimpleFare(distance, ratePerKm)
      const perPersonFare = basePerPersonFare * tripMultiplier
      const totalFare = perPersonFare * passengers
      fareDisplay = `🚗 Distance: ${distance} km<br>📍 Seats: ${passengers}<br>💰 Per Person: <span style="color:green; font-size: 16px; font-weight: bold;">$${perPersonFare.toFixed(2)}</span><br>💰 Total Price: <span style="color:blue; font-size: 18px; font-weight: bold;">$${totalFare.toFixed(2)}</span>`
      if (tripMultiplier > 1) {
        fareDisplay += `<br>🔄 Return trip: ${tripMultiplier}x multiplier applied`
      }
    } else {
      // Personal ride - distance-based using admin rate per km
      const totalFare = distance * ratePerKm * tripMultiplier
      const formattedDistance = Number.isFinite(distance) ? distance.toFixed(1) : distance
      fareDisplay = `🚗 Distance: ${formattedDistance} km<br>💰 Rate: <span style="color:green; font-size: 16px; font-weight: bold;">$${ratePerKm.toFixed(2)}/km</span><br>💰 Total Price: <span style="color:blue; font-size: 18px; font-weight: bold;">$${totalFare.toFixed(2)}</span>`
      if (tripMultiplier > 1) {
        fareDisplay += `<br>🔄 Return trip: ${tripMultiplier}x multiplier applied`
      }
    }

    setFareResults(prev => ({ ...prev, [tripType]: fareDisplay }))
  }, [rideType, backendRatePerKm, passengers])

  // Function to refresh rates from backend and localStorage
  const refreshRates = useCallback(async () => {
    console.log("🔄 Refreshing rates...")
    // Always seed from any locally saved rate so UI is responsive even if backend is down
    const storedRateStr = localStorage.getItem("ratePerKm")
    const storedRate = storedRateStr ? parseFloat(storedRateStr) : NaN
    console.log("📦 localStorage rate:", storedRateStr, "→", storedRate)
    
    // Clean up invalid rates from localStorage (0 or negative)
    if (!isNaN(storedRate) && storedRate <= 0) {
      console.log("❌ Removing invalid rate from localStorage")
      localStorage.removeItem("ratePerKm")
      setBackendRatePerKm(null)
    }
    
    // Use stored rate immediately if valid
    if (!isNaN(storedRate) && storedRate > 0) {
      console.log("✅ Using localStorage rate:", storedRate)
      setBackendRatePerKm(storedRate)
    }

    try {
      const res = await fetch('http://localhost:5000/api/rates')
      if (!res.ok) throw new Error(`API ${res.status}`)
      const json = await res.json()
      const rates = json?.data?.rates
      console.log("🌐 Backend rates:", rates)

      const nextRatePerKm = typeof rates?.ratePerKm === 'number' && rates.ratePerKm > 0
        ? rates.ratePerKm
        : (!isNaN(storedRate) && storedRate > 0 ? storedRate : null)

      if (typeof nextRatePerKm === 'number' && !isNaN(nextRatePerKm) && nextRatePerKm > 0) {
        console.log("✅ Setting rate to:", nextRatePerKm)
        setBackendRatePerKm(nextRatePerKm)
        // Also update localStorage to keep it in sync
        localStorage.setItem("ratePerKm", nextRatePerKm.toString())
      } else {
        console.log("⚠️ No valid rate available")
      }
    } catch (err) {
      console.log("❌ Failed to fetch rates from backend:", err)
      if (!isNaN(storedRate) && storedRate > 0) {
        setBackendRatePerKm(storedRate)
      }
    }
  }, [])

  // load rates from backend on mount
  useEffect(() => {
    refreshRates()
  }, [refreshRates])

  // Listen for localStorage changes (from admin panel in same or different tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ratePerKm') {
        refreshRates()
      }
    }
    
    // Listen for custom event (same-page updates)
    const handleCustomRateUpdate = () => {
      refreshRates()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('ratesUpdated', handleCustomRateUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('ratesUpdated', handleCustomRateUpdate)
    }
  }, [refreshRates])

  // --- Google Places Autocomplete for the "From" input ---
  // Lightweight typing for the subset of google.maps we use here
  type GoogleMaps = {
    maps: {
      places?: {
        Autocomplete: new (el: Element, opts?: { types?: string[] }) => {
          addListener: (event: string, fn: () => void) => void
          getPlace: () => { formatted_address?: string; name?: string }
        }
      }
      event?: {
        clearInstanceListeners: (obj: unknown) => void
      }
    }
  }
  const loadGoogleMapsScript = (apiKey?: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const existing = ((window as unknown) as Record<string, unknown>)["google"];
        if (existing && (existing as Record<string, unknown>)["maps"]) {
          const maps = (existing as Record<string, unknown>)["maps"] as Record<string, unknown> | undefined;
          if (maps && (maps as Record<string, unknown>)["places"]) {
            resolve();
            return;
          }
        }

        if (!apiKey) {
          reject(new Error("Missing Google Maps API key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)"));
          return;
        }

        const scriptId = "google-maps-places-script";
        if (document.getElementById(scriptId)) {
          // Wait until the script has initialized google.maps.places
          const waitFor = () => {
            const g = ((window as unknown) as Record<string, unknown>)["google"] as Record<string, unknown> | undefined;
            if (g && (g as Record<string, unknown>)["maps"] && ((g as Record<string, unknown>)["maps"] as Record<string, unknown>)["places"]) {
              resolve();
            } else {
              setTimeout(waitFor, 100);
            }
          };
          waitFor();
          return;
        }

        const s = document.createElement("script");
        s.id = scriptId;
        s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = (err) => reject(err);
        document.head.appendChild(s);
      } catch (err) {
        reject(err);
      }
    });
  };

  useEffect(() => {
    let mounted = true;
    let autocompleteFrom: unknown | null = null;
    let autocompleteTo: unknown | null = null;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    loadGoogleMapsScript(apiKey as string | undefined)
      .then(() => {
        if (!mounted) return;
        try {
          const g = ((window as unknown) as Record<string, unknown>)["google"] as unknown as GoogleMaps | undefined;
          const maps = g && (g.maps as GoogleMaps["maps"] | undefined);
          const places = maps && maps.places;
          if (!places) return;

          const elFrom = document.getElementById("from") as HTMLInputElement | null;
          const elTo = document.getElementById("to") as HTMLInputElement | null;
          if (!elFrom && !elTo) return;

          if (elFrom) {
            // @ts-expect-error - runtime google maps types
            autocompleteFrom = new g!.maps.places.Autocomplete(elFrom, { types: ["geocode"] });
            // @ts-expect-error - runtime listener provided by google maps
            autocompleteFrom.addListener("place_changed", () => {
              try {
                // @ts-expect-error - runtime type from Google Maps
                const place = autocompleteFrom.getPlace();
                if (place) {
                  const addr = typeof place.formatted_address === "string" && place.formatted_address.trim()
                    ? place.formatted_address
                    : typeof place.name === "string"
                    ? place.name
                    : ""
                  if (addr) setFrom(addr)

                  // extract place details if available
                  try {
                    const placeTyped = place as unknown as { geometry?: { location?: { lat: () => number; lng: () => number } }; place_id?: string; formatted_address?: string; name?: string }
                    const loc = placeTyped.geometry && placeTyped.geometry.location
                    const lat = loc ? loc.lat() : undefined
                    const lng = loc ? loc.lng() : undefined
                    setFromPlace({
                      placeId: (placeTyped.place_id as string) || undefined,
                      lat,
                      lng,
                      address: (placeTyped.formatted_address as string) || undefined,
                      name: (placeTyped.name as string) || undefined,
                    })
                  } catch {
                    // ignore geometry extraction errors
                  }
                }
              } catch {
                // ignore
              }
            });
          }

          if (elTo) {
            // @ts-expect-error - runtime google maps types
            autocompleteTo = new g!.maps.places.Autocomplete(elTo, { types: ["geocode"] });
            // @ts-expect-error - runtime listener provided by google maps
            autocompleteTo.addListener("place_changed", () => {
              try {
                // @ts-expect-error - runtime type from Google Maps
                const place = autocompleteTo.getPlace();
                if (place) {
                  const addr = typeof place.formatted_address === "string" && place.formatted_address.trim()
                    ? place.formatted_address
                    : typeof place.name === "string"
                    ? place.name
                    : ""
                  if (addr) setTo(addr)

                  try {
                    const placeTyped = place as unknown as { geometry?: { location?: { lat: () => number; lng: () => number } }; place_id?: string; formatted_address?: string; name?: string }
                    const loc = placeTyped.geometry && placeTyped.geometry.location
                    const lat = loc ? loc.lat() : undefined
                    const lng = loc ? loc.lng() : undefined
                    setToPlace({
                      placeId: (placeTyped.place_id as string) || undefined,
                      lat,
                      lng,
                      address: (placeTyped.formatted_address as string) || undefined,
                      name: (placeTyped.name as string) || undefined,
                    })
                  } catch {
                    // ignore geometry extraction errors
                  }
                }
              } catch {
                // ignore
              }
            });
          }
        } catch {
          // ignore initialization errors
        }
      })
      .catch(() => {
        // If API key missing or script failed, we silently continue without autocomplete
      });

    return () => {
      mounted = false;
      try {
        const g = ((window as unknown) as Record<string, unknown>)["google"] as unknown as GoogleMaps | undefined;
        if (g && g.maps && g.maps.event) {
          if (autocompleteFrom) {
            g.maps.event.clearInstanceListeners(autocompleteFrom);
          }
          if (autocompleteTo) {
            g.maps.event.clearInstanceListeners(autocompleteTo);
          }
        }
      } catch {
        // ignore
      }
    };
  }, []);


  useEffect(() => {
    // prefer backend rate when available, otherwise fall back to localStorage
    const effectiveRate = typeof backendRatePerKm === 'number' && !isNaN(backendRatePerKm)
      ? backendRatePerKm
      : parseFloat(localStorage.getItem("ratePerKm") || "0")
    if (!effectiveRate) return

    let distance = 0
    if (tripType === "round-trip" && roundTripDistance) {
      distance = parseFloat(roundTripDistance)
    } else if (tripType === "one-way" && oneWayDistance) {
      distance = parseFloat(oneWayDistance)
    } else if (tripType === "multi-city" && multiCityDistance) {
      distance = parseFloat(multiCityDistance)
    } else if (mapDistance) {
      distance = parseFloat(mapDistance)
    }

    if (distance > 0) {
      calculateFareForType(tripType, distance)
    }
  }, [tripType, rideType, mapDistance, oneWayDistance, roundTripDistance, multiCityDistance, calculateFareForType, backendRatePerKm])

  // helper states removed: selectedTimeSlot, customTime
  // helper functions for dynamically adding/removing destinations and passenger change
  // were unused in this component and removed to keep the bundle lean.

  const handleDistanceChange = (distance: string | null, duration: string | null) => {
    setMapDistance(distance)
    setMapDuration(duration)
    
    // Auto-calculate fare when distance changes from map
    if (distance && parseFloat(distance) > 0) {
      calculateFareForType(tripType, parseFloat(distance))
    }
  }

  // Validation functions
  const validateBookingData = () => {
    const errors: string[] = []
    const currentFare = fareResults[tripType]
  // calculate today start only when needed via startOfDay below

    // Location validations
    if (tripType === 'multi-city') {
      if (!startingPoint.trim()) {
        errors.push("Starting point is required for multi-city trips")
      }
      const validDestinations = destinations.filter(dest =>
        dest.location && dest.location.trim().length > 0
      )
      if (validDestinations.length < 2) {
        errors.push("At least 2 destinations are required for multi-city trips")
      }
    } else {
      if (!from.trim()) {
        errors.push("Pickup location (From) is required")
      }
      if (!to.trim()) {
        errors.push("Destination (To) is required")
      }
    }

    // Date validation
    if (!date || date.trim() === "") {
      errors.push("Pickup date is required")
    } else {
      const selectedDate = parseISO(date)
      const todayStart = startOfDay(new Date())
      if (selectedDate < todayStart) {
        errors.push("Pickup date must be today or in the future")
      }
      // Max 1 year ahead
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      if (selectedDate > oneYearFromNow) {
        errors.push("Pickup date cannot be more than 1 year in the future")
      }
    }

    // Time validation (start/end)
    if (!pickupStart || !pickupEnd) {
      errors.push("Pickup start and end times are required")
    } else {
      // compare minutes
      const toMinutes = (t: string) => {
        const [hh, mm] = t.split(":").map(s => parseInt(s || "0", 10))
        return (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm)
      }
      if (toMinutes(pickupEnd) <= toMinutes(pickupStart)) {
        errors.push("Pickup end time must be after start time")
      }
    }

    // Fare calculation validation
  // currentFare intentionally not used here
    if (!currentFare || currentFare.includes("⚠️")) {
      errors.push("Please calculate the fare before proceeding")
    }

    // Passenger validation (already handled by min/max in onChange)
    if (passengers < 1 || passengers > TOTAL_SEATS) {
      errors.push(`Number of passengers must be between 1 and ${TOTAL_SEATS}`)
    }

    return errors
  }

  const handleNextClick = () => {
    setHasAttemptedSubmit(true)
    const errors = validateBookingData()

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])

    // Get the calculated fare for current trip type
  const currentFare = fareResults[tripType]
  
  // For personal rides, show the personal rides popup first to review fare
  // For shared rides, show booking details popup directly
  if (rideType === "personal") {
    setShowPersonalRidesPopup(true)
  } else {
    setShowBookingPopup(true)
  }

    // Prepare booking payload to send to backend if onAddSharedRide not provided
    const bookingPayload = {
      from: tripType === 'multi-city' ? startingPoint : from,
      to,
      rideType,
      date,
      time: `${formatTimeForPayload(pickupStart)} - ${formatTimeForPayload(pickupEnd)}`,
      passengers,
      tripType,
      destinations: tripType === 'multi-city' ? destinations : undefined,
      startingPoint: tripType === 'multi-city' ? startingPoint : undefined,
      mapDistance,
      mapDuration,
  calculatedFare: currentFare,
  fromPlace: fromPlace || undefined,
  toPlace: toPlace || undefined,
    }

    // If a parent provided onAddSharedRide, prefer that (keeps existing behavior)
    if (onAddSharedRide && typeof onAddSharedRide === 'function') {
      try {
        onAddSharedRide(bookingPayload)
      } catch (err) {
        console.error('onAddSharedRide handler threw an error', err)
      }
      return
    }

    // Default behavior: POST to backend endpoints
  const endpoint = rideType === 'shared' ? 'http://localhost:5000/api/shared-rides' : 'http://localhost:5000/api/private-rides'
    ;(async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        })

        if (!res.ok) {
          const text = await res.text()
          console.error(`Failed to create booking: ${res.status} ${text}`)
          // Optionally show a validation/error state here
        } else {
          const data = await res.json()
          console.info('Booking created on server', data)
          // Optionally dispatch an event to inform other components
          try {
            window.dispatchEvent(new CustomEvent('rideBooked', { detail: data }))
          } catch {
            // ignore in non-browser environments
          }
        }
      } catch (err) {
        console.error('Error posting booking to server', err)
      }
    })()
  }

  // Clear validation errors when user starts fixing them
  const clearValidationErrors = () => {
    if (hasAttemptedSubmit) {
      setValidationErrors([])
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    setTripType("one-way")
    setRideType("shared")
    setPickupStart("")
    setPickupEnd("")
    setPassengers(1)
    setFrom("")
    setTo("")
  setFromPlace(null)
  setToPlace(null)
  setDate(_tomorrow)
    setMapDistance(null)
    setMapDuration(null)
    setDestinations([
      { id: '1', location: '' },
      { id: '2', location: '' }
    ])
    setStartingPoint("")
    setOneWayDistance("")
    setRoundTripDistance("")
    setMultiCityDistance("")
    setFareResults({})
    setValidationErrors([])
    setHasAttemptedSubmit(false)
  }


  return (
    <>
      <section id="booking-section" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-balance mb-4">Book Your Taxi with Ease</h2>
            <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
              Simple booking process with real-time tracking and instant confirmation. Choose your pickup location and
              we&apos;ll handle the rest.
            </p>
          </div>

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Please fix the following errors:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 space-y-8">
              <Card className={`border-gray-200 shadow-lg transition-colors duration-300 ${rideType === "personal" ? "bg-yellow-50" : "bg-white"}`}>
                <CardContent className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="w-16 h-0.5 bg-gray-300"></div>
                      <div className="w-4 h-4 border-2 border-blue-500 bg-white rounded-full"></div>
                      <div className="w-16 h-0.5 bg-gray-300"></div>
                      <div className="w-4 h-4 border-2 border-blue-500 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={tripType === "one-way" ? "default" : "ghost"}
                      size="sm"
                      className={
                        tripType === "one-way"
                          ? "bg-blue-500 text-white hover:bg-blue-600 w-24 mx-auto"
                          : "text-gray-600 hover:text-gray-800 w-24 mx-auto"
                      }
                      onClick={() => setTripType("one-way")}
                    >
                      One Way
                    </Button>
                
                    {/*
                    <Button
                      variant={tripType === "round-trip" ? "default" : "ghost"}
                      size="sm"
                      className={
                        tripType === "round-trip"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }
                      onClick={() => setTripType("round-trip")}
                    >
                      Return Trip
                    </Button>
                    */}
                  
                    {/*
                    <Button
                      variant={tripType === "multi-city" ? "default" : "ghost"}
                      size="sm"
                      className={
                        tripType === "multi-city"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }
                      onClick={() => setTripType("multi-city")}
                    >
                      Multi-City
                    </Button>
                    */}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Ride Details</h3>
                      
                      {/* Elegant Ride Type Selection Buttons */}
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={rideType === "shared" ? "default" : "outline"}
                          onClick={() => setRideType("shared")}
                          className={`flex-1 h-12 text-base font-medium transition-all duration-300 ${
                            rideType === "shared"
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                              : "bg-white hover:bg-blue-50 text-gray-700 border-2 border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          <span className="mr-2">🚗</span>
                          Shared Ride
                        </Button>
                        <Button
                          type="button"
                          variant={rideType === "personal" ? "default" : "outline"}
                          onClick={() => setRideType("personal")}
                          className={`flex-1 h-12 text-base font-medium transition-all duration-300 ${
                            rideType === "personal"
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
                              : "bg-white hover:bg-yellow-50 text-gray-700 border-2 border-gray-300 hover:border-yellow-400"
                          }`}
                        >
                          <span className="mr-2">👤</span>
                          Personal Ride
                        </Button>
                      </div>
                    </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="from" className="text-gray-700 font-medium">
                            From
                          </Label>
                          <Input
                            id="from"
                            value={from}
                            onChange={(e) => {
                              setFrom(e.target.value)
                              clearValidationErrors()
                            }}
                            className="bg-blue-50 border-blue-200 text-gray-800 placeholder:text-gray-500 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="to" className="text-gray-700 font-medium">
                            To
                          </Label>
                          <Input
                            id="to"
                            value={to}
                            onChange={(e) => {
                              setTo(e.target.value)
                              clearValidationErrors()
                            }}
                            className="bg-blue-50 border-blue-200 text-gray-800 placeholder:text-gray-500 h-12"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup-date" className="text-gray-700 font-medium">
                          Pickup Date
                        </Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <Input
                                id="pickup-date"
                                type="text"
                                // Display a friendly formatted date but keep `date` state in ISO yyyy-MM-dd
                                value={date ? format(parseISO(date), "PPP") : ""}
                                // Prevent manual typing to keep canonical ISO date format; open calendar instead
                                onChange={() => { /* read-only - use calendar picker */ }}
                                readOnly
                                className="bg-blue-50 border-blue-200 text-gray-800 h-12 cursor-pointer"
                                placeholder="Select a date"
                              />
                              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 cursor-pointer" onClick={() => setCalendarOpen(true)} />
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date ? parseISO(date) : undefined}
                              onSelect={(selectedDate) => {
                                if (selectedDate) {
                                  setDate(format(selectedDate, 'yyyy-MM-dd'))
                                }
                                setCalendarOpen(false)
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Pickup Time</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="time"
                              value={pickupStart}
                              onChange={(e) => setPickupStart(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 pr-10 h-12"
                              aria-label="Pickup start time"
                            />
                          </div>
                          <div className="relative flex-1">
                            <Input
                              type="time"
                              value={pickupEnd}
                              onChange={(e) => setPickupEnd(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 pr-10 h-12"
                              aria-label="Pickup end time"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Enter start and end time (will be saved as e.g. 12.30 - 2.00)</p>
                      </div>
                      
                      {rideType === "shared" ? (
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Seats to Book</Label>
                          <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-2 h-12">
                            <button
                              type="button"
                              onClick={() => setPassengers(Math.max(1, passengers - 1))}
                              disabled={passengers <= 1}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-semibold text-gray-900">
                              {passengers}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPassengers(Math.min(TOTAL_SEATS, passengers + 1))}
                              disabled={passengers >= TOTAL_SEATS}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">Available seats: <span className="font-semibold">{Math.max(0, TOTAL_SEATS - passengers)}/{TOTAL_SEATS}</span></p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Vehicle Information</Label>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Available Seats:</span> <span className="font-bold text-blue-600">{TOTAL_SEATS}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Full vehicle at your service</p>
                          </div>
                        </div>
                      )}

                      {/* Fare Calculator for One-Way/Round-Trip - MOBILE RESPONSIVE FIX */}
                      <div className="space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg border">
                        <h4 className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                          <span className="text-lg"> Per-person price</span> 
                        </h4>
                        <div className="flex gap-2">
                          {/*<Input
                            type="number"
                            placeholder={"Distance (km) e.g. 40"}
                            value={tripType === "round-trip" ? roundTripDistance : oneWayDistance}
                            onChange={(e) =>
                              tripType === "round-trip"
                                ? setRoundTripDistance(e.target.value)
                                : setOneWayDistance(e.target.value)
                            }
                            className="bg-white"
                          />
                          {/* <Button
                            type="button"
                            onClick={() => {
                              const distanceKey = tripType === "round-trip" ? roundTripDistance : oneWayDistance;
                              calculateFareForType(tripType, parseFloat(distanceKey));
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4"
                          >
                            Calculate
                          </Button> */}
                        </div>
                        {(fareResults["one-way"] || fareResults["round-trip"]) && (
                          <div className="p-2 sm:p-3 bg-white border rounded text-xs sm:text-sm">
                            <div className="space-y-1.5 sm:space-y-2 break-words">
                              {fareResults[tripType]?.split('<br>').map((line, idx) => (
                                <div
                                  key={idx}
                                  dangerouslySetInnerHTML={{ __html: line }}
                                  className="break-words"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                  <Button
                    onClick={handleNextClick}
                    disabled={!(fareResults[tripType] && !fareResults[tripType].includes("⚠️"))}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3 text-base sm:text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {!fareResults[tripType] || fareResults[tripType].includes("⚠️") ? "Continue Ride →" : "Next →"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Map - Always Visible */}
            {!isMobile && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Map</h3>
                    <p className="text-muted-foreground text-sm">Track available rides in real-time</p>
                  </div>
                  <div className="h-[500px] relative">
                    <Map from={from} to={to} onDistanceChange={handleDistanceChange} key={`${from}-${to}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                  </div>
                  {mapDistance && mapDuration && (
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-b-xl p-6">
                      <div className="text-center text-lg font-semibold text-muted-foreground">
                        {mapDistance} • {mapDuration}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            </div>

            {/* Mobile Toggle Button */}
            {isMobile && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowMapMobile(!showMapMobile)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <MapPin className="h-5 w-5" />
                  <span>{showMapMobile ? 'Hide Map' : 'Show Map'}</span>
                  {showMapMobile ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Hidden Map for Mobile - Calculates distance in background */}
            {isMobile && !showMapMobile && from && to && (
              <div className="hidden">
                <Map from={from} to={to} onDistanceChange={handleDistanceChange} key={`hidden-${from}-${to}`} />
              </div>
            )}

            {/* Mobile Map - Show When Toggled */}
            {isMobile && showMapMobile && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden transition-all duration-500 ease-in-out">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Map</h3>
                    <p className="text-muted-foreground text-sm">Track available rides in real-time</p>
                  </div>
                  <div className="h-[400px] relative">
                    <Map from={from} to={to} onDistanceChange={handleDistanceChange} key={`mobile-${from}-${to}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                  </div>
                  {mapDistance && mapDuration && (
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-b-xl p-6">
                      <div className="text-center text-lg font-semibold text-muted-foreground">
                        {mapDistance} • {mapDuration}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Integrated fare calculators moved into each trip type section */}
          </div>
        </div>
      </section>

      <BookingDetailsPopup
        isOpen={showBookingPopup}
        onClose={() => {
          setShowBookingPopup(false)
          resetForm()
        }}
        onAddSharedRide={onAddSharedRide}
        bookingData={showBookingPopup ? {
          from: tripType === 'multi-city' ? startingPoint : from,
          to,
          rideType,
          date,
          time: `${formatTimeForPayload(pickupStart)} - ${formatTimeForPayload(pickupEnd)}`,
          passengers,
          tripType,
          destinations: tripType === 'multi-city' ? destinations : undefined,
          startingPoint: tripType === 'multi-city' ? startingPoint : undefined,
          mapDistance,
          mapDuration,
          calculatedFare: fareResults[tripType],
        } : null}
      />

      <PersonalDetailsPopup
        isOpen={showPersonalRidesPopup}
        onClose={() => {
          setShowPersonalRidesPopup(false)
          resetForm()
        }}
        bookingData={showPersonalRidesPopup ? {
          from: tripType === 'multi-city' ? startingPoint : from,
          to,
          rideType: "personal",
          date,
          time: `${formatTimeForPayload(pickupStart)} - ${formatTimeForPayload(pickupEnd)}`,
          passengers,
          tripType,
          destinations: tripType === 'multi-city' ? destinations : undefined,
          startingPoint: tripType === 'multi-city' ? startingPoint : undefined,
          mapDistance,
          mapDuration,
          calculatedFare: fareResults[tripType],
        } : null}
      />
    </>
  )
}