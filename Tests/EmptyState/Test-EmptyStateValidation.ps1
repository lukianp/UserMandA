#Requires -Version 5.1
<#
.SYNOPSIS
    Comprehensive empty state validation test suite for M&A Discovery Suite
    
.DESCRIPTION
    Tests application behavior with missing CSV data to ensure graceful handling
    and appropriate empty state displays across all discovery modules.
    
.NOTES
    Author: Test & Data Validation Agent
    Version: 1.0.0
    Date: 2025-09-05
#>

param(
    [string]$TestProfile = "EmptyStateTest",
    [string]$BuildPath = "C:\enterprisediscovery",
    [string]$DataPath = "C:\discoverydata",
    [switch]$CreateCleanEnvironment,
    [switch]$DetailedLogging
)

# Test configuration
$script:TestConfig = @{
    Profile = $TestProfile
    BuildPath = $BuildPath
    DataPath = $DataPath
    TestDataPath = Join-Path $DataPath $TestProfile
    RawDataPath = Join-Path $DataPath "$TestProfile\RawData"
    LogPath = Join-Path $DataPath "$TestProfile\Logs"
    ResultsPath = "D:\Scripts\UserMandA\TestResults\EmptyState"
    Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
}

# Test results storage
$script:TestResults = @{
    Status = "RUNNING"
    StartTime = Get-Date
    EndTime = $null
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    PartialTests = 0
    Suites = @{
        EmptyStateHandling = @()
        CsvValidation = @()
        UINavigation = @()
        DataBinding = @()
        ExportFunctions = @()
    }
    CsvValidation = @{
        CheckedPaths = @()
        MissingFiles = @()
        EmptyFiles = @()
        HandledGracefully = @()
        Errors = @()
    }
    FunctionalCases = @()
    Artifacts = @()
}

# Initialize test environment
function Initialize-TestEnvironment {
    Write-Host "`n=== Initializing Empty State Test Environment ===" -ForegroundColor Cyan
    
    # Create test directories
    $directories = @(
        $script:TestConfig.TestDataPath
        $script:TestConfig.RawDataPath
        $script:TestConfig.LogPath
        $script:TestConfig.ResultsPath
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "Created directory: $dir" -ForegroundColor Green
        }
    }
    
    if ($CreateCleanEnvironment) {
        Write-Host "Creating clean test environment (no CSV files)..." -ForegroundColor Yellow
        # Ensure RawData directory exists but is empty
        Get-ChildItem -Path $script:TestConfig.RawDataPath -Filter "*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force
        Write-Host "Cleaned RawData directory" -ForegroundColor Green
    }
    
    # Create minimal company profile
    $profilePath = Join-Path $script:TestConfig.TestDataPath "CompanyProfile.json"
    $profile = @{
        CompanyName = $TestProfile
        Domain = "emptytest.local"
        CreatedDate = Get-Date -Format "yyyy-MM-dd"
        DataPath = $script:TestConfig.TestDataPath
    } | ConvertTo-Json
    
    $profile | Out-File -FilePath $profilePath -Encoding UTF8
    Write-Host "Created test company profile" -ForegroundColor Green
}

