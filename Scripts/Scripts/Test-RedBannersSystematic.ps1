param(
    [string]$OutputFile = "red_banner_test_results.txt"
)

# Comprehensive UI Testing Script for M&A Discovery Suite
# Tests all views systematically for red banners and errors

Write-Host "Starting comprehensive UI testing for M&A Discovery Suite..." -ForegroundColor Green

$results = @()
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Add-TestResult {
    param($ViewName, $Status, $ErrorMessage = "", $MissingColumns = @())
    
    $result = [PSCustomObject]@{
        Timestamp = $timestamp
        ViewName = $ViewName
        Status = $Status
        ErrorMessage = $ErrorMessage
        MissingColumns = $MissingColumns -join ", "
        TestTime = Get-Date -Format "HH:mm:ss"
    }
    $script:results += $result
    
    $statusColor = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARNING" { "Yellow" }
        default { "White" }
    }
    
    Write-Host "[$($result.TestTime)] $ViewName - $Status" -ForegroundColor $statusColor
    if ($ErrorMessage) { Write-Host "  Error: $ErrorMessage" -ForegroundColor Red }
    if ($MissingColumns.Count -gt 0) { Write-Host "  Missing Columns: $($MissingColumns -join ', ')" -ForegroundColor Yellow }
}

# Start the application if not running
$appProcess = Get-Process | Where-Object { $_.ProcessName -like "*MandADiscoverySuite*" }
if (-not $appProcess) {
    Write-Host "Starting M&A Discovery Suite..." -ForegroundColor Yellow
    Start-Process "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
    Start-Sleep -Seconds 10
}

# Test Views (These would normally be automated UI tests, but for now we document expected tests)
Write-Host "`nTesting Views for Red Banners:" -ForegroundColor Cyan

# Dashboard Views
Add-TestResult "Dashboard" "PENDING" "Manual testing required - check for red banners on startup"
Add-TestResult "Discovery Dashboard" "PENDING" "Manual testing required - verify module tiles load correctly"

# User Views  
Add-TestResult "Users View (Old)" "PENDING" "Manual testing required - check data loading and missing columns"
Add-TestResult "Users View (New)" "PENDING" "Manual testing required - verify ObservableCollection binding"

# Group Views
Add-TestResult "Groups View (Old)" "PENDING" "Manual testing required - check for binding errors"
Add-TestResult "Groups View (New)" "PENDING" "Manual testing required - verify enhanced functionality"

# Application Views
Add-TestResult "Applications View (Old)" "PENDING" "Manual testing required - check CSV loading"
Add-TestResult "Applications View (New)" "PENDING" "Manual testing required - verify filter functionality"

# Infrastructure Views
Add-TestResult "Infrastructure/Computers" "PENDING" "Manual testing required - check for missing column errors"
Add-TestResult "File Servers View" "PENDING" "Manual testing required - verify data grid population"
Add-TestResult "Databases View" "PENDING" "Manual testing required - check SQL Server data loading"

# Management Views
Add-TestResult "Management Hub" "PENDING" "Manual testing required - verify navigation and overview"
Add-TestResult "Project Management" "PENDING" "Manual testing required - check Gantt chart implementation"
Add-TestResult "Wave Management" "PENDING" "Manual testing required - verify wave generation features"

# New Views to Test
Add-TestResult "Reports View" "PENDING" "Manual testing required - verify newly implemented reports functionality"
Add-TestResult "Security Policy View" "PENDING" "Manual testing required - check all 6 tabs implementation"

# Analytics and Other Views
Add-TestResult "Analytics View" "PENDING" "Manual testing required - check dashboard widgets and charts"
Add-TestResult "Settings View" "PENDING" "Manual testing required - verify configuration options"

# Generate Test Report
$reportContent = @"
M&A DISCOVERY SUITE - RED BANNER TEST RESULTS
==============================================
Generated: $timestamp
Application: M&A Discovery Suite v1.0

TESTING METHODOLOGY:
-------------------
1. Systematic navigation through all menu items
2. Documentation of red banners and error messages
3. Identification of missing columns or data loading issues
4. Verification of new feature implementations

VIEWS TESTED:
------------
"@

foreach ($result in $results) {
    $reportContent += "`n[$($result.TestTime)] $($result.ViewName)"
    $reportContent += "`n  Status: $($result.Status)"
    if ($result.ErrorMessage) { $reportContent += "`n  Error: $($result.ErrorMessage)" }
    if ($result.MissingColumns) { $reportContent += "`n  Missing Columns: $($result.MissingColumns)" }
    $reportContent += "`n"
}

$reportContent += @"

MANUAL TESTING CHECKLIST:
-------------------------
□ Navigate to each view using left-hand menu
□ Document any red error banners that appear
□ Note specific error messages and missing columns
□ Check data loading status (empty vs populated)
□ Test interactive features (buttons, tabs, filters)
□ Verify new implementations (Reports, Security Policy)
□ Test both old and new view versions where applicable

EXPECTED RED BANNER CATEGORIES:
------------------------------
1. Missing CSV columns in DataGrid bindings
2. File not found errors for missing data files
3. Null reference exceptions in ViewModels
4. Binding errors in XAML views
5. Service initialization failures
6. ObservableCollection update issues

NEXT STEPS:
-----------
1. Launch the application
2. Systematically click through each menu item
3. Document findings in this report
4. Create fixes for identified issues
5. Re-test to verify fixes

"@

# Save the report
$reportContent | Out-File -FilePath $OutputFile -Encoding UTF8
Write-Host "`nTest framework created. Report saved to: $OutputFile" -ForegroundColor Green
Write-Host "Next: Manually test each view and update the report with findings." -ForegroundColor Yellow

# Display summary
Write-Host "`nTEST SUMMARY:" -ForegroundColor Cyan
Write-Host "Total Views to Test: $($results.Count)" -ForegroundColor White
Write-Host "Status Distribution:" -ForegroundColor White
$results | Group-Object Status | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count)" -ForegroundColor Gray
}