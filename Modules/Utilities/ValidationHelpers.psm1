﻿# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
# Used by orchestrator!
# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Common validation helper functions for the M&A Discovery Suite
.DESCRIPTION
    This module provides functions for validating prerequisites, data formats (GUID, email, UPN), configuration files, 
    directory write access, module availability, network connectivity, and data quality. It integrates with 
    EnhancedLogging for consistent validation reporting and includes comprehensive validation logic for all 
    common data types and system requirements used throughout the discovery suite.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
#>

    Key Design Points:
    - Uses Write-MandALog for logging.
    - Relies on $global:MandA or a passed -Context for logging and configuration/paths.
    - Provides a suite of common validation checks.
#>

Export-ModuleMember -Function Test-Prerequisites, Test-GuidFormat, Test-EmailFormat, Test-UPNFormat, Test-ConfigurationFileStructure, Test-DirectoryWriteAccessRedux, Test-ModuleAvailabilityByName, Test-BasicNetworkConnectivity, Test-DataQualitySimple, Export-ValidationReportSimple, Test-DiscoveryFileSkippable, Invoke-WithRetry, Write-MandALog

# Note: Test-DirectoryWriteAccessRedux to avoid conflict if FileOperations.psm1 also has one.
# Test-ModuleAvailabilityByName to differentiate from a broader module check script.

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}

# --- Prerequisite Validation ---

function Test-Prerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$Context # Expects full context ($global:MandA or similar)
    )
    
    try {
        # This function performs a high-level check of critical prerequisites.
        # More detailed checks (like specific module versions) are often in DiscoverySuiteModuleCheck.ps1.

        Write-MandALog -Message "Performing prerequisite validation..." -Level "HEADER" -Component "Validation" -Context $Context
        $allChecksPass = $true
        $validationIssues = [System.Collections.Generic.List[string]]::new()

        # 1. PowerShell Version
        if ($PSVersionTable.PSVersion.Major -lt 5 -or ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
            $validationIssues.Add("PowerShell version 5.1 or higher is required. Current: $($PSVersionTable.PSVersion)")
            $allChecksPass = $false
        } else {
            Write-MandALog -Message "PowerShell Version check passed: $($PSVersionTable.PSVersion)" -Level "SUCCESS" -Component "Validation" -Context $Context
        }
        
        # 2. Administrator Privileges (Optional check, depends on operations)
        # if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        #     Write-MandALog -Message "Warning: Script is not running with Administrator privileges. Some operations may fail." -Level "WARN" -Component "Validation" -Context $Context
        # }

        # 3. Critical Paths from Context
        $criticalPaths = @("SuiteRoot", "CompanyProfileRoot", "LogOutput", "RawDataOutput", "ProcessedDataOutput", "Modules", "Utilities")
        if ($null -eq $Context.Paths) {
            $validationIssues.Add("Context.Paths is null. Cannot validate critical paths.")
            $allChecksPass = $false
        } else {
            foreach ($pathKey in $criticalPaths) {
                if (-not $Context.Paths.ContainsKey($pathKey) -or [string]::IsNullOrWhiteSpace($Context.Paths[$pathKey])) {
                    $validationIssues.Add("Critical path '$pathKey' is not defined in context.")
                    $allChecksPass = $false
                } elseif ($pathKey -in @("SuiteRoot", "Modules", "Utilities") -and (-not (Test-Path $Context.Paths[$pathKey] -PathType Container))) {
                    # Core suite structure paths must exist
                    $validationIssues.Add("Critical suite path '$($Context.Paths[$pathKey])' for '$pathKey' does not exist.")
                    $allChecksPass = $false
                }
            }
        }
        
        if ($validationIssues.Count -eq 0) { # Log success only if no path issues from this block
            Write-MandALog -Message "Critical path definitions check passed." -Level "SUCCESS" -Component "Validation" -Context $Context
        }

        # 4. Configuration Object Existence
        if ($null -eq $Context.Config) {
            $validationIssues.Add("Context.Config is null. Configuration is not loaded.")
            $allChecksPass = $false
        } else {
            Write-MandALog -Message "Configuration object found in context." -Level "SUCCESS" -Component "Validation" -Context $Context
        }

        # 5. Essential Utility Modules (e.g., EnhancedLogging itself, ErrorHandling)
        # This is a bit meta, as this module is a utility itself.
        # Check if Write-MandALog is available, which implies EnhancedLogging loaded.
        if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
            $validationIssues.Add("Core logging function 'Write-MandALog' not found. EnhancedLogging.psm1 might be missing or failed to load.")
            $allChecksPass = $false
        } else {
            Write-MandALog -Message "Core logging function 'Write-MandALog' is available." -Level "SUCCESS" -Component "Validation" -Context $Context
        }

        # Summary
        if (-not $allChecksPass) {
            Write-MandALog -Message "Prerequisite validation FAILED. See issues below:" -Level "ERROR" -Component "Validation" -Context $Context
            $validationIssues | ForEach-Object { Write-MandALog -Message "  - $_" -Level "ERROR" -Component "Validation" -Context $Context }
        } else {
            Write-MandALog -Message "All critical prerequisites seem to be met." -Level "SUCCESS" -Component "Validation" -Context $Context
        }
        return $allChecksPass
    } catch {
        Write-MandALog "Error in function 'Test-Prerequisites': $($_.Exception.Message)" "ERROR"
        throw
    }
}

