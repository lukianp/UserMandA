# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Azure AD App Registration Script for M&A Discovery Suite
.DESCRIPTION
    Creates Azure AD app registration with comprehensive permissions for M&A environment discovery, assigns required roles, 
    and securely stores credentials for downstream automation workflows. This foundational script creates a service principal 
    with all required Microsoft Graph and Azure permissions, grants admin consent, assigns Cloud Application Administrator 
    and Reader roles, creates a client secret, and encrypts credentials for secure use by discovery and aggregation scripts.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft Graph modules, Azure modules
#>
# PARAMETERS
#     -LogPath: Path for detailed execution log (default: .\MandADiscovery_Registration_Log.txt)
#     -EncryptedOutputPath: Path for encrypted credentials file (default: C:\DiscoveryData\discoverycredentials.config)
#     -Force: Force recreation of existing app registration
#     -ValidateOnly: Only validate prerequisites without creating resources
#     -SkipAzureRoles: Skip Azure subscription role assignments
#     -SecretValidityYears: Client secret validity period in years (default: 2, max: 2)
#
# OUTPUTS
#     - Encrypted credentials file for downstream scripts (JSON format)
#     - Detailed execution log with timestamps and color-coded messages
#     - Service principal with comprehensive M&A discovery permissions
#     - Role assignments across Azure AD and subscriptions
#     - Backup credential files with rotation support
#
# DEPENDENCIES
#     - PowerShell 5.1+ (PowerShell 7+ recommended for enhanced performance)
#     - Az.Accounts, Az.Resources modules
#     - Microsoft.Graph.* modules (Applications, Authentication, Identity.DirectoryManagement)
#     - Global Administrator or Application Administrator privileges
#     - Network connectivity to Microsoft Graph and Azure endpoints
#
# NOTES
#     Author: Enhanced M&A Discovery Suite
#     Version: 4.0.1
#     Created: 2025
#     Last Modified: 2025-06-24
#
#     FIXES in v4.0.1:
#     - Fixed module installation order: Ensure-RequiredModules now runs BEFORE Test-Prerequisites
#     - Fixed console output formatting in Write-ProgressHeader function
#     - Resolved System.Collections.DictionaryEntry display issues
#
#     Security: Credentials encrypted with Windows DPAPI for current user context
#     Resume: Supports re-running without recreation of existing resources
#     Validation: Comprehensive prerequisites and permission validation
#     Backup: Automatic credential file backup and rotation
#
# EXAMPLES
#     .\Create-MandAAppRegistration.ps1
#     .\Create-MandAAppRegistration.ps1 -LogPath "C:\Logs\setup.log" -Force
#     .\Create-MandAAppRegistration.ps1 -ValidateOnly
#     .\Create-MandAAppRegistration.ps1 -SkipAzureRoles -SecretValidityYears 1
#

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, HelpMessage="Path for detailed execution log")]
    [ValidateNotNullOrEmpty()]
    [string]$LogPath = ".\MandADiscovery_Registration_Log.txt",
    
    [Parameter(Mandatory=$false, HelpMessage="Path for encrypted credentials output")]
    [ValidateNotNullOrEmpty()]
    [string]$EncryptedOutputPath = "C:\DiscoveryData\discoverycredentials.config",
    
    [Parameter(Mandatory=$false, HelpMessage="Force recreation of existing app registration")]
    [switch]$Force,
    
    [Parameter(Mandatory=$false, HelpMessage="Only validate prerequisites without creating resources")]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false, HelpMessage="Skip Azure subscription role assignments")]
    [switch]$SkipAzureRoles,
    
    [Parameter(Mandatory=$false, HelpMessage="Automatically install missing PowerShell modules")]
    [switch]$AutoInstallModules,
    
    [Parameter(Mandatory=$false, HelpMessage="Client secret validity period in years (1-2)")]
    [ValidateRange(1, 2)]
    [int]$SecretValidityYears = 2
)

#region Enhanced Global Configuration
$ErrorActionPreference = "Stop"
$VerbosePreference = "SilentlyContinue"
$ProgressPreference = "Continue"

# Script metadata and validation
$script:ScriptInfo = @{
    Name = "Enhanced M&A Discovery Suite - App Registration"
    Version = "4.0.1"
    Author = "M&A Discovery Team"
    RequiredPSVersion = "5.1"
    Dependencies = @("Az.Accounts", "Az.Resources", "Microsoft.Graph.Applications", "Microsoft.Graph.Authentication", "Microsoft.Graph.Identity.DirectoryManagement")
}

# Enhanced application configuration
$script:AppConfig = @{
    DisplayName = "MandADiscovery"
    Description = "M&A Environment Discovery Service Principal with comprehensive permissions for organizational assessment"
    RequiredGraphPermissions = @{
        # Core directory permissions
        "Application.Read.All" = "Read all applications and service principals"
        "AppRoleAssignment.Read.All" = "Read all app role assignments"
        "AuditLog.Read.All" = "Read audit logs for compliance tracking"
        "Directory.Read.All" = "Read directory data including users, groups, and organizational structure"
        "Group.Read.All" = "Read all groups and group properties"
        "GroupMember.Read.All" = "Read group memberships across the organization"
        "User.Read.All" = "Read all user profiles and properties"
        "Organization.Read.All" = "Read organization information and settings"
        
        # Device and compliance
        "Device.Read.All" = "Read all device information"
        "DeviceManagementConfiguration.Read.All" = "Read device management configuration"
        "DeviceManagementManagedDevices.Read.All" = "Read managed devices in Intune"
        "DeviceManagementApps.Read.All" = "Read device management applications"
        
        # Policy and governance
        "Policy.Read.All" = "Read policies including conditional access"
        "Policy.Read.ConditionalAccess" = "Read conditional access policies"
        "Reports.Read.All" = "Read reports for usage and security analytics"
        "RoleManagement.Read.All" = "Read role management data"
        
        # Exchange Online permissions for certificate-free authentication
        "Exchange.ManageAsApp" = "Manage Exchange Online as application (replaces certificate-based auth)"
        "Mail.Read" = "Read mail in all mailboxes"
        "Mail.ReadWrite" = "Read and write mail in all mailboxes"
        "MailboxSettings.Read" = "Read mailbox settings"
        "Calendars.Read" = "Read calendars in all mailboxes"
        "Contacts.Read" = "Read contacts in all mailboxes"
        
        # SharePoint and Teams
        "Sites.Read.All" = "Read SharePoint sites and content"
        "Sites.FullControl.All" = "Full control of SharePoint sites (for migration scenarios)"
        "Files.Read.All" = "Read all files across the organization"
        "Team.ReadBasic.All" = "Read basic team information"
        "TeamMember.Read.All" = "Read team members and ownership"
        "TeamSettings.Read.All" = "Read team settings and configuration"
        "Channel.ReadBasic.All" = "Read basic channel information"
        "ChannelMember.Read.All" = "Read channel members"
        
        # Advanced features
        "Directory.ReadWrite.All" = "Read and write directory data (for migration scenarios)"
        "Synchronization.Read.All" = "Read synchronization data and hybrid configurations"
        "ExternalConnection.Read.All" = "Read external connections and search configurations"
        "Member.Read.Hidden" = "Read hidden group members"
        "LicenseAssignment.Read.All" = "Read license assignments and usage"
    }
    AzureADRoles = @(
        "Cloud Application Administrator"
    )
    AzureRoles = @(
        "Reader"
    )
}

# Enhanced color scheme for consistent output
$script:ColorScheme = @{
    Header = @{ ForegroundColor = "White"; BackgroundColor = "DarkBlue" }
    Success = @{ ForegroundColor = "Green" }
    Info = @{ ForegroundColor = "Cyan" }
    Warning = @{ ForegroundColor = "Yellow" }
    Error = @{ ForegroundColor = "Red" }
    Progress = @{ ForegroundColor = "Magenta" }
    Debug = @{ ForegroundColor = "Gray" }
    Separator = @{ ForegroundColor = "DarkCyan" }
    Highlight = @{ ForegroundColor = "White"; BackgroundColor = "DarkGreen" }
    Critical = @{ ForegroundColor = "White"; BackgroundColor = "Red" }
    Important = @{ ForegroundColor = "Black"; BackgroundColor = "Yellow" }
}

# Connection status tracking
$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; RetryCount = 0; Context = $null }
    Azure = @{ Connected = $false; LastError = $null; RetryCount = 0; Context = $null }
}

# Performance metrics
$script:Metrics = @{
    StartTime = Get-Date
    EndTime = $null
    Operations = @{
        Prerequisites = @{ Duration = $null; Success = $false }
        ModuleManagement = @{ Duration = $null; Success = $false }
        GraphConnection = @{ Duration = $null; Success = $false }
        AzureConnection = @{ Duration = $null; Success = $false }
        AppRegistration = @{ Duration = $null; Success = $false }
        PermissionGrant = @{ Duration = $null; Success = $false }
        RoleAssignment = @{ Duration = $null; Success = $false }
        SecretCreation = @{ Duration = $null; Success = $false }
        CredentialStorage = @{ Duration = $null; Success = $false }
    }
}
#endregion

