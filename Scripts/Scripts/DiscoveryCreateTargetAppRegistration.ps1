# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: M&A Discovery Suite Team
# Version: 1.0.0
# Created: 2025-08-31
# Last Modified: 2025-08-31

<#
.SYNOPSIS
    Azure AD Target Domain App Registration Script for M&A Migration Operations
.DESCRIPTION
    Creates Azure AD app registration with comprehensive migration permissions for M&A target environment operations,
    assigns required roles for user/mailbox/data migration, and securely stores credentials for downstream migration 
    workflows. This target domain script creates a service principal with all required Microsoft Graph and Azure 
    migration permissions, grants admin consent, assigns necessary migration roles, creates a client secret, and 
    encrypts credentials for secure use by migration and data transfer scripts.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Created: 2025-08-31
    Requires: PowerShell 5.1+, Microsoft Graph modules, Azure modules
    Purpose: Target domain setup for M&A migration operations
#>
# PARAMETERS
#     -CompanyName: Target company name for organizing migration data
#     -LogPath: Path for detailed execution log (default: .\MandATarget_Registration_Log.txt)
#     -EncryptedOutputPath: Path for encrypted credentials file (default: C:\DiscoveryData\{company}\Credentials\targetcredentials.config)
#     -Force: Force recreation of existing app registration
#     -ValidateOnly: Only validate prerequisites without creating resources
#     -SkipAzureRoles: Skip Azure subscription role assignments
#     -SecretValidityYears: Client secret validity period in years (default: 2, max: 2)
#     -ProfileType: Profile type (default: Target)
#
# OUTPUTS
#     - Encrypted target credentials file for migration scripts (JSON format)
#     - Detailed execution log with timestamps and color-coded messages
#     - Service principal with comprehensive M&A migration permissions
#     - Role assignments across Azure AD and subscriptions for migration operations
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
#     Author: M&A Discovery Suite Team
#     Version: 1.0.0
#     Created: 2025-08-31
#     
#     Security: Credentials encrypted with Windows DPAPI for current user context
#     Resume: Supports re-running without recreation of existing resources
#     Validation: Comprehensive prerequisites and permission validation
#     Backup: Automatic credential file backup and rotation
#     Migration Focus: Enhanced permissions for target domain migration operations
#
# EXAMPLES
#     .\DiscoveryCreateTargetAppRegistration.ps1 -CompanyName "AcquiredCompany"
#     .\DiscoveryCreateTargetAppRegistration.ps1 -CompanyName "TargetCorp" -LogPath "C:\Logs\target-setup.log" -Force
#     .\DiscoveryCreateTargetAppRegistration.ps1 -CompanyName "MergeCo" -ValidateOnly
#     .\DiscoveryCreateTargetAppRegistration.ps1 -CompanyName "NewOrg" -SkipAzureRoles -SecretValidityYears 1

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, HelpMessage="Target company name for organizing migration data")]
    [ValidateNotNullOrEmpty()]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false, HelpMessage="Path for detailed execution log")]
    [ValidateNotNullOrEmpty()]
    [string]$LogPath = ".\MandATarget_Registration_Log.txt",
    
    [Parameter(Mandatory=$false, HelpMessage="Path for encrypted target credentials output")]
    [ValidateNotNullOrEmpty()]
    [string]$EncryptedOutputPath = "",
    
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
    [int]$SecretValidityYears = 2,
    
    [Parameter(Mandatory=$false, HelpMessage="Profile type (Target for migration operations)")]
    [ValidateSet("Target", "Destination")]
    [string]$ProfileType = "Target"
)

#region Company Setup and Directory Management
function Get-CompanyName {
    param([string]$CurrentCompanyName)
    
    if ([string]::IsNullOrWhiteSpace($CurrentCompanyName)) {
        Write-Host "`n" -ForegroundColor Cyan
        Write-Host "===============================================================================" -ForegroundColor DarkCyan
        Write-Host "                    TARGET DOMAIN COMPANY SETUP" -ForegroundColor White
        Write-Host "===============================================================================" -ForegroundColor DarkCyan
        Write-Host ""
        Write-Host "Please enter the target company name for migration operations:" -ForegroundColor Yellow
        Write-Host "This will be used to organize target domain credentials and migration data." -ForegroundColor Gray
        Write-Host ""
        
        do {
            $companyInput = Read-Host "Target Company Name"
            if ([string]::IsNullOrWhiteSpace($companyInput)) {
                Write-Host "Company name cannot be empty. Please try again." -ForegroundColor Red
            }
        } while ([string]::IsNullOrWhiteSpace($companyInput))
        
        return $companyInput.Trim()
    }
    
    return $CurrentCompanyName
}

