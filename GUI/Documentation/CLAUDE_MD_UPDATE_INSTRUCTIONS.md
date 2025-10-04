# CLAUDE.md Update Instructions

## How to Update CLAUDE.md

This document contains the exact text to add to `/CLAUDE.md` to address the gaps identified in the comprehensive gap analysis.

---

## Step 1: Update the Phase Count

**Current:** Phases 0-8
**New:** Phases 0-14

---

## Step 2: Insert New Phases After Current Phase 8

Add these new phases between current Phase 8 and the "Success Criteria" section:

---

## Phase 9: Critical Discovery Views Implementation (NEW)

**Goal:** Implement the 26 missing discovery views essential for core business functionality

**Priority:** CRITICAL - These views represent the core value proposition of "M&A Discovery Suite"

### Task 9.1: Active Directory Discovery View
**Delegate to:** TypeScript_Typing_Guardian → State_Management_Specialist → React_Component_Architect

**Current Gap:** No Active Directory discovery view exists

**Step 1 - Type Definitions (TypeScript_Typing_Guardian):**
Create `guiv2/src/renderer/types/models/activeDirectory.ts`:

```typescript
/**
 * Active Directory Discovery Types
 */

export interface ADForest {
  name: string;
  rootDomain: string;
  domains: ADDomain[];
  functionalLevel: number;
  forestMode: string;
  globalCatalogs: string[];
  trusts: TrustRelationship[];
  sites: ADSite[];
  schemaMaster: string;
  domainNamingMaster: string;
}

export interface ADDomain {
  name: string;
  netbiosName: string;
  distinguishedName: string;
  domainControllers: DomainController[];
  organizationalUnits: OrganizationalUnit[];
  users: ADUser[];
  groups: ADGroup[];
  computers: ADComputer[];
  groupPolicies: GroupPolicy[];
  functionalLevel: number;
  domainMode: string;
  pdcEmulator: string;
  ridMaster: string;
  infrastructureMaster: string;
}

export interface DomainController {
  name: string;
  ipAddress: string;
  site: string;
  isGlobalCatalog: boolean;
  isReadOnly: boolean;
  operatingSystem: string;
  operatingSystemVersion: string;
  fsmoRoles: string[];
}

export interface OrganizationalUnit {
  distinguishedName: string;
  name: string;
  description?: string;
  path: string;
  children: OrganizationalUnit[];
  userCount: number;
  groupCount: number;
  computerCount: number;
  gpoLinks: string[];
  isDeleted: boolean;
  isProtected: boolean;
}

export interface ADUser {
  samAccountName: string;
  userPrincipalName: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  email?: string;
  distinguishedName: string;
  path: string;
  enabled: boolean;
  locked: boolean;
  passwordExpired: boolean;
  passwordNeverExpires: boolean;
  lastLogon?: Date;
  whenCreated: Date;
  whenChanged?: Date;
  department?: string;
  title?: string;
  manager?: string;
  memberOf: string[];
  directReports: string[];
}

export interface ADGroup {
  samAccountName: string;
  distinguishedName: string;
  name: string;
  description?: string;
  groupType: 'Security' | 'Distribution';
  groupScope: 'DomainLocal' | 'Global' | 'Universal';
  members: string[];
  memberCount: number;
  memberOf: string[];
  managedBy?: string;
  whenCreated: Date;
  whenChanged?: Date;
}

export interface ADComputer {
  samAccountName: string;
  distinguishedName: string;
  name: string;
  dnsHostName?: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  enabled: boolean;
  lastLogon?: Date;
  whenCreated: Date;
  ipAddress?: string;
  location?: string;
  description?: string;
  managedBy?: string;
}

export interface GroupPolicy {
  id: string;
  displayName: string;
  distinguishedName: string;
  gpcFileSysPath: string;
  versionDirectory: number;
  versionSysvol: number;
  whenCreated: Date;
  whenChanged?: Date;
  linkedOUs: string[];
  userConfiguration?: GPOConfiguration;
  computerConfiguration?: GPOConfiguration;
}

export interface GPOConfiguration {
  enabled: boolean;
  policies: GPOPolicy[];
}

export interface GPOPolicy {
  name: string;
  value: any;
  type: string;
}

export interface TrustRelationship {
  sourceDomain: string;
  targetDomain: string;
  trustType: 'ParentChild' | 'External' | 'Forest' | 'Realm' | 'TreeRoot';
  trustDirection: 'Inbound' | 'Outbound' | 'Bidirectional';
  trustAttributes: string[];
  isTransitive: boolean;
  whenCreated: Date;
  whenChanged?: Date;
}

export interface ADSite {
  name: string;
  description?: string;
  subnets: string[];
  siteLinks: string[];
  domainControllers: string[];
}

export interface ADDiscoveryConfig {
  forestName?: string;
  domainNames?: string[];
  credentials?: CredentialReference;
  includeOUs: boolean;
  includeGPOs: boolean;
  includeTrusts: boolean;
  includeUsers: boolean;
  includeGroups: boolean;
  includeComputers: boolean;
  includeSites: boolean;
  maxDepth: number; // -1 for unlimited
  filter?: string;
  scope?: 'Forest' | 'Domain' | 'OU';
  ouPath?: string;
}

export interface ADDiscoveryResult {
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  forests: ADForest[];
  totalUsers: number;
  totalGroups: number;
  totalComputers: number;
  totalOUs: number;
  totalGPOs: number;
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];
}
```

**Step 2 - Logic Hook (State_Management_Specialist):**
Create `guiv2/src/renderer/hooks/useActiveDirectoryDiscoveryLogic.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  ADForest,
  ADDiscoveryConfig,
  ADDiscoveryResult,
  OrganizationalUnit,
  ADUser,
  ADGroup,
  ADComputer
} from '../types/models/activeDirectory';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export const useActiveDirectoryDiscoveryLogic = () => {
  // State
  const [forests, setForests] = useState<ADForest[]>([]);
  const [selectedForest, setSelectedForest] = useState<ADForest | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedOU, setSelectedOU] = useState<OrganizationalUnit | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState({
    current: 0,
    total: 100,
    message: 'Initializing...',
  });
  const [discoveryConfig, setDiscoveryConfig] = useState<ADDiscoveryConfig>({
    includeOUs: true,
    includeGPOs: true,
    includeTrusts: true,
    includeUsers: true,
    includeGroups: true,
    includeComputers: true,
    includeSites: true,
    maxDepth: -1,
    scope: 'Forest',
  });
  const [results, setResults] = useState<ADDiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Zustand store
  const { addDiscoveryRun, updateDiscoveryRun } = useDiscoveryStore();

  // Load saved results from previous discoveries
  useEffect(() => {
    loadSavedResults();
  }, []);

  const loadSavedResults = async () => {
    try {
      const history = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/DiscoveryManager.psm1',
        functionName: 'Get-DiscoveryHistory',
        parameters: { type: 'ActiveDirectory' },
      });

      if (history.data?.results) {
        setResults(history.data.results[0]); // Load most recent
        if (history.data.results[0]?.forests) {
          setForests(history.data.results[0].forests);
        }
      }
    } catch (err) {
      console.error('Failed to load saved results:', err);
    }
  };

  // Progress listener
  useEffect(() => {
    const unsubscribe = window.electronAPI.onProgress((data) => {
      if (data.source === 'ad-discovery') {
        setDiscoveryProgress({
          current: data.current,
          total: data.total,
          message: data.message,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    setIsDiscovering(true);
    setError(null);
    setDiscoveryProgress({ current: 0, total: 100, message: 'Starting discovery...' });

    const runId = `ad-discovery-${Date.now()}`;

    addDiscoveryRun({
      id: runId,
      type: 'ActiveDirectory',
      status: 'running',
      startTime: new Date(),
      config: discoveryConfig,
    });

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Invoke-ADForestDiscovery',
        parameters: {
          ...discoveryConfig,
          streamProgress: true,
        },
      });

      if (result.success) {
        const discoveryResult: ADDiscoveryResult = {
          configId: runId,
          startTime: new Date(),
          endTime: new Date(),
          status: 'completed',
          forests: result.data.forests || [],
          totalUsers: result.data.totalUsers || 0,
          totalGroups: result.data.totalGroups || 0,
          totalComputers: result.data.totalComputers || 0,
          totalOUs: result.data.totalOUs || 0,
          totalGPOs: result.data.totalGPOs || 0,
          errors: result.data.errors || [],
          warnings: result.data.warnings || [],
        };

        setResults(discoveryResult);
        setForests(discoveryResult.forests);

        updateDiscoveryRun(runId, {
          status: 'completed',
          endTime: new Date(),
          results: discoveryResult,
        });

        // Save results to file
        await window.electronAPI.writeFile(
          `C:\\discoverydata\\AD\\${runId}.json`,
          JSON.stringify(discoveryResult, null, 2)
        );
      } else {
        throw new Error(result.error || 'Discovery failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      updateDiscoveryRun(runId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
      });
    } finally {
      setIsDiscovering(false);
      setDiscoveryProgress({ current: 100, total: 100, message: 'Complete' });
    }
  }, [discoveryConfig, addDiscoveryRun, updateDiscoveryRun]);

  // Cancel discovery
  const cancelDiscovery = useCallback(async () => {
    try {
      await window.electronAPI.cancelExecution('current'); // This needs token tracking
      setIsDiscovering(false);
      setDiscoveryProgress({ current: 0, total: 100, message: 'Cancelled' });
    } catch (err) {
      console.error('Failed to cancel discovery:', err);
    }
  }, []);

  // Export results
  const exportResults = useCallback(async (format: 'csv' | 'json' | 'xml' | 'excel') => {
    if (!results) return;

    try {
      const exportResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/DataExporter.psm1',
        functionName: 'Export-DiscoveryData',
        parameters: {
          data: results,
          format,
          outputPath: `C:\\discoverydata\\Exports\\AD_Export_${Date.now()}.${format}`,
        },
      });

      if (exportResult.success) {
        // Show success notification
        console.log('Export completed:', exportResult.data.path);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [results]);

  // Get users by OU
  const getUsersByOU = useCallback((ouPath: string): ADUser[] => {
    if (!results) return [];

    // Filter users by OU path
    return results.forests
      .flatMap(f => f.domains)
      .flatMap(d => d.users)
      .filter(u => u.path.startsWith(ouPath));
  }, [results]);

  // Get groups by OU
  const getGroupsByOU = useCallback((ouPath: string): ADGroup[] => {
    if (!results) return [];

    return results.forests
      .flatMap(f => f.domains)
      .flatMap(d => d.groups)
      .filter(g => g.distinguishedName.includes(ouPath));
  }, [results]);

  // Schedule discovery
  const scheduleDiscovery = useCallback(async (schedule: string) => {
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Scheduler/TaskScheduler.psm1',
        functionName: 'New-ScheduledDiscovery',
        parameters: {
          type: 'ActiveDirectory',
          config: discoveryConfig,
          schedule, // Cron expression
        },
      });
    } catch (err) {
      console.error('Failed to schedule discovery:', err);
    }
  }, [discoveryConfig]);

  return {
    // State
    forests,
    selectedForest,
    setSelectedForest,
    selectedDomain,
    setSelectedDomain,
    selectedOU,
    setSelectedOU,
    isDiscovering,
    discoveryProgress,
    discoveryConfig,
    setDiscoveryConfig,
    results,
    error,

    // Actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    scheduleDiscovery,
    getUsersByOU,
    getGroupsByOU,
  };
};
```

