# AI AGENT OPERATIONAL PATTERNS

## Context Window Management

**CRITICAL:** Avoid loading large files (>500 lines) to prevent crashes and context exhaustion.

**Strategies:**
- Use `Read` with `offset` and `limit` parameters for large files
- Use `Grep` to find specific sections before reading
- Use `Glob` to locate files before opening
- For modules >1000 lines, use targeted reads around line numbers
- When editing, read only ±50 lines around target section

**Example:**
```typescript
// ❌ WRONG: Loads entire 2000-line file
Read({ file_path: "ApplicationDiscovery.psm1" })

// ✅ CORRECT: Targeted read around line 850
Read({ file_path: "ApplicationDiscovery.psm1", offset: 800, limit: 100 })
```

## Change Tracker File (Crash Recovery)

**Location:** `D:\Scripts\UserMandA\.ai-work-tracker.md`

**Purpose:** Track all changes for crash recovery. When crash occurs, user types "resume where you left off" and agent reads this file.

**Format:**
```markdown
# AI Work Tracker - Last Updated: 2025-12-17 23:15

## Current Task
**Goal:** Fix Application Discovery - results not displaying after successful run
**User Request Summary:** "Discovery completes (250 records, 77s) but results view shows 0 items. Discovered view says hasn't run before."
**Status:** ⏳ In Progress - Added debug logging, waiting for test run

## Recent User Prompts (Compressed)
1. User: "compress claude.local.md, remove fluff, keep technical knowledge"
2. User: "add AI agent patterns for parallel execution, context management, crash recovery, multi-LLM coordination"
3. User: "back to application discovery - console shows completion but results not updating"

## Technical Context
**Issue:** Discovery completes successfully but UI doesn't show results
**Root Cause Hypothesis:** Result object not persisting to Zustand store or moduleName mismatch
**Key Finding:** PowerShell returns `RecordCount: 250`, hook should extract this correctly
**Solution Applied:** Added debug logs to onDiscoveryComplete event handler (lines 150-183)

## Files Modified This Session
1. ✅ D:\Scripts\UserMandA\claude.local.md - Compressed to 487 lines, added AI patterns
2. ✅ D:\Scripts\UserMandA\.ai-work-tracker.md - Created tracker file
3. ✅ D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useApplicationDiscoveryLogic.ts - Debug logs (line 150-183)

## Next Steps
- [ ] User runs discovery again with debug logs
- [ ] Analyze console output for data.result structure
- [ ] Identify if issue is: data extraction, store persistence, or view loading
- [ ] Fix root cause based on debug output

## Deployment Status
- Last deployment: 2025-12-17 23:22
- Deployed files: useApplicationDiscoveryLogic.ts → C:\enterprisediscovery\
- Build status: ✅ All 3 bundles (main: 2.3s, preload: 0.4s, renderer: 11s)
- App status: ✅ Launched, awaiting test
```

**Update after every file modification:**
```typescript
// After editing a file, append to tracker
Write({ file_path: "D:\\Scripts\\UserMandA\\.ai-work-tracker.md", append: true })
```

## Parallel Agent Execution

**Use Task tool with parallel agents for max efficiency:**

```typescript
// ✅ CORRECT: Launch 3 agents in parallel (single message, multiple tool calls)
Task({ subagent_type: "Explore", prompt: "Find all hooks with event listener patterns", description: "Scan hooks" })
Task({ subagent_type: "Explore", prompt: "Find all PowerShell modules with .Count errors", description: "Scan modules" })
Task({ subagent_type: "general-purpose", prompt: "Validate TypeScript types in discovery hooks", description: "Type check" })

// Send all 3 Task calls in ONE message for parallel execution
```

**When to parallelize:**
- Searching multiple directories
- Validating multiple files
- Fixing similar issues across multiple modules
- Reading multiple independent files

**When NOT to parallelize:**
- Sequential edits to same file
- Build processes (must be sequential)
- Deployment steps that depend on each other

## Multi-LLM Workflow (Claude Code + Roo Code)

**Common Scenario:** Claude Code works on discovery hooks, Roo Code fixes bugs in workspace simultaneously.

**Conflict Avoidance Strategy:**

1. **File-Level Locking Pattern:**
```markdown
# .ai-work-tracker.md

## Active File Locks
**Claude Code:**
- D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useFileSystemDiscoveryLogic.ts (LOCKED until 23:30)
- D:\Scripts\UserMandA\Modules\Discovery\ApplicationDiscovery.psm1 (LOCKED until 23:45)

**Roo Code:**
- D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\ApplicationDiscoveryView.tsx (LOCKED)
- D:\Scripts\UserMandA\guiv2\src\renderer\components\** (LOCKED - UI components)
```

