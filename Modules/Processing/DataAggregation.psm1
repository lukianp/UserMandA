#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Data Aggregation Module
.DESCRIPTION
    This module is responsible for loading all raw data discovered by various
    discovery modules, aggregating it, and building a comprehensive relationship graph.
.NOTES
    Version: 1.3.0 (Enhanced Relationship Graph Logic)
    Author: Gemini
#>

[CmdletBinding()]
param()

# Helper function to import specific CSV files if they exist
function Import-RawDataFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RawDataPath,
        [Parameter(Mandatory = $true)]
        [string]$FileName,
        [Parameter(Mandatory = $true)]
        [hashtable]$AggregatedDataStore,
        [Parameter(Mandatory = $true)]
        [string]$DataCategoryKey
    )
    $filePath = Join-Path $RawDataPath $FileName
    if (Test-Path $filePath) {
        Write-MandALog "Importing raw data file: $FileName" -Level "INFO"
        try {
            $data = Import-DataFromCSV -FilePath $filePath 
            if ($null -ne $data) {
                if ($AggregatedDataStore.ContainsKey($DataCategoryKey)) { $AggregatedDataStore[$DataCategoryKey].AddRange($data) } # Use AddRange for lists
                else { $AggregatedDataStore[$DataCategoryKey] = [System.Collections.Generic.List[object]]::new(); $AggregatedDataStore[$DataCategoryKey].AddRange($data) }
                Write-MandALog "Successfully imported $($data.Count) records from $FileName into category '$DataCategoryKey'." -Level "DEBUG"
            } else { Write-MandALog "No data imported from $FileName (file might be empty or Import-DataFromCSV returned null)." -Level "INFO" }
        } catch { Write-MandALog "Failed to import or process $FileName. Error: $($_.Exception.Message)" -Level "WARN" }
    } else { Write-MandALog "Raw data file not found: $FileName. Skipping." -Level "INFO" }
}

