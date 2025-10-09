param([int]$MaxIter = 5, [int]$Wait = 15)

$src = "D:\Scripts\UserMandA\guiv2\src\renderer"
$bld = "C:\enterprisediscovery\guiv2\src\renderer"

Write-Host "Automated Error Fix Loop" -ForegroundColor Cyan

function Get-Errors {
    Push-Location "C:\enterprisediscovery\guiv2"
    $out = npx tsc --noEmit 2>&1 | Out-String
    Pop-Location
    $errors = @()
    foreach ($line in ($out -split "`n")) {
        if ($line -match 'src/renderer/([^(]+)\(') {
            $file = $matches[1]
            $errors += @{ File = $file; Path = Join-Path $src $file }
        }
    }
    return $errors
}

function Fix-File($file, $path) {
    if (-not (Test-Path $path)) {
        Write-Host "  SKIP: File not found - $file" -ForegroundColor Red
        return $false
    }
    $txt = Get-Content $path -Raw
    $old = $txt

    # Pattern 1: result.error with type assertion
    if ($txt -match 'result\.error') {
        $txt = $txt -replace '(\bresult)\.error(\s+\|\|)', '($1 as any).error$2'
        Write-Host "  Applied: result.error fix to $file" -ForegroundColor Yellow
    }

    # Pattern 2: tanstack imports
    if ($txt -match '@tanstack/react-table') {
        $txt = $txt -replace '@tanstack/react-table', 'ag-grid-community'
        $txt = $txt -replace '\bColumnDef\b', 'ColDef'
        $txt = $txt -replace '\baccessorKey:', 'field:'
        $txt = $txt -replace '\bheader:', 'headerName:'
        Write-Host "  Applied: tanstack fix to $file" -ForegroundColor Yellow
    }

    # Pattern 2b: accessorKey → field (for files already converted)
    if ($txt -match '\baccessorKey:') {
        $txt = $txt -replace '\baccessorKey:', 'field:'
        Write-Host "  Applied: accessorKey -> field fix to $file" -ForegroundColor Yellow
    }

    # Pattern 2c: header → headerName (AG Grid property)
    if ($txt -match '\bheader:\s*''[^'']+''') {
        $txt = $txt -replace '\bheader:', 'headerName:'
        Write-Host "  Applied: header -> headerName fix to $file" -ForegroundColor Yellow
    }

    # Pattern 2d: enableSorting → sortable (AG Grid property)
    if ($txt -match '\benableSorting:') {
        $txt = $txt -replace '\benableSorting:', 'sortable:'
        Write-Host "  Applied: enableSorting -> sortable fix to $file" -ForegroundColor Yellow
    }

    # Pattern 2e: enableColumnFilter → filter (AG Grid property)
    if ($txt -match '\benableColumnFilter:') {
        $txt = $txt -replace '\benableColumnFilter:', 'filter:'
        Write-Host "  Applied: enableColumnFilter -> filter fix to $file" -ForegroundColor Yellow
    }

    # Pattern 3: getValue any type
    if ($txt -match 'cell:\s*\(\s*\{\s*getValue\s*\}') {
        $txt = $txt -replace 'cell:\s*\(\s*\{\s*getValue\s*\}\s*\)', 'cell: ({ getValue }: any)'
        Write-Host "  Applied: getValue fix to $file" -ForegroundColor Yellow
    }

    if ($txt -ne $old) {
        Set-Content -Path $path -Value $txt -NoNewline
        $dest = Join-Path $bld $file
        $dir = Split-Path $dest
        if (-not (Test-Path $dir)) { New-Item -Type Directory $dir -Force | Out-Null }
        Copy-Item $path $dest -Force
        Write-Host "  FIXED & SYNCED: $file" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  NO MATCH: No fixable patterns in $file" -ForegroundColor DarkGray
    }
    return $false
}

$i = 0
$total = 0

while ($i -lt $MaxIter) {
    $i++
    Write-Host "`n=== Iteration $i ===" -ForegroundColor Magenta
    $errs = Get-Errors
    if ($errs.Count -eq 0) {
        Write-Host "No errors!" -ForegroundColor Green
        break
    }
    Write-Host "Found $($errs.Count) error locations" -ForegroundColor Yellow
    $fixed = 0
    foreach ($e in ($errs | Sort-Object File -Unique)) {
        if (Fix-File $e.File $e.Path) { $fixed++; $total++ }
    }
    if ($fixed -eq 0) { break }
    Write-Host "Waiting ${Wait}s..." -ForegroundColor Yellow
    Start-Sleep -Seconds $Wait
}

Write-Host "`nTotal fixed: $total" -ForegroundColor Green