# --- Format Validation Functions ---

function Test-GuidFormat {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$GuidString
    )
    
    try {
        if ([string]::IsNullOrWhiteSpace($GuidString)) { return $false }
        
        # Basic regex for GUID format. Does not validate if it's a *valid* known GUID.
        return $GuidString -match '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$'
    } catch {
        Write-MandALog "Error in function 'Test-GuidFormat': $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Test-EmailFormat {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$EmailString
    )
    
    if ([string]::IsNullOrWhiteSpace($EmailString)) { return $false }
    # Basic regex for email format. Not exhaustive for all RFC specs but covers common cases.
    # PowerShell 5.1 doesn't have -match operator with [regex] type accelerator directly.
    try {
        $null = [System.Net.Mail.MailAddress]::new($EmailString)
        return $true
    } catch {
        return $false
    }
}

function Test-UPNFormat {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$UpnString
    )
    
    if ([string]::IsNullOrWhiteSpace($UpnString)) { return $false }
    
    try {
        # UPN is often like an email but can have different rules.
        # A simple check: must contain '@' and have parts on both sides.
        return $UpnString -like "*@*" -and $UpnString.Split('@').Count -eq 2 -and -not ([string]::IsNullOrWhiteSpace($UpnString.Split('@')[0])) -and -not ([string]::IsNullOrWhiteSpace($UpnString.Split('@')[1]))
    } catch {
        Write-MandALog "Error in function 'Test-UPNFormat': $($_.Exception.Message)" "ERROR"
        throw
    }
}

# --- Configuration and Path Validation ---

