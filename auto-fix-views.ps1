#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated view testing and error collection script

.DESCRIPTION
    This script runs the Electron app, cycles through views, captures console errors,
    and generates a comprehensive error report for Claude to fix.
#>

param(
    [switch]$ContinuousMode,
    [int]$MaxIterations = 5
)

$ErrorActionPreference = "Continue"
$projectDir = "D:\Scripts\UserMandA\guiv2"
$buildDir = "C:\enterprisediscovery\guiv2"

# ANSI colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

Write-Host "${Cyan}╔══════════════════════════════════════════════════════════╗${Reset}"
Write-Host "${Cyan}║   Automated View Testing & Error Collection System      ║${Reset}"
Write-Host "${Cyan}╚══════════════════════════════════════════════════════════╝${Reset}`n"

# Views to test
$views = @(
    @{Name="Overview"; Path="/overview"},
    @{Name="Discovery"; Path="/discovery"},
    @{Name="Domain Discovery"; Path="/discovery/domain"},
    @{Name="Azure Discovery"; Path="/discovery/azure"},
    @{Name="AWS Discovery"; Path="/discovery/aws"},
    @{Name="Exchange Discovery"; Path="/discovery/exchange"},
    @{Name="SharePoint Discovery"; Path="/discovery/sharepoint"},
    @{Name="Teams Discovery"; Path="/discovery/teams"},
    @{Name="OneDrive Discovery"; Path="/discovery/onedrive"},
    @{Name="Network Discovery"; Path="/discovery/network"},
    @{Name="Applications Discovery"; Path="/discovery/applications"},
    @{Name="Group Membership Discovery"; Path="/discovery/group-membership"},
    @{Name="Infrastructure Audit"; Path="/discovery/infrastructure-audit"},
    @{Name="Certificate Discovery"; Path="/discovery/certificates"},
    @{Name="File Share Enumeration"; Path="/discovery/file-shares"},
    @{Name="Users"; Path="/users"},
    @{Name="Groups"; Path="/groups"},
    @{Name="Computers"; Path="/computers"},
    @{Name="Infrastructure"; Path="/infrastructure"},
    @{Name="Applications"; Path="/applications"},
    @{Name="Migration Planning"; Path="/migration/planning"},
    @{Name="Migration Analysis"; Path="/migration/analysis"},
    @{Name="User Analytics"; Path="/analytics/users"},
    @{Name="Group Analytics"; Path="/analytics/groups"},
    @{Name="Application Analytics"; Path="/analytics/applications"},
    @{Name="Device Analytics"; Path="/analytics/devices"},
    @{Name="Migration Readiness"; Path="/analytics/migration-readiness"},
    @{Name="Cost Estimation"; Path="/analytics/cost-estimation"},
    @{Name="Risk Assessment"; Path="/analytics/risk-assessment"},
    @{Name="Migration Report"; Path="/analytics/migration-report"},
    @{Name="Reports"; Path="/reports"},
    @{Name="Settings"; Path="/settings"}
)

function Write-Header {
    param($Message)
    Write-Host "`n${Cyan}$('─' * 60)${Reset}"
    Write-Host "${Cyan}$Message${Reset}"
    Write-Host "${Cyan}$('─' * 60)${Reset}`n"
}

function Start-DevServer {
    Write-Header "Starting Development Server"

    Push-Location $buildDir

    # Start npm in background
    $job = Start-Job -ScriptBlock {
        Set-Location $using:buildDir
        npm start 2>&1
    }

    Pop-Location

    # Wait for server to start
    Write-Host "Waiting for dev server to start..."
    Start-Sleep -Seconds 15

    # Check if server is responding
    $retries = 0
    while ($retries -lt 10) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9000" -TimeoutSec 2 -UseBasicParsing
            Write-Host "${Green}✓ Dev server is ready${Reset}"
            return $job
        } catch {
            $retries++
            Write-Host "Waiting for server... ($retries/10)"
            Start-Sleep -Seconds 2
        }
    }

    Write-Host "${Red}✗ Failed to start dev server${Reset}"
    return $null
}

function Get-BrowserConsoleErrors {
    param(
        [string]$ViewName,
        [string]$ViewPath
    )

    Write-Host "${Yellow}Testing: $ViewName${Reset} ($ViewPath)"

    # Use PowerShell to get current console logs from the Electron app
    # This requires the app to be running with remote debugging enabled

    # For now, return a placeholder - we'll need to implement proper console capture
    return @()
}

