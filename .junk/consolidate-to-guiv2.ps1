# Consolidate workspace to guiv2
# This script compares files in /src/ with /guiv2/src/ and identifies which are newer

$workspace = "D:\Scripts\UserMandA"
$srcBase = "$workspace\src"
$guiv2Base = "$workspace\guiv2\src"

# Extensions to check
$extensions = @('.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss')

Write-Host "=== CONSOLIDATION ANALYSIS ===" -ForegroundColor Cyan
Write-Host "Source: $srcBase" -ForegroundColor Yellow
Write-Host "Target: $guiv2Base" -ForegroundColor Yellow
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

Write-Host "Found $($srcFiles.Count) source files in /src/" -ForegroundColor Gray
Write-Host ""

$results = @()
$copyFromSrc = @()
$copyFromGuiv2 = @()
$onlyInSrc = @()
$identical = @()

foreach ($srcFile in $srcFiles) {
    $relativePath = $srcFile.FullName.Substring($srcBase.Length)
    $guiv2File = Join-Path $guiv2Base $relativePath

    if (Test-Path $guiv2File) {
        $guiv2Info = Get-Item $guiv2File

        # Compare
        $srcNewer = $srcFile.LastWriteTime -gt $guiv2Info.LastWriteTime
        $guiv2Newer = $guiv2Info.LastWriteTime -gt $srcFile.LastWriteTime
        $sizeDiff = $srcFile.Length - $guiv2Info.Length

        $result = [PSCustomObject]@{
            RelativePath = $relativePath
            SrcDate = $srcFile.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            Guiv2Date = $guiv2Info.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            SrcSize = $srcFile.Length
            Guiv2Size = $guiv2Info.Length
            SizeDiff = $sizeDiff
            Winner = if ($srcNewer) { "SRC" } elseif ($guiv2Newer) { "GUIV2" } else { "SAME" }
        }
        $results += $result

        if ($srcNewer) {
            $copyFromSrc += $result
        } elseif ($guiv2Newer) {
            $copyFromGuiv2 += $result
        } else {
            $identical += $result
        }
    } else {
        $onlyInSrc += [PSCustomObject]@{
            RelativePath = $relativePath
            SrcDate = $srcFile.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            SrcSize = $srcFile.Length
        }
    }
}

Write-Host "=== FILES WHERE SRC IS NEWER (need to copy TO guiv2) ===" -ForegroundColor Green
if ($copyFromSrc.Count -gt 0) {
    $copyFromSrc | Format-Table RelativePath, SrcDate, Guiv2Date, SizeDiff -AutoSize
} else {
    Write-Host "  None" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== FILES WHERE GUIV2 IS NEWER (keep guiv2 version) ===" -ForegroundColor Cyan
if ($copyFromGuiv2.Count -gt 0) {
    $copyFromGuiv2 | Format-Table RelativePath, SrcDate, Guiv2Date, SizeDiff -AutoSize
} else {
    Write-Host "  None" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== FILES ONLY IN SRC (need to move TO guiv2) ===" -ForegroundColor Yellow
if ($onlyInSrc.Count -gt 0) {
    $onlyInSrc | Select-Object -First 50 | Format-Table RelativePath, SrcDate, SrcSize -AutoSize
    if ($onlyInSrc.Count -gt 50) {
        Write-Host "  ... and $($onlyInSrc.Count - 50) more files" -ForegroundColor Gray
    }
} else {
    Write-Host "  None" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Magenta
Write-Host "  Files to copy from SRC to GUIV2: $($copyFromSrc.Count)" -ForegroundColor Green
Write-Host "  Files where GUIV2 is newer (keep): $($copyFromGuiv2.Count)" -ForegroundColor Cyan
Write-Host "  Files only in SRC (move to GUIV2): $($onlyInSrc.Count)" -ForegroundColor Yellow
Write-Host "  Files identical (can delete SRC): $($identical.Count)" -ForegroundColor Gray
