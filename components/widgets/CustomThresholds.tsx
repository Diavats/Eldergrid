"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CustomThresholds() {
  const [thresholds, setThresholds] = useState({
    geyser: 120,
    heater: 180,
    fan: 300,
    tv: 240
  })

  const handleThresholdChange = (appliance: string, value: string) => {
    const numValue = parseInt(value) || 0
    setThresholds(prev => ({
      ...prev,
      [appliance]: numValue
    }))
  }

  const resetToDefaults = () => {
    setThresholds({
      geyser: 120,
      heater: 180,
      fan: 300,
      tv: 240
    })
  }

  return (
    <Card className="rounded-2xl shadow border">
      <CardHeader>
        <CardTitle>Custom Thresholds (Demo)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Set custom energy usage thresholds for anomaly detection. These override government baselines.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="geyser">Geyser (minutes)</Label>
            <Input
              id="geyser"
              type="number"
              value={thresholds.geyser}
              onChange={(e) => handleThresholdChange('geyser', e.target.value)}
              placeholder="120"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="heater">Heater (minutes)</Label>
            <Input
              id="heater"
              type="number"
              value={thresholds.heater}
              onChange={(e) => handleThresholdChange('heater', e.target.value)}
              placeholder="180"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fan">Fan (minutes)</Label>
            <Input
              id="fan"
              type="number"
              value={thresholds.fan}
              onChange={(e) => handleThresholdChange('fan', e.target.value)}
              placeholder="300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tv">TV (minutes)</Label>
            <Input
              id="tv"
              type="number"
              value={thresholds.tv}
              onChange={(e) => handleThresholdChange('tv', e.target.value)}
              placeholder="240"
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button onClick={resetToDefaults} variant="outline" size="sm">
            Reset to Defaults
          </Button>
          <Button size="sm" className="flex-1">
            Save Thresholds
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Demo mode: Changes are stored locally and used for anomaly detection.
        </div>
      </CardContent>
    </Card>
  )
}


