# Epic 3 & Epic 4: Discovery Module Execution & Logic Engine Architecture

**Document Version:** 1.0
**Date:** October 5, 2025
**Status:** Architecture Design - Ready for Implementation
**Author:** Architecture Lead (Claude Code)

---

## Executive Summary

This document provides comprehensive architectural specifications for Epic 3 (Discovery Module Execution) and Epic 4 (Logic Engine Service), two critical dependencies that enable all data views and correlation functionality in the M&A Discovery Suite v2.

**Epic 3** implements real-time PowerShell module execution with streaming output, progress tracking, and cancellation support. **Epic 4** implements the core data correlation engine that loads CSV data, applies inference rules, performs fuzzy matching, and builds rich projections for detail views.

**Critical Integration Points:**
- PowerShell Service (already exists) ✅
- Discovery Views (exist, need real-time integration) ⏳
- Data Views (exist, need LogicEngine projections) ⏳
- IPC Handlers (need expansion) ⏳

**Performance Targets:**
- CSV Load Time: < 5 seconds for 10,000 users
- Inference Processing: < 2 seconds for full ruleset
- Detail Projection: < 100ms cache hit, < 500ms cache miss
- Memory Footprint: < 500MB for 10,000 users with full correlation

---

## Table of Contents

1. [Epic 3: Discovery Module Execution Architecture](#epic-3-discovery-module-execution-architecture)
2. [Epic 4: Logic Engine Service Architecture](#epic-4-logic-engine-service-architecture)
3. [Data Correlation Algorithms](#data-correlation-algorithms)
4. [Inference Rules Specification](#inference-rules-specification)
5. [Fuzzy Matching Implementation](#fuzzy-matching-implementation)
6. [Caching & Performance Strategy](#caching--performance-strategy)
7. [IPC Integration Design](#ipc-integration-design)
8. [Testing Strategy](#testing-strategy)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Epic 3: Discovery Module Execution Architecture

### Overview

Epic 3 enables users to execute PowerShell discovery modules directly from the GUI with real-time feedback, progress tracking, and cancellation support. The existing `PowerShellExecutionService` (guiv2/src/main/services/powerShellService.ts) already implements session pooling, streaming, and queue management - we need to integrate it with the UI layer.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Discovery View Layer                        │
│  (DomainDiscoveryView, AzureDiscoveryView, etc.)               │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ uses hook
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              useDiscoveryExecutionLogic.ts                      │
│  - Manages execution state (isRunning, progress, logs)         │
│  - Listens to IPC events (output, progress, complete)         │
│  - Calls window.electron.invoke('discovery:execute')          │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ IPC communication
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   IPC Handlers (Main Process)                   │
│  - discovery:execute → executes module with streaming          │
│  - discovery:cancel → cancels running execution                │
│  - discovery:get-modules → returns module registry             │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ delegates to
             ▼
┌─────────────────────────────────────────────────────────────────┐
│           PowerShellExecutionService (EXISTING)                 │
│  - Session pooling (min: 2, max: 10)                          │
│  - Streaming output via EventEmitter                           │
│  - Cancellation support                                        │
│  - Request queuing when pool exhausted                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ spawns processes
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PowerShell Discovery Modules                   │
│  (Modules/Discovery/*.psm1)                                    │
│  - Write-Progress for progress updates                         │
│  - Write-Verbose for streaming logs                            │
│  - ConvertTo-Json for structured output                        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### 3.1 Custom Hook: `useDiscoveryExecutionLogic.ts`

**Location:** `guiv2/src/renderer/hooks/useDiscoveryExecutionLogic.ts`

**Purpose:** Encapsulates all discovery execution logic for a specific module, managing state, IPC communication, and event handling.

**State Management:**
```typescript
interface DiscoveryExecutionState {
  isRunning: boolean;
  isCancelling: boolean;
  executionId: string | null;
  progress: {
    percentage: number;
    message: string;
    currentItem: string;
    itemsProcessed?: number;
    totalItems?: number;
    estimatedTimeRemaining?: number;
  };
  logs: Array<{
    timestamp: Date;
    level: 'output' | 'error' | 'warning' | 'verbose' | 'debug' | 'information';
    message: string;
  }>;
  results: any | null;
  error: string | null;
  startTime: Date | null;
  endTime: Date | null;
}
```

**Key Methods:**
```typescript
interface UseDiscoveryExecutionLogic {
  // State
  state: DiscoveryExecutionState;

  // Actions
  executeModule: (moduleName: string, params: Record<string, any>) => Promise<void>;
  cancelExecution: () => Promise<void>;
  clearLogs: () => void;
  exportResults: (format: 'csv' | 'json') => Promise<void>;

  // Computed
  duration: number | null; // in milliseconds
  isComplete: boolean;
  hasError: boolean;
  canExecute: boolean; // based on profile selection and form validation
}
```

**Event Listeners (IPC):**
```typescript
// Setup in useEffect
useEffect(() => {
  if (!executionId) return;

  // Listen for streaming output
  const outputHandler = (data: OutputData) => {
    if (data.executionId === executionId) {
      addLog({
        timestamp: new Date(data.timestamp),
        level: data.type,
        message: data.data
      });
    }
  };
  window.electron.on('discovery:output', outputHandler);

  // Listen for progress updates
  const progressHandler = (data: ProgressData) => {
    if (data.executionId === executionId) {
      setProgress({
        percentage: data.percentage,
        message: data.message,
        currentItem: data.currentItem,
        itemsProcessed: data.itemsProcessed,
        totalItems: data.totalItems,
        estimatedTimeRemaining: data.estimatedTimeRemaining,
      });
    }
  };
  window.electron.on('discovery:progress', progressHandler);

  // Listen for completion
  const completeHandler = (data: { executionId: string; result: ExecutionResult }) => {
    if (data.executionId === executionId) {
      setIsRunning(false);
      setEndTime(new Date());
      if (data.result.success) {
        setResults(data.result.data);
      } else {
        setError(data.result.error || 'Unknown error');
      }
    }
  };
  window.electron.on('discovery:complete', completeHandler);

  // Cleanup
  return () => {
    window.electron.off('discovery:output', outputHandler);
    window.electron.off('discovery:progress', progressHandler);
    window.electron.off('discovery:complete', completeHandler);
  };
}, [executionId]);
```

**Implementation Pattern:**
```typescript
const executeModule = async (moduleName: string, params: Record<string, any>) => {
  try {
    setIsRunning(true);
    setError(null);
    setLogs([]);
    setProgress({ percentage: 0, message: 'Initializing...', currentItem: '' });
    setStartTime(new Date());

    const execId = crypto.randomUUID();
    setExecutionId(execId);

    // Invoke main process IPC handler
    const result = await window.electron.invoke('discovery:execute', {
      moduleName,
      params,
      executionId: execId,
      profile: selectedProfile?.companyName,
    });

    // Final result will be handled by 'discovery:complete' event listener
  } catch (err: any) {
    setIsRunning(false);
    setError(err.message);
    setEndTime(new Date());
  }
};
```

#### 3.2 IPC Handlers (Main Process)

**Location:** `guiv2/src/main/ipcHandlers.ts` (expand existing file)

**New Handlers:**

```typescript
// discovery:execute - Execute a discovery module with streaming
ipcMain.handle('discovery:execute', async (event, { moduleName, params, executionId, profile }) => {
  try {
    const moduleRegistry = await loadModuleRegistry();
    const moduleInfo = moduleRegistry.modules.find(m => m.name === moduleName);

    if (!moduleInfo) {
      throw new Error(`Module not found: ${moduleName}`);
    }

    const scriptPath = path.join(baseDir, moduleInfo.scriptPath);
    const args = buildArgsFromParams(params);

    // Create execution options with streaming enabled
    const options: ExecutionOptions = {
      timeout: params.timeout ? params.timeout * 1000 : 300000, // Convert to ms
      streamOutput: true,
      cancellationToken: executionId,
      workingDirectory: path.join('C:', 'discoverydata', profile, 'Raw'),
      environmentVariables: {
        PROFILE_NAME: profile,
        OUTPUT_DIR: path.join('C:', 'discoverydata', profile, 'Raw'),
      },
    };

    // Setup event forwarding from PowerShellService to renderer
    const outputHandler = (data: OutputData) => {
      if (data.executionId === executionId) {
        event.sender.send('discovery:output', data);
      }
    };
    powerShellService.on('output', outputHandler);

    // Parse progress from verbose output (PowerShell Write-Progress)
    const progressHandler = (data: OutputData) => {
      if (data.executionId === executionId && data.type === 'verbose') {
        const progressData = parseProgressFromVerbose(data.data);
        if (progressData) {
          event.sender.send('discovery:progress', {
            executionId,
            ...progressData,
          });
        }
      }
    };
    powerShellService.on('stream:verbose', progressHandler);

    // Execute script
    const result = await powerShellService.executeScript(scriptPath, args, options);

    // Send completion event
    event.sender.send('discovery:complete', { executionId, result });

    // Cleanup listeners
    powerShellService.off('output', outputHandler);
    powerShellService.off('stream:verbose', progressHandler);

    return { success: true, executionId };
  } catch (error: any) {
    event.sender.send('discovery:complete', {
      executionId,
      result: { success: false, error: error.message, duration: 0, warnings: [] },
    });
    return { success: false, error: error.message };
  }
});

// discovery:cancel - Cancel a running discovery module
ipcMain.handle('discovery:cancel', async (event, { executionId }) => {
  const cancelled = powerShellService.cancelExecution(executionId);
  return { success: cancelled };
});

// discovery:get-modules - Get module registry for UI
ipcMain.handle('discovery:get-modules', async () => {
  const registry = await loadModuleRegistry();
  return { success: true, data: registry };
});

// Helper: Parse progress from PowerShell Write-Progress verbose output
function parseProgressFromVerbose(verboseOutput: string): ProgressData | null {
  // PowerShell Write-Progress outputs structured data to verbose stream
  // Format: "PROGRESS: 45% - Processing user: jdoe (150/1000) ETA: 2m 30s"
  const match = verboseOutput.match(/PROGRESS:\s*(\d+)%\s*-\s*(.+?)\s*\((\d+)\/(\d+)\)\s*(?:ETA:\s*(.+))?/);

  if (match) {
    return {
      percentage: parseInt(match[1], 10),
      message: match[2],
      currentItem: match[2].split(':')[1]?.trim() || '',
      itemsProcessed: parseInt(match[3], 10),
      totalItems: parseInt(match[4], 10),
      estimatedTimeRemaining: match[5] ? parseETA(match[5]) : undefined,
    };
  }

  return null;
}

function parseETA(etaString: string): number {
  // Parse "2m 30s" -> milliseconds
  const minutesMatch = etaString.match(/(\d+)m/);
  const secondsMatch = etaString.match(/(\d+)s/);

  let ms = 0;
  if (minutesMatch) ms += parseInt(minutesMatch[1], 10) * 60 * 1000;
  if (secondsMatch) ms += parseInt(secondsMatch[1], 10) * 1000;

  return ms;
}
```

#### 3.3 UI Components

**Real-Time Log Display Component:**

**Location:** `guiv2/src/renderer/components/organisms/DiscoveryLogViewer.tsx`

```typescript
interface DiscoveryLogViewerProps {
  logs: Array<{
    timestamp: Date;
    level: 'output' | 'error' | 'warning' | 'verbose' | 'debug' | 'information';
    message: string;
  }>;
  isRunning: boolean;
  onClear: () => void;
}

const DiscoveryLogViewer: React.FC<DiscoveryLogViewerProps> = ({ logs, isRunning, onClear }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string[]>(['output', 'error', 'warning', 'verbose']);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => filter.includes(log.level));

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <span className="text-sm font-semibold text-gray-200">
            Execution Log ({filteredLogs.length} entries)
          </span>
          {isRunning && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Running</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggles */}
          <LogLevelFilter selected={filter} onChange={setFilter} />

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 text-xs rounded ${
              autoScroll ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Auto-scroll
          </button>

          {/* Clear button */}
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-white"
            disabled={isRunning}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs to display. Execute a discovery module to see output.
          </div>
        ) : (
          <>
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`flex gap-3 py-1 ${getLogLevelColor(log.level)}`}
              >
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`text-xs font-semibold uppercase ${getLogLevelBadgeColor(log.level)}`}>
                  {log.level}
                </span>
                <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

function getLogLevelColor(level: string): string {
  switch (level) {
    case 'error': return 'text-red-400';
    case 'warning': return 'text-yellow-400';
    case 'verbose': return 'text-blue-400';
    case 'debug': return 'text-purple-400';
    case 'information': return 'text-cyan-400';
    default: return 'text-gray-300';
  }
}

function getLogLevelBadgeColor(level: string): string {
  switch (level) {
    case 'error': return 'text-red-600';
    case 'warning': return 'text-yellow-600';
    case 'verbose': return 'text-blue-600';
    case 'debug': return 'text-purple-600';
    case 'information': return 'text-cyan-600';
    default: return 'text-gray-600';
  }
}
```

**Progress Indicator Component:**

**Location:** `guiv2/src/renderer/components/molecules/DiscoveryProgressBar.tsx`

```typescript
interface DiscoveryProgressBarProps {
  progress: {
    percentage: number;
    message: string;
    currentItem: string;
    itemsProcessed?: number;
    totalItems?: number;
    estimatedTimeRemaining?: number;
  };
  isRunning: boolean;
}

const DiscoveryProgressBar: React.FC<DiscoveryProgressBarProps> = ({ progress, isRunning }) => {
  const formatETA = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3">
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 ${
            isRunning ? 'bg-blue-600 animate-pulse' : 'bg-green-600'
          }`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 dark:text-white">
            {progress.message}
          </div>
          {progress.currentItem && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Current: {progress.currentItem}
            </div>
          )}
        </div>

        <div className="text-right space-y-1">
          <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
            {progress.percentage}%
          </div>
          {progress.itemsProcessed !== undefined && progress.totalItems !== undefined && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {progress.itemsProcessed.toLocaleString()} / {progress.totalItems.toLocaleString()}
            </div>
          )}
          {progress.estimatedTimeRemaining !== undefined && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ETA: {formatETA(progress.estimatedTimeRemaining)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### PowerShell Module Requirements

All discovery modules must output structured progress and results:

```powershell
# In discovery modules (e.g., Modules/Discovery/Get-AllUsers.psm1)

function Get-AllUsers {
    param(
        [string]$DomainController,
        [int]$MaxResults = 10000
    )

    $total = 1000  # Estimate or get actual count
    $processed = 0

    # Initialize
    Write-Verbose "PROGRESS: 0% - Initializing discovery (0/$total)"

    # Process items
    foreach ($user in $users) {
        $processed++
        $percentage = [math]::Round(($processed / $total) * 100)
        $eta = CalculateETA -Processed $processed -Total $total -StartTime $startTime

        # Write progress (captured by PowerShellService)
        Write-Verbose "PROGRESS: $percentage% - Processing user: $($user.SamAccountName) ($processed/$total) ETA: $eta"

        # Process user...
    }

    # Return JSON
    $results | ConvertTo-Json -Depth 10 -Compress
}
```

---

## Epic 4: Logic Engine Service Architecture

### Overview

The Logic Engine Service is the **core data correlation engine** that:
1. Loads CSV data from all discovery modules into memory
2. Builds multi-index data structures for fast lookups
3. Applies inference rules to correlate data across modules
4. Performs fuzzy matching for identity resolution
5. Builds rich projection objects for detail views
6. Caches expensive projections for performance

This is a **TypeScript port** of the existing C# `LogicEngineService.cs` (59,000+ lines).

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        View Layer                               │
│  (UserDetailView, ComputerDetailView, GroupDetailView)         │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ uses hook
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  useUserDetailLogic.ts                          │
│  - Calls window.electron.invoke('logic-engine:get-user-detail')│
│  - Manages loading state and error handling                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ IPC communication
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   IPC Handlers (Main Process)                   │
│  - logic-engine:load-all → triggers full CSV load              │
│  - logic-engine:get-user-detail → builds UserDetailProjection  │
│  - logic-engine:get-computer-detail → builds projection        │
│  - logic-engine:get-statistics → returns load stats            │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ delegates to
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              LogicEngineService (NEW - Epic 4)                  │
│                                                                 │
│  Core Data Structures:                                         │
│  - usersBySid: Map<string, UserDto>                           │
│  - usersByUpn: Map<string, UserDto>                           │
│  - groupsBySid: Map<string, GroupDto>                         │
│  - membersByGroupSid: Map<string, string[]>                   │
│  - groupsByUserSid: Map<string, string[]>                     │
│  - devicesByName: Map<string, DeviceDto>                      │
│  - devicesByPrimaryUserSid: Map<string, DeviceDto[]>          │
│  - aclByIdentitySid: Map<string, AclEntry[]>                  │
│  - [30+ additional indices...]                                │
│                                                                 │
│  Core Methods:                                                  │
│  - loadAllAsync(): Promise<boolean>                            │
│  - buildUserDetailProjection(sidOrUpn): UserDetailProjection  │
│  - applyInferenceRulesAsync(): Promise<void>                  │
│  - calculateLevenshteinSimilarity(s1, s2): number             │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ reads CSVs
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CSV Data Files                              │
│  C:\discoverydata\{profile}\Raw\                               │
│  - ActiveDirectoryUsers_*.csv                                  │
│  - ActiveDirectoryGroups_*.csv                                 │
│  - ComputerInventory_*.csv                                     │
│  - [100+ CSV files from discovery modules]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### 4.1 Core Service: `logicEngineService.ts`

**Location:** `guiv2/src/main/services/logicEngineService.ts`

**Key Data Structures:**

```typescript
/**
 * LogicEngineService - Core data correlation and projection service
 *
 * Responsibilities:
 * 1. Load CSV data from all discovery modules
 * 2. Build multi-index data structures for O(1) lookups
 * 3. Apply inference rules to correlate data
 * 4. Perform fuzzy matching for identity resolution
 * 5. Build rich projections for detail views
 */
class LogicEngineService extends EventEmitter {
  private dataRoot: string;
  private isLoading: boolean = false;
  private lastLoadTime: Date | null = null;
  private fileLoadTimes: Map<string, Date> = new Map();
  private appliedInferenceRules: string[] = [];
  private fuzzyConfig: FuzzyMatchingConfig;

  // Core data stores (in-memory indexes)
  private usersBySid: Map<string, UserDto> = new Map();
  private usersByUpn: Map<string, UserDto> = new Map();
  private groupsBySid: Map<string, GroupDto> = new Map();
  private membersByGroupSid: Map<string, string[]> = new Map();
  private groupsByUserSid: Map<string, string[]> = new Map();
  private devicesByName: Map<string, DeviceDto> = new Map();
  private devicesByPrimaryUserSid: Map<string, DeviceDto[]> = new Map();
  private appsById: Map<string, AppDto> = new Map();
  private appsByDevice: Map<string, string[]> = new Map();
  private aclByIdentitySid: Map<string, AclEntry[]> = new Map();
  private drivesByUserSid: Map<string, MappedDriveDto[]> = new Map();
  private gposByGuid: Map<string, GpoDto> = new Map();
  private gposBySidFilter: Map<string, GpoDto[]> = new Map();
  private gposByOu: Map<string, GpoDto[]> = new Map();
  private mailboxByUpn: Map<string, MailboxDto> = new Map();
  private rolesByPrincipalId: Map<string, AzureRoleAssignment[]> = new Map();
  private sqlDbsByKey: Map<string, SqlDbDto> = new Map();

  // Enhanced graph structures for advanced correlation
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private entityRelationships: Map<string, string[]> = new Map();
  private entityMetadata: Map<string, Record<string, any>> = new Map();

  // Cache for expensive projections
  private projectionCache: Map<string, { data: any; timestamp: Date }> = new Map();
  private cacheTTL: number = 15 * 60 * 1000; // 15 minutes

  constructor(dataRoot: string = 'C:\\discoverydata\\ljpops\\Raw') {
    super();
    this.dataRoot = dataRoot;
    this.fuzzyConfig = {
      levenshteinThreshold: 0.75, // 75% similarity required for fuzzy match
      enableFuzzyMatching: true,
    };
  }

  /**
   * Main orchestration method - loads all CSV data and applies inference
   */
  async loadAllAsync(profilePath: string): Promise<boolean> {
    if (this.isLoading) {
      console.warn('Load already in progress, skipping duplicate request');
      return false;
    }

    try {
      this.isLoading = true;
      const startTime = Date.now();
      this.appliedInferenceRules = [];

      console.log(`Starting LogicEngine data load from ${profilePath}`);

      // Check for CSV changes (optimization - skip reload if no changes)
      const csvFiles = await this.getCsvFiles(profilePath);
      const hasChanges = await this.hasFileChanges(csvFiles);

      if (!hasChanges && this.lastLoadTime) {
        console.log('No CSV changes detected. Using cached data');
        return true;
      }

      // Clear existing data stores
      this.clearDataStores();

      // Load CSV data with controlled concurrency (parallel loading)
      await Promise.all([
        this.loadUsersStreamingAsync(profilePath),
        this.loadGroupsStreamingAsync(profilePath),
        this.loadDevicesStreamingAsync(profilePath),
        this.loadApplicationsStreamingAsync(profilePath),
        this.loadGposStreamingAsync(profilePath),
        this.loadAclsStreamingAsync(profilePath),
        this.loadMappedDrivesStreamingAsync(profilePath),
        this.loadMailboxesStreamingAsync(profilePath),
        this.loadAzureRolesStreamingAsync(profilePath),
        this.loadSqlDatabasesStreamingAsync(profilePath),
      ]);

      // Build indices for fast lookups
      await this.buildIndicesAsync();

      // Apply inference rules for data correlation
      await this.applyInferenceRulesAsync();

      // Update file timestamps
      for (const file of csvFiles) {
        this.fileLoadTimes.set(file, await this.getFileModTime(file));
      }

      this.lastLoadTime = new Date();
      const duration = Date.now() - startTime;

      console.log(`LogicEngine data load completed in ${duration}ms`);
      console.log(`  Users: ${this.usersBySid.size}`);
      console.log(`  Groups: ${this.groupsBySid.size}`);
      console.log(`  Devices: ${this.devicesByName.size}`);
      console.log(`  Inference Rules Applied: ${this.appliedInferenceRules.length}`);

      // Emit completion event
      this.emit('data-loaded', {
        duration,
        stats: this.getStatistics(),
        inferenceRules: this.appliedInferenceRules,
      });

      return true;
    } catch (error: any) {
      console.error('Failed to load LogicEngine data:', error);
      this.emit('data-load-error', { error: error.message });
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Build UserDetailProjection with all correlated data
   */
  buildUserDetailProjection(sidOrUpn: string): UserDetailProjection | null {
    // Check cache first
    const cacheKey = `user-detail:${sidOrUpn}`;
    const cached = this.projectionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTTL) {
      return cached.data;
    }

    // Find user
    const user = this.usersBySid.get(sidOrUpn) || this.usersByUpn.get(sidOrUpn);
    if (!user) return null;

    // Build projection with all correlated data
    const groups = this.groupsByUserSid.get(user.sid)?.map(groupSid =>
      this.groupsBySid.get(groupSid)!
    ).filter(Boolean) || [];

    const devices = this.devicesByPrimaryUserSid.get(user.sid) || [];

    const apps = devices.flatMap(device =>
      this.appsByDevice.get(device.name)?.map(appId =>
        this.appsById.get(appId)!
      ).filter(Boolean) || []
    );

    const drives = this.drivesByUserSid.get(user.sid) || [];
    const shares = this.aclByIdentitySid.get(user.sid) || [];
    const mailbox = this.mailboxByUpn.get(user.upn || '');
    const azureRoles = this.rolesByPrincipalId.get(user.azureObjectId || '') || [];

    const gpoLinks = this.getUserApplicableGpos(user);
    const gpoFilters = this.gposBySidFilter.get(user.sid) || [];
    const sqlDatabases = this.getUserSqlDatabases(user.sid);
    const risks = this.calculateEntityRisks(user.sid, 'User');
    const migrationHints = this.generateMigrationHints(user.sid, 'User');

    const projection: UserDetailProjection = {
      user,
      groups,
      devices,
      apps,
      drives,
      shares,
      gpoLinks,
      gpoFilters,
      mailbox,
      azureRoles,
      sqlDatabases,
      risks,
      migrationHints,
    };

    // Cache the projection
    this.projectionCache.set(cacheKey, { data: projection, timestamp: new Date() });

    return projection;
  }

  // ... (Additional methods follow in next section)
}
```

#### 4.2 CSV Loading Methods (Streaming)

**Pattern:** Memory-efficient streaming CSV parser using Node.js streams

```typescript
/**
 * Load users from CSV with streaming (memory-efficient for large datasets)
 */
private async loadUsersStreamingAsync(profilePath: string): Promise<void> {
  const filePatterns = ['ActiveDirectoryUsers_*.csv', '*Users*.csv'];
  let loadedCount = 0;

  for (const pattern of filePatterns) {
    const files = await glob(pattern, { cwd: profilePath });

    for (const filePath of files) {
      try {
        const parser = createReadStream(path.join(profilePath, filePath))
          .pipe(csvParser());

        for await (const row of parser) {
          const user = this.parseUserFromCsv(row);
          if (user) {
            this.usersBySid.set(user.sid, user);
            if (user.upn) {
              this.usersByUpn.set(user.upn, user);
            }
            loadedCount++;
          }
        }
      } catch (error: any) {
        console.error(`Error loading users from ${filePath}:`, error.message);
      }
    }
  }

  console.log(`Loaded ${loadedCount} users from CSV files`);
}

/**
 * Parse user from CSV row (handle header variations)
 */
private parseUserFromCsv(row: Record<string, string>): UserDto | null {
  try {
    // Handle header variations (case-insensitive)
    const getSafe = (key: string): string | undefined => {
      const keys = Object.keys(row);
      const match = keys.find(k => k.toLowerCase() === key.toLowerCase());
      return match ? row[match] : undefined;
    };

    const sid = getSafe('sid') || getSafe('objectsid');
    const sam = getSafe('sam') || getSafe('samaccountname');
    const upn = getSafe('upn') || getSafe('userprincipalname');
    const displayName = getSafe('displayname') || getSafe('name');

    if (!sid || !sam) return null; // Required fields

    return {
      sid,
      sam,
      upn: upn || undefined,
      displayName: displayName || undefined,
      mail: getSafe('mail') || undefined,
      enabled: getSafe('enabled') === 'True' || getSafe('enabled') === '1',
      azureObjectId: getSafe('azureobjectid') || undefined,
      ou: getSafe('ou') || getSafe('distinguishedname') || undefined,
      lastLogon: getSafe('lastlogon') ? new Date(getSafe('lastlogon')!) : undefined,
      passwordLastSet: getSafe('passwordlastset') ? new Date(getSafe('passwordlastset')!) : undefined,
      accountExpires: getSafe('accountexpires') ? new Date(getSafe('accountexpires')!) : undefined,
      discoveryTimestamp: new Date(getSafe('_discoverytimestamp') || Date.now()),
      discoveryModule: getSafe('_discoverymodule') || 'ActiveDirectory',
      sessionId: getSafe('_sessionid') || crypto.randomUUID(),
    };
  } catch (error: any) {
    console.warn('Failed to parse user from CSV:', error.message);
    return null;
  }
}

/**
 * Load groups from CSV with member correlation
 */
private async loadGroupsStreamingAsync(profilePath: string): Promise<void> {
  const filePatterns = ['ActiveDirectoryGroups_*.csv', '*Groups*.csv', 'GroupMembers_*.csv'];
  let loadedCount = 0;

  for (const pattern of filePatterns) {
    const files = await glob(pattern, { cwd: profilePath });

    for (const filePath of files) {
      try {
        const parser = createReadStream(path.join(profilePath, filePath))
          .pipe(csvParser());

        for await (const row of parser) {
          const group = this.parseGroupFromCsv(row);
          if (group) {
            this.groupsBySid.set(group.sid, group);

            // Store member relationships
            if (group.members && group.members.length > 0) {
              this.membersByGroupSid.set(group.sid, group.members);

              // Reverse index: user -> groups
              for (const memberSid of group.members) {
                const existing = this.groupsByUserSid.get(memberSid) || [];
                existing.push(group.sid);
                this.groupsByUserSid.set(memberSid, existing);
              }
            }

            loadedCount++;
          }
        }
      } catch (error: any) {
        console.error(`Error loading groups from ${filePath}:`, error.message);
      }
    }
  }

  console.log(`Loaded ${loadedCount} groups from CSV files`);
}

// Similar patterns for: loadDevicesStreamingAsync, loadApplicationsStreamingAsync,
// loadAclsStreamingAsync, loadMailboxesStreamingAsync, etc.
```

#### 4.3 Index Building

```typescript
/**
 * Build secondary indices for fast lookups
 */
private async buildIndicesAsync(): Promise<void> {
  console.log('Building indices for fast lookups...');

  // Build device -> primary user index
  for (const [name, device] of this.devicesByName.entries()) {
    if (device.primaryUserSid) {
      const existing = this.devicesByPrimaryUserSid.get(device.primaryUserSid) || [];
      existing.push(device);
      this.devicesByPrimaryUserSid.set(device.primaryUserSid, existing);
    }
  }

  // Build app -> device index
  for (const [name, device] of this.devicesByName.entries()) {
    if (device.installedApps && device.installedApps.length > 0) {
      for (const appName of device.installedApps) {
        // Fuzzy match app name to app ID
        const app = this.fuzzyMatchApplication(appName, Array.from(this.appsById.keys()));
        if (app) {
          const existing = this.appsByDevice.get(name) || [];
          existing.push(app.id);
          this.appsByDevice.set(name, existing);
        }
      }
    }
  }

  // Build GPO indices by OU and SID filter
  for (const [guid, gpo] of this.gposByGuid.entries()) {
    // Index by OU links
    if (gpo.linkedOus && gpo.linkedOus.length > 0) {
      for (const ou of gpo.linkedOus) {
        const existing = this.gposByOu.get(ou) || [];
        existing.push(gpo);
        this.gposByOu.set(ou, existing);
      }
    }

    // Index by security filters (SID)
    if (gpo.securityFilters && gpo.securityFilters.length > 0) {
      for (const sid of gpo.securityFilters) {
        const existing = this.gposBySidFilter.get(sid) || [];
        existing.push(gpo);
        this.gposBySidFilter.set(sid, existing);
      }
    }
  }

  console.log('Indices built successfully');
}
```

---

## Data Correlation Algorithms

### Algorithm 1: ACL → Group → User Inference

**Purpose:** Propagate file share permissions from groups to individual users

**Implementation:**
```typescript
private applyAclGroupUserInference(): void {
  for (const [identitySid, entries] of this.aclByIdentitySid.entries()) {
    // If the identity is a group, propagate ACLs to its members
    if (this.groupsBySid.has(identitySid)) {
      const members = this.membersByGroupSid.get(identitySid) || [];

      for (const memberSid of members) {
        for (const entry of entries) {
          // Add ACL entry to user's permission list
          const userEntries = this.aclByIdentitySid.get(memberSid) || [];
          userEntries.push({
            ...entry,
            inheritedFrom: identitySid, // Track that this was inherited
          });
          this.aclByIdentitySid.set(memberSid, userEntries);
        }
      }
    }
  }

  this.appliedInferenceRules.push('ACL→Group→User inference');
}
```

**Complexity:** O(G × M × A) where G=groups, M=avg members per group, A=avg ACL entries per group
**Optimization:** Process in parallel using workers for large datasets

### Algorithm 2: Primary Device Inference

**Purpose:** Infer primary device for users based on last logon timestamp

**Implementation:**
```typescript
private applyPrimaryDeviceInference(): void {
  for (const [name, device] of this.devicesByName.entries()) {
    if (!device.primaryUserSid) {
      // Find most recent logon user
      const logonEvents = this.getDeviceLogonEvents(name);
      if (logonEvents.length > 0) {
        // Sort by timestamp desc
        logonEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        const primaryUserSid = logonEvents[0].userSid;
        device.primaryUserSid = primaryUserSid;

        this.appliedInferenceRules.push(
          `Inferred primary user ${primaryUserSid} for device ${name} based on last logon`
        );
      }
    }
  }
}
```

### Algorithm 3: GPO Applicability Inference

**Purpose:** Determine which GPOs apply to a user based on OU and security filtering

**Implementation:**
```typescript
private getUserApplicableGpos(user: UserDto): GpoDto[] {
  const applicable: GpoDto[] = [];

  // Extract OU from user's distinguished name
  const userOu = this.extractOuFromDn(user.ou || '');

  // Get all GPOs linked to user's OU (or parent OUs)
  const ouParts = userOu.split(',').filter(p => p.startsWith('OU='));

  for (let i = 0; i < ouParts.length; i++) {
    const currentOu = ouParts.slice(i).join(',');
    const gpos = this.gposByOu.get(currentOu) || [];

    for (const gpo of gpos) {
      // Check security filtering
      const hasSecurityFilter = !gpo.securityFilters || gpo.securityFilters.length === 0 ||
        gpo.securityFilters.includes(user.sid) ||
        this.groupsByUserSid.get(user.sid)?.some(groupSid =>
          gpo.securityFilters?.includes(groupSid)
        );

      if (hasSecurityFilter) {
        applicable.push(gpo);
      }
    }
  }

  return applicable;
}
```

### Algorithm 4: Application Usage Correlation

**Purpose:** Correlate installed applications across devices to identify usage patterns

**Implementation:**
```typescript
private applyApplicationUsageInference(): void {
  const appUsageMap = new Map<string, Set<string>>(); // appId -> Set of userSids

  // Build app usage map
  for (const [name, device] of this.devicesByName.entries()) {
    if (device.primaryUserSid && device.installedApps) {
      for (const appName of device.installedApps) {
        const app = this.fuzzyMatchApplication(appName, Array.from(this.appsById.keys()));
        if (app) {
          const users = appUsageMap.get(app.id) || new Set();
          users.add(device.primaryUserSid);
          appUsageMap.set(app.id, users);
        }
      }
    }
  }

  // Update app install counts
  for (const [appId, users] of appUsageMap.entries()) {
    const app = this.appsById.get(appId);
    if (app) {
      app.installCount = users.size;
      this.appsById.set(appId, app);
    }
  }

  this.appliedInferenceRules.push('Application usage correlation');
}
```

---

## Inference Rules Specification

### Rule Set Overview

The LogicEngine applies **9 core inference rules** in the following order:

1. **ACL → Group → User Inference** - Propagate permissions from groups to users
2. **Primary Device Inference** - Assign primary device based on logon frequency
3. **GPO Security Filtering** - Determine GPO applicability
4. **Application Usage Inference** - Correlate app installs to users
5. **Azure Role Inference** - Match on-prem users to Azure roles
6. **SQL Ownership Inference** - Map database access to users
7. **Mailbox Correlation** - Match Exchange mailboxes to users
8. **Mapped Drive Network Correlation** - Identify network dependencies
9. **Cross-Module Threat Correlation** - Link security threats to assets

### Rule Execution Strategy

```typescript
private async applyInferenceRulesAsync(): Promise<void> {
  console.log('Applying inference rules...');

  // Sequential execution (order matters for some rules)
  this.applyAclGroupUserInference();
  this.applyPrimaryDeviceInference();
  this.applyGpoSecurityFilterInference();
  this.applyApplicationUsageInference();
  this.applyAzureRoleInference();
  this.applySqlOwnershipInference();
  this.applyMailboxCorrelation();
  this.applyMappedDriveNetworkCorrelation();
  this.applyCrossModuleThreatCorrelation();

  // Fuzzy matching pass (last, as it's most expensive)
  if (this.fuzzyConfig.enableFuzzyMatching) {
    this.applyFuzzyIdentityMatching();
  }

  console.log(`Applied ${this.appliedInferenceRules.length} inference rules`);
}
```

### Rule Dependencies

```
ACL→Group→User ──┐
                 ├──> Primary Device
GPO Filtering ───┘

Azure Roles ─────┐
                 ├──> Mailbox Correlation
SQL Ownership ───┘

Fuzzy Matching (applied last, uses all data)
```

---

## Fuzzy Matching Implementation

### Levenshtein Distance Algorithm

**Purpose:** Calculate string similarity for identity resolution and application matching

**Implementation:**
```typescript
/**
 * Calculate Levenshtein similarity ratio (0.0 to 1.0)
 *
 * Algorithm: Dynamic programming with O(n×m) complexity
 * Returns: 1.0 for identical strings, 0.0 for completely different
 */
private calculateLevenshteinSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) {
    return (!s1 && !s2) ? 1.0 : 0.0;
  }

  const len1 = s1.length;
  const len2 = s2.length;

  // Create DP matrix
  const matrix: number[][] = Array.from({ length: len1 + 1 }, () =>
    Array(len2 + 1).fill(0)
  );

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  // Calculate similarity ratio
  const maxLength = Math.max(len1, len2);
  if (maxLength === 0) return 1.0;

  const distance = matrix[len1][len2];
  const similarity = 1.0 - (distance / maxLength);

  return similarity;
}
```

**Performance Characteristics:**
- Time Complexity: O(n × m) where n, m are string lengths
- Space Complexity: O(n × m) for DP matrix
- Optimization: Early exit if strings are identical (O(1))
- Optimization: Cache results for frequently compared strings

### Fuzzy Application Matching

```typescript
/**
 * Fuzzy match application name to installed apps
 * Returns best match if similarity >= threshold (default 0.75)
 */
private fuzzyMatchApplication(appNameCandidate: string, installedAppIds: string[]): AppDto | null {
  let bestMatch: AppDto | null = null;
  let bestSimilarity = 0.0;

  for (const appId of installedAppIds) {
    const app = this.appsById.get(appId);
    if (!app) continue;

    const similarity = this.calculateLevenshteinSimilarity(appNameCandidate, app.name);

    if (similarity >= this.fuzzyConfig.levenshteinThreshold && similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = app;
    }
  }

  if (bestMatch) {
    this.appliedInferenceRules.push(
      `Fuzzy app match: '${appNameCandidate}' → '${bestMatch.name}' (${(bestSimilarity * 100).toFixed(1)}%)`
    );
  }

  return bestMatch;
}
```

### Fuzzy User Matching

```typescript
/**
 * Fuzzy match user by display name, UPN, or email
 */
private fuzzyMatchUser(searchTerm: string, searchType: 'displayName' | 'upn' | 'mail' = 'displayName'): UserDto | null {
  let bestMatch: UserDto | null = null;
  let bestSimilarity = 0.0;

  for (const [sid, user] of this.usersBySid.entries()) {
    let targetValue: string;

    switch (searchType) {
      case 'upn':
        targetValue = user.upn || '';
        break;
      case 'mail':
        targetValue = user.mail || '';
        break;
      default:
        targetValue = user.displayName || user.sam || '';
    }

    if (!targetValue) continue;

    const similarity = this.calculateLevenshteinSimilarity(searchTerm, targetValue);

    if (similarity >= this.fuzzyConfig.levenshteinThreshold && similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = user;
    }
  }

  if (bestMatch) {
    this.appliedInferenceRules.push(
      `Fuzzy user match: '${searchTerm}' → '${bestMatch.displayName || bestMatch.sam}' (${(bestSimilarity * 100).toFixed(1)}%)`
    );
  }

  return bestMatch;
}
```

### Fuzzy Identity Name Resolution

```typescript
/**
 * Resolve SID to friendly name using fuzzy matching
 * Handles well-known SIDs and domain SID patterns
 */
private fuzzyMatchIdentityName(sid: string): string | null {
  // Well-known SIDs (exact matches)
  const wellKnownSids: Record<string, string> = {
    'S-1-5-18': 'LocalSystem',
    'S-1-5-19': 'LocalService',
    'S-1-5-20': 'NetworkService',
    'S-1-5-21-*-512': 'Domain Admins',
    'S-1-5-21-*-513': 'Domain Users',
    'S-1-5-21-*-514': 'Domain Guests',
    'S-1-5-21-*-515': 'Enterprise Admins',
  };

  // Check well-known SIDs
  for (const [pattern, name] of Object.entries(wellKnownSids)) {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '[0-9-]+') + '$');
      if (regex.test(sid)) return name;
    } else if (sid === pattern) {
      return name;
    }
  }

  // Domain SID pattern matching (S-1-5-21-X-X-X-RID)
  if (sid.startsWith('S-1-5-21-')) {
    return this.fuzzyFindClosestSidMatch(sid);
  }

  return null;
}

/**
 * Find closest SID match by comparing domain portions
 */
private fuzzyFindClosestSidMatch(targetSid: string): string | null {
  const targetParts = targetSid.split('-');
  if (targetParts.length < 8) return null;

  let bestMatch: string | null = null;
  let bestSimilarity = 0.0;

  // Compare against all known user SIDs
  for (const [sid, user] of this.usersBySid.entries()) {
    const candidateParts = sid.split('-');
    if (candidateParts.length < 8) continue;

    // Calculate domain similarity (compare domain ID portions)
    const targetDomainId = parseInt(targetParts[7], 10);
    const candidateDomainId = parseInt(candidateParts[7], 10);

    if (isNaN(targetDomainId) || isNaN(candidateDomainId)) continue;

    const domainDiff = Math.abs(targetDomainId - candidateDomainId);
    const domainSimilarity = domainDiff <= 10 ? (10.0 - domainDiff) / 10.0 : 0.0;

    if (domainSimilarity > bestSimilarity && domainSimilarity > 0.5) {
      bestSimilarity = domainSimilarity;
      bestMatch = `${user.displayName || user.sam}@${user.upn}`;
    }
  }

  // Also check groups
  for (const [sid, group] of this.groupsBySid.entries()) {
    const candidateParts = sid.split('-');
    if (candidateParts.length < 8) continue;

    const targetDomainId = parseInt(targetParts[7], 10);
    const candidateDomainId = parseInt(candidateParts[7], 10);

    if (isNaN(targetDomainId) || isNaN(candidateDomainId)) continue;

    const domainDiff = Math.abs(targetDomainId - candidateDomainId);
    const domainSimilarity = domainDiff <= 10 ? (10.0 - domainDiff) / 10.0 : 0.0;

    if (domainSimilarity > bestSimilarity && domainSimilarity > 0.5) {
      bestSimilarity = domainSimilarity;
      bestMatch = `Group: ${group.name}`;
    }
  }

  return bestMatch;
}
```

---

## Caching & Performance Strategy

### Multi-Tier Caching Architecture

```typescript
/**
 * Cache Strategy:
 *
 * Tier 1 (Hot Cache): In-memory Map for recent projections (15-minute TTL)
 * Tier 2 (Warm Cache): LRU cache for less frequent access (1-hour TTL)
 * Tier 3 (Cold Storage): CSV files (re-read on cache miss)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  accessCount: number;
}

class ProjectionCache {
  private hotCache: Map<string, CacheEntry<any>> = new Map();
  private maxHotCacheSize = 1000; // entries
  private hotCacheTTL = 15 * 60 * 1000; // 15 minutes
  private lruCache: LRUCache<string, any>; // Using lru-cache library

  constructor() {
    this.lruCache = new LRUCache({
      max: 5000,
      ttl: 60 * 60 * 1000, // 1 hour
      updateAgeOnGet: true,
    });
  }

  get<T>(key: string): T | null {
    // Check hot cache first
    const hotEntry = this.hotCache.get(key);
    if (hotEntry && Date.now() - hotEntry.timestamp.getTime() < this.hotCacheTTL) {
      hotEntry.accessCount++;
      return hotEntry.data as T;
    }

    // Check LRU cache
    const lruEntry = this.lruCache.get(key);
    if (lruEntry) {
      // Promote to hot cache if frequently accessed
      this.promoteToHotCache(key, lruEntry);
      return lruEntry as T;
    }

    return null;
  }

  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      accessCount: 1,
    };

    // Store in both tiers
    this.hotCache.set(key, entry);
    this.lruCache.set(key, data);

    // Evict old entries if hot cache is full
    if (this.hotCache.size > this.maxHotCacheSize) {
      this.evictLeastUsed();
    }
  }

  private promoteToHotCache(key: string, data: any): void {
    const entry: CacheEntry<any> = {
      data,
      timestamp: new Date(),
      accessCount: 1,
    };
    this.hotCache.set(key, entry);
  }

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let minAccessCount = Infinity;

    for (const [key, entry] of this.hotCache.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.hotCache.delete(leastUsedKey);
    }
  }

  clear(): void {
    this.hotCache.clear();
    this.lruCache.clear();
  }
}
```

### Performance Optimizations

#### 1. Lazy Loading
```typescript
// Only load CSVs when needed
private csvDataLoaded = new Set<string>();

async ensureDataLoaded(dataType: 'users' | 'groups' | 'devices'): Promise<void> {
  if (this.csvDataLoaded.has(dataType)) return;

  switch (dataType) {
    case 'users':
      await this.loadUsersStreamingAsync(this.dataRoot);
      break;
    case 'groups':
      await this.loadGroupsStreamingAsync(this.dataRoot);
      break;
    case 'devices':
      await this.loadDevicesStreamingAsync(this.dataRoot);
      break;
  }

  this.csvDataLoaded.add(dataType);
}
```

#### 2. Batch Processing
```typescript
// Process users in batches to prevent memory spikes
private async processUserBatch(users: UserDto[]): Promise<void> {
  const batchSize = 1000;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    for (const user of batch) {
      this.usersBySid.set(user.sid, user);
      if (user.upn) {
        this.usersByUpn.set(user.upn, user);
      }
    }

    // Yield to event loop every batch
    await new Promise(resolve => setImmediate(resolve));
  }
}
```

#### 3. Parallel CSV Loading
```typescript
// Load multiple CSVs in parallel (respecting semaphore limit)
private async loadAllCsvsParallel(profilePath: string): Promise<void> {
  const concurrencyLimit = 3; // Max 3 concurrent file reads
  const semaphore = new Semaphore(concurrencyLimit);

  const loadTasks = [
    () => this.loadUsersStreamingAsync(profilePath),
    () => this.loadGroupsStreamingAsync(profilePath),
    () => this.loadDevicesStreamingAsync(profilePath),
    () => this.loadApplicationsStreamingAsync(profilePath),
    // ... more loaders
  ];

  await Promise.all(loadTasks.map(task =>
    semaphore.runExclusive(task)
  ));
}
```

#### 4. Index Warming
```typescript
// Pre-populate indices on startup
async warmCache(): Promise<void> {
  console.log('Warming cache with common projections...');

  // Get top 100 most active users
  const activeUsers = Array.from(this.usersBySid.values())
    .sort((a, b) => (b.lastLogon?.getTime() || 0) - (a.lastLogon?.getTime() || 0))
    .slice(0, 100);

  // Build projections in parallel
  await Promise.all(activeUsers.map(user =>
    this.buildUserDetailProjection(user.sid)
  ));

  console.log('Cache warmed with 100 user projections');
}
```

### Memory Management

```typescript
/**
 * Monitor memory usage and trigger GC if needed
 */
private monitorMemory(): void {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;

  if (heapUsedMB > 500) { // Threshold: 500MB
    console.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);

    // Clear least-used cache entries
    this.cache.evictLeastUsed();

    // Suggest GC (Node.js will decide when to run it)
    if (global.gc) {
      global.gc();
    }
  }
}
```

---

## IPC Integration Design

### IPC Handler Specifications

**Location:** `guiv2/src/main/ipcHandlers.ts`

```typescript
import { ipcMain } from 'electron';
import { LogicEngineService } from './services/logicEngineService';

let logicEngineInstance: LogicEngineService | null = null;

export function registerLogicEngineHandlers(profileService: ProfileService): void {
  /**
   * Initialize LogicEngine for a specific profile
   */
  ipcMain.handle('logic-engine:init', async (event, { profilePath }) => {
    try {
      logicEngineInstance = new LogicEngineService(profilePath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Load all CSV data and apply inference rules
   */
  ipcMain.handle('logic-engine:load-all', async (event, { profilePath }) => {
    try {
      if (!logicEngineInstance) {
        logicEngineInstance = new LogicEngineService(profilePath);
      }

      const success = await logicEngineInstance.loadAllAsync(profilePath);
      const stats = logicEngineInstance.getStatistics();
      const rules = logicEngineInstance.getAppliedInferenceRules();

      return { success, data: { stats, rules } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get UserDetailProjection for a specific user
   */
  ipcMain.handle('logic-engine:get-user-detail', async (event, { sidOrUpn }) => {
    try {
      if (!logicEngineInstance) {
        throw new Error('LogicEngine not initialized. Call logic-engine:load-all first.');
      }

      const projection = logicEngineInstance.buildUserDetailProjection(sidOrUpn);

      if (!projection) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: projection };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get ComputerDetailProjection for a specific device
   */
  ipcMain.handle('logic-engine:get-computer-detail', async (event, { deviceName }) => {
    try {
      if (!logicEngineInstance) {
        throw new Error('LogicEngine not initialized.');
      }

      const projection = logicEngineInstance.buildComputerDetailProjection(deviceName);

      if (!projection) {
        return { success: false, error: 'Computer not found' };
      }

      return { success: true, data: projection };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get GroupDetailProjection for a specific group
   */
  ipcMain.handle('logic-engine:get-group-detail', async (event, { groupSid }) => {
    try {
      if (!logicEngineInstance) {
        throw new Error('LogicEngine not initialized.');
      }

      const projection = logicEngineInstance.buildGroupDetailProjection(groupSid);

      if (!projection) {
        return { success: false, error: 'Group not found' };
      }

      return { success: true, data: projection };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get load statistics and inference rules
   */
  ipcMain.handle('logic-engine:get-statistics', async () => {
    try {
      if (!logicEngineInstance) {
        return { success: false, error: 'LogicEngine not initialized' };
      }

      const stats = logicEngineInstance.getStatistics();
      const rules = logicEngineInstance.getAppliedInferenceRules();

      return { success: true, data: { stats, rules } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Clear cache and force reload
   */
  ipcMain.handle('logic-engine:clear-cache', async () => {
    try {
      if (!logicEngineInstance) {
        return { success: false, error: 'LogicEngine not initialized' };
      }

      logicEngineInstance.clearCache();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
```

### Preload API Exposure

**Location:** `guiv2/src/preload.ts`

```typescript
// Add to existing contextBridge.exposeInMainWorld('electron', { ... })

// LogicEngine APIs
'logic-engine:init': (profilePath: string) =>
  ipcRenderer.invoke('logic-engine:init', { profilePath }),

'logic-engine:load-all': (profilePath: string) =>
  ipcRenderer.invoke('logic-engine:load-all', { profilePath }),

'logic-engine:get-user-detail': (sidOrUpn: string) =>
  ipcRenderer.invoke('logic-engine:get-user-detail', { sidOrUpn }),

'logic-engine:get-computer-detail': (deviceName: string) =>
  ipcRenderer.invoke('logic-engine:get-computer-detail', { deviceName }),

'logic-engine:get-group-detail': (groupSid: string) =>
  ipcRenderer.invoke('logic-engine:get-group-detail', { groupSid }),

'logic-engine:get-statistics': () =>
  ipcRenderer.invoke('logic-engine:get-statistics'),

'logic-engine:clear-cache': () =>
  ipcRenderer.invoke('logic-engine:clear-cache'),
```

### TypeScript Types for IPC

**Location:** `guiv2/src/types/electron.d.ts`

```typescript
interface ElectronAPI {
  // ... existing APIs

  // LogicEngine APIs
  logicEngine: {
    init: (profilePath: string) => Promise<{ success: boolean; error?: string }>;
    loadAll: (profilePath: string) => Promise<{
      success: boolean;
      data?: {
        stats: DataLoadStatistics;
        rules: string[];
      };
      error?: string;
    }>;
    getUserDetail: (sidOrUpn: string) => Promise<{
      success: boolean;
      data?: UserDetailProjection;
      error?: string;
    }>;
    getComputerDetail: (deviceName: string) => Promise<{
      success: boolean;
      data?: ComputerDetailProjection;
      error?: string;
    }>;
    getGroupDetail: (groupSid: string) => Promise<{
      success: boolean;
      data?: GroupDetailProjection;
      error?: string;
    }>;
    getStatistics: () => Promise<{
      success: boolean;
      data?: {
        stats: DataLoadStatistics;
        rules: string[];
      };
      error?: string;
    }>;
    clearCache: () => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
```

---

## Testing Strategy

### Unit Tests

#### Epic 3: Discovery Execution Tests

```typescript
// guiv2/src/main/services/__tests__/discoveryExecution.test.ts

describe('Discovery Module Execution', () => {
  it('should execute module with streaming output', async () => {
    const service = new PowerShellExecutionService();
    await service.initialize();

    const outputs: OutputData[] = [];
    service.on('output', (data) => outputs.push(data));

    const result = await service.executeScript(
      'Modules/Discovery/Get-AllUsers.psm1',
      ['-DomainController', 'dc.contoso.com'],
      { streamOutput: true }
    );

    expect(result.success).toBe(true);
    expect(outputs.length).toBeGreaterThan(0);
  });

  it('should cancel running execution', async () => {
    const service = new PowerShellExecutionService();
    await service.initialize();

    const executionId = crypto.randomUUID();
    const promise = service.executeScript(
      'Modules/Discovery/LongRunningModule.psm1',
      [],
      { cancellationToken: executionId }
    );

    setTimeout(() => {
      service.cancelExecution(executionId);
    }, 1000);

    const result = await promise;
    expect(result.success).toBe(false);
    expect(result.error).toContain('cancelled');
  });

  it('should parse progress from verbose output', () => {
    const verboseOutput = 'PROGRESS: 45% - Processing user: jdoe (150/1000) ETA: 2m 30s';
    const progress = parseProgressFromVerbose(verboseOutput);

    expect(progress).toEqual({
      percentage: 45,
      message: 'Processing user: jdoe',
      currentItem: 'jdoe',
      itemsProcessed: 150,
      totalItems: 1000,
      estimatedTimeRemaining: 150000, // 2m 30s in ms
    });
  });
});
```

#### Epic 4: LogicEngine Tests

```typescript
// guiv2/src/main/services/__tests__/logicEngineService.test.ts

describe('LogicEngineService', () => {
  let service: LogicEngineService;

  beforeEach(() => {
    service = new LogicEngineService('test/fixtures/data');
  });

  describe('CSV Loading', () => {
    it('should load users from CSV with header variations', async () => {
      await service.loadAllAsync('test/fixtures/data');

      const stats = service.getStatistics();
      expect(stats.userCount).toBeGreaterThan(0);
    });

    it('should handle malformed CSV rows gracefully', async () => {
      // Test with CSV containing invalid rows
      await service.loadAllAsync('test/fixtures/malformed-data');

      const stats = service.getStatistics();
      expect(stats.userCount).toBe(5); // Should skip invalid rows
    });

    it('should build secondary indices', async () => {
      await service.loadAllAsync('test/fixtures/data');

      const user = service.getUserBySid('S-1-5-21-123-456-789-1001');
      const devices = service.getDevicesByPrimaryUser(user!.sid);

      expect(devices.length).toBeGreaterThan(0);
    });
  });

  describe('Inference Rules', () => {
    it('should apply ACL→Group→User inference', async () => {
      await service.loadAllAsync('test/fixtures/data');

      const user = service.getUserBySid('S-1-5-21-123-456-789-1001');
      const acls = service.getAclEntriesForUser(user!.sid);

      // User should have inherited ACLs from group memberships
      const inheritedAcls = acls.filter(acl => acl.inheritedFrom);
      expect(inheritedAcls.length).toBeGreaterThan(0);
    });

    it('should infer primary device from logon frequency', async () => {
      await service.loadAllAsync('test/fixtures/data');

      const device = service.getDeviceByName('WORKSTATION-001');
      expect(device!.primaryUserSid).toBeDefined();
    });

    it('should apply GPO applicability rules', async () => {
      await service.loadAllAsync('test/fixtures/data');

      const user = service.getUserBySid('S-1-5-21-123-456-789-1001');
      const projection = service.buildUserDetailProjection(user!.sid);

      expect(projection!.gpoLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Fuzzy Matching', () => {
    it('should calculate Levenshtein similarity correctly', () => {
      const similarity = service['calculateLevenshteinSimilarity']('Microsoft Office', 'Microsoft Office 2021');
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should fuzzy match application names', () => {
      service['appsById'].set('app-1', {
        id: 'app-1',
        name: 'Google Chrome',
        source: 'MSI',
        installCount: 100,
      });

      const match = service['fuzzyMatchApplication']('Chrome', ['app-1']);
      expect(match).toBeDefined();
      expect(match!.name).toBe('Google Chrome');
    });

    it('should fuzzy match user identities', () => {
      service['usersBySid'].set('S-1-5-21-123-456-789-1001', {
        sid: 'S-1-5-21-123-456-789-1001',
        sam: 'jdoe',
        upn: 'jdoe@contoso.com',
        displayName: 'John Doe',
      });

      const match = service['fuzzyMatchUser']('Jon Doe', 'displayName');
      expect(match).toBeDefined();
      expect(match!.displayName).toBe('John Doe');
    });

    it('should resolve well-known SIDs', () => {
      const name = service['fuzzyMatchIdentityName']('S-1-5-18');
      expect(name).toBe('LocalSystem');
    });
  });

  describe('Projections', () => {
    it('should build UserDetailProjection with all correlated data', async () => {
      await service.loadAllAsync('test/fixtures/data');

      const projection = service.buildUserDetailProjection('S-1-5-21-123-456-789-1001');

      expect(projection).toBeDefined();
      expect(projection!.user).toBeDefined();
      expect(projection!.groups).toBeDefined();
      expect(projection!.devices).toBeDefined();
      expect(projection!.apps).toBeDefined();
      expect(projection!.shares).toBeDefined();
      expect(projection!.mailbox).toBeDefined();
    });

    it('should cache projections for performance', () => {
      const spy = jest.spyOn(service, 'buildUserDetailProjection');

      // First call - should build projection
      service.buildUserDetailProjection('S-1-5-21-123-456-789-1001');
      expect(spy).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      service.buildUserDetailProjection('S-1-5-21-123-456-789-1001');
      expect(spy).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should invalidate cache after TTL', async () => {
      jest.useFakeTimers();

      service.buildUserDetailProjection('S-1-5-21-123-456-789-1001');

      // Advance time beyond cache TTL (15 minutes)
      jest.advanceTimersByTime(16 * 60 * 1000);

      const spy = jest.spyOn(service, 'buildUserDetailProjection');
      service.buildUserDetailProjection('S-1-5-21-123-456-789-1001');

      expect(spy).toHaveBeenCalled(); // Should rebuild

      jest.useRealTimers();
    });
  });

  describe('Performance', () => {
    it('should load 10,000 users in under 5 seconds', async () => {
      const startTime = Date.now();
      await service.loadAllAsync('test/fixtures/large-dataset');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000);
      expect(service.getStatistics().userCount).toBe(10000);
    });

    it('should build projection in under 100ms (cache hit)', () => {
      service.buildUserDetailProjection('S-1-5-21-123-456-789-1001'); // Prime cache

      const startTime = Date.now();
      service.buildUserDetailProjection('S-1-5-21-123-456-789-1001');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('should use less than 500MB memory for 10,000 users', async () => {
      await service.loadAllAsync('test/fixtures/large-dataset');

      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;

      expect(heapUsedMB).toBeLessThan(500);
    });
  });
});
```

### Integration Tests

```typescript
// guiv2/tests/integration/discovery-to-logic-engine.test.ts

describe('Discovery → LogicEngine Integration', () => {
  it('should execute discovery module and load results into LogicEngine', async () => {
    // 1. Execute discovery module
    const discovery = new PowerShellExecutionService();
    await discovery.initialize();

    const result = await discovery.executeScript(
      'Modules/Discovery/Get-AllUsers.psm1',
      ['-DomainController', 'dc.contoso.com', '-OutputPath', 'test/output'],
      { timeout: 60000 }
    );

    expect(result.success).toBe(true);

    // 2. Load results into LogicEngine
    const logicEngine = new LogicEngineService('test/output');
    const loaded = await logicEngine.loadAllAsync('test/output');

    expect(loaded).toBe(true);

    // 3. Verify data is queryable
    const stats = logicEngine.getStatistics();
    expect(stats.userCount).toBeGreaterThan(0);

    // 4. Verify projections work
    const users = logicEngine.getUsers();
    const projection = logicEngine.buildUserDetailProjection(users[0].sid);

    expect(projection).toBeDefined();
    expect(projection!.user).toBeDefined();
  });
});
```

### End-to-End Tests

```typescript
// guiv2/tests/e2e/discovery-view.e2e.test.ts

describe('Discovery View E2E', () => {
  it('should execute discovery module from UI with real-time updates', async () => {
    // Navigate to Domain Discovery view
    await page.goto('http://localhost:3000/#/discovery/domain');

    // Fill in form
    await page.fill('[data-cy="domain-controller-input"]', 'dc.contoso.com');
    await page.click('[data-cy="include-users-checkbox"]');

    // Start discovery
    await page.click('[data-cy="start-discovery-button"]');

    // Wait for progress updates
    await page.waitForSelector('.discovery-progress-bar');

    // Verify logs are streaming
    const logViewer = await page.locator('.discovery-log-viewer');
    await expect(logViewer).toContainText('VERBOSE:');

    // Wait for completion
    await page.waitForSelector('[data-cy="export-results-button"]', { timeout: 120000 });

    // Verify results
    const resultsCount = await page.locator('[data-cy="results-count"]').textContent();
    expect(parseInt(resultsCount!)).toBeGreaterThan(0);
  });
});
```

---

## Implementation Roadmap

### Phase 1: Epic 3 - Discovery Execution (Est. 12-16 hours)

**Week 1 - Core Infrastructure:**

1. **IPC Handlers** (3 hours)
   - [ ] Implement `discovery:execute` handler with streaming
   - [ ] Implement `discovery:cancel` handler
   - [ ] Implement `discovery:get-modules` handler
   - [ ] Add progress parsing from PowerShell verbose output

2. **Custom Hook** (4 hours)
   - [ ] Create `useDiscoveryExecutionLogic.ts`
   - [ ] Implement state management
   - [ ] Set up IPC event listeners (output, progress, complete)
   - [ ] Implement `executeModule`, `cancelExecution`, `exportResults`
   - [ ] Write unit tests

3. **UI Components** (5 hours)
   - [ ] Create `DiscoveryLogViewer.tsx` with real-time streaming
   - [ ] Create `DiscoveryProgressBar.tsx` with ETA calculation
   - [ ] Create `LogLevelFilter.tsx` component
   - [ ] Integrate components into existing discovery views
   - [ ] Add keyboard shortcuts (Ctrl+C to cancel)

4. **Integration & Testing** (4 hours)
   - [ ] Update all 25 discovery views to use new hook
   - [ ] Test cancellation mechanism
   - [ ] Test with long-running modules (10+ minutes)
   - [ ] Write E2E tests for DomainDiscoveryView
   - [ ] Performance testing (verify no memory leaks on streaming)

### Phase 2: Epic 4 - Logic Engine Service (Est. 28-36 hours)

**Week 2 - Core Service Foundation:**

5. **Service Skeleton & Data Structures** (4 hours)
   - [ ] Create `logicEngineService.ts` with all data structures
   - [ ] Implement `loadAllAsync` orchestration
   - [ ] Implement `clearDataStores` method
   - [ ] Set up event emitters for data-loaded events
   - [ ] Create TypeScript types for all DTOs

6. **CSV Loading Methods** (8 hours)
   - [ ] Implement `loadUsersStreamingAsync` with header variation handling
   - [ ] Implement `loadGroupsStreamingAsync` with member correlation
   - [ ] Implement `loadDevicesStreamingAsync`
   - [ ] Implement `loadApplicationsStreamingAsync`
   - [ ] Implement `loadAclsStreamingAsync`
   - [ ] Implement `loadMailboxesStreamingAsync`
   - [ ] Implement `loadGposStreamingAsync`
   - [ ] Implement `loadSqlDatabasesStreamingAsync`
   - [ ] Implement `loadAzureRolesStreamingAsync`
   - [ ] Write tests for each loader

7. **Index Building** (4 hours)
   - [ ] Implement `buildIndicesAsync`
   - [ ] Build device → primary user index
   - [ ] Build app → device index with fuzzy matching
   - [ ] Build GPO → OU and SID filter indices
   - [ ] Build ACL reverse indices
   - [ ] Write tests for index correctness

**Week 3 - Inference & Correlation:**

8. **Inference Rules Implementation** (8 hours)
   - [ ] Implement `applyAclGroupUserInference`
   - [ ] Implement `applyPrimaryDeviceInference`
   - [ ] Implement `applyGpoSecurityFilterInference`
   - [ ] Implement `applyApplicationUsageInference`
   - [ ] Implement `applyAzureRoleInference`
   - [ ] Implement `applySqlOwnershipInference`
   - [ ] Implement `applyMailboxCorrelation`
   - [ ] Implement `applyMappedDriveNetworkCorrelation`
   - [ ] Write tests for each rule

9. **Fuzzy Matching** (4 hours)
   - [ ] Implement `calculateLevenshteinSimilarity`
   - [ ] Implement `fuzzyMatchApplication`
   - [ ] Implement `fuzzyMatchUser`
   - [ ] Implement `fuzzyMatchIdentityName`
   - [ ] Implement `fuzzyFindClosestSidMatch`
   - [ ] Write tests for fuzzy matching accuracy

10. **Projection Builders** (6 hours)
    - [ ] Implement `buildUserDetailProjection`
    - [ ] Implement `buildComputerDetailProjection`
    - [ ] Implement `buildGroupDetailProjection`
    - [ ] Implement `getUserApplicableGpos`
    - [ ] Implement `getUserSqlDatabases`
    - [ ] Implement `calculateEntityRisks`
    - [ ] Implement `generateMigrationHints`
    - [ ] Write tests for projection completeness

11. **Caching & Performance** (4 hours)
    - [ ] Implement `ProjectionCache` class
    - [ ] Add cache hit/miss tracking
    - [ ] Implement cache eviction policies
    - [ ] Add memory monitoring
    - [ ] Optimize CSV parsing (use worker threads for large files)
    - [ ] Write performance benchmarks

### Phase 3: Integration & Testing (Est. 8-12 hours)

**Week 4 - Full Integration:**

12. **IPC Integration** (3 hours)
    - [ ] Implement all LogicEngine IPC handlers
    - [ ] Update preload.ts with new APIs
    - [ ] Update TypeScript types in electron.d.ts
    - [ ] Test IPC communication end-to-end

13. **View Layer Integration** (5 hours)
    - [ ] Create `useUserDetailLogic.ts` hook
    - [ ] Update `UserDetailView.tsx` to use LogicEngine projections
    - [ ] Create `useComputerDetailLogic.ts` hook
    - [ ] Update `ComputerDetailView.tsx`
    - [ ] Create `useGroupDetailLogic.ts` hook
    - [ ] Update `GroupDetailView.tsx`
    - [ ] Add loading states and error handling

14. **Comprehensive Testing** (4 hours)
    - [ ] Write integration tests for discovery → logic engine flow
    - [ ] Write E2E tests for detail views
    - [ ] Performance testing with 10,000+ user dataset
    - [ ] Memory leak testing (24-hour soak test)
    - [ ] Load testing (concurrent detail view requests)

### Phase 4: Documentation & Handoff (Est. 4 hours)

15. **Final Documentation** (4 hours)
    - [ ] Update CLAUDE.md with Epic 3 & 4 completion status
    - [ ] Document LogicEngine API for future developers
    - [ ] Create debugging guide for inference rules
    - [ ] Write performance tuning guide
    - [ ] Record demo video showing real-time discovery execution
    - [ ] Prepare handoff document for gui-module-executor agent

---

## Context for Next Agent (gui-module-executor)

**Prepared by:** Architecture Lead
**For:** Implementation Agent (gui-module-executor)
**Date:** October 5, 2025

### What Has Been Designed

This architecture document provides **complete specifications** for Epic 3 (Discovery Module Execution) and Epic 4 (Logic Engine Service). All algorithms, data structures, IPC patterns, and performance requirements are defined.

### Critical Implementation Notes

1. **PowerShell Service Already Exists:** `guiv2/src/main/services/powerShellService.ts` is fully implemented with session pooling, streaming, and cancellation. You only need to integrate it with the UI layer via IPC handlers.

2. **Reference C# Implementation:** The C# `LogicEngineService.cs` (59,000 lines) contains all inference logic and algorithms. Port these patterns to TypeScript, following the structure defined in this document.

3. **CSV Header Variations:** Real discovery CSVs have inconsistent headers (e.g., "SID" vs "ObjectSID" vs "objectsid"). Your parsers MUST handle case-insensitive header matching (see `getSafe` pattern in spec).

4. **Performance is Critical:** The LogicEngine must load 10,000 users in < 5 seconds. Use streaming CSV parsing, batch processing, and parallel loading as specified.

5. **Fuzzy Matching Threshold:** The Levenshtein threshold is 0.75 (75% similarity). This balances precision vs recall. Do not change without testing.

6. **Caching Strategy:** Use the two-tier cache (hot + LRU) as specified. Projections are expensive (500ms+ without cache) but < 100ms with cache hit.

7. **Testing Requirements:** All code must have unit tests with > 80% coverage. Performance tests must validate the targets in this document.

### Implementation Order (Follow Roadmap)

**Start with Epic 3 (discovery execution)** as it's simpler and provides immediate value. Then implement Epic 4 (logic engine) in the phased approach outlined in the roadmap.

**Do NOT skip testing phases.** The logic engine has complex inference rules that MUST be validated against the C# reference implementation.

### Where to Get Help

- **C# Reference Code:** `D:\Scripts\UserMandA\GUI\Services\LogicEngineService.cs`
- **PowerShell Service:** `D:\Scripts\UserMandA\guiv2\src\main\services\powerShellService.ts`
- **Existing Hooks:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useDomainDiscoveryLogic.ts` (follow this pattern)
- **Discovery Views:** `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\*.tsx` (integrate here)

### Success Criteria

**Epic 3 Complete When:**
- [ ] All 25 discovery views execute modules with real-time streaming logs
- [ ] Progress bars show accurate percentage and ETA
- [ ] Cancellation works (Ctrl+C or button click)
- [ ] E2E tests pass for DomainDiscoveryView

**Epic 4 Complete When:**
- [ ] LogicEngine loads 10,000 users in < 5 seconds
- [ ] UserDetailProjection includes all 12 correlated data types
- [ ] All 9 inference rules apply correctly (validated against C# output)
- [ ] Fuzzy matching achieves > 90% accuracy on test dataset
- [ ] Cache hit rate > 80% for detail view requests
- [ ] Memory usage < 500MB for 10,000 user dataset

### Questions to Ask Before Implementation

1. Have you reviewed the C# `LogicEngineService.cs` to understand the full scope?
2. Have you run the existing PowerShellService tests to verify it works?
3. Do you have a test dataset with 10,000+ users for performance validation?
4. Have you read the CSV header variations section carefully?

---

**End of Architecture Document**

**Next Steps:** Hand off to `gui-module-executor` agent for implementation following the roadmap.
