# Consolidate workspace to guiv2 - EXECUTE
# This script copies newer files from /src/ to /guiv2/src/

$workspace = "D:\Scripts\UserMandA"
$srcBase = "$workspace\src"
$guiv2Base = "$workspace\guiv2\src"

# Extensions to check
$extensions = @('.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss')

Write-Host "=== EXECUTING CONSOLIDATION ===" -ForegroundColor Cyan
Write-Host ""

# Get all source files
$srcFiles = Get-ChildItem $srcBase -Recurse -File | Where-Object {
    $extensions -contains $_.Extension -and
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\.junk\\' -and
    $_.FullName -notmatch '\\dist\\' -and
    $_.FullName -notmatch '\\coverage\\' -and
    $_.FullName -notmatch '\\test-results\\'
}

$copyCount = 0
$skipCount = 0
$errorCount = 0

foreach ($srcFile in $srcFiles) {
    $relativePath = $srcFile.FullName.Substring($srcBase.Length)
    $guiv2FilePath = Join-Path $guiv2Base $relativePath

    if (Test-Path $guiv2FilePath) {
        $guiv2Info = Get-Item $guiv2FilePath

        # Copy if src is newer
        if ($srcFile.LastWriteTime -gt $guiv2Info.LastWriteTime) {
            try {
                Copy-Item -Path $srcFile.FullName -Destination $guiv2FilePath -Force
                Write-Host "[COPIED] $relativePath" -ForegroundColor Green
                $copyCount++
            } catch {
                Write-Host "[ERROR] $relativePath - $($_.Exception.Message)" -ForegroundColor Red
                $errorCount++
            }
        } else {
            $skipCount++
        }
    }
    # Files only in src with no guiv2 counterpart - we skip these since analysis showed 0 such files
}

Write-Host ""
Write-Host "=== CONSOLIDATION COMPLETE ===" -ForegroundColor Cyan
Write-Host "  Files copied: $copyCount" -ForegroundColor Green
Write-Host "  Files skipped (guiv2 newer or same): $skipCount" -ForegroundColor Gray
Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
