# Discovery View Enhancement - Technical Claude Code Prompt

## Objective
Upgrade all minimal discovery views to match the "golden" UI pattern established by `ApplicationDiscoveryView.tsx` and `IntuneDiscoveryView.tsx`. This includes full-featured hooks, comprehensive result displays, statistics dashboards, and PowerShell execution dialog integration.

---

## CRITICAL: DO NOT CONFUSE WITH DISCOVERED VIEWS
- **Discovery Views** (`guiv2/src/renderer/views/discovery/`) = Run PowerShell modules, display real-time results
- **Discovered Views** (`guiv2/src/renderer/views/discovered/`) = Display CSV data from previous runs (DO NOT TOUCH)

---

## Architecture Pattern Reference

### Golden View Pattern (ApplicationDiscoveryView + IntuneDiscoveryView)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ ├─ Icon + Title + Description                                   │
│ ├─ Template Selector (optional)                                 │
│ ├─ Configure Button                                             │
│ ├─ Export CSV/Excel Buttons (when results exist)                │
│ └─ Start Discovery / Cancel Button                              │
├─────────────────────────────────────────────────────────────────┤
│ CONFIGURATION PANEL (Collapsible)                               │
│ ├─ Checkboxes for discovery options                             │
│ ├─ Timeout input                                                │
│ └─ Module-specific parameters                                   │
├─────────────────────────────────────────────────────────────────┤
│ PROGRESS BAR (when isDiscovering)                               │
│ ├─ Current operation message                                    │
│ ├─ Percentage complete                                          │
│ └─ Objects processed / ETA                                      │
├─────────────────────────────────────────────────────────────────┤
│ STATISTICS CARDS (when results exist)                           │
│ ├─ 4-8 gradient cards with icons                                │
│ ├─ Key metrics from discovery result                            │
│ └─ Color-coded by category (blue/green/red/purple/etc)          │
├─────────────────────────────────────────────────────────────────┤
│ TAB NAVIGATION                                                  │
│ ├─ Overview tab                                                 │
│ ├─ Data category tabs with counts                               │
│ └─ Tab icons + labels                                           │
├─────────────────────────────────────────────────────────────────┤
│ CONTENT AREA                                                    │
│ ├─ Overview: Summary cards, charts, breakdowns                  │
│ ├─ Data tabs: VirtualizedDataGrid with columns                  │
│ ├─ Search/filter bar                                            │
│ └─ Empty state when no results                                  │
├─────────────────────────────────────────────────────────────────┤
│ PowerShellExecutionDialog (modal)                               │
│ ├─ Real-time log streaming                                      │
│ ├─ Progress indicator                                           │
│ └─ Stop/Clear controls                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Golden Hook Pattern (useIntuneDiscoveryLogic)

```typescript
// Required exports from hook:
{
  // Config
  config: DiscoveryConfig,
  updateConfig: (updates: Partial<Config>) => void,
  
  // State
  result: DiscoveryResult | null,
  isDiscovering: boolean,
  isCancelling: boolean,
  progress: { current, total, message, percentage },
  error: string | null,
  clearError: () => void,
  
  // Actions
  startDiscovery: () => Promise<void>,
  cancelDiscovery: () => Promise<void>,
  
  // Tab/Filter state
  activeTab: string,
  setActiveTab: (tab: string) => void,
  filter: FilterState,
  updateFilter: (updates: Partial<FilterState>) => void,
  
  // Data
  columns: ColDef[],          // AG-Grid column definitions
  filteredData: any[],        // Filtered data for current tab
  stats: Stats | null,        // Computed statistics
  
  // PowerShellExecutionDialog integration
  logs: LogEntry[],
  showExecutionDialog: boolean,
  setShowExecutionDialog: (show: boolean) => void,
  clearLogs: () => void,
  
  // Export
  exportToCSV: (data: any[], filename: string) => void,
  exportToExcel: (data: any[], filename: string) => Promise<void>,
}
```

---

## GAP ANALYSIS - Views Requiring Enhancement

### TIER 1: MINIMAL VIEWS (Critical - Basic DataTable only)
These views have ~20 lines, no styling, no config, no stats:

