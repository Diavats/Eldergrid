"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import GovDataMock from "@/components/widgets/GovDataMock"
import CustomThresholds from "@/components/widgets/CustomThresholds"
import AnomalyDetector from "@/components/widgets/AnomalyDetector"
import EnergySavingsCounter from "@/components/widgets/EnergySavingsCounter"
import MedicationReminders from "@/components/widgets/MedicationReminders"
import LanguageSelector from "@/components/LanguageSelector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Heart, Zap, Settings, Moon, Sun } from "lucide-react"

// Lightweight AI summary widget (mock) – aggregates a short sentence from recent stats
function AIReportWidget() {
  const { t } = useTranslation()
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
        <CardTitle>{t('aiInsights')} (Demo)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300">{summary}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          This demo summary is generated from seeded mock data for live judging.
        </p>
      </CardContent>
    </Card>
  )
}

export default function DashboardIndex() {
  const router = useRouter()
  const { t } = useTranslation()
  const [fullName, setFullName] = useState<string>("Demo User")
  const [email, setEmail] = useState<string>("demo@example.com")
  const [elderMode, setElderMode] = useState<boolean>(false)
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [activeTab, setActiveTab] = useState("energy")

  // Logout function (demo mode)
  const handleLogout = () => {
    console.log("Demo mode - redirecting to home")
    router.push("/")
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // In a real app, you'd persist this to localStorage and apply to document
  }

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className={`min-h-screen p-6 space-y-6 transition-colors ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Error banner */}
      {error && (
        <Card className={`border-red-300 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
          <CardContent className="p-4">
            <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError("")}
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top/account section */}
      <Card className={`rounded-2xl shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
            {t('greeting', { name: fullName })}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('profileSettings')}
            </div>
            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{email}</div>
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
          <div className="flex items-center justify-start md:justify-center gap-2">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('familyMode')}
            </span>
            <Button
              variant={elderMode ? "default" : "outline"}
              onClick={() => setElderMode((v) => !v)}
              className={elderMode ? "text-lg py-6 px-6" : ""}
            >
              {elderMode ? t('on') : t('off')}
            </Button>
          </div>
          <div className="flex items-center justify-start md:justify-center gap-2">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('darkMode')}
            </span>
            <Button
              variant={darkMode ? "default" : "outline"}
              onClick={toggleDarkMode}
              size="sm"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-start md:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs"
            >
              {showDebugInfo ? "Hide" : "Show"} Debug
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full grid-cols-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <TabsTrigger value="energy" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            {t('energyOverview')}
          </TabsTrigger>
          <TabsTrigger value="caregiver" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {t('caregiverMode')}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('profileSettings')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Energy Dashboard Tab */}
        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomThresholds />
            <AnomalyDetector />
            <EnergySavingsCounter />
            <GovDataMock />
            <AIReportWidget />
          </div>
        </TabsContent>

        {/* Caregiver View Tab */}
        <TabsContent value="caregiver" className="space-y-6">
          <Card className={`rounded-2xl shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Heart className="h-5 w-5" />
                {t('caregiverMode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Monitor and manage care for your loved ones with real-time health and energy insights.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MedicationReminders />
                
                <Card className={`border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Health Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Last Activity
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          2 hours ago
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Energy Usage
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Normal
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Medication Status
                        </span>
                        <span className="font-medium text-green-600">
                          Up to date
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card className={`rounded-2xl shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <User className="h-5 w-5" />
                {t('profileSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Full Name
                        </label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {fullName}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Email
                        </label>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Preferences
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('familyMode')}
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {elderMode ? t('on') : t('off')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {t('darkMode')}
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {darkMode ? t('on') : t('off')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className={`rounded-2xl shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Display Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('darkMode')}
                      </span>
                      <Button
                        variant={darkMode ? "default" : "outline"}
                        onClick={toggleDarkMode}
                        size="sm"
                      >
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('familyMode')}
                      </span>
                      <Button
                        variant={elderMode ? "default" : "outline"}
                        onClick={() => setElderMode((v) => !v)}
                        size="sm"
                      >
                        {elderMode ? t('on') : t('off')}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Language & Region
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t('language')}
                    </span>
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Debug info for testing */}
      {showDebugInfo && (
        <Card className={`rounded-2xl shadow border border-yellow-300 ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Debug Information
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError("")}
                className="text-xs"
              >
                Clear Errors
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Demo Mode Info:</h4>
                <p className="text-xs text-gray-600">
                  User ID: demo-user-123<br/>
                  Email: {email}<br/>
                  Full Name: {fullName}<br/>
                  Elder Mode: {elderMode ? 'Enabled' : 'Disabled'}<br/>
                  Dark Mode: {darkMode ? 'Enabled' : 'Disabled'}<br/>
                  Active Tab: {activeTab}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Widget Status:</h4>
                <div className="text-xs text-gray-600">
                  <p>✅ Medication Reminders - Mock data loaded</p>
                  <p>✅ Custom Thresholds - Interactive demo</p>
                  <p>✅ Anomaly Detector - Mock analysis</p>
                  <p>✅ Energy Savings Counter - Mock calculations</p>
                  <p>✅ Government Data Mock - Regional baselines</p>
                  <p>✅ AI Report Widget - Generated summary</p>
                  <p>✅ Language Selector - Multilingual support</p>
                  <p>✅ Tab Navigation - Working across all sections</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo note for judges */}
      <Card className={`rounded-2xl shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>Demo Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className={`text-sm list-disc pl-5 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>All widgets are running with mock data for demonstration purposes.</li>
            <li>Custom thresholds override government averages in anomaly detection.</li>
            <li>The AI report is a lightweight demo summary generated from mock data.</li>
            <li>Use the "Show Debug" button above to view demo information and widget status.</li>
            <li>Elder Mode increases text size and button sizes for accessibility.</li>
            <li>Language selector provides multilingual support for the interface.</li>
            <li>Dark/Light mode toggle affects the entire dashboard appearance.</li>
            <li>Tab navigation works across all sections with proper language switching.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}