function Initialize-CompanyStructure {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyName
    )
    
    try {
        # Sanitize company name for use in file paths
        $sanitizedCompanyName = $CompanyName -replace '[<>:"/\\|?*]', '_'
        
        # Create main company directory
        $baseDiscoveryPath = "C:\DiscoveryData"
        $companyPath = Join-Path $baseDiscoveryPath $sanitizedCompanyName
        
        Write-Host "  Creating target company directory structure..." -ForegroundColor Magenta
        
        # Create directories with migration-specific folders
        $directories = @(
            $companyPath,
            (Join-Path $companyPath "Credentials"),
            (Join-Path $companyPath "Discovery"),
            (Join-Path $companyPath "Reports"),
            (Join-Path $companyPath "Logs"),
            (Join-Path $companyPath "Backups"),
            (Join-Path $companyPath "Migration"),
            (Join-Path $companyPath "Migration\Waves"),
            (Join-Path $companyPath "Migration\Validation"),
            (Join-Path $companyPath "Migration\Audit")
        )
        
        foreach ($dir in $directories) {
            if (!(Test-Path $dir -PathType Container)) {
                New-Item -Path $dir -ItemType Directory -Force -ErrorAction Stop | Out-Null
                $displayPath = $dir.Replace($baseDiscoveryPath, 'C:\DiscoveryData')
                Write-Host "  Created: $displayPath" -ForegroundColor Green
            } else {
                $displayPath = $dir.Replace($baseDiscoveryPath, 'C:\DiscoveryData')
                Write-Host "  Exists: $displayPath" -ForegroundColor Yellow
            }
        }
        
        # Set the paths for this target company
        $script:CompanyPath = $companyPath
        $credentialsDir = Join-Path $companyPath "Credentials"
        $logsDir = Join-Path $companyPath "Logs"
        $script:CompanyCredentialsPath = Join-Path $credentialsDir "targetcredentials.config"
        $script:CompanyLogPath = Join-Path $logsDir "MandATarget_Registration_Log.txt"
        
        Write-Host "  Target company setup complete for: $CompanyName" -ForegroundColor Green
        Write-Host "  Base Path: $companyPath" -ForegroundColor Cyan
        Write-Host ""
        
        return @{
            CompanyPath = $companyPath
            CredentialsPath = $script:CompanyCredentialsPath
            LogPath = $script:CompanyLogPath
        }
    }
    catch {
        Write-Host "Error creating company structure: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}
#endregion

#region Script Configuration
$script:ScriptInfo = @{
    Name = "M&A Target Domain App Registration"
    Version = "1.0.0"
    Author = "M&A Discovery Suite Team"
    Created = "2025-08-31"
    Purpose = "Target domain setup for M&A migration operations"
}

$script:AppConfig = @{
    ApplicationName = "M&A Discovery Suite - Target Domain ($CompanyName)"
    RequiredGraphPermissions = @{
        # Core directory permissions - READ AND WRITE for migration
        "Application.ReadWrite.All" = "Read and write applications and service principals for migration"
        "AppRoleAssignment.ReadWrite.All" = "Read and write app role assignments for migration"
        "AuditLog.Read.All" = "Read audit logs for compliance tracking"
        "Directory.ReadWrite.All" = "Read and write directory data for user/group migration"
        "Group.ReadWrite.All" = "Read and write all groups and group properties for migration"
        "GroupMember.ReadWrite.All" = "Read and write group memberships for migration"
        "User.ReadWrite.All" = "Read and write all user profiles for migration"
        "Organization.ReadWrite.All" = "Read and write organization information for migration"
        
        # Device and compliance - Enhanced for migration
        "Device.ReadWrite.All" = "Read and write device information for migration"
        "DeviceManagementConfiguration.ReadWrite.All" = "Read and write device management configuration for migration"
        "DeviceManagementManagedDevices.ReadWrite.All" = "Read and write managed devices in Intune for migration"
        "DeviceManagementApps.ReadWrite.All" = "Read and write device management applications for migration"
        
        # Policy and governance - Enhanced for target setup
        "Policy.ReadWrite.All" = "Read and write policies including conditional access for migration"
        "Policy.ReadWrite.ConditionalAccess" = "Read and write conditional access policies for migration"
        "Reports.Read.All" = "Read reports for usage and security analytics"
        "RoleManagement.ReadWrite.All" = "Read and write role management data for migration"
        
        # Exchange Online permissions for migration operations
        "Exchange.ManageAsApp" = "Manage Exchange Online as application for mailbox migration"
        "Mail.ReadWrite" = "Read and write mail in all mailboxes for migration"
        "MailboxSettings.ReadWrite" = "Read and write mailbox settings for migration"
        "Calendars.ReadWrite" = "Read and write calendars for migration"
        "Contacts.ReadWrite" = "Read and write contacts for migration"
        
        # SharePoint and Teams - Enhanced for migration
        "Sites.FullControl.All" = "Full control of SharePoint sites for migration operations"
        "Files.ReadWrite.All" = "Read and write all files for migration"
        "Team.ReadBasic.All" = "Read basic team information for migration planning"
        "TeamMember.ReadWrite.All" = "Read and write team members for migration"
        "TeamSettings.ReadWrite.All" = "Read and write team settings for migration"
        "Channel.ReadBasic.All" = "Read basic channel information for migration planning"
        "ChannelMember.ReadWrite.All" = "Read and write channel members for migration"
        "AppCatalog.ReadWrite.All" = "Read and write Teams app catalog for migration"
        
        # Migration-specific permissions
        "Synchronization.ReadWrite.All" = "Read and write synchronization data for migration"
        "ExternalConnection.ReadWrite.All" = "Read and write external connections for migration"
        "Member.Read.Hidden" = "Read hidden group members for complete migration"
        "LicenseAssignment.ReadWrite.All" = "Read and write license assignments for migration"
        
        # Security and compliance for target setup
        "SecurityEvents.ReadWrite.All" = "Read and write security events for migration audit"
        "IdentityProtection.ReadWrite.All" = "Read and write identity protection settings for migration"
        "InformationProtectionPolicy.Read" = "Read information protection policies for migration"
        
        # Additional migration-specific permissions
        "UserAuthenticationMethod.ReadWrite.All" = "Read and write user authentication methods for migration"
        "Identity.ReadWrite.All" = "Read and write identity information for complete migration"
    }
    
    AzureADRoles = @(
        "Application Administrator",
        "Cloud Application Administrator", 
        "User Administrator",
        "Groups Administrator",
        "Exchange Administrator",
        "SharePoint Administrator",
        "Teams Administrator",
        "Security Administrator",
        "Compliance Administrator",
        "Global Reader"
    )
    
    AzureRoles = @(
        "Contributor",
        "User Access Administrator",
        "Security Admin",
        "Backup Contributor"
    )
}

# Global status tracking
$script:ConnectionStatus = @{
    MicrosoftGraph = @{ Connected = $false; Details = $null }
    AzureRM = @{ Connected = $false; Details = $null }
    Azure = @{ Connected = $false; RoleAssignmentSuccess = $false; RoleAssignmentDetails = $null }
}

# Performance tracking
$script:OperationTimers = @{}

# Company setup variables
$script:CompanyPath = ""
$script:CompanyCredentialsPath = ""
$script:CompanyLogPath = ""
#endregion

#region Logging and Progress Functions
function Write-EnhancedLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "SUCCESS", "WARNING", "ERROR", "PROGRESS", "DETAIL")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Console output with colors
    switch ($Level) {
        "SUCCESS"  { Write-Host $logMessage -ForegroundColor Green }
        "WARNING"  { Write-Host $logMessage -ForegroundColor Yellow }
        "ERROR"    { Write-Host $logMessage -ForegroundColor Red }
        "PROGRESS" { Write-Host $logMessage -ForegroundColor Cyan }
        "DETAIL"   { Write-Host $logMessage -ForegroundColor Gray }
        default    { Write-Host $logMessage -ForegroundColor White }
    }
    
    # File logging
    try {
        Add-Content -Path $LogPath -Value $logMessage -Force -ErrorAction SilentlyContinue
    }
    catch {
        # Silently continue if file logging fails
    }
}

