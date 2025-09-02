# Script to apply Complete method fix to all affected PowerShell modules
# This script will automatically fix the broken $this reference in hashtable scriptblocks

param(
    [string]$Path = ".",
    [switch]$FixOnly,
    [switch]$ReportOnly
)

$fixedFiles = 0

# Get all .psm1 files that contain the problematic Complete method pattern
$modulesToFix = Get-ChildItem -Path $Path -Recurse -Filter "*.psm1" |
    Select-String -Pattern 'AddError.*\{.*\$this' |
    Select-Object -ExpandProperty Path -Unique

Write-Host "Found $($modulesToFix.Count) modules that need fixing."
Write-Host ""

if ($ReportOnly) {
    foreach ($file in $modulesToFix) {
        Write-Host $file
    }
    Write-Host ""
    Write-Host "To fix all, run: .\apply_complete_fix.ps1 -FixOnly"
    exit 0
}

foreach ($file in $modulesToFix) {
    Write-Host "Processing: $file"
    $content = Get-Content -Path $file -Raw

    # Check if Complete method exists (simplified)
    if ($content -match 'Complete\s*=.*\$this\.EndTime') {
        Write-Host "  - Has invalid Complete property (will be handled by removing call)"

        # Simple removal of Complete property line
        $content = $content -replace '(?m)Complete\s*=.*\$this\.EndTime.*\', ''
        Write-Host "  - Complete property removed"
    }

    # Check if Complete() is called
    if ($content -match '\$result\.Complete\(\)') {
        Write-Host "  - Fixing $result.Complete() call"

        # Replace $result.Complete() with $result.EndTime = Get-Date
        $content = $content -replace '\$result\.Complete\(\)', '$result.EndTime = Get-Date'
        Write-Host "  - Call fixed"
    }

    Set-Content -Path $file -Value $content
    $fixedFiles++
    Write-Host "  ✓ Fixed successfully`n"
}

Write-Host "Complete! Fixed $fixedFiles modules."
Write-Host ""
Write-Host "Summary of changes:"
Write-Host "- Removed 'Complete = { \$this.EndTime = Get-Date }.GetNewClosure()' from hashtables"
Write-Host "- Changed '\$result.Complete()' calls to '\$result.EndTime = Get-Date' in finally blocks"
Write-Host ""
Write-Host "✓ All modules should now work without the 'does not contain a method named Complete' error."