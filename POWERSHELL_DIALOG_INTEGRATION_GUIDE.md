# PowerShellExecutionDialog Integration Guide for Infrastructure Modules

## Overview

This document provides the complete implementation pattern for integrating PowerShellExecutionDialog into all Infrastructure discovery modules.

## Files Modified

### Infrastructure Hooks (15 modules)
1. useFileSystemDiscoveryLogic.ts
2. useNetworkDiscoveryLogic.ts
3. useSQLServerDiscoveryLogic.ts
4. useVMwareDiscoveryLogic.ts
5. useHyperVDiscoveryLogic.ts
6. useWebServerConfigDiscoveryLogic.ts
7. useDomainDiscoveryLogic.ts
8. useDNSDHCPDiscoveryLogic.ts
9. useFileServerDiscoveryLogic.ts
10. useInfrastructureDiscoveryLogic.ts
11. useNetworkInfrastructureDiscoveryLogic.ts
12. usePhysicalServerDiscoveryLogic.ts
13. usePrinterDiscoveryLogic.ts
14. useStorageArrayDiscoveryLogic.ts
15. useScheduledTaskDiscoveryLogic.ts

### Infrastructure Views (15 modules)
1. FileSystemDiscoveryView.tsx
2. NetworkDiscoveryView.tsx
3. SQLServerDiscoveryView.tsx
4. VMwareDiscoveryView.tsx
5. HyperVDiscoveryView.tsx
6. WebServerConfigurationDiscoveryView.tsx (note: Configuration vs Config)
7. DomainDiscoveryView.tsx
8. DNSDHCPDiscoveryView.tsx
9. FileServerDiscoveryView.tsx
10. InfrastructureDiscoveryView.tsx
11. NetworkInfrastructureDiscoveryView.tsx
12. PhysicalServerDiscoveryView.tsx
13. PrinterDiscoveryView.tsx
14. StorageArrayDiscoveryView.tsx
15. ScheduledTaskDiscoveryView.tsx

## Hook Implementation Pattern

### Step 1: Import PowerShellLog Type

```typescript
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';
```

### Step 2: Add to Interface (if hook has an interface)

```typescript
export interface UseModuleDiscoveryLogicReturn {
  // ... existing properties ...
  logs: PowerShellLog[];
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;
  isCancelling: boolean;  // ADD THIS
  clearLogs: () => void;  // ADD THIS
}
```

### Step 3: Add State Variables

After `const currentTokenRef = useRef<string | null>(null);`:

```typescript
const [logs, setLogs] = useState<PowerShellLog[]>([]);
const [showExecutionDialog, setShowExecutionDialog] = useState(false);
const [isCancelling, setIsCancelling] = useState(false);  // ADD THIS
```

### Step 4: Add Helper Functions

After the `addLog` function:

```typescript
const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
  setLogs((prevLogs) => [...prevLogs, newLog]);
}, []);

// ADD THIS:
const clearLogs = useCallback(() => {
  setLogs([]);
}, []);
```

### Step 5: Update startDiscovery

At the beginning of `startDiscovery`, add:

```typescript
const startDiscovery = useCallback(async () => {
  // ... existing validation ...

  setShowExecutionDialog(true);  // ADD THIS
  setIsRunning(true);
  setError(null);
  setLogs([]);
  // ... rest of function ...
}, [/* dependencies */]);
```

### Step 6: Update cancelDiscovery

Wrap the cancel logic with `isCancelling` state:

```typescript
const cancelDiscovery = useCallback(async () => {
  if (!isRunning || !currentToken) return;

  setIsCancelling(true);  // ADD THIS AT START

  try {
    addLog('Cancelling discovery...', 'warning');
    await window.electron.cancelDiscovery(currentToken);

    setTimeout(() => {
      setIsCancelling(false);  // ADD THIS
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      // ... rest of cleanup ...
    }, 2000);
  } catch (error: any) {
    setIsCancelling(false);  // ADD THIS
    setIsRunning(false);
    // ... error handling ...
  }
}, [isRunning, currentToken, addLog]);
```

### Step 7: Update Return Statement

