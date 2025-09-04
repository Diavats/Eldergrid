"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle } from "lucide-react"

export default function AnomalyDetector() {
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      appliance: "Geyser",
      usage: 180,
      threshold: 120,
      severity: "high",
      timestamp: "2024-01-15 14:30"
    },
    {
      id: 2,
      appliance: "Heater",
      usage: 220,
      threshold: 180,
      severity: "medium",
      timestamp: "2024-01-15 12:15"
    }
  ])

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "medium": return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "low": return <CheckCircle className="h-4 w-4 text-blue-600" />
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow border">
        <CardHeader>
          <CardTitle>Anomaly Detector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow border">
      <CardHeader>
        <CardTitle>Anomaly Detector (Demo)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Detects unusual energy usage patterns compared to your custom thresholds and government baselines.
        </p>
        
        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No anomalies detected</p>
            <p className="text-xs text-gray-500 mt-1">All appliances are within normal usage patterns</p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(anomaly.severity)}
                    <span className="font-medium">{anomaly.appliance}</span>
                  </div>
                  <Badge className={getSeverityColor(anomaly.severity)}>
                    {anomaly.severity.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Usage: {anomaly.usage} minutes (Threshold: {anomaly.threshold} minutes)</p>
                  <p className="text-xs text-gray-500 mt-1">Detected: {anomaly.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          Demo mode: Showing mock anomalies based on custom thresholds and government data.
        </div>
      </CardContent>
    </Card>
  )
}


