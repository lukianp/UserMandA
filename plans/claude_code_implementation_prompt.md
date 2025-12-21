# COMPREHENSIVE DIAGNOSTIC FIXES IMPLEMENTATION PROMPT

## EXECUTION CONTEXT
You are Claude Code, an expert software architect specializing in Electron, React, Node.js, PowerShell, Azure AD, Graph API, and secure credential management. You have access to advanced code analysis tools and must implement fixes safely and systematically.

## CRITICAL SAFETY PROTOCOLS
- **NEVER** execute code that could break the application
- **ALWAYS** read the full file before making changes
- **ALWAYS** verify TypeScript compilation after changes
- **ALWAYS** test accessibility compliance after ARIA changes
- **ALWAYS** update the work tracker file after each modification
- **ALWAYS** build and test in the deployment directory (C:\enterprisediscovery\guiv2)
- **NEVER** make assumptions about code structure - read and analyze first

## ADDITIONAL SAFETY MEASURES

### File Backup Protocol
**Before ANY modification:**
```powershell
# Create timestamped backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item -Path "C:\enterprisediscovery\guiv2\src\renderer\components\atoms\Button.tsx" -Destination "C:\enterprisediscovery\backups\Button.tsx_$timestamp.bak" -Force
```

### Pre-Change Validation
- [ ] Confirm file is not locked by another process
- [ ] Verify git status is clean (or commit current state)
- [ ] Check for any pending changes in work tracker
- [ ] Ensure deployment directory is in sync

### Post-Change Validation
- [ ] TypeScript compilation passes: `npx tsc --noEmit`
- [ ] ESLint passes: `npx eslint . --max-warnings 0`
- [ ] Bundle analysis shows no significant size increase
- [ ] Security audit passes: `npm audit`
- [ ] Performance benchmarks remain within acceptable ranges

### Emergency Recovery
**If build fails after change:**
1. Immediately restore from backup
2. Analyze error logs for root cause
3. Consult existing patterns in codebase
4. Implement more conservative fix
5. Test incrementally

### Security Validation
- [ ] No new security vulnerabilities introduced
- [ ] Electron security boundaries maintained
- [ ] No exposure of sensitive data in renderer process
- [ ] Proper input sanitization in place
- [ ] CORS policies not violated

## WORKSPACE SYNCHRONIZATION PROTOCOL
```powershell
# BEFORE starting work
Copy-Item -Path "D:\Scripts\UserMandA\guiv2\src\*" -Destination "C:\enterprisediscovery\guiv2\src\" -Recurse -Force
Copy-Item -Path "D:\Scripts\UserMandA\Modules\*" -Destination "C:\enterprisediscovery\Modules\" -Recurse -Force

# AFTER each change, build and test
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path '.webpack') { Remove-Item -Recurse -Force '.webpack' }
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer
npm start

# AFTER successful test, sync back
Copy-Item -Path "C:\enterprisediscovery\guiv2\src\*" -Destination "D:\Scripts\UserMandA\guiv2\src\" -Recurse -Force
Copy-Item -Path "C:\enterprisediscovery\Modules\*" -Destination "D:\Scripts\UserMandA\Modules\" -Recurse -Force
```

## DIAGNOSTIC ERRORS TO FIX (PRIORITY ORDER)

### 1. ARIA ATTRIBUTE VALIDATION ERRORS (Button.tsx)

**File:** `guiv2/src/renderer/components/atoms/Button.tsx`
**Lines:** 157 (aria-busy, aria-disabled, aria-pressed)
**Error:** Invalid ARIA attribute values: aria-busy="{expression}", aria-disabled="{expression}", aria-pressed="{expression}"

**ROOT CAUSE:** React expressions in ARIA attributes are not valid - ARIA attributes must be strings or undefined.

**FIX IMPLEMENTATION:**
```typescript
// BEFORE (INVALID)
<button
  aria-busy={isLoading ? "true" : "false"}
  aria-disabled={disabled ? "true" : "false"}
  aria-pressed={pressed ? "true" : "false"}
>

// AFTER (VALID)
<button
  aria-busy={isLoading ? "true" : undefined}
  aria-disabled={disabled ? "true" : undefined}
  aria-pressed={pressed ? "true" : undefined}
>
```

**VERIFICATION:** Use axe-core or similar accessibility testing tool to confirm ARIA attributes are valid.

### 2. INLINE STYLES VIOLATIONS (Multiple Files)

**Files:**
- `guiv2/src/renderer/components/atoms/Button.tsx` (line 176)
- `guiv2/src/renderer/views/discovery/ExternalIdentityDiscoveryView.tsx` (line 365)
- `guiv2/src/renderer/views/discovery/GraphDiscoveryView.tsx` (line 355)
- `guiv2/src/renderer/components/atoms/Skeleton.tsx` (lines 94, 111)
- `guiv2/src/renderer/components/organisms/VirtualizedDataGrid.tsx` (line 699)
- `guiv2/src/renderer/views/discovery/EntraIDAppDiscoveryView.tsx` (line 417)

**Error:** CSS inline styles should not be used, move styles to an external CSS file

**FIX STRATEGY:**
1. Create CSS module files for each component
2. Move inline styles to CSS classes
3. Import and apply CSS classes

**EXAMPLE IMPLEMENTATION:**
```typescript
// Button.module.css
.button {
  /* Move all inline styles here */
}

// Button.tsx
import styles from './Button.module.css';

<button
  className={styles.button}
  // Remove style prop
>
```

