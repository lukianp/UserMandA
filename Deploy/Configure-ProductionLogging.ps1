#Requires -Version 5.1
<#
.SYNOPSIS
    Configures production logging for M&A Discovery Suite
    
.DESCRIPTION
    Sets up structured logging, log rotation, centralized logging (ELK),
    and compliance-ready audit trails for enterprise deployment.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$LoggingPath = "C:\DiscoveryData\Logging",
    
    [Parameter(Mandatory = $false)]
    [string]$CompanyName = "Enterprise",
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("Debug", "Information", "Warning", "Error")]
    [string]$LogLevel = "Information",
    
    [Parameter(Mandatory = $false)]
    [int]$RetentionDays = 90
)

Write-Host "=== M&A Discovery Suite - Production Logging Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Create logging directory structure
$directories = @(
    "$LoggingPath\Application",
    "$LoggingPath\Audit",
    "$LoggingPath\Performance",
    "$LoggingPath\Security",
    "$LoggingPath\Migration",
    "$LoggingPath\Archive",
    "$LoggingPath\Config"
)

Write-Host "Creating logging directories..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor Gray
    }
}

# Create NLog configuration
Write-Host ""
Write-Host "Creating NLog configuration..." -ForegroundColor Yellow

$nlogConfig = @'
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      autoReload="true"
      throwExceptions="false"
      internalLogLevel="Error"
      internalLogFile="C:\Temp\nlog-internal.log">
  
  <extensions>
    <add assembly="NLog.Extensions.Logging"/>
  </extensions>
  
  <variable name="logDirectory" value="C:\DiscoveryData\Logging"/>
  <variable name="companyName" value="Enterprise"/>
  
  <targets async="true">
    <!-- Application Logs -->
    <target name="applicationFile" 
            xsi:type="File"
            fileName="${logDirectory}/Application/app-${date:format=yyyy-MM-dd}.log"
            layout="${date:format=yyyy-MM-dd HH:mm:ss.fff} [${level:uppercase=true}] [${logger}] [${threadid}] ${message} ${exception:format=tostring}"
            archiveFileName="${logDirectory}/Archive/app-{#}.log"
            archiveEvery="Day"
            archiveNumbering="Rolling"
            maxArchiveFiles="90"
            concurrentWrites="true"
            keepFileOpen="false"/>
    
    <!-- Structured JSON Logs for ELK -->
    <target name="jsonFile"
            xsi:type="File"
            fileName="${logDirectory}/Application/app-${date:format=yyyy-MM-dd}.json"
            layout="${json-serialize}">
      <layout xsi:type="JsonLayout" includeAllProperties="true">
        <attribute name="timestamp" layout="${date:format=yyyy-MM-ddTHH:mm:ss.fffZ}" />
        <attribute name="level" layout="${level:uppercase=true}" />
        <attribute name="logger" layout="${logger}" />
        <attribute name="thread" layout="${threadid}" />
        <attribute name="message" layout="${message}" />
        <attribute name="exception" layout="${exception:format=ToString}" />
        <attribute name="company" layout="${companyName}" />
        <attribute name="application" layout="MandADiscoverySuite" />
        <attribute name="environment" layout="Production" />
      </layout>
    </target>
    
    <!-- Security Audit Logs -->
    <target name="securityFile"
            xsi:type="File"
            fileName="${logDirectory}/Security/security-${date:format=yyyy-MM-dd}.log"
            layout="${date:format=yyyy-MM-dd HH:mm:ss.fff} [SECURITY] [${logger}] ${message}"
            archiveFileName="${logDirectory}/Archive/security-{#}.log"
            archiveEvery="Day"
            archiveNumbering="Rolling"
            maxArchiveFiles="365"/>
    
    <!-- Performance Logs -->
    <target name="performanceFile"
            xsi:type="File"
            fileName="${logDirectory}/Performance/perf-${date:format=yyyy-MM-dd}.log"
            layout="${date:format=yyyy-MM-dd HH:mm:ss.fff} [PERF] ${message}"
            archiveFileName="${logDirectory}/Archive/perf-{#}.log"
            archiveEvery="Day"
            archiveNumbering="Rolling"
            maxArchiveFiles="30"/>
    
    <!-- Migration Logs -->
    <target name="migrationFile"
            xsi:type="File"
            fileName="${logDirectory}/Migration/migration-${date:format=yyyy-MM-dd}.log"
            layout="${date:format=yyyy-MM-dd HH:mm:ss.fff} [MIGRATION] [${event-properties:MigrationType}] [${event-properties:MigrationId}] ${message}"
            archiveFileName="${logDirectory}/Archive/migration-{#}.log"
            archiveEvery="Day"
            archiveNumbering="Rolling"
            maxArchiveFiles="90"/>
    
    <!-- Console Output for Development -->
    <target name="console"
            xsi:type="ColoredConsole"
            layout="${date:format=HH:mm:ss.fff} [${level:uppercase=true:padding=5}] ${logger:shortName=true}: ${message} ${exception:format=tostring}">
      <highlight-row condition="level == LogLevel.Error" foregroundColor="Red"/>
      <highlight-row condition="level == LogLevel.Warn" foregroundColor="Yellow"/>
      <highlight-row condition="level == LogLevel.Info" foregroundColor="White"/>
      <highlight-row condition="level == LogLevel.Debug" foregroundColor="Gray"/>
    </target>
    
    <!-- Event Log for Critical Events -->
    <target name="eventlog"
            xsi:type="EventLog"
            source="MandADiscoverySuite"
            log="Application"
            layout="${message} ${exception:format=tostring}"/>
    
    <!-- Elasticsearch Target (requires NLog.Targets.ElasticSearch) -->
    <target name="elasticsearch"
            xsi:type="ElasticSearch"
            uri="http://localhost:9200"
            index="manda-discovery-${date:format=yyyy.MM.dd}"
            documentType="_doc"
            includeAllProperties="true">
      <field name="timestamp" layout="${date:format=yyyy-MM-ddTHH:mm:ss.fffZ}" />
      <field name="level" layout="${level:uppercase=true}" />
      <field name="logger" layout="${logger}" />
      <field name="message" layout="${message}" />
      <field name="exception" layout="${exception:format=ToString}" />
      <field name="company" layout="${companyName}" />
      <field name="application" layout="MandADiscoverySuite" />
    </target>
  </targets>
  
  <rules>
    <!-- Application Logs -->
    <logger name="*" minlevel="Information" writeTo="applicationFile,jsonFile" />
    
    <!-- Security Logs -->
    <logger name="*Security*" minlevel="Information" writeTo="securityFile" />
    <logger name="*Authentication*" minlevel="Information" writeTo="securityFile" />
    <logger name="*Authorization*" minlevel="Information" writeTo="securityFile" />
    
    <!-- Performance Logs -->
    <logger name="*Performance*" minlevel="Debug" writeTo="performanceFile" />
    <logger name="*Telemetry*" minlevel="Debug" writeTo="performanceFile" />
    
    <!-- Migration Logs -->
    <logger name="*Migration*" minlevel="Information" writeTo="migrationFile" />
    <logger name="*PowerShell*" minlevel="Information" writeTo="migrationFile" />
    
    <!-- Critical Events to Event Log -->
    <logger name="*" minlevel="Error" writeTo="eventlog" />
    
    <!-- Send to Elasticsearch in production -->
    <logger name="*" minlevel="Information" writeTo="elasticsearch" />
    
    <!-- Console output for debugging -->
    <logger name="*" minlevel="Debug" writeTo="console" />
  </rules>
