# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header


<#
.SYNOPSIS

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
    Enhanced Data Aggregation Module for M&A Discovery Suite
.DESCRIPTION
    This module is the core of the processing phase. It reads all raw CSV files,
    merges them into unified datasets, enriches the data with relationships,
    performs data quality checks, and prepares consolidated output for export.
.NOTES
    Version: 2.1.0
    Author: Enhanced Version
    Creation Date: 2025-06-03
    Last Modified: 2025-06-04
    Change Log:
        - 2.1.0: Removed script-scope $Context usage causing import errors.
                 Corrected Start-DataAggregation signature to accept $Context parameter.
                 Ensured functions use passed $Context or $global:MandA for paths.
                 Initialized AggregationStats Errors/Warnings as ArrayList.
                 Propagated $Context to helper functions for consistent logging.
                 Improved Get-DomainFromDN.
#>

# NOTE: Global environment check has been moved to function scope to avoid module loading issues.
# Functions will check for the global context when they are called, rather than at module import time.

#region Module Variables
$script:AggregationStats = @{
    StartTime = $null
    EndTime = $null
    TotalSourceFiles = 0
    TotalRecordsProcessed = 0
    MergeOperations = 0
    RelationshipsCreated = 0
    DataQualityIssues = 0
    Warnings = [System.Collections.ArrayList]::new()
    Errors = [System.Collections.ArrayList]::new()
}
#endregion

#region Internal Helper Functions

#===============================================================================
# Import-RawDataSources
# Enhanced version with better error handling and progress reporting
#===============================================================================
function Import-RawDataSources {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$RawDataPath,
        [Parameter(Mandatory=$false)]
        $Context
    )

    # Define local logging wrappers that use the passed $Context
    $LogInfo = { param($MessageParam, $LevelParam="INFO") Write-MandALog -Message $MessageParam -Level $LevelParam -Component "DataAggregation" -Context $Context }
    $LogError = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "ERROR" -Component "DataAggregation" -Context $Context }
    $LogWarn = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "WARN" -Component "DataAggregation" -Context $Context }
    $LogDebug = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "DEBUG" -Component "DataAggregation" -Context $Context }
    $LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context }

    & $LogInfo "======================================================================="
    & $LogInfo "Loading raw data sources from: $RawDataPath"
    & $LogInfo "======================================================================="
    
    $dataSources = @{}
    $loadStats = @{
        Successful = 0
        Failed = 0
        Empty = 0
        TotalRecords = 0
    }

    if (-not (Test-Path $RawDataPath -PathType Container)) {
        & $LogError "Raw data path not found: $RawDataPath. Cannot proceed with aggregation."
        $null = $script:AggregationStats.Errors.Add("Raw data path not found: $RawDataPath")
        return $null
    }

    $csvFiles = Get-ChildItem -Path $RawDataPath -Filter "*.csv" -File | Sort-Object Name
    if ($csvFiles.Count -eq 0) {
        & $LogWarn "No raw CSV files found in $RawDataPath."
        $null = $script:AggregationStats.Warnings.Add("No CSV files found in raw data directory")
        return $dataSources
    }

    & $LogInfo "Found $($csvFiles.Count) raw CSV files to process."
    $script:AggregationStats.TotalSourceFiles = $csvFiles.Count

    $sourceNameMappings = @{
        'ADUsers' = @('ActiveDirectory_Users', 'AD_Users'); 'AD_Users' = @('ActiveDirectory_Users'); 'ActiveDirectoryUsers' = @('ActiveDirectory_Users');
        'GraphUsers' = @('Graph_Users', 'AAD_Users', 'AzureAD_Users'); 'AADUsers' = @('Graph_Users', 'AzureAD_Users'); 'AzureADUsers' = @('Graph_Users', 'AAD_Users');
        'ExchangeMailboxUsers' = @('Exchange_MailboxUsers', 'Exchange_Users'); 'ExchangeUsers' = @('Exchange_MailboxUsers'); 'MailboxUsers' = @('Exchange_MailboxUsers');
        'ADComputers' = @('ActiveDirectory_Computers', 'AD_Computers'); 'AD_Computers' = @('ActiveDirectory_Computers'); 'ActiveDirectoryComputers' = @('ActiveDirectory_Computers');
        'GraphDevices' = @('Graph_Devices', 'AAD_Devices'); 'AADDevices' = @('Graph_Devices', 'AzureAD_Devices'); 'AzureADDevices' = @('Graph_Devices', 'AAD_Devices');
        'IntuneDevices' = @('Intune_Devices', 'MDM_Devices');
        'ADGroups' = @('ActiveDirectory_Groups', 'AD_Groups'); 'AD_Groups' = @('ActiveDirectory_Groups'); 'ActiveDirectoryGroups' = @('ActiveDirectory_Groups');
        'GraphGroups' = @('Graph_Groups', 'AAD_Groups'); 'AADGroups' = @('Graph_Groups', 'AzureAD_Groups'); 'AzureADGroups' = @('Graph_Groups', 'AAD_Groups');
        'ADGroupMembers' = @('ActiveDirectory_GroupMembers', 'AD_GroupMembers'); 'AD_GroupMembers' = @('ActiveDirectory_GroupMembers'); 'ActiveDirectoryGroupMembers' = @('ActiveDirectory_GroupMembers')
    }

    $fileCounter = 0
    foreach ($file in $csvFiles) {
        $fileCounter++
        $sourceName = $file.BaseName
        $percentComplete = [math]::Round(($fileCounter / $csvFiles.Count) * 100, 0)
        
        if(Get-Command Write-Progress -ErrorAction SilentlyContinue){
            Write-Progress -Activity "Importing Raw Data Sources" -Status "Processing $($file.Name)" -PercentComplete $percentComplete
        }
        & $LogDebug "[$fileCounter/$($csvFiles.Count)] Importing file: $($file.Name)"
        
        try {
            $importStart = Get-Date
            $content = Import-Csv -Path $file.FullName -ErrorAction Stop
            $importTime = ((Get-Date) - $importStart).TotalSeconds
            
            if ($null -ne $content) {
                $recordCount = @($content).Count
                
                if ($recordCount -eq 0) {
                    & $LogWarn "  File '$($file.Name)' is empty (0 records)."
                    $loadStats.Empty++
                    $null = $script:AggregationStats.Warnings.Add("Empty file: $($file.Name)")
                } else {
                    $dataSources[$sourceName] = $content
                    & $LogSuccess "  Successfully imported '$sourceName' with $recordCount records (${importTime}s)"
                    $loadStats.Successful++
                    $loadStats.TotalRecords += $recordCount
                    
                    if ($sourceNameMappings.ContainsKey($sourceName)) {
                        foreach ($mappedName in $sourceNameMappings[$sourceName]) {
                            $dataSources[$mappedName] = $content
                            & $LogDebug "    Also mapped to '$mappedName' for compatibility."
                        }
                    }
                    Invoke-SourceSpecificEnrichment -SourceName $sourceName -Data $content -Context $Context
                }
            } else {
                & $LogWarn "  File '$($file.Name)' returned null content."
                $loadStats.Failed++
                $null = $script:AggregationStats.Warnings.Add("Null content: $($file.Name)")
            }
        }
        catch {
            & $LogError "  Failed to import '$($file.Name)': $($_.Exception.Message)"
            $loadStats.Failed++
            $null = $script:AggregationStats.Errors.Add("Import failed: $($file.Name) - $($_.Exception.Message)")
        }
    }
    
    if(Get-Command Write-Progress -ErrorAction SilentlyContinue){
        Write-Progress -Activity "Importing Raw Data Sources" -Completed
    }

    & $LogInfo "======================================================================="
    & $LogInfo "Data source loading completed:"
    & $LogInfo "  Files processed: $($csvFiles.Count)"
    & $LogSuccess "  Successfully loaded: $($loadStats.Successful)"
    & $LogInfo ("  Failed to load: $($loadStats.Failed)") -LevelParam $(if ($loadStats.Failed -gt 0) { "ERROR" } else { "INFO" })
    & $LogInfo ("  Empty files: $($loadStats.Empty)") -LevelParam $(if ($loadStats.Empty -gt 0) { "WARN" } else { "INFO" })
    & $LogInfo "  Total records imported: $($loadStats.TotalRecords)"
    & $LogInfo "  Total unique sources (after mapping): $($dataSources.Keys.Count)"
    & $LogInfo "======================================================================="
    
    Invoke-DataSourceAnalysis -DataSources $dataSources -Context $Context
    
    $script:AggregationStats.TotalRecordsProcessed = $loadStats.TotalRecords
    
    return $dataSources
}

