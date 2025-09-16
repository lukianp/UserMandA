// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Comprehensive audit service for tracking user actions, system events, and security events
    /// </summary>
    public class AuditService
    {
        private static AuditService _instance;
        private static readonly object _lock = new object();
        
        private readonly string _auditLogDirectory;
        private readonly string _securityLogDirectory;
        private readonly ConcurrentQueue<AuditLogEntry> _auditQueue;
        private readonly Timer _flushTimer;
        private readonly SemaphoreSlim _writeSemaphore = new SemaphoreSlim(1, 1);
        private bool _disposed = false;

        public static AuditService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new AuditService();
                    }
                }
                return _instance;
            }
        }

        private AuditService()
        {
            var baseLogDirectory = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Logs");
            _auditLogDirectory = Path.Combine(baseLogDirectory, "Audit");
            _securityLogDirectory = Path.Combine(baseLogDirectory, "Security");
            
            Directory.CreateDirectory(_auditLogDirectory);
            Directory.CreateDirectory(_securityLogDirectory);
            
            _auditQueue = new ConcurrentQueue<AuditLogEntry>();
            
            // Flush logs to disk every 30 seconds
            _flushTimer = new Timer(FlushLogs, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));
        }

        #region User Action Logging

        /// <summary>
        /// Logs user actions for audit trails
        /// </summary>
        public async Task LogUserActionAsync(string action, string details = null, object data = null)
        {
            await LogAuditEventAsync(AuditEventType.UserAction, action, details, data, AuditLevel.Information);
        }

        /// <summary>
        /// Logs data access events
        /// </summary>
        public async Task LogDataAccessAsync(string resource, string action, string details = null)
        {
            await LogAuditEventAsync(AuditEventType.DataAccess, $"{action} - {resource}", details, null, AuditLevel.Information);
        }

        /// <summary>
        /// Logs export operations
        /// </summary>
        public async Task LogDataExportAsync(string dataType, string format, int recordCount, string destination)
        {
            var details = $"Exported {recordCount} {dataType} records to {format} format";
            var data = new { DataType = dataType, Format = format, RecordCount = recordCount, Destination = destination };
            await LogAuditEventAsync(AuditEventType.DataExport, "Data Export", details, data, AuditLevel.Warning);
        }

        /// <summary>
        /// Logs configuration changes
        /// </summary>
        public async Task LogConfigurationChangeAsync(string setting, object oldValue, object newValue)
        {
            var details = $"Setting '{setting}' changed from '{oldValue}' to '{newValue}'";
            var data = new { Setting = setting, OldValue = oldValue, NewValue = newValue };
            await LogAuditEventAsync(AuditEventType.ConfigurationChange, "Configuration Change", details, data, AuditLevel.Warning);
        }

        /// <summary>
        /// Logs discovery operations
        /// </summary>
        public async Task LogDiscoveryOperationAsync(string operation, string target, string status, string details = null)
        {
            var logDetails = $"{operation} on {target} - Status: {status}";
            if (!string.IsNullOrEmpty(details))
                logDetails += $" - {details}";
                
            var data = new { Operation = operation, Target = target, Status = status };
            await LogAuditEventAsync(AuditEventType.DiscoveryOperation, operation, logDetails, data, AuditLevel.Information);
        }

        #endregion

        #region Security Event Logging

        /// <summary>
        /// Logs authentication events
        /// </summary>
        public async Task LogAuthenticationAsync(string username, bool success, string details = null)
        {
            var action = success ? "Authentication Success" : "Authentication Failed";
            var level = success ? AuditLevel.Information : AuditLevel.Error;
            var data = new { Username = username, Success = success };
            
            await LogAuditEventAsync(AuditEventType.Authentication, action, details, data, level, isSecurityEvent: true);
        }

        /// <summary>
        /// Logs authorization events
        /// </summary>
        public async Task LogAuthorizationAsync(string username, string resource, bool granted, string details = null)
        {
            var action = granted ? "Access Granted" : "Access Denied";
            var level = granted ? AuditLevel.Information : AuditLevel.Warning;
            var logDetails = $"User '{username}' {(granted ? "granted" : "denied")} access to '{resource}'";
            if (!string.IsNullOrEmpty(details))
                logDetails += $" - {details}";
                
            var data = new { Username = username, Resource = resource, Granted = granted };
            await LogAuditEventAsync(AuditEventType.Authorization, action, logDetails, data, level, isSecurityEvent: true);
        }

        /// <summary>
        /// Logs potential security threats
        /// </summary>
        public async Task LogSecurityThreatAsync(string threatType, string description, string source = null)
        {
            var details = $"Security threat detected: {threatType} - {description}";
            if (!string.IsNullOrEmpty(source))
                details += $" - Source: {source}";
                
            var data = new { ThreatType = threatType, Description = description, Source = source };
            await LogAuditEventAsync(AuditEventType.SecurityThreat, "Security Threat", details, data, AuditLevel.Critical, isSecurityEvent: true);
        }

        #endregion

        #region System Event Logging

        /// <summary>
        /// Logs system startup events
        /// </summary>
        public async Task LogSystemStartupAsync(string version, TimeSpan startupTime)
        {
            var details = $"Application started (v{version}) in {startupTime.TotalSeconds:F2} seconds";
            var data = new { Version = version, StartupTimeMs = startupTime.TotalMilliseconds };
            await LogAuditEventAsync(AuditEventType.SystemEvent, "Application Startup", details, data, AuditLevel.Information);
        }

        /// <summary>
        /// Logs system shutdown events
        /// </summary>
        public async Task LogSystemShutdownAsync(TimeSpan uptime, string reason = null)
        {
            var details = $"Application shutdown after {uptime.TotalMinutes:F1} minutes of uptime";
            if (!string.IsNullOrEmpty(reason))
                details += $" - Reason: {reason}";
                
            var data = new { UptimeMs = uptime.TotalMilliseconds, Reason = reason };
            await LogAuditEventAsync(AuditEventType.SystemEvent, "Application Shutdown", details, data, AuditLevel.Information);
        }

        /// <summary>
        /// Logs performance metrics
        /// </summary>
        public async Task LogPerformanceMetricAsync(string operation, TimeSpan duration, object additionalData = null)
        {
            var details = $"Operation '{operation}' completed in {duration.TotalMilliseconds:F2}ms";
            var data = new { Operation = operation, DurationMs = duration.TotalMilliseconds, AdditionalData = additionalData };
            await LogAuditEventAsync(AuditEventType.PerformanceMetric, "Performance Metric", details, data, AuditLevel.Debug);
        }

        /// <summary>
        /// Logs errors and exceptions
        /// </summary>
        public async Task LogErrorAsync(string context, Exception exception, object additionalData = null)
        {
            var details = $"Error in {context}: {exception.Message}";
            var data = new 
            { 
                Context = context,
                ExceptionType = exception.GetType().Name,
                Message = exception.Message,
                StackTrace = exception.StackTrace,
                InnerException = exception.InnerException?.Message,
                AdditionalData = additionalData
            };
            await LogAuditEventAsync(AuditEventType.Error, "Application Error", details, data, AuditLevel.Error);
        }

        #endregion

        #region Core Logging Infrastructure

        private async Task LogAuditEventAsync(AuditEventType eventType, string action, string details, object data, AuditLevel level, bool isSecurityEvent = false)
        {
            try
            {
                var auditEntry = new AuditLogEntry
                {
                    Id = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    EventType = eventType,
                    Action = action,
                    Details = details,
                    Level = level,
                    UserName = Environment.UserName,
                    MachineName = Environment.MachineName,
                    ProcessId = Environment.ProcessId,
                    ThreadId = Thread.CurrentThread.ManagedThreadId,
                    Data = data,
                    IsSecurityEvent = isSecurityEvent
                };

                _auditQueue.Enqueue(auditEntry);

                // Immediately flush high-priority events
                if (level >= AuditLevel.Error)
                {
                    await FlushLogsAsync();
                }
            }
            catch (Exception ex)
            {
                // Log to system event log as fallback
                System.Diagnostics.Debug.WriteLine($"Failed to log audit event: {ex.Message}");
            }
        }

        private void FlushLogs(object state)
        {
            _ = Task.Run(async () => await FlushLogsAsync());
        }

        private async Task FlushLogsAsync()
        {
            if (_disposed) return;

            await _writeSemaphore.WaitAsync();
            try
            {
                var entries = new List<AuditLogEntry>();
                while (_auditQueue.TryDequeue(out var entry))
                {
                    entries.Add(entry);
                }

                if (entries.Count == 0) return;

                // Group entries by date and security flag for different log files
                var groupedEntries = entries.GroupBy(e => new { Date = e.Timestamp.Date, IsSecurityEvent = e.IsSecurityEvent });

                foreach (var group in groupedEntries)
                {
                    var logDirectory = group.Key.IsSecurityEvent ? _securityLogDirectory : _auditLogDirectory;
                    var logFileName = group.Key.IsSecurityEvent 
                        ? $"security_audit_{group.Key.Date:yyyyMMdd}.json"
                        : $"audit_log_{group.Key.Date:yyyyMMdd}.json";
                    var logFilePath = Path.Combine(logDirectory, logFileName);

                    // Read existing entries if file exists
                    var existingEntries = new List<AuditLogEntry>();
                    if (File.Exists(logFilePath))
                    {
                        try
                        {
                            var existingJson = await File.ReadAllTextAsync(logFilePath);
                            if (!string.IsNullOrEmpty(existingJson))
                            {
                                existingEntries = JsonSerializer.Deserialize<List<AuditLogEntry>>(existingJson) ?? new List<AuditLogEntry>();
                            }
                        }
                        catch (JsonException)
                        {
                            // If JSON is corrupted, backup the file and start fresh
                            var backupPath = $"{logFilePath}.backup_{DateTime.Now:yyyyMMddHHmmss}";
                            File.Move(logFilePath, backupPath);
                        }
                    }

                    // Add new entries
                    existingEntries.AddRange(group.OrderBy(e => e.Timestamp));

                    // Write back to file with pretty formatting
                    var options = new JsonSerializerOptions
                    {
                        WriteIndented = true,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    };

                    var json = JsonSerializer.Serialize(existingEntries, options);
                    await File.WriteAllTextAsync(logFilePath, json);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to flush audit logs: {ex.Message}");
            }
            finally
            {
                _writeSemaphore.Release();
            }
        }

        #endregion

        #region Log Retrieval and Analysis

        /// <summary>
        /// Retrieves audit logs for a specific date range
        /// </summary>
        public async Task<List<AuditLogEntry>> GetAuditLogsAsync(DateTime startDate, DateTime endDate, AuditEventType? eventType = null, bool includeSecurityEvents = false)
        {
            var allEntries = new List<AuditLogEntry>();

            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var logDirectory = includeSecurityEvents ? _securityLogDirectory : _auditLogDirectory;
                var logFileName = includeSecurityEvents 
                    ? $"security_audit_{date:yyyyMMdd}.json"
                    : $"audit_log_{date:yyyyMMdd}.json";
                var logFilePath = Path.Combine(logDirectory, logFileName);

                if (File.Exists(logFilePath))
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(logFilePath);
                        if (!string.IsNullOrEmpty(json))
                        {
                            var entries = JsonSerializer.Deserialize<List<AuditLogEntry>>(json, new JsonSerializerOptions
                            {
                                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                            });

                            if (entries != null)
                            {
                                var filteredEntries = entries.Where(e => e.Timestamp >= startDate && e.Timestamp <= endDate);
                                
                                if (eventType.HasValue)
                                    filteredEntries = filteredEntries.Where(e => e.EventType == eventType.Value);

                                allEntries.AddRange(filteredEntries);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Failed to read audit log {logFilePath}: {ex.Message}");
                    }
                }
            }

            return allEntries.OrderBy(e => e.Timestamp).ToList();
        }

        /// <summary>
        /// Gets audit statistics for a date range
        /// </summary>
        public async Task<AuditStatistics> GetAuditStatisticsAsync(DateTime startDate, DateTime endDate)
        {
            var logs = await GetAuditLogsAsync(startDate, endDate);
            var securityLogs = await GetAuditLogsAsync(startDate, endDate, includeSecurityEvents: true);

            return new AuditStatistics
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalEvents = logs.Count + securityLogs.Count,
                UserActions = logs.Count(e => e.EventType == AuditEventType.UserAction),
                DataAccesses = logs.Count(e => e.EventType == AuditEventType.DataAccess),
                DataExports = logs.Count(e => e.EventType == AuditEventType.DataExport),
                ConfigurationChanges = logs.Count(e => e.EventType == AuditEventType.ConfigurationChange),
                DiscoveryOperations = logs.Count(e => e.EventType == AuditEventType.DiscoveryOperation),
                Errors = logs.Count(e => e.EventType == AuditEventType.Error),
                SecurityEvents = securityLogs.Count,
                AuthenticationEvents = securityLogs.Count(e => e.EventType == AuditEventType.Authentication),
                AuthorizationEvents = securityLogs.Count(e => e.EventType == AuditEventType.Authorization),
                SecurityThreats = securityLogs.Count(e => e.EventType == AuditEventType.SecurityThreat),
                EventsByLevel = (logs.Concat(securityLogs))
                    .GroupBy(e => e.Level)
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }

        #endregion

        #region Cleanup and Maintenance

        /// <summary>
        /// Cleans up old log files beyond the retention period
        /// </summary>
        public async Task CleanupOldLogsAsync(int retentionDays = 90)
        {
            var cutoffDate = DateTime.Now.AddDays(-retentionDays);

            await CleanupLogDirectory(_auditLogDirectory, cutoffDate);
            await CleanupLogDirectory(_securityLogDirectory, cutoffDate);
        }

        private async Task CleanupLogDirectory(string directory, DateTime cutoffDate)
        {
            try
            {
                var files = Directory.GetFiles(directory, "*.json");
                
                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    if (fileInfo.CreationTime < cutoffDate)
                    {
                        // Archive old files instead of deleting them
                        var archiveDirectory = Path.Combine(directory, "Archive");
                        Directory.CreateDirectory(archiveDirectory);
                        
                        var archivePath = Path.Combine(archiveDirectory, fileInfo.Name);
                        File.Move(file, archivePath);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to cleanup log directory {directory}: {ex.Message}");
            }
        }

        #endregion

        public void Dispose()
        {
            if (!_disposed)
            {
                _disposed = true;
                _flushTimer?.Dispose();
                _ = Task.Run(async () => await FlushLogsAsync());
                _writeSemaphore?.Dispose();
            }
        }
    }

    #region Models

    public class AuditLogEntry
    {
        public Guid Id { get; set; }
        public DateTime Timestamp { get; set; }
        public AuditEventType EventType { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public AuditLevel Level { get; set; }
        public string UserName { get; set; }
        public string MachineName { get; set; }
        public int ProcessId { get; set; }
        public int ThreadId { get; set; }
        public object Data { get; set; }
        public bool IsSecurityEvent { get; set; }
    }

    public enum AuditEventType
    {
        UserAction,
        DataAccess,
        DataExport,
        ConfigurationChange,
        DiscoveryOperation,
        Authentication,
        Authorization,
        SecurityThreat,
        SystemEvent,
        PerformanceMetric,
        Error
    }

    public enum AuditLevel
    {
        Debug = 0,
        Information = 1,
        Warning = 2,
        Error = 3,
        Critical = 4
    }

    public class AuditStatistics
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalEvents { get; set; }
        public int UserActions { get; set; }
        public int DataAccesses { get; set; }
        public int DataExports { get; set; }
        public int ConfigurationChanges { get; set; }
        public int DiscoveryOperations { get; set; }
        public int Errors { get; set; }
        public int SecurityEvents { get; set; }
        public int AuthenticationEvents { get; set; }
        public int AuthorizationEvents { get; set; }
        public int SecurityThreats { get; set; }
        public Dictionary<AuditLevel, int> EventsByLevel { get; set; }
    }

    #endregion
}