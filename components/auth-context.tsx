"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  fullName: string
  email: string
  phone: string
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn')

    if (storedUser && storedIsLoggedIn === 'true') {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        // Clear corrupted data
        localStorage.removeItem('user')
        localStorage.removeItem('isLoggedIn')
      }
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
    // Persist to localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isLoggedIn', 'true')
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    // Clear from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
