# Test All Views Automated Script
# Tests all registered views to identify which ones are missing or broken

$ErrorActionPreference = "Continue"

Write-Host "=== All Views Test ===" -ForegroundColor Green

# Get all registered views from ViewRegistry.cs
$viewRegistryPath = "D:\Scripts\UserMandA\GUI\Services\ViewRegistry.cs"
$registryContent = Get-Content $viewRegistryPath

# Extract view keys from the registry
$viewKeys = @()
$registryContent | Where-Object { $_ -match '\["(.+?)"\]\s*=' } | ForEach-Object {
    if ($_ -match '\["(.+?)"\]\s*=') {
        $key = $matches[1]
        if ($key -notlike "*View*" -and $key -notlike "*Discovery*") {
            $viewKeys += $key.ToLower()
        }
    }
}

# Remove duplicates and sort
$viewKeys = $viewKeys | Sort-Object | Get-Unique

Write-Host "Found registered view keys:" -ForegroundColor Yellow
$viewKeys | ForEach-Object { Write-Host "  $_" -ForegroundColor White }

# Check if corresponding view files exist
Write-Host "`nChecking view file existence:" -ForegroundColor Yellow

$missingViews = @()
$existingViews = @()

foreach ($key in $viewKeys) {
    $capitalizedKey = (Get-Culture).TextInfo.ToTitleCase($key)
    $viewFiles = @(
        "D:\Scripts\UserMandA\GUI\Views\${capitalizedKey}View.xaml",
        "D:\Scripts\UserMandA\GUI\Views\${capitalizedKey}ViewNew.xaml"
    )
    
    $found = $false
    foreach ($file in $viewFiles) {
        if (Test-Path $file) {
            Write-Host "  ✓ $key -> $file" -ForegroundColor Green
            $existingViews += $key
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "  ✗ $key -> No view file found" -ForegroundColor Red
        $missingViews += $key
    }
}

# Check ViewModel files
Write-Host "`nChecking ViewModel file existence:" -ForegroundColor Yellow

foreach ($key in $viewKeys) {
    $capitalizedKey = (Get-Culture).TextInfo.ToTitleCase($key)
    $viewModelFiles = @(
        "D:\Scripts\UserMandA\GUI\ViewModels\${capitalizedKey}ViewModel.cs",
        "D:\Scripts\UserMandA\GUI\ViewModels\${capitalizedKey}ViewModelNew.cs"
    )
    
    $found = $false
    foreach ($file in $viewModelFiles) {
        if (Test-Path $file) {
            Write-Host "  ✓ $key -> $file" -ForegroundColor Green
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "  ✗ $key -> No ViewModel file found" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total registered views: $($viewKeys.Count)" -ForegroundColor White
Write-Host "Existing views: $($existingViews.Count)" -ForegroundColor Green
Write-Host "Missing views: $($missingViews.Count)" -ForegroundColor Red

if ($missingViews.Count -gt 0) {
    Write-Host "`nMissing views that need to be created:" -ForegroundColor Red
    $missingViews | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

# Check specific critical views
$criticalViews = @("users", "groups", "applications", "reports")
Write-Host "`nCritical views status:" -ForegroundColor Cyan
foreach ($view in $criticalViews) {
    if ($view -in $existingViews) {
        Write-Host "  ✓ $view" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $view" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green