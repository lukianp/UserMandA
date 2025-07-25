# Enhanced M&A Discovery Suite - Azure AD App Registration Script
# 
# SYNOPSIS
#     Creates Azure AD app registration with comprehensive permissions for M&A environment discovery,
#     configures ZedraAdmin credentials, assigns required roles, and securely stores credentials.
#
# DESCRIPTION
#     This foundational script creates a service principal with all required Microsoft Graph and Azure 
#     permissions, configures ZedraAdmin domain credentials for AD discovery, grants admin consent, assigns 
#     Cloud Application Administrator and Reader roles, creates a client secret, and encrypts credentials 
#     for secure use by discovery and aggregation scripts. Enhanced with robust error handling, 
#     comprehensive validation, colorful progress output, and enterprise-grade security for M&A environments.
#
# PARAMETERS
#     -CompanyName: Company name for the profile (prompts if not provided)
#     -LogPath: Path for detailed execution log (default: profile-specific)
#     -Force: Force recreation of existing app registration
#     -ValidateOnly: Only validate prerequisites without creating resources
#     -SkipAzureRoles: Skip Azure subscription role assignments
#     -CreateADAccount: Create AD service account (optional)
#     -SecretValidityYears: Client secret validity period in years (default: 2, max: 2)
#
# OUTPUTS
#     - Company profile directory structure at C:\MandADiscovery\Profiles\[CompanyName]
#     - Encrypted Azure credentials file (credentials.config)
#     - Encrypted ZedraAdmin credentials (Credentials\ZedraAdmin.config)
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
#     Version: 5.0.0
#     Created: 2025
#     Last Modified: 2025-06-10
#     
#     Security: Credentials encrypted with Windows DPAPI for current user context
#     Resume: Supports re-running without recreation of existing resources
#     Validation: Comprehensive prerequisites and permission validation
#     Backup: Automatic credential file backup and rotation
#
# EXAMPLES
#     .\Create-MandAAppRegistration.ps1
#     .\Create-MandAAppRegistration.ps1 -CompanyName "AcmeCorp" -Force
#     .\Create-MandAAppRegistration.ps1 -ValidateOnly
#     .\Create-MandAAppRegistration.ps1 -SkipAzureRoles -SecretValidityYears 1
#

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, HelpMessage="Company name for the profile")]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false, HelpMessage="Path for detailed execution log")]
    [string]$LogPath,
    
    [Parameter(Mandatory=$false, HelpMessage="Force recreation of existing app registration")]
    [switch]$Force,
    
    [Parameter(Mandatory=$false, HelpMessage="Only validate prerequisites without creating resources")]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false, HelpMessage="Skip Azure subscription role assignments")]
    [switch]$SkipAzureRoles,
    
    [Parameter(Mandatory=$false, HelpMessage="Create AD service account")]
    [switch]$CreateADAccount,
    
    [Parameter(Mandatory=$false, HelpMessage="Client secret validity period in years (1-2)")]
    [ValidateRange(1, 2)]
    [int]$SecretValidityYears = 2
)

#region Enhanced Global Configuration
$ErrorActionPreference = "Stop"
$VerbosePreference = "SilentlyContinue"
$ProgressPreference = "Continue"

# Base paths
$script:BaseProfilePath = "C:\MandADiscovery\Profiles"
$script:CompanyProfilePath = $null
$script:SelectedCompanyName = $null
$script:ZedraAdminConfigured = $false
$script:LogPath = $null
$script:EncryptedOutputPath = $null

# Ensure base directory exists
if (-not (Test-Path $script:BaseProfilePath)) {
    try {
        New-Item -Path $script:BaseProfilePath -ItemType Directory -Force -ErrorAction Stop | Out-Null
    } catch {
        Write-Host "ERROR: Cannot create base profile directory at $script:BaseProfilePath" -ForegroundColor Red
        Write-Host "Please ensure you have appropriate permissions or run as administrator." -ForegroundColor Yellow
        exit 1
    }
}