### 3. TYPESCRIPT TYPE ERRORS (Discovery Hooks & Views)

**File:** `guiv2/src/renderer/hooks/useExternalIdentityDiscoveryLogic.ts`
**Line:** 330
**Error:** Property 'searchText' is missing in type '{}' but required in type 'FilterState'.

**ROOT CAUSE:** FilterState interface requires searchText property but it's not being provided.

**FIX:**
```typescript
// Read the FilterState interface first
interface FilterState {
  searchText: string;
  // other properties
}

// Then fix the usage
const filter: FilterState = {
  searchText: '', // Add this required property
  // other properties
};
```

**File:** `guiv2/src/renderer/views/discovery/ExternalIdentityDiscoveryView.tsx`
**Lines:** 356, 367, 369, 373
**Error:** Operator '>' cannot be applied to types 'string | number | boolean' and 'number'
**Error:** 'count' is of type 'unknown'

**ROOT CAUSE:** Type assertions needed for unknown types from data sources.

**FIX:**
```typescript
// BEFORE (INVALID)
const count = data.count;
if (count > 0) { // Type error

// AFTER (VALID)
const count = data.count as number;
if (count > 0) { // Valid
```

**Same pattern for GraphDiscoveryView.tsx**

### 4. MISSING MODULE DEPENDENCY

**File:** `guiv2/src/test-utils/testHelpers.tsx`
**Line:** 9
**Error:** Cannot find module '@tanstack/react-query' or its corresponding type declarations.

**FIX:**
```bash
# Install the missing dependency
npm install @tanstack/react-query
npm install --save-dev @types/react-query # if types are separate
```

### 5. IMPORT ORDER VIOLATION

**File:** `guiv2/webpack.renderer.config.js`
**Line:** 1
**Error:** There should be at least one empty line between import groups

**FIX:**
```javascript
// BEFORE
const path = require('path');
const webpack = require('webpack');

// AFTER
const path = require('path');

const webpack = require('webpack');
```

### 6. MARKDOWN LINTING ISSUES

**Files:** `.ai-work-tracker.md`, `Documentation/claude.local.md`
**Errors:** MD022 (blanks around headings), MD032 (blanks around lists), MD031 (blanks around code fences), MD029 (ordered list prefixes), MD025 (multiple H1), MD040 (code language), MD034 (bare URLs), MD056 (table column count), MD060 (table formatting)

**FIX STRATEGY:**
1. Add blank lines around headings
2. Add blank lines around lists
3. Add blank lines around code fences
4. Fix ordered list numbering
5. Ensure single H1 per document
6. Specify language for code blocks
7. Use proper link syntax for URLs
8. Fix table formatting

### 7. UNUSED VARIABLE

**File:** `Modules/Discovery/AzureResourceDiscovery.psm1`
**Line:** 152
**Error:** The variable 'graphContext' is assigned but never used.

**FIX:**
```powershell
# Either use the variable or remove the assignment
# If not needed, remove:
# $graphContext = ...

# If needed, use it:
# $graphContext | Out-Null  # or actual usage
```

## IMPLEMENTATION SEQUENCE (EXECUTE IN ORDER)

1. **Start with TypeScript errors** (most critical for compilation)
2. **Fix ARIA accessibility issues** (user-facing impact)
3. **Address inline styles** (code quality)
4. **Fix missing dependencies**
5. **Clean up import order**
6. **Fix markdown formatting** (documentation quality)
7. **Remove unused variables**

## VERIFICATION PROTOCOLS

**After each fix:**
1. Run TypeScript compilation: `npx tsc --noEmit`
2. Run ESLint: `npx eslint .`
3. Build the application (all 3 bundles)
4. Launch and test basic functionality
5. Run accessibility testing if ARIA changes made

**Final verification:**
1. All TypeScript errors resolved
2. All ESLint warnings fixed
3. Application builds successfully
4. Application launches without errors
5. Basic discovery functionality works

## ERROR HANDLING

If any fix causes build failures:
1. Revert the change immediately
2. Analyze the error message carefully
3. Consult the existing codebase patterns
4. Implement a more conservative fix
5. Test again before proceeding

## WORK TRACKER UPDATES

**Update `.ai-work-tracker.md` after each successful fix:**

```markdown
## Files Modified This Session
- ✅ guiv2/src/renderer/components/atoms/Button.tsx - Fixed ARIA attributes (lines 157)
- ✅ guiv2/src/renderer/hooks/useExternalIdentityDiscoveryLogic.ts - Added searchText property (line 330)
- ✅ [Continue for each fix]
```

## DEPLOYMENT TESTING

**Test each major change by:**
1. Building in deployment directory
2. Launching the application
3. Testing affected functionality
4. Verifying no regressions
5. Updating work tracker with results

## COMPLETION CRITERIA

- [ ] All TypeScript compilation errors resolved
- [ ] All ESLint warnings fixed
- [ ] All accessibility violations fixed
- [ ] Application builds successfully (3 bundles)
- [ ] Application launches and runs basic functions
- [ ] All diagnostic errors from the original list addressed
- [ ] Work tracker updated with all changes
- [ ] Files synchronized between workspace and deployment

## EMERGENCY ROLLBACK

If critical functionality breaks:
```powershell
# Restore from backup
Copy-Item -Path "D:\Scripts\UserMandA\backup\*" -Destination "C:\enterprisediscovery\" -Recurse -Force
```

---

**EXECUTE THIS PLAN METHODICALLY. DO NOT RUSH. VERIFY EACH STEP.**