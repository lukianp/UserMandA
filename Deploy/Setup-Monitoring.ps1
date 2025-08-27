#Requires -Version 5.1
<#
.SYNOPSIS
    Sets up enterprise monitoring infrastructure for M&A Discovery Suite
    
.DESCRIPTION
    Configures Prometheus, Grafana, and Application Insights for comprehensive
    monitoring, alerting, and telemetry collection.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$MonitoringPath = "C:\Monitoring",
    
    [Parameter(Mandatory = $false)]
    [string]$CompanyName = "Enterprise",
    
    [Parameter(Mandatory = $false)]
    [switch]$ConfigureAlerts
)

Write-Host "=== M&A Discovery Suite - Monitoring Infrastructure Setup ===" -ForegroundColor Cyan
Write-Host ""

# Create monitoring directory structure
$directories = @(
    "$MonitoringPath\Prometheus",
    "$MonitoringPath\Grafana",
    "$MonitoringPath\Alerts",
    "$MonitoringPath\Logs",
    "$MonitoringPath\Metrics",
    "$MonitoringPath\Dashboards"
)

Write-Host "Creating monitoring directories..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor Gray
    }
}

# Create Prometheus configuration
Write-Host ""
Write-Host "Configuring Prometheus..." -ForegroundColor Yellow

$prometheusConfig = @'
# M&A Discovery Suite - Prometheus Configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'manda-discovery'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

# Rule files
rule_files:
  - 'alerts/*.yml'

# Scrape configurations
scrape_configs:
  # Application metrics
  - job_name: 'manda-application'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:5000']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'app-primary'
  
  # PowerShell execution metrics
  - job_name: 'powershell-runners'
    static_configs:
      - targets: 
        - 'localhost:5001'
        - 'localhost:5002'
        - 'localhost:5003'
    relabel_configs:
      - source_labels: [__address__]
        regex: 'localhost:500(\d)'
        target_label: runner_id
        replacement: 'runner-${1}'
  
  # SQL Server metrics
  - job_name: 'sql-server'
    static_configs:
      - targets: ['localhost:5004']
    relabel_configs:
      - source_labels: [__address__]
        target_label: database
        replacement: 'MandADiscovery'
  
  # Windows metrics (node_exporter)
  - job_name: 'windows-node'
    static_configs:
      - targets: ['localhost:9182']
    relabel_configs:
      - source_labels: [__address__]
        target_label: node_type
        replacement: 'application-server'
'@

$prometheusConfig | Out-File -FilePath "$MonitoringPath\Prometheus\prometheus.yml" -Encoding UTF8
Write-Host "   ✅ Prometheus configuration created" -ForegroundColor Green

# Create alert rules
Write-Host ""
Write-Host "Creating alert rules..." -ForegroundColor Yellow