2. **Directory Partitioning:**
- **Claude Code:** Works in `hooks/`, `Modules/Discovery/`
- **Roo Code:** Works in `views/`, `components/`, `services/`

3. **Before making changes, check tracker:**
```bash
# Quick check if file is locked by another agent
grep -i "filename" .ai-work-tracker.md
```

4. **After completing work, release locks:**
```markdown
## Completed (Locks Released)
- D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useFileSystemDiscoveryLogic.ts ✅ (Claude Code - 23:25)
```

## Recovery from Crash

**User command:** "resume where you left off"

**Agent actions:**
1. Read `.ai-work-tracker.md` immediately
2. Check "Files Modified This Session" for last known state
3. Check "Next Steps" for planned actions
4. If file was IN PROGRESS, read that file with targeted offset/limit
5. Continue from last known checkpoint

**Example recovery:**
```typescript
// User: "resume where you left off"

Read({ file_path: "D:\\Scripts\\UserMandA\\.ai-work-tracker.md" })
// Sees: useSQLServerDiscoveryLogic.ts IN PROGRESS (line 245)

Read({ file_path: "D:\\Scripts\\UserMandA\\guiv2\\src\\renderer\\hooks\\useSQLServerDiscoveryLogic.ts",
      offset: 200, limit: 100 })
// Resume work at line 245
```

---

# CRITICAL BUILD & DEPLOYMENT

## Directory Structure
- **Workspace:** `D:\Scripts\UserMandA\` - Development work
- **Deployment:** `C:\enterprisediscovery\` - Production build & execution
- **ALWAYS BUILD IN DEPLOYMENT DIRECTORY**

## Build Process (3 Webpack Bundles Required)

```powershell
# COMPLETE BUILD WORKFLOW
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path '.webpack') { Remove-Item -Recurse -Force '.webpack' }

# Build ALL THREE bundles (NEVER skip preload!)
npm run build:main                                                  # Main process
npx webpack --config webpack.preload.config.js --mode=production   # Preload (CRITICAL!)
npm run build:renderer                                             # Renderer UI

npm start
```

**Note:** `npm run build` only builds main + renderer, NOT preload!

## Workspace ↔ Deployment Sync

```powershell
# After modifying files in workspace, copy to deployment BEFORE building
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\*' -Destination 'C:\enterprisediscovery\guiv2\src\' -Recurse -Force
Copy-Item -Path 'D:\Scripts\UserMandA\Modules\*' -Destination 'C:\enterprisediscovery\Modules\' -Recurse -Force

# After modifying files in deployment, copy back to workspace
Copy-Item -Path 'C:\enterprisediscovery\guiv2\src\*' -Destination 'D:\Scripts\UserMandA\guiv2\src\' -Recurse -Force
Copy-Item -Path 'C:\enterprisediscovery\Modules\*' -Destination 'D:\Scripts\UserMandA\Modules\' -Recurse -Force
```

**CRITICAL:** Always sync between directories. Build in deployment, commit from workspace.

## Common Build Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module preload.js` | Preload not built | `npx webpack --config webpack.preload.config.js --mode=production` |
| Dashboard infinite spinner | Preload missing | Same as above |
| `EBUSY: resource busy` | Electron still running | `Get-Process electron | Stop-Process -Force` |
| Webpack stale cache | Old .webpack dir | `Remove-Item -Recurse -Force '.webpack'` |

---

# Discovery Module Patterns (Application Discovery Reference)

## Critical Checklist

**PowerShell Array Handling:**
- ALL `.Count` accesses wrapped with `@()`: `@($array).Count`
- ALL `Where-Object` results wrapped: `@($items | Where-Object {}).Count`

**File Output:**
- Static filenames: `ModuleName.csv`, `ModuleName.json` (NO timestamps)
- Views expect consistent filenames to load data

**Module Name Consistency:**
- Hook `moduleName` must match `executeDiscovery()` module name
- Example: `moduleName: 'Application'` in both hook and execution

**Function Parameters:**
- Verify parameter names match function signatures
- Use tab completion or check definitions

**Object Properties:**
- Add all required properties during object creation
- Use default values: `Vendor = if ($x) { $x } else { "Unknown" }`

## Performance Patterns

**EnrichmentLevel Parameter:**
```powershell
[ValidateSet('None', 'Basic', 'Full')]
[string]$EnrichmentLevel = 'Basic'

# Basic: Essential data only (75% fewer API calls)
# Full: Complete enrichment for detailed audits
```