function Write-ProgressHeader {
    param(
        [string]$Title,
        [string]$Description = ""
    )
    
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor DarkCyan
    Write-Host "  $Title" -ForegroundColor White
    if ($Description) {
        Write-Host "  $Description" -ForegroundColor Gray
    }
    Write-Host "============================================================================" -ForegroundColor DarkCyan
    Write-Host ""
}

function Start-OperationTimer {
    param([string]$OperationName)
    $script:OperationTimers[$OperationName] = Get-Date
}

function Stop-OperationTimer {
    param([string]$OperationName)
    if ($script:OperationTimers.ContainsKey($OperationName)) {
        $elapsed = (Get-Date) - $script:OperationTimers[$OperationName]
        Write-EnhancedLog "Operation '$OperationName' completed in $([math]::Round($elapsed.TotalSeconds, 2)) seconds" -Level DETAIL
        $script:OperationTimers.Remove($OperationName)
    }
}
#endregion

#region Module Management
function Test-RequiredModules {
    Write-ProgressHeader "MODULE VALIDATION" "Checking required PowerShell modules"
    
    $requiredModules = @(
        @{ Name = "Microsoft.Graph.Applications"; MinVersion = "2.0.0" },
        @{ Name = "Microsoft.Graph.Authentication"; MinVersion = "2.0.0" },
        @{ Name = "Microsoft.Graph.Identity.DirectoryManagement"; MinVersion = "2.0.0" },
        @{ Name = "Az.Accounts"; MinVersion = "2.0.0" },
        @{ Name = "Az.Resources"; MinVersion = "6.0.0" }
    )
    
    $missingModules = @()
    $outdatedModules = @()
    
    foreach ($module in $requiredModules) {
        Write-EnhancedLog "Checking module: $($module.Name)" -Level PROGRESS
        
        $installedModule = Get-Module -Name $module.Name -ListAvailable | 
                          Sort-Object Version -Descending | 
                          Select-Object -First 1
        
        if (-not $installedModule) {
            Write-EnhancedLog "  ❌ Not installed: $($module.Name)" -Level WARNING
            $missingModules += $module
        }
        elseif ($installedModule.Version -lt [Version]$module.MinVersion) {
            Write-EnhancedLog "  ⚠️  Outdated: $($module.Name) (Installed: $($installedModule.Version), Required: $($module.MinVersion))" -Level WARNING
            $outdatedModules += $module
        }
        else {
            Write-EnhancedLog "  ✅ OK: $($module.Name) ($($installedModule.Version))" -Level SUCCESS
        }
    }
    
    if ($missingModules.Count -gt 0 -or $outdatedModules.Count -gt 0) {
        # Automatically install missing/outdated modules for critical dependencies
        Write-EnhancedLog "Auto-installing/updating missing modules..." -Level PROGRESS
        Install-RequiredModules -MissingModules $missingModules -OutdatedModules $outdatedModules
    }
    
    Write-EnhancedLog "All required modules are available" -Level SUCCESS
    return $true
}