| View | Hook | PowerShell Module | Data Types |
|------|------|-------------------|------------|
| `PrinterDiscoveryView.tsx` | `usePrinterDiscoveryLogic.ts` | `PrinterDiscovery.psm1` | LocalPrinter, NetworkPrinter, PrintServer, PrinterDriver, PrinterSummary |
| `StorageArrayDiscoveryView.tsx` | `useStorageArrayDiscoveryLogic.ts` | `StorageArrayDiscovery.psm1` | LocalStorage, NetworkStorage, StorageSpaces, FcIscsi, StorageSummary |
| `ScheduledTaskDiscoveryView.tsx` | `useScheduledTaskDiscoveryLogic.ts` | `ScheduledTaskDiscovery.psm1` | ScheduledTask, TaskTrigger, TaskAction, TaskSummary |
| `PowerBIDiscoveryView.tsx` | `usePowerBIDiscoveryLogic.ts` | `PowerBIDiscovery.psm1` | Workspaces, Reports, Datasets, Dashboards |
| `WebServerConfigDiscoveryView.tsx` | `useWebServerConfigDiscoveryLogic.ts` | `WebServerConfigDiscovery.psm1` | IISSite, IISAppPool, WebBinding, SSLCertificate |

### TIER 2: PARTIAL VIEWS (Medium - Have some UI but missing features)
| View | Missing Features |
|------|------------------|
| `PaloAltoDiscoveryView.tsx` | Missing: PowerShellExecutionDialog, tabs, proper config panel |
| `BackupRecoveryDiscoveryView.tsx` | Missing: Stats cards, overview tab, tabs |
| `CertificateDiscoveryView.tsx` | Missing: Full stats, tabs by cert type |
| `DNSDHCPDiscoveryView.tsx` | Missing: Stats cards, proper filtering |

### TIER 3: HOOKS NEEDING ENHANCEMENT
Hooks exist but need to export more state/methods:

| Hook | Missing Exports |
|------|-----------------|
| `usePrinterDiscoveryLogic.ts` | logs, showExecutionDialog, tabs, columns, stats, exportToCSV/Excel |
| `useStorageArrayDiscoveryLogic.ts` | Same as above |
| `useScheduledTaskDiscoveryLogic.ts` | Same as above |
| `usePowerBIDiscoveryLogic.ts` | Same as above |
| `useWebServerConfigDiscoveryLogic.ts` | Same as above |

---

## IMPLEMENTATION CHECKLIST

### For Each TIER 1 View:

#### Step 1: Enhance the Hook (e.g., `usePrinterDiscoveryLogic.ts`)

- [ ] Add `logs` state with `LogEntry[]` type
- [ ] Add `addLog(level, message)` callback
- [ ] Add `clearLogs()` callback
- [ ] Add `showExecutionDialog` state
- [ ] Add `setShowExecutionDialog` callback
- [ ] Add `isCancelling` state
- [ ] Add `activeTab` state with type union
- [ ] Add `setActiveTab` callback
- [ ] Add `filter` state object
- [ ] Add `updateFilter` callback
- [ ] Add `columns` useMemo for AG-Grid ColDef[]
- [ ] Add `filteredData` useMemo
- [ ] Add `stats` useMemo computing statistics from result
- [ ] Add `exportToCSV` callback
- [ ] Add `exportToExcel` callback
- [ ] Wire `addLog` to `onDiscoveryOutput` event listener
- [ ] Set `showExecutionDialog(true)` in `startDiscovery`

#### Step 2: Create Full View (e.g., `PrinterDiscoveryView.tsx`)

- [ ] Import required components:
  ```typescript
  import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
  import { Button } from '../../components/atoms/Button';
  import { Input } from '../../components/atoms/Input';
  import Checkbox from '../../components/atoms/Checkbox';
  import LoadingOverlay from '../../components/molecules/LoadingOverlay';
  import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
  ```