#===============================================================================
# Invoke-SourceSpecificEnrichment
#===============================================================================
function Invoke-SourceSpecificEnrichment {
    param(
        [string]$SourceName,
        [array]$Data,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $LogDebug = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "DEBUG" -Component "DataAggregation" -Context $Context }
    
    if ($Data.Count -eq 0) { return }
    
    switch -Wildcard ($SourceName) {
        '*Users*' {
            & $LogDebug "    Enriching user data from $SourceName"
            foreach ($user in $Data) {
                if (-not $user.PSObject.Properties['UserPrincipalName'] -or [string]::IsNullOrWhiteSpace($user.UserPrincipalName)) {
                    if ($user.PSObject.Properties['mail'] -and -not [string]::IsNullOrWhiteSpace($user.mail)) {
                        $user | Add-Member -NotePropertyName 'UserPrincipalName' -NotePropertyValue $user.mail -Force
                    } elseif ($user.PSObject.Properties['SamAccountName'] -and -not [string]::IsNullOrWhiteSpace($user.SamAccountName) -and $user.PSObject.Properties['DistinguishedName']) {
                        $domain = Get-DomainFromDN -DistinguishedName $user.DistinguishedName
                        if (-not [string]::IsNullOrEmpty($domain)) {
                           $user | Add-Member -NotePropertyName 'UserPrincipalName' -NotePropertyValue "$($user.SamAccountName)@$domain" -Force
                        }
                    }
                }
                
                $createdDateValue = $null
                if ($user.PSObject.Properties['Created'] -and $user.Created) { $createdDateValue = $user.Created }
                elseif ($user.PSObject.Properties['whenCreated'] -and $user.whenCreated) { $createdDateValue = $user.whenCreated }

                if ($createdDateValue) {
                    try {
                        $parsedDate = $null
                        if ($createdDateValue -is [datetime]) {
                            $parsedDate = $createdDateValue
                        } else {
                            # Attempt to parse if it's a string (common from CSV)
                            $parsedDate = [datetime]$createdDateValue
                        }
                        $accountAge = (Get-Date) - $parsedDate
                        $user | Add-Member -NotePropertyName 'AccountAgeDays' -NotePropertyValue $accountAge.Days -Force
                    } catch {
                        & $LogDebug "Could not parse date '$createdDateValue' for AccountAgeDays for user $($user.UserPrincipalName)"
                    }
                }
            }
        }
        
        '*Computers*' { # Also matches '*Devices*' if this is intended for both
            & $LogDebug "    Enriching computer/device data from $SourceName"
            foreach ($item in $Data) { # Renamed to $item for generic device/computer
                if (-not $item.PSObject.Properties['DeviceId'] -or [string]::IsNullOrWhiteSpace($item.DeviceId)) {
                    if ($item.PSObject.Properties['objectGUID'] -and -not [string]::IsNullOrWhiteSpace($item.objectGUID)) {
                        $item | Add-Member -NotePropertyName 'DeviceId' -NotePropertyValue $item.objectGUID -Force
                    } elseif ($item.PSObject.Properties['Name'] -and -not [string]::IsNullOrWhiteSpace($item.Name)) {
                        $item | Add-Member -NotePropertyName 'DeviceId' -NotePropertyValue $item.Name -Force
                    }
                }
                if ((-not $item.PSObject.Properties['DisplayName'] -or [string]::IsNullOrWhiteSpace($item.DisplayName)) -and $item.PSObject.Properties['Name'] -and -not [string]::IsNullOrWhiteSpace($item.Name)) {
                    $item | Add-Member -NotePropertyName 'DisplayName' -NotePropertyValue $item.Name -Force
                }
                if ($item.PSObject.Properties['OperatingSystem'] -and -not [string]::IsNullOrWhiteSpace($item.OperatingSystem)) {
                    $osInfo = ConvertFrom-OperatingSystem -OSString $item.OperatingSystem
                    $item | Add-Member -NotePropertyName 'OSType' -NotePropertyValue $osInfo.Type -Force
                    $item | Add-Member -NotePropertyName 'OSVersionMajor' -NotePropertyValue $osInfo.Version -Force
                }
            }
        }
        
        '*Groups*' {
            & $LogDebug "    Enriching group data from $SourceName"
            foreach ($group in $Data) {
                if ($group.PSObject.Properties['GroupCategory'] -and $group.PSObject.Properties['GroupScope']) {
                    $groupTypeDesc = "$($group.GroupCategory) - $($group.GroupScope)"
                    $group | Add-Member -NotePropertyName 'GroupTypeDescription' -NotePropertyValue $groupTypeDesc -Force
                }
            }
        }
    }
}

#===============================================================================
# Invoke-DataSourceAnalysis
#===============================================================================
function Invoke-DataSourceAnalysis {
    param(
        [hashtable]$DataSources,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $LogInfo = { param($MessageParam, $LevelParam="INFO") Write-MandALog -Message $MessageParam -Level $LevelParam -Component "DataAggregation" -Context $Context }
    $LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context }
    $LogError = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "ERROR" -Component "DataAggregation" -Context $Context }

    & $LogInfo "`nData Source Analysis:" 
    & $LogInfo "--------------------" 
    
    $userSourceKeys = @('ActiveDirectory_Users', 'Graph_Users', 'Exchange_MailboxUsers', 'ADUsers', 'AADUsers', 'ExchangeUsers')
    $foundUserSourcesCount = 0
    foreach ($key in $userSourceKeys) {
        if ($DataSources.ContainsKey($key) -and @($DataSources[$key]).Count -gt 0) {
            & $LogSuccess "   User source: $key (Records: $(@($DataSources[$key]).Count))"
            $foundUserSourcesCount++
        }
    }
    if ($foundUserSourcesCount -eq 0) {
        & $LogError "   WARNING: No primary user data sources (AD, Graph, Exchange) found! Processing quality will be low."
        if ($script:AggregationStats.PSObject.Properties.Name -contains 'Errors') { # Check if Errors property exists
            $null = $script:AggregationStats.Errors.Add("No primary user data sources found")
        }
    }
    
    # ... (Similar logic for device, group, relationship, license data, ensuring to use @().Count for arrays) ...
    & $LogInfo "--------------------"
}

