using System;
using System.IO;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service that integrates real-time log monitoring with the notification system
    /// </summary>
    public class LogMonitoringIntegrationService : IDisposable
    {
        private static readonly Lazy<LogMonitoringIntegrationService> _instance = 
            new Lazy<LogMonitoringIntegrationService>(() => new LogMonitoringIntegrationService());
        
        public static LogMonitoringIntegrationService Instance => _instance.Value;

        private readonly RealTimeLogMonitorService _logMonitor;
        private readonly NotificationService _notificationService;
        private readonly ConfigurationService _configService;
        private bool _isDisposed = false;
        private bool _isInitialized = false;

        private LogMonitoringIntegrationService()
        {
            _logMonitor = RealTimeLogMonitorService.Instance;
            _configService = ConfigurationService.Instance;
            
            try
            {
                _notificationService = SimpleServiceLocator.GetService<NotificationService>();
                if (_notificationService == null)
                {
                    // If not available through DI, we'll handle notifications manually
                    // For now, skip notification service initialization
                }
            }
            catch
            {
                // Service locator not available, skip notifications
                _notificationService = null;
            }
        }

        /// <summary>
        /// Initialize the log monitoring integration
        /// </summary>
        public async Task InitializeAsync()
        {
            if (_isInitialized || _isDisposed)
                return;

            try
            {
                // Subscribe to log monitor events
                _logMonitor.ErrorDetected += OnLogErrorDetected;
                _logMonitor.MonitoringStatusChanged += OnMonitoringStatusChanged;

                // Start monitoring the main logs directory
                var logsPath = Path.Combine(_configService.DiscoveryDataRootPath, "ljpops", "Logs");
                
                if (Directory.Exists(logsPath))
                {
                    await _logMonitor.StartMonitoringAsync(logsPath);
                    
                    // Show startup notification
                    _notificationService?.AddInfo(
                        "Log Monitoring",
                        "Real-time log monitoring started"
                    );
                }
                else
                {
                    ErrorHandlingService.Instance.LogWarning(
                        $"Logs directory not found: {logsPath}");
                }

                // Also monitor application logs if they exist in a different location
                var appLogsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
                if (Directory.Exists(appLogsPath) && appLogsPath != logsPath)
                {
                    await _logMonitor.StartMonitoringAsync(appLogsPath);
                }

                _isInitialized = true;
                
                ErrorHandlingService.Instance.LogInfo(
                    "Log monitoring integration initialized successfully");
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, 
                    "Initializing log monitoring integration");
            }
        }

        private void OnLogErrorDetected(object sender, LogErrorDetectedEventArgs e)
        {
            try
            {
                var error = e.ErrorInfo;
                var severity = DetermineSeverity(error.ErrorType);

                // Create notification
                var title = $"Log Error Detected - {error.ErrorType}";
                var message = $"File: {error.FileName}\nTime: {error.Timestamp:HH:mm:ss}\n{TruncateMessage(error.LogLine, 100)}";

                _notificationService?.AddNotification(
                    title,
                    message,
                    severity,
                    autoHideDelay: TimeSpan.FromMinutes(5), // Auto-dismiss after 5 minutes
                    actionText: "View Log",
                    actionCallback: () => OpenLogFile(error.FilePath)
                );

                // Log the detection
                ErrorHandlingService.Instance.LogWarning(
                    $"Error detected in {error.FileName}: {error.ErrorType} - {TruncateMessage(error.LogLine, 50)}");
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Processing detected log error");
            }
        }

        private void OnMonitoringStatusChanged(object sender, LogMonitoringEventArgs e)
        {
            try
            {
                var title = e.IsMonitoring ? "Log Monitoring Started" : "Log Monitoring Stopped";
                
                if (e.IsMonitoring)
                {
                    _notificationService?.AddSuccess(title, e.Message, TimeSpan.FromSeconds(10));
                }
                else
                {
                    _notificationService?.AddWarning(title, e.Message, TimeSpan.FromSeconds(10));
                }

                ErrorHandlingService.Instance.LogInfo(e.Message);
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Processing monitoring status change");
            }
        }

        private NotificationType DetermineSeverity(string errorType)
        {
            return errorType.ToLower() switch
            {
                "fatal" or "critical" => NotificationType.Error,
                "exception" or "failure" => NotificationType.Error,
                "security" or "unauthorized" => NotificationType.Warning,
                "timeout" or "connection" => NotificationType.Warning,
                _ => NotificationType.Information
            };
        }

        private string TruncateMessage(string message, int maxLength)
        {
            if (string.IsNullOrEmpty(message) || message.Length <= maxLength)
                return message;

            return message.Substring(0, maxLength - 3) + "...";
        }

        private void OpenLogFile(string filePath)
        {
            try
            {
                if (File.Exists(filePath))
                {
                    // Open in default text editor
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = filePath,
                        UseShellExecute = true
                    });
                }
                else
                {
                    _notificationService?.AddWarning(
                        "File Not Found",
                        $"The log file no longer exists: {Path.GetFileName(filePath)}"
                    );
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Opening log file");
                
                _notificationService?.AddError(
                    "Unable to Open File",
                    $"Could not open log file: {ex.Message}"
                );
            }
        }

        private void AcknowledgeError(LogErrorInfo error)
        {
            try
            {
                error.IsAcknowledged = true;
                
                _notificationService?.AddSuccess(
                    "Error Acknowledged",
                    $"Log error from {error.FileName} has been acknowledged",
                    TimeSpan.FromSeconds(3)
                );

                ErrorHandlingService.Instance.LogInfo(
                    $"Log error acknowledged: {error.ErrorType} from {error.FileName}");
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Acknowledging log error");
            }
        }

        /// <summary>
        /// Stop log monitoring
        /// </summary>
        public void Stop()
        {
            try
            {
                _logMonitor.StopMonitoring();
                
                if (_isInitialized)
                {
                    _notificationService?.AddInfo(
                        "Log Monitoring",
                        "Real-time log monitoring stopped"
                    );
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Stopping log monitoring");
            }
        }

        /// <summary>
        /// Get current monitoring status
        /// </summary>
        public bool IsMonitoring => _isInitialized && !_isDisposed;

        public void Dispose()
        {
            if (!_isDisposed)
            {
                try
                {
                    _logMonitor.ErrorDetected -= OnLogErrorDetected;
                    _logMonitor.MonitoringStatusChanged -= OnMonitoringStatusChanged;
                    
                    Stop();
                    _logMonitor.Dispose();
                }
                catch (Exception ex)
                {
                    ErrorHandlingService.Instance.LogWarning(
                        $"Error during disposal: {ex.Message}");
                }
                
                _isDisposed = true;
            }
        }
    }
}