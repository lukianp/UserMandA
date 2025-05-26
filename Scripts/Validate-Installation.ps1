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

function Write-ValidationResult {
    param(
        [string]$Test,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    $status = if ($Passed) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "$status - $Test" -ForegroundColor $color
    if ($Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
}

function Test-ModuleStructure {
    Write-Host "`n🔍 Testing Module Structure..." -ForegroundColor Cyan
    
    $requiredModules = @(
        "Modules\Authentication\Authentication.psm1",
        "Modules\Authentication\CredentialManagement.psm1",
        "Modules\Connectivity\ConnectionManager.psm1",
        "Modules\Discovery\ActiveDirectoryDiscovery.psm1",
        "Modules\Discovery\GraphDiscovery.psm1",
        "Modules\Processing\DataAggregation.psm1",
        "Modules\Processing\UserProfileBuilder.psm1",
        "Modules\Processing\WaveGeneration.psm1",
        "Modules\Processing\DataValidation.psm1",
        "Modules\Export\CSVExport.psm1",
        "Modules\Export\JSONExport.psm1",
        "Modules\Utilities\Logging.psm1",
        "Modules\Utilities\ErrorHandling.psm1",
        "Modules\Utilities\ValidationHelpers.psm1",
        "Modules\Utilities\ProgressTracking.psm1",
        "Modules\Utilities\FileOperations.psm1"
    )
    
    $allModulesExist = $true
    foreach ($module in $requiredModules) {
        $exists = Test-Path $module
        Write-ValidationResult -Test "Module: $module" -Passed $exists
        if (-not $exists) { $allModulesExist = $false }
    }
    
    return $allModulesExist
}

function Test-CoreComponents {
    Write-Host "`n🔍 Testing Core Components..." -ForegroundColor Cyan
    
    $coreComponents = @(
        "Core\MandA-Orchestrator.ps1",
        "Configuration\default-config.json",
        "Scripts\QuickStart.ps1",
        "README.md"
    )
    
    $allCoreExist = $true
    foreach ($component in $coreComponents) {
        $exists = Test-Path $component
        Write-ValidationResult -Test "Core: $component" -Passed $exists
        if (-not $exists) { $allCoreExist = $false }
    }
    
    return $allCoreExist
}

function Test-PowerShellVersion {
    Write-Host "`n🔍 Testing PowerShell Version..." -ForegroundColor Cyan
    
    $version = $PSVersionTable.PSVersion
    $isValid = $version.Major -ge 5
    
    Write-ValidationResult -Test "PowerShell Version" -Passed $isValid -Details "Version: $version (Required: 5.1+)"
    
    return $isValid
}

function Test-RequiredModules {
    Write-Host "`n🔍 Testing Required PowerShell Modules..." -ForegroundColor Cyan
    
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
        $available = Get-Module -ListAvailable -Name $module.Name -ErrorAction SilentlyContinue
        $exists = $available -ne $null
        
        if ($module.Required -and -not $exists) {
            $criticalMissing++
        }
        
        $status = if ($module.Required) { "Required" } else { "Optional" }
        Write-ValidationResult -Test "$($module.Name) ($status)" -Passed $exists
    }
    
    return ($criticalMissing -eq 0)
}

function Test-NetworkConnectivity {
    Write-Host "`n🔍 Testing Network Connectivity..." -ForegroundColor Cyan
    
    $endpoints = @(
        @{ Name = "Microsoft Graph"; Host = "graph.microsoft.com"; Port = 443 },
        @{ Name = "Azure AD"; Host = "login.microsoftonline.com"; Port = 443 },
        @{ Name = "Exchange Online"; Host = "outlook.office365.com"; Port = 443 }
    )
    
    $allConnected = $true
    foreach ($endpoint in $endpoints) {
        try {
            $result = Test-NetConnection -ComputerName $endpoint.Host -Port $endpoint.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            Write-ValidationResult -Test "Connectivity: $($endpoint.Name)" -Passed $result -Details "$($endpoint.Host):$($endpoint.Port)"
            if (-not $result) { $allConnected = $false }
        } catch {
            Write-ValidationResult -Test "Connectivity: $($endpoint.Name)" -Passed $false -Details "Test failed: $($_.Exception.Message)"
            $allConnected = $false
        }
    }
    
    return $allConnected
}

function Test-ConfigurationFile {
    Write-Host "`n🔍 Testing Configuration File..." -ForegroundColor Cyan
    
    $configFile = "Configuration\default-config.json"
    
    if (-not (Test-Path $configFile)) {
        Write-ValidationResult -Test "Configuration file exists" -Passed $false
        return $false
    }
    
    try {
        $config = Get-Content $configFile | ConvertFrom-Json
        Write-ValidationResult -Test "Configuration file format" -Passed $true -Details "Valid JSON format"
        
        # Test required sections
        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        $allSectionsExist = $true
        
        foreach ($section in $requiredSections) {
            $exists = $config.PSObject.Properties.Name -contains $section
            Write-ValidationResult -Test "Config section: $section" -Passed $exists
            if (-not $exists) { $allSectionsExist = $false }
        }
        
        return $allSectionsExist
        
    } catch {
        Write-ValidationResult -Test "Configuration file format" -Passed $false -Details "Invalid JSON: $($_.Exception.Message)"
        return $false
    }
}

function Test-ModuleImports {
    Write-Host "`n🔍 Testing Module Import Capability..." -ForegroundColor Cyan
    
    $testModules = @(
        "Modules\Utilities\Logging.psm1",
        "Modules\Utilities\ErrorHandling.psm1",
        "Modules\Authentication\Authentication.psm1"
    )
    
    $allImportable = $true
    foreach ($module in $testModules) {
        try {
            Import-Module $module -Force -ErrorAction Stop
            Write-ValidationResult -Test "Import: $module" -Passed $true
            Remove-Module (Split-Path $module -LeafBase) -Force -ErrorAction SilentlyContinue
        } catch {
            Write-ValidationResult -Test "Import: $module" -Passed $false -Details $_.Exception.Message
            $allImportable = $false
        }
    }
    
    return $allImportable
}

function Test-OrchestratorSyntax {
    Write-Host "`n🔍 Testing Orchestrator Syntax..." -ForegroundColor Cyan
    
    $orchestratorFile = "Core\MandA-Orchestrator.ps1"
    
    if (-not (Test-Path $orchestratorFile)) {
        Write-ValidationResult -Test "Orchestrator file exists" -Passed $false
        return $false
    }
    
    try {
        # Test syntax by parsing the script
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $orchestratorFile -Raw), [ref]$null)
        Write-ValidationResult -Test "Orchestrator syntax" -Passed $true -Details "PowerShell syntax is valid"
        return $true
    } catch {
        Write-ValidationResult -Test "Orchestrator syntax" -Passed $false -Details $_.Exception.Message
        return $false
    }
}

