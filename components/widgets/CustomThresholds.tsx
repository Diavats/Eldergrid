"use client"

import { useMemo, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const APPLIANCES = ["geyser", "heater", "fan", "tv"] as const

type ApplianceKey = typeof APPLIANCES[number]

type ThresholdState = Record<ApplianceKey, number>

type PowerState = Record<
  ApplianceKey,
  { on: boolean; changedAt: number } // track last toggle time for on/off duration
>

export default function CustomThresholds() {
  const { t } = useTranslation()

  const initialThresholds: ThresholdState = useMemo(
    () => ({ geyser: 120, heater: 180, fan: 300, tv: 240 }),
    []
  )

  const [thresholds, setThresholds] = useState<ThresholdState>(initialThresholds)
  const [power, setPower] = useState<PowerState>({
    geyser: { on: true, changedAt: Date.now() - 35 * 60 * 1000 },
    heater: { on: false, changedAt: Date.now() - 75 * 60 * 1000 },
    fan: { on: true, changedAt: Date.now() - 12 * 60 * 1000 },
    tv: { on: false, changedAt: Date.now() - 225 * 60 * 1000 },
  })
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleChange = (appliance: ApplianceKey, value: number) => {
    setThresholds((prev) => ({ ...prev, [appliance]: value }))
  }

  const togglePower = (appliance: ApplianceKey) => {
    setPower((prev) => {
      const current = prev[appliance]
      return {
        ...prev,
        [appliance]: {
          on: !current.on,
          changedAt: Date.now(),
        },
      }
    })
  }

  const resetDefaults = () => setThresholds(initialThresholds)

  const getApplianceLabel = (key: ApplianceKey) =>
    t(`appliance.${key}`, {
      defaultValue:
        key === "geyser" ? "Geyser" : key === "heater" ? "Heater" : key === "fan" ? "Fan" : "TV",
    })

  const minutesSince = (ts: number) => Math.max(0, Math.floor((Date.now() - ts) / 60000))

  return (
    <Card className="rounded-2xl shadow border overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
        <CardTitle>
          {t("tabs.energyLimits", { defaultValue: "Your Usage Limits" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t("demoThresholdInfo", {
            defaultValue:
              "Set your preferred usage limits for each appliance. The app may alert you if usage is unusually high.",
          })}
        </p>

        <div className="space-y-4">
          {APPLIANCES.map((appliance) => {
            const value = thresholds[appliance]
            const { on, changedAt } = power[appliance]
            const mins = minutesSince(changedAt)

            return (
              <div key={appliance} className="p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 border flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium capitalize">
                    {getApplianceLabel(appliance)}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePower(appliance)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      on
                        ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500"
                        : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                    aria-pressed={on}
                    aria-label={on ? t("on", { defaultValue: "On" }) : t("off", { defaultValue: "Off" })}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {on
                    ? t("runningFor", { defaultValue: "Running for {{time}}", time: `${mins} min` })
                    : t("offFor", { defaultValue: "Off for {{time}}", time: `${mins} min` })}
                </div>

                <input
                  type="range"
                  min={0}
                  max={600}
                  value={value}
                  onChange={(e) => handleChange(appliance, Number(e.target.value))}
                  className="range-slider mb-2 w-full h-2 rounded-lg appearance-none bg-gradient-to-r from-blue-400 to-indigo-500 [accent-color:#4f46e5]"
                />
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {t("usageLimit", { defaultValue: "Usage limit" })}: {value} {t("minutesShort", { defaultValue: "min" })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between mt-2">
          <Button variant="outline" onClick={resetDefaults}>
            {t("resetThresholds", { defaultValue: "Reset to Defaults" })}
          </Button>
          <Button>{t("saveThresholds", { defaultValue: "Save Thresholds" })}</Button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t("demoNotes", { defaultValue: "Demo mode: Changes are stored locally" })}
        </p>
      </CardContent>
    </Card>
  )
}


