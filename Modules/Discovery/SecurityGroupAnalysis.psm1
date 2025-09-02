# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Security group analysis module for M&A Discovery Suite
.DESCRIPTION
    Analyzes Active Directory security groups, nested memberships, permissions,
    and access patterns to identify security risks and compliance issues during
    M&A infrastructure assessment.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Active Directory module, appropriate AD permissions
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue
# Ensure DiscoveryResult class is available
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-SecurityGroupLog {
    <#
    .SYNOPSIS
        Writes log entries specific to security group analysis.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[SecurityGroup] $Message" -Level $Level -Component "SecurityGroupAnalysis" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [SecurityGroup] $Message" -ForegroundColor $color
    }
}

function Invoke-SecurityGroupAnalysis {
    <#
    .SYNOPSIS
        Main security group analysis function.
    
    .DESCRIPTION
        Analyzes Active Directory security groups, their memberships, nested groups,
        privileged groups, and potential security risks for M&A assessment.
    
    .PARAMETER Configuration
        Discovery configuration hashtable.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-SecurityGroupLog -Level "HEADER" -Message "Starting Security Group Analysis (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object using standardized DiscoveryResult class (with safe fallback)
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            # Attempt to import again with Stop to surface errors if truly missing
            Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ErrorHandling.psm1") -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('SecurityGroupAnalysis')
    } catch {
        # Fallback to simple hashtable to avoid hard failure; no script methods
        $result = @{
            Success = $true
            ModuleName = 'SecurityGroupAnalysis'
            Errors = [System.Collections.ArrayList]::new()
            Warnings = [System.Collections.ArrayList]::new()
            Metadata = @{}
            StartTime = Get-Date
            EndTime = $null
            ExecutionId = [guid]::NewGuid().ToString()
        }
    }

    # Local helpers to add errors/warnings regardless of result type
    $addResError = {
        param([string]$Message, [Exception]$Exception, [hashtable]$Context)
        if ($result -is [hashtable]) {
            [void]$result.Errors.Add(@{ Timestamp = Get-Date; Message = $Message; Exception = $Exception; Context = $Context })
            $result.Success = $false
        } else {
            $result.AddError($Message, $Exception, $Context)
        }
    }.GetNewClosure()
    $addResWarning = {
        param([string]$Message, [hashtable]$Context)
        if ($result -is [hashtable]) {
            [void]$result.Warnings.Add(@{ Timestamp = Get-Date; Message = $Message; Context = $Context })
        } else {
            $result.AddWarning($Message, $Context)
        }
    }.GetNewClosure()

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Analyze Security Groups
        try {
            Write-SecurityGroupLog -Level "INFO" -Message "Analyzing security groups..." -Context $Context
            $groupData = Get-SecurityGroupAnalysis -Configuration $Configuration -SessionId $SessionId
            $groupCount = if ($null -ne $groupData) { $groupData.Count } else { 0 }
            if ($groupCount -gt 0) {
                $groupData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'SecurityGroup' -Force }
                $null = $allDiscoveredData.AddRange($groupData)
                $result.Metadata["SecurityGroupCount"] = $groupCount
            }
            Write-SecurityGroupLog -Level "SUCCESS" -Message "Analyzed $groupCount security groups" -Context $Context
        } catch {
            & $addResWarning "Failed to analyze security groups: $($_.Exception.Message)" @{Section="SecurityGroups"}
        }
        
        # Analyze Group Memberships
        try {
            Write-SecurityGroupLog -Level "INFO" -Message "Analyzing group memberships..." -Context $Context
            $membershipData = Get-GroupMembershipAnalysis -Configuration $Configuration -SessionId $SessionId
            $membershipCount = if ($null -ne $membershipData) { $membershipData.Count } else { 0 }
            if ($membershipCount -gt 0) {
                $membershipData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'GroupMembership' -Force }
                $null = $allDiscoveredData.AddRange($membershipData)
                $result.Metadata["GroupMembershipCount"] = $membershipCount
            }
            Write-SecurityGroupLog -Level "SUCCESS" -Message "Analyzed $membershipCount group memberships" -Context $Context
        } catch {
            & $addResWarning "Failed to analyze group memberships: $($_.Exception.Message)" @{Section="GroupMemberships"}
        }
        
        # Analyze Privileged Groups
        try {
            Write-SecurityGroupLog -Level "INFO" -Message "Analyzing privileged groups..." -Context $Context
            $privilegedData = Get-PrivilegedGroupAnalysis -Configuration $Configuration -SessionId $SessionId
            $privilegedCount = if ($null -ne $privilegedData) { $privilegedData.Count } else { 0 }
            if ($privilegedCount -gt 0) {
                $privilegedData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PrivilegedGroup' -Force }
                $null = $allDiscoveredData.AddRange($privilegedData)
                $result.Metadata["PrivilegedGroupCount"] = $privilegedCount
            }
            Write-SecurityGroupLog -Level "SUCCESS" -Message "Analyzed $privilegedCount privileged groups" -Context $Context
        } catch {
            & $addResWarning "Failed to analyze privileged groups: $($_.Exception.Message)" @{Section="PrivilegedGroups"}
        }
        
        # Analyze Nested Groups
        try {
            Write-SecurityGroupLog -Level "INFO" -Message "Analyzing nested groups..." -Context $Context
            $nestedData = Get-NestedGroupAnalysis -Configuration $Configuration -SessionId $SessionId
            $nestedCount = if ($null -ne $nestedData) { $nestedData.Count } else { 0 }
            if ($nestedCount -gt 0) {
                $nestedData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'NestedGroup' -Force }
                $null = $allDiscoveredData.AddRange($nestedData)
                $result.Metadata["NestedGroupCount"] = $nestedCount
            }
            Write-SecurityGroupLog -Level "SUCCESS" -Message "Analyzed $nestedCount nested group relationships" -Context $Context
        } catch {
            & $addResWarning "Failed to analyze nested groups: $($_.Exception.Message)" @{Section="NestedGroups"}
        }
        
        # Generate Security Analysis Summary
        try {
            Write-SecurityGroupLog -Level "INFO" -Message "Generating security analysis summary..." -Context $Context
            $summary = Get-SecurityAnalysisSummary -SecurityData ($allDiscoveredData | Where-Object { $_._DataType -eq 'SecurityGroup' }) -SessionId $SessionId
            $summaryCount = if ($null -ne $summary) { $summary.Count } else { 0 }
            if ($summaryCount -gt 0) {
                $summary | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'SecuritySummary' -Force }
                $null = $allDiscoveredData.AddRange($summary)
                $result.Metadata["SecuritySummaryCount"] = $summaryCount
            }
            Write-SecurityGroupLog -Level "SUCCESS" -Message "Generated security analysis summary" -Context $Context
        } catch {
            & $addResWarning "Failed to generate security summary: $($_.Exception.Message)" @{Section="SecuritySummary"}
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-SecurityGroupLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType

            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "SecurityGroup_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName

                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "SecurityGroupAnalysis" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }

                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-SecurityGroupLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-SecurityGroupLog -Level "WARN" -Message "No security group data discovered to export" -Context $Context
        }

        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-SecurityGroupLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        & $addResError "A critical error occurred during security group analysis: $($_.Exception.Message)" $_.Exception $null
    } finally {
        $stopwatch.Stop()
        if ($result -is [hashtable]) { $result['EndTime'] = Get-Date } else { $result.EndTime = Get-Date }
        Write-SecurityGroupLog -Level "HEADER" -Message "Security group analysis finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($allDiscoveredData.Count)." -Context $Context
    }

    return $result
}

