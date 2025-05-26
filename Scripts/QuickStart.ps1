<#
.SYNOPSIS
    Quick start script for M&A Discovery Suite
.DESCRIPTION
    Simplified launcher for common discovery operations
.PARAMETER Operation
    The operation to perform: Discovery, Processing, Export, Full, or Validate
.PARAMETER ConfigFile
    Path to the configuration file
.PARAMETER OutputPath
    Override output path from configuration
.PARAMETER Force
    Force reprocessing of existing files
.EXAMPLE
    .\QuickStart.ps1 -Operation Full
.EXAMPLE
    .\QuickStart.ps1 -Operation Validate
.EXAMPLE
    .\QuickStart.ps1 -Operation Discovery -OutputPath "C:\CustomOutput" -Force
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full", "Validate")]
    [string]$Operation = "Full",
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = ".\Configuration\default-config.json",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Set up location-independent environment
$scriptPath = Split-Path $MyInvocation.MyCommand.Path -Parent
$suiteRoot = Split-Path $scriptPath -Parent

# Source the environment setup
$envSetupPath = Join-Path $scriptPath "Set-SuiteEnvironment.ps1"
if (Test-Path $envSetupPath) {
    . $envSetupPath -SuiteRoot $suiteRoot
} else {
    # Fallback to manual setup if environment script is missing
    $global:MandASuiteRoot = $suiteRoot
    $global:MandAOrchestratorPath = Join-Path $suiteRoot "Core\MandA-Orchestrator.ps1"
}

# Check if orchestrator exists
if (-not (Test-Path $global:MandAOrchestratorPath)) {
    Write-Host "ERROR: MandA Orchestrator not found at: $global:MandAOrchestratorPath" -ForegroundColor Red
    Write-Host "Please ensure the MandA Discovery Suite is properly installed." -ForegroundColor Yellow
    exit 1
}

# Check if configuration file exists
$configPath = if ([System.IO.Path]::IsPathRooted($ConfigFile)) {
    $ConfigFile
} else {
    Join-Path $global:MandASuiteRoot $ConfigFile
}

if (-not (Test-Path $configPath)) {
    Write-Host "ERROR: Configuration file not found at: $configPath" -ForegroundColor Red
    Write-Host "Please ensure the configuration file exists or specify a valid path." -ForegroundColor Yellow
    exit 1
}

# Display banner
Write-Host ""
Write-Host "+==================================================================+" -ForegroundColor Cyan
Write-Host "|                    MandA Discovery Suite v4.0                   |" -ForegroundColor Cyan
Write-Host "|                     Quick Start Launcher                        |" -ForegroundColor Cyan
Write-Host "+==================================================================+" -ForegroundColor Cyan
Write-Host ""
Write-Host "Operation: $Operation" -ForegroundColor Yellow
Write-Host "Configuration: $configPath" -ForegroundColor Yellow
if ($OutputPath) {
    Write-Host "Output Path: $OutputPath" -ForegroundColor Yellow
}
if ($Force) {
    Write-Host "Force Mode: Enabled" -ForegroundColor Yellow
}
Write-Host ""

# Build command arguments as hashtable for splatting
$arguments = @{
    ConfigurationFile = $configPath
}

switch ($Operation) {
    "Validate" {
        $arguments.ValidateOnly = $true
    }
    default {
        $arguments.Mode = $Operation
    }
}

if ($OutputPath) {
    $arguments.OutputPath = $OutputPath
}

if ($Force) {
    $arguments.Force = $true
}

# Execute the orchestrator
try {
    Write-Host "Launching MandA Discovery Suite..." -ForegroundColor Green
    
    # Build command line for display
    $commandParts = @("$global:MandAOrchestratorPath")
    foreach ($key in $arguments.Keys) {
        if ($arguments[$key] -is [bool] -and $arguments[$key]) {
            $commandParts += "-$key"
        } else {
            $commandParts += "-$key `"$($arguments[$key])`""
        }
    }
    $commandLine = $commandParts -join " "
    Write-Host "Command: $commandLine" -ForegroundColor Gray
    Write-Host ""
    
    & $global:MandAOrchestratorPath @arguments
    
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "[SUCCESS] MandA Discovery Suite completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] MandA Discovery Suite completed with errors (Exit Code: $exitCode)" -ForegroundColor Red
    }
    
    exit $exitCode
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to launch MandA Discovery Suite: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}