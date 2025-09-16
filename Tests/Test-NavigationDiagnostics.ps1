# Navigation Diagnostic Test Script
# Tests the view loading and navigation system to identify exact failure causes

param(
    [string]$BuildPath = "C:\enterprisediscovery",
    [string]$WorkspacePath = "D:\Scripts\UserMandA\GUI",
    [switch]$Verbose,
    [switch]$GenerateReport
)

$ErrorActionPreference = "Continue"
$results = @{
    ViewDeployment = @{}
    XamlValidation = @{}
    NavigationNaming = @{}
    ResourcesCheck = @{}
    Summary = @{}
}

Write-Host "=== M&A Navigation Diagnostic Tests ===" -ForegroundColor Yellow
Write-Host "Build Path: $BuildPath" -ForegroundColor Gray
Write-Host "Workspace Path: $WorkspacePath" -ForegroundColor Gray
Write-Host ""

# Test 1: Views Directory Deployment
Write-Host "1. Testing Views Directory Deployment..." -ForegroundColor Cyan

$buildViewsPath = Join-Path $BuildPath "Views"
$workspaceViewsPath = Join-Path $WorkspacePath "Views"

$results.ViewDeployment.BuildExists = Test-Path $buildViewsPath
$results.ViewDeployment.WorkspaceExists = Test-Path $workspaceViewsPath

if ($results.ViewDeployment.BuildExists) {
    $buildXamlFiles = Get-ChildItem $buildViewsPath -Filter "*.xaml" | Measure-Object
    $results.ViewDeployment.BuildXamlCount = $buildXamlFiles.Count
    Write-Host "  + Build Views directory exists: $($buildXamlFiles.Count) XAML files" -ForegroundColor Green
} else {
    Write-Host "  X CRITICAL: Build Views directory missing at $buildViewsPath" -ForegroundColor Red
    $results.ViewDeployment.BuildXamlCount = 0
}

if ($results.ViewDeployment.WorkspaceExists) {
    $workspaceXamlFiles = Get-ChildItem $workspaceViewsPath -Filter "*.xaml" | Measure-Object
    $results.ViewDeployment.WorkspaceXamlCount = $workspaceXamlFiles.Count
    Write-Host "  + Workspace Views directory exists: $($workspaceXamlFiles.Count) XAML files" -ForegroundColor Green
} else {
    Write-Host "  X Workspace Views directory missing at $workspaceViewsPath" -ForegroundColor Red
    $results.ViewDeployment.WorkspaceXamlCount = 0
}

# Test 2: Main View Files Present
Write-Host "`n2. Testing Main View Files..." -ForegroundColor Cyan

$mainViews = @(
    "DashboardView.xaml",
    "UsersView.xaml",
    "DiscoveryView.xaml",
    "ComputersView.xaml",
    "InfrastructureViewNew.xaml",  # Note: MainWindow looks for "InfrastructureView"
    "GroupsView.xaml",
    "WaveView.xaml",              # Note: MainWindow looks for "WavesView"
    "MigrateView.xaml",
    "ReportsView.xaml",
    "AnalyticsView.xaml",
    "SettingsView.xaml",
    "ApplicationsView.xaml",
    "DomainDiscoveryView.xaml",
    "FileServersView.xaml",
    "DatabasesView.xaml",
    "SecurityView.xaml"
)

$results.XamlValidation.MainViews = @{}

foreach ($view in $mainViews) {
    $buildFilePath = Join-Path $buildViewsPath $view
    $exists = Test-Path $buildFilePath
    $results.XamlValidation.MainViews[$view] = @{
        Exists = $exists
        Path = $buildFilePath
    }

    if ($exists) {
        Write-Host "    + $view" -ForegroundColor Green
    } else {
        Write-Host "    X $view MISSING" -ForegroundColor Red
    }
}

# Test 3: Navigation Naming Mismatch Analysis
Write-Host "`n3. Analyzing Navigation Naming Mismatches..." -ForegroundColor Cyan

$namingMismatches = @{
    "InfrastructureView" = "InfrastructureViewNew.xaml"  # Code expects InfrastructureView.xaml
    "WavesView" = "WaveView.xaml"                       # Code expects WavesView.xaml
}

$results.NavigationNaming.Mismatches = @{}

