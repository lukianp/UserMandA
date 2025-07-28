# This is a patch file with the critical fixes for DiscoveryCreateAppRegistration.ps1
# Apply these changes to your script

# 1. Fix for Write-ProgressHeader function (around line 260)
# REPLACE THIS:
<#
function Write-ProgressHeader {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Title, 
        [Parameter(Mandatory=$false)]
        [string]$Subtitle = ""
    )
    
    $separator = "?" * 90
    Write-Host "`n$separator" @($script:ColorScheme.Separator)
    Write-Host "  ?? $Title" @($script:ColorScheme.Header)
    if ($Subtitle) {
        Write-Host "  ?? $Subtitle" @($script:ColorScheme.Info)
    }
    Write-Host "$separator`n" @($script:ColorScheme.Separator)
}
#>

# WITH THIS:
function Write-ProgressHeader {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Title, 
        [Parameter(Mandatory=$false)]
        [string]$Subtitle = ""
    )
    
    $separator = "?" * 90
    # Extract hashtables to variables for proper splatting
    $separatorParams = $script:ColorScheme.Separator
    Write-Host "`n$separator" @separatorParams
    $headerParams = $script:ColorScheme.Header
    Write-Host "  ?? $Title" @headerParams
    if ($Subtitle) {
        $infoParams = $script:ColorScheme.Info
        Write-Host "  ?? $Subtitle" @infoParams
    }
    Write-Host "$separator`n" @separatorParams
}

# 2. Fix for AutoInstallModules parameter (around line 83)
# REPLACE THIS:
# [switch]$AutoInstallModules = $true,
# WITH THIS:
[switch]$AutoInstallModules

# 3. Fix for module installation logic in Test-Prerequisites (around line 444)
# REPLACE THIS SECTION:
<#
        foreach ($module in $script:ScriptInfo.Dependencies) {
            $installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | 
                Sort-Object Version -Descending | Select-Object -First 1
            
            if ($installedModule) {
                Write-EnhancedLog "Module available: $module v$($installedModule.Version)" -Level SUCCESS
            } else {
                $issues += "Required module '$module' not found. Install with: Install-Module $module -Scope CurrentUser"
            }
        }
#>

# WITH THIS:
        foreach ($module in $script:ScriptInfo.Dependencies) {
            $installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | 
                Sort-Object Version -Descending | Select-Object -First 1
            
            if ($installedModule) {
                Write-EnhancedLog "Module available: $module v$($installedModule.Version)" -Level SUCCESS
            } else {
                # Default to auto-install unless explicitly disabled with -AutoInstallModules:$false
                if (-not $PSBoundParameters.ContainsKey('AutoInstallModules') -or $AutoInstallModules) {
                    Write-EnhancedLog "Module '$module' not found. Installing..." -Level WARN
                    try {
                        # Set TLS 1.2 for secure downloads
                        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                        
                        # Install NuGet provider if needed (silently)
                        $null = Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -ErrorAction SilentlyContinue
                        
                        # Install the module
                        Install-Module -Name $module -Scope CurrentUser -Force -AllowClobber -Repository PSGallery -ErrorAction Stop
                        
                        # Verify installation
                        $verifyModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | 
                            Sort-Object Version -Descending | Select-Object -First 1
                        
                        if ($verifyModule) {
                            Write-EnhancedLog "Successfully installed $module v$($verifyModule.Version)" -Level SUCCESS
                        } else {
                            throw "Module installation verification failed"
                        }
                    } catch {
                        Write-EnhancedLog "Failed to install module '$module': $($_.Exception.Message)" -Level ERROR
                        $issues += "Failed to install required module '$module'. Please install manually: Install-Module $module -Scope CurrentUser"
                        $moduleInstallationFailed = $true
                    }
                } else {
                    Write-EnhancedLog "Module '$module' not found" -Level WARN
                    $issues += "Required module '$module' not found. Install with: Install-Module $module -Scope CurrentUser"
                }
            }
        }