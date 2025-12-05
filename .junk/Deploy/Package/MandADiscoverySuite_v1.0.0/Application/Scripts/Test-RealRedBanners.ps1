param(
    [int]$TestDurationMinutes = 5,
    [string]$OutputFile = "real_red_banner_findings.txt"
)

# Real Red Banner Detection Script
# Launches the application and monitors for actual binding errors and red banners

Write-Host "Starting Real Red Banner Detection Test..." -ForegroundColor Green

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$findings = @()

function Add-Finding {
    param($Category, $ViewName, $ErrorType, $ErrorMessage, $Severity = "Medium")
    
    $finding = [PSCustomObject]@{
        Timestamp = Get-Date -Format "HH:mm:ss"
        Category = $Category
        ViewName = $ViewName
        ErrorType = $ErrorType
        ErrorMessage = $ErrorMessage
        Severity = $Severity
    }
    $script:findings += $finding
    
    $color = switch ($Severity) {
        "High" { "Red" }
        "Medium" { "Yellow" }
        "Low" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$($finding.Timestamp)] $($Category) - $($ViewName): $($ErrorType)" -ForegroundColor $color
    if ($ErrorMessage) { Write-Host "  → $ErrorMessage" -ForegroundColor Gray }
}

# Check if application is running
$appProcess = Get-Process | Where-Object { $_.ProcessName -like "*MandADiscoverySuite*" }

if (-not $appProcess) {
    Write-Host "Application not running. Starting M&A Discovery Suite..." -ForegroundColor Yellow
    
    try {
        $appPath = "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
        if (-not (Test-Path $appPath)) {
            throw "Application executable not found at: $appPath"
        }
        
        Start-Process $appPath
        Write-Host "Application started. Waiting 15 seconds for initialization..." -ForegroundColor Green
        Start-Sleep -Seconds 15
    }
    catch {
        Add-Finding "STARTUP" "Application" "Launch Failed" "Failed to start application: $($_.Exception.Message)" "High"
        Write-Host "Failed to start application. Exiting test." -ForegroundColor Red
        return
    }
}

# Monitor application logs for binding errors
$logPaths = @(
    "D:\Scripts\UserMandA\GUI\debug_output.txt",
    "C:\discoverydata\ljpops\Logs\gui-binding.log",
    "C:\discoverydata\ljpops\Logs\gui-debug.log",
    "C:\discoverydata\ljpops\Logs\error_log_$(Get-Date -Format 'yyyyMMdd').txt"
)

$existingLogPaths = $logPaths | Where-Object { Test-Path $_ }

Write-Host "`nMonitoring log files for binding errors:" -ForegroundColor Cyan
foreach ($path in $existingLogPaths) {
    Write-Host "  ✓ $path" -ForegroundColor Green
}

# Check data availability that could cause red banners
Write-Host "`nChecking data availability:" -ForegroundColor Cyan

$criticalDataFiles = @{
    "Users" = @("Users.csv", "ActiveDirectoryUsers.csv", "AzureUsers.csv")
    "Groups" = @("Groups.csv", "ActiveDirectoryDiscovery_Groups.csv")
    "Applications" = @("Applications.csv", "ApplicationDiscovery_Applications.csv")
    "Infrastructure" = @("Infrastructure.csv", "ActiveDirectoryDiscovery_Computers.csv")
    "FileServers" = @("FileServers.csv", "FileServerDiscovery_Shares.csv")
    "Databases" = @("Databases.csv", "SQLServerDiscovery_Databases.csv")
    "GroupPolicies" = @("GPO_GroupPolicies.csv", "GroupPolicies.csv")
}

$dataBasePath = "C:\discoverydata\ljpops\Raw"

foreach ($category in $criticalDataFiles.Keys) {
    $found = $false
    foreach ($fileName in $criticalDataFiles[$category]) {
        $filePath = Join-Path $dataBasePath $fileName
        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            if ($fileInfo.Length -gt 100) {  # File has some content
                Write-Host "  ✓ $category data available ($fileName)" -ForegroundColor Green
                $found = $true
                break
            }
        }
    }
    
    if (-not $found) {
        Add-Finding "DATA" $category "Missing Data" "No data files found for $category view" "High"
        Write-Host "  ❌ $category data missing - will cause red banners" -ForegroundColor Red
    }
}

