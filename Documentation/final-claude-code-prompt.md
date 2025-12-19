# CLAUDE CODE: Complete Enterprise Discovery System Fix

## EXECUTIVE SUMMARY
Fix all discovery module launch failures in the Enterprise Discovery System. Currently 15+ console errors prevent modules from working. Target: 0 errors, all modules functional.

## CRITICAL ISSUES IDENTIFIED

### 1. AG Grid Configuration (HIGH PRIORITY)
**Problem:** AG Grid v33+ breaking changes cause errors #200/#239
**File:** `guiv2/src/renderer/components/organisms/VirtualizedDataGrid.tsx`
**Fix:**
```typescript
gridOptions = useMemo(() => ({
  // ... existing options
  enableCharts: false,  // Fix error #200
  cellSelection: true,  // Replace deprecated enableRangeSelection
  theme: 'legacy' as any,  // Fix error #239
}), [/* dependencies */]);
```

### 2. PascalCase vs camelCase Mismatches (CRITICAL)
**Problem:** PowerShell returns PascalCase (DisplayName) but AG Grid uses camelCase (displayName)
**Affected:** Exchange, Teams, and other discovery hooks
**Example Fix:**
```typescript
// BEFORE (BROKEN)
{ field: 'displayName', headerName: 'Display Name' }

// AFTER (FIXED)
{ field: 'DisplayName', headerName: 'Display Name' }
```

### 3. Service Initialization Issues (HIGH PRIORITY)
**Problem:** `useDiscovery.ts` imports cause "Cannot access 'cacheService' before initialization"
**File:** `guiv2/src/renderer/hooks/useDiscovery.ts`
**Fix:** Lazy load services instead of top-level imports

### 4. View Crash Issues (MEDIUM PRIORITY)
**Problem:** Views crash with "Cannot read properties of undefined"
**Affected:** TeamsDiscoveryView, Office365DiscoveryView, OneDriveDiscoveryView, SecurityInfrastructureDiscoveryView
**Fix:** Add null safety checks

### 5. Browser Compatibility Issues (LOW PRIORITY)
**Problem:** Node.js `require()` calls in React components
**Affected:** Checkbox.tsx, PanoramaInterrogationDiscoveryView.tsx
**Fix:** Replace with ES6 imports

### 6. Missing PowerShell Modules (MEDIUM PRIORITY)
**Missing:** DomainDiscovery.psm1, FileSystemDiscovery.psm1, NetworkDiscovery.psm1, Office365Discovery.psm1
**Fix:** Create based on working module patterns

## WORKING TEMPLATES
- **Azure Discovery Hook** (`useAzureDiscoveryLogic.ts`): Event-driven pattern
- **AWS Cloud Infrastructure** (`useAWSCloudInfrastructureDiscoveryLogic.ts`): Similar pattern

## IMPLEMENTATION PHASES

### Phase 1: Core Infrastructure (Start Here)
1. Fix VirtualizedDataGrid AG Grid configuration
2. Fix useDiscovery.ts service initialization

### Phase 2: Data Display Fixes
1. Fix Exchange Discovery column definitions (DisplayName, UserPrincipalName, etc.)
2. Fix Teams Discovery column definitions
3. Audit other discovery hooks for PascalCase compliance

### Phase 3: View Stability
1. Add null checks to TeamsDiscoveryView
2. Add null checks to Office365DiscoveryView
3. Add null checks to OneDriveDiscoveryView
4. Add null checks to SecurityInfrastructureDiscoveryView

### Phase 4: PowerShell Modules
1. Create missing .psm1 files based on ExchangeDiscovery.psm1 pattern

### Phase 5: Polish
1. Fix browser compatibility issues
2. Fix remaining function import issues

## SUCCESS METRICS
- **Before:** 15+ console errors, modules crash, "N/A" in grids
- **After:** 0 errors, all modules launch, data displays correctly

## EXECUTION GUIDANCE
1. Work systematically through phases
2. Test after each major change
3. Use working templates as reference
4. Verify PascalCase matches PowerShell output exactly
5. Add comprehensive error handling

## FILES TO MODIFY (50+ total)
- **High Priority:** VirtualizedDataGrid.tsx, useDiscovery.ts
- **Medium Priority:** All discovery hooks with AG Grid columns
- **Low Priority:** View components, missing PowerShell modules

Execute this plan systematically to restore full discovery functionality.