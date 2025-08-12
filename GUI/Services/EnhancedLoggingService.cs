using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Custom log levels for our logging system
    /// </summary>
    public enum LogLevel
    {
        Trace = 0,
        Debug = 1,
        Information = 2,
        Warning = 3,
        Error = 4,
        Critical = 5
    }
    /// <summary>
    /// Enhanced logging service with structured logging, performance tracking, and audit integration
    /// </summary>
    public class EnhancedLoggingService : IDisposable
    {
        private static EnhancedLoggingService _instance;
        private static readonly object _lock = new object();
        
        private readonly string _logDirectory;
        private readonly ConcurrentQueue<LogEntry> _logQueue;
        private readonly Timer _flushTimer;
        private readonly SemaphoreSlim _writeSemaphore = new SemaphoreSlim(1, 1);
        private readonly Dictionary<string, PerformanceTracker> _performanceTrackers = new();
        private readonly object _trackerLock = new object();
        private readonly LogLevel _minimumLogLevel = LogLevel.Debug;
        private bool _disposed = false;

        public static EnhancedLoggingService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new EnhancedLoggingService();
                    }
                }
                return _instance;
            }
        }

        private EnhancedLoggingService()
        {
            var config = ConfigurationService.Instance;
            var companyName = config.Settings?.DefaultCompany ?? "default";
            var companyPath = config.GetCompanyDataPath(companyName);
            _logDirectory = Path.Combine(companyPath, "Logs", "Application");
            Directory.CreateDirectory(_logDirectory);

            _logQueue = new ConcurrentQueue<LogEntry>();

            // Flush logs every 15 seconds
            _flushTimer = new Timer(FlushLogs, null, TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(15));

            _ = LogAsync(LogLevel.Debug, $"EnhancedLoggingService initialized. Directory: {_logDirectory}");
        }

        #region Helper Methods

        public bool IsEnabled(LogLevel logLevel) => logLevel >= _minimumLogLevel;

        /// <summary>
        /// Converts Microsoft.Extensions.Logging.LogLevel to our custom LogLevel
        /// </summary>
        private LogLevel ConvertLogLevel(Microsoft.Extensions.Logging.LogLevel msLogLevel)
        {
            return msLogLevel switch
            {
                Microsoft.Extensions.Logging.LogLevel.Trace => LogLevel.Trace,
                Microsoft.Extensions.Logging.LogLevel.Debug => LogLevel.Debug,
                Microsoft.Extensions.Logging.LogLevel.Information => LogLevel.Information,
                Microsoft.Extensions.Logging.LogLevel.Warning => LogLevel.Warning,
                Microsoft.Extensions.Logging.LogLevel.Error => LogLevel.Error,
                Microsoft.Extensions.Logging.LogLevel.Critical => LogLevel.Critical,
                _ => LogLevel.Information
            };
        }

        #endregion

        #region Enhanced Logging Methods

        /// <summary>
        /// Logs a message with structured data
        /// </summary>
        public async Task LogAsync(LogLevel level, string message, Exception exception = null, int? eventId = null, string category = null, object data = null, [CallerMemberName] string memberName = "", [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0)
        {
            try
            {
                var logEntry = new LogEntry
                {
                    Id = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    Level = level,
                    Message = message,
                    Exception = exception,
                    EventId = eventId,
                    Category = category ?? ExtractClassName(filePath),
                    Data = data,
                    MemberName = memberName,
                    FilePath = Path.GetFileName(filePath),
                    LineNumber = lineNumber,
                    ThreadId = Thread.CurrentThread.ManagedThreadId,
                    ProcessId = Environment.ProcessId
                };

                _logQueue.Enqueue(logEntry);

                // Also log to audit service for important events
                if (level >= LogLevel.Warning && AuditService.Instance != null)
                {
                    await AuditService.Instance.LogErrorAsync(logEntry.Category, exception ?? new InvalidOperationException(message), data);
                }

                // Immediately flush critical and error messages
                if (level >= LogLevel.Error)
                {
                    await FlushLogsAsync();
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to log message: {ex.Message}");
            }
        }

        /// <summary>
        /// Logs information with structured data
        /// </summary>
        public async Task LogInformationAsync(string message, object data = null, [CallerMemberName] string memberName = "", [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0)
        {
            await LogAsync(LogLevel.Information, message, null, null, null, data, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Logs warnings with structured data
        /// </summary>
        public async Task LogWarningAsync(string message, object data = null, [CallerMemberName] string memberName = "", [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0)
        {
            await LogAsync(LogLevel.Warning, message, null, null, null, data, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Logs errors with full exception details
        /// </summary>
        public async Task LogErrorAsync(string message, Exception exception = null, object data = null, [CallerMemberName] string memberName = "", [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0)
        {
            await LogAsync(LogLevel.Error, message, exception, null, null, data, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Logs debug information
        /// </summary>
        public async Task LogDebugAsync(string message, object data = null, [CallerMemberName] string memberName = "", [CallerFilePath] string filePath = "", [CallerLineNumber] int lineNumber = 0)
        {
            await LogAsync(LogLevel.Debug, message, null, null, null, data, memberName, filePath, lineNumber);
        }

        #endregion

        #region Performance Tracking

        /// <summary>
        /// Starts performance tracking for an operation
        /// </summary>
        public IDisposable BeginPerformanceTracking(string operationName, object parameters = null)
        {
            return new PerformanceTracker(operationName, parameters, this);
        }

        /// <summary>
        /// Logs performance metrics
        /// </summary>
        public async Task LogPerformanceAsync(string operationName, TimeSpan duration, object parameters = null, object result = null)
        {
            var performanceData = new
            {
                Operation = operationName,
                DurationMs = duration.TotalMilliseconds,
                Parameters = parameters,
                Result = result,
                PerformanceCategory = GetPerformanceCategory(duration)
            };

            await LogInformationAsync($"Performance: {operationName} completed in {duration.TotalMilliseconds:F2}ms", performanceData);

            // Log to audit service for tracking
            if (AuditService.Instance != null)
            {
                await AuditService.Instance.LogPerformanceMetricAsync(operationName, duration, performanceData);
            }
        }

        private string GetPerformanceCategory(TimeSpan duration)
        {
            return duration.TotalMilliseconds switch
            {
                < 100 => "Fast",
                < 500 => "Normal",
                < 2000 => "Slow",
                _ => "VerySlow"
            };
        }

        #endregion

        #region User Action Logging

        /// <summary>
        /// Logs user interactions and commands
        /// </summary>
        public async Task LogUserActionAsync(string action, string details = null, object data = null)
        {
            await LogInformationAsync($"User Action: {action}", new { Action = action, Details = details, Data = data });

            // Log to audit service
            if (AuditService.Instance != null)
            {
                await AuditService.Instance.LogUserActionAsync(action, details, data);
            }
        }

        /// <summary>
        /// Logs data operations
        /// </summary>
        public async Task LogDataOperationAsync(string operation, string target, int? recordCount = null, object metadata = null)
        {
            var operationData = new
            {
                Operation = operation,
                Target = target,
                RecordCount = recordCount,
                Metadata = metadata
            };

            await LogInformationAsync($"Data Operation: {operation} on {target}", operationData);

            // Log to audit service
            if (AuditService.Instance != null)
            {
                await AuditService.Instance.LogDataAccessAsync(target, operation, recordCount?.ToString());
            }
        }

        #endregion

        #region System Event Logging

        /// <summary>
        /// Logs application lifecycle events
        /// </summary>
        public async Task LogApplicationEventAsync(string eventName, string details = null, object data = null)
        {
            var eventData = new
            {
                Event = eventName,
                Details = details,
                Data = data,
                Timestamp = DateTime.UtcNow
            };

            await LogInformationAsync($"Application Event: {eventName}", eventData);
        }

        /// <summary>
        /// Logs startup performance and initialization
        /// </summary>
        public async Task LogStartupAsync(string version, TimeSpan initializationTime, Dictionary<string, TimeSpan> componentTimes = null)
        {
            var startupData = new
            {
                Version = version,
                InitializationTimeMs = initializationTime.TotalMilliseconds,
                ComponentTimes = componentTimes?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.TotalMilliseconds),
                UserName = Environment.UserName,
                MachineName = Environment.MachineName,
                OSVersion = Environment.OSVersion.ToString(),
                ProcessorCount = Environment.ProcessorCount,
                WorkingSet = Environment.WorkingSet
            };

            await LogInformationAsync($"Application started (v{version}) in {initializationTime.TotalSeconds:F2} seconds", startupData);

            // Log to audit service
            if (AuditService.Instance != null)
            {
                await AuditService.Instance.LogSystemStartupAsync(version, initializationTime);
            }
        }

        #endregion

        #region Log File Management

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
                var entries = new List<LogEntry>();
                while (_logQueue.TryDequeue(out var entry))
                {
                    entries.Add(entry);
                }

                if (entries.Count == 0) return;

                // Group entries by date for daily log files
                var groupedEntries = entries.GroupBy(e => e.Timestamp.Date);

                foreach (var group in groupedEntries)
                {
                    var logFileName = $"app_log_{group.Key:yyyyMMdd}.json";
                    var logFilePath = Path.Combine(_logDirectory, logFileName);

                    // Read existing entries
                    var existingEntries = new List<LogEntry>();
                    if (File.Exists(logFilePath))
                    {
                        try
                        {
                            var existingJson = await File.ReadAllTextAsync(logFilePath);
                            if (!string.IsNullOrEmpty(existingJson))
                            {
                                existingEntries = JsonSerializer.Deserialize<List<LogEntry>>(existingJson, JsonOptions) ?? new List<LogEntry>();
                            }
                        }
                        catch (JsonException)
                        {
                            // Backup corrupted file
                            var backupPath = $"{logFilePath}.backup_{DateTime.Now:yyyyMMddHHmmss}";
                            File.Move(logFilePath, backupPath);
                        }
                    }

                    // Add new entries
                    existingEntries.AddRange(group.OrderBy(e => e.Timestamp));

                    // Write to file
                    var json = JsonSerializer.Serialize(existingEntries, JsonOptions);
                    await File.WriteAllTextAsync(logFilePath, json);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to flush logs: {ex.Message}");
            }
            finally
            {
                _writeSemaphore.Release();
            }
        }

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        #endregion

        #region Query and Analysis

        /// <summary>
        /// Retrieves log entries for analysis
        /// </summary>
        public async Task<List<LogEntry>> GetLogsAsync(DateTime startDate, DateTime endDate, LogLevel? minLevel = null, string category = null)
        {
            var allEntries = new List<LogEntry>();

            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var logFileName = $"app_log_{date:yyyyMMdd}.json";
                var logFilePath = Path.Combine(_logDirectory, logFileName);

                if (File.Exists(logFilePath))
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(logFilePath);
                        if (!string.IsNullOrEmpty(json))
                        {
                            var entries = JsonSerializer.Deserialize<List<LogEntry>>(json, JsonOptions);
                            if (entries != null)
                            {
                                var filteredEntries = entries.Where(e => e.Timestamp >= startDate && e.Timestamp <= endDate);
                                
                                if (minLevel.HasValue)
                                    filteredEntries = filteredEntries.Where(e => e.Level >= minLevel.Value);
                                
                                if (!string.IsNullOrEmpty(category))
                                    filteredEntries = filteredEntries.Where(e => e.Category?.Contains(category, StringComparison.OrdinalIgnoreCase) == true);

                                allEntries.AddRange(filteredEntries);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine($"Failed to read log file {logFilePath}: {ex.Message}");
                    }
                }
            }

            return allEntries.OrderBy(e => e.Timestamp).ToList();
        }

        /// <summary>
        /// Gets logging statistics
        /// </summary>
        public async Task<LoggingStatistics> GetLoggingStatisticsAsync(DateTime startDate, DateTime endDate)
        {
            var logs = await GetLogsAsync(startDate, endDate);

            return new LoggingStatistics
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalEntries = logs.Count,
                ErrorCount = logs.Count(l => l.Level >= LogLevel.Error),
                WarningCount = logs.Count(l => l.Level == LogLevel.Warning),
                InformationCount = logs.Count(l => l.Level == LogLevel.Information),
                DebugCount = logs.Count(l => l.Level == LogLevel.Debug),
                CategoriesWithMostErrors = logs
                    .Where(l => l.Level >= LogLevel.Error)
                    .GroupBy(l => l.Category)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .ToDictionary(g => g.Key ?? "Unknown", g => g.Count()),
                TopExceptionTypes = logs
                    .Where(l => l.Exception != null)
                    .GroupBy(l => l.Exception.GetType().Name)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }

        #endregion

        #region Helper Methods

        private string ExtractClassName(string filePath)
        {
            if (string.IsNullOrEmpty(filePath)) return "Unknown";
            return Path.GetFileNameWithoutExtension(filePath);
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

    #region Supporting Classes

    public class PerformanceTracker : IDisposable
    {
        private readonly string _operationName;
        private readonly object _parameters;
        private readonly EnhancedLoggingService _loggingService;
        private readonly Stopwatch _stopwatch;

        public PerformanceTracker(string operationName, object parameters, EnhancedLoggingService loggingService)
        {
            _operationName = operationName;
            _parameters = parameters;
            _loggingService = loggingService;
            _stopwatch = Stopwatch.StartNew();
        }

        public void Dispose()
        {
            _stopwatch.Stop();
            _ = _loggingService.LogPerformanceAsync(_operationName, _stopwatch.Elapsed, _parameters);
        }
    }

    public class LogEntry
    {
        public Guid Id { get; set; }
        public DateTime Timestamp { get; set; }
        public LogLevel Level { get; set; }
        public string Message { get; set; }
        public Exception Exception { get; set; }
        public int? EventId { get; set; }
        public string Category { get; set; }
        public object Data { get; set; }
        public string MemberName { get; set; }
        public string FilePath { get; set; }
        public int LineNumber { get; set; }
        public int ThreadId { get; set; }
        public int ProcessId { get; set; }
    }

    public class LoggingStatistics
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalEntries { get; set; }
        public int ErrorCount { get; set; }
        public int WarningCount { get; set; }
        public int InformationCount { get; set; }
        public int DebugCount { get; set; }
        public Dictionary<string, int> CategoriesWithMostErrors { get; set; }
        public Dictionary<string, int> TopExceptionTypes { get; set; }
    }

    #endregion
}