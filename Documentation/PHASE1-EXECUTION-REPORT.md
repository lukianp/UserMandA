# Phase 1 Execution Report: Test Coverage Improvement

## Executive Summary

**Objective:** Improve test coverage from 54% to 95% (2,937+ passing tests)
**Current Status:** 1,696 / 3,136 tests passing (54.1%)
**Target:** 2,937 tests (95%)
**Gap:** 1,241 tests remaining

**Approach Taken:** Bulk automated transformations to fix common patterns
**Result:** Multiple attempted strategies reverted due to negative or minimal impact

## Strategies Attempted

### Strategy 1: Add data-cy and data-testid Attributes
**Hypothesis:** Tests fail due to missing test selectors in components
**Actions:**
- Created `add-missing-data-cy.js` script
- Added data-cy attributes to 20 discovery view files (36 changes)
- Created `add-data-testid-to-existing.js` script
- Added 298 data-testid attributes across discovery views

**Result:**
- Test count dropped from 3,136 to 3,031 (-105 tests)
- Passing tests dropped from 1,724 to 1,701 (-23 tests)
- **Reverted:** Introduced syntax errors or broke test compatibility

### Strategy 2: Fix Test Mock Mismatches
**Hypothesis:** Tests fail because mocks use `isRunning` while components use `isDiscovering`
**Actions:**
- Created `fix-test-mock-mismatches.js` script
- Replaced 147 occurrences of `isRunning` with `isDiscovering`
- Changed `getByTestId` to `queryByTestId` for cancel button checks

**Result:**
- Passing tests dropped from 1,730 to 1,715 (-15 tests)
- **Reverted:** Breaking more tests than fixing

### Strategy 3: Manual Component Attribute Addition
**Hypothesis:** Surgical addition of missing attributes would be safer
**Actions:**
- Attempted manual edits to ActiveDirectoryDiscoveryView.tsx
- Multiple file lock errors due to concurrent script modifications

**Result:**
- **Abandoned:** File locking issues, unclear which changes were beneficial

## Key Learnings

### What Worked
1. **Hook tests are mostly passing:** useActiveDirectoryDiscoveryLogic shows 10/10 tests passing
2. **Limited scope testing:** Running individual test files shows manageable failure counts (e.g., Azure hook: 22/25 passing)
3. **Identified specific failure patterns:** 11 hook test files with failures, all discovery-related

### What Didn't Work
1. **Bulk transformations:** Automated regex-based changes introduce more problems than they solve
2. **Assumption-based fixes:** Without inspecting actual test failures, fixes are speculative
3. **Component modifications:** Risk breaking working tests when changing source components

### Root Causes Identified
1. **Mock/Component Mismatch:** Tests and components use different property names (`isRunning` vs `isDiscovering`)
2. **Selector Mismatch:** Tests use `data-testid` but components may use `data-cy` or neither
3. **Async Timing:** Some tests don't wait for async operations to complete
4. **Missing Test Data:** Mock data structures don't match component expectations
5. **Text Content Mismatches:** Components render different text than tests expect

## Recommended Next Steps

### HIGH ROI: Targeted Hook Test Fixes
**Impact:** +50-100 tests
**Effort:** 2-4 hours

Focus on 11 failing hook test files:
- useAzureDiscoveryLogic (3 failures out of 25)
- useExchangeDiscoveryLogic
- useDataLossPreventionDiscoveryLogic
- useIdentityGovernanceDiscoveryLogic
- usePowerPlatformDiscoveryLogic
- useWebServerDiscoveryLogic
- useGoogleWorkspaceDiscoveryLogic
- useAWSDiscoveryLogic
- useHyperVDiscoveryLogic
- useConditionalAccessDiscoveryLogic
- useOffice365DiscoveryLogic

**Approach:**
1. Run each test file individually
2. Read actual error messages
3. Apply surgical fix to specific test
4. Validate fix doesn't break others
5. Move to next test

### MEDIUM ROI: View Test Alignment
**Impact:** +100-200 tests
**Effort:** 4-8 hours

For each failing discovery view test:
1. Identify if component uses `isDiscovering` or `isRunning`
2. Update ONLY the test mock to match
3. Identify missing/incorrect selectors
4. Add ONLY to component OR update test query
5. Validate incrementally

### LOW ROI: Comprehensive Data-cy Addition
**Impact:** +30-50 tests
**Effort:** 2-3 hours

Only after view tests are stable:
1. Identify genuinely missing selectors
2. Add systematically with validation after each file
3. Use git to track and revert if needed

## Metrics

### Test Execution Performance
- **Baseline run time:** ~160 seconds
- **Test timeout:** 10,000ms per test
- **Total test count:** 3,136 tests
- **Test suites:** 149 total, 36 passing, 90 failing, 23 skipped

### Coverage by Category
Based on test name patterns:
- **Discovery Hooks:** 290 passing / 341 total (85%)
- **Discovery Views:** Unknown (need individual runs)
- **Services:** Unknown
- **Advanced Views:** Unknown
- **Other:** Unknown

## Conclusion

**Key Insight:** Bulk automated transformations are counterproductive. The path to 95% coverage requires:
1. Individual test file analysis
2. Surgical, targeted fixes
3. Incremental validation
4. Focus on highest-impact, lowest-risk changes first

**Recommended Pivot:** Abandon bulk scripts. Focus on manual, test-by-test fixing starting with hook tests that are closest to passing (e.g., Azure: 22/25 already passing).

**Estimated Path to 95%:**
- Phase 1 (Hooks): +50-100 tests (4-8 hours)
- Phase 2 (Views): +100-200 tests (8-16 hours)
- Phase 3 (Services): +50-100 tests (4-8 hours)
- Phase 4 (Edge Cases): +100-200 tests (8-16 hours)
- **Total:** 24-48 hours of focused, surgical fixing

**Current ROI:** Near zero. All bulk transformation attempts reverted.
**Recommended Approach:** Test-driven surgical fixes with continuous validation.
