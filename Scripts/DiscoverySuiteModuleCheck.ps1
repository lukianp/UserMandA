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
    Version: 2.0.4
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
    Write-Host ""
    Write-Host "  TARGET FILTER APPLIED  " -BackgroundColor DarkBlue -ForegroundColor White
    Write-Host "  Checking only: " -ForegroundColor Cyan -NoNewline
    Write-Host "$($ModuleName -join ', ')" -ForegroundColor Yellow
    Write-Host ""
    $ModulesToCheck = $ModulesToCheck | Where-Object { $_.Name -in $ModuleName }
}
$Results = [System.Collections.Generic.List[PSObject]]::new()
#endregion

#region Helper Functions
function Write-SectionHeader { 
    param([string]$Header)
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host ("=" * 80) -ForegroundColor DarkCyan
    Write-Host "  " -NoNewline  
    Write-Host " $Header " -BackgroundColor DarkCyan -ForegroundColor White
    Write-Host "  " -NoNewline
    Write-Host ("=" * 80) -ForegroundColor DarkCyan
    Write-Host ""
}

function Write-StatusIcon {
    param([string]$Status)
    switch ($Status) {
        "SUCCESS" { Write-Host " [OK] " -BackgroundColor DarkGreen -ForegroundColor White -NoNewline }
        "ERROR" { Write-Host " [!!] " -BackgroundColor DarkRed -ForegroundColor White -NoNewline }
        "WARNING" { Write-Host " [??] " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline }
        "INFO" { Write-Host " [>>] " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline }
        "WORKING" { Write-Host " [...] " -BackgroundColor DarkMagenta -ForegroundColor White -NoNewline }
    }
}

function Write-ModuleStatus {
    param([string]$Message, [string]$Status, [string]$Color = "White")
    Write-Host "    " -NoNewline
    Write-StatusIcon -Status $Status
    Write-Host " $Message" -ForegroundColor $Color
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
        Name            = $ModuleNameForInstall
        MinimumVersion  = $ReqVersion.ToString() 
        Scope           = "CurrentUser"
        AllowClobber    = $true
        AcceptLicense   = $true 
        ErrorAction     = "Stop"
    }
    if ($AttemptAutoFix) { $installModuleParams.Force = $true }

    $shouldProceedWithInstall = $false
    $shouldProcessMessage = "Install/Update module '$ModuleNameForInstall' to minimum version $($ReqVersion.ToString()) from PowerShell Gallery?"

    if ($AttemptAutoFix -and $AttemptSilentFix) {
        $shouldProceedWithInstall = $true
        Write-ModuleStatus -Message "Installing/updating '$ModuleNameForInstall' (Silent AutoFix mode)" -Status "WORKING" -Color "Magenta"
    } elseif ($AttemptAutoFix) {
        if ($PSCmdlet.ShouldProcess($ModuleNameForInstall, $shouldProcessMessage)) {
            $shouldProceedWithInstall = $true
            Write-ModuleStatus -Message "Installing/updating '$ModuleNameForInstall' (User confirmed)" -Status "WORKING" -Color "Magenta"
        } else {
            $ModuleResultToUpdateRef.Value.Notes += " User skipped install/update."
            Write-ModuleStatus -Message "Skipping install/update for '$ModuleNameForInstall' (User declined)" -Status "WARNING" -Color "Yellow"
        }
    } else {
        $ModuleResultToUpdateRef.Value.Notes += " AutoFix not enabled."
        Write-ModuleStatus -Message "AutoFix not enabled for '$ModuleNameForInstall'" -Status "INFO" -Color "Cyan"
        return $false
    }

    if (-not $shouldProceedWithInstall) { return $false }

    try {
        if (-not (Get-Command Install-Module -EA SilentlyContinue)) {
            $ModuleResultToUpdateRef.Value.Status = "Install Failed (PowerShellGet Missing)"
            $ModuleResultToUpdateRef.Value.Notes = "Install-Module not found."
            Write-ModuleStatus -Message "PowerShellGet module not available" -Status "ERROR" -Color "Red"
            Return $false
        }
        $psGallery = Get-PSRepository -Name PSGallery -EA SilentlyContinue
        if ($null -eq $psGallery) {
            Write-ModuleStatus -Message "PSGallery repository not found - attempting to register" -Status "WARNING" -Color "Yellow"
            try {
                Register-PSRepository -Default -InstallationPolicy Trusted -EA Stop
                $psGallery = Get-PSRepository -Name PSGallery -EA SilentlyContinue
                if ($null -eq $psGallery) { 
                    $ModuleResultToUpdateRef.Value.Notes += " PSGallery registration failed." 
                } else { 
                    Write-ModuleStatus -Message "PSGallery repository registered successfully" -Status "SUCCESS" -Color "Green"
                }
            } catch { 
                $ModuleResultToUpdateRef.Value.Notes += " Error registering PSGallery: $($_.Exception.Message)" 
            }
        } elseif ($psGallery.InstallationPolicy -ne 'Trusted') {
            Write-ModuleStatus -Message "Setting PSGallery to trusted repository" -Status "INFO" -Color "Cyan"
            Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -EA Stop
            Write-ModuleStatus -Message "PSGallery is now trusted" -Status "SUCCESS" -Color "Green"
        }
        
        Install-Module @installModuleParams 
        $ModuleResultToUpdateRef.Value.Notes = "Install/update attempted. Re-checking."
        Write-ModuleStatus -Message "Module '$ModuleNameForInstall' install/update completed" -Status "SUCCESS" -Color "Green"
        Return $true 
    } catch {
        $ModuleResultToUpdateRef.Value.Status = "Install/Update Failed"
        $ModuleResultToUpdateRef.Value.Notes = "Error: $($_.Exception.Message)"
        Write-ModuleStatus -Message "Install/update failed: $($_.Exception.Message)" -Status "ERROR" -Color "Red"
        Return $false
    }
}

