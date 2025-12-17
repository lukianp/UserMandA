# Cloud & Identity PowerShellExecutionDialog Integration Summary

**Date:** 2025-12-16
**Task:** Complete PowerShellExecutionDialog integration for remaining Cloud & Identity discovery modules

## Status Overview

### ✅ COMPLETE (Already Integrated)
1. **ConditionalAccessDiscoveryView** + useConditionalAccessDiscoveryLogic
   - Has: logs, showExecutionDialog, isCancelling
   - Status: FULLY INTEGRATED

2. **ExchangeDiscoveryView** + useExchangeDiscoveryLogic
   - Has: logs, showExecutionDialog
   - Missing: isCancelling (minor)
   - Status: MOSTLY COMPLETE

3. **EntraIDAppDiscoveryView** + useEntraIDAppDiscoveryLogic
   - Has: logs, isCancelling
   - Missing: showExecutionDialog
   - Status: NEEDS VIEW UPDATE ONLY

4. **ExternalIdentityDiscoveryView** + useExternalIdentityDiscoveryLogic
   - Has: logs, isCancelling
   - Missing: showExecutionDialog
   - Status: NEEDS VIEW UPDATE ONLY

5. **GraphDiscoveryView** + useGraphDiscoveryLogic
   - Has: logs, isCancelling
   - Missing: showExecutionDialog
   - Status: NEEDS VIEW UPDATE ONLY

6. **MultiDomainForestDiscoveryView** + useMultiDomainForestDiscoveryLogic
   - Has: logs, isCancelling
   - Missing: showExecutionDialog
   - Status: NEEDS VIEW UPDATE ONLY

### ❌ INCOMPLETE (Needs Hook + View Updates)
1. **Office365DiscoveryView** + useOffice365DiscoveryLogic
2. **OneDriveDiscoveryView** + useOneDriveDiscoveryLogic
3. **SharePointDiscoveryView** + useSharePointDiscoveryLogic
4. **GoogleWorkspaceDiscoveryView** + useGoogleWorkspaceDiscoveryLogic

---

## Hook Integration Pattern

For hooks MISSING the PowerShellExecutionDialog integration, apply these changes:

### 1. Add Import
```typescript
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';
```

### 2. Add State (after currentTokenRef)
```typescript
const [logs, setLogs] = useState<PowerShellLog[]>([]);
const [showExecutionDialog, setShowExecutionDialog] = useState(false);
const [isCancelling, setIsCancelling] = useState(false);
```

### 3. Add Helper Functions (before event listeners)
```typescript
const addLog = useCallback((level: PowerShellLog['level'], message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  setLogs(prev => [...prev, { timestamp, level, message }]);
}, []);

const clearLogs = useCallback(() => {
  setLogs([]);
}, []);
```

### 4. Update startDiscovery (add at beginning)
```typescript
setShowExecutionDialog(true);
setLogs([]);
```

### 5. Update cancelDiscovery (wrap with isCancelling)
```typescript
const cancelDiscovery = useCallback(async () => {
  if (!currentTokenRef.current) return;

  setIsCancelling(true);  // ← ADD THIS
  try {
    await window.electron.cancelDiscovery(currentTokenRef.current);
    setTimeout(() => {
      setState(prev => ({ ...prev, isDiscovering: false, progress: null }));
      setIsCancelling(false);  // ← ADD THIS
      currentTokenRef.current = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to cancel:', error);
    setState(prev => ({ ...prev, isDiscovering: false, progress: null }));
    setIsCancelling(false);  // ← ADD THIS
    currentTokenRef.current = null;
  }
}, []);
```

### 6. Add to Return Statement
```typescript
return {
  // ... existing properties
  showExecutionDialog,
  setShowExecutionDialog,
  logs,
  clearLogs,
  isCancelling,
};
```

---

## View Integration Pattern

For ALL views, add the PowerShellExecutionDialog component:

### 1. Add Import
```typescript
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
```

### 2. Destructure from Hook
```typescript
const {
  // ... existing
  showExecutionDialog,
  setShowExecutionDialog,
  logs,
  clearLogs,
  isCancelling,
} = useModuleDiscoveryLogic();
```

