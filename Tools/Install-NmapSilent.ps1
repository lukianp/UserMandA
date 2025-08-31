# Install-NmapSilent.ps1
# Enterprise-ready silent nmap installation with npcap dependency handling
# Supports hybrid installation approach with graceful degradation

[CmdletBinding()]
param(
    [string]$InstallationPath = "C:\Program Files (x86)\Nmap",
    [switch]$SkipNpcap,
    [switch]$Force,
    [int]$TimeoutMinutes = 10
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Import MandA logging if available
if (Get-Module MandALogging -ListAvailable) {
    Import-Module MandALogging
    $UseLogging = $true
} else {
    $UseLogging = $false
}

function Write-InstallLog {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    if ($UseLogging) {
        switch ($Level) {
            "ERROR" { Write-MandALog -Message $Message -Level Error }
            "WARN" { Write-MandALog -Message $Message -Level Warning }
            default { Write-MandALog -Message $Message -Level Info }
        }
    } else {
        Write-Host $logMessage -ForegroundColor $(
            switch ($Level) {
                "ERROR" { "Red" }
                "WARN" { "Yellow" }
                default { "Cyan" }
            }
        )
    }
}

function Test-AdminPrivileges {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-NmapInstalled {
    param([string]$Path = $InstallationPath)
    
    $nmapExe = Join-Path $Path "nmap.exe"
    
    # Check file existence
    if (Test-Path $nmapExe) {
        try {
            # Verify it's functional
            $version = & $nmapExe --version 2>$null | Select-Object -First 1
            if ($version -match "Nmap (\d+\.\d+)") {
                Write-InstallLog "Found existing nmap installation: $version"
                return @{
                    Installed = $true
                    Version = $matches[1]
                    Path = $nmapExe
                }
            }
        } catch {
            Write-InstallLog "nmap binary exists but is not functional" -Level WARN
        }
    }
    
    # Check registry
    $registryPaths = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Nmap",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Nmap"
    )
    
    foreach ($regPath in $registryPaths) {
        if (Test-Path $regPath) {
            $regKey = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
            if ($regKey -and $regKey.DisplayName -match "Nmap") {
                Write-InstallLog "Found nmap in registry: $($regKey.DisplayName) $($regKey.DisplayVersion)"
                return @{
                    Installed = $true
                    Version = $regKey.DisplayVersion
                    Path = $regKey.InstallLocation
                }
            }
        }
    }
    
    return @{ Installed = $false }
}

function Test-NpcapInstalled {
    # Check npcap service
    $npcapService = Get-Service -Name "npcap*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($npcapService) {
        Write-InstallLog "Found npcap service: $($npcapService.Name) - $($npcapService.Status)"
        return @{
            Installed = $true
            ServiceName = $npcapService.Name
            Status = $npcapService.Status
        }
    }
    
    # Check registry
    $registryPaths = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\NpcapInst",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\NpcapInst"
    )
    
    foreach ($regPath in $registryPaths) {
        if (Test-Path $regPath) {
            $regKey = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
            if ($regKey) {
                Write-InstallLog "Found npcap in registry: $($regKey.DisplayName) $($regKey.DisplayVersion)"
                return @{
                    Installed = $true
                    Version = $regKey.DisplayVersion
                    Path = $regKey.InstallLocation
                }
            }
        }
    }
    
    return @{ Installed = $false }
}

function Get-InstallerPath {
    param([string]$InstallerType)
    
    $toolsPath = Split-Path $PSScriptRoot -Parent
    $installersPath = Join-Path $toolsPath "Installers"
    
    if (-not (Test-Path $installersPath)) {
        Write-InstallLog "Creating installers directory: $installersPath"
        New-Item -Path $installersPath -ItemType Directory -Force | Out-Null
    }
    
    switch ($InstallerType) {
        "nmap" {
            $pattern = "nmap-*-setup.exe"
        }
        "npcap" {
            $pattern = "npcap-*.exe"
        }
    }
    
    $installer = Get-ChildItem -Path $installersPath -Name $pattern | Sort-Object Name -Descending | Select-Object -First 1
    
    if ($installer) {
        return Join-Path $installersPath $installer
    }
    
    return $null
}

