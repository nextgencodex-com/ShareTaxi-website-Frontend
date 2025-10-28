"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Shield, User, Lock, AlertCircle, CheckCircle2 } from "lucide-react"

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimated(true), 100)
    } else {
      setIsAnimated(false)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError("")

    // Simulate API call delay
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        onLogin()
        setError("")
        setUsername("")
        setPassword("")
        setAttempts(0)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 3) {
          setError("Too many failed attempts. Please try again later.")
        } else {
          setError(`Invalid credentials. ${3 - newAttempts} attempts remaining.`)
        }
      }
      setIsLoading(false)
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-teal-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className={`w-full max-w-md relative z-10 transform transition-all duration-500 ${isAnimated ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} glassmorphism-card`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/20 transition-colors group z-20"
        >
          <X className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
        </button>

        {/* Header */}
        <CardHeader className="text-center relative pb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-t-lg"></div>
          <div className="relative z-10 flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent">
            Admin Access Portal
          </CardTitle>
          <p className="text-white/70 text-sm mt-1">Secure login to Admin Dashboard</p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-black">
                <User className="h-4 w-4" />
                Username
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full bg-white border-gray-300 text-black placeholder:text-black focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 rounded-lg py-3 px-4"
                  disabled={isLoading}
                />
                {username && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-400" />}
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-black">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-white border-gray-300 text-black placeholder:text-black focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 rounded-lg py-3 px-4"
                  disabled={isLoading}
                />
                {password && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-400" />}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-300 ${
                error.includes("Too many") ? "bg-red-500/20 border border-red-500/50" : "bg-yellow-500/20 border border-yellow-500/50"
              }`}>
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-200 text-sm">{error}</p>
              </div>
            )}

            {/* Login button */}
            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                isLoading
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              } text-gray-900`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </div>
              ) : (
                "Access Admin Panel"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              Protected area • Use admin credentials only
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .glassmorphism-card {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
      `}</style>
    </div>
  )
}
