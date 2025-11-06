# Azure Discovery Output Issue - Architectural Analysis Report

## Executive Summary
The Azure Discovery module is not displaying output in the GUI execution window due to a **critical architectural mismatch** between the IPC handler being called and the event listeners configured in the renderer. The module execution may be working, but the output streaming is broken.

## Problem Statement
When users click the Azure Discovery button:
1. ❌ No output appears in the execution window
2. ❌ No logs are displayed
3. ❌ No progress indicators update
4. ⚠️ The discovery module may actually be executing but output is lost

## Root Cause Analysis

### 🔴 **PRIMARY ROOT CAUSE: IPC Handler/Event Listener Mismatch**

The Azure discovery hook has a fundamental architectural issue:

1. **The Hook Calls:** `electronAPI.executeDiscoveryModule()`
   - This invokes IPC channel: `powershell:executeDiscoveryModule`
   - Location: `C:\enterprisediscovery\src\renderer\hooks\useAzureDiscoveryLogic.ts:264`

2. **The Hook Listens To:** `window.electron.onDiscoveryOutput/Progress/Complete/Error`
   - These expect events: `discovery:output`, `discovery:progress`, etc.
   - Location: `C:\enterprisediscovery\src\renderer\hooks\useAzureDiscoveryLogic.ts:96-172`

3. **The Problem:**
   - `powershell:executeDiscoveryModule` handler **DOES NOT EMIT** any discovery events
   - Only `discovery:execute` handler emits the required events
   - Result: Complete disconnect between execution and output display

## Detailed Execution Flow Analysis

### Current (Broken) Flow:

```
[RENDERER] Azure Discovery Button Click
    ↓
[RENDERER] useAzureDiscoveryLogic.startDiscovery() - Line 211
    ↓
[RENDERER] electronAPI.executeDiscoveryModule('Azure', ...) - Line 264
    ↓
[IPC] Invoke 'powershell:executeDiscoveryModule'
    ↓
[MAIN] ipcHandlers.ts - Line 294-312
    ↓
[MAIN] psService.executeDiscoveryModule() - Line 297
    ↓
[MAIN] PowerShell module executes (may work!)
    ↓
[MAIN] Returns result directly (no event emission!)
    ↓
[RENDERER] Gets result but NO STREAMING OUTPUT
    ↓
[GUI] Execution window remains empty ❌
```

### Expected (Working) Flow:

```
[RENDERER] Discovery Button Click
    ↓
[RENDERER] Should call: window.electron.executeDiscovery()
    ↓
[IPC] Invoke 'discovery:execute'
    ↓
[MAIN] ipcHandlers.ts - Line 2274-2438
    ↓
[MAIN] Sets up event listeners for PowerShell streams
    ↓
[MAIN] psService.executeDiscoveryModule() with streamOutput: true
    ↓
[MAIN] PowerShell emits stream events
    ↓
[MAIN] Forwards events as 'discovery:output', 'discovery:progress'
    ↓
[RENDERER] Event listeners receive and display output
    ↓
[GUI] Execution window shows real-time logs ✅
```

## File-Level Analysis

### 1. **Azure Discovery View** (`C:\enterprisediscovery\src\renderer\views\discovery\AzureDiscoveryView.tsx`)
- Lines 29, 199: Calls `startDiscovery` from hook
- Lines 326-348: Renders execution log from `logs` array
- **Status:** ✅ Correctly implemented

### 2. **Azure Discovery Hook** (`C:\enterprisediscovery\src\renderer\hooks\useAzureDiscoveryLogic.ts`)
- Line 264: ❌ **WRONG**: Calls `electronAPI.executeDiscoveryModule()`
- Lines 96-172: ✅ Correctly sets up event listeners for discovery events
- Lines 119-125: ✅ Correctly adds logs from events
- **Issue:** Using wrong IPC channel that doesn't emit events

### 3. **IPC Handlers** (`C:\enterprisediscovery\src\main\ipcHandlers.ts`)

#### `powershell:executeDiscoveryModule` Handler (Lines 294-312)
```typescript
// ❌ PROBLEM: No event emission!
ipcMain.handle('powershell:executeDiscoveryModule', async (_, params) => {
  return await psService.executeDiscoveryModule(...); // Direct return, no events
});
```

#### `discovery:execute` Handler (Lines 2274-2438)
```typescript
// ✅ CORRECT: Full event streaming
ipcMain.handle('discovery:execute', async (event, args) => {
  // Sets up listeners for all PowerShell streams
  psService.on('stream:output', onOutputStream);
  psService.on('stream:error', onErrorStream);
  // ... more listeners

  // Forwards events to renderer
  mainWindow.webContents.send('discovery:output', {...});
  mainWindow.webContents.send('discovery:progress', {...});

  // Executes with streamOutput: true
  await psService.executeDiscoveryModule(..., { streamOutput: true });
});
```

### 4. **PowerShell Service** (`C:\enterprisediscovery\src\main\services\powerShellService.ts`)
- Lines 528-540: `parseAndEmitStreams()` - Emits output events when `streamOutput: true`
- Lines 870-935: `executeDiscoveryModule()` - Accepts options including `streamOutput`
- **Status:** ✅ Correctly implemented, supports streaming

