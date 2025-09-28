"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, Clock, Users, ArrowRight, Plus, X } from "lucide-react"
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./map'), { ssr: false })

type TripType = 'one-way' | 'round-trip' | 'multi-city'

interface Destination {
  id: string
  location: string
}

export function BookingSection() {
  const [selectedTripType, setSelectedTripType] = useState<TripType>('one-way')
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    returnDate: '',
    returnTime: '',
    passengers: '',
    destinations: [{ id: '1', location: '' }, { id: '2', location: '' }] as Destination[]
  })

  const handleTripTypeChange = (tripType: TripType) => {
    setSelectedTripType(tripType)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addDestination = () => {
    const newId = Date.now().toString()
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { id: newId, location: '' }]
    }))
  }

  const removeDestination = (id: string) => {
    if (formData.destinations.length > 2) {
      setFormData(prev => ({
        ...prev,
        destinations: prev.destinations.filter(dest => dest.id !== id)
      }))
    }
  }

  const updateDestination = (id: string, location: string) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map(dest =>
        dest.id === id ? { ...dest, location } : dest
      )
    }))
  }
  return (
    <section id="booking-section" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-balance mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Book Your Ride
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Experience seamless taxi booking with our elegant and intuitive interface.
            Your journey starts here.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Trip Type Selector */}
                    <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
                      <Button
                        variant={selectedTripType === 'one-way' ? 'default' : 'ghost'}
                        size="sm"
                        className={`flex-1 rounded-lg transition-all ${
                          selectedTripType === 'one-way'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleTripTypeChange('one-way')}
                      >
                        One Way
                      </Button>
                      <Button
                        variant={selectedTripType === 'round-trip' ? 'default' : 'ghost'}
                        size="sm"
                        className={`flex-1 rounded-lg transition-all ${
                          selectedTripType === 'round-trip'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleTripTypeChange('round-trip')}
                      >
                        Round Trip
                      </Button>
                      <Button
                        variant={selectedTripType === 'multi-city' ? 'default' : 'ghost'}
                        size="sm"
                        className={`flex-1 rounded-lg transition-all ${
                          selectedTripType === 'multi-city'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleTripTypeChange('multi-city')}
                      >
                        Multi-City
                      </Button>
                    </div>

                    {/* Conditional Form Sections */}
                    {selectedTripType === 'one-way' && (
                      <>
                        {/* One Way Form */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="pickup" className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              From
                            </Label>
                            <Input
                              id="pickup"
                              placeholder="Enter pickup location"
                              value={formData.pickup}
                              onChange={(e) => handleInputChange('pickup', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-accent" />
                              To
                            </Label>
                            <Input
                              id="destination"
                              placeholder="Enter destination"
                              value={formData.destination}
                              onChange={(e) => handleInputChange('destination', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              Date
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={formData.date}
                              onChange={(e) => handleInputChange('date', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              Time
                            </Label>
                            <Input
                              id="time"
                              type="time"
                              value={formData.time}
                              onChange={(e) => handleInputChange('time', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {selectedTripType === 'round-trip' && (
                      <>
                        {/* Round Trip Form */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="pickup" className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              From
                            </Label>
                            <Input
                              id="pickup"
                              placeholder="Enter pickup location"
                              value={formData.pickup}
                              onChange={(e) => handleInputChange('pickup', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-accent" />
                              To
                            </Label>
                            <Input
                              id="destination"
                              placeholder="Enter destination"
                              value={formData.destination}
                              onChange={(e) => handleInputChange('destination', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </div>

                        {/* Outbound Date & Time */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-foreground">Outbound Journey</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Date
                              </Label>
                              <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Time
                              </Label>
                              <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => handleInputChange('time', e.target.value)}
                                className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Return Date & Time */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-foreground">Return Journey</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Label htmlFor="returnDate" className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Date
                              </Label>
                              <Input
                                id="returnDate"
                                type="date"
                                value={formData.returnDate}
                                onChange={(e) => handleInputChange('returnDate', e.target.value)}
                                className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="returnTime" className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Time
                              </Label>
                              <Input
                                id="returnTime"
                                type="time"
                                value={formData.returnTime}
                                onChange={(e) => handleInputChange('returnTime', e.target.value)}
                                className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedTripType === 'multi-city' && (
                      <>
                        {/* Multi-City Form */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              Starting Point
                            </Label>
                            <Input
                              placeholder="Enter starting location"
                              value={formData.pickup}
                              onChange={(e) => handleInputChange('pickup', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>

                          {/* Destinations */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-accent" />
                                Destinations
                              </Label>
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
                              {formData.destinations.map((dest, index) => (
                                <div key={dest.id} className="flex gap-2 items-center">
                                  <div className="flex-1">
                                    <Input
                                      placeholder={`Stop ${index + 1}`}
                                      value={dest.location}
                                      onChange={(e) => updateDestination(dest.id, e.target.value)}
                                      className="bg-background/50 border-border/50 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                  </div>
                                  {formData.destinations.length > 2 && (
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
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              Date
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={formData.date}
                              onChange={(e) => handleInputChange('date', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              Time
                            </Label>
                            <Input
                              id="time"
                              type="time"
                              value={formData.time}
                              onChange={(e) => handleInputChange('time', e.target.value)}
                              className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Passengers */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Passengers
                      </Label>
                      <Select value={formData.passengers} onValueChange={(value) => handleInputChange('passengers', value)}>
                        <SelectTrigger className="bg-background/50 border-border/50 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all">
                          <SelectValue placeholder="Select passengers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Passenger</SelectItem>
                          <SelectItem value="2">2 Passengers</SelectItem>
                          <SelectItem value="3">3 Passengers</SelectItem>
                          <SelectItem value="4">4+ Passengers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Book Button */}
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                      size="lg"
                      onClick={() => {
                        console.log('Form Data:', { selectedTripType, ...formData })
                        // Here you would typically submit the form data to your backend
                        alert(`Booking ${selectedTripType} trip with form data logged to console`)
                      }}
                    >
                      Find Your Ride
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-3">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Map</h3>
                    <p className="text-muted-foreground text-sm">Track available rides in real-time</p>
                  </div>
                  <div className="h-[500px] relative">
                    <Map />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
