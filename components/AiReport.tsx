"use client"

import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AiReport: React.FC = () => {
  const { t } = useTranslation()
  const [message, setMessage] = useState("")

  useEffect(() => {
    const id = setTimeout(() => {
      setMessage(
        t("aiInsightText", {
          defaultValue:
            "This week your fan used the most energy, but you saved by turning off high-load appliances on time.",
        })
      )
    }, 400)
    return () => clearTimeout(id)
  }, [t])

  return (
    <Card className="rounded-2xl shadow border">
      <CardHeader>
        <CardTitle>{t("aiInsights", { defaultValue: "AI Insights" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </CardContent>
    </Card>
  )
}

export default AiReport
