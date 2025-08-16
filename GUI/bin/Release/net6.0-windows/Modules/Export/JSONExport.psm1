# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    JSON Export Module for M&A Discovery Suite
.DESCRIPTION
    This module is responsible for exporting processed data including user profiles, migration waves, 
    complexity analysis, and discovery results to JSON files. It provides comprehensive JSON export 
    capabilities with data formatting, validation, and structured output formats for M&A reporting 
    and analysis workflows.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, EnhancedLogging module
#>

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    try {
        if ($null -eq $script:ModuleContext) {
            if ($null -ne $global:MandA) {
                $script:ModuleContext = $global:MandA
            } else {
                throw "Module context not available"
            }
        }
        return $script:ModuleContext
    } catch {
        Write-MandALog "Error in function 'Get-ModuleContext': $($_.Exception.Message)" "ERROR"
        throw
    }
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

# Main function to export data to JSON files
function Export-ToJSON {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [hashtable]$ProcessedData, # Contains UserProfiles, MigrationWaves, ComplexityAnalysis, etc.

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory = $false)]
        $Context = $null,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet('Minimal', 'Standard', 'Detailed', 'Complete')]
        [string]$ExportLevel = 'Standard',
        
        [Parameter(Mandatory = $false)]
        [switch]$IndentedOutput,
        
        [Parameter(Mandatory = $false)]
        [int]$MaxDepth = 10
    )

    # Define local logging wrappers
    $LogInfo = {
        param($MessageParam, $LevelParam="INFO")
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $MessageParam -Level $LevelParam -Component "JSONExport" -Context $Context
        } else {
            Write-Host "[$LevelParam][JSONExport] $MessageParam" -ForegroundColor $(
                switch ($LevelParam) {
                    "ERROR" { "Red" }
                    "WARN" { "Yellow" }
                    "SUCCESS" { "Green" }
                    "DEBUG" { "Gray" }
                    default { "White" }
                }
            )
        }
    }
    $LogError = { param($MessageParam) & $LogInfo $MessageParam "ERROR" }
    $LogSuccess = { param($MessageParam) & $LogInfo $MessageParam "SUCCESS" }
    $LogWarn = { param($MessageParam) & $LogInfo $MessageParam "WARN" }
    $LogDebug = { param($MessageParam) & $LogInfo $MessageParam "DEBUG" }

    & $LogInfo "Starting JSON Export Process (Level: $ExportLevel)..."
    
    # Determine output path - try multiple configuration paths
    $processedOutputPath = $null
    if ($Context -and $Context.Paths -and $Context.Paths.ProcessedDataOutput) {
        $processedOutputPath = $Context.Paths.ProcessedDataOutput
    } elseif ($Configuration.environment -and $Configuration.environment.outputPath) {
        $processedOutputPath = Join-Path $Configuration.environment.outputPath "Processed"
    } elseif ($Configuration.paths -and $Configuration.paths.processedDataOutput) {
        $processedOutputPath = $Configuration.paths.processedDataOutput
    } else {
        & $LogError "Cannot determine processed data output path from configuration"
        return $false
    }

    # Create JSON-specific subdirectory
    $jsonOutputPath = Join-Path $processedOutputPath "JSON"
    if (-not (Test-Path $jsonOutputPath)) {
        try {
            New-Item -Path $jsonOutputPath -ItemType Directory -Force | Out-Null
            & $LogInfo "Created directory for JSON exports: $jsonOutputPath"
        } catch {
            & $LogError "Failed to create JSON export directory '$jsonOutputPath': $($_.Exception.Message)"
            return $false
        }
    }

    # Helper to handle data loading if $ProcessedData is null (for "Export Only" mode)
    function Get-DataForExport {
        param(
            [string]$KeyName,
            [hashtable]$DirectInputData,
            [string]$ExpectedFilePath
        )
        if ($null -ne $DirectInputData -and $DirectInputData.ContainsKey($KeyName) -and $null -ne $DirectInputData[$KeyName]) {
            & $LogDebug "Using $KeyName data passed directly to export function."
            return $DirectInputData[$KeyName]
        } elseif (Test-Path $ExpectedFilePath) {
            & $LogInfo "Loading $KeyName data from file for export: $ExpectedFilePath"
            try {
                return Import-Csv -Path $ExpectedFilePath
            } catch {
                & $LogWarn "Failed to load $KeyName from $ExpectedFilePath. Error: $($_.Exception.Message)"
                return @()
            }
        } else {
            & $LogWarn "$KeyName data not passed directly and file not found at $ExpectedFilePath. Cannot export."
            return @()
        }
    }

    # Helper function to prepare data for JSON export based on level
    function Prepare-DataForExport {
        param(
            [Parameter(Mandatory=$true)]
            $InputData,
            [Parameter(Mandatory=$true)]
            [string]$DataType,
            [Parameter(Mandatory=$true)]
            [string]$ExportLevel
        )
        
        $filteredData = @()
        
        foreach ($item in $InputData) {
            $exportItem = @{}
            
            switch ($ExportLevel) {
                'Minimal' {
                    switch ($DataType) {
                        'Users' {
                            $exportItem = @{
                                UserPrincipalName = $item.UserPrincipalName
                                DisplayName = $item.DisplayName
                                Department = $item.Department
                                Title = $item.Title
                                Enabled = $item.Enabled
                                ComplexityScore = if ($item.PSObject.Properties['ComplexityScore']) { $item.ComplexityScore } else { 0 }
                                MigrationCategory = if ($item.PSObject.Properties['MigrationCategory']) { $item.MigrationCategory } else { 'Not Assessed' }
                            }
                        }
                        'Devices' {
                            $exportItem = @{
                                DeviceId = $item.DeviceId
                                DisplayName = $item.DisplayName
                                DeviceType = $item.DeviceType
                                IsCompliant = $item.IsCompliant
                            }
                        }
                        default {
                            $exportItem = $item
                        }
                    }
                }
                'Standard' {
                    switch ($DataType) {
                        'Users' {
                            $exportItem = @{
                                UserPrincipalName = $item.UserPrincipalName
                                DisplayName = $item.DisplayName
                                GivenName = $item.GivenName
                                Surname = $item.Surname
                                Department = $item.Department
                                Title = $item.Title
                                Manager = if ($item.PSObject.Properties['ManagerUPN']) { $item.ManagerUPN } else { $item.Manager }
                                Enabled = $item.Enabled
                                Mail = $item.Mail
                                HasExchangeMailbox = $item.HasExchangeMailbox
                                MailboxType = $item.MailboxType
                                IsGuestUser = $item.IsGuestUser
                                DeviceCount = $item.DeviceCount
                                GroupCount = $item.GroupCount
                                LicenseCount = $item.LicenseCount
                                TeamCount = $item.TeamCount
                                ComplexityScore = if ($item.PSObject.Properties['ComplexityScore']) { $item.ComplexityScore } else { 0 }
                                MigrationCategory = if ($item.PSObject.Properties['MigrationCategory']) { $item.MigrationCategory } else { 'Not Assessed' }
                                ReadinessStatus = if ($item.PSObject.Properties['ReadinessStatus']) { $item.ReadinessStatus } else { 'Not Assessed' }
                            }
                        }
                        'Devices' {
                            $exportItem = @{
                                DeviceId = $item.DeviceId
                                DisplayName = $item.DisplayName
                                DeviceType = $item.DeviceType
                                OperatingSystem = $item.OperatingSystem
                                IsCompliant = $item.IsCompliant
                                IsManaged = $item.IsManaged
                                TrustType = $item.TrustType
                                RegisteredOwners = $item.RegisteredOwners
                            }
                        }
                        default {
                            # For standard level, copy all simple properties
                            foreach ($prop in $item.PSObject.Properties) {
                                if ($prop.Value -isnot [array] -and $prop.Value -isnot [hashtable] -and $prop.Name -notlike '_*') {
                                    $exportItem[$prop.Name] = $prop.Value
                                }
                            }
                        }
                    }
                }
                'Detailed' {
                    # Include most properties but simplify complex ones
                    foreach ($prop in $item.PSObject.Properties) {
                        if ($prop.Name -notlike '_*' -and $prop.Name -notin @('DataSources', 'MergeCount', 'LastModified')) {
                            if ($prop.Value -is [array]) {
                                $exportItem[$prop.Name] = @($prop.Value | ForEach-Object {
                                    if ($_.PSObject.Properties['DisplayName']) { $_.DisplayName }
                                    elseif ($_.PSObject.Properties['Name']) { $_.Name }
                                    elseif ($_.PSObject.Properties['TeamName']) { $_.TeamName }
                                    elseif ($_.PSObject.Properties['SkuPartNumber']) { $_.SkuPartNumber }
                                    else { $_.ToString() }
                                })
                            } elseif ($prop.Value -is [hashtable]) {
                                $exportItem[$prop.Name] = $prop.Value
                            } else {
                                $exportItem[$prop.Name] = $prop.Value
                            }
                        }
                    }
                }
                'Complete' {
                    # Export everything except system metadata
                    foreach ($prop in $item.PSObject.Properties) {
                        if ($prop.Name -notin @('DataSources', 'MergeCount', 'LastModified')) {
                            $exportItem[$prop.Name] = $prop.Value
                        }
                    }
                }
            }
            
            $filteredData += $exportItem
        }
        
        return $filteredData
    }

    # Check if we have processed data from DataAggregation module
    $exportStats = @{ FilesExported = 0; RecordsExported = 0; Errors = 0 }
    
    if ($ProcessedData -and $ProcessedData.ContainsKey("Users") -and $ProcessedData.Users.Count -gt 0) {
        & $LogInfo "Exporting aggregated user data from DataAggregation module..."
        
        # Export main Users.json (consolidated user data)
        try {
            $userFile = Join-Path $jsonOutputPath "Users.json"
            $exportUsers = Prepare-DataForExport -InputData $ProcessedData.Users -DataType 'Users' -ExportLevel $ExportLevel
            
            $userExportData = @{
                Metadata = @{
                    ExportDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    ExportLevel = $ExportLevel
                    TotalRecords = $exportUsers.Count
                    DataSource = "DataAggregation"
                    Version = "1.0.0"
                }
                Users = $exportUsers
            }
            
            if ($IndentedOutput) {
                $userExportData | ConvertTo-Json -Depth $MaxDepth | Set-Content -Path $userFile -Encoding UTF8
            } else {
                $userExportData | ConvertTo-Json -Depth $MaxDepth -Compress | Set-Content -Path $userFile -Encoding UTF8
            }
            
            & $LogSuccess "Exported Users.json ($($ProcessedData.Users.Count) records)"
            $exportStats.FilesExported++
            $exportStats.RecordsExported += $ProcessedData.Users.Count
            
        } catch {
            & $LogError "Failed to export Users.json: $($_.Exception.Message)"
            $exportStats.Errors++
        }
    }
    
    # Export devices if available
    if ($ProcessedData -and $ProcessedData.ContainsKey("Devices") -and $ProcessedData.Devices.Count -gt 0) {
        try {
            $deviceFile = Join-Path $jsonOutputPath "Devices.json"
            $exportDevices = Prepare-DataForExport -InputData $ProcessedData.Devices -DataType 'Devices' -ExportLevel $ExportLevel
            
            $deviceExportData = @{
                Metadata = @{
                    ExportDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    ExportLevel = $ExportLevel
                    TotalRecords = $exportDevices.Count
                    DataSource = "DataAggregation"
                    Version = "1.0.0"
                }
                Devices = $exportDevices
            }
            
            if ($IndentedOutput) {
                $deviceExportData | ConvertTo-Json -Depth $MaxDepth | Set-Content -Path $deviceFile -Encoding UTF8
            } else {
                $deviceExportData | ConvertTo-Json -Depth $MaxDepth -Compress | Set-Content -Path $deviceFile -Encoding UTF8
            }
            
            & $LogSuccess "Exported Devices.json ($($ProcessedData.Devices.Count) records)"
            $exportStats.FilesExported++
            $exportStats.RecordsExported += $ProcessedData.Devices.Count
            
        } catch {
            & $LogError "Failed to export Devices.json: $($_.Exception.Message)"
            $exportStats.Errors++
        }
    }
    
    # Export other data sources if available
    if ($ProcessedData -and $ProcessedData.ContainsKey("DataSources")) {
        $skipSources = @( # Already handled above or derived data
            'ADUsers', 'ActiveDirectory_Users', 'AD_Users', 'GraphUsers', 'Graph_Users', 'AAD_Users', 'AzureAD_Users',
            'ExchangeMailboxUsers', 'Exchange_MailboxUsers', 'ExchangeUsers', 'MailboxUsers',
            'ADComputers', 'ActiveDirectory_Computers', 'AD_Computers', 'GraphDevices', 'Graph_Devices', 'AAD_Devices', 'AzureAD_Devices',
            'IntuneDevices', 'Intune_Devices', 'MDM_Devices', 'UserProfiles'
        )
        
        foreach ($sourceKey in $ProcessedData.DataSources.Keys) {
            if ($sourceKey -notin $skipSources -and $ProcessedData.DataSources[$sourceKey] -and @($ProcessedData.DataSources[$sourceKey]).Count -gt 0) {
                try {
                    $fileName = "$sourceKey.json"
                    $filePath = Join-Path $jsonOutputPath $fileName
                    $sourceData = @($ProcessedData.DataSources[$sourceKey])
                    
                    $exportData = Prepare-DataForExport -InputData $sourceData -DataType $sourceKey -ExportLevel $ExportLevel
                    
                    $sourceExportData = @{
                        Metadata = @{
                            ExportDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                            ExportLevel = $ExportLevel
                            TotalRecords = $exportData.Count
                            DataSource = $sourceKey
                            Version = "1.0.0"
                        }
                        Data = $exportData
                    }
                    
                    if ($IndentedOutput) {
                        $sourceExportData | ConvertTo-Json -Depth $MaxDepth | Set-Content -Path $filePath -Encoding UTF8
                    } else {
                        $sourceExportData | ConvertTo-Json -Depth $MaxDepth -Compress | Set-Content -Path $filePath -Encoding UTF8
                    }
                    
                    & $LogSuccess "Exported $fileName ($($sourceData.Count) records)"
                    $exportStats.FilesExported++
                    $exportStats.RecordsExported += $sourceData.Count
                    
                } catch {
                    & $LogError "Failed to export $sourceKey.json: $($_.Exception.Message)"
                    $exportStats.Errors++
                }
            }
        }
    }
    
    # Export comprehensive summary with statistics
    try {
        $summaryFile = Join-Path $jsonOutputPath "ExportSummary.json"
        $summaryData = @{
            Export = @{
                Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                ExportLevel = $ExportLevel
                IndentedOutput = $IndentedOutput.IsPresent
                MaxDepth = $MaxDepth
                FilesExported = $exportStats.FilesExported
                RecordsExported = $exportStats.RecordsExported
                Errors = $exportStats.Errors
                OutputPath = $jsonOutputPath
            }
            Statistics = if ($ProcessedData -and $ProcessedData.ContainsKey("Stats")) { $ProcessedData.Stats } else { @{} }
            Summary = @{
                UserCount = if ($ProcessedData -and $ProcessedData.Users) { $ProcessedData.Users.Count } else { 0 }
                DeviceCount = if ($ProcessedData -and $ProcessedData.Devices) { $ProcessedData.Devices.Count } else { 0 }
                DataSourcesProcessed = if ($ProcessedData -and $ProcessedData.DataSources) { $ProcessedData.DataSources.Keys.Count } else { 0 }
                ExportComplete = $exportStats.Errors -eq 0
            }
            Configuration = @{
                ExportSettings = @{
                    Level = $ExportLevel
                    Format = "JSON"
                    Compression = -not $IndentedOutput.IsPresent
                    MaxDepth = $MaxDepth
                }
                Paths = @{
                    OutputDirectory = $jsonOutputPath
                    ProcessedDataOutput = $processedOutputPath
                }
            }
        }
        
        if ($IndentedOutput) {
            $summaryData | ConvertTo-Json -Depth ($MaxDepth + 2) | Set-Content -Path $summaryFile -Encoding UTF8
        } else {
            $summaryData | ConvertTo-Json -Depth ($MaxDepth + 2) -Compress | Set-Content -Path $summaryFile -Encoding UTF8
        }
        
        & $LogSuccess "Exported ExportSummary.json"
        $exportStats.FilesExported++
        
    } catch {
        & $LogError "Failed to export ExportSummary.json: $($_.Exception.Message)"
        $exportStats.Errors++
    }

    & $LogInfo "JSON Export Process completed: $($exportStats.FilesExported) files, $($exportStats.RecordsExported) total records"
    if ($exportStats.Errors -gt 0) {
        & $LogWarn "Export completed with $($exportStats.Errors) errors"
    }
    
    return @{
        Status = if ($exportStats.Errors -eq 0) { "Completed" } else { "Completed with errors" }
        FilesExported = $exportStats.FilesExported
        RecordsExported = $exportStats.RecordsExported
        Errors = $exportStats.Errors
        OutputPath = $jsonOutputPath
        ExportLevel = $ExportLevel
        IndentedOutput = $IndentedOutput.IsPresent
        MaxDepth = $MaxDepth
    }
}

