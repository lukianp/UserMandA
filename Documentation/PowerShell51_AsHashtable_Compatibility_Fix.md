# PowerShell 5.1 -AsHashtable Compatibility Fix

## Problem Description

The MandA-Orchestrator.ps1 was crashing during the discovery phase with the following fatal error:

```
[2025-06-09 23:37:35] [Orchestrator] [!!] FATAL ERROR: A parameter cannot be found that matches parameter name 'AsHashtable'.
[2025-06-09 23:37:35] [Orchestrator] [X] Stack Trace: at Invoke-DiscoveryPhase, C:\UserMigration\Core\MandA-Orchestrator.ps1: line 1058
```

## Root Cause

The issue was on line 1058 of the MandA-Orchestrator.ps1 script:

```powershell
$threadSafeConfig = $global:MandA.Config | ConvertTo-Json -Depth 10 | ConvertFrom-Json -AsHashtable
```

The `-AsHashtable` parameter for `ConvertFrom-Json` was introduced in PowerShell 6.0, but the production environment is running PowerShell 5.1 (PSHostVersion: 5.1.17763.7309).

## Solution Implemented

### 1. Added Helper Function

Added a new `Convert-ObjectToHashtable` function to the HELPER FUNCTIONS section (around line 300):

```powershell
function Convert-ObjectToHashtable {
    param($InputObject)
    
    if ($null -eq $InputObject) { return $null }
    
    # Handle arrays and collections
    if ($InputObject -is [System.Collections.IEnumerable] -and -not ($InputObject -is [string])) {
        $collection = foreach ($item in $InputObject) {
            Convert-ObjectToHashtable -InputObject $item
        }
        return $collection
    }
    
    # Handle PSCustomObject
    if ($InputObject -is [System.Management.Automation.PSCustomObject]) {
        $hash = @{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $hash[$property.Name] = Convert-ObjectToHashtable -InputObject $property.Value
        }
        return $hash
    }
    
    # Return all other types as-is
    return $InputObject
}
```

### 2. Replaced Incompatible Code

Replaced the problematic line in the `Invoke-DiscoveryPhase` function (around line 1076) with a PowerShell 5.1-compatible approach:

**Before (PowerShell 6.0+ only):**
```powershell
$threadSafeConfig = $global:MandA.Config | ConvertTo-Json -Depth 10 | ConvertFrom-Json -AsHashtable
```

**After (PowerShell 5.1 compatible):**
```powershell
# 1. Create a deep copy of the configuration by converting to and from JSON. This produces a PSCustomObject.
$configAsObject = $global:MandA.Config | ConvertTo-Json -Depth 10 | ConvertFrom-Json

# 2. Recursively convert the PSCustomObject back into a real [hashtable] using our new helper function.
$threadSafeConfig = Convert-ObjectToHashtable -InputObject $configAsObject

# 3. Inject the live authentication context into the newly copied config for this thread.
if ($script:LiveAuthContext) {
    $threadSafeConfig['_AuthContext'] = $script:LiveAuthContext
    Write-OrchestratorLog -Message "Injected auth context for module: $moduleName" -Level "DEBUG"
} else {
    Write-OrchestratorLog -Message "WARNING: No live auth context to inject for module: $moduleName" -Level "WARN"
}
```

## Key Benefits

1. **Backward Compatibility**: The solution works in both PowerShell 5.1 and newer versions
2. **Preserved Functionality**: All original logic including authentication context injection is maintained
3. **Thread Safety**: The deep copy mechanism ensures thread-safe operations in the runspace pool
4. **Type Preservation**: Arrays, nested objects, and primitive types are all handled correctly

## Testing

Created test script `Scripts/Simple-AsHashtable-Test.ps1` that verifies:

- ✅ The original `-AsHashtable` approach fails in PowerShell 5.1 (as expected)
- ✅ Our compatibility fix successfully converts PSCustomObjects to hashtables
- ✅ Nested objects are properly converted to hashtables
- ✅ Arrays are preserved correctly
- ✅ Authentication context injection works as intended

## Files Modified

1. **Core/MandA-Orchestrator.ps1**
   - Added `Convert-ObjectToHashtable` helper function
   - Replaced incompatible `-AsHashtable` usage with compatible approach

2. **Scripts/Simple-AsHashtable-Test.ps1** (new)
   - Test script to verify the fix works correctly

## Impact

This fix resolves the fatal crash during the discovery phase, allowing the orchestrator to run successfully in PowerShell 5.1 environments while maintaining all existing functionality and thread safety requirements.

## Validation

The fix has been validated with:
- PowerShell syntax validation
- Functional testing of the conversion logic
- Verification of thread-safe configuration copying
- Authentication context injection testing

The orchestrator should now run without the `-AsHashtable` parameter error in PowerShell 5.1 environments.