"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Users, MapPin, X, CreditCard, Share2, ChevronDown, ArrowLeft } from "lucide-react"
import { JoinRidePopup } from "./join-ride-popup"
import { BookingDetailsPopup } from "./booking-details-popup"
import { calculateTotalPrice, formatPriceUSD } from "@/lib/pricing"
import { buildApiUrl } from "@/lib/api-url"

const DEFAULT_SHARED_DISTANCE = 45; // km
const DEFAULT_PASSENGERS_FOR_CALC = 6; // for medium vehicle

const sharedRides = [
  {
    id: 1,
    timeAgo: "10 min ago",
    driver: {
      name: "Alex Chen",
      image: "/images/alex-chen-driver.jpg",
    },
    vehicle: "Toyota Alphard",
    pickup: {
      location: "Downtown Plaza",
      type: "Pickup point",
    },
    destination: {
      location: "Airport Terminal 1",
      type: "Destination",
    },
    time: "02-04 pm",
    duration: "45 min",
    seats: {
      available: 3,
      total: 6,
    },
    distanceKm: DEFAULT_SHARED_DISTANCE,
    price: formatPriceUSD(Math.round(calculateTotalPrice(DEFAULT_SHARED_DISTANCE, DEFAULT_PASSENGERS_FOR_CALC, DEFAULT_PASSENGERS_FOR_CALC, "one-way") / DEFAULT_PASSENGERS_FOR_CALC)),
  },
  {
    id: 2,
    timeAgo: "10 min ago",
    driver: {
      name: "Alex Chen",
      image: "/images/alex-chen-driver.jpg",
    },
    vehicle: "Toyota Alphard",
    pickup: {
      location: "Downtown Plaza",
      type: "Pickup point",
    },
    destination: {
      location: "Airport Terminal 1",
      type: "Destination",
    },
    time: "02-04 pm",
    duration: "45 min",
    seats: {
      available: 3,
      total: 6,
    },
    distanceKm: DEFAULT_SHARED_DISTANCE,
    price: formatPriceUSD(Math.round(calculateTotalPrice(DEFAULT_SHARED_DISTANCE, DEFAULT_PASSENGERS_FOR_CALC, DEFAULT_PASSENGERS_FOR_CALC, "one-way") / DEFAULT_PASSENGERS_FOR_CALC)),
  },
  {
    id: 3,
    timeAgo: "10 min ago",
    driver: {
      name: "Alex Chen",
      image: "/images/alex-chen-driver.jpg",
    },
    vehicle: "Toyota Alphard",
    pickup: {
      location: "Downtown Plaza",
      type: "Pickup point",
    },
    destination: {
      location: "Airport Terminal 1",
      type: "Destination",
    },
    time: "02-04 pm",
    duration: "45 min",
    seats: {
      available: 3,
      total: 6,
    },
    distanceKm: DEFAULT_SHARED_DISTANCE,
    price: formatPriceUSD(Math.round(calculateTotalPrice(DEFAULT_SHARED_DISTANCE, DEFAULT_PASSENGERS_FOR_CALC, DEFAULT_PASSENGERS_FOR_CALC, "one-way") / DEFAULT_PASSENGERS_FOR_CALC)),
  },
]

