# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# ============================================================================
# EXCHANGE DISCOVERY MODULE v2.0.0
# ============================================================================
# Author: Lukian Poleschtschuk
# Version: 2.0.0
# Created: 2025-01-18
# Last Modified: 2026-01-01
#
# CHANGELOG:
# v2.0.0 (2026-01-01) - Major mail flow enhancement:
#   - Added Transport Rules discovery (Get-TransportRule)
#   - Added Inbound/Outbound Connectors discovery
#   - Added Remote Domains discovery
#   - Added Organization Config discovery
#   - Added Organization Relationships (federation)
#   - Added DKIM Signing Config discovery
#   - Added Anti-Spam, Anti-Phishing, Malware policy discovery
#   - Added Migration Endpoints and Batches discovery
#   - Added Retention Policies and Journal Rules discovery
#   - Added DNS/MX/SPF/DKIM/DMARC discovery with third-party gateway detection
# v1.0.0 (2025-01-18) - Initial release
# ============================================================================

<#
.SYNOPSIS
    Enhanced Exchange Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Exchange Online mailboxes, distribution groups, mail-enabled security groups, mailbox statistics,
    mail flow rules, retention policies, and more using Microsoft Graph API AND Exchange Online PowerShell.
    This module provides comprehensive Exchange Online discovery including:
    - Mailboxes with detailed configurations and permissions
    - Distribution lists and M365 groups
    - Transport rules (mail flow rules)
    - Inbound/Outbound connectors
    - Remote domains and accepted domains
    - Organization configuration and federation relationships
    - Security policies (DKIM, Anti-Spam, Anti-Phishing, Malware)
    - Migration endpoints and batches
    - DNS records (MX, SPF, DKIM, DMARC) with third-party gateway detection
    Essential for M&A email system assessment and migration planning.
