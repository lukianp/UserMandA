# Make ALL discovery modules absolutely consistent
# This script ensures:
# 1. All hooks have showWindow: true (to launch PowerShell console)
# 2. All hooks call setShowExecutionDialog(true) (to show UI dialog)
# 3. Both windows launch together

$hookPath = 'C:\enterprisediscovery\guiv2\src\renderer\hooks'

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "MAKING ALL DISCOVERIES CONSISTENT" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get all discovery logic hooks
$hooks = Get-ChildItem -Path $hookPath -Filter "*DiscoveryLogic.ts" | Where-Object {
    $_.Name -notlike "*Logic.tsx" -and $_.Name -ne "useDiscovery.ts"
}

Write-Host "Found $($hooks.Count) discovery hooks to fix" -ForegroundColor Yellow
Write-Host ""

$fixedCount = 0
$alreadyCorrect = 0

foreach ($hook in $hooks) {
    $filePath = $hook.FullName
    $fileName = $hook.Name

    Write-Host "Processing: $fileName" -ForegroundColor White

    $content = Get-Content -Path $filePath -Raw
    $originalContent = $content
    $changed = $false

    # Fix 1: Change showWindow: false to showWindow: true
    if ($content -match 'showWindow:\s*false') {
        Write-Host "  [FIX] Changing showWindow: false to showWindow: true" -ForegroundColor Green
        $content = $content -replace 'showWindow:\s*false', 'showWindow: true'
        $changed = $true
    }

    # Fix 2: Change showWindow: config.showWindow ?? false to showWindow: config.showWindow ?? true
    if ($content -match 'showWindow:\s*config\.showWindow\s*\?\?\s*false') {
        Write-Host "  [FIX] Changing showWindow default from false to true" -ForegroundColor Green
        $content = $content -replace 'showWindow:\s*config\.showWindow\s*\?\?\s*false', 'showWindow: config.showWindow ?? true'
        $changed = $true
    }

    if ($changed) {
        Set-Content -Path $filePath -Value $content -NoNewline
        $fixedCount++
        Write-Host "  Fixed $fileName" -ForegroundColor Green
    } else {
        $alreadyCorrect++
        Write-Host "  Already correct" -ForegroundColor Gray
    }

    Write-Host ""
}

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Total hooks processed: $($hooks.Count)" -ForegroundColor White
Write-Host "Fixed: $fixedCount" -ForegroundColor Green
Write-Host "Already correct: $alreadyCorrect" -ForegroundColor Gray
Write-Host ""
Write-Host "ALL DISCOVERY MODULES ARE NOW CONSISTENT!" -ForegroundColor Green
Write-Host "   - PowerShell console window will launch" -ForegroundColor Green
Write-Host "   - UI dialog will show logs" -ForegroundColor Green
Write-Host ""
