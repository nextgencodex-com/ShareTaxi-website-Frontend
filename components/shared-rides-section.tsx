"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { JoinRidePopup } from "./join-ride-popup"

// 🧭 For mobile swipe view
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

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
  },
  time: string
  duration: string
  seats: {
    available: number
    total: number
  },
  price: string
  pickupDate?: Date | null
  pickupDateFormatted?: string
}

interface SharedRidesSectionProps {
  initialRides?: Ride[]
  backendDown?: boolean
}

export function SharedRidesSection({ initialRides = [], backendDown = false }: SharedRidesSectionProps) {

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [oneTimePage, setOneTimePage] = useState(0)
  const [dailyPage, setDailyPage] = useState(0)
  const [rides, setRides] = useState<Ride[]>([])
  const [loadingRides, setLoadingRides] = useState<boolean>(false)

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoadingRides(true)
        const res = await fetch('http://localhost:5000/api/shared-rides', { cache: 'no-store', headers: { 'Accept': 'application/json' } })
        if (!res.ok) {
          const text = await res.text()
          console.error('Failed to fetch shared rides:', res.status, text)
          setRides(initialRides)
          return
        }

        const json = await res.json()
        const payload = json as unknown
        const items = Array.isArray(payload)
          ? payload as unknown[]
          : (typeof payload === 'object' && payload !== null && Array.isArray((payload as Record<string, unknown>)['rides']))
            ? (payload as Record<string, unknown>)['rides'] as unknown[]
            : (typeof payload === 'object' && payload !== null && Array.isArray(((payload as Record<string, unknown>)['data'] as Record<string, unknown>)?.['rides']))
              ? (((payload as Record<string, unknown>)['data'] as Record<string, unknown>)['rides'] as unknown[])
              : []

        const parsed: Ride[] = (items as unknown[]).map((item) => {
          const r = item as Record<string, unknown>
          const frequencyVal = (r.frequency as string) ?? ((r.rawPayload && (r.rawPayload as Record<string, unknown>)['frequency']) as string) ?? 'one-time'

          const pickupObj = (r.pickup && typeof r.pickup === 'object')
            ? (r.pickup as Record<string, unknown>)
            : { location: String(r['pickupLocation'] ?? ''), type: String(r['pickupType'] ?? 'Pickup point') }

          const destinationObj = (r.destination && typeof r.destination === 'object')
            ? (r.destination as Record<string, unknown>)
            : { location: String(r['destinationLocation'] ?? ''), type: String(r['destinationType'] ?? 'Destination') }

          const seatsObj = (r.seats && typeof r.seats === 'object')
            ? (r.seats as Record<string, unknown>)
            : { available: Number(r['availableSeats'] ?? 0), total: Number(r['totalSeats'] ?? 0) }

          let postedDate: Date
          if (r.createdAt !== undefined && r.createdAt !== null) {
            const createdAt = r.createdAt
            if (typeof createdAt === 'object' && 'seconds' in (createdAt as Record<string, unknown>)) {
              const secs = Number((createdAt as Record<string, unknown>)['seconds'])
              postedDate = new Date(Number(secs) * 1000)
            } else {
              postedDate = new Date(String(createdAt))
            }
          } else if (r.postedDate !== undefined && r.postedDate !== null) {
            postedDate = new Date(String(r.postedDate))
          } else {
            postedDate = new Date()
          }

          let pickupDate: Date | null = null
          let pickupDateFormatted = ''
          const rawPayload = r.rawPayload as Record<string, unknown> | undefined
          const rawPdFromPayload = rawPayload ? rawPayload['pickupDate'] : undefined
          if (rawPdFromPayload !== undefined && rawPdFromPayload !== null) {
            const rawPdStr = String(rawPdFromPayload)
            const d = new Date(rawPdStr)
            if (!isNaN(d.getTime())) {
              pickupDate = d
              pickupDateFormatted = d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
            }
          }
          if (!pickupDate && r.pickupDate !== undefined && r.pickupDate !== null) {
            const pd = r.pickupDate
            if (typeof pd === 'object' && ('seconds' in (pd as Record<string, unknown>) || '_seconds' in (pd as Record<string, unknown>))) {
              const secs = Number((pd as Record<string, unknown>)['seconds'] ?? (pd as Record<string, unknown>)['_seconds'])
              if (!isNaN(secs)) {
                pickupDate = new Date(secs * 1000)
                pickupDateFormatted = pickupDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
              }
            } else {
              const d = new Date(String(pd))
              if (!isNaN(d.getTime())) {
                pickupDate = d
                pickupDateFormatted = d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
              }
            }
          }

          return Object.assign({}, r, { postedDate, pickupDate, pickupDateFormatted, frequency: frequencyVal, pickup: pickupObj, destination: destinationObj, seats: seatsObj }) as unknown as Ride
        })

        parsed.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
        setRides(parsed)
      } catch (err) {
        console.error('Error fetching shared rides:', err)
        setRides(initialRides)
      } finally {
        setLoadingRides(false)
      }
    }

    fetchRides()

    const handleRideBooked = () => {
      fetchRides()
    }

    window.addEventListener('rideBooked', handleRideBooked)
    return () => window.removeEventListener('rideBooked', handleRideBooked)
  }, [initialRides])

  const oneTimeRides = useMemo(() =>
    rides.filter((ride) => ride.frequency === "one-time" && (ride.seats?.available ?? 0) > 0), [rides])
  const dailyRides = useMemo(() =>
    rides.filter((ride) => ride.frequency === "daily" && (ride.seats?.available ?? 0) > 0), [rides])

  const ridesPerPage = 3
  const oneTimeTotalPages = Math.ceil(oneTimeRides.length / ridesPerPage)
  const dailyTotalPages = Math.ceil(dailyRides.length / ridesPerPage)
  const oneTimeStartIndex = oneTimePage * ridesPerPage
  const dailyStartIndex = dailyPage * ridesPerPage
  const displayedOneTimeRides = oneTimeRides.slice(oneTimeStartIndex, oneTimeStartIndex + ridesPerPage)
  const displayedDailyRides = dailyRides.slice(dailyStartIndex, dailyStartIndex + ridesPerPage)

  const handleJoinRide = (ride: Ride) => {
    setSelectedRide(ride)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedRide(null)
  }

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  }

  const renderRideCards = (rides: Ride[]) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {rides.map((ride) => (
        <Card key={ride.id} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-center mb-4 space-x-2">
                {ride.frequency !== 'daily' && (
                  <Badge className="bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-sm">
                    Date: {ride.pickupDateFormatted || ride.postedDate.toLocaleDateString()}
                  </Badge>
                )}
                <Badge className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm">
                  Pickup Time: {ride.time || 'N/A'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-2 w-2 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ride.pickup?.location || 'Unknown'}</p>
                    <p className="text-gray-500 text-sm">{ride.pickup?.type || 'Pickup point'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-2 w-2 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-gray-900">{ride.destination?.location || 'Unknown'}</p>
                    <p className="text-gray-500">{ride.destination?.type || 'Destination'}</p>
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
                    <p className="text-gray-500 text-sm">Pickup Time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {(ride.seats?.available ?? 0)}/{(ride.seats?.total ?? 0)} Persons
                    </p>
                    <p className="text-gray-500 text-sm">Available</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {ride.price && !ride.price.startsWith('$') ? `$${ride.price}` : ride.price}
                  </p>
                  <p className="text-gray-500 text-sm">per person</p>
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
      <Button onClick={onPrev} disabled={currentPage === 0} variant="ghost" size="icon" className="rounded-full disabled:opacity-30">
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => onPageClick(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentPage ? "bg-yellow-500" : "bg-gray-300"}`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      <Button onClick={onNext} disabled={currentPage === totalPages - 1} variant="ghost" size="icon" className="rounded-full disabled:opacity-30">
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

            {/* ✅ Mobile Swipe View */}
            <div className="block md:hidden">
              <Slider {...sliderSettings}>
                {oneTimeRides.map((ride) => (
                  <div key={ride.id} className="px-3">{renderRideCards([ride])}</div>
                ))}
              </Slider>
            </div>

            {/* ✅ Desktop Grid */}
            <div className="hidden md:block">
              {displayedOneTimeRides.length > 0 ? (
                <>
                  {renderRideCards(displayedOneTimeRides)}
                  {renderPagination(oneTimeTotalPages, oneTimePage, () => setOneTimePage(Math.max(0, oneTimePage - 1)), () => setOneTimePage(Math.min(oneTimeTotalPages - 1, oneTimePage + 1)), (p) => setOneTimePage(p))}
                </>
              ) : (
                <div className="text-center py-8">
                  {loadingRides ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="mt-4 text-gray-600">Loading one-time rides...</p>
                    </>
                  ) : (
                    <p className="text-gray-500 text-lg">No one-time rides available.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Daily Rides Section */}
          <div className="mb-12">
            <h3 className="text-center text-3xl font-bold text-gray-900 mb-6">Daily Rides</h3>

            {/* ✅ Mobile Swipe View */}
            <div className="block md:hidden">
              <Slider {...sliderSettings}>
                {dailyRides.map((ride) => (
                  <div key={ride.id} className="px-3">{renderRideCards([ride])}</div>
                ))}
              </Slider>
            </div>

            {/* ✅ Desktop Grid */}
            <div className="hidden md:block">
              {displayedDailyRides.length > 0 ? (
                <>
                  {renderRideCards(displayedDailyRides)}
                  {renderPagination(dailyTotalPages, dailyPage, () => setDailyPage(Math.max(0, dailyPage - 1)), () => setDailyPage(Math.min(dailyTotalPages - 1, dailyPage + 1)), (p) => setDailyPage(p))}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No daily rides available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <JoinRidePopup isOpen={isPopupOpen} onClose={handleClosePopup} rideData={selectedRide} />
    </>
  )
}
