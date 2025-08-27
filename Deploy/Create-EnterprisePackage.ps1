#Requires -Version 5.1
<#
.SYNOPSIS
    Creates enterprise deployment package for M&A Discovery Suite
    
.DESCRIPTION
    This script packages the M&A Discovery Suite for enterprise deployment,
    including all binaries, modules, configuration, and documentation.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$Version = "1.0.0",
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "D:\Scripts\UserMandA\Deploy\Package",
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("MSI", "ZIP", "Docker", "All")]
    [string]$PackageType = "All"
)

Write-Host "=== M&A Discovery Suite - Enterprise Package Builder ===" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Green
Write-Host ""

# Create output directory structure
$packageRoot = Join-Path $OutputPath "MandADiscoverySuite_v$Version"
$directories = @(
    "$packageRoot\Application",
    "$packageRoot\Modules",
    "$packageRoot\Configuration",
    "$packageRoot\Scripts",
    "$packageRoot\Documentation",
    "$packageRoot\Database",
    "$packageRoot\Monitoring",
    "$packageRoot\Prerequisites"
)

Write-Host "Creating package structure..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor Gray
    }
}

# Copy application binaries
Write-Host ""
Write-Host "Packaging application binaries..." -ForegroundColor Yellow
$appSource = "D:\Scripts\UserMandA\GUI\bin\Release\net6.0-windows"
if (Test-Path $appSource) {
    Copy-Item -Path "$appSource\*" -Destination "$packageRoot\Application" -Recurse -Force
    Write-Host "   ✅ Application binaries packaged" -ForegroundColor Green
} else {
    # Use Debug build if Release not available
    $appSource = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows"
    if (Test-Path $appSource) {
        Copy-Item -Path "$appSource\*" -Destination "$packageRoot\Application" -Recurse -Force
        Write-Host "   ⚠️  Using Debug build (Release not found)" -ForegroundColor Yellow
    }
}

# Copy PowerShell modules
Write-Host ""
Write-Host "Packaging PowerShell modules..." -ForegroundColor Yellow
$moduleSource = "D:\Scripts\UserMandA\Modules"
if (Test-Path $moduleSource) {
    Copy-Item -Path "$moduleSource\*" -Destination "$packageRoot\Modules" -Recurse -Force
    Write-Host "   ✅ PowerShell modules packaged" -ForegroundColor Green
}

# Create configuration templates
Write-Host ""
Write-Host "Creating configuration templates..." -ForegroundColor Yellow

$appConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <!-- Enterprise Configuration -->
    <add key="Environment" value="Production" />
    <add key="CompanyProfile" value="{COMPANY_NAME}" />
    <add key="DataRootPath" value="C:\DiscoveryData" />
    <add key="LogLevel" value="Information" />
    <add key="EnableTelemetry" value="true" />
    
    <!-- Database Configuration -->
    <add key="DatabaseServer" value="{SQL_SERVER}" />
    <add key="DatabaseName" value="MandADiscovery" />
    <add key="DatabaseAuth" value="Integrated" />
    
    <!-- PowerShell Configuration -->
    <add key="MaxConcurrentRunspaces" value="20" />
    <add key="RunspaceTimeout" value="300" />
    <add key="EnableScriptLogging" value="true" />
    
    <!-- Security Configuration -->
    <add key="RequireEncryption" value="true" />
    <add key="EnableAuditing" value="true" />
    <add key="SessionTimeout" value="480" />
  </appSettings>
  
  <connectionStrings>
    <add name="MandADiscoveryDB" 
         connectionString="Data Source={SQL_SERVER};Initial Catalog=MandADiscovery;Integrated Security=True;Encrypt=True;TrustServerCertificate=False" 
         providerName="System.Data.SqlClient" />
  </connectionStrings>
</configuration>
'@

$appConfig | Out-File -FilePath "$packageRoot\Configuration\app.config.template" -Encoding UTF8
Write-Host "   ✅ Configuration templates created" -ForegroundColor Green

# Create deployment scripts
Write-Host ""
Write-Host "Creating deployment scripts..." -ForegroundColor Yellow

$installScript = @'
# M&A Discovery Suite - Installation Script
param(
    [string]$InstallPath = "C:\Program Files\MandADiscoverySuite",
    [string]$DataPath = "C:\DiscoveryData",
    [string]$ServiceAccount = "NT AUTHORITY\SYSTEM"
)

Write-Host "Installing M&A Discovery Suite..." -ForegroundColor Cyan

# Create installation directories
New-Item -ItemType Directory -Path $InstallPath -Force
New-Item -ItemType Directory -Path $DataPath -Force

# Copy application files
Copy-Item -Path ".\Application\*" -Destination $InstallPath -Recurse -Force
Copy-Item -Path ".\Modules" -Destination $InstallPath -Recurse -Force

# Set permissions
$acl = Get-Acl $DataPath
$permission = "$ServiceAccount","FullControl","ContainerInherit,ObjectInherit","None","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $DataPath $acl

# Create Windows Service (if applicable)
# New-Service -Name "MandADiscovery" -BinaryPath "$InstallPath\MandADiscoverySuite.exe" -DisplayName "M&A Discovery Suite" -StartupType Automatic

Write-Host "Installation completed successfully!" -ForegroundColor Green
'@

$installScript | Out-File -FilePath "$packageRoot\Scripts\Install-MandADiscoverySuite.ps1" -Encoding UTF8

# Create monitoring configuration
Write-Host ""
Write-Host "Creating monitoring configuration..." -ForegroundColor Yellow

$prometheusConfig = @'
# Prometheus configuration for M&A Discovery Suite
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'manda-discovery'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
    
  - job_name: 'sql-server'
    static_configs:
      - targets: ['localhost:9091']
      
  - job_name: 'powershell-runners'
    static_configs:
      - targets: ['localhost:9092', 'localhost:9093', 'localhost:9094']
'@

$prometheusConfig | Out-File -FilePath "$packageRoot\Monitoring\prometheus.yml" -Encoding UTF8

# Create database scripts
Write-Host ""
Write-Host "Creating database scripts..." -ForegroundColor Yellow

$dbSchema = @'
-- M&A Discovery Suite Database Schema
-- Version 1.0.0

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MandADiscovery')
BEGIN
    CREATE DATABASE MandADiscovery;
END
GO

USE MandADiscovery;
GO

-- Migration Tracking Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Migrations')
BEGIN
    CREATE TABLE Migrations (
        MigrationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MigrationType NVARCHAR(50) NOT NULL,
        SourceDomain NVARCHAR(255),
        TargetDomain NVARCHAR(255),
        Status NVARCHAR(50) NOT NULL,
        StartedAt DATETIME2 NOT NULL,
        CompletedAt DATETIME2,
        TotalItems INT,
        ProcessedItems INT,
        SuccessfulItems INT,
        FailedItems INT,
        ErrorMessage NVARCHAR(MAX),
        CreatedBy NVARCHAR(100),
        CreatedAt DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- Migration Progress Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MigrationProgress')
BEGIN
    CREATE TABLE MigrationProgress (
        ProgressId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MigrationId UNIQUEIDENTIFIER NOT NULL,
        Phase NVARCHAR(100),
        PercentComplete INT,
        Message NVARCHAR(MAX),
        CurrentItem NVARCHAR(500),
        Timestamp DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (MigrationId) REFERENCES Migrations(MigrationId)
    );
END
GO

-- Create indexes
CREATE INDEX IX_Migrations_Status ON Migrations(Status);
CREATE INDEX IX_Migrations_StartedAt ON Migrations(StartedAt DESC);
CREATE INDEX IX_MigrationProgress_MigrationId ON MigrationProgress(MigrationId);
GO
'@

$dbSchema | Out-File -FilePath "$packageRoot\Database\CreateSchema.sql" -Encoding UTF8
Write-Host "   ✅ Database scripts created" -ForegroundColor Green

# Create documentation
Write-Host ""
Write-Host "Creating documentation..." -ForegroundColor Yellow

$readme = @"
# M&A Discovery Suite - Enterprise Deployment
Version: $Version

## Quick Start
1. Run Prerequisites\Install-Prerequisites.ps1
2. Run Scripts\Install-MandADiscoverySuite.ps1
3. Configure app.config with your environment settings
4. Run Database\CreateSchema.sql on your SQL Server
5. Launch MandADiscoverySuite.exe

## Support
- Documentation: Documentation\
- Logs: C:\DiscoveryData\{CompanyName}\Logs
- Support Email: support@mandadiscovery.com

## System Requirements
- Windows Server 2019/2022
- .NET 6.0 Runtime
- PowerShell 5.1 or higher
- SQL Server 2016 or higher
"@

$readme | Out-File -FilePath "$packageRoot\README.md" -Encoding UTF8
Write-Host "   ✅ Documentation created" -ForegroundColor Green

# Create package based on type
Write-Host ""
if ($PackageType -eq "ZIP" -or $PackageType -eq "All") {
    Write-Host "Creating ZIP package..." -ForegroundColor Yellow
    $zipPath = Join-Path $OutputPath "MandADiscoverySuite_v${Version}.zip"
    Compress-Archive -Path $packageRoot -DestinationPath $zipPath -Force
    Write-Host "   ✅ ZIP package created: $zipPath" -ForegroundColor Green
}

# Package summary
Write-Host ""
Write-Host "=== Package Creation Complete ===" -ForegroundColor Cyan
Write-Host "Package Location: $packageRoot" -ForegroundColor Green
Write-Host "Package Type: $PackageType" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Green

# Calculate package size
$packageSize = (Get-ChildItem $packageRoot -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Package Size: $([math]::Round($packageSize, 2)) MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Enterprise deployment package ready!" -ForegroundColor Green