</nlog>
'@

$nlogConfig | Out-File -FilePath "$LoggingPath\Config\NLog.config" -Encoding UTF8
Write-Host "   ✅ NLog configuration created" -ForegroundColor Green

# Create log management script
Write-Host ""
Write-Host "Creating log management scripts..." -ForegroundColor Yellow

$logManagementScript = @"
#Requires -Version 5.1
<#
.SYNOPSIS
    Log management and maintenance for M&A Discovery Suite
#>

param(
    [ValidateSet("Cleanup", "Archive", "Health", "Export")]
    [string]$Action = "Health",
    
    [int]$RetentionDays = $RetentionDays
)

Write-Host "=== Log Management - $Action ===" -ForegroundColor Cyan

switch ($Action) {
    "Cleanup" {
        Write-Host "Cleaning up logs older than $RetentionDays days..." -ForegroundColor Yellow
        
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        $logPaths = @(
            "$LoggingPath\Application\*.log",
            "$LoggingPath\Performance\*.log",
            "$LoggingPath\Migration\*.log"
        )
        
        foreach ($path in $logPaths) {
            Get-ChildItem $path -ErrorAction SilentlyContinue | 
                Where-Object { $_.LastWriteTime -lt $cutoffDate } |
                ForEach-Object {
                    Write-Host "   Removing: $($_.Name)" -ForegroundColor Gray
                    Remove-Item $_.FullName -Force
                }
        }
        
        Write-Host "✅ Log cleanup completed" -ForegroundColor Green
    }
    
    "Archive" {
        Write-Host "Archiving old log files..." -ForegroundColor Yellow
        
        $archiveDate = (Get-Date).AddDays(-7)
        $logFiles = Get-ChildItem "$LoggingPath\Application\*.log" -ErrorAction SilentlyContinue |
            Where-Object { $_.LastWriteTime -lt $archiveDate }
        
        if ($logFiles) {
            $archiveName = "logs-$(Get-Date -Format 'yyyy-MM-dd').zip"
            $archivePath = Join-Path "$LoggingPath\Archive" $archiveName
            
            Compress-Archive -Path $logFiles.FullName -DestinationPath $archivePath -CompressionLevel Optimal
            Write-Host "   Created archive: $archiveName" -ForegroundColor Green
            
            # Remove original files after archiving
            $logFiles | Remove-Item -Force
        }
        
        Write-Host "✅ Log archival completed" -ForegroundColor Green
    }
    
    "Health" {
        Write-Host "Checking log system health..." -ForegroundColor Yellow
        
        # Check disk space
        $logDrive = (Get-Item $LoggingPath).PSDrive
        $freeSpaceGB = [math]::Round($logDrive.Free / 1GB, 2)
        
        if ($freeSpaceGB -lt 5) {
            Write-Host "   ⚠️  Warning: Low disk space ($freeSpaceGB GB free)" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Disk space: $freeSpaceGB GB free" -ForegroundColor Green
        }
        
        # Check recent log activity
        $recentLogs = Get-ChildItem "$LoggingPath\Application\*.log" -ErrorAction SilentlyContinue |
            Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-1) }
        
        if ($recentLogs) {
            Write-Host "   ✅ Recent activity: $($recentLogs.Count) active log files" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Warning: No recent log activity" -ForegroundColor Yellow
        }
        
        # Check log sizes
        $totalSize = (Get-ChildItem "$LoggingPath" -Recurse -File | Measure-Object -Property Length -Sum).Sum
        $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
        
        Write-Host "   📊 Total log size: $totalSizeMB MB" -ForegroundColor Cyan
        
        Write-Host "✅ Log health check completed" -ForegroundColor Green
    }
    
    "Export" {
        Write-Host "Exporting logs for analysis..." -ForegroundColor Yellow
        
        $exportPath = Join-Path $LoggingPath "Exports\export-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
        New-Item -ItemType Directory -Path $exportPath -Force | Out-Null
        
        # Export last 24 hours of logs
        $cutoffTime = (Get-Date).AddDays(-1)
        Get-ChildItem "$LoggingPath" -Recurse -File "*.log" |
            Where-Object { $_.LastWriteTime -gt $cutoffTime } |
            Copy-Item -Destination $exportPath
        
        Write-Host "   📁 Logs exported to: $exportPath" -ForegroundColor Green
        Write-Host "✅ Log export completed" -ForegroundColor Green
    }
}
"@