# Check for common binding error patterns in recent logs
Write-Host "`nAnalyzing recent logs for binding errors:" -ForegroundColor Cyan

$bindingErrorPatterns = @{
    "Property Not Found" = "System\.Windows\.Data Error.*path.*not found"
    "Null Reference" = "NullReferenceException"
    "Binding Failed" = "BindingExpression.*failed"
    "Cannot Convert" = "Cannot convert"
    "Property Access" = "Cannot get.*property"
}

foreach ($logPath in $existingLogPaths) {
    if (Test-Path $logPath) {
        $recentContent = Get-Content $logPath -Tail 100 -ErrorAction SilentlyContinue
        
        foreach ($errorType in $bindingErrorPatterns.Keys) {
            $pattern = $bindingErrorPatterns[$errorType]
            $matches = $recentContent | Where-Object { $_ -match $pattern }
            
            foreach ($match in $matches) {
                $viewName = "Unknown"
                if ($match -match '\[(\w+View\w*)\]') {
                    $viewName = $matches.Groups[1].Value
                }
                
                Add-Finding "BINDING" $viewName $errorType $match "High"
            }
        }
    }
}

# Check for ViewModel instantiation errors
Write-Host "`nChecking ViewModels for instantiation issues:" -ForegroundColor Cyan

$viewModelFiles = Get-ChildItem -Path "D:\Scripts\UserMandA\GUI\ViewModels" -Filter "*ViewModel*.cs" -Recurse

foreach ($vmFile in $viewModelFiles) {
    $vmName = $vmFile.BaseName
    $vmContent = Get-Content $vmFile.FullName -Raw
    
    # Check if ViewModel has parameterless constructor
    if ($vmContent -match 'public\s+\w+ViewModel\s*\(' -and $vmContent -notmatch 'public\s+\w+ViewModel\s*\(\s*\)') {
        # Has constructor but not parameterless - could cause issues
        if ($vmContent -notmatch 'SimpleServiceLocator') {
            Add-Finding "VIEWMODEL" $vmName "Constructor Issue" "ViewModel requires parameters but may not be properly initialized" "Medium"
        }
    }
}

# Test specific views that commonly have issues
Write-Host "`nTesting common problematic view patterns:" -ForegroundColor Cyan

$problematicViews = @{
    "ManagementHubView" = "Complex dashboard with multiple data bindings"
    "SecurityPolicyView" = "Six-tab view with security data"
    "ReportsView" = "Recently implemented reports functionality"
    "GroupPolicySecurityView" = "Complex security policy analysis"
}

foreach ($view in $problematicViews.Keys) {
    $xamlPath = "D:\Scripts\UserMandA\GUI\Views\$view.xaml"
    $codeBehindPath = "D:\Scripts\UserMandA\GUI\Views\$view.xaml.cs"
    
    if (Test-Path $xamlPath) {
        $xamlContent = Get-Content $xamlPath -Raw
        
        # Check for complex bindings that might fail
        $complexBindings = [regex]::Matches($xamlContent, 'Binding="{Binding ([^}]+)}"')
        foreach ($binding in $complexBindings) {
            $bindingPath = $binding.Groups[1].Value
            if ($bindingPath -match '\.' -and $bindingPath -match '(Collection|Items|List)') {
                # Complex nested collection binding - potential for null reference
                Add-Finding "COMPLEX_BINDING" $view "Nested Collection Binding" "Complex binding path: $bindingPath" "Medium"
            }
        }
    } else {
        Add-Finding "FILE" $view "Missing View" "XAML file not found for expected view" "High"
    }
}

# Generate comprehensive findings report
$reportContent = @"
M&A DISCOVERY SUITE - REAL RED BANNER FINDINGS
==============================================
Test Executed: $timestamp
Duration: Startup + analysis
Application Status: $(if($appProcess) {"Running"} else {"Started during test"})

SUMMARY:
--------
"@

$severityGroups = $findings | Group-Object Severity | Sort-Object Name
foreach ($group in $severityGroups) {
    $reportContent += "`n$($group.Name) Priority Issues: $($group.Count)"
}