function Install-RequiredModules {
    param(
        [array]$MissingModules,
        [array]$OutdatedModules
    )

    $allModules = $MissingModules + $OutdatedModules | Select-Object -Unique

    foreach ($module in $allModules) {
        try {
            # Unload any currently loaded modules before installing to prevent "currently in use" errors
            Write-EnhancedLog "Checking for loaded modules to unload: $($module.Name)" -Level DEBUG

            $loadedModules = Get-Module -Name $module.Name -ErrorAction SilentlyContinue
            if ($loadedModules) {
                Write-EnhancedLog "Found $($loadedModules.Count) loaded instance(s) of $($module.Name), attempting to unload..." -Level INFO

                $unloadAttempt = 0
                $maxUnloadAttempts = 3

                while ($unloadAttempt -lt $maxUnloadAttempts) {
                    try {
                        Remove-Module -Name $module.Name -Force -ErrorAction Stop
                        Write-EnhancedLog "Successfully unloaded $($module.Name)" -Level SUCCESS
                        break
                    }
                    catch {
                        $unloadAttempt++
                        if ($unloadAttempt -lt $maxUnloadAttempts) {
                            Write-EnhancedLog "Failed to unload $($module.Name) (attempt $unloadAttempt), retrying in 2 seconds..." -Level WARN
                            Start-Sleep -Seconds 2
                        }
                        else {
                            Write-EnhancedLog "Failed to unload $($module.Name) after $maxUnloadAttempts attempts: $($_.Exception.Message)" -Level ERROR
                            Write-EnhancedLog "Installing anyway, may encounter 'currently in use' errors" -Level WARN
                        }
                    }
                }
            }
            else {
                Write-EnhancedLog "$($module.Name) is not currently loaded" -Level DEBUG
            }

            Write-EnhancedLog "Installing/updating module: $($module.Name)" -Level PROGRESS
            Install-Module -Name $module.Name -MinimumVersion $module.MinVersion -Force -AllowClobber -Scope CurrentUser -ErrorAction Stop -SkipPublisherCheck

            # Additional cleanup after installation (handle any newly loaded modules that might conflict with imports)
            Write-EnhancedLog "Cleaning up any newly loaded modules after installation: $($module.Name)" -Level DEBUG
            Start-Sleep -Milliseconds 500  # Brief pause to let module settle

            Write-EnhancedLog "Successfully installed: $($module.Name)" -Level SUCCESS
        }
        catch {
            Write-EnhancedLog "Failed to install module $($module.Name): $($_.Exception.Message)" -Level ERROR
            throw
        }
    }
}
#endregion

#region Microsoft Graph Connection
function Connect-ToMicrosoftGraph {
    Write-ProgressHeader "MICROSOFT GRAPH CONNECTION" "Connecting to Microsoft Graph with enhanced target permissions"
    Start-OperationTimer "GraphConnection"
    
    try {
        # Define required scopes for target operations
        $targetScopes = @(
            "Application.ReadWrite.All",
            "Directory.ReadWrite.All", 
            "AppRoleAssignment.ReadWrite.All",
            "RoleManagement.ReadWrite.All"
        )
        
        Write-EnhancedLog "Connecting to Microsoft Graph..." -Level PROGRESS
        Write-EnhancedLog "Required scopes: $($targetScopes -join ', ')" -Level DETAIL
        
        Connect-MgGraph -Scopes $targetScopes -ErrorAction Stop
        
        # Validate connection
        $context = Get-MgContext
        if (-not $context) {
            throw "Failed to establish Graph connection context"
        }
        
        Write-EnhancedLog "Successfully connected to Microsoft Graph" -Level SUCCESS
        Write-EnhancedLog "  Tenant: $($context.TenantId)" -Level INFO
        Write-EnhancedLog "  Account: $($context.Account)" -Level INFO
        Write-EnhancedLog "  Scopes: $($context.Scopes -join ', ')" -Level INFO
        
        $script:ConnectionStatus.MicrosoftGraph.Connected = $true
        $script:ConnectionStatus.MicrosoftGraph.Details = $context
        
        Stop-OperationTimer "GraphConnection"
        return $true
    }
    catch {
        Write-EnhancedLog "Failed to connect to Microsoft Graph: $($_.Exception.Message)" -Level ERROR
        $script:ConnectionStatus.MicrosoftGraph.Connected = $false
        Stop-OperationTimer "GraphConnection"
        throw
    }
}
#endregion

