# Profile Management Issues & Fixes

## Issues Identified:

### 1. Test Connection Only Checks Existence, Not Validity
**File:** `src/main/ipcHandlers.ts:726-779`
**Problem:** testConnection handler only validates credentials exist, doesn't actually test Azure API
**Fix:** Add PowerShell execution to test Microsoft Graph API call

```typescript
// After validating credentials exist, add:
const testScript = `
  $tenantId = "${creds.tenantId}"
  $clientId = "${creds.clientId || creds.username}"
  $clientSecret = "${creds.clientSecret || creds.password}"

  try {
    $body = @{
      grant_type    = "client_credentials"
      scope         = "https://graph.microsoft.com/.default"
      client_id     = $clientId
      client_secret = $clientSecret
    }

    $response = Invoke-RestMethod `
      -Method Post `
      -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" `
      -Body $body

    Write-Output "SUCCESS"
  } catch {
    Write-Error $_.Exception.Message
    exit 1
  }
`;

// Execute via PowerShell service
const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
const psService = PowerShellExecutionService.getInstance();
const result = await psService.executeScript({
  script: testScript,
  executionId: crypto.randomUUID()
});

if (!result.success) {
  return {
    success: false,
    error: `Azure authentication failed: ${result.error || 'Invalid credentials'}`
  };
}
```

### 2. Profile Switching Not Calling Backend
**File:** `src/renderer/store/useProfileStore.ts`
**Check:** Ensure `setSelectedSourceProfile` calls the IPC handler `profile:setActiveSource`

### 3. Delete Button Not Responding
**Possible Causes:**
- Store method `deleteSourceProfile` may have an error
- IPC channel mismatch (already fixed in preload.ts)
- React state not updating

**Files to Check:**
- `src/renderer/store/useProfileStore.ts` - check deleteSourceProfile implementation
- Console logs when clicking delete - check for errors

## Action Items:

1. **Update testConnection handler** to actually call Azure
2. **Verify setSelectedSourceProfile** triggers IPC call to set active profile
3. **Add console logging** to deleteSourceProfile to debug
4. **Check if credentials are being saved** when creating profiles

## Testing Plan:

1. Create profile without credentials - test connection should fail with "no credentials"
2. Add credentials via credential file - test connection should validate with Azure API
3. Switch profiles - should trigger LogicEngine reload with new profile path
4. Delete profile - should remove from list and delete directory