#===============================================================================
# Merge-UserProfiles
#===============================================================================
function Merge-UserProfiles {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$DataSources,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $LogInfo = { param($MessageParam, $LevelParam="INFO") Write-MandALog -Message $MessageParam -Level $LevelParam -Component "DataAggregation" -Context $Context }
    $LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context }
    $LogWarn = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "WARN" -Component "DataAggregation" -Context $Context }
    $LogDebug = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "DEBUG" -Component "DataAggregation" -Context $Context }

    & $LogInfo "======================================================================="
    & $LogInfo "Starting user profile aggregation and deduplication"
    & $LogInfo "======================================================================="
    
    $canonicalUsers = @{}
    $mergeStats = @{ TotalProcessed = 0; Duplicates = 0; MergeConflicts = 0; SourceContributions = @{} }
    $userSourcePrecedence = @('ADUsers','ActiveDirectory_Users','AD_Users','GraphUsers','Graph_Users','AAD_Users','AzureAD_Users','ExchangeMailboxUsers','Exchange_MailboxUsers','ExchangeUsers','Exchange_Users','MailboxUsers')

    foreach ($sourceName in $userSourcePrecedence) {
        if (-not $DataSources.ContainsKey($sourceName)) { continue }
        $users = $DataSources[$sourceName]
        if ($null -eq $users -or @($users).Count -eq 0) { continue }
        
        & $LogInfo "Processing $(@($users).Count) users from '$sourceName'..."
        $sourceProcessed = 0; $sourceMerged = 0
        
        foreach ($user in $users) {
            $mergeStats.TotalProcessed++
            $upn = Get-UserPrincipalName -User $user -SourceName $sourceName
            
            if ([string]::IsNullOrWhiteSpace($upn)) {
                $displayNameInfo = if ($user.PSObject.Properties['DisplayName'] -and -not [string]::IsNullOrWhiteSpace($user.DisplayName)) { "DisplayName: $($user.DisplayName)" } else { "Unknown DisplayName" }
                & $LogWarn "  Skipping user with no valid UPN from '$sourceName'. $displayNameInfo"
                $script:AggregationStats.DataQualityIssues++
                continue
            }
            $upn = $upn.ToLower().Trim()
            
            if (-not $canonicalUsers.ContainsKey($upn)) {
                $canonicalUsers[$upn] = [PSCustomObject]@{ UserPrincipalName = $upn; DataSources = @($sourceName); MergeCount = 1; LastModified = Get-Date }
                $sourceProcessed++
            } else {
                $existingUser = $canonicalUsers[$upn]
                $existingUser.DataSources = @($existingUser.DataSources | Select-Object -Unique) + $sourceName # Ensure unique sources
                $existingUser.MergeCount++
                $existingUser.LastModified = Get-Date
                $sourceMerged++
                $mergeStats.Duplicates++
            }
            $mergeResult = Merge-UserProperties -ExistingUser $canonicalUsers[$upn] -NewUser $user -SourceName $sourceName -Context $Context
            if ($mergeResult.ConflictCount -gt 0) { $mergeStats.MergeConflicts += $mergeResult.ConflictCount }
        }
        $mergeStats.SourceContributions[$sourceName] = @{ Processed = $sourceProcessed; Merged = $sourceMerged }
        & $LogSuccess "  Source '$sourceName': $sourceProcessed new, $sourceMerged merged"
    }
    
    & $LogInfo "Performing post-merge enrichment..."
    $enrichmentStats = Invoke-UserEnrichment -Users $canonicalUsers -DataSources $DataSources -Context $Context
    
    & $LogInfo "======================================================================="
    & $LogInfo "User Profile Merge Summary:"
    & $LogSuccess "  Total unique users: $($canonicalUsers.Keys.Count)"
    & $LogInfo "  Total records processed: $($mergeStats.TotalProcessed)"
    & $LogInfo "  Duplicate records merged: $($mergeStats.Duplicates)"
    & $LogInfo ("  Merge conflicts resolved: $($mergeStats.MergeConflicts)") -LevelParam $(if ($mergeStats.MergeConflicts -gt 0) { "WARN" } else { "INFO" })
    & $LogInfo "  Multi-source users: $(($canonicalUsers.Values | Where-Object { $_.MergeCount -gt 1 }).Count)"
    if ($enrichmentStats) {
        & $LogInfo "  Enrichment stats - Mailboxes: $($enrichmentStats.MailboxDataAdded), Guests: $($enrichmentStats.GuestUsersIdentified)"
    }
    & $LogInfo "======================================================================="
    
    $script:AggregationStats.MergeOperations += $mergeStats.Duplicates
    
    return @($canonicalUsers.Values)
}

#===============================================================================
# Merge-DeviceProfiles
#===============================================================================
function Merge-DeviceProfiles {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$DataSources,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $LogInfo = { param($MessageParam, $LevelParam="INFO") Write-MandALog -Message $MessageParam -Level $LevelParam -Component "DataAggregation" -Context $Context }
    $LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context }
    $LogWarn = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "WARN" -Component "DataAggregation" -Context $Context }

    & $LogInfo "======================================================================="
    & $LogInfo "Starting device profile aggregation"
    & $LogInfo "======================================================================="
    
    $canonicalDevices = @{}
    $mergeStats = @{ TotalProcessed = 0; Duplicates = 0; SourceContributions = @{} }
    $deviceSources = @('ADComputers','ActiveDirectory_Computers','AD_Computers','GraphDevices','Graph_Devices','AAD_Devices','AzureAD_Devices','IntuneDevices','Intune_Devices','MDM_Devices')

    foreach ($sourceName in $deviceSources) {
        if (-not $DataSources.ContainsKey($sourceName)) { continue }
        $devices = $DataSources[$sourceName]
        if ($null -eq $devices -or @($devices).Count -eq 0) { continue }
        
        & $LogInfo "Processing $(@($devices).Count) devices from '$sourceName'..."
        $sourceProcessed = 0; $sourceMerged = 0
        
        foreach ($device in $devices) {
            $mergeStats.TotalProcessed++
            $deviceId = Get-DeviceIdentifier -Device $device -SourceName $sourceName
            
            if ([string]::IsNullOrWhiteSpace($deviceId)) {
                & $LogWarn "  Skipping device with no valid identifier from '$sourceName'"
                $script:AggregationStats.DataQualityIssues++
                continue
            }
            
            if (-not $canonicalDevices.ContainsKey($deviceId)) {
                $canonicalDevices[$deviceId] = [PSCustomObject]@{ DeviceId = $deviceId; DataSources = @($sourceName); MergeCount = 1; LastModified = Get-Date }
                $sourceProcessed++
            } else {
                $existingDevice = $canonicalDevices[$deviceId]
                $existingDevice.DataSources = @($existingDevice.DataSources | Select-Object -Unique) + $sourceName
                $existingDevice.MergeCount++
                $existingDevice.LastModified = Get-Date
                $sourceMerged++; $mergeStats.Duplicates++
            }
            Merge-DeviceProperties -ExistingDevice $canonicalDevices[$deviceId] -NewDevice $device -SourceName $sourceName -Context $Context
        }
        $mergeStats.SourceContributions[$sourceName] = @{ Processed = $sourceProcessed; Merged = $sourceMerged }
        & $LogSuccess "  Source '$sourceName': $sourceProcessed new, $sourceMerged merged"
    }
    
    & $LogInfo "Performing device enrichment..."
    Invoke-DeviceEnrichment -Devices $canonicalDevices -Context $Context
    
    & $LogInfo "======================================================================="
    & $LogInfo "Device Profile Merge Summary:"
    & $LogSuccess "  Total unique devices: $($canonicalDevices.Keys.Count)"
    & $LogInfo "  Total records processed: $($mergeStats.TotalProcessed)"
    & $LogInfo "  Duplicate records merged: $($mergeStats.Duplicates)"
    & $LogInfo "  Multi-source devices: $(($canonicalDevices.Values | Where-Object { $_.MergeCount -gt 1 }).Count)"
    & $LogInfo "======================================================================="
    
    $script:AggregationStats.MergeOperations += $mergeStats.Duplicates
    
    if ($canonicalDevices.Keys.Count -gt 0) { # Check Keys.Count for hashtable
        return @($canonicalDevices.Values)
    } else {
        & $LogWarn "No devices found after merge operation"
        return @()
    }
}

