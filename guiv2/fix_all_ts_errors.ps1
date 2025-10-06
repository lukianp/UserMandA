#!/usr/bin/env pwsh
# Fix TypeScript errors systematically across all files

$ErrorActionPreference = "Stop"
$files = @()

# Get all TypeScript files with errors
Write-Host "Finding files with TypeScript errors..." -ForegroundColor Cyan
$tscOutput = npx tsc --noEmit --skipLibCheck 2>&1 | Out-String
$errorLines = $tscOutput -split "`n" | Where-Object { $_ -match "error TS" }

foreach ($line in $errorLines) {
    if ($line -match "^(.+\.tsx?)\(\d+,\d+\):") {
        $file = $matches[1]
        if ($file -notmatch "node_modules" -and (Test-Path $file)) {
            $files += $file
        }
    }
}

$files = $files | Select-Object -Unique | Sort-Object

Write-Host "Found $($files.Count) files with errors" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    Write-Host "Processing: $file" -ForegroundColor Green
    $content = Get-Content $file -Raw
    $originalContent = $content

    # Pattern 1: Fix addNotification calls
    $content = $content -replace "addNotification\('(\w+)',\s*'([^']+)'\)", "addNotification({ type: '`$1', message: '`$2' })"
    $content = $content -replace 'addNotification\("(\w+)",\s*"([^"]+)"\)', 'addNotification({ type: "$1", message: "$2" })'
    $content = $content -replace 'addNotification\(''(\w+)'',\s*`([^`]+)`\)', 'addNotification({ type: ''$1'', message: `$2` })'

    # Pattern 2: Fix Select onChange with e.target.value
    $content = $content -replace 'onChange=\{e\s*=>\s*([^}]+)e\.target\.value', 'onChange={value => $1value'
    $content = $content -replace 'onChange=\{\(e\)\s*=>\s*([^}]+)e\.target\.value', 'onChange={(value) => $1value'

    # Pattern 3: Fix Checkbox onChange with e.target.checked
    # Keep these as-is since checkboxes need the event

    # Pattern 4: Remove enableExport prop from VirtualizedDataGrid
    $content = $content -replace '\s+enableExport\s*', "`n          "

    # Pattern 5: Remove enableGrouping prop
    $content = $content -replace '\s+enableGrouping\s*', "`n          "

    # Pattern 6: Remove enableFiltering prop
    $content = $content -replace '\s+enableFiltering\s*', "`n          "

    # Pattern 7: Remove data-cy from VirtualizedDataGrid
    $content = $content -replace '\s+data-cy="[^"]+"\s*', "`n          "

    # Pattern 8: Fix Badge variant="secondary" to variant="default"
    $content = $content -replace 'variant="secondary"(?=\s*/>|\s*>)', 'variant="default"'

    # Pattern 9: Fix Badge variant="error" to variant="danger"
    $content = $content -replace '<Badge\s+variant="error"', '<Badge variant="danger"'

    # Pattern 10: Fix as any type casts for Select onChange
    $content = $content -replace 'onChange=\{e\s*=>\s*([^}]+)e\.target\.value\s+as\s+any\}', 'onChange={(value) => $1value}'

    if ($content -ne $originalContent) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "  Fixed $file" -ForegroundColor Yellow
    } else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Running TypeScript check..." -ForegroundColor Cyan
$errorCount = (npx tsc --noEmit --skipLibCheck 2>&1 | Select-String "error TS" | Measure-Object).Count
Write-Host "Remaining errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })
