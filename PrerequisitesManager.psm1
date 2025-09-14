# -*- coding: utf-8 -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-09-02
# Last Modified: 2025-09-02

<#
.SYNOPSIS
    Prerequisites Manager for M&A Discovery Suite
.DESCRIPTION
    Automatically detects, installs, and validates prerequisites for discovery modules.
    Handles RSAT components, PowerShell modules, and system dependencies with
    fallback mechanisms and user-friendly installation workflows.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-09-02
    Requires: PowerShell 5.1+, Administrator privileges for some components
#>

# Core Prerequisite Classes
class PrerequisiteCheck {
    [string]$Name
    [string]$Description
    [bool]$IsRequired
    [bool]$IsInstalled
    [string]$Version
    [string]$Status
    [string]$InstallMethod
    [string]$InstallCommand
    [string]$ValidationCommand

    PrerequisiteCheck([string]$name, [string]$description, [bool]$required) {
        $this.Name = $name
        $this.Description = $description
        $this.IsRequired = $required
        $this.IsInstalled = $false
        $this.Status = "Unknown"
        $this.Version = ""
        $this.InstallMethod = "Unknown"
        $this.InstallCommand = ""
        $this.ValidationCommand = ""
    }
}

class PrerequisiteChecker {
    [string]$OSVersion
    [bool]$IsAdministrator
    [bool]$HasInternetAccess
    [System.Collections.ArrayList]$Prerequisites

    PrerequisiteChecker() {
        $this.Prerequisites = [System.Collections.ArrayList]::new()
        $this.InitializeEnvironmentInfo()
    }

    [void]InitializeEnvironmentInfo() {
        try {
            $this.OSVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
        } catch {
            $this.OSVersion = (Get-ComputerInfo).OSName
        }

        $this.IsAdministrator = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

        try {
            $this.HasInternetAccess = Test-Connection -ComputerName "www.microsoft.com" -Count 1 -Quiet -ErrorAction Stop
        } catch {
            $this.HasInternetAccess = $false
        }
    }

    [void]AddPrerequisite([PrerequisiteCheck]$prereq) {
        $this.Prerequisites.Add($prereq) | Out-Null
    }

    [PrerequisiteCheck[]]GetAllPrerequisites() {
        return $this.Prerequisites.ToArray()
    }

    [PrerequisiteCheck[]]GetRequiredPrerequisites() {
        return $this.Prerequisites | Where-Object { $_.IsRequired }
    }

    [PrerequisiteCheck[]]GetMissingPrerequisites() {
        return $this.Prerequisites | Where-Object { -not $_.IsInstalled }
    }
}

# Function to create prerequisite objects for common modules
function New-Prerequisite {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name,

        [Parameter(Mandatory=$true)]
        [string]$Description,

        [Parameter(Mandatory=$false)]
        [bool]$IsRequired = $true
    )

    return [PrerequisiteCheck]::new($Name, $Description, $IsRequired)
}

# Core validation functions
function Test-PowerShellModule {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,

        [Parameter(Mandatory=$false)]
        [ValidateSet("Available", "Imported")]
        [string]$TestMode = "Available"
    )

    try {
        $moduleInfo = Get-Module -Name $ModuleName -ListAvailable -ErrorAction Stop | Select-Object -First 1

        if ($moduleInfo) {
            Write-PrerequisitesLog "PowerShell module '$ModuleName' is available (Version: $($moduleInfo.Version))" -Level "SUCCESS"
            return @{
                Installed = $true
                Version = $moduleInfo.Version.ToString()
                Status = "Available"
            }
        }
    } catch {
        Write-PrerequisitesLog "Failed to check PowerShell module '$ModuleName': $($_.Exception.Message)" -Level "WARN"
    }

    return @{
        Installed = $false
        Version = ""
        Status = "Not Available"
    }
}

function Test-WindowsFeature {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FeatureName
    )

    try {
        if (Get-Command Get-WindowsOptionalFeature -ErrorAction SilentlyContinue) {
            $feature = Get-WindowsOptionalFeature -FeatureName $FeatureName -Online -ErrorAction Stop

            if ($feature.State -eq "Enabled") {
                Write-PrerequisitesLog "Windows optional feature '$FeatureName' is enabled" -Level "SUCCESS"
                return @{
                    Installed = $true
                    Status = "Enabled"
                    Version = ""
                }
            } else {
                Write-PrerequisitesLog "Windows optional feature '$FeatureName' is available but not enabled" -Level "INFO"
                return @{
                    Installed = $false
                    Status = "Disabled"
                    Version = ""
                }
            }
        } elseif (Get-Command Get-WindowsCapability -ErrorAction SilentlyContinue) {
            $capability = Get-WindowsCapability -Name $FeatureName -Online -ErrorAction Stop

            if ($capability.State -eq "Installed") {
                Write-PrerequisitesLog "Windows capability '$FeatureName' is installed" -Level "SUCCESS"
                return @{
                    Installed = $true
                    Status = "Installed"
                    Version = ""
                }
            } else {
                Write-PrerequisitesLog "Windows capability '$FeatureName' is available but not installed" -Level "INFO"
                return @{
                    Installed = $false
                    Status = "Not Installed"
                    Version = ""
                }
            }
        }
    } catch {
        Write-PrerequisitesLog "Failed to check Windows feature '$FeatureName': $($_.Exception.Message)" -Level "WARN"
    }

    return @{
        Installed = $false
        Status = "Unknown"
        Version = ""
    }
}

