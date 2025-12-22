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

# --- Multi-Strategy Authentication Function ---

function Connect-MgGraphWithMultipleStrategies {
    <#
    .SYNOPSIS
        Connects to Microsoft Graph using multiple authentication strategies with automatic fallback
    .DESCRIPTION
        Attempts to authenticate to Microsoft Graph using 4 different strategies in order:
        1. Client Secret Credential (preferred for automation)
        2. Certificate-Based Authentication (secure, headless)
        3. Device Code Flow (headless-friendly interactive)
        4. Interactive Browser (GUI required - last resort)
    .PARAMETER Configuration
        Configuration hashtable containing TenantId, ClientId, ClientSecret, and/or CertificateThumbprint
    .OUTPUTS
        Microsoft.Graph.PowerShell.Authentication.Models.GraphContext or $null if all strategies fail
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Attempting Microsoft Graph authentication with multiple strategies..." -Level "INFO"

    # Define Exchange-specific scopes
    $exchangeScopes = @(
        "Mail.Read",
        "Mail.ReadBasic.All",
        "MailboxSettings.Read",
        "Group.Read.All",
        "Directory.Read.All",
        "User.Read.All",
        "Organization.Read.All"
    )

    # Strategy 1: Client Secret Credential (preferred for automation)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 1: Attempting Client Secret authentication..." -Level "INFO"

            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)

            Connect-MgGraph -ClientSecretCredential $credential -TenantId $Configuration.TenantId -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 1: Client Secret authentication successful" -Level "SUCCESS"
                Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Connected to tenant: $($context.TenantId), Scopes: $($context.Scopes -join ', ')" -Level "DEBUG"
                return $context
            }
        } catch {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 1: Client Secret auth failed: $($_.Exception.Message)" -Level "WARN"
        }
    }

    # Strategy 2: Certificate-Based Authentication (secure, headless)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.CertificateThumbprint) {
        try {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 2: Attempting Certificate authentication..." -Level "INFO"

            Connect-MgGraph -ClientId $Configuration.ClientId -TenantId $Configuration.TenantId -CertificateThumbprint $Configuration.CertificateThumbprint -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 2: Certificate authentication successful" -Level "SUCCESS"
                Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Connected to tenant: $($context.TenantId)" -Level "DEBUG"
                return $context
            }
        } catch {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 2: Certificate auth failed: $($_.Exception.Message)" -Level "WARN"
        }
    }

    # Strategy 3: Device Code Flow (headless-friendly interactive)
    if ($Configuration.TenantId) {
        try {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 3: Attempting Device Code authentication..." -Level "INFO"

            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $exchangeScopes -UseDeviceCode -NoWelcome -ErrorAction Stop

            # Verify connection
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 3: Device Code authentication successful" -Level "SUCCESS"
                Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Connected to tenant: $($context.TenantId)" -Level "DEBUG"
                return $context
            }
        } catch {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 3: Device Code auth failed: $($_.Exception.Message)" -Level "WARN"
        }
    }

    # Strategy 4: Interactive Browser Authentication (GUI required - last resort)
    try {
        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 4: Attempting Interactive authentication..." -Level "INFO"

        if ($Configuration.TenantId) {
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $exchangeScopes -NoWelcome -ErrorAction Stop
        } else {
            Connect-MgGraph -Scopes $exchangeScopes -NoWelcome -ErrorAction Stop
        }

        # Verify connection
        $context = Get-MgContext
        if ($context -and $context.TenantId) {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 4: Interactive authentication successful" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Connected to tenant: $($context.TenantId)" -Level "DEBUG"
            return $context
        }
    } catch {
        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Strategy 4: Interactive auth failed: $($_.Exception.Message)" -Level "ERROR"
    }

    Write-ModuleLog -ModuleName "ExchangeAuth" -Message "All Microsoft Graph authentication strategies exhausted" -Level "ERROR"
    return $null
}

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

    Write-ModuleLog -ModuleName "Exchange" -Message "=== Exchange Discovery Module Starting ===" -Level "HEADER"

    # CREDENTIAL VALIDATION AND EXTRACTION
    Write-ModuleLog -ModuleName "Exchange" -Message "Extracting and validating credentials from Configuration..." -Level "INFO"

    $TenantId = $Configuration.TenantId
    $ClientId = $Configuration.ClientId
    $ClientSecret = $Configuration.ClientSecret

    # Log credential presence for debugging
    Write-ModuleLog -ModuleName "Exchange" -Message "Credential validation check:" -Level "DEBUG"
    Write-ModuleLog -ModuleName "Exchange" -Message "  TenantId present: $([bool]$TenantId)" -Level "DEBUG"
    Write-ModuleLog -ModuleName "Exchange" -Message "  ClientId present: $([bool]$ClientId)" -Level "DEBUG"
    Write-ModuleLog -ModuleName "Exchange" -Message "  ClientSecret present: $([bool]$ClientSecret)" -Level "DEBUG"

    if (-not $TenantId -or -not $ClientId -or -not $ClientSecret) {
        $errorMsg = "Missing required credentials in Configuration. TenantId, ClientId, and ClientSecret are required."
        Write-ModuleLog -ModuleName "Exchange" -Message $errorMsg -Level "ERROR"

        $tenantStatus = if ($TenantId) { 'Present' } else { 'MISSING' }
        $clientStatus = if ($ClientId) { 'Present' } else { 'MISSING' }
        $secretStatus = if ($ClientSecret) { 'Present' } else { 'MISSING' }
        Write-ModuleLog -ModuleName "Exchange" -Message "TenantId: $tenantStatus, ClientId: $clientStatus, ClientSecret: $secretStatus" -Level "ERROR"

        $result = [PSCustomObject]@{
            Success = $false
            Message = $errorMsg
            Data = @()
            Errors = @($errorMsg)
            Warnings = @()
        }
        return $result
    }

    # Mask credentials for secure logging
    $maskedTenantId = if ($TenantId.Length -gt 8) { $TenantId.Substring(0,8) + "..." } else { "***" }
    $maskedClientId = if ($ClientId.Length -gt 8) { $ClientId.Substring(0,8) + "..." } else { "***" }
    $maskedSecret = "***" + $ClientSecret.Substring([Math]::Max(0, $ClientSecret.Length - 4))

    Write-ModuleLog -ModuleName "Exchange" -Message "Credentials validated successfully" -Level "SUCCESS"
    Write-ModuleLog -ModuleName "Exchange" -Message "  Tenant ID: $maskedTenantId" -Level "INFO"
    Write-ModuleLog -ModuleName "Exchange" -Message "  Client ID: $maskedClientId" -Level "INFO"
    Write-ModuleLog -ModuleName "Exchange" -Message "  Client Secret: $maskedSecret" -Level "DEBUG"

    # MICROSOFT GRAPH AUTHENTICATION
    Write-ModuleLog -ModuleName "Exchange" -Message "Establishing Microsoft Graph connection..." -Level "INFO"

    try {
        # Use multi-strategy authentication
        $mgContext = Connect-MgGraphWithMultipleStrategies -Configuration $Configuration

        if (-not $mgContext) {
            $errorMsg = "All Microsoft Graph authentication strategies failed"
            Write-ModuleLog -ModuleName "Exchange" -Message $errorMsg -Level "ERROR"

            $result = [PSCustomObject]@{
                Success = $false
                Message = $errorMsg
                Data = @()
                Errors = @($errorMsg)
                Warnings = @()
            }
            return $result
        }

        # Verify connection
        if ($mgContext -and $mgContext.TenantId) {
            Write-ModuleLog -ModuleName "Exchange" -Message "Successfully connected to Microsoft Graph" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Tenant ID: $($mgContext.TenantId)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  App Name: $($mgContext.AppName)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Scopes: $($mgContext.Scopes -join ', ')" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Auth Type: $($mgContext.AuthType)" -Level "INFO"
        } else {
            $errorMsg = "Microsoft Graph connection verification failed"
            Write-ModuleLog -ModuleName "Exchange" -Message $errorMsg -Level "ERROR"

            $result = [PSCustomObject]@{
                Success = $false
                Message = $errorMsg
                Data = @()
                Errors = @($errorMsg)
                Warnings = @()
            }
            return $result
        }

    } catch {
        $errorMsg = "Failed to connect to Microsoft Graph: $($_.Exception.Message)"
        Write-ModuleLog -ModuleName "Exchange" -Message $errorMsg -Level "ERROR"
        Write-ModuleLog -ModuleName "Exchange" -Message "Exception details: $($_.Exception.GetType().FullName)" -Level "DEBUG"
        Write-ModuleLog -ModuleName "Exchange" -Message "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"

        $result = [PSCustomObject]@{
            Success = $false
            Message = $errorMsg
            Data = @()
            Errors = @($errorMsg)
            Warnings = @()
        }
        return $result
    }

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
        Success = $true
        Message = "Exchange discovery completed successfully"
        Data = @()
        Errors = @()
        Warnings = @()
    }

    # Add helper methods for error/warning tracking
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($message, $exception, $context)
        $this.Success = $false
        $this.Errors += [PSCustomObject]@{
            Message = $message
            Exception = $exception
            Context = $context
            Timestamp = Get-Date
        }
        Write-ModuleLog -ModuleName "Exchange" -Message $message -Level "ERROR"
    }

    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message, $context)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Context = $context
            Timestamp = Get-Date
        }
        Write-ModuleLog -ModuleName "Exchange" -Message $message -Level "WARN"
    }

    # Execute discovery script
    try {
        Write-ModuleLog -ModuleName "Exchange" -Message "Executing discovery operations..." -Level "INFO"

        $discoveryParams = @{
            Configuration = $Configuration
            Context = $Context
            SessionId = $SessionId
            Connections = @{ Graph = $mgContext }
            Result = $result
        }

        $discoveryData = & $discoveryScript @discoveryParams
        $result.Data = $discoveryData

        if ($result.Success) {
            $recordCount = if ($discoveryData) { $discoveryData.Count } else { 0 }
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovery completed successfully with $recordCount records discovered" -Level "SUCCESS"
        }

    } catch {
        $result.AddError("Critical error during Exchange discovery: $($_.Exception.Message)", $_.Exception, @{ Phase = "Discovery Execution" })
        Write-ModuleLog -ModuleName "Exchange" -Message "Exception Type: $($_.Exception.GetType().FullName)" -Level "ERROR"
        Write-ModuleLog -ModuleName "Exchange" -Message "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
    } finally {
        # Disconnect from Graph
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Disconnecting from Microsoft Graph..." -Level "INFO"
            Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
            Write-ModuleLog -ModuleName "Exchange" -Message "Disconnected from Microsoft Graph" -Level "SUCCESS"
        } catch {
            Write-ModuleLog -ModuleName "Exchange" -Message "Error during Graph disconnect: $($_.Exception.Message)" -Level "WARN"
        }

        Write-ModuleLog -ModuleName "Exchange" -Message "=== Exchange Discovery Module Completed ===" -Level "HEADER"
    }

    return $result
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-ExchangeDiscovery
