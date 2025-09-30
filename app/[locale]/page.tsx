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


      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsLoginSignupOpen(true)}
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