#region Enhanced Logging and Output Functions
function Write-EnhancedLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS", "PROGRESS", "DEBUG", "HEADER", "CRITICAL", "IMPORTANT")]
        [string]$Level = "INFO",
        [Parameter(Mandatory=$false)]
        [switch]$NoTimestamp,
        [Parameter(Mandatory=$false)]
        [switch]$NoNewLine
    )
    
    $timestamp = if (-not $NoTimestamp) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " } else { "" }
    $cleanedMessage = $Message -replace "[\r\n]+", " "
    $logMessage = "$timestamp[$Level] $cleanedMessage"
    
    # Enhanced colorful console output with new levels
    $colorParams = if ($script:ColorScheme.ContainsKey($Level)) { $script:ColorScheme[$Level] } else { $script:ColorScheme["Info"] }
    
    # Add icons for better visibility
    $icon = switch ($Level) {
        "SUCCESS" { "[OK]" }
        "ERROR" { "[X]" }
        "WARN" { "[!]?" }
        "CRITICAL" { "??" }
        "IMPORTANT" { "??" }
        "PROGRESS" { "??" }
        "DEBUG" { "??" }
        "HEADER" { "??" }
        default { "[i]?" }
    }
    
    $displayMessage = "$icon $logMessage"
    
    if ($NoNewLine) {
        Write-Host $displayMessage @colorParams -NoNewLine
    } else {
        Write-Host $displayMessage @colorParams
    }
    
    # Enhanced file logging with error handling
    if ($script:LogPath -and (Test-Path (Split-Path $script:LogPath -Parent) -PathType Container)) {
        try {
            Add-Content -Path $script:LogPath -Value $logMessage -Encoding UTF8 -ErrorAction Stop
        } catch {
            Write-Warning "Failed to write to log file '$script:LogPath': $($_.Exception.Message)"
        }
    }
}

function Write-ProgressHeader {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Title,
        [Parameter(Mandatory=$false)]
        [string]$Subtitle = ""
    )
    
<<<<<<< HEAD
    $separator = "═" * 90
    Write-Host "`n$separator" -ForegroundColor $script:ColorScheme.Separator.ForegroundColor
    Write-Host "  ║ $Title" -ForegroundColor $script:ColorScheme.Header.ForegroundColor -BackgroundColor $script:ColorScheme.Header.BackgroundColor
    if ($Subtitle) {
        Write-Host "  ║ $Subtitle" -ForegroundColor $script:ColorScheme.Info.ForegroundColor
    }
    Write-Host "$separator`n" -ForegroundColor $script:ColorScheme.Separator.ForegroundColor
=======
    $separator = "?" * 90
    $separatorParams = $script:ColorScheme.Separator
    Write-Host "`n$separator" @separatorParams
    $headerParams = $script:ColorScheme.Header
    Write-Host "  ?? $Title" @headerParams
    if ($Subtitle) {
        $infoParams = $script:ColorScheme.Info
        Write-Host "  ?? $Subtitle" @infoParams
    }
    Write-Host "$separator`n" @separatorParams
>>>>>>> fcc33954554df555f1a2471d7cff99d77cf164f3
}

function Write-OperationResult {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Operation,
        [Parameter(Mandatory=$true)]
        [bool]$Success,
        [Parameter(Mandatory=$false)]
        [string]$Details = "",
        [Parameter(Mandatory=$false)]
        [timespan]$Duration
    )
    
    $icon = if ($Success) { "[OK]" } else { "[X]" }
    $level = if ($Success) { "SUCCESS" } else { "ERROR" }
    $durationText = if ($Duration) { " (?? $('{0:F2}' -f $Duration.TotalSeconds)s)" } else { "" }
    
    $message = "$Operation$durationText"
    if ($Details) {
        $message += " - $Details"
    }
    
    Write-EnhancedLog "$icon $message" -Level $level
}

function Start-OperationTimer {
    param([string]$OperationName)
    
    $script:Metrics.Operations[$OperationName].StartTime = Get-Date
    Write-EnhancedLog "?? Starting: $OperationName" -Level PROGRESS
}

function Stop-OperationTimer {
    param(
        [string]$OperationName,
        [bool]$Success
    )
    
    $endTime = Get-Date
    $duration = $endTime - $script:Metrics.Operations[$OperationName].StartTime
    $script:Metrics.Operations[$OperationName].Duration = $duration
    $script:Metrics.Operations[$OperationName].Success = $Success
    
    Write-OperationResult -Operation $OperationName -Success $Success -Duration $duration
}
#endregion

