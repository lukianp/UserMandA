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

# Discovery Hooks Implementation Status (55 Modules)

## ✅ Fully Implemented and Tested (8 Hooks)
- useApplicationDiscoveryLogic.ts (250 records, 71s, EnrichmentLevel parameter)
- useAzureDiscoveryLogic.ts
- useActiveDirectoryDiscoveryLogic.ts
- useAWSDiscoveryLogic.ts (TypeScript fixes applied)
- useHyperVDiscoveryLogic.ts (TypeScript fixes applied)
- useOffice365DiscoveryLogic.ts (TypeScript fixes applied)
- usePowerPlatformDiscoveryLogic.ts (TypeScript fixes applied)
- useSecurityInfrastructureDiscoveryLogic.ts (TypeScript fixes applied)

## ✅ Implemented - All Discovery Hooks (55 Total)

**Cloud & Identity (15 hooks)**
- useActiveDirectoryDiscoveryLogic.ts
- useAzureDeviceDiscoveryLogic.ts
- useAzureDiscoveryLogic.ts
- useAzureInfraDiscoveryLogic.ts
- useAzureM365DiscoveryLogic.ts
- useAzureResourceDiscoveryLogic.ts
- useAzureSecurityDiscoveryLogic.ts
- useConditionalAccessDiscoveryLogic.ts
- useEntraIDAppDiscoveryLogic.ts
- useExchangeDiscoveryLogic.ts
- useExternalIdentityDiscoveryLogic.ts
- useGoogleWorkspaceDiscoveryLogic.ts
- useGraphDiscoveryLogic.ts
- useIdentityGovernanceDiscoveryLogic.ts
- useOffice365DiscoveryLogic.ts

**Infrastructure & Networking (17 hooks)**
- useAWSCloudInfrastructureDiscoveryLogic.ts
- useAWSDiscoveryLogic.ts
- useBackupRecoveryDiscoveryLogic.ts
- useDNSDHCPDiscoveryLogic.ts
- useDomainDiscoveryLogic.ts
- useFileServerDiscoveryLogic.ts
- useFileSystemDiscoveryLogic.ts
- useHyperVDiscoveryLogic.ts
- useInfrastructureDiscoveryLogic.ts
- useNetworkDiscoveryLogic.ts
- useNetworkInfrastructureDiscoveryLogic.ts
- usePhysicalServerDiscoveryLogic.ts
- usePrinterDiscoveryLogic.ts
- useStorageArrayDiscoveryLogic.ts
- useVirtualizationDiscoveryLogic.ts
- useVMwareDiscoveryLogic.ts
- useWebServerDiscoveryLogic.ts

**Security & Compliance (10 hooks)**
- useCertificateAuthorityDiscoveryLogic.ts
- useCertificateDiscoveryLogic.ts
- useDataClassificationDiscoveryLogic.ts
- useDataLossPreventionDiscoveryLogic.ts
- useEDiscoveryLogic.ts
- useIntuneDiscoveryLogic.ts
- useLicensingDiscoveryLogic.ts
- usePaloAltoDiscoveryLogic.ts
- usePanoramaInterrogationDiscoveryLogic.ts
- useSecurityInfrastructureDiscoveryLogic.ts

**Applications & Data (13 hooks)**
- useApplicationDependencyMappingDiscoveryLogic.ts
- useApplicationDiscoveryLogic.ts
- useDatabaseSchemaDiscoveryLogic.ts
- useGPODiscoveryLogic.ts
- useMultiDomainForestDiscoveryLogic.ts
- useOneDriveDiscoveryLogic.ts
- usePowerBIDiscoveryLogic.ts
- usePowerPlatformDiscoveryLogic.ts
- useScheduledTaskDiscoveryLogic.ts
- useSharePointDiscoveryLogic.ts
- useSQLServerDiscoveryLogic.ts
- useTeamsDiscoveryLogic.ts
- useWebServerConfigDiscoveryLogic.ts

## 📋 Known Issues to Address
- useExchangeDiscoveryLogic.ts: Contains debug console.log statements (needs cleanup)
- useTeamsDiscoveryLogic.ts: Contains TODO comments for API replacement (low priority)

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

---

# Webpack & Electron Build Critical Patterns

## CSP Plugin Conflicts with Webpack Chunk Loading

**Problem:** CspHtmlWebpackPlugin creates nonce-based CSP headers that break webpack chunk loading

**Root Cause:** When CSP headers include nonces or hashes, browsers ignore 'unsafe-inline' directive, preventing webpack from loading dynamic chunks

**Error Symptoms:**
```
Refused to execute inline script because it violates CSP directive
global is not defined at jsonp chunk loading
```

**Solution:** Disable CspHtmlWebpackPlugin for Electron apps

```javascript
// webpack.renderer.config.js - DISABLE CSP PLUGIN
// new CspHtmlWebpackPlugin({ ... }), // ❌ Breaks webpack chunks in Electron

// Instead, use meta tag in index.html for basic security
// Electron apps run locally, so strict CSP is less critical than web apps
```

**Why This Works:**
- Electron apps are sandboxed desktop applications, not exposed web apps
- webpack needs inline script execution for chunk loading
- Meta tag CSP in HTML provides sufficient baseline security

## Global Variable Polyfill for Webpack

**Problem:** `global is not defined` in webpack bundles

**Solution:** Create global-shim.js and configure ProvidePlugin

**CREATE FILE:** `guiv2/src/global-shim.js`
```javascript
/**
 * Global shim for Electron renderer process
 */
if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof globalThis === 'undefined') {
  window.globalThis = window;
}

module.exports = window;
```

**CONFIGURE WEBPACK:** `webpack.renderer.config.js`
```javascript
new webpack.ProvidePlugin({
  process: 'process/browser',
  Buffer: ['buffer', 'Buffer'],
  global: path.resolve(__dirname, 'src/global-shim.js'),
}),
```

## Critical: Always Build Preload Bundle

**Problem:** Application fails to start with "Cannot load preload script"

**Cause:** `npm run build` only builds main + renderer, NOT preload

**Solution:** Build all 3 bundles explicitly

```powershell
# COMPLETE BUILD - ALL 3 BUNDLES REQUIRED
cd C:\enterprisediscovery\guiv2
npm run build:main                                                  # Main process
npx webpack --config webpack.preload.config.js --mode=production   # Preload (CRITICAL!)
npm run build:renderer                                             # Renderer UI
```

**Why Preload is Critical:**
- Preload script establishes secure bridge between main and renderer
- Without it, renderer has no access to Electron APIs
- Must be rebuilt separately - not included in `npm run build`

## Bundle Analyzer Performance Tip

**Problem:** Bundle analyzer runs on every build, slowing development

**Solution:** Make it conditional

```javascript
// webpack.renderer.config.js
...(process.env.ANALYZE_BUNDLE === 'true' ? [
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    reportFilename: 'bundle-analysis.html',
  })
] : []),
```

**Usage:**
```powershell
# Normal build (fast)
npm run build:renderer

# Analyze bundle (slow, generates report)
$env:ANALYZE_BUNDLE='true'; npm run build:renderer
```

---

# Production Security Patterns

## Remove Debug Logging for Production

**Security Risk:** console.log statements leak sensitive data in production

**Pattern:** Remove all console.log, keep console.error/warn

```typescript
// ❌ REMOVE in production
console.log('[Component] User data:', userData);
console.log('[API] Auth token:', token);
console.log('[Service] Processing:', sensitiveData);

// ✅ KEEP for error handling
console.error('[Component] Error:', error);
console.warn('[Service] Warning:', warning);
```

**Implementation:**
- Use agent to search and remove: `Grep console\.log`
- Replace with structured logger that filters by NODE_ENV
- Use `logger.debug()` for development, `logger.error()` for production

## Stack Trace Protection in Error Boundaries

**Security Risk:** Stack traces expose code structure and file paths

