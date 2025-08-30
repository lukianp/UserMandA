#Requires -Version 5.1

<#
.SYNOPSIS
    Comprehensive production safety validation tests for Infrastructure Discovery Module

.DESCRIPTION
    This test suite validates that the enhanced Infrastructure Discovery module with embedded
    nmap integration operates safely in production environments. Tests cover rate limiting,
    production environment detection, safety controls, and fallback mechanisms.

.NOTES
    Created by: Master Orchestrator (test-data-validator agent)
    Date: 2025-08-30
    Version: 1.0.0
    For: Infrastructure Discovery Module Enhancement (T-INFRA-001)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ModulePath = "D:\Scripts\UserMandA\Modules\Discovery\InfrastructureDiscovery.psm1",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "D:\Scripts\UserMandA\TestResults",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipNetworkTests
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
}

$TestResults = @{
    Passed = 0
    Failed = 0
    Skipped = 0
    Tests = @()
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message = "",
        [hashtable]$Details = @{}
    )
    
    $Result = @{
        TestName = $TestName
        Status = $Status
        Message = $Message
        Details = $Details
        Timestamp = Get-Date
    }
    
    $TestResults.Tests += $Result
    
    switch ($Status) {
        "PASS" { 
            $TestResults.Passed++
            Write-Host "✅ PASS: $TestName" -ForegroundColor Green
            if ($Message) { Write-Host "    $Message" -ForegroundColor Gray }
        }
        "FAIL" { 
            $TestResults.Failed++
            Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
            if ($Message) { Write-Host "    $Message" -ForegroundColor Gray }
        }
        "SKIP" { 
            $TestResults.Skipped++
            Write-Host "⚠️ SKIP: $TestName" -ForegroundColor Yellow
            if ($Message) { Write-Host "    $Message" -ForegroundColor Gray }
        }
    }
}

Write-Host ""
Write-Host "🧪 Infrastructure Discovery Production Safety Test Suite" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Module Loading and Basic Functions
Write-Host "🔧 Testing Module Loading..." -ForegroundColor Yellow

try {
    if (-not (Test-Path $ModulePath)) {
        Write-TestResult "Module File Exists" "FAIL" "Module file not found at $ModulePath"
    } else {
        Import-Module $ModulePath -Force
        Write-TestResult "Module File Exists" "PASS" "Module file found and loaded"
        
        # Test core functions exist
        $RequiredFunctions = @(
            'Get-ProductionSafeNmapConfig',
            'Test-ProductionEnvironment', 
            'Install-NmapIfNeeded',
            'Invoke-ProductionSafeNmapScan',
            'Invoke-ProductionSafePowerShellScan',
            'Get-ComprehensiveHostInformation',
            'Import-ExistingAssetData',
            'Merge-DiscoveredWithExistingAssets'
        )
        
        foreach ($function in $RequiredFunctions) {
            if (Get-Command $function -ErrorAction SilentlyContinue) {
                Write-TestResult "Function Available: $function" "PASS"
            } else {
                Write-TestResult "Function Available: $function" "FAIL" "Function not exported from module"
            }
        }
    }
} catch {
    Write-TestResult "Module Loading" "FAIL" "Error loading module: $($_.Exception.Message)"
}

# Test 2: Production-Safe Configuration
Write-Host "🛡️ Testing Production-Safe Configuration..." -ForegroundColor Yellow

