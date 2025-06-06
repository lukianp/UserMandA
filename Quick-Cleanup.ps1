<#
.SYNOPSIS
    Quick cleanup script for immediate workspace cleanup
.DESCRIPTION
    Removes known temporary and junk files without prompts
#>

Write-Host "=== Quick Workspace Cleanup ===" -ForegroundColor Cyan

$filesToDelete = @(
    # Working directory test files
    "working\Cleanup-TestingFiles-Phase2.ps1",
    "working\Cleanup-TestingFiles.ps1", 
    "working\Fix-DiscoveryResultClasses.ps1",
    "working\Fix-ModuleContext.ps1",
    "working\Simple-DiscoveryTest.ps1",
    "working\Test-DiscoveryFixes.ps1",
    "working\Test-DiscoveryResultFix.ps1",
    
    
    # Working scripts
    "working\Scripts\Add-VersionHeaders.ps1",
    "working\Scripts\Apply-LazyInitialization.ps1",
  
    "working\Scripts\Test-AppRegistrationSyntax.ps1",
    "working\Scripts\Test-Credentials.ps1",
    "working\Scripts\Test-ErrorContextPreservation.ps1",
    "working\Scripts\Test-ErrorReporting-Simple.ps1",
    "working\Scripts\Test-ErrorReporting.ps1",
    "working\Scripts\Test-ModuleLoading.ps1",
    "working\Scripts\Test-PerformanceMetrics.ps1",
    "working\Scripts\Test-TimeoutHandling.ps1",
    
    # Root temporary files
    "Cleanup-TestingFiles.ps1",
    "CleanupPhase2Report_20250606_114424.txt",
    "CleanupReport_20250606_114316.txt",
    
    # Duplicate SQL modules
    "Modules\Discovery\SQLServerDiscovery_nouse.psm1",
    "Modules\Discovery\SQLServerDiscoveryNoUse.psm1"
)

$deletedCount = 0
$totalSize = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        try {
            $size = (Get-Item $file).Length
            Remove-Item $file -Force
            Write-Host "Deleted: $file" -ForegroundColor Green
            $deletedCount++
            $totalSize += $size
        }
        catch {
            Write-Host "Failed to delete: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Clean up test error reports
$testReports = Get-ChildItem "TestErrorReports\*.log" -ErrorAction SilentlyContinue
foreach ($report in $testReports) {
    try {
        $size = $report.Length
        Remove-Item $report.FullName -Force
        Write-Host "Deleted: $($report.FullName)" -ForegroundColor Green
        $deletedCount++
        $totalSize += $size
    }
    catch {
        Write-Host "Failed to delete: $($report.FullName) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Remove empty directories
$dirsToCheck = @("working\Scripts", "TestErrorReports", "Junk")
foreach ($dir in $dirsToCheck) {
    if (Test-Path $dir) {
        $items = Get-ChildItem $dir -ErrorAction SilentlyContinue
        if ($items.Count -eq 0) {
            try {
                Remove-Item $dir -Force
                Write-Host "Removed empty directory: $dir" -ForegroundColor Yellow
            }
            catch {
                Write-Host "Failed to remove directory: $dir - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# Check if working directory is empty
if (Test-Path "working") {
    $workingItems = Get-ChildItem "working" -ErrorAction SilentlyContinue
    if ($workingItems.Count -eq 0) {
        try {
            Remove-Item "working" -Force
            Write-Host "Removed empty working directory" -ForegroundColor Yellow
        }
        catch {
            Write-Host "Failed to remove working directory - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host "Files deleted: $deletedCount" -ForegroundColor Green
Write-Host "Space freed: $('{0:N0}' -f $totalSize) bytes ($('{0:N2}' -f ($totalSize / 1KB)) KB)" -ForegroundColor Green