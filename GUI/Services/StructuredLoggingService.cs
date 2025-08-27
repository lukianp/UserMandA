using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Centralized structured logging service with format: [YYYY-MM-DDThh:mm:ss.fffZ] [LEVEL] [SOURCE] key=value | message
    /// </summary>
    public class StructuredLoggingService : IDisposable
    {
        private static StructuredLoggingService _instance;
        private static readonly object _lock = new object();
        
        private readonly string _logDirectory;
        private readonly ConcurrentQueue<StructuredLogEntry> _logQueue;
        private readonly Timer _flushTimer;
        private readonly SemaphoreSlim _writeSemaphore = new SemaphoreSlim(1, 1);
        private bool _disposed = false;

        public static StructuredLoggingService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new StructuredLoggingService();
                    }
                }
                return _instance;
            }
        }

        private StructuredLoggingService()
        {
            _logDirectory = @"C:\DiscoveryData\ljpops\Logs";
            Directory.CreateDirectory(_logDirectory);
            
            _logQueue = new ConcurrentQueue<StructuredLogEntry>();

            // Flush logs every 10 seconds
            _flushTimer = new Timer(FlushLogs, null, TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(10));

            LogStructured("INFO", "StructuredLoggingService", new { component = "logging", status = "initialized" }, "Centralized structured logging service started");
        }

        /// <summary>
        /// Core structured logging method with key=value format
        /// </summary>
        public void LogStructured(string level, string source, object keyValuePairs, string message,
            [CallerMemberName] string memberName = "",
            [CallerFilePath] string filePath = "",
            [CallerLineNumber] int lineNumber = 0)
        {
            try
            {
                var entry = new StructuredLogEntry
                {
                    Timestamp = DateTime.UtcNow,
                    Level = level.ToUpper(),
                    Source = source,
                    KeyValuePairs = keyValuePairs,
                    Message = message,
                    MemberName = memberName,
                    FilePath = Path.GetFileNameWithoutExtension(filePath),
                    LineNumber = lineNumber,
                    ThreadId = Thread.CurrentThread.ManagedThreadId
                };

                _logQueue.Enqueue(entry);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to log: {ex.Message}");
            }
        }

        /// <summary>
        /// Log debug information
        /// </summary>
        public void LogDebug(string source, object keyValuePairs, string message,
            [CallerMemberName] string memberName = "",
            [CallerFilePath] string filePath = "",
            [CallerLineNumber] int lineNumber = 0)
        {
            LogStructured("DEBUG", source, keyValuePairs, message, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Log informational messages
        /// </summary>
        public void LogInfo(string source, object keyValuePairs, string message,
            [CallerMemberName] string memberName = "",
            [CallerFilePath] string filePath = "",
            [CallerLineNumber] int lineNumber = 0)
        {
            LogStructured("INFO", source, keyValuePairs, message, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Log warning messages
        /// </summary>
        public void LogWarning(string source, object keyValuePairs, string message,
            [CallerMemberName] string memberName = "",
            [CallerFilePath] string filePath = "",
            [CallerLineNumber] int lineNumber = 0)
        {
            LogStructured("WARN", source, keyValuePairs, message, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Log error messages
        /// </summary>
        public void LogError(string source, object keyValuePairs, string message,
            [CallerMemberName] string memberName = "",
            [CallerFilePath] string filePath = "",
            [CallerLineNumber] int lineNumber = 0)
        {
            LogStructured("ERROR", source, keyValuePairs, message, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Log error with exception
        /// </summary>
        public void LogError(string source, Exception exception, object keyValuePairs, string message,
            [CallerMemberName] string memberName = "",
            [CallerFilePath] string filePath = "",
            [CallerLineNumber] int lineNumber = 0)
        {
            var enhancedKeyValues = new Dictionary<string, object>();
            
            // Add exception details to key-value pairs
            if (keyValuePairs != null)
            {
                foreach (var prop in keyValuePairs.GetType().GetProperties())
                {
                    enhancedKeyValues[prop.Name] = prop.GetValue(keyValuePairs);
                }
            }
            
            enhancedKeyValues["exception_type"] = exception.GetType().Name;
            enhancedKeyValues["exception_message"] = exception.Message;
            if (exception.InnerException != null)
            {
                enhancedKeyValues["inner_exception"] = exception.InnerException.Message;
            }

            LogStructured("ERROR", source, enhancedKeyValues, message, memberName, filePath, lineNumber);
        }

        /// <summary>
        /// Formats the log entry according to specification: [YYYY-MM-DDThh:mm:ss.fffZ] [LEVEL] [SOURCE] key=value | message
        /// </summary>
        private string FormatLogEntry(StructuredLogEntry entry)
        {
            var sb = new StringBuilder();
            
            // Timestamp in ISO 8601 format with milliseconds
            sb.Append($"[{entry.Timestamp:yyyy-MM-ddTHH:mm:ss.fffZ}]");
            
            // Level
            sb.Append($" [{entry.Level}]");
            
            // Source
            sb.Append($" [{entry.Source}]");
            
            // Key-value pairs
            if (entry.KeyValuePairs != null)
            {
                sb.Append(" ");
                var keyValues = new List<string>();
                
                if (entry.KeyValuePairs is Dictionary<string, object> dict)
                {
                    foreach (var kvp in dict)
                    {
                        keyValues.Add($"{kvp.Key}={kvp.Value}");
                    }
                }
                else
                {
                    // Handle anonymous objects
                    foreach (var prop in entry.KeyValuePairs.GetType().GetProperties())
                    {
                        var value = prop.GetValue(entry.KeyValuePairs);
                        keyValues.Add($"{prop.Name}={value}");
                    }
                }
                
                sb.Append(string.Join(" ", keyValues));
            }
            
            // Message separator and message
            sb.Append($" | {entry.Message}");
            
            // Add caller info for debug
            if (!string.IsNullOrEmpty(entry.MemberName))
            {
                sb.Append($" [{entry.FilePath}:{entry.MemberName}:{entry.LineNumber}]");
            }

            return sb.ToString();
        }

        /// <summary>
        /// Flush logs to file
        /// </summary>
        private void FlushLogs(object state)
        {
            _ = Task.Run(async () => await FlushLogsAsync());
        }

        /// <summary>
        /// Asynchronously flush logs to file
        /// </summary>
        private async Task FlushLogsAsync()
        {
            if (_logQueue.IsEmpty) return;

            await _writeSemaphore.WaitAsync();

            try
            {
                var entries = new List<StructuredLogEntry>();
                while (_logQueue.TryDequeue(out var entry))
                {
                    entries.Add(entry);
                }

                if (!entries.Any()) return;

                var logFileName = $"structured_log_{DateTime.UtcNow:yyyyMMdd}.log";
                var logFilePath = Path.Combine(_logDirectory, logFileName);

                var logLines = entries.Select(FormatLogEntry);
                await File.AppendAllLinesAsync(logFilePath, logLines);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to flush structured logs: {ex.Message}");
            }
            finally
            {
                _writeSemaphore.Release();
            }
        }

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

    /// <summary>
    /// Structured log entry
    /// </summary>
    public class StructuredLogEntry
    {
        public DateTime Timestamp { get; set; }
        public string Level { get; set; }
        public string Source { get; set; }
        public object KeyValuePairs { get; set; }
        public string Message { get; set; }
        public string MemberName { get; set; }
        public string FilePath { get; set; }
        public int LineNumber { get; set; }
        public int ThreadId { get; set; }
    }
}