foreach ($mismatch in $namingMismatches.GetEnumerator()) {
    $expectedByCode = $mismatch.Key + ".xaml"
    $actualFile = $mismatch.Value
    $actualPath = Join-Path $buildViewsPath $actualFile
    $expectedPath = Join-Path $buildViewsPath $expectedByCode

    $actualExists = Test-Path $actualPath
    $expectedExists = Test-Path $expectedPath

    $results.NavigationNaming.Mismatches[$mismatch.Key] = @{
        ExpectedFile = $expectedByCode
        ActualFile = $actualFile
        ExpectedExists = $expectedExists
        ActualExists = $actualExists
    }

    if ($actualExists -and -not $expectedExists) {
        Write-Host "    ! MISMATCH: Code expects '$expectedByCode' but file is '$actualFile'" -ForegroundColor Yellow
    } elseif (-not $actualExists -and -not $expectedExists) {
        Write-Host "    X MISSING: Neither '$expectedByCode' nor '$actualFile' found" -ForegroundColor Red
    } else {
        Write-Host "    + $($mismatch.Key) - Files match expectations" -ForegroundColor Green
    }
}

# Test 4: XAML Basic Validation
Write-Host "`n4. Validating XAML Files..." -ForegroundColor Cyan

$xmlValidationResults = @{}