**ETA Calculations:**
```powershell
$startTime = Get-Date
if ($processed % 25 -eq 0) {
    $elapsed = (Get-Date) - $startTime
    $avgTime = $elapsed.TotalSeconds / $processed
    $etaSec = [math]::Round(($total - $processed) * $avgTime)
    $etaMin = [math]::Floor($etaSec / 60)
    Write-ModuleLog "Processing $processed of $total (ETA: ${etaMin}m $($etaSec % 60)s)"
}
```

**Reduced Logging (DiscoveryBase.psm1):**
```powershell
# Only log when data retrieved
if ($response.value -and $response.value.Count -gt 0) {
    Write-ModuleLog "Retrieved $($response.value.Count) records from page $pageCount"
}
```

## Critical Errors & Fixes

**Error 0: PowerShell PascalCase vs TypeScript camelCase Property Names**
```typescript
// PowerShell modules return data with PascalCase property names:
// { Subscriptions: [...], VirtualMachines: [...], StorageAccounts: [...] }

// But TypeScript interfaces define camelCase:
// interface AzureResourceDiscoveryResult { virtualMachines?: any[]; storageAccounts?: any[]; }

// ❌ WRONG: TypeScript complains "Property 'Subscriptions' does not exist"
const data = results.data;
if (data.Subscriptions) { ... }  // ERROR!

// ✅ CORRECT: Cast to 'any' when accessing PowerShell PascalCase properties
const data = results.data as any;
if (data.Subscriptions) { ... }  // OK
if (data.VirtualMachines) { ... }  // OK

// Always handle both casings for backwards compatibility:
const vmCount = data.VirtualMachines?.length || data.virtualMachines?.length || 0;
```

**Error 1: `.Count` not found**
```powershell
# ❌ WRONG
$count = $array.Count
$filtered = ($items | Where-Object { $_.Status -eq 'Active' }).Count

# ✅ CORRECT
$count = @($array).Count
$filtered = @($items | Where-Object { $_.Status -eq 'Active' }).Count
```

**Error 2: Parameter name mismatch**
```powershell
# Check function signature before calling
function New-Catalog { param([object[]]$EnrichedApps) }

# ❌ WRONG: New-Catalog -Applications $data
# ✅ CORRECT: New-Catalog -EnrichedApps $data
```

**Error 3: Discovery completes but shows 0 results**
```powershell
# ❌ WRONG: Timestamped filenames
$csvPath = Join-Path $OutputPath "Module_$timestamp.csv"

# ✅ CORRECT: Static filenames
$csvPath = Join-Path $OutputPath "Module.csv"
```

**Error 4: Results don't persist after refresh**
```typescript
// Hook moduleName must match execution moduleName
const result = {
    moduleName: 'Application',  // Must match executeDiscovery({ moduleName: 'Application' })
    displayName: 'Application Discovery'
};
```

## Quick Reference

| Issue | Fix |
|-------|-----|
| `.Count` not found | Wrap with `@()` |
| Parameter mismatch | Check function signature |
| Missing property | Add to object creation with default |
| Results don't load | Use static filename (no timestamp) |
| Results don't persist | Ensure moduleName consistency |
| Slow discovery | Add EnrichmentLevel parameter |
| No progress | Add ETA calculation every 25 items |

---

# PowerShell/GUI Integration Architecture

## Status File Pattern

**Location:** `C:\DiscoveryData\{CompanyName}\Logs\{ScriptName}_status.json`

**Format:**
```json
{
  "status": "running|success|failed",
  "message": "Progress message",
  "step": "StepId",
  "progress": 75,
  "timestamp": "ISO8601",
  "error": "Error message if failed"
}
```

## IPC Architecture

**React Hook** → **IPC Handler** → **Service** → **PowerShell Script**
- Hook polls status file every 500ms
- Service spawns PowerShell with spawn('cmd.exe', args)
- PowerShell writes status JSON + stdout
- Hook detects completion via output files

## PowerShell Script Launch (Visible Window)

```typescript
// CRITICAL: Use array args, NOT string command
const cmdArgs = [
  '/c', 'start',
  '""',  // CRITICAL: Empty title required by Windows start command
  'powershell.exe',
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-NoExit',
  '-File', `"${scriptPath}"`,
  ...scriptArgs
];

spawn('cmd.exe', cmdArgs, {
  detached: true,
  stdio: 'ignore',
  windowsHide: false,
  shell: true  // CRITICAL: Required for 'start' command
});
```

**Common Error:** Missing empty title `""` causes PowerShell not to execute.

---

# Discovery Hook Event-Driven Pattern

## Standard Implementation (All Hooks)

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';

