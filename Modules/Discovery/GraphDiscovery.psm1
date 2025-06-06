# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# DiscoveryResult class definition
# DiscoveryResult class is defined globally by the Orchestrator using Add-Type
# No local definition needed - the global C# class will be used

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

# Graph Discovery Prerequisites Function
function Test-GraphDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [DiscoveryResult]$Result,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Validating Graph Discovery prerequisites..." -Level "INFO" -Context $Context
    
    try {
        # Check if Microsoft Graph PowerShell modules are available
        $requiredModules = @('Microsoft.Graph.Authentication', 'Microsoft.Graph.Users', 'Microsoft.Graph.Groups')
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module -ListAvailable)) {
                $Result.AddError("$module PowerShell module is not available", $null, @{
                    Prerequisite = "$module Module"
                    Resolution = "Install $module PowerShell module using 'Install-Module $module'"
                })
                return
            }
        }
        
        # Import modules if not already loaded
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module)) {
                Import-Module $module -ErrorAction Stop
                Write-MandALog "$module module imported successfully" -Level "DEBUG" -Context $Context
            }
        }
        
        # Test Microsoft Graph connectivity
        try {
            $mgContext = Get-MgContext -ErrorAction Stop
            if (-not $mgContext) {
                $Result.AddError("Not connected to Microsoft Graph", $null, @{
                    Prerequisite = 'Microsoft Graph Authentication'
                    Resolution = 'Connect to Microsoft Graph using Connect-MgGraph'
                })
                return
            }
            
            Write-MandALog "Successfully connected to Microsoft Graph. Context: $($mgContext.Account)" -Level "SUCCESS" -Context $Context
            $Result.Metadata['GraphContext'] = $mgContext.Account
            $Result.Metadata['TenantId'] = $mgContext.TenantId
        }
        catch {
            $Result.AddError("Failed to verify Microsoft Graph connection", $_.Exception, @{
                Prerequisite = 'Microsoft Graph Connectivity'
                Resolution = 'Verify Microsoft Graph connection and permissions'
            })
            return
        }
        
        # Test basic Graph operations
        try {
            $testUser = Get-MgUser -Top 1 -ErrorAction Stop
            Write-MandALog "Successfully verified Microsoft Graph access" -Level "SUCCESS" -Context $Context
        }
        catch {
            $Result.AddError("Failed to access Microsoft Graph users", $_.Exception, @{
                Prerequisite = 'Microsoft Graph Access'
                Resolution = 'Verify Microsoft Graph permissions (User.Read.All, Group.Read.All)'
            })
            return
        }
        
        Write-MandALog "All Graph Discovery prerequisites validated successfully" -Level "SUCCESS" -Context $Context
        
    }
    catch {
        $Result.AddError("Unexpected error during prerequisites validation", $_.Exception, @{
            Prerequisite = 'General Validation'
        })
    }
}

function Get-GraphUsersWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $users = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-MandALog "Retrieving Microsoft Graph users..." -Level "INFO" -Context $Context
            
            $selectFields = $Configuration.graphAPI.selectFields.users
            if (-not $selectFields -or $selectFields.Count -eq 0) {
                $selectFields = @("id", "userPrincipalName", "displayName", "mail", "accountEnabled", "createdDateTime", "lastSignInDateTime", "department", "jobTitle", "companyName", "onPremisesSyncEnabled", "assignedLicenses")
                Write-MandALog "Using default select fields for Graph users" -Level "DEBUG" -Context $Context
            }
            
            # Get users with pagination
            $pageSize = 999  # Maximum page size for Graph API
            $allUsers = Get-MgUser -Select $selectFields -All -PageSize $pageSize -ConsistencyLevel eventual -ErrorAction Stop
            
            Write-MandALog "Retrieved $($allUsers.Count) Graph users" -Level "SUCCESS" -Context $Context
            
            # Process users with individual error handling
            $processedCount = 0
            foreach ($user in $allUsers) {
                try {
                    $processedCount++
                    if ($processedCount % 50 -eq 0) {
                        Write-MandALog "Processed $processedCount/$($allUsers.Count) users" -Level "PROGRESS" -Context $Context
                    }
                    
                    $userObj = ConvertTo-GraphUserObject -User $user -SelectFields $selectFields -Context $Context
                    if ($userObj) {
                        $null = $users.Add($userObj)
                    }
                }
                catch {
                    Write-MandALog "Error processing user at index $processedCount`: $_" -Level "WARN" -Context $Context
                    # Continue processing other users
                }
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve Graph users after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "Graph user query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $users.ToArray()
}

