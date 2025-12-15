# Enterprise Discovery System - Comprehensive Fix Plan

## Executive Summary

The Enterprise Discovery application has multiple critical issues preventing discovery modules from launching correctly. This document provides a systematic analysis and fix plan for all identified issues.

## Critical Issues Identified

### 1. Service Initialization Order Issues
**Problem**: `useDiscovery.ts` imports `cacheService` and `progressService` at module level, causing "Cannot access 'cacheService' before initialization" errors.

**Affected Components**:
- All hooks using `useDiscovery.ts` (multiple discovery modules)
- Console errors: `ReferenceError: Cannot access 'cacheService' before initialization`

**Root Cause**: Circular dependency between services and hooks during module initialization.

### 2. PascalCase vs camelCase Property Mismatches
**Problem**: PowerShell returns PascalCase properties (e.g., `DisplayName`, `UserPrincipalName`) but AG Grid column definitions use camelCase field names (e.g., `displayName`, `userPrincipalName`), causing all data to show as "N/A".

**Affected Modules**:
- Exchange Discovery: All mailbox/group/rule columns
- Teams Discovery: All team/channel/member/app columns
- Any module using AG Grid with PowerShell data

**Example Issue**:
```typescript
// BROKEN - camelCase doesn't match PowerShell output
{ field: 'displayName', headerName: 'Display Name' }

// PowerShell actually returns:
{ "DisplayName": "John Doe" } // PascalCase!

// Result: All cells show "N/A"
```

### 3. Undefined Property Access in Views
**Problem**: Views try to access properties on undefined objects, causing TypeError crashes.

**Affected Views**:
- TeamsDiscoveryView: `Cannot read properties of undefined (reading 'averageMembersPerTeam')`
- Office365DiscoveryView: `Cannot read properties of undefined (reading 'length')`
- OneDriveDiscoveryView: `Cannot read properties of undefined (reading 'length')`

### 4. Browser Compatibility Issues
**Problem**: Code tries to use Node.js `require()` in browser context.

**Affected Components**:
- Checkbox.tsx: `ReferenceError: require is not defined`
- DomainDiscoveryView.tsx: `ReferenceError: require is not defined`

### 5. Missing Function Definitions
**Problem**: `cancelDiscovery` function not defined in scope.

**Affected Components**:
- EnvironmentDetectionView.tsx: `ReferenceError: cancelDiscovery is not defined`

### 6. Missing PowerShell Modules
**Problem**: PowerShell discovery modules don't exist on filesystem.

**Missing Modules**:
- `DomainDiscovery.psm1`
- `FileSystemDiscovery.psm1`
- `NetworkDiscovery.psm1`
- `Office365Discovery.psm1`

**Console Evidence**:
```
Import-Module : The specified module 'C:\enterprisediscovery\Modules\Discovery\DomainDiscovery.psm1' was not loaded because no valid module file was found in any module directory.
```

### 7. AG Grid Configuration Issues
**Problem**: AG Grid v33+ requires updated configuration.

**Issues**:
- `enableCharts: true` causes error #200
- Missing `theme: 'legacy'` causes error #239
- `enableRangeSelection` deprecated, should use `cellSelection`

## Working Templates Analysis

### Azure Infrastructure & Applications (WORKING)
**Pattern**: Uses event-driven architecture with proper token matching.

**Key Features**:
- Event listeners set up once on mount with empty dependency array
- Uses `currentTokenRef` for event matching (not state)
- Proper cleanup of event listeners
- No dependency on problematic `useDiscovery.ts` hook

### AWS Cloud Infrastructure (WORKING)
**Pattern**: Similar event-driven approach with ref-based token matching.

## Fix Implementation Plan

### Phase 1: Service Initialization Fixes
1. **Remove problematic imports** from `useDiscovery.ts`
2. **Lazy load services** only when needed
3. **Replace useDiscovery.ts usage** with event-driven pattern in all hooks

### Phase 2: Property Casing Fixes
1. **Audit all AG Grid column definitions** for PascalCase compliance
2. **Update Exchange Discovery columns**:
   - `displayName` → `DisplayName`
   - `userPrincipalName` → `UserPrincipalName`
   - `primarySmtpAddress` → `PrimarySmtpAddress`
   - `mailboxType` → `MailboxType`
   - `totalItemSize` → `TotalItemSize`
   - `itemCount` → `ItemCount`
   - `archiveEnabled` → `ArchiveEnabled`
   - `litigationHoldEnabled` → `LitigationHoldEnabled`
   - `isInactive` → `IsInactive`
   - `lastLogonTime` → `LastLogonTime`

