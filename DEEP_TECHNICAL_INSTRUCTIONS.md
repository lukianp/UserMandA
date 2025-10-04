# M&A Discovery Suite: Deep Technical Instructions for GUI v2 Implementation

**Date:** October 4, 2025
**Status:** Critical Implementation Required
**Target:** Complete 100% feature parity between GUI/ and guiv2/

---

## Executive Summary

The M&A Discovery Suite GUI v2 (TypeScript/Electron) has complete infrastructure but only 1 out of 102 views has real PowerShell data integration. The remaining 101 views use mock data and need the UsersView pattern applied to achieve 100% feature parity.

**Current Status:**
- ✅ Infrastructure: 100% complete
- ✅ Views: 102/102 structurally implemented
- ✅ Real Data Integration: 1/102 views (UsersView)
- ❌ **GAP:** 101 views need PowerShell integration

---

## Critical Gap Analysis

### What GUI/ (C# WPF) Has
- **LogicEngineService.cs**: 5,664 lines of comprehensive data loading, inference rules, projections
- **100+ Views**: All with full PowerShell integration via modules
- **Complete Service Layer**: 50+ services with enterprise functionality
- **PowerShell Modules**: 40+ discovery modules in `/Modules/Discovery/`

### What guiv2/ (TypeScript/Electron) Has
- ✅ **Infrastructure Complete**: All services, stores, components implemented
- ✅ **Views Structure**: All 102 views implemented with UI and hooks
- ❌ **Data Integration**: Only UsersView has real PowerShell data
- ❌ **Missing**: 101 views using mock data instead of PowerShell modules

### The Gap
**101 views need the UsersView pattern applied** to replace mock data with real PowerShell execution.

---

## Proven Implementation Pattern (UsersView Reference)

### Pattern Structure
Each view follows this exact pattern established in `UsersView.tsx`:

```typescript
// 1. Use PowerShell service with caching
const usersData = await powerShellService.getCachedResult(
  `users_${selectedProfile?.id}`,
  async () => {
    // 2. Try PowerShell module first
    const result = await powerShellService.executeModule<{ users: UserData[] }>(
      'Modules/Discovery/Get-AllUsers.psm1',
      'Get-AllUsers',
      {
        ProfileName: selectedProfile?.companyName,
        IncludeMembers: true
      }
    );
    return result.data?.users || [];
  }
);

// 3. Fallback to CSV script
catch (moduleError) {
  const csvResult = await powerShellService.executeScript<{ users: UserData[] }>(
    'Scripts/Get-UsersFromCsv.ps1',
    { ProfilePath: selectedProfile?.dataPath }
  );
  return csvResult.data?.users || [];
}

// 4. Ultimate fallback to mock data
catch (csvError) {
  return generateMockUsers(); // With warnings
}
```

### Required Files Per View
For each view, ensure these files exist and are properly implemented:

1. **View Component**: `guiv2/src/renderer/views/{category}/{ViewName}View.tsx`
2. **Logic Hook**: `guiv2/src/renderer/hooks/use{ViewName}ViewLogic.ts`
3. **Test File**: `guiv2/src/renderer/views/{category}/{ViewName}View.test.tsx`

---

## Implementation Instructions by View Category

### Priority 1: Core Discovery Views (26 views) - START HERE

Apply UsersView pattern to these high-priority discovery views:

#### 1. GroupsView ✅ (COMPLETED - Reference Implementation)
- **PowerShell Module**: `Modules/Discovery/Get-AllGroups.psm1`
- **Function**: `Get-AllGroups`
- **Parameters**: `{ ProfileName, IncludeMembers, IncludeOwners }`
- **CSV Fallback**: `Scripts/Get-GroupsFromCsv.ps1`

#### 2. ActiveDirectoryDiscoveryView
- **Module**: `Modules/Discovery/ActiveDirectoryDiscovery.psm1`
- **Function**: `Get-ActiveDirectoryData`
- **Parameters**: `{ DomainName, SearchBase, Properties }`

#### 3. DomainDiscoveryView
- **Module**: `Modules/Discovery/DomainDiscovery.psm1`
- **Function**: `Get-DomainInformation`
- **Parameters**: `{ DomainName, IncludeDCs, IncludeTrusts }`

