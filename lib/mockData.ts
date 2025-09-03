// Mock data utility for simulating live device runtime and energy usage
export interface Device {
  id: number
  name: string
  icon: any
  status: boolean
  runtime: number // in minutes
  usage: "Low" | "Medium" | "High" | "Off"
  baseUsage: "Low" | "Medium" | "High"
  threshold: number // minutes before alert
  usualAverage: number // usual runtime in minutes
}

export interface Alert {
  id: string
  deviceId: number
  deviceName: string
  timestamp: string
  duration: string
  reason: string
  comparison: string
  type: "warning" | "critical"
  acknowledged: boolean
}

// Simulate device runtime increments
export function simulateDeviceRuntime(devices: Device[]): Device[] {
  return devices.map((device) => {
    if (device.status) {
      // Increment runtime by 1-3 minutes randomly
      const increment = Math.floor(Math.random() * 3) + 1
      const newRuntime = device.runtime + increment

      // Update usage level based on runtime
      let newUsage: "Low" | "Medium" | "High" = device.baseUsage
      if (newRuntime > device.threshold * 1.5) {
        newUsage = "High"
      } else if (newRuntime > device.threshold) {
        newUsage = "Medium"
      } else {
        newUsage = device.baseUsage
      }

      return {
        ...device,
        runtime: newRuntime,
        usage: newUsage,
      }
    }
    return {
      ...device,
      runtime: 0,
      usage: "Off" as const,
    }
  })
}

// Generate alerts when thresholds are crossed
export function checkForAlerts(devices: Device[], existingAlerts: Alert[]): Alert[] {
  const newAlerts: Alert[] = []

  devices.forEach((device) => {
    if (device.status && device.runtime > device.threshold) {
      // Check if we already have an alert for this device
      const existingAlert = existingAlerts.find((alert) => alert.deviceId === device.id && !alert.acknowledged)

      if (!existingAlert) {
        const alertType = device.runtime > device.threshold * 2 ? "critical" : "warning"
        const comparison =
          device.runtime > device.usualAverage
            ? `${Math.round(((device.runtime - device.usualAverage) / 60) * 10) / 10} hrs above usual average`
            : "within normal range"

        newAlerts.push({
          id: `alert-${device.id}-${Date.now()}`,
          deviceId: device.id,
          deviceName: device.name,
          timestamp: new Date().toLocaleString(),
          duration: formatRuntime(device.runtime),
          reason: `Running longer than usual (${formatRuntime(device.usualAverage)} average)`,
          comparison,
          type: alertType,
          acknowledged: false,
        })
      }
    }
  })

  return [...existingAlerts, ...newAlerts]
}

// Format runtime from minutes to human readable
export function formatRuntime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`
  }
  return `${hours}h ${remainingMinutes}m`
}

// Calculate dynamic carbon savings based on device usage
export function calculateCarbonSavings(devices: Device[]): number {
  let totalSavings = 15.2 // base savings

  devices.forEach((device) => {
    if (!device.status) {
      // Add savings for turned off devices
      switch (device.baseUsage) {
        case "High":
          totalSavings += 0.8
          break
        case "Medium":
          totalSavings += 0.5
          break
        case "Low":
          totalSavings += 0.2
          break
      }
    } else if (device.runtime > device.threshold) {
      // Reduce savings for devices running too long
      totalSavings -= 0.3
    }
  })

  return Math.max(0, Math.round(totalSavings * 10) / 10)
}

// Calculate green score based on usage patterns
export function calculateGreenScore(devices: Device[], alerts: Alert[]): number {
  let score = 100

  // Deduct points for devices running too long
  devices.forEach((device) => {
    if (device.status && device.runtime > device.threshold) {
      const overageRatio = device.runtime / device.threshold
      score -= Math.min(20, overageRatio * 5)
    }
  })

  // Deduct points for unacknowledged alerts
  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)
  score -= unacknowledgedAlerts.length * 5

  // Add points for turned off devices
  const offDevices = devices.filter((device) => !device.status)
  score += offDevices.length * 2

  return Math.max(0, Math.min(100, Math.round(score)))
}
