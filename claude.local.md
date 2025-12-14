# Build and Deployment Instructions

## ⚠️ CRITICAL: Always Build in Deployment Directory

The application MUST be built in the deployment directory (`C:\enterprisediscovery\guiv2`) before running.

## 🚨 CRITICAL: THREE Webpack Bundles Required

The application requires **THREE** webpack bundles to be built:
1. **Main Process** (`webpack.main.config.js`) → `.webpack/main/main.js`
2. **Preload Script** (`webpack.preload.config.js`) → `.webpack/preload/index.js` ⚠️ **CRITICAL!**
3. **Renderer Process** (`webpack.renderer.config.js`) → `.webpack/renderer/main_window/`

**If the PRELOAD script is missing**, you will see:
- ❌ `Cannot find module 'C:\enterprisediscovery\guiv2\.webpack\preload\index.js'`
- ❌ `Using fallback Electron API - running in development mode without Electron`
- ❌ `[ProfileStore] Loaded profiles: Array(0)` (no profiles loaded)
- ❌ **Dashboard stuck in loading spinner forever** (waiting for profile)

### Quick Build & Launch (COMPLETE VERSION)

```powershell
cd C:\enterprisediscovery\guiv2

# Kill any running Electron processes
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Build ALL THREE webpack bundles
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# Launch
npm start
```

### Complete Build Process (After Making Changes)

```powershell
# 1. Kill any running Electron processes
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Copy modified files from workspace to deployment
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\*' -Destination 'C:\enterprisediscovery\guiv2\src\' -Recurse -Force

# 3. Clean previous build
cd C:\enterprisediscovery\guiv2
if (Test-Path '.webpack') { Remove-Item -Recurse -Force '.webpack' }

# 4. Build ALL THREE webpack bundles (CRITICAL - don't skip preload!)
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# 5. Launch
npm start
```

### NPM Scripts

The following npm scripts are available in `package.json`:

- **`npm run build:main`** - Build main Electron process only
- **`npm run build:renderer`** - Build renderer (UI) process only
- **`npm run build`** - Build BOTH main and renderer (REQUIRED for full rebuild)
- **`npm start`** - Launch the Electron app
- **`npm run dev`** - Build + Start in one command

### What Gets Built

⚠️ **IMPORTANT:** `npm run build` only builds main and renderer, **NOT preload!**

When you run `npm run build`, it executes:

1. **Main Process Build** (`webpack --config webpack.main.config.js`)
   - Compiles: `src/main/*.ts`
   - Output: `.webpack/main/main.js`

2. **Renderer Process Build** (`webpack --config webpack.renderer.config.js`)
   - Compiles: `src/renderer.tsx`, `src/renderer/**/*.tsx`
   - Output: `.webpack/renderer/main_window/index.html`, `.webpack/renderer/main_window/index.js`

**MISSING:** Preload script must be built separately!
```powershell
npx webpack --config webpack.preload.config.js --mode=production
```

### Common Issues & Solutions

#### Issue: Dashboard Stuck in Loading Spinner (Infinite Loop)

**Symptoms:**
- Dashboard shows loading spinner forever
- Console shows: `[useDashboardLogic] Waiting for profile to be selected...`
- Console shows: `Using fallback Electron API - running in development mode without Electron`
- Console shows: `Cannot find module 'C:\enterprisediscovery\guiv2\.webpack\preload\index.js'`
- Profile store returns 0 profiles

**Root Cause:** PRELOAD script was not built

**Solution:**
```powershell
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
npx webpack --config webpack.preload.config.js --mode=production
npm start
```

#### Issue: "Cannot find module preload.js" or blank window

**Cause:** Preload script was not built (or renderer was not built)

**Solution:**
```powershell
cd C:\enterprisediscovery\guiv2
npm run build:renderer
npm start
```

#### Issue: "EBUSY: resource busy or locked" when building

**Cause:** Previous Electron process or webpack dev server still running

**Solution:**
```powershell
# Kill all Electron processes
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean .webpack directory
cd C:\enterprisediscovery\guiv2
Remove-Item -Recurse -Force '.webpack' -ErrorAction SilentlyContinue

# Rebuild
npm run build
npm start
```

#### Issue: Electron Forge (`npx electron-forge start`) fails with "Module parse failed: Unexpected token"

**Cause:** Electron Forge's webpack plugin cannot handle TypeScript `import type` statements

**Solution:** DO NOT use `npx electron-forge start`. Use the custom build scripts instead:
```powershell
npm run build
npm start
```

### Why Not Use Electron Forge?

While Electron Forge is configured in the project, its webpack plugin has issues compiling TypeScript:
- ❌ Cannot parse `import type { ... }` statements
- ❌ Cannot handle JSX/TSX without additional configuration
- ✅ Custom webpack configs (`webpack.main.config.js`, `webpack.renderer.config.js`) work perfectly

**Always use `npm run build` instead of `npx electron-forge start`**

---

