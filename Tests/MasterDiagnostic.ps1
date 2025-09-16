# Master Diagnostic Test for MandADiscoverySuite
# Purpose: Comprehensive diagnosis of immediate exit issue

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

function Write-DiagnosticHeader {
    param([string]$Title)
    Write-Host "`n$('=' * 60)" -ForegroundColor Yellow
    Write-Host " $Title" -ForegroundColor Yellow
    Write-Host "$('=' * 60)" -ForegroundColor Yellow
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = ""
    )

    $status = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }

    Write-Host "[$status] $TestName" -ForegroundColor $color
    if ($Details) {
        Write-Host "      $Details" -ForegroundColor Gray
    }
}

Write-DiagnosticHeader "MandADiscoverySuite Master Diagnostic"
Write-Host "Comprehensive analysis of immediate exit issue" -ForegroundColor Cyan
Write-Host "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 1. EXECUTABLE AND RUNTIME CHECKS
Write-DiagnosticHeader "1. EXECUTABLE AND RUNTIME VALIDATION"

$exePath = "C:\enterprisediscovery\MandADiscoverySuite.exe"
$exeExists = Test-Path $exePath

Write-TestResult "Executable exists" $exeExists $exePath

if ($exeExists) {
    $exeInfo = Get-Item $exePath
    $sizeKB = [math]::Round($exeInfo.Length / 1KB, 2)
    $tooSmall = $sizeKB -lt 100

    Write-TestResult "Executable size check" (-not $tooSmall) "${sizeKB}KB $(if ($tooSmall) { '(suspiciously small)' })"
}

# Check .NET runtime
try {
    $dotnetRuntimes = & dotnet --list-runtimes 2>&1 | Out-String
    $hasWinDesktop = $dotnetRuntimes -match "Microsoft.WindowsDesktop.App 6.0"
    Write-TestResult ".NET 6.0 Windows Desktop Runtime" $hasWinDesktop
}
catch {
    Write-TestResult ".NET Runtime check" $false "dotnet command failed"
}

# 2. CRITICAL RESOURCE VALIDATION
Write-DiagnosticHeader "2. CRITICAL RESOURCE VALIDATION"

$mainXaml = "C:\enterprisediscovery\MandADiscoverySuite.xaml"
$mainXamlExists = Test-Path $mainXaml

Write-TestResult "Main Window XAML" $mainXamlExists $mainXaml

$resourcesFolder = "C:\enterprisediscovery\Resources"
$resourcesExists = Test-Path $resourcesFolder

Write-TestResult "Resources folder" $resourcesExists $resourcesFolder

$viewsFolder = "C:\enterprisediscovery\Views"
$viewsExists = Test-Path $viewsFolder

Write-TestResult "Views folder" $viewsExists $viewsFolder

# Check critical XAML resources referenced in App.xaml
$criticalResources = @(
    "Resources\Converters.xaml",
    "Themes\OptimizedResources.xaml",
    "Themes\ThemeStyles.xaml",
    "Resources\DataGridTheme.xaml"
)

$missingResources = @()
foreach ($resource in $criticalResources) {
    $fullPath = "C:\enterprisediscovery\$resource"
    $exists = Test-Path $fullPath
    if (-not $exists) {
        $missingResources += $resource
    }
}

Write-TestResult "Required XAML resources" ($missingResources.Count -eq 0) "$(4 - $missingResources.Count)/4 present"

# 3. CONFIGURATION VALIDATION
Write-DiagnosticHeader "3. CONFIGURATION VALIDATION"

$moduleRegistry = "C:\enterprisediscovery\Configuration\ModuleRegistry.json"
$moduleRegistryExists = Test-Path $moduleRegistry

Write-TestResult "ModuleRegistry.json" $moduleRegistryExists $moduleRegistry

if ($moduleRegistryExists) {
    try {
        $json = Get-Content $moduleRegistry -Raw | ConvertFrom-Json
        $moduleCount = ($json.modules.PSObject.Properties).Count
        Write-TestResult "ModuleRegistry format" $true "$moduleCount modules defined"
    }
    catch {
        Write-TestResult "ModuleRegistry format" $false "Invalid JSON"
    }
}

