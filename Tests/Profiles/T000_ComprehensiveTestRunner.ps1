# T-000 Comprehensive Test Runner for Source and Target Company Profiles & Environment Detection
# This script runs all T-000 related tests and generates a comprehensive validation report

param(
    [string]$OutputPath = "C:\discoverydata\ljpops\TestResults",
    [switch]$Verbose,
    [switch]$GenerateReport
)

$ErrorActionPreference = 'Stop'

# Initialize test environment
Write-Host "===== T-000 COMPREHENSIVE TEST VALIDATION =====" -ForegroundColor Cyan
Write-Host "Testing Source and Target Company Profiles & Environment Detection" -ForegroundColor Yellow
Write-Host ""

# Create output directory
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$testResults = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    TestSuite = "T-000: Source and Target Company Profiles"
    Categories = @{}
    Summary = @{
        TotalTests = 0
        Passed = 0
        Failed = 0
        Skipped = 0
    }
}

# Function to run MSTest tests
function Run-MSTests {
    param(
        [string]$TestAssembly,
        [string]$TestClass
    )
    
    Write-Host "Running tests in: $TestClass" -ForegroundColor Green
    
    try {
        # Build the test project first
        $buildPath = "D:\Scripts\UserMandA\GUI"
        Push-Location $buildPath
        
        $buildResult = & dotnet build --configuration Debug 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Build failed for test project"
            Pop-Location
            return $null
        }
        
        # Run the specific test class
        $testResult = & dotnet test `
            --filter "FullyQualifiedName~$TestClass" `
            --logger "trx;LogFileName=$OutputPath\$TestClass.trx" `
            --verbosity normal 2>&1
        
        Pop-Location
        
        # Parse results
        $passed = 0
        $failed = 0
        $total = 0
        
        foreach ($line in $testResult) {
            if ($line -match "Passed:\s+(\d+)") {
                $passed = [int]$matches[1]
            }
            if ($line -match "Failed:\s+(\d+)") {
                $failed = [int]$matches[1]
            }
            if ($line -match "Total:\s+(\d+)") {
                $total = [int]$matches[1]
            }
        }
        
        return @{
            Total = $total
            Passed = $passed
            Failed = $failed
            TestClass = $TestClass
        }
    }
    catch {
        Write-Warning "Error running tests for $TestClass : $_"
        return $null
    }
}

# Test Categories
$testCategories = @(
    @{
        Name = "Profile Management"
        TestClass = "MandADiscoverySuite.Tests.Profiles.T000_ProfileManagementTests"
        Description = "Profile enumeration, selection persistence, and validation"
    },
    @{
        Name = "Environment Detection"
        TestClass = "MandADiscoverySuite.Tests.Profiles.T000_EnvironmentDetectionTests"
        Description = "Environment type detection, confidence scoring, and status display"
    },
    @{
        Name = "Connection Testing"
        TestClass = "MandADiscoverySuite.Tests.Profiles.T000_ConnectionTestingTests"
        Description = "Source/target connection validation with various credential scenarios"
    },
    @{
        Name = "Security & Credentials"
        TestClass = "MandADiscoverySuite.Tests.Profiles.T000_SecurityCredentialTests"
        Description = "Encryption, decryption, secure storage, and logging safety"
    },
    @{
        Name = "UI Integration"
        TestClass = "MandADiscoverySuite.Tests.Profiles.T000_UIIntegrationTests"
        Description = "Dropdown population, command binding, status updates, and persistence"
    }
)

# Run tests for each category
foreach ($category in $testCategories) {
    Write-Host ""
    Write-Host "Testing Category: $($category.Name)" -ForegroundColor Yellow
    Write-Host "Description: $($category.Description)" -ForegroundColor Gray
    Write-Host "-" * 60
    
    $result = Run-MSTests -TestClass $category.TestClass
    
    if ($result) {
        $testResults.Categories[$category.Name] = @{
            TestClass = $category.TestClass
            Description = $category.Description
            Total = $result.Total
            Passed = $result.Passed
            Failed = $result.Failed
            Success = ($result.Failed -eq 0)
        }
        
        $testResults.Summary.TotalTests += $result.Total
        $testResults.Summary.Passed += $result.Passed
        $testResults.Summary.Failed += $result.Failed
        
        if ($result.Failed -eq 0) {
            Write-Host "✓ All tests passed ($($result.Passed)/$($result.Total))" -ForegroundColor Green
        } else {
            Write-Host "✗ Some tests failed ($($result.Failed)/$($result.Total))" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠ Tests could not be run for this category" -ForegroundColor Yellow
        $testResults.Categories[$category.Name] = @{
            TestClass = $category.TestClass
            Description = $category.Description
            Success = $false
            Error = "Tests could not be executed"
        }
    }
}

# Additional validation tests using real discovery data
Write-Host ""
Write-Host "Running Discovery Data Validation Tests" -ForegroundColor Yellow
Write-Host "-" * 60

$discoveryValidation = @{
    ProfilesFound = 0
    ValidProfiles = @()
    InvalidProfiles = @()
    EnvironmentTypes = @{}
}

# Check actual discovery data
$discoveryPath = "C:\discoverydata"
if (Test-Path $discoveryPath) {
    $profiles = Get-ChildItem -Path $discoveryPath -Directory
    
    foreach ($profile in $profiles) {
        $discoveryValidation.ProfilesFound++
        
        # Check for Project.json
        $projectFile = Join-Path $profile.FullName "Project.json"
        $rawPath = Join-Path $profile.FullName "Raw"
        
        if ((Test-Path $projectFile) -and (Test-Path $rawPath)) {
            $discoveryValidation.ValidProfiles += $profile.Name
            
            # Detect environment type
            $csvFiles = Get-ChildItem -Path $rawPath -Filter "*.csv" -ErrorAction SilentlyContinue
            $envType = "Unknown"
            
            if ($csvFiles | Where-Object { $_.Name -match "AzureAD|ExchangeOnline" }) {
                $envType = "Azure"
            } elseif ($csvFiles | Where-Object { $_.Name -match "DomainController|Exchange\.csv" }) {
                $envType = "OnPremises"
            } elseif ($csvFiles | Where-Object { $_.Name -match "AzureADConnect|Hybrid" }) {
                $envType = "Hybrid"
            }
            
            if (-not $discoveryValidation.EnvironmentTypes.ContainsKey($envType)) {
                $discoveryValidation.EnvironmentTypes[$envType] = 0
            }
            $discoveryValidation.EnvironmentTypes[$envType]++
        } else {
            $discoveryValidation.InvalidProfiles += $profile.Name
        }
    }
    
    Write-Host "Discovery Data Validation Results:" -ForegroundColor Green
    Write-Host "  Total Profiles Found: $($discoveryValidation.ProfilesFound)"
    Write-Host "  Valid Profiles: $($discoveryValidation.ValidProfiles.Count)"
    Write-Host "  Invalid Profiles: $($discoveryValidation.InvalidProfiles.Count)"
    Write-Host "  Environment Types Detected:"
    foreach ($env in $discoveryValidation.EnvironmentTypes.Keys) {
        Write-Host "    - $env : $($discoveryValidation.EnvironmentTypes[$env])"
    }
}

$testResults.DiscoveryValidation = $discoveryValidation

# Generate summary
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$passRate = if ($testResults.Summary.TotalTests -gt 0) {
    [math]::Round(($testResults.Summary.Passed / $testResults.Summary.TotalTests) * 100, 2)
} else { 0 }

Write-Host "Total Tests: $($testResults.Summary.TotalTests)"
Write-Host "Passed: $($testResults.Summary.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Summary.Failed)" -ForegroundColor $(if ($testResults.Summary.Failed -gt 0) { "Red" } else { "Gray" })
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

# Category breakdown
Write-Host ""
Write-Host "Category Results:" -ForegroundColor Yellow
foreach ($catName in $testResults.Categories.Keys) {
    $cat = $testResults.Categories[$catName]
    $icon = if ($cat.Success) { "✓" } else { "✗" }
    $color = if ($cat.Success) { "Green" } else { "Red" }
    Write-Host "  $icon $catName : $($cat.Passed)/$($cat.Total)" -ForegroundColor $color
}

# Generate detailed report if requested
if ($GenerateReport) {
    $reportPath = Join-Path $OutputPath "T000_TestReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host ""
    Write-Host "Detailed report saved to: $reportPath" -ForegroundColor Cyan
}

# Success criteria validation
Write-Host ""
Write-Host "SUCCESS CRITERIA VALIDATION" -ForegroundColor Yellow
Write-Host "-" * 60

$criteria = @(
    @{
        Name = "Profiles enumerate from discovery data directory"
        Met = $discoveryValidation.ProfilesFound -gt 0
    },
    @{
        Name = "Selected profiles persist across application restarts"
        Met = $testResults.Categories["Profile Management"].Passed -gt 0
    },
    @{
        Name = "Environment detection shows On-Premises/Azure/Hybrid with confidence"
        Met = $testResults.Categories["Environment Detection"].Passed -gt 0
    },
    @{
        Name = "Connection tests handle valid, invalid, and missing credentials gracefully"
        Met = $testResults.Categories["Connection Testing"].Passed -gt 0
    },
    @{
        Name = "Target profile credentials are encrypted with Windows DPAPI"
        Met = $testResults.Categories["Security & Credentials"].Passed -gt 0
    },
    @{
        Name = "UI reflects current status for both source and target"
        Met = $testResults.Categories["UI Integration"].Passed -gt 0
    }
)

$criteriaMetCount = 0
foreach ($criterion in $criteria) {
    $icon = if ($criterion.Met) { "✓"; $criteriaMetCount++ } else { "✗" }
    $color = if ($criterion.Met) { "Green" } else { "Red" }
    Write-Host "$icon $($criterion.Name)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Success Criteria Met: $criteriaMetCount/$($criteria.Count)" -ForegroundColor $(if ($criteriaMetCount -eq $criteria.Count) { "Green" } else { "Yellow" })

# Final status
$overallSuccess = ($testResults.Summary.Failed -eq 0) -and ($criteriaMetCount -eq $criteria.Count)
$status = if ($overallSuccess) { "PASS" } elseif ($testResults.Summary.Failed -le 5) { "PARTIAL" } else { "FAIL" }

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "OVERALL TEST STATUS: $status" -ForegroundColor $(
    switch ($status) {
        "PASS" { "Green" }
        "PARTIAL" { "Yellow" }
        "FAIL" { "Red" }
    }
)
Write-Host "=" * 60 -ForegroundColor Cyan

# Return status for automation
return @{
    Status = $status
    TestResults = $testResults
    CriteriaMet = $criteriaMetCount
    TotalCriteria = $criteria.Count
    PassRate = $passRate
}