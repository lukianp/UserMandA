param([string]$OutputFile = "quick_red_banner_findings.txt")

Write-Host "M&A Discovery Suite - Quick Red Banner Test" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$findings = @()
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Check if application is running
$appProcess = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue

if (-not $appProcess) {
    Write-Host "`nApplication not running. Starting..." -ForegroundColor Yellow
    try {
        Start-Process "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
        Start-Sleep -Seconds 10
        Write-Host "Application started successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to start application: $($_.Exception.Message)" -ForegroundColor Red
        $findings += "CRITICAL: Application failed to start - $($_.Exception.Message)"
    }
} else {
    Write-Host "`nApplication is already running." -ForegroundColor Green
}

# Check critical data availability
Write-Host "`nChecking Data Availability:" -ForegroundColor Cyan

$dataPath = "C:\discoverydata\ljpops\Raw"
$criticalFiles = @(
    "Users.csv",
    "Groups.csv", 
    "Applications.csv",
    "Infrastructure.csv",
    "FileServers.csv",
    "Databases.csv",
    "GPO_GroupPolicies.csv",
    "Reports.csv"
)

foreach ($file in $criticalFiles) {
    $filePath = Join-Path $dataPath $file
    if (Test-Path $filePath) {
        $fileInfo = Get-Item $filePath
        if ($fileInfo.Length -gt 50) {
            Write-Host "  ✅ $file - $([math]::Round($fileInfo.Length/1KB, 1))KB" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $file - File exists but appears empty" -ForegroundColor Yellow
            $findings += "WARNING: $file exists but appears empty - may cause red banners"
        }
    } else {
        Write-Host "  ❌ $file - Missing" -ForegroundColor Red
        $findings += "ERROR: Missing critical data file: $file - will cause red banners"
    }
}

# Check for recent log errors
Write-Host "`nChecking Recent Logs for Errors:" -ForegroundColor Cyan

$logPaths = @(
    "C:\discoverydata\ljpops\Logs\error_log_$(Get-Date -Format 'yyyyMMdd').txt",
    "C:\discoverydata\ljpops\Logs\gui-binding.log",
    "D:\Scripts\UserMandA\GUI\debug_output.txt"
)

foreach ($logPath in $logPaths) {
    if (Test-Path $logPath) {
        Write-Host "  ✅ Found log: $(Split-Path $logPath -Leaf)" -ForegroundColor Green
        
        # Check recent entries for binding errors
        $recentLines = Get-Content $logPath -Tail 20 -ErrorAction SilentlyContinue
        $errorLines = $recentLines | Where-Object { $_ -match "(error|exception|failed|binding)" -and $_ -notmatch "(?i)(info|debug)" }
        
        if ($errorLines) {
            Write-Host "    ⚠️  Found potential errors in recent entries" -ForegroundColor Yellow
            foreach ($errorLine in $errorLines) {
                $findings += "LOG ERROR in $(Split-Path $logPath -Leaf): $errorLine"
            }
        }
    } else {
        Write-Host "  ℹ️  Log not found: $(Split-Path $logPath -Leaf)" -ForegroundColor Gray
    }
}

# Check ViewModels for common issues
Write-Host "`nChecking ViewModels:" -ForegroundColor Cyan

$viewModelPath = "D:\Scripts\UserMandA\GUI\ViewModels"
$newViewModels = @(
    "UsersViewModelNew.cs",
    "ApplicationsViewModelNew.cs",
    "GroupsViewModelNew.cs",
    "DatabasesViewModelNew.cs",
    "FileServersViewModelNew.cs",
    "SecurityPolicyViewModel.cs",
    "ReportsViewModel.cs"
)

foreach ($vmFile in $newViewModels) {
    $vmPath = Join-Path $viewModelPath $vmFile
    if (Test-Path $vmPath) {
        Write-Host "  ✅ $($vmFile -replace '\.cs$', '')" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $($vmFile -replace '\.cs$', '')" -ForegroundColor Red
        $findings += "ERROR: Missing ViewModel: $vmFile - will cause red banners"
    }
}

# Test key model properties
Write-Host "`nChecking Model Properties:" -ForegroundColor Cyan

$modelsToCheck = @{
    "UserData.cs" = @("DisplayName", "UserPrincipalName", "Mail", "Department", "JobTitle", "AccountEnabled")
    "ApplicationData.cs" = @("Name", "Version", "Publisher", "Type", "UserCount", "LastSeen")
    "GroupData.cs" = @("DisplayName", "Description", "GroupType", "MemberCount")
}