function Get-SecurityGroupAnalysis {
    <#
    .SYNOPSIS
        Analyzes Active Directory security groups.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $groupData = @()
    
    try {
        # Check if Active Directory module is available
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            Write-SecurityGroupLog -Level "WARN" -Message "Active Directory module not available"
            $groupData += [PSCustomObject]@{
                AnalysisType = "ModuleAvailability"
                Message = "Active Directory PowerShell module not available"
                Recommendation = "Install RSAT or run from domain controller for full AD analysis"
                SessionId = $SessionId
            }
            return $groupData
        }
        
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Get all security groups
        $securityGroups = Get-ADGroup -Filter "GroupCategory -eq 'Security'" -Properties * -ErrorAction Stop
        
        foreach ($group in $securityGroups) {
            try {
                # Get direct members
                $directMembers = Get-ADGroupMember -Identity $group.DistinguishedName -ErrorAction SilentlyContinue
                $memberCount = if ($directMembers) { $directMembers.Count } else { 0 }
                $userMembers = if ($directMembers) { ($directMembers | Where-Object { $_.objectClass -eq 'user' }).Count } else { 0 }
                $groupMembers = if ($directMembers) { ($directMembers | Where-Object { $_.objectClass -eq 'group' }).Count } else { 0 }
                $computerMembers = if ($directMembers) { ($directMembers | Where-Object { $_.objectClass -eq 'computer' }).Count } else { 0 }
                
                # Calculate risk score
                $riskScore = 0
                $riskFactors = @()
                
                # High privilege group names
                $privilegedNames = @('admin', 'administrator', 'domain admin', 'enterprise admin', 'schema admin', 'backup operator', 'account operator', 'server operator', 'print operator')
                if ($privilegedNames | Where-Object { $group.Name -like "*$_*" }) {
                    $riskScore += 10
                    $riskFactors += "Privileged group name pattern"
                }
                
                # Large group membership
                if ($memberCount -gt 100) {
                    $riskScore += 5
                    $riskFactors += "Large membership ($memberCount members)"
                }
                
                # Nested groups
                if ($groupMembers -gt 0) {
                    $riskScore += 3
                    $riskFactors += "Contains nested groups ($groupMembers groups)"
                }
                
                # Old groups with no recent changes
                $daysSinceModified = (Get-Date) - $group.WhenChanged
                if ($daysSinceModified.Days -gt 365) {
                    $riskScore += 2
                    $riskFactors += "Not modified in over a year"
                }
                
                # Empty groups
                if ($memberCount -eq 0) {
                    $riskScore += 1
                    $riskFactors += "Empty group"
                }
                
                $groupData += [PSCustomObject]@{
                    AnalysisType = "SecurityGroup"
                    GroupName = $group.Name
                    DistinguishedName = $group.DistinguishedName
                    GroupScope = $group.GroupScope
                    GroupCategory = $group.GroupCategory
                    Description = $group.Description
                    WhenCreated = $group.WhenCreated
                    WhenChanged = $group.WhenChanged
                    DirectMemberCount = $memberCount
                    UserMemberCount = $userMembers
                    GroupMemberCount = $groupMembers
                    ComputerMemberCount = $computerMembers
                    ManagedBy = $group.ManagedBy
                    Mail = $group.Mail
                    RiskScore = $riskScore
                    RiskLevel = if ($riskScore -ge 15) { "High" } elseif ($riskScore -ge 8) { "Medium" } elseif ($riskScore -gt 0) { "Low" } else { "Minimal" }
                    RiskFactors = ($riskFactors -join '; ')
                    DaysSinceModified = $daysSinceModified.Days
                    ObjectSID = $group.SID.Value
                    ObjectGUID = $group.ObjectGUID
                    SessionId = $SessionId
                }
            } catch {
                Write-SecurityGroupLog -Level "DEBUG" -Message "Failed to analyze group $($group.Name): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-SecurityGroupLog -Level "ERROR" -Message "Failed to analyze security groups: $($_.Exception.Message)"
        $groupData += [PSCustomObject]@{
            AnalysisType = "Error"
            Message = "Failed to connect to Active Directory or insufficient permissions"
            Error = $_.Exception.Message
            Recommendation = "Ensure AD module is available and account has read permissions to Active Directory"
            SessionId = $SessionId
        }
    }
    
    return $groupData
}

function Get-GroupMembershipAnalysis {
    <#
    .SYNOPSIS
        Analyzes group membership patterns and relationships.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $membershipData = @()
    
    try {
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            return $membershipData
        }
        
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Get all users and analyze their group memberships
        $users = Get-ADUser -Filter * -Properties MemberOf -ErrorAction Stop
        
        foreach ($user in $users) {
            $groupCount = $user.MemberOf.Count
            
            # Analyze membership patterns
            $riskScore = 0
            $riskFactors = @()
            
            # Too many groups
            if ($groupCount -gt 20) {
                $riskScore += 5
                $riskFactors += "Member of $groupCount groups (excessive)"
            } elseif ($groupCount -gt 10) {
                $riskScore += 2
                $riskFactors += "Member of $groupCount groups (high)"
            }
            
            # Check for privileged group memberships
            $privilegedGroups = @()
            foreach ($groupDN in $user.MemberOf) {
                $groupName = ($groupDN -split ',')[0] -replace 'CN=', ''
                $privilegedNames = @('admin', 'administrator', 'domain admin', 'enterprise admin', 'schema admin', 'backup operator')
                
                if ($privilegedNames | Where-Object { $groupName -like "*$_*" }) {
                    $privilegedGroups += $groupName
                    $riskScore += 8
                }
            }
            
            if ($privilegedGroups.Count -gt 0) {
                $riskFactors += "Member of privileged groups: $($privilegedGroups -join ', ')"
            }
            
            # Service accounts with high privileges
            if (($user.Name -like "*service*" -or $user.Name -like "*svc*") -and $privilegedGroups.Count -gt 0) {
                $riskScore += 5
                $riskFactors += "Service account with privileged access"
            }
            
            $membershipData += [PSCustomObject]@{
                AnalysisType = "UserMembership"
                UserName = $user.Name
                SamAccountName = $user.SamAccountName
                DistinguishedName = $user.DistinguishedName
                Enabled = $user.Enabled
                TotalGroupCount = $groupCount
                PrivilegedGroupCount = $privilegedGroups.Count
                PrivilegedGroups = ($privilegedGroups -join '; ')
                RiskScore = $riskScore
                RiskLevel = if ($riskScore -ge 15) { "Critical" } elseif ($riskScore -ge 8) { "High" } elseif ($riskScore -ge 3) { "Medium" } else { "Low" }
                RiskFactors = ($riskFactors -join '; ')
                LastLogonDate = $user.LastLogonDate
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-SecurityGroupLog -Level "ERROR" -Message "Failed to analyze group memberships: $($_.Exception.Message)"
    }
    
    return $membershipData
}

function Get-PrivilegedGroupAnalysis {
    <#
    .SYNOPSIS
        Analyzes privileged groups and their memberships.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $privilegedData = @()
    
    try {
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            return $privilegedData
        }
        
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Define privileged groups
        $privilegedGroupNames = @(
            'Domain Admins',
            'Enterprise Admins',
            'Schema Admins',
            'Administrators',
            'Backup Operators',
            'Account Operators',
            'Server Operators',
            'Print Operators',
            'Cert Publishers',
            'DnsAdmins',
            'Group Policy Creator Owners'
        )
        
        foreach ($groupName in $privilegedGroupNames) {
            try {
                $group = Get-ADGroup -Filter "Name -eq '$groupName'" -Properties * -ErrorAction SilentlyContinue
                if ($group) {
                    $members = Get-ADGroupMember -Identity $group.DistinguishedName -Recursive -ErrorAction SilentlyContinue
                    $directMembers = Get-ADGroupMember -Identity $group.DistinguishedName -ErrorAction SilentlyContinue
                    
                    $userMembers = if ($members) { $members | Where-Object { $_.objectClass -eq 'user' } } else { @() }
                    $groupMembers = if ($members) { $members | Where-Object { $_.objectClass -eq 'group' } } else { @() }
                    
                    # Risk assessment for privileged groups
                    $riskScore = 10  # Base risk for privileged group
                    $riskFactors = @("Privileged group")
                    
                    # Too many members
                    if ($members.Count -gt 10) {
                        $riskScore += 5
                        $riskFactors += "Large membership ($($members.Count) total members)"
                    }
                    
                    # Nested groups
                    if ($groupMembers.Count -gt 0) {
                        $riskScore += 3
                        $riskFactors += "Contains nested groups ($($groupMembers.Count) groups)"
                    }
                    
                    # Service accounts in privileged groups
                    $serviceAccounts = if ($userMembers -and $userMembers.Count -gt 0) {
                        $userMembers | Where-Object { $_.Name -like "*service*" -or $_.Name -like "*svc*" }
                    } else { @() }
                    if ($serviceAccounts.Count -gt 0) {
                        $riskScore += 5
                        $riskFactors += "Contains service accounts ($($serviceAccounts.Count) accounts)"
                    }
                    
                    $privilegedData += [PSCustomObject]@{
                        AnalysisType = "PrivilegedGroup"
                        GroupName = $group.Name
                        DistinguishedName = $group.DistinguishedName
                        Description = $group.Description
                        DirectMemberCount = $directMembers.Count
                        TotalMemberCount = $members.Count
                        UserMemberCount = $userMembers.Count
                        GroupMemberCount = $groupMembers.Count
                        ServiceAccountCount = $serviceAccounts.Count
                        RiskScore = $riskScore
                        RiskLevel = if ($riskScore -ge 20) { "Critical" } elseif ($riskScore -ge 15) { "High" } else { "Medium" }
                        RiskFactors = ($riskFactors -join '; ')
                        WhenCreated = $group.WhenCreated
                        WhenChanged = $group.WhenChanged
                        ManagedBy = $group.ManagedBy
                        SessionId = $SessionId
                    }
                    
                    # Detail each member of privileged groups
                    foreach ($member in $userMembers) {
                        $privilegedData += [PSCustomObject]@{
                            AnalysisType = "PrivilegedGroupMember"
                            GroupName = $group.Name
                            MemberName = $member.Name
                            MemberSamAccountName = $member.SamAccountName
                            MemberType = $member.objectClass
                            MemberDistinguishedName = $member.DistinguishedName
                            IsServiceAccount = ($member.Name -like "*service*" -or $member.Name -like "*svc*")
                            SessionId = $SessionId
                        }
                    }
                }
            } catch {
                Write-SecurityGroupLog -Level "DEBUG" -Message ("Failed to analyze privileged group " + $groupName + ": $($_.Exception.Message)")
            }
        }
        
    } catch {
        Write-SecurityGroupLog -Level "ERROR" -Message "Failed to analyze privileged groups: $($_.Exception.Message)"
    }
    
    return $privilegedData
}

function Get-NestedGroupAnalysis {
    <#
    .SYNOPSIS
        Analyzes nested group relationships and potential circular references.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $nestedData = @()
    
    try {
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            return $nestedData
        }
        
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Get all groups with nested memberships
        $allGroups = Get-ADGroup -Filter * -Properties MemberOf -ErrorAction Stop
        
        foreach ($group in $allGroups) {
            if ($group.MemberOf.Count -gt 0) {
                foreach ($parentGroupDN in $group.MemberOf) {
                    try {
                        $parentGroup = Get-ADGroup -Identity $parentGroupDN -ErrorAction SilentlyContinue
                        if ($parentGroup) {
                            # Check nesting depth
                            $nestingDepth = Get-GroupNestingDepth -GroupDN $group.DistinguishedName -VisitedGroups @()
                            
                            $riskScore = 0
                            $riskFactors = @()
                            
                            # Deep nesting
                            if ($nestingDepth -gt 5) {
                                $riskScore += 5
                                $riskFactors += "Deep nesting (depth: $nestingDepth)"
                            } elseif ($nestingDepth -gt 3) {
                                $riskScore += 2
                                $riskFactors += "Moderate nesting (depth: $nestingDepth)"
                            }
                            
                            # Cross-domain nesting
                            $childDomain = ($group.DistinguishedName -split ',DC=' | Select-Object -Skip 1) -join '.'
                            $parentDomain = ($parentGroup.DistinguishedName -split ',DC=' | Select-Object -Skip 1) -join '.'
                            if ($childDomain -ne $parentDomain) {
                                $riskScore += 3
                                $riskFactors += "Cross-domain nesting"
                            }
                            
                            $nestedData += [PSCustomObject]@{
                                AnalysisType = "NestedGroup"
                                ChildGroupName = $group.Name
                                ChildGroupDN = $group.DistinguishedName
                                ParentGroupName = $parentGroup.Name
                                ParentGroupDN = $parentGroup.DistinguishedName
                                NestingDepth = $nestingDepth
                                ChildDomain = $childDomain
                                ParentDomain = $parentDomain
                                CrossDomain = ($childDomain -ne $parentDomain)
                                RiskScore = $riskScore
                                RiskLevel = if ($riskScore -ge 8) { "High" } elseif ($riskScore -ge 5) { "Medium" } elseif ($riskScore -gt 0) { "Low" } else { "Minimal" }
                                RiskFactors = ($riskFactors -join '; ')
                                SessionId = $SessionId
                            }
                        }
                    } catch {
                        Write-SecurityGroupLog -Level "DEBUG" -Message "Failed to analyze nested relationship for $($group.Name): $($_.Exception.Message)"
                    }
                }
            }
        }
        
    } catch {
        Write-SecurityGroupLog -Level "ERROR" -Message "Failed to analyze nested groups: $($_.Exception.Message)"
    }
    
    return $nestedData
}