function Test-ConfigurationFileStructure {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ConfigObject, # The loaded configuration hashtable

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    
    try {
        # Validates if the loaded configuration object has the minimum required top-level sections.
        # More detailed schema validation is in ConfigurationValidation.psm1
        Write-MandALog -Message "Validating basic structure of the loaded configuration..." -Level "INFO" -Component "ConfigValidation" -Context $Context
        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        $missingSections = @()

        foreach ($section in $requiredSections) {
            if (-not $ConfigObject.ContainsKey($section)) {
                $missingSections += $section
            } elseif ($null -eq $ConfigObject[$section] -or -not ($ConfigObject[$section] -is [hashtable])) {
                $missingSections += "$section (expected object/hashtable, found $($ConfigObject[$section].GetType().Name))"
            }
        }

        if ($missingSections.Count -gt 0) {
            Write-MandALog -Message "Configuration structure validation FAILED. Missing or invalid sections: $($missingSections -join ', ')" -Level "ERROR" -Component "ConfigValidation" -Context $Context
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("ConfigValidation", "Missing/invalid config sections: $($missingSections -join ', ')", $null)
            }
            return $false
        }
        
        Write-MandALog -Message "Basic configuration structure is valid." -Level "SUCCESS" -Component "ConfigValidation" -Context $Context
        return $true
    } catch {
        Write-MandALog "Error in function 'Test-ConfigurationFileStructure': $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Test-DirectoryWriteAccessRedux {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath,
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    
    # This is a wrapper or alternative to the one in FileOperations.psm1 if needed,
    # or can call it if FileOperations is guaranteed to be loaded.
    # For now, reimplementing simply.
    if (-not (Test-Path $DirectoryPath -PathType Container)) {
        Write-MandALog -Message "Directory '$DirectoryPath' does not exist. Cannot test write access." -Level "WARN" -Component "Validation" -Context $Context
        # Try to create it if we are in a context that allows it
        if ($Context -and (Get-Command Ensure-DirectoryExists -ErrorAction SilentlyContinue)) {
            if (-not (Ensure-DirectoryExists -DirectoryPath $DirectoryPath -Context $Context)) {
                return $false # Failed to create
            }
        } else {
            return $false # Cannot create or doesn't exist
        }
    }

    $testFileName = "access_test_$(Get-Random -Minimum 100000 -Maximum 999999).tmp"
    $testFilePath = Join-Path $DirectoryPath $testFileName
    
    try {
        "Test" | Set-Content -Path $testFilePath -Encoding UTF8 -ErrorAction Stop
        Remove-Item -Path $testFilePath -Force -ErrorAction Stop
        Write-MandALog -Message "Write access confirmed for directory: '$DirectoryPath'" -Level "SUCCESS" -Component "Validation" -Context $Context
        return $true
    } catch {
        Write-MandALog -Message "Write access test FAILED for directory: '$DirectoryPath'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "Validation" -Context $Context
        if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
            $Context.ErrorCollector.AddError("Validation", "Write access failed for '$DirectoryPath'", $_.Exception)
        }
        return $false
    }
}

# --- Module and Connectivity Checks ---

function Test-ModuleAvailabilityByName {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$ModuleNames,
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    
    try {
        $allAvailable = $true
        $unavailableModules = [System.Collections.Generic.List[string]]::new()

        Write-MandALog -Message "Checking availability of specified PowerShell modules: $($ModuleNames -join ', ')" -Level "INFO" -Component "Validation" -Context $Context
        foreach ($moduleName in $ModuleNames) {
            if (-not (Get-Module -Name $moduleName -ListAvailable -ErrorAction SilentlyContinue)) {
                $unavailableModules.Add($moduleName)
                $allAvailable = $false
                Write-MandALog -Message "Module '$moduleName' is NOT available." -Level "WARN" -Component "Validation" -Context $Context
            } else {
                Write-MandALog -Message "Module '$moduleName' is available." -Level "DEBUG" -Component "Validation" -Context $Context
            }
        }

        if (-not $allAvailable) {
            Write-MandALog -Message "One or more required modules are unavailable: $($unavailableModules -join ', '). Please install them." -Level "ERROR" -Component "Validation" -Context $Context
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("Validation", "Missing modules: $($unavailableModules -join ', ')", $null)
            }
        } else {
            Write-MandALog -Message "All specified modules are available." -Level "SUCCESS" -Component "Validation" -Context $Context
        }
        return $allAvailable
    } catch {
        Write-MandALog "Error in function 'Test-ModuleAvailabilityByName': $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Test-BasicNetworkConnectivity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$EndpointsToTest, # e.g., "graph.microsoft.com", "login.microsoftonline.com:443"
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    
    try {
        $allConnected = $true
        $failedEndpoints = [System.Collections.Generic.List[string]]::new()

        Write-MandALog -Message "Testing basic network connectivity to endpoints: $($EndpointsToTest -join ', ')" -Level "INFO" -Component "Validation" -Context $Context
        foreach ($endpointSpec in $EndpointsToTest) {
            $computerName = $endpointSpec
            $port = 443 # Default to HTTPS
            if ($endpointSpec -match ":(\d+)$") {
                $computerName = $endpointSpec.Split(':')[0]
                $port = [int]$matches[1]
            }
            
            Write-MandALog -Message "Pinging $computerName on port $port..." -Level "DEBUG" -Component "Validation" -Context $Context
            $connectionResult = Test-NetConnection -ComputerName $computerName -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            
            if ($connectionResult -and $connectionResult.TcpTestSucceeded) {
                Write-MandALog -Message "Successfully connected to $computerName (Port $port)." -Level "SUCCESS" -Component "Validation" -Context $Context
            } else {
                $allConnected = $false
                $failedEndpoints.Add("$computerName`:$port")
                $errMsg = "Failed to connect to $computerName (Port $port)."
                if ($connectionResult -and $connectionResult.DetailedMessage) { 
                    $errMsg += " Details: $($connectionResult.DetailedMessage)" 
                }
                Write-MandALog -Message $errMsg -Level "ERROR" -Component "Validation" -Context $Context
            }
        }

        if (-not $allConnected) {
            Write-MandALog -Message "Network connectivity test FAILED for endpoints: $($failedEndpoints -join ', ')." -Level "ERROR" -Component "Validation" -Context $Context
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("Validation", "Network connectivity failed for: $($failedEndpoints -join ', ')", $null)
            }
        } else {
            Write-MandALog -Message "All specified network endpoints are reachable." -Level "SUCCESS" -Component "Validation" -Context $Context
        }
        return $allConnected
    } catch {
        Write-MandALog "Error in function 'Test-BasicNetworkConnectivity': $($_.Exception.Message)" "ERROR"
        throw
    }
}

