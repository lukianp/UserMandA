#Requires -Version 5.1
<#
.SYNOPSIS
    Universal Discovery Module Launcher for M&A Discovery Suite

.DESCRIPTION
    This script dynamically loads and executes any discovery module with proper company profile context.

.PARAMETER ModuleName
    Name of the discovery module to execute (e.g., "IntuneDiscovery", "AzureDiscovery")

.PARAMETER CompanyName
    Name of the company profile to use for discovery

.PARAMETER TenantId
    Azure AD Tenant ID (optional)

.PARAMETER ClientId
    Azure AD Client ID (optional)

.PARAMETER ClientSecret
    Azure AD Client Secret (optional)

.EXAMPLE
    .\DiscoveryModuleLauncher.ps1 -ModuleName "IntuneDiscovery" -CompanyName "Contoso"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$ModuleName,
    
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [string]$TenantId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientSecret
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'

try {
    Write-Host "=== $ModuleName Discovery ===" -ForegroundColor Cyan
    Write-Host "Company: $CompanyName" -ForegroundColor White
    Write-Host "Starting discovery..." -ForegroundColor Yellow
    Write-Host ""
    
    # Get script root path
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    $RootPath = Split-Path -Parent $ScriptRoot
    $ModulesPath = Join-Path $RootPath "Modules"
    
    # Import required modules
    Write-Host "Loading modules..." -ForegroundColor Yellow
    Import-Module (Join-Path $ModulesPath "Core\ClassDefinitions.psm1") -Force
    Import-Module (Join-Path $ModulesPath "Core\CompanyProfileManager.psm1") -Force
    Import-Module (Join-Path $ModulesPath "Core\CredentialLoader.psm1") -Force
    Import-Module (Join-Path $ModulesPath "Authentication\SessionManager.psm1") -Force
    Import-Module (Join-Path $ModulesPath "Authentication\AuthenticationService.psm1") -Force
    Import-Module (Join-Path $ModulesPath "Discovery\$ModuleName.psm1") -Force
    
    # Initialize company profile
    Write-Host "Initializing company profile..." -ForegroundColor Yellow
    $profileManager = Get-CompanyProfileManager -CompanyName $CompanyName
    $profilePaths = $profileManager.GetProfilePaths()
    
    # Create discovery context
    $context = @{
        Paths = @{
            RawDataOutput = $profilePaths.Raw
        }
        CompanyName = $CompanyName
        DiscoverySession = [guid]::NewGuid().ToString()
    }
    
    Write-Host "Discovery context created:" -ForegroundColor Green
    Write-Host "Path: $($context.Paths.RawDataOutput)" -ForegroundColor Gray
    Write-Host "Session: $($context.DiscoverySession)" -ForegroundColor Gray
    Write-Host ""
    
    # Load credentials from company profile
    Write-Host "Loading credentials..." -ForegroundColor Yellow
    try {
        $credentials = Get-CompanyCredentials -CompanyName $CompanyName
        Write-Host "Credentials loaded successfully" -ForegroundColor Green
        
        # Test credential expiry
        $expiryCheck = Test-CredentialExpiry -Credentials $credentials
        if (-not $expiryCheck.Valid) {
            throw "Credential validation failed: $($expiryCheck.Message)"
        }
        if ($expiryCheck.ContainsKey('Warning') -and $expiryCheck.Warning) {
            Write-Warning $expiryCheck.Message
        }
    }
    catch {
        Write-Host "Failed to load credentials from profile, falling back to parameters..." -ForegroundColor Yellow
        $credentials = @{
            TenantId = $TenantId
            ClientId = $ClientId
            ClientSecret = $ClientSecret
        }
    }
    
    # Create configuration
    $configuration = @{
        TenantId = $credentials.TenantId
        ClientId = $credentials.ClientId
        ClientSecret = $credentials.ClientSecret
        CompanyName = $CompanyName
    }
    
    # Display configuration (without secrets)
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "Tenant ID: $($credentials.TenantId -replace '.', '*')" -ForegroundColor Gray
    Write-Host "Client ID: $($credentials.ClientId -replace '.', '*')" -ForegroundColor Gray
    Write-Host ""
    
    # Initialize authentication service
    Write-Host "Initializing authentication..." -ForegroundColor Yellow
    
    # Re-import AuthenticationService to ensure functions are available
    Import-Module (Join-Path $ModulesPath "Authentication\AuthenticationService.psm1") -Force
    
    try {
        $authResult = Initialize-AuthenticationService -Configuration $configuration
        if (-not $authResult.Success) {
            throw "Authentication initialization failed: $($authResult.Error)"
        }
        Write-Host "Authentication initialized successfully" -ForegroundColor Green
        
        # Update context with authenticated session ID
        $context.DiscoverySession = $authResult.SessionId
    } catch {
        Write-Host "Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
    
    # Execute discovery based on module name
    $functionName = "Invoke-$ModuleName"
    
    Write-Host "Starting $ModuleName discovery..." -ForegroundColor Cyan
    Write-Host ""
    
    # Call the discovery function
    $discoveryResult = & $functionName -Configuration $configuration -Context $context -SessionId $context.DiscoverySession
    
    # Display results
    Write-Host ""
    Write-Host "=== Discovery Results ===" -ForegroundColor Cyan
    
    if ($discoveryResult -and $discoveryResult.Success) {
        Write-Host "Status: SUCCESS" -ForegroundColor Green
        if ($discoveryResult.RecordCount) {
            Write-Host "Total Records: $($discoveryResult.RecordCount)" -ForegroundColor White
        }
    } elseif ($discoveryResult -and $discoveryResult.Errors -and $discoveryResult.Errors.Count -gt 0) {
        Write-Host "Status: FAILED" -ForegroundColor Red
        Write-Host "Error Count: $($discoveryResult.Errors.Count)" -ForegroundColor Red
        Write-Host "Warning Count: $($discoveryResult.Warnings.Count)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Errors:" -ForegroundColor Red
        foreach ($errorItem in $discoveryResult.Errors) {
            Write-Host "  $($errorItem.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Status: NO DATA" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== Discovery Complete ===" -ForegroundColor Cyan
    Write-Host "You can now refresh the GUI to see the discovered data." -ForegroundColor White
    Write-Host "Script completed successfully!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "=== Discovery Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Script completed with errors!" -ForegroundColor Red
    exit 1
}