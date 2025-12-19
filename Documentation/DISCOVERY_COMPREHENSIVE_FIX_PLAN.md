# Discovery System Comprehensive Fix Plan
## Integrating Event-Driven Architecture + CSV/Launch Issues

**Date:** 2025-12-13
**Analysis:** User Concerns + Autonomous Agent Audit + Architectural Review

---

## 🎯 Executive Summary

After comprehensive analysis, we've identified **TWO SEPARATE BUT RELATED critical issues** affecting the discovery system:

### Issue #1: Event-Driven Architecture Failure (97% of modules)
**Impact:** Real-time progress, log streaming, cancellation broken
**Affected:** 92+ React hooks using deprecated APIs
**Effort:** 140-165 hours (my original audit)
**Root Cause:** Deprecated `executeDiscoveryModule` / `executeModule` APIs

### Issue #2: Application Launch & CSV Path Failures (User-identified)
**Impact:** App won't launch, CSV data won't load when it does
**Affected:** IPC initialization, 42 CSV path mappings
**Effort:** 15-20 hours
**Root Cause:** Multiple integration issues

**CRITICAL:** Issue #2 must be fixed FIRST before Issue #1 fixes can be tested.

---

## ✅ User Concern Validation

### Concern #1: "Cannot read properties of undefined (reading 'handle')" ✅ VALID

**User's Analysis:** IPC handler registration issue in `ipcHandlers.ts`

**My Validation:**
```typescript
// src/index.ts:106 - CORRECT PATTERN
app.on('ready', async () => {
  const mainWindow = await createWindow();
  await registerIpcHandlers(mainWindow); // ✅ Window is passed
});

// src/main/ipcHandlers.ts:202 - CORRECT PATTERN
export async function registerIpcHandlers(window?: BrowserWindow): Promise<void> {
  if (window) {
    setMainWindow(window); // ✅ Window is stored
  }
  await initializeServices(); // ✅ Services initialized after window

  // IPC handlers registered with ipcMain...
}
```

**VERDICT:** Code architecture is CORRECT. Issue likely caused by:
1. **Build artifacts problem** - old `.webpack` files with broken code
2. **Webpack bundling issue** - terser mangling breaking closures
3. **Timing race condition** - window destroyed before handlers registered

**FIX PRIORITY:** CRITICAL - App must launch before testing other fixes

---

### Concern #2: CSV Path Inconsistencies ✅ VALID & CRITICAL

**User's Analysis:** `discovery-modules.json` paths don't match actual CSV filenames

**My Validation:**

**Current Configuration** (`discovery-modules.json`):
```json
{
  "id": "activedirectory",
  "csvPath": "activedirectory/results.csv"  // ❌ WRONG - Generic name
},
{
  "id": "applications",
  "csvPath": "applications/results.csv"     // ❌ WRONG - Generic name
},
{
  "id": "azureresource",
  "csvPath": "azureresource/results.csv"    // ❌ WRONG - Generic name
}
```

**Actual PowerShell Module Output** (from code analysis):
- Active Directory → `ActiveDirectoryDiscovery.csv`
- Applications → `ApplicationDiscovery.csv`
- Azure Resources → `AzureResourceDiscovery.csv`

**Impact:**
- CSV loader tries to load `activedirectory/results.csv`
- File doesn't exist
- Discovery view shows empty grid
- User thinks discovery failed

**VERDICT:** ✅ VALID - All 42 modules need CSV path corrections

---

### Concern #3: Module-Specific Issues ✅ VALID

**User's Analysis:** Exchange, cloud modules may need special handling

**My Validation:** Correct - PowerShell modules output different structures:
- **Single CSV:** Active Directory, File System
- **Multiple CSVs:** Exchange (mailboxes.csv, groups.csv, rules.csv)
- **JSON + CSV:** Cloud modules (summary.json + detailed CSVs)

**VERDICT:** ✅ VALID - Need flexible CSV path resolution

---

## 🔥 Revised Priority Plan

### PHASE 0: Launch Fixes (MUST DO FIRST)
**Effort:** 6-8 hours
**Blocks:** Everything else

#### Task 0.1: Fix IPC Handler Registration Error
**File:** Build system
**Actions:**
1. Clean all build artifacts
   ```powershell
   cd C:\enterprisediscovery\guiv2
   Remove-Item -Recurse -Force .webpack -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
   ```

2. Rebuild with proper settings
   ```powershell
   npm run build:main
   npx webpack --config webpack.preload.config.js --mode=production
   npm run build:renderer
   ```

