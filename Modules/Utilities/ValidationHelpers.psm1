#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Validation Helper Functions.
    Provides common functions for validating configurations, prerequisites, data formats,
    and includes a robust PSCustomObject-to-Hashtable converter.

.NOTES
    Version: 1.2.3 (Made Update-TypeData logging import-safe by using Write-Host)
    Author: M&A Discovery Suite Team (Claude & Gemini Collaboration)
    Date: 2025-06-03
#>

# This module assumes Write-MandALog is available globally from EnhancedLogging.psm1 for its exported functions.
# Logging during module-scope execution (like Update-TypeData) uses Write-Host to avoid context issues.

# --- Internal Helper for Logging Fallback ---
function _Write-ValidationLogInternal {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$ConfigurationForLog = $null 
    )
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        # Determine the configuration to use for Write-MandALog
        $effectiveConfig = $null
        if ($ConfigurationForLog -is [hashtable]) {
            $effectiveConfig = $ConfigurationForLog
        } elseif ($global:MandA -and $global:MandA.Config -is [hashtable]) {
            $effectiveConfig = $global:MandA.Config
        }

        if ($effectiveConfig) {
            try {
                Write-MandALog -Message $Message -Level $Level -Configuration $effectiveConfig
            } catch {
                # Fallback if Write-MandALog fails even with a presumed hashtable (e.g., logging module issue)
                Write-Host "[$Level] (ValidationHelpers - Write-MandALog Call Failed: $($_.Exception.Message)) $Message"
            }
        } else {
            # Fallback if no suitable hashtable configuration is found for Write-MandALog
            Write-Host "[$Level] (ValidationHelpers - No Hashtable Config for Write-MandALog) $Message"
        }
    } else {
        Write-Host "[$Level] (ValidationHelpers - Write-MandALog not found) $Message"
    }
}

# --- Public Functions ---

function ConvertTo-HashtableRecursiveInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        $obj
    )
    process {
        if ($null -eq $obj) {
            return $null
        }

        if ($obj -is [System.Management.Automation.PSCustomObject]) {
            $hash = [ordered]@{} 
            foreach ($prop in $obj.PSObject.Properties) {
                $hash[$prop.Name] = ConvertTo-HashtableRecursiveInternal -obj $prop.Value
            }
            return $hash
        } elseif ($obj -is [array]) {
            $arrayOutput = @()
            foreach ($item in $obj) {
                $arrayOutput += ConvertTo-HashtableRecursiveInternal -obj $item
            }
            return $arrayOutput
        } else {
            return $obj
        }
    }
}

function Test-Prerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$false)]
        [switch]$ValidateOnly
    )
    _Write-ValidationLogInternal -Message "Validating system prerequisites..." -Level "INFO" -ConfigurationForLog $Configuration
    $allChecksPass = $true
    
    if ($PSVersionTable.PSVersion.Major -lt 5 -or ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
        _Write-ValidationLogInternal -Message "PowerShell version 5.1 or higher is required. Current version: $($PSVersionTable.PSVersion.ToString())" -Level "ERROR" -ConfigurationForLog $Configuration
        $allChecksPass = $false
    } else {
        _Write-ValidationLogInternal -Message "PowerShell version check passed: $($PSVersionTable.PSVersion.ToString())" -Level "DEBUG" -ConfigurationForLog $Configuration
    }

    if ($null -eq $global:MandA.Paths.SuiteRoot -or -not (Test-Path $global:MandA.Paths.SuiteRoot -PathType Container)) {
        _Write-ValidationLogInternal -Message "`$global:MandA.Paths.SuiteRoot is not set or invalid: '$($global:MandA.Paths.SuiteRoot)'." -Level "ERROR" -ConfigurationForLog $Configuration
        $allChecksPass = $false
    } else {
        _Write-ValidationLogInternal -Message "Suite Root Path check passed: $($global:MandA.Paths.SuiteRoot)" -Level "DEBUG" -ConfigurationForLog $Configuration
    }
    
    if ($Configuration.environment -and $Configuration.environment.HashtableContains('outputPath')) {
        $outputPathToCheck = $Configuration.environment.outputPath
        if (-not (Test-DirectoryWriteAccess -DirectoryPath $outputPathToCheck -ConfigurationForLog $Configuration)) {
            $allChecksPass = $false
        } else {
            _Write-ValidationLogInternal -Message "Output path write access check passed for '$outputPathToCheck'." -Level "DEBUG" -ConfigurationForLog $Configuration
        }
    } else {
        _Write-ValidationLogInternal -Message "environment.outputPath not defined in configuration. Skipping write access check." -Level "WARN" -ConfigurationForLog $Configuration
    }

    if ($allChecksPass) {
        _Write-ValidationLogInternal -Message "All prerequisites validated successfully" -Level "SUCCESS" -ConfigurationForLog $Configuration
    } else {
        _Write-ValidationLogInternal -Message "One or more prerequisite checks failed." -Level "ERROR" -ConfigurationForLog $Configuration
    }
    return $allChecksPass
}

