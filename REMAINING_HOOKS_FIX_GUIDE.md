# Remaining Discovery Hooks - Fix Guide

## Status: 13 Hooks Fixed, 12 Remaining

### ✅ Completed Hooks (13)
1. useActiveDirectoryDiscoveryLogic.ts
2. useSharePointDiscoveryLogic.ts
3. useTeamsDiscoveryLogic.ts
4. useExchangeDiscoveryLogic.ts
5. useOneDriveDiscoveryLogic.ts
6. useConditionalAccessDiscoveryLogic.ts
7. useIntuneDiscoveryLogic.ts
8. useHyperVDiscoveryLogic.ts
9. useApplicationDiscoveryLogic.ts
10. useAWSDiscoveryLogic.ts
11. **usePowerPlatformDiscoveryLogic.ts** (just completed)
12. **useSecurityInfrastructureDiscoveryLogic.ts** (just completed)
13. **useOffice365DiscoveryLogic.ts** (just completed)

### ⏳ Remaining Hooks (12)

#### High Priority - Cloud Services (3)
1. **useAWSCloudInfrastructureDiscoveryLogic.ts**
   - Module: AWSCloudInfrastructure
   - Parameters: IncludeEC2, IncludeS3, IncludeRDS, IncludeVPC, IncludeIAM

2. **useGoogleWorkspaceDiscoveryLogic.ts**
   - Module: GoogleWorkspace
   - Parameters: IncludeUsers, IncludeGroups, IncludeDrive, IncludeCalendar, IncludeGmail

#### Medium Priority - Infrastructure (6)
3. **useVMwareDiscoveryLogic.ts**
   - Module: VMware
   - Parameters: IncludeHosts, IncludeVMs, IncludeClusters, IncludeDatastores, IncludeNetworking

4. **useFileSystemDiscoveryLogic.ts**
   - Module: FileSystem
   - Parameters: IncludeShares, IncludePermissions, IncludeLargeFiles, MinimumFileSize

5. **useSQLServerDiscoveryLogic.ts**
   - Module: SQLServer
   - Parameters: IncludeSystemDatabases, IncludeBackupHistory, IncludeDatabaseFiles, IncludeSecurityAudit

6. **useWebServerDiscoveryLogic.ts**
   - Module: WebServer
   - Parameters: IncludeIIS, IncludeApache, IncludeNginx, IncludeApplicationPools

7. **useNetworkDiscoveryLogic.ts**
   - Module: Network
   - Parameters: IncludePingSweep, IncludePortScan, IncludeServiceDetection, IncludeOsDetection

8. **useDomainDiscoveryLogic.ts**
   - Module: Domain
   - Parameters: IncludeUsers, IncludeGroups, IncludeComputers, IncludeOUs

#### Lower Priority - Compliance/Governance (3)
9. **useLicensingDiscoveryLogic.ts**
   - Module: Licensing
   - Parameters: IncludeMicrosoft, IncludeAdobe, IncludeOther, IncludeExpired

10. **useDataLossPreventionDiscoveryLogic.ts**
    - Module: DataLossPrevention
    - Parameters: IncludePolicies, IncludeRules, IncludeIncidents, IncludeReports

11. **useIdentityGovernanceDiscoveryLogic.ts**
    - Module: IdentityGovernance
    - Parameters: IncludeAccessReviews, IncludeEntitlements, IncludeLifecycle, IncludePrivileged

12. **useEDiscoveryLogic.ts**
    - Module: EDiscovery
    - Parameters: IncludeCases, IncludeHolds, IncludeSearches, IncludeExports

---

## Quick Fix Template

For each hook, apply these changes:

### Step 1: Update Imports
```typescript
// ADD these imports
import { useRef } from 'react';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';
```

### Step 2: Add Hook Setup (at top of hook function)
```typescript
const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
const { addResult, getResultsByModuleName } = useDiscoveryStore();
const currentTokenRef = useRef<string | null>(null);
```

### Step 3: Add Previous Results Loader
```typescript
useEffect(() => {
  const previousResults = getResultsByModuleName('ModuleNameDiscovery');
  if (previousResults && previousResults.length > 0) {
    console.log('[ModuleNameHook] Restoring', previousResults.length, 'previous results from store');
    const latestResult = previousResults[previousResults.length - 1];
    setState(prev => ({ ...prev, currentResult: latestResult }));
  }
}, [getResultsByModuleName]);
```

### Step 4: Replace Old Event Listeners
**FIND:**
```typescript
useEffect(() => {
  const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
    if (data.type === 'xxx') {
      // ...
    }
  });
  return () => { if (unsubscribe) unsubscribe(); };
}, [someDependency]); // ❌ WRONG
```

