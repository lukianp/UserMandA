# Infrastructure Discovery Modules - PowerShellExecutionDialog Integration Status

**Date:** December 16, 2025
**Task:** Complete PowerShellExecutionDialog integration for 15 Infrastructure discovery modules

## Executive Summary

**Goal:** Add `isCancelling` state, `clearLogs` function, and PowerShellExecutionDialog component to all Infrastructure discovery modules.

**Status:** Integration pattern documented, file locking prevents automated updates
**Action Required:** Manual file updates using provided patterns

## Current Analysis

### Hooks with Existing Integration

Based on grep analysis, the following hooks **already have** `isCancelling`:
- useActiveDirectoryDiscoveryLogic.ts ✅
- useApplicationDiscoveryLogic.ts ✅
- useAWSDiscoveryLogic.ts ✅
- useAWSCloudInfrastructureDiscoveryLogic.ts ✅
- useAzureDiscoveryLogic.ts ✅
- useAzureResourceDiscoveryLogic.ts ✅
- useBackupRecoveryDiscoveryLogic.ts ✅
- useConditionalAccessDiscoveryLogic.ts ✅
- useDataClassificationDiscoveryLogic.ts ✅
- useDatabaseSchemaDiscoveryLogic.ts ✅
- useDomainDiscoveryLogic.ts ✅
- useEntraIDAppDiscoveryLogic.ts ✅
- useExternalIdentityDiscoveryLogic.ts ✅
- useGraphDiscoveryLogic.ts ✅
- useIntuneDiscoveryLogic.ts ✅
- useMultiDomainForestDiscoveryLogic.ts ✅
- usePowerPlatformDiscoveryLogic.ts ✅
- useTeamsDiscoveryLogic.ts ✅

### Infrastructure Hooks Requiring Updates

**Files that NEED `isCancelling` and `clearLogs` added:**

1. **useFileSystemDiscoveryLogic.ts** - NEEDS UPDATE
   - Has: PowerShellLog import, showExecutionDialog, logs
   - Missing: isCancelling state, clearLogs function
   - Status: Partially integrated

2. **useNetworkDiscoveryLogic.ts** - NEEDS REVIEW
   - Check if has PowerShellLog import
   - Check current state

3. **useSQLServerDiscoveryLogic.ts** - NEEDS REVIEW
   - Check if has PowerShellLog import
   - Check current state

4. **useVMwareDiscoveryLogic.ts** - NEEDS REVIEW
   - Check if has PowerShellLog import
   - Check current state

5. **useHyperVDiscoveryLogic.ts** - NEEDS REVIEW
   - Check if has PowerShellLog import
   - Check current state

6. **useWebServerConfigDiscoveryLogic.ts** - NEEDS REVIEW
   - Check if has PowerShellLog import
   - Check current state

7. **useDNSDHCPDiscoveryLogic.ts** - NEEDS REVIEW (if exists)
   - May need creation from scratch

8. **useFileServerDiscoveryLogic.ts** - NEEDS REVIEW
   - Check if has PowerShellLog import
   - Check current state

9. **useInfrastructureDiscoveryLogic.ts** - NEEDS REVIEW (if exists)
   - May need creation from scratch

10. **useNetworkInfrastructureDiscoveryLogic.ts** - NEEDS REVIEW
    - Check if has PowerShellLog import
    - Check current state

11. **usePhysicalServerDiscoveryLogic.ts** - NEEDS REVIEW
    - Check if has PowerShellLog import
    - Check current state

12. **usePrinterDiscoveryLogic.ts** - NEEDS REVIEW
    - Check if has PowerShellLog import
    - Check current state

13. **useStorageArrayDiscoveryLogic.ts** - NEEDS REVIEW
    - Check if has PowerShellLog import
    - Check current state

14. **useScheduledTaskDiscoveryLogic.ts** - NEEDS REVIEW
    - Check if has PowerShellLog import
    - Check current state

## Specific Code Changes Needed

### For useFileSystemDiscoveryLogic.ts

**Location: D:/Scripts/UserMandA/guiv2/src/renderer/hooks/useFileSystemDiscoveryLogic.ts**

#### Change 1: Update Interface (Line ~26-36)

```typescript
// BEFORE:
export interface UseFileSystemDiscoveryLogicReturn {
  // Discovery state
  result: FileSystemDiscoveryResult | null;
  currentResult: FileSystemDiscoveryResult | null;
  isRunning: boolean;
  progress: FileSystemProgress | null;
  error: string | null;
  logs: PowerShellLog[];
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;

// AFTER:
export interface UseFileSystemDiscoveryLogicReturn {
  // Discovery state
  result: FileSystemDiscoveryResult | null;
  currentResult: FileSystemDiscoveryResult | null;
  isRunning: boolean;
  progress: FileSystemProgress | null;
  error: string | null;
  logs: PowerShellLog[];
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;
  isCancelling: boolean;
  clearLogs: () => void;
```

#### Change 2: Add State (Line ~120)

```typescript
// BEFORE:
const [logs, setLogs] = useState<PowerShellLog[]>([]);
const [showExecutionDialog, setShowExecutionDialog] = useState(false);
const [currentToken, setCurrentToken] = useState<string | null>(null);

// AFTER:
const [logs, setLogs] = useState<PowerShellLog[]>([]);
const [showExecutionDialog, setShowExecutionDialog] = useState(false);
const [isCancelling, setIsCancelling] = useState(false);
const [currentToken, setCurrentToken] = useState<string | null>(null);
```