- [ ] Add appropriate Lucide icons for the module
- [ ] Create header with icon, title, description
- [ ] Add Export CSV/Excel buttons (conditional on results)
- [ ] Add Start Discovery / Cancel button
- [ ] Create collapsible configuration panel
- [ ] Add statistics cards grid (study PowerShell module for metrics)
- [ ] Create tab navigation with counts
- [ ] Add Overview tab with summary/breakdown
- [ ] Add data tabs with VirtualizedDataGrid
- [ ] Add search/filter functionality
- [ ] Add empty state component
- [ ] Wire PowerShellExecutionDialog

#### Step 3: Define Column Definitions
Study the PowerShell module to identify fields:

```typescript
// Example for PrinterDiscovery
const printerColumns: ColDef[] = [
  { field: 'Name', headerName: 'Printer Name', sortable: true, filter: true, width: 200 },
  { field: 'DriverName', headerName: 'Driver', sortable: true, filter: true, width: 180 },
  { field: 'PortName', headerName: 'Port', sortable: true, filter: true, width: 150 },
  { field: 'Location', headerName: 'Location', sortable: true, filter: true, width: 150 },
  { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 100 },
  { field: 'Shared', headerName: 'Shared', sortable: true, filter: true, width: 80, valueFormatter: (p) => p.value ? 'Yes' : 'No' },
  { field: 'PrinterType', headerName: 'Type', sortable: true, filter: true, width: 120 },
];
```

#### Step 4: Define Statistics Cards
Study PowerShell module `Get-*Summary` functions:

```typescript
// Example for PrinterDiscovery (from PrinterDiscovery.psm1 Get-PrinterSummary)
const stats = useMemo(() => ({
  totalPrinters: result?.metadata?.LocalPrinterCount + result?.metadata?.NetworkPrinterCount || 0,
  localPrinters: result?.metadata?.LocalPrinterCount || 0,
  networkPrinters: result?.metadata?.NetworkPrinterCount || 0,
  printServers: result?.metadata?.PrintServerCount || 0,
  printerDrivers: result?.metadata?.PrinterDriverCount || 0,
  sharedPrinters: /* filter from data */,
  offlinePrinters: /* filter from data */,
}), [result]);
```

---

## MODULE-SPECIFIC DATA MAPPING

### PrinterDiscovery.psm1
**Data Types:** LocalPrinter, NetworkPrinter, PrintServer, PrinterDriver, PrinterSummary

**Key Fields:**
- LocalPrinter: Name, DeviceID, DriverName, PortName, Location, Status, Shared, Published, Default
- NetworkPrinter: Name, ServerName, ShareName, Location, DriverName, Status
- PrintServer: ServerName, PrinterCount, SharedPrinters
- PrinterDriver: Name, Version, InfName

**Stats to Display:**
- Total Printers, Local Printers, Network Printers
- Print Servers, Printer Drivers
- Shared Printers, AD Published Printers
- Active vs Offline Printers

**Tabs:** Overview, Local Printers, Network Printers, Print Servers, Drivers

---

### ScheduledTaskDiscovery.psm1
**Data Types:** ScheduledTask, TaskTrigger, TaskAction, TaskSummary

**Key Fields:**
- ScheduledTask: TaskName, TaskPath, State, Author, Description, LastRunTime, NextRunTime, LastTaskResult, TriggerCount, ActionCount
- TaskTrigger: TaskName, TriggerType, Enabled, StartBoundary, Repetition
- TaskAction: TaskName, ActionType, Execute, Arguments, WorkingDirectory

**Stats to Display:**
- Total Tasks, Enabled Tasks, Disabled Tasks
- Running Tasks, Ready Tasks, Hidden Tasks
- Microsoft Tasks vs Custom Tasks
- Failed Tasks (LastTaskResult != 0)
- Recently Run (LastRunTime > 7 days)

**Tabs:** Overview, Tasks, Triggers, Actions

---

### StorageArrayDiscovery.psm1
**Data Types:** LocalStorage, NetworkStorage, StorageSpaces, FcIscsi, StorageSummary

**Key Fields:**
- PhysicalDisk: DeviceID, Model, Size, MediaType, InterfaceType, Status
- Volume: DriveLetter, Label, FileSystem, Size, FreeSpace, PercentFree
- NetworkDrive: DriveLetter, ProviderName, Size, FreeSpace
- StoragePool: FriendlyName, Size, AllocatedSize, HealthStatus

