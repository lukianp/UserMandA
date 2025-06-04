#Requires -Version 5.1

<#
.SYNOPSIS
    Enhanced Data Aggregation Module for M&A Discovery Suite
.DESCRIPTION
    This module is the core of the processing phase. It reads all raw CSV files,
    merges them into unified datasets, enriches the data with relationships,
    performs data quality checks, and prepares consolidated output for export.
.NOTES
    Version: 2.0.0
    Author: Enhanced Version
    Creation Date: 2025-06-03
#>
$outputPath = $Context.Paths.RawDataOutput
#region Module Variables
$script:AggregationStats = @{
    StartTime = $null
    EndTime = $null
    TotalSourceFiles = 0
    TotalRecordsProcessed = 0
    MergeOperations = 0
    RelationshipsCreated = 0
    DataQualityIssues = 0
    Warnings = @()
    Errors = @()
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
        [string]$RawDataPath
    )

    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Loading raw data sources from: $RawDataPath" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $dataSources = @{}
    $loadStats = @{
        Successful = 0
        Failed = 0
        Empty = 0
        TotalRecords = 0
    }

    if (-not (Test-Path $RawDataPath -PathType Container)) {
        Write-MandALog "Raw data path not found: $RawDataPath. Cannot proceed with aggregation." -Level ERROR
        $script:AggregationStats.Errors += "Raw data path not found"
        return $null
    }

    $csvFiles = Get-ChildItem -Path $RawDataPath -Filter "*.csv" -File | Sort-Object Name
    if ($csvFiles.Count -eq 0) {
        Write-MandALog "No raw CSV files found in $RawDataPath." -Level WARN
        $script:AggregationStats.Warnings += "No CSV files found in raw data directory"
        return $dataSources
    }

    Write-MandALog "Found $($csvFiles.Count) raw CSV files to process." -Level INFO
    $script:AggregationStats.TotalSourceFiles = $csvFiles.Count

    # Enhanced source name mappings
    $sourceNameMappings = @{
        # User-related mappings
        'ADUsers' = @('ActiveDirectory_Users', 'AD_Users')
        'AD_Users' = @('ActiveDirectory_Users')
        'ActiveDirectoryUsers' = @('ActiveDirectory_Users')
        'GraphUsers' = @('Graph_Users', 'AAD_Users', 'AzureAD_Users')
        'AADUsers' = @('Graph_Users', 'AzureAD_Users')
        'AzureADUsers' = @('Graph_Users', 'AAD_Users')
        'ExchangeMailboxUsers' = @('Exchange_MailboxUsers', 'Exchange_Users')
        'ExchangeUsers' = @('Exchange_MailboxUsers')
        'MailboxUsers' = @('Exchange_MailboxUsers')
        
        # Computer/Device mappings
        'ADComputers' = @('ActiveDirectory_Computers', 'AD_Computers')
        'AD_Computers' = @('ActiveDirectory_Computers')
        'ActiveDirectoryComputers' = @('ActiveDirectory_Computers')
        'GraphDevices' = @('Graph_Devices', 'AAD_Devices')
        'AADDevices' = @('Graph_Devices', 'AzureAD_Devices')
        'AzureADDevices' = @('Graph_Devices', 'AAD_Devices')
        'IntuneDevices' = @('Intune_Devices', 'MDM_Devices')
        
        # Group mappings
        'ADGroups' = @('ActiveDirectory_Groups', 'AD_Groups')
        'AD_Groups' = @('ActiveDirectory_Groups')
        'ActiveDirectoryGroups' = @('ActiveDirectory_Groups')
        'GraphGroups' = @('Graph_Groups', 'AAD_Groups')
        'AADGroups' = @('Graph_Groups', 'AzureAD_Groups')
        'AzureADGroups' = @('Graph_Groups', 'AAD_Groups')
        
        # Group membership mappings
        'ADGroupMembers' = @('ActiveDirectory_GroupMembers', 'AD_GroupMembers')
        'AD_GroupMembers' = @('ActiveDirectory_GroupMembers')
        'ActiveDirectoryGroupMembers' = @('ActiveDirectory_GroupMembers')
    }

    $fileCounter = 0
    foreach ($file in $csvFiles) {
        $fileCounter++
        $sourceName = $file.BaseName
        $percentComplete = [math]::Round(($fileCounter / $csvFiles.Count) * 100, 0)
        
        Write-Progress -Activity "Importing Raw Data Sources" -Status "Processing $($file.Name)" -PercentComplete $percentComplete
        Write-MandALog "[$fileCounter/$($csvFiles.Count)] Importing file: $($file.Name)" -Level DEBUG
        
        try {
            # Import with detailed timing
            $importStart = Get-Date
            $content = Import-Csv -Path $file.FullName -ErrorAction Stop
            $importTime = ((Get-Date) - $importStart).TotalSeconds
            
            if ($null -ne $content) {
                $recordCount = @($content).Count
                
                if ($recordCount -eq 0) {
                    Write-MandALog "  File '$($file.Name)' is empty (0 records)." -Level WARN
                    $loadStats.Empty++
                    $script:AggregationStats.Warnings += "Empty file: $($file.Name)"
                } else {
                    # Store with original name
                    $dataSources[$sourceName] = $content
                    Write-MandALog "  Successfully imported '$sourceName' with $recordCount records (${importTime}s)" -Level SUCCESS
                    $loadStats.Successful++
                    $loadStats.TotalRecords += $recordCount
                    
                    # Create mapped aliases
                    if ($sourceNameMappings.ContainsKey($sourceName)) {
                        foreach ($mappedName in $sourceNameMappings[$sourceName]) {
                            $dataSources[$mappedName] = $content
                            Write-MandALog "    Also mapped to '$mappedName' for compatibility." -Level DEBUG
                        }
                    }
                    
                    # Data enrichment based on source type
                    Invoke-SourceSpecificEnrichment -SourceName $sourceName -Data $content
                }
            } else {
                Write-MandALog "  File '$($file.Name)' returned null content." -Level WARN
                $loadStats.Failed++
                $script:AggregationStats.Warnings += "Null content: $($file.Name)"
            }
        }
        catch {
            Write-MandALog "  Failed to import '$($file.Name)': $($_.Exception.Message)" -Level ERROR
            $loadStats.Failed++
            $script:AggregationStats.Errors += "Import failed: $($file.Name) - $($_.Exception.Message)"
        }
    }
    
    Write-Progress -Activity "Importing Raw Data Sources" -Completed

    # Log comprehensive summary
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Data source loading completed:" -Level INFO
    Write-MandALog "  Files processed: $($csvFiles.Count)" -Level INFO
    Write-MandALog "  Successfully loaded: $($loadStats.Successful)" -Level SUCCESS
    Write-MandALog "  Failed to load: $($loadStats.Failed)" -Level $(if ($loadStats.Failed -gt 0) { "ERROR" } else { "INFO" })
    Write-MandALog "  Empty files: $($loadStats.Empty)" -Level $(if ($loadStats.Empty -gt 0) { "WARN" } else { "INFO" })
    Write-MandALog "  Total records imported: $($loadStats.TotalRecords)" -Level INFO
    Write-MandALog "  Total unique sources: $($dataSources.Count)" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    # Detailed source analysis
    Invoke-DataSourceAnalysis -DataSources $dataSources
    
    $script:AggregationStats.TotalRecordsProcessed = $loadStats.TotalRecords
    
    return $dataSources
}