**Pattern:** Only show stack traces in development

```typescript
// ErrorBoundary.tsx
{process.env.NODE_ENV === 'development' && error?.stack && (
  <pre>{error.stack}</pre>
)}

// In production: error.stack is hidden
```

## Input Sanitization Utilities

**Create:** `guiv2/src/shared/security.ts`

```typescript
// Prevent directory traversal
export function sanitizeFilePath(filePath: string): string {
  return filePath
    .replace(/\.\./g, '')           // Remove ../
    .replace(/[<>:"|?*]/g, '')     // Remove forbidden chars
    .replace(/^[\/\\]/, '')         // Remove leading slashes
    .trim();
}

// Prevent XSS
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
```

---

# TypeScript Type Safety Patterns

## Event Listener Type Errors in Electron

**Problem:** TypeScript can't infer event types for removeListener

**Error:**
```
Argument of type 'string' is not assignable to parameter of type 'will-resize'
```

**Solution:** Type assertion with `as any`

```typescript
// windowManager.ts or ipcHandlers.ts
private cleanup(): void {
  this.eventListeners.forEach((listener, event) => {
    if (this.window && !this.window.isDestroyed()) {
      this.window.removeListener(event as any, listener); // ✅ Type assertion
    }
  });
  this.eventListeners.clear();
}
```

**Why This Works:**
- Electron's event system uses dynamic event names
- TypeScript can't validate all possible event strings
- We know the event name is valid from the Map

## Optional API Methods Pattern

**Problem:** Optional Electron API methods throw type errors

**Solution:** Optional chaining with try-catch

```typescript
// ErrorBoundary.tsx
try {
  window.electron?.logError?.({ error, errorInfo });
} catch (e) {
  // Logging not available, ignore
}
```

---

# Component Architecture Patterns

## Simplified State Persistence

**Anti-Pattern:** Complex custom hooks for localStorage

```typescript
// ❌ COMPLEX: Custom hook with validation, loading states, cache
const { savedState, saveState, isLoading } = useAgGridStatePersistence(key);
```

**Better Pattern:** Direct localStorage with error handling

```typescript
// ✅ SIMPLE: Direct localStorage with try-catch
const [savedState, setSavedState] = useState<any>(null);

useEffect(() => {
  if (persistenceKey) {
    try {
      const stored = localStorage.getItem(`ag-grid-state-${persistenceKey}`);
      if (stored) setSavedState(JSON.parse(stored));
    } catch (error) {
      console.warn('Failed to load grid state:', error);
    }
  }
}, [persistenceKey]);

const saveState = useCallback((state: any) => {
  if (persistenceKey) {
    try {
      localStorage.setItem(`ag-grid-state-${persistenceKey}`, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save grid state:', error);
    }
  }
}, [persistenceKey]);
```

**Benefits:**
- Fewer dependencies
- Easier to debug
- More maintainable
- Handles errors gracefully

## Accessibility: ARIA Labels for Data Grids

**Pattern:** Add semantic HTML and ARIA attributes

```typescript
<div
  ref={ref}
  className={containerClasses}
  role="region"                    // Semantic role
  aria-label="Data grid"           // Screen reader label
  aria-live="polite"                // Announce updates
>
  {/* Grid content */}
</div>
```

**Benefits:**
- Screen reader support
- Keyboard navigation hints
- Better semantic structure

---

# Quick Reference: Common Build Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `CSP violation: inline script` | CspHtmlWebpackPlugin with nonces | Disable plugin, use meta tag |
| `global is not defined` | Missing global polyfill | Add global-shim.js + ProvidePlugin |
| `Cannot load preload script` | Preload not built | `npx webpack --config webpack.preload.config.js` |
| `EBUSY: resource busy` | Electron still running | `Get-Process electron \| Stop-Process -Force` |
| Stack traces in production | No NODE_ENV check | Add `process.env.NODE_ENV === 'development'` |
| TypeScript event errors | Strict type checking | Use `as any` for dynamic events |
