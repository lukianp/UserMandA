using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise-grade error handling and recovery service for migration operations
    /// </summary>
    public class MigrationErrorHandler : IDisposable
    {
        private readonly ILogger<MigrationErrorHandler> _logger;
        private readonly string _errorLogPath;
        private readonly Dictionary<Type, ErrorHandlingStrategy> _errorStrategies;
        private readonly Dictionary<string, RetryPolicy> _retryPolicies;
        private readonly List<ErrorPattern> _knownErrorPatterns;
        private bool _disposed = false;

        public event EventHandler<ErrorOccurredEventArgs> ErrorOccurred;
        public event EventHandler<ErrorResolvedEventArgs> ErrorResolved;
        public event EventHandler<RetryAttemptEventArgs> RetryAttempted;

        public MigrationErrorHandler(ILogger<MigrationErrorHandler> logger = null)
        {
            _logger = logger;
            
            // Initialize error logging path
            var appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite",
                "ErrorLogs"
            );
            
            Directory.CreateDirectory(appDataPath);
            _errorLogPath = appDataPath;
            
            // Initialize error handling strategies
            _errorStrategies = InitializeErrorStrategies();
            _retryPolicies = InitializeRetryPolicies();
            _knownErrorPatterns = InitializeKnownErrorPatterns();
            
            _logger?.LogInformation("Migration error handler initialized");
        }

        /// <summary>
        /// Handle migration error with intelligent recovery strategies
        /// </summary>
        public async Task<ErrorHandlingResult> HandleErrorAsync(
            MigrationErrorContext context,
            Exception exception,
            int attemptNumber = 1)
        {
            var errorId = Guid.NewGuid().ToString();
            var result = new ErrorHandlingResult
            {
                ErrorId = errorId,
                Context = context,
                Exception = exception,
                AttemptNumber = attemptNumber,
                HandledAt = DateTime.Now
            };

            try
            {
                // Log error details
                await LogErrorAsync(errorId, context, exception, attemptNumber);

                // Analyze error and determine handling strategy
                var analysis = AnalyzeError(exception, context);
                result.Analysis = analysis;

                // Apply error handling strategy
                var strategy = GetErrorHandlingStrategy(exception.GetType(), analysis);
                result.Strategy = strategy;

                switch (strategy.Action)
                {
                    case ErrorAction.Retry:
                        result = await HandleRetryAsync(result, strategy);
                        break;
                        
                    case ErrorAction.Skip:
                        result = await HandleSkipAsync(result, strategy);
                        break;
                        
                    case ErrorAction.Rollback:
                        result = await HandleRollbackAsync(result, strategy);
                        break;
                        
                    case ErrorAction.Abort:
                        result = await HandleAbortAsync(result, strategy);
                        break;
                        
                    case ErrorAction.Escalate:
                        result = await HandleEscalateAsync(result, strategy);
                        break;
                        
                    default:
                        result.Resolution = ErrorResolution.Failed;
                        result.Message = "No handling strategy defined for this error type";
                        break;
                }

                // Apply automatic remediation if available
                if (analysis.AutoRemediationAvailable && strategy.AllowAutoRemediation)
                {
                    await ApplyAutoRemediationAsync(result);
                }

                OnErrorOccurred(new ErrorOccurredEventArgs
                {
                    ErrorId = errorId,
                    Context = context,
                    Exception = exception,
                    Strategy = strategy,
                    OccurredAt = DateTime.Now
                });

                _logger?.LogInformation($"Handled error {errorId} with strategy {strategy.Action}, result: {result.Resolution}");
                
                return result;
            }
            catch (Exception handlingException)
            {
                _logger?.LogError(handlingException, $"Error while handling migration error {errorId}");
                
                result.Resolution = ErrorResolution.Failed;
                result.Message = $"Error handling failed: {handlingException.Message}";
                result.HandlingException = handlingException;
                
                return result;
            }
        }

        /// <summary>
        /// Handle batch-level errors with coordination
        /// </summary>
        public async Task<BatchErrorHandlingResult> HandleBatchErrorAsync(
            MigrationBatch batch,
            List<MigrationItemError> itemErrors)
        {
            var result = new BatchErrorHandlingResult
            {
                BatchId = batch.Id,
                BatchName = batch.Name,
                TotalErrors = itemErrors.Count,
                HandledAt = DateTime.Now
            };

            try
            {
                // Categorize errors by type and severity
                var errorGroups = itemErrors.GroupBy(e => e.ErrorCategory).ToList();
                
                foreach (var errorGroup in errorGroups)
                {
                    var groupResult = await HandleErrorGroupAsync(batch, errorGroup.ToList());
                    result.GroupResults.Add(groupResult);
                }

                // Determine overall batch handling strategy
                var criticalErrors = itemErrors.Count(e => e.Severity == ErrorSeverity.Critical);
                var totalItems = batch.TotalItems;
                var errorRate = (double)itemErrors.Count / totalItems;

                if (criticalErrors > 0 || errorRate > 0.5)
                {
                    result.BatchAction = BatchErrorAction.Stop;
                    batch.Status = MigrationStatus.Failed;
                }
                else if (errorRate > 0.2)
                {
                    result.BatchAction = BatchErrorAction.ContinueWithWarning;
                    batch.Status = MigrationStatus.CompletedWithWarnings;
                }
                else
                {
                    result.BatchAction = BatchErrorAction.Continue;
                }

                result.IsSuccess = result.BatchAction != BatchErrorAction.Stop;
                
                _logger?.LogInformation($"Handled batch errors for {batch.Name}: {result.BatchAction}, {itemErrors.Count} errors processed");
                
                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to handle batch errors for {batch.Name}");
                
                result.IsSuccess = false;
                result.BatchAction = BatchErrorAction.Stop;
                result.Message = $"Batch error handling failed: {ex.Message}";
                
                return result;
            }
        }

        /// <summary>
        /// Create error report for analysis and documentation
        /// </summary>
        public async Task<MigrationErrorReport> GenerateErrorReportAsync(
            string profileName,
            DateTime fromDate,
            DateTime toDate)
        {
            var report = new MigrationErrorReport
            {
                ProfileName = profileName,
                ReportPeriod = new DateRange { From = fromDate, To = toDate },
                GeneratedAt = DateTime.Now
            };

            try
            {
                // Load error logs from specified period
                var errorLogs = await LoadErrorLogsAsync(fromDate, toDate);
                
                // Analyze error patterns
                report.ErrorSummary = AnalyzeErrorPatterns(errorLogs);
                report.TopErrors = GetTopErrors(errorLogs, 10);
                report.ErrorTrends = CalculateErrorTrends(errorLogs);
                report.ResolutionEffectiveness = CalculateResolutionEffectiveness(errorLogs);
                
                // Generate recommendations
                report.Recommendations = GenerateRecommendations(report.ErrorSummary);
                
                // Save report
                var reportPath = Path.Combine(_errorLogPath, $"error_report_{DateTime.Now:yyyyMMdd_HHmmss}.json");
                var reportJson = JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(reportPath, reportJson);
                
                report.ReportFilePath = reportPath;
                
                _logger?.LogInformation($"Generated error report for {profileName}: {report.ErrorSummary.TotalErrors} errors analyzed");
                
                return report;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to generate error report for {profileName}");
                
                report.ErrorMessage = ex.Message;
                return report;
            }
        }

        private async Task<ErrorHandlingResult> HandleRetryAsync(
            ErrorHandlingResult result,
            ErrorHandlingStrategy strategy)
        {
            var retryPolicy = GetRetryPolicy(result.Context.ItemType, result.Analysis.ErrorCategory);
            
            if (result.AttemptNumber <= retryPolicy.MaxRetries)
            {
                result.Resolution = ErrorResolution.Retrying;
                result.RetryDelay = CalculateRetryDelay(result.AttemptNumber, retryPolicy);
                result.Message = $"Retrying in {result.RetryDelay?.TotalSeconds} seconds (attempt {result.AttemptNumber}/{retryPolicy.MaxRetries})";
                
                OnRetryAttempted(new RetryAttemptEventArgs
                {
                    ErrorId = result.ErrorId,
                    AttemptNumber = result.AttemptNumber,
                    MaxRetries = retryPolicy.MaxRetries,
                    Delay = result.RetryDelay ?? TimeSpan.Zero,
                    AttemptedAt = DateTime.Now
                });
            }
            else
            {
                result.Resolution = ErrorResolution.Failed;
                result.Message = $"Maximum retry attempts ({retryPolicy.MaxRetries}) exceeded";
            }
            
            return result;
        }

        private async Task<ErrorHandlingResult> HandleSkipAsync(
            ErrorHandlingResult result,
            ErrorHandlingStrategy strategy)
        {
            result.Resolution = ErrorResolution.Skipped;
            result.Message = "Item skipped due to error";
            
            // Mark item as skipped in context
            if (result.Context.MigrationItem != null)
            {
                result.Context.MigrationItem.Status = MigrationStatus.Skipped;
                result.Context.MigrationItem.Errors.Add($"Skipped: {result.Exception.Message}");
            }
            
            return result;
        }

        private async Task<ErrorHandlingResult> HandleRollbackAsync(
            ErrorHandlingResult result,
            ErrorHandlingStrategy strategy)
        {
            result.Resolution = ErrorResolution.RolledBack;
            result.Message = "Changes rolled back due to error";
            
            try
            {
                // Perform rollback operations
                await PerformRollbackAsync(result.Context);
                result.RollbackSuccessful = true;
            }
            catch (Exception rollbackEx)
            {
                result.RollbackSuccessful = false;
                result.RollbackError = rollbackEx.Message;
                _logger?.LogError(rollbackEx, $"Rollback failed for error {result.ErrorId}");
            }
            
            return result;
        }

        private async Task<ErrorHandlingResult> HandleAbortAsync(
            ErrorHandlingResult result,
            ErrorHandlingStrategy strategy)
        {
            result.Resolution = ErrorResolution.Aborted;
            result.Message = "Migration aborted due to critical error";
            
            // Set context to indicate abort
            if (result.Context.MigrationBatch != null)
            {
                result.Context.MigrationBatch.Status = MigrationStatus.Failed;
            }
            
            return result;
        }

        private async Task<ErrorHandlingResult> HandleEscalateAsync(
            ErrorHandlingResult result,
            ErrorHandlingStrategy strategy)
        {
            result.Resolution = ErrorResolution.Escalated;
            result.Message = "Error escalated for manual intervention";
            
            // Create escalation ticket/notification
            await CreateEscalationAsync(result);
            
            return result;
        }

        private async Task ApplyAutoRemediationAsync(ErrorHandlingResult result)
        {
            try
            {
                var remediation = result.Analysis.AutoRemediation;
                
                switch (remediation.Type)
                {
                    case RemediationType.RestartService:
                        await RestartServiceAsync(remediation.Target);
                        break;
                        
                    case RemediationType.ClearCache:
                        await ClearCacheAsync(remediation.Target);
                        break;
                        
                    case RemediationType.ResetConnection:
                        await ResetConnectionAsync(remediation.Target);
                        break;
                        
                    case RemediationType.UpdateConfiguration:
                        await UpdateConfigurationAsync(remediation.Target, remediation.Parameters);
                        break;
                }
                
                result.AutoRemediationApplied = true;
                result.AutoRemediationResult = "Successfully applied auto-remediation";
                
                _logger?.LogInformation($"Applied auto-remediation {remediation.Type} for error {result.ErrorId}");
            }
            catch (Exception ex)
            {
                result.AutoRemediationApplied = false;
                result.AutoRemediationResult = $"Auto-remediation failed: {ex.Message}";
                
                _logger?.LogError(ex, $"Auto-remediation failed for error {result.ErrorId}");
            }
        }

        private ErrorAnalysis AnalyzeError(Exception exception, MigrationErrorContext context)
        {
            var analysis = new ErrorAnalysis
            {
                ErrorType = exception.GetType().Name,
                ErrorMessage = exception.Message,
                ErrorCategory = DetermineErrorCategory(exception),
                Severity = DetermineSeverity(exception, context),
                IsTransient = IsTransientError(exception),
                IsRetryable = IsRetryableError(exception),
                AutoRemediationAvailable = HasAutoRemediation(exception)
            };

            // Check against known error patterns
            var matchingPattern = _knownErrorPatterns.FirstOrDefault(p => p.Matches(exception));
            if (matchingPattern != null)
            {
                analysis.KnownPattern = matchingPattern;
                analysis.AutoRemediation = matchingPattern.AutoRemediation;
                analysis.AutoRemediationAvailable = matchingPattern.AutoRemediation != null;
            }

            return analysis;
        }

        private ErrorHandlingStrategy GetErrorHandlingStrategy(Type exceptionType, ErrorAnalysis analysis)
        {
            if (_errorStrategies.TryGetValue(exceptionType, out var strategy))
            {
                return strategy;
            }

            // Default strategy based on analysis
            return new ErrorHandlingStrategy
            {
                Action = analysis.IsRetryable ? ErrorAction.Retry : 
                        analysis.Severity == ErrorSeverity.Critical ? ErrorAction.Abort : ErrorAction.Skip,
                AllowAutoRemediation = analysis.AutoRemediationAvailable,
                RequireManualIntervention = analysis.Severity == ErrorSeverity.Critical
            };
        }

        private RetryPolicy GetRetryPolicy(MigrationType itemType, ErrorCategory category)
        {
            var key = $"{itemType}_{category}";
            if (_retryPolicies.TryGetValue(key, out var policy))
            {
                return policy;
            }

            // Default retry policy
            return new RetryPolicy
            {
                MaxRetries = 3,
                BaseDelay = TimeSpan.FromSeconds(30),
                BackoffMultiplier = 2.0,
                MaxDelay = TimeSpan.FromMinutes(10)
            };
        }

        private TimeSpan CalculateRetryDelay(int attemptNumber, RetryPolicy policy)
        {
            var delay = TimeSpan.FromTicks((long)(policy.BaseDelay.Ticks * Math.Pow(policy.BackoffMultiplier, attemptNumber - 1)));
            return delay > policy.MaxDelay ? policy.MaxDelay : delay;
        }

        private async Task LogErrorAsync(string errorId, MigrationErrorContext context, Exception exception, int attemptNumber)
        {
            var errorLog = new MigrationErrorLogEntry
            {
                ErrorId = errorId,
                Timestamp = DateTime.Now,
                ProfileName = context.ProfileName,
                WaveName = context.WaveName,
                BatchId = context.BatchId,
                ItemId = context.ItemId,
                ItemType = context.ItemType,
                ExceptionType = exception.GetType().FullName,
                ExceptionMessage = exception.Message,
                StackTrace = exception.StackTrace,
                AttemptNumber = attemptNumber,
                Context = JsonSerializer.Serialize(context)
            };

            var logPath = Path.Combine(_errorLogPath, $"errors_{DateTime.Now:yyyyMMdd}.json");
            var logJson = JsonSerializer.Serialize(errorLog) + Environment.NewLine;
            
            await File.AppendAllTextAsync(logPath, logJson);
        }

        private Dictionary<Type, ErrorHandlingStrategy> InitializeErrorStrategies()
        {
            return new Dictionary<Type, ErrorHandlingStrategy>
            {
                [typeof(TimeoutException)] = new ErrorHandlingStrategy
                {
                    Action = ErrorAction.Retry,
                    AllowAutoRemediation = true,
                    RequireManualIntervention = false
                },
                [typeof(UnauthorizedAccessException)] = new ErrorHandlingStrategy
                {
                    Action = ErrorAction.Escalate,
                    AllowAutoRemediation = false,
                    RequireManualIntervention = true
                },
                [typeof(DirectoryServiceException)] = new ErrorHandlingStrategy
                {
                    Action = ErrorAction.Retry,
                    AllowAutoRemediation = true,
                    RequireManualIntervention = false
                },
                [typeof(OutOfMemoryException)] = new ErrorHandlingStrategy
                {
                    Action = ErrorAction.Abort,
                    AllowAutoRemediation = false,
                    RequireManualIntervention = true
                }
            };
        }

        private Dictionary<string, RetryPolicy> InitializeRetryPolicies()
        {
            return new Dictionary<string, RetryPolicy>
            {
                ["User_Network"] = new RetryPolicy { MaxRetries = 5, BaseDelay = TimeSpan.FromSeconds(10) },
                ["Mailbox_Exchange"] = new RetryPolicy { MaxRetries = 3, BaseDelay = TimeSpan.FromMinutes(2) },
                ["FileShare_IO"] = new RetryPolicy { MaxRetries = 10, BaseDelay = TimeSpan.FromSeconds(5) },
                ["Application_Deployment"] = new RetryPolicy { MaxRetries = 2, BaseDelay = TimeSpan.FromMinutes(5) }
            };
        }

        private List<ErrorPattern> InitializeKnownErrorPatterns()
        {
            return new List<ErrorPattern>
            {
                new ErrorPattern
                {
                    Name = "Exchange Throttling",
                    ExceptionTypes = new[] { "Microsoft.Exchange.WebServices.Data.ServiceResponseException" },
                    MessagePatterns = new[] { "throttl", "rate limit" },
                    AutoRemediation = new AutoRemediation
                    {
                        Type = RemediationType.Delay,
                        Parameters = new Dictionary<string, object> { ["DelayMinutes"] = 15 }
                    }
                },
                new ErrorPattern
                {
                    Name = "Active Directory Replication Delay",
                    ExceptionTypes = new[] { "System.DirectoryServices.DirectoryServiceException" },
                    MessagePatterns = new[] { "object not found", "no such object" },
                    AutoRemediation = new AutoRemediation
                    {
                        Type = RemediationType.Delay,
                        Parameters = new Dictionary<string, object> { ["DelayMinutes"] = 5 }
                    }
                }
            };
        }

        private ErrorCategory DetermineErrorCategory(Exception exception)
        {
            return exception switch
            {
                TimeoutException => ErrorCategory.Network,
                UnauthorizedAccessException => ErrorCategory.Security,
                DirectoryServiceException => ErrorCategory.Authentication,
                OutOfMemoryException => ErrorCategory.Resource,
                FileNotFoundException => ErrorCategory.Configuration,
                _ => ErrorCategory.Unknown
            };
        }

        private ErrorSeverity DetermineSeverity(Exception exception, MigrationErrorContext context)
        {
            return exception switch
            {
                OutOfMemoryException => ErrorSeverity.Critical,
                UnauthorizedAccessException => ErrorSeverity.High,
                TimeoutException => ErrorSeverity.Medium,
                _ => ErrorSeverity.Low
            };
        }

        private bool IsTransientError(Exception exception)
        {
            return exception is TimeoutException ||
                   exception.Message.Contains("network") ||
                   exception.Message.Contains("timeout") ||
                   exception.Message.Contains("throttl");
        }

        private bool IsRetryableError(Exception exception)
        {
            return IsTransientError(exception) && 
                   !(exception is OutOfMemoryException) &&
                   !(exception is StackOverflowException);
        }

        private bool HasAutoRemediation(Exception exception)
        {
            return _knownErrorPatterns.Any(p => p.Matches(exception) && p.AutoRemediation != null);
        }

        // Placeholder methods for remediation actions
        private async Task RestartServiceAsync(string serviceName) { /* Implementation */ }
        private async Task ClearCacheAsync(string cacheType) { /* Implementation */ }
        private async Task ResetConnectionAsync(string connectionType) { /* Implementation */ }
        private async Task UpdateConfigurationAsync(string target, Dictionary<string, object> parameters) { /* Implementation */ }
        private async Task PerformRollbackAsync(MigrationErrorContext context) { /* Implementation */ }
        private async Task CreateEscalationAsync(ErrorHandlingResult result) { /* Implementation */ }

        // Placeholder methods for analysis
        private async Task<List<ErrorLogEntry>> LoadErrorLogsAsync(DateTime from, DateTime to) => new();
        private ErrorSummary AnalyzeErrorPatterns(List<ErrorLogEntry> logs) => new();
        private List<TopError> GetTopErrors(List<ErrorLogEntry> logs, int count) => new();
        private List<ErrorTrend> CalculateErrorTrends(List<ErrorLogEntry> logs) => new();
        private ResolutionEffectiveness CalculateResolutionEffectiveness(List<ErrorLogEntry> logs) => new();
        private List<string> GenerateRecommendations(ErrorSummary summary) => new();

        private async Task<ErrorGroupResult> HandleErrorGroupAsync(MigrationBatch batch, List<MigrationItemError> errors)
        {
            return new ErrorGroupResult
            {
                Category = errors.First().ErrorCategory,
                ErrorCount = errors.Count,
                Resolution = GroupResolution.Handled
            };
        }

        protected virtual void OnErrorOccurred(ErrorOccurredEventArgs e) => ErrorOccurred?.Invoke(this, e);
        protected virtual void OnErrorResolved(ErrorResolvedEventArgs e) => ErrorResolved?.Invoke(this, e);
        protected virtual void OnRetryAttempted(RetryAttemptEventArgs e) => RetryAttempted?.Invoke(this, e);

        public void Dispose()
        {
            if (_disposed) return;
            _disposed = true;
            _logger?.LogInformation("Migration error handler disposed");
        }
    }

    #region Supporting Classes and Enums

    public class MigrationErrorContext
    {
        public string ProfileName { get; set; }
        public string WaveName { get; set; }
        public string BatchId { get; set; }
        public string ItemId { get; set; }
        public MigrationType ItemType { get; set; }
        public MigrationBatch MigrationBatch { get; set; }
        public MigrationItem MigrationItem { get; set; }
        public Dictionary<string, object> AdditionalContext { get; set; } = new();
    }

    public class ErrorHandlingResult
    {
        public string ErrorId { get; set; }
        public MigrationErrorContext Context { get; set; }
        public Exception Exception { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime HandledAt { get; set; }
        public ErrorAnalysis Analysis { get; set; }
        public ErrorHandlingStrategy Strategy { get; set; }
        public ErrorResolution Resolution { get; set; }
        public string Message { get; set; }
        public TimeSpan? RetryDelay { get; set; }
        public bool RollbackSuccessful { get; set; }
        public string RollbackError { get; set; }
        public bool AutoRemediationApplied { get; set; }
        public string AutoRemediationResult { get; set; }
        public Exception HandlingException { get; set; }
    }

    public class ErrorAnalysis
    {
        public string ErrorType { get; set; }
        public string ErrorMessage { get; set; }
        public ErrorCategory ErrorCategory { get; set; }
        public ErrorSeverity Severity { get; set; }
        public bool IsTransient { get; set; }
        public bool IsRetryable { get; set; }
        public bool AutoRemediationAvailable { get; set; }
        public ErrorPattern KnownPattern { get; set; }
        public AutoRemediation AutoRemediation { get; set; }
    }

    public class ErrorHandlingStrategy
    {
        public ErrorAction Action { get; set; }
        public bool AllowAutoRemediation { get; set; }
        public bool RequireManualIntervention { get; set; }
    }

    public class RetryPolicy
    {
        public int MaxRetries { get; set; }
        public TimeSpan BaseDelay { get; set; }
        public double BackoffMultiplier { get; set; } = 2.0;
        public TimeSpan MaxDelay { get; set; } = TimeSpan.FromMinutes(30);
    }

    public class ErrorPattern
    {
        public string Name { get; set; }
        public string[] ExceptionTypes { get; set; }
        public string[] MessagePatterns { get; set; }
        public AutoRemediation AutoRemediation { get; set; }

        public bool Matches(Exception exception)
        {
            var typeMatch = ExceptionTypes?.Contains(exception.GetType().FullName) == true;
            var messageMatch = MessagePatterns?.Any(p => exception.Message.Contains(p, StringComparison.OrdinalIgnoreCase)) == true;
            return typeMatch || messageMatch;
        }
    }

    public class AutoRemediation
    {
        public RemediationType Type { get; set; }
        public string Target { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public enum ErrorAction
    {
        Retry,
        Skip,
        Rollback,
        Abort,
        Escalate
    }

    public enum ErrorCategory
    {
        Network,
        Security,
        Authentication,
        Resource,
        Configuration,
        Business,
        Unknown
    }

    public enum ErrorSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum ErrorResolution
    {
        Pending,
        Retrying,
        Skipped,
        RolledBack,
        Aborted,
        Escalated,
        Resolved,
        Failed
    }

    public enum RemediationType
    {
        Delay,
        RestartService,
        ClearCache,
        ResetConnection,
        UpdateConfiguration
    }

    // Additional classes for batch error handling and reporting
    public class BatchErrorHandlingResult
    {
        public string BatchId { get; set; }
        public string BatchName { get; set; }
        public int TotalErrors { get; set; }
        public DateTime HandledAt { get; set; }
        public BatchErrorAction BatchAction { get; set; }
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public List<ErrorGroupResult> GroupResults { get; set; } = new();
    }

    public class ErrorGroupResult
    {
        public ErrorCategory Category { get; set; }
        public int ErrorCount { get; set; }
        public GroupResolution Resolution { get; set; }
    }

    public enum BatchErrorAction
    {
        Continue,
        ContinueWithWarning,
        Stop
    }

    public enum GroupResolution
    {
        Handled,
        Escalated,
        Failed
    }

    public class MigrationItemError
    {
        public string ItemId { get; set; }
        public Exception Exception { get; set; }
        public ErrorCategory ErrorCategory { get; set; }
        public ErrorSeverity Severity { get; set; }
    }

    // Error reporting classes
    public class MigrationErrorReport
    {
        public string ProfileName { get; set; }
        public DateRange ReportPeriod { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string ReportFilePath { get; set; }
        public string ErrorMessage { get; set; }
        public ErrorSummary ErrorSummary { get; set; }
        public List<TopError> TopErrors { get; set; } = new();
        public List<ErrorTrend> ErrorTrends { get; set; } = new();
        public ResolutionEffectiveness ResolutionEffectiveness { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class DateRange
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }

    public class ErrorSummary
    {
        public int TotalErrors { get; set; }
        public Dictionary<ErrorCategory, int> ErrorsByCategory { get; set; } = new();
        public Dictionary<ErrorSeverity, int> ErrorsBySeverity { get; set; } = new();
    }

    public class TopError
    {
        public string ErrorType { get; set; }
        public string ErrorMessage { get; set; }
        public int Occurrences { get; set; }
    }

    public class ErrorTrend
    {
        public DateTime Date { get; set; }
        public int ErrorCount { get; set; }
    }

    public class ResolutionEffectiveness
    {
        public double SuccessRate { get; set; }
        public double AutoRemediationRate { get; set; }
        public TimeSpan AverageResolutionTime { get; set; }
    }

    public class MigrationErrorLogEntry
    {
        public string ErrorId { get; set; }
        public DateTime Timestamp { get; set; }
        public string ProfileName { get; set; }
        public string WaveName { get; set; }
        public string BatchId { get; set; }
        public string ItemId { get; set; }
        public MigrationType ItemType { get; set; }
        public string ExceptionType { get; set; }
        public string ExceptionMessage { get; set; }
        public string StackTrace { get; set; }
        public int AttemptNumber { get; set; }
        public string Context { get; set; }
    }

    #endregion

    #region Event Args

    public class ErrorOccurredEventArgs : EventArgs
    {
        public string ErrorId { get; set; }
        public MigrationErrorContext Context { get; set; }
        public Exception Exception { get; set; }
        public ErrorHandlingStrategy Strategy { get; set; }
        public DateTime OccurredAt { get; set; }
    }

    public class ErrorResolvedEventArgs : EventArgs
    {
        public string ErrorId { get; set; }
        public ErrorResolution Resolution { get; set; }
        public DateTime ResolvedAt { get; set; }
    }

    public class RetryAttemptEventArgs : EventArgs
    {
        public string ErrorId { get; set; }
        public int AttemptNumber { get; set; }
        public int MaxRetries { get; set; }
        public TimeSpan Delay { get; set; }
        public DateTime AttemptedAt { get; set; }
    }

    #endregion

    // Custom exception for directory services
    public class DirectoryServiceException : Exception
    {
        public DirectoryServiceException(string message) : base(message) { }
        public DirectoryServiceException(string message, Exception innerException) : base(message, innerException) { }
    }
}