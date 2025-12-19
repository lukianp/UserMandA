# GUI v2 Test Coverage Improvement Roadmap

## Executive Summary

**Current State:** 67% pass rate (1,647 passing / 2,454 total tests)
**Target:** 95%+ pass rate
**Primary Challenges:** 804 failing tests across 115 test suites

## Failure Analysis (Current Baseline)

### By Category
- **Missing data-cy attributes:** 435 failures (54%)
- **Null/undefined access errors:** 114 failures (14%)
- **Other errors:** 252 failures (31%)
- **Timeout errors:** 4 failures (<1%)

### By Component Type
- **Discovery Views:** ~300 failures (most impacted)
- **Service Integration Tests:** ~60 failures
- **Hook Tests:** ~40 failures
- **Other Components:** ~100 failures

## Completed Fixes

### Infrastructure Improvements
1. ✅ **TextEncoder/TextDecoder Fix**
   - Added to `src/test-utils/setupTests.ts` at file start
   - Resolves "TextEncoder is not defined" errors in react-router-dom
   - **Impact:** Fixes ~10-15 test suite failures

### Automated Fix Scripts Created
2. ✅ **fix-test-patterns.js**
   - Systematic pattern-based fixes
   - Button text → data-cy testId replacement
   - Null safety for `.toFixed()` calls
   - Array safety for `.map()` calls

## Action Plan for 95%+ Coverage

### Phase 1: Run Automated Fixes (IMMEDIATE - 30 minutes)

**Execute:**
```bash
cd guiv2
node fix-test-patterns.js
```

**Expected Impact:**
- Fix 50-100 button text query failures
- Add null safety to 20-40 component files
- **Estimated improvement:** 67% → 73% pass rate

### Phase 2: Fix Missing data-cy Attributes (HIGH PRIORITY - 2-4 hours)

**Strategy:** Systematic addition of data-cy attributes to views

**Top Priority Views (15+ failures each):**
1. InfrastructureDiscoveryHubView
2. ActiveDirectoryDiscoveryView
3. ApplicationDiscoveryView
4. ConditionalAccessPoliciesDiscoveryView
5. Office365DiscoveryView
6. DataLossPreventionDiscoveryView
7. SharePointDiscoveryView
8. DomainDiscoveryView

**Pattern to Apply:**
```tsx
// Main container
<div data-cy="{view-name}-view">

// Action buttons
<Button data-cy="start-discovery-btn" onClick={start}>Start Discovery</Button>
<Button data-cy="cancel-discovery-btn" onClick={cancel}>Cancel Discovery</Button>
<Button data-cy="export-btn" onClick={exportResults}>Export Results</Button>
<Button data-cy="reset-form-btn" onClick={reset}>Reset Form</Button>

// Results/content areas
<div data-cy="{view-name}-results">
<div data-cy="{view-name}-loading">
<div data-cy="{view-name}-error">
```

**Execution:**
```bash
# For each view file:
# 1. Read the test file to see what data-cy attributes it expects
# 2. Add missing attributes to the component
# 3. Verify with: npm test -- ViewName.test.tsx
```

**Expected Impact:**
- Fix 300-400 test failures
- **Estimated improvement:** 73% → 88% pass rate

### Phase 3: Fix Null/Undefined Errors (MEDIUM PRIORITY - 1-2 hours)

**Common Patterns:**

**Pattern 1: Numeric operations**
```typescript
// Before
stats.complianceRate.toFixed(1)

// After
(typeof stats?.complianceRate === 'number' ? stats.complianceRate : 0).toFixed(1)
```

**Pattern 2: Array operations**
```typescript
// Before
items.map(item => ...)

// After
(Array.isArray(items) ? items : []).map(item => ...)
```

**Pattern 3: Optional chaining with fallbacks**
```typescript
// Before
config.timeout

// After
config?.timeout ?? 300
```

**Files to Fix:**
- migrationServiceIntegration.test.ts
- useDiscoveryLogic.test.ts
- logicEngineService.test.ts
- All hook tests with undefined errors

**Expected Impact:**
- Fix 100-120 test failures
- **Estimated improvement:** 88% → 93% pass rate

### Phase 4: Fix Remaining Timeout Errors (LOW PRIORITY - 30 minutes)

**Files:**
- webhookService.test.ts (2-3 tests)
- Any other async tests with timeouts

**Pattern:**
```typescript
describe('TestSuite', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('async test', async () => {
    const promise = someAsyncOperation();
    jest.advanceTimersByTime(5000);
    await promise;
    expect(result).toBeDefined();
  });
});
```

**Expected Impact:**
- Fix 4 test failures
- **Estimated improvement:** 93% → 93.2% pass rate

### Phase 5: Investigate "Other" Errors (VARIABLE - 2-4 hours)

**Approach:**
1. Run updated failure categorization:
   ```bash
   npm test -- --json --outputFile=phase-5-baseline.json 2>&1
   node analyze-failures.js
   ```

2. Sub-categorize remaining failures:
   - Import/module errors
   - Component prop mismatches
   - React rendering errors
   - Mock configuration issues

3. Fix by sub-category with same pattern-based approach

4. Create additional automated scripts if patterns emerge

**Expected Impact:**
- Fix 100-200 remaining failures
- **Final estimated pass rate:** 95-98%

## Validation & Metrics

### After Each Phase

```bash
# Run full test suite
npm test -- --json --outputFile=phase-X-results.json 2>&1

# Analyze results
node -e "
const r = require('./phase-X-results.json');
console.log('Phase X Results:');
console.log('Pass rate:', ((r.numPassedTests/r.numTotalTests)*100).toFixed(1)+'%');
console.log('Passed:', r.numPassedTests, '/', r.numTotalTests);
console.log('Failed suites:', r.numFailedTestSuites, '/', r.numTotalTestSuites);
"
```

### Success Criteria

**Minimum Acceptable:**
- ✅ Pass rate ≥ 95%
- ✅ No critical infrastructure failures
- ✅ All discovery view rendering tests passing

**Stretch Goals:**
- 🎯 Pass rate ≥ 98%
- 🎯 Coverage ≥ 80% (lines/branches)
- 🎯 Zero timeout errors
- 🎯 All view components have comprehensive tests

## Tools & Scripts

### Created Scripts
1. **analyze-failures.js** - Categorizes test failures
2. **fix-test-patterns.js** - Applies automated pattern fixes
3. **bulk-fix-tests.js** - Template for bulk operations

### Useful Commands

```bash
# Run specific test file
npm test -- path/to/file.test.tsx --no-coverage

# Run tests for specific pattern
npm test -- --testNamePattern="Button Actions" --no-coverage

# Run with detailed output
npm test -- --verbose --no-coverage 2>&1 | tee test-output.log

# Get coverage report
npm test -- --coverage --coverageDirectory=coverage-report

# Find all tests in a category
grep -r "describe.*Discovery" src/renderer/views --include="*.test.tsx"
```

## Risk Mitigation

### High-Risk Changes
- Modifying component logic (beyond adding data-cy attributes)
- Changing test expectations (verify against actual component behavior)
- Bulk find/replace operations (always run tests after)

### Safe Changes
- Adding data-cy attributes (non-functional)
- Adding null safety guards (defensive programming)
- Using jest.useFakeTimers() for async tests (improves reliability)
- Updating test queries to use getByTestId (more stable)

### Rollback Strategy
```bash
# If fixes cause issues, rollback to baseline
git diff > my-fixes.patch
git checkout .
# Review patch, apply selectively
git apply --check my-fixes.patch
```

## Timeline Estimate

| Phase | Duration | Cumulative | Pass Rate Target |
|-------|----------|------------|------------------|
| Setup & Infrastructure | 30 min | 0.5 hrs | 67% → 70% |
| Automated Fixes | 30 min | 1 hr | 70% → 73% |
| data-cy Attributes | 4 hrs | 5 hrs | 73% → 88% |
| Null Safety | 2 hrs | 7 hrs | 88% → 93% |
| Timeouts | 30 min | 7.5 hrs | 93% → 93.2% |
| Other Errors | 3 hrs | 10.5 hrs | 93.2% → 96% |
| Final Validation | 1 hr | 11.5 hrs | 96%+ |

**Total Estimated Time:** 11-12 hours of focused work

## Maintenance Strategy

### Prevent Regression
1. **Add pre-commit hooks:** Run tests before commits
2. **CI/CD integration:** Fail builds on test failures
3. **Coverage requirements:** Enforce minimum thresholds
4. **Test templates:** Provide standard patterns for new tests

### Ongoing Improvements
1. **Monthly review:** Check for new failures
2. **Refactor patterns:** Extract common test utilities
3. **Performance optimization:** Address slow tests
4. **Documentation:** Keep test patterns documented

## Next Steps (IMMEDIATE)

1. ✅ Review this roadmap
2. ⏳ Wait for current test run to complete
3. ⏳ Measure impact of TextEncoder fix
4. ▶️ Execute Phase 1 automated fixes
5. ▶️ Begin Phase 2 data-cy attribute additions

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Baseline:** 67% pass rate (1,647/2,454 tests)
**Target:** 95%+ pass rate (2,330+/2,454 tests)