3. **Update Teams Discovery columns**:
   - `displayName` → `DisplayName`
   - `description` → `Description`
   - `visibility` → `Visibility`
   - `memberCount` → `MemberCount`
   - etc.

### Phase 3: View Safety Fixes
1. **Add null checks** in all views before property access
2. **Implement safe property access** patterns:
   ```typescript
   // BEFORE (crashes)
   result?.statistics?.averageMembersPerTeam

   // AFTER (safe)
   result?.statistics?.averageMembersPerTeam ?? 0
   ```

### Phase 4: Browser Compatibility Fixes
1. **Remove Node.js require() calls** from browser code
2. **Use ES6 imports** consistently
3. **Replace dynamic requires** with static imports

### Phase 5: Missing Function Fixes
1. **Import cancelDiscovery** in EnvironmentDetectionView
2. **Ensure proper scope** for all required functions

### Phase 6: PowerShell Module Creation
1. **Create missing .psm1 files** based on working patterns
2. **Implement standard discovery structure**:
   - `Invoke-{Module}Discovery` function
   - `Start-{Module}Discovery` wrapper
   - Proper error handling and logging

### Phase 7: AG Grid Configuration Updates
1. **Update VirtualizedDataGrid.tsx**:
   ```typescript
   gridOptions = {
     enableCharts: false,  // Fix error #200
     cellSelection: true,  // Replace deprecated enableRangeSelection
     theme: 'legacy' as any,  // Fix error #239
   }
   ```

### Phase 8: Date Parsing Standardization
1. **Add parsePowerShellDate utility** to all date-handling hooks
2. **Update all date column valueFormatters** to use the utility

## Testing Strategy

### Module-by-Module Testing
1. **Launch each discovery module** individually
2. **Verify no console errors** during initialization
3. **Check data display** in AG Grid tables
4. **Test sorting/filtering/export** functionality
5. **Verify PowerShell module loading**

### Error Monitoring
1. **Monitor console output** for specific error patterns
2. **Verify AG Grid renders** without "N/A" values
3. **Check view rendering** without crashes

## Success Criteria

### Functional Requirements
- [ ] All discovery modules launch without console errors
- [ ] AG Grid tables display actual data (not "N/A")
- [ ] Views render without TypeError crashes
- [ ] PowerShell modules load successfully
- [ ] Sorting, filtering, and export work correctly

### Code Quality Requirements
- [ ] No PascalCase/camelCase mismatches
- [ ] Proper null safety in views
- [ ] Event-driven architecture consistency
- [ ] AG Grid configuration compliance

## Implementation Priority

1. **HIGH**: Fix service initialization (blocking all useDiscovery.ts hooks)
2. **HIGH**: Fix PascalCase/camelCase (blocking data display)
3. **MEDIUM**: Fix view crashes (blocking UI)
4. **MEDIUM**: Create missing PowerShell modules
5. **LOW**: AG Grid configuration updates
6. **LOW**: Date parsing standardization

## Files Requiring Changes

### Hooks (20+ files)
- All `use*DiscoveryLogic.ts` files
- `useDiscovery.ts` (remove problematic imports)

### Views (10+ files)
- `TeamsDiscoveryView.tsx`
- `Office365DiscoveryView.tsx`
- `OneDriveDiscoveryView.tsx`
- `EnvironmentDetectionView.tsx`

### Components
- `VirtualizedDataGrid.tsx`
- `Checkbox.tsx`
- `DomainDiscoveryView.tsx`

### PowerShell Modules (4+ files)
- `DomainDiscovery.psm1`
- `FileSystemDiscovery.psm1`
- `NetworkDiscovery.psm1`
- `Office365Discovery.psm1`

## Risk Assessment

### High Risk
- Service initialization changes could break caching/progress tracking
- AG Grid configuration changes could affect all data grids

### Medium Risk
- Property casing changes require careful verification
- PowerShell module creation requires domain expertise

### Low Risk
- View safety checks
- Date parsing utilities

## Rollback Plan

1. **Git branch strategy**: Create feature branch for all changes
2. **Incremental commits**: Commit each module fix separately
3. **Testing checkpoints**: Test after each major change
4. **Revert capability**: Keep working version available

## Success Metrics

- **Before**: 15+ console errors, multiple view crashes, no data display
- **After**: 0 console errors, all views render, data displays correctly in all grids
- **Target**: All discovery modules functional with proper UX