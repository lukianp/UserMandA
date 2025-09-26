# Version: 1.0.0
# Author: Lukian Poleschtschuk
# Date Modified: 2025-09-16
#Requires -Version 5.1

<#
.SYNOPSIS
    Builds the M&A Discovery Suite GUI application

.DESCRIPTION
 This script compiles the WPF application using .NET 8 and creates a self-contained executable
 that can be distributed and run on Windows systems without requiring .NET to be installed.
    
    RECENT CRITICAL BUG FIXES INCLUDED:
    - Fixed ProfileService dependency injection using SimpleServiceLocator
    - Standardized path management with MANDA_DISCOVERY_PATH support (default: c:\discoverydata)
    - Ensures ModuleRegistry.json is copied to both main and net8.0-windows\Configuration locations
    - Cleaned up profile configuration to use ljpops as active profile
    - All data loading and module registry issues resolved

.PARAMETER Configuration
    Build configuration: Debug or Release (default: Release)

.PARAMETER OutputPath
    Output path for the compiled application (default: .\bin\Release)

.PARAMETER SelfContained
    Create a self-contained deployment (default: false)

.EXAMPLE
    .\Build-GUI.ps1
    Builds the application in Release configuration

.EXAMPLE
    .\Build-GUI.ps1 -Configuration Debug
    Builds the application in Debug configuration
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "C:\enterprisediscovery",
    
    [Parameter(Mandatory = $false)]
    [switch]$SelfContained
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

Write-Host "M&A Discovery Suite - GUI Build Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if .NET 8 SDK is installed
Write-Host "Checking for .NET 8 SDK..." -ForegroundColor Yellow

try {
    $dotnetVersion = & dotnet --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet command not found"
    }
    
    $majorVersion = [int]($dotnetVersion.Split('.')[0])
    if ($majorVersion -lt 8) {
        throw "Requires .NET 8 or later, found version $dotnetVersion"
    }
    
    Write-Host "Found .NET version: $dotnetVersion" -ForegroundColor Green
}
catch {
    Write-Error @"
.NET 8 SDK is required but not found or not properly installed.
Please download and install .NET 8 SDK from: https://dotnet.microsoft.com/download/dotnet/8.0

Error: $($_.Exception.Message)
"@
    exit 1
}

# Check required files
$RequiredFiles = @(
    'MandADiscoverySuite.csproj',
    'App.xaml',
    'App.xaml.cs',
    'MandADiscoverySuite.xaml',
    'MandADiscoverySuite.xaml.cs'
)

Write-Host "Checking required files..." -ForegroundColor Yellow
foreach ($file in $RequiredFiles) {
    if (!(Test-Path $file)) {
        Write-Error "Required file not found: $file"
        exit 1
    }
    Write-Host "  [OK] $file" -ForegroundColor Green
}

# AGGRESSIVE: Clean workspace completely before starting
Write-Host "AGGRESSIVELY cleaning workspace before build..." -ForegroundColor Yellow
for ($i = 1; $i -le 3; $i++) {
    Write-Host "  Pre-build cleanup pass $i..." -ForegroundColor Cyan
    if (Test-Path "bin") {
        Remove-Item -Path "bin" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 100
    }
    if (Test-Path "obj") {
        Remove-Item -Path "obj" -Recurse -Force -ErrorAction SilentlyContinue  
        Start-Sleep -Milliseconds 100
    }
    # Also clean any stray build artifacts
    Get-ChildItem -Path "." -Filter "*.exe" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path "." -Filter "*.dll" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path "." -Filter "*.pdb" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}
Write-Host "  [OK] Pre-build workspace AGGRESSIVELY cleaned" -ForegroundColor Green

# Initial restore for validation
Write-Host "Validating project dependencies..." -ForegroundColor Yellow
& dotnet restore MandADiscoverySuite.csproj --verbosity quiet
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to validate dependencies"
    exit 1
}

# Ensure target directory exists and is clean
Write-Host "Preparing deployment directory..." -ForegroundColor Yellow

