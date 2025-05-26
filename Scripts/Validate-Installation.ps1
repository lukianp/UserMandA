<#
.SYNOPSIS
    Installation validation script for M&A Discovery Suite
.DESCRIPTION
    Validates the complete M&A Discovery Suite installation and prerequisites
.EXAMPLE
    .\Validate-Installation.ps1
#>

[CmdletBinding()]
param()

# Get the script root directory for location-independent paths
$script:SuiteRoot = Split-Path $PSScriptRoot -Parent

function Write-ValidationResult {
    param(
        [string]$Test,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    $status = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "$status - $Test" -ForegroundColor $color
    if ($Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
}

function Test-ModuleStructure {
    Write-Host "`nTesting Module Structure..." -ForegroundColor Cyan
    
    $requiredModules = @(
        "Modules/Authentication/Authentication.psm1",
        "Modules/Authentication/CredentialManagement.psm1",
        "Modules/Connectivity/ConnectionManager.psm1",
        "Modules/Discovery/ActiveDirectoryDiscovery.psm1",
        "Modules/Discovery/GraphDiscovery.psm1",
        "Modules/Processing/DataAggregation.psm1",
        "Modules/Processing/UserProfileBuilder.psm1",
        "Modules/Processing/WaveGeneration.psm1",
        "Modules/Processing/DataValidation.psm1",
        "Modules/Export/CSVExport.psm1",
        "Modules/Export/JSONExport.psm1",
        "Modules/Utilities/Logging.psm1",
        "Modules/Utilities/ErrorHandling.psm1",
        "Modules/Utilities/ValidationHelpers.psm1",
        "Modules/Utilities/ProgressTracking.psm1",
        "Modules/Utilities/FileOperations.psm1"
    )
    
    $allModulesExist = $true
    foreach ($module in $requiredModules) {
        $modulePath = Join-Path $script:SuiteRoot $module
        $exists = Test-Path $modulePath
        Write-ValidationResult -Test "Module: $module" -Passed ([bool]$exists)
        if (-not $exists) { $allModulesExist = $false }
    }
    
    return $allModulesExist
}

function Test-CoreComponents {
    Write-Host "`nTesting Core Components..." -ForegroundColor Cyan
    
    $coreComponents = @(
        "Core/MandA-Orchestrator.ps1",
        "Configuration/default-config.json",
        "Scripts/QuickStart.ps1",
        "README.md"
    )
    
    $allCoreExist = $true
    foreach ($component in $coreComponents) {
        $componentPath = Join-Path $script:SuiteRoot $component
        $exists = Test-Path $componentPath
        Write-ValidationResult -Test "Core: $component" -Passed ([bool]$exists)
        if (-not $exists) { $allCoreExist = $false }
    }
    
    return $allCoreExist
}

function Test-PowerShellVersion {
    Write-Host "`nTesting PowerShell Version..." -ForegroundColor Cyan
    
    $version = $PSVersionTable.PSVersion
    $isValid = $version.Major -ge 5
    
    Write-ValidationResult -Test "PowerShell Version" -Passed ([bool]$isValid) -Details "Version: $version (Required: 5.1+)"
    
    return $isValid
}

function Test-RequiredModules {
    Write-Host "`nTesting Required PowerShell Modules..." -ForegroundColor Cyan
    
    $requiredModules = @(
        @{ Name = "Microsoft.Graph"; Required = $true },
        @{ Name = "Microsoft.Graph.Authentication"; Required = $true },
        @{ Name = "ExchangeOnlineManagement"; Required = $true },
        @{ Name = "ActiveDirectory"; Required = $false },
        @{ Name = "ImportExcel"; Required = $false },
        @{ Name = "Az.Accounts"; Required = $false }
    )
    
    $criticalMissing = 0
    foreach ($module in $requiredModules) {
        try {
            $available = Get-Module -ListAvailable -Name $module.Name -ErrorAction SilentlyContinue
            $exists = $available -ne $null
            
            if ($module.Required -and -not $exists) {
                $criticalMissing++
                Write-Host "[$(Get-Date -Format 'HH:mm')] [ERROR] [Main] - Required module not installed: $($module.Name)" -ForegroundColor Red
            }
            
            $status = if ($module.Required) { "Required" } else { "Optional" }
            Write-ValidationResult -Test "$($module.Name) ($status)" -Passed ([bool]$exists)
        }
        catch {
            Write-ValidationResult -Test "$($module.Name) (Error)" -Passed ([bool]$false) -Details "Error checking module: $($_.Exception.Message)"
            if ($module.Required) {
                $criticalMissing++
            }
        }
    }
    
    return ($criticalMissing -eq 0)
}

function Test-NetworkConnectivity {
    Write-Host "`nTesting Network Connectivity..." -ForegroundColor Cyan
    
    $endpoints = @(
        @{ Name = "Microsoft Graph"; Host = "graph.microsoft.com"; Port = 443 },
        @{ Name = "Azure AD"; Host = "login.microsoftonline.com"; Port = 443 },
        @{ Name = "Exchange Online"; Host = "outlook.office365.com"; Port = 443 }
    )
    
    $allConnected = $true
    foreach ($endpoint in $endpoints) {
        try {
            $result = Test-NetConnection -ComputerName $endpoint.Host -Port $endpoint.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction Stop
            $connected = [bool]$result.TcpTestSucceeded
            Write-ValidationResult -Test "Connectivity: $($endpoint.Name)" -Passed ([bool]$connected) -Details "$($endpoint.Host):$($endpoint.Port)"
            if (-not $connected) { $allConnected = $false }
        } catch {
            Write-ValidationResult -Test "Connectivity: $($endpoint.Name)" -Passed ([bool]$false) -Details "Test failed: $($_.Exception.Message)"
            $allConnected = $false
        }
    }
    
    return $allConnected
}

function Test-ConfigurationFile {
    Write-Host "`nTesting Configuration File..." -ForegroundColor Cyan
    
    $configFile = Join-Path $script:SuiteRoot "Configuration/default-config.json"
    
    if (-not (Test-Path $configFile)) {
        Write-ValidationResult -Test "Configuration file exists" -Passed ([bool]$false)
        return $false
    }
    
    try {
        $config = Get-Content $configFile | ConvertFrom-Json
        Write-ValidationResult -Test "Configuration file format" -Passed ([bool]$true) -Details "Valid JSON format"
        
        # Test required sections
        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        $allSectionsExist = $true
        
        foreach ($section in $requiredSections) {
            $exists = $config.PSObject.Properties.Name -contains $section
            Write-ValidationResult -Test "Config section: $section" -Passed ([bool]$exists)
            if (-not $exists) { $allSectionsExist = $false }
        }
        
        return $allSectionsExist
        
    } catch {
        Write-ValidationResult -Test "Configuration file format" -Passed ([bool]$false) -Details "Invalid JSON: $($_.Exception.Message)"
        return $false
    }
}

function Test-ModuleImports {
    Write-Host "`nTesting Module Import Capability..." -ForegroundColor Cyan
    
    $testModules = @(
        "Modules/Utilities/Logging.psm1",
        "Modules/Utilities/ErrorHandling.psm1",
        "Modules/Authentication/Authentication.psm1"
    )
    
    $allImportable = $true
    foreach ($module in $testModules) {
        try {
            # Convert to absolute path using suite root
            $absolutePath = Join-Path $script:SuiteRoot $module
            
            if (-not (Test-Path $absolutePath)) {
                Write-ValidationResult -Test "Import: $module" -Passed ([bool]$false) -Details "Module file not found"
                $allImportable = $false
                continue
            }
            
            Import-Module $absolutePath -Force -ErrorAction Stop
            Write-ValidationResult -Test "Import: $module" -Passed ([bool]$true)
            
            $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($module)
            Remove-Module $moduleName -Force -ErrorAction SilentlyContinue
        } catch {
            Write-ValidationResult -Test "Import: $module" -Passed ([bool]$false) -Details $_.Exception.Message
            $allImportable = $false
        }
    }
    
    return $allImportable
}

function Test-OrchestratorSyntax {
    Write-Host "`nTesting Orchestrator Syntax..." -ForegroundColor Cyan
    
    $orchestratorFile = Join-Path $script:SuiteRoot "Core/MandA-Orchestrator.ps1"
    
    if (-not (Test-Path $orchestratorFile)) {
        Write-ValidationResult -Test "Orchestrator file exists" -Passed ([bool]$false)
        return $false
    }
    
    try {
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $orchestratorFile -Raw), [ref]$null)
        Write-ValidationResult -Test "Orchestrator syntax" -Passed ([bool]$true) -Details "PowerShell syntax is valid"
        return $true
    } catch {
        Write-ValidationResult -Test "Orchestrator syntax" -Passed ([bool]$false) -Details $_.Exception.Message
        return $false
    }
}