**Stats to Display:**
- Total Physical Capacity (GB)
- Total Free Space (GB)
- Physical Disk Count, Volume Count
- Network Drives, SMB Shares
- Storage Pools, Virtual Disks
- FC/iSCSI Connections

**Tabs:** Overview, Physical Disks, Volumes, Network Storage, Storage Spaces, FC/iSCSI

---

### PowerBIDiscovery.psm1
**Key Fields:** Workspace, Report, Dataset, Dashboard, Dataflow

**Stats:** Total Workspaces, Reports, Datasets, Dashboards, Users with Access

**Tabs:** Overview, Workspaces, Reports, Datasets, Dashboards

---

### WebServerConfigDiscovery.psm1
**Key Fields:** IIS Sites, App Pools, Bindings, SSL Certs, Virtual Directories

**Stats:** Total Sites, Running vs Stopped, App Pools, SSL Bindings, Cert Expiry

**Tabs:** Overview, Sites, App Pools, Bindings, Certificates

---

## CODE GUARDRAILS

### DO:
1. ✅ Use `window.electron.executeDiscovery()` with `executionId` for event matching
2. ✅ Use `currentTokenRef.current` pattern for event listener matching
3. ✅ Set up event listeners in `useEffect` with empty dependency array `[]`
4. ✅ Call `addResult()` from discovery store on completion
5. ✅ Use `VirtualizedDataGrid` for large datasets
6. ✅ Use existing component library (`Button`, `Input`, `Checkbox`, etc.)
7. ✅ Add `data-cy` and `data-testid` attributes for testing
8. ✅ Use Tailwind classes matching existing patterns
9. ✅ Use `useMemo` for columns, filteredData, stats
10. ✅ Use `useCallback` for all action handlers

### DON'T:
1. ❌ Don't use deprecated `executeDiscoveryModule` API
2. ❌ Don't put dependencies in event listener useEffect
3. ❌ Don't forget to unsubscribe from events in cleanup
4. ❌ Don't use inline styles - use Tailwind
5. ❌ Don't create new components - use existing atoms/molecules/organisms
6. ❌ Don't modify Discovered views (only Discovery views)
7. ❌ Don't modify PowerShell modules
8. ❌ Don't cast as `any` type - define proper interfaces
9. ❌ Don't forget error handling in try/catch
10. ❌ Don't forget loading states and empty states

---

## EXECUTION ORDER

1. **Phase 1: TIER 1 Hooks Enhancement**
   - Enhance `usePrinterDiscoveryLogic.ts`
   - Enhance `useStorageArrayDiscoveryLogic.ts`
   - Enhance `useScheduledTaskDiscoveryLogic.ts`
   - Enhance `usePowerBIDiscoveryLogic.ts`
   - Enhance `useWebServerConfigDiscoveryLogic.ts`

2. **Phase 2: TIER 1 Views Creation**
   - Rewrite `PrinterDiscoveryView.tsx`
   - Rewrite `StorageArrayDiscoveryView.tsx`
   - Rewrite `ScheduledTaskDiscoveryView.tsx`
   - Rewrite `PowerBIDiscoveryView.tsx`
   - Rewrite `WebServerConfigDiscoveryView.tsx`

3. **Phase 3: TIER 2 View Enhancement**
   - Enhance `PaloAltoDiscoveryView.tsx`
   - Enhance `BackupRecoveryDiscoveryView.tsx`
   - Enhance `CertificateDiscoveryView.tsx`
   - Enhance `DNSDHCPDiscoveryView.tsx`

4. **Phase 4: Testing & Validation**
   - Run TypeScript compilation
   - Test each discovery module
   - Verify PowerShell execution
   - Check result persistence

---

## FILE REFERENCES

### Golden Reference Files (COPY PATTERNS FROM):
- `guiv2/src/renderer/views/discovery/ApplicationDiscoveryView.tsx`
- `guiv2/src/renderer/views/discovery/IntuneDiscoveryView.tsx`
- `guiv2/src/renderer/hooks/useIntuneDiscoveryLogic.ts`
- `guiv2/src/renderer/hooks/useApplicationDiscoveryLogic.ts`

