# Discovery Hook Credential Integration Progress Report

**Date:** 2025-11-03
**Task:** Apply profile store pattern to all 17 discovery hooks
**Objective:** Complete Task 1 "all the way to the end" as requested by user

---

## PROGRESS SUMMARY

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ **COMPLETED** | **5** | **29%** |
| 🔄 **IN PROGRESS** | **12** | **71%** |
| **TOTAL** | **17** | **100%** |

---

## ✅ COMPLETED HOOKS (5/17)

These hooks have been successfully updated with profile store integration:

### 1. useConditionalAccessDiscoveryLogic.ts ✅
- **Module Name:** `ConditionalAccess`
- **Profile Store:** ✅ Integrated
- **Validation:** ✅ Profile check before discovery
- **Console Logging:** ✅ Added with company name
- **API Method:** ✅ `executeDiscoveryModule()`

### 2. useDataLossPreventionDiscoveryLogic.ts ✅
- **Module Name:** `DLP`
- **Profile Store:** ✅ Integrated
- **Validation:** ✅ Profile check before discovery
- **Console Logging:** ✅ Added with company name
- **API Method:** ✅ `executeDiscoveryModule()`

### 3. useIdentityGovernanceDiscoveryLogic.ts ✅
- **Module Name:** `IdentityGovernance`
- **Profile Store:** ✅ Integrated
- **Validation:** ✅ Profile check before discovery
- **Console Logging:** ✅ Added with company name
- **API Method:** ✅ `executeDiscoveryModule()`

### 4. useIntuneDiscoveryLogic.ts ✅
- **Module Name:** `Intune`
- **Profile Store:** ✅ Integrated
- **Validation:** ✅ Profile check before discovery
- **Console Logging:** ✅ Added with company name
- **API Method:** ✅ `executeDiscoveryModule()`

### 5. useLicensingDiscoveryLogic.ts ✅
- **Module Name:** `Licensing`
- **Profile Store:** ✅ Integrated
- **Validation:** ✅ Profile check before discovery
- **Console Logging:** ✅ Added with company name
- **API Method:** ✅ `executeDiscoveryModule()`

---

## 🔄 REMAINING HOOKS (12/17)

These hooks still need profile store integration applied:

### M365/Cloud Services (6 hooks)
| # | Hook File | Module Name | Credential Fields to Remove |
|---|-----------|-------------|-----------------------------|
| 6 | `useOffice365DiscoveryLogic.ts` | `Office365` | tenantId, tenantDomain |
| 7 | `useOneDriveDiscoveryLogic.ts` | `OneDrive` | tenantId, clientId, clientSecret |
| 8 | `useSharePointDiscoveryLogic.ts` | `SharePoint` | tenantId, clientId, clientSecret |
| 9 | `useTeamsDiscoveryLogic.ts` | `Teams` | tenantId, clientId, clientSecret |
| 10 | `usePowerPlatformDiscoveryLogic.ts` | `PowerPlatform` | tenantId, clientId, clientSecret |

### Infrastructure Services (5 hooks)
| # | Hook File | Module Name | Credential Fields to Remove |
|---|-----------|-------------|-----------------------------|
| 11 | `useHyperVDiscoveryLogic.ts` | `HyperV` | username, password, domain |
| 12 | `useNetworkDiscoveryLogic.ts` | `Network` | username, password, snmpCommunity |
| 13 | `useSQLServerDiscoveryLogic.ts` | `SQLServer` | username, password, authType |
| 14 | `useWebServerDiscoveryLogic.ts` | `WebServer` | username, password |
| 15 | `useVMwareDiscoveryLogic.ts` | `VMware` | username, password, vCenterServer |

### Security & File Systems (2 hooks)
| # | Hook File | Module Name | Credential Fields to Remove |
|---|-----------|-------------|-----------------------------|
| 16 | `useFileSystemDiscoveryLogic.ts` | `FileSystem` | username, password, domain |
| 17 | `useSecurityInfrastructureDiscoveryLogic.ts` | `SecurityInfrastructure` | varies by security tool |

