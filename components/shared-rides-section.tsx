"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { JoinRidePopup } from "./join-ride-popup"

interface Ride {
  id: number
  timeAgo: string
  postedDate: Date
  frequency: string
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

interface SharedRidesSectionProps {
  initialRides?: Ride[]
  backendDown?: boolean
}

export function SharedRidesSection({ initialRides = [], backendDown = false }: SharedRidesSectionProps) {
  // Removed demo/default rides; component will render only rides passed via `initialRides`.

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [oneTimePage, setOneTimePage] = useState(0)
  const [dailyPage, setDailyPage] = useState(0)
  const [rides, setRides] = useState<Ride[]>([])

  useEffect(() => {
    // Use only provided initialRides; keep predictable behavior for production data.
    setRides(initialRides)
  }, [initialRides])

  const oneTimeRides = useMemo(() => rides.filter((ride) => ride.frequency === "one-time"), [rides])
  const dailyRides = useMemo(() => rides.filter((ride) => ride.frequency === "daily"), [rides])

  const ridesPerPage = 3
  const oneTimeTotalPages = Math.ceil(oneTimeRides.length / ridesPerPage)
  const dailyTotalPages = Math.ceil(dailyRides.length / ridesPerPage)
  const oneTimeStartIndex = oneTimePage * ridesPerPage
  const dailyStartIndex = dailyPage * ridesPerPage
  const displayedOneTimeRides = oneTimeRides.slice(oneTimeStartIndex, oneTimeStartIndex + ridesPerPage)
  const displayedDailyRides = dailyRides.slice(dailyStartIndex, dailyStartIndex + ridesPerPage)

  const handleOneTimePrevPage = () => {
    setOneTimePage((prev) => Math.max(0, prev - 1))
  }

  const handleOneTimeNextPage = () => {
    setOneTimePage((prev) => Math.min(oneTimeTotalPages - 1, prev + 1))
  }

  const handleOneTimePageChange = (page: number) => {
    setOneTimePage(page)
  }

  const handleDailyPrevPage = () => {
    setDailyPage((prev) => Math.max(0, prev - 1))
  }

  const handleDailyNextPage = () => {
    setDailyPage((prev) => Math.min(dailyTotalPages - 1, prev + 1))
  }

  const handleDailyPageChange = (page: number) => {
    setDailyPage(page)
  }

  const handleJoinRide = (ride: Ride) => {
    setSelectedRide(ride)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedRide(null)
  }

  const renderRideCards = (rides: Ride[]) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {rides.map((ride) => (
        <Card key={ride.id} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-center mb-4 space-x-2">
                <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 rounded-full px-3 py-1 text-sm">
                  {ride.timeAgo}
                </Badge>
                <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 rounded-full px-3 py-1 text-sm">
                  {new Date(ride.postedDate).toLocaleDateString()} at {new Date(ride.postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-2 w-2 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ride.pickup.location}</p>
                    <p className="text-gray-500 text-sm">{ride.pickup.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-2 w-2 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-gray-900">{ride.destination.location}</p>
                    <p className="text-gray-500">{ride.destination.type}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ride.time}</p>
                    <p className="text-gray-500 text-sm">{ride.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {ride.seats.available}/{ride.seats.total} seats
                    </p>
                    <p className="text-gray-500 text-sm">Available</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-xl font-bold text-gray-900">{ride.price}</p>
                  <p className="text-gray-500 text-sm">per seat</p>
                </div>
                <Button
                  onClick={() => handleJoinRide(ride)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 rounded-lg font-semibold"
                >
                  Join Ride
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderPagination = (totalPages: number, currentPage: number, onPrev: () => void, onNext: () => void, onPageClick: (page: number) => void) => (
    <div className="flex items-center justify-center gap-4">
      <Button
        onClick={onPrev}
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
            onClick={() => onPageClick(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentPage ? "bg-yellow-500" : "bg-gray-300"
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={currentPage === totalPages - 1}
        variant="ghost"
        size="icon"
        className="rounded-full disabled:opacity-30"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )

  return (
    <>
      <section id="shared-rides-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-yellow-500 mb-4">Available Shared Rides</h2>
            <p className="text-gray-600 text-lg mb-2">Join other passengers and save money while traveling.</p>
            <p className="text-gray-600 text-lg mb-2">Real-time updates show live availability</p>
            {backendDown && (
              <p className="text-red-600 text-sm mt-2">Backend appears to be offline — live shared rides are unavailable.</p>
            )}
          </div>

          {/* One Time Rides Section */}
          <div className="mb-12">
            <h3 className="text-center text-3xl font-bold text-gray-900 mb-6">One Time Rides</h3>
            {displayedOneTimeRides.length > 0 ? (
              <>
                {renderRideCards(displayedOneTimeRides)}
                {renderPagination(
                  oneTimeTotalPages,
                  oneTimePage,
                  handleOneTimePrevPage,
                  handleOneTimeNextPage,
                  handleOneTimePageChange
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No one-time rides available.</p>
              </div>
            )}
          </div>

          {/* Daily Rides Section */}
          <div className="mb-12">
            <h3 className="text-center text-3xl font-bold text-gray-900 mb-6">Daily Rides</h3>
            {displayedDailyRides.length > 0 ? (
              <>
                {renderRideCards(displayedDailyRides)}
                {renderPagination(
                  dailyTotalPages,
                  dailyPage,
                  handleDailyPrevPage,
                  handleDailyNextPage,
                  handleDailyPageChange
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No daily rides available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <JoinRidePopup isOpen={isPopupOpen} onClose={handleClosePopup} rideData={selectedRide} />
    </>
  )
}