# Function to build the relationship graph
function New-ComprehensiveRelationshipGraph {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$AggregatedDataStore, # Contains .Users, .Groups, .Devices etc. as Lists
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Building comprehensive relationship graph..." -Level "INFO"
    $relationshipGraph = @{
        UserToGroupMembership = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]]::new(); # Key: UserId (UPN or GraphId), Value: List of Group DisplayNames or GroupIds
        GroupToUserMembership = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]]::new(); # Key: GroupId, Value: List of User UPNs or UserIds
        UserToDeviceLink = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]]::new();# Key: UserId, Value: List of DeviceNames or DeviceIds
        DeviceToUserLink = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]]::new();# Key: DeviceId, Value: List of User UPNs or UserIds
        UserToAppRoleAssignment = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[object]]]::new(); # Key: UserId, Value: List of App Role Assignment details (AppName, RoleName)
        AppToUserRoleAssignment = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[object]]]::new(); # Key: AppId (Resource), Value: List of App Role Assignment details
        UserToOwnedObject = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[object]]]::new(); # Key: UserId, Value: List of owned objects (Apps, SPs, Groups - with type and name)
        ObjectToOwner = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]]::new(); # Key: ObjectId, Value: List of Owner User UPNs or UserIds
        ManagerToDirectReport = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]]::new(); # Key: Manager UPN/Id, Value: List of Direct Report UPNs/Ids
        Notes = "Relationship graph generation started."
    }

    # --- Populate Relationship Graph ---
    $totalUsers = if ($AggregatedDataStore.Users) { $AggregatedDataStore.Users.Count } else { 0 }
    $processedItems = 0

    # 1. User to Group Memberships & Group to User Memberships
    Write-MandALog "Processing User-Group memberships..." -Level "DEBUG"
    if ($AggregatedDataStore.Users) {
        foreach ($user in $AggregatedDataStore.Users) {
            $processedItems++; Update-Progress -Activity "Graphing User-Group Links" -Status "User $processedItems of $totalUsers" -PercentComplete (($processedItems / $totalUsers) * 100)
            
            $userId = $user.GraphId # Prefer GraphId for Azure AD objects
            if ([string]::IsNullOrWhiteSpace($userId)) { $userId = $user.UserPrincipalName } # Fallback
            if ([string]::IsNullOrWhiteSpace($userId)) { continue }

            # Example: If raw user object from Graph has 'MemberOf' property (expanded or from Get-MgUserMemberOf)
            # This assumes 'MemberOf' contains objects with 'Id' and 'DisplayName' for groups.
            if ($user.PSObject.Properties['MemberOf'] -and $user.MemberOf) {
                if (-not $relationshipGraph.UserToGroupMembership.ContainsKey($userId)) { $relationshipGraph.UserToGroupMembership[$userId] = [System.Collections.Generic.List[string]]::new() }
                
                $user.MemberOf | ForEach-Object {
                    $groupObject = $_
                    $groupId = $groupObject.Id
                    $groupDisplayName = $groupObject.DisplayName
                    if (-not [string]::IsNullOrWhiteSpace($groupId)) {
                        if (-not $relationshipGraph.UserToGroupMembership[$userId].Contains($groupDisplayName)) { # Store display name for easier use in profile
                            $relationshipGraph.UserToGroupMembership[$userId].Add($groupDisplayName)
                        }
                        # Populate reverse: GroupToUser
                        if (-not $relationshipGraph.GroupToUserMembership.ContainsKey($groupId)) { $relationshipGraph.GroupToUserMembership[$groupId] = [System.Collections.Generic.List[string]]::new() }
                        if (-not $relationshipGraph.GroupToUserMembership[$groupId].Contains($userId)) {
                            $relationshipGraph.GroupToUserMembership[$groupId].Add($userId) # Store UserID here
                        }
                    }
                }
            }
        }
    }
    Write-Progress -Activity "Graphing User-Group Links" -Completed

    # 2. User to Device Links
    Write-MandALog "Processing User-Device links..." -Level "DEBUG"
    if ($AggregatedDataStore.IntuneManagedDevices) { # Assuming Intune data is primary for managed devices
        $totalDevices = $AggregatedDataStore.IntuneManagedDevices.Count; $processedItems = 0
        foreach ($device in $AggregatedDataStore.IntuneManagedDevices) {
            $processedItems++; Update-Progress -Activity "Graphing User-Device Links" -Status "Device $processedItems of $totalDevices" -PercentComplete (($processedItems / $totalDevices) * 100)

            $deviceId = $device.DeviceId
            $userId = $device.UserId # This is often the Graph User ID
            $userUPN = $device.UserPrincipalName

            if (-not ([string]::IsNullOrWhiteSpace($userId) -or [string]::IsNullOrWhiteSpace($deviceId))) {
                if (-not $relationshipGraph.UserToDeviceLink.ContainsKey($userId)) { $relationshipGraph.UserToDeviceLink[$userId] = [System.Collections.Generic.List[string]]::new() }
                if (-not $relationshipGraph.UserToDeviceLink[$userId].Contains($device.DeviceName)) { # Store device name
                    $relationshipGraph.UserToDeviceLink[$userId].Add($device.DeviceName)
                }
                if (-not $relationshipGraph.DeviceToUserLink.ContainsKey($deviceId)) { $relationshipGraph.DeviceToUserLink[$deviceId] = [System.Collections.Generic.List[string]]::new() }
                if (-not $relationshipGraph.DeviceToUserLink[$deviceId].Contains($userUPN)) { # Store UPN
                    $relationshipGraph.DeviceToUserLink[$deviceId].Add($userUPN)
                }
            }
        }
    }
    Write-Progress -Activity "Graphing User-Device Links" -Completed

    # 3. User to App Role Assignments (from Graph Service Principals and User App Role Assignments data)
    # This requires data from Get-MgUserAppRoleAssignment and Get-MgServicePrincipalAppRoleAssignedTo
    # Assuming $AggregatedDataStore.UserAppRoleAssignments and $AggregatedDataStore.ServicePrincipalAppRoleAssignments exist
    # For simplicity, this part remains a more detailed placeholder.
    # You would iterate through these collections and populate $relationshipGraph.UserToAppRoleAssignment and $relationshipGraph.AppToUserRoleAssignment

    # 4. User to Owned Objects (Apps, SPs, Groups)
    Write-MandALog "Processing Object Ownership links..." -Level "DEBUG"
    # Example for Owned Applications (from $AggregatedDataStore.Applications which might have an 'owners' property)
    if ($AggregatedDataStore.Applications) {
        $totalApps = $AggregatedDataStore.Applications.Count; $processedItems = 0
        foreach ($app in $AggregatedDataStore.Applications) {
            $processedItems++; Update-Progress -Activity "Graphing Ownership" -Status "App $processedItems of $totalApps" -PercentComplete (($processedItems / $totalApps) * 100)
            if ($app.PSObject.Properties['Owners'] -and $app.Owners) { # Assuming 'Owners' is a list of user objects/IDs
                foreach ($ownerRef in $app.Owners) {
                    $ownerId = $ownerRef.Id # Assuming ownerRef is an object with an Id property (user's GraphId)
                    if (-not [string]::IsNullOrWhiteSpace($ownerId)) {
                        if (-not $relationshipGraph.UserToOwnedObject.ContainsKey($ownerId)) { $relationshipGraph.UserToOwnedObject[$ownerId] = [System.Collections.Generic.List[object]]::new() }
                        $relationshipGraph.UserToOwnedObject[$ownerId].Add([PSCustomObject]@{ObjectType="Application"; ObjectId=$app.Id; DisplayName=$app.DisplayName})
                        
                        if (-not $relationshipGraph.ObjectToOwner.ContainsKey($app.Id)) { $relationshipGraph.ObjectToOwner[$app.Id] = [System.Collections.Generic.List[string]]::new() }
                        if (-not $relationshipGraph.ObjectToOwner[$app.Id].Contains($ownerId)) { $relationshipGraph.ObjectToOwner[$app.Id].Add($ownerId) }
                    }
                }
            }
        }
    }
    # Similar logic for Service Principals and Groups if they have an 'owners' property in $AggregatedDataStore
    Write-Progress -Activity "Graphing Ownership" -Completed


    # 5. Manager to Direct Reports
    Write-MandALog "Processing Manager-Direct Report links..." -Level "DEBUG"
    if ($AggregatedDataStore.Users) {
        $userLookupByUPN = $AggregatedDataStore.Users | Group-Object -Property UserPrincipalName -AsHashTable -AsString
        $totalManagers = 0; $processedItems = 0; # Recalculate for this specific loop
        $potentialManagers = $AggregatedDataStore.Users | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Manager) }
        if ($potentialManagers) { $totalManagers = $potentialManagers.Count }

        foreach ($userWithManager in $potentialManagers) {
            $processedItems++; Update-Progress -Activity "Graphing Manager Links" -Status "User $processedItems of $totalManagers" -PercentComplete (($processedItems / $totalManagers) * 100)

            $reportUPN = $userWithManager.UserPrincipalName
            $managerIdentifier = $userWithManager.Manager # This could be a UPN, DisplayName, or ID. Needs normalization or lookup.
            
            # Assuming managerIdentifier is a UPN or can be resolved to one for consistency
            # This is a simplified example. Robust manager resolution is complex.
            $managerUPN = $managerIdentifier # Needs to be the UPN of the manager
            if ($userLookupByUPN.ContainsKey($managerUPN)) {
                 if (-not $relationshipGraph.ManagerToDirectReport.ContainsKey($managerUPN)) { $relationshipGraph.ManagerToDirectReport[$managerUPN] = [System.Collections.Generic.List[string]]::new() }
                 if (-not $relationshipGraph.ManagerToDirectReport[$managerUPN].Contains($reportUPN)) {
                     $relationshipGraph.ManagerToDirectReport[$managerUPN].Add($reportUPN)
                 }
            }
        }
    }
    Write-Progress -Activity "Graphing Manager Links" -Completed
    
    $relationshipGraph.Notes = "Relationship graph generation partially implemented. Focus on User-Group, User-Device, Ownership (Apps), and Manager links."
    Write-MandALog "Comprehensive Relationship Graph building (partially implemented) complete." -Level "SUCCESS"
    return $relationshipGraph
}

