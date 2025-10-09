Write-Host "Checking all TypeScript errors..." -ForegroundColor Cyan

Push-Location "C:\enterprisediscovery\guiv2"

$output = npx tsc --noEmit 2>&1 | Out-String

# Count total errors
$errorCount = ([regex]::Matches($output, 'error TS')).Count
Write-Host "`nTotal TypeScript Errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { 'Green' } else { 'Red' })

# Get unique files with errors
Write-Host "`nFiles with errors:" -ForegroundColor Yellow
$output -split "`n" | Where-Object { $_ -match 'src/renderer/(.+?)\(' } | ForEach-Object {
    if ($_ -match 'src/renderer/(.+?)\(') {
        $matches[1]
    }
} | Sort-Object -Unique | ForEach-Object {
    Write-Host "  $_" -ForegroundColor White
}

# Show sample errors
Write-Host "`nSample errors (first 20):" -ForegroundColor Yellow
$output -split "`n" | Where-Object { $_ -match 'error TS' } | Select-Object -First 20 | ForEach-Object {
    Write-Host "  $_" -ForegroundColor DarkGray
}

Pop-Location

Write-Host ""
