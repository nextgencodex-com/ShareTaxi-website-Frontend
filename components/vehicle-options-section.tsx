"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, ShoppingBag, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { BookRidePopup } from "./book-ride-popup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'

interface Vehicle {
  id: string
  name: string
  price: string
  passengers: string
  luggage: string
  handCarry: string
  image?: string
  features?: string[]
  gradient?: string
  buttonColor?: string
  isAvailable?: boolean
}

interface APIVehicle {
  id: string
  name: string
  price: number
  passengers: number
  luggage: number
  handCarry: number
  image: string
  features: string[]
  gradient: string
  isAvailable: boolean
}

interface VehicleOptionsSectionProps {
  initialVehicles?: Vehicle[]
}

export function VehicleOptionsSection({ initialVehicles = [] }: VehicleOptionsSectionProps) {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [passengerFilter, setPassengerFilter] = useState("all")
  const [shuffledGradients, setShuffledGradients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('http://localhost:5000/api/vehicles')
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }
        
        const data = await response.json()
        
        // Transform API data to match component interface
        const transformedVehicles: Vehicle[] = data.data.vehicles.map((vehicle: APIVehicle) => ({
          id: String(vehicle.id),
          name: vehicle.name,
          price: `$${vehicle.price}/trip`,
          passengers: vehicle.passengers.toString(),
          luggage: vehicle.luggage.toString(),
          handCarry: vehicle.handCarry.toString(),
          image: vehicle.image || "/placeholder.svg",
          features: vehicle.features || [],
          gradient: vehicle.gradient || "bg-gradient-to-br from-blue-400 to-blue-600",
          buttonColor: "bg-gray-600 hover:bg-gray-700",
          isAvailable: vehicle.isAvailable
        })).filter((vehicle: Vehicle) => vehicle.isAvailable) // Only show available vehicles

        setAllVehicles(transformedVehicles)
      } catch (err) {
        console.error('Error fetching vehicles:', err)
        setError('Failed to load vehicles. Please try again later.')
        
        // Fall back to default vehicles if API fails
        const defaultVehicles: Vehicle[] = [
          {
            id: "1",
            name: "Toyota Innova",
            price: "$6/hour",
            passengers: "5",
            luggage: "1",
            handCarry: "3",
            image: "/toyota-innova-white-mpv-car.jpg",
            features: ["Air Conditioning", "GPS Navigation", "USB Charging"],
            gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
            buttonColor: "bg-gray-600 hover:bg-gray-700",
          },
          {
            id: "2",
            name: "Toyota Alphard",
            price: "$9/hour",
            passengers: "6",
            luggage: "2",
            handCarry: "4",
            image: "/toyota-alphard-luxury-van.jpg",
            features: ["Premium Interior", "Entertainment System", "Privacy Curtain"],
            gradient: "bg-gradient-to-br from-orange-400 to-red-500",
            buttonColor: "bg-gray-600 hover:bg-gray-700",
          },
          {
            id: "3",
            name: "Hyundai Starex",
            price: "$12/hour",
            passengers: "8",
            luggage: "2",
            handCarry: "4",
            image: "/hyundai-starex-van.jpg",
            features: ["Extra Space", "Family Friendly", "Comfortable Seating"],
            gradient: "bg-gradient-to-br from-slate-500 to-slate-600",
            buttonColor: "bg-gray-600 hover:bg-gray-700",
          },
        ]
        setAllVehicles(defaultVehicles)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

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

  const handleFilterChange = (value: string) => {
    setPassengerFilter(value)
    setCurrentPage(0)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleBookNow = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsPopupOpen(true)
  }

  const closePopup = () => {
    setIsPopupOpen(false)
    setSelectedVehicle(null)
  }

  // Convert our Vehicle type to BookRidePopup Vehicle type
  const convertVehicleForBooking = (vehicle: Vehicle | null) => {
    if (!vehicle) return null
    return {
      id: parseInt(vehicle.id) || 0,
      name: vehicle.name,
      price: vehicle.price,
      passengers: vehicle.passengers,
      luggage: vehicle.luggage,
      handCarry: vehicle.handCarry,
      image: vehicle.image || "/placeholder.svg",
      features: vehicle.features || []
    }
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

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading vehicles...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-500">Showing default vehicles instead.</p>
            </div>
          )}

          {displayedVehicles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {displayedVehicles.map((vehicle: Vehicle, index: number) => (
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
                      <Image
                        src={vehicle.image || "/placeholder.svg"}
                        alt={vehicle.name}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    <div className="mb-6">
                      <p className="font-semibold mb-3">Features:</p>
                      <ul className="space-y-1">
                        {(vehicle.features || []).map((feature: string, index: number) => (
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
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No vehicles found matching your filter.</p>
            </div>
          )}
        </div>
      </section>

      <BookRidePopup isOpen={isPopupOpen} onClose={closePopup} vehicle={convertVehicleForBooking(selectedVehicle)} />
    </>
  )
}
