"use client"

import { useState, useEffect } from "react"
import { PerformanceMonitor } from "@/lib/performance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Clock, Zap, AlertTriangle } from "lucide-react"

export function PerformanceMonitorComponent() {
  const [metrics, setMetrics] = useState<Record<string, { average: number; count: number; max: number }>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance()

    const updateMetrics = () => {
      setMetrics(monitor.getMetrics())
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)
    updateMetrics() // Initial update

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 z-50">
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {Object.entries(metrics).map(([operation, data]) => (
            <div key={operation} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {data.max > 3000 ? (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                ) : data.average > 2000 ? (
                  <Clock className="h-3 w-3 text-yellow-500" />
                ) : (
                  <Zap className="h-3 w-3 text-green-500" />
                )}
                <span className="capitalize">{operation}</span>
              </div>
              <div className="text-right">
                <div
                  className={`font-mono ${data.average > 3000 ? "text-red-500" : data.average > 2000 ? "text-yellow-500" : "text-green-500"}`}
                >
                  {data.average.toFixed(0)}ms
                </div>
                <div className="text-xs text-muted-foreground">{data.count} calls</div>
              </div>
            </div>
          ))}

          {Object.keys(metrics).length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">No performance data yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
