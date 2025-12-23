# Claude Code Debug Fixes Implementation Prompt

## Context
You are Claude Code, an expert software engineer tasked with fixing critical errors in the `/guiv2/` Electron application. The application is an Enterprise Discovery & Migration Suite with React renderer, Node.js main process, and extensive PowerShell integration.

## Console Debug Analysis
From the provided console logs, I've identified these critical issues:

1. **AG Grid Enterprise License Warning**: Missing license key causing console spam
2. **Content Security Policy Warning**: `unsafe-eval` enabled, security risk
3. **File Not Found Error**: `ExternalIdentityDiscovery.csv` missing, causing repeated error logs
4. **Intune Discovery Failure**: Missing credentials (TenantId, ClientId, ClientSecret)
5. **Excessive Re-rendering**: Components re-rendering unnecessarily, causing duplicate logs
6. **Profile Store Issues**: Multiple profile loading calls

## Required Fixes

### 1. Fix Content Security Policy (Security Warning)
**File**: `guiv2/src/index.ts`
**Issue**: Line 57 has `'unsafe-eval'` which triggers security warning
**Fix**: Remove `'unsafe-eval'` and implement proper CSP

```typescript
// BEFORE (line 52-61):
'Content-Security-Policy': [
  "default-src 'self'; " +
  "img-src 'self' data: blob:; " +
  "font-src 'self' data: blob:; " +
  "style-src 'self' 'unsafe-inline'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "connect-src 'self' ws: wss:;"
]

// AFTER:
'Content-Security-Policy': [
  "default-src 'self'; " +
  "img-src 'self' data: blob: https:; " +
  "font-src 'self' data: https:; " +
  "style-src 'self' 'unsafe-inline'; " +
  "script-src 'self'; " +
  "connect-src 'self' ws: wss: https:; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self';"
]
```

### 2. Add AG Grid License Key Configuration
**File**: `guiv2/src/renderer/index.tsx` (or main App component)
**Issue**: AG Grid showing license warnings
**Fix**: Add license key configuration

```typescript
// Add to renderer initialization
import { LicenseManager } from 'ag-grid-enterprise';

// Set license key (get from environment or config)
const agGridLicenseKey = process.env.AG_GRID_LICENSE_KEY || '';
if (agGridLicenseKey) {
  LicenseManager.setLicenseKey(agGridLicenseKey);
} else {
  console.warn('AG Grid Enterprise license key not found. Set AG_GRID_LICENSE_KEY environment variable.');
}
```

### 3. Fix ExternalIdentityDiscovery.csv File Handling
**File**: `guiv2/src/renderer/hooks/useCsvDataLoader.ts`
**Issue**: File not found causing repeated errors
**Fix**: Improve error handling and prevent excessive retries

```typescript
// Modify the loadCsvData function (around line 295-320)
} catch (err) {
  if (isUnmountedRef.current) return;

  const error = err instanceof Error ? err : new Error('Unknown error loading CSV');
  console.error('[useCsvDataLoader] Load error:', error);

  // Special handling for file not found - don't retry
  const isFileNotFound = error.message.includes('ENOENT') || error.message.includes('no such file');
  if (isFileNotFound) {
    console.warn(`[useCsvDataLoader] CSV file not found: ${csvPath} - this is expected if discovery hasn't run`);
    setError(new Error(`Discovery data not available. Run the ${csvPath.replace('Discovery.csv', '')} discovery module first.`));
    setLoading(false);
    loadInProgressRef.current = false;
    onError?.(error);
    return;
  }

  // Retry logic with exponential backoff (only for non-file-not-found errors)
  if (!isRetry && retryCountRef.current < maxRetries) {
    retryCountRef.current++;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 5000);

    console.log(`[useCsvDataLoader] Retry ${retryCountRef.current}/${maxRetries} in ${retryDelay}ms`);

    setTimeout(() => {
      if (!isUnmountedRef.current) {
        loadCsvData(true);
      }
    }, retryDelay);

    return;
  }

  setLoading(false);
  loadInProgressRef.current = false;
  onError?.(error);
}
```

### 4. Fix Intune Discovery Credential Validation
**File**: `guiv2/src/renderer/hooks/useIntuneDiscoveryLogic.ts`
**Issue**: Discovery fails with missing credentials
**Fix**: Better error handling and user guidance

```typescript
// Modify startDiscovery function (around line 211-276)
const startDiscovery = useCallback(async () => {
  if (!selectedSourceProfile) {
    const errorMessage = 'No company profile selected. Please select a profile first.';
    setState(prev => ({ ...prev, error: errorMessage }));
    console.error('[IntuneDiscoveryHook]', errorMessage);
    return;
  }

  // Check for required Intune credentials
  const profile = selectedSourceProfile;
  const hasTenantId = profile.tenantId;
  const hasClientId = profile.clientId || profile.applicationId;
  const hasClientSecret = profile.clientSecret || profile.secretValue;

  if (!hasTenantId || !hasClientId || !hasClientSecret) {
    const missing = [];
    if (!hasTenantId) missing.push('Tenant ID');
    if (!hasClientId) missing.push('Client ID');
    if (!hasClientSecret) missing.push('Client Secret');

    const errorMessage = `Intune discovery requires Azure AD application credentials. Missing: ${missing.join(', ')}. Please configure these in your profile settings.`;
    setState(prev => ({ ...prev, error: errorMessage }));
    console.error('[IntuneDiscoveryHook]', errorMessage);
    return;
  }

  if (state.isDiscovering) return;

  // ... rest of function
}, [selectedSourceProfile, state.config, state.isDiscovering]);
```

### 5. Remove Excessive Debug Logging
**File**: `guiv2/src/renderer/hooks/useDashboardLogic.ts`
**Issue**: Too many console logs
**Fix**: Remove or reduce debug logging

```typescript
// Remove or comment out excessive logging (lines 60, 66, 127)
console.log('[useDashboardLogic] selectedSourceProfile:', selectedSourceProfile);
// Remove this line

