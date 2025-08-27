Write-Host "M&A Discovery Suite - Red Banner Test" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$findings = @()
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Check if application is running
$appProcess = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue

if (-not $appProcess) {
    Write-Host "`nStarting application..." -ForegroundColor Yellow
    try {
        Start-Process "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
        Start-Sleep -Seconds 8
        Write-Host "Application started." -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to start application." -ForegroundColor Red
        $findings += "CRITICAL: Application failed to start"
    }
} else {
    Write-Host "`nApplication is running." -ForegroundColor Green
}

# Check critical data files
Write-Host "`nChecking Data Files:" -ForegroundColor Cyan

$dataPath = "C:\discoverydata\ljpops\Raw"
$criticalFiles = @("Users.csv", "Groups.csv", "Applications.csv", "Infrastructure.csv", "FileServers.csv", "Databases.csv")

$dataStatus = @{}
foreach ($file in $criticalFiles) {
    $filePath = Join-Path $dataPath $file
    if (Test-Path $filePath) {
        $size = (Get-Item $filePath).Length
        if ($size -gt 50) {
            $sizeKB = [math]::Round($size/1KB, 1)
            Write-Host ("  ✓ " + $file + " (" + $sizeKB + " KB)") -ForegroundColor Green
            $dataStatus[$file] = "OK"
        } else {
            Write-Host "  ! $file (Empty)" -ForegroundColor Yellow
            $dataStatus[$file] = "Empty"
            $findings += "WARNING: $file is empty"
        }
    } else {
        Write-Host "  X $file (Missing)" -ForegroundColor Red
        $dataStatus[$file] = "Missing"
        $findings += "ERROR: $file is missing"
    }
}

# Check ViewModels
Write-Host "`nChecking ViewModels:" -ForegroundColor Cyan

$viewModels = @(
    "UsersViewModelNew", "ApplicationsViewModelNew", "GroupsViewModelNew", 
    "DatabasesViewModelNew", "FileServersViewModelNew", "SecurityPolicyViewModel", "ReportsViewModel"
)

$vmStatus = @{}
foreach ($vm in $viewModels) {
    $vmPath = "D:\Scripts\UserMandA\GUI\ViewModels\$vm.cs"
    if (Test-Path $vmPath) {
        Write-Host "  ✓ $vm" -ForegroundColor Green
        $vmStatus[$vm] = "OK"
    } else {
        Write-Host "  X $vm" -ForegroundColor Red
        $vmStatus[$vm] = "Missing"
        $findings += "ERROR: $vm is missing"
    }
}

# Check Models
Write-Host "`nChecking Models:" -ForegroundColor Cyan

$models = @("UserData", "ApplicationData", "GroupData", "DatabaseData", "FileServerData")
$modelStatus = @{}
foreach ($model in $models) {
    $modelPath = "D:\Scripts\UserMandA\GUI\Models\$model.cs"
    if (Test-Path $modelPath) {
        Write-Host "  ✓ $model" -ForegroundColor Green
        $modelStatus[$model] = "OK"
    } else {
        Write-Host "  X $model" -ForegroundColor Red
        $modelStatus[$model] = "Missing"
        $findings += "ERROR: $model is missing"
    }
}

# Summary
Write-Host "`nSUMMARY:" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan

if ($findings.Count -eq 0) {
    Write-Host "`n✅ NO CRITICAL ISSUES FOUND!" -ForegroundColor Green
    Write-Host "All data files, ViewModels, and Models are present." -ForegroundColor Green
    Write-Host "The application should work without red banners." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ FOUND $($findings.Count) ISSUES:" -ForegroundColor Yellow
    foreach ($finding in $findings) {
        Write-Host "  - $finding" -ForegroundColor Yellow
    }
}

Write-Host "`nMANUAL TESTING CHECKLIST:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "1. Launch the application if not already running"
Write-Host "2. Click through each menu item on the left side:"
Write-Host "   - Dashboard"
Write-Host "   - Users (both old and new)"
Write-Host "   - Groups (both old and new)"
Write-Host "   - Applications (both old and new)"
Write-Host "   - Infrastructure/Computers"
Write-Host "   - File Servers"
Write-Host "   - Databases"
Write-Host "   - Management/Project Management"
Write-Host "   - Reports"
Write-Host "   - Security Policy"
Write-Host "   - Analytics"
Write-Host "   - Settings"
Write-Host "3. Look for red error banners at the top of each view"
Write-Host "4. Note any views that show 'No data available' or binding errors"
Write-Host "5. Test interactive features like filtering and searching"

Write-Host "`nData File Status:" -ForegroundColor Cyan
foreach ($file in $dataStatus.Keys) {
    $status = $dataStatus[$file]
    $color = if ($status -eq "OK") { "Green" } elseif ($status -eq "Empty") { "Yellow" } else { "Red" }
    Write-Host "  $file`: $status" -ForegroundColor $color
}

$reportPath = "simple_red_banner_test_results.txt"
$reportContent = "M and A Discovery Suite Red Banner Test Results`n"
$reportContent += "Test Date: $timestamp`n`n"
$reportContent += "Issues Found: $($findings.Count)`n`n"
if ($findings.Count -gt 0) {
    $reportContent += "Details:`n"
    foreach ($finding in $findings) {
        $reportContent += "- $finding`n"
    }
}
$reportContent += "`nData Status:`n"
foreach ($file in $dataStatus.Keys) {
    $reportContent += "$file`: $($dataStatus[$file])`n"
}

$reportContent | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`nReport saved to: $reportPath" -ForegroundColor Green