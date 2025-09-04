"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Plus, Trash2 } from "lucide-react"

interface Medication {
  id: string
  name: string
  time: string
  taken: boolean
  dosage: string
}

export default function MedicationReminders() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Blood Pressure Medicine",
      time: "08:00",
      taken: false,
      dosage: "1 tablet"
    },
    {
      id: "2",
      name: "Diabetes Medicine",
      time: "12:00",
      taken: true,
      dosage: "1 tablet"
    },
    {
      id: "3",
      name: "Evening Medicine",
      time: "18:00",
      taken: false,
      dosage: "1 tablet"
    }
  ])

  const [newMedication, setNewMedication] = useState({
    name: "",
    time: "",
    dosage: ""
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const addMedication = () => {
    if (newMedication.name && newMedication.time) {
      const medication: Medication = {
        id: Date.now().toString(),
        name: newMedication.name,
        time: newMedication.time,
        taken: false,
        dosage: newMedication.dosage || "1 tablet"
      }
      setMedications([...medications, medication])
      setNewMedication({ name: "", time: "", dosage: "" })
    }
  }

  const toggleTaken = (id: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ))
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id))
  }

  const getNextReminder = () => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const upcoming = medications
      .filter(med => !med.taken)
      .map(med => {
        const [hours, minutes] = med.time.split(':').map(Number)
        const medTime = hours * 60 + minutes
        return { ...med, minutesUntil: medTime - currentTime }
      })
      .filter(med => med.minutesUntil > 0)
      .sort((a, b) => a.minutesUntil - b.minutesUntil)
    
    return upcoming[0]
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow border">
        <CardHeader>
          <CardTitle>Medication Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const nextReminder = getNextReminder()

  return (
    <Card className="rounded-2xl shadow border">
      <CardHeader>
        <CardTitle>Medication Reminders (Demo)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Track your daily medications and set reminders for timely consumption.
        </p>
        
        {nextReminder && (
          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Next Reminder</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {nextReminder.name} at {nextReminder.time} ({nextReminder.dosage})
            </p>
          </div>
        )}
        
        <div className="space-y-3 mb-4">
          {medications.map((medication) => (
            <div key={medication.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={medication.taken}
                  onCheckedChange={() => toggleTaken(medication.id)}
                />
                <div>
                  <p className={`font-medium ${medication.taken ? 'line-through text-gray-500' : ''}`}>
                    {medication.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {medication.time} • {medication.dosage}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMedication(medication.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3">Add New Medication</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="med-name">Medication Name</Label>
              <Input
                id="med-name"
                value={newMedication.name}
                onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                placeholder="e.g., Blood Pressure Medicine"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="med-time">Time</Label>
                <Input
                  id="med-time"
                  type="time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="med-dosage">Dosage</Label>
                <Input
                  id="med-dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="1 tablet"
                />
              </div>
            </div>
            <Button onClick={addMedication} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          Demo mode: Medication data is stored locally for demonstration purposes.
        </div>
      </CardContent>
    </Card>
  )
}


