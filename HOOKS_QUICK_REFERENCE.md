# Discovery Hooks Quick Reference

## useVirtualizationDiscoveryLogic

**File:** `guiv2/src/renderer/hooks/useVirtualizationDiscoveryLogic.ts`
**Module:** `Virtualization`
**Timeout:** 1200 seconds (20 minutes)

### Configuration

```typescript
{
  includeHosts: true,         // Scan virtualization hosts
  includeVMs: true,           // Scan virtual machines
  includeDatastores: true,    // Scan datastores
  includeNetworks: true,      // Scan networks
  includeResourcePools: true, // Scan resource pools
  includeClusters: true,      // Scan clusters
  maxResults: 10000,          // Maximum results
  timeout: 1200,              // Timeout in seconds
  showWindow: false           // Show PowerShell window
}
```

### Results

```typescript
{
  totalHosts: number,
  totalVMs: number,
  totalDatastores: number,
  totalNetworks: number,
  totalResourcePools: number,
  totalClusters: number,
  totalItems: number,
  outputPath: string,
  statistics: {
    totalCPUCores: number,
    totalMemoryGB: number,
    totalStorageTB: number,
    runningVMs: number,
    stoppedVMs: number,
    averageVMsPerHost: number
  }
}
```

### Usage

```typescript
import { useVirtualizationDiscoveryLogic } from '../hooks/useVirtualizationDiscoveryLogic';

const {
  config,
  result,
  isDiscovering,
  progress,
  error,
  startDiscovery,
  cancelDiscovery,
  updateConfig,
  clearError
} = useVirtualizationDiscoveryLogic();

// Update config
updateConfig({ includeHosts: true, maxResults: 5000 });

// Start discovery
startDiscovery();

// Cancel discovery
cancelDiscovery();
```

---

## useWebServerConfigDiscoveryLogic

**File:** `guiv2/src/renderer/hooks/useWebServerConfigDiscoveryLogic.ts`
**Module:** `WebServerConfig`
**Timeout:** 600 seconds (10 minutes)

### Configuration

```typescript
{
  includeIISSites: true,        // Scan IIS sites
  includeIISAppPools: true,     // Scan IIS application pools
  includeIISBindings: true,     // Scan IIS bindings
  includeApacheVHosts: false,   // Scan Apache virtual hosts
  includeNginxServers: false,   // Scan Nginx servers
  includeSSLCertificates: true, // Scan SSL certificates
  maxResults: 5000,             // Maximum results
  timeout: 600,                 // Timeout in seconds
  showWindow: false             // Show PowerShell window
}
```

### Results

```typescript
{
  totalIISSites: number,
  totalAppPools: number,
  totalBindings: number,
  totalApacheVHosts: number,
  totalNginxServers: number,
  totalSSLCertificates: number,
  totalItems: number,
  outputPath: string,
  statistics: {
    totalWebServers: number,
    runningWebServers: number,
    stoppedWebServers: number,
    httpsEnabledSites: number,
    expiredCertificates: number,
    averageAppPoolsPerSite: number
  }
}
```

### Usage

```typescript
import { useWebServerConfigDiscoveryLogic } from '../hooks/useWebServerConfigDiscoveryLogic';

const {
  config,
  result,
  isDiscovering,
  progress,
  error,
  startDiscovery,
  cancelDiscovery,
  updateConfig,
  clearError
} = useWebServerConfigDiscoveryLogic();

// Update config
updateConfig({ includeIISSites: true, maxResults: 3000 });

// Start discovery
startDiscovery();

// Cancel discovery
cancelDiscovery();
```

---

## Common Pattern (Both Hooks)

### Return Object

```typescript
{
  config: ConfigType,           // Current configuration
  result: ResultType | null,    // Discovery results
  isDiscovering: boolean,       // Discovery running state
  progress: {                   // Progress tracking
    current: number,
    total: number,
    message: string,
    percentage: number
  },
  error: string | null,         // Error message
  startDiscovery: () => void,   // Start discovery
  cancelDiscovery: () => void,  // Cancel discovery
  updateConfig: (updates) => void, // Update config
  clearError: () => void        // Clear error
}
```

### Event Handling

Both hooks listen for:
- `onDiscoveryOutput` - Progress messages
- `onDiscoveryComplete` - Success
- `onDiscoveryError` - Errors
- `onDiscoveryCancelled` - Cancellation

### Console Logging

```typescript
[HookName] Loading previous results
[HookName] Setting up event listeners
[HookName] Discovery output: message
[HookName] Discovery completed: data
[HookName] Starting discovery for company: name
[HookName] Parameters: { ... }
[HookName] Discovery execution initiated
[HookName] Discovery error: error
[HookName] Discovery cancelled
[HookName] Cancelling discovery...
```

---

## Deployment

```powershell
# Copy both files
Copy-Item "D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useVirtualizationDiscoveryLogic.ts" `
  -Destination "C:\enterprisediscovery\guiv2\src\renderer\hooks\" -Force

Copy-Item "D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useWebServerConfigDiscoveryLogic.ts" `
  -Destination "C:\enterprisediscovery\guiv2\src\renderer\hooks\" -Force

# Rebuild
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer
npm start
```
