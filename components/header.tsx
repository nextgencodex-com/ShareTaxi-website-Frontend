"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, User, Menu, X } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { useLanguage } from '@/components/language-context'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  isLoggedIn?: boolean
  onLoginClick?: () => void
  onAdminLoginClick?: () => void
}

export function Header({ isLoggedIn = false, onLoginClick, onAdminLoginClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileLanguageOpen, setIsMobileLanguageOpen] = useState(false)
  const t = useTranslations('language')
  const tNav = useTranslations('nav')
  const { currentLocale, setLocale } = useLanguage()
  const router = useRouter()

  return (
    <>
      <header className="relative z-50 pt-4 md:pt-6 px-4 md:px-6">
        <div className="bg-black rounded-full px-4 md:px-8 py-3 md:py-4 max-w-6xl mx-auto relative">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <img src="/images/logo.png" alt="Share Taxi Sri Lanka" className="lg:hidden h-8 md:h-10" />

            {/* Mobile Centered Title */}
            <span className="lg:hidden absolute inset-0 flex items-center justify-center text-white font-semibold text-sm md:text-base whitespace-nowrap pointer-events-none">
              Share Taxi Sri Lanka
            </span>

            {/* Desktop Logo and Brand Name */}
            <div className="hidden lg:flex items-center gap-2 md:gap-3">
              <img src="/images/logo.png" alt="Share Taxi Sri Lanka" className="h-8 md:h-10" />
              <span className="text-white font-semibold text-sm md:text-base whitespace-nowrap">
                Share Taxi Sri Lanka
              </span>
            </div>

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#hero-section" className="text-yellow-400 font-medium hover:text-yellow-300 transition-colors">
                {tNav('home')}
              </a>
              <a href="#booking-section" className="text-white font-medium hover:text-yellow-400 transition-colors">
                {tNav('bookTaxi')}
              </a>
              <a href="#shared-rides-section" className="text-white font-medium hover:text-yellow-400 transition-colors">
                {tNav('sharedRides')}
              </a>
              <a href="#vehicle-options-section" className="text-white font-medium hover:text-yellow-400 transition-colors">
                {tNav('carOption')}
              </a>
            </nav>

            {/* Desktop - Admin, Language Selector and Profile */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Admin Button */}
              <Button
                onClick={onAdminLoginClick}
                variant="ghost"
                className="text-white hover:text-yellow-400 hover:bg-transparent px-3"
              >
                Admin
              </Button>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-yellow-400 hover:bg-transparent p-0">
                    <span className="font-medium capitalize">{currentLocale}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setLocale('en')}
                  >
                    {t('english')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocale('si')}
                  >
                    {t('sinhala')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocale('ta')}
                  >
                    {t('tamil')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-30 lg:hidden overflow-y-5">
          <div className="p-6">
            {/* Close button */}
            <div className="flex justify-end mb-8">
              <Button
                variant="ghost"
                className="text-white hover:text-yellow-400 hover:bg-transparent p-8"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-8 w-8" />
              </Button>
            </div>

            {/* Menu items as tiles */}
            <div className="space-y-2">
              {/* Admin tile at top */}
              <button
                onClick={() => {
                  onAdminLoginClick?.()
                  setIsMobileMenuOpen(false)
                }}
                className="block bg-gray-900 hover:bg-gray-700 rounded-3xl p-4 transition-colors"
              >
                <h3 className="text-yellow-400 font-semibold text-xl">Admin</h3>
              </button>

              {/* Navigation tiles */}
              <a
                href="#hero-section"
                className="block bg-gray-900 hover:bg-gray-700 rounded-3xl p-4 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-yellow-400 font-semibold text-xl">{tNav('home')}</h3>
              </a>

              <a
                href="#booking-section"
                className="block bg-gray-900 hover:bg-gray-700 rounded-3xl p-4 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-white font-semibold text-xl">{tNav('bookTaxi')}</h3>
              </a>

              <a
                href="#shared-rides-section"
                className="block bg-gray-900 hover:bg-gray-700 rounded-3xl p-4 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-white font-semibold text-xl">{tNav('sharedRides')}</h3>
              </a>

              <a
                href="#vehicle-options-section"
                className="block bg-gray-900 hover:bg-gray-700 rounded-3xl p-4 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <h3 className="text-white font-semibold text-xl">{tNav('carOption')}</h3>
              </a>

              {/* Language selector tile */}
              <div>
                <button
                  onClick={() => setIsMobileLanguageOpen(!isMobileLanguageOpen)}
                  className="w-full bg-gray-900 hover:bg-gray-700 rounded-3xl p-4 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-xl">{t('')}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium capitalize">{currentLocale}</span>
                      <ChevronDown className={`h-5 w-5 text-white transition-transform ${isMobileLanguageOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {isMobileLanguageOpen && (
                  <div className="ml-6 mt-2 space-y-2">
                    <button
                      onClick={() => {
                        setLocale('en')
                        setIsMobileLanguageOpen(false)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-gray-700"
                    >
                      {t('english')}
                    </button>
                    <button
                      onClick={() => {
                        setLocale('si')
                        setIsMobileLanguageOpen(false)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-gray-700"
                    >
                      {t('sinhala')}
                    </button>
                    <button
                      onClick={() => {
                        setLocale('ta')
                        setIsMobileLanguageOpen(false)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700"
                    >
                      {t('tamil')}
                    </button>
                  </div>
                )}
              </div>

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
                className="bg-yellow-400 hover:bg-yellow-500 rounded-lg p-2 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <User className="h-5 w-5 text-yellow-400" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
