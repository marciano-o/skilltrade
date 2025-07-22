"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  name: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  timeCredits?: number
  location?: string
  occupation?: string
  website?: string
  skills?: {
    offering: string[]
    seeking: string[]
  }
  preferences?: {
    notifications: boolean
    publicProfile: boolean
    emailUpdates: boolean
  }
  joinDate?: string
  lastActive?: string
  profileCompletion?: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  calculateProfileCompletion: () => number
  isLoading: boolean
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default user template for new registrations
const createDefaultUser = (registerData: RegisterData): User => {
  const now = new Date().toISOString()
  return {
    id: Date.now(), // In real app, this would come from backend
    name: `${registerData.firstName} ${registerData.lastName}`,
    firstName: registerData.firstName,
    lastName: registerData.lastName,
    email: registerData.email,
    avatar: "/placeholder.svg?height=200&width=200",
    bio: `Hello! I'm ${registerData.firstName}, excited to start trading skills on SkillTrade.`,
    timeCredits: 5, // Starting credits for new users
    location: "",
    occupation: "",
    website: "",
    skills: {
      offering: [],
      seeking: [],
    },
    preferences: {
      notifications: true,
      publicProfile: true,
      emailUpdates: true,
    },
    joinDate: now,
    lastActive: now,
    profileCompletion: 0,
  }
}

// Calculate profile completion percentage
const calculateCompletion = (user: User): number => {
  const fields = [
    user.firstName,
    user.lastName,
    user.email,
    user.bio && user.bio.length > 20,
    user.location,
    user.occupation,
    user.skills?.offering && user.skills.offering.length > 0,
    user.skills?.seeking && user.skills.seeking.length > 0,
    user.avatar && user.avatar !== "/placeholder.svg?height=200&width=200",
  ]

  const completedFields = fields.filter(Boolean).length
  return Math.round((completedFields / fields.length) * 100)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user data from localStorage
  useEffect(() => {
    const initializeUser = () => {
      try {
        const savedUser = localStorage.getItem("skilltrade_user")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          // Update profile completion on load
          parsedUser.profileCompletion = calculateCompletion(parsedUser)
          parsedUser.lastActive = new Date().toISOString()

          setUser(parsedUser)
          // Save updated data back to localStorage
          localStorage.setItem("skilltrade_user", JSON.stringify(parsedUser))
        }
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("skilltrade_user")
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [])

  // Auto-save user data whenever it changes
  useEffect(() => {
    if (user && !isLoading) {
      const userWithCompletion = {
        ...user,
        profileCompletion: calculateCompletion(user),
        lastActive: new Date().toISOString(),
      }

      localStorage.setItem("skilltrade_user", JSON.stringify(userWithCompletion))

      // Update state if completion changed
      if (userWithCompletion.profileCompletion !== user.profileCompletion) {
        setUser(userWithCompletion)
      }
    }
  }, [user, isLoading])

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...userData,
        lastActive: new Date().toISOString(),
      }

      // Calculate new completion percentage
      updatedUser.profileCompletion = calculateCompletion(updatedUser)

      setUser(updatedUser)
    }
  }

  const calculateProfileCompletion = (): number => {
    return user ? calculateCompletion(user) : 0
  }

  const register = async (registerData: RegisterData): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validate passwords match
      if (registerData.password !== registerData.confirmPassword) {
        setIsLoading(false)
        return false
      }

      // Create new user with default data
      const newUser = createDefaultUser(registerData)
      newUser.profileCompletion = calculateCompletion(newUser)

      setUser(newUser)
      localStorage.setItem("skilltrade_user", JSON.stringify(newUser))

      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (email && password) {
        // Check if user already exists in localStorage (for demo purposes)
        const existingUser = localStorage.getItem("skilltrade_user")

        if (existingUser) {
          const parsedUser = JSON.parse(existingUser)
          if (parsedUser.email === email) {
            // Update last active and profile completion
            parsedUser.lastActive = new Date().toISOString()
            parsedUser.profileCompletion = calculateCompletion(parsedUser)

            setUser(parsedUser)
            localStorage.setItem("skilltrade_user", JSON.stringify(parsedUser))
            setIsLoading(false)
            return true
          }
        }

        // Create demo user if no existing user found
        const mockUser: User = {
          id: 1,
          name: "Alex Johnson",
          firstName: "Alex",
          lastName: "Johnson",
          email: email,
          avatar: "/placeholder.svg?height=200&width=200",
          bio: "Full-stack developer with 5 years of experience. Looking to improve my design skills.",
          timeCredits: 12,
          location: "San Francisco, CA",
          occupation: "Software Engineer",
          website: "https://alexjohnson.dev",
          skills: {
            offering: ["Web Development", "JavaScript", "React", "Node.js"],
            seeking: ["Graphic Design", "UI/UX", "Adobe Illustrator"],
          },
          preferences: {
            notifications: true,
            publicProfile: true,
            emailUpdates: true,
          },
          joinDate: "2023-01-15T00:00:00.000Z",
          lastActive: new Date().toISOString(),
          profileCompletion: 0,
        }

        mockUser.profileCompletion = calculateCompletion(mockUser)
        setUser(mockUser)
        localStorage.setItem("skilltrade_user", JSON.stringify(mockUser))
        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("skilltrade_user")
    // Clear any other user-related data
    localStorage.removeItem("skilltrade_preferences")
    localStorage.removeItem("skilltrade_cache")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        calculateProfileCompletion,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
