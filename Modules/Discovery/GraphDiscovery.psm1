<#
.SYNOPSIS
    Handles discovery of Microsoft Graph entities for M&A Discovery Suite
.DESCRIPTION
    This module provides comprehensive Microsoft Graph discovery capabilities
    including users, groups, applications, and other Graph entities.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Groups 
# Add other Microsoft.Graph.* modules as needed by specific internal functions

# --- Helper Functions (Assumed to be available globally) ---
# Export-DataToCSV
# Write-MandALog

# --- Private Functions ---

function Get-GraphUsersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Graph Users Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allGraphUsers = [System.Collections.Generic.List[PSObject]]::new()
    
    $selectFields = $Configuration.graphAPI.selectFields.users
    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "userPrincipalName", "displayName", "mail", "accountEnabled", "createdDateTime", "lastSignInDateTime", "department", "jobTitle", "companyName", "onPremisesSyncEnabled", "assignedLicenses", "memberOf")
        Write-MandALog "User selectFields for Graph not defined, using default: $($selectFields -join ',')." -Level "DEBUG"
    }

    try {
        Write-MandALog "Fetching All Graph Users with select fields: $($selectFields -join ','). This may take time for large tenants." -Level "INFO"
        # Using -All for pagination. For very large tenants, consider batching with -Top and NextLink manually.
        $graphUsers = Get-MgUser -Select $selectFields -All -ConsistencyLevel eventual -ErrorAction SilentlyContinue
        
        if ($graphUsers) {
            foreach ($user in $graphUsers) {
                $userProps = @{}
                foreach($field in $selectFields){
                    if ($user.PSObject.Properties[$field]) {
                        $userProps[$field] = $user.PSObject.Properties[$field].Value
                    } else {
                        $userProps[$field] = $null
                    }
                }
                if ($selectFields -contains "assignedLicenses" -and $user.AssignedLicenses) {
                    $userProps["assignedLicenses"] = ($user.AssignedLicenses | ForEach-Object { $_.SkuId }) -join ";"
                }
                if ($selectFields -contains "memberOf" -and $user.MemberOf) { # MemberOf might be limited by default, expand or separate query if needed
                     $userProps["memberOf_Count"] = ($user.MemberOf | Measure-Object).Count
                     # Storing all MemberOf IDs can make CSV huge. Consider count or specific groups.
                }
                $allGraphUsers.Add([PSCustomObject]$userProps)
            }
            if ($allGraphUsers.Count -gt 0) {
                Export-DataToCSV -InputObject $allGraphUsers -FileName "GraphUsers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully discovered and exported $($allGraphUsers.Count) Graph Users." -Level "SUCCESS"
            } else { Write-MandALog "No Graph User objects constructed." -Level "INFO" }
        } else { Write-MandALog "No Graph Users found or error during Get-MgUser -All." -Level "WARN" }
    } catch { Write-MandALog "Error during Graph Users Discovery: $($_.Exception.Message)" -Level "ERROR" }
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
    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "displayName", "mailEnabled", "securityEnabled", "groupTypes", "description", "visibility", "createdDateTime")
        Write-MandALog "Group selectFields for Graph not defined, using default: $($selectFields -join ',')." -Level "DEBUG"
    }
    
    try {
        Write-MandALog "Fetching All Graph Groups with select fields: $($selectFields -join ',')." -Level "INFO"
        $graphGroups = Get-MgGroup -Select $selectFields -All -ConsistencyLevel eventual -ErrorAction SilentlyContinue
        
        if ($graphGroups) {
            foreach ($group in $graphGroups) {
                $groupProps = @{}
                foreach($field in $selectFields){
                     if ($group.PSObject.Properties[$field]) { $groupProps[$field] = $group.PSObject.Properties[$field].Value }
                     else { $groupProps[$field] = $null }
                }
                if ($selectFields -contains "groupTypes" -and $group.GroupTypes) { $groupProps["groupTypes"] = ($group.GroupTypes -join ';') }
                $allGraphGroups.Add([PSCustomObject]$groupProps)

                $getGroupMembersFlag = $false
                if ($Configuration.discovery.graph -and $Configuration.discovery.graph.ContainsKey('getGroupMembers')) {
                    $getGroupMembersFlag = [System.Convert]::ToBoolean($Configuration.discovery.graph.getGroupMembers)
                }

                if ($getGroupMembersFlag) {
                    Write-MandALog "Fetching members for group '$($group.DisplayName)' ($($group.Id))..." -Level "DEBUG"
                    $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction SilentlyContinue
                    if ($members) {
                        $members | ForEach-Object {
                            $allGraphGroupMembers.Add([PSCustomObject]@{
                                GroupId = $group.Id; GroupDisplayName = $group.DisplayName; MemberId = $_.Id
                                MemberType = $_.AdditionalProperties['@odata.type']; MemberDisplayName = $_.AdditionalProperties['displayName']
                            })
                        }
                    }
                }
            }
            if ($allGraphGroups.Count -gt 0) {
                Export-DataToCSV -InputObject $allGraphGroups -FileName "GraphGroups.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allGraphGroups.Count) Graph Groups." -Level "SUCCESS"
            } else { Write-MandALog "No Graph Group objects constructed." -Level "INFO" }
            
            if ($allGraphGroupMembers.Count -gt 0) {
                Export-DataToCSV -InputObject $allGraphGroupMembers -FileName "GraphGroupMembers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allGraphGroupMembers.Count) Graph Group Memberships." -Level "SUCCESS"
            }
        } else { Write-MandALog "No Graph Groups found or error during Get-MgGroup -All." -Level "WARN" }
    } catch { Write-MandALog "Error during Graph Groups Discovery: $($_.Exception.Message)" -Level "ERROR" }
    return @{Groups = $allGraphGroups; Members = $allGraphGroupMembers}
}

# --- Public Function (Exported) ---
function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "--- Starting Microsoft Graph Discovery Phase ---" -Level "HEADER"
    $overallStatus = $true; $discoveredData = @{}
    try {
        Get-MgContext -ErrorAction Stop | Out-Null
        Write-MandALog "Graph context active. Proceeding." -Level "INFO"
    } catch { Write-MandALog "Graph not connected. Skipping. Error: $($_.Exception.Message)" -Level "ERROR"; return $null }

    try {
        $discoveredData.Users = Get-GraphUsersDataInternal -Configuration $Configuration
        $discoveredData.GroupsAndMembers = Get-GraphGroupsDataInternal -Configuration $Configuration
        # Add calls to Get-GraphApplicationsDataInternal, Get-GraphServicePrincipalsDataInternal etc. here
    } catch { Write-MandALog "Error in Graph Discovery Phase: $($_.Exception.Message)" -Level "ERROR"; $overallStatus = $false }
    if ($overallStatus) { Write-MandALog "--- Graph Discovery Phase Completed Successfully ---" -Level "SUCCESS" }
    else { Write-MandALog "--- Graph Discovery Phase Completed With Errors ---" -Level "ERROR" }
    return $discoveredData
}
Export-ModuleMember -Function Invoke-GraphDiscovery
