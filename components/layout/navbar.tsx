"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, MessageSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"
import Image from "next/image"

export function Navbar() {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const router = useRouter()

  const isAuthenticated = !!user

  // Reset activeSection when navigating to a different page
  useEffect(() => {
    setActiveSection(null)
  }, [pathname])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    // Redirect to home page after logout
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"></div>
              <div className="absolute inset-[2px] flex items-center justify-center rounded-full bg-white dark:bg-gray-950">
                <span className="text-sm font-bold text-teal-500">ST</span>
              </div>
            </div>
            <span className="text-xl font-bold">SkillTrade</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          

          {isAuthenticated ? (
            <>
              <Link
                href="/discover"
                className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
                  isActive("/discover") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Discover
              </Link>
              <Link
                href="/matchmaking"
                className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
                  isActive("/matchmaking") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Matchmaking
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
                  isActive("/profile") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                title="Login required"
              >
                Discover
              </button>
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                title="Login required"
              >
                Matchmaking
              </button>
              <button
                onClick={() => router.push("/auth/login")}
                className="text-sm font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                title="Login required"
              >
                Profile
              </button>
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-primary/20">
                  <Image
                    src={user?.avatarUrl || "/placeholder.svg?height=32&width=32"}
                    alt={user?.name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm text-muted-foreground">Welcome, {user?.firstName || user?.name}</span>
              </div>

              {/* Chat Button */}
              <Link
                href="/chat"
                className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
                  isActive("/chat") ? "text-primary" : "text-muted-foreground"
                }`}
                title="Messages"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
                className="transition-all duration-200 hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="transition-all duration-200 hover:bg-muted">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="transition-all duration-200 hover:bg-primary/90">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {pathname === "/" ? (
                <>
                  <button
                    onClick={() => scrollToSection("home")}
                    className="text-base font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-base font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-base font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                  >
                    About
                  </button>
                </>
              ) : null}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/discover"
                    className={`text-base font-medium transition-all duration-200 hover:text-primary ${
                      isActive("/discover") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Discover
                  </Link>
                  <Link
                    href="/matchmaking"
                    className={`text-base font-medium transition-all duration-200 hover:text-primary ${
                      isActive("/matchmaking") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Matchmaking
                  </Link>
                  <Link
                    href="/profile"
                    className={`text-base font-medium transition-all duration-200 hover:text-primary ${
                      isActive("/profile") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="text-base font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                  >
                    Discover (Login Required)
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="text-base font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                  >
                    Matchmaking (Login Required)
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="text-base font-medium transition-all duration-200 hover:text-primary text-muted-foreground"
                  >
                    Profile (Login Required)
                  </button>
                </>
              )}

              <div className="flex flex-col gap-2 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 mb-2 p-2 rounded-md bg-muted/30">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-primary/20">
                        <Image
                          src={user?.avatarUrl || "/placeholder.svg?height=32&width=32"}
                          alt={user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{user?.firstName || user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                      <Link
                        href="/chat"
                        className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
                          isActive("/chat") ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-200 hover:bg-muted bg-transparent"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button
                        variant="outline"
                        className="w-full transition-all duration-200 hover:bg-muted bg-transparent"
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full transition-all duration-200 hover:bg-primary/90">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