#===============================================================================
# New-RelationshipGraph
#===============================================================================
function New-RelationshipGraph {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$Users,
        [Parameter(Mandatory=$false)]
        [array]$Devices = @(),
        [Parameter(Mandatory=$true)]
        [hashtable]$DataSources,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $LogInfo = { param($MessageParam, $LevelParam="INFO") Write-MandALog -Message $MessageParam -Level $LevelParam -Component "DataAggregation" -Context $Context }
    $LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context }

    & $LogInfo "======================================================================="
    & $LogInfo "Building comprehensive relationship graph"
    & $LogInfo "  Processing: $($Users.Count) users, $(if($Devices){$Devices.Count}else{0}) devices"
    & $LogInfo "======================================================================="
    
    $relationshipStats = @{ UserDeviceLinks = 0; UserGroupLinks = 0; UserLicenseLinks = 0; UserManagerLinks = 0; UserTeamLinks = 0; TotalRelationships = 0 }
    $userLookup = @{}; $Users | ForEach-Object { if ($_.UserPrincipalName) { $userLookup[$_.UserPrincipalName.ToLower()] = $_ } }
    
    if ($Devices -and $Devices.Count -gt 0) {
        & $LogInfo "Mapping devices to users..."
        foreach ($user in $Users) {
            if (-not $user.UserPrincipalName) { continue } # Skip users without UPN
            $userDevices = @()
            $userUPN = $user.UserPrincipalName.ToLower()
            foreach ($device in $Devices) {
                $isOwned = $false
                if (($device.PSObject.Properties['RegisteredOwners'] -and $device.RegisteredOwners -match $userUPN) -or
                    ($device.PSObject.Properties['RegisteredUsers'] -and $device.RegisteredUsers -match $userUPN) -or
                    ($device.PSObject.Properties['ManagedBy'] -and $device.ManagedBy -match $userUPN) -or
                    ($device.PSObject.Properties['PrimaryUser'] -and $device.PrimaryUser -match $userUPN)) {
                    $isOwned = $true
                }
                if ($isOwned) { $userDevices += $device; $relationshipStats.UserDeviceLinks++ }
            }
            $user | Add-Member -MemberType NoteProperty -Name 'AssociatedDevices' -Value $userDevices -Force
            $user | Add-Member -MemberType NoteProperty -Name 'DeviceCount' -Value $userDevices.Count -Force
        }
        & $LogSuccess "  Created $($relationshipStats.UserDeviceLinks) user-device relationships"
    }

    $groupMemberKey = $DataSources.Keys | Where-Object {$_ -like "*GroupMembers"} | Select-Object -First 1
    if ($groupMemberKey -and $DataSources[$groupMemberKey]) {
        & $LogInfo "Mapping group memberships to users..."
        $groupMembers = $DataSources[$groupMemberKey]
        $userGroups = @{}
        foreach ($membership in $groupMembers) {
            $memberIdentifier = $null
            if ($membership.PSObject.Properties['MemberUPN'] -and -not [string]::IsNullOrWhiteSpace($membership.MemberUPN)) { $memberIdentifier = $membership.MemberUPN.ToLower() }
            # Add other identifier logic if MemberUPN is not always present (e.g., SamAccountName lookup)
            if ($memberIdentifier -and $membership.PSObject.Properties['GroupName'] -and -not [string]::IsNullOrWhiteSpace($membership.GroupName)) {
                if (-not $userGroups.ContainsKey($memberIdentifier)) { $userGroups[$memberIdentifier] = [System.Collections.Generic.List[string]]::new() }
                $userGroups[$memberIdentifier].Add($membership.GroupName)
                $relationshipStats.UserGroupLinks++
            }
        }
        foreach ($user in $Users) {
            if (-not $user.UserPrincipalName) { continue }
            $userUPN = $user.UserPrincipalName.ToLower()
            if ($userGroups.ContainsKey($userUPN)) {
                $groupsList = $userGroups[$userUPN] | Select-Object -Unique
                $user | Add-Member -MemberType NoteProperty -Name 'GroupMemberships' -Value $groupsList -Force
                $user | Add-Member -MemberType NoteProperty -Name 'GroupCount' -Value $groupsList.Count -Force
            } else {
                $user | Add-Member -MemberType NoteProperty -Name 'GroupMemberships' -Value @() -Force
                $user | Add-Member -MemberType NoteProperty -Name 'GroupCount' -Value 0 -Force
            }
        }
        & $LogSuccess "  Created $($relationshipStats.UserGroupLinks) user-group relationships"
    }
    
    # ... (Similar robust mapping for Licenses, Managers, Teams, ensuring properties are checked and UPNs lowercased) ...

    $relationshipStats.TotalRelationships = $relationshipStats.UserDeviceLinks + $relationshipStats.UserGroupLinks + $relationshipStats.UserLicenseLinks + $relationshipStats.UserManagerLinks + $relationshipStats.UserTeamLinks
    & $LogInfo "======================================================================="
    # ... (rest of summary logging) ...
    $script:AggregationStats.RelationshipsCreated = $relationshipStats.TotalRelationships
    return $Users
}

#===============================================================================
# Helper Functions (Get-DomainFromDN, Get-UserPrincipalName, etc.)
#===============================================================================
function Get-DomainFromDN {
    param([string]$DistinguishedName)
    if ([string]::IsNullOrWhiteSpace($DistinguishedName)) { return "unknown.domain" } # Return a placeholder
    try {
        $domainComponents = ($DistinguishedName -split ',') | Where-Object { $_ -match '^DC=' } | ForEach-Object { ($_ -split '=')[1] }
        if ($domainComponents.Count -gt 0) {
            return $domainComponents -join '.'
        }
    } catch { 
        # Fallback or log warning if needed
    }
    return "unknown.domain" # Fallback
}

function Get-UserPrincipalName {
    param($UserObject, [string]$SourceName) # Renamed $User to $UserObject to avoid conflict
    $upnFields = @('UserPrincipalName', 'userPrincipalName', 'UPN', 'upn', 'PrimarySmtpAddress', 'mail', 'Mail')
    foreach ($field in $upnFields) {
        if ($UserObject.PSObject.Properties[$field] -and -not [string]::IsNullOrWhiteSpace($UserObject.$($field))) {
            return $UserObject.$($field)
        }
    }
    if ($UserObject.PSObject.Properties['SamAccountName'] -and -not [string]::IsNullOrWhiteSpace($UserObject.SamAccountName)) {
        $dn = if ($UserObject.PSObject.Properties['DistinguishedName'] -and $UserObject.DistinguishedName) { $UserObject.DistinguishedName } else { "" }
        $domain = Get-DomainFromDN -DistinguishedName $dn
        if ($domain -ne "unknown.domain") { return "$($UserObject.SamAccountName)@$domain" }
    }
    return $null
}

function Get-DeviceIdentifier {
    param($DeviceObject, [string]$SourceName) # Renamed $Device
    $idFields = @('DeviceId', 'id', 'objectGUID', 'AzureADDeviceId', 'IntuneDeviceId', 'SerialNumber', 'Name', 'DisplayName')
    foreach ($field in $idFields) {
        if ($DeviceObject.PSObject.Properties[$field] -and -not [string]::IsNullOrWhiteSpace($DeviceObject.$($field))) {
            return $DeviceObject.$($field)
        }
    }
    return $null
}

function Merge-UserProperties {
    param( $ExistingUser, $NewUser, [string]$SourceName, [Parameter(Mandatory=$false)] $Context )
    $LogDebug = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "DEBUG" -Component "DataAggregation" -Context $Context }
    $mergeResult = @{ PropertiesMerged = 0; ConflictCount = 0; Conflicts = [System.Collections.ArrayList]::new() } # Initialize Conflicts as ArrayList
    $protectedProperties = @('SamAccountName', 'SID', 'ObjectGUID', 'UserPrincipalName')
    $accumulativeProperties = @('proxyAddresses', 'memberOf', 'ServicePlans')
    foreach ($prop in $NewUser.PSObject.Properties) {
        $propName = $prop.Name; $newValue = $prop.Value
        if ($null -eq $newValue -or ($newValue -is [string] -and [string]::IsNullOrWhiteSpace($newValue))) { continue }
        if ($ExistingUser.PSObject.Properties[$propName]) {
            $existingValue = $ExistingUser.$($propName)
            if (($propName -in $protectedProperties) -and ($null -ne $existingValue -and (-not [string]::IsNullOrWhiteSpace($existingValue)))) { continue } # Protect non-empty values
            if ($propName -in $accumulativeProperties) {
                $currentList = [System.Collections.ArrayList]::new()
                if ($existingValue -is [array] -or $existingValue -is [System.Collections.ArrayList]) { $currentList.AddRange($existingValue) }
                elseif ($null -ne $existingValue -and (-not [string]::IsNullOrWhiteSpace($existingValue))) { $currentList.Add($existingValue) }
                
                if ($newValue -is [array] -or $newValue -is [System.Collections.ArrayList]) { $currentList.AddRange($newValue) }
                elseif ($null -ne $newValue -and (-not [string]::IsNullOrWhiteSpace($newValue))) { $currentList.Add($newValue) }
                
                $ExistingUser.$($propName) = @($currentList | Select-Object -Unique)
                $mergeResult.PropertiesMerged++; continue
            }
            if (($null -ne $existingValue -and (-not [string]::IsNullOrWhiteSpace($existingValue))) -and "$existingValue" -ne "$newValue") { # Compare as strings for simplicity
                if ($propName -match 'Date|Time|Timestamp|when') {
                    try {
                        $dtExisting = if($existingValue -is [datetime]){$existingValue}else{[datetime]$existingValue}
                        $dtNew = if($newValue -is [datetime]){$newValue}else{[datetime]$newValue}
                        if ($dtNew -gt $dtExisting) { $ExistingUser.$($propName) = $newValue; $mergeResult.PropertiesMerged++ }
                    } catch { # If conversion fails, treat as normal conflict
                        $null = $mergeResult.Conflicts.Add([PSCustomObject]@{Property = $propName; ExistingValue = $existingValue; NewValue = $newValue; Source = $SourceName; Resolution = "Kept existing value (date parse error)"})
                        $mergeResult.ConflictCount++
                    }
                } else {
                    $null = $mergeResult.Conflicts.Add([PSCustomObject]@{Property = $propName; ExistingValue = $existingValue; NewValue = $newValue; Source = $SourceName; Resolution = "Kept existing value"})
                    $mergeResult.ConflictCount++
                }
            } elseif ($null -eq $existingValue -or ([string]::IsNullOrWhiteSpace($existingValue))) {
                 $ExistingUser | Add-Member -MemberType NoteProperty -Name $propName -Value $newValue -Force; $mergeResult.PropertiesMerged++
            }
        } else { $ExistingUser | Add-Member -MemberType NoteProperty -Name $propName -Value $newValue -Force; $mergeResult.PropertiesMerged++ }
    }
    if ($mergeResult.ConflictCount -gt 0 -and $mergeResult.Conflicts.Count -le 5) { # Log only a few conflicts
        foreach ($conflict in $mergeResult.Conflicts) { & $LogDebug "    Merge conflict for $($ExistingUser.UserPrincipalName): Property '$($conflict.Property)' - $($conflict.Resolution)" }
    }
    return $mergeResult
}

function Merge-DeviceProperties {
    param($ExistingDevice, $NewDevice, [string]$SourceName, [Parameter(Mandatory=$false)] $Context)
    foreach ($prop in $NewDevice.PSObject.Properties) {
        $propName = $prop.Name; $newValue = $prop.Value
        if ($null -eq $newValue -or ($newValue -is [string] -and [string]::IsNullOrWhiteSpace($newValue))) { continue }
        if (-not $ExistingDevice.PSObject.Properties[$propName] -or $null -eq $ExistingDevice.$($propName) -or ([string]::IsNullOrWhiteSpace($ExistingDevice.$($propName)))) {
            $ExistingDevice | Add-Member -MemberType NoteProperty -Name $propName -Value $newValue -Force
        } # Simple merge: only add if not present or existing is null/empty. More sophisticated logic can be added.
    }
}

function ConvertFrom-OperatingSystem { # As provided by user, looks reasonable
    param([string]$OSString)
    $osInfo = @{Type = "Unknown"; Version = "Unknown"}
    if ($OSString -match 'Windows Server (\d+|R\d)') { $osInfo.Type = "Windows Server"; $osInfo.Version = $matches[1] }
    elseif ($OSString -match 'Windows (\d+)') { $osInfo.Type = "Windows Workstation"; $osInfo.Version = $matches[1] }
    elseif ($OSString -match 'Mac|macOS|OS X') { $osInfo.Type = "macOS" }
    elseif ($OSString -match 'Linux|Ubuntu|CentOS|RedHat') { $osInfo.Type = "Linux" }
    elseif ($OSString -match 'iOS') { $osInfo.Type = "iOS" }
    elseif ($OSString -match 'Android') { $osInfo.Type = "Android" }
    return $osInfo
}

function Invoke-UserEnrichment { # As provided by user, ensure $Context for logging if any Write-MandALog calls are added
    param([hashtable]$Users, [hashtable]$DataSources, [Parameter(Mandatory=$false)] $Context)
    $LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context }
    $enrichmentStats = @{MailboxDataAdded = 0; LicenseDataEnriched = 0; ManagerChainBuilt = 0; GuestUsersIdentified = 0}
    $mailboxDataKey = $DataSources.Keys | Where-Object {$_ -like "Exchange*Mailbox*" -or $_ -eq "MailboxUsers"} | Select -First 1
    if ($mailboxDataKey -and $DataSources.ContainsKey($mailboxDataKey)) {
        $mailboxData = $DataSources[$mailboxDataKey]
        if ($mailboxData) {
            $mailboxLookup = @{}
            foreach ($mailbox in $mailboxData) { if ($mailbox.PrimarySmtpAddress) { $mailboxLookup[$mailbox.PrimarySmtpAddress.ToLower()] = $mailbox } }
            foreach ($userEntry in $Users.GetEnumerator()) {
                $user = $userEntry.Value
                if (-not $user.UserPrincipalName) { continue }
                $upn = $user.UserPrincipalName.ToLower()
                if ($mailboxLookup.ContainsKey($upn)) {
                    $mailbox = $mailboxLookup[$upn]
                    $user | Add-Member -MemberType NoteProperty -Name 'HasExchangeMailbox' -Value $true -Force
                    if($mailbox.PSObject.Properties['RecipientTypeDetails']) {$user | Add-Member -MemberType NoteProperty -Name 'MailboxType' -Value $mailbox.RecipientTypeDetails -Force}
                    if($mailbox.PSObject.Properties['Database']) {$user | Add-Member -MemberType NoteProperty -Name 'MailboxDatabase' -Value $mailbox.Database -Force}
                    if($mailbox.PSObject.Properties['TotalItemSize']) {$user | Add-Member -MemberType NoteProperty -Name 'MailboxSize' -Value $mailbox.TotalItemSize -Force}
                    $enrichmentStats.MailboxDataAdded++
                }
            }
        }
    }
    foreach ($userEntry in $Users.GetEnumerator()) {
        $user = $userEntry.Value
        if (($user.UserPrincipalName -and $user.UserPrincipalName -match '#EXT#@') -or ($user.PSObject.Properties['UserType'] -and $user.UserType -eq 'Guest')) {
            $user | Add-Member -MemberType NoteProperty -Name 'IsGuestUser' -Value $true -Force; $enrichmentStats.GuestUsersIdentified++
        } else { $user | Add-Member -MemberType NoteProperty -Name 'IsGuestUser' -Value $false -Force }
    }
    & $LogSuccess "  Enrichment completed: $($enrichmentStats.MailboxDataAdded) mailboxes, $($enrichmentStats.GuestUsersIdentified) guests"
    return $enrichmentStats
}

