<#
.SYNOPSIS
    Checks the availability, version, and basic integrity of PowerShell modules required 
    or recommended for the M&A Discovery Suite.
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
    Version: 2.0.3
    Author: Gemini & User
    Date: 2025-06-01

    Instructions:
    1. Run this script on the machine where you intend to run the M&A Discovery Suite.
    2. Review the output for any errors or warnings. CRITICAL errors for required modules
       will prevent parts of the M&A Discovery Suite from functioning correctly.
    3. RSAT tools (ActiveDirectory, GroupPolicy, DfsMgmt, FailoverClusters) must be installed via Windows Features and are NOT auto-fixed.
.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1 -AutoFix -Silent
#>

[CmdletBinding(SupportsShouldProcess = $true)] 
param(
    [Parameter(Mandatory = $false)]
    [string[]]$ModuleName,

    [Parameter(Mandatory = $false)]
    [switch]$AutoFix,

    [Parameter(Mandatory = $false)]
    [switch]$Silent 
)

#region Configuration
if ($null -eq $global:MandA -or $null -eq $global:MandA.Config) {
    Write-Warning "Global configuration `$global:MandA.Config` not found. Attempting to load default config. Paths might be incorrect if not run via QuickStart."
    $PSScriptRootDiscoveryModuleCheck = $PSScriptRoot 
    if ($null -eq $PSScriptRootDiscoveryModuleCheck) { $PSScriptRootDiscoveryModuleCheck = Split-Path $MyInvocation.MyCommand.Definition -Parent}
    $standaloneConfigPath = Join-Path $PSScriptRootDiscoveryModuleCheck "..Configuration\default-config.json"
    if (Test-Path $standaloneConfigPath) {
        try { $script:StandaloneConfig = Get-Content $standaloneConfigPath | ConvertFrom-Json } catch { Write-Error "Failed to load standalone config: $($_.Exception.Message)."; $script:StandaloneConfig = $null }
    } else { Write-Warning "Standalone config not found at $standaloneConfigPath"; $script:StandaloneConfig = $null }
}

$configModules = $null
if ($null -ne $global:MandA.Config.discovery.powershellModules) { 
    $configModules = $global:MandA.Config.discovery.powershellModules
} elseif ($null -ne $script:StandaloneConfig.discovery.powershellModules) {
    $configModules = $script:StandaloneConfig.discovery.powershellModules
}

