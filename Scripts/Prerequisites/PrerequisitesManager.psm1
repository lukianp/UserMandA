# -*- coding: utf-8 -*-
#Requires -Version 5.1

# Author: System Enhancement  
# Version: 1.1.0
# Created: 2025-09-02
# Last Modified: 2025-09-02

<#
.SYNOPSIS
    Prerequisites Manager for M&A Discovery Suite
.DESCRIPTION
    Automatically detects, installs, and validates prerequisites for discovery modules.
    Handles RSAT components, PowerShell modules, nmap network scanner, and system dependencies with
    fallback mechanisms and user-friendly installation workflows.
.NOTES
    Version: 1.1.0
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

        [Parameter(Mandatory=$true)]
        [bool]$IsRequired
    )

    return [PrerequisiteCheck]::new($Name, $Description, $IsRequired)
}

# Logging function
function Write-PrerequisitesLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "SUCCESS", "WARN", "ERROR", "HEADER")]
        [string]$Level = "INFO"
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $color = switch ($Level) {
        'SUCCESS' { 'Green' }
        'WARN' { 'Yellow' }
        'ERROR' { 'Red' }
        'HEADER' { 'Cyan' }
        default { 'White' }
    }

    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Test function for PowerShell modules
function Test-PowerShellModule {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName
    )

    try {
        $module = Get-Module -Name $ModuleName -ListAvailable -ErrorAction SilentlyContinue

        if ($module) {
            $moduleVersion = $module | Sort-Object Version -Descending | Select-Object -First 1
            Write-PrerequisitesLog "Found PowerShell module '$ModuleName' version $($moduleVersion.Version)" -Level "SUCCESS"
            
            return @{
                Installed = $true
                Version = $moduleVersion.Version.ToString()
                Status = "Module available"
            }
        } else {
            Write-PrerequisitesLog "PowerShell module '$ModuleName' not found" -Level "WARN"
            
            return @{
                Installed = $false
                Version = ""
                Status = "Module not found"
            }
        }
    } catch {
        Write-PrerequisitesLog "Failed to check PowerShell module '$ModuleName': $($_.Exception.Message)" -Level "ERROR"
        
        return @{
            Installed = $false
            Version = ""
            Status = "Check failed: $($_.Exception.Message)"
        }
    }
}

# Test administrator privileges
function Test-AdministratorPrivileges {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if ($isAdmin) {
        Write-PrerequisitesLog "Running with administrator privileges" -Level "SUCCESS"
        return @{
            Installed = $true
            Version = "Administrator"
            Status = "Running as administrator"
        }
    } else {
        Write-PrerequisitesLog "Not running with administrator privileges" -Level "WARN"
        return @{
            Installed = $false
            Version = ""
            Status = "Administrator privileges required"
        }
    }
}

