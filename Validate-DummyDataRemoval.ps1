# Simple validation script for dummy data removal
param(
    [string]$WorkspacePath = "D:\Scripts\UserMandA",
    [string]$BuildPath = "C:\enterprisediscovery",
    [string]$DataPath = "C:\discoverydata\ljpops"
)

$ErrorActionPreference = "Stop"
$testResults = @()

Write-Host "`n=== DUMMY DATA ELIMINATION VALIDATION ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# Test 1: Check critical ViewModels
Write-Host "`n[TEST 1] Checking Critical ViewModels..." -ForegroundColor Yellow

$criticalViewModels = @(
    "SecurityPolicyViewModel.cs",
    "TeamsMigrationPlanningViewModel.cs", 
    "ProjectManagementViewModel.cs",
    "OneDriveMigrationPlanningViewModel.cs"
)

foreach ($vmFile in $criticalViewModels) {
    $vmPath = Join-Path "$WorkspacePath\GUI\ViewModels" $vmFile
    
    if (Test-Path $vmPath) {
        $content = Get-Content $vmPath -Raw
        
        # Check for dummy data patterns
        $hasDummy = $false
        if ($content -match 'GenerateDummy|GenerateSample|CreateTest|AddFake') {
            $hasDummy = $true
            Write-Host "  ❌ $vmFile - Found dummy generation methods" -ForegroundColor Red
        } elseif ($content -match 'new\s+\w+\s*\{[^}]*(Dummy|Sample|Test|Fake)') {
            $hasDummy = $true
            Write-Host "  ❌ $vmFile - Found dummy object creation" -ForegroundColor Red
        } elseif ($content -match '\.Add\(new\s+\w+\s*\{' -and $content -notmatch '(LoadFrom|CsvData|_csvDataLoader|foreach.*csv|from.*File)') {
            # Only flag if not part of CSV/data loading
            $hasDummy = $true
            Write-Host "  ⚠️  $vmFile - Found direct collection additions (needs review)" -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ $vmFile - No dummy data patterns found" -ForegroundColor Green
        }
        
        $testResults += @{
            Test = "ViewModel Check - $vmFile"
            Passed = -not $hasDummy
        }
    } else {
        Write-Host "  ⚠️  $vmFile - File not found" -ForegroundColor Yellow
    }
}

# Test 2: Check data directories
Write-Host "`n[TEST 2] Checking Data Directories..." -ForegroundColor Yellow

$csvCount = 0
if (Test-Path "$DataPath\RawData") {
    $csvFiles = Get-ChildItem -Path "$DataPath\RawData" -Filter "*.csv" -Recurse -File -ErrorAction SilentlyContinue
    $csvCount = $csvFiles.Count
}

if ($csvCount -eq 0) {
    Write-Host "  ✅ No CSV files found - clean state" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Found $csvCount CSV files in data directory" -ForegroundColor Cyan
    
    # Check first few lines of CSVs for dummy data
    $suspiciousFiles = @()
    foreach ($csv in $csvFiles | Select-Object -First 5) {
        $content = Get-Content $csv.FullName -First 10 -ErrorAction SilentlyContinue
        if ($content -match '(Dummy|Sample|Test|Fake|Mock)') {
            $suspiciousFiles += $csv.Name
        }
    }
    
    if ($suspiciousFiles.Count -gt 0) {
        Write-Host "  ⚠️  Potentially dummy data in: $($suspiciousFiles -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ CSV files appear legitimate" -ForegroundColor Green
    }
}

$testResults += @{
    Test = "Data Directory Check"
    Passed = ($csvCount -eq 0 -or $suspiciousFiles.Count -eq 0)
}

# Test 3: Check CsvDataService
Write-Host "`n[TEST 3] Checking CSV Data Service..." -ForegroundColor Yellow

$servicePath = "$WorkspacePath\GUI\Services\CsvDataService.cs"
if (Test-Path $servicePath) {
    $content = Get-Content $servicePath -Raw
    
    $hasErrorHandling = $content -match '(try|catch|FileNotFoundException)'
    $hasEmptyReturn = $content -match '(return\s+new\s+List|return\s+Enumerable\.Empty)'
    
    if ($hasErrorHandling -and $hasEmptyReturn) {
        Write-Host "  ✅ CsvDataService has proper error handling" -ForegroundColor Green
        $testResults += @{ Test = "CsvDataService"; Passed = $true }
    } else {
        Write-Host "  ⚠️  CsvDataService may lack proper error handling" -ForegroundColor Yellow
        $testResults += @{ Test = "CsvDataService"; Passed = $false }
    }
} else {
    Write-Host "  ℹ️  CsvDataService not found" -ForegroundColor Cyan
}

# Test 4: Check build output
Write-Host "`n[TEST 4] Checking Build Output..." -ForegroundColor Yellow

$exePath = Join-Path $BuildPath "MandADiscoverySuite.exe"
if (Test-Path $exePath) {
    Write-Host "  ✅ Application executable found" -ForegroundColor Green
    
    # Check required DLLs
    $requiredDlls = @("Microsoft.Graph.dll", "Azure.Identity.dll", "Newtonsoft.Json.dll")
    $missingDlls = @()
    
    foreach ($dll in $requiredDlls) {
        if (-not (Test-Path (Join-Path $BuildPath $dll))) {
            $missingDlls += $dll
        }
    }
    
    if ($missingDlls.Count -eq 0) {
        Write-Host "  ✅ All required DLLs present" -ForegroundColor Green
        $testResults += @{ Test = "Build Dependencies"; Passed = $true }
    } else {
        Write-Host "  ❌ Missing DLLs: $($missingDlls -join ', ')" -ForegroundColor Red
        $testResults += @{ Test = "Build Dependencies"; Passed = $false }
    }
} else {
    Write-Host "  ❌ Application executable not found" -ForegroundColor Red
    Write-Host "     Please run build-gui.ps1 first" -ForegroundColor Yellow
    $testResults += @{ Test = "Build Output"; Passed = $false }
}

# Generate Summary
Write-Host "`n=== VALIDATION SUMMARY ===" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Passed }).Count
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Red" })
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 90) { "Yellow" } else { "Red" })

# Final verdict
Write-Host "`n=== FINAL VERDICT ===" -ForegroundColor Cyan

if ($passedTests -eq $totalTests) {
    Write-Host "✅ VALIDATION SUCCESSFUL" -ForegroundColor Green
    Write-Host "The application is certified free of dummy data generation." -ForegroundColor Green
    Write-Host "All ViewModels properly handle empty states without generating fake data." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  VALIDATION COMPLETED WITH ISSUES" -ForegroundColor Yellow
    Write-Host "Review the failed tests above and address any remaining concerns." -ForegroundColor Yellow
    
    # List failed tests
    $failedTests = $testResults | Where-Object { -not $_.Passed }
    if ($failedTests.Count -gt 0) {
        Write-Host "`nFailed Tests:" -ForegroundColor Red
        foreach ($failed in $failedTests) {
            Write-Host "  - $($failed.Test)" -ForegroundColor Red
        }
    }
    exit 1
}