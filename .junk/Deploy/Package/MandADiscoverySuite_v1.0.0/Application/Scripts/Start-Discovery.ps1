#Requires -Version 5.1
<#
.SYNOPSIS
    GUI Integration Script for M&A Discovery Suite
    
.DESCRIPTION
    This script serves as the interface between the C# GUI and the PowerShell discovery modules.
    It routes module discovery requests to the appropriate launcher script.
    
.PARAMETER ModuleName
    Name of the discovery module to execute
    
.PARAMETER CompanyName
    Name of the company profile to use for discovery
    
.PARAMETER SessionId
    Discovery session identifier
    
.PARAMETER DomainController
    Domain controller for Active Directory discovery (optional)
    
.PARAMETER TenantId
    Azure AD Tenant ID (optional)
    
.EXAMPLE
    .\Start-Discovery.ps1 -ModuleName "AzureResourceDiscovery" -CompanyName "Contoso" -SessionId "12345"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$ModuleName,
    
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [string]$SessionId,
    
    [Parameter(Mandatory=$false)]
    [string]$DomainController,
    
    [Parameter(Mandatory=$false)]
    [string]$TenantId
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'

try {
    Write-Host "=== GUI Discovery Integration ===" -ForegroundColor Cyan
    Write-Host "Module: $ModuleName" -ForegroundColor White
    Write-Host "Company: $CompanyName" -ForegroundColor White
    if ($SessionId) {
        Write-Host "Session: $SessionId" -ForegroundColor White
    }
    Write-Host ""
    
    # Get script paths
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    # Route to appropriate launcher based on module name
    switch ($ModuleName) {
        "AzureResourceDiscovery" {
            Write-Host "Launching enhanced Azure Resource Discovery..." -ForegroundColor Green
            
            # Build arguments for the resource discovery launcher
            $launcherArgs = @{
                CompanyName = $CompanyName
            }
            
            if ($TenantId) {
                $launcherArgs.TenantId = $TenantId
            }
            
            $launcherPath = Join-Path $ScriptRoot "AzureResourceDiscoveryLauncher.ps1"
            
            if (Test-Path $launcherPath) {
                & $launcherPath @launcherArgs
            } else {
                throw "AzureResourceDiscoveryLauncher.ps1 not found at: $launcherPath"
            }
        }
        
        default {
            Write-Host "Launching standard discovery module..." -ForegroundColor Green
            
            # Build arguments for the standard module launcher
            $launcherArgs = @{
                ModuleName = $ModuleName
                CompanyName = $CompanyName
            }
            
            if ($TenantId) {
                $launcherArgs.TenantId = $TenantId
            }
            
            if ($DomainController) {
                $launcherArgs.DomainController = $DomainController
            }
            
            $launcherPath = Join-Path $ScriptRoot "DiscoveryModuleLauncher.ps1"
            
            if (Test-Path $launcherPath) {
                & $launcherPath @launcherArgs
            } else {
                throw "DiscoveryModuleLauncher.ps1 not found at: $launcherPath"
            }
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "=== Discovery Launch Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Module: $ModuleName" -ForegroundColor Red
    Write-Host "Company: $CompanyName" -ForegroundColor Red
    exit 1
}