function Test-Executable {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$CommandName
    )

    try {
        $cmd = Get-Command $CommandName -ErrorAction Stop

        if ($cmd) {
            Write-PrerequisitesLog "Executable '$CommandName' is available at $($cmd.Source)" -Level "SUCCESS"
            return @{
                Installed = $true
                Version = ""
                Path = $cmd.Source
                Status = "Available"
            }
        }
    } catch {
        Write-PrerequisitesLog "Executable '$CommandName' is not available in PATH" -Level "WARN"
    }

    return @{
        Installed = $false
        Version = ""
        Path = ""
        Status = "Not Available"
    }
}

# Logging functions
function Write-PrerequisitesLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [string]$Level = "INFO",
        [string]$Component = "PrerequisitesManager"
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    $color = switch ($Level) {
        'ERROR'   { 'Red' }
        'WARN'    { 'Yellow' }
        'SUCCESS' { 'Green' }
        'DEBUG'   { 'Gray' }
        default   { 'White' }
    }

    Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $color
}

# ActiveDirectory-specific prerequisite checks
function New-ActiveDirectoryPrerequisites {
    [CmdletBinding()]
    param()

    $prereqChecker = [PrerequisiteChecker]::new()

    # RSAT ActiveDirectory PowerShell Module
    $adPrereq = New-Prerequisite `
        -Name "RSAT-AD-PowerShell" `
        -Description "RSAT: Active Directory PowerShell module provides cmdlets for AD administration" `
        -IsRequired $true

    $adPrereq.InstallMethod = "Automatic"
    $adPrereq.ValidationCommand = "Test-PowerShellModule -ModuleName 'ActiveDirectory'"
    $adPrereq.InstallCommand = "Install-ActiveDirectoryModule"
    $prereqChecker.AddPrerequisite($adPrereq)

    # Administrative privileges
    $adminPrereq = New-Prerequisite `
        -Name "AdministratorPrivileges" `
        -Description "Administrator privileges required for some AD operations and RSAT installation" `
        -IsRequired $true

    $adminPrereq.InstallMethod = "Manual"
    $adminPrereq.ValidationCommand = "Test-AdministratorPrivileges"
    $prereqChecker.AddPrerequisite($adminPrereq)

    # Windows version compatibility
    $windowsPrereq = New-Prerequisite `
        -Name "WindowsCompatibility" `
        -Description "Compatible Windows version for RSAT installation" `
        -IsRequired $true

    $windowsPrereq.InstallMethod = "Information"
    $windowsPrereq.ValidationCommand = "Test-WindowsCompatibility"
    $prereqChecker.AddPrerequisite($windowsPrereq)

    return $prereqChecker
}

function New-InfrastructureDiscoveryPrerequisites {
    <#
    .SYNOPSIS
        Creates prerequisite checker for Infrastructure Discovery module
    .DESCRIPTION
        Defines prerequisites for the InfrastructureDiscovery module including nmap,
        network access, and administrator privileges for installation.
    #>
    [CmdletBinding()]
    param()

    $prereqChecker = [PrerequisiteChecker]::new()

    # nmap Network Scanner
    $nmapPrereq = New-Prerequisite `
        -Name "nmap-NetworkScanner" `
        -Description "nmap network scanner for comprehensive infrastructure discovery and port scanning" `
        -IsRequired $false  # Optional - module has PowerShell fallbacks

    $nmapPrereq.InstallMethod = "Automatic"
    $nmapPrereq.ValidationCommand = "Test-NmapInstallation"
    $nmapPrereq.InstallCommand = "Install-NmapPrerequisite"
    $prereqChecker.AddPrerequisite($nmapPrereq)

    # Administrator privileges (for nmap installation)
    $adminPrereq = New-Prerequisite `
        -Name "AdministratorPrivileges" `
        -Description "Administrator privileges required for nmap installation and network scanning capabilities" `
        -IsRequired $false  # Optional - can run without admin but with limited capabilities

    $adminPrereq.InstallMethod = "Manual"
    $adminPrereq.ValidationCommand = "Test-AdministratorPrivileges"
    $prereqChecker.AddPrerequisite($adminPrereq)

    # Network connectivity (for downloading nmap if needed)
    $networkPrereq = New-Prerequisite `
        -Name "InternetConnectivity" `
        -Description "Internet connectivity for downloading nmap installer and updates" `
        -IsRequired $false  # Optional - can use embedded version if available

    $networkPrereq.InstallMethod = "Information"
    $networkPrereq.ValidationCommand = "Test-Connection -ComputerName 'www.microsoft.com' -Count 1 -Quiet"
    $prereqChecker.AddPrerequisite($networkPrereq)

    # Windows version compatibility
    $windowsPrereq = New-Prerequisite `
        -Name "WindowsCompatibility" `
        -Description "Windows 10/11 or Server 2016+ for optimal nmap functionality" `
        -IsRequired $true

    $windowsPrereq.InstallMethod = "Information"
    $windowsPrereq.ValidationCommand = "Test-WindowsCompatibility"
    $prereqChecker.AddPrerequisite($windowsPrereq)

    return $prereqChecker
}

function New-LicenseAssignmentPrerequisites {
    <#
    .SYNOPSIS
        Creates prerequisite checker for License Assignment and Compliance (T-038)
    .DESCRIPTION
        Defines prerequisites for the License Assignment service including Microsoft Graph API
        connectivity, required permissions, and Azure AD application registration.
    #>
    [CmdletBinding()]
    param()

    $prereqChecker = [PrerequisiteChecker]::new()

    # Microsoft Graph PowerShell SDK
    $graphSdkPrereq = New-Prerequisite `
        -Name "Microsoft.Graph-PowerShell" `
        -Description "Microsoft Graph PowerShell SDK for license management and API operations" `
        -IsRequired $false  # Optional - can use REST API directly

    $graphSdkPrereq.InstallMethod = "Automatic"
    $graphSdkPrereq.ValidationCommand = "Test-PowerShellModule -ModuleName 'Microsoft.Graph'"
    $graphSdkPrereq.InstallCommand = "Install-GraphPowerShellModule"
    $prereqChecker.AddPrerequisite($graphSdkPrereq)

    # Azure AD Application Registration
    $azureAdAppPrereq = New-Prerequisite `
        -Name "AzureAD-Application-Registration" `
        -Description "Azure AD application with required Graph API permissions for license operations" `
        -IsRequired $true

    $azureAdAppPrereq.InstallMethod = "Manual"
    $azureAdAppPrereq.ValidationCommand = "Test-AzureADAppRegistration"
    $azureAdAppPrereq.InstallCommand = "New-AzureADAppRegistration"
    $prereqChecker.AddPrerequisite($azureAdAppPrereq)

    # Graph API Connectivity
    $graphConnectivityPrereq = New-Prerequisite `
        -Name "Graph-API-Connectivity" `
        -Description "Network connectivity to Microsoft Graph API endpoints for license operations" `
        -IsRequired $true

    $graphConnectivityPrereq.InstallMethod = "Information"
    $graphConnectivityPrereq.ValidationCommand = "Test-GraphAPIConnectivity"
    $prereqChecker.AddPrerequisite($graphConnectivityPrereq)

    # Required Graph API Permissions
    $graphPermissionsPrereq = New-Prerequisite `
        -Name "Graph-API-Permissions" `
        -Description "Required Microsoft Graph API permissions: User.ReadWrite.All, Directory.ReadWrite.All, Organization.Read.All, LicenseAssignment.ReadWrite.All" `
        -IsRequired $true

    $graphPermissionsPrereq.InstallMethod = "Manual"
    $graphPermissionsPrereq.ValidationCommand = "Test-GraphAPIPermissions"
    $prereqChecker.AddPrerequisite($graphPermissionsPrereq)

    # Target Tenant Credentials
    $targetCredentialsPrereq = New-Prerequisite `
        -Name "Target-Tenant-Credentials" `
        -Description "Valid credentials (Client ID/Secret or Certificate) for target Microsoft 365 tenant" `
        -IsRequired $true

    $targetCredentialsPrereq.InstallMethod = "Manual"
    $targetCredentialsPrereq.ValidationCommand = "Test-TargetTenantCredentials"
    $prereqChecker.AddPrerequisite($targetCredentialsPrereq)

    # Administrator Consent
    $adminConsentPrereq = New-Prerequisite `
        -Name "Admin-Consent-Granted" `
        -Description "Administrator consent granted for required Graph API permissions in target tenant" `
        -IsRequired $true

    $adminConsentPrereq.InstallMethod = "Manual"
    $adminConsentPrereq.ValidationCommand = "Test-AdminConsentStatus"
    $prereqChecker.AddPrerequisite($adminConsentPrereq)

    # License Management Permissions
    $licensePermissionsPrereq = New-Prerequisite `
        -Name "License-Management-Permissions" `
        -Description "User account or service principal has license administrator role in target tenant" `
        -IsRequired $true

    $licensePermissionsPrereq.InstallMethod = "Manual"
    $licensePermissionsPrereq.ValidationCommand = "Test-LicenseManagementPermissions"
    $prereqChecker.AddPrerequisite($licensePermissionsPrereq)

    return $prereqChecker
}

