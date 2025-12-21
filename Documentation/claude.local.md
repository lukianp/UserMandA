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

# Discovery Hooks Validation Status (43 Modules)

## ✅ Working Hooks (Reference Templates)
- useApplicationDiscoveryLogic.ts (250 records, 71s, EnrichmentLevel)
- useAzureDiscoveryLogic.ts
- useActiveDirectoryDiscoveryLogic.ts

## ✅ Fixed Hooks (TypeScript Errors)
- useAWSDiscoveryLogic.ts (data.currentItem → data.currentPhase)
- useHyperVDiscoveryLogic.ts (type cast)
- useOffice365DiscoveryLogic.ts (type casts, progress properties)
- usePowerPlatformDiscoveryLogic.ts (type cast, data.result)
- useSecurityInfrastructureDiscoveryLogic.ts (type cast, progress, config)

## ⏳ To Validate (20 hooks)
Cloud & Identity: useConditionalAccessDiscoveryLogic, useExchangeDiscoveryLogic, useOneDriveDiscoveryLogic, useTeamsDiscoveryLogic, useGoogleWorkspaceDiscoveryLogic

Infrastructure: useFileSystemDiscoveryLogic, useIntuneDiscoveryLogic, useLicensingDiscoveryLogic, useNetworkDiscoveryLogic, useSharePointDiscoveryLogic, useSQLServerDiscoveryLogic, useVMwareDiscoveryLogic, useWebServerDiscoveryLogic, useAWSCloudInfrastructureDiscoveryLogic, useDataLossPreventionDiscoveryLogic, useDomainDiscoveryLogic, useEDiscoveryLogic, useIdentityGovernanceDiscoveryLogic

## ❌ Missing Hooks (17 to create)
- useEntraIDAppDiscoveryLogic.ts
- useExternalIdentityDiscoveryLogic.ts
- useGraphDiscoveryLogic.ts
- useMultiDomainForestDiscoveryLogic.ts
- useBackupRecoveryDiscoveryLogic.ts
- useCertificateAuthorityDiscoveryLogic.ts
- useCertificateDiscoveryLogic.ts
- useDatabaseSchemaDiscoveryLogic.ts
- useDataClassificationDiscoveryLogic.ts
- useDNSDHCPDiscoveryLogic.ts
- useEnvironmentDetectionLogic.ts
- useFileServerDiscoveryLogic.ts
- useGPODiscoveryLogic.ts
- useInfrastructureDiscoveryLogic.ts
- useNetworkInfrastructureDiscoveryLogic.ts
- usePhysicalServerDiscoveryLogic.ts
- usePrinterDiscoveryLogic.ts
- useScheduledTaskDiscoveryLogic.ts
- useStorageArrayDiscoveryLogic.ts
- useVirtualizationDiscoveryLogic.ts
- useWebServerConfigDiscoveryLogic.ts
- usePowerBIDiscoveryLogic.ts
- usePaloAltoDiscoveryLogic.ts

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

# Azure Authentication Strategies (Multi-Fallback Pattern)

## Problem: Window Handle Error in Headless Environments

**Error:** "InteractiveBrowserCredential authentication failed: A window handle must be configured"

**Root Cause:** Interactive browser authentication requires GUI context (WAM - Web Account Manager)

**Solution:** Implement multi-strategy authentication fallback with headless-friendly methods

## Authentication Strategy Order (6 Strategies)

```powershell
# Strategy 1: Service Principal with Client Secret (preferred for automation)
- Requires: TenantId, ClientId, ClientSecret
- Use case: Production deployments, CI/CD pipelines
- Headless: ✅ Yes

# Strategy 2: Azure CLI Token (developer convenience)
- Requires: Azure CLI installed and logged in (az login)
- Use case: Developer workstations, manual runs
- Headless: ✅ Yes (if CLI already authenticated)

# Strategy 3: Microsoft Graph API with Device Code (cross-platform auth bridge)
- Requires: Microsoft.Graph.Authentication module
- Use case: Cross-service authentication, Graph + Azure hybrid
- Headless: ✅ Yes (device code flow)
- Gets Graph token with Azure scope, bridges to Connect-AzAccount

# Strategy 4: Managed Identity (Azure-hosted resources)
- Requires: Running on Azure VM, Function, Container Instance, etc.
- Use case: Production Azure workloads
- Headless: ✅ Yes

# Strategy 5: Device Code Authentication (headless-friendly interactive)
- Requires: Internet browser access (can be different device)
- Use case: Headless environments, SSH sessions, containers
- Headless: ✅ Yes (displays code, auth on any device)
- User sees: "To sign in, use a web browser to open https://microsoft.com/devicelogin and enter code XXXXXXXXX"

# Strategy 6: Interactive Browser Authentication (GUI required - last resort)
- Requires: GUI/display context, window handle
- Use case: Desktop applications, workstations with GUI
- Headless: ❌ No (fails with window handle error)
```

## Implementation Pattern (Apply to All Azure/Graph Modules)

