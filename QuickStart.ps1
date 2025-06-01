<#
.SYNOPSIS
    Quick start script for M&A Discovery Suite v4.1.1
.DESCRIPTION
    A menu-driven launcher for all suite operations.
    Includes $ErrorActionPreference = "Stop" for robust error handling.
.NOTES
    Version: 4.1.1
    Author: Gemini & User
    Date: 2025-06-01
#>
[CmdletBinding()]
param()

# Ensure script halts on terminating errors from sourced scripts or cmdlets
$OriginalErrorActionPreferenceForQuickStart = $ErrorActionPreference
$ErrorActionPreference = "Stop"

# --- Script Setup: Determine Paths and Source Set-SuiteEnvironment.ps1 ---
$scriptPathQuickStart = $null
# Determine the directory of QuickStart.ps1 itself
if ($MyInvocation.MyCommand.CommandType -eq 'ExternalScript') {
    $scriptPathQuickStart = Split-Path $MyInvocation.MyCommand.Path -Parent
} elseif ($PSScriptRoot) { # Fallback for ISE or when $MyInvocation is not reliable for path
    $scriptPathQuickStart = $PSScriptRoot
} else {
    Write-Error "CRITICAL: Cannot determine the path for QuickStart.ps1. PSScriptRoot is null and MyInvocation is not an ExternalScript."
    $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart # Restore original preference before exiting
    exit 1
}

$envSetupScriptPath = Join-Path $scriptPathQuickStart "Set-SuiteEnvironment.ps1"

if (-not (Test-Path $envSetupScriptPath -PathType Leaf)) {
    Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envSetupScriptPath'. This script is essential. Cannot proceed."
    $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart
    exit 1
}

try {
    . $envSetupScriptPath
    if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths) {
        # This case should ideally be caught by 'throw' within Set-SuiteEnvironment.ps1
        throw "Set-SuiteEnvironment.ps1 completed but `$global:MandA context was not properly initialized."
    }
} catch {
    Write-Error "CRITICAL ERROR during sourcing of Set-SuiteEnvironment.ps1: $($_.Exception.Message)"
    Write-Error "QuickStart cannot continue. Please resolve issues in Set-SuiteEnvironment.ps1 or its dependencies (e.g., default-config.json)."
    $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart
    exit 1
}