foreach ($view in $mainViews) {
    $filePath = Join-Path $buildViewsPath $view

    if (Test-Path $filePath) {
        try {
            $content = Get-Content $filePath -Raw

            if ([string]::IsNullOrWhiteSpace($content)) {
                $xmlValidationResults[$view] = @{ Valid = $false; Error = "Empty file" }
                Write-Host "    X $view - Empty file" -ForegroundColor Red
            } elseif (-not $content.TrimStart().StartsWith("<")) {
                $xmlValidationResults[$view] = @{ Valid = $false; Error = "Invalid XML format" }
                Write-Host "    X $view - Invalid XML format" -ForegroundColor Red
            } else {
                # Basic XML parsing test
                try {
                    $xml = [xml]$content
                    $xmlValidationResults[$view] = @{ Valid = $true; Error = $null }
                    Write-Host "    + $view - Valid XML" -ForegroundColor Green
                } catch {
                    $xmlValidationResults[$view] = @{ Valid = $false; Error = $_.Exception.Message }
                    Write-Host "    X $view - XML parse error: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        } catch {
            $xmlValidationResults[$view] = @{ Valid = $false; Error = $_.Exception.Message }
            Write-Host "    X $view - Read error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        $xmlValidationResults[$view] = @{ Valid = $false; Error = "File not found" }
    }
}

$results.XamlValidation.Results = $xmlValidationResults

# Test 5: Check MainWindow XAML for FindName targets
Write-Host "`n5. Analyzing MainWindow FindName Targets..." -ForegroundColor Cyan

$mainWindowXamlPath = Join-Path $WorkspacePath "MandADiscoverySuite.xaml"
$mainWindowBuildPath = Join-Path $BuildPath "MandADiscoverySuite.xaml"

$findNameTargets = @(
    "DashboardView",
    "UsersView",
    "DiscoveryView",
    "ComputersView",
    "InfrastructureView",  # This is what the code looks for
    "GroupsView",
    "WavesView",          # This is what the code looks for
    "MigrateView",
    "ReportsView",
    "AnalyticsView",
    "SettingsView",
    "ApplicationsView",
    "DomainDiscoveryView",
    "FileServersView",
    "DatabasesView",
    "SecurityView"
)

$findNameResults = @{}

if (Test-Path $mainWindowBuildPath) {
    $mainWindowContent = Get-Content $mainWindowBuildPath -Raw

    foreach ($target in $findNameTargets) {
        $hasNameAttribute = $mainWindowContent -match "x:Name=`"$target`""
        $findNameResults[$target] = $hasNameAttribute

        if ($hasNameAttribute) {
            Write-Host "    + $target - Found x:Name in MainWindow XAML" -ForegroundColor Green
        } else {
            Write-Host "    X $target - Missing x:Name in MainWindow XAML" -ForegroundColor Red
        }
    }
} else {
    Write-Host "    X MainWindow XAML not found at $mainWindowBuildPath" -ForegroundColor Red
}

$results.NavigationNaming.FindNameTargets = $findNameResults

# Test 6: Check for Resource Dependencies
Write-Host "`n6. Checking Resource Dependencies..." -ForegroundColor Cyan

$appXamlPath = Join-Path $BuildPath "App.xaml"
$results.ResourcesCheck.AppXamlExists = Test-Path $appXamlPath

if ($results.ResourcesCheck.AppXamlExists) {
    Write-Host "    + App.xaml found at $appXamlPath" -ForegroundColor Green

    # Check for resource dictionaries in App.xaml
    try {
        $appContent = Get-Content $appXamlPath -Raw
        $hasResourceDictionaries = $appContent -match "ResourceDictionary"
        $results.ResourcesCheck.HasResourceDictionaries = $hasResourceDictionaries

        if ($hasResourceDictionaries) {
            Write-Host "    + App.xaml contains ResourceDictionary references" -ForegroundColor Green
        } else {
            Write-Host "    ! App.xaml does not contain ResourceDictionary references" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    X Error reading App.xaml: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "    X App.xaml not found at $appXamlPath" -ForegroundColor Red
}

# Generate Summary
Write-Host "`n=== DIAGNOSTIC SUMMARY ===" -ForegroundColor Yellow

$criticalIssues = @()
$warnings = @()

# Critical issues
if (-not $results.ViewDeployment.BuildExists) {
    $criticalIssues += "Views directory missing from build output"
}

$missingMainViews = $results.XamlValidation.MainViews.GetEnumerator() | Where-Object { -not $_.Value.Exists } | ForEach-Object { $_.Key }
if ($missingMainViews.Count -gt 0) {
    $criticalIssues += "Missing main view files: $($missingMainViews -join ', ')"
}

$invalidXaml = $xmlValidationResults.GetEnumerator() | Where-Object { -not $_.Value.Valid } | ForEach-Object { $_.Key }
if ($invalidXaml.Count -gt 0) {
    $criticalIssues += "Invalid XAML files: $($invalidXaml -join ', ')"
}

# Warnings
$namingIssues = $results.NavigationNaming.Mismatches.GetEnumerator() | Where-Object { $_.Value.ActualExists -and -not $_.Value.ExpectedExists }
if ($namingIssues.Count -gt 0) {
    $warnings += "Navigation naming mismatches detected"
}

$missingFindNames = $findNameResults.GetEnumerator() | Where-Object { -not $_.Value } | ForEach-Object { $_.Key }
if ($missingFindNames.Count -gt 0) {
    $warnings += "Missing x:Name attributes in MainWindow: $($missingFindNames -join ', ')"
}

# Display results
Write-Host "`nCRITICAL ISSUES ($($criticalIssues.Count)):" -ForegroundColor Red
foreach ($issue in $criticalIssues) {
    Write-Host "  X $issue" -ForegroundColor Red
}

Write-Host "`nWARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
foreach ($warning in $warnings) {
    Write-Host "  ! $warning" -ForegroundColor Yellow
}

$results.Summary.CriticalIssues = $criticalIssues
$results.Summary.Warnings = $warnings
$results.Summary.TestDate = Get-Date

# Generate report if requested
if ($GenerateReport) {
    $reportPath = Join-Path $PSScriptRoot "NavigationDiagnosticReport.json"
    $results | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
    Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Cyan
}

# Root cause analysis
Write-Host "`n=== ROOT CAUSE ANALYSIS ===" -ForegroundColor Magenta

if ($criticalIssues.Count -eq 0) {
    Write-Host "+ No critical deployment issues found. Navigation should work." -ForegroundColor Green
} else {
    Write-Host "ROOT CAUSE OF NAVIGATION FAILURES:" -ForegroundColor Red

    if (-not $results.ViewDeployment.BuildExists) {
        Write-Host "  1. Views directory not deployed to build output" -ForegroundColor Red
        Write-Host "     - Check build-gui.ps1 deployment script" -ForegroundColor Yellow
    }

    if ($missingMainViews.Count -gt 0) {
        Write-Host "  2. Critical view files missing from deployment" -ForegroundColor Red
        Write-Host "     - Ensure all view files are included in build process" -ForegroundColor Yellow
    }

    if ($namingIssues.Count -gt 0) {
        Write-Host "  3. View file names do not match navigation expectations" -ForegroundColor Red
        Write-Host "     - Update MainWindow_Loaded FindName calls or rename files" -ForegroundColor Yellow
    }

    if ($missingFindNames.Count -gt 0) {
        Write-Host "  4. MainWindow XAML missing x:Name attributes for views" -ForegroundColor Red
        Write-Host "     - Add x:Name attributes to view elements in MainWindow XAML" -ForegroundColor Yellow
    }
}

Write-Host "`nNavigation diagnostic test completed." -ForegroundColor Green
return $results