<#
.SYNOPSIS
    Checks the availability, version, and basic integrity of PowerShell modules required by the M&A Discovery Suite.
.DESCRIPTION
    This script iterates through a predefined list of required and optional PowerShell modules,
    checks if they are installed, compares their version against a required version,
    attempts to import them, and reports their status.
    It will attempt to install or update modules to meet requirements if they are missing or outdated.
.NOTES
    Version: 1.1.2
    Author: Gemini
    Date: 2025-05-28

    Instructions:
    1. Run this script on the machine where you intend to run the M&A Discovery Suite.
    2. Review the output for any errors or warnings.
    3. The script will attempt to install/update modules if needed.
       This requires an internet connection and appropriate permissions to install modules.
       Modules are installed to the CurrentUser scope.
    4. Use the -AutoFix switch to signal intent and see initial messages about auto-fixing.
       Use -Confirm:$false with -AutoFix to suppress installation prompts.
.EXAMPLE
    .\Check-MandAModuleDependencies.ps1
    Runs the dependency check and will attempt to install/update modules, prompting for each.
.EXAMPLE
    .\Check-MandAModuleDependencies.ps1 -AutoFix
    Same as above, but explicitly states auto-fix mode is active.
.EXAMPLE
    .\Check-MandAModuleDependencies.ps1 -AutoFix -Confirm:$false
    Runs the dependency check and attempts to install/update modules without prompting.
.EXAMPLE
    .\Check-MandAModuleDependencies.ps1 -ModuleName "Microsoft.Graph" -AutoFix -Confirm:$false
    Checks and attempts to fix only Microsoft.Graph without prompting.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $false)]
    [string[]]$ModuleName,

    [Parameter(Mandatory = $false)]
    [switch]$AutoFix # Retained for user clarity and potentially controlling ShouldProcess verbosity if desired
)

#region Configuration
$RequiredModules = @(
    @{ Name = "Microsoft.Graph"; RequiredVersion = "2.0.0"; Notes = "Core module for Microsoft Graph API interaction." },
    @{ Name = "Microsoft.Graph.Authentication"; RequiredVersion = "2.0.0"; Notes = "Handles authentication for Microsoft Graph." },
    @{ Name = "ExchangeOnlineManagement"; RequiredVersion = "3.0.0"; Notes = "Required for Exchange Online data collection (EXO V2/V3)." }
)

$OptionalModules = @(
    @{ Name = "ActiveDirectory"; RequiredVersion = "1.0.0"; Notes = "For on-premises Active Directory discovery. Version is less critical." },
    @{ Name = "ImportExcel"; RequiredVersion = "7.0.0"; Notes = "For generating Excel reports." },
    @{ Name = "Az.Accounts"; RequiredVersion = "2.5.0"; Notes = "For Azure Resource Manager interactions (if Azure discovery is used extensively)." }
)

if ($PSBoundParameters.ContainsKey('ModuleName')) {
    Write-Host "Checking specified modules: $($ModuleName -join ', ')" -ForegroundColor Cyan
    $ModulesToCheck = @()
    foreach ($name in $ModuleName) {
        $foundModuleDef = $RequiredModules | Where-Object { $_.Name -eq $name }
        if (-not $foundModuleDef) {
            $foundModuleDef = $OptionalModules | Where-Object { $_.Name -eq $name }
        }
        if ($foundModuleDef) {
            $ModulesToCheck += $foundModuleDef
        } else {
            $ModulesToCheck += @{ Name = $name; RequiredVersion = "0.0.0"; Notes = "Custom module specified by user. Version check skipped for non-predefined." }
            Write-Warning "Module '$name' is not in the predefined list but will be checked (version check skipped unless defined here)."
        }
    }
} else {
    $ModulesToCheck = $RequiredModules + $OptionalModules
}

$Results = [System.Collections.Generic.List[PSObject]]::new()
#endregion Configuration

