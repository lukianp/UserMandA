# M&A Discovery Suite - Issue Analysis and Fix

## Issue Summary

The M&A Discovery Suite is experiencing two critical issues:

1. **Authentication failures** with Microsoft Graph and Azure services due to credential field mixup
2. **Discovery module failures** due to Force parameter errors

## Issue 1: Authentication Failures

The M&A Discovery Suite is failing to authenticate with Microsoft Graph and Azure services due to a **credential field mixup** in the stored credentials.

### Error Details
- **Error Code**: `AADSTS90002`
- **Error Message**: `Tenant '1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da' not found`
- **Impact**: All cloud-based discovery modules (Graph, Azure, Exchange, Teams, SharePoint) are failing
- **Root Cause**: ClientId and TenantId fields are swapped in the stored credentials

### Correct Values (Confirmed from Error Logs)
- **TenantId**: `c405117b-3153-4ed8-8c65-b3475764ab8f`
- **ClientId**: `1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da`

### What's Happening
The system is using:
- TenantId: `1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da` (this should be ClientId)
- ClientId: `c405117b-3153-4ed8-8c65-b3475764ab8f` (this should be TenantId)

The fields are completely swapped in the stored credentials!

## Technical Analysis

### Authentication Flow
1. System loads credentials from: `C:\MandADiscovery\Profiles\Zedra\credentials.config`
2. Credentials contain:
   - ClientId: `c405117b-3153-4ed8-8c65-b3475764ab8f`
   - TenantId: `1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da` ⚠️ **INVALID**
   - ClientSecret: [encrypted]
3. Authentication attempts fail because Azure AD cannot find the specified tenant

### Affected Services
- ❌ Microsoft Graph API
- ❌ Azure Resource Manager
- ❌ Exchange Online
- ❌ SharePoint Online
- ❌ Microsoft Teams
- ✅ On-premises Active Directory (working correctly)

## Issue 2: Force Parameter Errors

### Error Details
- **Error Message**: `A parameter cannot be found that matches parameter name 'Force'`
- **Impact**: All discovery modules failing to execute
- **Root Cause**: Orchestrator's `-Force` parameter being passed to discovery functions that don't accept it

### Technical Analysis
The orchestrator script accepts a `-Force` parameter but incorrectly allows PowerShell's parameter binding to pass it to discovery module functions. Discovery modules only accept `-Configuration` and `-Context` parameters.

**Problem Location:**
- File: `Core/MandA-Orchestrator.ps1`
- Function: `Invoke-DiscoveryModule` (line 901)
- Issue: Parameter forwarding allows `-Force` to be passed to discovery functions

**Affected Modules:**
- ❌ ActiveDirectoryDiscovery
- ❌ GraphDiscovery
- ❌ AzureDiscovery
- ❌ ExchangeDiscovery
- ❌ All other discovery modules

### Resolution for Force Parameter Issue
Run the Force parameter fix script:
```powershell
.\Scripts\Fix-ForceParameterIssue.ps1 -CompanyName "Zedra"
```

This will:
- Modify the `Invoke-DiscoveryModule` function to use explicit parameter control
- Prevent the `-Force` parameter from being passed to discovery modules
- Ensure only `Configuration` and `Context` parameters are passed

## Resolution Steps for Authentication Issues

### Option 1: Automated Field Swap Fix (Recommended)
Run the specialized field mixup fix script:
```powershell
.\Scripts\Fix-CredentialFieldMixup.ps1 -CompanyName "Zedra"
```

This will:
- Detect the credential field mixup
- Automatically swap ClientId and TenantId to correct positions
- Preserve the existing ClientSecret
- Verify the fix

### Option 2: Diagnostic Analysis First
Run the diagnostic script to confirm the issue:
```powershell
.\Scripts\Diagnose-AuthenticationIssue.ps1 -CompanyName "Zedra"
```

This will:
- Analyze the credential file contents
- Detect the field mixup
- Provide specific recommendations
- Test Azure endpoint connectivity

### Option 3: Manual Credential Replacement
If the automated fix doesn't work:
```powershell
.\Scripts\Fix-AuthenticationCredentials.ps1 -CompanyName "Zedra"
```

This will:
- Remove the invalid credential file
- Clear cached authentication contexts
- Prepare the system for fresh credential input

## Required Information