**Step 3 - View Component (React_Component_Architect):**
Create `guiv2/src/renderer/views/discovery/ActiveDirectoryDiscoveryView.tsx`:

```typescript
import React, { useState } from 'react';
import { useActiveDirectoryDiscoveryLogic } from '../../hooks/useActiveDirectoryDiscoveryLogic';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import ProgressBar from '../../components/molecules/ProgressBar';
import { Play, Square, Download, Calendar, RefreshCw } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

const ActiveDirectoryDiscoveryView: React.FC = () => {
  const {
    forests,
    selectedForest,
    setSelectedForest,
    isDiscovering,
    discoveryProgress,
    discoveryConfig,
    setDiscoveryConfig,
    results,
    error,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    scheduleDiscovery,
  } = useActiveDirectoryDiscoveryLogic();

  const [activeTab, setActiveTab] = useState<'config' | 'results' | 'ous' | 'gpos'>('config');

  // Column definitions for different data types
  const userColumns: ColDef[] = [
    { field: 'samAccountName', headerName: 'Username', sortable: true, filter: true },
    { field: 'displayName', headerName: 'Display Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    { field: 'enabled', headerName: 'Enabled', sortable: true, filter: true },
    { field: 'lastLogon', headerName: 'Last Logon', sortable: true, filter: 'agDateColumnFilter' },
    { field: 'department', headerName: 'Department', sortable: true, filter: true },
  ];

  const groupColumns: ColDef[] = [
    { field: 'name', headerName: 'Group Name', sortable: true, filter: true },
    { field: 'groupType', headerName: 'Type', sortable: true, filter: true },
    { field: 'groupScope', headerName: 'Scope', sortable: true, filter: true },
    { field: 'memberCount', headerName: 'Members', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'description', headerName: 'Description', sortable: true, filter: true },
  ];

  const computerColumns: ColDef[] = [
    { field: 'name', headerName: 'Computer Name', sortable: true, filter: true },
    { field: 'operatingSystem', headerName: 'OS', sortable: true, filter: true },
    { field: 'enabled', headerName: 'Enabled', sortable: true, filter: true },
    { field: 'lastLogon', headerName: 'Last Logon', sortable: true, filter: 'agDateColumnFilter' },
    { field: 'ipAddress', headerName: 'IP Address', sortable: true, filter: true },
  ];

  // Get current data based on active tab
  const getCurrentData = () => {
    if (!results) return [];

    switch (activeTab) {
      case 'results':
        return results.forests.flatMap(f => f.domains.flatMap(d => d.users));
      case 'ous':
        return results.forests.flatMap(f => f.domains.flatMap(d => d.organizationalUnits));
      case 'gpos':
        return results.forests.flatMap(f => f.domains.flatMap(d => d.groupPolicies));
      default:
        return [];
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="ad-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Active Directory Discovery
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Discover and analyze Active Directory forests, domains, OUs, users, groups, and GPOs
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startDiscovery}
              disabled={isDiscovering}
              icon={<Play className="w-4 h-4" />}
              data-cy="start-discovery-btn"
            >
              {isDiscovering ? 'Discovering...' : 'Start Discovery'}
            </Button>
            {isDiscovering && (
              <Button
                onClick={cancelDiscovery}
                variant="danger"
                icon={<Square className="w-4 h-4" />}
                data-cy="cancel-discovery-btn"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => exportResults('excel')}
              disabled={!results}
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              data-cy="export-btn"
            >
              Export
            </Button>
            <Button
              onClick={() => scheduleDiscovery('0 0 * * *')} // Daily at midnight
              variant="secondary"
              icon={<Calendar className="w-4 h-4" />}
              data-cy="schedule-btn"
            >
              Schedule
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isDiscovering && (
          <div className="mt-4">
            <ProgressBar
              current={discoveryProgress.current}
              total={discoveryProgress.total}
              label={discoveryProgress.message}
              showPercentage
              data-cy="discovery-progress"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 p-4">
          {['config', 'results', 'ous', 'gpos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-cy={`tab-${tab}`}
            >
              {tab === 'config' && 'Configuration'}
              {tab === 'results' && `Users (${results?.totalUsers || 0})`}
              {tab === 'ous' && `Organizational Units (${results?.totalOUs || 0})`}
              {tab === 'gpos' && `Group Policies (${results?.totalGPOs || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'config' && (
          <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Discovery Scope
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scope
                  </label>
                  <select
                    value={discoveryConfig.scope}
                    onChange={(e) => setDiscoveryConfig({
                      ...discoveryConfig,
                      scope: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    data-cy="scope-select"
                  >
                    <option value="Forest">Entire Forest</option>
                    <option value="Domain">Specific Domain</option>
                    <option value="OU">Specific OU</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Depth
                  </label>
                  <Input
                    type="number"
                    value={discoveryConfig.maxDepth}
                    onChange={(e) => setDiscoveryConfig({
                      ...discoveryConfig,
                      maxDepth: parseInt(e.target.value)
                    })}
                    placeholder="-1 for unlimited"
                    data-cy="max-depth-input"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Discovery Options
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Checkbox
                  checked={discoveryConfig.includeUsers}
                  onChange={(checked) => setDiscoveryConfig({
                    ...discoveryConfig,
                    includeUsers: checked
                  })}
                  label="Include Users"
                  data-cy="include-users-cb"
                />
                <Checkbox
                  checked={discoveryConfig.includeGroups}
                  onChange={(checked) => setDiscoveryConfig({
                    ...discoveryConfig,
                    includeGroups: checked
                  })}
                  label="Include Groups"
                  data-cy="include-groups-cb"
                />
                <Checkbox
                  checked={discoveryConfig.includeComputers}
                  onChange={(checked) => setDiscoveryConfig({
                    ...discoveryConfig,
                    includeComputers: checked
                  })}
                  label="Include Computers"
                  data-cy="include-computers-cb"
                />
                <Checkbox
                  checked={discoveryConfig.includeOUs}
                  onChange={(checked) => setDiscoveryConfig({
                    ...discoveryConfig,
                    includeOUs: checked
                  })}
                  label="Include OUs"
                  data-cy="include-ous-cb"
                />
                <Checkbox
                  checked={discoveryConfig.includeGPOs}
                  onChange={(checked) => setDiscoveryConfig({
                    ...discoveryConfig,
                    includeGPOs: checked
                  })}
                  label="Include GPOs"
                  data-cy="include-gpos-cb"
                />
                <Checkbox
                  checked={discoveryConfig.includeTrusts}
                  onChange={(checked) => setDiscoveryConfig({
                    ...discoveryConfig,
                    includeTrusts: checked
                  })}
                  label="Include Trusts"
                  data-cy="include-trusts-cb"
                />
                <Checkbox
                  checked={discoveryConfig.includeSites}
                  onChange={(checked) => setDiscoveryConfig({
                    ...discoveryConfig,
                    includeSites: checked
                  })}
                  label="Include Sites"
                  data-cy="include-sites-cb"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'config' && (
          <div className="h-full p-6">
            <VirtualizedDataGrid
              data={getCurrentData()}
              columns={activeTab === 'results' ? userColumns : activeTab === 'ous' ? [] : groupColumns}
              loading={isDiscovering}
              enableExport
              enableColumnReorder
              enableGrouping
              data-cy="discovery-results-grid"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveDirectoryDiscoveryView;
```

**Step 4 - Route Registration:**
Add to `guiv2/src/renderer/App.tsx`:

```typescript
const ActiveDirectoryDiscoveryView = lazy(() => import('./views/discovery/ActiveDirectoryDiscoveryView'));

// In Routes:
<Route path="/discovery/active-directory" element={<ActiveDirectoryDiscoveryView />} />
```

**Acceptance Criteria:**
- ✅ Can discover complete AD forest structure
- ✅ Supports all discovery options (users, groups, computers, OUs, GPOs, trusts)
- ✅ Real-time progress tracking
- ✅ Cancellation works
- ✅ Export to multiple formats
- ✅ Scheduling capability
- ✅ Results persist across sessions
- ✅ Full keyboard navigation
- ✅ Accessibility compliant

---

### Task 9.2: Application Discovery View
**Delegate to:** React_Component_Architect

**Current Gap:** No application inventory discovery

**Implementation:** Follow the same pattern as Task 9.1:
1. Create type definitions in `types/models/applicationDiscovery.ts`
2. Create logic hook in `hooks/useApplicationDiscoveryLogic.ts`
3. Create view component in `views/discovery/ApplicationDiscoveryView.tsx`
4. Register route

**Features Required:**
- Installed software discovery
- Running processes discovery
- Services discovery
- Registry scanning
- File system scanning
- Network port scanning
- Application dependencies
- License detection
- Version tracking
- Update status

---

### Task 9.3: Infrastructure Discovery Hub
**Delegate to:** React_Component_Architect

**Required Implementation:**
Create `guiv2/src/renderer/views/discovery/DiscoveryHubView.tsx`

This is the main discovery dashboard that provides access to all discovery modules.

**Features:**
- Grid of discovery module tiles
- Quick launch for each module
- Discovery history timeline
- Scheduled discoveries calendar
- Active discovery monitoring

---

### Tasks 9.4-9.26: Remaining Discovery Views

Implement using the same three-step pattern (Types → Logic → View):

4. AWSCloudInfrastructureDiscoveryView
5. AzureInfrastructureDiscoveryView
6. ConditionalAccessPoliciesDiscoveryView
7. DataLossPreventionDiscoveryView
8. ExchangeDiscoveryView
9. FileServerDiscoveryView
10. GoogleWorkspaceDiscoveryView
11. HyperVDiscoveryView
12. IdentityGovernanceDiscoveryView
13. IntuneDiscoveryView
14. LicensingDiscoveryView
15. NetworkInfrastructureDiscoveryView
16. Office365DiscoveryView
17. OneDriveBusinessDiscoveryView
18. PowerPlatformDiscoveryView
19. SecurityInfrastructureDiscoveryView
20. SharePointDiscoveryView
21. SQLServerDiscoveryView
22. MicrosoftTeamsDiscoveryView
23. VMwareDiscoveryView
24. WebServerConfigurationDiscoveryView
25. PhysicalServerDiscoveryView
26. EnvironmentDetectionView

---

## Phase 10: Migration Services & Orchestration (NEW)

**Goal:** Implement complete migration orchestration engine

### Task 10.1: Migration Orchestration Service
**Delegate to:** ElectronMain_Process_Specialist

**Current Gap:** Only basic migration store exists; no orchestration engine

**Required Implementation:**
Create `guiv2/src/main/services/migrationOrchestrationService.ts`

(See COMPREHENSIVE_GAP_ANALYSIS.md Section A.2.1 for full implementation details)

---

### Task 10.2: Migration Wave Orchestrator
(See gap analysis for details)

---

### Task 10.3: Migration State Service
(See gap analysis for details)

---

[Continue with all migration services...]

---

## Phase 11: Data Models (NEW)

(See Section D.1 in COMPREHENSIVE_GAP_ANALYSIS.md)

---

## Phase 12: UI Components (NEW)

(See Section D.1 in COMPREHENSIVE_GAP_ANALYSIS.md)

---

## Phase 13: Testing & QA (NEW)

(See Section D.1 in COMPREHENSIVE_GAP_ANALYSIS.md)

---

## Phase 14: Documentation & Deployment (NEW)

(See Section D.1 in COMPREHENSIVE_GAP_ANALYSIS.md)

---

## Step 3: Replace Success Criteria Section

(See Section D.2 in COMPREHENSIVE_GAP_ANALYSIS.md for complete replacement text)

---

## Step 4: Add Risk Mitigation Section

(See Section D.3 in COMPREHENSIVE_GAP_ANALYSIS.md for complete text)

---

## Implementation Priority

1. **IMMEDIATE (Week 1-2):**
   - Acknowledge actual completion status (7-15%, not 100%)
   - Update PROJECT_COMPLETION_REPORT.md
   - Implement Phase 9 discovery views (highest business value)

2. **HIGH PRIORITY (Week 3-6):**
   - Phase 10: Migration services
   - Phase 11: Data models
   - Enhanced PowerShell service

3. **MEDIUM PRIORITY (Week 7-10):**
   - Phase 12: UI components
   - Remaining views
   - Converters and behaviors

4. **FINAL (Week 11-12):**
   - Phase 13: Testing
   - Phase 14: Documentation
   - Deployment preparation
