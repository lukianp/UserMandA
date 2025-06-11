# New Authentication System - Quick Reference Guide
**M&A Discovery Suite v3.0 - Developer Guide**

## Overview

The new authentication system eliminates all the complex authentication context passing and provides a simple, thread-safe, session-based approach.

## Key Benefits

- ✅ **90% less code** - Discovery modules now need only 3 lines for authentication
- ✅ **Thread-safe** - No more race conditions or context corruption
- ✅ **Secure** - No plain text credentials in runspace memory
- ✅ **Automatic** - Connection management and cleanup handled automatically

## For Discovery Module Developers

### Old Way (Complex - 90+ lines)
```powershell
function Get-AuthInfoFromConfiguration {
    # 45+ lines of complex authentication extraction
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    # ... more complexity
}

function Invoke-MyDiscovery {
    param([hashtable]$Configuration, [hashtable]$Context)
    
    # Complex authentication setup
    $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
    $securePassword = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $securePassword)
    
    # Manual connection management
    Connect-MgGraph -ClientSecretCredential $credential -TenantId $authInfo.TenantId
    Connect-AzAccount -ServicePrincipal -Credential $credential -Tenant $authInfo.TenantId
    
    try {
        # Discovery logic here
    } finally {
        # Manual cleanup
        Disconnect-MgGraph
        Disconnect-AzAccount
    }
}
```

### New Way (Simple - 3 lines)
```powershell
function Invoke-MyDiscovery {
    param([hashtable]$Configuration, [hashtable]$Context, [string]$SessionId)
    
    # Simple authentication - all complexity handled internally!
    $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
    $azureAuth = Get-AuthenticationForService -Service "Azure" -SessionId $SessionId
    
    # Discovery logic here - connections are ready to use!
    $users = Get-MgUser -All
    $subscriptions = Get-AzSubscription
    
    # No cleanup needed - auth service handles everything automatically!
}
```

## API Reference

### Core Functions

#### Get-AuthenticationForService
Gets authentication for a specific Microsoft service.

```powershell
$auth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
$auth = Get-AuthenticationForService -Service "Azure" -SessionId $SessionId
$auth = Get-AuthenticationForService -Service "Exchange" -SessionId $SessionId
$auth = Get-AuthenticationForService -Service "SharePoint" -SessionId $SessionId
$auth = Get-AuthenticationForService -Service "Teams" -SessionId $SessionId
```

**Parameters:**
- `Service` - Service name (Graph, Azure, Exchange, SharePoint, Teams)
- `SessionId` - Authentication session ID (passed from orchestrator)

**Returns:** Connection object with service context

### Session Management (For Orchestrator Use)

#### Initialize-AuthenticationService
Initializes the authentication service with credentials.

```powershell
$result = Initialize-AuthenticationService -Configuration $config
if ($result.Success) {
    $sessionId = $result.SessionId
}
```

#### Test-AuthenticationService
Tests authentication service and connections.

```powershell
$status = Test-AuthenticationService
if ($status.Success) {
    # All services connected successfully
}
```

#### Stop-AuthenticationService
Stops authentication service and cleans up all connections.

```powershell
Stop-AuthenticationService
```

### Session Management (Advanced)

#### New-AuthenticationSession
Creates a new authentication session.

```powershell
$sessionId = New-AuthenticationSession -TenantId $tenant -ClientId $client -ClientSecret $secret
```

#### Get-AuthenticationSession
Retrieves an authentication session.

```powershell
$session = Get-AuthenticationSession -SessionId $sessionId
if ($session.IsValid()) {
    # Session is valid and ready to use
}
```

#### Remove-AuthenticationSession
Removes an authentication session.

```powershell
$removed = Remove-AuthenticationSession -SessionId $sessionId
```

## Discovery Module Template

Here's a complete template for creating new discovery modules:

```powershell
# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    [Your Module] Discovery Module using new authentication service
.DESCRIPTION
    Discovers [your resources] using the new thread-safe session-based authentication system.
.NOTES
    Author: [Your Name]
    Version: 3.0.0
    Architecture: New thread-safe session-based authentication
#>

# Import authentication service
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\AuthenticationService.psm1") -Force

function Write-[YourModule]Log {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[[YourModule]] $Message" -Level $Level -Component "[YourModule]Discovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }; "WARN" { "Yellow" }; "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }; "HEADER" { "Cyan" }; default { "White" }
        }
        Write-Host "[[YourModule]] $Message" -ForegroundColor $color
    }
}

function Invoke-[YourModule]Discovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-[YourModule]Log -Level "HEADER" -Message "Starting Discovery (v3.0 - Session-based)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('[YourModule]')
    } else {
        $result = @{
            Success = $true; ModuleName = '[YourModule]'; RecordCount = 0;
            Errors = [System.Collections.ArrayList]::new(); 
            Warnings = [System.Collections.ArrayList]::new(); 
            Metadata = @{}; StartTime = Get-Date; EndTime = $null; 
            ExecutionId = [guid]::NewGuid().ToString();
            AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # Validate prerequisites
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput

        # SIMPLE AUTHENTICATION - Just get the service connections!
        Write-[YourModule]Log -Level "INFO" -Message "Getting authentication for services..." -Context $Context
        
        try {
            # Get authentication for required services
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-[YourModule]Log -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
            
            # Add other services as needed
            # $azureAuth = Get-AuthenticationForService -Service "Azure" -SessionId $SessionId
            
        } catch {
            $result.AddError("Failed to authenticate with services: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
            return $result
        }

        # PERFORM DISCOVERY
        Write-[YourModule]Log -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Your discovery logic here
        # Example:
        # $items = Get-MgUser -All
        # foreach ($item in $items) {
        #     $itemObj = [PSCustomObject]@{
        #         Id = $item.Id
        #         DisplayName = $item.DisplayName
        #         # ... other properties
        #         _ObjectType = 'User'
        #     }
        #     $null = $allDiscoveredData.Add($itemObj)
        # }

        # EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-[YourModule]Log -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by object type and export
            $objectGroups = $allDiscoveredData | Group-Object -Property _ObjectType
            
            foreach ($group in $objectGroups) {
                $objectType = $group.Name
                $objects = $group.Group
                
                # Add metadata to each record
                $exportData = $objects | ForEach-Object {
                    $obj = $_.PSObject.Copy()
                    $obj.PSObject.Properties.Remove('_ObjectType')
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "[YourModule]" -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                    $obj
                }
                
                # Export to CSV
                $fileName = "[YourModule]$objectType.csv"
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-[YourModule]Log -Level "SUCCESS" -Message "Exported $($exportData.Count) $objectType records to $fileName" -Context $Context
            }
        }

        # FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-[YourModule]Log -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
    } finally {
        # CLEANUP - No manual disconnection needed!
        $stopwatch.Stop()
        $result.Complete()
        Write-[YourModule]Log -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# Export the discovery function
Export-ModuleMember -Function Invoke-[YourModule]Discovery

Write-Host "[[YourModule]Discovery.psm1] Discovery module loaded (v3.0)" -ForegroundColor Green
```

## Configuration Changes

### Authentication Configuration
Authentication is now configured separately from business logic:

```json
{
  "authentication": {
    "credentialStorePath": "C:\\secure\\credentials.json",
    "sessionTimeoutMinutes": 480,
    "tokenRefreshThreshold": 600,
    "authenticationMethod": "ClientSecret"
  }
}
```

### Business Configuration
Business configuration is now clean and focused:

```json
{
  "discovery": {
    "enabledSources": ["Azure", "Graph", "Exchange"],
    "maxConcurrentJobs": 4,
    "batchSize": 1000
  },
  "azure": {
    "includeAzureADDevices": true,
    "includeConditionalAccess": true
  }
}
```

## Error Handling

### Automatic Error Handling
The authentication service provides automatic error handling:

```powershell
try {
    $auth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
    # Service is ready to use
} catch {
    # Authentication service handles retries automatically
    # Only critical failures reach here
    Write-Error "Authentication failed: $($_.Exception.Message)"
}
```

### Session Validation
Sessions are automatically validated:

```powershell
$session = Get-AuthenticationSession -SessionId $SessionId
if (-not $session) {
    throw "Authentication session not found or expired: $SessionId"
}
```

## Testing

### Run the Test Suite
```powershell
# Basic tests
.\Test-NewAuthenticationArchitecture.ps1

# Include concurrency tests
.\Test-NewAuthenticationArchitecture.ps1 -TestConcurrency

# Skip interactive prompts
.\Test-NewAuthenticationArchitecture.ps1 -SkipInteractive
```

### Manual Testing
```powershell
# Test authentication service
$result = Initialize-AuthenticationService -Configuration $config
$status = Test-AuthenticationService
Stop-AuthenticationService
```

## Migration Checklist

When updating existing discovery modules:

1. ✅ **Update function signature** - Add `[string]$SessionId` parameter
2. ✅ **Remove authentication extraction** - Delete `Get-AuthInfoFromConfiguration` logic
3. ✅ **Replace connection code** - Use `Get-AuthenticationForService`
4. ✅ **Remove manual cleanup** - Delete disconnect commands
5. ✅ **Add session metadata** - Include `_SessionId` in exported data
6. ✅ **Test thoroughly** - Verify thread-safety and performance

## Support

For questions or issues with the new authentication system:

1. **Check the logs** - Authentication service provides detailed logging
2. **Run the test suite** - Validate your environment
3. **Review examples** - See `AzureDiscovery.psm1` for a complete example
4. **Check documentation** - See `Authentication_Rearchitecture_Implementation_Summary.md`

## Performance Tips

1. **Reuse connections** - The auth service caches connections automatically
2. **Use session IDs** - Never pass credentials directly to runspaces
3. **Let the service manage** - Don't manually disconnect from services
4. **Monitor sessions** - Use `Get-AuthenticationSessionCount` to track usage

The new authentication system makes development much simpler while providing better security and performance!