**REPLACE WITH:**
```typescript
useEffect(() => {
  console.log('[ModuleNameHook] Setting up event listeners');

  const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      console.log('[ModuleNameHook] Discovery output:', data.message);
      // Update progress/logs
    }
  });

  const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      console.log('[ModuleNameHook] Discovery complete:', data);

      const result = {
        id: `modulename-discovery-${Date.now()}`,
        name: 'Module Name Discovery',
        moduleName: 'ModuleNameDiscovery',
        displayName: 'Module Name Discovery',
        itemCount: data?.result?.totalItems || 0,
        discoveryTime: new Date().toISOString(),
        duration: data.duration || 0,
        status: 'Completed',
        filePath: data?.result?.outputPath || '',
        success: true,
        summary: `Discovered ${data?.result?.totalItems || 0} items`,
        errorMessage: '',
        additionalData: data.result,
        createdAt: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        result: data.data,
        isDiscovering: false,
        progress: null,
      }));

      addResult(result); // ✅ CRITICAL: Store in discovery store
    }
  });

  const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      console.error('[ModuleNameHook] Discovery error:', data.error);
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        error: data.error,
      }));
    }
  });

  const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      console.log('[ModuleNameHook] Discovery cancelled');
      setState(prev => ({
        ...prev,
        isDiscovering: false,
      }));
    }
  });

  return () => {
    unsubscribeOutput?.();
    unsubscribeComplete?.();
    unsubscribeError?.();
    unsubscribeCancelled?.();
  };
}, []); // ✅ CRITICAL: Empty dependency array
```

### Step 5: Update startDiscovery Function
**FIND:**
```typescript
const startDiscovery = async () => {
  try {
    const result = await window.electronAPI.executeModule({
      modulePath: 'Modules/Discovery/ModuleName.psm1',
      functionName: 'Invoke-Discovery',
      parameters: { ... }
    });
    // ...
  } catch (error) {
    // ...
  }
};
```