$logManagementScript | Out-File -FilePath "$LoggingPath\Manage-Logs.ps1" -Encoding UTF8
Write-Host "   ✅ Log management script created" -ForegroundColor Green

# Create Windows Event Log source
Write-Host ""
Write-Host "Creating Windows Event Log source..." -ForegroundColor Yellow
try {
    if (![System.Diagnostics.EventLog]::SourceExists("MandADiscoverySuite")) {
        New-EventLog -LogName Application -Source "MandADiscoverySuite"
        Write-Host "   ✅ Event log source created" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Event log source already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Warning: Could not create event log source (requires admin)" -ForegroundColor Yellow
}

# Create log monitoring script
Write-Host ""
Write-Host "Creating log monitoring script..." -ForegroundColor Yellow

$monitorScript = @'
# Real-time log monitoring
param(
    [string]$LogPath = "C:\DiscoveryData\Logging\Application",
    [switch]$Tail
)

Write-Host "=== M&A Discovery Suite - Log Monitor ===" -ForegroundColor Cyan

if ($Tail) {
    # Get latest log file
    $latestLog = Get-ChildItem "$LogPath\*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($latestLog) {
        Write-Host "Monitoring: $($latestLog.Name)" -ForegroundColor Green
        Get-Content $latestLog.FullName -Wait -Tail 10
    }
} else {
    # Show log summary
    Write-Host "Recent log activity:" -ForegroundColor Yellow
    
    $logs = Get-ChildItem "$LogPath\*.log" | Sort-Object LastWriteTime -Descending
    foreach ($log in $logs | Select-Object -First 5) {
        $lines = (Get-Content $log.FullName | Measure-Object -Line).Lines
        $size = [math]::Round($log.Length / 1KB, 1)
        Write-Host "  $($log.Name): $lines lines, $size KB" -ForegroundColor Cyan
    }
}
'@