interface SharedRidesPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function SharedRidesPopup({ isOpen, onClose }: SharedRidesPopupProps) {
  const [isJoinRideOpen, setIsJoinRideOpen] = useState(false)
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false)
  const [selectedRide, setSelectedRide] = useState<RideData | null>(null)
  const [rides, setRides] = useState<Array<Record<string, unknown>>>([])

  // Local RideData shape (matches JoinRidePopup's expected type)
  interface RideData {
    id: number
    driver: { name: string; image: string }
    vehicle: string
    pickup: { location: string; type: string }
    destination: { location: string; type: string }
    time: string
    duration: string
    seats: { available: number; total: number }
    price: string
    distanceKm?: number
  }

  const toRideData = (rr: Record<string, unknown>): RideData => {
    const pickup = rr['pickup'] as Record<string, unknown> | undefined
    const destination = rr['destination'] as Record<string, unknown> | undefined
    const seats = rr['seats'] as Record<string, unknown> | undefined
    return {
      id: Number(rr['id'] ?? Date.now()),
      driver: {
        name: String((rr['driver'] && (rr['driver'] as Record<string, unknown>)['name']) ?? rr['driverName'] ?? 'Driver'),
        image: String((rr['driver'] && (rr['driver'] as Record<string, unknown>)['image']) ?? rr['driverImage'] ?? '/professional-driver-headshot.jpg')
      },
      vehicle: String(rr['vehicle'] ?? rr['vehicleName'] ?? 'Assigned Vehicle'),
      pickup: { location: String((pickup && pickup['location']) ?? rr['pickupLocation'] ?? 'Unknown'), type: String((pickup && pickup['type']) ?? 'Pickup point') },
      destination: { location: String((destination && destination['location']) ?? rr['destinationLocation'] ?? 'Unknown'), type: String((destination && destination['type']) ?? 'Destination') },
      time: String(rr['time'] ?? rr['timeAgo'] ?? ''),
      duration: String(rr['duration'] ?? '45 min'),
      seats: { available: Number((seats && seats['available']) ?? rr['availableSeats'] ?? 0), total: Number((seats && seats['total']) ?? rr['totalSeats'] ?? 1) },
      price: String(rr['price'] ?? '$0.00'),
      distanceKm: rr['distanceKm'] ? Number(rr['distanceKm']) : undefined
    }
  }

  // Booking form state
  const [tripType, setTripType] = useState("one-way")
  const [rideType, setRideType] = useState("shared")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [passengers, setPassengers] = useState(1)
  const [from, setFrom] = useState("Downtown Plaza")
  const [to, setTo] = useState("Airport Terminal 1")
  const [date, setDate] = useState("2025-09-20")
  const [customTime, setCustomTime] = useState("")

  const handlePassengerChange = (change: number) => {
    setPassengers((prev) => Math.max(1, Math.min(20, prev + change))); // Allow up to 20 passengers for large bookings
  }

  useEffect(() => {
    let mounted = true
    const fetchRides = async () => {
      try {
        console.log('Fetching shared rides from API...')
          const res = await fetch(buildApiUrl("/shared-rides"), { 
            cache: 'no-store', headers: { 'Accept': 'application/json' } })
        if (!res.ok) return
        const json = await res.json()
        if (!mounted) return
        // normalize pickupDate if Firestore Timestamps are present
        const list = (json.rides || json || []) as Array<Record<string, unknown>>
        const normalized = list.map((r) => {
          const raw = r as Record<string, unknown>
          const pd = raw['pickupDate'] ?? raw['pickup_date'] ?? (raw['rawPayload'] && (raw['rawPayload'] as Record<string, unknown>)['pickupDate'])
          let pickupDateStr = ''
          if (pd) {
            if (typeof pd === 'string') pickupDateStr = pd
            else if (typeof pd === 'object' && pd !== null) {
              const secs = (pd as Record<string, unknown>)['_seconds'] ?? (pd as Record<string, unknown>)['seconds']
              if (typeof secs === 'number') pickupDateStr = new Date(secs * 1000).toISOString().split('T')[0]
            }
          }
          return { ...raw, pickupDateStr }
        })
        setRides(normalized)
      } catch (err) {
        // ignore errors for now
        console.error('Failed to fetch shared rides', err)
      }
    }

  fetchRides()

    return () => { mounted = false }
  }, [])

  if (!isOpen) return null


  const handleCloseJoinRide = () => {
    setIsJoinRideOpen(false)
    setSelectedRide(null)
  }

  const handleCloseBookingDetails = () => {
    setIsBookingDetailsOpen(false)
    setSelectedRide(null)
    // reset selection state
  }

  const timeSlots = [
    "6 - 8 am", "8 - 10 am", "10 - 12 pm", "12 - 2 pm", "2 - 4 pm",
    "4 - 6 pm", "6 - 8 pm", "8 - 10 pm", "10 - 12 am"
  ]

  const calculatedPriceForShare = formatPriceUSD(
    Math.round(
      calculateTotalPrice(
        DEFAULT_SHARED_DISTANCE,
        passengers,
        passengers,
        (tripType as "one-way" | "round-trip" | "multi-city")
      )
    )
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Available Shared Rides</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Ride Summary */}
              <div className="bg-yellow-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ride Summary</h3>

                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Downtown Plaza</p>
                      <p className="text-gray-600 text-sm">Pickup point</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                      <Clock className="h-3 w-3 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">02-04 pm</p>
                      <p className="text-gray-600 text-sm">45 min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Airport Terminal 1</p>
                      <p className="text-gray-600 text-sm">Destination</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        3/6 seats
                      </p>
                      <p className="text-gray-600 text-sm">Available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Rides (fetched from backend; fallback to sample data) */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Available Rides</h4>
                {(() => {
                  const list = (rides.length ? rides : (sharedRides as unknown as Array<Record<string, unknown>>))
                  return list.map((item, idx) => {
                    const rr = item as Record<string, unknown>
                    const pickup = rr['pickup'] as Record<string, unknown> | undefined
                    const destination = rr['destination'] as Record<string, unknown> | undefined
                    const seats = rr['seats'] as Record<string, unknown> | undefined
                    const available = seats ? (seats['available'] as number | undefined) : (rr['availableSeats'] as number | undefined)
                    const total = seats ? (seats['total'] as number | undefined) : (rr['totalSeats'] as number | undefined)
                    const price = (rr['price'] as string) || ''
                    const time = (rr['time'] as string) || (rr['timeAgo'] as string) || ''
                    const pickupDateStr = rr['pickupDateStr'] as string | undefined

                    return (
                      <div key={(rr['id'] as string) || time || idx} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-semibold">{(pickup && (pickup['location'] as string)) || (rr['pickupLocation'] as string) || 'Unknown'} → {(destination && (destination['location'] as string)) || (rr['destinationLocation'] as string) || 'Unknown'}</div>
                          <div className="text-sm text-gray-600">{time} • {available}/{total} seats</div>
                          {pickupDateStr && <div className="text-sm text-gray-500">Pickup Date: {pickupDateStr}</div>}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-gray-900">{price}</div>
                          <button
                            onClick={() => { setSelectedRide(toRideData(item as Record<string, unknown>)); setIsJoinRideOpen(true) }}
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                          >
                            Join ride
                          </button>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>

              {/* Booking Form */}
              <div className="bg-white rounded-2xl p-6 border">
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

                  <div className="grid grid-cols-3 gap-2 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={tripType === "one-way" ? "default" : "ghost"}
                      size="sm"
                      className={
                        tripType === "one-way"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }
                      onClick={() => setTripType("one-way")}
                    >
                      One Way
                    </Button>
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
                      Round Trip
                    </Button>
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
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">{tripType === "multi-city" ? "Multi-City Tour" : tripType === "round-trip" ? "Round Trip" : "Tour"} Details</h3>
                    {tripType === "multi-city" ? (
                      <div className="text-center text-gray-500 py-4">Multi-city booking not yet implemented</div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="from" className="text-gray-700 font-medium">
                              From
                            </Label>
                            <Input
                              id="from"
                              value={from}
                              onChange={(e) => setFrom(e.target.value)}
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
                              onChange={(e) => setTo(e.target.value)}
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
                          <div className="relative">
                            <Input
                              id="pickup-date"
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                            />
                            <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Pickup Time</Label>
                          {rideType === "shared" ? (
                            <div className="relative">
                              <select
                                value={selectedTimeSlot}
                                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-10 h-12"
                              >
                                <option value="">Select a time slot</option>
                                {timeSlots.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {slot}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                            </div>
                          ) : (
                            <Input
                              type="time"
                              value={customTime}
                              onChange={(e) => setCustomTime(e.target.value)}
                              className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                            />
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">No of Passengers</Label>
                            <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-2 h-12">
                              <button
                                type="button"
                                onClick={() => handlePassengerChange(-1)}
                                disabled={passengers <= 1}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold"
                              >
                                −
                              </button>
                              <span className="flex-1 text-center font-semibold text-gray-900">
                                {passengers}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePassengerChange(1)}
                              disabled={passengers >= 20}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    // Use form data to create booking data
                    setIsBookingDetailsOpen(true)
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-14 text-lg font-semibold rounded-2xl"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Continue to Payment
                </Button>
                <Button
                  onClick={() => {
                    // Share functionality with form data
                    if (navigator.share) {
                      navigator.share({
                        title: 'Shared Ride Available',
                        text: `Join ride from ${from} to ${to} for ${calculatedPriceForShare}`,
                        url: window.location.href,
                      })
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(`Join ride from ${from} to ${to} for ${calculatedPriceForShare}`)
                      alert('Ride details copied to clipboard!')
                    }
                  }}
                  variant="outline"
                  className="px-8 h-14 text-lg font-semibold rounded-2xl"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Ride
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

  <JoinRidePopup isOpen={isJoinRideOpen} onClose={handleCloseJoinRide} rideData={selectedRide} />
      <BookingDetailsPopup
        isOpen={isBookingDetailsOpen}
        onClose={handleCloseBookingDetails}
        bookingData={{
          from,
          to,
          rideType,
          date,
          time: rideType === "shared" ? selectedTimeSlot : customTime,
          passengers,
          tripType,
          mapDistance: DEFAULT_SHARED_DISTANCE.toString(),
        }}
      />
    </>
  )
}
