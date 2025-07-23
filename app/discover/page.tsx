"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Clock, Zap } from "lucide-react"
import { useOptimizedSearch } from "@/hooks/use-optimized-search"

// Mock data for skills
const allSkills = [
  {
    id: 1,
    title: "Web Development",
    description: "Learn HTML, CSS, JavaScript and React",
    image: "/placeholder.svg?height=200&width=300",
    category: "Technology",
    tags: ["Programming", "Frontend", "Web"],
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 2,
    title: "Graphic Design",
    description: "Master Adobe Photoshop and Illustrator",
    image: "/placeholder.svg?height=200&width=300",
    category: "Design",
    tags: ["Creative", "Visual", "Adobe"],
    user: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 3,
    title: "Digital Marketing",
    description: "SEO, content marketing, and social media",
    image: "/placeholder.svg?height=200&width=300",
    category: "Marketing",
    tags: ["SEO", "Social Media", "Content"],
    user: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 4,
    title: "Photography",
    description: "Composition, lighting, and editing",
    image: "/placeholder.svg?height=200&width=300",
    category: "Arts",
    tags: ["Creative", "Visual", "Editing"],
    user: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 5,
    title: "Language Learning",
    description: "Spanish conversation practice",
    image: "/placeholder.svg?height=200&width=300",
    category: "Education",
    tags: ["Languages", "Spanish", "Communication"],
    user: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 6,
    title: "Music Production",
    description: "Beat making and audio engineering",
    image: "/placeholder.svg?height=200&width=300",
    category: "Arts",
    tags: ["Audio", "Creative", "Production"],
    user: {
      name: "Jessica Taylor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 7,
    title: "Data Science",
    description: "Python, statistics, and machine learning",
    image: "/placeholder.svg?height=200&width=300",
    category: "Technology",
    tags: ["Programming", "Analytics", "AI"],
    user: {
      name: "Robert Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 8,
    title: "Cooking",
    description: "Learn to cook Italian cuisine",
    image: "/placeholder.svg?height=200&width=300",
    category: "Culinary",
    tags: ["Food", "Italian", "Recipes"],
    user: {
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 9,
    title: "Fitness Training",
    description: "Personal training and workout routines",
    image: "/placeholder.svg?height=200&width=300",
    category: "Health",
    tags: ["Exercise", "Wellness", "Training"],
    user: {
      name: "James Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
]

// Extract unique categories and tags for filters
const categories = Array.from(new Set(allSkills.map((skill) => skill.category)))
const allTags = Array.from(new Set(allSkills.flatMap((skill) => skill.tags)))

// Optimized search function
const searchSkills = async (query: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 800 + 100))

  const filtered = allSkills.filter((skill) => {
    const searchLower = query.toLowerCase()
    return (
      skill.title.toLowerCase().includes(searchLower) ||
      skill.description.toLowerCase().includes(searchLower) ||
      skill.category.toLowerCase().includes(searchLower) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      skill.user.name.toLowerCase().includes(searchLower)
    )
  })

  return filtered
}

function DiscoverPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Use optimized search hook
  const { query, setQuery, results, isLoading, error, searchTime, fromCache, clearCache } = useOptimizedSearch(
    searchSkills,
    {
      debounceMs: 300,
      cacheEnabled: true,
      cacheTtlMs: 300000, // 5 minutes
      timeoutMs: 2500,
      minQueryLength: 2,
    },
  )

  // Apply additional filters to search results
  const filteredSkills = useMemo(() => {
    if (query.length < 2) return allSkills

    return results.filter((skill) => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(skill.category)
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => skill.tags.includes(tag))
      return matchesCategory && matchesTags
    })
  }, [results, selectedCategories, selectedTags, query])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setQuery("")
    setSelectedCategories([])
    setSelectedTags([])
    clearCache()
  }

  return (
    <div className="container py-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Skills</h1>
            <p className="text-muted-foreground">Browse skills offered by our community members</p>
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <div className="relative flex-1 md:w-[300px]">
              <Input
                type="text"
                placeholder="Search skills..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-muted" : ""}
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Toggle filters</span>
            </Button>
          </div>
        </div>

        {/* Performance indicators */}
        {(searchTime > 0 || fromCache) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {searchTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Search: {searchTime.toFixed(0)}ms</span>
                {searchTime > 2000 && <span className="text-orange-500">⚠️</span>}
              </div>
            )}
            {fromCache && (
              <div className="flex items-center gap-1 text-green-600">
                <Zap className="h-3 w-3" />
                <span>Cached result</span>
              </div>
            )}
          </div>
        )}

        {showFilters && (
          <div className="bg-muted/30 rounded-lg p-4 border animate-slide-down">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Filters</h2>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm h-8">
                Clear all
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategories.includes(category)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-primary/80 text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((placeholder) => (
              <Card key={placeholder} className="overflow-hidden animate-pulse-subtle">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-4"></div>
                  <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-6 pt-4">
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="overflow-hidden hover-lift transition-all duration-300">
                <div className="relative h-48">
                  <Image src={skill.image || "/placeholder.svg"} alt={skill.title} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-muted/50 text-xs">
                      {skill.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
                  <p className="text-muted-foreground mb-4">{skill.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {skill.tags.map((tag, i) => (
                      <span key={i} className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={skill.user.avatar || "/placeholder.svg"}
                        alt={skill.user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm">{skill.user.name}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-6 pt-4">
                  <Button className="w-full transition-all duration-300 hover:bg-primary/90">
                    Request Skill Exchange
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No skills found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find any skills matching your search criteria.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}

