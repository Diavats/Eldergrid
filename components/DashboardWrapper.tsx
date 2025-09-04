"use client"

import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import LanguageSelector from "@/components/LanguageSelector"

type Props = { children: React.ReactNode }

const DashboardWrapper: React.FC<Props> = ({ children }) => {
  const { i18n } = useTranslation()
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    setClientReady(true)
  }, [])

  if (!clientReady) return null

  return (
    <div className="space-y-4">
      {/* Language Selector Tab */}
      <div className="flex justify-end">
        <LanguageSelector />
      </div>

      {/* All Dashboard Components */}
      <div>{children}</div>
    </div>
  )
}

export default DashboardWrapper
