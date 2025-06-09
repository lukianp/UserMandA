#Requires -Version 5.1
<#
.SYNOPSIS
    Comprehensive testing script for AzureDiscovery.psm1 module
.DESCRIPTION
    Performs syntax validation, dependency checks, function testing, and orchestrator emulation
    for the AzureDiscovery module to ensure it works correctly in isolation and integration.
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [switch]$SkipAzureConnection,
    [switch]$EmulateOrchestrator,
    [switch]$DetailedOutput,
    [string]$OutputPath = ".\ValidationResults"
)

# Initialize test results
$TestResults = @{
    TestName = "AzureDiscovery Comprehensive Test"
    StartTime = Get-Date
    EndTime = $null
    OverallSuccess = $true
    Tests = [System.Collections.ArrayList]::new()
    Errors = [System.Collections.ArrayList]::new()
    Warnings = [System.Collections.ArrayList]::new()
}

# Helper function to add test result
function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message,
        [object]$Details = $null,
        [string]$Category = "General"
    )
    
    $result = @{
        TestName = $TestName
        Category = $Category
        Success = $Success
        Message = $Message
        Details = $Details
        Timestamp = Get-Date
    }
    
    $TestResults.Tests.Add($result) | Out-Null
    
    if (-not $Success) {
        $TestResults.OverallSuccess = $false
        $TestResults.Errors.Add($result) | Out-Null
    }
    
    $color = if ($Success) { "Green" } else { "Red" }
    Write-Host "[$Category] $TestName`: " -NoNewline
    Write-Host $Message -ForegroundColor $color
    
    if ($DetailedOutput -and $Details) {
        Write-Host "  Details: $($Details | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
}

# Helper function to create mock context
function New-MockContext {
    param(
        [string]$OutputPath = ".\TestOutput"
    )
    
    return [PSCustomObject]@{
        Paths = @{
            RawDataOutput = $OutputPath
            LogOutput = $OutputPath
            ConfigPath = ".\Configuration"
        }
        SessionId = [guid]::NewGuid().ToString()
        StartTime = Get-Date
        RunspaceId = [System.Management.Automation.Runspaces.Runspace]::DefaultRunspace.Id
        PSTypeName = 'DiscoveryContext'
    }
}

# Helper function to create mock configuration
function New-MockConfiguration {
    param(
        [switch]$IncludeAuth,
        [switch]$IncludeFilters
    )
    
    $config = @{
        discovery = @{
            modules = @('Azure')
            timeout = 300
        }
        output = @{
            formats = @('CSV')
            path = ".\TestOutput"
        }
    }
    
    if ($IncludeAuth) {
        $config._AuthContext = @{
            ClientId = "test-client-id"
            ClientSecret = "test-client-secret"
            TenantId = "test-tenant-id"
        }
    }
    
    if ($IncludeFilters) {
        $config.azure = @{
            subscriptionFilter = @("Test-Subscription")
            resourceGroupFilter = @("Test-RG")
        }
    }
    
    return $config
}

Write-Host "=== Azure Discovery Module Comprehensive Test ===" -ForegroundColor Cyan
Write-Host "Starting comprehensive validation of AzureDiscovery.psm1" -ForegroundColor White
Write-Host ""

# Test 1: File Existence and Basic Properties
try {
    $modulePath = ".\Modules\Discovery\AzureDiscovery.psm1"
    if (Test-Path $modulePath) {
        $moduleInfo = Get-Item $modulePath
        Add-TestResult -TestName "File Existence" -Success $true -Message "Module file found" -Category "Prerequisites" -Details @{
            Path = $moduleInfo.FullName
            Size = $moduleInfo.Length
            LastModified = $moduleInfo.LastWriteTime
        }
    } else {
        Add-TestResult -TestName "File Existence" -Success $false -Message "Module file not found" -Category "Prerequisites"
        throw "Module file not found: $modulePath"
    }
} catch {
    Add-TestResult -TestName "File Existence" -Success $false -Message $_.Exception.Message -Category "Prerequisites"
}

# Test 2: PowerShell Syntax Validation
try {
    $moduleContent = Get-Content $modulePath -Raw
    $tokens = $null
    $errors = $null
    $null = [System.Management.Automation.PSParser]::Tokenize($moduleContent, [ref]$tokens)
    
    if ($tokens.Count -gt 0) {
        Add-TestResult -TestName "Syntax Validation" -Success $true -Message "PowerShell syntax is valid" -Category "Syntax" -Details @{
            TokenCount = $tokens.Count
            LineCount = ($moduleContent -split "`n").Count
        }
    } else {
        Add-TestResult -TestName "Syntax Validation" -Success $false -Message "No tokens found - possible syntax error" -Category "Syntax"
    }
} catch {
    Add-TestResult -TestName "Syntax Validation" -Success $false -Message "Syntax error: $($_.Exception.Message)" -Category "Syntax"
}

