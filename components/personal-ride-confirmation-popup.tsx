"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, MapPin, Clock, Car, DollarSign } from "lucide-react"

interface PersonalRideConfirmationPopupProps {
  isOpen: boolean
  onClose: () => void
  bookingData: {
    from: string
    to: string
    date: string
    time: string
    tripType: string
    mapDistance?: string | null
    mapDuration?: string | null
    calculatedFare?: string
  }
  personalData: {
    fullName: string
    email: string
    phone: string
    specialRequests?: string
  }
}

export function PersonalRideConfirmationPopup({
  isOpen,
  onClose,
  bookingData,
  personalData,
}: PersonalRideConfirmationPopupProps) {
  if (!isOpen) return null

  // fare amount 
  const extractTotalFare = (fareHtml?: string) => {
    if (!fareHtml) return "$0.00"
    const match = fareHtml.match(/Total Price:.*?\$([0-9.]+)/)
    return match ? `$${match[1]}` : "$0.00"
  }

  const extractRatePerKm = (fareHtml?: string) => {
    if (!fareHtml) return "$0.00"
    const match = fareHtml.match(/Rate:\s*\$([0-9.]+)/)
    return match ? `$${match[1]}` : "$0.00"
  }

  const extractDistance = (fareHtml?: string) => {
    if (!fareHtml) return "0 km"
    const match = fareHtml.match(/Distance:\s*([0-9.]+\s*km)/)
    return match ? match[1] : "0 km"
  }

  const totalFare = extractTotalFare(bookingData.calculatedFare)
  const ratePerKm = extractRatePerKm(bookingData.calculatedFare)
  const distanceText = bookingData.mapDistance || extractDistance(bookingData.calculatedFare)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Personal Ride Confirmed!</h2>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Success Message */}
        <div className="p-6 bg-green-50 border-b border-green-100">
          <p className="text-center text-green-800 font-medium">
            🎉 Your personal ride has been successfully booked! A driver will be assigned shortly.
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-6">
          {/* Trip Information */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Trip Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-semibold text-gray-900">{bookingData.from}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-semibold text-gray-900">{bookingData.to}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Pickup Time</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.time} • {new Date(bookingData.date).toLocaleDateString("en-US", { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
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

          {/* Pricing Breakdown */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Fare Breakdown
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Rate per km</span>
                <span className="font-semibold text-gray-900">{ratePerKm}/km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Distance</span>
                <span className="font-semibold text-gray-900">{distanceText}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Trip Type</span>
                <span className="font-semibold text-gray-900 capitalize">{bookingData.tripType.replace('-', ' ')}</span>
              </div>
              <div className="border-t border-yellow-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Fare</span>
                  <span className="text-2xl font-bold text-orange-600">{totalFare}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{personalData.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{personalData.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{personalData.phone}</p>
              </div>
              {personalData.specialRequests && (
                <div className="col-span-2">
                  <p className="text-gray-600">Special Requests</p>
                  <p className="font-semibold text-gray-900">{personalData.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Info Note */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> A driver will be assigned to your ride shortly. 
              You will receive a confirmation email and SMS with driver details and vehicle information.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold rounded-xl"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