---

## PATTERN APPLIED TO COMPLETED HOOKS

### Step 1: Added Imports
```typescript
import { useProfileStore } from '../store/useProfileStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
```

### Step 2: Added Profile Store Selection
```typescript
export const useHookName = () => {
  // Get selected profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  // ... rest of hook
```

### Step 3: Replaced startDiscovery Function
**BEFORE:**
```typescript
const startDiscovery = useCallback(async () => {
  // ... setup ...

  const result = await window.electronAPI.executeModule({
    modulePath: 'Modules/Discovery/SomeModule.psm1',
    functionName: 'Invoke-SomeDiscovery',
    parameters: {
      TenantId: state.config.tenantId, // ❌ Manual credentials
      ClientId: state.config.clientId,
      // ... other params
    }
  });
}, [state.config]);
```

**AFTER:**
```typescript
const startDiscovery = useCallback(async () => {
  if (!selectedSourceProfile) {
    const errorMessage = 'No company profile selected. Please select a profile first.';
    setState(prev => ({ ...prev, error: errorMessage }));
    console.error('[HookName]', errorMessage);
    return;
  }

  // ... token and setState setup ...

  console.log(`[HookName] Starting discovery for company: ${selectedSourceProfile.companyName}`);
  console.log(`[HookName] Parameters:`, { /* config options */ });

  try {
    const electronAPI = getElectronAPI();
    const discoveryResult = await electronAPI.executeDiscoveryModule(
      'ModuleName', // ✅ Module name only
      selectedSourceProfile.companyName, // ✅ Credentials loaded automatically
      {
        // ✅ Only discovery options, NO credentials
        IncludeUsers: state.config.includeUsers,
        IncludeGroups: state.config.includeGroups,
        // ... other non-credential options
      },
      { timeout: state.config.timeout || 300000 }
    );

    setState(prev => ({
      ...prev,
      result: discoveryResult.data || discoveryResult,
      isDiscovering: false,
      cancellationToken: null,
      progress: { current: 100, total: 100, message: 'Completed', percentage: 100 }
    }));

    console.log(`[HookName] Discovery completed successfully`);
  } catch (error: any) {
    console.error('[HookName] Discovery failed:', error);
    setState(prev => ({
      ...prev,
      isDiscovering: false,
      cancellationToken: null,
      error: error.message || 'Discovery failed'
    }));
  }
}, [selectedSourceProfile, state.config]);
```

---

## NEXT STEPS TO COMPLETE

### For Each Remaining Hook:

1. **Add imports** (lines 1-2 of pattern)
2. **Add profile selection** (at start of hook function)
3. **Replace startDiscovery** with pattern above
4. **Remove credential fields** from config interface (if any)
5. **Test compilation** for TypeScript errors

### Estimated Time:
- Per hook: ~5-10 minutes
- Total remaining: 12 hooks × 8 minutes = **96 minutes (~1.5 hours)**

---

## VALIDATION CHECKLIST

For each completed hook, verify:
- [x] Has `import { useProfileStore }` and `import { getElectronAPI }`
- [x] Has `const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile)`
- [x] Validates `selectedSourceProfile` at start of `startDiscovery`
- [x] Uses `electronAPI.executeDiscoveryModule()` instead of `window.electronAPI.executeModule()`
- [x] Has console logging with `[HookName]` prefix and company name
- [x] Dependencies array includes `selectedSourceProfile`
- [x] No credential fields in parameters (only discovery options)

---

## FILES TO UPDATE (12 Remaining)

```
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useOffice365DiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useOneDriveDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useSharePointDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useTeamsDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\usePowerPlatformDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useHyperVDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useNetworkDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useSQLServerDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useWebServerDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useVMwareDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useFileSystemDiscoveryLogic.ts
D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useSecurityInfrastructureDiscoveryLogic.ts
```

---

**Report Generated:** 2025-11-03
**Progress:** 5/17 hooks completed (29%)
**Status:** IN PROGRESS - Continuing with remaining 12 hooks