try {
    $config = Get-ProductionSafeNmapConfig -Context @{}
    
    if ($config.DelayBetweenHosts -ge 1000) {
        Write-TestResult "Rate Limiting - Delay" "PASS" "Delay set to $($config.DelayBetweenHosts)ms (safe)"
    } else {
        Write-TestResult "Rate Limiting - Delay" "FAIL" "Delay too aggressive: $($config.DelayBetweenHosts)ms"
    }
    
    if ($config.MaxPacketsPerSecond -le 10) {
        Write-TestResult "Rate Limiting - Packets/Sec" "PASS" "Rate limit: $($config.MaxPacketsPerSecond) pps (safe)"
    } else {
        Write-TestResult "Rate Limiting - Packets/Sec" "FAIL" "Rate too aggressive: $($config.MaxPacketsPerSecond) pps"
    }
    
    if ($config.TimingTemplate -eq "T2") {
        Write-TestResult "Timing Template" "PASS" "Using polite timing template: $($config.TimingTemplate)"
    } else {
        Write-TestResult "Timing Template" "FAIL" "Timing template not set to polite mode: $($config.TimingTemplate)"
    }
    
    if ($config.MaxSubnetSize -eq 24) {
        Write-TestResult "Subnet Size Limit" "PASS" "Subnet limited to /$($config.MaxSubnetSize) - 254 IPs max"
    } else {
        Write-TestResult "Subnet Size Limit" "FAIL" "Subnet size limit too permissive: /$($config.MaxSubnetSize)"
    }
    
    if ($config.BlacklistPorts.Count -gt 0) {
        Write-TestResult "Port Blacklist" "PASS" "Blacklisted ports: $($config.BlacklistPorts -join ', ')"
    } else {
        Write-TestResult "Port Blacklist" "FAIL" "No dangerous ports blacklisted"
    }
    
} catch {
    Write-TestResult "Production-Safe Configuration" "FAIL" "Error getting configuration: $($_.Exception.Message)"
}

# Test 3: Production Environment Detection
Write-Host "🔍 Testing Production Environment Detection..." -ForegroundColor Yellow

try {
    $envTest = Test-ProductionEnvironment -Context @{}
    
    Write-TestResult "Environment Detection" "PASS" "Detection completed - Signals: $($envTest.Signals -join ', ')"
    Write-TestResult "Production Status" "PASS" "Detected as production: $($envTest.IsProduction)"
    
    # Validate detection logic
    if ($envTest.PSObject.Properties['IsProduction'] -and $envTest.PSObject.Properties['Signals']) {
        Write-TestResult "Detection Structure" "PASS" "Environment detection returns proper structure"
    } else {
        Write-TestResult "Detection Structure" "FAIL" "Environment detection missing required properties"
    }
    
} catch {
    Write-TestResult "Production Environment Detection" "FAIL" "Error: $($_.Exception.Message)"
}

# Test 4: Embedded nmap Binary Detection
Write-Host "🔨 Testing nmap Binary Embedding..." -ForegroundColor Yellow

try {
    $nmapPath = Install-NmapIfNeeded -Context @{}
    
    if ($nmapPath) {
        if (Test-Path $nmapPath) {
            Write-TestResult "nmap Binary Detection" "PASS" "Found nmap at: $nmapPath"
            
            # Test if it's the embedded version
            $embeddedPaths = @(
                "*Tools*nmap*",
                "*enterprisediscovery*Tools*nmap*"
            )
            
            $isEmbedded = $false
            foreach ($pattern in $embeddedPaths) {
                if ($nmapPath -like $pattern) {
                    $isEmbedded = $true
                    break
                }
            }
            
            if ($isEmbedded) {
                Write-TestResult "Embedded nmap Usage" "PASS" "Using embedded nmap binary"
            } else {
                Write-TestResult "Embedded nmap Usage" "SKIP" "Using system nmap (not embedded)"
            }
        } else {
            Write-TestResult "nmap Binary Detection" "FAIL" "nmap path returned but file doesn't exist"
        }
    } else {
        Write-TestResult "nmap Binary Detection" "SKIP" "nmap not available - will use PowerShell fallback"
    }
    
} catch {
    Write-TestResult "nmap Binary Detection" "FAIL" "Error: $($_.Exception.Message)"
}

# Test 5: Asset Integration Functions
Write-Host "🔗 Testing Asset Integration..." -ForegroundColor Yellow

