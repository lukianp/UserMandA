# M&A Discovery Suite - Troubleshooting & Support Guide
**Complete Problem Resolution Manual | 24/7 Enterprise Support Reference**

---

## Table of Contents

1. [Emergency Response Procedures](#1-emergency-response-procedures)
2. [System Architecture Diagnostics](#2-system-architecture-diagnostics)
3. [Common Issues & Solutions](#3-common-issues--solutions)
4. [Performance Troubleshooting](#4-performance-troubleshooting)
5. [Migration Failure Recovery](#5-migration-failure-recovery)
6. [Security & Authentication Issues](#6-security--authentication-issues)
7. [Data Quality & Validation Problems](#7-data-quality--validation-problems)
8. [Integration & Connectivity Issues](#8-integration--connectivity-issues)
9. [Diagnostic Tools & Utilities](#9-diagnostic-tools--utilities)
10. [Support Escalation Procedures](#10-support-escalation-procedures)

---

## 1. EMERGENCY RESPONSE PROCEDURES

### 1.1 Critical System Failure Response

#### Immediate Response Protocol (0-15 minutes)
```yaml
DEFCON 1 - Complete System Failure:
  Symptoms:
    - Application completely inaccessible
    - Database connectivity lost
    - Multiple service failures
    - Data corruption detected
    
  Immediate Actions:
    1. Activate Emergency Response Team
    2. Stop all active migrations immediately
    3. Isolate affected systems
    4. Begin incident documentation
    5. Notify executive stakeholders
    
  Emergency Team Contacts:
    - Incident Commander: +1-555-EMERGENCY
    - Technical Lead: +1-555-TECH-LEAD
    - Database Administrator: +1-555-DBA-HELP
    - Network Operations: +1-555-NETOPS
    - Business Continuity: +1-555-BUSINESS
```

#### Emergency Shutdown Procedures
```powershell
# Emergency System Shutdown Script
# Run with elevated privileges

param(
    [switch]$Force = $false,
    [string]$Reason = "Emergency shutdown initiated"
)

Write-Host "EMERGENCY SHUTDOWN INITIATED" -ForegroundColor Red
Write-Host "Reason: $Reason" -ForegroundColor Yellow

# 1. Stop all migration processes
Write-Host "Stopping migration services..."
Stop-Service -Name "MandADiscoveryService" -Force
Stop-Service -Name "MandAMigrationEngine" -Force
Stop-Service -Name "MandAPowerShellRunner" -Force

# 2. Stop IIS to prevent new connections
Write-Host "Stopping IIS..."
Stop-Service -Name "W3SVC" -Force

# 3. Close active database connections
Write-Host "Closing database connections..."
Invoke-Sqlcmd -Query "ALTER DATABASE MandADiscovery SET SINGLE_USER WITH ROLLBACK IMMEDIATE"

# 4. Create incident marker
$IncidentFile = "C:\MandAEmergency\Incident_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
New-Item -ItemType Directory -Path (Split-Path $IncidentFile) -Force
"Emergency shutdown at $(Get-Date) - Reason: $Reason" | Out-File $IncidentFile

# 5. Send emergency notification
Send-MailMessage -SmtpServer "smtp.company.com" -From "manda-emergency@company.com" -To "emergency-team@company.com" -Subject "CRITICAL: M&A Discovery Suite Emergency Shutdown" -Body "System emergency shutdown initiated at $(Get-Date). Reason: $Reason. Incident ID: $(Split-Path $IncidentFile -Leaf)"

Write-Host "Emergency shutdown completed. Incident logged: $IncidentFile" -ForegroundColor Green
```

### 1.2 Data Recovery Procedures

#### Point-in-Time Recovery Protocol
```sql
-- Database Recovery Script (SQL Server)
-- Execute in order, with verification between steps

-- Step 1: Assess database state
USE master;
GO

SELECT 
    name,
    state_desc,
    recovery_model_desc,
    log_reuse_wait_desc
FROM sys.databases 
WHERE name = 'MandADiscovery';

-- Step 2: Set database to single user (if accessible)
ALTER DATABASE MandADiscovery SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

-- Step 3: Restore from last known good backup
RESTORE DATABASE MandADiscovery 
FROM DISK = '\\backup-server\MandABackups\MandADiscovery_Full_Latest.bak'
WITH REPLACE, RECOVERY, 
     MOVE 'MandADiscovery_Data' TO 'D:\MSSQL\Data\MandADiscovery.mdf',
     MOVE 'MandADiscovery_Log' TO 'L:\MSSQL\Logs\MandADiscovery.ldf';

-- Step 4: Apply differential backup if available
RESTORE DATABASE MandADiscovery 
FROM DISK = '\\backup-server\MandABackups\MandADiscovery_Diff_Latest.bak'
WITH RECOVERY;

-- Step 5: Apply transaction log backups for point-in-time recovery
RESTORE LOG MandADiscovery 
FROM DISK = '\\backup-server\MandABackups\MandADiscovery_Log_*.trn'
WITH STOPAT = '2025-08-23 14:30:00', RECOVERY;

-- Step 6: Return to multi-user mode
ALTER DATABASE MandADiscovery SET MULTI_USER;

-- Step 7: Verify database integrity
DBCC CHECKDB('MandADiscovery') WITH NO_INFOMSGS;

-- Step 8: Update statistics
EXEC sp_updatestats;
```

#### File System Recovery
```powershell
# File System Recovery Script
param(
    [string]$BackupSource = "\\backup-server\MandAFileBackup",
    [string]$RecoveryTarget = "C:\Program Files\MandADiscoverySuite",
    [datetime]$RecoveryPoint = (Get-Date).AddHours(-1)
)

Write-Host "Starting file system recovery..." -ForegroundColor Yellow

# 1. Stop services to prevent file locks
Write-Host "Stopping services..."
$Services = @("MandADiscoveryService", "W3SVC", "MandAMigrationEngine")
foreach ($Service in $Services) {
    Stop-Service -Name $Service -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped $Service"
}

# 2. Backup current state before recovery
$BackupCurrent = "C:\MandARecovery\PreRecovery_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $BackupCurrent -Force
robocopy $RecoveryTarget $BackupCurrent /E /COPY:DATS

# 3. Find appropriate backup version
$BackupVersions = Get-ChildItem "$BackupSource\*" | Where-Object { $_.LastWriteTime -le $RecoveryPoint } | Sort-Object LastWriteTime -Descending
$SelectedBackup = $BackupVersions[0].FullName
Write-Host "Selected backup: $SelectedBackup"

# 4. Restore files
Write-Host "Restoring files from backup..."
robocopy $SelectedBackup $RecoveryTarget /E /COPY:DATS /R:3 /W:5

# 5. Verify critical files
$CriticalFiles = @(
    "$RecoveryTarget\MandADiscoverySuite.exe",
    "$RecoveryTarget\appsettings.json",
    "$RecoveryTarget\Modules\Migration\UserMigration.psm1"
)

foreach ($File in $CriticalFiles) {
    if (-not (Test-Path $File)) {
        Write-Error "Critical file missing: $File"
        exit 1
    }
}

# 6. Restart services
Write-Host "Restarting services..."
foreach ($Service in $Services) {
    Start-Service -Name $Service -ErrorAction SilentlyContinue
    Write-Host "Started $Service"
}

Write-Host "File system recovery completed successfully" -ForegroundColor Green
```

---

## 2. SYSTEM ARCHITECTURE DIAGNOSTICS

### 2.1 Health Check Scripts

#### Comprehensive System Health Check
```powershell
# M&A Discovery Suite Health Check Script
param(
    [string]$ConfigFile = "C:\Program Files\MandADiscoverySuite\appsettings.json",
    [string]$OutputPath = "C:\MandADiagnostics\HealthCheck_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
)

$HealthResults = @()

function Test-Component {
    param(
        [string]$ComponentName,
        [scriptblock]$TestScript
    )
    
    $StartTime = Get-Date
    try {
        $TestResult = & $TestScript
        $Status = if ($TestResult) { "HEALTHY" } else { "WARNING" }
        $Details = if ($TestResult -is [string]) { $TestResult } else { "Test passed" }
        $StatusColor = if ($Status -eq "HEALTHY") { "Green" } else { "Orange" }
    } catch {
        $Status = "CRITICAL"
        $Details = $_.Exception.Message
        $StatusColor = "Red"
    }
    
    $Duration = ((Get-Date) - $StartTime).TotalSeconds
    
    $Result = [PSCustomObject]@{
        Component = $ComponentName
        Status = $Status
        Details = $Details
        Duration = $Duration
        Timestamp = $StartTime
    }
    
    $HealthResults += $Result
    Write-Host "[$Status] $ComponentName - $Details" -ForegroundColor $StatusColor
    return $Result
}

Write-Host "M&A Discovery Suite - System Health Check" -ForegroundColor Cyan
Write-Host "Started at: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# 1. Application Service Health
Test-Component "Application Service" {
    $Service = Get-Service -Name "MandADiscoveryService" -ErrorAction SilentlyContinue
    if ($Service -and $Service.Status -eq "Running") {
        "Service running normally"
    } else {
        throw "Service not running or not found"
    }
}

# 2. Database Connectivity
Test-Component "Database Connection" {
    $Config = Get-Content $ConfigFile | ConvertFrom-Json
    $ConnectionString = $Config.ConnectionStrings.DefaultConnection
    
    $Connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $Connection.Open()
    
    $Command = $Connection.CreateCommand()
    $Command.CommandText = "SELECT COUNT(*) FROM sys.tables"
    $TableCount = $Command.ExecuteScalar()
    $Connection.Close()
    
    "Connected successfully - $TableCount tables found"
}

# 3. Web Application Endpoint
Test-Component "Web Application" {
    $Response = Invoke-WebRequest -Uri "https://localhost/api/health" -UseBasicParsing -TimeoutSec 10
    if ($Response.StatusCode -eq 200) {
        $HealthData = $Response.Content | ConvertFrom-Json
        "HTTP 200 OK - Status: $($HealthData.Status)"
    } else {
        throw "HTTP $($Response.StatusCode)"
    }
}

# 4. PowerShell Module Availability
Test-Component "PowerShell Modules" {
    $ModulePath = "C:\Program Files\MandADiscoverySuite\Modules"
    $RequiredModules = @("Migration\UserMigration", "Discovery\ActiveDirectoryDiscovery")
    
    $LoadedCount = 0
    foreach ($Module in $RequiredModules) {
        try {
            Import-Module "$ModulePath\$Module" -Force -ErrorAction Stop
            $LoadedCount++
        } catch {
            # Module load failed
        }
    }
    
    "$LoadedCount/$($RequiredModules.Count) critical modules loaded"
}

# 5. File System Access
Test-Component "File System Access" {
    $TestPaths = @(
        "C:\Program Files\MandADiscoverySuite",
        "C:\ProgramData\MandADiscoverySuite\Logs",
        "\\fileserver\MandAData"
    )
    
    $AccessibleCount = 0
    foreach ($Path in $TestPaths) {
        if (Test-Path $Path) {
            $AccessibleCount++
        }
    }
    
    "$AccessibleCount/$($TestPaths.Count) critical paths accessible"
}

# 6. System Resources
Test-Component "System Resources" {
    $CPU = Get-Counter "\Processor(_Total)\% Processor Time" | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
    $Memory = Get-Counter "\Memory\Available MBytes" | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
    $Disk = Get-Counter "\LogicalDisk(C:)\% Free Space" | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
    
    if ($CPU -lt 80 -and $Memory -gt 1000 -and $Disk -gt 20) {
        "CPU: $([Math]::Round($CPU,1))%, Memory: $([Math]::Round($Memory/1024,1))GB available, Disk: $([Math]::Round($Disk,1))% free"
    } else {
        throw "Resource constraint - CPU: $([Math]::Round($CPU,1))%, Memory: $([Math]::Round($Memory/1024,1))GB, Disk: $([Math]::Round($Disk,1))% free"
    }
}

# 7. Network Connectivity
Test-Component "Network Connectivity" {
    $Endpoints = @(
        @{ Name = "Domain Controller"; Address = "dc01.company.com"; Port = 389 },
        @{ Name = "Exchange Server"; Address = "exchange.company.com"; Port = 443 },
        @{ Name = "SharePoint Server"; Address = "sharepoint.company.com"; Port = 443 }
    )
    
    $ConnectedCount = 0
    foreach ($Endpoint in $Endpoints) {
        $TestResult = Test-NetConnection -ComputerName $Endpoint.Address -Port $Endpoint.Port -InformationLevel Quiet
        if ($TestResult) { $ConnectedCount++ }
    }
    
    "$ConnectedCount/$($Endpoints.Count) network endpoints reachable"
}

# 8. Authentication System
Test-Component "Authentication" {
    try {
        $CurrentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
        $IsAuthenticated = $CurrentUser.IsAuthenticated
        
        if ($IsAuthenticated) {
            "Windows authentication working - User: $($CurrentUser.Name)"
        } else {
            throw "Authentication failed"
        }
    } catch {
        throw "Authentication error: $($_.Exception.Message)"
    }
}

# Generate HTML Report
$HtmlReport = @"
<!DOCTYPE html>
<html>
<head>
    <title>M&A Discovery Suite - Health Check Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #2E86C1; color: white; padding: 15px; text-align: center; }
        .summary { background-color: #F8F9FA; padding: 15px; margin: 10px 0; border-left: 5px solid #2E86C1; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #F2F2F2; font-weight: bold; }
        .healthy { background-color: #D5F4E6; color: #0F5132; }
        .warning { background-color: #FFF3CD; color: #664D03; }
        .critical { background-color: #F8D7DA; color: #721C24; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>M&A Discovery Suite - Health Check Report</h1>
        <p>Generated: $(Get-Date) | Server: $env:COMPUTERNAME</p>
    </div>
    
    <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Total Components Checked:</strong> $($HealthResults.Count)</p>
        <p><strong>Healthy:</strong> $(($HealthResults | Where-Object Status -eq 'HEALTHY').Count)</p>
        <p><strong>Warnings:</strong> $(($HealthResults | Where-Object Status -eq 'WARNING').Count)</p>
        <p><strong>Critical Issues:</strong> $(($HealthResults | Where-Object Status -eq 'CRITICAL').Count)</p>
    </div>
    
    <table>
        <tr>
            <th>Component</th>
            <th>Status</th>
            <th>Details</th>
            <th>Check Duration (sec)</th>
            <th>Timestamp</th>
        </tr>
"@

foreach ($Result in $HealthResults) {
    $StatusClass = $Result.Status.ToLower()
    $HtmlReport += @"
        <tr class="$StatusClass">
            <td>$($Result.Component)</td>
            <td>$($Result.Status)</td>
            <td>$($Result.Details)</td>
            <td>$([Math]::Round($Result.Duration, 2))</td>
            <td>$($Result.Timestamp.ToString('HH:mm:ss'))</td>
        </tr>
"@
}

$HtmlReport += @"
    </table>
    
    <div class="footer">
        <p>This health check was automatically generated by the M&A Discovery Suite diagnostic system.</p>
        <p>For support assistance, please contact the IT Help Desk with this report.</p>
    </div>
</body>
</html>
"@

# Save report
New-Item -ItemType Directory -Path (Split-Path $OutputPath) -Force -ErrorAction SilentlyContinue
$HtmlReport | Out-File -FilePath $OutputPath -Encoding UTF8

Write-Host ""
Write-Host "Health check completed. Report saved to: $OutputPath" -ForegroundColor Green

# Return overall status
$CriticalIssues = ($HealthResults | Where-Object Status -eq 'CRITICAL').Count
$WarningIssues = ($HealthResults | Where-Object Status -eq 'WARNING').Count

if ($CriticalIssues -gt 0) {
    Write-Host "OVERALL STATUS: CRITICAL ($CriticalIssues critical issues)" -ForegroundColor Red
    exit 2
} elseif ($WarningIssues -gt 0) {
    Write-Host "OVERALL STATUS: WARNING ($WarningIssues warnings)" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "OVERALL STATUS: HEALTHY" -ForegroundColor Green
    exit 0
}
```

### 2.2 Performance Monitoring

#### Real-Time Performance Monitor
```powershell
# Real-Time Performance Monitoring Script
param(
    [int]$Duration = 3600, # 1 hour default
    [int]$Interval = 30,   # 30 seconds between samples
    [string]$OutputFile = "C:\MandADiagnostics\Performance_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
)

Write-Host "Starting performance monitoring for $Duration seconds..." -ForegroundColor Green

# Performance counters to monitor
$Counters = @(
    "\Processor(_Total)\% Processor Time",
    "\Memory\Available MBytes",
    "\Memory\Pages/sec",
    "\PhysicalDisk(_Total)\Avg. Disk Queue Length",
    "\PhysicalDisk(_Total)\% Disk Time",
    "\Network Interface(*)\Bytes Total/sec",
    "\Process(MandADiscoverySuite)\% Processor Time",
    "\Process(MandADiscoverySuite)\Working Set",
    "\Process(sqlservr)\% Processor Time",
    "\Process(sqlservr)\Working Set"
)

$Results = @()
$StartTime = Get-Date
$EndTime = $StartTime.AddSeconds($Duration)

while ((Get-Date) -lt $EndTime) {
    $Timestamp = Get-Date
    Write-Host "Collecting sample at $($Timestamp.ToString('HH:mm:ss'))..." -ForegroundColor Gray
    
    try {
        $Sample = Get-Counter -Counter $Counters -ErrorAction SilentlyContinue
        
        foreach ($Counter in $Sample.CounterSamples) {
            $Results += [PSCustomObject]@{
                Timestamp = $Timestamp
                Counter = $Counter.Path
                Instance = $Counter.InstanceName
                Value = [Math]::Round($Counter.CookedValue, 2)
                Status = if ($Counter.Status -eq "Success") { "OK" } else { $Counter.Status }
            }
        }
    } catch {
        Write-Warning "Error collecting performance data: $($_.Exception.Message)"
    }
    
    Start-Sleep -Seconds $Interval
}

# Export results
$Results | Export-Csv -Path $OutputFile -NoTypeInformation
Write-Host "Performance monitoring completed. Data saved to: $OutputFile" -ForegroundColor Green

# Generate summary
$Summary = @{}
foreach ($Counter in $Counters) {
    $CounterData = $Results | Where-Object { $_.Counter -like "*$($Counter.Split('\')[-1])*" }
    if ($CounterData) {
        $Summary[$Counter] = @{
            Average = [Math]::Round(($CounterData | Measure-Object -Property Value -Average).Average, 2)
            Maximum = [Math]::Round(($CounterData | Measure-Object -Property Value -Maximum).Maximum, 2)
            Minimum = [Math]::Round(($CounterData | Measure-Object -Property Value -Minimum).Minimum, 2)
        }
    }
}

Write-Host "`nPerformance Summary:" -ForegroundColor Cyan
$Summary.GetEnumerator() | ForEach-Object {
    Write-Host "$($_.Key): Avg=$($_.Value.Average), Max=$($_.Value.Maximum), Min=$($_.Value.Minimum)"
}
```

---

## 3. COMMON ISSUES & SOLUTIONS

### 3.1 Application Service Issues

#### Service Won't Start
```yaml
Issue: M&A Discovery Service fails to start
Symptoms:
  - Service shows "Starting" then "Stopped"
  - Event log shows application errors
  - Users cannot access web interface

Troubleshooting Steps:
  1. Check Windows Event Logs:
     - Windows Logs → Application
     - Applications and Services → MandA Discovery Suite
  
  2. Verify Service Account:
     - Confirm account is not locked
     - Verify password hasn't expired
     - Check "Log on as a service" right
  
  3. Test Database Connectivity:
     - Verify connection string in appsettings.json
     - Test SQL Server connectivity
     - Check firewall rules
  
  4. Validate File Permissions:
     - Service account has read/write to application folder
     - Temp directory accessible
     - Log directory writable

Resolution Script:
```

```powershell
# Service Startup Troubleshooting Script
param(
    [string]$ServiceName = "MandADiscoveryService",
    [string]$AppPath = "C:\Program Files\MandADiscoverySuite"
)

Write-Host "Diagnosing service startup issues..." -ForegroundColor Yellow

# 1. Check service status and configuration
$Service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($Service) {
    Write-Host "Service Status: $($Service.Status)" -ForegroundColor $(if($Service.Status -eq "Running") {"Green"} else {"Red"})
    
    # Get service configuration
    $ServiceConfig = Get-CimInstance -ClassName Win32_Service -Filter "Name='$ServiceName'"
    Write-Host "Service Account: $($ServiceConfig.StartName)"
    Write-Host "Start Mode: $($ServiceConfig.StartMode)"
} else {
    Write-Error "Service '$ServiceName' not found!"
    exit 1
}

# 2. Check recent event logs
Write-Host "`nChecking recent event logs..."
$Events = Get-EventLog -LogName Application -Source "*MandA*" -Newest 10 -ErrorAction SilentlyContinue
if ($Events) {
    $Events | Format-Table TimeGenerated, EntryType, Message -Wrap
} else {
    Write-Host "No recent application events found"
}

# 3. Test configuration file
Write-Host "`nValidating configuration..."
$ConfigFile = "$AppPath\appsettings.json"
if (Test-Path $ConfigFile) {
    try {
        $Config = Get-Content $ConfigFile | ConvertFrom-Json
        Write-Host "Configuration file valid"
        
        # Test database connection string
        if ($Config.ConnectionStrings.DefaultConnection) {
            Write-Host "Database connection string found"
            try {
                $Connection = New-Object System.Data.SqlClient.SqlConnection($Config.ConnectionStrings.DefaultConnection)
                $Connection.Open()
                $Connection.Close()
                Write-Host "Database connectivity: OK" -ForegroundColor Green
            } catch {
                Write-Host "Database connectivity: FAILED - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Error "Configuration file invalid: $($_.Exception.Message)"
    }
} else {
    Write-Error "Configuration file not found: $ConfigFile"
}

# 4. Check file permissions
Write-Host "`nChecking file permissions..."
$ServiceAccount = $ServiceConfig.StartName
if ($ServiceAccount -ne "LocalSystem") {
    $Acl = Get-Acl $AppPath
    $HasPermission = $Acl.Access | Where-Object { 
        $_.IdentityReference -eq $ServiceAccount -and 
        $_.AccessControlType -eq "Allow" -and 
        $_.FileSystemRights -match "FullControl|Modify"
    }
    
    if ($HasPermission) {
        Write-Host "Service account permissions: OK" -ForegroundColor Green
    } else {
        Write-Host "Service account permissions: INSUFFICIENT" -ForegroundColor Red
        Write-Host "Consider running: icacls '$AppPath' /grant '$ServiceAccount:(OI)(CI)F'"
    }
}

# 5. Attempt service restart
Write-Host "`nAttempting service restart..."
try {
    if ($Service.Status -eq "Running") {
        Stop-Service -Name $ServiceName -Force -TimeoutSec 30
    }
    Start-Service -Name $ServiceName -TimeoutSec 60
    Write-Host "Service restart: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "Service restart: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}
```

#### Memory Leaks and Performance Degradation
```yaml
Issue: Application consuming excessive memory
Symptoms:
  - Gradual memory increase over time
  - Slow response times
  - OutOfMemory exceptions
  - System instability

Diagnostic Commands:
```

```powershell
# Memory Leak Diagnostic Script
param(
    [string]$ProcessName = "MandADiscoverySuite",
    [int]$MonitorDuration = 1800 # 30 minutes
)

Write-Host "Starting memory leak analysis..." -ForegroundColor Yellow

$Results = @()
$StartTime = Get-Date

for ($i = 0; $i -lt ($MonitorDuration / 60); $i++) {
    $Process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($Process) {
        $MemoryMB = [Math]::Round($Process.WorkingSet64 / 1MB, 2)
        $VirtualMB = [Math]::Round($Process.VirtualMemorySize64 / 1MB, 2)
        $PrivateMB = [Math]::Round($Process.PrivateMemorySize64 / 1MB, 2)
        
        $Results += [PSCustomObject]@{
            Timestamp = Get-Date
            WorkingSet = $MemoryMB
            VirtualMemory = $VirtualMB
            PrivateMemory = $PrivateMB
            HandleCount = $Process.HandleCount
            ThreadCount = $Process.Threads.Count
        }
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Working Set: ${MemoryMB}MB, Handles: $($Process.HandleCount), Threads: $($Process.Threads.Count)"
    } else {
        Write-Warning "Process '$ProcessName' not found"
    }
    
    Start-Sleep -Seconds 60
}

# Analyze results for memory leaks
$MemoryGrowth = ($Results[-1].WorkingSet - $Results[0].WorkingSet)
$GrowthRate = $MemoryGrowth / ($Results.Count - 1) # MB per minute

Write-Host "`nMemory Analysis Results:" -ForegroundColor Cyan
Write-Host "Total Memory Growth: ${MemoryGrowth}MB over $($Results.Count) minutes"
Write-Host "Growth Rate: $([Math]::Round($GrowthRate, 2))MB per minute"

if ($GrowthRate -gt 1) {
    Write-Host "POTENTIAL MEMORY LEAK DETECTED" -ForegroundColor Red
    Write-Host "Recommendations:"
    Write-Host "1. Restart the application service"
    Write-Host "2. Review recent application logs for errors"
    Write-Host "3. Check for long-running migrations or operations"
    Write-Host "4. Consider engaging support for detailed analysis"
} else {
    Write-Host "Memory usage appears normal" -ForegroundColor Green
}

# Export detailed results
$OutputFile = "C:\MandADiagnostics\MemoryAnalysis_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
$Results | Export-Csv -Path $OutputFile -NoTypeInformation
Write-Host "Detailed results saved to: $OutputFile"
```

### 3.2 Database Issues

#### Connection Timeout Errors
```sql
-- Database Performance Diagnostic Queries

-- 1. Check for blocking processes
SELECT 
    blocking.session_id AS blocking_session,
    blocked.session_id AS blocked_session,
    blocking.login_name AS blocking_user,
    blocked.login_name AS blocked_user,
    blocking.host_name AS blocking_host,
    blocked.wait_type,
    blocked.wait_time,
    blocking.last_request_start_time,
    blocked.last_request_start_time
FROM sys.dm_exec_sessions blocking
INNER JOIN sys.dm_exec_sessions blocked 
    ON blocking.session_id = blocked.blocking_session_id
WHERE blocked.blocking_session_id IS NOT NULL;

-- 2. Identify long-running queries
SELECT 
    r.session_id,
    r.start_time,
    DATEDIFF(SECOND, r.start_time, GETDATE()) as duration_seconds,
    r.status,
    r.command,
    t.text AS query_text,
    r.cpu_time,
    r.logical_reads,
    r.writes
FROM sys.dm_exec_requests r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE r.session_id > 50
    AND DATEDIFF(SECOND, r.start_time, GETDATE()) > 30
ORDER BY duration_seconds DESC;

-- 3. Check database file sizes and growth
SELECT 
    name,
    physical_name,
    size * 8 / 1024 AS size_mb,
    max_size * 8 / 1024 AS max_size_mb,
    growth,
    is_percent_growth
FROM sys.database_files;

-- 4. Review wait statistics
SELECT TOP 10
    wait_type,
    waiting_tasks_count,
    wait_time_ms,
    max_wait_time_ms,
    signal_wait_time_ms,
    wait_time_ms - signal_wait_time_ms AS resource_wait_time_ms
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
    'CLR_SEMAPHORE', 'LAZYWRITER_SLEEP', 'RESOURCE_QUEUE', 
    'SLEEP_TASK', 'SLEEP_SYSTEMTASK', 'SQLTRACE_BUFFER_FLUSH', 
    'WAITFOR', 'LOGMGR_QUEUE', 'CHECKPOINT_QUEUE',
    'REQUEST_FOR_DEADLOCK_SEARCH', 'XE_TIMER_EVENT', 'BROKER_TO_FLUSH',
    'BROKER_TASK_STOP', 'CLR_MANUAL_EVENT', 'CLR_AUTO_EVENT',
    'DISPATCHER_QUEUE_SEMAPHORE', 'FT_IFTS_SCHEDULER_IDLE_WAIT',
    'XE_DISPATCHER_WAIT', 'XE_DISPATCHER_JOIN', 'SQLTRACE_INCREMENTAL_FLUSH_SLEEP'
)
ORDER BY wait_time_ms DESC;
```

#### Deadlock Resolution
```sql
-- Enable deadlock monitoring
DBCC TRACEON(1222, -1); -- Log deadlock information

-- Query to identify frequent deadlock victims
SELECT 
    GETDATE() as capture_time,
    session_id,
    request_id,
    blocking_session_id,
    wait_type,
    wait_time,
    wait_resource,
    transaction_isolation_level,
    lock_timeout
FROM sys.dm_exec_requests 
WHERE blocking_session_id <> 0;

-- Deadlock prevention index recommendations
WITH DeadlockQueries AS (
    SELECT 
        t.text,
        qs.execution_count,
        qs.total_worker_time / qs.execution_count as avg_cpu,
        qs.total_logical_reads / qs.execution_count as avg_reads
    FROM sys.dm_exec_query_stats qs
    CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) t
    WHERE t.text LIKE '%UPDATE%' OR t.text LIKE '%DELETE%'
)
SELECT TOP 10 * FROM DeadlockQueries
ORDER BY avg_cpu DESC;
```

---

## 4. PERFORMANCE TROUBLESHOOTING

### 4.1 Application Performance Issues

#### Slow Response Time Analysis
```powershell
# Web Application Performance Test
param(
    [string]$BaseUrl = "https://mandadiscovery.company.com",
    [int]$TestDuration = 300, # 5 minutes
    [string[]]$TestEndpoints = @(
        "/api/health",
        "/api/users",
        "/api/groups", 
        "/dashboard",
        "/discovery",
        "/planning"
    )
)

$Results = @()

Write-Host "Starting performance test against $BaseUrl" -ForegroundColor Green
Write-Host "Test duration: $TestDuration seconds" -ForegroundColor Gray

$StartTime = Get-Date
$EndTime = $StartTime.AddSeconds($TestDuration)

while ((Get-Date) -lt $EndTime) {
    foreach ($Endpoint in $TestEndpoints) {
        $RequestStart = Get-Date
        try {
            $Response = Invoke-WebRequest -Uri "$BaseUrl$Endpoint" -UseBasicParsing -TimeoutSec 30
            $RequestEnd = Get-Date
            $ResponseTime = ($RequestEnd - $RequestStart).TotalMilliseconds
            
            $Results += [PSCustomObject]@{
                Timestamp = $RequestStart
                Endpoint = $Endpoint
                StatusCode = $Response.StatusCode
                ResponseTime = [Math]::Round($ResponseTime, 2)
                ContentLength = $Response.Content.Length
                Success = $true
            }
            
            Write-Host "$(Get-Date -Format 'HH:mm:ss') $Endpoint - ${ResponseTime}ms" -ForegroundColor $(if($ResponseTime -lt 1000) {"Green"} else {"Yellow"})
            
        } catch {
            $RequestEnd = Get-Date
            $ResponseTime = ($RequestEnd - $RequestStart).TotalMilliseconds
            
            $Results += [PSCustomObject]@{
                Timestamp = $RequestStart
                Endpoint = $Endpoint
                StatusCode = $_.Exception.Message
                ResponseTime = [Math]::Round($ResponseTime, 2)
                ContentLength = 0
                Success = $false
            }
            
            Write-Host "$(Get-Date -Format 'HH:mm:ss') $Endpoint - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 500
    }
    Start-Sleep -Seconds 5
}

# Generate performance analysis
Write-Host "`nPerformance Analysis:" -ForegroundColor Cyan

foreach ($Endpoint in $TestEndpoints) {
    $EndpointResults = $Results | Where-Object { $_.Endpoint -eq $Endpoint -and $_.Success }
    if ($EndpointResults) {
        $Stats = $EndpointResults | Measure-Object -Property ResponseTime -Average -Minimum -Maximum
        $SuccessRate = ($EndpointResults.Count / ($Results | Where-Object Endpoint -eq $Endpoint).Count) * 100
        
        Write-Host "`n$Endpoint Performance:" -ForegroundColor Yellow
        Write-Host "  Average Response Time: $([Math]::Round($Stats.Average, 2))ms"
        Write-Host "  Minimum Response Time: $([Math]::Round($Stats.Minimum, 2))ms"
        Write-Host "  Maximum Response Time: $([Math]::Round($Stats.Maximum, 2))ms"
        Write-Host "  Success Rate: $([Math]::Round($SuccessRate, 2))%"
        Write-Host "  Total Requests: $($EndpointResults.Count)"
        
        # Performance assessment
        if ($Stats.Average -lt 500) {
            Write-Host "  Status: EXCELLENT" -ForegroundColor Green
        } elseif ($Stats.Average -lt 1000) {
            Write-Host "  Status: GOOD" -ForegroundColor Yellow
        } elseif ($Stats.Average -lt 3000) {
            Write-Host "  Status: POOR" -ForegroundColor Orange
        } else {
            Write-Host "  Status: CRITICAL" -ForegroundColor Red
        }
    }
}

# Export detailed results
$OutputFile = "C:\MandADiagnostics\PerformanceTest_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
$Results | Export-Csv -Path $OutputFile -NoTypeInformation
Write-Host "`nDetailed results exported to: $OutputFile" -ForegroundColor Green
```

### 4.2 Database Performance Optimization

#### Index Analysis and Optimization
```sql
-- Database Performance Optimization Script

-- 1. Identify missing indexes
SELECT 
    migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) AS improvement_measure,
    'CREATE NONCLUSTERED INDEX IX_' + OBJECT_NAME(mid.object_id) + '_' + 
    REPLACE(REPLACE(REPLACE(ISNULL(mid.equality_columns,''), ', ', '_'), '[', ''), ']', '') + 
    CASE WHEN mid.inequality_columns IS NOT NULL THEN '_' + 
    REPLACE(REPLACE(REPLACE(mid.inequality_columns, ', ', '_'), '[', ''), ']', '') ELSE '' END + 
    ' ON ' + statement + 
    ' (' + ISNULL(mid.equality_columns,'') + 
    CASE WHEN mid.equality_columns IS NOT NULL AND mid.inequality_columns IS NOT NULL THEN ',' ELSE '' END + 
    ISNULL(mid.inequality_columns, '') + ')' + 
    ISNULL (' INCLUDE (' + mid.included_columns + ')', '') AS create_index_statement,
    migs.*, 
    mid.database_id, 
    mid.object_id
FROM sys.dm_db_missing_index_groups mig
INNER JOIN sys.dm_db_missing_index_group_stats migs ON migs.group_handle = mig.index_group_handle
INNER JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
WHERE migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) > 10
ORDER BY improvement_measure DESC;

-- 2. Find unused indexes
SELECT 
    OBJECT_NAME(i.object_id) AS table_name,
    i.name AS index_name,
    i.type_desc,
    ius.user_seeks + ius.user_scans + ius.user_lookups AS total_reads,
    ius.user_updates AS total_writes,
    p.rows AS row_count
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats ius ON i.object_id = ius.object_id AND i.index_id = ius.index_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
    AND i.index_id > 0
    AND (ius.user_seeks + ius.user_scans + ius.user_lookups) = 0
    OR ius.user_seeks + ius.user_scans + ius.user_lookups < ius.user_updates
ORDER BY total_writes DESC;

-- 3. Index fragmentation analysis
SELECT 
    OBJECT_NAME(ips.object_id) AS table_name,
    i.name AS index_name,
    ips.index_type_desc,
    ips.avg_fragmentation_in_percent,
    ips.page_count,
    CASE 
        WHEN ips.avg_fragmentation_in_percent < 10 THEN 'No action needed'
        WHEN ips.avg_fragmentation_in_percent < 30 THEN 'REORGANIZE'
        ELSE 'REBUILD'
    END AS recommended_action
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
INNER JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE ips.avg_fragmentation_in_percent > 10 
    AND ips.page_count > 1000
ORDER BY ips.avg_fragmentation_in_percent DESC;

-- 4. Statistics update analysis
SELECT 
    SCHEMA_NAME(t.schema_id) + '.' + t.name AS table_name,
    s.name AS stats_name,
    STATS_DATE(s.object_id, s.stats_id) AS last_updated,
    DATEDIFF(day, STATS_DATE(s.object_id, s.stats_id), GETDATE()) AS days_old,
    p.rows AS row_count
FROM sys.stats s
INNER JOIN sys.tables t ON s.object_id = t.object_id
INNER JOIN sys.partitions p ON s.object_id = p.object_id AND p.index_id < 2
WHERE STATS_DATE(s.object_id, s.stats_id) < DATEADD(day, -7, GETDATE())
    OR STATS_DATE(s.object_id, s.stats_id) IS NULL
ORDER BY days_old DESC;
```

---

This troubleshooting guide provides comprehensive diagnostic procedures and resolution strategies for the M&A Discovery Suite. The remaining sections will continue with security troubleshooting, data validation issues, and complete support escalation procedures.

**Continue to remaining sections for complete troubleshooting coverage...**