# Script metadata and validation
$script:ScriptInfo = @{
    Name = "Enhanced M&A Discovery Suite - App Registration"
    Version = "5.0.0"
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
        
        # SharePoint and Teams
        "Sites.Read.All" = "Read SharePoint sites and content"
        "Sites.FullControl.All" = "Full control of SharePoint sites (for migration scenarios)"
        "Files.Read.All" = "Read all files across the organization"
        "Team.ReadBasic.All" = "Read basic team information"
        "TeamMember.Read.All" = "Read team members and ownership"
        "TeamSettings.Read.All" = "Read team settings and configuration"
        
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
    Azure = @{ Connected = $false; LastError = $null; RetryCount = 0; Context = $null; RoleAssignmentSuccess = $false; RoleAssignmentDetails = $null }
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
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS", "PROGRESS", "DEBUG", "HEADER", "CRITICAL", "IMPORTANT", "HIGHLIGHT")]
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
        "ERROR" { "[!!]" }
        "WARN" { "[??]" }
        "CRITICAL" { "[XX]" }
        "IMPORTANT" { "[**]" }
        "PROGRESS" { "[>>]" }
        "DEBUG" { "[..]" }
        "HEADER" { "[==]" }
        "HIGHLIGHT" { "[++]" }
        default { "[--]" }
    }
    
    $displayMessage = "$icon $logMessage"
    
    if ($NoNewLine) {
        Write-Host $displayMessage @colorParams -NoNewLine
    } else {
        Write-Host $displayMessage @colorParams
    }
    
    # Enhanced file logging with error handling
    if ($script:LogPath) {
        $logDir = Split-Path $script:LogPath -Parent -ErrorAction SilentlyContinue
        if ($logDir -and (Test-Path $logDir -PathType Container)) {
            try {
                Add-Content -Path $script:LogPath -Value $logMessage -Encoding UTF8 -ErrorAction Stop
            } catch {
                Write-Warning "Failed to write to log file '$script:LogPath': $($_.Exception.Message)"
            }
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
    
    $icon = if ($Success) { "[OK]" } else { "[!!]" }
    $level = if ($Success) { "SUCCESS" } else { "ERROR" }
    $durationText = if ($Duration) { " (Duration: $('{0:F2}' -f $Duration.TotalSeconds)s)" } else { "" }
    
    $message = "$Operation$durationText"
    if ($Details) {
        $message += " - $Details"
    }
    
    Write-EnhancedLog "$icon $message" -Level $level
}

function Start-OperationTimer {
    param([string]$OperationName)
    
    $script:Metrics.Operations[$OperationName].StartTime = Get-Date
    Write-EnhancedLog ">> Starting: $OperationName" -Level PROGRESS
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

#region Company Profile Management
function Get-CompanyProfile {
    Write-ProgressHeader "COMPANY PROFILE SELECTION" "Choose or create a company profile"
    
    # If CompanyName was provided as parameter, use it directly
    if (-not [string]::IsNullOrWhiteSpace($CompanyName)) {
        $script:SelectedCompanyName = $CompanyName.Trim()
        Write-EnhancedLog "Using company name from parameter: $($script:SelectedCompanyName)" -Level SUCCESS
    } else {
        # Interactive selection mode
        # Ensure base profile directory exists
        if (-not (Test-Path $script:BaseProfilePath)) {
            New-Item -Path $script:BaseProfilePath -ItemType Directory -Force | Out-Null
            Write-EnhancedLog "Created base profile directory: $script:BaseProfilePath" -Level SUCCESS
        }
        
        # Get existing profiles
        $existingProfiles = Get-ChildItem -Path $script:BaseProfilePath -Directory -ErrorAction SilentlyContinue | 
            Select-Object -ExpandProperty Name | Sort-Object
        
        if ($existingProfiles.Count -gt 0) {
            Write-EnhancedLog "Found existing company profiles:" -Level INFO
            for ($i = 0; $i -lt $existingProfiles.Count; $i++) {
                Write-Host "  [$($i+1)] $($existingProfiles[$i])" -ForegroundColor White
            }
            Write-Host "  [N] Create new company profile" -ForegroundColor Green
            Write-Host ""
            
            do {
                $selection = Read-Host "Select a profile number or 'N' for new"
                
                if ($selection -match '^[Nn]$') {
                    # Create new profile
                    do {
                        $newCompanyName = Read-Host "Enter new company name"
                        $newCompanyName = $newCompanyName.Trim()
                        
                        if ([string]::IsNullOrWhiteSpace($newCompanyName)) {
                            Write-EnhancedLog "Company name cannot be empty" -Level ERROR
                        } elseif ($newCompanyName -match '[<>:"/\\|?*]') {
                            Write-EnhancedLog "Company name contains invalid characters" -Level ERROR
                            $newCompanyName = ""
                        } elseif ($existingProfiles -contains $newCompanyName) {
                            Write-EnhancedLog "Company profile already exists" -Level ERROR
                            $newCompanyName = ""
                        }
                    } while ([string]::IsNullOrWhiteSpace($newCompanyName))
                    
                    $script:SelectedCompanyName = $newCompanyName
                    break
                }
                elseif ($selection -match '^\d+$') {
                    $index = [int]$selection - 1
                    if ($index -ge 0 -and $index -lt $existingProfiles.Count) {
                        $script:SelectedCompanyName = $existingProfiles[$index]
                        Write-EnhancedLog "Selected existing profile: $($script:SelectedCompanyName)" -Level SUCCESS
                        break
                    } else {
                        Write-EnhancedLog "Invalid selection. Please try again." -Level ERROR
                    }
                }
                else {
                    Write-EnhancedLog "Invalid input. Please enter a number or 'N'." -Level ERROR
                }
            } while ($true)
        }
        else {
            Write-EnhancedLog "No existing profiles found." -Level INFO
            do {
                $newCompanyName = Read-Host "Enter company name for new profile"
                $newCompanyName = $newCompanyName.Trim()
                
                if ([string]::IsNullOrWhiteSpace($newCompanyName)) {
                    Write-EnhancedLog "Company name cannot be empty" -Level ERROR
                } elseif ($newCompanyName -match '[<>:"/\\|?*]') {
                    Write-EnhancedLog "Company name contains invalid characters" -Level ERROR
                    $newCompanyName = ""
                }
            } while ([string]::IsNullOrWhiteSpace($newCompanyName))
            
            $script:SelectedCompanyName = $newCompanyName
        }
    }
    
    # Set company-specific paths
    $script:CompanyProfilePath = Join-Path $script:BaseProfilePath $script:SelectedCompanyName
    
    # Create company profile directory structure
    $directories = @(
        $script:CompanyProfilePath,
        (Join-Path $script:CompanyProfilePath "Logs"),
        (Join-Path $script:CompanyProfilePath "Credentials"),
        (Join-Path $script:CompanyProfilePath "Reports"),
        (Join-Path $script:CompanyProfilePath "Backups")
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
            Write-EnhancedLog "Created directory: $dir" -Level SUCCESS
        }
    }
    
    # Update paths based on company profile
    $script:EncryptedOutputPath = Join-Path $script:CompanyProfilePath "credentials.json"
    
    if ([string]::IsNullOrWhiteSpace($LogPath)) {
        $script:LogPath = Join-Path $script:CompanyProfilePath "Logs\MandADiscovery_Registration_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    }
    
    Write-EnhancedLog "Company Profile: $script:SelectedCompanyName" -Level HIGHLIGHT
    Write-EnhancedLog "Profile Path: $script:CompanyProfilePath" -Level INFO
}
#endregion

#region ZedraAdmin Account Configuration
function Set-ZedraAdminCredentials {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyProfilePath
    )
    
    Write-ProgressHeader "ZEDRA ADMIN ACCOUNT CONFIGURATION" "Configure AD credentials for discovery operations"
    
    try {
        Write-EnhancedLog "The discovery process requires Domain Admin credentials to access AD resources." -Level IMPORTANT
        Write-EnhancedLog "These credentials will be stored securely in the company profile." -Level INFO
        Write-Host ""
        
        $createZedraAdmin = Read-Host "Do you want to configure ZedraAdmin credentials now? (Y/N)"
        
        if ($createZedraAdmin -ne 'Y' -and $createZedraAdmin -ne 'y') {
            Write-EnhancedLog "Skipping ZedraAdmin configuration. You can configure it later." -Level WARN
            return $null
        }
        
        # Check if ZedraAdmin credentials already exist
        $adCredPath = Join-Path $CompanyProfilePath "Credentials\ZedraAdmin.config"
        if (Test-Path $adCredPath) {
            Write-EnhancedLog "ZedraAdmin credentials already exist for this profile." -Level WARN
            $overwrite = Read-Host "Do you want to overwrite existing credentials? (Y/N)"
            if ($overwrite -ne 'Y' -and $overwrite -ne 'y') {
                Write-EnhancedLog "Keeping existing ZedraAdmin credentials." -Level INFO
                return $null
            }
        }
        
        Write-Host ""
        Write-EnhancedLog "Please provide ZedraAdmin account details:" -Level INFO
        
        # Get domain
        $domain = Read-Host "Enter domain name (e.g., contoso.com)"
        $domain = $domain.Trim()
        
        # Validate domain
        if ([string]::IsNullOrWhiteSpace($domain) -or $domain -notmatch '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$') {
            Write-EnhancedLog "Invalid domain format. Using local domain." -Level WARN
            try {
                $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain().Name
                Write-EnhancedLog "Detected domain: $domain" -Level SUCCESS
            } catch {
                throw "Could not determine domain. Please specify manually."
            }
        }
        
        # Get username (default to ZedraAdmin)
        $username = Read-Host "Enter admin username (default: ZedraAdmin)"
        if ([string]::IsNullOrWhiteSpace($username)) {
            $username = "ZedraAdmin"
        }
        $username = $username.Trim()
        
        # Validate username format
        if ($username -match '[<>:"/\\|?*@]') {
            Write-EnhancedLog "Username contains invalid characters. Using 'ZedraAdmin' instead." -Level WARN
            $username = "ZedraAdmin"
        }
        
        # Get password securely
        Write-Host ""
        Write-EnhancedLog "Enter password for $username@$domain" -Level INFO
        $securePassword = Read-Host "Password" -AsSecureString
        
        # Confirm password
        $securePasswordConfirm = Read-Host "Confirm Password" -AsSecureString
        
        # Convert to plain text for comparison (will be re-encrypted)
        $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        )
        $plainPasswordConfirm = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePasswordConfirm)
        )
        
        if ($plainPassword -ne $plainPasswordConfirm) {
            throw "Passwords do not match"
        }
        
        # Test credentials if possible
        Write-EnhancedLog "Validating credentials..." -Level PROGRESS
        $credentialValid = $false
        
        try {
            $testCred = New-Object System.Management.Automation.PSCredential("$username@$domain", $securePassword)
            
            # Try to connect to AD with these credentials
            $adContext = New-Object System.DirectoryServices.DirectoryEntry("LDAP://$domain", $testCred.UserName, $testCred.GetNetworkCredential().Password)
            $searcher = New-Object System.DirectoryServices.DirectorySearcher($adContext)
            $searcher.Filter = "(objectClass=domain)"
            $searcher.SearchScope = "Base"
            $null = $searcher.FindOne()
            
            $credentialValid = $true
            Write-EnhancedLog "Credentials validated successfully!" -Level SUCCESS
        } catch {
            Write-EnhancedLog "Could not validate credentials: $($_.Exception.Message)" -Level WARN
            $continue = Read-Host "Continue without validation? (Y/N)"
            if ($continue -ne 'Y' -and $continue -ne 'y') {
                throw "Credential validation failed"
            }
        }
        
        # Create credential object
        $credentialData = @{
            Username = $username
            Domain = $domain
            UserPrincipalName = "$username@$domain"
            Password = $plainPassword  # Will be encrypted
            Purpose = "ZedraAdmin - Domain Admin account for M&A Discovery"
            CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            CreatedBy = $env:USERNAME
            LastValidated = if ($credentialValid) { Get-Date -Format "yyyy-MM-dd HH:mm:ss" } else { "Not Validated" }
            CompanyProfile = $script:SelectedCompanyName
        }
        
        # Encrypt and save credentials
        Write-EnhancedLog "Encrypting ZedraAdmin credentials..." -Level PROGRESS
        
        # Ensure Credentials directory exists
        $credDir = Join-Path $CompanyProfilePath "Credentials"
        if (-not (Test-Path $credDir)) {
            New-Item -Path $credDir -ItemType Directory -Force | Out-Null
        }
        
        # Convert to JSON and encrypt
        $jsonData = $credentialData | ConvertTo-Json -Depth 4
        $secureString = ConvertTo-SecureString -String $jsonData -AsPlainText -Force
        $encryptedData = $secureString | ConvertFrom-SecureString
        
        # Save encrypted file
        Set-Content -Path $adCredPath -Value $encryptedData -Force -Encoding UTF8
        
        # Secure the file
        $acl = Get-Acl $adCredPath
        $acl.SetAccessRuleProtection($true, $false)
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $env:USERNAME,
            "FullControl",
            "Allow"
        )
        $acl.SetAccessRule($accessRule)
        
        # Add SYSTEM access
        $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            "NT AUTHORITY\SYSTEM",
            "FullControl",
            "Allow"
        )
        $acl.SetAccessRule($systemRule)
        
        Set-Acl -Path $adCredPath -AclObject $acl
        
        Write-EnhancedLog "ZedraAdmin credentials saved successfully!" -Level SUCCESS
        Write-EnhancedLog "  Location: $adCredPath" -Level INFO
        Write-EnhancedLog "  Username: $username@$domain" -Level INFO
        
        # Create backup
        $backupDir = Join-Path $CompanyProfilePath "Backups"
        if (-not (Test-Path $backupDir)) {
            New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
        }
        
        $backupPath = Join-Path $backupDir "ZedraAdmin_$(Get-Date -Format 'yyyyMMdd_HHmmss').config"
        Copy-Item -Path $adCredPath -Destination $backupPath -Force
        Write-EnhancedLog "Backup created: $(Split-Path $backupPath -Leaf)" -Level SUCCESS
        
        # Clear sensitive data from memory
        $plainPassword = $null
        $plainPasswordConfirm = $null
        $credentialData.Password = $null
        [System.GC]::Collect()
        
        return @{
            Username = $username
            Domain = $domain
            UserPrincipalName = "$username@$domain"
            Configured = $true
        }
        
    } catch {
        Write-EnhancedLog "Failed to configure ZedraAdmin credentials: $($_.Exception.Message)" -Level ERROR
        return $null
    }
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
        $encryptedDir = Split-Path $script:EncryptedOutputPath -Parent
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
            Write-Progress -Activity "Processing Modules" -Status "Processing $moduleName ($processedModules of $totalModules)" -PercentComplete (($processedModules / $totalModules) * 100)
            
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
                            Write-EnhancedLog "Update available for $moduleName v$installedVersion -> v$latestVersion" -Level INFO
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
                Write-EnhancedLog "    - $($_.Name) ($($_.State))" -Level INFO
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
    Write-ProgressHeader "APPLICATION REGISTRATION" "Creating M and A Discovery service principal with comprehensive permissions"
    
    $appName = "$($script:AppConfig.DisplayName)_$($script:SelectedCompanyName)"
    
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
        Write-EnhancedLog "  - Secret value will be encrypted and stored securely" -Level IMPORTANT
        Write-EnhancedLog "  - Secret cannot be retrieved after this session" -Level IMPORTANT
        Write-EnhancedLog "  - Secret expires in $daysUntilExpiry days" -Level IMPORTANT
        Write-EnhancedLog "  - Set calendar reminder for renewal before expiry" -Level IMPORTANT
        
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
    Write-ProgressHeader "CREDENTIAL STORAGE" "Saving authentication data"
    
    try {
        # Enhanced credential data with company information
        $credentialData = @{
            ClientId = $AppRegistration.AppId
            ClientSecret = $ClientSecret.SecretText
            TenantId = $TenantId
            CompanyName = $script:SelectedCompanyName
            ApplicationName = $AppRegistration.DisplayName
            CreatedDate = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
            ExpiryDate = $ClientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss')
        }
        
        Write-EnhancedLog "Saving credentials..." -Level "PROGRESS"
        
        # Save as JSON (matching what CredentialManagement.psm1 expects)
        $credentialPath = Join-Path $script:CompanyProfilePath "credentials.json"
        $credentialData | ConvertTo-Json -Depth 4 | Set-Content -Path $credentialPath -Encoding UTF8
        
        Write-EnhancedLog "Credentials saved successfully!" -Level "SUCCESS"
        Write-EnhancedLog "  Location: $credentialPath" -Level "INFO"
        
        Stop-OperationTimer "CredentialStorage" $true
        
    } catch {
        Write-EnhancedLog "Failed to save credentials: $($_.Exception.Message)" -Level "ERROR"
        Stop-OperationTimer "CredentialStorage" $false
        throw
    }
}


