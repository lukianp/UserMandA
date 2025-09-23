using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management.Automation;
using System.Management.Automation.Runspaces;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise-grade PowerShell execution service with runspace pooling and session management
    /// </summary>
    public class PowerShellExecutionService : IPowerShellExecutionService
    {
        private readonly ILogger<PowerShellExecutionService> _logger;
        private readonly ConcurrentQueue<Runspace> _runspacePool;
        private readonly ConcurrentDictionary<string, PowerShellSession> _activeSessions;
        private readonly SemaphoreSlim _runspacePoolSemaphore;
        private readonly int _maxPoolSize;
        private readonly int _minPoolSize;
        private readonly Timer _poolMaintenanceTimer;
        private bool _disposed = false;

        public event EventHandler<PowerShellProgressEventArgs> ProgressReported;
        public event EventHandler<PowerShellOutputEventArgs> OutputReceived;
        public event EventHandler<PowerShellErrorEventArgs> ErrorOccurred;

        public PowerShellExecutionService(
            int maxPoolSize = 10,
            int minPoolSize = 2,
            ILogger<PowerShellExecutionService> logger = null)
        {
            _logger = logger;
            _maxPoolSize = maxPoolSize;
            _minPoolSize = minPoolSize;
            _runspacePool = new ConcurrentQueue<Runspace>();
            _activeSessions = new ConcurrentDictionary<string, PowerShellSession>();
            _runspacePoolSemaphore = new SemaphoreSlim(_maxPoolSize, _maxPoolSize);

            // Initialize pool with minimum runspaces
            InitializeRunspacePool();

            // Start pool maintenance timer
            _poolMaintenanceTimer = new Timer(
                MaintenanceCallback, 
                null, 
                TimeSpan.FromMinutes(5), 
                TimeSpan.FromMinutes(5));

            _logger?.LogInformation($"PowerShell execution service initialized with pool size {_minPoolSize}-{_maxPoolSize}");
        }

        /// <summary>
        /// Execute PowerShell module with real-time progress and output streaming
        /// </summary>
        public async Task<PowerShellExecutionResult> ExecuteModuleAsync(
            string modulePath,
            string functionName,
            Dictionary<string, object> parameters = null,
            PowerShellExecutionOptions options = null,
            CancellationToken cancellationToken = default)
        {
            options = options ?? new PowerShellExecutionOptions();
            parameters = parameters ?? new Dictionary<string, object>();

            var sessionId = Guid.NewGuid().ToString();
            var result = new PowerShellExecutionResult
            {
                SessionId = sessionId,
                ModulePath = modulePath,
                FunctionName = functionName,
                StartTime = DateTime.Now,
                State = PowerShellExecutionState.Running
            };

            try
            {
                await _runspacePoolSemaphore.WaitAsync(cancellationToken);
                var runspace = await GetRunspaceAsync(cancellationToken);

                var session = new PowerShellSession
                {
                    SessionId = sessionId,
                    Runspace = runspace,
                    StartTime = DateTime.Now,
                    CancellationToken = cancellationToken
                };

                _activeSessions[sessionId] = session;

                _logger?.LogInformation($"Starting PowerShell execution: {functionName} from {modulePath}");

                using (var powerShell = PowerShell.Create())
                {
                    session.PowerShell = powerShell;
                    powerShell.Runspace = runspace;

                    // Set working directory if specified
                    if (!string.IsNullOrEmpty(options.WorkingDirectory))
                    {
                        runspace.SessionStateProxy.Path.SetLocation(options.WorkingDirectory);
                    }

                    // Import module
                    powerShell.AddCommand("Import-Module")
                             .AddParameter("Name", modulePath)
                             .AddParameter("Force", true);

                    await powerShell.InvokeAsync();
                    powerShell.Commands.Clear();

                    // Prepare function call
                    powerShell.AddCommand(functionName);

                    // Add parameters
                    foreach (var param in parameters)
                    {
                        powerShell.AddParameter(param.Key, param.Value);
                    }

                    // Set up progress reporting
                    powerShell.Streams.Progress.DataAdded += (sender, e) =>
                    {
                        var progressRecord = powerShell.Streams.Progress[e.Index];
                        OnProgressReported(new PowerShellProgressEventArgs
                        {
                            SessionId = sessionId,
                            Activity = progressRecord.Activity,
                            StatusDescription = progressRecord.StatusDescription,
                            PercentComplete = progressRecord.PercentComplete,
                            SecondsRemaining = progressRecord.SecondsRemaining
                        });
                    };

                    // Set up output streaming
                    var outputCollection = new PSDataCollection<PSObject>();
                    outputCollection.DataAdded += (sender, e) =>
                    {
                        var output = outputCollection[e.Index]?.ToString();
                        if (!string.IsNullOrEmpty(output))
                        {
                            result.Output.Add(output);
                            OnOutputReceived(new PowerShellOutputEventArgs
                            {
                                SessionId = sessionId,
                                Output = output,
                                Timestamp = DateTime.Now
                            });
                        }
                    };

                    // Set up error streaming
                    powerShell.Streams.Error.DataAdded += (sender, e) =>
                    {
                        var error = powerShell.Streams.Error[e.Index];
                        result.Errors.Add(error.ToString());
                        OnErrorOccurred(new PowerShellErrorEventArgs
                        {
                            SessionId = sessionId,
                            Error = error.ToString(),
                            Exception = error.Exception,
                            Timestamp = DateTime.Now
                        });
                    };

                    // Execute with timeout
                    var executeTask = powerShell.InvokeAsync<PSObject>(null, null, null, null);
                    var timeoutTask = Task.Delay(TimeSpan.FromSeconds(options.TimeoutSeconds), cancellationToken);
                    var completedTask = await Task.WhenAny(executeTask, timeoutTask);

                    if (completedTask == timeoutTask)
                    {
                        powerShell.Stop();
                        result.State = PowerShellExecutionState.Cancelled;
                        result.ErrorMessage = "Execution timed out";
                    }
                    else
                    {
                        var executionResults = await executeTask;
                        
                        // Process final results
                        foreach (var psObject in executionResults)
                        {
                            if (psObject != null)
                            {
                                result.Output.Add(psObject.ToString());
                            }
                        }

                        if (powerShell.HadErrors || result.Errors.Any())
                        {
                            result.State = PowerShellExecutionState.CompletedWithErrors;
                            result.IsSuccess = false;
                        }
                        else
                        {
                            result.State = PowerShellExecutionState.Completed;
                            result.IsSuccess = true;
                        }
                    }
                }

                result.EndTime = DateTime.Now;
                result.Duration = result.EndTime.Value - result.StartTime;

                _logger?.LogInformation($"PowerShell execution completed: {functionName}, Success: {result.IsSuccess}, Duration: {result.Duration}");

                return result;
            }
            catch (OperationCanceledException)
            {
                result.State = PowerShellExecutionState.Cancelled;
                result.ErrorMessage = "Execution was cancelled";
                _logger?.LogWarning($"PowerShell execution cancelled: {functionName}");
                return result;
            }
            catch (Exception ex)
            {
                result.State = PowerShellExecutionState.Failed;
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.EndTime = DateTime.Now;
                result.Duration = result.EndTime.Value - result.StartTime;

                _logger?.LogError(ex, $"PowerShell execution failed: {functionName}");
                return result;
            }
            finally
            {
                // Return runspace to pool and clean up session
                if (_activeSessions.TryRemove(sessionId, out var session))
                {
                    ReturnRunspaceToPool(session.Runspace);
                }
                _runspacePoolSemaphore.Release();
            }
        }

        /// <summary>
        /// Execute PowerShell script directly with specified parameters
        /// </summary>
        public async Task<PowerShellExecutionResult> ExecuteScriptAsync(
            string script,
            Dictionary<string, object> parameters = null,
            PowerShellExecutionOptions options = null,
            CancellationToken cancellationToken = default)
        {
            options = options ?? new PowerShellExecutionOptions();
            parameters = parameters ?? new Dictionary<string, object>();

            var sessionId = Guid.NewGuid().ToString();
            var result = new PowerShellExecutionResult
            {
                SessionId = sessionId,
                ModulePath = "Direct Script",
                FunctionName = "ExecuteScript",
                StartTime = DateTime.Now,
                State = PowerShellExecutionState.Running
            };

            try
            {
                await _runspacePoolSemaphore.WaitAsync(cancellationToken);
                var runspace = await GetRunspaceAsync(cancellationToken);

                var session = new PowerShellSession
                {
                    SessionId = sessionId,
                    Runspace = runspace,
                    StartTime = DateTime.Now,
                    CancellationToken = cancellationToken
                };

                _activeSessions[sessionId] = session;

                _logger?.LogInformation($"Starting PowerShell script execution: {sessionId}");

                using (var powerShell = PowerShell.Create())
                {
                    session.PowerShell = powerShell;
                    powerShell.Runspace = runspace;

                    // Set working directory if specified
                    if (!string.IsNullOrEmpty(options.WorkingDirectory))
                    {
                        runspace.SessionStateProxy.Path.SetLocation(options.WorkingDirectory);
                    }

                    // Add script
                    powerShell.AddScript(script);

                    // Add parameters
                    foreach (var param in parameters)
                    {
                        powerShell.AddParameter(param.Key, param.Value);
                    }

                    // Execute with timeout
                    using var timeoutCts = new CancellationTokenSource(options.Timeout);
                    using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(
                        cancellationToken, timeoutCts.Token);

                    var results = await Task.Run(() => powerShell.Invoke(), combinedCts.Token);

                    result.Output = results?.Select(r => r?.ToString() ?? "")?.Where(s => !string.IsNullOrEmpty(s))?.ToList() ?? new List<string>();
                    result.State = powerShell.HadErrors ? PowerShellExecutionState.Failed : PowerShellExecutionState.Completed;
                    result.EndTime = DateTime.Now;

                    if (powerShell.Streams.Error.Count > 0)
                    {
                        result.Errors = powerShell.Streams.Error.Select(e => e.ToString()).ToList();
                    }

                    if (powerShell.Streams.Warning.Count > 0)
                    {
                        result.Warnings = powerShell.Streams.Warning.Select(w => w.ToString()).ToList();
                    }

                    _logger?.LogInformation($"PowerShell script execution completed: {result.State}");
                }

                return result;
            }
            catch (OperationCanceledException)
            {
                result.State = PowerShellExecutionState.Cancelled;
                result.EndTime = DateTime.Now;
                _logger?.LogWarning($"PowerShell script execution cancelled: {sessionId}");
                return result;
            }
            catch (Exception ex)
            {
                result.State = PowerShellExecutionState.Failed;
                result.EndTime = DateTime.Now;
                result.Errors = new List<string> { ex.Message };
                _logger?.LogError(ex, $"PowerShell script execution failed: {sessionId}");
                return result;
            }
            finally
            {
                if (_activeSessions.TryRemove(sessionId, out var session))
                {
                    ReturnRunspaceToPool(session.Runspace);
                }
                _runspacePoolSemaphore.Release();
            }
        }

        /// <summary>
        /// Execute migration item using appropriate PowerShell module
        /// </summary>
        public async Task<MigrationItemResult> ExecuteMigrationItemAsync(
            MigrationItem item,
            MigrationBatch batch,
            MigrationExecutionContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new MigrationItemResult
            {
                ItemId = item.Id,
                StartTime = DateTime.Now,
                Status = MigrationStatus.InProgress
            };

            try
            {
                // Determine module and function based on migration type
                var (modulePath, functionName) = GetMigrationModuleInfo(item.Type);
                
                // Prepare parameters for migration
                var parameters = new Dictionary<string, object>
                {
                    ["SourceIdentity"] = item.SourceIdentity,
                    ["TargetIdentity"] = item.TargetIdentity,
                    ["SourceDomain"] = context.SourceDomain,
                    ["TargetDomain"] = context.TargetDomain,
                    ["CompanyName"] = context.CompanyName,
                    ["MigrationMode"] = context.MigrationMode,
                    ["ValidationMode"] = item.IsValidationRequired,
                    ["EnableRollback"] = item.SupportsRollback
                };

                // Add batch-specific parameters
                if (batch != null)
                {
                    parameters["BatchId"] = batch.Id;
                    parameters["BatchName"] = batch.Name;
                }

                var executionOptions = new PowerShellExecutionOptions
                {
                    WorkingDirectory = context.WorkingDirectory,
                    TimeoutSeconds = (int)(item.EstimatedDuration?.TotalSeconds ?? 1800), // 30 min default
                    Variables = context.EnvironmentVariables
                };

                var executionResult = await ExecuteModuleAsync(
                    modulePath,
                    functionName,
                    parameters,
                    executionOptions,
                    cancellationToken);

                // Map execution result to migration result
                result.IsSuccess = executionResult.IsSuccess;
                result.Output = string.Join(Environment.NewLine, executionResult.Output);
                result.Errors = executionResult.Errors.ToList();
                result.EndTime = DateTime.Now;
                result.Duration = result.EndTime.Value - result.StartTime;

                if (result.IsSuccess)
                {
                    result.Status = MigrationStatus.Completed;
                    item.Status = MigrationStatus.Completed;
                }
                else
                {
                    result.Status = MigrationStatus.Failed;
                    item.Status = MigrationStatus.Failed;
                    item.Errors.AddRange(result.Errors);
                }

                item.StartTime = result.StartTime;
                item.EndTime = result.EndTime;

                _logger?.LogInformation($"Migration item execution completed: {item.DisplayName}, Success: {result.IsSuccess}");

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Status = MigrationStatus.Failed;
                result.EndTime = DateTime.Now;
                result.Duration = result.EndTime.Value - result.StartTime;
                result.Errors.Add($"Migration execution failed: {ex.Message}");

                item.Status = MigrationStatus.Failed;
                item.Errors.Add(ex.Message);
                item.EndTime = result.EndTime;

                _logger?.LogError(ex, $"Migration item execution failed: {item.DisplayName}");
                return result;
            }
        }

        /// <summary>
        /// Get available runspace from pool or create new one
        /// </summary>
        private async Task<Runspace> GetRunspaceAsync(CancellationToken cancellationToken)
        {
            if (_runspacePool.TryDequeue(out var runspace))
            {
                if (runspace.RunspaceStateInfo.State == RunspaceState.Opened)
                {
                    return runspace;
                }
                else
                {
                    runspace?.Dispose();
                }
            }

            // Create new runspace if pool is empty
            return await Task.Run(() => CreateRunspace(), cancellationToken);
        }

        /// <summary>
        /// Create new PowerShell runspace with enterprise configuration
        /// </summary>
        private Runspace CreateRunspace()
        {
            var sessionState = InitialSessionState.CreateDefault();
            
            // Add required modules to session state
            sessionState.ImportPSModule(new[] { 
                "ActiveDirectory", 
                "Microsoft.Graph",
                "ExchangeOnlineManagement"
            });

            // Set execution policy
            sessionState.ExecutionPolicy = Microsoft.PowerShell.ExecutionPolicy.RemoteSigned;

            var runspace = RunspaceFactory.CreateRunspace(sessionState);
            runspace.Open();

            _logger?.LogDebug("Created new PowerShell runspace");
            return runspace;
        }

        /// <summary>
        /// Return runspace to pool for reuse
        /// </summary>
        private void ReturnRunspaceToPool(Runspace runspace)
        {
            if (runspace?.RunspaceStateInfo.State == RunspaceState.Opened && 
                _runspacePool.Count < _maxPoolSize)
            {
                // Clear any variables and reset state
                try
                {
                    using (var powerShell = PowerShell.Create())
                    {
                        powerShell.Runspace = runspace;
                        powerShell.AddCommand("Remove-Variable").AddParameter("Name", "*").AddParameter("ErrorAction", "SilentlyContinue");
                        powerShell.Invoke();
                    }
                    
                    _runspacePool.Enqueue(runspace);
                    _logger?.LogDebug("Returned runspace to pool");
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to clean and return runspace to pool");
                    runspace?.Dispose();
                }
            }
            else
            {
                runspace?.Dispose();
            }
        }

        /// <summary>
        /// Initialize runspace pool with minimum runspaces
        /// </summary>
        private void InitializeRunspacePool()
        {
            for (int i = 0; i < _minPoolSize; i++)
            {
                try
                {
                    var runspace = CreateRunspace();
                    _runspacePool.Enqueue(runspace);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, $"Failed to initialize runspace {i + 1} in pool");
                }
            }

            _logger?.LogInformation($"Initialized PowerShell runspace pool with {_runspacePool.Count} runspaces");
        }

        /// <summary>
        /// Get module and function information for migration type
        /// </summary>
        private (string modulePath, string functionName) GetMigrationModuleInfo(MigrationType type)
        {
            var moduleBasePath = Path.Combine(Directory.GetCurrentDirectory(), "Modules", "Migration");
            
            return type switch
            {
                MigrationType.User => (Path.Combine(moduleBasePath, "UserMigration.psm1"), "Start-UserMigration"),
                MigrationType.Mailbox => (Path.Combine(moduleBasePath, "MailboxMigration.psm1"), "Start-MailboxMigration"),
                MigrationType.SecurityGroup => (Path.Combine(moduleBasePath, "UserMigration.psm1"), "Start-GroupMigration"),
                MigrationType.DistributionList => (Path.Combine(moduleBasePath, "UserMigration.psm1"), "Start-DistributionListMigration"),
                MigrationType.FileShare => (Path.Combine(moduleBasePath, "FileSystemMigration.psm1"), "Start-FileShareMigration"),
                MigrationType.SharePoint => (Path.Combine(moduleBasePath, "SharePointMigration.psm1"), "Start-SharePointSiteMigration"),
                MigrationType.Application => (Path.Combine(moduleBasePath, "ApplicationMigration.psm1"), "Start-ApplicationMigration"),
                MigrationType.VirtualMachine => (Path.Combine(moduleBasePath, "VirtualMachineMigration.psm1"), "Start-VMMigration"),
                _ => throw new NotSupportedException($"Migration type {type} is not supported")
            };
        }

        /// <summary>
        /// Pool maintenance callback to clean up stale runspaces
        /// </summary>
        private void MaintenanceCallback(object state)
        {
            try
            {
                var staleRunspaces = new List<Runspace>();
                var validRunspaces = new List<Runspace>();

                // Check all runspaces in pool
                while (_runspacePool.TryDequeue(out var runspace))
                {
                    if (runspace.RunspaceStateInfo.State == RunspaceState.Opened)
                    {
                        validRunspaces.Add(runspace);
                    }
                    else
                    {
                        staleRunspaces.Add(runspace);
                    }
                }

                // Dispose stale runspaces
                foreach (var staleRunspace in staleRunspaces)
                {
                    try
                    {
                        staleRunspace.Dispose();
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, "Error disposing stale runspace");
                    }
                }

                // Return valid runspaces to pool
                foreach (var validRunspace in validRunspaces)
                {
                    _runspacePool.Enqueue(validRunspace);
                }

                // Ensure minimum pool size
                while (_runspacePool.Count < _minPoolSize)
                {
                    try
                    {
                        var newRunspace = CreateRunspace();
                        _runspacePool.Enqueue(newRunspace);
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogError(ex, "Failed to create runspace during maintenance");
                        break;
                    }
                }

                _logger?.LogDebug($"Pool maintenance completed: {staleRunspaces.Count} stale runspaces removed, {_runspacePool.Count} active runspaces");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during runspace pool maintenance");
            }
        }

        protected virtual void OnProgressReported(PowerShellProgressEventArgs e) => ProgressReported?.Invoke(this, e);
        protected virtual void OnOutputReceived(PowerShellOutputEventArgs e) => OutputReceived?.Invoke(this, e);
        protected virtual void OnErrorOccurred(PowerShellErrorEventArgs e) => ErrorOccurred?.Invoke(this, e);

        public void Dispose()
        {
            if (_disposed) return;

            _poolMaintenanceTimer?.Dispose();
            _runspacePoolSemaphore?.Dispose();

            // Dispose all runspaces in pool
            while (_runspacePool.TryDequeue(out var runspace))
            {
                try
                {
                    runspace?.Dispose();
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Error disposing runspace during cleanup");
                }
            }

            // Clean up active sessions
            foreach (var session in _activeSessions.Values)
            {
                try
                {
                    session.PowerShell?.Stop();
                    session.PowerShell?.Dispose();
                    session.Runspace?.Dispose();
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Error disposing active session during cleanup");
                }
            }

            _activeSessions.Clear();
            _disposed = true;

            _logger?.LogInformation("PowerShell execution service disposed");
        }
    }

    #region Supporting Classes

    public class PowerShellSession
    {
        public string SessionId { get; set; }
        public Runspace Runspace { get; set; }
        public PowerShell PowerShell { get; set; }
        public DateTime StartTime { get; set; }
        public CancellationToken CancellationToken { get; set; }
    }

    public class PowerShellExecutionResult
    {
        public string SessionId { get; set; }
        public string ModulePath { get; set; }
        public string FunctionName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? Duration { get; set; }
        public PowerShellExecutionState State { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public List<string> Output { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class MigrationItemResult
    {
        public string ItemId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? Duration { get; set; }
        public MigrationStatus Status { get; set; }
        public bool IsSuccess { get; set; }
        public string Output { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    // MigrationExecutionContext is defined in MigrationWaveOrchestrator.cs

    public class PowerShellExecutionOptions
    {
        public string WorkingDirectory { get; set; }
        public int TimeoutSeconds { get; set; } = 1800; // 30 minutes
        public TimeSpan Timeout { get; set; } = TimeSpan.FromMinutes(30);
        public Dictionary<string, object> Variables { get; set; } = new();
        public PowerShellExecutionPolicy ExecutionPolicy { get; set; } = PowerShellExecutionPolicy.RemoteSigned;
    }

    public enum PowerShellExecutionState
    {
        NotStarted,
        Running,
        Completed,
        CompletedWithErrors,
        Failed,
        Cancelled
    }

    public enum PowerShellExecutionPolicy
    {
        Restricted,
        AllSigned,
        RemoteSigned,
        Unrestricted,
        Bypass
    }

    #endregion

    #region Event Args

    public class PowerShellProgressEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string Activity { get; set; }
        public string StatusDescription { get; set; }
        public int PercentComplete { get; set; }
        public int SecondsRemaining { get; set; }
    }

    public class PowerShellOutputEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string Output { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class PowerShellErrorEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string Error { get; set; }
        public Exception Exception { get; set; }
        public DateTime Timestamp { get; set; }
    }

    #endregion
}