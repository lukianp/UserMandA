<#
.SYNOPSIS
    Checks the availability, version, and basic integrity of PowerShell modules required 
    or recommended for the M&A Discovery Suite.
.DESCRIPTION
    This script iterates through a predefined list of PowerShell modules,
    checks if they are installed, compares their version against a required/recommended version,
    attempts to import them, and reports their status.
    It will attempt to install or update modules from the PowerShell Gallery if they are missing or outdated,
    except for RSAT tools which require Windows Feature installation.
.NOTES
    Version: 1.2.3
    Author: Gemini
    Date: 2025-05-29

    Instructions:
    1. Run this script on the machine where you intend to run the M&A Discovery Suite.
    2. Review the output for any errors or warnings. CRITICAL errors for required modules
       will prevent parts of the M&A Discovery Suite from functioning correctly.
    3. The script attempts to auto-fix modules from PSGallery. This requires an internet connection
       and permissions to install modules (CurrentUser scope is used).
    4. RSAT tools (ActiveDirectory, GroupPolicy) must be installed via Windows Features.
.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1
    Runs the dependency check. Will attempt to install/update PSGallery modules, prompting for each.

.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1 -AutoFix
    Same as above, but explicitly states auto-fix mode is active (uses -Force for Install-Module).

.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1 -AutoFix -Confirm:$false
    Runs the check and attempts to install/update PSGallery modules without prompting.

.EXAMPLE
    .\DiscoverySuiteModuleCheck.ps1 -ModuleName "Microsoft.Graph.Users", "Az.Accounts"
    Checks only the specified modules.
#>

[CmdletBinding(SupportsShouldProcess = $true)] 
param(
    [Parameter(Mandatory = $false)]
    [string[]]$ModuleName,

    [Parameter(Mandatory = $false)]
    [switch]$AutoFix 
)

#region Configuration
# Updated RequiredVersion based on user's installed versions where newer and functional.
$CoreRequiredModules = @(
    @{ Name = "Microsoft.Graph.Authentication"; RequiredVersion = "2.28.0"; Notes = "CRITICAL: Essential for all Microsoft Graph API authentication." },
    @{ Name = "Microsoft.Graph.Users"; RequiredVersion = "2.28.0"; Notes = "CRITICAL: For Azure AD user discovery (GraphDiscovery, ExternalIdentityDiscovery)." },
    @{ Name = "Microsoft.Graph.Groups"; RequiredVersion = "2.28.0"; Notes = "CRITICAL: For Azure AD group discovery." },
    @{ Name = "Microsoft.Graph.Applications"; RequiredVersion = "2.28.0"; Notes = "CRITICAL: For Azure AD App Registrations, Enterprise Apps (Setup-AppRegistration, GraphDiscovery)." },
    @{ Name = "Microsoft.Graph.Identity.DirectoryManagement"; RequiredVersion = "2.28.0"; Notes = "CRITICAL: For Directory Roles, Organization Info, Auth Policies." },
    @{ Name = "Microsoft.Graph.Identity.SignIns"; RequiredVersion = "2.28.0"; Notes = "CRITICAL: For user sign-in activity (ExternalIdentityDiscovery)." },
    @{ Name = "Microsoft.Graph.Reports"; RequiredVersion = "2.28.0"; Notes = "Required for certain usage reports (e.g., OneDrive in GraphDiscovery)." },
    @{ Name = "Microsoft.Graph.DeviceManagement"; RequiredVersion = "2.28.0"; Notes = "Required for Intune device and policy discovery (stable endpoints)." },
    # Microsoft.Graph.DeviceAppManagement - This module name is correct and exists on PSGallery.
    @{ Name = "Microsoft.Graph.DeviceAppManagement"; RequiredVersion = "2.9.0"; Notes = "CRITICAL: Required for Intune application discovery (stable endpoints). If not found, check PSGallery access." },
    @{ Name = "ExchangeOnlineManagement"; RequiredVersion = "3.7.1"; Notes = "CRITICAL: For all Exchange Online discovery and some cross-service cmdlets." }
)

