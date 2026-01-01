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

# --- OAuth Token and Exchange Online PowerShell Functions ---

function Get-ExchangeOnlineAccessToken {
    <#
    .SYNOPSIS
        Gets OAuth 2.0 access token for Exchange Online using client credentials flow
    .DESCRIPTION
        Obtains an access token from Microsoft identity platform using client ID and secret.
        This token can be used with Connect-ExchangeOnline for app-only authentication.
    .PARAMETER TenantId
        Azure AD tenant ID
    .PARAMETER ClientId
        Application (client) ID from app registration
    .PARAMETER ClientSecret
        Client secret value
    .OUTPUTS
        String containing the access token, or $null on failure
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$TenantId,

        [Parameter(Mandatory=$true)]
        [string]$ClientId,

        [Parameter(Mandatory=$true)]
        [string]$ClientSecret
    )

    try {
        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Requesting OAuth access token for Exchange Online..." -Level "INFO"

        $tokenBody = @{
            grant_type    = "client_credentials"
            scope         = "https://outlook.office365.com/.default"
            client_id     = $ClientId
            client_secret = $ClientSecret
        }

        $tokenUrl = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token"

        $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST -Body $tokenBody -ErrorAction Stop

        if ($tokenResponse.access_token) {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Access token obtained successfully (expires in $($tokenResponse.expires_in) seconds)" -Level "SUCCESS"
            return $tokenResponse.access_token
        } else {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Token response did not contain access_token" -Level "ERROR"
            return $null
        }

    } catch {
        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Failed to obtain access token: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

function Connect-ExchangeOnlineWithToken {
    <#
    .SYNOPSIS
        Connects to Exchange Online PowerShell using an OAuth access token
    .DESCRIPTION
        Establishes connection to Exchange Online using app-only authentication with access token.
        Requires Exchange.ManageAsApp permission and Exchange Administrator role.
    .PARAMETER AccessToken
        OAuth 2.0 access token obtained from Get-ExchangeOnlineAccessToken
    .PARAMETER Organization
        Organization name (e.g., "contoso.onmicrosoft.com")
    .OUTPUTS
        Boolean indicating success or failure
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$AccessToken,

        [Parameter(Mandatory=$true)]
        [string]$Organization
    )

    try {
        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Connecting to Exchange Online PowerShell..." -Level "INFO"

        # Check if ExchangeOnlineManagement module is available
        if (-not (Get-Module -ListAvailable -Name ExchangeOnlineManagement)) {
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "ExchangeOnlineManagement module not found. Installing..." -Level "WARN"
            Install-Module -Name ExchangeOnlineManagement -Force -AllowClobber -Scope CurrentUser -ErrorAction Stop
            Write-ModuleLog -ModuleName "ExchangeAuth" -Message "ExchangeOnlineManagement module installed successfully" -Level "SUCCESS"
        }

        # Import module
        Import-Module ExchangeOnlineManagement -ErrorAction Stop

        # Connect using access token
        Connect-ExchangeOnline -AccessToken $AccessToken -Organization $Organization -ShowBanner:$false -ErrorAction Stop

        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Successfully connected to Exchange Online PowerShell" -Level "SUCCESS"
        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "  Organization: $Organization" -Level "INFO"

        return $true

    } catch {
        Write-ModuleLog -ModuleName "ExchangeAuth" -Message "Failed to connect to Exchange Online: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

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

        # EXCHANGE ONLINE POWERSHELL CONNECTION (for migration-critical data)
        Write-ModuleLog -ModuleName "Exchange" -Message "Establishing Exchange Online PowerShell connection..." -Level "INFO"

        # Get organization domain from tenant (try to derive from TenantId or use onmicrosoft.com)
        $organizationDomain = if ($Configuration.OrganizationDomain) {
            $Configuration.OrganizationDomain
        } else {
            # Try to get from Graph context or construct default
            try {
                $orgInfo = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/organization" -ErrorAction SilentlyContinue
                if ($orgInfo.value -and $orgInfo.value[0].verifiedDomains) {
                    $initialDomain = $orgInfo.value[0].verifiedDomains | Where-Object { $_.isInitial -eq $true } | Select-Object -First 1
                    if ($initialDomain) {
                        $initialDomain.name
                    } else {
                        $orgInfo.value[0].verifiedDomains[0].name
                    }
                } else {
                    $null
                }
            } catch {
                $null
            }
        }

        $exoConnected = $false
        if ($organizationDomain) {
            Write-ModuleLog -ModuleName "Exchange" -Message "Organization domain: $organizationDomain" -Level "INFO"

            # Get access token for Exchange Online
            $accessToken = Get-ExchangeOnlineAccessToken -TenantId $TenantId -ClientId $ClientId -ClientSecret $ClientSecret

            if ($accessToken) {
                # Connect to Exchange Online PowerShell
                $exoConnected = Connect-ExchangeOnlineWithToken -AccessToken $accessToken -Organization $organizationDomain

                if ($exoConnected) {
                    Write-ModuleLog -ModuleName "Exchange" -Message "Exchange Online PowerShell connection established successfully" -Level "SUCCESS"
                    Write-ModuleLog -ModuleName "Exchange" -Message "  Migration-critical cmdlets (Get-EXOMailboxStatistics, Get-EXOMailboxPermission, etc.) now available" -Level "INFO"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "Exchange Online PowerShell connection failed - continuing with Graph API only" -Level "WARN"
                    Write-ModuleLog -ModuleName "Exchange" -Message "  Migration data (permissions, forwarding, detailed stats) will be limited" -Level "WARN"
                }
            } else {
                Write-ModuleLog -ModuleName "Exchange" -Message "Failed to obtain access token for Exchange Online - continuing with Graph API only" -Level "WARN"
            }
        } else {
            Write-ModuleLog -ModuleName "Exchange" -Message "Could not determine organization domain - skipping Exchange Online PowerShell connection" -Level "WARN"
            Write-ModuleLog -ModuleName "Exchange" -Message "  To enable EXO cmdlets, add 'OrganizationDomain' to Configuration (e.g., 'contoso.onmicrosoft.com')" -Level "WARN"
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
        # Use config batch size if available, otherwise default to 100
        $batchSize = if ($Configuration.exchangeOnline.mailboxStatsBatchSize) { $Configuration.exchangeOnline.mailboxStatsBatchSize } else { 100 }
        $maxRetries = 3
        Write-ModuleLog -ModuleName "Exchange" -Message "Using batch size: $batchSize (from config)" -Level "DEBUG"
        
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

                    # Try to extract Retry-After header from response
                    $retryAfter = $null
                    if ($_.Exception.Response -and $_.Exception.Response.Headers) {
                        $retryAfterHeader = $_.Exception.Response.Headers | Where-Object { $_.Key -eq 'Retry-After' } | Select-Object -First 1
                        if ($retryAfterHeader) {
                            $retryAfter = [int]$retryAfterHeader.Value[0]
                        }
                    }

                    # Use Retry-After if provided, otherwise exponential backoff
                    $delay = if ($retryAfter) { $retryAfter } else { [Math]::Pow(2, $i) }
                    $errorMessage = $_.Exception.Message

                    # Handle specific throttling scenarios
                    if ($errorMessage -match "Too Many Requests" -or $errorMessage -match "TooManyRequests" -or $errorMessage -match "429") {
                        if (-not $retryAfter) { $delay = $delay * 2 }  # Extra delay only if Retry-After not provided
                        Write-ModuleLog -ModuleName "Exchange" -Message "Rate limited (429). Retry $i/$MaxRetries after $delay seconds$(if ($retryAfter) { ' (from Retry-After header)' })..." -Level "WARN"
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

                    # ENHANCEMENT: Get mailbox storage and quota statistics (CRITICAL for migration planning)
                    $storageStats = @{
                        StorageUsedMB = $null
                        StorageQuotaMB = $null
                        StoragePercentUsed = $null
                        TotalItemCount = 0
                        MailboxSizeBytes = $null
                        HasArchive = $false
                        ArchiveSizeBytes = $null
                        LastActivityDate = $null
                    }

                    try {
                        if ($user.mail -and $user.accountEnabled) {
                            # FIXED: Use beta endpoint with JSON format instead of v1.0 CSV format
                            # Reference: https://learn.microsoft.com/en-us/graph/api/reportroot-getmailboxusagedetail
                            # v1.0 returns CSV causing "Specify '-OutputFilePath'" errors, beta supports JSON
                            $reportUri = "https://graph.microsoft.com/beta/reports/getMailboxUsageDetail(period='D7')?`$format=application/json"
                            $usageReport = Invoke-GraphWithRetry -Uri $reportUri

                            if ($usageReport -and $usageReport.value) {
                                # Beta API with JSON format returns structured data
                                $userStats = $usageReport.value | Where-Object { $_.'User Principal Name' -eq $user.userPrincipalName } | Select-Object -First 1

                                if ($userStats) {
                                    $storageUsedBytes = if ($userStats.'Storage Used (Byte)') { [long]$userStats.'Storage Used (Byte)' } else { 0 }
                                    $itemCount = if ($userStats.'Item Count') { [int]$userStats.'Item Count' } else { 0 }
                                    $issueWarningQuota = if ($userStats.'Issue Warning Quota (Byte)') { [long]$userStats.'Issue Warning Quota (Byte)' } else { 0 }

                                    $storageStats.StorageUsedMB = if ($storageUsedBytes -gt 0) { [math]::Round([double]$storageUsedBytes / 1MB, 2) } else { $null }
                                    $storageStats.TotalItemCount = $itemCount
                                    $storageStats.MailboxSizeBytes = if ($storageUsedBytes -gt 0) { $storageUsedBytes } else { $null }
                                    $storageStats.LastActivityDate = if ($userStats.'Last Activity Date') { $userStats.'Last Activity Date' } else { $null }
                                    $storageStats.HasArchive = if ($userStats.'Has Archive' -eq 'True') { $true } else { $false }

                                    # Calculate percentage if quota is available
                                    if ($issueWarningQuota -gt 0) {
                                        $storageStats.StorageQuotaMB = [math]::Round([double]$issueWarningQuota / 1MB, 2)
                                        $storageStats.StoragePercentUsed = [math]::Round(([double]$storageUsedBytes / [double]$issueWarningQuota) * 100, 2)
                                    }
                                }
                            }
                        }
                    } catch {
                        $storageErr = $_.Exception.Message
                        # Storage stats are optional - log but don't fail discovery
                        Write-ModuleLog -ModuleName "Exchange" -Message "Could not get storage stats for $($user.userPrincipalName): $storageErr" -Level "DEBUG"
                    }

                    # ENHANCEMENT: Check for archive mailbox
                    if ($Configuration.exchangeOnline.includeArchiveMailboxes -and $user.mail -and $user.accountEnabled) {
                        try {
                            $archiveUri = "https://graph.microsoft.com/beta/users/$($user.id)/mailFolders?`$filter=displayName eq 'Archive'"
                            $archiveFolders = Invoke-GraphWithRetry -Uri $archiveUri

                            if ($archiveFolders -and $archiveFolders.value -and $archiveFolders.value.Count -gt 0) {
                                $storageStats.HasArchive = $true
                                # Try to get archive size if available
                                if ($archiveFolders.value[0].sizeInBytes) {
                                    $storageStats.ArchiveSizeBytes = $archiveFolders.value[0].sizeInBytes
                                }
                            }
                        } catch {
                            # Archive check is optional - ignore errors
                            Write-ModuleLog -ModuleName "Exchange" -Message "Could not check archive for $($user.userPrincipalName)" -Level "DEBUG"
                        }
                    }

                    # ENHANCEMENT: Get migration-critical data from Exchange Online PowerShell (if connected)
                    $exoData = @{
                        # Mailbox Statistics (accurate sizes)
                        EXO_TotalItemSize = $null
                        EXO_TotalItemCount = $null
                        EXO_TotalDeletedItemSize = $null
                        EXO_ItemCountInFolder = $null
                        EXO_ProhibitSendQuota = $null
                        EXO_ProhibitSendReceiveQuota = $null
                        EXO_IssueWarningQuota = $null
                        EXO_LastLogonTime = $null
                        EXO_LastLogoffTime = $null

                        # Permissions (Full Access, Send As)
                        EXO_FullAccessPermissions = @()
                        EXO_SendAsPermissions = @()
                        EXO_SendOnBehalfPermissions = @()

                        # Forwarding and Rules
                        EXO_ForwardingAddress = $null
                        EXO_ForwardingSmtpAddress = $null
                        EXO_DeliverToMailboxAndForward = $false
                        EXO_InboxRulesCount = 0
                        EXO_InboxRulesWithForwarding = @()

                        # Mailbox Configuration
                        EXO_MailboxType = $null
                        EXO_LitigationHoldEnabled = $false
                        EXO_RetentionPolicy = $null
                        EXO_HiddenFromAddressListsEnabled = $false
                    }

                    if ($exoConnected -and $user.mail -and $user.accountEnabled) {
                        try {
                            # Get detailed mailbox statistics using EXO cmdlet
                            $exoStats = Get-EXOMailboxStatistics -Identity $user.userPrincipalName -ErrorAction SilentlyContinue
                            if ($exoStats) {
                                $exoData.EXO_TotalItemSize = $exoStats.TotalItemSize
                                $exoData.EXO_TotalItemCount = $exoStats.ItemCount
                                $exoData.EXO_TotalDeletedItemSize = $exoStats.TotalDeletedItemSize
                                $exoData.EXO_LastLogonTime = $exoStats.LastLogonTime
                                $exoData.EXO_LastLogoffTime = $exoStats.LastLogoffTime
                            }

                            # Get mailbox configuration (forwarding, quotas, retention)
                            $exoMailbox = Get-EXOMailbox -Identity $user.userPrincipalName -PropertySets Quota,Retention,Delivery -ErrorAction SilentlyContinue
                            if ($exoMailbox) {
                                $exoData.EXO_MailboxType = $exoMailbox.RecipientTypeDetails
                                $exoData.EXO_ProhibitSendQuota = $exoMailbox.ProhibitSendQuota
                                $exoData.EXO_ProhibitSendReceiveQuota = $exoMailbox.ProhibitSendReceiveQuota
                                $exoData.EXO_IssueWarningQuota = $exoMailbox.IssueWarningQuota
                                $exoData.EXO_ForwardingAddress = $exoMailbox.ForwardingAddress
                                $exoData.EXO_ForwardingSmtpAddress = $exoMailbox.ForwardingSmtpAddress
                                $exoData.EXO_DeliverToMailboxAndForward = $exoMailbox.DeliverToMailboxAndForward
                                $exoData.EXO_LitigationHoldEnabled = $exoMailbox.LitigationHoldEnabled
                                $exoData.EXO_RetentionPolicy = $exoMailbox.RetentionPolicy
                                $exoData.EXO_HiddenFromAddressListsEnabled = $exoMailbox.HiddenFromAddressListsEnabled
                                $exoData.EXO_SendOnBehalfPermissions = if ($exoMailbox.GrantSendOnBehalfTo) { $exoMailbox.GrantSendOnBehalfTo -join ';' } else { $null }
                            }

                            # Get Full Access permissions
                            $fullAccessPerms = Get-EXOMailboxPermission -Identity $user.userPrincipalName -ErrorAction SilentlyContinue |
                                Where-Object { $_.AccessRights -contains "FullAccess" -and $_.IsInherited -eq $false -and $_.User -ne "NT AUTHORITY\SELF" }
                            if ($fullAccessPerms) {
                                $exoData.EXO_FullAccessPermissions = $fullAccessPerms | ForEach-Object { "$($_.User):$($_.AccessRights -join ',')" }
                            }

                            # Get Send As permissions
                            $sendAsPerms = Get-EXORecipientPermission -Identity $user.userPrincipalName -ErrorAction SilentlyContinue |
                                Where-Object { $_.AccessRights -contains "SendAs" -and $_.Trustee -ne "NT AUTHORITY\SELF" }
                            if ($sendAsPerms) {
                                $exoData.EXO_SendAsPermissions = $sendAsPerms | ForEach-Object { $_.Trustee }
                            }

                            # Get inbox rules (check for forwarding rules)
                            $inboxRules = Get-EXOInboxRule -Mailbox $user.userPrincipalName -ErrorAction SilentlyContinue
                            if ($inboxRules) {
                                $exoData.EXO_InboxRulesCount = $inboxRules.Count
                                $forwardingRules = $inboxRules | Where-Object {
                                    $_.ForwardTo -or $_.ForwardAsAttachmentTo -or $_.RedirectTo
                                }
                                if ($forwardingRules) {
                                    $exoData.EXO_InboxRulesWithForwarding = $forwardingRules | ForEach-Object {
                                        "$($_.Name):$($_.ForwardTo)$($_.ForwardAsAttachmentTo)$($_.RedirectTo)"
                                    }
                                }
                            }

                        } catch {
                            # EXO data is optional - log error but continue
                            Write-ModuleLog -ModuleName "Exchange" -Message "Could not get EXO data for $($user.userPrincipalName): $($_.Exception.Message)" -Level "DEBUG"
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

                        # ENHANCEMENT: Storage and Quota Statistics (CRITICAL for migration planning)
                        MailboxSizeMB = $storageStats.StorageUsedMB
                        MailboxSizeBytes = $storageStats.MailboxSizeBytes
                        MailboxQuotaMB = $storageStats.StorageQuotaMB
                        MailboxQuotaPercentUsed = $storageStats.StoragePercentUsed
                        MailboxTotalItemCount = $storageStats.TotalItemCount
                        MailboxLastActivityDate = $storageStats.LastActivityDate
                        HasArchiveMailbox = $storageStats.HasArchive
                        ArchiveSizeBytes = $storageStats.ArchiveSizeBytes
                        ArchiveSizeMB = if ($storageStats.ArchiveSizeBytes) { [math]::Round([double]$storageStats.ArchiveSizeBytes / 1MB, 2) } else { $null }

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

                        # MIGRATION-CRITICAL: Exchange Online PowerShell Data (EXO cmdlets)
                        # These fields are ONLY populated if Exchange Online PowerShell connection succeeded
                        EXO_TotalItemSize = $exoData.EXO_TotalItemSize
                        EXO_TotalItemCount = $exoData.EXO_TotalItemCount
                        EXO_TotalDeletedItemSize = $exoData.EXO_TotalDeletedItemSize
                        EXO_ProhibitSendQuota = $exoData.EXO_ProhibitSendQuota
                        EXO_ProhibitSendReceiveQuota = $exoData.EXO_ProhibitSendReceiveQuota
                        EXO_IssueWarningQuota = $exoData.EXO_IssueWarningQuota
                        EXO_LastLogonTime = $exoData.EXO_LastLogonTime
                        EXO_LastLogoffTime = $exoData.EXO_LastLogoffTime
                        EXO_MailboxType = $exoData.EXO_MailboxType
                        EXO_LitigationHoldEnabled = $exoData.EXO_LitigationHoldEnabled
                        EXO_RetentionPolicy = $exoData.EXO_RetentionPolicy
                        EXO_HiddenFromAddressLists = $exoData.EXO_HiddenFromAddressListsEnabled
                        EXO_ForwardingAddress = $exoData.EXO_ForwardingAddress
                        EXO_ForwardingSmtpAddress = $exoData.EXO_ForwardingSmtpAddress
                        EXO_DeliverToMailboxAndForward = $exoData.EXO_DeliverToMailboxAndForward
                        EXO_FullAccessPermissions = ($exoData.EXO_FullAccessPermissions -join ';')
                        EXO_SendAsPermissions = ($exoData.EXO_SendAsPermissions -join ';')
                        EXO_SendOnBehalfPermissions = $exoData.EXO_SendOnBehalfPermissions
                        EXO_InboxRulesCount = $exoData.EXO_InboxRulesCount
                        EXO_InboxRulesWithForwarding = ($exoData.EXO_InboxRulesWithForwarding -join ';')

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

                # ENHANCEMENT: Discover equipment mailboxes (projectors, vehicles, devices, etc.)
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering equipment mailboxes..." -Level "INFO"
                $equipmentUri = "https://graph.microsoft.com/v1.0/places/microsoft.graph.room?`$filter=bookingType eq 'standard'&`$top=$batchSize"

                # Note: Graph API doesn't have dedicated equipment endpoint yet, but we can try filtering rooms
                # Alternatively, we might need to use Exchange Online PowerShell for true equipment mailboxes
                # For now, we'll attempt to identify equipment-like rooms
                try {
                    $nextLink = $equipmentUri
                    $equipmentCount = 0

                    while ($nextLink) {
                        $equipResponse = Invoke-GraphWithRetry -Uri $nextLink

                        foreach ($equip in $equipResponse.value) {
                            # Only include if it looks like equipment (has equipment-related tags or naming)
                            $isEquipment = ($equip.tags -and ($equip.tags -match "Equipment|Projector|Vehicle|Device")) -or
                                          ($equip.displayName -match "Equipment|Projector|Vehicle|Device")

                            if ($isEquipment) {
                                $equipObj = [PSCustomObject]@{
                                    Id = $equip.id
                                    DisplayName = $equip.displayName
                                    EmailAddress = $equip.emailAddress
                                    Nickname = $equip.nickname
                                    Building = $equip.building
                                    Floor = if ($equip.floor) { $equip.floor } else { $null }
                                    Capacity = $equip.capacity
                                    Label = $equip.label
                                    BookingType = $equip.bookingType
                                    AudioDeviceName = $equip.audioDeviceName
                                    VideoDeviceName = $equip.videoDeviceName
                                    DisplayDeviceName = $equip.displayDeviceName
                                    Tags = ($equip.tags -join ';')
                                    Address = if ($equip.address) {
                                        "$($equip.address.street), $($equip.address.city), $($equip.address.state) $($equip.address.postalCode)"
                                    } else { $null }
                                    Phone = $equip.phone
                                    RecipientType = "EquipmentMailbox"
                                    RecipientTypeDetails = "EquipmentMailbox"
                                    _DataType = "EquipmentMailbox"
                                }

                                $null = $allDiscoveredData.Add($equipObj)
                                $equipmentCount++
                            }
                        }

                        $nextLink = $equipResponse.'@odata.nextLink'
                    }

                    if ($equipmentCount -gt 0) {
                        Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $equipmentCount equipment mailboxes" -Level "SUCCESS"
                    }
                } catch {
                    Write-ModuleLog -ModuleName "Exchange" -Message "Equipment mailbox discovery not available or failed: $($_.Exception.Message)" -Level "WARN"
                }

            } catch {
                $Result.AddWarning("Failed to discover resource mailboxes: $($_.Exception.Message)", @{Section="ResourceMailboxes"})
            }
        }
        
        # Discover Mail Contacts
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering organizational mail contacts (external users)..." -Level "INFO"

            # Fix: Use guest users with mail (organizational contacts) instead of personal contacts
            # Filter syntax: userType eq 'Guest' is valid, ensure proper encoding for 'and mail ne null'
            $contactUri = "https://graph.microsoft.com/v1.0/users?`$filter=userType eq 'Guest'&`$select=id,displayName,mail,givenName,surname,companyName,department,jobTitle,businessPhones,mobilePhone,streetAddress,city,state,postalCode,country&`$top=$batchSize"
            
            $nextLink = $contactUri
            while ($nextLink) {
                $response = Invoke-GraphWithRetry -Uri $nextLink
                
                foreach ($contact in $response.value) {
                    $contactObj = [PSCustomObject]@{
                        Id = $contact.id
                        DisplayName = $contact.displayName
                        EmailAddress = $contact.mail  # Updated to use mail property from user object
                        GivenName = $contact.givenName
                        Surname = $contact.surname
                        CompanyName = $contact.companyName
                        Department = $contact.department
                        JobTitle = $contact.jobTitle
                        BusinessPhones = ($contact.businessPhones -join ';')
                        MobilePhone = $contact.mobilePhone
                        BusinessAddress = if ($contact.streetAddress -or $contact.city -or $contact.state -or $contact.postalCode) {
                            "$($contact.streetAddress), $($contact.city), $contact.state) $($contact.postalCode), $($contact.country)"
                        } else { $null }
                        RecipientType = "GuestMailContact"  # Updated to reflect guest user type
                        RecipientTypeDetails = "GuestMailContact"
                        _DataType = "MailContact"
                    }

                    $null = $allDiscoveredData.Add($contactObj)
                }
                
                $nextLink = $response.'@odata.nextLink'
            }
            
        } catch {
            $Result.AddWarning("Failed to discover mail contacts: $($_.Exception.Message)", @{Section="MailContacts"})
        }

        # ENHANCEMENT: Discover Accepted Domains
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering accepted domains..." -Level "INFO"

            $domainsUri = "https://graph.microsoft.com/v1.0/domains?`$select=id,authenticationType,availabilityStatus,isDefault,isInitial,isVerified,supportedServices"

            $response = Invoke-GraphWithRetry -Uri $domainsUri

            if ($response -and $response.value) {
                foreach ($domain in $response.value) {
                    # Only include verified domains
                    if ($domain.isVerified) {
                        $domainObj = [PSCustomObject]@{
                            DomainName = $domain.id
                            AuthenticationType = $domain.authenticationType
                            IsDefault = $domain.isDefault
                            IsInitial = $domain.isInitial
                            IsVerified = $domain.isVerified
                            AvailabilityStatus = $domain.availabilityStatus
                            SupportedServices = ($domain.supportedServices -join ';')
                            MailFlowStatus = if (($domain.supportedServices -contains 'Email') -or ($domain.supportedServices -contains 'Exchange')) { "Active" } else { "NotConfigured" }
                            RecipientType = "AcceptedDomain"
                            _DataType = "AcceptedDomain"
                        }

                        $null = $allDiscoveredData.Add($domainObj)
                    }
                }

                $domainCount = ($response.value | Where-Object { $_.isVerified }).Count
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $domainCount accepted domains" -Level "SUCCESS"
            }

        } catch {
            $Result.AddWarning("Failed to discover accepted domains: $($_.Exception.Message)", @{Section="AcceptedDomains"})
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

                # FIXED: Check for critical field presence (prevents "Key cannot be null" error)
                if (-not $record.Id -or -not $record.DisplayName) {
                    $validationResults.MissingCriticalData++
                    $isValid = $false
                }

                # FIXED: Only use Id as hashtable key if it's not null (prevents "Key cannot be null" error)
                if ($record.Id) {
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
        # Disconnect from Exchange Online PowerShell
        if ($exoConnected) {
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Disconnecting from Exchange Online PowerShell..." -Level "INFO"
                Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
                Write-ModuleLog -ModuleName "Exchange" -Message "Disconnected from Exchange Online PowerShell" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "Exchange" -Message "Error during Exchange Online disconnect: $($_.Exception.Message)" -Level "WARN"
            }
        }

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

    # FIXED: Return clean object without ScriptMethods (prevents JSON serialization errors)
    # ScriptMethods (AddError, AddWarning) cause "ListDictionaryInternal not supported" errors
    $cleanResult = [PSCustomObject]@{
        Success = $result.Success
        Message = $result.Message
        Data = $result.Data
        Errors = $result.Errors
        Warnings = $result.Warnings
    }

    return $cleanResult
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-ExchangeDiscovery
