<#
.SYNOPSIS
    Checks the availability, version, and basic integrity of PowerShell modules required 
    or recommended for the M&A Discovery Suite. Focuses on main Microsoft Graph modules.
.DESCRIPTION
    This script iterates through a predefined list of PowerShell modules,
    checks if they are installed, compares their version against a minimum expected version,
    attempts to import them, and reports their status.
    It can attempt to install or update modules from the PowerShell Gallery.
.PARAMETER ModuleName
    Optional. An array of specific module names to check. If not provided, all predefined modules are checked.
.PARAMETER AutoFix
    Optional. Switch to attempt automatic installation or update of modules from PSGallery
    that are missing or below the required version. Uses -Force with Install-Module.
    If -AutoFix is used without -Silent, it will still prompt for each module installation via ShouldProcess.
.PARAMETER Silent
    Optional. Switch to suppress individual confirmation prompts when -AutoFix is also used.
    Effectively makes -AutoFix non-interactive for PSGallery module installations.
.NOTES
    Version: 2.0.1
    Author: Gemini & User
    Date: 2025-06-01

    Instructions:
    1. Run this script on the machine where you intend to run the M&A Discovery Suite.
    2. Review the output for any errors or warnings. CRITICAL errors for required modules
       will prevent parts of the M&A Discovery Suite from functioning correctly.
    3. RSAT tools (ActiveDirectory, GroupPolicy) must be installed via Windows Features and are NOT auto-fixed.
.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1
    Runs the dependency check. Will prompt before attempting to install/update any PSGallery modules.

.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1 -AutoFix
    Runs the check. Will prompt via ShouldProcess for each PSGallery module it intends to install/update with -Force.

.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1 -AutoFix -Silent
    Runs the check and attempts to install/update PSGallery modules with -Force and without individual prompts.
.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1 -ModuleName "Microsoft.Graph.Users", "Az.Accounts"
    Checks only the specified modules.
#>

[CmdletBinding(SupportsShouldProcess = $true)] 
param(
    [Parameter(Mandatory = $false)]
    [string[]]$ModuleName,

    [Parameter(Mandatory = $false)]
    [switch]$AutoFix,

    [Parameter(Mandatory = $false)]
    [switch]$Silent # New parameter for non-interactive AutoFix
)

#region Configuration
# Ensure $global:MandA and $global:MandA.Config are available.
# This script is often called by QuickStart, which sources Set-SuiteEnvironment.
if ($null -eq $global:MandA -or $null -eq $global:MandA.Config) {
    Write-Warning "Global configuration `$global:MandA.Config` not found. Attempting to load default config. Paths might be incorrect if not run via QuickStart."
    $PSScriptRootDiscoveryModuleCheck = $PSScriptRoot # Capture current PSScriptRoot
    if ($null -eq $PSScriptRootDiscoveryModuleCheck) { $PSScriptRootDiscoveryModuleCheck = Split-Path $MyInvocation.MyCommand.Definition -Parent}

    $standaloneConfigPath = Join-Path $PSScriptRootDiscoveryModuleCheck "..Configuration\default-config.json"
    if (Test-Path $standaloneConfigPath) {
        try {
            $script:StandaloneConfig = Get-Content $standaloneConfigPath | ConvertFrom-Json
        } catch {
            Write-Error "Failed to load standalone config: $($_.Exception.Message). Module versions from config will not be used."
            $script:StandaloneConfig = $null
        }
    } else {
        Write-Warning "Standalone config not found at $standaloneConfigPath"
        $script:StandaloneConfig = $null
    }
}

$configModules = $null
if ($null -ne $global:MandA.Config.discovery.powershellModules) { 
    $configModules = $global:MandA.Config.discovery.powershellModules
} elseif ($null -ne $script:StandaloneConfig.discovery.powershellModules) {
    $configModules = $script:StandaloneConfig.discovery.powershellModules
}

Function Get-ModuleDefinition {
    param ([string]$Name, [string]$DefaultVersion, [string]$Category, [string]$Notes, [bool]$IsRSAT = $false)
    $reqVersion = $DefaultVersion
    $effectiveNotes = $Notes
    if ($null -ne $configModules) {
        # Accessing nested properties in PowerShell requires checking existence at each level
        if ($configModules.PSObject.Properties[$Name] -and $configModules.$Name.PSObject.Properties['RequiredVersion']) {
            $reqVersion = $configModules.$Name.RequiredVersion
        }
        if ($configModules.PSObject.Properties[$Name] -and $configModules.$Name.PSObject.Properties['Notes']) {
            $effectiveNotes = $configModules.$Name.Notes
        }
    }
    return @{ Name = $Name; RequiredVersion = $reqVersion; Category = $Category; Notes = $effectiveNotes; IsRSAT = $IsRSAT }
}

