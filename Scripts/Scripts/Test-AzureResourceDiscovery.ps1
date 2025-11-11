# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Quick test script for Azure Resource Discovery with ARM API permissions
.DESCRIPTION
    Tests the Azure Resource Discovery module with the updated ARM API permissions
    to ensure Azure infrastructure discovery works correctly.
.PARAMETER CompanyName
    Company name for data organization (default: "ljpops")
.EXAMPLE
    .\Test-AzureResourceDiscovery.ps1
.EXAMPLE
    .\Test-AzureResourceDiscovery.ps1 -CompanyName "yourcompany"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName = "ljpops"
)

Write-Host "=== Testing Azure Resource Discovery ===" -ForegroundColor Cyan
Write-Host "Company: $CompanyName" -ForegroundColor Green
Write-Host ""

try {
    # Import required modules
    $modulePath = Join-Path $PSScriptRoot "..\Modules\Discovery\AzureResourceDiscovery.psm1"
    if (Test-Path $modulePath) {
        Import-Module $modulePath -Force
        Write-Host "✅ AzureResourceDiscovery module loaded" -ForegroundColor Green
    } else {
        throw "AzureResourceDiscovery module not found at: $modulePath"
    }

    # Test configuration
    $config = @{
        TenantId = $null
        ClientId = $null
        ClientSecret = $null
    }

    # Try to load from stored credentials
    $credsPath = Join-Path $PSScriptRoot "..\DiscoveryData\$CompanyName\Credentials\discoverycredentials.config"
    if (Test-Path $credsPath) {
        try {
            $creds = Get-Content $credsPath | ConvertFrom-Json
            if ($creds.Azure) {
                $config.TenantId = $creds.Azure.TenantId
                $config.ClientId = $creds.Azure.ClientId
                $config.ClientSecret = $creds.Azure.ClientSecret
                Write-Host "✅ Credentials loaded from file" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Could not load credentials, will use manual authentication" -ForegroundColor Yellow
        }
    }

    # Setup session
    $sessionId = [Guid]::NewGuid().ToString()
    $context = @{
        CompanyName = $CompanyName
        SessionId = $sessionId
    }

    Write-Host "Starting Azure Resource Discovery..." -ForegroundColor Yellow

    # Execute discovery
    $result = Invoke-AzureResourceDiscovery -Configuration $config -Context $context -SessionId $sessionId

    if ($result) {
        Write-Host ""
        Write-Host "🎉 SUCCESS! Azure Resource Discovery completed" -ForegroundColor Green
        Write-Host ""

        # Show summary
        foreach ($resourceGroup in $result) {
            if ($resourceGroup -and $resourceGroup.Count -gt 0) {
                Write-Host "📊 $($resourceGroup.Name): $($resourceGroup.Count) resources found" -ForegroundColor Cyan
            }
        }

        Write-Host ""
        Write-Host "🚀 Azure Resource Discovery is working with ARM API permissions!" -ForegroundColor Green
        Write-Host "You can now run the full Azure Resource Discovery using:" -ForegroundColor White
        Write-Host ".\Scripts\AzureResourceDiscoveryLauncher.ps1 -CompanyName `"$CompanyName`"" -ForegroundColor White

    } else {
        Write-Host ""
        Write-Host "❌ Discovery returned no results. Check authentication." -ForegroundColor Red
        Write-Host "Make sure your app registration has the required ARM API permissions." -ForegroundColor Red
    }

} catch {
    Write-Host ""
    Write-Host "❌ Test Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""

    if ($_.Exception.Message -match "authentication|permission|unauthorized") {
        Write-Host "🔧 To fix this:" -ForegroundColor Yellow
        Write-Host "1. Update your app registration with ARM API permissions:" -ForegroundColor White
        Write-Host "   .\Scripts\DiscoveryCreateAppRegistration.ps1 -CompanyName `"$CompanyName`" -Force" -ForegroundColor White
        Write-Host "2. Grant admin consent for the new permissions in Azure AD" -ForegroundColor White
        Write-Host "3. Re-run this test" -ForegroundColor White
    }

    $stackTrace = $_.ScriptStackTrace
    if ($stackTrace) {
        Write-Host ""
        Write-Host "Debug Info:" -ForegroundColor Gray
        Write-Host $stackTrace -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan