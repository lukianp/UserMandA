using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace MandADiscoverySuite.Services
{
    #region Configuration
    
    /// <summary>
    /// Configuration for Enterprise Monitoring Service
    /// </summary>
    public class EnterpriseMonitoringConfiguration
    {
        public string CustomerId { get; set; } = "DEFAULT";
        public string CustomerName { get; set; } = "Enterprise Customer";
        public string EnvironmentName { get; set; } = "Production";
        
        // Health Check Configuration
        public TimeSpan HealthCheckInterval { get; set; } = TimeSpan.FromMinutes(5);
        public TimeSpan MetricsCollectionInterval { get; set; } = TimeSpan.FromSeconds(30);
        
        // Performance Thresholds
        public long MemoryThresholdMB { get; set; } = 2048;
        public double CpuThresholdPercent { get; set; } = 80.0;
        public int ThreadCountThreshold { get; set; } = 200;
        public double SystemCpuThreshold { get; set; } = 85.0;
        public double SystemMemoryThreshold { get; set; } = 85.0;
        public double DiskIoThreshold { get; set; } = 80.0;
        public double DiskSpaceThresholdPercent { get; set; } = 15.0;
        public long DatabaseResponseThresholdMs { get; set; } = 1000;
        
        // External Service Endpoints
        public string ExchangeOnlineEndpoint { get; set; } = "https://outlook.office365.com";
        public string SharePointOnlineEndpoint { get; set; } = "https://graph.microsoft.com";
        public string AzureADEndpoint { get; set; } = "https://login.microsoftonline.com";
        
        // Alert Configuration
        public bool EmailAlertsEnabled { get; set; } = true;
        public bool SlackAlertsEnabled { get; set; } = false;
        public bool SiemIntegrationEnabled { get; set; } = false;
        public bool WebhookAlertsEnabled { get; set; } = false;
        
        public EmailAlertConfiguration EmailConfiguration { get; set; } = new EmailAlertConfiguration();
        public SlackAlertConfiguration SlackConfiguration { get; set; } = new SlackAlertConfiguration();
        public SiemAlertConfiguration SiemConfiguration { get; set; } = new SiemAlertConfiguration();
        public WebhookAlertConfiguration WebhookConfiguration { get; set; } = new WebhookAlertConfiguration();
        
        // Logging
        public string AlertLogPath { get; set; } = @"C:\ProgramData\MandADiscoverySuite\Logs\Alerts";
        public string MetricsLogPath { get; set; } = @"C:\ProgramData\MandADiscoverySuite\Logs\Metrics";
    }
    
    public class EmailAlertConfiguration
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; } = 587;
        public bool UseSSL { get; set; } = true;
        public string Username { get; set; }
        public string Password { get; set; }
        public string FromAddress { get; set; }
        public List<string> ToAddresses { get; set; } = new List<string>();
        public List<string> CriticalAlertToAddresses { get; set; } = new List<string>();
    }
    
    public class SlackAlertConfiguration
    {
        public string WebhookUrl { get; set; }
        public string Channel { get; set; } = "#alerts";
        public string Username { get; set; } = "M&A Discovery Suite Monitor";
        public string IconEmoji { get; set; } = ":warning:";
    }
    
    public class SiemAlertConfiguration
    {
        public string SiemType { get; set; } // "Splunk", "ArcSight", "QRadar", etc.
        public string Endpoint { get; set; }
        public string ApiKey { get; set; }
        public Dictionary<string, string> CustomFields { get; set; } = new Dictionary<string, string>();
    }
    
    public class WebhookAlertConfiguration
    {
        public string Url { get; set; }
        public Dictionary<string, string> Headers { get; set; } = new Dictionary<string, string>();
        public string AuthenticationScheme { get; set; } // "Bearer", "Basic", etc.
        public string AuthenticationToken { get; set; }
    }
    
    #endregion
    
    #region Health Check Models
    
    public enum HealthStatus
    {
        Unknown,
        Healthy,
        Warning,
        Critical
    }
    
    public class HealthCheckResult
    {
        public string CheckName { get; set; }
        public HealthStatus Status { get; set; } = HealthStatus.Unknown;
        public string Message { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }
    
    public class SystemHealthStatus
    {
        public HealthStatus OverallStatus { get; set; }
        public List<HealthCheckResult> HealthChecks { get; set; } = new List<HealthCheckResult>();
        public int CriticalIssueCount { get; set; }
        public int WarningIssueCount { get; set; }
        public DateTime LastUpdated { get; set; }
    }
    
    #endregion
    
    #region Alert Models
    
    public enum AlertLevel
    {
        Info,
        Warning,
        Critical,
        Emergency
    }
    
    public class AlertEvent
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public AlertLevel Level { get; set; }
        public string Source { get; set; }
        public string Category { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }
        public string CustomerId { get; set; }
        public Dictionary<string, string> Properties { get; set; } = new Dictionary<string, string>();
        public bool IsAcknowledged { get; set; }
        public string AcknowledgedBy { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
    }
    
    #endregion
    
    #region Performance Models
    
    public class PerformanceMetricsSummary
    {
        public double AverageResponseTimeMs { get; set; }
        public double ThroughputPerSecond { get; set; }
        public double ErrorRatePercent { get; set; }
        public double MemoryUsageMB { get; set; }
        public double CpuUsagePercent { get; set; }
        public double DiskIoUsagePercent { get; set; }
        public double NetworkIoMbps { get; set; }
        public int ActiveConnections { get; set; }
        public DateTime LastUpdated { get; set; }
    }
    
    public class PerformanceThresholdViolation
    {
        public string MetricName { get; set; }
        public double CurrentValue { get; set; }
        public double ThresholdValue { get; set; }
        public string Severity { get; set; }
        public DateTime Timestamp { get; set; }
    }
    
    #endregion
    
    #region Customer Success Models
    
    public class CustomerSuccessMetrics
    {
        public double MigrationSuccessRate { get; set; }
        public double UserAdoptionRate { get; set; }
        public double HealthScore { get; set; }
        public int OpenTicketCount { get; set; }
        public double AverageResolutionTimeHours { get; set; }
        public int TotalMigrationsCompleted { get; set; }
        public int TotalUsersMigrated { get; set; }
        public DateTime LastMigrationDate { get; set; }
        public List<string> RecentIssues { get; set; } = new List<string>();
    }
    
    #endregion
    
    #region Security Models
    
    public class SecurityMonitoringReport
    {
        public int SecurityEventsLast24Hours { get; set; }
        public int FailedAuthenticationAttempts { get; set; }
        public int SuspiciousActivitiesCount { get; set; }
        public DateTime LastSecurityScan { get; set; }
        public List<SecurityEvent> RecentSecurityEvents { get; set; } = new List<SecurityEvent>();
        public bool SecurityPoliciesCompliant { get; set; }
    }
    
    public class SecurityEvent
    {
        public string EventType { get; set; }
        public string Description { get; set; }
        public string Source { get; set; }
        public string UserAccount { get; set; }
        public string IpAddress { get; set; }
        public DateTime Timestamp { get; set; }
        public string Severity { get; set; }
    }
    
    #endregion
    
    #region Compliance Models
    
    public class ComplianceReport
    {
        public bool SoxCompliant { get; set; }
        public bool GdprCompliant { get; set; }
        public bool HipaaCompliant { get; set; }
        public bool AuditTrailIntegrity { get; set; }
        public bool DataRetentionCompliant { get; set; }
        public DateTime LastComplianceCheck { get; set; }
        public List<ComplianceViolation> Violations { get; set; } = new List<ComplianceViolation>();
    }
    
    public class ComplianceViolation
    {
        public string Type { get; set; }
        public string Description { get; set; }
        public string Severity { get; set; }
        public DateTime DetectedAt { get; set; }
        public string RemediationAction { get; set; }
        public bool IsResolved { get; set; }
    }
    
    #endregion
    
    #region System Information Models
    
    public class SystemMemoryInfo
    {
        public ulong TotalMemory { get; set; }
        public ulong AvailableMemory { get; set; }
    }
    
    public class LicenseInfo
    {
        public bool IsValid { get; set; }
        public string CustomerName { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string ErrorMessage { get; set; }
        public int MaxUsers { get; set; }
        public int CurrentUsers { get; set; }
    }
    
    #endregion
    
    #region Report Models
    
    [Flags]
    public enum MonitoringReportType
    {
        None = 0,
        SystemHealth = 1,
        Performance = 2,
        CustomerSuccess = 4,
        Security = 8,
        Compliance = 16,
        Full = SystemHealth | Performance | CustomerSuccess | Security | Compliance
    }
    
    #endregion
    
    #region Event Args
    
    public class CriticalAlertEventArgs : EventArgs
    {
        public AlertEvent Alert { get; set; }
    }
    
    public class HealthStatusChangedEventArgs : EventArgs
    {
        public string CheckName { get; set; }
        public HealthStatus PreviousStatus { get; set; }
        public HealthStatus CurrentStatus { get; set; }
        public string Message { get; set; }
    }
    
    public class EnterprisePerformanceThresholdEventArgs : EventArgs
    {
        public string MetricName { get; set; }
        public double CurrentValue { get; set; }
        public double ThresholdValue { get; set; }
        public string Severity { get; set; }
    }
    
    public class SecurityEventDetectedEventArgs : EventArgs
    {
        public SecurityEvent SecurityEvent { get; set; }
    }
    
    public class ComplianceViolationEventArgs : EventArgs
    {
        public ComplianceViolation Violation { get; set; }
    }
    
    #endregion
}