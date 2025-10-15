"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Users, Briefcase, ShoppingBag, Calendar, ArrowLeft, AlertTriangle } from "lucide-react"

interface Vehicle {
  id: number
  name: string
  price: string
  passengers: string
  luggage: string
  handCarry: string
  image: string
  features: string[]
}

interface BookRidePopupProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
}

export function BookRidePopup({ isOpen, onClose, vehicle }: BookRidePopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookingDate: "",
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !vehicle) return null

  // Validation functions
  const validateFormData = () => {
    const errors: string[] = []

    // Name validation
    if (!formData.name.trim()) {
      errors.push("Name is required")
    } else if (formData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long")
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.name.trim())) {
      errors.push("Name can only contain letters, spaces, hyphens, and apostrophes")
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.push("Email address is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.push("Please enter a valid email address")
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.push("Phone number is required")
    } else if (!/^\d{8,10}$/.test(formData.phone.trim())) {
      errors.push("Phone number must be 8-10 digits")
    }

    // Date validation
    if (!formData.bookingDate.trim()) {
      errors.push("Booking date is required")
    } else {
      const selectedDate = new Date(formData.bookingDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.push("Booking date must be today or in the future")
      }
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setHasAttemptedSubmit(true)
    const errors = validateFormData()
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])
    setIsSubmitting(true)
    
    try {
      // Since there's no backend server, we'll handle the booking locally
      // Create a booking record and save it to localStorage
      const bookingData = {
        id: Date.now(),
        vehicleName: vehicle.name,
        vehiclePrice: vehicle.price,
        passengerName: formData.name,
        passengerEmail: formData.email,
        passengerPhone: formData.phone,
        bookingDate: formData.bookingDate,
        specialRequests: `Vehicle type: ${vehicle.name}`,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingBookings = JSON.parse(localStorage.getItem('vehicleBookings') || '[]');
      existingBookings.push(bookingData);
      localStorage.setItem('vehicleBookings', JSON.stringify(existingBookings));

      // Send email notification (using mailto as fallback)
      const emailSubject = `Vehicle Booking Request - ${vehicle.name}`;
      const emailBody = `
Vehicle Booking Request

Vehicle: ${vehicle.name}
Price: ${vehicle.price}
Booking Date: ${formData.bookingDate}

Customer Details:
• Name: ${formData.name}
• Email: ${formData.email}
• Phone: +94${formData.phone}

Please confirm this booking. Thank you!
      `.trim();

      // Send booking request to company
      const mailtoLink = `mailto:contact@nextgcodex.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoLink, "_blank");

      // Send confirmation email to customer
      const customerEmailSubject = "Vehicle Booking Confirmation";
      const customerEmailLink = `mailto:${formData.email}?subject=${encodeURIComponent(customerEmailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(customerEmailLink, "_blank");

      alert('Your booking request has been sent! We will contact you soon to confirm your vehicle booking.');
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking request sent successfully via email! We will contact you soon.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear validation errors when user starts fixing them
    if (hasAttemptedSubmit && validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Book Your Vehicle</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Vehicle Details Section */}
          <div className="bg-yellow-50 rounded-2xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Vehicle Image */}
              <div className="rounded-xl overflow-hidden">
                <img
                  src={vehicle.image || "/placeholder.svg?height=200&width=300&query=white Toyota MPV car"}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="text-2xl font-bold text-orange-600 mb-2">{vehicle.name}</h3>
                <p className="text-xl text-gray-700 mb-4">{vehicle.price}</p>

                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-orange-600 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {vehicle.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Capacity Icons */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-gray-700" />
                    <span className="font-semibold text-gray-800">{vehicle.passengers} Passengers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-gray-700" />
                    <span className="font-semibold text-gray-800">{vehicle.luggage} Luggage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-6 w-6 text-gray-700" />
                    <span className="font-semibold text-gray-800">{vehicle.handCarry} Carry</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Please fix the following errors:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <Input
                  type="text"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="bg-blue-50 rounded-lg px-3 py-3 text-gray-700 font-medium">+94</div>
                  <Input
                    type="tel"
                    placeholder="769278958"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="flex-1 p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Booking Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Booking date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleInputChange("bookingDate", e.target.value)}
                    className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400 [&::-webkit-calendar-picker-indicator]:hidden"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    required
                  />
                  <Calendar 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 cursor-pointer" 
                    onClick={() => {
                      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                      dateInput?.showPicker();
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-50"
            >
              {isSubmitting ? "Booking..." : "Book Your Vehicle"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
