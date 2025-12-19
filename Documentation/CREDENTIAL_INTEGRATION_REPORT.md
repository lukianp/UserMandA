# Discovery Hook Credential Integration - Complete Analysis

## Executive Summary

**Date:** 2025-11-03
**Task:** Apply profile store pattern to all discovery hooks
**Scope:** 26 discovery hooks in `guiv2/src/renderer/hooks/`

## Status Overview

| Category | Count | Percentage |
|----------|-------|------------|
| ✅ Already Integrated | 5 | 19% |
| 🔄 Need Integration | 17 | 65% |
| ⏭️ Skip (Mock Only) | 4 | 15% |
| **TOTAL** | **26** | **100%** |

---

## ✅ ALREADY INTEGRATED (5/26)

These hooks already use the profile store pattern correctly:

1. **useActiveDirectoryDiscoveryLogic.ts** ✅
   - Uses `useProfileStore`
   - Gets `selectedSourceProfile`
   - Validates profile before discovery
   - Calls `executeDiscoveryModule` with company name

2. **useAzureDiscoveryLogic.ts** ✅
   - Uses `useProfileStore`
   - Profile validation in startDiscovery
   - Console logging with company name

3. **useAWSDiscoveryLogic.ts** ✅
   - Uses `useProfileStore`
   - Profile validation implemented
   - Proper error handling

4. **useExchangeDiscoveryLogic.ts** ✅
   - Uses `useProfileStore`
   - Profile validation
   - Console logging

5. **useGoogleWorkspaceDiscoveryLogic.ts** ✅
   - Uses `useProfileStore`
   - Profile validation
   - Console logging

---

## 🔄 NEED INTEGRATION (17/26)

These hooks call PowerShell modules but don't use profile store:

### M365/Azure Ecosystem (8 hooks)
6. **useConditionalAccessDiscoveryLogic.ts**
   - Module: `ConditionalAccessDiscovery.psm1`
   - Function: `Invoke-CADiscovery`
   - Credentials: Tenant-based (Azure AD)

7. **useDataLossPreventionDiscoveryLogic.ts**
   - Module: `DLPDiscovery.psm1`
   - Function: `Invoke-DLPDiscovery`
   - Credentials: Microsoft 365 tenant

8. **useIdentityGovernanceDiscoveryLogic.ts**
   - Module: `IdentityGovernanceDiscovery.psm1`
   - Function: `Invoke-IGDiscovery`
   - Credentials: Azure AD tenant

9. **useIntuneDiscoveryLogic.ts**
   - Module: `IntuneDiscovery.psm1`
   - Function: `Invoke-IntuneDiscovery`
   - Credentials: Microsoft Endpoint Manager

10. **useLicensingDiscoveryLogic.ts**
    - Module: `LicensingDiscovery.psm1`
    - Function: TBD
    - Credentials: M365 tenant

11. **useOffice365DiscoveryLogic.ts**
    - Module: `Office365Discovery.psm1`
    - Function: TBD
    - Credentials: M365 tenant

12. **useOneDriveDiscoveryLogic.ts**
    - Module: `OneDriveDiscovery.psm1`
    - Function: TBD
    - Credentials: M365 tenant

13. **useSharePointDiscoveryLogic.ts**
    - Module: `SharePointDiscovery.psm1`
    - Function: TBD
    - Credentials: M365 tenant

14. **useTeamsDiscoveryLogic.ts**
    - Module: `TeamsDiscovery.psm1`
    - Function: TBD
    - Credentials: M365 tenant

### Infrastructure & Servers (5 hooks)
15. **useHyperVDiscoveryLogic.ts**
    - Module: `HyperVDiscovery.psm1`
    - Function: `Invoke-HyperVDiscovery`
    - Credentials: Windows credentials for Hyper-V hosts

16. **useNetworkDiscoveryLogic.ts**
    - Module: `NetworkDiscovery.psm1`
    - Function: `Invoke-NetworkDiscovery`
    - Credentials: Network device credentials (SNMP, SSH)

17. **useSQLServerDiscoveryLogic.ts**
    - Module: `SQLServerDiscovery.psm1`
    - Function: `Invoke-SQLServerDiscovery`
    - Credentials: SQL Server credentials

18. **useWebServerDiscoveryLogic.ts**
    - Module: `WebServerDiscovery.psm1`
    - Function: `Invoke-WebServerDiscovery`
    - Credentials: Windows/Linux server credentials

19. **useVMwareDiscoveryLogic.ts**
    - Module: `VMwareDiscovery.psm1`
    - Function: `Invoke-VMwareDiscovery`
    - Credentials: vCenter credentials

### Security & Compliance (2 hooks)
20. **useSecurityInfrastructureDiscoveryLogic.ts**
    - Module: `SecurityInfrastructureDiscovery.psm1`
    - Function: TBD
    - Credentials: Multiple (depends on security tools)

21. **usePowerPlatformDiscoveryLogic.ts**
    - Module: `PowerPlatformDiscovery.psm1`
    - Function: TBD
    - Credentials: Power Platform admin credentials

### File Systems (1 hook)
22. **useFileSystemDiscoveryLogic.ts**
    - Module: `FileSystemDiscovery.psm1`
    - Function: `Invoke-FileSystemDiscovery`
    - Credentials: Windows file server credentials

---

## ⏭️ SKIP - NO INTEGRATION NEEDED (4/26)

