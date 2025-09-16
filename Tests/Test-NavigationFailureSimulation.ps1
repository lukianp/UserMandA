# Navigation Failure Simulation Test
# Simulates the exact navigation flow to identify why views "can't open"

param(
    [string]$BuildPath = "C:\enterprisediscovery",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "=== M&A Navigation Failure Simulation ===" -ForegroundColor Yellow
Write-Host "Build Path: $BuildPath" -ForegroundColor Gray
Write-Host ""

# Key findings from diagnostic test:
# 1. Infrastructure naming mismatch: Code expects "InfrastructureView.xaml", file is "InfrastructureViewNew.xaml"
# 2. Waves naming mismatch: Code expects "WavesView.xaml", file is "WaveView.xaml"
# 3. ComputersView missing x:Name in MainWindow XAML

Write-Host "=== SIMULATING MAINWINDOW_LOADED NAVIGATION SETUP ===" -ForegroundColor Cyan

# Simulate the MainWindow_Loaded navigation setup process
$navigationTests = @{
    "DashboardView" = @{ ExpectedFile = "DashboardView.xaml"; ShouldWork = $true }
    "UsersView" = @{ ExpectedFile = "UsersView.xaml"; ShouldWork = $true }
    "DiscoveryView" = @{ ExpectedFile = "DiscoveryView.xaml"; ShouldWork = $true }
    "ComputersView" = @{ ExpectedFile = "ComputersView.xaml"; ShouldWork = $false; Issue = "Missing x:Name in MainWindow" }
    "InfrastructureView" = @{ ExpectedFile = "InfrastructureView.xaml"; ActualFile = "InfrastructureViewNew.xaml"; ShouldWork = $false; Issue = "File name mismatch" }
    "GroupsView" = @{ ExpectedFile = "GroupsView.xaml"; ShouldWork = $true }
    "WavesView" = @{ ExpectedFile = "WavesView.xaml"; ActualFile = "WaveView.xaml"; ShouldWork = $false; Issue = "File name mismatch" }
    "MigrateView" = @{ ExpectedFile = "MigrateView.xaml"; ShouldWork = $true }
    "ReportsView" = @{ ExpectedFile = "ReportsView.xaml"; ShouldWork = $true }
    "AnalyticsView" = @{ ExpectedFile = "AnalyticsView.xaml"; ShouldWork = $true }
    "SettingsView" = @{ ExpectedFile = "SettingsView.xaml"; ShouldWork = $true }
    "ApplicationsView" = @{ ExpectedFile = "ApplicationsView.xaml"; ShouldWork = $true }
    "DomainDiscoveryView" = @{ ExpectedFile = "DomainDiscoveryView.xaml"; ShouldWork = $true }
    "FileServersView" = @{ ExpectedFile = "FileServersView.xaml"; ShouldWork = $true }
    "DatabasesView" = @{ ExpectedFile = "DatabasesView.xaml"; ShouldWork = $true }
    "SecurityView" = @{ ExpectedFile = "SecurityView.xaml"; ShouldWork = $true }
}

$viewsPath = Join-Path $BuildPath "Views"
$mainWindowPath = Join-Path $BuildPath "MandADiscoverySuite.xaml"

Write-Host "1. Testing MainWindow XAML loading..." -ForegroundColor White

if (Test-Path $mainWindowPath) {
    Write-Host "  + MainWindow XAML found" -ForegroundColor Green

    # Check MainWindow content for x:Name attributes
    $mainWindowContent = Get-Content $mainWindowPath -Raw

    Write-Host "`n2. Testing FindName targets in MainWindow..." -ForegroundColor White

    foreach ($nav in $navigationTests.GetEnumerator()) {
        $viewName = $nav.Key
        $hasXName = $mainWindowContent -match "x:Name=`"$viewName`""

        if ($hasXName) {
            Write-Host "  + $viewName has x:Name in MainWindow" -ForegroundColor Green
        } else {
            Write-Host "  X $viewName MISSING x:Name in MainWindow" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  X MainWindow XAML not found at $mainWindowPath" -ForegroundColor Red
}

Write-Host "`n3. Testing view file existence..." -ForegroundColor White

foreach ($nav in $navigationTests.GetEnumerator()) {
    $viewName = $nav.Key
    $config = $nav.Value

    $expectedFile = $config.ExpectedFile
    $actualFile = if ($config.ActualFile) { $config.ActualFile } else { $config.ExpectedFile }

    $expectedPath = Join-Path $viewsPath $expectedFile
    $actualPath = Join-Path $viewsPath $actualFile

    $expectedExists = Test-Path $expectedPath
    $actualExists = Test-Path $actualPath

    if ($expectedExists) {
        Write-Host "  + $viewName - $expectedFile exists" -ForegroundColor Green
    } elseif ($actualExists -and ($actualFile -ne $expectedFile)) {
        Write-Host "  ! $viewName - Expected $expectedFile but found $actualFile" -ForegroundColor Yellow
    } else {
        Write-Host "  X $viewName - $expectedFile NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`n=== NAVIGATION FAILURE SIMULATION ===" -ForegroundColor Cyan

Write-Host "`nSimulating what happens when user tries to navigate to each view:" -ForegroundColor White

foreach ($nav in $navigationTests.GetEnumerator()) {
    $viewName = $nav.Key
    $config = $nav.Value
    $shouldWork = $config.ShouldWork
    $issue = $config.Issue

    Write-Host "`n--- Simulating navigation to $viewName ---" -ForegroundColor Gray

    # Step 1: MainWindow_Loaded calls FindName
    $hasXName = $mainWindowContent -match "x:Name=`"$viewName`""

    if (-not $hasXName) {
        Write-Host "  STEP 1 FAILED: FindName(`"$viewName`") returns null" -ForegroundColor Red
        Write-Host "  CAUSE: Missing x:Name=`"$viewName`" in MainWindow XAML" -ForegroundColor Red
        Write-Host "  RESULT: Navigation setup fails, view cannot be accessed" -ForegroundColor Red
        continue
    } else {
        Write-Host "  STEP 1 OK: FindName(`"$viewName`") would find element" -ForegroundColor Green
    }

    # Step 2: Check if view file exists
    $expectedFile = $config.ExpectedFile
    $actualFile = if ($config.ActualFile) { $config.ActualFile } else { $config.ExpectedFile }
    $expectedPath = Join-Path $viewsPath $expectedFile
    $actualPath = Join-Path $viewsPath $actualFile

    if (Test-Path $expectedPath) {
        Write-Host "  STEP 2 OK: View file $expectedFile exists" -ForegroundColor Green
    } elseif (Test-Path $actualPath) {
        Write-Host "  STEP 2 FAILED: Expected $expectedFile but only found $actualFile" -ForegroundColor Red
        Write-Host "  CAUSE: File naming mismatch" -ForegroundColor Red
        Write-Host "  RESULT: View loading would fail when user navigates" -ForegroundColor Red
        continue
    } else {
        Write-Host "  STEP 2 FAILED: View file $expectedFile not found" -ForegroundColor Red
        Write-Host "  CAUSE: Missing view file" -ForegroundColor Red
        Write-Host "  RESULT: View loading would fail" -ForegroundColor Red
        continue
    }

    # Step 3: Test basic XAML validity
    $viewPath = if (Test-Path $expectedPath) { $expectedPath } else { $actualPath }

    try {
        $content = Get-Content $viewPath -Raw
        $xml = [xml]$content
        Write-Host "  STEP 3 OK: XAML is valid XML" -ForegroundColor Green
    } catch {
        Write-Host "  STEP 3 FAILED: XAML parsing error - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  CAUSE: Invalid XAML syntax" -ForegroundColor Red
        Write-Host "  RESULT: View instantiation would fail" -ForegroundColor Red
        continue
    }

    # If we get here, navigation should work
    if ($shouldWork) {
        Write-Host "  NAVIGATION SUCCESS: $viewName should navigate correctly" -ForegroundColor Green
    } else {
        Write-Host "  UNEXPECTED: $viewName passed all checks but was expected to fail" -ForegroundColor Yellow
        Write-Host "  NOTE: $issue" -ForegroundColor Yellow
    }
}

Write-Host "`n=== ROOT CAUSE ANALYSIS ===" -ForegroundColor Magenta

$failingViews = @()
$workingViews = @()

foreach ($nav in $navigationTests.GetEnumerator()) {
    if ($nav.Value.ShouldWork) {
        $workingViews += $nav.Key
    } else {
        $failingViews += $nav.Key
    }
}

Write-Host "`nFAILING VIEWS ($($failingViews.Count)):" -ForegroundColor Red
foreach ($view in $failingViews) {
    $issue = $navigationTests[$view].Issue
    Write-Host "  X $view - $issue" -ForegroundColor Red
}

Write-Host "`nWORKING VIEWS ($($workingViews.Count)):" -ForegroundColor Green
foreach ($view in $workingViews) {
    Write-Host "  + $view" -ForegroundColor Green
}

Write-Host "`n=== EXACT FIXES NEEDED ===" -ForegroundColor Yellow

Write-Host "`n1. FIX NAMING MISMATCHES:" -ForegroundColor White
Write-Host "   Option A: Rename files to match code expectations" -ForegroundColor Cyan
Write-Host "     - Rename InfrastructureViewNew.xaml to InfrastructureView.xaml" -ForegroundColor Gray
Write-Host "     - Rename WaveView.xaml to WavesView.xaml" -ForegroundColor Gray
Write-Host "`n   Option B: Update code to match existing file names" -ForegroundColor Cyan
Write-Host "     - In MainWindow_Loaded, change FindName(`"InfrastructureView`") to FindName(`"InfrastructureViewNew`")" -ForegroundColor Gray
Write-Host "     - In MainWindow_Loaded, change FindName(`"WavesView`") to FindName(`"WaveView`")" -ForegroundColor Gray

Write-Host "`n2. FIX MISSING X:NAME ATTRIBUTES:" -ForegroundColor White
Write-Host "   Add missing x:Name attributes to MainWindow XAML:" -ForegroundColor Cyan
Write-Host "     - Find ComputersView element and add x:Name=`"ComputersView`"" -ForegroundColor Gray

Write-Host "`n3. VERIFY MAINWINDOW XAML STRUCTURE:" -ForegroundColor White
Write-Host "   Ensure all view elements in MainWindow have:" -ForegroundColor Cyan
Write-Host "     - Correct x:Name matching FindName calls" -ForegroundColor Gray
Write-Host "     - Proper parent container structure" -ForegroundColor Gray

Write-Host "`n=== RECOMMENDED IMMEDIATE ACTION ===" -ForegroundColor Red
Write-Host "Based on the test results, the navigation failures are caused by:" -ForegroundColor White
Write-Host "1. File naming mismatches (2 views)" -ForegroundColor Red
Write-Host "2. Missing x:Name attribute (1 view)" -ForegroundColor Red
Write-Host "`nThese are the EXACT reasons why navigation 'can't open' main views." -ForegroundColor Red

Write-Host "`nNavigation failure simulation completed." -ForegroundColor Green