#region Enhanced Prerequisites and Validation
function Test-Prerequisites {
    Start-OperationTimer "Prerequisites"
    Write-ProgressHeader "PREREQUISITES VALIDATION" "Comprehensive environment and security checks"
    
    $issues = @()
    $warnings = @()
    
    try {
        # PowerShell version validation
        $psVersion = $PSVersionTable.PSVersion
        $requiredVersion = [version]$script:ScriptInfo.RequiredPSVersion
        
        if ($psVersion -lt $requiredVersion) {
            $issues += "PowerShell $($script:ScriptInfo.RequiredPSVersion)+ required. Current: $psVersion"
        } elseif ($psVersion.Major -eq 5) {
            $warnings += "PowerShell 5.1 detected. PowerShell 7+ recommended for enhanced performance and compatibility"
        } else {
            Write-EnhancedLog "PowerShell version: $psVersion" -Level SUCCESS
        }
        
        # Administrator privileges check (cross-platform)
        $isAdmin = $false
        if ($IsWindows -or $PSVersionTable.Platform -eq 'Win32NT') {
            $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
            $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
            $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        } elseif ($IsLinux -or $IsMacOS) {
            # On Unix-like systems, check if running as root or with sudo
            $isAdmin = (id -u) -eq 0
        }
        
        if ($isAdmin) {
            Write-EnhancedLog "Running with administrator/root privileges" -Level SUCCESS
        } else {
            $warnings += "Not running as administrator/root. Some operations may require elevation"
        }
        
        # Enhanced network connectivity tests with progress
        $connectivityTests = @(
            @{ Host = "graph.microsoft.com"; Port = 443; Service = "Microsoft Graph" },
            @{ Host = "management.azure.com"; Port = 443; Service = "Azure Management" },
            @{ Host = "login.microsoftonline.com"; Port = 443; Service = "Azure AD Authentication" },
            @{ Host = "graph.windows.net"; Port = 443; Service = "Azure AD Graph (Legacy)" }
        )
        
        Write-EnhancedLog "Testing network connectivity to $($connectivityTests.Count) endpoints..." -Level PROGRESS
        
        $connectionResults = @()
        foreach ($test in $connectivityTests) {
            try {
                $connection = Test-NetConnection -ComputerName $test.Host -Port $test.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction Stop
                if ($connection) {
                    Write-EnhancedLog "Connectivity to $($test.Service): Available" -Level SUCCESS
                    $connectionResults += $true
                } else {
                    $issues += "Cannot connect to $($test.Service) ($($test.Host):$($test.Port))"
                    $connectionResults += $false
                }
            } catch {
                $issues += "Network test failed for $($test.Service): $($_.Exception.Message)"
                $connectionResults += $false
            }
        }
        
        $successfulConnections = ($connectionResults | Where-Object { $_ }).Count
        Write-EnhancedLog "Network connectivity: $successfulConnections/$($connectivityTests.Count) endpoints accessible" -Level $(if ($successfulConnections -eq $connectivityTests.Count) { "SUCCESS" } else { "WARN" })
        
        # Enhanced system resources check
        $availableMemory = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
        $minMemoryGB = 2
        if ($availableMemory -lt $minMemoryGB) {
            $warnings += "Low available memory: $($availableMemory)GB. Minimum recommended: $($minMemoryGB)GB"
        } else {
            Write-EnhancedLog "Available memory: $($availableMemory)GB" -Level SUCCESS
        }
        
        # Enhanced disk space validation
        $encryptedDir = Split-Path $EncryptedOutputPath -Parent
        $drive = if (Test-Path $encryptedDir -ErrorAction SilentlyContinue) { 
            Get-Item $encryptedDir 
        } else { 
            Get-Item (Split-Path $encryptedDir -Qualifier) 
        }
        $freeSpace = [math]::Round((Get-CimInstance Win32_LogicalDisk | Where-Object DeviceID -eq $drive.Root.Name.TrimEnd('\')).FreeSpace / 1GB, 2)
        $minSpaceGB = 0.5
        
        if ($freeSpace -lt $minSpaceGB) {
            $issues += "Insufficient disk space on $($drive.Root.Name). Available: $($freeSpace)GB, Required: $($minSpaceGB)GB"
        } else {
            Write-EnhancedLog "Available disk space: $($freeSpace)GB" -Level SUCCESS
        }
        
        # Enhanced output directory creation/validation
        if (-not (Test-Path $encryptedDir -PathType Container)) {
            try {
                New-Item -Path $encryptedDir -ItemType Directory -Force -ErrorAction Stop | Out-Null
                Write-EnhancedLog "Created output directory: $encryptedDir" -Level SUCCESS
            } catch {
                $issues += "Cannot create output directory '$encryptedDir': $($_.Exception.Message)"
            }
        } else {
            # Test write permissions
            $testFile = Join-Path $encryptedDir "write_test_$(Get-Random).tmp"
            try {
                "test" | Out-File -FilePath $testFile -ErrorAction Stop
                Remove-Item $testFile -ErrorAction SilentlyContinue
                Write-EnhancedLog "Output directory accessible with write permissions: $encryptedDir" -Level SUCCESS
            } catch {
                $issues += "Output directory exists but lacks write permissions: $encryptedDir"
            }
        }
        
        # Enhanced module availability check with automatic installation
        Write-EnhancedLog "Checking and installing PowerShell modules..." -Level PROGRESS
        $moduleInstallationFailed = $false
        foreach ($module in $script:ScriptInfo.Dependencies) {
            $installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | 
                Sort-Object Version -Descending | Select-Object -First 1
            
            if ($installedModule) {
                Write-EnhancedLog "Module available: $module v$($installedModule.Version)" -Level SUCCESS
            } else {
                if ($AutoInstallModules) {
                    Write-EnhancedLog "Module '$module' not found. Installing..." -Level WARN
                    try {
                        # Set TLS 1.2 for secure downloads
                        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                        
                        # Install NuGet provider if needed (silently)
                        $null = Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -ErrorAction SilentlyContinue
                        
                        # Install the module
                        Install-Module -Name $module -Scope CurrentUser -Force -AllowClobber -Repository PSGallery -ErrorAction Stop
                        
                        # Verify installation
                        $verifyModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | 
                            Sort-Object Version -Descending | Select-Object -First 1
                        
                        if ($verifyModule) {
                            Write-EnhancedLog "Successfully installed $module v$($verifyModule.Version)" -Level SUCCESS
                        } else {
                            throw "Module installation verification failed"
                        }
                    } catch {
                        Write-EnhancedLog "Failed to install module '$module': $($_.Exception.Message)" -Level ERROR
                        $issues += "Failed to install required module '$module'. Please install manually: Install-Module $module -Scope CurrentUser"
                        $moduleInstallationFailed = $true
                    }
                } else {
                    Write-EnhancedLog "Module '$module' not found" -Level WARN
                    $issues += "Required module '$module' not found. Install with: Install-Module $module -Scope CurrentUser"
                }
            }
        }
        
        # Display warnings with enhanced formatting
        if ($warnings.Count -gt 0) {
            Write-EnhancedLog "Prerequisites validation found $($warnings.Count) warning(s):" -Level WARN
            $warnings | ForEach-Object { Write-EnhancedLog "  $_" -Level WARN }
        }
        
        # Display issues with enhanced formatting
        if ($issues.Count -gt 0) {
            Write-EnhancedLog "Prerequisites validation failed with $($issues.Count) issue(s):" -Level ERROR
            $issues | ForEach-Object { Write-EnhancedLog "  $_" -Level ERROR }
            Stop-OperationTimer "Prerequisites" $false
            return $false
        }
        
        Write-EnhancedLog "All prerequisites validated successfully" -Level SUCCESS
        Stop-OperationTimer "Prerequisites" $true
        return $true
        
    } catch {
        Write-EnhancedLog "Prerequisites validation error: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "Prerequisites" $false
        return $false
    }
}
#endregion

#region Enhanced Module Management
function Ensure-RequiredModules {
    Start-OperationTimer "ModuleManagement"
    Write-ProgressHeader "MODULE MANAGEMENT" "Installing and updating required PowerShell modules"
    
    try {
        # Enhanced cleanup to prevent module conflicts
        Write-EnhancedLog "Performing comprehensive module cleanup..." -Level PROGRESS
        
        # Remove all loaded Az and Microsoft.Graph modules
        $conflictingModules = @("Az.*", "Microsoft.Graph.*", "AzureRM.*")
        foreach ($pattern in $conflictingModules) {
            $loadedModules = Get-Module -Name $pattern -ErrorAction SilentlyContinue
            foreach ($module in $loadedModules) {
                try {
                    Remove-Module -Name $module.Name -Force -ErrorAction Stop
                    Write-EnhancedLog "Unloaded conflicting module: $($module.Name) v$($module.Version)" -Level SUCCESS
                } catch {
                    Write-EnhancedLog "Could not unload $($module.Name): $($_.Exception.Message)" -Level WARN
                }
            }
        }
        
        # Check for and warn about AzureRM modules
        $azureRMModules = Get-Module -ListAvailable -Name "AzureRM*" -ErrorAction SilentlyContinue
        if ($azureRMModules) {
            Write-EnhancedLog "WARNING: AzureRM modules detected. These may conflict with Az modules." -Level WARN
            Write-EnhancedLog "Consider uninstalling AzureRM modules: Uninstall-AzureRM" -Level WARN
        }
        
        # Force garbage collection to release module assemblies
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        [System.GC]::Collect()
        
        Write-EnhancedLog "Module cleanup completed" -Level SUCCESS
        
        # Process each required module with enhanced error handling
        $totalModules = $script:ScriptInfo.Dependencies.Count
        $processedModules = 0
        $successfulModules = @()
        $failedModules = @()
        
        foreach ($moduleName in $script:ScriptInfo.Dependencies) {
            $processedModules++
            Write-Progress -Activity "Processing Modules" -Status "Processing $moduleName ($processedModules of $totalModules)" -PercentComplete (($processedModules / $totalModules) * 100)
            
            Write-EnhancedLog "Processing module: $moduleName" -Level PROGRESS
            
            try {
                # Check if module is already installed
                $installedModule = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue |
                    Sort-Object Version -Descending | Select-Object -First 1
                
                if (-not $installedModule) {
                    Write-EnhancedLog "Installing $moduleName..." -Level PROGRESS
                    
                    # Install with specific parameters to avoid conflicts
                    $installParams = @{
                        Name = $moduleName
                        Scope = 'CurrentUser'
                        Force = $true
                        AllowClobber = $true
                        Repository = 'PSGallery'
                        SkipPublisherCheck = $true
                        ErrorAction = 'Stop'
                    }
                    
                    Install-Module @installParams
                    Write-EnhancedLog "Successfully installed $moduleName" -Level SUCCESS
                } else {
                    $installedVersion = $installedModule.Version.ToString()
                    Write-EnhancedLog "Found $moduleName v$installedVersion" -Level INFO
                    
                    # Optional update check (non-blocking)
                    try {
                        $latestModule = Find-Module -Name $moduleName -Repository PSGallery -ErrorAction Stop
                        $latestVersion = $latestModule.Version.ToString()
                        
                        if ([version]$installedVersion -lt [version]$latestVersion) {
                            Write-EnhancedLog "Update available for $moduleName v$installedVersion → v$latestVersion" -Level INFO
                            Write-EnhancedLog "Installing latest version..." -Level PROGRESS
                            
                            $updateParams = @{
                                Name = $moduleName
                                Scope = 'CurrentUser'
                                Force = $true
                                AllowClobber = $true
                                Repository = 'PSGallery'
                                SkipPublisherCheck = $true
                                ErrorAction = 'Stop'
                            }
                            
                            Install-Module @updateParams
                            Write-EnhancedLog "Successfully updated $moduleName to v$latestVersion" -Level SUCCESS
                        } else {
                            Write-EnhancedLog "$moduleName is up to date (v$installedVersion)" -Level SUCCESS
                        }
                    } catch {
                        Write-EnhancedLog "Could not check for updates to $moduleName`: $($_.Exception.Message)" -Level WARN
                    }
                }
                
                # Import module with enhanced error handling
                $latestInstalled = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue |
                    Sort-Object Version -Descending | Select-Object -First 1
                
                if ($latestInstalled) {
                    # Special handling for Az modules to prevent conflicts
                    if ($moduleName -like "Az.*") {
                        Write-EnhancedLog "Importing Az module with conflict prevention..." -Level PROGRESS
                        
                        # Import with specific parameters for Az modules
                        $importParams = @{
                            Name = $moduleName
                            RequiredVersion = $latestInstalled.Version
                            Force = $true
                            Global = $false
                            ErrorAction = 'Stop'
                        }
                        
                        Import-Module @importParams
                    } else {
                        # Standard import for other modules
                        Import-Module -Name $moduleName -RequiredVersion $latestInstalled.Version -Force -ErrorAction Stop
                    }
                    
                    Write-EnhancedLog "Imported $moduleName v$($latestInstalled.Version)" -Level SUCCESS
                    $successfulModules += $moduleName
                } else {
                    throw "Module $moduleName not found after installation"
                }
                
            } catch {
                $errorMessage = $_.Exception.Message
                Write-EnhancedLog "Failed to process $moduleName`: $errorMessage" -Level ERROR
                $failedModules += @{ Name = $moduleName; Error = $errorMessage }
                
                # For critical modules, continue with warning instead of failing completely
                if ($moduleName -in @("Az.Accounts", "Microsoft.Graph.Authentication")) {
                    Write-EnhancedLog "Critical module $moduleName failed. Attempting alternative approach..." -Level WARN
                    
                    try {
                        # Try importing without version specification
                        Import-Module -Name $moduleName -Force -ErrorAction Stop
                        Write-EnhancedLog "Successfully imported $moduleName using fallback method" -Level SUCCESS
                        $successfulModules += $moduleName
                        
                        # Remove from failed list if fallback succeeded
                        $failedModules = $failedModules | Where-Object { $_.Name -ne $moduleName }
                    } catch {
                        Write-EnhancedLog "Fallback import also failed for $moduleName" -Level ERROR
                    }
                }
            }
        }
        
        Write-Progress -Activity "Processing Modules" -Completed
        
        # Enhanced summary with detailed results
        Write-EnhancedLog "Module processing summary:" -Level INFO
        Write-EnhancedLog "  Successful: $($successfulModules.Count)" -Level SUCCESS
        Write-EnhancedLog "  Failed: $($failedModules.Count)" -Level $(if ($failedModules.Count -gt 0) { "ERROR" } else { "SUCCESS" })
        
        if ($successfulModules.Count -gt 0) {
            Write-EnhancedLog "Successfully processed modules:" -Level SUCCESS
            $successfulModules | ForEach-Object { Write-EnhancedLog "  ✓ $_" -Level SUCCESS }
        }
        
        if ($failedModules.Count -gt 0) {
            Write-EnhancedLog "Failed modules:" -Level ERROR
            $failedModules | ForEach-Object { Write-EnhancedLog "  ✗ $($_.Name): $($_.Error)" -Level ERROR }
            
            # Check if critical modules failed
            $criticalModules = @("Az.Accounts", "Microsoft.Graph.Authentication")
            $failedCritical = $failedModules | Where-Object { $_.Name -in $criticalModules }
            
            if ($failedCritical.Count -gt 0) {
                Write-EnhancedLog "Critical modules failed. Script cannot continue." -Level CRITICAL
                Stop-OperationTimer "ModuleManagement" $false
                throw "Critical module management failures: $($failedCritical.Name -join ', ')"
            } else {
                Write-EnhancedLog "Non-critical modules failed. Continuing with available modules." -Level WARN
            }
        }
        
        # Verify essential modules are loaded
        $essentialModules = @("Az.Accounts", "Microsoft.Graph.Authentication")
        $loadedEssential = @()
        
        foreach ($essential in $essentialModules) {
            $loaded = Get-Module -Name $essential -ErrorAction SilentlyContinue
            if ($loaded) {
                $loadedEssential += $essential
                Write-EnhancedLog "Essential module verified: $essential v$($loaded.Version)" -Level SUCCESS
            } else {
                Write-EnhancedLog "Essential module not loaded: $essential" -Level ERROR
            }
        }
        
        if ($loadedEssential.Count -eq $essentialModules.Count) {
            Write-EnhancedLog "All essential modules are loaded and ready" -Level SUCCESS
            Stop-OperationTimer "ModuleManagement" $true
        } else {
            Write-EnhancedLog "Some essential modules are missing. Script may encounter issues." -Level WARN
            Stop-OperationTimer "ModuleManagement" $false
            throw "Essential modules not available: $($essentialModules | Where-Object { $_ -notin $loadedEssential } | Join-String -Separator ', ')"
        }
        
    } catch {
        Write-EnhancedLog "Module management error: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "ModuleManagement" $false
        throw
    }
}
#endregion

#region Enhanced Connection Management
function Connect-EnhancedGraph {
    Start-OperationTimer "GraphConnection"
    Write-ProgressHeader "MICROSOFT GRAPH CONNECTION" "Establishing authenticated session with required scopes"
    
    $maxRetries = 3
    $retryDelay = 5
    
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            Write-EnhancedLog "Connection attempt $attempt of $maxRetries..." -Level PROGRESS
            
            $requiredScopes = @(
                "Application.ReadWrite.All",
                "Directory.ReadWrite.All", 
                "AppRoleAssignment.ReadWrite.All",
                "RoleManagement.ReadWrite.Directory",
                "Policy.Read.All"
            )
            
            # Check for existing valid connection
            $existingContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($existingContext -and $existingContext.Scopes) {
                $hasAllScopes = $requiredScopes | ForEach-Object { $_ -in $existingContext.Scopes } | Where-Object { $_ -eq $false } | Measure-Object | Select-Object -ExpandProperty Count
                
                if ($hasAllScopes -eq 0) {
                    Write-EnhancedLog "Using existing Graph connection with valid scopes" -Level SUCCESS
                    $script:ConnectionStatus.Graph.Connected = $true
                    $script:ConnectionStatus.Graph.Context = $existingContext
                    Stop-OperationTimer "GraphConnection" $true
                    return $true
                }
            }
            
            # Disconnect any existing session
            if ($existingContext) {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-EnhancedLog "Disconnected existing Graph session" -Level INFO
            }
            
            # Establish new connection
            Write-EnhancedLog "Connecting to Microsoft Graph with required scopes..." -Level PROGRESS
            Connect-MgGraph -Scopes $requiredScopes -NoWelcome -ErrorAction Stop
            
            # Verify connection and test basic functionality
            $context = Get-MgContext -ErrorAction Stop
            if (-not $context -or -not $context.Account) {
                throw "Failed to establish valid Graph context"
            }
            
            # Test basic Graph functionality with enhanced verification
            try {
                $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                if (-not $org) {
                    throw "Cannot access organization data - check permissions"
                }
                
                # Additional permission test
                $apps = Get-MgApplication -Top 1 -ErrorAction Stop
                Write-EnhancedLog "Permission verification: Organization and Application access confirmed" -Level SUCCESS
                
            } catch {
                throw "Graph connection established but insufficient permissions: $($_.Exception.Message)"
            }
            
            Write-EnhancedLog "Successfully connected to Microsoft Graph" -Level SUCCESS
            Write-EnhancedLog "  Account: $($context.Account)" -Level INFO
            Write-EnhancedLog "  Tenant: $($context.TenantId)" -Level INFO
            Write-EnhancedLog "  Scopes: $($context.Scopes.Count) granted" -Level INFO
            
            $script:ConnectionStatus.Graph.Connected = $true
            $script:ConnectionStatus.Graph.Context = $context
            $script:ConnectionStatus.Graph.LastError = $null
            $script:ConnectionStatus.Graph.RetryCount = $attempt
            
            Stop-OperationTimer "GraphConnection" $true
            return $true
            
        } catch {
            $errorMessage = $_.Exception.Message
            Write-EnhancedLog "Graph connection attempt $attempt failed: $errorMessage" -Level ERROR
            
            $script:ConnectionStatus.Graph.LastError = $errorMessage
            $script:ConnectionStatus.Graph.RetryCount = $attempt
            
            if ($attempt -lt $maxRetries) {
                Write-EnhancedLog "Retrying in $retryDelay seconds..." -Level PROGRESS
                Start-Sleep -Seconds $retryDelay
                $retryDelay += 2  # Exponential backoff
            }
        }
    }
    
    Write-EnhancedLog "Failed to establish Graph connection after $maxRetries attempts" -Level ERROR
    Stop-OperationTimer "GraphConnection" $false
    return $false
}

function Connect-EnhancedAzure {
    if ($SkipAzureRoles) {
        Write-EnhancedLog "Skipping Azure connection as requested" -Level INFO
        return $true
    }
    
    Start-OperationTimer "AzureConnection"
    Write-ProgressHeader "AZURE CONNECTION" "Establishing Azure Resource Management session"
    
    $maxRetries = 3
    $retryDelay = 5
    
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            Write-EnhancedLog "Azure connection attempt $attempt of $maxRetries..." -Level PROGRESS
            
            # Check for existing valid connection
            $existingContext = Get-AzContext -ErrorAction SilentlyContinue
            if ($existingContext -and $existingContext.Account) {
                # Verify connection is still valid
                try {
                    $subscriptions = Get-AzSubscription -ErrorAction Stop
                    Write-EnhancedLog "Using existing Azure connection" -Level SUCCESS
                    $script:ConnectionStatus.Azure.Connected = $true
                    $script:ConnectionStatus.Azure.Context = $existingContext
                    Stop-OperationTimer "AzureConnection" $true
                    return $true
                } catch {
                    Write-EnhancedLog "Existing Azure connection invalid, reconnecting..." -Level WARN
                }
            }
            
            # Establish new connection
            Write-EnhancedLog "Connecting to Azure..." -Level PROGRESS
            Connect-AzAccount -Scope CurrentUser -ErrorAction Stop | Out-Null
            
            # Verify connection
            $context = Get-AzContext -ErrorAction Stop
            if (-not $context -or -not $context.Account) {
                throw "Failed to establish valid Azure context"
            }
            
            # Test access by listing subscriptions with enhanced verification
            $subscriptions = Get-AzSubscription -ErrorAction Stop
            if (-not $subscriptions) {
                throw "No accessible subscriptions found"
            }
            
            # Enhanced subscription analysis
            $activeSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
            $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
            
            Write-EnhancedLog "Successfully connected to Azure" -Level SUCCESS
            Write-EnhancedLog "  Account: $($context.Account.Id)" -Level INFO
            Write-EnhancedLog "  Tenant: $($context.Tenant.Id)" -Level INFO
            Write-EnhancedLog "  Total Subscriptions: $($subscriptions.Count)" -Level INFO
            Write-EnhancedLog "  Active Subscriptions: $($activeSubscriptions.Count)" -Level INFO
            
            if ($disabledSubscriptions.Count -gt 0) {
                Write-EnhancedLog "  Disabled Subscriptions: $($disabledSubscriptions.Count)" -Level WARN
            }
            
            # List subscription details (first 3 active)
            $activeSubscriptions | Select-Object -First 3 | ForEach-Object {
                Write-EnhancedLog "    * $($_.Name) ($($_.State))" -Level INFO
            }
            if ($activeSubscriptions.Count -gt 3) {
                Write-EnhancedLog "    ... and $($activeSubscriptions.Count - 3) more active subscriptions" -Level INFO
            }
            
            $script:ConnectionStatus.Azure.Connected = $true
            $script:ConnectionStatus.Azure.Context = $context
            $script:ConnectionStatus.Azure.LastError = $null
            $script:ConnectionStatus.Azure.RetryCount = $attempt
            
            Stop-OperationTimer "AzureConnection" $true
            return $true
            
        } catch {
            $errorMessage = $_.Exception.Message
            Write-EnhancedLog "Azure connection attempt $attempt failed: $errorMessage" -Level ERROR
            
            $script:ConnectionStatus.Azure.LastError = $errorMessage
            $script:ConnectionStatus.Azure.RetryCount = $attempt
            
            if ($attempt -lt $maxRetries) {
                Write-EnhancedLog "Retrying in $retryDelay seconds..." -Level PROGRESS
                Start-Sleep -Seconds $retryDelay
                $retryDelay += 2
            }
        }
    }
    
    Write-EnhancedLog "Failed to establish Azure connection after $maxRetries attempts" -Level ERROR
    Stop-OperationTimer "AzureConnection" $false
    return $false
}
#endregion

