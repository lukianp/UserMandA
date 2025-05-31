# Module: GraphDiscovery.psm1
# Description: Handles discovery of Microsoft Graph entities like Users, Groups, Applications, etc.
# Version: 1.1.1 (Fixed Get-Default issue)
# Date: 2025-05-31

#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Groups 
# Add other specific Microsoft.Graph.* modules as needed

# --- Helper Functions (Assumed to be available globally from Utility Modules) ---
# Export-DataToCSV -FunctionPath $global:MandAUtilitiesModulesPath\FileOperations.psm1
# Write-MandALog -FunctionPath $global:MandAUtilitiesModulesPath\EnhancedLogging.psm1

# --- Private Functions (Specific to this module) ---

function Get-GraphUsersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Graph Users Discovery..." -Level "INFO"
    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    $allGraphUsers = [System.Collections.Generic.List[PSObject]]::new()
    
    $apiVersion = "v1.0" # Default API version
    if ($Configuration.graphAPI -and $Configuration.graphAPI.ContainsKey('apiVersion') -and -not [string]::IsNullOrWhiteSpace($Configuration.graphAPI.apiVersion)) {
        $apiVersion = $Configuration.graphAPI.apiVersion
    } else {
        Write-MandALog "graphAPI.apiVersion not configured, using default '$apiVersion'." -Level "DEBUG"
    }
    # Note: Microsoft.Graph cmdlets typically default to v1.0 or beta based on module version or specific cmdlets.
    # Setting a specific version like this is more relevant for direct Invoke-RestMethod calls.
    # For SDK, ensure you have the right module version (v1.0 or beta) for the cmdlets you use.

    $pageSize = 100 # Default page size
    if ($Configuration.graphAPI -and $Configuration.graphAPI.ContainsKey('pageSize') -and $Configuration.graphAPI.pageSize -is [int] -and $Configuration.graphAPI.pageSize -gt 0) {
        $pageSize = $Configuration.graphAPI.pageSize
    } elseif ($Configuration.graphAPI -and $Configuration.graphAPI.ContainsKey('pageSize')) {
        Write-MandALog "graphAPI.pageSize ('$($Configuration.graphAPI.pageSize)') is not a valid positive integer, using default '$pageSize'." -Level "WARN"
    } else {
        Write-MandALog "graphAPI.pageSize not configured, using default '$pageSize'." -Level "DEBUG"
    }

    $selectFields = $Configuration.graphAPI.selectFields.users
    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "userPrincipalName", "displayName", "mail", "accountEnabled", "createdDateTime", "lastSignInDateTime", "department", "jobTitle", "companyName", "onPremisesSyncEnabled")
        Write-MandALog "User selectFields for Graph not defined in config, using default set: $($selectFields -join ',')." -Level "DEBUG"
    }

    try {
        Write-MandALog "Fetching Graph Users with select fields: $($selectFields -join ','). Page size: $pageSize." -Level "DEBUG"
        # For full data, use -All. This example gets one page.
        $graphUsers = Get-MgUser -Select $selectFields -Top $pageSize -ConsistencyLevel eventual -CountVariable userCountTotal -ErrorAction SilentlyContinue
        
        if ($graphUsers) {
            $graphUsers | ForEach-Object {
                $userProps = @{}
                foreach($field in $selectFields){
                    if ($_.PSObject.Properties[$field]) {
                        $userProps[$field] = $_.PSObject.Properties[$field].Value
                    } else {
                        $userProps[$field] = $null
                    }
                }
                if ($selectFields -contains "assignedLicenses" -and $_.AssignedLicenses) {
                    $userProps["assignedLicenses"] = ($_.AssignedLicenses | ForEach-Object { $_.SkuId }) -join ";"
                }
                if ($selectFields -contains "memberOf" -and $_.MemberOf) {
                     $userProps["memberOf"] = ($_.MemberOf.Id -join ';')
                }
                $allGraphUsers.Add([PSCustomObject]$userProps)
            }
            if ($allGraphUsers.Count -gt 0) {
                Export-DataToCSV -InputObject $allGraphUsers -FileName "GraphUsers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully discovered and exported $($allGraphUsers.Count) Graph Users (first page of potentially $userCountTotal)." -Level "SUCCESS"
                Write-MandALog "Note: Full pagination for Get-MgUser (e.g., using -All or NextLink) is recommended for complete data." -Level "INFO"
            } else {
                 Write-MandALog "No Graph User objects constructed after processing Get-MgUser results." -Level "INFO"
            }
        } else {
            Write-MandALog "No Graph Users found (Get-MgUser returned null or empty) or error during retrieval." -Level "WARN"
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

    $pageSize = 100 # Default page size
    if ($Configuration.graphAPI -and $Configuration.graphAPI.ContainsKey('pageSize') -and $Configuration.graphAPI.pageSize -is [int] -and $Configuration.graphAPI.pageSize -gt 0) {
        $pageSize = $Configuration.graphAPI.pageSize
    } elseif ($Configuration.graphAPI -and $Configuration.graphAPI.ContainsKey('pageSize')) {
        Write-MandALog "graphAPI.pageSize ('$($Configuration.graphAPI.pageSize)') is not a valid positive integer, using default '$pageSize'." -Level "WARN"
    } else {
        Write-MandALog "graphAPI.pageSize not configured, using default '$pageSize'." -Level "DEBUG"
    }

    $selectFields = $Configuration.graphAPI.selectFields.groups
    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "displayName", "mailEnabled", "securityEnabled", "groupTypes", "description", "visibility")
        Write-MandALog "Group selectFields for Graph not defined, using default: $($selectFields -join ',')." -Level "DEBUG"
    }
    
    try {
        Write-MandALog "Fetching Graph Groups with select fields: $($selectFields -join ','). Page size: $pageSize." -Level "DEBUG"
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

                $getGroupMembersFlag = $false
                if ($Configuration.discovery.graph -and $Configuration.discovery.graph.ContainsKey('getGroupMembers')) {
                    $getGroupMembersFlag = [System.Convert]::ToBoolean($Configuration.discovery.graph.getGroupMembers)
                }

                if ($getGroupMembersFlag) {
                    Write-MandALog "Fetching members for group '$($group.DisplayName)' ($($group.Id))..." -Level "DEBUG"
                    $members = Get-MgGroupMember -GroupId $group.Id -Top $pageSize -ErrorAction SilentlyContinue # Use -All for all members
                    if ($members) {
                        $members | ForEach-Object {
                            $allGraphGroupMembers.Add([PSCustomObject]@{
                                GroupId = $group.Id
                                GroupDisplayName = $group.DisplayName
                                MemberId = $_.Id
                                MemberType = $_.AdditionalProperties['@odata.type'] 
                                MemberDisplayName = $_.AdditionalProperties['displayName'] # displayName is often in AdditionalProperties for members
                            })
                        }
                    }
                }
            }
            if ($allGraphGroups.Count -gt 0) {
                Export-DataToCSV -InputObject $allGraphGroups -FileName "GraphGroups.csv" -OutputPath $outputPath
                Write-MandALog "Successfully discovered and exported $($allGraphGroups.Count) Graph Groups (first page of potentially $groupCountTotal)." -Level "SUCCESS"
            } else {
                 Write-MandALog "No Graph Group objects constructed after processing Get-MgGroup results." -Level "INFO"
            }
            
            if ($allGraphGroupMembers.Count -gt 0) {
                Export-DataToCSV -InputObject $allGraphGroupMembers -FileName "GraphGroupMembers.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allGraphGroupMembers.Count) Graph Group Memberships (first page for each group)." -Level "SUCCESS"
            }
            Write-MandALog "Note: Full pagination for Get-MgGroup and Get-MgGroupMember (e.g. using -All or NextLink) is recommended." -Level "INFO"
        } else {
            Write-MandALog "No Graph Groups found (Get-MgGroup returned null or empty) or error during retrieval." -Level "WARN"
        }
    } catch {
        Write-MandALog "Error during Graph Groups Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    return @{Groups = $allGraphGroups; Members = $allGraphGroupMembers}
}

# ... (Placeholders for Get-GraphApplicationsDataInternal, Get-GraphServicePrincipalsDataInternal, etc. should also be updated to remove Get-Default and use $Configuration robustly)


function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    Write-MandALog "--- Starting Microsoft Graph Discovery Phase ---" -Level "HEADER"
    $overallStatus = $true
    $discoveredData = @{}

    try {
        Get-MgContext -ErrorAction Stop | Out-Null
        Write-MandALog "Microsoft Graph context is active. Proceeding with Graph discovery." -Level "INFO"
    } catch {
        Write-MandALog "Microsoft Graph not connected or context unavailable. Skipping Graph Discovery. Error: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }

    try {
        $discoveredData.Users = Get-GraphUsersDataInternal -Configuration $Configuration
        $discoveredData.GroupsAndMembers = Get-GraphGroupsDataInternal -Configuration $Configuration
        # Add calls to other internal Graph discovery functions here
        # e.g., $discoveredData.Applications = Get-GraphApplicationsDataInternal -Configuration $Configuration
        
    } catch {
        Write-MandALog "An error occurred during the Graph Discovery Phase: $($_.Exception.Message)" -Level "ERROR" 
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