Function Get-ModuleDefinition {
    param ([string]$Name, [string]$DefaultVersion, [string]$Category, [string]$Notes, [bool]$IsRSAT = $false)
    $reqVersion = $DefaultVersion; $effectiveNotes = $Notes
    if ($null -ne $configModules) {
        if ($configModules.PSObject.Properties[$Name] -and $configModules.$Name.PSObject.Properties['RequiredVersion']) { $reqVersion = $configModules.$Name.RequiredVersion }
        if ($configModules.PSObject.Properties[$Name] -and $configModules.$Name.PSObject.Properties['Notes']) { $effectiveNotes = $configModules.$Name.Notes }
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
    (Get-ModuleDefinition -Name "Microsoft.Graph.Policies" -DefaultVersion "2.10.0" -Category "CONDITIONALLY REQUIRED" -Notes "For policy-related discovery. Required by ExternalIdentityDiscovery if that source is enabled.") 
    (Get-ModuleDefinition -Name "Microsoft.Graph.Reports" -DefaultVersion "2.10.0" -Category "RECOMMENDED" -Notes "Required for certain usage reports.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.DeviceManagement" -DefaultVersion "2.10.0" -Category "RECOMMENDED" -Notes "Required for Intune device, policy, and application discovery.")
    (Get-ModuleDefinition -Name "ExchangeOnlineManagement" -DefaultVersion "3.2.0" -Category "CRITICAL REQUIRED" -Notes "For all Exchange Online discovery.")
    
    (Get-ModuleDefinition -Name "ActiveDirectory" -DefaultVersion "1.0.1.0" -Category "CONDITIONALLY REQUIRED" -Notes "For on-premises AD discovery. Install via Windows Features (RSAT)." -IsRSAT $true)
    (Get-ModuleDefinition -Name "DnsServer" -DefaultVersion "2.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For DNS discovery. Install via Windows Features (RSAT)." -IsRSAT $true) 
    (Get-ModuleDefinition -Name "GroupPolicy" -DefaultVersion "1.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For GPO discovery. Install via Windows Features (RSAT)." -IsRSAT $true)
    (Get-ModuleDefinition -Name "DfsMgmt" -DefaultVersion "2.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For DFS discovery. Install via Windows Features (RSAT: File Services Tools -> DFS Management Tools)." -IsRSAT $true) 
    (Get-ModuleDefinition -Name "FailoverClusters" -DefaultVersion "2.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For File Server Cluster discovery. Install via Windows Features (RSAT)." -IsRSAT $true) 

    (Get-ModuleDefinition -Name "Az.Accounts" -DefaultVersion "2.12.0" -Category "CONDITIONALLY REQUIRED" -Notes "For Azure Resource Manager authentication.")
    (Get-ModuleDefinition -Name "Az.Resources" -DefaultVersion "6.5.0" -Category "CONDITIONALLY REQUIRED" -Notes "For Azure Resource discovery.")
    
    (Get-ModuleDefinition -Name "ImportExcel" -DefaultVersion "7.8.5" -Category "OPTIONAL" -Notes "For generating reports in Excel format.")
)

if ($PSBoundParameters.ContainsKey('ModuleName')) {
    Write-Host "Checking only specified modules: $($ModuleName -join ', ')" -ForegroundColor Cyan
    $ModulesToCheck = $ModulesToCheck | Where-Object { $_.Name -in $ModuleName }
}
$Results = [System.Collections.Generic.List[PSObject]]::new()
#endregion

#region Helper Functions
function Write-SectionHeader { param([string]$Header) Write-Host "`n"; Write-Host ("-" * ($Header.Length + 4)) -FG DarkCyan; Write-Host "  $Header  " -FG Cyan; Write-Host ("-" * ($Header.Length + 4)) -FG DarkCyan }
function Install-OrUpdateModuleViaPSGallery {
    [CmdletBinding(SupportsShouldProcess = $true)] param([string]$ModuleNameForInstall, [version]$ReqVersion, [ref]$ModuleResultToUpdateRef, [bool]$AttemptAutoFix, [bool]$AttemptSilentFix)
    $installModuleParams = @{ Name = $ModuleNameForInstall; MinimumVersion = $ReqVersion.ToString(); Scope = "CurrentUser"; AllowClobber = $true; AcceptLicense = $true; ErrorAction = "Stop" }
    if ($AttemptAutoFix) { $installModuleParams.Force = $true }
    $shouldProceedWithInstall = $false
    if ($AttemptAutoFix -and $AttemptSilentFix) { $shouldProceedWithInstall = $true; Write-Host "  Attempting to install/update module '$ModuleNameForInstall' (Silent AutoFix)..." -FG Magenta
    } elseif ($AttemptAutoFix) { if ($PSCmdlet.ShouldProcess($ModuleNameForInstall, "Install/Update to minimum version $($ReqVersion.ToString())")) { $shouldProceedWithInstall = $true; Write-Host "  Attempting to install/update module '$ModuleNameForInstall'..." -FG Magenta } else { $ModuleResultToUpdateRef.Value.Notes += " User skipped install/update."; Write-Host "  Skipping install/update for '$ModuleNameForInstall'." -FG Yellow }
    } else { $ModuleResultToUpdateRef.Value.Notes += " AutoFix not enabled."; Write-Host "  AutoFix not enabled for '$ModuleNameForInstall'." -FG Yellow; return $false }
    if (-not $shouldProceedWithInstall) { return $false }
    try {
        if (-not (Get-Command Install-Module -EA SilentlyContinue)) { $ModuleResultToUpdateRef.Value.Status = "Install Failed (PowerShellGet Missing)"; $ModuleResultToUpdateRef.Value.Notes = "Install-Module not found."; Write-Host "  Status: $($ModuleResultToUpdateRef.Value.Status)" -FG Red; Return $false }
        $psGallery = Get-PSRepository -Name PSGallery -EA SilentlyContinue
        if ($null -eq $psGallery) { Write-Warning "PSGallery repository not found. Attempting to register..."; try { Register-PSRepository -Default -InstallationPolicy Trusted -EA Stop; $psGallery = Get-PSRepository -Name PSGallery -EA SilentlyContinue; if ($null -eq $psGallery) { $ModuleResultToUpdateRef.Value.Notes += " PSGallery registration failed." } else { Write-Host "  PSGallery registered." -FG Green } } catch { $ModuleResultToUpdateRef.Value.Notes += " Error registering PSGallery: $($_.Exception.Message)" } }
        elseif ($psGallery.InstallationPolicy -ne 'Trusted') { Write-Host "  Setting PSGallery to trusted..." -FG Magenta; Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -EA Stop; Write-Host "  PSGallery trusted." -FG Green }
        Install-Module @installModuleParams; $ModuleResultToUpdateRef.Value.Notes = "Install/update attempted. Re-checking."; Write-Host "  Module '$ModuleNameForInstall' install/update command executed." -FG Green; Return $true 
    } catch { $ModuleResultToUpdateRef.Value.Status = "Install/Update Failed"; $ModuleResultToUpdateRef.Value.Notes = "Error: $($_.Exception.Message)"; Write-Host "  Status: $($ModuleResultToUpdateRef.Value.Status)" -FG Red; Return $false }
}
function Test-SingleModule {
    param([PSObject]$ModuleInfo, [bool]$AttemptAutoFix, [bool]$AttemptSilentFix)
    $moduleNameToCheck = $ModuleInfo.Name; $moduleCategory = $ModuleInfo.Category; $reqVersion = [version]$ModuleInfo.RequiredVersion; $isRSATTool = [bool]$ModuleInfo.IsRSAT
    Write-Host "`nChecking $moduleCategory Module: $moduleNameToCheck (Minimum Expected: $($reqVersion.ToString()))" -FG Yellow
    if ($isRSATTool) { Write-Host "  Type: RSAT Tool (Requires Windows Feature installation)" -FG DarkCyan }
    if ($ModuleInfo.Notes) { Write-Host "  Notes: $($ModuleInfo.Notes)" -FG Gray }
    $moduleResult = [PSCustomObject]@{ Name = $moduleNameToCheck; Category = $moduleCategory; Status = "Not Checked"; RequiredVersion = $reqVersion.ToString(); InstalledVersion = "N/A"; Path = "N/A"; Notes = ""; IsRSAT = $isRSATTool }
    $attemptedFixThisRun = $false 
    for ($attempt = 1; $attempt -le 2; $attempt++) { 
        $availableModule = Get-Module -ListAvailable -Name $moduleNameToCheck -EA SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
        if ($null -eq $availableModule) {
            $moduleResult.Status = "Not Found"; $moduleResult.Notes = "Module not installed/discoverable."; if ($isRSATTool) { $moduleResult.Notes += " Install via Windows Features." }
            if ($attempt -eq 1) { Write-Host "  Status: $($moduleResult.Status)" -FG Red }
            if (-not $attemptedFixThisRun -and -not $isRSATTool) { if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) { $attemptedFixThisRun = $true; continue } else { break } 
            } elseif ($isRSATTool) { Write-Host "  Action: Manual installation required for RSAT tool '$moduleNameToCheck'." -FG Yellow; break 
            } else { break } 
        } else { 
            $moduleResult.Path = $availableModule.Path; $installedVersion = $availableModule.Version; $moduleResult.InstalledVersion = $installedVersion.ToString()
            Write-Host ("  Status: " + (if ($attemptedFixThisRun) { "Found (after fix)" } else { "Found" }) + " (Version: $($moduleResult.InstalledVersion))") -FG Green
            if ($installedVersion -lt $reqVersion) {
                $moduleResult.Status = "Version Mismatch"; $moduleResult.Notes = "Installed version older than expected."; if ($isRSATTool) { $moduleResult.Notes += " Update via Windows Features." }
                if ($attempt -eq 1 -and -not $attemptedFixThisRun) { Write-Host "  Status: $($moduleResult.Status)" -FG Yellow }
                if (-not $attemptedFixThisRun -and -not $isRSATTool) { if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) { $attemptedFixThisRun = $true; continue } else { break } 
                } elseif ($isRSATTool) { Write-Host "  Action: Manual update required for RSAT tool '$moduleNameToCheck'." -FG Yellow; break 
                } else { break } 
            } else { 
                $moduleResult.Status = "Version OK"; if (-not $attemptedFixThisRun) { Write-Host "  Status: $($moduleResult.Status)" -FG Green } 
                $importedModule = $null
                try { Write-Host "  Attempting to import module '$moduleNameToCheck'..." -FG White; $importedModule = Import-Module -Name $moduleNameToCheck -RequiredVersion $installedVersion -Force -PassThru -EA Stop
                    if ($null -ne $importedModule) { $moduleResult.Status = "Imported Successfully (Version OK)"; Write-Host "  Status: $($moduleResult.Status)" -FG Green }
                    else { $moduleResult.Status = "Import Attempted (No Object Returned, Version OK)"; $moduleResult.Notes += " Import did not return object."; Write-Host "  Status: $($moduleResult.Status)" -FG Yellow }
                } catch { $moduleResult.Status = "Import Failed (Version OK)"; $moduleResult.Notes += " Import Error: $($_.Exception.Message)."; Write-Host "  Status: $($moduleResult.Status)" -FG Red }
                finally { if ($null -ne $importedModule) { try { Remove-Module -Name $moduleNameToCheck -Force -EA SilentlyContinue } catch {} } }
                break 
            }
        }
    } 
    if ($moduleResult.Status -eq "Not Checked") { $moduleResult.Status = "Check Incomplete"; $moduleResult.Notes += " Status not fully determined."}
    $Results.Add($moduleResult)
}
#endregion