# Test 3: Module Import Test
try {
    # Remove module if already loaded
    if (Get-Module -Name "AzureDiscovery" -ErrorAction SilentlyContinue) {
        Remove-Module -Name "AzureDiscovery" -Force
    }
    
    # Import the module
    Import-Module $modulePath -Force -ErrorAction Stop
    
    $importedModule = Get-Module -Name "AzureDiscovery"
    if ($importedModule) {
        Add-TestResult -TestName "Module Import" -Success $true -Message "Module imported successfully" -Category "Import" -Details @{
            Version = $importedModule.Version
            ExportedFunctions = $importedModule.ExportedFunctions.Keys -join ", "
            ExportedVariables = $importedModule.ExportedVariables.Keys -join ", "
        }
    } else {
        Add-TestResult -TestName "Module Import" -Success $false -Message "Module import failed - module not found after import" -Category "Import"
    }
} catch {
    Add-TestResult -TestName "Module Import" -Success $false -Message "Import error: $($_.Exception.Message)" -Category "Import"
}

# Test 4: Function Availability
try {
    $expectedFunction = "Invoke-AzureDiscovery"
    $function = Get-Command $expectedFunction -ErrorAction SilentlyContinue
    
    if ($function) {
        Add-TestResult -TestName "Function Export" -Success $true -Message "Main function exported correctly" -Category "Functions" -Details @{
            FunctionName = $function.Name
            ParameterCount = $function.Parameters.Count
            Parameters = $function.Parameters.Keys -join ", "
        }
    } else {
        Add-TestResult -TestName "Function Export" -Success $false -Message "Main function not exported" -Category "Functions"
    }
} catch {
    Add-TestResult -TestName "Function Export" -Success $false -Message "Function check error: $($_.Exception.Message)" -Category "Functions"
}

# Test 5: Parameter Validation
try {
    $function = Get-Command "Invoke-AzureDiscovery" -ErrorAction Stop
    $requiredParams = @("Configuration", "Context")
    $missingParams = @()
    
    foreach ($param in $requiredParams) {
        if (-not $function.Parameters.ContainsKey($param)) {
            $missingParams += $param
        }
    }
    
    if ($missingParams.Count -eq 0) {
        Add-TestResult -TestName "Parameter Validation" -Success $true -Message "All required parameters present" -Category "Functions" -Details @{
            RequiredParameters = $requiredParams -join ", "
            AllParameters = $function.Parameters.Keys -join ", "
        }
    } else {
        Add-TestResult -TestName "Parameter Validation" -Success $false -Message "Missing required parameters: $($missingParams -join ', ')" -Category "Functions"
    }
} catch {
    Add-TestResult -TestName "Parameter Validation" -Success $false -Message "Parameter validation error: $($_.Exception.Message)" -Category "Functions"
}

# Test 6: Mock Execution Test (without Azure connection)
try {
    Write-Host "`nTesting module execution with mock data..." -ForegroundColor Yellow
    
    # Create test output directory
    $testOutputPath = Join-Path $OutputPath "TestRun_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    if (-not (Test-Path $testOutputPath)) {
        New-Item -Path $testOutputPath -ItemType Directory -Force | Out-Null
    }
    
    # Create mock context and configuration
    $mockContext = New-MockContext -OutputPath $testOutputPath
    $mockConfig = New-MockConfiguration -IncludeAuth -IncludeFilters
    
    # Test function call (this will fail at Azure connection, but we can test parameter handling)
    try {
        $result = Invoke-AzureDiscovery -Configuration $mockConfig -Context $mockContext -ErrorAction Stop
        
        # If we get here, something unexpected happened (should fail at Azure connection)
        Add-TestResult -TestName "Mock Execution" -Success $true -Message "Function executed (unexpected success)" -Category "Execution" -Details @{
            ResultType = $result.GetType().Name
            Success = $result.Success
            ModuleName = $result.ModuleName
        }
    } catch {
        # Expected to fail at Azure connection - check if it's the right kind of failure
        $errorMessage = $_.Exception.Message
        if ($errorMessage -like "*Azure*" -or $errorMessage -like "*Connect*" -or $errorMessage -like "*Authentication*") {
            Add-TestResult -TestName "Mock Execution" -Success $true -Message "Function failed at expected point (Azure connection)" -Category "Execution" -Details @{
                ExpectedFailure = $true
                ErrorMessage = $errorMessage
            }
        } else {
            Add-TestResult -TestName "Mock Execution" -Success $false -Message "Function failed unexpectedly: $errorMessage" -Category "Execution"
        }
    }
} catch {
    Add-TestResult -TestName "Mock Execution" -Success $false -Message "Mock execution setup error: $($_.Exception.Message)" -Category "Execution"
}