$ModulesToCheck = @(
    (Get-ModuleDefinition -Name "Microsoft.Graph.Authentication" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "Essential for all Microsoft Graph API authentication.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Users" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Azure AD user discovery.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Groups" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Azure AD group discovery.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Applications" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Azure AD App Registrations, Enterprise Apps.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Identity.DirectoryManagement" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Directory Roles, Organization Info.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Identity.SignIns" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For user sign-in activity.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Policies" -DefaultVersion "2.10.0" -Category "RECOMMENDED" -Notes "For policy-related discovery (e.g., cross-tenant access). Required by ExternalIdentityDiscovery.") # Added this module
    (Get-ModuleDefinition -Name "Microsoft.Graph.Reports" -DefaultVersion "2.10.0" -Category "RECOMMENDED" -Notes "Required for certain usage reports.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.DeviceManagement" -DefaultVersion "2.10.0" -Category "RECOMMENDED" -Notes "Required for Intune device, policy, and application discovery.")
    (Get-ModuleDefinition -Name "ExchangeOnlineManagement" -DefaultVersion "3.2.0" -Category "CRITICAL REQUIRED" -Notes "For all Exchange Online discovery.")
    
    (Get-ModuleDefinition -Name "ActiveDirectory" -DefaultVersion "1.0.1.0" -Category "CONDITIONALLY REQUIRED" -Notes "For on-premises Active Directory discovery. Install via Windows Features." -IsRSAT $true)
    (Get-ModuleDefinition -Name "DnsServer" -DefaultVersion "2.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For DNS discovery. Install via Windows Features (RSAT)." -IsRSAT $true) 
    (Get-ModuleDefinition -Name "GroupPolicy" -DefaultVersion "1.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For GPO discovery. Install via Windows Features." -IsRSAT $true)

    (Get-ModuleDefinition -Name "Az.Accounts" -DefaultVersion "2.12.0" -Category "CONDITIONALLY REQUIRED" -Notes "For Azure Resource Manager authentication.")
    (Get-ModuleDefinition -Name "Az.Resources" -DefaultVersion "6.5.0" -Category "CONDITIONALLY REQUIRED" -Notes "For Azure Resource discovery.")
    
    (Get-ModuleDefinition -Name "ImportExcel" -DefaultVersion "7.8.5" -Category "OPTIONAL" -Notes "For generating reports in Excel format.")
)

if ($PSBoundParameters.ContainsKey('ModuleName')) {
    Write-Host "Checking only specified modules: $($ModuleName -join ', ')" -ForegroundColor Cyan
    $ModulesToCheck = $ModulesToCheck | Where-Object { $_.Name -in $ModuleName }
}

$Results = [System.Collections.Generic.List[PSObject]]::new()
#endregion Configuration

#region Helper Functions
function Write-SectionHeader {
    param([string]$Header)
    Write-Host "`n"; Write-Host ("-" * ($Header.Length + 4)) -ForegroundColor DarkCyan
    Write-Host "  $Header  " -ForegroundColor Cyan; Write-Host ("-" * ($Header.Length + 4)) -ForegroundColor DarkCyan
}

function Install-OrUpdateModuleViaPSGallery {
    [CmdletBinding(SupportsShouldProcess = $true)] 
    param(
        [Parameter(Mandatory = $true)] [string]$ModuleNameForInstall,
        [Parameter(Mandatory = $true)] [version]$ReqVersion,
        [Parameter(Mandatory = $true)] [ref]$ModuleResultToUpdateRef,
        [Parameter(Mandatory = $true)] [bool]$AttemptAutoFix,
        [Parameter(Mandatory = $true)] [bool]$AttemptSilentFix
    )
    
    $installModuleParams = @{
        Name = $ModuleNameForInstall
        MinimumVersion = $ReqVersion.ToString() 
        Scope = "CurrentUser"
        AllowClobber = $true
        AcceptLicense = $true 
        ErrorAction = "Stop"
    }
    if ($AttemptAutoFix) { 
        $installModuleParams.Force = $true 
    }

    $shouldProceedWithInstall = $false
    if ($AttemptAutoFix -and $AttemptSilentFix) {
        $shouldProceedWithInstall = $true
        Write-Host "  Attempting to install/update module '$ModuleNameForInstall' (Silent AutoFix)..." -ForegroundColor Magenta
    } elseif ($AttemptAutoFix) {
        if ($PSCmdlet.ShouldProcess($ModuleNameForInstall, "Install/Update to minimum version $($ReqVersion.ToString()) from PowerShell Gallery (Params: $($installModuleParams | Out-String | ForEach-Object {$_.Trim()}))")) {
            $shouldProceedWithInstall = $true
            Write-Host "  Attempting to install/update module '$ModuleNameForInstall'..." -ForegroundColor Magenta
        } else {
            $ModuleResultToUpdateRef.Value.Notes += " User chose not to proceed with install/update via ShouldProcess prompt."
            Write-Host "  Skipping install/update for '$ModuleNameForInstall' as per user choice." -ForegroundColor Yellow
        }
    } else {
        $ModuleResultToUpdateRef.Value.Notes += " AutoFix not enabled. Manual action required."
        Write-Host "  AutoFix not enabled for '$ModuleNameForInstall'. Manual action required." -ForegroundColor Yellow
        return $false
    }

    if (-not $shouldProceedWithInstall) {
        return $false
    }

    try {
        if (-not (Get-Command Install-Module -ErrorAction SilentlyContinue)) {
            $ModuleResultToUpdateRef.Value.Status = "Install Failed (PowerShellGet Missing)"
            $ModuleResultToUpdateRef.Value.Notes = "Install-Module command not found. Ensure PowerShellGet module is installed."
            Write-Host "  Status: $($ModuleResultToUpdateRef.Value.Status)" -ForegroundColor Red
            Return $false
        }

        $psGallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
        if ($null -eq $psGallery) {
            Write-Warning "PSGallery repository not found. Attempting to register default..."
            try {
                Register-PSRepository -Default -InstallationPolicy Trusted -ErrorAction Stop
                $psGallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
                if ($null -eq $psGallery) {
                    $ModuleResultToUpdateRef.Value.Notes += " PSGallery repository not found and could not be registered. Manual intervention required."
                    Write-Host "  Failed to find or register PSGallery. Module installation will likely fail." -ForegroundColor Red
                } else {
                     Write-Host "  PSGallery repository registered and trusted." -ForegroundColor Green
                }
            } catch {
                 $ModuleResultToUpdateRef.Value.Notes += " Error registering PSGallery: $($_.Exception.Message)"
                 Write-Host "  Error registering PSGallery: $($_.Exception.Message)" -ForegroundColor Red
            }
        } elseif ($psGallery.InstallationPolicy -ne 'Trusted') {
            Write-Host "  PSGallery is not trusted. Attempting to set as trusted..." -ForegroundColor Magenta
            Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -ErrorAction Stop
            Write-Host "  PSGallery set to trusted." -ForegroundColor Green
        }
        
        Install-Module @installModuleParams 
        $ModuleResultToUpdateRef.Value.Notes = "Module installation/update attempted via PSGallery. Re-checking status."
        Write-Host "  Module '$ModuleNameForInstall' install/update command executed." -ForegroundColor Green
        Return $true 
    }
    catch {
        $ModuleResultToUpdateRef.Value.Status = "Install/Update Failed (PSGallery)"
        $ModuleResultToUpdateRef.Value.Notes = "Error during PSGallery install/update: $($_.Exception.Message)"
        Write-Host "  Status: $($ModuleResultToUpdateRef.Value.Status)" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Return $false
    }
}

function Test-SingleModule {
    param(
        [Parameter(Mandatory = $true)] [PSObject]$ModuleInfo,
        [Parameter(Mandatory = $true)] [bool]$AttemptAutoFix,
        [Parameter(Mandatory = $true)] [bool]$AttemptSilentFix
    )

    $moduleNameToCheck = $ModuleInfo.Name
    $moduleCategory = $ModuleInfo.Category
    $reqVersion = [version]$ModuleInfo.RequiredVersion
    $isRSATTool = [bool]$ModuleInfo.IsRSAT

    Write-Host "`nChecking $moduleCategory Module: $moduleNameToCheck (Minimum Expected: $($reqVersion.ToString()))" -ForegroundColor Yellow
    if ($isRSATTool) { Write-Host "  Type: RSAT Tool (Requires Windows Feature installation)" -ForegroundColor DarkCyan }
    if ($ModuleInfo.Notes) { Write-Host "  Notes: $($ModuleInfo.Notes)" -ForegroundColor Gray }

    $moduleResult = [PSCustomObject]@{
        Name = $moduleNameToCheck; Category = $moduleCategory; Status = "Not Checked"; RequiredVersion = $reqVersion.ToString();
        InstalledVersion = "N/A"; Path = "N/A"; Notes = ""; IsRSAT = $isRSATTool
    }

    $attemptedFixThisRun = $false 

    for ($attempt = 1; $attempt -le 2; $attempt++) { 
        $availableModule = Get-Module -ListAvailable -Name $moduleNameToCheck -ErrorAction SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
        
        if ($null -eq $availableModule) {
            $moduleResult.Status = "Not Found"
            $moduleResult.Notes = "Module is not installed or not discoverable in PSModulePath."
            if ($isRSATTool) {
                $moduleResult.Notes += " This is an RSAT tool; install via Windows Features."
            }
            if ($attempt -eq 1) { Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Red }

            if (-not $attemptedFixThisRun -and -not $isRSATTool) { 
                if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) {
                    $attemptedFixThisRun = $true; continue 
                } else { break } 
            } elseif ($isRSATTool) {
                Write-Host "  Action: Manual installation required via Windows Features for '$moduleNameToCheck'." -ForegroundColor Yellow
                break 
            } else { break } 
        } else { 
            $moduleResult.Path = $availableModule.Path
            $installedVersion = $availableModule.Version
            $moduleResult.InstalledVersion = $installedVersion.ToString()

            $statusMsg = if ($attemptedFixThisRun) { "Status after fix attempt: Found" } else { "Status: Found" }
            Write-Host "  $statusMsg (Version: $($moduleResult.InstalledVersion))" -ForegroundColor Green
            
            if ($installedVersion -lt $reqVersion) {
                $moduleResult.Status = "Version Mismatch (Installed: $($moduleResult.InstalledVersion), Minimum Expected: $($moduleResult.RequiredVersion))"
                $moduleResult.Notes = "Installed version is older than minimum expected."
                if ($isRSATTool) { $moduleResult.Notes += " This is an RSAT tool; update via Windows Features." }
                
                if ($attempt -eq 1 -and -not $attemptedFixThisRun) { Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Yellow }
                
                if (-not $attemptedFixThisRun -and -not $isRSATTool) {
                    if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) {
                        $attemptedFixThisRun = $true; continue 
                    } else { break } 
                } elseif ($isRSATTool) {
                    Write-Host "  Action: Manual update/check required for RSAT tool '$moduleNameToCheck'." -ForegroundColor Yellow
                    break 
                } else { break } 
            } else { 
                $moduleResult.Status = "Version OK"
                if (-not $attemptedFixThisRun) { Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Green } 
                
                $importedModule = $null
                try {
                    Write-Host "  Attempting to import module '$moduleNameToCheck'..." -ForegroundColor White
                    $importedModule = Import-Module -Name $moduleNameToCheck -RequiredVersion $installedVersion -Force -PassThru -ErrorAction Stop
                    if ($null -ne $importedModule) {
                        $moduleResult.Status = "Imported Successfully (Version OK)"
                        Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Green
                    } else {
                        $moduleResult.Status = "Import Attempted (No Object Returned, Version OK)"
                        $moduleResult.Notes += " Module import did not return an object; status post-import uncertain."
                        Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Yellow
                    }
                } catch {
                    $moduleResult.Status = "Import Failed (Version OK)"
                    $moduleResult.Notes += " Error during import: $($_.Exception.Message). Module might be corrupt or have unresolved dependencies."
                    Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Red
                } finally {
                    if ($null -ne $importedModule) {
                        try { Remove-Module -Name $moduleNameToCheck -Force -ErrorAction SilentlyContinue }
                        catch { Write-Warning "Could not remove module $moduleNameToCheck after testing: $($_.Exception.Message)" }
                    }
                }
                break 
            }
        }
    } 
    
    if ($moduleResult.Status -eq "Not Checked") { 
        $moduleResult.Status = "Check Incomplete"; $moduleResult.Notes += " Module status could not be fully determined."
    }
    $Results.Add($moduleResult)
}
#endregion Helper Functions