function Test-AdministratorPrivileges {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if ($isAdmin) {
        Write-PrerequisitesLog "Running with administrator privileges" -Level "SUCCESS"
        return @{
            Installed = $true
            Status = "Administrator"
            Version = ""
        }
    } else {
        Write-PrerequisitesLog "Not running with administrator privileges - some installations may fail" -Level "WARN"
        return @{
            Installed = $false
            Status = "Standard User"
            Version = ""
        }
    }
}

function Test-WindowsCompatibility {
    try {
        $osInfo = Get-WmiObject -Class Win32_OperatingSystem -ErrorAction Stop
        $buildNumber = [int]$osInfo.BuildNumber

        if ($buildNumber -ge 17763) { # Windows 10 1809 or Windows 11
            Write-PrerequisitesLog "Windows $($osInfo.Caption) (Build $buildNumber) supports RSAT installation" -Level "SUCCESS"
            return @{
                Installed = $true
                Status = "Compatible"
                Version = $osInfo.Version
            }
        } else {
            Write-PrerequisitesLog "Windows $($osInfo.Caption) (Build $buildNumber) - RSAT installation not recommended. Consider upgrading." -Level "WARN"
            return @{
                Installed = $false
                Status = "Legacy Version"
                Version = $osInfo.Version
            }
        }
    } catch {
        Write-PrerequisitesLog "Could not determine Windows version: $($_.Exception.Message)" -Level "ERROR"
        return @{
            Installed = $false
            Status = "Unknown"
            Version = "Unknown"
        }
    }
}

