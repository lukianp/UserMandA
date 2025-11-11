# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-09-07

<#
.SYNOPSIS
    Real-Time Discovery Engine Launcher for M&A Discovery Suite
.DESCRIPTION
    Launches the comprehensive real-time discovery engine with background monitoring,
    file system watchers, scheduled tasks, and event-driven discovery capabilities.
    Provides continuous monitoring and discovery for dynamic infrastructure assessment.
.PARAMETER CompanyName
    The company name for organizing discovery data and configuration
.PARAMETER DiscoveryInterval
    Interval in minutes between automated discovery runs (default: 5 minutes)
.PARAMETER SessionId
    Optional session identifier for tracking discovery runs
.PARAMETER EnableFileWatchers
    Enable file system watchers for real-time change detection (default: true)
.PARAMETER EnableEventLogMonitoring
    Enable Windows Event Log monitoring for system events (default: true)
.EXAMPLE
    .\Invoke-RealTimeDiscoveryEngine.ps1 -CompanyName "Contoso"
.EXAMPLE
    .\Invoke-RealTimeDiscoveryEngine.ps1 -CompanyName "Contoso" -DiscoveryInterval 10 -SessionId "custom-session-123"
.EXAMPLE
    .\Invoke-RealTimeDiscoveryEngine.ps1 -CompanyName "Contoso" -EnableFileWatchers $false
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [int]$DiscoveryInterval = 5,

    [Parameter(Mandatory=$false)]
    [string]$SessionId,

    [Parameter(Mandatory=$false)]
    [switch]$EnableFileWatchers = $true,

    [Parameter(Mandatory=$false)]
    [switch]$EnableEventLogMonitoring = $true
)

# Set error action and strict mode
$ErrorActionPreference = "Continue"
Set-StrictMode -Version Latest

# Script variables
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath = Split-Path -Parent $ScriptRoot
$ModulesPath = Join-Path $RootPath "Modules"

Write-Host "=== Real-Time Discovery Engine ===" -ForegroundColor Cyan
Write-Host "Company: $CompanyName" -ForegroundColor Green
Write-Host "Discovery Interval: $DiscoveryInterval minutes" -ForegroundColor White
Write-Host "Starting real-time discovery engine..." -ForegroundColor Yellow
Write-Host ""