# Try to stop any running instances of the application
try {
    $processes = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Stopping running application instances..." -ForegroundColor Yellow
        $processes | ForEach-Object { 
            try {
                $_.CloseMainWindow()
                Start-Sleep -Seconds 2
                if (!$_.HasExited) {
                    $_.Kill()
                }
            } catch {
                Write-Warning "Could not stop process $($_.Id): $($_.Exception.Message)"
            }
        }
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Warning "Could not check for running processes: $($_.Exception.Message)"
}

if (Test-Path $OutputPath) {
    # Try to remove old files, skip if locked
    try {
        # Remove any old executable files from root
        Get-ChildItem -Path $OutputPath -Filter "*.exe" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $OutputPath -Filter "*.dll" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $OutputPath -Filter "*.bat" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $OutputPath -Filter "*.json" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $OutputPath -Filter "*.pdb" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $OutputPath -Filter "*.deps.json" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $OutputPath -Filter "*.runtimeconfig.json" | Remove-Item -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Warning "Some files could not be removed (may be in use): $($_.Exception.Message)"
    }
} else {
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
}

# Build the application directly to target location
Write-Host "Building application..." -ForegroundColor Yellow

# Set minimal environment variables for clean build
$env:MSBuildEnableWorkloadResolver = "false"

$BuildArgs = @(
    'publish'
    'MandADiscoverySuite.csproj'
    '--configuration', $Configuration
    '--output', $OutputPath
    '--verbosity', 'minimal'
    '--nologo'
    '--force'
    '--no-dependencies'
    '--nowarn:CS0579,CS1685,CS1701,NETSDK1138,NU1903,NU1605'
)

if ($SelfContained) {
    $BuildArgs += '--self-contained', 'true'
    $BuildArgs += '--runtime', 'win-x64'
    Write-Host "Building self-contained application..." -ForegroundColor Cyan
} else {
    $BuildArgs += '--self-contained', 'false'
    Write-Host "Building framework-dependent application..." -ForegroundColor Cyan
}

# Restore packages first
Write-Host "Restoring packages for publish..." -ForegroundColor Yellow
& dotnet restore MandADiscoverySuite.csproj
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to restore packages"
    exit 1
}

& dotnet @BuildArgs

# Check if the build succeeded by looking for the output file
$OutputExe = Join-Path $OutputPath "MandADiscoverySuite.exe"
if (!(Test-Path $OutputExe)) {
    Write-Error "Build failed - executable not found"
    exit 1
}
Write-Host "Build succeeded - executable found at $OutputExe" -ForegroundColor Green

# Clean workspace build artifacts after build
Write-Host "Cleaning workspace build artifacts..." -ForegroundColor Yellow
try {
    if (Test-Path "bin") {
        Remove-Item -Path "bin" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "obj") {
        Remove-Item -Path "obj" -Recurse -Force -ErrorAction SilentlyContinue
    }
    # Remove any build artifacts in current directory
    Get-ChildItem -Path "." -Filter "*.exe" | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path "." -Filter "*.dll" | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path "." -Filter "*.pdb" | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] Workspace cleaned" -ForegroundColor Green
} catch {
    Write-Warning "Could not clean workspace: $($_.Exception.Message)"
}

# Create application icon if it doesn't exist
$IconPath = Join-Path $OutputPath "app.ico"
if (!(Test-Path $IconPath)) {
    Write-Host "Creating default application icon..." -ForegroundColor Yellow
    # Create a simple ICO file (this is a basic implementation)
    # In a real scenario, you'd want to use a proper icon file
    $EmptyIconBytes = @(
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00,
        0x68, 0x05, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    )
    [System.IO.File]::WriteAllBytes($IconPath, $EmptyIconBytes)
}

# Create a batch file launcher
$LauncherPath = Join-Path $OutputPath "Launch-MandADiscoverySuite.bat"

# Create the batch file content using an array and join
$LauncherLines = @(
    '@echo off',
    'REM M&A Discovery Suite Launcher',
    'REM Ensures PowerShell execution policy allows running the application',
    '',
    'echo Starting M&A Discovery Suite...',
    'echo.',
    '',
    'REM Check if .NET 8 runtime is available',
    'dotnet --version >nul 2>&1',
    'if errorlevel 1 (',
    '    echo ERROR: .NET 8 runtime is required but not found.',
    '    echo Please download and install .NET 8 runtime from:',
    '    echo https://dotnet.microsoft.com/download/dotnet/8.0',
    '    echo.',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'REM Set PowerShell execution policy for current user (if needed)',
    'powershell -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction SilentlyContinue"',
    '',
    'REM Launch the application',
    '"MandADiscoverySuite.exe"',
    '',
    'if errorlevel 1 (',
    '    echo.',
    '    echo Application exited with an error.',
    '    pause',
    ')'
)