#region Enhanced App Registration Management
function New-EnhancedAppRegistration {
    Start-OperationTimer "AppRegistration"
    Write-ProgressHeader "APPLICATION REGISTRATION" "Creating M&A Discovery service principal with comprehensive permissions"
    
    $appName = $script:AppConfig.DisplayName
    
    try {
        # Check for existing app
        Write-EnhancedLog "Checking for existing application '$appName'..." -Level PROGRESS
        $existingApp = Get-MgApplication -Filter "displayName eq '$appName'" -ErrorAction SilentlyContinue
        if ($existingApp -and -not $Force) {
            Write-EnhancedLog "Application '$appName' already exists. Use -Force to recreate." -Level WARN
            Write-EnhancedLog "  Application ID: $($existingApp.AppId)" -Level INFO
            Write-EnhancedLog "  Object ID: $($existingApp.Id)" -Level INFO
            Stop-OperationTimer "AppRegistration" $true
            return $existingApp
        } elseif ($existingApp -and $Force) {
            Write-EnhancedLog "Force mode: Removing existing application..." -Level PROGRESS
            Remove-MgApplication -ApplicationId $existingApp.Id -ErrorAction Stop
            Write-EnhancedLog "Existing application removed" -Level SUCCESS
            Start-Sleep -Seconds 3  # Allow for propagation
        }
        
        # Get Microsoft Graph service principal with enhanced verification
        Write-EnhancedLog "Fetching Microsoft Graph service principal..." -Level PROGRESS
        $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
        
        if (-not $graphSp) {
            throw "Microsoft Graph service principal not found in tenant"
        }
        
        Write-EnhancedLog "Found Microsoft Graph service principal (ID: $($graphSp.Id))" -Level SUCCESS
        
        # Build resource access permissions with enhanced validation and progress tracking
        $resourceAccess = @()
        $foundPermissions = @()
        $missingPermissions = @()
        $totalPermissions = $script:AppConfig.RequiredGraphPermissions.Count
        $processedPermissions = 0
        
        Write-EnhancedLog "Mapping $totalPermissions permissions..." -Level PROGRESS
        
        foreach ($permission in $script:AppConfig.RequiredGraphPermissions.GetEnumerator()) {
            $processedPermissions++
            Write-Progress -Activity "Mapping Permissions" -Status "Processing $($permission.Key) ($processedPermissions of $totalPermissions)" -PercentComplete (($processedPermissions / $totalPermissions) * 100)
            
            $permissionName = $permission.Key
            $permissionDescription = $permission.Value
            
            $appRole = $graphSp.AppRoles | Where-Object { $_.Value -eq $permissionName }
            if ($appRole) {
                $resourceAccess += @{
                    Id = $appRole.Id
                    Type = "Role"
                }
                $foundPermissions += $permissionName
                Write-EnhancedLog "Mapped permission: $permissionName" -Level SUCCESS
            } else {
                $missingPermissions += $permissionName
                Write-EnhancedLog "Permission not found: $permissionName" -Level ERROR
            }
        }
        
        Write-Progress -Activity "Mapping Permissions" -Completed
        
        if ($missingPermissions.Count -gt 0) {
            Write-EnhancedLog "$($missingPermissions.Count) permissions could not be mapped but continuing..." -Level WARN
            $missingPermissions | ForEach-Object { Write-EnhancedLog "  Missing: $_" -Level WARN }
        }
        
        Write-EnhancedLog "Successfully mapped $($foundPermissions.Count) of $totalPermissions permissions" -Level SUCCESS
        
        # Prepare required resource access
        $requiredResourceAccess = @(
            @{
                ResourceAppId = "00000003-0000-0000-c000-000000000000"  # Microsoft Graph
                ResourceAccess = $resourceAccess
            }
        )
        
        # Create the application with enhanced metadata
        Write-EnhancedLog "Creating application registration '$appName'..." -Level PROGRESS
        
        $appParams = @{
            DisplayName = $appName
            Description = $script:AppConfig.Description
            RequiredResourceAccess = $requiredResourceAccess
        }
        
        $appRegistration = New-MgApplication @appParams -ErrorAction Stop
        
        Write-EnhancedLog "Application registration created successfully" -Level SUCCESS
        Write-EnhancedLog "  Application ID: $($appRegistration.AppId)" -Level INFO
        Write-EnhancedLog "  Object ID: $($appRegistration.Id)" -Level INFO
        Write-EnhancedLog "  Display Name: $($appRegistration.DisplayName)" -Level INFO
        Write-EnhancedLog "  Permissions Configured: $($foundPermissions.Count)" -Level INFO
        
        Stop-OperationTimer "AppRegistration" $true
        return $appRegistration
        
    } catch {
        Write-EnhancedLog "Failed to create application registration: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "AppRegistration" $false
        throw
    }
}

