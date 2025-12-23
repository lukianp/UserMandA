# Fix-AppRegistrationScript.ps1
# This script applies the necessary fixes to DiscoveryCreateAppRegistration.ps1

param(
    [string]$ScriptPath = ".\DiscoveryCreateAppRegistration.ps1"
)

if (-not (Test-Path $ScriptPath)) {
    Write-Error "Script not found at: $ScriptPath"
    exit 1
}

Write-Host "Fixing DiscoveryCreateAppRegistration.ps1..." -ForegroundColor Yellow

# Read the script content
$content = Get-Content $ScriptPath -Raw

# Fix 1: Replace the Write-ProgressHeader function
$oldProgressHeader = @'
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
'@

$newProgressHeader = @'
function Write-ProgressHeader {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Title, 
        [Parameter(Mandatory=$false)]
        [string]$Subtitle = ""
    )
    
    $separator = "?" * 90
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
'@

$content = $content -replace [regex]::Escape($oldProgressHeader), $newProgressHeader
Write-Host "✓ Fixed Write-ProgressHeader color splatting" -ForegroundColor Green

# Fix 2: Add auto-install logic to module checking
# Find the module checking section and replace it
$pattern = '(\s+foreach\s*\(\s*\$module\s+in\s+\$script:ScriptInfo\.Dependencies\s*\)\s*\{[\s\S]*?if\s*\(\s*\$installedModule\s*\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?\$issues\s*\+=[\s\S]*?\}\s*\})'

$newModuleCheck = @'
        foreach ($module in $script:ScriptInfo.Dependencies) {
            $installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue | 
                Sort-Object Version -Descending | Select-Object -First 1
            
            if ($installedModule) {
                Write-EnhancedLog "Module available: $module v$($installedModule.Version)" -Level SUCCESS
            } else {
                # Auto-install by default
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
                }
            }
        }
'@

if ($content -match $pattern) {
    $content = $content -replace $pattern, $newModuleCheck
    Write-Host "✓ Added automatic module installation" -ForegroundColor Green
} else {
    Write-Host "⚠ Could not find module checking section - manual fix needed" -ForegroundColor Yellow
}

# Save the fixed content
$backupPath = $ScriptPath -replace '\.ps1$', '_backup.ps1'
Copy-Item $ScriptPath $backupPath -Force
Write-Host "✓ Created backup at: $backupPath" -ForegroundColor Green

Set-Content $ScriptPath $content -Force
Write-Host "✓ Applied fixes to: $ScriptPath" -ForegroundColor Green

Write-Host "`nScript fixed successfully! Now run:" -ForegroundColor Cyan
Write-Host "  .\DiscoveryCreateAppRegistration.ps1" -ForegroundColor White
Write-Host "`nThe script will now automatically install missing modules." -ForegroundColor Gray