try {
    # Import required modules
    Write-Host "Loading Real-Time Discovery Engine modules..." -ForegroundColor Yellow

    # Import Real-Time Discovery Engine module
    $rtdeModulePath = Join-Path $ModulesPath "Discovery\RealTimeDiscoveryEngine.psm1"
    if (Test-Path $rtdeModulePath) {
        Import-Module $rtdeModulePath -Force
        Write-Host "[RealTimeDiscoveryEngine] Module loaded successfully" -ForegroundColor Green
    } else {
        throw "Real-Time Discovery Engine module not found at: $rtdeModulePath"
    }

    # Import supporting modules
    $supportingModules = @(
        "Utilities\EnhancedLogging.psm1",
        "Utilities\PerformanceMetrics.psm1"
    )

    foreach ($module in $supportingModules) {
        $modulePath = Join-Path $ModulesPath $module
        if (Test-Path $modulePath) {
            Import-Module $modulePath -Force
            Write-Host "[$([System.IO.Path]::GetFileNameWithoutExtension($module))] Supporting module loaded" -ForegroundColor Green
        } else {
            Write-Host "[$([System.IO.Path]::GetFileNameWithoutExtension($module))] Module not found (continuing)" -ForegroundColor Yellow
        }
    }

    # Generate session ID if not provided
    if (-not $SessionId) {
        $SessionId = [System.Guid]::NewGuid().ToString()
    }

    # Create discovery configuration
    Write-Host "Creating discovery configuration..." -ForegroundColor Yellow
    $configuration = @{
        realTimeDiscovery = @{
            intervalMinutes = $DiscoveryInterval
            enableFileWatchers = [bool]$EnableFileWatchers
            enableEventLogMonitoring = [bool]$EnableEventLogMonitoring
        }
        companyName = $CompanyName
        sessionId = $SessionId
        startTime = Get-Date
    }

    # Create discovery context
    Write-Host "Initializing discovery context..." -ForegroundColor Yellow
    $context = @{
        companyName = $CompanyName
        sessionId = $SessionId
        outputPath = Join-Path $RootPath "DiscoveryData\$CompanyName\RealTime"
        logPath = Join-Path $RootPath "Logs\RealTimeDiscovery_$CompanyName"
        timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    }

    # Ensure output directories exist
    $outputPaths = @($context.outputPath, $context.logPath)
    foreach ($path in $outputPaths) {
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Host "Created directory: $path" -ForegroundColor Green
        }
    }

    Write-Host "Discovery context initialized:" -ForegroundColor Green
    Write-Host "  Session ID: $SessionId" -ForegroundColor White
    Write-Host "  Output Path: $($context.outputPath)" -ForegroundColor White
    Write-Host "  Log Path: $($context.logPath)" -ForegroundColor White
    Write-Host ""

    Write-Host "Configuration:" -ForegroundColor Green
    Write-Host "  Discovery Interval: $DiscoveryInterval minutes" -ForegroundColor White
    Write-Host "  File System Watchers: $([bool]$EnableFileWatchers)" -ForegroundColor White
    Write-Host "  Event Log Monitoring: $([bool]$EnableEventLogMonitoring)" -ForegroundColor White
    Write-Host ""

    # Initialize Real-Time Discovery Engine
    Write-Host "Starting Real-Time Discovery Engine..." -ForegroundColor Cyan

    # Call the engine cmdlet
    $status = Start-RealTimeDiscovery -Configuration $configuration.realTimeDiscovery -Context $context -SessionId $SessionId

    if ($status) {
        Write-Host ""
        Write-Host "=== Engine Status ===" -ForegroundColor Cyan
        Write-Host "Status: RUNNING" -ForegroundColor Green
        Write-Host "Session ID: $($status.SessionId)" -ForegroundColor White
        Write-Host "Discovery Interval: $($status.DiscoveryInterval) seconds" -ForegroundColor White
        Write-Host "Active Watchers: $($status.ActiveWatchers)" -ForegroundColor White
        Write-Host "Is Running: $($status.IsRunning)" -ForegroundColor Green
        Write-Host ""

        if ($status.IsRunning) {
            Write-Host "✅ Real-Time Discovery Engine started successfully" -ForegroundColor Green
            Write-Host "  • File system watchers are monitoring for changes" -ForegroundColor White
            Write-Host "  • Background timer is scheduled for interval discovery" -ForegroundColor White
            Write-Host "  • Event log monitoring is active" -ForegroundColor White
            Write-Host ""

            Write-Host "=== Monitoring Information ===" -ForegroundColor Cyan
            Write-Host "The engine will continue running in the background with:" -ForegroundColor White
            Write-Host "  • Continuous file system change detection" -ForegroundColor White
            Write-Host "  • Automated recurring discovery every $DiscoveryInterval minutes" -ForegroundColor White
            Write-Host "  • Windows Event Log monitoring for critical events" -ForegroundColor White
            Write-Host "  • Real-time trigger responses for sensitive changes" -ForegroundColor White
            Write-Host ""

            Write-Host "=== Control Commands ===" -ForegroundColor Cyan
            Write-Host "To check status: Get-RealTimeDiscoveryStatus" -ForegroundColor White
            Write-Host "To stop engine: Stop-RealTimeDiscovery" -ForegroundColor White
            Write-Host "To trigger immediate discovery: Start-RealTimeDiscovery [restart]" -ForegroundColor White
        }

        # Return the status object for programmatic use
        return $status
    } else {
        Write-Host "Failed to get engine status" -ForegroundColor Yellow
    }

} catch {
    Write-Host ""
    Write-Host "=== Real-Time Discovery Engine Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""

    if ($_.Exception.StackTrace) {
        Write-Host "Stack Trace:" -ForegroundColor Red
        Write-Host $_.Exception.StackTrace -ForegroundColor Red
    }

    exit 1
}

Write-Host ""
Write-Host "=== Real-Time Discovery Engine Complete ===" -ForegroundColor Green
Write-Host "The engine is now running in the background for continuous monitoring." -ForegroundColor White
Write-Host "Check the GUI periodically to see newly discovered data." -ForegroundColor White