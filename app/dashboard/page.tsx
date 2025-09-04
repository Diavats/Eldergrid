"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Greeting from "@/components/Greeting"
import ApplianceCard from "@/components/ApplianceCard"
import AiReport from "@/components/AiReport"
import LanguageSelector from "@/components/LanguageSelector"
import EnergyLimits from "@/components/widgets/EnergyLimits"
import AnomalyDetector from "@/components/widgets/AnomalyDetector"
import EnergySavingsCounter from "@/components/widgets/EnergySavingsCounter"

export default function DashboardIndex() {
  const { t, i18n } = useTranslation()
  const [clientReady, setClientReady] = useState(false)
  const [appliances, setAppliances] = useState([
    { name: "geyser", status: "on", startTime: Date.now() - 180 * 60 * 1000 },
    { name: "heater", status: "off", offSince: Date.now() - 60 * 60 * 1000 },
    { name: "fan", status: "on", startTime: Date.now() - 45 * 60 * 1000 },
    { name: "tv", status: "off", offSince: Date.now() - 120 * 60 * 1000 },
  ])

  useEffect(() => {
    setClientReady(true)
  }, [])

  if (!clientReady) return null

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <Greeting name={t("userName", { defaultValue: "User" })} />
        <LanguageSelector i18n={i18n} />
      </div>

      {/* Energy Limits stacked */}
      <EnergyLimits />

      {/* Appliances */}
      <div className="flex flex-col gap-4">
        {appliances.map((app) => (
          <ApplianceCard key={app.name} appliance={app as any} />
        ))}
      </div>

      {/* Anomaly Detection */}
      <AnomalyDetector />

      {/* Energy Savings Counter */}
      <EnergySavingsCounter />

      {/* AI Report */}
      <AiReport />

      {/* Footer */}
      <footer className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>{t("footer.copyright", { defaultValue: "© 2025 ElderGrid. All Rights Reserved." })}</p>
        <p>{t("footer.contact", { defaultValue: "Contact: support@eldergrid.app" })}</p>
      </footer>
    </div>
  )
}




