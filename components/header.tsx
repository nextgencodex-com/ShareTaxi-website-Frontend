"use client"

import { Button } from "@/components/ui/button"
import { User, Menu, X } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  isLoggedIn?: boolean
  onLoginClick?: () => void
  onAdminLoginClick?: () => void
}

export function Header({ isLoggedIn = false, onLoginClick, onAdminLoginClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const tNav = useTranslations('nav')
  const router = useRouter()

  return (
    <>
      <header className="relative z-50 pt-4 md:pt-6 px-4 md:px-6">
        <div className="bg-black rounded-full px-4 md:px-8 py-3 md:py-4 max-w-6xl mx-auto relative">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <img src="/placeholder-logo.svg" alt="Share Taxi Sri Lanka" className="lg:hidden h-6 md:h-8" />

            {/* Mobile Centered Title */}
            <span className="lg:hidden absolute inset-0 flex items-center justify-center text-white font-medium text-base md:text-lg whitespace-nowrap pointer-events-none">
              Share Taxi Sri Lanka
            </span>

            {/* Desktop Logo and Brand Name */}
            <div className="hidden lg:flex items-center gap-2 md:gap-3">
              <img src="/placeholder-logo.svg" alt="Share Taxi Sri Lanka" className="h-8 md:h-10" />
              <span className="text-white font-semibold text-base md:text-lg whitespace-nowrap">
                Share Taxi Sri Lanka
              </span>
            </div>

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#hero-section" className="text-yellow-400 font-medium hover:text-yellow-300 transition-colors text-sm">
                {tNav('home')}
              </a>
              <a href="#booking-section" className="text-white font-medium hover:text-yellow-400 transition-colors text-sm">
                {tNav('bookTaxi')}
              </a>
              <a href="#shared-rides-section" className="text-white font-medium hover:text-yellow-400 transition-colors text-sm">
                {tNav('sharedRides')}
              </a>
              <a href="#vehicle-options-section" className="text-white font-medium hover:text-yellow-400 transition-colors text-sm">
                {tNav('carOption')}
              </a>
            </nav>

            {/* Desktop - Profile (admin moved to footer) */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (isLoggedIn) {
                      router.push('/user-profile')
                    } else {
                      onLoginClick?.()
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 p-0"
                >
                  <User className="h-5 w-5 text-black" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="lg:hidden text-white hover:text-yellow-300 hover:bg-transparent p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-30 lg:hidden overflow-y-auto">
          <div className="p-4">
            {/* Close button */}
            <div className="flex justify-end mb-6">
              <Button
                variant="ghost"
                className="text-white hover:text-yellow-400 hover:bg-transparent p-2 rounded-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Menu items as compact tiles */}
            <div className="space-y-3 max-w-md mx-auto">
              {/* Admin tile removed from mobile menu (moved to footer) */}

              {/* Navigation tiles */}
              <a
                href="#hero-section"
                className="block bg-gray-900/90 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-yellow-400 font-semibold text-base">{tNav('home')}</h3>
              </a>

              <a
                href="#booking-section"
                className="block bg-gray-900/90 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-white font-semibold text-base">{tNav('bookTaxi')}</h3>
              </a>

              <a
                href="#shared-rides-section"
                className="block bg-gray-900/90 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-white font-semibold text-base">{tNav('sharedRides')}</h3>
              </a>

              <a
                href="#vehicle-options-section"
                className="block bg-gray-900/90 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-white font-semibold text-base">{tNav('carOption')}</h3>
              </a>

              {/* Profile tile */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    router.push('/user-profile')
                  } else {
                    onLoginClick?.()
                  }
                  setIsMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-start gap-3 bg-transparent"
              >
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                  <User className="h-4 w-4 text-yellow-400" />
                </div>
                <span className="text-white font-medium text-base">{isLoggedIn ? tNav('profile') : tNav('signIn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
