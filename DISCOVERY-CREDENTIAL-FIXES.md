# Discovery Module Credential Implementation

## Issue Resolved

Discovery modules were showing credential input fields (like Tenant ID for Azure) even though credentials are already stored in the company profile. This created confusion and implied users needed to re-enter credentials.

## Solution Applied

### Azure Discovery - ✅ FIXED

**Changes Made:**
1. **View (AzureDiscoveryView.tsx)**:
   - Removed Tenant ID input field
   - Removed Test Connection button
   - Added profile info display showing:
     - Profile name
     - Tenant ID (from profile)
     - Message: "Using credentials from company profile"

2. **Hook (useAzureDiscoveryLogic.ts)**:
   - Already correctly implemented - using `executeDiscoveryModule` with company profile name
   - Credentials automatically loaded from profile service
   - No changes needed to hook logic

**How It Works:**
```typescript
// Hook correctly calls:
await electronAPI.executeDiscoveryModule(
  'Azure',                              // Module name
  selectedSourceProfile.companyName,    // Profile name (credentials loaded automatically)
  {
    IncludeUsers: formData.includeUsers,
    IncludeGroups: formData.includeGroups,
    // ... other parameters
  }
);
```

**PowerShell Module**:
- `AzureDiscovery.psm1` receives credentials automatically via `executeDiscoveryModule`
- Credentials are loaded from profile JSON file
- Results saved to: `C:\DiscoveryData\{companyName}\Raw\`

---

## Discovery Modules to Check

### Priority 1: Core Microsoft 365 Modules

#### 1. ✅ Azure Discovery
- **Status**: FIXED
- **View**: `src/renderer/views/discovery/AzureDiscoveryView.tsx`
- **Hook**: `src/renderer/hooks/useAzureDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/AzureDiscovery.psm1`

#### 2. ⚠️ Active Directory Discovery
- **Status**: NEEDS REVIEW
- **View**: `src/renderer/views/discovery/ActiveDirectoryDiscoveryView.tsx`
- **Hook**: `src/renderer/hooks/useActiveDirectoryDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/ActiveDirectoryDiscovery.psm1`
- **Check**: Does view show DC/Domain input fields?

#### 3. ⚠️ Exchange Discovery
- **Status**: NEEDS REVIEW
- **View**: `src/renderer/views/discovery/ExchangeDiscoveryView.tsx`
- **Hook**: `src/renderer/hooks/useExchangeDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/ExchangeDiscovery.psm1`
- **Check**: Does view show Exchange server input fields?

#### 4. ⚠️ SharePoint Discovery
- **Status**: NEEDS REVIEW
- **View**: `src/renderer/views/discovery/SharePointDiscoveryView.tsx`
- **Hook**: `src/renderer/hooks/useSharePointDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/SharePointDiscovery.psm1`
- **Check**: Does view show SharePoint URL input fields?

#### 5. ⚠️ OneDrive Discovery
- **Status**: NEEDS REVIEW
- **View**: `src/renderer/views/discovery/OneDriveDiscoveryView.tsx`
- **Hook**: `src/renderer/hooks/useOneDriveDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/OneDriveDiscovery.psm1`
- **Check**: Does view show credential fields?

#### 6. ⚠️ Teams Discovery
- **Status**: NEEDS REVIEW
- **View**: `src/renderer/views/discovery/TeamsDiscoveryView.tsx`
- **Hook**: `src/renderer/hooks/useTeamsDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/TeamsDiscovery.psm1`
- **Check**: Does view show credential fields?

### Priority 2: Cloud Platforms

#### 7. ⚠️ AWS Discovery
- **Status**: NEEDS REVIEW
- **View**: `src/renderer/views/discovery/AWSCloudInfrastructureDiscoveryView.tsx`
- **Hook**: `src/renderer/hooks/useAWSDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/AWSDiscovery.psm1`
- **Check**: Does view show AWS access key/secret fields?

#### 8. ⚠️ Google Workspace Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useGoogleWorkspaceDiscoveryLogic.ts`
- **Check**: Does view show Google credential fields?

### Priority 3: Security & Compliance

#### 9. ⚠️ Conditional Access Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useConditionalAccessDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/ConditionalAccessDiscovery.psm1`

#### 10. ⚠️ DLP Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useDataLossPreventionDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/DLPDiscovery.psm1`

#### 11. ⚠️ Identity Governance Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useIdentityGovernanceDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/IdentityGovernanceDiscovery.psm1`

#### 12. ⚠️ Intune Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useIntuneDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/IntuneDiscovery.psm1`

### Priority 4: Infrastructure

#### 13. ⚠️ Network Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useNetworkDiscoveryLogic.ts`

#### 14. ⚠️ VMware Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useVMwareDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/VMwareDiscovery.psm1`
- **Check**: Does view show vCenter credential fields?

#### 15. ⚠️ Hyper-V Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useHyperVDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/HyperVDiscovery.psm1`

