using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using System.Globalization;
using System.Collections.ObjectModel;
using System.Text;

namespace MandADiscoverySuite.Services
{
    public interface ILogManagementService
    {
        Task<ObservableCollection<LogAuditEntry>> GetLogsAsync();
        Task<ObservableCollection<LogAuditEntry>> GetFilteredLogsAsync(LogFilter filter);
        Task<bool> ExportLogsAsync(IEnumerable<LogAuditEntry> logs, string filePath, LogExportFormat format);
        Task RefreshLogsAsync();
        event EventHandler<LogsUpdatedEventArgs> LogsUpdated;
    }

    public class LogManagementService : ILogManagementService
    {
        private readonly ILogger<LogManagementService> _logger;
        private readonly FileSystemWatcher _enterpriseWatcher;
        private readonly FileSystemWatcher _profileWatcher;
        private readonly ObservableCollection<LogAuditEntry> _allLogs;
        private readonly object _logsLock = new object();

        public event EventHandler<LogsUpdatedEventArgs> LogsUpdated;

        public LogManagementService(ILogger<LogManagementService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _allLogs = new ObservableCollection<LogAuditEntry>();

            // Initialize file system watchers
            _enterpriseWatcher = CreateFileWatcher(@"C:\enterprisediscovery\Logs");
            _profileWatcher = CreateFileWatcher(@"C:\discoverydata\ljpops\Logs");
        }

        public async Task<ObservableCollection<LogAuditEntry>> GetLogsAsync()
        {
            await LoadAllLogsAsync();
            lock (_logsLock)
            {
                return new ObservableCollection<LogAuditEntry>(_allLogs.OrderByDescending(l => l.Timestamp));
            }
        }

        public async Task<ObservableCollection<LogAuditEntry>> GetFilteredLogsAsync(LogFilter filter)
        {
            var allLogs = await GetLogsAsync();
            var filtered = FilterLogs(allLogs, filter);
            return new ObservableCollection<LogAuditEntry>(filtered);
        }

        public async Task<bool> ExportLogsAsync(IEnumerable<LogAuditEntry> logs, string filePath, LogExportFormat format)
        {
            try
            {
                switch (format)
                {
                    case LogExportFormat.CSV:
                        await ExportToCsvAsync(logs, filePath);
                        break;
                    case LogExportFormat.JSON:
                        await ExportToJsonAsync(logs, filePath);
                        break;
                    default:
                        throw new ArgumentException($"Unsupported export format: {format}");
                }
                
                _logger.LogInformation("Successfully exported {Count} log entries to {FilePath}", logs.Count(), filePath);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export logs to {FilePath}", filePath);
                return false;
            }
        }

        public async Task RefreshLogsAsync()
        {
            _logger.LogInformation("Refreshing logs from all sources");
            await LoadAllLogsAsync();
        }

        private async Task LoadAllLogsAsync()
        {
            var newLogs = new List<LogAuditEntry>();

            // Load from enterprise discovery logs
            var enterpriseLogs = await LoadLogsFromDirectoryAsync(@"C:\enterprisediscovery\Logs", LogCategory.Build);
            newLogs.AddRange(enterpriseLogs);

            // Load from profile logs
            var profileLogs = await LoadLogsFromDirectoryAsync(@"C:\discoverydata\ljpops\Logs", LogCategory.Runtime);
            newLogs.AddRange(profileLogs);

            // Load module logs if they exist
            var moduleLogsPath = @"C:\discoverydata\ljpops\Logs\Modules";
            if (Directory.Exists(moduleLogsPath))
            {
                var moduleLogs = await LoadLogsFromDirectoryAsync(moduleLogsPath, LogCategory.Modules);
                newLogs.AddRange(moduleLogs);
            }

            // Load migration logs if they exist
            var migrationLogsPath = @"C:\discoverydata\ljpops\Logs\Migration";
            if (Directory.Exists(migrationLogsPath))
            {
                var migrationLogs = await LoadLogsFromDirectoryAsync(migrationLogsPath, LogCategory.Migration);
                newLogs.AddRange(migrationLogs);
            }

            // Update the collection
            lock (_logsLock)
            {
                _allLogs.Clear();
                foreach (var log in newLogs.OrderByDescending(l => l.Timestamp))
                {
                    _allLogs.Add(log);
                }
            }

            LogsUpdated?.Invoke(this, new LogsUpdatedEventArgs(_allLogs.Count));
            _logger.LogInformation("Loaded {Count} log entries from all sources", _allLogs.Count);
        }