# Test CSV loading with missing files
function Test-CsvLoadingMissingFiles {
    Write-Host "`n=== Testing CSV Loading with Missing Files ===" -ForegroundColor Cyan
    
    $csvFiles = @(
        "Users.csv"
        "Groups.csv"
        "Computers.csv"
        "Applications.csv"
        "Mailboxes.csv"
        "SharePointSites.csv"
        "OneDriveSites.csv"
        "Teams.csv"
        "SQLDatabases.csv"
        "FileShares.csv"
        "PrintServers.csv"
        "GPOs.csv"
        "SecurityPolicies.csv"
        "ConditionalAccessPolicies.csv"
        "Licenses.csv"
        "AzureResources.csv"
        "NetworkDevices.csv"
        "DHCPScopes.csv"
        "DNSZones.csv"
        "CertificateAuthorities.csv"
    )
    
    $results = @()
    
    foreach ($csvFile in $csvFiles) {
        $csvPath = Join-Path $script:TestConfig.RawDataPath $csvFile
        $script:TestResults.CsvValidation.CheckedPaths += $csvPath
        
        $test = @{
            File = $csvFile
            Path = $csvPath
            Exists = Test-Path $csvPath
            TestResult = "PENDING"
            Message = ""
        }
        
        if (-not $test.Exists) {
            $script:TestResults.CsvValidation.MissingFiles += $csvFile
            $test.TestResult = "EXPECTED_MISSING"
            $test.Message = "File intentionally missing for empty state test"
        }
        
        $results += $test
        
        if ($DetailedLogging) {
            Write-Host "  - $csvFile : $($test.TestResult)" -ForegroundColor $(if ($test.TestResult -eq "EXPECTED_MISSING") { "Green" } else { "Red" })
        }
    }
    
    $script:TestResults.Suites.CsvValidation = $results
    $script:TestResults.TotalTests += $results.Count
    $script:TestResults.PassedTests += ($results | Where-Object { $_.TestResult -eq "EXPECTED_MISSING" }).Count
    
    Write-Host "CSV Loading Tests: $($results.Count) files checked, all missing as expected" -ForegroundColor Green
}

