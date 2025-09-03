"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Lightbulb,
  Fan,
  Thermometer,
  Tv,
  Battery,
  Leaf,
  Sun,
  Moon,
  Users,
  Volume2,
  Shield,
  Award,
  AlertTriangle,
  X,
  LogOut,
} from "lucide-react"
import { useTheme } from "next-themes"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import LanguageSelector from "@/components/LanguageSelector"
import ProfileSettings from "@/components/ProfileSettings"
import CaregiverView from "@/components/CaregiverView"
import ErrorBanner from "@/components/ErrorBanner"
import {
  type Device,
  type Alert,
  simulateDeviceRuntime,
  checkForAlerts,
  formatRuntime,
  calculateCarbonSavings,
  calculateGreenScore,
} from "@/lib/mockData"
import {
  type ErrorState,
  type OfflineData,
  checkOnlineStatus,
  saveOfflineData,
  loadOfflineData,
  simulateApiCall,
} from "@/lib/errorHandling"

// Mock data for energy usage
const weeklyData = [
  { day: "Mon", usage: 12, color: "#8b5cf6" },
  { day: "Tue", usage: 15, color: "#8b5cf6" },
  { day: "Wed", usage: 8, color: "#10b981" },
  { day: "Thu", usage: 18, color: "#f59e0b" },
  { day: "Fri", usage: 22, color: "#ef4444" },
  { day: "Sat", usage: 14, color: "#8b5cf6" },
  { day: "Sun", usage: 10, color: "#10b981" },
]

