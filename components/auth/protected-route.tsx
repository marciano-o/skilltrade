"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, User } from "lucide-react"
import { FeatureLocked } from "./feature-locked"

// Update the ProtectedRoute component:
interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  feature?: "discover" | "matchmaking" | "chat" | "profile"
}

export function ProtectedRoute({ children, fallback, feature }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Use custom feature-specific fallback if provided
    if (feature) {
      return <FeatureLocked feature={feature} />
    }

    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>
    }

    // Default fallback
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-muted p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to access this feature.</p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/auth/login")} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Log In
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/register")} className="w-full bg-transparent">
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
