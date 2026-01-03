# Claude Code Local Instructions

## App Launch Command

**IMPORTANT**: Always use this command to launch the Electron app:

```bash
powershell.exe -Command "cd C:\enterprisediscovery\guiv2; npm start 2>&1 | Select-Object -First 50"
```

With a **30s timeout**. Do NOT use `Start-Process` - it launches in background and you can't see if it started.

## Deployment Workflow

1. Stop Electron: `powershell.exe -Command "Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force"`
2. Copy files to deployment: `C:\enterprisediscovery\`
3. Clean webpack: `if (Test-Path .webpack) { Remove-Item -Recurse -Force .webpack }`
4. Build main: `npm run build:main`
5. Build preload: `npx webpack --config webpack.preload.config.js --mode=production`
6. Build renderer: `npm run build:renderer`
7. Launch with the command above

## Key Directories

- Source: `D:\Scripts\UserMandA`
- Deployment: `C:\enterprisediscovery`
- Profile data: `C:\DiscoveryData\<profileName>`

## Common Issues

- If app doesn't start, check for TypeScript errors first
- Always run full build (main + preload + renderer) after copying files
- The status checking loops need to be fast - don't add delays

### Robocopy vs Copy-Item for Deployment

**CRITICAL**: `robocopy /MIR` compares files by timestamp and size. If a source file was modified but has the same size as destination, robocopy may NOT copy it.

**Symptoms**: After robocopy and full rebuild, visual changes don't appear in the app.

**Solution**: For updated source files, ALWAYS verify and use explicit `Copy-Item -Force`:

```powershell
# 1. Verify source has the changes
Select-String -Path 'D:\Scripts\UserMandA\guiv2\...\MyFile.tsx' -Pattern 'MyNewComponent'

# 2. Check if destination has the changes
Select-String -Path 'C:\enterprisediscovery\guiv2\...\MyFile.tsx' -Pattern 'MyNewComponent'

# 3. If destination is missing changes, force copy
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\...\MyFile.tsx' -Destination 'C:\enterprisediscovery\guiv2\...\' -Force
```

**Best practice for deployment**:
1. After editing files, use explicit `Copy-Item -Force` for the specific files you changed
2. Robocopy is still useful for initial full sync, but don't rely on it for incremental updates
3. Always verify deployment file has your changes before rebuilding

## DPAPI Credential Decryption Pattern

**CRITICAL**: Azure credentials stored in `C:\DiscoveryData\{ProfileName}\Credentials\discoverycredentials.config` are encrypted using Windows DPAPI (Data Protection API) and stored as Base64-encoded encrypted data.

**Common Mistake**: Trying to parse the file directly as JSON will fail with error:
```
Invalid JSON primitive: 01000000d08c9ddf0115d1118c7a00c04fc297eb...
```

**Correct Pattern** (used by all Azure discovery modules):

```powershell
# Read and decrypt DPAPI-encrypted credentials
Add-Type -AssemblyName System.Security
$encryptedContent = Get-Content $credPath -Raw

# Strip BOM (Byte Order Mark) if present
if ($encryptedContent[0] -eq [char]0xFEFF) {
    $encryptedContent = $encryptedContent.Substring(1)
}
$encryptedContent = $encryptedContent.Trim()

# Convert Base64 to bytes and decrypt using DPAPI
$encryptedBytes = [Convert]::FromBase64String($encryptedContent)
$decryptedBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
    $encryptedBytes,
    $null,
    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
)

# Convert decrypted bytes to string (try Unicode first, then UTF-8)
$decryptedJson = $null
try {
    # Try Unicode (UTF-16) first - PowerShell default
    $decryptedJson = [System.Text.Encoding]::Unicode.GetString($decryptedBytes)
    $credContent = $decryptedJson | ConvertFrom-Json
} catch {
    # Fallback to UTF-8 if Unicode fails
    $decryptedJson = [System.Text.Encoding]::UTF8.GetString($decryptedBytes)
    $credContent = $decryptedJson | ConvertFrom-Json
}