$ConditionallyRequiredOrOptionalModules = @(
    # RSAT Tools - Must be installed via Windows Features
    @{ Name = "ActiveDirectory"; RequiredVersion = "1.0.1.0"; IsRSAT = $true; Notes = "CONDITIONALLY REQUIRED: For on-premises Active Directory discovery. Install via Windows Features: 'RSAT: Active Directory Domain Services and Lightweight Directory Services Tools'." },
    # GroupPolicy is RSAT, not from PSGallery. The script should not attempt to install it from there.
    @{ Name = "GroupPolicy"; RequiredVersion = "1.0.0.0"; IsRSAT = $true; Notes = "CONDITIONALLY REQUIRED: For GPO discovery. Install via Windows Features: 'Group Policy Management'. Version 2.0.0 might be for a different package or a newer RSAT version not typically installed by default." },

    # Azure RM Modules
    @{ Name = "Az.Accounts"; RequiredVersion = "2.13.1"; Notes = "CONDITIONALLY REQUIRED: For Azure Resource Manager discovery." },
    @{ Name = "Az.Resources"; RequiredVersion = "6.11.1"; Notes = "CONDITIONALLY REQUIRED: For Azure Resource discovery." },
    @{ Name = "Az.Storage"; RequiredVersion = "5.10.1"; Notes = "Optional/Conditional: For detailed Azure Storage discovery." },
    @{ Name = "Az.Sql"; RequiredVersion = "4.10.0"; Notes = "Optional/Conditional: For Azure SQL discovery." },
    @{ Name = "Az.Network"; RequiredVersion = "6.2.0"; Notes = "Optional/Conditional: For Azure Networking discovery." },
    @{ Name = "Az.KeyVault"; RequiredVersion = "4.12.0"; Notes = "Optional/Conditional: For Azure Key Vault discovery." },
    @{ Name = "Az.Websites"; RequiredVersion = "3.1.1"; Notes = "Optional/Conditional: For Azure App Service discovery." },
    @{ Name = "Az.Aks"; RequiredVersion = "5.5.1"; Notes = "Optional/Conditional: For Azure Kubernetes Service discovery." },
    @{ Name = "Az.ContainerRegistry"; RequiredVersion = "4.1.1"; Notes = "Optional/Conditional: For Azure Container Registry discovery." },
    @{ Name = "Az.ManagedServiceIdentity"; RequiredVersion = "1.1.1"; Notes = "Optional/Conditional: For Azure Managed Identity discovery." },
    @{ Name = "Az.Functions"; RequiredVersion = "4.0.6"; Notes = "Optional/Conditional: For Azure Functions discovery." },

    # Microsoft Graph Beta Modules
    @{ Name = "Microsoft.Graph.Beta.Authentication"; RequiredVersion = "2.9.0"; Notes = "Optional/Conditional: For Beta Graph API authentication. If not found, check PSGallery access." },
    @{ Name = "Microsoft.Graph.Beta.DeviceManagement"; RequiredVersion = "2.28.0"; Notes = "Optional/Conditional: For Intune discovery using Beta Graph API endpoints." },
    @{ Name = "Microsoft.Graph.Beta.DeviceAppManagement"; RequiredVersion = "2.9.0"; Notes = "Optional/Conditional: For Intune app discovery using Beta Graph API endpoints. If not found, check PSGallery access." },
    @{ Name = "Microsoft.Graph.Beta.Users.Actions"; RequiredVersion = "2.28.0"; Notes = "Optional/Conditional: For specific Beta user actions/device info in Intune." },
    
    # Other Optional Modules
    @{ Name = "ImportExcel"; RequiredVersion = "7.8.5"; Notes = "OPTIONAL: For generating reports in Excel format (ExcelExport.psm1)." },
    @{ Name = "MicrosoftTeams"; RequiredVersion = "5.5.0"; Notes = "OPTIONAL/Conditional: If Teams-specific cmdlets are used. Newer versions like 7.0.0 are also fine." }
)

