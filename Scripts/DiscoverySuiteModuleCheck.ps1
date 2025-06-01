#Requires -Version 5.1
<#
.SYNOPSIS
    Checks the availability, version, and basic integrity of PowerShell modules required 
    or recommended for the M&A Discovery Suite.

.DESCRIPTION
    This script iterates through a predefined list of PowerShell modules,
    checks if they are installed, compares their version against a minimum expected version,
    attempts to import them, and reports their status.
    It can attempt to install or update modules from the PowerShell Gallery.
    It can also attempt to install missing RSAT tools (requires Administrator privileges).

.PARAMETER ModuleName
    Optional. An array of specific module names to check. If not provided, all predefined modules are checked.

.PARAMETER AutoFix
    Optional. Switch to attempt automatic installation or update of modules from PSGallery
    that are missing or below the required version. Also attempts to install missing RSAT tools
    if run with Administrator privileges. Uses -Force with Install-Module.

.PARAMETER Silent
    Optional. Switch to suppress individual confirmation prompts when -AutoFix is also used.
    Effectively makes -AutoFix non-interactive for PSGallery module and RSAT tool installations.

.NOTES
    Version: 2.0.8
    Author: Gemini & User
    Date: 2025-06-01

    Instructions:
    1. Run this script on the machine where you intend to run the M&A Discovery Suite.
    2. For RSAT tool installation (-AutoFix), RUN AS ADMINISTRATOR.
    3. Review the output for any errors or warnings. CRITICAL errors for required modules
       will prevent parts of the M&A Discovery Suite from functioning correctly.
    4. The module 'Microsoft.Graph.Policies' was removed from checks as it's not a standalone installable module.
       The script 'ExternalIdentityDiscovery.psm1' must be updated to require the correct Graph SDK module(s) it uses.

.EXAMPLE
    # Check modules, attempt to auto-fix Gallery modules and RSAT tools (prompts for each)
    .\DiscoverySuiteModuleCheck.ps1 -AutoFix 

.EXAMPLE
    # Check modules, silently auto-fix Gallery modules and RSAT tools (requires Admin for RSAT)
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

#===============================================================================
#                           HELPER FUNCTION - ADMIN CHECK
#===============================================================================
function Test-IsAdministrator {
    try {
        $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
        return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    }
    catch {
        Write-Warning "Could not determine administrator status: $($_.Exception.Message)"
        return $false
    }
}

#===============================================================================
#                           CONFIGURATION SECTION
#===============================================================================

$script:IsAdmin = Test-IsAdministrator
$script:GlobalMandAConfig = $null

if ($null -ne $global:MandA -and $null -ne $global:MandA.Config) {
    $script:GlobalMandAConfig = $global:MandA.Config
} 
else {
    Write-Warning "Global configuration `$global:MandA.Config` not found. Attempting to load default config for module check. Paths might be incorrect if not run via QuickStart."
    $PSScriptRootDiscoveryModuleCheck = $PSScriptRoot 
    if ($null -eq $PSScriptRootDiscoveryModuleCheck) { 
        $PSScriptRootDiscoveryModuleCheck = Split-Path $MyInvocation.MyCommand.Definition -Parent
    }
    $standaloneConfigPath = Join-Path $PSScriptRootDiscoveryModuleCheck "..\Configuration\default-config.json" 
    
    if (Test-Path $standaloneConfigPath) {
        try { 
            $script:GlobalMandAConfig = Get-Content $standaloneConfigPath | ConvertFrom-Json 
        } 
        catch { 
            Write-Error "Failed to load standalone config: $($_.Exception.Message)."
            $script:GlobalMandAConfig = $null 
        }
    } 
    else { 
        Write-Warning "Standalone config not found at $standaloneConfigPath. Cannot determine enabled discovery sources for dynamic criticality."
        $script:GlobalMandAConfig = $null 
    }
}

$configModules = $null
$enabledDiscoverySources = @() # This variable is not used in v2.0.8 for criticality change

if ($null -ne $script:GlobalMandAConfig) {
    if ($script:GlobalMandAConfig.discovery -is [System.Management.Automation.PSCustomObject] -and $script:GlobalMandAConfig.discovery.PSObject.Properties['powershellModules']) {
        $configModules = $script:GlobalMandAConfig.discovery.powershellModules
    }
    # $enabledDiscoverySources is not used for dynamic criticality in this version
}

