# MandADiscoverySuite Integration Test
# Purpose: Test actual application runtime and capture exact failure point

[CmdletBinding()]
param(
    [int]$TimeoutSeconds = 30
)

$ErrorActionPreference = 'Continue'

function Test-ApplicationRuntime {
    Write-Host "`n=== MandADiscoverySuite Runtime Integration Test ===" -ForegroundColor Yellow
    Write-Host "Testing application can start and remain running..." -ForegroundColor Cyan

    $exePath = "C:\enterprisediscovery\MandADiscoverySuite.exe"
    $logPath = "C:\discoverydata\ljpops\Logs"
    $testLogPath = "$PSScriptRoot\integration_test.log"

    # Clear test log
    "" | Out-File $testLogPath

    # Find initial log count
    $initialLogs = Get-ChildItem -Path $logPath -Filter "MandADiscovery_*.log" -ErrorAction SilentlyContinue
    $initialLogCount = $initialLogs.Count

    Write-Host "`nStarting application..." -ForegroundColor Cyan

    try {
        # Start the application
        $app = Start-Process -FilePath $exePath `
                            -WorkingDirectory "C:\enterprisediscovery" `
                            -PassThru `
                            -WindowStyle Normal

        Write-Host "Process started with ID: $($app.Id)" -ForegroundColor Green

        # Monitor for specified timeout
        $elapsed = 0
        $checkInterval = 1
        $isRunning = $true
        $exitReason = ""

        while ($elapsed -lt $TimeoutSeconds -and $isRunning) {
            Start-Sleep -Seconds $checkInterval
            $elapsed += $checkInterval

            # Check if process is still running
            $process = Get-Process -Id $app.Id -ErrorAction SilentlyContinue

            if (-not $process) {
                $isRunning = $false
                $exitReason = "Process exited after $elapsed seconds"
                Write-Host "`nProcess exited after $elapsed seconds" -ForegroundColor Red

                # Check exit code if available
                if ($app.HasExited) {
                    Write-Host "Exit code: $($app.ExitCode)" -ForegroundColor Red
                }
            }
            else {
                # Check process details
                $workingSet = [math]::Round($process.WorkingSet64 / 1MB, 2)
                $cpuTime = $process.TotalProcessorTime.TotalSeconds

                Write-Host -NoNewline "."

                if ($elapsed % 5 -eq 0) {
                    Write-Host ""
                    Write-Host "  Status at ${elapsed}s: Running | Memory: ${workingSet}MB | CPU Time: ${cpuTime}s" -ForegroundColor Gray
                }

                # Check if main window is visible
                if ($process.MainWindowHandle -ne 0) {
                    Write-Host "`n  Main window detected!" -ForegroundColor Green
                }
            }
        }

        if ($isRunning) {
            Write-Host "`n`nSUCCESS: Application is still running after $TimeoutSeconds seconds!" -ForegroundColor Green
            Write-Host "Memory usage: $([math]::Round($process.WorkingSet64 / 1MB, 2))MB" -ForegroundColor Cyan

            # Kill the process for cleanup
            Write-Host "Stopping test application..." -ForegroundColor Yellow
            Stop-Process -Id $app.Id -Force -ErrorAction SilentlyContinue

            $result = @{
                Status = "SUCCESS"
                Runtime = "$TimeoutSeconds+ seconds"
                Reason = "Application runs successfully"
            }
        }
        else {
            $result = @{
                Status = "FAILURE"
                Runtime = "$elapsed seconds"
                Reason = $exitReason
                ExitCode = $app.ExitCode
            }
        }

        # Check for new log files
        $newLogs = Get-ChildItem -Path $logPath -Filter "MandADiscovery_*.log" -ErrorAction SilentlyContinue
        $newLogFiles = $newLogs | Where-Object { $_.CreationTime -gt (Get-Date).AddSeconds(-($elapsed + 5)) }

        if ($newLogFiles) {
            Write-Host "`nChecking new log files for errors..." -ForegroundColor Cyan

            foreach ($log in $newLogFiles) {
                Write-Host "  Analyzing: $($log.Name)" -ForegroundColor Gray

                $errors = Get-Content $log.FullName | Select-String -Pattern "CRITICAL|ERROR|EXCEPTION" | Select-Object -First 10

                if ($errors) {
                    $result.LogErrors = $errors.Line
                    Write-Host "  Found errors in log:" -ForegroundColor Red
                    $errors | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
                }
            }
        }

        return $result
    }
    catch {
        Write-Host "`nERROR: Failed to start application - $_" -ForegroundColor Red
        return @{
            Status = "ERROR"
            Error = $_.Exception.Message
        }
    }
}

