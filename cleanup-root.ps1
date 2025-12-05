# Root Directory Cleanup Script
# Moves temporary development files to .junk while preserving essential build configurations

$rootDir = "D:\Scripts\UserMandA"
$junkDir = "$rootDir\.junk"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Ensure .junk directory exists
if (-not (Test-Path $junkDir)) {
    New-Item -ItemType Directory -Path $junkDir -Force | Out-Null
}

# Create log file
$logFile = "$junkDir\cleanup-$timestamp.log"
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -FilePath $logFile -Append
    Write-Host $Message
}

Write-Log "===== ROOT DIRECTORY CLEANUP STARTED ====="
Write-Log "Root: $rootDir"
Write-Log "Junk: $junkDir"

# Phase 1: Test/Fix/Analyze Scripts
Write-Log "`n=== PHASE 1: Moving Test/Fix/Analyze Scripts ==="
$phase1Patterns = @('fix-*', 'test-*', 'find-*', 'analyze-*', 'add-*')
$phase1Files = @()
foreach ($pattern in $phase1Patterns) {
    $phase1Files += Get-ChildItem -Path $rootDir -File -Filter $pattern
}
Write-Log "Found $($phase1Files.Count) files matching Phase 1 patterns"
foreach ($file in $phase1Files) {
    Move-Item -Path $file.FullName -Destination $junkDir -Force
    Write-Log "Moved: $($file.Name)"
}

# Phase 2: Progress/Status Files
Write-Log "`n=== PHASE 2: Moving Progress/Status Files ==="
$phase2Patterns = @('progress*.json', 'status*.json', '*-report.json', '*-report.md', 'jest-*.json', '*-checkpoint.json', 'after-*.json', 'before-*.json')
$phase2Files = @()
foreach ($pattern in $phase2Patterns) {
    $phase2Files += Get-ChildItem -Path $rootDir -File -Filter $pattern
}
Write-Log "Found $($phase2Files.Count) files matching Phase 2 patterns"
foreach ($file in $phase2Files) {
    Move-Item -Path $file.FullName -Destination $junkDir -Force
    Write-Log "Moved: $($file.Name)"
}

# Phase 3: Utility Scripts
Write-Log "`n=== PHASE 3: Moving Utility Scripts ==="
$phase3Patterns = @('auto-*.js', 'compare-*.ps1', 'consolidate-*.ps1', 'copy-*.ps1', 'deploy-*.ps1', 'mass-*.js', 'Quick*.ps1', 'Run*.ps1', 'Simple-*.ps1', 'sync-*.ps1')
$phase3Files = @()
foreach ($pattern in $phase3Patterns) {
    $phase3Files += Get-ChildItem -Path $rootDir -File -Filter $pattern
}
Write-Log "Found $($phase3Files.Count) files matching Phase 3 patterns"
foreach ($file in $phase3Files) {
    Move-Item -Path $file.FullName -Destination $junkDir -Force
    Write-Log "Moved: $($file.Name)"
}

# Phase 4: Log Files and CSV Test Data
Write-Log "`n=== PHASE 4: Moving Log Files and Test Data ==="
$phase4Patterns = @('*.log', '*-output.txt', 'ActiveDirectoryUsers.csv')
$phase4Files = @()
foreach ($pattern in $phase4Patterns) {
    $phase4Files += Get-ChildItem -Path $rootDir -File -Filter $pattern
}
Write-Log "Found $($phase4Files.Count) files matching Phase 4 patterns"
foreach ($file in $phase4Files) {
    Move-Item -Path $file.FullName -Destination $junkDir -Force
    Write-Log "Moved: $($file.Name)"
}

# Summary
$totalMoved = $phase1Files.Count + $phase2Files.Count + $phase3Files.Count + $phase4Files.Count
Write-Log "`n===== CLEANUP SUMMARY ====="
Write-Log "Phase 1 (Test/Fix/Analyze): $($phase1Files.Count) files"
Write-Log "Phase 2 (Progress/Status): $($phase2Files.Count) files"
Write-Log "Phase 3 (Utility Scripts): $($phase3Files.Count) files"
Write-Log "Phase 4 (Logs/Test Data): $($phase4Files.Count) files"
Write-Log "TOTAL MOVED: $totalMoved files"
Write-Log "Log file: $logFile"
Write-Log "===== CLEANUP COMPLETED ====="

# Count remaining files
$remainingFiles = (Get-ChildItem -Path $rootDir -File).Count
Write-Log "`nRemaining files in root: $remainingFiles"