### 3. Add Dialog Component (before closing `</div>`)
```tsx
<PowerShellExecutionDialog
  isOpen={showExecutionDialog}
  onClose={() => !isRunning && setShowExecutionDialog(false)}
  scriptName="[Module Name] Discovery"
  scriptDescription="Discovering [module name] resources"
  logs={logs}
  isRunning={isDiscovering}
  isCancelling={isCancelling}
  progress={progress ? {
    percentage: progress.percentage || progress.progress || progress.percentComplete || 0,
    message: progress.message || progress.currentOperation || progress.phaseLabel || ''
  } : undefined}
  onStart={startDiscovery}
  onStop={cancelDiscovery}
  onClear={clearLogs}
  showStartButton={false}
/>
```

---

## Specific Module Updates Required

### 1. Office365DiscoveryLogic.ts
**File:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useOffice365DiscoveryLogic.ts`

**Changes:**
- Add PowerShellLog import
- Add logs, showExecutionDialog, isCancelling state
- Add addLog, clearLogs functions
- Update startDiscovery: add `setShowExecutionDialog(true); setLogs([]);`
- Update cancelDiscovery: wrap with `setIsCancelling(true/false)`
- Add to return: `showExecutionDialog, setShowExecutionDialog, logs, clearLogs, isCancelling`

**View:** `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\Office365DiscoveryView.tsx`
- Add PowerShellExecutionDialog import and component

### 2. OneDriveDiscoveryLogic.ts
**File:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useOneDriveDiscoveryLogic.ts`

**Changes:**
- Add PowerShellLog import
- Add logs, showExecutionDialog, isCancelling state
- Add addLog, clearLogs functions
- Update startDiscovery: add `setShowExecutionDialog(true);`
- Update cancelDiscovery: wrap with `setIsCancelling(true/false)`
- Add to return: `showExecutionDialog, setShowExecutionDialog, logs, clearLogs, isCancelling`

**View:** `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\OneDriveDiscoveryView.tsx`
- Add PowerShellExecutionDialog import and component

### 3. SharePointDiscoveryLogic.ts
**File:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useSharePointDiscoveryLogic.ts`

**Changes:**
- Add PowerShellLog import
- Add logs, showExecutionDialog, isCancelling state
- Add addLog, clearLogs functions
- Update startDiscovery: add `setShowExecutionDialog(true);`
- Update cancelDiscovery: wrap with `setIsCancelling(true/false)`
- Add to return: `showExecutionDialog, setShowExecutionDialog, logs, clearLogs, isCancelling`

**View:** `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\SharePointDiscoveryView.tsx`
- Add PowerShellExecutionDialog import and component

### 4. GoogleWorkspaceDiscoveryLogic.ts
**File:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useGoogleWorkspaceDiscoveryLogic.ts`

**Changes:**
- Add PowerShellLog import
- Add logs, showExecutionDialog, isCancelling state
- Add addLog, clearLogs functions
- Update startDiscovery: add `setShowExecutionDialog(true);`
- Update cancelDiscovery: wrap with `setIsCancelling(true/false)`
- Add to return: `showExecutionDialog, setShowExecutionDialog, logs, clearLogs, isCancelling`

**View:** `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\GoogleWorkspaceDiscoveryView.tsx`
- Add PowerShellExecutionDialog import and component

