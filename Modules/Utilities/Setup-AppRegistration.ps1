#Requires -Version 5.1
<#
.SYNOPSIS
    Creates or validates an Azure AD application registration for the M&A Discovery Suite.
.DESCRIPTION
    This foundational script creates a service principal with read-only Microsoft Graph, Azure,
    and Exchange Online permissions, grants admin consent, assigns required roles, creates a client secret, 
    and encrypts credentials for secure use by the M&A Discovery Suite.
    It now integrates with the suite's environment configuration for pathing and addresses PSScriptAnalyzer recommendations.
.PARAMETER LogPath
    Path for the detailed execution log. Defaults to the path configured in the M&A Suite environment.
.PARAMETER EncryptedOutputPath
    Path for the encrypted credentials file. Defaults to the path configured in the M&A Suite environment.
.PARAMETER Force
    Force recreation of an existing app registration if one with the same name is found.
.PARAMETER ValidateOnly
    Only validate prerequisites and connections without creating or modifying any resources.
.PARAMETER SkipAzureRoles
    Skip the assignment of roles on Azure subscriptions.
.PARAMETER SkipExchangeRole
    Skip the assignment of the View-Only Administrator role in Exchange Online.
.PARAMETER SecretValidityYears
    Client secret validity period in years (1 or 2). Defaults to 2.
.PARAMETER ExchangeConnectionUri
    Optional. A custom Exchange Online PowerShell connection URI, typically for GCC/DoD tenants.
.PARAMETER ExistingClientId
    Optional. The Client ID (App ID) of an existing app registration to use or validate.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)] # Make CompanyName mandatory for App Registration
    [string]$CompanyName,

    [Parameter(Mandatory=$false, HelpMessage="Path for detailed execution log")]
    [ValidateNotNullOrEmpty()]
    [string]$LogPath,
    
    [Parameter(Mandatory=$false, HelpMessage="Path for encrypted credentials output")]
    [ValidateNotNullOrEmpty()]
    [string]$EncryptedOutputPath,
    
    [Parameter(Mandatory=$false, HelpMessage="Force recreation of existing app registration")]
    [switch]$Force,
    
    [Parameter(Mandatory=$false, HelpMessage="Only validate prerequisites without creating resources")]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false, HelpMessage="Skip Azure subscription role assignments")]
    [switch]$SkipAzureRoles,
    
    [Parameter(Mandatory=$false, HelpMessage="Skip Exchange View-Only Administrator role assignment")]
    [switch]$SkipExchangeRole,
    
    [Parameter(Mandatory=$false, HelpMessage="Client secret validity period in years (1-2)")]
    [ValidateRange(1, 2)]
    [int]$SecretValidityYears = 2,
    
    [Parameter(Mandatory=$false, HelpMessage="Custom Exchange Online PowerShell connection URI")]
    [string]$ExchangeConnectionUri = "",
    
    [Parameter(Mandatory=$false, HelpMessage="Use device code authentication instead of interactive browser")]
    [switch]$UseDeviceCode,
    
    [Parameter(Mandatory=$false, HelpMessage="Client ID of existing app registration to use")]
    [ValidatePattern('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')]
    [string]$ExistingClientId
)

# --- Environment Initialization ---
try {
    if ($null -eq $global:MandA) {
        $envSetupScriptPath = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
        if (Test-Path $envSetupScriptPath) {
            # CRITICAL: Pass the $CompanyName received by Setup-AppRegistration.ps1
            . $envSetupScriptPath -ProvidedSuiteRoot (Split-Path $PSScriptRoot -Parent) -CompanyName $CompanyName
        } else {
            throw "Could not find 'Set-SuiteEnvironment.ps1'."
        }
    } elseif ($global:MandA.Paths.CompanyProfileRoot -notlike "*$CompanyName*") {
        # If $global:MandA exists but is for a different company, re-initialize
        Write-Warning "Global context exists but might be for a different company. Re-sourcing Set-SuiteEnvironment.ps1 for Company: $CompanyName"
        $envSetupScriptPath = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
        . $envSetupScriptPath -ProvidedSuiteRoot (Split-Path $PSScriptRoot -Parent) -CompanyName $CompanyName
    }
} catch {
    Write-Error "CRITICAL: Failed to initialize M&A Suite environment for Company '$CompanyName': $($_.Exception.Message)"
    exit 1
}

if (-not $PSBoundParameters.ContainsKey('LogPath')) {
    $LogPath = Join-Path $global:MandA.Paths.LogOutput "Setup-AppRegistration_$(Get-Date -Format 'yyyyMMddHHmmss').log"
}
if (-not $PSBoundParameters.ContainsKey('EncryptedOutputPath')) {
    if ($null -eq $global:MandA.Paths.CredentialFile) {
         throw "CRITICAL: global:MandA.Paths.CredentialFile is null after sourcing Set-SuiteEnvironment.ps1 with CompanyName '$CompanyName'. Cannot determine EncryptedOutputPath."
    }
    $EncryptedOutputPath = $global:MandA.Paths.CredentialFile
    Write-Host "Setup-AppRegistration: EncryptedOutputPath set to company-specific path: $EncryptedOutputPath" -ForegroundColor Cyan
}
# --- End Environment Initialization ---


$script:ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:SuiteRoot = Split-Path $script:ScriptDir -Parent

$ModulePaths = @(
    (Join-Path $script:SuiteRoot "Modules\Utilities\EnhancedLogging.psm1"),
    (Join-Path $script:SuiteRoot "Modules\Authentication\CredentialManagement.psm1")
)

$moduleLoadErrors = @()
foreach ($ModulePath_item in $ModulePaths) { # Renamed $ModulePath to avoid conflict
    if (Test-Path $ModulePath_item) {
        try {
            Import-Module $ModulePath_item -Force -Global
            Write-Host "Successfully imported module: $(Split-Path $ModulePath_item -Leaf)" -ForegroundColor Green
        } catch {
            $moduleLoadErrors += "Failed to import $ModulePath_item $($_.Exception.Message)"
            Write-Warning "Failed to import module: $ModulePath_item"
        }
    } else {
        $moduleLoadErrors += "Module not found: $ModulePath_item"
        Write-Warning "Required module not found: $ModulePath_item"
    }
}

if (-not (Get-Command Set-SecureCredentials -ErrorAction SilentlyContinue)) {
    Write-Error "Critical function 'Set-SecureCredentials' not available. Please ensure CredentialManagement.psm1 is properly loaded."
    if ($moduleLoadErrors.Count -gt 0) {
        Write-Error "Module loading errors:"
        $moduleLoadErrors | ForEach-Object { Write-Error "  $_" }
    }
    throw "Required modules/functions not available. Cannot continue."
}

#region Enhanced Global Configuration
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$VerbosePreference = "SilentlyContinue" 
$ProgressPreference = "Continue"

$script:ScriptInfo = @{
    Name = "Enhanced M&A Discovery Suite - App Registration"
    Version = "5.2.0" 
    Author = "Lukian Poleschtschuk & Gemini"
    RequiredPSVersion = "5.1"
    Dependencies = @(
        "Az.Accounts", 
        "Az.Resources", 
        "Microsoft.Graph.Applications", 
        "Microsoft.Graph.Authentication", 
        "Microsoft.Graph.Identity.DirectoryManagement",
        "ExchangeOnlineManagement"
    )
    MinimumModuleVersions = @{
        "Az.Accounts" = "2.0.0"
        "Az.Resources" = "6.0.0"
        "Microsoft.Graph.Applications" = "2.0.0"
        "Microsoft.Graph.Authentication" = "2.0.0"
        "Microsoft.Graph.Identity.DirectoryManagement" = "2.0.0"
        "ExchangeOnlineManagement" = "3.0.0"
    }
}

