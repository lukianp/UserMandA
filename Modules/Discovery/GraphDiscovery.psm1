# -*- coding: utf-8-bom -*-
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
    
    Write-ProgressStep "Starting Graph Users Discovery..." -Status Progress
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allGraphUsers = [System.Collections.Generic.List[PSObject]]::new()
    
    $selectFields = $Configuration.graphAPI.selectFields.users
    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "userPrincipalName", "displayName", "mail", "accountEnabled", "createdDateTime", "lastSignInDateTime", "department", "jobTitle", "companyName", "onPremisesSyncEnabled", "assignedLicenses", "memberOf")
        Write-ProgressStep "Using default select fields for Graph users" -Status Info
    }

    try {
        Write-ProgressStep "Fetching all Graph users with select fields..." -Status Progress
        
        # Get initial batch to determine total count
        $firstBatch = Get-MgUser -Select $selectFields -Top 100 -ConsistencyLevel eventual -ErrorAction Stop
        
        # Get total count using advanced query
        $countParams = @{
            ConsistencyLevel = 'eventual'
            Count = $true
        }
        $userCount = Get-MgUser @countParams -Top 1
        $totalUsers = $userCount.Count
        
        Write-ProgressStep "Found $totalUsers users to process" -Status Info
        
        # Process all users with progress
        $processedCount = 0
        $pageSize = 999  # Maximum page size for Graph API
        
        # Use pagination
        $graphUsers = Get-MgUser -Select $selectFields -All -PageSize $pageSize -ConsistencyLevel eventual -ErrorAction SilentlyContinue
        
        if ($graphUsers) {
            foreach ($user in $graphUsers) {
                $processedCount++
                
                # Update progress every 50 users
                if ($processedCount % 50 -eq 0 -or $processedCount -eq $totalUsers) {
                    Show-ProgressBar -Current $processedCount -Total $totalUsers `
                        -Activity "Processing user: $($user.UserPrincipalName)"
                }
                
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
                
                if ($selectFields -contains "memberOf" -and $user.MemberOf) {
                    $userProps["memberOf_Count"] = ($user.MemberOf | Measure-Object).Count
                }
                
                $allGraphUsers.Add([PSCustomObject]$userProps)
            }
            
            Write-Host "" # Clear progress bar line
            
            if ($allGraphUsers.Count -gt 0) {
                Write-ProgressStep "Exporting $($allGraphUsers.Count) Graph users to CSV..." -Status Progress
                Export-DataToCSV -InputObject $allGraphUsers -FileName "GraphUsers.csv" -OutputPath $outputPath
                Write-ProgressStep "Successfully exported Graph Users" -Status Success
            } else {
                Write-ProgressStep "No Graph User objects constructed" -Status Warning
            }
        } else {
            Write-ProgressStep "No Graph Users found or error during retrieval" -Status Warning
        }
    } catch {
        Write-ProgressStep "Error during Graph Users Discovery: $($_.Exception.Message)" -Status Error
        throw
    }
    
    return $allGraphUsers
}

function Get-GraphGroupsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    Write-ProgressStep "Starting Graph Groups Discovery..." -Status Progress
    
    $allGraphGroups = [System.Collections.Generic.List[PSObject]]::new()
    $allGraphGroupMembers = [System.Collections.Generic.List[PSObject]]::new()

    $selectFields = $Configuration.graphAPI.selectFields.groups
    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "displayName", "mailEnabled", "securityEnabled", "groupTypes", "description", "visibility", "createdDateTime")
        Write-ProgressStep "Using default select fields for Graph groups" -Status Info
    }
    
    try {
        Write-ProgressStep "Fetching all Graph groups..." -Status Progress
        
        # Get groups with pagination support
        $graphGroups = Get-MgGroup -Select $selectFields -All -ConsistencyLevel eventual -ErrorAction SilentlyContinue
        
        if ($graphGroups) {
            $totalGroups = @($graphGroups).Count
            Write-ProgressStep "Found $totalGroups groups to process" -Status Info
            
            $processedCount = 0
            
            foreach ($group in $graphGroups) {
                $processedCount++
                
                # Update progress every 25 groups
                if ($processedCount % 25 -eq 0 -or $processedCount -eq $totalGroups) {
                    Show-ProgressBar -Current $processedCount -Total $totalGroups `
                        -Activity "Processing group: $($group.DisplayName)"
                }
                
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

                $getGroupMembersFlag = $false
                if ($Configuration.discovery.graph -and $Configuration.discovery.graph.ContainsKey('getGroupMembers')) {
                    $getGroupMembersFlag = [System.Convert]::ToBoolean($Configuration.discovery.graph.getGroupMembers)
                }

                if ($getGroupMembersFlag) {
                    Write-Host "`r  Fetching members for group..." -NoNewline -ForegroundColor Gray
                    
                    $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction SilentlyContinue
                    if ($members) {
                        $members | ForEach-Object {
                            $allGraphGroupMembers.Add([PSCustomObject]@{
                                GroupId = $group.Id
                                GroupDisplayName = $group.DisplayName
                                MemberId = $_.Id
                                MemberType = $_.AdditionalProperties['@odata.type']
                                MemberDisplayName = $_.AdditionalProperties['displayName']
                            })
                        }
                    }
                    
                    Write-Host "`r" + (" " * 80) + "`r" -NoNewline # Clear sub-status line
                }
            }
            
            Write-Host "" # Clear progress bar line
            
            if ($allGraphGroups.Count -gt 0) {
                Write-ProgressStep "Exporting $($allGraphGroups.Count) Graph groups to CSV..." -Status Progress
                Export-DataToCSV -InputObject $allGraphGroups -FileName "GraphGroups.csv" -OutputPath $outputPath
                Write-ProgressStep "Successfully exported Graph Groups" -Status Success
            } else {
                Write-ProgressStep "No Graph Group objects constructed" -Status Warning
            }
            
            if ($allGraphGroupMembers.Count -gt 0) {
                Write-ProgressStep "Exporting $($allGraphGroupMembers.Count) group memberships to CSV..." -Status Progress
                Export-DataToCSV -InputObject $allGraphGroupMembers -FileName "GraphGroupMembers.csv" -OutputPath $outputPath
                Write-ProgressStep "Successfully exported Graph Group Memberships" -Status Success
            }
        } else {
            Write-ProgressStep "No Graph Groups found or error during retrieval" -Status Warning
        }
    } catch {
        Write-ProgressStep "Error during Graph Groups Discovery: $($_.Exception.Message)" -Status Error
        throw
    }
    
    return @{Groups = $allGraphGroups; Members = $allGraphGroupMembers}
}

function Get-GraphGroupsDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Graph Groups Discovery..." -Level "INFO"
   
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
