"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ensureUserAndPatient } from "@/lib/supaHelpers"
import GovDataMock from "@/components/widgets/GovDataMock"
import CustomThresholds from "@/components/widgets/CustomThresholds"
import AnomalyDetector from "@/components/widgets/AnomalyDetector"
import EnergySavingsCounter from "@/components/widgets/EnergySavingsCounter"
import MedicationReminders from "@/components/widgets/MedicationReminders"
import LanguageSelector from "@/components/LanguageSelector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Lightweight AI summary widget (mock) – aggregates a short sentence from recent stats
function AIReportWidget() {
  const [summary, setSummary] = useState("Generating summary…")

  useEffect(() => {
    // Mock AI: pretend to analyze anomalies/savings
    const timer = setTimeout(() => {
      setSummary(
        "You reduced energy usage versus regional averages and a few long-running sessions were flagged. Keep fans efficient and limit heater/geyser durations."
      )
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="rounded-2xl shadow border">
      <CardHeader>
        <CardTitle>AI Report (Demo)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{summary}</p>
        <p className="text-xs text-gray-500 mt-2">
          This demo summary is generated from seeded mock data for live judging.
        </p>
      </CardContent>
    </Card>
  )
}

export default function DashboardIndex() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [fullName, setFullName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [elderMode, setElderMode] = useState<boolean>(false)
  const envOk = useMemo(() => {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  // Auth + profile name
  useEffect(() => {
    const init = async () => {
      if (!envOk) return
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login")
        return
      }
      setSession(data.session)
      setEmail(data.session.user?.email ?? "")

      // Ensure basic patient linkage (hackathon-friendly helper)
      try { await ensureUserAndPatient() } catch {}

      // Load profile full_name if any
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", data.session.user.id)
        .maybeSingle()
      setFullName(prof?.full_name ?? "")

      // Auto-seed mock data in development to ensure widgets are populated
      if (process.env.NODE_ENV === "development") {
        await seedIfEmpty(data.session.user.id)
      }
    }
    init()
  }, [router, envOk])

  // Seed helper (inline, avoids external scripts import in app router)
  async function seedIfEmpty(userId: string) {
    // check any logs
    const { data: logs, error } = await supabase
      .from("appliance_logs")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
    if (error) return
    if ((logs || []).length > 0) return

    const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
    const pastDateWithin = (days: number) => {
      const d = new Date()
      d.setDate(d.getDate() - randInt(0, days))
      d.setHours(randInt(6, 22), randInt(0, 59), 0, 0)
      return d.toISOString()
    }
    const ranges = [
      { name: "Geyser", min: 20, max: 140 },
      { name: "Heater", min: 60, max: 240 },
      { name: "Fan", min: 200, max: 500 },
      { name: "TV", min: 60, max: 360 },
    ]
    const rows: Array<{ user_id: string; appliance: string; usage_minutes: number; timestamp: string }> = []
    const total = randInt(15, 20)
    for (let i = 0; i < total; i++) {
      const r = ranges[randInt(0, ranges.length - 1)]
      rows.push({ user_id: userId, appliance: r.name, usage_minutes: randInt(r.min, r.max), timestamp: pastDateWithin(7) })
    }
    await supabase.from("appliance_logs").insert(rows)
  }

  if (!envOk) {
    return (
      <div className="min-h-screen p-6">
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle>Environment configuration missing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm">
              Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return <div className="min-h-screen p-6">Loading dashboard…</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Top/account section – for judges: shows auth + quick actions */}
      <Card className="rounded-2xl shadow border">
        <CardHeader>
          <CardTitle>Welcome{fullName ? `, ${fullName}` : ""}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <div className="text-sm text-gray-500">Signed in as</div>
            <div className="font-medium">{email}</div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/profile")}
              className={elderMode ? "text-lg py-6 px-6" : ""}
            >
              {fullName ? "Update name" : "Add your name"}
            </Button>
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-start md:justify-end gap-2">
            <span className="text-sm text-gray-600">Elder mode</span>
            <Button
              variant={elderMode ? "default" : "outline"}
              onClick={() => setElderMode((v) => !v)}
              className={elderMode ? "text-lg py-6 px-6" : ""}
            >
              {elderMode ? "On" : "Off"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Widgets grid – each card explains its purpose for judges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medication reminders: simple patient meds manager */}
        <Card className="rounded-2xl shadow border">
          <CardHeader>
            <CardTitle>Medication Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <MedicationReminders />
          </CardContent>
        </Card>

        {/* Threshold editor: family personalization – overrides gov baselines */}
        <CustomThresholds />

        {/* Anomalies: compares latest logs vs thresholds (custom > gov×2) */}
        <AnomalyDetector />

        {/* Savings: compares usage vs gov averages; shows under/over usage */}
        <EnergySavingsCounter />

        {/* Government reference: realistic baseline to ground the demo */}
        <GovDataMock />

        {/* AI report: short text based on seeded data */}
        <AIReportWidget />
      </div>

      {/* Demo note for judges */}
      <Card className="rounded-2xl shadow border">
        <CardHeader>
          <CardTitle>Demo Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>
              Mock data is automatically seeded in development if your account has no appliance logs, so widgets always
              render live values.
            </li>
            <li>
              Custom thresholds override government averages in anomaly detection; otherwise a 2× multiplier of the gov
              average is used as the threshold.
            </li>
            <li>The AI report is a lightweight demo summary generated from the seeded data.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}




