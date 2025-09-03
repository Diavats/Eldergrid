// Error handling utilities for graceful offline/API failure states
export interface ErrorState {
  isOffline: boolean
  hasApiError: boolean
  lastSyncTime: string | null
  errorMessage: string | null
}

export interface OfflineData {
  devices: any[]
  carbonSaved: number
  greenScore: number
  alerts: any[]
  lastUpdated: string
}

// Check if browser is online
export function checkOnlineStatus(): boolean {
  return navigator.onLine
}

// Save data to localStorage for offline access
export function saveOfflineData(data: OfflineData): void {
  try {
    localStorage.setItem(
      "eldergrid_offline_data",
      JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString(),
      }),
    )
    console.log("[v0] Data saved for offline access")
  } catch (error) {
    console.error("[v0] Failed to save offline data:", error)
  }
}

// Load data from localStorage when offline
export function loadOfflineData(): OfflineData | null {
  try {
    const data = localStorage.getItem("eldergrid_offline_data")
    if (data) {
      const parsed = JSON.parse(data)
      console.log("[v0] Loaded offline data from:", parsed.lastUpdated)
      return parsed
    }
  } catch (error) {
    console.error("[v0] Failed to load offline data:", error)
  }
  return null
}

// Simulate API call with error handling
export async function simulateApiCall<T>(
  operation: () => Promise<T>,
  fallbackData?: T,
): Promise<{ data: T | null; error: string | null }> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In dev, avoid random failures to reduce noise in DX
    // Keep deterministic success, and use fallback when operation throws

    const data = await operation()
    return { data, error: null }
  } catch (error) {
    console.error("[v0] API call failed:", error)
    return {
      data: fallbackData || null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Format last sync time for display
export function formatLastSync(timestamp: string): string {
  const now = new Date()
  const syncTime = new Date(timestamp)
  const diffMinutes = Math.floor((now.getTime() - syncTime.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}

// Generate senior-friendly error messages
export function getSeniorFriendlyErrorMessage(
  isOffline: boolean,
  hasApiError: boolean,
  lastSyncTime: string | null,
): string {
  if (isOffline) {
    return lastSyncTime
      ? `You're currently offline, but don't worry - your last saved data from ${formatLastSync(lastSyncTime)} is still visible.`
      : "You're currently offline. Please check your internet connection to see the latest data."
  }

  if (hasApiError) {
    return lastSyncTime
      ? `Could not fetch new data right now, but don't worry - your last saved data from ${formatLastSync(lastSyncTime)} is still visible.`
      : "Having trouble connecting to our servers. Please try again in a few moments."
  }

  return ""
}
