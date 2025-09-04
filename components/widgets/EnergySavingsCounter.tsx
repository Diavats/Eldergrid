"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export default function EnergySavingsCounter() {
  const [savings, setSavings] = useState({
    totalSavings: 15.7,
    monthlySavings: 3.2,
    percentageReduction: 12.5,
    currency: "USD"
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingDown className="h-5 w-5 text-green-600" />
    } else {
      return <TrendingUp className="h-5 w-5 text-red-600" />
    }
  }

  const getTrendColor = (value: number) => {
    return value > 0 ? "text-green-600" : "text-red-600"
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow border">
        <CardHeader>
          <CardTitle>Energy Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow border">
      <CardHeader>
        <CardTitle>Energy Savings Counter (Demo)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Compare your energy usage against government averages and track your savings.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${savings.totalSavings.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">This month</p>
              <p className="text-lg font-semibold text-green-600">
                ${savings.monthlySavings.toFixed(1)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getTrendIcon(savings.percentageReduction)}
                <span className={`text-sm font-medium ${getTrendColor(savings.percentageReduction)}`}>
                  {savings.percentageReduction}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Reduction vs Avg</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600 mb-1">
                {savings.currency}
              </div>
              <p className="text-xs text-gray-600">Currency</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Savings Breakdown</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Geyser usage:</span>
              <span className="text-green-600">-8.2% below average</span>
            </div>
            <div className="flex justify-between">
              <span>Heater usage:</span>
              <span className="text-green-600">-15.3% below average</span>
            </div>
            <div className="flex justify-between">
              <span>Fan usage:</span>
              <span className="text-red-600">+5.1% above average</span>
            </div>
            <div className="flex justify-between">
              <span>TV usage:</span>
              <span className="text-green-600">-12.7% below average</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          Demo mode: Showing mock savings calculations based on government energy averages.
        </div>
      </CardContent>
    </Card>
  )
}