# --- Data Quality (Simplified Example) ---
# More complex data quality is typically in DataValidation.psm1

function Test-DataQualitySimple {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$DataCollection,
        [Parameter(Mandatory=$true)]
        [string[]]$RequiredFields,
        [Parameter(Mandatory=$false)]
        [string]$DatasetName = "Dataset",
        [PSCustomObject]$Context
    )
    
    try {
        if ($null -eq $DataCollection) {
            Write-MandALog -Message "No data provided for quality check of '$DatasetName'." -Level "WARN" -Component "Validation" -Context $Context
            return @{ IsValid = $false; Issues = @("No data provided.") }
        }
        
        Write-MandALog -Message "Performing simple data quality check for '$DatasetName' (Checking for required fields: $($RequiredFields -join ', '))..." -Level "INFO" -Component "Validation" -Context $Context
        $issuesFound = [System.Collections.Generic.List[string]]::new()
        $invalidRecordCount = 0
        $totalRecords = $DataCollection.Count

        for ($i = 0; $i -lt $totalRecords; $i++) {
            $record = $DataCollection[$i]
            $recordIdentifier = if ($record.PSObject.Properties["UserPrincipalName"]) {
                $record.UserPrincipalName
            } elseif ($record.PSObject.Properties["Id"]) {
                $record.Id
            } else {
                "Record Index $i"
            }
            
            $currentRecordIssues = 0
            foreach ($field in $RequiredFields) {
                if (-not $record.PSObject.Properties[$field] -or [string]::IsNullOrWhiteSpace($record.PSObject.Properties[$field].Value)) {
                    $issuesFound.Add("Dataset '$DatasetName', Record '$recordIdentifier': Missing or empty required field '$field'.")
                    $currentRecordIssues++
                }
            }
            
            if ($currentRecordIssues -gt 0) {
                $invalidRecordCount++
            }
        }

        if ($issuesFound.Count -gt 0) {
            Write-MandALog -Message "Data quality issues found in '$DatasetName'. Total Records: $totalRecords, Records with Issues: $invalidRecordCount." -Level "WARN" -Component "Validation" -Context $Context
            # Log first few issues for brevity in main log
            $issuesFound | Select-Object -First 5 | ForEach-Object { Write-MandALog -Message "  - $_" -Level "WARN" -Component "Validation" -Context $Context }
            if ($issuesFound.Count -gt 5) {
                Write-MandALog -Message "  ...and $($issuesFound.Count - 5) more issues." -Level "WARN" -Component "Validation" -Context $Context
            }
            return @{ IsValid = $false; InvalidRecordCount = $invalidRecordCount; TotalRecords = $totalRecords; Issues = $issuesFound }
        }

        Write-MandALog -Message "Simple data quality check passed for '$DatasetName'. All required fields present in $totalRecords records." -Level "SUCCESS" -Component "Validation" -Context $Context
        return @{ IsValid = $true; InvalidRecordCount = 0; TotalRecords = $totalRecords; Issues = @() }
    } catch {
        Write-MandALog "Error in function 'Test-DataQualitySimple': $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Export-ValidationReportSimple {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$ValidationIssues, # Array of strings or objects describing issues
        [Parameter(Mandatory=$true)]
        [string]$ReportName,
        [PSCustomObject]$Context # For LogOutput path
    )
    
    try {
        $reportPathBase = if ($Context -and $Context.Paths -and $Context.Paths.LogOutput) { 
            $Context.Paths.LogOutput 
        } else { 
            ".\" 
        }
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $reportFilePath = Join-Path $reportPathBase "${ReportName}_ValidationReport_$timestamp.txt"

        Write-MandALog -Message "Exporting simple validation report to '$reportFilePath'..." -Level "INFO" -Component "ValidationReport" -Context $Context
        
        $reportContent = [System.Collections.Generic.List[string]]::new()
        $reportContent.Add("=== $ReportName - Validation Report ===")
        $reportContent.Add("Generated: $(Get-Date)")
        $reportContent.Add("Total Issues Found: $($ValidationIssues.Count)")
        $reportContent.Add(("-" * 40))
        
        if ($ValidationIssues.Count -eq 0) {
            $reportContent.Add("No validation issues reported.")
        } else {
            $ValidationIssues | ForEach-Object { $reportContent.Add("- $_") }
        }

        try {
            if (Get-Command Ensure-DirectoryExists -ErrorAction SilentlyContinue) {
                Ensure-DirectoryExists -DirectoryPath $reportPathBase -Context $Context | Out-Null
            }
            Set-Content -Path $reportFilePath -Value $reportContent -Encoding UTF8 -ErrorAction Stop
            Write-MandALog -Message "Validation report exported successfully." -Level "SUCCESS" -Component "ValidationReport" -Context $Context
        } catch {
            Write-MandALog -Message "Failed to export validation report to '$reportFilePath'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "ValidationReport" -Context $Context
        }
    } catch {
        Write-MandALog -Message "Error in Export-ValidationReportSimple: $($_.Exception.Message)" -Level "ERROR" -Component "ValidationReport" -Context $Context
    }
}

