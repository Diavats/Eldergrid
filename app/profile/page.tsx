"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import LanguageSelector from "@/components/LanguageSelector"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        router.push("/login")
        return
      }
      setEmail(user.email ?? "")

      // ensure a profiles row exists
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        setError(error.message)
        return
      }
      if (!prof) {
        // insert default empty row
        await supabase.from("profiles").insert([{ user_id: user.id, full_name: null }])
        setName("")
      } else {
        setName(prof.full_name ?? "")
      }
    }
    loadProfile()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) {
      router.push("/login")
      return
    }
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, full_name: name || null })
      .eq("user_id", user.id)
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    setSaving(false)
    router.push("/dashboard")
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
              <Input id="name" placeholder="Add your name" value={name} onChange={(e) => setName(e.target.value)} className="text-senior-base py-3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-senior-base">Email</Label>
              <Input id="email" value={email} disabled className="text-senior-base py-3" />
            </div>
            <div className="space-y-2">
              <Label className="text-senior-base">Preferred Language</Label>
              <LanguageSelector />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="text-senior-base">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}






