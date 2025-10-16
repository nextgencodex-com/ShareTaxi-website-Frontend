"use client"

import { useState } from "react"
import emailjs from '@emailjs/browser'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MapPin, Clock, Users, Mail, MessageCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SharedRideConfirmationPopup } from "./shared-ride-confirmation-popup"
import { calculateTotalPrice, getPerKmRate, getTripMultiplier, PER_SEAT_RATE_USD, formatPriceUSD, getPassengerCountCategory, calculateProgressiveSharedTotal, calculateProgressiveSeatPrice } from "@/lib/pricing"
import { useCallback } from "react"
import { AlertTriangle } from "lucide-react"



// Send Confirmation Email
const sendConfirmationEmail = async (bookingData: any, personalData: any, rideData: any, isJoinRideFlow: boolean, selectedSeats?: number | null, seatsCount?: number, totalPrice?: string, perPersonFare?: string) => {
  try {
    // Extract pricing information
    let extractedPerPersonFare = perPersonFare || "N/A"
    let extractedSeats = seatsCount || parseInt(String(personalData?.seatCount || "1"), 10)
    let extractedTotal = totalPrice || "N/A"

    // If pricing wasn't passed in, try to extract from calculatedFare
    if (bookingData?.calculatedFare && !perPersonFare) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = bookingData.calculatedFare;

      const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
      const totalElement = tempDiv.querySelector('[style*="color:blue"]');

      if (perPersonElement) {
        extractedPerPersonFare = perPersonElement.textContent || "N/A";
      }
      if (totalElement) {
        extractedTotal = totalElement.textContent || "N/A";
      }
    }

    const result = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: personalData?.email,
        subject: "🚖 Booking Confirmed!",
        name: personalData?.fullName || "",
        from: isJoinRideFlow ? rideData?.pickup.location : bookingData?.from || "",
        to: isJoinRideFlow ? rideData?.destination.location : bookingData?.to || "",
        taxi_type: bookingData?.rideType || "",
        date: bookingData?.date || "",
        time: bookingData?.time || "",
        passengers: personalData?.seatCount || "",
        luggage: personalData?.specialRequests || "", // Use special requests or empty for luggage
        seats: extractedSeats,
        per_person_fare: extractedPerPersonFare,
        total_price: extractedTotal
      },
      {
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      }
    )
    console.log('Confirmation email sent successfully:', result)
    alert('Confirmation email sent successfully!')
  } catch (error: any) {
    console.error('Failed to send confirmation email:', error)
    alert(`Failed to send confirmation email: ${error?.text || 'Unknown error'}`)
  }
}

interface BookingData {
  from: string
  to: string
  rideType: string
  date: string
  time: string
  passengers: number | string
  tripType: string
  mapDistance?: string | null
  mapDuration?: string | null
  calculatedFare?: string
}

interface PersonalData {
  fullName: string
  email: string
  phone: string
  emergencyContact?: string
  specialRequests: string
  seatCount: number | string
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
  distanceKm?: number
}

interface PaymentDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  bookingData?: BookingData | null
  personalData?: PersonalData | null
  rideData?: RideData | null
  selectedSeats?: number | null
  onUpdateSeats?: (rideId: number, seatsBooked: number) => void
}