function Get-RequiredModules {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration, 
        [Parameter(Mandatory=$true)]
        [string]$Mode 
    )
    _Write-ValidationLogInternal -Message "Determining required modules for Mode: $Mode" -Level "DEBUG" -ConfigurationForLog $Configuration
    $modulesToLoad = [System.Collections.Generic.List[string]]::new()
    
    $discoveryModuleMapping = @{
        "ActiveDirectory" = "ActiveDirectoryDiscovery.psm1"; "Graph" = "GraphDiscovery.psm1";
        "Exchange" = "ExchangeDiscovery.psm1"; "Azure" = "AzureDiscovery.psm1";
        "Intune" = "IntuneDiscovery.psm1"; "GPO" = "GPODiscovery.psm1";
        "EnhancedGPO" = "EnhancedGPODiscovery.psm1"; "ExternalIdentity" = "ExternalIdentityDiscovery.psm1";
        "FileServer" = "FileServerDiscovery.psm1"; "Licensing" = "LicensingDiscovery.psm1";
        "NetworkInfrastructure" = "NetworkInfrastructureDiscovery.psm1"; "SharePoint" = "SharePointDiscovery.psm1";
        "SQLServer" = "SQLServerDiscovery.psm1"; "Teams" = "TeamsDiscovery.psm1";
        "EnvironmentDetection" = "EnvironmentDetectionDiscovery.psm1" 
    }

    $processingModuleMapping = @{
        "DataAggregation" = "DataAggregation.psm1"; "UserProfileBuilder" = "UserProfileBuilder.psm1";
        "WaveGeneration" = "WaveGeneration.psm1"; "DataValidation" = "DataValidation.psm1"
    }

    $exportModuleMapping = @{
        "CSV" = "CSVExport.psm1"; "JSON" = "JSONExport.psm1";
        "Excel" = "ExcelExport.psm1"; "CompanyControlSheet" = "CompanyControlSheetExporter.psm1";
        "PowerApps" = "PowerAppsExporter.psm1"
    }

    if ($Mode -in @("Discovery", "Full")) {
        if ($Configuration.discovery -and $Configuration.discovery.HashtableContains('enabledSources')) {
            foreach ($sourceName in $Configuration.discovery.enabledSources) {
                if ($discoveryModuleMapping.ContainsKey($sourceName)) {
                    $moduleFileName = $discoveryModuleMapping[$sourceName]
                    $modulePath = Join-Path $global:MandA.Paths.Modules "Discovery\$moduleFileName" 
                    if (-not $modulesToLoad.Contains($modulePath)) { $modulesToLoad.Add($modulePath) }
                } else {
                    _Write-ValidationLogInternal -Message "No module mapping for discovery source: '$sourceName'." -Level "WARN" -ConfigurationForLog $Configuration
                }
            }
        } else {
            _Write-ValidationLogInternal -Message "No 'discovery.enabledSources' in config for Discovery mode." -Level "WARN" -ConfigurationForLog $Configuration
        }
    }

    if ($Mode -in @("Processing", "Full")) {
        foreach ($key in $processingModuleMapping.Keys) {
            $moduleFileName = $processingModuleMapping[$key]
            $modulePath = Join-Path $global:MandA.Paths.Modules "Processing\$moduleFileName"
            if (-not $modulesToLoad.Contains($modulePath)) { $modulesToLoad.Add($modulePath) }
        }
    }

    if ($Mode -in @("Export", "Full")) {
        if ($Configuration.export -and $Configuration.export.HashtableContains('formats')) {
            foreach ($formatName in $Configuration.export.formats) {
                if ($exportModuleMapping.ContainsKey($formatName)) {
                    if ($formatName -eq "Excel" -and (-not ($Configuration.export.HashtableContains('excelEnabled') -and $Configuration.export.excelEnabled -as [bool]))) {
                        _Write-ValidationLogInternal -Message "Excel export format listed but 'excelEnabled' is false. Skipping." -Level "INFO" -ConfigurationForLog $Configuration
                        continue
                    }
                    $moduleFileName = $exportModuleMapping[$formatName]
                    $modulePath = Join-Path $global:MandA.Paths.Modules "Export\$moduleFileName"
                    if (-not $modulesToLoad.Contains($modulePath)) { $modulesToLoad.Add($modulePath) }
                } else {
                     _Write-ValidationLogInternal -Message "No module mapping for export format: '$formatName'." -Level "WARN" -ConfigurationForLog $Configuration
                }
            }
        } else {
             _Write-ValidationLogInternal -Message "No 'export.formats' in config for Export mode." -Level "WARN" -ConfigurationForLog $Configuration
        }
    }
    
    return $modulesToLoad | Select-Object -Unique 
}

