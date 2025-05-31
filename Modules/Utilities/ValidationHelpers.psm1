<#
.SYNOPSIS
    Validation helpers for M&A Discovery Suite
.DESCRIPTION
    Provides input validation, data quality checks, and module requirement resolution.
.NOTES
    Version: 1.2.0 (Merged user's comprehensive helpers with improved Get-RequiredModules)
    Date: 2025-05-31
#>

# --- Helper Functions (Assumed to be available globally) ---
# Write-MandALog (This script assumes Write-MandALog is available from EnhancedLogging.psm1)
# Import-DataFromCSV (Assumed to be available from FileOperations.psm1 or similar)
# Export-DataToCSV (Assumed to be available from FileOperations.psm1 or similar)


# --- Public Functions ---

function Test-Prerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        [switch]$ValidateOnly
    )
    Write-MandALog "Validating system prerequisites..." -Level "INFO"
    $allChecksPass = $true
    
    # Example Check 1: PowerShell Version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-MandALog "PowerShell version 5.0 or higher is required. Current version: $($PSVersionTable.PSVersion.ToString())" -Level "ERROR"
        $allChecksPass = $false
    } else {
        Write-MandALog "PowerShell version check passed: $($PSVersionTable.PSVersion.ToString())" -Level "DEBUG"
    }

    # Example Check 2: Essential Paths (assuming $global:MandASuiteRoot is set)
    if (-not $global:MandASuiteRoot -or -not (Test-Path $global:MandASuiteRoot -PathType Container)) {
        Write-MandALog "`$global:MandASuiteRoot is not set or invalid: '$($global:MandASuiteRoot)'. This is critical." -Level "ERROR"
        $allChecksPass = $false
    } else {
         Write-MandALog "Suite Root Path check passed: $($global:MandASuiteRoot)" -Level "DEBUG"
    }
    
    # Example Check 3: Output Path Write Access (if defined in config)
    if ($Configuration.environment -and $Configuration.environment.outputPath) {
        $outputPathToCheck = $Configuration.environment.outputPath
        if ([System.IO.Path]::IsPathRooted($outputPathToCheck)) {
            # Absolute path
        } else {
            # Relative path, resolve against SuiteRoot
            $outputPathToCheck = Join-Path $global:MandASuiteRoot $outputPathToCheck
        }
        if (-not (Test-DirectoryWriteAccess -DirectoryPath $outputPathToCheck)) {
            # Test-DirectoryWriteAccess should log its own detailed error
            $allChecksPass = $false
        } else {
            Write-MandALog "Output path write access check passed for '$outputPathToCheck'." -Level "DEBUG"
        }
    } else {
        Write-MandALog "environment.outputPath not defined in configuration. Skipping write access check for it." -Level "WARN"
    }

    # Add more checks as needed: Required external modules (Graph, Az), .NET version, disk space, etc.
    # Some of these can be handled by DiscoverySuiteModuleCheck.ps1 for external PS modules.

    if ($allChecksPass) {
        Write-MandALog "All prerequisites validated successfully" -Level "SUCCESS"
    } else {
        Write-MandALog "One or more prerequisite checks failed. Review logs for details." -Level "ERROR"
    }
    return $allChecksPass
}

