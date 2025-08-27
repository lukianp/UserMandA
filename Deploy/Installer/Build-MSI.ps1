#Requires -Version 5.1
#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Enterprise MSI Installer Builder for M&A Discovery Suite

.DESCRIPTION
    This script builds production-ready MSI installers for Fortune 500 enterprise deployment
    using the WiX Toolset. Includes digital signing, validation, and deployment packaging.

    Features:
    - Automated MSI building with WiX Toolset
    - Digital signing for enterprise security
    - Silent installation support
    - SCCM deployment package creation
    - Group Policy deployment templates
    - Installation validation and testing

.PARAMETER Version
    Product version for the MSI package

.PARAMETER SourcePath
    Source directory containing application files

.PARAMETER OutputPath
    Output directory for the MSI package

.PARAMETER SigningCertificate
    Path to code signing certificate

.PARAMETER Architecture
    Target architecture (x64, x86, or AnyCPU)

.PARAMETER Configuration
    Build configuration (Debug or Release)

.PARAMETER CreateSCCMPackage
    Create SCCM deployment package

.PARAMETER CreateGPOTemplate
    Create Group Policy deployment template

.PARAMETER Validate
    Run installation validation tests

.EXAMPLE
    .\Build-MSI.ps1 -Version "1.0.0" -SourcePath "C:\Build\Release" -OutputPath "C:\Packages"

.EXAMPLE
    .\Build-MSI.ps1 -Version "1.0.0" -SigningCertificate "Cert:\CurrentUser\My\THUMBPRINT" -CreateSCCMPackage
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$')]
    [string]$Version,
    
    [Parameter(Mandatory = $true)]
    [ValidateScript({Test-Path $_ -PathType Container})]
    [string]$SourcePath,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = ".\MSI-Output",
    
    [Parameter(Mandatory = $false)]
    [string]$SigningCertificate,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet('x64', 'x86', 'AnyCPU')]
    [string]$Architecture = 'x64',
    
    [Parameter(Mandatory = $false)]
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',
    
    [Parameter(Mandatory = $false)]
    [switch]$CreateSCCMPackage,
    
    [Parameter(Mandatory = $false)]
    [switch]$CreateGPOTemplate,
    
    [Parameter(Mandatory = $false)]
    [switch]$Validate
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

# Initialize logging
$LogFile = "MSI-Build_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$script:LogPath = Join-Path $PSScriptRoot $LogFile

function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet('Info', 'Warning', 'Error', 'Success')]
        [string]$Level = 'Info'
    )
    
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    switch ($Level) {
        'Info'    { Write-Host $LogEntry -ForegroundColor White }
        'Warning' { Write-Host $LogEntry -ForegroundColor Yellow }
        'Error'   { Write-Host $LogEntry -ForegroundColor Red }
        'Success' { Write-Host $LogEntry -ForegroundColor Green }
    }
    
    Add-Content -Path $script:LogPath -Value $LogEntry
}

function Test-Prerequisites {
    Write-Log "Checking build prerequisites..." -Level 'Info'
    
    $Prerequisites = @{
        WixToolset = $false
        DotNetSDK = $false
        SigningTools = $false
        VisualStudio = $false
    }
    
    # Check for WiX Toolset
    $WixPath = Get-Command "candle.exe" -ErrorAction SilentlyContinue
    if ($WixPath) {
        $Prerequisites.WixToolset = $true
        Write-Log "WiX Toolset found: $($WixPath.Source)" -Level 'Success'
    } else {
        Write-Log "WiX Toolset not found. Please install WiX Toolset v3.11 or later." -Level 'Error'
    }
    
    # Check for .NET SDK
    $DotNetVersion = & dotnet --version 2>$null
    if ($DotNetVersion -and [version]$DotNetVersion -ge [version]"6.0") {
        $Prerequisites.DotNetSDK = $true
        Write-Log ".NET SDK found: $DotNetVersion" -Level 'Success'
    } else {
        Write-Log ".NET SDK 6.0 or later required" -Level 'Warning'
    }
    
    # Check for signing tools if certificate provided
    if ($SigningCertificate) {
        $SignToolPath = Get-Command "signtool.exe" -ErrorAction SilentlyContinue
        if ($SignToolPath) {
            $Prerequisites.SigningTools = $true
            Write-Log "SignTool found: $($SignToolPath.Source)" -Level 'Success'
        } else {
            Write-Log "SignTool not found. Digital signing will be skipped." -Level 'Warning'
        }
    }
    
    # Check for Visual Studio Build Tools
    $MSBuildPath = Get-Command "msbuild.exe" -ErrorAction SilentlyContinue
    if ($MSBuildPath) {
        $Prerequisites.VisualStudio = $true
        Write-Log "MSBuild found: $($MSBuildPath.Source)" -Level 'Success'
    }
    
    # Validate critical prerequisites
    if (-not $Prerequisites.WixToolset) {
        throw "WiX Toolset is required but not found. Please install from: https://github.com/wixtoolset/wix3/releases"
    }
    
    return $Prerequisites
}

