"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import LanguageSelector from "@/components/LanguageSelector"

export default function ProfilePage() {
  const { t } = useTranslation()
  const [name, setName] = useState("Shanta Devi")
  const [email, setEmail] = useState("shanta@example.com")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eldergrid_profile")
      if (saved) {
        const parsed = JSON.parse(saved)
        setName(parsed.name || "Shanta Devi")
        setEmail(parsed.email || "shanta@example.com")
      }
    } catch {}
  }, [])

  const handleSave = () => {
    localStorage.setItem("eldergrid_profile", JSON.stringify({ name, email }))
    alert("Profile saved!")
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl font-heading">My Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-senior-base">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-senior-base py-3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-senior-base">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-senior-base py-3" />
            </div>
            <div className="space-y-2">
              <Label className="text-senior-base">Preferred Language</Label>
              <LanguageSelector />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} className="text-senior-base">Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}






