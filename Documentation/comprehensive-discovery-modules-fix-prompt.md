# Comprehensive Discovery Modules Fix - Claude Code Agent Prompt

## EXECUTIVE SUMMARY

You are tasked with fixing **41+ failing discovery modules** in the Enterprise Discovery System. Only **2 modules work** (Azure Infrastructure and Applications), while **41+ fail** due to systematic issues.

**Current Status:**
- ✅ **Working:** Azure (11 rows), Applications (14 rows)
- ❌ **Failing:** 41+ modules with console errors and crashes
- 🔴 **Critical Issues:** `require is not defined`, `cacheService before initialization`, missing PowerShell modules

**Success Criteria:**
- ✅ **All 43 modules load without console errors**
- ✅ **All modules can start discovery process**
- ✅ **Progress tracking works for all modules**
- ✅ **CSV files created for successful discoveries**
- ✅ **No webpack crypto bundling errors**

---

## ROOT CAUSE ANALYSIS

### 1. BROWSER COMPATIBILITY ISSUE (Critical - Blocking)
**Error:** `ReferenceError: require is not defined`
**Affected:** Domain Discovery + potentially all modules
**Root Cause:** Node.js `crypto` module being bundled for browser

**Evidence:**
```
at 76982 (external node-commonjs "crypto":1:1)
at __webpack_require__ (bootstrap:19:1)
at 83318 (Checkbox.tsx:59:25)
```

**Fix Required:**
```javascript
// webpack.renderer.config.js
externals: {
  crypto: 'crypto', // Don't bundle crypto for browser
}
```

### 2. SERVICE INITIALIZATION ISSUES (Critical)
**Error:** `ReferenceError: Cannot access 'cacheService' before initialization`
**Affected:** 20+ discovery hooks
**Root Cause:** Services accessed before initialization in hooks

**Pattern:** Hooks trying to access services immediately on import
**Fix Required:** Implement lazy loading with `useEffect`

### 3. MISSING POWERSHELL MODULES (Critical)
**Error:** `Import-Module : The specified module 'X.psm1' was not loaded`
**Affected:** FileSystem, Network, Office365, Domain, etc.
**Root Cause:** 17+ PowerShell modules don't exist

**Missing Modules:**
- `DomainDiscovery.psm1`
- `FileSystemDiscovery.psm1`
- `NetworkDiscovery.psm1`
- `Office365Discovery.psm1`
- And 13 others...

### 4. EVENT-DRIVEN ARCHITECTURE INCONSISTENCY
**Issue:** Only Azure/Applications use proper event-driven pattern
**Affected:** All other hooks use deprecated synchronous patterns
**Fix Required:** Standardize all hooks to Azure/Applications pattern

---

## WORKING TEMPLATES (Reference Implementation)

### Azure Infrastructure Discovery (✅ WORKING)
**File:** `useAzureDiscoveryLogic.ts`
**Key Patterns:**
1. **Event-driven with refs:** `currentTokenRef` for event matching
2. **Empty dependency array:** `useEffect([], ...)` for event listeners
3. **Proper token management:** Token set before API call, used in events
4. **Progress tracking:** Real-time updates via `onDiscoveryProgress`

### Applications Discovery (✅ WORKING)
**File:** `useApplicationDiscoveryLogic.ts`
**Key Patterns:**
1. **Lazy service loading:** No immediate service access
2. **State management:** Proper error/success/progress states
3. **CSV data loading:** `useCsvDataLoader` hook integration
4. **Export functionality:** JSON export with proper MIME types

---

## IMPLEMENTATION PLAN

### PHASE 1: CRITICAL INFRASTRUCTURE FIXES (High Priority)

#### 1.1 Fix Webpack Crypto Bundling
**File:** `webpack.renderer.config.js`
**Action:** Add crypto to externals to prevent browser bundling

```javascript
module.exports = {
  // ... existing config
  externals: {
    crypto: 'crypto',
    // ... other externals
  },
};
```

#### 1.2 Implement Service Lazy Loading Pattern
**Files:** All discovery hooks with cacheService errors
**Pattern:** Replace immediate service access with useEffect

**BEFORE (Broken):**
```typescript
const cacheService = getCacheService(); // ❌ Fails on import
```

**AFTER (Fixed):**
```typescript
const [cacheService, setCacheService] = useState(null);

useEffect(() => {
  const service = getCacheService(); // ✅ Lazy load in useEffect
  setCacheService(service);
}, []);
```

### PHASE 2: STANDARDIZE EVENT-DRIVEN ARCHITECTURE (High Priority)

#### 2.1 Update All Hooks to Event-Driven Pattern
**Files:** All 41 failing discovery hooks
**Template:** Copy Azure/Applications pattern

