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
  const [addedVehicles, setAddedVehicles] = useState<any[]>([])
  const { isLoggedIn, user, login, logout } = useAuth()

  // Load admin-added items from localStorage
  useEffect(() => {
    try {
      const storedRides = localStorage.getItem('adminAddedRides')
      if (storedRides) {
        setAddedRides(JSON.parse(storedRides))
      }
    } catch (error) {
      console.error('Error loading added rides:', error)
    }

    try {
      const storedVehicles = localStorage.getItem('adminAddedVehicles')
      if (storedVehicles) {
        setAddedVehicles(JSON.parse(storedVehicles))
      }
    } catch (error) {
      console.error('Error loading added vehicles:', error)
    }
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
        <BookingSection />
        <SharedRidesSection initialRides={addedRides} />
        <VehicleOptionsSection initialVehicles={addedVehicles} />
        <WhyChooseUsSection />
        <ReviewsSection />
      </main>
      <Footer />

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
