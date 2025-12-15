# VSCode Errors Fix - Claude Code Agent Prompt

## EXECUTIVE SUMMARY

You are tasked with fixing **32 VSCode errors** across **16 files** in the Enterprise Discovery System. These errors include **accessibility violations** (axe rules), **TypeScript type mismatches**, and **property naming issues**.

**Error Breakdown:**
- **Accessibility Errors (axe):** 18 errors - Missing labels/titles, invalid ARIA, inline styles
- **TypeScript Errors:** 14 errors - Property mismatches, type incompatibilities, missing properties

**Success Criteria:**
- ✅ 0 VSCode errors remaining
- ✅ All accessibility violations resolved
- ✅ TypeScript compilation passes
- ✅ No breaking changes to functionality

---

## ERROR ANALYSIS & ROOT CAUSES

### 1. ACCESSIBILITY ERRORS (18 total)

#### Missing Button Titles (axe/name-role-value)
- **Files:** `AboutDialog.tsx:60`
- **Issue:** Button elements lack `title` attribute for screen readers
- **Fix:** Add `title` or `aria-label` attributes

#### Missing Select Labels (axe/forms/select-name)
- **Files:** `ActiveDirectoryDiscoveryView.tsx:61`, `ApplicationDiscoveryView.tsx:83`, `ExchangeDiscoveryView.tsx:91`, `Office365DiscoveryView.tsx:78`, `OneDriveDiscoveryView.tsx:78`, `SecurityInfrastructureDiscoveryView.tsx:87`, `SharePointDiscoveryView.tsx:87`
- **Issue:** Select elements without accessible names
- **Fix:** Add `aria-label` or associate with `<label>` elements

#### Missing Form Labels (axe/forms/label)
- **Files:** `SettingsView.tsx:136`, `SetupCompanyView.tsx:1043`
- **Issue:** Form inputs without labels or placeholders
- **Fix:** Add proper labels or `aria-label` attributes

#### Invalid ARIA Values (axe/aria/aria-valid-attr-value)
- **Files:** `OneDriveDiscoveryView.tsx:320,337,359,381`, `SecurityInfrastructureDiscoveryView.tsx:333,350,372,394,416`
- **Issue:** `aria-selected="{expression}"` uses literal string instead of boolean
- **Fix:** Convert to proper boolean values or remove invalid attributes

#### Inline Styles (no-inline-styles)
- **Files:** `AzureDiscoveryView.tsx:209`, `SetupCompanyView.tsx:276`
- **Issue:** CSS inline styles should be external
- **Fix:** Move styles to CSS classes or styled-components

### 2. TYPESCRIPT ERRORS (14 total)

#### Modal Property Errors (2353)
- **Files:** `useGroupsViewLogic.ts:201,213`, `useUsersViewLogic.ts:316,330`
- **Issue:** `component` and `props` properties don't exist in Modal type
- **Fix:** Remove invalid properties or update Modal interface

#### CompanyProfile Property Mismatch (2551)
- **Files:** `AzureDiscoveryView.tsx:89,91`
- **Issue:** `credentials` should be `credential` (singular)
- **Fix:** Change property name to match interface

#### Log Type Mismatch (2322)
- **Files:** `ApplicationDiscoveryView.tsx:388`
- **Issue:** `LogEntry[]` not assignable to `PowerShellLog[]`
- **Fix:** Update type definitions or convert data structure

#### Export Format Case Error (2820)
- **Files:** `TeamsDiscoveryView.tsx:321`
- **Issue:** `"CSV"` should be `"csv"` (lowercase)
- **Fix:** Change string literal to match type definition

#### Storage Statistics Property (2551)
- **Files:** `FileSystemDiscoveryView.tsx:283`
- **Issue:** `totalLargeFiles` doesn't exist, should be `totalFiles`
- **Fix:** Use correct property name

#### Void to ReactNode (2322)
- **Files:** `FileSystemDiscoveryView.tsx:332,348,363`
- **Issue:** Functions returning `void` assigned to ReactNode
- **Fix:** Return proper JSX elements or null

#### Index Signature Error (7053)
- **Files:** `WebServerConfigurationDiscoveryView.tsx:171`
- **Issue:** String indexing on Record type without index signature
- **Fix:** Add proper type assertion or update type definition