function Invoke-DeviceEnrichment { # As provided by user
    param([hashtable]$Devices, [Parameter(Mandatory=$false)] $Context)
    foreach ($deviceEntry in $Devices.GetEnumerator()) {
        $device = $deviceEntry.Value; $deviceType = "Unknown"
        if ($device.PSObject.Properties['deviceType'] -and -not [string]::IsNullOrWhiteSpace($device.deviceType)) { $deviceType = $device.deviceType }
        elseif ($device.PSObject.Properties['OperatingSystem'] -and -not [string]::IsNullOrWhiteSpace($device.OperatingSystem) ) {
            $os = $device.OperatingSystem
            if ($os -match 'Server') { $deviceType = "Server" } elseif ($os -match 'Windows') { $deviceType = "Workstation" }
            elseif ($os -match 'iOS|iPhone|iPad') { $deviceType = "Mobile (iOS)" } elseif ($os -match 'Android') { $deviceType = "Mobile (Android)" }
            elseif ($os -match 'Mac|macOS') { $deviceType = "Workstation (macOS)" }
        }
        $device | Add-Member -MemberType NoteProperty -Name 'DeviceTypeComputed' -Value $deviceType -Force # Renamed to avoid conflict if 'DeviceType' already exists
        $createdDateValue = $null
        if ($device.PSObject.Properties['Created'] -and $device.Created) { $createdDateValue = $device.Created }
        elseif ($device.PSObject.Properties['whenCreated'] -and $device.whenCreated) { $createdDateValue = $device.whenCreated }
        if ($createdDateValue) {
            try {
                $parsedDate = if($createdDateValue -is [datetime]){$createdDateValue}else{[datetime]$createdDateValue}
                $deviceAge = (Get-Date) - $parsedDate
                $device | Add-Member -NotePropertyName 'DeviceAgeDays' -NotePropertyValue $deviceAge.Days -Force
            } catch {}
        }
    }
}

function Find-UserByIdentifier { # As provided by user, looks reasonable
    param( [string]$Identifier, [hashtable]$UserLookup, [array]$Users )
    if ([string]::IsNullOrWhiteSpace($Identifier)) { return $null }
    if ($UserLookup.ContainsKey($Identifier.ToLower())) { return $UserLookup[$Identifier.ToLower()] }
    $foundUser = $Users | Where-Object {
        ($_.PSObject.Properties['DistinguishedName'] -and $_.DistinguishedName -eq $Identifier) -or
        ($_.PSObject.Properties['DisplayName'] -and $_.DisplayName -eq $Identifier) -or
        ($_.PSObject.Properties['SamAccountName'] -and $_.SamAccountName -eq $Identifier)
    } | Select-Object -First 1
    return $foundUser
}