# 4. DATA PATH VALIDATION
Write-DiagnosticHeader "4. DATA PATH VALIDATION"

$dataPath = "C:\discoverydata\ljpops\RawData"
$dataPathExists = Test-Path $dataPath

Write-TestResult "Data root path" $dataPathExists $dataPath

$logsPath = "C:\discoverydata\ljpops\Logs"
$logsPathExists = Test-Path $logsPath

Write-TestResult "Logs path" $logsPathExists $logsPath

# Check permissions
$hasWriteAccess = $false
if ($logsPathExists) {
    try {
        $testFile = Join-Path $logsPath "test_$(Get-Random).tmp"
        "test" | Out-File $testFile
        Remove-Item $testFile -ErrorAction SilentlyContinue
        $hasWriteAccess = $true
    }
    catch {
        # No write access
    }
}

Write-TestResult "Write permissions" $hasWriteAccess "Can write to logs directory"

# 5. DEPENDENCY VALIDATION
Write-DiagnosticHeader "5. DEPENDENCY VALIDATION"

$requiredDlls = @(
    "CommunityToolkit.Mvvm.dll",
    "Microsoft.Extensions.DependencyInjection.dll",
    "Microsoft.Extensions.Logging.dll",
    "System.Text.Json.dll",
    "Newtonsoft.Json.dll"
)

$missingDlls = @()
foreach ($dll in $requiredDlls) {
    $dllPath = "C:\enterprisediscovery\$dll"
    if (-not (Test-Path $dllPath)) {
        $missingDlls += $dll
    }
}

Write-TestResult "Required DLLs" ($missingDlls.Count -eq 0) "$($requiredDlls.Count - $missingDlls.Count)/$($requiredDlls.Count) present"

# 6. RUNTIME TEST
Write-DiagnosticHeader "6. RUNTIME TEST"

if ($exeExists -and $mainXamlExists) {
    Write-Host "Attempting runtime test..." -ForegroundColor Cyan

    try {
        $app = Start-Process -FilePath $exePath -WorkingDirectory "C:\enterprisediscovery" -PassThru -WindowStyle Normal

        $timeout = 10
        $elapsed = 0
        $stillRunning = $false

        while ($elapsed -lt $timeout) {
            Start-Sleep -Seconds 1
            $elapsed++

            $process = Get-Process -Id $app.Id -ErrorAction SilentlyContinue
            if ($process) {
                if ($process.MainWindowHandle -ne 0) {
                    Write-Host "  Application window detected at ${elapsed}s" -ForegroundColor Green
                }
                if ($elapsed -eq $timeout) {
                    $stillRunning = $true
                    Write-Host "  Application still running after ${timeout}s" -ForegroundColor Green
                    Stop-Process -Id $app.Id -Force -ErrorAction SilentlyContinue
                }
            }
            else {
                Write-Host "  Application exited after ${elapsed}s" -ForegroundColor Red
                if ($app.HasExited) {
                    Write-Host "  Exit code: $($app.ExitCode)" -ForegroundColor Red
                }
                break
            }
        }

        Write-TestResult "Runtime stability" $stillRunning "$(if ($stillRunning) { 'Runs successfully' } else { "Exits after ${elapsed}s" })"
    }
    catch {
        Write-TestResult "Runtime test" $false "Failed to start: $_"
    }
}
else {
    Write-TestResult "Runtime test" $false "Cannot test - missing executable or main XAML"
}

# 7. LOG ANALYSIS
Write-DiagnosticHeader "7. LOG ANALYSIS"