### PowerShell Modules (READ FOR DATA STRUCTURE):
- `Modules/Discovery/PrinterDiscovery.psm1`
- `Modules/Discovery/ScheduledTaskDiscovery.psm1`
- `Modules/Discovery/StorageArrayDiscovery.psm1`
- `Modules/Discovery/PowerBIDiscovery.psm1`
- `Modules/Discovery/WebServerConfigDiscovery.psm1`
- `Modules/Discovery/BackupRecoveryDiscovery.psm1`

### Component Library (USE THESE):
- `guiv2/src/renderer/components/atoms/Button.tsx`
- `guiv2/src/renderer/components/atoms/Input.tsx`
- `guiv2/src/renderer/components/atoms/Checkbox.tsx`
- `guiv2/src/renderer/components/molecules/LoadingOverlay.tsx`
- `guiv2/src/renderer/components/molecules/PowerShellExecutionDialog.tsx`
- `guiv2/src/renderer/components/molecules/ProgressBar.tsx`
- `guiv2/src/renderer/components/organisms/VirtualizedDataGrid.tsx`

### Stores (USE FOR STATE):
- `guiv2/src/renderer/store/useDiscoveryStore.ts` - `addResult()`, `getResultsByModuleName()`
- `guiv2/src/renderer/store/useProfileStore.ts` - `selectedSourceProfile`

---

## VALIDATION CHECKLIST

Before marking a view as complete:

- [ ] View renders without TypeScript errors
- [ ] View has header with icon, title, description
- [ ] Start Discovery button calls `startDiscovery()`
- [ ] Cancel button calls `cancelDiscovery()` and shows during discovery
- [ ] Configuration panel is collapsible
- [ ] Statistics cards show computed metrics from result
- [ ] Tabs switch between data views correctly
- [ ] VirtualizedDataGrid displays filtered data
- [ ] Search/filter updates `filteredData`
- [ ] Export CSV works
- [ ] Empty state shows when no results
- [ ] PowerShellExecutionDialog shows logs
- [ ] Progress bar shows during discovery
- [ ] Results persist to discovery store
- [ ] Loading overlay shows during discovery
- [ ] Error messages display properly

---

## EXAMPLE: Complete PrinterDiscoveryView.tsx Structure

```typescript
// Imports
import { useState } from 'react';
import { Printer, ChevronUp, ChevronDown, Download, FileSpreadsheet, Server, AlertTriangle, Check } from 'lucide-react';
import { usePrinterDiscoveryLogic } from '../../hooks/usePrinterDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const PrinterDiscoveryView: React.FC = () => {
  const {
    config, result, isDiscovering, isCancelling, progress,
    activeTab, filter, error, logs,
    showExecutionDialog, setShowExecutionDialog, clearLogs,
    columns, filteredData, stats,
    startDiscovery, cancelDiscovery, updateConfig, setActiveTab, updateFilter,
    clearError, exportToCSV, exportToExcel
  } = usePrinterDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="printer-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && <LoadingOverlay ... />}
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 ...">
        {/* Icon + Title + Description */}
        {/* Export buttons (conditional) */}
        {/* Start/Cancel button */}
      </div>

      {/* Error Display */}
      {error && <div className="...">...</div>}

      {/* Configuration Panel */}
      <div className="...">
        <button onClick={() => setConfigExpanded(!configExpanded)}>...</button>
        {configExpanded && <div>/* Checkboxes for config options */</div>}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          {/* 4-8 gradient cards */}
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b ...">
          {/* Tab buttons with icons and counts */}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Empty state OR tabs content */}
        {activeTab === 'overview' ? <OverviewContent /> : <GridContent />}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Printer Discovery"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default PrinterDiscoveryView;
```

---

## FINAL NOTES

- Always read the PowerShell module first to understand what data is available
- Match the visual style of IntuneDiscoveryView exactly
- Use gradient cards for statistics (from-X-500 to-X-600)
- Keep all state in the hook, view should be mostly presentational
- Test with actual discovery runs to verify data structure
- The `moduleName` passed to `executeDiscovery` must match what PowerShellService expects
