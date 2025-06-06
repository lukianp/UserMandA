# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test script for the Authentication Monitoring module
.DESCRIPTION
    Demonstrates the enhanced authentication visibility functionality
    added to the M&A Discovery Suite.
.NOTES
    Version: 1.0.0
    Created: 2025-06-06
    Author: Lukian Poleschtschuk
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Detailed,
    
    [Parameter(Mandatory=$false)]
    [switch]$SummaryOnly
)

# Set up error handling
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Authentication Monitoring Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    # Check if we're in the M&A Discovery Suite environment
    if (-not $global:MandA -or -not $global:MandA.Initialized) {
        Write-Host "[ERROR] M&A Discovery Suite environment not initialized!" -ForegroundColor Red
        Write-Host "Please run this script through QuickStart.ps1 or ensure Set-SuiteEnvironment.ps1 has been sourced." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "[INFO] M&A Discovery Suite environment detected" -ForegroundColor Green
    Write-Host "Suite Version: $($global:MandA.Config.metadata.version)" -ForegroundColor Gray
    Write-Host "Company: $($global:MandA.Config.metadata.companyName)" -ForegroundColor Gray
    
    # Load the Authentication Monitoring module
    $authModulePath = Join-Path $global:MandA.Paths.Utilities "AuthenticationMonitoring.psm1"
    
    if (-not (Test-Path $authModulePath)) {
        Write-Host "[ERROR] Authentication Monitoring module not found at: $authModulePath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[INFO] Loading Authentication Monitoring module..." -ForegroundColor Yellow
    Import-Module $authModulePath -Force -Global
    
    if (Get-Command Show-AuthenticationStatus -ErrorAction SilentlyContinue) {
        Write-Host "[SUCCESS] Authentication Monitoring module loaded successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to load Authentication Monitoring functions" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n" -NoNewline
    
    if ($SummaryOnly) {
        # Show programmatic summary
        Write-Host "=== AUTHENTICATION SUMMARY (Programmatic) ===" -ForegroundColor Cyan
        
        $summary = Get-AuthenticationSummary -Context $global:MandA
        
        Write-Host "Timestamp: $($summary.Timestamp)" -ForegroundColor Gray
        Write-Host "`nService Status:" -ForegroundColor White
        
        foreach ($serviceName in $summary.Services.Keys) {
            $service = $summary.Services[$serviceName]
            $status = if ($service.Connected) { "CONNECTED" } else { "NOT CONNECTED" }
            $color = if ($service.Connected) { "Green" } else { "Red" }
            
            Write-Host "  $serviceName`: $status" -ForegroundColor $color
            
            if ($service.Available -and -not $service.Connected) {
                Write-Host "    (Module available but not authenticated)" -ForegroundColor Yellow
            } elseif (-not $service.Available) {
                Write-Host "    (Module not available)" -ForegroundColor Gray
            }
        }
        
        # Test overall connectivity
        $overallConnectivity = Test-ServiceConnectivity -Context $global:MandA
        $connectivityStatus = if ($overallConnectivity) { "READY" } else { "NOT READY" }
        $connectivityColor = if ($overallConnectivity) { "Green" } else { "Red" }
        
        Write-Host "`nOverall Discovery Readiness: $connectivityStatus" -ForegroundColor $connectivityColor
        
    } else {
        # Show detailed authentication status
        Write-Host "=== DETAILED AUTHENTICATION STATUS ===" -ForegroundColor Cyan
        Show-AuthenticationStatus -Context $global:MandA
    }
    
    if ($Detailed) {
        Write-Host "=== ADDITIONAL DETAILS ===" -ForegroundColor Cyan
        
        # Show available PowerShell modules related to authentication
        Write-Host "`nAvailable Authentication Modules:" -ForegroundColor White
        
        $authModules = @(
            @{ Name = "Microsoft.Graph"; Description = "Microsoft Graph PowerShell SDK" },
            @{ Name = "ExchangeOnlineManagement"; Description = "Exchange Online PowerShell V2" },
            @{ Name = "ActiveDirectory"; Description = "Active Directory PowerShell Module" },
            @{ Name = "AzureAD"; Description = "Azure Active Directory PowerShell Module" },
            @{ Name = "Microsoft.Online.SharePoint.PowerShell"; Description = "SharePoint Online Management Shell" },
            @{ Name = "MicrosoftTeams"; Description = "Microsoft Teams PowerShell Module" }
        )
        
        foreach ($module in $authModules) {
            $installed = Get-Module -Name $module.Name -ListAvailable -ErrorAction SilentlyContinue
            $loaded = Get-Module -Name $module.Name -ErrorAction SilentlyContinue
            
            if ($installed) {
                $version = $installed | Sort-Object Version -Descending | Select-Object -First 1 | ForEach-Object { $_.Version }
                $status = if ($loaded) { "LOADED" } else { "INSTALLED" }
                $color = if ($loaded) { "Green" } else { "Yellow" }
                Write-Host "  ✓ $($module.Name) ($status - v$version)" -ForegroundColor $color
            } else {
                Write-Host "  ✗ $($module.Name) (NOT INSTALLED)" -ForegroundColor Red
            }
            Write-Host "    $($module.Description)" -ForegroundColor Gray
        }
        
        # Show current PowerShell sessions
        Write-Host "`nActive PowerShell Sessions:" -ForegroundColor White
        $sessions = Get-PSSession -ErrorAction SilentlyContinue
        
        if ($sessions) {
            foreach ($session in $sessions) {
                $status = $session.State
                $color = switch ($status) {
                    "Opened" { "Green" }
                    "Closed" { "Red" }
                    "Broken" { "Red" }
                    default { "Yellow" }
                }
                Write-Host "  Session $($session.Id): $($session.ComputerName) ($status)" -ForegroundColor $color
                Write-Host "    Configuration: $($session.ConfigurationName)" -ForegroundColor Gray
            }
        } else {
            Write-Host "  No active remote PowerShell sessions" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Authentication monitoring test completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n[FATAL ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}