#region Main Script Body
Write-SectionHeader "M&A Discovery Suite - PowerShell Module Dependency Check (v2.0.1)"
Write-Host "This script checks required and optional PowerShell modules."
if ($AutoFix.IsPresent) { 
    if ($Silent.IsPresent) {
        Write-Host "AUTO-FIX MODE (SILENT): Script will attempt to install/update missing/outdated PSGallery modules with -Force and without individual prompts." -ForegroundColor Magenta
    } else {
        Write-Host "AUTO-FIX MODE (INTERACTIVE): Script will prompt via ShouldProcess before attempting to install/update each PSGallery module with -Force." -ForegroundColor Magenta
    }
    Write-Host "RSAT tools (e.g., ActiveDirectory) require manual installation via Windows Features and are NOT auto-fixed." -ForegroundColor Yellow
} else {
    Write-Host "INFO: To attempt automatic installation/updates for PSGallery modules, re-run with -AutoFix. Use -Silent with -AutoFix for non-interactive fixing." -ForegroundColor Cyan
}
Write-Host "An internet connection is required for installations/updates from PSGallery." -ForegroundColor Yellow
Write-Host "Modules are installed/updated for the CurrentUser scope." -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date)"

if ($ModulesToCheck.Count -eq 0) {
    Write-Warning "No modules specified or found in predefined lists to check."
    if ($Host.Name -eq "ConsoleHost") { exit 1 } else { throw "No modules to check." }
}

