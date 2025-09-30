"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, MapPin, X, CreditCard, Share2 } from "lucide-react"
import { JoinRidePopup } from "./join-ride-popup"
import { PaymentDetailsPopup } from "./payment-popup"

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
    price: "LKR 2000.00",
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
    price: "LKR 2000.00",
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
    price: "LKR 2000.00",
  },
]

interface SharedRidesPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function SharedRidesPopup({ isOpen, onClose }: SharedRidesPopupProps) {
  const [isJoinRideOpen, setIsJoinRideOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [selectedRide, setSelectedRide] = useState<(typeof sharedRides)[0] | null>(null)
  const [selectedSeats, setSelectedSeats] = useState(1)

  if (!isOpen) return null



  const handleCloseJoinRide = () => {
    setIsJoinRideOpen(false)
    setSelectedRide(null)
  }

  const handleClosePayment = () => {
    setIsPaymentOpen(false)
    setSelectedRide(null)
    setSelectedSeats(1)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
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

                <hr className="border-gray-200 my-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/images/alex-chen-driver.jpg" alt="Alex Chen" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">Alex Chen</p>
                      <p className="text-gray-600">Toyota Alphard</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">LKR 2000.00</p>
                    <p className="text-gray-600">per seat</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setSelectedRide(sharedRides[0]) // Use first ride as example
                    setSelectedSeats(1)
                    setIsPaymentOpen(true)
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-14 text-lg font-semibold rounded-2xl"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Continue to Payment
                </Button>
                <Button
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: 'Shared Ride Available',
                        text: `Join ride from Downtown Plaza to Airport Terminal 1 for LKR 2000.00`,
                        url: window.location.href,
                      })
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(`Join ride from Downtown Plaza to Airport Terminal 1 for LKR 2000.00`)
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
      {selectedRide && (
        <PaymentDetailsPopup
          isOpen={isPaymentOpen}
          onClose={handleClosePayment}
          rideData={selectedRide}
          selectedSeats={selectedSeats}
        />
      )}
    </>
  )
}