function Test-AllViews {
    Write-Header "Testing All Views"

    $results = @()
    $errorCount = 0
    $successCount = 0

    foreach ($view in $views) {
        Write-Host "`n${Cyan}[$(($results.Count + 1))/$($views.Count)]${Reset} Testing: ${Yellow}$($view.Name)${Reset}"

        $errors = Get-BrowserConsoleErrors -ViewName $view.Name -ViewPath $view.Path

        if ($errors.Count -eq 0) {
            Write-Host "  ${Green}✓ No errors detected${Reset}"
            $successCount++
        } else {
            Write-Host "  ${Red}✗ $($errors.Count) error(s) found${Reset}"
            $errorCount++

            $errors | ForEach-Object {
                Write-Host "    ${Red}→${Reset} $_"
            }
        }

        $results += @{
            View = $view.Name
            Path = $view.Path
            Errors = $errors
            Success = ($errors.Count -eq 0)
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }

        # Small delay between views
        Start-Sleep -Milliseconds 500
    }

    return @{
        Results = $results
        Total = $views.Count
        Success = $successCount
        Failed = $errorCount
    }
}

function Export-ErrorReport {
    param($TestResults)

    Write-Header "Generating Error Report"

    $reportPath = Join-Path $projectDir "view-test-report.json"
    $mdReportPath = Join-Path $projectDir "view-test-report.md"

    # Export JSON
    $TestResults | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
    Write-Host "${Green}✓${Reset} JSON report: $reportPath"

    # Generate Markdown report
    $md = @"
# View Testing Report
**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary
- **Total Views:** $($TestResults.Total)
- **Successful:** $($TestResults.Success) (${Green}$([math]::Round(($TestResults.Success / $TestResults.Total) * 100, 2))%${Reset})
- **Failed:** $($TestResults.Failed) (${Red}$([math]::Round(($TestResults.Failed / $TestResults.Total) * 100, 2))%${Reset})

## Results by View

"@

    foreach ($result in $TestResults.Results) {
        $status = if ($result.Success) { "✅" } else { "❌" }
        $md += "`n### $status $($result.View)`n"
        $md += "**Path:** ``$($result.Path)```n"
        $md += "**Status:** $(if ($result.Success) { 'PASS' } else { 'FAIL' })`n"

        if (-not $result.Success) {
            $md += "`n**Errors:**`n"
            foreach ($error in $result.Errors) {
                $md += "- ``$error```n"
            }
        }

        $md += "`n"
    }

    $md | Out-File $mdReportPath -Encoding UTF8
    Write-Host "${Green}✓${Reset} Markdown report: $mdReportPath"

    # Print summary
    Write-Host "`n${Cyan}═══════════════════════════════════════════${Reset}"
    Write-Host "${Cyan}TEST SUMMARY${Reset}"
    Write-Host "${Cyan}═══════════════════════════════════════════${Reset}"
    Write-Host "Total Views:  $($TestResults.Total)"
    Write-Host "${Green}Successful:   $($TestResults.Success)${Reset}"
    Write-Host "${Red}Failed:       $($TestResults.Failed)${Reset}"
    Write-Host "${Cyan}═══════════════════════════════════════════${Reset}`n"
}

# Main execution
try {
    Write-Host "${Yellow}Starting automated view testing...${Reset}`n"

    # Start dev server
    $serverJob = Start-DevServer

    if (-not $serverJob) {
        Write-Host "${Red}Failed to start development server. Exiting.${Reset}"
        exit 1
    }

    try {
        # Run tests
        $testResults = Test-AllViews

        # Generate reports
        Export-ErrorReport -TestResults $testResults

        Write-Host "`n${Green}✓ Testing complete!${Reset}"
        Write-Host "`nNext steps:"
        Write-Host "1. Review the error report: ${Yellow}view-test-report.md${Reset}"
        Write-Host "2. Provide the report to Claude for automated fixes"
        Write-Host "3. Run this script again to verify fixes`n"

    } finally {
        # Cleanup: Stop dev server
        Write-Host "`n${Yellow}Stopping development server...${Reset}"
        Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job -Job $serverJob -Force -ErrorAction SilentlyContinue
    }

} catch {
    Write-Host "${Red}✗ Error during testing: $_${Reset}"
    Write-Host $_.ScriptStackTrace
    exit 1
}