# Helper function to convert CSV data to JSON
function Convert-CSVToJSON {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$CSVPath,
        
        [Parameter(Mandatory=$true)]
        [string]$JSONPath,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Minimal', 'Standard', 'Detailed', 'Complete')]
        [string]$ExportLevel = 'Standard',
        
        [Parameter(Mandatory=$false)]
        [switch]$IndentedOutput,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxDepth = 10,
        
        [Parameter(Mandatory=$false)]
        $Context = $null
    )
    
    # Define local logging wrapper
    $LogInfo = {
        param($MessageParam, $LevelParam="INFO")
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $MessageParam -Level $LevelParam -Component "JSONExport" -Context $Context
        } else {
            Write-Host "[$LevelParam][JSONExport] $MessageParam" -ForegroundColor $(
                switch ($LevelParam) {
                    "ERROR" { "Red" }
                    "WARN" { "Yellow" }
                    "SUCCESS" { "Green" }
                    "DEBUG" { "Gray" }
                    default { "White" }
                }
            )
        }
    }
    
    try {
        if (-not (Test-Path $CSVPath)) {
            & $LogInfo "CSV file not found: $CSVPath" "ERROR"
            return $false
        }
        
        & $LogInfo "Converting CSV to JSON: $CSVPath -> $JSONPath" "INFO"
        
        # Import CSV data
        $csvData = Import-Csv -Path $CSVPath
        
        if ($csvData.Count -eq 0) {
            & $LogInfo "No data found in CSV file: $CSVPath" "WARN"
            return $false
        }
        
        # Prepare data based on export level
        $dataType = [System.IO.Path]::GetFileNameWithoutExtension($CSVPath)
        $exportData = Prepare-DataForExport -InputData $csvData -DataType $dataType -ExportLevel $ExportLevel
        
        # Create JSON structure
        $jsonData = @{
            Metadata = @{
                SourceFile = [System.IO.Path]::GetFileName($CSVPath)
                ConversionDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                ExportLevel = $ExportLevel
                TotalRecords = $exportData.Count
                Version = "1.0.0"
            }
            Data = $exportData
        }
        
        # Ensure output directory exists
        $outputDir = [System.IO.Path]::GetDirectoryName($JSONPath)
        if (-not (Test-Path $outputDir)) {
            New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
        }
        
        # Export to JSON
        if ($IndentedOutput) {
            $jsonData | ConvertTo-Json -Depth $MaxDepth | Set-Content -Path $JSONPath -Encoding UTF8
        } else {
            $jsonData | ConvertTo-Json -Depth $MaxDepth -Compress | Set-Content -Path $JSONPath -Encoding UTF8
        }
        
        & $LogInfo "Successfully converted CSV to JSON ($($csvData.Count) records)" "SUCCESS"
        return $true
        
    } catch {
        & $LogInfo "Failed to convert CSV to JSON: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

Export-ModuleMember -Function Export-ToJSON, Convert-CSVToJSON