"use client"

import React from "react"
import { useTranslation } from "react-i18next"

type Props = { name: string }

const Greeting: React.FC<Props> = ({ name }) => {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl border shadow p-4 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("greeting", { name, defaultValue: "Good morning, {{name}}" })}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
        {t("header.subtitle", { defaultValue: "Here is an overview of your home energy and care." })}
      </p>
    </div>
  )
}

export default Greeting