```powershell
function Connect-AzureWithMultipleStrategies {
    param($Configuration, $Result)

    # Strategy 1: Service Principal
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)
            $context = Connect-AzAccount -ServicePrincipal -Credential $credential -Tenant $Configuration.TenantId -WarningAction SilentlyContinue -ErrorAction Stop
            return $context
        } catch {
            Write-ModuleLog "Service Principal auth failed: $($_.Exception.Message)" -Level "WARN"
        }
    }

    # Strategy 2: Azure CLI Token
    try {
        $cliAccount = az account show 2>$null | ConvertFrom-Json
        if ($cliAccount) {
            $token = az account get-access-token --resource https://management.azure.com/ 2>$null | ConvertFrom-Json
            if ($token) {
                $accessToken = ConvertTo-SecureString $token.accessToken -AsPlainText -Force
                $context = Connect-AzAccount -AccessToken $accessToken -AccountId $cliAccount.user.name -TenantId $cliAccount.tenantId -ErrorAction Stop
                return $context
            }
        }
    } catch {
        Write-ModuleLog "Azure CLI auth failed: $($_.Exception.Message)" -Level "WARN"
    }

    # Strategy 3: Microsoft Graph API
    try {
        if (Get-Module -ListAvailable -Name Microsoft.Graph.Authentication) {
            Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

            if ($Configuration.TenantId) {
                $graphContext = Connect-MgGraph -TenantId $Configuration.TenantId -Scopes "https://management.azure.com/.default" -UseDeviceCode -ErrorAction Stop
            } else {
                $graphContext = Connect-MgGraph -Scopes "https://management.azure.com/.default" -UseDeviceCode -ErrorAction Stop
            }

            $graphToken = Get-MgContext | Select-Object -ExpandProperty AccessToken
            if ($graphToken) {
                $accessToken = ConvertTo-SecureString $graphToken -AsPlainText -Force
                $accountId = (Get-MgContext).Account
                $tenantId = (Get-MgContext).TenantId
                $context = Connect-AzAccount -AccessToken $accessToken -AccountId $accountId -TenantId $tenantId -ErrorAction Stop
                return $context
            }
        }
    } catch {
        Write-ModuleLog "Graph API auth failed: $($_.Exception.Message)" -Level "WARN"
    }

    # Strategy 4: Managed Identity
    try {
        $context = Connect-AzAccount -Identity -ErrorAction Stop
        return $context
    } catch {
        Write-ModuleLog "Managed Identity auth failed: $($_.Exception.Message)" -Level "WARN"
    }

    # Strategy 5: Device Code (CRITICAL for headless)
    try {
        if ($Configuration.TenantId) {
            $context = Connect-AzAccount -Tenant $Configuration.TenantId -DeviceCode -ErrorAction Stop
        } else {
            $context = Connect-AzAccount -DeviceCode -ErrorAction Stop
        }
        return $context
    } catch {
        Write-ModuleLog "Device code auth failed: $($_.Exception.Message)" -Level "WARN"
    }

    # Strategy 6: Interactive Browser (last resort)
    try {
        if ($Configuration.TenantId) {
            $context = Connect-AzAccount -Tenant $Configuration.TenantId -ErrorAction Stop
        } else {
            $context = Connect-AzAccount -ErrorAction Stop
        }
        return $context
    } catch {
        Write-ModuleLog "Interactive browser auth failed: $($_.Exception.Message)" -Level "ERROR"
        $Result.AddError("All authentication strategies failed (Service Principal, Azure CLI, Microsoft Graph API, Managed Identity, Device Code, Interactive Browser)", $_.Exception, @{Section="Authentication"})
    }

    return $null
}
```

## Modules Requiring Authentication Updates

**Apply this pattern to:**
- AzureResourceDiscovery.psm1 ✅ (Updated with all 6 strategies)
- AzureDiscovery.psm1
- EntraIDDiscovery.psm1
- Office365Discovery.psm1
- SharePointDiscovery.psm1
- OneDriveDiscovery.psm1
- TeamsDiscovery.psm1
- ExchangeDiscovery.psm1
- IntuneDiscovery.psm1
- PowerPlatformDiscovery.psm1
- Any module using Connect-AzAccount, Connect-MgGraph, Connect-ExchangeOnline, etc.

## Testing Authentication Strategies

```powershell
# Test in order from most automated to least
# 1. Service Principal (production)
$config = @{
    TenantId = "your-tenant-id"
    ClientId = "your-client-id"
    ClientSecret = "your-client-secret"
}

# 2. Azure CLI (developer)
az login
az account show

# 3. Graph API (hybrid)
Install-Module Microsoft.Graph.Authentication
Connect-MgGraph -UseDeviceCode

# 4. Device Code (headless)
Connect-AzAccount -DeviceCode

# 5. Interactive (GUI only)
Connect-AzAccount
```

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

# 3. Launch
npm start

# 4. Copy back to workspace for version control
Copy-Item -Path "C:\enterprisediscovery\guiv2\src\*" -Destination "D:\Scripts\UserMandA\guiv2\src\" -Recurse -Force
Copy-Item -Path "C:\enterprisediscovery\Modules\*" -Destination "D:\Scripts\UserMandA\Modules\" -Recurse -Force
```