function Install-ActiveDirectoryModule {
    [CmdletBinding()]
    param(
        [switch]$Force,
        [switch]$Interactive
    )

    Write-PrerequisitesLog "Installing RSAT: Active Directory PowerShell module..." -Level "INFO"

    # Test current status
    $status = Test-PowerShellModule -ModuleName "ActiveDirectory"
    if ($status.Installed) {
        Write-PrerequisitesLog "Active Directory module is already installed" -Level "SUCCESS"
        return @{
            Success = $true
            Installed = $true
            Message = "Already installed"
        }
    }

    # Check if running as administrator
    if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-PrerequisitesLog "Administrator privileges required for RSAT installation" -Level "ERROR"
        return @{
            Success = $false
            Installed = $false
            Message = "Administrator privileges required"
        }
    }

    try {
        # Try Windows 10/11 RSAT installation
        Write-PrerequisitesLog "Attempting Windows 10/11 RSAT installation..." -Level "INFO"

        # First, check if DISM is available
        if (Get-Command dism.exe -ErrorAction SilentlyContinue) {
            $capabilityName = "Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0"
            Write-PrerequisitesLog "Installing RSAT capability: $capabilityName" -Level "INFO"

            $result = dism.exe /online /Get-CapabilityInfo /CapabilityName:$capabilityName 2>&1
            if ($LASTEXITCODE -eq 0) {
                # Install the capability
                $installResult = dism.exe /online /Add-Capability /CapabilityName:$capabilityName /Quiet /NoRestart 2>&1

                if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 3010) { # 3010 = reboot required
                    # Wait for module to be registered
                    Start-Sleep -Seconds 5

                    # Test if installation worked
                    $testResult = Test-PowerShellModule -ModuleName "ActiveDirectory"
                    if ($testResult.Installed) {
                        Write-PrerequisitesLog "RSAT Active Directory module installed successfully" -Level "SUCCESS"
                        return @{
                            Success = $true
                            Installed = $true
                            Message = "Installed via DISM"
                        }
                    }
                }
            }
        }

        # Try PowerShell Get-WindowsCapability method
        if (Get-Command Get-WindowsCapability -ErrorAction SilentlyContinue) {
            Write-PrerequisitesLog "Trying Get-WindowsCapability installation method..." -Level "INFO"

            $capability = Get-WindowsCapability -Name "Rsat.ActiveDirectory*" -Online -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($capability -and $capability.State -ne "Installed") {
                $installResult = $capability | Add-WindowsCapability -Online -ErrorAction Stop

                if ($installResult.RestartNeeded) {
                    Write-PrerequisitesLog "RSAT installation completed but reboot required" -Level "WARN"
                }

                # Check if installation worked
                $capabilityAfter = Get-WindowsCapability -Name $capability.Name -Online -ErrorAction SilentlyContinue
                if ($capabilityAfter.State -eq "Installed") {
                    Write-PrerequisitesLog "RSAT Active Directory capability installed successfully" -Level "SUCCESS"
                    return @{
                        Success = $true
                        Installed = $true
                        Message = "Installed via Add-WindowsCapability"
                        RestartNeeded = $installResult.RestartNeeded
                    }
                }
            }
        }

        # Try alternative capabilities
        $alternativeCapabilities = @(
            "Rsat.ActiveDirectory.DS-LDS.Tools",
            "Rsat.ServerManager.Tools",
            "Rsat.GroupPolicy.Management.Tools"
        )

        foreach ($capName in $alternativeCapabilities) {
            if (Get-Command Get-WindowsCapability -ErrorAction SilentlyContinue) {
                $cap = Get-WindowsCapability -Name "*$capName*" -Online -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($cap -and $cap.State -ne "Installed") {
                    try {
                        $installResult = $cap | Add-WindowsCapability -Online
                        if (-not $installResult.RestartNeeded) {
                            $testResult = Test-PowerShellModule -ModuleName "ActiveDirectory"
                            if ($testResult.Installed) {
                                Write-PrerequisitesLog "RSAT installed successfully using alternative capability: $($cap.Name)" -Level "SUCCESS"
                                return @{
                                    Success = $true
                                    Installed = $true
                                    Message = "Installed via $capName"
                                    RestartNeeded = $installResult.RestartNeeded
                                }
                            }
                        }
                    } catch {
                        Write-PrerequisitesLog "Failed to install alternative capability '$capName': $($_.Exception.Message)" -Level "WARN"
                    }
                }
            }
        }

        # If all else fails, provide manual installation instructions
        Write-PrerequisitesLog "Automatic RSAT installation failed. You may need to install manually." -Level "ERROR"
        Write-PrerequisitesLog "Manual installation options:" -Level "INFO"
        Write-PrerequisitesLog "  1. Windows 11: Add/Remove Programs > Optional Features > RSAT: Active Directory Domain Services Tools" -Level "INFO"
        Write-PrerequisitesLog "  2. Windows 10: Download and install RSAT from Microsoft Download Center" -Level "INFO"
        Write-PrerequisitesLog "  3. Enterprise environments: Install via WSUS or SCCM" -Level "INFO"

        return @{
            Success = $false
            Installed = $false
            Message = "Installation failed - manual installation required"
            ManualInstructions = "Follow Windows Optional Features installation or download from Microsoft"
        }

    } catch {
        Write-PrerequisitesLog "RSAT installation failed with error: $($_.Exception.Message)" -Level "ERROR"

        # Provide specific error handling
        if ($_.Exception.Message -contains "0x800f0954") {
            Write-PrerequisitesLog "Error indicates RSAT is not available in this Windows build. Consider upgrading Windows or using another machine with Active Directory access." -Level "ERROR"
        } elseif ($_.Exception.Message -contains "3010") {
            Write-PrerequisitesLog "RSAT installation completed but system restart is required" -Level "WARN"
            return @{
                Success = $true
                Installed = $false
                Message = "Restart required to complete installation"
                RestartNeeded = $true
            }
        }

        return @{
            Success = $false
            Installed = $false
            Message = "Installation failed: $($_.Exception.Message)"
            ErrorDetails = $_.Exception.Message
        }
    }
}