$script:AppConfig = @{
    DisplayName = "MandADiscovery"
    Description = "M&A Environment Discovery Service Principal with read-only permissions for comprehensive organizational assessment"
    RequiredGraphPermissions = @{
        "Application.Read.All" = "Read all applications and service principals" 
        # "AppRoleAssignment.Read.All" = "Read all app role assignments" # Temporarily removed due to mapping issues
        "AuditLog.Read.All" = "Read audit logs for compliance tracking"
        "Directory.Read.All" = "Read directory data including users, groups, and organizational structure"
        "Group.Read.All" = "Read all groups and group properties"
        "GroupMember.Read.All" = "Read group memberships across the organization"
        "User.Read.All" = "Read all user profiles and properties"
        "Organization.Read.All" = "Read organization information and settings"
        "RoleManagement.Read.All" = "Read role management data (Azure AD roles, eligibility, assignments)"
        # "SignIn.Read.All" = "Read all user sign-in activity logs" # Temporarily removed due to mapping issues
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
        "Mail.ReadBasic.All" = "Read basic properties of mail messages"
        "Calendars.Read" = "Read users' calendars and events"
        "Contacts.Read" = "Read users' contacts"
        "Directory.ReadWrite.All" = "Read and write directory data" 
        "Synchronization.Read.All" = "Read synchronization data and AD Connect hybrid configurations"
        "ExternalConnection.Read.All" = "Read external connections and search configurations"
        "Member.Read.Hidden" = "Read hidden group members"
        "LicenseAssignment.Read.All" = "Read license assignments and usage for users and groups"
    }
    AzureADRoles = @(
        "Cloud Application Administrator", 
        "Directory Readers" 
    )
    AzureRoles = @(
        "Reader" 
    )
    ExchangeRoles = @() # Added empty array to prevent error
}

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
    Exchange = @{ ForegroundColor = "Blue"; BackgroundColor = "White" }
}

$script:ConnectionStatus = @{
    Graph = @{ Connected = $false; LastError = $null; RetryCount = 0; Context = $null }
    Azure = @{ Connected = $false; LastError = $null; RetryCount = 0; Context = $null }
    Exchange = @{ Connected = $false; LastError = $null; RetryCount = 0; Session = $null }
}

$script:Metrics = @{
    StartTime = Get-Date
    EndTime = $null
    Operations = @{
        Prerequisites = @{ Duration = $null; Success = $false }
        ModuleManagement = @{ Duration = $null; Success = $false }
        GraphConnection = @{ Duration = $null; Success = $false }
        AzureConnection = @{ Duration = $null; Success = $false }
        ExchangeConnection = @{ Duration = $null; Success = $false }
        AppRegistration = @{ Duration = $null; Success = $false }
        PermissionGrant = @{ Duration = $null; Success = $false }
        RoleAssignment = @{ Duration = $null; Success = $false }
        ExchangeRoleAssignment = @{ Duration = $null; Success = $false }
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
    
    $colorParams = if ($script:ColorScheme.ContainsKey($Level)) { $script:ColorScheme[$Level] } else { $script:ColorScheme["Info"] }
    
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
        Write-Host "  📝 $Subtitle" -ForegroundColor Cyan
    }
    Write-Host "$separator`n" -ForegroundColor DarkCyan
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
    Write-EnhancedLog "🚀 Starting: $OperationName" -Level PROGRESS
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
    param(
        [Parameter(Mandatory=$false)]
        [switch]$SkipModules
    )
    
    Start-OperationTimer "Prerequisites"
    Write-ProgressHeader "PREREQUISITES VALIDATION" "Comprehensive environment and security checks"
    $issues = @(); $warnings = @()
    try {
        $psVersion = $PSVersionTable.PSVersion
        $requiredVersion = [version]$script:ScriptInfo.RequiredPSVersion
        if ($psVersion -lt $requiredVersion) { $issues += "PowerShell $($script:ScriptInfo.RequiredPSVersion)+ required. Current: $psVersion" }
        elseif ($psVersion.Major -eq 5) { $warnings += "PowerShell 5.1 detected. PowerShell 7+ recommended." }
        else { Write-EnhancedLog "PowerShell version: $psVersion" -Level SUCCESS }

        $currentUserIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentUserIdentity)
        $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if ($isAdmin) {
            Write-EnhancedLog "Running with administrator privileges" -Level SUCCESS
        } else {
            $warnings += "Not running as administrator. Some operations may require elevation"
        }
        
        $connectivityTests = @(
            @{ Host = "graph.microsoft.com"; Port = 443; Service = "Microsoft Graph" },
            @{ Host = "management.azure.com"; Port = 443; Service = "Azure Management" },
            @{ Host = "login.microsoftonline.com"; Port = 443; Service = "Azure AD Authentication" },
            @{ Host = "graph.windows.net"; Port = 443; Service = "Azure AD Graph (Legacy)" }
        )
        Write-EnhancedLog "Testing network connectivity to $($connectivityTests.Count) endpoints..." -Level PROGRESS
        $connectionResults = @()
        foreach ($test_item in $connectivityTests) { # Renamed $test to $test_item
            try {
                $connection = Test-NetConnection -ComputerName $test_item.Host -Port $test_item.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction Stop
                if ($connection) {
                    Write-EnhancedLog "Connectivity to $($test_item.Service): Available" -Level SUCCESS
                    $connectionResults += $true
                } else {
                    $issues += "Cannot connect to $($test_item.Service) ($($test_item.Host) port $($test_item.Port))"
                    $connectionResults += $false
                }
            } catch {
                $issues += "Network test failed for $($test_item.Service): $($_.Exception.Message)"
                $connectionResults += $false
            }
        }
        $successfulConnections = ($connectionResults | Where-Object { $_ }).Count
        Write-EnhancedLog "Network connectivity: $successfulConnections/$($connectivityTests.Count) endpoints accessible" -Level $(if ($successfulConnections -eq $connectivityTests.Count) { "SUCCESS" } else { "WARN" })

        $encryptedDir = Split-Path $EncryptedOutputPath -Parent
        if (-not (Test-Path $encryptedDir -PathType Container)) {
            try { New-Item -Path $encryptedDir -ItemType Directory -Force -ErrorAction Stop | Out-Null; Write-EnhancedLog "Created output directory: $encryptedDir" -Level SUCCESS }
            catch { $issues += "Cannot create output directory '$encryptedDir': $($_.Exception.Message)" }
        } else {
            $testFile_local = Join-Path $encryptedDir "write_test_$(Get-Random).tmp" # Renamed $testFile
            try { "test" | Out-File -FilePath $testFile_local -ErrorAction Stop; Remove-Item $testFile_local -ErrorAction SilentlyContinue; Write-EnhancedLog "Output directory accessible: $encryptedDir" -Level SUCCESS }
            catch { $issues += "Output directory lacks write permissions: $encryptedDir" }
        }
        
        Write-EnhancedLog "Checking PowerShell modules..." -Level PROGRESS
        foreach ($module_item in $script:ScriptInfo.Dependencies) { # Renamed $module to $module_item
            $installedModule = Get-Module -ListAvailable -Name $module_item -ErrorAction SilentlyContinue | 
                Sort-Object Version -Descending | Select-Object -First 1
            
            if ($installedModule) {
                Write-EnhancedLog "Module available: $module_item v$($installedModule.Version)" -Level SUCCESS
            } else {
                $issues += "Required module '$module_item' not found. Install with: Install-Module $module_item -Scope CurrentUser"
            }
        }

        if ($warnings.Count -gt 0) { Write-EnhancedLog "Prerequisites validation found $($warnings.Count) warning(s):" -Level WARN; $warnings | ForEach-Object { Write-EnhancedLog "  $_" -Level WARN } }
        if ($issues.Count -gt 0) { Write-EnhancedLog "Prerequisites validation failed with $($issues.Count) issue(s):" -Level ERROR; $issues | ForEach-Object { Write-EnhancedLog "  $_" -Level ERROR }; Stop-OperationTimer "Prerequisites" $false; return $false }
        
        Write-EnhancedLog "All prerequisites validated successfully" -Level SUCCESS
        Stop-OperationTimer "Prerequisites" $true; return $true
    } catch { Write-EnhancedLog "Prerequisites validation error: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "Prerequisites" $false; return $false }
}
#endregion

#region Enhanced Module Management

function Initialize-RequiredModules { 
    Start-OperationTimer "ModuleManagement"
    Write-ProgressHeader "MODULE MANAGEMENT" "Installing and updating required PowerShell modules"
    try {
        $OriginalWarningPreference = $WarningPreference
        $WarningPreference = 'SilentlyContinue'
        
        Update-AzConfig -DisplayBreakingChangeWarning $false -Scope Process -ErrorAction SilentlyContinue
        
        Write-EnhancedLog "Unloading potentially conflicting modules..." -Level PROGRESS
        $loadedModules = Get-Module -Name "Az.*", "Microsoft.Graph.*" -ErrorAction SilentlyContinue
        $unloadCount = 0
        foreach ($module_to_unload in $loadedModules) { # Renamed $module
            try {
                Remove-Module -Name $module_to_unload.Name -Force -ErrorAction Stop
                $unloadCount++
                Write-EnhancedLog "Unloaded $($module_to_unload.Name) v$($module_to_unload.Version)" -Level SUCCESS
            } catch {
                Write-EnhancedLog "Could not unload $($module_to_unload.Name): $($_.Exception.Message)" -Level WARN
            }
        }
        
        $totalModules = $script:ScriptInfo.Dependencies.Count; $processedModules = 0
        foreach ($moduleName_local in $script:ScriptInfo.Dependencies) { # Renamed $moduleName
            $processedModules++
            Write-Progress -Activity "Processing Modules" -Status "Processing $moduleName_local ($processedModules/$totalModules)" -PercentComplete (($processedModules / $totalModules) * 100)
            
            Write-EnhancedLog "Processing module: $moduleName_local" -Level PROGRESS
            try {
                if ($moduleName_local -like "Az.*" -and $PSVersionTable.PSVersion.Major -eq 5) {
                    $installedModule = Get-Module -ListAvailable -Name $moduleName_local -ErrorAction SilentlyContinue | 
                        Where-Object { $_.Version.Major -ge 8 } |
                        Sort-Object Version -Descending | 
                        Select-Object -First 1
                    
                    if (-not $installedModule) {
                        Write-EnhancedLog "Installing $moduleName_local (PS 5.1 compatible version)..." -Level PROGRESS
                        Install-Module -Name $moduleName_local -Scope CurrentUser -Force -AllowClobber -Repository PSGallery -SkipPublisherCheck -ErrorAction Stop
                        Write-EnhancedLog "Successfully installed $moduleName_local" -Level SUCCESS
                    } else {
                        Write-EnhancedLog "Found $moduleName_local v$($installedModule.Version)" -Level INFO
                    }
                    
                    try {
                        Import-Module -Name $moduleName_local -Force -Global -ErrorAction Stop -WarningAction SilentlyContinue
                        Write-EnhancedLog "Imported $moduleName_local successfully" -Level SUCCESS
                    } catch {
                        if ($installedModule) {
                            Import-Module -Name $moduleName_local -RequiredVersion $installedModule.Version -Force -Global -ErrorAction Stop -WarningAction SilentlyContinue
                            Write-EnhancedLog "Imported $moduleName_local v$($installedModule.Version) with specific version" -Level SUCCESS
                        } else {
                            throw
                        }
                    }
                } else {
                    $installedModule = Get-Module -ListAvailable -Name $moduleName_local -ErrorAction SilentlyContinue | 
                        Sort-Object Version -Descending | Select-Object -First 1
                    
                    if (-not $installedModule) {
                        Write-EnhancedLog "Installing $moduleName_local..." -Level PROGRESS
                        Install-Module -Name $moduleName_local -Scope CurrentUser -Force -AllowClobber -Repository PSGallery -ErrorAction Stop
                        Write-EnhancedLog "Successfully installed $moduleName_local" -Level SUCCESS
                    } else {
                        Write-EnhancedLog "Found $moduleName_local v$($installedModule.Version)" -Level INFO
                        Write-EnhancedLog "$moduleName_local is up to date (v$($installedModule.Version))" -Level SUCCESS
                    }
                    
                    $latestInstalled = Get-Module -ListAvailable -Name $moduleName_local -ErrorAction SilentlyContinue | 
                        Sort-Object Version -Descending | Select-Object -First 1
                    
                    if ($latestInstalled) {
                        Import-Module -Name $moduleName_local -RequiredVersion $latestInstalled.Version -Force -ErrorAction Stop
                        Write-EnhancedLog "Imported $moduleName_local v$($latestInstalled.Version)" -Level SUCCESS
                    } else {
                        throw "Module $moduleName_local not found after installation"
                    }
                }
                
            } catch {
                Write-EnhancedLog "Failed to process $moduleName_local`: $($_.Exception.Message)" -Level ERROR
                Stop-OperationTimer "ModuleManagement" $false
                throw "Module management failed for $moduleName_local"
            }
        }
        Write-Progress -Activity "Processing Modules" -Completed
        Write-EnhancedLog "All $totalModules modules processed successfully" -Level SUCCESS
        
        $WarningPreference = $OriginalWarningPreference
        
        Stop-OperationTimer "ModuleManagement" $true
        
    } catch {
        Write-EnhancedLog "Module management error: $($_.Exception.Message)" -Level ERROR
        $WarningPreference = $OriginalWarningPreference
        Stop-OperationTimer "ModuleManagement" $false
        throw
    }
}
#endregion

Write-EnhancedLog "Enhanced M&A Discovery Suite App Registration Script loaded successfully" -Level SUCCESS
#region Enhanced Connection Management
function Connect-EnhancedGraph {
    param(
        [Parameter(Mandatory=$false)]
        [switch]$UseDeviceAuth, # Keep this specific to function
        
        [Parameter(Mandatory=$false)]
        [string]$TenantIdParam 
    )
    
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
            if ($TenantIdParam) { 
                Connect-MgGraph -Scopes $requiredScopes -TenantId $TenantIdParam -NoWelcome -ErrorAction Stop
            } else {
                Connect-MgGraph -Scopes $requiredScopes -NoWelcome -ErrorAction Stop
            }
            
            $context = Get-MgContext -ErrorAction Stop
            if (-not $context -or -not $context.Account) { throw "Failed to establish valid Graph context" }
            
            try {
                $org = Get-MgOrganization -Top 1 -ErrorAction Stop
                if (-not $org) {
                    throw "Cannot access organization data - check permissions"
                }
                
                $testApps = Get-MgApplication -Top 1 -ErrorAction Stop 
                if (-not $testApps) { 
                    throw "Cannot access application data - check permissions"
                }
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
                $retryDelay += 2
            }
        }
    }
    Write-EnhancedLog "Failed to establish Graph connection after $maxRetries attempts" -Level ERROR
    Stop-OperationTimer "GraphConnection" $false
    return $false
}