#region Helper Functions
function Write-SectionHeader {
    param([string]$Header)
    Write-Host "`n"
    Write-Host ("-" * ($Header.Length + 4)) -ForegroundColor DarkCyan
    Write-Host "  $Header  " -ForegroundColor Cyan
    Write-Host ("-" * ($Header.Length + 4)) -ForegroundColor DarkCyan
}

function Install-OrUpdateModule {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModuleName,
        [Parameter(Mandatory = $true)]
        [version]$RequiredVersion,
        [Parameter(Mandatory = $true)]
        [ref]$ModuleResultToUpdate
    )

    # This function will now always attempt to install/update if called,
    # respecting ShouldProcess for user confirmation by default.
    if ($PSCmdlet.ShouldProcess($ModuleName, "Install/Update to version $($RequiredVersion.ToString()) or newer")) {
        Write-Host "  Attempting to install/update module '$ModuleName' to minimum version $($RequiredVersion.ToString())..." -ForegroundColor Magenta
        try {
            if (-not (Get-Command Install-Module -ErrorAction SilentlyContinue)) {
                $ModuleResultToUpdate.Value.Status = "Install Failed (PowerShellGet Missing)"
                $ModuleResultToUpdate.Value.Notes = "Install-Module command not found. Please ensure PowerShellGet module is installed and functional."
                Write-Host "  Status: $($ModuleResultToUpdate.Value.Status)" -ForegroundColor Red
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
                Write-Warning "PSGallery repository not found. Module installation might fail."
            }

            Install-Module -Name $ModuleName -MinimumVersion $RequiredVersion.ToString() -Force -Scope CurrentUser -AllowClobber -AcceptLicense -ErrorAction Stop
            $ModuleResultToUpdate.Value.Notes = "Module installation/update attempted. Re-checking status."
            Write-Host "  Module '$ModuleName' install/update command executed." -ForegroundColor Green
            Return $true # Indicate fix was attempted
        }
        catch {
            $ModuleResultToUpdate.Value.Status = "Install/Update Failed"
            $ModuleResultToUpdate.Value.Notes = "Error during install/update: $($_.Exception.Message)"
            Write-Host "  Status: $($ModuleResultToUpdate.Value.Status)" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            Return $false # Indicate fix attempt failed
        }
    } else {
        $ModuleResultToUpdate.Value.Notes += " User chose not to proceed with install/update (ShouldProcess)."
        Write-Host "  Skipping install/update for '$ModuleName' as per user choice (ShouldProcess)." -ForegroundColor Yellow
        Return $false 
    }
}

