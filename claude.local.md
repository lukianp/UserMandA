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
