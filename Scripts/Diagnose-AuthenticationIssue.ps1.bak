#Requires -Version 5.1
# -*- coding: utf-8-bom -*-

<#
.SYNOPSIS
    Diagnoses Microsoft Graph and Azure authentication issues for M&A Discovery Suite
.DESCRIPTION
    This script helps identify and resolve authentication problems by:
    1. Checking credential file contents
    2. Validating tenant ID and client ID
    3. Testing connectivity to Azure endpoints
    4. Providing recommendations for fixing authentication issues
.PARAMETER CompanyName
    The company name used for profile paths (default: Zedra)
.EXAMPLE
    .\Scripts\Diagnose-AuthenticationIssue.ps1 -CompanyName "Zedra"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName = "Zedra"
)

$ErrorActionPreference = "Continue"
Write-Host "=== Microsoft Graph & Azure Authentication Diagnostics ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Helper function to safely display sensitive data
function Show-MaskedValue {
    param([string]$Value, [int]$ShowChars = 8)
    if ([string]::IsNullOrEmpty($Value)) { return "[EMPTY]" }
    if ($Value.Length -le $ShowChars) { return "$Value..." }
    return "$($Value.Substring(0, $ShowChars))..."
}

# Helper function to test GUID format
function Test-GuidFormat {
    param([string]$Value)
    try {
        $null = [System.Guid]::Parse($Value)
        return $true
    } catch {
        return $false
    }
}

