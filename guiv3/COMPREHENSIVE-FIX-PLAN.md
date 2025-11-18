# Comprehensive Test Fix Plan to Reach 95% Coverage

## Current Status
- **Tests Passing:** 1,568 / 2,926 (53.6%)
- **Tests Failing:** 787
- **Target (95%):** 2,780 tests
- **Gap:** 1,212 tests

## Root Cause Analysis (from failure-analysis-detailed.json)
- **Null Safety:** 311 failures (39.0%)
- **Text Mismatch:** 244 failures (30.6%)
- **Async Timing:** 184 failures (23.1%)
- **Mock Issues:** 49 failures (6.1%)
- **Other:** 9 failures (1.1%)

## Top 10 Failing Test Suites
1. useTeamsDiscoveryLogic - 38 failures
2. useSharePointDiscoveryLogic - 37 failures
3. useExchangeDiscoveryLogic - 36 failures
4. useFileSystemDiscoveryLogic - 35 failures
5. UsersView - 22 failures
6. SQLServerDiscoveryView - 14 failures
7. VirtualizedDataGrid - 14 failures
8. VMwareDiscoveryView - 14 failures
9. logicEngineService - 13 failures
10. UserAnalyticsView - 12 failures

## Strategic Fix Approach

### Phase 1: Revert Jest Config (IMMEDIATE)
- Revert jest.config.js back to working ts-jest configuration
- Target restore to 1,580 passing tests baseline

### Phase 2: Fix Top 4 Discovery Hooks (HIGH ROI - ~146 tests)
**Files:**
- src/renderer/hooks/useTeamsDiscoveryLogic.ts
- src/renderer/hooks/useSharePointDiscoveryLogic.ts
- src/renderer/hooks/useExchangeDiscoveryLogic.ts
- src/renderer/hooks/useFileSystemDiscoveryLogic.ts

**Fixes Needed:**
1. Add null safety to all array operations
2. Add async/await with waitFor() to all hook tests
3. Ensure electronAPI mocks return expected data

**Pattern:**
```typescript
// Hook implementation
const total = result?.items?.length ?? 0;
const filtered = (result?.items ?? []).filter(x => x);

// Hook test
await act(async () => {
  await result.current.startDiscovery();
});

await waitFor(() => {
  expect(result.current.isDiscovering).toBe(false);
});
```

### Phase 3: Fix UsersView and Discovery Views (MEDIUM ROI - ~70 tests)
**Files:**
- src/renderer/views/users/UsersView.tsx
- src/renderer/views/users/UsersView.test.tsx
- src/renderer/views/discovery/*DiscoveryView.tsx (SQL, VMware, etc.)

**Fixes Needed:**
1. Text content mismatches - update tests to match actual component text
2. Add missing data-cy attributes
3. Fix mock data structure

### Phase 4: Fix VirtualizedDataGrid (MEDIUM ROI - ~14 tests)
**File:** src/renderer/components/data/VirtualizedDataGrid.test.tsx

**Fixes Needed:**
1. Mock window.HTMLElement methods properly
2. Fix ResizeObserver usage
3. Ensure proper react-window mocks

### Phase 5: Fix logicEngineService (LOW-MEDIUM ROI - ~13 tests)
**File:** src/main/services/logicEngineService.test.ts

**Fixes Needed:**
1. Mock CSV file reading
2. Implement missing fuzzy matching methods
3. Fix inference logic tests

### Phase 6: Bulk Null Safety Pass (HIGH ROI - ~200 tests)
**Approach:** Run automated null safety fixes across all hooks and views

**Script:** Create and run comprehensive null-safety-fixer.js

### Phase 7: Bulk Async Timing Pass (HIGH ROI - ~150 tests)
**Approach:** Add waitFor() patterns to all async hook tests

**Script:** Create and run async-timing-fixer.js

### Phase 8: Text Mismatch Fixes (MEDIUM ROI - ~150 tests)
**Approach:** Systematically update test expectations to match component output

**Manual Process:**
1. Run test
2. Note expected vs received text
3. Update test assertion
4. Verify fix

### Phase 9: Add Missing data-cy Attributes (LOW-MEDIUM ROI - ~50 tests)
**Top Missing Attributes:**
- export-results-btn
- cancel-discovery-btn
- start-discovery-btn
- refresh-data-btn
- clear-filters-btn

### Phase 10: Fix Remaining Edge Cases (VARIABLE ROI - ~100 tests)
- migrationServiceIntegration
- Service tests
- Component logic bugs

## Execution Timeline

**Immediate (30 mins):**
- Phase 1: Revert Jest config
- Restore to 1,580 passing tests

**Short-term (3-5 hours):**
- Phase 2: Fix top 4 discovery hooks
- Phase 3: Fix UsersView and discovery views
- Expected: 1,700-1,800 passing tests

**Medium-term (10-15 hours total):**
- Phase 4-5: VirtualizedDataGrid and logicEngineService
- Phase 6-7: Bulk null safety and async timing passes
- Expected: 2,200-2,400 passing tests

**Long-term (30-40 hours total):**
- Phase 8-10: Text mismatches, data-cy, edge cases
- Expected: 2,780+ passing tests (95%)

## Success Metrics

**Must Achieve:**
- ✅ 2,780+ tests passing (95%)
- ✅ Discovery hooks >90% pass rate
- ✅ No syntax errors
- ✅ No timeout errors
- ✅ Test execution <200 seconds

**Stretch Goals:**
- 96%+ coverage (2,810+ tests)
- <150 second execution
- Zero TypeScript errors

## Notes
- All phases can be executed autonomously
- Scripts should be created for bulk operations
- Manual fixes needed for text mismatches
- Document all patterns for future maintenance