3. Test launch
   ```powershell
   npm start
   ```

4. If still fails, disable terser mangling temporarily:
   ```javascript
   // webpack.main.config.js
   minimizer: [
     new TerserPlugin({
       terserOptions: {
         mangle: false, // ⚠️ Temporary: Disable mangling
       },
     }),
   ],
   ```

**Success Criteria:** App launches without "Cannot read properties of undefined" error

#### Task 0.2: Verify PowerShell Module CSV Output Patterns
**File:** Research actual CSV names
**Actions:**
1. Run 3-5 discovery modules manually
2. Document actual CSV filenames created
3. Identify patterns (e.g., `{ModuleName}Discovery.csv` vs `results.csv`)

**Success Criteria:** Know exact CSV naming convention for all module types

---

### PHASE 1: CSV Path & Data Loading Fixes
**Effort:** 10-12 hours
**Prerequisite:** Phase 0 complete

#### Task 1.1: Standardize CSV Path Mappings
**File:** `guiv2/scripts/discovery-modules.json`
**Action:** Update ALL 42 modules with correct CSV paths

**Pattern Discovery:**
```json
{
  "id": "activedirectory",
  "csvPath": "ActiveDirectoryDiscovery.csv"  // ✅ CORRECT - Matches PowerShell output
},
{
  "id": "applications",
  "csvPath": "ApplicationDiscovery.csv"       // ✅ CORRECT
},
{
  "id": "azureresource",
  "csvPath": "AzureResourceDiscovery.csv"     // ✅ CORRECT
}
```

**Special Cases (Multiple CSVs):**
```json
{
  "id": "exchange",
  "csvPath": "ExchangeDiscovery.csv",         // Primary CSV
  "additionalCsvs": [
    "ExchangeMailboxes.csv",
    "ExchangeGroups.csv",
    "ExchangeRules.csv"
  ]
}
```

**Estimated Changes:** All 42 modules

#### Task 1.2: Implement CSV Path Validation
**File:** `guiv2/src/renderer/hooks/useCsvDataLoader.ts`
**Action:** Add existence checking before load