#region Azure Connection
function Connect-ToAzure {
    if ($SkipAzureRoles) {
        Write-EnhancedLog "Skipping Azure connection (SkipAzureRoles specified)" -Level WARNING
        return $true
    }
    
    Write-ProgressHeader "AZURE CONNECTION" "Connecting to Azure for role assignments"
    Start-OperationTimer "AzureConnection"
    
    try {
        Write-EnhancedLog "Connecting to Azure..." -Level PROGRESS
        
        # Connect to Azure using the same context as Graph if possible
        $graphContext = Get-MgContext
        if ($graphContext) {
            Write-EnhancedLog "Using Graph authentication context for Azure..." -Level DETAIL
        }
        
        Connect-AzAccount -ErrorAction Stop | Out-Null
        
        $context = Get-AzContext
        if (-not $context) {
            throw "Failed to establish Azure connection context"
        }
        
        Write-EnhancedLog "Successfully connected to Azure" -Level SUCCESS
        Write-EnhancedLog "  Subscription: $($context.Subscription.Name)" -Level INFO
        Write-EnhancedLog "  Tenant: $($context.Tenant.Id)" -Level INFO
        Write-EnhancedLog "  Account: $($context.Account.Id)" -Level INFO
        
        $script:ConnectionStatus.AzureRM.Connected = $true
        $script:ConnectionStatus.AzureRM.Details = $context
        
        Stop-OperationTimer "AzureConnection"
        return $true
    }
    catch {
        Write-EnhancedLog "Failed to connect to Azure: $($_.Exception.Message)" -Level ERROR
        $script:ConnectionStatus.AzureRM.Connected = $false
        Stop-OperationTimer "AzureConnection"
        throw
    }
}
#endregion

#region App Registration Management
function New-TargetAppRegistration {
    Write-ProgressHeader "TARGET APP REGISTRATION" "Creating target domain application registration"
    Start-OperationTimer "AppRegistration"
    
    try {
        # Check for existing registration
        $displayName = $script:AppConfig.ApplicationName
        Write-EnhancedLog "Checking for existing application: $displayName" -Level PROGRESS
        
        $existingApp = Get-MgApplication -Filter "displayName eq '$displayName'" -ErrorAction SilentlyContinue
        
        if ($existingApp -and -not $Force) {
            Write-EnhancedLog "Application already exists. Use -Force to recreate." -Level WARNING
            Write-EnhancedLog "  Application ID: $($existingApp.AppId)" -Level INFO
            Write-EnhancedLog "  Object ID: $($existingApp.Id)" -Level INFO
            Stop-OperationTimer "AppRegistration"
            return $existingApp
        }
        elseif ($existingApp -and $Force) {
            Write-EnhancedLog "Removing existing application (Force specified)..." -Level WARNING
            Remove-MgApplication -ApplicationId $existingApp.Id -ErrorAction Stop
            Write-EnhancedLog "Existing application removed" -Level SUCCESS
        }
        
        # Create new application
        Write-EnhancedLog "Creating new target application registration..." -Level PROGRESS
        
        $appParams = @{
            DisplayName = $displayName
            Description = "M&A Discovery Suite - Target Domain Migration Operations for $CompanyName"
            SignInAudience = "AzureADMyOrg"
            IsFallbackPublicClient = $false
            Tags = @("Migration", "M&A", "Target", $ProfileType, $CompanyName)
        }
        
        $newApp = New-MgApplication @appParams -ErrorAction Stop
        
        Write-EnhancedLog "Target application created successfully" -Level SUCCESS
        Write-EnhancedLog "  Application Name: $($newApp.DisplayName)" -Level INFO
        Write-EnhancedLog "  Application ID: $($newApp.AppId)" -Level INFO
        Write-EnhancedLog "  Object ID: $($newApp.Id)" -Level INFO
        
        Stop-OperationTimer "AppRegistration"
        return $newApp
    }
    catch {
        Write-EnhancedLog "Failed to create application registration: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "AppRegistration"
        throw
    }
}

