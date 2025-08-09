using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Centralized error handling service for consistent error management across the application
    /// </summary>
    public class ErrorHandlingService
    {
        private static ErrorHandlingService _instance;
        private static readonly object _lock = new object();
        private readonly string _logFilePath;
        private readonly Queue<ErrorLogEntry> _errorQueue;
        private readonly object _queueLock = new object();

        /// <summary>
        /// Gets the singleton instance of ErrorHandlingService
        /// </summary>
        public static ErrorHandlingService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new ErrorHandlingService();
                    }
                }
                return _instance;
            }
        }

        private ErrorHandlingService()
        {
            var logDirectory = @"C:\DiscoveryData\ljpops\Logs";
            Directory.CreateDirectory(logDirectory);
            
            _logFilePath = Path.Combine(logDirectory, $"error_log_{DateTime.Now:yyyyMMdd}.txt");
            _errorQueue = new Queue<ErrorLogEntry>();
        }

        /// <summary>
        /// Handles an exception with consistent logging and user notification
        /// </summary>
        /// <param name="exception">The exception to handle</param>
        /// <param name="context">Context information about where the error occurred</param>
        /// <param name="showToUser">Whether to show a user-friendly message</param>
        /// <param name="userMessage">Custom user-friendly message (optional)</param>
        /// <returns>A formatted error message for status display</returns>
        public string HandleException(
            Exception exception, 
            string context, 
            bool showToUser = false, 
            string userMessage = null)
        {
            if (exception == null)
                throw new ArgumentNullException(nameof(exception));
            if (string.IsNullOrWhiteSpace(context))
                throw new ArgumentException("Context cannot be null or empty", nameof(context));

            var errorEntry = new ErrorLogEntry
            {
                Timestamp = DateTime.Now,
                Context = context,
                ExceptionType = exception.GetType().Name,
                Message = exception.Message,
                StackTrace = exception.StackTrace,
                InnerException = exception.InnerException?.Message
            };

            // Log the error
            LogError(errorEntry);

            // Generate user-friendly message
            var statusMessage = GenerateStatusMessage(exception, context, userMessage);

            // Show to user if requested
            if (showToUser)
            {
                ShowUserErrorDialog(statusMessage, exception, context);
            }

            return statusMessage;
        }

        /// <summary>
        /// Handles an operation cancellation consistently
        /// </summary>
        /// <param name="context">Context of the cancelled operation</param>
        /// <returns>A formatted status message</returns>
        public string HandleCancellation(string context)
        {
            if (string.IsNullOrWhiteSpace(context))
                context = "Operation";

            var message = $"{context} was cancelled";
            
            LogInfo($"User cancelled operation: {context}");
            
            return message;
        }

        /// <summary>
        /// Handles validation errors consistently
        /// </summary>
        /// <param name="validationErrors">List of validation error messages</param>
        /// <param name="context">Context where validation failed</param>
        /// <returns>A formatted error message</returns>
        public string HandleValidationErrors(List<string> validationErrors, string context)
        {
            if (validationErrors == null || validationErrors.Count == 0)
                return "Validation passed";

            if (string.IsNullOrWhiteSpace(context))
                context = "Validation";

            var message = validationErrors.Count == 1
                ? $"{context} failed: {validationErrors[0]}"
                : $"{context} failed with {validationErrors.Count} errors";

            LogWarning($"Validation errors in {context}: {string.Join("; ", validationErrors)}");

            return message;
        }

        /// <summary>
        /// Executes an async operation with consistent error handling
        /// </summary>
        /// <param name="operation">The async operation to execute</param>
        /// <param name="context">Context description for the operation</param>
        /// <param name="onSuccess">Action to execute on success (optional)</param>
        /// <param name="onError">Action to execute on error (optional)</param>
        /// <returns>Result indicating success/failure and any status message</returns>
        public async Task<OperationResult> ExecuteWithErrorHandling(
            Func<Task> operation,
            string context,
            Action onSuccess = null,
            Action<string> onError = null)
        {
            if (operation == null)
                throw new ArgumentNullException(nameof(operation));
            if (string.IsNullOrWhiteSpace(context))
                throw new ArgumentException("Context cannot be null or empty", nameof(context));

            try
            {
                await operation();
                onSuccess?.Invoke();
                
                LogInfo($"Operation completed successfully: {context}");
                return OperationResult.Success($"{context} completed successfully");
            }
            catch (OperationCanceledException)
            {
                var message = HandleCancellation(context);
                onError?.Invoke(message);
                return OperationResult.Cancelled(message);
            }
            catch (Exception ex)
            {
                var message = HandleException(ex, context);
                onError?.Invoke(message);
                return OperationResult.Failed(message, ex);
            }
        }

        /// <summary>
        /// Executes an async operation with result and consistent error handling
        /// </summary>
        public async Task<OperationResult<T>> ExecuteWithErrorHandling<T>(
            Func<Task<T>> operation,
            string context,
            Action<T> onSuccess = null,
            Action<string> onError = null)
        {
            if (operation == null)
                throw new ArgumentNullException(nameof(operation));
            if (string.IsNullOrWhiteSpace(context))
                throw new ArgumentException("Context cannot be null or empty", nameof(context));

            try
            {
                var result = await operation();
                onSuccess?.Invoke(result);
                
                LogInfo($"Operation completed successfully: {context}");
                return OperationResult<T>.Success(result, $"{context} completed successfully");
            }
            catch (OperationCanceledException)
            {
                var message = HandleCancellation(context);
                onError?.Invoke(message);
                return OperationResult<T>.Cancelled(message);
            }
            catch (Exception ex)
            {
                var message = HandleException(ex, context);
                onError?.Invoke(message);
                return OperationResult<T>.Failed(message, ex);
            }
        }

        /// <summary>
        /// Logs an informational message
        /// </summary>
        public void LogInfo(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return;

            var entry = new ErrorLogEntry
            {
                Timestamp = DateTime.Now,
                Context = "Info",
                Message = message,
                LogLevel = LogLevel.Info
            };

            LogError(entry);
        }

        /// <summary>
        /// Logs a warning message
        /// </summary>
        public void LogWarning(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return;

            var entry = new ErrorLogEntry
            {
                Timestamp = DateTime.Now,
                Context = "Warning",
                Message = message,
                LogLevel = LogLevel.Warning
            };

            LogError(entry);
        }

        private void LogError(ErrorLogEntry entry)
        {
            try
            {
                lock (_queueLock)
                {
                    _errorQueue.Enqueue(entry);
                }

                // Write to file asynchronously
                Task.Run(async () => await WriteLogEntry(entry));

                // Also write to debug output
                Debug.WriteLine($"[{entry.LogLevel}] {entry.Timestamp:HH:mm:ss} - {entry.Context}: {entry.Message}");
            }
            catch
            {
                // Ignore logging errors to prevent infinite loops
            }
        }

        private async Task WriteLogEntry(ErrorLogEntry entry)
        {
            try
            {
                var logLine = entry.LogLevel == LogLevel.Error
                    ? $"[{entry.LogLevel}] {entry.Timestamp:yyyy-MM-dd HH:mm:ss} - {entry.Context}: {entry.Message}" +
                      (entry.ExceptionType != null ? $" ({entry.ExceptionType})" : "") +
                      (entry.InnerException != null ? $" Inner: {entry.InnerException}" : "") +
                      Environment.NewLine
                    : $"[{entry.LogLevel}] {entry.Timestamp:yyyy-MM-dd HH:mm:ss} - {entry.Context}: {entry.Message}" + Environment.NewLine;

                await File.AppendAllTextAsync(_logFilePath, logLine);
            }
            catch
            {
                // Ignore file write errors
            }
        }

        private string GenerateStatusMessage(Exception exception, string context, string userMessage)
        {
            if (!string.IsNullOrWhiteSpace(userMessage))
                return userMessage;

            return exception switch
            {
                ArgumentNullException => $"{context} failed: Missing required data",
                ArgumentException => $"{context} failed: Invalid input provided",
                UnauthorizedAccessException => $"{context} failed: Access denied",
                FileNotFoundException => $"{context} failed: Required file not found",
                DirectoryNotFoundException => $"{context} failed: Directory not found",
                InvalidOperationException => $"{context} failed: {exception.Message}",
                NotSupportedException => $"{context} failed: Operation not supported",
                TimeoutException => $"{context} failed: Operation timed out",
                _ => $"{context} failed: {exception.Message ?? "Unknown error"}"
            };
        }

        private void ShowUserErrorDialog(string message, Exception exception, string context)
        {
            try
            {
                var detailedMessage = $"{message}\n\nContext: {context}\nError Type: {exception.GetType().Name}";
                
                if (Application.Current?.Dispatcher != null)
                {
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        MessageBox.Show(
                            detailedMessage,
                            "Error",
                            MessageBoxButton.OK,
                            MessageBoxImage.Error
                        );
                    });
                }
            }
            catch
            {
                // Ignore dialog errors
            }
        }
    }

    /// <summary>
    /// Represents the result of an operation with error handling
    /// </summary>
    public class OperationResult
    {
        public bool IsSuccess { get; protected set; }
        public bool IsCancelled { get; protected set; }
        public string Message { get; protected set; }
        public Exception Exception { get; protected set; }

        protected OperationResult(bool isSuccess, bool isCancelled, string message, Exception exception = null)
        {
            IsSuccess = isSuccess;
            IsCancelled = isCancelled;
            Message = message ?? string.Empty;
            Exception = exception;
        }

        public static OperationResult Success(string message = "") =>
            new OperationResult(true, false, message);

        public static OperationResult Failed(string message, Exception exception = null) =>
            new OperationResult(false, false, message, exception);

        public static OperationResult Cancelled(string message = "") =>
            new OperationResult(false, true, message);
    }

    /// <summary>
    /// Represents the result of an operation with a return value and error handling
    /// </summary>
    public class OperationResult<T> : OperationResult
    {
        public T Data { get; private set; }

        private OperationResult(bool isSuccess, bool isCancelled, string message, T data = default, Exception exception = null)
            : base(isSuccess, isCancelled, message, exception)
        {
            Data = data;
        }

        public static OperationResult<T> Success(T data, string message = "") =>
            new OperationResult<T>(true, false, message, data);

        public static new OperationResult<T> Failed(string message, Exception exception = null) =>
            new OperationResult<T>(false, false, message, default, exception);

        public static new OperationResult<T> Cancelled(string message = "") =>
            new OperationResult<T>(false, true, message);
    }

    /// <summary>
    /// Represents a log entry for error tracking
    /// </summary>
    internal class ErrorLogEntry
    {
        public DateTime Timestamp { get; set; }
        public string Context { get; set; }
        public string Message { get; set; }
        public string ExceptionType { get; set; }
        public string StackTrace { get; set; }
        public string InnerException { get; set; }
        public LogLevel LogLevel { get; set; } = LogLevel.Error;
    }

    /// <summary>
    /// Log levels for error handling
    /// </summary>
    public enum LogLevel
    {
        Info,
        Warning,
        Error
    }
}