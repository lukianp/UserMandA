# Run-DiscoverySetup.ps1
# Automated wrapper for M&A Discovery Suite App Registration
# Handles module conflicts and runs the main registration script

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, HelpMessage="Path for detailed execution log")]
    [string]$LogPath = ".\MandADiscovery_Registration_Log.txt",
    
    [Parameter(Mandatory=$false, HelpMessage="Path for encrypted credentials output")]
    [string]$EncryptedOutputPath = "C:\DiscoveryData\discoverycredentials.config",
    
    [Parameter(Mandatory=$false, HelpMessage="Force recreation of existing app registration")]
    [switch]$Force,
    
    [Parameter(Mandatory=$false, HelpMessage="Only validate prerequisites without creating resources")]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false, HelpMessage="Skip Azure subscription role assignments")]
    [switch]$SkipAzureRoles,
    
    [Parameter(Mandatory=$false, HelpMessage="Client secret validity period in years (1-2)")]
    [ValidateRange(1, 2)]
    [int]$SecretValidityYears = 2,
    
    [Parameter(Mandatory=$false, HelpMessage="Skip module conflict resolution")]
    [switch]$SkipConflictResolution,
    
    [Parameter(Mandatory=$false, HelpMessage="Automatically remove AzureRM modules")]
    [switch]$RemoveAzureRM
)

$ErrorActionPreference = "Stop"

function Write-SetupLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $colorMap = @{
        "INFO" = "White"
        "SUCCESS" = "Green"
        "WARN" = "Yellow"
        "ERROR" = "Red"
        "PROGRESS" = "Cyan"
    }
    
    $color = $colorMap[$Level]
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Header
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  M&A DISCOVERY SUITE - AUTOMATED SETUP" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "  Automated module conflict resolution and app registration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$startTime = Get-Date
Write-SetupLog "M&A Discovery Suite Automated Setup Started" "INFO"
Write-SetupLog "PowerShell Version: $($PSVersionTable.PSVersion)" "INFO"
Write-SetupLog "Execution Policy: $(Get-ExecutionPolicy)" "INFO"

# Step 1: Module Conflict Resolution
if (-not $SkipConflictResolution) {
    Write-SetupLog "Step 1: Resolving module conflicts..." "PROGRESS"
    
    $conflictScriptPath = Join-Path $PSScriptRoot "Fix-ModuleConflicts.ps1"
    
    if (Test-Path $conflictScriptPath) {
        try {
            $conflictParams = @{}
            if ($RemoveAzureRM) { $conflictParams.RemoveAzureRM = $true }
            
            Write-SetupLog "Running module conflict resolution..." "PROGRESS"
            & $conflictScriptPath @conflictParams
            
            Write-SetupLog "Module conflict resolution completed" "SUCCESS"
            
            # Brief pause to allow module cleanup to complete
            Start-Sleep -Seconds 2
            
        } catch {
            Write-SetupLog "Module conflict resolution failed: $($_.Exception.Message)" "ERROR"
            Write-SetupLog "Continuing with main script - may encounter module issues" "WARN"
        }
    } else {
        Write-SetupLog "Module conflict script not found at: $conflictScriptPath" "WARN"
        Write-SetupLog "Continuing without conflict resolution" "WARN"
    }
} else {
    Write-SetupLog "Step 1: Skipping module conflict resolution (as requested)" "INFO"
}

# Step 2: Run Main Registration Script
Write-SetupLog "Step 2: Running M&A Discovery App Registration..." "PROGRESS"

$mainScriptPath = Join-Path $PSScriptRoot "DiscoveryCreateAppRegistration.ps1"

if (-not (Test-Path $mainScriptPath)) {
    Write-SetupLog "Main script not found at: $mainScriptPath" "ERROR"
    Write-SetupLog "Please ensure DiscoveryCreateAppRegistration.ps1 is in the Scripts directory" "ERROR"
    exit 1
}

# Prepare parameters for main script
$mainScriptParams = @{
    LogPath = $LogPath
    EncryptedOutputPath = $EncryptedOutputPath
    SecretValidityYears = $SecretValidityYears
}

if ($Force) { $mainScriptParams.Force = $true }
if ($ValidateOnly) { $mainScriptParams.ValidateOnly = $true }
if ($SkipAzureRoles) { $mainScriptParams.SkipAzureRoles = $true }

try {
    Write-SetupLog "Executing main registration script with parameters:" "INFO"
    $mainScriptParams.GetEnumerator() | ForEach-Object {
        Write-SetupLog "  $($_.Key): $($_.Value)" "INFO"
    }
    
    # Execute the main script
    & $mainScriptPath @mainScriptParams
    
    $exitCode = $LASTEXITCODE
    if ($exitCode -eq 0 -or $null -eq $exitCode) {
        Write-SetupLog "M&A Discovery App Registration completed successfully!" "SUCCESS"
        
        # Display next steps
        Write-Host "`n" -NoNewline
        Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  SETUP COMPLETED SUCCESSFULLY" -ForegroundColor White -BackgroundColor DarkGreen
        Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
        
        Write-SetupLog "Next Steps:" "SUCCESS"
        Write-SetupLog "1. Verify credentials file: $EncryptedOutputPath" "SUCCESS"
        Write-SetupLog "2. Review log file: $LogPath" "SUCCESS"
        Write-SetupLog "3. Proceed with environment discovery using the discovery scripts" "SUCCESS"
        
        if (Test-Path $EncryptedOutputPath) {
            $fileSize = [math]::Round((Get-Item $EncryptedOutputPath).Length / 1KB, 2)
            Write-SetupLog "Credentials file created: $fileSize KB" "SUCCESS"
        }
        
    } else {
        Write-SetupLog "Main script exited with code: $exitCode" "ERROR"
        exit $exitCode
    }
    
} catch {
    Write-SetupLog "Main script execution failed: $($_.Exception.Message)" "ERROR"
    
    if ($_.Exception.InnerException) {
        Write-SetupLog "Inner Exception: $($_.Exception.InnerException.Message)" "ERROR"
    }
    
    Write-SetupLog "Check the log file for detailed error information: $LogPath" "ERROR"
    
    # Display troubleshooting guidance
    Write-Host "`n" -NoNewline
    Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  TROUBLESHOOTING GUIDANCE" -ForegroundColor White -BackgroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Red
    
    Write-SetupLog "If you encountered module conflicts:" "ERROR"
    Write-SetupLog "1. Close all PowerShell windows" "ERROR"
    Write-SetupLog "2. Run: .\Scripts\Fix-ModuleConflicts.ps1 -RemoveAzureRM -Force" "ERROR"
    Write-SetupLog "3. Open a new PowerShell session as Administrator" "ERROR"
    Write-SetupLog "4. Re-run this script" "ERROR"
    Write-SetupLog "" "ERROR"
    Write-SetupLog "For detailed troubleshooting: Documentation\Module_Conflict_Troubleshooting_Guide.md" "ERROR"
    
    exit 1
}

# Final summary
$endTime = Get-Date
Write-SetupLog "Setup process completed at: $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))" "INFO"
Write-SetupLog "Total execution time: $([math]::Round(((Get-Date) - $startTime).TotalMinutes, 2)) minutes" "INFO"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  M&A Discovery Suite is ready for environment discovery!" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "═══════════════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan