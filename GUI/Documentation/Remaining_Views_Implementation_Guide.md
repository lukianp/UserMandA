# Implementation Guide: Remaining 63 Views
**Date:** October 5, 2025
**Status:** 25/88 views complete (28%), 63 views remaining

## 📊 COMPLETION OVERVIEW

### ✅ Completed Categories (25 views)
- **Discovery Views:** 13/13 (100%) ✅
- **Analytics Views:** 8/8 (100%) ✅
- **Security Views (partial):** 4/12 (33%) ✅

### 🔄 Remaining Categories (63 views)
- **Security/Compliance:** 8 views remaining
- **Infrastructure:** 13 views remaining
- **Administration:** 10 views remaining
- **Advanced:** 30+ views remaining

---

## 🏗️ ARCHITECTURE PATTERNS

### Pattern 1: Logic Engine Integration (for CSV-based data)
**Use When:** Data comes from discovered CSV files (users, groups, devices, ACLs, etc.)

**Example:**
```typescript
// guiv2/src/renderer/hooks/useInfrastructureViewLogic.ts
import { useState, useEffect, useCallback } from 'react';

export const useInfrastructureViewLogic = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Query Logic Engine for statistics
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Transform Logic Engine data
        const transformedData = {
          deviceCount: stats.DeviceCount || 0,
          serverCount: stats.ServerCount || 0,
          // ... other transformations
        };

        setData(transformedData);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Data fetch error:', err);

      // Fallback to mock data
      setData(getMockData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, handleRefresh: loadData };
};
```

**Files to Reference:**
- `guiv2/src/renderer/hooks/useExecutiveDashboardLogic.ts` (complete example)
- `guiv2/src/renderer/hooks/useUserAnalyticsLogic.ts` (complete example)
- `guiv2/src/renderer/hooks/security/useSecurityDashboardLogic.ts` (complete example)

---

### Pattern 2: PowerShell Module Integration (for policy, audit, and configuration data)
**Use When:** Data comes from PowerShell modules (policies, audits, threats, configurations)

**Example:**
```typescript
// guiv2/src/renderer/hooks/useAdministrationViewLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../store/useProfileStore';

export const useAdministrationViewLogic = () => {
  const { selectedSourceProfile } = useProfileStore();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Administration/AdminFunction.psm1',
        functionName: 'Get-AdminData',
        parameters: {
          Domain: selectedSourceProfile.domain,
          Credential: selectedSourceProfile.credential
        },
        options: { timeout: 300000 }
      });

      if (result.success && result.data) {
        setData(result.data.items || []);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Module execution error:', err);

      // Fallback to mock data
      setData(getMockData());
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    if (selectedSourceProfile) {
      loadData();
    }
  }, [selectedSourceProfile, loadData]);

  return { data, isLoading, error, handleRefresh: loadData };
};
```

**Files to Reference:**
- `guiv2/src/renderer/hooks/usePolicyManagementLogic.ts` (complete example)
- `guiv2/src/renderer/hooks/useRiskAssessmentLogic.ts` (complete example)
- `guiv2/src/renderer/hooks/useSecurityAuditLogic.ts` (complete example)

---

### Pattern 3: DataTable Component Usage
**Use When:** Displaying tabular data with sorting, filtering, pagination

**Example:**
```typescript
// In the view component
import { DataTable } from '../../components/organisms/DataTable';

const columns = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status', sortable: true },
  { id: 'type', header: 'Type', accessor: 'type', sortable: true },
  // ... more columns
];

return (
  <DataTable
    data={data}
    columns={columns}
    selectable
    searchable
    pagination
    pageSize={25}
    exportable
    exportFilename="export-data"
    contextMenu
    onViewDetails={(row) => handleViewDetails(row)}
  />
);
```

**Files to Reference:**
- `guiv2/src/renderer/views/users/UsersView.tsx` (complete example)
- `guiv2/src/renderer/views/groups/GroupsView.tsx` (complete example)
- `guiv2/src/renderer/components/organisms/DataTable.tsx` (component definition)

---

## 📝 IMPLEMENTATION CHECKLIST

### For Each View:

#### 1. Create Logic Hook
- [ ] Create hook file: `guiv2/src/renderer/hooks/use[ViewName]Logic.ts`
- [ ] Choose appropriate pattern (Logic Engine or PowerShell)
- [ ] Implement data loading with error handling
- [ ] Add mock data fallback
- [ ] Export hook with proper TypeScript types

