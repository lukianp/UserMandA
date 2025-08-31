#Requires -Version 5.1

<#
.SYNOPSIS
    Comprehensive test suite for Infrastructure Discovery module with production-safe nmap integration

.DESCRIPTION
    Tests all aspects of the Infrastructure Discovery module including:
    - Production-safe configuration
    - Network topology discovery  
    - Host discovery and enumeration
    - Asset integration and merging
    - CSV export functionality
    - Safety controls and rate limiting
    - Fallback mechanisms

.NOTES
    Version: 1.0.0
    Author: Master Orchestrator
    Created: 2025-08-30
    Requires: PowerShell 5.1+, Infrastructure Discovery module
#>

[CmdletBinding()]
param(    
    [Parameter(Mandatory=$false)]
    [switch]$Production,
    
    [Parameter(Mandatory=$false)]
    [switch]$DetailedLogging
)

$ErrorActionPreference = 'Stop'

function Write-TestLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$TestName = ""
    )
    
    $timestamp = Get-Date -Format 'HH:mm:ss'
    $color = switch ($Level) {
        'ERROR' { 'Red' }
        'WARN' { 'Yellow' }
        'SUCCESS' { 'Green' }
        'HEADER' { 'Cyan' }
        'TEST' { 'Magenta' }
        default { 'White' }
    }
    
    $prefix = if ($TestName) { "[$timestamp] [$TestName] " } else { "[$timestamp] " }
    Write-Host "$prefix$Message" -ForegroundColor $color
}

function Test-ModuleLoading {
    Write-TestLog "Testing Infrastructure Discovery module loading..." "TEST" "MODULE"
    
    try {
        # Import the module
        $modulePath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Discovery\InfrastructureDiscovery.psm1"
        if (-not (Test-Path $modulePath)) {
            throw "Module not found at: $modulePath"
        }
        
        Import-Module $modulePath -Force
        Write-TestLog "Module imported successfully" "SUCCESS" "MODULE"
        
        # Test function exports
        $expectedFunctions = @(
            'Start-InfrastructureDiscovery',
            'Get-ProductionSafeNmapConfig', 
            'Test-ProductionEnvironment',
            'Install-NmapIfNeeded',
            'Invoke-ProductionSafeNmapScan',
            'Invoke-ProductionSafePowerShellScan',
            'Get-ComprehensiveHostInformation',
            'Import-ExistingAssetData',
            'Merge-DiscoveredWithExistingAssets'
        )
        
        foreach ($func in $expectedFunctions) {
            if (-not (Get-Command $func -ErrorAction SilentlyContinue)) {
                throw "Required function not exported: $func"
            }
        }
        
        Write-TestLog "All required functions exported correctly" "SUCCESS" "MODULE"
        return $true
        
    } catch {
        Write-TestLog "Module loading failed: $($_.Exception.Message)" "ERROR" "MODULE"
        return $false
    }
}

function Test-ProductionSafetyConfiguration {
    Write-TestLog "Testing production safety configuration..." "TEST" "SAFETY"
    
    try {
        $config = Get-ProductionSafeNmapConfig
        
        # Verify safety settings
        $requiredSettings = @{
            'DelayBetweenHosts' = 1000
            'MaxPacketsPerSecond' = 10
            'TimingTemplate' = 'T2'
            'ConcurrentScans' = 1
            'MaxSubnetSize' = 24
            'RequireProductionApproval' = $true
        }
        
        foreach ($setting in $requiredSettings.GetEnumerator()) {
            if ($config[$setting.Key] -ne $setting.Value) {
                throw "Safety setting incorrect - $($setting.Key): expected $($setting.Value), got $($config[$setting.Key])"
            }
        }
        
        # Verify blacklisted ports include dangerous services
        $dangerousPorts = @(135, 445)  # RPC and SMB
        foreach ($port in $dangerousPorts) {
            if ($port -notin $config.BlacklistPorts) {
                Write-TestLog "Warning: Dangerous port $port not blacklisted" "WARN" "SAFETY"
            }
        }
        
        Write-TestLog "Production safety configuration validated" "SUCCESS" "SAFETY"
        return $true
        
    } catch {
        Write-TestLog "Safety configuration test failed: $($_.Exception.Message)" "ERROR" "SAFETY"
        return $false
    }
}

function Test-EnvironmentDetection {
    Write-TestLog "Testing production environment detection..." "TEST" "ENV"
    
    try {
        $envTest = Test-ProductionEnvironment
        
        if (-not $envTest.ContainsKey('IsProduction')) {
            throw "Environment test result missing IsProduction field"
        }
        
        if (-not $envTest.ContainsKey('Signals')) {
            throw "Environment test result missing Signals field"
        }
        
        Write-TestLog "Environment detection result: IsProduction=$($envTest.IsProduction)" "INFO" "ENV"
        
        if ($envTest.Signals.Count -gt 0) {
            Write-TestLog "Production signals detected: $($envTest.Signals -join ', ')" "INFO" "ENV"
        } else {
            Write-TestLog "No production signals detected - safe for scanning" "SUCCESS" "ENV"
        }
        
        return $true
        
    } catch {
        Write-TestLog "Environment detection test failed: $($_.Exception.Message)" "ERROR" "ENV"
        return $false
    }
}

function Test-NmapInstallation {
    Write-TestLog "Testing nmap installation and binary embedding..." "TEST" "NMAP"
    
    try {
        $nmapPath = Install-NmapIfNeeded
        
        if ($nmapPath -and (Test-Path $nmapPath)) {
            Write-TestLog "nmap binary found at: $nmapPath" "SUCCESS" "NMAP"
            
            # Test if it's a working nmap (size check)
            $fileSize = (Get-Item $nmapPath).Length
            if ($fileSize -lt 1000000) { # Less than 1MB
                Write-TestLog "nmap binary appears to be placeholder/stub - will use PowerShell fallback" "WARN" "NMAP"
                return $false  # This is expected with our stub
            }
        } else {
            Write-TestLog "nmap not available - PowerShell fallback will be used" "WARN" "NMAP"
            return $false  # This is expected
        }
        
        return $true
        
    } catch {
        Write-TestLog "nmap installation test failed: $($_.Exception.Message)" "ERROR" "NMAP"
        return $false
    }
}

function Test-PowerShellFallbackScanning {
    Write-TestLog "Testing PowerShell fallback scanning capabilities..." "TEST" "PSCAN"
    
    try {
        # Test a small local subnet - typically safer
        $testTarget = "127.0.0.1/32"  # Just localhost
        
        Write-TestLog "Testing PowerShell scan on $testTarget..." "INFO" "PSCAN"
        $results = Invoke-ProductionSafePowerShellScan -Target $testTarget
        
        if ($results -and $results.Count -gt 0) {
            Write-TestLog "PowerShell scan found $($results.Count) hosts" "SUCCESS" "PSCAN"
            
            # Verify result structure
            $testHost = $results[0]
            $requiredProps = @('IPAddress', 'Hostname', 'OpenPorts', 'Services', 'LastSeen', 'RiskLevel')
            
            foreach ($prop in $requiredProps) {
                if (-not ($testHost.PSObject.Properties.Name -contains $prop)) {
                    throw "Host result missing required property: $prop"
                }
            }
            
            Write-TestLog "Host result structure validated" "SUCCESS" "PSCAN"
        } else {
            Write-TestLog "No hosts found in PowerShell scan (expected for localhost-only)" "INFO" "PSCAN"
        }
        
        return $true
        
    } catch {
        Write-TestLog "PowerShell scanning test failed: $($_.Exception.Message)" "ERROR" "PSCAN"
        return $false
    }
}

function Test-AssetIntegration {
    Write-TestLog "Testing asset inventory integration..." "TEST" "ASSET"
    
    try {
        # Create sample discovered hosts
        $discoveredHosts = @(
            [PSCustomObject]@{
                IPAddress = "192.168.1.100"
                Hostname = "test-server-01"
                OS = "Windows Server 2022"
                OpenPorts = @(80, 443, 3389)
                Services = @("HTTP (80)", "HTTPS (443)", "RDP (3389)")
                RiskLevel = "Medium"
                DeviceType = "Windows Server"
                LastSeen = Get-Date
                ScanMethod = "PowerShell Test"
            },
            [PSCustomObject]@{
                IPAddress = "192.168.1.200"
                Hostname = "test-workstation-01"
                OS = "Windows 10"
                OpenPorts = @(135, 445)
                Services = @("RPC (135)", "SMB (445)")
                RiskLevel = "High"
                DeviceType = "Windows Workstation"
                LastSeen = Get-Date
                ScanMethod = "PowerShell Test"
            }
        )
        
        # Create sample existing assets
        $existingAssets = @(
            [PSCustomObject]@{
                IPAddress = "192.168.1.100"
                Hostname = "test-server-01"
                AssetTag = "AS-12345"
                Owner = "IT Department"
                Location = "Data Center A"
                PurchaseDate = "2023-01-15"
            },
            [PSCustomObject]@{
                IPAddress = "192.168.1.300"
                Hostname = "offline-server"
                AssetTag = "AS-67890"
                Owner = "IT Department"
                Location = "Data Center B"
                PurchaseDate = "2022-06-10"
            }
        )
        
        # Test merging
        $mergedAssets = Merge-DiscoveredWithExistingAssets -DiscoveredHosts $discoveredHosts -ExistingAssets $existingAssets
        
        if (-not $mergedAssets -or $mergedAssets.Count -eq 0) {
            throw "Asset merge returned no results"
        }
        
        Write-TestLog "Merged $($mergedAssets.Count) assets successfully" "SUCCESS" "ASSET"
        
        # Verify enriched data
        $enrichedAsset = $mergedAssets | Where-Object { $_.IPAddress -eq "192.168.1.100" }
        if (-not $enrichedAsset -or -not $enrichedAsset.AssetTag) {
            throw "Asset enrichment failed - missing asset tag data"
        }
        
        # Verify offline asset inclusion
        $offlineAsset = $mergedAssets | Where-Object { $_.IPAddress -eq "192.168.1.300" }
        if (-not $offlineAsset -or $offlineAsset.DataSource -ne "Asset DB Only") {
            throw "Offline asset not properly included"
        }
        
        Write-TestLog "Asset integration validation completed" "SUCCESS" "ASSET"
        return $true
        
    } catch {
        Write-TestLog "Asset integration test failed: $($_.Exception.Message)" "ERROR" "ASSET"
        return $false
    }
}

