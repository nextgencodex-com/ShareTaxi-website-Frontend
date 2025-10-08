"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { Footer } from "@/components/footer"

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
  handCarry: string
  price: string
}

interface VehicleData {
  id: number
  name: string
  price: string
  passengers: string
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
    handCarry: "2",
    image: "",
    feature1: "",
    feature2: "",
    feature3: "",
  })

  // File states for image uploads
  const [driverImageFile, setDriverImageFile] = useState<File | null>(null)
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null)

  // Rate setting state
  const [ratePerKm, setRatePerKm] = useState("")
  const [rateLKRPerKm, setRateLKRPerKm] = useState("")
  const [exchangeRate, setExchangeRate] = useState("")
  const [rateStatus, setRateStatus] = useState("")
  const [currentSavedRate, setCurrentSavedRate] = useState("")

  // Validation state
  const [rideErrors, setRideErrors] = useState<Record<string, string>>({})
  const [vehicleErrors, setVehicleErrors] = useState<Record<string, string>>({})
  const [rateError, setRateError] = useState("")
  const [isRideSubmitting, setIsRideSubmitting] = useState(false)
  const [isVehicleSubmitting, setIsVehicleSubmitting] = useState(false)

  // Load saved rate data on component mount
  useEffect(() => {
    const savedRate = localStorage.getItem("ratePerKm")
    const savedLKRRate = localStorage.getItem("rateLKRPerKm")
    const savedExchangeRate = localStorage.getItem("exchangeRate")

    if (savedRate) {
      const usdRate = parseFloat(savedRate)
      setRatePerKm(usdRate.toString())

      if (savedLKRRate && savedExchangeRate) {
        const lkrRate = parseFloat(savedLKRRate)
        setRateLKRPerKm(savedLKRRate)
        setExchangeRate(savedExchangeRate)
        setCurrentSavedRate(`Current Rate: $${usdRate.toFixed(2)} per KM (Rs.${lkrRate.toFixed(2)})`)
      } else {
        setCurrentSavedRate(`Current Rate: $${usdRate.toFixed(2)} per KM`)
      }
    }
  }, [])

  // Currency converter functions
  const updateLKRFromUSD = (usdRate: string, exchangeRate: string) => {
    if (!usdRate || !exchangeRate) return ""
    const usd = parseFloat(usdRate)
    const exchange = parseFloat(exchangeRate)
    if (isNaN(usd) || isNaN(exchange) || exchange === 0) return ""
    return (usd * exchange).toFixed(2)
  }

  const updateUSDFromLKR = (lkrRate: string, exchangeRate: string) => {
    if (!lkrRate || !exchangeRate) return ""
    const lkr = parseFloat(lkrRate)
    const exchange = parseFloat(exchangeRate)
    if (isNaN(lkr) || isNaN(exchange) || exchange === 0) return ""
    return (lkr / exchange).toFixed(2)
  }

  // Handle USD rate change
  const handleUSDRateChange = (usdValue: string) => {
    setRatePerKm(usdValue)
    const exchange = parseFloat(exchangeRate) || 330
    setRateLKRPerKm(updateLKRFromUSD(usdValue, exchange.toString()))
    setRateError("")
  }

  // Handle LKR rate change
  const handleLKRRRateChange = (lkrValue: string) => {
    setRateLKRPerKm(lkrValue)
    const exchange = parseFloat(exchangeRate) || 330
    setRatePerKm(updateUSDFromLKR(lkrValue, exchange.toString()))
    setRateError("")
  }

  // Handle exchange rate change
  const handleExchangeRateChange = (exchangeValue: string) => {
    setExchangeRate(exchangeValue)
    const exchange = parseFloat(exchangeValue) || 330
    setRateLKRPerKm(updateLKRFromUSD(ratePerKm, exchange.toString()))
  }

  // Validation functions
  const validateRideForm = (form: typeof rideForm): Record<string, string> => {
    const errors: Record<string, string> = {}

    const trimmedName = form.driverName.trim()
    if (!trimmedName) {
      errors.driverName = "Driver name is required"
    } else if (trimmedName.length < 2) {
      errors.driverName = "Driver name must be at least 2 characters"
    }

    const trimmedVehicle = form.vehicle.trim()
    if (!trimmedVehicle) {
      errors.vehicle = "Vehicle is required"
    }

    const trimmedPickup = form.pickupLocation.trim()
    if (!trimmedPickup) {
      errors.pickupLocation = "Pickup location is required"
    }

    const trimmedDest = form.destinationLocation.trim()
    if (!trimmedDest) {
      errors.destinationLocation = "Destination is required"
    }

    if (!form.time) {
      errors.time = "Time is required"
    }

    const trimmedDuration = form.duration.trim()
    if (!trimmedDuration) {
      errors.duration = "Duration is required"
    }

    const availableSeats = Number.parseInt(form.availableSeats)
    if (isNaN(availableSeats) || availableSeats < 0) {
      errors.availableSeats = "Available seats must be a positive number"
    }

    const totalSeats = Number.parseInt(form.totalSeats)
    if (isNaN(totalSeats) || totalSeats < 1) {
      errors.totalSeats = "Total seats must be at least 1"
    } else if (availableSeats > totalSeats) {
      errors.availableSeats = "Available seats cannot exceed total seats"
    }

    const priceNum = parseFloat(form.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = "Price must be a positive number"
    }

    return errors
  }

  const validateVehicleForm = (form: typeof vehicleForm): Record<string, string> => {
    const errors: Record<string, string> = {}

    const trimmedName = form.name.trim()
    if (!trimmedName) {
      errors.name = "Vehicle name is required"
    } else if (trimmedName.length < 2) {
      errors.name = "Vehicle name must be at least 2 characters"
    }

    const priceNum = parseFloat(form.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = "Price must be a positive number"
    }

    const trimmedFeature1 = form.feature1.trim()
    if (!trimmedFeature1) {
      errors.feature1 = "At least one feature is required"
    }

    return errors
  }

  const validateRate = (rate: string): string => {
    const rateNum = parseFloat(rate)
    if (!rate || isNaN(rateNum) || rateNum <= 0) {
      return "Please enter a valid positive rate per KM"
    }
    return ""
  }

  // Handle file selection with validation
  const handleDriverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file")
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file")
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      setVehicleImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setVehicleForm({ ...vehicleForm, image: dataUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const validateRideField = (field: keyof typeof rideForm, value: string) => {
    const form = { ...rideForm, [field]: value }
    const errors = validateRideForm(form)
    setRideErrors(prev => ({
      ...prev,
      [field]: errors[field] || ""
    }))
  }

  const validateVehicleField = (field: keyof typeof vehicleForm, value: string) => {
    const form = { ...vehicleForm, [field]: value }
    const errors = validateVehicleForm(form)
    setVehicleErrors(prev => ({
      ...prev,
      [field]: errors[field] || ""
    }))
  }

  const handleRideSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateRideForm(rideForm)
    setRideErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsRideSubmitting(true)

    // Simulate processing time
    setTimeout(() => {
      const availableSeats = Number.parseInt(rideForm.availableSeats)
      const totalSeats = Number.parseInt(rideForm.totalSeats)

      const newRide = {
        id: Date.now(),
        timeAgo: "Just now",
        postedDate: new Date(),
        frequency: rideForm.frequency,
        driver: {
          name: rideForm.driverName.trim(),
          image: rideForm.driverImage || "/professional-driver-headshot.jpg",
        },
        vehicle: rideForm.vehicle.trim(),
        pickup: {
          location: rideForm.pickupLocation.trim(),
          type: "Pickup point",
        },
        destination: {
          location: rideForm.destinationLocation.trim(),
          type: "Destination",
        },
        time: rideForm.time,
        duration: rideForm.duration.trim(),
        passengers: rideForm.passengers,
        handCarry: rideForm.handCarry,
        seats: {
          available: availableSeats,
          total: totalSeats,
        },
        price: rideForm.price,
      }

      onAddRide(newRide)

      // Reset form with trimmed values
      setRideForm({
        driverName: "",
        driverImage: "",
        vehicle: "",
        pickupLocation: "",
        destinationLocation: "",
        time: "",
        duration: "",
        passengers: "1",
        handCarry: "0",
        availableSeats: "",
        totalSeats: "",
        price: "",
        frequency: "one-time",
      })
      setDriverImageFile(null)
      setRideErrors({})
      setRateStatus("✅ Shared ride added successfully!")
      setTimeout(() => setRateStatus(""), 3000)

      setIsRideSubmitting(false)
    }, 800) // Simulate network delay
  }

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setVehicleErrors({})

    const errors = validateVehicleForm(vehicleForm)
    if (Object.keys(errors).length > 0) {
      setVehicleErrors(errors)
      return
    }

    setIsVehicleSubmitting(true)

    // Simulate processing time
    setTimeout(() => {
      const newVehicle = {
        id: Date.now(),
        name: vehicleForm.name.trim(),
        price: vehicleForm.price,
        passengers: vehicleForm.passengers,
        handCarry: vehicleForm.handCarry,
        image: vehicleForm.image || "/images/toyota-innova.jpg",
        features: [vehicleForm.feature1, vehicleForm.feature2, vehicleForm.feature3].filter((f) => f.trim()),
        gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
      }

      onAddVehicle(newVehicle)

      // Reset form
      setVehicleForm({
        name: "",
        price: "",
        passengers: "4",
        handCarry: "2",
        image: "",
        feature1: "",
        feature2: "",
        feature3: "",
      })
      setVehicleImageFile(null)
      setVehicleErrors({})
      setRateStatus("✅ Vehicle added successfully!")
      setTimeout(() => setRateStatus(""), 3000)

      setIsVehicleSubmitting(false)
    }, 800) // Simulate network delay
  }

  const saveRate = () => {
    setRateError("")
    const error = validateRate(ratePerKm)
    if (error) {
      setRateError(error)
      return
    }

    const usdRate = parseFloat(ratePerKm)
    const currentExchangeRate = parseFloat(exchangeRate) || 330
    const lkrRate = parseFloat(rateLKRPerKm) || (usdRate * currentExchangeRate)

    localStorage.setItem("ratePerKm", usdRate.toString())
    localStorage.setItem("rateLKRPerKm", lkrRate.toFixed(2))
    localStorage.setItem("exchangeRate", currentExchangeRate.toString())

    setCurrentSavedRate(`Current Rate: $${usdRate.toFixed(2)} per KM (Rs.${lkrRate.toFixed(2)})`)
    setRateStatus("✅ Rate saved successfully!")
    setTimeout(() => setRateStatus(""), 3000)
  }

  const removeRate = () => {
    localStorage.removeItem("ratePerKm")
    localStorage.removeItem("rateLKRPerKm")
    localStorage.removeItem("exchangeRate")

    setRatePerKm("")
    setRateLKRPerKm("")
    setExchangeRate("")
    setCurrentSavedRate("")
    setRateStatus("❌ Rate removed! Users cannot calculate rates until you set a new one.")
    setTimeout(() => setRateStatus(""), 5000)
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rides">Add Shared Ride</TabsTrigger>
            <TabsTrigger value="vehicles">Add Vehicle</TabsTrigger>
            <TabsTrigger value="rates">Set Rates</TabsTrigger>
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
                        onChange={(e) => {
                          setRideForm({ ...rideForm, driverName: e.target.value })
                          if (rideErrors.driverName) {
                            setRideErrors({ ...rideErrors, driverName: "" })
                          }
                        }}
                        className={`${rideErrors.driverName ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                      />
                      {rideErrors.driverName && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.driverName}</p>
                      )}
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
                        onChange={(e) => {
                          setRideForm({ ...rideForm, vehicle: e.target.value })
                          validateRideField("vehicle", e.target.value)
                        }}
                        className={`${rideErrors.vehicle ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                      />
                      {rideErrors.vehicle && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.vehicle}</p>
                      )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pickup Location</label>
                      <Input
                        required
                        value={rideForm.pickupLocation}
                        onChange={(e) => {
                          setRideForm({ ...rideForm, pickupLocation: e.target.value })
                          validateRideField("pickupLocation", e.target.value)
                        }}
                        className={`${rideErrors.pickupLocation ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                        placeholder=""
                      />
                      {rideErrors.pickupLocation && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.pickupLocation}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Destination</label>
                      <Input
                        required
                        value={rideForm.destinationLocation}
                        onChange={(e) => {
                          setRideForm({ ...rideForm, destinationLocation: e.target.value })
                          validateRideField("destinationLocation", e.target.value)
                        }}
                        className={`${rideErrors.destinationLocation ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                        placeholder=""
                      />
                      {rideErrors.destinationLocation && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.destinationLocation}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <Select
                        value={rideForm.time}
                        onValueChange={(value) => setRideForm({ ...rideForm, time: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-400 focus:border-blue-500">
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
                        onChange={(e) => {
                          setRideForm({ ...rideForm, duration: e.target.value })
                          validateRideField("duration", e.target.value)
                        }}
                        className={`${rideErrors.duration ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                        placeholder=""
                      />
                      {rideErrors.duration && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.duration}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Available Seats</label>
                      <Input
                        required
                        type="number"
                        value={rideForm.availableSeats}
                        onChange={(e) => {
                          setRideForm({ ...rideForm, availableSeats: e.target.value })
                          validateRideField("availableSeats", e.target.value)
                        }}
                        className={`${rideErrors.availableSeats ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                      />
                      {rideErrors.availableSeats && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.availableSeats}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Total Seats</label>
                      <Input
                        required
                        type="number"
                        value={rideForm.totalSeats}
                        onChange={(e) => {
                          setRideForm({ ...rideForm, totalSeats: e.target.value })
                          validateRideField("totalSeats", e.target.value)
                        }}
                        className={`${rideErrors.totalSeats ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                      />
                      {rideErrors.totalSeats && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.totalSeats}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Passengers</label>
                      <Select
                        value={rideForm.passengers}
                        onValueChange={(value) => setRideForm({ ...rideForm, passengers: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-400 focus:border-blue-500">
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
                      <label className="block text-sm font-medium mb-2">Hand Carry</label>
                      <Select
                        value={rideForm.handCarry}
                        onValueChange={(value) => setRideForm({ ...rideForm, handCarry: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-400 focus:border-blue-500">
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
                        onChange={(e) => {
                          setRideForm({ ...rideForm, price: e.target.value })
                          validateRideField("price", e.target.value)
                        }}
                        className={`${rideErrors.price ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                      />
                      {rideErrors.price && (
                        <p className="text-red-500 text-sm mt-1">{rideErrors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Frequency</label>
                      <Select
                        value={rideForm.frequency}
                        onValueChange={(value) => setRideForm({ ...rideForm, frequency: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-400 focus:border-blue-500">
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

                  <Button type="submit" disabled={isRideSubmitting} className="w-full bg-yellow-500 hover:bg-yellow-600">
                    {isRideSubmitting ? "Adding Ride..." : "Add Shared Ride"}
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
                      onChange={(e) => {
                        setVehicleForm({ ...vehicleForm, name: e.target.value })
                        validateVehicleField("name", e.target.value)
                      }}
                      className={`${vehicleErrors.name ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                    />
                    {vehicleErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{vehicleErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <Input
                      required
                      value={vehicleForm.price}
                      onChange={(e) => {
                        setVehicleForm({ ...vehicleForm, price: e.target.value })
                        validateVehicleField("price", e.target.value)
                      }}
                      className={`${vehicleErrors.price ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                    />
                    {vehicleErrors.price && (
                      <p className="text-red-500 text-sm mt-1">{vehicleErrors.price}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Passengers</label>
                      <Select
                        value={vehicleForm.passengers}
                        onValueChange={(value) => setVehicleForm({ ...vehicleForm, passengers: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-400 focus:border-blue-500">
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
                      <label className="block text-sm font-medium mb-2">Hand Carry</label>
                      <Select
                        value={vehicleForm.handCarry}
                        onValueChange={(value) => setVehicleForm({ ...vehicleForm, handCarry: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-400 focus:border-blue-500">
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
                        onChange={(e) => {
                          setVehicleForm({ ...vehicleForm, feature1: e.target.value })
                          validateVehicleField("feature1", e.target.value)
                        }}
                        className={`${vehicleErrors.feature1 ? "border-red-500" : "border-2 border-gray-400"} focus:border-blue-500`}
                      />
                      {vehicleErrors.feature1 && (
                        <p className="text-red-500 text-sm mt-1">{vehicleErrors.feature1}</p>
                      )}
                      <Input
                        value={vehicleForm.feature2}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, feature2: e.target.value })}
                        className="border-2 border-gray-400 focus:border-blue-500"
                      />
                      <Input
                        value={vehicleForm.feature3}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, feature3: e.target.value })}
                        className="border-2 border-gray-400 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isVehicleSubmitting} className="w-full bg-yellow-500 hover:bg-yellow-600">
                    {isVehicleSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>🚖 Admin: Set Price per KM</CardTitle>
                {currentSavedRate && (
                  <div className="text-sm text-gray-600 font-medium bg-blue-50 p-2 rounded">
                    📊 {currentSavedRate}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label htmlFor="exchangeRate" className="block text-sm font-medium mb-2">
                    USD ↔ LKR Exchange Rate:
                  </label>
                  <Input
                    type="number"
                    id="exchangeRate"
                    placeholder="e.g. 330 (LKR = 1 USD)"
                    value={exchangeRate}
                    onChange={(e) => handleExchangeRateChange(e.target.value)}
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current market rate: ~330 LKR = 1 USD
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ratePerKm" className="block text-sm font-medium mb-2">
                      Rate ($ per KM):
                    </label>
                    <Input
                      type="number"
                      id="ratePerKm"
                      placeholder="e.g. 1.50"
                      value={ratePerKm}
                      onChange={(e) => handleUSDRateChange(e.target.value)}
                      className={`bg-white ${rateError ? "border-red-500" : ""}`}
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label htmlFor="rateLKRPerKm" className="block text-sm font-medium mb-2">
                      Rate (Rs. per KM):
                    </label>
                    <Input
                      type="number"
                      id="rateLKRPerKm"
                      placeholder="Will auto-calculate"
                      value={rateLKRPerKm}
                      onChange={(e) => handleLKRRRateChange(e.target.value)}
                      className="bg-white"
                      step="0.01"
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  💡 Enter the USD rate and LKR will auto-calculate,
                  or enter LKR rate and USD will auto-calculate based on the exchange rate.
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={saveRate}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    disabled={!ratePerKm}
                  >
                    💾 Save Rate
                  </Button>

                  {currentSavedRate && (
                    <Button
                      onClick={removeRate}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      🗑️ Remove Rate
                    </Button>
                  )}
                </div>

                {rateError && (
                  <p className="text-red-500 text-sm mt-2">{rateError}</p>
                )}
                {rateStatus && (
                  <p className={`text-center font-bold ${rateStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {rateStatus}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}