#===============================================================================
# Invoke-SourceSpecificEnrichment
# Enriches data based on source type
#===============================================================================
function Invoke-SourceSpecificEnrichment {
    param(
        [string]$SourceName,
        [array]$Data
    )
    
    if ($Data.Count -eq 0) { return }
    
    switch -Wildcard ($SourceName) {
        '*Users*' {
            Write-MandALog "    Enriching user data from $SourceName" -Level DEBUG
            foreach ($user in $Data) {
                # Ensure UserPrincipalName exists
                if (-not $user.PSObject.Properties['UserPrincipalName'] -or [string]::IsNullOrWhiteSpace($user.UserPrincipalName)) {
                    if ($user.PSObject.Properties['mail'] -and $user.mail) {
                        $user | Add-Member -NotePropertyName 'UserPrincipalName' -NotePropertyValue $user.mail -Force
                    } elseif ($user.PSObject.Properties['SamAccountName'] -and $user.SamAccountName) {
                        $domain = Get-DomainFromDN -DistinguishedName $user.DistinguishedName
                        $user | Add-Member -NotePropertyName 'UserPrincipalName' -NotePropertyValue "$($user.SamAccountName)@$domain" -Force
                    }
                }
                
                # Add computed properties
                if ($user.PSObject.Properties['Created'] -or $user.PSObject.Properties['whenCreated']) {
                    # Replace null-coalescing operator with compatible code
                    $createdDate = if ($user.PSObject.Properties['Created'] -and $user.Created) { $user.Created } else { $user.whenCreated }
                    if ($createdDate) {
                        try {
                            $accountAge = (Get-Date) - [datetime]$createdDate
                            $user | Add-Member -NotePropertyName 'AccountAgeDays' -NotePropertyValue $accountAge.Days -Force
                        } catch {}
                    }
                }
            }
        }
        
        '*Computers*' {
            Write-MandALog "    Enriching computer/device data from $SourceName" -Level DEBUG
            foreach ($computer in $Data) {
                # Ensure consistent device ID
                if (-not $computer.PSObject.Properties['DeviceId']) {
                    if ($computer.PSObject.Properties['objectGUID']) {
                        $computer | Add-Member -NotePropertyName 'DeviceId' -NotePropertyValue $computer.objectGUID -Force
                    } elseif ($computer.PSObject.Properties['Name']) {
                        $computer | Add-Member -NotePropertyName 'DeviceId' -NotePropertyValue $computer.Name -Force
                    }
                }
                
                # Ensure DisplayName exists
                if (-not $computer.PSObject.Properties['DisplayName'] -and $computer.PSObject.Properties['Name']) {
                    $computer | Add-Member -NotePropertyName 'DisplayName' -NotePropertyValue $computer.Name -Force
                }
                
                # Parse OS information
                if ($computer.PSObject.Properties['OperatingSystem'] -and $computer.OperatingSystem) {
                    $osInfo = ConvertFrom-OperatingSystem -OSString $computer.OperatingSystem
                    $computer | Add-Member -NotePropertyName 'OSType' -NotePropertyValue $osInfo.Type -Force
                    $computer | Add-Member -NotePropertyName 'OSVersion' -NotePropertyValue $osInfo.Version -Force
                }
            }
        }
        
        '*Groups*' {
            Write-MandALog "    Enriching group data from $SourceName" -Level DEBUG
            foreach ($group in $Data) {
                # Calculate group type flags
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
# Analyzes loaded data sources for completeness
#===============================================================================
function Invoke-DataSourceAnalysis {
    param([hashtable]$DataSources)
    
    Write-MandALog "`nData Source Analysis:" -Level INFO
    Write-MandALog "────────────────────" -Level INFO
    
    # Check for critical user sources
    $userSources = @('ActiveDirectory_Users', 'Graph_Users', 'Exchange_MailboxUsers', 'ADUsers')
    $foundUserSources = @()
    
    foreach ($source in $userSources) {
        if ($DataSources.ContainsKey($source) -and $DataSources[$source].Count -gt 0) {
            $foundUserSources += $source
            Write-MandALog "  ✓ User source: $source (Records: $($DataSources[$source].Count))" -Level SUCCESS
        }
    }
    
    if ($foundUserSources.Count -eq 0) {
        Write-MandALog "  ✗ WARNING: No user data sources found! Processing may fail." -Level ERROR
        $script:AggregationStats.Errors += "No user data sources found"
    }
    
    # Check for device sources
    $deviceSources = @('ActiveDirectory_Computers', 'Graph_Devices', 'Intune_Devices', 'ADComputers')
    $foundDeviceSources = @()
    
    foreach ($source in $deviceSources) {
        if ($DataSources.ContainsKey($source) -and $DataSources[$source].Count -gt 0) {
            $foundDeviceSources += $source
            Write-MandALog "  ✓ Device source: $source (Records: $($DataSources[$source].Count))" -Level SUCCESS
        }
    }
    
    if ($foundDeviceSources.Count -eq 0) {
        Write-MandALog "  ℹ No device data sources found (this may be expected)." -Level INFO
    }
    
    # Check for group sources
    $groupSources = @('ActiveDirectory_Groups', 'Graph_Groups', 'ADGroups')
    $foundGroupSources = @()
    
    foreach ($source in $groupSources) {
        if ($DataSources.ContainsKey($source) -and $DataSources[$source].Count -gt 0) {
            $foundGroupSources += $source
            Write-MandALog "  ✓ Group source: $source (Records: $($DataSources[$source].Count))" -Level SUCCESS
        }
    }
    
    # Check for relationship data
    if ($DataSources.ContainsKey('ADGroupMembers') -or $DataSources.ContainsKey('TeamMembers')) {
        Write-MandALog "  ✓ Relationship data found for group memberships" -Level SUCCESS
    }
    
    if ($DataSources.ContainsKey('UserLicenseAssignments')) {
        Write-MandALog "  ✓ License assignment data found" -Level SUCCESS
    }
    
    Write-MandALog "────────────────────" -Level INFO
}

#===============================================================================
# Merge-UserProfiles
# Enhanced user merging with better deduplication and enrichment
#===============================================================================
function Merge-UserProfiles {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$DataSources
    )

    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Starting user profile aggregation and deduplication" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $canonicalUsers = @{}
    $mergeStats = @{
        TotalProcessed = 0
        Duplicates = 0
        MergeConflicts = 0
        SourceContributions = @{}
    }

    # Define the order of precedence for user sources
    $userSourcePrecedence = @(
        'ADUsers',
        'ActiveDirectory_Users',
        'AD_Users',
        'GraphUsers',
        'Graph_Users',
        'AAD_Users',
        'AzureAD_Users',
        'ExchangeMailboxUsers',
        'Exchange_MailboxUsers',
        'ExchangeUsers',
        'Exchange_Users',
        'MailboxUsers'
    )

    foreach ($sourceName in $userSourcePrecedence) {
        if (-not $DataSources.ContainsKey($sourceName)) {
            continue
        }
        
        $users = $DataSources[$sourceName]
        if ($null -eq $users -or $users.Count -eq 0) {
            continue
        }
        
        Write-MandALog "Processing $($users.Count) users from '$sourceName'..." -Level INFO
        $sourceProcessed = 0
        $sourceMerged = 0
        
        foreach ($user in $users) {
            $mergeStats.TotalProcessed++
            
            # Get primary identifier (UPN)
            $upn = Get-UserPrincipalName -User $user -SourceName $sourceName
            
            if ([string]::IsNullOrWhiteSpace($upn)) {
                Write-MandALog "  Skipping user with no valid UPN from '$sourceName'. DisplayName: $($user.DisplayName)" -Level WARN
                $script:AggregationStats.DataQualityIssues++
                continue
            }
            
            $upn = $upn.ToLower().Trim()
            
            # Create or update user entry
            if (-not $canonicalUsers.ContainsKey($upn)) {
                # New user
                $canonicalUsers[$upn] = [PSCustomObject]@{
                    UserPrincipalName = $upn
                    DataSources = @($sourceName)
                    MergeCount = 1
                    LastModified = Get-Date
                }
                $sourceProcessed++
            } else {
                # Existing user - merge
                $existingUser = $canonicalUsers[$upn]
                $existingUser.DataSources += $sourceName
                $existingUser.MergeCount++
                $existingUser.LastModified = Get-Date
                $sourceMerged++
                $mergeStats.Duplicates++
            }
            
            # Merge properties with conflict detection
            $mergeResult = Merge-UserProperties -ExistingUser $canonicalUsers[$upn] -NewUser $user -SourceName $sourceName
            if ($mergeResult.ConflictCount -gt 0) {
                $mergeStats.MergeConflicts += $mergeResult.ConflictCount
            }
        }
        
        $mergeStats.SourceContributions[$sourceName] = @{
            Processed = $sourceProcessed
            Merged = $sourceMerged
        }
        
        Write-MandALog "  Source '$sourceName': $sourceProcessed new, $sourceMerged merged" -Level SUCCESS
    }
    
    # Post-processing enrichment
    Write-MandALog "Performing post-merge enrichment..." -Level INFO
    $enrichmentStats = Invoke-UserEnrichment -Users $canonicalUsers -DataSources $DataSources
    
    # Final statistics
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "User Profile Merge Summary:" -Level INFO
    Write-MandALog "  Total unique users: $($canonicalUsers.Count)" -Level SUCCESS
    Write-MandALog "  Total records processed: $($mergeStats.TotalProcessed)" -Level INFO
    Write-MandALog "  Duplicate records merged: $($mergeStats.Duplicates)" -Level INFO
    Write-MandALog "  Merge conflicts resolved: $($mergeStats.MergeConflicts)" -Level $(if ($mergeStats.MergeConflicts -gt 0) { "WARN" } else { "INFO" })
    Write-MandALog "  Multi-source users: $(($canonicalUsers.Values | Where-Object { $_.MergeCount -gt 1 }).Count)" -Level INFO
    Write-MandALog "  Enrichment stats - Mailboxes: $($enrichmentStats.MailboxDataAdded), Guests: $($enrichmentStats.GuestUsersIdentified)" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $script:AggregationStats.MergeOperations += $mergeStats.Duplicates
    
    # Return as array
    return @($canonicalUsers.Values)
}

#===============================================================================
# Merge-DeviceProfiles
# Enhanced device merging supporting all device sources
#===============================================================================
function Merge-DeviceProfiles {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$DataSources
    )

    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Starting device profile aggregation" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $canonicalDevices = @{}
    $mergeStats = @{
        TotalProcessed = 0
        Duplicates = 0
        SourceContributions = @{}
    }

    # All possible device sources in order of precedence
    $deviceSources = @(
        'ADComputers',
        'ActiveDirectory_Computers',
        'AD_Computers',
        'GraphDevices',
        'Graph_Devices',
        'AAD_Devices',
        'AzureAD_Devices',
        'IntuneDevices',
        'Intune_Devices',
        'MDM_Devices'
    )

    foreach ($sourceName in $deviceSources) {
        if (-not $DataSources.ContainsKey($sourceName)) {
            continue
        }
        
        $devices = $DataSources[$sourceName]
        if ($null -eq $devices -or $devices.Count -eq 0) {
            continue
        }
        
        Write-MandALog "Processing $($devices.Count) devices from '$sourceName'..." -Level INFO
        $sourceProcessed = 0
        $sourceMerged = 0
        
        foreach ($device in $devices) {
            $mergeStats.TotalProcessed++
            
            # Get device identifier
            $deviceId = Get-DeviceIdentifier -Device $device -SourceName $sourceName
            
            if ([string]::IsNullOrWhiteSpace($deviceId)) {
                Write-MandALog "  Skipping device with no valid identifier from '$sourceName'" -Level WARN
                $script:AggregationStats.DataQualityIssues++
                continue
            }
            
            # Create or update device entry
            if (-not $canonicalDevices.ContainsKey($deviceId)) {
                $canonicalDevices[$deviceId] = [PSCustomObject]@{
                    DeviceId = $deviceId
                    DataSources = @($sourceName)
                    MergeCount = 1
                    LastModified = Get-Date
                }
                $sourceProcessed++
            } else {
                $existingDevice = $canonicalDevices[$deviceId]
                $existingDevice.DataSources += $sourceName
                $existingDevice.MergeCount++
                $existingDevice.LastModified = Get-Date
                $sourceMerged++
                $mergeStats.Duplicates++
            }
            
            # Merge properties
            Merge-DeviceProperties -ExistingDevice $canonicalDevices[$deviceId] -NewDevice $device -SourceName $sourceName
        }
        
        $mergeStats.SourceContributions[$sourceName] = @{
            Processed = $sourceProcessed
            Merged = $sourceMerged
        }
        
        Write-MandALog "  Source '$sourceName': $sourceProcessed new, $sourceMerged merged" -Level SUCCESS
    }
    
    # Device enrichment
    Write-MandALog "Performing device enrichment..." -Level INFO
    Invoke-DeviceEnrichment -Devices $canonicalDevices
    
    # Final statistics
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Device Profile Merge Summary:" -Level INFO
    Write-MandALog "  Total unique devices: $($canonicalDevices.Count)" -Level SUCCESS
    Write-MandALog "  Total records processed: $($mergeStats.TotalProcessed)" -Level INFO
    Write-MandALog "  Duplicate records merged: $($mergeStats.Duplicates)" -Level INFO
    Write-MandALog "  Multi-source devices: $(($canonicalDevices.Values | Where-Object { $_.MergeCount -gt 1 }).Count)" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $script:AggregationStats.MergeOperations += $mergeStats.Duplicates
    
    # Return as array
    if ($canonicalDevices.Count -gt 0) {
        return @($canonicalDevices.Values)
    } else {
        Write-MandALog "No devices found after merge operation" -Level WARN
        return @()
    }
}

#===============================================================================
# New-RelationshipGraph
# Enhanced relationship building with multiple data types
#===============================================================================
function New-RelationshipGraph {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$Users,
        
        [Parameter(Mandatory=$false)]
        [array]$Devices = @(),
        
        [Parameter(Mandatory=$true)]
        [hashtable]$DataSources
    )

    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Building comprehensive relationship graph" -Level INFO
    Write-MandALog "  Processing: $($Users.Count) users, $($Devices.Count) devices" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $relationshipStats = @{
        UserDeviceLinks = 0
        UserGroupLinks = 0
        UserLicenseLinks = 0
        UserManagerLinks = 0
        UserTeamLinks = 0
        TotalRelationships = 0
    }
    
    # Create lookup tables for performance
    $userLookup = @{}
    foreach ($user in $Users) {
        if ($user.UserPrincipalName) {
            $userLookup[$user.UserPrincipalName.ToLower()] = $user
        }
    }
    
    $deviceLookup = @{}
    if ($Devices.Count -gt 0) {
        foreach ($device in $Devices) {
            if ($device.DeviceId) {
                $deviceLookup[$device.DeviceId] = $device
            }
            # Also index by name for cross-reference
            if ($device.DisplayName) {
                $deviceLookup[$device.DisplayName] = $device
            }
        }
    }
    
    # 1. Map Devices to Users
    if ($Devices.Count -gt 0) {
        Write-MandALog "Mapping devices to users..." -Level INFO
        foreach ($user in $Users) {
            $userDevices = @()
            $userUPN = $user.UserPrincipalName.ToLower()
            
            # Check various device ownership fields
            foreach ($device in $Devices) {
                $isOwned = $false
                
                # Check different ownership fields
                if ($device.PSObject.Properties['RegisteredOwners'] -and $device.RegisteredOwners -match $userUPN) {
                    $isOwned = $true
                } elseif ($device.PSObject.Properties['RegisteredUsers'] -and $device.RegisteredUsers -match $userUPN) {
                    $isOwned = $true
                } elseif ($device.PSObject.Properties['ManagedBy'] -and $device.ManagedBy -match $userUPN) {
                    $isOwned = $true
                } elseif ($device.PSObject.Properties['PrimaryUser'] -and $device.PrimaryUser -match $userUPN) {
                    $isOwned = $true
                }
                
                if ($isOwned) {
                    $userDevices += $device
                    $relationshipStats.UserDeviceLinks++
                }
            }
            
            $user | Add-Member -MemberType NoteProperty -Name 'AssociatedDevices' -Value $userDevices -Force
            $user | Add-Member -MemberType NoteProperty -Name 'DeviceCount' -Value $userDevices.Count -Force
        }
        Write-MandALog "  Created $($relationshipStats.UserDeviceLinks) user-device relationships" -Level SUCCESS
    }
    
    # 2. Map Group Memberships to Users
    if ($DataSources.ContainsKey('ADGroupMembers') -or $DataSources.ContainsKey('ActiveDirectory_GroupMembers')) {
        Write-MandALog "Mapping group memberships to users..." -Level INFO
        
        # Replace null-coalescing operator with compatible code
        $groupMembers = if ($DataSources.ContainsKey('ADGroupMembers')) { $DataSources['ADGroupMembers'] } else { $DataSources['ActiveDirectory_GroupMembers'] }
        if ($groupMembers) {
            # Create group membership lookup
            $userGroups = @{}
            
            foreach ($membership in $groupMembers) {
                $memberIdentifier = $null
                
                # Try different member identifier fields
                if ($membership.PSObject.Properties['MemberUPN']) {
                    $memberIdentifier = $membership.MemberUPN.ToLower()
                } elseif ($membership.PSObject.Properties['MemberSamAccountName']) {
                    # Try to find user by SamAccountName
                    $matchingUser = $Users | Where-Object { 
                        $_.SamAccountName -eq $membership.MemberSamAccountName 
                    } | Select-Object -First 1
                    if ($matchingUser) {
                        $memberIdentifier = $matchingUser.UserPrincipalName.ToLower()
                    }
                } elseif ($membership.PSObject.Properties['MemberDistinguishedName']) {
                    # Try to find user by DN
                    $matchingUser = $Users | Where-Object { 
                        $_.DistinguishedName -eq $membership.MemberDistinguishedName 
                    } | Select-Object -First 1
                    if ($matchingUser) {
                        $memberIdentifier = $matchingUser.UserPrincipalName.ToLower()
                    }
                }
                
                if ($memberIdentifier -and $membership.GroupName) {
                    if (-not $userGroups.ContainsKey($memberIdentifier)) {
                        $userGroups[$memberIdentifier] = @()
                    }
                    $userGroups[$memberIdentifier] += $membership.GroupName
                    $relationshipStats.UserGroupLinks++
                }
            }
            
            # Apply group memberships to users
            foreach ($user in $Users) {
                $userUPN = $user.UserPrincipalName.ToLower()
                if ($userGroups.ContainsKey($userUPN)) {
                    $groups = @($userGroups[$userUPN] | Select-Object -Unique)
                    $user | Add-Member -MemberType NoteProperty -Name 'GroupMemberships' -Value $groups -Force
                    $user | Add-Member -MemberType NoteProperty -Name 'GroupCount' -Value $groups.Count -Force
                } else {
                    $user | Add-Member -MemberType NoteProperty -Name 'GroupMemberships' -Value @() -Force
                    $user | Add-Member -MemberType NoteProperty -Name 'GroupCount' -Value 0 -Force
                }
            }
            
            Write-MandALog "  Created $($relationshipStats.UserGroupLinks) user-group relationships" -Level SUCCESS
        }
    }
    
    # 3. Map License Assignments to Users
    if ($DataSources.ContainsKey('UserLicenseAssignments')) {
        Write-MandALog "Mapping license assignments to users..." -Level INFO
        
        $licenseAssignments = $DataSources['UserLicenseAssignments']
        $userLicenses = @{}
        
        foreach ($assignment in $licenseAssignments) {
            $userUPN = $assignment.UserPrincipalName
            if ($userUPN) {
                $userUPN = $userUPN.ToLower()
                if (-not $userLicenses.ContainsKey($userUPN)) {
                    $userLicenses[$userUPN] = @()
                }
                
                $licenseInfo = [PSCustomObject]@{
                    SkuId = $assignment.SkuId
                    SkuPartNumber = $assignment.SkuPartNumber
                    ServicePlans = $assignment.ServicePlans
                    AssignedDate = $assignment.AssignedDateTime
                }
                
                $userLicenses[$userUPN] += $licenseInfo
                $relationshipStats.UserLicenseLinks++
            }
        }
        
        # Apply licenses to users
        foreach ($user in $Users) {
            $userUPN = $user.UserPrincipalName.ToLower()
            if ($userLicenses.ContainsKey($userUPN)) {
                $user | Add-Member -MemberType NoteProperty -Name 'AssignedLicenses' -Value $userLicenses[$userUPN] -Force
                $user | Add-Member -MemberType NoteProperty -Name 'LicenseCount' -Value $userLicenses[$userUPN].Count -Force
            } else {
                $user | Add-Member -MemberType NoteProperty -Name 'AssignedLicenses' -Value @() -Force
                $user | Add-Member -MemberType NoteProperty -Name 'LicenseCount' -Value 0 -Force
            }
        }
        
        Write-MandALog "  Created $($relationshipStats.UserLicenseLinks) user-license relationships" -Level SUCCESS
    }
    
    # 4. Map Manager Relationships
    Write-MandALog "Building manager hierarchy..." -Level INFO
    foreach ($user in $Users) {
        if ($user.PSObject.Properties['Manager'] -and $user.Manager) {
            # Manager might be DN, UPN, or display name
            $managerUser = Find-UserByIdentifier -Identifier $user.Manager -UserLookup $userLookup -Users $Users
            
            if ($managerUser) {
                $user | Add-Member -MemberType NoteProperty -Name 'ManagerUPN' -Value $managerUser.UserPrincipalName -Force
                $user | Add-Member -MemberType NoteProperty -Name 'ManagerDisplayName' -Value $managerUser.DisplayName -Force
                
                # Add to manager's direct reports
                if (-not $managerUser.PSObject.Properties['DirectReports']) {
                    $managerUser | Add-Member -MemberType NoteProperty -Name 'DirectReports' -Value @() -Force
                }
                $managerUser.DirectReports += $user.UserPrincipalName
                
                $relationshipStats.UserManagerLinks++
            }
        }
    }
    Write-MandALog "  Created $($relationshipStats.UserManagerLinks) manager relationships" -Level SUCCESS
    
    # 5. Map Teams Memberships
    if ($DataSources.ContainsKey('TeamMembers')) {
        Write-MandALog "Mapping Teams memberships..." -Level INFO
        
        $teamMembers = $DataSources['TeamMembers']
        $userTeams = @{}
        
        foreach ($membership in $teamMembers) {
            if ($membership.UserPrincipalName -and $membership.TeamDisplayName) {
                $userUPN = $membership.UserPrincipalName.ToLower()
                if (-not $userTeams.ContainsKey($userUPN)) {
                    $userTeams[$userUPN] = @()
                }
                
                $teamInfo = [PSCustomObject]@{
                    TeamName = $membership.TeamDisplayName
                    TeamId = $membership.TeamId
                    Role = $membership.Role
                }
                
                $userTeams[$userUPN] += $teamInfo
                $relationshipStats.UserTeamLinks++
            }
        }
        
        # Apply team memberships to users
        foreach ($user in $Users) {
            $userUPN = $user.UserPrincipalName.ToLower()
            if ($userTeams.ContainsKey($userUPN)) {
                $user | Add-Member -MemberType NoteProperty -Name 'TeamMemberships' -Value $userTeams[$userUPN] -Force
                $user | Add-Member -MemberType NoteProperty -Name 'TeamCount' -Value $userTeams[$userUPN].Count -Force
            } else {
                $user | Add-Member -MemberType NoteProperty -Name 'TeamMemberships' -Value @() -Force
                $user | Add-Member -MemberType NoteProperty -Name 'TeamCount' -Value 0 -Force
            }
        }
        
        Write-MandALog "  Created $($relationshipStats.UserTeamLinks) Teams relationships" -Level SUCCESS
    }
    
    # Calculate final statistics
    $relationshipStats.TotalRelationships = $relationshipStats.UserDeviceLinks + 
                                           $relationshipStats.UserGroupLinks + 
                                           $relationshipStats.UserLicenseLinks + 
                                           $relationshipStats.UserManagerLinks + 
                                           $relationshipStats.UserTeamLinks
    
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Relationship Graph Summary:" -Level INFO
    Write-MandALog "  Total relationships created: $($relationshipStats.TotalRelationships)" -Level SUCCESS
    Write-MandALog "  Users with devices: $(($Users | Where-Object { $_.DeviceCount -gt 0 }).Count)" -Level INFO
    Write-MandALog "  Users with groups: $(($Users | Where-Object { $_.GroupCount -gt 0 }).Count)" -Level INFO
    Write-MandALog "  Users with licenses: $(($Users | Where-Object { $_.LicenseCount -gt 0 }).Count)" -Level INFO
    Write-MandALog "  Users with managers: $(($Users | Where-Object { $_.PSObject.Properties['ManagerUPN'] -and $_.ManagerUPN }).Count)" -Level INFO
    Write-MandALog "  Users in Teams: $(($Users | Where-Object { $_.TeamCount -gt 0 }).Count)" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $script:AggregationStats.RelationshipsCreated = $relationshipStats.TotalRelationships
    
    return $Users
}

#===============================================================================
# Helper Functions
#===============================================================================

function Get-DomainFromDN {
    param([string]$DistinguishedName)
    
    if ([string]::IsNullOrWhiteSpace($DistinguishedName)) {
        return "domain.local"
    }
    
    if ($DistinguishedName -match 'DC=([^,]+),DC=([^,]+)') {
        return "$($matches[1]).$($matches[2])"
    }
    
    return "domain.local"
}

function Get-UserPrincipalName {
    param(
        $User,
        [string]$SourceName
    )
    
    # Try various UPN fields
    $upnFields = @('UserPrincipalName', 'userPrincipalName', 'UPN', 'upn', 'PrimarySmtpAddress', 'mail', 'Mail')
    
    foreach ($field in $upnFields) {
        if ($User.PSObject.Properties[$field] -and $User.$field) {
            return $User.$field
        }
    }
    
    # Try to construct from SamAccountName
    if ($User.PSObject.Properties['SamAccountName'] -and $User.SamAccountName) {
        $domain = Get-DomainFromDN -DistinguishedName $User.DistinguishedName
        return "$($User.SamAccountName)@$domain"
    }
    
    return $null
}

function Get-DeviceIdentifier {
    param(
        $Device,
        [string]$SourceName
    )
    
    # Try various ID fields in order of preference
    $idFields = @('DeviceId', 'id', 'objectGUID', 'AzureADDeviceId', 'IntuneDeviceId', 'SerialNumber', 'Name', 'DisplayName')
    
    foreach ($field in $idFields) {
        if ($Device.PSObject.Properties[$field] -and $Device.$field) {
            return $Device.$field
        }
    }
    
    return $null
}

function Merge-UserProperties {
    param(
        $ExistingUser,
        $NewUser,
        [string]$SourceName
    )
    
    $mergeResult = @{
        PropertiesMerged = 0
        ConflictCount = 0
        Conflicts = @()
    }
    
    # Properties that should not be overwritten if they exist
    $protectedProperties = @('SamAccountName', 'SID', 'ObjectGUID', 'UserPrincipalName')
    
    # Properties that should be accumulated rather than overwritten
    $accumulativeProperties = @('proxyAddresses', 'memberOf', 'ServicePlans')
    
    foreach ($prop in $NewUser.PSObject.Properties) {
        $propName = $prop.Name
        $newValue = $prop.Value
        
        # Skip null or empty values
        if ($null -eq $newValue -or 
            ($newValue -is [string] -and [string]::IsNullOrWhiteSpace($newValue))) {
            continue
        }
        
        # Check if property exists on existing user
        if ($ExistingUser.PSObject.Properties[$propName]) {
            $existingValue = $ExistingUser.$propName
            
            # Protected property check
            if ($propName -in $protectedProperties -and $null -ne $existingValue) {
                continue
            }
            
            # Accumulative property handling
            if ($propName -in $accumulativeProperties) {
                if ($existingValue -is [array]) {
                    $combined = @($existingValue) + @($newValue) | Select-Object -Unique
                    $ExistingUser.$propName = $combined
                } else {
                    $ExistingUser.$propName = @($existingValue, $newValue) | Select-Object -Unique
                }
                $mergeResult.PropertiesMerged++
                continue
            }
            
            # Conflict detection for other properties
            if ($null -ne $existingValue -and $existingValue -ne $newValue) {
                # Special handling for date fields - keep the most recent
                if ($propName -match 'Date|Time' -and $existingValue -is [datetime] -and $newValue -is [datetime]) {
                    if ([datetime]$newValue -gt [datetime]$existingValue) {
                        $ExistingUser.$propName = $newValue
                        $mergeResult.PropertiesMerged++
                    }
                } else {
                    # Log conflict but use precedence order (existing value wins for now)
                    $mergeResult.Conflicts += [PSCustomObject]@{
                        Property = $propName
                        ExistingValue = $existingValue
                        NewValue = $newValue
                        Source = $SourceName
                        Resolution = "Kept existing value"
                    }
                    $mergeResult.ConflictCount++
                }
            } elseif ($null -eq $existingValue) {
                # No conflict - add the value
                $ExistingUser | Add-Member -MemberType NoteProperty -Name $propName -Value $newValue -Force
                $mergeResult.PropertiesMerged++
            }
        } else {
            # Property doesn't exist - add it
            $ExistingUser | Add-Member -MemberType NoteProperty -Name $propName -Value $newValue -Force
            $mergeResult.PropertiesMerged++
        }
    }
    
    # Log conflicts if any
    if ($mergeResult.ConflictCount -gt 0 -and $mergeResult.Conflicts.Count -le 5) {
        foreach ($conflict in $mergeResult.Conflicts) {
            Write-MandALog "    Merge conflict for $($ExistingUser.UserPrincipalName): Property '$($conflict.Property)' - $($conflict.Resolution)" -Level DEBUG
        }
    }
    
    return $mergeResult
}

function Merge-DeviceProperties {
    param(
        $ExistingDevice,
        $NewDevice,
        [string]$SourceName
    )
    
    # Similar to user property merge but for devices
    foreach ($prop in $NewDevice.PSObject.Properties) {
        $propName = $prop.Name
        $newValue = $prop.Value
        
        if ($null -eq $newValue -or 
            ($newValue -is [string] -and [string]::IsNullOrWhiteSpace($newValue))) {
            continue
        }
        
        if (-not $ExistingDevice.PSObject.Properties[$propName] -or 
            $null -eq $ExistingDevice.$propName) {
            $ExistingDevice | Add-Member -MemberType NoteProperty -Name $propName -Value $newValue -Force
        }
    }
}

function ConvertFrom-OperatingSystem {
    param([string]$OSString)
    
    $osInfo = @{
        Type = "Unknown"
        Version = "Unknown"
    }
    
    if ($OSString -match 'Windows') {
        $osInfo.Type = "Windows"
        if ($OSString -match 'Windows (\d+)') {
            $osInfo.Version = $matches[1]
        } elseif ($OSString -match 'Windows Server (\d+)') {
            $osInfo.Type = "Windows Server"
            $osInfo.Version = $matches[1]
        }
    } elseif ($OSString -match 'Mac|macOS|OS X') {
        $osInfo.Type = "macOS"
    } elseif ($OSString -match 'Linux|Ubuntu|CentOS|RedHat') {
        $osInfo.Type = "Linux"
    } elseif ($OSString -match 'iOS') {
        $osInfo.Type = "iOS"
    } elseif ($OSString -match 'Android') {
        $osInfo.Type = "Android"
    }
    
    return $osInfo
}

function Invoke-UserEnrichment {
    param(
        [hashtable]$Users,
        [hashtable]$DataSources
    )
    
    $enrichmentStats = @{
        MailboxDataAdded = 0
        LicenseDataEnriched = 0
        ManagerChainBuilt = 0
        GuestUsersIdentified = 0
    }
    
    # Enrich with Exchange mailbox data if available
    if ($DataSources.ContainsKey('ExchangeMailboxUsers') -or $DataSources.ContainsKey('Exchange_MailboxUsers')) {
        # Replace null-coalescing operator with compatible code
        $mailboxData = if ($DataSources.ContainsKey('ExchangeMailboxUsers')) { $DataSources['ExchangeMailboxUsers'] } else { $DataSources['Exchange_MailboxUsers'] }
        
        if ($mailboxData) {
            $mailboxLookup = @{}
            foreach ($mailbox in $mailboxData) {
                if ($mailbox.PrimarySmtpAddress) {
                    $mailboxLookup[$mailbox.PrimarySmtpAddress.ToLower()] = $mailbox
                }
            }
            
            foreach ($userEntry in $Users.GetEnumerator()) {
                $user = $userEntry.Value
                $upn = $user.UserPrincipalName.ToLower()
                
                if ($mailboxLookup.ContainsKey($upn)) {
                    $mailbox = $mailboxLookup[$upn]
                    $user | Add-Member -MemberType NoteProperty -Name 'HasExchangeMailbox' -Value $true -Force
                    $user | Add-Member -MemberType NoteProperty -Name 'MailboxType' -Value $mailbox.RecipientTypeDetails -Force
                    $user | Add-Member -MemberType NoteProperty -Name 'MailboxDatabase' -Value $mailbox.Database -Force
                    $user | Add-Member -MemberType NoteProperty -Name 'MailboxSize' -Value $mailbox.TotalItemSize -Force
                    $enrichmentStats.MailboxDataAdded++
                }
            }
        }
    }
    
    # Identify guest users
    foreach ($userEntry in $Users.GetEnumerator()) {
        $user = $userEntry.Value
        if ($user.UserPrincipalName -match '#EXT#@' -or 
            ($user.PSObject.Properties['UserType'] -and $user.UserType -eq 'Guest')) {
            $user | Add-Member -MemberType NoteProperty -Name 'IsGuestUser' -Value $true -Force
            $enrichmentStats.GuestUsersIdentified++
        } else {
            $user | Add-Member -MemberType NoteProperty -Name 'IsGuestUser' -Value $false -Force
        }
    }
    
    Write-MandALog "  Enrichment completed: $($enrichmentStats.MailboxDataAdded) mailboxes, $($enrichmentStats.GuestUsersIdentified) guests" -Level SUCCESS
    
    return $enrichmentStats
}

function Invoke-DeviceEnrichment {
    param([hashtable]$Devices)
    
    foreach ($deviceEntry in $Devices.GetEnumerator()) {
        $device = $deviceEntry.Value
        
        # Determine device type based on various indicators
        $deviceType = "Unknown"
        
        if ($device.PSObject.Properties['deviceType']) {
            $deviceType = $device.deviceType
        } elseif ($device.PSObject.Properties['OperatingSystem']) {
            $os = $device.OperatingSystem
            if ($os -match 'Server') {
                $deviceType = "Server"
            } elseif ($os -match 'Windows') {
                $deviceType = "Workstation"
            } elseif ($os -match 'iOS|iPhone|iPad') {
                $deviceType = "Mobile"
            } elseif ($os -match 'Android') {
                $deviceType = "Mobile"
            } elseif ($os -match 'Mac|macOS') {
                $deviceType = "Workstation"
            }
        }
        
        $device | Add-Member -MemberType NoteProperty -Name 'DeviceType' -Value $deviceType -Force
        
        # Calculate device age if creation date available
        if ($device.PSObject.Properties['Created'] -or $device.PSObject.Properties['whenCreated']) {
            # Replace null-coalescing operator with compatible code
            $createdDate = if ($device.PSObject.Properties['Created'] -and $device.Created) { $device.Created } else { $device.whenCreated }
            if ($createdDate) {
                try {
                    $deviceAge = (Get-Date) - [datetime]$createdDate
                    $device | Add-Member -MemberType NoteProperty -Name 'DeviceAgeDays' -Value $deviceAge.Days -Force
                } catch {}
            }
        }
    }
}

function Find-UserByIdentifier {
    param(
        [string]$Identifier,
        [hashtable]$UserLookup,
        [array]$Users
    )
    
    if ([string]::IsNullOrWhiteSpace($Identifier)) {
        return $null
    }
    
    # Try as UPN first
    if ($UserLookup.ContainsKey($Identifier.ToLower())) {
        return $UserLookup[$Identifier.ToLower()]
    }
    
    # Try to find by DN
    if ($Identifier -match '^CN=') {
        $user = $Users | Where-Object { $_.DistinguishedName -eq $Identifier } | Select-Object -First 1
        if ($user) { return $user }
    }
    
    # Try to find by display name
    $user = $Users | Where-Object { $_.DisplayName -eq $Identifier } | Select-Object -First 1
    if ($user) { return $user }
    
    # Try to find by SamAccountName
    $user = $Users | Where-Object { $_.SamAccountName -eq $Identifier } | Select-Object -First 1
    if ($user) { return $user }
    
    return $null
}

#===============================================================================
# Export-ProcessedData
# Exports all processed data to CSV files
#===============================================================================
function Export-ProcessedData {
    param(
        [string]$ProcessedDataPath,
        [array]$Users,
        [array]$Devices,
        [hashtable]$DataSources
    )
    
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Exporting processed data to: $ProcessedDataPath" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    $exportStats = @{
        FilesExported = 0
        RecordsExported = 0
    }
    
    # Create directory if it doesn't exist
    if (-not (Test-Path $ProcessedDataPath -PathType Container)) {
        New-Item -Path $ProcessedDataPath -ItemType Directory -Force | Out-Null
    }
    
    # Export Users
    if ($Users.Count -gt 0) {
        $userFile = Join-Path $ProcessedDataPath "Users.csv"
        Write-MandALog "Exporting $($Users.Count) users to Users.csv..." -Level INFO
        
        # Flatten complex properties for CSV export
        $exportUsers = foreach ($user in $Users) {
            $exportUser = $user.PSObject.Copy()
            
            # Convert array properties to semicolon-delimited strings
            if ($exportUser.GroupMemberships -is [array]) {
                $exportUser.GroupMemberships = $exportUser.GroupMemberships -join ';'
            }
            if ($exportUser.AssociatedDevices -is [array]) {
                $exportUser.AssociatedDevices = ($exportUser.AssociatedDevices | ForEach-Object { $_.DisplayName }) -join ';'
            }
            if ($exportUser.TeamMemberships -is [array]) {
                $exportUser.TeamMemberships = ($exportUser.TeamMemberships | ForEach-Object { $_.TeamName }) -join ';'
            }
            if ($exportUser.AssignedLicenses -is [array]) {
                $exportUser.AssignedLicenses = ($exportUser.AssignedLicenses | ForEach-Object { $_.SkuPartNumber }) -join ';'
            }
            if ($exportUser.DirectReports -is [array]) {
                $exportUser.DirectReports = $exportUser.DirectReports -join ';'
            }
            
            # Remove system properties
            $exportUser.PSObject.Properties.Remove('DataSources')
            $exportUser.PSObject.Properties.Remove('MergeCount')
            $exportUser.PSObject.Properties.Remove('LastModified')
            
            $exportUser
        }
        
        $exportUsers | Export-Csv -Path $userFile -NoTypeInformation -Encoding UTF8
        Write-MandALog "  ✓ Exported Users.csv ($($Users.Count) records)" -Level SUCCESS
        $exportStats.FilesExported++
        $exportStats.RecordsExported += $Users.Count
    }
    
    # Export Devices
    if ($Devices.Count -gt 0) {
        $deviceFile = Join-Path $ProcessedDataPath "Devices.csv"
        Write-MandALog "Exporting $($Devices.Count) devices to Devices.csv..." -Level INFO
        
        $exportDevices = foreach ($device in $Devices) {
            $exportDevice = $device.PSObject.Copy()
            
            # Remove system properties
            $exportDevice.PSObject.Properties.Remove('DataSources')
            $exportDevice.PSObject.Properties.Remove('MergeCount')
            $exportDevice.PSObject.Properties.Remove('LastModified')
            
            $exportDevice
        }
        
        $exportDevices | Export-Csv -Path $deviceFile -NoTypeInformation -Encoding UTF8
        Write-MandALog "  ✓ Exported Devices.csv ($($Devices.Count) records)" -Level SUCCESS
        $exportStats.FilesExported++
        $exportStats.RecordsExported += $Devices.Count
    }
    
    # Export UserProfiles (required by downstream processes)
    if ($Users.Count -gt 0) {
        $profileFile = Join-Path $ProcessedDataPath "UserProfiles.csv"
        Write-MandALog "Creating UserProfiles.csv for downstream compatibility..." -Level INFO
        
        $Users | Select-Object UserPrincipalName, DisplayName, GivenName, Surname, 
                              Department, Title, Manager, Enabled, Mail, 
                              HasExchangeMailbox, MailboxType, IsGuestUser,
                              DeviceCount, GroupCount, LicenseCount, TeamCount,
                              @{N='ComplexityScore';E={0}}, # Placeholder for processing phase
                              @{N='MigrationCategory';E={'Not Assessed'}}, # Placeholder
                              @{N='ReadinessStatus';E={'Not Assessed'}} # Placeholder |
            Export-Csv -Path $profileFile -NoTypeInformation -Encoding UTF8
            
        Write-MandALog "  ✓ Exported UserProfiles.csv" -Level SUCCESS
        $exportStats.FilesExported++
    }
    
    # Export other non-merged data sources
    $skipSources = @(
        'ActiveDirectory_Users', 'ADUsers', 'AD_Users',
        'Graph_Users', 'AAD_Users', 'AzureAD_Users',
        'Exchange_MailboxUsers', 'ExchangeUsers', 'MailboxUsers',
        'ActiveDirectory_Computers', 'ADComputers', 'AD_Computers',
        'Graph_Devices', 'AAD_Devices', 'AzureAD_Devices',
        'Intune_Devices', 'MDM_Devices'
    )
    
    foreach ($source in $DataSources.Keys) {
        if ($source -notin $skipSources -and $DataSources[$source].Count -gt 0) {
            $fileName = "$source.csv"
            $filePath = Join-Path $ProcessedDataPath $fileName
            
            Write-MandALog "Exporting $source data ($($DataSources[$source].Count) records)..." -Level INFO
            $DataSources[$source] | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
            Write-MandALog "  ✓ Exported $fileName" -Level SUCCESS
            
            $exportStats.FilesExported++
            $exportStats.RecordsExported += $DataSources[$source].Count
        }
    }
    
    # Export aggregation summary
    $summaryFile = Join-Path $ProcessedDataPath "AggregationSummary.json"
    $summary = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Statistics = $script:AggregationStats
        UserCount = $Users.Count
        DeviceCount = $Devices.Count
        DataSourcesProcessed = $DataSources.Keys.Count
        FilesExported = $exportStats.FilesExported
        TotalRecordsExported = $exportStats.RecordsExported
    }
    
    $summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryFile -Encoding UTF8
    Write-MandALog "  ✓ Exported AggregationSummary.json" -Level SUCCESS
    
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    Write-MandALog "Export completed: $($exportStats.FilesExported) files, $($exportStats.RecordsExported) total records" -Level SUCCESS
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO
    
    return $exportStats
}

