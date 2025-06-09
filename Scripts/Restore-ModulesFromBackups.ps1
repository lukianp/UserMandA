# Restore Modules from Backups
# Restores all modules from their most recent backups

param(
    [string]$ModulesPath = "Modules",
    [switch]$RestoreDiscoveryInterfaces = $true
)

function Write-RestoreLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Gray" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

Write-RestoreLog "Starting module restoration from backups" "INFO"

# Find all backup files
$backupFiles = Get-ChildItem -Path $ModulesPath -Recurse -Filter "*.backup.*" | Sort-Object LastWriteTime -Descending

if ($backupFiles.Count -eq 0) {
    Write-RestoreLog "No backup files found" "WARN"
    exit 1
}

Write-RestoreLog "Found $($backupFiles.Count) backup files" "INFO"

# Group backups by original file
$backupGroups = $backupFiles | Group-Object { $_.FullName -replace '\.backup\..*$', '' }

$restoredCount = 0
$errorCount = 0

foreach ($group in $backupGroups) {
    $originalFile = $group.Name
    $backups = $group.Group | Sort-Object LastWriteTime -Descending
    
    # Skip error handling backups if we want to keep discovery interfaces
    if ($RestoreDiscoveryInterfaces) {
        $backups = $backups | Where-Object { $_.Name -notlike "*errorhandling*" }
    }
    
    if ($backups.Count -eq 0) {
        Write-RestoreLog "No suitable backup found for $originalFile" "WARN"
        continue
    }
    
    $latestBackup = $backups[0]
    
    try {
        Write-RestoreLog "Restoring $originalFile from $($latestBackup.Name)" "INFO"
        Copy-Item $latestBackup.FullName $originalFile -Force
        $restoredCount++
        Write-RestoreLog "Successfully restored $([System.IO.Path]::GetFileName($originalFile))" "SUCCESS"
    } catch {
        Write-RestoreLog "Error restoring $originalFile`: $($_.Exception.Message)" "ERROR"
        $errorCount++
    }
}

Write-RestoreLog "Restoration complete" "SUCCESS"
Write-RestoreLog "Files restored: $restoredCount" "SUCCESS"
Write-RestoreLog "Errors: $errorCount" $(if ($errorCount -eq 0) { "SUCCESS" } else { "WARN" })

# Test the restoration
Write-RestoreLog "Testing restored modules..." "INFO"
try {
    $testResult = & powershell -ExecutionPolicy Bypass -File "Scripts\Simple-ModuleValidator.ps1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-RestoreLog "Module validation passed!" "SUCCESS"
    } else {
        Write-RestoreLog "Module validation completed with issues" "WARN"
    }
} catch {
    Write-RestoreLog "Error running validation test: $($_.Exception.Message)" "ERROR"
}

Write-RestoreLog "Module restoration process completed" "SUCCESS"