const currentTokenRef = useRef<string | null>(null);

// Event listeners with EMPTY dependency array
useEffect(() => {
  const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
    if (data.executionId === currentTokenRef.current) {
      setIsRunning(false);
      const result = { moduleName: 'ModuleName', ... };
      addResult(result);  // CRITICAL: Persist to store
    }
  });

  return () => { unsubscribeComplete?.(); };
}, []); // ✅ CRITICAL: Empty array prevents stale closures

// Start discovery
const startDiscovery = useCallback(async () => {
  const token = `module-discovery-${Date.now()}`;
  currentTokenRef.current = token;  // BEFORE API call

  await window.electron.executeDiscovery({
    moduleName: 'ModuleName',
    parameters: { ... },
    executionOptions: { timeout: 300000 },
    executionId: token
  });
}, []);

// Cancel discovery
const cancelDiscovery = useCallback(async () => {
  await window.electron.cancelDiscovery(currentTokenRef.current);
}, []);
```

**Key Points:**
- Use `useRef` for token to avoid stale closures
- Event listeners must have empty dependency array `[]`
- Always call `addResult()` to persist to discovery store
- Filter events by `executionId` match

---

# Adding New Discovery Modules - Complete Checklist

**CRITICAL: 4 files must be updated for a new discovery tile to work**

## 1. Discovery Hub Tile (useInfrastructureDiscoveryHubLogic.ts)

Add tile to `defaultDiscoveryModules` array:
```typescript
{
  id: 'module-name',
  name: 'Module Display Name',
  icon: 'IconName',  // Lucide icon name
  description: 'Description shown on hover',
  route: '/discovery/module-name',
  status: 'idle',
},
```

**Location:** `guiv2/src/renderer/hooks/useInfrastructureDiscoveryHubLogic.ts`
**Array order:** Azure/M365 first → AD/on-prem second → rest alphabetical

## 2. Discovery Sidebar (_sidebar.generated.tsx)

Add sidebar entry:
```typescript
{ path: '/discovery/module-name', label: 'Module Name', icon: <IconName size={16} /> },
```

**Location:** `guiv2/src/renderer/views/discovery/_sidebar.generated.tsx`
**Order:** Must match Discovery Hub order

## 3. Route (routes.tsx)

Add route definition:
```typescript
{
  path: '/discovery/module-name',
  element: lazyLoad(() => import('./views/discovery/ModuleNameDiscoveryView')),
},
```

**Location:** `guiv2/src/renderer/routes.tsx`
**CRITICAL:** Without this, clicking tile shows 404!

## 4. Discovery View File

Create view file: `guiv2/src/renderer/views/discovery/ModuleNameDiscoveryView.tsx`

## Optional: Discovered View

If the module outputs CSV data, also create:
- `guiv2/src/renderer/views/discovered/ModuleNameDiscoveredView.tsx`
- Add to `guiv2/src/renderer/views/discovered/_sidebar.generated.tsx`
- Add route in `routes.tsx` for `/discovered/modulename`

## Verification Checklist

```bash
# Verify all 4 locations are updated:
grep -r "module-name" guiv2/src/renderer/hooks/useInfrastructureDiscoveryHubLogic.ts
grep -r "/discovery/module-name" guiv2/src/renderer/views/discovery/_sidebar.generated.tsx
grep -r "/discovery/module-name" guiv2/src/renderer/routes.tsx
ls guiv2/src/renderer/views/discovery/ModuleNameDiscoveryView.tsx
```

---

# Discovery Hooks Validation Status (55+ Modules) - Updated 2025-12-22

## ✅ ALL HOOKS EXIST AND VALIDATED

All discovery hooks now exist and follow the correct event-driven pattern with:
- `useRef` for `currentTokenRef`
- Empty dependency array `[]` for event listeners
- `executionId` matching in event handlers
- `addResult()` call to persist to store

## ✅ Fixed Dependency Array Issues (21 hooks - 2025-12-22)
The following hooks had incorrect useEffect dependency arrays (`[addResult]` or `[addLog, addResult, setProgress]`).
All fixed to use empty array `[]`:

- useApplicationDependencyMappingDiscoveryLogic.ts
- useAzureDeviceDiscoveryLogic.ts
- useAzureInfraDiscoveryLogic.ts
- useAzureM365DiscoveryLogic.ts
- useAzureSecurityDiscoveryLogic.ts
- useBackupRecoveryDiscoveryLogic.ts
- useCertificateAuthorityDiscoveryLogic.ts
- useCertificateDiscoveryLogic.ts
- useDatabaseSchemaDiscoveryLogic.ts
- useDataClassificationDiscoveryLogic.ts
- useDNSDHCPDiscoveryLogic.ts
- useFileServerDiscoveryLogic.ts
- useGPODiscoveryLogic.ts
- useInfrastructureDiscoveryLogic.ts
- useNetworkInfrastructureDiscoveryLogic.ts
- usePaloAltoDiscoveryLogic.ts
- usePanoramaInterrogationDiscoveryLogic.ts
- usePhysicalServerDiscoveryLogic.ts
- useScheduledTaskDiscoveryLogic.ts
- useVirtualizationDiscoveryLogic.ts
- useWebServerConfigDiscoveryLogic.ts

## ✅ Reference Template Hooks
- useApplicationDiscoveryLogic.ts (250 records, 71s, EnrichmentLevel)
- useAzureDiscoveryLogic.ts
- useActiveDirectoryDiscoveryLogic.ts
- useAWSCloudInfrastructureDiscoveryLogic.ts
- useConditionalAccessDiscoveryLogic.ts
- useAzureResourceDiscoveryLogic.ts

## ✅ All Existing Hooks (Complete List - Updated 2025-12-29)
useAWSCloudInfrastructureDiscoveryLogic, useAWSDiscoveryLogic, useActiveDirectoryDiscoveryLogic,
useApplicationDependencyMappingDiscoveryLogic, useApplicationDiscoveryLogic, useAzureDeviceDiscoveryLogic,
useAzureDiscoveryLogic, useAzureInfraDiscoveryLogic, useAzureM365DiscoveryLogic, useAzureResourceDiscoveryLogic,
useAzureSecurityDiscoveryLogic, useAzureServicePrincipalCredentialsDiscoveryLogic, useAzureStorageAccountAccessDiscoveryLogic,
useBackupRecoveryDiscoveryLogic, useCertificateAuthorityDiscoveryLogic,
useCertificateDiscoveryLogic, useConditionalAccessDiscoveryLogic, useDNSDHCPDiscoveryLogic,
useDataClassificationDiscoveryLogic, useDataLossPreventionDiscoveryLogic, useDatabaseSchemaDiscoveryLogic,
useDomainDiscoveryLogic, useEDiscoveryLogic, useEntraIDAppDiscoveryLogic, useEnvironmentDetectionLogic,
useExchangeDiscoveryLogic, useExternalIdentityDiscoveryLogic, useFileServerDiscoveryLogic,
useFileSystemDiscoveryLogic, useGPODiscoveryLogic, useGoogleWorkspaceDiscoveryLogic, useGraphDiscoveryLogic,
useHyperVDiscoveryLogic, useIdentityGovernanceDiscoveryLogic, useInfrastructureDiscoveryLogic,
useIntuneDiscoveryLogic, useLicensingDiscoveryLogic, useMultiDomainForestDiscoveryLogic, useNetworkDiscoveryLogic,
useNetworkInfrastructureDiscoveryLogic, useOffice365DiscoveryLogic, useOneDriveDiscoveryLogic,
usePaloAltoDiscoveryLogic, usePanoramaInterrogationDiscoveryLogic, usePhysicalServerDiscoveryLogic,
usePowerBIDiscoveryLogic, usePowerPlatformDiscoveryLogic, usePrinterDiscoveryLogic, useSQLServerDiscoveryLogic,
useScheduledTaskDiscoveryLogic, useSecurityInfrastructureDiscoveryLogic, useSharePointDiscoveryLogic,
useStorageArrayDiscoveryLogic, useTeamsDiscoveryLogic, useVMwareDiscoveryLogic, useVirtualizationDiscoveryLogic,
useWebServerConfigDiscoveryLogic, useWebServerDiscoveryLogic, useEnvironmentDetectionDiscovery

## ✅ AzureHound Enhancement Hooks (Phase 1-5)
- useAzureVMSSDiscoveryLogic (Phase 1)
- useAzureFunctionsDiscoveryLogic (Phase 1)
- useAzureACRDiscoveryLogic (Phase 1)
- useAzureAutomationDiscoveryLogic (Phase 2)
- useAzureLogicAppsDiscoveryLogic (Phase 2)
- useAzureManagementGroupsDiscoveryLogic (Phase 3)
- useAzurePIMDiscoveryLogic (Phase 3)
- useAzureSubscriptionOwnersDiscoveryLogic (Phase 3)
- useAzureKeyVaultAccessDiscoveryLogic (Phase 4)
- useAzureManagedIdentitiesDiscoveryLogic (Phase 4)
- **useAzureServicePrincipalCredentialsDiscoveryLogic (Phase 5)** - NEW
- **useAzureStorageAccountAccessDiscoveryLogic (Phase 5)** - NEW

---

# PowerShellExecutionDialog Integration Pattern

**Purpose:** Shows real-time PowerShell script output in a dialog when discovery runs, allowing users to monitor progress.

## Hook Changes Required

### 1. Add LogEntry Interface and State Fields

```typescript
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

interface DiscoveryState {
  // ... existing fields ...
  isCancelling: boolean;      // NEW: Track cancel in progress
  logs: LogEntry[];           // NEW: Log entries array
  showExecutionDialog: boolean; // NEW: Dialog visibility
}
```

### 2. Update Initial State

```typescript
const [state, setState] = useState<DiscoveryState>({
  // ... existing fields ...
  isCancelling: false,
  logs: [],
  showExecutionDialog: false,
});
```

### 3. Update onDiscoveryOutput Handler (Add Log Entries)

```typescript
const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
  if (data.executionId === currentTokenRef.current) {
    const message = data.message || '';
    // Determine log level from message content
    let level: LogEntry['level'] = 'info';
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
      level = 'error';
    } else if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('warn')) {
      level = 'warning';
    } else if (message.toLowerCase().includes('success') || message.toLowerCase().includes('complete') || message.toLowerCase().includes('found')) {
      level = 'success';
    }
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, { timestamp: new Date().toISOString(), message, level }],
      progress: { ...prev.progress, message },
    }));
  }
});
```

### 4. Update onDiscoveryComplete Handler (Add Success Log)

```typescript
setState((prev) => ({
  ...prev,
  isDiscovering: false,
  isCancelling: false,
  logs: [...prev.logs, { timestamp: new Date().toISOString(), message: `Discovery completed! Found ${count} items.`, level: 'success' as const }],
  progress: { ... },
}));
```

### 5. Update onDiscoveryError Handler (Add Error Log)

```typescript
setState((prev) => ({
  ...prev,
  isDiscovering: false,
  isCancelling: false,
  error: data.error,
  logs: [...prev.logs, { timestamp: new Date().toISOString(), message: `Error: ${data.error}`, level: 'error' as const }],
  progress: { ... },
}));
```

### 6. Update onDiscoveryCancelled Handler (Add Warning Log)

```typescript
setState((prev) => ({
  ...prev,
  isDiscovering: false,
  isCancelling: false,
  logs: [...prev.logs, { timestamp: new Date().toISOString(), message: 'Discovery cancelled by user', level: 'warning' as const }],
  progress: { ... },
}));
```

### 7. Update startDiscovery (Show Dialog, Clear/Add Initial Log)

```typescript
const startDiscovery = useCallback(async () => {
  // ... validation ...
  setState((prev) => ({
    ...prev,
    isDiscovering: true,
    isCancelling: false,
    error: null,
    logs: [{ timestamp: new Date().toISOString(), message: 'Starting discovery...', level: 'info' as const }],
    showExecutionDialog: true,  // AUTO-OPEN DIALOG
    progress: { ... },
  }));
  // ... rest of function ...
}, []);
```

### 8. Update cancelDiscovery (Set isCancelling, Add Log)

```typescript
const cancelDiscovery = useCallback(async () => {
  if (!state.isDiscovering || !currentTokenRef.current) return;
  setState((prev) => ({
    ...prev,
    isCancelling: true,
    logs: [...prev.logs, { timestamp: new Date().toISOString(), message: 'Cancelling discovery...', level: 'warning' as const }],
  }));
  // ... rest of function ...
}, [state.isDiscovering]);
```

### 9. Add clearLogs and setShowExecutionDialog Functions

```typescript
const clearLogs = useCallback(() => {
  setState((prev) => ({ ...prev, logs: [] }));
}, []);