function Test-GuidFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$InputString
    )
    $guidPattern = '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$'
    return $InputString -match $guidPattern
}

function Test-EmailFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$EmailAddress
    )
    $emailPattern = '^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
    return $EmailAddress -match $emailPattern
}

function Test-UPNFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$UserPrincipalName
    )
    return Test-EmailFormat -EmailAddress $UserPrincipalName
}

function Test-ConfigurationFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ConfigurationPath,
        [Parameter(Mandatory=$false)] 
        [hashtable]$ConfigurationForLog = $null
    )
    try {
        if (-not (Test-Path $ConfigurationPath -PathType Leaf)) {
            _Write-ValidationLogInternal -Message "Configuration file not found: $ConfigurationPath" -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
            return $false
        }
        
        $configObject = Get-Content $ConfigurationPath -Raw | ConvertFrom-Json -ErrorAction Stop
        $configHashtable = ConvertTo-HashtableRecursiveInternal -obj $configObject

        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        foreach ($section in $requiredSections) {
            if (-not $configHashtable.HashtableContains($section)) {
                _Write-ValidationLogInternal -Message "Missing required config section: '$section' in $ConfigurationPath" -Level "ERROR" -ConfigurationForLog $configHashtable
                return $false
            }
        }
        
        if (-not $configHashtable.environment.HashtableContains('outputPath') -or [string]::IsNullOrWhiteSpace($configHashtable.environment.outputPath)) {
            _Write-ValidationLogInternal -Message "Missing/empty required config: environment.outputPath" -Level "ERROR" -ConfigurationForLog $configHashtable
            return $false
        }
        if (-not $configHashtable.discovery.HashtableContains('enabledSources') -or ($configHashtable.discovery.enabledSources -isnot [array]) -or $configHashtable.discovery.enabledSources.Count -eq 0) {
            _Write-ValidationLogInternal -Message "Config 'discovery.enabledSources' must be a non-empty array." -Level "ERROR" -ConfigurationForLog $configHashtable
            return $false
        }
        
        _Write-ValidationLogInternal -Message "Config file '$ConfigurationPath' passed basic structure checks." -Level "SUCCESS" -ConfigurationForLog $configHashtable
        return $true
        
    } catch {
        _Write-ValidationLogInternal -Message "Config file validation failed for '$ConfigurationPath': $($_.Exception.Message)" -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
        return $false
    }
}

