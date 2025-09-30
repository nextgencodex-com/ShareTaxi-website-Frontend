"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface User {
  fullName: string
  email: string
  phone: string
}

interface LoginSignupPopupProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (userData: User) => void
}

export function LoginSignupPopup({ isOpen, onClose, onLogin }: LoginSignupPopupProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })

  if (!isOpen) return null

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check credentials
    if (loginData.email === "taxi@mail.com" && loginData.password === "taxi") {
      // Mock user data for successful login
      const userData: User = {
        fullName: "Taxi User",
        email: "taxi@mail.com",
        phone: "769278958"
      }
      onLogin(userData)
    } else {
      alert("Invalid credentials. Please use taxi@mail.com and password 'taxi'")
    }
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    // Create user from signup data
    const userData: User = {
      fullName: signupData.fullName,
      email: signupData.email,
      phone: signupData.phone
    }

    onLogin(userData)
  }

  const handleLoginChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignupChange = (field: string, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === "login" ? "Login" : "Sign Up"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                activeTab === "login"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                activeTab === "signup"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => handleLoginChange("email", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => handleLoginChange("password", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg"
              >
                Login
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={signupData.fullName}
                  onChange={(e) => handleSignupChange("fullName", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e) => handleSignupChange("email", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="bg-blue-50 rounded-lg px-3 py-3 text-gray-700 font-medium">+94</div>
                  <Input
                    type="tel"
                    placeholder="769278958"
                    value={signupData.phone}
                    onChange={(e) => handleSignupChange("phone", e.target.value)}
                    className="flex-1 p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) => handleSignupChange("password", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={signupData.confirmPassword}
                  onChange={(e) => handleSignupChange("confirmPassword", e.target.value)}
                  className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg"
              >
                Sign Up
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