#===============================================================================
# Export-ProcessedData
#===============================================================================
function Export-ProcessedData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProcessedDataPath,
        [Parameter(Mandatory=$true)]
        [array]$Users,
        [Parameter(Mandatory=$false)] # Devices might be empty
        [array]$Devices = @(),
        [Parameter(Mandatory=$true)]
        [hashtable]$DataSources,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $LogInfo = { param($MessageParam, $LevelParam="INFO") Write-MandALog -Message $MessageParam -Level $LevelParam -Component "DataAggregation" -Context $Context }
    $LogSuccess = { param($MessageParam) Write-MandALog -Message $MessageParam -Level "SUCCESS" -Component "DataAggregation" -Context $Context }

    & $LogInfo "======================================================================="
    & $LogInfo "Exporting processed data to: $ProcessedDataPath"
    & $LogInfo "======================================================================="
    
    $exportStats = @{ FilesExported = 0; RecordsExported = 0 }
    
    if (-not (Test-Path $ProcessedDataPath -PathType Container)) {
        try { New-Item -Path $ProcessedDataPath -ItemType Directory -Force -ErrorAction Stop | Out-Null }
        catch { Write-Error "Failed to create ProcessedDataPath: $ProcessedDataPath. Error: $($_.Exception.Message)"; return $null }
    }
    
    if ($Users -and $Users.Count -gt 0) {
        $userFile = Join-Path $ProcessedDataPath "Users.csv" # This is the main consolidated user export
        & $LogInfo "Exporting $($Users.Count) users to Users.csv..."
        $exportUsers = foreach ($user in $Users) {
            $exportUser = $user.PSObject.Copy()
            # Flatten complex properties (ensure these properties exist before trying to join)
            if ($exportUser.PSObject.Properties['GroupMemberships'] -and $exportUser.GroupMemberships -is [array]) { $exportUser.GroupMemberships = $exportUser.GroupMemberships -join ';' }
            if ($exportUser.PSObject.Properties['AssociatedDevices'] -and $exportUser.AssociatedDevices -is [array]) { $exportUser.AssociatedDevices = ($exportUser.AssociatedDevices | ForEach-Object { $_.DisplayName }) -join ';' }
            if ($exportUser.PSObject.Properties['TeamMemberships'] -and $exportUser.TeamMemberships -is [array]) { $exportUser.TeamMemberships = ($exportUser.TeamMemberships | ForEach-Object { $_.TeamName }) -join ';' }
            if ($exportUser.PSObject.Properties['AssignedLicenses'] -and $exportUser.AssignedLicenses -is [array]) { $exportUser.AssignedLicenses = ($exportUser.AssignedLicenses | ForEach-Object { $_.SkuPartNumber }) -join ';' }
            if ($exportUser.PSObject.Properties['DirectReports'] -and $exportUser.DirectReports -is [array]) { $exportUser.DirectReports = $exportUser.DirectReports -join ';' }
            
            $propsToRemove = @('DataSources', 'MergeCount', 'LastModified') # System properties from merge
            foreach($propName in $propsToRemove){ if($exportUser.PSObject.Properties.Contains($propName)){ $exportUser.PSObject.Properties.Remove($propName) } }
            $exportUser
        }
        $exportUsers | Export-Csv -Path $userFile -NoTypeInformation -Encoding UTF8 -Force
        & $LogSuccess "  [OK] Exported Users.csv ($($Users.Count) records)"
        $exportStats.FilesExported++; $exportStats.RecordsExported += $Users.Count

        # Also create UserProfiles.csv for downstream compatibility if its structure is different or a subset
        $profileFile = Join-Path $ProcessedDataPath "UserProfiles.csv"
        & $LogInfo "Creating UserProfiles.csv for downstream compatibility..."
        # Select specific fields expected by UserProfileBuilder or other modules
        # The Select-Object from user's version is kept for this specific file.
        $Users | Select-Object UserPrincipalName, DisplayName, GivenName, Surname,
                                Department, Title, @{N='Manager';E={if($_.PSObject.Properties['ManagerUPN']){$_.ManagerUPN}else{$_.Manager}}}, Enabled, Mail,
                                HasExchangeMailbox, MailboxType, IsGuestUser,
                                DeviceCount, GroupCount, LicenseCount, TeamCount,
                                @{N='ComplexityScore';E={if($_.PSObject.Properties['ComplexityScore']){$_.ComplexityScore}else{0}}}, 
                                @{N='MigrationCategory';E={if($_.PSObject.Properties['MigrationCategory']){$_.MigrationCategory}else{'Not Assessed'}}},
                                @{N='ReadinessStatus';E={if($_.PSObject.Properties['ReadinessStatus']){$_.ReadinessStatus}else{'Not Assessed'}}} |
            Export-Csv -Path $profileFile -NoTypeInformation -Encoding UTF8 -Force
        & $LogSuccess "  [OK] Exported UserProfiles.csv"
        # $exportStats.FilesExported++ # Not double counting if it's derived from Users.csv
    }
    
    if ($Devices -and $Devices.Count -gt 0) {
        $deviceFile = Join-Path $ProcessedDataPath "Devices.csv"
        & $LogInfo "Exporting $($Devices.Count) devices to Devices.csv..."
        $exportDevices = foreach ($device in $Devices) {
            $exportDevice = $device.PSObject.Copy()
            $propsToRemove = @('DataSources', 'MergeCount', 'LastModified')
            foreach($propName in $propsToRemove){ if($exportDevice.PSObject.Properties.Contains($propName)){ $exportDevice.PSObject.Properties.Remove($propName) } }
            $exportDevice
        }
        $exportDevices | Export-Csv -Path $deviceFile -NoTypeInformation -Encoding UTF8 -Force
        & $LogSuccess "  [OK] Exported Devices.csv ($($Devices.Count) records)"
        $exportStats.FilesExported++; $exportStats.RecordsExported += $Devices.Count
    }
    
    $skipSources = @( # List of source names already handled by Users.csv or Devices.csv or specific merged outputs
        'ADUsers', 'ActiveDirectory_Users', 'AD_Users', 'GraphUsers', 'Graph_Users', 'AAD_Users', 'AzureAD_Users',
        'ExchangeMailboxUsers', 'Exchange_MailboxUsers', 'ExchangeUsers', 'MailboxUsers',
        'ADComputers', 'ActiveDirectory_Computers', 'AD_Computers', 'GraphDevices', 'Graph_Devices', 'AAD_Devices', 'AzureAD_Devices',
        'IntuneDevices', 'Intune_Devices', 'MDM_Devices',
        'UserProfiles' # Also skip UserProfiles as it's derived.
    )
    
    foreach ($sourceKey in $DataSources.Keys) {
        if ($sourceKey -notin $skipSources -and $DataSources[$sourceKey] -and @($DataSources[$sourceKey]).Count -gt 0) {
            $fileName = "$sourceKey.csv"
            $filePath = Join-Path $ProcessedDataPath $fileName
            $sourceData = @($DataSources[$sourceKey])
            & $LogInfo "Exporting $sourceKey data ($($sourceData.Count) records)..."
            $sourceData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8 -Force
            & $LogSuccess "  [OK] Exported $fileName"
            $exportStats.FilesExported++; $exportStats.RecordsExported += $sourceData.Count
        }
    }
    
    $summaryFile = Join-Path $ProcessedDataPath "AggregationSummary.json"
    $summaryData = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Statistics = $script:AggregationStats # Contains StartTime, EndTime, etc.
        UserCount = if($Users){$Users.Count}else{0}
        DeviceCount = if($Devices){$Devices.Count}else{0}
        DataSourcesProcessed = $DataSources.Keys.Count
        FilesExportedToProcessedDir = $exportStats.FilesExported
        TotalRecordsInProcessedDir = $exportStats.RecordsExported
    }
    $summaryData | ConvertTo-Json -Depth 5 | Set-Content -Path $summaryFile -Encoding UTF8 # Reduced depth for summary
    & $LogSuccess "  [OK] Exported AggregationSummary.json"
    
    & $LogInfo "======================================================================="
    & $LogInfo "Processed data export completed: $($exportStats.FilesExported) files, $($exportStats.RecordsExported) total records to '$ProcessedDataPath'"
    & $LogInfo "======================================================================="
    
    return $exportStats
}
#endregion