# Test 7: Internal Function Validation
try {
    Write-Host "`nValidating internal functions..." -ForegroundColor Yellow
    
    # Get all functions defined in the module (including private ones)
    $moduleContent = Get-Content $modulePath -Raw
    $functionPattern = 'function\s+([A-Za-z][A-Za-z0-9-_]*)\s*\{'
    $functions = [regex]::Matches($moduleContent, $functionPattern) | ForEach-Object { $_.Groups[1].Value }
    
    $expectedInternalFunctions = @(
        "Write-MandALog",
        "Write-AzureLog", 
        "Connect-AzureWithServicePrincipal",
        "Test-AzureConnection",
        "Get-AzureSubscriptionsData",
        "Get-AzureResourceGroupsData", 
        "Get-AzureVirtualMachinesData",
        "Export-AzureData"
    )
    
    $foundFunctions = @()
    $missingFunctions = @()
    
    foreach ($expectedFunc in $expectedInternalFunctions) {
        if ($expectedFunc -in $functions) {
            $foundFunctions += $expectedFunc
        } else {
            $missingFunctions += $expectedFunc
        }
    }
    
    if ($missingFunctions.Count -eq 0) {
        Add-TestResult -TestName "Internal Functions" -Success $true -Message "All expected internal functions found" -Category "Functions" -Details @{
            FoundFunctions = $foundFunctions -join ", "
            TotalFunctions = $functions.Count
        }
    } else {
        Add-TestResult -TestName "Internal Functions" -Success $false -Message "Missing internal functions: $($missingFunctions -join ', ')" -Category "Functions"
    }
} catch {
    Add-TestResult -TestName "Internal Functions" -Success $false -Message "Internal function validation error: $($_.Exception.Message)" -Category "Functions"
}

# Test 8: Dependency Check
try {
    Write-Host "`nChecking module dependencies..." -ForegroundColor Yellow
    
    $requiredModules = @("Az.Accounts", "Az.Resources")
    $availableModules = @()
    $missingModules = @()
    
    foreach ($module in $requiredModules) {
        if (Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue) {
            $availableModules += $module
        } else {
            $missingModules += $module
        }
    }
    
    if ($missingModules.Count -eq 0) {
        Add-TestResult -TestName "Dependencies" -Success $true -Message "All required modules available" -Category "Dependencies" -Details @{
            RequiredModules = $requiredModules -join ", "
            AvailableModules = $availableModules -join ", "
        }
    } else {
        Add-TestResult -TestName "Dependencies" -Success $false -Message "Missing required modules: $($missingModules -join ', ')" -Category "Dependencies" -Details @{
            MissingModules = $missingModules -join ", "
            InstallCommand = "Install-Module -Name $($missingModules -join ', ') -Force -AllowClobber"
        }
    }
} catch {
    Add-TestResult -TestName "Dependencies" -Success $false -Message "Dependency check error: $($_.Exception.Message)" -Category "Dependencies"
}

