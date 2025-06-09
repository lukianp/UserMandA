# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test script for Certificate Elimination Implementation
.DESCRIPTION
    Validates that the M&A Discovery Suite can connect to all Microsoft services
    using only client secret authentication without any certificate dependencies.
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-08
    Purpose: Certificate Elimination Validation
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = ".\Configuration\default-config.json",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSharePoint,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTeams,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Set error handling
$ErrorActionPreference = "Stop"

# Import required modules
try {
    Write-Host "🔄 Loading required modules..." -ForegroundColor Cyan
    
    # Import the new unified connection manager
    $unifiedManagerPath = Join-Path $PSScriptRoot "..\Modules\Connectivity\UnifiedConnectionManager.psm1"
    if (Test-Path $unifiedManagerPath) {
        Import-Module $unifiedManagerPath -Force
        Write-Host "✅ Loaded UnifiedConnectionManager" -ForegroundColor Green
    } else {
        throw "UnifiedConnectionManager module not found at: $unifiedManagerPath"
    }
    
    # Import authentication modules
    $authPath = Join-Path $PSScriptRoot "..\Modules\Authentication\Authentication.psm1"
    if (Test-Path $authPath) {
        Import-Module $authPath -Force
        Write-Host "✅ Loaded Authentication module" -ForegroundColor Green
    }
    
    $credPath = Join-Path $PSScriptRoot "..\Modules\Authentication\CredentialManagement.psm1"
    if (Test-Path $credPath) {
        Import-Module $credPath -Force
        Write-Host "✅ Loaded CredentialManagement module" -ForegroundColor Green
    }
    
    # Import logging if available
    $loggingPath = Join-Path $PSScriptRoot "..\Modules\Utilities\EnhancedLogging.psm1"
    if (Test-Path $loggingPath) {
        Import-Module $loggingPath -Force
        Write-Host "✅ Loaded EnhancedLogging module" -ForegroundColor Green
    }
    
} catch {
    Write-Error "Failed to load required modules: $($_.Exception.Message)"
    exit 1
}

# Load configuration
try {
    Write-Host "🔄 Loading configuration..." -ForegroundColor Cyan
    
    if (-not (Test-Path $ConfigPath)) {
        throw "Configuration file not found: $ConfigPath"
    }
    
    $configContent = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    $config = @{}
    
    # Convert PSCustomObject to hashtable recursively
    function ConvertTo-Hashtable {
        param($InputObject)
        
        if ($InputObject -is [PSCustomObject]) {
            $hash = @{}
            $InputObject.PSObject.Properties | ForEach-Object {
                $hash[$_.Name] = ConvertTo-Hashtable $_.Value
            }
            return $hash
        } elseif ($InputObject -is [Array]) {
            return $InputObject | ForEach-Object { ConvertTo-Hashtable $_ }
        } else {
            return $InputObject
        }
    }
    
    $config = ConvertTo-Hashtable $configContent
    Write-Host "✅ Configuration loaded successfully" -ForegroundColor Green
    
} catch {
    Write-Error "Failed to load configuration: $($_.Exception.Message)"
    exit 1
}

# Validate configuration for certificate elimination
try {
    Write-Host "🔄 Validating certificate elimination configuration..." -ForegroundColor Cyan
    
    # Check that authentication method is ClientSecret
    if ($config.authentication.authenticationMethod -ne "ClientSecret") {
        Write-Warning "⚠️  Authentication method is '$($config.authentication.authenticationMethod)' - should be 'ClientSecret'"
    } else {
        Write-Host "✅ Authentication method is ClientSecret" -ForegroundColor Green
    }
    
    # Check that certificate thumbprint is not present
    if ($config.authentication.PSObject.Properties['certificateThumbprint']) {
        Write-Warning "⚠️  Certificate thumbprint still present in configuration"
    } else {
        Write-Host "✅ No certificate thumbprint in configuration" -ForegroundColor Green
    }
    
    # Check credential store path
    if ($config.authentication.credentialStorePath) {
        Write-Host "✅ Credential store path configured: $($config.authentication.credentialStorePath)" -ForegroundColor Green
    } else {
        Write-Warning "⚠️  No credential store path configured"
    }
    
} catch {
    Write-Error "Configuration validation failed: $($_.Exception.Message)"
    exit 1
}