#endregion

#===============================================================================
#                           START-DATAAGGREGATION
# Main exported function for the module
#===============================================================================
function Start-DataAggregation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Initialize statistics
    $script:AggregationStats.StartTime = Get-Date
    
    $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
    $rawDataPath = $global:MandA.Paths.RawDataOutput

    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level HEADER
    Write-MandALog "            STARTING DATA AGGREGATION PHASE" -Level HEADER
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level HEADER
    Write-MandALog "Configuration:" -Level INFO
    Write-MandALog "  Company: $($Configuration.metadata.companyName)" -Level INFO
    Write-MandALog "  Raw data path: $rawDataPath" -Level INFO
    Write-MandALog "  Output path: $processedDataPath" -Level INFO
    Write-MandALog "  Start time: $($script:AggregationStats.StartTime)" -Level INFO
    Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level INFO

    try {
        # Step 1: Load all raw data
        Write-MandALog "`nPHASE 1: Loading Raw Data Sources" -Level HEADER
        $dataSources = Import-RawDataSources -RawDataPath $rawDataPath
        
        if ($null -eq $dataSources -or $dataSources.Count -eq 0) {
            throw "No data sources were loaded. Halting processing."
        }

        # Step 2: Merge User Profiles
        Write-MandALog "`nPHASE 2: Merging User Profiles" -Level HEADER
        $mergedUsers = Merge-UserProfiles -DataSources $dataSources

        # Step 3: Merge Device Profiles
        Write-MandALog "`nPHASE 3: Merging Device Profiles" -Level HEADER
        $mergedDevices = Merge-DeviceProfiles -DataSources $dataSources

        # Step 4: Build Relationships
        Write-MandALog "`nPHASE 4: Building Relationship Graph" -Level HEADER
        $enrichedUsers = New-RelationshipGraph -Users $mergedUsers -Devices $mergedDevices -DataSources $dataSources

        # Step 5: Export processed data
        Write-MandALog "`nPHASE 5: Exporting Processed Data" -Level HEADER
        $exportStats = Export-ProcessedData -ProcessedDataPath $processedDataPath -Users $enrichedUsers -Devices $mergedDevices -DataSources $dataSources

        # Calculate final statistics
        $script:AggregationStats.EndTime = Get-Date
        $duration = $script:AggregationStats.EndTime - $script:AggregationStats.StartTime

        # Final summary
        Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level HEADER
        Write-MandALog "            DATA AGGREGATION COMPLETED SUCCESSFULLY" -Level HEADER
        Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level HEADER
        Write-MandALog "Summary:" -Level INFO
        Write-MandALog "  Duration: $($duration.ToString('mm\:ss'))" -Level INFO
        Write-MandALog "  Source files processed: $($script:AggregationStats.TotalSourceFiles)" -Level INFO
        Write-MandALog "  Total records processed: $($script:AggregationStats.TotalRecordsProcessed)" -Level INFO
        Write-MandALog "  Merge operations: $($script:AggregationStats.MergeOperations)" -Level INFO
        Write-MandALog "  Relationships created: $($script:AggregationStats.RelationshipsCreated)" -Level INFO
        Write-MandALog "  Data quality issues: $($script:AggregationStats.DataQualityIssues)" -Level $(if ($script:AggregationStats.DataQualityIssues -gt 0) { "WARN" } else { "INFO" })
        Write-MandALog "  Warnings: $($script:AggregationStats.Warnings.Count)" -Level $(if ($script:AggregationStats.Warnings.Count -gt 0) { "WARN" } else { "INFO" })
        Write-MandALog "  Errors: $($script:AggregationStats.Errors.Count)" -Level $(if ($script:AggregationStats.Errors.Count -gt 0) { "ERROR" } else { "INFO" })
        Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level HEADER

        return $true
    }
    catch {
        $script:AggregationStats.EndTime = Get-Date
        $script:AggregationStats.Errors += "Fatal error: $($_.Exception.Message)"
        
        Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level ERROR
        Write-MandALog "            DATA AGGREGATION FAILED" -Level ERROR
        Write-MandALog "═══════════════════════════════════════════════════════════════════════" -Level ERROR
        Write-MandALog "ERROR: A critical error occurred during data aggregation: $($_.Exception.Message)" -Level ERROR
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level DEBUG
        
        # Log all accumulated errors
        if ($script:AggregationStats.Errors.Count -gt 0) {
            Write-MandALog "`nAll errors encountered:" -Level ERROR
            foreach ($errorItem in $script:AggregationStats.Errors) {
                Write-MandALog "  - $errorItem" -Level ERROR
            }
        }
        
        return $false
    }
}

# Export the main function
Export-ModuleMember -Function Start-DataAggregation

Write-MandALog "DataAggregation module v2.0.0 loaded successfully" -Level DEBUG