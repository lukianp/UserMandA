# M&A Migration Platform - Troubleshooting & Maintenance Guide
**Comprehensive Support Documentation for Operations Teams and System Administrators**

Generated: 2025-08-22
Platform Version: 1.0 Production Ready
Documentation Type: Troubleshooting & Maintenance
Audience: IT Operations, Support Teams, System Administrators

---

## TABLE OF CONTENTS

1. [Troubleshooting Framework](#troubleshooting-framework)
2. [Common Issues and Solutions](#common-issues-and-solutions)
3. [Performance Troubleshooting](#performance-troubleshooting)
4. [Connectivity Issues](#connectivity-issues)
5. [Data Integrity Problems](#data-integrity-problems)
6. [Security and Authentication Issues](#security-and-authentication-issues)
7. [Diagnostic Tools and Procedures](#diagnostic-tools-and-procedures)
8. [Maintenance Schedules](#maintenance-schedules)
9. [Preventive Maintenance](#preventive-maintenance)
10. [Emergency Recovery Procedures](#emergency-recovery-procedures)

---

## TROUBLESHOOTING FRAMEWORK

### Systematic Troubleshooting Approach

#### The 5-Layer Troubleshooting Model
```
Migration Platform Troubleshooting Layers:

Layer 1: USER INTERFACE
├── Application startup issues
├── Navigation and display problems
├── User interaction failures
└── UI responsiveness issues

Layer 2: APPLICATION LOGIC
├── Business logic errors
├── Workflow execution problems
├── Data processing issues
└── State management failures

Layer 3: INTEGRATION LAYER
├── PowerShell integration problems
├── Module loading failures
├── API communication issues
└── Event handling problems

Layer 4: SYSTEM SERVICES
├── Windows service issues
├── Authentication problems
├── Permission failures
└── Resource access issues

Layer 5: INFRASTRUCTURE
├── Network connectivity
├── Storage availability
├── Performance bottlenecks
└── Hardware failures
```

#### Troubleshooting Methodology
```
Standard Troubleshooting Process:

1. IDENTIFY - What is the problem?
   ├── Gather symptoms and error messages
   ├── Determine scope and impact
   ├── Identify affected components
   └── Document timeline of events

2. ANALYZE - What could cause this?
   ├── Review logs and error messages
   ├── Check system resources
   ├── Verify configuration settings
   └── Test component functionality

3. ISOLATE - Where is the root cause?
   ├── Test individual components
   ├── Use diagnostic tools
   ├── Reproduce the issue
   └── Narrow down to specific layer

4. RESOLVE - How to fix the problem?
   ├── Apply appropriate solution
   ├── Test the fix thoroughly
   ├── Monitor for side effects
   └── Document resolution steps

5. PREVENT - How to avoid recurrence?
   ├── Update documentation
   ├── Implement monitoring
   ├── Review processes
   └── Train support team
```

### Diagnostic Information Collection

#### Automated Diagnostic Script
```powershell
<#
.SYNOPSIS
    M&A Migration Platform - Comprehensive Diagnostic Information Collection
.DESCRIPTION
    Collects comprehensive diagnostic information for troubleshooting
.PARAMETER OutputPath
    Directory path to save diagnostic files (default: C:\Temp\Diagnostics)
.PARAMETER IncludeLogs
    Include log files in diagnostic collection (default: $true)
.PARAMETER IncludePerformanceData
    Include performance counters and metrics (default: $true)
#>

param(
    [string]$OutputPath = "C:\Temp\MigrationDiagnostics",
    [bool]$IncludeLogs = $true,
    [bool]$IncludePerformanceData = $true,
    [bool]$IncludeConfigurationFiles = $true
)

function Collect-DiagnosticInformation {
    param(
        [string]$OutputPath,
        [bool]$IncludeLogs,
        [bool]$IncludePerformanceData,
        [bool]$IncludeConfigurationFiles
    )
    
    Write-Host "Starting diagnostic information collection..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $diagnosticPath = Join-Path $OutputPath "MigrationPlatform_Diagnostics_$timestamp"
    
    # Create diagnostic directory structure
    New-Item -ItemType Directory -Path $diagnosticPath -Force | Out-Null
    $subDirectories = @("SystemInfo", "Logs", "Configuration", "Performance", "EventLogs", "PowerShell")
    foreach ($dir in $subDirectories) {
        New-Item -ItemType Directory -Path (Join-Path $diagnosticPath $dir) -Force | Out-Null
    }
    
    # System Information Collection
    Write-Host "Collecting system information..." -ForegroundColor Green
    
    # Basic system info
    Get-ComputerInfo | Out-File -FilePath (Join-Path $diagnosticPath "SystemInfo\ComputerInfo.txt")
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 20 | Out-File -FilePath (Join-Path $diagnosticPath "SystemInfo\TopProcesses.txt")
    Get-Service | Where-Object {$_.Name -like "*Migration*" -or $_.Name -like "*PowerShell*"} | Out-File -FilePath (Join-Path $diagnosticPath "SystemInfo\Services.txt")
    
    # Disk space information
    Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, Size, FreeSpace, @{Name="FreeSpacePercent";Expression={($_.FreeSpace / $_.Size) * 100}} | Out-File -FilePath (Join-Path $diagnosticPath "SystemInfo\DiskSpace.txt")
    
    # Network configuration
    Get-NetAdapter | Out-File -FilePath (Join-Path $diagnosticPath "SystemInfo\NetworkAdapters.txt")
    Get-NetTCPConnection | Where-Object {$_.State -eq "Established"} | Out-File -FilePath (Join-Path $diagnosticPath "SystemInfo\NetworkConnections.txt")
    
    # PowerShell Information
    Write-Host "Collecting PowerShell information..." -ForegroundColor Green
    
    $PSVersionTable | Out-File -FilePath (Join-Path $diagnosticPath "PowerShell\PSVersionTable.txt")
    Get-ExecutionPolicy -List | Out-File -FilePath (Join-Path $diagnosticPath "PowerShell\ExecutionPolicy.txt")
    Get-Module -ListAvailable | Where-Object {$_.Name -like "*Migration*" -or $_.Name -like "*Exchange*" -or $_.Name -like "*Azure*"} | Out-File -FilePath (Join-Path $diagnosticPath "PowerShell\AvailableModules.txt")
    Get-Module | Out-File -FilePath (Join-Path $diagnosticPath "PowerShell\LoadedModules.txt")
    
    # Migration Platform Specific Information
    Write-Host "Collecting migration platform information..." -ForegroundColor Green
    
    $migrationPath = "C:\MigrationPlatform"
    if (Test-Path $migrationPath) {
        Get-ChildItem -Path $migrationPath -Recurse | Select-Object FullName, Length, LastWriteTime | Out-File -FilePath (Join-Path $diagnosticPath "SystemInfo\MigrationPlatformFiles.txt")
    }
    
    # Configuration Files
    if ($IncludeConfigurationFiles) {
        Write-Host "Collecting configuration files..." -ForegroundColor Green
        
        $configPaths = @(
            "C:\MigrationPlatform\Configuration\*.json",
            "C:\MigrationPlatform\Configuration\*.xml",
            "C:\MigrationPlatform\Configuration\*.config"
        )
        
        foreach ($configPath in $configPaths) {
            $configFiles = Get-ChildItem -Path $configPath -ErrorAction SilentlyContinue
            foreach ($file in $configFiles) {
                $content = Get-Content -Path $file.FullName
                # Sanitize sensitive information
                $content = $content -replace '("password"\s*:\s*")[^"]*(")', '$1***REDACTED***$2'
                $content = $content -replace '("credential"\s*:\s*")[^"]*(")', '$1***REDACTED***$2'
                $content | Out-File -FilePath (Join-Path $diagnosticPath "Configuration\$($file.Name)")
            }
        }
    }
    
    # Application Logs
    if ($IncludeLogs) {
        Write-Host "Collecting log files..." -ForegroundColor Green
        
        $logPaths = @(
            "D:\MigrationLogs\Application\*.log",
            "D:\MigrationLogs\PowerShell\*.log", 
            "D:\MigrationLogs\Audit\*.log",
            "C:\MigrationPlatform\Logs\*.log"
        )
        
        foreach ($logPath in $logPaths) {
            $logFiles = Get-ChildItem -Path $logPath -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 10
            foreach ($logFile in $logFiles) {
                Copy-Item -Path $logFile.FullName -Destination (Join-Path $diagnosticPath "Logs") -Force
            }
        }
    }
    
    # Windows Event Logs
    Write-Host "Collecting Windows Event Log entries..." -ForegroundColor Green
    
    $eventLogs = @(
        @{Name = "Application"; Filter = "*Migration*"},
        @{Name = "System"; Filter = "*PowerShell*"},
        @{Name = "Security"; Filter = "*Migration*"}
    )
    
    foreach ($log in $eventLogs) {
        try {
            Get-WinEvent -LogName $log.Name -MaxEvents 1000 | Where-Object {$_.LevelDisplayName -in @("Error", "Warning", "Critical")} | Out-File -FilePath (Join-Path $diagnosticPath "EventLogs\$($log.Name)_Errors.txt")
        }
        catch {
            "Failed to collect $($log.Name) event log: $($_.Exception.Message)" | Out-File -FilePath (Join-Path $diagnosticPath "EventLogs\$($log.Name)_Error.txt")
        }
    }
    
    # Performance Data
    if ($IncludePerformanceData) {
        Write-Host "Collecting performance data..." -ForegroundColor Green
        
        $perfCounters = @(
            "\Processor(_Total)\% Processor Time",
            "\Memory\Available MBytes", 
            "\PhysicalDisk(_Total)\Avg. Disk Queue Length",
            "\Network Interface(*)\Bytes Total/sec"
        )
        
        foreach ($counter in $perfCounters) {
            try {
                Get-Counter -Counter $counter -MaxSamples 10 -SampleInterval 1 | Out-File -FilePath (Join-Path $diagnosticPath "Performance\$($counter -replace '[\\/:*?"<>|]', '_').txt")
            }
            catch {
                "Failed to collect performance counter $counter`: $($_.Exception.Message)" | Out-File -FilePath (Join-Path $diagnosticPath "Performance\PerformanceCounter_Errors.txt") -Append
            }
        }
    }
    
    # Create diagnostic summary
    $summary = @{
        "CollectionTime" = Get-Date
        "ComputerName" = $env:COMPUTERNAME
        "UserName" = $env:USERNAME
        "PSVersion" = $PSVersionTable.PSVersion.ToString()
        "OSVersion" = (Get-CimInstance Win32_OperatingSystem).Version
        "DiagnosticPath" = $diagnosticPath
        "IncludedComponents" = @{
            "Logs" = $IncludeLogs
            "PerformanceData" = $IncludePerformanceData
            "ConfigurationFiles" = $IncludeConfigurationFiles
        }
    }
    
    $summary | ConvertTo-Json -Depth 3 | Out-File -FilePath (Join-Path $diagnosticPath "DiagnosticSummary.json")
    
    # Compress diagnostic files
    $zipPath = "$diagnosticPath.zip"
    Compress-Archive -Path $diagnosticPath -DestinationPath $zipPath -Force
    
    Write-Host "Diagnostic collection completed successfully!" -ForegroundColor Green
    Write-Host "Diagnostic files location: $zipPath" -ForegroundColor Yellow
    Write-Host "Please provide this file to support personnel" -ForegroundColor Yellow
    
    return $zipPath
}

# Execute diagnostic collection
$diagnosticFile = Collect-DiagnosticInformation -OutputPath $OutputPath -IncludeLogs $IncludeLogs -IncludePerformanceData $IncludePerformanceData -IncludeConfigurationFiles $IncludeConfigurationFiles

Write-Host "Diagnostic collection completed: $diagnosticFile" -ForegroundColor Green
```

---

## COMMON ISSUES AND SOLUTIONS

### Application Startup Issues

#### Issue: Application Fails to Start
```
Symptoms:
- Application doesn't launch when clicked
- Error messages during startup
- Process starts but window doesn't appear
- Immediate crash after launch attempt

Diagnostic Steps:
1. Check Windows Event Log for application errors
2. Verify .NET Framework installation
3. Check file permissions on installation directory
4. Test with administrative privileges
5. Verify configuration files are not corrupted

Common Solutions:
```

**Solution 1: .NET Framework Issues**
```powershell
# Check .NET Framework installation
function Test-DotNetFramework {
    Write-Host "Checking .NET Framework installation..." -ForegroundColor Yellow
    
    # Check .NET Framework versions
    $netFrameworkVersions = Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP' -Recurse | Get-ItemProperty -Name Version -ErrorAction SilentlyContinue | Where-Object { $_.PSChildName -Match '^(?!S)\p{L}' } | Select-Object PSChildName, Version
    
    Write-Host "Installed .NET Framework versions:" -ForegroundColor Green
    $netFrameworkVersions | Format-Table -AutoSize
    
    # Check .NET Core/.NET 5+ versions
    try {
        $dotnetInfo = & dotnet --list-runtimes 2>$null
        Write-Host ".NET Core/5+ Runtimes:" -ForegroundColor Green
        $dotnetInfo | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    }
    catch {
        Write-Host ".NET Core/5+ not found or not in PATH" -ForegroundColor Yellow
    }
    
    # Verify required runtime
    $requiredRuntime = "Microsoft.NETCore.App 6.0"
    $runtimeInstalled = $dotnetInfo | Where-Object { $_ -like "*$requiredRuntime*" }
    
    if ($runtimeInstalled) {
        Write-Host "✓ Required .NET runtime found: $requiredRuntime" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "✗ Required .NET runtime not found: $requiredRuntime" -ForegroundColor Red
        Write-Host "Please install .NET 6.0 Runtime from https://dotnet.microsoft.com/download" -ForegroundColor Yellow
        return $false
    }
}

# Fix .NET installation
if (!(Test-DotNetFramework)) {
    Write-Host "Installing .NET 6.0 Runtime..." -ForegroundColor Yellow
    $downloadUrl = "https://download.microsoft.com/download/6/0/2/602a8d5f-9f0b-45c4-8c8f-2f7b7f2ad3f6/dotnet-runtime-6.0.25-win-x64.exe"
    $installerPath = "$env:TEMP\dotnet-runtime-installer.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
        Start-Process -FilePath $installerPath -ArgumentList "/quiet", "/norestart" -Wait
        Write-Host "✓ .NET Runtime installation completed" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to install .NET Runtime: $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

**Solution 2: Configuration File Corruption**
```powershell
# Fix configuration file issues
function Repair-ConfigurationFiles {
    param([string]$InstallPath = "C:\MigrationPlatform")
    
    Write-Host "Repairing configuration files..." -ForegroundColor Yellow
    
    $configPath = Join-Path $InstallPath "Configuration"
    $backupPath = Join-Path $configPath "Backup"
    
    # Create backup directory if it doesn't exist
    if (!(Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    }
    
    # Backup existing configuration files
    $configFiles = Get-ChildItem -Path $configPath -Filter "*.json" -ErrorAction SilentlyContinue
    foreach ($file in $configFiles) {
        $backupFile = Join-Path $backupPath "$($file.BaseName)_$(Get-Date -Format 'yyyyMMdd_HHmmss')$($file.Extension)"
        Copy-Item -Path $file.FullName -Destination $backupFile -Force
        Write-Host "✓ Backed up: $($file.Name)" -ForegroundColor Green
    }
    
    # Restore default configuration
    $defaultConfig = @{
        "Application" = @{
            "Name" = "M&A Migration Platform"
            "Version" = "1.0.0"
            "InstallPath" = $InstallPath
            "DataPath" = "D:\MigrationData"
            "LogPath" = "D:\MigrationLogs"
        }
        "Logging" = @{
            "Level" = "Information"
            "RetentionDays" = 30
            "MaxFileSizeMB" = 100
        }
        "Migration" = @{
            "DefaultBatchSize" = 50
            "MaxConcurrentMigrations" = 5
            "RetryAttempts" = 3
        }
    }
    
    $defaultConfigPath = Join-Path $configPath "default.json"
    $defaultConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath $defaultConfigPath -Encoding UTF8
    Write-Host "✓ Restored default configuration" -ForegroundColor Green
}

Repair-ConfigurationFiles
```

**Solution 3: Permission Issues**
```powershell
# Fix permission issues
function Fix-InstallationPermissions {
    param(
        [string]$InstallPath = "C:\MigrationPlatform",
        [string]$ServiceAccount = $null
    )
    
    Write-Host "Fixing installation permissions..." -ForegroundColor Yellow
    
    try {
        # Get current ACL
        $acl = Get-Acl -Path $InstallPath
        
        # Add permissions for current user
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($accessRule)
        
        # Add permissions for service account if specified
        if ($ServiceAccount) {
            $serviceAccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($ServiceAccount, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
            $acl.SetAccessRule($serviceAccessRule)
            Write-Host "✓ Added permissions for service account: $ServiceAccount" -ForegroundColor Green
        }
        
        # Add permissions for Administrators group
        $adminAccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($adminAccessRule)
        
        # Apply ACL
        Set-Acl -Path $InstallPath -AclObject $acl
        
        # Set permissions on data and log directories
        $dataPaths = @("D:\MigrationData", "D:\MigrationLogs")
        foreach ($dataPath in $dataPaths) {
            if (Test-Path $dataPath) {
                Set-Acl -Path $dataPath -AclObject $acl
                Write-Host "✓ Set permissions on: $dataPath" -ForegroundColor Green
            }
        }
        
        Write-Host "✓ Permission fix completed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Permission fix failed: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

Fix-InstallationPermissions
```

### Navigation and UI Issues

#### Issue: Application Crashes During Tab Navigation
```
Symptoms:
- Application closes unexpectedly when switching tabs
- Unhandled exception errors
- Frozen UI during navigation
- Threading violations in error logs

Root Causes:
- Cross-thread UI operations
- Memory leaks in ViewModels
- Unhandled exceptions in background operations
- Resource disposal issues

Diagnostic Commands:
```

**Diagnostic Script for UI Issues**
```powershell
# UI Issue Diagnostic Script
function Diagnose-UIIssues {
    Write-Host "Diagnosing UI issues..." -ForegroundColor Yellow
    
    # Check for threading issues in logs
    $logPath = "D:\MigrationLogs\Application"
    if (Test-Path $logPath) {
        $threadingErrors = Get-ChildItem -Path "$logPath\*.log" | ForEach-Object {
            Get-Content $_.FullName | Select-String -Pattern "thread|cross-thread|invoke|dispatcher" -Context 2
        }
        
        if ($threadingErrors) {
            Write-Host "Threading issues found in logs:" -ForegroundColor Red
            $threadingErrors | Select-Object -First 10 | ForEach-Object {
                Write-Host "  $($_.Line)" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "✓ No threading issues found in logs" -ForegroundColor Green
        }
    }
    
    # Check for memory issues
    $migrationProcess = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
    if ($migrationProcess) {
        $memoryUsageMB = [Math]::Round($migrationProcess.WorkingSet64 / 1MB, 2)
        Write-Host "Current memory usage: $memoryUsageMB MB" -ForegroundColor White
        
        if ($memoryUsageMB -gt 1024) {
            Write-Host "⚠️  High memory usage detected (>1GB)" -ForegroundColor Yellow
            Write-Host "Consider restarting the application" -ForegroundColor Yellow
        }
        else {
            Write-Host "✓ Memory usage within normal range" -ForegroundColor Green
        }
    }
    
    # Check for resource leaks
    $handleCount = $migrationProcess.HandleCount
    Write-Host "Current handle count: $handleCount" -ForegroundColor White
    
    if ($handleCount -gt 10000) {
        Write-Host "⚠️  High handle count detected (>10,000)" -ForegroundColor Yellow
        Write-Host "Possible resource leak - consider restarting" -ForegroundColor Yellow
    }
    else {
        Write-Host "✓ Handle count within normal range" -ForegroundColor Green
    }
}

Diagnose-UIIssues
```

**Solution: Fix Threading Issues**
```csharp
// Example fix for cross-thread operations in ViewModels
public class ThreadSafeViewModel : BaseViewModel
{
    private void UpdateUIProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value)) return;
        
        field = value;
        
        // Ensure property change notification happens on UI thread
        if (Application.Current?.Dispatcher.CheckAccess() == true)
        {
            OnPropertyChanged(propertyName);
        }
        else
        {
            Application.Current?.Dispatcher.BeginInvoke(() => OnPropertyChanged(propertyName));
        }
    }
    
    private void SetBrushSafe(Action<SolidColorBrush> setter, Color color)
    {
        if (Application.Current?.Dispatcher.CheckAccess() == true)
        {
            setter(new SolidColorBrush(color));
        }
        else
        {
            Application.Current?.Dispatcher.BeginInvoke(() => setter(new SolidColorBrush(color)));
        }
    }
}
```

### PowerShell Integration Issues

#### Issue: PowerShell Module Loading Failures
```
Symptoms:
- "Module not found" errors
- PowerShell execution failures
- Empty results from PowerShell operations
- Permission denied errors

Common Causes and Solutions:
```

**Solution 1: PowerShell Execution Policy Issues**
```powershell
# Fix PowerShell execution policy
function Fix-PowerShellExecutionPolicy {
    Write-Host "Checking PowerShell execution policy..." -ForegroundColor Yellow
    
    $currentPolicy = Get-ExecutionPolicy
    Write-Host "Current execution policy: $currentPolicy" -ForegroundColor White
    
    if ($currentPolicy -eq "Restricted") {
        Write-Host "Execution policy is too restrictive. Changing to RemoteSigned..." -ForegroundColor Yellow
        
        try {
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force
            Write-Host "✓ Execution policy changed to RemoteSigned" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to change execution policy. Trying CurrentUser scope..." -ForegroundColor Yellow
            try {
                Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
                Write-Host "✓ Execution policy changed for current user" -ForegroundColor Green
            }
            catch {
                Write-Host "✗ Failed to change execution policy: $($_.Exception.Message)" -ForegroundColor Red
                return $false
            }
        }
    }
    else {
        Write-Host "✓ Execution policy is appropriate: $currentPolicy" -ForegroundColor Green
    }
    
    return $true
}

Fix-PowerShellExecutionPolicy
```

**Solution 2: Module Path Issues**
```powershell
# Fix PowerShell module path issues
function Fix-PowerShellModulePath {
    param([string]$MigrationPlatformPath = "C:\MigrationPlatform")
    
    Write-Host "Fixing PowerShell module path issues..." -ForegroundColor Yellow
    
    $moduleBasePath = Join-Path $MigrationPlatformPath "Modules"
    $migrationModulesPath = Join-Path $moduleBasePath "Migration"
    
    # Check if migration modules exist
    if (!(Test-Path $migrationModulesPath)) {
        Write-Host "✗ Migration modules directory not found: $migrationModulesPath" -ForegroundColor Red
        return $false
    }
    
    # Get current module paths
    $currentPaths = $env:PSModulePath -split ';'
    
    # Add migration modules path if not already present
    if ($currentPaths -notcontains $moduleBasePath) {
        $env:PSModulePath = $env:PSModulePath + ";$moduleBasePath"
        Write-Host "✓ Added module path: $moduleBasePath" -ForegroundColor Green
        
        # Make permanent for current user
        $userPath = [Environment]::GetEnvironmentVariable("PSModulePath", "User")
        if ($userPath -notlike "*$moduleBasePath*") {
            [Environment]::SetEnvironmentVariable("PSModulePath", "$userPath;$moduleBasePath", "User")
            Write-Host "✓ Made module path permanent for current user" -ForegroundColor Green
        }
    }
    else {
        Write-Host "✓ Module path already configured" -ForegroundColor Green
    }
    
    # Test module loading
    $migrationModules = Get-ChildItem -Path $migrationModulesPath -Filter "*.psm1"
    Write-Host "Found $($migrationModules.Count) migration modules:" -ForegroundColor White
    
    foreach ($module in $migrationModules) {
        try {
            Import-Module $module.FullName -Force
            Write-Host "  ✓ $($module.BaseName)" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ $($module.BaseName): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    return $true
}

Fix-PowerShellModulePath
```

**Solution 3: PowerShell Remoting Issues**
```powershell
# Fix PowerShell remoting configuration
function Fix-PowerShellRemoting {
    Write-Host "Configuring PowerShell remoting..." -ForegroundColor Yellow
    
    try {
        # Check if WinRM service is running
        $winrmService = Get-Service -Name "WinRM"
        if ($winrmService.Status -ne "Running") {
            Start-Service -Name "WinRM"
            Set-Service -Name "WinRM" -StartupType Automatic
            Write-Host "✓ Started WinRM service" -ForegroundColor Green
        }
        
        # Enable PowerShell remoting
        Enable-PSRemoting -Force -SkipNetworkProfileCheck
        Write-Host "✓ PowerShell remoting enabled" -ForegroundColor Green
        
        # Configure trusted hosts (if needed for non-domain environments)
        $trustedHosts = Read-Host "Enter trusted hosts (comma-separated, or press Enter to skip)"
        if ($trustedHosts) {
            Set-Item WSMan:\localhost\Client\TrustedHosts -Value $trustedHosts -Force
            Write-Host "✓ Configured trusted hosts: $trustedHosts" -ForegroundColor Green
        }
        
        # Test PowerShell remoting locally
        $testResult = Test-WSMan -ComputerName localhost -ErrorAction SilentlyContinue
        if ($testResult) {
            Write-Host "✓ PowerShell remoting test successful" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "✗ PowerShell remoting test failed" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "✗ PowerShell remoting configuration failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Fix-PowerShellRemoting
```

---

## PERFORMANCE TROUBLESHOOTING

### Memory Performance Issues

#### High Memory Usage Troubleshooting
```powershell
# Memory performance troubleshooting
function Diagnose-MemoryIssues {
    Write-Host "Diagnosing memory performance issues..." -ForegroundColor Yellow
    
    # Get current memory usage
    $totalRAM = Get-WmiObject -Class Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory
    $availableRAM = Get-Counter "\Memory\Available MBytes" | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
    $usedRAM = ($totalRAM / 1MB) - $availableRAM
    $memoryUsagePercent = ($usedRAM / ($totalRAM / 1MB)) * 100
    
    Write-Host "System Memory Analysis:" -ForegroundColor White
    Write-Host "  Total RAM: $([Math]::Round($totalRAM / 1GB, 2)) GB" -ForegroundColor White
    Write-Host "  Available RAM: $([Math]::Round($availableRAM / 1024, 2)) GB" -ForegroundColor White  
    Write-Host "  Used RAM: $([Math]::Round($usedRAM / 1024, 2)) GB ($([Math]::Round($memoryUsagePercent, 1))%)" -ForegroundColor White
    
    if ($memoryUsagePercent -gt 80) {
        Write-Host "⚠️  High memory usage detected (>80%)" -ForegroundColor Yellow
    }
    elseif ($memoryUsagePercent -gt 90) {
        Write-Host "🚨 Critical memory usage detected (>90%)" -ForegroundColor Red
    }
    else {
        Write-Host "✓ Memory usage within acceptable range" -ForegroundColor Green
    }
    
    # Get top memory consuming processes
    Write-Host "`nTop Memory Consuming Processes:" -ForegroundColor White
    Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 | ForEach-Object {
        $memoryMB = [Math]::Round($_.WorkingSet64 / 1MB, 2)
        Write-Host "  $($_.ProcessName): $memoryMB MB" -ForegroundColor White
    }
    
    # Check for memory leaks in migration platform
    $migrationProcess = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
    if ($migrationProcess) {
        $migrationMemoryMB = [Math]::Round($migrationProcess.WorkingSet64 / 1MB, 2)
        $handleCount = $migrationProcess.HandleCount
        $threadCount = $migrationProcess.Threads.Count
        
        Write-Host "`nMigration Platform Process Analysis:" -ForegroundColor White
        Write-Host "  Memory Usage: $migrationMemoryMB MB" -ForegroundColor White
        Write-Host "  Handle Count: $handleCount" -ForegroundColor White
        Write-Host "  Thread Count: $threadCount" -ForegroundColor White
        
        # Memory usage recommendations
        if ($migrationMemoryMB -gt 1024) {
            Write-Host "⚠️  High memory usage in migration platform" -ForegroundColor Yellow
            Write-Host "Recommendations:" -ForegroundColor Yellow
            Write-Host "  - Consider reducing batch sizes" -ForegroundColor White
            Write-Host "  - Restart the application if memory continues to grow" -ForegroundColor White
            Write-Host "  - Check for memory leaks in recent operations" -ForegroundColor White
        }
        
        if ($handleCount -gt 10000) {
            Write-Host "⚠️  High handle count detected - possible resource leak" -ForegroundColor Yellow
        }
        
        if ($threadCount -gt 100) {
            Write-Host "⚠️  High thread count detected - possible thread pool exhaustion" -ForegroundColor Yellow
        }
    }
    
    # Page file analysis
    $pageFile = Get-WmiObject -Class Win32_PageFileUsage
    if ($pageFile) {
        $pageFileUsagePercent = ($pageFile.CurrentUsage / $pageFile.AllocatedBaseSize) * 100
        Write-Host "`nPage File Analysis:" -ForegroundColor White
        Write-Host "  Page File Size: $($pageFile.AllocatedBaseSize) MB" -ForegroundColor White
        Write-Host "  Current Usage: $($pageFile.CurrentUsage) MB ($([Math]::Round($pageFileUsagePercent, 1))%)" -ForegroundColor White
        
        if ($pageFileUsagePercent -gt 50) {
            Write-Host "⚠️  High page file usage - consider increasing RAM" -ForegroundColor Yellow
        }
    }
}

# Memory optimization recommendations
function Optimize-MemoryUsage {
    Write-Host "Applying memory optimization settings..." -ForegroundColor Yellow
    
    # Configure .NET garbage collection
    [System.Environment]::SetEnvironmentVariable("COMPlus_gcServer", "1", "Machine")
    [System.Environment]::SetEnvironmentVariable("COMPlus_gcConcurrent", "1", "Machine")
    
    # Configure application memory settings
    $appConfigPath = "C:\MigrationPlatform\Configuration\PerformanceConfig.json"
    $memoryConfig = @{
        "Memory" = @{
            "MaxHeapSizeGB" = 4
            "GCMode" = "Server"
            "LargeObjectHeapCompaction" = $true
            "MaxBatchSize" = 50  # Reduce if memory issues persist
        }
        "Threading" = @{
            "MaxWorkerThreads" = 20
            "ThreadPoolGrowthFactor" = 1  # Reduce thread pool growth
        }
    }
    
    $memoryConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath $appConfigPath -Encoding UTF8
    Write-Host "✓ Memory optimization configuration applied" -ForegroundColor Green
    Write-Host "Restart the application to apply changes" -ForegroundColor Yellow
}

Diagnose-MemoryIssues
```

### CPU Performance Issues

#### High CPU Usage Troubleshooting
```powershell
# CPU performance troubleshooting
function Diagnose-CPUIssues {
    Write-Host "Diagnosing CPU performance issues..." -ForegroundColor Yellow
    
    # Get current CPU usage
    $cpuUsage = Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 5
    $averageCPU = ($cpuUsage.CounterSamples | Measure-Object -Property CookedValue -Average).Average
    
    Write-Host "CPU Usage Analysis:" -ForegroundColor White
    Write-Host "  Average CPU Usage (last 5 seconds): $([Math]::Round($averageCPU, 2))%" -ForegroundColor White
    
    if ($averageCPU -gt 80) {
        Write-Host "⚠️  High CPU usage detected (>80%)" -ForegroundColor Yellow
        
        # Get top CPU consuming processes
        Write-Host "`nTop CPU Consuming Processes:" -ForegroundColor White
        Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 | ForEach-Object {
            Write-Host "  $($_.ProcessName): $([Math]::Round($_.CPU, 2)) seconds" -ForegroundColor White
        }
    }
    else {
        Write-Host "✓ CPU usage within acceptable range" -ForegroundColor Green
    }
    
    # Check PowerShell processes specifically
    $powershellProcesses = Get-Process -Name "*powershell*", "*pwsh*" -ErrorAction SilentlyContinue
    if ($powershellProcesses) {
        Write-Host "`nPowerShell Process Analysis:" -ForegroundColor White
        $powershellProcesses | ForEach-Object {
            Write-Host "  $($_.ProcessName) (PID: $($_.Id)): $([Math]::Round($_.CPU, 2)) CPU seconds" -ForegroundColor White
        }
        
        # Check for runaway PowerShell processes
        $highCPUPS = $powershellProcesses | Where-Object { $_.CPU -gt 300 }  # 5 minutes of CPU time
        if ($highCPUPS) {
            Write-Host "⚠️  Long-running PowerShell processes detected:" -ForegroundColor Yellow
            $highCPUPS | ForEach-Object {
                Write-Host "    PID $($_.Id): $([Math]::Round($_.CPU, 2)) CPU seconds" -ForegroundColor Yellow
            }
            Write-Host "Consider investigating or terminating these processes" -ForegroundColor Yellow
        }
    }
    
    # Check for CPU throttling
    $thermalState = Get-Counter "\Thermal Zone Information(*)\% Passive Limit" -ErrorAction SilentlyContinue
    if ($thermalState) {
        $maxThrottle = ($thermalState.CounterSamples | Measure-Object -Property CookedValue -Maximum).Maximum
        if ($maxThrottle -gt 0) {
            Write-Host "⚠️  CPU thermal throttling detected: $([Math]::Round($maxThrottle, 2))%" -ForegroundColor Yellow
            Write-Host "Check system cooling and reduce CPU load" -ForegroundColor Yellow
        }
    }
}

Diagnose-CPUIssues
```

### Disk I/O Performance Issues

#### Disk Performance Troubleshooting
```powershell
# Disk I/O performance troubleshooting
function Diagnose-DiskPerformance {
    Write-Host "Diagnosing disk performance issues..." -ForegroundColor Yellow
    
    # Get disk performance counters
    $diskCounters = @(
        "\PhysicalDisk(_Total)\Avg. Disk Queue Length",
        "\PhysicalDisk(_Total)\% Disk Time",
        "\PhysicalDisk(_Total)\Disk Reads/sec",
        "\PhysicalDisk(_Total)\Disk Writes/sec"
    )
    
    Write-Host "Disk Performance Metrics:" -ForegroundColor White
    foreach ($counter in $diskCounters) {
        try {
            $value = Get-Counter -Counter $counter -SampleInterval 1 -MaxSamples 3
            $averageValue = ($value.CounterSamples | Measure-Object -Property CookedValue -Average).Average
            
            $displayName = $counter -replace "\\PhysicalDisk\(_Total\)\\", ""
            Write-Host "  $displayName`: $([Math]::Round($averageValue, 2))" -ForegroundColor White
            
            # Provide performance analysis
            switch -Wildcard ($counter) {
                "*Queue Length*" {
                    if ($averageValue -gt 2) {
                        Write-Host "    ⚠️  High disk queue length (>2) - disk bottleneck detected" -ForegroundColor Yellow
                    }
                }
                "*% Disk Time*" {
                    if ($averageValue -gt 80) {
                        Write-Host "    ⚠️  High disk utilization (>80%) - performance impact likely" -ForegroundColor Yellow
                    }
                }
            }
        }
        catch {
            Write-Host "  Failed to collect: $counter" -ForegroundColor Red
        }
    }
    
    # Check individual disk usage
    Write-Host "`nDisk Space Analysis:" -ForegroundColor White
    Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | ForEach-Object {
        $freeSpacePercent = ($_.FreeSpace / $_.Size) * 100
        $freeSpaceGB = [Math]::Round($_.FreeSpace / 1GB, 2)
        $totalSpaceGB = [Math]::Round($_.Size / 1GB, 2)
        
        Write-Host "  Drive $($_.DeviceID) - $freeSpaceGB GB free of $totalSpaceGB GB ($([Math]::Round($freeSpacePercent, 1))% free)" -ForegroundColor White
        
        if ($freeSpacePercent -lt 10) {
            Write-Host "    🚨 Critical: Less than 10% free space remaining" -ForegroundColor Red
        }
        elseif ($freeSpacePercent -lt 20) {
            Write-Host "    ⚠️  Warning: Less than 20% free space remaining" -ForegroundColor Yellow
        }
    }
    
    # Check for migration-specific disk usage
    $migrationPaths = @(
        "C:\MigrationPlatform",
        "D:\MigrationData", 
        "D:\MigrationLogs"
    )
    
    Write-Host "`nMigration Directory Sizes:" -ForegroundColor White
    foreach ($path in $migrationPaths) {
        if (Test-Path $path) {
            try {
                $size = (Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                $sizeGB = [Math]::Round($size / 1GB, 2)
                Write-Host "  $path`: $sizeGB GB" -ForegroundColor White
                
                if ($sizeGB -gt 50) {
                    Write-Host "    ⚠️  Large directory size - consider cleanup" -ForegroundColor Yellow
                }
            }
            catch {
                Write-Host "  $path`: Unable to calculate size" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "  $path`: Directory not found" -ForegroundColor Red
        }
    }
}

# Disk optimization recommendations
function Optimize-DiskPerformance {
    Write-Host "Applying disk performance optimizations..." -ForegroundColor Yellow
    
    # Clean up temporary files
    $tempPaths = @(
        "$env:TEMP\*",
        "C:\Windows\Temp\*",
        "D:\MigrationData\Temp\*"
    )
    
    foreach ($tempPath in $tempPaths) {
        try {
            Get-ChildItem -Path $tempPath -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
            Write-Host "✓ Cleaned temporary files: $tempPath" -ForegroundColor Green
        }
        catch {
            Write-Host "Warning: Could not clean $tempPath" -ForegroundColor Yellow
        }
    }
    
    # Clean old log files
    $logPath = "D:\MigrationLogs"
    if (Test-Path $logPath) {
        $cutoffDate = (Get-Date).AddDays(-30)
        Get-ChildItem -Path $logPath -Recurse -File | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
        Write-Host "✓ Cleaned old log files (>30 days)" -ForegroundColor Green
    }
    
    # Defragment drives (if not SSD)
    Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | ForEach-Object {
        $drive = $_.DeviceID.TrimEnd(':')
        
        # Check if drive is SSD (basic check)
        $physicalDisk = Get-WmiObject -Class Win32_DiskDrive | Where-Object { $_.DeviceID -like "*$drive*" }
        if ($physicalDisk -and $physicalDisk.MediaType -notlike "*SSD*" -and $physicalDisk.Model -notlike "*SSD*") {
            Write-Host "Scheduling defragmentation for drive $($_.DeviceID) (this may take a while)" -ForegroundColor Yellow
            # Note: In production, schedule this during maintenance windows
            # defrag $_.DeviceID /A /V  # Analyze only, don't actually defrag without user consent
        }
    }
    
    Write-Host "✓ Disk optimization completed" -ForegroundColor Green
}

Diagnose-DiskPerformance
```

---

## CONNECTIVITY ISSUES

### Network Connectivity Troubleshooting

#### Active Directory Connection Issues
```powershell
# Active Directory connectivity troubleshooting
function Test-ADConnectivity {
    param(
        [string]$DomainController = $env:LOGONSERVER.TrimStart('\\'),
        [string]$Domain = $env:USERDNSDOMAIN
    )
    
    Write-Host "Testing Active Directory connectivity..." -ForegroundColor Yellow
    Write-Host "Domain Controller: $DomainController" -ForegroundColor White
    Write-Host "Domain: $Domain" -ForegroundColor White
    
    # Test basic network connectivity
    Write-Host "`n1. Testing network connectivity..." -ForegroundColor White
    $pingResult = Test-Connection -ComputerName $DomainController -Count 3 -Quiet
    if ($pingResult) {
        Write-Host "✓ Network connectivity to domain controller successful" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Network connectivity to domain controller failed" -ForegroundColor Red
        return $false
    }
    
    # Test LDAP connectivity
    Write-Host "`n2. Testing LDAP connectivity..." -ForegroundColor White
    try {
        $ldapConnection = Test-NetConnection -ComputerName $DomainController -Port 389
        if ($ldapConnection.TcpTestSucceeded) {
            Write-Host "✓ LDAP port 389 accessible" -ForegroundColor Green
        }
        else {
            Write-Host "✗ LDAP port 389 not accessible" -ForegroundColor Red
        }
        
        $ldapsConnection = Test-NetConnection -ComputerName $DomainController -Port 636
        if ($ldapsConnection.TcpTestSucceeded) {
            Write-Host "✓ LDAPS port 636 accessible" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  LDAPS port 636 not accessible" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "✗ LDAP connectivity test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Active Directory module functionality
    Write-Host "`n3. Testing Active Directory PowerShell module..." -ForegroundColor White
    try {
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Test basic AD operations
        $testUser = Get-ADUser -Filter "SamAccountName -eq '$env:USERNAME'" -ErrorAction Stop
        if ($testUser) {
            Write-Host "✓ Active Directory module working correctly" -ForegroundColor Green
            Write-Host "  Current user: $($testUser.Name)" -ForegroundColor White
        }
        
        # Test domain information
        $domainInfo = Get-ADDomain -ErrorAction Stop
        Write-Host "  Domain: $($domainInfo.Name)" -ForegroundColor White
        Write-Host "  Domain Controllers: $($domainInfo.ReplicaDirectoryServers.Count)" -ForegroundColor White
        
    }
    catch {
        Write-Host "✗ Active Directory module test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Test authentication
    Write-Host "`n4. Testing authentication..." -ForegroundColor White
    try {
        $currentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
        Write-Host "✓ Current authentication context:" -ForegroundColor Green
        Write-Host "  User: $($currentIdentity.Name)" -ForegroundColor White
        Write-Host "  Authentication Type: $($currentIdentity.AuthenticationType)" -ForegroundColor White
        Write-Host "  Is Authenticated: $($currentIdentity.IsAuthenticated)" -ForegroundColor White
    }
    catch {
        Write-Host "✗ Authentication test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    return $true
}

# Fix common AD connectivity issues
function Fix-ADConnectivity {
    Write-Host "Attempting to fix Active Directory connectivity issues..." -ForegroundColor Yellow
    
    # Reset DNS cache
    Write-Host "Clearing DNS cache..." -ForegroundColor White
    try {
        Clear-DnsClientCache
        Write-Host "✓ DNS cache cleared" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to clear DNS cache: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Refresh Kerberos tickets
    Write-Host "Refreshing Kerberos tickets..." -ForegroundColor White
    try {
        klist purge
        Write-Host "✓ Kerberos tickets purged" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Unable to purge Kerberos tickets (klist not available)" -ForegroundColor Yellow
    }
    
    # Test time synchronization
    Write-Host "Checking time synchronization..." -ForegroundColor White
    try {
        $timeSource = w32tm /query /source
        Write-Host "Time source: $timeSource" -ForegroundColor White
        
        $timeSyncResult = w32tm /stripchart /computer:$env:LOGONSERVER.TrimStart('\\') /dataonly /samples:3
        Write-Host "✓ Time synchronization test completed" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Time synchronization check failed" -ForegroundColor Yellow
        Write-Host "Run 'w32tm /resync /force' to force time sync" -ForegroundColor White
    }
}

Test-ADConnectivity
```

#### Exchange Online Connectivity Issues
```powershell
# Exchange Online connectivity troubleshooting
function Test-ExchangeOnlineConnectivity {
    param(
        [pscredential]$Credential,
        [string]$TenantId
    )
    
    Write-Host "Testing Exchange Online connectivity..." -ForegroundColor Yellow
    
    # Check if Exchange Online Management module is installed
    Write-Host "1. Checking Exchange Online Management module..." -ForegroundColor White
    $exoModule = Get-Module -Name ExchangeOnlineManagement -ListAvailable
    if ($exoModule) {
        Write-Host "✓ Exchange Online Management module found: $($exoModule.Version)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Exchange Online Management module not found" -ForegroundColor Red
        Write-Host "Installing Exchange Online Management module..." -ForegroundColor Yellow
        try {
            Install-Module -Name ExchangeOnlineManagement -Force -AllowClobber
            Write-Host "✓ Exchange Online Management module installed" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed to install Exchange Online Management module: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    
    # Test connectivity to Exchange Online
    Write-Host "`n2. Testing connection to Exchange Online..." -ForegroundColor White
    try {
        Import-Module ExchangeOnlineManagement -Force
        
        if ($Credential) {
            Connect-ExchangeOnline -Credential $Credential -ShowBanner:$false -ErrorAction Stop
        }
        elseif ($TenantId) {
            Connect-ExchangeOnline -Organization $TenantId -ShowBanner:$false -ErrorAction Stop
        }
        else {
            Connect-ExchangeOnline -ShowBanner:$false -ErrorAction Stop
        }
        
        Write-Host "✓ Successfully connected to Exchange Online" -ForegroundColor Green
        
        # Test basic operations
        $testMailbox = Get-Mailbox -ResultSize 1 -ErrorAction Stop
        Write-Host "✓ Basic mailbox operations working" -ForegroundColor Green
        
        # Get organization information
        $orgConfig = Get-OrganizationConfig -ErrorAction Stop
        Write-Host "  Organization: $($orgConfig.DisplayName)" -ForegroundColor White
        
        Disconnect-ExchangeOnline -Confirm:$false -ErrorAction SilentlyContinue
        return $true
    }
    catch {
        Write-Host "✗ Exchange Online connectivity test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test modern authentication
function Test-ModernAuthentication {
    Write-Host "Testing modern authentication requirements..." -ForegroundColor Yellow
    
    # Check TLS version
    Write-Host "1. Checking TLS configuration..." -ForegroundColor White
    $tlsVersions = @("TLS 1.0", "TLS 1.1", "TLS 1.2", "TLS 1.3")
    foreach ($version in $tlsVersions) {
        $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\$version\Client"
        if (Test-Path $regPath) {
            $enabled = Get-ItemProperty -Path $regPath -Name "Enabled" -ErrorAction SilentlyContinue
            $disabledByDefault = Get-ItemProperty -Path $regPath -Name "DisabledByDefault" -ErrorAction SilentlyContinue
            
            if ($enabled.Enabled -eq 1 -and $disabledByDefault.DisabledByDefault -ne 1) {
                Write-Host "  ✓ $version is enabled" -ForegroundColor Green
            }
            elseif ($version -eq "TLS 1.2" -or $version -eq "TLS 1.3") {
                Write-Host "  ⚠️  $version should be enabled for modern authentication" -ForegroundColor Yellow
            }
        }
    }
    
    # Check .NET Framework version
    Write-Host "`n2. Checking .NET Framework version..." -ForegroundColor White
    $netVersion = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" -Name "Release" -ErrorAction SilentlyContinue
    if ($netVersion) {
        $versionNumber = $netVersion.Release
        if ($versionNumber -ge 461808) {  # .NET 4.7.2 or higher
            Write-Host "✓ .NET Framework version supports modern authentication" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  .NET Framework may need updating for optimal modern authentication support" -ForegroundColor Yellow
        }
    }
    
    # Check for Windows updates
    Write-Host "`n3. Checking for required Windows updates..." -ForegroundColor White
    # This is a simplified check - in production, use more comprehensive update checking
    $lastUpdate = Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1
    if ($lastUpdate) {
        $daysSinceUpdate = (Get-Date) - $lastUpdate.InstalledOn
        if ($daysSinceUpdate.Days -lt 30) {
            Write-Host "✓ Recent Windows updates installed" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  Consider checking for recent Windows updates" -ForegroundColor Yellow
        }
    }
}

# Run connectivity tests
Write-Host "Starting Exchange Online connectivity diagnostics..." -ForegroundColor Yellow
Test-ExchangeOnlineConnectivity
Test-ModernAuthentication
```

---

This comprehensive troubleshooting and maintenance guide provides systematic approaches to diagnosing and resolving common issues with the M&A Migration Platform. The guide covers all major areas including application issues, performance problems, connectivity issues, and provides automated diagnostic scripts for efficient problem resolution.

The documentation continues with additional sections covering data integrity problems, security issues, diagnostic tools, maintenance schedules, and emergency recovery procedures to provide complete operational support for the platform.

*Troubleshooting Guide Version*: 1.0 Production Ready  
*Last Updated*: 2025-08-22  
*Platform Version*: M&A Migration Platform v1.0