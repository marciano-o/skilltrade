"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Users, Search, MessageCircle, User, Sparkles } from "lucide-react"

interface FeatureLockedProps {
  feature: "discover" | "matchmaking" | "chat" | "profile"
}

const featureConfig = {
  discover: {
    icon: Search,
    title: "Skill Discovery",
    description: "Browse and search through hundreds of skills offered by our community members.",
    benefits: [
      "Search skills by category and expertise level",
      "View detailed skill profiles and user ratings",
      "Filter by location and availability",
      "Request skill exchanges directly",
    ],
  },
  matchmaking: {
    icon: Users,
    title: "Smart Matchmaking",
    description: "Our AI-powered matching system finds the perfect skill exchange partners for you.",
    benefits: [
      "Swipe through personalized skill matches",
      "Get matched with compatible learning partners",
      "See mutual skill interests instantly",
      "Connect with people in your area",
    ],
  },
  chat: {
    icon: MessageCircle,
    title: "Secure Messaging",
    description: "Communicate safely with your skill exchange partners through our built-in chat system.",
    benefits: [
      "Real-time messaging with matched users",
      "Share files and schedule sessions",
      "Track conversation history",
      "Built-in safety and reporting features",
    ],
  },
  profile: {
    icon: User,
    title: "Personal Profile",
    description: "Create your skill profile and manage your learning journey.",
    benefits: [
      "Showcase your skills and expertise",
      "Track your learning progress",
      "Manage time credits and exchanges",
      "Upload certifications and achievements",
    ],
  },
}

export function FeatureLocked({ feature }: FeatureLockedProps) {
  const router = useRouter()
  const config = featureConfig[feature]
  const Icon = config.icon

  return (
    <div className="container py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Lock Icon with Feature Icon */}
          <div className="relative mb-6">
            <div className="rounded-full bg-muted p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2 border-4 border-background">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>

          {/* Title and Description */}
          <h2 className="text-3xl font-bold mb-3">{config.title}</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-lg mx-auto">{config.description}</p>

          {/* Feature Benefits */}
          <div className="bg-muted/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What you'll get access to:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Call to Action */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Join thousands of learners already trading skills on SkillTrade
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push("/auth/register")} className="flex-1 sm:flex-none" size="lg">
                <User className="h-4 w-4 mr-2" />
                Create Free Account
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="flex-1 sm:flex-none bg-transparent"
                size="lg"
              >
                Already have an account? Log In
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>100% Free to Join</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
