# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Enhanced Exchange Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Exchange Online mailboxes, distribution groups, mail-enabled security groups, mailbox statistics, 
    mail flow rules, retention policies, and more using Microsoft Graph API. This module provides comprehensive 
    Exchange Online discovery including detailed mailbox configurations, distribution lists, mail flow analysis, 
    and email security settings essential for M&A email system assessment and migration planning.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft.Graph modules, Exchange.ManageAsApp permission, DiscoveryBase module
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

# --- Enhanced Discovery Function ---

function Invoke-ExchangeDiscovery {
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
        $batchSize = 100
        $maxRetries = 3
        
        # Helper function for Graph API calls with retry and exponential backoff
        function Invoke-GraphWithRetry {
            param(
                [string]$Uri,
                [string]$Method = "GET",
                [hashtable]$Headers = @{ 'ConsistencyLevel' = 'eventual' },
                [int]$MaxRetries = 3,
                [string]$Body = $null
            )
            
            for ($i = 1; $i -le $MaxRetries; $i++) {
                try {
                    if ($Body) {
                        $response = Invoke-MgGraphRequest -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ContentType "application/json" -ErrorAction Stop
                    } else {
                        $response = Invoke-MgGraphRequest -Uri $Uri -Method $Method -Headers $Headers -ErrorAction Stop
                    }
                    return $response
                } catch {
                    if ($i -eq $MaxRetries) { throw }
                    
                    $delay = [Math]::Pow(2, $i) # Exponential backoff
                    $errorMessage = $_.Exception.Message
                    
                    # Handle specific throttling scenarios
                    if ($errorMessage -match "Too Many Requests" -or $errorMessage -match "TooManyRequests" -or $errorMessage -match "429") {
                        $delay = $delay * 2  # Extra delay for throttling
                        Write-ModuleLog -ModuleName "Exchange" -Message "Rate limited (429). Retry $i/$MaxRetries after $delay seconds..." -Level "WARN"
                    } elseif ($errorMessage -match "Service Unavailable" -or $errorMessage -match "503") {
                        Write-ModuleLog -ModuleName "Exchange" -Message "Service unavailable (503). Retry $i/$MaxRetries after $delay seconds..." -Level "WARN"
                    } elseif ($errorMessage -match "Timeout" -or $errorMessage -match "408") {
                        Write-ModuleLog -ModuleName "Exchange" -Message "Request timeout (408). Retry $i/$MaxRetries after $delay seconds..." -Level "WARN"
                    } else {
                        Write-ModuleLog -ModuleName "Exchange" -Message "Retry $i/$MaxRetries after error: $errorMessage. Waiting $delay seconds..." -Level "WARN"
                    }
                    
                    Start-Sleep -Seconds $delay
                }
            }
        }
        
        # Enhanced user selection for comprehensive mailbox discovery
        $userSelectFields = @(
            'id', 'userPrincipalName', 'displayName', 'mail', 'mailNickname',
            'givenName', 'surname', 'jobTitle', 'department', 'companyName',
            'officeLocation', 'businessPhones', 'mobilePhone',
            'streetAddress', 'city', 'state', 'postalCode', 'country',
            'employeeId', 'employeeType', 'costCenter', 'division',
            'accountEnabled', 'createdDateTime', 'deletedDateTime',
            'lastPasswordChangeDateTime', 'proxyAddresses',
            'onPremisesDistinguishedName',
            'onPremisesImmutableId', 'onPremisesLastSyncDateTime',
            'onPremisesSamAccountName', 'onPremisesSecurityIdentifier',
            'onPremisesSyncEnabled', 'onPremisesUserPrincipalName',
            'preferredDataLocation', 'usageLocation', 'assignedLicenses',
            'assignedPlans', 'provisionedPlans'
        )
        
        # Discover Mailboxes with comprehensive metadata
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering mailboxes with enhanced metadata..." -Level "INFO"
            
            # Enhanced mailbox discovery with better filtering - using beta endpoint for beta properties
            # Use $count=true with ConsistencyLevel:eventual for advanced query support
            $mailboxUri = "https://graph.microsoft.com/beta/users?`$count=true&`$select=$($userSelectFields -join ',')&`$top=$batchSize"
            if (-not $Configuration.discovery.excludeDisabledUsers) {
                # Include all users with mailboxes (including disabled ones for shared mailboxes)
                $mailboxUri += "&`$filter=mail ne null and userType eq 'Member'"
            } else {
                # Only active user mailboxes
                $mailboxUri += "&`$filter=mail ne null and accountEnabled eq true and userType eq 'Member'"
            }
            
            Write-ModuleLog -ModuleName "Exchange" -Message "Using mailbox discovery query: $mailboxUri" -Level "DEBUG"
            
            $pageCount = 0
            $totalMailboxes = 0
            $nextLink = $mailboxUri
            
            while ($nextLink) {
                $pageCount++
                Write-ModuleLog -ModuleName "Exchange" -Message "Fetching mailbox page $pageCount..." -Level "DEBUG"
                
                $response = Invoke-GraphWithRetry -Uri $nextLink
                
                foreach ($user in $response.value) {
                    if (-not $user.mail) { continue } # Skip users without mailboxes
                    
                    # Get additional mailbox settings with enhanced error handling
                    $mailboxSettings = $null
                    try {
                        # Check if user has a proper Exchange mailbox first
                        if ($user.mail -and $user.accountEnabled) {
                            $settingsUri = "https://graph.microsoft.com/v1.0/users/$($user.id)/mailboxSettings"
                            $mailboxSettings = Invoke-GraphWithRetry -Uri $settingsUri
                        }
                    } catch {
                        $errorMessage = $_.Exception.Message
                        if ($errorMessage -match "BadRequest" -or $errorMessage -match "400") {
                            Write-ModuleLog -ModuleName "Exchange" -Message "User $($user.userPrincipalName) may not have Exchange mailbox enabled: $errorMessage" -Level "DEBUG"
                        } elseif ($errorMessage -match "Forbidden" -or $errorMessage -match "403") {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Insufficient permissions for mailbox settings on $($user.userPrincipalName): $errorMessage" -Level "WARN"
                        } else {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Could not get mailbox settings for $($user.userPrincipalName): $errorMessage" -Level "DEBUG"
                        }
                    }
                    
                    # Get mail folders statistics
                    $folderStats = @{
                        InboxCount = 0
                        SentCount = 0
                        DraftsCount = 0
                        DeletedCount = 0
                        TotalFolders = 0
                    }
                    
                    try {
                        # Only try to get folders if user has active mailbox
                        if ($user.mail -and $user.accountEnabled) {
                            $foldersUri = "https://graph.microsoft.com/v1.0/users/$($user.id)/mailFolders?`$top=100"
                            $folders = Invoke-GraphWithRetry -Uri $foldersUri
                            
                            if ($folders -and $folders.value) {
                                foreach ($folder in $folders.value) {
                                    $folderStats.TotalFolders++
                                    switch ($folder.displayName) {
                                        "Inbox" { $folderStats.InboxCount = $folder.totalItemCount }
                                        "Sent Items" { $folderStats.SentCount = $folder.totalItemCount }
                                        "Drafts" { $folderStats.DraftsCount = $folder.totalItemCount }
                                        "Deleted Items" { $folderStats.DeletedCount = $folder.totalItemCount }
                                    }
                                }
                            }
                        }
                    } catch {
                        $errorMessage = $_.Exception.Message
                        if ($errorMessage -match "BadRequest" -or $errorMessage -match "400") {
                            Write-ModuleLog -ModuleName "Exchange" -Message "User $($user.userPrincipalName) may not have Exchange mailbox or folders accessible: $errorMessage" -Level "DEBUG"
                        } elseif ($errorMessage -match "Forbidden" -or $errorMessage -match "403") {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Insufficient permissions for mail folders on $($user.userPrincipalName): $errorMessage" -Level "WARN"
                        } else {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Could not get folder stats for $($user.userPrincipalName): $errorMessage" -Level "DEBUG"
                        }
                    }
                    
                    # Get calendar permissions with enhanced error handling
                    $calendarPermissions = @()
                    try {
                        if ($user.mail -and $user.accountEnabled) {
                            $calendarUri = "https://graph.microsoft.com/v1.0/users/$($user.id)/calendar/calendarPermissions"
                            $calPerms = Invoke-GraphWithRetry -Uri $calendarUri
                            if ($calPerms -and $calPerms.value) {
                                $calendarPermissions = $calPerms.value | ForEach-Object {
                                    "$($_.emailAddress.name):$($_.role)"
                                }
                            }
                        }
                    } catch {
                        $errorMessage = $_.Exception.Message
                        if ($errorMessage -match "BadRequest" -or $errorMessage -match "400") {
                            Write-ModuleLog -ModuleName "Exchange" -Message "User $($user.userPrincipalName) may not have Exchange calendar enabled: $errorMessage" -Level "DEBUG"
                        } elseif ($errorMessage -match "Forbidden" -or $errorMessage -match "403") {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Insufficient permissions for calendar on $($user.userPrincipalName): $errorMessage" -Level "WARN"
                        } else {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Could not get calendar permissions for $($user.userPrincipalName): $errorMessage" -Level "DEBUG"
                        }
                    }
                    
                    # Resolve manager id (cannot be selected directly; fetch via navigation)
                    $managerId = $null
                    try {
                        $mgrUri = "https://graph.microsoft.com/v1.0/users/$($user.id)/manager?`$select=id"
                        $mgr = Invoke-GraphWithRetry -Uri $mgrUri -Method "GET"
                        if ($mgr -and ($mgr.PSObject.Properties.Name -contains 'id')) {
                            $managerId = $mgr.id
                        }
                    } catch {
                        $mgrErr = $_.Exception.Message
                        if ($mgrErr -match "404" -or $mgrErr -match "Not Found") {
                            # No manager assigned — ignore
                        } elseif ($mgrErr -match "Forbidden" -or $mgrErr -match "403") {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Insufficient permissions to read manager for $($user.userPrincipalName): $mgrErr" -Level "DEBUG"
                        } else {
                            Write-ModuleLog -ModuleName "Exchange" -Message "Could not resolve manager for $($user.userPrincipalName): $mgrErr" -Level "DEBUG"
                        }
                    }

                    # Build comprehensive mailbox object
                    $mailboxObj = [PSCustomObject]@{
                        # Identity
                        Id = $user.id
                        UserPrincipalName = $user.userPrincipalName
                        PrimarySmtpAddress = $user.mail
                        DisplayName = $user.displayName
                        Alias = $user.mailNickname
                        
                        # Personal Information
                        GivenName = $user.givenName
                        Surname = $user.surname
                        JobTitle = $user.jobTitle
                        Department = $user.department
                        Company = $user.companyName
                        EmployeeId = $user.employeeId
                        EmployeeType = $user.employeeType
                        CostCenter = $user.costCenter
                        Division = $user.division
                        
                        # Contact Information
                        OfficeLocation = $user.officeLocation
                        StreetAddress = $user.streetAddress
                        City = $user.city
                        State = $user.state
                        PostalCode = $user.postalCode
                        Country = $user.country
                        BusinessPhones = ($user.businessPhones -join ';')
                        MobilePhone = $user.mobilePhone
                        FaxNumber = $null # Not available on Graph user; placeholder for schema consistency
                        
                        # Account Status
                        AccountEnabled = $user.accountEnabled
                        CreatedDateTime = $user.createdDateTime
                        DeletedDateTime = $user.deletedDateTime
                        LastPasswordChangeDateTime = $user.lastPasswordChangeDateTime
                        
                        # Mailbox Configuration
                        ProxyAddresses = ($user.proxyAddresses -join ';')
                        MailboxTimeZone = if ($mailboxSettings) { $mailboxSettings.timeZone } else { $null }
                        MailboxLanguage = if ($mailboxSettings) { $mailboxSettings.language.displayName } else { $null }
                        MailboxDateFormat = if ($mailboxSettings) { $mailboxSettings.dateFormat } else { $null }
                        MailboxTimeFormat = if ($mailboxSettings) { $mailboxSettings.timeFormat } else { $null }
                        WorkingHours = if ($mailboxSettings -and $mailboxSettings.workingHours) {
                            "$($mailboxSettings.workingHours.startTime)-$($mailboxSettings.workingHours.endTime) $($mailboxSettings.workingHours.daysOfWeek -join ',')"
                        } else { $null }
                        
                        # Auto-Reply Settings
                        AutoReplyStatus = if ($mailboxSettings -and $mailboxSettings.automaticRepliesSetting) {
                            $mailboxSettings.automaticRepliesSetting.status
                        } else { $null }
                        AutoReplyStartTime = if ($mailboxSettings -and $mailboxSettings.automaticRepliesSetting) {
                            $mailboxSettings.automaticRepliesSetting.scheduledStartDateTime.dateTime
                        } else { $null }
                        AutoReplyEndTime = if ($mailboxSettings -and $mailboxSettings.automaticRepliesSetting) {
                            $mailboxSettings.automaticRepliesSetting.scheduledEndDateTime.dateTime
                        } else { $null }
                        
                        # Folder Statistics
                        InboxItemCount = $folderStats.InboxCount
                        SentItemCount = $folderStats.SentCount
                        DraftsItemCount = $folderStats.DraftsCount
                        DeletedItemCount = $folderStats.DeletedCount
                        TotalFolderCount = $folderStats.TotalFolders
                        
                        # Permissions and Delegation
                        CalendarPermissions = ($calendarPermissions -join ';')
                        
                        # Hybrid Information
                        OnPremisesDistinguishedName = $user.onPremisesDistinguishedName
                        OnPremisesDomainName = $null # Not directly exposed on Graph user; placeholder
                        OnPremisesImmutableId = $user.onPremisesImmutableId
                        OnPremisesLastSyncDateTime = $user.onPremisesLastSyncDateTime
                        OnPremisesSamAccountName = $user.onPremisesSamAccountName
                        OnPremisesSecurityIdentifier = $user.onPremisesSecurityIdentifier
                        OnPremisesSyncEnabled = $user.onPremisesSyncEnabled
                        OnPremisesUserPrincipalName = $user.onPremisesUserPrincipalName
                        
                        # Location and Licensing
                        PreferredDataLocation = $user.preferredDataLocation
                        UsageLocation = $user.usageLocation
                        AssignedLicenses = ($user.assignedLicenses | ForEach-Object { $_.skuId }) -join ';'
                        AssignedPlans = ($user.assignedPlans | Where-Object { $_.capabilityStatus -eq 'Enabled' } | ForEach-Object { $_.service }) -join ';'
                        
                        # Management
                        ManagerId = $managerId
                        
                        # Classification
                        RecipientType = "UserMailbox"
                        RecipientTypeDetails = if ($user.accountEnabled) { "UserMailbox" } else { "DisabledUserMailbox" }
                        _DataType = "Mailbox"
                    }
                    
                    $null = $allDiscoveredData.Add($mailboxObj)
                    $totalMailboxes++
                }
                
                $nextLink = $response.'@odata.nextLink'
                
                # Progress update
                if ($totalMailboxes % 100 -eq 0) {
                    Write-ModuleLog -ModuleName "Exchange" -Message "Processed $totalMailboxes mailboxes..." -Level "PROGRESS"
                }
            }
            
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $totalMailboxes mailboxes" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover mailboxes: $($_.Exception.Message)", $_.Exception, @{Section="Mailboxes"})
        }
        
        # Discover all types of mail-enabled groups with enhanced details
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering all mail-enabled groups..." -Level "INFO"
            
            # Get all mail-enabled groups in one optimized query
            $groupUri = "https://graph.microsoft.com/v1.0/groups?`$filter=mailEnabled eq true&`$select=id,displayName,mail,mailNickname,description,visibility,createdDateTime,renewedDateTime,expirationDateTime,isAssignableToRole,membershipRule,membershipRuleProcessingState,groupTypes,mailEnabled,securityEnabled,onPremisesSyncEnabled,onPremisesLastSyncDateTime,onPremisesSamAccountName,onPremisesSecurityIdentifier,proxyAddresses,resourceProvisioningOptions,classification,organizationId&`$top=$batchSize"
            
            $groupStats = @{
                Distribution = 0
                Security = 0
                Microsoft365 = 0
                Dynamic = 0
            }
            
            $nextLink = $groupUri
            while ($nextLink) {
                $response = Invoke-GraphWithRetry -Uri $nextLink
                
                foreach ($group in $response.value) {
                    # Determine group type and classification
                    $groupType = "Distribution"
                    $recipientTypeDetails = "MailUniversalDistributionGroup"
                    
                    if ($group.groupTypes -contains 'Unified') {
                        $groupType = "Microsoft365"
                        $recipientTypeDetails = "GroupMailbox"
                        $groupStats.Microsoft365++
                    } elseif ($group.mailEnabled -and $group.securityEnabled) {
                        $groupType = "MailEnabledSecurity"
                        $recipientTypeDetails = "MailUniversalSecurityGroup"
                        $groupStats.Security++
                    } elseif ($group.mailEnabled -and -not $group.securityEnabled) {
                        $groupType = "Distribution"
                        $recipientTypeDetails = "MailUniversalDistributionGroup"
                        $groupStats.Distribution++
                    }
                    
                    if ($group.membershipRule) {
                        $groupType = "Dynamic" + $groupType
                        $groupStats.Dynamic++
                    }
                    
                    # Get member count with retry logic
                    $memberCount = 0
                    try {
                        $memberCountUri = "https://graph.microsoft.com/v1.0/groups/$($group.id)/members/`$count"
                        $memberCountResponse = Invoke-GraphWithRetry -Uri $memberCountUri -Headers @{ 'ConsistencyLevel' = 'eventual' }
                        $memberCount = $memberCountResponse
                    } catch {
                        Write-ModuleLog -ModuleName "Exchange" -Message "Could not get member count for group $($group.displayName): $_" -Level "DEBUG"
                    }
                    
                    # Get owner information
                    $owners = @()
                    try {
                        $ownersUri = "https://graph.microsoft.com/v1.0/groups/$($group.id)/owners?`$select=id,displayName,userPrincipalName"
                        $ownersResponse = Invoke-GraphWithRetry -Uri $ownersUri
                        $owners = $ownersResponse.value | ForEach-Object {
                            if ($_.userPrincipalName) { $_.userPrincipalName } else { $_.displayName }
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "Exchange" -Message "Could not get owners for group $($group.displayName): $_" -Level "DEBUG"
                    }
                    
                    # Build enhanced group object
                    $groupObj = [PSCustomObject]@{
                        # Identity
                        Id = $group.id
                        DisplayName = $group.displayName
                        PrimarySmtpAddress = $group.mail
                        Alias = $group.mailNickname
                        Description = $group.description
                        
                        # Group Type Information
                        GroupType = $groupType
                        RecipientType = if ($group.groupTypes -contains 'Unified') { "GroupMailbox" } else { "MailUniversalDistributionGroup" }
                        RecipientTypeDetails = $recipientTypeDetails
                        MailEnabled = $group.mailEnabled
                        SecurityEnabled = $group.securityEnabled
                        GroupTypes = ($group.groupTypes -join ';')
                        
                        # Membership
                        MemberCount = $memberCount
                        Owners = ($owners -join ';')
                        OwnerCount = $owners.Count
                        MembershipRule = $group.membershipRule
                        MembershipRuleProcessingState = $group.membershipRuleProcessingState
                        IsDynamicGroup = if ($group.membershipRule) { $true } else { $false }
                        
                        # Configuration
                        Visibility = $group.visibility
                        Classification = $group.classification
                        IsAssignableToRole = $group.isAssignableToRole
                        ProxyAddresses = ($group.proxyAddresses -join ';')
                        ResourceProvisioningOptions = ($group.resourceProvisioningOptions -join ';')
                        
                        # Lifecycle
                        CreatedDateTime = $group.createdDateTime
                        RenewedDateTime = $group.renewedDateTime
                        ExpirationDateTime = $group.expirationDateTime
                        
                        # Hybrid Information
                        OnPremisesSyncEnabled = $group.onPremisesSyncEnabled
                        OnPremisesLastSyncDateTime = $group.onPremisesLastSyncDateTime
                        OnPremisesSamAccountName = $group.onPremisesSamAccountName
                        OnPremisesSecurityIdentifier = $group.onPremisesSecurityIdentifier
                        
                        # Additional Metadata
                        OrganizationId = $group.organizationId
                        
                        _DataType = "DistributionGroup"
                    }
                    
                    $null = $allDiscoveredData.Add($groupObj)
                }
                
                $nextLink = $response.'@odata.nextLink'
            }
            
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovered groups by type:" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Distribution Lists: $($groupStats.Distribution)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Mail-Enabled Security: $($groupStats.Security)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Microsoft 365 Groups: $($groupStats.Microsoft365)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Dynamic Groups: $($groupStats.Dynamic)" -Level "INFO"
            
        } catch {
            $Result.AddError("Failed to discover groups: $($_.Exception.Message)", $_.Exception, @{Section="Groups"})
        }
        
        # Discover Shared Mailboxes
        if ($Configuration.exchangeOnline.includeSharedMailboxes) {
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering shared mailboxes..." -Level "INFO"
                
                # Note: Shared mailboxes are typically disabled users with mail - using beta endpoint for consistency
                $sharedMailboxUri = "https://graph.microsoft.com/beta/users?`$filter=accountEnabled eq false and mail ne null&`$select=$($userSelectFields -join ',')&`$top=$batchSize"
                
                $nextLink = $sharedMailboxUri
                while ($nextLink) {
                    $response = Invoke-GraphWithRetry -Uri $nextLink
                    
                    foreach ($sharedMbx in $response.value) {
                        $sharedObj = [PSCustomObject]@{
                            Id = $sharedMbx.id
                            DisplayName = $sharedMbx.displayName
                            PrimarySmtpAddress = $sharedMbx.mail
                            Alias = $sharedMbx.mailNickname
                            CreatedDateTime = $sharedMbx.createdDateTime
                            RecipientType = "SharedMailbox"
                            RecipientTypeDetails = "SharedMailbox"
                            AccountEnabled = $sharedMbx.accountEnabled
                            ProxyAddresses = ($sharedMbx.proxyAddresses -join ';')
                            Department = $sharedMbx.department
                            _DataType = "SharedMailbox"
                        }
                        
                        $null = $allDiscoveredData.Add($sharedObj)
                    }
                    
                    $nextLink = $response.'@odata.nextLink'
                }
                
            } catch {
                $Result.AddWarning("Failed to discover shared mailboxes: $($_.Exception.Message)", @{Section="SharedMailboxes"})
            }
        }
        
        # Discover Resource Mailboxes (Rooms and Equipment)
        if ($Configuration.exchangeOnline.includeResourceMailboxes) {
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering resource mailboxes..." -Level "INFO"
                
                # Discover rooms
                $roomUri = "https://graph.microsoft.com/v1.0/places/microsoft.graph.room?`$top=$batchSize"
                $nextLink = $roomUri
                
                while ($nextLink) {
                    $response = Invoke-GraphWithRetry -Uri $nextLink
                    
                    foreach ($room in $response.value) {
                        $roomObj = [PSCustomObject]@{
                            Id = $room.id
                            DisplayName = $room.displayName
                            EmailAddress = $room.emailAddress
                            Nickname = $room.nickname
                            Building = $room.building
                            Floor = if ($room.floor) { $room.floor } else { $null }
                            Capacity = $room.capacity
                            Label = $room.label
                            BookingType = $room.bookingType
                            AudioDeviceName = $room.audioDeviceName
                            VideoDeviceName = $room.videoDeviceName
                            DisplayDeviceName = $room.displayDeviceName
                            IsWheelChairAccessible = $room.isWheelChairAccessible
                            Tags = ($room.tags -join ';')
                            Address = if ($room.address) {
                                "$($room.address.street), $($room.address.city), $($room.address.state) $($room.address.postalCode)"
                            } else { $null }
                            GeoCoordinates = if ($room.geoCoordinates) {
                                "Lat:$($room.geoCoordinates.latitude),Lon:$($room.geoCoordinates.longitude)"
                            } else { $null }
                            Phone = $room.phone
                            RecipientType = "RoomMailbox"
                            RecipientTypeDetails = "RoomMailbox"
                            _DataType = "ResourceMailbox"
                        }
                        
                        $null = $allDiscoveredData.Add($roomObj)
                    }
                    
                    $nextLink = $response.'@odata.nextLink'
                }
                
            } catch {
                $Result.AddWarning("Failed to discover resource mailboxes: $($_.Exception.Message)", @{Section="ResourceMailboxes"})
            }
        }
        
        # Discover Mail Contacts
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering mail contacts..." -Level "INFO"
            
            $contactUri = "https://graph.microsoft.com/v1.0/contacts?`$select=id,displayName,emailAddresses,givenName,surname,companyName,department,jobTitle,businessPhones,mobilePhone,businessAddress&`$top=$batchSize"
            
            $nextLink = $contactUri
            while ($nextLink) {
                $response = Invoke-GraphWithRetry -Uri $nextLink
                
                foreach ($contact in $response.value) {
                    $primaryEmail = $contact.emailAddresses | Where-Object { $_.name -eq "EmailAddress1" } | Select-Object -First 1
                    
                    $contactObj = [PSCustomObject]@{
                        Id = $contact.id
                        DisplayName = $contact.displayName
                        EmailAddress = if ($primaryEmail) { $primaryEmail.address } else { $null }
                        GivenName = $contact.givenName
                        Surname = $contact.surname
                        CompanyName = $contact.companyName
                        Department = $contact.department
                        JobTitle = $contact.jobTitle
                        BusinessPhones = ($contact.businessPhones -join ';')
                        MobilePhone = $contact.mobilePhone
                        BusinessAddress = if ($contact.businessAddress) {
                            "$($contact.businessAddress.street), $($contact.businessAddress.city), $($contact.businessAddress.state) $($contact.businessAddress.postalCode)"
                        } else { $null }
                        RecipientType = "MailContact"
                        RecipientTypeDetails = "MailContact"
                        _DataType = "MailContact"
                    }
                    
                    $null = $allDiscoveredData.Add($contactObj)
                }
                
                $nextLink = $response.'@odata.nextLink'
            }
            
        } catch {
            $Result.AddWarning("Failed to discover mail contacts: $($_.Exception.Message)", @{Section="MailContacts"})
        }

        # Data Validation and Quality Checks
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "Exchange" -Message "Performing data validation and quality checks..." -Level "INFO"
            
            # Validate data completeness
            $validationResults = @{
                TotalRecords = $allDiscoveredData.Count
                ValidRecords = 0
                InvalidRecords = 0
                MissingCriticalData = 0
                DuplicateRecords = 0
                CrossReferenceIssues = 0
            }
            
            $processedIds = @{}
            $managerIds = @{}
            
            foreach ($record in $allDiscoveredData) {
                $isValid = $true
                
                # Check for critical field presence
                if (-not $record.Id -or -not $record.DisplayName) {
                    $validationResults.MissingCriticalData++
                    $isValid = $false
                }
                
                # Check for duplicates
                if ($processedIds.ContainsKey($record.Id)) {
                    $validationResults.DuplicateRecords++
                    $isValid = $false
                } else {
                    $processedIds[$record.Id] = $true
                }
                
                # Track manager relationships for cross-referencing
                if ($record.ManagerId) {
                    $managerIds[$record.Id] = $record.ManagerId
                }
                
                if ($isValid) {
                    $validationResults.ValidRecords++
                } else {
                    $validationResults.InvalidRecords++
                }
            }
            
            # Cross-reference validation
            foreach ($id in $managerIds.Keys) {
                if (-not $processedIds.ContainsKey($managerIds[$id])) {
                    $validationResults.CrossReferenceIssues++
                }
            }
            
            # Log validation results
            Write-ModuleLog -ModuleName "Exchange" -Message "Data Validation Complete:" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Total Records: $($validationResults.TotalRecords)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Valid Records: $($validationResults.ValidRecords)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Invalid Records: $($validationResults.InvalidRecords)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Missing Critical Data: $($validationResults.MissingCriticalData)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Duplicate Records: $($validationResults.DuplicateRecords)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Cross-Reference Issues: $($validationResults.CrossReferenceIssues)" -Level "INFO"
            
            if ($validationResults.InvalidRecords -gt 0) {
                Write-ModuleLog -ModuleName "Exchange" -Message "Data quality issues detected - see validation report" -Level "WARN"
            }
        }
        
        # Export enhanced data with cross-referencing
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "Exchange" -Message "Exporting $($allDiscoveredData.Count) records..." -Level "INFO"
            
            # Group by type and export with enhanced file naming
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $fileName = switch ($group.Name) {
                    'Mailbox' { 'ExchangeMailboxes.csv' }
                    'SharedMailbox' { 'ExchangeSharedMailboxes.csv' }
                    'ResourceMailbox' { 'ExchangeResourceMailboxes.csv' }
                    'DistributionGroup' { 'ExchangeDistributionGroups.csv' }
                    'MailContact' { 'ExchangeMailContacts.csv' }
                    default { "Exchange_$($group.Name).csv" }
                }
                
                Export-DiscoveryResults -Data $group.Group `
                    -FileName $fileName `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "Exchange" `
                    -SessionId $SessionId
            }
            
            # Create comprehensive summary report
            $summaryData = @{
                TotalMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' }).Count
                SharedMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SharedMailbox' }).Count
                ResourceMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'ResourceMailbox' }).Count
                DistributionGroups = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' }).Count
                MailContacts = ($allDiscoveredData | Where-Object { $_._DataType -eq 'MailContact' }).Count
                TotalRecords = $allDiscoveredData.Count
                EnabledMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and $_.AccountEnabled }).Count
                DisabledMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and -not $_.AccountEnabled }).Count
                HybridUsers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and $_.OnPremisesSyncEnabled }).Count
                CloudOnlyUsers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and -not $_.OnPremisesSyncEnabled }).Count
                DynamicGroups = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' -and $_.IsDynamicGroup }).Count
                Microsoft365Groups = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' -and $_.GroupType -eq 'Microsoft365' }).Count
                DiscoveryDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                SessionId = $SessionId
                ValidationResults = $validationResults
            }
            
            # Export summary as JSON
            $summaryData | ConvertTo-Json -Depth 3 | Out-File (Join-Path $Context.Paths.RawDataOutput "ExchangeDiscoverySummary.json") -Encoding UTF8
            
            # Create cross-reference mapping file
            $crossReferenceData = @()
            foreach ($record in $allDiscoveredData) {
                if ($record.ManagerId -and $record._DataType -eq 'Mailbox') {
                    $crossReferenceData += [PSCustomObject]@{
                        SourceId = $record.Id
                        SourceType = 'User'
                        SourceDisplayName = $record.DisplayName
                        TargetId = $record.ManagerId
                        TargetType = 'User'
                        RelationshipType = 'Manager'
                        _DataType = 'CrossReference'
                    }
                }
            }
            
            if ($crossReferenceData.Count -gt 0) {
                Export-DiscoveryResults -Data $crossReferenceData `
                    -FileName "ExchangeCrossReferences.csv" `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "Exchange" `
                    -SessionId $SessionId
            }
            
        } else {
            Write-ModuleLog -ModuleName "Exchange" -Message "No data discovered to export" -Level "WARN"
        }
        
        return $allDiscoveredData
    }

    # Initialize result object
    $result = [PSCustomObject]@{
        Success = $false
        ModuleName = "Exchange"
        Data = $null
        RecordCount = 0
        Errors = @()
        Warnings = @()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
    }

    # Add helper methods to result object
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($Message, $Exception = $null, $Context = @{})
        $errorObj = @{
            Message = $Message
            ExceptionType = if ($Exception) { $Exception.GetType().FullName } else { $null }
            StackTrace = if ($Exception) { $Exception.StackTrace } else { $null }
            Timestamp = Get-Date
            Context = $Context
            InnerException = if ($Exception -and $Exception.InnerException) { $Exception.InnerException.Message } else { $null }
            Exception = $Exception
        }
        $this.Errors += $errorObj
    }

    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($Message, $Context = @{})
        $this.Warnings += @{
            Message = $Message
            Timestamp = Get-Date
            Context = $Context
        }
    }

    try {
        # Execute discovery script directly (Graph is already connected by Start-)
        Write-ModuleLog -ModuleName "Exchange" -Message "Starting Exchange discovery..." -Level "INFO"

        # Note: Graph connection is already established by Start-ExchangeDiscovery
        # We just need to execute the discovery logic directly
        $discoveryData = & $discoveryScript -Configuration $Configuration -Context $Context -SessionId $SessionId -Connections @{Graph=$true} -Result $result

        $result.Data = $discoveryData
        $result.RecordCount = if ($discoveryData) { $discoveryData.Count } else { 0 }
        $result.Success = $true

        Write-ModuleLog -ModuleName "Exchange" -Message "Discovery completed successfully. Found $($result.RecordCount) records." -Level "SUCCESS"

    } catch {
        $result.Success = $false
        $result.AddError("Discovery failed: $($_.Exception.Message)", $_.Exception, @{})
        Write-ModuleLog -ModuleName "Exchange" -Message "Discovery failed: $($_.Exception.Message)" -Level "ERROR"
    } finally {
        $result.EndTime = Get-Date
    }

    return $result
}

