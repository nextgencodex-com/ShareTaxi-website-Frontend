import { Button } from "@/components/ui/button"
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, Shield } from "lucide-react"

interface FooterProps {
  onAdminLoginClick?: () => void
}

export function Footer({ onAdminLoginClick }: FooterProps) {
  return (
    <footer className="bg-black text-white border-t border-gray-700">
      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-full items-start">
            {/* Column 1: Logo and Company Name */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <img src="/images/logo.png" alt="Share Taxi Sri Lanka" className="h-10 w-12" />
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Share Taxi Sri Lanka
                </span>
              </div>
            </div>

            {/* Column 2: Description Text */}
            <div className="text-center space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                Experience premium transportation services across Sri Lanka. We provide safe, reliable, and comfortable rides
                for every journey with professional drivers and well-maintained vehicles.
              </p>
            </div>

            {/* Column 3: Social Buttons */}
            <div className="flex flex-col items-center md:items-end space-y-4">
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" className="p-3 text-white hover:bg-gray-800 transition-all duration-300 rounded-lg">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-3 text-white hover:bg-gray-800 transition-all duration-300 rounded-lg">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-3 text-white hover:bg-gray-800 transition-all duration-300 rounded-lg">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="mt-12 pt-8 border-t border-gray-600/50">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer group">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Hotline</p>
                  <p className="text-sm">+94 77 401 8001 </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer group">
                <div className="p-2 rounded-full bg-green-400/10 group-hover:bg-green-400/20 transition-colors duration-200 flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-sm">+94 78 7018 001</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer group">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">info@sharetaxisrilanka.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer group">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm">Kandy, Sri Lanka</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="mt-8 pt-8 border-t border-gray-600/50">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">Accepted Payment Methods & Certifications</p>
              <div className="flex justify-center">
                <img 
                  src="/images/icons.png" 
                  alt="Payment Methods and Certifications" 
                  className="h-15 object-contain max-w-full"
                />
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-gray-600/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <p className="text-gray-400 text-sm">
                &copy; 2024 Share Taxi Sri Lanka. All rights reserved. | Developed by NextGen CodeX PVT LTD
              </p>
              {/* Admin button moved here for placement */}
              <div>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-yellow-400 hover:bg-transparent px-4 py-2 rounded-lg transition-all duration-300"
                  onClick={() => onAdminLoginClick?.()}
                >
                  <Shield className="h-4 w-4 mr-2" />
               
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}