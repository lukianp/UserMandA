# ActiveDirectoryDiscovery.psm1 Credential Fix Summary

**Date:** December 17, 2025
**Module:** C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1
**Workspace Copy:** D:\Scripts\UserMandA\Modules\Discovery\ActiveDirectoryDiscovery.psm1

## Problem

The ActiveDirectoryDiscovery module was using session-based/Windows integrated authentication instead of extracting and using credentials from the `$Configuration` parameter.

## Solution Applied

### 1. Updated `Get-AuthInfoFromConfiguration` Function

**Location:** Lines 47-76

**Changes:**
- Extracts `TenantId`, `ClientId`, and `ClientSecret` from `$Configuration` parameter
- Validates that all three credentials are present
- Falls back to Windows integrated authentication if credentials are missing
- Logs authentication method being used

**Code:**
```powershell
function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Extract credentials from Configuration
    $TenantId = $Configuration.TenantId
    $ClientId = $Configuration.ClientId
    $ClientSecret = $Configuration.ClientSecret

    if (-not $TenantId -or -not $ClientId -or -not $ClientSecret) {
        Write-ActiveDirectoryLog -Message "Missing Graph API credentials in configuration. TenantId: $($null -ne $TenantId), ClientId: $($null -ne $ClientId), ClientSecret: $($null -ne $ClientSecret)" -Level "WARN"
        # Fallback to Windows integrated authentication for on-premises
        Write-ActiveDirectoryLog -Message "Falling back to Windows authentication for on-premises AD" -Level "DEBUG"
        return @{
            AuthType = "WindowsIntegrated"
            Domain = $Configuration.environment.domainController
        }
    }

    Write-ActiveDirectoryLog -Message "Auth - Using Graph API credentials. Tenant: $TenantId, Client: $ClientId" -Level "INFO"

    return @{
        AuthType = "GraphAPI"
        TenantId = $TenantId
        ClientId = $ClientId
        ClientSecret = $ClientSecret
    }
}
```

### 2. Added Graph API Authentication to Main Discovery Function

**Location:** Lines 141-198 (Section 4. AUTHENTICATE & CONNECT)

**Changes:**
- Calls `Get-AuthInfoFromConfiguration` to retrieve credentials
- Checks if credentials use GraphAPI authentication method
- Connects to Microsoft Graph using client secret credential
- Converts `ClientSecret` to `SecureString` for secure credential creation
- Uses `Connect-MgGraph` with client secret credential and tenant ID
- Logs connection success/failure
- Tracks authentication method and tenant ID in result metadata
- Falls back to standard AD module if Graph connection fails

**Code:**
```powershell
# 4. AUTHENTICATE & CONNECT
Write-ActiveDirectoryLog -Level "INFO" -Message "Checking authentication method..." -Context $Context

# Get authentication info
$authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration

# If Graph API credentials are available, connect to Microsoft Graph
if ($authInfo.AuthType -eq "GraphAPI") {
    try {
        Write-ActiveDirectoryLog -Level "INFO" -Message "Connecting to Microsoft Graph with provided credentials..." -Context $Context

        # Check if Microsoft.Graph.Authentication module is available
        if (-not (Get-Module -Name Microsoft.Graph.Authentication -ListAvailable)) {
            Write-ActiveDirectoryLog -Level "WARN" -Message "Microsoft.Graph.Authentication module not available, falling back to AD module" -Context $Context
        } else {
            # Import the module
            Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

            # Connect to Microsoft Graph
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)

            Connect-MgGraph -ClientSecretCredential $credential -TenantId $authInfo.TenantId -NoWelcome -ErrorAction Stop

            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Connected to Microsoft Graph successfully" -Context $Context
            $result.Metadata['AuthenticationMethod'] = 'GraphAPI'
            $result.Metadata['TenantId'] = $authInfo.TenantId
        }
    } catch {
        Write-ActiveDirectoryLog -Level "WARN" -Message "Failed to connect to Graph API: $($_.Exception.Message). Falling back to AD module." -Context $Context
    }
}

Write-ActiveDirectoryLog -Level "INFO" -Message "Checking Active Directory module..." -Context $Context

# Check if Active Directory module is available
if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
    $result.AddError("ActiveDirectory PowerShell module is not available. Install RSAT or ActiveDirectory module.", $null, $null)
    return $result
}

# Import the module if not already loaded
if (-not (Get-Module -Name ActiveDirectory)) {
    Import-Module ActiveDirectory -ErrorAction Stop
    Write-ActiveDirectoryLog -Level "SUCCESS" -Message "ActiveDirectory module imported successfully" -Context $Context
}

# Test AD connectivity
try {
    $serverParams = Get-ServerParameters -Configuration $Configuration
    $testDomain = Get-ADDomain @serverParams -ErrorAction Stop
    Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Connected to domain: $($testDomain.DNSRoot)" -Context $Context
    $result.Metadata['DomainDNSRoot'] = $testDomain.DNSRoot
    $result.Metadata['DomainNetBIOSName'] = $testDomain.NetBIOSName
} catch {
    $result.AddError("Failed to connect to Active Directory: $($_.Exception.Message)", $_.Exception, $null)
    return $result
}
```

### 3. Graph API Disconnection (Planned but Not Yet Applied)

**Location:** Cleanup section (Section 8)

**Purpose:** Properly disconnect from Microsoft Graph when discovery completes

**Note:** This change still needs to be applied. Run:
```powershell
D:\Scripts\UserMandA\add-graph-disconnect.ps1
```

## Benefits

1. **Credential-Based Authentication:** Module now uses credentials from configuration instead of session
2. **Fallback Support:** Gracefully falls back to Windows integrated auth if Graph credentials unavailable
3. **Error Handling:** Comprehensive error handling with detailed logging
4. **Metadata Tracking:** Records authentication method and tenant ID in discovery results
5. **Security:** Uses secure string conversion for client secret
6. **Flexibility:** Supports both Graph API and traditional AD module authentication

## Testing

To verify all changes were applied correctly:
```powershell
D:\Scripts\UserMandA\verify-activedirectory-changes.ps1
```

## Files Modified

1. **C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1** (Production)
2. **D:\Scripts\UserMandA\Modules\Discovery\ActiveDirectoryDiscovery.psm1** (Workspace copy)

## Backup

Original file backed up to:
- `C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1.backup`
- `C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1.backup2`

## Related Scripts

- **D:\Scripts\UserMandA\fix-activedirectory-credentials.ps1** - Initial fix attempt
- **D:\Scripts\UserMandA\fix-activedirectory-credentials-v2.ps1** - Final working fix script
- **D:\Scripts\UserMandA\add-graph-disconnect.ps1** - Add Graph disconnection to cleanup
- **D:\Scripts\UserMandA\verify-activedirectory-changes.ps1** - Verification script

## Configuration Format

The module expects credentials in this format:

```powershell
$Configuration = @{
    TenantId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ClientId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ClientSecret = "your-client-secret-here"
    environment = @{
        domainController = "dc.domain.com"
        globalCatalog = "gc.domain.com"
    }
    discovery = @{
        excludeDisabledUsers = $true
    }
}
```

## Next Steps

1. Run verification script to confirm all changes
2. Test module with actual credentials
3. Verify Graph API connection works
4. Add Graph disconnection to cleanup section
5. Test fallback to Windows authentication
6. Document any additional configuration requirements