# PowerShell to GUI Integration Pattern

This document describes the pattern for real-time communication between PowerShell scripts and the Electron GUI (guiv2).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              ELECTRON GUI                                │
├─────────────────────────────────────────────────────────────────────────┤
│  React Hook (useAppRegistration.ts)                                      │
│    - Launches script via IPC                                            │
│    - Polls status file every 500ms                                      │
│    - Updates UI state based on status                                   │
│    - Detects completion via credential files                            │
│              │                                                          │
│              ▼                                                          │
│  IPC Handlers (appRegistrationHandlers.ts)                              │
│    - app-registration:launch                                            │
│    - app-registration:read-status                                       │
│    - app-registration:has-credentials                                   │
│    - app-registration:read-summary                                      │
│    - app-registration:decrypt-credential                                │
│    - app-registration:clear-status                                      │
│              │                                                          │
│              ▼                                                          │
│  Service (appRegistrationService.ts)                                    │
│    - Spawns PowerShell process                                          │
│    - Writes initial status file                                         │
│    - Parses stdout in automated mode                                    │
│    - Reads/writes status JSON files                                     │
└─────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           POWERSHELL SCRIPT                              │
├─────────────────────────────────────────────────────────────────────────┤
│  DiscoveryCreateAppRegistration.ps1                                     │
│    - Outputs structured status messages to stdout                       │
│    - Writes status to JSON file for GUI polling                         │
│    - Creates credential files on completion                             │
│    - Creates credential_summary.json with metadata                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Status File Location

Status files are written to:
```
C:\DiscoveryData\{CompanyName}\Logs\MandADiscovery_Registration_Log_status.json
```

## Status File Format

```json
{
  "status": "running" | "success" | "failed",
  "message": "Human readable progress message",
  "error": "",
  "step": "StepId",
  "timestamp": "2025-12-05T16:19:31.000Z",
  "logFile": "C:\\DiscoveryData\\{CompanyName}\\Logs\\MandADiscovery_Registration_Log.txt",
  "progress": 75
}
```

## Step IDs (in order)

| Step ID            | Description                          | Progress % |
|--------------------|--------------------------------------|------------|
| Initialization     | Setting up script environment        | 0          |
| Prerequisites      | Validating system requirements       | 8          |
| ModuleManagement   | Loading PowerShell modules           | 17         |
| GraphConnection    | Connecting to Microsoft Graph        | 25         |
| AzureConnection    | Connecting to Azure                  | 33         |
| AppRegistration    | Creating Azure AD application        | 42         |
| PermissionGrant    | Granting admin consent               | 50         |
| RoleAssignment     | Assigning directory roles            | 58         |
| SubscriptionAccess | Configuring subscription access      | 67         |
| SecretCreation     | Creating client secret               | 75         |
| CredentialStorage  | Saving encrypted credentials         | 83         |
| Complete           | Registration complete                | 100        |
| Error              | Error state                          | varies     |

## PowerShell Output Patterns

The GUI parses these patterns from stdout:

### Completed Step
```
[COMPLETED] [2025-12-05 16:19:31] [SUCCESS] [OK] ModuleName (35.96s)
```

### In Progress
```
[IN PROGRESS] [2025-12-05 16:19:31] [PROGRESS] Loading modules...
```

### Failed
```
[FAILED] [2025-12-05 16:19:31] [ERROR] Failed to connect to Azure
```

### Simple Patterns (also supported)
```
[OK] ModuleName (35.96s)
[PROGRESS] Loading modules...
[ERROR] Something went wrong
```

## Two Execution Modes

### 1. Interactive Mode (showWindow: true)
- PowerShell window is visible to user
- Process is detached (`detached: true`, `stdio: 'ignore'`)
- GUI polls status file to track progress
- Credential files indicate completion

### 2. Automated Mode (showWindow: false)
- PowerShell runs hidden
- stdout/stderr are captured and parsed in real-time
- Status file updated based on parsed output
- IPC broadcasts to renderer for immediate UI updates

## Credential Files

On successful completion, the script creates:

```
C:\DiscoveryData\{CompanyName}\Credentials\
├── credential_summary.json      # Metadata (TenantId, ClientId, paths)
└── discoverycredentials.config  # DPAPI-encrypted client secret
```

### credential_summary.json Format
```json
{
  "TenantId": "guid",
  "ClientId": "guid",
  "CredentialFile": "C:\\DiscoveryData\\{CompanyName}\\Credentials\\discoverycredentials.config",
  "Created": "2025-12-05T16:19:31.000Z",
  "Domain": "company.onmicrosoft.com"
}
```

## Key Implementation Files

| File | Purpose |
|------|---------|
| `guiv2/src/renderer/hooks/useAppRegistration.ts` | React hook for state management and polling |
| `guiv2/src/main/services/appRegistrationService.ts` | Main process service for launching scripts |
| `guiv2/src/main/ipc/appRegistrationHandlers.ts` | IPC handlers bridging renderer to main |
| `guiv2/src/preload.ts` | Exposes IPC methods to renderer via `window.electronAPI` |
| `Scripts/DiscoveryCreateAppRegistration.ps1` | The PowerShell script itself |

