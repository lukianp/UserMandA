# MandADiscoverySuite Resource Validation Test
# Purpose: Validate all XAML resources, themes, and dependencies are present

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

function Test-XamlResources {
    Write-Host "`nTesting XAML Resource Files..." -ForegroundColor Cyan

    $appPath = "C:\enterprisediscovery"
    $missingResources = @()

    # These are the resources referenced in App.xaml
    $requiredResources = @(
        "Resources\Converters.xaml",
        "Themes\OptimizedResources.xaml",
        "Themes\OptimizedAnimations.xaml",
        "Themes\OptimizedGridLayouts.xaml",
        "Themes\ThemeStyles.xaml",
        "Themes\FluentDesign.xaml",
        "Themes\RefinedColorPalette.xaml",
        "Themes\SpacingSystem.xaml",
        "Themes\CustomTooltips.xaml",
        "Themes\DashboardWidgets.xaml",
        "Themes\HighContrastTheme.xaml",
        "Resources\DataGridTheme.xaml",
        "Resources\ButtonStyles.xaml",
        "Resources\DiscoveryViewStyles.xaml"
    )

    foreach ($resource in $requiredResources) {
        $fullPath = Join-Path $appPath $resource
        if (Test-Path $fullPath) {
            Write-Host "  [OK] $resource" -ForegroundColor Green
        }
        else {
            Write-Host "  [MISSING] $resource" -ForegroundColor Red
            $missingResources += $resource
        }
    }

    if ($missingResources.Count -gt 0) {
        Write-Host "`nCRITICAL: Missing $($missingResources.Count) XAML resource files!" -ForegroundColor Red
        Write-Host "This will cause immediate application crash on startup." -ForegroundColor Red
        return @{
            Passed = $false
            MissingResources = $missingResources
            CriticalFailure = "Missing XAML resources will cause immediate crash"
        }
    }

    return @{
        Passed = $true
        Message = "All XAML resources found"
    }
}

function Test-MainWindow {
    Write-Host "`nTesting Main Window XAML..." -ForegroundColor Cyan

    $mainWindowPath = "C:\enterprisediscovery\MandADiscoverySuite.xaml"

    if (Test-Path $mainWindowPath) {
        Write-Host "  [OK] Main window XAML found" -ForegroundColor Green

        # Check if compiled version exists
        $bamlPath = "C:\enterprisediscovery\MandADiscoverySuite.baml"
        if (Test-Path $bamlPath) {
            Write-Host "  [OK] Compiled BAML found" -ForegroundColor Green
        }
        else {
            Write-Host "  [WARNING] No compiled BAML - may indicate build issue" -ForegroundColor Yellow
        }

        return @{ Passed = $true }
    }
    else {
        Write-Host "  [CRITICAL] Main window XAML missing!" -ForegroundColor Red
        return @{
            Passed = $false
            CriticalFailure = "StartupUri 'MandADiscoverySuite.xaml' not found"
        }
    }
}