const setShowExecutionDialog = useCallback((show: boolean) => {
  setState((prev) => ({ ...prev, showExecutionDialog: show }));
}, []);
```

### 10. Update Return Statement

```typescript
return {
  // ... existing fields ...
  isCancelling: state.isCancelling,
  logs: state.logs,
  showExecutionDialog: state.showExecutionDialog,
  clearLogs,
  setShowExecutionDialog,
};
```

## View Changes Required

### 1. Import PowerShellExecutionDialog

```typescript
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
```

### 2. Destructure New Fields from Hook

```typescript
const {
  // ... existing fields ...
  isCancelling,
  logs,
  showExecutionDialog,
  setShowExecutionDialog,
  clearLogs,
} = useModuleDiscoveryLogic();
```

### 3. Add PowerShellExecutionDialog Component (at end of JSX)

```typescript
{/* PowerShell Execution Dialog */}
<PowerShellExecutionDialog
  isOpen={showExecutionDialog}
  onClose={() => !isDiscovering && setShowExecutionDialog(false)}
  scriptName="Module Discovery"
  scriptDescription="Description of what this discovery does"
  logs={logs.map(log => ({
    timestamp: log.timestamp,
    message: log.message,
    level: log.level as 'info' | 'success' | 'warning' | 'error'
  }))}
  isRunning={isDiscovering}
  isCancelling={isCancelling}
  progress={progress ? {
    percentage: progress.percentage || 0,
    message: progress.message || 'Processing...'
  } : undefined}
  onStart={startDiscovery}
  onStop={cancelDiscovery}
  onClear={clearLogs}
  showStartButton={false}