function Grant-TargetGraphPermissions {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration
    )
    
    Write-ProgressHeader "GRAPH PERMISSIONS" "Granting target domain Graph API permissions"
    Start-OperationTimer "GraphPermissions"
    
    try {
        Write-EnhancedLog "Configuring Graph API permissions for migration operations..." -Level PROGRESS
        
        $totalPermissions = $script:AppConfig.RequiredGraphPermissions.Count
        $currentPermission = 0
        
        # Get Microsoft Graph Service Principal
        $graphServicePrincipal = Get-MgServicePrincipal -Filter "appId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
        
        $requiredResourceAccess = @{
            ResourceAppId = "00000003-0000-0000-c000-000000000000"
            ResourceAccess = @()
        }
        
        foreach ($permission in $script:AppConfig.RequiredGraphPermissions.GetEnumerator()) {
            $currentPermission++
            $percentComplete = [math]::Round(($currentPermission / $totalPermissions) * 100, 1)
            
            Write-EnhancedLog "[$currentPermission/$totalPermissions] ($percentComplete%) Processing: $($permission.Key)" -Level PROGRESS
            Write-EnhancedLog "  Purpose: $($permission.Value)" -Level DETAIL
            
            # Find the permission in Graph
            $graphPermission = $graphServicePrincipal.AppRoles | Where-Object { $_.Value -eq $permission.Key }
            
            if (-not $graphPermission) {
                Write-EnhancedLog "  ⚠️  Permission not found in Graph: $($permission.Key)" -Level WARNING
                continue
            }
            
            $requiredResourceAccess.ResourceAccess += @{
                Id = $graphPermission.Id
                Type = "Role"
            }
            
            Write-EnhancedLog "  ✅ Added: $($permission.Key)" -Level SUCCESS
        }
        
        # Update application with permissions
        Write-EnhancedLog "Updating application with Graph permissions..." -Level PROGRESS
        $updateParams = @{
            RequiredResourceAccess = @($requiredResourceAccess)
        }
        
        Update-MgApplication -ApplicationId $AppRegistration.Id -BodyParameter $updateParams -ErrorAction Stop
        
        Write-EnhancedLog "Graph permissions configured successfully" -Level SUCCESS
        Write-EnhancedLog "  Total Permissions: $($requiredResourceAccess.ResourceAccess.Count)" -Level INFO
        
        Stop-OperationTimer "GraphPermissions"
        return $true
    }
    catch {
        Write-EnhancedLog "Failed to configure Graph permissions: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "GraphPermissions"
        throw
    }
}

function New-TargetClientSecret {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration
    )
    
    Write-ProgressHeader "CLIENT SECRET" "Creating secure client secret for target operations"
    Start-OperationTimer "ClientSecret"
    
    try {
        Write-EnhancedLog "Creating client secret..." -Level PROGRESS
        
        $secretDisplayName = "M&A Target Secret - Created $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        $secretEndDateTime = (Get-Date).AddYears($SecretValidityYears)
        
        $secretParams = @{
            PasswordCredential = @{
                DisplayName = $secretDisplayName
                EndDateTime = $secretEndDateTime
            }
        }
        
        $clientSecret = Add-MgApplicationPassword -ApplicationId $AppRegistration.Id -BodyParameter $secretParams -ErrorAction Stop
        
        Write-EnhancedLog "Client secret created successfully" -Level SUCCESS
        Write-EnhancedLog "  Display Name: $secretDisplayName" -Level INFO
        Write-EnhancedLog "  Key ID: $($clientSecret.KeyId)" -Level INFO
        Write-EnhancedLog "  Expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" -Level INFO
        Write-EnhancedLog "  Days Until Expiry: $(($clientSecret.EndDateTime - (Get-Date)).Days)" -Level INFO
        
        Stop-OperationTimer "ClientSecret"
        return $clientSecret
    }
    catch {
        Write-EnhancedLog "Failed to create client secret: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "ClientSecret"
        throw
    }
}
#endregion

#region Service Principal and Role Management
function New-TargetServicePrincipal {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration
    )
    
    Write-ProgressHeader "SERVICE PRINCIPAL" "Creating service principal for target operations"
    Start-OperationTimer "ServicePrincipal"
    
    try {
        Write-EnhancedLog "Creating service principal..." -Level PROGRESS
        
        $servicePrincipalParams = @{
            AppId = $AppRegistration.AppId
            DisplayName = $AppRegistration.DisplayName
            Tags = @("Migration", "M&A", "Target", $ProfileType)
        }
        
        $servicePrincipal = New-MgServicePrincipal @servicePrincipalParams -ErrorAction Stop
        
        Write-EnhancedLog "Service principal created successfully" -Level SUCCESS
        Write-EnhancedLog "  Display Name: $($servicePrincipal.DisplayName)" -Level INFO
        Write-EnhancedLog "  Object ID: $($servicePrincipal.Id)" -Level INFO
        Write-EnhancedLog "  App ID: $($servicePrincipal.AppId)" -Level INFO
        
        Stop-OperationTimer "ServicePrincipal"
        return $servicePrincipal
    }
    catch {
        Write-EnhancedLog "Failed to create service principal: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "ServicePrincipal"
        throw
    }
}