// Initial device data with simulation parameters
const initialDevices: Device[] = [
  {
    id: 1,
    name: "Living Room Light",
    icon: Lightbulb,
    status: true,
    runtime: 120, // 2 hours in minutes
    usage: "Low",
    baseUsage: "Low",
    threshold: 240, // 4 hours
    usualAverage: 180, // 3 hours
  },
  {
    id: 2,
    name: "Bedroom Fan",
    icon: Fan,
    status: true,
    runtime: 360, // 6 hours
    usage: "High",
    baseUsage: "Medium",
    threshold: 180, // 3 hours
    usualAverage: 120, // 2 hours
  },
  {
    id: 3,
    name: "Water Geyser",
    icon: Thermometer,
    status: false,
    runtime: 0,
    usage: "Off",
    baseUsage: "High",
    threshold: 60, // 1 hour
    usualAverage: 45, // 45 minutes
  },
  {
    id: 4,
    name: "Television",
    icon: Tv,
    status: true,
    runtime: 180, // 3 hours
    usage: "Medium",
    baseUsage: "Medium",
    threshold: 240, // 4 hours
    usualAverage: 180, // 3 hours
  },
]

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [isMounted, setIsMounted] = useState(false)
  const [displayName, setDisplayName] = useState("Shanta Devi")
  const [caregiverMode, setCaregiverMode] = useState(false)
  const [devices, setDevices] = useState<Device[]>(initialDevices)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [carbonSaved, setCarbonSaved] = useState(15.2)
  const [greenScore, setGreenScore] = useState(82)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [errorState, setErrorState] = useState<ErrorState>({
    isOffline: false,
    hasApiError: false,
    lastSyncTime: null,
    errorMessage: null,
  })
  const [showErrorBanner, setShowErrorBanner] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Load simulated profile
    try {
      const raw = localStorage.getItem("eldergrid_profile")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.name) setDisplayName(parsed.name)
      }
    } catch {}
    
    // Check authentication status
    const token = localStorage.getItem("eldergrid_auth_token")
    if (token) {
      setIsAuthenticated(true)
    } else {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      console.log("[v0] Connection restored")
      setErrorState((prev) => ({ ...prev, isOffline: false }))
      setShowErrorBanner(false)
    }

    const handleOffline = () => {
      console.log("[v0] Connection lost - switching to offline mode")
      setErrorState((prev) => ({
        ...prev,
        isOffline: true,
        lastSyncTime: new Date().toISOString(),
      }))
      setShowErrorBanner(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial check
    if (!checkOnlineStatus()) {
      handleOffline()
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const syncData = async () => {
      if (errorState.isOffline) {
        // Load offline data if available
        const offlineData = loadOfflineData()
        if (offlineData) {
          setDevices(offlineData.devices)
          setCarbonSaved(offlineData.carbonSaved)
          setGreenScore(offlineData.greenScore)
          setAlerts(offlineData.alerts)
          console.log("[v0] Using offline data")
        }
        return
      }

      // Simulate API call with error handling
      const { data, error } = await simulateApiCall(async () => {
        return simulateDeviceRuntime(devices)
      }, devices)

      if (error) {
        console.log("[v0] API error occurred:", error)
        setErrorState((prev) => ({
          ...prev,
          hasApiError: true,
          errorMessage: error,
          lastSyncTime: prev.lastSyncTime || new Date().toISOString(),
        }))
        setShowErrorBanner(true)

        // Load offline data as fallback
        const offlineData = loadOfflineData()
        if (offlineData) {
          setDevices(offlineData.devices)
          setCarbonSaved(offlineData.carbonSaved)
          setGreenScore(offlineData.greenScore)
          setAlerts(offlineData.alerts)
        }
      } else if (data) {
        // Successful update
        setDevices(data)
        const newCarbonSaved = calculateCarbonSavings(data)
        setCarbonSaved(newCarbonSaved)

        setAlerts((prevAlerts) => {
          const newAlerts = checkForAlerts(data, prevAlerts)
          const newGreenScore = calculateGreenScore(data, newAlerts)
          setGreenScore(newGreenScore)

          // Save successful data for offline use
          saveOfflineData({
            devices: data,
            carbonSaved: newCarbonSaved,
            greenScore: newGreenScore,
            alerts: newAlerts,
            lastUpdated: new Date().toISOString(),
          })

          return newAlerts
        })

        // Clear error state on successful sync
        setErrorState((prev) => ({
          ...prev,
          hasApiError: false,
          errorMessage: null,
          lastSyncTime: new Date().toISOString(),
        }))
        setShowErrorBanner(false)

        console.log("[v0] Data synced successfully")
      }
    }

    const interval = setInterval(syncData, 15000) // Increased interval for demo
    syncData() // Initial sync

    return () => clearInterval(interval)
  }, [devices, errorState.isOffline])

  const toggleDevice = (deviceId: number) => {
    setDevices((prevDevices) => {
      const updatedDevices = prevDevices.map((device) =>
        device.id === deviceId
          ? { ...device, status: !device.status, runtime: device.status ? 0 : device.runtime }
          : device,
      )

      // Save device state changes immediately for offline use
      const currentData: OfflineData = {
        devices: updatedDevices,
        carbonSaved,
        greenScore,
        alerts,
        lastUpdated: new Date().toISOString(),
      }
      saveOfflineData(currentData)

      return updatedDevices
    })
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    )
  }

  const handleRetry = async () => {
    console.log("[v0] Retrying connection...")
    setErrorState((prev) => ({ ...prev, hasApiError: false }))
    setShowErrorBanner(false)

    // Force a data sync attempt
    if (checkOnlineStatus()) {
      const { data, error } = await simulateApiCall(async () => {
        return simulateDeviceRuntime(devices)
      })

      if (error) {
        setErrorState((prev) => ({
          ...prev,
          hasApiError: true,
          errorMessage: error,
        }))
        setShowErrorBanner(true)
      }
    }
  }

  const handleDismissError = () => {
    setShowErrorBanner(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("eldergrid_auth_token")
    setIsAuthenticated(false)
    window.location.href = "/login"
  }

  const getUsageColor = (usage: string) => {
    switch (usage) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getGreenScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getGreenScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! You're an energy champion!"
    if (score >= 80) return "Great job! Keep up the good work!"
    if (score >= 70) return "Good progress! Small improvements help!"
    if (score >= 60) return "You're doing okay, but there's room to improve!"
    return "Let's work together to save more energy!"
  }

  // Get unacknowledged alerts
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged)

  if (!isMounted) {
    return <div className="min-h-screen bg-background p-4 md:p-6" />
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background p-4 md:p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {showErrorBanner && <ErrorBanner errorState={errorState} onRetry={handleRetry} onDismiss={handleDismissError} />}

      {/* Caregiver placeholder panel */}
      {caregiverMode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-senior-xl font-heading">Caregiver Dashboard (coming soon)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-senior-base text-muted-foreground mb-2">
              This section will provide caregivers with an overview of the elder's energy usage and alerts.
            </p>
            <Button onClick={() => setCaregiverMode(false)} className="text-senior-base">
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="mb-6">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`mb-3 p-4 rounded-lg border-l-4 ${
                alert.type === "critical"
                  ? "bg-red-50 border-red-500 border border-red-200"
                  : "bg-yellow-50 border-yellow-500 border border-yellow-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-6 h-6 mt-1 ${alert.type === "critical" ? "text-red-600" : "text-yellow-600"}`}
                  />
                  <div>
                    <h4 className="text-senior-lg font-semibold mb-1">{alert.deviceName} Alert</h4>
                    <p className="text-senior-base mb-2">
                      <strong>Duration:</strong> {alert.duration} - {alert.reason}
                    </p>
                    <p className="text-senior-sm text-muted-foreground">
                      {alert.comparison} • {alert.timestamp}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-senior-base"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="sr-only">ElderGrid</h1>
            <p className="text-senior-lg text-muted-foreground">
              {t("greeting").replace("Shanta Devi", displayName)} 👋
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <LanguageSelector />

            <ProfileSettings currentDisplayName={displayName} onDisplayNameChange={setDisplayName} />

            <Button variant="outline" size="lg" onClick={() => setCaregiverMode(true)} className="text-senior-base">
              <Shield className="w-5 h-5 mr-2" />
              {t("caregiverMode")}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-senior-base"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
              {t("darkMode")}
            </Button>

            <Button variant="outline" size="lg" className="text-senior-base bg-transparent">
              <Volume2 className="w-5 h-5 mr-2" />
              {t("readAloud")}
            </Button>

            {/* Link to Profile page */}
            <a href="/profile" className="ml-auto">
              <Button variant="outline" size="lg" className="text-senior-base">
                <Users className="w-5 h-5 mr-2" />
                My Account
              </Button>
            </a>

            {/* Logout Button */}
            <Button variant="outline" size="lg" onClick={handleLogout} className="text-senior-base">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Energy Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-senior-xl font-heading flex items-center gap-2">
              <Battery className="w-6 h-6 text-primary" />
              {t("energyOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-senior-base text-muted-foreground mb-2">{t("currentUsage")}</p>
                <p className="text-senior-3xl font-bold text-foreground">18.5</p>
                <p className="text-senior-lg text-muted-foreground">kWh</p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200 text-senior-base">
                  {t("mediumUsage")}
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-senior-base text-muted-foreground mb-2">{t("carbonSavings")}</p>
                <p className="text-senior-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                  <Leaf className="w-8 h-8" />
                  {carbonSaved}
                </p>
                <p className="text-senior-lg text-muted-foreground">kg CO₂</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Green Score Gamification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl font-heading flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              {t("greenScore")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <p className={`text-senior-3xl font-bold ${getGreenScoreColor(greenScore)}`}>{greenScore}/100</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    greenScore >= 80 ? "bg-green-500" : greenScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${greenScore}%` }}
                />
              </div>
            </div>
            <p className="text-senior-base text-muted-foreground">{getGreenScoreMessage(greenScore)} 🌱</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Usage Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-senior-xl font-heading">{t("weeklyUsage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fontSize: 16 }} axisLine={{ stroke: "#d1d5db" }} />
                <YAxis tick={{ fontSize: 16 }} axisLine={{ stroke: "#d1d5db" }} />
                <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Device Control */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-senior-xl font-heading">{t("deviceControl")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {devices.map((device) => {
              const Icon = device.icon
              const isOn = device.status

              return (
                <Card key={device.id} className={`transition-all ${isOn ? "ring-2 ring-primary" : ""}`}>
                  <CardContent className="p-6 text-center">
                    <Icon className={`w-12 h-12 mx-auto mb-4 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="text-senior-lg font-semibold mb-2">{device.name}</h3>

                    <div className="flex items-center justify-center mb-4">
                      <Switch checked={isOn} onCheckedChange={() => toggleDevice(device.id)} className="scale-125" />
                      <span className="ml-2 text-senior-base">{isOn ? t("on") : t("off")}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-senior-base text-muted-foreground">
                        {t("runtime")}: {isOn ? formatRuntime(device.runtime) : "0 min"}
                      </p>
                      <Badge className={`${getUsageColor(device.usage)} text-senior-sm`}>{device.usage}</Badge>
                    </div>

                    {/* Enhanced Alert for high usage */}
                    {isOn && device.runtime > device.threshold && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-senior-sm text-red-800">
                          ⚠ Running for {formatRuntime(device.runtime)} - your usual average is{" "}
                          {formatRuntime(device.usualAverage)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Family Mode */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-senior-xl font-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {t("familyMode")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800 border-green-200 text-senior-base mb-4">
              👨‍👩‍👧 {t("familyAccessEnabled")}
            </Badge>
          </div>
          <Button
            className="w-full text-senior-base py-6"
            size="lg"
            onClick={() => alert("Family has been notified about your energy usage!")}
          >
            {t("notifyFamily")}
          </Button>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-senior-xl font-heading">{t("aiInsights")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg mb-4">
            <p className="text-senior-lg leading-relaxed">"{t("aiInsightText")} 🌱"</p>
          </div>
          <Button size="lg" className="text-senior-base py-6">
            {t("generateReport")}
          </Button>
        </CardContent>
      </Card>

      <CaregiverView isOpen={caregiverMode} onClose={() => setCaregiverMode(false)} />
    </div>
  )
}