function Initialize-BuildEnvironment {
    Write-Log "Initializing MSI build environment..." -Level 'Info'
    
    # Ensure output directory exists
    if (!(Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        Write-Log "Created output directory: $OutputPath" -Level 'Success'
    }
    
    # Create working directories
    $WorkingDirs = @(
        'Temp',
        'WiX-Objects', 
        'CustomActions',
        'Resources',
        'SCCM-Package',
        'GPO-Templates'
    )
    
    foreach ($Dir in $WorkingDirs) {
        $DirPath = Join-Path $OutputPath $Dir
        if (!(Test-Path $DirPath)) {
            New-Item -Path $DirPath -ItemType Directory -Force | Out-Null
        }
    }
    
    # Validate source files
    $RequiredFiles = @(
        'MandADiscoverySuite.exe',
        'MandADiscoverySuite.dll'
    )
    
    foreach ($File in $RequiredFiles) {
        $FilePath = Join-Path $SourcePath $File
        if (!(Test-Path $FilePath)) {
            throw "Required file not found: $File in $SourcePath"
        }
    }
    
    Write-Log "Build environment initialized successfully" -Level 'Success'
}

function Build-CustomActions {
    Write-Log "Building custom actions library..." -Level 'Info'
    
    $CustomActionsPath = Join-Path $OutputPath "CustomActions"
    
    # Create custom actions C# project
    $CustomActionsProject = @'
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>CustomActions.CA</AssemblyName>
    <PlatformTarget>x64</PlatformTarget>
    <GenerateAssemblyInfo>false</GenerateAssemblyInfo>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="WixToolset.Dtf.WindowsInstaller" Version="4.0.0" />
  </ItemGroup>
  
  <ItemGroup>
    <Reference Include="System.ServiceProcess" />
  </ItemGroup>
</Project>
'@
    
    $ProjectPath = Join-Path $CustomActionsPath "CustomActions.csproj"
    $CustomActionsProject | Out-File -FilePath $ProjectPath -Encoding UTF8
    
    # Create custom actions source code
    $CustomActionsSource = @'
using System;
using System.IO;
using System.Diagnostics;
using System.ServiceProcess;
using System.Security.Principal;
using Microsoft.Deployment.WindowsInstaller;

namespace MandADiscoverySuite.CustomActions
{
    public class CustomActions
    {
        [CustomAction]
        public static ActionResult CheckDotNetRuntime(Session session)
        {
            session.Log("Checking .NET Runtime...");
            
            try
            {
                var dotnetProcess = Process.Start(new ProcessStartInfo
                {
                    FileName = "dotnet",
                    Arguments = "--version",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                });
                
                if (dotnetProcess != null)
                {
                    dotnetProcess.WaitForExit();
                    if (dotnetProcess.ExitCode == 0)
                    {
                        var version = dotnetProcess.StandardOutput.ReadToEnd().Trim();
                        session.Log($".NET Runtime version: {version}");
                        return ActionResult.Success;
                    }
                }
                
                session.Log("ERROR: .NET 6.0 Runtime not found");
                return ActionResult.Failure;
            }
            catch (Exception ex)
            {
                session.Log($"ERROR: Failed to check .NET Runtime: {ex.Message}");
                return ActionResult.Failure;
            }
        }
        
        [CustomAction]
        public static ActionResult ValidateSystemRequirements(Session session)
        {
            session.Log("Validating system requirements...");
            
            try
            {
                // Check Windows version
                var osVersion = Environment.OSVersion;
                if (osVersion.Version.Major < 10)
                {
                    session.Log("ERROR: Windows 10 or later is required");
                    return ActionResult.Failure;
                }
                
                // Check available disk space (minimum 1GB)
                var installFolder = session["INSTALLFOLDER"];
                if (!string.IsNullOrEmpty(installFolder))
                {
                    var drive = new DriveInfo(Path.GetPathRoot(installFolder));
                    if (drive.AvailableFreeSpace < 1024 * 1024 * 1024)
                    {
                        session.Log("ERROR: Insufficient disk space. At least 1GB required.");
                        return ActionResult.Failure;
                    }
                }
                
                // Check if running as administrator
                var identity = WindowsIdentity.GetCurrent();
                var principal = new WindowsPrincipal(identity);
                if (!principal.IsInRole(WindowsBuiltInRole.Administrator))
                {
                    session.Log("WARNING: Not running as administrator");
                }
                
                session.Log("System requirements validation passed");
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"ERROR: System requirements validation failed: {ex.Message}");
                return ActionResult.Failure;
            }
        }
        
        [CustomAction]
        public static ActionResult ConfigurePowerShellExecutionPolicy(Session session)
        {
            session.Log("Configuring PowerShell execution policy...");
            
            try
            {
                var policyProcess = Process.Start(new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = "-Command \"Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force\"",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardError = true
                });
                
                if (policyProcess != null)
                {
                    policyProcess.WaitForExit();
                    if (policyProcess.ExitCode == 0)
                    {
                        session.Log("PowerShell execution policy configured successfully");
                        return ActionResult.Success;
                    }
                    else
                    {
                        var error = policyProcess.StandardError.ReadToEnd();
                        session.Log($"WARNING: Failed to set execution policy: {error}");
                        return ActionResult.Success; // Non-critical failure
                    }
                }
                
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"WARNING: PowerShell configuration failed: {ex.Message}");
                return ActionResult.Success; // Non-critical failure
            }
        }
        
        [CustomAction]
        public static ActionResult RegisterPowerShellModules(Session session)
        {
            session.Log("Registering PowerShell modules...");
            
            try
            {
                var installFolder = session["INSTALLFOLDER"];
                var modulesPath = Path.Combine(installFolder, "Modules");
                
                if (Directory.Exists(modulesPath))
                {
                    // Add modules path to PSModulePath environment variable
                    var currentPath = Environment.GetEnvironmentVariable("PSModulePath", EnvironmentVariableTarget.Machine) ?? "";
                    if (!currentPath.Contains(modulesPath))
                    {
                        var newPath = string.IsNullOrEmpty(currentPath) ? modulesPath : $"{currentPath};{modulesPath}";
                        Environment.SetEnvironmentVariable("PSModulePath", newPath, EnvironmentVariableTarget.Machine);
                        session.Log("PowerShell modules path added to environment");
                    }
                    
                    return ActionResult.Success;
                }
                
                session.Log("WARNING: Modules directory not found");
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"WARNING: Failed to register PowerShell modules: {ex.Message}");
                return ActionResult.Success; // Non-critical failure
            }
        }
        
        [CustomAction]
        public static ActionResult CreateDataDirectories(Session session)
        {
            session.Log("Creating data directories...");
            
            try
            {
                var dataPath = @"C:\ProgramData\Enterprise MA Solutions\MA Discovery Suite";
                
                var directories = new[]
                {
                    dataPath,
                    Path.Combine(dataPath, "Data"),
                    Path.Combine(dataPath, "Logs"),
                    Path.Combine(dataPath, "Cache"),
                    Path.Combine(dataPath, "Backup"),
                    @"C:\DiscoveryData"
                };
                
                foreach (var directory in directories)
                {
                    if (!Directory.Exists(directory))
                    {
                        Directory.CreateDirectory(directory);
                        session.Log($"Created directory: {directory}");
                    }
                }
                
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"ERROR: Failed to create data directories: {ex.Message}");
                return ActionResult.Failure;
            }
        }
        
        [CustomAction]
        public static ActionResult ConfigureWindowsFirewall(Session session)
        {
            session.Log("Configuring Windows Firewall...");
            
            try
            {
                var installFolder = session["INSTALLFOLDER"];
                var exePath = Path.Combine(installFolder, "MandADiscoverySuite.exe");
                
                if (File.Exists(exePath))
                {
                    var firewallProcess = Process.Start(new ProcessStartInfo
                    {
                        FileName = "netsh",
                        Arguments = $"advfirewall firewall add rule name=\"M&A Discovery Suite\" dir=in action=allow program=\"{exePath}\" enable=yes",
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        RedirectStandardError = true
                    });
                    
                    if (firewallProcess != null)
                    {
                        firewallProcess.WaitForExit();
                        if (firewallProcess.ExitCode == 0)
                        {
                            session.Log("Windows Firewall configured successfully");
                        }
                        else
                        {
                            var error = firewallProcess.StandardError.ReadToEnd();
                            session.Log($"WARNING: Firewall configuration failed: {error}");
                        }
                    }
                }
                
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"WARNING: Firewall configuration failed: {ex.Message}");
                return ActionResult.Success; // Non-critical failure
            }
        }
        
        [CustomAction]
        public static ActionResult StartApplicationAfterInstall(Session session)
        {
            session.Log("Starting application after installation...");
            
            try
            {
                var startAfterInstall = session["START_AFTER_INSTALL"];
                if (startAfterInstall == "1")
                {
                    var installFolder = session["INSTALLFOLDER"];
                    var exePath = Path.Combine(installFolder, "MandADiscoverySuite.exe");
                    
                    if (File.Exists(exePath))
                    {
                        Process.Start(exePath);
                        session.Log("Application started successfully");
                    }
                }
                
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"WARNING: Failed to start application: {ex.Message}");
                return ActionResult.Success; // Non-critical failure
            }
        }
        
        [CustomAction]
        public static ActionResult StopApplicationServices(Session session)
        {
            session.Log("Stopping application services...");
            
            try
            {
                // Stop any running processes
                var processes = Process.GetProcessesByName("MandADiscoverySuite");
                foreach (var process in processes)
                {
                    try
                    {
                        process.CloseMainWindow();
                        if (!process.WaitForExit(5000))
                        {
                            process.Kill();
                        }
                        session.Log($"Stopped process: {process.Id}");
                    }
                    catch
                    {
                        // Ignore errors stopping individual processes
                    }
                }
                
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"WARNING: Failed to stop application services: {ex.Message}");
                return ActionResult.Success; // Non-critical failure
            }
        }
        
        [CustomAction]
        public static ActionResult CleanupDataDirectories(Session session)
        {
            session.Log("Cleaning up data directories...");
            
            try
            {
                // This is intentionally minimal - we don't want to remove user data
                var cachePath = @"C:\ProgramData\Enterprise MA Solutions\MA Discovery Suite\Cache";
                if (Directory.Exists(cachePath))
                {
                    Directory.Delete(cachePath, true);
                    session.Log("Cleaned cache directory");
                }
                
                return ActionResult.Success;
            }
            catch (Exception ex)
            {
                session.Log($"WARNING: Failed to cleanup data directories: {ex.Message}");
                return ActionResult.Success; // Non-critical failure
            }
        }
    }
}
'@
    
    $SourcePath = Join-Path $CustomActionsPath "CustomActions.cs"
    $CustomActionsSource | Out-File -FilePath $SourcePath -Encoding UTF8
    
    # Build the custom actions library
    try {
        $BuildResult = & dotnet build $ProjectPath --configuration Release --output (Join-Path $CustomActionsPath "bin")
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Custom actions library built successfully" -Level 'Success'
            return Join-Path $CustomActionsPath "bin\CustomActions.CA.dll"
        } else {
            throw "Custom actions build failed"
        }
    } catch {
        Write-Log "Failed to build custom actions: $($_.Exception.Message)" -Level 'Error'
        throw
    }
}

