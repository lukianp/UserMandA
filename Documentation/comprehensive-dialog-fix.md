# Comprehensive PowerShellExecutionDialog Fix Guide

## Summary
This document provides complete instructions for adding PowerShellExecutionDialog support to the remaining 11 discovery modules.

## Modules to Fix

1. BackupRecoveryDiscovery
2. CertificateAuthorityDiscovery
3. CertificateDiscovery
4. IdentityGovernanceDiscovery
5. PaloAltoDiscovery
6. SecurityInfrastructureDiscovery
7. SecurityGroupAnalysisDiscovery
8. VirtualizationDiscovery
9. GPODiscovery
10. EnvironmentDetectionDiscovery
11. GCPDiscovery

## Pattern to Apply

### For Each Hook File (`use{Module}DiscoveryLogic.ts`):

#### 1. Add PowerShellLog Import
After existing imports, add:
```typescript
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';
```

#### 2. Add State Management (after `currentTokenRef`)
```typescript
// PowerShell Execution Dialog state
const [logs, setLogs] = useState<PowerShellLog[]>([]);
const [showExecutionDialog, setShowExecutionDialog] = useState(false);
const [isCancelling, setIsCancelling] = useState(false);

const addLog = useCallback((level: PowerShellLog['level'], message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  setLogs(prev => [...prev, { timestamp, level, message }]);
}, []);

const clearLogs = useCallback(() => {
  setLogs([]);
}, []);
```

#### 3. Update `startDiscovery` Function
Add after state updates:
```typescript
// Open PowerShell execution dialog
setShowExecutionDialog(true);
addLog('info', 'Starting {Module} discovery...');
```

#### 4. Update `cancelDiscovery` Function
Wrap with cancellation state:
```typescript
const cancelDiscovery = useCallback(async () => {
  if (!currentTokenRef.current) return;

  setIsCancelling(true);
  addLog('warning', 'Cancelling {Module} discovery...');

  try {
    await window.electron.cancelDiscovery(currentTokenRef.current);
    addLog('info', '{Module} discovery cancelled');
    // ... existing state updates
  } catch (error) {
    console.error('Failed to cancel discovery:', error);
    addLog('error', 'Failed to cancel discovery');
  } finally {
    setIsCancelling(false);
  }
}, [addLog]);
```

#### 5. Update Return Object
Add new properties:
```typescript
return {
  // ... existing properties
  logs,
  clearLogs,
  showExecutionDialog,
  setShowExecutionDialog,
  isCancelling,
};
```

### For Each View File (`{Module}DiscoveryView.tsx`):

#### 1. Add Import
```typescript
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
```

#### 2. Destructure New Hook Properties
```typescript
const {
  // ... existing properties
  logs,
  clearLogs,
  showExecutionDialog,
  setShowExecutionDialog,
  isCancelling,
} = use{Module}DiscoveryLogic();
```

#### 3. Add Dialog Component (before closing `</div>` of main return)
```typescript
{/* PowerShell Execution Dialog */}
<PowerShellExecutionDialog
  isOpen={showExecutionDialog}
  onClose={() => !isRunning && setShowExecutionDialog(false)}
  scriptName="{Module Name} Discovery"
  scriptDescription="Discovering {module description}"
  logs={logs}
  isRunning={isRunning}
  isCancelling={isCancelling}
  progress={progress ? {
    percentage: progress.percentage || progress.overallProgress || progress,
    message: progress.message || 'Processing...'
  } : undefined}
  onStart={startDiscovery}
  onStop={cancelDiscovery}
  onClear={clearLogs}
  showStartButton={false}
/>
```

## Module-Specific Details

### BackupRecoveryDiscovery
- **Script Name**: "Backup Recovery Discovery"
- **Description**: "Discovering backup jobs, recovery points, and backup history"

### CertificateAuthorityDiscovery
- **Script Name**: "Certificate Authority Discovery"
- **Description**: "Discovering certificate authorities and PKI infrastructure"

### CertificateDiscovery
- **Script Name**: "Certificate Discovery"
- **Description**: "Discovering SSL/TLS certificates across infrastructure"

### IdentityGovernanceDiscovery
- **Script Name**: "Identity Governance Discovery"
- **Description**: "Discovering identity governance and access controls"

### PaloAltoDiscovery
- **Script Name**: "Palo Alto Discovery"
- **Description**: "Discovering Palo Alto firewall configurations and security policies"

### SecurityInfrastructureDiscovery
- **Script Name**: "Security Infrastructure Discovery"
- **Description**: "Discovering security infrastructure and controls"

### SecurityGroupAnalysisDiscovery
- **Script Name**: "Security Group Analysis"
- **Description**: "Analyzing security group configurations and permissions"

### VirtualizationDiscovery
- **Script Name**: "Virtualization Discovery"
- **Description**: "Discovering virtualization infrastructure (VMware, Hyper-V)"

### GPODiscovery
- **Script Name**: "GPO Discovery"
- **Description**: "Discovering Group Policy Objects and configurations"

### EnvironmentDetectionDiscovery
- **Script Name**: "Environment Detection"
- **Description**: "Detecting and analyzing environment configuration"

### GCPDiscovery
- **Script Name**: "GCP Discovery"
- **Description**: "Discovering Google Cloud Platform resources"

## Validation Checklist

For each module after applying fixes:

- [ ] Hook file compiles without errors
- [ ] View file compiles without errors
- [ ] PowerShellExecutionDialog is imported
- [ ] All new properties are destructured from hook
- [ ] Dialog component is added before closing div
- [ ] `logs`, `clearLogs`, `showExecutionDialog`, `setShowExecutionDialog`, `isCancelling` are all present
- [ ] Dialog appears when discovery starts
- [ ] Logs are displayed in dialog
- [ ] Cancel button works
- [ ] Dialog closes after completion

## Deployment

After fixing all modules:

```powershell
# Copy all fixed files to deployment directory
cd D:\Scripts\UserMandA
Copy-Item -Path "guiv2\src\renderer\hooks\use*DiscoveryLogic.ts" `
          -Destination "C:\enterprisediscovery\guiv2\src\renderer\hooks\" `
          -Force

Copy-Item -Path "guiv2\src\renderer\views\discovery\*DiscoveryView.tsx" `
          -Destination "C:\enterprisediscovery\guiv2\src\renderer\views\discovery\" `
          -Force

# Rebuild application
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer
npm start
```

## Testing

For each module:

1. Navigate to the module's view
2. Click "Start Discovery"
3. Verify PowerShellExecutionDialog opens
4. Verify logs appear in real-time
5. Verify progress bar updates
6. Test cancel functionality
7. Verify dialog closes after completion
8. Check that results are saved

## Notes

- All hooks already have event-driven architecture (useRef, event listeners)
- All hooks already have `currentTokenRef` for event matching
- Only need to add PowerShellExecutionDialog UI layer
- Pattern is identical for all modules, just swap module names