**Required Changes:**
1. Add `useRef` import
2. Add `currentTokenRef = useRef<string | null>(null)`
3. Move event listeners to `useEffect([], ...)` with empty dependency array
4. Set token before API call: `currentTokenRef.current = token`
5. Use `window.electron.executeDiscovery()` instead of deprecated APIs

#### 2.2 Add Progress Tracking
**Files:** All discovery hooks
**Pattern:** Implement `onDiscoveryProgress` event handling

### PHASE 3: CREATE MISSING POWERSHELL MODULES (Medium Priority)

#### 3.1 Create Core Discovery Modules
**Files:** 17 missing .psm1 files in `Modules/Discovery/`
**Template:** Use existing working modules as reference

**Required Modules:**
```powershell
# DomainDiscovery.psm1
function Start-DomainDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DomainController,

        [Parameter(Mandatory=$false)]
        [string]$SearchBase,

        [Parameter(Mandatory=$false)]
        [int]$MaxResults = 10000,

        [Parameter(Mandatory=$false)]
        [bool]$IncludeUsers = $true,

        [Parameter(Mandatory=$false)]
        [bool]$IncludeGroups = $true,

        [Parameter(Mandatory=$false)]
        [bool]$IncludeComputers = $true,

        [Parameter(Mandatory=$false)]
        [bool]$IncludeOUs = $true
    )

    # Implementation here
    # Return structured data matching expected format
}
```

#### 3.2 Implement CSV Output
**Files:** All PowerShell modules
**Pattern:** Write results to CSV files in `C:\DiscoveryData\{CompanyName}\Raw\`

### PHASE 4: FIX VIEW COMPONENTS (Low Priority)

#### 4.1 Add Null Safety
**Files:** All discovery view components
**Pattern:** Add null checks for undefined properties

**BEFORE (Broken):**
```typescript
{result.averageMembersPerTeam} // ❌ Crashes if undefined
```

**AFTER (Fixed):**
```typescript
{result?.averageMembersPerTeam ?? 0} // ✅ Safe access
```

#### 4.2 Fix Export Name Mismatches
**Files:** Views with import/export mismatches
**Pattern:** Update imports to match actual exports

---

## FILE-BY-FILE FIXES

### Webpack Configuration
**File:** `webpack.renderer.config.js`
- Add `crypto: 'crypto'` to externals

### Hook Files (26 files to update)
**Pattern:** Standardize all hooks to Azure/Applications pattern

1. `useActiveDirectoryDiscoveryLogic.ts` ✅ (already updated)
2. `useAWSCloudInfrastructureDiscoveryLogic.ts`
3. `useAzureDiscoveryLogic.ts` ✅ (working template)
4. `useBackupRecoveryDiscoveryLogic.ts`
5. `useCertificateAuthorityDiscoveryLogic.ts`
6. `useCertificateDiscoveryLogic.ts`
7. `useConditionalAccessDiscoveryLogic.ts`
8. `useDataClassificationDiscoveryLogic.ts`
9. `useDatabaseSchemaDiscoveryLogic.ts`
10. `useDataLossPreventionDiscoveryLogic.ts`
11. `useDNSDHCPDiscoveryLogic.ts`
12. `useDomainDiscoveryLogic.ts`
13. `useEntraIDAppDiscoveryLogic.ts`
14. `useEnvironmentDetectionLogic.ts`
15. `useExternalIdentityDiscoveryLogic.ts`
16. `useFileServerDiscoveryLogic.ts`
17. `useFileSystemDiscoveryLogic.ts`
18. `useGoogleWorkspaceDiscoveryLogic.ts`
19. `useGPODiscoveryLogic.ts`
20. `useHyperVDiscoveryLogic.ts`
21. `useIntuneDiscoveryLogic.ts`
22. `useLicensingDiscoveryLogic.ts`
23. `useNetworkDiscoveryLogic.ts`
24. `useOffice365DiscoveryLogic.ts`
25. `useOneDriveDiscoveryLogic.ts`
26. `useSharePointDiscoveryLogic.ts`
27. `useTeamsDiscoveryLogic.ts`
28. `useVirtualizationDiscoveryLogic.ts`
29. `useVMwareDiscoveryLogic.ts`
30. `useWebServerDiscoveryLogic.ts`

### PowerShell Modules (17 files to create)
**Location:** `Modules/Discovery/`

1. `DomainDiscovery.psm1`
2. `FileSystemDiscovery.psm1`
3. `NetworkDiscovery.psm1`
4. `Office365Discovery.psm1`
5. `BackupRecoveryDiscovery.psm1`
6. `CertificateAuthorityDiscovery.psm1`
7. `CertificateDiscovery.psm1`
8. `DatabaseSchemaDiscovery.psm1`
9. `DataClassificationDiscovery.psm1`
10. `DNSDHCPDiscovery.psm1`
11. `EnvironmentDetectionDiscovery.psm1`
12. `ExternalIdentityDiscovery.psm1`
13. `FileServerDiscovery.psm1`
14. `GPODiscovery.psm1`
15. `InfrastructureDiscovery.psm1`
16. `NetworkInfrastructureDiscovery.psm1`
17. `PhysicalServerDiscovery.psm1`
18. `PrinterDiscovery.psm1`
19. `ScheduledTaskDiscovery.psm1`
20. `StorageArrayDiscovery.psm1`
21. `VirtualizationDiscovery.psm1`
22. `WebServerConfigDiscovery.psm1`

### View Components (Multiple files)
**Pattern:** Add null safety and fix imports

---

## TESTING STRATEGY

### Automated Testing
```bash
# Build all bundles
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# Start application
npm start
```

### Manual Testing (Per Module)
1. **Navigate to module** in discovery section
2. **Click "Start Discovery"** with default settings
3. **Verify no console errors** appear
4. **Check progress updates** work
5. **Verify CSV file creation** in `C:\DiscoveryData\{CompanyName}\Raw\`
6. **Test export functionality**

### Success Metrics
- ✅ **0 "require is not defined" errors**
- ✅ **0 "cacheService before initialization" errors**
- ✅ **All modules load without crashes**
- ✅ **Progress bars animate during discovery**
- ✅ **CSV files created for each successful discovery**
- ✅ **Export functionality works**

---

## EXECUTION PHASES

### Phase 1: Critical Fixes (Day 1)
1. Fix webpack crypto externals
2. Implement lazy service loading in all hooks
3. Update 5-10 hooks to event-driven pattern

### Phase 2: Hook Standardization (Day 2-3)
1. Update remaining hooks to event-driven pattern
2. Add progress tracking to all hooks
3. Test each hook individually

### Phase 3: PowerShell Modules (Day 4-5)
1. Create missing .psm1 files (17 modules)
2. Implement basic discovery logic
3. Add CSV output functionality

### Phase 4: Integration Testing (Day 6)
1. Full application testing
2. Performance optimization
3. Error handling improvements

---

## REFERENCE IMPLEMENTATIONS

### Working Hook Pattern (Azure)
```typescript
// ✅ CORRECT: Event-driven with proper token management
const currentTokenRef = useRef<string | null>(null);