function Prepare-Resources {
    Write-Log "Preparing installer resources..." -Level 'Info'
    
    $ResourcesPath = Join-Path $OutputPath "Resources"
    
    # Create basic license file
    $License = @"
SOFTWARE LICENSE AGREEMENT
M&A Discovery Suite Enterprise Edition

This software is licensed for use by enterprise customers under the terms
and conditions specified in your enterprise license agreement.

For licensing inquiries, contact: licensing@mandadiscovery.com

Copyright (c) $(Get-Date -Format yyyy) Enterprise M&A Solutions. All rights reserved.
"@
    
    $License | Out-File -FilePath (Join-Path $ResourcesPath "License.rtf") -Encoding UTF8
    
    # Create basic installer banners (placeholder - replace with actual graphics)
    # In production, these would be proper BMP files
    $BannerData = @(0x42, 0x4D, 0x76, 0x00, 0x00, 0x00) # BMP header placeholder
    [System.IO.File]::WriteAllBytes((Join-Path $ResourcesPath "InstallBanner.bmp"), $BannerData)
    [System.IO.File]::WriteAllBytes((Join-Path $ResourcesPath "InstallDialog.bmp"), $BannerData)
    
    Write-Log "Installer resources prepared" -Level 'Success'
}

function Build-MSIPackage {
    Write-Log "Building MSI package..." -Level 'Info'
    
    # Prepare WiX variables
    $WixVariables = @{
        'SourceDir' = $SourcePath
        'Version' = $Version
        'Architecture' = $Architecture
        'Configuration' = $Configuration
    }
    
    # Build command arguments
    $CandleArgs = @(
        (Join-Path $PSScriptRoot "MandADiscoverySuite.wxs")
        "-out", (Join-Path $OutputPath "WiX-Objects\")
        "-arch", $Architecture.ToLower()
    )
    
    # Add variables to candle arguments
    foreach ($Variable in $WixVariables.GetEnumerator()) {
        $CandleArgs += "-d$($Variable.Key)=$($Variable.Value)"
    }
    
    # Compile WiX sources
    Write-Log "Compiling WiX sources..." -Level 'Info'
    & candle.exe @CandleArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "WiX compilation failed with exit code: $LASTEXITCODE"
    }
    
    # Link MSI package
    $MSIPath = Join-Path $OutputPath "MandADiscoverySuite-v$Version-$Architecture.msi"
    $LightArgs = @(
        (Join-Path $OutputPath "WiX-Objects\MandADiscoverySuite.wixobj")
        "-out", $MSIPath
        "-ext", "WixUIExtension"
        "-ext", "WixUtilExtension"
        "-ext", "WixNetFxExtension"
        "-b", $SourcePath
        "-b", (Join-Path $OutputPath "Resources")
    )
    
    Write-Log "Linking MSI package..." -Level 'Info'
    & light.exe @LightArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "WiX linking failed with exit code: $LASTEXITCODE"
    }
    
    if (Test-Path $MSIPath) {
        $FileSize = (Get-Item $MSIPath).Length / 1MB
        Write-Log "MSI package created successfully: $MSIPath ($([math]::Round($FileSize, 2)) MB)" -Level 'Success'
        return $MSIPath
    } else {
        throw "MSI package was not created"
    }
}

function Invoke-DigitalSigning {
    param([string]$MSIPath)
    
    if (-not $SigningCertificate) {
        Write-Log "No signing certificate specified - skipping digital signing" -Level 'Warning'
        return
    }
    
    Write-Log "Digitally signing MSI package..." -Level 'Info'
    
    try {
        $SignArgs = @(
            'sign'
            '/v'
            '/s', 'My'
            '/sha1', $SigningCertificate.Replace('Cert:\CurrentUser\My\', '').Replace('Cert:\LocalMachine\My\', '')
            '/fd', 'SHA256'
            '/tr', 'http://timestamp.digicert.com'
            '/td', 'SHA256'
            $MSIPath
        )
        
        & signtool.exe @SignArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "MSI package signed successfully" -Level 'Success'
        } else {
            Write-Log "Digital signing failed with exit code: $LASTEXITCODE" -Level 'Error'
        }
    } catch {
        Write-Log "Digital signing error: $($_.Exception.Message)" -Level 'Error'
    }
}

function Test-MSIPackage {
    param([string]$MSIPath)
    
    Write-Log "Validating MSI package..." -Level 'Info'
    
    $ValidationResults = @{
        FileExists = Test-Path $MSIPath
        IsSigned = $false
        InstallTest = $false
        UninstallTest = $false
    }
    
    # Check if file is signed
    try {
        $Signature = Get-AuthenticodeSignature -FilePath $MSIPath
        $ValidationResults.IsSigned = ($Signature.Status -eq 'Valid')
        if ($ValidationResults.IsSigned) {
            Write-Log "MSI package is digitally signed" -Level 'Success'
        } else {
            Write-Log "MSI package is not signed or signature is invalid" -Level 'Warning'
        }
    } catch {
        Write-Log "Could not verify signature: $($_.Exception.Message)" -Level 'Warning'
    }
    
    # Test silent installation (if validate flag is set)
    if ($Validate) {
        Write-Log "Testing silent installation..." -Level 'Info'
        
        try {
            # Test install
            $InstallArgs = @(
                '/i', $MSIPath
                '/quiet'
                '/norestart'
                '/l*v', (Join-Path $OutputPath "install-test.log")
                'INSTALL_POWERSHELL_MODULES=1'
                'CREATE_DESKTOP_SHORTCUT=0'
                'START_AFTER_INSTALL=0'
            )
            
            $InstallProcess = Start-Process -FilePath 'msiexec.exe' -ArgumentList $InstallArgs -Wait -PassThru
            $ValidationResults.InstallTest = ($InstallProcess.ExitCode -eq 0)
            
            if ($ValidationResults.InstallTest) {
                Write-Log "Silent installation test passed" -Level 'Success'
                
                Start-Sleep -Seconds 5
                
                # Test uninstall
                $UninstallArgs = @(
                    '/x', $MSIPath
                    '/quiet'
                    '/norestart'
                    '/l*v', (Join-Path $OutputPath "uninstall-test.log")
                )
                
                $UninstallProcess = Start-Process -FilePath 'msiexec.exe' -ArgumentList $UninstallArgs -Wait -PassThru
                $ValidationResults.UninstallTest = ($UninstallProcess.ExitCode -eq 0)
                
                if ($ValidationResults.UninstallTest) {
                    Write-Log "Silent uninstallation test passed" -Level 'Success'
                } else {
                    Write-Log "Silent uninstallation test failed" -Level 'Warning'
                }
            } else {
                Write-Log "Silent installation test failed" -Level 'Warning'
            }
        } catch {
            Write-Log "Installation testing failed: $($_.Exception.Message)" -Level 'Warning'
        }
    }
    
    return $ValidationResults
}