```typescript
return {
  // ... existing properties ...
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
  isCancelling,  // ADD THIS
  clearLogs,     // ADD THIS
};
```

## View Implementation Pattern

### Step 1: Import PowerShellExecutionDialog

```typescript
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
```

### Step 2: Destructure from Hook

```typescript
const {
  // ... existing properties ...
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
  isCancelling,  // ADD THIS
  clearLogs,     // ADD THIS
} = useModuleDiscoveryLogic();
```

### Step 3: Add Dialog Component

Before the closing `</div>` of the main component:

```typescript
<PowerShellExecutionDialog
  isOpen={showExecutionDialog}
  onClose={() => !isRunning && setShowExecutionDialog(false)}
  scriptName="[Module Name] Discovery"
  scriptDescription="Discovering [module name] resources"
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

## Module-Specific Script Names

Use these specific names for each module:

| Module | Script Name |
|--------|-------------|
| FileSystem | "File System Discovery" |
| Network | "Network Discovery" |
| SQLServer | "SQL Server Discovery" |
| VMware | "VMware Discovery" |
| HyperV | "Hyper-V Discovery" |
| WebServerConfig | "Web Server Configuration Discovery" |
| Domain | "Domain Discovery" |
| DNSDHCP | "DNS/DHCP Discovery" |
| FileServer | "File Server Discovery" |
| Infrastructure | "Infrastructure Discovery" |
| NetworkInfrastructure | "Network Infrastructure Discovery" |
| PhysicalServer | "Physical Server Discovery" |
| Printer | "Printer Discovery" |
| StorageArray | "Storage Array Discovery" |
| ScheduledTask | "Scheduled Task Discovery" |

## Progress Mapping Examples

### For hooks with simple progress object:

```typescript
progress={progress ? {
  percentage: progress.percentage || 0,
  message: progress.message || ''
} : undefined}
```

### For hooks with complex progress object:

```typescript
progress={progress ? {
  percentage: progress.percentage || progress.progress || 0,
  message: progress.message || progress.currentOperation || progress.currentPhase || ''
} : undefined}
```

## Testing Checklist

After implementing for each module:

- [ ] Hook loads without TypeScript errors
- [ ] Hook exports isCancelling and clearLogs
- [ ] View imports PowerShellExecutionDialog component
- [ ] View destructures isCancelling and clearLogs from hook
- [ ] Dialog renders when discovery starts
- [ ] Logs appear in real-time during discovery
- [ ] Progress updates show correctly
- [ ] Cancel button works and shows "Cancelling..." state
- [ ] Clear logs button works
- [ ] Dialog can be closed when discovery is not running
- [ ] Dialog prevents closing when discovery is running

## Common Pitfalls

1. **Missing clearLogs in return statement** - Always add to hook return
2. **Wrong progress property names** - Check what the hook actually returns (percentage vs progress, message vs currentOperation)
3. **Dialog closes during discovery** - Ensure `onClose={() => !isRunning && setShowExecutionDialog(false)}`
4. **Objects rendered as React children** - Use optional chaining: `progress?.message ?? ''`
5. **Duplicate view files** - Check for both `WebServerConfigDiscoveryView.tsx` and `WebServerConfigurationDiscoveryView.tsx`

## Build & Deployment Steps

After making changes:

```powershell
# 1. Copy modified files to deployment
Copy-Item -Path "D:\Scripts\UserMandA\guiv2\src\renderer\hooks\use*DiscoveryLogic.ts" `
          -Destination "C:\enterprisediscovery\guiv2\src\renderer\hooks\" -Force

Copy-Item -Path "D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\*DiscoveryView.tsx" `
          -Destination "C:\enterprisediscovery\guiv2\src\renderer\views\discovery\" -Force

# 2. Build all webpack bundles
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# 3. Launch application
npm start
```

## Reference Implementations

**Working Examples:**
- `useApplicationDiscoveryLogic.ts` - Complete integration with all features
- `useActiveDirectoryDiscoveryLogic.ts` - Complete integration with all features

These files demonstrate the correct pattern and can be used as templates.