function Test-SingleModule {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModuleName,
        [Parameter(Mandatory = $true)]
        [string]$ModuleType, 
        [Parameter(Mandatory = $true)]
        [version]$RequiredVersion,
        [Parameter(Mandatory = $false)]
        [string]$Notes
    )

    Write-Host "`nChecking $ModuleType Module: $ModuleName (Required Version: $($RequiredVersion.ToString()))" -ForegroundColor Yellow
    if ($Notes) {
        Write-Host "  Notes: $Notes" -ForegroundColor Gray
    }

    $moduleResult = [PSCustomObject]@{
        Name = $ModuleName
        Type = $ModuleType
        Status = "Not Checked"
        RequiredVersion = $RequiredVersion.ToString()
        InstalledVersion = "N/A"
        Path = "N/A"
        Notes = ""
    }

    $attemptedFixThisRun = $false 

    for ($attempt = 1; $attempt -le 2; $attempt++) {
        $availableModule = Get-Module -ListAvailable -Name $ModuleName -ErrorAction SilentlyContinue
        
        if (-not $availableModule) {
            $moduleResult.Status = "Not Found"
            $moduleResult.Notes = "Module is not installed or not discoverable in PSModulePath."
            if ($attempt -eq 1) { Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Red }

            if (-not $attemptedFixThisRun) { # Only attempt fix once per module check
                if (Install-OrUpdateModule -ModuleName $ModuleName -RequiredVersion $RequiredVersion -ModuleResultToUpdate ([ref]$moduleResult)) {
                    $attemptedFixThisRun = $true
                    continue 
                } else {
                    break 
                }
            } else {
                break # Already attempted fix, still not found
            }
        } else { 
            $moduleResult.Path = ($availableModule | Select-Object -First 1).Path
            $installedVersion = ($availableModule | Select-Object -First 1).Version
            $moduleResult.InstalledVersion = $installedVersion.ToString()

            if ($attempt -eq 1 -and -not $attemptedFixThisRun) {
                Write-Host "  Status: Found (Available)" -ForegroundColor Green
                Write-Host "  Installed Version: $($moduleResult.InstalledVersion)" -ForegroundColor White
            } elseif ($attemptedFixThisRun) { 
                 Write-Host "  Status after fix attempt: Found (Available)" -ForegroundColor Green
                 Write-Host "  Installed Version after fix attempt: $($moduleResult.InstalledVersion)" -ForegroundColor White
            }

            if ($installedVersion -lt $RequiredVersion) {
                $moduleResult.Status = "Version Mismatch (Installed: $($moduleResult.InstalledVersion), Required: $($moduleResult.RequiredVersion))"
                $moduleResult.Notes = "Installed version is older than required."
                if ($attempt -eq 1 -and -not $attemptedFixThisRun) { Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Yellow }
                
                if (-not $attemptedFixThisRun) { # Only attempt fix once
                    if (Install-OrUpdateModule -ModuleName $ModuleName -RequiredVersion $RequiredVersion -ModuleResultToUpdate ([ref]$moduleResult)) {
                        $attemptedFixThisRun = $true
                        continue
                    } else {
                        break
                    }
                } else {
                    break # Already attempted fix, still mismatched
                }
            } else { 
                $moduleResult.Status = "Version OK"
                if (-not $attemptedFixThisRun) { 
                     Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Green
                } 
                break 
            }
        }
    } 
    
    if ($moduleResult.Status -notlike "Not Found*" -and $moduleResult.Status -notlike "Version Mismatch*" -and $moduleResult.Status -notlike "Install*Failed*") {
        $importedModule = $null
        try {
            Write-Host "  Attempting to import module '$ModuleName'..." -ForegroundColor White
            $importedModule = Import-Module -Name $ModuleName -Force -PassThru -ErrorAction Stop
            if ($importedModule) {
                $moduleResult.Status = "Imported Successfully"
                $moduleResult.InstalledVersion = $importedModule.Version.ToString() 
                $moduleResult.Path = $importedModule.Path
                Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Green
                Write-Host "  Loaded Version: $($moduleResult.InstalledVersion)" -ForegroundColor White
                Write-Host "  Loaded Path: $($moduleResult.Path)" -ForegroundColor White
            } else {
                $moduleResult.Status = "Import Attempted (No Object Returned)"
                $moduleResult.Notes += " Module import did not return an object, status uncertain."
                Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Yellow
            }
        }
        catch {
            $moduleResult.Status = "Import Failed"
            $moduleResult.Notes += " Error during import: $($_.Exception.Message)."
            Write-Host "  Status: $($moduleResult.Status)" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        finally {
            if ($importedModule) {
                try {
                    Write-Host "  Attempting to remove module '$ModuleName' post-check..." -ForegroundColor Gray
                    Remove-Module -Name $ModuleName -Force -ErrorAction SilentlyContinue
                }
                catch {
                    Write-Warning "Could not remove module $ModuleName after testing: $($_.Exception.Message)"
                    $moduleResult.Notes += " (Could not remove after test)."
                }
            }
        }
    } elseif ($moduleResult.Status -eq "Not Checked") {
        $moduleResult.Status = "Check Incomplete"
        $moduleResult.Notes += " Module status could not be fully determined."
    }

    $Results.Add($moduleResult)
}
#endregion Helper Functions