function Test-ViewFiles {
    Write-Host "`nTesting View Files..." -ForegroundColor Cyan

    $viewsPath = "C:\enterprisediscovery\Views"
    $missingViews = @()

    if (Test-Path $viewsPath) {
        $viewCount = (Get-ChildItem -Path $viewsPath -Filter "*.xaml" -ErrorAction SilentlyContinue).Count
        Write-Host "  Found $viewCount view files in Views folder" -ForegroundColor Green

        # Check for specific critical views
        $criticalViews = @(
            "DashboardView.xaml",
            "ActiveDirectoryDiscoveryView.xaml"
        )

        foreach ($view in $criticalViews) {
            $viewPath = Join-Path $viewsPath $view
            if (-not (Test-Path $viewPath)) {
                $missingViews += $view
                Write-Host "  [MISSING] Critical view: $view" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "  [ERROR] Views folder not found!" -ForegroundColor Red
        return @{
            Passed = $false
            Error = "Views folder missing"
        }
    }

    return @{
        Passed = ($missingViews.Count -eq 0)
        MissingViews = $missingViews
    }
}

function Test-ServiceDependencies {
    Write-Host "`nTesting Service Dependencies..." -ForegroundColor Cyan

    $appPath = "C:\enterprisediscovery"
    $servicesFound = @()
    $servicesMissing = @()

    # Check for service implementation files (compiled into the exe)
    $requiredServices = @(
        "ConfigurationService",
        "AuditService",
        "DataService",
        "LogicEngineService",
        "ThemeService",
        "CsvFileWatcherService",
        "NavigationService"
    )

    # Since services are compiled into the exe, check the exe size and attributes
    $exePath = Join-Path $appPath "MandADiscoverySuite.exe"
    if (Test-Path $exePath) {
        $exeInfo = Get-Item $exePath
        $sizeInMB = [math]::Round($exeInfo.Length / 1MB, 2)

        Write-Host "  Executable size: $sizeInMB MB" -ForegroundColor Cyan

        if ($sizeInMB -lt 0.5) {
            Write-Host "  [WARNING] Executable seems too small - may be missing compiled services" -ForegroundColor Yellow
            return @{
                Passed = $false
                Warning = "Executable size suggests incomplete build"
            }
        }

        Write-Host "  [OK] Executable size suggests services are compiled in" -ForegroundColor Green
        return @{ Passed = $true }
    }

    return @{
        Passed = $false
        Error = "Cannot verify services - executable not found"
    }
}

function Test-ConfigurationFiles {
    Write-Host "`nTesting Configuration Files..." -ForegroundColor Cyan

    $configPath = "C:\enterprisediscovery\Configuration"

    if (Test-Path $configPath) {
        $moduleRegistry = Join-Path $configPath "ModuleRegistry.json"

        if (Test-Path $moduleRegistry) {
            try {
                $json = Get-Content $moduleRegistry -Raw | ConvertFrom-Json
                Write-Host "  [OK] ModuleRegistry.json is valid JSON" -ForegroundColor Green
                Write-Host "  Module count: $($json.modules.PSObject.Properties.Count)" -ForegroundColor Cyan
                return @{ Passed = $true }
            }
            catch {
                Write-Host "  [ERROR] ModuleRegistry.json is invalid: $_" -ForegroundColor Red
                return @{
                    Passed = $false
                    Error = "Invalid JSON in ModuleRegistry.json"
                }
            }
        }
        else {
            Write-Host "  [ERROR] ModuleRegistry.json not found" -ForegroundColor Red
            return @{
                Passed = $false
                Error = "ModuleRegistry.json missing"
            }
        }
    }
    else {
        Write-Host "  [ERROR] Configuration folder not found" -ForegroundColor Red
        return @{
            Passed = $false
            Error = "Configuration folder missing"
        }
    }
}

function Test-ApplicationConfig {
    Write-Host "`nTesting Application Configuration..." -ForegroundColor Cyan

    $configFiles = @(
        "C:\enterprisediscovery\MandADiscoverySuite.exe.config",
        "C:\enterprisediscovery\MandADiscoverySuite.dll.config"
    )

    $foundConfig = $false
    foreach ($config in $configFiles) {
        if (Test-Path $config) {
            Write-Host "  [OK] Found config: $(Split-Path $config -Leaf)" -ForegroundColor Green
            $foundConfig = $true

            # Check for database connection strings if present
            $content = Get-Content $config -Raw
            if ($content -match "connectionStrings") {
                Write-Host "  [INFO] Database connection strings found" -ForegroundColor Cyan
            }
        }
    }

    if (-not $foundConfig) {
        Write-Host "  [WARNING] No .config file found - using default settings" -ForegroundColor Yellow
    }

    return @{ Passed = $true }
}

function Generate-ResourceReport {
    param($Results)

    $report = @"
Resource Validation Report
==========================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

SUMMARY
-------
"@

    $criticalIssues = @()

    foreach ($test in $Results.GetEnumerator()) {
        if (-not $test.Value.Passed) {
            if ($test.Value.CriticalFailure) {
                $criticalIssues += $test.Value.CriticalFailure
            }
            elseif ($test.Value.Error) {
                $criticalIssues += $test.Value.Error
            }
        }
    }

    if ($criticalIssues.Count -eq 0) {
        $report += "All resources validated successfully.`n"
    }
    else {
        $report += "CRITICAL ISSUES FOUND:`n"
        foreach ($issue in $criticalIssues) {
            $report += "  - $issue`n"
        }
    }

    $report += @"

DETAILED RESULTS
----------------
"@

    foreach ($test in $Results.GetEnumerator()) {
        $status = if ($test.Value.Passed) { "PASS" } else { "FAIL" }
        $report += "`n$($test.Key): $status`n"

        if ($test.Value.MissingResources) {
            $report += "  Missing Resources:`n"
            foreach ($resource in $test.Value.MissingResources) {
                $report += "    - $resource`n"
            }
        }

        if ($test.Value.MissingViews) {
            $report += "  Missing Views:`n"
            foreach ($view in $test.Value.MissingViews) {
                $report += "    - $view`n"
            }
        }
    }

    if ($criticalIssues.Count -gt 0) {
        $report += @"

ROOT CAUSE
----------
The application is exiting immediately because:
"@

        if ($Results.XamlResources.MissingResources) {
            $report += @"
1. XAML resource files are missing. The application cannot initialize its UI
   without these theme and style files. This causes an immediate crash when
   App.xaml tries to load the missing ResourceDictionaries.

   Solution: Run Build-GUI.ps1 to copy all resources to the build directory.
"@
        }

        if ($Results.MainWindow.CriticalFailure) {
            $report += @"
2. The main window XAML file is missing. The StartupUri in App.xaml points
   to 'MandADiscoverySuite.xaml' which cannot be found.

   Solution: Ensure the build process includes all XAML files.
"@
        }
    }

    $report | Out-File "$PSScriptRoot\resource_validation_report.txt" -Encoding UTF8
    Write-Host "`nReport saved to: $PSScriptRoot\resource_validation_report.txt" -ForegroundColor Green

    return $criticalIssues.Count -eq 0
}

# Main execution
Write-Host "=== MandADiscoverySuite Resource Validation ===" -ForegroundColor Yellow

$results = @{
    XamlResources = Test-XamlResources
    MainWindow = Test-MainWindow
    ViewFiles = Test-ViewFiles
    ServiceDependencies = Test-ServiceDependencies
    ConfigurationFiles = Test-ConfigurationFiles
    ApplicationConfig = Test-ApplicationConfig
}

$success = Generate-ResourceReport -Results $results

if ($success) {
    Write-Host "`nAll resource validations passed!" -ForegroundColor Green
}
else {
    Write-Host "`nCritical resource issues detected - see report for details" -ForegroundColor Red
}

# Output status for automation
@{
    status = if ($success) { "PASS" } else { "FAIL" }
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    results = $results
} | ConvertTo-Json -Depth 3 | Out-File "$PSScriptRoot\resource_status.json" -Encoding UTF8