useEffect(() => {
  const unsubscribe = window.electron.onDiscoveryComplete((data) => {
    if (data.executionId === currentTokenRef.current) {
      // Handle completion
    }
  });
  return () => unsubscribe();
}, []); // ✅ Empty dependency array

const startDiscovery = async () => {
  const token = `azure-discovery-${Date.now()}`;
  currentTokenRef.current = token; // Set BEFORE API call

  await window.electron.executeDiscovery({
    moduleName: 'Azure',
    parameters: { ... },
    executionId: token, // Pass token
  });
};
```

### Broken Hook Pattern (Most Current Hooks)
```typescript
// ❌ BROKEN: Synchronous pattern, no event handling
const startDiscovery = async () => {
  const result = await window.electron.executeModule({ // Deprecated API
    modulePath: 'Modules/Discovery/Azure.psm1',
    functionName: 'Start-AzureDiscovery',
    parameters: { ... },
  });

  if (result.success) {
    setResults(result.data);
  }
};
```

---

## FINAL VALIDATION

After all fixes are complete, run:
```bash
npm run build    # Full build test
npm run test     # All tests pass
npm start        # Launch and test all modules
```

**Expected Result:**
- All 43 discovery modules load without errors
- All modules can start discovery process
- Progress tracking works for all modules
- CSV files are created for successful discoveries
- No console errors or crashes

---

## DEPLOYMENT INSTRUCTIONS

After making changes, deploy to production:
```powershell
# Copy updated files
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\*' -Destination 'C:\enterprisediscovery\guiv2\src\' -Recurse -Force

# Rebuild all bundles
cd C:\enterprisediscovery\guiv2
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# Launch
npm start
```

This comprehensive fix plan addresses all identified issues and will restore full functionality to all 43 discovery modules in the Enterprise Discovery System.</content>
</xai:function_call"> 

<xai:function_call name="update_todo_list">
<parameter name="todos">["Analyze current console dump and identify failing modules","Test Azure Infrastructure module (working template)","Test Applications module (working template)","Test all remaining discovery modules systematically","Document which modules fail and why","Create comprehensive fix plan for each failing module","Verify previous fixes were implemented correctly","Generate Claude Code prompt for all fixes"]