#region Main Script Body
Write-SectionHeader "M&A Discovery Suite - Module Dependency Check"
Write-Host "This script will check the status of required and optional PowerShell modules."
if ($AutoFix) { # Message is still useful
    Write-Host "AUTO-FIX MODE ENABLED (by switch): Script will attempt to install/update missing or outdated modules." -ForegroundColor Magenta
} else {
    Write-Host "INFO: Script will attempt to install/update missing or outdated modules by default." -ForegroundColor Cyan
    Write-Host "Use -Confirm:$false to suppress individual prompts if desired." -ForegroundColor Cyan
}
Write-Host "An internet connection is required for installations/updates." -ForegroundColor Yellow
Write-Host "Modules will be installed for the CurrentUser scope." -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date)"

if ($ModulesToCheck.Count -eq 0) {
    Write-Warning "No modules specified or found in predefined lists to check."
    exit 0
}

foreach ($moduleInfo in $ModulesToCheck) {
    $moduleType = "Custom" 
    if ($RequiredModules.Name -contains $moduleInfo.Name) {
        $moduleType = "Required"
    } elseif ($OptionalModules.Name -contains $moduleInfo.Name) {
        $moduleType = "Optional"
    }
    Test-SingleModule -ModuleName $moduleInfo.Name -ModuleType $moduleType -RequiredVersion ([version]$moduleInfo.RequiredVersion) -Notes $moduleInfo.Notes
}

Write-SectionHeader "Dependency Check Summary"

$Results | Format-Table -AutoSize -Wrap

$criticalIssues = $Results | Where-Object { 
    ($_.Status -like "Not Found*" -or $_.Status -like "*Mismatch*" -or $_.Status -like "Import Failed*" -or $_.Status -like "Install*Failed*") -and $_.Type -eq "Required"
}
$optionalIssues = $Results | Where-Object { 
    ($_.Status -like "Not Found*" -or $_.Status -like "*Mismatch*" -or $_.Status -like "Import Failed*" -or $_.Status -like "Install*Failed*") -and $_.Type -eq "Optional"
}
$customIssues = $Results | Where-Object { 
    ($_.Status -like "Not Found*" -or $_.Status -like "*Mismatch*" -or $_.Status -like "Import Failed*" -or $_.Status -like "Install*Failed*") -and $_.Type -eq "Custom"
}

if (($Results | Where-Object {$_.Type -eq "Required" -and ($_.Status -like "Not Found*" -or $_.Status -like "*Mismatch*" -or $_.Status -like "Import Failed*" -or $_.Status -like "Install*Failed*")}).Count -eq 0) {
    Write-Host "`nAll REQUIRED modules appear to meet version requirements and are importable." -ForegroundColor Green
    if ($optionalIssues.Count -gt 0 -or $customIssues.Count -gt 0) {
        Write-Host "However, please review warnings for optional/custom modules." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nERROR: CRITICAL issues found with REQUIRED modules:" -ForegroundColor Red
    $criticalIssues | ForEach-Object {
        Write-Host "  - $($_.Name) (Required): Status: $($_.Status). Installed: $($_.InstalledVersion), Required: $($_.RequiredVersion). Notes: $($_.Notes)" -ForegroundColor Red
    }
     Write-Host "`nPlease address the CRITICAL issues with REQUIRED modules above to ensure the M&A Discovery Suite can run correctly." -ForegroundColor Red
}

if ($optionalIssues.Count -gt 0) {
    Write-Host "`nWARNING: Issue(s) found with OPTIONAL modules:" -ForegroundColor Yellow
    $optionalIssues | ForEach-Object {
        Write-Host "  - $($_.Name) (Optional): Status: $($_.Status). Installed: $($_.InstalledVersion), Required: $($_.RequiredVersion). Notes: $($_.Notes)" -ForegroundColor Yellow
    }
}

if ($customIssues.Count -gt 0) {
     Write-Host "`nWARNING: Issue(s) found with CUSTOM modules:" -ForegroundColor Yellow
    $customIssues | ForEach-Object {
        Write-Host "  - $($_.Name) (Custom): Status: $($_.Status). Installed: $($_.InstalledVersion), Required: $($_.RequiredVersion). Notes: $($_.Notes)" -ForegroundColor Yellow
    }
}

Write-Host "`nDependency check finished at $(Get-Date)."
#endregion Main Script Body
