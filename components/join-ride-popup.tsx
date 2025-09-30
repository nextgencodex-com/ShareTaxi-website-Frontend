"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MapPin, Clock, Users, ArrowLeft } from "lucide-react"
import { PaymentDetailsPopup } from "./payment-popup"

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
    emergencyContact: "",
    specialRequests: "",
    seatCount: 1,
  })
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)

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
    setShowPaymentPopup(true)
  }

  const handleClosePaymentPopup = () => {
    setShowPaymentPopup(false)
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
                    <p className="font-semibold text-gray-900">{rideData.time}</p>
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
                      {rideData.seats.available}/{rideData.seats.total} seats
                    </p>
                    <p className="text-gray-600 text-sm">Available</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 my-4" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={rideData.driver.image || "/placeholder.svg"} alt={rideData.driver.name} />
                    <AvatarFallback>
                      {rideData.driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{rideData.driver.name}</p>
                    <p className="text-gray-600">{rideData.vehicle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{rideData.price}</p>
                  <p className="text-gray-600">per seat</p>
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
                <div className="flex gap-2">
                  <Input value="+94" readOnly className="bg-blue-50 border-0 h-12 w-20" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-blue-50 border-0 h-12 flex-1"
                    placeholder=""
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Emergency Contact Phone</label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="bg-blue-50 border-0 h-12"
                  placeholder=""
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Special Requests or Notes</label>
                <Textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  className="bg-blue-50 border-0 min-h-[100px] resize-none"
                  placeholder="Enter your special request"
                />
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
                    -
                  </button>
                  <span className="flex-1 text-center font-semibold text-gray-900">
                    {formData.seatCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSeatCountChange(1)}
                    disabled={formData.seatCount >= rideData.seats.available}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
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
        isOpen={showPaymentPopup}
        onClose={handleClosePaymentPopup}
        rideData={rideData}
        selectedSeats={formData.seatCount}
        personalData={{
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          emergencyContact: formData.emergencyContact,
          specialRequests: formData.specialRequests,
          seatCount: formData.seatCount.toString(),
        }}
        onUpdateSeats={onUpdateSeats}
      />
    </div>
  )
}
