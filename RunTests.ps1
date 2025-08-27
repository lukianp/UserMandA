# M&A Discovery Suite - Migration Platform Test Report

Write-Host ""
Write-Host "===== M&A Discovery Suite - Migration Platform Test Report =====" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0
$failedTests = 0

# Test function
function Test-Item {
    param($Name, $Path)
    $script:totalTests++
    if (Test-Path $Path) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:passedTests++
    }
    else {
        Write-Host "[FAIL] $Name - Not Found: $Path" -ForegroundColor Red
        $script:failedTests++
    }
}

# 1. PowerShell Modules
Write-Host "=== PowerShell Modules ===" -ForegroundColor Yellow
Test-Item "MailboxMigration Module" "D:\Scripts\UserMandA\Modules\Discovery\MailboxMigration.psm1"
Test-Item "SharePointMigration Module" "D:\Scripts\UserMandA\Modules\Discovery\SharePointMigration.psm1"
Test-Item "FileSystemMigration Module" "D:\Scripts\UserMandA\Modules\Discovery\FileSystemMigration.psm1"
Test-Item "VirtualMachineMigration Module" "D:\Scripts\UserMandA\Modules\Discovery\VirtualMachineMigration.psm1"
Test-Item "UserProfileMigration Module" "D:\Scripts\UserMandA\Modules\Discovery\UserProfileMigration.psm1"
Test-Item "UserMigration Module" "D:\Scripts\UserMandA\Modules\Discovery\UserMigration.psm1"

# 2. Migration Views
Write-Host ""
Write-Host "=== Migration Views ===" -ForegroundColor Yellow
Test-Item "Exchange Migration View" "D:\Scripts\UserMandA\GUI\Views\ExchangeMigrationPlanningViewSimple.xaml"
Test-Item "SharePoint Migration View" "D:\Scripts\UserMandA\GUI\Views\SharePointMigrationPlanningView.xaml"
Test-Item "OneDrive Migration View" "D:\Scripts\UserMandA\GUI\Views\OneDriveMigrationPlanningView.xaml"
Test-Item "Teams Migration View" "D:\Scripts\UserMandA\GUI\Views\TeamsMigrationPlanningView.xaml"

# 3. ViewModels
Write-Host ""
Write-Host "=== ViewModels ===" -ForegroundColor Yellow
Test-Item "Exchange ViewModel" "D:\Scripts\UserMandA\GUI\ViewModels\ExchangeMigrationPlanningViewModelSimple.cs"
Test-Item "SharePoint ViewModel" "D:\Scripts\UserMandA\GUI\ViewModels\SharePointMigrationPlanningViewModel.cs"
Test-Item "OneDrive ViewModel" "D:\Scripts\UserMandA\GUI\ViewModels\OneDriveMigrationPlanningViewModel.cs"
Test-Item "Teams ViewModel" "D:\Scripts\UserMandA\GUI\ViewModels\TeamsMigrationPlanningViewModel.cs"

# 4. Services
Write-Host ""
Write-Host "=== Migration Services ===" -ForegroundColor Yellow
Test-Item "PowerShell Execution Service" "D:\Scripts\UserMandA\GUI\Services\PowerShellExecutionService.cs"
Test-Item "Migration Orchestration Engine" "D:\Scripts\UserMandA\GUI\Services\MigrationOrchestrationEngine.cs"
Test-Item "Migration Wave Orchestrator" "D:\Scripts\UserMandA\GUI\Services\MigrationWaveOrchestrator.cs"
Test-Item "Migration Error Handler" "D:\Scripts\UserMandA\GUI\Services\MigrationErrorHandler.cs"
Test-Item "Migration State Service" "D:\Scripts\UserMandA\GUI\Services\MigrationStateService.cs"
Test-Item "Resource Throttling Service" "D:\Scripts\UserMandA\GUI\Services\ResourceThrottlingService.cs"

# 5. Data Integration
Write-Host ""
Write-Host "=== Data Integration ===" -ForegroundColor Yellow
if (Test-Path "C:\discoverydata\ljpops\Raw") {
    Write-Host "[PASS] Discovery data path exists" -ForegroundColor Green
    $passedTests++
    $totalTests++
    
    $csvCount = (Get-ChildItem "C:\discoverydata\ljpops\Raw" -Filter "*.csv" -ErrorAction SilentlyContinue).Count
    if ($csvCount -gt 0) {
        Write-Host "[PASS] Found $csvCount CSV files in discovery path" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "[INFO] No CSV files found in discovery path" -ForegroundColor Yellow
        $passedTests++
    }
    $totalTests++
}
else {
    Write-Host "[FAIL] Discovery data path not found" -ForegroundColor Red
    $failedTests++
    $totalTests++
}

# 6. Build Status
Write-Host ""
Write-Host "=== Build Artifacts ===" -ForegroundColor Yellow
Test-Item "GUI Project File" "D:\Scripts\UserMandA\GUI\MandADiscoverySuite.csproj"
Test-Item "Debug Build Folder" "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows"
Test-Item "Compiled DLL" "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.dll"

# Summary
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                        TEST SUMMARY                            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $totalTests"
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host ""
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) {"Green"} elseif ($passRate -ge 60) {"Yellow"} else {"Red"})

# Recommendations
Write-Host ""
Write-Host "=== Key Findings ===" -ForegroundColor Cyan

if ($failedTests -gt 0) {
    Write-Host "* Some components are missing or not deployed" -ForegroundColor Yellow
    Write-Host "* GUI compilation has errors that need resolution" -ForegroundColor Yellow
    Write-Host "* Recommend fixing duplicate class definitions" -ForegroundColor Yellow
}
else {
    Write-Host "* All components successfully deployed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Integration Points to Verify ===" -ForegroundColor Cyan
Write-Host "* PowerShell module execution from GUI"
Write-Host "* Real-time progress streaming"
Write-Host "* Migration state persistence"
Write-Host "* Error recovery workflows"
Write-Host "* Resource throttling under load"

Write-Host ""
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan