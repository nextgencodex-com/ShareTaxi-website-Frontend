import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Shield, Star } from "lucide-react"
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./map'), { ssr: false })

export function HeroSection() {
  return (
    <section id="hero-section" className="relative bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/30">Premium Ride Experience</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Premium Ride Experience with <br /><span className="text-primary">Share Taxi Sri Lanka</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Book scheduled or shared rides with our premium fleet. Safe, reliable, and comfortable transportation at
              your fingertips.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
              Book Individual Ride
            </Button>
            <Button variant="outline" size="lg" className="rounded-full">
              Join Shared Ride
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
              <span className="text-sm font-medium">24/7 Service</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Verified Driver</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-accent/20 p-4 rounded-full">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">5-Star Rated</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Real-Time Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
