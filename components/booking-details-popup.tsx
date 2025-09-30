"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MapPin, Clock, Users } from "lucide-react"
import { PaymentDetailsPopup } from "./payment-popup"

interface BookingData {
  from: string
  to: string
  rideType: string
  date: string
  time: string
  passengers: string
  luggage: string
  tripType: string
}

interface BookingDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  bookingData: BookingData | null
}

export function BookingDetailsPopup({ isOpen, onClose, bookingData }: BookingDetailsPopupProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    emergencyContact: "",
    specialRequests: "",
    seatCount: "01",
  })

  const [showPaymentPopup, setShowPaymentPopup] = useState(false)

  if (!isOpen || !bookingData) return null

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContinueToPayment = () => {
    setShowPaymentPopup(true)
  }

  const handleClosePaymentPopup = () => {
    setShowPaymentPopup(false)
  }

  // Mock driver data - in real app this would come from booking data
  const mockDriver = {
    name: "Alex Chen",
    image: "/professional-driver-headshot.jpg",
    vehicle: "Toyota Alphard",
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
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

          <div className="p-6 space-y-6">
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ride Summary</h3>

              <div className="grid grid-cols-2 gap-6 mb-4">
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
                    <p className="font-semibold text-gray-900">{bookingData.time}</p>
                    <p className="text-gray-600 text-sm">45 min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bookingData.to}</p>
                    <p className="text-gray-600 text-sm">Destination</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {bookingData.rideType === "shared" ? "3/6 seats" : `${bookingData.passengers} seats`}
                    </p>
                    <p className="text-gray-600 text-sm">Available</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 my-4" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mockDriver.image || "/placeholder.svg"} alt={mockDriver.name} />
                    <AvatarFallback>
                      {mockDriver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{mockDriver.name}</p>
                    <p className="text-gray-600">{mockDriver.vehicle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">LKR 2000.00</p>
                  <p className="text-gray-600">{bookingData.rideType === "shared" ? "per seat" : "total"}</p>
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
                    placeholder="769278958"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Emergency Contact Phone</label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="bg-blue-50 border-0 h-12"
                  placeholder="011258945"
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
                <Input
                  value={formData.seatCount}
                  onChange={(e) => handleInputChange("seatCount", e.target.value)}
                  className="bg-blue-50 border-0 h-12"
                />
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
        bookingData={bookingData}
        personalData={formData}
      />
    </>
  )
}
