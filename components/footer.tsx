import { Button } from "@/components/ui/button"
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-700">
      {/* Main Footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Car className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Share Taxi Sri Lanka</span>
              </div>
              <p className="text-gray-300 text-sm">
                Premium transportation services across Sri Lanka. Safe, reliable, and comfortable rides for every
                journey.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-gray-800">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-gray-800">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-gray-800">
                  <Instagram className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="font-semibold">Services</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Airport Transfers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    City Tours
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Corporate Travel
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Wedding Transportation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Long Distance Trips
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Safety Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+94 11 234 5678</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MessageCircle className="h-4 w-4 text-green-400" />
                  <span>+94 75 962 7589</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@ridesharelanka.com</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span>123 Galle Road, Colombo 03, Sri Lanka</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 Share Taxi Sri Lanka. All rights reserved. | Developed by NextGen-CodeX</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