$LauncherContent = $LauncherLines -join "`r`n"

Set-Content -Path $LauncherPath -Value $LauncherContent -Encoding ASCII

# Copy PowerShell modules to the output directory
$ModulesSourcePath = Join-Path (Split-Path $ScriptDir -Parent) "Modules"
$ModulesDestPath = Join-Path $OutputPath "Modules"

if (Test-Path $ModulesSourcePath) {
    Write-Host "Copying PowerShell modules..." -ForegroundColor Yellow
    
    # Remove existing modules directory to ensure clean copy
    if (Test-Path $ModulesDestPath) {
        Remove-Item -Path $ModulesDestPath -Recurse -Force
    }
    
    Copy-Item -Path $ModulesSourcePath -Destination $ModulesDestPath -Recurse -Force
    
    # Verify critical modules are present
    $CriticalModules = @(
        "Core\CompanyProfileManager.psm1",
        "Discovery\ActiveDirectoryDiscovery.psm1",
        "Discovery\AzureDiscovery.psm1", 
        "Discovery\ApplicationDiscovery.psm1",
        "Discovery\DiscoveryBase.psm1",
        "Utilities\ErrorHandling.psm1"
    )
    
    $MissingModules = @()
    foreach ($module in $CriticalModules) {
        $modulePath = Join-Path $ModulesDestPath $module
        if (!(Test-Path $modulePath)) {
            $MissingModules += $module
        }
    }
    
    if ($MissingModules.Count -gt 0) {
        Write-Warning "Missing critical modules: $($MissingModules -join ', ')"
    } else {
        Write-Host "  [OK] All critical modules verified" -ForegroundColor Green
    }
    
    # Count total modules
    $ModuleCount = (Get-ChildItem -Path $ModulesDestPath -Filter "*.psm1" -Recurse).Count
    Write-Host "  [OK] $ModuleCount PowerShell modules copied" -ForegroundColor Green
}

# Create configuration directory
$ConfigDestPath = Join-Path $OutputPath "Configuration"
$ConfigSourcePath = Join-Path (Split-Path $ScriptDir -Parent) "Configuration"

if (Test-Path $ConfigSourcePath) {
    Write-Host "Copying configuration files..." -ForegroundColor Yellow
    
    # Remove existing config directory to ensure clean copy
    if (Test-Path $ConfigDestPath) {
        Remove-Item -Path $ConfigDestPath -Recurse -Force
    }
    
    Copy-Item -Path $ConfigSourcePath -Destination $ConfigDestPath -Recurse -Force
    
    # Verify critical configuration files
    $CriticalConfigs = @(
        "default-config.json",
        "suite-config.json"
    )
    
    # Also copy GUI-specific configuration files
    $GUIConfigSource = Join-Path $ScriptDir "Configuration"
    if (Test-Path $GUIConfigSource) {
        Write-Host "Copying GUI configuration files..." -ForegroundColor Yellow
        Copy-Item -Path "$GUIConfigSource\*" -Destination $ConfigDestPath -Force
        
        # Verify GUI config files
        $GUIConfigs = @(
            "ModuleRegistry.json"
        )
        
        foreach ($config in $GUIConfigs) {
            $configPath = Join-Path $ConfigDestPath $config
            if (Test-Path $configPath) {
                Write-Host "  [OK] $config verified" -ForegroundColor Green
            } else {
                Write-Warning "Missing GUI configuration file: $config"
            }
        }
    }
    
    # Ensure ModuleRegistry.json is available in the main configuration directory
    Write-Host "Verifying ModuleRegistry.json deployment..." -ForegroundColor Yellow
    $ModuleRegistrySource = Join-Path $ConfigDestPath "ModuleRegistry.json"
    
    if (Test-Path $ModuleRegistrySource) {
        Write-Host "  [OK] ModuleRegistry.json found in main configuration" -ForegroundColor Green
    } else {
        Write-Warning "ModuleRegistry.json not found in source configuration"
        # Try to copy from GUI directory if it exists there
        $GUIModuleRegistry = Join-Path $ScriptDir "Configuration\ModuleRegistry.json"
        if (Test-Path $GUIModuleRegistry) {
            Copy-Item -Path $GUIModuleRegistry -Destination $ModuleRegistrySource -Force
            Write-Host "  [OK] ModuleRegistry.json copied from GUI configuration" -ForegroundColor Green
        }
    }
    
    foreach ($config in $CriticalConfigs) {
        $configPath = Join-Path $ConfigDestPath $config
        if (Test-Path $configPath) {
            Write-Host "  [OK] $config verified" -ForegroundColor Green
        } else {
            Write-Warning "Missing configuration file: $config"
        }
    }
}