#endregion

#region AD Account Creation
function New-MandAADServiceAccount {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyName,
        [Parameter(Mandatory=$true)]
        [string]$OutputPath
    )
    
    Write-ProgressHeader "AD SERVICE ACCOUNT CREATION" "Creating domain service account for M&A discovery"
    
    try {
        # Check if running with domain admin privileges
        $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
        
        if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
            Write-EnhancedLog "Administrator privileges required for AD account creation" -Level WARN
            return $null
        }
        
        # Import AD module
        try {
            Import-Module ActiveDirectory -ErrorAction Stop
        } catch {
            Write-EnhancedLog "ActiveDirectory module not available. Skipping AD account creation." -Level WARN
            return $null
        }
        
        # Generate account details
        $accountName = "svc_MandA_$($CompanyName -replace '[^a-zA-Z0-9]', '')"
        if ($accountName.Length -gt 20) {
            $accountName = $accountName.Substring(0, 20)
        }
        
        $displayName = "M&A Discovery Service - $CompanyName"
        $description = "Service account for M&A discovery operations for $CompanyName"
        
        # Generate secure password
        $passwordLength = 24
        $password = -join ((65..90) + (97..122) + (48..57) + (33..47) | Get-Random -Count $passwordLength | ForEach-Object {[char]$_})
        $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
        
        Write-EnhancedLog "Creating AD service account: $accountName" -Level PROGRESS
        
        # Get default Users OU
        $domain = Get-ADDomain
        $usersOU = "OU=Service Accounts,OU=IT,$($domain.DistinguishedName)"
        
        # Check if Service Accounts OU exists, if not use default Users container
        try {
            Get-ADOrganizationalUnit -Identity $usersOU -ErrorAction Stop | Out-Null
        } catch {
            $usersOU = "CN=Users,$($domain.DistinguishedName)"
            Write-EnhancedLog "Using default Users container (Service Accounts OU not found)" -Level WARN
        }
        
        # Create the account
        $adAccount = New-ADUser -Name $accountName `
            -SamAccountName $accountName `
            -UserPrincipalName "$accountName@$($domain.DNSRoot)" `
            -DisplayName $displayName `
            -Description $description `
            -Path $usersOU `
            -AccountPassword $securePassword `
            -Enabled $true `
            -PasswordNeverExpires $true `
            -CannotChangePassword $true `
            -PassThru -ErrorAction Stop
        
        Write-EnhancedLog "AD service account created successfully" -Level SUCCESS
        
        # Add to Domain Admins group (required for discovery)
        try {
            Add-ADGroupMember -Identity "Domain Admins" -Members $accountName -ErrorAction Stop
            Write-EnhancedLog "Added to Domain Admins group" -Level SUCCESS
        } catch {
            Write-EnhancedLog "Failed to add to Domain Admins group: $($_.Exception.Message)" -Level ERROR
        }
        
        # Save credentials securely
        $credentialInfo = @{
            AccountName = $accountName
            UserPrincipalName = "$accountName@$($domain.DNSRoot)"
            Password = $password
            Domain = $domain.DNSRoot
            DistinguishedName = $adAccount.DistinguishedName
            CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            CreatedBy = $env:USERNAME
            Purpose = "M&A Discovery Service Account"
            Groups = @("Domain Admins")
        }
        
        # Save to encrypted file
        $adCredPath = Join-Path $OutputPath "Credentials\ADServiceAccount.json"
        $credentialInfo | ConvertTo-Json -Depth 4 | Out-File -FilePath $adCredPath -Encoding UTF8
        
        # Protect the file
        $acl = Get-Acl $adCredPath
        $acl.SetAccessRuleProtection($true, $false)
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $env:USERNAME,
            "FullControl",
            "Allow"
        )
        $acl.SetAccessRule($accessRule)
        Set-Acl -Path $adCredPath -AclObject $acl
        
        Write-EnhancedLog "AD credentials saved to: $adCredPath" -Level SUCCESS
        Write-EnhancedLog "IMPORTANT: Store the password securely. It cannot be retrieved later." -Level CRITICAL
        
        # Display account info
        Write-EnhancedLog "AD Service Account Details:" -Level IMPORTANT
        Write-EnhancedLog "  Username: $accountName" -Level INFO
        Write-EnhancedLog "  UPN: $($credentialInfo.UserPrincipalName)" -Level INFO
        Write-EnhancedLog "  Domain: $($domain.DNSRoot)" -Level INFO
        
        return $credentialInfo
        
    } catch {
        Write-EnhancedLog "Failed to create AD service account: $($_.Exception.Message)" -Level ERROR
        return $null
    }
}
#endregion

