# Script to fix Complete method errors in all affected PowerShell modules
Write-Host "Applying Complete method fixes to all affected modules..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "." -Recurse -Filter "*.psm1"
$fixed = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw

    if ($content -match '\$result\.Complete\(\)') {
        Write-Host "Fixing: $($file.Name)" -ForegroundColor Yellow

        # Replace $result.Complete() with $result.EndTime = Get-Date
        $content = $content -replace '\$result\.Complete\(\)', '$result.EndTime = Get-Date'

        Set-Content -Path $file.FullName -Value $content
        $fixed++
    }
}

Write-Host "Fixed $fixed modules." -ForegroundColor Green
Write-Host "All Complete method errors should now be resolved." -ForegroundColor Green