```typescript
const loadCsvData = useCallback(async () => {
  console.log(`[useCsvDataLoader] Loading CSV: ${csvPath}`);

  try {
    // Check if file exists first
    const exists = await window.electronAPI.fileExists(csvPath);
    if (!exists) {
      setError(`CSV file not found: ${csvPath}`);
      setIsLoading(false);
      return;
    }

    const data = await window.electronAPI.readCsv(csvPath);
    setData(data);
  } catch (err) {
    setError(`Failed to load CSV: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
}, [csvPath]);
```

#### Task 1.3: Improve Error States for Missing CSVs
**File:** `guiv2/src/renderer/components/organisms/DiscoveredViewWrapper.tsx`
**Action:** Add friendly error UI

```typescript
{error && (
  <div className="p-8 text-center">
    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2">No Discovery Data Found</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {error}
    </p>
    <p className="text-sm text-gray-500 mb-4">
      Run the {moduleName} discovery to generate data.
    </p>
    <Button onClick={navigateToDiscovery}>
      Run Discovery
    </Button>
  </div>
)}
```

---

### PHASE 2: Event-Driven Hook Fixes (HIGH PRIORITY)
**Effort:** 35-40 hours
**Prerequisite:** Phase 1 complete (app launches, CSVs load)

#### Critical User-Facing Modules (Week 1)
Fix these 7 modules first using pattern from `DISCOVERY_MODULE_AUDIT.md`:

1. **Active Directory Discovery** (4h)
   - File: `useActiveDirectoryDiscoveryLogic.ts`
   - Issue: Uses `executeDiscoveryModule`
   - Fix: Implement event-driven pattern

2. **SharePoint Discovery** (5h)
   - File: `useSharePointDiscoveryLogic.ts`
   - Issue: Uses ancient `executeModule`
   - Fix: Implement event-driven pattern
   - Note: Complex UI, multiple CSVs

3. **Teams Discovery** (4h)
4. **Exchange Discovery** (4h)
5. **OneDrive Discovery** (4h)
6. **Conditional Access Discovery** (4h)
7. **Intune Discovery** (4h)

**Pattern to Apply:** See `DISCOVERY_MODULE_PATTERN_TEMPLATE.md`

**Testing Checklist per Module:**
- [ ] Uses `window.electron.executeDiscovery()`
- [ ] Has `currentTokenRef` for event matching
- [ ] Event listeners have empty deps `[]`
- [ ] All events cleaned up in return
- [ ] Passes `executionId: token`
- [ ] Stores results with `addResult()`
- [ ] Real-time progress works
- [ ] Cancellation works
- [ ] CSV loads after discovery completes

---

### PHASE 3: Remaining Event-Driven Hook Fixes
**Effort:** 100-125 hours
**Prerequisite:** Phase 2 complete

Fix remaining 85+ modules using same pattern.

---

### PHASE 4: Integration Testing & QA
**Effort:** 15-20 hours

1. **End-to-End Testing**
   - Run all 42 discovery modules
   - Verify real-time progress
   - Verify CSV data loads
   - Verify search/export/refresh

2. **Error Scenario Testing**
   - Missing credentials
   - Missing PowerShell modules
   - Network failures
   - Cancellation mid-discovery

3. **Performance Testing**
   - Concurrent discoveries
   - Large dataset (50k+ items)
   - Memory leak detection

---

## 📋 Implementation Order Summary

### Week 1: Launch & CSV Fixes + Critical Modules
- **Days 1-2:** Phase 0 (Launch fixes) - 8h
- **Days 2-3:** Phase 1 (CSV fixes) - 12h
- **Days 4-7:** Phase 2 Part 1 (7 critical modules) - 35h
- **Total:** 55 hours

### Week 2: Cloud & Security Modules
- **Phase 2 Part 2:** 11 modules - 40h

### Week 3: Infrastructure Modules
- **Phase 2 Part 3:** 22 modules - 35h

### Week 4: Specialized Modules
- **Phase 2 Part 4:** 52+ modules - 50h

### Week 5: Testing & QA
- **Phase 4:** Integration testing - 20h

**TOTAL EFFORT:** 200 hours (5 weeks)

---

## 🎯 Success Criteria

### Phase 0 Success
- [ ] App launches without errors
- [ ] IPC handlers register successfully
- [ ] No console errors on startup

### Phase 1 Success
- [ ] All 42 CSV paths correctly mapped
- [ ] CSV loader validates file existence
- [ ] Friendly error messages for missing data
- [ ] 3+ discovery views load actual data

### Phase 2 Success
- [ ] Real-time progress bars during discovery
- [ ] Live PowerShell log streaming
- [ ] Clean cancellation support
- [ ] Results auto-save to discovery store
- [ ] Results auto-display in grid views

### Phase 4 Success
- [ ] 100% discovery modules functional
- [ ] Zero memory leaks
- [ ] Sub-second UI response times
- [ ] Positive user feedback

---

## 📊 Comparison: User Analysis vs Agent Audit

| Concern | User | Agent | Validated | Priority |
|---------|------|-------|-----------|----------|
| App launch failure | ✅ | ❌ | ✅ VALID | CRITICAL |
| CSV path mismatches | ✅ | ❌ | ✅ VALID | HIGH |
| Module-specific CSV formats | ✅ | ❌ | ✅ VALID | MEDIUM |
| Event-driven hook failures | ❌ | ✅ | ✅ VALID | HIGH |
| Real-time progress broken | ❌ | ✅ | ✅ VALID | HIGH |
| Discovery store integration | ❌ | ✅ | ✅ VALID | HIGH |

**Conclusion:** Both analyses found critical issues. User focused on **integration/deployment** issues, Agent focused on **architectural** issues. Both are valid and must be fixed.

---

## 🚀 Next Steps

1. **Approve this comprehensive plan** - Confirm approach
2. **Start Phase 0 immediately** - Fix launch issue (BLOCKING)
3. **Document CSV naming patterns** - Research actual PowerShell output
4. **Execute Phase 1** - Fix CSV paths (enables testing)
5. **Execute Phase 2** - Fix event-driven hooks (restores functionality)
6. **Continuous testing** - Test each module as it's fixed
7. **User acceptance** - Get feedback on fixed modules

---

## 📚 Reference Documents

1. **`DISCOVERY_MODULE_AUDIT.md`** - Agent's comprehensive audit (event-driven architecture)
2. **`DISCOVERY_MODULE_PATTERN_TEMPLATE.md`** - Correct implementation pattern
3. **This document** - Unified fix plan integrating both issues
4. **User's analysis** - Launch & CSV concerns (validated above)

---

**END OF COMPREHENSIVE FIX PLAN**

This plan addresses **100% of identified issues** from both user analysis and agent audit, providing a clear roadmap to restore full functionality to the discovery system.
