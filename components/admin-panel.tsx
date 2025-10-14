"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Filter, Download, Eye, Edit, Trash2 } from "lucide-react"
import { Footer } from "@/components/footer"
import AdminRequests from "@/components/admin-table"  // ✅ requests tables tab

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

interface FormSubmission {
  id: string
  formType: 'contact' | 'feedback' | 'support' | 'partner'
  user: {
    name: string
    email: string
    phone: string
  }
  subject: string
  message: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  assignedTo?: string
  lastUpdated: string
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

  // Forms Management State
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const [forms, setForms] = useState<FormSubmission[]>([
    {
      id: "FORM-001",
      formType: "contact",
      user: {
        name: "Alice Brown",
        email: "alice@example.com",
        phone: "+94123456786"
      },
      subject: "Inquiry about rental services",
      message: "I would like to know more about your long-term rental options...",
      status: "new",
      priority: "medium",
      createdAt: "2024-01-10T14:30:00Z",
      lastUpdated: "2024-01-10T14:30:00Z"
    },
    {
      id: "FORM-002",
      formType: "feedback",
      user: {
        name: "Bob Wilson",
        email: "bob@example.com",
        phone: "+94123456785"
      },
      subject: "Great service experience",
      message: "The ride was comfortable and the driver was very professional...",
      status: "resolved",
      priority: "low",
      createdAt: "2024-01-09T11:20:00Z",
      lastUpdated: "2024-01-10T09:15:00Z"
    },
    {
      id: "FORM-003",
      formType: "support",
      user: {
        name: "Carol Davis",
        email: "carol@example.com",
        phone: "+94123456784"
      },
      subject: "URGENT: Payment issue",
      message: "I was charged twice for my ride yesterday...",
      status: "in-progress",
      priority: "urgent",
      createdAt: "2024-01-10T16:45:00Z",
      assignedTo: "Support Team",
      lastUpdated: "2024-01-10T17:30:00Z"
    }
  ])

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

  // Forms Management Functions
  const filteredForms = forms.filter(form => {
    const matchesSearch = 
      form.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    const matchesType = typeFilter === "all" || form.formType === typeFilter
    const matchesPriority = priorityFilter === "all" || form.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStatusBadge = (status: FormSubmission['status']) => {
    const variants = {
      new: "bg-blue-100 text-blue-800",
      'in-progress': "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    }
    
    return (
      <Badge className={variants[status]}>
        {status.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: FormSubmission['priority']) => {
    const variants = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: FormSubmission['formType']) => {
    const variants = {
      contact: "bg-purple-100 text-purple-800",
      feedback: "bg-green-100 text-green-800",
      support: "bg-red-100 text-red-800",
      partner: "bg-orange-100 text-orange-800"
    }
    
    return (
      <Badge className={variants[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const handleDeleteForm = (formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId))
  }

  const handleStatusUpdate = (formId: string, newStatus: FormSubmission['status']) => {
    setForms(prev => 
      prev.map(form => 
        form.id === formId ? { 
          ...form, 
          status: newStatus,
          lastUpdated: new Date().toISOString()
        } : form
      )
    )
  }

  const StatsCard = ({ title, value, description, color }: any) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

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
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file")
        return
      }
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
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file")
        return
      }
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
    }, 800)
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
    }, 800)
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

        {/* ✅ Expanded to 5 tabs to include Forms Management */}
        <Tabs defaultValue="rides" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rides">Add Shared Ride</TabsTrigger>
            <TabsTrigger value="vehicles">Add Vehicle</TabsTrigger>
            <TabsTrigger value="rates">Set Rates</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle>Add New Shared Ride</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRideSubmit} className="space-y-4">
                  {/* Existing ride form content */}
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

                  {/* ... rest of ride form fields ... */}
                  
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
                  {/* Existing vehicle form content */}
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
                  {/* ... rest of vehicle form fields ... */}
                  
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
                {/* Existing rates content */}
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

          <TabsContent value="requests">
            <AdminRequests />
          </TabsContent>

          {/* ✅ New Forms Management Tab */}
          <TabsContent value="forms">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total Submissions"
                  value={forms.length}
                  description="All form submissions"
                  color="text-blue-600"
                />
                <StatsCard
                  title="New Forms"
                  value={forms.filter(f => f.status === 'new').length}
                  description="Require attention"
                  color="text-yellow-600"
                />
                <StatsCard
                  title="In Progress"
                  value={forms.filter(f => f.status === 'in-progress').length}
                  description="Being handled"
                  color="text-orange-600"
                />
                <StatsCard
                  title="Urgent Priority"
                  value={forms.filter(f => f.priority === 'urgent').length}
                  description="Immediate action needed"
                  color="text-red-600"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Form Submissions</CardTitle>
                  <CardDescription>
                    Manage contact forms, feedback, and support requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search forms..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredForms.map((form) => (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">{form.id}</TableCell>
                            <TableCell>{getTypeBadge(form.formType)}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{form.user.name}</div>
                                <div className="text-sm text-muted-foreground">{form.user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={form.subject}>
                                {form.subject}
                              </div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(form.priority)}</TableCell>
                            <TableCell>{getStatusBadge(form.status)}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(form.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteForm(form.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {form.status === 'new' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(form.id, 'in-progress')}
                                  >
                                    Start
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredForms.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No form submissions found matching your filters.
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredForms.length} of {forms.length} forms
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}