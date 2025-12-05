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
