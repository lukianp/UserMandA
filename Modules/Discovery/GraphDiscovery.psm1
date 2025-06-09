# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Users, Microsoft.Graph.Groups

<#
.SYNOPSIS
    Microsoft Graph discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers users and groups from Microsoft Graph
.NOTES
    Author: M&A Discovery Team
    Version: 7.1.0
    Last Modified: 2025-06-09
#>

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



function Write-GraphLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        $Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[Graph] $Message" -Level $Level -Component "GraphDiscovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            default { "White" }
        }
        Write-Host "[Graph] $Message" -ForegroundColor $color
    }
}

function Test-GraphConnection {
    param($Context)
    
    try {
        $mgContext = Get-MgContext -ErrorAction Stop
        if (-not $mgContext) {
            return $false
        }
        
        # Test with simple query
        $null = Get-MgOrganization -ErrorAction Stop
        return $true
    } catch {
        Write-GraphLog -Message "Graph connection test failed: $_" -Level "ERROR" -Context $Context
        return $false
    }
}

function Get-GraphUsersData {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $users = @()
    
    try {
        Write-GraphLog -Message "Retrieving Graph users..." -Level "INFO" -Context $Context
        
        # Get select fields from configuration
        $selectFields = $Configuration.graphAPI.selectFields.users
        if (-not $selectFields -or $selectFields.Count -eq 0) {
            $selectFields = @("id", "userPrincipalName", "displayName", "mail", "department", 
                            "jobTitle", "accountEnabled", "createdDateTime", "assignedLicenses")
        }
        
        # Get users with pagination
        $pageSize = if ($Configuration.graphAPI.pageSize) { $Configuration.graphAPI.pageSize } else { 999 }
        $graphUsers = Get-MgUser -Select $selectFields -All -PageSize $pageSize -ConsistencyLevel eventual -ErrorAction Stop
        
        $processedCount = 0
        foreach ($user in $graphUsers) {
            $processedCount++
            if ($processedCount % 100 -eq 0) {
                Write-GraphLog -Message "Processed $processedCount users..." -Level "DEBUG" -Context $Context
            }
            
            $userObj = @{
                _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                _DiscoveryModule = 'Graph'
            }
            
            # Add selected fields
            foreach ($field in $selectFields) {
                if ($user.PSObject.Properties[$field]) {
                    $value = $user.PSObject.Properties[$field].Value
                    
                    # Handle special fields
                    if ($field -eq "assignedLicenses" -and $value) {
                        $userObj[$field] = ($value | ForEach-Object { $_.SkuId }) -join ";"
                    } else {
                        $userObj[$field] = $value
                    }
                } else {
                    $userObj[$field] = $null
                }
            }
            
            $users += [PSCustomObject]$userObj
        }
        
        Write-GraphLog -Message "Retrieved $($users.Count) users" -Level "SUCCESS" -Context $Context
    } catch {
        Write-GraphLog -Message "Failed to retrieve users: $_" -Level "ERROR" -Context $Context
        throw
    }
    
    return $users
}

function Get-GraphGroupsData {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $groups = @()
    $groupMembers = @()
    
    try {
        Write-GraphLog -Message "Retrieving Graph groups..." -Level "INFO" -Context $Context
        
        # Get select fields from configuration
        $selectFields = $Configuration.graphAPI.selectFields.groups
        if (-not $selectFields -or $selectFields.Count -eq 0) {
            $selectFields = @("id", "displayName", "mailEnabled", "securityEnabled", 
                            "groupTypes", "description", "visibility", "createdDateTime")
        }
        
        # Get groups with pagination
        $graphGroups = Get-MgGroup -Select $selectFields -All -ConsistencyLevel eventual -ErrorAction Stop
        
        $processedCount = 0
        $getMembers = $Configuration.discovery.graph.getGroupMembers -eq $true
        
        foreach ($group in $graphGroups) {
            $processedCount++
            if ($processedCount % 50 -eq 0) {
                Write-GraphLog -Message "Processed $processedCount groups..." -Level "DEBUG" -Context $Context
            }
            
            $groupObj = @{
                _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                _DiscoveryModule = 'Graph'
            }
            
            # Add selected fields
            foreach ($field in $selectFields) {
                if ($group.PSObject.Properties[$field]) {
                    $value = $group.PSObject.Properties[$field].Value
                    
                    # Handle special fields
                    if ($field -eq "groupTypes" -and $value) {
                        $groupObj[$field] = ($value -join ';')
                    } else {
                        $groupObj[$field] = $value
                    }
                } else {
                    $groupObj[$field] = $null
                }
            }
            
            $groups += [PSCustomObject]$groupObj
            
            # Get group members if configured
            if ($getMembers) {
                try {
                    $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction Stop
                    foreach ($member in $members) {
                        $groupMembers += [PSCustomObject]@{
                            GroupId = $group.Id
                            GroupDisplayName = $group.DisplayName
                            MemberId = $member.Id
                            MemberType = $member.AdditionalProperties['@odata.type']
                            MemberDisplayName = $member.AdditionalProperties['displayName']
                            _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                            _DiscoveryModule = 'Graph'
                        }
                    }
                } catch {
                    Write-GraphLog -Message "Failed to get members for group $($group.DisplayName): $_" -Level "WARN" -Context $Context
                }
            }
        }
        
        Write-GraphLog -Message "Retrieved $($groups.Count) groups and $($groupMembers.Count) memberships" -Level "SUCCESS" -Context $Context
    } catch {
        Write-GraphLog -Message "Failed to retrieve groups: $_" -Level "ERROR" -Context $Context
        throw
    }
    
    return @{
        Groups = $groups
        Members = $groupMembers
    }
}

