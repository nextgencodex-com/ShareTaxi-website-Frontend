"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, ShoppingBag, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { PersonalRidePopup } from "./personal-rides/personal-ride-popup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/components/ui/use-mobile"

// 🧭 Add these for swipe in mobile view
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

interface Vehicle {
  id: number | string
  name: string
  price?: string
  passengers?: string
  luggage?: string
  handCarry?: string
  image?: string
  features?: string[]
  gradient?: string
  buttonColor?: string
}

interface VehicleOptionsSectionProps {
  initialVehicles?: Vehicle[]
}

export function VehicleOptionsSection({ initialVehicles = [] }: VehicleOptionsSectionProps) {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [passengerFilter, setPassengerFilter] = useState("all")
  const [shuffledGradients, setShuffledGradients] = useState<string[]>([])
  const [showMore, setShowMore] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    setAllVehicles([])

    ;(async () => {
      try {
        const resp = await fetch("http://localhost:5000/api/vehicles", { cache: "no-store" })
        if (!mounted) return
        if (!resp.ok) throw new Error(`Server responded ${resp.status}`)
        const json = await resp.json()

        let vehiclesFromApi: unknown[] = []
        if (Array.isArray(json)) {
          vehiclesFromApi = json
        } else if (json && json.data && Array.isArray(json.data.vehicles)) {
          vehiclesFromApi = json.data.vehicles
        } else if (json && Array.isArray(json.vehicles)) {
          vehiclesFromApi = json.vehicles
        }

        if (vehiclesFromApi.length > 0) {
          const normalized = vehiclesFromApi.map((v) => {
            if (typeof v === "object" && v !== null) {
              const obj = v as Record<string, unknown>
              const rawId = obj["id"] ?? obj["_id"] ?? obj["name"]
              const id = typeof rawId === "number" ? rawId : (typeof rawId === "string" ? rawId : String(rawId ?? ""))
              const name = (obj["name"] ?? obj["title"]) as string | undefined
              const price = (obj["price"] ?? obj["rate"]) as string | undefined
              const passengers = (obj["passengers"] ?? obj["capacity"]) as string | undefined
              const luggage = (obj["luggage"] ?? obj["boot"]) as string | undefined
              const handCarry = (obj["handCarry"] ?? obj["hand_carry"]) as string | undefined
              const image = (obj["image"] ?? obj["img"]) as string | undefined
              const features = (Array.isArray(obj["features"]) ? obj["features"] : obj["tags"]) as unknown[] | undefined
              const gradient = obj["gradient"] as string | undefined
              const buttonColor = (obj["buttonColor"] as string) ?? "bg-gray-600 hover:bg-gray-700"

              return {
                id,
                name: name ?? "",
                price: price ?? "",
                passengers: passengers ?? "",
                luggage: luggage ?? "",
                handCarry: handCarry ?? "",
                image: image ?? "/placeholder.svg",
                features: (features ?? []) as string[],
                gradient,
                buttonColor,
              }
            }

            return {
              id: "",
              name: "",
              price: "",
              passengers: "",
              luggage: "",
              handCarry: "",
              image: "/placeholder.svg",
              features: [],
              buttonColor: "bg-gray-600 hover:bg-gray-700",
            }
          })
          setAllVehicles(normalized)
        }
      } catch (err: unknown) {
        if (err instanceof Error) console.warn("Failed to fetch vehicles:", err.message)
        else console.warn("Failed to fetch vehicles:", err)
        if (mounted) setError("Could not load vehicles from server.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [initialVehicles])

  useEffect(() => {
    const gradients = [
      "bg-gradient-to-br from-yellow-400 to-orange-500",
      "bg-gradient-to-br from-orange-400 to-red-500",
      "bg-gradient-to-br from-slate-500 to-slate-600"
    ]
    const shuffled = [...gradients]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledGradients(shuffled)
  }, [currentPage])

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle: Vehicle) => {
      const matchesFilter = passengerFilter === "all" || vehicle.passengers === passengerFilter
      return matchesFilter
    })
  }, [allVehicles, passengerFilter])

  const vehiclesPerPage = 3
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage)
  const startIndex = currentPage * vehiclesPerPage
  const displayedVehicles = filteredVehicles.slice(startIndex, startIndex + vehiclesPerPage)
  const mobileVehicles = showMore ? displayedVehicles : displayedVehicles.slice(0, 2)
  const shouldShowMoreButton = isMobile && filteredVehicles.length > 2

  const handleFilterChange = (value: string) => {
    setPassengerFilter(value)
    setCurrentPage(0)
    setShowMore(false)
  }

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(0, prev - 1))
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  const handleBookNow = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsPopupOpen(true)
  }

  const closePopup = () => {
    setIsPopupOpen(false)
    setSelectedVehicle(null)
  }

  const convertVehicleForBooking = (vehicle: Vehicle | null) => {
    if (!vehicle) return null
    return {
      id: Number(vehicle.id) || 0,
      name: vehicle.name || "",
      price: vehicle.price ?? "",
      passengers: vehicle.passengers ?? "",
      luggage: vehicle.luggage ?? "",
      handCarry: vehicle.handCarry ?? "",
      image: vehicle.image || "/placeholder.svg",
      features: vehicle.features || []
    }
  }

  // 🧭 Slider settings for mobile
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
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
              {/* ✅ Mobile Swipe View */}
              {isMobile ? (
                <Slider {...sliderSettings}>
                  {displayedVehicles.map((vehicle: Vehicle, index: number) => (
                    <div key={vehicle.id} className="px-2">
                      <div className={`${shuffledGradients[index % shuffledGradients.length]} rounded-3xl p-6 text-white shadow-xl`}>
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold mb-2">{vehicle.name}</h3>
                          <p className="text-lg opacity-90">{vehicle.price}$ per day</p>
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
                    </div>
                  ))}
                </Slider>
              ) : (
                // ✅ Desktop Grid (unchanged)
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {displayedVehicles.map((vehicle: Vehicle, index: number) => (
                    <div key={vehicle.id} className={`${shuffledGradients[index]} rounded-3xl p-6 text-white shadow-xl`}>
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">{vehicle.name}</h3>
                        <p className="text-lg opacity-90">{vehicle.price}$ per day</p>
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
              )}

              {!isMobile && (
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
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No vehicles found matching your filter.</p>
            </div>
          )}
        </div>
      </section>

      <PersonalRidePopup isOpen={isPopupOpen} onClose={closePopup} vehicle={convertVehicleForBooking(selectedVehicle)} />
    </>
  )
}
