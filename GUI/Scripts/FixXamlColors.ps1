# XAML Color Fix Script - Removes #FF prefix from color values
# Fixes the XAML color parsing exception: '#FFA0AEC0' is not a valid value for property 'Color'

param(
    [string]$SourcePath = "D:\Scripts\UserMandA\GUI",
    [switch]$WhatIf = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "XAML Color Format Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Source Path: $SourcePath" -ForegroundColor Green
Write-Host "WhatIf Mode: $WhatIf" -ForegroundColor Yellow
Write-Host ""

# Find all XAML files
$xamlFiles = Get-ChildItem -Path $SourcePath -Recurse -Filter "*.xaml" | Where-Object { -not $_.PSIsContainer }

Write-Host "Found $($xamlFiles.Count) XAML files to process" -ForegroundColor Green
Write-Host ""

$totalFixed = 0
$filesModified = 0

foreach ($file in $xamlFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor White

    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content

    # Pattern to match #FF followed by exactly 6 hex digits (case insensitive)
    $pattern = '#FF([0-9A-Fa-f]{6})'
    $matches = [regex]::Matches($content, $pattern)

    if ($matches.Count -gt 0) {
        Write-Host "  Found $($matches.Count) color patterns to fix" -ForegroundColor Yellow

        # Replace all matches
        $content = [regex]::Replace($content, $pattern, '#$1')

        if (-not $WhatIf) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "  ✅ Fixed $($matches.Count) color patterns" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Would fix $($matches.Count) color patterns (WhatIf mode)" -ForegroundColor Yellow
        }

        $totalFixed += $matches.Count
        $filesModified++

        # Show first few examples
        for ($i = 0; $i -lt [Math]::Min(3, $matches.Count); $i++) {
            $oldValue = $matches[$i].Value
            $newValue = $oldValue -replace '#FF', '#'
            Write-Host "    $oldValue → $newValue" -ForegroundColor Cyan
        }
        if ($matches.Count -gt 3) {
            Write-Host "    ... and $($matches.Count - 3) more" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✅ No problematic patterns found" -ForegroundColor Green
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files processed: $($xamlFiles.Count)" -ForegroundColor White
Write-Host "Files modified: $filesModified" -ForegroundColor Green
Write-Host "Total fixes applied: $totalFixed" -ForegroundColor Green

if ($WhatIf) {
    Write-Host "" -ForegroundColor Yellow
    Write-Host "This was a WhatIf run. No files were actually modified." -ForegroundColor Yellow
    Write-Host "Run again without -WhatIf to apply the changes." -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor Cyan
Write-Host "XAML Color Fix Script completed successfully!" -ForegroundColor Cyan