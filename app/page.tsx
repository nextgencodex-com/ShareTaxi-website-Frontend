import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { BookingSection } from "@/components/booking-section"
import { SharedRidesSection } from "@/components/shared-rides-section"
import { VehicleOptionsSection } from "@/components/vehicle-options-section"
import { WhyChooseUsSection } from "@/components/why-choose-us-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BookingSection />
        <SharedRidesSection />
        <VehicleOptionsSection />
        <WhyChooseUsSection />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  )
}