#-------------------------------------------------------------------------------
# Module Definitions
#-------------------------------------------------------------------------------
Function Get-ModuleDefinition {
    param (
        [string]$Name, 
        [string]$DefaultVersion, 
        [string]$Category, 
        [string]$Notes, 
        [bool]$IsRSAT = $false,
        [string]$RSATCapabilityName = "" 
    )

    $reqVersion = $DefaultVersion
    $effectiveNotes = $Notes

    if ($null -ne $configModules) {
        if (($configModules -is [System.Management.Automation.PSCustomObject] -or $configModules -is [hashtable]) -and $configModules.PSObject.Properties[$Name]) {
            $moduleConfigEntry = $configModules.$Name
            if (($moduleConfigEntry -is [System.Management.Automation.PSCustomObject] -or $moduleConfigEntry -is [hashtable]) -and $moduleConfigEntry.PSObject.Properties['RequiredVersion']) {
                 $reqVersion = $moduleConfigEntry.RequiredVersion
            }
            if (($moduleConfigEntry -is [System.Management.Automation.PSCustomObject] -or $moduleConfigEntry -is [hashtable]) -and $moduleConfigEntry.PSObject.Properties['Notes']) {
                 $effectiveNotes = $moduleConfigEntry.Notes
            }
        }
    }
    return @{ 
        Name = $Name; 
        RequiredVersion = $reqVersion; 
        Category = $Category; 
        Notes = $effectiveNotes; 
        IsRSAT = $IsRSAT;
        RSATCapabilityName = $RSATCapabilityName 
    }
}

