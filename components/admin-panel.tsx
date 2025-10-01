"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"

interface RideData {
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
  passengers: string
  luggage: string
  handCarry: string
  price: string
}

interface VehicleData {
  id: number
  name: string
  price: string
  passengers: string
  luggage: string
  handCarry: string
  image: string
  features: string[]
  gradient: string
  buttonColor: string
}

interface AdminPanelProps {
  onBack: () => void
  onAddRide: (ride: RideData) => void
  onAddVehicle: (vehicle: VehicleData) => void
}

export function AdminPanel({ onBack, onAddRide, onAddVehicle }: AdminPanelProps) {
  const timeSlots = [
    "6-8 am", "8-10 am", "10-12 pm", "12-2 pm", "2-4 pm",
    "4-6 pm", "6-8 pm", "8-10 pm", "10-12 am"
  ]

  const passengerOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString())
  const luggageOptions = Array.from({ length: 7 }, (_, i) => i.toString())
  const handCarryOptions = Array.from({ length: 6 }, (_, i) => i.toString())

  // Shared Ride Form State
  const [rideForm, setRideForm] = useState({
    driverName: "",
    driverImage: "",
    vehicle: "",
    pickupLocation: "",
    destinationLocation: "",
    time: "",
    duration: "",
    passengers: "1",
    luggage: "0",
    handCarry: "0",
    availableSeats: "",
    totalSeats: "",
    price: "",
    frequency: "one-time",
  })

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    price: "",
    passengers: "4",
    luggage: "2",
    handCarry: "2",
    image: "",
    feature1: "",
    feature2: "",
    feature3: "",
  })

  // File states for image uploads
  const [driverImageFile, setDriverImageFile] = useState<File | null>(null)
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null)

  // Handle file selection and convert to data URL
  const handleDriverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDriverImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setRideForm({ ...rideForm, driverImage: dataUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVehicleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVehicleImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setVehicleForm({ ...vehicleForm, image: dataUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRideSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate seat numbers
    const availableSeats = Number.parseInt(rideForm.availableSeats)
    const totalSeats = Number.parseInt(rideForm.totalSeats)

    if (isNaN(availableSeats) || isNaN(totalSeats) || availableSeats < 0 || totalSeats < 0) {
      alert("Please enter valid positive numbers for available seats and total seats.")
      return
    }

    if (availableSeats > totalSeats) {
      alert("Available seats cannot exceed total seats.")
      return
    }

    const newRide = {
      id: Date.now(),
      timeAgo: "Just now",
      postedDate: new Date(),
      frequency: rideForm.frequency,
      driver: {
        name: rideForm.driverName,
        image: rideForm.driverImage || "/images/alex-chen-driver.jpg",
      },
      vehicle: rideForm.vehicle,
      pickup: {
        location: rideForm.pickupLocation,
        type: "Pickup point",
      },
      destination: {
        location: rideForm.destinationLocation,
        type: "Destination",
      },
      time: rideForm.time,
      duration: rideForm.duration,
      passengers: rideForm.passengers,
      luggage: rideForm.luggage,
      handCarry: rideForm.handCarry,
      seats: {
        available: availableSeats,
        total: totalSeats,
      },
      price: rideForm.price,
    }

    onAddRide(newRide)

    // Reset form
    setRideForm({
      driverName: "",
      driverImage: "",
      vehicle: "",
      pickupLocation: "",
      destinationLocation: "",
      time: "",
      duration: "",
      passengers: "1",
      luggage: "0",
      handCarry: "0",
      availableSeats: "",
      totalSeats: "",
      price: "",
      frequency: "one-time",
    })
    setDriverImageFile(null)

    alert("Shared ride added successfully!")
  }

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newVehicle = {
      id: Date.now(),
      name: vehicleForm.name,
      price: vehicleForm.price,
      passengers: vehicleForm.passengers,
      luggage: vehicleForm.luggage,
      handCarry: vehicleForm.handCarry,
      image: vehicleForm.image || "/images/toyota-innova.jpg",
      features: [vehicleForm.feature1, vehicleForm.feature2, vehicleForm.feature3].filter((f) => f),
      gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    }

    onAddVehicle(newVehicle)

    // Reset form
    setVehicleForm({
      name: "",
      price: "",
      passengers: "4",
      luggage: "2",
      handCarry: "2",
      image: "",
      feature1: "",
      feature2: "",
      feature3: "",
    })
    setVehicleImageFile(null)

    alert("Vehicle added successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">Admin Panel</h1>

        <Tabs defaultValue="rides" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rides">Add Shared Ride</TabsTrigger>
            <TabsTrigger value="vehicles">Add Vehicle</TabsTrigger>
          </TabsList>

          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle>Add New Shared Ride</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRideSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Driver Name</label>
                      <Input
                        required
                        value={rideForm.driverName}
                        onChange={(e) => setRideForm({ ...rideForm, driverName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">Driver Image</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleDriverImageChange}
                        className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                      />
                      <Input
                        value={rideForm.driverImage}
                        onChange={(e) => setRideForm({ ...rideForm, driverImage: e.target.value })}
                        className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle</label>
                    <Input
                      required
                      value={rideForm.vehicle}
                      onChange={(e) => setRideForm({ ...rideForm, vehicle: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pickup Location</label>
                      <Input
                        required
                        value={rideForm.pickupLocation}
                        onChange={(e) => setRideForm({ ...rideForm, pickupLocation: e.target.value })}
                        placeholder=""
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Destination</label>
                      <Input
                        required
                        value={rideForm.destinationLocation}
                        onChange={(e) => setRideForm({ ...rideForm, destinationLocation: e.target.value })}
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <Select
                        value={rideForm.time}
                        onValueChange={(value) => setRideForm({ ...rideForm, time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <Input
                        required
                        value={rideForm.duration}
                        onChange={(e) => setRideForm({ ...rideForm, duration: e.target.value })}
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Available Seats</label>
                      <Input
                        required
                        type="number"
                        value={rideForm.availableSeats}
                        onChange={(e) => setRideForm({ ...rideForm, availableSeats: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Total Seats</label>
                      <Input
                        required
                        type="number"
                        value={rideForm.totalSeats}
                        onChange={(e) => setRideForm({ ...rideForm, totalSeats: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Passengers</label>
                      <Select
                        value={rideForm.passengers}
                        onValueChange={(value) => setRideForm({ ...rideForm, passengers: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {passengerOptions.map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Luggage</label>
                      <Select
                        value={rideForm.luggage}
                        onValueChange={(value) => setRideForm({ ...rideForm, luggage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {luggageOptions.map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hand Carry</label>
                      <Select
                        value={rideForm.handCarry}
                        onValueChange={(value) => setRideForm({ ...rideForm, handCarry: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {handCarryOptions.map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <Input
                        required
                        value={rideForm.price}
                        onChange={(e) => setRideForm({ ...rideForm, price: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Frequency</label>
                      <Select
                        value={rideForm.frequency}
                        onValueChange={(value) => setRideForm({ ...rideForm, frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One Time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600">
                    Add Shared Ride
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Add New Vehicle</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVehicleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle Name</label>
                    <Input
                      required
                      value={vehicleForm.name}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <Input
                      required
                      value={vehicleForm.price}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, price: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Passengers</label>
                      <Select
                        value={vehicleForm.passengers}
                        onValueChange={(value) => setVehicleForm({ ...vehicleForm, passengers: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {passengerOptions.map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Luggage</label>
                      <Select
                        value={vehicleForm.luggage}
                        onValueChange={(value) => setVehicleForm({ ...vehicleForm, luggage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {luggageOptions.map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hand Carry</label>
                      <Select
                        value={vehicleForm.handCarry}
                        onValueChange={(value) => setVehicleForm({ ...vehicleForm, handCarry: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {handCarryOptions.map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Vehicle Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleVehicleImageChange}
                      className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                    />
                    <Input
                      value={vehicleForm.image}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, image: e.target.value })}
                      className="bg-blue-50 border-blue-200 text-gray-800 h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Features</label>
                    <div className="space-y-2">
                      <Input
                        required
                        value={vehicleForm.feature1}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, feature1: e.target.value })}
                      />
                      <Input
                        value={vehicleForm.feature2}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, feature2: e.target.value })}
                      />
                      <Input
                        value={vehicleForm.feature3}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, feature3: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600">
                    Add Vehicle
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
