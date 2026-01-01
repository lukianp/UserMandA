# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.2.0
# Created: 2025-08-30
# Last Modified: 2026-01-01

<#
.SYNOPSIS
    OneDrive Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers OneDrive for Business sites, personal files, and storage configurations using Microsoft Graph API.
    This module provides comprehensive OneDrive discovery including personal document libraries, file analysis,
    storage usage, sync status, and sharing configurations essential for M&A data discovery and migration planning.
.NOTES
    Version: 1.2.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
    Modified: 2026-01-01 - Added direct OAuth2 authentication fallback, enhanced provisioning diagnostics
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>

# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Write-OneDriveLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter()]
        [string]$Level = "INFO",

        [Parameter()]
        [hashtable]$Context = @{}
    )

    Write-MandALog -Message $Message -Level $Level -Component "OneDriveDiscovery" -Context $Context
}

# Import required modules
Import-Module (Join-Path $PSScriptRoot "..\Authentication\AuthenticationService.psm1") -Force

# Import required Microsoft Graph modules
$graphModules = @(
    'Microsoft.Graph.Authentication',
    'Microsoft.Graph.Users',
    'Microsoft.Graph.Files',
    'Microsoft.Graph.Sites'
)

foreach ($module in $graphModules) {
    if (Get-Module -Name $module -ListAvailable -ErrorAction SilentlyContinue) {
        Import-Module $module -Force -DisableNameChecking -ErrorAction Continue
        Write-OneDriveLog -Level "DEBUG" -Message "Imported Microsoft Graph module: $module"
    } else {
        Write-OneDriveLog -Level "WARN" -Message "Microsoft Graph module not available: $module"
    }
}