function Connect-EnhancedAzure {
    # This function uses $TenantId from the script's main parameter scope if available
    if ($SkipAzureRoles) { Write-EnhancedLog "Skipping Azure connection as requested" -Level INFO; return $true }
    Start-OperationTimer "AzureConnection"
    Write-ProgressHeader "AZURE CONNECTION" "Establishing Azure Resource Management session"
    $maxRetries = 3; $retryDelay = 5
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            Write-EnhancedLog "Azure Connection attempt $attempt of $maxRetries..." -Level PROGRESS
            $existingAzContext = Get-AzContext -ErrorAction SilentlyContinue # Renamed to avoid conflict
            if ($existingAzContext -and $existingAzContext.Account) {
                try { Get-AzSubscription -ErrorAction Stop | Out-Null; Write-EnhancedLog "Using existing Azure connection" -Level SUCCESS; $script:ConnectionStatus.Azure.Connected = $true; $script:ConnectionStatus.Azure.Context = $existingAzContext; Stop-OperationTimer "AzureConnection" $true; return $true }
                catch { Write-EnhancedLog "Existing Azure connection invalid, reconnecting..." -Level WARN }
            }

            Write-EnhancedLog "Connecting to Azure..." -Level PROGRESS
            if ($TenantId) { 
                Connect-AzAccount -TenantId $TenantId -Scope CurrentUser -ErrorAction Stop | Out-Null
            } else {
                Connect-AzAccount -Scope CurrentUser -ErrorAction Stop | Out-Null
            }
            
            $currentAzContext = Get-AzContext -ErrorAction Stop # Renamed
            if (-not $currentAzContext -or -not $currentAzContext.Account) {
                throw "Failed to establish valid Azure context"
            }
            
            $subscriptions = Get-AzSubscription -ErrorAction Stop
            if (-not $subscriptions) {
                throw "No accessible subscriptions found"
            }
            
            $activeSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
            $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
            
            Write-EnhancedLog "Successfully connected to Azure" -Level SUCCESS
            Write-EnhancedLog "  Account: $($currentAzContext.Account.Id)" -Level INFO
            Write-EnhancedLog "  Tenant: $($currentAzContext.Tenant.Id)" -Level INFO
            Write-EnhancedLog "  Total Subscriptions: $($subscriptions.Count)" -Level INFO
            Write-EnhancedLog "  Active Subscriptions: $($activeSubscriptions.Count)" -Level INFO
            
            if ($disabledSubscriptions.Count -gt 0) {
                Write-EnhancedLog "  Disabled Subscriptions: $($disabledSubscriptions.Count)" -Level WARN
            }
            
            $activeSubscriptions | Select-Object -First 3 | ForEach-Object {
                Write-EnhancedLog "    * $($_.Name) ($($_.State))" -Level INFO
            }
            if ($activeSubscriptions.Count -gt 3) {
                Write-EnhancedLog "    ... and $($activeSubscriptions.Count - 3) more active subscriptions" -Level INFO
            }
            
            $script:ConnectionStatus.Azure.Connected = $true
            $script:ConnectionStatus.Azure.Context = $currentAzContext
            $script:ConnectionStatus.Azure.LastError = $null
            $script:ConnectionStatus.Azure.RetryCount = $attempt
            
            Stop-OperationTimer "AzureConnection" $true
            return $true
            
        } catch {
            $errorMessage = $_.Exception.Message; Write-EnhancedLog "Azure connection attempt $attempt failed: $errorMessage" -Level ERROR
            $script:ConnectionStatus.Azure.LastError = $errorMessage
            if ($attempt -lt $maxRetries) { Write-EnhancedLog "Retrying in $retryDelay seconds..." -Level PROGRESS; Start-Sleep -Seconds $retryDelay; $retryDelay += 2 }
        }
    }
    Write-EnhancedLog "Failed to establish Azure connection after $maxRetries attempts" -Level ERROR
    Stop-OperationTimer "AzureConnection" $false; return $false
}

function Connect-EnhancedExchange {
    param(
        [Parameter(Mandatory=$true)]
        [string]$AppId,
        [Parameter(Mandatory=$true)]
        [string]$TenantIdParam 
    )
    
    if ($SkipExchangeRole) {
        Write-EnhancedLog "Skipping Exchange Online connection as requested" -Level INFO
        return $true
    }
    
    Start-OperationTimer "ExchangeConnection"
    Write-ProgressHeader "EXCHANGE ONLINE CONNECTION" "Establishing Exchange Online PowerShell session"
    
    $maxRetries = 3
    $retryDelay = 5
    
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            Write-EnhancedLog "Exchange connection attempt $attempt of $maxRetries..." -Level PROGRESS
            
            $existingSession = Get-PSSession | Where-Object { 
                $_.ConfigurationName -eq "Microsoft.Exchange" -and 
                $_.State -eq "Opened" 
            }
            
            if ($existingSession) {
                try {
                    Invoke-Command -Session $existingSession -ScriptBlock { Get-OrganizationConfig } -ErrorAction Stop | Out-Null
                    Write-EnhancedLog "Using existing Exchange Online session" -Level SUCCESS
                    $script:ConnectionStatus.Exchange.Connected = $true
                    $script:ConnectionStatus.Exchange.Session = $existingSession
                    Stop-OperationTimer "ExchangeConnection" $true
                    return $true
                } catch {
                    Write-EnhancedLog "Existing Exchange session invalid, reconnecting..." -Level WARN
                    Remove-PSSession $existingSession -ErrorAction SilentlyContinue
                }
            }
            
            Write-EnhancedLog "Importing ExchangeOnlineManagement module..." -Level PROGRESS
            Import-Module ExchangeOnlineManagement -ErrorAction Stop
            
            Write-EnhancedLog "Connecting to Exchange Online..." -Level PROGRESS
            
            $connectionParams = @{
                AppId = $AppId
                Organization = "$($TenantIdParam).onmicrosoft.com" 
                Certificate = $null 
                ShowBanner = $false
                ErrorAction = 'Stop'
            }
            
            if ($ExchangeConnectionUri) {
                $connectionParams['ConnectionUri'] = $ExchangeConnectionUri
                Write-EnhancedLog "Using custom Exchange URI: $ExchangeConnectionUri" -Level INFO
            }
            
            Write-EnhancedLog "Connecting with delegated permissions for initial setup..." -Level INFO
            Connect-ExchangeOnline -ShowBanner:$false -ErrorAction Stop
            
            $orgConfig = Get-OrganizationConfig -ErrorAction Stop
            if (-not $orgConfig) {
                throw "Failed to retrieve organization configuration"
            }
            
            Write-EnhancedLog "Successfully connected to Exchange Online" -Level SUCCESS
            Write-EnhancedLog "  Organization: $($orgConfig.Name)" -Level INFO
            Write-EnhancedLog "  Exchange Version: $($orgConfig.AdminDisplayVersion)" -Level INFO
            
            $script:ConnectionStatus.Exchange.Connected = $true
            $script:ConnectionStatus.Exchange.LastError = $null
            $script:ConnectionStatus.Exchange.RetryCount = $attempt
            
            Stop-OperationTimer "ExchangeConnection" $true
            return $true
            
        } catch {
            $errorMessage = $_.Exception.Message
            Write-EnhancedLog "Exchange connection attempt $attempt failed: $errorMessage" -Level ERROR
            
            $script:ConnectionStatus.Exchange.LastError = $errorMessage
            $script:ConnectionStatus.Exchange.RetryCount = $attempt
            
            if ($attempt -lt $maxRetries) {
                Write-EnhancedLog "Retrying in $retryDelay seconds..." -Level PROGRESS
                Start-Sleep -Seconds $retryDelay
                $retryDelay += 2
            }
        }
    }
    
    Write-EnhancedLog "Failed to establish Exchange connection after $maxRetries attempts" -Level ERROR
    Stop-OperationTimer "ExchangeConnection" $false
    return $false
}
#endregion

