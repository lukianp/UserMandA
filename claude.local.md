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
- Add 12 statistics cards (3 rows x 4 columns) with gradient colors
- Add tabs for each data type (Overview + data tabs)
- Overview tab: breakdown panels, top lists with progress bars
- Data tabs: search, filters, VirtualizedDataGrid

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