#### 2. Create View Component
- [ ] Create view file: `guiv2/src/renderer/views/[category]/[ViewName].tsx`
- [ ] Import and use logic hook
- [ ] Implement UI layout (DataTable or custom)
- [ ] Add loading states and error handling
- [ ] Implement user actions (refresh, export, etc.)

#### 3. Update Navigation
- [ ] Add route to `guiv2/src/renderer/App.tsx`
- [ ] Update navigation menu if needed
- [ ] Test navigation and tab functionality

#### 4. Testing
- [ ] Test with real data (if available)
- [ ] Test with mock data fallback
- [ ] Test loading and error states
- [ ] Test user interactions
- [ ] Test responsive layout

---

## 🎯 PRIORITY IMPLEMENTATION ORDER

### Phase 1: Security/Compliance (8 views) - **HIGH PRIORITY**
Views rely on PowerShell modules for policy and audit data.

1. **AccessReviewView**
   - Module: `Modules/Security/AccessReview.psm1`
   - Pattern: PowerShell Module
   - Estimated: 2 hours

2. **PrivilegedAccessView**
   - Module: `Modules/Security/PrivilegedAccess.psm1`
   - Pattern: PowerShell Module
   - Estimated: 2 hours

3. **DataClassificationView**
   - Module: `Modules/Security/DataClassification.psm1`
   - Pattern: PowerShell Module
   - Estimated: 2 hours

4. **IdentityGovernanceView**
   - Module: `Modules/Security/IdentityGovernance.psm1`
   - Pattern: Logic Engine + PowerShell
   - Estimated: 3 hours

5. **SecurityPostureView**
   - Module: Logic Engine statistics
   - Pattern: Logic Engine
   - Estimated: 2 hours

6-8. **Remaining Security Views**
   - Follow PowerShell Module pattern
   - Estimated: 2 hours each

**Phase 1 Total: 15-20 hours**

---

### Phase 2: Infrastructure (13 views) - **CORE FUNCTIONALITY**
Views rely on Logic Engine for device and asset data.

1. **ComputerInventoryView**
   - Source: Logic Engine DeviceCount
   - Pattern: Logic Engine
   - Estimated: 2 hours

2. **ServerInventoryView**
   - Source: Logic Engine ServerCount
   - Pattern: Logic Engine
   - Estimated: 2 hours

3. **NetworkDeviceInventoryView**
   - Source: Logic Engine + CSV
   - Pattern: Logic Engine
   - Estimated: 2 hours

4. **InfrastructureView** (main dashboard)
   - Source: Logic Engine statistics
   - Pattern: Logic Engine
   - Estimated: 3 hours

5-13. **Remaining Infrastructure Views**
   - Sources: Logic Engine, PowerShell modules
   - Estimated: 2-3 hours each

**Phase 2 Total: 25-35 hours**

---

### Phase 3: Administration (10 views) - **OPERATIONAL TOOLS**
Views rely on PowerShell modules for administration functions.

1. **UserManagementView**
   - Module: `Modules/Administration/UserManagement.psm1`
   - Pattern: PowerShell Module
   - Estimated: 2 hours

2. **RoleManagementView**
   - Module: `Modules/Administration/RoleManagement.psm1`
   - Pattern: PowerShell Module
   - Estimated: 2 hours

3. **AuditLogView**
   - Module: `Modules/Audit/AuditLogs.psm1`
   - Pattern: PowerShell Module
   - Estimated: 2 hours

4. **SystemConfigurationView**
   - Module: `Modules/Configuration/SystemConfig.psm1`
   - Pattern: PowerShell Module
   - Estimated: 2 hours

5. **PermissionsView**
   - Module: Logic Engine ACL data
   - Pattern: Logic Engine
   - Estimated: 3 hours

6-10. **Remaining Admin Views**
   - BackupRestoreView, LicenseActivationView, AboutView, etc.
   - Estimated: 1-2 hours each

**Phase 3 Total: 15-20 hours**

---

### Phase 4: Advanced Views (30+ views) - **SPECIALIZED FEATURES**
**Recommendation:** Document pattern, implement on-demand

These views are highly specialized and may not be immediately required:
- ScriptLibraryView
- WorkflowAutomationView
- CustomFieldsView
- TagManagementView
- BulkOperationsView
- DataImportExportView
- APIManagementView
- WebhooksView
- etc. (22+ more)

**Approach:**
1. Create comprehensive template based on existing patterns
2. Document PowerShell module requirements
3. Implement priority views first
4. Defer remaining views to future sprints

**Phase 4 Strategy: Template + On-Demand Implementation**

