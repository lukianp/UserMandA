<#
.SYNOPSIS
    Validation helpers for M&A Discovery Suite
.DESCRIPTION
    Provides input validation and data quality checks
#>


function Get-RequiredModules {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory = $true)]
        [string]$Mode # Expected values: "Discovery", "Processing", "Export", "Full"
    )

    Write-Verbose "Getting required modules for Mode: $Mode"
    $modulesToLoadPaths = [System.Collections.Generic.List[string]]::new()

    # --- Define Mappings ---
    # Discovery sources to module files (relative to Modules/Discovery/)
    # Ensure the keys here (e.g., "ActiveDirectory") match the strings used in $Configuration.discovery.enabledSources
    # Ensure the .psm1 filenames match the actual files in your Modules/Discovery/ directory.
    $discoveryModuleMapping = @{
        "ActiveDirectory"    = "ActiveDirectoryDiscovery.psm1"
        "Graph"              = "GraphDiscovery.psm1"
        "Exchange"           = "ExchangeDiscovery.psm1"      # Assumed filename for "Exchange" source (planned)
        "Azure"              = "AzureDiscovery.psm1"         # Assumed filename for "Azure" source (planned)
        "Intune"             = "IntuneDiscovery.psm1"        # Assumed filename for "Intune" source (planned)
        "GPO"                = "EnhancedGPODiscovery.psm1"   # Maps "GPO" source to the enhanced module
        "ExternalIdentity"   = "ExternalIdentityDiscovery.psm1"
        # Add other discovery sources and their corresponding module files here
    }

    # Processing modules (relative to Modules/Processing/) - these are usually all needed for processing phase
    # Ensure these .psm1 filenames match the actual files in your Modules/Processing/ directory.
    $processingModules = @(
        "DataAggregation.psm1",
        "UserProfileBuilder.psm1", # Assuming this handles complexity or a separate ComplexityCalculator.psm1 exists
        "WaveGeneration.psm1",
        "DataValidation.psm1"
        # "ComplexityCalculator.psm1" # Add if separate and always needed for processing
    )

    # Export formats to module files (relative to Modules/Export/)
    # Ensure the keys here (e.g., "CSV") match the strings used in $Configuration.export.formats
    # Ensure the .psm1 filenames match the actual files in your Modules/Export/ directory.
    $exportModuleMapping = @{
        "CSV"     = "CSVExport.psm1"
        "Excel"   = "ExcelExport.psm1" # Assumed filename for "Excel" format (planned)
        "JSON"    = "JSONExport.psm1"
        # If "PowerApps" is a format in config that maps to a specific file, add it here:
        # "PowerApps" = "PowerAppsExporter.psm1" 
    }
    # Path for a potentially dedicated PowerApps export module, if not covered by the 'formats' array
    $powerAppsDedicatedModuleFile = "PowerAppsExporter.psm1" # Assumed filename for dedicated PowerApps export (planned)

    # --- Determine Modules Based on Mode and Configuration ---

    # Discovery Modules
    if ($Mode -in @("Discovery", "Full")) {
        if ($Configuration.discovery -and $Configuration.discovery.enabledSources) {
            foreach ($source in $Configuration.discovery.enabledSources) {
                if ($discoveryModuleMapping.ContainsKey($source)) {
                    $moduleFileName = $discoveryModuleMapping[$source]
                    $modulePath = Join-Path $global:MandAModulesPath "Discovery\$moduleFileName"
                    if (-not $modulesToLoadPaths.Contains($modulePath)) {
                        $modulesToLoadPaths.Add($modulePath)
                    }
                } else {
                    Write-MandALog "No module mapping found for enabled discovery source: '$source'. It will be skipped." -Level "WARN"
                }
            }
        }
    }

    # Processing Modules
    if ($Mode -in @("Processing", "Full")) {
        foreach ($moduleFileName in $processingModules) {
            $modulePath = Join-Path $global:MandAModulesPath "Processing\$moduleFileName"
            if (-not $modulesToLoadPaths.Contains($modulePath)) {
                $modulesToLoadPaths.Add($modulePath)
            }
        }
    }

    # Export Modules
    if ($Mode -in @("Export", "Full")) {
        if ($Configuration.export -and $Configuration.export.formats) {
            foreach ($format in $Configuration.export.formats) {
                if ($exportModuleMapping.ContainsKey($format)) {
                    $moduleFileName = $exportModuleMapping[$format]
                    $modulePath = Join-Path $global:MandAModulesPath "Export\$moduleFileName"
                    if (-not $modulesToLoadPaths.Contains($modulePath)) {
                        $modulesToLoadPaths.Add($modulePath)
                    }
                } else {
                    Write-MandALog "No module mapping found for enabled export format: '$format'. It will be skipped." -Level "WARN"
                }
            }
        }
        # Handle PowerApps optimized export if it's a separate module and enabled via the specific flag
        if ($Configuration.export -and $Configuration.export.powerAppsOptimized) {
            $powerAppsModulePath = Join-Path $global:MandAModulesPath "Export\$powerAppsDedicatedModuleFile"
            # Add only if not already added (e.g., if "PowerApps" was also a format type in the array and mapped above)
            if (-not $modulesToLoadPaths.Contains($powerAppsModulePath)) {
                # This logic assumes PowerAppsExporter.psm1 is a dedicated module.
                # If PowerApps export functionality is built into JSONExport.psm1 (or another module)
                # and triggered by the $Configuration.export.powerAppsOptimized flag,
                # then that module (e.g., JSONExport.psm1) would already be loaded if "JSON" is in formats.
                # In such a case, this specific block for $powerAppsDedicatedModuleFile might not be strictly necessary
                # for module loading, as the functionality would reside within an already loaded module.
                # However, if PowerAppsExporter.psm1 is truly separate, this ensures it's loaded.
                $modulesToLoadPaths.Add($powerAppsModulePath)
                Write-MandALog "PowerApps optimized export is enabled. Attempting to load '$powerAppsDedicatedModuleFile' if it's a distinct module." -Level "INFO"
            }
        }
    }
    
    Write-Verbose "Final list of modules to load for mode '$Mode': $($modulesToLoadPaths -join ', ')"
    return $modulesToLoadPaths.ToArray() # Return as a standard array
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
    param(
        [Parameter(Mandatory=$true)]
        [string]$ConfigurationPath
    )
    
    try {
        if (-not (Test-Path $ConfigurationPath)) {
            Write-MandALog "Configuration file not found: $ConfigurationPath" -Level "ERROR"
            return $false
        }
        
        $config = Get-Content $ConfigurationPath | ConvertFrom-Json -AsHashtable -ErrorAction Stop
        
        # Validate required sections
        $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
        foreach ($section in $requiredSections) {
            if (-not $config.ContainsKey($section)) {
                Write-MandALog "Missing required configuration section: $section" -Level "ERROR"
                return $false
            }
        }
        
        # Validate environment section
        $envConfig = $config.environment
        if (-not $envConfig.outputPath) {
            Write-MandALog "Missing required configuration: environment.outputPath" -Level "ERROR"
            return $false
        }
        
        if (-not $envConfig.logLevel) {
            Write-MandALog "Missing required configuration: environment.logLevel" -Level "ERROR"
            return $false
        }
        
        # Validate discovery section
        $discoveryConfig = $config.discovery
        if (-not $discoveryConfig.enabledSources -or $discoveryConfig.enabledSources.Count -eq 0) {
            Write-MandALog "No discovery sources enabled in configuration" -Level "ERROR"
            return $false
        }
        
        Write-MandALog "Configuration file validation passed" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Configuration file validation failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-DirectoryWriteAccess {
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath
    )
    
    try {
        # Create directory if it doesn't exist
        if (-not (Test-Path $DirectoryPath)) {
            New-Item -Path $DirectoryPath -ItemType Directory -Force | Out-Null
        }
        
        # Test write access by creating a temporary file
        $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"
        "test" | Out-File -FilePath $testFile -ErrorAction Stop
        Remove-Item $testFile -Force -ErrorAction SilentlyContinue
        
        return $true
        
    } catch {
        Write-MandALog "Directory write access test failed for $DirectoryPath`: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-ModuleAvailability {
    param(
        [Parameter(Mandatory=$true)]
        [array]$ModuleNames
    )
    
    $missingModules = @()
    
    foreach ($moduleName in $ModuleNames) {
        if (-not (Get-Module -ListAvailable -Name $moduleName)) {
            $missingModules += $moduleName
        }
    }
    
    if ($missingModules.Count -gt 0) {
        Write-MandALog "Missing required modules: $($missingModules -join ', ')" -Level "ERROR"
        return $false
    }
    
    return $true
}

function Test-NetworkConnectivity {
    param(
        [Parameter(Mandatory=$true)]
        [array]$Endpoints
    )
    
    $failedEndpoints = @()
    
    foreach ($endpoint in $Endpoints) {
        try {
            $result = Test-NetConnection -ComputerName $endpoint -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
            if (-not $result) {
                $failedEndpoints += $endpoint
            }
        } catch {
            $failedEndpoints += $endpoint
        }
    }
    
    if ($failedEndpoints.Count -gt 0) {
        Write-MandALog "Network connectivity failed for: $($failedEndpoints -join ', ')" -Level "ERROR"
        return $false
    }
    
    return $true
}

function Test-DataQuality {
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
        
        if ($Data.Count -eq 0) {
            Write-MandALog "No $DataType found for validation" -Level "WARN"
            return @{
                IsValid = $true
                TotalRecords = 0
                ValidRecords = 0
                InvalidRecords = 0
                Issues = @()
            }
        }
        
        $validRecords = 0
        $invalidRecords = 0
        $issues = @()
        
        foreach ($record in $Data) {
            $recordValid = $true
            $recordIssues = @()
            
            # Check required fields
            foreach ($field in $RequiredFields) {
                if (-not $record.$field -or [string]::IsNullOrWhiteSpace($record.$field)) {
                    $recordValid = $false
                    $recordIssues += "Missing required field: $field"
                }
            }
            
            # Validate specific field formats
            if ($record.UserPrincipalName -and -not (Test-UPNFormat -UserPrincipalName $record.UserPrincipalName)) {
                $recordValid = $false
                $recordIssues += "Invalid UPN format: $($record.UserPrincipalName)"
            }
            
            if ($record.Mail -and -not (Test-EmailFormat -EmailAddress $record.Mail)) {
                $recordValid = $false
                $recordIssues += "Invalid email format: $($record.Mail)"
            }
            
            if ($recordValid) {
                $validRecords++
            } else {
                $invalidRecords++
                $issues += @{
                    Record = $record
                    Issues = $recordIssues
                }
            }
        }
        
        $qualityScore = if ($Data.Count -gt 0) { ($validRecords / $Data.Count) * 100 } else { 100 }
        
        Write-MandALog "$DataType quality validation completed" -Level "SUCCESS"
        Write-MandALog "Total Records: $($Data.Count)" -Level "INFO"
        Write-MandALog "Valid Records: $validRecords" -Level "INFO"
        Write-MandALog "Invalid Records: $invalidRecords" -Level "INFO"
        Write-MandALog "Quality Score: $([math]::Round($qualityScore, 2))%" -Level "INFO"
        
        if ($invalidRecords -gt 0) {
            Write-MandALog "Data quality issues found. Review the validation report." -Level "WARN"
        }
        
        return @{
            IsValid = ($qualityScore -ge 90)
            TotalRecords = $Data.Count
            ValidRecords = $validRecords
            InvalidRecords = $invalidRecords
            QualityScore = $qualityScore
            Issues = $issues
        }
        
    } catch {
        Write-MandALog "Data quality validation failed: $($_.Exception.Message)" -Level "ERROR"
        return @{
            IsValid = $false
            TotalRecords = 0
            ValidRecords = 0
            InvalidRecords = 0
            QualityScore = 0
            Issues = @("Validation process failed: $($_.Exception.Message)")
        }
    }
}

function Export-ValidationReport {
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
        
        $reportData = @()
        
        foreach ($issue in $ValidationResults.Issues) {
            foreach ($issueDetail in $issue.Issues) {
                $reportData += [PSCustomObject]@{
                    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    RecordIdentifier = if ($issue.Record.UserPrincipalName) { $issue.Record.UserPrincipalName } elseif ($issue.Record.DisplayName) { $issue.Record.DisplayName } else { "Unknown" }
                    Issue = $issueDetail
                    RecordData = ($issue.Record | ConvertTo-Json -Compress)
                }
            }
        }
        
        if ($reportData.Count -gt 0) {
            $reportData | Export-Csv -Path $reportFile -NoTypeInformation -Encoding UTF8
            Write-MandALog "Validation report exported: $reportFile" -Level "SUCCESS"
        }
        
        return $reportFile
        
    } catch {
        Write-MandALog "Failed to export validation report: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Test-GuidFormat',
    'Test-EmailFormat',
    'Test-UPNFormat',
    'Test-ConfigurationFile',
    'Test-DirectoryWriteAccess',
    'Test-ModuleAvailability',
    'Test-NetworkConnectivity',
    'Test-DataQuality',
    'Export-ValidationReport'
)