const profileName = selectedSourceProfile.companyName;
console.log('[useDashboardLogic] profileName extracted:', profileName);
// Remove this line

console.log('[useDashboardLogic] Profile available, loading dashboard data...');
// Change to debug level or remove
```

**File**: `guiv2/src/renderer/components/organisms/DiscoveredViewTemplate.tsx`
**Issue**: Console logs on every render
**Fix**: Remove render logging

```typescript
// Remove the entire logging block (lines 75-83)
console.log(`[DiscoveredViewTemplate] ========== RENDER START ==========`);
console.log(`[DiscoveredViewTemplate] Title: "${title}"`);
console.log(`[DiscoveredViewTemplate] Data: ${data?.length || 0} rows`);
console.log(`[DiscoveredViewTemplate] Columns: ${columns?.length || 0}`);
console.log(`[DiscoveredViewTemplate] Loading: ${loading}`);
console.log(`[DiscoveredViewTemplate] Error: ${error?.message || 'none'}`);
console.log(`[DiscoveredViewTemplate] SearchText: "${searchText}"`);
console.log(`[DiscoveredViewTemplate] LastRefresh: ${lastRefresh?.toISOString() || 'null'}`);
console.log(`[DiscoveredViewTemplate] ========== RENDER END ==========`);
```

### 6. Fix Component Re-rendering Issues
**File**: `guiv2/src/renderer/hooks/useDashboardLogic.ts`
**Issue**: useEffect dependency causing re-renders
**Fix**: Optimize dependencies

```typescript
// Fix useEffect dependencies (line 137)
useEffect(() => {
  // Only load if we have a profile
  if (!selectedSourceProfile) {
    console.log('[useDashboardLogic] Waiting for profile to be selected...');
    return;
  }

  console.log('[useDashboardLogic] Profile available, loading dashboard data...');
  // Initial load
  loadDashboardData();

  // Auto-refresh every 30 seconds
  const interval = setInterval(() => {
    loadDashboardData();
  }, 30000);

  return () => clearInterval(interval);
}, [selectedSourceProfile?.id, loadDashboardData]); // Use profile ID instead of whole object
```

### 7. Add Environment Variable Support
**File**: `guiv2/src/main/index.ts`
**Issue**: Hard-coded values
**Fix**: Add environment variable support

```typescript
// Add environment variable loading
const AG_GRID_LICENSE_KEY = process.env.AG_GRID_LICENSE_KEY || '';
const CSP_ALLOW_UNSAFE_EVAL = process.env.CSP_ALLOW_UNSAFE_EVAL === 'true';

// Modify CSP based on environment
const scriptSrc = CSP_ALLOW_UNSAFE_EVAL
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self'";

