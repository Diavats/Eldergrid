# Data Integration Architecture

## Overview

ElderGrid uses a clean separation between mock data (for hackathon/demo purposes) and real government API integration. The system is designed to be **integration-ready** - switching from mock to real data requires no refactoring of widgets or components.

## Current State: Mock Data

### Government Energy Data
- **Source**: Seeded mock data from `public/data/gov_energy_mock.json`
- **Seeding**: Automatically seeded via `scripts/seedApplianceLogs.ts` in development
- **Usage**: All widgets use this as the baseline for energy comparisons

### Data Flow
```
Mock JSON File → Integration Layer → Widgets
     ↓
Supabase Seeding → Appliance Logs → Dashboard
```

## Integration Layer

### `lib/api/govData.ts`
This module provides a clean abstraction for government data:

```typescript
// Current: Uses mock data
const data = await fetchGovernmentEnergyData()

// Future: Switch to real API (no code changes needed)
const data = await fetchGovernmentEnergyData({
  useMockData: false,
  apiEndpoint: 'https://api.gov.energy/data',
  apiKey: process.env.GOV_API_KEY
})
```

### Key Functions
- `fetchGovernmentEnergyData()` - Main data fetcher
- `getGovernmentAverage(appliance)` - Get specific appliance average
- `getGovernmentAveragesMap()` - Get all averages as lookup map
- `configureGovernmentData()` - Switch between mock/real data

## Widgets Using Government Data

### 1. GovDataMock Widget
- **Purpose**: Display government energy reference data
- **Data Source**: Uses integration layer
- **Shows**: Appliance averages, regions, data source indicator

### 2. AnomalyDetector Widget
- **Purpose**: Detect unusual energy usage patterns
- **Logic**: Custom thresholds > Government averages × 2
- **Data Source**: Uses `getGovernmentAveragesMap()`

### 3. EnergySavingsCounter Widget
- **Purpose**: Calculate energy savings vs government averages
- **Data Source**: Uses `getGovernmentAverage()` for comparisons

### 4. CustomThresholds Widget
- **Purpose**: Allow users to set custom energy thresholds
- **Logic**: Overrides government averages when set
- **Storage**: User-specific thresholds in Supabase

## Switching to Real Government API

### Step 1: Configure API
```typescript
// In lib/api/govData.ts
const config = configureGovernmentData({
  useMockData: false,
  apiEndpoint: process.env.GOV_ENERGY_API_ENDPOINT,
  apiKey: process.env.GOV_ENERGY_API_KEY,
  fallbackToMock: true // Fallback to mock if API fails
})
```

### Step 2: Implement API Call
```typescript
// In lib/api/govData.ts - fetchRealGovernmentData()
async function fetchRealGovernmentData(config: GovDataConfig) {
  const response = await fetch(config.apiEndpoint, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
  })
  
  const data = await response.json()
  return data.map(item => ({
    appliance: item.appliance_name,
    avg_usage_minutes: item.average_usage_minutes,
    region: item.region,
    last_updated: item.last_updated,
    source: 'api' as const
  }))
}
```

### Step 3: Update Environment Variables
```bash
# .env.local
GOV_ENERGY_API_ENDPOINT=https://api.gov.energy/data
GOV_ENERGY_API_KEY=your_api_key_here
```

### Step 4: No Widget Changes Needed
All widgets will automatically use the real API data without any code changes.

## Mock Data Structure

### Government Energy Data (`public/data/gov_energy_mock.json`)
```json
[
  {
    "appliance": "Geyser",
    "avg_usage_minutes": 45,
    "region": "Urban",
    "last_updated": "2024-01-01T00:00:00Z"
  },
  {
    "appliance": "Heater", 
    "avg_usage_minutes": 120,
    "region": "Urban",
    "last_updated": "2024-01-01T00:00:00Z"
  }
]
```

### Appliance Logs (Seeded in Supabase)
```sql
-- Automatically seeded in development
INSERT INTO appliance_logs (user_id, appliance, usage_minutes, timestamp)
VALUES 
  ('user_id', 'Geyser', 60, '2024-01-01T08:00:00Z'),
  ('user_id', 'Heater', 90, '2024-01-01T09:00:00Z');
```

## Benefits of This Architecture

### 1. **Hackathon Ready**
- Works immediately with mock data
- No API keys or external dependencies required
- Realistic data for demonstration

### 2. **Production Ready**
- Easy switch to real government APIs
- Fallback mechanisms for API failures
- No widget refactoring needed

### 3. **Maintainable**
- Clear separation of concerns
- Centralized data fetching logic
- Consistent error handling

### 4. **Testable**
- Mock data for consistent testing
- Easy to simulate different scenarios
- No external API dependencies in tests

## Development Workflow

### Adding New Government Data
1. Update `public/data/gov_energy_mock.json`
2. Widgets automatically pick up new data
3. No code changes needed

### Adding New Widgets
1. Import from `lib/api/govData.ts`
2. Use `getGovernmentAverage()` or `getGovernmentAveragesMap()`
3. Widget works with both mock and real data

### Testing API Integration
1. Set `useMockData: false` in config
2. Implement `fetchRealGovernmentData()`
3. Test with real API endpoints
4. Fallback to mock data if API fails

## Future Enhancements

### 1. **Caching Layer**
- Cache government data for performance
- Invalidate cache when data updates
- Offline support for cached data

### 2. **Multiple Data Sources**
- Support multiple government APIs
- Aggregate data from different sources
- Regional data variations

### 3. **Real-time Updates**
- WebSocket connections for live data
- Push notifications for data updates
- Real-time anomaly detection

### 4. **Data Validation**
- Validate government data quality
- Handle malformed API responses
- Data consistency checks

## Conclusion

The current architecture provides a solid foundation for both hackathon demonstrations and production deployment. The integration layer ensures that switching from mock to real government data is seamless and requires no changes to the user interface or widget logic.
