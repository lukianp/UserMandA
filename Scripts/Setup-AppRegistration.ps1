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
#     Version: 4.0.4 (Displays client secret, added Mail.Read & Place.Read.All permissions, logs ClientID, note on Exchange RBAC)
#     Created: 2025
#     Last Modified: 2025-05-30
#     
#     Security: Credentials encrypted with Windows DPAPI for current user context
#     Resume: Supports re-running without recreation of existing resources
#     Validation: Comprehensive prerequisites and permission validation
#     Backup: Automatic credential file backup and rotation
#
#     IMPORTANT FOR EXCHANGE ONLINE DISCOVERY: 
#     For app-only authentication to Exchange Online (used by ExchangeDiscovery.psm1), the Service Principal
#     created by this script typically needs to be assigned RBAC roles *within Exchange Online itself*
#     (e.g., "View-Only Organization Management" or more granular roles). This script does NOT perform
#     Exchange Online RBAC assignments. This must be done manually by an Exchange Administrator using
#     Exchange Online PowerShell. Example: Add service principal to "View-Only Organization Management".
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
   [string]$EncryptedOutputPath = "C:\MandADiscovery\Output\credentials.config", # Standardized path
    
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
$script:ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:SuiteRoot = Split-Path $script:ScriptDir -Parent

# Source Set-SuiteEnvironment.ps1 if not already done
$envSetupScript = Join-Path $script:ScriptDir "Set-SuiteEnvironment.ps1"
if (Test-Path $envSetupScript) {
    . $envSetupScript
}

# Import required modules with better error handling
$ModulePaths = @(
    (Join-Path $script:SuiteRoot "Modules\Utilities\Logging.psm1"), # Assuming EnhancedLogging.psm1 is Logging.psm1
    (Join-Path $script:SuiteRoot "Modules\Authentication\CredentialManagement.psm1")
)

$moduleLoadErrors = @()
foreach ($ModulePath in $ModulePaths) {
    if (Test-Path $ModulePath) {
        try {
            Import-Module $ModulePath -Force -Global
            Write-Host "Successfully imported module: $(Split-Path $ModulePath -Leaf)" -ForegroundColor Green
        } catch {
            $moduleLoadErrors += "Failed to import $ModulePath $($_.Exception.Message)"
            Write-Warning "Failed to import module: $ModulePath"
        }
    } else {
        $moduleLoadErrors += "Module not found: $ModulePath"
        Write-Warning "Required module not found: $ModulePath"
    }
}

# Check if critical functions are available
if (-not (Get-Command Set-SecureCredentials -ErrorAction SilentlyContinue)) {
    Write-Error "Critical function 'Set-SecureCredentials' from CredentialManagement.psm1 not available."
    if ($moduleLoadErrors.Count -gt 0) {
        Write-Error "Module loading errors:"
        $moduleLoadErrors | ForEach-Object { Write-Error "  $_" }
    }
    throw "Required modules/functions not available. Cannot continue."
}
if (-not (Get-Command Write-EnhancedLog -ErrorAction SilentlyContinue)) {
    # Fallback to Write-Host if Write-EnhancedLog is not available from Logging.psm1
    Function Write-EnhancedLog { param([string]$Message, [string]$Level="INFO") Write-Host "[$Level] $Message" }
    Write-Warning "Write-EnhancedLog function not found. Using basic Write-Host for logging in this script."
}


#region Enhanced Global Configuration
$ErrorActionPreference = "Stop"
$VerbosePreference = "SilentlyContinue" # Set to "Continue" for more verbose output if needed
$ProgressPreference = "Continue"

# Script metadata and validation
$script:ScriptInfo = @{
    Name = "Enhanced M&A Discovery Suite - App Registration"
    Version = "4.0.4" # Version updated
    Author = "M&A Discovery Team"
    RequiredPSVersion = "5.1"
    Dependencies = @("Az.Accounts", "Az.Resources", "Microsoft.Graph.Applications", "Microsoft.Graph.Authentication", "Microsoft.Graph.Identity.DirectoryManagement")
}

