"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import ProtectedRoute from "@/components/auth/protected-route"

interface Skill {
  id: number
  title: string
  description: string
  category: string
  proficiencyLevel: number
  user: {
    id: number
    name: string
    avatar: string
    location?: string
    occupation?: string
  }
  image: string
  tags: string[]
}

export default function DiscoverPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const categories = [
    "Programming",
    "Design",
    "Marketing",
    "Photography",
    "Writing",
    "Music",
    "Languages",
    "Cooking",
    "Fitness",
    "Business",
    "Art",
    "Technology",
  ]

  useEffect(() => {
    fetchSkills()
  }, [searchQuery, selectedCategory])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const response = await apiClient.discoverSkills({
        q: searchQuery,
        category: selectedCategory,
        limit: 20,
        offset: 0,
      })

      if (response.success) {
        setSkills(response.skills)
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSkills()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Skills</h1>
            <p className="text-gray-600">Find amazing skills to learn from our community</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("")}
                className={selectedCategory === "" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          {skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <Card
                  key={skill.id}
                  className="hover:shadow-lg transition-shadow border-2 border-gray-100 hover:border-blue-200"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900 mb-1">{skill.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">{skill.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {skill.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* User Info */}
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">{skill.user.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{skill.user.name}</p>
                        {skill.user.location && (
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {skill.user.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {skill.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Connect & Learn</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