**REPLACE WITH:**
```typescript
const startDiscovery = useCallback(async () => {
  if (!selectedSourceProfile) {
    setError('No company profile selected. Please select a profile first.');
    return;
  }

  const token = `modulename-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  currentTokenRef.current = token; // ✅ CRITICAL: Update ref

  setIsDiscovering(true);
  setError(null);

  try {
    console.log('[ModuleNameHook] Starting discovery with token:', token);

    const result = await window.electron.executeDiscovery({
      moduleName: 'ModuleName',
      parameters: {
        IncludeParam1: config.includeParam1,
        IncludeParam2: config.includeParam2,
        // ... module-specific parameters
      },
      executionOptions: {  // ✅ CRITICAL: Execution options
        timeout: config.timeout || 300000,
        showWindow: false,
      },
      executionId: token,  // ✅ CRITICAL: Pass token
    });

    console.log('[ModuleNameHook] Discovery execution initiated:', result);
  } catch (error: any) {
    console.error('[ModuleNameHook] Discovery error:', error);
    setIsDiscovering(false);
    setError(error.message || 'Discovery failed');
    currentTokenRef.current = null;
  }
}, [config, selectedSourceProfile]);
```

### Step 6: Update cancelDiscovery Function
**FIND:**
```typescript
const cancelDiscovery = async () => {
  await window.electronAPI.cancelExecution('some-token');
};
```

**REPLACE WITH:**
```typescript
const cancelDiscovery = useCallback(async () => {
  if (!currentTokenRef.current) return;

  try {
    console.log('[ModuleNameHook] Cancelling discovery:', currentTokenRef.current);
    await window.electron.cancelDiscovery(currentTokenRef.current);

    setTimeout(() => {
      setIsDiscovering(false);
      currentTokenRef.current = null;
    }, 2000);
  } catch (error: any) {
    console.error('[ModuleNameHook] Failed to cancel:', error);
    setIsDiscovering(false);
    currentTokenRef.current = null;
  }
}, []);
```

---

## Module-Specific Parameters Reference

### AWSCloudInfrastructure
```typescript
parameters: {
  IncludeEC2: config.includeEC2,
  IncludeS3: config.includeS3,
  IncludeRDS: config.includeRDS,
  IncludeVPC: config.includeVPC,
  IncludeIAM: config.includeIAM,
  IncludeLambda: config.includeLambda,
  IncludeCloudWatch: config.includeCloudWatch,
}
```

### GoogleWorkspace
```typescript
parameters: {
  IncludeUsers: config.includeUsers,
  IncludeGroups: config.includeGroups,
  IncludeDrive: config.includeDrive,
  IncludeCalendar: config.includeCalendar,
  IncludeGmail: config.includeGmail,
  IncludeMeet: config.includeMeet,
}
```

### VMware
```typescript
parameters: {
  IncludeHosts: config.includeHosts,
  IncludeVMs: config.includeVMs,
  IncludeClusters: config.includeClusters,
  IncludeDatastores: config.includeDatastores,
  IncludeNetworking: config.includeNetworking,
  IncludeResourcePools: config.includeResourcePools,
}
```

### FileSystem
```typescript
parameters: {
  IncludeShares: config.includeShares,
  IncludePermissions: config.includePermissions,
  IncludeLargeFiles: config.includeLargeFiles,
  MinimumFileSize: config.minimumFileSize,
  IncludeHiddenFiles: config.includeHiddenFiles,
}
```

### SQLServer
```typescript
parameters: {
  IncludeSystemDatabases: config.includeSystemDatabases,
  IncludeBackupHistory: config.includeBackupHistory,
  IncludeDatabaseFiles: config.includeDatabaseFiles,
  IncludeSecurityAudit: config.includeSecurityAudit,
  IncludePerformanceMetrics: config.includePerformanceMetrics,
}
```

### WebServer
```typescript
parameters: {
  IncludeIIS: config.includeIIS,
  IncludeApache: config.includeApache,
  IncludeNginx: config.includeNginx,
  IncludeApplicationPools: config.includeApplicationPools,
  IncludeVirtualDirectories: config.includeVirtualDirectories,
}
```

### Network
```typescript
parameters: {
  IncludePingSweep: config.includePingSweep,
  IncludePortScan: config.includePortScan,
  IncludeServiceDetection: config.includeServiceDetection,
  IncludeOsDetection: config.includeOsDetection,
  IncludeTopologyMapping: config.includeTopologyMapping,
}
```

### Domain
```typescript
parameters: {
  IncludeUsers: config.includeUsers,
  IncludeGroups: config.includeGroups,
  IncludeComputers: config.includeComputers,
  IncludeOUs: config.includeOUs,
  IncludeGPOs: config.includeGPOs,
}
```

### Licensing
```typescript
parameters: {
  IncludeMicrosoft: config.includeMicrosoft,
  IncludeAdobe: config.includeAdobe,
  IncludeOther: config.includeOther,
  IncludeExpired: config.includeExpired,
  IncludeUnassigned: config.includeUnassigned,
}
```

### DataLossPrevention
```typescript
parameters: {
  IncludePolicies: config.includePolicies,
  IncludeRules: config.includeRules,
  IncludeIncidents: config.includeIncidents,
  IncludeReports: config.includeReports,
}
```

### IdentityGovernance
```typescript
parameters: {
  IncludeAccessReviews: config.includeAccessReviews,
  IncludeEntitlements: config.includeEntitlements,
  IncludeLifecycle: config.includeLifecycle,
  IncludePrivileged: config.includePrivileged,
}
```

### EDiscovery
```typescript
parameters: {
  IncludeCases: config.includeCases,
  IncludeHolds: config.includeHolds,
  IncludeSearches: config.includeSearches,
  IncludeExports: config.includeExports,
}
```

---

## Testing Checklist

After fixing each hook, verify:
- [ ] `useRef` imported from 'react'
- [ ] `currentTokenRef` declared and used
- [ ] Event listeners have empty dependency array `[]`
- [ ] Event listeners check `data.executionId === currentTokenRef.current`
- [ ] `startDiscovery` sets `currentTokenRef.current = token` BEFORE API call
- [ ] `startDiscovery` uses `window.electron.executeDiscovery()`
- [ ] Includes `executionOptions: { timeout, showWindow }`
- [ ] Includes `executionId: token`
- [ ] `addResult(result)` called in `onDiscoveryComplete` handler
- [ ] `cancelDiscovery` uses `window.electron.cancelDiscovery(token)`
- [ ] Profile check exists: `if (!selectedSourceProfile) return;`
- [ ] Console logging added for debugging

---

## Next Steps

1. **Priority 1 (Cloud):** Fix AWS Cloud Infrastructure, Google Workspace
2. **Priority 2 (Infrastructure):** Fix VMware, FileSystem, SQLServer, WebServer, Network, Domain
3. **Priority 3 (Compliance):** Fix Licensing, DLP, Identity Governance, eDiscovery

Each hook follows the exact same pattern - just update the module name and parameters!