/>
```

## Quick Checklist

**Hook (useModuleDiscoveryLogic.ts):**
- [ ] Add `LogEntry` interface export
- [ ] Add `isCancelling`, `logs`, `showExecutionDialog` to state
- [ ] Update `onDiscoveryOutput` to add log entries
- [ ] Update `onDiscoveryComplete` to add success log, reset `isCancelling`
- [ ] Update `onDiscoveryError` to add error log, reset `isCancelling`
- [ ] Update `onDiscoveryCancelled` to add warning log, reset `isCancelling`
- [ ] Update `startDiscovery` to set `showExecutionDialog: true` and initial log
- [ ] Update `cancelDiscovery` to set `isCancelling: true` and add log
- [ ] Add `clearLogs` function
- [ ] Add `setShowExecutionDialog` function
- [ ] Export all new fields in return statement

**View (ModuleDiscoveryView.tsx):**
- [ ] Import `PowerShellExecutionDialog`
- [ ] Destructure `isCancelling`, `logs`, `showExecutionDialog`, `setShowExecutionDialog`, `clearLogs`
- [ ] Add `<PowerShellExecutionDialog>` component at end of JSX

---

# TypeScript Interface Consistency (View ↔ Hook ↔ Types)

## CRITICAL: TabType and Filter Interface Synchronization

When modifying discovery hooks (adding new tabs, filters), ALL THREE must stay synchronized:

1. **Hook (useModuleLogic.ts)** - Defines `TabType` and state interface
2. **Types (types/models/module.ts)** - Defines shared interfaces like `EnhancedStats`
3. **View (ModuleView.tsx)** - Uses TabType values and filter properties

### Common Errors and Fixes

**Error: "Argument of type 'X' is not assignable to parameter of type 'TabType'"**
```typescript
// ❌ WRONG: View uses tab name that doesn't exist in hook
onClick={() => setActiveTab('assignments')}  // ERROR if TabType doesn't include 'assignments'

// ✅ CORRECT: Verify TabType in hook first
// Hook: type TabType = 'overview' | 'licenses' | 'userAssignments' | 'servicePlans' | 'compliance';
onClick={() => setActiveTab('userAssignments')}  // Use exact name from TabType
```

**Error: "Property 'X' does not exist on type 'Stats'"**
```typescript
// ❌ WRONG: View uses property not in interface
<div>{stats.costPerMonth}</div>  // ERROR if EnhancedStats doesn't have costPerMonth

// ✅ CORRECT: Add missing property to interface
export interface EnhancedLicenseStats extends LicenseStats {
  costPerMonth: number;  // ADD to types/models/licensing.ts
  // ...
}
```

**Error: "Property 'X' does not exist on filter type"**
```typescript
// ❌ WRONG: View uses filter property not in hook state
checked={filter.showOnlyExpiring}  // ERROR if filter interface doesn't have this