'Content-Security-Policy': [
  "default-src 'self'; " +
  "img-src 'self' data: blob: https:; " +
  "font-src 'self' data: https:; " +
  "style-src 'self' 'unsafe-inline'; " +
  `script-src ${scriptSrc}; ` +
  "connect-src 'self' ws: wss: https:; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self';"
]
```

### 8. Add Error Boundaries
**File**: `guiv2/src/renderer/components/ErrorBoundary.tsx` (create new)
**Issue**: Unhandled errors in discovery components
**Fix**: Add error boundary

```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
          <p className="text-red-600">{this.state.error.message}</p>
          <button
            onClick={this.resetError}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9. Add Graceful Degradation for Missing Data
**File**: `guiv2/src/renderer/hooks/useCsvDataLoader.ts`
**Issue**: Errors when files don't exist
**Fix**: Return empty data gracefully

```typescript
// Add graceful degradation option to CsvLoaderOptions
export interface CsvLoaderOptions {
  // ... existing options
  gracefulDegradation?: boolean; // Return empty data instead of error for missing files
}

// Modify loadCsvData to support graceful degradation
const loadCsvData = async (isRetry = false) => {
  // ... existing code

  try {
    // ... file reading code

    // Check if file exists before reading
    const fs = window.electronAPI.fs;
    const exists = await fs.access(fullPath).then(() => true).catch(() => false);

    if (!exists) {
      if (options.gracefulDegradation) {
        console.warn(`[useCsvDataLoader] File not found, returning empty data: ${fullPath}`);
        if (!isUnmountedRef.current) {
          setData([]);
          setColumns([]);
          setLastRefresh(new Date());
          setError(null);
          setLoading(false);
          loadInProgressRef.current = false;
          onSuccess?.([], []);
        }
        return;
      } else {
        throw new Error(`Discovery data file not found: ${csvPath}`);
      }
    }

    // ... rest of loading logic
  } catch (err) {
    // ... existing error handling
  }
};
```

### 10. Update Profile Store to Prevent Multiple Loads
**File**: `guiv2/src/renderer/store/useProfileStore.ts`
**Issue**: Multiple profile loading calls
**Fix**: Add loading state and prevent duplicate calls

```typescript
// Add loading state to prevent duplicate loads
interface ProfileStoreState {
  // ... existing state
  isLoadingProfiles: boolean;
  profilesLoaded: boolean;
}

// Add to store
const useProfileStore = create<ProfileStoreState & ProfileStoreActions>((set, get) => ({
  // ... existing state
  isLoadingProfiles: false,
  profilesLoaded: false,

  // Modify loadSourceProfiles
  loadSourceProfiles: async () => {
    const { isLoadingProfiles, profilesLoaded } = get();

    if (isLoadingProfiles || profilesLoaded) {
      console.log('[ProfileStore] Profiles already loading or loaded, skipping');
      return;
    }

    set({ isLoadingProfiles: true });

    try {
      // ... existing load logic
      set({ profilesLoaded: true });
    } catch (error) {
      // ... error handling
    } finally {
      set({ isLoadingProfiles: false });
    }
  },
}));
```

## Implementation Order
1. Fix CSP security warning (immediate security fix)
2. Remove excessive logging (reduce console noise)
3. Fix file not found errors (improve UX)
4. Add AG Grid license configuration
5. Fix Intune credential validation
6. Optimize re-rendering
7. Add error boundaries
8. Add graceful degradation
9. Update profile store
10. Add environment variable support

## Testing Instructions
- Run the application and check console for reduced warnings
- Try loading discovery views with missing CSV files
- Attempt Intune discovery without credentials
- Verify AG Grid license warnings are gone
- Check CSP warnings are resolved
- Confirm no excessive re-rendering logs

## Files to Modify
1. `guiv2/src/index.ts` - CSP configuration
2. `guiv2/src/renderer/index.tsx` - AG Grid license
3. `guiv2/src/renderer/hooks/useCsvDataLoader.ts` - File handling
4. `guiv2/src/renderer/hooks/useIntuneDiscoveryLogic.ts` - Credential validation
5. `guiv2/src/renderer/hooks/useDashboardLogic.ts` - Logging and re-rendering
6. `guiv2/src/renderer/components/organisms/DiscoveredViewTemplate.tsx` - Logging
7. `guiv2/src/renderer/store/useProfileStore.ts` - Multiple load prevention
8. `guiv2/src/renderer/components/ErrorBoundary.tsx` - New file for error boundaries

Implement these fixes in order, testing each change to ensure the console errors are resolved.