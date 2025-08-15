# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-03
# Last Modified: 2025-08-03

<#
.SYNOPSIS
    Entra ID App Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Entra ID applications, enterprise applications, service principals, and related security configurations
    using Microsoft Graph API. This module provides comprehensive application discovery including app registrations,
    enterprise applications, service principals, certificates, secrets, permissions, and conditional access policies
    essential for M&A application security assessment and migration planning.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-03
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-EntraIDApp {
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
        
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get Graph connection from $Connections
        $graphConnection = $Connections["Graph"]
        
        # STEP 1: PERFORM DISCOVERY
        Write-ModuleLog -ModuleName "EntraIDApp" -Message "Starting Entra ID application discovery" -Level "HEADER"
        
        # Discover App Registrations
        try {
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovering app registrations..." -Level "INFO"
            
            $appUri = "https://graph.microsoft.com/v1.0/applications?`$top=999&`$expand=owners"
            $apps = Invoke-GraphAPIWithPaging -Uri $appUri -ModuleName "EntraIDApp"
            
            foreach ($app in $apps) {
                $appObj = [PSCustomObject]@{
                    ObjectId = $app.id
                    AppId = $app.appId
                    DisplayName = $app.displayName
                    Description = $app.description
                    SignInAudience = $app.signInAudience
                    CreatedDateTime = $app.createdDateTime
                    PublisherDomain = $app.publisherDomain
                    VerifiedPublisher = if ($app.verifiedPublisher) { $app.verifiedPublisher.displayName } else { $null }
                    Certification = if ($app.certification) { $app.certification.certificationDetailsUrl } else { $null }
                    IdentifierUris = ($app.identifierUris -join ';')
                    ReplyUrls = if ($app.web -and $app.web.redirectUris) { ($app.web.redirectUris -join ';') } else { $null }
                    HomePage = if ($app.web) { $app.web.homePageUrl } else { $null }
                    LogoutUrl = if ($app.web) { $app.web.logoutUrl } else { $null }
                    Tags = ($app.tags -join ';')
                    Notes = $app.notes
                    OwnerCount = if ($app.owners) { $app.owners.Count } else { 0 }
                    Owners = if ($app.owners) { 
                        ($app.owners | ForEach-Object { 
                            if ($_.displayName) { $_.displayName } 
                            elseif ($_.userPrincipalName) { $_.userPrincipalName }
                            else { $_.id }
                        }) -join ';'
                    } else { $null }
                    RequiredResourceAccessCount = if ($app.requiredResourceAccess) { $app.requiredResourceAccess.Count } else { 0 }
                    AppRoleCount = if ($app.appRoles) { $app.appRoles.Count } else { 0 }
                    OAuth2PermissionScopeCount = if ($app.api -and $app.api.oauth2PermissionScopes) { $app.api.oauth2PermissionScopes.Count } else { 0 }
                    KeyCredentialCount = if ($app.keyCredentials) { $app.keyCredentials.Count } else { 0 }
                    PasswordCredentialCount = if ($app.passwordCredentials) { $app.passwordCredentials.Count } else { 0 }
                    HasHighPrivilegePermissions = $false
                    _ObjectType = 'AppRegistration'
                }
                
                # Check for high privilege permissions
                if ($app.requiredResourceAccess) {
                    $highPrivilegePermissions = @(
                        'Application.ReadWrite.All', 'AppRoleAssignment.ReadWrite.All', 'Directory.ReadWrite.All',
                        'RoleManagement.ReadWrite.Directory', 'User.ReadWrite.All', 'Group.ReadWrite.All',
                        'GroupMember.ReadWrite.All', 'Mail.ReadWrite', 'Mail.Send', 'Files.ReadWrite.All',
                        'Sites.ReadWrite.All', 'Exchange.ManageAsApp', 'full_access_as_app'
                    )
                    
                    foreach ($resource in $app.requiredResourceAccess) {
                        foreach ($permission in $resource.resourceAccess) {
                            # Get permission details via Graph API if needed
                            $hasHighPrivilege = $false
                            foreach ($privilegePattern in $highPrivilegePermissions) {
                                if ($permission.id -match $privilegePattern -or $permission.type -eq 'Role') {
                                    $hasHighPrivilege = $true
                                    break
                                }
                            }
                            if ($hasHighPrivilege) {
                                $appObj.HasHighPrivilegePermissions = $true
                                break
                            }
                        }
                        if ($appObj.HasHighPrivilegePermissions) { break }
                    }
                }
                
                $null = $allDiscoveredData.Add($appObj)
            }
            
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovered $($apps.Count) app registrations" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover app registrations: $($_.Exception.Message)", @{Operation = "GetAppRegistrations"})
        }
        
        # Discover Enterprise Applications (Service Principals with specific tags)
        try {
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovering enterprise applications..." -Level "INFO"
            
            $enterpriseUri = "https://graph.microsoft.com/v1.0/servicePrincipals?`$top=999&`$filter=tags/any(t:t eq 'WindowsAzureActiveDirectoryIntegratedApp')"
            $enterpriseApps = Invoke-GraphAPIWithPaging -Uri $enterpriseUri -ModuleName "EntraIDApp"
            
            foreach ($app in $enterpriseApps) {
                $enterpriseObj = [PSCustomObject]@{
                    ObjectId = $app.id
                    AppId = $app.appId
                    DisplayName = $app.displayName
                    Description = $app.description
                    ServicePrincipalType = $app.servicePrincipalType
                    AccountEnabled = $app.accountEnabled
                    AppOwnerOrganizationId = $app.appOwnerOrganizationId
                    HomePage = $app.homepage
                    LoginUrl = $app.loginUrl
                    LogoutUrl = $app.logoutUrl
                    PublisherName = $app.publisherName
                    PreferredSingleSignOnMode = $app.preferredSingleSignOnMode
                    SignInAudience = $app.signInAudience
                    AppRoleAssignmentRequired = $app.appRoleAssignmentRequired
                    CreatedDateTime = $app.createdDateTime
                    Tags = ($app.tags -join ';')
                    NotificationEmailAddresses = ($app.notificationEmailAddresses -join ';')
                    AlternativeNames = ($app.alternativeNames -join ';')
                    ReplyUrls = ($app.replyUrls -join ';')
                    AppRoleCount = if ($app.appRoles) { $app.appRoles.Count } else { 0 }
                    OAuth2PermissionScopeCount = if ($app.oauth2PermissionScopes) { $app.oauth2PermissionScopes.Count } else { 0 }
                    KeyCredentialCount = if ($app.keyCredentials) { $app.keyCredentials.Count } else { 0 }
                    PasswordCredentialCount = if ($app.passwordCredentials) { $app.passwordCredentials.Count } else { 0 }
                    _ObjectType = 'EnterpriseApplication'
                }
                
                $null = $allDiscoveredData.Add($enterpriseObj)
            }
            
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovered $($enterpriseApps.Count) enterprise applications" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover enterprise applications: $($_.Exception.Message)", @{Operation = "GetEnterpriseApps"})
        }
        
        # Discover All Service Principals
        try {
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovering service principals..." -Level "INFO"
            
            $spUri = "https://graph.microsoft.com/v1.0/servicePrincipals?`$top=999"
            $servicePrincipals = Invoke-GraphAPIWithPaging -Uri $spUri -ModuleName "EntraIDApp"
            
            foreach ($sp in $servicePrincipals) {
                $spObj = [PSCustomObject]@{
                    ObjectId = $sp.id
                    AppId = $sp.appId
                    DisplayName = $sp.displayName
                    ServicePrincipalType = $sp.servicePrincipalType
                    AccountEnabled = $sp.accountEnabled
                    AppOwnerOrganizationId = $sp.appOwnerOrganizationId
                    HomePage = $sp.homepage
                    PublisherName = $sp.publisherName
                    SignInAudience = $sp.signInAudience
                    CreatedDateTime = $sp.createdDateTime
                    Tags = ($sp.tags -join ';')
                    AppRoleCount = if ($sp.appRoles) { $sp.appRoles.Count } else { 0 }
                    OAuth2PermissionScopeCount = if ($sp.oauth2PermissionScopes) { $sp.oauth2PermissionScopes.Count } else { 0 }
                    KeyCredentialCount = if ($sp.keyCredentials) { $sp.keyCredentials.Count } else { 0 }
                    PasswordCredentialCount = if ($sp.passwordCredentials) { $sp.passwordCredentials.Count } else { 0 }
                    _ObjectType = 'ServicePrincipal'
                }
                
                $null = $allDiscoveredData.Add($spObj)
            }
            
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovered $($servicePrincipals.Count) service principals" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover service principals: $($_.Exception.Message)", @{Operation = "GetServicePrincipals"})
        }
        
        # Discover Application Certificates and Secrets
        try {
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Analyzing certificates and secrets..." -Level "INFO"
            
            $certificateCount = 0
            $secretCount = 0
            $expiredCount = 0
            $expiringSoonCount = 0
            
            # Re-fetch apps with credentials details
            $appsWithCredsUri = "https://graph.microsoft.com/v1.0/applications?`$select=id,appId,displayName,keyCredentials,passwordCredentials&`$top=999"
            $appsWithCreds = Invoke-GraphAPIWithPaging -Uri $appsWithCredsUri -ModuleName "EntraIDApp"
            
            foreach ($app in $appsWithCreds) {
                # Process certificates
                if ($app.keyCredentials) {
                    foreach ($keyCred in $app.keyCredentials) {
                        $certificateCount++
                        $daysUntilExpiry = if ($keyCred.endDateTime) { 
                            (New-TimeSpan -Start (Get-Date) -End ([datetime]$keyCred.endDateTime)).Days
                        } else { -1 }
                        
                        $status = if ($daysUntilExpiry -lt 0) { 'Expired' }
                                elseif ($daysUntilExpiry -lt 30) { 'ExpiringSoon' }
                                elseif ($daysUntilExpiry -lt 90) { 'ExpiringInQuarter' }
                                else { 'Valid' }
                        
                        if ($status -eq 'Expired') { $expiredCount++ }
                        elseif ($status -eq 'ExpiringSoon') { $expiringSoonCount++ }
                        
                        $certObj = [PSCustomObject]@{
                            AppId = $app.appId
                            AppDisplayName = $app.displayName
                            CredentialType = 'Certificate'
                            KeyId = $keyCred.keyId
                            DisplayName = $keyCred.displayName
                            StartDateTime = $keyCred.startDateTime
                            EndDateTime = $keyCred.endDateTime
                            DaysUntilExpiry = $daysUntilExpiry
                            Usage = $keyCred.usage
                            Status = $status
                            CustomKeyIdentifier = if ($keyCred.customKeyIdentifier) { 
                                [System.Convert]::ToBase64String([System.Convert]::FromBase64String($keyCred.customKeyIdentifier))
                            } else { $null }
                            _ObjectType = 'ApplicationCertificate'
                        }
                        
                        $null = $allDiscoveredData.Add($certObj)
                    }
                }
                
                # Process secrets
                if ($app.passwordCredentials) {
                    foreach ($passwordCred in $app.passwordCredentials) {
                        $secretCount++
                        $daysUntilExpiry = if ($passwordCred.endDateTime) { 
                            (New-TimeSpan -Start (Get-Date) -End ([datetime]$passwordCred.endDateTime)).Days
                        } else { -1 }
                        
                        $status = if (-not $passwordCred.endDateTime) { 'NeverExpires' }
                                elseif ($daysUntilExpiry -lt 0) { 'Expired' }
                                elseif ($daysUntilExpiry -lt 30) { 'ExpiringSoon' }
                                elseif ($daysUntilExpiry -lt 90) { 'ExpiringInQuarter' }
                                else { 'Valid' }
                        
                        if ($status -eq 'Expired') { $expiredCount++ }
                        elseif ($status -eq 'ExpiringSoon') { $expiringSoonCount++ }
                        
                        $secretObj = [PSCustomObject]@{
                            AppId = $app.appId
                            AppDisplayName = $app.displayName
                            CredentialType = 'Secret'
                            KeyId = $passwordCred.keyId
                            DisplayName = $passwordCred.displayName
                            Hint = $passwordCred.hint
                            StartDateTime = $passwordCred.startDateTime
                            EndDateTime = $passwordCred.endDateTime
                            DaysUntilExpiry = $daysUntilExpiry
                            Status = $status
                            _ObjectType = 'ApplicationSecret'
                        }
                        
                        $null = $allDiscoveredData.Add($secretObj)
                    }
                }
            }
            
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Analyzed $certificateCount certificates and $secretCount secrets" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Found $expiredCount expired and $expiringSoonCount expiring soon credentials" -Level "INFO"
            
        } catch {
            $Result.AddWarning("Failed to analyze certificates and secrets: $($_.Exception.Message)", @{Operation = "GetCredentials"})
        }
        
        # Discover Conditional Access Policies affecting applications
        try {
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovering conditional access policies..." -Level "INFO"
            
            $caUri = "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies"
            $policies = Invoke-GraphAPIWithPaging -Uri $caUri -ModuleName "EntraIDApp"
            
            foreach ($policy in $policies) {
                if ($policy.conditions -and $policy.conditions.applications -and $policy.conditions.applications.includeApplications) {
                    $policyObj = [PSCustomObject]@{
                        PolicyId = $policy.id
                        DisplayName = $policy.displayName
                        State = $policy.state
                        CreatedDateTime = $policy.createdDateTime
                        ModifiedDateTime = $policy.modifiedDateTime
                        IncludeApplications = ($policy.conditions.applications.includeApplications -join ';')
                        ExcludeApplications = if ($policy.conditions.applications.excludeApplications) { 
                            ($policy.conditions.applications.excludeApplications -join ';') 
                        } else { $null }
                        IncludeUsers = if ($policy.conditions.users -and $policy.conditions.users.includeUsers) { 
                            ($policy.conditions.users.includeUsers -join ';') 
                        } else { $null }
                        ExcludeUsers = if ($policy.conditions.users -and $policy.conditions.users.excludeUsers) { 
                            ($policy.conditions.users.excludeUsers -join ';') 
                        } else { $null }
                        IncludeGroups = if ($policy.conditions.users -and $policy.conditions.users.includeGroups) { 
                            ($policy.conditions.users.includeGroups -join ';') 
                        } else { $null }
                        ExcludeGroups = if ($policy.conditions.users -and $policy.conditions.users.excludeGroups) { 
                            ($policy.conditions.users.excludeGroups -join ';') 
                        } else { $null }
                        GrantControls = if ($policy.grantControls -and $policy.grantControls.builtInControls) { 
                            ($policy.grantControls.builtInControls -join ';') 
                        } else { $null }
                        _ObjectType = 'ConditionalAccessPolicy'
                    }
                    
                    $null = $allDiscoveredData.Add($policyObj)
                }
            }
            
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Discovered $($policies.Count) conditional access policies" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover conditional access policies: $($_.Exception.Message)", @{Operation = "GetConditionalAccessPolicies"})
        }
        
        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "Exporting $($allDiscoveredData.Count) records..." -Level "INFO"
            
            # Group by object type and export to separate files
            $objectGroups = $allDiscoveredData | Group-Object -Property _ObjectType
            
            foreach ($group in $objectGroups) {
                $objectType = $group.Name
                $data = $group.Group
                
                # Map object types to file names
                $fileName = switch ($objectType) {
                    'AppRegistration' { 'EntraIDAppRegistrations.csv' }
                    'EnterpriseApplication' { 'EntraIDEnterpriseApps.csv' }
                    'ServicePrincipal' { 'EntraIDServicePrincipals.csv' }
                    'ApplicationCertificate' { 'EntraIDApplicationCertificates.csv' }
                    'ApplicationSecret' { 'EntraIDApplicationSecrets.csv' }
                    'ConditionalAccessPolicy' { 'EntraIDConditionalAccessPolicies.csv' }
                    default { "EntraIDApp_$objectType.csv" }
                }
                
                Export-DiscoveryResults -Data $data `
                    -FileName $fileName `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "EntraIDApp" `
                    -SessionId $SessionId
            }
        } else {
            Write-ModuleLog -ModuleName "EntraIDApp" -Message "No data discovered to export" -Level "WARN"
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "EntraIDApp" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @('Graph') `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-EntraIDApp