function Get-RequiredModules {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [string]$Mode # e.g., "Discovery", "Processing", "Export", "Full"
    )
    Write-MandALog "Determining required modules for Mode: $Mode" -Level "DEBUG"
    $modulesToLoad = [System.Collections.Generic.List[string]]::new()
    
    # Define the mapping from configuration source names to actual .psm1 filenames
    # Ensure these filenames match exactly what's in your Modules/Discovery/ (and other) directories.
    $discoveryModuleMapping = @{
        "ActiveDirectory"       = "ActiveDirectoryDiscovery.psm1"
        "Graph"                 = "GraphDiscovery.psm1"
        "Exchange"              = "ExchangeDiscovery.psm1"
        "Azure"                 = "AzureDiscovery.psm1"
        "Intune"                = "IntuneDiscovery.psm1"
        "GPO"                   = "GPODiscovery.psm1" # Base GPO module
        "EnhancedGPO"           = "EnhancedGPODiscovery.psm1" # Your specific enhanced one
        "ExternalIdentity"      = "ExternalIdentityDiscovery.psm1"
        "FileServer"            = "FileServerDiscovery.psm1"
        "Licensing"             = "LicensingDiscovery.psm1" 
        "NetworkInfrastructure" = "NetworkInfrastructureDiscovery.psm1"
        "SharePoint"            = "SharePointDiscovery.psm1" 
        "SQLServer"             = "SQLServerDiscovery.psm1"
        "Teams"                 = "TeamsDiscovery.psm1" 
        "EnvironmentDetection"  = "EnvironmentDetection.psm1"
        # Add other discovery sources here if they have their own modules
    }

    $processingModuleMapping = @{
        "DataAggregation"    = "DataAggregation.psm1"
        "UserProfileBuilder" = "UserProfileBuilder.psm1"
        "WaveGeneration"     = "WaveGeneration.psm1"
        "DataValidation"     = "DataValidation.psm1"
        # "ComplexityCalculator" = "ComplexityCalculator.psm1" # Example if you have this
    }

    $exportModuleMapping = @{
        "CSV"                 = "CSVExport.psm1"
        "JSON"                = "JSONExport.psm1"
        "Excel"               = "ExcelExport.psm1" 
        "CompanyControlSheet" = "CompanyControlSheetExporter.psm1"
        "PowerApps"           = "PowerAppsExporter.psm1" # If dedicated module for PowerApps format
    }

    # Determine which modules to load based on the mode
    if ($Mode -in @("Discovery", "Full")) {
        if ($Configuration.discovery -and $Configuration.discovery.enabledSources) {
            foreach ($sourceName in $Configuration.discovery.enabledSources) {
                if ($discoveryModuleMapping.ContainsKey($sourceName)) {
                    $moduleFileName = $discoveryModuleMapping[$sourceName]
                    # Use $global:MandAModulesPath which is Join-Path $global:MandASuiteRoot "Modules"
                    $modulePath = Join-Path $global:MandAModulesPath "Discovery\$moduleFileName" 
                    if (-not $modulesToLoad.Contains($modulePath)) { $modulesToLoad.Add($modulePath) }
                } else {
                    Write-MandALog "No module mapping found for enabled discovery source: '$sourceName'. It will be skipped." -Level "WARN"
                }
            }
        } else {
            Write-MandALog "No 'discovery.enabledSources' defined in configuration for Discovery mode." -Level "WARN"
        }
    }

    if ($Mode -in @("Processing", "Full")) {
        foreach ($key in $processingModuleMapping.Keys) {
            $moduleFileName = $processingModuleMapping[$key]
            $modulePath = Join-Path $global:MandAModulesPath "Processing\$moduleFileName"
            if (-not $modulesToLoad.Contains($modulePath)) { $modulesToLoad.Add($modulePath) }
        }
    }

    if ($Mode -in @("Export", "Full")) {
        if ($Configuration.export -and $Configuration.export.formats) {
            foreach ($formatName in $Configuration.export.formats) {
                if ($exportModuleMapping.ContainsKey($formatName)) {
                    $moduleFileName = $exportModuleMapping[$formatName]
                    $modulePath = Join-Path $global:MandAModulesPath "Export\$moduleFileName"
                    if (-not $modulesToLoad.Contains($modulePath)) { $modulesToLoad.Add($modulePath) }
                } else {
                     Write-MandALog "No module mapping found for enabled export format: '$formatName'. It will be skipped." -Level "WARN"
                }
            }
            # Handle powerAppsOptimized flag if it implies a specific "PowerApps" module not listed in formats
            if (($Configuration.export.powerAppsOptimized -as [bool]) -and 
                $exportModuleMapping.ContainsKey("PowerApps") -and 
                -not ($Configuration.export.formats -contains "PowerApps")) {
                 
                 $modulePath = Join-Path $global:MandAModulesPath "Export\$($exportModuleMapping['PowerApps'])"
                 if (-not $modulesToLoad.Contains($modulePath)) { 
                    $modulesToLoad.Add($modulePath) 
                    Write-MandALog "Adding PowerAppsExporter.psm1 due to powerAppsOptimized flag." -Level "DEBUG"
                 }
            }
        } else {
             Write-MandALog "No 'export.formats' defined in configuration for Export mode." -Level "WARN"
        }
    }
    
    # Return unique list of paths
    # Select-Object -Unique on strings is fine.
    return $modulesToLoad | Select-Object -Unique 
}

function Test-GuidFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$InputString
    )
    $guidPattern = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return $InputString -match $guidPattern
}

function Test-EmailFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$EmailAddress
    )
    $emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return $EmailAddress -match $emailPattern
}

function Test-UPNFormat {
    param(
        [Parameter(Mandatory=$true)]
        [string]$UserPrincipalName
    )
    # UPN format: user@domain.com
    return Test-EmailFormat -EmailAddress $UserPrincipalName
}

