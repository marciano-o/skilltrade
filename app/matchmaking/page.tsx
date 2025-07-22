"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, type PanInfo, useAnimation, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Heart, MessageCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

// Mock data for potential matches
const initialMatches = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=300&width=300",
    offering: "Web Development",
    seeking: "Graphic Design",
    bio: "Full-stack developer with 5 years of experience. Looking to improve my design skills.",
    tags: ["JavaScript", "React", "Node.js"],
  },
  {
    id: 2,
    name: "Sarah Williams",
    avatar: "/placeholder.svg?height=300&width=300",
    offering: "Graphic Design",
    seeking: "Digital Marketing",
    bio: "Creative designer specializing in branding and UI/UX. Want to learn more about marketing my work.",
    tags: ["Adobe", "UI/UX", "Branding"],
  },
  {
    id: 3,
    name: "Michael Brown",
    avatar: "/placeholder.svg?height=300&width=300",
    offering: "Digital Marketing",
    seeking: "Photography",
    bio: "Marketing specialist with expertise in SEO and content strategy. Interested in improving my visual content.",
    tags: ["SEO", "Content", "Social Media"],
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "/placeholder.svg?height=300&width=300",
    offering: "Photography",
    seeking: "Web Development",
    bio: "Professional photographer looking to build my own portfolio website and expand my online presence.",
    tags: ["Portrait", "Editing", "Composition"],
  },
  {
    id: 5,
    name: "David Wilson",
    avatar: "/placeholder.svg?height=300&width=300",
    offering: "Spanish Language",
    seeking: "Music Production",
    bio: "Native Spanish speaker with teaching experience. Interested in learning how to produce my own music.",
    tags: ["Spanish", "Teaching", "Conversation"],
  },
]

function MatchmakingPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<number[]>([])
  const [rejected, setRejected] = useState<number[]>([])
  const [matches, setMatches] = useState<number[]>([])
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const [matchedPerson, setMatchedPerson] = useState<any>(null)
  const [availableMatches, setAvailableMatches] = useState([...initialMatches])

  // For card swiping with framer-motion
  const cardControls = useAnimation()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0])

  // Background color based on swipe direction
  const bgColor = useTransform(
    x,
    [-200, 0, 200],
    ["rgba(239, 68, 68, 0.1)", "rgba(0, 0, 0, 0)", "rgba(34, 197, 94, 0.1)"],
  )

  // Icons opacity based on swipe direction
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0])

  // Reset x position when currentIndex changes
  useEffect(() => {
    x.set(0)
    cardControls.set({ x: 0, opacity: 1 })
  }, [currentIndex, cardControls, x])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100

    if (info.offset.x > threshold) {
      // Swiped right (like)
      cardControls
        .start({
          x: 500,
          opacity: 0,
          transition: { duration: 0.3 },
        })
        .then(() => {
          handleSwipe("right")
        })
    } else if (info.offset.x < -threshold) {
      // Swiped left (dislike)
      cardControls
        .start({
          x: -500,
          opacity: 0,
          transition: { duration: 0.3 },
        })
        .then(() => {
          handleSwipe("left")
        })
    } else {
      // Return to center if not swiped far enough
      cardControls.start({
        x: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      })
    }
  }

  const handleSwipe = (direction: string) => {
    const currentMatch = availableMatches[currentIndex]

    if (direction === "right") {
      // Check if this creates a match (for demo purposes, let's say 50% chance)
      const isMatch = Math.random() > 0.5

      if (isMatch && !matches.includes(currentMatch.id)) {
        setMatches((prev) => [...prev, currentMatch.id])
        setMatchedPerson(currentMatch)
        setShowMatchAnimation(true)

        // Hide match animation after 3 seconds
        setTimeout(() => {
          setShowMatchAnimation(false)
        }, 3000)
      }

      setLiked((prev) => [...prev, currentMatch.id])
    } else {
      setRejected((prev) => [...prev, currentMatch.id])
    }

    // Move to next card if available
    if (currentIndex < availableMatches.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const resetCards = () => {
    setCurrentIndex(0)
    setLiked([])
    setRejected([])
    setAvailableMatches([...initialMatches])
    x.set(0)
  }

  const navigateToChat = (userId: number) => {
    router.push(`/chat/${userId}`)
  }

  return (
    <div className="container py-12 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Skill Match</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Swipe right on skills you're interested in, left on those you're not
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-md h-[650px]">
          {currentIndex < availableMatches.length ? (
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              animate={cardControls}
              style={{
                x,
                rotate,
                backgroundColor: bgColor,
              }}
              className="absolute w-full h-full rounded-lg overflow-hidden touch-none"
            >
              <Card className="w-full h-full overflow-hidden border-0 shadow-lg">
                <div className="relative h-2/3">
                  <Image
                    src={availableMatches[currentIndex].avatar || "/placeholder.svg"}
                    alt={availableMatches[currentIndex].name}
                    fill
                    className="object-cover"
                  />

                  {/* Like/Dislike Indicators */}
                  <motion.div
                    className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl transform rotate-12"
                    style={{ opacity: likeOpacity }}
                  >
                    LIKE
                  </motion.div>

                  <motion.div
                    className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl transform -rotate-12"
                    style={{ opacity: dislikeOpacity }}
                  >
                    PASS
                  </motion.div>
                </div>

                <CardContent className="p-6 h-1/3 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{availableMatches[currentIndex].name}</h2>
                    <div className="flex gap-2 mb-3">
                      <Badge className="bg-primary/10 text-primary text-sm">
                        Offering: {availableMatches[currentIndex].offering}
                      </Badge>
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground text-sm">
                        Seeking: {availableMatches[currentIndex].seeking}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                      {availableMatches[currentIndex].bio}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {availableMatches[currentIndex].tags.map((tag, i) => (
                      <span key={i} className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="w-full h-full flex items-center justify-center">
              <CardContent className="text-center p-6">
                <h3 className="text-2xl font-bold mb-4">No More Matches</h3>
                <p className="text-muted-foreground mb-6">
                  You've gone through all potential matches. Check back later for more!
                </p>
                <Button onClick={resetCards} className="transition-all duration-300 hover:bg-primary/90">
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action buttons positioned below the card */}
          {currentIndex < availableMatches.length && (
            <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-8 z-10">
              <Button
                size="icon"
                variant="outline"
                className="h-16 w-16 rounded-full bg-white shadow-lg border-2 border-red-500 hover:bg-red-50 transition-all duration-300"
                onClick={() => handleSwipe("left")}
              >
                <X className="h-8 w-8 text-red-500" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-16 w-16 rounded-full bg-white shadow-lg border-2 border-green-500 hover:bg-green-50 transition-all duration-300"
                onClick={() => handleSwipe("right")}
              >
                <Check className="h-8 w-8 text-green-500" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Match Animation */}
      {showMatchAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-background rounded-lg p-8 max-w-md w-full text-center animate-slide-up">
            <div className="text-4xl font-bold text-primary mb-4">It's a Match!</div>
            <p className="text-lg mb-6">You and {matchedPerson.name} want to exchange skills!</p>

            <div className="flex justify-center gap-6 mb-8">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary">
                  <Image src="/placeholder.svg?height=100&width=100" alt="Your profile" fill className="object-cover" />
                </div>
              </div>
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary">
                  <Image
                    src={matchedPerson.avatar || "/placeholder.svg"}
                    alt={matchedPerson.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  setShowMatchAnimation(false)
                  navigateToChat(matchedPerson.id)
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Send Message
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 bg-transparent"
                onClick={() => setShowMatchAnimation(false)}
              >
                <Heart className="h-4 w-4" />
                Keep Swiping
              </Button>
            </div>
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-20 animate-slide-up">
          <h3 className="text-xl font-bold mb-4">Your Matches ({matches.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {matches.map((id) => {
              const match = initialMatches.find((m) => m.id === id)
              if (!match) return null

              return (
                <div key={id} className="text-center hover-lift">
                  <div
                    className="relative h-24 w-24 mx-auto rounded-full overflow-hidden mb-2 border-2 border-primary cursor-pointer"
                    onClick={() => navigateToChat(match.id)}
                  >
                    <Image src={match.avatar || "/placeholder.svg"} alt={match.name} fill className="object-cover" />
                  </div>
                  <p className="font-medium text-sm">{match.name}</p>
                  <p className="text-xs text-muted-foreground">{match.offering}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs h-8 w-full bg-transparent"
                    onClick={() => navigateToChat(match.id)}
                  >
                    Message
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MatchmakingPageWrapper() {
  return (
    <ProtectedRoute feature="matchmaking">
      <MatchmakingPage />
    </ProtectedRoute>
  )
}