$ModulesToCheck = $CoreRequiredModules + $ConditionallyRequiredOrOptionalModules

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
        [Parameter(Mandatory = $true)] [ref]$ModuleResultToUpdateRef 
    )
    $installModuleParams = @{
        Name = $ModuleNameForInstall
        MinimumVersion = $ReqVersion.ToString()
        Scope = "CurrentUser"
        AllowClobber = $true
        AcceptLicense = $true 
        ErrorAction = "Stop"
    }
    if ($AutoFix) {
        $installModuleParams.Force = $true
    }

    if ($PSCmdlet.ShouldProcess($ModuleNameForInstall, "Install/Update to minimum version $($ReqVersion.ToString()) from PowerShell Gallery (Params: $($installModuleParams | Out-String | ForEach-Object {$_.Trim()}))")) {
        Write-Host "  Attempting to install/update module '$ModuleNameForInstall' to minimum version $($ReqVersion.ToString())..." -ForegroundColor Magenta
        try {
            if (-not (Get-Command Install-Module -ErrorAction SilentlyContinue)) {
                $ModuleResultToUpdateRef.Value.Status = "Install Failed (PowerShellGet Missing)"
                $ModuleResultToUpdateRef.Value.Notes = "Install-Module command not found. Ensure PowerShellGet module is installed and functional. This is critical."
                Write-Host "  Status: $($ModuleResultToUpdateRef.Value.Status)" -ForegroundColor Red
                Return $false
            }

            if (-not (Get-PackageProvider -Name NuGet -ErrorAction SilentlyContinue)) {
                Write-Host "  NuGet provider not found. Attempting to install NuGet provider..." -ForegroundColor Magenta
                Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser -ErrorAction Stop
                Write-Host "  NuGet provider installed." -ForegroundColor Green
            }
            
            $psGallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
            if ($psGallery -and $psGallery.InstallationPolicy -ne 'Trusted') {
                Write-Host "  PSGallery is not trusted. Attempting to set as trusted..." -ForegroundColor Magenta
                Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -ErrorAction Stop
                Write-Host "  PSGallery set to trusted." -ForegroundColor Green
            } elseif (-not $psGallery) {
                Write-Warning "PSGallery repository not found. Module installation might fail. Please run: Register-PSRepository -Default -InstallationPolicy Trusted"
                $ModuleResultToUpdateRef.Value.Notes += " PSGallery repository not found. Manual registration might be needed."
            }

            Install-Module @installModuleParams 
            $ModuleResultToUpdateRef.Value.Notes = "Module installation/update attempted via PSGallery. Re-checking status."
            Write-Host "  Module '$ModuleNameForInstall' install/update command executed." -ForegroundColor Green
            Return $true 
        }
        catch {
            $ModuleResultToUpdateRef.Value.Status = "Install/Update Failed (PSGallery)"
            $ModuleResultToUpdateRef.Value.Notes = "Error during PSGallery install/update: $($_.Exception.Message)"
            if ($_.Exception.Message -match "No match was found") {
                $ModuleResultToUpdateRef.Value.Notes += " This can happen if the module name is incorrect, the version doesn't exist, or PSGallery is inaccessible/misconfigured. Verify with 'Find-Module $ModuleNameForInstall -ErrorAction Continue' and 'Get-PSRepository'."
            }
            Write-Host "  Status: $($ModuleResultToUpdateRef.Value.Status)" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            Return $false
        }
    } else {
        $ModuleResultToUpdateRef.Value.Notes += " User chose not to proceed with install/update (ShouldProcess was false)."
        Write-Host "  Skipping install/update for '$ModuleNameForInstall' as per user choice (ShouldProcess was false)." -ForegroundColor Yellow
        Return $false 
    }
}

