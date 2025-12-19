# Discovery Hooks Event-Driven API Fix Summary

## Fixed Hooks (Complete - 12 total)
1. ✅ useActiveDirectoryDiscoveryLogic.ts
2. ✅ useSharePointDiscoveryLogic.ts
3. ✅ useTeamsDiscoveryLogic.ts
4. ✅ useExchangeDiscoveryLogic.ts
5. ✅ useOneDriveDiscoveryLogic.ts
6. ✅ useConditionalAccessDiscoveryLogic.ts
7. ✅ useIntuneDiscoveryLogic.ts
8. ✅ useHyperVDiscoveryLogic.ts
9. ✅ useApplicationDiscoveryLogic.ts
10. ✅ useAWSDiscoveryLogic.ts
11. ✅ usePowerPlatformDiscoveryLogic.ts
12. ✅ useSecurityInfrastructureDiscoveryLogic.ts

## Remaining Hooks to Fix (13 total)

### High Priority (Cloud/Enterprise Services)
1. ⏳ useOffice365DiscoveryLogic.ts
2. ⏳ useAWSCloudInfrastructureDiscoveryLogic.ts
3. ⏳ useGoogleWorkspaceDiscoveryLogic.ts

### Medium Priority (Infrastructure)
4. ⏳ useVMwareDiscoveryLogic.ts
5. ⏳ useFileSystemDiscoveryLogic.ts
6. ⏳ useSQLServerDiscoveryLogic.ts
7. ⏳ useWebServerDiscoveryLogic.ts
8. ⏳ useNetworkDiscoveryLogic.ts
9. ⏳ useDomainDiscoveryLogic.ts

### Lower Priority (Compliance/Governance)
10. ⏳ useLicensingDiscoveryLogic.ts
11. ⏳ useDataLossPreventionDiscoveryLogic.ts
12. ⏳ useIdentityGovernanceDiscoveryLogic.ts
13. ⏳ useEDiscoveryLogic.ts

## Standard Fix Pattern Applied

### 1. Import Updates
```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';
```

### 2. Hook Setup
```typescript
const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
const { addResult, getResultsByModuleName } = useDiscoveryStore();
const currentTokenRef = useRef<string | null>(null);
```

### 3. Event Listeners (Empty Dependency Array)
```typescript
useEffect(() => {
  const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      // Handle output
    }
  });

  const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      // Create result object
      addResult(result);
    }
  });

  const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      // Handle error
    }
  });

  const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      // Handle cancellation
    }
  });

  return () => {
    unsubscribeOutput?.();
    unsubscribeComplete?.();
    unsubscribeError?.();
    unsubscribeCancelled?.();
  };
}, []); // CRITICAL: Empty array
```

### 4. Start Discovery Method
```typescript
const startDiscovery = useCallback(async () => {
  if (!selectedSourceProfile) {
    setError('No company profile selected');
    return;
  }

  const token = `modulename-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  currentTokenRef.current = token;

  setState(prev => ({ ...prev, isDiscovering: true, error: null }));

  try {
    const result = await window.electron.executeDiscovery({
      moduleName: 'ModuleName',
      parameters: {
        IncludeParam1: config.includeParam1,
        IncludeParam2: config.includeParam2,
      },
      executionOptions: {
        timeout: config.timeout || 300000,
        showWindow: false,
      },
      executionId: token,
    });

    console.log('[ModuleNameHook] Discovery execution initiated:', result);
  } catch (error: any) {
    console.error('[ModuleNameHook] Discovery error:', error);
    setState(prev => ({ ...prev, isDiscovering: false, error: error.message }));
    currentTokenRef.current = null;
  }
}, [config, selectedSourceProfile]);
```

### 5. Cancel Discovery Method
```typescript
const cancelDiscovery = useCallback(async () => {
  if (!currentTokenRef.current) return;

  try {
    await window.electron.cancelDiscovery(currentTokenRef.current);

    setTimeout(() => {
      setState(prev => ({ ...prev, isDiscovering: false }));
      currentTokenRef.current = null;
    }, 2000);
  } catch (error: any) {
    console.error('[ModuleNameHook] Failed to cancel:', error);
    setState(prev => ({ ...prev, isDiscovering: false }));
    currentTokenRef.current = null;
  }
}, []);
```

## Module-Specific Parameters

### Office365
```typescript
parameters: {
  IncludeUsers: config.includeUsers,
  IncludeGuests: config.includeGuests,
  IncludeLicenses: config.includeLicenses,
  IncludeServices: config.includeServices,
  IncludeSecurity: config.includeSecurity,
}
```

### VMware
```typescript
parameters: {
  IncludeHosts: config.includeHosts,
  IncludeVMs: config.includeVMs,
  IncludeClusters: config.includeClusters,
  IncludeDatastores: config.includeDatastores,
}
```

### FileSystem
```typescript
parameters: {
  IncludeShares: config.includeShares,
  IncludePermissions: config.includePermissions,
  IncludeLargeFiles: config.includeLargeFiles,
  MinimumFileSize: config.minimumFileSize,
}
```

### SQLServer
```typescript
parameters: {
  IncludeSystemDatabases: config.includeSystemDatabases,
  IncludeBackupHistory: config.includeBackupHistory,
  IncludeDatabaseFiles: config.includeDatabaseFiles,
  IncludeSecurityAudit: config.includeSecurityAudit,
}
```

### Network
```typescript
parameters: {
  IncludePingSweep: config.includePingSweep,
  IncludePortScan: config.includePortScan,
  IncludeServiceDetection: config.includeServiceDetection,
  IncludeOsDetection: config.includeOsDetection,
}
```

### Domain
```typescript
parameters: {
  IncludeUsers: config.includeUsers,
  IncludeGroups: config.includeGroups,
  IncludeComputers: config.includeComputers,
  IncludeOUs: config.includeOUs,
}
```

## Key Changes Summary

| Change | Before | After |
|--------|--------|-------|
| API Call | `window.electronAPI.executeModule()` | `window.electron.executeDiscovery()` |
| Event Dependencies | `[addResult, addLog]` | `[]` (empty) |
| Event Matching | `data.executionId === currentToken` | `data.executionId === currentTokenRef.current` |
| Result Storage | Missing | `addResult(result)` |
| Token Management | State only | State + Ref (`currentTokenRef.current`) |
| Execution Options | Missing | `{ timeout, showWindow }` |
| Profile Check | Sometimes missing | Always check `selectedSourceProfile` |
| Cancel Method | `cancelExecution()` | `cancelDiscovery()` |

## Files Modified
- D:\Scripts\UserMandA\guiv2\src\renderer\hooks\usePowerPlatformDiscoveryLogic.ts
- D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useSecurityInfrastructureDiscoveryLogic.ts

## Next Steps
Continue fixing remaining 13 hooks using the same pattern.