# Helper function to test Azure endpoint connectivity
function Test-AzureEndpoint {
    param([string]$Endpoint, [string]$Description)
    
    Write-Host "Testing connectivity to $Description..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $Endpoint -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✓ $Description is reachable (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ✗ $Description is NOT reachable: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Known correct values for comparison (confirmed from error logs)
$correctTenantId = "c405117b-3153-4ed8-8c65-b3475764ab8f"
$correctClientId = "1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da"

# 1. Determine credential file path
Write-Host "1. CREDENTIAL FILE ANALYSIS" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "Expected correct values:" -ForegroundColor White
Write-Host "  TenantId: $correctTenantId" -ForegroundColor Green
Write-Host "  ClientId: $correctClientId" -ForegroundColor Green
Write-Host ""

$profilesBasePath = "C:\MandADiscovery\Profiles"
$credentialPath = Join-Path $profilesBasePath "$CompanyName\credentials.config"

Write-Host "Expected credential file path: $credentialPath" -ForegroundColor White

if (-not (Test-Path $credentialPath)) {
    Write-Host "  ✗ Credential file NOT FOUND!" -ForegroundColor Red
    Write-Host "  This means no credentials have been saved yet." -ForegroundColor Yellow
    Write-Host "  The system should prompt for credentials during authentication." -ForegroundColor Yellow
    $credentialFileExists = $false
} else {
    Write-Host "  ✓ Credential file exists" -ForegroundColor Green
    $credentialFileExists = $true
    
    # Try to read credential file
    try {
        # Load the CredentialFormatHandler if available
        $formatHandlerPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Utilities\CredentialFormatHandler.psm1"
        if (Test-Path $formatHandlerPath) {
            Import-Module $formatHandlerPath -Force
            
            if (Get-Command Read-CredentialFile -ErrorAction SilentlyContinue) {
                Write-Host "  Reading credential file contents..." -ForegroundColor Yellow
                $credData = Read-CredentialFile -Path $credentialPath
                
                Write-Host "  Credential file contents:" -ForegroundColor White
                Write-Host "    ClientId: $(Show-MaskedValue $credData.ClientId)" -ForegroundColor Gray
                Write-Host "    TenantId: $($credData.TenantId)" -ForegroundColor Gray
                Write-Host "    ClientSecret: $(Show-MaskedValue $credData.ClientSecret)" -ForegroundColor Gray
                Write-Host "    Created: $($credData.CreatedDate)" -ForegroundColor Gray
                Write-Host "    Expires: $($credData.ExpiryDate)" -ForegroundColor Gray
                
                # Validate GUID formats
                Write-Host "  Validating credential formats..." -ForegroundColor Yellow
                
                if (Test-GuidFormat $credData.ClientId) {
                    Write-Host "    ✓ ClientId format is valid" -ForegroundColor Green
                } else {
                    Write-Host "    ✗ ClientId format is INVALID" -ForegroundColor Red
                }
                
                if (Test-GuidFormat $credData.TenantId) {
                    Write-Host "    ✓ TenantId format is valid" -ForegroundColor Green
                } else {
                    Write-Host "    ✗ TenantId format is INVALID" -ForegroundColor Red
                }
                
                if (-not [string]::IsNullOrEmpty($credData.ClientSecret)) {
                    Write-Host "    ✓ ClientSecret is present" -ForegroundColor Green
                } else {
                    Write-Host "    ✗ ClientSecret is MISSING" -ForegroundColor Red
                }
                
                # Check for credential field mixup
                Write-Host "  Checking for credential field mixup..." -ForegroundColor Yellow
                
                if ($credData.ClientId -eq $correctTenantId -and $credData.TenantId -eq $correctClientId) {
                    Write-Host "    🔍 FIELD MIXUP DETECTED!" -ForegroundColor Red
                    Write-Host "    ClientId and TenantId fields are SWAPPED!" -ForegroundColor Red
                    Write-Host "    Current ClientId ($($credData.ClientId)) should be TenantId" -ForegroundColor Yellow
                    Write-Host "    Current TenantId ($($credData.TenantId)) should be ClientId" -ForegroundColor Yellow
                    $global:FieldMixupDetected = $true
                } elseif ($credData.TenantId -eq $correctTenantId -and $credData.ClientId -eq $correctClientId) {
                    Write-Host "    ✓ Credential fields appear to be correctly mapped" -ForegroundColor Green
                    $global:FieldMixupDetected = $false
                } else {
                    Write-Host "    ⚠️  Credentials don't match expected values" -ForegroundColor Yellow
                    Write-Host "    Neither field contains the expected correct values" -ForegroundColor Yellow
                    $global:FieldMixupDetected = $null
                }
                
                # Store for later use
                $global:DiagnosticCredentials = $credData
                
            } else {
                Write-Host "  ✗ Read-CredentialFile function not available" -ForegroundColor Red
            }
        } else {
            Write-Host "  ✗ CredentialFormatHandler module not found" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Failed to read credential file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Test Azure connectivity
Write-Host "2. AZURE CONNECTIVITY TESTS" -ForegroundColor Cyan
Write-Host "=" * 50

$azureEndpoints = @{
    "https://login.microsoftonline.com" = "Azure AD Login Endpoint"
    "https://graph.microsoft.com" = "Microsoft Graph API"
    "https://management.azure.com" = "Azure Resource Manager"
    "https://outlook.office365.com" = "Exchange Online"
}

$connectivityResults = @{}
foreach ($endpoint in $azureEndpoints.Keys) {
    $connectivityResults[$endpoint] = Test-AzureEndpoint -Endpoint $endpoint -Description $azureEndpoints[$endpoint]
}

Write-Host ""

# 3. Tenant ID validation
Write-Host "3. TENANT ID VALIDATION" -ForegroundColor Cyan
Write-Host "=" * 50

if ($credentialFileExists -and $global:DiagnosticCredentials) {
    $tenantId = $global:DiagnosticCredentials.TenantId
    Write-Host "Testing tenant ID: $tenantId" -ForegroundColor White
    
    # Test tenant discovery endpoint
    $tenantDiscoveryUrl = "https://login.microsoftonline.com/$tenantId/v2.0/.well-known/openid_configuration"
    Write-Host "Testing tenant discovery endpoint..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $tenantDiscoveryUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  ✓ Tenant ID is VALID and discoverable" -ForegroundColor Green
        Write-Host "    Issuer: $($response.issuer)" -ForegroundColor Gray
        Write-Host "    Authorization endpoint: $($response.authorization_endpoint)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ Tenant ID is INVALID or not discoverable" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*AADSTS90002*" -or $_.Exception.Message -like "*not found*") {
            Write-Host "    This is the same error seen in the logs!" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No credentials available to test tenant ID" -ForegroundColor Yellow
}

Write-Host ""

# 4. Recommendations
Write-Host "4. RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "Based on the diagnostic results:" -ForegroundColor White
Write-Host ""

if (-not $credentialFileExists) {
    Write-Host "• No credential file found - this is normal for first run" -ForegroundColor Yellow
    Write-Host "• The system will prompt for credentials during authentication" -ForegroundColor Yellow
    Write-Host "• Ensure you have the correct Azure AD application credentials" -ForegroundColor Yellow
    Write-Host "• Use these correct values when prompted:" -ForegroundColor Green
    Write-Host "  - TenantId: $correctTenantId" -ForegroundColor Gray
    Write-Host "  - ClientId: $correctClientId" -ForegroundColor Gray
} elseif ($global:DiagnosticCredentials) {
    
    # Check for field mixup first
    if ($global:FieldMixupDetected -eq $true) {
        Write-Host "• CRITICAL ISSUE IDENTIFIED: Credential field mixup detected!" -ForegroundColor Red
        Write-Host "• The ClientId and TenantId fields are swapped in the stored credentials" -ForegroundColor Red
        Write-Host "• This explains the authentication failures in the logs" -ForegroundColor Red
        Write-Host ""
        Write-Host "• SOLUTION: Run the field mixup fix script:" -ForegroundColor Green
        Write-Host "  .\Scripts\Fix-CredentialFieldMixup.ps1 -CompanyName '$CompanyName'" -ForegroundColor White
        Write-Host ""
        Write-Host "• This will automatically swap the fields to the correct positions" -ForegroundColor Green
        
    } elseif ($global:FieldMixupDetected -eq $false) {
        Write-Host "• Credential fields appear to be correctly mapped" -ForegroundColor Green
        Write-Host "• The issue may be elsewhere in the authentication process" -ForegroundColor Yellow
        
    } else {
        $tenantId = $global:DiagnosticCredentials.TenantId
        
        # Check if this is the problematic tenant ID from the logs
        if ($tenantId -eq "1d5c5c4a-2ff1-4e50-83a3-008ffb30b1da") {
            Write-Host "• ISSUE IDENTIFIED: The tenant ID in credentials matches the failing one from logs" -ForegroundColor Red
            Write-Host "• This tenant ID appears to be invalid or the tenant doesn't exist" -ForegroundColor Red
            Write-Host "• SOLUTION: You need to update the credentials with the correct tenant ID" -ForegroundColor Green
            Write-Host ""
            Write-Host "To fix this issue:" -ForegroundColor Green
            Write-Host "1. Delete the current credential file: $credentialPath" -ForegroundColor White
            Write-Host "2. Re-run the discovery suite - it will prompt for new credentials" -ForegroundColor White
            Write-Host "3. Enter the correct values when prompted:" -ForegroundColor White
            Write-Host "   - TenantId: $correctTenantId" -ForegroundColor Gray
            Write-Host "   - ClientId: $correctClientId" -ForegroundColor Gray
            
            # Offer to delete the credential file
            Write-Host ""
            $deleteChoice = Read-Host "Would you like to delete the invalid credential file now? (y/N)"
            if ($deleteChoice -eq 'y' -or $deleteChoice -eq 'Y') {
                try {
                    Remove-Item $credentialPath -Force
                    Write-Host "✓ Credential file deleted successfully" -ForegroundColor Green
                    Write-Host "  The system will prompt for new credentials on next run" -ForegroundColor Yellow
                } catch {
                    Write-Host "✗ Failed to delete credential file: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "• Credentials don't match expected values" -ForegroundColor Yellow
            Write-Host "• Neither field contains the expected correct values" -ForegroundColor Yellow
            Write-Host "• SOLUTION: Replace with correct credentials" -ForegroundColor Green
            Write-Host "  .\Scripts\Fix-CredentialFieldMixup.ps1 -CompanyName '$CompanyName'" -ForegroundColor White
        }
    }
}

# Connectivity issues
$failedConnections = $connectivityResults.Keys | Where-Object { -not $connectivityResults[$_] }
if ($failedConnections.Count -gt 0) {
    Write-Host "• Network connectivity issues detected:" -ForegroundColor Red
    foreach ($failed in $failedConnections) {
        Write-Host "  - $failed ($($azureEndpoints[$failed]))" -ForegroundColor Red
    }
    Write-Host "• Check firewall, proxy, or network restrictions" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. NEXT STEPS" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "To resolve the authentication issue:" -ForegroundColor White
Write-Host ""
Write-Host "1. Verify you have the correct Azure AD tenant information:" -ForegroundColor Yellow
Write-Host "   - Tenant ID (GUID format)" -ForegroundColor Gray
Write-Host "   - Application (Client) ID" -ForegroundColor Gray
Write-Host "   - Client Secret" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Ensure the Azure AD application has the required permissions:" -ForegroundColor Yellow
Write-Host "   - Microsoft Graph API permissions" -ForegroundColor Gray
Write-Host "   - Azure Resource Manager permissions (if using Azure discovery)" -ForegroundColor Gray
Write-Host "   - Exchange Online permissions (if using Exchange discovery)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If credentials are incorrect, delete the credential file and re-run:" -ForegroundColor Yellow
Write-Host "   Remove-Item '$credentialPath' -Force" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Contact your Azure AD administrator if you need help obtaining:" -ForegroundColor Yellow
Write-Host "   - The correct tenant ID for your organization" -ForegroundColor Gray
Write-Host "   - Application registration details" -ForegroundColor Gray
Write-Host "   - Required permissions and consent" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Diagnostics Complete ===" -ForegroundColor Cyan