function New-SCCMPackage {
    param([string]$MSIPath)
    
    if (-not $CreateSCCMPackage) {
        return
    }
    
    Write-Log "Creating SCCM deployment package..." -Level 'Info'
    
    $SCCMPath = Join-Path $OutputPath "SCCM-Package"
    
    # Copy MSI to SCCM package directory
    Copy-Item -Path $MSIPath -Destination $SCCMPath -Force
    
    # Create SCCM package definition
    $PackageDefinition = @"
[Package Definition]
Version=4

[Package Definition - M&A Discovery Suite]
Name=M&A Discovery Suite
Version=$Version
Language=English
Publisher=Enterprise M&A Solutions
CmdLine=msiexec.exe /i "MandADiscoverySuite-v$Version-$Architecture.msi" /quiet /norestart INSTALL_POWERSHELL_MODULES=1
AdminRights=TRUE
Comment=M&A Discovery Suite Enterprise Migration Platform
DefaultProgram=M&A Discovery Suite - Silent Install
Icon=MandADiscoverySuite.ico
SetupVariations=M&A Discovery Suite - Silent Install

[M&A Discovery Suite - Silent Install]
Name=M&A Discovery Suite - Silent Install
CmdLine=msiexec.exe /i "MandADiscoverySuite-v$Version-$Architecture.msi" /quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1
Icon=MandADiscoverySuite.ico
Comment=Silent installation of M&A Discovery Suite with PowerShell modules
RunType=Normal
AdminRights=TRUE
UserInputType=Hidden
DriveMode=UncName

[M&A Discovery Suite - Interactive Install]
Name=M&A Discovery Suite - Interactive Install  
CmdLine=msiexec.exe /i "MandADiscoverySuite-v$Version-$Architecture.msi" /passive /norestart
Icon=MandADiscoverySuite.ico
Comment=Interactive installation of M&A Discovery Suite
RunType=Normal
AdminRights=TRUE
UserInputType=Hidden
DriveMode=UncName

[M&A Discovery Suite - Uninstall]
Name=M&A Discovery Suite - Uninstall
CmdLine=msiexec.exe /x "MandADiscoverySuite-v$Version-$Architecture.msi" /quiet /norestart
Icon=MandADiscoverySuite.ico
Comment=Silent uninstallation of M&A Discovery Suite
RunType=Normal
AdminRights=TRUE
UserInputType=Hidden
DriveMode=UncName
"@
    
    $PackageDefinition | Out-File -FilePath (Join-Path $SCCMPath "MandADiscoverySuite.sms") -Encoding ASCII
    
    # Create deployment instructions
    $DeploymentInstructions = @"
# M&A Discovery Suite - SCCM Deployment Instructions

## Package Information
- **Product**: M&A Discovery Suite v$Version
- **Architecture**: $Architecture
- **Installation Type**: MSI Package
- **Administrator Rights**: Required

## Deployment Steps

### 1. Create Package
1. In SCCM Console, navigate to Software Library > Application Management > Packages
2. Right-click Packages and select "Create Package from Definition"
3. Browse to the provided SMS file: MandADiscoverySuite.sms
4. Follow the wizard to complete package creation

### 2. Distribute Content
1. Right-click the created package and select "Distribute Content"
2. Select appropriate distribution points
3. Wait for content distribution to complete

### 3. Create Deployment
1. Right-click the package and select "Deploy"
2. Select target collection (computers)
3. Configure deployment settings:
   - **Purpose**: Required (for automatic installation)
   - **Schedule**: Set appropriate deployment schedule
   - **User Experience**: Hide in Software Center (for silent deployment)
   - **Alerts**: Configure as needed

### 4. Monitor Deployment
1. Navigate to Monitoring > Deployments
2. Monitor deployment status and success rates
3. Review deployment reports for any failures

## Installation Commands

### Silent Installation
```
msiexec.exe /i "MandADiscoverySuite-v$Version-$Architecture.msi" /quiet /norestart INSTALL_POWERSHELL_MODULES=1 CREATE_DESKTOP_SHORTCUT=1
```

### Interactive Installation
```
msiexec.exe /i "MandADiscoverySuite-v$Version-$Architecture.msi" /passive /norestart
```

### Silent Uninstallation
```
msiexec.exe /x "MandADiscoverySuite-v$Version-$Architecture.msi" /quiet /norestart
```

## System Requirements
- Windows 10 or Windows Server 2016 or later
- .NET 6.0 Runtime
- PowerShell 5.1 or later
- Administrator privileges
- Minimum 1GB free disk space

## Troubleshooting
- Check Windows Event Log for installation errors
- Review MSI log files (if logging enabled)
- Verify system requirements are met
- Ensure network connectivity for PowerShell module downloads

## Support
For deployment assistance, contact your IT administrator or M&A Discovery Suite support team.
"@
    
    $DeploymentInstructions | Out-File -FilePath (Join-Path $SCCMPath "SCCM-Deployment-Instructions.md") -Encoding UTF8
    
    Write-Log "SCCM deployment package created successfully" -Level 'Success'
}