### 5. **Preload Script** (`C:\enterprisediscovery\src\preload.ts`)
- Line 46-48: Exposes `executeDiscoveryModule` (maps to wrong handler)
- Lines 512-615: Exposes discovery event listeners correctly
- **Issue:** Missing `executeDiscovery` method that maps to `discovery:execute`

## Comparison with Working Patterns

### Active Directory Discovery (Working Reference)
- Also calls `electronAPI.executeDiscoveryModule()`
- **SAME ISSUE**: AD discovery likely also has no streaming output!
- File: `C:\enterprisediscovery\src\renderer\hooks\useActiveDirectoryDiscoveryLogic.ts:93`

### Pattern Analysis
All discovery modules using `executeDiscoveryModule` are affected. None will show real-time output.

## Impact Assessment

### Affected Components:
1. **Azure Discovery** - Primary issue
2. **Active Directory Discovery** - Same issue
3. **Exchange Discovery** - Likely affected
4. **Google Workspace Discovery** - Likely affected
5. **All other discovery modules** using the same pattern

### User Experience Impact:
- Users cannot see progress during long-running discoveries
- No feedback if discovery is actually running
- No error messages displayed in real-time
- Appears completely broken even if working

## Solutions Required

### Option 1: Fix the Hook (Recommended)
**File:** `C:\enterprisediscovery\src\renderer\hooks\useAzureDiscoveryLogic.ts`
**Line:** 264

**Current (Broken):**
```typescript
const result = await electronAPI.executeDiscoveryModule(
  'Azure',
  selectedSourceProfile.companyName,
  { /* params */ },
  { /* options */ }
);
```

**Fixed:**
```typescript
const result = await window.electron.executeDiscovery({
  moduleName: 'Azure',
  parameters: {
    CompanyName: selectedSourceProfile.companyName,
    IncludeUsers: formData.includeUsers,
    // ... other params
  },
  executionId: token
});
```

### Option 2: Fix the IPC Handler
**File:** `C:\enterprisediscovery\src\main\ipcHandlers.ts`
**Lines:** 294-312

Add event emission to the `powershell:executeDiscoveryModule` handler to match the `discovery:execute` handler's behavior.

### Option 3: Add Missing Preload Method
**File:** `C:\enterprisediscovery\src\preload.ts`

Add:
```typescript
executeDiscovery: (params: { moduleName: string; parameters: Record<string, any>; executionId?: string }) => {
  return ipcRenderer.invoke('discovery:execute', params);
},
```

## Verification Steps

1. **Check if module is actually executing:**
   ```powershell
   # Check for output files
   Get-ChildItem "C:\DiscoveryData\*\Raw\*Azure*" -Recurse
   ```

2. **Monitor PowerShell processes:**
   ```powershell
   Get-Process pwsh | Where-Object {$_.CommandLine -like "*Azure*"}
   ```

3. **Check Electron DevTools Console:**
   - Look for `[AzureDiscoveryHook]` log messages
   - Check for IPC handler console.log output

## Recommendations

### Immediate Fix (High Priority):
1. **Update Azure Discovery Hook** to use `discovery:execute` IPC channel
2. **Add executeDiscovery method** to preload script
3. **Test with real Azure credentials** to verify streaming works

### Long-term Architecture Improvements:
1. **Standardize all discovery hooks** to use the same IPC pattern
2. **Create a base discovery hook** that all modules extend
3. **Add integration tests** for event streaming
4. **Document the correct pattern** for future modules

### Testing Requirements:
1. Verify output appears in execution window
2. Confirm progress updates display
3. Test error message propagation
4. Validate cancellation functionality
5. Check all discovery modules for same issue

## Code Snippets for Immediate Fix

### Fix for useAzureDiscoveryLogic.ts (Line 211-302):
```typescript
const startDiscovery = useCallback(async () => {
  // ... validation code ...

  const token = `azure-discovery-${Date.now()}`;
  setCurrentToken(token);

  try {
    // Use discovery:execute handler instead of executeDiscoveryModule
    const result = await window.electron.executeDiscovery({
      moduleName: 'Azure',
      parameters: {
        CompanyName: selectedSourceProfile.companyName,
        TenantId: selectedSourceProfile.tenantId,
        ClientId: selectedSourceProfile.clientId,
        IncludeUsers: formData.includeUsers,
        IncludeGroups: formData.includeGroups,
        // ... other parameters
      },
      executionId: token
    });

    // Result handling remains the same
  } catch (err) {
    // Error handling remains the same
  }
}, [formData, isFormValid, selectedSourceProfile, addLog]);
```

## Conclusion

The Azure Discovery output issue is caused by a fundamental architectural mismatch where the renderer is calling an IPC handler that doesn't emit the events it's listening for. This creates a complete disconnect between module execution and output display. The fix requires aligning the IPC channel used with the event emission pattern, either by updating the hook to use the correct handler or by adding event emission to the existing handler.

**Severity:** High
**User Impact:** Critical
**Fix Complexity:** Low
**Estimated Fix Time:** 30 minutes

---
*Report Generated: November 6, 2025*
*Analysis performed on C:\enterprisediscovery codebase*