#===============================================================================
#                         START-DATAAGGREGATION
# Main exported function for the module
#===============================================================================
function Start-DataAggregation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$false)]
        $Context = $null
    )

    # Initialize statistics for this run
    $script:AggregationStats = @{
        StartTime = Get-Date
        EndTime = $null
        TotalSourceFiles = 0
        TotalRecordsProcessed = 0
        MergeOperations = 0
        RelationshipsCreated = 0
        DataQualityIssues = 0
        Warnings = [System.Collections.ArrayList]::new()
        Errors = [System.Collections.ArrayList]::new()
    }
    
    # Validate and normalize Context
    try {
        if ($null -eq $Context) {
            # Try to create context from global environment
            if ($null -ne $global:MandA -and $null -ne $global:MandA.Paths) {
                $Context = [PSCustomObject]@{
                    Paths = $global:MandA.Paths
                    Config = $Configuration
                    CompanyName = if ($global:MandA.CompanyName) { $global:MandA.CompanyName } else { $Configuration.metadata.companyName }
                    ErrorCollector = [PSCustomObject]@{
                        AddError = { param($s,$m,$e) Write-Host "[ERROR] $s : $m" -ForegroundColor Red }
                        AddWarning = { param($s,$m) Write-Host "[WARN] $s : $m" -ForegroundColor Yellow }
                    }
                }
                Write-Host "[INFO] Created Context from global environment" -ForegroundColor Gray
            } else {
                throw "No Context provided and global environment not available"
            }
        }
        
        # Validate Context structure
        if ($null -eq $Context) {
            throw "Context is null after initialization attempt"
        }
        
        # Check if Context has Paths property
        if (-not ($Context.PSObject.Properties.Name -contains 'Paths')) {
            throw "Context does not contain 'Paths' property"
        }
        
        if ($null -eq $Context.Paths) {
            throw "Context.Paths is null"
        }
        
        # Check for required path properties
        $requiredPaths = @('RawDataOutput', 'ProcessedDataOutput')
        $missingPaths = @()
        
        foreach ($pathName in $requiredPaths) {
            if (-not ((Get-ModuleContext).Paths.PSObject.Properties.Name -contains $pathName)) {
                $missingPaths += $pathName
            } elseif ([string]::IsNullOrWhiteSpace($Context.Paths.$pathName)) {
                $missingPaths += "$pathName (empty)"
            }
        }
        
        if ($missingPaths.Count -gt 0) {
            throw "Context.Paths is missing required properties: $($missingPaths -join ', ')"
        }
        
        # Validate paths exist
        $rawDataPath = (Get-ModuleContext).Paths.RawDataOutput
        $processedDataPath = (Get-ModuleContext).Paths.ProcessedDataOutput
        
        if (-not (Test-Path $rawDataPath -PathType Container)) {
            throw "Raw data path does not exist: $rawDataPath"
        }
        
        # Create processed data path if it doesn't exist
        if (-not (Test-Path $processedDataPath -PathType Container)) {
            try {
                New-Item -Path $processedDataPath -ItemType Directory -Force | Out-Null
                Write-Host "[INFO] Created processed data directory: $processedDataPath" -ForegroundColor Gray
            } catch {
                throw "Failed to create processed data directory: $processedDataPath - $_"
            }
        }
        
    } catch {
        $errMsg = "Context validation failed: $($_.Exception.Message)"
        Write-Host "[CRITICAL ERROR][DataAggregation] $errMsg" -ForegroundColor Red
        throw $errMsg
    }
    
    # Define local logging wrappers that use the passed $Context
    $LogInfo = { 
        param($MessageParam, $LevelParam="INFO") 
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $MessageParam -Level $LevelParam -Component "DataAggregation" -Context $Context
        } else {
            Write-Host "[$LevelParam][DataAggregation] $MessageParam" -ForegroundColor $(
                switch ($LevelParam) {
                    "ERROR" { "Red" }
                    "WARN" { "Yellow" }
                    "SUCCESS" { "Green" }
                    "HEADER" { "Cyan" }
                    "DEBUG" { "Gray" }
                    default { "White" }
                }
            )
        }
    }
    
    $LogError = { param($MessageParam) & $LogInfo $MessageParam "ERROR" }
    $LogHeader = { param($MessageParam) & $LogInfo $MessageParam "HEADER" }
    $LogDebug = { param($MessageParam) & $LogInfo $MessageParam "DEBUG" }
    $LogSuccess = { param($MessageParam) & $LogInfo $MessageParam "SUCCESS" }
    $LogWarn = { param($MessageParam) & $LogInfo $MessageParam "WARN" }

    & $LogHeader "======================================================================="
    & $LogHeader "            STARTING DATA AGGREGATION PHASE"
    & $LogHeader "======================================================================="
    & $LogInfo "Configuration:"
    & $LogInfo "  Company: $($Configuration.metadata.companyName)"
    & $LogInfo "  Raw data path: $rawDataPath"
    & $LogInfo "  Output path: $processedDataPath"
    & $LogInfo "  Start time: $($script:AggregationStats.StartTime)"
    & $LogInfo "======================================================================="

    try {
        # Step 1: Load all raw data
        & $LogInfo ""
        & $LogHeader "PHASE 1: Loading Raw Data Sources"
        $dataSources = Import-RawDataSources -RawDataPath $rawDataPath -Context $Context
        
        if ($null -eq $dataSources -or $dataSources.Count -eq 0) {
            throw "No data sources were loaded. Halting processing."
        }

        # Step 2: Merge User Profiles
        & $LogInfo ""
        & $LogHeader "PHASE 2: Merging User Profiles"
        $mergedUsers = Merge-UserProfiles -DataSources $dataSources -Context $Context
        
        if ($null -eq $mergedUsers) {
            & $LogWarn "No users returned from merge operation"
            $mergedUsers = @()
        }

        # Step 3: Merge Device Profiles
        & $LogInfo ""
        & $LogHeader "PHASE 3: Merging Device Profiles"
        $mergedDevices = Merge-DeviceProfiles -DataSources $dataSources -Context $Context
        
        if ($null -eq $mergedDevices) {
            & $LogWarn "No devices returned from merge operation"
            $mergedDevices = @()
        }

        # Step 4: Build Relationships
        & $LogInfo ""
        & $LogHeader "PHASE 4: Building Relationship Graph"
        $enrichedUsers = New-RelationshipGraph -Users $mergedUsers -Devices $mergedDevices -DataSources $dataSources -Context $Context
        
        if ($null -eq $enrichedUsers) {
            & $LogWarn "Relationship building returned null, using original merged users"
            $enrichedUsers = $mergedUsers
        }

        # Step 5: Export processed data
        & $LogInfo ""
        & $LogHeader "PHASE 5: Exporting Processed Data"
        $exportStats = Export-ProcessedData -ProcessedDataPath $processedDataPath -Users $enrichedUsers -Devices $mergedDevices -DataSources $dataSources -Context $Context

        # Calculate final statistics
        $script:AggregationStats.EndTime = Get-Date
        $duration = $script:AggregationStats.EndTime - $script:AggregationStats.StartTime

        # Final summary
        & $LogInfo ""
        & $LogHeader "======================================================================="
        & $LogHeader "            DATA AGGREGATION COMPLETED SUCCESSFULLY"
        & $LogHeader "======================================================================="
        & $LogInfo "Summary:"
        & $LogInfo "  Duration: $($duration.ToString('mm\:ss'))"
        & $LogInfo "  Source files processed: $($script:AggregationStats.TotalSourceFiles)"
        & $LogInfo "  Total records processed: $($script:AggregationStats.TotalRecordsProcessed)"
        & $LogInfo "  Merge operations: $($script:AggregationStats.MergeOperations)"
        & $LogInfo "  Relationships created: $($script:AggregationStats.RelationshipsCreated)"
        & $LogInfo "  Data quality issues: $($script:AggregationStats.DataQualityIssues)" -LevelParam $(if ($script:AggregationStats.DataQualityIssues -gt 0) { "WARN" } else { "INFO" })
        & $LogInfo "  Warnings: $($script:AggregationStats.Warnings.Count)" -LevelParam $(if ($script:AggregationStats.Warnings.Count -gt 0) { "WARN" } else { "INFO" })
        & $LogInfo "  Errors: $($script:AggregationStats.Errors.Count)" -LevelParam $(if ($script:AggregationStats.Errors.Count -gt 0) { "ERROR" } else { "INFO" })
        & $LogHeader "======================================================================="

        # Store aggregated data in context if needed by other modules
        try {
            if ($Context.PSObject.Properties.Name -contains 'AggregatedData') {
                $Context.AggregatedData = @{
                    Users = $enrichedUsers
                    Devices = $mergedDevices
                    DataSources = $dataSources
                    Stats = $script:AggregationStats
                }
            } else {
                $Context | Add-Member -MemberType NoteProperty -Name 'AggregatedData' -Value @{
                    Users = $enrichedUsers
                    Devices = $mergedDevices
                    DataSources = $dataSources
                    Stats = $script:AggregationStats
                } -Force
            }
        } catch {
            & $LogWarn "Could not store aggregated data in context: $_"
        }

        return $true
        
    } catch {
        $script:AggregationStats.EndTime = Get-Date
        $script:AggregationStats.Errors.Add("Fatal error: $($_.Exception.Message)") | Out-Null
        
        & $LogError "======================================================================="
        & $LogError "            DATA AGGREGATION FAILED"
        & $LogError "======================================================================="
        & $LogError "ERROR: A critical error occurred during data aggregation: $($_.Exception.Message)"
        & $LogDebug "Stack Trace: $($_.ScriptStackTrace)"
        
        # Log all accumulated errors
        if ($script:AggregationStats.Errors.Count -gt 0) {
            & $LogError ""
            & $LogError "All errors encountered:"
            foreach ($errorItem in $script:AggregationStats.Errors) {
                & $LogError "  - $errorItem"
            }
        }
        
        # Log all accumulated warnings
        if ($script:AggregationStats.Warnings.Count -gt 0) {
            & $LogWarn ""
            & $LogWarn "All warnings encountered:"
            foreach ($warningItem in $script:AggregationStats.Warnings) {
                & $LogWarn "  - $warningItem"
            }
        }
        
        return $false
    }
}

# Export the main function
Export-ModuleMember -Function Start-DataAggregation

# Module load confirmation
if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
    Write-MandALog "DataAggregation module v2.1.0 loaded and parsed." -Level "DEBUG" -Component "DataAggregation"
} else {
    # This fallback should ideally not be needed if EnhancedLogging loads first and reliably.
    Write-Host "DEBUG: DataAggregation module v2.1.0 loaded and parsed (Write-MandALog not found, check EnhancedLogging.psm1 load order/status)." -ForegroundColor Gray
}