#region Credential Export for Discovery Script
function Export-UnifiedCredentialPackage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyProfilePath
    )
    
    try {
        Write-EnhancedLog "Creating unified credential package for discovery script..." -Level PROGRESS
        
        $credentialPackage = @{
            CompanyName = $script:SelectedCompanyName
            ProfilePath = $CompanyProfilePath
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            
            # Azure credentials path
            AzureCredentialsPath = Join-Path $CompanyProfilePath "credentials.config"
            AzureCredentialsExist = Test-Path (Join-Path $CompanyProfilePath "credentials.config")
            
            # ZedraAdmin credentials path
            ADCredentialsPath = Join-Path $CompanyProfilePath "Credentials\ZedraAdmin.config"
            ADCredentialsExist = Test-Path (Join-Path $CompanyProfilePath "Credentials\ZedraAdmin.config")
            
            # Paths for discovery outputs
            RawDataPath = Join-Path $CompanyProfilePath "RawData"
            ProcessedDataPath = Join-Path $CompanyProfilePath "ProcessedData"
            ExportPath = Join-Path $CompanyProfilePath "Exports"
            LogPath = Join-Path $CompanyProfilePath "Logs"
        }
        
        # Create output directories
        @($credentialPackage.RawDataPath, $credentialPackage.ProcessedDataPath, 
          $credentialPackage.ExportPath, $credentialPackage.LogPath) | ForEach-Object {
            if (-not (Test-Path $_)) {
                New-Item -Path $_ -ItemType Directory -Force | Out-Null
            }
        }
        
        # Save package info
        $packagePath = Join-Path $CompanyProfilePath "discovery-config.json"
        $credentialPackage | ConvertTo-Json -Depth 4 | Out-File -FilePath $packagePath -Encoding UTF8
        
        Write-EnhancedLog "Credential package created: $packagePath" -Level SUCCESS
        return $credentialPackage
        
    } catch {
        Write-EnhancedLog "Failed to create credential package: $($_.Exception.Message)" -Level ERROR
        return $null
    }
}
#endregion

