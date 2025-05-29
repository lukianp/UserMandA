<#
.SYNOPSIS
    Sets up environment variables and paths for M&A Discovery Suite
.DESCRIPTION
    Creates location-independent environment setup for the M&A Discovery Suite
    that can be sourced by other scripts to ensure consistent path handling
.PARAMETER SuiteRoot
    Override the auto-detected suite root path
.EXAMPLE
    . .\Scripts\Set-SuiteEnvironment.ps1
.EXAMPLE
    . .\Scripts\Set-SuiteEnvironment.ps1 -SuiteRoot "C:\CustomLocation\UserMandA"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$SuiteRoot
)

# Auto-detect suite root if not provided
if (-not $SuiteRoot) {
    $SuiteRoot = Split-Path $PSScriptRoot -Parent
}

# Validate suite root
if (-not (Test-Path $SuiteRoot)) {
    throw "Suite root path does not exist: $SuiteRoot"
}

# Set global variables for the suite
$global:MandASuiteRoot = $SuiteRoot
$global:MandACorePath = Join-Path $SuiteRoot "Core"
$global:MandAConfigPath = Join-Path $SuiteRoot "Configuration"
$global:MandAScriptsPath = Join-Path $SuiteRoot "Scripts"
$global:MandAModulesPath = Join-Path $SuiteRoot "Modules"

# Module-specific paths
$global:MandAAuthModulesPath = Join-Path $MandAModulesPath "Authentication"
$global:MandAConnectivityModulesPath = Join-Path $MandAModulesPath "Connectivity"
$global:MandADiscoveryModulesPath = Join-Path $MandAModulesPath "Discovery"
$global:MandAProcessingModulesPath = Join-Path $MandAModulesPath "Processing"
$global:MandAExportModulesPath = Join-Path $MandAModulesPath "Export"
$global:MandAUtilitiesModulesPath = Join-Path $MandAModulesPath "Utilities"

# Key file paths
$global:MandAOrchestratorPath = Join-Path $MandACorePath "MandA-Orchestrator.ps1"
$global:MandADefaultConfigPath = Join-Path $MandAConfigPath "default-config.json"
$global:MandAQuickStartPath = Join-Path $MandAScriptsPath "QuickStart.ps1"
$global:MandAValidationPath = Join-Path $MandAScriptsPath "Validate-Installation.ps1"

# Helper function to get module path
function Get-MandAModulePath {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("Authentication", "Connectivity", "Discovery", "Processing", "Export", "Utilities")]
        [string]$Category,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName
    )
    
    $categoryPath = switch ($Category) {
        "Authentication" { $global:MandAAuthModulesPath }
        "Connectivity" { $global:MandAConnectivityModulesPath }
        "Discovery" { $global:MandADiscoveryModulesPath }
        "Processing" { $global:MandAProcessingModulesPath }
        "Export" { $global:MandAExportModulesPath }
        "Utilities" { $global:MandAUtilitiesModulesPath }
    }
    
    return Join-Path $categoryPath "$ModuleName.psm1"
}

# Helper function to get all modules in a category
function Get-MandAModulesInCategory {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("Authentication", "Connectivity", "Discovery", "Processing", "Export", "Utilities")]
        [string]$Category
    )
    
    $categoryPath = switch ($Category) {
        "Authentication" { $global:MandAAuthModulesPath }
        "Connectivity" { $global:MandAConnectivityModulesPath }
        "Discovery" { $global:MandADiscoveryModulesPath }
        "Processing" { $global:MandAProcessingModulesPath }
        "Export" { $global:MandAExportModulesPath }
        "Utilities" { $global:MandAUtilitiesModulesPath }
    }
    
    if (Test-Path $categoryPath) {
        return Get-ChildItem -Path $categoryPath -Filter "*.psm1" | ForEach-Object { $_.FullName }
    } else {
        return @()
    }
}

# Helper function to resolve configuration file path
function Resolve-MandAConfigPath {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ConfigFile
    )
    
    if ([System.IO.Path]::IsPathRooted($ConfigFile)) {
        return $ConfigFile
    } else {
        return Join-Path $global:MandASuiteRoot $ConfigFile
    }
}

# Note: Export-ModuleMember is not needed when dot-sourcing scripts
# Functions and variables are automatically available in the calling scope

# Display setup information
Write-Host "M&A Discovery Suite Environment Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Suite Root: $global:MandASuiteRoot" -ForegroundColor Green
Write-Host "Core Path: $global:MandACorePath" -ForegroundColor Gray
Write-Host "Modules Path: $global:MandAModulesPath" -ForegroundColor Gray
Write-Host "Scripts Path: $global:MandAScriptsPath" -ForegroundColor Gray
Write-Host "Configuration Path: $global:MandAConfigPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host ""
