# Comprehensive Discovery Module Validation Script
# Tests all 47 modules registered in ModuleRegistry.json

param(
    [switch]$Detailed = $false,
    [switch]$CleanDataDir = $true
)

# Load module registry and test all discovery modules
$ErrorActionPreference = "Continue"
$ProgressPreference = "Continue"

# Initialize results tracking
$TestResults = @{
    Successful = @()
    NeedsAttention = @()
    Failed = @()
    OrphanedData = @()
}

function Write-TestStatus {
    param($Message, $Status = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Status) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Status] $Message" -ForegroundColor $color
}

function Test-DiscoveryModule {
    param(
        [string]$ModuleName,
        [hashtable]$ModuleConfig,
        [string]$ModulesPath = "C:\enterprisediscovery\Modules"
    )
    
    Write-TestStatus "Testing module: $ModuleName" "INFO"
    
    $result = [PSCustomObject]@{
        ModuleName = $ModuleName
        DisplayName = $ModuleConfig.displayName
        Category = $ModuleConfig.category
        Priority = $ModuleConfig.priority
        Enabled = $ModuleConfig.enabled
        ModuleExists = $false
        ModuleLoads = $false
        HasMainFunction = $false
        CSVCreated = $false
        CSVPath = ""
        DataCount = 0
        ExecutionTime = 0
        ErrorMessage = ""
        Status = "UNKNOWN"
    }
    
    try {
        # Check if module file exists
        $fullPath = Join-Path $ModulesPath $ModuleConfig.filePath
        $result.ModuleExists = Test-Path $fullPath
        
        if (-not $result.ModuleExists) {
            $result.Status = "FAILED"
            $result.ErrorMessage = "Module file not found: $fullPath"
            return $result
        }
        
        # Try to import the module
        $startTime = Get-Date
        try {
            Import-Module $fullPath -Force -ErrorAction Stop
            $result.ModuleLoads = $true
            Write-TestStatus "Module imported successfully" "SUCCESS"
        }
        catch {
            $result.Status = "FAILED"
            $result.ErrorMessage = "Module import failed: $($_.Exception.Message)"
            return $result
        }
        
        # Check for main discovery function
        $expectedFunctionName = "Invoke-$ModuleName"
        $moduleCommands = Get-Command -Module (Get-Item $fullPath).BaseName -ErrorAction SilentlyContinue
        $hasMainFunction = $moduleCommands | Where-Object { $_.Name -eq $expectedFunctionName }
        $result.HasMainFunction = $null -ne $hasMainFunction
        
        # Try to execute the discovery module
        if ($result.HasMainFunction) {
            Write-TestStatus "Executing discovery function: $expectedFunctionName" "INFO"
            
            try {
                # Execute with common parameters
                $discoveryResult = & $expectedFunctionName -CompanyName "TestCompany" -ErrorAction Stop
                
                $result.ExecutionTime = ((Get-Date) - $startTime).TotalSeconds
                
                # Check for CSV output
                $expectedCSVPath = "C:\discoverydata\ljpops\RawData\$ModuleName.csv"
                if (Test-Path $expectedCSVPath) {
                    $result.CSVCreated = $true
                    $result.CSVPath = $expectedCSVPath
                    
                    # Count data rows
                    $csvData = Import-Csv $expectedCSVPath -ErrorAction SilentlyContinue
                    $result.DataCount = if ($csvData) { $csvData.Count } else { 0 }
                    
                    Write-TestStatus "CSV created with $($result.DataCount) records" "SUCCESS"
                }
                
                $result.Status = "SUCCESS"
                
            }
            catch {
                # Try alternative function names
                $alternativeFunctions = @(
                    "Start-$ModuleName",
                    "Get-$ModuleName", 
                    "Discover-$ModuleName",
                    "Export-$ModuleName"
                )
                
                $executed = $false
                foreach ($altFunc in $alternativeFunctions) {
                    $altCommand = $moduleCommands | Where-Object { $_.Name -eq $altFunc }
                    if ($altCommand) {
                        try {
                            Write-TestStatus "Trying alternative function: $altFunc" "INFO"
                            & $altFunc -ErrorAction Stop
                            $executed = $true
                            $result.Status = "SUCCESS"
                            break
                        }
                        catch {
                            continue
                        }
                    }
                }
                
                if (-not $executed) {
                    $result.Status = "NEEDS_ATTENTION"
                    $result.ErrorMessage = "Execution failed: $($_.Exception.Message)"
                }
            }
        }
        else {
            $result.Status = "NEEDS_ATTENTION"
            $result.ErrorMessage = "Main function '$expectedFunctionName' not found. Available functions: $($moduleCommands.Name -join ', ')"
        }
        
    }
    catch {
        $result.Status = "FAILED"
        $result.ErrorMessage = "Unexpected error: $($_.Exception.Message)"
    }
    finally {
        # Clean up module import
        try {
            Remove-Module (Get-Item $fullPath).BaseName -Force -ErrorAction SilentlyContinue
        }
        catch { }
    }
    
    return $result
}

# Main execution
Write-TestStatus "Starting comprehensive discovery module validation" "INFO"

# Clean discovery data directory if requested
if ($CleanDataDir) {
    Write-TestStatus "Cleaning discovery data directory" "INFO"
    Get-ChildItem "C:\discoverydata\ljpops\RawData\*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force
}