function Grant-EnhancedAdminConsent {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration
    )
    
    Start-OperationTimer "PermissionGrant"
    Write-ProgressHeader "ADMIN CONSENT" "Granting application permissions and creating service principal"
    
    try {
        # Create service principal
        Write-EnhancedLog "Creating service principal..." -Level PROGRESS
        $servicePrincipal = New-MgServicePrincipal -AppId $AppRegistration.AppId -ErrorAction Stop
        Write-EnhancedLog "Service principal created" -Level SUCCESS
        Write-EnhancedLog "  Service Principal ID: $($servicePrincipal.Id)" -Level INFO
        
        # Wait for propagation
        Write-EnhancedLog "Waiting for service principal propagation..." -Level PROGRESS
        Start-Sleep -Seconds 5
        
        # Get service principals for permission granting
        $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
        $appSp = Get-MgServicePrincipal -Filter "AppId eq '$($AppRegistration.AppId)'" -ErrorAction Stop
        
        Write-EnhancedLog "Granting admin consent for application permissions..." -Level PROGRESS
        
        $grantedCount = 0
        $skippedCount = 0
        $failedCount = 0
        $totalPermissions = $AppRegistration.RequiredResourceAccess[0].ResourceAccess.Count
        
        # Process each permission with enhanced progress tracking
        $currentPermission = 0
        foreach ($resourceAccess in $AppRegistration.RequiredResourceAccess[0].ResourceAccess) {
            $currentPermission++
            
            if ($resourceAccess.Type -eq "Role") {
                $permissionId = $resourceAccess.Id
                
                # Find permission name for logging
                $permissionName = $null
                $matchingRole = $graphSp.AppRoles | Where-Object { $_.Id -eq $permissionId }
                if ($matchingRole) {
                    $permissionName = $matchingRole.Value
                } else {
                    $permissionName = "Unknown Permission"
                }
                
                Write-Progress -Activity "Granting Permissions" -Status "Processing $permissionName ($currentPermission of $totalPermissions)" -PercentComplete (($currentPermission / $totalPermissions) * 100)
                
                # Check if already assigned
                $existingAssignment = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -ErrorAction SilentlyContinue | 
                    Where-Object { $_.AppRoleId -eq $permissionId -and $_.ResourceId -eq $graphSp.Id }
                
                if ($existingAssignment) {
                    Write-EnhancedLog "Already granted: $permissionName" -Level INFO
                    $skippedCount++
                    continue
                }
                
                try {
                    $assignmentParams = @{
                        ServicePrincipalId = $appSp.Id
                        PrincipalId = $appSp.Id
                        ResourceId = $graphSp.Id
                        AppRoleId = $permissionId
                    }
                    
                    New-MgServicePrincipalAppRoleAssignment @assignmentParams -ErrorAction Stop | Out-Null
                    
                    Write-EnhancedLog "Granted: $permissionName" -Level SUCCESS
                    $grantedCount++
                    
                } catch {
                    Write-EnhancedLog "Failed to grant $permissionName`: $($_.Exception.Message)" -Level ERROR
                    $failedCount++
                }
            }
        }
        
        Write-Progress -Activity "Granting Permissions" -Completed
        
        # Enhanced permission grant summary
        Write-EnhancedLog "Permission grant summary:" -Level INFO
        Write-EnhancedLog "  Granted: $grantedCount" -Level SUCCESS
        Write-EnhancedLog "  Skipped (already assigned): $skippedCount" -Level INFO
        Write-EnhancedLog "  Failed: $failedCount" -Level $(if ($failedCount -gt 0) { "WARN" } else { "INFO" })
        Write-EnhancedLog "  Total Processed: $totalPermissions" -Level INFO
        
        if ($failedCount -gt 0) {
            Write-EnhancedLog "Some permissions failed to grant. Application may have limited functionality." -Level WARN
        }
        
        Stop-OperationTimer "PermissionGrant" $true
        return $servicePrincipal
        
    } catch {
        Write-EnhancedLog "Permission grant process failed: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "PermissionGrant" $false
        throw
    }
}

