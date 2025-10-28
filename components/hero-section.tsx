import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Shield, Star, MessageCircle } from "lucide-react"
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

const Map = dynamic(() => import('./map'), { ssr: false })

export function HeroSection() {
  const t = useTranslations('hero')
  return (
    <section id="hero-section" className="relative bg-white py-20 overflow-hidden">
      {/* Decorative Circles */}
      {/* Group 1: Top-left cluster */}
      <div className="absolute top-20 left-20 w-[150px] h-[150px] bg-orange-200/30 rounded-full"></div>
      <div className="absolute top-40 left-40 w-[80px] h-[80px] bg-orange-300/40 rounded-full"></div>
      {/* Group 2: Bottom-right cluster */}
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-orange-200/25 rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-[120px] h-[120px] bg-orange-300/35 rounded-full"></div>
      <div className="absolute bottom-40 right-40 w-[60px] h-[60px] bg-orange-100/45 rounded-full"></div>
      {/* Group 3: Mid-right cluster */}
      <div className="absolute top-1/3 right-10 w-[180px] h-[180px] bg-orange-300/30 rounded-full"></div>
      <div className="absolute top-1/2 right-20 w-[90px] h-[90px] bg-orange-100/40 rounded-full"></div>
      <div className="absolute top-2/3 right-5 w-[50px] h-[50px] bg-orange-200/50 rounded-full"></div>
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/30">{t('badge')}</Badge>
            <h1 className="text-4xl lg:text-7xl font-bold text-balance">
              <span className="text-2xl lg:text-5xl">{t('title.line1')}</span> <br /><span className="text-primary text-5xl lg:text-7xl">Share Taxi Sri Lanka</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-16 px-8 text-lg font-popins"
              onClick={() => {
                const element = document.getElementById('booking-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('buttons.bookIndividualRide')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-16 px-8 text-lg font-popins relative z-50 pointer-events-auto"
              onClick={() => {
                // Ensure mobile browsers also update hash and scroll
                try {
                  window.location.hash = '#shared-rides-section'
                } catch {}
                const element = document.getElementById('shared-rides-section');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {t('buttons.joinSharedRide')}
            </Button>

          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center mt-12">
          <div className="relative">
            <div className="relative">
              <img
                src="/images/home.jpg"
                alt="Premium taxi vehicle"
                className="w-full h-auto rounded-3xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium">{t('features.service247')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">{t('features.verifiedDrivers')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-accent/20 p-4 rounded-full">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">{t('features.starRated')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">{t('features.realTimeTracking')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
