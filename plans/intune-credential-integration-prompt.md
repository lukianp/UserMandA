# Intune Credential Integration Fix - Detailed Implementation Prompt

## Problem Analysis

The Intune discovery feature is failing because the credential validation in `useIntuneDiscoveryLogic.ts` only checks `profile.configuration` for Azure AD app credentials (Client ID and Client Secret), but the auto-discovered profile stores the Tenant ID directly on the profile object and may not have `configuration.clientId`/`clientSecret` populated.

### Current Issues

1. **Credential Validation Logic**: The hook checks `profile.configuration?.clientId` but the profile has `tenantId` directly and may have `clientId`/`clientSecret` directly on the profile object.

2. **Missing Credentials**: The auto-discovered profile has `tenantId: '4c54e13b-5380-483b-a9af-32e1f265f614'` but no `clientId` or `clientSecret`.

3. **No UI for Credential Management**: There's no user interface to add/update Azure AD app credentials to existing company profiles.

4. **PowerShell Module Integration**: The IntuneDiscovery.psm1 expects credentials in the `Configuration` parameter, but the hook doesn't ensure they're passed correctly.

## Required Fixes

### 1. Update Credential Validation Logic ✅ PARTIALLY DONE

**File**: `guiv2/src/renderer/hooks/useIntuneDiscoveryLogic.ts`

**Current Code** (lines 221-223):
```typescript
const hasTenantId = profile.tenantId;
const hasClientId = profile.configuration?.clientId || profile.configuration?.applicationId;
const hasClientSecret = profile.configuration?.clientSecret || profile.configuration?.secretValue;
```

**Fixed Code**:
```typescript
const hasTenantId = profile.tenantId;
const hasClientId = profile.clientId || profile.configuration?.clientId || profile.configuration?.applicationId;
const hasClientSecret = profile.clientSecret || profile.configuration?.clientSecret || profile.configuration?.secretValue;
```

**Status**: ✅ Applied - checks profile.clientId/clientSecret directly first, then falls back to configuration.

### 2. Ensure Credentials are Passed to PowerShell Module

**Issue**: The PowerShell module `Invoke-IntuneDiscovery` expects a `Configuration` hashtable with `TenantId`, `ClientId`, `ClientSecret`.

**Current Flow**:
- Hook calls `window.electron.executeDiscovery({ moduleName: 'Intune', parameters: {...}, ... })`
- Main process needs to build `Configuration` from the selected profile's credentials

**Required**: Verify main process extracts credentials from profile and passes them to PowerShell.

### 3. Add UI for Managing Profile Credentials

**Problem**: No way for users to add Client ID/Secret to existing profiles.

**Solution**: Create a profile credentials management dialog or extend existing profile editing.

**Files to Create/Modify**:
- `guiv2/src/renderer/components/dialogs/ProfileCredentialsDialog.tsx` (new)
- `guiv2/src/renderer/views/settings/ProfileSettingsView.tsx` (modify or create)

**Dialog Features**:
- Display current profile info (name, tenantId)
- Input fields for Client ID and Client Secret
- Test connection button
- Save/Update credentials to profile

### 4. Update Profile Store to Handle Credentials

**File**: `guiv2/src/renderer/store/useProfileStore.ts`

**Add Methods**:
```typescript
updateProfileCredentials: (profileId: string, credentials: { clientId: string, clientSecret: string }) => Promise<void>
```

### 5. Integrate Credential Management into Discovery Flow

**File**: `guiv2/src/renderer/hooks/useIntuneDiscoveryLogic.ts`

**Enhancement**: When credentials are missing, show a dialog to enter them instead of just displaying an error.

**Code Addition**:
```typescript
const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);

// In startDiscovery, when credentials missing:
if (!hasClientId || !hasClientSecret) {
  setShowCredentialsDialog(true);
  return;
}
```

### 6. Test and Validate

**Steps**:
1. Update a profile with valid Client ID and Client Secret
2. Run Intune discovery
3. Verify PowerShell module receives correct Configuration
4. Confirm discovery completes successfully
5. Validate data is stored and displayed in UI

## Implementation Steps

### Phase 1: Core Credential Validation ✅ DONE
- [x] Update validation logic to check profile.clientId/clientSecret directly

### Phase 2: Credential Management UI
- [ ] Create ProfileCredentialsDialog component
- [ ] Add credential update methods to profile store
- [ ] Integrate dialog into Intune discovery flow

### Phase 3: Main Process Integration
- [ ] Verify main process passes profile credentials to PowerShell Configuration
- [ ] Test end-to-end credential flow

### Phase 4: Testing and Polish
- [ ] Test with valid Azure AD app credentials
- [ ] Handle authentication errors gracefully
- [ ] Add proper error messages for invalid credentials

## Code Changes Summary

### Files Modified
1. `guiv2/src/renderer/hooks/useIntuneDiscoveryLogic.ts` - Updated credential validation
2. `guiv2/src/renderer/store/useProfileStore.ts` - Add credential management methods
3. `guiv2/src/renderer/components/dialogs/ProfileCredentialsDialog.tsx` - New credential input dialog

### Files Created
1. `plans/intune-credential-integration-prompt.md` - This implementation guide

## Testing Instructions

1. **Setup Azure AD App**:
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Create new app or use existing
   - Note Application (client) ID and Tenant ID
   - Create client secret under Certificates & secrets
   - Grant Microsoft Graph permissions: DeviceManagementManagedDevices.Read.All, DeviceManagementApps.Read.All

2. **Update Profile**:
   - Use the new ProfileCredentialsDialog to add Client ID and Client Secret to the profile

3. **Run Discovery**:
   - Start Intune discovery
   - Verify it completes without credential errors
   - Check console for successful authentication logs
   - Validate data appears in discovery results

## Error Handling

- **Invalid Credentials**: Show clear error message with link to Azure portal setup
- **Network Issues**: Retry logic with exponential backoff
- **Permission Issues**: Guide user to correct Graph API permissions
- **Token Expiration**: Automatic token refresh handling

## Security Considerations

- Client secrets should be encrypted at rest
- Never log client secrets in console output
- Use secure storage for credentials
- Implement proper cleanup of sensitive data in memory

## Dependencies

- Microsoft.Graph PowerShell modules
- Valid Azure AD app registration with correct permissions
- Network connectivity to graph.microsoft.com
- Proper tenant configuration

This implementation will fully resolve the Intune credential integration issue and provide a complete user experience for managing Azure AD application credentials within the discovery suite.