---

## 🛠️ IMPLEMENTATION TEMPLATE

### Template for New View

```typescript
// guiv2/src/renderer/hooks/use[ViewName]Logic.ts
import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../store/useProfileStore';

export interface [ViewName]Data {
  // Define data structure
}

function getMockData(): [ViewName]Data[] {
  // Return mock data
  return [];
}

export const use[ViewName]Logic = () => {
  const { selectedSourceProfile } = useProfileStore();
  const [data, setData] = useState<[ViewName]Data[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // OPTION A: Logic Engine
      const result = await window.electronAPI.logicEngine.getStatistics();
      if (result.success && result.data?.statistics) {
        const transformedData = transformStats(result.data.statistics);
        setData(transformedData);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }

      // OPTION B: PowerShell Module
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/[Category]/[Module].psm1',
        functionName: 'Get-[Data]',
        parameters: {
          Domain: selectedSourceProfile.domain,
          Credential: selectedSourceProfile.credential
        },
        options: { timeout: 300000 }
      });
      if (result.success && result.data) {
        setData(result.data.items || []);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[ViewName] error:', err);
      setData(getMockData());
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    if (selectedSourceProfile) {
      loadData();
    }
  }, [selectedSourceProfile, loadData]);

  return { data, isLoading, error, handleRefresh: loadData };
};
```

```typescript
// guiv2/src/renderer/views/[category]/[ViewName].tsx
import React from 'react';
import { use[ViewName]Logic } from '../../hooks/use[ViewName]Logic';
import { DataTable } from '../../components/organisms/DataTable';
import { RefreshCw } from 'lucide-react';

export const [ViewName]: React.FC = () => {
  const { data, isLoading, error, handleRefresh } = use[ViewName]Logic();

  const columns = [
    // Define columns
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            [View Title]
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            [View Description]
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        selectable
        searchable
        pagination
        exportable
        exportFilename="[export-filename]"
      />
    </div>
  );
};
```

---

## 📚 REFERENCE FILES

### Complete Example Implementations
1. **Logic Engine Pattern:**
   - `guiv2/src/renderer/hooks/useExecutiveDashboardLogic.ts`
   - `guiv2/src/renderer/views/analytics/ExecutiveDashboardView.tsx`

2. **PowerShell Module Pattern:**
   - `guiv2/src/renderer/hooks/usePolicyManagementLogic.ts`
   - `guiv2/src/renderer/views/security/PolicyManagementView.tsx`

3. **DataTable Usage:**
   - `guiv2/src/renderer/views/users/UsersView.tsx`
   - `guiv2/src/renderer/views/groups/GroupsView.tsx`

4. **Type Definitions:**
   - `guiv2/src/renderer/types/models/logicEngine.ts`
   - `guiv2/src/renderer/types/models/migration.ts`

---

## ⏱️ TIME ESTIMATES

### Total Remaining Work
- **Phase 1 (Security/Compliance):** 15-20 hours
- **Phase 2 (Infrastructure):** 25-35 hours
- **Phase 3 (Administration):** 15-20 hours
- **Phase 4 (Advanced):** Template + On-Demand

**Total for Phases 1-3:** 55-75 hours (7-10 working days)

### Per-View Average
- Simple Logic Engine view: 2 hours
- Complex Logic Engine view: 3 hours
- PowerShell Module view: 2 hours
- Advanced specialized view: 2-4 hours

---

## ✅ QUALITY CHECKLIST

Before marking a view complete:
- [ ] Hook follows established patterns
- [ ] Error handling with fallback
- [ ] Loading states implemented
- [ ] TypeScript types defined
- [ ] DataTable or custom UI functional
- [ ] User actions work (refresh, export, etc.)
- [ ] Navigation integrated
- [ ] Mock data fallback working
- [ ] Tested with real profile (if data available)
- [ ] Code documented with comments

---

## 🚀 GETTING STARTED

### To Implement Next View:
1. Choose view from priority list
2. Reference this guide for appropriate pattern
3. Copy template code
4. Customize for specific view requirements
5. Test thoroughly
6. Update completion tracking

### Current Status Files:
- Epic Status: `CLAUDE.md` (All 5 Epics 100% complete)
- Session Analysis: `GUI/Documentation/Session4_Complete_Status_Analysis.md`
- This Guide: `GUI/Documentation/Remaining_Views_Implementation_Guide.md`

---

**Last Updated:** October 5, 2025
**Next Review:** After completing Phase 1 (Security/Compliance)
