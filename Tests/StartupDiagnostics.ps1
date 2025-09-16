# MandADiscoverySuite Startup Diagnostics Test Harness
# Author: Automated Test & Data Validation Agent
# Purpose: Diagnose immediate exit issue and capture startup errors

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
$script:TestResults = @{
    Status = "RUNNING"
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Tests = @{}
    Errors = @()
    CriticalFailures = @()
}

function Write-TestLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [ConsoleColor]$Color = 'White'
    )
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $logMessage = "[$timestamp] [$Level] $Message"

    switch($Level) {
        "ERROR" { $Color = 'Red' }
        "WARNING" { $Color = 'Yellow' }
        "SUCCESS" { $Color = 'Green' }
        "INFO" { $Color = 'Cyan' }
    }

    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path "$PSScriptRoot\startup_diagnostics.log" -Value $logMessage
}

function Test-ExecutableExists {
    Write-TestLog "Testing: MandADiscoverySuite.exe existence" -Level INFO

    $exePath = "C:\enterprisediscovery\MandADiscoverySuite.exe"
    $result = @{
        TestName = "ExecutableExists"
        Passed = $false
        Details = @{}
    }

    if (Test-Path $exePath) {
        $result.Passed = $true
        $fileInfo = Get-Item $exePath
        $result.Details = @{
            Path = $exePath
            Size = "{0:N2} MB" -f ($fileInfo.Length / 1MB)
            LastModified = $fileInfo.LastWriteTime
            Version = (Get-Command $exePath -ErrorAction SilentlyContinue).FileVersionInfo.FileVersion
        }
        Write-TestLog "SUCCESS: Executable found at $exePath" -Level SUCCESS
    }
    else {
        $result.Details.Error = "Executable not found at $exePath"
        Write-TestLog "ERROR: Executable not found!" -Level ERROR
        $script:TestResults.CriticalFailures += "Executable missing"
    }

    $script:TestResults.Tests["ExecutableExists"] = $result
    return $result.Passed
}

function Test-DotNetRuntime {
    Write-TestLog "Testing: .NET Runtime availability" -Level INFO

    $result = @{
        TestName = "DotNetRuntime"
        Passed = $false
        Details = @{}
    }

    try {
        $dotnetInfo = & dotnet --info 2>&1 | Out-String
        $runtimes = & dotnet --list-runtimes 2>&1 | Out-String

        if ($runtimes -match "Microsoft.WindowsDesktop.App 6.0") {
            $result.Passed = $true
            $result.Details.Runtime = "Microsoft.WindowsDesktop.App 6.0 found"
            Write-TestLog "SUCCESS: .NET 6.0 Windows Desktop runtime found" -Level SUCCESS
        }
        else {
            $result.Details.Error = ".NET 6.0 Windows Desktop runtime not found"
            Write-TestLog "ERROR: Missing required .NET runtime" -Level ERROR
            $script:TestResults.CriticalFailures += ".NET 6.0 Windows Desktop runtime missing"
        }

        $result.Details.InstalledRuntimes = ($runtimes -split "`n" | Where-Object { $_ -match "Microsoft" })
    }
    catch {
        $result.Details.Error = $_.Exception.Message
        Write-TestLog "ERROR: Failed to check .NET runtime: $_" -Level ERROR
    }

    $script:TestResults.Tests["DotNetRuntime"] = $result
    return $result.Passed
}

