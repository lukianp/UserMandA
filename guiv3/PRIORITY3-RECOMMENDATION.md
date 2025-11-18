# PRIORITY 3 RECOMMENDATION

## TL;DR - Choose Your Path

| Option | Impact | Effort | ROI | Recommendation |
|--------|--------|--------|-----|----------------|
| **D: Complete Category B Views** | +16-25 tests | 1-2 hrs | ⭐⭐⭐⭐⭐ | **START HERE** |
| **A: Component Testing** | +20-40 tests | 2-3 hrs | ⭐⭐⭐⭐ | Best overall value |
| **B: Migration Services** | +10-15 tests | 2-4 hrs | ⭐⭐⭐ | Highest business value |
| **C: Hook Implementation** | +30-60 tests | 4-8 hrs | ⭐⭐ | Highest effort |

---

## RECOMMENDED: Execute Options D → A

### Phase 1: Quick Wins (1-2 hours)
**Complete TeamsDiscoveryView and HyperVDiscoveryView to 100%**

#### Step-by-Step Execution

**1. Add Missing data-cy Attributes**

Create this script: `add-discovery-testids.ts`

```typescript
/**
 * Locations to add data-cy attributes in TeamsDiscoveryView.tsx
 */

// Line ~136: Cancel button (currently only in running state)
<Button
  data-cy="cancel-discovery-btn"  // ADD THIS
  variant="destructive"
  onClick={cancelDiscovery}
  disabled={isCancelling}
>
  {isCancelling ? 'Cancelling...' : 'Cancel Discovery'}
</Button>

// Line ~321: Export button (currently missing)
<Button
  data-cy="export-btn"  // ADD THIS
  variant="secondary"
  onClick={exportData}
  disabled={!result}
>
  Export Data
</Button>

// Line ~XXX: Clear logs button (find logs panel)
<Button
  data-cy="clear-logs-btn"  // ADD THIS
  variant="ghost"
  onClick={clearLogs}
>
  Clear Logs
</Button>

// Line ~XXX: Progress/loading overlay (find progress indicator)
<div
  data-cy="loading-overlay"  // ADD THIS
  className="loading-indicator"
>
  {progress && (
    <div className="progress-content">
      <span>{progress.message}</span>
      <span>{progress.percentage}%</span>
    </div>
  )}
</div>
```

**2. Validation Commands**

```bash
# After adding testids, run tests
cd guiv2/
npm test -- src/renderer/views/discovery/TeamsDiscoveryView.test.tsx --no-coverage

# Expected result: 19-21/21 passing (90-100%)

# Repeat for HyperVDiscoveryView
npm test -- src/renderer/views/discovery/HyperVDiscoveryView.test.tsx --no-coverage

# Expected result: 18-20/23 passing (78-87%)
```

**3. Success Criteria**
- ✅ TeamsDiscoveryView: 19+ tests passing
- ✅ HyperVDiscoveryView: 18+ tests passing
- ✅ Total improvement: +16-25 tests
- ✅ 3 gold-standard discovery views established

---

### Phase 2: Foundation Layer (2-3 hours)
**Component Testing for Organism/Molecule layers**

#### Discovery Commands

```bash
# Find organism components with test failures
cd guiv2/
npm test -- src/renderer/components/organisms/ --listTests 2>&1 | grep "\.test\."

# Examples you might find:
# - VirtualizedDataGrid.test.tsx (already identified with issues)
# - DataTable.test.tsx
# - FormBuilder.test.tsx
# - ModalDialog.test.tsx
# - Sidebar.test.tsx
```

#### Recommended Component Targets

**1. VirtualizedDataGrid** (from CLAUDE.local.md TASK 5)
```
Known Issues:
- Missing data-cy="grid-loading" attribute
- Performance threshold too strict (104ms > 100ms)

Expected Impact: +2-4 tests
Effort: 30 minutes
```

**2. Additional Organisms** (discover via listTests)
```
Strategy:
1. Run tests to identify failures
2. Read component to check data-cy coverage
3. Read test to understand expectations
4. Apply same pattern as IntuneDiscoveryView success
```

#### Execution Pattern