To fix this issue permanently, you need to obtain the **correct** Azure AD information:

### 1. Correct Tenant ID
- Contact your Azure AD administrator
- This should be a valid GUID for your organization's Azure AD tenant
- You can find this in the Azure portal under "Azure Active Directory" > "Properties"

### 2. Application Registration Details
- **Application (Client) ID**: GUID of the registered application
- **Client Secret**: Valid secret for the application
- **Permissions**: Ensure the app has required permissions:
  - Microsoft Graph API permissions
  - Azure Resource Manager permissions (for Azure discovery)
  - Exchange Online permissions (for Exchange discovery)

### 3. Verification Steps
Before using new credentials, verify:
- The tenant ID exists and is accessible
- The application is registered in the correct tenant
- Required permissions are granted and admin consent is provided
- The client secret is not expired

## Post-Fix Steps

After applying both fixes:

1. **Apply the Force parameter fix first**:
   ```powershell
   .\Scripts\Fix-ForceParameterIssue.ps1 -CompanyName "Zedra"
   ```

2. **Apply the credential field mixup fix**:
   ```powershell
   .\Scripts\Fix-CredentialFieldMixup.ps1 -CompanyName "Zedra"
   ```

3. **Re-run the Discovery Suite**:
   ```powershell
   .\QuickStart.ps1 -CompanyName "Zedra" -Mode "Discovery"
   ```

2. **When prompted for credentials**:
   - Enter the **correct** Tenant ID
   - Enter the Application (Client) ID
   - Enter the Client Secret
   - Choose "Y" to save credentials securely

3. **Verify authentication**:
   - The system should successfully connect to Microsoft Graph
   - Azure, Exchange, and other cloud services should authenticate
   - Discovery should proceed normally

## Prevention

To prevent this issue in the future:

1. **Validate credentials before saving**:
   - Test tenant ID using: `https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid_configuration`
   - Verify application exists in the tenant

2. **Regular credential maintenance**:
   - Monitor client secret expiration dates
   - Update credentials before they expire
   - Maintain documentation of correct tenant information

3. **Use the diagnostic script**:
   - Run periodically to verify authentication health
   - Use before major discovery operations

## Files Created

This analysis includes multiple utility scripts:

1. **`Scripts/Fix-ForceParameterIssue.ps1`**
   - Fixes the Force parameter passing issue in the orchestrator
   - Modifies Invoke-DiscoveryModule function to use explicit parameter control
   - Prevents Force parameter from being passed to discovery modules

2. **`Scripts/Fix-CredentialFieldMixup.ps1`**
   - Automatically detects and fixes credential field mixup
   - Swaps ClientId and TenantId to correct positions
   - Preserves existing ClientSecret

3. **`Scripts/Diagnose-AuthenticationIssue.ps1`**
   - Comprehensive authentication diagnostics
   - Tests connectivity to Azure endpoints
   - Validates credential file contents
   - Provides detailed recommendations

4. **`Scripts/Fix-AuthenticationCredentials.ps1`**
   - Automated credential cleanup
   - Removes invalid credential files
   - Clears cached authentication contexts
   - Prepares system for fresh credentials

## Contact Information

If you continue to experience issues after following these steps:

1. **Azure AD Administrator**: Contact for correct tenant ID and application details
2. **IT Security Team**: For application permission requirements and approval
3. **M&A Discovery Support**: For technical assistance with the discovery suite

## Summary

The M&A Discovery Suite is experiencing two critical issues:

### Issue 1: Force Parameter Errors
- **Cause**: Orchestrator's `-Force` parameter being passed to discovery modules that don't accept it
- **Fix**: Run `.\Scripts\Fix-ForceParameterIssue.ps1 -CompanyName "Zedra"`
- **Result**: Discovery modules will execute without parameter errors

### Issue 2: Authentication Failures
- **Cause**: ClientId and TenantId fields are swapped in stored credentials
- **Fix**: Run `.\Scripts\Fix-CredentialFieldMixup.ps1 -CompanyName "Zedra"`
- **Result**: Authentication to Microsoft Graph and Azure services will succeed

### Complete Resolution Process
1. Fix the Force parameter issue first (prevents module execution errors)
2. Fix the credential field mixup (enables authentication)
3. Re-run the discovery suite with both issues resolved

The provided scripts automate both fixes and provide detailed diagnostics to prevent future issues.