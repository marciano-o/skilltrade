"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "./api-client"

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  name: string
  avatarUrl?: string
  bio?: string
  location?: string
  occupation?: string
  timeCredits: number
  profileCompletion: number
  isActive: boolean
  createdAt: string
  lastActive: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isLoading: boolean // Add this for consistency with login component
  login: (email: string, password: string) => Promise<boolean> // Change return type to boolean
  register: (userData: RegisterData) => Promise<boolean> // Change return type to boolean
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false) // Add separate loading state for operations

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("skilltrade_token")
      if (!token) {
        setLoading(false)
        return
      }

      apiClient.setToken(token)
      const response = await apiClient.getMe()

      if (response.success) {
        setUser(response.user)
      } else {
        localStorage.removeItem("skilltrade_token")
        apiClient.clearToken()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("skilltrade_token")
      apiClient.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(email, password)

      if (response.success) {
        setUser(response.user)
        localStorage.setItem("skilltrade_token", response.token)
        apiClient.setToken(response.token)
        return true // Return true on success
      } else {
        throw new Error(response.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      return false // Return false on error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await apiClient.register(userData)

      if (response.success) {
        setUser(response.user)
        localStorage.setItem("skilltrade_token", response.token)
        apiClient.setToken(response.token)
        return true // Return true on success
      } else {
        console.error("Registration error:", response.error || "Registration failed")
        return false // Return false if response indicates failure
      }
    } catch (error) {
      console.error("Registration error:", error)
      return false // Return false on error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("skilltrade_token")
    apiClient.clearToken()
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getMe()
      if (response.success) {
        setUser(response.user)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const value = {
    user,
    loading,
    isLoading, // Include isLoading in the context value
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}