### 5. ExchangeDiscoveryLogic.ts (Minor Update)
**File:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useExchangeDiscoveryLogic.ts`

**Changes:**
- Add missing `showExecutionDialog, setShowExecutionDialog` to return statement
- Update cancelDiscovery: wrap with `setIsCancelling(true/false)`
- Add `isCancelling` state if missing

**View:** `D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\ExchangeDiscoveryView.tsx`
- Add PowerShellExecutionDialog import and component

### 6-10. View-Only Updates (Hooks Already Complete)
These hooks already have logs and isCancelling, just need showExecutionDialog added:

**Files:**
- `useEntraIDAppDiscoveryLogic.ts` → Add `showExecutionDialog, setShowExecutionDialog` state and return
- `useExternalIdentityDiscoveryLogic.ts` → Add `showExecutionDialog, setShowExecutionDialog` state and return
- `useGraphDiscoveryLogic.ts` → Add `showExecutionDialog, setShowExecutionDialog` state and return
- `useMultiDomainForestDiscoveryLogic.ts` → Add `showExecutionDialog, setShowExecutionDialog` state and return

**Views:**
- `EntraIDAppDiscoveryView.tsx` - Add PowerShellExecutionDialog
- `ExternalIdentityDiscoveryView.tsx` - Add PowerShellExecutionDialog
- `GraphDiscoveryView.tsx` - Add PowerShellExecutionDialog
- `MultiDomainForestDiscoveryView.tsx` - Add PowerShellExecutionDialog

---

## Progress Handling

Different hooks use different progress property names. The dialog component should handle:

```typescript
progress={progress ? {
  percentage: progress.percentage || progress.progress || progress.percentComplete || 0,
  message: progress.message || progress.currentOperation || progress.phaseLabel || ''
} : undefined}
```

---

## Deployment Steps

After making all changes:

```powershell
# 1. Copy modified files
Copy-Item -Path "D:\Scripts\UserMandA\guiv2\src\renderer\hooks\use*DiscoveryLogic.ts" `
          -Destination "C:\enterprisediscovery\guiv2\src\renderer\hooks\" -Force

Copy-Item -Path "D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\*DiscoveryView.tsx" `
          -Destination "C:\enterprisediscovery\guiv2\src\renderer\views\discovery\" -Force

# 2. Build
cd C:\enterprisediscovery\guiv2
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# 3. Launch
npm start
```

---

## Testing Checklist

For each module, verify:
- [ ] Discovery can be started
- [ ] PowerShellExecutionDialog opens automatically
- [ ] Logs appear in real-time
- [ ] Progress updates display correctly
- [ ] Discovery completes successfully
- [ ] Cancel button works (shows "Cancelling..." state)
- [ ] Dialog can be closed after completion
- [ ] Results persist across page refreshes

---

## Files Summary

### Hooks to Update (4 major + 1 minor)
1. ❌ **useOffice365DiscoveryLogic.ts** - Full integration needed
2. ❌ **useOneDriveDiscoveryLogic.ts** - Full integration needed
3. ❌ **useSharePointDiscoveryLogic.ts** - Full integration needed
4. ❌ **useGoogleWorkspaceDiscoveryLogic.ts** - Full integration needed
5. ⚠️ **useExchangeDiscoveryLogic.ts** - Minor update (add isCancelling)

### Hooks to Update (4 showExecutionDialog only)
6. ⚠️ **useEntraIDAppDiscoveryLogic.ts** - Add showExecutionDialog state
7. ⚠️ **useExternalIdentityDiscoveryLogic.ts** - Add showExecutionDialog state
8. ⚠️ **useGraphDiscoveryLogic.ts** - Add showExecutionDialog state
9. ⚠️ **useMultiDomainForestDiscoveryLogic.ts** - Add showExecutionDialog state

### Views to Update (10 total)
1. Office365DiscoveryView.tsx
2. OneDriveDiscoveryView.tsx
3. SharePointDiscoveryView.tsx
4. GoogleWorkspaceDiscoveryView.tsx
5. ExchangeDiscoveryView.tsx
6. EntraIDAppDiscoveryView.tsx
7. ExternalIdentityDiscoveryView.tsx
8. GraphDiscoveryView.tsx
9. MultiDomainForestDiscoveryView.tsx
10. ConditionalAccessPoliciesDiscoveryView.tsx (verify complete)

---

## Notes

- All hooks already use event-driven architecture with `currentTokenRef`
- All hooks already have proper event listeners with empty dependency arrays
- This task focuses solely on UI integration (PowerShellExecutionDialog)
- The dialog provides a unified, professional user experience across all modules
- Logs are collected automatically via the existing `onDiscoveryOutput` event listeners

---

**End of Summary**
