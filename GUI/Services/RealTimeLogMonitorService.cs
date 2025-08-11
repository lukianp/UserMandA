using System;
using System.IO;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for real-time monitoring of log files using FileSystemWatcher
    /// </summary>
    public class RealTimeLogMonitorService : IDisposable
    {
        private static readonly Lazy<RealTimeLogMonitorService> _instance = 
            new Lazy<RealTimeLogMonitorService>(() => new RealTimeLogMonitorService());
        
        public static RealTimeLogMonitorService Instance => _instance.Value;

        private readonly List<FileSystemWatcher> _watchers = new List<FileSystemWatcher>();
        private readonly List<Regex> _errorPatterns = new List<Regex>();
        private readonly object _lock = new object();
        private bool _isDisposed = false;

        // Error keywords to monitor
        private readonly string[] _defaultErrorKeywords = {
            "Error", "Exception", "Failed", "Failure", "Fatal", "Critical",
            "Timeout", "Cannot", "Unable", "Invalid", "Unauthorized", 
            "Access denied", "Not found", "Connection refused", "Stack trace"
        };

        public event EventHandler<LogErrorDetectedEventArgs> ErrorDetected;
        public event EventHandler<LogMonitoringEventArgs> MonitoringStatusChanged;

        private RealTimeLogMonitorService()
        {
            InitializeErrorPatterns();
        }

        private void InitializeErrorPatterns()
        {
            foreach (var keyword in _defaultErrorKeywords)
            {
                // Create case-insensitive regex patterns
                _errorPatterns.Add(new Regex($@"\b{Regex.Escape(keyword)}\b", 
                    RegexOptions.IgnoreCase | RegexOptions.Compiled));
            }
            
            // Add specific patterns for common log formats
            _errorPatterns.Add(new Regex(@"\[ERROR\]", RegexOptions.IgnoreCase | RegexOptions.Compiled));
            _errorPatterns.Add(new Regex(@"\[FATAL\]", RegexOptions.IgnoreCase | RegexOptions.Compiled));
            _errorPatterns.Add(new Regex(@"Exception.*:", RegexOptions.IgnoreCase | RegexOptions.Compiled));
            _errorPatterns.Add(new Regex(@"at\s+[\w\.]+\.[a-zA-Z_][\w]*\(", RegexOptions.Compiled)); // Stack trace pattern
        }

        /// <summary>
        /// Start monitoring a directory for log file changes
        /// </summary>
        public async Task StartMonitoringAsync(string directoryPath)
        {
            if (_isDisposed) throw new ObjectDisposedException(nameof(RealTimeLogMonitorService));
            
            try
            {
                if (!Directory.Exists(directoryPath))
                {
                    ErrorHandlingService.Instance.LogWarning(
                        $"Log directory does not exist: {directoryPath}");
                    return;
                }

                var watcher = new FileSystemWatcher(directoryPath)
                {
                    Filter = "*.log",
                    IncludeSubdirectories = true,
                    NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.CreationTime,
                    EnableRaisingEvents = true
                };

                watcher.Changed += OnLogFileChanged;
                watcher.Created += OnLogFileCreated;
                watcher.Error += OnWatcherError;

                lock (_lock)
                {
                    _watchers.Add(watcher);
                }

                ErrorHandlingService.Instance.LogInfo(
                    $"Started monitoring log directory: {directoryPath}");
                
                MonitoringStatusChanged?.Invoke(this, new LogMonitoringEventArgs
                {
                    DirectoryPath = directoryPath,
                    IsMonitoring = true,
                    Message = "Log monitoring started"
                });

                // Initial scan of existing log files
                await ScanExistingLogFilesAsync(directoryPath);
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Starting log file monitoring");
                throw;
            }
        }

        /// <summary>
        /// Stop monitoring all directories
        /// </summary>
        public void StopMonitoring()
        {
            lock (_lock)
            {
                foreach (var watcher in _watchers)
                {
                    try
                    {
                        watcher.EnableRaisingEvents = false;
                        watcher.Changed -= OnLogFileChanged;
                        watcher.Created -= OnLogFileCreated;
                        watcher.Error -= OnWatcherError;
                        watcher.Dispose();
                    }
                    catch (Exception ex)
                    {
                        ErrorHandlingService.Instance.LogWarning(
                            $"Error disposing file watcher: {ex.Message}");
                    }
                }
                
                _watchers.Clear();
            }

            ErrorHandlingService.Instance.LogInfo("Log monitoring stopped");
            
            MonitoringStatusChanged?.Invoke(this, new LogMonitoringEventArgs
            {
                IsMonitoring = false,
                Message = "Log monitoring stopped"
            });
        }

        private async void OnLogFileChanged(object sender, FileSystemEventArgs e)
        {
            try
            {
                // Small delay to allow file to be released by writing process
                await Task.Delay(100);
                await ProcessLogFileAsync(e.FullPath, isNewFile: false);
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Processing log file change");
            }
        }

        private async void OnLogFileCreated(object sender, FileSystemEventArgs e)
        {
            try
            {
                await Task.Delay(500); // Wait for file to be fully created
                await ProcessLogFileAsync(e.FullPath, isNewFile: true);
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Processing new log file");
            }
        }

        private void OnWatcherError(object sender, ErrorEventArgs e)
        {
            ErrorHandlingService.Instance.HandleException(e.GetException(), "FileSystemWatcher error");
            
            MonitoringStatusChanged?.Invoke(this, new LogMonitoringEventArgs
            {
                IsMonitoring = false,
                Message = $"Monitoring error: {e.GetException().Message}"
            });
        }

        private async Task ProcessLogFileAsync(string filePath, bool isNewFile)
        {
            if (_isDisposed) return;

            try
            {
                var lines = await ReadNewLinesAsync(filePath, isNewFile);
                
                foreach (var line in lines)
                {
                    if (ContainsError(line))
                    {
                        var errorInfo = new LogErrorInfo
                        {
                            FilePath = filePath,
                            FileName = Path.GetFileName(filePath),
                            Timestamp = DateTime.Now,
                            LogLine = line.Trim(),
                            ErrorType = DetermineErrorType(line)
                        };

                        ErrorDetected?.Invoke(this, new LogErrorDetectedEventArgs { ErrorInfo = errorInfo });
                        
                        ErrorHandlingService.Instance.LogWarning(
                            $"Error detected in {Path.GetFileName(filePath)}: {line.Substring(0, Math.Min(100, line.Length))}...");
                    }
                }
            }
            catch (IOException)
            {
                // File might be locked, try again later
                await Task.Delay(1000);
                // Could implement retry logic here if needed
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, $"Processing log file: {filePath}");
            }
        }

        private async Task<List<string>> ReadNewLinesAsync(string filePath, bool isNewFile)
        {
            var lines = new List<string>();
            
            // For new files, read the entire file. For existing files, read from the end
            try
            {
                using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                using var reader = new StreamReader(stream);
                
                if (!isNewFile)
                {
                    // For existing files, seek to near the end and read recent lines
                    // This is a simplified approach - in production, you'd want to track file positions
                    var content = await reader.ReadToEndAsync();
                    var allLines = content.Split('\n');
                    
                    // Take only the last 50 lines to avoid processing the entire file repeatedly
                    var startIndex = Math.Max(0, allLines.Length - 50);
                    for (int i = startIndex; i < allLines.Length; i++)
                    {
                        if (!string.IsNullOrWhiteSpace(allLines[i]))
                        {
                            lines.Add(allLines[i]);
                        }
                    }
                }
                else
                {
                    // For new files, read all content
                    string line;
                    while ((line = await reader.ReadLineAsync()) != null)
                    {
                        if (!string.IsNullOrWhiteSpace(line))
                        {
                            lines.Add(line);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.LogWarning($"Error reading log file {filePath}: {ex.Message}");
            }
            
            return lines;
        }

        private async Task ScanExistingLogFilesAsync(string directoryPath)
        {
            try
            {
                var logFiles = Directory.GetFiles(directoryPath, "*.log", SearchOption.AllDirectories);
                
                foreach (var logFile in logFiles)
                {
                    // Only scan recent files (last 24 hours) to avoid processing old logs
                    var fileInfo = new FileInfo(logFile);
                    if (fileInfo.LastWriteTime > DateTime.Now.AddHours(-24))
                    {
                        await ProcessLogFileAsync(logFile, isNewFile: false);
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Scanning existing log files");
            }
        }

        private bool ContainsError(string logLine)
        {
            if (string.IsNullOrWhiteSpace(logLine)) return false;
            
            foreach (var pattern in _errorPatterns)
            {
                if (pattern.IsMatch(logLine))
                {
                    return true;
                }
            }
            
            return false;
        }

        private string DetermineErrorType(string logLine)
        {
            var upperLine = logLine.ToUpper();
            
            if (upperLine.Contains("EXCEPTION")) return "Exception";
            if (upperLine.Contains("FATAL")) return "Fatal";
            if (upperLine.Contains("CRITICAL")) return "Critical";
            if (upperLine.Contains("TIMEOUT")) return "Timeout";
            if (upperLine.Contains("FAILED")) return "Failure";
            if (upperLine.Contains("ACCESS DENIED") || upperLine.Contains("UNAUTHORIZED")) return "Security";
            if (upperLine.Contains("NOT FOUND")) return "NotFound";
            if (upperLine.Contains("CONNECTION")) return "Connection";
            
            return "Error";
        }

        public void Dispose()
        {
            if (!_isDisposed)
            {
                StopMonitoring();
                _isDisposed = true;
            }
        }
    }

    // Event argument classes
    public class LogErrorDetectedEventArgs : EventArgs
    {
        public LogErrorInfo ErrorInfo { get; set; }
    }

    public class LogMonitoringEventArgs : EventArgs
    {
        public string DirectoryPath { get; set; }
        public bool IsMonitoring { get; set; }
        public string Message { get; set; }
    }

    // Model classes
    public class LogErrorInfo
    {
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public DateTime Timestamp { get; set; }
        public string LogLine { get; set; }
        public string ErrorType { get; set; }
        public bool IsAcknowledged { get; set; }
    }
}