#### ScriptExecutionParams Property (2353)
- **Files:** `SetupAzurePrerequisitesView.tsx:679,700,768,850`
- **Issue:** `script` property doesn't exist in ScriptExecutionParams
- **Fix:** Remove invalid property or update interface

---

## IMPLEMENTATION PLAN

### PHASE 1: ACCESSIBILITY FIXES (High Priority)

#### 1.1 Button Accessibility
**File:** `guiv2/src/renderer/components/dialogs/AboutDialog.tsx`
```typescript
// BEFORE (line 60)
<button>Close</button>

// AFTER
<button title="Close dialog" aria-label="Close dialog">Close</button>
```

#### 1.2 Select Element Labels
**Files:** All discovery views with select elements
```typescript
// BEFORE
<select>...</select>

// AFTER
<label htmlFor="selectId" className="sr-only">Select option</label>
<select id="selectId" aria-label="Select option">...</select>
```

#### 1.3 Form Input Labels
**Files:** `SettingsView.tsx`, `SetupCompanyView.tsx`
```typescript
// BEFORE
<input type="text" />

// AFTER
<label htmlFor="inputId">Input Label</label>
<input id="inputId" type="text" aria-label="Input description" />
```

#### 1.4 ARIA Attribute Fixes
**Files:** `OneDriveDiscoveryView.tsx`, `SecurityInfrastructureDiscoveryView.tsx`
```typescript
// BEFORE
aria-selected="{expression}"

// AFTER
aria-selected={isSelected}
```

#### 1.5 Inline Style Removal
**Files:** `AzureDiscoveryView.tsx`, `SetupCompanyView.tsx`
```typescript
// BEFORE
<div style={{ marginTop: '10px' }}>

// AFTER
<div className="mt-2">
```

### PHASE 2: TYPESCRIPT TYPE FIXES (High Priority)

#### 2.1 Modal Interface Updates
**Files:** `useGroupsViewLogic.ts`, `useUsersViewLogic.ts`
```typescript
// BEFORE
{
  component: SomeComponent,
  props: { key: value }
}

// AFTER
{
  // Remove invalid properties or update Modal interface
}
```

#### 2.2 Property Name Corrections
**Files:** `AzureDiscoveryView.tsx`
```typescript
// BEFORE
profile.credentials

// AFTER
profile.credential
```

**Files:** `FileSystemDiscoveryView.tsx`
```typescript
// BEFORE
stats.totalLargeFiles

// AFTER
stats.totalFiles
```

#### 2.3 Type Conversions
**Files:** `ApplicationDiscoveryView.tsx`
```typescript
// BEFORE
logs: logEntries as LogEntry[]

// AFTER
logs: logEntries.map(entry => ({
  ...entry,
  level: entry.level as 'info' | 'success' | 'warning' | 'error'
})) as PowerShellLog[]
```

**Files:** `TeamsDiscoveryView.tsx`
```typescript
// BEFORE
format: "CSV"

// AFTER
format: "csv"
```

#### 2.4 Return Type Fixes
**Files:** `FileSystemDiscoveryView.tsx`
```typescript
// BEFORE
const renderFunction = () => {
  doSomething();
  // returns void
}

// AFTER
const renderFunction = () => {
  doSomething();
  return null; // or proper JSX
}
```

#### 2.5 Index Signature Fixes
**Files:** `WebServerConfigurationDiscoveryView.tsx`
```typescript
// BEFORE
record[key as string]

// AFTER
(record as Record<string, number>)[key]
```

#### 2.6 Interface Updates
**Files:** `SetupAzurePrerequisitesView.tsx`
```typescript
// BEFORE
{ script: scriptContent }

// AFTER
{ scriptContent } // or update ScriptExecutionParams interface
```

---

## EXECUTION PHASES

### Phase 1: Accessibility Fixes (18 errors)
1. Fix button titles in `AboutDialog.tsx`
2. Add labels to all select elements (7 files)
3. Add labels to form inputs (2 files)
4. Fix ARIA attributes (9 instances across 2 files)
5. Remove inline styles (2 files)

### Phase 2: TypeScript Fixes (14 errors)
1. Remove invalid Modal properties (4 instances)
2. Fix property names (3 instances)
3. Update type conversions (2 instances)
4. Fix return types (3 instances)
5. Add type assertions (1 instance)
6. Update interfaces or remove invalid properties (4 instances)

