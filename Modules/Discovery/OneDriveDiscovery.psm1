# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-30
# Last Modified: 2025-08-31

<#
.SYNOPSIS
    OneDrive Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers OneDrive for Business sites, personal files, and storage configurations using Microsoft Graph API. 
    This module provides comprehensive OneDrive discovery including personal document libraries, file analysis, 
    storage usage, sync status, and sharing configurations essential for M&A data discovery and migration planning.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
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
    Write-OneDriveLog -Level "HEADER" -Message "=== M&A OneDrive Discovery Module Starting ===" -Context $Context
    
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

        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-OneDriveLog -Level "DEBUG" -Message "Graph authentication result: $($graphAuth | ConvertTo-Json)" -Context $Context
            if (-not $graphAuth) {
                throw "Failed to establish Graph authentication - returned null"
            }
            Write-OneDriveLog -Level "SUCCESS" -Message "Microsoft Graph authentication established successfully" -Context $Context
        } catch {
            $result.AddError("Failed to establish Microsoft Graph authentication: $($_.Exception.Message)", $_.Exception, "Graph Authentication")
            Write-OneDriveLog -Level "ERROR" -Message "Authentication failure details - Credentials extracted: $credentialsValid" -Context $Context
            return $result
        }

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
        Write-OneDriveLog -Level "HEADER" -Message "Starting OneDrive Discovery Process" -Context $Context
        
        $discoveryData = @{
            Users = @()
            OneDriveSites = @()
            DriveItems = @()
            SharingLinks = @()
            StorageUsage = @()
            Statistics = @{
                TotalUsers = 0
                TotalDrives = 0
                TotalFiles = 0
                TotalSize = 0
                SharedItems = 0
                ExternalShares = 0
                LastSyncUsers = 0
            }
        }

        # 5a. Discover all users with OneDrive
        Write-OneDriveLog -Level "INFO" -Message "Discovering users with OneDrive..." -Context $Context
        try {
            $users = Get-MgUser -All -Property Id,UserPrincipalName,DisplayName,Mail,JobTitle,Department,AccountEnabled -ErrorAction Stop
            $discoveryData.Statistics.TotalUsers = $users.Count
            Write-OneDriveLog -Level "SUCCESS" -Message "Found $($users.Count) users" -Context $Context
            
            $processedUsers = 0
            foreach ($user in $users) {
                $processedUsers++
                if ($processedUsers % 50 -eq 0) {
                    Write-OneDriveLog -Level "INFO" -Message "Processed $processedUsers of $($users.Count) users..." -Context $Context
                }
                
                try {
                    # Get user's OneDrive
                    $drive = Get-MgUserDrive -UserId $user.Id -ErrorAction SilentlyContinue
                    if ($drive) {
                        $discoveryData.Statistics.TotalDrives++
                        
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
                            UsagePercentage = if ($drive.Quota.Total -gt 0) { [math]::Round(($drive.Quota.Used / $drive.Quota.Total) * 100, 2) } else { 0 }
                            LastAccessedDateTime = $drive.LastModifiedDateTime
                            CreatedDateTime = $drive.CreatedDateTime
                            WebUrl = $drive.WebUrl
                        }
                        
                        $discoveryData.Users += $driveUsage
                        $discoveryData.Statistics.TotalSize += $drive.Quota.Used
                        
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
                                $discoveryData.Statistics.TotalFiles++
                                
                                $itemInfo = [PSCustomObject]@{
                                    UserId = $user.Id
                                    UserPrincipalName = $user.UserPrincipalName
                                    DriveId = $drive.Id
                                    ItemId = $item.Id
                                    ItemName = $item.Name
                                    ItemType = if ($item.Folder) { "Folder" } else { "File" }
                                    Size = $item.Size
                                    CreatedDateTime = $item.CreatedDateTime
                                    LastModifiedDateTime = $item.LastModifiedDateTime
                                    WebUrl = $item.WebUrl
                                    ParentPath = $item.ParentReference.Path
                                    MimeType = $item.File.MimeType
                                    Extension = if ($item.File) { [System.IO.Path]::GetExtension($item.Name) } else { $null }
                                    HasChildren = if ($item.Folder) { $item.Folder.ChildCount -gt 0 } else { $false }
                                }
                                
                                $discoveryData.DriveItems += $itemInfo
                                
                                # Check for sharing links
                                try {
                                    $permissions = Get-MgDriveItemPermission -DriveId $drive.Id -DriveItemId $item.Id -ErrorAction SilentlyContinue
                                    foreach ($permission in $permissions) {
                                        $discoveryData.Statistics.SharedItems++
                                        
                                        $shareInfo = [PSCustomObject]@{
                                            UserId = $user.Id
                                            UserPrincipalName = $user.UserPrincipalName
                                            DriveId = $drive.Id
                                            ItemId = $item.Id
                                            ItemName = $item.Name
                                            PermissionId = $permission.Id
                                            PermissionType = $permission.Roles -join ','
                                            ShareType = $permission.Link.Type
                                            ShareScope = $permission.Link.Scope
                                            SharedWithEmail = if ($permission.GrantedToV2.User) { $permission.GrantedToV2.User.Email } else { $null }
                                            SharedWithDisplayName = if ($permission.GrantedToV2.User) { $permission.GrantedToV2.User.DisplayName } else { $null }
                                            ExternalShare = if ($permission.GrantedToV2.User.Email) { -not $permission.GrantedToV2.User.Email.EndsWith($tenantName + ".onmicrosoft.com") } else { $false }
                                            CreatedDateTime = $permission.CreatedDateTime
                                            ExpirationDateTime = $permission.ExpirationDateTime
                                        }
                                        
                                        if ($shareInfo.ExternalShare) {
                                            $discoveryData.Statistics.ExternalShares++
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
                    Write-OneDriveLog -Level "DEBUG" -Message "Could not get OneDrive for user $($user.UserPrincipalName): $($_.Exception.Message)" -Context $Context
                }
            }
            
            Write-OneDriveLog -Level "SUCCESS" -Message "Completed OneDrive discovery for $($users.Count) users" -Context $Context
            Write-OneDriveLog -Level "INFO" -Message "Statistics: $($discoveryData.Statistics.TotalDrives) drives, $($discoveryData.Statistics.TotalFiles) files, $($discoveryData.Statistics.SharedItems) shared items, $($discoveryData.Statistics.ExternalShares) external shares" -Context $Context
            
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
            
            # Save Statistics summary
            $statsPath = Join-Path $outputPath "OneDriveStatistics.csv"
            $statsObject = [PSCustomObject]@{
                TotalUsers = $discoveryData.Statistics.TotalUsers
                TotalDrives = $discoveryData.Statistics.TotalDrives
                TotalFiles = $discoveryData.Statistics.TotalFiles
                TotalSize = $discoveryData.Statistics.TotalSize
                SharedItems = $discoveryData.Statistics.SharedItems
                ExternalShares = $discoveryData.Statistics.ExternalShares
                LastSyncUsers = $discoveryData.Statistics.LastSyncUsers
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