function New-GPOTemplate {
    param([string]$MSIPath)
    
    if (-not $CreateGPOTemplate) {
        return
    }
    
    Write-Log "Creating Group Policy deployment template..." -Level 'Info'
    
    $GPOPath = Join-Path $OutputPath "GPO-Templates"
    
    # Create GPO deployment script
    $GPOScript = @"
#Requires -Version 5.1
#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Group Policy Software Deployment Script for M&A Discovery Suite

.DESCRIPTION
    This script facilitates deployment of M&A Discovery Suite through Group Policy
    Software Installation. Use this for domain-wide deployment in enterprise environments.

.PARAMETER MSIPath
    Path to the MSI package (typically on a network share)

.PARAMETER LogPath
    Path for deployment logs

.EXAMPLE
    .\Deploy-via-GPO.ps1 -MSIPath "\\fileserver\software\MandADiscoverySuite-v$Version-$Architecture.msi"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = `$true)]
    [string]`$MSIPath,
    
    [Parameter(Mandatory = `$false)]
    [string]`$LogPath = "`$env:WINDIR\Logs\MandADiscovery-GPO-Install.log"
)

Set-StrictMode -Version 3.0
`$ErrorActionPreference = 'Stop'

function Write-Log {
    param([string]`$Message)
    `$LogEntry = "[`$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] `$Message"
    `$LogEntry | Out-File -FilePath `$LogPath -Append -Encoding UTF8
    Write-Host `$LogEntry
}