function Test-ConfigurationFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ConfigurationPath
    )
    try {
        if (-not (Test-Path $ConfigurationPath -PathType Leaf)) { # Ensure it's a file
            Write-MandALog "Configuration file not found: $ConfigurationPath" -Level "ERROR"
            return $false
        }
        
        # Attempt to parse as JSON. ConvertFrom-Json will throw on invalid JSON.
        $configObject = Get-Content $ConfigurationPath -Raw | ConvertFrom-Json -ErrorAction Stop
        
        # Validate required top-level sections (adjust as per your actual schema)
        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        foreach ($section in $requiredSections) {
            if (-not $configObject.PSObject.Properties[$section]) {
                Write-MandALog "Missing required configuration section: '$section' in $ConfigurationPath" -Level "ERROR"
                return $false
            }
        }
        
        # Validate specific required keys within sections (examples)
        if (-not $configObject.environment.PSObject.Properties['outputPath'] -or [string]::IsNullOrWhiteSpace($configObject.environment.outputPath)) {
            Write-MandALog "Missing or empty required configuration: environment.outputPath" -Level "ERROR"
            return $false
        }
        if (-not $configObject.environment.PSObject.Properties['logLevel'] -or [string]::IsNullOrWhiteSpace($configObject.environment.logLevel)) {
            Write-MandALog "Missing or empty required configuration: environment.logLevel" -Level "ERROR"
            return $false
        }
        if (-not $configObject.discovery.PSObject.Properties['enabledSources'] -or ($configObject.discovery.enabledSources -isnot [array]) -or $configObject.discovery.enabledSources.Count -eq 0) {
            Write-MandALog "Configuration 'discovery.enabledSources' must be a non-empty array." -Level "ERROR"
            return $false
        }
        
        Write-MandALog "Configuration file '$ConfigurationPath' validation passed basic structure checks." -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Configuration file validation failed for '$ConfigurationPath': $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-DirectoryWriteAccess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath
    )
    try {
        if (-not (Test-Path $DirectoryPath -PathType Container)) {
            Write-MandALog "Directory '$DirectoryPath' does not exist. Attempting to create." -Level "INFO"
            New-Item -Path $DirectoryPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-MandALog "Directory '$DirectoryPath' created." -Level "SUCCESS"
        }
        
        $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"
        "test_content_$(Get-Date)" | Out-File -FilePath $testFile -Encoding UTF8 -ErrorAction Stop
        if (Test-Path $testFile -PathType Leaf) {
            Remove-Item $testFile -Force -ErrorAction SilentlyContinue
            Write-MandALog "Write access confirmed for directory: $DirectoryPath" -Level "DEBUG"
            return $true
        } else {
            Write-MandALog "Failed to create test file in $DirectoryPath. Write access denied or issue." -Level "ERROR"
            return $false
        }
    } catch {
        Write-MandALog "Directory write access test failed for '$DirectoryPath': $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-ModuleAvailability {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$ModuleNames
    )
    $missingModules = @()
    foreach ($moduleName in $ModuleNames) {
        if (-not (Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue)) {
            $missingModules += $moduleName
        }
    }
    if ($missingModules.Count -gt 0) {
        Write-MandALog "Missing required PowerShell modules: $($missingModules -join ', ')" -Level "ERROR"
        return $false
    }
    Write-MandALog "All specified PowerShell modules are available: $($ModuleNames -join ', ')" -Level "DEBUG"
    return $true
}

