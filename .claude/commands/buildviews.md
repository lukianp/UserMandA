# BuildViews - Discovery Results View Builder

Analyzes discovery console output, examines CSV files, fixes bugs, and builds rich views.

## Usage

Simply say: **"buildviews"** then paste console output or describe the discovery module.

Examples:
- "buildviews" + paste console logs from Azure Resource discovery
- "buildviews Intune" + paste any errors or output
- "buildviews - fix the Azure discovery and build views"

## What This Agent Does

### Phase 1: Analysis
1. **Parse Console Output** - Extract module name, record counts, errors, warnings
2. **Identify CSV Files** - Find all `*Discovery_*.csv` files for the module
3. **Read CSV Structure** - Examine headers and sample data from each file
4. **Check for PowerShell Errors** - Look for execution errors, missing data, null values

### Phase 2: Fix Bugs (if needed)
1. **PowerShell Module Issues** - Fix syntax errors, null handling, data extraction
2. **CSV Export Issues** - Fix column mappings, data types, missing fields
3. **Re-run Discovery** - If fixes were made, re-execute to get fresh data

### Phase 3: Build Logic Hook
Create `guiv2/src/renderer/hooks/use<ModuleName>DiscoveredLogic.ts`:
- TypeScript interfaces matching CSV columns
- Papa.parse CSV loading with proper error handling
- Statistics calculations (counts, breakdowns, percentages)
- Tab management and filtering
- Export to CSV function

### Phase 4: Build Discovered View
Update `guiv2/src/renderer/views/discovered/<ModuleName>DiscoveredView.tsx`:
- 8-12 statistics cards with gradient backgrounds
- Tabs for Overview + each data type
- Overview: breakdown panels, top items with progress bars
- Data tabs: search input, VirtualizedDataGrid

### Phase 5: Build Discovery Results View
Update `guiv2/src/renderer/views/discovery/<ModuleName>DiscoveryView.tsx`:
- Import the discovered logic hook
- Show rich statistics when data exists
- Add data tabs matching discovered view
- Auto-reload after discovery completes

### Phase 6: Deploy & Test
```powershell
# Stop existing app
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Copy files to deployment
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\hooks\use<Module>DiscoveredLogic.ts' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\hooks\' -Force
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\views\discovered\<Module>DiscoveredView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovered\' -Force
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\<Module>DiscoveryView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovery\' -Force

# Clean and rebuild
cd C:\enterprisediscovery\guiv2
if (Test-Path .webpack) { Remove-Item -Recurse -Force .webpack }
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# Launch app (30s timeout)
npm start 2>&1 | Select-Object -First 50
```

## Statistics Card Colors (Gradient Reference)
Row 1: `from-blue-500 to-blue-600`, `from-purple-500 to-purple-600`, `from-indigo-500 to-indigo-600`, `from-green-500 to-green-600`
Row 2: `from-yellow-500 to-yellow-600`, `from-cyan-500 to-cyan-600`, `from-orange-500 to-orange-600`, `from-pink-500 to-pink-600`

## Icon Reference (lucide-react)
- Users: `Users`, `UserCheck`, `UserX`, `UserPlus`
- Groups: `FolderTree`, `Shield`, `Cloud`, `Building2`
- Devices: `Server`, `HardDrive`, `Monitor`, `Laptop`
- Security: `Shield`, `Lock`, `Key`, `ShieldCheck`
- Network: `Network`, `Globe`, `Wifi`, `Router`
- Cloud: `Cloud`, `CloudCog`, `Database`, `Layers`

## Template Files
- Logic hook template: `guiv2/src/renderer/hooks/useLicensingDiscoveredLogic.ts`
- Discovered view template: `guiv2/src/renderer/views/discovered/LicensingDiscoveredView.tsx`
- Discovery view template: `guiv2/src/renderer/views/discovery/EntraIDM365DiscoveryView.tsx`