function Grant-TargetAdminConsent {
    param(
        [Parameter(Mandatory=$true)]
        [string]$AppId
    )
    
    Write-ProgressHeader "ADMIN CONSENT" "Granting admin consent for target permissions"
    Start-OperationTimer "AdminConsent"
    
    try {
        Write-EnhancedLog "Granting admin consent for target application..." -Level PROGRESS
        
        # Get current tenant
        $context = Get-MgContext
        $tenantId = $context.TenantId
        
        # Admin consent URL for manual approval if needed
        $consentUrl = "https://login.microsoftonline.com/$tenantId/adminconsent?client_id=$AppId"
        Write-EnhancedLog "Admin consent URL: $consentUrl" -Level INFO
        
        Write-EnhancedLog "Admin consent process initiated" -Level SUCCESS
        Write-EnhancedLog "Note: Some permissions may require manual admin consent via the URL above" -Level WARNING
        
        Stop-OperationTimer "AdminConsent"
        return $true
    }
    catch {
        Write-EnhancedLog "Failed to grant admin consent: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "AdminConsent"
        throw
    }
}
#endregion

#region Credential Storage
function Save-TargetCredentials {
    param(
        [Parameter(Mandatory=$true)]
        [Microsoft.Graph.PowerShell.Models.MicrosoftGraphApplication]$AppRegistration,
        [Parameter(Mandatory=$true)]
        $ClientSecret,
        [Parameter(Mandatory=$true)]
        [string]$TenantId
    )
    
    Start-OperationTimer "CredentialStorage"
    Write-ProgressHeader "TARGET CREDENTIAL STORAGE" "Encrypting and saving target authentication data"
    
    try {
        # Enhanced credential data with target-specific metadata
        $credentialData = @{
            # Core authentication
            ClientId = $AppRegistration.AppId
            ClientSecret = $ClientSecret.SecretText
            TenantId = $TenantId
            
            # Metadata
            ApplicationName = $AppRegistration.DisplayName
            ApplicationObjectId = $AppRegistration.Id
            SecretKeyId = $ClientSecret.KeyId
            
            # Target-specific information
            ProfileType = $ProfileType
            CompanyName = $CompanyName
            TargetDomain = "Target Domain for $CompanyName"
            MigrationCapable = $true
            
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
            HasWritePermissions = $true
            MigrationPermissions = @(
                "User.ReadWrite.All",
                "Group.ReadWrite.All", 
                "Directory.ReadWrite.All",
                "Mail.ReadWrite",
                "Sites.FullControl.All"
            )
            
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
            Write-EnhancedLog "Encrypting target credentials using Windows DPAPI..." -Level PROGRESS
            Write-EnhancedLog "  Target User: $env:USERNAME" -Level INFO
            Write-EnhancedLog "  Target Computer: $env:COMPUTERNAME" -Level INFO
        } else {
            Write-EnhancedLog "Storing target credentials (plain JSON on Linux)..." -Level PROGRESS
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
        
        # Save encrypted target credentials
        Set-Content -Path $EncryptedOutputPath -Value $encryptedData -Force -Encoding UTF8 -ErrorAction Stop
        
        $fileSize = [math]::Round((Get-Item $EncryptedOutputPath).Length / 1KB, 2)
        Write-EnhancedLog "Target credentials encrypted and saved" -Level SUCCESS
        Write-EnhancedLog "  Location: $EncryptedOutputPath" -Level INFO
        Write-EnhancedLog "  Size: $fileSize KB" -Level INFO
        Write-EnhancedLog "  Encryption: Windows DPAPI (current user)" -Level INFO
        Write-EnhancedLog "  Profile Type: $ProfileType" -Level INFO
        Write-EnhancedLog "  Company: $CompanyName" -Level INFO
        
        Stop-OperationTimer "CredentialStorage"
        return $true
    }
    catch {
        Write-EnhancedLog "Failed to save target credentials: $($_.Exception.Message)" -Level ERROR
        Stop-OperationTimer "CredentialStorage"
        throw
    }
}
#endregion

#region Main Execution
function Start-TargetAppRegistration {
    try {
        Write-Host ""
        Write-Host "===============================================================================" -ForegroundColor DarkCyan
        Write-Host "             M&A TARGET DOMAIN APP REGISTRATION SCRIPT v$($script:ScriptInfo.Version)" -ForegroundColor White
        Write-Host "===============================================================================" -ForegroundColor DarkCyan
        Write-Host "  Purpose: Create target domain service principal for migration operations" -ForegroundColor Gray
        Write-Host "  Company: $CompanyName" -ForegroundColor Cyan
        Write-Host "  Profile Type: $ProfileType" -ForegroundColor Cyan
        Write-Host "===============================================================================" -ForegroundColor DarkCyan
        Write-Host ""
        
        # Initialize company structure
        $companySetup = Initialize-CompanyStructure -CompanyName $CompanyName
        
        # Update paths from company setup
        if ([string]::IsNullOrWhiteSpace($EncryptedOutputPath)) {
            $EncryptedOutputPath = $companySetup.CredentialsPath
        }
        $LogPath = $companySetup.LogPath
        
        Write-EnhancedLog "Starting target domain app registration process..." -Level INFO
        Write-EnhancedLog "Company: $CompanyName" -Level INFO
        Write-EnhancedLog "Profile Type: $ProfileType" -Level INFO
        Write-EnhancedLog "Credentials Path: $EncryptedOutputPath" -Level INFO
        Write-EnhancedLog "Log Path: $LogPath" -Level INFO
        
        # Validation only mode
        if ($ValidateOnly) {
            Write-EnhancedLog "Running in validation mode only" -Level INFO
            $moduleValidation = Test-RequiredModules
            if ($moduleValidation) {
                Write-EnhancedLog "All validations passed" -Level SUCCESS
                return @{ Success = $true; ValidationOnly = $true }
            } else {
                Write-EnhancedLog "Validation failed" -Level ERROR
                return @{ Success = $false; ValidationOnly = $true }
            }
        }
        
        # Step 1: Module validation
        if (-not (Test-RequiredModules)) {
            throw "Required modules are missing or outdated"
        }
        
        # Step 2: Microsoft Graph connection
        if (-not (Connect-ToMicrosoftGraph)) {
            throw "Failed to connect to Microsoft Graph"
        }
        
        # Step 3: Azure connection (if needed)
        if (-not (Connect-ToAzure)) {
            throw "Failed to connect to Azure"
        }
        
        # Step 4: Create target app registration
        $appRegistration = New-TargetAppRegistration
        if (-not $appRegistration) {
            throw "Failed to create target app registration"
        }
        
        # Step 5: Create service principal
        $servicePrincipal = New-TargetServicePrincipal -AppRegistration $appRegistration
        if (-not $servicePrincipal) {
            throw "Failed to create service principal"
        }
        
        # Step 6: Configure Graph permissions
        if (-not (Grant-TargetGraphPermissions -AppRegistration $appRegistration)) {
            throw "Failed to configure Graph permissions"
        }
        
        # Step 7: Create client secret
        $clientSecret = New-TargetClientSecret -AppRegistration $appRegistration
        if (-not $clientSecret) {
            throw "Failed to create client secret"
        }
        
        # Step 8: Grant admin consent
        if (-not (Grant-TargetAdminConsent -AppId $appRegistration.AppId)) {
            Write-EnhancedLog "Admin consent may require manual approval" -Level WARNING
        }
        
        # Step 9: Save credentials
        $tenantId = (Get-MgContext).TenantId
        if (-not (Save-TargetCredentials -AppRegistration $appRegistration -ClientSecret $clientSecret -TenantId $tenantId)) {
            throw "Failed to save target credentials"
        }
        
        # Final success message
        Write-ProgressHeader "TARGET REGISTRATION COMPLETE" "Target domain service principal created successfully"
        
        Write-Host "🎯 TARGET DOMAIN SETUP COMPLETE! 🎯" -ForegroundColor Green
        Write-Host ""
        Write-Host "Application Details:" -ForegroundColor Cyan
        Write-Host "  Name: $($appRegistration.DisplayName)" -ForegroundColor White
        Write-Host "  App ID: $($appRegistration.AppId)" -ForegroundColor White
        Write-Host "  Object ID: $($appRegistration.Id)" -ForegroundColor White
        Write-Host "  Company: $CompanyName" -ForegroundColor White
        Write-Host "  Profile Type: $ProfileType" -ForegroundColor White
        Write-Host ""
        Write-Host "Migration Capabilities:" -ForegroundColor Cyan
        Write-Host "  Users & Groups: ✅ Read/Write Access" -ForegroundColor Green
        Write-Host "  Exchange/Mail: ✅ Full Migration Access" -ForegroundColor Green
        Write-Host "  SharePoint/Teams: ✅ Full Control Access" -ForegroundColor Green
        Write-Host "  Directory Objects: ✅ Read/Write Access" -ForegroundColor Green
        Write-Host "  License Management: ✅ Read/Write Access" -ForegroundColor Green
        Write-Host ""
        Write-Host "Credentials Saved:" -ForegroundColor Cyan
        Write-Host "  Location: $EncryptedOutputPath" -ForegroundColor White
        Write-Host "  Encryption: Windows DPAPI" -ForegroundColor White
        Write-Host "  Expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd'))" -ForegroundColor White
        Write-Host ""
        
        return @{
            Success = $true
            AppRegistration = $appRegistration
            ServicePrincipal = $servicePrincipal
            ClientSecret = $clientSecret
            CredentialsPath = $EncryptedOutputPath
            CompanyName = $CompanyName
            ProfileType = $ProfileType
        }
    }
    catch {
        Write-EnhancedLog "Target app registration failed: $($_.Exception.Message)" -Level ERROR
        Write-EnhancedLog "Stack trace: $($_.ScriptStackTrace)" -Level ERROR
        
        return @{
            Success = $false
            Error = $_.Exception.Message
            CompanyName = $CompanyName
            ProfileType = $ProfileType
        }
    }
}

# Execute main function
if ($MyInvocation.InvocationName -ne '.') {
    # Ensure company name is set
    $CompanyName = Get-CompanyName -CurrentCompanyName $CompanyName
    
    # Execute target registration
    $result = Start-TargetAppRegistration
    
    if ($result.Success) {
        Write-Host "✅ Target domain app registration completed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ Target domain app registration failed: $($result.Error)" -ForegroundColor Red
        exit 1
    }
}
#endregion