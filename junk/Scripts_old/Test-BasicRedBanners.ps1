Write-Host "M&A Discovery Suite - Red Banner Test" -ForegroundColor Green

$findings = @()

# Check if application is running
Write-Host "`nChecking application status..."
$appProcess = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
if ($appProcess) {
    Write-Host "Application is running" -ForegroundColor Green
} else {
    Write-Host "Starting application..." -ForegroundColor Yellow
    Start-Process "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
    Start-Sleep -Seconds 5
}

# Check data files
Write-Host "`nChecking critical data files..."
$dataPath = "C:\discoverydata\ljpops\Raw"
$files = @("Users.csv", "Groups.csv", "Applications.csv", "Infrastructure.csv")

foreach ($file in $files) {
    $path = Join-Path $dataPath $file
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        if ($size -gt 100) {
            Write-Host "OK: $file" -ForegroundColor Green
        } else {
            Write-Host "EMPTY: $file" -ForegroundColor Yellow
            $findings += "Empty file: $file"
        }
    } else {
        Write-Host "MISSING: $file" -ForegroundColor Red
        $findings += "Missing file: $file"
    }
}

# Check ViewModels
Write-Host "`nChecking ViewModels..."
$vmPath = "D:\Scripts\UserMandA\GUI\ViewModels"
$viewModels = @("UsersViewModelNew.cs", "ApplicationsViewModelNew.cs", "ReportsViewModel.cs")

foreach ($vm in $viewModels) {
    $path = Join-Path $vmPath $vm
    if (Test-Path $path) {
        Write-Host "OK: $vm" -ForegroundColor Green
    } else {
        Write-Host "MISSING: $vm" -ForegroundColor Red
        $findings += "Missing ViewModel: $vm"
    }
}

# Summary
Write-Host "`nRESULTS:"
if ($findings.Count -eq 0) {
    Write-Host "SUCCESS: No critical issues found!" -ForegroundColor Green
} else {
    Write-Host "ISSUES FOUND:" -ForegroundColor Yellow
    foreach ($finding in $findings) {
        Write-Host "- $finding" -ForegroundColor Yellow
    }
}

Write-Host "`nMANUAL TESTING:"
Write-Host "1. Open the application"
Write-Host "2. Click each menu item"
Write-Host "3. Look for red banners"
Write-Host "4. Note empty views or errors"