function Test-NetworkConnectivity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$Endpoints # Array of hostnames or IPs
    )
    $failedEndpoints = @()
    foreach ($endpoint in $Endpoints) {
        Write-MandALog "Testing network connectivity to '$endpoint' on port 443..." -Level "DEBUG"
        if (-not (Test-NetConnection -ComputerName $endpoint -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue)) {
            $failedEndpoints += $endpoint
            Write-MandALog "Network connectivity test FAILED for: $endpoint" -Level "WARN"
        } else {
            Write-MandALog "Network connectivity test PASSED for: $endpoint" -Level "DEBUG"
        }
    }
    if ($failedEndpoints.Count -gt 0) {
        Write-MandALog "Network connectivity failed for one or more endpoints: $($failedEndpoints -join ', ')" -Level "ERROR"
        return $false
    }
    Write-MandALog "All specified network endpoints are reachable." -Level "SUCCESS"
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
        [string]$DataType = "Records"
    )
    try {
        Write-MandALog "Performing data quality validation for $DataType" -Level "INFO"
        if (-not $Data -or $Data.Count -eq 0) { # Check if $Data is null or empty
            Write-MandALog "No $DataType found for validation, or input data was null." -Level "WARN"
            return @{ IsValid = $true; TotalRecords = 0; ValidRecords = 0; InvalidRecords = 0; Issues = @(); QualityScore = 100 }
        }
        
        $validRecords = 0; $invalidRecords = 0; $issues = [System.Collections.Generic.List[object]]::new()
        
        foreach ($record in $Data) {
            $recordValid = $true; $recordIssues = [System.Collections.Generic.List[string]]::new()
            foreach ($field in $RequiredFields) {
                if (-not $record.PSObject.Properties[$field] -or [string]::IsNullOrWhiteSpace($record.$field)) {
                    $recordValid = $false; $recordIssues.Add("Missing required field: $field")
                }
            }
            if ($record.PSObject.Properties['UserPrincipalName'] -and $record.UserPrincipalName -and -not (Test-UPNFormat -UserPrincipalName $record.UserPrincipalName)) {
                $recordValid = $false; $recordIssues.Add("Invalid UPN format: $($record.UserPrincipalName)")
            }
            if ($record.PSObject.Properties['Mail'] -and $record.Mail -and -not (Test-EmailFormat -EmailAddress $record.Mail)) {
                $recordValid = $false; $recordIssues.Add("Invalid email format: $($record.Mail)")
            }
            if ($recordValid) { $validRecords++ } 
            else { $invalidRecords++; $issues.Add(@{ Record = $record; Issues = $recordIssues.ToArray() }) }
        }
        $qualityScore = if ($Data.Count -gt 0) { [math]::Round(($validRecords / $Data.Count) * 100, 2) } else { 100 }
        Write-MandALog "$DataType quality validation completed. Total: $($Data.Count), Valid: $validRecords, Invalid: $invalidRecords, Score: $qualityScore %" -Level "INFO"
        if ($invalidRecords -gt 0) { Write-MandALog "Data quality issues found. Review validation report." -Level "WARN" }
        return @{ IsValid = ($invalidRecords -eq 0); TotalRecords = $Data.Count; ValidRecords = $validRecords; InvalidRecords = $invalidRecords; QualityScore = $qualityScore; Issues = $issues.ToArray() }
    } catch {
        Write-MandALog "Data quality validation failed: $($_.Exception.Message)" -Level "ERROR"
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
        [string]$ReportName = "ValidationReport"
    )
    try {
        $reportFile = Join-Path $OutputPath "$ReportName`_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
        $reportData = [System.Collections.Generic.List[PSObject]]::new()
        
        if ($ValidationResults.Issues -and $ValidationResults.Issues.Count -gt 0) {
            foreach ($issueEntry in $ValidationResults.Issues) { # issueEntry is a hashtable @{Record=...; Issues=...}
                if ($issueEntry.Issues -and $issueEntry.Record) {
                    foreach ($issueDetail in $issueEntry.Issues) {
                        $recordIdentifier = "Unknown"
                        if ($issueEntry.Record.PSObject.Properties['UserPrincipalName'] -and $issueEntry.Record.UserPrincipalName) { $recordIdentifier = $issueEntry.Record.UserPrincipalName }
                        elseif ($issueEntry.Record.PSObject.Properties['DisplayName'] -and $issueEntry.Record.DisplayName) { $recordIdentifier = $issueEntry.Record.DisplayName }
                        elseif ($issueEntry.Record.PSObject.Properties['Name'] -and $issueEntry.Record.Name) { $recordIdentifier = $issueEntry.Record.Name }
                        elseif ($issueEntry.Record.PSObject.Properties['Id'] -and $issueEntry.Record.Id) { $recordIdentifier = $issueEntry.Record.Id }

                        $reportData.Add([PSCustomObject]@{
                            Timestamp        = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                            RecordIdentifier = $recordIdentifier
                            Issue            = $issueDetail
                            RecordData       = ($issueEntry.Record | ConvertTo-Json -Compress -Depth 3)
                        })
                    }
                }
            }
        }
        if ($reportData.Count -gt 0) {
            $reportData | Export-Csv -Path $reportFile -NoTypeInformation -Encoding UTF8 -ErrorAction Stop
            Write-MandALog "Validation report exported: $reportFile" -Level "SUCCESS"
        } else {
            Write-MandALog "No issues found to export in validation report." -Level "INFO"
        }
        return $reportFile
    } catch {
        Write-MandALog "Failed to export validation report: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

# Export functions
Export-ModuleMember -Function Test-Prerequisites, Get-RequiredModules, Test-GuidFormat, Test-EmailFormat, Test-UPNFormat, Test-ConfigurationFile, Test-DirectoryWriteAccess, Test-ModuleAvailability, Test-NetworkConnectivity, Test-DataQuality, Export-ValidationReport