foreach ($moduleDef in $ModulesToCheck) {
    Test-SingleModule -ModuleInfo $moduleDef -AttemptAutoFix $AutoFix.IsPresent -AttemptSilentFix $Silent.IsPresent
}

Write-SectionHeader "Dependency Check Summary"
$Results | Format-Table -AutoSize -Wrap

$criticalIssues = $Results | Where-Object { 
    ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted (No Object Returned, Version OK)") -and $_.Category -eq "CRITICAL REQUIRED"
}
$otherIssues = $Results | Where-Object { 
    ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted (No Object Returned, Version OK)") -and $_.Category -ne "CRITICAL REQUIRED"
}

$overallSuccess = $true

if ($criticalIssues.Count -eq 0) {
    Write-Host "`nAll CRITICAL REQUIRED PowerShell modules appear to be correctly installed, versioned, and importable." -ForegroundColor Green
    if ($otherIssues.Count -gt 0) {
        Write-Host "However, please review warnings for other module categories, as they might affect specific functionalities." -ForegroundColor Yellow
    }
} else {
    $overallSuccess = $false
    Write-Host "`nERROR: CRITICAL ISSUES FOUND WITH REQUIRED MODULES:" -ForegroundColor Red
    $criticalIssues | ForEach-Object {
        Write-Host ("  - $($_.Name) ($($_.Category)): Status: $($_.Status)." +
            " Installed: $($_.InstalledVersion), Expected: $($_.RequiredVersion). Notes: $($_.Notes)") -ForegroundColor Red
        if ($_.IsRSAT) {
             Write-Host "    ACTION: This is an RSAT tool. Please install/update it via Windows Features." -ForegroundColor Red
        }
    }
    Write-Host "`nPlease address the CRITICAL issues with REQUIRED modules above." -ForegroundColor Red
}

if ($otherIssues.Count -gt 0) {
    Write-Host "`nWARNING: Issue(s) found with CONDITIONALLY REQUIRED or OPTIONAL modules:" -ForegroundColor Yellow
    $otherIssues | ForEach-Object {
        Write-Host ("  - $($_.Name) ($($_.Category)): Status: $($_.Status)." +
            " Installed: $($_.InstalledVersion), Expected: $($_.RequiredVersion). Notes: $($_.Notes)") -ForegroundColor Yellow
         if ($_.IsRSAT) {
             Write-Host "    ACTION: This is an RSAT tool. If needed, please install/update it via Windows Features." -ForegroundColor Yellow
        }
    }
}

Write-Host "`nDependency check finished at $(Get-Date)."
if (-not $overallSuccess -and -not $AutoFix.IsPresent) {
    Write-Host "Consider re-running with the -AutoFix parameter to attempt automatic resolution for PSGallery modules." -ForegroundColor Cyan
}

if (-not $overallSuccess) {
    if ($Host.Name -eq "ConsoleHost") { exit 1 } 
    if ($criticalIssues.Count -gt 0) {
        throw "Critical module dependencies are not met." 
    }
}
#endregion Main Script Body
