"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { ApplianceBox } from "@/components/widgets/ApplianceBox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const EnergyLimits: React.FC = () => {
  const { t } = useTranslation()

  const appliances = [
    { name: "geyser", limit: 120, status: "on", time: "2h 30m" },
    { name: "heater", limit: 180, status: "off", time: "1h 15m" },
    { name: "fan", limit: 300, status: "on", time: "6h 00m" },
    { name: "tv", limit: 240, status: "off", time: "3h 45m" },
  ] as const

  const handleReset = () => {
    // no-op in demo; UI is read-only seed
  }

  const handleSave = () => {
    // no-op in demo; could toast saved
  }

  return (
    <Card className="rounded-2xl shadow border overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
        <CardTitle>
          {t("tabs.energyLimits", { defaultValue: "Your Usage Limits" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t("usageLimitsInfo", {
            defaultValue:
              "Set your preferred usage limits for each appliance. The app will alert you if usage is unusually high.",
          })}
        </p>

        <div className="flex flex-col">
          {appliances.map((app) => (
            <ApplianceBox
              key={app.name}
              appliance={app.name}
              initialLimit={app.limit}
              status={app.status}
              time={app.time}
            />
          ))}
        </div>

        <div className="flex justify-between mt-2">
          <Button variant="outline" onClick={handleReset}>
            {t("resetThresholds", { defaultValue: "Reset Thresholds" })}
          </Button>
          <Button onClick={handleSave}>
            {t("saveThresholds", { defaultValue: "Save Thresholds" })}
          </Button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t("demoNotes", { defaultValue: "Demo mode: Changes are stored locally" })}
        </p>
      </CardContent>
    </Card>
  )
}

export default EnergyLimits