function Test-SingleModule {
    param(
        [Parameter(Mandatory = $true)] [PSObject]$ModuleInfo 
    )

    $moduleNameToCheck = $ModuleInfo.Name
    $moduleType = if ($CoreRequiredModules.Name -contains $moduleNameToCheck) { "CRITICAL REQUIRED" } else { "Conditionally Required/Optional" }
    $reqVersion = [version]$ModuleInfo.RequiredVersion
    
    $isRSATTool = $false
    # Correctly check if the 'IsRSAT' property exists and is true
    if ($ModuleInfo.PSObject.Properties['IsRSAT'] -ne $null -and [bool]$ModuleInfo.IsRSAT) {
        $isRSATTool = $true
    }

    Write-Host "`nChecking $moduleType Module: $moduleNameToCheck (Minimum Expected Version: $($reqVersion.ToString()))" -ForegroundColor Yellow
    if ($isRSATTool) { Write-Host "  Type: RSAT Tool (Requires Windows Feature installation)" -ForegroundColor DarkCyan }
    if ($ModuleInfo.Notes) { Write-Host "  Notes: $($ModuleInfo.Notes)" -ForegroundColor Gray }

    $moduleResult = [PSCustomObject]@{
        Name = $moduleNameToCheck; Type = $moduleType; Status = "Not Checked"; RequiredVersion = $reqVersion.ToString();
        InstalledVersion = "N/A"; Path = "N/A"; Notes = ""; IsRSAT = $isRSATTool
    }

    $attemptedFixThisRun = $false 

    for ($attempt = 1; $attempt -le 2; $attempt++) { 
        $availableModule = Get-Module -ListAvailable -Name $moduleNameToCheck -ErrorAction SilentlyContinue
        
        if (-not $availableModule) {
            $moduleResult.Status = "Not Found"
            $moduleResult.Notes = "Module is not installed or not discoverable in PSModulePath."
            if ($isRSATTool) {
                $moduleResult.Notes += " This is an RSAT tool; install via Windows Features (e.g., Add-WindowsCapability or DISM)."
            }
            if ($attempt -eq 1) { Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Red }

            if (-not $attemptedFixThisRun -and -not $isRSATTool) { 
                if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult)) {
                    $attemptedFixThisRun = $true; continue 
                } else { break } 
            } elseif ($isRSATTool) {
                Write-Host "  Action: Manual installation required via Windows Features for '$moduleNameToCheck'." -ForegroundColor Yellow
                break 
            } else { break } 
        } else { 
            $latestAvailable = $availableModule | Sort-Object Version -Descending | Select-Object -First 1
            $moduleResult.Path = $latestAvailable.Path
            $installedVersion = $latestAvailable.Version
            $moduleResult.InstalledVersion = $installedVersion.ToString()

            $statusMsg = if ($attemptedFixThisRun) { "Status after fix attempt: Found" } else { "Status: Found" }
            Write-Host "  $statusMsg (Available)" -ForegroundColor Green
            Write-Host "  Installed Version: $($moduleResult.InstalledVersion)" -ForegroundColor White
            
            if ($installedVersion -lt $reqVersion) {
                $moduleResult.Status = "Version Mismatch (Installed: $($moduleResult.InstalledVersion), Minimum Expected: $($moduleResult.RequiredVersion))"
                $moduleResult.Notes = "Installed version is older than minimum expected."
                if ($isRSATTool) { $moduleResult.Notes += " This is an RSAT tool; update via Windows Features or ensure correct version is installed." }
                
                if ($attempt -eq 1 -and -not $attemptedFixThisRun) { Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Yellow }
                
                if (-not $attemptedFixThisRun -and -not $isRSATTool) {
                    if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult)) {
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
                    if ($importedModule) {
                        $moduleResult.Status = "Imported Successfully (Version OK)"
                        Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Green
                        Write-Host "  Loaded Version: $($importedModule.Version.ToString())" -ForegroundColor White
                    } else {
                        $moduleResult.Status = "Import Attempted (No Object Returned, Version OK)"
                        $moduleResult.Notes += " Module import did not return an object; status post-import uncertain but no error thrown."
                        Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Yellow
                    }
                } catch {
                    $moduleResult.Status = "Import Failed (Version OK)"
                    $moduleResult.Notes += " Error during import: $($_.Exception.Message). Module might be corrupt or have unresolved dependencies."
                    Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Red
                    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
                } finally {
                    if ($importedModule) {
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
Write-SectionHeader "M&A Discovery Suite - PowerShell Module Dependency Check"
Write-Host "This script checks required and optional PowerShell modules for the M&A Discovery Suite."
if ($AutoFix) { 
    Write-Host "AUTO-FIX MODE ACTIVE: Script will attempt to install/update missing or outdated modules from PSGallery (using -Force)." -ForegroundColor Magenta
    Write-Host "RSAT tools (ActiveDirectory, GroupPolicy) require manual installation via Windows Features and are NOT auto-fixed." -ForegroundColor Yellow
} elseif ($PSBoundParameters.ContainsKey('Confirm') -and -not $ConfirmPreference) { 
     Write-Host "NON-INTERACTIVE MODE: Script will attempt to install/update modules from PSGallery without individual prompts." -ForegroundColor Magenta
}
else {
    Write-Host "INFO: To attempt automatic installation/updates for PSGallery modules without individual prompts, re-run with -AutoFix or -Confirm:`$false." -ForegroundColor Cyan
}
Write-Host "An internet connection is required for installations/updates from PSGallery." -ForegroundColor Yellow
Write-Host "Modules are installed/updated for the CurrentUser scope." -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date)"

if ($ModulesToCheck.Count -eq 0) {
    Write-Warning "No modules specified or found in predefined lists to check."
    # Setting a non-zero exit code if no modules to check, as it's an unexpected state.
    if ($Host.Name -eq "ConsoleHost") { exit 1 } else { throw "No modules to check." }
}

foreach ($moduleDef in $ModulesToCheck) {
    Test-SingleModule -ModuleInfo $moduleDef
}

Write-SectionHeader "Dependency Check Summary"
$Results | Format-Table -AutoSize -Wrap

$criticalIssues = $Results | Where-Object { 
    ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted (No Object Returned, Version OK)") -and $_.Type -eq "CRITICAL REQUIRED"
}
$conditionalOrOptionalIssues = $Results | Where-Object { 
    ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK" -and $_.Status -notlike "Import Attempted (No Object Returned, Version OK)") -and $_.Type -ne "CRITICAL REQUIRED"
}

$overallSuccess = $true

if ($criticalIssues.Count -eq 0) {
    Write-Host "`nAll CRITICAL REQUIRED PowerShell modules appear to be correctly installed, versioned, and importable." -ForegroundColor Green
    if ($conditionalOrOptionalIssues.Count -gt 0) {
        Write-Host "However, please review warnings for Conditionally Required/Optional modules, as they might affect specific functionalities." -ForegroundColor Yellow
    }
} else {
    $overallSuccess = $false
    Write-Host "`nERROR: CRITICAL ISSUES FOUND WITH REQUIRED MODULES:" -ForegroundColor Red
    $criticalIssues | ForEach-Object {
        Write-Host "  - $($_.Name) ($($_.Type)): Status: $($_.Status)." -ForegroundColor Red
        Write-Host "    Installed: $($_.InstalledVersion), Minimum Expected: $($_.RequiredVersion). Notes: $($_.Notes)" -ForegroundColor Red
        if ($_.IsRSAT) {
             Write-Host "    ACTION: This is an RSAT tool. Please install/update it via Windows Features." -ForegroundColor Red
        } elseif ($_.Status -match "No match was found" -or $_.Status -match "Install/Update Failed") {
             Write-Host "    ACTION: Failed to install/update from PSGallery. Check internet, PSGallery (Get-PSRepository), or try manual install: Install-Module $($_.Name) -Scope CurrentUser -Force" -ForegroundColor Red
        }
        Write-Host "    IMPACT: Core functionalities of the M&A Discovery Suite WILL LIKELY FAIL." -ForegroundColor Red
    }
     Write-Host "`nPlease address the CRITICAL issues with REQUIRED modules above to ensure the M&A Discovery Suite can run correctly." -ForegroundColor Red
}

if ($conditionalOrOptionalIssues.Count -gt 0) {
    # These are warnings, not necessarily failures for the script's exit code unless they are truly blocking for a specific run.
    Write-Host "`nWARNING: Issue(s) found with CONDITIONALLY REQUIRED or OPTIONAL modules:" -ForegroundColor Yellow
    $conditionalOrOptionalIssues | ForEach-Object {
        Write-Host "  - $($_.Name) ($($_.Type)): Status: $($_.Status)." -ForegroundColor Yellow
        Write-Host "    Installed: $($_.InstalledVersion), Minimum Expected: $($_.RequiredVersion). Notes: $($_.Notes)" -ForegroundColor Yellow
         if ($_.IsRSAT) {
             Write-Host "    ACTION: This is an RSAT tool. If needed, please install/update it via Windows Features." -ForegroundColor Yellow
        } elseif ($_.Status -match "No match was found" -or $_.Status -match "Install/Update Failed") {
             Write-Host "    ACTION: Failed to install/update from PSGallery. If this module is needed, check internet, PSGallery (Get-PSRepository), or try manual install: Install-Module $($_.Name) -Scope CurrentUser -Force" -ForegroundColor Yellow
        }
        Write-Host "    IMPACT: Specific discovery sources or export features might not work as expected if this module is required by your configuration." -ForegroundColor Yellow
    }
}

Write-Host "`nDependency check finished at $(Get-Date)."
Write-Host "If issues persist after attempted fixes, manual intervention (e.g., running PowerShell as Administrator, checking execution policies, manually installing modules/features, or verifying PSGallery configuration with Get-PSRepository) may be required." -ForegroundColor Gray

# Set exit code based on critical issues
if (-not $overallSuccess) {
    if ($Host.Name -eq "ConsoleHost") {
        exit 1 # Exit with error code 1 if there were critical issues
    } else {
        # In ISE or other hosts, throw to indicate failure
        throw "Critical module dependencies are not met." 
    }
}
#endregion Main Script Body
