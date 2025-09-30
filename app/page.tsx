"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { BookingSection } from "@/components/booking-section"
import { SharedRidesSection } from "@/components/shared-rides-section"
import { VehicleOptionsSection } from "@/components/vehicle-options-section"
import { WhyChooseUsSection } from "@/components/why-choose-us-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"
import { LoginSignupPopup } from "@/components/login-signup-popup"
import { useAuth } from "@/components/auth-context"

export default function HomePage() {
  const [isLoginSignupOpen, setIsLoginSignupOpen] = useState(false)
  const { isLoggedIn, user, login, logout } = useAuth()

  const handleLogin = (userData: NonNullable<typeof user>) => {
    login(userData)
    setIsLoginSignupOpen(false)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Decorative Circles */}
      <div className="absolute left-32 top-1/3 w-72 h-72 bg-orange-300/25 rounded-full"></div>
      <div className="absolute left-0 top-1/2 w-48 h-48 bg-orange-200/40 rounded-full"></div>
      <div className="absolute left-16 bottom-1/3 w-64 h-64 bg-orange-300/30 rounded-full"></div>

      <Header
        onLoginSignupClick={() => setIsLoginSignupOpen(true)}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
      />
      <main>
        <HeroSection />
        <BookingSection />
        <SharedRidesSection />
        <VehicleOptionsSection />
        <WhyChooseUsSection />
        <ReviewsSection />
      </main>
      <Footer />

      <LoginSignupPopup
        isOpen={isLoginSignupOpen}
        onClose={() => setIsLoginSignupOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}
