# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-05-26
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Comprehensive installation validation script for M&A Discovery Suite v4.2
.DESCRIPTION
    Validates the M&A Discovery Suite installation, prerequisites, PowerShell modules,
    key configuration values, and directory writability.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
.EXAMPLE
    .\Validate-Installation.ps1
#>

[CmdletBinding()]
param()

# This script expects $global:MandA to be set by Set-SuiteEnvironment.ps1
# Source Set-SuiteEnvironment.ps1 if not already done (e.g., if run directly)
if ($null -eq $global:MandA) {
    $envSetupScript = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
    if (Test-Path $envSetupScript) {
        Write-Verbose "Sourcing Set-SuiteEnvironment.ps1 from: $envSetupScript"
        . $envSetupScript
        if ($null -eq $global:MandA) {
            Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 was sourced but `$global:MandA is still not set. Cannot proceed."
            exit 1
        }
    } else {
        Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envSetupScript'. This script is essential. Cannot proceed."
        exit 1
    }
}

# Import logging for consistent output, if available
if (Test-Path (Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1")) {
    Import-Module (Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1") -Force -Global
}

# Use Write-MandALog if available, otherwise fallback to Write-Host
function Write-ValidationMessage {
    param ([string]$Message, [string]$Level = "INFO", [ConsoleColor]$Color = "Gray")
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message $Message -Level $Level
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Write-ValidationResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = "",
        [string]$Recommendation = ""
    )
    $status = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-ValidationMessage -Message "$status - $TestName" -Level (if($Passed){"SUCCESS"}else{"ERROR"}) -Color $color
    if (-not [string]::IsNullOrWhiteSpace($Details)) {
        Write-ValidationMessage -Message "    Details: $Details" -Level "DEBUG" -Color Gray
    }
    if (-not $Passed -and -not [string]::IsNullOrWhiteSpace($Recommendation)) {
        Write-ValidationMessage -Message "    Recommendation: $Recommendation" -Level "WARN" -Color Yellow
    }
    return $Passed
}

$Global:ValidationOverallSuccess = $true # Used to track overall status

# --- Test Functions ---

function Test-SuitePrerequisites {
    <#
    .SYNOPSIS
        Pre-flight validation for M&A Discovery Suite prerequisites
    .DESCRIPTION
        Validates PowerShell version, execution policy, and administrator rights
        before proceeding with other validation checks
    #>
    Write-ValidationMessage "`n--- Testing Suite Prerequisites (Pre-flight Validation) ---" -Level "HEADER"
    $allValid = $true
    
    # Check PS version
    if ($PSVersionTable.PSVersion.Major -lt 5 -or
        ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
        if (-not (Write-ValidationResult -TestName "PowerShell Version Requirement" -Passed $false -Details "Current: $($PSVersionTable.PSVersion), Required: 5.1+" -Recommendation "Upgrade to PowerShell 5.1 or higher")) {
            $allValid = $false
        }
        # This is critical - throw to stop execution
        throw "PowerShell 5.1 or higher required. Current version: $($PSVersionTable.PSVersion)"
    } else {
        Write-ValidationResult -TestName "PowerShell Version Requirement" -Passed $true -Details "Current: $($PSVersionTable.PSVersion), Required: 5.1+"
    }
    
    # Check execution policy
    $executionPolicy = Get-ExecutionPolicy
    $isExecutionPolicyValid = $executionPolicy -ne 'Restricted'
    if (-not (Write-ValidationResult -TestName "Execution Policy Check" -Passed $isExecutionPolicyValid -Details "Current: $executionPolicy" -Recommendation "Consider setting execution policy to RemoteSigned or Bypass: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser")) {
        if ($executionPolicy -eq 'Restricted') {
            Write-ValidationMessage "WARNING: Execution policy is Restricted. Some operations may fail." -Level "WARN" -Color Yellow
        }
        $allValid = $false
    }
    
    # Test admin rights for certain operations
    $currentPrincipal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not (Write-ValidationResult -TestName "Administrator Rights Check" -Passed $isAdmin -Details "Running as Administrator: $isAdmin" -Recommendation "Some operations may require administrator privileges. Consider running as administrator if issues occur.")) {
        if (-not $isAdmin) {
            Write-ValidationMessage "WARNING: Not running as administrator. Some operations may fail." -Level "WARN" -Color Yellow
        }
        # Don't fail validation for this - just warn
    }
    
    if (-not $allValid) { $Global:ValidationOverallSuccess = $false }
    return $allValid
}

function Test-SuiteFileStructure {
    Write-ValidationMessage "`n--- Testing Core File and Directory Structure ---" -Level "HEADER"
    $allExist = $true
    $requiredPaths = @(
        $global:MandA.Paths.SuiteRoot,
        $global:MandA.Paths.Core,
        $global:MandA.Paths.Modules,
        $global:MandA.Paths.Utilities, # Specific check for utilities
        $global:MandA.Paths.Scripts,
        $global:MandA.Paths.Configuration,
        $global:MandA.Paths.Orchestrator,
        $global:MandA.Paths.ConfigFile,
        $global:MandA.Paths.QuickStart
    )
    foreach ($pathKey in $requiredPaths) {
        $pathValue = $pathKey # If it's already a path string
        if ($pathKey -is [hashtable]) { $pathValue = $pathKey.Path } # If it's an object with a Path property

        $isDir = ($pathKey -in $global:MandA.Paths.SuiteRoot, $global:MandA.Paths.Core, $global:MandA.Paths.Modules, $global:MandA.Paths.Utilities, $global:MandA.Paths.Scripts, $global:MandA.Paths.Configuration)
        $pathType = if ($isDir) { "Container" } else { "Leaf" }
        
        $currentTestPassed = Test-Path $pathValue -PathType $pathType
        if (-not (Write-ValidationResult -TestName "Path Check: $pathValue" -Passed $currentTestPassed -Details "Expected type: $pathType")) {
            $allExist = $false
        }
    }
    if (-not $allExist) { $Global:ValidationOverallSuccess = $false }
}

function Test-PowerShellVersionCheck { # Renamed to avoid conflict
    Write-ValidationMessage "`n--- Testing PowerShell Version ---" -Level "HEADER"
    $version = $PSVersionTable.PSVersion
    $minMajor = 5
    $minMinor = 1
    $isValid = ($version.Major -gt $minMajor) -or ($version.Major -eq $minMajor -and $version.Minor -ge $minMinor)
    if (-not (Write-ValidationResult -TestName "PowerShell Version" -Passed $isValid -Details "Current: $version, Required: $minMajor.$minMinor+")) {
        $Global:ValidationOverallSuccess = $false
    }
}

function Test-RequiredModulesCheck { # Renamed
    Write-ValidationMessage "`n--- Testing Required PowerShell Modules (via DiscoverySuiteModuleCheck.ps1) ---" -Level "HEADER"
    $moduleCheckScript = $global:MandA.Paths.ModuleCheckScript
    if (-not (Test-Path $moduleCheckScript -PathType Leaf)) {
        Write-ValidationResult -TestName "Module Check Script Availability" -Passed $false -Details "$moduleCheckScript not found."
        $Global:ValidationOverallSuccess = $false
        return
    }
    try {
        Write-ValidationMessage "Executing: $moduleCheckScript -AutoFix" -Level "INFO" # Recommend AutoFix for validation
        # We don't use -Silent here so user sees prompts if AutoFix needs to act.
        & $moduleCheckScript -AutoFix 
        if ($LASTEXITCODE -ne 0) {
            Write-ValidationResult -TestName "PowerShell Modules Check" -Passed $false -Details "DiscoverySuiteModuleCheck.ps1 reported issues (Exit Code: $LASTEXITCODE)." -Recommendation "Review output from module check script."
            $Global:ValidationOverallSuccess = $false
        } else {
            Write-ValidationResult -TestName "PowerShell Modules Check" -Passed $true -Details "DiscoverySuiteModuleCheck.ps1 completed successfully."
        }
    } catch {
        Write-ValidationResult -TestName "PowerShell Modules Check Execution" -Passed $false -Details "Error running DiscoverySuiteModuleCheck.ps1: $($_.Exception.Message)"
        $Global:ValidationOverallSuccess = $false
    }
}

function Test-ConfigurationValues {
    Write-ValidationMessage "`n--- Testing Critical Configuration Values from '$($global:MandA.Paths.ConfigFile)' ---" -Level "HEADER"
    $config = $global:MandA.Config
    $allValid = $true

    # OutputPath Writability
    $outputPath = $global:MandA.Paths.RawDataOutput # Use the resolved path
    $testFile = Join-Path $outputPath "validation_write_test.tmp"
    $canWrite = $false
    try {
        if (-not (Test-Path $outputPath -PathType Container)) {
            New-Item -Path $outputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
        }
        Set-Content -Path $testFile -Value "test" -ErrorAction Stop
        Remove-Item -Path $testFile -Force -ErrorAction Stop
        $canWrite = $true
    } catch {}
    if (-not (Write-ValidationResult -TestName "Output Path Writability" -Passed $canWrite -Details "Path: $outputPath" -Recommendation "Ensure the path exists and the user running the script has write permissions.")) {
        $allValid = $false
    }

    # DomainController Reachability (if configured)
    $dc = $config.environment.domainController
    if (-not [string]::IsNullOrWhiteSpace($dc)) {
        $dcReachable = Test-NetConnection -ComputerName $dc -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if (-not (Write-ValidationResult -TestName "Domain Controller Reachability" -Passed ($null -ne $dcReachable -and $dcReachable.TcpTestSucceeded) -Details "DC: $dc" -Recommendation "Ensure DC is online, reachable, and DNS is resolving correctly.")) {
            $allValid = $false
        }
    } else {
         Write-ValidationResult -TestName "Domain Controller Configuration" -Passed $true -Details "Domain Controller not configured; AD discovery will be skipped or use defaults."
    }
    
    # GlobalCatalog Reachability (if configured and different from DC)
    $gc = $config.environment.globalCatalog
    if (-not [string]::IsNullOrWhiteSpace($gc) -and $gc -ne $dc) {
        $gcReachable = Test-NetConnection -ComputerName $gc -Port 3268 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if (-not (Write-ValidationResult -TestName "Global Catalog Reachability (Port 3268)" -Passed ($null -ne $gcReachable -and $gcReachable.TcpTestSucceeded) -Details "GC: $gc" -Recommendation "Ensure GC is online, reachable on port 3268, and DNS is resolving correctly.")) {
            $allValid = $false
        }
    } elseif (-not [string]::IsNullOrWhiteSpace($gc) -and $gc -eq $dc) {
         Write-ValidationResult -TestName "Global Catalog Configuration" -Passed $true -Details "Global Catalog is configured to be the same as Domain Controller: $gc"
    } else {
         Write-ValidationResult -TestName "Global Catalog Configuration" -Passed $true -Details "Global Catalog not explicitly configured; AD queries will use Domain Controller."
    }


    # LogLevel Validity
    $validLogLevels = @("DEBUG", "INFO", "WARN", "ERROR", "SUCCESS", "HEADER", "PROGRESS")
    $logLevel = $config.environment.logLevel
    if (-not (Write-ValidationResult -TestName "LogLevel Value" -Passed ($logLevel -in $validLogLevels) -Details "Current: $logLevel. Valid: $($validLogLevels -join ', ')" -Recommendation "Correct the logLevel in default-config.json.")) {
        $allValid = $false
    }

    # CredentialStorePath (check if parent directory exists, actual file existence is checked by app reg script/orchestrator)
    $credPath = $global:MandA.Paths.CredentialFile
    $credDir = Split-Path $credPath
    if (-not (Write-ValidationResult -TestName "Credential Store Parent Directory" -Passed (Test-Path $credDir -PathType Container) -Details "Path: $credDir (for $credPath)" -Recommendation "Ensure parent directory for credential file exists or can be created.")) {
        $allValid = $false
    }
    
    # Config Schema Validation (if ConfigurationValidation.psm1 was loaded by Set-SuiteEnvironment)
    if (Get-Command Test-SuiteConfigurationAgainstSchema -ErrorAction SilentlyContinue) {
        $schemaResult = Test-SuiteConfigurationAgainstSchema -ConfigurationObject $config -SchemaPath $global:MandA.Paths.ConfigSchema
        if (-not (Write-ValidationResult -TestName "Configuration Schema Adherence" -Passed $schemaResult.IsValid -Details "Checked against $($global:MandA.Paths.ConfigSchema). See previous logs for specific schema errors if any." -Recommendation "Correct 'default-config.json' to match the schema defined in 'config.schema.json'.")) {
            $allValid = $false
        }
    } else {
        Write-ValidationResult -TestName "Configuration Schema Adherence" -Passed $true -Details "Test-SuiteConfigurationAgainstSchema command not found. Schema validation skipped." # Pass this test if the validator isn't there.
    }


    if (-not $allValid) { $Global:ValidationOverallSuccess = $false }
}

function Test-NetworkConnectivityEndpoints {
    Write-ValidationMessage "`n--- Testing Key Network Endpoint Connectivity ---" -Level "HEADER"
    $allConnected = $true
    $endpoints = @(
        @{ Name = "Microsoft Graph API"; Host = "graph.microsoft.com"; Port = 443 }
        @{ Name = "Azure AD Login"; Host = "login.microsoftonline.com"; Port = 443 }
        @{ Name = "Exchange Online (Outlook)"; Host = "outlook.office365.com"; Port = 443 }
        # Add other critical external endpoints if necessary
    )
    foreach ($endpoint in $endpoints) {
        $isConnected = Test-NetConnection -ComputerName $endpoint.Host -Port $endpoint.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if (-not (Write-ValidationResult -TestName "Endpoint: $($endpoint.Name)" -Passed ($null -ne $isConnected -and $isConnected.TcpTestSucceeded) -Details "$($endpoint.Host):$($endpoint.Port)" -Recommendation "Check firewall, proxy, and internet connectivity.")) {
            $allConnected = $false
        }
    }
    if (-not $allConnected) { $Global:ValidationOverallSuccess = $false }
}


# --- Main Validation Execution ---
Write-ValidationMessage "=================================================================" -Level "HEADER" -Color Cyan
Write-ValidationMessage "        M&A Discovery Suite v4.2 - Installation Validation       " -Level "HEADER" -Color Cyan
Write-ValidationMessage "=================================================================" -Level "HEADER" -Color Cyan
Write-ValidationMessage "Suite Root: $($global:MandA.Paths.SuiteRoot)" -Level "INFO"

# Run pre-flight validation first - this includes critical checks that may stop execution
Test-SuitePrerequisites

Test-SuiteFileStructure
Test-PowerShellVersionCheck
Test-RequiredModulesCheck # This now calls the improved DiscoverySuiteModuleCheck.ps1
Test-ConfigurationValues
Test-NetworkConnectivityEndpoints

# --- Summary ---
Write-ValidationMessage "`n=================================================================" -Level "HEADER" -Color Yellow
Write-ValidationMessage "                        VALIDATION SUMMARY                      " -Level "HEADER" -Color Yellow
Write-ValidationMessage "=================================================================" -Level "HEADER" -Color Yellow

if ($Global:ValidationOverallSuccess) {
    Write-ValidationMessage "`nOverall Result: ALL CHECKS PASSED." -Level "SUCCESS" -Color Green
    Write-ValidationMessage "M&A Discovery Suite appears to be correctly set up and configured!" -Level "SUCCESS" -Color Green
    Write-ValidationMessage "You can proceed with running discovery operations via QuickStart.ps1." -Level "INFO"
} else {
    Write-ValidationMessage "`nOverall Result: ONE OR MORE CHECKS FAILED." -Level "ERROR" -Color Red
    Write-ValidationMessage "Please review the messages above and address the failed items." -Level "ERROR" -Color Red
    Write-ValidationMessage "Refer to the documentation for troubleshooting." -Level "INFO"
}
Write-ValidationMessage ""
