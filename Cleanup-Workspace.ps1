<#
.SYNOPSIS
    Comprehensive workspace cleanup script for MandA Discovery Suite
.DESCRIPTION
    This script cleans up temporary files, test files, backup files, and other junk files
    from the workspace while preserving important project files.
.PARAMETER WhatIf
    Shows what would be deleted without actually deleting files
.PARAMETER Force
    Bypasses confirmation prompts
#>

[CmdletBinding()]
param(
    [switch]$WhatIf,
    [switch]$Force
)

# Initialize cleanup tracking
$CleanupSummary = @{
    FilesDeleted = @()
    DirectoriesDeleted = @()
    TotalSizeFreed = 0
    Errors = @()
}

function Write-CleanupLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path "Cleanup-Log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt" -Value $logMessage
}

function Get-FileSize {
    param([string]$Path)
    try {
        if (Test-Path $Path) {
            return (Get-Item $Path).Length
        }
    }
    catch {
        return 0
    }
    return 0
}

function Remove-FilesSafely {
    param(
        [string[]]$FilePaths,
        [string]$Category
    )
    
    Write-CleanupLog "Processing $Category files..." "INFO"
    
    foreach ($filePath in $FilePaths) {
        if (Test-Path $filePath) {
            $fileSize = Get-FileSize $filePath
            
            if ($WhatIf) {
                Write-Host "WOULD DELETE: $filePath ($('{0:N0}' -f $fileSize) bytes)" -ForegroundColor Yellow
            }
            else {
                try {
                    if (-not $Force) {
                        $response = Read-Host "Delete $filePath? (y/N)"
                        if ($response -ne 'y' -and $response -ne 'Y') {
                            Write-CleanupLog "Skipped: $filePath" "INFO"
                            continue
                        }
                    }
                    
                    Remove-Item $filePath -Force
                    $CleanupSummary.FilesDeleted += $filePath
                    $CleanupSummary.TotalSizeFreed += $fileSize
                    Write-CleanupLog "Deleted: $filePath ($('{0:N0}' -f $fileSize) bytes)" "SUCCESS"
                }
                catch {
                    $errorMsg = "Failed to delete $filePath`: $($_.Exception.Message)"
                    $CleanupSummary.Errors += $errorMsg
                    Write-CleanupLog $errorMsg "ERROR"
                }
            }
        }
    }
}

function Remove-DirectorySafely {
    param(
        [string]$DirectoryPath,
        [string]$Category
    )
    
    if (Test-Path $DirectoryPath) {
        $itemCount = (Get-ChildItem $DirectoryPath -Recurse -File).Count
        
        if ($WhatIf) {
            Write-Host "WOULD DELETE DIRECTORY: $DirectoryPath ($itemCount files)" -ForegroundColor Yellow
        }
        else {
            try {
                if (-not $Force) {
                    $response = Read-Host "Delete directory $DirectoryPath and all contents ($itemCount files)? (y/N)"
                    if ($response -ne 'y' -and $response -ne 'Y') {
                        Write-CleanupLog "Skipped directory: $DirectoryPath" "INFO"
                        return
                    }
                }
                
                Remove-Item $DirectoryPath -Recurse -Force
                $CleanupSummary.DirectoriesDeleted += $DirectoryPath
                Write-CleanupLog "Deleted directory: $DirectoryPath ($itemCount files)" "SUCCESS"
            }
            catch {
                $errorMsg = "Failed to delete directory $DirectoryPath`: $($_.Exception.Message)"
                $CleanupSummary.Errors += $errorMsg
                Write-CleanupLog $errorMsg "ERROR"
            }
        }
    }
}

# Start cleanup process
Write-CleanupLog "Starting workspace cleanup..." "INFO"
Write-Host "=== MandA Discovery Suite Workspace Cleanup ===" -ForegroundColor Cyan

# 1. Cleanup working directory test files
Write-Host "`n1. Cleaning up working directory test files..." -ForegroundColor Green
$workingTestFiles = @(
    "working\Cleanup-TestingFiles-Phase2.ps1",
    "working\Cleanup-TestingFiles.ps1",
    "working\Fix-DiscoveryResultClasses.ps1",
    "working\Fix-ModuleContext.ps1",
    "working\Simple-DiscoveryTest.ps1",
    "working\Test-DiscoveryFixes.ps1",
    "working\Test-DiscoveryResultFix.ps1",
    "working\Unblock-AllFiles.ps1"
)
Remove-FilesSafely -FilePaths $workingTestFiles -Category "Working Directory Test Files"

# 2. Cleanup working/Scripts test files
Write-Host "`n2. Cleaning up working/Scripts test files..." -ForegroundColor Green
$workingScriptFiles = @(
    "working\Scripts\Add-VersionHeaders.ps1",
    "working\Scripts\Apply-LazyInitialization.ps1",
    "working\Scripts\Diagnose-CredentialFile.ps1",
    "working\Scripts\Test-AppRegistrationSyntax.ps1",
    "working\Scripts\Test-Credentials.ps1",
    "working\Scripts\Test-ErrorContextPreservation.ps1",
    "working\Scripts\Test-ErrorReporting-Simple.ps1",
    "working\Scripts\Test-ErrorReporting.ps1",
    "working\Scripts\Test-ModuleLoading.ps1",
    "working\Scripts\Test-PerformanceMetrics.ps1",
    "working\Scripts\Test-TimeoutHandling.ps1"
)
Remove-FilesSafely -FilePaths $workingScriptFiles -Category "Working Scripts Test Files"