# Main validation execution
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              M&A Discovery Suite v4.0 - Validation              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$validationResults = @{
    PowerShellVersion = Test-PowerShellVersion
    ModuleStructure = Test-ModuleStructure
    CoreComponents = Test-CoreComponents
    RequiredModules = Test-RequiredModules
    NetworkConnectivity = Test-NetworkConnectivity
    ConfigurationFile = Test-ConfigurationFile
    ModuleImports = Test-ModuleImports
    OrchestratorSyntax = Test-OrchestratorSyntax
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                        VALIDATION SUMMARY                       ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

$passedTests = ($validationResults.Values | Where-Object { $_ -eq $true }).Count
$totalTests = $validationResults.Count

foreach ($test in $validationResults.GetEnumerator()) {
    $status = if ($test.Value) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "$status - $($test.Key)" -ForegroundColor $color
}

Write-Host "`nOverall Result: $passedTests of $totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "`n🎉 M&A Discovery Suite is ready for use!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure authentication credentials" -ForegroundColor White
    Write-Host "2. Run: .\Scripts\QuickStart.ps1 -Operation Validate" -ForegroundColor White
    Write-Host "3. Run: .\Scripts\QuickStart.ps1 -Operation Full" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Please address the failed tests before using the suite." -ForegroundColor Yellow
    Write-Host "Refer to the README.md for detailed setup instructions." -ForegroundColor White
}

Write-Host ""