$alertRules = @'
# M&A Discovery Suite - Alert Rules
groups:
  - name: application_alerts
    interval: 30s
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: windows_cpu_usage_percent > 80
        for: 5m
        labels:
          severity: warning
          component: infrastructure
        annotations:
          summary: "High CPU usage detected on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"
      
      # High memory usage
      - alert: HighMemoryUsage
        expr: (1 - (windows_memory_available_bytes / windows_memory_total_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: warning
          component: infrastructure
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"
      
      # Migration failures
      - alert: MigrationFailureRate
        expr: rate(migration_failures_total[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
          component: migration
        annotations:
          summary: "High migration failure rate"
          description: "Migration failure rate is {{ $value }} per second"
      
      # PowerShell runner down
      - alert: PowerShellRunnerDown
        expr: up{job="powershell-runners"} == 0
        for: 1m
        labels:
          severity: critical
          component: powershell
        annotations:
          summary: "PowerShell runner {{ $labels.runner_id }} is down"
          description: "PowerShell runner {{ $labels.runner_id }} has been down for more than 1 minute"
      
      # Database connection issues
      - alert: DatabaseConnectionFailure
        expr: sql_server_connections_failed > 0
        for: 1m
        labels:
          severity: critical
          component: database
        annotations:
          summary: "Database connection failures detected"
          description: "{{ $value }} database connection failures in the last minute"
      
      # Long running migrations
      - alert: LongRunningMigration
        expr: migration_duration_seconds > 3600
        for: 1m
        labels:
          severity: warning
          component: migration
        annotations:
          summary: "Long running migration detected"
          description: "Migration {{ $labels.migration_id }} has been running for more than 1 hour"
'@

$alertRules | Out-File -FilePath "$MonitoringPath\Prometheus\alerts\rules.yml" -Encoding UTF8
Write-Host "   ✅ Alert rules created" -ForegroundColor Green

# Create Grafana dashboard
Write-Host ""
Write-Host "Creating Grafana dashboards..." -ForegroundColor Yellow

$grafanaDashboard = @'
{
  "dashboard": {
    "id": null,
    "title": "M&A Discovery Suite - Operations Dashboard",
    "tags": ["manda", "migration", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
        "type": "graph",
        "title": "Migration Throughput",
        "targets": [
          {
            "expr": "rate(migrations_completed_total[5m])",
            "legendFormat": "Migrations/sec"
          }
        ]
      },
      {
        "id": 2,
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0},
        "type": "graph",
        "title": "PowerShell Runner Utilization",
        "targets": [
          {
            "expr": "powershell_runspace_active / powershell_runspace_total * 100",
            "legendFormat": "{{ runner_id }}"
          }
        ]
      },
      {
        "id": 3,
        "gridPos": {"h": 8, "w": 8, "x": 0, "y": 8},
        "type": "stat",
        "title": "Total Migrations Today",
        "targets": [
          {
            "expr": "increase(migrations_completed_total[1d])"
          }
        ]
      },
      {
        "id": 4,
        "gridPos": {"h": 8, "w": 8, "x": 8, "y": 8},
        "type": "stat",
        "title": "Success Rate",
        "targets": [
          {
            "expr": "(migrations_successful_total / migrations_completed_total) * 100"
          }
        ]
      },
      {
        "id": 5,
        "gridPos": {"h": 8, "w": 8, "x": 16, "y": 8},
        "type": "stat",
        "title": "Active Migrations",
        "targets": [
          {
            "expr": "migrations_active"
          }
        ]
      }
    ],
    "version": 1
  }
}
'@

$grafanaDashboard | Out-File -FilePath "$MonitoringPath\Dashboards\operations.json" -Encoding UTF8
Write-Host "   ✅ Grafana dashboards created" -ForegroundColor Green

# Create Application Insights configuration
Write-Host ""
Write-Host "Creating Application Insights configuration..." -ForegroundColor Yellow

$appInsightsConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<ApplicationInsights xmlns="http://schemas.microsoft.com/ApplicationInsights/2013/Settings">
  <InstrumentationKey>{YOUR_INSTRUMENTATION_KEY}</InstrumentationKey>
  
  <TelemetryModules>
    <Add Type="Microsoft.ApplicationInsights.DependencyCollector.DependencyTrackingTelemetryModule, Microsoft.AI.DependencyCollector"/>
    <Add Type="Microsoft.ApplicationInsights.Extensibility.PerfCounterCollector.PerformanceCollectorModule, Microsoft.AI.PerfCounterCollector">
      <Counters>
        <Add PerformanceCounter="\Process(MandADiscoverySuite)\% Processor Time" ReportAs="CPU Usage"/>
        <Add PerformanceCounter="\Process(MandADiscoverySuite)\Private Bytes" ReportAs="Memory Usage"/>
        <Add PerformanceCounter="\.NET CLR Memory(MandADiscoverySuite)\# Gen 2 Collections" ReportAs="Gen 2 GC"/>
      </Counters>
    </Add>
  </TelemetryModules>
  
  <TelemetryProcessors>
    <Add Type="Microsoft.ApplicationInsights.Extensibility.PerfCounterCollector.QuickPulse.QuickPulseTelemetryProcessor, Microsoft.AI.PerfCounterCollector"/>
  </TelemetryProcessors>
  
  <TelemetryChannel Type="Microsoft.ApplicationInsights.WindowsServer.TelemetryChannel.ServerTelemetryChannel, Microsoft.AI.ServerTelemetryChannel"/>
</ApplicationInsights>
"@

$appInsightsConfig | Out-File -FilePath "$MonitoringPath\ApplicationInsights.config" -Encoding UTF8
Write-Host "   ✅ Application Insights configuration created" -ForegroundColor Green

# Create monitoring startup script
Write-Host ""
Write-Host "Creating monitoring startup script..." -ForegroundColor Yellow

$startupScript = @'
# Start Monitoring Services
Write-Host "Starting monitoring services..." -ForegroundColor Cyan

# Start Prometheus
Start-Process -FilePath "prometheus.exe" -ArgumentList "--config.file=prometheus.yml" -WorkingDirectory "$MonitoringPath\Prometheus"

# Start Grafana
Start-Process -FilePath "grafana-server.exe" -WorkingDirectory "$MonitoringPath\Grafana"

# Start Windows Exporter
Start-Process -FilePath "windows_exporter.exe" -ArgumentList "--collectors.enabled=cpu,memory,disk,net,process"

Write-Host "Monitoring services started successfully!" -ForegroundColor Green
Write-Host "Prometheus: http://localhost:9090" -ForegroundColor Cyan
Write-Host "Grafana: http://localhost:3000" -ForegroundColor Cyan
'@

$startupScript | Out-File -FilePath "$MonitoringPath\Start-Monitoring.ps1" -Encoding UTF8
Write-Host "   ✅ Startup script created" -ForegroundColor Green

# Create health check script
Write-Host ""
Write-Host "Creating health check script..." -ForegroundColor Yellow

$healthCheckScript = @'
# M&A Discovery Suite - Health Check
param(
    [switch]$Detailed
)

Write-Host "=== M&A Discovery Suite Health Check ===" -ForegroundColor Cyan
$healthStatus = @{
    Application = $false
    Database = $false
    PowerShell = $false
    Monitoring = $false
}

# Check application
try {
    $appProcess = Get-Process "MandADiscoverySuite" -ErrorAction SilentlyContinue
    if ($appProcess) {
        $healthStatus.Application = $true
        Write-Host "✅ Application: Running (PID: $($appProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "❌ Application: Not Running" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Application: Error checking status" -ForegroundColor Red
}

# Check database
try {
    $sqlConnection = New-Object System.Data.SqlClient.SqlConnection
    $sqlConnection.ConnectionString = "Data Source=localhost;Initial Catalog=MandADiscovery;Integrated Security=True"
    $sqlConnection.Open()
    $healthStatus.Database = $true
    Write-Host "✅ Database: Connected" -ForegroundColor Green
    $sqlConnection.Close()
} catch {
    Write-Host "❌ Database: Connection Failed" -ForegroundColor Red
}

# Check PowerShell runners
try {
    $runnerPorts = @(5001, 5002, 5003)
    $activeRunners = 0
    foreach ($port in $runnerPorts) {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            $activeRunners++
        }
    }
    if ($activeRunners -gt 0) {
        $healthStatus.PowerShell = $true
        Write-Host "✅ PowerShell Runners: $activeRunners/3 Active" -ForegroundColor Green
    } else {
        Write-Host "❌ PowerShell Runners: None Active" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PowerShell Runners: Error checking status" -ForegroundColor Red
}

# Check monitoring
try {
    $prometheusResponse = Invoke-WebRequest -Uri "http://localhost:9090/-/healthy" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($prometheusResponse.StatusCode -eq 200) {
        $healthStatus.Monitoring = $true
        Write-Host "✅ Monitoring: Active" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Monitoring: Degraded" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Monitoring: Not Available" -ForegroundColor Red
}

# Overall status
$healthyComponents = ($healthStatus.Values | Where-Object { $_ -eq $true }).Count
$totalComponents = $healthStatus.Count
$healthPercentage = [math]::Round(($healthyComponents / $totalComponents) * 100)

Write-Host ""
Write-Host "Overall Health: $healthPercentage% ($healthyComponents/$totalComponents components healthy)" -ForegroundColor $(
    if ($healthPercentage -ge 75) { "Green" }
    elseif ($healthPercentage -ge 50) { "Yellow" }
    else { "Red" }
)

if ($Detailed) {
    Write-Host ""
    Write-Host "Detailed Status:" -ForegroundColor Cyan
    $healthStatus.GetEnumerator() | ForEach-Object {
        $status = if ($_.Value) { "✅ Healthy" } else { "❌ Unhealthy" }
        Write-Host "  $($_.Key): $status"
    }
}
'@

$healthCheckScript | Out-File -FilePath "$MonitoringPath\Test-Health.ps1" -Encoding UTF8
Write-Host "   ✅ Health check script created" -ForegroundColor Green

Write-Host ""
Write-Host "=== Monitoring Infrastructure Setup Complete ===" -ForegroundColor Cyan
Write-Host "Monitoring Path: $MonitoringPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Install Prometheus from: https://prometheus.io/download/" -ForegroundColor Gray
Write-Host "2. Install Grafana from: https://grafana.com/grafana/download" -ForegroundColor Gray
Write-Host "3. Run Start-Monitoring.ps1 to launch services" -ForegroundColor Gray
Write-Host "4. Access dashboards at http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Monitoring infrastructure ready for deployment!" -ForegroundColor Green