# Enhanced application configuration
$script:AppConfig = @{
    DisplayName = $AppName
    Description = "M&A Environment Discovery Service Principal with comprehensive permissions for organizational assessment"
    RequiredGraphPermissions = @{
        "Application.Read.All" = "Read all applications and service principals" 
        "AppRoleAssignment.Read.All" = "Read all app role assignments"
        "AuditLog.Read.All" = "Read audit logs for compliance tracking"
        "Directory.Read.All" = "Read directory data including users, groups, and organizational structure"
        "Group.Read.All" = "Read all groups and group properties"
        "GroupMember.Read.All" = "Read group memberships across the organization"
        "User.Read.All" = "Read all user profiles and properties"
        "Organization.Read.All" = "Read organization information and settings"
        "RoleManagement.Read.All" = "Read role management data (Azure AD roles, eligibility, assignments)"
        "SignIn.Read.All" = "Read all user sign-in activity logs"
        "Device.Read.All" = "Read all device information (Azure AD registered/joined devices)"
        "DeviceManagementConfiguration.Read.All" = "Read device management configuration (Intune policies, settings)"
        "DeviceManagementManagedDevices.Read.All" = "Read managed devices in Intune"
        "DeviceManagementApps.Read.All" = "Read device management applications (Intune)"
        "DeviceManagementServiceConfig.Read.All" = "Read Intune service configuration settings"
        "Policy.Read.All" = "Read policies including conditional access, authentication methods, etc."
        "Policy.Read.ConditionalAccess" = "Read conditional access policies specifically"
        "Reports.Read.All" = "Read reports for usage and security analytics"
        "Sites.Read.All" = "Read SharePoint sites and content lists/libraries."
        "Files.Read.All" = "Read all files across the organization (OneDrive, SharePoint)"
        "Team.ReadBasic.All" = "Read basic team information"
        "TeamMember.Read.All" = "Read team members and ownership"
        "TeamSettings.Read.All" = "Read team settings and configuration"
        "Channel.ReadBasic.All" = "Read basic channel information within Teams"
        "ChannelMember.Read.All" = "Read channel membership within Teams"
        "MailboxSettings.Read" = "Read users' mailbox settings"
        "Mail.ReadBasic.All" = "Read basic properties of mail messages across all mailboxes"
        "Calendars.Read" = "Read users' calendars and events"
        "Contacts.Read" = "Read users' contacts"
        "Mail.Read" = "Read mail in all mailboxes" 
        "Place.Read.All" = "Read all company places (e.g., meeting rooms)" 
        "Directory.ReadWrite.All" = "Read and write directory data (high privilege)" 
        "Synchronization.Read.All" = "Read synchronization data and AD Connect hybrid configurations"
        "ExternalConnection.Read.All" = "Read external connections and search configurations"
        "Member.Read.Hidden" = "Read hidden group members (requires specific admin consent)"
        "LicenseAssignment.Read.All" = "Read license assignments and usage"
    }
    AzureADRoles = @(
        "Cloud Application Administrator", 
        "Directory Readers" 
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

#region Enhanced Logging and Output Functions (Using Write-EnhancedLog if available)
# Write-EnhancedLog is expected from Logging.psm1
# Fallback was defined earlier if Logging.psm1 or its function isn't loaded.

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

#region Enhanced Prerequisites and Validation
function Test-Prerequisites {
    Start-OperationTimer "Prerequisites"
    Write-ProgressHeader "PREREQUISITES VALIDATION" "Comprehensive environment and security checks"
    $issues = @(); $warnings = @()
    try {
        $psVersion = $PSVersionTable.PSVersion
        $requiredVersion = [version]$script:ScriptInfo.RequiredPSVersion
        if ($psVersion -lt $requiredVersion) { $issues += "PowerShell $($script:ScriptInfo.RequiredPSVersion)+ required. Current: $psVersion" }
        elseif ($psVersion.Major -eq 5) { $warnings += "PowerShell 5.1 detected. PowerShell 7+ recommended." }
        else { Write-EnhancedLog "PowerShell version: $psVersion" -Level SUCCESS }

        $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
        if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { Write-EnhancedLog "Running with administrator privileges" -Level SUCCESS }
        else { $warnings += "Not running as administrator. Some operations may require elevation" }

        $connectivityTests = @(
            @{ Host = "graph.microsoft.com"; Port = 443; Service = "Microsoft Graph" },
            @{ Host = "management.azure.com"; Port = 443; Service = "Azure Management" },
            @{ Host = "login.microsoftonline.com"; Port = 443; Service = "Azure AD Authentication" }
        )
        Write-EnhancedLog "Testing network connectivity to $($connectivityTests.Count) endpoints..." -Level PROGRESS
        $connectionResults = @()
        foreach ($test in $connectivityTests) {
            try {
                if (Test-NetConnection -ComputerName $test.Host -Port $test.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction Stop) {
                    Write-EnhancedLog "Connectivity to $($test.Service): Available" -Level SUCCESS; $connectionResults += $true
                } else { $issues += "Cannot connect to $($test.Service)"; $connectionResults += $false }
            } catch { $issues += "Network test failed for $($test.Service): $($_.Exception.Message)"; $connectionResults += $false }
        }
        $successfulConnections = ($connectionResults | Where-Object { $_ }).Count
        Write-EnhancedLog "Network connectivity: $successfulConnections/$($connectivityTests.Count) endpoints accessible" -Level $(if ($successfulConnections -eq $connectivityTests.Count) { "SUCCESS" } else { "WARN" })

        $encryptedDir = Split-Path $EncryptedOutputPath -Parent
        if (-not (Test-Path $encryptedDir -PathType Container)) {
            try { New-Item -Path $encryptedDir -ItemType Directory -Force -ErrorAction Stop | Out-Null; Write-EnhancedLog "Created output directory: $encryptedDir" -Level SUCCESS }
            catch { $issues += "Cannot create output directory '$encryptedDir': $($_.Exception.Message)" }
        } else {
            $testFile = Join-Path $encryptedDir "write_test_$(Get-Random).tmp"
            try { "test" | Out-File -FilePath $testFile -ErrorAction Stop; Remove-Item $testFile -ErrorAction SilentlyContinue; Write-EnhancedLog "Output directory accessible: $encryptedDir" -Level SUCCESS }
            catch { $issues += "Output directory lacks write permissions: $encryptedDir" }
        }

        Write-EnhancedLog "Checking PowerShell modules..." -Level PROGRESS
        foreach ($module in $script:ScriptInfo.Dependencies) {
            $installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
            if ($installedModule) { Write-EnhancedLog "Module available: $module v$($installedModule.Version)" -Level SUCCESS }
            else { $issues += "Required module '$module' not found. Install with: Install-Module $module -Scope CurrentUser" }
        }

        if ($warnings.Count -gt 0) { Write-EnhancedLog "Prerequisites validation found $($warnings.Count) warning(s):" -Level WARN; $warnings | ForEach-Object { Write-EnhancedLog "  $_" -Level WARN } }
        if ($issues.Count -gt 0) { Write-EnhancedLog "Prerequisites validation failed with $($issues.Count) issue(s):" -Level ERROR; $issues | ForEach-Object { Write-EnhancedLog "  $_" -Level ERROR }; Stop-OperationTimer "Prerequisites" $false; return $false }
        
        Write-EnhancedLog "All prerequisites validated successfully" -Level SUCCESS
        Stop-OperationTimer "Prerequisites" $true; return $true
    } catch { Write-EnhancedLog "Prerequisites validation error: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "Prerequisites" $false; return $false }
}
#endregion

#region Enhanced Module Management
function Ensure-RequiredModules {
    Start-OperationTimer "ModuleManagement"
    Write-ProgressHeader "MODULE MANAGEMENT" "Installing and updating required PowerShell modules"
    try {
        $OriginalWarningPreference = $WarningPreference; $WarningPreference = 'SilentlyContinue'
        Update-AzConfig -DisplayBreakingChangeWarning $false -Scope Process -ErrorAction SilentlyContinue
        
        Write-EnhancedLog "Unloading potentially conflicting modules..." -Level PROGRESS
        Get-Module -Name "Az.*", "Microsoft.Graph.*" -ErrorAction SilentlyContinue | ForEach-Object {
            try { Remove-Module -Name $_.Name -Force -ErrorAction Stop; Write-EnhancedLog "Unloaded $($_.Name) v$($_.Version)" -Level SUCCESS }
            catch { Write-EnhancedLog "Could not unload $($_.Name): $($_.Exception.Message)" -Level WARN }
        }
        
        $totalModules = $script:ScriptInfo.Dependencies.Count; $processedModules = 0
        foreach ($moduleName in $script:ScriptInfo.Dependencies) {
            $processedModules++; Write-Progress -Activity "Processing Modules" -Status "Processing $moduleName ($processedModules/$totalModules)" -PercentComplete (($processedModules / $totalModules) * 100)
            Write-EnhancedLog "Processing module: $moduleName" -Level PROGRESS
            try {
                $installedModule = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
                if (-not $installedModule) {
                    Write-EnhancedLog "Installing $moduleName..." -Level PROGRESS
                    Install-Module -Name $moduleName -Scope CurrentUser -Force -AllowClobber -Repository PSGallery -ErrorAction Stop
                    Write-EnhancedLog "Successfully installed $moduleName" -Level SUCCESS
                } else { Write-EnhancedLog "Found $moduleName v$($installedModule.Version)" -Level INFO }
                
                $latestInstalled = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
                if ($latestInstalled) { Import-Module -Name $moduleName -RequiredVersion $latestInstalled.Version -Force -ErrorAction Stop; Write-EnhancedLog "Imported $moduleName v$($latestInstalled.Version)" -Level SUCCESS }
                else { throw "Module $moduleName not found after installation attempt" }
            } catch { Write-EnhancedLog "Failed to process $moduleName`: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "ModuleManagement" $false; throw "Module management failed for $moduleName" }
        }
        Write-Progress -Activity "Processing Modules" -Completed
        Write-EnhancedLog "All $totalModules modules processed successfully" -Level SUCCESS
        $WarningPreference = $OriginalWarningPreference
        Stop-OperationTimer "ModuleManagement" $true
    } catch { Write-EnhancedLog "Module management error: $($_.Exception.Message)" -Level ERROR; $WarningPreference = $OriginalWarningPreference; Stop-OperationTimer "ModuleManagement" $false; throw }
}
#endregion

#region Enhanced Connection Management
function Connect-EnhancedGraph {
    Start-OperationTimer "GraphConnection"
    Write-ProgressHeader "MICROSOFT GRAPH CONNECTION" "Establishing authenticated session"
    $maxRetries = 3; $retryDelay = 5
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            Write-EnhancedLog "Graph Connection attempt $attempt of $maxRetries..." -Level PROGRESS
            $requiredScopes = @("Application.ReadWrite.All", "Directory.ReadWrite.All", "AppRoleAssignment.ReadWrite.All", "RoleManagement.ReadWrite.Directory", "Policy.Read.All")
            
            $existingContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($existingContext -and $existingContext.Scopes -and ($requiredScopes | ForEach-Object { $_ -in $existingContext.Scopes } | Where-Object { $_ -eq $false } | Measure-Object | Select-Object -ExpandProperty Count) -eq 0) {
                Write-EnhancedLog "Using existing valid Graph connection" -Level SUCCESS
                $script:ConnectionStatus.Graph.Connected = $true; $script:ConnectionStatus.Graph.Context = $existingContext
                Stop-OperationTimer "GraphConnection" $true; return $true
            }
            if ($existingContext) { Disconnect-MgGraph -ErrorAction SilentlyContinue; Write-EnhancedLog "Disconnected existing Graph session" -Level INFO }

            Write-EnhancedLog "Connecting to Microsoft Graph with required scopes..." -Level PROGRESS
            if ($TenantId) { Connect-MgGraph -Scopes $requiredScopes -TenantId $TenantId -NoWelcome -ErrorAction Stop }
            else { Connect-MgGraph -Scopes $requiredScopes -NoWelcome -ErrorAction Stop }
            
            $context = Get-MgContext -ErrorAction Stop
            if (-not $context -or -not $context.Account) { throw "Failed to establish valid Graph context" }
            
            Get-MgOrganization -Top 1 -ErrorAction Stop | Out-Null # Test call
            Write-EnhancedLog "Successfully connected to Microsoft Graph. Account: $($context.Account), Tenant: $($context.TenantId)" -Level SUCCESS
            $script:ConnectionStatus.Graph.Connected = $true; $script:ConnectionStatus.Graph.Context = $context
            Stop-OperationTimer "GraphConnection" $true; return $true
        } catch {
            $errorMessage = $_.Exception.Message; Write-EnhancedLog "Graph connection attempt $attempt failed: $errorMessage" -Level ERROR
            $script:ConnectionStatus.Graph.LastError = $errorMessage
            if ($attempt -lt $maxRetries) { Write-EnhancedLog "Retrying in $retryDelay seconds..." -Level PROGRESS; Start-Sleep -Seconds $retryDelay; $retryDelay += 2 }
        }
    }
    Write-EnhancedLog "Failed to establish Graph connection after $maxRetries attempts" -Level ERROR
    Stop-OperationTimer "GraphConnection" $false; return $false
}

function Connect-EnhancedAzure {
    if ($SkipAzureRoles) { Write-EnhancedLog "Skipping Azure connection as requested" -Level INFO; return $true }
    Start-OperationTimer "AzureConnection"
    Write-ProgressHeader "AZURE CONNECTION" "Establishing Azure Resource Management session"
    $maxRetries = 3; $retryDelay = 5
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            Write-EnhancedLog "Azure Connection attempt $attempt of $maxRetries..." -Level PROGRESS
            $existingContext = Get-AzContext -ErrorAction SilentlyContinue
            if ($existingContext -and $existingContext.Account) {
                try { Get-AzSubscription -ErrorAction Stop | Out-Null; Write-EnhancedLog "Using existing Azure connection" -Level SUCCESS; $script:ConnectionStatus.Azure.Connected = $true; $script:ConnectionStatus.Azure.Context = $existingContext; Stop-OperationTimer "AzureConnection" $true; return $true }
                catch { Write-EnhancedLog "Existing Azure connection invalid, reconnecting..." -Level WARN }
            }

            Write-EnhancedLog "Connecting to Azure..." -Level PROGRESS
            if ($TenantId) { Connect-AzAccount -TenantId $TenantId -Scope CurrentUser -ErrorAction Stop | Out-Null }
            else { Connect-AzAccount -Scope CurrentUser -ErrorAction Stop | Out-Null }
            
            $context = Get-AzContext -ErrorAction Stop
            if (-not $context -or -not $context.Account) { throw "Failed to establish valid Azure context" }
            Get-AzSubscription -ErrorAction Stop | Out-Null # Test call
            Write-EnhancedLog "Successfully connected to Azure. Account: $($context.Account.Id), Tenant: $($context.Tenant.Id)" -Level SUCCESS
            $script:ConnectionStatus.Azure.Connected = $true; $script:ConnectionStatus.Azure.Context = $context
            Stop-OperationTimer "AzureConnection" $true; return $true
        } catch {
            $errorMessage = $_.Exception.Message; Write-EnhancedLog "Azure connection attempt $attempt failed: $errorMessage" -Level ERROR
            $script:ConnectionStatus.Azure.LastError = $errorMessage
            if ($attempt -lt $maxRetries) { Write-EnhancedLog "Retrying in $retryDelay seconds..." -Level PROGRESS; Start-Sleep -Seconds $retryDelay; $retryDelay += 2 }
        }
    }
    Write-EnhancedLog "Failed to establish Azure connection after $maxRetries attempts" -Level ERROR
    Stop-OperationTimer "AzureConnection" $false; return $false
}
#endregion

