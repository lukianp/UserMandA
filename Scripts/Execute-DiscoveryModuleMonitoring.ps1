# Comprehensive Discovery Module Monitoring with Real-Time Output Tracking
# Systematic testing of each discovery module's integration with orchestrator

param(
    [switch]$DetailedOutput = $true,
    [switch]$ExportResults = $true
)

# Initialize logging
$LogPath = "Logs"
if (-not (Test-Path $LogPath)) { New-Item -Path $LogPath -ItemType Directory -Force | Out-Null }
$LogFile = Join-Path $LogPath "DiscoveryModuleMonitoring_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

function Write-MonitorLog {
    param([string]$Message, [string]$Level = "INFO", [ConsoleColor]$Color = "Gray")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Write to console with color
    Write-Host $logEntry -ForegroundColor $Color
    
    # Write to log file
    $logEntry | Out-File -FilePath $LogFile -Append -Encoding UTF8
}

Write-MonitorLog "=== DISCOVERY MODULE COMPREHENSIVE MONITORING ===" "HEADER" "Cyan"
Write-MonitorLog "Starting systematic testing of discovery module ecosystem" "INFO" "Gray"
Write-MonitorLog "Log file: $LogFile" "INFO" "Gray"
Write-MonitorLog "" "INFO" "Gray"

# Get all discovery modules
$discoveryPath = "Modules\Discovery"
$discoveryModules = Get-ChildItem $discoveryPath -Filter "*.psm1" | Where-Object { $_.Name -notlike "*.bak*" }

Write-MonitorLog "Found $($discoveryModules.Count) discovery modules to test:" "INFO" "Green"
foreach ($module in $discoveryModules) {
    Write-MonitorLog "  - $($module.Name) ($([math]::Round($module.Length/1KB, 1)) KB)" "INFO" "Gray"
}
Write-MonitorLog "" "INFO" "Gray"

# Initialize test results
$testResults = @()
$startTime = Get-Date