.NOTES
    Version: 2.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Last Modified: 2026-01-01
    Requires: PowerShell 5.1+, Microsoft.Graph modules, ExchangeOnlineManagement module,
              Exchange.ManageAsApp permission, DiscoveryBase module
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
    Write-ModuleLog -ModuleName "Exchange" -Message "Module Version: 2.0.0" -Level "INFO"

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

        # ============================================================================
        # MAIL FLOW CONFIGURATION DISCOVERY (Requires EXO PowerShell Connection)
        # These cmdlets provide critical data for M&A migration planning
        # ============================================================================

        if ($exoConnected) {
            Write-ModuleLog -ModuleName "Exchange" -Message "=== Mail Flow Configuration Discovery ===" -Level "HEADER"

            # --- TRANSPORT RULES (Mail Flow Rules) ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering transport rules (mail flow rules)..." -Level "INFO"

                $transportRules = Get-TransportRule -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        State = $_.State
                        Priority = $_.Priority
                        Mode = $_.Mode
                        Comments = $_.Comments
                        # Conditions
                        SentTo = if ($_.SentTo) { ($_.SentTo -join ';') } else { $null }
                        SentToScope = $_.SentToScope
                        RecipientDomainIs = if ($_.RecipientDomainIs) { ($_.RecipientDomainIs -join ';') } else { $null }
                        FromScope = $_.FromScope
                        From = if ($_.From) { ($_.From -join ';') } else { $null }
                        FromAddressContainsWords = if ($_.FromAddressContainsWords) { ($_.FromAddressContainsWords -join ';') } else { $null }
                        SubjectContainsWords = if ($_.SubjectContainsWords) { ($_.SubjectContainsWords -join ';') } else { $null }
                        SubjectOrBodyContainsWords = if ($_.SubjectOrBodyContainsWords) { ($_.SubjectOrBodyContainsWords -join ';') } else { $null }
                        HasAttachment = $_.HasAttachment
                        AttachmentContainsWords = if ($_.AttachmentContainsWords) { ($_.AttachmentContainsWords -join ';') } else { $null }
                        AttachmentNameMatchesPatterns = if ($_.AttachmentNameMatchesPatterns) { ($_.AttachmentNameMatchesPatterns -join ';') } else { $null }
                        SenderIpRanges = if ($_.SenderIpRanges) { ($_.SenderIpRanges -join ';') } else { $null }
                        # Actions
                        RedirectMessageTo = if ($_.RedirectMessageTo) { ($_.RedirectMessageTo -join ';') } else { $null }
                        CopyTo = if ($_.CopyTo) { ($_.CopyTo -join ';') } else { $null }
                        BlindCopyTo = if ($_.BlindCopyTo) { ($_.BlindCopyTo -join ';') } else { $null }
                        AddToRecipients = if ($_.AddToRecipients) { ($_.AddToRecipients -join ';') } else { $null }
                        ModerateMessageByUser = if ($_.ModerateMessageByUser) { ($_.ModerateMessageByUser -join ';') } else { $null }
                        PrependSubject = $_.PrependSubject
                        SetHeaderName = $_.SetHeaderName
                        SetHeaderValue = $_.SetHeaderValue
                        RemoveHeader = $_.RemoveHeader
                        SetSCL = $_.SetSCL
                        Quarantine = $_.Quarantine
                        RejectMessageReasonText = $_.RejectMessageReasonText
                        RejectMessageEnhancedStatusCode = $_.RejectMessageEnhancedStatusCode
                        DeleteMessage = $_.DeleteMessage
                        Disconnect = $_.Disconnect
                        ApplyClassification = $_.ApplyClassification
                        ApplyHtmlDisclaimerText = $_.ApplyHtmlDisclaimerText
                        ApplyHtmlDisclaimerLocation = $_.ApplyHtmlDisclaimerLocation
                        # Exceptions
                        ExceptIfSentTo = if ($_.ExceptIfSentTo) { ($_.ExceptIfSentTo -join ';') } else { $null }
                        ExceptIfFrom = if ($_.ExceptIfFrom) { ($_.ExceptIfFrom -join ';') } else { $null }
                        ExceptIfRecipientDomainIs = if ($_.ExceptIfRecipientDomainIs) { ($_.ExceptIfRecipientDomainIs -join ';') } else { $null }
                        # Metadata
                        RuleErrorAction = $_.RuleErrorAction
                        SenderAddressLocation = $_.SenderAddressLocation
                        WhenChanged = $_.WhenChanged
                        _DataType = "TransportRule"
                    }
                }

                if ($transportRules) {
                    $transportRules | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    $enabledRules = ($transportRules | Where-Object { $_.State -eq 'Enabled' }).Count
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($transportRules.Count) transport rules ($enabledRules enabled)" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No transport rules found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover transport rules: $($_.Exception.Message)", @{Section="TransportRules"})
            }

            # --- INBOUND CONNECTORS ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering inbound connectors..." -Level "INFO"

                $inboundConnectors = Get-InboundConnector -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        Enabled = $_.Enabled
                        ConnectorType = $_.ConnectorType
                        ConnectorSource = $_.ConnectorSource
                        SenderDomains = if ($_.SenderDomains) { ($_.SenderDomains -join ';') } else { $null }
                        SenderIPAddresses = if ($_.SenderIPAddresses) { ($_.SenderIPAddresses -join ';') } else { $null }
                        AssociatedAcceptedDomains = if ($_.AssociatedAcceptedDomains) { ($_.AssociatedAcceptedDomains -join ';') } else { $null }
                        RequireTls = $_.RequireTls
                        RestrictDomainsToIPAddresses = $_.RestrictDomainsToIPAddresses
                        RestrictDomainsToCertificate = $_.RestrictDomainsToCertificate
                        TlsSenderCertificateName = $_.TlsSenderCertificateName
                        TreatMessagesAsInternal = $_.TreatMessagesAsInternal
                        CloudServicesMailEnabled = $_.CloudServicesMailEnabled
                        EFSkipLastIP = $_.EFSkipLastIP
                        EFSkipIPs = if ($_.EFSkipIPs) { ($_.EFSkipIPs -join ';') } else { $null }
                        EFSkipMailGateway = if ($_.EFSkipMailGateway) { ($_.EFSkipMailGateway -join ';') } else { $null }
                        Comment = $_.Comment
                        WhenChanged = $_.WhenChanged
                        _DataType = "InboundConnector"
                    }
                }

                if ($inboundConnectors) {
                    $inboundConnectors | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    $enabledInbound = ($inboundConnectors | Where-Object { $_.Enabled -eq $true }).Count
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($inboundConnectors.Count) inbound connectors ($enabledInbound enabled)" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No inbound connectors found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover inbound connectors: $($_.Exception.Message)", @{Section="InboundConnectors"})
            }

            # --- OUTBOUND CONNECTORS ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering outbound connectors..." -Level "INFO"

                $outboundConnectors = Get-OutboundConnector -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        Enabled = $_.Enabled
                        ConnectorType = $_.ConnectorType
                        ConnectorSource = $_.ConnectorSource
                        RecipientDomains = if ($_.RecipientDomains) { ($_.RecipientDomains -join ';') } else { $null }
                        SmartHosts = if ($_.SmartHosts) { ($_.SmartHosts -join ';') } else { $null }
                        TlsSettings = $_.TlsSettings
                        TlsDomain = $_.TlsDomain
                        RequireTLS = $_.RequireTLS
                        IsTransportRuleScoped = $_.IsTransportRuleScoped
                        RouteAllMessagesViaOnPremises = $_.RouteAllMessagesViaOnPremises
                        CloudServicesMailEnabled = $_.CloudServicesMailEnabled
                        AllAcceptedDomains = $_.AllAcceptedDomains
                        UseMXRecord = $_.UseMXRecord
                        Comment = $_.Comment
                        WhenChanged = $_.WhenChanged
                        _DataType = "OutboundConnector"
                    }
                }

                if ($outboundConnectors) {
                    $outboundConnectors | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    $enabledOutbound = ($outboundConnectors | Where-Object { $_.Enabled -eq $true }).Count
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($outboundConnectors.Count) outbound connectors ($enabledOutbound enabled)" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No outbound connectors found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover outbound connectors: $($_.Exception.Message)", @{Section="OutboundConnectors"})
            }

            # --- REMOTE DOMAINS ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering remote domains..." -Level "INFO"

                $remoteDomains = Get-RemoteDomain -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        DomainName = $_.DomainName
                        Name = $_.Name
                        Identity = $_.Identity
                        IsInternal = $_.IsInternal
                        AllowedOOFType = $_.AllowedOOFType
                        AutoReplyEnabled = $_.AutoReplyEnabled
                        AutoForwardEnabled = $_.AutoForwardEnabled
                        DeliveryReportEnabled = $_.DeliveryReportEnabled
                        NDREnabled = $_.NDREnabled
                        MeetingForwardNotificationEnabled = $_.MeetingForwardNotificationEnabled
                        TNEFEnabled = $_.TNEFEnabled
                        TrustedMailOutboundEnabled = $_.TrustedMailOutboundEnabled
                        TrustedMailInboundEnabled = $_.TrustedMailInboundEnabled
                        CharacterSet = $_.CharacterSet
                        NonMimeCharacterSet = $_.NonMimeCharacterSet
                        ContentType = $_.ContentType
                        LineWrapSize = $_.LineWrapSize
                        TargetDeliveryDomain = $_.TargetDeliveryDomain
                        ByteEncoderTypeFor7BitCharsets = $_.ByteEncoderTypeFor7BitCharsets
                        WhenChanged = $_.WhenChanged
                        _DataType = "RemoteDomain"
                    }
                }

                if ($remoteDomains) {
                    $remoteDomains | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($remoteDomains.Count) remote domains" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No remote domains found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover remote domains: $($_.Exception.Message)", @{Section="RemoteDomains"})
            }

            # --- ORGANIZATION CONFIG ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering organization configuration..." -Level "INFO"

                $orgConfig = Get-OrganizationConfig -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        DisplayName = $_.DisplayName
                        Name = $_.Name
                        Identity = $_.Identity
                        OrganizationId = $_.OrganizationId
                        IsDehydrated = $_.IsDehydrated
                        # Mail Tips
                        MailTipsAllTipsEnabled = $_.MailTipsAllTipsEnabled
                        MailTipsExternalRecipientsTipsEnabled = $_.MailTipsExternalRecipientsTipsEnabled
                        MailTipsGroupMetricsEnabled = $_.MailTipsGroupMetricsEnabled
                        MailTipsLargeAudienceThreshold = $_.MailTipsLargeAudienceThreshold
                        MailTipsMailboxSourcedTipsEnabled = $_.MailTipsMailboxSourcedTipsEnabled
                        # Public Folders
                        PublicFoldersEnabled = $_.PublicFoldersEnabled
                        PublicFolderMigrationComplete = $_.PublicFolderMigrationComplete
                        DefaultPublicFolderMailbox = $_.DefaultPublicFolderMailbox
                        # Protocols
                        EwsEnabled = $_.EwsEnabled
                        EwsAllowOutlook = $_.EwsAllowOutlook
                        EwsAllowMacOutlook = $_.EwsAllowMacOutlook
                        EwsAllowEntourage = $_.EwsAllowEntourage
                        MapiHttpEnabled = $_.MapiHttpEnabled
                        OAuth2ClientProfileEnabled = $_.OAuth2ClientProfileEnabled
                        # Security
                        DirectoryBasedEdgeBlockModeEnabled = $_.DirectoryBasedEdgeBlockModeEnabled
                        UnifiedAuditLogIngestionEnabled = $_.UnifiedAuditLogIngestionEnabled
                        AuditDisabled = $_.AuditDisabled
                        # Distribution Groups
                        DistributionGroupDefaultOU = $_.DistributionGroupDefaultOU
                        DistributionGroupNameBlockedWordsList = if ($_.DistributionGroupNameBlockedWordsList) { ($_.DistributionGroupNameBlockedWordsList -join ';') } else { $null }
                        DistributionGroupNamingPolicy = $_.DistributionGroupNamingPolicy
                        # Exchange Recipient
                        MicrosoftExchangeRecipientPrimarySmtpAddress = $_.MicrosoftExchangeRecipientPrimarySmtpAddress
                        MicrosoftExchangeRecipientEmailAddresses = if ($_.MicrosoftExchangeRecipientEmailAddresses) { ($_.MicrosoftExchangeRecipientEmailAddresses -join ';') } else { $null }
                        # Misc
                        DefaultGroupAccessType = $_.DefaultGroupAccessType
                        BookingsEnabled = $_.BookingsEnabled
                        BookingsPaymentsEnabled = $_.BookingsPaymentsEnabled
                        BookingsSocialSharingRestricted = $_.BookingsSocialSharingRestricted
                        FocusedInboxOn = $_.FocusedInboxOn
                        ReadTrackingEnabled = $_.ReadTrackingEnabled
                        AutoExpandingArchive = $_.AutoExpandingArchive
                        WhenChanged = $_.WhenChanged
                        _DataType = "OrganizationConfig"
                    }
                }

                if ($orgConfig) {
                    $null = $allDiscoveredData.Add($orgConfig)
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered organization configuration for: $($orgConfig.DisplayName)" -Level "SUCCESS"
                }

            } catch {
                $Result.AddWarning("Failed to discover organization config: $($_.Exception.Message)", @{Section="OrganizationConfig"})
            }

            # --- ORGANIZATION RELATIONSHIPS (Federation) ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering organization relationships (federation)..." -Level "INFO"

                $orgRelationships = Get-OrganizationRelationship -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        Enabled = $_.Enabled
                        DomainNames = if ($_.DomainNames) { ($_.DomainNames -join ';') } else { $null }
                        # Free/Busy Sharing
                        FreeBusyAccessEnabled = $_.FreeBusyAccessEnabled
                        FreeBusyAccessLevel = $_.FreeBusyAccessLevel
                        FreeBusyAccessScope = $_.FreeBusyAccessScope
                        # Mail Tips
                        MailTipsAccessEnabled = $_.MailTipsAccessEnabled
                        MailTipsAccessLevel = $_.MailTipsAccessLevel
                        MailTipsAccessScope = $_.MailTipsAccessScope
                        # Photos and Delivery Reports
                        PhotosEnabled = $_.PhotosEnabled
                        DeliveryReportEnabled = $_.DeliveryReportEnabled
                        # Target URLs
                        TargetApplicationUri = $_.TargetApplicationUri
                        TargetAutodiscoverEpr = $_.TargetAutodiscoverEpr
                        TargetOwaURL = $_.TargetOwaURL
                        TargetSharingEpr = $_.TargetSharingEpr
                        # Archive Access
                        ArchiveAccessEnabled = $_.ArchiveAccessEnabled
                        MailboxMoveEnabled = $_.MailboxMoveEnabled
                        MailboxMoveCapability = $_.MailboxMoveCapability
                        MailboxMovePublishedScopes = if ($_.MailboxMovePublishedScopes) { ($_.MailboxMovePublishedScopes -join ';') } else { $null }
                        OAuthApplicationId = $_.OAuthApplicationId
                        WhenChanged = $_.WhenChanged
                        _DataType = "OrganizationRelationship"
                    }
                }

                if ($orgRelationships) {
                    $orgRelationships | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    $enabledRels = ($orgRelationships | Where-Object { $_.Enabled -eq $true }).Count
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($orgRelationships.Count) organization relationships ($enabledRels enabled)" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No organization relationships found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover organization relationships: $($_.Exception.Message)", @{Section="OrganizationRelationships"})
            }

            # --- DKIM SIGNING CONFIG ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering DKIM signing configuration..." -Level "INFO"

                $dkimConfigs = Get-DkimSigningConfig -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Domain = $_.Domain
                        Identity = $_.Identity
                        Enabled = $_.Enabled
                        Status = $_.Status
                        Selector1CNAME = $_.Selector1CNAME
                        Selector2CNAME = $_.Selector2CNAME
                        Selector1PublicKey = $_.Selector1PublicKey
                        Selector2PublicKey = $_.Selector2PublicKey
                        KeyCreationTime = $_.KeyCreationTime
                        LastChecked = $_.LastChecked
                        RotateOnDate = $_.RotateOnDate
                        SelectorBeforeRotateonDate = $_.SelectorBeforeRotateonDate
                        SelectorAfterRotateonDate = $_.SelectorAfterRotateonDate
                        _DataType = "DkimConfig"
                    }
                }

                if ($dkimConfigs) {
                    $dkimConfigs | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    $enabledDkim = ($dkimConfigs | Where-Object { $_.Enabled -eq $true }).Count
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($dkimConfigs.Count) DKIM configurations ($enabledDkim enabled)" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No DKIM configurations found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover DKIM config: $($_.Exception.Message)", @{Section="DkimConfig"})
            }

            # --- ANTI-SPAM POLICIES ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering anti-spam policies..." -Level "INFO"

                $antiSpamPolicies = Get-HostedContentFilterPolicy -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        IsDefault = $_.IsDefault
                        # Spam Actions
                        SpamAction = $_.SpamAction
                        HighConfidenceSpamAction = $_.HighConfidenceSpamAction
                        BulkSpamAction = $_.BulkSpamAction
                        PhishSpamAction = $_.PhishSpamAction
                        HighConfidencePhishAction = $_.HighConfidencePhishAction
                        # Thresholds
                        BulkThreshold = $_.BulkThreshold
                        MarkAsSpamBulkMail = $_.MarkAsSpamBulkMail
                        # Quarantine
                        QuarantineRetentionPeriod = $_.QuarantineRetentionPeriod
                        SpamQuarantineTag = $_.SpamQuarantineTag
                        HighConfidenceSpamQuarantineTag = $_.HighConfidenceSpamQuarantineTag
                        PhishQuarantineTag = $_.PhishQuarantineTag
                        HighConfidencePhishQuarantineTag = $_.HighConfidencePhishQuarantineTag
                        BulkQuarantineTag = $_.BulkQuarantineTag
                        # Notifications
                        EnableEndUserSpamNotifications = $_.EnableEndUserSpamNotifications
                        EndUserSpamNotificationFrequency = $_.EndUserSpamNotificationFrequency
                        # Filters
                        AllowedSenders = if ($_.AllowedSenders) { ($_.AllowedSenders -join ';') } else { $null }
                        AllowedSenderDomains = if ($_.AllowedSenderDomains) { ($_.AllowedSenderDomains -join ';') } else { $null }
                        BlockedSenders = if ($_.BlockedSenders) { ($_.BlockedSenders -join ';') } else { $null }
                        BlockedSenderDomains = if ($_.BlockedSenderDomains) { ($_.BlockedSenderDomains -join ';') } else { $null }
                        # Zero Hour Auto Purge
                        ZapEnabled = $_.ZapEnabled
                        SpamZapEnabled = $_.SpamZapEnabled
                        PhishZapEnabled = $_.PhishZapEnabled
                        # Advanced
                        InlineSafetyTipsEnabled = $_.InlineSafetyTipsEnabled
                        LanguageBlockList = if ($_.LanguageBlockList) { ($_.LanguageBlockList -join ';') } else { $null }
                        RegionBlockList = if ($_.RegionBlockList) { ($_.RegionBlockList -join ';') } else { $null }
                        TestModeAction = $_.TestModeAction
                        _DataType = "AntiSpamPolicy"
                    }
                }

                if ($antiSpamPolicies) {
                    $antiSpamPolicies | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($antiSpamPolicies.Count) anti-spam policies" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No anti-spam policies found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover anti-spam policies: $($_.Exception.Message)", @{Section="AntiSpamPolicies"})
            }

            # --- ANTI-PHISHING POLICIES ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering anti-phishing policies..." -Level "INFO"

                $antiPhishPolicies = Get-AntiPhishPolicy -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        IsDefault = $_.IsDefault
                        Enabled = $_.Enabled
                        # Impersonation Protection
                        EnableMailboxIntelligence = $_.EnableMailboxIntelligence
                        EnableMailboxIntelligenceProtection = $_.EnableMailboxIntelligenceProtection
                        MailboxIntelligenceProtectionAction = $_.MailboxIntelligenceProtectionAction
                        EnableOrganizationDomainsProtection = $_.EnableOrganizationDomainsProtection
                        EnableTargetedDomainsProtection = $_.EnableTargetedDomainsProtection
                        TargetedDomainsToProtect = if ($_.TargetedDomainsToProtect) { ($_.TargetedDomainsToProtect -join ';') } else { $null }
                        TargetedDomainProtectionAction = $_.TargetedDomainProtectionAction
                        EnableTargetedUserProtection = $_.EnableTargetedUserProtection
                        TargetedUsersToProtect = if ($_.TargetedUsersToProtect) { ($_.TargetedUsersToProtect -join ';') } else { $null }
                        TargetedUserProtectionAction = $_.TargetedUserProtectionAction
                        # Spoof Protection
                        EnableSpoofIntelligence = $_.EnableSpoofIntelligence
                        AuthenticationFailAction = $_.AuthenticationFailAction
                        # Safety Tips
                        EnableFirstContactSafetyTips = $_.EnableFirstContactSafetyTips
                        EnableSimilarUsersSafetyTips = $_.EnableSimilarUsersSafetyTips
                        EnableSimilarDomainsSafetyTips = $_.EnableSimilarDomainsSafetyTips
                        EnableUnusualCharactersSafetyTips = $_.EnableUnusualCharactersSafetyTips
                        EnableUnauthenticatedSender = $_.EnableUnauthenticatedSender
                        EnableViaTag = $_.EnableViaTag
                        # Exclusions
                        ExcludedDomains = if ($_.ExcludedDomains) { ($_.ExcludedDomains -join ';') } else { $null }
                        ExcludedSenders = if ($_.ExcludedSenders) { ($_.ExcludedSenders -join ';') } else { $null }
                        ImpersonationProtectionState = $_.ImpersonationProtectionState
                        PolicyTag = $_.PolicyTag
                        _DataType = "AntiPhishPolicy"
                    }
                }

                if ($antiPhishPolicies) {
                    $antiPhishPolicies | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($antiPhishPolicies.Count) anti-phishing policies" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No anti-phishing policies found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover anti-phishing policies: $($_.Exception.Message)", @{Section="AntiPhishPolicies"})
            }

            # --- MALWARE FILTER POLICIES ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering malware filter policies..." -Level "INFO"

                $malwarePolicies = Get-MalwareFilterPolicy -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        IsDefault = $_.IsDefault
                        # File Filtering
                        EnableFileFilter = $_.EnableFileFilter
                        FileTypes = if ($_.FileTypes) { ($_.FileTypes -join ';') } else { $null }
                        FileTypeAction = $_.FileTypeAction
                        # Zero Hour Auto Purge
                        ZapEnabled = $_.ZapEnabled
                        # Notifications
                        EnableInternalSenderAdminNotifications = $_.EnableInternalSenderAdminNotifications
                        InternalSenderAdminAddress = $_.InternalSenderAdminAddress
                        EnableExternalSenderAdminNotifications = $_.EnableExternalSenderAdminNotifications
                        ExternalSenderAdminAddress = $_.ExternalSenderAdminAddress
                        EnableInternalSenderNotifications = $_.EnableInternalSenderNotifications
                        EnableExternalSenderNotifications = $_.EnableExternalSenderNotifications
                        # Custom Messages
                        CustomFromName = $_.CustomFromName
                        CustomFromAddress = $_.CustomFromAddress
                        CustomNotifications = $_.CustomNotifications
                        CustomInternalSubject = $_.CustomInternalSubject
                        CustomInternalBody = $_.CustomInternalBody
                        CustomExternalSubject = $_.CustomExternalSubject
                        CustomExternalBody = $_.CustomExternalBody
                        # Quarantine
                        QuarantineTag = $_.QuarantineTag
                        _DataType = "MalwarePolicy"
                    }
                }

                if ($malwarePolicies) {
                    $malwarePolicies | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($malwarePolicies.Count) malware filter policies" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No malware filter policies found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover malware policies: $($_.Exception.Message)", @{Section="MalwarePolicies"})
            }

            # --- MIGRATION ENDPOINTS ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering migration endpoints..." -Level "INFO"

                $migrationEndpoints = Get-MigrationEndpoint -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Identity = $_.Identity
                        EndpointType = $_.EndpointType
                        RemoteServer = $_.RemoteServer
                        ExchangeServer = $_.ExchangeServer
                        RpcProxyServer = $_.RpcProxyServer
                        NspiServer = $_.NspiServer
                        Credentials = if ($_.Credentials) { $_.Credentials.UserName } else { $null }
                        MailboxPermission = $_.MailboxPermission
                        MaxConcurrentMigrations = $_.MaxConcurrentMigrations
                        MaxConcurrentIncrementalSyncs = $_.MaxConcurrentIncrementalSyncs
                        UseAutoDiscover = $_.UseAutoDiscover
                        IsRemote = $_.IsRemote
                        ApplicationId = $_.ApplicationId
                        AppSecretKeyVaultUrl = $_.AppSecretKeyVaultUrl
                        LastModifiedTime = $_.LastModifiedTime
                        _DataType = "MigrationEndpoint"
                    }
                }

                if ($migrationEndpoints) {
                    $migrationEndpoints | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($migrationEndpoints.Count) migration endpoints" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No migration endpoints found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover migration endpoints: $($_.Exception.Message)", @{Section="MigrationEndpoints"})
            }

            # --- MIGRATION BATCHES ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering migration batches..." -Level "INFO"

                $migrationBatches = Get-MigrationBatch -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Identity = $_.Identity
                        Status = $_.Status
                        State = $_.State
                        Type = $_.MigrationType
                        Direction = $_.Direction
                        SourceEndpoint = $_.SourceEndpoint
                        TargetEndpoint = $_.TargetEndpoint
                        TargetDeliveryDomain = $_.TargetDeliveryDomain
                        TotalCount = $_.TotalCount
                        SyncedCount = $_.SyncedCount
                        FinalizedCount = $_.FinalizedCount
                        FailedCount = $_.FailedCount
                        PendingCount = $_.PendingCount
                        ProvisionedCount = $_.ProvisionedCount
                        CreationDateTime = $_.CreationDateTime
                        StartDateTime = $_.StartDateTime
                        CompleteDateTime = $_.FinalizedDateTime
                        LastSyncedDateTime = $_.LastSyncedDateTime
                        SubmittedByUser = $_.SubmittedByUser
                        NotificationEmails = if ($_.NotificationEmails) { ($_.NotificationEmails -join ';') } else { $null }
                        SkipMerging = if ($_.SkipMerging) { ($_.SkipMerging -join ';') } else { $null }
                        _DataType = "MigrationBatch"
                    }
                }

                if ($migrationBatches) {
                    $migrationBatches | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    $activeBatches = ($migrationBatches | Where-Object { $_.Status -notin @('Completed', 'Failed', 'Stopped') }).Count
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($migrationBatches.Count) migration batches ($activeBatches active)" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No migration batches found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover migration batches: $($_.Exception.Message)", @{Section="MigrationBatches"})
            }

            # --- RETENTION POLICIES ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering retention policies..." -Level "INFO"

                $retentionPolicies = Get-RetentionPolicy -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        IsDefault = $_.IsDefault
                        IsDefaultArbitrationMailbox = $_.IsDefaultArbitrationMailbox
                        RetentionPolicyTagLinks = if ($_.RetentionPolicyTagLinks) { ($_.RetentionPolicyTagLinks -join ';') } else { $null }
                        WhenChanged = $_.WhenChanged
                        _DataType = "RetentionPolicy"
                    }
                }

                if ($retentionPolicies) {
                    $retentionPolicies | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($retentionPolicies.Count) retention policies" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No retention policies found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover retention policies: $($_.Exception.Message)", @{Section="RetentionPolicies"})
            }

            # --- JOURNAL RULES ---
            try {
                Write-ModuleLog -ModuleName "Exchange" -Message "Discovering journal rules..." -Level "INFO"

                $journalRules = Get-JournalRule -ErrorAction SilentlyContinue | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Name
                        Identity = $_.Identity
                        Enabled = $_.Enabled
                        Recipient = $_.Recipient
                        JournalEmailAddress = $_.JournalEmailAddress
                        Scope = $_.Scope
                        _DataType = "JournalRule"
                    }
                }

                if ($journalRules) {
                    $journalRules | ForEach-Object { $null = $allDiscoveredData.Add($_) }
                    Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($journalRules.Count) journal rules" -Level "SUCCESS"
                } else {
                    Write-ModuleLog -ModuleName "Exchange" -Message "No journal rules found" -Level "INFO"
                }

            } catch {
                $Result.AddWarning("Failed to discover journal rules: $($_.Exception.Message)", @{Section="JournalRules"})
            }

            Write-ModuleLog -ModuleName "Exchange" -Message "=== Mail Flow Configuration Discovery Complete ===" -Level "HEADER"

        } else {
            Write-ModuleLog -ModuleName "Exchange" -Message "Exchange Online PowerShell not connected - skipping mail flow configuration discovery" -Level "WARN"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Mail flow data (transport rules, connectors, security policies) requires EXO connection" -Level "WARN"
        }

        # ============================================================================
        # DNS & MAIL ROUTING DISCOVERY (MX, SPF, DKIM, DMARC, Third-Party Detection)
        # Discover how mail actually flows to/from the organization
        # ============================================================================

        Write-ModuleLog -ModuleName "Exchange" -Message "=== DNS & Mail Routing Discovery ===" -Level "HEADER"

        # Get accepted domains for DNS checks
        $acceptedDomains = $allDiscoveredData | Where-Object { $_._DataType -eq 'AcceptedDomain' }

        if ($acceptedDomains -and $acceptedDomains.Count -gt 0) {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering DNS records for $($acceptedDomains.Count) domains..." -Level "INFO"

            foreach ($domain in $acceptedDomains) {
                $domainName = $domain.DomainName
                Write-ModuleLog -ModuleName "Exchange" -Message "Checking DNS for: $domainName" -Level "DEBUG"

                $dnsRecord = [PSCustomObject]@{
                    DomainName = $domainName
                    IsDefault = $domain.IsDefault
                    IsInitial = $domain.IsInitial
                    # MX Records
                    MXRecords = $null
                    MXPriorities = $null
                    MXProvider = $null
                    UsesThirdPartyGateway = $false
                    ThirdPartyService = $null
                    # SPF Record
                    SPFRecord = $null
                    SPFValid = $false
                    SPFIncludes = $null
                    # DKIM Records
                    DKIMSelector1 = $null
                    DKIMSelector2 = $null
                    DKIMConfigured = $false
                    # DMARC Record
                    DMARCRecord = $null
                    DMARCPolicy = $null
                    DMARCReportEmail = $null
                    # Mail Flow Summary
                    MailFlowPath = $null
                    _DataType = "DomainDNSRecord"
                }

                # --- MX Records ---
                try {
                    $mxRecords = Resolve-DnsName -Name $domainName -Type MX -ErrorAction SilentlyContinue
                    if ($mxRecords) {
                        $mxHosts = ($mxRecords | Where-Object { $_.Type -eq 'MX' } | Sort-Object Preference | ForEach-Object { $_.NameExchange }) -join ';'
                        $mxPriorities = ($mxRecords | Where-Object { $_.Type -eq 'MX' } | Sort-Object Preference | ForEach-Object { "$($_.Preference):$($_.NameExchange)" }) -join ';'
                        $dnsRecord.MXRecords = $mxHosts
                        $dnsRecord.MXPriorities = $mxPriorities

                        # Detect mail provider/gateway from MX records
                        $primaryMX = ($mxRecords | Where-Object { $_.Type -eq 'MX' } | Sort-Object Preference | Select-Object -First 1).NameExchange.ToLower()

                        if ($primaryMX) {
                            # Detect third-party mail gateways
                            $thirdPartyDetected = $false
                            $serviceName = $null
                            $mailFlowPath = "Unknown"

                            switch -Wildcard ($primaryMX) {
                                # Microsoft 365 / Exchange Online
                                '*.mail.protection.outlook.com' {
                                    $dnsRecord.MXProvider = 'Microsoft 365 (EOP)'
                                    $mailFlowPath = "Direct to Microsoft 365"
                                }
                                # Mimecast
                                '*.mimecast.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Mimecast'
                                    $dnsRecord.MXProvider = 'Mimecast Gateway'
                                    $mailFlowPath = "Mimecast -> Microsoft 365"
                                }
                                '*mimecast*' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Mimecast'
                                    $dnsRecord.MXProvider = 'Mimecast Gateway'
                                    $mailFlowPath = "Mimecast -> Microsoft 365"
                                }
                                # Proofpoint
                                '*.pphosted.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Proofpoint'
                                    $dnsRecord.MXProvider = 'Proofpoint Gateway'
                                    $mailFlowPath = "Proofpoint -> Microsoft 365"
                                }
                                '*proofpoint*' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Proofpoint'
                                    $dnsRecord.MXProvider = 'Proofpoint Gateway'
                                    $mailFlowPath = "Proofpoint -> Microsoft 365"
                                }
                                # Barracuda
                                '*.barracudanetworks.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Barracuda'
                                    $dnsRecord.MXProvider = 'Barracuda Gateway'
                                    $mailFlowPath = "Barracuda -> Microsoft 365"
                                }
                                '*barracuda*' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Barracuda'
                                    $dnsRecord.MXProvider = 'Barracuda Gateway'
                                    $mailFlowPath = "Barracuda -> Microsoft 365"
                                }
                                # Cisco Email Security (IronPort)
                                '*.iphmx.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Cisco Email Security'
                                    $dnsRecord.MXProvider = 'Cisco IronPort Gateway'
                                    $mailFlowPath = "Cisco IronPort -> Microsoft 365"
                                }
                                '*ironport*' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Cisco IronPort'
                                    $dnsRecord.MXProvider = 'Cisco IronPort Gateway'
                                    $mailFlowPath = "Cisco IronPort -> Microsoft 365"
                                }
                                # Symantec/Broadcom
                                '*.messagelabs.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Symantec/Broadcom'
                                    $dnsRecord.MXProvider = 'Symantec MessageLabs'
                                    $mailFlowPath = "Symantec -> Microsoft 365"
                                }
                                # Forcepoint
                                '*.mailcontrol.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Forcepoint'
                                    $dnsRecord.MXProvider = 'Forcepoint Gateway'
                                    $mailFlowPath = "Forcepoint -> Microsoft 365"
                                }
                                # Trend Micro
                                '*.tmes.trendmicro.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Trend Micro'
                                    $dnsRecord.MXProvider = 'Trend Micro Gateway'
                                    $mailFlowPath = "Trend Micro -> Microsoft 365"
                                }
                                # Sophos
                                '*.sophos.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Sophos'
                                    $dnsRecord.MXProvider = 'Sophos Gateway'
                                    $mailFlowPath = "Sophos -> Microsoft 365"
                                }
                                # SpamTitan
                                '*.spamtitan.com' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'SpamTitan'
                                    $dnsRecord.MXProvider = 'SpamTitan Gateway'
                                    $mailFlowPath = "SpamTitan -> Microsoft 365"
                                }
                                # Cloudflare
                                '*.mx.cloudflare.net' {
                                    $thirdPartyDetected = $true
                                    $serviceName = 'Cloudflare Email Routing'
                                    $dnsRecord.MXProvider = 'Cloudflare'
                                    $mailFlowPath = "Cloudflare -> Microsoft 365"
                                }
                                # Google Workspace
                                '*.google.com' {
                                    $dnsRecord.MXProvider = 'Google Workspace'
                                    $mailFlowPath = "Google Workspace (not Microsoft 365)"
                                }
                                '*aspmx.l.google.com' {
                                    $dnsRecord.MXProvider = 'Google Workspace'
                                    $mailFlowPath = "Google Workspace (not Microsoft 365)"
                                }
                                # On-premises / Custom
                                default {
                                    $dnsRecord.MXProvider = "Custom/On-Premises: $primaryMX"
                                    $mailFlowPath = "Custom MX -> Unknown destination"
                                }
                            }

                            $dnsRecord.UsesThirdPartyGateway = $thirdPartyDetected
                            $dnsRecord.ThirdPartyService = $serviceName
                            $dnsRecord.MailFlowPath = $mailFlowPath
                        }
                    } else {
                        $dnsRecord.MXRecords = "No MX records found"
                        $dnsRecord.MXProvider = "None"
                    }
                } catch {
                    $dnsRecord.MXRecords = "DNS lookup failed: $($_.Exception.Message)"
                    Write-ModuleLog -ModuleName "Exchange" -Message "MX lookup failed for $domainName : $($_.Exception.Message)" -Level "DEBUG"
                }

                # --- SPF Record ---
                try {
                    $txtRecords = Resolve-DnsName -Name $domainName -Type TXT -ErrorAction SilentlyContinue
                    if ($txtRecords) {
                        $spfRecord = $txtRecords | Where-Object { $_.Strings -match '^v=spf1' } | Select-Object -First 1
                        if ($spfRecord) {
                            $spfText = $spfRecord.Strings -join ''
                            $dnsRecord.SPFRecord = $spfText
                            $dnsRecord.SPFValid = $true

                            # Extract includes
                            $includes = [regex]::Matches($spfText, 'include:([^\s]+)') | ForEach-Object { $_.Groups[1].Value }
                            $dnsRecord.SPFIncludes = ($includes -join ';')
                        } else {
                            $dnsRecord.SPFRecord = "No SPF record found"
                            $dnsRecord.SPFValid = $false
                        }
                    }
                } catch {
                    $dnsRecord.SPFRecord = "DNS lookup failed"
                    Write-ModuleLog -ModuleName "Exchange" -Message "SPF lookup failed for $domainName : $($_.Exception.Message)" -Level "DEBUG"
                }

                # --- DKIM Records (check common selectors) ---
                try {
                    # Microsoft 365 selectors
                    $selector1 = Resolve-DnsName -Name "selector1._domainkey.$domainName" -Type CNAME -ErrorAction SilentlyContinue
                    $selector2 = Resolve-DnsName -Name "selector2._domainkey.$domainName" -Type CNAME -ErrorAction SilentlyContinue

                    if ($selector1) {
                        $dnsRecord.DKIMSelector1 = ($selector1 | Where-Object { $_.Type -eq 'CNAME' }).NameHost
                        $dnsRecord.DKIMConfigured = $true
                    }
                    if ($selector2) {
                        $dnsRecord.DKIMSelector2 = ($selector2 | Where-Object { $_.Type -eq 'CNAME' }).NameHost
                        $dnsRecord.DKIMConfigured = $true
                    }

                    # If no Microsoft selectors, check for 'default' or 'google' selectors
                    if (-not $dnsRecord.DKIMConfigured) {
                        $defaultSelector = Resolve-DnsName -Name "default._domainkey.$domainName" -Type TXT -ErrorAction SilentlyContinue
                        $googleSelector = Resolve-DnsName -Name "google._domainkey.$domainName" -Type TXT -ErrorAction SilentlyContinue

                        if ($defaultSelector -or $googleSelector) {
                            $dnsRecord.DKIMConfigured = $true
                            if ($defaultSelector) { $dnsRecord.DKIMSelector1 = "default (TXT record present)" }
                            if ($googleSelector) { $dnsRecord.DKIMSelector2 = "google (TXT record present)" }
                        }
                    }
                } catch {
                    Write-ModuleLog -ModuleName "Exchange" -Message "DKIM lookup failed for $domainName : $($_.Exception.Message)" -Level "DEBUG"
                }

                # --- DMARC Record ---
                try {
                    $dmarcRecord = Resolve-DnsName -Name "_dmarc.$domainName" -Type TXT -ErrorAction SilentlyContinue
                    if ($dmarcRecord) {
                        $dmarcTxt = $dmarcRecord | Where-Object { $_.Strings -match '^v=DMARC1' } | Select-Object -First 1
                        if ($dmarcTxt) {
                            $dmarcText = $dmarcTxt.Strings -join ''
                            $dnsRecord.DMARCRecord = $dmarcText

                            # Extract policy
                            $policyMatch = [regex]::Match($dmarcText, 'p=(\w+)')
                            if ($policyMatch.Success) {
                                $dnsRecord.DMARCPolicy = $policyMatch.Groups[1].Value
                            }

                            # Extract report email
                            $ruaMatch = [regex]::Match($dmarcText, 'rua=([^;]+)')
                            if ($ruaMatch.Success) {
                                $dnsRecord.DMARCReportEmail = $ruaMatch.Groups[1].Value
                            }
                        } else {
                            $dnsRecord.DMARCRecord = "No DMARC record found"
                        }
                    } else {
                        $dnsRecord.DMARCRecord = "No DMARC record found"
                    }
                } catch {
                    $dnsRecord.DMARCRecord = "DNS lookup failed"
                    Write-ModuleLog -ModuleName "Exchange" -Message "DMARC lookup failed for $domainName : $($_.Exception.Message)" -Level "DEBUG"
                }

                $null = $allDiscoveredData.Add($dnsRecord)
            }

            # Summary logging
            $thirdPartyDomains = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DomainDNSRecord' -and $_.UsesThirdPartyGateway -eq $true })
            $directM365Domains = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DomainDNSRecord' -and $_.MXProvider -eq 'Microsoft 365 (EOP)' })
            $dkimConfigured = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DomainDNSRecord' -and $_.DKIMConfigured -eq $true })
            $dmarcConfigured = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DomainDNSRecord' -and $_.DMARCPolicy })

            Write-ModuleLog -ModuleName "Exchange" -Message "DNS Discovery Summary:" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Domains checked: $($acceptedDomains.Count)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Direct M365 routing: $($directM365Domains.Count)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  Third-party gateways: $($thirdPartyDomains.Count)" -Level "INFO"
            if ($thirdPartyDomains) {
                foreach ($tpd in $thirdPartyDomains) {
                    Write-ModuleLog -ModuleName "Exchange" -Message "    - $($tpd.DomainName): $($tpd.ThirdPartyService)" -Level "INFO"
                }
            }
            Write-ModuleLog -ModuleName "Exchange" -Message "  DKIM configured: $($dkimConfigured.Count)" -Level "INFO"
            Write-ModuleLog -ModuleName "Exchange" -Message "  DMARC configured: $($dmarcConfigured.Count)" -Level "INFO"

        } else {
            Write-ModuleLog -ModuleName "Exchange" -Message "No accepted domains found to check DNS records" -Level "WARN"
        }

        Write-ModuleLog -ModuleName "Exchange" -Message "=== DNS & Mail Routing Discovery Complete ===" -Level "HEADER"

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
                    # Mailbox Types
                    'Mailbox' { 'ExchangeMailboxes.csv' }
                    'SharedMailbox' { 'ExchangeSharedMailboxes.csv' }
                    'ResourceMailbox' { 'ExchangeResourceMailboxes.csv' }
                    'EquipmentMailbox' { 'ExchangeEquipmentMailboxes.csv' }
                    # Groups and Contacts
                    'DistributionGroup' { 'ExchangeDistributionGroups.csv' }
                    'MailContact' { 'ExchangeMailContacts.csv' }
                    # Domain Configuration
                    'AcceptedDomain' { 'ExchangeAcceptedDomains.csv' }
                    'RemoteDomain' { 'ExchangeRemoteDomains.csv' }
                    'DomainDNSRecord' { 'ExchangeDomainDNSRecords.csv' }
                    # Mail Flow Configuration
                    'TransportRule' { 'ExchangeTransportRules.csv' }
                    'InboundConnector' { 'ExchangeInboundConnectors.csv' }
                    'OutboundConnector' { 'ExchangeOutboundConnectors.csv' }
                    # Organization Configuration
                    'OrganizationConfig' { 'ExchangeOrganizationConfig.csv' }
                    'OrganizationRelationship' { 'ExchangeOrganizationRelationships.csv' }
                    # Security Policies
                    'DkimConfig' { 'ExchangeDkimConfig.csv' }
                    'AntiSpamPolicy' { 'ExchangeAntiSpamPolicies.csv' }
                    'AntiPhishPolicy' { 'ExchangeAntiPhishPolicies.csv' }
                    'MalwarePolicy' { 'ExchangeMalwarePolicies.csv' }
                    # Migration Configuration
                    'MigrationEndpoint' { 'ExchangeMigrationEndpoints.csv' }
                    'MigrationBatch' { 'ExchangeMigrationBatches.csv' }
                    # Compliance
                    'RetentionPolicy' { 'ExchangeRetentionPolicies.csv' }
                    'JournalRule' { 'ExchangeJournalRules.csv' }
                    # Fallback
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
                # Mailbox Statistics
                TotalMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' }).Count
                SharedMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SharedMailbox' }).Count
                ResourceMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'ResourceMailbox' }).Count
                EnabledMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and $_.AccountEnabled }).Count
                DisabledMailboxes = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and -not $_.AccountEnabled }).Count
                HybridUsers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and $_.OnPremisesSyncEnabled }).Count
                CloudOnlyUsers = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' -and -not $_.OnPremisesSyncEnabled }).Count
                # Groups and Contacts
                DistributionGroups = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' }).Count
                MailContacts = ($allDiscoveredData | Where-Object { $_._DataType -eq 'MailContact' }).Count
                DynamicGroups = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' -and $_.IsDynamicGroup }).Count
                Microsoft365Groups = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' -and $_.GroupType -eq 'Microsoft365' }).Count
                # Domain and DNS
                AcceptedDomains = ($allDiscoveredData | Where-Object { $_._DataType -eq 'AcceptedDomain' }).Count
                RemoteDomains = ($allDiscoveredData | Where-Object { $_._DataType -eq 'RemoteDomain' }).Count
                DomainsWithThirdPartyGateway = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DomainDNSRecord' -and $_.UsesThirdPartyGateway -eq $true }).Count
                DomainsWithDKIM = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DomainDNSRecord' -and $_.DKIMConfigured -eq $true }).Count
                DomainsWithDMARC = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DomainDNSRecord' -and $_.DMARCPolicy }).Count
                # Mail Flow Configuration
                TransportRules = ($allDiscoveredData | Where-Object { $_._DataType -eq 'TransportRule' }).Count
                TransportRulesEnabled = ($allDiscoveredData | Where-Object { $_._DataType -eq 'TransportRule' -and $_.State -eq 'Enabled' }).Count
                InboundConnectors = ($allDiscoveredData | Where-Object { $_._DataType -eq 'InboundConnector' }).Count
                OutboundConnectors = ($allDiscoveredData | Where-Object { $_._DataType -eq 'OutboundConnector' }).Count
                # Organization
                OrganizationRelationships = ($allDiscoveredData | Where-Object { $_._DataType -eq 'OrganizationRelationship' }).Count
                # Security Policies
                AntiSpamPolicies = ($allDiscoveredData | Where-Object { $_._DataType -eq 'AntiSpamPolicy' }).Count
                AntiPhishPolicies = ($allDiscoveredData | Where-Object { $_._DataType -eq 'AntiPhishPolicy' }).Count
                MalwarePolicies = ($allDiscoveredData | Where-Object { $_._DataType -eq 'MalwarePolicy' }).Count
                DkimConfigs = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DkimConfig' }).Count
                # Migration
                MigrationEndpoints = ($allDiscoveredData | Where-Object { $_._DataType -eq 'MigrationEndpoint' }).Count
                MigrationBatches = ($allDiscoveredData | Where-Object { $_._DataType -eq 'MigrationBatch' }).Count
                ActiveMigrations = ($allDiscoveredData | Where-Object { $_._DataType -eq 'MigrationBatch' -and $_.Status -notin @('Completed', 'Failed', 'Stopped') }).Count
                # Compliance
                RetentionPolicies = ($allDiscoveredData | Where-Object { $_._DataType -eq 'RetentionPolicy' }).Count
                JournalRules = ($allDiscoveredData | Where-Object { $_._DataType -eq 'JournalRule' }).Count
                # Totals
                TotalRecords = $allDiscoveredData.Count
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