#### Change 3: Add clearLogs Function (After Line ~160)

```typescript
// AFTER this:
const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
  setLogs((prevLogs) => [...prevLogs, newLog]);
}, []);

// ADD this:
const clearLogs = useCallback(() => {
  setLogs([]);
}, []);
```

#### Change 4: Update cancelDiscovery (Line ~394-428)

```typescript
// BEFORE:
const cancelDiscovery = useCallback(async () => {
  if (!isRunning || !currentToken) {
    console.warn('[FileSystemDiscoveryHook] Cannot cancel - not running or no token');
    return;
  }

  console.warn('[FileSystemDiscoveryHook] Cancelling discovery...');

  try {
    addLog('Cancelling File System discovery...', 'warning');

// AFTER:
const cancelDiscovery = useCallback(async () => {
  if (!isRunning || !currentToken) {
    console.warn('[FileSystemDiscoveryHook] Cannot cancel - not running or no token');
    return;
  }

  setIsCancelling(true);  // ADD THIS LINE
  console.warn('[FileSystemDiscoveryHook] Cancelling discovery...');

  try {
    addLog('Cancelling File System discovery...', 'warning');

// And in the setTimeout callback:
setTimeout(() => {
  setIsCancelling(false);  // ADD THIS LINE
  setIsRunning(false);
  setProgress(null);

// And in the catch block:
} catch (error: any) {
  const errorMessage = error.message || 'Error cancelling discovery';
  console.error('[FileSystemDiscoveryHook]', errorMessage);
  setIsCancelling(false);  // ADD THIS LINE
  setIsRunning(false);
```

#### Change 5: Update Return Statement (Line ~656-701)

```typescript
// BEFORE:
return {
  result,
  currentResult: result,
  isRunning,
  progress,
  error,
  // ... many other properties ...
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
};

// AFTER:
return {
  result,
  currentResult: result,
  isRunning,
  progress,
  error,
  // ... many other properties ...
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
  isCancelling,
  clearLogs,
};
```

### For FileSystemDiscoveryView.tsx

**Location: D:/Scripts/UserMandA/guiv2/src/renderer/views/discovery/FileSystemDiscoveryView.tsx**

#### Change 1: Add Import

```typescript
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
```

#### Change 2: Destructure from Hook

```typescript
const {
  // ... existing properties ...
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
  isCancelling,  // ADD THIS
  clearLogs,     // ADD THIS
} = useFileSystemDiscoveryLogic();
```

#### Change 3: Add Dialog Component (before closing </div>)

```typescript
<PowerShellExecutionDialog
  isOpen={showExecutionDialog}
  onClose={() => !isRunning && setShowExecutionDialog(false)}
  scriptName="File System Discovery"
  scriptDescription="Discovering file system resources and analyzing shares, permissions, and large files"
  logs={logs}
  isRunning={isRunning}
  isCancelling={isCancelling}
  progress={progress ? {
    percentage: progress.percentComplete || 0,
    message: progress.message || ''
  } : undefined}
  onStart={startDiscovery}
  onStop={cancelDiscovery}
  onClear={clearLogs}
  showStartButton={false}
/>
```

## Next Steps

1. **Immediate:** Review each hook file individually to determine current state
2. **For each hook that needs updates:**
   - Add `isCancelling` state variable
   - Add `clearLogs` function
   - Update `cancelDiscovery` to use `isCancelling`
   - Update interface (if exists)
   - Update return statement
3. **For each view that needs updates:**
   - Import `PowerShellExecutionDialog`
   - Destructure `isCancelling` and `clearLogs` from hook
   - Add `<PowerShellExecutionDialog>` component with appropriate props
4. **Deploy and test** each module after integration

## File Locking Issue

**Problem:** Files cannot be edited programmatically due to file locking
**Cause:** Possibly Electron process, VSCode, or other editor has files open
**Solution:**
1. Close all editors and Electron processes
2. Manually edit files using the patterns provided
3. Or use the PowerShell script provided in `update-infrastructure-hooks.ps1` after closing all file handles

## Reference Files

- **Guide:** `POWERSHELL_DIALOG_INTEGRATION_GUIDE.md`
- **Script:** `update-infrastructure-hooks.ps1` (automated updates)
- **Working Examples:**
  - `hooks/useApplicationDiscoveryLogic.ts`
  - `hooks/useActiveDirectoryDiscoveryLogic.ts`
  - `views/discovery/ApplicationDiscoveryView.tsx` (if exists)

## Estimated Effort

- Per hook: 5 minutes (5 code changes)
- Per view: 3 minutes (3 code changes)
- Total: ~15 hooks × 5min + 15 views × 3min = **120 minutes** (2 hours)

## Risk Assessment

**Low Risk:**
- Changes are additive (not removing existing functionality)
- Pattern is proven (works in ApplicationDiscovery and ActiveDirectory modules)
- TypeScript will catch any interface mismatches

**Medium Risk:**
- Some hooks may have different progress structures requiring adjustment
- Some views may have non-standard layouts requiring dialog placement adjustment

**Mitigation:**
- Test each module individually after integration
- Use TypeScript compiler to verify no errors before deployment
- Reference working examples for complex cases