# Test each discovery module
foreach ($module in $discoveryModules) {
    $moduleName = $module.BaseName
    Write-MonitorLog "Testing module: $moduleName" "HEADER" "Yellow"
    
    $moduleResult = @{
        ModuleName = $moduleName
        FilePath = $module.FullName
        FileSize = $module.Length
        ImportStatus = "UNKNOWN"
        HasInvokeDiscovery = $false
        HasGetDiscoveryInfo = $false
        FunctionCount = 0
        ExportedFunctions = @()
        Dependencies = @()
        ErrorMessages = @()
        TestDuration = [timespan]::Zero
        OverallStatus = "UNKNOWN"
    }
    
    $moduleStartTime = Get-Date
    
    try {
        # Test module import
        Write-MonitorLog "  Importing module..." "INFO" "Gray"
        Import-Module $module.FullName -Force -DisableNameChecking -ErrorAction Stop
        $moduleResult.ImportStatus = "SUCCESS"
        Write-MonitorLog "  ✓ Module imported successfully" "SUCCESS" "Green"
        
        # Get all exported functions
        $exportedCommands = Get-Command -Module $moduleName -ErrorAction SilentlyContinue
        $moduleResult.FunctionCount = $exportedCommands.Count
        $moduleResult.ExportedFunctions = $exportedCommands.Name
        
        Write-MonitorLog "  Found $($exportedCommands.Count) exported functions" "INFO" "Gray"
        if ($DetailedOutput -and $exportedCommands.Count -gt 0) {
            foreach ($cmd in $exportedCommands) {
                Write-MonitorLog "    - $($cmd.Name)" "INFO" "DarkGray"
            }
        }
        
        # Test for required orchestrator interface functions
        Write-MonitorLog "  Testing orchestrator interface..." "INFO" "Gray"
        
        $invokeDiscovery = Get-Command "Invoke-Discovery" -ErrorAction SilentlyContinue
        $getDiscoveryInfo = Get-Command "Get-DiscoveryInfo" -ErrorAction SilentlyContinue
        
        $moduleResult.HasInvokeDiscovery = $null -ne $invokeDiscovery
        $moduleResult.HasGetDiscoveryInfo = $null -ne $getDiscoveryInfo
        
        if ($moduleResult.HasInvokeDiscovery -and $moduleResult.HasGetDiscoveryInfo) {
            Write-MonitorLog "  ✓ All required functions available (Invoke-Discovery, Get-DiscoveryInfo)" "SUCCESS" "Green"
            $moduleResult.OverallStatus = "READY"
        } elseif ($moduleResult.HasInvokeDiscovery) {
            Write-MonitorLog "  ⚠ Partial interface - has Invoke-Discovery but missing Get-DiscoveryInfo" "WARN" "Yellow"
            $moduleResult.OverallStatus = "PARTIAL"
        } else {
            Write-MonitorLog "  ✗ Missing required orchestrator interface functions" "ERROR" "Red"
            $moduleResult.OverallStatus = "NOT_READY"
        }
        
        # Test Get-DiscoveryInfo if available
        if ($moduleResult.HasGetDiscoveryInfo) {
            try {
                Write-MonitorLog "  Testing Get-DiscoveryInfo..." "INFO" "Gray"
                $discoveryInfo = Get-DiscoveryInfo
                if ($discoveryInfo) {
                    Write-MonitorLog "  ✓ Module info: $($discoveryInfo.Name) v$($discoveryInfo.Version)" "SUCCESS" "Green"
                    Write-MonitorLog "    Description: $($discoveryInfo.Description)" "INFO" "Gray"
                    Write-MonitorLog "    Author: $($discoveryInfo.Author)" "INFO" "Gray"
                }
            } catch {
                Write-MonitorLog "  ⚠ Get-DiscoveryInfo error: $($_.Exception.Message)" "WARN" "Yellow"
                $moduleResult.ErrorMessages += "Get-DiscoveryInfo: $($_.Exception.Message)"
            }
        }
        
        # Test Invoke-Discovery with mock context if available
        if ($moduleResult.HasInvokeDiscovery) {
            try {
                Write-MonitorLog "  Testing Invoke-Discovery with mock context..." "INFO" "Gray"
                $mockContext = @{
                    Config = @{ discovery = @{ timeout = 30; batchSize = 100 } }
                    Paths = @{ Output = "TestOutput"; Logs = "TestLogs" }
                }
                
                # This is just a validation test - we don't expect it to succeed in test environment
                $discoveryResult = Invoke-Discovery -Context $mockContext -ErrorAction SilentlyContinue
                if ($discoveryResult) {
                    Write-MonitorLog "  ✓ Invoke-Discovery executed (returned result)" "SUCCESS" "Green"
                } else {
                    Write-MonitorLog "  ⚠ Invoke-Discovery executed but returned no result (expected in test environment)" "WARN" "Yellow"
                }
            } catch {
                Write-MonitorLog "  ⚠ Invoke-Discovery test error: $($_.Exception.Message)" "WARN" "Yellow"
                $moduleResult.ErrorMessages += "Invoke-Discovery: $($_.Exception.Message)"
            }
        }
        
        # Analyze module dependencies
        Write-MonitorLog "  Analyzing module dependencies..." "INFO" "Gray"
        try {
            $moduleContent = Get-Content $module.FullName -Raw
            $importMatches = [regex]::Matches($moduleContent, 'Import-Module\s+[''"]([^''"]+)[''"]')
            foreach ($match in $importMatches) {
                $moduleResult.Dependencies += $match.Groups[1].Value
            }
            
            if ($moduleResult.Dependencies.Count -gt 0) {
                Write-MonitorLog "  Dependencies found: $($moduleResult.Dependencies -join ', ')" "INFO" "Gray"
            } else {
                Write-MonitorLog "  No explicit module dependencies found" "INFO" "Gray"
            }
        } catch {
            Write-MonitorLog "  ⚠ Dependency analysis error: $($_.Exception.Message)" "WARN" "Yellow"
        }
        
    } catch {
        Write-MonitorLog "  ✗ Module import failed: $($_.Exception.Message)" "ERROR" "Red"
        $moduleResult.ImportStatus = "FAILED"
        $moduleResult.OverallStatus = "IMPORT_FAILED"
        $moduleResult.ErrorMessages += "Import: $($_.Exception.Message)"
    }
    
    $moduleResult.TestDuration = (Get-Date) - $moduleStartTime
    $testResults += $moduleResult
    
    Write-MonitorLog "  Module test completed in $($moduleResult.TestDuration.TotalSeconds.ToString('F2')) seconds" "INFO" "Gray"
    Write-MonitorLog "  Overall Status: $($moduleResult.OverallStatus)" "INFO" $(
        switch ($moduleResult.OverallStatus) {
            "READY" { "Green" }
            "PARTIAL" { "Yellow" }
            default { "Red" }
        }
    )
    Write-MonitorLog "" "INFO" "Gray"
}

# Generate comprehensive summary
$totalDuration = (Get-Date) - $startTime
Write-MonitorLog "=== COMPREHENSIVE MONITORING SUMMARY ===" "HEADER" "Cyan"
Write-MonitorLog "Total testing duration: $($totalDuration.TotalSeconds.ToString('F2')) seconds" "INFO" "Gray"
Write-MonitorLog "" "INFO" "Gray"

# Calculate statistics
$readyModules = $testResults | Where-Object { $_.OverallStatus -eq "READY" }
$partialModules = $testResults | Where-Object { $_.OverallStatus -eq "PARTIAL" }
$notReadyModules = $testResults | Where-Object { $_.OverallStatus -eq "NOT_READY" }
$failedModules = $testResults | Where-Object { $_.OverallStatus -eq "IMPORT_FAILED" }

Write-MonitorLog "DISCOVERY MODULE STATUS BREAKDOWN:" "INFO" "White"
Write-MonitorLog "  Total modules tested: $($testResults.Count)" "INFO" "White"
Write-MonitorLog "  Ready for orchestrator: $($readyModules.Count)" "SUCCESS" "Green"
Write-MonitorLog "  Partially ready: $($partialModules.Count)" "WARN" "Yellow"
Write-MonitorLog "  Not ready: $($notReadyModules.Count)" "ERROR" "Red"
Write-MonitorLog "  Import failed: $($failedModules.Count)" "ERROR" "Red"
Write-MonitorLog "" "INFO" "Gray"