## Polling Optimization

The hook polls every **500ms** for snappy UI updates. Both status and credential checks are done in parallel:

```typescript
const [status, hasCredentials] = await Promise.all([
  window.electronAPI.appRegistration.readStatus(companyName),
  window.electronAPI.appRegistration.hasCredentials(companyName)
]);
```

## Adding a New PowerShell Script Integration

To integrate a new PowerShell script with the GUI:

### 1. Create the PowerShell Script
- Output structured messages matching the patterns above
- Write status to a JSON file for polling
- Create output files that indicate completion

### 2. Create Main Process Service
```typescript
// src/main/services/myScriptService.ts
export async function launchMyScript(options: Options): Promise<Result> {
  // Write initial status
  await writeStatusFile(options.name, { status: 'in_progress', step: 'Init', ... });

  // Spawn PowerShell
  const child = spawn('powershell.exe', args, { ... });

  // For automated mode: parse stdout and update status
  child.stdout?.on('data', (data) => { ... });

  return { success: true, processId: child.pid };
}
```

### 3. Create IPC Handlers
```typescript
// src/main/ipc/myScriptHandlers.ts
ipcMain.handle('my-script:launch', async (event, options) => {
  return await myScriptService.launch(options);
});

ipcMain.handle('my-script:read-status', async (event, name) => {
  return await myScriptService.readStatus(name);
});
```

### 4. Expose via Preload
```typescript
// src/preload.ts
myScript: {
  launch: (options) => ipcRenderer.invoke('my-script:launch', options),
  readStatus: (name) => ipcRenderer.invoke('my-script:read-status', name),
}
```

### 5. Create React Hook
```typescript
// src/renderer/hooks/useMyScript.ts
export function useMyScript() {
  const [state, setState] = useState<State>({ ... });

  const startMonitoring = useCallback(async (name: string) => {
    const pollInterval = 500; // Fast polling for responsive UI

    intervalRef.current = setInterval(async () => {
      const [status, isComplete] = await Promise.all([
        window.electronAPI.myScript.readStatus(name),
        window.electronAPI.myScript.checkComplete(name)
      ]);

      setState(prev => ({ ...prev, currentStep: status.step, ... }));

      if (isComplete) {
        clearInterval(intervalRef.current);
        setState(prev => ({ ...prev, success: true }));
      }
    }, pollInterval);
  }, []);

  return { state, launch, ... };
}
```

## Timeout Handling

The hook has a 10-minute timeout for long-running operations (like module installation):

```typescript
const maxDuration = 10 * 60 * 1000; // 10 minutes

// In polling loop:
const elapsed = Date.now() - startTime;
if (elapsed > maxDuration) {
  clearInterval(monitorIntervalRef.current);
  setState({ error: 'Timeout: Operation did not complete within 10 minutes', ... });
}
```

## Error Handling

Errors are detected via:
1. `status.status === 'failed'` in the status file
2. Script exit code !== 0 (automated mode)
3. Patterns like `[ERROR]` or `[FAILED]` in stderr
4. Polling timeout exceeded

Always update the status file with error details so the GUI can display them:

```json
{
  "status": "failed",
  "step": "Error",
  "message": "Operation failed",
  "error": "Detailed error message here",
  "progress": 50
}
```

---

# UI Pattern: PowerShell Script Launch Experience

This section documents the visual UI pattern used for launching PowerShell scripts with real-time progress tracking. **Apply this same pattern to all discovery modules.**

## Reference Implementation

**File:** `guiv2/src/renderer/views/setup/SetupCompanyView.tsx`

## User Experience Flow

1. User clicks "Start" button
2. **Confirmation Dialog** opens with settings review
3. User clicks "Confirm & Launch"
4. PowerShell window opens (if interactive mode enabled)
5. **Progress Step Cards** animate through states: pending → in_progress → completed
6. Each step shows spinner while active, checkmark when done
7. Final success state shows all steps green

## Core UI Components

### 1. ProgressStep Interface

```typescript
interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  percentage: number;
  message?: string;
}
```

### 2. ProgressStepCard Component

The visual stepper that shows each step with status indicators:

```tsx
const ProgressStepCard: React.FC<{
  steps: ProgressStep[];
  currentStepIndex: number;
}> = ({ steps, currentStepIndex }) => (
  <div className="space-y-3">
    {steps.map((step, index) => (
      <div
        key={step.id}
        className={`
          flex items-center gap-4 p-4 rounded-lg transition-all duration-300
          ${
            step.status === 'in_progress'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700'
              : step.status === 'completed'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : step.status === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }
        `}
      >
        {/* Step Indicator Circle */}
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${
              step.status === 'completed'
                ? 'bg-green-500 text-white'
                : step.status === 'in_progress'
                ? 'bg-blue-500 text-white'
                : step.status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }
          `}
        >
          {step.status === 'completed' ? (
            <Check className="w-5 h-5" />
          ) : step.status === 'in_progress' ? (
            <LoadingSpinner size="sm" />
          ) : step.status === 'error' ? (
            <X className="w-5 h-5" />
          ) : (
            <span className="text-sm font-bold">{index + 1}</span>
          )}
        </div>

        {/* Step Label & Message */}
        <div className="flex-1">
          <p
            className={`
              font-medium
              ${
                step.status === 'completed'
                  ? 'text-green-700 dark:text-green-300'
                  : step.status === 'in_progress'
                  ? 'text-blue-700 dark:text-blue-300'
                  : step.status === 'error'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-gray-600 dark:text-gray-400'
              }
            `}
          >
            {step.label}
          </p>
          {step.message && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{step.message}</p>
          )}
        </div>

        {/* Percentage */}
        <div className="w-24 text-right">
          <span
            className={`
              text-sm font-medium
              ${
                step.status === 'completed'
                  ? 'text-green-600 dark:text-green-400'
                  : step.status === 'in_progress'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400'
              }
            `}
          >
            {step.percentage}%
          </span>
        </div>
      </div>
    ))}
  </div>
);
```

### 3. Confirmation Dialog Pattern

Before launching any PowerShell script, show a confirmation dialog:

```tsx
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  // ... config props
}> = ({ isOpen, onClose, onConfirm, ...config }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Operation" size="md">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Review Your Settings</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Please confirm before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Configuration Summary
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Key-value pairs */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Setting Name</span>
              <span className="font-medium text-gray-900 dark:text-white">Value</span>
            </div>
          </div>
        </div>

        {/* Options with checkmarks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Options
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {optionEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-sm ${optionEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                Option Label
              </span>
            </div>
          </div>
        </div>

        {/* Warning Banner (if needed) */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Warning Title</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Warning message here.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Go Back
          </Button>
          <Button variant="primary" onClick={onConfirm} icon={<Play className="w-4 h-4" />}>
            Confirm & Launch
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

## Visual States Reference

| State       | Background              | Border                    | Icon           | Text Color    |
|-------------|-------------------------|---------------------------|----------------|---------------|
| Pending     | gray-50 / gray-800      | gray-200 / gray-700       | Number         | gray-600      |
| In Progress | blue-50 / blue-900/20   | blue-300 (2px) / blue-700 | LoadingSpinner | blue-700      |
| Completed   | green-50 / green-900/20 | green-200 / green-800     | Check          | green-700     |
| Error       | red-50 / red-900/20     | red-200 / red-800         | X              | red-700       |

## Animation & Transitions

- **Step Cards:** `transition-all duration-300`
- **Color changes:** Smooth 300ms transitions
- Use lucide-react icons: `Check`, `X`, `Play`, `Info`, `AlertTriangle`, `Shield`, `CheckCircle`
- Use `LoadingSpinner` component for in-progress states

## Progress Steps State Management

Drive progress steps from hook state using `useMemo`:

```typescript
const progressSteps: ProgressStep[] = useMemo(() => {
  if (state.success) {
    return [
      { id: 'step1', label: 'Step 1', status: 'completed', percentage: 25, message: 'Done' },
      { id: 'step2', label: 'Step 2', status: 'completed', percentage: 50, message: 'Done' },
      { id: 'step3', label: 'Step 3', status: 'completed', percentage: 75, message: 'Done' },
      { id: 'step4', label: 'Step 4', status: 'completed', percentage: 100, message: 'Done' },
    ];
  }
  if (state.error) {
    return [
      { id: 'step1', label: 'Step 1', status: state.isRunning ? 'completed' : 'error', percentage: 25 },
      { id: 'step2', label: 'Step 2', status: 'pending', percentage: 50 },
      { id: 'step3', label: 'Step 3', status: 'pending', percentage: 75 },
      { id: 'step4', label: 'Step 4', status: 'pending', percentage: 100 },
    ];
  }
  if (state.isMonitoring) {
    return [
      { id: 'step1', label: 'Step 1', status: 'completed', percentage: 25, message: 'Done' },
      { id: 'step2', label: 'Step 2', status: 'in_progress', percentage: 50, message: state.progress },
      { id: 'step3', label: 'Step 3', status: 'pending', percentage: 75 },
      { id: 'step4', label: 'Step 4', status: 'pending', percentage: 100 },
    ];
  }
  if (state.isRunning) {
    return [
      { id: 'step1', label: 'Step 1', status: 'in_progress', percentage: 25, message: state.progress },
      { id: 'step2', label: 'Step 2', status: 'pending', percentage: 50 },
      { id: 'step3', label: 'Step 3', status: 'pending', percentage: 75 },
      { id: 'step4', label: 'Step 4', status: 'pending', percentage: 100 },
    ];
  }
  // Default: all pending
  return [
    { id: 'step1', label: 'Step 1', status: 'pending', percentage: 25 },
    { id: 'step2', label: 'Step 2', status: 'pending', percentage: 50 },
    { id: 'step3', label: 'Step 3', status: 'pending', percentage: 75 },
    { id: 'step4', label: 'Step 4', status: 'pending', percentage: 100 },
  ];
}, [state]);
```

## Complete Discovery Module Template

When creating a new discovery module view with PowerShell integration:

```tsx
// 1. Import the hook
import { useMyDiscoveryModule } from '../hooks/useMyDiscoveryModule';

// 2. Define progress steps
const STEPS = [
  { id: 'init', label: 'Initializing', percentage: 20 },
  { id: 'connect', label: 'Connecting', percentage: 40 },
  { id: 'discover', label: 'Discovering', percentage: 60 },
  { id: 'process', label: 'Processing', percentage: 80 },
  { id: 'complete', label: 'Complete', percentage: 100 },
];

// 3. Use the hook
const { state, launch, reset } = useMyDiscoveryModule();

// 4. Build progress steps from state
const progressSteps = useMemo(() => buildProgressSteps(state, STEPS), [state]);

// 5. Render ProgressStepCard and controls
return (
  <div>
    <ProgressStepCard steps={progressSteps} currentStepIndex={currentIndex} />
    <ProgressBar value={progress} max={100} />

    {!state.isRunning && !state.success && (
      <Button onClick={() => setShowConfirmation(true)}>
        Start Discovery
      </Button>
    )}

    {state.isRunning && (
      <Button variant="secondary" onClick={reset}>
        Cancel
      </Button>
    )}

    <ConfirmationDialog
      isOpen={showConfirmation}
      onClose={() => setShowConfirmation(false)}
      onConfirm={handleConfirmAndLaunch}
      {...config}
    />
  </div>
);
```

## Required Imports

```typescript
import { Check, X, Play, Info, AlertTriangle, Shield, CheckCircle, Settings } from 'lucide-react';
import { LoadingSpinner } from '../components/atoms/LoadingSpinner';
import { Button } from '../components/atoms/Button';
import { Modal } from '../components/organisms/Modal';
import { ProgressBar } from '../components/molecules/ProgressBar';
```

---

# Debugging Pattern: Comprehensive Console Logging

**IMPORTANT:** All views MUST implement comprehensive debugging as a default pattern. This is critical for troubleshooting and development.

## Standard Practice

Every view component should include detailed console logging throughout its lifecycle and key operations.

## Implementation Pattern

### 1. Component Lifecycle Logging

```typescript
const MyView: React.FC = () => {
  console.log('[MyView] Component rendering');

  // State initialization
  const [myState, setMyState] = useState(() => {
    console.log('[MyView] Initializing myState');
    return initialValue;
  });

  // useEffect hooks
  useEffect(() => {
    console.log('[MyView] useEffect - Component mounted, starting initialization');

    const initialize = async () => {
      console.log('[MyView] initialize - Starting...');
      // ... initialization logic
      console.log('[MyView] initialize - Complete');
    };

    initialize();

    return () => {
      console.log('[MyView] useEffect cleanup - Component unmounting');
    };
  }, []);
};
```

### 2. Function Call Logging

```typescript
const checkRequirements = useCallback(async () => {
  console.log('[MyView] checkRequirements called');

  try {
    console.log('[MyView] Checking if API exists:', !!window.electronAPI);
    console.log('[MyView] Checking if method exists:', !!window.electronAPI?.myMethod);

    if (window.electronAPI?.myMethod) {
      console.log('[MyView] Executing API call...');
      const result = await window.electronAPI.myMethod(params);
      console.log('[MyView] API call result:', result);

      if (result.success) {
        console.log('[MyView] Operation successful');
        // ... handle success
      } else {
        console.warn('[MyView] Operation failed:', result.error);
        // ... handle failure
      }
    } else {
      console.warn('[MyView] API method not available - using fallback');
      // ... fallback logic
    }
  } catch (error: any) {
    console.error('[MyView] checkRequirements error:', error);
    // ... error handling
  } finally {
    console.log('[MyView] checkRequirements complete');
  }
}, []);
```

### 3. Loop/Iteration Logging

```typescript
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  console.log(`[MyView] Processing item ${i + 1}/${items.length}: ${item.name}`);

  try {
    const result = await processItem(item);
    console.log(`[MyView] Item ${item.name} processed:`, result);
  } catch (error: any) {
    console.error(`[MyView] Item ${item.name} error:`, error);
  }
}
```

### 4. State Changes

```typescript
const updateState = useCallback((newValue: any) => {
  console.log('[MyView] updateState called with:', newValue);
  setMyState(newValue);
}, []);
```

### 5. API Availability Checks

Always log API availability before use:

```typescript
console.log('[MyView] Checking electronAPI availability');
console.log('[MyView] electronAPI exists:', !!window.electronAPI);
console.log('[MyView] executeScript exists:', !!window.electronAPI?.executeScript);
console.log('[MyView] getConfig exists:', !!window.electronAPI?.getConfig);
```

## Naming Convention

- **Always** prefix with the view name in square brackets: `[MyView]`
- Use descriptive action names: `checkRequirements`, `verifyModules`, `initialize`
- Include context: counts, indices, item names, operation status
- Use appropriate log levels:
  - `console.log()` - Normal operation
  - `console.warn()` - Warnings, fallback usage
  - `console.error()` - Errors, exceptions

## What to Log

### Required Logging Points

1. **Component Mount/Unmount**
   ```typescript
   console.log('[MyView] Component rendering');
   console.log('[MyView] useEffect - Component mounted');
   console.log('[MyView] useEffect cleanup - Component unmounting');
   ```

2. **State Initialization**
   ```typescript
   console.log('[MyView] Initializing state');
   ```

3. **Function Entry/Exit**
   ```typescript
   console.log('[MyView] functionName called');
   console.log('[MyView] functionName complete');
   ```

4. **API Calls**
   ```typescript
   console.log('[MyView] Executing API call: methodName');
   console.log('[MyView] API result:', result);
   ```

5. **Conditionals & Branching**
   ```typescript
   if (condition) {
     console.log('[MyView] Taking path A');
   } else {
     console.warn('[MyView] Taking fallback path B');
   }
   ```

6. **Errors**
   ```typescript
   console.error('[MyView] Operation failed:', error);
   ```

7. **Loop Progress**
   ```typescript
   console.log(`[MyView] Processing ${i + 1}/${total}: ${item.name}`);
   ```

## Reference Implementations

These views demonstrate comprehensive debugging:
- `guiv2/src/renderer/views/setup/SetupCompanyView.tsx`
- `guiv2/src/renderer/views/setup/SetupAzurePrerequisitesView.tsx`
- `guiv2/src/renderer/views/setup/SetupInstallersView.tsx`

## Benefits

1. **Easier Debugging** - Trace execution flow through console
2. **Faster Development** - Immediately see what's happening
3. **Better Error Diagnosis** - Know exactly where failures occur
4. **User Support** - Users can share console logs for troubleshooting
5. **Performance Monitoring** - See timing and sequence of operations

## Production Considerations

Console logs are automatically removed in production builds through webpack's minification process, so there's no performance impact in the final application.

**Bottom Line:** When in doubt, add more logging. It's better to have too much information in the console than too little.

---

# 🚨 CRITICAL: Launching PowerShell Scripts in Visible Windows

## The Problem

Launching PowerShell scripts in visible windows from Electron is **EXTREMELY TRICKY** on Windows due to:
1. Windows `start` command syntax quirks
2. Multiple layers of command parsing (Node.js → cmd.exe → start → PowerShell)
3. Quote escaping requirements
4. Smart quotes vs regular quotes in PowerShell scripts

## ✅ THE CORRECT WAY (Reference: PowerShellService.ts)

**ALWAYS** use this pattern when launching PowerShell in a visible window:

```typescript
// Build PowerShell script arguments array
const scriptArgs: string[] = ['-CompanyName', `"${options.companyName}"`];

if (options.autoInstallModules) {
  scriptArgs.push('-AutoInstallModules');
}

if (options.secretValidityYears) {
  scriptArgs.push('-SecretValidityYears', options.secretValidityYears.toString());
}

// Build cmd.exe arguments array
const cmdArgs = [
  '/c',  // Run command and terminate
  'start',  // Start a new window
  '""',  // ⚠️ CRITICAL: Empty title (required by start command)
  'powershell.exe',
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-NoExit',  // Keep window open after script completes
  '-File',
  `"${scriptPath}"`,  // Quote the path
  ...scriptArgs  // Script arguments
];

// Spawn with shell: true
const child = spawn('cmd.exe', cmdArgs, {
  detached: true,
  stdio: 'ignore',
  windowsHide: false,
  shell: true  // ⚠️ CRITICAL: Required to properly handle 'start' command
});
```

## ❌ WRONG WAYS (DO NOT USE)

### Wrong 1: Single String Command
```typescript
// ❌ WRONG - Passing command as single string
const command = `start "Title" "powershell.exe" -NoProfile -File "${scriptPath}" ${paramString}`;
const child = spawn('cmd.exe', ['/c', command], { shell: false });
```

**Why it fails:** Arguments are not properly escaped and Windows cannot parse them correctly.

### Wrong 2: Missing Empty Title
```typescript
// ❌ WRONG - Missing empty title for start command
const cmdArgs = [
  '/c', 'start',
  'powershell.exe',  // This gets interpreted as the window title!
  '-NoProfile', '-File', scriptPath
];
```

**Why it fails:** Windows `start` command treats the first quoted argument as the window title, so `"powershell.exe"` becomes the title and nothing executes.

### Wrong 3: Using Custom Title Without Quotes
```typescript
// ❌ WRONG - Using title without proper empty title
const cmdArgs = [
  '/c', 'start',
  'M&A Discovery',  // This is interpreted as multiple arguments!
  'powershell.exe', '-NoProfile', '-File', scriptPath
];
```

**Why it fails:** The title is split on spaces and causes parsing errors.

## 🔑 Key Points

1. **Empty Title is CRITICAL**
   - Always use `'""'` as the first argument after `start`
   - This tells Windows "here's an empty title, the next argument is the executable"

2. **Use Array of Arguments, NOT String**
   - Pass each argument as a separate array element
   - Let Node.js handle the escaping

3. **shell: true is REQUIRED**
   - The `start` command only works with `shell: true`
   - Without it, cmd.exe won't properly execute the start command

4. **Quote File Paths**
   - Always quote the script path: `"${scriptPath}"`
   - Quote parameters that might contain spaces: `"${options.companyName}"`

## 🐛 PowerShell Script Syntax Issues

### Smart Quotes Problem

PowerShell does NOT accept smart/curly quotes (" "). It ONLY accepts straight quotes (" ").

**Symptoms:**
```powershell
# ❌ WRONG - Smart quotes (copy-pasted from Word/web)
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
# Error: The string is missing the terminator: ".
```

**Solution:**
```powershell
# ✅ CORRECT - Regular straight quotes
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```

**How to Fix:**
Use PowerShell's `-replace` operator to fix smart quotes:
```powershell
$content = Get-Content -Path $scriptPath -Raw -Encoding UTF8
$content = $content -replace '\u201D', '"'  # Right double quotation mark
$content = $content -replace '\u201C', '"'  # Left double quotation mark
Set-Content -Path $scriptPath -Value $content -Encoding UTF8 -NoNewline
```

## 📋 Reference Implementations

**Correct implementations to copy from:**
- `guiv2/src/main/services/powerShellService.ts` (lines 396-424)
- `guiv2/src/main/services/appRegistrationService.ts` (lines 531-576) ✅ Fixed version

**DO NOT copy from:**
- Any code that uses `spawn('cmd.exe', ['/c', commandString])` with a single string

## 🧪 Testing PowerShell Window Launch

### Manual Test from Command Line
```powershell
# Test the exact command that will be generated
cd C:\enterprisediscovery\Scripts
start "" "powershell.exe" -NoProfile -ExecutionPolicy Bypass -NoExit -File "C:\enterprisediscovery\Scripts\DiscoveryCreateAppRegistration.ps1" -CompanyName "ljpops" -AutoInstallModules -SecretValidityYears 2
```

**Expected:** PowerShell window opens and script executes

### Verify Script Syntax
```powershell
# Check for smart quotes and syntax errors
$errors = $null
$null = [System.Management.Automation.PSParser]::Tokenize((Get-Content 'C:\enterprisediscovery\Scripts\DiscoveryCreateAppRegistration.ps1' -Raw), [ref]$errors)
if ($errors) {
  $errors | ForEach-Object { Write-Output "Line $($_.Token.StartLine): $($_.Message)" }
} else {
  Write-Output 'No syntax errors found'
}
```

## 🎯 Why This Was So Hard

This issue was difficult because it involved **THREE separate problems**:

1. **PowerShell Script Syntax Error**
   - Smart quotes (") in the script caused parsing failure
   - Script appeared to execute but immediately failed
   - Error message was cryptic: "The string is missing the terminator"

2. **Incorrect spawn() Usage**
   - Passing command as single string instead of array
   - Windows couldn't parse the arguments correctly
   - Process would spawn but PowerShell wouldn't execute

3. **Windows start Command Quirks**
   - Requires empty title as first argument
   - First quoted string gets interpreted as title if no empty title provided
   - Causes confusion between window title and executable name

**The combination of all three made debugging very difficult** because:
- The PowerShell window would appear to launch (PID was created)
- But the script wouldn't execute (stuck at "Initialization")
- No clear error messages in the Electron console
- Manual testing in cmd.exe worked, but programmatic spawning didn't

## 💡 Prevention Checklist

Before implementing PowerShell window launching:

- [ ] Use array of arguments, NOT single command string
- [ ] Include `'""'` (empty title) as first argument after `start`
- [ ] Set `shell: true` in spawn options
- [ ] Quote all file paths and parameters with spaces
- [ ] Verify PowerShell script has NO smart quotes (use straight quotes only)
- [ ] Test manually with `start ""` command first
- [ ] Copy pattern from `PowerShellService.ts` lines 396-424
- [ ] Check script syntax with `PSParser::Tokenize()` before deployment

---

# Discovery Hooks Event-Driven API Migration

**Last Updated:** December 14, 2025
**Status:** 9 hooks fixed, 2 not found, 4 use wrapper pattern (no fixes needed)

## Quick Reference Documentation

The following documentation files contain comprehensive information about the discovery hooks migration to the event-driven API pattern:

### Main Documentation Files

1. **REMAINING_HOOKS_FIX_GUIDE.md** - Master guide with fix template and status tracking
2. **DISCOVERY_HOOK_FIX_TEMPLATE.md** - Standard pattern template (287 lines)
3. **DISCOVERY_HOOKS_FIX_SUMMARY.md** - Summary of 12 completed hooks (previously)
4. **DISCOVERY_HOOKS_FIX_COMPLETE_SUMMARY.md** - Complete audit report

### Category-Specific Documentation

**Infrastructure Hooks (5 fixed):**
- **INFRASTRUCTURE_HOOKS_FIX_INSTRUCTIONS.md** (600+ lines)
  - useFileSystemDiscoveryLogic.ts
  - useVMwareDiscoveryLogic.ts
  - useSQLServerDiscoveryLogic.ts
  - useWebServerDiscoveryLogic.ts
  - useNetworkDiscoveryLogic.ts

**Security & Compliance Hooks (3 fixed):**
- useDataLossPreventionDiscoveryLogic.ts
- useIdentityGovernanceDiscoveryLogic.ts
- useLicensingDiscoveryLogic.ts

**Cloud & Identity Hooks (1 fixed, 2 not found):**
- **CLOUD_IDENTITY_HOOKS_FIX_SUMMARY.md** (400+ lines)
  - useGoogleWorkspaceDiscoveryLogic.ts (10 issues identified)
  - useGraphDiscoveryLogic.ts (NOT FOUND)
  - useEntraIDAppDiscoveryLogic.ts (NOT FOUND)

**Data & Collaboration Hooks (wrapper pattern - no fixes needed):**
- usePowerBIDiscovery.ts
- useDataClassificationDiscovery.ts
- useApplicationDependencyDiscovery.ts
- useApplicationDependencyMappingDiscovery.ts

## Standard Event-Driven Pattern

All complex discovery hooks must follow this pattern:

### Critical Changes Required

1. **Add `useRef` import:**
   ```typescript
   import { useState, useCallback, useEffect, useRef } from 'react';
   ```

2. **Add token ref:**
   ```typescript
   const currentTokenRef = useRef<string | null>(null);
   ```

3. **Event listeners with empty dependency array:**
   ```typescript
   useEffect(() => {
     const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
       if (data.executionId === currentTokenRef.current) {
         // Handle completion
         addResult(result); // Persist to store
       }
     });
     return () => { unsubscribeComplete?.(); };
   }, []); // ✅ CRITICAL: Empty array
   ```

4. **Update API call:**
   ```typescript
   const token = `module-discovery-${Date.now()}`;
   currentTokenRef.current = token; // BEFORE API call

   await window.electron.executeDiscovery({
     moduleName: 'ModuleName',
     parameters: { ... },
     executionOptions: { timeout: 300000, showWindow: false },
     executionId: token
   });
   ```

5. **Update cancel method:**
   ```typescript
   await window.electron.cancelDiscovery(currentTokenRef.current);
   ```

## Common Issues Fixed

1. **Stale Closures** - Using `useRef` eliminates stale closure issues in event listeners
2. **Event Matching** - Proper `executionId` matching ensures events are handled by correct hook instance
3. **Result Persistence** - `addResult()` calls ensure results are stored and persist across sessions
4. **Memory Leaks** - Empty dependency array prevents duplicate event listener registrations
5. **Cancellation** - Proper token-based cancellation with 2-second timeout
6. **API Deprecation** - Migrated from old `executeModule` to new `executeDiscovery`

## Testing After Fixes

For each fixed hook, verify:
- [ ] Hook loads without errors
- [ ] Discovery can be started
- [ ] Progress updates appear in real-time
- [ ] Discovery completes successfully
- [ ] Results are stored in discovery store
- [ ] Results persist across page refreshes
- [ ] Discovery can be cancelled
- [ ] Cancellation cleans up state properly
- [ ] No duplicate event listeners registered
- [ ] No memory leaks from uncleaned listeners

## Files Modified (9 hooks)

**Infrastructure:**
1. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useFileSystemDiscoveryLogic.ts
2. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useVMwareDiscoveryLogic.ts
3. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useSQLServerDiscoveryLogic.ts
4. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useWebServerDiscoveryLogic.ts
5. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useNetworkDiscoveryLogic.ts

**Security & Compliance:**
6. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useDataLossPreventionDiscoveryLogic.ts
7. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useIdentityGovernanceDiscoveryLogic.ts
8. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useLicensingDiscoveryLogic.ts

**Cloud & Identity:**
9. D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useGoogleWorkspaceDiscoveryLogic.ts

## Deployment

After making changes, deploy to the production directory:

```powershell
# Copy modified hooks
Copy-Item -Path "D:\Scripts\UserMandA\guiv2\src\renderer\hooks\use*DiscoveryLogic.ts" `
          -Destination "C:\enterprisediscovery\guiv2\src\renderer\hooks\" `
          -Force

# Build all three webpack bundles
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer
npm start
```