# 3. Remove empty working/Scripts directory
Write-Host "`n3. Removing empty working/Scripts directory..." -ForegroundColor Green
if (Test-Path "working\Scripts" -and (Get-ChildItem "working\Scripts").Count -eq 0) {
    Remove-DirectorySafely -DirectoryPath "working\Scripts" -Category "Empty Directory"
}

# 4. Cleanup root level temporary files
Write-Host "`n4. Cleaning up root level temporary files..." -ForegroundColor Green
$rootTempFiles = @(
    "Cleanup-TestingFiles.ps1",
    "CleanupPhase2Report_20250606_114424.txt",
    "CleanupReport_20250606_114316.txt"
)
Remove-FilesSafely -FilePaths $rootTempFiles -Category "Root Level Temporary Files"

# 5. Cleanup duplicate/unused SQL Server modules
Write-Host "`n5. Cleaning up duplicate/unused SQL Server modules..." -ForegroundColor Green
$duplicateSQLFiles = @(
    "Modules\Discovery\SQLServerDiscovery_nouse.psm1",
    "Modules\Discovery\SQLServerDiscoveryNoUse.psm1"
)
Remove-FilesSafely -FilePaths $duplicateSQLFiles -Category "Duplicate SQL Server Modules"

# 6. Cleanup test error reports
Write-Host "`n6. Cleaning up test error reports..." -ForegroundColor Green
$testErrorReports = Get-ChildItem "TestErrorReports\*.log" -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
if ($testErrorReports) {
    Remove-FilesSafely -FilePaths $testErrorReports -Category "Test Error Reports"
}

# 7. Remove empty directories
Write-Host "`n7. Removing empty directories..." -ForegroundColor Green
$emptyDirs = @("Junk", "TestErrorReports")
foreach ($dir in $emptyDirs) {
    if (Test-Path $dir) {
        $itemCount = (Get-ChildItem $dir -ErrorAction SilentlyContinue).Count
        if ($itemCount -eq 0) {
            Remove-DirectorySafely -DirectoryPath $dir -Category "Empty Directory"
        }
    }
}

# 8. Remove working directory if empty
Write-Host "`n8. Checking working directory..." -ForegroundColor Green
if (Test-Path "working") {
    $workingItemCount = (Get-ChildItem "working" -ErrorAction SilentlyContinue).Count
    if ($workingItemCount -eq 0) {
        Remove-DirectorySafely -DirectoryPath "working" -Category "Empty Working Directory"
    }
    else {
        Write-CleanupLog "Working directory not empty ($workingItemCount items), keeping it" "INFO"
    }
}

# 9. Look for any .backup files
Write-Host "`n9. Searching for backup files..." -ForegroundColor Green
$backupFiles = Get-ChildItem -Path . -Recurse -Filter "*.backup" -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
if ($backupFiles) {
    Remove-FilesSafely -FilePaths $backupFiles -Category "Backup Files"
}
else {
    Write-CleanupLog "No backup files found" "INFO"
}

# 10. Look for temporary files (tmp, temp, etc.)
Write-Host "`n10. Searching for temporary files..." -ForegroundColor Green
$tempPatterns = @("*.tmp", "*.temp", "*~", "*.bak")
$tempFiles = @()
foreach ($pattern in $tempPatterns) {
    $tempFiles += Get-ChildItem -Path . -Recurse -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
}
if ($tempFiles) {
    Remove-FilesSafely -FilePaths $tempFiles -Category "Temporary Files"
}
else {
    Write-CleanupLog "No temporary files found" "INFO"
}

# Generate cleanup summary
Write-Host "`n=== Cleanup Summary ===" -ForegroundColor Cyan
Write-Host "Files deleted: $($CleanupSummary.FilesDeleted.Count)" -ForegroundColor Green
Write-Host "Directories deleted: $($CleanupSummary.DirectoriesDeleted.Count)" -ForegroundColor Green
Write-Host "Total space freed: $('{0:N0}' -f $CleanupSummary.TotalSizeFreed) bytes" -ForegroundColor Green

if ($CleanupSummary.Errors.Count -gt 0) {
    Write-Host "Errors encountered: $($CleanupSummary.Errors.Count)" -ForegroundColor Red
    foreach ($error in $CleanupSummary.Errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

# Save detailed summary
$summaryPath = "Cleanup-Summary-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
$summaryContent = @"
# Workspace Cleanup Summary
**Date:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Mode:** $(if ($WhatIf) { 'What-If (Simulation)' } else { 'Actual Cleanup' })

## Statistics
- **Files deleted:** $($CleanupSummary.FilesDeleted.Count)
- **Directories deleted:** $($CleanupSummary.DirectoriesDeleted.Count)
- **Total space freed:** $('{0:N2}' -f ($CleanupSummary.TotalSizeFreed / 1KB)) KB

## Files Deleted
$($CleanupSummary.FilesDeleted | ForEach-Object { "- $_" } | Out-String)

## Directories Deleted
$($CleanupSummary.DirectoriesDeleted | ForEach-Object { "- $_" } | Out-String)

## Errors
$($CleanupSummary.Errors | ForEach-Object { "- $_" } | Out-String)
"@

if (-not $WhatIf) {
    Set-Content -Path $summaryPath -Value $summaryContent
    Write-Host "`nDetailed summary saved to: $summaryPath" -ForegroundColor Cyan
}

Write-CleanupLog "Cleanup completed" "INFO"
Write-Host "`nCleanup completed!" -ForegroundColor Green

if ($WhatIf) {
    Write-Host "`nThis was a simulation. Run without -WhatIf to perform actual cleanup." -ForegroundColor Yellow
}