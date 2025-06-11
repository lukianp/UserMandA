# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Microsoft Graph Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers users, groups, and organizational data using Microsoft Graph API
.NOTES
    Version: 4.3.0 (Fixed Authentication)
    Author: M&A Discovery Team
    Last Modified: 2025-06-11
#>

# Import authentication service
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\AuthenticationService.psm1") -Force

function Write-GraphLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[Graph] $Message" -Level $Level -Component "GraphDiscovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            default { "White" }
        }
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] [GraphDiscovery] [Graph] $Message" -ForegroundColor $color
    }
}

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

    Write-GraphLog -Level "HEADER" -Message "Starting Discovery (v4.3.0 - Fixed Authentication)" -Context $Context
    Write-GraphLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = $null
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Graph')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true
            ModuleName   = 'Graph'
            RecordCount  = 0
            Errors       = [System.Collections.ArrayList]::new()
            Warnings     = [System.Collections.ArrayList]::new()
            Metadata     = @{}
            StartTime    = Get-Date
            EndTime      = $null
            ExecutionId  = [guid]::NewGuid().ToString()
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    # Initialize variables
    $allDiscoveredData = [System.Collections.ArrayList]::new()
    $graphConnected = $false

    try {
        # STEP 1: Validate prerequisites
        Write-GraphLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-GraphLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        # Ensure output directory exists
        if (-not (Test-Path -Path $outputPath -PathType Container)) {
            try {
                New-Item -Path $outputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            } catch {
                $result.AddError("Failed to create output directory: $outputPath", $_.Exception, $null)
                return $result
            }
        }

        # STEP 2: Get module configuration
        $pageSize = 999
        $includeManager = $true
        $includeGroupMembers = $false  # Set to false by default for performance
        
        if ($Configuration.graphAPI -and $Configuration.graphAPI.pageSize) {
            $pageSize = [Math]::Min($Configuration.graphAPI.pageSize, 999)  # Cap at 999
        }

        # STEP 3: Authenticate to Microsoft Graph
        Write-GraphLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            
            # Validate the connection with a test API call
            $testUri = "https://graph.microsoft.com/v1.0/organization"
            $testResponse = Invoke-MgGraphRequest -Uri $testUri -Method GET -ErrorAction Stop
            
            if (-not $testResponse) {
                throw "Graph connection test failed - no response"
            }
            
            $graphConnected = $true
            Write-GraphLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
            Write-GraphLog -Level "DEBUG" -Message "Graph connection validated successfully" -Context $Context
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
            return $result
        }

        # STEP 4: PERFORM DISCOVERY
        Write-GraphLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        
        # Discover Organization Details using API
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering organization details..." -Context $Context
            $orgUri = "https://graph.microsoft.com/v1.0/organization"
            $orgResponse = Invoke-MgGraphRequest -Uri $orgUri -Method GET -ErrorAction Stop
            
            if ($orgResponse -and $orgResponse.value) {
                foreach ($org in $orgResponse.value) {
                    $orgData = [PSCustomObject]@{
                        TenantId = $org.id
                        DisplayName = $org.displayName
                        VerifiedDomains = ($org.verifiedDomains | Where-Object { $_.isVerified } | ForEach-Object { $_.name }) -join ';'
                        DefaultDomain = ($org.verifiedDomains | Where-Object { $_.isDefault } | Select-Object -First 1).name
                        TechnicalNotificationMails = ($org.technicalNotificationMails -join ';')
                        PreferredLanguage = $org.preferredLanguage
                        City = $org.city
                        State = $org.state
                        Country = $org.country
                        PostalCode = $org.postalCode
                        BusinessPhones = ($org.businessPhones -join ';')
                        CreatedDateTime = $org.createdDateTime
                        OnPremisesSyncEnabled = $org.onPremisesSyncEnabled
                        _DataType = 'Organization'
                    }
                    $null = $allDiscoveredData.Add($orgData)
                    Write-GraphLog -Level "SUCCESS" -Message "Discovered organization: $($org.displayName)" -Context $Context
                }
            }
        } catch {
            Write-GraphLog -Level "WARN" -Message "Failed to discover organization details: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover organization details: $($_.Exception.Message)", @{Section="Organization"})
        }

        # Discover Users using API
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering users..." -Context $Context
            
            # Build comprehensive user fields list
            $userSelectFields = @(
                'id', 'userPrincipalName', 'displayName', 'mail', 'mailNickname',
                'givenName', 'surname', 'jobTitle', 'department', 'companyName',
                'officeLocation', 'mobilePhone', 'employeeId', 'employeeType',
                'createdDateTime', 'accountEnabled', 'userType', 'usageLocation',
                'streetAddress', 'city', 'state', 'country', 'postalCode',
                'preferredLanguage', 'onPremisesSyncEnabled', 'onPremisesImmutableId',
                'onPremisesSamAccountName', 'onPremisesSecurityIdentifier',
                'onPremisesDomainName', 'onPremisesUserPrincipalName',
                'businessPhones', 'assignedLicenses', 'assignedPlans',
                'provisionedPlans', 'proxyAddresses', 'passwordPolicies',
                'passwordProfile', 'lastPasswordChangeDateTime'
            )
            
            # Build URI with all fields
            $uri = "https://graph.microsoft.com/v1.0/users?`$select=$($userSelectFields -join ',')&`$top=$pageSize"
            
            # Add manager expansion if requested
            if ($includeManager) {
                $uri += "&`$expand=manager(`$select=id,displayName,userPrincipalName)"
            }
            
            $userCount = 0
            $headers = @{
                'ConsistencyLevel' = 'eventual'
            }
            
            do {
                Write-GraphLog -Level "DEBUG" -Message "Fetching users from: $uri" -Context $Context
                
                try {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($user in $response.value) {
                            $userCount++
                            
                            # Extract license information
                            $licenses = @()
                            $licenseNames = @()
                            if ($user.assignedLicenses) {
                                $licenses = $user.assignedLicenses | ForEach-Object { $_.skuId }
                                # Note: To get license names, we'd need to map SKU IDs to names
                            }
                            
                            # Extract proxy addresses
                            $primarySmtp = ""
                            $allSmtpAddresses = @()
                            if ($user.proxyAddresses) {
                                $primarySmtp = ($user.proxyAddresses | Where-Object { $_ -like 'SMTP:*' } | ForEach-Object { $_.Substring(5) }) -join ';'
                                $allSmtpAddresses = $user.proxyAddresses | Where-Object { $_ -like '*smtp:*' -or $_ -like '*SMTP:*' }
                            }
                            
                            $userObj = [PSCustomObject]@{
                                # Core Identity
                                id = $user.id
                                userPrincipalName = $user.userPrincipalName
                                displayName = $user.displayName
                                mail = $user.mail
                                mailNickname = $user.mailNickname
                                primarySmtpAddress = if ($primarySmtp) { $primarySmtp } else { $user.mail }
                                proxyAddresses = ($allSmtpAddresses -join ';')
                                
                                # Personal Information
                                givenName = $user.givenName
                                surname = $user.surname
                                jobTitle = $user.jobTitle
                                department = $user.department
                                companyName = $user.companyName
                                employeeId = $user.employeeId
                                employeeType = $user.employeeType
                                
                                # Contact Information
                                officeLocation = $user.officeLocation
                                streetAddress = $user.streetAddress
                                city = $user.city
                                state = $user.state
                                country = $user.country
                                postalCode = $user.postalCode
                                businessPhones = ($user.businessPhones -join ';')
                                mobilePhone = $user.mobilePhone
                                preferredLanguage = $user.preferredLanguage
                                
                                # Account Status
                                accountEnabled = $user.accountEnabled
                                userType = $user.userType
                                usageLocation = $user.usageLocation
                                createdDateTime = $user.createdDateTime
                                lastPasswordChangeDateTime = $user.lastPasswordChangeDateTime
                                passwordPolicies = $user.passwordPolicies
                                
                                # Licensing
                                assignedLicenses = ($licenses -join ';')
                                licenseCount = $licenses.Count
                                assignedPlans = if ($user.assignedPlans) { 
                                    ($user.assignedPlans | Where-Object { $_.capabilityStatus -eq 'Enabled' } | ForEach-Object { $_.service }) -join ';' 
                                } else { $null }
                                
                                # On-Premises Sync
                                onPremisesSyncEnabled = $user.onPremisesSyncEnabled
                                onPremisesImmutableId = $user.onPremisesImmutableId
                                onPremisesSamAccountName = $user.onPremisesSamAccountName
                                onPremisesSecurityIdentifier = $user.onPremisesSecurityIdentifier
                                onPremisesDomainName = $user.onPremisesDomainName
                                onPremisesUserPrincipalName = $user.onPremisesUserPrincipalName
                                
                                # Manager Information
                                managerUPN = if ($user.manager) { $user.manager.userPrincipalName } else { $null }
                                managerId = if ($user.manager) { $user.manager.id } else { $null }
                                managerDisplayName = if ($user.manager) { $user.manager.displayName } else { $null }
                                
                                _DataType = 'User'
                            }
                            
                            $null = $allDiscoveredData.Add($userObj)
                            
                            if ($userCount % 100 -eq 0) {
                                Write-GraphLog -Level "DEBUG" -Message "Processed $userCount users..." -Context $Context
                            }
                        }
                    }
                    
                    $uri = $response.'@odata.nextLink'
                    
                } catch {
                    Write-GraphLog -Level "ERROR" -Message "Error fetching users: $($_.Exception.Message)" -Context $Context
                    # Try to continue with next page if possible
                    $uri = $null
                }
                
            } while ($uri)
            
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $userCount users" -Context $Context
            
        } catch {
            Write-GraphLog -Level "ERROR" -Message "Failed to discover users: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover users: $($_.Exception.Message)", @{Section="Users"})
        }
        
        # Discover Groups using API
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering groups..." -Context $Context
            
            $groupSelectFields = @(
                'id', 'displayName', 'mailEnabled', 'mailNickname', 'mail',
                'securityEnabled', 'groupTypes', 'description', 'visibility',
                'createdDateTime', 'membershipRule', 'membershipRuleProcessingState',
                'onPremisesSyncEnabled', 'onPremisesSamAccountName', 'onPremisesSecurityIdentifier',
                'onPremisesDomainName', 'onPremisesNetBiosName', 'proxyAddresses',
                'classification', 'renewedDateTime', 'expirationDateTime',
                'isAssignableToRole', 'resourceProvisioningOptions'
            )
            
            $uri = "https://graph.microsoft.com/v1.0/groups?`$select=$($groupSelectFields -join ',')&`$top=$pageSize"
            
            $groupCount = 0
            do {
                Write-GraphLog -Level "DEBUG" -Message "Fetching groups from: $uri" -Context $Context
                
                try {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($group in $response.value) {
                            $groupCount++
                            
                            # Determine group type
                            $groupType = 'SecurityGroup'
                            $isTeamEnabled = $false
                            
                            if ($group.groupTypes -contains 'Unified') {
                                $groupType = 'Microsoft365Group'
                            }
                            if ($group.resourceProvisioningOptions -contains 'Team') {
                                $isTeamEnabled = $true
                            }
                            if ($group.mailEnabled -and -not $group.securityEnabled) {
                                $groupType = 'DistributionList'
                            } elseif ($group.mailEnabled -and $group.securityEnabled) {
                                $groupType = 'MailEnabledSecurityGroup'
                            }
                            if ($group.groupTypes -contains 'DynamicMembership') {
                                $groupType = "Dynamic$groupType"
                            }
                            
                            # Extract proxy addresses
                            $primarySmtp = ""
                            if ($group.proxyAddresses) {
                                $primarySmtp = ($group.proxyAddresses | Where-Object { $_ -like 'SMTP:*' } | ForEach-Object { $_.Substring(5) }) -join ';'
                            }
                            
                            # Get member count if requested (separate API call)
                            $memberCount = 0
                            if ($includeGroupMembers -and $groupCount -le 100) {  # Limit for performance
                                try {
                                    $memberCountUri = "https://graph.microsoft.com/v1.0/groups/$($group.id)/members/`$count"
                                    $memberCount = Invoke-MgGraphRequest -Uri $memberCountUri -Headers @{'ConsistencyLevel' = 'eventual'} -Method GET -ErrorAction Stop
                                } catch {
                                    Write-GraphLog -Level "DEBUG" -Message "Could not get member count for group $($group.displayName): $_" -Context $Context
                                }
                            }
                            
                            $groupObj = [PSCustomObject]@{
                                # Core Identity
                                id = $group.id
                                displayName = $group.displayName
                                mail = $group.mail
                                mailNickname = $group.mailNickname
                                primarySmtpAddress = if ($primarySmtp) { $primarySmtp } else { $group.mail }
                                proxyAddresses = if ($group.proxyAddresses) { ($group.proxyAddresses -join ';') } else { $null }
                                
                                # Group Properties
                                mailEnabled = $group.mailEnabled
                                securityEnabled = $group.securityEnabled
                                groupType = $groupType
                                groupTypes = ($group.groupTypes -join ';')
                                isTeamEnabled = $isTeamEnabled
                                description = $group.description
                                visibility = $group.visibility
                                classification = $group.classification
                                isAssignableToRole = $group.isAssignableToRole
                                
                                # Dates
                                createdDateTime = $group.createdDateTime
                                renewedDateTime = $group.renewedDateTime
                                expirationDateTime = $group.expirationDateTime
                                
                                # Dynamic Group
                                membershipRule = $group.membershipRule
                                membershipRuleProcessingState = $group.membershipRuleProcessingState
                                isDynamic = ($null -ne $group.membershipRule)
                                
                                # On-Premises Sync
                                onPremisesSyncEnabled = $group.onPremisesSyncEnabled
                                onPremisesSamAccountName = $group.onPremisesSamAccountName
                                onPremisesSecurityIdentifier = $group.onPremisesSecurityIdentifier
                                onPremisesDomainName = $group.onPremisesDomainName
                                onPremisesNetBiosName = $group.onPremisesNetBiosName
                                
                                # Membership
                                memberCount = $memberCount
                                
                                _DataType = 'Group'
                            }
                            
                            $null = $allDiscoveredData.Add($groupObj)
                            
                            if ($groupCount % 100 -eq 0) {
                                Write-GraphLog -Level "DEBUG" -Message "Processed $groupCount groups..." -Context $Context
                            }
                        }
                    }
                    
                    $uri = $response.'@odata.nextLink'
                    
                } catch {
                    Write-GraphLog -Level "ERROR" -Message "Error fetching groups: $($_.Exception.Message)" -Context $Context
                    $uri = $null
                }
                
            } while ($uri)
            
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $groupCount groups" -Context $Context
            
        } catch {
            Write-GraphLog -Level "ERROR" -Message "Failed to discover groups: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover groups: $($_.Exception.Message)", @{Section="Groups"})
        }
        
        # Discover Service Principals (Applications) using API
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering service principals..." -Context $Context
            
            $spSelectFields = @(
                'id', 'appId', 'displayName', 'servicePrincipalType', 
                'accountEnabled', 'appOwnerOrganizationId', 'homepage',
                'publisherName', 'signInAudience', 'createdDateTime',
                'appRoleAssignmentRequired', 'tags', 'tokenEncryptionKeyId',
                'samlMetadataUrl', 'replyUrls', 'logoutUrl',
                'appRoles', 'oauth2PermissionScopes'
            )
            
            $uri = "https://graph.microsoft.com/v1.0/servicePrincipals?`$select=$($spSelectFields -join ',')&`$top=$pageSize&`$filter=servicePrincipalType eq 'Application'"
            
            $spCount = 0
            do {
                Write-GraphLog -Level "DEBUG" -Message "Fetching service principals..." -Context $Context
                
                try {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($sp in $response.value) {
                            $spCount++
                            
                            $spObj = [PSCustomObject]@{
                                # Core Identity
                                id = $sp.id
                                appId = $sp.appId
                                displayName = $sp.displayName
                                servicePrincipalType = $sp.servicePrincipalType
                                
                                # Status and Configuration
                                accountEnabled = $sp.accountEnabled
                                appRoleAssignmentRequired = $sp.appRoleAssignmentRequired
                                
                                # Publisher Information
                                appOwnerOrganizationId = $sp.appOwnerOrganizationId
                                publisherName = $sp.publisherName
                                
                                # URLs
                                homepage = $sp.homepage
                                logoutUrl = $sp.logoutUrl
                                samlMetadataUrl = $sp.samlMetadataUrl
                                replyUrls = if ($sp.replyUrls) { ($sp.replyUrls -join ';') } else { $null }
                                
                                # Audience and Security
                                signInAudience = $sp.signInAudience
                                tokenEncryptionKeyId = $sp.tokenEncryptionKeyId
                                
                                # Tags and Metadata
                                tags = if ($sp.tags) { ($sp.tags -join ';') } else { $null }
                                createdDateTime = $sp.createdDateTime
                                
                                # Permissions
                                appRoles = if ($sp.appRoles) { 
                                    ($sp.appRoles | ForEach-Object { "$($_.value):$($_.displayName)" }) -join ';' 
                                } else { $null }
                                oauth2PermissionScopes = if ($sp.oauth2PermissionScopes) { 
                                    ($sp.oauth2PermissionScopes | ForEach-Object { "$($_.value):$($_.adminConsentDisplayName)" }) -join ';' 
                                } else { $null }
                                
                                _DataType = 'ServicePrincipal'
                            }
                            
                            $null = $allDiscoveredData.Add($spObj)
                        }
                    }
                    
                    $uri = $response.'@odata.nextLink'
                    
                } catch {
                    Write-GraphLog -Level "DEBUG" -Message "Error fetching service principals: $_" -Context $Context
                    $uri = $null
                }
                
            } while ($uri -and $spCount -lt 1000)  # Limit to 1000 for performance
            
            if ($spCount -gt 0) {
                Write-GraphLog -Level "SUCCESS" -Message "Discovered $spCount service principals" -Context $Context
            }
            
        } catch {
            Write-GraphLog -Level "DEBUG" -Message "Could not discover service principals: $($_.Exception.Message)" -Context $Context
        }
        
        # Discover Directory Roles using API
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering directory roles..." -Context $Context
            
            $roleUri = "https://graph.microsoft.com/v1.0/directoryRoles?`$expand=members"
            $roleResponse = Invoke-MgGraphRequest -Uri $roleUri -Method GET -ErrorAction Stop
            
            if ($roleResponse -and $roleResponse.value) {
                foreach ($role in $roleResponse.value) {
                    $roleObj = [PSCustomObject]@{
                        id = $role.id
                        displayName = $role.displayName
                        description = $role.description
                        roleTemplateId = $role.roleTemplateId
                        memberCount = if ($role.members) { $role.members.Count } else { 0 }
                        members = if ($role.members) { 
                            ($role.members | ForEach-Object { $_.userPrincipalName }) -join ';' 
                        } else { $null }
                        _DataType = 'DirectoryRole'
                    }
                    
                    $null = $allDiscoveredData.Add($roleObj)
                }
                
                Write-GraphLog -Level "SUCCESS" -Message "Discovered $($roleResponse.value.Count) directory roles" -Context $Context
            }
            
        } catch {
            Write-GraphLog -Level "DEBUG" -Message "Could not discover directory roles: $($_.Exception.Message)" -Context $Context
        }

        # STEP 5: Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-GraphLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by data type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Remove _DataType property and add metadata
                $exportData = $data | ForEach-Object {
                    $obj = $_.PSObject.Copy()
                    $obj.PSObject.Properties.Remove('_DataType')
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Graph" -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                    $obj
                }
                
                # Determine filename
                $fileName = switch ($dataType) {
                    'User' { 'GraphUsers.csv' }
                    'Group' { 'GraphGroups.csv' }
                    'Organization' { 'GraphOrganization.csv' }
                    'ServicePrincipal' { 'GraphServicePrincipals.csv' }
                    'DirectoryRole' { 'GraphDirectoryRoles.csv' }
                    default { "Graph_$dataType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-GraphLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-GraphLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # STEP 6: Update result metadata
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SessionId"] = $SessionId
        
        # Add counts by type
        $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    } catch {
        # Catch any unexpected errors
        Write-GraphLog -Level "ERROR" -Message "Critical error during discovery: $($_.Exception.Message)" -Context $Context
        Write-GraphLog -Level "DEBUG" -Message "Stack trace: $($_.ScriptStackTrace)" -Context $Context
        $result.AddError("Critical error during discovery: $($_.Exception.Message)", $_.Exception, @{
            ErrorType = "General"
            StackTrace = $_.ScriptStackTrace
        })
    } finally {
        # STEP 7: Cleanup
        Write-GraphLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Note: Connection cleanup is handled by the authentication service
        # No need to disconnect here
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Ensure RecordCount is properly set in hashtable result
        if ($result -is [hashtable]) {
            $result['RecordCount'] = $allDiscoveredData.Count
        }
        
        $finalStatus = if($result.Success){"SUCCESS"}else{"ERROR"}
        Write-GraphLog -Level $finalStatus -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
        Write-GraphLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# Export module function
Export-ModuleMember -Function Invoke-GraphDiscovery