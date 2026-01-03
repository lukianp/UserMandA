$sourcePath = "D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovered"
$deployPath = "C:\enterprisediscovery\guiv2\src\renderer\views\discovered"

$sourceFiles = Get-ChildItem "$sourcePath\*.tsx" -Exclude "_*.tsx"

$sourceWith = @()
$sourceWithout = @()
$deployWith = @()
$deployWithout = @()
$needsCopy = @()

foreach ($file in $sourceFiles) {
    $sourceContent = Get-Content $file.FullName -Raw
    $deployFile = Join-Path $deployPath $file.Name

    # Check source
    if ($sourceContent -match 'overflow-y-auto min-h-0' -or $sourceContent -match 'h-screen.*overflow-hidden') {
        $sourceWith += $file.Name
    } else {
        $sourceWithout += $file.Name
    }

    # Check deployment if exists
    if (Test-Path $deployFile) {
        $deployContent = Get-Content $deployFile -Raw
        if ($deployContent -match 'overflow-y-auto min-h-0' -or $deployContent -match 'h-screen.*overflow-hidden') {
            $deployWith += $file.Name
        } else {
            $deployWithout += $file.Name
        }

        # Check if source has it but deploy doesn't
        if (($sourceContent -match 'overflow-y-auto min-h-0' -or $sourceContent -match 'h-screen.*overflow-hidden') -and
            ($deployContent -notmatch 'overflow-y-auto min-h-0' -and $deployContent -notmatch 'h-screen.*overflow-hidden')) {
            $needsCopy += $file.Name
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SCROLLING VERIFICATION REPORT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Source Directory Analysis:" -ForegroundColor Yellow
Write-Host "  Files WITH scrolling: $($sourceWith.Count)" -ForegroundColor Green
Write-Host "  Files WITHOUT scrolling: $($sourceWithout.Count)" -ForegroundColor Red

Write-Host "`nDeployment Directory Analysis:" -ForegroundColor Yellow
Write-Host "  Files WITH scrolling: $($deployWith.Count)" -ForegroundColor Green
Write-Host "  Files WITHOUT scrolling: $($deployWithout.Count)" -ForegroundColor Red

if ($needsCopy.Count -gt 0) {
    Write-Host "`nFiles needing deployment (have scrolling in source but not in deploy):" -ForegroundColor Yellow
    $needsCopy | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
}

if ($sourceWithout.Count -gt 0) {
    Write-Host "`nSource files still missing scrolling:" -ForegroundColor Red
    $sourceWithout | Select-Object -First 20 | ForEach-Object { Write-Host "  - $_" }
    if ($sourceWithout.Count -gt 20) {
        Write-Host "  ... and $($sourceWithout.Count - 20) more"
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
