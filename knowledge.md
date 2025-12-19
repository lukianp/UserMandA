# Project Knowledge - Enterprise Discovery Suite

M&A Intelligence & Integration Platform for IT Discovery, Due Diligence & Migration Execution.

## Quick Reference

### Commands (run from `guiv2/` directory)
```bash
# Development
npm run build          # Build main + renderer (NOT preload!)
npm run dev            # Build all + start
npm start              # Start Electron app

# Testing
npm run test:unit      # Jest unit tests
npm run test:unit:watch # Jest watch mode
npm run test:e2e       # Playwright E2E tests

# Full build (includes preload - REQUIRED)
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer
npm start
```

### Key Directories
```
D:\Scripts\UserMandA\           # Workspace (development)
C:\enterprisediscovery\         # Deployment (build & run here)

guiv2/                          # Electron + React frontend
├── src/renderer/
│   ├── views/discovery/        # Discovery UI views
│   ├── views/discovered/       # CSV data display views
│   ├── hooks/                  # React hooks (useXxxDiscoveryLogic.ts)
│   ├── components/             # UI components (atoms/molecules/organisms)
│   └── store/                  # Zustand state stores
├── src/main/                   # Electron main process
└── src/preload.ts              # IPC bridge (MUST be built separately!)

Modules/Discovery/              # PowerShell discovery modules (.psm1)
Modules/Utilities/              # Shared PowerShell utilities
```

## Architecture

### Data Flow
```
React Hook → window.electron.executeDiscovery() → IPC → PowerShellService → .psm1 Module
                                                                               ↓
React Hook ← onDiscoveryComplete event ← IPC ← JSON result ← PowerShell stdout
```

### Discovery Pattern (Hook)
```typescript
// All hooks follow this pattern:
const currentTokenRef = useRef<string | null>(null);

useEffect(() => {
  const unsubscribe = window.electron.onDiscoveryComplete((data) => {
    if (data.executionId === currentTokenRef.current) {
      addResult(result);  // Persist to Zustand store
    }
  });
  return () => unsubscribe?.();
}, []);  // CRITICAL: Empty dependency array

const startDiscovery = useCallback(async () => {
  const token = `module-${Date.now()}`;
  currentTokenRef.current = token;
  await window.electron.executeDiscovery({
    moduleName: 'ModuleName',
    executionId: token,
    parameters: { ... }
  });
}, []);
```

## Conventions

### TypeScript/React
- Use `useCallback` for all action handlers
- Use `useMemo` for computed values (columns, filteredData, stats)
- Use `useRef` for event token matching (not useState)
- Empty dependency array `[]` for event listener useEffects
- Add `data-cy` and `data-testid` attributes for testing

### PowerShell Modules
- **ALWAYS wrap arrays:** `@($array).Count` not `$array.Count`
- **Static filenames:** `Module.csv` not `Module_timestamp.csv`
- **moduleName consistency:** Hook and executeDiscovery must match

### File Naming
- Hooks: `use{Module}DiscoveryLogic.ts`
- Views: `{Module}DiscoveryView.tsx` (runs discovery)
- Discovered Views: `{Module}DiscoveredView.tsx` (displays CSV)

## Gotchas

### Build Issues
| Problem | Solution |
|---------|----------|
| Dashboard infinite spinner | Build preload: `npx webpack --config webpack.preload.config.js --mode=production` |
| `Cannot find module preload.js` | Same as above |
| `EBUSY: resource busy` | Kill Electron: `Get-Process electron \| Stop-Process -Force` |
| Stale webpack cache | Delete `.webpack/` folder before rebuild |

### Discovery Issues
| Problem | Solution |
|---------|----------|
| Results show 0 items | Check moduleName matches between hook and executeDiscovery |
| `.Count` not found | Wrap with `@()`: `@($items).Count` |
| Results don't persist | Ensure `addResult()` is called in onDiscoveryComplete |

### Workspace/Deployment Sync
```powershell
# ALWAYS build in C:\enterprisediscovery\guiv2, NOT D:\Scripts\UserMandA

# Copy workspace → deployment before build
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\*' -Destination 'C:\enterprisediscovery\guiv2\src\' -Recurse -Force

# Copy deployment → workspace after changes
Copy-Item -Path 'C:\enterprisediscovery\guiv2\src\*' -Destination 'D:\Scripts\UserMandA\guiv2\src\' -Recurse -Force
```

## Component Library
- `Button`, `Input`, `Checkbox` - `components/atoms/`
- `LoadingOverlay`, `ProgressBar`, `PowerShellExecutionDialog` - `components/molecules/`
- `VirtualizedDataGrid` (AG-Grid wrapper) - `components/organisms/`

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Zustand
- **Desktop:** Electron 38, Webpack
- **Grid:** AG-Grid Enterprise
- **Charts:** Recharts, D3
- **Backend:** PowerShell 5.1+ modules
- **Testing:** Jest, Playwright, Testing Library

## PowerShell Integration Details

### Status File Pattern
**Location:** `C:\DiscoveryData\{CompanyName}\Logs\{ScriptName}_status.json`
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

### Visible PowerShell Window Launch
```typescript
// CRITICAL: Use array args with empty title
const cmdArgs = [
  '/c', 'start',
  '""',  // CRITICAL: Empty title required by Windows
  'powershell.exe',
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-NoExit',
  '-File', `"${scriptPath}"`,
  ...scriptArgs
];

spawn('cmd.exe', cmdArgs, {
  detached: true,
  stdio: 'ignore',
  windowsHide: false,
  shell: true  // Required for 'start' command
});
```

## Performance Patterns

### EnrichmentLevel Parameter
```powershell
[ValidateSet('None', 'Basic', 'Full')]
[string]$EnrichmentLevel = 'Basic'

# Basic: Essential data only (75% fewer API calls)
# Full: Complete enrichment for detailed audits
```

### ETA Calculations
```powershell
$startTime = Get-Date
if ($processed % 25 -eq 0) {
    $elapsed = (Get-Date) - $startTime
    $avgTime = $elapsed.TotalSeconds / $processed
    $etaSec = [math]::Round(($total - $processed) * $avgTime)
    Write-ModuleLog "Processing $processed of $total (ETA: $etaSec sec)"
}
```

## Console Logging Standard

**Pattern:** `console.log('[ComponentName] action')` at entry/exit points
```typescript
console.log('[MyView] Component rendering');
console.log('[MyView] useEffect - Component mounted');
console.log('[MyView] API result:', result);
console.error('[MyView] Error:', error);
```

---

## AI Agent Patterns

### Context Window Management
**CRITICAL:** Avoid loading large files (>500 lines) entirely.
```typescript
// ❌ WRONG: Loads entire 2000-line file
Read({ file_path: "ApplicationDiscovery.psm1" })

// ✅ CORRECT: Targeted read around line 850
Read({ file_path: "ApplicationDiscovery.psm1", offset: 800, limit: 100 })
```

### Crash Recovery (.ai-work-tracker.md)
**Location:** `D:\Scripts\UserMandA\.ai-work-tracker.md`

**Recovery procedure:**
1. User says "resume where you left off"
2. Read `.ai-work-tracker.md`
3. Check "Files Modified This Session" for last state
4. Check "Next Steps" for planned actions
5. Continue from checkpoint

**Tracker format:**
```markdown
## Current Task
**Goal:** [Task description]
**Status:** ⏳ In Progress / ✅ Complete

## Files Modified This Session
1. ✅ path/to/file.ts - Description
2. ⏳ path/to/other.ts - IN PROGRESS (line 245)

## Next Steps
- [ ] Pending task 1
- [ ] Pending task 2
```

### Multi-LLM File Locking
When multiple AI agents work simultaneously:
```markdown
## Active File Locks
**Claude Code:** hooks/*.ts (LOCKED)
**Roo Code:** views/*.tsx, components/** (LOCKED)
```

---

## Related Files
- `.ai-work-tracker.md` - AI agent crash recovery & session state
- `claude.local.md` - Detailed AI operational patterns (full reference)
- `guiv2/DISCOVERY_VIEW_ENHANCEMENT_PROMPT.md` - View upgrade specifications