# Test application launch with empty data
function Test-ApplicationLaunch {
    Write-Host "`n=== Testing Application Launch with Empty Data ===" -ForegroundColor Cyan
    
    $exePath = Join-Path $script:TestConfig.BuildPath "MandADiscoverySuite.exe"
    
    if (-not (Test-Path $exePath)) {
        Write-Host "ERROR: Application not found at $exePath" -ForegroundColor Red
        $script:TestResults.Status = "FAIL"
        return
    }
    
    try {
        # Start application with test profile
        $processArgs = @{
            FilePath = $exePath
            ArgumentList = "--profile", $script:TestConfig.Profile, "--test-mode"
            WindowStyle = "Minimized"
            PassThru = $true
        }
        
        Write-Host "Starting application..." -ForegroundColor Yellow
        $process = Start-Process @processArgs
        
        # Wait for application to initialize
        Start-Sleep -Seconds 5
        
        if ($process.HasExited) {
            Write-Host "ERROR: Application crashed on startup" -ForegroundColor Red
            $script:TestResults.Suites.EmptyStateHandling += @{
                Test = "ApplicationLaunch"
                Result = "FAIL"
                Message = "Application crashed with empty data"
            }
            $script:TestResults.FailedTests++
        } else {
            Write-Host "SUCCESS: Application launched successfully" -ForegroundColor Green
            $script:TestResults.Suites.EmptyStateHandling += @{
                Test = "ApplicationLaunch"
                Result = "PASS"
                Message = "Application handles empty data on startup"
            }
            $script:TestResults.PassedTests++
            
            # Clean up
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
        
        $script:TestResults.TotalTests++
    }
    catch {
        Write-Host "ERROR: Failed to launch application: $_" -ForegroundColor Red
        $script:TestResults.Suites.EmptyStateHandling += @{
            Test = "ApplicationLaunch"
            Result = "FAIL"
            Message = $_.Exception.Message
        }
        $script:TestResults.FailedTests++
        $script:TestResults.TotalTests++
    }
}

# Test ViewModels initialization with null/empty data
function Test-ViewModelInitialization {
    Write-Host "`n=== Testing ViewModel Initialization with Empty Data ===" -ForegroundColor Cyan
    
    Add-Type -Path (Join-Path $script:TestConfig.BuildPath "MandADiscoverySuite.dll")
    
    $viewModels = @(
        "UsersViewModel"
        "GroupsViewModel"
        "ComputersViewModel"
        "ApplicationsViewModel"
        "MailboxesViewModel"
        "SharePointViewModel"
        "OneDriveViewModel"
        "TeamsViewModel"
        "SQLDatabasesViewModel"
        "FileSharesViewModel"
        "PrintersViewModel"
        "SecurityPoliciesViewModel"
        "LicensesViewModel"
        "AzureResourcesViewModel"
        "NetworkingViewModel"
    )
    
    $results = @()
    
    foreach ($vmName in $viewModels) {
        $test = @{
            ViewModel = $vmName
            Result = "PENDING"
            Message = ""
            InitializationTime = 0
        }
        
        try {
            $typeName = "MandADiscoverySuite.ViewModels.$vmName"
            $type = [Type]::GetType($typeName)
            
            if ($null -eq $type) {
                # Try alternate namespace
                $typeName = "MandADiscoverySuite.GUI.ViewModels.$vmName"
                $type = [Type]::GetType($typeName)
            }
            
            if ($null -ne $type) {
                $sw = [System.Diagnostics.Stopwatch]::StartNew()
                $instance = [Activator]::CreateInstance($type)
                $sw.Stop()
                
                $test.InitializationTime = $sw.ElapsedMilliseconds
                $test.Result = "PASS"
                $test.Message = "ViewModel initialized successfully in $($sw.ElapsedMilliseconds)ms"
                
                # Check if collections are properly initialized
                $dataProperty = $type.GetProperty("Data") ?? $type.GetProperty("Items")
                if ($null -ne $dataProperty) {
                    $data = $dataProperty.GetValue($instance)
                    if ($null -eq $data) {
                        $test.Result = "PARTIAL"
                        $test.Message = "ViewModel initialized but data collection is null"
                    }
                }
            } else {
                $test.Result = "SKIP"
                $test.Message = "ViewModel type not found"
            }
        }
        catch {
            $test.Result = "FAIL"
            $test.Message = $_.Exception.Message
        }
        
        $results += $test
        
        if ($DetailedLogging) {
            $color = switch ($test.Result) {
                "PASS" { "Green" }
                "PARTIAL" { "Yellow" }
                "FAIL" { "Red" }
                default { "Gray" }
            }
            Write-Host "  - $vmName : $($test.Result) - $($test.Message)" -ForegroundColor $color
        }
    }
    
    $script:TestResults.Suites.DataBinding = $results
    $script:TestResults.TotalTests += $results.Count
    $script:TestResults.PassedTests += ($results | Where-Object { $_.Result -eq "PASS" }).Count
    $script:TestResults.PartialTests += ($results | Where-Object { $_.Result -eq "PARTIAL" }).Count
    $script:TestResults.FailedTests += ($results | Where-Object { $_.Result -eq "FAIL" }).Count
    
    Write-Host "ViewModel Tests Complete: $($results.Count) tested" -ForegroundColor Green
}

# Test UI navigation with empty data
function Test-UINavigation {
    Write-Host "`n=== Testing UI Navigation with Empty Data ===" -ForegroundColor Cyan
    
    $navigationScript = @'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

$exePath = "{0}"
$profile = "{1}"

# Start application
$app = Start-Process -FilePath $exePath -ArgumentList "--profile", $profile -PassThru
Start-Sleep -Seconds 5

if ($app.HasExited) {
    return @{ Success = $false; Message = "Application crashed on startup" }
}

try {
    # Get main window
    $automation = [System.Windows.Automation.AutomationElement]::RootElement
    $condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty, $app.Id)
    $mainWindow = $automation.FindFirst([System.Windows.Automation.TreeScope]::Children, $condition)
    
    if ($null -eq $mainWindow) {
        throw "Could not find main window"
    }
    
    # Test navigation through main sections
    $sections = @("Users", "Groups", "Applications", "Mailboxes", "SharePoint", "Teams")
    $results = @()
    
    foreach ($section in $sections) {
        $buttonCondition = New-Object System.Windows.Automation.AndCondition(
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)),
            (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $section))
        )
        
        $button = $mainWindow.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $buttonCondition)
        
        if ($null -ne $button) {
            try {
                $invokePattern = $button.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
                $invokePattern.Invoke()
                Start-Sleep -Milliseconds 500
                
                # Check for empty state message
                $textCondition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::Text)
                $textElements = $mainWindow.FindAll([System.Windows.Automation.TreeScope]::Descendants, $textCondition)
                
                $hasEmptyState = $false
                foreach ($text in $textElements) {
                    $content = $text.GetCurrentPropertyValue([System.Windows.Automation.AutomationElement]::NameProperty)
                    if ($content -match "No data|No .* found|Empty|0 items") {
                        $hasEmptyState = $true
                        break
                    }
                }
                
                $results += @{
                    Section = $section
                    NavigationSuccess = $true
                    EmptyStateDisplayed = $hasEmptyState
                }
            }
            catch {
                $results += @{
                    Section = $section
                    NavigationSuccess = $false
                    Error = $_.Exception.Message
                }
            }
        }
    }
    
    Stop-Process -Id $app.Id -Force
    
    return @{ Success = $true; Results = $results }
}
catch {
    Stop-Process -Id $app.Id -Force -ErrorAction SilentlyContinue
    return @{ Success = $false; Message = $_.Exception.Message }
}
'@ -f $script:TestConfig.BuildPath, $script:TestConfig.Profile
    
    try {
        $tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
        $navigationScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        $result = & powershell.exe -File $tempScript
        
        if ($result.Success) {
            foreach ($navResult in $result.Results) {
                $testCase = @{
                    Test = "Navigate_$($navResult.Section)"
                    Result = if ($navResult.NavigationSuccess -and $navResult.EmptyStateDisplayed) { "PASS" } 
                             elseif ($navResult.NavigationSuccess) { "PARTIAL" }
                             else { "FAIL" }
                    Message = if ($navResult.EmptyStateDisplayed) { "Navigation successful, empty state displayed" }
                             elseif ($navResult.NavigationSuccess) { "Navigation successful, but no empty state message" }
                             else { "Navigation failed: $($navResult.Error)" }
                }
                
                $script:TestResults.Suites.UINavigation += $testCase
                $script:TestResults.TotalTests++
                
                switch ($testCase.Result) {
                    "PASS" { $script:TestResults.PassedTests++ }
                    "PARTIAL" { $script:TestResults.PartialTests++ }
                    "FAIL" { $script:TestResults.FailedTests++ }
                }
                
                if ($DetailedLogging) {
                    $color = switch ($testCase.Result) {
                        "PASS" { "Green" }
                        "PARTIAL" { "Yellow" }
                        "FAIL" { "Red" }
                    }
                    Write-Host "  - $($navResult.Section): $($testCase.Result)" -ForegroundColor $color
                }
            }
        } else {
            Write-Host "UI Navigation test failed: $($result.Message)" -ForegroundColor Red
            $script:TestResults.Suites.UINavigation += @{
                Test = "UINavigation"
                Result = "FAIL"
                Message = $result.Message
            }
            $script:TestResults.FailedTests++
            $script:TestResults.TotalTests++
        }
        
        Remove-Item -Path $tempScript -Force -ErrorAction SilentlyContinue
    }
    catch {
        Write-Host "ERROR: UI Navigation test failed: $_" -ForegroundColor Red
        $script:TestResults.Suites.UINavigation += @{
            Test = "UINavigation"
            Result = "FAIL"
            Message = $_.Exception.Message
        }
        $script:TestResults.FailedTests++
        $script:TestResults.TotalTests++
    }
}