function Test-MissingResources {
    Write-Host "`nChecking for critical missing resources..." -ForegroundColor Cyan

    $issues = @()

    # Check main window XAML
    if (-not (Test-Path "C:\enterprisediscovery\MandADiscoverySuite.xaml")) {
        $issues += "Main window XAML file missing (MandADiscoverySuite.xaml)"
        Write-Host "  CRITICAL: Main window XAML missing!" -ForegroundColor Red
    }

    # Check Resources folder
    if (-not (Test-Path "C:\enterprisediscovery\Resources")) {
        $issues += "Resources folder missing"
        Write-Host "  CRITICAL: Resources folder missing!" -ForegroundColor Red
    }

    # Check Views folder
    if (-not (Test-Path "C:\enterprisediscovery\Views")) {
        $issues += "Views folder missing"
        Write-Host "  CRITICAL: Views folder missing!" -ForegroundColor Red
    }

    # Check critical XAML resources
    $criticalResources = @(
        "Resources\Converters.xaml",
        "Resources\DataGridTheme.xaml",
        "Resources\ButtonStyles.xaml",
        "Resources\DiscoveryViewStyles.xaml"
    )

    foreach ($resource in $criticalResources) {
        $fullPath = "C:\enterprisediscovery\$resource"
        if (-not (Test-Path $fullPath)) {
            $issues += "Missing: $resource"
            Write-Host "  Missing: $resource" -ForegroundColor Yellow
        }
    }

    return $issues
}

function Generate-IntegrationReport {
    param($RuntimeResult, $MissingResources)

    Write-Host "`n=== INTEGRATION TEST REPORT ===" -ForegroundColor Yellow

    $report = @"
MandADiscoverySuite Integration Test Report
============================================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

RUNTIME TEST
------------
Status: $($RuntimeResult.Status)
Runtime: $($RuntimeResult.Runtime)
Reason: $($RuntimeResult.Reason)
"@

    if ($RuntimeResult.ExitCode) {
        $report += "`nExit Code: $($RuntimeResult.ExitCode)"
    }

    if ($RuntimeResult.LogErrors) {
        $report += @"

LOG ERRORS FOUND
----------------
$($RuntimeResult.LogErrors | Out-String)
"@
    }

    if ($MissingResources.Count -gt 0) {
        $report += @"

MISSING RESOURCES
-----------------
$($MissingResources | ForEach-Object { "- $_" } | Out-String)
"@
    }

    # Root cause analysis
    $report += @"

ROOT CAUSE ANALYSIS
-------------------
"@

    if ($RuntimeResult.Status -eq "SUCCESS") {
        $report += @"
The application runs successfully and remains stable.
No immediate exit issue detected during the test period.

Note: If users report immediate exit, it may be due to:
1. Specific user environment conditions
2. Permission issues with data directories
3. Network connectivity for discovery modules
4. Antivirus software interference
"@
    }
    elseif ($RuntimeResult.Status -eq "FAILURE") {
        if ($MissingResources -match "Main window XAML") {
            $report += @"
The application exits immediately because the main window XAML file is missing.
The StartupUri in App.xaml points to 'MandADiscoverySuite.xaml' which cannot be found.

Solution: Run Build-GUI.ps1 to properly build and copy all XAML files.
"@
        }
        elseif ($MissingResources.Count -gt 0) {
            $report += @"
The application exits due to missing critical resources.
WPF cannot initialize the UI without required XAML resource dictionaries.

Solution: Ensure Build-GUI.ps1 copies all Resources and Themes folders.
"@
        }
        else {
            $report += @"
The application exits after $($RuntimeResult.Runtime) for unknown reasons.
Check the application logs for specific error messages.
Exit code: $(if ($RuntimeResult.ExitCode) { $RuntimeResult.ExitCode } else { "Not available" })
"@
        }
    }

    # Recommendations
    $report += @"

RECOMMENDATIONS
---------------
"@

    if ($MissingResources.Count -gt 0) {
        $report += @"
1. IMMEDIATE ACTION REQUIRED:
   - Run Build-GUI.ps1 to rebuild the application with all resources
   - Ensure all XAML files are included in the build output
   - Verify the Resources and Views folders are copied to the build directory
"@
    }

    if ($RuntimeResult.Status -eq "SUCCESS") {
        $report += @"
1. The application runs successfully in the test environment.
2. If issues persist for specific users:
   - Check user permissions on C:\discoverydata
   - Verify .NET 6.0 Windows Desktop Runtime is installed
   - Check Windows Event Viewer for application errors
   - Review antivirus logs for blocked operations
"@
    }

    $report | Out-File "$PSScriptRoot\integration_report.txt" -Encoding UTF8
    Write-Host "`nReport saved to: $PSScriptRoot\integration_report.txt" -ForegroundColor Green

    return $RuntimeResult.Status -eq "SUCCESS"
}

# Main execution
$runtimeResult = Test-ApplicationRuntime
$missingResources = Test-MissingResources

$success = Generate-IntegrationReport -RuntimeResult $runtimeResult -MissingResources $missingResources

# Output status for automation
$status = @{
    status = if ($success) { "PASS" } else { "FAIL" }
    runtime_test = $runtimeResult
    missing_resources = $missingResources
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

$status | ConvertTo-Json -Depth 3 | Out-File "$PSScriptRoot\integration_status.json" -Encoding UTF8

if ($success) {
    Write-Host "`nIntegration test PASSED - Application runs successfully!" -ForegroundColor Green
}
else {
    Write-Host "`nIntegration test FAILED - See report for details" -ForegroundColor Red
}

# Return status for pipeline
exit $(if ($success) { 0 } else { 1 })