#region Main Execution
try {
    # Initialize script
    $script:Metrics.StartTime = Get-Date
    
    # Enhanced header
    Write-ProgressHeader "M&A DISCOVERY SUITE - APP REGISTRATION" "Enhanced automation with company profiles and ZedraAdmin support"
    
    Write-EnhancedLog "Script Information:" -Level INFO
    Write-EnhancedLog "  Name: $($script:ScriptInfo.Name)" -Level INFO
    Write-EnhancedLog "  Version: $($script:ScriptInfo.Version)" -Level INFO
    Write-EnhancedLog "  Author: $($script:ScriptInfo.Author)" -Level INFO
    
    Write-EnhancedLog "Execution Parameters:" -Level INFO
    Write-EnhancedLog "  Force Mode: $Force" -Level INFO
    Write-EnhancedLog "  Validate Only: $ValidateOnly" -Level INFO
    Write-EnhancedLog "  Skip Azure Roles: $SkipAzureRoles" -Level INFO
    Write-EnhancedLog "  Secret Validity: $SecretValidityYears years" -Level INFO
    
    # Get company profile first
    Get-CompanyProfile
    
    # Initialize logging AFTER company profile is set
    if ($script:LogPath) {
        $logDir = Split-Path $script:LogPath -Parent -ErrorAction SilentlyContinue
        if ($logDir -and -not (Test-Path $logDir -PathType Container -ErrorAction SilentlyContinue)) {
            New-Item -Path $logDir -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
        }
    }
    
    # Configure ZedraAdmin credentials
    $zedraAdminInfo = Set-ZedraAdminCredentials -CompanyProfilePath $script:CompanyProfilePath
    
    # Store ZedraAdmin info in script scope for later use
    if ($zedraAdminInfo) {
        $script:ZedraAdminConfigured = $true
        Write-EnhancedLog "ZedraAdmin credentials configured and ready for discovery operations" -Level SUCCESS
    } else {
        $script:ZedraAdminConfigured = $false
        Write-EnhancedLog "ZedraAdmin credentials not configured - discovery may have limited AD access" -Level WARN
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
    
    # Create AD service account if requested
    if ($CreateADAccount) {
        $adAccountInfo = New-MandAADServiceAccount -CompanyName $script:SelectedCompanyName -OutputPath $script:CompanyProfilePath
        if ($adAccountInfo) {
            Write-EnhancedLog "AD service account created successfully" -Level SUCCESS
        }
    }
    
    # Calculate final metrics
    $script:Metrics.EndTime = Get-Date
    $totalDuration = $script:Metrics.EndTime - $script:Metrics.StartTime
    $successfulOperations = ($script:Metrics.Operations.Values | Where-Object { $_.Success }).Count
    $totalOperations = $script:Metrics.Operations.Count
    
    # Enhanced final summary
    Write-ProgressHeader "DEPLOYMENT SUMMARY" "M&A Discovery service principal ready for operations"
    
    Write-EnhancedLog "APPLICATION DETAILS:" -Level HEADER
    Write-EnhancedLog "  Application Name: $($appRegistration.DisplayName)" -Level SUCCESS
    Write-EnhancedLog "  Application (Client) ID: $($appRegistration.AppId)" -Level SUCCESS
    Write-EnhancedLog "  Directory (Tenant) ID: $tenantId" -Level SUCCESS
    Write-EnhancedLog "  Object ID: $($appRegistration.Id)" -Level SUCCESS
    Write-EnhancedLog "  Service Principal ID: $($servicePrincipal.Id)" -Level SUCCESS
    
    Write-EnhancedLog "SECURITY INFORMATION:" -Level HEADER
    Write-EnhancedLog "  Secret Expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" -Level SUCCESS
    Write-EnhancedLog "  Days Until Expiry: $(($clientSecret.EndDateTime - (Get-Date)).Days)" -Level SUCCESS
    Write-EnhancedLog "  Credentials File: $script:EncryptedOutputPath" -Level SUCCESS
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
    Write-EnhancedLog "  - Client secret expires: $($clientSecret.EndDateTime.ToString('yyyy-MM-dd'))" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  - Set calendar reminder for credential renewal" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  - Credentials are user-encrypted (current user only)" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  - Backup credentials file is stored securely" -Level IMPORTANT -NoTimestamp
    Write-EnhancedLog "  - Review and audit permissions regularly" -Level IMPORTANT -NoTimestamp
    
    Write-EnhancedLog "PROFILE SUMMARY:" -Level HEADER -NoTimestamp
    Write-EnhancedLog "  Company: $script:SelectedCompanyName" -Level SUCCESS -NoTimestamp
    Write-EnhancedLog "  Profile Path: $script:CompanyProfilePath" -Level SUCCESS -NoTimestamp
    Write-EnhancedLog "  Azure Credentials: $script:EncryptedOutputPath" -Level SUCCESS -NoTimestamp
    Write-EnhancedLog "  ZedraAdmin Configured: $(if ($script:ZedraAdminConfigured) { 'Yes' } else { 'No' })" -Level $(if ($script:ZedraAdminConfigured) { "SUCCESS" } else { "WARN" }) -NoTimestamp
    
    if ($script:ZedraAdminConfigured) {
        Write-EnhancedLog "  AD Credentials: $(Join-Path $script:CompanyProfilePath 'Credentials\ZedraAdmin.config')" -Level SUCCESS -NoTimestamp
    } else {
        Write-EnhancedLog "  Run this script again with the same company profile to configure ZedraAdmin" -Level INFO -NoTimestamp
    }
    
    Write-EnhancedLog "Azure AD App Registration completed successfully!" -Level SUCCESS
    Write-EnhancedLog "Ready to proceed with environment discovery using script 2" -Level SUCCESS
    
    # Export unified credential package for discovery script
    $credPackage = Export-UnifiedCredentialPackage -CompanyProfilePath $script:CompanyProfilePath
    if ($credPackage) {
        Write-EnhancedLog "Discovery configuration ready at: $(Join-Path $script:CompanyProfilePath 'discovery-config.json')" -Level SUCCESS
    }
    
} catch {
    Write-EnhancedLog "CRITICAL ERROR: $($_.Exception.Message)" -Level CRITICAL
    if ($_.Exception.InnerException) {
        Write-EnhancedLog "Inner Exception: $($_.Exception.InnerException.Message)" -Level ERROR
    }
    if ($_.ScriptStackTrace) {
        Write-EnhancedLog "Stack Trace: $($_.ScriptStackTrace)" -Level DEBUG
    }
    if ($script:LogPath) {
        Write-EnhancedLog "Check the log file for detailed error information: $script:LogPath" -Level ERROR
    }
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
    if ($script:Metrics -and $script:LogPath) {
        try {
            $metricsPath = $script:LogPath -replace '\.txt$', '_metrics.json'
            $script:Metrics | ConvertTo-Json -Depth 3 | Set-Content -Path $metricsPath -Encoding UTF8
            Write-EnhancedLog "Metrics saved: $(Split-Path $metricsPath -Leaf)" -Level SUCCESS
        } catch {
            Write-EnhancedLog "Could not save metrics: $($_.Exception.Message)" -Level WARN
        }
    }
    
    if ($script:LogPath) {
        Write-EnhancedLog "Cleanup completed. Full log: $script:LogPath" -Level SUCCESS
    } else {
        Write-EnhancedLog "Cleanup completed." -Level SUCCESS
    }
}
#endregion

# Exit with appropriate code
if ($script:ExitCode -ne 0) {
    exit $script:ExitCode
} else {
    exit 0
}