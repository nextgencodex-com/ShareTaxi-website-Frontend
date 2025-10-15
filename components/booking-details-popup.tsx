"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MapPin, Clock, Users, ArrowLeft, AlertTriangle } from "lucide-react"
import { PaymentDetailsPopup } from "./payment-popup"
import { calculateTotalPrice, getPerKmRate, getTripMultiplier, PER_SEAT_RATE_USD, formatPriceUSD, getPassengerCountCategory } from "@/lib/pricing"

// Import vehicle data
const vehicles = [
  {
    id: 1,
    name: "Toyota Innova",
    price: "$6/ hour",
    passengers: "5-6",
    luggage: "X 1 Big",
    handCarry: "X 3 Hand",
    image: "/toyota-innova-white-mpv-car.jpg",
    features: ["Air Conditioning", "GPS Navigation", "USB Charging"],
  },
  {
    id: 2,
    name: "Toyota Alphard",
    price: "$9/ hour",
    passengers: "5-6",
    luggage: "X 2 Big",
    handCarry: "X 4 Hand",
    image: "/toyota-alphard-luxury-van.jpg",
    features: ["Premium Interior", "Entertainment System", "Privacy Curtain"],
  },
  {
    id: 3,
    name: "Hyundai Starex",
    price: "$12/ hour",
    passengers: "7-8",
    luggage: "X 2 Big",
    handCarry: "X 4 Hand",
    image: "/hyundai-starex-van.jpg",
    features: ["Extra Space", "Family Friendly", "Comfortable Seating"],
  },
]

interface Destination {
  id: string
  location: string
}

interface BookingData {
  from: string
  to: string
  rideType: string
  date: string
  time: string
  passengers: number | string
  tripType: string
  destinations?: Destination[]
  startingPoint?: string
  mapDistance?: string | null
  mapDuration?: string | null
  calculatedFare?: string
}

interface BookingDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  onAddSharedRide?: (bookingData: any) => void
  bookingData: BookingData | null
}

// Helper function to format date and time consistently
const formatDateTime = (timeString: string, dateString: string) => {
  try {
    // If timeString already contains date (new format), parse it
    if (timeString && timeString.includes(' ') && timeString.split(' ').length >= 3) {
      const parts = timeString.split(' ')
      const dateStr = parts[0]
      const timeStr = parts[1]
      const ampm = parts[2]
      
      // Format date
      const date = new Date(dateStr)
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })
      
      // Format time
      const formattedTime = `${timeStr} ${ampm}`
      
      return `${formattedDate} | ${formattedTime}`
    }
    
    // Fallback to separate date and time
    if (dateString && timeString) {
      const date = new Date(dateString)
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })
      return `${formattedDate} | ${timeString}`
    }
    
    return "Date & Time: N/A"
  } catch (error) {
    console.error('Error formatting date/time:', error)
    return "Date & Time: N/A"
  }
}