#region Enhanced App Registration Management
function New-EnhancedAppRegistration {
    Start-OperationTimer "AppRegistration"
    Write-ProgressHeader "APPLICATION REGISTRATION" "Creating M&A Discovery service principal"
    $appName = $script:AppConfig.DisplayName
    try {
        Write-EnhancedLog "Checking for existing application '$appName'..." -Level PROGRESS
        $existingApp = Get-MgApplication -Filter "displayName eq '$appName'" -ErrorAction SilentlyContinue
        if ($existingApp -and -not $Force) {
            Write-EnhancedLog "Application '$appName' already exists (ID: $($existingApp.AppId)). Use -Force to recreate." -Level WARN
            Stop-OperationTimer "AppRegistration" $true; return $existingApp
        } elseif ($existingApp -and $Force) {
            Write-EnhancedLog "Force mode: Removing existing application '$($existingApp.AppId)'..." -Level PROGRESS
            Remove-MgApplication -ApplicationId $existingApp.Id -ErrorAction Stop
            Write-EnhancedLog "Existing application removed." -Level SUCCESS; Start-Sleep -Seconds 3
        }
        
        Write-EnhancedLog "Fetching Microsoft Graph service principal..." -Level PROGRESS
        $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
        if (-not $graphSp) { throw "Microsoft Graph service principal not found." }
        Write-EnhancedLog "Found Microsoft Graph SP (ID: $($graphSp.Id))" -Level SUCCESS
        
        $resourceAccess = @(); $foundPermissions = @(); $missingPermissions = @()
        $totalPermissions = $script:AppConfig.RequiredGraphPermissions.Count; $processedPermissions = 0
        Write-EnhancedLog "Mapping $totalPermissions permissions..." -Level PROGRESS
        foreach ($permission in $script:AppConfig.RequiredGraphPermissions.GetEnumerator()) {
            $processedPermissions++; Write-Progress -Activity "Mapping Permissions" -Status "Processing $($permission.Key) ($processedPermissions/$totalPermissions)" -PercentComplete (($processedPermissions / $totalPermissions) * 100)
            $appRole = $graphSp.AppRoles | Where-Object { $_.Value -eq $permission.Key }
            if ($appRole) { $resourceAccess += @{ Id = $appRole.Id; Type = "Role" }; $foundPermissions += $permission.Key }
            else { $missingPermissions += $permission.Key; Write-EnhancedLog "Permission not found: $($permission.Key)" -Level WARN }
        }
        Write-Progress -Activity "Mapping Permissions" -Completed
        if ($missingPermissions.Count -gt 0) { Write-EnhancedLog "$($missingPermissions.Count) permissions could not be mapped but continuing..." -Level WARN }
        
        $requiredResourceAccess = @( @{ ResourceAppId = "00000003-0000-0000-c000-000000000000"; ResourceAccess = $resourceAccess } )
        Write-EnhancedLog "Creating application registration '$appName'..." -Level PROGRESS
        $appRegistration = New-MgApplication -DisplayName $appName -Description $script:AppConfig.Description -RequiredResourceAccess $requiredResourceAccess -ErrorAction Stop
        Write-EnhancedLog "Application registration '$($appRegistration.DisplayName)' created (AppID: $($appRegistration.AppId))" -Level SUCCESS
        Stop-OperationTimer "AppRegistration" $true; return $appRegistration
    } catch { Write-EnhancedLog "Failed to create application registration: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "AppRegistration" $false; throw }
}

function Use-ExistingAppRegistration {
    param([string]$ClientId, [string]$TenantId)
    Start-OperationTimer "AppRegistration" # Reuse timer for consistency
    Write-ProgressHeader "APPLICATION REGISTRATION" "Using existing application"
    try {
        Write-EnhancedLog "Attempting to use existing App Registration with Client ID: $ClientId" -Level PROGRESS
        $app = Get-MgApplication -Filter "AppId eq '$ClientId'" -ErrorAction Stop
        if (-not $app) { throw "Application with Client ID '$ClientId' not found in tenant '$TenantId'." }
        Write-EnhancedLog "Found existing application: $($app.DisplayName) (AppID: $($app.AppId))" -Level SUCCESS
        Stop-OperationTimer "AppRegistration" $true; return $app
    } catch { Write-EnhancedLog "Failed to use existing App Registration '$ClientId': $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "AppRegistration" $false; throw }
}

function Grant-EnhancedAdminConsent {
    param([Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration)
    Start-OperationTimer "PermissionGrant"
    Write-ProgressHeader "ADMIN CONSENT" "Granting application permissions and creating service principal"
    try {
        Write-EnhancedLog "Creating service principal for AppID: $($AppRegistration.AppId)..." -Level PROGRESS
        $servicePrincipal = New-MgServicePrincipal -AppId $AppRegistration.AppId -ErrorAction Stop
        Write-EnhancedLog "Service principal created (ID: $($servicePrincipal.Id))" -Level SUCCESS
        Start-Sleep -Seconds 5 # Propagation delay

        $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
        $appSp = Get-MgServicePrincipal -Filter "AppId eq '$($AppRegistration.AppId)'" -ErrorAction Stop
        Write-EnhancedLog "Granting admin consent for application permissions..." -Level PROGRESS
        
        $grantedCount = 0; $skippedCount = 0; $failedCount = 0
        $totalPermissionsToGrant = $AppRegistration.RequiredResourceAccess[0].ResourceAccess.Count; $currentPermissionIndex = 0
        foreach ($access in $AppRegistration.RequiredResourceAccess[0].ResourceAccess) {
            $currentPermissionIndex++; 
            $permissionName = ($graphSp.AppRoles | Where-Object {$_.Id -eq $access.Id}).Value
            Write-Progress -Activity "Granting Permissions" -Status "Processing $permissionName ($currentPermissionIndex/$totalPermissionsToGrant)" -PercentComplete (($currentPermissionIndex / $totalPermissionsToGrant) * 100)
            if ($access.Type -eq "Role") {
                $existingAssignment = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -ErrorAction SilentlyContinue | Where-Object { $_.AppRoleId -eq $access.Id -and $_.ResourceId -eq $graphSp.Id }
                if ($existingAssignment) { Write-EnhancedLog "Already granted: $permissionName" -Level INFO; $skippedCount++; continue }
                try {
                    New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -PrincipalId $appSp.Id -ResourceId $graphSp.Id -AppRoleId $access.Id -ErrorAction Stop | Out-Null
                    Write-EnhancedLog "Granted: $permissionName" -Level SUCCESS; $grantedCount++
                } catch { Write-EnhancedLog "Failed to grant $permissionName`: $($_.Exception.Message)" -Level ERROR; $failedCount++ }
            }
        }
        Write-Progress -Activity "Granting Permissions" -Completed
        Write-EnhancedLog "Permission grant summary: Granted=$grantedCount, Skipped=$skippedCount, Failed=$failedCount" -Level INFO
        if ($failedCount -gt 0) { Write-EnhancedLog "Some permissions failed to grant. Application may have limited functionality." -Level WARN }
        Stop-OperationTimer "PermissionGrant" $true; return $servicePrincipal
    } catch { Write-EnhancedLog "Permission grant process failed: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "PermissionGrant" $false; throw }
}

function New-EnhancedClientSecret {
    param([Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration)
    Start-OperationTimer "SecretCreation"
    Write-ProgressHeader "CLIENT SECRET" "Generating secure authentication credentials"
    try {
        $secretDescription = "M&A Discovery Secret - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        $secretEndDate = (Get-Date).AddYears($SecretValidityYears)
        Write-EnhancedLog "Creating client secret (Description: $secretDescription, Expires: $($secretEndDate.ToString('yyyy-MM-dd HH:mm:ss')))..." -Level PROGRESS
        
        $clientSecret = Add-MgApplicationPassword -ApplicationId $AppRegistration.Id -PasswordCredential @{ DisplayName = $secretDescription; EndDateTime = $secretEndDate } -ErrorAction Stop
        
        Write-EnhancedLog "Client secret created successfully (ID: $($clientSecret.KeyId))" -Level SUCCESS
        
        # MODIFICATION: Display the client secret
        Write-Host ""
        Write-EnhancedLog "----------------------------------------------------------------------" -Level CRITICAL -NoTimestamp
        Write-EnhancedLog "  CLIENT SECRET VALUE (COPY THIS NOW - IT WILL NOT BE SHOWN AGAIN):" -Level CRITICAL -NoTimestamp
        Write-Host "    $($clientSecret.SecretText)" -ForegroundColor Yellow
        Write-EnhancedLog "----------------------------------------------------------------------" -Level CRITICAL -NoTimestamp
        Write-Host ""
        
        $daysUntilExpiry = ($secretEndDate - (Get-Date)).Days
        Write-EnhancedLog "SECRET SECURITY NOTICE:" -Level IMPORTANT
        Write-EnhancedLog "  â€¢ Secret value displayed above. Copy it immediately." -Level IMPORTANT
        Write-EnhancedLog "  â€¢ Secret will be encrypted and stored securely." -Level IMPORTANT
        Write-EnhancedLog "  â€¢ Secret expires in $daysUntilExpiry days. Set calendar reminder for renewal." -Level IMPORTANT
        
        Stop-OperationTimer "SecretCreation" $true; return $clientSecret
    } catch { Write-EnhancedLog "Failed to create client secret: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "SecretCreation" $false; throw }
}

function Get-InteractiveClientSecret {
    param([Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration)
    # This function is called if -UseExistingApp is true.
    # It prompts the user to manually enter the secret for an existing app.
    Start-OperationTimer "SecretCreation" # Reuse timer
    Write-ProgressHeader "CLIENT SECRET" "Manually providing existing client secret"
    try {
        Write-EnhancedLog "Prompting for existing client secret for app: $($AppRegistration.DisplayName) (AppID: $($AppRegistration.AppId))" -Level PROGRESS
        Write-Host ""
        Write-Host "Please provide the existing client secret for this application." -ForegroundColor Yellow
        Write-Host "This secret will be encrypted and saved to the credentials file." -ForegroundColor Yellow
        $secretInput = Read-Host -Prompt "Enter Client Secret" -AsSecureString
        
        if ($null -eq $secretInput -or $secretInput.Length -eq 0) {
            throw "Client secret cannot be empty when using an existing application."
        }
        $clientSecretPlainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretInput))
        
        # Create a mock client secret object for compatibility with Save-EnhancedCredentials
        $mockSecret = [PSCustomObject]@{
            SecretText = $clientSecretPlainText
            KeyId      = "user-provided-$(Get-Date -Format 'yyyyMMddHHmmss')" # Unique key ID
            EndDateTime = (Get-Date).AddYears($SecretValidityYears) # Assume default validity or prompt for expiry
        }
        Write-EnhancedLog "Client secret provided by user and prepared for saving." -Level SUCCESS
        Stop-OperationTimer "SecretCreation" $true; return $mockSecret
    } catch { Write-EnhancedLog "Failed to get client secret interactively: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "SecretCreation" $false; throw }
}

function Save-EnhancedCredentials {
    param(
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration,
        $ClientSecret, # This can be the object from Add-MgApplicationPassword or the mock object from Get-InteractiveClientSecret
        [string]$TenantId
    )
    Start-OperationTimer "CredentialStorage"
    Write-ProgressHeader "CREDENTIAL STORAGE" "Encrypting and saving authentication data"
    try {
        Write-EnhancedLog "Preparing to save credentials to: $EncryptedOutputPath (Encryption: Windows DPAPI)" -Level PROGRESS
        
        # Ensure the CredentialManagement.psm1 module and Set-SecureCredentials function are loaded
        if (-not (Get-Command Set-SecureCredentials -ErrorAction SilentlyContinue)) {
            throw "Set-SecureCredentials function from CredentialManagement.psm1 is not available."
        }

        # Create configuration object for Set-SecureCredentials
        # This structure should match what Set-SecureCredentials expects
        $configForCredMgmt = @{
            authentication = @{
                credentialStorePath = $EncryptedOutputPath 
                # certificateThumbprint = $null # Assuming DPAPI is primary, cert is optional
            }
        }
        
        # Log the ClientID that is about to be saved
        Write-EnhancedLog "Attempting to save credentials with ClientID: $($AppRegistration.AppId), TenantID: $TenantId" -Level INFO

        Write-EnhancedLog "Using M&A Discovery Suite credential management system..." -Level PROGRESS
        # The $ClientSecret object should have a .SecretText property and an .EndDateTime property
        $saveResult = Set-SecureCredentials -ClientId $AppRegistration.AppId -ClientSecret $ClientSecret.SecretText -TenantId $TenantId -Configuration $configForCredMgmt -ExpiryDate $ClientSecret.EndDateTime -ErrorAction Stop
        
        if ($saveResult) {
            Write-EnhancedLog "Credentials saved successfully using M&A Suite system to '$EncryptedOutputPath'" -Level SUCCESS
        } else {
            throw "Set-SecureCredentials returned false, indicating save failure."
        }
        
        if (Test-Path $EncryptedOutputPath) {
            $fileInfo = Get-Item $EncryptedOutputPath
            Write-EnhancedLog "Credential file created/updated: $($fileInfo.FullName) (Size: $($fileInfo.Length) bytes)" -Level SUCCESS
        } else { throw "Credential file was not created at expected location: $EncryptedOutputPath" }
        
        # Backup and summary file creation (optional but good practice)
        try {
            $backupDir = Join-Path (Split-Path $EncryptedOutputPath -Parent) "Backups"
            if (-not (Test-Path $backupDir)) { New-Item -Path $backupDir -ItemType Directory -Force | Out-Null }
            $backupPath = Join-Path $backupDir "credentials_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').config"
            Copy-Item -Path $EncryptedOutputPath -Destination $backupPath -ErrorAction Stop
            Get-ChildItem -Path $backupDir -Filter "credentials_backup_*.config" | Sort-Object CreationTime -Descending | Select-Object -Skip 5 | Remove-Item -Force -ErrorAction SilentlyContinue
            Write-EnhancedLog "Created backup copy: $(Split-Path $backupPath -Leaf)" -Level SUCCESS
        } catch { Write-EnhancedLog "Could not create backup copy: $($_.Exception.Message)" -Level WARN }

        try {
            $summaryData = @{
                ApplicationName = $AppRegistration.DisplayName; ClientId = $AppRegistration.AppId; TenantId = $TenantId
                CreatedDate = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss'); ExpiryDate = $ClientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss')
                DaysUntilExpiry = ($ClientSecret.EndDateTime - (Get-Date)).Days; CredentialFile = $EncryptedOutputPath
            }
            $summaryPath = Join-Path (Split-Path $EncryptedOutputPath -Parent) "credential_summary.json"
            $summaryData | ConvertTo-Json -Depth 2 | Set-Content -Path $summaryPath -Encoding UTF8
            Write-EnhancedLog "Created credential summary file: credential_summary.json" -Level SUCCESS
        } catch { Write-EnhancedLog "Could not create summary file: $($_.Exception.Message)" -Level WARN }
        
        Stop-OperationTimer "CredentialStorage" $true; return $true
    } catch { Write-EnhancedLog "Failed to save credentials: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "CredentialStorage" $false; throw }
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
    $azureRoleDetails = @{ AssignedCount = 0; SkippedCount = 0; FailedCount = 0; FailedSubscriptions = @(); SuccessfulSubscriptions = @() }
    try {
        Write-EnhancedLog "Processing Azure AD role assignments for SP ID: $($ServicePrincipal.Id)..." -Level PROGRESS
        $adRoleResults = @{ Assigned = 0; Skipped = 0; Failed = 0 }
        foreach ($roleName in $script:AppConfig.AzureADRoles) {
            try {
                Write-EnhancedLog "Assigning Azure AD role: $roleName" -Level PROGRESS
                $roleDefinition = Get-MgDirectoryRole -Filter "DisplayName eq '$roleName'" -ErrorAction SilentlyContinue
                if (-not $roleDefinition) {
                    $roleTemplate = Get-MgDirectoryRoleTemplate -Filter "DisplayName eq '$roleName'" -ErrorAction Stop
                    if ($roleTemplate) { $roleDefinition = New-MgDirectoryRole -RoleTemplateId $roleTemplate.Id -ErrorAction Stop; Write-EnhancedLog "Activated role template: $roleName" -Level SUCCESS }
                    else { throw "Role template '$roleName' not found" }
                }
                if (-not (Get-MgDirectoryRoleMember -DirectoryRoleId $roleDefinition.Id -ErrorAction SilentlyContinue | Where-Object { $_.Id -eq $ServicePrincipal.Id })) {
                    New-MgDirectoryRoleMemberByRef -DirectoryRoleId $roleDefinition.Id -OdataId "https://graph.microsoft.com/v1.0/directoryObjects/$($ServicePrincipal.Id)" -ErrorAction Stop
                    Write-EnhancedLog "Assigned Azure AD role: $roleName" -Level SUCCESS; $adRoleResults.Assigned++
                } else { Write-EnhancedLog "Azure AD role already assigned: $roleName" -Level INFO; $adRoleResults.Skipped++ }
            } catch { Write-EnhancedLog "Failed to assign Azure AD role '$roleName': $($_.Exception.Message)" -Level ERROR; $adRoleResults.Failed++ }
        }
        Write-EnhancedLog "Azure AD role assignment summary: Assigned=$($adRoleResults.Assigned), Skipped=$($adRoleResults.Skipped), Failed=$($adRoleResults.Failed)" -Level INFO

        if ($script:ConnectionStatus.Azure.Connected -and -not $SkipAzureRoles) {
            Write-EnhancedLog "Processing Azure subscription role assignments for SP Object ID: $($ServicePrincipal.Id)..." -Level PROGRESS
            $originalWarning = $WarningPreference; $WarningPreference = "SilentlyContinue"
            try {
                $subscriptions = Get-AzSubscription -ErrorAction Stop
                if (-not $subscriptions -or $subscriptions.Count -eq 0) { Write-EnhancedLog "No Azure subscriptions found in tenant." -Level WARN }
                else {
                    $enabledSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
                    Write-EnhancedLog "Found $($enabledSubscriptions.Count) enabled Azure subscriptions." -Level INFO
                    for ($i = 0; $i -lt $enabledSubscriptions.Count; $i++) {
                        $subscription = $enabledSubscriptions[$i]; $scope = "/subscriptions/$($subscription.Id)"
                        Write-Progress -Activity "Processing Subscriptions" -Status "Processing $($subscription.Name) ($($i+1)/$($enabledSubscriptions.Count))" -PercentComplete (($i / $enabledSubscriptions.Count) * 100)
                        Write-EnhancedLog "Processing subscription [$($i+1)/$($enabledSubscriptions.Count)]: $($subscription.Name)" -Level PROGRESS
                        try {
                            Set-AzContext -SubscriptionId $subscription.Id -ErrorAction Stop | Out-Null
                            $existingRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
                            foreach ($roleName in $script:AppConfig.AzureRoles) {
                                if ($existingRoles | Where-Object { $_.RoleDefinitionName -eq $roleName }) { Write-EnhancedLog "  $roleName already assigned to: $($subscription.Name)" -Level INFO; $azureRoleDetails.SkippedCount++ }
                                else {
                                    try { New-AzRoleAssignment -ObjectId $ServicePrincipal.Id -RoleDefinitionName $roleName -Scope $scope -ErrorAction Stop | Out-Null; Write-EnhancedLog "  Successfully assigned $roleName to: $($subscription.Name)" -Level SUCCESS; $azureRoleDetails.AssignedCount++ }
                                    catch { $errorMsg = $_.Exception.Message; Write-EnhancedLog "  Failed to assign $roleName to $($subscription.Name): $errorMsg" -Level ERROR; $azureRoleDetails.FailedCount++; $azureRoleDetails.FailedSubscriptions += "$($subscription.Name) ($roleName): $errorMsg" }
                                }
                            }
                            if (Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue | Where-Object { $_.RoleDefinitionName -eq "Reader" }) { $azureRoleDetails.SuccessfulSubscriptions += $subscription.Name }
                        } catch { $errorMsg = $_.Exception.Message; Write-EnhancedLog "  Failed to process subscription $($subscription.Name): $errorMsg" -Level ERROR; $azureRoleDetails.FailedCount++; $azureRoleDetails.FailedSubscriptions += "$($subscription.Name) (Access Error): $errorMsg" }
                    }
                    Write-Progress -Activity "Processing Subscriptions" -Completed
                }
                Write-EnhancedLog "Azure subscription role assignment summary: Assigned=$($azureRoleDetails.AssignedCount), Skipped=$($azureRoleDetails.SkippedCount), Successful Subscriptions=$($azureRoleDetails.SuccessfulSubscriptions.Count), Failed=$($azureRoleDetails.FailedCount)" -Level INFO
                if ($azureRoleDetails.FailedCount -gt 0) { $azureRoleDetails.FailedSubscriptions | ForEach-Object { Write-EnhancedLog "    - $_" -Level ERROR } }
            } catch { Write-EnhancedLog "Failed to process Azure subscription role assignments: $($_.Exception.Message)" -Level ERROR }
            finally { $WarningPreference = $originalWarning }
        } else {
             Write-EnhancedLog "Skipping Azure subscription role assignments due to the following reasons:" -Level WARN
            if (-not $script:ConnectionStatus.Azure.Connected) {
                Write-EnhancedLog "  - Azure connection was not successfully established." -Level WARN
                if ($script:ConnectionStatus.Azure.LastError) {
                    Write-EnhancedLog "    Last Azure connection error: $($script:ConnectionStatus.Azure.LastError)" -Level WARN
                }
            }
            if ($SkipAzureRoles) {
                Write-EnhancedLog "  - Script was run with -SkipAzureRoles parameter." -Level WARN
            }
        }
        
        $script:ConnectionStatus.Azure.RoleAssignmentDetails = $azureRoleDetails
        Stop-OperationTimer "RoleAssignment" $true
    } catch { Write-EnhancedLog "Role assignment process failed: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "RoleAssignment" $false; throw }
}
#endregion

#region Main Execution
try {
    $script:Metrics.StartTime = Get-Date
    $logDir = Split-Path $LogPath -Parent
    if ($logDir -and -not (Test-Path $logDir -PathType Container)) { New-Item -Path $logDir -ItemType Directory -Force | Out-Null }
    $headerContent = "Enhanced M&A Discovery Suite - App Registration`nVersion: $($script:ScriptInfo.Version)`nStarted: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $headerContent | Out-File -FilePath $LogPath -Encoding UTF8 -Append # Append if log exists, create if not

    Write-ProgressHeader "M&A DISCOVERY SUITE - APP REGISTRATION" "Enhanced automation"
    Write-EnhancedLog "Script Version: $($script:ScriptInfo.Version), Output Path: $EncryptedOutputPath, Force: $Force, ValidateOnly: $ValidateOnly" -Level INFO

    if (-not (Test-Prerequisites)) { throw "Prerequisites validation failed." }
    if ($ValidateOnly) { Write-EnhancedLog "Validation-only mode completed successfully." -Level SUCCESS; exit 0 }
    
    Ensure-RequiredModules
    if (-not (Connect-EnhancedGraph)) { throw "Failed to establish Microsoft Graph connection." }
    if (-not (Connect-EnhancedAzure) -and -not $SkipAzureRoles) { Write-EnhancedLog "Azure connection failed. Subscription role assignments will be skipped." -Level WARN }

    $context = Get-MgContext
    $detectedTenantId = $context.TenantId
    if (-not $TenantId) { $TenantId = $detectedTenantId; Write-EnhancedLog "Using detected Tenant ID: $TenantId" -Level INFO }
    Write-EnhancedLog "Operating in tenant: $TenantId" -Level SUCCESS
    
    $appRegistration = $null
    if ($UseExistingApp -and $ExistingClientId) { $appRegistration = Use-ExistingAppRegistration -ClientId $ExistingClientId -TenantId $TenantId }
    else { $appRegistration = New-EnhancedAppRegistration }
    
    $servicePrincipal = Grant-EnhancedAdminConsent -AppRegistration $appRegistration
    Set-EnhancedRoleAssignments -ServicePrincipal $servicePrincipal
    
    $clientSecret = $null
    if ($UseExistingApp -and $ExistingClientId) { $clientSecret = Get-InteractiveClientSecret -AppRegistration $appRegistration }
    else { $clientSecret = New-EnhancedClientSecret -AppRegistration $AppRegistration }
    
    Save-EnhancedCredentials -AppRegistration $appRegistration -ClientSecret $clientSecret -TenantId $TenantId
    
    $script:Metrics.EndTime = Get-Date
    $totalDuration = $script:Metrics.EndTime - $script:Metrics.StartTime
    Write-ProgressHeader "DEPLOYMENT SUMMARY" "Service principal ready"
    Write-EnhancedLog "Application Name: $($appRegistration.DisplayName), AppID: $($appRegistration.AppId), TenantID: $TenantId" -Level SUCCESS
    Write-EnhancedLog "Secret Expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss')), Credentials File: $EncryptedOutputPath" -Level SUCCESS
    Write-EnhancedLog "Total Duration: $([math]::Round($totalDuration.TotalSeconds, 2)) seconds" -Level SUCCESS
    Write-EnhancedLog "Azure AD App Registration completed successfully!" -Level SUCCESS
} catch {
    Write-EnhancedLog "CRITICAL ERROR: $($_.Exception.Message)" -Level CRITICAL
    if ($_.Exception.InnerException) { Write-EnhancedLog "Inner Exception: $($_.Exception.InnerException.Message)" -Level ERROR }
    if ($_.ScriptStackTrace) { Write-EnhancedLog "Stack Trace: $($_.ScriptStackTrace)" -Level DEBUG }
    Add-Content -Path $LogPath -Value "CRITICAL ERROR: $($_.Exception.Message)"
    exit 1
} finally {
    Write-EnhancedLog "Performing cleanup operations..." -Level PROGRESS
    @("Graph", "Azure") | ForEach-Object {
        try {
            if ($_ -eq "Graph" -and (Get-MgContext -ErrorAction SilentlyContinue)) { Disconnect-MgGraph -ErrorAction SilentlyContinue; Write-EnhancedLog "Disconnected from Graph" -Level SUCCESS }
            if ($_ -eq "Azure" -and (Get-AzContext -ErrorAction SilentlyContinue)) { Disconnect-AzAccount -ErrorAction SilentlyContinue | Out-Null; Write-EnhancedLog "Disconnected from Azure" -Level SUCCESS }
        } catch { Write-EnhancedLog "Error during $_ disconnect: $($_.Exception.Message)" -Level WARN }
    }
    if ($script:Metrics) {
        try { $script:Metrics | ConvertTo-Json -Depth 3 | Set-Content -Path ($LogPath -replace '\.txt$', '_metrics.json') -Encoding UTF8; Write-EnhancedLog "Metrics saved." -Level SUCCESS }
        catch { Write-EnhancedLog "Could not save metrics: $($_.Exception.Message)" -Level WARN }
    }
    Write-EnhancedLog "Cleanup completed. Full log: $LogPath" -Level SUCCESS
    Add-Content -Path $LogPath -Value "Script execution finished at $(Get-Date)."
}
#endregion