        private async Task<List<LogAuditEntry>> LoadLogsFromDirectoryAsync(string directory, LogCategory defaultCategory)
        {
            var logs = new List<LogAuditEntry>();

            if (!Directory.Exists(directory))
            {
                _logger.LogWarning("Log directory does not exist: {Directory}", directory);
                return logs;
            }

            try
            {
                var logFiles = Directory.GetFiles(directory, "*.log", SearchOption.AllDirectories)
                    .Concat(Directory.GetFiles(directory, "*.txt", SearchOption.AllDirectories))
                    .Where(f => IsLogFile(f));

                foreach (var logFile in logFiles)
                {
                    try
                    {
                        var fileLogs = await ParseLogFileAsync(logFile, defaultCategory);
                        logs.AddRange(fileLogs);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse log file: {LogFile}", logFile);
                        
                        // Add a placeholder entry for failed files
                        logs.Add(new LogAuditEntry
                        {
                            Timestamp = File.GetLastWriteTime(logFile),
                            Level = Microsoft.Extensions.Logging.LogLevel.Warning,
                            Category = LogCategory.Runtime,
                            Source = Path.GetFileName(logFile),
                            Message = $"Failed to parse log file: {ex.Message}",
                            Exception = ex.ToString()
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading logs from directory: {Directory}", directory);
            }

            return logs;
        }

        private bool IsLogFile(string filePath)
        {
            var fileName = Path.GetFileName(filePath).ToLowerInvariant();
            return fileName.Contains("log") || 
                   fileName.Contains("audit") || 
                   fileName.Contains("error") ||
                   fileName.Contains("debug") ||
                   fileName.Contains("migration") ||
                   fileName.Contains("discovery");
        }

        private async Task<List<LogAuditEntry>> ParseLogFileAsync(string filePath, LogCategory defaultCategory)
        {
            var logs = new List<LogAuditEntry>();
            var lines = await File.ReadAllLinesAsync(filePath);
            var fileName = Path.GetFileName(filePath);

            // Try different log formats
            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                try
                {
                    var logEntry = TryParseLogLine(line, fileName, defaultCategory);
                    if (logEntry != null)
                    {
                        logs.Add(logEntry);
                    }
                }
                catch (Exception ex)
                {
                    // If parsing fails, create a basic entry
                    logs.Add(new LogAuditEntry
                    {
                        Timestamp = File.GetLastWriteTime(filePath),
                        Level = Microsoft.Extensions.Logging.LogLevel.Information,
                        Category = defaultCategory,
                        Source = fileName,
                        Message = line.Length > 500 ? line.Substring(0, 500) + "..." : line,
                        RawContent = line
                    });
                }
            }

            return logs;
        }

        private LogAuditEntry TryParseLogLine(string line, string fileName, LogCategory defaultCategory)
        {
            // Pattern 1: Standard .NET logging format: [Timestamp] [Level] Message
            var standardPattern = @"^\[(.+?)\]\s*\[(.+?)\]\s*(.+)$";
            var match = Regex.Match(line, standardPattern);
            if (match.Success)
            {
                return new LogAuditEntry
                {
                    Timestamp = ParseTimestamp(match.Groups[1].Value),
                    Level = ParseLogLevel(match.Groups[2].Value),
                    Category = DetermineCategory(fileName, defaultCategory),
                    Source = fileName,
                    Message = match.Groups[3].Value.Trim(),
                    RawContent = line
                };
            }

            // Pattern 2: PowerShell style: YYYY-MM-DD HH:mm:ss [LEVEL] Message
            var psPattern = @"^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*\[(.+?)\]\s*(.+)$";
            match = Regex.Match(line, psPattern);
            if (match.Success)
            {
                return new LogAuditEntry
                {
                    Timestamp = ParseTimestamp(match.Groups[1].Value),
                    Level = ParseLogLevel(match.Groups[2].Value),
                    Category = DetermineCategory(fileName, defaultCategory),
                    Source = fileName,
                    Message = match.Groups[3].Value.Trim(),
                    RawContent = line
                };
            }

            // Pattern 3: Simple timestamp prefix
            var simplePattern = @"^(\d{4}-\d{2}-\d{2}.*?)\s+(.+)$";
            match = Regex.Match(line, simplePattern);
            if (match.Success)
            {
                return new LogAuditEntry
                {
                    Timestamp = ParseTimestamp(match.Groups[1].Value),
                    Level = ExtractLogLevelFromMessage(match.Groups[2].Value),
                    Category = DetermineCategory(fileName, defaultCategory),
                    Source = fileName,
                    Message = match.Groups[2].Value.Trim(),
                    RawContent = line
                };
            }

            // Fallback: treat as plain message
            return new LogAuditEntry
            {
                Timestamp = File.GetLastWriteTime(Path.Combine(GetLogDirectory(defaultCategory), fileName)),
                Level = Microsoft.Extensions.Logging.LogLevel.Information,
                Category = defaultCategory,
                Source = fileName,
                Message = line.Length > 500 ? line.Substring(0, 500) + "..." : line,
                RawContent = line
            };
        }

        private string GetLogDirectory(LogCategory category)
        {
            return category switch
            {
                LogCategory.Build => @"C:\enterprisediscovery\Logs",
                LogCategory.Runtime => @"C:\discoverydata\ljpops\Logs",
                LogCategory.Modules => @"C:\discoverydata\ljpops\Logs\Modules",
                LogCategory.Migration => @"C:\discoverydata\ljpops\Logs\Migration",
                _ => @"C:\discoverydata\ljpops\Logs"
            };
        }

        private DateTime ParseTimestamp(string timestampStr)
        {
            var formats = new[]
            {
                "yyyy-MM-dd HH:mm:ss",
                "yyyy-MM-dd HH:mm:ss.fff",
                "MM/dd/yyyy HH:mm:ss",
                "yyyy-MM-ddTHH:mm:ss",
                "yyyy-MM-ddTHH:mm:ss.fff",
                "yyyy-MM-ddTHH:mm:ss.fffZ"
            };

            foreach (var format in formats)
            {
                if (DateTime.TryParseExact(timestampStr.Trim(), format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var result))
                {
                    return result;
                }
            }

            // Fallback to natural parsing
            if (DateTime.TryParse(timestampStr.Trim(), out var fallback))
            {
                return fallback;
            }

            return DateTime.Now;
        }

        private Microsoft.Extensions.Logging.LogLevel ParseLogLevel(string levelStr)
        {
            var level = levelStr.ToUpperInvariant().Trim();
            return level switch
            {
                "ERROR" or "ERR" or "E" => Microsoft.Extensions.Logging.LogLevel.Error,
                "WARNING" or "WARN" or "W" => Microsoft.Extensions.Logging.LogLevel.Warning,
                "INFO" or "INFORMATION" or "I" => Microsoft.Extensions.Logging.LogLevel.Information,
                "DEBUG" or "DBG" or "D" => Microsoft.Extensions.Logging.LogLevel.Debug,
                "TRACE" or "T" => Microsoft.Extensions.Logging.LogLevel.Trace,
                "CRITICAL" or "CRIT" or "C" or "FATAL" => Microsoft.Extensions.Logging.LogLevel.Critical,
                _ => Microsoft.Extensions.Logging.LogLevel.Information
            };
        }

        private Microsoft.Extensions.Logging.LogLevel ExtractLogLevelFromMessage(string message)
        {
            var upperMessage = message.ToUpperInvariant();
            if (upperMessage.Contains("ERROR") || upperMessage.Contains("EXCEPTION") || upperMessage.Contains("FAILED"))
                return Microsoft.Extensions.Logging.LogLevel.Error;
            if (upperMessage.Contains("WARNING") || upperMessage.Contains("WARN"))
                return Microsoft.Extensions.Logging.LogLevel.Warning;
            if (upperMessage.Contains("DEBUG"))
                return Microsoft.Extensions.Logging.LogLevel.Debug;
            if (upperMessage.Contains("CRITICAL") || upperMessage.Contains("FATAL"))
                return Microsoft.Extensions.Logging.LogLevel.Critical;
            
            return Microsoft.Extensions.Logging.LogLevel.Information;
        }

        private LogCategory DetermineCategory(string fileName, LogCategory defaultCategory)
        {
            var lowerFileName = fileName.ToLowerInvariant();
            
            if (lowerFileName.Contains("migration") || lowerFileName.Contains("move"))
                return LogCategory.Migration;
            if (lowerFileName.Contains("module") || lowerFileName.Contains("discovery"))
                return LogCategory.Modules;
            if (lowerFileName.Contains("build") || lowerFileName.Contains("compile"))
                return LogCategory.Build;
                
            return defaultCategory;
        }

        private IEnumerable<LogAuditEntry> FilterLogs(IEnumerable<LogAuditEntry> logs, LogFilter filter)
        {
            var query = logs.AsQueryable();

            if (filter.Categories?.Any() == true)
            {
                query = query.Where(l => filter.Categories.Contains(l.Category));
            }

            if (filter.Levels?.Any() == true)
            {
                query = query.Where(l => filter.Levels.Contains(l.Level));
            }

            if (filter.StartDate.HasValue)
            {
                query = query.Where(l => l.Timestamp >= filter.StartDate.Value);
            }

            if (filter.EndDate.HasValue)
            {
                query = query.Where(l => l.Timestamp <= filter.EndDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                var searchTerm = filter.SearchText.ToLowerInvariant();
                query = query.Where(l => 
                    l.Message.ToLowerInvariant().Contains(searchTerm) ||
                    l.Source.ToLowerInvariant().Contains(searchTerm) ||
                    (!string.IsNullOrEmpty(l.Exception) && l.Exception.ToLowerInvariant().Contains(searchTerm)));
            }

            if (!string.IsNullOrWhiteSpace(filter.SourceFilter))
            {
                var sourceFilter = filter.SourceFilter.ToLowerInvariant();
                query = query.Where(l => l.Source.ToLowerInvariant().Contains(sourceFilter));
            }

            return query.OrderByDescending(l => l.Timestamp);
        }

        private async Task ExportToCsvAsync(IEnumerable<LogAuditEntry> logs, string filePath)
        {
            var csv = new StringBuilder();
            csv.AppendLine("Timestamp,Level,Category,Source,Message,Exception");
            
            foreach (var log in logs)
            {
                csv.AppendLine($"\"{log.FormattedTimestamp}\",\"{log.LevelString}\",\"{log.CategoryString}\",\"{log.Source}\",\"{EscapeCsv(log.Message)}\",\"{EscapeCsv(log.Exception ?? "")}\"");
            }
            
            await File.WriteAllTextAsync(filePath, csv.ToString());
        }
        
        private string EscapeCsv(string value)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Replace("\"", "\"\"").Replace("\r", "").Replace("\n", " ");
        }

        private async Task ExportToJsonAsync(IEnumerable<LogAuditEntry> logs, string filePath)
        {
            var json = JsonConvert.SerializeObject(logs, Formatting.Indented);
            await File.WriteAllTextAsync(filePath, json);
        }

        private FileSystemWatcher CreateFileWatcher(string path)
        {
            if (!Directory.Exists(path))
            {
                try
                {
                    Directory.CreateDirectory(path);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not create or access log directory: {Path}", path);
                    return null;
                }
            }

            var watcher = new FileSystemWatcher(path)
            {
                Filter = "*.*",
                IncludeSubdirectories = true,
                EnableRaisingEvents = true
            };

            watcher.Changed += async (s, e) =>
            {
                if (IsLogFile(e.FullPath))
                {
                    await Task.Delay(100); // Brief delay to ensure file is written
                    await RefreshLogsAsync();
                }
            };

            watcher.Created += async (s, e) =>
            {
                if (IsLogFile(e.FullPath))
                {
                    await Task.Delay(100);
                    await RefreshLogsAsync();
                }
            };

            return watcher;
        }

        public void Dispose()
        {
            _enterpriseWatcher?.Dispose();
            _profileWatcher?.Dispose();
        }
    }

    // Supporting classes
    public class LogAuditEntry
    {
        public DateTime Timestamp { get; set; }
        public Microsoft.Extensions.Logging.LogLevel Level { get; set; }
        public LogCategory Category { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Exception { get; set; }
        public string? RawContent { get; set; }
        
        public string LevelString => Level.ToString();
        public string CategoryString => Category.ToString();
        public string FormattedTimestamp => Timestamp.ToString("yyyy-MM-dd HH:mm:ss");
    }

    public class LogFilter
    {
        public IList<LogCategory>? Categories { get; set; }
        public IList<Microsoft.Extensions.Logging.LogLevel>? Levels { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SearchText { get; set; }
        public string? SourceFilter { get; set; }
    }

    public class LogsUpdatedEventArgs : EventArgs
    {
        public int TotalCount { get; }
        
        public LogsUpdatedEventArgs(int totalCount)
        {
            TotalCount = totalCount;
        }
    }

    public enum LogCategory
    {
        Build,
        Runtime, 
        Modules,
        Migration
    }

    public enum LogExportFormat
    {
        CSV,
        JSON
    }
}