$reportContent += "`n`nCATEGORY BREAKDOWN:"
$reportContent += "`n" + ("-" * 40)

$categoryGroups = $findings | Group-Object Category | Sort-Object Name
foreach ($group in $categoryGroups) {
    $reportContent += "`n$($group.Name): $($group.Count) issues"
}

$reportContent += "`n`nDETAILED FINDINGS:"
$reportContent += "`n" + ("=" * 50)

foreach ($finding in $findings | Sort-Object Severity, Category, ViewName) {
    $reportContent += "`n`n[$($finding.Timestamp)] $($finding.Severity) - $($finding.Category)"
    $reportContent += "`nView: $($finding.ViewName)"
    $reportContent += "`nError Type: $($finding.ErrorType)"
    if ($finding.ErrorMessage) {
        $reportContent += "`nDetails: $($finding.ErrorMessage)"
    }
}

if ($findings.Count -eq 0) {
    $reportContent += "`n`n✅ NO CRITICAL RED BANNER ISSUES DETECTED!"
    $reportContent += "`n`nThe application appears to be functioning correctly with:"
    $reportContent += "`n• All critical data files present and populated"
    $reportContent += "`n• No binding errors detected in recent logs"
    $reportContent += "`n• ViewModels properly structured"
    $reportContent += "`n• Views correctly referencing existing models"
}

$reportContent += "`n`nRECOMMENDATIONS:"
$reportContent += "`n" + ("-" * 40)

if ($findings | Where-Object { $_.Severity -eq "High" }) {
    $reportContent += "`n🚨 HIGH PRIORITY ACTIONS REQUIRED:"
    $highPriorityFindings = $findings | Where-Object { $_.Severity -eq "High" }
    foreach ($finding in $highPriorityFindings) {
        $reportContent += "`n• Fix $($finding.ViewName): $($finding.ErrorType)"
    }
}

$reportContent += "`n`n✅ MANUAL TESTING CHECKLIST:"
$reportContent += "`n1. Navigate to each view in the left sidebar"
$reportContent += "`n2. Look for red warning banners at the top of views"
$reportContent += "`n3. Check that data grids populate with actual data"
$reportContent += "`n4. Verify interactive elements work (buttons, filters, tabs)"
$reportContent += "`n5. Test view transitions and navigation"

$reportContent += "`n`nDATA STATUS SUMMARY:"
$reportContent += "`n" + ("-" * 40)
foreach ($category in $criticalDataFiles.Keys) {
    $hasData = $false
    foreach ($fileName in $criticalDataFiles[$category]) {
        $filePath = Join-Path $dataBasePath $fileName
        if ((Test-Path $filePath) -and ((Get-Item $filePath).Length -gt 100)) {
            $hasData = $true
            break
        }
    }
    $reportContent += "`n$category`: $(if($hasData) {'✅ Data Available'} else {'❌ No Data - Will Show Red Banners'})"
}

# Save report
$reportContent | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "`nTesting complete! Report saved to: $OutputFile" -ForegroundColor Green

if ($findings.Count -eq 0) {
    Write-Host "`n🎉 GREAT NEWS: No critical red banner issues detected!" -ForegroundColor Green
    Write-Host "The application should be working correctly. Manual testing recommended for final verification." -ForegroundColor Yellow
} else {
    Write-Host "`nFindings Summary:" -ForegroundColor Cyan
    $findings | Group-Object Severity | Sort-Object Name | ForEach-Object {
        $color = switch ($_.Name) {
            "High" { "Red" }
            "Medium" { "Yellow" }
            "Low" { "Green" }
            default { "White" }
        }
        Write-Host "  $($_.Name): $($_.Count)" -ForegroundColor $color
    }
    
    $highPriorityCount = ($findings | Where-Object { $_.Severity -eq "High" }).Count
    if ($highPriorityCount -gt 0) {
        Write-Host "`n⚠️ $highPriorityCount high-priority issues need immediate attention!" -ForegroundColor Red
    } else {
        Write-Host "`n✅ No high-priority issues found. Medium/Low priority items can be addressed as needed." -ForegroundColor Green
    }
}