#### 4. ExchangeDiscoveryView
- **Module**: `Modules/Discovery/ExchangeDiscovery.psm1`
- **Function**: `Get-ExchangeConfiguration`
- **Parameters**: `{ ServerName, OrganizationName }`

#### 5. AzureDiscoveryView
- **Module**: `Modules/Discovery/AzureDiscovery.psm1`
- **Function**: `Get-AzureResources`
- **Parameters**: `{ TenantId, SubscriptionId }`

#### 6. SharePointDiscoveryView
- **Module**: `Modules/Discovery/SharePointDiscovery.psm1`
- **Function**: `Get-SharePointSites`
- **Parameters**: `{ SiteUrl, IncludeSubsites }`

#### 7. TeamsDiscoveryView
- **Module**: `Modules/Discovery/TeamsDiscovery.psm1`
- **Function**: `Get-TeamsData`
- **Parameters**: `{ OrganizationName }`

#### 8. OneDriveDiscoveryView
- **Module**: `Modules/Discovery/OneDriveDiscovery.psm1`
- **Function**: `Get-OneDriveUsage`
- **Parameters**: `{ UserPrincipalName }`

#### 9. SQLServerDiscoveryView
- **Module**: `Modules/Discovery/SQLServerDiscovery.psm1`
- **Function**: `Get-SQLServerDatabases`
- **Parameters**: `{ ServerName, InstanceName }`

#### 10. VMwareDiscoveryView
- **Module**: `Modules/Discovery/VMwareDiscovery.psm1`
- **Function**: `Get-VMwareInventory`
- **Parameters**: `{ VCentreServer }`

**Continue with remaining 16 discovery views following the same pattern...**

### Priority 2: Migration Views (5 views)

#### MigrationPlanningView ✅ (COMPLETED)
- **Module**: `Modules/Migration/MigrationPlanning.psm1`
- **Function**: `Get-MigrationWaves`
- **Parameters**: `{ SourceProfile, TargetProfile, WaveCount }`

#### MigrationExecutionView
- **Module**: `Modules/Migration/MigrationExecution.psm1`
- **Function**: `Execute-MigrationWave`
- **Parameters**: `{ WaveId, SourceProfile, TargetProfile }`

### Priority 3: Analytics & Reporting Views (8 views)

#### ExecutiveDashboardView
- **Module**: `Modules/Analytics/ExecutiveDashboard.psm1`
- **Function**: `Get-ExecutiveMetrics`
- **Parameters**: `{ TimeRange, OrganizationName }`

#### MigrationReportView
- **Module**: `Modules/Reporting/MigrationReports.psm1`
- **Function**: `Get-MigrationReports`
- **Parameters**: `{ ReportType, DateRange }`

### Priority 4: Infrastructure & Asset Views (15+ views)

#### AssetInventoryView
- **Module**: `Modules/Infrastructure/AssetInventory.psm1`
- **Function**: `Get-AssetInventory`
- **Parameters**: `{ AssetType, Location }`

#### ComputerInventoryView
- **Module**: `Modules/Infrastructure/ComputerInventory.psm1`
- **Function**: `Get-ComputerInventory`
- **Parameters**: `{ OU, IncludeDisabled }`

**Continue with all remaining views...**

---

## Technical Implementation Details

### 1. PowerShell Service Integration

Each view logic hook must:

```typescript
import { powerShellService } from '../../services/powerShellService';
import { useProfileStore } from '../../store/useProfileStore';

// In the loadData function:
const { getCurrentSourceProfile } = useProfileStore();
const selectedProfile = getCurrentSourceProfile();

const data = await powerShellService.getCachedResult(
  `${viewName}_${selectedProfile?.id}`,
  async () => {
    try {
      // Try module first
      const result = await powerShellService.executeModule(
        `Modules/Discovery/Get-All${ViewName}.psm1`,
        `Get-All${ViewName}`,
        { ProfileName: selectedProfile?.companyName }
      );
      return result.data?.[lowercaseViewName] || [];
    } catch (moduleError) {
      // Fallback to CSV
      const csvResult = await powerShellService.executeScript(
        `Scripts/Get-${ViewName}FromCsv.ps1`,
        { ProfilePath: selectedProfile?.dataPath }
      );
      return csvResult.data?.[lowercaseViewName] || [];
    }
  }
);
```

