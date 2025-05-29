# Enhanced M&A Discovery Suite - Azure AD App Registration Script
# 
# SYNOPSIS
#     Creates Azure AD app registration with comprehensive permissions for M&A environment discovery,
#     assigns required roles, and securely stores credentials for downstream automation workflows.
#
# DESCRIPTION
#     This foundational script creates a service principal with all required Microsoft Graph and Azure 
#     permissions, grants admin consent, assigns Cloud Application Administrator and Reader roles, creates 
#     a client secret, and encrypts credentials for secure use by discovery and aggregation scripts. 
#     Enhanced with robust error handling, comprehensive validation, colorful progress output, and 
#     enterprise-grade security for M&A environments.
#
# PARAMETERS
#     -LogPath: Path for detailed execution log (default: .\MandADiscovery_Registration_Log.txt)
#     -EncryptedOutputPath: Path for encrypted credentials file (default: C:\MandADiscovery\Output\credentials.config)
#     -Force: Force recreation of existing app registration
#     -ValidateOnly: Only validate prerequisites without creating resources
#     -SkipAzureRoles: Skip Azure subscription role assignments
#     -SecretValidityYears: Client secret validity period in years (default: 2, max: 2)
#     -TenantId: Azure AD Tenant ID (GUID format) - Optional, will be detected from connection
#     -AppName: Name for the Azure AD Application Registration (default: MandADiscovery)
#     -UseExistingApp: Use existing app registration instead of creating new
#     -ExistingClientId: Client ID of existing app registration to use
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
#     Version: 4.0.0
#     Created: 2025
#     Last Modified: 2025-05-27
#     
#     Security: Credentials encrypted with Windows DPAPI for current user context
#     Resume: Supports re-running without recreation of existing resources
#     Validation: Comprehensive prerequisites and permission validation
#     Backup: Automatic credential file backup and rotation
#
# EXAMPLES
#     .\Setup-AppRegistration.ps1 -TenantId "12345678-1234-1234-1234-123456789012"
#     .\Setup-AppRegistration.ps1 -LogPath "C:\Logs\setup.log" -Force
#     .\Setup-AppRegistration.ps1 -ValidateOnly
#     .\Setup-AppRegistration.ps1 -SkipAzureRoles -SecretValidityYears 1
#     .\Setup-AppRegistration.ps1 -UseExistingApp -ExistingClientId "existing-client-id"
#

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, HelpMessage="Path for detailed execution log")]
    [ValidateNotNullOrEmpty()]
    [string]$LogPath = ".\MandADiscovery_Registration_Log.txt",
    
    [Parameter(Mandatory=$false, HelpMessage="Path for encrypted credentials output")]
    [ValidateNotNullOrEmpty()]
    [string]$EncryptedOutputPath = "C:\MandADiscovery\credentials.config",
    
    [Parameter(Mandatory=$false, HelpMessage="Force recreation of existing app registration")]
    [switch]$Force,
    
    [Parameter(Mandatory=$false, HelpMessage="Only validate prerequisites without creating resources")]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false, HelpMessage="Skip Azure subscription role assignments")]
    [switch]$SkipAzureRoles,
    
    [Parameter(Mandatory=$false, HelpMessage="Client secret validity period in years (1-2)")]
    [ValidateRange(1, 2)]
    [int]$SecretValidityYears = 2,
    
    [Parameter(Mandatory=$false, HelpMessage="Azure AD Tenant ID (GUID format)")]
    [ValidatePattern('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')]
    [string]$TenantId,
    
    [Parameter(Mandatory=$false, HelpMessage="Name for the Azure AD Application Registration")]
    [string]$AppName = "MandADiscovery",
    
    [Parameter(Mandatory=$false, HelpMessage="Use existing app registration instead of creating new")]
    [switch]$UseExistingApp,
    
    [Parameter(Mandatory=$false, HelpMessage="Client ID of existing app registration to use")]
    [ValidatePattern('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')]
    [string]$ExistingClientId
)

# Get the script root directory for location-independent paths
$script:SuiteRoot = Split-Path $PSScriptRoot -Parent

#region Enhanced Global Configuration
$ErrorActionPreference = "Stop"
$VerbosePreference = "SilentlyContinue"
$ProgressPreference = "Continue"