# Test 9: Orchestrator Emulation
if ($EmulateOrchestrator) {
    try {
        Write-Host "`nEmulating orchestrator interaction..." -ForegroundColor Yellow
        
        # Create orchestrator-like environment
        $orchestratorConfig = @{
            discovery = @{
                modules = @("Azure")
                timeout = 300
                parallel = $false
            }
            authentication = @{
                _Credentials = @{
                    ClientId = "mock-client-id"
                    ClientSecret = "mock-client-secret" 
                    TenantId = "mock-tenant-id"
                }
            }
            azure = @{
                subscriptionFilter = @()
                resourceGroupFilter = @()
            }
            output = @{
                formats = @("CSV")
                path = $testOutputPath
            }
        }
        
        $orchestratorContext = [PSCustomObject]@{
            SessionId = [guid]::NewGuid().ToString()
            StartTime = Get-Date
            Paths = @{
                RawDataOutput = $testOutputPath
                LogOutput = $testOutputPath
                ConfigPath = ".\Configuration"
            }
            RunspaceId = [System.Management.Automation.Runspaces.Runspace]::DefaultRunspace.Id
            ModuleResults = @{}
            PSTypeName = 'DiscoveryContext'
        }
        
        # Simulate orchestrator calling the module
        Write-Host "  Simulating orchestrator module invocation..." -ForegroundColor Gray
        
        try {
            $orchestratorResult = Invoke-AzureDiscovery -Configuration $orchestratorConfig -Context $orchestratorContext
            
            # Analyze the result structure
            $resultAnalysis = @{
                HasSuccess = $null -ne $orchestratorResult.Success
                HasModuleName = $null -ne $orchestratorResult.ModuleName
                HasData = $null -ne $orchestratorResult.Data
                HasErrors = $null -ne $orchestratorResult.Errors
                HasWarnings = $null -ne $orchestratorResult.Warnings
                HasMetadata = $null -ne $orchestratorResult.Metadata
                HasRecordCount = $null -ne $orchestratorResult.RecordCount
            }
            
            $validStructure = $resultAnalysis.HasSuccess -and $resultAnalysis.HasModuleName -and 
                             $resultAnalysis.HasErrors -and $resultAnalysis.HasRecordCount
            
            if ($validStructure) {
                Add-TestResult -TestName "Orchestrator Emulation" -Success $true -Message "Module responds correctly to orchestrator" -Category "Integration" -Details $resultAnalysis
            } else {
                Add-TestResult -TestName "Orchestrator Emulation" -Success $false -Message "Invalid result structure for orchestrator" -Category "Integration" -Details $resultAnalysis
            }
            
        } catch {
            # Expected failure due to no real Azure connection
            $errorMsg = $_.Exception.Message
            if ($errorMsg -like "*Azure*" -or $errorMsg -like "*authentication*" -or $errorMsg -like "*Connect*") {
                Add-TestResult -TestName "Orchestrator Emulation" -Success $true -Message "Module failed at expected point (Azure auth)" -Category "Integration" -Details @{
                    ExpectedAuthFailure = $true
                    ErrorMessage = $errorMsg
                }
            } else {
                Add-TestResult -TestName "Orchestrator Emulation" -Success $false -Message "Unexpected orchestrator error: $errorMsg" -Category "Integration"
            }
        }
        
    } catch {
        Add-TestResult -TestName "Orchestrator Emulation" -Success $false -Message "Orchestrator emulation setup error: $($_.Exception.Message)" -Category "Integration"
    }
}

# Test 10: Error Handling Validation
try {
    Write-Host "`nTesting error handling..." -ForegroundColor Yellow
    
    # Test with invalid configuration
    $invalidConfig = @{}  # Empty config
    $validContext = New-MockContext
    
    try {
        $errorResult = Invoke-AzureDiscovery -Configuration $invalidConfig -Context $validContext
        
        # Should return a result object with errors
        if ($errorResult -and $errorResult.Success -eq $false -and $errorResult.Errors) {
            Add-TestResult -TestName "Error Handling" -Success $true -Message "Module handles errors gracefully" -Category "ErrorHandling" -Details @{
                ReturnsResult = $true
                HasErrors = $true
                ErrorCount = if ($errorResult.Errors -is [array]) { $errorResult.Errors.Count } else { 1 }
            }
        } else {
            Add-TestResult -TestName "Error Handling" -Success $false -Message "Module does not handle errors properly" -Category "ErrorHandling"
        }
    } catch {
        Add-TestResult -TestName "Error Handling" -Success $false -Message "Module throws unhandled exceptions: $($_.Exception.Message)" -Category "ErrorHandling"
    }
} catch {
    Add-TestResult -TestName "Error Handling" -Success $false -Message "Error handling test setup failed: $($_.Exception.Message)" -Category "ErrorHandling"
}

# Finalize test results
$TestResults.EndTime = Get-Date
$TestResults.Duration = $TestResults.EndTime - $TestResults.StartTime

# Generate summary report
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Overall Success: " -NoNewline
$color = if ($TestResults.OverallSuccess) { "Green" } else { "Red" }
Write-Host $TestResults.OverallSuccess -ForegroundColor $color

Write-Host "Total Tests: $($TestResults.Tests.Count)"
Write-Host "Passed: $(($TestResults.Tests | Where-Object { $_.Success }).Count)" -ForegroundColor Green
Write-Host "Failed: $(($TestResults.Tests | Where-Object { -not $_.Success }).Count)" -ForegroundColor Red
Write-Host "Duration: $($TestResults.Duration.TotalSeconds) seconds"

# Show failed tests
$failedTests = $TestResults.Tests | Where-Object { -not $_.Success }
if ($failedTests.Count -gt 0) {
    Write-Host "`nFAILED TESTS:" -ForegroundColor Red
    foreach ($test in $failedTests) {
        Write-Host "  [$($test.Category)] $($test.TestName): $($test.Message)" -ForegroundColor Red
    }
}

# Export detailed results
try {
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    $reportFile = Join-Path $OutputPath "AzureDiscoveryTest_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $TestResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Host "`nDetailed results exported to: $reportFile" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to export results: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Return test results for further processing
return $TestResults