### Phase 3: Testing & Validation
1. Run TypeScript compilation: `npm run type-check`
2. Run accessibility tests: `npm run test:a11y`
3. Run linting: `npm run lint`
4. Manual testing of affected components

---

## SUCCESS METRICS

- ✅ **0 TypeScript errors** in all affected files
- ✅ **0 accessibility violations** in axe testing
- ✅ **Clean compilation** with `tsc --noEmit`
- ✅ **No runtime errors** in affected components
- ✅ **Maintained functionality** in all fixed components

---

## FILE-SPECIFIC FIXES

### AboutDialog.tsx
- **Line 60:** Add `title` and `aria-label` to button

### useGroupsViewLogic.ts
- **Lines 201,213:** Remove `component` and `props` properties from Modal object

### useUsersViewLogic.ts
- **Lines 316,330:** Remove `component` and `props` properties from Modal object

### ApplicationDiscoveryView.tsx
- **Line 83:** Add `aria-label` to select element
- **Line 388:** Convert `LogEntry[]` to `PowerShellLog[]` with proper type mapping

### AzureDiscoveryView.tsx
- **Lines 89,91:** Change `credentials` to `credential`
- **Line 209:** Move inline style to CSS class

### ExchangeDiscoveryView.tsx
- **Line 91:** Add `aria-label` to select element

### FileSystemDiscoveryView.tsx
- **Line 283:** Change `totalLargeFiles` to `totalFiles`
- **Lines 332,348,363:** Ensure functions return `ReactNode` (JSX or null)

### Office365DiscoveryView.tsx
- **Line 78:** Add `aria-label` to select element

### OneDriveDiscoveryView.tsx
- **Line 78:** Add `aria-label` to select element
- **Lines 320,337,359,381:** Fix `aria-selected` boolean values

### SecurityInfrastructureDiscoveryView.tsx
- **Line 87:** Add `aria-label` to select element
- **Lines 333,350,372,394,416:** Fix `aria-selected` boolean values

### SharePointDiscoveryView.tsx
- **Line 87:** Add `aria-label` to select element

### TeamsDiscoveryView.tsx
- **Line 321:** Change `"CSV"` to `"csv"`

### WebServerConfigurationDiscoveryView.tsx
- **Line 171:** Add type assertion for Record indexing

### SettingsView.tsx
- **Line 136:** Add label or `aria-label` to form input

### SetupAzurePrerequisitesView.tsx
- **Lines 679,700,768,850:** Remove `script` property or update interface

### SetupCompanyView.tsx
- **Line 1043:** Add label or `aria-label` to form input
- **Line 276:** Move inline style to CSS class

---

## TESTING STRATEGY

### Automated Testing
```bash
# TypeScript compilation
npm run type-check

# Linting
npm run lint

# Accessibility testing
npm run test:a11y

# Unit tests for affected components
npm run test -- --testPathPattern="(AboutDialog|GroupsViewLogic|UsersViewLogic|DiscoveryView)"
```

### Manual Testing
1. **Accessibility:** Use browser dev tools accessibility tab
2. **Functionality:** Test all form interactions and modal dialogs
3. **Visual:** Ensure no layout breaks from style changes

### Error Monitoring
- Watch for new TypeScript errors after fixes
- Monitor console for runtime errors
- Verify axe violations are resolved

---

## EXECUTION INSTRUCTIONS

Execute fixes in the following order:

1. **Start with accessibility fixes** (Phase 1) - These are user-facing and critical
2. **Move to TypeScript fixes** (Phase 2) - These prevent compilation errors
3. **Run comprehensive testing** (Phase 3) - Validate all fixes work correctly

For each file, make the minimal necessary changes to resolve the specific errors. When in doubt, prefer adding accessibility attributes over removing functionality.

**Priority Order:**
1. TypeScript compilation errors (blockers)
2. Accessibility violations (user experience)
3. Code quality improvements (linting)

---

## FINAL VALIDATION

After all fixes are complete, run:
```bash
npm run build    # Full build test
npm run test     # All tests pass
npm run lint     # No linting errors
```

The application should compile cleanly and pass all accessibility standards.