# Test Windows compatibility
function Test-WindowsCompatibility {
    try {
        $osInfo = Get-WmiObject -Class Win32_OperatingSystem
        $buildNumber = [int]$osInfo.BuildNumber

        # Windows 10 = 10240+, Windows 11 = 22000+, Server 2016+ = 14393+
        if ($buildNumber -ge 10240) {
            $compatible = $true
            $version = "$($osInfo.Caption) (Build $buildNumber)"
            $status = "Compatible Windows version"
        } else {
            $compatible = $false
            $version = "$($osInfo.Caption) (Build $buildNumber)"
            $status = "Older Windows version - may have compatibility issues"
        }

        return @{
            Installed = $compatible
            Version = $version
            Status = $status
        }
    } catch {
        return @{
            Installed = $false
            Version = ""
            Status = "Could not determine Windows version"
        }
    }
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
                if ($versionOutput -match "Nmap version (\d+\.\d+)") {
                    Write-PrerequisitesLog "✅ Found system nmap in PATH: $($nmapPath.Source) (v$($matches[1]))" -Level "SUCCESS"
                    
                    $result = @{
                        Installed = $true
                        Version = $matches[1]
                        Path = $nmapPath.Source
                        InstallationType = "System-PATH"
                        Status = "Functional system installation found"
                        Capabilities = "Full nmap capabilities available"
                    }
                    
                    if ($IncludeFunctionalityTest) {
                        $result.FunctionalityTest = Test-NmapFunctionality -NmapPath $nmapPath.Source
                    }
                    
                    return $result
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
                    if ($versionOutput -match "Nmap version (\d+\.\d+)") {
                        Write-PrerequisitesLog "✅ Found system nmap at: $path (v$($matches[1]))" -Level "SUCCESS"
                        
                        $result = @{
                            Installed = $true
                            Version = $matches[1]
                            Path = $path
                            InstallationType = "System-Direct"
                            Status = "Functional system installation found"
                            Capabilities = "Full nmap capabilities available"
                        }
                        
                        if ($IncludeFunctionalityTest) {
                            $result.FunctionalityTest = Test-NmapFunctionality -NmapPath $path
                        }
                        
                        return $result
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
                    if ($versionOutput -match "Nmap version (\d+\.\d+)") {
                        Write-PrerequisitesLog "✅ Found embedded nmap: $embeddedPath (v$($matches[1]))" -Level "SUCCESS"
                        
                        $result = @{
                            Installed = $true
                            Version = $matches[1]
                            Path = $embeddedPath
                            InstallationType = "Embedded"
                            Status = "Embedded installation found"
                            Capabilities = "Basic nmap capabilities available"
                            Recommendation = "Consider installing system nmap for better performance and full capabilities"
                        }
                        
                        if ($IncludeFunctionalityTest) {
                            $result.FunctionalityTest = Test-NmapFunctionality -NmapPath $embeddedPath
                        }
                        
                        return $result
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

# Install ActiveDirectory module
function Install-ActiveDirectoryModule {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [switch]$Force
    )

    Write-PrerequisitesLog "🔧 Attempting to install RSAT Active Directory module..." -Level "INFO"

    # Check if already installed
    $existingModule = Test-PowerShellModule -ModuleName "ActiveDirectory"
    if ($existingModule.Installed -and -not $Force) {
        Write-PrerequisitesLog "✅ ActiveDirectory module already installed" -Level "SUCCESS"
        return @{
            Success = $true
            Installed = $true
            Message = "Module already installed"
            Version = $existingModule.Version
        }
    }

    # Check administrator privileges
    $adminCheck = Test-AdministratorPrivileges
    if (-not $adminCheck.Installed) {
        Write-PrerequisitesLog "❌ Administrator privileges required for RSAT installation" -Level "ERROR"
        return @{
            Success = $false
            Installed = $false
            Message = "Administrator privileges required"
            RequiresElevation = $true
        }
    }

    try {
        # Try Windows Capability method (Windows 10+)
        if (Get-Command Get-WindowsCapability -ErrorAction SilentlyContinue) {
            Write-PrerequisitesLog "Trying Windows Capability installation method..." -Level "INFO"

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

        Write-PrerequisitesLog "❌ Automatic RSAT installation failed. Manual installation required." -Level "ERROR"
        return @{
            Success = $false
            Installed = $false
            Message = "Installation failed - manual installation required"
            ManualInstructions = "Follow Windows Optional Features installation or download from Microsoft"
        }

    } catch {
        Write-PrerequisitesLog "RSAT installation failed with error: $($_.Exception.Message)" -Level "ERROR"
        return @{
            Success = $false
            Installed = $false
            Message = "Installation failed: $($_.Exception.Message)"
        }
    }
}

# Create Active Directory prerequisites
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
        -Description "Windows 10/11 or Server 2016+ for RSAT support" `
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

# Main prerequisites check function
function Invoke-PrerequisitesCheck {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,

        [Parameter(Mandatory=$false)]
        [switch]$Install,

        [Parameter(Mandatory=$false)]
        [switch]$Interactive = $true
    )

    Write-PrerequisitesLog "=== Starting Prerequisites Check for $ModuleName ===" -Level "HEADER"

    $results = @{
        OverallSuccess = $true
        Prerequisites = @()
        Installed = @()
        Warnings = @()
        Errors = @()
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
            default {
                Write-PrerequisitesLog "No specific prerequisites defined for module '$ModuleName'" -Level "WARN"
                return $results
            }
        }

        # Check each prerequisite
        foreach ($prereq in $prereqChecker.GetAllPrerequisites()) {
            Write-PrerequisitesLog "Checking: $($prereq.Name)" -Level "INFO"

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

                            # Try installation if requested
                            if ($Install -and $prereq.InstallCommand) {
                                Write-PrerequisitesLog "Attempting installation: $($prereq.InstallCommand)" -Level "INFO"
                                
                                try {
                                    $installResult = Invoke-Expression $prereq.InstallCommand

                                    if ($installResult.Success) {
                                        $prereq.IsInstalled = $true
                                        $prereq.Status = "Installed"
                                        Write-PrerequisitesLog "✓ $($prereq.Name) - INSTALLED automatically" -Level "SUCCESS"
                                    } else {
                                        Write-PrerequisitesLog "✗ $($prereq.Name) - Installation failed: $($installResult.Message)" -Level "ERROR"
                                    }
                                } catch {
                                    Write-PrerequisitesLog "✗ Installation failed: $($_.Exception.Message)" -Level "ERROR"
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

    } catch {
        Write-PrerequisitesLog "Prerequisites check failed with error: $($_.Exception.Message)" -Level "ERROR"
        $results.OverallSuccess = $false
        $results.Errors += "Prerequisites check failed: $($_.Exception.Message)"
    }

    Write-PrerequisitesLog "=== Prerequisites Check Complete ===" -Level "HEADER"

    return $results
}

# Export functions
Export-ModuleMember -Function Invoke-PrerequisitesCheck, Write-PrerequisitesLog, New-Prerequisite
Export-ModuleMember -Function Install-ActiveDirectoryModule, Test-AdministratorPrivileges, Test-WindowsCompatibility
Export-ModuleMember -Function Test-PowerShellModule, Test-NmapInstallation, Test-NmapFunctionality