$ModulesToCheck = @(
    (Get-ModuleDefinition -Name "Microsoft.Graph.Authentication" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "Essential for all Microsoft Graph API authentication.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Users" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Azure AD user discovery.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Groups" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Azure AD group discovery.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Applications" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Azure AD App Registrations, Enterprise Apps.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.Identity.DirectoryManagement" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For Directory Roles, Organization Info. May be used by ExternalIdentityDiscovery.") # Updated Note
    (Get-ModuleDefinition -Name "Microsoft.Graph.Identity.SignIns" -DefaultVersion "2.10.0" -Category "CRITICAL REQUIRED" -Notes "For user sign-in activity. May provide policy cmdlets for ExternalIdentityDiscovery.") # Updated Note
    # Removed Microsoft.Graph.Policies as it's not a standalone module
    (Get-ModuleDefinition -Name "Microsoft.Graph.Reports" -DefaultVersion "2.10.0" -Category "RECOMMENDED" -Notes "Required for certain usage reports.")
    (Get-ModuleDefinition -Name "Microsoft.Graph.DeviceManagement" -DefaultVersion "2.10.0" -Category "RECOMMENDED" -Notes "Required for Intune device, policy, and application discovery.")
    (Get-ModuleDefinition -Name "ExchangeOnlineManagement" -DefaultVersion "3.2.0" -Category "CRITICAL REQUIRED" -Notes "For all Exchange Online discovery.")
    
    (Get-ModuleDefinition -Name "ActiveDirectory" -DefaultVersion "1.0.1.0" -Category "CONDITIONALLY REQUIRED" -Notes "For on-premises AD discovery." -IsRSAT $true -RSATCapabilityName "RSAT.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0")
    (Get-ModuleDefinition -Name "DnsServer" -DefaultVersion "2.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For DNS discovery." -IsRSAT $true -RSATCapabilityName "RSAT.Dns.Tools~~~~0.0.1.0") 
    (Get-ModuleDefinition -Name "GroupPolicy" -DefaultVersion "1.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For GPO discovery." -IsRSAT $true -RSATCapabilityName "RSAT.GroupPolicy.Management.Tools~~~~0.0.1.0")
    (Get-ModuleDefinition -Name "DfsMgmt" -DefaultVersion "2.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For DFS discovery." -IsRSAT $true -RSATCapabilityName "RSAT.FileServices.Tools~~~~0.0.1.0") 
    (Get-ModuleDefinition -Name "FailoverClusters" -DefaultVersion "2.0.0.0" -Category "CONDITIONALLY REQUIRED" -Notes "For File Server Cluster discovery." -IsRSAT $true -RSATCapabilityName "RSAT.FailoverCluster.Management.Tools~~~~0.0.1.0") 

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

#===============================================================================
#                           HELPER FUNCTIONS
#===============================================================================

function Write-SectionHeader { 
    param(
        [string]$Header
    )
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
    param(
        [string]$Status
    )
    switch ($Status) {
        "SUCCESS" { Write-Host " [OK] " -BackgroundColor DarkGreen -ForegroundColor White -NoNewline }
        "ERROR"   { Write-Host " [!!] " -BackgroundColor DarkRed -ForegroundColor White -NoNewline }
        "WARNING" { Write-Host " [??] " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline }
        "INFO"    { Write-Host " [>>] " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline }
        "WORKING" { Write-Host " [...] " -BackgroundColor DarkMagenta -ForegroundColor White -NoNewline }
    }
}

function Write-ModuleStatus {
    param(
        [string]$Message, 
        [string]$Status, 
        [string]$Color = "White"
    )
    Write-Host "    " -NoNewline
    Write-StatusIcon -Status $Status
    Write-Host " $Message" -ForegroundColor $Color
}

function Install-OrUpdateModuleViaPSGallery {
    [CmdletBinding(SupportsShouldProcess = $true)] 
    param(
        [Parameter(Mandatory = $true)] 
        [string]$ModuleNameForInstall,
        
        [Parameter(Mandatory = $true)] 
        [version]$ReqVersion,
        
        [Parameter(Mandatory = $true)] 
        [ref]$ModuleResultToUpdateRef,
        
        [Parameter(Mandatory = $true)] 
        [bool]$AttemptAutoFix,
        
        [Parameter(Mandatory = $true)] 
        [bool]$AttemptSilentFix
    )
    
    $installModuleParams = @{
        Name            = $ModuleNameForInstall
        MinimumVersion  = $ReqVersion.ToString() 
        Scope           = "CurrentUser"
        AllowClobber    = $true
        AcceptLicense   = $true 
        ErrorAction     = "Stop"
    }
    if ($AttemptAutoFix) { 
        $installModuleParams.Force = $true 
    }

    $shouldProceedWithInstall = $false
    $shouldProcessMessage = "Install/Update module '$ModuleNameForInstall' to minimum version $($ReqVersion.ToString()) from PowerShell Gallery?"

    if ($AttemptAutoFix -and $AttemptSilentFix) {
        $shouldProceedWithInstall = $true
        Write-ModuleStatus -Message "Attempting PSGallery install/update for '$ModuleNameForInstall' (Silent AutoFix mode)" -Status "WORKING" -Color "Magenta"
    } 
    elseif ($AttemptAutoFix) {
        if ($PSCmdlet.ShouldProcess($ModuleNameForInstall, $shouldProcessMessage)) {
            $shouldProceedWithInstall = $true
            Write-ModuleStatus -Message "Attempting PSGallery install/update for '$ModuleNameForInstall' (User confirmed)" -Status "WORKING" -Color "Magenta"
        } 
        else {
            $ModuleResultToUpdateRef.Value.Notes += " User skipped PSGallery install/update."
            Write-ModuleStatus -Message "Skipping PSGallery install/update for '$ModuleNameForInstall' (User declined)" -Status "WARNING" -Color "Yellow"
        }
    } 
    else {
        $ModuleResultToUpdateRef.Value.Notes += " AutoFix not enabled for PSGallery modules."
        Write-ModuleStatus -Message "AutoFix not enabled for PSGallery module '$ModuleNameForInstall'" -Status "INFO" -Color "Cyan"
        return $false
    }

    if (-not $shouldProceedWithInstall) { 
        return $false 
    }

    try {
        if (-not (Get-Command Install-Module -ErrorAction SilentlyContinue)) {
            $ModuleResultToUpdateRef.Value.Status = "Install Failed (PowerShellGet Missing)"
            $ModuleResultToUpdateRef.Value.Notes = "Install-Module command not found. PowerShellGet module might be missing."
            Write-ModuleStatus -Message "PowerShellGet module not available for PSGallery operations" -Status "ERROR" -Color "Red"
            Return $false
        }

        $psGallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
        if ($null -eq $psGallery) {
            Write-ModuleStatus -Message "PSGallery repository not found - attempting to register" -Status "WARNING" -Color "Yellow"
            try {
                Register-PSRepository -Default -InstallationPolicy Trusted -ErrorAction Stop
                $psGallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
                if ($null -eq $psGallery) { 
                    $ModuleResultToUpdateRef.Value.Notes += " PSGallery registration failed." 
                } 
                else { 
                    Write-ModuleStatus -Message "PSGallery repository registered successfully" -Status "SUCCESS" -Color "Green"
                }
            } 
            catch { 
                $ModuleResultToUpdateRef.Value.Notes += " Error registering PSGallery: $($_.Exception.Message)" 
            }
        } 
        elseif ($psGallery.InstallationPolicy -ne 'Trusted') {
            Write-ModuleStatus -Message "Setting PSGallery to trusted repository" -Status "INFO" -Color "Cyan"
            Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -ErrorAction Stop
            Write-ModuleStatus -Message "PSGallery is now trusted" -Status "SUCCESS" -Color "Green"
        }
        
        Install-Module @installModuleParams 
        $ModuleResultToUpdateRef.Value.Notes += " PSGallery Install/update attempted." 
        Write-ModuleStatus -Message "Module '$ModuleNameForInstall' PSGallery install/update completed" -Status "SUCCESS" -Color "Green"
        Return $true 
    } 
    catch {
        $ModuleResultToUpdateRef.Value.Status = "PSGallery Install/Update Failed"
        # Check if the error is about "No match was found" specifically
        if ($_.Exception.Message -like "*No match was found*") {
            $ModuleResultToUpdateRef.Value.Notes = "PSGallery Error: Module '$ModuleNameForInstall' not found in any registered repository. Verify module name."
        } else {
            $ModuleResultToUpdateRef.Value.Notes = "PSGallery Error: $($_.Exception.Message)"
        }
        Write-ModuleStatus -Message "PSGallery install/update failed for '$ModuleNameForInstall': $($ModuleResultToUpdateRef.Value.Notes)" -Status "ERROR" -Color "Red"
        Return $false
    }
}

function Install-RSATModuleTool {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [Parameter(Mandatory = $true)]
        [string]$RSATModuleName,

        [Parameter(Mandatory = $true)]
        [string]$CapabilityName,

        [Parameter(Mandatory = $true)]
        [ref]$ModuleResultToUpdateRef,

        [Parameter(Mandatory = $true)]
        [bool]$AttemptSilentFix
    )

    if (-not $script:IsAdmin) {
        $ModuleResultToUpdateRef.Value.Notes += " RSAT install requires Administrator privileges."
        Write-ModuleStatus -Message "Skipping RSAT tool '$RSATModuleName' install: Requires Administrator privileges." -Status "WARNING" -Color "Yellow"
        return $false
    }

    if ([string]::IsNullOrWhiteSpace($CapabilityName)) {
        $ModuleResultToUpdateRef.Value.Notes += " No Windows Capability Name defined for $RSATModuleName."
        Write-ModuleStatus -Message "Cannot install RSAT tool '$RSATModuleName': No Capability Name mapped." -Status "ERROR" -Color "Red"
        return $false
    }
    
    $shouldProcessMessage = "Install RSAT tool '$RSATModuleName' (Windows Capability: '$CapabilityName')?"
    $shouldProceedWithInstall = $false

    if ($AttemptSilentFix) {
        $shouldProceedWithInstall = $true
        Write-ModuleStatus -Message "Attempting to install RSAT tool '$RSATModuleName' (Silent AutoFix mode)" -Status "WORKING" -Color "Magenta"
    }
    elseif ($PSCmdlet.ShouldProcess($CapabilityName, $shouldProcessMessage)) { 
        $shouldProceedWithInstall = $true
        Write-ModuleStatus -Message "Attempting to install RSAT tool '$RSATModuleName' (User confirmed)" -Status "WORKING" -Color "Magenta"
    }
    else {
        $ModuleResultToUpdateRef.Value.Notes += " User skipped RSAT tool install."
        Write-ModuleStatus -Message "Skipping RSAT tool '$RSATModuleName' install (User declined)" -Status "WARNING" -Color "Yellow"
        return $false
    }

    if (-not $shouldProceedWithInstall) {
        return $false
    }

    try {
        Write-ModuleStatus -Message "Checking current state of capability '$CapabilityName'..." -Status "INFO"
        $capability = Get-WindowsCapability -Online -Name $CapabilityName -ErrorAction Stop 
        
        if ($capability.State -eq 'Installed') {
            $ModuleResultToUpdateRef.Value.Notes += " RSAT Capability '$CapabilityName' already installed."
            Write-ModuleStatus -Message "RSAT tool '$RSATModuleName' (Capability '$CapabilityName') is already installed." -Status "SUCCESS" -Color "Green"
            return $true
        }

        Write-ModuleStatus -Message "Installing Windows Capability '$CapabilityName' for module '$RSATModuleName'. This may take some time..." -Status "WORKING" -Color "Magenta"
        Add-WindowsCapability -Online -Name $CapabilityName -ErrorAction Stop
        
        Start-Sleep -Seconds 2 
        $capability = Get-WindowsCapability -Online -Name $CapabilityName -ErrorAction SilentlyContinue 
        
        if ($capability.State -eq 'Installed') {
            $ModuleResultToUpdateRef.Value.Notes += " RSAT Capability '$CapabilityName' installed successfully."
            Write-ModuleStatus -Message "RSAT tool '$RSATModuleName' (Capability '$CapabilityName') installed successfully." -Status "SUCCESS" -Color "Green"
            return $true
        } 
        else {
            $errorMessageDetail = "Capability '$CapabilityName' not in 'Installed' state after Add-WindowsCapability. Current state: $($capability.State)."
            if ($capability.State -eq 'NotPresent') {
                $errorMessageDetail += " This often means the system could not download the payload. Ensure Administrator rights, check Internet connectivity, Windows Update service status, and for restrictive Group Policies. Try manual installation via Windows Settings (Optional Features) or DISM using 'DISM.exe /Online /Add-Capability /CapabilityName:$CapabilityName'."
            }
            throw $errorMessageDetail
        }
    }
    catch {
        $ModuleResultToUpdateRef.Value.Status = "RSAT Install Failed"
        $ModuleResultToUpdateRef.Value.Notes += " RSAT Install Error for '$CapabilityName': $($_.Exception.Message)."
        Write-ModuleStatus -Message "Failed to install RSAT tool '$RSATModuleName' (Capability '$CapabilityName'): $($_.Exception.Message)" -Status "ERROR" -Color "Red"
        return $false
    }
}