# Main prerequisite checking function
function Invoke-PrerequisitesCheck {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$ModuleName = "All",

        [Parameter(Mandatory=$false)]
        [switch]$Install,

        [Parameter(Mandatory=$false)]
        [switch]$Interactive
    )

    Write-PrerequisitesLog "=== Prerequisites Check Started ===" -Level "HEADER"
    Write-PrerequisitesLog "Module: $ModuleName" -Level "INFO"

    $results = @{
        OverallSuccess = $true
        Prerequisites = @()
        Warnings = @()
        Errors = @()
        Installed = @()
    }

    try {
        # Create prerequisites checker based on module
        $prereqChecker = $null

        switch ($ModuleName) {
            {$_ -in @("MultiDomainForestDiscovery", "ActiveDirectoryDiscovery", "All")} {
                Write-PrerequisitesLog "Checking Active Directory prerequisites..." -Level "INFO"
                $prereqChecker = New-ActiveDirectoryPrerequisites
            }
            {$_ -in @("InfrastructureDiscovery", "NetworkDiscovery", "All")} {
                Write-PrerequisitesLog "Checking Infrastructure Discovery prerequisites..." -Level "INFO"
                $prereqChecker = New-InfrastructureDiscoveryPrerequisites
            }
            {$_ -in @("LicenseAssignment", "LicenseCompliance", "Migration", "ConditionalAccessDiscovery", "All")} {
                Write-PrerequisitesLog "Checking License Assignment and Compliance prerequisites..." -Level "INFO"
                $prereqChecker = New-LicenseAssignmentPrerequisites
            }
            default {
                Write-PrerequisitesLog "No specific prerequisites defined for module '$ModuleName'" -Level "WARN"
                return $results
            }
        }

        if (-not $prereqChecker) {
            Write-PrerequisitesLog "No prerequisite checker available for module '$ModuleName'" -Level "ERROR"
            $results.OverallSuccess = $false
            $results.Errors += "No prerequisite checker available for module '$ModuleName'"
            return $results
        }
    } catch {
        Write-PrerequisitesLog "Failed to create prerequisite checker: $($_.Exception.Message)" -Level "ERROR"
        $results.OverallSuccess = $false
        $results.Errors += "Failed to create prerequisite checker: $($_.Exception.Message)"
        return $results
    }

    # Run validation for each prerequisite
    foreach ($prereq in $prereqChecker.GetAllPrerequisites()) {
        Write-PrerequisitesLog "Checking prerequisite: $($prereq.Name)" -Level "INFO"

        # Execute validation command
        if ($prereq.ValidationCommand) {
            try {
                $validationResult = Invoke-Expression $prereq.ValidationCommand

                $prereq.IsInstalled = $validationResult.Installed
                $prereq.Status = $validationResult.Status
                $prereq.Version = $validationResult.Version

                if ($validationResult.Installed) {
                    Write-PrerequisitesLog "✓ $($prereq.Name) - OK" -Level "SUCCESS"
                    $results.Installed += $prereq
                } else {
                    if ($prereq.IsRequired) {
                        $results.Errors += $prereq
                        Write-PrerequisitesLog "✗ $($prereq.Name) - REQUIRED but missing: $($prereq.Status)" -Level "ERROR"
                        $results.OverallSuccess = $false

                        if ($Install) {
                            # Try auto-installation
                            Write-PrerequisitesLog "Attempting automatic installation of $($prereq.Name)..." -Level "INFO"

                            if ($prereq.InstallCommand) {
                                $installResult = Invoke-Expression $prereq.InstallCommand

                                if ($installResult.Success) {
                                    $prereq.IsInstalled = $true
                                    $prereq.Status = "Installed"
                                    Write-PrerequisitesLog "✓ $($prereq.Name) - INSTALLED automatically" -Level "SUCCESS"
                                    $results.Installed += $prereq
                                    $results.Errors = $results.Errors | Where-Object { $_.Name -ne $prereq.Name }
                                } else {
                                    Write-PrerequisitesLog "✗ $($prereq.Name) - Installation failed: $($installResult.Message)" -Level "ERROR"
                                }
                            } else {
                                Write-PrerequisitesLog "No installation command defined for $($prereq.Name)" -Level "WARN"
                            }
                        }
                    } else {
                        Write-PrerequisitesLog "! $($prereq.Name) - Optional but missing: $($prereq.Status)" -Level "WARN"
                        $results.Warnings += $prereq
                    }
                }
            } catch {
                Write-PrerequisitesLog "Failed to validate $($prereq.Name): $($_.Exception.Message)" -Level "ERROR"
                $results.Errors += $prereq
                if ($prereq.IsRequired) {
                    $results.OverallSuccess = $false
                }
            }
        }

        $results.Prerequisites += $prereq
    }

    # Summary
    Write-PrerequisitesLog "=== Prerequisites Check Summary ===" -Level "HEADER"
    Write-PrerequisitesLog "Total prerequisites checked: $($results.Prerequisites.Count)" -Level "INFO"
    Write-PrerequisitesLog "Installed: $($results.Installed.Count)" -Level "SUCCESS"
    Write-PrerequisitesLog "Warnings: $($results.Warnings.Count)" -Level "WARN"
    Write-PrerequisitesLog "Errors: $($results.Errors.Count)" -Level "ERROR"
    Write-PrerequisitesLog "Overall result: $(if ($results.OverallSuccess) { 'PASS' } else { 'FAIL' })" -Level "HEADER"

    Write-PrerequisitesLog "=== Prerequisites Check Complete ===" -Level "HEADER"

    return $results
}

