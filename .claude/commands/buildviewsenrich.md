# BuildViewsEnrich - Enhanced Discovery Analysis & View Builder

Advanced discovery workflow that analyzes PowerShell modules, maximizes resilience, enhances data collection, **assesses migration readiness**, builds rich views, and maps discovered data to organizational structure.

**Core Principle**: Discovery data feeds the **Migration Control Plane** - the system that plans, orchestrates, and executes tenant-to-tenant migrations. Every module must collect sufficient data for migration planning.

## Usage

Simply say: **"buildviewsenrich"** or **"/buildviewsenrich"** then provide the module name.

Examples:
- "buildviewsenrich EntraIDApp"
- "buildviewsenrich AzureResource"
- "/buildviewsenrich Intune - analyze and enhance the module"

## What This Agent Does

This is a comprehensive, multi-phase workflow that takes discovery to the next level.

---

## Phase 1: Analysis & Enhancement (PLAN MODE)

### 1. Identify Target Module
- Ask user which discovery module to enhance (e.g., "EntraIDApp", "AzureResource", "Intune")
- Confirm module exists in `D:\Scripts\UserMandA-1\Modules\Discovery\<ModuleName>Discovery.psm1`

### 2. Deep Module Analysis
Use **EnterPlanMode** to thoroughly analyze the PowerShell module:

**Current State Assessment:**
- What commands/cmdlets are being used?
- What data is currently being collected?
- What CSV files are being generated?
- What error handling exists?
- What progress indicators are shown?
- What prerequisites are checked?

**Enhancement Opportunities:**
- Missing error handling (try-catch blocks)
- Missing retry logic for transient failures
- Additional data that could be collected
- Performance optimizations (parallel processing, batching)
- UX improvements (better progress messages, time estimates)
- Data quality checks (completeness validation)

**Resilience Improvements:**
- Add try-catch blocks around risky operations
- Implement retry with exponential backoff for API calls
- Validate prerequisites (modules, permissions, connectivity)
- Graceful degradation (partial data collection if some fails)
- Better error messages with actionable guidance

**Data Collection Enhancements:**
- Identify additional properties/relationships
- Add metadata (timestamps, source info, session IDs)
- Collect related entities (owners, dependencies, relationships)
- Add computed fields (status, health, compliance)
- Improve CSV structure (consistent naming, data types)

### 3. Present Enhancement Plan
Show the user:
- **Current Module Analysis**: What it does, what data it collects
- **Proposed Enhancements**: Specific improvements to make
- **New Data Fields**: Additional data that will be collected
- **Expected Impact**: Better resilience, richer data, better UX
- Get user approval to proceed

---

## Phase 2: Deployment & Testing

### 4. Implement Enhancements
- Apply all approved changes to the PowerShell module
- Add comprehensive error handling
- Implement resilience patterns
- Enhance data collection
- Improve progress indicators

### 5. Module Comparison & Deployment
Compare source vs. deployment module:
```powershell
# Show diff between source and deployment
$source = Get-Content "D:\Scripts\UserMandA-1\Modules\Discovery\<ModuleName>Discovery.psm1"
$deployment = Get-Content "C:\enterprisediscovery\Modules\Discovery\<ModuleName>Discovery.psm1"
Compare-Object $source $deployment
```

