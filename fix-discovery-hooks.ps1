#!/usr/bin/env pwsh
# Fix onProgress safety checks in all discovery logic hooks

$hooksDir = "D:\Scripts\UserMandA\guiv2\src\renderer\hooks"
$files = Get-ChildItem $hooksDir -Filter "*DiscoveryLogic.ts"

$fixCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Fix onProgress
    if ($content -match '(?m)^(\s+)const api = getElectronAPI\(\);\s*\r?\n\s+const unsubscribe = api\.onProgress') {
        $indent = $matches[1]
        $content = $content -replace '(?m)^(\s+)const api = getElectronAPI\(\);\s*\r?\n\s+const unsubscribe = api\.onProgress',
            "${indent}const api = getElectronAPI();`n${indent}if (!api || !api.onProgress) return () => {};`n`n${indent}const unsubscribe = api.onProgress"

        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Fixed onProgress in: $($file.Name)" -ForegroundColor Green
        $fixCount++
    }

    # Fix onOutput
    if ($content -match '(?m)^(\s+)const api = getElectronAPI\(\);\s*\r?\n\s+const unsubscribe = api\.onOutput') {
        $indent = $matches[1]
        $content = Get-Content $file.FullName -Raw
        $content = $content -replace '(?m)^(\s+)const api = getElectronAPI\(\);\s*\r?\n\s+const unsubscribe = api\.onOutput',
            "${indent}const api = getElectronAPI();`n${indent}if (!api || !api.onOutput) return () => {};`n`n${indent}const unsubscribe = api.onOutput"

        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Fixed onOutput in: $($file.Name)" -ForegroundColor Green
        $fixCount++
    }
}

Write-Host "`n🎯 Fixed $fixCount issues in discovery logic hooks" -ForegroundColor Cyan
