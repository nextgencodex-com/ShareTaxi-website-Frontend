"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, ShoppingBag, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { BookRidePopup } from "./book-ride-popup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/components/ui/use-mobile"

interface VehicleOptionsSectionProps {
  initialVehicles?: any[]
}

export function VehicleOptionsSection({ initialVehicles = [] }: VehicleOptionsSectionProps) {
  const defaultVehicles = [
    {
      id: 1,
      name: "Toyota Innova",
      price: "$6/ hour",
      passengers: "5-6",
      luggage: "X 1 Big",
      handCarry: "X 3 Hand",
      image: "/toyota-innova-white-mpv-car.jpg",
      features: ["Air Conditioning", "GPS Navigation", "USB Charging"],
      gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
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
      gradient: "bg-gradient-to-br from-orange-400 to-red-500",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
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
      gradient: "bg-gradient-to-br from-slate-500 to-slate-600",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
    },
  ]

  const [allVehicles, setAllVehicles] = useState([...initialVehicles.map(vehicle => ({ ...vehicle, buttonColor: "bg-gray-600 hover:bg-gray-700" })), ...defaultVehicles])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [passengerFilter, setPassengerFilter] = useState("all")
  const [shuffledGradients, setShuffledGradients] = useState<string[]>([])
  const [showMore, setShowMore] = useState(false)

  const isMobile = useIsMobile()

  useEffect(() => {
    setAllVehicles([...initialVehicles.map(vehicle => ({ ...vehicle, buttonColor: "bg-gray-600 hover:bg-gray-700" })), ...defaultVehicles])
  }, [initialVehicles])

  useEffect(() => {
    // Shuffle gradients only on client side to avoid hydration mismatch
    const gradients = [
      "bg-gradient-to-br from-yellow-400 to-orange-500",
      "bg-gradient-to-br from-orange-400 to-red-500",
      "bg-gradient-to-br from-slate-500 to-slate-600"
    ]
    const shuffled = [...gradients]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledGradients(shuffled)
  }, [currentPage])

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle) => {
      const matchesFilter = passengerFilter === "all" || vehicle.passengers === passengerFilter
      return matchesFilter
    })
  }, [allVehicles, passengerFilter])

  const vehiclesPerPage = 3
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage)
  const startIndex = currentPage * vehiclesPerPage
  const displayedVehicles = filteredVehicles.slice(startIndex, startIndex + vehiclesPerPage)

  // For mobile: show first 2 initially, then all after showMore
  const mobileVehicles = showMore ? displayedVehicles : displayedVehicles.slice(0, 2)
  const shouldShowMoreButton = isMobile && filteredVehicles.length > 2

  const handleFilterChange = (value: string) => {
    setPassengerFilter(value)
    setCurrentPage(0)
    setShowMore(false) // Reset showMore when filter changes
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleBookNow = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setIsPopupOpen(true)
  }

  const closePopup = () => {
    setIsPopupOpen(false)
    setSelectedVehicle(null)
  }

  return (
    <>
      <section id="vehicle-options-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Private MPV Car Options</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our premium fleet of vehicles, each designed to provide comfort and reliability for your
              journey.
            </p>

            <div className="max-w-md mx-auto mt-8">
              <Select value={passengerFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full h-12 border-2 border-blue-200 rounded-full bg-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by passengers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="5-6">5-6 Passengers</SelectItem>
                  <SelectItem value="7-8">7-8 Passengers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {displayedVehicles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {(isMobile ? mobileVehicles : displayedVehicles).map((vehicle: any, index: number) => (
                  <div key={vehicle.id} className={`${shuffledGradients[index]} rounded-3xl p-6 text-white shadow-xl`}>
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
                        className="w-98 h-58 object-cover"
                      />
                    </div>

                    <div className="mb-6">
                      <p className="font-semibold mb-3">Features:</p>
                      <ul className="space-y-1">
                        {vehicle.features.map((feature: string, index: number) => (
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

              {shouldShowMoreButton ? (
                <div className="flex items-center justify-center mt-8">
                  <Button
                    onClick={() => setShowMore(true)}
                    variant="outline"
                    className="px-6 py-2 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Show More
                  </Button>
                </div>
              ) : (
                !isMobile && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      variant="ghost"
                      size="icon"
                      className="rounded-full disabled:opacity-30"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <div className="flex justify-center gap-2">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentPage ? "bg-yellow-500" : "bg-gray-300"
                          }`}
                          aria-label={`Go to page ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                      variant="ghost"
                      size="icon"
                      className="rounded-full disabled:opacity-30"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No vehicles found matching your filter.</p>
            </div>
          )}
        </div>
      </section>

      <BookRidePopup isOpen={isPopupOpen} onClose={closePopup} vehicle={selectedVehicle} />
    </>
  )
}