# Main exported function for this module
function Invoke-DataAggregation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$RawDataPath, 
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Data Aggregation Process from path: $RawDataPath" -Level "INFO"
    # Initialize with lists to allow AddRange
    $aggregatedDataStore = @{
        Users = [System.Collections.Generic.List[object]]::new(); Groups = [System.Collections.Generic.List[object]]::new();
        Computers = [System.Collections.Generic.List[object]]::new(); Devices = [System.Collections.Generic.List[object]]::new(); # Combined Graph & Intune devices
        Applications = [System.Collections.Generic.List[object]]::new(); ServicePrincipals = [System.Collections.Generic.List[object]]::new();
        DirectoryRoles = [System.Collections.Generic.List[object]]::new(); Mailboxes = [System.Collections.Generic.List[object]]::new();
        ExternalIdentities = [System.Collections.Generic.List[object]]::new(); GPOs = [System.Collections.Generic.List[object]]::new();
        # Azure Resources
        AzureSubscriptions = [System.Collections.Generic.List[object]]::new(); AzureResourceGroups = [System.Collections.Generic.List[object]]::new(); 
        AzureVMs = [System.Collections.Generic.List[object]]::new(); AzureStorageAccounts = [System.Collections.Generic.List[object]]::new();
        AzureSqlServers = [System.Collections.Generic.List[object]]::new(); AzureSqlDatabases = [System.Collections.Generic.List[object]]::new();
        AzureVNets = [System.Collections.Generic.List[object]]::new(); AzureNICs = [System.Collections.Generic.List[object]]::new();
        AzureNSGs = [System.Collections.Generic.List[object]]::new(); AzurePublicIPs = [System.Collections.Generic.List[object]]::new();
        AzureLoadBalancers = [System.Collections.Generic.List[object]]::new(); AzureAppGateways = [System.Collections.Generic.List[object]]::new();
        AzureKeyVaults = [System.Collections.Generic.List[object]]::new(); AzureAppServices = [System.Collections.Generic.List[object]]::new();
        AzureAppServicePlans = [System.Collections.Generic.List[object]]::new(); AzureAKSClusters = [System.Collections.Generic.List[object]]::new();
        AzureContainerRegistries = [System.Collections.Generic.List[object]]::new(); AzureManagedIdentities = [System.Collections.Generic.List[object]]::new();
        AzureRoleAssignments = [System.Collections.Generic.List[object]]::new();
        # Intune Data
        IntuneManagedDevices = [System.Collections.Generic.List[object]]::new(); IntuneDetectedApps = [System.Collections.Generic.List[object]]::new();
        IntuneDeviceCompliancePolicies = [System.Collections.Generic.List[object]]::new(); IntuneDeviceCompliancePolicyAssignments = [System.Collections.Generic.List[object]]::new();
        IntuneDeviceConfigurationProfiles = [System.Collections.Generic.List[object]]::new(); IntuneDeviceConfigurationProfileAssignments = [System.Collections.Generic.List[object]]::new();
        IntuneMobileApps = [System.Collections.Generic.List[object]]::new(); IntuneMobileAppAssignments = [System.Collections.Generic.List[object]]::new();
        IntuneDeviceEnrollmentConfigurations = [System.Collections.Generic.List[object]]::new(); 
        IntuneTermsAndConditions = [System.Collections.Generic.List[object]]::new(); IntuneTermsAndConditionsAssignments = [System.Collections.Generic.List[object]]::new();
        IntuneAutopilotProfiles = [System.Collections.Generic.List[object]]::new(); IntuneAutopilotProfileAssignments = [System.Collections.Generic.List[object]]::new();
        IntuneAppProtectionPolicies = [System.Collections.Generic.List[object]]::new(); IntuneAppProtectionPolicyAssignments = [System.Collections.Generic.List[object]]::new();
        IntuneRoleDefinitions = [System.Collections.Generic.List[object]]::new(); IntuneRoleAssignments = [System.Collections.Generic.List[object]]::new();
    }

    # Define expected raw data files from various discovery sources
    $filesToLoad = @(
        @{ FileName = "ADUsers.csv"; CategoryKey = "Users" }, @{ FileName = "ADSecurityGroups.csv"; CategoryKey = "Groups" }, @{ FileName = "ADComputers.csv"; CategoryKey = "Computers" },
        @{ FileName = "GraphUsers.csv"; CategoryKey = "Users" }, @{ FileName = "GraphGroups.csv"; CategoryKey = "Groups" }, 
        @{ FileName = "GraphDevices.csv"; CategoryKey = "Devices" }, @{ FileName = "GraphApplications.csv"; CategoryKey = "Applications" },
        @{ FileName = "GraphServicePrincipals.csv"; CategoryKey = "ServicePrincipals" }, @{ FileName = "GraphDirectoryRoles.csv"; CategoryKey = "DirectoryRoles" },
        @{ FileName = "ExchangeMailboxes.csv"; CategoryKey = "Mailboxes" }, @{ FileName = "ExternalIdentities.csv"; CategoryKey = "ExternalIdentities" }, 
        @{ FileName = "EnhancedGPOData.csv"; CategoryKey = "GPOs" }, # Or actual output name from EnhancedGPODiscovery
        # Azure Discovery Outputs
        @{ FileName = "AzureSubscriptions.csv"; CategoryKey = "AzureSubscriptions"}, @{ FileName = "AzureResourceGroups.csv"; CategoryKey = "AzureResourceGroups"},
        @{ FileName = "AzureVirtualMachines.csv"; CategoryKey = "AzureVMs"}, @{ FileName = "AzureStorageAccounts.csv"; CategoryKey = "AzureStorageAccounts"},
        @{ FileName = "AzureSqlServers.csv"; CategoryKey = "AzureSqlServers"}, @{ FileName = "AzureSqlDatabases.csv"; CategoryKey = "AzureSqlDatabases"},
        @{ FileName = "AzureVirtualNetworks.csv"; CategoryKey = "AzureVNets"}, @{ FileName = "AzureNetworkInterfaces.csv"; CategoryKey = "AzureNICs"},
        @{ FileName = "AzureNetworkSecurityGroups.csv"; CategoryKey = "AzureNSGs"}, @{ FileName = "AzurePublicIpAddresses.csv"; CategoryKey = "AzurePublicIPs"},
        @{ FileName = "AzureLoadBalancers.csv"; CategoryKey = "AzureLoadBalancers"}, @{ FileName = "AzureApplicationGateways.csv"; CategoryKey = "AzureAppGateways"},
        @{ FileName = "AzureKeyVaults.csv"; CategoryKey = "AzureKeyVaults"}, @{ FileName = "AzureAppServices.csv"; CategoryKey = "AzureAppServices"},
        @{ FileName = "AzureAppServicePlans.csv"; CategoryKey = "AzureAppServicePlans"}, @{ FileName = "AzureKubernetesClusters.csv"; CategoryKey = "AzureAKSClusters"},
        @{ FileName = "AzureContainerRegistries.csv"; CategoryKey = "AzureContainerRegistries"}, @{ FileName = "AzureManagedIdentities.csv"; CategoryKey = "AzureManagedIdentities"},
        @{ FileName = "AzureRoleAssignments.csv"; CategoryKey = "AzureRoleAssignments"},
        # Intune Discovery Outputs
        @{ FileName = "IntuneManagedDevices.csv"; CategoryKey = "IntuneManagedDevices" }, @{ FileName = "IntuneDetectedApps.csv"; CategoryKey = "IntuneDetectedApps" },
        @{ FileName = "IntuneDeviceCompliancePolicies.csv"; CategoryKey = "IntuneDeviceCompliancePolicies" }, @{ FileName = "IntuneDeviceCompliancePolicyAssignments.csv"; CategoryKey = "IntuneDeviceCompliancePolicyAssignments" },
        @{ FileName = "IntuneDeviceConfigurationProfiles.csv"; CategoryKey = "IntuneDeviceConfigurationProfiles" }, @{ FileName = "IntuneDeviceConfigurationProfileAssignments.csv"; CategoryKey = "IntuneDeviceConfigurationProfileAssignments" },
        @{ FileName = "IntuneMobileApps.csv"; CategoryKey = "IntuneMobileApps" }, @{ FileName = "IntuneMobileAppAssignments.csv"; CategoryKey = "IntuneMobileAppAssignments" },
        @{ FileName = "IntuneDeviceEnrollmentConfigurations.csv"; CategoryKey = "IntuneDeviceEnrollmentConfigurations" },
        @{ FileName = "IntuneTermsAndConditions.csv"; CategoryKey = "IntuneTermsAndConditions" }, @{ FileName = "IntuneTermsAndConditionsAssignments.csv"; CategoryKey = "IntuneTermsAndConditionsAssignments" },
        @{ FileName = "IntuneAutopilotProfiles.csv"; CategoryKey = "IntuneAutopilotProfiles" }, @{ FileName = "IntuneAutopilotProfileAssignments.csv"; CategoryKey = "IntuneAutopilotProfileAssignments" },
        @{ FileName = "IntuneAppProtectionPolicies.csv"; CategoryKey = "IntuneAppProtectionPolicies" }, @{ FileName = "IntuneAppProtectionPolicyAssignments.csv"; CategoryKey = "IntuneAppProtectionPolicyAssignments"},
        @{ FileName = "IntuneRoleDefinitions.csv"; CategoryKey = "IntuneRoleDefinitions" }, @{ FileName = "IntuneRoleAssignments.csv"; CategoryKey = "IntuneRoleAssignments" }
    )

    Write-MandALog "Attempting to import raw data files..." -Level "INFO"
    foreach ($fileInfo in $filesToLoad) {
        Import-RawDataFile -RawDataPath $RawDataPath -FileName $fileInfo.FileName -AggregatedDataStore $aggregatedDataStore -DataCategoryKey $fileInfo.CategoryKey
    }
    Write-MandALog "Raw data import phase complete." -Level "INFO"

    # Post-loading processing: e.g., deduplicate users and combine device lists
    if ($aggregatedDataStore.Users.Count -gt 0) {
        Write-MandALog "Deduplicating user entries based on UserPrincipalName..." -Level "INFO"
        $uniqueUsers = $aggregatedDataStore.Users | Group-Object UserPrincipalName | ForEach-Object { $_.Group | Select-Object -First 1 } # Simple first-one-wins for duplicates
        $originalUserCount = $aggregatedDataStore.Users.Count
        $aggregatedDataStore.Users = [System.Collections.Generic.List[object]]::new($uniqueUsers)
        Write-MandALog "User deduplication complete. Original: $originalUserCount, Unique: $($aggregatedDataStore.Users.Count)" -Level "INFO"
    }
    
    # Combine GraphDevices (generic Azure AD registered) and IntuneManagedDevices into a single $aggregatedDataStore.Devices list
    # This requires consistent properties or careful mapping if properties differ.
    # For simplicity, this example merges Intune devices into the main Devices list if Intune data exists.
    # A more robust approach would be to have a separate, canonical 'Device' object structure.
    if ($aggregatedDataStore.IntuneManagedDevices.Count -gt 0) {
        Write-MandALog "Merging IntuneManagedDevices into main Devices list..." -Level "DEBUG"
        # Assuming IntuneManagedDevices have a 'DeviceId' and 'DeviceName' compatible with GraphDevices
        # This is a simple AddRange; true merging/deduplication would compare DeviceIds
        $aggregatedDataStore.Devices.AddRange($aggregatedDataStore.IntuneManagedDevices)
        if ($aggregatedDataStore.Devices.Count -gt 0) {
            $uniqueDevices = $aggregatedDataStore.Devices | Group-Object DeviceId | ForEach-Object { $_.Group | Select-Object -First 1}
            $originalDeviceCount = $aggregatedDataStore.Devices.Count
            $aggregatedDataStore.Devices = [System.Collections.Generic.List[object]]::new($uniqueDevices)
            Write-MandALog "Device list deduplication after Intune merge. Original combined: $originalDeviceCount, Unique: $($aggregatedDataStore.Devices.Count)" -Level "INFO"
        }
    }

    $relationshipGraph = New-ComprehensiveRelationshipGraph -AggregatedData $aggregatedDataStore -Configuration $Configuration
    
    Write-MandALog "Data Aggregation Process completed." -Level "SUCCESS"
    return @{
        AggregatedDataStore = $aggregatedDataStore 
        RelationshipGraph = $relationshipGraph
    }
}

Export-ModuleMember -Function Invoke-DataAggregation, New-ComprehensiveRelationshipGraph, Import-RawDataFile