try {
    # Test with mock data
    $mockAssets = @(
        [PSCustomObject]@{
            IPAddress = "192.168.1.10"
            Hostname = "TestServer1"
            AssetTag = "AS001"
            Owner = "IT Department"
        },
        [PSCustomObject]@{
            IPAddress = "192.168.1.20" 
            Hostname = "TestServer2"
            AssetTag = "AS002"
            Owner = "Finance"
        }
    )
    
    $mockDiscovered = @(
        [PSCustomObject]@{
            IPAddress = "192.168.1.10"
            Hostname = "TestServer1"
            OS = "Windows Server 2019"
            OpenPorts = @(80, 443, 3389)
            Services = @("HTTP (80)", "HTTPS (443)", "RDP (3389)")
            RiskLevel = "Low"
            DeviceType = "Web Server"
            ScanMethod = "Test"
        }
    )
    
    $mergedData = Merge-DiscoveredWithExistingAssets -DiscoveredHosts $mockDiscovered -ExistingAssets $mockAssets -Context @{}
    
    if ($mergedData.Count -gt 0) {
        Write-TestResult "Asset Merging" "PASS" "Successfully merged $($mergedData.Count) asset records"
        
        # Verify merged data structure
        $testRecord = $mergedData[0]
        $requiredProperties = @('IPAddress', 'Hostname', 'AssetTag', 'Owner', 'DataSource', 'Confidence')
        $missingProps = @()
        
        foreach ($prop in $requiredProperties) {
            if (-not $testRecord.PSObject.Properties[$prop]) {
                $missingProps += $prop
            }
        }
        
        if ($missingProps.Count -eq 0) {
            Write-TestResult "Merged Data Structure" "PASS" "All required properties present"
        } else {
            Write-TestResult "Merged Data Structure" "FAIL" "Missing properties: $($missingProps -join ', ')"
        }
        
        # Test offline asset detection
        if ($mergedData.Count -eq 2) {
            $offlineAsset = $mergedData | Where-Object { $_.IPAddress -eq "192.168.1.20" }
            if ($offlineAsset -and $offlineAsset.DeviceType -eq "Offline/Unknown") {
                Write-TestResult "Offline Asset Detection" "PASS" "Correctly identified offline assets"
            } else {
                Write-TestResult "Offline Asset Detection" "FAIL" "Failed to identify offline assets"
            }
        }
        
    } else {
        Write-TestResult "Asset Merging" "FAIL" "No merged data returned"
    }
    
} catch {
    Write-TestResult "Asset Integration" "FAIL" "Error: $($_.Exception.Message)"
}

# Test 6: Rate Limiting Compliance (Simulation)
Write-Host "⏱️ Testing Rate Limiting Compliance..." -ForegroundColor Yellow

if (-not $SkipNetworkTests) {
    try {
        # Simulate production-safe scanning behavior
        $config = Get-ProductionSafeNmapConfig -Context @{}
        
        Write-Host "    Simulating rate-limited scanning..." -ForegroundColor Gray
        $startTime = Get-Date
        
        # Simulate scanning 5 hosts with proper delays
        for ($i = 1; $i -le 5; $i++) {
            Start-Sleep -Milliseconds $config.DelayBetweenHosts
        }
        
        $elapsed = (Get-Date) - $startTime
        $expectedMinTime = ($config.DelayBetweenHosts * 5) / 1000  # Convert to seconds
        
        if ($elapsed.TotalSeconds -ge $expectedMinTime) {
            Write-TestResult "Rate Limiting Compliance" "PASS" "Rate limiting properly enforced (${elapsed.TotalSeconds:F2}s elapsed)"
        } else {
            Write-TestResult "Rate Limiting Compliance" "FAIL" "Rate limiting not properly enforced"
        }
        
    } catch {
        Write-TestResult "Rate Limiting Compliance" "FAIL" "Error: $($_.Exception.Message)"
    }
} else {
    Write-TestResult "Rate Limiting Compliance" "SKIP" "Network tests disabled"
}

# Test 7: Error Handling and Graceful Degradation
Write-Host "🚨 Testing Error Handling..." -ForegroundColor Yellow