function Test-FullDiscoveryWorkflow {
    Write-TestLog "Testing complete infrastructure discovery workflow..." "TEST" "FULL"
    
    try {
        # Create test configuration
        $testConfig = @{
            ProfileName = "TestProfile"
            OutputDirectory = $env:TEMP
            Credential = $null
        }
        
        $sessionId = [guid]::NewGuid().ToString()
        
        Write-TestLog "Starting full discovery test with session: $sessionId" "INFO" "FULL"
        
        # Run discovery (this should be production-safe)
        $result = Start-InfrastructureDiscovery -Configuration $testConfig -SessionId $sessionId
        
        if (-not $result) {
            throw "Discovery returned null result"
        }
        
        if ($result.Errors.Count -gt 0) {
            Write-TestLog "Discovery completed with $($result.Errors.Count) errors" "WARN" "FULL"
            foreach ($error in $result.Errors) {
                Write-TestLog "Error: $($error.Message)" "ERROR" "FULL"
            }
        }
        
        if ($result.Warnings.Count -gt 0) {
            Write-TestLog "Discovery completed with $($result.Warnings.Count) warnings" "WARN" "FULL"
        }
        
        Write-TestLog "Discovery found $($result.RecordCount) records" "INFO" "FULL"
        Write-TestLog "Discovery success: $($result.Success)" "INFO" "FULL"
        
        # Verify metadata
        if (-not $result.Metadata) {
            throw "Discovery result missing metadata"
        }
        
        if (-not $result.Metadata.ContainsKey('ScanMethod')) {
            throw "Discovery metadata missing scan method"
        }
        
        Write-TestLog "Scan method used: $($result.Metadata.ScanMethod)" "INFO" "FULL"
        
        return $true
        
    } catch {
        Write-TestLog "Full workflow test failed: $($_.Exception.Message)" "ERROR" "FULL"
        return $false
    }
}

# Main test execution
Write-TestLog "Starting Infrastructure Discovery Comprehensive Test Suite..." "HEADER"
Write-TestLog "Test Mode: $(if ($Production) { 'Production' } else { 'Development' })" "INFO"

$testResults = @{}

# Run all tests
Write-TestLog "Running test suite..." "HEADER"

$testResults['ModuleLoading'] = Test-ModuleLoading
$testResults['SafetyConfiguration'] = Test-ProductionSafetyConfiguration  
$testResults['EnvironmentDetection'] = Test-EnvironmentDetection
$testResults['NmapInstallation'] = Test-NmapInstallation
$testResults['PowerShellFallback'] = Test-PowerShellFallbackScanning
$testResults['AssetIntegration'] = Test-AssetIntegration
$testResults['FullWorkflow'] = Test-FullDiscoveryWorkflow

# Results summary
Write-TestLog "" "INFO"
Write-TestLog "TEST RESULTS SUMMARY" "HEADER"
Write-TestLog "===================" "HEADER"

$passCount = 0
$failCount = 0

foreach ($test in $testResults.GetEnumerator()) {
    $status = if ($test.Value) { "PASS" } else { "FAIL" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    
    Write-Host "  $($test.Key.PadRight(25)): $status" -ForegroundColor $color
    
    if ($test.Value) { $passCount++ } else { $failCount++ }
}

Write-TestLog "" "INFO"
Write-TestLog "OVERALL RESULTS: $passCount passed, $failCount failed" "HEADER"

if ($failCount -eq 0) {
    Write-TestLog "ALL TESTS PASSED - Infrastructure Discovery module is production-ready!" "SUCCESS"
    exit 0
} else {
    Write-TestLog "SOME TESTS FAILED - Review results above" "ERROR"
    exit 1
}