function Test-RequiredDependencies {
    Write-TestLog "Testing: Required DLL dependencies" -Level INFO

    $result = @{
        TestName = "RequiredDependencies"
        Passed = $true
        Details = @{
            MissingDlls = @()
            FoundDlls = @()
        }
    }

    $requiredDlls = @(
        "CommunityToolkit.Mvvm.dll",
        "Microsoft.Extensions.DependencyInjection.dll",
        "Microsoft.Extensions.Logging.dll",
        "Microsoft.Extensions.Logging.Abstractions.dll",
        "System.Text.Json.dll",
        "Newtonsoft.Json.dll"
    )

    $appPath = "C:\enterprisediscovery"

    foreach ($dll in $requiredDlls) {
        $dllPath = Join-Path $appPath $dll
        if (Test-Path $dllPath) {
            $result.Details.FoundDlls += $dll
            Write-TestLog "  Found: $dll" -Level INFO
        }
        else {
            $result.Passed = $false
            $result.Details.MissingDlls += $dll
            Write-TestLog "  Missing: $dll" -Level ERROR
        }
    }

    if (-not $result.Passed) {
        $script:TestResults.CriticalFailures += "Missing required DLLs: $($result.Details.MissingDlls -join ', ')"
    }

    $script:TestResults.Tests["RequiredDependencies"] = $result
    return $result.Passed
}

function Test-ModuleRegistry {
    Write-TestLog "Testing: ModuleRegistry.json configuration" -Level INFO

    $result = @{
        TestName = "ModuleRegistry"
        Passed = $false
        Details = @{}
    }

    $registryPath = "C:\enterprisediscovery\Configuration\ModuleRegistry.json"

    if (Test-Path $registryPath) {
        try {
            $registry = Get-Content $registryPath -Raw | ConvertFrom-Json
            $result.Details.Version = $registry.version
            $result.Details.ModuleCount = ($registry.modules.PSObject.Properties).Count
            $result.Details.EnabledModules = ($registry.modules.PSObject.Properties | Where-Object { $_.Value.enabled }).Count
            $result.Passed = $true
            Write-TestLog "SUCCESS: ModuleRegistry loaded - $($result.Details.ModuleCount) modules defined" -Level SUCCESS
        }
        catch {
            $result.Details.Error = "Failed to parse ModuleRegistry.json: $_"
            Write-TestLog "ERROR: Invalid ModuleRegistry.json format" -Level ERROR
        }
    }
    else {
        $result.Details.Error = "ModuleRegistry.json not found at $registryPath"
        Write-TestLog "ERROR: ModuleRegistry.json missing" -Level ERROR
        $script:TestResults.CriticalFailures += "ModuleRegistry.json missing"
    }

    $script:TestResults.Tests["ModuleRegistry"] = $result
    return $result.Passed
}

function Test-DataPaths {
    Write-TestLog "Testing: Required data paths" -Level INFO

    $result = @{
        TestName = "DataPaths"
        Passed = $true
        Details = @{
            ExistingPaths = @()
            MissingPaths = @()
        }
    }

    $requiredPaths = @(
        "C:\discoverydata",
        "C:\discoverydata\ljpops",
        "C:\discoverydata\ljpops\RawData",
        "C:\discoverydata\ljpops\Logs"
    )

    foreach ($path in $requiredPaths) {
        if (Test-Path $path) {
            $result.Details.ExistingPaths += $path
            Write-TestLog "  Found: $path" -Level INFO
        }
        else {
            $result.Passed = $false
            $result.Details.MissingPaths += $path
            Write-TestLog "  Missing: $path" -Level WARNING

            # Try to create missing path
            try {
                New-Item -Path $path -ItemType Directory -Force | Out-Null
                Write-TestLog "  Created: $path" -Level SUCCESS
            }
            catch {
                Write-TestLog "  Failed to create: $path - $_" -Level ERROR
            }
        }
    }

    $script:TestResults.Tests["DataPaths"] = $result
    return $result.Passed
}

function Test-EnvironmentVariables {
    Write-TestLog "Testing: Environment variables" -Level INFO

    $result = @{
        TestName = "EnvironmentVariables"
        Passed = $true
        Details = @{}
    }

    # Check for custom environment variable
    $mandaPath = [Environment]::GetEnvironmentVariable("MANDA_DISCOVERY_PATH")
    if ($mandaPath) {
        $result.Details.MANDA_DISCOVERY_PATH = $mandaPath
        Write-TestLog "  MANDA_DISCOVERY_PATH = $mandaPath" -Level INFO
    }
    else {
        $result.Details.MANDA_DISCOVERY_PATH = "Not set (will use default)"
        Write-TestLog "  MANDA_DISCOVERY_PATH not set, using default paths" -Level INFO
    }

    $script:TestResults.Tests["EnvironmentVariables"] = $result
    return $result.Passed
}