# --- Additional Helper Functions for Discovery Modules ---

function Test-DiscoveryFileSkippable {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        [int]$MinimumRecords = 1,
        
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredHeaders = @()
    )
    
    try {
        # Check if force mode is enabled
        if ($Configuration.discovery.forceMode -or $Configuration.discovery.Force) {
            Write-MandALog -Message "Force mode enabled - will not skip $ModuleName" -Level "INFO" -Component "Validation"
            return $false
        }
        
        # Check if skipExistingFiles is disabled
        if (-not $Configuration.discovery.skipExistingFiles) {
            Write-MandALog -Message "Skip existing files disabled - will not skip $ModuleName" -Level "INFO" -Component "Validation"
            return $false
        }
        
        # Check if file exists
        if (-not (Test-Path $FilePath)) {
            Write-MandALog -Message "File does not exist: $FilePath" -Level "DEBUG" -Component "Validation"
            return $false
        }
        
        # Check file age (optional - skip if file is too old)
        $fileInfo = Get-Item $FilePath
        $maxAge = if ($Configuration.discovery.maxFileAgeDays) { $Configuration.discovery.maxFileAgeDays } else { 7 }
        if ($fileInfo.LastWriteTime -lt (Get-Date).AddDays(-$maxAge)) {
            Write-MandALog -Message "File is older than $maxAge days: $FilePath" -Level "DEBUG" -Component "Validation"
            return $false
        }
        
        # Check file content
        try {
            $data = Import-Csv $FilePath -ErrorAction Stop
            
            # Check minimum record count
            if ($data.Count -lt $MinimumRecords) {
                Write-MandALog -Message "File has insufficient records ($($data.Count) < $MinimumRecords): $FilePath" -Level "DEBUG" -Component "Validation"
                return $false
            }
            
            # Check required headers
            if ($RequiredHeaders.Count -gt 0 -and $data.Count -gt 0) {
                $actualHeaders = $data[0].PSObject.Properties.Name
                $missingHeaders = $RequiredHeaders | Where-Object { $_ -notin $actualHeaders }
                if ($missingHeaders.Count -gt 0) {
                    Write-MandALog -Message "File missing required headers ($($missingHeaders -join ', ')): $FilePath" -Level "DEBUG" -Component "Validation"
                    return $false
                }
            }
            
            Write-MandALog -Message "File is valid and can be skipped: $FilePath ($($data.Count) records)" -Level "SUCCESS" -Component "Validation"
            return $true
            
        } catch {
            Write-MandALog -Message "Error reading file $FilePath`: $_" -Level "WARN" -Component "Validation"
            return $false
        }
        
    } catch {
        Write-MandALog -Message "Error in Test-DiscoveryFileSkippable: $_" -Level "ERROR" -Component "Validation"
        return $false
    }
}

function Invoke-WithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,
        
        [Parameter(Mandatory=$false)]
        [int]$DelaySeconds = 2,
        
        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Operation",
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $attempt = 0
    $lastException = $null
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        
        try {
            Write-MandALog -Message "$OperationName - Attempt $attempt/$MaxRetries" -Level "DEBUG" -Component "Retry" -Context $Context
            $result = & $ScriptBlock
            Write-MandALog -Message "$OperationName - Succeeded on attempt $attempt" -Level "SUCCESS" -Component "Retry" -Context $Context
            return $result
        }
        catch {
            $lastException = $_.Exception
            Write-MandALog -Message "$OperationName - Failed on attempt $attempt`: $($_.Exception.Message)" -Level "WARN" -Component "Retry" -Context $Context
            
            if ($attempt -lt $MaxRetries) {
                Write-MandALog -Message "$OperationName - Waiting $DelaySeconds seconds before retry..." -Level "INFO" -Component "Retry" -Context $Context
                Start-Sleep -Seconds $DelaySeconds
            }
        }
    }
    
    Write-MandALog -Message "$OperationName - Failed after $MaxRetries attempts" -Level "ERROR" -Component "Retry" -Context $Context
    throw $lastException
}

function Write-MandALog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$Level = "INFO",
        
        [Parameter(Mandatory=$false)]
        [string]$Component = "General",
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Fallback logging function if EnhancedLogging is not available
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $color = switch ($Level.ToUpper()) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "DEBUG" { "Gray" }
        "HEADER" { "Cyan" }
        "CRITICAL" { "Magenta" }
        "PROGRESS" { "Yellow" }
        default { "White" }
    }
    
    $indicator = switch ($Level.ToUpper()) {
        "ERROR" { "[!!]" }
        "WARN" { "[??]" }
        "SUCCESS" { "[OK]" }
        "DEBUG" { "[>>]" }
        "HEADER" { "[==]" }
        "CRITICAL" { "[XX]" }
        "PROGRESS" { "[..]" }
        default { "[--]" }
    }
    
    Write-Host "$timestamp $indicator [$Level] [$Component] $Message" -ForegroundColor $color
    
    # Try to write to log file if context provides a path
    if ($Context -and $Context.Paths -and $Context.Paths.LogOutput) {
        try {
            $logFile = Join-Path $Context.Paths.LogOutput "discovery_$(Get-Date -Format 'yyyyMMdd').log"
            $logEntry = "$timestamp [$Level] [$Component] $Message"
            Add-Content -Path $logFile -Value $logEntry -Encoding UTF8 -ErrorAction SilentlyContinue
        } catch {
            # Silently ignore log file errors
        }
    }
}

Write-Host "[ValidationHelpers.psm1] Module loaded." -ForegroundColor DarkGray