foreach ($modelFile in $modelsToCheck.Keys) {
    $modelPath = Join-Path "D:\Scripts\UserMandA\GUI\Models" $modelFile
    if (Test-Path $modelPath) {
        $modelContent = Get-Content $modelPath -Raw
        $requiredProperties = $modelsToCheck[$modelFile]
        $missingProperties = @()
        
        foreach ($property in $requiredProperties) {
            if ($modelContent -notmatch $property) {
                $missingProperties += $property
            }
        }
        
        if ($missingProperties.Count -eq 0) {
            Write-Host "  ✅ $($modelFile -replace '\.cs$', '') - All properties found" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $($modelFile -replace '\.cs$', '') - Missing: $($missingProperties -join ', ')" -ForegroundColor Yellow
            $findings += "WARNING: Model $modelFile missing properties: $($missingProperties -join ', ') - may cause binding errors"
        }
    } else {
        Write-Host "  ❌ $($modelFile -replace '\.cs$', '') - File not found" -ForegroundColor Red
        $findings += "ERROR: Missing model file: $modelFile - will cause binding errors"
    }
}

# Generate summary report
$reportContent = @"
M&A DISCOVERY SUITE - QUICK RED BANNER FINDINGS
===============================================
Test Date: $timestamp

SUMMARY:
--------
Total Issues Found: $($findings.Count)

DETAILED FINDINGS:
------------------
"@

if ($findings.Count -eq 0) {
    $reportContent += "`n✅ NO CRITICAL ISSUES DETECTED!`n"
    $reportContent += "The application should be functioning correctly without red banners.`n"
    $reportContent += "`nAll checks passed:`n"
    $reportContent += "• Critical data files are present and populated`n"
    $reportContent += "• Required ViewModels exist`n"
    $reportContent += "• Model properties match XAML bindings`n"
    $reportContent += "• No critical errors in recent logs`n"
} else {
    for ($i = 0; $i -lt $findings.Count; $i++) {
        $reportContent += "`n$($i + 1). $($findings[$i])"
    }
}

$reportContent += "`n`nNEXT STEPS:"
$reportContent += "`n-----------"
if ($findings.Count -eq 0) {
    $reportContent += "`n1. Launch the application and verify views load correctly"
    $reportContent += "`n2. Navigate through each menu item systematically"
    $reportContent += "`n3. Look for any red warning banners at the top of views"
    $reportContent += "`n4. Test interactive features (filtering, searching, etc.)"
} else {
    $reportContent += "`n1. Address the issues found above"
    $reportContent += "`n2. Re-run this test to verify fixes"
    $reportContent += "`n3. Perform manual testing of affected views"
}

$reportContent += "`n`nMANUAL TESTING CHECKLIST:"
$reportContent += "`n-------------------------"
$reportContent += "`n□ Dashboard - Check summary metrics display correctly"
$reportContent += "`n□ Users View - Verify user data loads and displays"
$reportContent += "`n□ Groups View - Check group information populates"
$reportContent += "`n□ Applications View - Verify application data loads"
$reportContent += "`n□ Infrastructure View - Check computer/server data"
$reportContent += "`n□ File Servers View - Verify file server information"
$reportContent += "`n□ Databases View - Check database discovery data"
$reportContent += "`n□ Reports View - Test new reports functionality"
$reportContent += "`n□ Security Policy View - Verify all 6 tabs work"
$reportContent += "`n□ Management View - Check project management features"

# Save report
$reportContent | Out-File -FilePath $OutputFile -Encoding UTF8

# Display results
Write-Host "`nTest Complete!" -ForegroundColor Green
Write-Host "Report saved to: $OutputFile" -ForegroundColor Cyan

if ($findings.Count -eq 0) {
    Write-Host "`n🎉 EXCELLENT NEWS: No critical red banner issues detected!" -ForegroundColor Green
    Write-Host "The application should be working correctly. Proceed with manual verification." -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Found $($findings.Count) potential issues:" -ForegroundColor Yellow
    $criticalCount = ($findings | Where-Object { $_ -match "^ERROR:" }).Count
    $warningCount = ($findings | Where-Object { $_ -match "^WARNING:" }).Count
    
    if ($criticalCount -gt 0) {
        Write-Host "  🚨 $criticalCount critical errors (will cause red banners)" -ForegroundColor Red
    }
    if ($warningCount -gt 0) {
        Write-Host "  ⚠️  $warningCount warnings (potential issues)" -ForegroundColor Yellow
    }
    
    Write-Host "`nReview the report and address critical errors first." -ForegroundColor Yellow
}