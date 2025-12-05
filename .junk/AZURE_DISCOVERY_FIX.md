# CRITICAL FIX: Azure Discovery Parameter Structure (2025-11-09)

## Root Cause
Azure Discovery completes in ~1 second returning empty results due to parameter structure mismatch.

## The Fix

**File**: `C:\enterprisediscovery\src\main\services\powerShellService.ts`
**Lines**: 924-932

```typescript
// Prepare discovery parameters with credentials
// IMPORTANT: Additional params must be nested in AdditionalParams hashtable
const discoveryParams = {
  CompanyName: companyName,
  TenantId: credentials.tenantId,
  ClientId: credentials.clientId,
  ClientSecret: credentials.clientSecret,
  OutputPath: `C:\\DiscoveryData\\${companyName}\\Raw`,
  AdditionalParams: additionalParams,  // MUST BE NESTED!
};
```

**WRONG**  (old code):
```typescript
const discoveryParams = {
  ...additionalParams,  // WRONG - spreads at top level
};
```

## Why

PowerShell function `Start-AzureDiscovery` (AzureDiscovery.psm1 lines 250-252):
```powershell
foreach ($key in $AdditionalParams.Keys) {
    $config[$key] = $AdditionalParams[$key]
}
```

Expects `AdditionalParams` as nested hashtable. When params are spread at top level, PowerShell ignores them.
Result: Module runs but doesn't know what to discover (no IncludeUsers, IncludeGroups flags).

## Credentials Fix

**Profile config**: `C:\Users\lukia\AppData\Roaming\MandADiscoverySuite\profiles.json`
- Line 8 must be: `"tenantId": "4c54e13b-5380-483b-a9af-32e1f265f614"`

**SafeStorage file**: `C:\Users\lukia\AppData\Roaming\Electron\credentials.enc`
- If corrupted: DELETE and restart app to force re-migration

**Legacy source** (correct values):
`C:\discoverydata\ljpops\Credentials\discoverycredentials.config`

## Testing

**Fixed behavior**:
- Takes 30+ seconds
- Shows streaming output
- Generates CSV files in C:\DiscoveryData\ljpops\Raw\
- Returns actual data

**Broken behavior**:
- Completes in ~1000ms
- Returns empty `{}`
- No streaming output
- ClientId shows as 'N/A'