# Load module registry
$registryPath = "C:\enterprisediscovery\Configuration\ModuleRegistry.json"
if (-not (Test-Path $registryPath)) {
    Write-TestStatus "Module registry not found: $registryPath" "ERROR"
    exit 1
}

$moduleRegistry = Get-Content $registryPath -Raw | ConvertFrom-Json
$enabledModules = $moduleRegistry.modules.PSObject.Properties | Where-Object { $_.Value.enabled -eq $true }

Write-TestStatus "Found $($enabledModules.Count) enabled modules to test" "INFO"

# Test each enabled module
$allResults = @()
foreach ($module in $enabledModules) {
    $moduleName = $module.Name
    $moduleConfig = $module.Value
    
    $result = Test-DiscoveryModule -ModuleName $moduleName -ModuleConfig $moduleConfig
    $allResults += $result
    
    # Categorize results
    switch ($result.Status) {
        "SUCCESS" { $TestResults.Successful += $result }
        "NEEDS_ATTENTION" { $TestResults.NeedsAttention += $result }
        "FAILED" { $TestResults.Failed += $result }
    }
    
    Write-TestStatus "Module ${moduleName}: $($result.Status)" $result.Status
    if ($result.ErrorMessage) {
        Write-TestStatus "  Error: $($result.ErrorMessage)" "ERROR"
    }
    if ($result.CSVCreated) {
        Write-TestStatus "  CSV: $($result.CSVPath) ($($result.DataCount) records)" "SUCCESS"
    }
    
    # Add delay between modules
    Start-Sleep -Seconds 2
}

# Check for orphaned CSV files
Write-TestStatus "Checking for orphaned CSV files" "INFO"
$csvFiles = Get-ChildItem "C:\discoverydata\ljpops\RawData\*.csv" -ErrorAction SilentlyContinue
$registeredModuleNames = $moduleRegistry.modules.PSObject.Properties.Name

foreach ($csvFile in $csvFiles) {
    $csvBaseName = [System.IO.Path]::GetFileNameWithoutExtension($csvFile.Name)
    if ($csvBaseName -notin $registeredModuleNames) {
        $TestResults.OrphanedData += $csvFile.FullName
        Write-TestStatus "Orphaned CSV file found: $($csvFile.FullName)" "WARNING"
    }
}

# Generate final report
Write-TestStatus "=== FINAL VALIDATION REPORT ===" "INFO"
Write-TestStatus "✅ SUCCESSFUL: $($TestResults.Successful.Count) modules" "SUCCESS"
Write-TestStatus "⚠️ NEEDS ATTENTION: $($TestResults.NeedsAttention.Count) modules" "WARNING"  
Write-TestStatus "❌ FAILED: $($TestResults.Failed.Count) modules" "ERROR"
Write-TestStatus "📊 ORPHANED DATA: $($TestResults.OrphanedData.Count) files" "WARNING"

# Detailed results if requested
if ($Detailed) {
    Write-TestStatus "`n=== DETAILED RESULTS ===" "INFO"
    
    if ($TestResults.Successful.Count -gt 0) {
        Write-TestStatus "`n✅ SUCCESSFUL MODULES:" "SUCCESS"
        foreach ($result in $TestResults.Successful) {
            Write-TestStatus "  $($result.ModuleName) - $($result.DisplayName)" "SUCCESS"
            Write-TestStatus "    Category: $($result.Category), Priority: $($result.Priority)" "INFO"
            Write-TestStatus "    Execution Time: $($result.ExecutionTime)s, Data Records: $($result.DataCount)" "INFO"
        }
    }
    
    if ($TestResults.NeedsAttention.Count -gt 0) {
        Write-TestStatus "`n⚠️ MODULES NEEDING ATTENTION:" "WARNING"
        foreach ($result in $TestResults.NeedsAttention) {
            Write-TestStatus "  $($result.ModuleName) - $($result.DisplayName)" "WARNING"
            Write-TestStatus "    Error: $($result.ErrorMessage)" "WARNING"
        }
    }
    
    if ($TestResults.Failed.Count -gt 0) {
        Write-TestStatus "`n❌ FAILED MODULES:" "ERROR"
        foreach ($result in $TestResults.Failed) {
            Write-TestStatus "  $($result.ModuleName) - $($result.DisplayName)" "ERROR"
            Write-TestStatus "    Error: $($result.ErrorMessage)" "ERROR"
        }
    }
    
    if ($TestResults.OrphanedData.Count -gt 0) {
        Write-TestStatus "`n📊 ORPHANED DATA FILES:" "WARNING"
        foreach ($orphan in $TestResults.OrphanedData) {
            Write-TestStatus "  $orphan" "WARNING"
        }
    }
}

# Export detailed results
$reportPath = "C:\enterprisediscovery\Discovery_Module_Validation_Report.json"
$fullReport = @{
    TestTimestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Summary = @{
        TotalModulesTested = $allResults.Count
        Successful = $TestResults.Successful.Count
        NeedsAttention = $TestResults.NeedsAttention.Count
        Failed = $TestResults.Failed.Count
        OrphanedFiles = $TestResults.OrphanedData.Count
    }
    DetailedResults = $allResults
    OrphanedData = $TestResults.OrphanedData
}

$fullReport | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
Write-TestStatus "Detailed report saved to: $reportPath" "INFO"

# Return summary for use in other scripts
return @{
    Summary = $fullReport.Summary
    AllResults = $allResults
    TestResults = $TestResults
}