if ($logsPathExists) {
    $recentLogs = Get-ChildItem -Path $logsPath -Filter "MandADiscovery_*.log" -ErrorAction SilentlyContinue |
                  Sort-Object LastWriteTime -Descending |
                  Select-Object -First 3

    if ($recentLogs) {
        Write-Host "Analyzing recent log files..." -ForegroundColor Cyan

        foreach ($log in $recentLogs) {
            $errors = Get-Content $log.FullName -ErrorAction SilentlyContinue |
                     Select-String -Pattern "CRITICAL|ERROR|EXCEPTION" |
                     Select-Object -First 5

            if ($errors) {
                Write-Host "  Errors in $($log.Name):" -ForegroundColor Yellow
                foreach ($error in $errors) {
                    $line = $error.Line.Substring(0, [Math]::Min(80, $error.Line.Length))
                    Write-Host "    $line" -ForegroundColor Red
                }
            }
            else {
                Write-Host "  No errors in $($log.Name)" -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "No recent log files found" -ForegroundColor Yellow
    }
}

# 8. FINAL DIAGNOSIS
Write-DiagnosticHeader "8. ROOT CAUSE DIAGNOSIS"

$criticalIssues = @()

if (-not $exeExists) {
    $criticalIssues += "Missing executable - run Build-GUI.ps1"
}

if (-not $mainXamlExists) {
    $criticalIssues += "Missing main window XAML - incomplete build"
}

if ($missingResources.Count -gt 0) {
    $criticalIssues += "Missing $($missingResources.Count) XAML resources - UI initialization will fail"
}

if ($missingDlls.Count -gt 0) {
    $criticalIssues += "Missing $($missingDlls.Count) required DLLs - runtime dependencies not met"
}

if (-not $dataPathExists -or -not $hasWriteAccess) {
    $criticalIssues += "Data path or permission issues - application cannot write logs/data"
}

Write-Host "`nDIAGNOSIS:" -ForegroundColor Yellow

if ($criticalIssues.Count -eq 0) {
    Write-Host "✓ No critical issues detected. Application should run normally." -ForegroundColor Green
    Write-Host "  If users report immediate exit, check:" -ForegroundColor Cyan
    Write-Host "  - User-specific permissions" -ForegroundColor Gray
    Write-Host "  - Antivirus software interference" -ForegroundColor Gray
    Write-Host "  - Network connectivity for discovery modules" -ForegroundColor Gray
}
else {
    Write-Host "✗ CRITICAL ISSUES DETECTED:" -ForegroundColor Red
    foreach ($issue in $criticalIssues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }

    Write-Host "`nRECOMMENDED ACTIONS:" -ForegroundColor Yellow
    Write-Host "1. Run Build-GUI.ps1 to rebuild the application with all resources" -ForegroundColor Cyan
    Write-Host "2. Verify all XAML files and dependencies are copied to build directory" -ForegroundColor Cyan
    Write-Host "3. Ensure NuGet packages are restored correctly" -ForegroundColor Cyan

    if ($missingResources.Count -gt 0) {
        Write-Host "`nMISSING XAML RESOURCES:" -ForegroundColor Red
        foreach ($resource in $missingResources) {
            Write-Host "  - $resource" -ForegroundColor Red
        }
    }

    if ($missingDlls.Count -gt 0) {
        Write-Host "`nMISSING DLLs:" -ForegroundColor Red
        foreach ($dll in $missingDlls) {
            Write-Host "  - $dll" -ForegroundColor Red
        }
    }
}

# Generate final report
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    status = if ($criticalIssues.Count -eq 0) { "PASS" } else { "FAIL" }
    critical_issues = $criticalIssues
    missing_resources = $missingResources
    missing_dlls = $missingDlls
    executable_exists = $exeExists
    main_xaml_exists = $mainXamlExists
    data_paths_ok = $dataPathExists -and $hasWriteAccess
}

$report | ConvertTo-Json -Depth 3 | Out-File "$PSScriptRoot\master_diagnostic_report.json" -Encoding UTF8

Write-Host "`nDiagnostic complete. Report saved to: $PSScriptRoot\master_diagnostic_report.json" -ForegroundColor Green

# Return exit code for automation
if ($criticalIssues.Count -eq 0) {
    exit 0
}
else {
    exit 1
}