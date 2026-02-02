"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, X, ArrowLeft, Car, DollarSign, Calendar as CalendarIcon } from "lucide-react"
import { BookingDetailsPopup } from "./booking-details-popup"

interface BookingData {
  from: string
  to: string
  date: string
  time: string
  rideType: string
  passengers: number
  tripType: string
  mapDistance?: string | null
  mapDuration?: string | null
  calculatedFare?: string
  destinations?: Array<{ id: string; location: string }>
  startingPoint?: string
}

interface PersonalRidesPopupProps {
  isOpen: boolean
  onClose: () => void
  bookingData: BookingData | null
}

export function PersonalRidesPopup({ isOpen, onClose, bookingData }: PersonalRidesPopupProps) {
  const [showBookingDetails, setShowBookingDetails] = useState(false)

  if (!isOpen || !bookingData) return null

  // Extract fare details from calculatedFare HTML string
  const extractFareDetail = (fareHtml: string | undefined, pattern: RegExp, defaultValue: string = "N/A") => {
    if (!fareHtml) return defaultValue
    const match = fareHtml.match(pattern)
    return match ? match[1] : defaultValue
  }

  const distance = extractFareDetail(bookingData.calculatedFare, /Distance:\s*([0-9.]+)\s*km/)
  const distanceKm = distance ? `${distance} km` : "N/A"
  const ratePerKm = extractFareDetail(bookingData.calculatedFare, /\$([0-9.]+)\/km/, "0.00")
  const totalPrice = extractFareDetail(bookingData.calculatedFare, /Total Price:.*?\$([0-9.]+)/, "0.00")

  const handleProceed = () => {
    setShowBookingDetails(true)
  }

  const handleCloseBookingDetails = () => {
    setShowBookingDetails(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Personal Ride - Fare Review</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Trip Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Your Trip Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-semibold text-gray-900 text-lg">{bookingData.from}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-semibold text-gray-900 text-lg">{bookingData.to}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(bookingData.date).toLocaleDateString("en-US", { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">{bookingData.time}</p>
                    </div>
                  </div>
                </div>

                {bookingData.mapDistance && bookingData.mapDuration && (
                  <div className="flex items-center gap-4 pt-2 border-t border-blue-200">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Distance:</span> {bookingData.mapDistance}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Est. Travel:</span> {bookingData.mapDuration}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fare Calculation Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-orange-600" />
                Fare Calculation
              </h3>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Distance</span>
                    <span className="font-bold text-gray-900">{distanceKm}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Rate per km</span>
                    <span className="font-bold text-green-600">${ratePerKm}/km</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Trip Type</span>
                    <span className="font-bold text-gray-900 capitalize">
                      {bookingData.tripType.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-orange-300">
                    <span className="text-xl font-bold text-gray-900">Total Fare</span>
                    <span className="text-3xl font-bold text-orange-600">${totalPrice}</span>
                  </div>
                </div>

                {/* Formula explanation */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 Calculation:</span> ${ratePerKm}/km × {distance} km = ${totalPrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Features */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">Personal Ride Benefits</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Full vehicle at your service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Distance-based pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Professional driver</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Flexible scheduling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <Button
              onClick={handleProceed}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold rounded-xl"
            >
              Proceed to Book This Ride →
            </Button>
          </div>
        </div>
      </div>

      {/* Show BookingDetailsPopup when user proceeds */}
      <BookingDetailsPopup
        isOpen={showBookingDetails}
        onClose={handleCloseBookingDetails}
        bookingData={bookingData}
      />
    </>
  )
}