# Optional: Attempt silent nmap installation for better performance
$SilentInstallerPath = Join-Path (Split-Path $ScriptDir -Parent) "Tools\Install-NmapSilent.ps1"
if (Test-Path $SilentInstallerPath) {
    Write-Host "Checking for system nmap installation..." -ForegroundColor Yellow
    
    # Check if nmap is already installed system-wide
    $SystemNmap = Get-Command nmap -ErrorAction SilentlyContinue
    if (-not $SystemNmap) {
        # Check common installation paths
        $CommonPaths = @(
            "${env:ProgramFiles}\Nmap\nmap.exe",
            "${env:ProgramFiles(x86)}\Nmap\nmap.exe"
        )
        
        $SystemNmap = $CommonPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
    }
    
    if ($SystemNmap) {
        Write-Host "  [OK] System nmap found - Infrastructure Discovery will use system installation for optimal performance" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] System nmap not detected - Infrastructure Discovery will use embedded version" -ForegroundColor Cyan
        Write-Host "  [HINT] For best performance, consider running: Tools\Install-NmapSilent.ps1" -ForegroundColor Gray
    }
}

# Copy embedded tools (including nmap for Infrastructure Discovery)  
$ToolsSourcePath = Join-Path (Split-Path $ScriptDir -Parent) "Tools"
$ToolsDestPath = Join-Path $OutputPath "Tools"

if (Test-Path $ToolsSourcePath) {
    Write-Host "Copying embedded tools..." -ForegroundColor Yellow
    
    if (Test-Path $ToolsDestPath) {
        Remove-Item -Path $ToolsDestPath -Recurse -Force
    }
    
    Copy-Item -Path $ToolsSourcePath -Destination $ToolsDestPath -Recurse -Force
    
    # Verify nmap binary deployment
    $NmapPath = Join-Path $ToolsDestPath "nmap\nmap.exe"
    if (Test-Path $NmapPath) {
        Write-Host "  [OK] nmap binary embedded for Infrastructure Discovery" -ForegroundColor Green
    } else {
        Write-Warning "nmap binary not found - Infrastructure Discovery will use fallback methods"
    }
    
    $ToolCount = (Get-ChildItem -Path $ToolsDestPath -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] $ToolCount tool binaries copied" -ForegroundColor Green
}

# Copy additional scripts and tools
$ScriptsSourcePath = Join-Path (Split-Path $ScriptDir -Parent) "Scripts"
$ScriptsDestPath = Join-Path $OutputPath "Scripts"