# Enhanced nmap prerequisite functions integrating with InfrastructureDiscovery capabilities
function Test-NmapInstallation {
    <#
    .SYNOPSIS
        Tests for nmap installation and capabilities
    .DESCRIPTION
        Comprehensive nmap detection using the same logic as InfrastructureDiscovery module.
        Checks for system installations, validates functionality, and reports capabilities.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [switch]$IncludeFunctionalityTest
    )

    Write-PrerequisitesLog "🔍 Testing nmap installation and capabilities..." -Level "INFO"

    try {
        # PRIORITY 1: Check if system-installed nmap is available in PATH (preferred for performance)
        $nmapPath = Get-Command nmap -ErrorAction SilentlyContinue
        if ($nmapPath) {
            try {
                $versionOutput = & $nmapPath.Source --version 2>$null
                if ($versionOutput -match 'Nmap version ([0-9]+\.[0-9]+)') {
                    Write-PrerequisitesLog "✅ Found system nmap in PATH: $($nmapPath.Source) (v$($matches[1]))" -Level "SUCCESS"

                    $nmapResult = @{
                        Installed = $true
                        Version = $matches[1]
                        Path = $nmapPath.Source
                        InstallationType = "System-PATH"
                        Status = "Functional system installation found"
                        Capabilities = "Full nmap capabilities available"
                    }

                    if ($IncludeFunctionalityTest) {
                        $nmapResult.FunctionalityTest = Test-NmapFunctionality -NmapPath $nmapPath.Source
                    }

                    return $nmapResult
                }
            } catch {
                Write-PrerequisitesLog "nmap in PATH failed version test: $($_.Exception.Message)" -Level "DEBUG"
            }
        }

        # PRIORITY 2: Check common system installation paths
        $commonPaths = @(
            "${env:ProgramFiles}\Nmap\nmap.exe",
            "${env:ProgramFiles(x86)}\Nmap\nmap.exe",
            "C:\Program Files\Nmap\nmap.exe",
            "C:\Program Files (x86)\Nmap\nmap.exe",
            "${env:LOCALAPPDATA}\Programs\Nmap\nmap.exe",
            "C:\Tools\Nmap\nmap.exe"
        )

        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                try {
                    $versionOutput = & $path --version 2>$null
                    if ($versionOutput -match 'Nmap version ([0-9]+\.[0-9]+)') {
                        Write-PrerequisitesLog "✅ Found system nmap at: $path (v$($matches[1]))" -Level "SUCCESS"

                        $nmapResult = @{
                            Installed = $true
                            Version = $matches[1]
                            Path = $path
                            InstallationType = "System-Direct"
                            Status = "Functional system installation found"
                            Capabilities = "Full nmap capabilities available"
                        }

                        if ($IncludeFunctionalityTest) {
                            $nmapResult.FunctionalityTest = Test-NmapFunctionality -NmapPath $path
                        }

                        return $nmapResult
                    }
                } catch {
                    Write-PrerequisitesLog "nmap at $path failed version test: $($_.Exception.Message)" -Level "DEBUG"
                }
            }
        }

        # PRIORITY 3: Check for embedded nmap in application directory
        $embeddedPaths = @(
            "$PSScriptRoot\..\..\Tools\nmap\nmap.exe",
            "$PSScriptRoot\..\..\..\Tools\nmap\nmap.exe",
            "C:\enterprisediscovery\Tools\nmap\nmap.exe",
            "C:\Tools\nmap\nmap.exe"
        )

        foreach ($embeddedPath in $embeddedPaths) {
            if (Test-Path $embeddedPath) {
                try {
                    $versionOutput = & $embeddedPath --version 2>$null
                    if ($versionOutput -match 'Nmap version ([0-9]+\.[0-9]+)') {
                        Write-PrerequisitesLog "✅ Found embedded nmap: $embeddedPath (v$($matches[1]))" -Level "SUCCESS"

                        $nmapResult = @{
                            Installed = $true
                            Version = $matches[1]
                            Path = $embeddedPath
                            InstallationType = "Embedded"
                            Status = "Embedded installation found"
                            Capabilities = "Basic nmap capabilities available"
                            Recommendation = "Consider installing system nmap for better performance and full capabilities"
                        }

                        if ($IncludeFunctionalityTest) {
                            $nmapResult.FunctionalityTest = Test-NmapFunctionality -NmapPath $embeddedPath
                        }

                        return $nmapResult
                    }
                } catch {
                    Write-PrerequisitesLog "Embedded nmap at $embeddedPath failed test: $($_.Exception.Message)" -Level "DEBUG"
                }
            }
        }

        # No nmap found
        Write-PrerequisitesLog "⚠️ No functional nmap installation found" -Level "WARN"
        return @{
            Installed = $false
            Version = ""
            Path = ""
            InstallationType = "None"
            Status = "No nmap installation detected"
            Capabilities = "None - PowerShell alternatives will be used"
            Recommendation = "Install nmap for enhanced network scanning capabilities"
        }

    } catch {
        Write-PrerequisitesLog "❌ nmap detection failed: $($_.Exception.Message)" -Level "ERROR"
        return @{
            Installed = $false
            Version = ""
            Path = ""
            InstallationType = "Error"
            Status = "Detection failed: $($_.Exception.Message)"
            Capabilities = "Unknown - detection error occurred"
        }
    }
}

