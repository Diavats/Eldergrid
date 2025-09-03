/**
 * Government Data Integration Layer
 * 
 * This module provides a clean abstraction for fetching government energy data.
 * Currently uses mock data seeded in Supabase, but is designed to be easily
 * replaced with real government API endpoints in the future.
 * 
 * Architecture:
 * - Mock data is seeded via scripts/seedApplianceLogs.ts
 * - GovDataMock widget displays this data
 * - This layer provides the interface for future real API integration
 * - No refactoring needed when switching from mock to real data
 */

export interface GovernmentEnergyData {
  appliance: string
  avg_usage_minutes: number
  region: string
  last_updated: string
  source: 'mock' | 'api'
}

export interface GovDataConfig {
  useMockData: boolean
  apiEndpoint?: string
  apiKey?: string
  fallbackToMock: boolean
}

// Default configuration - currently using mock data
const defaultConfig: GovDataConfig = {
  useMockData: true,
  fallbackToMock: true,
  // Future API configuration would go here:
  // apiEndpoint: process.env.GOV_ENERGY_API_ENDPOINT,
  // apiKey: process.env.GOV_ENERGY_API_KEY,
}

/**
 * Fetches government energy data from the configured source
 * Currently returns mock data from Supabase, but can be easily switched to real API
 */
export async function fetchGovernmentEnergyData(
  config: GovDataConfig = defaultConfig
): Promise<GovernmentEnergyData[]> {
  try {
    if (config.useMockData) {
      return await fetchMockGovernmentData()
    } else {
      return await fetchRealGovernmentData(config)
    }
  } catch (error) {
    console.error('Error fetching government energy data:', error)
    
    if (config.fallbackToMock) {
      console.log('Falling back to mock data')
      return await fetchMockGovernmentData()
    }
    
    throw error
  }
}

/**
 * Fetches mock government data from the seeded JSON file
 * This is the current source of truth for government averages
 */
async function fetchMockGovernmentData(): Promise<GovernmentEnergyData[]> {
  try {
    const response = await fetch('/data/gov_energy_mock.json', { 
      cache: 'no-store' 
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch mock data: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Transform to our interface format
    return data.map((item: any) => ({
      appliance: item.appliance,
      avg_usage_minutes: Number(item.avg_usage_minutes) || 0,
      region: item.region || 'Default',
      last_updated: item.last_updated || new Date().toISOString(),
      source: 'mock' as const
    }))
  } catch (error) {
    console.error('Error fetching mock government data:', error)
    throw error
  }
}

/**
 * Future implementation for real government API
 * This function is ready to be implemented when real API endpoints are available
 */
async function fetchRealGovernmentData(config: GovDataConfig): Promise<GovernmentEnergyData[]> {
  if (!config.apiEndpoint) {
    throw new Error('API endpoint not configured')
  }
  
  // TODO: Implement real government API call
  // Example implementation:
  /*
  const response = await fetch(config.apiEndpoint, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Government API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  return data.map((item: any) => ({
    appliance: item.appliance_name,
    avg_usage_minutes: item.average_usage_minutes,
    region: item.region,
    last_updated: item.last_updated,
    source: 'api' as const
  }))
  */
  
  throw new Error('Real government API not yet implemented')
}

/**
 * Gets government average for a specific appliance
 * This is used by widgets like AnomalyDetector and EnergySavingsCounter
 */
export async function getGovernmentAverage(
  appliance: string,
  config: GovDataConfig = defaultConfig
): Promise<number> {
  const data = await fetchGovernmentEnergyData(config)
  
  const applianceData = data.find(
    item => item.appliance.toLowerCase() === appliance.toLowerCase()
  )
  
  return applianceData?.avg_usage_minutes || 0
}

/**
 * Gets all government averages as a lookup map
 * This is used by widgets for efficient lookups
 */
export async function getGovernmentAveragesMap(
  config: GovDataConfig = defaultConfig
): Promise<Record<string, number>> {
  const data = await fetchGovernmentEnergyData(config)
  
  const map: Record<string, number> = {}
  data.forEach(item => {
    map[item.appliance.toLowerCase()] = item.avg_usage_minutes
  })
  
  return map
}

/**
 * Configuration helper for switching between mock and real data
 * Call this function to switch to real API when available
 */
export function configureGovernmentData(config: Partial<GovDataConfig>): GovDataConfig {
  return {
    ...defaultConfig,
    ...config
  }
}

/**
 * Utility to check if we're currently using mock data
 */
export function isUsingMockData(config: GovDataConfig = defaultConfig): boolean {
  return config.useMockData
}

/**
 * Utility to get data source information for display
 */
export function getDataSourceInfo(config: GovDataConfig = defaultConfig): {
  source: 'mock' | 'api'
  description: string
  lastUpdated?: string
} {
  if (config.useMockData) {
    return {
      source: 'mock',
      description: 'Using seeded mock government data for demonstration'
    }
  } else {
    return {
      source: 'api',
      description: 'Using real government API data'
    }
  }
}
