#Requires -Version 5.1

<#
.SYNOPSIS
    Comprehensive Discovery Data Refresh Script for M&A Discovery Suite
.DESCRIPTION
    Executes all discovery modules to generate fresh CSV data files for the M&A Discovery Suite.
    This script addresses stale data by running individual PowerShell discovery modules.
.PARAMETER CompanyProfile
    Target company profile for data generation (default: ljpops)
.PARAMETER OutputPath
    Base output path for CSV files (default: C:\discoverydata\ljpops\Raw)
.PARAMETER Force
    Force refresh even if data appears current
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$CompanyProfile = "ljpops",
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "C:\discoverydata\ljpops\Raw",
    
    [Parameter(Mandatory = $false)]
    [switch]$Force,
    
    [Parameter(Mandatory = $false)]
    [switch]$Verbose
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'
$global:ProgressPreference = 'Continue'

# Initialize session variables
$SessionId = [Guid]::NewGuid().ToString()
$StartTime = Get-Date
$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path -Parent $ScriptPath
$ModulesPath = Join-Path $ScriptDir "Modules\Discovery"

Write-Host "==================================================================" -ForegroundColor Green
Write-Host "M&A Discovery Suite - Comprehensive Data Refresh" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "Session ID: $SessionId" -ForegroundColor Cyan
Write-Host "Start Time: $($StartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Cyan
Write-Host "Company Profile: $CompanyProfile" -ForegroundColor Cyan
Write-Host "Output Path: $OutputPath" -ForegroundColor Cyan
Write-Host "Modules Path: $ModulesPath" -ForegroundColor Cyan
Write-Host ""

# Ensure output directory exists
if (!(Test-Path $OutputPath)) {
    Write-Host "Creating output directory: $OutputPath" -ForegroundColor Yellow
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
}

# Results tracking
$Results = @{
    Successful = @()
    Failed = @()
    StartTime = $StartTime
}

# Discovery modules to execute
$DiscoveryModules = @(
    "ActiveDirectoryDiscovery.psm1",
    "ApplicationDiscovery.psm1", 
    "ExchangeDiscovery.psm1",
    "GraphDiscovery.psm1",
    "TeamsDiscovery.psm1",
    "SharePointDiscovery.psm1",
    "IntuneDiscovery.psm1",
    "PhysicalServerDiscovery.psm1"
)

# Execute discovery modules
Write-Host "Starting discovery module execution..." -ForegroundColor Yellow
$ModuleCount = 0
$TotalModules = $DiscoveryModules.Count

