using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Main migration engine service that orchestrates all migration providers
    /// </summary>
    public class MigrationEngineService
    {
        private readonly ILogger<MigrationEngineService> _logger;
        private readonly MigrationDependencyEngine _dependencyEngine;
        private readonly IServiceProvider _serviceProvider;
        private readonly Dictionary<MigrationType, IMigrationProvider<MigrationItem, object>> _providers;

        public event EventHandler<MigrationProgressEventArgs> MigrationProgress;
        public event EventHandler<MigrationCompletedEventArgs> MigrationCompleted;
        public event EventHandler<MigrationErrorEventArgs> MigrationError;

        public MigrationEngineService(
            ILogger<MigrationEngineService> logger,
            MigrationDependencyEngine dependencyEngine,
            IServiceProvider serviceProvider)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _dependencyEngine = dependencyEngine ?? throw new ArgumentNullException(nameof(dependencyEngine));
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
            _providers = new Dictionary<MigrationType, IMigrationProvider<MigrationItem, object>>();
            
            InitializeMigrationProviders();
        }

        /// <summary>
        /// Execute migration for a complete wave with dependency ordering
        /// </summary>
        public async Task<WaveExecutionResult> ExecuteMigrationWaveAsync(
            MigrationWaveExtended wave,
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new WaveExecutionResult
            {
                WaveId = wave.Id,
                WaveName = wave.Name,
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                _logger.LogInformation($"Starting migration wave execution: {wave.Name}");
                context.AuditLogger?.LogMigrationStart(context.SessionId, "Wave", wave.Name, context.InitiatedBy);

                // Step 1: Collect all migration items from batches
                var allItems = wave.Batches.SelectMany(b => b.Items).ToList();
                _logger.LogInformation($"Collected {allItems.Count} migration items from {wave.Batches.Count} batches");

                // Step 2: Build dependency graph
                context.ReportProgress("Wave Execution", 10, "Building dependency graph");
                var dependencyGraph = await _dependencyEngine.BuildDependencyGraphAsync(allItems, context, cancellationToken);
                
                // Step 3: Validate dependencies
                context.ReportProgress("Wave Execution", 20, "Validating dependencies");
                var validationResult = await _dependencyEngine.ValidateDependenciesAsync(dependencyGraph, context, cancellationToken);
                if (!validationResult.IsValid)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"Dependency validation failed: {string.Join(", ", validationResult.Errors)}";
                    result.Errors.AddRange(validationResult.Errors);
                    return result;
                }

                // Step 4: Order items into execution stages
                context.ReportProgress("Wave Execution", 30, "Creating execution stages");
                var migrationStages = await _dependencyEngine.OrderMigrationStagesAsync(dependencyGraph, ConvertToBasicWave(wave), cancellationToken);
                _logger.LogInformation($"Created {migrationStages.Count()} migration stages");

                // Step 5: Execute stages in order
                var completedItems = new List<MigrationItem>();
                var failedItems = new List<MigrationItem>();
                var stageNumber = 0;

                foreach (var stage in migrationStages)
                {
                    stageNumber++;
                    cancellationToken.ThrowIfCancellationRequested();

                    var progressBase = 30 + (stageNumber * 60 / migrationStages.Count());
                    context.ReportProgress("Wave Execution", progressBase, $"Executing stage {stageNumber} of {migrationStages.Count()}");

                    var stageResult = await ExecuteMigrationStageAsync(stage, context, cancellationToken);
                    
                    completedItems.AddRange(stageResult.CompletedItems);
                    failedItems.AddRange(stageResult.FailedItems);

                    // Check for critical failures that should stop the wave
                    if (stageResult.CriticalFailure && !context.ContinueOnError)
                    {
                        result.IsSuccess = false;
                        result.ErrorMessage = $"Critical failure in stage {stageNumber}: {stageResult.ErrorMessage}";
                        result.Errors.AddRange(stageResult.Errors);
                        break;
                    }
                }

                // Step 6: Finalize wave execution
                context.ReportProgress("Wave Execution", 95, "Finalizing wave execution");
                await FinalizeMigrationWaveAsync(wave, completedItems, failedItems, context, cancellationToken);

                // Build final result
                result.IsSuccess = failedItems.Count == 0 || (completedItems.Count > 0 && context.ContinueOnError);
                result.EndTime = DateTime.Now;
                result.TotalItems = allItems.Count;
                result.CompletedItems = completedItems.Count;
                result.FailedItems = failedItems.Count;
                result.SuccessRate = allItems.Count > 0 ? (double)completedItems.Count / allItems.Count * 100 : 100;

                context.ReportProgress("Wave Execution", 100, "Wave execution completed");
                context.AuditLogger?.LogMigrationComplete(context.SessionId, "Wave", wave.Name, result.IsSuccess);

                _logger.LogInformation($"Migration wave completed: {wave.Name}. Success: {result.IsSuccess}, Completed: {completedItems.Count}, Failed: {failedItems.Count}");

                OnMigrationCompleted(new MigrationCompletedEventArgs
                {
                    SessionId = context.SessionId,
                    WaveName = wave.Name,
                    Success = result.IsSuccess,
                    TotalItems = result.TotalItems,
                    CompletedItems = result.CompletedItems,
                    FailedItems = result.FailedItems,
                    Duration = result.Duration,
                    Errors = result.Errors
                });
            }
            catch (OperationCanceledException)
            {
                result.IsSuccess = false;
                result.ErrorMessage = "Migration wave was cancelled";
                result.EndTime = DateTime.Now;
                _logger.LogWarning($"Migration wave cancelled: {wave.Name}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                result.EndTime = DateTime.Now;
                
                context.AuditLogger?.LogMigrationComplete(context.SessionId, "Wave", wave.Name, false, ex.Message);
                _logger.LogError(ex, $"Migration wave failed: {wave.Name}");

                OnMigrationError(new MigrationErrorEventArgs
                {
                    SessionId = context.SessionId,
                    WaveName = wave.Name,
                    Error = ex,
                    ItemId = "Wave"
                });
            }

            return result;
        }

        /// <summary>
        /// Execute a single migration stage
        /// </summary>
        private async Task<StageExecutionResult> ExecuteMigrationStageAsync(
            MigrationStage stage,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            var result = new StageExecutionResult
            {
                StageNumber = stage.StageOrder,
                StartTime = DateTime.Now
            };

            try
            {
                _logger.LogInformation($"Executing migration stage {stage.StageOrder} with {stage.ItemCount} items");

                if (stage.AllowParallelExecution && stage.ItemCount > 1)
                {
                    // Execute items in parallel with concurrency control
                    var semaphore = new SemaphoreSlim(context.MaxConcurrentOperations, context.MaxConcurrentOperations);
                    var tasks = stage.Items.Select(async item =>
                    {
                        await semaphore.WaitAsync(cancellationToken);
                        try
                        {
                            return await ExecuteSingleMigrationItemAsync(item, context, cancellationToken);
                        }
                        finally
                        {
                            semaphore.Release();
                        }
                    });

                    var itemResults = await Task.WhenAll(tasks);
                    ProcessItemResults(itemResults, result);
                }
                else
                {
                    // Execute items sequentially
                    foreach (var item in stage.Items)
                    {
                        cancellationToken.ThrowIfCancellationRequested();
                        
                        var itemResult = await ExecuteSingleMigrationItemAsync(item, context, cancellationToken);
                        ProcessItemResult(itemResult, result);

                        // Check for critical failures
                        if (!itemResult.IsSuccess && item.Priority == MigrationPriority.Critical)
                        {
                            result.CriticalFailure = true;
                            result.ErrorMessage = $"Critical item failed: {item.SourceIdentity}";
                            break;
                        }
                    }
                }

                result.EndTime = DateTime.Now;
                result.IsSuccess = result.FailedItems.Count == 0 || result.CompletedItems.Count > 0;

                _logger.LogInformation($"Stage {stage.StageOrder} completed. Success: {result.IsSuccess}, Completed: {result.CompletedItems.Count}, Failed: {result.FailedItems.Count}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                result.EndTime = DateTime.Now;
                
                _logger.LogError(ex, $"Stage {stage.StageOrder} execution failed");
            }

            return result;
        }

        /// <summary>
        /// Execute migration for a single item
        /// </summary>
        private async Task<ItemExecutionResult> ExecuteSingleMigrationItemAsync(
            MigrationItem item,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            var result = new ItemExecutionResult
            {
                Item = item,
                StartTime = DateTime.Now
            };

            try
            {
                _logger.LogDebug($"Starting migration for item: {item.SourceIdentity} ({item.Type})");
                
                // Get appropriate migration provider
                var provider = GetMigrationProvider(item.Type);
                if (provider == null)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = $"No migration provider found for type: {item.Type}";
                    return result;
                }

                // Update item status
                item.Status = MigrationStatus.InProgress;
                item.StartTime = DateTime.Now;

                // Report progress
                OnMigrationProgress(new MigrationProgressEventArgs
                {
                    SessionId = context.SessionId,
                    ItemId = item.Id,
                    ItemType = item.Type.ToString(),
                    Status = "Starting",
                    ProgressPercentage = 0
                });

                // Execute migration
                var migrationResult = await provider.MigrateAsync(item, context, cancellationToken);

                // Update item with results
                item.EndTime = DateTime.Now;
                if (migrationResult.IsSuccess)
                {
                    item.Status = migrationResult.Warnings?.Any() == true ? MigrationStatus.CompletedWithWarnings : MigrationStatus.Completed;
                    item.TargetIdentity = migrationResult.TargetId;
                    result.IsSuccess = true;
                }
                else
                {
                    item.Status = MigrationStatus.Failed;
                    item.Errors.AddRange(migrationResult.Errors);
                    result.IsSuccess = false;
                    result.ErrorMessage = migrationResult.ErrorMessage;
                    result.Errors.AddRange(migrationResult.Errors);
                }

                // Add warnings
                if (migrationResult.Warnings?.Any() == true)
                {
                    item.Warnings.AddRange(migrationResult.Warnings);
                    result.Warnings.AddRange(migrationResult.Warnings);
                }

                result.EndTime = DateTime.Now;

                // Report completion
                OnMigrationProgress(new MigrationProgressEventArgs
                {
                    SessionId = context.SessionId,
                    ItemId = item.Id,
                    ItemType = item.Type.ToString(),
                    Status = item.Status.ToString(),
                    ProgressPercentage = 100,
                    Success = result.IsSuccess,
                    ErrorMessage = result.ErrorMessage
                });

                context.AuditLogger?.LogMigrationComplete(context.SessionId, item.Type.ToString(), item.SourceIdentity, result.IsSuccess, result.ErrorMessage);

                _logger.LogDebug($"Migration completed for item: {item.SourceIdentity}. Success: {result.IsSuccess}");
            }
            catch (OperationCanceledException)
            {
                result.IsSuccess = false;
                result.ErrorMessage = "Migration was cancelled";
                item.Status = MigrationStatus.Cancelled;
                item.EndTime = DateTime.Now;
                
                _logger.LogWarning($"Migration cancelled for item: {item.SourceIdentity}");
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                result.EndTime = DateTime.Now;
                
                item.Status = MigrationStatus.Failed;
                item.Errors.Add(ex.Message);
                item.EndTime = DateTime.Now;
                
                context.AuditLogger?.LogMigrationComplete(context.SessionId, item.Type.ToString(), item.SourceIdentity, false, ex.Message);
                _logger.LogError(ex, $"Migration failed for item: {item.SourceIdentity}");

                OnMigrationError(new MigrationErrorEventArgs
                {
                    SessionId = context.SessionId,
                    ItemId = item.Id,
                    ItemType = item.Type.ToString(),
                    Error = ex
                });
            }

            return result;
        }

        /// <summary>
        /// Get migration provider for a specific type
        /// </summary>
        private IMigrationProvider<MigrationItem, object> GetMigrationProvider(MigrationType type)
        {
            if (_providers.TryGetValue(type, out var provider))
            {
                return provider;
            }

            // Try to resolve provider from service provider
            switch (type)
            {
                case MigrationType.User:
                case MigrationType.UserProfile:
                    var identityProvider = _serviceProvider.GetService(typeof(IIdentityMigrator)) as IIdentityMigrator;
                    if (identityProvider != null)
                    {
                        var adapter = new IdentityMigratorAdapter(identityProvider);
                        _providers[type] = adapter;
                        return adapter;
                    }
                    break;

                case MigrationType.Mailbox:
                    var mailProvider = _serviceProvider.GetService(typeof(IMailMigrator)) as IMailMigrator;
                    if (mailProvider != null)
                    {
                        var adapter = new MailMigratorAdapter(mailProvider);
                        _providers[type] = adapter;
                        return adapter;
                    }
                    break;

                case MigrationType.FileShare:
                    var fileProvider = _serviceProvider.GetService(typeof(IFileMigrator)) as IFileMigrator;
                    if (fileProvider != null)
                    {
                        var adapter = new FileMigratorAdapter(fileProvider);
                        _providers[type] = adapter;
                        return adapter;
                    }
                    break;

                case MigrationType.Database:
                    var sqlProvider = _serviceProvider.GetService(typeof(ISqlMigrator)) as ISqlMigrator;
                    if (sqlProvider != null)
                    {
                        var adapter = new SqlMigratorAdapter(sqlProvider);
                        _providers[type] = adapter;
                        return adapter;
                    }
                    break;
            }

            return null;
        }

        /// <summary>
        /// Initialize migration providers
        /// </summary>
        private void InitializeMigrationProviders()
        {
            // Providers will be resolved lazily from service container
            _logger.LogInformation("Migration engine initialized with lazy provider resolution");
        }

        /// <summary>
        /// Process item results from parallel execution
        /// </summary>
        private void ProcessItemResults(ItemExecutionResult[] itemResults, StageExecutionResult stageResult)
        {
            foreach (var itemResult in itemResults)
            {
                ProcessItemResult(itemResult, stageResult);
            }
        }

        /// <summary>
        /// Process single item result
        /// </summary>
        private void ProcessItemResult(ItemExecutionResult itemResult, StageExecutionResult stageResult)
        {
            if (itemResult.IsSuccess)
            {
                stageResult.CompletedItems.Add(itemResult.Item);
            }
            else
            {
                stageResult.FailedItems.Add(itemResult.Item);
                stageResult.Errors.AddRange(itemResult.Errors);
            }

            stageResult.Warnings.AddRange(itemResult.Warnings);
        }

        /// <summary>
        /// Finalize migration wave execution
        /// </summary>
        private async Task FinalizeMigrationWaveAsync(
            MigrationWaveExtended wave,
            List<MigrationItem> completedItems,
            List<MigrationItem> failedItems,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            await Task.CompletedTask; // Async compliance

            // Update wave status
            if (failedItems.Count == 0)
            {
                wave.Status = MigrationStatus.Completed;
            }
            else if (completedItems.Count > 0)
            {
                wave.Status = MigrationStatus.CompletedWithWarnings;
            }
            else
            {
                wave.Status = MigrationStatus.Failed;
            }

            wave.ActualEndDate = DateTime.Now;

            // Update batch statuses
            foreach (var batch in wave.Batches)
            {
                var batchItems = batch.Items;
                var batchCompleted = batchItems.Count(i => completedItems.Any(c => c.Id == i.Id));
                var batchFailed = batchItems.Count(i => failedItems.Any(f => f.Id == i.Id));

                if (batchFailed == 0)
                {
                    batch.Status = MigrationStatus.Completed;
                }
                else if (batchCompleted > 0)
                {
                    batch.Status = MigrationStatus.CompletedWithWarnings;
                }
                else
                {
                    batch.Status = MigrationStatus.Failed;
                }

                batch.EndTime = DateTime.Now;
            }

            _logger.LogInformation($"Wave finalization completed: {wave.Name}");
        }

        /// <summary>
        /// Convert MigrationWaveExtended to MigrationWave
        /// </summary>
        private MigrationWave ConvertToBasicWave(MigrationWaveExtended extendedWave)
        {
            return new MigrationWave
            {
                Id = extendedWave.Id,
                Name = extendedWave.Name,
                Order = extendedWave.Order,
                PlannedStartDate = extendedWave.PlannedStartDate,
                ActualStartDate = extendedWave.ActualStartDate,
                ActualEndDate = extendedWave.ActualEndDate,
                Status = extendedWave.Status,
                Batches = extendedWave.Batches,
                Metadata = extendedWave.Metadata,
                Notes = extendedWave.Notes,
                Prerequisites = extendedWave.Prerequisites
            };
        }

        // Event handlers
        protected virtual void OnMigrationProgress(MigrationProgressEventArgs e)
        {
            MigrationProgress?.Invoke(this, e);
        }

        protected virtual void OnMigrationCompleted(MigrationCompletedEventArgs e)
        {
            MigrationCompleted?.Invoke(this, e);
        }

        protected virtual void OnMigrationError(MigrationErrorEventArgs e)
        {
            MigrationError?.Invoke(this, e);
        }
    }

    // Supporting classes

    /// <summary>
    /// Wave execution result
    /// </summary>
    public class WaveExecutionResult : MigrationResultBase
    {
        public string WaveId { get; set; }
        public string WaveName { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public int FailedItems { get; set; }
        public double SuccessRate { get; set; }
    }

    /// <summary>
    /// Stage execution result
    /// </summary>
    public class StageExecutionResult : MigrationResultBase
    {
        public int StageNumber { get; set; }
        public List<MigrationItem> CompletedItems { get; set; } = new List<MigrationItem>();
        public List<MigrationItem> FailedItems { get; set; } = new List<MigrationItem>();
        public bool CriticalFailure { get; set; }
    }

    /// <summary>
    /// Item execution result
    /// </summary>
    public class ItemExecutionResult : MigrationResultBase
    {
        public MigrationItem Item { get; set; }
    }

    // Event argument classes

    /// <summary>
    /// Migration progress event arguments
    /// </summary>
    public class MigrationProgressEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string ItemId { get; set; }
        public string ItemType { get; set; }
        public string Status { get; set; }
        public double ProgressPercentage { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Migration completed event arguments
    /// </summary>
    public class MigrationCompletedEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string WaveName { get; set; }
        public bool Success { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public int FailedItems { get; set; }
        public TimeSpan Duration { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Migration error event arguments
    /// </summary>
    public class MigrationErrorEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string WaveName { get; set; }
        public string ItemId { get; set; }
        public string ItemType { get; set; }
        public Exception Error { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    // Adapter classes to bridge specific providers to generic interface

    /// <summary>
    /// Adapter for identity migrator
    /// </summary>
    public class IdentityMigratorAdapter : IMigrationProvider<MigrationItem, object>
    {
        private readonly IIdentityMigrator _identityMigrator;

        public IdentityMigratorAdapter(IIdentityMigrator identityMigrator)
        {
            _identityMigrator = identityMigrator;
        }

        public async Task<MigrationResult<object>> MigrateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var userProfile = CreateUserProfileFromItem(item);
            var result = await _identityMigrator.MigrateAsync(userProfile, context, cancellationToken);
            
            return new MigrationResult<object>
            {
                Result = result.Result,
                IsSuccess = result.IsSuccess,
                ErrorMessage = result.ErrorMessage,
                Errors = result.Errors,
                Warnings = result.Warnings,
                StartTime = result.StartTime,
                EndTime = result.EndTime,
                SourceId = result.SourceId,
                TargetId = result.TargetId,
                SessionId = result.SessionId,
                ExecutedBy = result.ExecutedBy
            };
        }

        public async Task<ValidationResult> ValidateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var userProfile = CreateUserProfileFromItem(item);
            return await _identityMigrator.ValidateAsync(userProfile, context, cancellationToken);
        }

        public async Task<RollbackResult> RollbackAsync(object result, MigrationContext context, CancellationToken cancellationToken = default)
        {
            if (result is IdentityMigrationResult identityResult)
            {
                return await _identityMigrator.RollbackAsync(identityResult, context, cancellationToken);
            }
            return new RollbackResult { IsSuccess = false, ErrorMessage = "Invalid result type for rollback" };
        }

        public async Task<bool> SupportsAsync(MigrationType type, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return await _identityMigrator.SupportsAsync(type, context, cancellationToken);
        }

        public async Task<TimeSpan> EstimateDurationAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            var userProfile = CreateUserProfileFromItem(item);
            return await _identityMigrator.EstimateDurationAsync(userProfile, context, cancellationToken);
        }

        private UserProfileItem CreateUserProfileFromItem(MigrationItem item)
        {
            return new UserProfileItem
            {
                UserPrincipalName = item.SourceIdentity,
                DisplayName = item.DisplayName ?? item.SourceIdentity,
                SamAccountName = ExtractSamAccountName(item.SourceIdentity),
                SourceDomain = ExtractDomain(item.SourceIdentity),
                SecurityGroups = item.Dependencies?.ToList() ?? new List<string>(),
                Attributes = item.Properties?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value?.ToString()) ?? new Dictionary<string, string>(),
                IsEnabled = true,
                ProfileSizeMB = item.SizeBytes.HasValue ? item.SizeBytes.Value / (1024 * 1024) : 0
            };
        }

        private string ExtractSamAccountName(string upn)
        {
            return upn.Contains("@") ? upn.Split('@')[0] : upn;
        }

        private string ExtractDomain(string upn)
        {
            return upn.Contains("@") ? upn.Split('@')[1] : "";
        }
    }

    // Placeholder adapter classes for other migration types
    public class MailMigratorAdapter : IMigrationProvider<MigrationItem, object>
    {
        private readonly IMailMigrator _mailMigrator;

        public MailMigratorAdapter(IMailMigrator mailMigrator)
        {
            _mailMigrator = mailMigrator;
        }

        public async Task<MigrationResult<object>> MigrateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            // Implementation would convert MigrationItem to MailboxItem and call _mailMigrator
            await Task.CompletedTask;
            return new MigrationResult<object> { IsSuccess = true, Result = new MailMigrationResult() };
        }

        public async Task<ValidationResult> ValidateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new ValidationResult { IsSuccess = true };
        }

        public async Task<RollbackResult> RollbackAsync(object result, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new RollbackResult { IsSuccess = true };
        }

        public async Task<bool> SupportsAsync(MigrationType type, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return await _mailMigrator.SupportsAsync(type, context, cancellationToken);
        }

        public async Task<TimeSpan> EstimateDurationAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return TimeSpan.FromMinutes(15); // Default estimate
        }
    }

    public class FileMigratorAdapter : IMigrationProvider<MigrationItem, object>
    {
        private readonly IFileMigrator _fileMigrator;

        public FileMigratorAdapter(IFileMigrator fileMigrator)
        {
            _fileMigrator = fileMigrator;
        }

        public async Task<MigrationResult<object>> MigrateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new MigrationResult<object> { IsSuccess = true, Result = new FileMigrationResult() };
        }

        public async Task<ValidationResult> ValidateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new ValidationResult { IsSuccess = true };
        }

        public async Task<RollbackResult> RollbackAsync(object result, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new RollbackResult { IsSuccess = true };
        }

        public async Task<bool> SupportsAsync(MigrationType type, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return await _fileMigrator.SupportsAsync(type, context, cancellationToken);
        }

        public async Task<TimeSpan> EstimateDurationAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return TimeSpan.FromMinutes(30); // Default estimate
        }
    }

    public class SqlMigratorAdapter : IMigrationProvider<MigrationItem, object>
    {
        private readonly ISqlMigrator _sqlMigrator;

        public SqlMigratorAdapter(ISqlMigrator sqlMigrator)
        {
            _sqlMigrator = sqlMigrator;
        }

        public async Task<MigrationResult<object>> MigrateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new MigrationResult<object> { IsSuccess = true, Result = new SqlMigrationResult() };
        }

        public async Task<ValidationResult> ValidateAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new ValidationResult { IsSuccess = true };
        }

        public async Task<RollbackResult> RollbackAsync(object result, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return new RollbackResult { IsSuccess = true };
        }

        public async Task<bool> SupportsAsync(MigrationType type, MigrationContext context, CancellationToken cancellationToken = default)
        {
            return await _sqlMigrator.SupportsAsync(type, context, cancellationToken);
        }

        public async Task<TimeSpan> EstimateDurationAsync(MigrationItem item, MigrationContext context, CancellationToken cancellationToken = default)
        {
            await Task.CompletedTask;
            return TimeSpan.FromHours(1); // Default estimate
        }
    }
}