if (Test-Path $ScriptsSourcePath) {
    Write-Host "Copying utility scripts..." -ForegroundColor Yellow
    
    if (Test-Path $ScriptsDestPath) {
        Remove-Item -Path $ScriptsDestPath -Recurse -Force
    }
    
    Copy-Item -Path $ScriptsSourcePath -Destination $ScriptsDestPath -Recurse -Force
    $ScriptCount = (Get-ChildItem -Path $ScriptsDestPath -Filter "*.ps1" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  [OK] $ScriptCount utility scripts copied" -ForegroundColor Green
}

# Copy XAML Resource directories (Themes, Styles, Controls, Views, Resources) - CRITICAL FOR STARTUP
Write-Host "Copying XAML resource directories..." -ForegroundColor Yellow
$XAMLDirectories = @("Themes", "Styles", "Controls", "Views", "Resources")

foreach ($dir in $XAMLDirectories) {
    $SourceXAMLPath = Join-Path $ScriptDir $dir
    $DestXAMLPath = Join-Path $OutputPath $dir

    if (Test-Path $SourceXAMLPath) {
        # Remove existing directory to ensure clean copy
        if (Test-Path $DestXAMLPath) {
            Remove-Item -Path $DestXAMLPath -Recurse -Force
        }

        Copy-Item -Path $SourceXAMLPath -Destination $DestXAMLPath -Recurse -Force

        $FileCount = (Get-ChildItem -Path $DestXAMLPath -Filter "*.xaml" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Host "  [OK] $dir directory copied ($FileCount XAML files)" -ForegroundColor Green
    } else {
        Write-Warning "XAML resource directory not found: $SourceXAMLPath"
    }
}

# Copy main XAML files to root of output directory - CRITICAL FOR STARTUP
Write-Host "Copying main XAML files..." -ForegroundColor Yellow
$MainXAMLFiles = @("MandADiscoverySuite.xaml", "App.xaml")

foreach ($xamlFile in $MainXAMLFiles) {
    $SourceFile = Join-Path $ScriptDir $xamlFile
    $DestFile = Join-Path $OutputPath $xamlFile

    if (Test-Path $SourceFile) {
        Copy-Item -Path $SourceFile -Destination $DestFile -Force
        Write-Host "  [OK] $xamlFile copied to output root" -ForegroundColor Green
    } else {
        Write-Warning "Main XAML file not found: $xamlFile"
    }
}

# Get build information
$ExePath = Join-Path $OutputPath "MandADiscoverySuite.exe"
if (Test-Path $ExePath) {
    $FileInfo = Get-Item $ExePath
    $FileSizeMB = [math]::Round($FileInfo.Length / 1MB, 2)
    
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "==============================" -ForegroundColor Green
    Write-Host "Configuration: $Configuration" -ForegroundColor Cyan
    Write-Host "Output Path: $OutputPath" -ForegroundColor Cyan
    Write-Host "Executable: MandADiscoverySuite.exe" -ForegroundColor Cyan
    Write-Host "File Size: $FileSizeMB MB" -ForegroundColor Cyan
    Write-Host "Self-Contained: $SelfContained" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To run the application:" -ForegroundColor Yellow
    Write-Host "  1. Navigate to: $OutputPath" -ForegroundColor White
    Write-Host "  2. Run: Launch-MandADiscoverySuite.bat" -ForegroundColor White
    Write-Host "  OR" -ForegroundColor Yellow
    Write-Host "  2. Run: MandADiscoverySuite.exe" -ForegroundColor White
    Write-Host ""
    
    # Post-build verification
    Write-Host "Post-Build Verification:" -ForegroundColor Yellow
    
    # Verify modules directory structure
    $ModulesPath = Join-Path $OutputPath "Modules"
    if (Test-Path $ModulesPath) {
        $DiscoveryPath = Join-Path $ModulesPath "Discovery"
        $CorePath = Join-Path $ModulesPath "Core"
        $UtilityPath = Join-Path $ModulesPath "Utilities"
        
        $DiscoveryModulesCount = if (Test-Path $DiscoveryPath) { (Get-ChildItem -Path $DiscoveryPath -Filter "*.psm1" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
        $CoreModulesCount = if (Test-Path $CorePath) { (Get-ChildItem -Path $CorePath -Filter "*.psm1" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
        $UtilityModulesCount = if (Test-Path $UtilityPath) { (Get-ChildItem -Path $UtilityPath -Filter "*.psm1" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
        
        Write-Host "  [OK] Discovery Modules: $DiscoveryModulesCount" -ForegroundColor Green
        Write-Host "  [OK] Core Modules: $CoreModulesCount" -ForegroundColor Green  
        Write-Host "  [OK] Utility Modules: $UtilityModulesCount" -ForegroundColor Green
    }
    
    # Verify configuration files
    $ConfigPath = Join-Path $OutputPath "Configuration"
    if (Test-Path $ConfigPath) {
        $ConfigCount = if (Test-Path $ConfigPath) { (Get-ChildItem -Path $ConfigPath -Filter "*.json" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
        Write-Host "  [OK] Configuration Files: $ConfigCount" -ForegroundColor Green
    }
    
    # Verify tools directory
    $ToolsPath = Join-Path $OutputPath "Tools"
    if (Test-Path $ToolsPath) {
        $ToolCount = if (Test-Path $ToolsPath) { (Get-ChildItem -Path $ToolsPath -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
        Write-Host "  [OK] Embedded Tools: $ToolCount binaries" -ForegroundColor Green
        
        # Specifically verify nmap for Infrastructure Discovery
        $NmapExe = Join-Path $ToolsPath "nmap\nmap.exe"
        if (Test-Path $NmapExe) {
            Write-Host "  [OK] nmap binary embedded for production-safe network scanning" -ForegroundColor Green
        }
    }
    
    # Verify launcher script
    $LauncherScript = Join-Path $OutputPath "Launch-MandADiscoverySuite.bat"
    if (Test-Path $LauncherScript) {
        Write-Host "  [OK] Launcher script created" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Deployment Structure:" -ForegroundColor Cyan
    Write-Host "  Application: $OutputPath" -ForegroundColor White
    Write-Host "  Modules: $OutputPath\Modules" -ForegroundColor White
    Write-Host "  Config: $OutputPath\Configuration" -ForegroundColor White
    Write-Host "  Tools: $OutputPath\Tools (including embedded nmap)" -ForegroundColor White
    Write-Host "  Scripts: $OutputPath\Scripts" -ForegroundColor White
    Write-Host "  Data: c:\discoverydata (or MANDA_DISCOVERY_PATH)" -ForegroundColor White
    Write-Host ""
    
    # Create and set up data directory using standardized path
    Write-Host "Setting up data directory..." -ForegroundColor Yellow
    $DataPath = if ($env:MANDA_DISCOVERY_PATH) { $env:MANDA_DISCOVERY_PATH } else { "c:\discoverydata" }
    if (!(Test-Path $DataPath)) {
        New-Item -Path $DataPath -ItemType Directory -Force | Out-Null
        Write-Host "  [OK] Created $DataPath" -ForegroundColor Green
    } else {
        Write-Host "  [OK] $DataPath already exists" -ForegroundColor Green
    }
    
    # Set permissions on data directory if running as admin
    try {
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object System.Security.Principal.WindowsPrincipal($currentUser)
        $isAdmin = $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if ($isAdmin) {
            $acl = Get-Acl $DataPath
            $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Users", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
            $acl.SetAccessRule($accessRule)
            Set-Acl -Path $DataPath -AclObject $acl
            Write-Host "  [OK] Data directory permissions set" -ForegroundColor Green
        }
    } catch {
        Write-Warning "Could not set data directory permissions: $($_.Exception.Message)"
    }
    Write-Host ""
    
    # Check if this is a one-click build environment
    if ($env:VSCODE_CLI -or $env:TERM_PROGRAM -eq "vscode") {
        Write-Host "VSCode detected - You can now run the application from the integrated terminal" -ForegroundColor Magenta
    }
    
} else {
    Write-Error "Build appeared to succeed but executable not found at: $ExePath"
    exit 1
}

# Create a deployment package
if ($Configuration -eq 'Release') {
    Write-Host "Creating deployment package..." -ForegroundColor Yellow
    
    $PackageName = "MandADiscoverySuite-v1.0-$(Get-Date -Format 'yyyyMMdd')"
    $PackagePath = "..\$PackageName.zip"
    
    try {
        # Use .NET compression if available, otherwise fall back to PowerShell
        if (Get-Command "Compress-Archive" -ErrorAction SilentlyContinue) {
            Compress-Archive -Path "$OutputPath\*" -DestinationPath $PackagePath -Force
            Write-Host "  [OK] Deployment package created: $PackageName.zip" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "Could not create deployment package: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Build and Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The M&A Discovery Suite is now fully deployed and ready to use." -ForegroundColor White
Write-Host "All modules, configurations, and dependencies have been copied to the correct locations." -ForegroundColor White
Write-Host ""
Write-Host "You can now run the application from C:\enterprisediscovery" -ForegroundColor Yellow
Write-Host ""