#region Enhanced App Registration Management
function New-EnhancedAppRegistration {
    Start-OperationTimer "AppRegistration"
    Write-ProgressHeader "APPLICATION REGISTRATION" "Creating M&A Discovery service principal with comprehensive permissions"
    
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
        foreach ($permission_item in $script:AppConfig.RequiredGraphPermissions.GetEnumerator()) { # Renamed $permission
            $processedPermissions++
            Write-Progress -Activity "Mapping Permissions" -Status "Processing $($permission_item.Key) ($processedPermissions/$totalPermissions)" -PercentComplete (($processedPermissions / $totalPermissions) * 100)
            
            $permissionName = $permission_item.Key
            
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
        if ($missingPermissions.Count -gt 0) { Write-EnhancedLog "$($missingPermissions.Count) permissions could not be mapped but continuing..." -Level WARN }
        
        $requiredResourceAccess = @( @{ ResourceAppId = "00000003-0000-0000-c000-000000000000"; ResourceAccess = $resourceAccess } )
        Write-EnhancedLog "Creating application registration '$appName'..." -Level PROGRESS
        $appRegistration = New-MgApplication -DisplayName $appName -Description $script:AppConfig.Description -RequiredResourceAccess $requiredResourceAccess -ErrorAction Stop
        Write-EnhancedLog "Application registration '$($appRegistration.DisplayName)' created (AppID: $($appRegistration.AppId))" -Level SUCCESS
        Stop-OperationTimer "AppRegistration" $true; return $appRegistration
    } catch { Write-EnhancedLog "Failed to create application registration: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "AppRegistration" $false; throw }
}

function Use-ExistingAppRegistration {
    param(
        [string]$ClientIdParam, 
        [string]$TenantIdParam 
    )
    
    try {
        Write-EnhancedLog "Using existing App Registration..." -Level PROGRESS
        
        $app = Get-MgApplication -Filter "AppId eq '$ClientIdParam'" -ErrorAction Stop 
        
        if (-not $app) {
            throw "Application with Client ID '$ClientIdParam' not found" 
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
    param([Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration)
    Start-OperationTimer "PermissionGrant"
    Write-ProgressHeader "ADMIN CONSENT" "Granting application permissions and creating service principal"
    try {
        Write-EnhancedLog "Creating service principal for AppID: $($AppRegistration.AppId)..." -Level PROGRESS
        $servicePrincipal = New-MgServicePrincipal -AppId $AppRegistration.AppId -ErrorAction Stop
        Write-EnhancedLog "Service principal created (ID: $($servicePrincipal.Id))" -Level SUCCESS
        Start-Sleep -Seconds 5 

        $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
        $appSp = Get-MgServicePrincipal -Filter "AppId eq '$($AppRegistration.AppId)'" -ErrorAction Stop
        Write-EnhancedLog "Granting admin consent for application permissions..." -Level PROGRESS
        
        $grantedCount = 0
        $skippedCount = 0
        $failedCount = 0
        # Ensure RequiredResourceAccess and its first element are not null before counting
        $totalPermissions = 0
        if ($AppRegistration.RequiredResourceAccess -and $AppRegistration.RequiredResourceAccess.Count -gt 0) {
            $totalPermissions = $AppRegistration.RequiredResourceAccess[0].ResourceAccess.Count
        }

        if ($totalPermissions -gt 0) {
            $currentPermission = 0
            foreach ($access_item in $AppRegistration.RequiredResourceAccess[0].ResourceAccess) { # Renamed $access
                $currentPermission++
                
                if ($access_item.Type -eq "Role") { 
                    $permissionId = $access_item.Id 
                    
                    $permissionName = $null
                    $matchingRole = $graphSp.AppRoles | Where-Object { $_.Id -eq $permissionId }
                    if ($matchingRole) {
                        $permissionName = $matchingRole.Value
                    } else {
                        $permissionName = "Unknown Permission ID: $permissionId"
                    }
                    
                    Write-Progress -Activity "Granting Permissions" -Status "Processing $permissionName ($currentPermission/$totalPermissions)" -PercentComplete (($currentPermission / $totalPermissions) * 100)
                    
                    $existingAssignment = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -ErrorAction SilentlyContinue | 
                        Where-Object { $_.AppRoleId -eq $permissionId -and $_.ResourceId -eq $graphSp.Id }
                    
                    if ($existingAssignment) {
                        Write-EnhancedLog "Already granted: $permissionName" -Level INFO
                        $skippedCount++
                        continue
                    }
                    
                    try {
                        New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -PrincipalId $appSp.Id -ResourceId $graphSp.Id -AppRoleId $access_item.Id -ErrorAction Stop | Out-Null 
                        Write-EnhancedLog "Granted: $permissionName" -Level SUCCESS; $grantedCount++
                    } catch { Write-EnhancedLog "Failed to grant $permissionName`: $($_.Exception.Message)" -Level ERROR; $failedCount++ }
                }
            }
            Write-Progress -Activity "Granting Permissions" -Completed
        } else {
            Write-EnhancedLog "No permissions found in RequiredResourceAccess to grant." -Level WARN
        }

        Write-EnhancedLog "Permission grant summary: Granted=$grantedCount, Skipped=$skippedCount, Failed=$failedCount" -Level INFO
        if ($failedCount -gt 0) { Write-EnhancedLog "Some permissions failed to grant. Application may have limited functionality." -Level WARN }
        Stop-OperationTimer "PermissionGrant" $true; return $servicePrincipal
    } catch { Write-EnhancedLog "Permission grant process failed: $($_.Exception.Message)" -Level ERROR; Stop-OperationTimer "PermissionGrant" $false; throw }
}

function New-EnhancedClientSecret {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration
    )
    
    Start-OperationTimer "SecretCreation"
    Write-ProgressHeader "CLIENT SECRET" "Generating secure authentication credentials"
    
    $clientSecretObj = $null # Initialize to ensure scope
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
        
        $clientSecretObj = Add-MgApplicationPassword @secretParams -ErrorAction Stop
        
        Write-EnhancedLog "Client secret created successfully" -Level SUCCESS
        Write-EnhancedLog "  Secret ID: $($clientSecretObj.KeyId)" -Level INFO
        Write-EnhancedLog "  Expires: $($clientSecretObj.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" -Level INFO
        
        Write-Host "`n" -NoNewline
        Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "                              CLIENT SECRET VALUE                                " -ForegroundColor White -BackgroundColor DarkGreen
        Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "`nCOPY THIS SECRET NOW - IT CANNOT BE RETRIEVED LATER:" -ForegroundColor Yellow
        Write-Host "`n$($clientSecretObj.SecretText)`n" -ForegroundColor White -BackgroundColor DarkBlue
        Write-Host "════════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "`nPress Enter after you have copied the secret..." -ForegroundColor Yellow
        Read-Host | Out-Null # Ensure Read-Host output doesn't affect return
        
        $daysUntilExpiry = ($clientSecretObj.EndDateTime - (Get-Date)).Days
        Write-EnhancedLog "SECRET SECURITY NOTICE:" -Level CRITICAL
        Write-EnhancedLog "  * Secret value has been displayed and will be encrypted" -Level IMPORTANT
        Write-EnhancedLog "  * Secret cannot be retrieved after this session" -Level IMPORTANT
        Write-EnhancedLog "  * Secret expires in $daysUntilExpiry days" -Level IMPORTANT
        Write-EnhancedLog "  * Set calendar reminder for renewal before expiry" -Level IMPORTANT
        
        Stop-OperationTimer "SecretCreation" $true
        return $clientSecretObj # Explicitly return the secret object
        
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
        
        Write-Host "`nPlease provide the client secret for this application:" -ForegroundColor Yellow
        $clientSecretSecure = Read-Host "Client Secret" -AsSecureString
        $clientSecretText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecretSecure)
        )
        
        if ([string]::IsNullOrWhiteSpace($clientSecretText)) {
            throw "Client secret cannot be empty"
        }
        
        $mockSecret = [PSCustomObject]@{
            SecretText = $clientSecretText
            KeyId = "user-provided"
            EndDateTime = (Get-Date).AddYears(1) 
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
        [string]$TenantIdParam
    )
    
    Start-OperationTimer "CredentialStorage"
    Write-ProgressHeader "CREDENTIAL STORAGE" "Encrypting and saving authentication data"
    
    try {
        Write-EnhancedLog "Preparing to save credentials..." -Level PROGRESS
        Write-EnhancedLog "  Target Path: $EncryptedOutputPath" -Level INFO
        
        # Ensure the CredentialManagement module is loaded
        $credMgmtPath = Join-Path $script:SuiteRoot "Modules\Authentication\CredentialManagement.psm1"
        if (-not (Get-Module -Name "CredentialManagement")) {
            Import-Module $credMgmtPath -Force -Global
        }
        
        # Prepare the configuration for the credential management module
        $configParam = @{ 
            authentication = @{
                credentialStorePath = $EncryptedOutputPath
            }
        }
        
        # Calculate days until expiry
        $daysUntilExpiry = if ($ClientSecret.EndDateTime) {
            ($ClientSecret.EndDateTime - (Get-Date)).Days
        } else {
            365 # Default to 1 year if no expiry date
        }
        
        Write-EnhancedLog "Using standardized credential management system..." -Level PROGRESS
        $saveResult = Set-SecureCredentials `
            -ClientId $AppRegistration.AppId `
            -ClientSecret $ClientSecret.SecretText `
            -TenantId $TenantIdParam `
            -Configuration $configParam `
            -ExpiryDate $ClientSecret.EndDateTime
        
        if ($saveResult) {
            Write-EnhancedLog "Credentials saved successfully" -Level SUCCESS
            
            # Verify the file exists and has content
            if (Test-Path $EncryptedOutputPath) {
                $fileInfo = Get-Item $EncryptedOutputPath
                Write-EnhancedLog "Credential file details:" -Level SUCCESS
                Write-EnhancedLog "  Location: $($fileInfo.FullName)" -Level INFO
                Write-EnhancedLog "  Size: $($fileInfo.Length) bytes" -Level INFO
                Write-EnhancedLog "  Days until expiry: $daysUntilExpiry" -Level INFO
                
                # Test reading it back immediately
                Write-EnhancedLog "Verifying credential file readability..." -Level PROGRESS
                try {
                    $testRead = Get-SecureCredentials -Configuration $configParam
                    if ($testRead.Success -and $testRead.ClientId -eq $AppRegistration.AppId) {
                        Write-EnhancedLog "Credential file verification successful - file is readable" -Level SUCCESS
                    } else {
                        Write-EnhancedLog "WARNING: Credential file saved but verification failed" -Level WARN
                    }
                } catch {
                    Write-EnhancedLog "WARNING: Could not verify credential file: $($_.Exception.Message)" -Level WARN
                }
            } else {
                throw "Credential file was not created at expected location"
            }
        } else {
            throw "Set-SecureCredentials returned false"
        }
        
        Stop-OperationTimer "CredentialStorage" $true
        return $true
        
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
    $azureRoleDetails = @{ AssignedCount = 0; SkippedCount = 0; FailedCount = 0; FailedSubscriptions = @(); SuccessfulSubscriptions = @() }
    $enabledSubscriptions = @() # Initialize $enabledSubscriptions

    try {
        Write-EnhancedLog "Processing Azure AD role assignments for SP ID: $($ServicePrincipal.Id)..." -Level PROGRESS
        $adRoleResults = @{ Assigned = 0; Skipped = 0; Failed = 0 }
        foreach ($roleName_item in $script:AppConfig.AzureADRoles) { # Renamed $roleName
            try {
                Write-EnhancedLog "Assigning Azure AD role: $roleName_item" -Level PROGRESS
                $roleDefinition = Get-MgDirectoryRole -Filter "DisplayName eq '$roleName_item'" -ErrorAction SilentlyContinue
                if (-not $roleDefinition) {
                    $roleTemplate = Get-MgDirectoryRoleTemplate -Filter "DisplayName eq '$roleName_item'" -ErrorAction Stop
                    if ($roleTemplate) { $roleDefinition = New-MgDirectoryRole -RoleTemplateId $roleTemplate.Id -ErrorAction Stop; Write-EnhancedLog "Activated role template: $roleName_item" -Level SUCCESS }
                    else { throw "Role template '$roleName_item' not found" }
                }
                if (-not (Get-MgDirectoryRoleMember -DirectoryRoleId $roleDefinition.Id -ErrorAction SilentlyContinue | Where-Object { $_.Id -eq $ServicePrincipal.Id })) {
                    New-MgDirectoryRoleMemberByRef -DirectoryRoleId $roleDefinition.Id -OdataId "https://graph.microsoft.com/v1.0/directoryObjects/$($ServicePrincipal.Id)" -ErrorAction Stop
                    Write-EnhancedLog "Assigned Azure AD role: $roleName_item" -Level SUCCESS; $adRoleResults.Assigned++
                } else { Write-EnhancedLog "Azure AD role already assigned: $roleName_item" -Level INFO; $adRoleResults.Skipped++ }
            } catch { Write-EnhancedLog "Failed to assign Azure AD role '$roleName_item': $($_.Exception.Message)" -Level ERROR; $adRoleResults.Failed++ }
        }
        Write-EnhancedLog "Azure AD role assignment summary: Assigned=$($adRoleResults.Assigned), Skipped=$($adRoleResults.Skipped), Failed=$($adRoleResults.Failed)" -Level INFO

        if ($script:ConnectionStatus.Azure.Connected -and -not $SkipAzureRoles) {
            Write-EnhancedLog "Processing Azure subscription role assignments for SP Object ID: $($ServicePrincipal.Id)..." -Level PROGRESS
            $originalWarning = $WarningPreference; $WarningPreference = "SilentlyContinue"
            try {
                $subscriptions = Get-AzSubscription -ErrorAction Stop
                if (-not $subscriptions -or $subscriptions.Count -eq 0) { 
                    Write-EnhancedLog "No Azure subscriptions found in tenant." -Level WARN 
                    # $enabledSubscriptions remains empty
                } else {
                    $enabledSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
                    $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
                    
                    Write-EnhancedLog "Found $($subscriptions.Count) subscriptions in tenant:" -Level SUCCESS
                    Write-EnhancedLog "  Enabled: $($enabledSubscriptions.Count)" -Level SUCCESS
                    if ($disabledSubscriptions.Count -gt 0) {
                        Write-EnhancedLog "  Disabled: $($disabledSubscriptions.Count)" -Level WARN
                    }
                    
                    for ($i = 0; $i -lt $enabledSubscriptions.Count; $i++) {
                        $subscription_item = $enabledSubscriptions[$i] # Renamed $subscription
                        $subscriptionName = $subscription_item.Name
                        $subscriptionId = $subscription_item.Id
                        $scope = "/subscriptions/$subscriptionId"
                        
                        Write-Progress -Activity "Processing Subscriptions" -Status "Processing $subscriptionName ($($i+1)/$($enabledSubscriptions.Count))" -PercentComplete (($i / $enabledSubscriptions.Count) * 100)
                        Write-EnhancedLog "Processing subscription [$($i+1)/$($enabledSubscriptions.Count)]: $subscriptionName" -Level PROGRESS
                        
                        try {
                            $contextResult = Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop 
                            if ($contextResult.Subscription.Id -ne $subscriptionId) { 
                                throw "Context switch verification failed for subscription $subscriptionName"
                            }
                            
                            $existingRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
                            foreach ($roleName_sub in $script:AppConfig.AzureRoles) { # Renamed $roleName
                                $hasRole = $existingRoles | Where-Object { $_.RoleDefinitionName -eq $roleName_sub }
                                
                                if ($hasRole) {
                                    Write-EnhancedLog "  $roleName_sub already assigned to: $subscriptionName" -Level INFO
                                    $azureRoleDetails.SkippedCount++
                                } else {
                                    try {
                                        $roleAssignmentParams = @{
                                            ObjectId = $ServicePrincipal.Id
                                            RoleDefinitionName = $roleName_sub
                                            Scope = $scope
                                            ErrorAction = 'Stop'
                                        }
                                        
                                        $roleAssignment = New-AzRoleAssignment @roleAssignmentParams
                                        
                                        if ($roleAssignment) {
                                            Write-EnhancedLog "  Successfully assigned $roleName_sub to: $subscriptionName" -Level SUCCESS
                                            $azureRoleDetails.AssignedCount++
                                        } else {
                                            throw "Role assignment returned null"
                                        }
                                        
                                    } catch {
                                        $errorMsg = $_.Exception.Message
                                        Write-EnhancedLog "  Failed to assign $roleName_sub to $subscriptionName : $errorMsg" -Level ERROR
                                        $azureRoleDetails.FailedCount++
                                        $azureRoleDetails.FailedSubscriptions += "$subscriptionName ($roleName_sub): $errorMsg"
                                    }
                                }
                            }
                            
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
                }
                
                Write-EnhancedLog "Azure subscription role assignment summary:" -Level INFO
                Write-EnhancedLog "  Total Enabled Subscriptions: $($enabledSubscriptions.Count)" -Level INFO # Now $enabledSubscriptions is defined
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
            } finally {
                $WarningPreference = $originalWarning
            }
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

function Set-ExchangeRoleAssignment {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ServicePrincipalId,
        [Parameter(Mandatory=$true)]
        [string]$AppId
    )
    
    if ($SkipExchangeRole) {
        Write-EnhancedLog "Skipping Exchange role assignment as requested" -Level INFO
        return $true
    }
    
    Start-OperationTimer "ExchangeRoleAssignment"
    Write-ProgressHeader "EXCHANGE ROLE ASSIGNMENT" "Assigning Exchange View-Only Administrator role"
    
    try {
        if (-not $script:ConnectionStatus.Exchange.Connected) {
            Write-EnhancedLog "Exchange Online connection not established, skipping role assignment" -Level WARN
            Stop-OperationTimer "ExchangeRoleAssignment" $false
            return $false
        }
        
        Write-EnhancedLog "Processing Exchange Online role assignments..." -Level PROGRESS
        
        $exchangeRoleResults = @{
            Assigned = 0
            Skipped = 0
            Failed = 0
        }
        
        # This loop will now not error if ExchangeRoles is an empty array
        foreach ($roleName_exch in $script:AppConfig.ExchangeRoles) { # Renamed $roleName
            try {
                Write-EnhancedLog "Assigning Exchange role: $roleName_exch" -Level PROGRESS
                
                $role = Get-RoleGroup -Identity $roleName_exch -ErrorAction SilentlyContinue
                if (-not $role) {
                    Write-EnhancedLog "Exchange role '$roleName_exch' not found" -Level ERROR
                    $exchangeRoleResults.Failed++
                    continue
                }
                
                $currentMembers = Get-RoleGroupMember -Identity $roleName_exch -ErrorAction SilentlyContinue
                $isAssigned = $currentMembers | Where-Object { $_.Identity -eq $AppId -or $_.Identity -eq $ServicePrincipalId }
                
                if ($isAssigned) {
                    Write-EnhancedLog "Exchange role already assigned: $roleName_exch" -Level INFO
                    $exchangeRoleResults.Skipped++
                } else {
                    Add-RoleGroupMember -Identity $roleName_exch -Member $AppId -ErrorAction Stop
                    Write-EnhancedLog "Successfully assigned Exchange role: $roleName_exch" -Level SUCCESS
                    $exchangeRoleResults.Assigned++
                    
                    Start-Sleep -Seconds 2
                    $verifyMembers = Get-RoleGroupMember -Identity $roleName_exch -ErrorAction SilentlyContinue
                    $verified = $verifyMembers | Where-Object { $_.Identity -eq $AppId -or $_.Identity -eq $ServicePrincipalId }
                    
                    if ($verified) {
                        Write-EnhancedLog "Verified Exchange role assignment: $roleName_exch" -Level SUCCESS
                    } else {
                        Write-EnhancedLog "Could not verify Exchange role assignment: $roleName_exch" -Level WARN
                    }
                }
                
            } catch {
                Write-EnhancedLog "Failed to assign Exchange role '$roleName_exch': $($_.Exception.Message)" -Level ERROR
                $exchangeRoleResults.Failed++
            }
        }
        
        Write-EnhancedLog "Exchange role assignment summary:" -Level INFO
        Write-EnhancedLog "  Assigned: $($exchangeRoleResults.Assigned)" -Level SUCCESS
        Write-EnhancedLog "  Skipped (already assigned): $($exchangeRoleResults.Skipped)" -Level INFO
        Write-EnhancedLog "  Failed: $($exchangeRoleResults.Failed)" -Level $(if ($exchangeRoleResults.Failed -gt 0) { "ERROR" } else { "INFO" })
        
        $script:ConnectionStatus.Exchange.RoleAssignmentSuccess = ($exchangeRoleResults.Assigned -gt 0) -or ($exchangeRoleResults.Skipped -gt 0)
        $script:ConnectionStatus.Exchange.RoleAssignmentDetails = $exchangeRoleResults
        
        Stop-OperationTimer "ExchangeRoleAssignment" $true
        return $script:ConnectionStatus.Exchange.RoleAssignmentSuccess
        
    } catch {
        Write-EnhancedLog "Exchange role assignment process failed: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "ExchangeRoleAssignment" $false
        return $false
    }
}
#endregion

#region Main Execution
try {
    $script:Metrics.StartTime = Get-Date
    $logDir = Split-Path $LogPath -Parent
    if ($logDir -and -not (Test-Path $logDir -PathType Container)) {
        New-Item -Path $logDir -ItemType Directory -Force | Out-Null
    }
    
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
    # Write-EnhancedLog "  Use Existing App: $UseExistingApp" 
    if ($ExistingClientId) {
        Write-EnhancedLog "  Existing Client ID: $ExistingClientId" -Level INFO
    }
    
    if (-not (Test-Prerequisites)) {
        throw "Prerequisites validation failed. Please resolve issues and retry."
    }
    
    if ($ValidateOnly) {
        Write-EnhancedLog "Validation-only mode completed successfully" -Level SUCCESS
        exit 0
    }
    
    Initialize-RequiredModules 
    
    $GlobalTenantId = $null # Use a specific variable for tenant ID in this script
    if (-not (Connect-EnhancedGraph -UseDeviceAuth:$UseDeviceCode -TenantIdParam:$GlobalTenantId)) { # Pass $GlobalTenantId, it will be updated by Get-MgContext if null
        throw "Failed to establish Microsoft Graph connection"
    }
    
    $mgContext = Get-MgContext # Get context after successful connection
    $GlobalTenantId = $mgContext.TenantId 
    Write-EnhancedLog "Operating in Tenant ID: $GlobalTenantId" -Level INFO

    if (-not (Connect-EnhancedAzure)) { # Connect-EnhancedAzure will implicitly use $GlobalTenantId if $TenantId param in its scope isn't set
        if (-not $SkipAzureRoles) {
            Write-EnhancedLog "Azure connection failed. Subscription role assignments will be skipped." -Level WARN
        }
    }
    
    $tenantInfo = Get-MgOrganization | Select-Object -First 1
    Write-EnhancedLog "  Organization: $($tenantInfo.DisplayName)" -Level INFO
    Write-EnhancedLog "  Verified Domains: $($tenantInfo.VerifiedDomains.Count)" -Level INFO
    if ($tenantInfo.CreatedDateTime) {
        Write-EnhancedLog "  Tenant Created: $($tenantInfo.CreatedDateTime.ToString('yyyy-MM-dd'))" -Level INFO
    }
    
    $appRegistration = $null
    
    if ($ExistingClientId) { 
        $appRegistration = Use-ExistingAppRegistration -ClientIdParam $ExistingClientId -TenantIdParam $GlobalTenantId
    } else {
        $appRegistration = New-EnhancedAppRegistration
    }
    
    $servicePrincipal = Grant-EnhancedAdminConsent -AppRegistration $appRegistration
    Set-EnhancedRoleAssignments -ServicePrincipal $servicePrincipal
    
    if (-not $SkipExchangeRole) {
        if (Connect-EnhancedExchange -AppId $appRegistration.AppId -TenantIdParam $GlobalTenantId) { 
            Set-ExchangeRoleAssignment -ServicePrincipalId $servicePrincipal.Id -AppId $appRegistration.AppId
        } else {
            Write-EnhancedLog "Exchange Online connection failed. Exchange role assignment skipped." -Level WARN
        }
    }

    $clientSecretObj = $null # Renamed to avoid confusion with $ClientSecret parameter in Save-EnhancedCredentials
    
    if ($ExistingClientId) { 
        $clientSecretObj = Get-InteractiveClientSecret -AppRegistration $appRegistration
    } else {
        $clientSecretObj = New-EnhancedClientSecret -AppRegistration $appRegistration
    }
    
    Save-EnhancedCredentials -AppRegistration $appRegistration -ClientSecret $clientSecretObj -TenantIdParam $GlobalTenantId 
    
    $script:Metrics.EndTime = Get-Date
    $totalDuration = $script:Metrics.EndTime - $script:Metrics.StartTime
    $successfulOperations = ($script:Metrics.Operations.Values | Where-Object { $_.Success }).Count
    $totalOperations = $script:Metrics.Operations.Count
    
    Write-ProgressHeader "DEPLOYMENT SUMMARY" "M&A Discovery service principal ready for operations"
    
    Write-EnhancedLog "APPLICATION DETAILS:" -Level HEADER
    Write-EnhancedLog "  Application Name: $($appRegistration.DisplayName)" -Level SUCCESS # Use $appRegistration.DisplayName
    Write-EnhancedLog "  Application (Client) ID: $($appRegistration.AppId)" -Level SUCCESS
    Write-EnhancedLog "  Directory (Tenant) ID: $GlobalTenantId" -Level SUCCESS
    Write-EnhancedLog "  Object ID: $($appRegistration.Id)" -Level SUCCESS
    Write-EnhancedLog "  Service Principal ID: $($servicePrincipal.Id)" -Level SUCCESS
    
    Write-EnhancedLog "SECURITY INFORMATION:" -Level HEADER
    Write-EnhancedLog "  Secret Expires: $($clientSecretObj.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" -Level SUCCESS
    Write-EnhancedLog "  Days Until Expiry: $(($clientSecretObj.EndDateTime - (Get-Date)).Days)" -Level SUCCESS
    Write-EnhancedLog "  Credentials File: $EncryptedOutputPath" -Level SUCCESS
    Write-EnhancedLog "  Encryption: Windows DPAPI (User: $env:USERNAME)" -Level SUCCESS
    Write-EnhancedLog "  Permissions Granted: $($script:AppConfig.RequiredGraphPermissions.Count)" -Level SUCCESS
    
    Write-EnhancedLog "PERFORMANCE METRICS:" -Level HEADER
    Write-EnhancedLog "  Total Duration: $([math]::Round($totalDuration.TotalSeconds, 2)) seconds" -Level SUCCESS
    Write-EnhancedLog "  Successful Operations: $successfulOperations of $totalOperations" -Level SUCCESS
    Write-EnhancedLog "  Connection Retries: Graph($($script:ConnectionStatus.Graph.RetryCount)), Azure($($script:ConnectionStatus.Azure.RetryCount))" -Level SUCCESS
    
    if ($script:ConnectionStatus.Azure.Connected -and $script:ConnectionStatus.Azure.RoleAssignmentDetails) {
        if (($script:ConnectionStatus.Azure.RoleAssignmentDetails.AssignedCount + $script:ConnectionStatus.Azure.RoleAssignmentDetails.SkippedCount) -gt 0) {
             Write-EnhancedLog "Azure subscription roles assigned/verified successfully" -Level SUCCESS
        } else {
            Write-EnhancedLog "Azure subscription role assignment encountered issues or none were applicable." -Level WARN
        }
        $roleDetails = $script:ConnectionStatus.Azure.RoleAssignmentDetails
        Write-EnhancedLog "  Assignments: $($roleDetails.AssignedCount), Skipped: $($roleDetails.SkippedCount), Failed: $($roleDetails.FailedCount)" -Level INFO
        Write-EnhancedLog "  Successful Subscriptions: $($roleDetails.SuccessfulSubscriptions.Count)" -Level INFO
    } else {
        Write-EnhancedLog "Azure subscription role assignment was skipped or connection failed." -Level WARN
    }
    
    Write-EnhancedLog "NEXT STEPS:" -Level HEADER
    Write-EnhancedLog "  1. Admin consent URL: https://login.microsoftonline.com/$GlobalTenantId/adminconsent?client_id=$($appRegistration.AppId)" -Level IMPORTANT
    Write-EnhancedLog "  2. Update M&A Discovery configuration to use: $EncryptedOutputPath" -Level IMPORTANT
    Write-EnhancedLog "  3. Test with: .\Core\MandA-Orchestrator.ps1 -ValidateOnly (Run from Suite Root)" -Level IMPORTANT
    Write-EnhancedLog "  4. Run discovery: .\Core\MandA-Orchestrator.ps1 -Mode Full (Run from Suite Root)" -Level IMPORTANT
    
    Write-EnhancedLog "IMPORTANT SECURITY REMINDERS:" -Level CRITICAL -NoTimestamp
    Write-EnhancedLog "  * Client secret expires: $($clientSecretObj.EndDateTime.ToString('yyyy-MM-dd'))" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Set calendar reminder for credential renewal" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Credentials are user-encrypted (current user only)" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Backup credentials file is stored securely" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  * Review and audit permissions regularly" -Level IMPORTANT -NoTimestamp
    
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
    
    @("Graph", "Azure") | ForEach-Object {
        $service_item = $_ # Renamed $service
        try {
            switch ($service_item) {
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
            Write-EnhancedLog "Error during $service_item disconnect: $($_.Exception.Message)" -Level WARN
        }
    }
    if ($script:Metrics) {
        try { 
            $metricsFile = $LogPath -replace '\.log$', '_metrics.json' 
            $script:Metrics | ConvertTo-Json -Depth 3 | Set-Content -Path $metricsFile -Encoding UTF8; Write-EnhancedLog "Metrics saved to $metricsFile" -Level SUCCESS 
        }
        catch { Write-EnhancedLog "Could not save metrics: $($_.Exception.Message)" -Level WARN }
    }
    Write-EnhancedLog "Cleanup completed. Full log: $LogPath" -Level SUCCESS
    Add-Content -Path $LogPath -Value "Script execution finished at $(Get-Date)."
}
#endregion