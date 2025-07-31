# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    CSV Export Module for M&A Discovery Suite
.DESCRIPTION
    This module is responsible for exporting processed data including user profiles, migration waves, complexity analysis, 
    and discovery results to CSV files. It provides comprehensive CSV export capabilities with data formatting, 
    validation, and standardized output formats for M&A reporting and analysis workflows.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
#>

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
{
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



#[CmdletBinding()]
#param()


# NOTE: Global environment check has been moved to function scope to avoid module loading issues.
# Functions will check for the global context when they are called, rather than at module import time.

# Main function to export data to CSV files
function Export-ToCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [hashtable]$ProcessedData, # Contains UserProfiles, MigrationWaves, ComplexityAnalysis, etc.

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory = $false)]
        $Context = $null
    )

    # Define local logging wrappers
    $LogInfo = {
        param($MessageParam, $LevelParam="INFO")
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $MessageParam -Level $LevelParam -Component "CSVExport" -Context $Context
        } else {
            Write-Host "[$LevelParam][CSVExport] $MessageParam" -ForegroundColor $(
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

    & $LogInfo "Starting CSV Export Process..."
    
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

    # Ensure the output directory exists
    if (-not (Test-Path $processedOutputPath)) {
        try {
            New-Item -Path $processedOutputPath -ItemType Directory -Force | Out-Null
            & $LogInfo "Created directory for CSV exports: $processedOutputPath"
        } catch {
            & $LogError "Failed to create CSV export directory '$processedOutputPath': $($_.Exception.Message)"
            return $false
        }
    }

    # Helper to handle data loading if $ProcessedData is null (for "Export Only" mode)
    function Get-DataForExport {
        param(
            [string]$KeyName, # e.g., "Users"
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

    # Check if we have processed data from DataAggregation module
    $exportStats = @{ FilesExported = 0; RecordsExported = 0; Errors = 0 }
    
    if ($ProcessedData -and $ProcessedData.ContainsKey("Users") -and $ProcessedData.Users.Count -gt 0) {
        & $LogInfo "Exporting aggregated user data from DataAggregation module..."
        
        # Export main Users.csv (consolidated user data)
        try {
            $userFile = Join-Path $processedOutputPath "Users.csv"
            $exportUsers = foreach ($user in $ProcessedData.Users) {
                $exportUser = $user.PSObject.Copy()
                # Flatten complex properties for CSV export
                if ($exportUser.PSObject.Properties['GroupMemberships'] -and $exportUser.GroupMemberships -is [array]) {
                    $exportUser.GroupMemberships = $exportUser.GroupMemberships -join ';'
                }
                if ($exportUser.PSObject.Properties['AssociatedDevices'] -and $exportUser.AssociatedDevices -is [array]) {
                    $exportUser.AssociatedDevices = ($exportUser.AssociatedDevices | ForEach-Object {
                        if ($_.PSObject.Properties['DisplayName']) { $_.DisplayName } else { $_.ToString() }
                    }) -join ';'
                }
                if ($exportUser.PSObject.Properties['TeamMemberships'] -and $exportUser.TeamMemberships -is [array]) {
                    $exportUser.TeamMemberships = ($exportUser.TeamMemberships | ForEach-Object {
                        if ($_.PSObject.Properties['TeamName']) { $_.TeamName } else { $_.ToString() }
                    }) -join ';'
                }
                if ($exportUser.PSObject.Properties['AssignedLicenses'] -and $exportUser.AssignedLicenses -is [array]) {
                    $exportUser.AssignedLicenses = ($exportUser.AssignedLicenses | ForEach-Object {
                        if ($_.PSObject.Properties['SkuPartNumber']) { $_.SkuPartNumber } else { $_.ToString() }
                    }) -join ';'
                }
                if ($exportUser.PSObject.Properties['DirectReports'] -and $exportUser.DirectReports -is [array]) {
                    $exportUser.DirectReports = $exportUser.DirectReports -join ';'
                }
                
                # Remove system properties from merge
                $propsToRemove = @('DataSources', 'MergeCount', 'LastModified')
                foreach($propName in $propsToRemove){
                    if($exportUser.PSObject.Properties.Name -contains $propName){
                        $exportUser.PSObject.Properties.Remove($propName)
                    }
                }
                $exportUser
            }
            
            $exportUsers | Export-Csv -Path $userFile -NoTypeInformation -Encoding UTF8 -Force
            & $LogSuccess "Exported Users.csv ($($ProcessedData.Users.Count) records)"
            $exportStats.FilesExported++
            $exportStats.RecordsExported += $ProcessedData.Users.Count
            
        } catch {
            & $LogError "Failed to export Users.csv: $($_.Exception.Message)"
            $exportStats.Errors++
        }
        
        # Export UserProfiles.csv for downstream compatibility
        try {
            $profileFile = Join-Path $processedOutputPath "UserProfiles.csv"
            $ProcessedData.Users | Select-Object UserPrincipalName, DisplayName, GivenName, Surname,
                                    Department, Title,
                                    @{N='Manager';E={if($_.PSObject.Properties['ManagerUPN']){$_.ManagerUPN}else{$_.Manager}}},
                                    Enabled, Mail, HasExchangeMailbox, MailboxType, IsGuestUser,
                                    DeviceCount, GroupCount, LicenseCount, TeamCount,
                                    @{N='ComplexityScore';E={if($_.PSObject.Properties['ComplexityScore']){$_.ComplexityScore}else{0}}},
                                    @{N='MigrationCategory';E={if($_.PSObject.Properties['MigrationCategory']){$_.MigrationCategory}else{'Not Assessed'}}},
                                    @{N='ReadinessStatus';E={if($_.PSObject.Properties['ReadinessStatus']){$_.ReadinessStatus}else{'Not Assessed'}}} |
                Export-Csv -Path $profileFile -NoTypeInformation -Encoding UTF8 -Force
            & $LogSuccess "Exported UserProfiles.csv for downstream compatibility"
            $exportStats.FilesExported++
            
        } catch {
            & $LogError "Failed to export UserProfiles.csv: $($_.Exception.Message)"
            $exportStats.Errors++
        }
    }
    
    # Export devices if available
    if ($ProcessedData -and $ProcessedData.ContainsKey("Devices") -and $ProcessedData.Devices.Count -gt 0) {
        try {
            $deviceFile = Join-Path $processedOutputPath "Devices.csv"
            $exportDevices = foreach ($device in $ProcessedData.Devices) {
                $exportDevice = $device.PSObject.Copy()
                # Remove system properties from merge
                $propsToRemove = @('DataSources', 'MergeCount', 'LastModified')
                foreach($propName in $propsToRemove){
                    if($exportDevice.PSObject.Properties.Name -contains $propName){
                        $exportDevice.PSObject.Properties.Remove($propName)
                    }
                }
                $exportDevice
            }
            
            $exportDevices | Export-Csv -Path $deviceFile -NoTypeInformation -Encoding UTF8 -Force
            & $LogSuccess "Exported Devices.csv ($($ProcessedData.Devices.Count) records)"
            $exportStats.FilesExported++
            $exportStats.RecordsExported += $ProcessedData.Devices.Count
            
        } catch {
            & $LogError "Failed to export Devices.csv: $($_.Exception.Message)"
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
                    $fileName = "$sourceKey.csv"
                    $filePath = Join-Path $processedOutputPath $fileName
                    $sourceData = @($ProcessedData.DataSources[$sourceKey])
                    
                    $sourceData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8 -Force
                    & $LogSuccess "Exported $fileName ($($sourceData.Count) records)"
                    $exportStats.FilesExported++
                    $exportStats.RecordsExported += $sourceData.Count
                    
                } catch {
                    & $LogError "Failed to export $sourceKey.csv: $($_.Exception.Message)"
                    $exportStats.Errors++
                }
            }
        }
    }
    
    # Export aggregation summary if available
    if ($ProcessedData -and $ProcessedData.ContainsKey("Stats")) {
        try {
            $summaryFile = Join-Path $processedOutputPath "AggregationSummary.json"
            $summaryData = @{
                Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Statistics = $ProcessedData.Stats
                UserCount = if($ProcessedData.Users){$ProcessedData.Users.Count}else{0}
                DeviceCount = if($ProcessedData.Devices){$ProcessedData.Devices.Count}else{0}
                DataSourcesProcessed = if($ProcessedData.DataSources){$ProcessedData.DataSources.Keys.Count}else{0}
                ExportStats = $exportStats
            }
            $summaryData | ConvertTo-Json -Depth 5 | Set-Content -Path $summaryFile -Encoding UTF8
            & $LogSuccess "Exported AggregationSummary.json"
            $exportStats.FilesExported++
            
        } catch {
            & $LogError "Failed to export AggregationSummary.json: $($_.Exception.Message)"
            $exportStats.Errors++
        }
    }

    & $LogInfo "CSV Export Process completed: $($exportStats.FilesExported) files, $($exportStats.RecordsExported) total records"
    if ($exportStats.Errors -gt 0) {
        & $LogWarn "Export completed with $($exportStats.Errors) errors"
    }
    
    return @{
        Status = if ($exportStats.Errors -eq 0) { "Completed" } else { "Completed with errors" }
        FilesExported = $exportStats.FilesExported
        RecordsExported = $exportStats.RecordsExported
        Errors = $exportStats.Errors
    }
}

Export-ModuleMember -Function Export-ToCSV