export function BookingDetailsPopup({ isOpen, onClose, onAddSharedRide, bookingData }: BookingDetailsPopupProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    seatCount: 2,
  })

  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [currentBookingData, setCurrentBookingData] = useState<BookingData | null>(bookingData)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Keep internal booking data in sync with prop updates so calculated fare shows correctly
  useEffect(() => {
    setCurrentBookingData(bookingData)
    setIsInitialLoad(true) // Reset for each new booking
  }, [bookingData])

  // Recalculate fare with seats on initial load
  useEffect(() => {
    if (isOpen && currentBookingData && isInitialLoad) {
      recalculateFareWithNewSeats(formData.seatCount)
      setIsInitialLoad(false)
    }
  }, [currentBookingData, isOpen, isInitialLoad])

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  if (!isOpen || !bookingData) return null

  const validateField = (field: string, value: string) => {
    let error = ""
    const trimmedValue = value.trim()

    switch (field) {
      case "fullName":
        if (!trimmedValue) {
          error = "Full name is required"
        } else if (trimmedValue.length < 2) {
          error = "Full name must be at least 2 characters long"
        } else if (trimmedValue.length > 100) {
          error = "Full name cannot exceed 100 characters"
        } else if (!/^[a-zA-Z\s\-']+$/.test(trimmedValue)) {
          error = "Full name can only contain letters, spaces, hyphens, and apostrophes"
        }
        break
      case "email":
        if (!trimmedValue) {
          error = "Email address is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          error = "Please enter a valid email address"
        } else if (trimmedValue.length > 254) {
          error = "Email address is too long"
        }
        break
      case "phone":
        if (!trimmedValue) {
          error = "Phone number is required"
        } else if (!/^\d{8,10}$/.test(trimmedValue)) {
          error = "Phone number must be 8-10 digits"
        } else if (!/^7[0-9]{7}|^9[0-9]{7}|^6[0-9]{7}|^11[0-9]{6}|^[0-9]{9,10}$/.test(trimmedValue)) {
          error = "Please enter a valid Sri Lankan phone number"
        }
        break
      case "specialRequests":
        if (value.length > 500) {
          error = "Special requests cannot exceed 500 characters"
        }
        break
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }))
    return error
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleSeatCountChange = (change: number) => {
    const newSeatCount = Math.max(1, Math.min(20, formData.seatCount + change))
    setFormData((prev) => ({
      ...prev,
      seatCount: newSeatCount
    }))

    // Recalculate fare when seat count changes
    recalculateFareWithNewSeats(newSeatCount)
  }

  const recalculateFareWithNewSeats = (seats: number) => {
    if (!currentBookingData?.calculatedFare) return

    // Extract original rate and distance from current calculated fare
    const rateMatch = currentBookingData.calculatedFare.match(/Rate:\s*\$([0-9.]+)/)
    const distanceMatch = currentBookingData.calculatedFare.match(/Distance:\s*([0-9.]+)/)

    if (!rateMatch || !distanceMatch) return

    const rate = parseFloat(rateMatch[1])
    const distance = parseFloat(distanceMatch[1])

    let newFareDisplay = ""
    if (currentBookingData.rideType === "shared") {
      // For shared rides, adjust based on actual seat count vs. standard 4 passengers
      const perPersonFare = (distance * rate) / 4;
      const totalPrice = perPersonFare * seats;
      newFareDisplay = `🚗 Distance: ${distance} km<br>💲 Rate: $${rate.toFixed(2)} per km<br>👥 Per Person Fare: <span style="color:green;">$${perPersonFare.toFixed(2)}</span><br>📍 Seats: ${seats}<br>💰 Total Price: <span style="color:blue; font-weight: bold;">$${totalPrice.toFixed(2)}</span>`
    } else {
      // For personal rides, calculate total based on seats selected
      const totalFare = distance * rate * seats;
      newFareDisplay = `🚗 Distance: ${distance} km<br>💲 Rate: $${rate.toFixed(2)} per km<br>💰 Total Fare: <span style="color:blue;">$${totalFare.toFixed(2)}</span><br>📍 Seats: ${seats}`
    }

    // Update the current booking data with new calculated fare
    setCurrentBookingData(prev => prev ? { ...prev, calculatedFare: newFareDisplay } : null)
  }

  // Validation functions
  const validateFormData = () => {
    const errors: string[] = []

    // Full Name validation
    const fullName = formData.fullName.trim()
    if (!fullName) {
      errors.push("Full name is required")
    } else if (fullName.length < 2) {
      errors.push("Full name must be at least 2 characters long")
    } else if (fullName.length > 100) {
      errors.push("Full name cannot exceed 100 characters")
    } else if (!/^[a-zA-Z\s\-']+$/.test(fullName)) {
      errors.push("Full name can only contain letters, spaces, hyphens, and apostrophes")
    }

    // Email validation
    const email = formData.email.trim()
    if (!email) {
      errors.push("Email address is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address")
    } else if (email.length > 254) {
      errors.push("Email address is too long")
    }

    // Phone validation (Sri Lankan format after +94)
    const phone = formData.phone.trim()
    if (!phone) {
      errors.push("Phone number is required")
    } else if (!/^\d{8,10}$/.test(phone)) {
      errors.push("Phone number must be 8-10 digits (Sri Lankan format)")
    } else if (!/^7[0-9]{7}|^9[0-9]{7}|^6[0-9]{7}|^11[0-9]{6}|^[0-9]{9,10}$/.test(phone)) {
      errors.push("Please enter a valid Sri Lankan phone number")
    }


    // Special Requests validation (optional, but reasonable length)
    if (formData.specialRequests.length > 500) {
      errors.push("Special requests cannot exceed 500 characters")
    }

    // Seat count validation
    if (formData.seatCount < 1 || formData.seatCount > 20) {
      errors.push("Seat count must be between 1 and 20")
    }

    return errors
  }

  const handleContinueToPayment = () => {
    setHasAttemptedSubmit(true)
    const errors = validateFormData()

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])

    if (bookingData.rideType === "shared") {
      onAddSharedRide?.(bookingData)
      console.log('[v0] Calling onAddSharedRide with data')
    }
    setShowPaymentPopup(true)
  }

  // Clear validation errors when user starts fixing them
  const clearValidationErrors = () => {
    if (hasAttemptedSubmit) {
      setValidationErrors([])
    }
  }

  const handleClosePaymentPopup = () => {
    setShowPaymentPopup(false)
    // Don't close the booking details popup, just go back to it
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500 text-white px-6 py-2 rounded-full font-semibold">Personal Details</div>
              <div className="flex-1 h-1 bg-gray-300 rounded"></div>
              <div className="bg-yellow-200 text-gray-600 px-6 py-2 rounded-full font-semibold">Payment</div>
            </div>
          </div>

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="mb-6">
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

          <div className="p-6 space-y-6">
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ride Summary</h3>

              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-lg">
                  {bookingData.rideType === "shared" ? "Shared" : "Personal"} {" "}
                  {bookingData.tripType === "one-way" ? "One Way" :
                   bookingData.tripType === "round-trip" ? "Return Trip" :
                   "Multi-City"} Trip
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bookingData.from}</p>
                    <p className="text-gray-600 text-sm">Pickup point</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Date & Time: {formatDateTime(bookingData.time, bookingData.date)}
                    </p>
                    <p className="text-gray-600 text-sm">{bookingData.mapDuration || "Estimated duration"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {bookingData.tripType === "multi-city" && bookingData.destinations
                        ? bookingData.destinations.filter(d => d.location.trim()).map(d => d.location).join(", ")
                        : bookingData.to
                      }
                    </p>
                    <p className="text-gray-600 text-sm">Destination</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formData.seatCount} seats
                    </p>
                    <p className="text-gray-600 text-sm">
                      {bookingData.rideType === "shared" ? "Requested" : "Available"}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 my-4" />

              {/* Calculated Price Display */}
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-gray-900">Calculated Price</h4>
                {currentBookingData?.calculatedFare ? (
                  <div className="bg-blue-50 p-3 rounded-lg border">
                    <div
                      className="text-sm font-medium"
                      dangerouslySetInnerHTML={{ __html: currentBookingData.calculatedFare }}
                    />
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Fare not available. Please return to the booking section and ensure a distance is set for your trip type.
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => {
                    handleInputChange("fullName", e.target.value)
                    clearValidationErrors()
                  }}
                  className={`bg-blue-50 border-0 h-12 ${fieldErrors.fullName ? 'border-red-300' : ''}`}
                  placeholder="Enter your full name"
                />
                {fieldErrors.fullName && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange("email", e.target.value)
                    clearValidationErrors()
                  }}
                  className={`bg-blue-50 border-0 h-12 ${fieldErrors.email ? 'border-red-300' : ''}`}
                  placeholder="Enter your email"
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <Input value="+94" readOnly className="bg-blue-50 border-0 h-12 w-20" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => {
                      handleInputChange("phone", e.target.value)
                      clearValidationErrors()
                    }}
                    className={`bg-blue-50 border-0 h-12 flex-1 ${fieldErrors.phone ? 'border-red-300' : ''}`}
                    placeholder="769278958"
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Special Requests or Notes
                  {formData.specialRequests.length > 0 && (
                    <span className={`text-xs ml-2 ${formData.specialRequests.length > 500 ? 'text-red-600' : 'text-gray-500'}`}>
                      {formData.specialRequests.length}/500
                    </span>
                  )}
                </label>
                <Textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  className="bg-blue-50 border-0 min-h-[100px] resize-none"
                  placeholder="Enter your special request"
                />
                {fieldErrors.specialRequests && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.specialRequests}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Seats count</label>
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-2 h-12">
                  <button
                    type="button"
                    onClick={() => handleSeatCountChange(-1)}
                    disabled={formData.seatCount <= 1}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-semibold text-gray-900">
                    {formData.seatCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSeatCountChange(1)}
                    disabled={formData.seatCount >= 20}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {bookingData.rideType === "shared" && (
              <div className="border-2 border-red-200 rounded-2xl p-6 bg-red-50/30">
                <h4 className="font-bold text-gray-900 mb-3">Shared Ride Guidelines</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Be ready at the pickup point 5 minutes before departure time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Respect other passengers and maintain a friendly atmosphere</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Keep personal belongings secure and within your designated space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Follow the driver's instructions for safety and comfort</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinueToPayment}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 text-lg font-semibold rounded-2xl"
            >
              Continue To Payment
            </Button>
          </div>
        </div>
      </div>

      <PaymentDetailsPopup
        isOpen={showPaymentPopup}
        onClose={handleClosePaymentPopup}
        onBack={handleClosePaymentPopup}
        bookingData={currentBookingData || bookingData}
        personalData={formData}
      />
    </>
  )
}
