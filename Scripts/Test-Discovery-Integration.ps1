# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Test Discovery Module Integration with Orchestrator
.DESCRIPTION
    Comprehensive test to verify all discovery modules work with the orchestrator
#>

Write-Host "=== TESTING DISCOVERY MODULE INTEGRATION ===" -ForegroundColor Cyan
Write-Host ""

# Define DiscoveryResult class for testing
if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
    Add-Type -TypeDefinition @'
public class DiscoveryResult {
    public bool Success { get; set; }
    public string ModuleName { get; set; }
    public object Data { get; set; }
    public System.Collections.ArrayList Errors { get; set; }
    public System.Collections.ArrayList Warnings { get; set; }
    public System.Collections.Hashtable Metadata { get; set; }
    public System.DateTime StartTime { get; set; }
    public System.DateTime EndTime { get; set; }
    public string ExecutionId { get; set; }
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
    }
    
    public void AddError(string message, System.Exception exception) {
        var errorEntry = new System.Collections.Hashtable();
        errorEntry["Timestamp"] = System.DateTime.Now;
        errorEntry["Message"] = message;
        errorEntry["Exception"] = exception != null ? exception.ToString() : null;
        this.Errors.Add(errorEntry);
        this.Success = false;
    }
    
    public void Complete() {
        this.EndTime = System.DateTime.Now;
        if (this.StartTime != null && this.EndTime != null) {
            var duration = this.EndTime - this.StartTime;
            this.Metadata["Duration"] = duration;
        }
    }
}
'@ -Language CSharp
}

# Get all discovery modules
$discoveryModules = Get-ChildItem "Modules\Discovery\*.psm1" | Where-Object { 
    $_.Name -notlike "*backup*" -and $_.Name -notlike "*bak*" 
}

Write-Host "Found $($discoveryModules.Count) discovery modules to test:" -ForegroundColor Green
$discoveryModules | ForEach-Object { Write-Host "  - $($_.BaseName)" -ForegroundColor Gray }
Write-Host ""

# Test results
$testResults = @()
$successCount = 0
$errorCount = 0

# Mock configuration and context
$mockConfig = @{
    environment = @{
        outputPath = "C:\temp\test"
        domainController = "localhost"
    }
    discovery = @{
        enabledSources = @()
        batchSize = 100
    }
}

$mockContext = @{
    Paths = @{
        RawDataOutput = "C:\temp\test\Raw"
        ProcessedDataOutput = "C:\temp\test\Processed"
    }
    ErrorCollector = @{
        AddError = { param($s,$m,$e) Write-Warning "Error: $m" }
        AddWarning = { param($s,$m) Write-Warning "Warning: $m" }
    }
}

foreach ($moduleFile in $discoveryModules) {
    $moduleName = $moduleFile.BaseName -replace 'Discovery$', ''
    $expectedFunction = "Invoke-${moduleName}Discovery"
    
    Write-Host "Testing: $($moduleFile.BaseName)" -ForegroundColor Yellow
    
    $testResult = @{
        ModuleName = $moduleName
        ModuleFile = $moduleFile.Name
        LoadsSuccessfully = $false
        HasExpectedFunction = $false
        FunctionExecutes = $false
        ReturnsDiscoveryResult = $false
        Error = $null
    }
    
    try {
        # Test 1: Module loads successfully
        Import-Module $moduleFile.FullName -Force -ErrorAction Stop
        $testResult.LoadsSuccessfully = $true
        Write-Host "  ✓ Module loads successfully" -ForegroundColor Green
        
        # Test 2: Expected function exists
        $function = Get-Command $expectedFunction -ErrorAction SilentlyContinue
        if ($function) {
            $testResult.HasExpectedFunction = $true
            Write-Host "  ✓ Has $expectedFunction function" -ForegroundColor Green
            
            # Test 3: Function executes without error
            try {
                $result = & $expectedFunction -Configuration $mockConfig -Context $mockContext
                $testResult.FunctionExecutes = $true
                Write-Host "  ✓ Function executes without error" -ForegroundColor Green
                
                # Test 4: Returns DiscoveryResult object
                if ($result -is [DiscoveryResult]) {
                    $testResult.ReturnsDiscoveryResult = $true
                    Write-Host "  ✓ Returns DiscoveryResult object" -ForegroundColor Green
                    Write-Host "    - Success: $($result.Success)" -ForegroundColor Gray
                    Write-Host "    - Module: $($result.ModuleName)" -ForegroundColor Gray
                    Write-Host "    - Errors: $($result.Errors.Count)" -ForegroundColor Gray
                } else {
                    Write-Host "  ⚠ Returns: $($result.GetType().Name) (expected DiscoveryResult)" -ForegroundColor Yellow
                }
                
            } catch {
                $testResult.Error = $_.Exception.Message
                Write-Host "  ✗ Function execution failed: $($_.Exception.Message)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "  ✗ Missing $expectedFunction function" -ForegroundColor Red
        }
        
        # Remove module to avoid conflicts
        Remove-Module $moduleFile.BaseName -Force -ErrorAction SilentlyContinue
        
    } catch {
        $testResult.Error = $_.Exception.Message
        Write-Host "  ✗ Module load failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Determine overall success
    $isSuccess = $testResult.LoadsSuccessfully -and 
                 $testResult.HasExpectedFunction -and 
                 $testResult.FunctionExecutes -and 
                 $testResult.ReturnsDiscoveryResult
    
    if ($isSuccess) {
        $successCount++
        Write-Host "  🎉 INTEGRATION SUCCESS" -ForegroundColor Green
    } else {
        $errorCount++
        Write-Host "  ❌ INTEGRATION FAILED" -ForegroundColor Red
    }
    
    $testResults += $testResult
    Write-Host ""
}

# Summary
Write-Host "=== INTEGRATION TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Modules: $($discoveryModules.Count)" -ForegroundColor White
Write-Host "Successfully Integrated: $successCount" -ForegroundColor Green
Write-Host "Failed Integration: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Success rate
$successRate = [Math]::Round(($successCount / $discoveryModules.Count) * 100, 1)
Write-Host "Integration Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($successCount -eq $discoveryModules.Count) {
    Write-Host "🎉 100% DISCOVERY MODULE INTEGRATION SUCCESS! 🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "All discovery modules are ready for orchestrator execution!" -ForegroundColor Green
} else {
    Write-Host "❌ Some modules need attention:" -ForegroundColor Red
    $failedModules = $testResults | Where-Object { -not ($_.LoadsSuccessfully -and $_.HasExpectedFunction -and $_.FunctionExecutes -and $_.ReturnsDiscoveryResult) }
    foreach ($failed in $failedModules) {
        Write-Host "  - $($failed.ModuleName): $($failed.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Run the full orchestrator with discovery modules" -ForegroundColor White
Write-Host "2. Monitor execution and data output" -ForegroundColor White
Write-Host "3. Verify all modules complete successfully" -ForegroundColor White

return $testResults