# Script metadata and validation
$script:ScriptInfo = @{
    Name = "Enhanced M&A Discovery Suite - App Registration"
    Version = "4.0.0"
    Author = "M&A Discovery Team"
    RequiredPSVersion = "5.1"
    Dependencies = @("Az.Accounts", "Az.Resources", "Microsoft.Graph.Applications", "Microsoft.Graph.Authentication", "Microsoft.Graph.Identity.DirectoryManagement")
}

# Enhanced application configuration
$script:AppConfig = @{
    DisplayName = $AppName
    Description = "M&A Environment Discovery Service Principal with comprehensive permissions for organizational assessment"
    RequiredGraphPermissions = @{
        
         # Core directory permissions
        "Application.Read.All" = "Read all applications and service principals" # Also allows reading Service Principals
        "AppRoleAssignment.Read.All" = "Read all app role assignments"
        "AuditLog.Read.All" = "Read audit logs for compliance tracking"
        "Directory.Read.All" = "Read directory data including users, groups, and organizational structure"
        "Group.Read.All" = "Read all groups and group properties"
        "GroupMember.Read.All" = "Read group memberships across the organization"
        "User.Read.All" = "Read all user profiles and properties"
        "Organization.Read.All" = "Read organization information and settings"
        "RoleManagement.Read.All" = "Read role management data (Azure AD roles, eligibility, assignments)"
        "SignIn.Read.All" = "Read all user sign-in activity logs (supplements AuditLog.Read.All for sign-in specifics)" # Added

        # Device and compliance (Intune via Graph)
        "Device.Read.All" = "Read all device information (Azure AD registered/joined devices)"
        "DeviceManagementConfiguration.Read.All" = "Read device management configuration (Intune policies, settings)"
        "DeviceManagementManagedDevices.Read.All" = "Read managed devices in Intune"
        "DeviceManagementApps.Read.All" = "Read device management applications (Intune)"
        "DeviceManagementServiceConfig.Read.All" = "Read Intune service configuration settings" # Added for comprehensive Intune discovery

        # Policy and governance
        "Policy.Read.All" = "Read policies including conditional access, authentication methods, etc."
        "Policy.Read.ConditionalAccess" = "Read conditional access policies specifically" # Already covered by Policy.Read.All but explicit
        "Reports.Read.All" = "Read reports for usage (e.g., OneDrive, SharePoint, Teams) and security analytics"

        # SharePoint, OneDrive, and Teams via Graph
        "Sites.Read.All" = "Read SharePoint sites and content lists/libraries. For discovery, this is preferred over FullControl."
        # "Sites.FullControl.All" = "Full control of SharePoint sites (typically for migration scenarios, very high privilege)" # Kept as per original script, but review if only discovery is needed.
        "Files.Read.All" = "Read all files across the organization (OneDrive, SharePoint)"
        "Team.ReadBasic.All" = "Read basic team information"
        "TeamMember.Read.All" = "Read team members and ownership"
        "TeamSettings.Read.All" = "Read team settings and configuration"
        "Channel.ReadBasic.All" = "Read basic channel information within Teams" # Added for Teams discovery
        "ChannelMember.Read.All" = "Read channel membership within Teams" # Added for Teams discovery

        # Exchange Online via Graph (for mail-related discovery if not solely relying on ExchangeOnlineManagement module)
        "MailboxSettings.Read" = "Read users' mailbox settings (e.g., auto-reply, language, time zone)" # Added
        "Mail.ReadBasic.All" = "Read basic properties of mail messages (without body) across all mailboxes" # Added for enumeration/listing
        "Calendars.Read" = "Read users' calendars and events" # Added
        "Contacts.Read" = "Read users' contacts" # Added

        # Advanced features & Migration Planning related
        "Directory.ReadWrite.All" = "Read and write directory data (potentially for migration scenarios, very high privilege)" # Kept as per original script
        "Synchronization.Read.All" = "Read synchronization data and AD Connect hybrid configurations"
        "ExternalConnection.Read.All" = "Read external connections and search configurations (Microsoft Search)"
        "Member.Read.Hidden" = "Read hidden group members (requires specific admin consent)"
        "LicenseAssignment.Read.All" = "Read license assignments and usage for users and groups" # Confirmed
    }
    AzureADRoles = @(
        "Cloud Application Administrator", # To manage enterprise applications, app registrations, consent
        "Directory Readers" # Basic read access to directory, often granted by default but good to ensure
    )
    AzureRoles = @(
        "Reader" # For Azure resource discovery (VMs, VNETs, etc.)
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
        "ERROR" { "[ERR]" }
        "WARN" { "[WARN]" }
        "CRITICAL" { "[CRIT]" }
        "IMPORTANT" { "[IMP]" }
        "PROGRESS" { "[PROG]" }
        "DEBUG" { "[DBG]" }
        "HEADER" { "[HDR]" }
        default { "[INFO]" }
    }
    
    $displayMessage = "$icon $logMessage"
    
    if ($NoNewLine) {
        Write-Host $displayMessage @colorParams -NoNewLine
    } else {
        Write-Host $displayMessage @colorParams
    }
    
    # Enhanced file logging with error handling
    if ($LogPath -and (Test-Path (Split-Path $LogPath -Parent) -PathType Container)) {
        try {
            Add-Content -Path $LogPath -Value $logMessage -Encoding UTF8 -ErrorAction Stop
        } catch {
            Write-Warning "Failed to write to log file '$LogPath': $($_.Exception.Message)"
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
    
    $separator = "=" * 90
    Write-Host "`n$separator" @($script:ColorScheme.Separator)
    Write-Host "  >> $Title" @($script:ColorScheme.Header)
    if ($Subtitle) {
        Write-Host "  -- $Subtitle" @($script:ColorScheme.Info)
    }
    Write-Host "$separator`n" @($script:ColorScheme.Separator)
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
    
    $icon = if ($Success) { "[OK]" } else { "[ERR]" }
    $level = if ($Success) { "SUCCESS" } else { "ERROR" }
    $durationText = if ($Duration) { " ($('{0:F2}' -f $Duration.TotalSeconds)s)" } else { "" }
    
    $message = "$Operation$durationText"
    if ($Details) {
        $message += " - $Details"
    }
    
    Write-EnhancedLog "$icon $message" -Level $level
}

function Start-OperationTimer {
    param([string]$OperationName)
    
    $script:Metrics.Operations[$OperationName].StartTime = Get-Date
    Write-EnhancedLog "[START] Starting: $OperationName" -Level PROGRESS
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

# Import required modules using absolute paths relative to suite root
$ModulePaths = @(
    (Join-Path $script:SuiteRoot "Modules\Utilities\Logging.psm1"),
    (Join-Path $script:SuiteRoot "Modules\Authentication\CredentialManagement.psm1")
)

foreach ($ModulePath in $ModulePaths) {
    if (Test-Path $ModulePath) {
        Import-Module $ModulePath -Force
    } else {
        Write-Warning "Required module not found: $ModulePath"
    }
}

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
        
        # Administrator privileges check
        $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
        $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if ($isAdmin) {
            Write-EnhancedLog "Running with administrator privileges" -Level SUCCESS
        } else {
            $warnings += "Not running as administrator. Some operations may require elevation"
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
                    $issues += "Cannot connect to $($test.Service) ($($test.Host) port $($test.Port))"
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
        
        # Enhanced module availability check with versions
        Write-EnhancedLog "Checking PowerShell modules..." -Level PROGRESS
        foreach ($module in $script:ScriptInfo.Dependencies) {
            $installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | 
                Sort-Object Version -Descending | Select-Object -First 1
            
            if ($installedModule) {
                Write-EnhancedLog "Module available: $module v$($installedModule.Version)" -Level SUCCESS
            } else {
                $issues += "Required module '$module' not found. Install with: Install-Module $module -Scope CurrentUser"
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
        # Clean up existing modules to prevent conflicts
        Write-EnhancedLog "Unloading potentially conflicting modules..." -Level PROGRESS
        $loadedModules = Get-Module -Name "Az.*", "Microsoft.Graph.*" -ErrorAction SilentlyContinue
        $unloadCount = 0
        foreach ($module in $loadedModules) {
            try {
                Remove-Module -Name $module.Name -Force -ErrorAction Stop
                $unloadCount++
                Write-EnhancedLog "Unloaded $($module.Name) v$($module.Version)" -Level SUCCESS
            } catch {
                Write-EnhancedLog "Could not unload $($module.Name): $($_.Exception.Message)" -Level WARN
            }
        }
        
        if ($unloadCount -gt 0) {
            Write-EnhancedLog "Unloaded $unloadCount modules successfully" -Level SUCCESS
        }
        
        # Process each required module with enhanced progress tracking
        $totalModules = $script:ScriptInfo.Dependencies.Count
        $processedModules = 0
        
        foreach ($moduleName in $script:ScriptInfo.Dependencies) {
            $processedModules++
            Write-Progress -Activity "Processing Modules" -Status "Processing $moduleName ($processedModules/$totalModules)" -PercentComplete (($processedModules / $totalModules) * 100)
            
            Write-EnhancedLog "Processing module: $moduleName" -Level PROGRESS
            
            try {
                $installedModule = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue | 
                    Sort-Object Version -Descending | Select-Object -First 1
                
                if (-not $installedModule) {
                    Write-EnhancedLog "Installing $moduleName..." -Level PROGRESS
                    Install-Module -Name $moduleName -Scope CurrentUser -Force -AllowClobber -Repository PSGallery -ErrorAction Stop
                    Write-EnhancedLog "Successfully installed $moduleName" -Level SUCCESS
                } else {
                    $installedVersion = $installedModule.Version.ToString()
                    Write-EnhancedLog "Found $moduleName v$installedVersion" -Level INFO
                    
                    # Check for updates (optional, non-blocking)
                    try {
                        $latestModule = Find-Module -Name $moduleName -Repository PSGallery -ErrorAction Stop
                        $latestVersion = $latestModule.Version.ToString()
                        
                        if ([version]$installedVersion -lt [version]$latestVersion) {
                            Write-EnhancedLog "Update available for $moduleName v$installedVersion → v$latestVersion" -Level INFO
                            Write-EnhancedLog "Installing latest version..." -Level PROGRESS
                            Install-Module -Name $moduleName -Scope CurrentUser -Force -AllowClobber -Repository PSGallery -ErrorAction Stop
                            Write-EnhancedLog "Successfully updated $moduleName to v$latestVersion" -Level SUCCESS
                        } else {
                            Write-EnhancedLog "$moduleName is up to date (v$installedVersion)" -Level SUCCESS
                        }
                    } catch {
                        Write-EnhancedLog "Could not check for updates to $moduleName`: $($_.Exception.Message)" -Level WARN
                    }
                }
                
                # Import with version verification
                $latestInstalled = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue | 
                    Sort-Object Version -Descending | Select-Object -First 1
                
                if ($latestInstalled) {
                    Import-Module -Name $moduleName -RequiredVersion $latestInstalled.Version -Force -ErrorAction Stop
                    Write-EnhancedLog "Imported $moduleName v$($latestInstalled.Version)" -Level SUCCESS
                } else {
                    throw "Module $moduleName not found after installation"
                }
                
            } catch {
                Write-EnhancedLog "Failed to process $moduleName`: $($_.Exception.Message)" -Level ERROR
                Stop-OperationTimer "ModuleManagement" $false
                throw "Module management failed for $moduleName"
            }
        }
        
        Write-Progress -Activity "Processing Modules" -Completed
        Write-EnhancedLog "All $totalModules modules processed successfully" -Level SUCCESS
        Stop-OperationTimer "ModuleManagement" $true
        
    } catch {
        Write-EnhancedLog "Module management error: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "ModuleManagement" $false
        throw
    }
}
#endregion

# Continue with the rest of the script...
# This is a placeholder for the remaining functions that will be added in the next part
Write-EnhancedLog "Enhanced M&A Discovery Suite App Registration Script loaded successfully" -Level SUCCESS
Write-EnhancedLog "Note: This is part 1 of the enhanced script. Additional functions will be loaded." -Level INFO
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
            if ($TenantId) {
                Connect-MgGraph -Scopes $requiredScopes -TenantId $TenantId -NoWelcome -ErrorAction Stop
            } else {
                Connect-MgGraph -Scopes $requiredScopes -NoWelcome -ErrorAction Stop
            }
            
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
            if ($TenantId) {
                Connect-AzAccount -TenantId $TenantId -Scope CurrentUser -ErrorAction Stop | Out-Null
            } else {
                Connect-AzAccount -Scope CurrentUser -ErrorAction Stop | Out-Null
            }
            
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
                Write-EnhancedLog "    • $($_.Name) ($($_.State))" -Level INFO
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
            Write-Progress -Activity "Mapping Permissions" -Status "Processing $($permission.Key) ($processedPermissions/$totalPermissions)" -PercentComplete (($processedPermissions / $totalPermissions) * 100)
            
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

function Use-ExistingAppRegistration {
    param(
        [string]$ClientId,
        [string]$TenantId
    )
    
    try {
        Write-EnhancedLog "Using existing App Registration..." -Level PROGRESS
        
        # Verify the app exists
        $app = Get-MgApplication -Filter "AppId eq '$ClientId'" -ErrorAction Stop
        
        if (-not $app) {
            throw "Application with Client ID '$ClientId' not found"
        }
        
        Write-EnhancedLog "Found existing application: $($app.DisplayName)" -Level SUCCESS
        Write-EnhancedLog "  Application ID: $($app.AppId)" -Level INFO
        Write-EnhancedLog "  Object ID: $($app.Id)" -Level INFO
        
        return $app
        
    } catch {
        Write-EnhancedLog "Failed to use existing App Registration: $($_.Exception.Message)" -Level ERROR
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
                
                Write-Progress -Activity "Granting Permissions" -Status "Processing $permissionName ($currentPermission/$totalPermissions)" -PercentComplete (($currentPermission / $totalPermissions) * 100)
                
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
        Write-EnhancedLog "  • Secret value will be encrypted and stored securely" -Level IMPORTANT
        Write-EnhancedLog "  • Secret cannot be retrieved after this session" -Level IMPORTANT
        Write-EnhancedLog "  • Secret expires in $daysUntilExpiry days" -Level IMPORTANT
        Write-EnhancedLog "  • Set calendar reminder for renewal before expiry" -Level IMPORTANT
        
        Stop-OperationTimer "SecretCreation" $true
        return $clientSecret
        
    } catch {
        Write-EnhancedLog "Failed to create client secret: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "SecretCreation" $false
        throw
    }
}

function Get-InteractiveClientSecret {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration
    )
    
    try {
        Write-EnhancedLog "Prompting for existing client secret..." -Level PROGRESS
        
        # Prompt for client secret
        Write-Host "`nPlease provide the client secret for this application:" -ForegroundColor Yellow
        $clientSecretSecure = Read-Host "Client Secret" -AsSecureString
        $clientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecretSecure)
        )
        
        if ([string]::IsNullOrWhiteSpace($clientSecret)) {
            throw "Client secret cannot be empty"
        }
        
        # Create a mock client secret object for compatibility
        $mockSecret = [PSCustomObject]@{
            SecretText = $clientSecret
            KeyId = "user-provided"
            EndDateTime = (Get-Date).AddYears(1) # Default expiry since we can't determine actual expiry
        }
        
        Write-EnhancedLog "Client secret provided by user" -Level SUCCESS
        
        return $mockSecret
        
    } catch {
        Write-EnhancedLog "Failed to get client secret: $($_.Exception.Message)" -Level ERROR
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
    Write-ProgressHeader "CREDENTIAL STORAGE" "Encrypting and saving authentication data using M&A Suite credential management"
    
    try {
        # Create configuration object for credential management
        $config = @{
            authentication = @{
                credentialStorePath = $EncryptedOutputPath
                certificateThumbprint = $null
            }
        }
        
        Write-EnhancedLog "Using M&A Discovery Suite credential management system..." -Level PROGRESS
        Write-EnhancedLog "  Target Path: $EncryptedOutputPath" -Level INFO
        Write-EnhancedLog "  Encryption: Windows DPAPI (current user)" -Level INFO
        
        # Use the existing credential management system
        $saveResult = Set-SecureCredentials -ClientId $AppRegistration.AppId -ClientSecret $ClientSecret.SecretText -TenantId $TenantId -Configuration $config -ExpiryDate $ClientSecret.EndDateTime
        
        if ($saveResult) {
            Write-EnhancedLog "Credentials saved successfully using M&A Suite system" -Level SUCCESS
            Write-EnhancedLog "  Location: $EncryptedOutputPath" -Level INFO
            
            # Create enhanced backup copy with rotation
            try {
                $encryptedDir = Split-Path $EncryptedOutputPath -Parent
                $backupDir = Join-Path $encryptedDir "Backups"
                if (-not (Test-Path $backupDir)) {
                    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
                }
                
                $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
                $backupPath = Join-Path $backupDir "credentials_backup_$timestamp.config"
                Copy-Item -Path $EncryptedOutputPath -Destination $backupPath -ErrorAction Stop
                
                # Cleanup old backups (keep last 5)
                $backupFiles = Get-ChildItem -Path $backupDir -Filter "credentials_backup_*.config" | Sort-Object CreationTime -Descending
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
                    ApplicationName = $AppRegistration.DisplayName
                    ClientId = $AppRegistration.AppId
                    TenantId = $TenantId
                    CreatedDate = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
                    ExpiryDate = $ClientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss')
                    DaysUntilExpiry = ($ClientSecret.EndDateTime - (Get-Date)).Days
                    CredentialFile = $EncryptedOutputPath
                    BackupLocation = Split-Path $backupPath -Parent
                    ScriptVersion = $script:ScriptInfo.Version
                }
                
                $summaryPath = Join-Path (Split-Path $EncryptedOutputPath -Parent) "credential_summary.json"
                $summaryData | ConvertTo-Json -Depth 2 | Set-Content -Path $summaryPath -Encoding UTF8
                Write-EnhancedLog "Created credential summary file: credential_summary.json" -Level SUCCESS
                
            } catch {
                Write-EnhancedLog "Could not create summary file: $($_.Exception.Message)" -Level WARN
            }
            
            Stop-OperationTimer "CredentialStorage" $true
            return $true
        } else {
            throw "Credential save operation returned false"
        }
        
    } catch {
        Write-EnhancedLog "Failed to save credentials: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "CredentialStorage" $false
        throw
    }
}
#endregion
#region Enhanced Role Assignment
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
                    
                    # Process each enabled subscription
                    for ($i = 0; $i -lt $enabledSubscriptions.Count; $i++) {
                        $subscription = $enabledSubscriptions[$i]
                        $subscriptionName = $subscription.Name
                        $subscriptionId = $subscription.Id
                        $scope = "/subscriptions/$subscriptionId"
                        
                        Write-Progress -Activity "Processing Subscriptions" -Status "Processing $subscriptionName ($($i+1)/$($enabledSubscriptions.Count))" -PercentComplete (($i / $enabledSubscriptions.Count) * 100)
                        Write-EnhancedLog "Processing subscription [$($i+1)/$($enabledSubscriptions.Count)]: $subscriptionName" -Level PROGRESS
                        
                        try {
                            # Set context to specific subscription
                            $contextResult = Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop
                            
                            # Check current role assignments for this service principal
                            $existingRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
                            
                            foreach ($roleName in $script:AppConfig.AzureRoles) {
                                # Check if role is already assigned
                                $hasRole = $existingRoles | Where-Object { $_.RoleDefinitionName -eq $roleName }
                                
                                if ($hasRole) {
                                    Write-EnhancedLog "  $roleName already assigned to: $subscriptionName" -Level INFO
                                    $azureRoleDetails.SkippedCount++
                                } else {
                                    try {
                                        $roleAssignmentParams = @{
                                            ObjectId = $ServicePrincipal.Id
                                            RoleDefinitionName = $roleName
                                            Scope = $scope
                                            ErrorAction = 'Stop'
                                        }
                                        
                                        $roleAssignment = New-AzRoleAssignment @roleAssignmentParams
                                        
                                        if ($roleAssignment) {
                                            Write-EnhancedLog "  Successfully assigned $roleName to: $subscriptionName" -Level SUCCESS
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
                            $finalRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
                            $readerRole = $finalRoles | Where-Object { $_.RoleDefinitionName -eq "Reader" }
                            
                            if ($readerRole) {
                                $azureRoleDetails.SuccessfulSubscriptions += $subscriptionName
                            }
                            
                        } catch {
                            $errorMsg = $_.Exception.Message
                            Write-EnhancedLog "  Failed to process subscription $subscriptionName : $errorMsg" -Level ERROR
                            $azureRoleDetails.FailedCount++
                            $azureRoleDetails.FailedSubscriptions += "$subscriptionName (Access Error): $errorMsg"
                        }
                    }
                    
                    Write-Progress -Activity "Processing Subscriptions" -Completed
                    
                    # Determine overall success
                    $azureRoleAssignmentSuccess = ($azureRoleDetails.AssignedCount + $azureRoleDetails.SkippedCount) -gt 0
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
    Write-EnhancedLog "  Use Existing App: $UseExistingApp" -Level INFO
    if ($ExistingClientId) {
        Write-EnhancedLog "  Existing Client ID: $ExistingClientId" -Level INFO
    }
    
    # Prerequisites validation
    if (-not (Test-Prerequisites)) {
        throw "Prerequisites validation failed. Please resolve issues and retry."
    }
    
    if ($ValidateOnly) {
        Write-EnhancedLog "Validation-only mode completed successfully" -Level SUCCESS
        exit 0
    }
    
    # Module management
    Ensure-RequiredModules
    
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
    $detectedTenantId = $context.TenantId
    $tenantInfo = Get-MgOrganization | Select-Object -First 1
    
    # Use detected tenant ID if not provided
    if (-not $TenantId) {
        $TenantId = $detectedTenantId
        Write-EnhancedLog "Using detected Tenant ID: $TenantId" -Level INFO
    }
    
    Write-EnhancedLog "Operating in tenant: $TenantId" -Level SUCCESS
    Write-EnhancedLog "  Organization: $($tenantInfo.DisplayName)" -Level INFO
    Write-EnhancedLog "  Verified Domains: $($tenantInfo.VerifiedDomains.Count)" -Level INFO
    if ($tenantInfo.CreatedDateTime) {
        Write-EnhancedLog "  Tenant Created: $($tenantInfo.CreatedDateTime.ToString('yyyy-MM-dd'))" -Level INFO
    }
    
    # Create or use existing app registration
    $appRegistration = $null
    
    if ($UseExistingApp -and $ExistingClientId) {
        $appRegistration = Use-ExistingAppRegistration -ClientId $ExistingClientId -TenantId $TenantId
    } else {
        $appRegistration = New-EnhancedAppRegistration
    }
    
    # Grant admin consent and create service principal
    $servicePrincipal = Grant-EnhancedAdminConsent -AppRegistration $appRegistration
    
    # Assign roles
    Set-EnhancedRoleAssignments -ServicePrincipal $servicePrincipal
    
    # Create or get client secret
    $clientSecret = $null
    
    if ($UseExistingApp -and $ExistingClientId) {
        $clientSecret = Get-InteractiveClientSecret -AppRegistration $appRegistration
    } else {
        $clientSecret = New-EnhancedClientSecret -AppRegistration $appRegistration
    }
    
    # Save encrypted credentials
    Save-EnhancedCredentials -AppRegistration $appRegistration -ClientSecret $clientSecret -TenantId $TenantId
    
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
    Write-EnhancedLog "  Directory (Tenant) ID: $TenantId" -Level SUCCESS
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
    
    Write-EnhancedLog "NEXT STEPS:" -Level HEADER
    Write-EnhancedLog "  1. Admin consent URL: https://login.microsoftonline.com/$TenantId/adminconsent?client_id=$($appRegistration.AppId)" -Level IMPORTANT
    Write-EnhancedLog "  2. Update M&A Discovery configuration to use: $EncryptedOutputPath" -Level IMPORTANT
    Write-EnhancedLog "  3. Test with: .\Core\MandA-Orchestrator.ps1 -ValidateOnly" -Level IMPORTANT
    Write-EnhancedLog "  4. Run discovery: .\Core\MandA-Orchestrator.ps1 -Mode Full" -Level IMPORTANT
    
    Write-EnhancedLog "IMPORTANT SECURITY REMINDERS:" -Level CRITICAL -NoTimestamp
    Write-EnhancedLog "  • Client secret expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd'))" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  • Set calendar reminder for credential renewal" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  • Credentials are user-encrypted (current user only)" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  • Backup credentials file is stored securely" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  • Review and audit permissions regularly" -Level IMPORTANT -NoTimestamp
    
    Write-EnhancedLog "Azure AD App Registration completed successfully!" -Level SUCCESS
    Write-EnhancedLog "Ready to proceed with M&A Discovery Suite operations" -Level SUCCESS
    
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
