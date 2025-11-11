# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0  
# Created: 2025-08-03

<#
.SYNOPSIS
    Unified Azure Infrastructure Discovery Launcher
.DESCRIPTION
    Launches comprehensive unified Azure discovery including dual Azure AD/Intune discovery,
    advanced authentication methods, certificate/secret expiry analysis, and complete infrastructure
    mapping. Designed for M&A migration planning with enhanced security analysis and device management.
.PARAMETER CompanyName  
    The company name for organizing discovery data
.PARAMETER TenantId
    Azure AD Tenant ID (optional - will attempt to discover)
.PARAMETER ClientId
    Service Principal Application ID (optional)
.PARAMETER ClientSecret
    Service Principal Client Secret (optional)
.PARAMETER UseInteractive
    Force interactive authentication instead of trying other methods
.PARAMETER SubscriptionId
    Target specific subscription ID (optional)
.EXAMPLE
    .\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops"
.EXAMPLE
    .\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops" -TenantId "your-tenant-id" -ClientId "your-client-id" -ClientSecret "your-secret"
.EXAMPLE
    .\AzureResourceDiscoveryLauncher.ps1 -CompanyName "ljpops" -UseInteractive
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [string]$TenantId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientSecret,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseInteractive,
    
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId
)

# Set error action and strict mode
$ErrorActionPreference = "Continue"
Set-StrictMode -Version Latest

# Script variables
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ModulesPath = Join-Path (Split-Path -Parent $ScriptRoot) "Modules"
$ConfigPath = "C:\DiscoveryData\Profiles\$CompanyName"
$CredsPath = Join-Path $ConfigPath "Credentials\discoverycredentials.config"

Write-Host "=== Enhanced Azure Resource Discovery ===" -ForegroundColor Cyan
Write-Host "Company: $CompanyName" -ForegroundColor Green
Write-Host "Starting enhanced resource discovery..." -ForegroundColor Green
Write-Host ""

# Import required modules
try {
    Write-Host "Loading discovery modules..." -ForegroundColor Yellow
    
    # Import base modules
    $baseModulePath = Join-Path $ModulesPath "Discovery\DiscoveryBase.psm1"
    if (Test-Path $baseModulePath) {
        Import-Module $baseModulePath -Force
        Write-Host "[DiscoveryBase] Base discovery framework loaded" -ForegroundColor Green
    } else {
        throw "Base module not found at: $baseModulePath"
    }
    
    # Import credential modules  
    $credLoaderPath = Join-Path $ModulesPath "Discovery\CredentialLoader.psm1"
    if (Test-Path $credLoaderPath) {
        Import-Module $credLoaderPath -Force
        Write-Host "[CredentialLoader] Credential loader module loaded" -ForegroundColor Green
    }
    
    # Import authentication modules
    $authModules = @(
        "Discovery\AuthSession.psm1",
        "Discovery\SessionManager.psm1", 
        "Discovery\AuthenticationService.psm1"
    )
    
    foreach ($module in $authModules) {
        $modulePath = Join-Path $ModulesPath $module
        if (Test-Path $modulePath) {
            Import-Module $modulePath -Force
            $moduleName = [System.IO.Path]::GetFilenameWithoutExtension($module)
            Write-Host "[$moduleName] Authentication module loaded" -ForegroundColor Green
        }
    }
    
    # Import the working Azure Resource Discovery module
    $azureResourceModulePath = Join-Path $ModulesPath "Discovery\AzureResourceDiscovery.psm1"
    if (Test-Path $azureResourceModulePath) {
        Import-Module $azureResourceModulePath -Force
        Write-Host "[AzureResourceDiscovery] Azure Resource Discovery module loaded" -ForegroundColor Green
    } else {
        throw "Azure Resource Discovery module not found at: $azureResourceModulePath"
    }
    
} catch {
    Write-Host "Failed to load required modules: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    # Initialize company profile
    Write-Host "Initializing company profile..." -ForegroundColor Yellow
    $sessionId = [System.Guid]::NewGuid().ToString()
    
    # Create discovery context
    $discoveryContext = @{
        CompanyName = $CompanyName
        SessionId = $sessionId
        OutputPath = Join-Path $ConfigPath "Raw"
        Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    }
    
    # Ensure output directory exists
    if (-not (Test-Path $discoveryContext.OutputPath)) {
        New-Item -Path $discoveryContext.OutputPath -ItemType Directory -Force | Out-Null
    }
    
    Write-Host "Discovery context created:" -ForegroundColor Green
    Write-Host "Path: $($discoveryContext.OutputPath)" -ForegroundColor White
    Write-Host "Session: $sessionId" -ForegroundColor White
    Write-Host ""
    
    # Load or prompt for credentials
    Write-Host "Loading credentials..." -ForegroundColor Yellow
    $configuration = @{
        TenantId = $null
        ClientId = $null
        ClientSecret = $null
        SubscriptionId = $null
        UseInteractive = $false
    }
    
    if (-not $UseInteractive) {
        # Try to load existing credentials
        if (Test-Path $CredsPath) {
            try {
                Import-Module (Join-Path $ModulesPath "Discovery\CredentialSecurity.psm1") -Force
                Write-Host "[CredentialSecurity] Credential security module loaded" -ForegroundColor Green
                
                $creds = Import-DiscoveryCredentials -FilePath $CredsPath
                if ($creds -and $creds.Azure) {
                    $configuration.TenantId = $creds.Azure.TenantId
                    $configuration.ClientId = $creds.Azure.ClientId  
                    $configuration.ClientSecret = $creds.Azure.ClientSecret
                    Write-Host "Credentials loaded successfully" -ForegroundColor Green
                } else {
                    Write-Host "No Azure credentials found in config file" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "WARNING: Credentials file is not encrypted - consider encrypting for security" -ForegroundColor Yellow
                Write-Host "Failed to load credentials: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        
        # Override with provided parameters
        if ($TenantId) { $configuration.TenantId = $TenantId }
        if ($ClientId) { $configuration.ClientId = $ClientId }
        if ($ClientSecret) { $configuration.ClientSecret = $ClientSecret }
        if ($SubscriptionId) { $configuration.SubscriptionId = $SubscriptionId }
    }
    
    if ($UseInteractive) {
        Write-Host "Interactive authentication mode selected" -ForegroundColor Cyan
        $configuration.UseInteractive = $true
    }
    
    Write-Host "Configuration:" -ForegroundColor Green
    if ($configuration.TenantId) {
        Write-Host "Tenant ID: $('*' * 36)" -ForegroundColor White
    }
    if ($configuration.ClientId) {
        Write-Host "Client ID: $('*' * 36)" -ForegroundColor White
    }  
    if ($configuration.ClientSecret) {
        Write-Host "Client Secret: $('*' * 10)" -ForegroundColor White
    }
    if ($configuration.SubscriptionId) {
        Write-Host "Target Subscription: $($configuration.SubscriptionId)" -ForegroundColor White
    }
    Write-Host ""
    
    # Note: Authentication will be handled directly by the discovery module
    
    # Start Azure Resource Discovery
    Write-Host "Starting enhanced Azure Resource discovery..." -ForegroundColor Cyan

    $discoveryResult = Invoke-AzureResourceDiscovery -Configuration $configuration -Context $discoveryContext -SessionId $sessionId
    
    if ($discoveryResult) {
        Write-Host "" 
        Write-Host "=== Discovery Results ===" -ForegroundColor Cyan
        Write-Host "Status: SUCCESS" -ForegroundColor Green
        
        $totalRecords = 0
        if ($discoveryResult -is [Array]) {
            foreach ($group in $discoveryResult) {
                if ($group -and $group.PSObject.Properties['Count']) {
                    $recordCount = $group.Count
                    $totalRecords += $recordCount
                    Write-Host "$($group.Name): $recordCount records" -ForegroundColor White
                }
            }
        } else {
            Write-Host "Discovery returned results but in unexpected format" -ForegroundColor Yellow
        }
        
        Write-Host "Total Records: $totalRecords" -ForegroundColor Green
        Write-Host "Output Location: $($discoveryContext.OutputPath)" -ForegroundColor White
        
        # Show summary of what was discovered
        if ($discoveryResult -is [Array] -and $totalRecords -gt 0) {
            Write-Host ""
            Write-Host "=== Resource Summary ===" -ForegroundColor Cyan
            foreach ($group in $discoveryResult) {
                if ($group -and $group.PSObject.Properties['Count'] -and $group.Count -gt 0) {
                    $sampleRecord = $group.Group | Select-Object -First 1
                    Write-Host "✅ $($group.Name): $($group.Count) resources discovered" -ForegroundColor Green
            
            # Show some key details based on resource type
            switch ($group.Name) {
                "Subscriptions" { 
                    $subNames = ($group.Group | ForEach-Object { $_.SubscriptionName }) -join ", "
                    Write-Host "   Subscriptions: $subNames" -ForegroundColor Gray
                }
                "VirtualMachines" {
                    $runningVMs = ($group.Group | Where-Object { $_.PowerState -eq "running" }).Count
                    $stoppedVMs = ($group.Group | Where-Object { $_.PowerState -ne "running" }).Count
                    Write-Host "   Running: $runningVMs, Stopped/Deallocated: $stoppedVMs" -ForegroundColor Gray
                }
                "StorageAccounts" {
                    $totalContainers = ($group.Group | ForEach-Object { [int]$_.ContainerCount } | Measure-Object -Sum).Sum
                    Write-Host "   Total Containers: $totalContainers" -ForegroundColor Gray
                }
                "KeyVaults" {
                    $totalSecrets = ($group.Group | ForEach-Object { [int]$_.SecretCount } | Measure-Object -Sum).Sum
                    $totalKeys = ($group.Group | ForEach-Object { [int]$_.KeyCount } | Measure-Object -Sum).Sum
                    Write-Host "   Total Secrets: $totalSecrets, Keys: $totalKeys" -ForegroundColor Gray
                }
            }
                }
            }
        }
        
        Write-Host ""
        Write-Host "=== Next Steps ===" -ForegroundColor Cyan
        Write-Host "1. Review the discovered data in the GUI" -ForegroundColor White
        Write-Host "2. Export data for migration planning" -ForegroundColor White  
        Write-Host "3. Analyze resource dependencies and configurations" -ForegroundColor White
        Write-Host "4. Plan migration strategy based on discovered resources" -ForegroundColor White
        
    } else {
        Write-Host "Discovery completed but no results returned" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "=== Discovery Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Discovery Complete ===" -ForegroundColor Green
Write-Host "You can now refresh the GUI to see the discovered Azure resource data." -ForegroundColor White
Write-Host "Script completed successfully!" -ForegroundColor Green