function Test-DirectoryWriteAccess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath,
        [Parameter(Mandatory=$false)]
        [hashtable]$ConfigurationForLog = $null 
    )
    try {
        if (-not (Test-Path $DirectoryPath -PathType Container)) {
            _Write-ValidationLogInternal -Message "Directory '$DirectoryPath' does not exist. Attempting to create." -Level "INFO" -ConfigurationForLog $ConfigurationForLog
            New-Item -Path $DirectoryPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            _Write-ValidationLogInternal -Message "Directory '$DirectoryPath' created." -Level "SUCCESS" -ConfigurationForLog $ConfigurationForLog
        }
        
        $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"
        Set-Content -Path $testFile -Value "test_content_$(Get-Date)" -Encoding UTF8 -ErrorAction Stop
        if (Test-Path $testFile -PathType Leaf) {
            Remove-Item $testFile -Force -ErrorAction SilentlyContinue
            _Write-ValidationLogInternal -Message "Write access confirmed for directory: $DirectoryPath" -Level "DEBUG" -ConfigurationForLog $ConfigurationForLog
            return $true
        } else {
            _Write-ValidationLogInternal -Message "Failed to create test file in $DirectoryPath after Set-Content." -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
            return $false
        }
    } catch {
        _Write-ValidationLogInternal -Message "Directory write access test failed for '$DirectoryPath': $($_.Exception.Message)" -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
        return $false
    }
}

function Test-ModuleAvailability {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$ModuleNames,
        [Parameter(Mandatory=$false)]
        [hashtable]$ConfigurationForLog = $null
    )
    $missingModules = @()
    foreach ($moduleName in $ModuleNames) {
        if (-not (Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue)) {
            $missingModules += $moduleName
        }
    }
    if ($missingModules.Count -gt 0) {
        _Write-ValidationLogInternal -Message "Missing required PowerShell modules: $($missingModules -join ', ')" -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
        return $false
    }
    _Write-ValidationLogInternal -Message "All specified PowerShell modules are available: $($ModuleNames -join ', ')" -Level "DEBUG" -ConfigurationForLog $ConfigurationForLog
    return $true
}

function Test-NetworkConnectivity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$Endpoints, 
        [Parameter(Mandatory=$false)]
        [hashtable]$ConfigurationForLog = $null
    )
    $failedEndpoints = @()
    foreach ($endpoint in $Endpoints) {
        _Write-ValidationLogInternal -Message "Testing network connectivity to '$endpoint' on port 443..." -Level "DEBUG" -ConfigurationForLog $ConfigurationForLog
        $connectionResult = Test-NetConnection -ComputerName $endpoint -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if (-not $connectionResult -or -not $connectionResult.TcpTestSucceeded) { 
            $failedEndpoints += $endpoint
            _Write-ValidationLogInternal -Message "Network connectivity test FAILED for: $endpoint" -Level "WARN" -ConfigurationForLog $ConfigurationForLog
        } else {
            _Write-ValidationLogInternal -Message "Network connectivity test PASSED for: $endpoint" -Level "DEBUG" -ConfigurationForLog $ConfigurationForLog
        }
    }
    if ($failedEndpoints.Count -gt 0) {
        _Write-ValidationLogInternal -Message "Network connectivity failed for one or more endpoints: $($failedEndpoints -join ', ')" -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
        return $false
    }
    _Write-ValidationLogInternal -Message "All specified network endpoints are reachable." -Level "SUCCESS" -ConfigurationForLog $ConfigurationForLog
    return $true
}

