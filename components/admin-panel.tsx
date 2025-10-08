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
import { useAdminSharedRides, useAdminVehicles } from "@/hooks/use-admin"

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

interface Vehicle {
  id: string;
  name: string;
  price: string;
  passengers: string;
  luggage: string;
  handCarry: string;
  image?: string;
  features?: string[];
  isAvailable: boolean;
  createdAt: any;
}

// Manage Vehicles Tab Component
function ManageVehiclesTab() {
  const { vehicles, loading, getAllVehicles, deleteVehicle, updateVehicleAvailability } = useAdminVehicles();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("all");

  useEffect(() => {
    getAllVehicles();
  }, [getAllVehicles]);

  const handleToggleAvailability = async (vehicleId: string, currentAvailability: boolean) => {
    try {
      await updateVehicleAvailability(vehicleId, !currentAvailability);
    } catch (error) {
      console.error('Failed to update vehicle availability:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string, vehicleName: string) => {
    if (window.confirm(`Are you sure you want to delete "${vehicleName}"?`)) {
      try {
        await deleteVehicle(vehicleId);
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
      }
    }
  };

  // Filter vehicles based on search and availability
  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.features && vehicle.features.some(feature => 
                           feature.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    
    const matchesFilter = filterAvailable === "all" || 
                         (filterAvailable === "available" && vehicle.isAvailable) ||
                         (filterAvailable === "unavailable" && !vehicle.isAvailable);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading vehicles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Vehicles ({vehicles.length} total, {filteredVehicles.length} shown)</CardTitle>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search vehicles by name or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <Select value={filterAvailable} onValueChange={setFilterAvailable}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="unavailable">Unavailable Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {vehicles.length === 0 ? (
              <div>
                <p className="text-lg mb-2">No vehicles found</p>
                <p className="text-sm">Add some vehicles using the &quot;Add Vehicle&quot; tab first.</p>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-2">No vehicles match your search</p>
                <p className="text-sm">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle: Vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Vehicle Header with Image */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img 
                          src={vehicle.image || "/images/default-vehicle.jpg"} 
                          alt={vehicle.name}
                          className="w-20 h-16 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                          vehicle.isAvailable ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-800">{vehicle.name}</h3>
                        <p className="text-lg font-semibold text-blue-600">${vehicle.price} per trip</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            👥 {vehicle.passengers} passengers
                          </span>
                          <span className="flex items-center gap-1">
                            🧳 {vehicle.luggage} luggage
                          </span>
                          <span className="flex items-center gap-1">
                            👜 {vehicle.handCarry} hand carry
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Vehicle Features */}
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.features.map((feature: string, index: number) => (
                            <span 
                              key={index} 
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                            >
                              ✨ {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Vehicle Status and Metadata */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        vehicle.isAvailable 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {vehicle.isAvailable ? '✅ Available' : '❌ Unavailable'}
                      </span>
                      <span className="text-gray-500">
                        📅 Added: {new Date(vehicle.createdAt?.seconds * 1000 || vehicle.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-gray-500">
                        🆔 ID: {vehicle.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 ml-6">
                    <Button
                      size="sm"
                      variant={vehicle.isAvailable ? "outline" : "default"}
                      onClick={() => handleToggleAvailability(vehicle.id, vehicle.isAvailable)}
                      className={`min-w-24 ${
                        vehicle.isAvailable 
                          ? 'border-orange-300 text-orange-600 hover:bg-orange-50' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {vehicle.isAvailable ? '⏸️ Disable' : '▶️ Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteVehicle(vehicle.id, vehicle.name)}
                      className="min-w-24"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Summary Stats */}
        {vehicles.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">📊 Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">{vehicles.length}</div>
                <div className="text-gray-600">Total Vehicles</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">
                  {vehicles.filter((v: Vehicle) => v.isAvailable).length}
                </div>
                <div className="text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-red-600">
                  {vehicles.filter((v: Vehicle) => !v.isAvailable).length}
                </div>
                <div className="text-gray-600">Unavailable</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-purple-600">
                  ${Math.round(vehicles.reduce((sum: number, v: Vehicle) => sum + parseFloat(v.price), 0) / vehicles.length)}
                </div>
                <div className="text-gray-600">Avg. Price</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminPanel({ onBack, onAddRide, onAddVehicle }: AdminPanelProps) {
  const { createSharedRide, loading: rideLoading } = useAdminSharedRides();
  const { createVehicle, loading: vehicleLoading } = useAdminVehicles();
  
  const timeSlots = [
    "6-8 am", "8-10 am", "10-12 pm", "12-2 pm", "2-4 pm",
    "4-6 pm", "6-8 pm", "8-10 pm", "10-12 am"
  ]

  const passengerOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString())
  const luggageOptions = Array.from({ length: 6 }, (_, i) => i.toString())
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

  const handleRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateRideForm(rideForm)
    setRideErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsRideSubmitting(true)

    try {
      const availableSeats = Number.parseInt(rideForm.availableSeats)
      const totalSeats = Number.parseInt(rideForm.totalSeats)

      if (isNaN(availableSeats) || isNaN(totalSeats) || availableSeats < 0 || totalSeats < 0) {
        alert("Please enter valid positive numbers for available seats and total seats.")
        setIsRideSubmitting(false)
        return
      }

      if (availableSeats > totalSeats) {
        alert("Available seats cannot exceed total seats.")
        setIsRideSubmitting(false)
        return
      }

      // Create shared ride data for backend
      const sharedRideData = {
        driverName: rideForm.driverName,
        driverImage: rideForm.driverImage || "/images/default-driver.jpg",
        vehicle: rideForm.vehicle,
        pickupLocation: rideForm.pickupLocation,
        destinationLocation: rideForm.destinationLocation,
        time: rideForm.time,
        duration: rideForm.duration,
        passengers: rideForm.passengers,
        luggage: rideForm.luggage,
        handCarry: rideForm.handCarry,
        availableSeats: availableSeats,
        totalSeats: totalSeats,
        price: rideForm.price,
        frequency: rideForm.frequency,
      };

      // Submit to backend
      await createSharedRide(sharedRideData);

      // Also call the original callback for UI updates
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
        luggage: rideForm.luggage,
        handCarry: rideForm.handCarry,
        seats: {
          available: availableSeats,
          total: totalSeats,
        },
        price: rideForm.price,
      };

      onAddRide(newRide);

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
      });
      setDriverImageFile(null);
      setRideErrors({});
      setRateStatus("✅ Shared ride added successfully!");
      setTimeout(() => setRateStatus(""), 3000);
      setIsRideSubmitting(false);

    } catch (error) {
      console.error('Failed to create shared ride:', error);
      setIsRideSubmitting(false);
      // Error is already handled by the hook with toast
    }
  }

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateVehicleForm(vehicleForm)
    setVehicleErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsVehicleSubmitting(true)

    try {
      // Create vehicle data for backend
      const vehicleData = {
        name: vehicleForm.name,
        price: vehicleForm.price,
        passengers: vehicleForm.passengers,
        luggage: vehicleForm.luggage,
        handCarry: vehicleForm.handCarry,
        image: vehicleForm.image || "/images/default-vehicle.jpg",
        features: [vehicleForm.feature1, vehicleForm.feature2, vehicleForm.feature3].filter((f) => f),
        gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
      };

      // Submit to backend
      await createVehicle(vehicleData);

      // Also call the original callback for UI updates
      const newVehicle = {
        id: Date.now(),
        name: vehicleForm.name.trim(),
        price: vehicleForm.price,
        passengers: vehicleForm.passengers,
        luggage: vehicleForm.luggage,
        handCarry: vehicleForm.handCarry,
        image: vehicleForm.image || "/images/toyota-innova.jpg",
        features: [vehicleForm.feature1, vehicleForm.feature2, vehicleForm.feature3].filter((f) => f.trim()),
        gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
      };

      onAddVehicle(newVehicle);

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
      });
      setVehicleImageFile(null);
      setVehicleErrors({});
      setRateStatus("✅ Vehicle added successfully!");
      setTimeout(() => setRateStatus(""), 3000);
      setIsVehicleSubmitting(false);

    } catch (error) {
      console.error('Failed to create vehicle:', error);
      setIsVehicleSubmitting(false);
      // Error is already handled by the hook with toast
    }
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rides">Add Shared Ride</TabsTrigger>
            <TabsTrigger value="vehicles">Add Vehicle</TabsTrigger>
            <TabsTrigger value="manage-vehicles">Manage Vehicles</TabsTrigger>
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

                  <div className="grid md:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium mb-2">Luggage</label>
                      <Select
                        value={vehicleForm.luggage}
                        onValueChange={(value) => setVehicleForm({ ...vehicleForm, luggage: value })}
                      >
                        <SelectTrigger className="border-2 border-gray-400 focus:border-blue-500">
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

          <TabsContent value="manage-vehicles">
            <ManageVehiclesTab />
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