function ConvertTo-GraphUserObject {
    param($User, $SelectFields, $Context)
    
    try {
        $userProps = @{}
        foreach ($field in $SelectFields) {
            if ($User.PSObject.Properties[$field]) {
                $userProps[$field] = $User.PSObject.Properties[$field].Value
            } else {
                $userProps[$field] = $null
            }
        }
        
        if ($SelectFields -contains "assignedLicenses" -and $User.AssignedLicenses) {
            $userProps["assignedLicenses"] = ($User.AssignedLicenses | ForEach-Object { $_.SkuId }) -join ";"
        }
        
        return [PSCustomObject]$userProps
    }
    catch {
        Write-MandALog "Error converting Graph user object: $_" -Level "WARN" -Context $Context
        return $null
    }
}

function Get-GraphGroupsWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $groups = [System.Collections.ArrayList]::new()
    $groupMembers = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-MandALog "Retrieving Microsoft Graph groups..." -Level "INFO" -Context $Context
            
            $selectFields = $Configuration.graphAPI.selectFields.groups
            if (-not $selectFields -or $selectFields.Count -eq 0) {
                $selectFields = @("id", "displayName", "mailEnabled", "securityEnabled", "groupTypes", "description", "visibility", "createdDateTime")
                Write-MandALog "Using default select fields for Graph groups" -Level "DEBUG" -Context $Context
            }
            
            # Get groups with pagination
            $allGroups = Get-MgGroup -Select $selectFields -All -ConsistencyLevel eventual -ErrorAction Stop
            
            Write-MandALog "Retrieved $($allGroups.Count) Graph groups" -Level "SUCCESS" -Context $Context
            
            # Process groups with individual error handling
            $processedCount = 0
            $getGroupMembersFlag = $Configuration.discovery.graph.getGroupMembers -eq $true
            
            foreach ($group in $allGroups) {
                try {
                    $processedCount++
                    if ($processedCount % 25 -eq 0) {
                        Write-MandALog "Processed $processedCount/$($allGroups.Count) groups" -Level "PROGRESS" -Context $Context
                    }
                    
                    $groupObj = ConvertTo-GraphGroupObject -Group $group -SelectFields $selectFields -Context $Context
                    if ($groupObj) {
                        $null = $groups.Add($groupObj)
                    }
                    
                    # Get group members if configured
                    if ($getGroupMembersFlag) {
                        try {
                            $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction Stop
                            foreach ($member in $members) {
                                $null = $groupMembers.Add([PSCustomObject]@{
                                    GroupId = $group.Id
                                    GroupDisplayName = $group.DisplayName
                                    MemberId = $member.Id
                                    MemberType = $member.AdditionalProperties['@odata.type']
                                    MemberDisplayName = $member.AdditionalProperties['displayName']
                                })
                            }
                        }
                        catch {
                            Write-MandALog "Error getting members for group $($group.DisplayName): $_" -Level "WARN" -Context $Context
                        }
                    }
                }
                catch {
                    Write-MandALog "Error processing group at index $processedCount`: $_" -Level "WARN" -Context $Context
                    # Continue processing other groups
                }
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve Graph groups after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "Graph group query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return @{
        Groups = $groups.ToArray()
        Members = $groupMembers.ToArray()
    }
}

function ConvertTo-GraphGroupObject {
    param($Group, $SelectFields, $Context)
    
    try {
        $groupProps = @{}
        foreach ($field in $SelectFields) {
            if ($Group.PSObject.Properties[$field]) {
                $groupProps[$field] = $Group.PSObject.Properties[$field].Value
            } else {
                $groupProps[$field] = $null
            }
        }
        
        if ($SelectFields -contains "groupTypes" -and $Group.GroupTypes) {
            $groupProps["groupTypes"] = ($Group.GroupTypes -join ';')
        }
        
        return [PSCustomObject]$groupProps
    }
    catch {
        Write-MandALog "Error converting Graph group object: $_" -Level "WARN" -Context $Context
        return $null
    }
}