function Install-NmapSilent {
    param([string]$InstallerPath)
    
    Write-InstallLog "Starting silent nmap installation from: $InstallerPath"
    
    # Verify installer exists and is signed
    if (-not (Test-Path $InstallerPath)) {
        throw "nmap installer not found: $InstallerPath"
    }
    
    # Check digital signature
    try {
        $signature = Get-AuthenticodeSignature $InstallerPath
        if ($signature.Status -ne "Valid") {
            Write-InstallLog "nmap installer signature status: $($signature.Status)" -Level WARN
        } else {
            Write-InstallLog "nmap installer signature valid: $($signature.SignerCertificate.Subject)"
        }
    } catch {
        Write-InstallLog "Could not verify nmap installer signature" -Level WARN
    }
    
    # Prepare silent installation command
    $installArgs = @("/S")
    if ($InstallationPath -ne "C:\Program Files (x86)\Nmap") {
        $installArgs += "/D=`"$InstallationPath`""
    }
    
    Write-InstallLog "Installing nmap with arguments: $($installArgs -join ' ')"
    
    # Execute silent installation
    $process = Start-Process -FilePath $InstallerPath -ArgumentList $installArgs -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-InstallLog "nmap installation completed successfully"
        return @{ Success = $true; ExitCode = 0; RebootRequired = $false }
    } elseif ($process.ExitCode -eq 3010) {
        Write-InstallLog "nmap installation completed, reboot required" -Level WARN
        return @{ Success = $true; ExitCode = 3010; RebootRequired = $true }
    } else {
        Write-InstallLog "nmap installation failed with exit code: $($process.ExitCode)" -Level ERROR
        return @{ Success = $false; ExitCode = $process.ExitCode; RebootRequired = $false }
    }
}

function Install-NpcapHybrid {
    param([string]$InstallerPath)
    
    Write-InstallLog "Starting npcap installation from: $InstallerPath"
    
    if (-not (Test-Path $InstallerPath)) {
        Write-InstallLog "npcap installer not found: $InstallerPath" -Level WARN
        return @{ Success = $false; Reason = "InstallerNotFound"; RequiresManual = $false }
    }
    
    # Try silent installation first (works with npcap OEM)
    Write-InstallLog "Attempting silent npcap installation..."
    
    $silentArgs = @("/S", "/winpcap_mode=yes")
    $process = Start-Process -FilePath $InstallerPath -ArgumentList $silentArgs -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-InstallLog "npcap silent installation completed successfully"
        return @{ Success = $true; Method = "Silent"; ExitCode = 0; RebootRequired = $false }
    } elseif ($process.ExitCode -eq 3010) {
        Write-InstallLog "npcap silent installation completed, reboot required" -Level WARN
        return @{ Success = $true; Method = "Silent"; ExitCode = 3010; RebootRequired = $true }
    } else {
        Write-InstallLog "Silent npcap installation failed (exit code: $($process.ExitCode)). This is expected for free npcap." -Level WARN
        
        # For free npcap version, provide user guidance
        Write-InstallLog "npcap free version requires GUI installation. Please:"
        Write-InstallLog "1. Run the npcap installer manually: $InstallerPath"
        Write-InstallLog "2. Accept the license and click 'I Agree'"
        Write-InstallLog "3. Keep 'Install Npcap in WinPcap API-compatible Mode' checked"
        Write-InstallLog "4. Click 'Install' and then 'Finish'"
        
        # Optionally launch the installer for user
        if ($PSCmdlet.ShouldProcess("Launch npcap installer for manual installation")) {
            Write-InstallLog "Launching npcap installer for manual installation..."
            Start-Process -FilePath $InstallerPath -Wait
            
            # Verify installation after user completes it
            Start-Sleep -Seconds 5
            $npcapStatus = Test-NpcapInstalled
            if ($npcapStatus.Installed) {
                Write-InstallLog "npcap installation verified successful"
                return @{ Success = $true; Method = "Manual"; RequiredUserInteraction = $true }
            } else {
                Write-InstallLog "npcap installation could not be verified" -Level WARN
                return @{ Success = $false; Method = "Manual"; RequiredUserInteraction = $true }
            }
        }
        
        return @{ 
            Success = $false
            Reason = "RequiresManualInstallation"
            RequiresManual = $true
            InstallerPath = $InstallerPath
        }
    }
}

function Test-InstallationSuccess {
    Write-InstallLog "Verifying installation success..."
    
    # Test nmap functionality
    $nmapStatus = Test-NmapInstalled
    if (-not $nmapStatus.Installed) {
        Write-InstallLog "nmap verification failed" -Level ERROR
        return @{ Success = $false; Component = "nmap" }
    }
    
    # Test npcap if not skipped
    if (-not $SkipNpcap) {
        $npcapStatus = Test-NpcapInstalled
        if (-not $npcapStatus.Installed) {
            Write-InstallLog "npcap verification failed - nmap will have limited functionality" -Level WARN
            return @{ 
                Success = $true
                Component = "nmap-only"
                Warning = "npcap not available - packet capture disabled"
            }
        }
    }
    
    # Test nmap with version info
    try {
        $nmapPath = if ($nmapStatus.Path) { 
            Join-Path $nmapStatus.Path "nmap.exe" 
        } else { 
            Join-Path $InstallationPath "nmap.exe" 
        }
        
        $versionOutput = & $nmapPath --version 2>&1 | Select-Object -First 1
        Write-InstallLog "nmap verification successful: $versionOutput"
        
        return @{ 
            Success = $true
            Component = "complete"
            NmapVersion = $versionOutput
            NmapPath = $nmapPath
        }
    } catch {
        Write-InstallLog "nmap version test failed: $($_.Exception.Message)" -Level ERROR
        return @{ Success = $false; Component = "nmap-execution" }
    }
}

function Install-NmapEnterprise {
    Write-InstallLog "=== Enterprise nmap Silent Installation Started ==="
    Write-InstallLog "Installation Path: $InstallationPath"
    Write-InstallLog "Skip npcap: $SkipNpcap"
    Write-InstallLog "Force reinstall: $Force"
    
    # Check administrator privileges
    if (-not (Test-AdminPrivileges)) {
        throw "Administrator privileges required for nmap installation"
    }
    Write-InstallLog "Administrator privileges confirmed"
    
    # Check existing installations
    $existingNmap = Test-NmapInstalled
    $existingNpcap = Test-NpcapInstalled
    
    if ($existingNmap.Installed -and -not $Force) {
        Write-InstallLog "nmap already installed: $($existingNmap.Version) at $($existingNmap.Path)"
        
        if ($SkipNpcap -or $existingNpcap.Installed) {
            Write-InstallLog "Installation requirements already satisfied"
            return @{ 
                Success = $true
                AlreadyInstalled = $true
                NmapVersion = $existingNmap.Version
                NpcapInstalled = $existingNpcap.Installed
            }
        }
    }
    
    # Get installer paths
    $nmapInstaller = Get-InstallerPath "nmap"
    $npcapInstaller = Get-InstallerPath "npcap"
    
    if (-not $nmapInstaller) {
        throw "nmap installer not found in Tools\Installers directory"
    }
    
    Write-InstallLog "nmap installer: $nmapInstaller"
    if ($npcapInstaller) {
        Write-InstallLog "npcap installer: $npcapInstaller"
    } else {
        Write-InstallLog "npcap installer not found - will skip packet capture capabilities" -Level WARN
    }
    
    $installResults = @{
        NmapResult = $null
        NpcapResult = $null
        OverallSuccess = $false
        RebootRequired = $false
    }
    
    # Install npcap first (required dependency)
    if (-not $SkipNpcap -and $npcapInstaller -and (-not $existingNpcap.Installed -or $Force)) {
        Write-InstallLog "Installing npcap dependency..."
        $installResults.NpcapResult = Install-NpcapHybrid $npcapInstaller
        
        if ($installResults.NpcapResult.RebootRequired) {
            $installResults.RebootRequired = $true
            Write-InstallLog "Reboot required after npcap installation" -Level WARN
        }
    } else {
        Write-InstallLog "Skipping npcap installation (already installed or explicitly skipped)"
        $installResults.NpcapResult = @{ Success = $true; Skipped = $true }
    }
    
    # Install nmap
    if (-not $existingNmap.Installed -or $Force) {
        Write-InstallLog "Installing nmap..."
        $installResults.NmapResult = Install-NmapSilent $nmapInstaller
        
        if ($installResults.NmapResult.RebootRequired) {
            $installResults.RebootRequired = $true
            Write-InstallLog "Reboot required after nmap installation" -Level WARN
        }
    } else {
        Write-InstallLog "Skipping nmap installation (already installed)"
        $installResults.NmapResult = @{ Success = $true; Skipped = $true }
    }
    
    # Verify installation success
    $verification = Test-InstallationSuccess
    $installResults.OverallSuccess = $verification.Success
    $installResults.Verification = $verification
    
    if ($installResults.OverallSuccess) {
        Write-InstallLog "=== Enterprise nmap Installation Completed Successfully ==="
        if ($installResults.RebootRequired) {
            Write-InstallLog "IMPORTANT: System reboot required for full functionality" -Level WARN
        }
    } else {
        Write-InstallLog "=== Enterprise nmap Installation Completed with Issues ===" -Level WARN
        Write-InstallLog "Issue: $($verification.Component)" -Level WARN
    }
    
    return $installResults
}

# Main execution
try {
    $result = Install-NmapEnterprise
    
    # Return structured result for integration
    [PSCustomObject]@{
        Success = $result.OverallSuccess
        NmapInstalled = $result.NmapResult.Success -or $result.NmapResult.Skipped
        NpcapInstalled = $result.NpcapResult.Success -or $result.NpcapResult.Skipped
        RebootRequired = $result.RebootRequired
        InstallationPath = $InstallationPath
        Details = $result
    }
} catch {
    Write-InstallLog "Fatal error during installation: $($_.Exception.Message)" -Level ERROR
    Write-InstallLog "Stack trace: $($_.ScriptStackTrace)" -Level ERROR
    
    [PSCustomObject]@{
        Success = $false
        Error = $_.Exception.Message
        NmapInstalled = $false
        NpcapInstalled = $false
        RebootRequired = $false
    }
}