# Detailed status for each category
if ($readyModules.Count -gt 0) {
    Write-MonitorLog "READY MODULES (Full orchestrator compatibility):" "SUCCESS" "Green"
    foreach ($module in $readyModules) {
        Write-MonitorLog "  ✓ $($module.ModuleName) - $($module.FunctionCount) functions" "SUCCESS" "Green"
    }
    Write-MonitorLog "" "INFO" "Gray"
}

if ($partialModules.Count -gt 0) {
    Write-MonitorLog "PARTIAL MODULES (Missing Get-DiscoveryInfo):" "WARN" "Yellow"
    foreach ($module in $partialModules) {
        Write-MonitorLog "  ⚠ $($module.ModuleName) - $($module.FunctionCount) functions" "WARN" "Yellow"
    }
    Write-MonitorLog "" "INFO" "Gray"
}

if ($notReadyModules.Count -gt 0) {
    Write-MonitorLog "NOT READY MODULES (Missing orchestrator interface):" "ERROR" "Red"
    foreach ($module in $notReadyModules) {
        Write-MonitorLog "  ✗ $($module.ModuleName) - $($module.FunctionCount) functions" "ERROR" "Red"
    }
    Write-MonitorLog "" "INFO" "Gray"
}

if ($failedModules.Count -gt 0) {
    Write-MonitorLog "FAILED MODULES (Import errors):" "ERROR" "Red"
    foreach ($module in $failedModules) {
        Write-MonitorLog "  ✗ $($module.ModuleName) - Import failed" "ERROR" "Red"
        foreach ($error in $module.ErrorMessages) {
            Write-MonitorLog "    Error: $error" "ERROR" "Red"
        }
    }
    Write-MonitorLog "" "INFO" "Gray"
}

# Overall assessment
Write-MonitorLog "ORCHESTRATOR READINESS ASSESSMENT:" "HEADER" "Cyan"
$readyPercentage = [math]::Round(($readyModules.Count / $testResults.Count) * 100, 1)
$functionalPercentage = [math]::Round((($readyModules.Count + $partialModules.Count) / $testResults.Count) * 100, 1)

Write-MonitorLog "  Fully ready: $readyPercentage% ($($readyModules.Count)/$($testResults.Count))" "INFO" "White"
Write-MonitorLog "  Functionally ready: $functionalPercentage% ($($readyModules.Count + $partialModules.Count)/$($testResults.Count))" "INFO" "White"

if ($readyModules.Count -eq $testResults.Count) {
    Write-MonitorLog "" "INFO" "Gray"
    Write-MonitorLog "🎯 ALL DISCOVERY MODULES ARE ORCHESTRATOR-READY!" "SUCCESS" "Green"
    Write-MonitorLog "   Complete orchestrator integration achieved" "SUCCESS" "Green"
} elseif ($functionalPercentage -ge 80) {
    Write-MonitorLog "" "INFO" "Gray"
    Write-MonitorLog "⚠️ DISCOVERY MODULES MOSTLY READY FOR ORCHESTRATOR" "WARN" "Yellow"
    Write-MonitorLog "   Some modules missing Get-DiscoveryInfo but have core functionality" "WARN" "Yellow"
} else {
    Write-MonitorLog "" "INFO" "Gray"
    Write-MonitorLog "❌ DISCOVERY MODULES NEED SIGNIFICANT WORK FOR ORCHESTRATOR" "ERROR" "Red"
    Write-MonitorLog "   Multiple modules require interface implementation" "ERROR" "Red"
}

# Export results if requested
if ($ExportResults) {
    $resultsPath = Join-Path $LogPath "DiscoveryModuleResults_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $exportData = @{
        Timestamp = Get-Date
        TestDuration = $totalDuration
        Summary = @{
            TotalModules = $testResults.Count
            ReadyModules = $readyModules.Count
            PartialModules = $partialModules.Count
            NotReadyModules = $notReadyModules.Count
            FailedModules = $failedModules.Count
            ReadyPercentage = $readyPercentage
            FunctionalPercentage = $functionalPercentage
        }
        DetailedResults = $testResults
    }
    
    $exportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsPath -Encoding UTF8
    Write-MonitorLog "" "INFO" "Gray"
    Write-MonitorLog "Results exported to: $resultsPath" "SUCCESS" "Green"
}

Write-MonitorLog "" "INFO" "Gray"
Write-MonitorLog "=== MONITORING COMPLETE ===" "HEADER" "Cyan"
Write-MonitorLog "Log file saved: $LogFile" "INFO" "Gray"

# Return appropriate exit code
if ($failedModules.Count -eq 0 -and $notReadyModules.Count -eq 0) {
    exit 0  # Success
} elseif ($functionalPercentage -ge 80) {
    exit 1  # Mostly functional
} else {
    exit 2  # Needs work
}