# --- Public Function (Exported) ---
function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new('Graph')
    
    # Set up error handling preferences
    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    
    try {
        # Create minimal context if not provided
        if (-not $Context) {
            $Context = @{
                ErrorCollector = [PSCustomObject]@{
                    AddError = { param($s,$m,$e) Write-Warning "Error in $s`: $m" }
                    AddWarning = { param($s,$m) Write-Warning "Warning in $s`: $m" }
                }
                Paths = @{
                    RawDataOutput = Join-Path $Configuration.environment.outputPath "Raw"
                }
            }
        }
        
        Write-MandALog "--- Starting Microsoft Graph Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
        
        # Validate prerequisites
        Test-GraphDiscoveryPrerequisites -Configuration $Configuration -Result $result -Context $Context
        
        if (-not $result.Success) {
            Write-MandALog "Prerequisites check failed, aborting Graph discovery" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Main discovery logic with nested error handling
        $graphData = @{
            Users = @()
            Groups = @()
            GroupMembers = @()
        }
        
        # Discover Users with specific error handling
        try {
            Write-MandALog "Discovering Microsoft Graph users..." -Level "INFO" -Context $Context
            $graphData.Users = Get-GraphUsersWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['UserCount'] = $graphData.Users.Count
            Write-MandALog "Successfully discovered $($graphData.Users.Count) Graph users" -Level "SUCCESS" -Context $Context
            
            # Export users data
            if ($graphData.Users.Count -gt 0) {
                Export-DataToCSV -Data $graphData.Users -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "GraphUsers.csv") -Context $Context
            }
        }
        catch {
            $result.AddError(
                "Failed to discover Microsoft Graph users",
                $_.Exception,
                @{
                    Operation = 'Get-MgUser'
                    GraphContext = if ($mgCtx = Get-MgContext) { $mgCtx.Account } else { $null }
                }
            )
            Write-MandALog "Error discovering Graph users: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            # Continue with other discoveries even if users fail
        }
        
        # Discover Groups with specific error handling
        try {
            Write-MandALog "Discovering Microsoft Graph groups..." -Level "INFO" -Context $Context
            $groupData = Get-GraphGroupsWithErrorHandling -Configuration $Configuration -Context $Context
            $graphData.Groups = $groupData.Groups
            $graphData.GroupMembers = $groupData.Members
            $result.Metadata['GroupCount'] = $graphData.Groups.Count
            $result.Metadata['GroupMemberCount'] = $graphData.GroupMembers.Count
            Write-MandALog "Successfully discovered $($graphData.Groups.Count) Graph groups with $($graphData.GroupMembers.Count) memberships" -Level "SUCCESS" -Context $Context
            
            # Export groups data
            if ($graphData.Groups.Count -gt 0) {
                Export-DataToCSV -Data $graphData.Groups -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "GraphGroups.csv") -Context $Context
            }
            if ($graphData.GroupMembers.Count -gt 0) {
                Export-DataToCSV -Data $graphData.GroupMembers -FilePath (Join-Path (Get-ModuleContext).Paths.RawDataOutput "GraphGroupMembers.csv") -Context $Context
            }
        }
        catch {
            $result.AddError(
                "Failed to discover Microsoft Graph groups",
                $_.Exception,
                @{
                    Operation = 'Get-MgGroup'
                    GraphContext = if ($mgCtx = Get-MgContext) { $mgCtx.Account } else { $null }
                }
            )
            Write-MandALog "Error discovering Graph groups: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Set the data even if partially successful
        $result.Data = $graphData
        
        # Determine overall success based on critical data
        if ($graphData.Users.Count -eq 0 -and $graphData.Groups.Count -eq 0) {
            $result.Success = $false
            $result.AddError("No Microsoft Graph data retrieved")
            Write-MandALog "Graph Discovery failed - no data retrieved" -Level "ERROR" -Context $Context
        } else {
            Write-MandALog "--- Microsoft Graph Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
        }
        
    }
    catch {
        # Catch-all for unexpected errors
        $result.AddError(
            "Unexpected error in Graph discovery",
            $_.Exception,
            @{
                ErrorPoint = 'Main Discovery Block'
                LastOperation = $MyInvocation.MyCommand.Name
            }
        )
        Write-MandALog "Unexpected error in Graph Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    finally {
        # Always execute cleanup
        $ErrorActionPreference = $originalErrorActionPreference
        $result.Complete()
        
        # Log summary
        Write-MandALog "Graph Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)" -Level "INFO" -Context $Context
        
        # Clean up connections if needed
        try {
            # Clear any cached Graph sessions if needed
            if (Get-Variable -Name 'GraphSession' -ErrorAction SilentlyContinue) {
                Remove-Variable -Name 'GraphSession' -Force
            }
        }
        catch {
            Write-MandALog "Cleanup warning: $_" -Level "WARN" -Context $Context
        }
    }
    
    return $result
}
Export-ModuleMember -Function Invoke-GraphDiscovery


