"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { debounce, PerformanceMonitor, ResponseCache, withTimeout } from "@/lib/performance"

interface SearchOptions {
  debounceMs?: number
  cacheEnabled?: boolean
  cacheTtlMs?: number
  timeoutMs?: number
  minQueryLength?: number
}

interface SearchResult<T> {
  results: T[]
  isLoading: boolean
  error: string | null
  searchTime: number
  fromCache: boolean
}

export function useOptimizedSearch<T>(searchFunction: (query: string) => Promise<T[]>, options: SearchOptions = {}) {
  const {
    debounceMs = 300,
    cacheEnabled = true,
    cacheTtlMs = 300000, // 5 minutes
    timeoutMs = 2500, // 2.5 seconds to leave buffer
    minQueryLength = 2,
  } = options

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState(0)
  const [fromCache, setFromCache] = useState(false)

  const cache = useMemo(() => new ResponseCache(), [])
  const monitor = useMemo(() => PerformanceMonitor.getInstance(), [])

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults([])
        setIsLoading(false)
        return
      }

      const timerId = monitor.startTimer("search")
      setIsLoading(true)
      setError(null)
      setFromCache(false)

      try {
        // Check cache first
        if (cacheEnabled) {
          const cacheKey = `search:${searchQuery.toLowerCase()}`
          const cachedResult = cache.get(cacheKey)

          if (cachedResult) {
            setResults(cachedResult)
            setFromCache(true)
            setIsLoading(false)
            const duration = monitor.endTimer(timerId)
            setSearchTime(duration)
            return
          }
        }

        // Perform search with timeout
        const searchPromise = searchFunction(searchQuery)
        const searchResults = await withTimeout(searchPromise, timeoutMs)

        // Cache results
        if (cacheEnabled) {
          const cacheKey = `search:${searchQuery.toLowerCase()}`
          cache.set(cacheKey, searchResults, cacheTtlMs)
        }

        setResults(searchResults)
        setIsLoading(false)

        const duration = monitor.endTimer(timerId)
        setSearchTime(duration)

        // Warn if search took too long
        if (duration > 3000) {
          console.warn(`Search took ${duration}ms - consider optimizing`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed")
        setResults([])
        setIsLoading(false)
        monitor.endTimer(timerId)
      }
    },
    [searchFunction, cache, monitor, cacheEnabled, cacheTtlMs, timeoutMs, minQueryLength],
  )

  // Debounced search function
  const debouncedSearch = useMemo(() => debounce(performSearch, debounceMs), [performSearch, debounceMs])

  // Effect to trigger search when query changes
  useEffect(() => {
    if (query.trim() === "") {
      setResults([])
      setIsLoading(false)
      return
    }

    debouncedSearch(query.trim())
  }, [query, debouncedSearch])

  const clearCache = useCallback(() => {
    cache.clear()
  }, [cache])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchTime,
    fromCache,
    clearCache,
  } as const
}