### 2. Error Handling Pattern

```typescript
const [error, setError] = useState<string | null>(null);
const [warnings, setWarnings] = useState<string[]>([]);

try {
  // Data loading logic
} catch (err: any) {
  console.error(`Failed to load ${viewName}:`, err);
  setError(err.message || `Failed to load ${viewName}`);
  // Don't show mock data on error - let user know real data failed
}
```

### 3. Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);
const [loadingMessage, setLoadingMessage] = useState('');

setLoadingMessage('Checking cache and data sources...');
// ... loading logic ...
setLoadingMessage('Loading data from PowerShell modules...');
// ... more loading ...
setLoadingMessage('');
```

### 4. Data Transformation

Ensure data from PowerShell matches TypeScript interfaces:

```typescript
// Transform PowerShell data to match TypeScript types
const transformedData = rawData.map(item => ({
  id: item.Id || item.ObjectId || generateId(),
  name: item.Name || item.DisplayName,
  // ... map all properties
}));
```

### 5. Cache Strategy

- **Cache Key**: `{viewName}_{profileId}`
- **TTL**: 5 minutes (matches C# LogicEngineService)
- **Invalidation**: Automatic via FileWatcherService

---

## File Structure Requirements

### View Implementation Template

```
guiv2/src/renderer/
├── views/{category}/{ViewName}View.tsx
├── views/{category}/{ViewName}View.test.tsx
└── hooks/use{ViewName}ViewLogic.ts
```

### Required Exports

Each view must export:
- Default component: `export default {ViewName}View`
- Named export: `export const {ViewName}View`

### Hook Interface

```typescript
export const use{ViewName}ViewLogic = () => {
  return {
    data: transformedData,
    isLoading,
    error,
    // ... other state
    columnDefs,
    handleExport,
    handleRefresh,
    totalCount: data.length,
    filteredCount: filteredData.length,
  };
};
```

---

## PowerShell Module Mapping

### Discovery Modules (High Priority)

| View Name | PowerShell Module | Function Name | Parameters |
|-----------|------------------|---------------|------------|
| GroupsView | `Modules/Discovery/Get-AllGroups.psm1` | `Get-AllGroups` | ProfileName, IncludeMembers |
| ActiveDirectory | `Modules/Discovery/ActiveDirectoryDiscovery.psm1` | `Get-ActiveDirectoryData` | DomainName, SearchBase |
| DomainDiscovery | `Modules/Discovery/DomainDiscovery.psm1` | `Get-DomainInformation` | DomainName |
| ExchangeDiscovery | `Modules/Discovery/ExchangeDiscovery.psm1` | `Get-ExchangeConfiguration` | ServerName |
| AzureDiscovery | `Modules/Discovery/AzureDiscovery.psm1` | `Get-AzureResources` | TenantId |
| SharePointDiscovery | `Modules/Discovery/SharePointDiscovery.psm1` | `Get-SharePointSites` | SiteUrl |
| TeamsDiscovery | `Modules/Discovery/TeamsDiscovery.psm1` | `Get-TeamsData` | OrganizationName |
| OneDriveDiscovery | `Modules/Discovery/OneDriveDiscovery.psm1` | `Get-OneDriveUsage` | UserPrincipalName |
| SQLServerDiscovery | `Modules/Discovery/SQLServerDiscovery.psm1` | `Get-SQLServerDatabases` | ServerName |
| VMwareDiscovery | `Modules/Discovery/VMwareDiscovery.psm1` | `Get-VMwareInventory` | VCentreServer |

### Migration Modules

| View Name | PowerShell Module | Function Name | Parameters |
|-----------|------------------|---------------|------------|
| MigrationPlanning | `Modules/Migration/MigrationPlanning.psm1` | `Get-MigrationWaves` | SourceProfile, TargetProfile |
| MigrationExecution | `Modules/Migration/MigrationExecution.psm1` | `Execute-MigrationWave` | WaveId |

### Analytics Modules

| View Name | PowerShell Module | Function Name | Parameters |
|-----------|------------------|---------------|------------|
| ExecutiveDashboard | `Modules/Analytics/ExecutiveDashboard.psm1` | `Get-ExecutiveMetrics` | TimeRange |
| MigrationReport | `Modules/Reporting/MigrationReports.psm1` | `Get-MigrationReports` | ReportType |
| UserAnalytics | `Modules/Analytics/UserAnalytics.psm1` | `Get-UserAnalytics` | UserFilter |
| CostAnalysis | `Modules/Analytics/CostAnalysis.psm1` | `Get-CostAnalysis` | TimeRange |

---

## Environment Variables (from buildguiv2.ps1)

```bash
# Set during application launch
MANDA_DISCOVERY_PATH=C:\discoverydata
NODE_ENV=production
```

---

## Testing Requirements

Each view must have comprehensive tests:

```typescript
// {ViewName}View.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { {ViewName}View } from './{ViewName}View';