function Export-GraphData {
    param(
        [string]$FilePath,
        [array]$Data,
        [string]$DataType,
        $Context
    )
    
    try {
        if ($Data.Count -gt 0) {
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
            Write-GraphLog -Message "Exported $($Data.Count) $DataType records to $([System.IO.Path]::GetFileName($FilePath))" -Level "SUCCESS" -Context $Context
        } else {
            Write-GraphLog -Message "No $DataType data to export" -Level "WARN" -Context $Context
        }
    } catch {
        Write-GraphLog -Message "Failed to export $DataType data: $_" -Level "ERROR" -Context $Context
        throw
    }
}

# Main discovery function - matches orchestrator expectations
function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    # Initialize result using the globally defined DiscoveryResult class
    $result = [DiscoveryResult]::new('Graph')
    
    try {
        Write-GraphLog -Message "Starting Microsoft Graph Discovery..." -Level "INFO" -Context $Context
        
        # Check prerequisites
        if (-not (Test-GraphConnection -Context $Context)) {
            $result.AddError("Microsoft Graph connection not available", $null, @{
                Component = "GraphConnection"
                Resolution = "Ensure Microsoft Graph is connected using Connect-MgGraph"
            })
            return $result
        }
        
        # Get output path
        $outputPath = Join-Path $Context.Paths.RawDataOutput ""
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }
        
        # Discover users
        try {
            $users = Get-GraphUsersData -Configuration $Configuration -Context $Context
            $result.Metadata['UserCount'] = $users.Count
            
            if ($users.Count -gt 0) {
                Export-GraphData -FilePath (Join-Path $outputPath "GraphUsers.csv") `
                    -Data $users -DataType "users" -Context $Context
            }
        } catch {
            $result.AddError("Failed to discover Graph users", $_.Exception, @{
                Operation = "GetUsers"
            })
        }
        
        # Discover groups
        try {
            $groupData = Get-GraphGroupsData -Configuration $Configuration -Context $Context
            $result.Metadata['GroupCount'] = $groupData.Groups.Count
            $result.Metadata['GroupMemberCount'] = $groupData.Members.Count
            
            if ($groupData.Groups.Count -gt 0) {
                Export-GraphData -FilePath (Join-Path $outputPath "GraphGroups.csv") `
                    -Data $groupData.Groups -DataType "groups" -Context $Context
            }
            
            if ($groupData.Members.Count -gt 0) {
                Export-GraphData -FilePath (Join-Path $outputPath "GraphGroupMembers.csv") `
                    -Data $groupData.Members -DataType "group members" -Context $Context
            }
        } catch {
            $result.AddError("Failed to discover Graph groups", $_.Exception, @{
                Operation = "GetGroups"
            })
        }
        
        # Set overall success based on critical data
        $result.Success = ($users.Count -gt 0 -or $groupData.Groups.Count -gt 0)
        
    } catch {
        $result.AddError("Unexpected error in Graph discovery", $_.Exception, @{
            Operation = "GraphDiscovery"
        })
    } finally {
        $result.Complete()
        Write-GraphLog -Message "Graph Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count)" -Level "INFO" -Context $Context
    }
    
    return $result
}

# Export the required function
Export-ModuleMember -Function Invoke-GraphDiscovery
