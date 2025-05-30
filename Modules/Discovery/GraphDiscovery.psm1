# Module: GraphDiscovery.psm1
# Description: Handles discovery of Microsoft Graph entities like Users, Groups, Applications, etc.
# Version: 1.1.0 (Rewritten to accept Configuration parameter)
# Date: 2025-05-30

#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Groups 
# Add other specific Microsoft.Graph.* modules as needed, e.g.:
# Microsoft.Graph.Applications, Microsoft.Graph.DeviceManagement, Microsoft.Graph.Identity.SignIns, etc.

# --- Helper Functions (Assumed to be available globally from Utility Modules) ---
# Export-DataToCSV -FunctionPath $global:MandAUtilitiesModulesPath\FileOperations.psm1
# Write-MandALog -FunctionPath $global:MandAUtilitiesModulesPath\EnhancedLogging.psm1

# --- Private Functions (Specific to this module) ---

function Get-GraphUsersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
        # Add [object]$GraphConnection if you pass a specific connection object, otherwise rely on established global MgContext
    )
    Write-MandALog "Starting Graph Users Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allGraphUsers = [System.Collections.Generic.List[PSObject]]::new()
    
    # Graph API settings from configuration
    $apiVersion = $Configuration.graphAPI.apiVersion | Get-Default "v1.0"
    $selectFields = $Configuration.graphAPI.selectFields.users
    $pageSize = $Configuration.graphAPI.pageSize | Get-Default 100 # Default page size if not in config

    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "userPrincipalName", "displayName", "mail", "accountEnabled", "createdDateTime", "lastSignInDateTime", "department", "jobTitle", "companyName", "onPremisesSyncEnabled")
        Write-MandALog "User selectFields for Graph not defined in config, using default set: $($selectFields -join ',')." -Level "DEBUG"
    }

    try {
        Write-MandALog "Fetching Graph Users with select fields: $($selectFields -join ','). Page size: $pageSize" -Level "DEBUG"
        # Use -All for pagination, handle potential throttling with retry logic if needed for large tenants
        $graphUsers = Get-MgUser -Select $selectFields -Top $pageSize -ConsistencyLevel eventual -CountVariable userCountTotal -ErrorAction SilentlyContinue
        
        if ($graphUsers) {
            $graphUsers | ForEach-Object {
                # Create a PSCustomObject from the selected properties
                $userProps = @{}
                foreach($field in $selectFields){
                    if ($_.PSObject.Properties[$field]) {
                        $userProps[$field] = $_.PSObject.Properties[$field].Value
                    } else {
                        $userProps[$field] = $null # Ensure all columns exist even if property is null
                    }
                }
                # Handle complex types or expand them if necessary, e.g., assignedLicenses
                if ($selectFields -contains "assignedLicenses" -and $_.AssignedLicenses) {
                    $userProps["assignedLicenses"] = ($_.AssignedLicenses | ForEach-Object { $_.SkuId }) -join ";"
                }
                if ($selectFields -contains "memberOf" -and $_.MemberOf) {
                     $userProps["memberOf"] = ($_.MemberOf.Id -join ';') # Example, might want more details
                }

                $allGraphUsers.Add([PSCustomObject]$userProps)
            }
            Export-DataToCSV -InputObject $allGraphUsers -FileName "GraphUsers.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allGraphUsers.Count) Graph Users (first page of potentially $userCountTotal)." -Level "SUCCESS"
             # Add proper pagination logic here using $graphUsers.NextLink for a complete discovery
            Write-MandALog "Note: Full pagination for Get-MgUser -All is recommended for complete data." -Level "INFO"
        } else {
            Write-MandALog "No Graph Users found or error during retrieval." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during Graph Users Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    return $allGraphUsers
}

function Get-GraphGroupsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Graph Groups Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allGraphGroups = [System.Collections.Generic.List[PSObject]]::new()
    $allGraphGroupMembers = [System.Collections.Generic.List[PSObject]]::new()

    $selectFields = $Configuration.graphAPI.selectFields.groups
    $pageSize = $Configuration.graphAPI.pageSize | Get-Default 100

    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "displayName", "mailEnabled", "securityEnabled", "groupTypes", "description", "visibility")
        Write-MandALog "Group selectFields for Graph not defined, using default: $($selectFields -join ',')." -Level "DEBUG"
    }
    
    try {
        Write-MandALog "Fetching Graph Groups with select fields: $($selectFields -join ','). Page size: $pageSize" -Level "DEBUG"
        $graphGroups = Get-MgGroup -Select $selectFields -Top $pageSize -ConsistencyLevel eventual -CountVariable groupCountTotal -ErrorAction SilentlyContinue
        
        if ($graphGroups) {
            foreach ($group in $graphGroups) {
                $groupProps = @{}
                foreach($field in $selectFields){
                     if ($group.PSObject.Properties[$field]) {
                        $groupProps[$field] = $group.PSObject.Properties[$field].Value
                    } else {
                        $groupProps[$field] = $null
                    }
                }
                if ($selectFields -contains "groupTypes" -and $group.GroupTypes) {
                    $groupProps["groupTypes"] = ($group.GroupTypes -join ';')
                }
                $allGraphGroups.Add([PSCustomObject]$groupProps)

                # Optionally, get group members (can be very intensive, make it configurable)
                if ($Configuration.discovery.graph.getGroupMembers) { # Assuming a config flag
                    Write-MandALog "Fetching members for group '$($group.DisplayName)' ($($group.Id))..." -Level "DEBUG"
                    $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction SilentlyContinue # -All can be slow
                    if ($members) {
                        $members | ForEach-Object {
                            $allGraphGroupMembers.Add([PSCustomObject]@{
                                GroupId = $group.Id
                                GroupDisplayName = $group.DisplayName
                                MemberId = $_.Id
                                MemberType = $_.AdditionalProperties['@odata.type'] # e.g., "#microsoft.graph.user"
                                MemberDisplayName = try { Get-MgUser -UserId $_.Id -Property DisplayName -ErrorAction SilentlyContinue | Select-Object -ExpandProperty DisplayName } catch { $_.Id } # Example
                            })
                        }
                    }
                }
            }
            Export-DataToCSV -InputObject $allGraphGroups -FileName "GraphGroups.csv" -OutputPath $outputPath
            Write-MandALog "Successfully discovered and exported $($allGraphGroups.Count) Graph Groups (first page of potentially $groupCountTotal)." -Level "SUCCESS"
            
            if ($allGraphGroupMembers.Count -gt 0) {
                Export-DataToCSV -InputObject $allGraphGroupMembers -FileName "GraphGroupMembers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allGraphGroupMembers.Count) Graph Group Memberships." -Level "SUCCESS"
            }
             Write-MandALog "Note: Full pagination for Get-MgGroup -All and Get-MgGroupMember -All is recommended." -Level "INFO"
        } else {
            Write-MandALog "No Graph Groups found or error during retrieval." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during Graph Groups Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    return @{Groups = $allGraphGroups; Members = $allGraphGroupMembers}
}

# Placeholder for other Graph discovery functions, e.g.:
# function Get-GraphApplicationsDataInternal { param([hashtable]$Configuration) ... }
# function Get-GraphServicePrincipalsDataInternal { param([hashtable]$Configuration) ... }
# function Get-GraphDevicesDataInternal { param([hashtable]$Configuration) ... }
# function Get-GraphIntuneDataInternal { param([hashtable]$Configuration) ... } # If Intune discovery is part of this module
# function Get-GraphExternalIdentitiesDataInternal { param([hashtable]$Configuration) ... } # If External Identities are part of this

# --- Public Function (Exported) ---

function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    Write-MandALog "--- Starting Microsoft Graph Discovery Phase ---" -Level "HEADER"
    $overallStatus = $true
    $discoveredData = @{}

    # Check for Graph Connection (Conceptual - depends on how ConnectionManager exposes status)
    # Example: $graphConnection = $script:ConnectionStatus.Graph 
    # if (-not ($graphConnection -and $graphConnection.Connected)) {
    # This relies on $script:ConnectionStatus being accurately populated and accessible.
    # A simpler check might be to just try a basic Graph call.
    try {
        Get-MgContext -ErrorAction Stop | Out-Null
        Write-MandALog "Microsoft Graph context is active. Proceeding with Graph discovery." -Level "INFO"
    } catch {
        Write-MandALog "Microsoft Graph not connected or context unavailable. Skipping Graph Discovery. Error: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }

    try {
        # Call internal functions, passing the Configuration
        $discoveredData.Users = Get-GraphUsersDataInternal -Configuration $Configuration
        $discoveredData.GroupsAndMembers = Get-GraphGroupsDataInternal -Configuration $Configuration
        # $discoveredData.Applications = Get-GraphApplicationsDataInternal -Configuration $Configuration
        # $discoveredData.ServicePrincipals = Get-GraphServicePrincipalsDataInternal -Configuration $Configuration
        # $discoveredData.Devices = Get-GraphDevicesDataInternal -Configuration $Configuration
        # If Intune is part of GraphDiscovery module:
        # $discoveredData.Intune = Get-GraphIntuneDataInternal -Configuration $Configuration
        # If External Identities are part of GraphDiscovery module:
        # $discoveredData.ExternalIdentities = Get-GraphExternalIdentitiesDataInternal -Configuration $Configuration
        
        # Add more calls as you implement other internal Graph discovery functions

    } catch {
        Write-MandALog "An error occurred during the Graph Discovery Phase: $($_.Exception.Message)" -Level "CRITICAL_ERROR"
        $overallStatus = $false
    }

    if ($overallStatus) {
        Write-MandALog "--- Microsoft Graph Discovery Phase Completed Successfully ---" -Level "SUCCESS"
    } else {
        Write-MandALog "--- Microsoft Graph Discovery Phase Completed With Errors ---" -Level "ERROR"
    }
    
    return $discoveredData
}

Export-ModuleMember -Function Invoke-GraphDiscovery