// Mock services
jest.mock('../../services/powerShellService');
jest.mock('../../store/useProfileStore');

describe('{ViewName}View', () => {
  it('loads data on mount', async () => {
    // Test PowerShell service integration
  });

  it('shows loading state', () => {
    // Test loading UI
  });

  it('handles errors gracefully', () => {
    // Test error handling
  });

  it('filters and searches data', () => {
    // Test filtering functionality
  });
});
```

---

## Success Criteria

### Functional Requirements ✅
- [ ] All 102 views load real data from PowerShell modules
- [ ] Caching works correctly (5-minute TTL)
- [ ] CSV fallback functions properly
- [ ] Error handling displays appropriate messages
- [ ] Loading states provide user feedback

### Performance Requirements ✅
- [ ] Initial load < 3 seconds
- [ ] View switching < 100ms
- [ ] Data grid handles 100K+ rows at 60 FPS
- [ ] Memory usage < 500MB baseline

### Quality Requirements ✅
- [ ] All views pass unit tests
- [ ] E2E tests cover critical workflows
- [ ] TypeScript compilation succeeds
- [ ] No console errors in production

---

## Implementation Priority Order

1. **Phase 1 (Week 1)**: Core Discovery Views (15 views)
   - GroupsView ✅ (done)
   - ActiveDirectoryDiscoveryView
   - DomainDiscoveryView
   - ExchangeDiscoveryView
   - AzureDiscoveryView
   - SharePointDiscoveryView
   - TeamsDiscoveryView
   - OneDriveDiscoveryView
   - SQLServerDiscoveryView
   - VMwareDiscoveryView
   - 5 more high-priority discovery views

2. **Phase 2 (Week 2)**: Migration + Analytics (13 views)
   - Migration views (5)
   - Analytics views (8)

3. **Phase 3 (Week 3)**: Infrastructure + Assets (20 views)
   - Asset views (8)
   - Infrastructure views (12)

4. **Phase 4 (Week 4)**: Advanced + Admin + Settings (44 views)
   - Admin views (8)
   - Advanced views (18)
   - Compliance/Security views (10)
   - Licensing views (5)
   - Settings and remaining views (3)

---

## Critical Technical Notes

1. **PowerShell Module Availability**: All required modules exist in `/Modules/Discovery/` and are copied during build
2. **CSV Fallback Scripts**: May need to be created if they don't exist in `/Scripts/`
3. **Type Safety**: Ensure PowerShell return data matches TypeScript interfaces
4. **Error Boundaries**: Each view should handle its own errors gracefully
5. **Memory Management**: Large datasets should use virtual scrolling (AG Grid handles this)
6. **Profile Integration**: All data loading must respect current profile selection

---

## Final Validation Steps

After implementing all views:

1. **Functional Testing**:
   - [ ] All views load without mock data warnings
   - [ ] PowerShell modules execute successfully
   - [ ] CSV fallback works when modules unavailable
   - [ ] Profile switching updates data correctly

2. **Performance Testing**:
   - [ ] Bundle size remains < 5MB
   - [ ] Memory usage < 500MB
   - [ ] Loading times meet targets

3. **Quality Assurance**:
   - [ ] All tests pass (200+ test files)
   - [ ] TypeScript compilation clean
   - [ ] E2E workflows functional

**Result**: 100% feature parity between GUI/ and guiv2/ with identical PowerShell integration, caching, and fallback mechanisms.

---

**Estimated Implementation Time**: 40-60 hours
**Pattern Complexity**: Low (copy UsersView pattern)
**Risk Level**: Low (proven pattern, comprehensive infrastructure)
**Business Impact**: Critical (achieves 100% feature parity)