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
}

export function SharedRidesSection({ initialRides = [] }: SharedRidesSectionProps) {
  const defaultRides = useMemo(() => [
    {
      id: 1,
      timeAgo: "10 min ago",
      postedDate: new Date(Date.now() - 10 * 60 * 1000),
      frequency: "one-time",
      driver: {
      name: "Alex Chen",
      image: "/professional-driver-headshot.jpg",
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
      time: "2025-10-20 2-4 PM",
      duration: "45 min",
      seats: {
        available: 3,
        total: 6,
      },
      price: "$20.00",
    },
    {
      id: 2,
      timeAgo: "25 min ago",
      postedDate: new Date(Date.now() - 25 * 60 * 1000),
      frequency: "daily",
      driver: {
        name: "Sarah Wilson",
        image: "/female-professional-driver.jpg",
      },
      vehicle: "Hyundai Starex",
      pickup: {
        location: "Galle Fort",
        type: "Pickup point",
      },
      destination: {
        location: "Colombo City Center",
        type: "Destination",
      },
      time: "2025-10-21 6-8 AM",
      duration: "2 hours",
      seats: {
        available: 4,
        total: 8,
      },
      price: "$15.00",
    },
    {
      id: 3,
      timeAgo: "1 hour ago",
      postedDate: new Date(Date.now() - 60 * 60 * 1000),
      frequency: "monthly",
      driver: {
        name: "Michael Chen",
        image: "/professional-driver-headshot.jpg",
      },
      vehicle: "Toyota Innova",
      pickup: {
        location: "Kandy Central",
        type: "Pickup point",
      },
      destination: {
        location: "Nuwara Eliya",
        type: "Destination",
      },
      time: "2025-10-22 8-10 AM",
      duration: "3 hours",
      seats: {
        available: 2,
        total: 6,
      },
      price: "$25.00",
    },
    {
      id: 4,
      timeAgo: "2 hours ago",
      postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      frequency: "daily",
      driver: {
        name: "David Kim",
      image: "/professional-driver-headshot.jpg",
      },
      vehicle: "Toyota Alphard",
      pickup: {
        location: "Negombo Beach",
        type: "Pickup point",
      },
      destination: {
        location: "Airport Terminal 2",
        type: "Destination",
      },
      time: "2025-10-23 4-6 PM",
      duration: "30 min",
      seats: {
        available: 5,
        total: 6,
      },
      price: "$10.00",
    },
    {
      id: 5,
      timeAgo: "3 hours ago",
      postedDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
      frequency: "yearly",
      driver: {
        name: "Emma Johnson",
      image: "/young-professional-woman.png",
      },
      vehicle: "Hyundai Starex",
      pickup: {
        location: "Downtown Plaza",
        type: "Pickup point",
      },
      destination: {
        location: "Sigiriya Rock",
        type: "Destination",
      },
      time: "2025-10-24 5-7 AM",
      duration: "4 hours",
      seats: {
        available: 3,
        total: 8,
      },
      price: "$35.00",
    },
    {
      id: 6,
      timeAgo: "5 hours ago",
      postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      frequency: "one-time",
      driver: {
        name: "James Brown",
        image: "/images/james-brown-driver.jpg",
      },
      vehicle: "Toyota Innova",
      pickup: {
        location: "Colombo Fort",
        type: "Pickup point",
      },
      destination: {
        location: "Galle Face",
        type: "Destination",
      },
      time: "2025-10-25 12-2 PM",
      duration: "20 min",
      seats: {
        available: 4,
        total: 6,
      },
      price: "$2.00",
    },
    {
      id: 7,
      timeAgo: "6 hours ago",
      postedDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
      frequency: "monthly",
      driver: {
        name: "Lisa Anderson",
        image: "/images/lisa-anderson-driver.jpg",
      },
      vehicle: "Toyota Alphard",
      pickup: {
        location: "Airport Terminal 1",
        type: "Pickup point",
      },
      destination: {
        location: "Bentota Beach",
        type: "Destination",
      },
      time: "2025-10-26 10-12 AM",
      duration: "2.5 hours",
      seats: {
        available: 2,
        total: 6,
      },
      price: "$22.00",
    },
    {
      id: 8,
      timeAgo: "8 hours ago",
      postedDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
      frequency: "daily",
      driver: {
        name: "Robert Taylor",
        image: "/images/robert-taylor-driver.jpg",
      },
      vehicle: "Hyundai Starex",
      pickup: {
        location: "Kandy Lake",
        type: "Pickup point",
      },
      destination: {
        location: "Temple of Tooth",
        type: "Destination",
      },
      time: "2025-10-27 3-5 PM",
      duration: "15 min",
      seats: {
        available: 6,
        total: 8,
      },
      price: "$5.00",
    },
    {
      id: 9,
      timeAgo: "10 hours ago",
      postedDate: new Date(Date.now() - 10 * 60 * 60 * 1000),
      frequency: "yearly",
      driver: {
        name: "Maria Garcia",
        image: "/images/maria-garcia-driver.jpg",
      },
      vehicle: "Toyota Innova",
      pickup: {
        location: "Ella Station",
        type: "Pickup point",
      },
      destination: {
        location: "Nine Arch Bridge",
        type: "Destination",
      },
      time: "2025-10-28 7-9 AM",
      duration: "1 hour",
      seats: {
        available: 3,
        total: 6,
      },
      price: "$18.00",
    },
  ], [])

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [oneTimePage, setOneTimePage] = useState(0)
  const [dailyPage, setDailyPage] = useState(0)
  const [rides, setRides] = useState<Ride[]>([])

  useEffect(() => {
    // Load booked rides from localStorage
    const loadBookedRides = () => {
      try {
        const bookedRides = localStorage.getItem('bookedRides')
        if (bookedRides) {
          const parsedBookedRides = JSON.parse(bookedRides).map((ride: any) => ({
            ...ride,
            postedDate: new Date(ride.postedDate)
          }))
          const allRides = [...parsedBookedRides, ...initialRides, ...defaultRides]
          // Sort by postedDate (newest first)
          allRides.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
          setRides(allRides)
        } else {
          const allRides = [...initialRides, ...defaultRides]
          // Sort by postedDate (newest first)
          allRides.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
          setRides(allRides)
        }
      } catch (error) {
        console.error('Error loading booked rides:', error)
        setRides([...initialRides, ...defaultRides])
      }
    }

    loadBookedRides()

    // Listen for new booked rides
    const handleRideBooked = () => {
      loadBookedRides()
    }

    window.addEventListener('rideBooked', handleRideBooked)

    return () => {
      window.removeEventListener('rideBooked', handleRideBooked)
    }
  }, [initialRides])

  // Filter out expired rides
  const isRideExpired = (ride: Ride) => {
    try {
      // Parse the time string to extract date and time
      const timeString = ride.time
      if (!timeString) return false
      
      // Split by space to get date, time, and AM/PM
      const parts = timeString.split(' ')
      if (parts.length >= 3) {
        const dateStr = parts[0]
        const timeStr = parts[1]
        const ampm = parts[2]
        
        // Create a date object from the date string
        const rideDate = new Date(dateStr)
        if (isNaN(rideDate.getTime())) return false
        
        // Parse time and AM/PM
        const [timeRange] = timeStr.split('-')
        const hour = parseInt(timeRange)
        let adjustedHour = hour
        
        if (ampm === 'PM' && hour !== 12) {
          adjustedHour += 12
        } else if (ampm === 'AM' && hour === 12) {
          adjustedHour = 0
        }
        
        // Set the time on the date
        rideDate.setHours(adjustedHour, 0, 0, 0)
        
        // Check if the ride date/time is in the past
        return rideDate < new Date()
      }
      
      return false
    } catch (error) {
      console.error('Error parsing ride time:', error)
      return false
    }
  }

  const oneTimeRides = useMemo(() => 
    rides.filter((ride) => ride.frequency === "one-time" && !isRideExpired(ride)), [rides])
  const dailyRides = useMemo(() => 
    rides.filter((ride) => ride.frequency === "daily" && !isRideExpired(ride)), [rides])

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

  const handleUpdateSeats = (rideId: number, seatsBooked: number) => {
    console.log('handleUpdateSeats called - rideId:', rideId, 'seatsBooked:', seatsBooked)
    console.log('Current rides before update:', rides)
    setRides(prevRides => {
      const updatedRides = prevRides.map(ride => 
        ride.id === rideId 
          ? { 
              ...ride, 
              seats: { 
                ...ride.seats, 
                available: Math.max(0, ride.seats.available - seatsBooked) 
              } 
            }
          : ride
      )
      console.log('Updated rides after seat update:', updatedRides)
      return updatedRides
    })
  }

  // Helper function to parse ride time and extract date and pickup time
  const parseRideTime = (timeString: string) => {
    try {
      if (!timeString) return { date: 'N/A', pickupTime: 'N/A' }
      
      // Split by space to get date, time, and AM/PM
      const parts = timeString.split(' ')
      if (parts.length >= 3) {
        const dateStr = parts[0]
        const timeStr = parts[1]
        const ampm = parts[2]
        
        // Format the date (YYYY-MM-DD to MM/DD/YYYY)
        const date = new Date(dateStr)
        const formattedDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        })
        
        // Format the pickup time with proper time range format
        const formattedPickupTime = `${timeStr} ${ampm}`
        
        return { date: formattedDate, pickupTime: formattedPickupTime }
      }
      
      // Handle legacy format (time only)
      return { date: 'N/A', pickupTime: timeString }
    } catch (error) {
      console.error('Error parsing ride time:', error)
      return { date: 'N/A', pickupTime: timeString }
    }
  }

  const renderRideCards = (rides: Ride[]) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {rides.map((ride) => {
        const { date, pickupTime } = parseRideTime(ride.time)
        return (
        <Card key={ride.id} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 rounded-full px-4 py-2 text-sm">
                  Date and Time: {date} | {pickupTime}
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
                    <p className="font-semibold text-gray-900">{pickupTime}</p>
                    <p className="text-gray-500 text-sm">Pickup Time</p>
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
                  <p className="text-xl font-bold text-gray-900">
                    {ride.price && !ride.price.startsWith('$') ? `$${ride.price}` : ride.price}
                  </p>
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
        )
      })}
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
            <p className="text-gray-600 text-lg mb-8">Real-time updates show live availability</p>
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

      <JoinRidePopup isOpen={isPopupOpen} onClose={handleClosePopup} rideData={selectedRide} onUpdateSeats={handleUpdateSeats} />
    </>
  )
}