#region Main Script Body
Write-SectionHeader "M&A Discovery Suite - PowerShell Module Dependency Check (v2.0.3)"
if ($AutoFix.IsPresent) { 
    if ($Silent.IsPresent) { Write-Host "AUTO-FIX MODE (SILENT): Will attempt to install/update PSGallery modules with -Force and no individual prompts." -FG Magenta } 
    else { Write-Host "AUTO-FIX MODE (INTERACTIVE): Will prompt via ShouldProcess before installing/updating each PSGallery module with -Force." -FG Magenta }
    Write-Host "RSAT tools require manual Windows Feature installation and are NOT auto-fixed." -FG Yellow
} else { Write-Host "INFO: To attempt automatic fixes for PSGallery modules, re-run with -AutoFix. Use -Silent with -AutoFix for non-interactive fixing." -FG Cyan }
Write-Host "Internet connection required for PSGallery. Modules installed for CurrentUser scope. Timestamp: $(Get-Date)"
if ($ModulesToCheck.Count -eq 0) { Write-Warning "No modules to check."; if ($Host.Name -eq "ConsoleHost") { exit 1 } else { throw "No modules to check." } }

foreach ($moduleDef in $ModulesToCheck) { Test-SingleModule -ModuleInfo $moduleDef -AttemptAutoFix $AutoFix.IsPresent -AttemptSilentFix $Silent.IsPresent }