try {
    Write-Log "Starting M&A Discovery Suite GPO deployment..."
    
    # Verify MSI package exists
    if (-not (Test-Path `$MSIPath)) {
        throw "MSI package not found: `$MSIPath"
    }
    
    Write-Log "MSI package verified: `$MSIPath"
    
    # Prepare installation arguments
    `$InstallArgs = @(
        '/i', `$MSIPath
        '/quiet'
        '/norestart'
        '/l*v', `$LogPath.Replace('.log', '-msi.log')
        'INSTALL_POWERSHELL_MODULES=1'
        'CREATE_DESKTOP_SHORTCUT=1'
        'CONFIGURE_FIREWALL=1'
        'START_AFTER_INSTALL=0'
    )
    
    Write-Log "Starting silent installation..."
    `$Process = Start-Process -FilePath 'msiexec.exe' -ArgumentList `$InstallArgs -Wait -PassThru -NoNewWindow
    
    if (`$Process.ExitCode -eq 0) {
        Write-Log "M&A Discovery Suite installed successfully"
        
        # Verify installation
        `$InstallPath = Get-ItemProperty -Path "HKLM:\SOFTWARE\Enterprise MA Solutions\MA Discovery Suite" -Name "InstallPath" -ErrorAction SilentlyContinue
        if (`$InstallPath) {
            Write-Log "Installation verified at: `$(`$InstallPath.InstallPath)"
        }
        
        exit 0
    } else {
        Write-Log "Installation failed with exit code: `$(`$Process.ExitCode)"
        exit `$Process.ExitCode
    }
    
} catch {
    Write-Log "ERROR: `$(`$_.Exception.Message)"
    exit 1
}
"@
    
    $GPOScript | Out-File -FilePath (Join-Path $GPOPath "Deploy-via-GPO.ps1") -Encoding UTF8
    
    # Create GPO deployment instructions
    $GPOInstructions = @"
# M&A Discovery Suite - Group Policy Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying M&A Discovery Suite across your domain using Group Policy Software Installation.

## Prerequisites
- Domain Administrator privileges
- Network share accessible by all target computers
- M&A Discovery Suite MSI package: MandADiscoverySuite-v$Version-$Architecture.msi

## Deployment Steps

### 1. Prepare Network Share
1. Create a network share accessible by Domain Computers (e.g., \\\\fileserver\\software)
2. Copy the MSI package to the share
3. Ensure "Domain Computers" group has Read permissions on the share

### 2. Create Group Policy Object
1. Open Group Policy Management Console (gpmc.msc)
2. Right-click the target OU and select "Create a GPO in this domain, and Link it here"
3. Name the GPO: "M&A Discovery Suite Deployment"

### 3. Configure Software Installation
1. Edit the newly created GPO
2. Navigate to: Computer Configuration > Policies > Software Settings > Software Installation
3. Right-click Software Installation and select "New > Package"
4. Browse to the network share and select the MSI package
5. Choose "Assigned" for deployment method
6. Click OK to create the software installation policy

### 4. Configure Advanced Options (Optional)
1. Right-click the software package and select "Properties"
2. On the Deployment tab:
   - Check "Uninstall this application when it falls out of the scope of management"
   - Set "Installation user interface options" to "Basic"
   - Configure other options as needed

### 5. Configure Security Filtering (Optional)
1. In the GPO properties, go to Security Filtering
2. Remove "Authenticated Users" if you want to target specific groups
3. Add security groups or computer accounts as needed

### 6. Test Deployment
1. Link the GPO to a test OU with a few computers
2. Run `gpupdate /force` on test computers
3. Restart test computers or wait for next startup
4. Verify successful installation

### 7. Production Rollout
1. After successful testing, link the GPO to production OUs
2. Monitor deployment through Group Policy Results and Event Logs

## Installation Parameters
The GPO deployment uses these MSI parameters:
- `INSTALL_POWERSHELL_MODULES=1` - Install PowerShell modules
- `CREATE_DESKTOP_SHORTCUT=1` - Create desktop shortcuts
- `CONFIGURE_FIREWALL=1` - Configure Windows Firewall
- `START_AFTER_INSTALL=0` - Don't start application after install

## Troubleshooting

### Common Issues
1. **Installation fails with access denied**
   - Verify Domain Computers have read access to network share
   - Check that MSI package is not corrupted

2. **GPO not applying**
   - Verify GPO is linked to correct OU
   - Check security filtering settings
   - Run `gpresult /h report.html` to check applied policies

3. **Installation succeeds but application doesn't work**
   - Check Event Logs for application errors
   - Verify .NET 6.0 Runtime is installed
   - Check PowerShell execution policy

### Log Locations
- GPO Processing: `%WINDIR%\\debug\\usermode\\gpsvc.log`
- MSI Installation: `%WINDIR%\\Logs\\MandADiscovery-GPO-Install-msi.log`
- Application: `C:\\ProgramData\\Enterprise MA Solutions\\MA Discovery Suite\\Logs`

## Rollback Procedures

### Emergency Uninstall via GPO
1. Edit the GPO containing the software package
2. Right-click the software package and select "All Tasks > Remove"
3. Choose "Immediately uninstall the software from users and computers"
4. Apply the policy using `gpupdate /force`

### Manual Uninstall
```cmd
msiexec.exe /x MandADiscoverySuite-v$Version-$Architecture.msi /quiet /norestart
```

## Support
For technical assistance with Group Policy deployment:
- Contact your Active Directory administrators
- Review Windows Event Logs on target computers
- Check Group Policy operational logs
- Contact M&A Discovery Suite support team for application-specific issues

---
**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')
**Version**: $Version
**MSI Package**: MandADiscoverySuite-v$Version-$Architecture.msi
"@
    
    $GPOInstructions | Out-File -FilePath (Join-Path $GPOPath "GPO-Deployment-Guide.md") -Encoding UTF8
    
    Write-Log "Group Policy deployment template created successfully" -Level 'Success'
}

function Write-BuildSummary {
    param(
        [string]$MSIPath,
        [hashtable]$ValidationResults
    )
    
    Write-Log "" -Level 'Info'
    Write-Log "===============================================" -Level 'Info'
    Write-Log "MSI Build Complete - M&A Discovery Suite v$Version" -Level 'Success'
    Write-Log "===============================================" -Level 'Info'
    
    Write-Log "Build Summary:" -Level 'Info'
    Write-Log "  Version: $Version" -Level 'Info'
    Write-Log "  Architecture: $Architecture" -Level 'Info'
    Write-Log "  Configuration: $Configuration" -Level 'Info'
    Write-Log "  MSI Package: $MSIPath" -Level 'Info'
    
    if (Test-Path $MSIPath) {
        $FileSize = (Get-Item $MSIPath).Length / 1MB
        Write-Log "  Package Size: $([math]::Round($FileSize, 2)) MB" -Level 'Info'
    }
    
    Write-Log "" -Level 'Info'
    Write-Log "Validation Results:" -Level 'Info'
    Write-Log "  File Exists: $(if ($ValidationResults.FileExists) { 'PASS' } else { 'FAIL' })" -Level $(if ($ValidationResults.FileExists) { 'Success' } else { 'Error' })
    Write-Log "  Digitally Signed: $(if ($ValidationResults.IsSigned) { 'PASS' } else { 'SKIP' })" -Level $(if ($ValidationResults.IsSigned) { 'Success' } else { 'Warning' })
    
    if ($Validate) {
        Write-Log "  Install Test: $(if ($ValidationResults.InstallTest) { 'PASS' } else { 'FAIL' })" -Level $(if ($ValidationResults.InstallTest) { 'Success' } else { 'Warning' })
        Write-Log "  Uninstall Test: $(if ($ValidationResults.UninstallTest) { 'PASS' } else { 'FAIL' })" -Level $(if ($ValidationResults.UninstallTest) { 'Success' } else { 'Warning' })
    }
    
    Write-Log "" -Level 'Info'
    Write-Log "Output Files:" -Level 'Info'
    Write-Log "  MSI Package: $MSIPath" -Level 'Info'
    Write-Log "  Build Log: $script:LogPath" -Level 'Info'
    
    if ($CreateSCCMPackage) {
        Write-Log "  SCCM Package: $(Join-Path $OutputPath 'SCCM-Package')" -Level 'Info'
    }
    
    if ($CreateGPOTemplate) {
        Write-Log "  GPO Templates: $(Join-Path $OutputPath 'GPO-Templates')" -Level 'Info'
    }
    
    Write-Log "" -Level 'Info'
    Write-Log "Next Steps:" -Level 'Info'
    Write-Log "  1. Test the MSI package in a development environment" -Level 'Info'
    Write-Log "  2. Deploy to staging environment for validation" -Level 'Info'
    Write-Log "  3. Create deployment packages for production rollout" -Level 'Info'
    Write-Log "  4. Monitor deployment success and user feedback" -Level 'Info'
    
    Write-Log "" -Level 'Info'
    Write-Log "Enterprise Deployment Options:" -Level 'Info'
    Write-Log "  - SCCM: Use generated SCCM package for automated deployment" -Level 'Info'
    Write-Log "  - Group Policy: Use GPO templates for domain-wide installation" -Level 'Info'
    Write-Log "  - Manual: Use MSI directly with msiexec command-line options" -Level 'Info'
    
    Write-Log "" -Level 'Info'
    Write-Log "MSI Installer Build Completed Successfully!" -Level 'Success'
    Write-Log "===============================================" -Level 'Info'
}

# Main execution
try {
    Write-Log "Starting MSI Installer Build Process" -Level 'Info'
    Write-Log "=====================================" -Level 'Info'
    
    # Check prerequisites
    $Prerequisites = Test-Prerequisites
    
    # Initialize build environment
    Initialize-BuildEnvironment
    
    # Build custom actions
    $CustomActionsPath = Build-CustomActions
    
    # Prepare resources
    Prepare-Resources
    
    # Build MSI package
    $MSIPath = Build-MSIPackage
    
    # Sign the package
    Invoke-DigitalSigning -MSIPath $MSIPath
    
    # Validate the package
    $ValidationResults = Test-MSIPackage -MSIPath $MSIPath
    
    # Create deployment packages
    New-SCCMPackage -MSIPath $MSIPath
    New-GPOTemplate -MSIPath $MSIPath
    
    # Write build summary
    Write-BuildSummary -MSIPath $MSIPath -ValidationResults $ValidationResults
    
    Write-Log "MSI build process completed successfully!" -Level 'Success'
    
} catch {
    Write-Log "CRITICAL ERROR: $($_.Exception.Message)" -Level 'Error'
    Write-Log "Stack Trace: $($_.ScriptStackTrace)" -Level 'Error'
    exit 1
}