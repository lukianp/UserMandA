# Build Discovery Results

Build rich discovery results views for a module after running a discovery.

## Usage

```
/build-discovery-results <ModuleName>
```

Then paste the discovery console output or describe what was discovered.

## Examples

```
/build-discovery-results AzureResource
/build-discovery-results Intune
/build-discovery-results Exchange
```

## Instructions

When invoked, follow this process:

### 1. Analyze CSV Files
Check what CSV files exist for the module:
```bash
powershell.exe -Command "Get-ChildItem 'C:\DiscoveryData\ljpops\Raw\*<ModuleName>*.csv' | Select-Object Name"
```

Read the first few lines to understand the structure:
```bash
powershell.exe -Command "Get-Content 'C:\DiscoveryData\ljpops\Raw\<filename>.csv' -TotalCount 3"
```

### 2. Create Logic Hook
Create `guiv2/src/renderer/hooks/use<ModuleName>DiscoveredLogic.ts`:
- Use `useLicensingDiscoveredLogic.ts` or `useEntraIDM365DiscoveredLogic.ts` as templates
- Load CSV files with Papa.parse
- Define TypeScript interfaces matching CSV columns
- Calculate statistics (counts, breakdowns, percentages, top items)
- Implement filtering, tab management, and export functions

### 3. Update Discovered View
Update `guiv2/src/renderer/views/discovered/<ModuleName>DiscoveredView.tsx`:
- Import the new logic hook
- Add 12 statistics cards (3 rows x 4 columns) with gradient colors:
  - Row 1: sky-500, green-500, purple-500, yellow-500
  - Row 2: indigo-500, cyan-500, emerald-500, orange-500
  - Row 3: rose-500, violet-500, teal-500, pink-500
- Add tabs: Overview + one per data type
- Overview tab: breakdown panels with icons, top items with progress bars
- Data tabs: Input search, filter buttons, VirtualizedDataGrid

### 4. Update Discovery View
Update `guiv2/src/renderer/views/discovery/<ModuleName>DiscoveryView.tsx`:
- Import the discovered logic hook
- Show rich statistics cards when data exists
- Add data type tabs to the tab bar
- Include VirtualizedDataGrid for each data tab
- Auto-reload discovered data after discovery completes

### 5. Deploy and Test
```bash
powershell.exe -Command "Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force"
powershell.exe -Command "Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\hooks\use<ModuleName>DiscoveredLogic.ts' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\hooks\' -Force"
powershell.exe -Command "Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\views\discovered\<ModuleName>DiscoveredView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovered\' -Force"
powershell.exe -Command "Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\<ModuleName>DiscoveryView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovery\' -Force"
powershell.exe -Command "cd C:\enterprisediscovery\guiv2; if (Test-Path .webpack) { Remove-Item -Recurse -Force .webpack }; npm run build:main; npx webpack --config webpack.preload.config.js --mode=production; npm run build:renderer"
powershell.exe -Command "cd C:\enterprisediscovery\guiv2; npm start 2>&1 | Select-Object -First 50"
```

### Files Created/Modified
1. `guiv2/src/renderer/hooks/use<ModuleName>DiscoveredLogic.ts` - NEW
2. `guiv2/src/renderer/views/discovered/<ModuleName>DiscoveredView.tsx` - UPDATED
3. `guiv2/src/renderer/views/discovery/<ModuleName>DiscoveryView.tsx` - UPDATED

### Icon Reference
- Users: Users, UserCheck, UserX, UserPlus
- Groups: FolderTree, Shield, Cloud
- Devices: Server, HardDrive, Monitor
- Security: Shield, Lock, Key
- Applications: Settings, AppWindow
- Cloud: Cloud, Globe, Building2