Write-SectionHeader "Dependency Check Summary"; $Results | Format-Table -AutoSize -Wrap

$criticalIssues = $Results | Where-Object { ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted*") -and $_.Category -eq "CRITICAL REQUIRED" }
# Corrected alias usage below:
$otherIssues = $Results | Where-Object { ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted*") -and $_.Category -ne "CRITICAL REQUIRED" }
$overallSuccess = $true

if ($criticalIssues.Count -eq 0) { 
    Write-Host "`nAll CRITICAL REQUIRED modules appear OK." -FG Green
    if ($otherIssues.Count -gt 0) { Write-Host "Review warnings for other module categories." -FG Yellow }
} else { 
    $overallSuccess = $false; Write-Host "`nERROR: CRITICAL ISSUES FOUND:" -FG Red
    # Corrected alias usage below:
    $criticalIssues | ForEach-Object { 
        Write-Host ("  - $($_.Name) ($($_.Category)): Status: $($_.Status). Notes: $($_.Notes)") -FG Red
        if ($_.IsRSAT) { Write-Host "    ACTION: Install/update RSAT tool via Windows Features." -FG Red }
    }
    Write-Host "`nPlease address CRITICAL issues." -FG Red 
}
if ($otherIssues.Count -gt 0) { 
    Write-Host "`nWARNING: Issue(s) with CONDITIONALLY REQUIRED or OPTIONAL modules:" -FG Yellow
    # Corrected alias usage below:
    $otherIssues | ForEach-Object { 
        Write-Host ("  - $($_.Name) ($($_.Category)): Status: $($_.Status). Notes: $($_.Notes)") -FG Yellow
        if ($_.IsRSAT) { Write-Host "    ACTION: If needed, install/update RSAT tool via Windows Features." -FG Yellow }
    }
}
Write-Host "`nDependency check finished at $(Get-Date)."
if (-not $overallSuccess -and -not $AutoFix.IsPresent) { Write-Host "Consider re-running with -AutoFix for PSGallery modules." -FG Cyan }
if (-not $overallSuccess) { 
    if ($Host.Name -eq "ConsoleHost") { exit 1 }
    if ($criticalIssues.Count -gt 0) { throw "Critical module dependencies are not met." } 
}
#endregion
