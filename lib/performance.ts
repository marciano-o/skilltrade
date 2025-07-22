"use client"

import { useState } from "react"

// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(operation: string): string {
    const id = `${operation}-${Date.now()}-${Math.random()}`
    performance.mark(`${id}-start`)
    return id
  }

  endTimer(id: string): number {
    performance.mark(`${id}-end`)
    performance.measure(id, `${id}-start`, `${id}-end`)

    const measure = performance.getEntriesByName(id)[0]
    const duration = measure.duration

    // Store metrics
    const operation = id.split("-")[0]
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }
    this.metrics.get(operation)!.push(duration)

    // Log if over 3 seconds
    if (duration > 3000) {
      console.warn(`⚠️ Performance Warning: ${operation} took ${duration.toFixed(2)}ms (over 3s limit)`)
    }

    return duration
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  getMetrics(): Record<string, { average: number; count: number; max: number }> {
    const result: Record<string, { average: number; count: number; max: number }> = {}

    this.metrics.forEach((times, operation) => {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length,
        max: Math.max(...times),
      }
    })

    return result
  }
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Cache utility for API responses
export class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlMs = 300000): void {
    // 5 min default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Timeout wrapper for promises
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ])
}

// Virtual scrolling for large lists
export function useVirtualScrolling(items: any[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length)

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    setScrollTop,
  }
}
