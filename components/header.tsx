import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Menu, User, Globe, LogOut } from "lucide-react"

interface User {
  fullName: string
  email: string
  phone: string
}

interface HeaderProps {
  onLoginSignupClick: () => void
  isLoggedIn: boolean
  user: User | null
  onLogout: () => void
}

export function Header({ onLoginSignupClick, isLoggedIn, user, onLogout }: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false)
  return (
    <header className="bg-black mt-6 mx-auto max-w-7xl rounded-full">
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

          <div className="flex items-center gap-4 relative">
            {/* Language Button */}
            <button className="text-white border border-white hover:bg-white hover:text-black rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300">
              <Globe className="w-5 h-5" />
            </button>

            {isLoggedIn ? (
              <>
                {/* Profile Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="text-white border border-white hover:bg-white hover:text-black rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfile && user && (
                    <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-lg p-4 min-w-64 z-50">
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <User className="w-6 h-6 text-orange-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="text-gray-900">{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="text-gray-900">+94 {user.phone}</span>
                          </div>
                        </div>

                        <Link href="/user-profile" onClick={() => setShowProfile(false)}>
                          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mb-2">
                            View Profile
                          </Button>
                        </Link>

                        <Button
                          onClick={() => {
                            onLogout()
                            setShowProfile(false)
                          }}
                          className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  onClick={onLoginSignupClick}
                  className="bg-white text-black hover:bg-gray-200 font-medium"
                >
                  Login
                </Button>

                {/* Sign Up Button */}
                <Button
                  onClick={onLoginSignupClick}
                  className="bg-white text-black hover:bg-gray-200 font-medium"
                >
                  Sign Up
                </Button>
              </>
            )}

            <Button variant="ghost" size="sm" className="md:hidden text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