# Test unified authentication
try {
    Write-Host "`n🔄 Testing unified authentication initialization..." -ForegroundColor Cyan
    
    $authResult = Initialize-UnifiedAuthentication -Configuration $config
    
    if ($authResult) {
        Write-Host "✅ Unified authentication initialized successfully" -ForegroundColor Green
    } else {
        throw "Unified authentication initialization failed"
    }
    
} catch {
    Write-Error "Unified authentication test failed: $($_.Exception.Message)"
    exit 1
}

# Test individual service connections
$connectionResults = @{
    Graph = $false
    ExchangeOnline = $false
    SharePointOnline = $false
    Teams = $false
}

# Test Microsoft Graph connection
try {
    Write-Host "`n🔄 Testing Microsoft Graph connection..." -ForegroundColor Cyan
    
    $graphResult = Connect-UnifiedMicrosoftGraph
    
    if ($graphResult) {
        Write-Host "✅ Microsoft Graph connected successfully" -ForegroundColor Green
        $connectionResults.Graph = $true
        
        # Test a simple Graph operation
        try {
            $org = Get-MgOrganization -Top 1
            Write-Host "  📊 Organization: $($org.DisplayName)" -ForegroundColor Gray
        } catch {
            Write-Warning "  ⚠️  Graph connection established but test query failed: $($_.Exception.Message)"
        }
    } else {
        Write-Host "❌ Microsoft Graph connection failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Microsoft Graph connection error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Exchange Online connection
try {
    Write-Host "`n🔄 Testing Exchange Online connection..." -ForegroundColor Cyan
    
    $exchangeResult = Connect-UnifiedExchangeOnline
    
    if ($exchangeResult) {
        Write-Host "✅ Exchange Online connected successfully" -ForegroundColor Green
        $connectionResults.ExchangeOnline = $true
        
        # Test a simple Exchange operation
        try {
            $orgConfig = Get-OrganizationConfig
            Write-Host "  📧 Organization: $($orgConfig.DisplayName)" -ForegroundColor Gray
        } catch {
            Write-Warning "  ⚠️  Exchange connection established but test query failed: $($_.Exception.Message)"
        }
    } else {
        Write-Host "❌ Exchange Online connection failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Exchange Online connection error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test SharePoint Online connection (if not skipped)
if (-not $SkipSharePoint) {
    try {
        Write-Host "`n🔄 Testing SharePoint Online connection..." -ForegroundColor Cyan
        
        $sharePointResult = Connect-UnifiedSharePointOnline -Configuration $config
        
        if ($sharePointResult) {
            Write-Host "✅ SharePoint Online connected successfully" -ForegroundColor Green
            $connectionResults.SharePointOnline = $true
            
            # Test a simple SharePoint operation
            try {
                $sites = Get-SPOSite -Limit 1
                Write-Host "  🌐 SharePoint sites accessible: Yes" -ForegroundColor Gray
            } catch {
                Write-Warning "  ⚠️  SharePoint connection established but test query failed: $($_.Exception.Message)"
            }
        } else {
            Write-Host "❌ SharePoint Online connection failed" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ SharePoint Online connection error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n⏭️  Skipping SharePoint Online connection test" -ForegroundColor Yellow
}

# Test Microsoft Teams connection (if not skipped)
if (-not $SkipTeams) {
    try {
        Write-Host "`n🔄 Testing Microsoft Teams connection..." -ForegroundColor Cyan
        
        $teamsResult = Connect-UnifiedMicrosoftTeams
        
        if ($teamsResult) {
            Write-Host "✅ Microsoft Teams connected successfully" -ForegroundColor Green
            $connectionResults.Teams = $true
            
            # Test a simple Teams operation
            try {
                $teams = Get-Team | Select-Object -First 1
                Write-Host "  👥 Teams accessible: Yes" -ForegroundColor Gray
            } catch {
                Write-Warning "  ⚠️  Teams connection established but test query failed: $($_.Exception.Message)"
            }
        } else {
            Write-Host "❌ Microsoft Teams connection failed" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Microsoft Teams connection error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n⏭️  Skipping Microsoft Teams connection test" -ForegroundColor Yellow
}

# Test unified connection status
try {
    Write-Host "`n🔄 Testing unified connection status..." -ForegroundColor Cyan
    
    $status = Get-UnifiedConnectionStatus
    
    Write-Host "📊 Connection Status Summary:" -ForegroundColor White
    foreach ($service in $status.GetEnumerator()) {
        $statusIcon = if ($service.Value.Connected) { "✅" } else { "❌" }
        $statusText = if ($service.Value.Connected) { "Connected" } else { "Disconnected" }
        Write-Host "  $statusIcon $($service.Key): $statusText" -ForegroundColor $(if ($service.Value.Connected) { "Green" } else { "Red" })
        
        if ($service.Value.LastError) {
            Write-Host "    Error: $($service.Value.LastError)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Warning "Failed to get unified connection status: $($_.Exception.Message)"
}

# Generate final report
Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "🎯 CERTIFICATE ELIMINATION TEST RESULTS" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "="*80 -ForegroundColor Cyan

$successCount = ($connectionResults.Values | Where-Object { $_ }).Count
$totalCount = $connectionResults.Count
$skippedCount = 0

if ($SkipSharePoint) { $skippedCount++; $totalCount-- }
if ($SkipTeams) { $skippedCount++; $totalCount-- }

Write-Host "`n📈 Overall Results:" -ForegroundColor White
Write-Host "  ✅ Successful Connections: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed Connections: $($totalCount - $successCount)" -ForegroundColor Red
Write-Host "  ⏭️  Skipped Tests: $skippedCount" -ForegroundColor Yellow
Write-Host "  📊 Success Rate: $([math]::Round(($successCount / $totalCount) * 100, 1))%" -ForegroundColor Cyan

Write-Host "`n🔍 Detailed Results:" -ForegroundColor White
foreach ($result in $connectionResults.GetEnumerator()) {
    $icon = if ($result.Value) { "✅" } else { "❌" }
    $status = if ($result.Value) { "SUCCESS" } else { "FAILED" }
    Write-Host "  $icon $($result.Key): $status" -ForegroundColor $(if ($result.Value) { "Green" } else { "Red" })
}

Write-Host "`n🎉 Certificate Elimination Status:" -ForegroundColor White
if ($successCount -eq $totalCount) {
    Write-Host "  ✅ COMPLETE - All services connected without certificates!" -ForegroundColor Green -BackgroundColor DarkGreen
} elseif ($successCount -gt 0) {
    Write-Host "  ⚠️  PARTIAL - Some services connected, others need attention" -ForegroundColor Yellow -BackgroundColor DarkYellow
} else {
    Write-Host "  ❌ FAILED - No services connected successfully" -ForegroundColor Red -BackgroundColor DarkRed
}

Write-Host "`n💡 Next Steps:" -ForegroundColor White
if ($successCount -eq $totalCount) {
    Write-Host "  • Certificate elimination implementation is complete!" -ForegroundColor Green
    Write-Host "  • All discovery modules can now use unified client secret authentication" -ForegroundColor Green
    Write-Host "  • No certificate configuration required" -ForegroundColor Green
} else {
    Write-Host "  • Review failed connections and check credentials" -ForegroundColor Yellow
    Write-Host "  • Ensure all required PowerShell modules are installed" -ForegroundColor Yellow
    Write-Host "  • Verify app registration permissions" -ForegroundColor Yellow
}

# Cleanup connections
try {
    Write-Host "`n🔄 Cleaning up connections..." -ForegroundColor Cyan
    Disconnect-AllUnifiedServices
    Write-Host "✅ All connections cleaned up" -ForegroundColor Green
} catch {
    Write-Warning "Error during cleanup: $($_.Exception.Message)"
}

Write-Host "`n🏁 Certificate elimination test completed!" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Cyan

# Exit with appropriate code
if ($successCount -eq $totalCount) {
    exit 0
} else {
    exit 1
}