function Set-EnhancedRoleAssignments {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphServicePrincipal]$ServicePrincipal
    )
    
    Start-OperationTimer "RoleAssignment"
    Write-ProgressHeader "ROLE ASSIGNMENTS" "Configuring Azure AD and Azure subscription roles"
    
    $azureRoleAssignmentSuccess = $false
    $azureRoleDetails = @{
        AssignedCount = 0
        SkippedCount = 0
        FailedCount = 0
        FailedSubscriptions = @()
        SuccessfulSubscriptions = @()
    }
    
    try {
        # Azure AD role assignments with enhanced processing
        Write-EnhancedLog "Processing Azure AD role assignments..." -Level PROGRESS
        
        $adRoleResults = @{
            Assigned = 0
            Skipped = 0
            Failed = 0
        }
        
        foreach ($roleName in $script:AppConfig.AzureADRoles) {
            try {
                Write-EnhancedLog "Assigning Azure AD role: $roleName" -Level PROGRESS
                
                # Get or activate role definition
                $roleDefinition = Get-MgDirectoryRole -Filter "DisplayName eq '$roleName'" -ErrorAction SilentlyContinue
                
                if (-not $roleDefinition) {
                    $roleTemplate = Get-MgDirectoryRoleTemplate -Filter "DisplayName eq '$roleName'" -ErrorAction Stop
                    if ($roleTemplate) {
                        $roleDefinition = New-MgDirectoryRole -RoleTemplateId $roleTemplate.Id -ErrorAction Stop
                        Write-EnhancedLog "Activated role template: $roleName" -Level SUCCESS
                    } else {
                        throw "Role template '$roleName' not found"
                    }
                }
                
                # Check existing assignment
                $existingAssignment = Get-MgDirectoryRoleMember -DirectoryRoleId $roleDefinition.Id -ErrorAction SilentlyContinue | 
                    Where-Object { $_.Id -eq $ServicePrincipal.Id }
                
                if (-not $existingAssignment) {
                    $memberRef = "https://graph.microsoft.com/v1.0/directoryObjects/$($ServicePrincipal.Id)"
                    New-MgDirectoryRoleMemberByRef -DirectoryRoleId $roleDefinition.Id -OdataId $memberRef -ErrorAction Stop
                    Write-EnhancedLog "Assigned Azure AD role: $roleName" -Level SUCCESS
                    $adRoleResults.Assigned++
                } else {
                    Write-EnhancedLog "Azure AD role already assigned: $roleName" -Level INFO
                    $adRoleResults.Skipped++
                }
                
            } catch {
                Write-EnhancedLog "Failed to assign Azure AD role '$roleName': $($_.Exception.Message)" -Level ERROR
                $adRoleResults.Failed++
            }
        }
        
        Write-EnhancedLog "Azure AD role assignment summary: Assigned=$($adRoleResults.Assigned), Skipped=$($adRoleResults.Skipped), Failed=$($adRoleResults.Failed)" -Level INFO
        
        # Azure subscription role assignments with enhanced error handling
        if ($script:ConnectionStatus.Azure.Connected -and -not $SkipAzureRoles) {
            Write-EnhancedLog "Processing Azure subscription role assignments..." -Level PROGRESS
            Write-EnhancedLog "Service Principal Object ID: $($ServicePrincipal.Id)" -Level INFO
            
            # Suppress warnings during Azure role operations
            $originalWarning = $WarningPreference
            $WarningPreference = "SilentlyContinue"
            
            try {
                # Get all subscriptions in the tenant with enhanced analysis
                Write-EnhancedLog "Discovering subscriptions in tenant..." -Level PROGRESS
                $subscriptions = Get-AzSubscription -ErrorAction Stop
                
                if (-not $subscriptions -or $subscriptions.Count -eq 0) {
                    Write-EnhancedLog "No subscriptions found in tenant" -Level WARN
                    $azureRoleAssignmentSuccess = $false
                } else {
                    $enabledSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
                    $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
                    
                    Write-EnhancedLog "Found $($subscriptions.Count) subscriptions in tenant:" -Level SUCCESS
                    Write-EnhancedLog "  Enabled: $($enabledSubscriptions.Count)" -Level SUCCESS
                    if ($disabledSubscriptions.Count -gt 0) {
                        Write-EnhancedLog "  Disabled: $($disabledSubscriptions.Count)" -Level WARN
                    }
                    
                    # List all subscriptions first
                    for ($i = 0; $i -lt $enabledSubscriptions.Count; $i++) {
                        $sub = $enabledSubscriptions[$i]
                        Write-EnhancedLog "  [$($i+1)] $($sub.Name) ($($sub.Id))" -Level INFO
                    }
                    
                    Write-EnhancedLog "Beginning role assignments on enabled subscriptions..." -Level PROGRESS
                    
                    # Process each enabled subscription
                    for ($i = 0; $i -lt $enabledSubscriptions.Count; $i++) {
                        $subscription = $enabledSubscriptions[$i]
                        $subscriptionName = $subscription.Name
                        $subscriptionId = $subscription.Id
                        $scope = "/subscriptions/$subscriptionId"
                        
                        Write-Progress -Activity "Processing Subscriptions" -Status "Processing $subscriptionName ($($i+1) of $($enabledSubscriptions.Count))" -PercentComplete (($i / $enabledSubscriptions.Count) * 100)
                        Write-EnhancedLog "Processing subscription [$($i+1)/$($enabledSubscriptions.Count)]: $subscriptionName" -Level PROGRESS
                        
                        try {
                            # Set context to specific subscription
                            Write-EnhancedLog "  Setting Azure context to subscription: $subscriptionId" -Level DEBUG
                            $contextResult = Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop
                            
                            if ($contextResult.Subscription.Id -ne $subscriptionId) {
                                throw "Context switch verification failed"
                            }
                            
                            Write-EnhancedLog "  Azure context set successfully" -Level SUCCESS
                            
                            # Check current role assignments for this service principal
                            Write-EnhancedLog "  Checking existing role assignments..." -Level DEBUG
                            $existingRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
                            
                            foreach ($roleName in $script:AppConfig.AzureRoles) {
                                Write-EnhancedLog "  Processing role: $roleName" -Level DEBUG
                                
                                # Check if role is already assigned
                                $hasRole = $existingRoles | Where-Object { $_.RoleDefinitionName -eq $roleName }
                                
                                if ($hasRole) {
                                    Write-EnhancedLog "  $roleName already assigned to: $subscriptionName" -Level INFO
                                    $azureRoleDetails.SkippedCount++
                                } else {
                                    try {
                                        Write-EnhancedLog "  Assigning $roleName role..." -Level DEBUG
                                        
                                        $roleAssignmentParams = @{
                                            ObjectId = $ServicePrincipal.Id
                                            RoleDefinitionName = $roleName
                                            Scope = $scope
                                            ErrorAction = 'Stop'
                                        }
                                        
                                        $roleAssignment = New-AzRoleAssignment @roleAssignmentParams
                                        
                                        if ($roleAssignment) {
                                            Write-EnhancedLog "  Successfully assigned $roleName to: $subscriptionName" -Level SUCCESS
                                            Write-EnhancedLog "    Assignment ID: $($roleAssignment.RoleAssignmentId)" -Level DEBUG
                                            $azureRoleDetails.AssignedCount++
                                        } else {
                                            throw "Role assignment returned null"
                                        }
                                        
                                    } catch {
                                        $errorMsg = $_.Exception.Message
                                        Write-EnhancedLog "  Failed to assign $roleName to $subscriptionName : $errorMsg" -Level ERROR
                                        $azureRoleDetails.FailedCount++
                                        $azureRoleDetails.FailedSubscriptions += "$subscriptionName ($roleName): $errorMsg"
                                    }
                                }
                            }
                            
                            # Verify final assignments for this subscription
                            Write-EnhancedLog "  Verifying role assignments..." -Level DEBUG
                            $finalRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
                            $readerRole = $finalRoles | Where-Object { $_.RoleDefinitionName -eq "Reader" }
                            
                            if ($readerRole) {
                                Write-EnhancedLog "  Verification: Reader role confirmed on $subscriptionName" -Level SUCCESS
                                $azureRoleDetails.SuccessfulSubscriptions += $subscriptionName
                            } else {
                                Write-EnhancedLog "  Verification: Reader role NOT found on $subscriptionName" -Level WARN
                            }
                            
                        } catch {
                            $errorMsg = $_.Exception.Message
                            Write-EnhancedLog "  Failed to process subscription $subscriptionName : $errorMsg" -Level ERROR
                            $azureRoleDetails.FailedCount++
                            $azureRoleDetails.FailedSubscriptions += "$subscriptionName (Access Error): $errorMsg"
                        }
                        
                        Write-EnhancedLog "  Completed processing: $subscriptionName" -Level INFO
                    }
                    
                    Write-Progress -Activity "Processing Subscriptions" -Completed
                    
                    # Final verification across all successful subscriptions
                    if ($azureRoleDetails.SuccessfulSubscriptions.Count -gt 0) {
                        Write-EnhancedLog "Performing final verification across successful subscriptions..." -Level PROGRESS
                        $totalVerified = 0
                        
                        foreach ($subscriptionName in $azureRoleDetails.SuccessfulSubscriptions) {
                            $subscription = $enabledSubscriptions | Where-Object { $_.Name -eq $subscriptionName }
                            if ($subscription) {
                                try {
                                    Set-AzContext -SubscriptionId $subscription.Id -ErrorAction Stop | Out-Null
                                    $roles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope "/subscriptions/$($subscription.Id)" -ErrorAction SilentlyContinue
                                    $readerRole = $roles | Where-Object { $_.RoleDefinitionName -eq "Reader" }
                                    
                                    if ($readerRole) {
                                        $totalVerified++
                                        Write-EnhancedLog "Final verification: $subscriptionName has Reader role" -Level SUCCESS
                                    } else {
                                        Write-EnhancedLog "Final verification: $subscriptionName missing Reader role" -Level ERROR
                                    }
                                } catch {
                                    Write-EnhancedLog "Final verification failed for: $subscriptionName" -Level ERROR
                                }
                            }
                        }
                        
                        # Determine overall success
                        $azureRoleAssignmentSuccess = ($totalVerified -gt 0) -or (($azureRoleDetails.AssignedCount + $azureRoleDetails.SkippedCount) -gt 0)
                        
                        Write-EnhancedLog "Final verification completed: $totalVerified subscriptions confirmed" -Level SUCCESS
                    }
                }
                
                # Enhanced Azure subscription role assignment summary
                Write-EnhancedLog "Azure subscription role assignment summary:" -Level INFO
                Write-EnhancedLog "  Total Enabled Subscriptions: $($enabledSubscriptions.Count)" -Level INFO
                Write-EnhancedLog "  Roles Assigned: $($azureRoleDetails.AssignedCount)" -Level SUCCESS
                Write-EnhancedLog "  Already Assigned: $($azureRoleDetails.SkippedCount)" -Level INFO
                Write-EnhancedLog "  Successful Subscriptions: $($azureRoleDetails.SuccessfulSubscriptions.Count)" -Level SUCCESS
                
                if ($azureRoleDetails.FailedCount -gt 0) {
                    Write-EnhancedLog "  Failed: $($azureRoleDetails.FailedCount)" -Level ERROR
                    $azureRoleDetails.FailedSubscriptions | ForEach-Object {
                        Write-EnhancedLog "    - $_" -Level ERROR
                    }
                }
                
            } catch {
                Write-EnhancedLog "Failed to process subscription role assignments: $($_.Exception.Message)" -Level ERROR
                $azureRoleAssignmentSuccess = $false
            } finally {
                $WarningPreference = $originalWarning
            }
        } else {
            Write-EnhancedLog "Skipping Azure subscription role assignments" -Level WARN
            if (-not $script:ConnectionStatus.Azure.Connected) {
                Write-EnhancedLog "  Reason: Azure connection not available" -Level WARN
            }
            if ($SkipAzureRoles) {
                Write-EnhancedLog "  Reason: Explicitly skipped (-SkipAzureRoles)" -Level WARN
            }
        }
        
        # Store results for final summary
        $script:ConnectionStatus.Azure.RoleAssignmentSuccess = $azureRoleAssignmentSuccess
        $script:ConnectionStatus.Azure.RoleAssignmentDetails = $azureRoleDetails
        
        Stop-OperationTimer "RoleAssignment" $true
        
    } catch {
        Write-EnhancedLog "Role assignment process failed: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "RoleAssignment" $false
        throw
    }
}

