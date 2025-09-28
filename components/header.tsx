import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Menu, User } from "lucide-react"

export function Header() {
  return (
    <header className="bg-black mt-6 mx-auto max-w-6xl rounded-full">
      <div className="px-20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Share Taxi Sri Lanka Logo" className="h-12 w-auto" />
            <span className="text-xl font-bold text-white">Share Taxi Sri Lanka</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#hero-section" className="text-white hover:text-primary transition-colors">
              Home
            </a>
            <a href="#booking-section" className="text-white hover:text-primary transition-colors">
              Book Taxi
            </a>
            <a href="#shared-rides-section" className="text-white hover:text-primary transition-colors">
              Shared Rides
            </a>
            <a href="#vehicle-options-section" className="text-white hover:text-primary transition-colors">
              Car Option
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Select>
              <SelectTrigger className="w-32 bg-black border-black text-white">
                <SelectValue placeholder="English" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="si">Sinhala</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
