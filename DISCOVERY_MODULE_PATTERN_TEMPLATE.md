# Discovery Module Pattern Template

**Date:** 2025-12-13
**Reference Modules:** `useAzureDiscoveryLogic.ts`, `useApplicationDiscoveryLogic.ts`

## ✅ CORRECT Pattern (Template)

This is the REQUIRED pattern for ALL discovery modules to ensure consistent behavior with event-driven architecture.

---

## 1. Core Imports

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
```

---

## 2. State Management

```typescript
// Execution state
const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
const { addResult } = useDiscoveryStore();

const [isRunning, setIsRunning] = useState(false);
const [isCancelling, setIsCancelling] = useState(false);
const [currentToken, setCurrentToken] = useState<string | null>(null);
const currentTokenRef = useRef<string | null>(null); // ⚠️ CRITICAL: Ref to avoid closure issues
const [error, setError] = useState<string | null>(null);
const [results, setResults] = useState<any | null>(null);
const [logs, setLogs] = useState<LogEntry[]>([]);
const [showExecutionDialog, setShowExecutionDialog] = useState(false);

// Configuration state (module-specific)
const [config, setConfig] = useState({
  // Module-specific configuration
});
```

---

## 3. Event Listeners Setup (CRITICAL)

**⚠️ MUST use empty dependency array and currentTokenRef for event matching**

```typescript
// Event listeners for PowerShell streaming - Set up ONCE on mount
useEffect(() => {
  console.log('[ModuleNameHook] Setting up event listeners');

  const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
    // ⚠️ CRITICAL: Check against currentTokenRef, NOT currentToken state
    if (data.executionId === currentTokenRef.current) {
      const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warn' : 'info';
      addLog(logLevel, data.message);
    }
  });

  const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      setIsRunning(false);
      setIsCancelling(false);
      setCurrentToken(null);

      const result = {
        id: `module-name-discovery-${Date.now()}`,
        name: 'Module Name Discovery',
        moduleName: 'ModuleName',
        displayName: 'Module Name Discovery',
        itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
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
      addResult(result);
      addLog('info', `Discovery completed! Found ${result.itemCount} items.`);
    }
  });

  const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      setIsRunning(false);
      setError(data.error);
      addLog('error', `Discovery failed: ${data.error}`);
    }
  });

  const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
    if (data.executionId === currentTokenRef.current) {
      setIsRunning(false);
      setIsCancelling(false);
      setCurrentToken(null);
      addLog('warn', 'Discovery cancelled by user');
    }
  });

  // ⚠️ CRITICAL: Cleanup function to unsubscribe
  return () => {
    unsubscribeOutput?.();
    unsubscribeComplete?.();
    unsubscribeError?.();
    unsubscribeCancelled?.();
  };
}, []); // ⚠️ CRITICAL: Empty dependency array - set up once on mount
```

---

## 4. Start Discovery Function

```typescript
const startDiscovery = useCallback(async () => {
  if (isRunning) return;

  // Validate profile selected
  if (!selectedSourceProfile) {
    const errorMessage = 'No company profile selected. Please select a profile first.';
    setError(errorMessage);
    addLog('error', errorMessage);
    return;
  }

  // Reset state
  setIsRunning(true);
  setIsCancelling(false);
  setError(null);
  setResults(null);
  setLogs([]);
  setShowExecutionDialog(true);

  // Generate unique execution token
  const token = `module-name-discovery-${Date.now()}`;
  setCurrentToken(token);
  currentTokenRef.current = token; // ⚠️ CRITICAL: Update ref

  addLog('info', `Starting discovery for ${selectedSourceProfile.companyName}...`);

  try {
    // ✅ CORRECT: Use window.electron.executeDiscovery
    const result = await window.electron.executeDiscovery({
      moduleName: 'ModuleName',  // PowerShell module name (e.g., 'Azure', 'Application')
      parameters: {
        // Module-specific parameters
        IncludeOption1: config.includeOption1,
        IncludeOption2: config.includeOption2,
        MaxResults: config.maxResults,
      },
      executionOptions: {
        timeout: 300000,      // 5 minutes (or module-specific)
        showWindow: false,    // false = integrated dialog, true = external PowerShell window
      },
      executionId: token,     // ⚠️ CRITICAL: Pass token for event matching
    });

    console.log('[ModuleNameHook] Discovery execution completed:', result);
    addLog('info', 'Discovery execution call completed');

    // Note: Completion will be handled by the discovery:complete event listener
  } catch (err: any) {
    const errorMessage = err.message || 'Unknown error occurred during discovery';
    setError(errorMessage);
    addLog('error', errorMessage);
    setIsRunning(false);
    setCurrentToken(null);
  }
}, [isRunning, config, selectedSourceProfile, addLog, addResult]);
```

---

## 5. Cancel Discovery Function

```typescript
const cancelDiscovery = useCallback(async () => {
  if (!isRunning || !currentToken) return;

  setIsCancelling(true);
  addLog('warn', 'Cancelling discovery...');

  try {
    await window.electron.cancelDiscovery(currentToken);
    addLog('info', 'Discovery cancellation requested successfully');

    // Set timeout as fallback in case cancelled event doesn't fire
    setTimeout(() => {
      setIsRunning(false);
      setIsCancelling(false);
      setCurrentToken(null);
      addLog('warn', 'Discovery cancelled - reset to start state');
    }, 2000);
  } catch (err: any) {
    const errorMessage = err.message || 'Error cancelling discovery';
    addLog('error', errorMessage);
    // Reset state even on error
    setIsRunning(false);
    setIsCancelling(false);
    setCurrentToken(null);
  }
}, [isRunning, currentToken, addLog]);
```

---

## 6. Export Hook Interface

```typescript
return {
  // State
  isRunning,
  isCancelling,
  error,
  results,
  logs,
  config,
  showExecutionDialog,
  selectedProfile: selectedSourceProfile,

  // Actions
  startDiscovery,
  cancelDiscovery,
  updateConfig: (updates: any) => setConfig(prev => ({ ...prev, ...updates })),
  setShowExecutionDialog,
  clearLogs: () => setLogs([]),

  // View compatibility (if needed)
  isDiscovering: isRunning,
  currentResult: results,
};
```

---

## ❌ ANTI-PATTERNS (DO NOT USE)

### 1. Using Old `executeDiscoveryModule` API

```typescript
// ❌ WRONG - Old synchronous API without events
const result = await window.electronAPI.executeDiscoveryModule(
  'ModuleName',
  companyName,
  { param1: value1 },
  { timeout: 30000 }
);
```

**Why it's wrong:**
- No event streaming (onDiscoveryOutput, onDiscoveryProgress)
- No real-time updates
- Doesn't follow new architecture

### 2. Missing currentTokenRef

```typescript
// ❌ WRONG - Using state instead of ref in event listeners
const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
  if (data.executionId === currentToken) {  // ❌ Closure issue!
    // ...
  }
});
```

**Why it's wrong:**
- `currentToken` is captured in closure, won't update
- Events will be missed after token changes

### 3. Event Listeners with Dependencies

```typescript
// ❌ WRONG - Re-registering event listeners on every state change
useEffect(() => {
  const unsub = window.electron?.onDiscoveryComplete?.((data) => {
    // ...
  });
  return () => unsub?.();
}, [currentToken, isRunning]); // ❌ Dependencies cause re-registration!
```

**Why it's wrong:**
- Event listeners get unsubscribed and re-subscribed constantly
- Race conditions and missed events

### 4. Missing Cleanup

```typescript
// ❌ WRONG - No cleanup function
useEffect(() => {
  window.electron?.onDiscoveryComplete?.((data) => {
    // ...
  });
  // ❌ No return cleanup!
}, []);
```

**Why it's wrong:**
- Memory leaks from event listeners
- Multiple subscriptions on component remount

### 5. Incorrect Parameter Structure

```typescript
// ❌ WRONG - Mixing parameter styles
await window.electron.executeDiscovery({
  moduleName: 'Azure',
  configuration: { /* ... */ },  // ❌ Should be 'parameters'
  options: { /* ... */ },        // ❌ Should be 'executionOptions'
});
```

---

## Module-Specific Configuration Examples

### Cloud Modules (Azure, Application, Office365)
```typescript
parameters: {
  IncludeUsers: true,
  IncludeGroups: true,
  IncludeTeams: false,
  MaxResults: 50000,
}
```

### Infrastructure Modules (ActiveDirectory, FileSystem)
```typescript
parameters: {
  IncludeComputers: true,
  IncludeServers: true,
  ScanDepth: 5,
  TargetPath: 'C:\\Data',
}
```

### Network Modules (HyperV, VMware)
```typescript
parameters: {
  IncludeVMs: true,
  IncludeHosts: true,
  IncludeNetworks: true,
  ClusterName: 'prod-cluster',
}
```

---

## Testing Checklist

Before marking a module as "fixed", verify:

- [ ] Uses `window.electron.executeDiscovery()` (not old API)
- [ ] Has `currentTokenRef` and updates it before execution
- [ ] Event listeners use `currentTokenRef.current` (not state)
- [ ] Event listeners have empty dependency array `[]`
- [ ] All event listeners are cleaned up in return function
- [ ] Passes `executionId: token` in executeDiscovery call
- [ ] Has proper error handling in try/catch
- [ ] Resets state correctly on error/cancel/complete
- [ ] Opens execution dialog (`setShowExecutionDialog(true)`)
- [ ] Logs to UI with `addLog()` function

---

## Priority for Fixes

**HIGH Priority** (user-facing, frequently used):
- Azure Discovery
- Application Discovery
- Active Directory Discovery
- SharePoint Discovery
- Exchange Discovery
- Teams Discovery

**MEDIUM Priority** (infrastructure):
- HyperV Discovery
- VMware Discovery
- SQL Server Discovery
- File System Discovery

**LOW Priority** (specialized):
- Network Discovery modules
- Security-specific modules
- Compliance modules

---

## Summary

The key architectural requirements are:

1. **Event-driven**: Use `window.electron.executeDiscovery()` with event listeners
2. **Token matching**: Use `currentTokenRef` for event filtering
3. **Single registration**: Event listeners registered once with empty deps
4. **Proper cleanup**: Unsubscribe all listeners in return function
5. **Consistent structure**: Follow the template exactly for all modules

Any module not following this pattern will have broken real-time updates, potential memory leaks, and inconsistent behavior.