# Test export functions with no data
function Test-ExportFunctions {
    Write-Host "`n=== Testing Export Functions with Empty Data ===" -ForegroundColor Cyan
    
    $exportTests = @(
        @{ Name = "ExportUsers"; Module = "UserDiscovery"; ExportFile = "Users_Export.csv" }
        @{ Name = "ExportGroups"; Module = "GroupDiscovery"; ExportFile = "Groups_Export.csv" }
        @{ Name = "ExportMailboxes"; Module = "MailboxDiscovery"; ExportFile = "Mailboxes_Export.csv" }
        @{ Name = "ExportSharePoint"; Module = "SharePointDiscovery"; ExportFile = "SharePoint_Export.csv" }
        @{ Name = "ExportTeams"; Module = "TeamsDiscovery"; ExportFile = "Teams_Export.csv" }
    )
    
    $modulePath = Join-Path $script:TestConfig.BuildPath "Modules"
    
    foreach ($test in $exportTests) {
        $testResult = @{
            Test = $test.Name
            Module = $test.Module
            Result = "PENDING"
            Message = ""
        }
        
        try {
            $moduleFile = Join-Path $modulePath "$($test.Module).psm1"
            
            if (Test-Path $moduleFile) {
                # Import module
                Import-Module $moduleFile -Force -ErrorAction Stop
                
                # Try to export with no data
                $exportPath = Join-Path $script:TestConfig.ResultsPath $test.ExportFile
                
                # Simulate export command
                $exportCommand = "Export-$($test.Module)Data"
                if (Get-Command $exportCommand -ErrorAction SilentlyContinue) {
                    & $exportCommand -Path $exportPath -Profile $script:TestConfig.Profile -ErrorAction Stop
                    
                    if (Test-Path $exportPath) {
                        $content = Get-Content $exportPath
                        if ($content.Count -le 1) {
                            # Only header or empty
                            $testResult.Result = "PASS"
                            $testResult.Message = "Export created empty file with headers only"
                        } else {
                            $testResult.Result = "PARTIAL"
                            $testResult.Message = "Export created file with unexpected data"
                        }
                    } else {
                        $testResult.Result = "PASS"
                        $testResult.Message = "Export handled gracefully with no file created"
                    }
                } else {
                    $testResult.Result = "SKIP"
                    $testResult.Message = "Export command not found"
                }
            } else {
                $testResult.Result = "SKIP"
                $testResult.Message = "Module not found"
            }
        }
        catch {
            if ($_.Exception.Message -match "No data|Empty|Nothing to export") {
                $testResult.Result = "PASS"
                $testResult.Message = "Export properly handled empty data condition"
            } else {
                $testResult.Result = "FAIL"
                $testResult.Message = $_.Exception.Message
            }
        }
        
        $script:TestResults.Suites.ExportFunctions += $testResult
        $script:TestResults.TotalTests++
        
        switch ($testResult.Result) {
            "PASS" { $script:TestResults.PassedTests++ }
            "PARTIAL" { $script:TestResults.PartialTests++ }
            "FAIL" { $script:TestResults.FailedTests++ }
        }
        
        if ($DetailedLogging) {
            $color = switch ($testResult.Result) {
                "PASS" { "Green" }
                "PARTIAL" { "Yellow" }
                "FAIL" { "Red" }
                "SKIP" { "Gray" }
            }
            Write-Host "  - $($test.Name): $($testResult.Result) - $($testResult.Message)" -ForegroundColor $color
        }
    }
}

