# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Enhanced Microsoft Graph Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive Microsoft Graph discovery module providing advanced capabilities for discovering and analyzing 
    Microsoft 365 environments. This module leverages the Microsoft Graph API to discover users, groups, applications, 
    devices, and organizational settings with advanced filtering, batching, and throttling capabilities for 
    large-scale enterprise environments.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)
        
        $allData = [System.Collections.ArrayList]::new()
        
        try {
            # Discover Users with enhanced fields
            Write-ModuleLog -ModuleName "Graph" -Message "Starting user discovery..." -Level "INFO"
            
            $userFields = @(
                'id', 'userPrincipalName', 'displayName', 'mail', 'mailNickname',
                'givenName', 'surname', 'jobTitle', 'department', 'companyName',
                'officeLocation', 'mobilePhone', 'businessPhones', 'employeeId',
                'employeeType', 'createdDateTime', 'accountEnabled', 'userType',
                'usageLocation', 'assignedLicenses', 'assignedPlans',
                'onPremisesSyncEnabled', 'onPremisesImmutableId',
                'onPremisesSamAccountName', 'onPremisesUserPrincipalName',
                'lastPasswordChangeDateTime', 'passwordPolicies',
                'signInActivity', 'manager'
            )
            
            $uri = "https://graph.microsoft.com/beta/users?`$select=$($userFields -join ',')&`$top=999"
            $uri += "&`$expand=manager(`$select=id,displayName,userPrincipalName)"
            
            $users = Invoke-GraphAPIWithPaging -Uri $uri -ModuleName "Graph"
            
            # Process users
            foreach ($user in $users) {
                $userObj = [PSCustomObject]@{
                    # Core Identity
                    id = $user.id
                    userPrincipalName = $user.userPrincipalName
                    displayName = $user.displayName
                    mail = $user.mail
                    mailNickname = $user.mailNickname
                    
                    # Personal Info
                    givenName = $user.givenName
                    surname = $user.surname
                    jobTitle = $user.jobTitle
                    department = $user.department
                    companyName = $user.companyName
                    employeeId = $user.employeeId
                    employeeType = $user.employeeType
                    
                    # Contact Info
                    officeLocation = $user.officeLocation
                    mobilePhone = $user.mobilePhone
                    businessPhones = ($user.businessPhones -join ';')
                    
                    # Account Status
                    accountEnabled = $user.accountEnabled
                    userType = $user.userType
                    usageLocation = $user.usageLocation
                    createdDateTime = $user.createdDateTime
                    
                    # Licensing
                    assignedLicenses = ($user.assignedLicenses | ForEach-Object { $_.skuId }) -join ';'
                    licenseCount = @($user.assignedLicenses).Count
                    
                    # Sync Status
                    onPremisesSyncEnabled = $user.onPremisesSyncEnabled
                    onPremisesImmutableId = $user.onPremisesImmutableId
                    onPremisesSamAccountName = $user.onPremisesSamAccountName
                    onPremisesUserPrincipalName = $user.onPremisesUserPrincipalName
                    
                    # Security
                    lastPasswordChangeDateTime = $user.lastPasswordChangeDateTime
                    passwordPolicies = $user.passwordPolicies
                    lastSignInDateTime = if ($user.signInActivity) { $user.signInActivity.lastSignInDateTime } else { $null }
                    
                    # Manager
                    managerUPN = if ($user.manager) { $user.manager.userPrincipalName } else { $null }
                    managerId = if ($user.manager) { $user.manager.id } else { $null }
                    managerDisplayName = if ($user.manager) { $user.manager.displayName } else { $null }
                    
                    _DataType = 'User'
                }
                
                $null = $allData.Add($userObj)
            }
            
            Write-ModuleLog -ModuleName "Graph" -Message "Discovered $($users.Count) users" -Level "SUCCESS"
            
            # Export users
            Export-DiscoveryResults -Data ($allData | Where-Object { $_._DataType -eq 'User' }) `
                -FileName "GraphUsers.csv" `
                -OutputPath $Context.Paths.RawDataOutput `
                -ModuleName "Graph" `
                -SessionId $SessionId
            
            # Discover Groups
            Write-ModuleLog -ModuleName "Graph" -Message "Starting group discovery..." -Level "INFO"
            
            $groupFields = @(
                'id', 'displayName', 'mailEnabled', 'mailNickname', 'mail',
                'securityEnabled', 'groupTypes', 'description', 'visibility',
                'createdDateTime', 'membershipRule', 'membershipRuleProcessingState',
                'onPremisesSyncEnabled', 'proxyAddresses', 'classification',
                'isAssignableToRole', 'resourceProvisioningOptions'
            )
            
            $uri = "https://graph.microsoft.com/v1.0/groups?`$select=$($groupFields -join ',')&`$top=999"
            $groups = Invoke-GraphAPIWithPaging -Uri $uri -ModuleName "Graph"
            
            foreach ($group in $groups) {
                $groupType = 'SecurityGroup'
                if ($group.groupTypes -contains 'Unified') { $groupType = 'Microsoft365Group' }
                if ($group.mailEnabled -and -not $group.securityEnabled) { $groupType = 'DistributionList' }
                
                $groupObj = [PSCustomObject]@{
                    id = $group.id
                    displayName = $group.displayName
                    mail = $group.mail
                    mailNickname = $group.mailNickname
                    mailEnabled = $group.mailEnabled
                    securityEnabled = $group.securityEnabled
                    groupType = $groupType
                    groupTypes = ($group.groupTypes -join ';')
                    description = $group.description
                    visibility = $group.visibility
                    classification = $group.classification
                    createdDateTime = $group.createdDateTime
                    membershipRule = $group.membershipRule
                    isDynamic = ($null -ne $group.membershipRule)
                    onPremisesSyncEnabled = $group.onPremisesSyncEnabled
                    proxyAddresses = if ($group.proxyAddresses) { ($group.proxyAddresses -join ';') } else { $null }
                    isAssignableToRole = $group.isAssignableToRole
                    _DataType = 'Group'
                }
                
                $null = $allData.Add($groupObj)
            }
            
            Write-ModuleLog -ModuleName "Graph" -Message "Discovered $($groups.Count) groups" -Level "SUCCESS"
            
            # Export groups
            Export-DiscoveryResults -Data ($allData | Where-Object { $_._DataType -eq 'Group' }) `
                -FileName "GraphGroups.csv" `
                -OutputPath $Context.Paths.RawDataOutput `
                -ModuleName "Graph" `
                -SessionId $SessionId
                
        } catch {
            $Result.AddError("Error during Graph discovery", $_.Exception, @{Phase = "Discovery"})
        }
        
        return $allData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "Graph" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @('Graph') `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-GraphDiscovery