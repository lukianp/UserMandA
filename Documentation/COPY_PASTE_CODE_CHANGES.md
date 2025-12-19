# Copy-Paste Code Changes for Infrastructure Module Integration

This document provides exact code snippets that can be copy-pasted to manually update each hook and view.

## Table of Contents

1. [useFileSystemDiscoveryLogic.ts Changes](#usefilesystemdiscoverylogicts-changes)
2. [FileSystemDiscoveryView.tsx Changes](#filesystemdiscoveryviewtsx-changes)
3. [Universal Hook Changes Pattern](#universal-hook-changes-pattern)
4. [Universal View Changes Pattern](#universal-view-changes-pattern)

---

## useFileSystemDiscoveryLogic.ts Changes

### Change 1: Update Interface (around line 26)

**Find this:**
```typescript
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

  // Configuration
```

**Replace with:**
```typescript
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

  // Configuration
```

### Change 2: Add isCancelling State (around line 120)

**Find this:**
```typescript
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // For event matching
```

**Replace with:**
```typescript
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // For event matching
```

### Change 3: Add clearLogs Function (around line 160)

**Find this:**
```typescript
  // Utility function to add logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
```

**Replace with:**
```typescript
  // Utility function to add logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
```

### Change 4: Update cancelDiscovery (around line 394)

**Find this:**
```typescript
  const cancelDiscovery = useCallback(async () => {
    if (!isRunning || !currentToken) {
      console.warn('[FileSystemDiscoveryHook] Cannot cancel - not running or no token');
      return;
    }

    console.warn('[FileSystemDiscoveryHook] Cancelling discovery...');

    try {
      addLog('Cancelling File System discovery...', 'warning');
      await window.electron.cancelDiscovery(currentToken);
      console.log('[FileSystemDiscoveryHook] Discovery cancellation requested successfully');

      // Set timeout as fallback in case cancelled event doesn't fire
      setTimeout(() => {
        setIsRunning(false);
        setProgress(null);
        setShowExecutionDialog(false);
        setCurrentToken(null);
        currentTokenRef.current = null;
        addLog('File System discovery cancelled', 'warning');
        console.warn('[FileSystemDiscoveryHook] Discovery cancelled (fallback timeout)');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[FileSystemDiscoveryHook]', errorMessage);
      // Reset state even on error
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      currentTokenRef.current = null;
      addLog(`Failed to cancel: ${errorMessage}`, 'error');
    }
  }, [isRunning, currentToken, addLog]);
```

**Replace with:**
```typescript
  const cancelDiscovery = useCallback(async () => {
    if (!isRunning || !currentToken) {
      console.warn('[FileSystemDiscoveryHook] Cannot cancel - not running or no token');
      return;
    }

    setIsCancelling(true);
    console.warn('[FileSystemDiscoveryHook] Cancelling discovery...');

    try {
      addLog('Cancelling File System discovery...', 'warning');
      await window.electron.cancelDiscovery(currentToken);
      console.log('[FileSystemDiscoveryHook] Discovery cancellation requested successfully');

      // Set timeout as fallback in case cancelled event doesn't fire
      setTimeout(() => {
        setIsCancelling(false);
        setIsRunning(false);
        setProgress(null);
        setShowExecutionDialog(false);
        setCurrentToken(null);
        currentTokenRef.current = null;
        addLog('File System discovery cancelled', 'warning');
        console.warn('[FileSystemDiscoveryHook] Discovery cancelled (fallback timeout)');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[FileSystemDiscoveryHook]', errorMessage);
      setIsCancelling(false);
      // Reset state even on error
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      currentTokenRef.current = null;
      addLog(`Failed to cancel: ${errorMessage}`, 'error');
    }
  }, [isRunning, currentToken, addLog]);
```

### Change 5: Update Return Statement (around line 656)

**Find this:**
```typescript
  return {
    result,
    currentResult: result,
    isRunning,
    progress,
    error,
    config,
    setConfig,
    templates,
    selectedTemplate,
    selectTemplate,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    activeTab,
    setActiveTab,
    shares,
    shareFilter,
    setShareFilter,
    filteredShares,
    shareColumnDefs,
    selectedShares,
    setSelectedShares,
    permissions,
    permissionFilter,
    setPermissionFilter,
    filteredPermissions,
    permissionColumnDefs,
    selectedPermissions,
    setSelectedPermissions,
    largeFiles,
    largeFileFilter,
    setLargeFileFilter,
    filteredLargeFiles,
    largeFileColumnDefs,
    selectedLargeFiles,
    setSelectedLargeFiles,
    searchText,
    setSearchText,
    discoveryHistory,
    loadHistory,
    loadHistoryItem,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
  };
```

**Replace with:**
```typescript
  return {
    result,
    currentResult: result,
    isRunning,
    progress,
    error,
    config,
    setConfig,
    templates,
    selectedTemplate,
    selectTemplate,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    activeTab,
    setActiveTab,
    shares,
    shareFilter,
    setShareFilter,
    filteredShares,
    shareColumnDefs,
    selectedShares,
    setSelectedShares,
    permissions,
    permissionFilter,
    setPermissionFilter,
    filteredPermissions,
    permissionColumnDefs,
    selectedPermissions,
    setSelectedPermissions,
    largeFiles,
    largeFileFilter,
    setLargeFileFilter,
    filteredLargeFiles,
    largeFileColumnDefs,
    selectedLargeFiles,
    setSelectedLargeFiles,
    searchText,
    setSearchText,
    discoveryHistory,
    loadHistory,
    loadHistoryItem,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    isCancelling,
    clearLogs,
  };
```

---

## FileSystemDiscoveryView.tsx Changes

### Change 1: Add Import (at top of file)

**Add this import after other imports:**
```typescript
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
```

### Change 2: Destructure Hook Properties

**Find the hook usage (something like):**
```typescript
const {
  result,
  isRunning,
  progress,
  error,
  config,
  // ... other properties ...
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
} = useFileSystemDiscoveryLogic();
```

**Add these two properties:**
```typescript
const {
  result,
  isRunning,
  progress,
  error,
  config,
  // ... other properties ...
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
  isCancelling,
  clearLogs,
} = useFileSystemDiscoveryLogic();
```

### Change 3: Add Dialog Component

**Find the closing tag of the main component (usually `</div>` or `</>` near the end) and add BEFORE it:**

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
    </div>
  );
};
```

---

## Universal Hook Changes Pattern

For ANY other discovery hook that needs integration:

### Pattern 1: Add to Interface

```typescript
  isCancelling: boolean;
  clearLogs: () => void;
```

### Pattern 2: Add State

```typescript
  const [isCancelling, setIsCancelling] = useState(false);
```

### Pattern 3: Add clearLogs Function

```typescript
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
```

### Pattern 4: Wrap cancelDiscovery

**At the START of cancelDiscovery:**
```typescript
setIsCancelling(true);
```

**In the setTimeout callback:**
```typescript
setTimeout(() => {
  setIsCancelling(false);  // ADD THIS FIRST
  setIsRunning(false);
  // ... rest of cleanup
```

**In the catch block:**
```typescript
} catch (error: any) {
  setIsCancelling(false);  // ADD THIS FIRST
  setIsRunning(false);
  // ... rest of error handling
```

### Pattern 5: Add to Return

```typescript
  isCancelling,
  clearLogs,
```

---

## Universal View Changes Pattern

For ANY discovery view that needs integration:

### Pattern 1: Import

```typescript
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
```

### Pattern 2: Destructure

```typescript
  isCancelling,
  clearLogs,
```

### Pattern 3: Add Dialog

```typescript
<PowerShellExecutionDialog
  isOpen={showExecutionDialog}
  onClose={() => !isRunning && setShowExecutionDialog(false)}
  scriptName="[MODULE NAME] Discovery"
  scriptDescription="[DESCRIPTION]"
  logs={logs}
  isRunning={isRunning}
  isCancelling={isCancelling}
  progress={progress ? {
    percentage: progress.percentage || progress.progress || 0,
    message: progress.message || progress.currentOperation || ''
  } : undefined}
  onStart={startDiscovery}
  onStop={cancelDiscovery}
  onClear={clearLogs}
  showStartButton={false}
/>
```

---

## Module-Specific scriptName and scriptDescription Values

| Module | scriptName | scriptDescription |
|--------|------------|-------------------|
| FileSystem | "File System Discovery" | "Discovering file system resources and analyzing shares, permissions, and large files" |
| Network | "Network Discovery" | "Discovering network infrastructure and devices" |
| SQLServer | "SQL Server Discovery" | "Discovering SQL Server instances and databases" |
| VMware | "VMware Discovery" | "Discovering VMware virtual infrastructure" |
| HyperV | "Hyper-V Discovery" | "Discovering Hyper-V virtual machines and hosts" |
| WebServerConfig | "Web Server Configuration Discovery" | "Discovering web server configurations" |
| Domain | "Domain Discovery" | "Discovering Active Directory domain information" |
| DNSDHCP | "DNS/DHCP Discovery" | "Discovering DNS and DHCP server configurations" |
| FileServer | "File Server Discovery" | "Discovering file server resources" |
| Infrastructure | "Infrastructure Discovery" | "Discovering IT infrastructure components" |
| NetworkInfrastructure | "Network Infrastructure Discovery" | "Discovering network infrastructure devices and configurations" |
| PhysicalServer | "Physical Server Discovery" | "Discovering physical server hardware" |
| Printer | "Printer Discovery" | "Discovering network printers and print servers" |
| StorageArray | "Storage Array Discovery" | "Discovering storage arrays and SAN devices" |
| ScheduledTask | "Scheduled Task Discovery" | "Discovering scheduled tasks and automation jobs" |

---

## Testing Each Module

After making changes to a module:

1. **TypeScript Check:**
```powershell
cd D:\Scripts\UserMandA\guiv2
npx tsc --noEmit
```

2. **Build:**
```powershell
cd C:\enterprisediscovery\guiv2
npm run build
```

3. **Visual Test:**
   - Start the application
   - Navigate to the module
   - Click "Start Discovery"
   - Verify dialog opens
   - Verify logs appear
   - Verify cancel button shows "Cancelling..." state
   - Verify clear logs works

---

## Quick Reference: Files to Modify

**15 Hook Files:**
1. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useFileSystemDiscoveryLogic.ts`
2. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useNetworkDiscoveryLogic.ts`
3. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useSQLServerDiscoveryLogic.ts`
4. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useVMwareDiscoveryLogic.ts`
5. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useHyperVDiscoveryLogic.ts`
6. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useWebServerConfigDiscoveryLogic.ts`
7. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useDomainDiscoveryLogic.ts`
8. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useDNSDHCPDiscoveryLogic.ts`
9. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useFileServerDiscoveryLogic.ts`
10. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useInfrastructureDiscoveryLogic.ts`
11. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useNetworkInfrastructureDiscoveryLogic.ts`
12. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\usePhysicalServerDiscoveryLogic.ts`
13. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\usePrinterDiscoveryLogic.ts`
14. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useStorageArrayDiscoveryLogic.ts`
15. `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useScheduledTaskDiscoveryLogic.ts`

**15 View Files:**
1. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\FileSystemDiscoveryView.tsx`
2. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\NetworkDiscoveryView.tsx`
3. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\SQLServerDiscoveryView.tsx`
4. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\VMwareDiscoveryView.tsx`
5. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\HyperVDiscoveryView.tsx`
6. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\WebServerConfigurationDiscoveryView.tsx`
7. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\DomainDiscoveryView.tsx`
8. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\DNSDHCPDiscoveryView.tsx`
9. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\FileServerDiscoveryView.tsx`
10. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\InfrastructureDiscoveryView.tsx`
11. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\NetworkInfrastructureDiscoveryView.tsx`
12. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\PhysicalServerDiscoveryView.tsx`
13. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\PrinterDiscoveryView.tsx`
14. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\StorageArrayDiscoveryView.tsx`
15. `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\ScheduledTaskDiscoveryView.tsx`

