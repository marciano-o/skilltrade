import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AuthProvider } from "@/lib/auth"
import { PerformanceMonitorComponent } from "@/components/performance-monitor"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkillTrade - Trade Skills, Grow Together",
  description: "A platform for trading skills with others",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PerformanceMonitorComponent />
        </AuthProvider>
      </body>
    </html>
  )
}