```bash
# For each component:
# 1. Identify failures
npm test -- src/renderer/components/organisms/[Component].test.tsx --verbose

# 2. Audit data-cy attributes
grep -n "data-cy" src/renderer/components/organisms/[Component].tsx

# 3. Compare with test expectations
grep -n "getByTestId\|queryByTestId" src/renderer/components/organisms/[Component].test.tsx

# 4. Add missing attributes or fix test assertions
# 5. Validate improvements
npm test -- src/renderer/components/organisms/[Component].test.tsx --no-coverage
```

---

## Alternative Paths (if Option D+A complete)

### Option B: Migration Services Integration

**When to choose**: If you need to validate critical business logic

**Command to start**:
```bash
cd guiv2/
npm test -- src/main/services/migrationServiceIntegration.test.ts --verbose 2>&1 | head -200
```

**Fix Pattern** (from CLAUDE.local.md):

```typescript
// Create complete mocks BEFORE test suite
jest.mock('../path/to/executionService', () => ({
  createMigrationJob: jest.fn().mockResolvedValue({
    id: 'job-12345',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  }),
  startJob: jest.fn().mockResolvedValue({
    id: 'job-12345',
    status: 'running',
    startedAt: new Date().toISOString(),
  }),
  monitorJob: jest.fn().mockResolvedValue({
    id: 'job-12345',
    status: 'completed',
    progress: 100,
  }),
}));

// Repeat for rollbackService, coexistenceService, cutoverService
```

**Expected Outcome**: All 4 service workflow test categories passing

---

### Option C: Hook Implementation

**When to choose**: If you want to unlock downstream view tests

**WARNING**: This requires IMPLEMENTING missing functionality, not just fixing tests

**Discovery Commands**:
```bash
# Find all discovery hooks
ls -la src/renderer/hooks/use*DiscoveryLogic.ts

# Check which have test files
ls -la src/renderer/hooks/use*DiscoveryLogic.test.ts

# Identify incomplete implementations
npm test -- src/renderer/hooks/ --listTests
```

**Implementation Strategy**:
1. Start with ONE hook (e.g., useExchangeDiscoveryLogic)
2. Read hook to understand current exports
3. Read component to understand required exports
4. Implement missing properties/methods
5. Create comprehensive hook tests
6. Validate downstream view tests now pass

**Expected Timeline**:
- First hook: 4-6 hours (learning curve)
- Additional hooks: 2-3 hours each
- Total for 5 hooks: 14-21 hours

**ROI Calculation**:
- Each completed hook unlocks: 1 view × 20-25 tests = 20-25 tests
- 5 hooks = 100-125 total tests
- But: High effort, requires architecture decisions

---

## Execution Checklist

### Before Starting
- [ ] Git status clean (commit or stash current work)
- [ ] Current test baseline established (`npm test --json --outputFile=baseline.json`)
- [ ] Node version matches .nvmrc
- [ ] Dependencies installed (`npm ci`)

### During Execution
- [ ] Run tests before changes (establish baseline)
- [ ] Make ONE change at a time
- [ ] Validate after EACH change
- [ ] Document unexpected findings
- [ ] Commit working increments