function Start-ExchangeDiscovery {
    <#
    .SYNOPSIS
        Entry point for Exchange Discovery called by the GUI/PowerShellService
    .DESCRIPTION
        Standalone discovery function that connects directly using provided credentials
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$CompanyName,

        [Parameter(Mandatory=$false)]
        [string]$TenantId,

        [Parameter(Mandatory=$false)]
        [string]$ClientId,

        [Parameter(Mandatory=$false)]
        [string]$ClientSecret,

        [Parameter(Mandatory=$false)]
        [string]$OutputPath,

        [Parameter(Mandatory=$false)]
        [hashtable]$AdditionalParams = @{}
    )

    Write-Information "[ExchangeDiscovery] Starting Exchange discovery for $CompanyName..." -InformationAction Continue
    Write-Information "[ExchangeDiscovery] Tenant ID: $TenantId" -InformationAction Continue
    Write-Information "[ExchangeDiscovery] Client ID: $ClientId" -InformationAction Continue

    # Pre-flight validation
    if (-not $TenantId) {
        throw "TenantId is required for Exchange discovery"
    }
    if (-not $ClientId) {
        throw "ClientId is required for Exchange discovery"
    }
    if (-not $ClientSecret) {
        throw "ClientSecret is required for Exchange discovery"
    }

    # Initialize result
    $result = [PSCustomObject]@{
        Success = $false
        RecordCount = 0
        Errors = @()
        Warnings = @()
        Metadata = @{}
        Data = $null
        TotalItems = 0
        OutputPath = $OutputPath
        StartTime = Get-Date
        EndTime = $null
        Duration = $null
    }

    try {
        # Ensure output paths exist
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }

        $logsPath = Join-Path (Split-Path $OutputPath -Parent) "Logs"
        if (-not (Test-Path $logsPath)) {
            New-Item -Path $logsPath -ItemType Directory -Force | Out-Null
        }

        # Test and install Microsoft.Graph module if needed
        Write-Information "[ExchangeDiscovery] Checking for Microsoft.Graph module..." -InformationAction Continue
        if (-not (Get-Module -ListAvailable -Name Microsoft.Graph.Authentication)) {
            Write-Information "[ExchangeDiscovery] Installing Microsoft.Graph module..." -InformationAction Continue
            Install-Module -Name Microsoft.Graph -Force -AllowClobber -Scope CurrentUser -Repository PSGallery
        }

        # Import Microsoft.Graph modules
        Import-Module Microsoft.Graph.Authentication -Force

        # Connect to Microsoft Graph
        Write-Information "[ExchangeDiscovery] Connecting to Microsoft Graph..." -InformationAction Continue

        if ($ClientId -and $ClientSecret -and $TenantId) {
            $secureSecret = ConvertTo-SecureString $ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($ClientId, $secureSecret)
            Connect-MgGraph -TenantId $TenantId -ClientSecretCredential $credential -NoWelcome
            Write-Information "[ExchangeDiscovery] Connected to Microsoft Graph successfully" -InformationAction Continue
        } else {
            Write-Information "[ExchangeDiscovery] Using interactive authentication..." -InformationAction Continue
            Connect-MgGraph -TenantId $TenantId -Scopes "User.Read.All","Group.Read.All","Directory.Read.All","Mail.Read" -NoWelcome
            Write-Information "[ExchangeDiscovery] Connected to Microsoft Graph successfully" -InformationAction Continue
        }

        # Generate session ID for output files
        $sessionId = [guid]::NewGuid().ToString()

        # Build configuration for the discovery script
        $config = @{
            CompanyName = $CompanyName
            TenantId = $TenantId
            ClientId = $ClientId
            ClientSecret = $ClientSecret
        }

        foreach ($key in $AdditionalParams.Keys) {
            $config[$key] = $AdditionalParams[$key]
        }

        $context = @{
            Paths = @{
                RawDataOutput = $OutputPath
                Logs = $logsPath
            }
            CompanyName = $CompanyName
        }

        # Call Invoke-ExchangeDiscovery with proper setup
        $discoveryResult = Invoke-ExchangeDiscovery -Configuration $config -Context $context -SessionId $sessionId | Select-Object -Last 1

        # Disconnect
        Disconnect-MgGraph | Out-Null

        # ✅ TRANSFORM DATA FOR FRONTEND
        # The frontend TypeScript interface expects structured properties, not a flat array
        if ($discoveryResult -and $discoveryResult.Success) {
            Write-Information "[ExchangeDiscovery] Transforming data structure for frontend..." -InformationAction Continue

            $allData = $discoveryResult.Data

            # Group by _DataType and map to TypeScript property names
            # Property names MUST match src/renderer/types/models/exchange.ts (ExchangeDiscoveryResult interface)
            $structuredData = @{
                mailboxes = @($allData | Where-Object {
                    $_._DataType -eq 'Mailbox' -or $_._DataType -eq 'SharedMailbox'
                })
                distributionGroups = @($allData | Where-Object {
                    $_._DataType -eq 'DistributionGroup'
                })
                transportRules = @($allData | Where-Object {
                    $_._DataType -eq 'TransportRule'
                })
                connectors = @($allData | Where-Object {
                    $_._DataType -eq 'Connector'
                })
                publicFolders = @($allData | Where-Object {
                    $_._DataType -eq 'PublicFolder'
                })
                mailContacts = @($allData | Where-Object {
                    $_._DataType -eq 'MailContact'
                })
            }

            # Calculate statistics for frontend
            $totalMailboxSize = ($structuredData.mailboxes | Where-Object { $_.TotalItemSize -ne $null } |
                               Measure-Object -Property TotalItemSize -Sum).Sum
            if (-not $totalMailboxSize) { $totalMailboxSize = 0 }

            $avgMailboxSize = if ($structuredData.mailboxes.Count -gt 0) {
                ($structuredData.mailboxes | Where-Object { $_.TotalItemSize -ne $null } |
                 Measure-Object -Property TotalItemSize -Average).Average
            } else { 0 }
            if (-not $avgMailboxSize) { $avgMailboxSize = 0 }

            $sharedMailboxCount = ($structuredData.mailboxes | Where-Object {
                $_.RecipientTypeDetails -eq 'SharedMailbox'
            }).Count

            $securityGroupCount = ($structuredData.distributionGroups | Where-Object {
                $_.GroupType -eq 'Security'
            }).Count

            $statistics = @{
                totalMailboxes = $structuredData.mailboxes.Count
                totalMailboxSize = $totalMailboxSize
                averageMailboxSize = $avgMailboxSize
                totalArchiveSize = 0
                inactiveMailboxes = 0
                sharedMailboxes = $sharedMailboxCount
                roomMailboxes = 0
                totalDistributionGroups = $structuredData.distributionGroups.Count
                securityGroups = $securityGroupCount
                totalTransportRules = $structuredData.transportRules.Count
                enabledRules = 0
                disabledRules = 0
                totalConnectors = $structuredData.connectors.Count
                sendConnectors = 0
                receiveConnectors = 0
                totalPublicFolders = $structuredData.publicFolders.Count
                mailEnabledFolders = 0
            }

            # Build result matching TypeScript interface (ExchangeDiscoveryResult)
            $result = [PSCustomObject]@{
                id = [guid]::NewGuid().ToString()
                startTime = $discoveryResult.StartTime
                endTime = $discoveryResult.EndTime
                status = 'completed'

                # Structured data properties (MUST match TypeScript interface)
                mailboxes = $structuredData.mailboxes
                distributionGroups = $structuredData.distributionGroups
                transportRules = $structuredData.transportRules
                connectors = $structuredData.connectors
                publicFolders = $structuredData.publicFolders

                # Statistics
                statistics = $statistics

                # Errors/warnings
                errors = if ($discoveryResult.Errors) { $discoveryResult.Errors } else { @() }
                warnings = if ($discoveryResult.Warnings) { $discoveryResult.Warnings } else { @() }

                # Legacy fields for backward compatibility
                Success = $discoveryResult.Success
                RecordCount = $discoveryResult.RecordCount
                Data = $allData  # Keep flat array for backward compatibility
            }

            Write-Information "[ExchangeDiscovery] Data transformation complete:" -InformationAction Continue
            Write-Information "[ExchangeDiscovery]   - Mailboxes: $($structuredData.mailboxes.Count)" -InformationAction Continue
            Write-Information "[ExchangeDiscovery]   - Distribution Groups: $($structuredData.distributionGroups.Count)" -InformationAction Continue
            Write-Information "[ExchangeDiscovery]   - Transport Rules: $($structuredData.transportRules.Count)" -InformationAction Continue
            Write-Information "[ExchangeDiscovery]   - Total Storage: $totalMailboxSize bytes" -InformationAction Continue

            return $result
        }

        # If discovery failed or no data, return original result
        return $discoveryResult

    } catch {
        Write-Error "[ExchangeDiscovery] ERROR: $($_.Exception.Message)"
        $result.Errors += @{
            Message = $_.Exception.Message
            Exception = $_
        }
        $result.EndTime = Get-Date
        $duration = $result.EndTime - $result.StartTime
        $result | Add-Member -MemberType NoteProperty -Name "Duration" -Value $duration -Force
        return $result
    }
}

# --- Module Export ---
Export-ModuleMember -Function Start-ExchangeDiscovery, Invoke-ExchangeDiscovery
