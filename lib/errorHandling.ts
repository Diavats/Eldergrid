// Error handling utilities for graceful offline/API failure states
export interface ErrorState {
  isOffline: boolean
  hasApiError: boolean
  lastSyncTime: string | null
  errorMessage: string | null
}

// Authentication error types
export interface AuthError {
  type: 'signup' | 'login' | 'logout' | 'session' | 'redirect'
  message: string
  details?: any
  timestamp: string
}

// Routing error types
export interface RoutingError {
  type: 'redirect' | 'navigation' | 'session_check'
  message: string
  from: string
  to: string
  timestamp: string
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

// Authentication error logging and handling
export function logAuthError(error: AuthError): void {
  console.error(`[AUTH ERROR] ${error.type.toUpperCase()}:`, {
    message: error.message,
    details: error.details,
    timestamp: error.timestamp
  })
  
  // Store in localStorage for debugging
  try {
    const existingErrors = JSON.parse(localStorage.getItem('eldergrid_auth_errors') || '[]')
    existingErrors.push(error)
    // Keep only last 10 errors
    if (existingErrors.length > 10) {
      existingErrors.splice(0, existingErrors.length - 10)
    }
    localStorage.setItem('eldergrid_auth_errors', JSON.stringify(existingErrors))
  } catch (e) {
    console.error('Failed to store auth error:', e)
  }
}

// Routing error logging and handling
export function logRoutingError(error: RoutingError): void {
  console.error(`[ROUTING ERROR] ${error.type.toUpperCase()}:`, {
    message: error.message,
    from: error.from,
    to: error.to,
    timestamp: error.timestamp
  })
  
  // Store in localStorage for debugging
  try {
    const existingErrors = JSON.parse(localStorage.getItem('eldergrid_routing_errors') || '[]')
    existingErrors.push(error)
    // Keep only last 10 errors
    if (existingErrors.length > 10) {
      existingErrors.splice(0, existingErrors.length - 10)
    }
    localStorage.setItem('eldergrid_routing_errors', JSON.stringify(existingErrors))
  } catch (e) {
    console.error('Failed to store routing error:', e)
  }
}

// Create auth error
export function createAuthError(
  type: AuthError['type'],
  message: string,
  details?: any
): AuthError {
  return {
    type,
    message,
    details,
    timestamp: new Date().toISOString()
  }
}

// Create routing error
export function createRoutingError(
  type: RoutingError['type'],
  message: string,
  from: string,
  to: string
): RoutingError {
  return {
    type,
    message,
    from,
    to,
    timestamp: new Date().toISOString()
  }
}

// Get user-friendly error message for auth errors
export function getAuthErrorMessage(error: AuthError): string {
  switch (error.type) {
    case 'signup':
      return error.message.includes('already registered') 
        ? 'This email is already registered. Please try logging in instead.'
        : 'Failed to create account. Please check your information and try again.'
    case 'login':
      return error.message.includes('Invalid login credentials')
        ? 'Invalid email or password. Please check your credentials and try again.'
        : 'Login failed. Please try again.'
    case 'logout':
      return 'Logout failed. Please try again.'
    case 'session':
      return 'Session expired. Please log in again.'
    case 'redirect':
      return 'Redirect failed. Please try navigating manually.'
    default:
      return 'An authentication error occurred. Please try again.'
  }
}

// Get user-friendly error message for routing errors
export function getRoutingErrorMessage(error: RoutingError): string {
  switch (error.type) {
    case 'redirect':
      return `Failed to redirect from ${error.from} to ${error.to}. Please try navigating manually.`
    case 'navigation':
      return 'Navigation failed. Please try refreshing the page.'
    case 'session_check':
      return 'Session check failed. Please log in again.'
    default:
      return 'A navigation error occurred. Please try again.'
  }
}

// Clear stored errors (useful for debugging)
export function clearStoredErrors(): void {
  try {
    localStorage.removeItem('eldergrid_auth_errors')
    localStorage.removeItem('eldergrid_routing_errors')
    console.log('Cleared stored errors')
  } catch (e) {
    console.error('Failed to clear stored errors:', e)
  }
}

// Get stored errors for debugging
export function getStoredErrors(): { auth: AuthError[], routing: RoutingError[] } {
  try {
    const authErrors = JSON.parse(localStorage.getItem('eldergrid_auth_errors') || '[]')
    const routingErrors = JSON.parse(localStorage.getItem('eldergrid_routing_errors') || '[]')
    return { auth: authErrors, routing: routingErrors }
  } catch (e) {
    console.error('Failed to get stored errors:', e)
    return { auth: [], routing: [] }
  }
}
