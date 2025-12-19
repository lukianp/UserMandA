# Discovery Hook Fix Template

## ✅ CORRECT PATTERN (from useAzureDiscoveryLogic.ts)

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export const useModuleNameDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();

  // State
  const [isRunning, setIsRunning] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // ✅ CRITICAL: Ref for event matching

  // Load previous results
  useEffect(() => {
    const previousResults = getResultsByModuleName('ModuleNameDiscovery');
    if (previousResults && previousResults.length > 0) {
      // Restore previous results
    }
  }, [getResultsByModuleName]);

  // ✅ CRITICAL: Event listeners with EMPTY dependency array
  useEffect(() => {
    const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
      if (data.executionId === currentTokenRef.current) {
        // Handle output
      }
    });

    const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setCurrentToken(null);

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

        setResults(result);
        addResult(result); // ✅ CRITICAL: Store in discovery store
      }
    });

    const unsubscribeError = window.electron.onDiscoveryError((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setError(data.error);
      }
    });

    const unsubscribeCancelled = window.electron.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setCurrentToken(null);
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array - set up once on mount

  // Start discovery
  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No company profile selected');
      return;
    }

    setIsRunning(true);
    setError(null);

    const token = `modulename-discovery-${Date.now()}`;
    setCurrentToken(token);
    currentTokenRef.current = token; // ✅ CRITICAL: Update ref for event matching

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'ModuleName',
        parameters: {
          // Module-specific parameters
          IncludeParam1: config.includeParam1,
          IncludeParam2: config.includeParam2,
        },
        executionOptions: {  // ✅ CRITICAL: Execution options
          timeout: 300000,   // 5 minutes default
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // ✅ CRITICAL: Pass token for event matching
      });

      console.log('[ModuleNameHook] Discovery execution initiated:', result);
      // Completion handled by event listener
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setIsRunning(false);
      setCurrentToken(null);
    }
  }, [selectedSourceProfile, config]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    if (!currentToken) return;

    try {
      await window.electron.cancelDiscovery(currentToken);

      setTimeout(() => {
        setIsRunning(false);
        setCurrentToken(null);
      }, 2000);
    } catch (err: any) {
      setIsRunning(false);
      setCurrentToken(null);
    }
  }, [currentToken]);

  return {
    isRunning,
    startDiscovery,
    cancelDiscovery,
    // ... other exports
  };
};
```

## ❌ BROKEN PATTERNS TO FIX

### 1. Old API Usage
```typescript
// ❌ WRONG
const result = await window.electronAPI.executeModule({
  modulePath: 'Modules/Discovery/Module.psm1',
  functionName: 'Invoke-Discovery',
  parameters: { ... }
});

// ❌ WRONG
const result = await window.electronAPI.executeDiscoveryModule(
  'Module',
  companyName,
  { ... },
  { timeout: ... }
);

// ✅ CORRECT
const result = await window.electron.executeDiscovery({
  moduleName: 'Module',
  parameters: { ... },
  executionOptions: { timeout: 300000, showWindow: false },
  executionId: token
});
```

### 2. Wrong Event Listener Dependencies
```typescript
// ❌ WRONG
useEffect(() => {
  // ...event listeners
}, [addResult]); // Dependencies cause re-registration

// ❌ WRONG
useEffect(() => {
  // ...event listeners
}, [addLog, addResult]); // Dependencies cause re-registration

// ✅ CORRECT
useEffect(() => {
  // ...event listeners
}, []); // Empty array - set up once on mount
```

### 3. Missing currentTokenRef
```typescript
// ❌ WRONG - uses state directly
if (data.executionId === currentToken) { }

// ✅ CORRECT - uses ref to avoid stale closures
if (data.executionId === currentTokenRef.current) { }
```

### 4. Missing Result Storage
```typescript
// ❌ WRONG - doesn't store result
setResults(result);

// ✅ CORRECT - stores in discovery store
setResults(result);
addResult(result);
```

### 5. Missing executionOptions
```typescript
// ❌ WRONG
const result = await window.electron.executeDiscovery({
  moduleName: 'Module',
  parameters: { ... },
  executionId: token
});

// ✅ CORRECT
const result = await window.electron.executeDiscovery({
  moduleName: 'Module',
  parameters: { ... },
  executionOptions: {
    timeout: 300000,
    showWindow: false
  },
  executionId: token
});
```

## MODULE-SPECIFIC PARAMETERS

### Cloud Modules (Azure, AWS, GCP)
```typescript
parameters: {
  IncludeUsers: config.includeUsers,
  IncludeGroups: config.includeGroups,
  IncludeResources: config.includeResources,
  MaxResults: config.maxResults,
}
```

### Infrastructure Modules (AD, Exchange, SharePoint)
```typescript
parameters: {
  IncludeUsers: config.includeUsers,
  IncludeGroups: config.includeGroups,
  IncludeComputers: config.includeComputers,
  IncludeOUs: config.includeOUs,
}
```

### Security Modules (DLP, Conditional Access)
```typescript
parameters: {
  IncludePolicies: config.includePolicies,
  IncludeRules: config.includeRules,
  IncludeReports: config.includeReports,
}
```

### Virtualization Modules (Hyper-V, VMware)
```typescript
parameters: {
  IncludeVMs: config.includeVMs,
  IncludeHosts: config.includeHosts,
  IncludeNetworks: config.includeNetworks,
  IncludeStorage: config.includeStorage,
}
```

## CHECKLIST FOR EACH HOOK

- [ ] Import `useRef` from React
- [ ] Add `currentTokenRef = useRef<string | null>(null)`
- [ ] Event listeners have `[]` empty dependency array
- [ ] Event listeners check `data.executionId === currentTokenRef.current`
- [ ] `startDiscovery` updates `currentTokenRef.current = token` BEFORE calling API
- [ ] Use `window.electron.executeDiscovery()` with correct parameters
- [ ] Include `executionOptions: { timeout, showWindow }`
- [ ] Include `executionId: token`
- [ ] Store results via `addResult(result)` in `onDiscoveryComplete`
- [ ] `cancelDiscovery` uses `window.electron.cancelDiscovery(token)`
