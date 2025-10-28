"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MapPin, Clock, Users, ArrowLeft } from "lucide-react"
import { PaymentDetailsPopup } from "./payment-popup"
import { formatPriceUSD } from "@/lib/pricing"

interface RideData {
  id: number
  driver: {
    name: string
    image: string
  }
  vehicle: string
  pickup: {
    location: string
    type: string
  }
  destination: {
    location: string
    type: string
  }
  time: string
  duration: string
  seats: {
    available: number
    total: number
  }
  price: string
  frequency?: string
}

interface JoinRidePopupProps {
  isOpen: boolean
  onClose: () => void
  rideData: RideData | null
  onUpdateSeats?: (rideId: number, seatsBooked: number) => void
}

export function JoinRidePopup({ isOpen, onClose, rideData, onUpdateSeats }: JoinRidePopupProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    seatCount: 1,
    paymentMethod: "",
  })
  const [showPaymentPopup, setShowPaymentPopup] = useState<{ open: boolean; rideDate?: string }>({ open: false })

  // Function to parse time for display
  const parseTimeForDisplay = (time: string, frequency?: string) => {
    if (frequency === 'daily') {
      // For daily rides, extract just the time part (e.g., "4-6 PM" from "4-6 PM")
      const timeMatch = time.match(/(\d{1,2}-\d{1,2}\s*(AM|PM))/i)
      if (timeMatch) {
        return timeMatch[0]
      }
      // Fallback: if no match, return the original time
      return time
    }
    // For one-time rides, return the full time string
    return time
  }

  // Reset form data and payment popup state when popup opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        specialRequests: "",
        seatCount: 1,
        paymentMethod: "",
      })
      setShowPaymentPopup({ open: false })
    }
  }, [isOpen])

  if (!isOpen || !rideData) return null

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSeatCountChange = (change: number) => {
    setFormData((prev) => ({
      ...prev,
      seatCount: Math.max(1, Math.min(rideData.seats.available, prev.seatCount + change))
    }))
  }

  const handleContinueToPayment = () => {
    // Pass the ride's time as rideDate into the payment popup state
    setShowPaymentPopup({ open: true, rideDate: rideData.time })
  }

  const handleClosePaymentPopup = () => {
    setShowPaymentPopup({ open: false })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
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

        {/* Fixed Progress Steps */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 text-white px-6 py-2 rounded-full font-semibold">Personal Details</div>
            <div className="flex-1 h-1 bg-gray-300 rounded"></div>
            <div className="bg-yellow-200 text-gray-600 px-6 py-2 rounded-full font-semibold">Payment</div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
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
                    <p className="font-semibold text-gray-900">{rideData.pickup.location}</p>
                    <p className="text-gray-600 text-sm">{rideData.pickup.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{parseTimeForDisplay(rideData.time, rideData.frequency)}</p>
                    <p className="text-gray-600 text-sm">{rideData.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{rideData.destination.location}</p>
                    <p className="text-gray-600 text-sm">{rideData.destination.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {rideData.seats.available}/{rideData.seats.total} Persons
                    </p>
                    <p className="text-gray-600 text-sm">Seats Available</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 my-4" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-900">Persons:</label>
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
                    <button
                      type="button"
                      onClick={() => handleSeatCountChange(-1)}
                      disabled={formData.seatCount <= 1}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="text-center font-semibold text-gray-900 min-w-[2rem]">
                      {formData.seatCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSeatCountChange(1)}
                      disabled={formData.seatCount >= rideData.seats.available}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      // Extract numeric price from rideData.price (e.g., "$25.00" -> 25)
                      const pricePerPerson = parseFloat(rideData.price.replace(/[^0-9.]/g, '')) || 0;
                      const totalPrice = pricePerPerson * formData.seatCount;
                      return formatPriceUSD(totalPrice);
                    })()}
                  </p>
                  <p className="text-gray-600">for {formData.seatCount} person{formData.seatCount > 1 ? 's' : ''}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Per person: {rideData.price}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="bg-blue-50 border-0 h-12"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-blue-50 border-0 h-12"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-blue-50 border-0 h-12"
                  placeholder="Enter full international number (e.g., +94769278958)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                  className="w-full bg-blue-50 border-0 h-12 rounded-md px-3"
                >
                  <option value="">Select payment method</option>
                  <option value="Visa Card">Visa Card</option>
                  <option value="QRpayment">QR Payment</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Via Payment Gateway">Via Payment Gateway</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Special Requests or Notes</label>
                <Textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  className="bg-blue-50 border-0 min-h-[100px] resize-none"
                  placeholder="Enter your special request"
                />
              </div>
            </div>

            {/* Guidelines */}
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
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t flex-shrink-0">
          <Button
            onClick={handleContinueToPayment}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 text-lg font-semibold rounded-2xl"
          >
            Continue To Payment
          </Button>
        </div>
      </div>

      {/* Payment Popup */}
      <PaymentDetailsPopup
        isOpen={showPaymentPopup.open}
        onClose={onClose}
        onBack={handleClosePaymentPopup}
        rideData={rideData}
        selectedSeats={formData.seatCount}
        personalData={{
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialRequests: formData.specialRequests,
          seatCount: formData.seatCount.toString(),
          paymentMethod: formData.paymentMethod,
        }}
        onUpdateSeats={onUpdateSeats}
      />
    </div>
  )
}