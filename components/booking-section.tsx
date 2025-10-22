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
  const [pickupTime, setPickupTime] = useState("")
  const [pickupAmPm, setPickupAmPm] = useState("AM")
  const [passengers, setPassengers] = useState(1)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
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

  // Auto-calculate fare when relevant values change
  // calculateFareForType is declared below; move its declaration up so effect can reference it
  const calculateFareForType = useCallback((tripType: string, distance: number) => {
    if (!distance || distance <= 0) {
      setFareResults(prev => ({ ...prev, [tripType]: "⚠️ Please enter a valid distance." }))
      return
    }

    // Prefer backend rate if available, otherwise fall back to localStorage
    const ratePerKm = typeof backendRatePerKm === 'number' && !isNaN(backendRatePerKm)
      ? backendRatePerKm
      : parseFloat(localStorage.getItem("ratePerKm") || "0")

    // Apply trip multiplier for return trips and other trip types
    const tripMultiplier = getTripMultiplier(tripType as "one-way" | "round-trip" | "multi-city")

    let fareDisplay = ""
    if (rideType === "shared") {
      const basePerPersonFare = calculateSimpleFare(distance, ratePerKm)
      const perPersonFare = basePerPersonFare * tripMultiplier
      fareDisplay = `🚗 Distance: ${distance} km<br>💲 Rate: $${ratePerKm.toFixed(2)} per km<br>👥 Per Person Fare: <span style="color:green;">$${perPersonFare.toFixed(2)}</span>`
      if (tripMultiplier > 1) {
        fareDisplay += `<br>🔄 Return trip: ${tripMultiplier}x multiplier applied`
      }
    } else {
      const baseFullFare = calculateIndividualFare(distance, ratePerKm)
      const fullFare = baseFullFare * tripMultiplier
      fareDisplay = `🚗 Distance: ${distance} km<br>💲 Rate: $${ratePerKm.toFixed(2)} per km<br>💰 Total Fare: <span style="color:blue;">$${fullFare.toFixed(2)}</span>`
      if (tripMultiplier > 1) {
        fareDisplay += `<br>🔄 Return trip: ${tripMultiplier}x multiplier applied`
      }
    }

    setFareResults(prev => ({ ...prev, [tripType]: fareDisplay }))
  }, [rideType, backendRatePerKm])

  // load rates from backend on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('https://taxi-backend-x5w6.onrender.com/api/rates')
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        const rates = json?.data?.rates
        if (mounted && rates && typeof rates.ratePerKm === 'number') {
          setBackendRatePerKm(rates.ratePerKm)
        }
      } catch {
        // ignore - we'll use localStorage fallback
      }
    })()
    return () => { mounted = false }
  }, [])

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

    // Time validation
    if (!pickupTime) {
      errors.push("Pickup time selection is required")
    }

    // Fare calculation validation
  // currentFare intentionally not used here
    if (!currentFare || currentFare.includes("⚠️")) {
      errors.push("Please calculate the fare before proceeding")
    }

    // Passenger validation (already handled by min/max in onChange)
    if (passengers < 1 || passengers > 20) {
      errors.push("Number of passengers must be between 1 and 20")
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
  setShowBookingPopup(true)

    // Prepare booking payload to send to backend if onAddSharedRide not provided
    const bookingPayload = {
      from: tripType === 'multi-city' ? startingPoint : from,
      to,
      rideType,
      date,
      time: `${pickupTime} ${pickupAmPm}`,
      passengers,
      tripType,
      destinations: tripType === 'multi-city' ? destinations : undefined,
      startingPoint: tripType === 'multi-city' ? startingPoint : undefined,
      mapDistance,
      mapDuration,
  calculatedFare: currentFare,
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
  const endpoint = rideType === 'shared' ? 'https://taxi-backend-x5w6.onrender.com/api/shared-rides' : 'https://taxi-backend-x5w6.onrender.com/api/private-rides'
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
    setPickupTime("")
    setPickupAmPm("AM")
    setPassengers(1)
    setFrom("")
    setTo("")
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
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardContent className="p-8">
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
                    <h3 className="text-lg font-semibold text-gray-800">Tour Details</h3>
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
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="shared"
                            name="rideType"
                            value="shared"
                            checked={rideType === "shared"}
                            onChange={(e) => setRideType(e.target.value)}
                            className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                          />
                          <Label htmlFor="shared" className="text-gray-700 font-medium">
                            Shared
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="personal"
                            name="rideType"
                            value="personal"
                            checked={rideType === "personal"}
                            onChange={(e) => setRideType(e.target.value)}
                            className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                          />
                          <Label htmlFor="personal" className="text-gray-700 font-medium">
                            Personal
                          </Label>
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
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <select
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-10 h-12"
                            >
                              <option value="">Select time slot</option>
                              <option value="12-2">12-2</option>
                              <option value="2-4">2-4</option>
                              <option value="4-6">4-6</option>
                              <option value="6-8">6-8</option>
                              <option value="8-10">8-10</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                          </div>
                          <div className="relative">
                            <select
                              value={pickupAmPm}
                              onChange={(e) => setPickupAmPm(e.target.value)}
                              className="w-20 p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-8 h-12"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Fare Calculator for One-Way/Round-Trip */}
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                        <h4 className="flex items-center gap-2 font-semibold">
                          <span className="text-lg">📍</span> Fare Calculator
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
                          <div
                            className="p-2 bg-white border rounded text-sm"
                            dangerouslySetInnerHTML={{
                              __html: fareResults[tripType] || ""
                            }}
                          />
                        )}
                      </div>

                    </div>

                  <Button
                    onClick={handleNextClick}
                    disabled={!(fareResults[tripType] && !fareResults[tripType].includes("⚠️"))}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {!fareResults[tripType] || fareResults[tripType].includes("⚠️") ? "Calculate Fare First →" : "Next →"}
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
                    <Map from={from} to={to} onDistanceChange={handleDistanceChange} />
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

            {/* Mobile Map - Show When Toggled */}
            {isMobile && showMapMobile && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden transition-all duration-500 ease-in-out">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Map</h3>
                    <p className="text-muted-foreground text-sm">Track available rides in real-time</p>
                  </div>
                  <div className="h-[400px] relative">
                    <Map from={from} to={to} onDistanceChange={handleDistanceChange} />
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
          time: `${pickupTime} ${pickupAmPm}`,
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