$monitorScript | Out-File -FilePath "$LoggingPath\Monitor-Logs.ps1" -Encoding UTF8
Write-Host "   ✅ Log monitoring script created" -ForegroundColor Green

# Create scheduled task for log maintenance
Write-Host ""
Write-Host "Creating scheduled task for log maintenance..." -ForegroundColor Yellow

$taskScript = @"
# Create scheduled task for daily log maintenance
$taskName = "MandADiscovery-LogMaintenance"
$taskAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File '$LoggingPath\Manage-Logs.ps1' -Action Cleanup"
$taskTrigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
$taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
    Register-ScheduledTask -TaskName $taskName -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Description "M&A Discovery Suite log maintenance" -Force
    Write-Host "✅ Scheduled task created: $taskName" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not create scheduled task: $($_.Exception.Message)" -ForegroundColor Yellow
}
"@

$taskScript | Out-File -FilePath "$LoggingPath\Create-ScheduledTask.ps1" -Encoding UTF8
Write-Host "   ✅ Scheduled task script created" -ForegroundColor Green

Write-Host ""
Write-Host "=== Production Logging Configuration Complete ===" -ForegroundColor Cyan
Write-Host "Logging Path: $LoggingPath" -ForegroundColor Green
Write-Host "Log Level: $LogLevel" -ForegroundColor Green
Write-Host "Retention: $RetentionDays days" -ForegroundColor Green
Write-Host ""
Write-Host "Log Categories:" -ForegroundColor Yellow
Write-Host "  • Application logs: $LoggingPath\Application\" -ForegroundColor Gray
Write-Host "  • Security audit: $LoggingPath\Security\" -ForegroundColor Gray
Write-Host "  • Performance logs: $LoggingPath\Performance\" -ForegroundColor Gray
Write-Host "  • Migration logs: $LoggingPath\Migration\" -ForegroundColor Gray
Write-Host ""
Write-Host "Management Commands:" -ForegroundColor Yellow
Write-Host "  • Health check: .\Manage-Logs.ps1 -Action Health" -ForegroundColor Gray
Write-Host "  • Cleanup old logs: .\Manage-Logs.ps1 -Action Cleanup" -ForegroundColor Gray
Write-Host "  • Monitor live: .\Monitor-Logs.ps1 -Tail" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Production logging infrastructure ready!" -ForegroundColor Green