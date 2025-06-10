# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Graph
# Description: Discovers users and groups from Microsoft Graph.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add debugging to see what's in the configuration
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "GraphDiscovery"

    # Check all possible locations for auth info
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication) {
        if ($Configuration.authentication._Credentials) { 
            return $Configuration.authentication._Credentials 
        }
        if ($Configuration.authentication.ClientId -and 
            $Configuration.authentication.ClientSecret -and 
            $Configuration.authentication.TenantId) {
            return @{
                ClientId     = $Configuration.authentication.ClientId
                ClientSecret = $Configuration.authentication.ClientSecret
                TenantId     = $Configuration.authentication.TenantId
            }
        }
    }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    return $null
}

function Write-GraphLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Graph] $Message" -Level $Level -Component "GraphDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-GraphLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Graph')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'Graph'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); 
            Warnings     = [System.Collections.ArrayList]::new(); 
            Metadata     = @{};
            StartTime    = Get-Date; EndTime = $null; 
            ExecutionId  = [guid]::NewGuid().ToString();
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-GraphLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-GraphLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # Get Graph API configuration
        $pageSize = 999  # Graph API max
        $selectFields = @{
            users = @("id", "userPrincipalName", "displayName", "mail", "department", 
                     "jobTitle", "accountEnabled", "createdDateTime", "assignedLicenses")
            groups = @("id", "displayName", "mailEnabled", "securityEnabled", 
                      "groupTypes", "description", "visibility", "createdDateTime")
        }
        
        if ($Configuration.graphAPI) {
            if ($Configuration.graphAPI.pageSize) {
                $pageSize = $Configuration.graphAPI.pageSize
            }
            if ($Configuration.graphAPI.selectFields) {
                if ($Configuration.graphAPI.selectFields.users) {
                    $selectFields.users = $Configuration.graphAPI.selectFields.users
                }
                if ($Configuration.graphAPI.selectFields.groups) {
                    $selectFields.groups = $Configuration.graphAPI.selectFields.groups
                }
            }
        }

        # 4. AUTHENTICATE & CONNECT
        Write-GraphLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-GraphLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-GraphLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        try {
            Write-GraphLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            Connect-MgGraph -ClientId $authInfo.ClientId `
                            -TenantId $authInfo.TenantId `
                            -ClientSecretCredential $secureSecret `
                            -NoWelcome -ErrorAction Stop
            Write-GraphLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-GraphLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Users
        $users = [System.Collections.ArrayList]::new()
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering users via Graph API..." -Context $Context
            
            # Build select string
            $selectString = $selectFields.users -join ','
            
            # Get users with pagination
            $graphUsers = Get-MgUser -Select $selectFields.users -All -PageSize $pageSize -ConsistencyLevel eventual -ErrorAction Stop
            
            $processedCount = 0
            foreach ($user in $graphUsers) {
                $processedCount++
                if ($processedCount % 100 -eq 0) {
                    Write-GraphLog -Level "DEBUG" -Message "Processed $processedCount users..." -Context $Context
                    Write-Progress -Activity "Processing Graph Users" -Status "$processedCount users processed" -PercentComplete (($processedCount / 10000) * 100)
                }
                
                # Create user object with all fields
                $userObj = [PSCustomObject]@{
                    id = $user.Id
                    userPrincipalName = $user.UserPrincipalName
                    displayName = $user.DisplayName
                    mail = $user.Mail
                    department = $user.Department
                    jobTitle = $user.JobTitle
                    accountEnabled = $user.AccountEnabled
                    createdDateTime = $user.CreatedDateTime
                    assignedLicenses = if ($user.AssignedLicenses) { 
                        ($user.AssignedLicenses | ForEach-Object { $_.SkuId }) -join ";"
                    } else { 
                        $null 
                    }
                    _DataType = 'User'
                }
                
                # Add any additional fields from config
                foreach ($field in $selectFields.users) {
                    if ($field -notin @('id', 'userPrincipalName', 'displayName', 'mail', 'department', 
                                       'jobTitle', 'accountEnabled', 'createdDateTime', 'assignedLicenses')) {
                        if ($user.PSObject.Properties[$field]) {
                            $userObj | Add-Member -MemberType NoteProperty -Name $field -Value $user.$field -Force
                        }
                    }
                }
                
                $null = $users.Add($userObj)
                $null = $allDiscoveredData.Add($userObj)
            }
            
            Write-Progress -Activity "Processing Graph Users" -Completed
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $($users.Count) users" -Context $Context
            
        } catch {
            Write-GraphLog -Level "ERROR" -Message "Error discovering users: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover users: $($_.Exception.Message)", @{Section="Users"})
        }
        
        # Discover Groups
        $groups = [System.Collections.ArrayList]::new()
        $groupMembers = [System.Collections.ArrayList]::new()
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering groups via Graph API..." -Context $Context
            
            # Get groups with pagination
            $graphGroups = Get-MgGroup -Select $selectFields.groups -All -PageSize $pageSize -ConsistencyLevel eventual -ErrorAction Stop
            
            $processedCount = 0
            $getMembers = $Configuration.discovery.graph.getGroupMembers -eq $true
            
            foreach ($group in $graphGroups) {
                $processedCount++
                if ($processedCount % 50 -eq 0) {
                    Write-GraphLog -Level "DEBUG" -Message "Processed $processedCount groups..." -Context $Context
                    Write-Progress -Activity "Processing Graph Groups" -Status "$processedCount groups processed" -PercentComplete (($processedCount / 5000) * 100)
                }
                
                # Create group object
                $groupObj = [PSCustomObject]@{
                    id = $group.Id
                    displayName = $group.DisplayName
                    mailEnabled = $group.MailEnabled
                    securityEnabled = $group.SecurityEnabled
                    groupTypes = if ($group.GroupTypes) { $group.GroupTypes -join ';' } else { $null }
                    description = $group.Description
                    visibility = $group.Visibility
                    createdDateTime = $group.CreatedDateTime
                    _DataType = 'Group'
                }
                
                # Add any additional fields from config
                foreach ($field in $selectFields.groups) {
                    if ($field -notin @('id', 'displayName', 'mailEnabled', 'securityEnabled', 
                                       'groupTypes', 'description', 'visibility', 'createdDateTime')) {
                        if ($group.PSObject.Properties[$field]) {
                            $groupObj | Add-Member -MemberType NoteProperty -Name $field -Value $group.$field -Force
                        }
                    }
                }
                
                $null = $groups.Add($groupObj)
                $null = $allDiscoveredData.Add($groupObj)
                
                # Get group members if configured
                if ($getMembers) {
                    try {
                        $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction Stop
                        foreach ($member in $members) {
                            $memberObj = [PSCustomObject]@{
                                GroupId = $group.Id
                                GroupDisplayName = $group.DisplayName
                                MemberId = $member.Id
                                MemberType = if ($member.AdditionalProperties -and $member.AdditionalProperties['@odata.type']) {
                                    $member.AdditionalProperties['@odata.type']
                                } else {
                                    "Unknown"
                                }
                                _DataType = 'GroupMember'
                            }
                            
                            $null = $groupMembers.Add($memberObj)
                            $null = $allDiscoveredData.Add($memberObj)
                        }
                    } catch {
                        Write-GraphLog -Level "WARN" -Message "Failed to get members for group $($group.DisplayName): $($_.Exception.Message)" -Context $Context
                    }
                }
            }
            
            Write-Progress -Activity "Processing Graph Groups" -Completed
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $($groups.Count) groups and $($groupMembers.Count) memberships" -Context $Context
            
        } catch {
            Write-GraphLog -Level "ERROR" -Message "Error discovering groups: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover groups: $($_.Exception.Message)", @{Section="Groups"})
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-GraphLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Export Users
            $userData = $allDiscoveredData | Where-Object { $_._DataType -eq 'User' }
            if ($userData.Count -gt 0) {
                $userData | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Graph" -Force
                }
                
                $usersFile = Join-Path $outputPath "GraphUsers.csv"
                $userData | Export-Csv -Path $usersFile -NoTypeInformation -Encoding UTF8
                Write-GraphLog -Level "SUCCESS" -Message "Exported $($userData.Count) users to GraphUsers.csv" -Context $Context
            }
            
            # Export Groups
            $groupData = $allDiscoveredData | Where-Object { $_._DataType -eq 'Group' }
            if ($groupData.Count -gt 0) {
                $groupData | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Graph" -Force
                }
                
                $groupsFile = Join-Path $outputPath "GraphGroups.csv"
                $groupData | Export-Csv -Path $groupsFile -NoTypeInformation -Encoding UTF8
                Write-GraphLog -Level "SUCCESS" -Message "Exported $($groupData.Count) groups to GraphGroups.csv" -Context $Context
            }
            
            # Export Group Members (if any)
            $memberData = $allDiscoveredData | Where-Object { $_._DataType -eq 'GroupMember' }
            if ($memberData.Count -gt 0) {
                $memberData | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Graph" -Force
                }
                
                $membersFile = Join-Path $outputPath "GraphGroupMembers.csv"
                $memberData | Export-Csv -Path $membersFile -NoTypeInformation -Encoding UTF8
                Write-GraphLog -Level "SUCCESS" -Message "Exported $($memberData.Count) group members to GraphGroupMembers.csv" -Context $Context
            }
        } else {
            Write-GraphLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["UserCount"] = $users.Count
        $result.Metadata["GroupCount"] = $groups.Count
        $result.Metadata["GroupMemberCount"] = $groupMembers.Count

    } catch {
        # Top-level error handler
        Write-GraphLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-GraphLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from services
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Safe record count display
        $recordCount = 0
        if ($result -is [hashtable]) {
            $recordCount = if ($result.RecordCount) { $result.RecordCount } else { 0 }
        } else {
            $recordCount = if ($result.RecordCount) { $result.RecordCount } else { 0 }
        }
        
        Write-GraphLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $recordCount." -Context $Context
    }

    return $result
}

# --- Helper Functions ---
function Ensure-Path {
    param($Path)
    if (-not (Test-Path -Path $Path -PathType Container)) {
        try {
            New-Item -Path $Path -ItemType Directory -Force -ErrorAction Stop | Out-Null
        } catch {
            throw "Failed to create output directory: $Path. Error: $($_.Exception.Message)"
        }
    }
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-GraphDiscovery