function Test-ApplicationStartup {
    Write-TestLog "Testing: Application startup with diagnostics" -Level INFO

    $result = @{
        TestName = "ApplicationStartup"
        Passed = $false
        Details = @{}
    }

    $exePath = "C:\enterprisediscovery\MandADiscoverySuite.exe"

    if (-not (Test-Path $exePath)) {
        $result.Details.Error = "Executable not found"
        $script:TestResults.Tests["ApplicationStartup"] = $result
        return $false
    }

    try {
        Write-TestLog "Attempting to start application..." -Level INFO

        # Start with output capture
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $exePath
        $pinfo.RedirectStandardOutput = $true
        $pinfo.RedirectStandardError = $true
        $pinfo.UseShellExecute = $false
        $pinfo.CreateNoWindow = $true
        $pinfo.WorkingDirectory = "C:\enterprisediscovery"

        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $pinfo

        # Register event handlers
        $stdoutBuilder = New-Object System.Text.StringBuilder
        $stderrBuilder = New-Object System.Text.StringBuilder

        $outputHandler = {
            if ($EventArgs.Data) {
                $null = $stdoutBuilder.AppendLine($EventArgs.Data)
            }
        }

        $errorHandler = {
            if ($EventArgs.Data) {
                $null = $stderrBuilder.AppendLine($EventArgs.Data)
            }
        }

        Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action $outputHandler | Out-Null
        Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action $errorHandler | Out-Null

        $started = $process.Start()
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()

        # Wait for up to 10 seconds
        $timeout = 10000
        $exited = $process.WaitForExit($timeout)

        if ($exited) {
            $result.Details.ExitCode = $process.ExitCode
            $result.Details.ExitTime = "Within $($timeout/1000) seconds"

            if ($process.ExitCode -eq 0) {
                Write-TestLog "Application exited with code 0 (success?)" -Level WARNING
            }
            else {
                Write-TestLog "Application exited with error code: $($process.ExitCode)" -Level ERROR
                $script:TestResults.CriticalFailures += "Application exits with code $($process.ExitCode)"
            }
        }
        else {
            # Application is still running
            $result.Passed = $true
            $result.Details.Status = "Running"
            Write-TestLog "SUCCESS: Application started and is running" -Level SUCCESS

            # Kill it for testing
            $process.Kill()
        }

        # Capture output
        $stdout = $stdoutBuilder.ToString()
        $stderr = $stderrBuilder.ToString()

        if ($stdout) {
            $result.Details.StandardOutput = $stdout
            Write-TestLog "Standard Output captured" -Level INFO
        }

        if ($stderr) {
            $result.Details.StandardError = $stderr
            Write-TestLog "Standard Error: $stderr" -Level ERROR
        }

        $process.Dispose()
    }
    catch {
        $result.Details.Error = $_.Exception.Message
        Write-TestLog "ERROR: Failed to start application: $_" -Level ERROR
        $script:TestResults.CriticalFailures += "Failed to start: $_"
    }

    $script:TestResults.Tests["ApplicationStartup"] = $result
    return $result.Passed
}