function Test-DataQuality {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$Data,
        [Parameter(Mandatory=$true)]
        [array]$RequiredFields,
        [Parameter(Mandatory=$false)]
        [string]$DataType = "Records",
        [Parameter(Mandatory=$false)]
        [hashtable]$ConfigurationForLog = $null
    )
    try {
        _Write-ValidationLogInternal -Message "Performing data quality validation for $DataType" -Level "INFO" -ConfigurationForLog $ConfigurationForLog
        if (-not $Data -or $Data.Count -eq 0) {
            _Write-ValidationLogInternal -Message "No $DataType found for validation, or input data was null." -Level "WARN" -ConfigurationForLog $ConfigurationForLog
            return @{ IsValid = $true; TotalRecords = 0; ValidRecords = 0; InvalidRecords = 0; Issues = @(); QualityScore = 100 }
        }
        
        $validRecords = 0; $invalidRecords = 0; $issuesList = [System.Collections.Generic.List[object]]::new()
        
        foreach ($record in $Data) {
            $recordValid = $true; $recordIssuesList = [System.Collections.Generic.List[string]]::new()
            foreach ($field in $RequiredFields) {
                if (-not $record.PSObject.Properties[$field] -or [string]::IsNullOrWhiteSpace($record.$($field))) { 
                    $recordValid = $false; $recordIssuesList.Add("Missing required field: $field")
                }
            }
            if ($record.PSObject.Properties.Match('UserPrincipalName').Count -gt 0 -and $record.UserPrincipalName -and -not (Test-UPNFormat -UserPrincipalName $record.UserPrincipalName)) {
                $recordValid = $false; $recordIssuesList.Add("Invalid UPN format: $($record.UserPrincipalName)")
            }
            if ($record.PSObject.Properties.Match('Mail').Count -gt 0 -and $record.Mail -and -not (Test-EmailFormat -EmailAddress $record.Mail)) {
                $recordValid = $false; $recordIssuesList.Add("Invalid email format: $($record.Mail)")
            }

            if ($recordValid) { $validRecords++ } 
            else { $invalidRecords++; $issuesList.Add(@{ Record = $record; Issues = $recordIssuesList.ToArray() }) }
        }
        $qualityScore = if ($Data.Count -gt 0) { [math]::Round(($validRecords / $Data.Count) * 100, 2) } else { 100 }
        _Write-ValidationLogInternal -Message "$DataType quality validation completed. Total: $($Data.Count), Valid: $validRecords, Invalid: $invalidRecords, Score: $qualityScore %" -Level "INFO" -ConfigurationForLog $ConfigurationForLog
        if ($invalidRecords -gt 0) { _Write-ValidationLogInternal -Message "Data quality issues found. Review validation report." -Level "WARN" -ConfigurationForLog $ConfigurationForLog }
        return @{ IsValid = ($invalidRecords -eq 0); TotalRecords = $Data.Count; ValidRecords = $validRecords; InvalidRecords = $invalidRecords; QualityScore = $qualityScore; Issues = $issuesList.ToArray() }
    } catch {
        _Write-ValidationLogInternal -Message "Data quality validation failed: $($_.Exception.Message)" -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
        return @{ IsValid = $false; TotalRecords = 0; ValidRecords = 0; InvalidRecords = 0; QualityScore = 0; Issues = @("Validation process failed: $($_.Exception.Message)") }
    }
}

