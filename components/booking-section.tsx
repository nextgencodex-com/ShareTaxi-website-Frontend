"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, ChevronDown, Plus, X, MapPin, ChevronUp } from "lucide-react"
import dynamic from 'next/dynamic'
import { BookingDetailsPopup } from "./booking-details-popup"
import { useIsMobile } from "@/hooks/use-mobile"

const Map = dynamic(() => import('./map'), { ssr: false })

interface Destination {
  id: string
  location: string
}

export function BookingSection() {
  const isMobile = useIsMobile()
  const [showMapMobile, setShowMapMobile] = useState(false)

  const [tripType, setTripType] = useState("one-way")
  const [rideType, setRideType] = useState("shared")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [passengers, setPassengers] = useState("02")
  const [luggage, setLuggage] = useState("04")
  const [from, setFrom] = useState("Galle")
  const [to, setTo] = useState("Colombo")
  const [date, setDate] = useState("2025-09-20")
  const [customTime, setCustomTime] = useState("")

  const [destinations, setDestinations] = useState<Destination[]>([
    { id: '1', location: '' },
    { id: '2', location: '' }
  ])

  const [startingPoint, setStartingPoint] = useState("Colombo")

  const [showBookingPopup, setShowBookingPopup] = useState(false)

  const timeSlots = [
    "6 - 8 am", "8 - 10 am", "10 - 12 pm", "12 - 2 pm", "2 - 4 pm",
    "4 - 6 pm", "6 - 8 pm", "8 - 10 pm", "10 - 12 am"
  ]

  const addDestination = () => {
    const newId = Date.now().toString()
    setDestinations(prev => [...prev, { id: newId, location: '' }])
  }

  const removeDestination = (id: string) => {
    if (destinations.length > 2) {
      setDestinations(prev => prev.filter(dest => dest.id !== id))
    }
  }

  const updateDestination = (id: string, location: string) => {
    setDestinations(prev => prev.map(dest =>
      dest.id === id ? { ...dest, location } : dest
    ))
  }

  const handleNextClick = () => {
    const bookingData = {
      from: tripType === 'multi-city' ? startingPoint : from,
      to,
      rideType,
      date,
      time: rideType === "shared" ? selectedTimeSlot : customTime,
      passengers,
      luggage,
      tripType,
      destinations: tripType === 'multi-city' ? destinations : undefined,
    }
    setShowBookingPopup(true)
  }

  return (
    <>
      <section id="booking-section" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-balance mb-4">Book Your Taxi with Ease</h2>
            <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
              Simple booking process with real-time tracking and instant confirmation. Choose your pickup location and
              we'll handle the rest.
            </p>
          </div>

          <div className="space-y-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 space-y-8">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="w-16 h-0.5 bg-gray-300"></div>
                      <div className="w-4 h-4 border-2 border-blue-500 bg-white rounded-full"></div>
                      <div className="w-16 h-0.5 bg-gray-300"></div>
                      <div className="w-4 h-4 border-2 border-blue-500 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={tripType === "one-way" ? "default" : "ghost"}
                      size="sm"
                      className={
                        tripType === "one-way"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }
                      onClick={() => setTripType("one-way")}
                    >
                      One Way
                    </Button>
                    <Button
                      variant={tripType === "round-trip" ? "default" : "ghost"}
                      size="sm"
                      className={
                        tripType === "round-trip"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }
                      onClick={() => setTripType("round-trip")}
                    >
                      Round Trip
                    </Button>
                    <Button
                      variant={tripType === "multi-city" ? "default" : "ghost"}
                      size="sm"
                      className={
                        tripType === "multi-city"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }
                      onClick={() => setTripType("multi-city")}
                    >
                      Multi-City
                    </Button>
                  </div>

                  {tripType === 'multi-city' ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">Multi-City Tour</h3>
                      <div className="space-y-3">
                        <Label className="text-gray-700 font-medium">Starting Point</Label>
                        <Input
                          value={startingPoint}
                          onChange={(e) => setStartingPoint(e.target.value)}
                          className="bg-blue-50 border-blue-200 text-gray-800 placeholder:text-gray-500 h-12"
                          placeholder="Enter starting location"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 font-medium">Destinations</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addDestination}
                            className="h-8 px-3 rounded-lg"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Stop
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {destinations.map((dest, index) => (
                            <div key={dest.id} className="flex gap-2 items-center">
                              <div className="flex-1">
                                <Input
                                  placeholder={`Stop ${index + 1}`}
                                  value={dest.location}
                                  onChange={(e) => updateDestination(dest.id, e.target.value)}
                                  className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                                />
                              </div>
                              {destinations.length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeDestination(dest.id)}
                                  className="h-12 px-3 rounded-lg hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Pickup Date</Label>
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Pickup Time</Label>
                          <Input
                            type="time"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">No of Passengers</Label>
                          <div className="relative">
                            <select
                              value={passengers}
                              onChange={(e) => setPassengers(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-10"
                            >
                              <option value="01">01</option>
                              <option value="02">02</option>
                              <option value="03">03</option>
                              <option value="04">04</option>
                              <option value="05">05</option>
                              <option value="06">06</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">No of Luggage</Label>
                          <div className="relative">
                            <select
                              value={luggage}
                              onChange={(e) => setLuggage(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-10"
                            >
                              <option value="01">01</option>
                              <option value="02">02</option>
                              <option value="03">03</option>
                              <option value="04">04</option>
                              <option value="05">05</option>
                              <option value="06">06</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">{tripType === 'round-trip' ? 'Round Trip' : 'Tour'} Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="from" className="text-gray-700 font-medium">
                            From
                          </Label>
                          <Input
                            id="from"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="bg-blue-50 border-blue-200 text-gray-800 placeholder:text-gray-500 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="to" className="text-gray-700 font-medium">
                            To
                          </Label>
                          <Input
                            id="to"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="bg-blue-50 border-blue-200 text-gray-800 placeholder:text-gray-500 h-12"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="shared"
                            name="rideType"
                            value="shared"
                            checked={rideType === "shared"}
                            onChange={(e) => setRideType(e.target.value)}
                            className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                          />
                          <Label htmlFor="shared" className="text-gray-700 font-medium">
                            Shared
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="personal"
                            name="rideType"
                            value="personal"
                            checked={rideType === "personal"}
                            onChange={(e) => setRideType(e.target.value)}
                            className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                          />
                          <Label htmlFor="personal" className="text-gray-700 font-medium">
                            Personal
                          </Label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup-date" className="text-gray-700 font-medium">
                          Pickup Date
                        </Label>
                        <div className="relative">
                          <Input
                            id="pickup-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Pickup Time</Label>
                        {rideType === "shared" ? (
                          <div className="relative">
                            <select
                              value={selectedTimeSlot}
                              onChange={(e) => setSelectedTimeSlot(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-10"
                            >
                              <option value="">Select a time slot</option>
                              {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                          </div>
                        ) : (
                          <Input
                            type="time"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">No of Passengers</Label>
                          <div className="relative">
                            <select
                              value={passengers}
                              onChange={(e) => setPassengers(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-10"
                            >
                              <option value="01">01</option>
                              <option value="02">02</option>
                              <option value="03">03</option>
                              <option value="04">04</option>
                              <option value="05">05</option>
                              <option value="06">06</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">No of Luggage</Label>
                          <div className="relative">
                            <select
                              value={luggage}
                              onChange={(e) => setLuggage(e.target.value)}
                              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md text-gray-800 appearance-none pr-10"
                            >
                              <option value="01">01</option>
                              <option value="02">02</option>
                              <option value="03">03</option>
                              <option value="04">04</option>
                              <option value="05">05</option>
                              <option value="06">06</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleNextClick}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3 text-lg font-medium"
                    size="lg"
                  >
                    Next →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Map - Always Visible */}
            {!isMobile && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Map</h3>
                    <p className="text-muted-foreground text-sm">Track available rides in real-time</p>
                  </div>
                  <div className="h-[500px] relative">
                    <Map keyName="booking" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                  </div>
                </CardContent>
              </Card>
            )}
            </div>

            {/* Mobile Toggle Button */}
            {isMobile && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowMapMobile(!showMapMobile)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <MapPin className="h-5 w-5" />
                  <span>{showMapMobile ? 'Hide Map' : 'Show Map'}</span>
                  {showMapMobile ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Mobile Map - Show When Toggled */}
            {isMobile && showMapMobile && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden transition-all duration-500 ease-in-out">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Map</h3>
                    <p className="text-muted-foreground text-sm">Track available rides in real-time</p>
                  </div>
                  <div className="h-[400px] relative">
                    <Map keyName="booking" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <BookingDetailsPopup
        isOpen={showBookingPopup}
        onClose={() => setShowBookingPopup(false)}
        bookingData={
          showBookingPopup
            ? {
                from,
                to,
                rideType,
                date,
                time: rideType === "shared" ? selectedTimeSlot : customTime,
                passengers,
                luggage,
                tripType,
              }
            : null
        }
      />
    </>
  )
}