function Test-EventLog {
    Write-TestLog "Testing: Windows Event Log for application errors" -Level INFO

    $result = @{
        TestName = "EventLog"
        Passed = $true
        Details = @{
            RecentErrors = @()
        }
    }

    try {
        # Check Application event log for recent .NET or application errors
        $events = Get-EventLog -LogName Application -Newest 50 -EntryType Error,Warning |
            Where-Object { $_.Source -match "\.NET|Application Error|Windows Error Reporting" -and
                          $_.TimeGenerated -gt (Get-Date).AddMinutes(-5) }

        foreach ($event in $events) {
            if ($event.Message -match "MandADiscoverySuite") {
                $result.Details.RecentErrors += @{
                    Time = $event.TimeGenerated
                    Source = $event.Source
                    Message = $event.Message.Substring(0, [Math]::Min(200, $event.Message.Length))
                }
                Write-TestLog "Event Log Error: $($event.Message.Substring(0, 100))..." -Level WARNING
            }
        }
    }
    catch {
        Write-TestLog "Could not check Event Log: $_" -Level WARNING
    }

    $script:TestResults.Tests["EventLog"] = $result
    return $result.Passed
}

function Test-LogFiles {
    Write-TestLog "Testing: Application log files" -Level INFO

    $result = @{
        TestName = "LogFiles"
        Passed = $true
        Details = @{
            LogFiles = @()
            RecentErrors = @()
        }
    }

    $logPath = "C:\discoverydata\ljpops\Logs"

    if (Test-Path $logPath) {
        $logFiles = Get-ChildItem -Path $logPath -Filter "*.log" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 5

        foreach ($log in $logFiles) {
            $result.Details.LogFiles += $log.Name

            # Check for recent errors in log
            if ($log.LastWriteTime -gt (Get-Date).AddMinutes(-10)) {
                $content = Get-Content $log.FullName -Tail 50 -ErrorAction SilentlyContinue
                $errors = $content | Where-Object { $_ -match "ERROR|EXCEPTION|CRITICAL" }

                if ($errors) {
                    $result.Details.RecentErrors += @{
                        File = $log.Name
                        Errors = $errors | Select-Object -First 3
                    }
                    Write-TestLog "Found errors in $($log.Name)" -Level WARNING
                }
            }
        }
    }

    $script:TestResults.Tests["LogFiles"] = $result
    return $result.Passed
}

