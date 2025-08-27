# M&A Discovery Suite - Technical Deployment Guide
**For IT Administrators & Technical Teams | Production Deployment Manual**

---

## Table of Contents

1. [Pre-Deployment Requirements](#1-pre-deployment-requirements)
2. [Infrastructure Setup](#2-infrastructure-setup)
3. [Application Installation](#3-application-installation)
4. [Configuration & Security](#4-configuration--security)
5. [PowerShell Module Deployment](#5-powershell-module-deployment)
6. [Testing & Validation](#6-testing--validation)
7. [Monitoring & Logging](#7-monitoring--logging)
8. [Backup & Recovery](#8-backup--recovery)
9. [Performance Tuning](#9-performance-tuning)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. PRE-DEPLOYMENT REQUIREMENTS

### 1.1 Infrastructure Assessment Checklist

#### Hardware Requirements (Per Node)
```yaml
Application Servers (3 Nodes Minimum):
  CPU: 16 cores (Intel Xeon E5-2680 v4 or AMD EPYC equivalent)
  Memory: 64 GB DDR4 ECC
  Storage: 
    - OS: 256 GB NVMe SSD
    - Application: 1 TB NVMe SSD
    - Logs: 500 GB SSD
  Network: 2x 10 Gbps Ethernet (redundant)
  IOPS: Minimum 10,000 IOPS sustained

Database Servers (2 Nodes for HA):
  CPU: 32 cores
  Memory: 256 GB DDR4 ECC
  Storage:
    - OS: 256 GB SSD
    - Data: 8 TB NVMe (RAID 10)
    - Logs: 2 TB NVMe (RAID 1)
    - TempDB: 1 TB NVMe (RAID 0)
  Network: 2x 25 Gbps Ethernet + 10 Gbps cluster interconnect
  IOPS: Minimum 50,000 IOPS sustained

PowerShell Execution Farm (3-5 Nodes):
  CPU: 16 cores per node
  Memory: 32 GB per node
  Storage: 500 GB SSD per node
  Network: 10 Gbps Ethernet
  Concurrent Runspaces: 50 per node
```

#### Software Requirements
```yaml
Operating System:
  - Windows Server 2022 Datacenter Edition
  - Latest cumulative updates installed
  - Domain joined with computer accounts created
  
Database Platform:
  - SQL Server 2022 Enterprise Edition
  - SQL Server Management Studio 19.x
  - SQL Server Agent enabled and running
  
.NET Framework:
  - .NET 6.0 Runtime (required)
  - .NET Framework 4.8 (compatibility)
  - ASP.NET Core Runtime 6.0
  
PowerShell Environment:
  - PowerShell 7.3 or later
  - PowerShell ISE (for development/troubleshooting)
  - Execution Policy: RemoteSigned or AllSigned
```

#### Network Requirements
```yaml
Network Segments:
  Management VLAN (10.0.100.0/24):
    - Administrative access
    - Monitoring traffic
    - Backup operations
    
  Application VLAN (10.0.200.0/24):
    - Application server communication
    - User access traffic
    - Load balancer traffic
    
  Database VLAN (10.0.300.0/24):
    - Database cluster traffic
    - Replication traffic
    - Backup traffic
    
  DMZ VLAN (10.0.400.0/24):
    - External API access
    - Certificate services
    - Public-facing components

Required Ports:
  Inbound:
    - 443 (HTTPS) - User access
    - 5985-5986 (WinRM) - PowerShell remoting
    
  Internal:
    - 1433 (SQL Server)
    - 5672 (Message Queue)
    - 6379 (Redis Cache)
    - 9090 (Prometheus)
    - 3000 (Grafana)
    
  Outbound:
    - 443 (Azure/M365 APIs)
    - 53 (DNS)
    - 123 (NTP)
    - 389/636 (LDAP/LDAPS)
```

### 1.2 Security Prerequisites

#### Certificate Requirements
```powershell
# Generate Certificate Signing Request
$CSR = @{
    Subject = "CN=mandadiscovery.company.com,O=Company Inc,L=City,ST=State,C=US"
    KeyAlgorithm = "RSA"
    KeyLength = 4096
    HashAlgorithm = "SHA256"
    CertStoreLocation = "Cert:\LocalMachine\My"
    KeyUsage = @("DigitalSignature", "KeyEncipherment")
    EnhancedKeyUsage = @("Server Authentication", "Client Authentication")
    SubjectAlternativeName = @(
        "DNS:mandadiscovery.company.com",
        "DNS:mandadiscovery-01.company.com",
        "DNS:mandadiscovery-02.company.com",
        "DNS:mandadiscovery-03.company.com"
    )
}

New-SelfSignedCertificate @CSR
```

#### Service Account Creation
```powershell
# Create Service Accounts in Active Directory
Import-Module ActiveDirectory

# Application Service Account
New-ADUser -Name "svc_manda_app" -UserPrincipalName "svc_manda_app@company.com" -Path "OU=Service Accounts,DC=company,DC=com" -AccountPassword (ConvertTo-SecureString "ComplexPassword123!" -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $true -CannotChangePassword $true

# PowerShell Execution Account
New-ADUser -Name "svc_manda_ps" -UserPrincipalName "svc_manda_ps@company.com" -Path "OU=Service Accounts,DC=company,DC=com" -AccountPassword (ConvertTo-SecureString "ComplexPassword456!" -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $true -CannotChangePassword $true

# SQL Server Service Account
New-ADUser -Name "svc_manda_sql" -UserPrincipalName "svc_manda_sql@company.com" -Path "OU=Service Accounts,DC=company,DC=com" -AccountPassword (ConvertTo-SecureString "ComplexPassword789!" -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $true -CannotChangePassword $true

# Grant Service Principal Names
setspn -A HTTP/mandadiscovery.company.com COMPANY\svc_manda_app
setspn -A HTTP/mandadiscovery COMPANY\svc_manda_app
```

#### Firewall Configuration
```powershell
# Windows Firewall Rules
New-NetFirewallRule -DisplayName "M&A Discovery HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Domain,Private
New-NetFirewallRule -DisplayName "M&A Discovery WinRM HTTP" -Direction Inbound -Protocol TCP -LocalPort 5985 -Action Allow -Profile Domain,Private
New-NetFirewallRule -DisplayName "M&A Discovery WinRM HTTPS" -Direction Inbound -Protocol TCP -LocalPort 5986 -Action Allow -Profile Domain,Private
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow -Profile Domain,Private
New-NetFirewallRule -DisplayName "Prometheus" -Direction Inbound -Protocol TCP -LocalPort 9090 -Action Allow -Profile Domain,Private
```

---

## 2. INFRASTRUCTURE SETUP

### 2.1 Database Server Configuration

#### SQL Server Installation
```powershell
# SQL Server 2022 Installation Script
$SQLInstallParams = @{
    Action = "Install"
    Features = "SQLENGINE,FULLTEXT,RS,AS,IS"
    InstanceName = "MSSQLSERVER"
    SQLSvcAccount = "COMPANY\svc_manda_sql"
    SQLSvcPassword = "ComplexPassword789!"
    SQLSysAdminAccounts = @("COMPANY\Domain Admins", "COMPANY\svc_manda_app")
    SQLCollation = "SQL_Latin1_General_CP1_CI_AS"
    InstallSQLDataDir = "D:\MSSQL\Data"
    SQLUserDBLogDir = "L:\MSSQL\Logs"
    SQLTempDBDir = "T:\MSSQL\TempDB"
    SQLBackupDir = "B:\MSSQL\Backup"
    SecurityMode = "SQL"
    SAPwd = "ComplexSAPassword123!"
    TCPEnabled = $true
    NPEnabled = $false
}

# Execute installation (requires SQL Server installation media)
Start-Process -FilePath "\\fileserver\Software\SQL2022\setup.exe" -ArgumentList ($SQLInstallParams | ForEach-Object { "/$($_.Key)=$($_.Value)" }) -Wait
```

#### Database Creation
```sql
-- Create M&A Discovery Database
USE master;
GO

CREATE DATABASE [MandADiscovery]
ON (
    NAME = 'MandADiscovery_Data',
    FILENAME = 'D:\MSSQL\Data\MandADiscovery.mdf',
    SIZE = 10GB,
    MAXSIZE = 100GB,
    FILEGROWTH = 1GB
)
LOG ON (
    NAME = 'MandADiscovery_Log',
    FILENAME = 'L:\MSSQL\Logs\MandADiscovery.ldf',
    SIZE = 1GB,
    MAXSIZE = 10GB,
    FILEGROWTH = 100MB
);
GO

-- Set database options
ALTER DATABASE [MandADiscovery] SET RECOVERY FULL;
ALTER DATABASE [MandADiscovery] SET AUTO_CREATE_STATISTICS ON;
ALTER DATABASE [MandADiscovery] SET AUTO_UPDATE_STATISTICS ON;
ALTER DATABASE [MandADiscovery] SET AUTO_SHRINK OFF;
ALTER DATABASE [MandADiscovery] SET TRUSTWORTHY OFF;
GO

-- Create application user
USE [MandADiscovery];
GO

CREATE LOGIN [COMPANY\svc_manda_app] FROM WINDOWS;
CREATE USER [svc_manda_app] FOR LOGIN [COMPANY\svc_manda_app];
ALTER ROLE db_owner ADD MEMBER [svc_manda_app];
GO
```

#### Always On Availability Groups Setup
```sql
-- Enable Always On Availability Groups
ALTER SERVER CONFIGURATION SET HADR CLUSTER CONTEXT = 'WSFCluster';
GO

-- Create Availability Group
CREATE AVAILABILITY GROUP [AG_MandADiscovery]
    WITH (AUTOMATED_BACKUP_PREFERENCE = SECONDARY)
    FOR DATABASE [MandADiscovery]
    REPLICA ON 
        'SQL01' WITH (
            ENDPOINT_URL = 'TCP://SQL01.company.com:5022',
            AVAILABILITY_MODE = SYNCHRONOUS_COMMIT,
            FAILOVER_MODE = AUTOMATIC,
            BACKUP_PRIORITY = 50,
            SECONDARY_ROLE(ALLOW_CONNECTIONS = ALL)
        ),
        'SQL02' WITH (
            ENDPOINT_URL = 'TCP://SQL02.company.com:5022',
            AVAILABILITY_MODE = SYNCHRONOUS_COMMIT,
            FAILOVER_MODE = AUTOMATIC,
            BACKUP_PRIORITY = 100,
            SECONDARY_ROLE(ALLOW_CONNECTIONS = ALL)
        );
GO

-- Create listener
ALTER AVAILABILITY GROUP [AG_MandADiscovery]
ADD LISTENER 'AG-MandADiscovery' (
    WITH IP ((N'10.0.300.100', N'255.255.255.0')),
    PORT = 1433
);
GO
```

### 2.2 Load Balancer Configuration

#### F5 Configuration (Example)
```tcl
# Create pool for application servers
create ltm pool pool_manda_app {
    members {
        10.0.200.10:443 { }
        10.0.200.11:443 { }
        10.0.200.12:443 { }
    }
    monitor https_443
    load-balancing-mode least-connections-member
    slow-ramp-time 300
}

# Create virtual server
create ltm virtual vs_manda_discovery {
    destination 10.0.400.100:443
    ip-protocol tcp
    pool pool_manda_app
    profiles {
        tcp { }
        http { }
        serverssl-insecure-compatible { context serverside }
        clientssl {
            context clientside
            cert-key-chain {
                default {
                    cert mandadiscovery.company.com
                    key mandadiscovery.company.com
                }
            }
        }
    }
    source-address-translation { type automap }
    persist { cookie }
}

# Health monitor
create ltm monitor https https_443_manda {
    defaults-from https_443
    send "GET /api/health HTTP/1.1\r\nHost: mandadiscovery.company.com\r\nConnection: close\r\n\r\n"
    recv "200 OK"
    interval 10
    timeout 5
}
```

### 2.3 Application Server Configuration

#### IIS Configuration
```powershell
# Install IIS with required features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing, IIS-ASPNET45, IIS-NetFxExtensibility45, IIS-ISAPIExtensions, IIS-ISAPIFilter, IIS-HttpCompressionStatic, IIS-HttpCompressionDynamic, IIS-Security, IIS-RequestFiltering, IIS-BasicAuthentication, IIS-WindowsAuthentication, IIS-DigestAuthentication, IIS-ClientCertificateMappingAuthentication, IIS-IISCertificateMappingAuthentication, IIS-URLAuthorization, IIS-IPSecurity, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-ManagementScriptingTools, IIS-ManagementService

# Configure application pool
Import-Module WebAdministration
New-WebAppPool -Name "MandADiscoveryPool" -Force
Set-ItemProperty -Path "IIS:\AppPools\MandADiscoveryPool" -Name processModel.identityType -Value SpecificUser
Set-ItemProperty -Path "IIS:\AppPools\MandADiscoveryPool" -Name processModel.userName -Value "COMPANY\svc_manda_app"
Set-ItemProperty -Path "IIS:\AppPools\MandADiscoveryPool" -Name processModel.password -Value "ComplexPassword123!"
Set-ItemProperty -Path "IIS:\AppPools\MandADiscoveryPool" -Name recycling.periodicRestart.time -Value "00:00:00"
Set-ItemProperty -Path "IIS:\AppPools\MandADiscoveryPool" -Name cpu.limit -Value 0
Set-ItemProperty -Path "IIS:\AppPools\MandADiscoveryPool" -Name processModel.maxProcesses -Value 4

# Create website
New-Website -Name "MandADiscovery" -PhysicalPath "C:\inetpub\wwwroot\MandADiscovery" -Port 443 -Protocol https -ApplicationPool "MandADiscoveryPool"
```

---

## 3. APPLICATION INSTALLATION

### 3.1 Installation Package Structure

```
MandADiscoverySuite-Enterprise-v1.0.0.msi
├── Prerequisites/
│   ├── dotnet-runtime-6.0.25-win-x64.exe
│   ├── PowerShell-7.3.9-win-x64.msi
│   ├── VC_redist.x64.exe
│   └── SQLSysClrTypes.msi
├── Application/
│   ├── MandADiscoverySuite.exe
│   ├── MandADiscoverySuite.dll
│   ├── appsettings.json
│   ├── appsettings.Production.json
│   ├── web.config
│   └── Dependencies/ [175 DLL files]
├── Modules/ [85 PowerShell modules]
├── Configuration/ [JSON configuration files]
├── Database/ [SQL scripts]
├── Documentation/ [PDF guides]
└── Tools/ [Deployment scripts]
```

### 3.2 Automated Installation Script

```powershell
# M&A Discovery Suite Installation Script
param(
    [Parameter(Mandatory=$true)]
    [string]$InstallPath = "C:\Program Files\MandADiscoverySuite",
    
    [Parameter(Mandatory=$true)]
    [string]$DatabaseServer = "AG-MandADiscovery.company.com",
    
    [Parameter(Mandatory=$true)]
    [PSCredential]$ServiceAccountCredential,
    
    [string]$CertificateThumbprint,
    [string]$ConfigurationProfile = "Production"
)

# Set error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Timestamp] [$Level] $Message" -ForegroundColor $(
        switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "INFO" { "Green" }
            default { "White" }
        }
    )
}

Write-Log "Starting M&A Discovery Suite installation"

# 1. Validate Prerequisites
Write-Log "Validating prerequisites..."
$Prerequisites = @{
    ".NET 6 Runtime" = { Get-ChildItem "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP" -Recurse | Get-ItemProperty -Name version -EA 0 | Where-Object { $_.PSChildName -match '^v6.0' } }
    "PowerShell 7" = { Get-Command pwsh.exe -ErrorAction SilentlyContinue }
    "SQL Server Access" = { Test-NetConnection -ComputerName $DatabaseServer.Split('.')[0] -Port 1433 }
    "Certificate" = { if ($CertificateThumbprint) { Get-ChildItem Cert:\LocalMachine\My | Where-Object Thumbprint -eq $CertificateThumbprint } else { $true } }
}

foreach ($Prereq in $Prerequisites.GetEnumerator()) {
    $Result = & $Prereq.Value
    if (-not $Result) {
        Write-Log "Prerequisites check failed: $($Prereq.Key)" "ERROR"
        exit 1
    }
    Write-Log "Prerequisites check passed: $($Prereq.Key)"
}

# 2. Create installation directory
Write-Log "Creating installation directory: $InstallPath"
New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallPath\Logs" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallPath\Temp" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallPath\Configuration" -Force | Out-Null

# 3. Install application files
Write-Log "Installing application files..."
$SourcePath = Split-Path $MyInvocation.MyCommand.Path
robocopy "$SourcePath\Application" $InstallPath /E /XO /R:3 /W:5 /LOG+:$env:TEMP\MandAInstall.log

# 4. Install PowerShell modules
Write-Log "Installing PowerShell modules..."
$ModulePath = "$InstallPath\Modules"
robocopy "$SourcePath\Modules" $ModulePath /E /XO /R:3 /W:5

# Add to PSModulePath
$CurrentPath = [Environment]::GetEnvironmentVariable("PSModulePath", "Machine")
if ($CurrentPath -notlike "*$ModulePath*") {
    $NewPath = "$CurrentPath;$ModulePath"
    [Environment]::SetEnvironmentVariable("PSModulePath", $NewPath, "Machine")
}

# 5. Configure application settings
Write-Log "Configuring application settings..."
$AppSettings = Get-Content "$InstallPath\appsettings.$ConfigurationProfile.json" | ConvertFrom-Json

# Update connection string
$AppSettings.ConnectionStrings.DefaultConnection = "Server=$DatabaseServer;Database=MandADiscovery;Integrated Security=true;MultipleActiveResultSets=true;Application Name=MandADiscoverySuite;Connection Timeout=30;Command Timeout=300;"

# Update service account
$AppSettings.ServiceAccount = @{
    Username = $ServiceAccountCredential.UserName
    Domain = $env:USERDOMAIN
}

# Save configuration
$AppSettings | ConvertTo-Json -Depth 10 | Set-Content "$InstallPath\appsettings.$ConfigurationProfile.json"

# 6. Install Windows Service
Write-Log "Installing Windows Service..."
$ServiceParams = @{
    Name = "MandADiscoveryService"
    DisplayName = "M&A Discovery Suite"
    Description = "Enterprise M&A Discovery and Migration Platform"
    BinaryPathName = "`"$InstallPath\MandADiscoverySuite.exe`" --service"
    StartupType = "Automatic"
    Credential = $ServiceAccountCredential
}

New-Service @ServiceParams

# Set service recovery options
sc.exe failure MandADiscoveryService reset=86400 actions=restart/5000/restart/10000/restart/30000

# 7. Configure logging
Write-Log "Configuring logging..."
$LogConfig = @"
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <targets>
    <target xsi:type="File" name="logfile"
            fileName="$InstallPath\Logs\manda-discovery-\${shortdate}.log"
            layout="\${longdate} [\${level:uppercase=true}] \${logger} - \${message} \${exception:format=tostring}"
            maxArchiveFiles="30"
            archiveEvery="Day" />
  </targets>
  <rules>
    <logger name="*" minlevel="Info" writeTo="logfile" />
  </rules>
</nlog>
"@
$LogConfig | Set-Content "$InstallPath\nlog.config"

# 8. Set permissions
Write-Log "Setting file system permissions..."
icacls $InstallPath /grant "$($ServiceAccountCredential.UserName):(OI)(CI)F" /T
icacls "$InstallPath\Logs" /grant "Users:(OI)(CI)F"
icacls "$InstallPath\Temp" /grant "Users:(OI)(CI)F"

# 9. Configure certificate binding (if applicable)
if ($CertificateThumbprint) {
    Write-Log "Configuring SSL certificate binding..."
    netsh http add sslcert ipport=0.0.0.0:443 certhash=$CertificateThumbprint appid='{12345678-1234-1234-1234-123456789012}'
}

# 10. Start services
Write-Log "Starting services..."
Start-Service -Name "MandADiscoveryService"

# Wait for service to start
$Timeout = 60
$Timer = 0
do {
    Start-Sleep -Seconds 2
    $Timer += 2
    $ServiceStatus = Get-Service -Name "MandADiscoveryService"
} while ($ServiceStatus.Status -ne "Running" -and $Timer -lt $Timeout)

if ($ServiceStatus.Status -eq "Running") {
    Write-Log "Installation completed successfully!"
    Write-Log "Service Status: $($ServiceStatus.Status)"
    Write-Log "Application URL: https://$(hostname)/MandADiscovery"
} else {
    Write-Log "Installation completed but service failed to start" "ERROR"
    exit 1
}

# 11. Validation tests
Write-Log "Running validation tests..."
try {
    # Test database connectivity
    $ConnectionString = $AppSettings.ConnectionStrings.DefaultConnection
    $Connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $Connection.Open()
    $Connection.Close()
    Write-Log "Database connectivity: PASS"
    
    # Test HTTP endpoint
    $Response = Invoke-WebRequest -Uri "https://localhost/api/health" -UseBasicParsing
    if ($Response.StatusCode -eq 200) {
        Write-Log "HTTP endpoint test: PASS"
    }
    
    # Test PowerShell modules
    Import-Module "$ModulePath\Migration\UserMigration.psm1" -Force
    Write-Log "PowerShell modules: PASS"
    
} catch {
    Write-Log "Validation test failed: $($_.Exception.Message)" "WARN"
}

Write-Log "M&A Discovery Suite installation completed successfully!"
```

### 3.3 Database Schema Deployment

```sql
-- Database Schema Creation Script
USE [MandADiscovery];
GO

-- Create schemas
CREATE SCHEMA [Migration] AUTHORIZATION [dbo];
CREATE SCHEMA [Discovery] AUTHORIZATION [dbo];
CREATE SCHEMA [Audit] AUTHORIZATION [dbo];
GO

-- Migration tracking tables
CREATE TABLE [Migration].[Projects] (
    [ProjectId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ProjectName] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX),
    [StartDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [EndDate] DATETIME2 NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Planning',
    [CreatedBy] NVARCHAR(255) NOT NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [ModifiedBy] NVARCHAR(255) NULL,
    [ModifiedDate] DATETIME2 NULL
);

CREATE TABLE [Migration].[Waves] (
    [WaveId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ProjectId] UNIQUEIDENTIFIER NOT NULL REFERENCES [Migration].[Projects]([ProjectId]),
    [WaveName] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX),
    [ScheduledStart] DATETIME2 NOT NULL,
    [ScheduledEnd] DATETIME2 NOT NULL,
    [ActualStart] DATETIME2 NULL,
    [ActualEnd] DATETIME2 NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [Priority] INT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE [Migration].[Items] (
    [ItemId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [WaveId] UNIQUEIDENTIFIER NOT NULL REFERENCES [Migration].[Waves]([WaveId]),
    [ItemType] NVARCHAR(50) NOT NULL, -- User, Mailbox, SharePoint, etc.
    [SourceId] NVARCHAR(255) NOT NULL, -- Source identifier
    [TargetId] NVARCHAR(255) NULL, -- Target identifier
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [Progress] DECIMAL(5,2) NOT NULL DEFAULT 0,
    [StartTime] DATETIME2 NULL,
    [EndTime] DATETIME2 NULL,
    [ErrorMessage] NVARCHAR(MAX) NULL,
    [Metadata] NVARCHAR(MAX) NULL, -- JSON data
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Discovery data tables
CREATE TABLE [Discovery].[Environments] (
    [EnvironmentId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [EnvironmentName] NVARCHAR(255) NOT NULL,
    [Type] NVARCHAR(50) NOT NULL, -- Source, Target
    [Platform] NVARCHAR(50) NOT NULL, -- OnPremises, Azure, Hybrid
    [ConnectionString] NVARCHAR(MAX) NULL,
    [Credentials] VARBINARY(MAX) NULL, -- Encrypted
    [LastDiscovery] DATETIME2 NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Active',
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE [Discovery].[Objects] (
    [ObjectId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [EnvironmentId] UNIQUEIDENTIFIER NOT NULL REFERENCES [Discovery].[Environments]([EnvironmentId]),
    [ObjectType] NVARCHAR(50) NOT NULL,
    [ObjectName] NVARCHAR(255) NOT NULL,
    [DisplayName] NVARCHAR(255) NULL,
    [ObjectPath] NVARCHAR(1000) NULL,
    [Properties] NVARCHAR(MAX) NULL, -- JSON data
    [LastDiscovered] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    [Hash] VARBINARY(64) NOT NULL -- For change detection
);

-- Audit tables
CREATE TABLE [Audit].[ActivityLog] (
    [LogId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [Timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UserId] NVARCHAR(255) NOT NULL,
    [Activity] NVARCHAR(100) NOT NULL,
    [ObjectType] NVARCHAR(50) NULL,
    [ObjectId] NVARCHAR(255) NULL,
    [Details] NVARCHAR(MAX) NULL,
    [IpAddress] NVARCHAR(45) NULL,
    [UserAgent] NVARCHAR(500) NULL
);

CREATE TABLE [Audit].[ChangeLog] (
    [ChangeId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [Timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [TableName] NVARCHAR(128) NOT NULL,
    [RecordId] NVARCHAR(255) NOT NULL,
    [Operation] NVARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    [OldValues] NVARCHAR(MAX) NULL,
    [NewValues] NVARCHAR(MAX) NULL,
    [ChangedBy] NVARCHAR(255) NOT NULL
);

-- Indexes for performance
CREATE NONCLUSTERED INDEX IX_Migration_Items_Status ON [Migration].[Items] ([Status], [ItemType]) INCLUDE ([Progress], [StartTime]);
CREATE NONCLUSTERED INDEX IX_Migration_Items_Wave ON [Migration].[Items] ([WaveId], [Status]);
CREATE NONCLUSTERED INDEX IX_Discovery_Objects_Environment ON [Discovery].[Objects] ([EnvironmentId], [ObjectType]) INCLUDE ([ObjectName], [LastDiscovered]);
CREATE NONCLUSTERED INDEX IX_Discovery_Objects_Name ON [Discovery].[Objects] ([ObjectName], [ObjectType]);
CREATE NONCLUSTERED INDEX IX_Audit_ActivityLog_User ON [Audit].[ActivityLog] ([UserId], [Timestamp] DESC);
CREATE NONCLUSTERED INDEX IX_Audit_ActivityLog_Activity ON [Audit].[ActivityLog] ([Activity], [Timestamp] DESC);

-- Stored procedures
GO
CREATE PROCEDURE [Migration].[GetMigrationStatus]
    @ProjectId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.ProjectName,
        w.WaveName,
        w.Status as WaveStatus,
        COUNT(i.ItemId) as TotalItems,
        COUNT(CASE WHEN i.Status = 'Completed' THEN 1 END) as CompletedItems,
        COUNT(CASE WHEN i.Status = 'Failed' THEN 1 END) as FailedItems,
        COUNT(CASE WHEN i.Status = 'InProgress' THEN 1 END) as InProgressItems,
        AVG(i.Progress) as OverallProgress,
        MIN(i.StartTime) as EarliestStart,
        MAX(i.EndTime) as LatestEnd
    FROM [Migration].[Projects] p
    LEFT JOIN [Migration].[Waves] w ON p.ProjectId = w.ProjectId
    LEFT JOIN [Migration].[Items] i ON w.WaveId = i.WaveId
    WHERE (@ProjectId IS NULL OR p.ProjectId = @ProjectId)
    GROUP BY p.ProjectId, p.ProjectName, w.WaveId, w.WaveName, w.Status
    ORDER BY p.ProjectName, w.WaveName;
END
GO

CREATE PROCEDURE [Discovery].[UpsertDiscoveryObject]
    @EnvironmentId UNIQUEIDENTIFIER,
    @ObjectType NVARCHAR(50),
    @ObjectName NVARCHAR(255),
    @DisplayName NVARCHAR(255),
    @ObjectPath NVARCHAR(1000),
    @Properties NVARCHAR(MAX),
    @Hash VARBINARY(64)
AS
BEGIN
    SET NOCOUNT ON;
    
    MERGE [Discovery].[Objects] AS target
    USING (SELECT @EnvironmentId as EnvironmentId, @ObjectType as ObjectType, @ObjectName as ObjectName) AS source
    ON (target.EnvironmentId = source.EnvironmentId AND target.ObjectType = source.ObjectType AND target.ObjectName = source.ObjectName)
    WHEN MATCHED AND target.Hash != @Hash THEN
        UPDATE SET 
            DisplayName = @DisplayName,
            ObjectPath = @ObjectPath,
            Properties = @Properties,
            LastDiscovered = GETUTCDATE(),
            Hash = @Hash,
            IsDeleted = 0
    WHEN NOT MATCHED THEN
        INSERT (EnvironmentId, ObjectType, ObjectName, DisplayName, ObjectPath, Properties, Hash, LastDiscovered)
        VALUES (@EnvironmentId, @ObjectType, @ObjectName, @DisplayName, @ObjectPath, @Properties, @Hash, GETUTCDATE());
END
GO

-- Create default project
INSERT INTO [Migration].[Projects] (ProjectName, Description, CreatedBy)
VALUES ('Default Project', 'Default migration project for initial setup', 'SYSTEM');

PRINT 'Database schema created successfully';
```

---

## 4. CONFIGURATION & SECURITY

### 4.1 Application Configuration

#### appsettings.Production.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information",
      "MandADiscoverySuite": "Debug"
    },
    "NLog": {
      "IncludeScopes": true,
      "ParseMessageTemplates": true
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=AG-MandADiscovery.company.com;Database=MandADiscovery;Integrated Security=true;MultipleActiveResultSets=true;Application Name=MandADiscoverySuite;Connection Timeout=30;Command Timeout=300;",
    "Redis": "redis-cluster.company.com:6379,abortConnect=false",
    "MessageQueue": "amqp://guest:guest@rabbitmq.company.com:5672/"
  },
  "Authentication": {
    "Type": "Windows",
    "Domain": "COMPANY",
    "RequireHttps": true,
    "SlidingExpiration": "00:15:00",
    "RequireMultiFactorAuthentication": false
  },
  "Authorization": {
    "AdminGroups": [
      "COMPANY\\M&A Discovery Admins",
      "COMPANY\\IT Administrators"
    ],
    "UserGroups": [
      "COMPANY\\M&A Discovery Users",
      "COMPANY\\Domain Users"
    ],
    "ReadOnlyGroups": [
      "COMPANY\\M&A Discovery Readers"
    ]
  },
  "PowerShell": {
    "ExecutionPolicy": "RemoteSigned",
    "ModulePath": "C:\\Program Files\\MandADiscoverySuite\\Modules",
    "MaxConcurrentJobs": 50,
    "JobTimeout": "01:00:00",
    "RunspacePoolSize": 20,
    "ExecutionMode": "Farm",
    "FarmNodes": [
      "ps-runner-01.company.com",
      "ps-runner-02.company.com",
      "ps-runner-03.company.com"
    ]
  },
  "Monitoring": {
    "Enabled": true,
    "PrometheusPort": 9090,
    "HealthCheckInterval": "00:01:00",
    "MetricsRetention": "30.00:00:00",
    "DetailedMetrics": true
  },
  "Cache": {
    "Type": "Redis",
    "DefaultExpiration": "01:00:00",
    "SlidingExpiration": true,
    "MaxMemoryUsage": 1024
  },
  "FileSystem": {
    "DataPath": "\\\\fileserver\\MandAData",
    "LogPath": "C:\\ProgramData\\MandADiscoverySuite\\Logs",
    "TempPath": "C:\\ProgramData\\MandADiscoverySuite\\Temp",
    "ArchivePath": "\\\\backup-server\\MandAArchive"
  },
  "Security": {
    "EncryptionKey": "base64-encoded-key",
    "HashSalt": "base64-encoded-salt",
    "AuditEnabled": true,
    "SessionTimeout": "08:00:00",
    "MaxFailedAttempts": 5,
    "LockoutDuration": "00:30:00"
  },
  "Integration": {
    "Azure": {
      "TenantId": "tenant-guid",
      "ClientId": "client-guid",
      "KeyVaultUrl": "https://keyvault.vault.azure.net/"
    },
    "Exchange": {
      "OnPremisesUrl": "https://exchange.company.com/PowerShell",
      "OnlineUrl": "https://outlook.office365.com/powershell-liveid/"
    },
    "SharePoint": {
      "OnPremisesUrl": "https://sharepoint.company.com",
      "OnlineUrl": "https://tenant.sharepoint.com"
    }
  },
  "Performance": {
    "MaxDegreeOfParallelism": 8,
    "BatchSize": 1000,
    "ConnectionPoolSize": 100,
    "CommandTimeout": 300,
    "QueryTimeout": 600,
    "EnableQueryPlan": false
  }
}
```

### 4.2 Security Hardening

#### Group Policy Configuration
```powershell
# Apply security baseline using PowerShell DSC
Configuration MandASecurityBaseline {
    param(
        [string[]]$ComputerNames
    )
    
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -ModuleName SecurityPolicyDsc
    Import-DscResource -ModuleName AuditPolicyDsc
    
    Node $ComputerNames {
        # Password Policy
        SecurityOption 'PasswordPolicy' {
            Name = 'Minimum_Password_Length'
            Minimum_Password_Length = 12
        }
        
        SecurityOption 'AccountLockout' {
            Name = 'Account_lockout_threshold'
            Account_lockout_threshold = 5
        }
        
        # Audit Policy
        AuditPolicySubcategory 'AuditLogonEvents' {
            Name = 'Logon'
            AuditFlag = 'Success'
            Ensure = 'Present'
        }
        
        AuditPolicySubcategory 'AuditAccountLogonEvents' {
            Name = 'Account Logon'
            AuditFlag = 'Success'
            Ensure = 'Present'
        }
        
        AuditPolicySubcategory 'AuditObjectAccess' {
            Name = 'File System'
            AuditFlag = 'Failure'
            Ensure = 'Present'
        }
        
        # Windows Firewall
        WindowsFeature 'WindowsFirewall' {
            Name = 'Windows-Defender-Firewall'
            Ensure = 'Present'
        }
        
        # Windows Defender
        WindowsFeature 'WindowsDefender' {
            Name = 'Windows-Defender'
            Ensure = 'Present'
        }
        
        # Disable unnecessary services
        Service 'Telnet' {
            Name = 'TlntSvr'
            State = 'Stopped'
            StartupType = 'Disabled'
        }
        
        Service 'RemoteRegistry' {
            Name = 'RemoteRegistry'
            State = 'Stopped'
            StartupType = 'Disabled'
        }
        
        # Registry settings
        Registry 'DisableAutoAdminLogon' {
            Key = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
            ValueName = 'AutoAdminLogon'
            ValueData = '0'
            ValueType = 'String'
        }
        
        Registry 'EnableCredentialGuard' {
            Key = 'HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard'
            ValueName = 'EnableVirtualizationBasedSecurity'
            ValueData = 1
            ValueType = 'Dword'
        }
        
        # File system permissions
        File 'RestrictAccessToSensitiveFolders' {
            DestinationPath = 'C:\Program Files\MandADiscoverySuite'
            Type = 'Directory'
            Ensure = 'Present'
            Force = $true
        }
    }
}

# Apply configuration
$ComputerNames = @('APP01', 'APP02', 'APP03', 'SQL01', 'SQL02')
MandASecurityBaseline -ComputerNames $ComputerNames -OutputPath C:\DSC\MandASecurity
Start-DscConfiguration -Path C:\DSC\MandASecurity -Wait -Verbose
```

### 4.3 SSL/TLS Configuration

#### Certificate Management
```powershell
# Import certificate and configure bindings
param(
    [string]$CertificatePath = "\\fileserver\certificates\mandadiscovery.company.com.pfx",
    [SecureString]$CertificatePassword,
    [string[]]$ServerNames = @('APP01', 'APP02', 'APP03')
)

foreach ($ServerName in $ServerNames) {
    Invoke-Command -ComputerName $ServerName -ScriptBlock {
        param($CertPath, $CertPassword)
        
        # Import certificate
        $Certificate = Import-PfxCertificate -FilePath $CertPath -CertStoreLocation Cert:\LocalMachine\My -Password $CertPassword
        
        # Configure IIS binding
        Import-Module WebAdministration
        New-WebBinding -Name "MandADiscovery" -IPAddress "*" -Port 443 -Protocol https
        
        # Add certificate to binding
        $Binding = Get-WebBinding -Name "MandADiscovery" -Protocol https
        $Binding.AddSslCertificate($Certificate.Thumbprint, "my")
        
        # Configure HTTP to HTTPS redirect
        Add-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST/MandADiscovery" -Filter "system.webServer/rewrite/rules" -Name "." -Value @{
            name = 'HTTP to HTTPS Redirect'
            patternSyntax = 'Wildcard'
            stopProcessing = 'True'
        }
        
        Set-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST/MandADiscovery" -Filter "system.webServer/rewrite/rules/rule[@name='HTTP to HTTPS Redirect']/match" -Name "url" -Value "*"
        
        Add-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST/MandADiscovery" -Filter "system.webServer/rewrite/rules/rule[@name='HTTP to HTTPS Redirect']/conditions" -Name "." -Value @{
            input = '{HTTPS}'
            pattern = 'off'
            ignoreCase = 'true'
        }
        
        Set-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST/MandADiscovery" -Filter "system.webServer/rewrite/rules/rule[@name='HTTP to HTTPS Redirect']/action" -Name "type" -Value "Redirect"
        Set-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST/MandADiscovery" -Filter "system.webServer/rewrite/rules/rule[@name='HTTP to HTTPS Redirect']/action" -Name "url" -Value "https://{HTTP_HOST}/{R:1}"
        Set-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST/MandADiscovery" -Filter "system.webServer/rewrite/rules/rule[@name='HTTP to HTTPS Redirect']/action" -Name "redirectType" -Value "Permanent"
        
    } -ArgumentList $CertificatePath, $CertificatePassword
}

Write-Host "Certificate configuration completed successfully"
```

---

## 5. POWERSHELL MODULE DEPLOYMENT

### 5.1 Module Installation Script

```powershell
# PowerShell Module Deployment Script
param(
    [string]$ModuleSourcePath = "\\fileserver\MandAModules",
    [string[]]$TargetServers = @('APP01', 'APP02', 'APP03', 'PS01', 'PS02', 'PS03'),
    [string]$ModulePath = "C:\Program Files\WindowsPowerShell\Modules"
)

$ErrorActionPreference = "Stop"

function Install-MandAModules {
    param(
        [string]$ComputerName,
        [string]$SourcePath,
        [string]$DestinationPath
    )
    
    Write-Host "Installing modules on $ComputerName..."
    
    Invoke-Command -ComputerName $ComputerName -ScriptBlock {
        param($Source, $Destination)
        
        # Create module directory structure
        $ModuleCategories = @('Migration', 'Discovery', 'Authentication', 'Utilities', 'Security')
        foreach ($Category in $ModuleCategories) {
            $CategoryPath = Join-Path $Destination $Category
            New-Item -ItemType Directory -Path $CategoryPath -Force | Out-Null
        }
        
        # Copy modules
        robocopy $Source $Destination /E /XO /R:3 /W:5 /LOG+:$env:TEMP\ModuleInstall.log
        
        # Update PSModulePath
        $CurrentPath = [Environment]::GetEnvironmentVariable("PSModulePath", "Machine")
        if ($CurrentPath -notlike "*$Destination*") {
            $NewPath = "$Destination;$CurrentPath"
            [Environment]::SetEnvironmentVariable("PSModulePath", $NewPath, "Machine")
        }
        
        # Test module loading
        $TestModules = @(
            "Migration\UserMigration",
            "Migration\MailboxMigration", 
            "Migration\SharePointMigration",
            "Discovery\ActiveDirectoryDiscovery",
            "Authentication\AuthenticationService"
        )
        
        foreach ($Module in $TestModules) {
            try {
                Import-Module $Module -Force -ErrorAction Stop
                Write-Host "Successfully imported module: $Module"
                Remove-Module $Module -ErrorAction SilentlyContinue
            } catch {
                Write-Warning "Failed to import module $Module : $($_.Exception.Message)"
            }
        }
        
    } -ArgumentList $SourcePath, $DestinationPath
}

# Install modules on all target servers
foreach ($Server in $TargetServers) {
    try {
        Install-MandAModules -ComputerName $Server -SourcePath $ModuleSourcePath -DestinationPath $ModulePath
        Write-Host "Module installation completed on $Server" -ForegroundColor Green
    } catch {
        Write-Error "Module installation failed on $Server : $($_.Exception.Message)"
    }
}

Write-Host "PowerShell module deployment completed!"
```

### 5.2 Module Configuration

#### Authentication Module Setup
```powershell
# Configure Authentication Module
Import-Module Authentication\AuthenticationService -Force

# Set up service principal authentication
$ServicePrincipalConfig = @{
    TenantId = "your-tenant-id"
    ClientId = "your-client-id"
    CertificateThumbprint = "certificate-thumbprint"
    KeyVaultUrl = "https://your-keyvault.vault.azure.net/"
}

Set-AuthenticationConfiguration -Configuration $ServicePrincipalConfig

# Test authentication
Test-Authentication -Type "AzureAD" -Verbose

# Configure on-premises authentication
$OnPremConfig = @{
    Domain = "COMPANY"
    ExchangeServer = "exchange.company.com"
    SharePointServer = "sharepoint.company.com"
    DomainController = "dc01.company.com"
}

Set-OnPremisesConfiguration -Configuration $OnPremConfig
```

#### Migration Module Configuration
```powershell
# Configure Migration Modules
$MigrationConfig = @{
    DefaultBatchSize = 100
    MaxRetryAttempts = 3
    RetryDelaySeconds = 30
    LogLevel = "Information"
    ParallelThreads = 10
    DatabaseConnection = "Server=AG-MandADiscovery.company.com;Database=MandADiscovery;Integrated Security=true;"
}

# Apply to all migration modules
$MigrationModules = @(
    "Migration\UserMigration",
    "Migration\MailboxMigration",
    "Migration\SharePointMigration", 
    "Migration\FileSystemMigration",
    "Migration\UserProfileMigration"
)

foreach ($Module in $MigrationModules) {
    Import-Module $Module -Force
    Set-MigrationConfiguration -Configuration $MigrationConfig
}
```

---

## 6. TESTING & VALIDATION

### 6.1 System Integration Tests

```powershell
# System Integration Test Suite
param(
    [string]$ApplicationUrl = "https://mandadiscovery.company.com",
    [string]$DatabaseServer = "AG-MandADiscovery.company.com",
    [string]$TestDataPath = "C:\MandATests\TestData"
)

$TestResults = @()

function Test-Component {
    param(
        [string]$ComponentName,
        [scriptblock]$TestScript
    )
    
    $StartTime = Get-Date
    try {
        & $TestScript
        $Status = "PASS"
        $ErrorMessage = $null
    } catch {
        $Status = "FAIL"
        $ErrorMessage = $_.Exception.Message
    }
    $EndTime = Get-Date
    $Duration = ($EndTime - $StartTime).TotalSeconds
    
    $TestResults += [PSCustomObject]@{
        Component = $ComponentName
        Status = $Status
        Duration = $Duration
        Error = $ErrorMessage
        Timestamp = $StartTime
    }
    
    Write-Host "[$Status] $ComponentName - $Duration seconds" -ForegroundColor $(if($Status -eq "PASS") {"Green"} else {"Red"})
}

Write-Host "Starting M&A Discovery Suite Integration Tests..." -ForegroundColor Yellow

# Test 1: Database Connectivity
Test-Component "Database Connectivity" {
    $ConnectionString = "Server=$DatabaseServer;Database=MandADiscovery;Integrated Security=true;Connection Timeout=10;"
    $Connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $Connection.Open()
    $Command = $Connection.CreateCommand()
    $Command.CommandText = "SELECT COUNT(*) FROM sys.tables"
    $Result = $Command.ExecuteScalar()
    $Connection.Close()
    if ($Result -lt 10) { throw "Insufficient database tables found" }
}

# Test 2: Web Application Health
Test-Component "Web Application Health" {
    $Response = Invoke-WebRequest -Uri "$ApplicationUrl/api/health" -UseBasicParsing
    if ($Response.StatusCode -ne 200) { throw "Health check failed" }
    $HealthData = $Response.Content | ConvertFrom-Json
    if ($HealthData.Status -ne "Healthy") { throw "Application not healthy: $($HealthData.Status)" }
}

# Test 3: Authentication
Test-Component "Authentication" {
    $Response = Invoke-WebRequest -Uri "$ApplicationUrl/api/auth/test" -UseDefaultCredentials
    if ($Response.StatusCode -ne 200) { throw "Authentication test failed" }
}

# Test 4: PowerShell Module Loading
Test-Component "PowerShell Modules" {
    $RequiredModules = @(
        "Migration\UserMigration",
        "Migration\MailboxMigration",
        "Discovery\ActiveDirectoryDiscovery",
        "Authentication\AuthenticationService"
    )
    
    foreach ($Module in $RequiredModules) {
        Import-Module $Module -Force -ErrorAction Stop
        $Commands = Get-Command -Module (Split-Path $Module -Leaf)
        if ($Commands.Count -eq 0) { throw "No commands found in module $Module" }
    }
}

# Test 5: File System Access
Test-Component "File System Access" {
    $TestFile = "$TestDataPath\test.txt"
    "Test data" | Out-File -FilePath $TestFile
    if (-not (Test-Path $TestFile)) { throw "Cannot write test file" }
    $Content = Get-Content $TestFile
    if ($Content -ne "Test data") { throw "Cannot read test file" }
    Remove-Item $TestFile -Force
}

# Test 6: PowerShell Execution Service
Test-Component "PowerShell Execution" {
    $TestScript = {
        param($TestParam)
        return "Test completed: $TestParam"
    }
    
    $Job = Start-Job -ScriptBlock $TestScript -ArgumentList "Integration Test"
    $Result = Wait-Job $Job | Receive-Job
    Remove-Job $Job
    
    if ($Result -ne "Test completed: Integration Test") { throw "PowerShell execution failed" }
}

# Test 7: Migration Simulation
Test-Component "Migration Simulation" {
    # Create test user data
    $TestUsers = @(
        @{ Name = "Test User 1"; Email = "test1@company.com"; Department = "IT" },
        @{ Name = "Test User 2"; Email = "test2@company.com"; Department = "HR" }
    )
    
    # Simulate user migration
    Import-Module Migration\UserMigration -Force
    $MigrationResult = Start-UserMigrationSimulation -Users $TestUsers -WhatIf
    
    if ($MigrationResult.Status -ne "Success") { throw "Migration simulation failed" }
}

# Test 8: Monitoring Endpoints
Test-Component "Monitoring Endpoints" {
    $MetricsUrl = "$ApplicationUrl/metrics"
    $Response = Invoke-WebRequest -Uri $MetricsUrl -UseBasicParsing
    if ($Response.StatusCode -ne 200) { throw "Metrics endpoint not accessible" }
    if ($Response.Content -notlike "*manda_discovery_*") { throw "No application metrics found" }
}

# Test 9: Logging System
Test-Component "Logging System" {
    $LogPath = "C:\ProgramData\MandADiscoverySuite\Logs"
    if (-not (Test-Path $LogPath)) { throw "Log directory not found" }
    
    $LogFiles = Get-ChildItem $LogPath -Filter "*.log" | Sort-Object LastWriteTime -Descending
    if ($LogFiles.Count -eq 0) { throw "No log files found" }
    
    $LatestLog = $LogFiles[0]
    if ($LatestLog.LastWriteTime -lt (Get-Date).AddMinutes(-10)) { 
        throw "Log files not recent enough"
    }
}

# Test 10: Security Configuration
Test-Component "Security Configuration" {
    # Test SSL/TLS configuration
    $TlsTest = Test-NetConnection -ComputerName ([System.Uri]$ApplicationUrl).Host -Port 443
    if (-not $TlsTest.TcpTestSucceeded) { throw "HTTPS port not accessible" }
    
    # Test certificate
    $Certificate = Invoke-WebRequest -Uri $ApplicationUrl -UseBasicParsing | Select-Object -ExpandProperty BaseResponse | Select-Object -ExpandProperty ServicePoint | Select-Object -ExpandProperty Certificate
    if ($Certificate.GetExpirationDateString() -lt (Get-Date).AddDays(30)) { 
        throw "Certificate expires within 30 days" 
    }
}

# Generate test report
$TestSummary = $TestResults | Group-Object Status | ForEach-Object {
    [PSCustomObject]@{
        Status = $_.Name
        Count = $_.Count
        Tests = ($_.Group | ForEach-Object { $_.Component }) -join ", "
    }
}

Write-Host "`nTest Summary:" -ForegroundColor Yellow
$TestSummary | Format-Table -AutoSize

$TotalTests = $TestResults.Count
$PassedTests = ($TestResults | Where-Object Status -eq "PASS").Count
$FailedTests = ($TestResults | Where-Object Status -eq "FAIL").Count
$OverallResult = if ($FailedTests -eq 0) { "PASS" } else { "FAIL" }

Write-Host "Overall Result: $OverallResult ($PassedTests/$TotalTests tests passed)" -ForegroundColor $(if($OverallResult -eq "PASS") {"Green"} else {"Red"})

# Export detailed results
$TestResults | Export-Csv -Path "C:\MandATests\TestResults_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv" -NoTypeInformation

if ($FailedTests -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $TestResults | Where-Object Status -eq "FAIL" | Format-Table Component, Error -Wrap
    exit 1
}
```

### 6.2 Performance Baseline Testing

```powershell
# Performance Baseline Test Suite
param(
    [string]$ApplicationUrl = "https://mandadiscovery.company.com",
    [int]$TestDuration = 300, # 5 minutes
    [int]$ConcurrentUsers = 10,
    [string]$OutputPath = "C:\MandATests\Performance"
)

New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null

function Start-PerformanceTest {
    param(
        [string]$TestName,
        [string]$Url,
        [int]$Duration,
        [int]$Threads
    )
    
    Write-Host "Starting performance test: $TestName"
    
    $TestScript = {
        param($TestUrl, $TestDuration)
        
        $StartTime = Get-Date
        $EndTime = $StartTime.AddSeconds($TestDuration)
        $Requests = 0
        $Errors = 0
        $ResponseTimes = @()
        
        while ((Get-Date) -lt $EndTime) {
            try {
                $RequestStart = Get-Date
                $Response = Invoke-WebRequest -Uri $TestUrl -UseBasicParsing -TimeoutSec 30
                $RequestEnd = Get-Date
                $ResponseTime = ($RequestEnd - $RequestStart).TotalMilliseconds
                $ResponseTimes += $ResponseTime
                $Requests++
                
                if ($Response.StatusCode -ne 200) {
                    $Errors++
                }
            } catch {
                $Errors++
            }
            
            Start-Sleep -Milliseconds 100
        }
        
        return @{
            Requests = $Requests
            Errors = $Errors
            ResponseTimes = $ResponseTimes
            Duration = $TestDuration
        }
    }
    
    # Start multiple threads
    $Jobs = @()
    for ($i = 1; $i -le $Threads; $i++) {
        $Jobs += Start-Job -ScriptBlock $TestScript -ArgumentList $Url, $Duration
    }
    
    # Wait for completion and collect results
    $Results = $Jobs | Wait-Job | Receive-Job
    $Jobs | Remove-Job
    
    # Calculate statistics
    $TotalRequests = ($Results | Measure-Object -Property Requests -Sum).Sum
    $TotalErrors = ($Results | Measure-Object -Property Errors -Sum).Sum
    $AllResponseTimes = $Results | ForEach-Object { $_.ResponseTimes }
    
    if ($AllResponseTimes.Count -gt 0) {
        $AvgResponseTime = ($AllResponseTimes | Measure-Object -Average).Average
        $MinResponseTime = ($AllResponseTimes | Measure-Object -Minimum).Minimum
        $MaxResponseTime = ($AllResponseTimes | Measure-Object -Maximum).Maximum
        $P95ResponseTime = $AllResponseTimes | Sort-Object | Select-Object -Index ([Math]::Floor($AllResponseTimes.Count * 0.95))
    } else {
        $AvgResponseTime = $MinResponseTime = $MaxResponseTime = $P95ResponseTime = 0
    }
    
    $RequestsPerSecond = $TotalRequests / $Duration
    $ErrorRate = if ($TotalRequests -gt 0) { ($TotalErrors / $TotalRequests) * 100 } else { 0 }
    
    return [PSCustomObject]@{
        TestName = $TestName
        TotalRequests = $TotalRequests
        RequestsPerSecond = [Math]::Round($RequestsPerSecond, 2)
        ErrorCount = $TotalErrors
        ErrorRate = [Math]::Round($ErrorRate, 2)
        AvgResponseTime = [Math]::Round($AvgResponseTime, 2)
        MinResponseTime = [Math]::Round($MinResponseTime, 2)
        MaxResponseTime = [Math]::Round($MaxResponseTime, 2)
        P95ResponseTime = [Math]::Round($P95ResponseTime, 2)
        ConcurrentUsers = $Threads
        TestDuration = $Duration
    }
}

# Define test scenarios
$TestScenarios = @(
    @{ Name = "Home Page"; Url = "$ApplicationUrl/" },
    @{ Name = "Dashboard"; Url = "$ApplicationUrl/dashboard" },
    @{ Name = "Users API"; Url = "$ApplicationUrl/api/users" },
    @{ Name = "Groups API"; Url = "$ApplicationUrl/api/groups" },
    @{ Name = "Health Check"; Url = "$ApplicationUrl/api/health" },
    @{ Name = "Metrics"; Url = "$ApplicationUrl/metrics" }
)

$PerformanceResults = @()

foreach ($Scenario in $TestScenarios) {
    $Result = Start-PerformanceTest -TestName $Scenario.Name -Url $Scenario.Url -Duration $TestDuration -Threads $ConcurrentUsers
    $PerformanceResults += $Result
    
    # Display results
    Write-Host "Test: $($Scenario.Name)" -ForegroundColor Green
    Write-Host "  Requests/sec: $($Result.RequestsPerSecond)"
    Write-Host "  Avg Response: $($Result.AvgResponseTime)ms"
    Write-Host "  95% Response: $($Result.P95ResponseTime)ms"
    Write-Host "  Error Rate: $($Result.ErrorRate)%"
    Write-Host ""
}

# Export results
$PerformanceResults | Export-Csv -Path "$OutputPath\PerformanceBaseline_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv" -NoTypeInformation

# Generate HTML report
$HtmlReport = @"
<!DOCTYPE html>
<html>
<head>
    <title>M&A Discovery Suite - Performance Baseline Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .pass { color: green; }
        .warn { color: orange; }
        .fail { color: red; }
    </style>
</head>
<body>
    <h1>M&A Discovery Suite - Performance Baseline Report</h1>
    <p>Generated: $(Get-Date)</p>
    <p>Test Duration: $TestDuration seconds</p>
    <p>Concurrent Users: $ConcurrentUsers</p>
    
    <h2>Performance Results</h2>
    <table>
        <tr>
            <th>Test Name</th>
            <th>Requests/sec</th>
            <th>Avg Response (ms)</th>
            <th>95% Response (ms)</th>
            <th>Error Rate (%)</th>
            <th>Status</th>
        </tr>
"@

foreach ($Result in $PerformanceResults) {
    $Status = "pass"
    if ($Result.P95ResponseTime -gt 1000) { $Status = "fail" }
    elseif ($Result.P95ResponseTime -gt 500) { $Status = "warn" }
    if ($Result.ErrorRate -gt 1) { $Status = "fail" }
    
    $HtmlReport += @"
        <tr>
            <td>$($Result.TestName)</td>
            <td>$($Result.RequestsPerSecond)</td>
            <td>$($Result.AvgResponseTime)</td>
            <td>$($Result.P95ResponseTime)</td>
            <td>$($Result.ErrorRate)</td>
            <td class="$Status">$(if($Status -eq "pass"){"PASS"}elseif($Status -eq "warn"){"WARN"}else{"FAIL"})</td>
        </tr>
"@
}

$HtmlReport += @"
    </table>
    
    <h2>Performance Targets</h2>
    <ul>
        <li>95% Response Time: &lt; 500ms (Target), &lt; 1000ms (Acceptable)</li>
        <li>Error Rate: &lt; 1%</li>
        <li>Requests/sec: &gt; 10 (minimum for concurrent users)</li>
    </ul>
</body>
</html>
"@

$HtmlReport | Out-File "$OutputPath\PerformanceBaseline_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"

Write-Host "Performance testing completed. Reports saved to: $OutputPath" -ForegroundColor Yellow

# Check if performance targets are met
$FailedTests = $PerformanceResults | Where-Object { $_.P95ResponseTime -gt 1000 -or $_.ErrorRate -gt 1 }
if ($FailedTests.Count -gt 0) {
    Write-Host "Performance targets not met for the following tests:" -ForegroundColor Red
    $FailedTests | Format-Table TestName, P95ResponseTime, ErrorRate
    exit 1
} else {
    Write-Host "All performance targets met successfully!" -ForegroundColor Green
}
```

---

## 7. MONITORING & LOGGING

### 7.1 Prometheus Configuration

#### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: 'production'
    service: 'manda-discovery'

rule_files:
  - "manda_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager.company.com:9093

scrape_configs:
  # Application metrics
  - job_name: 'manda-discovery-app'
    static_configs:
      - targets: 
        - 'app01.company.com:9090'
        - 'app02.company.com:9090'
        - 'app03.company.com:9090'
    scrape_interval: 15s
    metrics_path: '/metrics'
    
  # Windows metrics
  - job_name: 'windows-exporter'
    static_configs:
      - targets:
        - 'app01.company.com:9182'
        - 'app02.company.com:9182'
        - 'app03.company.com:9182'
        - 'sql01.company.com:9182'
        - 'sql02.company.com:9182'
    
  # SQL Server metrics
  - job_name: 'sqlserver-exporter'
    static_configs:
      - targets:
        - 'sql01.company.com:9399'
        - 'sql02.company.com:9399'
    
  # PowerShell execution metrics
  - job_name: 'powershell-runners'
    static_configs:
      - targets:
        - 'ps01.company.com:9090'
        - 'ps02.company.com:9090'
        - 'ps03.company.com:9090'
```

#### Alert Rules (manda_alerts.yml)
```yaml
groups:
- name: manda-discovery-alerts
  rules:
  # Application health
  - alert: ApplicationDown
    expr: up{job="manda-discovery-app"} == 0
    for: 30s
    labels:
      severity: critical
    annotations:
      summary: "M&A Discovery application is down"
      description: "Application on {{ $labels.instance }} has been down for more than 30 seconds"
      
  - alert: HighResponseTime
    expr: manda_discovery_http_request_duration_seconds{quantile="0.95"} > 1.0
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response times detected"
      description: "95th percentile response time is {{ $value }}s on {{ $labels.instance }}"
      
  - alert: HighErrorRate
    expr: rate(manda_discovery_http_errors_total[5m]) > 0.01
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.instance }}"
      
  # Database alerts
  - alert: DatabaseConnectionFailure
    expr: manda_discovery_database_connections_failed_total > 0
    for: 0s
    labels:
      severity: critical
    annotations:
      summary: "Database connection failures"
      description: "Database connections are failing on {{ $labels.instance }}"
      
  - alert: DatabaseSlowQueries
    expr: manda_discovery_database_query_duration_seconds{quantile="0.95"} > 30
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "Slow database queries detected"
      description: "Database query 95th percentile is {{ $value }}s on {{ $labels.instance }}"
      
  # Migration alerts
  - alert: MigrationFailures
    expr: increase(manda_discovery_migration_failures_total[5m]) > 5
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Multiple migration failures"
      description: "{{ $value }} migration failures in the last 5 minutes on {{ $labels.instance }}"
      
  - alert: MigrationStalled
    expr: manda_discovery_migration_queue_size > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Migration queue is growing"
      description: "Migration queue has {{ $value }} items on {{ $labels.instance }}"
      
  # System resource alerts
  - alert: HighCPUUsage
    expr: 100 - (avg by (instance) (irate(windows_cpu_time_total{mode="idle"}[5m])) * 100) > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage"
      description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"
      
  - alert: HighMemoryUsage
    expr: 100 * (1 - (windows_os_physical_memory_free_bytes / windows_cs_physical_memory_bytes)) > 90
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
      description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"
      
  - alert: LowDiskSpace
    expr: 100 * (1 - (windows_logical_disk_free_bytes / windows_logical_disk_size_bytes)) > 90
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Low disk space"
      description: "Disk usage is {{ $value }}% on {{ $labels.instance }} drive {{ $labels.volume }}"
```

### 7.2 Grafana Dashboards

#### Dashboard JSON Configuration
```json
{
  "dashboard": {
    "id": null,
    "title": "M&A Discovery Suite - Executive Dashboard",
    "tags": ["manda", "migration", "executive"],
    "timezone": "browser",
    "refresh": "30s",
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "panels": [
      {
        "id": 1,
        "title": "System Health Overview",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"manda-discovery-app\"}",
            "legendFormat": "Application Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": null},
                {"color": "green", "value": 1}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Active Migrations",
        "type": "stat",
        "targets": [
          {
            "expr": "manda_discovery_active_migrations_total",
            "legendFormat": "Active Migrations"
          }
        ],
        "gridPos": {"h": 8, "w": 6, "x": 6, "y": 0}
      },
      {
        "id": 3,
        "title": "Migration Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "100 * (rate(manda_discovery_migration_success_total[1h]) / (rate(manda_discovery_migration_success_total[1h]) + rate(manda_discovery_migration_failures_total[1h])))",
            "legendFormat": "Success Rate %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                {"color": "red", "value": null},
                {"color": "yellow", "value": 95},
                {"color": "green", "value": 99}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 12, "y": 0}
      },
      {
        "id": 4,
        "title": "Response Time (95th percentile)",
        "type": "stat",
        "targets": [
          {
            "expr": "manda_discovery_http_request_duration_seconds{quantile=\"0.95\"} * 1000",
            "legendFormat": "Response Time (ms)"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "ms",
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 500},
                {"color": "red", "value": 1000}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 18, "y": 0}
      },
      {
        "id": 5,
        "title": "Migration Progress Over Time",
        "type": "graph",
        "targets": [
          {
            "expr": "manda_discovery_migration_success_total",
            "legendFormat": "Successful Migrations"
          },
          {
            "expr": "manda_discovery_migration_failures_total",
            "legendFormat": "Failed Migrations"
          }
        ],
        "yAxes": [
          {
            "min": 0,
            "unit": "short"
          }
        ],
        "gridPos": {"h": 10, "w": 12, "x": 0, "y": 8}
      },
      {
        "id": 6,
        "title": "System Resource Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(windows_cpu_time_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage - {{instance}}"
          },
          {
            "expr": "100 * (1 - (windows_os_physical_memory_free_bytes / windows_cs_physical_memory_bytes))",
            "legendFormat": "Memory Usage - {{instance}}"
          }
        ],
        "yAxes": [
          {
            "max": 100,
            "min": 0,
            "unit": "percent"
          }
        ],
        "gridPos": {"h": 10, "w": 12, "x": 12, "y": 8}
      }
    ]
  }
}
```

### 7.3 Log Aggregation with ELK Stack

#### Logstash Configuration
```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
  
  file {
    path => "C:/ProgramData/MandADiscoverySuite/Logs/*.log"
    start_position => "beginning"
    codec => multiline {
      pattern => "^\d{4}-\d{2}-\d{2}"
      negate => true
      what => "previous"
    }
    tags => ["manda-discovery", "application"]
  }
  
  file {
    path => "C:/Windows/System32/LogFiles/HTTPERR/*.log"
    start_position => "beginning"
    tags => ["manda-discovery", "iis-error"]
  }
}

filter {
  if "manda-discovery" in [tags] {
    grok {
      match => { 
        "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{LOGLEVEL:level}\] %{DATA:logger} - %{GREEDYDATA:message}"
      }
      overwrite => [ "message" ]
    }
    
    date {
      match => [ "timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]
    }
    
    if [level] == "ERROR" {
      mutate {
        add_tag => ["error"]
      }
    }
    
    if [logger] =~ /Migration/ {
      mutate {
        add_tag => ["migration"]
      }
    }
    
    if [logger] =~ /Discovery/ {
      mutate {
        add_tag => ["discovery"]
      }
    }
  }
  
  # Parse JSON log entries
  if [message] =~ /^\{.*\}$/ {
    json {
      source => "message"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch.company.com:9200"]
    index => "manda-discovery-%{+YYYY.MM.dd}"
  }
  
  # Send critical errors to alerting
  if "error" in [tags] {
    http {
      url => "https://alertmanager.company.com/api/v1/alerts"
      http_method => "post"
      format => "json"
      mapping => {
        "alerts" => [
          {
            "labels" => {
              "alertname" => "ApplicationError"
              "instance" => "%{host}"
              "severity" => "warning"
              "service" => "manda-discovery"
            }
            "annotations" => {
              "summary" => "Application error detected"
              "description" => "%{message}"
            }
            "startsAt" => "%{@timestamp}"
          }
        ]
      }
    }
  }
}
```

#### Kibana Index Pattern and Visualizations
```json
{
  "version": "7.15.0",
  "objects": [
    {
      "id": "manda-discovery-*",
      "type": "index-pattern",
      "attributes": {
        "title": "manda-discovery-*",
        "timeFieldName": "@timestamp",
        "fields": "[{\"name\":\"@timestamp\",\"type\":\"date\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"level\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"logger\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"message\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":false},{\"name\":\"host\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true}]"
      }
    },
    {
      "id": "error-rate-visualization",
      "type": "visualization",
      "attributes": {
        "title": "Error Rate Over Time",
        "visState": "{\"title\":\"Error Rate Over Time\",\"type\":\"line\",\"params\":{\"grid\":{\"categoryLines\":false,\"style\":{\"color\":\"#eee\"}},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"Error Count\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"Error Count\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"interval\":\"auto\",\"customInterval\":\"2h\",\"min_doc_count\":1,\"extended_bounds\":{}}}]}",
        "uiStateJSON": "{}",
        "description": "",
        "version": 1,
        "kibanaSavedObjectMeta": {
          "searchSourceJSON": "{\"index\":\"manda-discovery-*\",\"query\":{\"match\":{\"level\":\"ERROR\"}},\"filter\":[]}"
        }
      }
    }
  ]
}
```

---

This technical deployment guide provides comprehensive instructions for IT administrators to successfully deploy the M&A Discovery Suite in a production environment. The guide covers all critical aspects from infrastructure setup to monitoring configuration, ensuring a robust and secure deployment.

**Continue to the next sections for remaining onboarding documentation...**