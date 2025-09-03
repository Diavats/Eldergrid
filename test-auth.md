# Authentication Flow Testing Guide

## Test Scenarios

### 1. Root Path Redirect (`/`)
1. Navigate to `/` (root) without being logged in
2. **Expected Result**: Should redirect to `/login`
3. Navigate to `/` while logged in
4. **Expected Result**: Should redirect to `/dashboard`

### 2. Signup Flow
1. Navigate to `/signup`
2. Fill in the form with valid data:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Create Account"
4. **Expected Result**: Should redirect to `/dashboard` after successful signup

### 3. Login Flow
1. Navigate to `/login`
2. Fill in the form with the same credentials:
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Sign In"
4. **Expected Result**: Should redirect to `/dashboard` after successful login

### 4. Dashboard Access
1. Navigate directly to `/dashboard` while logged in
2. **Expected Result**: Should show the dashboard with all widgets
3. Refresh the page
4. **Expected Result**: Should remain on `/dashboard` (session persistence)

### 5. Logout Flow
1. From the dashboard, click the "Logout" button
2. **Expected Result**: Should redirect to `/login`

### 6. Protected Route Access
1. While logged out, try to navigate to `/dashboard`
2. **Expected Result**: Should redirect to `/login` (middleware protection)

### 7. Auth Route Protection
1. While logged in, try to navigate to `/login` or `/signup`
2. **Expected Result**: Should redirect to `/dashboard` (middleware protection)

### 8. Session Persistence
1. Login successfully
2. Close the browser tab
3. Open a new tab and navigate to `/dashboard`
4. **Expected Result**: Should show the dashboard (session persisted)

## Error Handling Tests

### 1. Invalid Credentials
1. Try to login with wrong password
2. **Expected Result**: Should show user-friendly error message

### 2. Duplicate Signup
1. Try to signup with an email that already exists
2. **Expected Result**: Should show appropriate error message

### 3. Network Issues
1. Disconnect internet and try to login
2. **Expected Result**: Should show appropriate error message

## Debug Information

- Use the "Show Debug" button on the dashboard to view:
  - Session information
  - Stored authentication errors
  - Stored routing errors
- All errors are logged to console and stored in localStorage for debugging
- Middleware logs all redirects to console for debugging

## Middleware Protection

The middleware now uses a simple cookie-based session check:
- Checks for `sb-access-token` and `sb-refresh-token` cookies
- If both cookies exist, user is considered authenticated
- No external dependencies required - works with existing Supabase client

## Verification Checklist

### Authentication Guard
- [ ] Root path (`/`) redirects to `/login` when not authenticated
- [ ] Root path (`/`) redirects to `/dashboard` when authenticated
- [ ] Protected routes (`/dashboard`, `/profile`) redirect to `/login` when not authenticated
- [ ] Auth routes (`/login`, `/signup`) redirect to `/dashboard` when authenticated
- [ ] Middleware logs all redirects for debugging

### Authentication Flows
- [ ] Signup → `/dashboard` redirect works
- [ ] Login → `/dashboard` redirect works  
- [ ] Refresh on `/dashboard` keeps you on `/dashboard`
- [ ] Logout → `/login` redirect works
- [ ] Session persists across browser tabs/refreshes

### Error Handling
- [ ] Error messages are user-friendly and logged properly
- [ ] Dashboard never stays blank (shows loading state or content)
- [ ] Debug information is accessible and useful

### Data Integration
- [ ] All widgets load properly with mock government data
- [ ] GovDataMock widget shows "Mock Data" indicator
- [ ] AnomalyDetector uses government averages for comparisons
- [ ] EnergySavingsCounter calculates savings vs government averages
- [ ] Integration layer is ready for real API switching

### Widget Functionality
- [ ] MedicationReminders widget works with patient_id linking
- [ ] CustomThresholds widget allows user-specific overrides
- [ ] AnomalyDetector shows alerts for unusual usage
- [ ] EnergySavingsCounter displays savings calculations
- [ ] AIReportWidget generates summary from mock data
- [ ] All widgets handle loading and error states gracefully
