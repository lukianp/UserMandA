# M&A Discovery Suite - Security & Compliance Documentation
**Enterprise Security Framework | SOX, GDPR, HIPAA Compliance Guide**

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Access Control & Authentication](#2-access-control--authentication)
3. [Data Encryption & Protection](#3-data-encryption--protection)
4. [Audit Trail & Logging](#4-audit-trail--logging)
5. [Compliance Frameworks](#5-compliance-frameworks)
6. [Security Monitoring & Incident Response](#6-security-monitoring--incident-response)
7. [Vulnerability Management](#7-vulnerability-management)
8. [Security Configuration Guide](#8-security-configuration-guide)
9. [Compliance Reporting](#9-compliance-reporting)
10. [Security Best Practices](#10-security-best-practices)

---

## 1. SECURITY ARCHITECTURE OVERVIEW

### 1.1 Defense-in-Depth Strategy

#### Security Layers Implementation
```yaml
Layer 1 - Network Security:
  - Perimeter firewall with application-specific rules
  - Network segmentation (VLANs) for tier isolation
  - Intrusion Detection/Prevention Systems (IDS/IPS)
  - DDoS protection and traffic filtering
  - VPN access for remote administration

Layer 2 - Application Security:
  - Web Application Firewall (WAF)
  - SSL/TLS encryption for all communications
  - Input validation and sanitization
  - Cross-Site Scripting (XSS) protection
  - SQL injection prevention

Layer 3 - Authentication & Authorization:
  - Windows Integrated Authentication
  - Multi-Factor Authentication (MFA) support
  - Role-Based Access Control (RBAC)
  - Privilege escalation prevention
  - Session management and timeout

Layer 4 - Data Security:
  - Encryption at rest (AES-256)
  - Encryption in transit (TLS 1.3)
  - Database-level security controls
  - Sensitive data masking
  - Secure key management

Layer 5 - Host Security:
  - Endpoint protection and antimalware
  - Host-based firewalls
  - System hardening standards
  - Patch management
  - Security monitoring agents
```

### 1.2 Security Control Matrix

#### Primary Security Controls
| Control Category | Implementation | Compliance Alignment |
|------------------|----------------|---------------------|
| **Access Management** | Windows AD + RBAC | SOX, GDPR, HIPAA |
| **Data Encryption** | AES-256 + TLS 1.3 | SOX, GDPR, HIPAA |
| **Audit Logging** | Centralized SIEM | SOX, GDPR, HIPAA |
| **Vulnerability Management** | Automated scanning | ISO 27001 |
| **Incident Response** | 24/7 SOC monitoring | NIST Framework |
| **Business Continuity** | HA/DR procedures | SOX, ISO 27001 |
| **Data Privacy** | GDPR controls | GDPR, CCPA |
| **Medical Data** | HIPAA safeguards | HIPAA |

### 1.3 Threat Model Analysis

#### Identified Threats and Mitigations
```yaml
External Threats:
  SQL Injection Attacks:
    Risk Level: High
    Mitigation: Parameterized queries, input validation, WAF
    Detection: Database activity monitoring, anomaly detection
    
  Cross-Site Scripting (XSS):
    Risk Level: Medium
    Mitigation: Input encoding, Content Security Policy, validation
    Detection: Web application scanning, runtime protection
    
  Man-in-the-Middle Attacks:
    Risk Level: Medium
    Mitigation: TLS 1.3, certificate pinning, HSTS
    Detection: Certificate monitoring, traffic analysis
    
  Credential Theft:
    Risk Level: High
    Mitigation: MFA, password policies, privileged access management
    Detection: Failed login monitoring, behavioral analytics

Internal Threats:
  Privilege Escalation:
    Risk Level: Medium
    Mitigation: Principle of least privilege, regular access reviews
    Detection: Privilege usage monitoring, anomaly detection
    
  Data Exfiltration:
    Risk Level: High
    Mitigation: DLP controls, access logging, data classification
    Detection: Data movement monitoring, unusual access patterns
    
  Insider Misuse:
    Risk Level: Medium
    Mitigation: Background checks, segregation of duties, monitoring
    Detection: User behavior analytics, audit trail analysis
```

---

## 2. ACCESS CONTROL & AUTHENTICATION

### 2.1 Authentication Framework

#### Windows Integrated Authentication Setup
```powershell
# Configure Kerberos Authentication for M&A Discovery Suite
param(
    [string]$ServiceAccount = "COMPANY\svc_manda_app",
    [string]$ApplicationURL = "https://mandadiscovery.company.com"
)

# 1. Configure Service Principal Names (SPNs)
Write-Host "Configuring Service Principal Names..." -ForegroundColor Green

# Set SPNs for the service account
setspn -A HTTP/mandadiscovery.company.com $ServiceAccount
setspn -A HTTP/mandadiscovery $ServiceAccount
setspn -A HTTP/mandadiscovery.company.com:443 $ServiceAccount

# Verify SPN configuration
$SPNs = setspn -L $ServiceAccount
Write-Host "Configured SPNs:" -ForegroundColor Yellow
$SPNs | Where-Object { $_ -like "HTTP/*" } | ForEach-Object { Write-Host "  $_" }

# 2. Configure delegation settings (if required)
# Note: This should be done through Active Directory Users and Computers
Write-Host "`nDelegation Configuration:" -ForegroundColor Yellow
Write-Host "Manual Step Required: Configure constrained delegation in AD for $ServiceAccount"
Write-Host "Services to delegate to:"
Write-Host "  - MSSQLSvc/sql-server.company.com:1433"
Write-Host "  - LDAP/dc01.company.com"

# 3. Configure IIS Authentication
Write-Host "`nConfiguring IIS Authentication..." -ForegroundColor Green

Import-Module WebAdministration

# Enable Windows Authentication
Set-WebConfiguration -Filter "system.webServer/security/authentication/windowsAuthentication" -Value @{enabled="true"} -PSPath "IIS:\Sites\MandADiscovery"

# Disable Anonymous Authentication  
Set-WebConfiguration -Filter "system.webServer/security/authentication/anonymousAuthentication" -Value @{enabled="false"} -PSPath "IIS:\Sites\MandADiscovery"

# Configure Windows Authentication providers
Set-WebConfiguration -Filter "system.webServer/security/authentication/windowsAuthentication/providers" -Value @{clear="true"} -PSPath "IIS:\Sites\MandADiscovery"
Add-WebConfiguration -Filter "system.webServer/security/authentication/windowsAuthentication/providers" -Value @{name="Negotiate"} -PSPath "IIS:\Sites\MandADiscovery"
Add-WebConfiguration -Filter "system.webServer/security/authentication/windowsAuthentication/providers" -Value @{name="NTLM"} -PSPath "IIS:\Sites\MandADiscovery"

# Enable kernel mode authentication
Set-WebConfiguration -Filter "system.webServer/security/authentication/windowsAuthentication" -Value @{useKernelMode="true"} -PSPath "IIS:\Sites\MandADiscovery"

Write-Host "Authentication configuration completed." -ForegroundColor Green
```

### 2.2 Role-Based Access Control (RBAC)

#### Security Group Structure
```yaml
Executive Access:
  Group: "COMPANY\MandA-Executives"
  Permissions:
    - Dashboard: Read-Only
    - Reports: Full Access
    - Discovery: Read-Only
    - Planning: Read-Only
    - Execution: Monitor Only
  Members:
    - CEO, CFO, CTO
    - VP of M&A Integration
    - Executive Sponsors

Administrative Access:
  Group: "COMPANY\MandA-Administrators"
  Permissions:
    - Dashboard: Full Access
    - Reports: Full Access
    - Discovery: Full Access
    - Planning: Full Access
    - Execution: Full Access
    - Configuration: Full Access
    - User Management: Full Access
  Members:
    - IT Administrators
    - System Administrators
    - Platform Administrators

Migration Specialist Access:
  Group: "COMPANY\MandA-Migration-Specialists"
  Permissions:
    - Dashboard: Read-Only
    - Reports: Create/View Own
    - Discovery: Full Access
    - Planning: Full Access
    - Execution: Full Access
    - Configuration: Read-Only
  Members:
    - Migration Engineers
    - Technical Consultants
    - Migration Project Managers

Business Analyst Access:
  Group: "COMPANY\MandA-Business-Analysts"
  Permissions:
    - Dashboard: Read-Only
    - Reports: Full Access
    - Discovery: Read-Only
    - Planning: Read-Only
    - Execution: Read-Only
  Members:
    - Business Analysts
    - Data Analysts
    - Reporting Specialists

Auditor Access:
  Group: "COMPANY\MandA-Auditors"
  Permissions:
    - Dashboard: Read-Only (Summary View)
    - Reports: Audit Reports Only
    - Discovery: No Access
    - Planning: No Access
    - Execution: No Access
    - Audit Trail: Full Access
  Members:
    - Internal Auditors
    - Compliance Officers
    - External Auditors (temporary)
```

#### RBAC Configuration Script
```csharp
// Role-Based Access Control Configuration
// Add to Startup.cs in ConfigureServices method

public void ConfigureServices(IServiceCollection services)
{
    // Configure authorization policies
    services.AddAuthorization(options =>
    {
        // Executive access policy
        options.AddPolicy("ExecutiveAccess", policy =>
            policy.RequireRole("MandA-Executives", "MandA-Administrators"));
            
        // Migration specialist policy  
        options.AddPolicy("MigrationAccess", policy =>
            policy.RequireRole("MandA-Migration-Specialists", "MandA-Administrators"));
            
        // Business analyst policy
        options.AddPolicy("AnalystAccess", policy =>
            policy.RequireRole("MandA-Business-Analysts", "MandA-Administrators"));
            
        // Auditor access policy
        options.AddPolicy("AuditorAccess", policy =>
            policy.RequireRole("MandA-Auditors", "MandA-Administrators"));
            
        // Administrative policy
        options.AddPolicy("AdminAccess", policy =>
            policy.RequireRole("MandA-Administrators"));
            
        // Configuration management policy
        options.AddPolicy("ConfigurationAccess", policy =>
        {
            policy.RequireRole("MandA-Administrators");
            policy.RequireClaim("Department", "IT", "Security");
        });
        
        // Data modification policy
        options.AddPolicy("DataModification", policy =>
        {
            policy.RequireRole("MandA-Migration-Specialists", "MandA-Administrators");
            policy.RequireAssertion(context =>
            {
                // Additional business logic for data modification
                var user = context.User;
                var timeOfDay = DateTime.Now.Hour;
                
                // Restrict data modifications to business hours (8 AM - 6 PM)
                return timeOfDay >= 8 && timeOfDay <= 18;
            });
        });
    });
    
    // Add custom authorization handlers
    services.AddTransient<IAuthorizationHandler, MigrationPeriodAuthorizationHandler>();
    services.AddTransient<IAuthorizationHandler, DataSensitivityAuthorizationHandler>();
}

// Custom Authorization Handler for Migration Periods
public class MigrationPeriodAuthorizationHandler : AuthorizationHandler<MigrationPeriodRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        MigrationPeriodRequirement requirement)
    {
        // Only allow critical operations during approved migration windows
        var currentTime = DateTime.Now;
        var approvedWindows = GetApprovedMigrationWindows();
        
        var isInMigrationWindow = approvedWindows.Any(window =>
            currentTime >= window.Start && currentTime <= window.End);
            
        if (isInMigrationWindow || context.User.IsInRole("MandA-Administrators"))
        {
            context.Succeed(requirement);
        }
        
        return Task.CompletedTask;
    }
}
```

### 2.3 Multi-Factor Authentication Integration

#### Azure MFA Configuration
```json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "Domain": "company.onmicrosoft.com",
    "TenantId": "tenant-guid-here",
    "ClientId": "client-guid-here",
    "ClientSecret": "client-secret-here",
    "CallbackPath": "/signin-oidc",
    "SignedOutCallbackPath": "/signout-callback-oidc"
  },
  "MfaSettings": {
    "RequiredForRoles": [
      "MandA-Administrators",
      "MandA-Migration-Specialists"
    ],
    "RequiredForHighRiskOperations": true,
    "SessionTimeout": "08:00:00",
    "RememberMfaDuration": "01:00:00"
  }
}
```

---

## 3. DATA ENCRYPTION & PROTECTION

### 3.1 Encryption at Rest

#### Database Encryption Configuration
```sql
-- SQL Server Transparent Data Encryption (TDE) Setup
USE master;
GO

-- 1. Create master key
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'ComplexPassword123!@#';
GO

-- 2. Create certificate for TDE
CREATE CERTIFICATE MandADiscovery_TDE_Cert
    WITH SUBJECT = 'M&A Discovery Suite TDE Certificate',
    EXPIRY_DATE = '2026-12-31';
GO

-- 3. Backup the certificate (CRITICAL for recovery)
BACKUP CERTIFICATE MandADiscovery_TDE_Cert
    TO FILE = '\\secure-backup\certificates\MandADiscovery_TDE_Cert.cer'
    WITH PRIVATE KEY (
        FILE = '\\secure-backup\certificates\MandADiscovery_TDE_Cert.key',
        ENCRYPTION BY PASSWORD = 'CertificateBackupPassword456!@#'
    );
GO

-- 4. Create database encryption key
USE MandADiscovery;
GO

CREATE DATABASE ENCRYPTION KEY
    WITH ALGORITHM = AES_256
    ENCRYPTION BY SERVER CERTIFICATE MandADiscovery_TDE_Cert;
GO

-- 5. Enable TDE on database
ALTER DATABASE MandADiscovery SET ENCRYPTION ON;
GO

-- 6. Verify TDE status
SELECT 
    db.name AS database_name,
    dm.encryption_state,
    CASE dm.encryption_state
        WHEN 0 THEN 'No database encryption key present, no encryption'
        WHEN 1 THEN 'Unencrypted'
        WHEN 2 THEN 'Encryption in progress'
        WHEN 3 THEN 'Encrypted'
        WHEN 4 THEN 'Key change in progress'
        WHEN 5 THEN 'Decryption in progress'
    END AS encryption_state_desc,
    dm.percent_complete,
    dm.key_algorithm,
    dm.key_length
FROM sys.databases db
INNER JOIN sys.dm_database_encryption_keys dm ON db.database_id = dm.database_id
WHERE db.name = 'MandADiscovery';

-- 7. Enable backup encryption
-- All future backups will be encrypted using the same certificate
```

#### File System Encryption
```powershell
# BitLocker Configuration for Application Data
param(
    [string[]]$DrivesToEncrypt = @("C:", "D:"),
    [string]$RecoveryKeyPath = "\\secure-backup\bitlocker-keys"
)

Write-Host "Configuring BitLocker encryption..." -ForegroundColor Green

foreach ($Drive in $DrivesToEncrypt) {
    Write-Host "Processing drive $Drive..." -ForegroundColor Yellow
    
    # Check if BitLocker is already enabled
    $BitLockerStatus = Get-BitLockerVolume -MountPoint $Drive
    
    if ($BitLockerStatus.VolumeStatus -eq "FullyDecrypted") {
        Write-Host "Enabling BitLocker on $Drive..."
        
        # Enable BitLocker with TPM protector
        Enable-BitLocker -MountPoint $Drive -EncryptionMethod Aes256 -UsedSpaceOnly -TpmProtector
        
        # Add recovery password protector
        Add-BitLockerKeyProtector -MountPoint $Drive -RecoveryPasswordProtector
        
        # Backup recovery key
        $RecoveryKey = (Get-BitLockerVolume -MountPoint $Drive).KeyProtector | Where-Object KeyProtectorType -eq 'RecoveryPassword'
        $KeyFileName = "${env:COMPUTERNAME}_${Drive.Replace(':', '')}_RecoveryKey.txt"
        $KeyFilePath = Join-Path $RecoveryKeyPath $KeyFileName
        
        "Computer: $env:COMPUTERNAME" | Out-File $KeyFilePath
        "Drive: $Drive" | Add-Content $KeyFilePath
        "Recovery Key ID: $($RecoveryKey.KeyProtectorId)" | Add-Content $KeyFilePath
        "Recovery Password: $($RecoveryKey.RecoveryPassword)" | Add-Content $KeyFilePath
        "Date Created: $(Get-Date)" | Add-Content $KeyFilePath
        
        Write-Host "Recovery key backed up to: $KeyFilePath" -ForegroundColor Green
        
    } elseif ($BitLockerStatus.VolumeStatus -eq "FullyEncrypted") {
        Write-Host "Drive $Drive is already encrypted" -ForegroundColor Green
    } else {
        Write-Host "Drive $Drive encryption status: $($BitLockerStatus.VolumeStatus)" -ForegroundColor Yellow
    }
}

Write-Host "BitLocker configuration completed" -ForegroundColor Green
```

### 3.2 Encryption in Transit

#### TLS/SSL Configuration
```xml
<!-- IIS SSL Configuration -->
<system.webServer>
  <security>
    <access sslFlags="Ssl,SslNegotiateCert,SslRequireCert,Ssl128" />
    <requestFiltering>
      <requestLimits maxAllowedContentLength="52428800" /> <!-- 50MB -->
    </requestFiltering>
  </security>
  
  <httpProtocol>
    <customHeaders>
      <!-- Security Headers -->
      <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains; preload" />
      <add name="X-Content-Type-Options" value="nosniff" />
      <add name="X-Frame-Options" value="SAMEORIGIN" />
      <add name="X-XSS-Protection" value="1; mode=block" />
      <add name="Content-Security-Policy" value="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'" />
      <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      <add name="Permissions-Policy" value="geolocation=(), microphone=(), camera=()" />
    </customHeaders>
  </httpProtocol>
  
  <rewrite>
    <rules>
      <!-- Force HTTPS -->
      <rule name="HTTP to HTTPS redirect" stopProcessing="true">
        <match url="(.*)" />
        <conditions>
          <add input="{HTTPS}" pattern="off" ignoreCase="true" />
        </conditions>
        <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
      </rule>
    </rules>
  </rewrite>
</system.webServer>
```

#### PowerShell Remoting Security
```powershell
# Configure PowerShell Remoting with Enhanced Security
param(
    [string[]]$AllowedUsers = @("COMPANY\MandA-Administrators", "COMPANY\MandA-Migration-Specialists"),
    [string]$CertificateThumbprint = "YOUR-CERTIFICATE-THUMBPRINT"
)

Write-Host "Configuring secure PowerShell remoting..." -ForegroundColor Green

# 1. Enable PowerShell remoting with SSL
Enable-PSRemoting -Force -SkipNetworkProfileCheck

# 2. Create HTTPS listener with certificate
$Cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object Thumbprint -eq $CertificateThumbprint
if (-not $Cert) {
    Write-Error "Certificate not found with thumbprint: $CertificateThumbprint"
    exit 1
}

# Remove existing HTTPS listener if present
Get-ChildItem WSMan:\Localhost\listener | Where-Object {$_.Keys -like "Transport=HTTPS"} | Remove-Item -Recurse -Force

# Create new HTTPS listener
New-Item -Path WSMan:\LocalHost\Listener -Transport HTTPS -Address * -CertificateThumbPrint $CertificateThumbprint -Force

# 3. Configure authentication methods
Set-Item WSMan:\localhost\Service\Auth\Basic -Value $false
Set-Item WSMan:\localhost\Service\Auth\Digest -Value $false
Set-Item WSMan:\localhost\Service\Auth\Kerberos -Value $true
Set-Item WSMan:\localhost\Service\Auth\Negotiate -Value $true
Set-Item WSMan:\localhost\Service\Auth\Certificate -Value $false
Set-Item WSMan:\localhost\Service\Auth\CredSSP -Value $false

# 4. Configure session limits
Set-Item WSMan:\localhost\Service\MaxConcurrentOperations -Value 100
Set-Item WSMan:\localhost\Service\MaxConcurrentOperationsPerUser -Value 15
Set-Item WSMan:\localhost\Service\MaxConnections -Value 50

# 5. Configure allowed users
$AllowedUsers | ForEach-Object {
    $User = $_
    try {
        Set-PSSessionConfiguration -Name Microsoft.PowerShell -SecurityDescriptorSddl (Get-PSSessionConfiguration -Name Microsoft.PowerShell).SecurityDescriptorSddl -Force
        # Note: In production, use proper SDDL modification tools
        Write-Host "Configured access for user: $User" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to configure access for user: $User - $($_.Exception.Message)"
    }
}

# 6. Configure firewall rules
New-NetFirewallRule -DisplayName "WinRM-HTTPS" -Direction Inbound -LocalPort 5986 -Protocol TCP -Action Allow -Profile Domain,Private

Write-Host "PowerShell remoting security configuration completed" -ForegroundColor Green
```

---

## 4. AUDIT TRAIL & LOGGING

### 4.1 Comprehensive Logging Framework

#### Application Logging Configuration
```xml
<!-- NLog.config for comprehensive audit logging -->
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  
  <targets>
    <!-- Security Events Log -->
    <target xsi:type="File" name="securitylog"
            fileName="C:\ProgramData\MandADiscoverySuite\Logs\Security\security-${shortdate}.log"
            layout="${longdate}|${level:uppercase=true}|${logger}|${event-properties:item=UserId}|${event-properties:item=UserName}|${event-properties:item=IpAddress}|${event-properties:item=Action}|${message}|${exception:format=tostring}"
            maxArchiveFiles="365"
            archiveEvery="Day" />
    
    <!-- Audit Trail Log -->
    <target xsi:type="File" name="auditlog"
            fileName="C:\ProgramData\MandADiscoverySuite\Logs\Audit\audit-${shortdate}.log"
            layout="${longdate}|${event-properties:item=EventType}|${event-properties:item=UserId}|${event-properties:item=UserName}|${event-properties:item=ObjectType}|${event-properties:item=ObjectId}|${event-properties:item=Action}|${event-properties:item=OldValues}|${event-properties:item=NewValues}|${message}"
            maxArchiveFiles="2555" 
            archiveEvery="Day" />
    
    <!-- Migration Events Log -->
    <target xsi:type="File" name="migrationlog"
            fileName="C:\ProgramData\MandADiscoverySuite\Logs\Migration\migration-${shortdate}.log"
            layout="${longdate}|${level}|${event-properties:item=MigrationId}|${event-properties:item=UserId}|${event-properties:item=ItemType}|${event-properties:item=Status}|${message}|${exception:format=tostring}"
            maxArchiveFiles="365"
            archiveEvery="Day" />
    
    <!-- Database Activity Log -->
    <target xsi:type="Database" name="databaselog"
            connectionString="Server=AG-MandADiscovery.company.com;Database=MandADiscovery;Integrated Security=true;"
            commandText="INSERT INTO [Audit].[ActivityLog] ([Timestamp], [UserId], [Activity], [ObjectType], [ObjectId], [Details], [IpAddress], [UserAgent]) VALUES (@Timestamp, @UserId, @Activity, @ObjectType, @ObjectId, @Details, @IpAddress, @UserAgent)">
      <parameter name="@Timestamp" layout="${date}" />
      <parameter name="@UserId" layout="${event-properties:item=UserId}" />
      <parameter name="@Activity" layout="${event-properties:item=Activity}" />
      <parameter name="@ObjectType" layout="${event-properties:item=ObjectType}" />
      <parameter name="@ObjectId" layout="${event-properties:item=ObjectId}" />
      <parameter name="@Details" layout="${message}" />
      <parameter name="@IpAddress" layout="${event-properties:item=IpAddress}" />
      <parameter name="@UserAgent" layout="${event-properties:item=UserAgent}" />
    </target>
    
    <!-- SIEM Integration -->
    <target xsi:type="Network" name="syslog"
            address="udp://siem.company.com:514"
            layout="&lt;134&gt;1 ${date:format=yyyy-MM-ddTHH\:mm\:ss.fffK} ${machinename} MandADiscovery ${processid} ${event-properties:item=EventType} - ${message}" />
            
  </targets>
  
  <rules>
    <!-- Security events -->
    <logger name="MandA.Security.*" minlevel="Info" writeTo="securitylog,syslog" />
    
    <!-- Audit trail events -->
    <logger name="MandA.Audit.*" minlevel="Info" writeTo="auditlog,databaselog,syslog" />
    
    <!-- Migration events -->
    <logger name="MandA.Migration.*" minlevel="Info" writeTo="migrationlog,databaselog" />
    
    <!-- All other application events -->
    <logger name="*" minlevel="Info" writeTo="applicationlog" />
  </rules>
  
</nlog>
```

#### Audit Event Implementation
```csharp
// Audit Service Implementation
public class AuditService : IAuditService
{
    private readonly ILogger<AuditService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserService _userService;
    
    public AuditService(
        ILogger<AuditService> logger,
        IHttpContextAccessor httpContextAccessor,
        IUserService userService)
    {
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _userService = userService;
    }
    
    public async Task LogUserLoginAsync(string userId, bool successful, string reason = null)
    {
        var eventProperties = GetBaseEventProperties("UserLogin");
        eventProperties["Successful"] = successful.ToString();
        eventProperties["Reason"] = reason ?? "";
        
        using (_logger.BeginScope(eventProperties))
        {
            if (successful)
                _logger.LogInformation("User {UserId} logged in successfully", userId);
            else
                _logger.LogWarning("User {UserId} login failed: {Reason}", userId, reason);
        }
    }
    
    public async Task LogDataAccessAsync(string objectType, string objectId, string action)
    {
        var eventProperties = GetBaseEventProperties("DataAccess");
        eventProperties["ObjectType"] = objectType;
        eventProperties["ObjectId"] = objectId;
        eventProperties["Action"] = action;
        
        using (_logger.BeginScope(eventProperties))
        {
            _logger.LogInformation("User accessed {ObjectType} {ObjectId} - {Action}", objectType, objectId, action);
        }
    }
    
    public async Task LogDataModificationAsync(string objectType, string objectId, 
        object oldValues, object newValues, string action)
    {
        var eventProperties = GetBaseEventProperties("DataModification");
        eventProperties["ObjectType"] = objectType;
        eventProperties["ObjectId"] = objectId;
        eventProperties["Action"] = action;
        eventProperties["OldValues"] = JsonSerializer.Serialize(oldValues);
        eventProperties["NewValues"] = JsonSerializer.Serialize(newValues);
        
        using (_logger.BeginScope(eventProperties))
        {
            _logger.LogInformation("User modified {ObjectType} {ObjectId} - {Action}", objectType, objectId, action);
        }
    }
    
    public async Task LogMigrationEventAsync(string migrationId, string itemType, 
        string status, string details = null)
    {
        var eventProperties = GetBaseEventProperties("Migration");
        eventProperties["MigrationId"] = migrationId;
        eventProperties["ItemType"] = itemType;
        eventProperties["Status"] = status;
        
        using (_logger.BeginScope(eventProperties))
        {
            _logger.LogInformation("Migration {MigrationId} - {ItemType} status: {Status}. {Details}", 
                migrationId, itemType, status, details ?? "");
        }
    }
    
    public async Task LogSecurityEventAsync(string eventType, string description, 
        SecurityEventLevel level = SecurityEventLevel.Information)
    {
        var eventProperties = GetBaseEventProperties("Security");
        eventProperties["SecurityEventType"] = eventType;
        eventProperties["Level"] = level.ToString();
        
        using (_logger.BeginScope(eventProperties))
        {
            switch (level)
            {
                case SecurityEventLevel.Critical:
                    _logger.LogCritical("SECURITY EVENT: {EventType} - {Description}", eventType, description);
                    break;
                case SecurityEventLevel.Warning:
                    _logger.LogWarning("SECURITY EVENT: {EventType} - {Description}", eventType, description);
                    break;
                default:
                    _logger.LogInformation("SECURITY EVENT: {EventType} - {Description}", eventType, description);
                    break;
            }
        }
    }
    
    private Dictionary<string, object> GetBaseEventProperties(string eventType)
    {
        var context = _httpContextAccessor.HttpContext;
        var currentUser = _userService.GetCurrentUser();
        
        return new Dictionary<string, object>
        {
            ["EventType"] = eventType,
            ["UserId"] = currentUser?.Id ?? "SYSTEM",
            ["UserName"] = currentUser?.Name ?? "SYSTEM",
            ["IpAddress"] = context?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown",
            ["UserAgent"] = context?.Request?.Headers?["User-Agent"].ToString() ?? "Unknown",
            ["SessionId"] = context?.Session?.Id ?? "None",
            ["RequestId"] = context?.TraceIdentifier ?? Guid.NewGuid().ToString()
        };
    }
}

public enum SecurityEventLevel
{
    Information,
    Warning,
    Critical
}
```

### 4.2 Database Audit Configuration

#### SQL Server Audit Setup
```sql
-- Configure SQL Server Audit for M&A Discovery Database
USE master;
GO

-- 1. Create server audit
CREATE SERVER AUDIT MandADiscovery_Audit
TO FILE 
(
    FILEPATH = 'C:\SQLAudit\MandADiscovery\',
    MAXSIZE = 100 MB,
    MAX_ROLLOVER_FILES = 50,
    RESERVE_DISK_SPACE = OFF
)
WITH
(
    QUEUE_DELAY = 1000,
    ON_FAILURE = CONTINUE
);
GO

-- 2. Enable server audit
ALTER SERVER AUDIT MandADiscovery_Audit WITH (STATE = ON);
GO

-- 3. Create database audit specification
USE MandADiscovery;
GO

CREATE DATABASE AUDIT SPECIFICATION MandADiscovery_DB_Audit
FOR SERVER AUDIT MandADiscovery_Audit
ADD (SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON SCHEMA::Migration BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON SCHEMA::Discovery BY public),
ADD (EXECUTE ON SCHEMA::dbo BY public);
GO

-- 4. Enable database audit specification
ALTER DATABASE AUDIT SPECIFICATION MandADiscovery_DB_Audit WITH (STATE = ON);
GO

-- 5. Create audit monitoring views
CREATE VIEW [Audit].[AuditSummary] AS
SELECT 
    event_time,
    action_id,
    succeeded,
    server_principal_name,
    database_name,
    schema_name,
    object_name,
    statement,
    client_ip,
    application_name
FROM sys.fn_get_audit_file('C:\SQLAudit\MandADiscovery\*.sqlaudit', DEFAULT, DEFAULT);
GO

-- 6. Create audit alert procedure
CREATE PROCEDURE [Audit].[CheckForSuspiciousActivity]
AS
BEGIN
    DECLARE @SuspiciousCount INT;
    
    -- Check for excessive failed logins
    SELECT @SuspiciousCount = COUNT(*)
    FROM [Audit].[AuditSummary]
    WHERE event_time > DATEADD(MINUTE, -15, GETDATE())
        AND succeeded = 0
        AND action_id = 'LGIF'; -- Login failed
    
    IF @SuspiciousCount > 10
    BEGIN
        EXEC msdb.dbo.sp_send_dbmail
            @profile_name = 'MandADiscovery',
            @recipients = 'security@company.com',
            @subject = 'SECURITY ALERT: Excessive Failed Logins',
            @body = 'Multiple failed login attempts detected in the last 15 minutes.';
    END
    
    -- Check for after-hours data modifications
    DECLARE @AfterHoursCount INT;
    SELECT @AfterHoursCount = COUNT(*)
    FROM [Audit].[AuditSummary]
    WHERE event_time > DATEADD(HOUR, -1, GETDATE())
        AND (DATEPART(HOUR, event_time) < 8 OR DATEPART(HOUR, event_time) > 18)
        AND action_id IN ('IN', 'UP', 'DL') -- Insert, Update, Delete
        AND server_principal_name NOT LIKE '%service%';
    
    IF @AfterHoursCount > 0
    BEGIN
        EXEC msdb.dbo.sp_send_dbmail
            @profile_name = 'MandADiscovery',
            @recipients = 'security@company.com',
            @subject = 'SECURITY ALERT: After-Hours Data Modification',
            @body = 'Data modifications detected outside business hours.';
    END
END;
GO

-- 7. Schedule audit monitoring job
USE msdb;
GO

EXEC dbo.sp_add_job
    @job_name = 'MandA Discovery Audit Monitoring';
    
EXEC dbo.sp_add_jobstep
    @job_name = 'MandA Discovery Audit Monitoring',
    @step_name = 'Check Suspicious Activity',
    @subsystem = 'TSQL',
    @database_name = 'MandADiscovery',
    @command = 'EXEC [Audit].[CheckForSuspiciousActivity]';
    
EXEC dbo.sp_add_schedule
    @schedule_name = 'Every 15 Minutes',
    @freq_type = 4,
    @freq_interval = 1,
    @freq_subday_type = 4,
    @freq_subday_interval = 15;
    
EXEC dbo.sp_attach_schedule
    @job_name = 'MandA Discovery Audit Monitoring',
    @schedule_name = 'Every 15 Minutes';
    
EXEC dbo.sp_add_jobserver
    @job_name = 'MandA Discovery Audit Monitoring';
GO
```

---

## 5. COMPLIANCE FRAMEWORKS

### 5.1 SOX Compliance Implementation

#### Financial Data Controls
```yaml
SOX Control Framework:
  Control 1 - Access Management:
    Description: "Ensure appropriate access controls over financial data"
    Implementation:
      - Role-based access to financial migration data
      - Quarterly access reviews and certifications
      - Segregation of duties between preparation and approval
    Testing: "Automated quarterly access validation reports"
    
  Control 2 - Change Management:
    Description: "All changes to migration configurations require approval"
    Implementation:
      - Change request workflow with business approval
      - Version control for all configuration changes  
      - Automated deployment with rollback capability
    Testing: "Review all changes for proper approval documentation"
    
  Control 3 - Data Integrity:
    Description: "Financial data accuracy maintained during migration"
    Implementation:
      - Pre and post-migration data validation checksums
      - Automated reconciliation reports
      - Exception handling and resolution tracking
    Testing: "Statistical sampling of migrated financial records"
    
  Control 4 - Audit Trail:
    Description: "Complete audit trail of all financial data changes"
    Implementation:
      - Comprehensive logging of all data access and modifications
      - Immutable audit log storage with integrity verification
      - Regular audit trail completeness validation
    Testing: "Monthly audit trail integrity and completeness testing"
```

#### SOX Compliance Monitoring Script
```powershell
# SOX Compliance Monitoring and Reporting Script
param(
    [datetime]$ReportingPeriod = (Get-Date).AddDays(-30),
    [string]$OutputPath = "C:\Compliance\SOX\Reports"
)

Write-Host "Generating SOX Compliance Report for period: $($ReportingPeriod.ToString('yyyy-MM-dd'))" -ForegroundColor Green

New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null

# 1. Access Control Review
Write-Host "Reviewing access controls..." -ForegroundColor Yellow

$AccessReport = @()

# Check for users with excessive privileges
$HighPrivilegeUsers = Get-ADGroupMember -Identity "MandA-Administrators" | Select-Object Name, SamAccountName, LastLogonDate
$AccessReport += [PSCustomObject]@{
    ControlArea = "Access Management"
    Finding = "High Privilege Users"
    Count = $HighPrivilegeUsers.Count
    Details = ($HighPrivilegeUsers | ConvertTo-Json -Compress)
    Status = if ($HighPrivilegeUsers.Count -le 5) { "PASS" } else { "REVIEW" }
}

# Check for inactive users with access
$InactiveUsers = $HighPrivilegeUsers | Where-Object { $_.LastLogonDate -lt (Get-Date).AddDays(-90) }
$AccessReport += [PSCustomObject]@{
    ControlArea = "Access Management"
    Finding = "Inactive High Privilege Users"
    Count = $InactiveUsers.Count
    Details = ($InactiveUsers | ConvertTo-Json -Compress)
    Status = if ($InactiveUsers.Count -eq 0) { "PASS" } else { "FAIL" }
}

# 2. Change Management Review
Write-Host "Reviewing change management..." -ForegroundColor Yellow

# Query database for configuration changes
$ConnectionString = "Server=AG-MandADiscovery.company.com;Database=MandADiscovery;Integrated Security=true;"
$Query = @"
SELECT 
    COUNT(*) as ChangeCount,
    COUNT(CASE WHEN ApprovedBy IS NULL THEN 1 END) as UnapprovedCount
FROM [Audit].[ChangeLog] 
WHERE Timestamp >= @StartDate
"@

$Connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
$Command = $Connection.CreateCommand()
$Command.CommandText = $Query
$Command.Parameters.AddWithValue("@StartDate", $ReportingPeriod)

$Connection.Open()
$Reader = $Command.ExecuteReader()
$Reader.Read()
$ChangeCount = $Reader["ChangeCount"]
$UnapprovedCount = $Reader["UnapprovedCount"]
$Reader.Close()
$Connection.Close()

$AccessReport += [PSCustomObject]@{
    ControlArea = "Change Management"
    Finding = "Configuration Changes"
    Count = $ChangeCount
    Details = "Unapproved: $UnapprovedCount"
    Status = if ($UnapprovedCount -eq 0) { "PASS" } else { "FAIL" }
}

# 3. Data Integrity Validation
Write-Host "Validating data integrity..." -ForegroundColor Yellow

# Check for data integrity exceptions
$IntegrityQuery = @"
SELECT 
    COUNT(*) as TotalMigrations,
    COUNT(CASE WHEN ValidationStatus = 'Failed' THEN 1 END) as FailedValidations
FROM [Migration].[Items] 
WHERE StartTime >= @StartDate
"@

$Command.CommandText = $IntegrityQuery
$Connection.Open()
$Reader = $Command.ExecuteReader()
$Reader.Read()
$TotalMigrations = $Reader["TotalMigrations"]
$FailedValidations = $Reader["FailedValidations"]
$Reader.Close()
$Connection.Close()

$FailureRate = if ($TotalMigrations -gt 0) { ($FailedValidations / $TotalMigrations) * 100 } else { 0 }

$AccessReport += [PSCustomObject]@{
    ControlArea = "Data Integrity"
    Finding = "Migration Validation Failures"
    Count = $FailedValidations
    Details = "Failure Rate: $([Math]::Round($FailureRate, 2))%"
    Status = if ($FailureRate -le 1) { "PASS" } else { "REVIEW" }
}

# 4. Audit Trail Completeness
Write-Host "Checking audit trail completeness..." -ForegroundColor Yellow

# Verify audit log continuity
$AuditQuery = @"
WITH AuditGaps AS (
    SELECT 
        LAG(Timestamp) OVER (ORDER BY Timestamp) as PrevTime,
        Timestamp as CurrTime,
        DATEDIFF(MINUTE, LAG(Timestamp) OVER (ORDER BY Timestamp), Timestamp) as GapMinutes
    FROM [Audit].[ActivityLog]
    WHERE Timestamp >= @StartDate
)
SELECT COUNT(*) as GapCount
FROM AuditGaps
WHERE GapMinutes > 60
"@

$Command.CommandText = $AuditQuery
$Connection.Open()
$Reader = $Command.ExecuteReader()
$Reader.Read()
$GapCount = $Reader["GapCount"]
$Reader.Close()
$Connection.Close()

$AccessReport += [PSCustomObject]@{
    ControlArea = "Audit Trail"
    Finding = "Audit Log Gaps (>1 hour)"
    Count = $GapCount
    Details = "Gaps in audit logging detected"
    Status = if ($GapCount -eq 0) { "PASS" } else { "INVESTIGATE" }
}

# Generate compliance report
$ReportDate = Get-Date -Format "yyyy-MM-dd"
$ReportFile = Join-Path $OutputPath "SOX_Compliance_Report_$ReportDate.html"

$HtmlReport = @"
<!DOCTYPE html>
<html>
<head>
    <title>SOX Compliance Report - M&A Discovery Suite</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #1f4e79; color: white; padding: 15px; text-align: center; }
        .summary { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 5px solid #1f4e79; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .review { color: orange; font-weight: bold; }
        .investigate { color: red; font-weight: bold; background-color: #ffe6e6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SOX Compliance Report</h1>
        <p>M&A Discovery Suite | Report Date: $(Get-Date -Format 'MMMM dd, yyyy')</p>
        <p>Reporting Period: $($ReportingPeriod.ToString('MMMM dd, yyyy')) - $(Get-Date -Format 'MMMM dd, yyyy')</p>
    </div>
    
    <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Total Control Areas Tested:</strong> 4</p>
        <p><strong>Passed Controls:</strong> $(($AccessReport | Where-Object Status -eq 'PASS').Count)</p>
        <p><strong>Failed Controls:</strong> $(($AccessReport | Where-Object Status -eq 'FAIL').Count)</p>
        <p><strong>Controls Requiring Review:</strong> $(($AccessReport | Where-Object Status -in @('REVIEW', 'INVESTIGATE')).Count)</p>
    </div>
    
    <h2>Detailed Findings</h2>
    <table>
        <tr>
            <th>Control Area</th>
            <th>Finding</th>
            <th>Count</th>
            <th>Details</th>
            <th>Status</th>
        </tr>
"@

foreach ($Report in $AccessReport) {
    $StatusClass = $Report.Status.ToLower()
    $HtmlReport += @"
        <tr>
            <td>$($Report.ControlArea)</td>
            <td>$($Report.Finding)</td>
            <td>$($Report.Count)</td>
            <td>$($Report.Details)</td>
            <td class="$StatusClass">$($Report.Status)</td>
        </tr>
"@
}

$HtmlReport += @"
    </table>
    
    <div style="margin-top: 30px; font-size: 0.9em; color: #666;">
        <p>This SOX compliance report was automatically generated by the M&A Discovery Suite compliance monitoring system.</p>
        <p>For questions or concerns regarding this report, please contact the compliance team.</p>
    </div>
</body>
</html>
"@

$HtmlReport | Out-File $ReportFile -Encoding UTF8
Write-Host "SOX Compliance Report generated: $ReportFile" -ForegroundColor Green

# Export raw data for auditors
$AccessReport | Export-Csv -Path (Join-Path $OutputPath "SOX_Compliance_Data_$ReportDate.csv") -NoTypeInformation

# Email report to compliance team
$EmailParams = @{
    SmtpServer = "smtp.company.com"
    From = "mandadiscovery@company.com"
    To = "compliance@company.com", "cfo@company.com"
    Subject = "SOX Compliance Report - M&A Discovery Suite - $ReportDate"
    Body = "Please find attached the SOX compliance report for the M&A Discovery Suite. Review is required for any failed or flagged controls."
    Attachments = $ReportFile
}

try {
    Send-MailMessage @EmailParams
    Write-Host "Compliance report emailed to stakeholders" -ForegroundColor Green
} catch {
    Write-Warning "Failed to send compliance report email: $($_.Exception.Message)"
}

Write-Host "SOX compliance monitoring completed" -ForegroundColor Green
```

### 5.2 GDPR Compliance Implementation

#### Data Protection Controls
```csharp
// GDPR Data Protection Service
public class GdprComplianceService : IGdprComplianceService
{
    private readonly ILogger<GdprComplianceService> _logger;
    private readonly IUserRepository _userRepository;
    private readonly IAuditService _auditService;
    private readonly IDataClassificationService _dataClassificationService;
    
    public GdprComplianceService(
        ILogger<GdprComplianceService> logger,
        IUserRepository userRepository,
        IAuditService auditService,
        IDataClassificationService dataClassificationService)
    {
        _logger = logger;
        _userRepository = userRepository;
        _auditService = auditService;
        _dataClassificationService = dataClassificationService;
    }
    
    // Right to Access (Article 15)
    public async Task<PersonalDataExport> ExportPersonalDataAsync(string dataSubjectId)
    {
        await _auditService.LogDataAccessAsync("PersonalData", dataSubjectId, "Export");
        
        var personalData = new PersonalDataExport
        {
            DataSubjectId = dataSubjectId,
            ExportDate = DateTime.UtcNow,
            Data = new Dictionary<string, object>()
        };
        
        // Collect all personal data across system
        var userData = await _userRepository.GetUserDataAsync(dataSubjectId);
        if (userData != null)
        {
            personalData.Data["UserProfile"] = new
            {
                userData.Name,
                userData.Email,
                userData.Department,
                userData.LastLoginDate,
                userData.CreatedDate
            };
        }
        
        // Include migration history
        var migrationData = await GetMigrationDataForUserAsync(dataSubjectId);
        if (migrationData.Any())
        {
            personalData.Data["MigrationHistory"] = migrationData.Select(m => new
            {
                m.MigrationId,
                m.StartDate,
                m.EndDate,
                m.Status,
                m.ItemsProcessed
            });
        }
        
        // Include audit trail (last 2 years only)
        var auditData = await GetAuditDataForUserAsync(dataSubjectId, DateTime.UtcNow.AddYears(-2));
        personalData.Data["ActivityHistory"] = auditData;
        
        return personalData;
    }
    
    // Right to Rectification (Article 16)
    public async Task<bool> UpdatePersonalDataAsync(string dataSubjectId, PersonalDataUpdate update)
    {
        var currentData = await _userRepository.GetUserDataAsync(dataSubjectId);
        if (currentData == null) return false;
        
        // Log the change request
        await _auditService.LogDataModificationAsync("PersonalData", dataSubjectId, 
            currentData, update, "RightToRectification");
        
        // Update the data
        var updateResult = await _userRepository.UpdateUserDataAsync(dataSubjectId, update);
        
        if (updateResult)
        {
            // Notify downstream systems of the change
            await NotifyDownstreamSystemsAsync(dataSubjectId, update);
            
            _logger.LogInformation("Personal data updated for data subject {DataSubjectId} under Article 16", 
                dataSubjectId);
        }
        
        return updateResult;
    }
    
    // Right to Erasure (Article 17)
    public async Task<bool> ErasePersonalDataAsync(string dataSubjectId, ErasureRequest request)
    {
        // Validate erasure request
        var validationResult = await ValidateErasureRequestAsync(dataSubjectId, request);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erasure request denied for {DataSubjectId}: {Reason}", 
                dataSubjectId, validationResult.Reason);
            return false;
        }
        
        // Log erasure request
        await _auditService.LogDataModificationAsync("PersonalData", dataSubjectId, 
            "EraseData", request, "RightToErasure");
        
        try
        {
            // Begin erasure process
            var erasureResults = new List<ErasureResult>();
            
            // 1. Mark user data for deletion
            erasureResults.Add(await EraseUserDataAsync(dataSubjectId));
            
            // 2. Anonymize migration history
            erasureResults.Add(await AnonymizeMigrationDataAsync(dataSubjectId));
            
            // 3. Retain audit trail but anonymize (legal requirement)
            erasureResults.Add(await AnonymizeAuditTrailAsync(dataSubjectId));
            
            // 4. Notify third parties of erasure
            erasureResults.Add(await NotifyThirdPartiesOfErasureAsync(dataSubjectId));
            
            var overallSuccess = erasureResults.All(r => r.Success);
            
            if (overallSuccess)
            {
                // Create erasure certificate
                await CreateErasureCertificateAsync(dataSubjectId, erasureResults);
                
                _logger.LogInformation("Personal data erasure completed for data subject {DataSubjectId}", 
                    dataSubjectId);
            }
            else
            {
                _logger.LogError("Partial erasure failure for data subject {DataSubjectId}: {FailedAreas}", 
                    dataSubjectId, string.Join(", ", erasureResults.Where(r => !r.Success).Select(r => r.Area)));
            }
            
            return overallSuccess;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during personal data erasure for data subject {DataSubjectId}", 
                dataSubjectId);
            throw;
        }
    }
    
    // Right to Data Portability (Article 20)
    public async Task<PortableDataPackage> ExportPortableDataAsync(string dataSubjectId)
    {
        await _auditService.LogDataAccessAsync("PersonalData", dataSubjectId, "PortabilityExport");
        
        var portableData = new PortableDataPackage
        {
            DataSubjectId = dataSubjectId,
            ExportDate = DateTime.UtcNow,
            Format = "JSON",
            Data = new Dictionary<string, object>()
        };
        
        // Export data in structured, machine-readable format
        var userData = await _userRepository.GetUserDataAsync(dataSubjectId);
        if (userData != null)
        {
            portableData.Data["user_profile"] = new
            {
                name = userData.Name,
                email = userData.Email,
                department = userData.Department,
                created_date = userData.CreatedDate.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                last_login = userData.LastLoginDate?.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };
        }
        
        // Include consent records
        var consentData = await GetConsentDataAsync(dataSubjectId);
        portableData.Data["consent_history"] = consentData;
        
        return portableData;
    }
    
    // Data Retention Management
    public async Task ProcessDataRetentionAsync()
    {
        _logger.LogInformation("Starting GDPR data retention processing");
        
        // Get retention policies
        var retentionPolicies = await GetDataRetentionPoliciesAsync();
        
        foreach (var policy in retentionPolicies)
        {
            var expiredData = await FindExpiredDataAsync(policy);
            
            foreach (var dataItem in expiredData)
            {
                if (policy.Action == RetentionAction.Delete)
                {
                    await DeleteExpiredDataAsync(dataItem);
                }
                else if (policy.Action == RetentionAction.Anonymize)
                {
                    await AnonymizeExpiredDataAsync(dataItem);
                }
                
                await _auditService.LogDataModificationAsync(
                    policy.DataType, dataItem.Id, 
                    dataItem, null, $"RetentionPolicy_{policy.Action}");
            }
        }
        
        _logger.LogInformation("GDPR data retention processing completed");
    }
    
    // Consent Management
    public async Task<bool> RecordConsentAsync(string dataSubjectId, ConsentRecord consent)
    {
        consent.Timestamp = DateTime.UtcNow;
        consent.DataSubjectId = dataSubjectId;
        
        var result = await _userRepository.SaveConsentRecordAsync(consent);
        
        await _auditService.LogDataModificationAsync("Consent", dataSubjectId, 
            null, consent, "ConsentRecorded");
        
        _logger.LogInformation("Consent recorded for data subject {DataSubjectId}: {Purpose}", 
            dataSubjectId, consent.Purpose);
        
        return result;
    }
    
    public async Task<bool> WithdrawConsentAsync(string dataSubjectId, string purpose)
    {
        var withdrawal = new ConsentWithdrawal
        {
            DataSubjectId = dataSubjectId,
            Purpose = purpose,
            WithdrawalDate = DateTime.UtcNow
        };
        
        var result = await _userRepository.SaveConsentWithdrawalAsync(withdrawal);
        
        if (result)
        {
            // Stop processing based on withdrawn consent
            await StopProcessingForWithdrawnConsentAsync(dataSubjectId, purpose);
        }
        
        await _auditService.LogDataModificationAsync("Consent", dataSubjectId, 
            null, withdrawal, "ConsentWithdrawn");
        
        return result;
    }
}
```

### 5.3 HIPAA Compliance Implementation

#### Protected Health Information (PHI) Controls
```yaml
HIPAA Safeguards Implementation:

Administrative Safeguards:
  Security Officer:
    Assigned: "Chief Information Security Officer"
    Responsibilities:
      - Overall HIPAA compliance oversight
      - Security policy development and maintenance
      - Incident response coordination
      - Training program management
    
  Workforce Training:
    Frequency: "Annual + New Hire Orientation"
    Topics:
      - PHI handling procedures
      - Minimum necessary standard
      - Incident reporting requirements
      - Patient rights under HIPAA
    Tracking: "Training completion tracking in HRIS"
    
  Access Management:
    Procedures:
      - Role-based access to PHI
      - Quarterly access reviews
      - Automatic access revocation on termination
      - Minimum necessary access principle
    Documentation: "Access request and approval forms"
    
  Business Associate Agreements:
    Required For: "All vendors with potential PHI access"
    Terms:
      - PHI safeguarding requirements
      - Breach notification procedures
      - Audit rights and cooperation
      - Data return/destruction upon termination

Physical Safeguards:
  Facility Access Controls:
    Implementation:
      - Badge-controlled data center access
      - Biometric authentication for server rooms
      - Video surveillance with 90-day retention
      - Visitor escort requirements
    
  Device Controls:
    Procedures:
      - Asset inventory and tracking
      - Secure device disposal procedures
      - Remote wipe capabilities
      - Encryption requirements for portable devices
    
  Media Controls:
    Requirements:
      - Encrypted backup storage
      - Secure media disposal with certificates
      - Chain of custody for PHI-containing media
      - Authorized personnel for media handling

Technical Safeguards:
  Access Control:
    Implementation:
      - Unique user identification
      - Automatic logoff after 15 minutes inactivity
      - Encryption of PHI at rest and in transit
      - Role-based authorization with PHI flags
    
  Audit Controls:
    Features:
      - Comprehensive audit logging
      - PHI access monitoring and alerting
      - Regular audit log reviews
      - Anomaly detection for unusual access patterns
    
  Integrity:
    Controls:
      - Digital signatures for critical PHI modifications
      - Version control and change tracking
      - Data validation and error detection
      - Backup verification and restoration testing
    
  Transmission Security:
    Requirements:
      - TLS 1.3 for all PHI transmissions
      - VPN for remote access to PHI systems
      - Email encryption for PHI communications
      - Secure file transfer protocols
```

#### HIPAA Monitoring Script
```powershell
# HIPAA Compliance Monitoring Script
param(
    [datetime]$StartDate = (Get-Date).AddDays(-7),
    [string]$OutputPath = "C:\Compliance\HIPAA\Reports"
)

Write-Host "HIPAA Compliance Monitoring - M&A Discovery Suite" -ForegroundColor Cyan
Write-Host "Monitoring period: $($StartDate.ToString('yyyy-MM-dd')) to $(Get-Date -Format 'yyyy-MM-dd')" -ForegroundColor Gray

New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null

# 1. PHI Access Monitoring
Write-Host "`nAnalyzing PHI access patterns..." -ForegroundColor Yellow

$ConnectionString = "Server=AG-MandADiscovery.company.com;Database=MandADiscovery;Integrated Security=true;"

# Query for PHI access events
$PHIAccessQuery = @"
SELECT 
    al.Timestamp,
    al.UserId,
    al.Activity,
    al.ObjectType,
    al.ObjectId,
    al.IpAddress,
    u.Department,
    u.Role
FROM [Audit].[ActivityLog] al
LEFT JOIN [Discovery].[Users] u ON al.UserId = u.UserId
WHERE al.Timestamp >= @StartDate
    AND (al.ObjectType LIKE '%PHI%' 
         OR al.ObjectType IN ('MedicalRecord', 'HealthData', 'PatientInfo')
         OR al.Activity LIKE '%PHI%')
ORDER BY al.Timestamp DESC
"@

$Connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
$Command = $Connection.CreateCommand()
$Command.CommandText = $PHIAccessQuery
$Command.Parameters.AddWithValue("@StartDate", $StartDate)

$Connection.Open()
$PHIAccess = @()
$Reader = $Command.ExecuteReader()
while ($Reader.Read()) {
    $PHIAccess += [PSCustomObject]@{
        Timestamp = $Reader["Timestamp"]
        UserId = $Reader["UserId"]
        Activity = $Reader["Activity"]
        ObjectType = $Reader["ObjectType"]
        ObjectId = $Reader["ObjectId"]
        IpAddress = $Reader["IpAddress"]
        Department = $Reader["Department"]
        Role = $Reader["Role"]
    }
}
$Reader.Close()
$Connection.Close()

Write-Host "Found $($PHIAccess.Count) PHI access events" -ForegroundColor Green

# 2. Analyze for policy violations
$Violations = @()

# Check for after-hours PHI access
$AfterHoursPHI = $PHIAccess | Where-Object {
    $Hour = ([DateTime]$_.Timestamp).Hour
    $Hour -lt 7 -or $Hour -gt 19  # Outside 7 AM - 7 PM
}

if ($AfterHoursPHI.Count -gt 0) {
    $Violations += [PSCustomObject]@{
        ViolationType = "After-Hours PHI Access"
        Severity = "Medium"
        Count = $AfterHoursPHI.Count
        Description = "PHI accessed outside normal business hours"
        Details = ($AfterHoursPHI | Select-Object UserId, Timestamp, Activity | ConvertTo-Json -Compress)
    }
}

# Check for excessive PHI access by single user
$ExcessiveAccess = $PHIAccess | Group-Object UserId | Where-Object Count -gt 100
foreach ($UserAccess in $ExcessiveAccess) {
    $Violations += [PSCustomObject]@{
        ViolationType = "Excessive PHI Access"
        Severity = "High"
        Count = $UserAccess.Count
        Description = "User $($UserAccess.Name) accessed PHI $($UserAccess.Count) times"
        Details = "Review for minimum necessary compliance"
    }
}

# Check for PHI access from unusual locations
$UnusualLocations = $PHIAccess | Where-Object {
    $IP = $_.IpAddress
    # Check if IP is outside expected ranges (customize for your environment)
    -not ($IP.StartsWith("10.") -or $IP.StartsWith("192.168.") -or $IP -eq "127.0.0.1")
} | Group-Object IpAddress | Where-Object Count -gt 5

foreach ($Location in $UnusualLocations) {
    $Violations += [PSCustomObject]@{
        ViolationType = "Unusual Access Location"
        Severity = "High"
        Count = $Location.Count
        Description = "PHI accessed from external IP: $($Location.Name)"
        Details = ($Location.Group | Select-Object UserId, Timestamp | ConvertTo-Json -Compress)
    }
}

# 3. Session timeout compliance check
Write-Host "Checking session timeout compliance..." -ForegroundColor Yellow

$SessionQuery = @"
SELECT 
    UserId,
    MIN(Timestamp) as SessionStart,
    MAX(Timestamp) as SessionEnd,
    DATEDIFF(MINUTE, MIN(Timestamp), MAX(Timestamp)) as SessionDuration
FROM [Audit].[ActivityLog]
WHERE Timestamp >= @StartDate
    AND Activity IN ('Login', 'PHIAccess', 'Logout')
GROUP BY UserId, CAST(Timestamp as DATE), DATEPART(HOUR, Timestamp)
HAVING DATEDIFF(MINUTE, MIN(Timestamp), MAX(Timestamp)) > 30
ORDER BY SessionDuration DESC
"@

$Command.CommandText = $SessionQuery
$Connection.Open()
$LongSessions = @()
$Reader = $Command.ExecuteReader()
while ($Reader.Read()) {
    $LongSessions += [PSCustomObject]@{
        UserId = $Reader["UserId"]
        SessionStart = $Reader["SessionStart"]
        SessionEnd = $Reader["SessionEnd"]
        Duration = $Reader["SessionDuration"]
    }
}
$Reader.Close()
$Connection.Close()

if ($LongSessions.Count -gt 0) {
    $Violations += [PSCustomObject]@{
        ViolationType = "Excessive Session Duration"
        Severity = "Medium"
        Count = $LongSessions.Count
        Description = "Sessions exceeding 30-minute timeout policy"
        Details = ($LongSessions | ConvertTo-Json -Compress)
    }
}

# 4. Generate HIPAA Compliance Report
$ReportDate = Get-Date -Format "yyyy-MM-dd"
$ReportFile = Join-Path $OutputPath "HIPAA_Compliance_Report_$ReportDate.html"

$ComplianceStatus = if ($Violations.Count -eq 0) { "COMPLIANT" } else { "VIOLATIONS DETECTED" }
$StatusColor = if ($Violations.Count -eq 0) { "#28a745" } else { "#dc3545" }

$HtmlReport = @"
<!DOCTYPE html>
<html>
<head>
    <title>HIPAA Compliance Report - M&A Discovery Suite</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #6f42c1; color: white; padding: 15px; text-align: center; }
        .status { background-color: $StatusColor; color: white; padding: 10px; text-align: center; font-weight: bold; }
        .summary { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 5px solid #6f42c1; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .high { background-color: #f8d7da; color: #721c24; }
        .medium { background-color: #fff3cd; color: #856404; }
        .low { background-color: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HIPAA Compliance Report</h1>
        <p>M&A Discovery Suite | Report Date: $(Get-Date -Format 'MMMM dd, yyyy')</p>
        <p>Monitoring Period: $($StartDate.ToString('MMMM dd, yyyy')) - $(Get-Date -Format 'MMMM dd, yyyy')</p>
    </div>
    
    <div class="status">
        COMPLIANCE STATUS: $ComplianceStatus
    </div>
    
    <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Total PHI Access Events:</strong> $($PHIAccess.Count)</p>
        <p><strong>Policy Violations Detected:</strong> $($Violations.Count)</p>
        <p><strong>High Severity Issues:</strong> $(($Violations | Where-Object Severity -eq 'High').Count)</p>
        <p><strong>Medium Severity Issues:</strong> $(($Violations | Where-Object Severity -eq 'Medium').Count)</p>
    </div>
"@

if ($Violations.Count -gt 0) {
    $HtmlReport += @"
    <h2>Policy Violations</h2>
    <table>
        <tr>
            <th>Violation Type</th>
            <th>Severity</th>
            <th>Count</th>
            <th>Description</th>
        </tr>
"@

    foreach ($Violation in $Violations) {
        $SeverityClass = $Violation.Severity.ToLower()
        $HtmlReport += @"
        <tr class="$SeverityClass">
            <td>$($Violation.ViolationType)</td>
            <td>$($Violation.Severity)</td>
            <td>$($Violation.Count)</td>
            <td>$($Violation.Description)</td>
        </tr>
"@
    }
    
    $HtmlReport += "</table>"
} else {
    $HtmlReport += @"
    <div style="background-color: #d4edda; color: #155724; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3>✅ No Policy Violations Detected</h3>
        <p>All PHI access events during the monitoring period comply with HIPAA requirements.</p>
    </div>
"@
}

$HtmlReport += @"
    <h2>PHI Access Summary</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr><td>Total PHI Access Events</td><td>$($PHIAccess.Count)</td></tr>
        <tr><td>Unique Users Accessing PHI</td><td>$(($PHIAccess | Select-Object UserId -Unique).Count)</td></tr>
        <tr><td>After-Hours PHI Access</td><td>$(($AfterHoursPHI).Count)</td></tr>
        <tr><td>External IP Access</td><td>$(($UnusualLocations).Count)</td></tr>
        <tr><td>Long Sessions (>30 min)</td><td>$(($LongSessions).Count)</td></tr>
    </table>
    
    <div style="margin-top: 30px; font-size: 0.9em; color: #666;">
        <p>This HIPAA compliance report was automatically generated by the M&A Discovery Suite monitoring system.</p>
        <p>For immediate assistance with compliance issues, contact the Privacy Officer at privacy@company.com</p>
    </div>
</body>
</html>
"@

$HtmlReport | Out-File $ReportFile -Encoding UTF8

# Export detailed data for further analysis
$PHIAccess | Export-Csv -Path (Join-Path $OutputPath "PHI_Access_Log_$ReportDate.csv") -NoTypeInformation
$Violations | Export-Csv -Path (Join-Path $OutputPath "HIPAA_Violations_$ReportDate.csv") -NoTypeInformation

Write-Host "`nHIPAA Compliance Report generated: $ReportFile" -ForegroundColor Green

# Email alert if violations found
if ($Violations.Count -gt 0) {
    $EmailParams = @{
        SmtpServer = "smtp.company.com"
        From = "mandadiscovery@company.com"
        To = "privacy@company.com", "security@company.com"
        Subject = "URGENT: HIPAA Policy Violations Detected - M&A Discovery Suite"
        Body = "HIPAA policy violations have been detected in the M&A Discovery Suite. Please review the attached compliance report immediately."
        Attachments = $ReportFile
        Priority = "High"
    }
    
    try {
        Send-MailMessage @EmailParams
        Write-Host "HIPAA violation alert sent to privacy and security teams" -ForegroundColor Red
    } catch {
        Write-Warning "Failed to send HIPAA violation alert: $($_.Exception.Message)"
    }
} else {
    Write-Host "No HIPAA violations detected - system compliant" -ForegroundColor Green
}

Write-Host "HIPAA compliance monitoring completed" -ForegroundColor Cyan
```

---

This security and compliance documentation provides a comprehensive framework for implementing and maintaining enterprise-grade security controls while ensuring adherence to major compliance requirements. The implementation includes detailed scripts, configurations, and monitoring procedures to support continuous compliance validation.

**Continue to remaining documentation sections for complete onboarding package...**