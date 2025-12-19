# ActiveDirectoryDiscovery.psm1 - Before/After Comparison

## Change 1: Get-AuthInfoFromConfiguration Function

### BEFORE (Session-based authentication)
```powershell
function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # For on-premises AD, we don't need cloud authentication
    # Return a dummy auth object to satisfy the template
    Write-ActiveDirectoryLog -Message "ActiveDirectory module uses Windows authentication, no cloud credentials needed" -Level "DEBUG"
    return @{
        AuthType = "WindowsIntegrated"
        Domain = $Configuration.environment.domainController
    }
}
```

### AFTER (Credential extraction)
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

**Key Differences:**
- ✅ Extracts `TenantId`, `ClientId`, `ClientSecret` from `$Configuration`
- ✅ Validates credentials are present before using
- ✅ Returns `AuthType = "GraphAPI"` when credentials available
- ✅ Logs authentication method selection
- ✅ Maintains fallback to Windows authentication

---

## Change 2: Authentication Section in Main Function

### BEFORE (No Graph authentication)
```powershell
# 4. AUTHENTICATE & CONNECT
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

### AFTER (With Graph API authentication)
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

**Key Differences:**
- ✅ Calls `Get-AuthInfoFromConfiguration` to retrieve credentials
- ✅ Checks if `AuthType = "GraphAPI"`
- ✅ Imports `Microsoft.Graph.Authentication` module if available
- ✅ Converts `ClientSecret` to `SecureString`
- ✅ Creates `PSCredential` object with `ClientId` and secure secret
- ✅ Connects to Microsoft Graph using `Connect-MgGraph`
- ✅ Tracks authentication method and tenant ID in metadata
- ✅ Graceful fallback if Graph connection fails
- ✅ Maintains existing AD module authentication flow

---

## Change 3: Cleanup Section (Planned)

### BEFORE (No Graph disconnection)
```powershell
# 8. CLEANUP & COMPLETE
Write-ActiveDirectoryLog -Level "INFO" -Message "Cleaning up..." -Context $Context

$stopwatch.Stop()
$result.EndTime = Get-Date
Write-ActiveDirectoryLog -Level "HEADER" -Message "Discovery completed in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')) - Found $($result.RecordCount) records!" -Context $Context
```

### AFTER (With Graph disconnection - TO BE APPLIED)
```powershell
# 8. CLEANUP & COMPLETE
Write-ActiveDirectoryLog -Level "INFO" -Message "Cleaning up..." -Context $Context

# Disconnect from Microsoft Graph if connected
try {
    if (Get-Command -Name Disconnect-MgGraph -ErrorAction SilentlyContinue) {
        Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
        Write-ActiveDirectoryLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
    }
} catch {
    # Ignore disconnection errors
}

$stopwatch.Stop()
$result.EndTime = Get-Date
Write-ActiveDirectoryLog -Level "HEADER" -Message "Discovery completed in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')) - Found $($result.RecordCount) records!" -Context $Context
```

**Key Differences:**
- ✅ Checks if `Disconnect-MgGraph` command exists
- ✅ Disconnects from Microsoft Graph if connected
- ✅ Logs disconnection
- ✅ Ignores disconnection errors (defensive programming)

---

## Summary of Changes

| Change | Status | Impact |
|--------|--------|--------|
| Extract credentials from `$Configuration` | ✅ Applied | HIGH - Core authentication change |
| Add Graph API authentication | ✅ Applied | HIGH - Enables credential-based auth |
| Add metadata tracking | ✅ Applied | MEDIUM - Better observability |
| Add Graph disconnection | ⏳ Pending | LOW - Cleanup/best practice |

## Authentication Flow Comparison

### BEFORE
```
1. Import ActiveDirectory module
2. Use Windows integrated authentication
3. Connect to domain controller
4. Perform discovery
5. Complete
```

### AFTER
```
1. Extract credentials from Configuration
2. IF credentials present THEN
   a. Check for Microsoft.Graph.Authentication module
   b. Convert ClientSecret to SecureString
   c. Create PSCredential
   d. Connect to Microsoft Graph
   e. Track authentication method
3. Import ActiveDirectory module (fallback or primary)
4. Connect to domain controller
5. Perform discovery
6. Disconnect from Graph (planned)
7. Complete
```

## Error Handling Improvements

### BEFORE
- Basic error handling for AD connection
- No credential validation

### AFTER
- Validates credentials are present before use
- Checks for Microsoft.Graph.Authentication module availability
- Graceful fallback if Graph connection fails
- Detailed logging at each step
- Error context preserved in logs
- Multiple layers of error handling

## Logging Improvements

### BEFORE
```
[ActiveDirectory] ActiveDirectory module uses Windows authentication, no cloud credentials needed
[ActiveDirectory] Checking Active Directory module...
[ActiveDirectory] Connected to domain: contoso.com
```

### AFTER
```
[ActiveDirectory] Auth - Using Graph API credentials. Tenant: xxxxxx, Client: xxxxxx
[ActiveDirectory] Checking authentication method...
[ActiveDirectory] Connecting to Microsoft Graph with provided credentials...
[ActiveDirectory] Connected to Microsoft Graph successfully
[ActiveDirectory] Checking Active Directory module...
[ActiveDirectory] Connected to domain: contoso.com
```

## Backward Compatibility

✅ **Fully backward compatible** - Module still works with Windows integrated authentication if Graph credentials are not provided in configuration.

## Required Configuration

For Graph API authentication to work, `$Configuration` must include:

```powershell
$Configuration = @{
    TenantId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ClientId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ClientSecret = "your-client-secret"
    environment = @{
        domainController = "dc.domain.com"
        globalCatalog = "gc.domain.com"  # Optional
    }
}
```

If these are missing, module falls back to Windows authentication automatically.