# Access credential fields (note: capitalized property names)
$tenantId = $credContent.TenantId      # NOT .tenantId
$clientId = $credContent.ClientId      # NOT .clientId
$clientSecret = $credContent.ClientSecret  # NOT .clientSecret
```

**Reference Files**:
- `guiv2/read-credentials.ps1` - Standalone decryption script
- `guiv2/src/main/services/credentialService.ts` - TypeScript service with multiple decryption strategies
- `Modules/Discovery/EnvironmentDetectionDiscovery.psm1` - PowerShell module example (Get-AzureConnectivityStatus function)

**Why This Pattern**:
1. **Hex OR Base64 Encoding**: DPAPI encrypted data is binary, stored as hex string OR Base64 string in file
2. **DPAPI Decryption**: Windows DPAPI provides user-scoped encryption (CurrentUser scope)
3. **UTF-16 Encoding (CRITICAL)**: Decrypted bytes are **UTF-16 (Unicode) encoded**, NOT UTF-8
   - PowerShell stores JSON as UTF-16 by default
   - Must try `[System.Text.Encoding]::Unicode.GetString()` BEFORE UTF-8
   - Symptoms if using UTF-8: null bytes between characters (`\x00m\x00e\x00n\x00t`)
4. **Capitalized Properties**: Credential files use Pascal case (TenantId, not tenantId)

**DO NOT**:
- ❌ `Get-Content $path | ConvertFrom-Json` (tries to parse encrypted data as JSON)
- ❌ `ConvertTo-SecureString` without proper decryption (wrong approach for this file format)

**DO**:
- ✅ Use the exact pattern above (Base64 → DPAPI decrypt → UTF8 → JSON)
- ✅ Check for BOM before decryption
- ✅ Use capitalized property names when accessing credentials

## OAuth2 Token Request Pattern

**CRITICAL**: When making OAuth2 token requests with `Invoke-RestMethod`, pass the body as a **hashtable WITHOUT ContentType**. PowerShell will auto-convert to `application/x-www-form-urlencoded`.

**Common Mistake**: Specifying `-ContentType "application/x-www-form-urlencoded"` when body is a hashtable causes "Invalid JSON primitive" errors.

**Correct Pattern**:
```powershell
# OAuth2 client credentials flow
$tokenBody = @{
    client_id     = $clientId
    scope         = "https://graph.microsoft.com/.default"
    client_secret = $clientSecret
    grant_type    = "client_credentials"
}

# ✅ CORRECT: No ContentType parameter - PowerShell auto-converts hashtable
$tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST -Body $tokenBody

# Extract access token
$accessToken = $tokenResponse.access_token
```

**Why This Works**:
- When Body is a hashtable and no ContentType is specified, PowerShell automatically:
  1. Converts hashtable to URL-encoded string: `client_id=xxx&scope=yyy&...`
  2. Sets `Content-Type: application/x-www-form-urlencoded` header
  3. Parses JSON response automatically

**DO NOT**:
- ❌ `Invoke-RestMethod -Body $hashtable -ContentType "application/x-www-form-urlencoded"` (PowerShell won't convert hashtable)
- ❌ Manually building URL-encoded string unless necessary

**DO**:
- ✅ Pass hashtable body WITHOUT ContentType parameter
- ✅ Let PowerShell handle conversion automatically
- ✅ Use same pattern across all Azure modules (Exchange, SharePoint, OneDrive, etc.)

**Reference**: See `Modules/Discovery/ExchangeDiscovery.psm1` (Get-ExchangeAccessToken function, line 98)

## Discovery Data Nesting Pattern

**CRITICAL**: PowerShell discovery results are nested THREE levels deep:

```typescript
// In discovery logic hooks (e.g., useAzureResourceDiscoveryLogic.ts)
const rawData = results.data as any;           // Level 1: Execution wrapper
const psResult = rawData.data || rawData;      // Level 2: PS result wrapper
const data = psResult.Data || psResult;        // Level 3: Actual resources