export function PaymentDetailsPopup({ isOpen, onClose, onBack, bookingData, personalData, rideData, selectedSeats, onUpdateSeats }: PaymentDetailsPopupProps) {
  console.log('PaymentDetailsPopup props:', { isOpen, bookingData, personalData, rideData, selectedSeats, onUpdateSeats })
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState("")

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Validation functions
  const validateBookingData = () => {
    console.log('Validating booking data - personalData:', personalData)
    console.log('Validating booking data - isJoinRideFlow:', isJoinRideFlow)
    console.log('Validating booking data - selectedSeats:', selectedSeats)
    const errors: string[] = []

    // Check if basic data exists
    if (!personalData) {
      errors.push("Personal information is required to complete booking.")
      return errors
    }

    // Validate required personal data
    if (!personalData.fullName?.trim()) {
      errors.push("Full name is required")
    } else if (personalData.fullName.length < 2) {
      errors.push("Full name must be at least 2 characters long")
    } else if (personalData.fullName.length > 100) {
      errors.push("Full name cannot exceed 100 characters")
    } else if (!/^[a-zA-Z\s\-']+$/.test(personalData.fullName.trim())) {
      errors.push("Full name can only contain letters, spaces, hyphens, and apostrophes")
    }

    // Email validation
    if (!personalData.email?.trim()) {
      errors.push("Email address is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email.trim())) {
      errors.push("Please enter a valid email address")
    } else if (personalData.email.length > 254) {
      errors.push("Email address is too long")
    }

    // Phone validation
    if (!personalData.phone?.trim()) {
      errors.push("Phone number is required")
    } else if (!/^\d{8,10}$/.test(personalData.phone.trim())) {
      errors.push("Phone number must be 8-10 digits")
    }


    // Special Requests validation (optional, but reasonable length)
    if (personalData.specialRequests && personalData.specialRequests.length > 500) {
      errors.push("Special requests cannot exceed 500 characters")
    }

    // Seat count validation
    const seatCount = isJoinRideFlow ? selectedSeats : parseInt(String(personalData.seatCount || "1"), 10)
    console.log('Seat count validation - seatCount:', seatCount, 'selectedSeats:', selectedSeats, 'personalData.seatCount:', personalData.seatCount)
    if (!seatCount || seatCount < 1 || seatCount > 20) {
      errors.push("Seat count must be between 1 and 20")
    }

    console.log('Validation completed - errors:', errors)

    // Location and type validation for regular bookings
    if (!isJoinRideFlow) {
      if (!bookingData) {
        errors.push("Booking data is missing. Please go back and complete the booking form.")
        return errors
      }

      if (!bookingData.from?.trim()) {
        errors.push("Pickup location (From) is required")
      }
      if (!bookingData.to?.trim()) {
        errors.push("Destination (To) is required")
      }
      if (!bookingData.date?.trim()) {
        errors.push("Pickup date is required")
      }
      if (!bookingData.time?.trim()) {
        errors.push("Pickup time is required")
      }
      if (!bookingData.rideType?.trim()) {
        errors.push("Ride type (shared/personal) is required")
      }
      if (!bookingData.tripType?.trim()) {
        errors.push("Trip type (one-way/round-trip/multi-city) is required")
      }
      if (!bookingData.calculatedFare || bookingData.calculatedFare.includes("⚠️")) {
        errors.push("Please calculate the fare before proceeding with the booking")
      }
    }

    return errors
  }

  // Assigned driver data - in real app this would come from booking data
  const mockDriver = {
    name: "Your Assigned Driver",
    image: "/professional-driver-headshot.jpg",
    vehicle: "Assigned Vehicle",
  }

  const addUserSharedRide = useCallback(async () => {
    if (!bookingData || !personalData || bookingData.rideType !== 'shared') return null

    const seatCount = parseInt(String(personalData.seatCount || "1"), 10)
    const totalSeats = 6 // Standard vehicle capacity
    const availableSeats = Math.max(0, totalSeats - seatCount)

    const newRide = {
      id: Date.now(),
      timeAgo: "Just now",
      postedDate: new Date(),
      frequency: "one-time",
      driver: {
        name: personalData.fullName || "User Driver",
        image: "/professional-driver-headshot.jpg",
      },
      vehicle: "Assigned Vehicle",
      pickup: {
        location: bookingData.from || "",
        type: "Pickup point",
      },
      destination: {
        location: bookingData.to || "",
        type: "Destination",
      },
      time: bookingData.time || "",
      duration: bookingData.mapDuration || "45 min",
      seats: {
        available: availableSeats,
        total: totalSeats,
      },
      price: `$${PER_SEAT_RATE_USD}.00`,
    }

    try {
      const storedUserRides = localStorage.getItem('userAddedRides')
      const existingRides = storedUserRides ? JSON.parse(storedUserRides) : []
      const updatedRides = [...existingRides, newRide]
      localStorage.setItem('userAddedRides', JSON.stringify(updatedRides))
      // Dispatch custom event to notify page.tsx of the change
      window.dispatchEvent(new CustomEvent('userRideAdded'))
    } catch (error) {
      console.error('Error adding user shared ride:', error)
    }
  }, [bookingData, personalData])

  if (!isOpen || (!bookingData && !personalData && !rideData)) return null

  const isJoinRideFlow = !!rideData

  // Function to save booked ride to localStorage
  const saveBookedRide = () => {
    if (!bookingData || !personalData) return

    const bookedRide = {
      id: Date.now(),
      timeAgo: "Just now",
      postedDate: new Date(),
      frequency: "one-time",
      driver: {
        name: personalData.fullName,
        image: "/placeholder-user.jpg"
      },
      vehicle: bookingData.rideType === "shared" ? "Shared Vehicle" : "Private Vehicle",
      pickup: {
        location: bookingData.from || "N/A",
        type: "Pickup point"
      },
      destination: {
        location: bookingData.to || "N/A",
        type: "Destination"
      },
      time: bookingData.time || "N/A",
      duration: bookingData.mapDuration || "TBD",
      seats: {
        available: bookingData.rideType === "shared" ? parseInt(String(personalData.seatCount)) : 0,
        total: bookingData.rideType === "shared" ? parseInt(String(personalData.seatCount)) : 1
      },
      price: bookingData.calculatedFare ? "Calculated" : "$15.00",
      bookingId: `BK-${Date.now()}`,
      customerEmail: personalData.email,
      customerPhone: personalData.phone,
      specialRequests: personalData.specialRequests || "None"
    }

    // Get existing booked rides
    const existingBookedRides = JSON.parse(localStorage.getItem('bookedRides') || '[]')
    
    // Add new booked ride at the beginning (newest first)
    const updatedBookedRides = [bookedRide, ...existingBookedRides]
    
    // Save to localStorage
    localStorage.setItem('bookedRides', JSON.stringify(updatedBookedRides))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('rideBooked', { detail: bookedRide }))
  }

  const handleEmailBooking = async () => {
    console.log('Email booking clicked - isJoinRideFlow:', isJoinRideFlow)
    console.log('Email booking clicked - rideData:', rideData)
    console.log('Email booking clicked - personalData:', personalData)
    console.log('Email booking clicked - selectedSeats:', selectedSeats)
    
    // Set submit attempt flag
    setHasAttemptedSubmit(true)

    // Run validation
    const errors = validateBookingData()
    setValidationErrors(errors)

    // Stop if validation failed
    if (errors.length > 0) {
      console.log('Validation errors:', errors)
      return
    }

    // Clear any previous errors
    setValidationErrors([])

    // Always call addUserSharedRide if this is a shared ride booking, regardless of join flow
    if (bookingData?.rideType === 'shared' && !isJoinRideFlow) {
      const created = await addUserSharedRide()
      // If creation failed, stop the flow so user can retry
      if (created === null) return
    }

  let bookingDetails = ""

    if (isJoinRideFlow) {
      // For shared rides, simulate booking success, update seats, show confirmation
      console.log('Email booking - onUpdateSeats:', onUpdateSeats, 'rideData:', rideData, 'selectedSeats:', selectedSeats)
      if (onUpdateSeats && rideData && selectedSeats) {
        console.log('Calling onUpdateSeats with rideData.id:', rideData.id, 'selectedSeats:', selectedSeats)
        onUpdateSeats(rideData.id, selectedSeats)

        // Extract pricing for shared rides
        let extractedSeats = selectedSeats || 1;
        let extractedTotal = "N/A";
        let extractedPerPersonFare = "N/A";

        if (bookingData?.calculatedFare) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = bookingData.calculatedFare;
          const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
          const totalElement = tempDiv.querySelector('[style*="color:blue"]');
          if (perPersonElement) extractedPerPersonFare = perPersonElement.textContent || "N/A";
          if (totalElement) extractedTotal = totalElement.textContent || "N/A";
        }

        // Create email booking message for join ride
        const joinRideEmailDetails = `
Taxi Booking Request

Route: ${rideData?.pickup?.location || "N/A"} → ${rideData?.destination?.location || "N/A"}
Date: ${rideData?.time ? rideData.time.split(' ')[0] : "N/A"}
Time: ${rideData?.time ? rideData.time.split(' ')[1] + ' ' + rideData.time.split(' ')[2] : "N/A"}
Type: Shared, One Way Ride

Personal Details:
• Name: ${personalData?.fullName || "N/A"}
• Email: ${personalData?.email || "N/A"}
• Phone: ‪+94${personalData?.phone || "N/A"}‬
• Seats: ${selectedSeats}

Special Requests: ${personalData?.specialRequests || "None"}

Price: $${extractedPerPersonFare} for ${selectedSeats} persons

Please confirm this booking. Thank you!
        `.trim()
        
        console.log('Generated email message:', joinRideEmailDetails)

        // Send email booking (using the same format as WhatsApp but via email)
        const emailSubject = `Join Shared Ride Request - ${rideData?.pickup?.location || "Unknown"} to ${rideData?.destination?.location || "Unknown"}`
        const emailLink = `mailto:contact@nextgcodex.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(joinRideEmailDetails)}`
        console.log('Email link:', emailLink)
        window.open(emailLink, "_blank")

        // Send confirmation email to customer
        const customerEmailSubject = "Thanks for choosing us — Your Booking Has Been Received"
        const customerEmailLink = `mailto:${personalData?.email}?subject=${encodeURIComponent(customerEmailSubject)}&body=${encodeURIComponent(joinRideEmailDetails)}`
        window.open(customerEmailLink, "_blank")

        // Send confirmation email after booking confirmation
        await sendConfirmationEmail(bookingData, personalData, rideData, true, selectedSeats, extractedSeats, extractedTotal, extractedPerPersonFare)
        
        setConfirmationMessage("Your booking request has been sent via Email! We will contact you soon to confirm your ride.")
        setShowConfirmation(true)

        // Save the booked ride to localStorage
        saveBookedRide()
        
        // Close the form after successful booking and refresh the page
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 2000)
      }
    } else {
      const rideTypeFormatted = bookingData?.rideType ? bookingData.rideType.charAt(0).toUpperCase() + bookingData.rideType.slice(1) : "N/A"
      const tripTypeFormatted = bookingData?.tripType ? bookingData.tripType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : "N/A"

  const subject = `Taxi Booking Request - ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}`

      // Extract price from calculated fare HTML - prioritize total price (blue) over per-person (green)
      let priceText = "Price not calculated"
      if (bookingData?.calculatedFare) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bookingData.calculatedFare;
        // First try to get the total price (blue), then fallback to per-person (green)
        const totalElement = tempDiv.querySelector('[style*="color:blue"]');
        const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
        if (totalElement) {
          priceText = totalElement.textContent || "Price not available";
        } else if (perPersonElement) {
          priceText = perPersonElement.textContent || "Price not available";
        }
      } else {
        // Fallback to calculated price if no fare calculator was used
        const calc = getCalculatedPrice();
        priceText = formatPriceUSD(calc.total);
      }

      bookingDetails = `
Taxi Booking Request

Route: ${bookingData?.from || "N/A"} → ${bookingData?.to || "N/A"}
Date: ${bookingData?.date || "N/A"}
Time: ${bookingData?.time || "N/A"}
Type: Shared, One Way Ride

Personal Details:
• Name: ${personalData?.fullName || "N/A"}
• Email: ${personalData?.email || "N/A"}
• Phone: ‪+94${personalData?.phone || "N/A"}‬
• Seats: ${personalData?.seatCount || "N/A"}

Special Requests: ${personalData?.specialRequests || "None"}

Price: $${priceText.replace('$', '')} for ${personalData?.seatCount} persons

Please confirm this booking. Thank you!
      `.trim()

      // Send booking request to company
      const mailtoLink = `mailto:contact@nextgcodex.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bookingDetails)}`
      window.open(mailtoLink, "_blank")

      // Send confirmation email to customer
      const customerEmailSubject = "Thanks for choosing us — Your Booking Has Been Received"
      const customerEmailLink = `mailto:${personalData?.email}?subject=${encodeURIComponent(customerEmailSubject)}&body=${encodeURIComponent(bookingDetails)}`
      window.open(customerEmailLink, "_blank")

      // Send confirmation email to customer immediately
  const regularSeats = parseInt(String(personalData?.seatCount || "1"), 10);
  const regularTotal = priceText;
  let regularPerPersonFare = "N/A";

      // For shared rides, extract per person fare
      if (bookingData?.rideType === "shared" && bookingData?.calculatedFare) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bookingData.calculatedFare;
        const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
        if (perPersonElement) regularPerPersonFare = perPersonElement.textContent || "N/A";
      } else if (bookingData?.rideType !== "shared") {
        regularPerPersonFare = priceText; // For personal rides, total and per person are the same
      }

      await sendConfirmationEmail(bookingData, personalData, rideData, false, selectedSeats, regularSeats, regularTotal, regularPerPersonFare)
      
      // Save the booked ride to localStorage
      saveBookedRide()
      
      // Show confirmation and close form after successful booking
      setConfirmationMessage("Your booking request has been sent via email! We will contact you soon to confirm your ride.")
      setShowConfirmation(true)
      
      // Close the form after successful booking and refresh the page
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 2000)
    }
  }

  const handleWhatsAppBooking = async () => {
    console.log('WhatsApp booking clicked - isJoinRideFlow:', isJoinRideFlow)
    console.log('WhatsApp booking clicked - rideData:', rideData)
    console.log('WhatsApp booking clicked - personalData:', personalData)
    console.log('WhatsApp booking clicked - selectedSeats:', selectedSeats)
    
    // Set submit attempt flag
    setHasAttemptedSubmit(true)

    // Run validation
    const errors = validateBookingData()
    setValidationErrors(errors)

    // Stop if validation failed
    if (errors.length > 0) {
      console.log('Validation errors:', errors)
      return
    }

    // Clear any previous errors
    setValidationErrors([])

    // Always call addUserSharedRide if this is a shared ride booking, regardless of join flow
    if (bookingData?.rideType === 'shared' && !isJoinRideFlow) {
      const created = await addUserSharedRide()
      if (created === null) return
    }

  let bookingDetails = ""

    if (isJoinRideFlow) {
      // For shared rides, simulate booking success, update seats, show confirmation
      console.log('WhatsApp booking - onUpdateSeats:', onUpdateSeats, 'rideData:', rideData, 'selectedSeats:', selectedSeats)
      if (onUpdateSeats && rideData && selectedSeats) {
        console.log('Calling onUpdateSeats with rideData.id:', rideData.id, 'selectedSeats:', selectedSeats)
        onUpdateSeats(rideData.id, selectedSeats)

        // Extract pricing for shared rides
        let whatsappSeats = selectedSeats || 1;
        let whatsappTotal = "N/A";
        let whatsappPerPersonFare = "N/A";

        if (bookingData?.calculatedFare) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = bookingData.calculatedFare;
          const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
          const totalElement = tempDiv.querySelector('[style*="color:blue"]');
          if (perPersonElement) whatsappPerPersonFare = perPersonElement.textContent || "N/A";
          if (totalElement) whatsappTotal = totalElement.textContent || "N/A";
        }

        // Create WhatsApp message for join ride
        const joinRideDetails = `
Taxi Booking Request

Route: ${rideData?.pickup?.location || "N/A"} → ${rideData?.destination?.location || "N/A"}
Date: ${rideData?.time ? rideData.time.split(' ')[0] : "N/A"}
Time: ${rideData?.time ? rideData.time.split(' ')[1] + ' ' + rideData.time.split(' ')[2] : "N/A"}
Type: Shared, One Way Ride

Personal Details:
• Name: ${personalData?.fullName || "N/A"}
• Email: ${personalData?.email || "N/A"}
• Phone: ‪+94${personalData?.phone || "N/A"}‬
• Seats: ${selectedSeats}

Special Requests: ${personalData?.specialRequests || "None"}

Price: $${whatsappPerPersonFare} for ${selectedSeats} persons

Please confirm this booking. Thank you!
        `.trim()
        
        console.log('Generated WhatsApp message:', joinRideDetails)

        // Send WhatsApp message
        const whatsappLink = `https://wa.me/94759627589?text=${encodeURIComponent(joinRideDetails)}`
        console.log('WhatsApp link:', whatsappLink)
        window.open(whatsappLink, "_blank")

        // Send confirmation email to customer
        const customerEmailSubject = "Thanks for choosing us — Your Booking Has Been Received"
        const customerEmailLink = `mailto:${personalData?.email}?subject=${encodeURIComponent(customerEmailSubject)}&body=${encodeURIComponent(joinRideDetails)}`
        window.open(customerEmailLink, "_blank")

        // Send confirmation email after booking confirmation
        await sendConfirmationEmail(bookingData, personalData, rideData, true, selectedSeats, whatsappSeats, whatsappTotal, whatsappPerPersonFare)
        
        setConfirmationMessage("Your booking request has been sent via WhatsApp! We will contact you soon to confirm your ride.")
        setShowConfirmation(true)

        // Save the booked ride to localStorage
        saveBookedRide()
        
        // Close the form after successful booking and refresh the page
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 2000)
      }
    } else {
      const rideTypeFormatted = bookingData?.rideType ? bookingData.rideType.charAt(0).toUpperCase() + bookingData.rideType.slice(1) : "N/A"
      const tripTypeFormatted = bookingData?.tripType ? bookingData.tripType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : "N/A"

      const subject = `Taxi Booking Request - ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}`

      // Extract price from calculated fare HTML - prioritize total price (blue) over per-person (green)
      let priceText = "Price not calculated"
      if (bookingData?.calculatedFare) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bookingData.calculatedFare;
        // First try to get the total price (blue), then fallback to per-person (green)
        const totalElement = tempDiv.querySelector('[style*="color:blue"]');
        const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
        if (totalElement) {
          priceText = totalElement.textContent || "Price not available";
        } else if (perPersonElement) {
          priceText = perPersonElement.textContent || "Price not available";
        }
      } else {
        // Fallback to calculated price if no fare calculator was used
        const calc = getCalculatedPrice();
        priceText = formatPriceUSD(calc.total);
      }

      bookingDetails = `
Taxi Booking Request

Route: ${bookingData?.from || "N/A"} → ${bookingData?.to || "N/A"}
Date: ${bookingData?.date || "N/A"}
Time: ${bookingData?.time || "N/A"}
Type: Shared, One Way Ride

Personal Details:
• Name: ${personalData?.fullName || "N/A"}
• Email: ${personalData?.email || "N/A"}
• Phone: ‪+94${personalData?.phone || "N/A"}‬
• Seats: ${personalData?.seatCount || "N/A"}

Special Requests: ${personalData?.specialRequests || "None"}

Price: $${priceText.replace('$', '')} for ${personalData?.seatCount} persons

Please confirm this booking. Thank you!
      `.trim()

      // Send WhatsApp message
      const whatsappLink = `https://wa.me/94759627589?text=${encodeURIComponent(bookingDetails)}`
      window.open(whatsappLink, "_blank")

      // Send confirmation email to customer
      const customerEmailSubject = "Thanks for choosing us — Your Booking Has Been Received"
      const customerEmailLink = `mailto:${personalData?.email}?subject=${encodeURIComponent(customerEmailSubject)}&body=${encodeURIComponent(bookingDetails)}`
      window.open(customerEmailLink, "_blank")

      // Send confirmation email to customer immediately
      await sendConfirmationEmail(bookingData, personalData, rideData, false, selectedSeats)
      
      // Save the booked ride to localStorage
      saveBookedRide()
      
      // Show confirmation and close form after successful booking
      setConfirmationMessage("Your booking request has been sent via WhatsApp! We will contact you soon to confirm your ride.")
      setShowConfirmation(true)
      
      // Close the form after successful booking and refresh the page
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 2000)
    }
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    onClose() // Close the payment popup as well
  }

  const getCalculatedPrice = () => {
    if (!bookingData && !rideData) return { total: 0, perSeat: 0, seatCost: 0, distanceCost: 0, subtotal: 0, passengersNum: 0, seats: 0, perKmRate: 0, distance: 0, tripMult: 0 }

    const passengersNum = isJoinRideFlow
      ? (rideData?.seats.total || 1) // For shared rides, passenger count for vehicle calculation
      : typeof bookingData?.passengers === 'string'
        ? parseInt(bookingData.passengers || "1", 10)
        : bookingData?.passengers || 1;

    const requestedSeats = parseInt(String(personalData?.seatCount || "1"), 10);
    const seats = isJoinRideFlow
      ? (selectedSeats || 0)
      : requestedSeats;

    const distance = isJoinRideFlow
      ? (rideData?.distanceKm || 45) // Default shared distance
      : (bookingData?.mapDistance ? parseFloat(bookingData.mapDistance) : 0);

    let totalPrice;
    const perKmRate = getPerKmRate(passengersNum);
    const tripMult = getTripMultiplier((bookingData?.tripType as "one-way" | "round-trip" | "multi-city") || "one-way");

    const distanceCost = perKmRate * distance;
    const subtotal = distanceCost; // We'll add seat cost separately based on type

    if (isJoinRideFlow) {
      // Progressive pricing for shared ride joins
      const progressiveTotal = calculateProgressiveSharedTotal(seats);
      totalPrice = progressiveTotal;
    } else {
      const seatCost = PER_SEAT_RATE_USD * seats;
      totalPrice = calculateTotalPrice(distance, seats, passengersNum, (bookingData?.tripType as "one-way" | "round-trip" | "multi-city") || "one-way");
    }

    return {
      total: totalPrice,
      perSeat: PER_SEAT_RATE_USD,
      seatCost: isJoinRideFlow ? calculateProgressiveSharedTotal(seats) : PER_SEAT_RATE_USD * seats,
      distanceCost,
      subtotal,
      perKmRate,
      distance,
      passengersNum,
      seats,
      tripMult,
      isProgressive: isJoinRideFlow
    };
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <button
              onClick={onBack || onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
              title="Back to Personal Details"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
              title="Close"
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
                    <p className="font-semibold text-gray-900">
                      {isJoinRideFlow ? rideData?.pickup.location : bookingData?.from || "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm">Pickup point</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isJoinRideFlow ? rideData?.time : bookingData?.time || "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {isJoinRideFlow ? rideData?.duration : "45 min"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isJoinRideFlow ? rideData?.destination.location : bookingData?.to || "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm">Destination</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isJoinRideFlow
                        ? `${rideData?.seats.available}/${rideData?.seats.total} seats`
                        : `${personalData?.seatCount || "N/A"} seats`
                      }
                    </p>
                    <p className="text-gray-600 text-sm">Available</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 my-4" />

              {!isJoinRideFlow && (
                <div className="space-y-2 text-sm mb-4">
                  <h4 className="font-semibold text-gray-900">Calculated Price</h4>
                  {bookingData?.calculatedFare ? (
                    <div className="bg-blue-50 p-3 rounded-lg border">
                      <div
                        className="text-sm font-medium"
                        dangerouslySetInnerHTML={{ __html: bookingData.calculatedFare }}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      No fare calculated yet. Please use the fare calculator in the booking section.
                    </div>
                  )}
                </div>
              )}

              {isJoinRideFlow && (
                <div className="flex justify-end mb-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPriceUSD(calculateProgressiveSharedTotal(selectedSeats || 1))}
                    </p>
                    <p className="text-gray-600">for {selectedSeats || 1} seat{(selectedSeats || 1) > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}

              <hr className="border-gray-200" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">{personalData?.fullName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{personalData?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">+94{personalData?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Seats</p>
                  <p className="font-semibold text-gray-900">
                    {isJoinRideFlow ? selectedSeats : personalData?.seatCount || "N/A"}
                  </p>
                </div>
                {personalData?.specialRequests && (
                  <div>
                    <p className="text-gray-600">Special Requests</p>
                    <p className="font-semibold text-gray-900">{personalData.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Choose Booking Method</h3>

              {/* Validation Errors Display */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <strong>Please fix the following errors before booking:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

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

      {/* Shared Ride Confirmation Popup */}
      <SharedRideConfirmationPopup
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        message={confirmationMessage}
      />
    </>
  )
}
