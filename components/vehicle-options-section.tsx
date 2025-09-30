"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, ShoppingBag } from "lucide-react"
import { BookRidePopup } from "./book-ride-popup"

const vehicles = [
  {
    id: 1,
    name: "Toyota Innova",
    price: "LKR 2000/ hour",
    passengers: "5-6",
    luggage: "X 1 Big",
    handCarry: "X 3 Hand",
    image: "/toyota-innova-white-mpv-car.jpg",
    features: ["Air Conditioning", "GPS Navigation", "USB Charging"],
    gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
  },
  {
    id: 2,
    name: "Toyota Alphard",
    price: "LKR 3000/ hour",
    passengers: "5-6",
    luggage: "X 2 Big",
    handCarry: "X 4 Hand",
    image: "/toyota-alphard-luxury-van.jpg",
    features: ["Premium Interior", "Entertainment System", "Privacy Curtain"],
    gradient: "bg-gradient-to-br from-orange-400 to-red-500",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },
  {
    id: 3,
    name: "Hyundai Starex",
    price: "LKR 4000/ hour",
    passengers: "7-8",
    luggage: "X 2 Big",
    handCarry: "X 4 Hand",
    image: "/hyundai-starex-van.jpg",
    features: ["Extra Space", "Family Friendly", "Comfortable Seating"],
    gradient: "bg-gradient-to-br from-slate-500 to-slate-600",
    buttonColor: "bg-slate-700 hover:bg-slate-800",
  },
]

export function VehicleOptionsSection() {
  const [showPopup, setShowPopup] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null)

  const handleBookNow = (vehicle: typeof vehicles[0]) => {
    setSelectedVehicle(vehicle)
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
    setSelectedVehicle(null)
  }

  return (
    <section id="vehicle-options-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Private MPV Car Options</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our premium fleet of vehicles, each designed to provide comfort and reliability for your
            journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className={`${vehicle.gradient} rounded-3xl p-6 text-white shadow-xl`}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{vehicle.name}</h3>
                <p className="text-lg opacity-90">{vehicle.price}</p>
              </div>

              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{vehicle.passengers}</p>
                  <p className="text-xs opacity-80">Passengers</p>
                </div>
                <div className="text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{vehicle.luggage}</p>
                  <p className="text-xs opacity-80">Luggage</p>
                </div>
                <div className="text-center">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{vehicle.handCarry}</p>
                  <p className="text-xs opacity-80">Carry</p>
                </div>
              </div>

              <div className="mb-6 rounded-2xl overflow-hidden">
                <img
                  src={vehicle.image || "/placeholder.svg"}
                  alt={vehicle.name}
                  className="w-full h-40 object-cover"
                />
              </div>

              <div className="mb-6">
                <p className="font-semibold mb-3">Features:</p>
                <ul className="space-y-1">
                  {vehicle.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleBookNow(vehicle)}
                className={`w-full ${vehicle.buttonColor} text-white font-semibold py-3 rounded-xl`}
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>
      </div>

      <BookRidePopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        vehicle={selectedVehicle}
      />
    </section>
  )
}
