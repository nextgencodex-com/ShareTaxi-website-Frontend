"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Users, Briefcase, ShoppingBag, Calendar, ArrowLeft } from "lucide-react"
import { useRideBooking } from "@/hooks/use-ride-booking"
import emailjs from "@emailjs/browser"

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
  const { getCurrentLocation } = useRideBooking();
  const [loadingLocal, setLoadingLocal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupAddress: "",
    dropoffAddress: "",
    bookingDate: "",
  })

  if (!isOpen || !vehicle) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoadingLocal(true)
    try {
      // Get current location for pickup
      const currentLocation = await getCurrentLocation();

      const payload = {
        passengerName: formData.name,
        passengerPhone: formData.phone,
        passengerEmail: formData.email,
        bookingDate: formData.bookingDate,
        pickupLocation: currentLocation,
        pickupAddress: formData.pickupAddress,
        destination: { address: formData.dropoffAddress },
        destinationAddress: formData.dropoffAddress,
        vehicle: vehicle.name,
        passengers: 1,
        notes: `Vehicle: ${vehicle.name}`,
      }

      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
      const apiUrl = base.endsWith('/api') ? `${base}/private-rides` : `${base}/api/private-rides`

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Private ride POST failed', res.status, body)
        throw new Error(body.message || 'Failed to create private ride')
      }

      // Send a welcome/under-review email to the customer
      try {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          {
            to_email: formData.email,
            subject: '🚖 Thanks! Your personal ride request is under review',
            name: formData.name,
            from: payload.pickupAddress || (typeof payload.pickupLocation === 'string' ? payload.pickupLocation : ''),
            to: formData.dropoffAddress,
            taxi_type: 'personal',
            date: formData.bookingDate,
            time: '',
            passengers: 1,
            status_message: 'Your booking request has been received and is currently under review. We will contact you soon to confirm and share next steps.'
          },
          { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
        )
      } catch (e) {
        console.warn('EmailJS send failed (non-blocking):', e)
      }

      // Success — close popup
      onClose()
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setLoadingLocal(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
            <h2 className="text-2xl font-bold text-gray-800">Book Your Ride</h2>
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
                    className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none" />
                </div>
              </div>

              {/* Pickup Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                <Input
                  type="text"
                  placeholder="Enter pickup address"
                  value={formData.pickupAddress}
                  onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              {/* Dropoff Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dropoff Location</label>
                <Input
                  type="text"
                  placeholder="Enter destination address"
                  value={formData.dropoffAddress}
                  onChange={(e) => handleInputChange("dropoffAddress", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loadingLocal}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-50"
            >
              {loadingLocal ? "Booking..." : "Submit Details and We reach out you"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