function Export-ValidationReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ValidationResults,
        [Parameter(Mandatory=$true)]
        [string]$OutputPath, 
        [Parameter(Mandatory=$false)]
        [string]$ReportName = "ValidationReport",
        [Parameter(Mandatory=$false)]
        [hashtable]$ConfigurationForLog = $null
    )
    try {
        if (-not (Test-Path $OutputPath -PathType Container)) {
            _Write-ValidationLogInternal -Message "Output path '$OutputPath' for validation report does not exist. Creating." -Level WARN -ConfigurationForLog $ConfigurationForLog
            New-Item -Path $OutputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
        }
        $reportFile = Join-Path $OutputPath "$ReportName`_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
        $reportData = [System.Collections.Generic.List[PSObject]]::new()
        
        if ($ValidationResults.Issues -and $ValidationResults.Issues.Count -gt 0) {
            foreach ($issueEntry in $ValidationResults.Issues) { 
                if ($issueEntry.Issues -and $issueEntry.Record) {
                    foreach ($issueDetail in $issueEntry.Issues) {
                        $recordIdentifier = "N/A"
                        if ($issueEntry.Record.PSObject.Properties['UserPrincipalName'] -and $issueEntry.Record.UserPrincipalName) { $recordIdentifier = $issueEntry.Record.UserPrincipalName }
                        elseif ($issueEntry.Record.PSObject.Properties['DisplayName'] -and $issueEntry.Record.DisplayName) { $recordIdentifier = $issueEntry.Record.DisplayName }
                        elseif ($issueEntry.Record.PSObject.Properties['SamAccountName'] -and $issueEntry.Record.SamAccountName) { $recordIdentifier = $issueEntry.Record.SamAccountName }
                        elseif ($issueEntry.Record.PSObject.Properties['Name'] -and $issueEntry.Record.Name) { $recordIdentifier = $issueEntry.Record.Name }
                        elseif ($issueEntry.Record.PSObject.Properties['Id'] -and $issueEntry.Record.Id) { $recordIdentifier = $issueEntry.Record.Id }

                        $reportData.Add([PSCustomObject]@{
                            Timestamp        = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                            RecordIdentifier = $recordIdentifier
                            Issue            = $issueDetail
                            RecordKeyFields  = ($issueEntry.Record | Select-Object UserPrincipalName, DisplayName, SamAccountName, Mail, Id -ErrorAction SilentlyContinue | ConvertTo-Json -Compress -Depth 1)
                        })
                    }
                }
            }
        }
        if ($reportData.Count -gt 0) {
            $reportData | Export-Csv -Path $reportFile -NoTypeInformation -Encoding UTF8 -ErrorAction Stop
            _Write-ValidationLogInternal -Message "Validation report exported: $reportFile" -Level "SUCCESS" -ConfigurationForLog $ConfigurationForLog
        } else {
            _Write-ValidationLogInternal -Message "No issues found to export in validation report." -Level "INFO" -ConfigurationForLog $ConfigurationForLog
        }
        return $reportFile
    } catch {
        _Write-ValidationLogInternal -Message "Failed to export validation report: $($_.Exception.Message)" -Level "ERROR" -ConfigurationForLog $ConfigurationForLog
        return $null
    }
}

# Add HashtableContains to the type data for hashtables if not already present
# This script method allows using $myHashtable.HashtableContains('myKey')
if (-not ([hashtable].GetMethods() | Where-Object Name -eq 'HashtableContains')) {
    $methodScriptBlock = [scriptblock]{ param([string]$Key) return $this.ContainsKey($Key) }
    $psMethodParameters = @{
        Name = 'HashtableContains'
        MemberType = 'ScriptMethod'
        Value = $methodScriptBlock
        Force = $true 
    }
    try {
        Update-TypeData -TypeName System.Collections.Hashtable @psMethodParameters
        # Use Write-Host for logging during module import to avoid issues with Write-MandALog context
        Write-Host "[DEBUG] (ValidationHelpers) Successfully added 'HashtableContains' method to System.Collections.Hashtable." -ForegroundColor Gray
    } catch {
        # Use Write-Host here as well
        Write-Host "[WARN] (ValidationHelpers) Error adding 'HashtableContains' method to Hashtable: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}


# Export functions
Export-ModuleMember -Function ConvertTo-HashtableRecursiveInternal, Test-Prerequisites, Get-RequiredModules, Test-GuidFormat, Test-EmailFormat, Test-UPNFormat, Test-ConfigurationFile, Test-DirectoryWriteAccess, Test-ModuleAvailability, Test-NetworkConnectivity, Test-DataQuality, Export-ValidationReport

Write-Host "ValidationHelpers.psm1 (v1.2.3) loaded, includes PS 5.1 compatible HashtableContains helper and import-safe logging." -ForegroundColor DarkCyan
