"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

type Appliance = {
  name: "geyser" | "heater" | "fan" | "tv" | string
  status: "on" | "off"
  startTime?: number
  offSince?: number
}

type Props = { appliance: Appliance }

const ApplianceCard: React.FC<Props> = ({ appliance }) => {
  const { t } = useTranslation()
  const [isOn, setIsOn] = useState(appliance.status === "on")
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const label = useMemo(
    () =>
      t(`appliance.${appliance.name}`, {
        defaultValue:
          appliance.name === "geyser"
            ? "Geyser"
            : appliance.name === "heater"
            ? "Heater"
            : appliance.name === "fan"
            ? "Fan"
            : appliance.name === "tv"
            ? "TV"
            : appliance.name,
      }),
    [appliance.name, t]
  )

  const minutesSince = (ts?: number) => (ts ? Math.max(0, Math.floor((Date.now() - ts) / 60000)) : 0)
  const runningFor = isOn ? minutesSince(appliance.startTime) : minutesSince(appliance.offSince)

  return (
    <div className="rounded-xl border shadow p-4 bg-white dark:bg-gray-800 flex items-center justify-between">
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {isOn
            ? t("runningFor", { defaultValue: "Running for {{time}}", time: `${runningFor} min` })
            : t("offFor", { defaultValue: "Off for {{time}}", time: `${runningFor} min` })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOn((v) => !v)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isOn
            ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500"
            : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
        }`}
        aria-pressed={isOn}
        aria-label={isOn ? t("on", { defaultValue: "On" }) : t("off", { defaultValue: "Off" })}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            isOn ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}

export default ApplianceCard