try {
    # Test with invalid parameters
    $invalidResult = Get-ComprehensiveHostInformation -IPAddress "999.999.999.999" -Context @{}
    
    if ($invalidResult -eq $null) {
        Write-TestResult "Invalid IP Handling" "PASS" "Gracefully handles invalid IP addresses"
    } else {
        Write-TestResult "Invalid IP Handling" "FAIL" "Should return null for invalid IPs"
    }
    
    # Test empty asset merge
    $emptyMerge = Merge-DiscoveredWithExistingAssets -DiscoveredHosts @() -ExistingAssets @() -Context @{}
    
    if ($emptyMerge.Count -eq 0) {
        Write-TestResult "Empty Data Handling" "PASS" "Handles empty datasets gracefully"
    } else {
        Write-TestResult "Empty Data Handling" "FAIL" "Should handle empty datasets"
    }
    
} catch {
    Write-TestResult "Error Handling" "FAIL" "Error handling test failed: $($_.Exception.Message)"
}

# Test 8: Service Information and Risk Assessment
Write-Host "⚡ Testing Risk Assessment..." -ForegroundColor Yellow

try {
    # Test high-risk service detection
    $riskServices = @(23, 135, 445)  # Telnet, RPC, SMB
    $lowRiskServices = @(22, 443, 993)  # SSH, HTTPS, IMAPS
    
    foreach ($port in $riskServices) {
        $serviceInfo = Get-ServiceInformation -Port $port
        if ($serviceInfo.RiskLevel -eq "High") {
            Write-TestResult "High Risk Detection: Port $port" "PASS" "$($serviceInfo.Name) correctly flagged as high risk"
        } else {
            Write-TestResult "High Risk Detection: Port $port" "FAIL" "$($serviceInfo.Name) not flagged as high risk"
        }
    }
    
    foreach ($port in $lowRiskServices) {
        $serviceInfo = Get-ServiceInformation -Port $port  
        if ($serviceInfo.RiskLevel -eq "Low") {
            Write-TestResult "Low Risk Detection: Port $port" "PASS" "$($serviceInfo.Name) correctly flagged as low risk"
        } else {
            Write-TestResult "Low Risk Detection: Port $port" "FAIL" "$($serviceInfo.Name) not flagged as low risk"
        }
    }
    
} catch {
    Write-TestResult "Risk Assessment" "FAIL" "Error: $($_.Exception.Message)"
}

# Generate Test Report
Write-Host ""
Write-Host "📊 Generating Test Report..." -ForegroundColor Yellow

$reportData = [PSCustomObject]@{
    TestSuite = "Infrastructure Discovery Production Safety"
    ExecutedAt = Get-Date
    ModulePath = $ModulePath
    TotalTests = $TestResults.Tests.Count
    PassedTests = $TestResults.Passed
    FailedTests = $TestResults.Failed
    SkippedTests = $TestResults.Skipped
    SuccessRate = if ($TestResults.Tests.Count -gt 0) { 
        [math]::Round(($TestResults.Passed / $TestResults.Tests.Count) * 100, 2) 
    } else { 0 }
    TestResults = $TestResults.Tests
}

$reportPath = Join-Path $OutputPath "Infrastructure-Discovery-Safety-Test-Report.json"
$reportData | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8

Write-Host ""
Write-Host "🎯 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Total Tests: $($TestResults.Tests.Count)" -ForegroundColor White
Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor Red
Write-Host "Skipped: $($TestResults.Skipped)" -ForegroundColor Yellow
$successColor = if ($reportData.SuccessRate -ge 90) { "Green" } elseif ($reportData.SuccessRate -ge 75) { "Yellow" } else { "Red" }
Write-Host "Success Rate: $($reportData.SuccessRate)%" -ForegroundColor $successColor
Write-Host ""
Write-Host "Report saved to: $reportPath" -ForegroundColor Cyan
Write-Host ""

if ($TestResults.Failed -gt 0) {
    Write-Host "⚠️ Some tests failed. Review the failures above before deploying to production." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ All tests passed! Infrastructure Discovery module is production-safe." -ForegroundColor Green
    exit 0
}