function Test-SingleModule {
    param([PSObject]$ModuleInfo, [bool]$AttemptAutoFix, [bool]$AttemptSilentFix)
    
    $moduleNameToCheck = $ModuleInfo.Name
    $moduleCategory = $ModuleInfo.Category
    $reqVersion = [version]$ModuleInfo.RequiredVersion
    $isRSATTool = [bool]$ModuleInfo.IsRSAT
    
    # Header for this module
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host ("-" * 78) -ForegroundColor DarkGray
    
    # Module name and category with color coding
    Write-Host "  " -NoNewline
    $categoryColor = switch ($moduleCategory) {
        "CRITICAL REQUIRED" { "Red" }
        "CONDITIONALLY REQUIRED" { "Yellow" }
        "RECOMMENDED" { "Cyan" }
        "OPTIONAL" { "Gray" }
        default { "White" }
    }
    
    Write-Host " [$moduleCategory] " -BackgroundColor DarkBlue -ForegroundColor $categoryColor -NoNewline
    Write-Host " $moduleNameToCheck " -ForegroundColor White -NoNewline
    Write-Host "(Min: $($reqVersion.ToString()))" -ForegroundColor Gray
    
    if ($isRSATTool) { 
        Write-Host "    " -NoNewline
        Write-Host " RSAT TOOL " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
        Write-Host " Requires Windows Feature installation" -ForegroundColor Yellow
    }
    
    if ($ModuleInfo.Notes) { 
        Write-Host "    " -NoNewline
        Write-Host " INFO " -BackgroundColor DarkGreen -ForegroundColor White -NoNewline
        Write-Host " $($ModuleInfo.Notes)" -ForegroundColor Gray
    }
    
    $moduleResult = [PSCustomObject]@{ 
        Name = $moduleNameToCheck
        Category = $moduleCategory
        Status = "Not Checked"
        RequiredVersion = $reqVersion.ToString()
        InstalledVersion = "N/A"
        Path = "N/A"
        Notes = ""
        IsRSAT = $isRSATTool 
    }
    
    $attemptedFixThisRun = $false 
    
    for ($attempt = 1; $attempt -le 2; $attempt++) { 
        $availableModule = Get-Module -ListAvailable -Name $moduleNameToCheck -EA SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
        
        if ($null -eq $availableModule) {
            $moduleResult.Status = "Not Found"
            $moduleResult.Notes = "Module not installed/discoverable."
            if ($isRSATTool) { $moduleResult.Notes += " Install via Windows Features." }
            
            if ($attempt -eq 1) { 
                Write-ModuleStatus -Message "Module not found" -Status "ERROR" -Color "Red"
            }
            
            if (-not $attemptedFixThisRun -and -not $isRSATTool) { 
                if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) { 
                    $attemptedFixThisRun = $true
                    continue 
                } else { 
                    break 
                } 
            } elseif ($isRSATTool) { 
                Write-ModuleStatus -Message "Manual installation required via Windows Features" -Status "WARNING" -Color "Yellow"
                break 
            } else { 
                break 
            } 
        } else { 
            $moduleResult.Path = $availableModule.Path
            $installedVersion = $availableModule.Version
            $moduleResult.InstalledVersion = $installedVersion.ToString()
            
            $statusText = if ($attemptedFixThisRun) { "Found (after fix attempt)" } else { "Found" }
            Write-ModuleStatus -Message "$statusText - Version: $($moduleResult.InstalledVersion)" -Status "SUCCESS" -Color "Green"
            
            if ($installedVersion -lt $reqVersion) {
                $moduleResult.Status = "Version Mismatch"
                $moduleResult.Notes = "Installed version older than expected."
                if ($isRSATTool) { $moduleResult.Notes += " Update via Windows Features." }
                
                if ($attempt -eq 1 -and -not $attemptedFixThisRun) { 
                    Write-ModuleStatus -Message "Version is below minimum requirement" -Status "WARNING" -Color "Yellow"
                }
                
                if (-not $attemptedFixThisRun -and -not $isRSATTool) { 
                    if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) { 
                        $attemptedFixThisRun = $true
                        continue 
                    } else { 
                        break 
                    } 
                } elseif ($isRSATTool) { 
                    Write-ModuleStatus -Message "Manual update required via Windows Features" -Status "WARNING" -Color "Yellow"
                    break 
                } else { 
                    break 
                } 
            } else { 
                $moduleResult.Status = "Version OK"
                if (-not $attemptedFixThisRun) { 
                    Write-ModuleStatus -Message "Version requirement satisfied" -Status "SUCCESS" -Color "Green"
                } 
                
                $importedModule = $null
                try { 
                    Write-ModuleStatus -Message "Testing module import capability" -Status "INFO" -Color "Cyan"
                    $importedModule = Import-Module -Name $moduleNameToCheck -RequiredVersion $installedVersion -Force -PassThru -EA Stop
                    
                    if ($null -ne $importedModule) { 
                        $moduleResult.Status = "Imported Successfully (Version OK)"
                        Write-ModuleStatus -Message "Module imported successfully" -Status "SUCCESS" -Color "Green"
                    } else { 
                        $moduleResult.Status = "Import Attempted (No Object Returned, Version OK)"
                        $moduleResult.Notes += " Import did not return object."
                        Write-ModuleStatus -Message "Import completed but no object returned" -Status "WARNING" -Color "Yellow"
                    }
                } catch { 
                    $moduleResult.Status = "Import Failed (Version OK)"
                    $moduleResult.Notes += " Import Error: $($_.Exception.Message)."
                    Write-ModuleStatus -Message "Import failed: $($_.Exception.Message)" -Status "ERROR" -Color "Red"
                } finally { 
                    if ($null -ne $importedModule) { 
                        try { 
                            Remove-Module -Name $moduleNameToCheck -Force -EA SilentlyContinue 
                        } catch {} 
                    } 
                }
                break 
            }
        }
    } 
    
    if ($moduleResult.Status -eq "Not Checked") { 
        $moduleResult.Status = "Check Incomplete"
        $moduleResult.Notes += " Status not fully determined."
    }
    
    $Results.Add($moduleResult)
}
#endregion