// Now access resource arrays:
data.Subscriptions    // ✅ Works
data.ResourceGroups   // ✅ Works
data.VirtualMachines  // ✅ Works
```

**Structure breakdown:**
- `results.data` → execution wrapper: `{success, data, duration, warnings, stdout, stderr, exitCode, totalItems, recordCount}`
- `results.data.data` → PowerShell result: `{Success, ModuleName, Data, RecordCount, Errors, Warnings, Metadata, StartTime, EndTime, ExecutionId}`
- `results.data.data.Data` → actual resources: `{Subscriptions, ResourceGroups, VirtualMachines, StorageAccounts, ...}`

**Common mistake:** Accessing `results.data.Subscriptions` directly - this returns `undefined` because resources are in `results.data.data.Data.Subscriptions`.

## Discovery Route Mapping

Central mapping file: `guiv2/src/renderer/constants/discoveryRouteMapping.ts`
- Maps 62+ discovery modules to their discovered view routes
- Pattern: Discovery uses hyphens (`/discovery/azure-resource`), Discovered is lowercase without hyphens (`/discovered/azureresource`)
- Functions: `getDiscoveredRoute(moduleId)`, `getModuleLabel(moduleId)`, `getViewDataLabel(moduleId)`

## ViewDiscoveredDataButton Component

Reusable navigation button for discovery views: `guiv2/src/renderer/components/molecules/ViewDiscoveredDataButton.tsx`

```tsx
// Preferred usage with moduleId (auto-lookup):
<ViewDiscoveredDataButton moduleId="azure-resource" recordCount={18} />

// Explicit path override:
<ViewDiscoveredDataButton discoveredPath="/discovered/azureresource" label="View Azure Data" />
```

## Rich Discovery Results View Process

**When the user runs a discovery and provides console + screen output, follow this process:**

### Step 1: Analyze Discovery Output
- User provides discovery logs and/or screenshot of results
- Identify the discovery module name (e.g., "EntraIDM365", "AzureResource", "Intune")
- Note the CSV file names generated (check `C:\DiscoveryData\<profile>\Raw\*.csv`)

### Step 2: Examine CSV Structure
```bash
powershell.exe -Command "Get-ChildItem 'C:\DiscoveryData\<profile>\Raw\*<ModuleName>*.csv' | Select-Object Name"
powershell.exe -Command "Get-Content 'C:\DiscoveryData\<profile>\Raw\<filename>.csv' -TotalCount 3"
```

### Step 3: Create Logic Hook
Create `guiv2/src/renderer/hooks/use<ModuleName>DiscoveredLogic.ts`:
- Load CSV files using Papa.parse
- Define TypeScript interfaces for each CSV structure
- Calculate statistics (counts, breakdowns, top items)
- Provide filtering and tab management
- Export functions (CSV, Excel)

**Template pattern from:** `useLicensingDiscoveredLogic.ts` or `useEntraIDM365DiscoveredLogic.ts`

### Step 4: Create/Update Discovered View
Update `guiv2/src/renderer/views/discovered/<ModuleName>DiscoveredView.tsx`:
- Import the logic hook
- **MANDATORY: Add Discovery Success % Card as FIRST statistics card**
- Add 12 statistics cards (3 rows x 4 columns) with gradient colors
- Add tabs for each data type (Overview + data tabs)
- Overview tab: breakdown panels, top lists with progress bars
- Data tabs: search, filters, VirtualizedDataGrid

#### Discovery Success % Card (REQUIRED on ALL enriched views)
```typescript
// Add to logic hook statistics calculation:
discoverySuccessPercentage: (() => {
  const expectedSources = [
    { name: 'DataSource1', hasData: data1.length > 0, weight: 20 },
    { name: 'DataSource2', hasData: data2.length > 0, weight: 15 },
    // ... weight by importance (total should = 100)
  ];
  const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
  const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
  return Math.round((achievedWeight / totalWeight) * 100);
})(),
dataSourcesReceivedCount: expectedSources.filter(s => s.hasData).length,
dataSourcesTotal: expectedSources.length,