function Invoke-OneDriveDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    # START: Enhanced discovery context validation and initialization
    Write-OneDriveLog -Level "HEADER" -Message "=== M&A OneDrive Discovery Module v1.2.0 ===" -Context $Context
    Write-OneDriveLog -Level "INFO" -Message "OAuth2 fallback authentication enabled" -Context $Context
    Write-OneDriveLog -Level "INFO" -Message "Enhanced provisioning diagnostics enabled" -Context $Context
    
    $result = [PSCustomObject]@{
        Success = $true
        Message = "OneDrive discovery completed successfully"
        Data = @{}
        Errors = @()
        Warnings = @()
        Context = $Context
    }
    
    # Helper to add errors with proper context
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($message, $exception, $location)
        $this.Success = $false
        $this.Errors += [PSCustomObject]@{
            Message = $message
            Exception = $exception
            Location = $location
            Timestamp = Get-Date
        }
        Write-OneDriveLog -Level "ERROR" -Message $message -Context $Context
    }
    
    # Helper to add warnings
    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Timestamp = Get-Date
        }
        Write-OneDriveLog -Level "WARN" -Message $message -Context $this.Context
    }
    
    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-OneDriveLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context

        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-OneDriveLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context

        Ensure-Path -Path $outputPath

        # 2a. EXTRACT AND VALIDATE CREDENTIALS FROM CONFIGURATION
        Write-OneDriveLog -Level "INFO" -Message "Extracting credentials from Configuration parameter..." -Context $Context

        $tenantId = $null
        $clientId = $null
        $clientSecret = $null
        $credentialsValid = $false

        # Check for credentials in Configuration
        if ($Configuration) {
            Write-OneDriveLog -Level "DEBUG" -Message "Configuration object provided, checking for credential properties..." -Context $Context

            # Check TenantId
            if ($Configuration.ContainsKey('TenantId') -and $Configuration.TenantId) {
                $tenantId = $Configuration.TenantId
                Write-OneDriveLog -Level "SUCCESS" -Message "TenantId found in Configuration: $tenantId" -Context $Context
            } else {
                Write-OneDriveLog -Level "WARN" -Message "TenantId not found in Configuration" -Context $Context
            }

            # Check ClientId
            if ($Configuration.ContainsKey('ClientId') -and $Configuration.ClientId) {
                $clientId = $Configuration.ClientId
                Write-OneDriveLog -Level "SUCCESS" -Message "ClientId found in Configuration: $clientId" -Context $Context
            } else {
                Write-OneDriveLog -Level "WARN" -Message "ClientId not found in Configuration" -Context $Context
            }

            # Check ClientSecret
            if ($Configuration.ContainsKey('ClientSecret') -and $Configuration.ClientSecret) {
                $clientSecret = $Configuration.ClientSecret
                $secretLength = if ($clientSecret -is [SecureString]) {
                    "SecureString"
                } elseif ($clientSecret -is [string]) {
                    "$($clientSecret.Length) characters"
                } else {
                    "Unknown type: $($clientSecret.GetType().Name)"
                }
                Write-OneDriveLog -Level "SUCCESS" -Message "ClientSecret found in Configuration: $secretLength" -Context $Context
            } else {
                Write-OneDriveLog -Level "WARN" -Message "ClientSecret not found in Configuration" -Context $Context
            }

            # Validate all three credentials are present
            if ($tenantId -and $clientId -and $clientSecret) {
                $credentialsValid = $true
                Write-OneDriveLog -Level "SUCCESS" -Message "All required credentials (TenantId, ClientId, ClientSecret) extracted from Configuration" -Context $Context
            } else {
                Write-OneDriveLog -Level "WARN" -Message "Incomplete credentials in Configuration. TenantId: $($null -ne $tenantId), ClientId: $($null -ne $clientId), ClientSecret: $($null -ne $clientSecret)" -Context $Context
            }
        } else {
            Write-OneDriveLog -Level "WARN" -Message "Configuration parameter is null or empty" -Context $Context
        }

        # Log configuration structure for debugging
        if ($Configuration) {
            $configKeys = $Configuration.Keys -join ', '
            Write-OneDriveLog -Level "DEBUG" -Message "Configuration keys available: $configKeys" -Context $Context
        }

        # Initialize Microsoft Graph authentication before any Graph calls
        Write-OneDriveLog -Level "INFO" -Message "Ensuring Microsoft Graph authentication is established..." -Context $Context
        Write-OneDriveLog -Level "DEBUG" -Message "Authentication status - Credentials valid: $credentialsValid, TenantId: $($null -ne $tenantId), ClientId: $($null -ne $clientId), ClientSecret: $($null -ne $clientSecret)" -Context $Context

        $graphContext = $null
        $authMethod = "None"

        # Method 1: Try session-based authentication first
        try {
            Write-OneDriveLog -Level "INFO" -Message "Attempting session-based Graph authentication..." -Context $Context
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId -ErrorAction Stop
            if ($graphAuth) {
                $authMethod = "SessionManager"
                Write-OneDriveLog -Level "SUCCESS" -Message "Microsoft Graph authentication established via SessionManager" -Context $Context
            }
        } catch {
            Write-OneDriveLog -Level "WARN" -Message "Session-based authentication failed: $($_.Exception.Message)" -Context $Context
        }

        # Method 2: Fallback to direct OAuth2 token acquisition if session auth failed
        if (-not $graphAuth -and $credentialsValid) {
            Write-OneDriveLog -Level "INFO" -Message "Falling back to direct OAuth2 authentication..." -Context $Context
            try {
                # Get access token using OAuth2 client credentials flow
                $tokenBody = @{
                    grant_type    = "client_credentials"
                    client_id     = $clientId
                    client_secret = if ($clientSecret -is [SecureString]) {
                        [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
                            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
                        )
                    } else { $clientSecret }
                    scope         = "https://graph.microsoft.com/.default"
                }

                $tokenUri = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
                Write-OneDriveLog -Level "DEBUG" -Message "Requesting access token from: $tokenUri" -Context $Context
                $tokenResponse = Invoke-RestMethod -Uri $tokenUri -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop

                if ($tokenResponse.access_token) {
                    Write-OneDriveLog -Level "SUCCESS" -Message "Access token acquired successfully via direct OAuth2" -Context $Context

                    # Create custom context object with the access token
                    $graphContext = [PSCustomObject]@{
                        AccessToken = $tokenResponse.access_token
                        TenantId    = $tenantId
                        ClientId    = $clientId
                        TokenType   = "Bearer"
                        ExpiresOn   = (Get-Date).AddSeconds($tokenResponse.expires_in)
                        Scopes      = @("https://graph.microsoft.com/.default")
                        IsCustom    = $true
                    }
                    $authMethod = "DirectOAuth2"

                    # Also connect via Connect-MgGraph for cmdlet compatibility
                    try {
                        $secureToken = ConvertTo-SecureString $tokenResponse.access_token -AsPlainText -Force
                        Connect-MgGraph -AccessToken $secureToken -NoWelcome -ErrorAction Stop
                        Write-OneDriveLog -Level "SUCCESS" -Message "Connected to Microsoft Graph using access token" -Context $Context
                    } catch {
                        Write-OneDriveLog -Level "WARN" -Message "Connect-MgGraph failed but REST API should still work: $($_.Exception.Message)" -Context $Context
                    }
                } else {
                    throw "Token response did not contain access_token"
                }
            } catch {
                $result.AddError("Failed to establish Microsoft Graph authentication via OAuth2: $($_.Exception.Message)", $_.Exception, "Graph OAuth2 Authentication")
                Write-OneDriveLog -Level "ERROR" -Message "OAuth2 authentication failure: $($_.Exception.Message)" -Context $Context
                return $result
            }
        }

        # Final check - if no auth method succeeded
        if (-not $graphAuth -and -not $graphContext) {
            $result.AddError("Failed to establish Microsoft Graph authentication. No valid credentials or session available.", $null, "Graph Authentication")
            Write-OneDriveLog -Level "ERROR" -Message "All authentication methods failed" -Context $Context
            return $result
        }

        Write-OneDriveLog -Level "SUCCESS" -Message "Authentication established via: $authMethod" -Context $Context

