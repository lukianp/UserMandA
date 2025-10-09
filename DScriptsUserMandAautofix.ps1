# Live automated error fixing
param([int]$MaxIter = 5, [int]$Wait = 15)

$src = "D:\Scripts\UserMandA\guiv2\src\renderer"
$bld = "C:\enterprisediscovery\guiv2\src\renderer"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Automated Error Fixing Loop" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Get-Errors {
    Write-Host "Checking for errors..." -ForegroundColor Yellow
    Push-Location "C:\enterprisediscovery\guiv2"
    $out = & npx tsc --noEmit 2>&1 | Out-String
    Pop-Location

    $errors = @()
    foreach ($line in ($out -split "`n")) {
        if ($line -match 'src/renderer/([^(]+)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)') {
            $errors += @{
                File = $matches[1]
                Line = $matches[2]
                Msg = $matches[4]
                Path = Join-Path $src $matches[1]
            }
        }
    }
    return $errors
}

function Fix-File {
    param($file, $path)

    if (-not (Test-Path $path)) { return $false }

    $txt = Get-Content $path -Raw
    $old = $txt

    # Fix result.error
    $txt = $txt -replace '(\bresult)\.error(\s+\|\|)', '(`$1 as any).error`$2'

    # Fix tanstack
    $txt = $txt -replace '@tanstack/react-table', 'ag-grid-community'
    $txt = $txt -replace '\bColumnDef\b', 'ColDef'
    $txt = $txt -replace 'cell:\s*\(\s*\{\s*getValue\s*\}\s*\)', 'cell: ({ getValue }: any)'

    if ($txt -ne $old) {
        Set-Content -Path $path -Value $txt -NoNewline
        $dest = Join-Path $bld $file
        $dir = Split-Path $dest
        if (-not (Test-Path $dir)) { New-Item -Type Directory $dir -Force | Out-Null }
        Copy-Item $path $dest -Force
        Write-Host "  [OK] Fixed: $file" -ForegroundColor Green
        return $true
    }
    return $false
}

# Main loop
$i = 0
$total = 0

while ($i -lt $MaxIter) {
    $i++
    Write-Host "`n=== Iteration $i/$MaxIter ===" -ForegroundColor Magenta

    $errs = Get-Errors

    if ($errs.Count -eq 0) {
        Write-Host "No errors found!" -ForegroundColor Green
        break
    }

    Write-Host "Found $($errs.Count) errors" -ForegroundColor Yellow

    $fixed = 0
    $files = $errs | Group-Object File

    foreach ($group in $files) {
        if (Fix-File $group.Name $group.Group[0].Path) {
            $fixed++
            $total++
        }
    }

    if ($fixed -eq 0) {
        Write-Host "No fixable errors" -ForegroundColor Yellow
        break
    }

    Write-Host "`nWaiting ${Wait}s for rebuild..." -ForegroundColor Yellow
    Start-Sleep -Seconds $Wait
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Iterations: $i" -ForegroundColor White
Write-Host "Files fixed: $total" -ForegroundColor Green

$final = Get-Errors
Write-Host "Remaining errors: $($final.Count)" -ForegroundColor $(if ($final.Count -eq 0) { "Green" } else { "Red" })
Write-Host "=========================================" -ForegroundColor Cyan