// Add DiscoverySuccessCard component to BOTH Discovery and Discovered views:
const DiscoverySuccessCard: React.FC<{percentage: number; received: number; total: number}> = ({ percentage, received, total }) => {
  const getGradient = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };
  // ... renders colored card showing X% and X/Y data sources
};
```
Color thresholds: 80%+ green, 60-79% yellow, 40-59% orange, <40% red

### Step 5: Update Discovery View Results
Update `guiv2/src/renderer/views/discovery/<ModuleName>DiscoveryView.tsx`:
- Import the discovered logic hook
- Replace simple results with rich statistics cards
- Add data tabs (Users, Groups, etc.) to the tab bar
- Add the VirtualizedDataGrid for each data tab
- Reload discovered data after discovery completes

### Step 6: Deploy and Test
```bash
# Stop, copy, build, launch
powershell.exe -Command "Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force"
powershell.exe -Command "Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\hooks\use<ModuleName>DiscoveredLogic.ts' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\hooks\' -Force"
powershell.exe -Command "Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\views\discovered\<ModuleName>DiscoveredView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovered\' -Force"
powershell.exe -Command "Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\<ModuleName>DiscoveryView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovery\' -Force"
powershell.exe -Command "cd C:\enterprisediscovery\guiv2; if (Test-Path .webpack) { Remove-Item -Recurse -Force .webpack }; npm run build:main; npx webpack --config webpack.preload.config.js --mode=production; npm run build:renderer"
powershell.exe -Command "cd C:\enterprisediscovery\guiv2; npm start 2>&1 | Select-Object -First 50"
```

### Files Created/Modified Per Module
1. `guiv2/src/renderer/hooks/use<ModuleName>DiscoveredLogic.ts` - NEW logic hook
2. `guiv2/src/renderer/views/discovered/<ModuleName>DiscoveredView.tsx` - UPDATED rich view
3. `guiv2/src/renderer/views/discovery/<ModuleName>DiscoveryView.tsx` - UPDATED with results

### Statistics Card Color Palette
Row 1: `sky-500`, `green-500`, `purple-500`, `yellow-500`
Row 2: `indigo-500`, `cyan-500`, `emerald-500`, `orange-500`
Row 3: `rose-500`, `violet-500`, `teal-500`, `pink-500`

### Example Icons per Data Type
- Users: `Users`, `UserCheck`, `UserX`, `UserPlus`
- Groups: `FolderTree`, `Shield`, `Cloud`
- Teams: `Building2`, `MessageSquare`
- SharePoint: `Globe`, `Share2`
- Applications: `Settings`, `Key`
- Security: `Shield`, `Lock`
- Devices: `Server`, `HardDrive`

---

## PowerShell Module Version Tracking

**Rule**: Increment version by +0.1 on each change, update changelog.

| Module | Current Version | Last Modified | Description |
|--------|-----------------|---------------|-------------|
| ExchangeDiscovery.psm1 | v2.0.0 | 2026-01-01 | Mail flow, DNS, security policies |

### ExchangeDiscovery.psm1 Changelog
- **v2.0.0** (2026-01-01) - Major mail flow enhancement:
  - Added Transport Rules discovery (Get-TransportRule)
  - Added Inbound/Outbound Connectors discovery
  - Added Remote Domains discovery
  - Added Organization Config discovery
  - Added Organization Relationships (federation)
  - Added DKIM Signing Config discovery
  - Added Anti-Spam, Anti-Phishing, Malware policy discovery
  - Added Migration Endpoints and Batches discovery
  - Added Retention Policies and Journal Rules discovery
  - Added DNS/MX/SPF/DKIM/DMARC discovery with third-party gateway detection
- **v1.0.0** (2025-01-18) - Initial release with mailboxes, groups, contacts

---

## Current Session Tracker (2026-01-01)

### Task: Exchange Module Enhancement for Mail Flow

**Status**: Exchange views fully operational with Discovery Success % card

**Completed:**
1. ✅ Enhanced ExchangeDiscovery.psm1 with comprehensive mail flow discovery
2. ✅ Added Transport Rules, Connectors, Remote Domains discovery
3. ✅ Added Organization Config, Org Relationships discovery
4. ✅ Added Security Policies (DKIM, Anti-Spam, Anti-Phish, Malware) discovery
5. ✅ Added Migration Config (Endpoints, Batches) discovery
6. ✅ Added DNS/MX/SPF/DKIM/DMARC discovery with third-party gateway detection
7. ✅ Deployed module v2.0.0 to C:\enterprisediscovery
8. ✅ Added Discovery Success % card to Exchange views (both Discovery and Discovered)
9. ✅ Synced tabs between ExchangeDiscoveryView and ExchangeDiscoveredView
10. ✅ Documented Discovery Success % requirement in buildviewsenrich.md
11. ✅ Documented Discovery Success % requirement in claude.local.md
12. ✅ preload.ts restored (Grok demo changes discarded)

**Exchange Column Definitions**: Already using correct AG Grid ColDef format (`field`, `headerName`). The AG Grid warnings in console are from OTHER modules (EntraIDM365, Azure, Licensing, etc.) still using legacy `key`, `header` format - not from Exchange.

**Important**: Mail flow cmdlets (Get-TransportRule, etc.) require Exchange Online PowerShell connection, not just Graph API. The `$exoConnected` variable must be true for mail flow discovery to run.

---

## Discovered & Discovery View Scrolling Pattern (MANDATORY)

**CRITICAL**: ALL discovered views and discovery views MUST allow scrolling past the bottom of the window on ALL tabs. Many views have more content than fits on one screen.

### Required Pattern for ALL Views

Every discovered view and discovery view file must implement this exact scrolling pattern:

```tsx
return (
  <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
    {/* Header - MUST have flex-shrink-0 */}
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
      {/* Header content */}
    </div>

    {/* Statistics Cards - MUST have flex-shrink-0 */}
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
      {/* Statistics cards */}
    </div>

    {/* Tabs - MUST have flex-shrink-0 */}
    <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      {/* Tabs */}
    </div>

    {/* Search/Actions (if present) - MUST have flex-shrink-0 */}
    <div className="flex gap-4 mb-4 flex-shrink-0">
      {/* Search and action buttons */}
    </div>

    {/* Content Area - MUST have overflow-y-auto and min-h-0 */}
    <div className="flex-1 overflow-y-auto min-h-0">
      {activeTab === 'overview' && (
        <div className="p-6">
          {/* Overview content - can scroll */}
        </div>
      )}

      {activeTab === 'data' && (
        <div className="p-6">
          {/* Search bar - flex-shrink-0 if needed */}
          <div className="flex gap-4 mb-4 flex-shrink-0">
            <input ... />
            <button ... />
          </div>

          {/* Data Grid - minHeight ensures scrollability */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden" style={{ minHeight: '600px' }}>
            <VirtualizedDataGrid ... />
          </div>
        </div>
      )}
    </div>
  </div>
);
```

### Key CSS Classes Breakdown

| Element | Required Classes | Purpose |
|---------|------------------|---------|
| **Main container** | `h-screen flex flex-col overflow-hidden` | Full screen height, flex layout, prevent outer scroll |
| **Header** | `flex-shrink-0` | Prevent header from shrinking when content overflows |
| **Statistics cards** | `flex-shrink-0` | Keep cards at fixed size |
| **Tabs** | `flex-shrink-0` | Keep tabs visible at top |
| **Search/Actions** | `flex-shrink-0` | Keep action bar fixed |
| **Content area** | `flex-1 overflow-y-auto min-h-0` | Take remaining space, enable vertical scroll, allow shrinking |
| **Data grids** | `style={{ minHeight: '600px' }}` | Ensure grid has minimum height for scrolling |

### Common Mistakes to Avoid

❌ **WRONG**: Using `h-full` on main container (doesn't constrain height properly)
❌ **WRONG**: Using `overflow-auto` instead of `overflow-y-auto` (can cause horizontal scroll issues)
❌ **WRONG**: Using `h-full` on inner tab content containers (prevents scrolling)
❌ **WRONG**: Missing `flex-shrink-0` on fixed elements (causes layout collapse)
❌ **WRONG**: Missing `min-h-0` on content area (prevents flex item from shrinking)

✅ **CORRECT**: Use `h-screen` on main container
✅ **CORRECT**: Use `overflow-y-auto min-h-0` on scrollable content areas
✅ **CORRECT**: Add `flex-shrink-0` to ALL fixed-height sections
✅ **CORRECT**: Remove `h-full` from inner containers that should scroll
✅ **CORRECT**: Add `minHeight` style to data grids to ensure scrollable content

### Verification Checklist

When creating or updating a discovered/discovery view, verify:

- [ ] Main container uses `h-screen flex flex-col overflow-hidden`
- [ ] Header has `flex-shrink-0`
- [ ] Statistics cards section has `flex-shrink-0`
- [ ] Tabs section has `flex-shrink-0`
- [ ] Content area uses `flex-1 overflow-y-auto min-h-0`
- [ ] No inner containers use `h-full` (use `flex flex-col` without height constraints)
- [ ] Data grids have `minHeight: '600px'` style
- [ ] Test EVERY tab to ensure content scrolls past bottom of window
- [ ] Test with varying window heights to ensure scrolling works

### Automated Fix Script

If bulk fixing is needed, use: `D:\Scripts\UserMandA-1\fix-scrolling-simple.ps1`

This script automatically applies the scrolling pattern to all discovered views.

---