function Generate-DiagnosticReport {
    Write-TestLog "`n=== DIAGNOSTIC REPORT ===" -Level INFO

    $report = @"
MandADiscoverySuite Startup Diagnostics Report
===============================================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

SUMMARY
-------
Total Tests Run: $($script:TestResults.Tests.Count)
Tests Passed: $(($script:TestResults.Tests.Values | Where-Object { $_.Passed }).Count)
Tests Failed: $(($script:TestResults.Tests.Values | Where-Object { -not $_.Passed }).Count)
Critical Failures: $($script:TestResults.CriticalFailures.Count)

"@

    if ($script:TestResults.CriticalFailures.Count -gt 0) {
        $report += @"
CRITICAL FAILURES
-----------------
$($script:TestResults.CriticalFailures | ForEach-Object { "- $_" } | Out-String)

"@
    }

    $report += @"
TEST RESULTS
------------
"@

    foreach ($test in $script:TestResults.Tests.GetEnumerator()) {
        $status = if ($test.Value.Passed) { "PASS" } else { "FAIL" }
        $report += "`n$($test.Key): $status`n"

        if ($test.Value.Details) {
            foreach ($detail in $test.Value.Details.GetEnumerator()) {
                if ($detail.Value -and $detail.Value -ne "" -and $detail.Key -ne "StandardOutput" -and $detail.Key -ne "StandardError") {
                    $report += "  $($detail.Key): $($detail.Value)`n"
                }
            }
        }
    }

    # Add detailed output if captured
    $startupTest = $script:TestResults.Tests["ApplicationStartup"]
    if ($startupTest -and $startupTest.Details.StandardOutput) {
        $report += @"

APPLICATION OUTPUT
------------------
$($startupTest.Details.StandardOutput)

"@
    }

    if ($startupTest -and $startupTest.Details.StandardError) {
        $report += @"

APPLICATION ERRORS
------------------
$($startupTest.Details.StandardError)

"@
    }

    # Root cause analysis
    $report += @"

ROOT CAUSE ANALYSIS
-------------------
"@

    if ($script:TestResults.CriticalFailures.Count -eq 0) {
        if ($startupTest -and $startupTest.Details.ExitCode -and $startupTest.Details.ExitCode -ne 0) {
            $report += "The application starts but exits immediately with error code $($startupTest.Details.ExitCode).`n"
            $report += "This typically indicates:`n"
            $report += "- Missing configuration files`n"
            $report += "- Database connection failures`n"
            $report += "- Service initialization errors`n"
            $report += "- Unhandled exceptions during startup`n"
        }
        else {
            $report += "No critical infrastructure failures detected.`n"
            $report += "The application may be failing due to:`n"
            $report += "- Internal initialization errors`n"
            $report += "- Missing or invalid configuration`n"
            $report += "- Service dependency failures`n"
        }
    }
    else {
        $report += "Critical failures detected:`n"
        foreach ($failure in $script:TestResults.CriticalFailures) {
            $report += "- $failure`n"
        }
    }

    $report += @"

RECOMMENDATIONS
---------------
"@

    if ($script:TestResults.Tests["ExecutableExists"].Passed -eq $false) {
        $report += "1. Run Build-GUI.ps1 to compile the application`n"
    }

    if ($script:TestResults.Tests["DotNetRuntime"].Passed -eq $false) {
        $report += "2. Install .NET 6.0 Windows Desktop Runtime`n"
    }

    if ($script:TestResults.Tests["RequiredDependencies"].Passed -eq $false) {
        $report += "3. Restore NuGet packages and rebuild the application`n"
    }

    if ($script:TestResults.Tests["ModuleRegistry"].Passed -eq $false) {
        $report += "4. Ensure Configuration/ModuleRegistry.json is present and valid`n"
    }

    if ($script:TestResults.Tests["DataPaths"].Passed -eq $false) {
        $report += "5. Create required data directories or set MANDA_DISCOVERY_PATH environment variable`n"
    }

    $report | Out-File "$PSScriptRoot\startup_diagnostic_report.txt" -Encoding UTF8
    Write-TestLog "`nDiagnostic report saved to: $PSScriptRoot\startup_diagnostic_report.txt" -Level SUCCESS

    # Also display key findings
    Write-Host "`n" -NoNewline
    Write-Host "KEY FINDINGS:" -ForegroundColor Yellow
    Write-Host "=============" -ForegroundColor Yellow

    if ($script:TestResults.CriticalFailures.Count -gt 0) {
        Write-Host "CRITICAL FAILURES FOUND:" -ForegroundColor Red
        foreach ($failure in $script:TestResults.CriticalFailures) {
            Write-Host "  - $failure" -ForegroundColor Red
        }
    }
    else {
        Write-Host "No critical infrastructure failures detected" -ForegroundColor Green
    }

    # Return status for automated testing
    return @{
        status = if ($script:TestResults.CriticalFailures.Count -eq 0) { "PARTIAL" } else { "FAIL" }
        suites = @{
            startup_diagnostics = $script:TestResults.Tests.Count
        }
        critical_failures = $script:TestResults.CriticalFailures
        artifacts = @(
            "$PSScriptRoot\startup_diagnostics.log",
            "$PSScriptRoot\startup_diagnostic_report.txt"
        )
    }
}

# Main execution
Write-TestLog "=== MandADiscoverySuite Startup Diagnostics ===" -Level INFO
Write-TestLog "Starting comprehensive startup testing..." -Level INFO

# Run all tests
Test-ExecutableExists
Test-DotNetRuntime
Test-RequiredDependencies
Test-ModuleRegistry
Test-DataPaths
Test-EnvironmentVariables
Test-ApplicationStartup
Test-EventLog
Test-LogFiles

# Generate report
$finalStatus = Generate-DiagnosticReport

# Output JSON for integration
$finalStatus | ConvertTo-Json -Depth 3 | Out-File "$PSScriptRoot\test_status.json" -Encoding UTF8

Write-Host "`nDiagnostics complete!" -ForegroundColor Cyan