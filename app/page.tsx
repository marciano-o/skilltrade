"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"

// Make the component a client component


export default function HomePage() {
  const { isAuthenticated } = useAuth()
  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 pointer-events-none" />
        <div className="container py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Trade Skills, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                  Grow Together
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Exchange your expertise with others. Learn new skills while sharing what you know.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link href="/profile">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                )}
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="People sharing skills"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/50 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SkillTrade makes it easy to connect with others and exchange valuable skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Sign up and list the skills you can teach and the ones you want to learn.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Match with Others</h3>
                <p className="text-muted-foreground">
                  Our algorithm finds people who want to learn what you teach and teach what you want to learn.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Exchange Skills</h3>
                <p className="text-muted-foreground">
                  Connect and schedule sessions to share knowledge using our time credit system.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            {isAuthenticated ? (
              <Link href="/discover">
                <Button size="lg">Explore Available Skills</Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button size="lg">Login to Explore Skills</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?height=400&width=600" alt="About SkillTrade" fill className="object-cover" />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">About SkillTrade</h2>
              <p className="text-lg text-muted-foreground">
                SkillTrade was founded on a simple idea: everyone has something valuable to teach and something new to
                learn.
              </p>
              <p className="text-lg text-muted-foreground">
                Our platform uses a unique blockchain-like ledger system to track time credits, ensuring fair exchanges
                between users and preventing fraud.
              </p>
              <p className="text-lg text-muted-foreground">
                We believe in the power of peer-to-peer learning and the incredible potential that exists when people
                share their knowledge directly with each other.
              </p>
              <div className="pt-4">
                {isAuthenticated ? (
                  <Link href="/profile">
                    <Button size="lg">View Your Profile</Button>
                  </Link>
                ) : (
                  <Link href="/auth/register">
                    <Button size="lg">Join Our Community</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