// ✅ CORRECT: Check hook's filter interface and use existing property
// Hook filter: { assignmentSource: 'all' | 'Direct' | 'Group'; showOnlyWithDisabledPlans: boolean; }
checked={filter.showOnlyWithDisabledPlans}  // Use property that exists
```

### Synchronization Checklist

When adding new tabs or filters:

1. **Hook (`useModuleLogic.ts`):**
   - [ ] Update `TabType` union with new tab names
   - [ ] Update state filter interface with new filter properties
   - [ ] Add column definitions for new tabs
   - [ ] Add filtered data arrays for new tabs
   - [ ] Update `filteredData` switch statement

2. **Types (`types/models/module.ts`):**
   - [ ] Add missing properties to stats interfaces
   - [ ] Add `utilization` to `topCostProducts` array type
   - [ ] Add `assignmentsBySource`, `expiringCount`, etc. to enhanced stats

3. **View (`ModuleView.tsx`):**
   - [ ] Use exact tab names from hook's `TabType`
   - [ ] Use exact filter properties from hook's filter interface
   - [ ] Update tab buttons with correct `onClick={() => setActiveTab('exactName')}`
   - [ ] Update content area conditions `{activeTab === 'exactName' && ...}`

### Quick Validation

```bash
# After modifying a discovery module, check for type errors:
npx tsc --noEmit --project guiv2/tsconfig.json 2>&1 | grep -i "does not exist"
```

---

# Console Logging Standard

**Pattern:** `console.log('[ComponentName] action')` at all entry/exit points

```typescript
console.log('[MyView] Component rendering');
console.log('[MyView] useEffect - Component mounted');
console.log('[MyView] functionName called');
console.log('[MyView] API result:', result);
console.error('[MyView] Error:', error);
```

**Benefits:** Fast debugging via browser console. Logs removed in production builds.

---

# Deployment Workflow

```powershell
# 1. Copy files workspace → deployment
Copy-Item -Path "D:\Scripts\UserMandA\Modules\Discovery\*.psm1" -Destination "C:\enterprisediscovery\Modules\Discovery\" -Force
Copy-Item -Path "D:\Scripts\UserMandA\guiv2\src\renderer\hooks\*.ts" -Destination "C:\enterprisediscovery\guiv2\src\renderer\hooks\" -Force

# 2. Build in deployment directory
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path '.webpack') { Remove-Item -Recurse -Force '.webpack' }

npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# 3. Launch Application
# ⚠️ IMPORTANT: Use Bash run_in_background for reliable launch
# ❌ WRONG: powershell.exe -Command "Start-Process npm -ArgumentList 'start'" (doesn't work!)
# ✅ CORRECT: Use Bash tool with run_in_background=true:
#    Bash(command="powershell.exe -Command 'cd C:\enterprisediscovery\guiv2; npm start'", run_in_background=true)
npm start

# Wait for Electron to start (6-8 seconds), then verify:
# powershell -Command "Get-Process -Name electron -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, StartTime"

# 4. Copy back to workspace for version control
Copy-Item -Path "C:\enterprisediscovery\guiv2\src\*" -Destination "D:\Scripts\UserMandA\guiv2\src\" -Recurse -Force
Copy-Item -Path "C:\enterprisediscovery\Modules\*" -Destination "D:\Scripts\UserMandA\Modules\" -Recurse -Force
```

---

# TypeScript Patterns & Common Errors (Updated 2025-12-30)

## Map Data Structure - NEVER Use Bracket Notation

The Zustand `useDiscoveryStore` uses `Map<string, DiscoveryResult[]>` for results storage.

```typescript
// ❌ WRONG: Map doesn't support bracket notation
const azureSecurity = results?.['AzureSecurity'];  // ERROR: Element implicitly has 'any' type

// ✅ CORRECT: Use .get() method for Map
const azureSecurity = results?.get('AzureSecurity');

// ✅ CORRECT: Get first element from array if needed
const azureSecurityResults = results?.get('AzureSecurity');
const firstResult = azureSecurityResults?.[0];
```

## DiscoveryResult Dynamic Properties

The `DiscoveryResult` interface doesn't include all properties that might come from PowerShell modules. Use type assertions for dynamic properties:

```typescript
// ❌ WRONG: dataType doesn't exist on DiscoveryResult
const subscriptionData = licensingResults?.filter(
  (r) => r.dataType === 'Subscriptions'  // ERROR
);

// ✅ CORRECT: Use type assertion OR fallback to known properties
const subscriptionData = licensingResults?.filter(
  (r) => (r as any).dataType === 'Subscriptions' ||
         r.displayName?.includes('Subscription') ||
         r.moduleName?.includes('Subscription')
);
```

## react-grid-layout Type Imports

The `react-grid-layout` library has complex type exports. Always use separate type import:

```typescript
// ❌ WRONG: May cause "Module has no exported member" error
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';

// ✅ CORRECT: Separate type import
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';

// Layout conversion with custom TileLayout interface
const onLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
  // Use double assertion for custom layout types
  saveLayout(allLayouts as unknown as { [key: string]: TileLayout[] });
}, [saveLayout]);
```

## Quick Reference Table

| Error Pattern | Cause | Fix |
|--------------|-------|-----|
| `no index signature` on Map | Using `map['key']` | Use `map.get('key')` |
| `Property 'X' does not exist on DiscoveryResult` | Dynamic PowerShell props | Use `(result as any).X` |
| `Module has no exported member 'WidthProvider'` | Type export issue | Use `import type { X }` |
| `Type 'X' not assignable to type 'Y'` | Interface mismatch | Use `as unknown as Y` |
