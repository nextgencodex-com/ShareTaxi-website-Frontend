"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MapPin, Clock, Users, Mail, MessageCircle } from "lucide-react"

interface BookingData {
  from: string
  to: string
  rideType: string
  date: string
  time: string
  passengers: string
  luggage: string
  tripType: string
}

interface PersonalData {
  fullName: string
  email: string
  phone: string
  emergencyContact: string
  specialRequests: string
  seatCount: string
}

interface RideData {
  id: number
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

interface BookingData {
  from: string
  to: string
  rideType: string
  date: string
  time: string
  passengers: string
  luggage: string
  tripType: string
}

interface PersonalData {
  fullName: string
  email: string
  phone: string
  emergencyContact: string
  specialRequests: string
  seatCount: string
}

interface PaymentDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  bookingData?: BookingData | null
  personalData?: PersonalData | null
  rideData?: RideData | null
  selectedSeats?: number | null
}

export function PaymentDetailsPopup({ isOpen, onClose, bookingData, personalData }: PaymentDetailsPopupProps) {
  if (!isOpen || !bookingData || !personalData) return null

  // Mock driver data - in real app this would come from booking data
  const mockDriver = {
    name: "Alex Chen",
    image: "/professional-driver-headshot.jpg",
    vehicle: "Toyota Alphard",
  }

  const handleEmailBooking = () => {
    const bookingDetails = `
Booking Details:
- From: ${bookingData.from}
- To: ${bookingData.to}
- Date: ${bookingData.date}
- Time: ${bookingData.time}
- Ride Type: ${bookingData.rideType}
- Passengers: ${bookingData.passengers}
- Luggage: ${bookingData.luggage}

Personal Details:
- Name: ${personalData.fullName}
- Email: ${personalData.email}
- Phone: +94${personalData.phone}
- Emergency Contact: ${personalData.emergencyContact}
- Special Requests: ${personalData.specialRequests}
- Seats: ${personalData.seatCount}

Driver: ${mockDriver.name}
Vehicle: ${mockDriver.vehicle}
Price: LKR 2000.00
    `.trim()

    const subject = `Taxi Booking Request - ${bookingData.from} to ${bookingData.to}`
    const mailtoLink = `mailto:booking@sharetaxisrilanka.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bookingDetails)}`

    window.open(mailtoLink, "_blank")
  }

  const handleWhatsAppBooking = () => {
    const bookingDetails = `
🚖 *Taxi Booking Request*

📍 *Route:* ${bookingData.from} → ${bookingData.to}
📅 *Date:* ${bookingData.date}
⏰ *Time:* ${bookingData.time}
🚗 *Type:* ${bookingData.rideType} ride
👥 *Passengers:* ${bookingData.passengers}
🧳 *Luggage:* ${bookingData.luggage}

👤 *Personal Details:*
• Name: ${personalData.fullName}
• Email: ${personalData.email}
• Phone: +94${personalData.phone}
• Emergency Contact: ${personalData.emergencyContact}
• Seats: ${personalData.seatCount}

📝 *Special Requests:* ${personalData.specialRequests || "None"}

🚗 *Driver:* ${mockDriver.name}
🚙 *Vehicle:* ${mockDriver.vehicle}
💰 *Price:* LKR 2000.00

Please confirm this booking. Thank you!
    `.trim()

    const whatsappLink = `https://wa.me/94759627589?text=${encodeURIComponent(bookingDetails)}`
    window.open(whatsappLink, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-200 text-gray-600 px-6 py-2 rounded-full font-semibold">Personal Details</div>
            <div className="flex-1 h-1 bg-gray-300 rounded"></div>
            <div className="bg-yellow-500 text-white px-6 py-2 rounded-full font-semibold">Payment</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{bookingData.from}</p>
                  <p className="text-gray-600 text-sm">Pickup point</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                  <Clock className="h-3 w-3 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{bookingData.time}</p>
                  <p className="text-gray-600 text-sm">45 min</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{bookingData.to}</p>
                  <p className="text-gray-600 text-sm">Destination</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                  <Users className="h-3 w-3 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {bookingData.rideType === "shared" ? "3/6 seats" : `${bookingData.passengers} seats`}
                  </p>
                  <p className="text-gray-600 text-sm">Available</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 my-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mockDriver.image || "/placeholder.svg"} alt={mockDriver.name} />
                  <AvatarFallback>
                    {mockDriver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{mockDriver.name}</p>
                  <p className="text-gray-600">{mockDriver.vehicle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">LKR 2000.00</p>
                <p className="text-gray-600">{bookingData.rideType === "shared" ? "per seat" : "total"}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{personalData.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{personalData.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">+94{personalData.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Emergency Contact</p>
                <p className="font-semibold text-gray-900">{personalData.emergencyContact}</p>
              </div>
              <div>
                <p className="text-gray-600">Seats</p>
                <p className="font-semibold text-gray-900">{personalData.seatCount}</p>
              </div>
              {personalData.specialRequests && (
                <div>
                  <p className="text-gray-600">Special Requests</p>
                  <p className="font-semibold text-gray-900">{personalData.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Choose Booking Method</h3>

            <Button
              onClick={handleEmailBooking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3"
            >
              <Mail className="h-5 w-5" />
              Book with Email
            </Button>

            <Button
              onClick={handleWhatsAppBooking}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3"
            >
              <MessageCircle className="h-5 w-5" />
              Book via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