#region Main Script Body
Clear-Host
Write-Host ""
Write-Host "  " -NoNewline
Write-Host ("=" * 80) -ForegroundColor DarkCyan
Write-Host "  " -NoNewline
Write-Host " M&A DISCOVERY SUITE - MODULE DEPENDENCY CHECK v2.0.4 " -BackgroundColor DarkCyan -ForegroundColor White
Write-Host "  " -NoNewline
Write-Host ("=" * 80) -ForegroundColor DarkCyan
Write-Host ""

# Mode indicators
if ($AutoFix.IsPresent) { 
    if ($Silent.IsPresent) { 
        Write-Host "  " -NoNewline
        Write-Host " AUTO-FIX MODE (SILENT) " -BackgroundColor DarkRed -ForegroundColor White -NoNewline
        Write-Host " PSGallery modules will be installed/updated with -Force (no prompts)" -ForegroundColor Magenta
    } else { 
        Write-Host "  " -NoNewline
        Write-Host " AUTO-FIX MODE (INTERACTIVE) " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
        Write-Host " Will prompt before installing/updating each PSGallery module" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " NOTE " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
    Write-Host " RSAT tools require manual Windows Feature installation (NOT auto-fixed)" -ForegroundColor Cyan
} else { 
    Write-Host "  " -NoNewline
    Write-Host " READ-ONLY MODE " -BackgroundColor DarkGreen -ForegroundColor White -NoNewline
    Write-Host " To enable automatic fixes, re-run with -AutoFix parameter" -ForegroundColor Green
}

Write-Host ""
Write-Host "  " -NoNewline
Write-Host " REQUIREMENTS " -BackgroundColor DarkMagenta -ForegroundColor White -NoNewline
Write-Host " Internet connection required for PSGallery | Modules installed for CurrentUser scope" -ForegroundColor Gray

Write-Host ""
Write-Host "  " -NoNewline
Write-Host " TIMESTAMP " -BackgroundColor DarkGray -ForegroundColor White -NoNewline
Write-Host " $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

if ($ModulesToCheck.Count -eq 0) { 
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " ERROR " -BackgroundColor DarkRed -ForegroundColor White -NoNewline
    Write-Host " No modules to check" -ForegroundColor Red
    if ($Host.Name -eq "ConsoleHost") { exit 1 } else { throw "No modules to check." } 
}

Write-Host ""
Write-Host "  " -NoNewline
Write-Host " MODULE COUNT " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
Write-Host " Checking $($ModulesToCheck.Count) modules" -ForegroundColor Cyan

foreach ($moduleDef in $ModulesToCheck) { 
    Test-SingleModule -ModuleInfo $moduleDef -AttemptAutoFix $AutoFix.IsPresent -AttemptSilentFix $Silent.IsPresent 
}

Write-SectionHeader "DEPENDENCY CHECK RESULTS"

# Enhanced table output
$criticalModules = $Results | Where-Object { $_.Category -eq "CRITICAL REQUIRED" }
$conditionalModules = $Results | Where-Object { $_.Category -eq "CONDITIONALLY REQUIRED" }
$recommendedModules = $Results | Where-Object { $_.Category -eq "RECOMMENDED" }
$optionalModules = $Results | Where-Object { $_.Category -eq "OPTIONAL" }

function Write-ModuleTable {
    param([array]$Modules, [string]$CategoryName, [string]$CategoryColor)
    
    if ($Modules.Count -gt 0) {
        Write-Host ""
        Write-Host "  " -NoNewline
        Write-Host " $CategoryName ($($Modules.Count)) " -BackgroundColor $CategoryColor -ForegroundColor White
        Write-Host ""
        
        foreach ($module in $Modules) {
            $statusColor = switch ($module.Status) {
                { $_ -like "Imported Successfully*" } { "Green" }
                "Version OK" { "Green" }
                { $_ -like "Import Attempted*" } { "Yellow" }
                "Version Mismatch" { "Yellow" }
                "Not Found" { "Red" }
                { $_ -like "*Failed*" } { "Red" }
                default { "Gray" }
            }
            
            $statusIcon = switch ($module.Status) {
                { $_ -like "Imported Successfully*" } { "[OK]" }
                "Version OK" { "[OK]" }
                { $_ -like "Import Attempted*" } { "[??]" }
                "Version Mismatch" { "[!!]" }
                "Not Found" { "[XX]" }
                { $_ -like "*Failed*" } { "[XX]" }
                default { "[--]" }
            }
            
            Write-Host "    $statusIcon " -ForegroundColor $statusColor -NoNewline
            Write-Host $module.Name.PadRight(40) -ForegroundColor White -NoNewline
            Write-Host " $($module.InstalledVersion.PadRight(12))" -ForegroundColor Gray -NoNewline
            Write-Host " $($module.Status)" -ForegroundColor $statusColor
        }
    }
}

Write-ModuleTable -Modules $criticalModules -CategoryName "CRITICAL REQUIRED" -CategoryColor "DarkRed"
Write-ModuleTable -Modules $conditionalModules -CategoryName "CONDITIONALLY REQUIRED" -CategoryColor "DarkYellow"
Write-ModuleTable -Modules $recommendedModules -CategoryName "RECOMMENDED" -CategoryColor "DarkBlue"
Write-ModuleTable -Modules $optionalModules -CategoryName "OPTIONAL" -CategoryColor "DarkGray"

Write-SectionHeader "FINAL ASSESSMENT"

$criticalIssues = $Results | Where-Object { 
    ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted*") -and 
    $_.Category -eq "CRITICAL REQUIRED" 
}

$otherIssues = $Results | Where-Object { 
    ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted*") -and 
    $_.Category -ne "CRITICAL REQUIRED" 
}

$overallSuccess = $true

if ($criticalIssues.Count -eq 0) { 
    Write-Host "  " -NoNewline
    Write-Host " SUCCESS " -BackgroundColor DarkGreen -ForegroundColor White -NoNewline
    Write-Host " All CRITICAL REQUIRED modules are properly configured" -ForegroundColor Green
    Write-Host ""
    
    if ($otherIssues.Count -gt 0) { 
        Write-Host "  " -NoNewline
        Write-Host " ADVISORY " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
        Write-Host " Some optional/conditional modules have issues - review warnings above" -ForegroundColor Yellow
    }
} else { 
    $overallSuccess = $false
    Write-Host "  " -NoNewline
    Write-Host " CRITICAL ISSUES DETECTED " -BackgroundColor DarkRed -ForegroundColor White
    Write-Host ""
    
    $criticalIssues | ForEach-Object { 
        Write-Host "    " -NoNewline
        Write-Host " FAIL " -BackgroundColor Red -ForegroundColor White -NoNewline
        Write-Host " $($_.Name) - $($_.Status)" -ForegroundColor Red
        Write-Host "         Notes: $($_.Notes)" -ForegroundColor Gray
        
        if ($_.IsRSAT) { 
            Write-Host "         " -NoNewline
            Write-Host " ACTION REQUIRED " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
            Write-Host " Install/update via Windows Features (RSAT)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " BLOCKING " -BackgroundColor DarkRed -ForegroundColor White -NoNewline
    Write-Host " M&A Discovery Suite functionality will be impaired" -ForegroundColor Red
}

if ($otherIssues.Count -gt 0) { 
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " WARNINGS " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
    Write-Host " Issues with non-critical modules:" -ForegroundColor Yellow
    Write-Host ""
    
    $otherIssues | ForEach-Object { 
        Write-Host "    " -NoNewline
        Write-Host " WARN " -BackgroundColor Yellow -ForegroundColor Black -NoNewline
        Write-Host " $($_.Name) ($($_.Category)) - $($_.Status)" -ForegroundColor Yellow
        Write-Host "         Notes: $($_.Notes)" -ForegroundColor Gray
        
        if ($_.IsRSAT) { 
            Write-Host "         " -NoNewline
            Write-Host " INFO " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
            Write-Host " Install via Windows Features if this module is needed" -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "  " -NoNewline
Write-Host ("-" * 78) -ForegroundColor DarkGray
Write-Host "  Dependency check completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray

if (-not $overallSuccess -and -not $AutoFix.IsPresent) { 
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " TIP " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
    Write-Host " Re-run with -AutoFix to attempt automatic PSGallery module installation" -ForegroundColor Cyan
}

Write-Host ""

if (-not $overallSuccess) { 
    if ($Host.Name -eq "ConsoleHost") { 
        exit 1 
    }
    if ($criticalIssues.Count -gt 0) { 
        throw "Critical module dependencies are not met." 
    } 
}
#endregion