**IF module has changed:**
- Copy enhanced module to `C:\enterprisediscovery\Modules\Discovery\`
- Show summary of what changed (additions, improvements, fixes)
- **REBUILD AND LAUNCH THE APP** (CRITICAL - always do this after module changes):
  ```powershell
  # Stop Electron
  Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force

  # Clean webpack
  cd C:\enterprisediscovery\guiv2
  if (Test-Path .webpack) { Remove-Item -Recurse -Force .webpack }

  # Full rebuild (main + preload + renderer)
  npm run build:main
  npx webpack --config webpack.preload.config.js --mode=production
  npm run build:renderer

  # Launch app with 30s timeout
  npm start 2>&1 | Select-Object -First 50
  ```
- Provide the exact PowerShell command for user to run
- Ask user to run discovery and provide console output

**IF module has NOT changed:**
- Inform user - no module changes needed
- Ask if they want to proceed with view building anyway

### 6. User Runs Discovery & Provides Feedback
**Provide exact command:**
```powershell
# Example for EntraIDApp
Invoke-Discovery -ModuleName "EntraIDApp" -ProfileName "ljpops"
```

**Wait for user to provide:**
- Console output (full text)
- Screenshot (if available)
- Feedback: "better" / "worse" / specific issues

### 7. Analyze Discovery Results
**Check console output for:**
- Errors or warnings
- Record counts
- Execution time
- Progress indicators working
- Any unexpected behavior

**Check CSV files generated:**
```powershell
Get-ChildItem "C:\DiscoveryData\<profile>\Raw\*<ModuleName>*.csv" | Select-Object Name, Length, LastWriteTime
```

**Read CSV structure:**
```powershell
Get-Content "C:\DiscoveryData\<profile>\Raw\<filename>.csv" -TotalCount 3
```

**Evaluate quality:**
- Are all expected CSVs generated?
- Are new data fields present?
- Is data complete (no excessive nulls)?
- Are error rates acceptable?

**Decision:**
- ✅ **SUCCESS**: Proceed to Phase 2.5 (Migration Assessment)
- ⚠️ **ISSUES FOUND**: Iterate - go back to Phase 1, fix issues, re-test
- ❌ **WORSE**: Rollback module, discuss with user

---

## Phase 2.5: Migration Readiness Assessment (CRITICAL CHECKPOINT)

### 8. Evaluate Data Completeness for Migration

**THE PRINCIPLE**: Discovery data powers not just dashboards, but the **Migration Control Plane** - the system that plans, orchestrates, and executes migrations between tenants/environments. Incomplete data = incomplete migration planning = migration failures.

Before building views, evaluate whether the module collects sufficient data for its migration use case.

**Ask the Migration Question:**
> "Is this module collecting enough information tenant-wide to make an informed decision to prepare moving [SERVICE] from one Azure tenant to another?"

**For each module type, assess against these migration requirements:**

| Service | Critical Migration Data | Nice-to-Have |
|---------|------------------------|--------------|
| **SharePoint** | Sites, Lists, Permissions, Content Types, Site Admins, External Sharing, Hub Sites | Workflows, Custom Solutions, Retention Policies |
| **Exchange** | Mailboxes, Distribution Lists, Mail Flow Rules, Connectors, DNS/MX/SPF/DKIM | Journal Rules, Retention Tags, eDiscovery Holds |
| **EntraID** | Users, Groups, App Registrations, Service Principals, Conditional Access | PIM Roles, Access Reviews, Entitlement Management |
| **Intune** | Device Configs, Compliance Policies, Apps, Autopilot Profiles | Scripts, Proactive Remediation, Feature Updates |
| **Azure Resources** | Subscriptions, Resource Groups, VMs, Storage, Networks, Key Vaults | Policy Assignments, Blueprints, Cost Data |
| **Teams** | Teams, Channels, Membership, Apps, Policies | Private Channels, Shared Channels, Call Queues |
| **Power Platform** | Environments, Apps, Flows, Connectors, DLP Policies | Solutions, AI Models, Portals |

### 9. Generate Migration Coverage Report

**Calculate Migration Readiness Score:**
```
Migration Readiness = (Collected Data Points / Required Data Points) × 100%
```

**Report Format:**
```
┌─────────────────────────────────────────────────────────────┐
│                  MIGRATION READINESS ASSESSMENT             │
│                     [Module Name] Discovery                 │
├─────────────────────────────────────────────────────────────┤
│ Migration Readiness Score: [XX]%                            │
├─────────────────────────────────────────────────────────────┤
│ ✅ COLLECTED (feeds migration control plane):               │
│    • [Data Type 1] - [count] records                        │
│    • [Data Type 2] - [count] records                        │
│    • [Data Type 3] - [count] records                        │
├─────────────────────────────────────────────────────────────┤
│ ❌ NOT COLLECTED (migration gaps):                          │
│    • [Missing Data 1] - Required for [reason]               │
│    • [Missing Data 2] - Required for [reason]               │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ PARTIALLY COLLECTED:                                     │
│    • [Data Type] - has [X] but missing [Y]                  │
├─────────────────────────────────────────────────────────────┤
│ RECOMMENDATION:                                             │
│ [Proceed / Enhance module first / Critical gaps to address] │
└─────────────────────────────────────────────────────────────┘
```

### 10. Decision Gate - Enhance or Proceed

**Present to user:**
1. Migration Readiness Score
2. What data IS being collected
3. What data is MISSING for migration
4. Recommendation (with reasoning)

**User decides:**
- ✅ **Score ≥ 70% + User Approves**: Proceed to Phase 3 (View Building)
- ⚠️ **Score < 70% OR Critical Gaps**: Go back to Phase 1, enhance module with missing data
- 🔄 **User Chooses to Proceed Anyway**: Document gaps and proceed (user accepts risk)

**Why This Matters:**
- Discovery data → Information → Decisions → Migration Plans → Execution
- Missing data now = manual work later = migration delays/failures
- The Migration Control Plane needs comprehensive data to:
  - Generate accurate migration scope
  - Identify dependencies and blockers
  - Calculate effort/timeline estimates
  - Execute automated migration tasks
  - Validate post-migration state

---

## Phase 3: Rich View Building

### 11. Build Discovery Logic Hook
Create `guiv2/src/renderer/hooks/use<ModuleName>DiscoveredLogic.ts`:

**Structure:**
```typescript
// TypeScript interfaces matching ALL CSV files
interface <EntityType1> { ... }
interface <EntityType2> { ... }

