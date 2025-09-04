"use client"

import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

export type ApplianceBoxProps = {
  appliance: "geyser" | "heater" | "fan" | "tv" | string
  initialLimit: number
  status: "on" | "off"
  time: string // human-friendly duration like "2h 30m"; upstream can localize if needed
  onToggle?: (isOn: boolean) => void
  onChangeLimit?: (limit: number) => void
}

export const ApplianceBox: React.FC<ApplianceBoxProps> = ({
  appliance,
  initialLimit,
  status,
  time,
  onToggle,
  onChangeLimit,
}) => {
  const { t } = useTranslation()
  const [limit, setLimit] = useState<number>(initialLimit)
  const [isOn, setIsOn] = useState<boolean>(status === "on")

  const label = useMemo(
    () =>
      t(`appliance.${appliance}`, {
        defaultValue:
          appliance === "geyser"
            ? "Geyser"
            : appliance === "heater"
            ? "Heater"
            : appliance === "fan"
            ? "Fan"
            : appliance === "tv"
            ? "TV"
            : appliance,
      }),
    [appliance, t]
  )

  const handleToggle = () => {
    const next = !isOn
    setIsOn(next)
    onToggle?.(next)
  }

  const handleLimit = (value: number) => {
    setLimit(value)
    onChangeLimit?.(value)
  }

  return (
    <div className="appliance-box mb-4 p-4 rounded-xl shadow border bg-white dark:bg-gray-800 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-semibold shadow flex items-center justify-center">
            {label.slice(0, 2)}
          </div>
          <span className="font-medium">{label}</span>
        </div>

        <button
          type="button"
          onClick={handleToggle}
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

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {isOn
          ? t("runningFor", { defaultValue: "Running for {{time}}", time })
          : t("offFor", { defaultValue: "Off for {{time}}", time })}
      </div>

      <input
        type="range"
        min={0}
        max={600}
        value={limit}
        onChange={(e) => handleLimit(Number(e.target.value))}
        className="range-slider mb-2 w-full h-2 rounded-lg appearance-none bg-gradient-to-r from-blue-400 to-indigo-500 [accent-color:#4f46e5]"
      />
      <div className="text-sm text-gray-700 dark:text-gray-200">
        {t("usageLimit", { defaultValue: "Usage limit" })}: {limit} {t("minutesShort", { defaultValue: "min" })}
      </div>
    </div>
  )
}