function Get-GroupNestingDepth {
    <#
    .SYNOPSIS
        Calculates the nesting depth of a group to detect deep hierarchies.
    #>
    [CmdletBinding()]
    param(
        [string]$GroupDN,
        [string[]]$VisitedGroups
    )
    
    try {
        # Prevent infinite recursion
        if ($GroupDN -in $VisitedGroups) {
            return 999  # Circular reference detected
        }

        # Create a copy of the visited groups array to avoid modifying the original
        $localVisitedGroups = $VisitedGroups + $GroupDN
        $group = Get-ADGroup -Identity $GroupDN -Properties MemberOf -ErrorAction SilentlyContinue
        
        if (-not $group -or $group.MemberOf.Count -eq 0) {
            return 1
        }
        
        $maxDepth = 0
        foreach ($parentGroupDN in $group.MemberOf) {
            $depth = Get-GroupNestingDepth -GroupDN $parentGroupDN -VisitedGroups $localVisitedGroups
            if ($depth -gt $maxDepth) {
                $maxDepth = $depth
            }
        }
        
        return $maxDepth + 1
    } catch {
        return 1
    }
}

function Get-SecurityAnalysisSummary {
    <#
    .SYNOPSIS
        Generates a summary of security group analysis results.
    #>
    [CmdletBinding()]
    param(
        [array]$SecurityData,
        [string]$SessionId
    )
    
    $summary = @()
    
    try {
        # Overall security summary
        $totalGroups = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' }).Count
        $highRiskGroups = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' -and $_.RiskLevel -eq 'High' }).Count
        $mediumRiskGroups = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' -and $_.RiskLevel -eq 'Medium' }).Count
        $emptyGroups = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' -and $_.DirectMemberCount -eq 0 }).Count
        $largeGroups = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' -and $_.DirectMemberCount -gt 100 }).Count
        
        $summary += [PSCustomObject]@{
            SummaryType = "SecurityOverview"
            TotalSecurityGroups = $totalGroups
            HighRiskGroups = $highRiskGroups
            MediumRiskGroups = $mediumRiskGroups
            LowRiskGroups = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' -and $_.RiskLevel -eq 'Low' }).Count
            MinimalRiskGroups = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' -and $_.RiskLevel -eq 'Minimal' }).Count
            EmptyGroups = $emptyGroups
            LargeGroups = $largeGroups
            GroupsWithNestedMembers = ($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' -and $_.GroupMemberCount -gt 0 }).Count
            AverageGroupSize = if ($totalGroups -gt 0) { [math]::Round(($SecurityData | Where-Object { $_.AnalysisType -eq 'SecurityGroup' } | Measure-Object -Property DirectMemberCount -Average).Average, 2) } else { 0 }
            RecommendedActions = @(
                if ($highRiskGroups -gt 0) { "Review $highRiskGroups high-risk groups" }
                if ($emptyGroups -gt 0) { "Consider removing $emptyGroups empty groups" }
                if ($largeGroups -gt 0) { "Review membership of $largeGroups large groups" }
            ) -join '; '
            ScanDate = Get-Date
            SessionId = $SessionId
        }
        
        # Risk level distribution
        $riskLevels = @('Critical', 'High', 'Medium', 'Low', 'Minimal')
        foreach ($riskLevel in $riskLevels) {
            $count = ($SecurityData | Where-Object { $_.RiskLevel -eq $riskLevel }).Count
            if ($count -gt 0) {
                $summary += [PSCustomObject]@{
                    SummaryType = "RiskDistribution"
                    RiskLevel = $riskLevel
                    Count = $count
                    Percentage = [math]::Round(($count / $totalGroups) * 100, 2)
                    ScanDate = Get-Date
                    SessionId = $SessionId
                }
            }
        }
        
    } catch {
        Write-SecurityGroupLog -Level "ERROR" -Message "Failed to generate security analysis summary: $($_.Exception.Message)"
    }
    
    return $summary
}

# Export functions
Export-ModuleMember -Function Invoke-SecurityGroupAnalysis

