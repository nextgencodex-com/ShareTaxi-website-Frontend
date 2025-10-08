"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Clock, Users, MapPin, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { JoinRidePopup } from "./join-ride-popup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
      time: "02-04 pm",
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
      time: "06-08 am",
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
      time: "08-10 am",
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
      time: "04-06 pm",
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
      time: "05-07 am",
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
      time: "12-02 pm",
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
      time: "10-12 am",
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
      time: "03-05 pm",
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
      time: "07-09 am",
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFrequency, setFilterFrequency] = useState("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [rides, setRides] = useState<Ride[]>([])

  useEffect(() => {
    setRides([...initialRides, ...defaultRides])
  }, [initialRides])

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === "" ||
        ride.pickup.location.toLowerCase().includes(searchLower) ||
        ride.destination.location.toLowerCase().includes(searchLower) ||
        ride.vehicle.toLowerCase().includes(searchLower) ||
        ride.driver.name.toLowerCase().includes(searchLower)

      const matchesFrequency = filterFrequency === "all" || ride.frequency === filterFrequency

      return matchesSearch && matchesFrequency
    })
  }, [rides, searchQuery, filterFrequency])

  const ridesPerPage = 3
  const totalPages = Math.ceil(filteredRides.length / ridesPerPage)
  const startIndex = currentPage * ridesPerPage
  const displayedRides = filteredRides.slice(startIndex, startIndex + ridesPerPage)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(0)
  }

  const handleFilterChange = (value: string) => {
    setFilterFrequency(value)
    setCurrentPage(0)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleJoinRide = (ride: Ride) => {
    setSelectedRide(ride)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedRide(null)
  }

  return (
    <>
      <section id="shared-rides-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-yellow-500 mb-4">Available Shared Rides</h2>
            <p className="text-gray-600 text-lg mb-2">Join other passengers and save money while traveling.</p>
            <p className="text-gray-600 text-lg mb-8">Real-time updates show live availability</p>

            <div className="max-w-2xl mx-auto mb-12 flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search by location and vehicle..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-12 text-center border-2 border-blue-200 rounded-full bg-white text-gray-500"
                />
              </div>
              <Select value={filterFrequency} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-48 h-12 border-2 border-blue-200 rounded-full bg-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rides</SelectItem>
                  <SelectItem value="one-time">One Time Ride</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {displayedRides.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedRides.map((ride) => (
                  <Card key={ride.id} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                          <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 rounded-full px-3 py-1 text-sm">
                            {ride.timeAgo}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={ride.driver.image || "/placeholder.svg"} alt={ride.driver.name} />
                            <AvatarFallback>
                              {ride.driver.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-lg text-gray-900">{ride.driver.name}</p>
                            <p className="text-gray-600">{ride.vehicle}</p>
                          </div>
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
                              <p className="font-semibold text-gray-900">{ride.destination.location}</p>
                              <p className="text-gray-500 text-sm">{ride.destination.type}</p>
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

              <div className="flex items-center justify-center gap-4">
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
              <p className="text-gray-500 text-lg">No rides found matching your search criteria.</p>
            </div>
          )}
        </div>
      </section>

      <JoinRidePopup isOpen={isPopupOpen} onClose={handleClosePopup} rideData={selectedRide} />
    </>
  )
}
