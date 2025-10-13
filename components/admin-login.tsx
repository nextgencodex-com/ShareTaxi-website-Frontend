"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (username === "admin" && password === "admin") {
      onLogin()
      setError("")
      setUsername("")
      setPassword("")
    } else {
      setError("Invalid username or password")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>

        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full border-2 border-gray-400 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border-2 border-gray-400 focus:border-blue-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
