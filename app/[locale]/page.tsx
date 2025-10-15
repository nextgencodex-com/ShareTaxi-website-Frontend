"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { BookingSection } from "@/components/booking-section"
import { SharedRidesSection } from "@/components/shared-rides-section"
import { VehicleOptionsSection } from "@/components/vehicle-options-section"
import { WhyChooseUsSection } from "@/components/why-choose-us-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"
import { LoginSignupPopup } from "@/components/login-signup-popup"
import { AdminPanel } from "@/components/admin-panel"
import { AdminLogin } from "@/components/admin-login"
import { useAuth } from "@/components/auth-context"

export default function HomePage() {
  const [isLoginSignupOpen, setIsLoginSignupOpen] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [addedRides, setAddedRides] = useState<any[]>([])
  const [userAddedRides, setUserAddedRides] = useState<any[]>([])
  const [customRides, setCustomRides] = useState<any[]>([])
  const [addedVehicles, setAddedVehicles] = useState<any[]>([])
  const { isLoggedIn, user, login, logout } = useAuth()

  // Load admin-added and user-added items from localStorage
  useEffect(() => {
    const loadRides = () => {
      try {
        const storedAdminRides = localStorage.getItem('adminAddedRides')
        if (storedAdminRides) {
          setAddedRides(JSON.parse(storedAdminRides))
        }
      } catch (error) {
        console.error('Error loading admin added rides:', error)
      }

      try {
        const storedUserRides = localStorage.getItem('userAddedRides')
        if (storedUserRides) {
          const parsed = JSON.parse(storedUserRides)
          // Convert postedDate strings back to Date objects
          const userRidesWithDates = parsed.map((ride: any) => ({
            ...ride,
            postedDate: new Date(ride.postedDate)
          }))
          setUserAddedRides && setUserAddedRides(userRidesWithDates)
        }
      } catch (error) {
        console.error('Error loading user added rides:', error)
      }
    }

    loadRides()

    try {
      const storedVehicles = localStorage.getItem('adminAddedVehicles')
      if (storedVehicles) {
        setAddedVehicles(JSON.parse(storedVehicles))
      }
    } catch (error) {
      console.error('Error loading added vehicles:', error)
    }

    // Listen for user ride additions
    const handleUserRideAdded = () => {
      loadRides()
    }

    window.addEventListener('userRideAdded', handleUserRideAdded)

    return () => {
      window.removeEventListener('userRideAdded', handleUserRideAdded)
    }
  }, [])

  // Try to load live shared rides from backend; if unavailable, we'll fall back to local stored rides
  const [apiRides, setApiRides] = useState<any[] | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/shared-rides')
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        const apiList = (json?.data?.rides as unknown) || []
        if (!Array.isArray(apiList)) throw new Error('Unexpected API shape')

        const mapped = apiList.map((r: any) => {
          const idVal = r.id
          const id = typeof idVal === 'number' ? idVal : Date.now() + Math.floor(Math.random() * 1000)
          const timeRaw = r.time || r.postedDate || new Date().toISOString()
          const postedDate = new Date(timeRaw)
          const seatsObj = r.seats || {}
          const available = typeof r.availableSeats === 'number' ? r.availableSeats : (typeof seatsObj.available === 'number' ? seatsObj.available : 0)
          const total = typeof r.totalSeats === 'number' ? r.totalSeats : (typeof seatsObj.total === 'number' ? seatsObj.total : 0)
          const priceVal = typeof r.price === 'number' ? `$${r.price.toFixed(2)}` : (typeof r.price === 'string' ? r.price : '')

          return {
            id,
            timeAgo: 'just now',
            postedDate,
            frequency: typeof r.frequency === 'string' ? r.frequency : 'one-time',
            driver: { name: r.driverName || (r.driver && r.driver.name) || 'Unknown', image: r.driverImage || (r.driver && r.driver.image) || '/professional-driver-headshot.jpg' },
            vehicle: r.vehicle || '',
            pickup: { location: r.pickupLocation || (r.pickup && r.pickup.location) || '', type: 'Pickup point' },
            destination: { location: r.destinationLocation || (r.destination && r.destination.location) || '', type: 'Destination' },
            time: new Date(postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: r.duration || '',
            seats: { available, total },
            price: priceVal,
          }
        })

        if (mounted) {
          setApiRides(mapped)
          setApiError(null)
        }
      } catch (err) {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : String(err)
        console.warn('Failed to fetch shared rides API:', msg)
        setApiError(msg)
        setApiRides(null)
      }
    })()

    return () => { mounted = false }
  }, [])

  const handleLogin = (userData: NonNullable<typeof user>) => {
    login(userData)
    setIsLoginSignupOpen(false)
  }

  const handleLogout = () => {
    logout()
  }

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true)
    setIsAdminLoginOpen(false)
  }

  const handleAdminBack = () => {
    setIsAdminLoggedIn(false)
  }

  const handleAddRide = (ride: any) => {
    const newRide = { ...ride, id: Date.now(), timeAgo: "Just now", postedDate: new Date() }
    const updatedRides = [...addedRides, newRide]
    setAddedRides(updatedRides)
    localStorage.setItem('adminAddedRides', JSON.stringify(updatedRides))
  }

  const handleAddVehicle = (vehicle: any) => {
    const newVehicle = { ...vehicle, id: Date.now() }
    const updatedVehicles = [...addedVehicles, newVehicle]
    setAddedVehicles(updatedVehicles)
    localStorage.setItem('adminAddedVehicles', JSON.stringify(updatedVehicles))
  }

  const handleAddCustomerSharedRide = (bookingData: any) => {
    const newRide = {
      id: Date.now(),
      timeAgo: "Just now",
      postedDate: new Date(),
      frequency: "one-time",
      driver: {
        name: "Customer Requested",
        image: "/placeholder.svg"
      },
      vehicle: "To be assigned",
      pickup: {
        location: bookingData.from,
        type: "Pickup point"
      },
      destination: {
        location: bookingData.to,
        type: "Destination"
      },
      time: bookingData.time,
      duration: bookingData.mapDuration || "TBD",
      seats: {
        available: bookingData.passengers,
        total: bookingData.passengers
      },
      price: "$15.00"
    }
    setCustomRides(prev => [...prev, newRide])
    console.log('[v0] Customer shared ride added')
  }

  if (isAdminLoggedIn) {
    return (
      <AdminPanel
        onBack={handleAdminBack}
        onAddRide={handleAddRide}
        onAddVehicle={handleAddVehicle}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Decorative Circles */}


      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsLoginSignupOpen(true)}
        onAdminLoginClick={() => setIsAdminLoginOpen(true)}
      />

      <main>
        <HeroSection />
        <BookingSection onAddSharedRide={handleAddCustomerSharedRide} />
  {/* prefer live API rides when available; if backend is down show no rides (avoid showing local/demo data) */}
  <SharedRidesSection initialRides={apiRides ?? []} />
        <VehicleOptionsSection initialVehicles={addedVehicles} />
        <WhyChooseUsSection />
        <ReviewsSection />
      </main>
  <Footer onAdminLoginClick={() => setIsAdminLoginOpen(true)} />

      <LoginSignupPopup
        isOpen={isLoginSignupOpen}
        onClose={() => setIsLoginSignupOpen(false)}
        onLogin={handleLogin}
      />

      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />
    </div>
  )
}