These hooks are mock-only and don't call PowerShell modules:

23. **useAWSCloudInfrastructureDiscoveryLogic.ts** ⏭️
    - Uses mock data with setTimeout
    - No real API calls
    - No credentials needed

24. **useEDiscoveryLogic.ts** ⏭️
    - Pure mock data generator
    - No external calls
    - No credentials needed

25. **useApplicationDiscoveryLogic.ts** ⏭️
    - Mock implementation only
    - No real discovery
    - No credentials needed

26. **useDomainDiscoveryLogic.ts** ⏭️
    - Mock implementation only
    - No real discovery
    - No credentials needed

---

## IMPLEMENTATION PATTERN

### Required Changes for Each Hook

#### 1. Add Imports
```typescript
import { useProfileStore } from '../store/useProfileStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
```

#### 2. Get Selected Profile
```typescript
const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
```

#### 3. Add Profile Validation in startDiscovery
```typescript
const startDiscovery = useCallback(async () => {
  if (!selectedSourceProfile) {
    const errorMessage = 'No company profile selected. Please select a profile first.';
    setError(errorMessage);
    addLog('error', errorMessage);  // if addLog exists
    return;
  }

  console.log(`[HookName] Starting discovery for company: ${selectedSourceProfile.companyName}`);
  // ... rest of implementation
}, [selectedSourceProfile, ...]);
```

#### 4. Replace Discovery Execution Call
**BEFORE:**
```typescript
const result = await window.electronAPI.executeModule({
  modulePath: 'Modules/Discovery/ModuleName.psm1',
  functionName: 'Invoke-ModuleDiscovery',
  parameters: {
    // includes credential fields like tenantId, username, etc.
  }
});
```

**AFTER:**
```typescript
const electronAPI = getElectronAPI();
const result = await electronAPI.executeDiscoveryModule(
  'ModuleName',
  selectedSourceProfile.companyName,
  {
    // Only discovery-specific options, NO credentials
    IncludeUsers: config.includeUsers,
    IncludeGroups: config.includeGroups,
    // ... other non-credential options
  },
  { timeout: 300000 }
);
```

#### 5. Remove Credential Fields from Config
Remove these types of fields:
- Azure/M365: `tenantId`, `clientId`, `clientSecret`
- AWS: `accessKeyId`, `secretAccessKey`, `region`
- On-prem: `username`, `password`, `domain`
- Google: `serviceAccountKeyPath`, `adminEmail`
- SQL: `username`, `password`, `authenticationType` (keep only discovery options)

---

## NEXT STEPS

1. **Apply Pattern to 17 Hooks** - Systematically update each hook
2. **Remove Credential Fields** - Clean up config interfaces
3. **Add Console Logging** - For debugging and transparency
4. **Test Each Hook** - Verify profile integration works
5. **Update Tests** - Mock `useProfileStore` in tests

---

## ESTIMATED EFFORT

| Task | Time | Priority |
|------|------|----------|
| Apply pattern to 17 hooks | 3-4 hours | HIGH |
| Test profile integration | 1-2 hours | HIGH |
| Update hook tests | 2-3 hours | MEDIUM |
| Remove credential fields from views | 1-2 hours | MEDIUM |
| **TOTAL** | **7-11 hours** | |

---

## SUCCESS CRITERIA

- ✅ All 17 hooks use `useProfileStore`
- ✅ All hooks validate `selectedSourceProfile` before discovery
- ✅ All hooks call `executeDiscoveryModule` with company name
- ✅ No manual credential fields in hook configs
- ✅ Console logging added to all hooks
- ✅ All hooks build without errors
- ✅ Profile store pattern is consistent across all hooks

---

## FILES TO UPDATE

**Total Files:** 17 hooks + potentially 17 views (if they have credential inputs)

**Workspace Directory:** `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\`

**List of Files:**
1. useConditionalAccessDiscoveryLogic.ts
2. useDataLossPreventionDiscoveryLogic.ts
3. useFileSystemDiscoveryLogic.ts
4. useHyperVDiscoveryLogic.ts
5. useIdentityGovernanceDiscoveryLogic.ts
6. useIntuneDiscoveryLogic.ts
7. useLicensingDiscoveryLogic.ts
8. useNetworkDiscoveryLogic.ts
9. useOffice365DiscoveryLogic.ts
10. useOneDriveDiscoveryLogic.ts
11. usePowerPlatformDiscoveryLogic.ts
12. useSecurityInfrastructureDiscoveryLogic.ts
13. useSharePointDiscoveryLogic.ts
14. useSQLServerDiscoveryLogic.ts
15. useTeamsDiscoveryLogic.ts
16. useVMwareDiscoveryLogic.ts
17. useWebServerDiscoveryLogic.ts

---

## REFERENCES

**Working Examples:**
- `useActiveDirectoryDiscoveryLogic.ts` - Perfect reference implementation
- `useAzureDiscoveryLogic.ts` - M365 pattern
- `useAWSDiscoveryLogic.ts` - Cloud pattern

**Key Files:**
- `src/renderer/store/useProfileStore.ts` - Profile store
- `src/renderer/lib/electron-api-fallback.ts` - API helper
- `src/main/ipcHandlers.ts` - Backend integration

---

**Report Generated:** 2025-11-03
**Author:** Claude (Sonnet 4.5)
**Task:** Credential Integration Phase 1 - Complete Analysis