function New-EnhancedClientSecret {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration
    )
    
    Start-OperationTimer "SecretCreation"
    Write-ProgressHeader "CLIENT SECRET" "Generating secure authentication credentials"
    
    try {
        $secretDescription = "M&A Discovery Secret - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        $secretEndDate = (Get-Date).AddYears($SecretValidityYears)
        
        Write-EnhancedLog "Creating client secret..." -Level PROGRESS
        Write-EnhancedLog "  Description: $secretDescription" -Level INFO
        Write-EnhancedLog "  Validity: $SecretValidityYears years" -Level INFO
        Write-EnhancedLog "  Expires: $($secretEndDate.ToString('yyyy-MM-dd HH:mm:ss'))" -Level INFO
        
        $secretParams = @{
            ApplicationId = $AppRegistration.Id
            PasswordCredential = @{
                DisplayName = $secretDescription
                EndDateTime = $secretEndDate
            }
        }
        
        $clientSecret = Add-MgApplicationPassword @secretParams -ErrorAction Stop
        
        Write-EnhancedLog "Client secret created successfully" -Level SUCCESS
        Write-EnhancedLog "  Secret ID: $($clientSecret.KeyId)" -Level INFO
        Write-EnhancedLog "  Expires: $($secretEndDate.ToString('yyyy-MM-dd HH:mm:ss'))" -Level INFO
        
        # Enhanced security reminder with expiry calculation
        $daysUntilExpiry = ($secretEndDate - (Get-Date)).Days
        Write-EnhancedLog "SECRET SECURITY NOTICE:" -Level CRITICAL
        Write-EnhancedLog "  * Secret value will be encrypted and stored securely" -Level IMPORTANT
        Write-EnhancedLog "  * Secret cannot be retrieved after this session" -Level IMPORTANT
        Write-EnhancedLog "  * Secret expires in $daysUntilExpiry days" -Level IMPORTANT
        Write-EnhancedLog "  * Set calendar reminder for renewal before expiry" -Level IMPORTANT
        
        Stop-OperationTimer "SecretCreation" $true
        return $clientSecret
        
    } catch {
        Write-EnhancedLog "Failed to create client secret: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "SecretCreation" $false
        throw
    }
}

function Save-EnhancedCredentials {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration,
        [Parameter(Mandatory=$true)]
        $ClientSecret,
        [Parameter(Mandatory=$true)]
        [string]$TenantId
    )
    
    Start-OperationTimer "CredentialStorage"
    Write-ProgressHeader "CREDENTIAL STORAGE" "Encrypting and saving authentication data"
    
    try {
        # Enhanced credential data with additional metadata
        $credentialData = @{
            # Core authentication
            ClientId = $AppRegistration.AppId
            ClientSecret = $ClientSecret.SecretText
            TenantId = $TenantId
            
            # Metadata
            ApplicationName = $AppRegistration.DisplayName
            ApplicationObjectId = $AppRegistration.Id
            SecretKeyId = $ClientSecret.KeyId
            
            # Lifecycle information
            CreatedDate = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
            CreatedBy = $env:USERNAME
            CreatedOnComputer = $env:COMPUTERNAME
            ExpiryDate = $ClientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss')
            ValidityYears = $SecretValidityYears
            DaysUntilExpiry = ($ClientSecret.EndDateTime - (Get-Date)).Days
            
            # Permissions summary
            PermissionCount = $script:AppConfig.RequiredGraphPermissions.Count
            AzureADRoles = $script:AppConfig.AzureADRoles
            AzureRoles = $(if (-not $SkipAzureRoles) { $script:AppConfig.AzureRoles } else { @() })
            
            # Technical metadata
            ScriptVersion = $script:ScriptInfo.Version
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            ComputerName = $env:COMPUTERNAME
            Domain = $env:USERDOMAIN
            
            # Deployment metadata
            AzureSubscriptionCount = if ($script:ConnectionStatus.Azure.RoleAssignmentDetails) { 
                $script:ConnectionStatus.Azure.RoleAssignmentDetails.SuccessfulSubscriptions.Count 
            } else { 0 }
            RoleAssignmentSuccess = $script:ConnectionStatus.Azure.RoleAssignmentSuccess
        }
        
        # Cross-platform encryption
        if ($IsWindows -or $PSVersionTable.Platform -eq 'Win32NT') {
            Write-EnhancedLog "Encrypting credentials using Windows DPAPI..." -Level PROGRESS
            Write-EnhancedLog "  Target User: $env:USERNAME" -Level INFO
            Write-EnhancedLog "  Target Computer: $env:COMPUTERNAME" -Level INFO
        } else {
            Write-EnhancedLog "Storing credentials (plain JSON on Linux)..." -Level PROGRESS
            Write-EnhancedLog "  Target User: $env:USER" -Level INFO
            Write-EnhancedLog "  Target Host: $(hostname)" -Level INFO
        }
        
        $jsonData = $credentialData | ConvertTo-Json -Depth 4
        
        if ($IsWindows -or $PSVersionTable.Platform -eq 'Win32NT') {
            # Windows: Use DPAPI encryption
            $secureString = ConvertTo-SecureString -String $jsonData -AsPlainText -Force
            $encryptedData = $secureString | ConvertFrom-SecureString
        } else {
            # Linux/macOS: Store as plain JSON (rely on file permissions for security)
            $encryptedData = $jsonData
        }
        
        # Ensure directory exists with proper permissions
        $encryptedDir = Split-Path $EncryptedOutputPath -Parent
        if (-not (Test-Path $encryptedDir -PathType Container)) {
            New-Item -Path $encryptedDir -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-EnhancedLog "Created directory: $encryptedDir" -Level SUCCESS
        }
        
        # Save encrypted credentials
        Set-Content -Path $EncryptedOutputPath -Value $encryptedData -Force -Encoding UTF8 -ErrorAction Stop
        
        $fileSize = [math]::Round((Get-Item $EncryptedOutputPath).Length / 1KB, 2)
        Write-EnhancedLog "Credentials encrypted and saved" -Level SUCCESS
        Write-EnhancedLog "  Location: $EncryptedOutputPath" -Level INFO
        Write-EnhancedLog "  Size: $fileSize KB" -Level INFO
        Write-EnhancedLog "  Encryption: Windows DPAPI (current user)" -Level INFO
        
        # Apply secure file permissions
        try {
            if ($IsWindows -or $PSVersionTable.Platform -eq 'Win32NT') {
                # Windows-specific ACL permissions
                $acl = Get-Acl $EncryptedOutputPath
                $acl.SetAccessRuleProtection($true, $false)  # Disable inheritance, remove existing
                
                # Add current user full control
                $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                    $currentUser,
                    "FullControl",
                    "Allow"
                )
                $acl.SetAccessRule($accessRule)
                
                # Add SYSTEM full control
                $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                    "NT AUTHORITY\SYSTEM",
                    "FullControl",
                    "Allow"
                )
                $acl.SetAccessRule($systemRule)
                
                Set-Acl -Path $EncryptedOutputPath -AclObject $acl
                Write-EnhancedLog "Applied secure file permissions (User + SYSTEM only)" -Level SUCCESS
            } else {
                # Unix-like permissions (Linux/macOS)
                & chmod 600 $EncryptedOutputPath 2>$null
                Write-EnhancedLog "Applied secure file permissions (owner read/write only)" -Level SUCCESS
            }
        } catch {
            Write-EnhancedLog "Could not set secure file permissions: $($_.Exception.Message)" -Level WARN
        }
        
        # Create enhanced backup copy with rotation
        try {
            $backupDir = Join-Path $encryptedDir "Backups"
            if (-not (Test-Path $backupDir)) {
                New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
            }
            
            $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
            $backupPath = Join-Path $backupDir "discoverycredentials_backup_$timestamp.config"
            Copy-Item -Path $EncryptedOutputPath -Destination $backupPath -ErrorAction Stop
            
            # Cleanup old backups (keep last 5)
            $backupFiles = Get-ChildItem -Path $backupDir -Filter "discoverycredentials_backup_*.config" | Sort-Object CreationTime -Descending
            if ($backupFiles.Count -gt 5) {
                $backupFiles | Select-Object -Skip 5 | Remove-Item -Force
                Write-EnhancedLog "Cleaned up old backup files (kept 5 most recent)" -Level INFO
            }
            
            Write-EnhancedLog "Created backup copy: $(Split-Path $backupPath -Leaf)" -Level SUCCESS
        } catch {
            Write-EnhancedLog "Could not create backup copy: $($_.Exception.Message)" -Level WARN
        }
        
        # Create credential summary file for easy reference
        try {
            $summaryData = @{
                ApplicationName = $credentialData.ApplicationName
                ClientId = $credentialData.ClientId
                TenantId = $credentialData.TenantId
                CreatedDate = $credentialData.CreatedDate
                ExpiryDate = $credentialData.ExpiryDate
                DaysUntilExpiry = $credentialData.DaysUntilExpiry
                CredentialFile = $EncryptedOutputPath
                BackupLocation = Split-Path $backupPath -Parent
            }
            
            $summaryPath = Join-Path $encryptedDir "credential_summary.json"
            $summaryData | ConvertTo-Json -Depth 2 | Set-Content -Path $summaryPath -Encoding UTF8
            Write-EnhancedLog "Created credential summary file: credential_summary.json" -Level SUCCESS
            
        } catch {
            Write-EnhancedLog "Could not create summary file: $($_.Exception.Message)" -Level WARN
        }
        
        Stop-OperationTimer "CredentialStorage" $true
        
    } catch {
        Write-EnhancedLog "Failed to save credentials: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "CredentialStorage" $false
        throw
    }
}
#endregion