# Main validation execution
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "              M&A Discovery Suite v4.0 - Validation             " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Execute tests with error handling
$validationResults = @{}

$tests = @{
    "PowerShellVersion" = { Test-PowerShellVersion }
    "ModuleStructure" = { Test-ModuleStructure }
    "CoreComponents" = { Test-CoreComponents }
    "RequiredModules" = { Test-RequiredModules }
    "NetworkConnectivity" = { Test-NetworkConnectivity }
    "ConfigurationFile" = { Test-ConfigurationFile }
    "ModuleImports" = { Test-ModuleImports }
    "OrchestratorSyntax" = { Test-OrchestratorSyntax }
}

foreach ($testName in $tests.Keys) {
    try {
        $result = & $tests[$testName]
        $validationResults[$testName] = [bool]$result
    }
    catch {
        Write-Host "Error executing test '$testName': $($_.Exception.Message)" -ForegroundColor Red
        $validationResults[$testName] = $false
    }
}

# Summary
Write-Host "`n=================================================================" -ForegroundColor Yellow
Write-Host "                        VALIDATION SUMMARY                      " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Yellow

if ($null -eq $validationResults -or $validationResults.Count -eq 0) {
    Write-Host "CRITICAL ERROR - No validation results available" -ForegroundColor Red
    Write-Host "Please check the script for errors and try again." -ForegroundColor Yellow
    return
}

$passedTests = ($validationResults.Values | Where-Object { $_ -eq $true }).Count
$totalTests = $validationResults.Count

foreach ($test in $validationResults.GetEnumerator()) {
    $status = if ($test.Value) { "PASS" } else { "FAIL" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "$status - $($test.Key)" -ForegroundColor $color
}

Write-Host "`nOverall Result: $passedTests of $totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "`nM&A Discovery Suite is ready for use!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure authentication credentials" -ForegroundColor White
    Write-Host "2. Run: .\Scripts\QuickStart.ps1 -Operation Validate" -ForegroundColor White
    Write-Host "3. Run: .\Scripts\QuickStart.ps1 -Operation Full" -ForegroundColor White
} else {
    Write-Host "`nPlease address the failed tests before using the suite." -ForegroundColor Yellow
    Write-Host "Refer to the README.md for detailed setup instructions." -ForegroundColor White
}

Write-Host ""