# 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
# OneDrive MUST have tenant name or auto-detect
if (-not $Configuration.discovery -or
    -not $Configuration.discovery.onedrive -or
    -not $Configuration.discovery.onedrive.tenantName) {
    # Enhanced tenant auto-detection using multiple methods
    try {
        Write-OneDriveLog -Level "INFO" -Message "Tenant name not configured, attempting enhanced auto-detection..." -Context $Context

        $tenantDetected = $false
        $detectionMethods = @()


                # Method 1: Get organization information
                try {
                    Write-OneDriveLog -Level "DEBUG" -Message "Attempting detection via organization data..." -Context $Context
                    $org = Get-MgOrganization -ErrorAction Stop
                    if ($org -and $org.VerifiedDomains) {
                        $defaultDomain = ($org.VerifiedDomains | Where-Object { $_.IsDefault }).Name
                        $tenantName = $defaultDomain -replace '\.onmicrosoft\.com$', ''
                        $detectionMethods += "Organization Default Domain"
                        $tenantDetected = $true
                        Write-OneDriveLog -Level "SUCCESS" -Message "Detected tenant via organization: $tenantName" -Context $Context
                    }
                } catch {
                    Write-OneDriveLog -Level "DEBUG" -Message "Organization method failed: $($_.Exception.Message)" -Context $Context
                }
                
                # Method 2: Try to get domains list (fallback)
                if (-not $tenantDetected) {
                    try {
                        Write-OneDriveLog -Level "DEBUG" -Message "Attempting detection via domains list..." -Context $Context
                        $domains = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/domains" -Method GET -ErrorAction Stop
                        if ($domains -and $domains.value) {
                            $onMicrosoftDomain = $domains.value | Where-Object { $_.id -like "*.onmicrosoft.com" -and $_.isDefault } | Select-Object -First 1
                            if ($onMicrosoftDomain) {
                                $tenantName = $onMicrosoftDomain.id -replace '\.onmicrosoft\.com$', ''
                                $detectionMethods += "Domains API"
                                $tenantDetected = $true
                                Write-OneDriveLog -Level "SUCCESS" -Message "Detected tenant via domains API: $tenantName" -Context $Context
                            }
                        }
                    } catch {
                        Write-OneDriveLog -Level "DEBUG" -Message "Domains API method failed: $($_.Exception.Message)" -Context $Context
                    }
                }
                
                if (-not $tenantDetected) {
                    $result.AddError("Could not auto-detect tenant name. Please specify tenantName in configuration.", $null, "Config Validation")
                    return $result
                }
                
                # Update configuration with detected tenant
                if (-not $Configuration.discovery) {
                    $Configuration.discovery = @{}
                }
                if (-not $Configuration.discovery.onedrive) {
                    $Configuration.discovery.onedrive = @{}
                }
                $Configuration.discovery.onedrive.tenantName = $tenantName
                Write-OneDriveLog -Level "SUCCESS" -Message "Auto-detected tenant name: $tenantName (Methods: $($detectionMethods -join ', '))" -Context $Context
                
            } catch {
                $result.AddError("Failed to auto-detect tenant name: $($_.Exception.Message)", $_.Exception, "Tenant Detection")
                return $result
            }
        } else {
            $tenantName = $Configuration.discovery.onedrive.tenantName
            Write-OneDriveLog -Level "INFO" -Message "Using configured tenant name: $tenantName" -Context $Context
        }

        # 4. VERIFY GRAPH CONNECTION
        Write-OneDriveLog -Level "INFO" -Message "Verifying Microsoft Graph connection..." -Context $Context
        try {
            $mgContext = Get-MgContext
            Write-OneDriveLog -Level "DEBUG" -Message "MgContext: $($mgContext | ConvertTo-Json -Depth 3)" -Context $Context

            if (-not $mgContext) {
                $result.AddError("Microsoft Graph context is null. Connection may have failed.", $null, "Graph Context")
                Write-OneDriveLog -Level "ERROR" -Message "Graph context validation failed - context is null" -Context $Context
                return $result
            }

            # Validate TenantId in context
            if (-not $mgContext.TenantId) {
                $result.AddError("Microsoft Graph context is missing TenantId.", $null, "Graph Context")
                Write-OneDriveLog -Level "ERROR" -Message "Graph context validation failed - TenantId is missing" -Context $Context
                return $result
            }

            # Validate ClientId in context
            if (-not $mgContext.ClientId) {
                $result.AddError("Microsoft Graph context is missing ClientId.", $null, "Graph Context")
                Write-OneDriveLog -Level "ERROR" -Message "Graph context validation failed - ClientId is missing" -Context $Context
                return $result
            }

            # Log authentication details
            Write-OneDriveLog -Level "SUCCESS" -Message "Microsoft Graph TenantId validated: $($mgContext.TenantId)" -Context $Context
            Write-OneDriveLog -Level "SUCCESS" -Message "Microsoft Graph ClientId validated: $($mgContext.ClientId)" -Context $Context

            # Compare with Configuration credentials if available
            if ($credentialsValid) {
                $tenantMatch = ($mgContext.TenantId -eq $tenantId)
                $clientMatch = ($mgContext.ClientId -eq $clientId)

                Write-OneDriveLog -Level "INFO" -Message "Credential validation - TenantId match: $tenantMatch, ClientId match: $clientMatch" -Context $Context

                if (-not $tenantMatch) {
                    Write-OneDriveLog -Level "WARN" -Message "TenantId mismatch - Configuration: $tenantId, Graph Context: $($mgContext.TenantId)" -Context $Context
                }

                if (-not $clientMatch) {
                    Write-OneDriveLog -Level "WARN" -Message "ClientId mismatch - Configuration: $clientId, Graph Context: $($mgContext.ClientId)" -Context $Context
                }
            }

            # For service principal authentication, Account will be null but connection is still valid
            $accountDisplay = if ($mgContext.Account) {
                "Account: $($mgContext.Account)"
            } else {
                "App Authentication: $($mgContext.AppName -or 'Service Principal')"
            }

            $authType = if ($mgContext.Account) { "User Authentication" } else { "Service Principal Authentication" }
            Write-OneDriveLog -Level "SUCCESS" -Message "Microsoft Graph connection verified. Type: $authType, $accountDisplay" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "Graph Scopes: $($mgContext.Scopes -join ', ')" -Context $Context

        } catch {
            $result.AddError("Failed to verify Microsoft Graph connection: $($_.Exception.Message)", $_.Exception, "Graph Context")
            Write-OneDriveLog -Level "ERROR" -Message "Graph context verification exception: $($_.Exception.Message)" -Context $Context
            return $result
        }

        # 5. DISCOVERY EXECUTION
        Write-OneDriveLog -Level "HEADER" -Message "=== OneDrive Discovery Module v1.2.0 ===" -Context $Context
        Write-OneDriveLog -Level "HEADER" -Message "Starting OneDrive Discovery Process" -Context $Context

        $discoveryData = @{
            Users = @()
            OneDriveSites = @()
            DriveItems = @()
            SharingLinks = @()
            StorageUsage = @()
            StorageQuotas = @()      # NEW: Storage quota analysis
            FileTypeAnalysis = @()   # NEW: File type breakdown
            SharingAnalysis = @()    # NEW: Detailed sharing analysis
            Statistics = @{
                TotalUsers = 0
                TotalDrives = 0
                TotalFiles = 0
                TotalFolders = 0
                TotalSize = 0
                TotalQuota = 0
                SharedItems = 0
                ExternalShares = 0
                InternalShares = 0
                AnonymousLinks = 0
                CompanyWideLinks = 0
                HighStorageUsers = 0   # Users >80% storage
                LowStorageUsers = 0    # Users <20% storage
                InactiveUsers = 0      # No activity in 90 days
                LastSyncUsers = 0
                # Provisioning diagnostics
                UsersWithOneDrive = 0
                UsersWithoutOneDrive = 0
                UsersWithOneDriveLicense = 0
                UsersWithoutLicense = 0
                UsersNotProvisioned = 0
                UsersWithErrors = 0
            }
            UsersWithoutOneDrive = @()  # Detailed tracking of users missing OneDrive
        }

        # 5a. Discover all users with OneDrive
        Write-OneDriveLog -Level "INFO" -Message "Discovering users with OneDrive..." -Context $Context

        # OneDrive license SKU identifiers (common ones)
        $oneDriveLicenseSkus = @(
            "a403ebcc-fae0-4ca2-8c8c-7a907fd6c235",  # Microsoft 365 E5
            "6fd2c87f-b296-42f0-b197-1e91e994b900",  # Microsoft 365 E3
            "05e9a617-0261-4cee-bb44-138d3ef5d965",  # Microsoft 365 E5 Developer
            "06ebc4ee-1bb5-47dd-8120-11324bc54e06",  # Microsoft 365 Business Basic
            "cbdc14ab-d96c-4c30-b9f4-6ada7cdc1d46",  # Microsoft 365 Business Standard
            "b05e124f-c7cc-45a0-a6aa-8cf78c946968",  # Microsoft 365 Business Premium
            "c7df2760-2c81-4ef7-b578-5b5392b571df",  # OneDrive for Business Plan 1
            "afcafa6a-d966-4462-918c-ec0b4e0fe642",  # OneDrive for Business Plan 2
            "18181a46-0d4e-45cd-891e-60aabd171b4e"   # Office 365 E1
        )

        try {
            $users = Get-MgUser -All -Property Id,UserPrincipalName,DisplayName,Mail,JobTitle,Department,AccountEnabled,AssignedLicenses,AssignedPlans -ErrorAction Stop
            $discoveryData.Statistics.TotalUsers = $users.Count
            Write-OneDriveLog -Level "SUCCESS" -Message "Found $($users.Count) users" -Context $Context

            $processedUsers = 0
            foreach ($user in $users) {
                $processedUsers++
                if ($processedUsers % 10 -eq 0 -or $processedUsers -eq $users.Count) {
                    Write-OneDriveLog -Level "INFO" -Message "Processing user $processedUsers of $($users.Count): $($user.UserPrincipalName)..." -Context $Context
                }

                # Check if user has OneDrive-capable license
                $hasOneDriveLicense = $false
                $licenseNames = @()
                if ($user.AssignedLicenses -and $user.AssignedLicenses.Count -gt 0) {
                    foreach ($license in $user.AssignedLicenses) {
                        if ($oneDriveLicenseSkus -contains $license.SkuId) {
                            $hasOneDriveLicense = $true
                            $licenseNames += $license.SkuId
                        }
                    }
                    if ($hasOneDriveLicense) {
                        $discoveryData.Statistics.UsersWithOneDriveLicense++
                    }
                }

                try {
                    # Get user's OneDrive
                    $drive = Get-MgUserDrive -UserId $user.Id -ErrorAction Stop
                    if ($drive) {
                        $discoveryData.Statistics.TotalDrives++
                        $discoveryData.Statistics.UsersWithOneDrive++
                        
                        # Calculate usage percentage
                        $usagePercent = if ($drive.Quota.Total -gt 0) { [math]::Round(($drive.Quota.Used / $drive.Quota.Total) * 100, 2) } else { 0 }

                        # Determine storage status
                        $storageStatus = "Normal"
                        if ($usagePercent -ge 90) { $storageStatus = "Critical" }
                        elseif ($usagePercent -ge 80) { $storageStatus = "Warning"; $discoveryData.Statistics.HighStorageUsers++ }
                        elseif ($usagePercent -lt 20) { $storageStatus = "Low"; $discoveryData.Statistics.LowStorageUsers++ }

                        # Check for inactivity (90+ days)
                        $daysSinceAccess = if ($drive.LastModifiedDateTime) {
                            ((Get-Date) - [DateTime]$drive.LastModifiedDateTime).Days
                        } else { 999 }
                        if ($daysSinceAccess -gt 90) { $discoveryData.Statistics.InactiveUsers++ }

                        # Get drive usage information
                        $driveUsage = [PSCustomObject]@{
                            UserId = $user.Id
                            UserPrincipalName = $user.UserPrincipalName
                            DisplayName = $user.DisplayName
                            Mail = $user.Mail
                            JobTitle = $user.JobTitle
                            Department = $user.Department
                            AccountEnabled = $user.AccountEnabled
                            DriveId = $drive.Id
                            DriveName = $drive.Name
                            DriveType = $drive.DriveType
                            TotalSize = $drive.Quota.Total
                            UsedSize = $drive.Quota.Used
                            RemainingSize = $drive.Quota.Remaining
                            DeletedSize = $drive.Quota.Deleted
                            AvailableSize = $drive.Quota.Available
                            UsagePercentage = $usagePercent
                            StorageStatus = $storageStatus
                            DaysSinceLastAccess = $daysSinceAccess
                            LastAccessedDateTime = $drive.LastModifiedDateTime
                            CreatedDateTime = $drive.CreatedDateTime
                            WebUrl = $drive.WebUrl
                        }

                        $discoveryData.Users += $driveUsage
                        $discoveryData.Statistics.TotalSize += $drive.Quota.Used
                        $discoveryData.Statistics.TotalQuota += $drive.Quota.Total
                        
                        # Get OneDrive site information
                        try {
                            $site = Get-MgSite -SiteId $drive.SharePointIds.SiteId -ErrorAction SilentlyContinue
                            if ($site) {
                                $siteInfo = [PSCustomObject]@{
                                    UserId = $user.Id
                                    UserPrincipalName = $user.UserPrincipalName
                                    SiteId = $site.Id
                                    SiteName = $site.DisplayName
                                    SiteUrl = $site.WebUrl
                                    CreatedDateTime = $site.CreatedDateTime
                                    LastModifiedDateTime = $site.LastModifiedDateTime
                                    Description = $site.Description
                                    IsPersonalSite = $true
                                }
                                $discoveryData.OneDriveSites += $siteInfo
                            }
                        } catch {
                            Write-OneDriveLog -Level "DEBUG" -Message "Could not get site info for user $($user.UserPrincipalName): $($_.Exception.Message)" -Context $Context
                        }
                        
                        # Sample top-level files and folders (first 100 items)
                        try {
                            $driveItems = Get-MgDriveItem -DriveId $drive.Id -Top 100 -ErrorAction SilentlyContinue
                            foreach ($item in $driveItems) {
                                $itemType = if ($item.Folder) { "Folder" } else { "File" }
                                $extension = if ($item.File) { [System.IO.Path]::GetExtension($item.Name).ToLower() } else { $null }

                                if ($itemType -eq "Folder") {
                                    $discoveryData.Statistics.TotalFolders++
                                } else {
                                    $discoveryData.Statistics.TotalFiles++
                                }

                                # Categorize file type
                                $fileCategory = "Other"
                                if ($extension) {
                                    switch -Regex ($extension) {
                                        '\.(docx?|xlsx?|pptx?|pdf)$' { $fileCategory = "Office" }
                                        '\.(jpg|jpeg|png|gif|bmp|svg|webp)$' { $fileCategory = "Image" }
                                        '\.(mp4|mov|avi|wmv|mkv)$' { $fileCategory = "Video" }
                                        '\.(mp3|wav|m4a|flac)$' { $fileCategory = "Audio" }
                                        '\.(zip|rar|7z|tar|gz)$' { $fileCategory = "Archive" }
                                        '\.(txt|csv|json|xml|log)$' { $fileCategory = "Text" }
                                        '\.(exe|msi|dll|bat|ps1)$' { $fileCategory = "Executable" }
                                    }
                                }

                                $itemInfo = [PSCustomObject]@{
                                    UserId = $user.Id
                                    UserPrincipalName = $user.UserPrincipalName
                                    DriveId = $drive.Id
                                    ItemId = $item.Id
                                    ItemName = $item.Name
                                    ItemType = $itemType
                                    FileCategory = $fileCategory
                                    Size = $item.Size
                                    CreatedDateTime = $item.CreatedDateTime
                                    LastModifiedDateTime = $item.LastModifiedDateTime
                                    WebUrl = $item.WebUrl
                                    ParentPath = $item.ParentReference.Path
                                    MimeType = $item.File.MimeType
                                    Extension = $extension
                                    HasChildren = if ($item.Folder) { $item.Folder.ChildCount -gt 0 } else { $false }
                                    ChildCount = if ($item.Folder) { $item.Folder.ChildCount } else { 0 }
                                }

                                $discoveryData.DriveItems += $itemInfo
                                
                                # Check for sharing links
                                try {
                                    $permissions = Get-MgDriveItemPermission -DriveId $drive.Id -DriveItemId $item.Id -ErrorAction SilentlyContinue
                                    foreach ($permission in $permissions) {
                                        $discoveryData.Statistics.SharedItems++

                                        # Determine share classification
                                        $shareClassification = "Direct"
                                        $isExternal = $false
                                        $isAnonymous = $false

                                        if ($permission.Link) {
                                            if ($permission.Link.Scope -eq "anonymous") {
                                                $shareClassification = "Anonymous"
                                                $isAnonymous = $true
                                                $discoveryData.Statistics.AnonymousLinks++
                                            } elseif ($permission.Link.Scope -eq "organization") {
                                                $shareClassification = "CompanyWide"
                                                $discoveryData.Statistics.CompanyWideLinks++
                                            } elseif ($permission.Link.Scope -eq "users") {
                                                $shareClassification = "SpecificPeople"
                                            }
                                        }

                                        if ($permission.GrantedToV2.User.Email) {
                                            $isExternal = -not $permission.GrantedToV2.User.Email.EndsWith($tenantName + ".onmicrosoft.com")
                                            if ($isExternal) {
                                                $discoveryData.Statistics.ExternalShares++
                                            } else {
                                                $discoveryData.Statistics.InternalShares++
                                            }
                                        }

                                        # Calculate risk level
                                        $riskLevel = "Low"
                                        if ($isAnonymous) { $riskLevel = "High" }
                                        elseif ($isExternal) { $riskLevel = "Medium" }

                                        $shareInfo = [PSCustomObject]@{
                                            UserId = $user.Id
                                            UserPrincipalName = $user.UserPrincipalName
                                            DriveId = $drive.Id
                                            ItemId = $item.Id
                                            ItemName = $item.Name
                                            ItemSize = $item.Size
                                            FileCategory = $fileCategory
                                            PermissionId = $permission.Id
                                            PermissionType = $permission.Roles -join ','
                                            ShareType = $permission.Link.Type
                                            ShareScope = $permission.Link.Scope
                                            ShareClassification = $shareClassification
                                            RiskLevel = $riskLevel
                                            SharedWithEmail = if ($permission.GrantedToV2.User) { $permission.GrantedToV2.User.Email } else { $null }
                                            SharedWithDisplayName = if ($permission.GrantedToV2.User) { $permission.GrantedToV2.User.DisplayName } else { $null }
                                            IsExternalShare = $isExternal
                                            IsAnonymousLink = $isAnonymous
                                            CreatedDateTime = $permission.CreatedDateTime
                                            ExpirationDateTime = $permission.ExpirationDateTime
                                            HasExpiration = ($null -ne $permission.ExpirationDateTime)
                                        }

                                        $discoveryData.SharingLinks += $shareInfo
                                    }
                                } catch {
                                    Write-OneDriveLog -Level "DEBUG" -Message "Could not get permissions for item $($item.Name): $($_.Exception.Message)" -Context $Context
                                }
                            }
                        } catch {
                            Write-OneDriveLog -Level "DEBUG" -Message "Could not enumerate drive items for user $($user.UserPrincipalName): $($_.Exception.Message)" -Context $Context
                        }
                    }
                } catch {
                    # Track users without OneDrive with detailed reason
                    $errorMessage = $_.Exception.Message
                    $discoveryData.Statistics.UsersWithoutOneDrive++

                    # Determine the reason for no OneDrive
                    $reason = "Unknown"
                    $status = "Error"
                    if ($errorMessage -match "ResourceNotFound" -or $errorMessage -match "itemNotFound" -or $errorMessage -match "404") {
                        if (-not $hasOneDriveLicense) {
                            $reason = "No OneDrive-capable license assigned"
                            $status = "NoLicense"
                            $discoveryData.Statistics.UsersWithoutLicense++
                        } else {
                            $reason = "OneDrive not provisioned (licensed but never activated)"
                            $status = "NotProvisioned"
                            $discoveryData.Statistics.UsersNotProvisioned++
                        }
                    } elseif ($errorMessage -match "Forbidden" -or $errorMessage -match "AccessDenied" -or $errorMessage -match "403") {
                        $reason = "Access denied to OneDrive (may be disabled or restricted)"
                        $status = "AccessDenied"
                        $discoveryData.Statistics.UsersWithErrors++
                    } else {
                        $reason = "Error: $errorMessage"
                        $status = "Error"
                        $discoveryData.Statistics.UsersWithErrors++
                    }

                    # Log at INFO level for visibility
                    Write-OneDriveLog -Level "WARN" -Message "No OneDrive for $($user.UserPrincipalName): $reason" -Context $Context

                    # Track detailed information
                    $noOneDriveUser = [PSCustomObject]@{
                        UserId = $user.Id
                        UserPrincipalName = $user.UserPrincipalName
                        DisplayName = $user.DisplayName
                        Mail = $user.Mail
                        JobTitle = $user.JobTitle
                        Department = $user.Department
                        AccountEnabled = $user.AccountEnabled
                        HasOneDriveLicense = $hasOneDriveLicense
                        LicenseCount = if ($user.AssignedLicenses) { $user.AssignedLicenses.Count } else { 0 }
                        Status = $status
                        Reason = $reason
                        ErrorMessage = if ($status -eq "Error") { $errorMessage } else { $null }
                        DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    }
                    $discoveryData.UsersWithoutOneDrive += $noOneDriveUser
                }
            }

            Write-OneDriveLog -Level "SUCCESS" -Message "Completed OneDrive discovery for $($users.Count) users" -Context $Context
            Write-OneDriveLog -Level "HEADER" -Message "=== OneDrive Discovery Summary ===" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "  Total Users: $($discoveryData.Statistics.TotalUsers)" -Context $Context
            Write-OneDriveLog -Level "SUCCESS" -Message "  Users WITH OneDrive: $($discoveryData.Statistics.UsersWithOneDrive)" -Context $Context
            Write-OneDriveLog -Level "WARN" -Message "  Users WITHOUT OneDrive: $($discoveryData.Statistics.UsersWithoutOneDrive)" -Context $Context
            if ($discoveryData.Statistics.UsersWithoutLicense -gt 0) {
                Write-OneDriveLog -Level "INFO" -Message "    - No License: $($discoveryData.Statistics.UsersWithoutLicense)" -Context $Context
            }
            if ($discoveryData.Statistics.UsersNotProvisioned -gt 0) {
                Write-OneDriveLog -Level "INFO" -Message "    - Not Provisioned: $($discoveryData.Statistics.UsersNotProvisioned)" -Context $Context
            }
            if ($discoveryData.Statistics.UsersWithErrors -gt 0) {
                Write-OneDriveLog -Level "ERROR" -Message "    - Errors: $($discoveryData.Statistics.UsersWithErrors)" -Context $Context
            }
            Write-OneDriveLog -Level "INFO" -Message "  - Total Drives: $($discoveryData.Statistics.TotalDrives)" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "  - Files: $($discoveryData.Statistics.TotalFiles), Folders: $($discoveryData.Statistics.TotalFolders)" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "  - Total Storage Used: $([math]::Round($discoveryData.Statistics.TotalSize / 1GB, 2)) GB" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "  - Total Quota: $([math]::Round($discoveryData.Statistics.TotalQuota / 1GB, 2)) GB" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "  - Shared Items: $($discoveryData.Statistics.SharedItems) (Internal: $($discoveryData.Statistics.InternalShares), External: $($discoveryData.Statistics.ExternalShares))" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "  - Anonymous Links: $($discoveryData.Statistics.AnonymousLinks), Company-Wide Links: $($discoveryData.Statistics.CompanyWideLinks)" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "  - High Storage Users (>80%): $($discoveryData.Statistics.HighStorageUsers), Inactive Users (90+ days): $($discoveryData.Statistics.InactiveUsers)" -Context $Context
            
        } catch {
            $result.AddError("Failed to discover OneDrive information: $($_.Exception.Message)", $_.Exception, "OneDrive Discovery")
        }

        # 6. SAVE DISCOVERY DATA TO CSV FILES
        Write-OneDriveLog -Level "INFO" -Message "Saving discovery data to CSV files..." -Context $Context
        
        try {
            # Save Users with OneDrive data
            if ($discoveryData.Users.Count -gt 0) {
                $csvPath = Join-Path $outputPath "OneDriveUsers.csv"
                $discoveryData.Users | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-OneDriveLog -Level "SUCCESS" -Message "Saved $($discoveryData.Users.Count) OneDrive users to $csvPath" -Context $Context
            }
            
            # Save OneDrive Sites data
            if ($discoveryData.OneDriveSites.Count -gt 0) {
                $csvPath = Join-Path $outputPath "OneDriveSites.csv"
                $discoveryData.OneDriveSites | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-OneDriveLog -Level "SUCCESS" -Message "Saved $($discoveryData.OneDriveSites.Count) OneDrive sites to $csvPath" -Context $Context
            }
            
            # Save Drive Items data
            if ($discoveryData.DriveItems.Count -gt 0) {
                $csvPath = Join-Path $outputPath "OneDriveItems.csv"
                $discoveryData.DriveItems | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-OneDriveLog -Level "SUCCESS" -Message "Saved $($discoveryData.DriveItems.Count) OneDrive items to $csvPath" -Context $Context
            }
            
            # Save Sharing Links data
            if ($discoveryData.SharingLinks.Count -gt 0) {
                $csvPath = Join-Path $outputPath "OneDriveSharingLinks.csv"
                $discoveryData.SharingLinks | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-OneDriveLog -Level "SUCCESS" -Message "Saved $($discoveryData.SharingLinks.Count) OneDrive sharing links to $csvPath" -Context $Context
            }

            # Save Users WITHOUT OneDrive (diagnostic data)
            if ($discoveryData.UsersWithoutOneDrive.Count -gt 0) {
                $csvPath = Join-Path $outputPath "OneDriveUsersWithoutOneDrive.csv"
                $discoveryData.UsersWithoutOneDrive | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-OneDriveLog -Level "WARN" -Message "Saved $($discoveryData.UsersWithoutOneDrive.Count) users WITHOUT OneDrive to $csvPath" -Context $Context
            }

            # Save Statistics summary
            $statsPath = Join-Path $outputPath "OneDriveStatistics.csv"
            $statsObject = [PSCustomObject]@{
                DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                TenantName = $tenantName
                TotalUsers = $discoveryData.Statistics.TotalUsers
                TotalDrives = $discoveryData.Statistics.TotalDrives
                # Provisioning diagnostics
                UsersWithOneDrive = $discoveryData.Statistics.UsersWithOneDrive
                UsersWithoutOneDrive = $discoveryData.Statistics.UsersWithoutOneDrive
                UsersWithOneDriveLicense = $discoveryData.Statistics.UsersWithOneDriveLicense
                UsersWithoutLicense = $discoveryData.Statistics.UsersWithoutLicense
                UsersNotProvisioned = $discoveryData.Statistics.UsersNotProvisioned
                UsersWithErrors = $discoveryData.Statistics.UsersWithErrors
                OneDriveAdoptionPercent = if ($discoveryData.Statistics.TotalUsers -gt 0) {
                    [math]::Round(($discoveryData.Statistics.UsersWithOneDrive / $discoveryData.Statistics.TotalUsers) * 100, 1)
                } else { 0 }
                # Storage statistics
                TotalFiles = $discoveryData.Statistics.TotalFiles
                TotalFolders = $discoveryData.Statistics.TotalFolders
                TotalSizeBytes = $discoveryData.Statistics.TotalSize
                TotalSizeGB = [math]::Round($discoveryData.Statistics.TotalSize / 1GB, 2)
                TotalQuotaBytes = $discoveryData.Statistics.TotalQuota
                TotalQuotaGB = [math]::Round($discoveryData.Statistics.TotalQuota / 1GB, 2)
                StorageUsagePercent = if ($discoveryData.Statistics.TotalQuota -gt 0) {
                    [math]::Round(($discoveryData.Statistics.TotalSize / $discoveryData.Statistics.TotalQuota) * 100, 2)
                } else { 0 }
                # Sharing statistics
                SharedItems = $discoveryData.Statistics.SharedItems
                InternalShares = $discoveryData.Statistics.InternalShares
                ExternalShares = $discoveryData.Statistics.ExternalShares
                AnonymousLinks = $discoveryData.Statistics.AnonymousLinks
                CompanyWideLinks = $discoveryData.Statistics.CompanyWideLinks
                # User status
                HighStorageUsers = $discoveryData.Statistics.HighStorageUsers
                LowStorageUsers = $discoveryData.Statistics.LowStorageUsers
                InactiveUsers = $discoveryData.Statistics.InactiveUsers
            }
            @($statsObject) | Export-Csv -Path $statsPath -NoTypeInformation -Encoding UTF8
            Write-OneDriveLog -Level "SUCCESS" -Message "Saved OneDrive statistics to $statsPath" -Context $Context
            
        } catch {
            $result.AddError("Failed to save discovery data: $($_.Exception.Message)", $_.Exception, "Data Export")
        }

        # 7. SET RESULT DATA
        $result.Data = $discoveryData
        
        Write-OneDriveLog -Level "HEADER" -Message "=== M&A OneDrive Discovery Module Completed ===" -Context $Context
        Write-OneDriveLog -Level "SUCCESS" -Message "OneDrive discovery completed successfully" -Context $Context
        
    } catch {
        $result.AddError("Unexpected error in OneDrive discovery: $($_.Exception.Message)", $_.Exception, "Main Function")
    }
    
    return $result
}

# Helper function to ensure path exists
function Ensure-Path {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -ItemType Directory -Force | Out-Null
    }
}

Export-ModuleMember -Function Invoke-OneDriveDiscovery