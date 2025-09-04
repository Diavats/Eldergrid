"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, TrendingDown } from "lucide-react"

export default function GovDataMock() {
  const [govData, setGovData] = useState({
    region: "Mumbai Metropolitan Region",
    lastUpdated: "2024-01-15",
    averages: {
      geyser: 90,
      heater: 150,
      fan: 240,
      tv: 180
    },
    trends: {
      geyser: -5.2,
      heater: 2.1,
      fan: -8.7,
      tv: 1.3
    }
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    }
  }

  const getTrendColor = (value: number) => {
    return value > 0 ? "text-red-600" : "text-green-600"
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow border">
        <CardHeader>
          <CardTitle>Government Data</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Government Data Mock (Demo)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Regional energy usage averages and trends from government data sources.
        </p>
        
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Region</span>
              <span className="text-sm text-blue-600">{govData.region}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Last Updated</span>
              <span className="text-xs text-blue-500">{govData.lastUpdated}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Average Usage (minutes/day)</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(govData.averages).map(([appliance, average]) => (
                <div key={appliance} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm capitalize text-gray-600">{appliance}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{average}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(govData.trends[appliance as keyof typeof govData.trends])}
                      <span className={`text-xs ${getTrendColor(govData.trends[appliance as keyof typeof govData.trends])}`}>
                        {govData.trends[appliance as keyof typeof govData.trends] > 0 ? '+' : ''}
                        {govData.trends[appliance as keyof typeof govData.trends]}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-sm text-yellow-800 mb-2">Data Source</h4>
            <p className="text-xs text-yellow-700">
              Energy Efficiency Bureau, Ministry of Power<br/>
              Regional household energy consumption survey 2023
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          Demo mode: Showing mock government data for demonstration purposes.
        </div>
      </CardContent>
    </Card>
  )
}