function Test-SingleModule {
    param(
        [PSObject]$ModuleInfo, 
        [bool]$AttemptAutoFix, 
        [bool]$AttemptSilentFix
        # Removed CurrentEnabledDiscoverySources as the dynamic criticality for Microsoft.Graph.Policies was based on a non-existent module
    )
    
    $moduleNameToCheck = $ModuleInfo.Name
    $effectiveCategory = $ModuleInfo.Category # Use original category from definition
    $reqVersion = [version]$ModuleInfo.RequiredVersion
    $isRSATTool = [bool]$ModuleInfo.IsRSAT
    $rsatCapabilityName = $ModuleInfo.RSATCapabilityName
    
    #---------------------------------------------------------------------------
    # Module Header Display
    #---------------------------------------------------------------------------
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host ("-" * 78) -ForegroundColor DarkGray
    
    Write-Host "  " -NoNewline
    $categoryColor = switch ($effectiveCategory) { 
        "CRITICAL REQUIRED"      { "Red" }
        "CONDITIONALLY REQUIRED" { "Yellow" }
        "RECOMMENDED"            { "Cyan" }
        "OPTIONAL"               { "Gray" }
        default                  { "White" }
    }
    
    Write-Host " [$effectiveCategory] " -BackgroundColor DarkBlue -ForegroundColor $categoryColor -NoNewline 
    Write-Host " $moduleNameToCheck " -ForegroundColor White -NoNewline
    Write-Host "(Min: $($reqVersion.ToString()))" -ForegroundColor Gray
    
    if ($isRSATTool) { 
        Write-Host "    " -NoNewline
        Write-Host " RSAT TOOL " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
        Write-Host " Requires Windows Feature/Capability installation. Attempting if -AutoFix." -ForegroundColor Yellow
    }
    
    if ($ModuleInfo.Notes) { 
        Write-Host "    " -NoNewline
        Write-Host " INFO " -BackgroundColor DarkGreen -ForegroundColor White -NoNewline
        Write-Host " $($ModuleInfo.Notes)" -ForegroundColor Gray
    }
    
    $moduleResult = [PSCustomObject]@{ 
        Name             = $moduleNameToCheck
        Category         = $effectiveCategory 
        Status           = "Not Checked"
        RequiredVersion  = $reqVersion.ToString()
        InstalledVersion = "N/A"
        Path             = "N/A"
        Notes            = ""
        IsRSAT           = $isRSATTool 
    }
    
    $attemptedFixThisRun = $false 
    
    #---------------------------------------------------------------------------
    # Module Check Loop (Max 2 attempts if fix is applied)
    #---------------------------------------------------------------------------
    for ($attempt = 1; $attempt -le 2; $attempt++) { 
        $availableModule = Get-Module -ListAvailable -Name $moduleNameToCheck -ErrorAction SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
        
        if ($null -eq $availableModule) {
            $moduleResult.Status = "Not Found"
            $moduleResult.Notes = "Module not installed/discoverable."
            
            if ($attempt -eq 1) { 
                Write-ModuleStatus -Message "Module not found" -Status "ERROR" -Color "Red"
            }
            
            if (-not $attemptedFixThisRun) {
                if ($isRSATTool) {
                    if ($AttemptAutoFix) {
                        if (Install-RSATModuleTool -RSATModuleName $moduleNameToCheck -CapabilityName $rsatCapabilityName -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptSilentFix $AttemptSilentFix) {
                            $attemptedFixThisRun = $true
                            Start-Sleep -Seconds 2 
                            continue 
                        } else { break } 
                    } else {
                        $moduleResult.Notes += " Install via Windows Features/Capabilities or use -AutoFix (as Admin)."
                        Write-ModuleStatus -Message "Manual installation or -AutoFix (as Admin) required for RSAT tool" -Status "WARNING" -Color "Yellow"
                        break
                    }
                } else { 
                    if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) { 
                        $attemptedFixThisRun = $true
                        continue 
                    } else { break } 
                }
            } else { break } 
        } 
        else { 
            #-------------------------------------------------------------------
            # Module Found
            #-------------------------------------------------------------------
            $moduleResult.Path = $availableModule.Path
            $installedVersion = $availableModule.Version
            $moduleResult.InstalledVersion = $installedVersion.ToString()
            
            $statusText = if ($attemptedFixThisRun) { "Found (after fix attempt)" } else { "Found" }
            Write-ModuleStatus -Message "$statusText - Version: $($moduleResult.InstalledVersion)" -Status "SUCCESS" -Color "Green"
            
            if ($installedVersion -lt $reqVersion) {
                #---------------------------------------------------------------
                # Version Mismatch
                #---------------------------------------------------------------
                $moduleResult.Status = "Version Mismatch"
                $moduleResult.Notes = "Installed version older than expected."
                
                if ($attempt -eq 1 -and -not $attemptedFixThisRun) { 
                    Write-ModuleStatus -Message "Version is below minimum requirement" -Status "WARNING" -Color "Yellow"
                }
                
                if (-not $attemptedFixThisRun) {
                    if ($isRSATTool) {
                        $moduleResult.Notes += " Update via Windows Features if issues persist or version is critical."
                        Write-ModuleStatus -Message "RSAT tool version is low. Manual update via Windows Features may be needed." -Status "WARNING" -Color "Yellow"
                        break 
                    } else { 
                        if (Install-OrUpdateModuleViaPSGallery -ModuleNameForInstall $moduleNameToCheck -ReqVersion $reqVersion -ModuleResultToUpdateRef ([ref]$moduleResult) -AttemptAutoFix $AttemptAutoFix -AttemptSilentFix $AttemptSilentFix) { 
                            $attemptedFixThisRun = $true
                            continue 
                        } else { break } 
                    }
                } else { break } 
            } 
            else { 
                #---------------------------------------------------------------
                # Version OK - Test Import
                #---------------------------------------------------------------
                $moduleResult.Status = "Version OK"
                if (-not $attemptedFixThisRun) { 
                    Write-ModuleStatus -Message "Version requirement satisfied" -Status "SUCCESS" -Color "Green"
                } 
                
                $importedModule = $null
                try { 
                    Write-ModuleStatus -Message "Testing module import capability" -Status "INFO" -Color "Cyan"
                    $importedModule = Import-Module -Name $moduleNameToCheck -RequiredVersion $installedVersion -Force -PassThru -ErrorAction Stop
                    
                    if ($null -ne $importedModule) { 
                        $moduleResult.Status = "Imported Successfully (Version OK)"
                        Write-ModuleStatus -Message "Module imported successfully" -Status "SUCCESS" -Color "Green"
                    } 
                    else { 
                        $moduleResult.Status = "Import Attempted (No Object Returned, Version OK)"
                        $moduleResult.Notes += " Import did not return object."
                        Write-ModuleStatus -Message "Import completed but no object returned" -Status "WARNING" -Color "Yellow"
                    }
                } 
                catch { 
                    $moduleResult.Status = "Import Failed (Version OK)"
                    $moduleResult.Notes += " Import Error: $($_.Exception.Message)."
                    Write-ModuleStatus -Message "Import failed: $($_.Exception.Message)" -Status "ERROR" -Color "Red"
                } 
                finally { 
                    if ($null -ne $importedModule) { 
                        try { Remove-Module -Name $moduleNameToCheck -Force -ErrorAction SilentlyContinue } catch {} 
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

#===============================================================================
#                           MAIN SCRIPT BODY
#===============================================================================
Clear-Host
Write-Host ""
Write-Host "  " -NoNewline
Write-Host ("=" * 80) -ForegroundColor DarkCyan
Write-Host "  " -NoNewline
Write-Host " M&A DISCOVERY SUITE - MODULE DEPENDENCY CHECK v2.0.8 " -BackgroundColor DarkCyan -ForegroundColor White
Write-Host "  " -NoNewline
Write-Host ("=" * 80) -ForegroundColor DarkCyan
Write-Host ""

#-------------------------------------------------------------------------------
# Admin Rights Check for RSAT Installation
#-------------------------------------------------------------------------------
if ($AutoFix.IsPresent -and -not $script:IsAdmin) {
    Write-Host "  " -NoNewline
    Write-Host " WARNING " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
    Write-Host " Script is not running with Administrator privileges." -ForegroundColor Yellow
    Write-Host "           RSAT tool installation via -AutoFix will likely fail or be incomplete." -ForegroundColor Yellow 
    Write-Host ""
}

#-------------------------------------------------------------------------------
# Mode Indicators
#-------------------------------------------------------------------------------
if ($AutoFix.IsPresent) { 
    if ($Silent.IsPresent) { 
        Write-Host "  " -NoNewline
        Write-Host " AUTO-FIX MODE (SILENT) " -BackgroundColor DarkRed -ForegroundColor White -NoNewline
        Write-Host " PSGallery modules/RSAT tools will be installed/updated (no prompts)" -ForegroundColor Magenta
    } 
    else { 
        Write-Host "  " -NoNewline
        Write-Host " AUTO-FIX MODE (INTERACTIVE) " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
        Write-Host " Will prompt before installing/updating each PSGallery module/RSAT tool" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " NOTE " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
    Write-Host " RSAT tool installation requires Administrator privileges." -ForegroundColor Cyan
} 
else { 
    Write-Host "  " -NoNewline
    Write-Host " READ-ONLY MODE " -BackgroundColor DarkGreen -ForegroundColor White -NoNewline
    Write-Host " To enable automatic fixes, re-run with -AutoFix parameter" -ForegroundColor Green
}
Write-Host ""

#-------------------------------------------------------------------------------
# General Information
#-------------------------------------------------------------------------------
Write-Host "  " -NoNewline
Write-Host " REQUIREMENTS " -BackgroundColor DarkMagenta -ForegroundColor White -NoNewline
Write-Host " Internet connection may be required | Modules installed for CurrentUser scope" -ForegroundColor Gray
Write-Host ""

Write-Host "  " -NoNewline
Write-Host " TIMESTAMP " -BackgroundColor DarkGray -ForegroundColor White -NoNewline
Write-Host " $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

if ($ModulesToCheck.Count -eq 0) { 
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " ERROR " -BackgroundColor DarkRed -ForegroundColor White -NoNewline
    Write-Host " No modules to check" -ForegroundColor Red
    if ($Host.Name -eq "ConsoleHost") { 
        exit 1 
    } 
    else { 
        throw "No modules to check." 
    } 
}
Write-Host ""

Write-Host "  " -NoNewline
Write-Host " MODULE COUNT " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
Write-Host " Checking $($ModulesToCheck.Count) modules" -ForegroundColor Cyan

# $enabledDiscoverySources is not used directly here anymore for output
# if ($enabledDiscoverySources.Count -gt 0) {
# Write-Host " " -NoNewline
# Write-Host " ENABLED SOURCES " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
# Write-Host " ($($enabledDiscoverySources.Count)): $($enabledDiscoverySources -join ', ')" -ForegroundColor Cyan
# }

#-------------------------------------------------------------------------------
# Iterate and Test Modules
#-------------------------------------------------------------------------------
foreach ($moduleDef in $ModulesToCheck) { 
    Test-SingleModule -ModuleInfo $moduleDef -AttemptAutoFix $AutoFix.IsPresent -AttemptSilentFix $Silent.IsPresent
}

#===============================================================================
#                           RESULTS SUMMARY
#===============================================================================
Write-SectionHeader "DEPENDENCY CHECK RESULTS"

$criticalModules    = $Results | Where-Object { $_.Category -eq "CRITICAL REQUIRED" }
$conditionalModules = $Results | Where-Object { $_.Category -eq "CONDITIONALLY REQUIRED" }
$recommendedModules = $Results | Where-Object { $_.Category -eq "RECOMMENDED" }
$optionalModules    = $Results | Where-Object { $_.Category -eq "OPTIONAL" }

function Write-ModuleTable {
    param(
        [array]$Modules, 
        [string]$CategoryName, 
        [string]$TableCategoryColor
    )
    
    if ($Modules.Count -gt 0) {
        Write-Host ""
        Write-Host "  " -NoNewline
        Write-Host " $CategoryName ($($Modules.Count)) " -BackgroundColor $TableCategoryColor -ForegroundColor White
        Write-Host ""
        
        foreach ($module in $Modules) {
            $statusColor = switch ($module.Status) {
                { $_ -like "Imported Successfully*" } { "Green" }
                "Version OK"                         { "Green" }
                { $_ -like "Import Attempted*" }     { "Yellow" }
                "Version Mismatch"                   { "Yellow" }
                "Not Found"                          { "Red" }
                { $_ -like "*Failed*" }              { "Red" }
                default                              { "Gray" }
            }
            
            $statusIcon = switch ($module.Status) {
                { $_ -like "Imported Successfully*" } { "[OK]" }
                "Version OK"                         { "[OK]" }
                { $_ -like "Import Attempted*" }     { "[??]" }
                "Version Mismatch"                   { "[!!]" }
                "Not Found"                          { "[XX]" }
                { $_ -like "*Failed*" }              { "[XX]" }
                default                              { "[--]" }
            }
            
            Write-Host "    $statusIcon " -ForegroundColor $statusColor -NoNewline
            Write-Host $module.Name.PadRight(40) -ForegroundColor White -NoNewline
            Write-Host " $($module.InstalledVersion.PadRight(12))" -ForegroundColor Gray -NoNewline
            Write-Host " $($module.Status)" -ForegroundColor $statusColor
        }
    }
}

Write-ModuleTable -Modules $criticalModules    -CategoryName "CRITICAL REQUIRED" -TableCategoryColor "DarkRed"
Write-ModuleTable -Modules $conditionalModules -CategoryName "CONDITIONALLY REQUIRED" -TableCategoryColor "DarkYellow"
Write-ModuleTable -Modules $recommendedModules -CategoryName "RECOMMENDED" -TableCategoryColor "DarkBlue"
Write-ModuleTable -Modules $optionalModules    -CategoryName "OPTIONAL" -TableCategoryColor "DarkGray"

#===============================================================================
#                           FINAL ASSESSMENT
#===============================================================================
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
    Write-Host " All CRITICAL REQUIRED modules are properly configured or were auto-fixed." -ForegroundColor Green 
    Write-Host ""
    
    if ($otherIssues.Count -gt 0) { 
        Write-Host "  " -NoNewline
        Write-Host " ADVISORY " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
        Write-Host " Some optional/conditional modules have issues or require manual steps - review warnings above." -ForegroundColor Yellow 
    }
} 
else { 
    $overallSuccess = $false
    Write-Host "  " -NoNewline
    Write-Host " CRITICAL ISSUES DETECTED " -BackgroundColor DarkRed -ForegroundColor White
    Write-Host ""
    
    $criticalIssues | ForEach-Object { 
        Write-Host "    " -NoNewline
        Write-Host " FAIL " -BackgroundColor Red -ForegroundColor White -NoNewline
        Write-Host " $($_.Name) - $($_.Status) (Category: $($_.Category))" -ForegroundColor Red
        Write-Host "         Notes: $($_.Notes)" -ForegroundColor Gray
        
        if ($_.IsRSAT -and ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK")) { 
            Write-Host "         " -NoNewline
            Write-Host " ACTION REQUIRED " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline
            Write-Host " Install/update RSAT tool manually or re-run as Admin with -AutoFix." -ForegroundColor Yellow
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
    Write-Host " WARNINGS / INFO " -BackgroundColor DarkYellow -ForegroundColor Black -NoNewline 
    Write-Host " Issues or notes for non-critical modules:" -ForegroundColor Yellow
    Write-Host ""
    
    $otherIssues | ForEach-Object { 
        Write-Host "    " -NoNewline
        Write-Host " $(if($_.Status -like '*Fail*') {'WARN'} else {'INFO'}) " -BackgroundColor (if($_.Status -like '*Fail*') {'Yellow'} else {'DarkBlue'}) -ForegroundColor (if($_.Status -like '*Fail*') {'Black'} else {'White'}) -NoNewline
        Write-Host " $($_.Name) ($($_.Category)) - $($_.Status)" -ForegroundColor Yellow
        Write-Host "         Notes: $($_.Notes)" -ForegroundColor Gray
        
        if ($_.IsRSAT -and ($_.Status -notlike "Imported Successfully*" -and $_.Status -notlike "Version OK")) { 
            Write-Host "         " -NoNewline
            Write-Host " INFO " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
            Write-Host " For RSAT: Install via Windows Features or use -AutoFix (as Admin) if needed." -ForegroundColor Cyan
        }
    }
}

#-------------------------------------------------------------------------------
# Script Completion
#-------------------------------------------------------------------------------
Write-Host ""
Write-Host "  " -NoNewline
Write-Host ("-" * 78) -ForegroundColor DarkGray
Write-Host "  Dependency check completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray

if (-not $overallSuccess -and -not $AutoFix.IsPresent) { 
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host " TIP " -BackgroundColor DarkBlue -ForegroundColor White -NoNewline
    Write-Host " Re-run with -AutoFix to attempt automatic module/tool installation." -ForegroundColor Cyan 
}

Write-Host ""

if (-not $overallSuccess) { 
    if ($Host.Name -eq "ConsoleHost") { 
        if ($criticalIssues.Count -gt 0) {
            exit 1 
        }
    }
    if ($criticalIssues.Count -gt 0) { 
        throw "Critical module dependencies are not met. Review the output above." 
    } 
}