### After Completion
- [ ] Full test suite passes (`npm test --no-cache`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Coverage thresholds met (`npm test -- --coverage`)
- [ ] Changes documented in session notes
- [ ] Git commit with descriptive message

---

## Success Metrics (PRIORITY 3 Goals)

### Minimum Viable Success
```
✅ +10 tests passing
✅ 1 additional component/view at 100%
✅ No regressions introduced
✅ Technical debt documented
```

### Target Success
```
✅ +25-40 tests passing
✅ 2-3 components/views at 100%
✅ Reusable patterns established
✅ Test coverage > 97%
```

### Stretch Success
```
✅ +50+ tests passing
✅ All Category B views at 100%
✅ Migration services tests passing
✅ Test coverage > 98%
```

---

## Risk Mitigation

### Known Risks

**Risk 1: Test suite expansion**
- Symptom: Test count increases even without fixes
- Mitigation: Run full suite before starting, use test count from that baseline
- Example: TeamsDiscoveryView showed 12 tests initially, actually had 21

**Risk 2: Component implementation gaps**
- Symptom: Tests fail because feature doesn't exist
- Mitigation: Audit component render before fixing tests
- Example: Missing data-cy attributes can't be tested without adding them

**Risk 3: TypeScript compilation errors**
- Symptom: Test suite won't run due to TS errors
- Mitigation: Fix TS errors first, then run tests
- Example: ExchangeDiscoveryView had broken syntax from automated changes

**Risk 4: Mock implementation mismatches**
- Symptom: Tests fail because mocks don't match real service contracts
- Mitigation: Check actual service implementation before creating mocks
- Example: Migration services expected specific return object shapes

---

## Tools & Resources

### Created During PRIORITY 2
```
✅ batch-fix-discovery-tests.js - Automated pattern application
✅ priority2-analysis-and-pivot.md - Root cause analysis
✅ test-fixes-priority2-summary.md - 6-step fix pattern
✅ PRIORITY2-FINAL-REPORT.md - Complete session results
```

### Reference Implementations
```
✅ IntuneDiscoveryView - Gold standard for discovery views
✅ TeamsDiscoveryView - Partially complete, good reference
✅ src/tests/setupTests.ts - Global test configuration (from TASK 6)
```

### Commands Library

```bash
# Run specific test file
npm test -- path/to/test.tsx --no-coverage --verbose

# List all tests without running
npm test -- --listTests

# Run with coverage
npm test -- --coverage --coverageDirectory=coverage-report

# Run in watch mode (for active development)
npm test -- --watch path/to/test.tsx

# Run only failed tests from last run
npm test -- --onlyFailures

# Update snapshots (if using snapshot tests)
npm test -- -u

# Clear Jest cache (when weird errors occur)
npm test -- --clearCache
```

---

## Final Recommendation

### START WITH: Option D (Complete Category B Views)

**Why**:
1. ✅ Quickest path to visible results (1-2 hours)
2. ✅ Establishes 3 gold-standard discovery views
3. ✅ Builds confidence and momentum
4. ✅ Creates reusable patterns for similar views

**Then PROCEED TO: Option A (Component Testing)**

**Why**:
1. ✅ Foundation improvements benefit all features
2. ✅ Moderate effort with good ROI
3. ✅ Discover and fix reusable component issues
4. ✅ Likely to find more quick wins

**AVOID FOR NOW: Options B and C**

**Why**:
1. ⚠️  Higher effort relative to impact
2. ⚠️  Requires deeper architectural knowledge
3. ⚠️  Better suited for later sessions with more context
4. ⚠️  Can pursue after Options D+A establish strong foundation

---

## How to Report Results

After completing PRIORITY 3, create `PRIORITY3-RESULTS.md` with:

```markdown
# PRIORITY 3 Results

## Test Improvements
- Before: X tests passing
- After: Y tests passing
- Delta: +Z tests

## Files Modified
- path/to/file1.tsx (added data-cy attributes)
- path/to/file2.test.tsx (fixed assertions)

## Components/Views at 100%
- ComponentName1: 15/15 passing
- ComponentName2: 23/23 passing

## Issues Discovered
- Issue 1 description
- Issue 2 description

## Recommendations for PRIORITY 4
- Next highest-value target
- Estimated effort and impact
```

---

## Questions to Answer

Before starting PRIORITY 3, decide:

1. **How much time do you have?**
   - <2 hours → Option D only
   - 2-4 hours → Option D + A
   - 4+ hours → Option D + A + B or C

2. **What's your priority?**
   - Quick wins → Option D
   - Foundation strength → Option A
   - Business logic validation → Option B
   - Unlock downstream tests → Option C

3. **What's your risk tolerance?**
   - Low (proven patterns) → Option D
   - Medium (exploration allowed) → Option A
   - High (implementation required) → Option C

**RECOMMENDED ANSWER**: 2-4 hours, quick wins + foundation, low-medium risk = **Option D + A**

---

## Ready to Execute?

Use this command to start:

```bash
# Phase 1: Quick Wins
cd D:\Scripts\UserMandA\guiv2

# Step 1: Establish baseline
npm test -- src/renderer/views/discovery/TeamsDiscoveryView.test.tsx --no-coverage 2>&1 | tee baseline-teams.log

# Step 2: Open component for editing
code src/renderer/views/discovery/TeamsDiscoveryView.tsx

# Step 3: Add missing data-cy attributes (see Phase 1 above)

# Step 4: Validate improvements
npm test -- src/renderer/views/discovery/TeamsDiscoveryView.test.tsx --no-coverage 2>&1 | tee after-teams.log

# Step 5: Repeat for HyperVDiscoveryView

# Phase 2: Component Testing
npm test -- src/renderer/components/organisms/ --listTests

# Choose highest-value component and repeat pattern
```

**Good luck! Return with your results for PRIORITY 4 planning.**