# Import essential utilities for the menu itself, now that $global:MandA is confirmed
try {
    Import-Module (Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1") -Force -Global
} catch {
    Write-Warning "Failed to load EnhancedLogging.psm1. Menu logging will be basic. Error: $($_.Exception.Message)"
    # Define a fallback if Write-MandALog is critical for the menu
    function Write-MandALog { param([string]$Message, [string]$Level="INFO") Write-Host "[$Level] $Message" }
}


function Show-MenuInternal { # Renamed to avoid potential conflicts
    Clear-Host
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host "|              M&A Discovery Suite v4.1.1 - Main Menu            |" -ForegroundColor Cyan
    Write-Host "+==================================================================+" -ForegroundColor Cyan
    Write-Host "  Suite Root: $($global:MandA.Paths.SuiteRoot)" -ForegroundColor DarkYellow
    Write-Host
    Write-Host "  SETUP & CONFIGURATION" -ForegroundColor Yellow
    Write-Host "  [1] Setup/Verify Azure AD App Registration (Recommended First Step)"
    Write-Host
    Write-Host "  ORCHESTRATOR EXECUTION" -ForegroundColor Yellow
    Write-Host "  [F] Full Run: Discovery, Processing, and Export (Recommended)"
    Write-Host "  [D] Discovery Only"
    Write-Host "  [P] Processing Only"
    Write-Host "  [E] Export Only"
    Write-Host
    Write-Host "  UTILITIES & VALIDATION" -ForegroundColor Yellow
    Write-Host "  [V] Validate Full Installation"
    Write-Host "  [M] Check PowerShell Modules (with AutoFix option)"
    Write-Host "  [T] Test Configuration Only (Orchestrator Dry Run)"
    Write-Host
    Write-Host "  [Q] Quit" -ForegroundColor Yellow
    Write-Host
}

function Invoke-OrchestratorInternal { # Renamed
    param(
        [Parameter(Mandatory=$true)]
        [string]$Mode,
        [Parameter(Mandatory=$false)]
        [switch]$ValidateOnlyFlag # Renamed to avoid conflict with $ValidateOnly automatic variable
    )
    
    # Ensure $global:MandA and necessary paths are set (double check, though Set-SuiteEnvironment should have handled it)
    if ($null -eq $global:MandA -or $null -eq $global:MandA.Paths -or $null -eq $global:MandA.Paths.Orchestrator) {
        Write-MandALog "Critical error: `$global:MandA or its paths are not properly set before calling orchestrator." -Level "ERROR"
        Request-UserToContinueInternal
        return
    }

    $orchestratorParams = @{
        ConfigurationFile = $global:MandA.Paths.ConfigFile # Orchestrator expects path relative to SuiteRoot or absolute
        Mode              = $Mode
    }
    if ($ValidateOnlyFlag.IsPresent) { $orchestratorParams.ValidateOnly = $true }

    try {
        Write-MandALog "Preparing to launch Orchestrator (Mode: $Mode)..." -Level "HEADER"
        Write-MandALog "Executing: & `"$($global:MandA.Paths.Orchestrator)`" @orchestratorParams" -Level "DEBUG"
        
        # Execute the orchestrator
        & $global:MandA.Paths.Orchestrator @orchestratorParams
        
        if ($LASTEXITCODE -eq 0) {
            Write-MandALog "Orchestrator (Mode: $Mode) completed successfully." -Level "SUCCESS"
        } else {
            Write-MandALog "Orchestrator (Mode: $Mode) completed with Exit Code: $LASTEXITCODE. Check logs for details." -Level "WARN"
        }
    } catch {
        Write-MandALog "Orchestrator invocation (Mode: $Mode) failed: $($_.Exception.Message)" -Level "ERROR"
        if ($_.ScriptStackTrace) {
            Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        }
    }
    Request-UserToContinueInternal
}

function Request-UserToContinueInternal { # Renamed
    Write-Host "`nPress Enter to return to the menu..." -ForegroundColor Gray
    Read-Host | Out-Null
}

# --- Main Script Body ---
try {
    do {
        Show-MenuInternal
        $choice = Read-Host "Enter your choice"
        switch ($choice.ToUpper()) {
            '1' { 
                try { & $global:MandA.Paths.AppRegScript } catch { Write-MandALog "Error running App Registration Script: $($_.Exception.Message)" -Level "ERROR"}
                Request-UserToContinueInternal 
            }
            'F' { Invoke-OrchestratorInternal -Mode "Full" }
            'D' { Invoke-OrchestratorInternal -Mode "Discovery" }
            'P' { Invoke-OrchestratorInternal -Mode "Processing" }
            'E' { Invoke-OrchestratorInternal -Mode "Export" }
            'V' { 
                try { & $global:MandA.Paths.ValidationScript } catch { Write-MandALog "Error running Validation Script: $($_.Exception.Message)" -Level "ERROR"}
                Request-UserToContinueInternal 
            }
            'M' { 
                try { & $global:MandA.Paths.ModuleCheckScript -AutoFix } catch { Write-MandALog "Error running Module Check Script: $($_.Exception.Message)" -Level "ERROR"}
                Request-UserToContinueInternal 
            }
            'T' { Invoke-OrchestratorInternal -Mode "Full" -ValidateOnlyFlag:$true } # ValidateOnly usually implies a full check
            'Q' { Write-MandALog "Exiting M&A Discovery Suite QuickStart." -Level "INFO" }
            default { Write-MandALog "Invalid choice. Please try again." -Level "WARN"; Start-Sleep -Seconds 1 }
        }
    } while ($choice.ToUpper() -ne 'Q')
} catch {
    # This top-level catch in QuickStart is for unexpected errors within QuickStart itself
    Write-Error "An unexpected error occurred in QuickStart.ps1: $($_.Exception.Message)"
    Write-Error "Script StackTrace: $($_.ScriptStackTrace)"
} finally {
    # Restore original ErrorActionPreference when QuickStart exits
    $ErrorActionPreference = $OriginalErrorActionPreferenceForQuickStart
    Write-Host "QuickStart finished." -ForegroundColor DarkGray
}