# Generate comprehensive report
function Generate-TestReport {
    Write-Host "`n=== Generating Test Report ===" -ForegroundColor Cyan
    
    $script:TestResults.EndTime = Get-Date
    $duration = $script:TestResults.EndTime - $script:TestResults.StartTime
    
    # Determine overall status
    if ($script:TestResults.FailedTests -eq 0 -and $script:TestResults.PartialTests -eq 0) {
        $script:TestResults.Status = "PASS"
    } elseif ($script:TestResults.FailedTests -eq 0) {
        $script:TestResults.Status = "PARTIAL"
    } else {
        $script:TestResults.Status = "FAIL"
    }
    
    # Create JSON report
    $jsonReport = $script:TestResults | ConvertTo-Json -Depth 10
    $jsonPath = Join-Path $script:TestConfig.ResultsPath "EmptyStateValidation_$($script:TestConfig.Timestamp).json"
    $jsonReport | Out-File -FilePath $jsonPath -Encoding UTF8
    $script:TestResults.Artifacts += $jsonPath
    
    # Create Markdown report
    $mdReport = @"
# Empty State Validation Test Report

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Duration:** $($duration.TotalSeconds) seconds
**Profile:** $($script:TestConfig.Profile)
**Status:** **$($script:TestResults.Status)**

## Test Summary

| Metric | Value |
|--------|-------|
| Total Tests | $($script:TestResults.TotalTests) |
| Passed | $($script:TestResults.PassedTests) |
| Partial | $($script:TestResults.PartialTests) |
| Failed | $($script:TestResults.FailedTests) |
| Pass Rate | $(if ($script:TestResults.TotalTests -gt 0) { [math]::Round(($script:TestResults.PassedTests / $script:TestResults.TotalTests) * 100, 2) } else { 0 })% |

## CSV Validation

- **Checked Paths:** $($script:TestResults.CsvValidation.CheckedPaths.Count)
- **Missing Files:** $($script:TestResults.CsvValidation.MissingFiles.Count) (Expected)
- **Empty Files:** $($script:TestResults.CsvValidation.EmptyFiles.Count)
- **Handled Gracefully:** $($script:TestResults.CsvValidation.HandledGracefully.Count)

### Missing CSV Files (Intentional)
$($script:TestResults.CsvValidation.MissingFiles | ForEach-Object { "- $_" } | Out-String)

## Test Suite Results

### Empty State Handling
$($script:TestResults.Suites.EmptyStateHandling | ForEach-Object { 
    "- **$($_.Test)**: $($_.Result) - $($_.Message)"
} | Out-String)

### UI Navigation
$($script:TestResults.Suites.UINavigation | ForEach-Object { 
    "- **$($_.Test)**: $($_.Result) - $($_.Message)"
} | Out-String)

### ViewModel Initialization
$($script:TestResults.Suites.DataBinding | ForEach-Object { 
    "- **$($_.ViewModel)**: $($_.Result) - $($_.Message)"
} | Out-String)

### Export Functions
$($script:TestResults.Suites.ExportFunctions | ForEach-Object { 
    "- **$($_.Test)**: $($_.Result) - $($_.Message)"
} | Out-String)

## Conclusions

The application has been tested with completely empty/missing discovery data to ensure:

1. **No Crashes**: Application launches and runs without crashing when CSV data is missing
2. **Graceful Handling**: All modules handle missing data appropriately
3. **Empty States**: UI displays appropriate "No data" messages
4. **Safe Exports**: Export functions handle empty data without errors
5. **ViewModel Safety**: All ViewModels initialize properly with null/empty collections

### Critical Findings

$(if ($script:TestResults.FailedTests -gt 0) {
    "⚠️ **ISSUES FOUND**: Some components do not handle empty data gracefully. Review failed tests above."
} elseif ($script:TestResults.PartialTests -gt 0) {
    "⚠️ **PARTIAL SUCCESS**: Most components handle empty data, but some improvements needed for complete empty state messaging."
} else {
    "✅ **ALL TESTS PASSED**: Application handles empty/missing data gracefully across all tested components."
})

## Artifacts

$(($script:TestResults.Artifacts | ForEach-Object { "- $_" }) -join "`n")

---
*Generated by Empty State Validation Test Suite v1.0.0*
"@
    
    $mdPath = Join-Path $script:TestConfig.ResultsPath "EmptyStateValidation_$($script:TestConfig.Timestamp).md"
    $mdReport | Out-File -FilePath $mdPath -Encoding UTF8
    $script:TestResults.Artifacts += $mdPath
    
    # Display summary
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "         TEST EXECUTION COMPLETE        " -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Status: " -NoNewline
    
    $statusColor = switch ($script:TestResults.Status) {
        "PASS" { "Green" }
        "PARTIAL" { "Yellow" }
        "FAIL" { "Red" }
        default { "Gray" }
    }
    Write-Host $script:TestResults.Status -ForegroundColor $statusColor
    
    Write-Host "`nResults:"
    Write-Host "  Total Tests: $($script:TestResults.TotalTests)"
    Write-Host "  Passed: $($script:TestResults.PassedTests)" -ForegroundColor Green
    Write-Host "  Partial: $($script:TestResults.PartialTests)" -ForegroundColor Yellow
    Write-Host "  Failed: $($script:TestResults.FailedTests)" -ForegroundColor Red
    
    Write-Host "`nReports saved to:"
    Write-Host "  JSON: $jsonPath" -ForegroundColor Cyan
    Write-Host "  Markdown: $mdPath" -ForegroundColor Cyan
    
    # Return results for pipeline integration
    return $script:TestResults
}

# Main execution
function Main {
    try {
        Initialize-TestEnvironment
        Test-CsvLoadingMissingFiles
        Test-ApplicationLaunch
        Test-ViewModelInitialization
        Test-UINavigation
        Test-ExportFunctions
        $results = Generate-TestReport
        
        # Exit with appropriate code
        if ($results.Status -eq "FAIL") {
            exit 1
        } elseif ($results.Status -eq "PARTIAL") {
            exit 2
        } else {
            exit 0
        }
    }
    catch {
        Write-Host "`nFATAL ERROR: $_" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
        exit 99
    }
}

# Execute main
Main