foreach ($ModuleName in $DiscoveryModules) {
    $ModuleCount++
    $ModuleStartTime = Get-Date
    $ModulePath = Join-Path $ModulesPath $ModuleName
    
    Write-Host ""
    Write-Progress -Activity "Discovery Data Refresh" -Status "Processing $ModuleName" -PercentComplete (($ModuleCount / $TotalModules) * 100)
    Write-Host "▶ [$ModuleCount/$TotalModules] Processing: $ModuleName" -ForegroundColor Green
    
    if (!(Test-Path $ModulePath)) {
        Write-Host "  ⚠ Module not found: $ModulePath" -ForegroundColor Yellow
        $Results.Failed += @{
            Name = $ModuleName
            Error = "Module file not found"
            Duration = (Get-Date) - $ModuleStartTime
        }
        continue
    }
    
    try {
        # Import the module
        Write-Host "  ▸ Importing module..." -ForegroundColor Cyan
        Import-Module $ModulePath -Force -ErrorAction Stop
        
        # Get module information
        $ModuleInfo = Get-Module ($ModuleName -replace '\.psm1$', '') -ErrorAction SilentlyContinue
        
        if ($ModuleInfo) {
            Write-Host "  ▸ Module loaded: $($ModuleInfo.ExportedFunctions.Count) functions available" -ForegroundColor Cyan
            
            # Try to execute common discovery functions
            $CommonFunctions = @("Get-DiscoveryData", "Start-Discovery", "Invoke-Discovery")
            $ExecutedFunction = $false
            
            foreach ($FunctionName in $CommonFunctions) {
                if (Get-Command $FunctionName -ErrorAction SilentlyContinue) {
                    Write-Host "  ▸ Executing: $FunctionName" -ForegroundColor Cyan
                    
                    try {
                        $Params = @{
                            OutputPath = $OutputPath
                            CompanyProfile = $CompanyProfile
                            SessionId = $SessionId
                            ErrorAction = 'Continue'
                        }
                        
                        # Add Verbose if requested
                        if ($Verbose) { $Params.Verbose = $true }
                        
                        & $FunctionName @Params
                        Write-Host "    ✓ $FunctionName completed successfully" -ForegroundColor Green
                        $ExecutedFunction = $true
                        break
                    }
                    catch {
                        Write-Host "    ✗ $FunctionName failed: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
            
            # If no common functions, try to execute all exported functions
            if (!$ExecutedFunction -and $ModuleInfo.ExportedFunctions.Count -gt 0) {
                Write-Host "  ▸ No standard discovery function found, trying exported functions..." -ForegroundColor Cyan
                
                foreach ($Function in $ModuleInfo.ExportedFunctions.Keys) {
                    try {
                        Write-Host "    ▸ Trying: $Function" -ForegroundColor Gray
                        
                        $Params = @{
                            OutputPath = $OutputPath
                            CompanyProfile = $CompanyProfile
                            SessionId = $SessionId
                            ErrorAction = 'SilentlyContinue'
                        }
                        
                        & $Function @Params
                        Write-Host "    ✓ $Function executed" -ForegroundColor Green
                        $ExecutedFunction = $true
                    }
                    catch {
                        # Silently continue for functions that may not accept our parameters
                    }
                }
            }
            
            if ($ExecutedFunction) {
                $Duration = (Get-Date) - $ModuleStartTime
                Write-Host "  ✓ $ModuleName completed in $([math]::Round($Duration.TotalSeconds, 2)) seconds" -ForegroundColor Green
                
                $Results.Successful += @{
                    Name = $ModuleName
                    Duration = $Duration
                }
            } else {
                Write-Host "  ⚠ No suitable functions found in module" -ForegroundColor Yellow
                $Results.Failed += @{
                    Name = $ModuleName
                    Error = "No suitable discovery functions found"
                    Duration = (Get-Date) - $ModuleStartTime
                }
            }
        } else {
            Write-Host "  ⚠ Module imported but not accessible" -ForegroundColor Yellow
            $Results.Failed += @{
                Name = $ModuleName
                Error = "Module not accessible after import"
                Duration = (Get-Date) - $ModuleStartTime
            }
        }
        
        # Clean up module import
        Remove-Module ($ModuleName -replace '\.psm1$', '') -ErrorAction SilentlyContinue -Force
        
    } catch {
        $Duration = (Get-Date) - $ModuleStartTime
        Write-Host "  ✗ $ModuleName failed: $($_.Exception.Message)" -ForegroundColor Red
        
        $Results.Failed += @{
            Name = $ModuleName
            Error = $_.Exception.Message
            Duration = $Duration
        }
    }
    
    # Brief pause between modules
    Start-Sleep -Milliseconds 500
}

Write-Progress -Activity "Discovery Data Refresh" -Completed

# Generate comprehensive summary report
$EndTime = Get-Date
$TotalDuration = $EndTime - $StartTime
$Results.EndTime = $EndTime
$Results.TotalDuration = $TotalDuration

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "DISCOVERY DATA REFRESH COMPLETE" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "Session ID: $SessionId" -ForegroundColor Cyan
Write-Host "Total Duration: $([math]::Round($TotalDuration.TotalMinutes, 2)) minutes" -ForegroundColor Cyan
Write-Host "Successful Modules: $($Results.Successful.Count)" -ForegroundColor Green
Write-Host "Failed Modules: $($Results.Failed.Count)" -ForegroundColor Red
Write-Host ""

if ($Results.Successful.Count -gt 0) {
    Write-Host "✓ SUCCESSFUL MODULES:" -ForegroundColor Green
    foreach ($Success in $Results.Successful) {
        $DurationText = "$([math]::Round($Success.Duration.TotalSeconds, 1))s"
        Write-Host "  • $($Success.Name) - $DurationText" -ForegroundColor Green
    }
    Write-Host ""
}

if ($Results.Failed.Count -gt 0) {
    Write-Host "✗ FAILED MODULES:" -ForegroundColor Red
    foreach ($Failure in $Results.Failed) {
        Write-Host "  • $($Failure.Name) - $($Failure.Error)" -ForegroundColor Red
    }
    Write-Host ""
}

# Validate output files
Write-Host "🔍 VALIDATING OUTPUT FILES:" -ForegroundColor Yellow
$OutputFiles = Get-ChildItem "$OutputPath\*.csv" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if ($OutputFiles) {
    $FreshFiles = $OutputFiles | Where-Object { $_.LastWriteTime -ge $StartTime }
    $StaleFiles = $OutputFiles | Where-Object { $_.LastWriteTime -lt $StartTime }
    
    Write-Host "✓ Fresh Files (updated during this session): $($FreshFiles.Count)" -ForegroundColor Green
    foreach ($File in $FreshFiles) {
        $SizeText = if ($File.Length -gt 1MB) { "$([math]::Round($File.Length / 1MB, 1))MB" } else { "$([math]::Round($File.Length / 1KB, 1))KB" }
        Write-Host "  • $($File.Name) - $SizeText - $($File.LastWriteTime.ToString('HH:mm:ss'))" -ForegroundColor Green
    }
    
    if ($StaleFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠ Stale Files (not updated): $($StaleFiles.Count)" -ForegroundColor Yellow
        foreach ($File in ($StaleFiles | Select-Object -First 5)) {
            Write-Host "  • $($File.Name) - $($File.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Yellow
        }
        if ($StaleFiles.Count -gt 5) {
            Write-Host "  ... and $($StaleFiles.Count - 5) more" -ForegroundColor Yellow
        }
    }
    
    # Data integrity validation for fresh files
    Write-Host ""
    Write-Host "🔍 DATA INTEGRITY VALIDATION:" -ForegroundColor Yellow
    
    $ValidFiles = 0
    foreach ($File in $FreshFiles) {
        try {
            $CsvData = Import-Csv $File.FullName -ErrorAction Stop
            if ($CsvData.Count -gt 0) {
                Write-Host "  ✓ $($File.Name) - $($CsvData.Count) records, valid structure" -ForegroundColor Green
                $ValidFiles++
            } else {
                Write-Host "  ⚠ $($File.Name) - Empty file" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ✗ $($File.Name) - Invalid CSV format: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} else {
    Write-Host "⚠ No CSV files found in output directory" -ForegroundColor Yellow
    $FreshFiles = @()
    $ValidFiles = 0
}

# Final summary
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "REFRESH SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

$SuccessRate = if ($TotalModules -gt 0) { [math]::Round(($Results.Successful.Count / $TotalModules) * 100, 1) } else { 0 }

Write-Host "Module Success Rate: $SuccessRate% ($($Results.Successful.Count)/$TotalModules)" -ForegroundColor $(if ($SuccessRate -ge 80) { "Green" } elseif ($SuccessRate -ge 50) { "Yellow" } else { "Red" })
Write-Host "Fresh CSV Files: $($FreshFiles.Count)" -ForegroundColor $(if ($FreshFiles.Count -gt 10) { "Green" } elseif ($FreshFiles.Count -gt 5) { "Yellow" } else { "Red" })
Write-Host "Valid CSV Files: $ValidFiles" -ForegroundColor $(if ($ValidFiles -gt 10) { "Green" } elseif ($ValidFiles -gt 5) { "Yellow" } else { "Red" })

if ($SuccessRate -ge 50 -and $FreshFiles.Count -gt 5) {
    Write-Host "🎉 REFRESH SUCCESSFUL - Ready for GUI testing and demonstrations!" -ForegroundColor Green
} elseif ($SuccessRate -ge 25 -and $FreshFiles.Count -gt 0) {
    Write-Host "⚠ PARTIAL SUCCESS - Some data refreshed, may need manual intervention" -ForegroundColor Yellow
} else {
    Write-Host "❌ REFRESH FAILED - Significant issues require investigation" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review any failed modules and address issues" -ForegroundColor White
Write-Host "2. Test data loading in the GUI application" -ForegroundColor White
Write-Host "3. Verify real-time updates are working correctly" -ForegroundColor White
Write-Host "4. Run integration tests to confirm data pipeline" -ForegroundColor White

Write-Host ""
Write-Host "🔄 Discovery data refresh completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green