"use client"

import { Button } from "@/components/ui/button"
import { User, Menu, X } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"

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
        <div className="bg-black rounded-full px-4 md:px-8 py-3 md:py-4 max-w-6xl mx-auto relative shadow-lg">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <img src="/images/logo.png" alt="Share Taxi Sri Lanka" className="lg:hidden h-6 md:h-8" />

            {/* Mobile Centered Title */}
            <span className="lg:hidden absolute inset-0 flex items-center justify-center text-white font-medium text-base md:text-lg whitespace-nowrap pointer-events-none">
              Share Taxi Sri Lanka
            </span>

            {/* Desktop Logo and Brand Name */}
            <div className="hidden lg:flex items-center gap-2 md:gap-3">
              <img src="/images/logo.png" alt="Share Taxi Sri Lanka" className="h-8 md:h-10" />
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

            {/* Desktop - Profile */}
            <div className="hidden lg:flex items-center gap-4">
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

      {/* ✅ Animated Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[70px] bg-gradient-to-b from-black/90 to-gray-900/95 backdrop-blur-md z-30 lg:hidden rounded-b-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-5 pb-6">
              <div className="space-y-3 max-w-md mx-auto">
                {[
                  { href: "#hero-section", label: tNav('home'), color: "text-yellow-400" },
                  { href: "#booking-section", label: tNav('bookTaxi'), color: "text-white" },
                  { href: "#shared-rides-section", label: tNav('sharedRides'), color: "text-white" },
                  { href: "#vehicle-options-section", label: tNav('carOption'), color: "text-white" },
                ].map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.href}
                    className="block bg-gray-900/80 hover:bg-yellow-500/20 rounded-2xl px-5 py-4 transition-all border border-gray-800/70"
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <h3 className={`${link.color} font-semibold text-base text-center tracking-wide`}>
                      {link.label}
                    </h3>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