#### 16. ⚠️ SQL Server Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useSQLServerDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/SQLServerDiscovery.psm1`
- **Check**: Does view show SQL credential fields?

#### 17. ⚠️ Web Server Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useWebServerDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/WebServerDiscovery.psm1`

### Priority 5: Business Applications

#### 18. ⚠️ Power Platform Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/usePowerPlatformDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/PowerPlatformDiscovery.psm1`

#### 19. ⚠️ Power BI Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/usePowerBIDiscovery.ts`
- **Module**: `Modules/Discovery/PowerBIDiscovery.psm1`

#### 20. ⚠️ Licensing Discovery
- **Status**: NEEDS REVIEW
- **Hook**: `src/renderer/hooks/useLicensingDiscoveryLogic.ts`
- **Module**: `Modules/Discovery/LicensingDiscovery.psm1`

---

## Standard Fix Pattern

For each discovery module that shows credential input fields:

### 1. Check the View (*.tsx)

Look for credential input fields like:
```tsx
<Input
  label="Tenant ID" // or "Server", "URL", etc.
  value={formData?.tenantId ?? ''}
  onChange={(e) => updateFormField('tenantId', e.target.value)}
  ...
/>
```

**Replace with**:
```tsx
{/* Show profile info */}
{selectedProfile && (
  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
    <p className="text-sm text-gray-700 dark:text-gray-300">
      <span className="font-semibold">Profile:</span> {selectedProfile.name}
    </p>
    {selectedProfile.credentials?.azureTenantId && (
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        <span className="font-semibold">Tenant:</span> {selectedProfile.credentials.azureTenantId}
      </p>
    )}
    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
      Using credentials from company profile
    </p>
  </div>
)}
```

### 2. Check the Hook (*.ts)

Verify the hook is using `executeDiscoveryModule` correctly:

**Correct Pattern**:
```typescript
const result = await electronAPI.executeDiscoveryModule(
  'ModuleName',                        // e.g., 'Azure', 'Exchange', 'ActiveDirectory'
  selectedSourceProfile.companyName,   // Profile name - credentials loaded automatically
  {
    // Only pass discovery configuration parameters
    IncludeUsers: formData.includeUsers,
    IncludeGroups: formData.includeGroups,
    // ... other config options
  },
  {
    timeout: formData.timeout * 1000
  }
);
```

**Incorrect Pattern** (DO NOT USE):
```typescript
// ❌ Don't pass credentials manually
const result = await electronAPI.executeModule({
  modulePath: 'Modules/Discovery/SomeModule.psm1',
  functionName: 'Invoke-SomeDiscovery',
  parameters: {
    TenantId: formData.tenantId,      // ❌ Don't do this
    ClientId: formData.clientId,       // ❌ Credentials are inherited
    ClientSecret: formData.secret,     // ❌ from profile
  }
});
```

### 3. Verify PowerShell Module

The PowerShell module should receive credentials automatically. Check that it uses `Get-CompanyCredentials`:

```powershell
function Invoke-AzureDiscovery {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyName,

        [Parameter(Mandatory=$false)]
        [bool]$IncludeUsers = $true
        # ... other parameters
    )

    # Credentials are loaded automatically by the execution service
    # No need to pass them as parameters

    # Your discovery logic here...
}
```

---

## Verification Checklist

For each discovery module:

- [ ] Remove credential input fields from view
- [ ] Add profile info display box
- [ ] Verify hook uses `executeDiscoveryModule` with company name
- [ ] Verify hook does NOT pass credentials in parameters
- [ ] Test that discovery runs successfully
- [ ] Verify results are saved to `C:\DiscoveryData\{companyName}\Raw\`
- [ ] Check that LogicEngine loads the CSV files
- [ ] Verify view can display loaded data from LogicEngine

---

## Files Modified

### Azure Discovery (COMPLETED)
- ✅ `C:\enterprisediscovery\src\renderer\views\discovery\AzureDiscoveryView.tsx`
- ✅ Renderer bundle rebuilt

### Remaining Files
All other discovery views listed above need the same treatment.

---

## Testing Instructions

After fixing a discovery module:

1. **Rebuild renderer**:
   ```bash
   cd C:\enterprisediscovery
   npx webpack --config webpack.renderer-standalone.config.js --mode=production
   ```

2. **Restart app** and navigate to the discovery view

3. **Verify**:
   - No credential input fields visible
   - Profile info box shows profile name and credentials
   - "Using credentials from company profile" message appears
   - Start discovery works without manual credential entry
   - Results save to CSV in profile's Raw directory
   - LogicEngine can load the CSV data

---

## Notes

- All discovery hooks should use `executeDiscoveryModule` which automatically loads credentials from the profile
- The PowerShell execution service handles credential injection
- Credentials are stored securely in the profile JSON files
- No discovery module should require manual credential entry if a profile is selected
- This provides a consistent user experience across all discovery modules