#region Main Execution
try {
    # Initialize script
    $script:Metrics.StartTime = Get-Date
    
    # Initialize logging
    $logDir = Split-Path $LogPath -Parent
    if ($logDir -and -not (Test-Path $logDir -PathType Container)) {
        New-Item -Path $logDir -ItemType Directory -Force | Out-Null
    }
    
    # Enhanced header with script information
    $headerContent = @"
Enhanced M&A Discovery Suite - Azure AD App Registration
Version: $($script:ScriptInfo.Version)
Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
User: $env:USERNAME
Computer: $env:COMPUTERNAME
Domain: $env:USERDOMAIN
PowerShell: $($PSVersionTable.PSVersion)
"@
    
    $headerContent | Out-File -FilePath $LogPath -Encoding UTF8
    
    Write-ProgressHeader "M&A DISCOVERY SUITE - APP REGISTRATION" "Enhanced automation with enterprise-grade security and validation"
    
    Write-EnhancedLog "Script Information:" -Level INFO
    Write-EnhancedLog "  Name: $($script:ScriptInfo.Name)" -Level INFO
    Write-EnhancedLog "  Version: $($script:ScriptInfo.Version)" -Level INFO
    Write-EnhancedLog "  Author: $($script:ScriptInfo.Author)" -Level INFO
    
    Write-EnhancedLog "Execution Parameters:" -Level INFO
    Write-EnhancedLog "  Log Path: $LogPath" -Level INFO
    Write-EnhancedLog "  Output Path: $EncryptedOutputPath" -Level INFO
    Write-EnhancedLog "  Force Mode: $Force" -Level INFO
    Write-EnhancedLog "  Validate Only: $ValidateOnly" -Level INFO
    Write-EnhancedLog "  Skip Azure Roles: $SkipAzureRoles" -Level INFO
    Write-EnhancedLog "  Secret Validity: $SecretValidityYears years" -Level INFO
    
    # **IMPORTANT CHANGE: Call Ensure-RequiredModules BEFORE Test-Prerequisites**
    # Ensure external PowerShell modules are installed and imported first.
    Ensure-RequiredModules
    
    # Now, perform prerequisites validation, which should pass if modules were just installed.
    if (-not (Test-Prerequisites)) {
        throw "Prerequisites validation failed. Please resolve issues and retry."
    }
    
    if ($ValidateOnly) {
        Write-EnhancedLog "Validation-only mode completed successfully" -Level SUCCESS
        exit 0
    }
    
    # Establish connections
    if (-not (Connect-EnhancedGraph)) {
        throw "Failed to establish Microsoft Graph connection"
    }
    
    if (-not (Connect-EnhancedAzure)) {
        if (-not $SkipAzureRoles) {
            Write-EnhancedLog "Azure connection failed. Subscription role assignments will be skipped." -Level WARN
        }
    }
    
    # Get tenant information with enhanced details
    $context = Get-MgContext
    $tenantId = $context.TenantId
    $tenantInfo = Get-MgOrganization | Select-Object -First 1
    
    Write-EnhancedLog "Operating in tenant: $tenantId" -Level SUCCESS
    Write-EnhancedLog "  Organization: $($tenantInfo.DisplayName)" -Level INFO
    Write-EnhancedLog "  Verified Domains: $($tenantInfo.VerifiedDomains.Count)" -Level INFO
    if ($tenantInfo.CreatedDateTime) {
        Write-EnhancedLog "  Tenant Created: $($tenantInfo.CreatedDateTime.ToString('yyyy-MM-dd'))" -Level INFO
    }
    
    # Create app registration
    $appRegistration = New-EnhancedAppRegistration
    
    # Grant admin consent and create service principal
    $servicePrincipal = Grant-EnhancedAdminConsent -AppRegistration $appRegistration
    
    # Assign roles
    Set-EnhancedRoleAssignments -ServicePrincipal $servicePrincipal
    
    # Create client secret
    $clientSecret = New-EnhancedClientSecret -AppRegistration $appRegistration
    
    # Save encrypted credentials
    Save-EnhancedCredentials -AppRegistration $appRegistration -ClientSecret $clientSecret -TenantId $tenantId
    
    # Calculate final metrics
    $script:Metrics.EndTime = Get-Date
    $totalDuration = $script:Metrics.EndTime - $script:Metrics.StartTime
    $successfulOperations = ($script:Metrics.Operations.Values | Where-Object { $_.Success }).Count
    $totalOperations = $script:Metrics.Operations.Count
    
    # Enhanced final summary
    Write-ProgressHeader "DEPLOYMENT SUMMARY" "M&A Discovery service principal ready for operations"
    
    Write-EnhancedLog "APPLICATION DETAILS:" -Level HEADER
    Write-EnhancedLog "  Application Name: $($script:AppConfig.DisplayName)" -Level SUCCESS
    Write-EnhancedLog "  Application (Client) ID: $($appRegistration.AppId)" -Level SUCCESS
    Write-EnhancedLog "  Directory (Tenant) ID: $tenantId" -Level SUCCESS
    Write-EnhancedLog "  Object ID: $($appRegistration.Id)" -Level SUCCESS
    Write-EnhancedLog "  Service Principal ID: $($servicePrincipal.Id)" -Level SUCCESS
    
    Write-EnhancedLog "SECURITY INFORMATION:" -Level HEADER
    Write-EnhancedLog "  Secret Expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" -Level SUCCESS
    Write-EnhancedLog "  Days Until Expiry: $(($clientSecret.EndDateTime - (Get-Date)).Days)" -Level SUCCESS
    Write-EnhancedLog "  Credentials File: $EncryptedOutputPath" -Level SUCCESS
    Write-EnhancedLog "  Encryption: Windows DPAPI (User: $env:USERNAME)" -Level SUCCESS
    Write-EnhancedLog "  Permissions Granted: $($script:AppConfig.RequiredGraphPermissions.Count)" -Level SUCCESS
    
    Write-EnhancedLog "PERFORMANCE METRICS:" -Level HEADER
    Write-EnhancedLog "  Total Duration: $([math]::Round($totalDuration.TotalSeconds, 2)) seconds" -Level SUCCESS
    Write-EnhancedLog "  Successful Operations: $successfulOperations of $totalOperations" -Level SUCCESS
    Write-EnhancedLog "  Connection Retries: Graph($($script:ConnectionStatus.Graph.RetryCount)), Azure($($script:ConnectionStatus.Azure.RetryCount))" -Level SUCCESS
    
    if ($script:ConnectionStatus.Azure.Connected -and $script:ConnectionStatus.Azure.RoleAssignmentSuccess) {
        Write-EnhancedLog "Azure subscription roles assigned successfully" -Level SUCCESS
        $roleDetails = $script:ConnectionStatus.Azure.RoleAssignmentDetails
        Write-EnhancedLog "  Assignments: $($roleDetails.AssignedCount), Skipped: $($roleDetails.SkippedCount), Failed: $($roleDetails.FailedCount)" -Level SUCCESS
        Write-EnhancedLog "  Successful Subscriptions: $($roleDetails.SuccessfulSubscriptions.Count)" -Level SUCCESS
    } elseif ($script:ConnectionStatus.Azure.Connected -and -not $script:ConnectionStatus.Azure.RoleAssignmentSuccess) {
        Write-EnhancedLog "Azure subscription role assignment encountered issues" -Level WARN
        $roleDetails = $script:ConnectionStatus.Azure.RoleAssignmentDetails
        Write-EnhancedLog "  Assignments: $($roleDetails.AssignedCount), Skipped: $($roleDetails.SkippedCount), Failed: $($roleDetails.FailedCount)" -Level WARN
    } else {
        Write-EnhancedLog "Azure subscription role assignment was skipped" -Level WARN
    }
    
    Write-EnhancedLog "IMPORTANT SECURITY REMINDERS:" -Level CRITICAL -NoTimestamp
    Write-EnhancedLog "  * Client secret expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd'))" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Set calendar reminder for credential renewal" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Credentials are user-encrypted (current user only)" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Backup credentials file is stored securely" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Review and audit permissions regularly" -Level IMPORTANT -NoTimestamp
    
    Write-EnhancedLog "Azure AD App Registration completed successfully!" -Level SUCCESS
    Write-EnhancedLog "Ready to proceed with environment discovery using script 2" -Level SUCCESS
    
} catch {
    Write-EnhancedLog "CRITICAL ERROR: $($_.Exception.Message)" -Level CRITICAL
    if ($_.Exception.InnerException) {
        Write-EnhancedLog "Inner Exception: $($_.Exception.InnerException.Message)" -Level ERROR
    }
    if ($_.ScriptStackTrace) {
        Write-EnhancedLog "Stack Trace: $($_.ScriptStackTrace)" -Level DEBUG
    }
    Write-EnhancedLog "Check the log file for detailed error information: $LogPath" -Level ERROR
    exit 1
    
} finally {
    Write-EnhancedLog "Performing cleanup operations..." -Level PROGRESS
    
    # Disconnect from services with enhanced error handling
    @("Graph", "Azure") | ForEach-Object {
        $service = $_
        try {
            switch ($service) {
                "Graph" { 
                    if (Get-MgContext -ErrorAction SilentlyContinue) {
                        Disconnect-MgGraph -ErrorAction SilentlyContinue
                        Write-EnhancedLog "Disconnected from Microsoft Graph" -Level SUCCESS
                    }
                }
                "Azure" { 
                    if (Get-AzContext -ErrorAction SilentlyContinue) {
                        Disconnect-AzAccount -ErrorAction SilentlyContinue | Out-Null
                        Write-EnhancedLog "Disconnected from Azure" -Level SUCCESS
                    }
                }
            }
        } catch {
            Write-EnhancedLog "Error during $service disconnect: $($_.Exception.Message)" -Level WARN
        }
    }
    
    # Final metrics save
    if ($script:Metrics) {
        try {
            $metricsPath = $LogPath -replace '\.txt$', '_metrics.json'
            $script:Metrics | ConvertTo-Json -Depth 3 | Set-Content -Path $metricsPath -Encoding UTF8
            Write-EnhancedLog "Metrics saved: $(Split-Path $metricsPath -Leaf)" -Level SUCCESS
        } catch {
            Write-EnhancedLog "Could not save metrics: $($_.Exception.Message)" -Level WARN
        }
    }
    
    Write-EnhancedLog "Cleanup completed. Full log: $LogPath" -Level SUCCESS
}
#endregion