function Test-NmapFunctionality {
    <#
    .SYNOPSIS
        Tests nmap functionality with a safe test scan
    .DESCRIPTION
        Performs a minimal functionality test of nmap installation
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$NmapPath
    )

    try {
        # Test basic functionality with a safe local scan
        $testResult = & $NmapPath -sn -T1 127.0.0.1 2>$null
        if ($testResult) {
            return @{
                Success = $true
                Result = "Basic scanning functionality confirmed"
                TestType = "Local ping scan (-sn 127.0.0.1)"
            }
        } else {
            return @{
                Success = $false
                Result = "Basic scan test failed - no output returned"
                TestType = "Local ping scan (-sn 127.0.0.1)"
            }
        }
    } catch {
        return @{
            Success = $false
            Result = "Functionality test failed: $($_.Exception.Message)"
            TestType = "Local ping scan (-sn 127.0.0.1)"
        }
    }
}

function Install-NmapPrerequisite {
    <#
    .SYNOPSIS
        Installs nmap using silent installation methods
    .DESCRIPTION
        Attempts to install nmap using the same silent installation logic as InfrastructureDiscovery.
        Includes npcap installation and verification.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [switch]$Force,

        [Parameter(Mandatory=$false)]
        [switch]$Interactive = $false
    )

    Write-PrerequisitesLog "Installing nmap..." -Level "INFO"

    try {
        # Check if already installed
        $existingInstall = Test-NmapInstallation
        if ($existingInstall.Installed -and -not $Force) {
            Write-PrerequisitesLog "nmap already installed at: $($existingInstall.Path) (v$($existingInstall.Version))" -Level "SUCCESS"
            return @{
                Success = $true
                Installed = $true
                Message = "nmap already installed"
                Path = $existingInstall.Path
                Version = $existingInstall.Version
            }
        }

        # Check administrator privileges
        $adminCheck = Test-AdministratorPrivileges
        if (-not $adminCheck.Installed) {
            Write-PrerequisitesLog "Administrator privileges required for nmap installation" -Level "ERROR"
            return @{
                Success = $false
                Installed = $false
                Message = "Administrator privileges required"
                RequiresElevation = $true
            }
        }

        # Create temporary directory for installers
        $tempDir = Join-Path $env:TEMP "nmap-install-$(Get-Random)"
        if (-not (Test-Path $tempDir)) {
            New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
        }

        Write-PrerequisitesLog "Created temporary directory: $tempDir" -Level "DEBUG"

        # Download nmap installer
        $nmapVersion = "7.94"
        $downloadUrls = @(
            "https://nmap.org/dist/nmap-$nmapVersion-setup.exe",
            "https://github.com/nmap/nmap/releases/download/v$nmapVersion/nmap-$nmapVersion-setup.exe"
        )

        $installerPath = "$tempDir\nmap-setup.exe"
        $downloadSuccess = $false

        foreach ($url in $downloadUrls) {
            try {
                Write-PrerequisitesLog "Downloading nmap installer from: $url" -Level "INFO"
                Invoke-WebRequest -Uri $url -OutFile $installerPath -UseBasicParsing -TimeoutSec 30

                if (Test-Path $installerPath -PathType Leaf) {
                    $fileSize = (Get-Item $installerPath).Length
                    if ($fileSize -gt 1024) {
                        Write-PrerequisitesLog "Downloaded nmap installer successfully ($fileSize bytes)" -Level "SUCCESS"
                        $downloadSuccess = $true
                        break
                    }
                }
            } catch {
                Write-PrerequisitesLog "Failed to download from $url : $($_.Exception.Message)" -Level "WARN"
            }
        }

        if (-not $downloadSuccess) {
            Write-PrerequisitesLog "Failed to download nmap installer from all sources" -Level "ERROR"
            return @{ Success = $false; Installed = $false; Message = "Download failed" }
        }

        # Download npcap installer (required for nmap functionality)
        $npcapUrl = "https://npcap.com/dist/npcap-1.79.exe"
        $npcapPath = "$tempDir\npcap-setup.exe"

        try {
            Write-PrerequisitesLog "Downloading npcap installer..." -Level "INFO"
            Invoke-WebRequest -Uri $npcapUrl -OutFile $npcapPath -UseBasicParsing -TimeoutSec 30
            Write-PrerequisitesLog "Downloaded npcap installer successfully" -Level "SUCCESS"
        } catch {
            Write-PrerequisitesLog "Failed to download npcap - nmap functionality may be limited" -Level "WARN"
        }

        # Install npcap first (if downloaded)
        if (Test-Path $npcapPath) {
            Write-PrerequisitesLog "Installing npcap driver..." -Level "INFO"
            try {
                $npcapProcess = Start-Process -FilePath $npcapPath -ArgumentList "/S", "/winpcap_mode=yes" -Wait -PassThru -WindowStyle Hidden
                if ($npcapProcess.ExitCode -eq 0) {
                    Write-PrerequisitesLog "npcap driver installed successfully" -Level "SUCCESS"
                } else {
                    Write-PrerequisitesLog "npcap installation returned exit code: $($npcapProcess.ExitCode)" -Level "WARN"
                }
            } catch {
                Write-PrerequisitesLog "Failed to install npcap: $($_.Exception.Message)" -Level "WARN"
            }
        }

        # Install nmap with silent parameters
        Write-PrerequisitesLog "Installing nmap silently..." -Level "INFO"
        try {
            $nmapProcess = Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait -PassThru -WindowStyle Hidden

            if ($nmapProcess.ExitCode -eq 0) {
                Write-PrerequisitesLog "nmap installed successfully" -Level "SUCCESS"

                # Wait a moment for files to be ready
                Start-Sleep -Seconds 2

                # Verify installation
                $installedNmap = Test-NmapInstallation

                if ($installedNmap.Installed) {
                    Write-PrerequisitesLog "Silent nmap installation completed and verified" -Level "SUCCESS"

                    return @{
                        Success = $true
                        Installed = $true
                        Message = "nmap installed successfully via silent installer"
                        Path = $installedNmap.Path
                        Version = $installedNmap.Version
                        InstallationType = $installedNmap.InstallationType
                    }
                } else {
                    Write-PrerequisitesLog "nmap installation completed but verification failed" -Level "WARN"
                    return @{ Success = $false; Installed = $false; Message = "Installation verification failed" }
                }
            } else {
                Write-PrerequisitesLog "nmap installation failed (exit code: $($nmapProcess.ExitCode))" -Level "ERROR"
                return @{ Success = $false; Installed = $false; Message = "Installation failed with exit code $($nmapProcess.ExitCode)" }
            }
        } catch {
            Write-PrerequisitesLog "Failed to install nmap: $($_.Exception.Message)" -Level "ERROR"
            return @{ Success = $false; Installed = $false; Message = "Installation failed: $($_.Exception.Message)" }
        }
    } finally {
        # Cleanup temporary files
        if (Test-Path $tempDir) {
            try {
                Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
                Write-PrerequisitesLog "Cleaned up temporary files" -Level "DEBUG"
            } catch {
                Write-PrerequisitesLog "Failed to cleanup temporary directory: $($_.Exception.Message)" -Level "WARN"
            }
        }
    }
}

# Export functions
Export-ModuleMember -Function Invoke-PrerequisitesCheck, Write-PrerequisitesLog, New-Prerequisite
Export-ModuleMember -Function Install-ActiveDirectoryModule, Test-AdministratorPrivileges, Test-WindowsCompatibility
Export-ModuleMember -Function Test-PowerShellModule, Test-WindowsFeature, Test-Executable
Export-ModuleMember -Function Test-NmapInstallation, Test-NmapFunctionality, Install-NmapPrerequisite
Export-ModuleMember -Function New-LicenseAssignmentPrerequisites, New-ActiveDirectoryPrerequisites, New-InfrastructureDiscoveryPrerequisites