// State management
const [data1, setData1] = useState<EntityType1[]>([]);
const [data2, setData2] = useState<EntityType2[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Load ALL CSV files with Papa.parse
useEffect(() => {
  const loadData = async () => {
    const [data1, data2, ...] = await Promise.all([
      loadCSV<EntityType1>(\`\${basePath}\\<Module>_File1.csv\`),
      loadCSV<EntityType2>(\`\${basePath}\\<Module>_File2.csv\`),
    ]);
    setData1(data1);
    setData2(data2);
  };
  loadData();
}, [selectedSourceProfile]);

// Calculate comprehensive statistics (12+ metrics)
const statistics = useMemo(() => {
  return {
    totalRecords: data1.length,
    // Counts, breakdowns, percentages
    // Top items, distributions
    // Status breakdowns, health metrics
    // NEW FIELDS from enhanced module!
  };
}, [data1, data2, ...]);

// Filtering based on active tab and search
const filteredData = useMemo(() => { ... }, [activeTab, searchTerm, ...]);

// Export to CSV function
const exportToCSV = () => { ... };

return { activeTab, setActiveTab, searchTerm, setSearchTerm, loading, error, statistics, filteredData, exportToCSV };
```

**Use templates:**
- `guiv2/src/renderer/hooks/useLicensingDiscoveredLogic.ts`
- `guiv2/src/renderer/hooks/useEntraIDM365DiscoveredLogic.ts`
- `guiv2/src/renderer/hooks/useEntraIDAppDiscoveredLogic.ts`

### 12. Build/Update Discovered View
Update `guiv2/src/renderer/views/discovered/<ModuleName>DiscoveredView.tsx`:

**NEW LAYOUT PATTERN (Intune-style):**

All enriched views MUST use the Intune-style layout with tabs at the top, maximizing screen real estate for data grids.

**Layout Structure:**
```tsx
<div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
  {/* 1. Header (flex-shrink-0) */}
  <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
        <ModuleIcon size={28} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{summary}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button onClick={refresh} variant="secondary" icon={<RefreshCw />}>Refresh</Button>
      {activeTab !== 'overview' && <Button onClick={exportCSV} icon={<Download />}>Export CSV</Button>}
    </div>
  </div>

  {/* 2. Error Display (optional, if error exists) */}
  {error && (
    <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <span className="text-red-800 dark:text-red-200">{error}</span>
    </div>
  )}

  {/* 3. Tabs - IMMEDIATELY AFTER HEADER (flex-shrink-0) */}
  <div className="px-6 pt-4 flex-shrink-0">
    <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === tab.id
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  </div>

  {/* 4. Search Bar (only for data tabs, NOT overview) - (flex-shrink-0) */}
  {activeTab !== 'overview' && (
    <div className="px-6 py-4 flex-shrink-0">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search..." className="pl-10" />
      </div>
    </div>
  )}

  {/* 5. Content Area (flex-1 overflow-y-auto min-h-0) */}
  <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
    {/* Overview Tab */}
    {activeTab === 'overview' && (
      <div className="space-y-6 pt-4">
        {/* Statistics Cards - Row 1 */}
        <div className="grid grid-cols-4 gap-4">
          <DiscoverySuccessCard percentage={stats.discoverySuccessPercentage} received={stats.dataSourcesReceivedCount} total={stats.dataSourcesTotal} showAnimation={true} />
          <StatCard ... />
          <StatCard ... />
          <StatCard ... />
        </div>
        {/* Row 2, Row 3 */}

        {/* Breakdown Panels (2×2 grid) */}
        <div className="grid grid-cols-2 gap-6">
          <BreakdownPanel ... />
          <BreakdownPanel ... />
          <BreakdownPanel ... />
          <BreakdownPanel ... />
        </div>
      </div>
    )}

    {/* Data Tabs - Use calc height for VirtualizedDataGrid */}
    {activeTab === 'devices' && (
      <div className="h-[calc(100vh-320px)]">
        <VirtualizedDataGrid data={devices} columns={deviceColumns} />
      </div>
    )}
  </div>
</div>
```

**CRITICAL LAYOUT PRINCIPLES:**

1. **Tabs at Top** (NOT bottom) - Immediately after header, before content
2. **No Search on Overview** - Search bar only appears for data tabs
3. **Overview = Stats + Panels** - Statistics cards in 3×4 grid, then breakdown panels in 2×2 grid
4. **Data Tabs = Maximum Grid Space** - Use `h-[calc(100vh-320px)]` for VirtualizedDataGrid container
5. **Scrolling Pattern** - Content area uses `flex-1 overflow-y-auto min-h-0`, headers/tabs use `flex-shrink-0`

**MANDATORY: Discovery Success % Card (FIRST card in statistics grid):**

Use the standardized DiscoverySuccessCard component:

```typescript
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

// In logic hook statistics:
discoverySuccessPercentage: (() => {
  const expectedSources = [
    { name: 'PrimaryData1', hasData: data1.length > 0, weight: 20 },
    { name: 'PrimaryData2', hasData: data2.length > 0, weight: 15 },
    // ... weighted by importance (total = 100)
  ];
  const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
  const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
  return Math.round((achievedWeight / totalWeight) * 100);
})(),
dataSourcesReceivedCount: expectedSources.filter(s => s.hasData).length,
dataSourcesTotal: expectedSources.length,

// In view JSX:
<DiscoverySuccessCard
  percentage={statistics.discoverySuccessPercentage}
  received={statistics.dataSourcesReceivedCount}
  total={statistics.dataSourcesTotal}
  showAnimation={true}
/>
```

**12 Statistics Cards (3 rows × 4 columns):**
```typescript
// Row 1: Discovery Success FIRST, then primary metrics
<DiscoverySuccessCard ... />
<StatCard ... gradient="from-sky-500 to-sky-600" />
<StatCard ... gradient="from-green-500 to-green-600" />
<StatCard ... gradient="from-purple-500 to-purple-600" />

// Row 2: Status/health metrics
<StatCard ... gradient="from-indigo-500 to-indigo-600" />
<StatCard ... gradient="from-cyan-500 to-cyan-600" />
<StatCard ... gradient="from-emerald-500 to-emerald-600" />
<StatCard ... gradient="from-orange-500 to-orange-600" />

// Row 3: Advanced/computed metrics
<StatCard ... gradient="from-rose-500 to-rose-600" />
<StatCard ... gradient="from-violet-500 to-violet-600" />
<StatCard ... gradient="from-teal-500 to-teal-600" />
<StatCard ... gradient="from-pink-500 to-pink-600" />
```

**Breakdown Panels (2×2 grid in Overview tab):**
```typescript
<div className="grid grid-cols-2 gap-6">
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### 13. Update Discovery View Results
Update `guiv2/src/renderer/views/discovery/<ModuleName>DiscoveryView.tsx`:

**Import logic hook:**
```typescript
import { use<ModuleName>DiscoveredLogic } from '../../hooks/use<ModuleName>DiscoveredLogic';
```

**Use in component:**
```typescript
const { statistics, filteredData, activeTab, setActiveTab, ... } = use<ModuleName>DiscoveredLogic();
```

**Show rich results after discovery:**
- Replace simple "X records discovered" with statistics cards
- Add tabs for each data type
- Show VirtualizedDataGrid for each tab
- Auto-reload when discovery completes

### 14. Deploy & Test Views
```powershell
# Stop Electron
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Copy files to deployment
Copy-Item -Path 'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\use<ModuleName>DiscoveredLogic.ts' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\hooks\' -Force
Copy-Item -Path 'D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovered\<ModuleName>DiscoveredView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovered\' -Force
Copy-Item -Path 'D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovery\<ModuleName>DiscoveryView.tsx' -Destination 'C:\enterprisediscovery\guiv2\src\renderer\views\discovery\' -Force

# Clean and full rebuild
cd C:\enterprisediscovery\guiv2
if (Test-Path .webpack) { Remove-Item -Recurse -Force .webpack }
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# Launch app with 30s timeout
npm start 2>&1 | Select-Object -First 50
```

**Ask user to test:**
- Navigate to discovered view
- Check all statistics cards
- Test all tabs
- Verify data grids load
- Try search and export
- Provide feedback on UI/UX

---

## Phase 4: Organizational Mapping

### 15. Analyze Data-to-Organization Relationships

**Think about entity mapping:**

| Discovery Data | Organization Map Entity | Matching Strategy | Key Attributes |
|----------------|-------------------------|-------------------|----------------|
| Applications (EntraID) | Application nodes | AppId, DisplayName | Owner, permissions, secrets |
| VMs (Azure) | Infrastructure/Server | ResourceId, VM name | Size, OS, location, tags |
| Users (EntraID) | Identity/User nodes | UPN, ObjectId | Licenses, groups, sign-ins |
| Storage (Azure) | Storage nodes | ResourceId | Size, type, access tier |
| Databases (SQL) | Database nodes | Server+DB name | Size, version, backup status |
| Networks (Azure) | Network nodes | VNet ID | Address space, subnets |
| Groups (EntraID) | Group nodes | ObjectId, DisplayName | Members, type, owners |

**Consider Sankey diagram for:**
- Data flow visualization
- Relationship mapping
- Dependency chains
- Access patterns

### 16. Design Data Mapping Strategy

**CSV-to-Map Linking Approach:**

1. **Entity Identification**
   - Which CSV fields uniquely identify map entities?
   - Primary: IDs (ObjectId, ResourceId, AppId)
   - Secondary: Names (DisplayName, ResourceName)
   - Tertiary: Combinations (Server+Database, Tenant+User)

2. **Matching Algorithms**
   - Exact match (IDs)
   - Fuzzy match (names, with threshold)
   - Multi-field match (compound keys)
   - Hierarchical match (parent-child relationships)

3. **Attribute Mapping**
   - What CSV fields enrich map entities?
   - Static attributes (size, type, location)
   - Dynamic attributes (status, health, usage)
   - Metadata (discovered date, source, confidence)

4. **Relationship Mapping**
   - How to represent relationships?
   - Direct links (user → groups)
   - Indirect links (app → users via assignments)
   - Hierarchical links (VM → Resource Group → Subscription)

**Design data structure:**
```typescript
interface EntityMapping {
  csvFile: string;
  csvIdField: string;
  mapEntityType: string; // 'application', 'server', 'user', etc.
  matchingStrategy: 'exact' | 'fuzzy' | 'multi-field';
  attributeMappings: Record<string, string>; // CSV field → Map attribute
  relationships: Array<{
    relatedEntity: string;
    csvLinkField: string;
    mapLinkField: string;
  }>;
}
```

### 17. Implement Map Integration

**Create mapping logic:**

```typescript
// guiv2/src/renderer/hooks/useOrganizationMapping.ts

export function useOrganizationMapping() {
  const loadMappings = async () => {
    // Read relevant CSV files
    const csvData = await loadCSVsForMapping();

    // Match CSV records to map entities
    const mappings = matchCSVToMapEntities(csvData);

    // Enrich map entities with CSV data
    const enrichedMap = enrichMapWithCSVData(mappings);

    // Create relationships/links
    const linkedMap = createEntityRelationships(enrichedMap);

    return linkedMap;
  };

  return { loadMappings };
}
```

**Add UI indicators:**
- Badge on map nodes showing "Data linked" with CSV icon
- Tooltip showing discovered data summary
- Click to drill down to full CSV details
- Color coding based on data freshness/quality

**Enable drill-down:**
- From map node → Discovered view (filtered to that entity)
- Show all related CSV records
- Highlight relationships on map
- Show data lineage (how discovered, when, confidence)

### 18. Final User Feedback

**Ask user to review:**

1. **Discovery Module Enhancements**
   - Is the module more resilient?
   - Are error messages helpful?
   - Is progress feedback good?
   - Any issues or bugs?

2. **Data Extraction Quality**
   - Is all expected data collected?
   - Are new fields valuable?
   - Is data accurate?
   - Any missing data points?

3. **Discovery/Discovered Views**
   - Are statistics cards useful?
   - Is the overview tab informative?
   - Are data grids easy to use?
   - Any UI/UX improvements?

4. **Map Integration**
   - Is entity matching working correctly?
   - Are relationships clear?
   - Is drill-down useful?
   - Any missing mappings?

**Iterate based on feedback:**
- Fix any bugs or issues
- Add missing features
- Improve UX based on feedback
- Enhance data collection if gaps found

---

## Key Principles

✅ **User-Driven**: Ask for approval at key decision points, don't proceed without confirmation
✅ **Iterative**: Test after each phase, allow user to provide feedback before continuing
✅ **Comprehensive**: Cover all phases - don't skip analysis, enhancement, testing, views, or mapping
✅ **Transparent**: Show diffs, explain changes, highlight improvements with specific examples
✅ **Quality-Focused**: Maximize resilience, data richness, UX - don't compromise on quality
✅ **TodoWrite**: Use TodoWrite tool to track progress through ALL phases
✅ **Migration-Ready**: Every module must be assessed for migration readiness BEFORE building views - discovery data feeds the Migration Control Plane which plans, orchestrates, and executes tenant-to-tenant migrations

---

## Important Notes

1. **Always use EnterPlanMode** for the analysis phase - this is critical for thorough module analysis
2. **Show before/after comparisons** when modifying PowerShell modules - user needs to see what changed
3. **Wait for user to run discovery** - don't proceed until user provides console output and feedback
4. **Build views only after successful discovery test** - ensure data is good before building UI
5. **Map integration should be data-driven** - read from CSV files, don't hardcode
6. **Use TodoWrite extensively** - this is a multi-phase workflow, track progress carefully
7. **NEVER rely on robocopy alone for deployment** - robocopy compares timestamp/size and may skip modified files. Always:
   - Use explicit `Copy-Item -Force` for specific files you edited
   - Verify destination has changes: `Select-String -Path 'C:\enterprisediscovery\...\File.tsx' -Pattern 'NewComponent'`
   - If no output, the file wasn't copied - force copy it again

---

## Example Workflow

**User says:** "buildviewsenrich EntraIDApp"

**Agent responds:**
1. "I'll analyze and enhance the EntraIDApp discovery module. Entering plan mode to thoroughly analyze..."
2. [EnterPlanMode] Analyzes module, identifies enhancements
3. "Here's what I found... [shows analysis]. I propose these enhancements... [shows plan]. Approve?"
4. User: "Approved"
5. Agent implements enhancements, copies to deployment
6. "Module enhanced and deployed. Please run: `Invoke-Discovery -ModuleName 'EntraIDApp' -ProfileName 'ljpops'`"
7. User runs discovery, pastes console output
8. Agent analyzes: "Excellent! 4 CSVs generated, 1,234 records, no errors."
9. **[MIGRATION ASSESSMENT]** Agent evaluates: "Let me assess migration readiness..."
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │                  MIGRATION READINESS ASSESSMENT             │
   │                     EntraIDApp Discovery                    │
   ├─────────────────────────────────────────────────────────────┤
   │ Migration Readiness Score: 75%                              │
   ├─────────────────────────────────────────────────────────────┤
   │ ✅ COLLECTED: App Registrations, Service Principals,        │
   │    Secrets/Certificates, API Permissions, Owners            │
   ├─────────────────────────────────────────────────────────────┤
   │ ❌ NOT COLLECTED: Conditional Access targeting apps         │
   ├─────────────────────────────────────────────────────────────┤
   │ RECOMMENDATION: Proceed - score meets threshold             │
   └─────────────────────────────────────────────────────────────┘
   ```
   "Migration readiness is 75%. Proceed to view building?"
10. User: "Yes"
11. Agent builds logic hook, discovered view, discovery view
12. Agent deploys and launches app
13. "Please test the EntraIDApp discovered view and provide feedback"
14. User: "Looks great!"
15. Agent: "Now let's map this to your organization map... [analyzes mappings]"
16. Agent implements map integration
17. "Complete! EntraIDApp module is enhanced, views are rich, and data is mapped to org structure."

---

## Statistics Card Color Reference

**Row 1:** `from-blue-500 to-blue-600`, `from-green-500 to-green-600`, `from-purple-500 to-purple-600`, `from-yellow-500 to-yellow-600`

**Row 2:** `from-indigo-500 to-indigo-600`, `from-cyan-500 to-cyan-600`, `from-emerald-500 to-emerald-600`, `from-orange-500 to-orange-600`

**Row 3:** `from-rose-500 to-rose-600`, `from-violet-500 to-violet-600`, `from-teal-500 to-teal-600`, `from-pink-500 to-pink-600`

---

## Icon Reference (lucide-react)

- **Users**: `Users`, `UserCheck`, `UserX`, `UserPlus`, `UserCog`
- **Groups**: `FolderTree`, `Shield`, `Cloud`, `Building2`, `Users`
- **Devices**: `Server`, `HardDrive`, `Monitor`, `Laptop`, `Smartphone`
- **Security**: `Shield`, `Lock`, `Key`, `ShieldCheck`, `ShieldAlert`
- **Applications**: `Settings`, `AppWindow`, `Grid3x3`, `Package`
- **Cloud**: `Cloud`, `CloudCog`, `Database`, `Layers`, `Globe`
- **Network**: `Network`, `Wifi`, `Router`, `Cable`, `Radio`
- **Storage**: `HardDrive`, `Database`, `Archive`, `FolderOpen`
- **Status**: `CheckCircle2`, `XCircle`, `AlertTriangle`, `Clock`, `Activity`

---

## Template Files Reference

- **Logic Hook**: `guiv2/src/renderer/hooks/useEntraIDAppDiscoveredLogic.ts`
- **Discovered View**: `guiv2/src/renderer/views/discovered/EntraidappDiscoveredView.tsx`
- **Discovery View**: `guiv2/src/renderer/views/discovery/EntraIDAppDiscoveryView.tsx`
