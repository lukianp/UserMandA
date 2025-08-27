#nullable enable
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Debug;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Asynchronous data loading service with priority management, circuit breaker, and progress reporting
    /// Addresses T-030 performance requirements for large dataset handling
    /// </summary>
    public class AsyncDataLoadingService : IDisposable
    {
        private readonly ILogger<AsyncDataLoadingService> _logger;
        private readonly SemaphoreSlim _concurrencyLimit;
        private readonly ConcurrentDictionary<string, LoadingOperation> _activeOperations = new();
        private readonly object _operationLock = new();
        private readonly int _maxConcurrentOperations = 3;
        private readonly MemoryPressureMonitor _memoryMonitor;
        private bool _disposed = false;

        // Circuit breaker state
        private readonly Dictionary<string, CircuitBreakerState> _circuitBreakers = new();
        private readonly int _circuitBreakerFailureThreshold = 3;
        private readonly TimeSpan _circuitBreakerResetTimeout = TimeSpan.FromMinutes(1);

        // Events for progress reporting
        public event EventHandler<LoadingProgressEventArgs>? LoadingProgress;
        public event EventHandler<LoadingCompletedEventArgs>? LoadingCompleted;
        public event EventHandler<LoadingErrorEventArgs>? LoadingError;

        public AsyncDataLoadingService(ILogger<AsyncDataLoadingService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _concurrencyLimit = new SemaphoreSlim(_maxConcurrentOperations, _maxConcurrentOperations);
            var memoryLogger = LoggerFactory.Create(builder => builder.AddDebug()).CreateLogger<MemoryPressureMonitor>();
            _memoryMonitor = new MemoryPressureMonitor(memoryLogger);
            
            _logger.LogInformation("AsyncDataLoadingService initialized with concurrency limit: {MaxConcurrent}", _maxConcurrentOperations);
        }

        /// <summary>
        /// Loads data asynchronously with priority management and memory optimization
        /// </summary>
        public async Task<LoadingResult> LoadAsync<T>(LoadingRequest<T> request, CancellationToken cancellationToken = default) where T : class
        {
            if (_disposed) throw new ObjectDisposedException(nameof(AsyncDataLoadingService));
            
            var operationId = Guid.NewGuid().ToString();
            var operation = new LoadingOperation(operationId, request.DataType, request.Priority, DateTime.UtcNow);
            
            try
            {
                // Check circuit breaker
                if (IsCircuitBreakerOpen(request.DataType))
                {
                    var error = $"Circuit breaker is open for data type: {request.DataType}";
                    _logger.LogWarning(error);
                    return LoadingResult.Failed(error);
                }

                // Check memory pressure before starting
                var memoryPressure = await _memoryMonitor.GetCurrentPressureAsync();
                if (memoryPressure >= MemoryPressureLevel.High && request.Priority != LoadingPriority.Critical)
                {
                    var error = "High memory pressure detected, deferring non-critical loading operations";
                    _logger.LogWarning(error);
                    return LoadingResult.Deferred(error);
                }

                // Wait for concurrency slot
                await _concurrencyLimit.WaitAsync(cancellationToken);
                
                lock (_operationLock)
                {
                    _activeOperations[operationId] = operation;
                }

                _logger.LogInformation("Starting loading operation {OperationId} for {DataType} with priority {Priority}", 
                    operationId, request.DataType, request.Priority);

                // Fire progress event
                LoadingProgress?.Invoke(this, new LoadingProgressEventArgs(operationId, request.DataType, 0, "Starting..."));

                var result = await ExecuteLoadingAsync(request, operation, cancellationToken);
                
                // Update circuit breaker on success
                RecordCircuitBreakerSuccess(request.DataType);
                
                LoadingCompleted?.Invoke(this, new LoadingCompletedEventArgs(operationId, request.DataType, result.ItemCount, result.Duration));
                
                _logger.LogInformation("Completed loading operation {OperationId} for {DataType}: {ItemCount} items in {Duration}ms", 
                    operationId, request.DataType, result.ItemCount, result.Duration.TotalMilliseconds);
                
                return result;
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Loading operation {OperationId} for {DataType} was cancelled", operationId, request.DataType);
                return LoadingResult.Cancelled();
            }
            catch (Exception ex)
            {
                // Update circuit breaker on failure
                RecordCircuitBreakerFailure(request.DataType);
                
                _logger.LogError(ex, "Failed loading operation {OperationId} for {DataType}", operationId, request.DataType);
                LoadingError?.Invoke(this, new LoadingErrorEventArgs(operationId, request.DataType, ex));
                
                return LoadingResult.Failed(ex.Message);
            }
            finally
            {
                lock (_operationLock)
                {
                    _activeOperations.TryRemove(operationId, out _);
                }
                _concurrencyLimit.Release();
            }
        }

        /// <summary>
        /// Executes the actual loading with progress reporting
        /// </summary>
        private async Task<LoadingResult> ExecuteLoadingAsync<T>(LoadingRequest<T> request, LoadingOperation operation, CancellationToken cancellationToken) where T : class
        {
            var startTime = DateTime.UtcNow;
            var totalItems = 0;
            var processedItems = 0;

            try
            {
                // Phase 1: Discovery - estimate total items
                LoadingProgress?.Invoke(this, new LoadingProgressEventArgs(operation.OperationId, request.DataType, 5, "Discovering data sources..."));
                
                var dataSources = await request.DiscoverSourcesFunc(cancellationToken);
                totalItems = dataSources.EstimatedItemCount;
                
                _logger.LogDebug("Discovered {SourceCount} data sources for {DataType} with estimated {ItemCount} items", 
                    dataSources.Sources.Count, request.DataType, totalItems);

                // Phase 2: Chunked loading with memory checks
                LoadingProgress?.Invoke(this, new LoadingProgressEventArgs(operation.OperationId, request.DataType, 10, "Loading data chunks..."));
                
                var allItems = new List<T>();
                var chunkSize = CalculateOptimalChunkSize(totalItems, await _memoryMonitor.GetCurrentPressureAsync());
                
                foreach (var source in dataSources.Sources)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    
                    // Check memory pressure before each chunk
                    var currentPressure = await _memoryMonitor.GetCurrentPressureAsync();
                    if (currentPressure >= MemoryPressureLevel.Critical)
                    {
                        _logger.LogWarning("Critical memory pressure detected during loading operation {OperationId}, triggering GC", operation.OperationId);
                        
                        // Force garbage collection and wait
                        GC.Collect(2, GCCollectionMode.Forced, true);
                        GC.WaitForPendingFinalizers();
                        GC.Collect(2, GCCollectionMode.Forced, true);
                        
                        await Task.Delay(100, cancellationToken); // Brief pause for GC
                    }
                    
                    var chunk = await request.LoadChunkFunc(source, chunkSize, cancellationToken);
                    allItems.AddRange(chunk);
                    processedItems += chunk.Count;
                    
                    // Report progress
                    var progressPercentage = Math.Min(95, 10 + (int)((double)processedItems / totalItems * 80));
                    LoadingProgress?.Invoke(this, new LoadingProgressEventArgs(
                        operation.OperationId, 
                        request.DataType, 
                        progressPercentage, 
                        $"Loaded {processedItems:N0} of {totalItems:N0} items"
                    ));
                }

                // Phase 3: Post-processing
                LoadingProgress?.Invoke(this, new LoadingProgressEventArgs(operation.OperationId, request.DataType, 95, "Post-processing..."));
                
                if (request.PostProcessFunc != null)
                {
                    allItems = await request.PostProcessFunc(allItems, cancellationToken);
                }

                LoadingProgress?.Invoke(this, new LoadingProgressEventArgs(operation.OperationId, request.DataType, 100, "Completed"));

                var duration = DateTime.UtcNow - startTime;
                return LoadingResult.Success(allItems.Count, duration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during execution of loading operation {OperationId} for {DataType}", operation.OperationId, request.DataType);
                throw;
            }
        }

        /// <summary>
        /// Calculates optimal chunk size based on total items and memory pressure
        /// </summary>
        private int CalculateOptimalChunkSize(int totalItems, MemoryPressureLevel memoryPressure)
        {
            var baseChunkSize = memoryPressure switch
            {
                MemoryPressureLevel.Low => Math.Min(10000, totalItems / 4),
                MemoryPressureLevel.Medium => Math.Min(5000, totalItems / 6),
                MemoryPressureLevel.High => Math.Min(2500, totalItems / 8),
                MemoryPressureLevel.Critical => Math.Min(1000, totalItems / 10),
                _ => 5000
            };

            return Math.Max(100, baseChunkSize); // Minimum chunk size of 100
        }

        /// <summary>
        /// Gets current loading operations status
        /// </summary>
        public LoadingStatus GetStatus()
        {
            lock (_operationLock)
            {
                return new LoadingStatus(
                    ActiveOperations: _activeOperations.Values.ToList(),
                    AvailableSlots: _concurrencyLimit.CurrentCount,
                    TotalSlots: _maxConcurrentOperations,
                    MemoryPressure: _memoryMonitor.GetCurrentPressureAsync().Result
                );
            }
        }

        #region Circuit Breaker Implementation

        private bool IsCircuitBreakerOpen(string dataType)
        {
            if (!_circuitBreakers.TryGetValue(dataType, out var state))
                return false;

            if (state.State == CircuitState.Open)
            {
                // Check if enough time has passed to reset
                if (DateTime.UtcNow - state.LastFailureTime > _circuitBreakerResetTimeout)
                {
                    state.State = CircuitState.HalfOpen;
                    _logger.LogInformation("Circuit breaker for {DataType} moved to half-open state", dataType);
                }
                else
                {
                    return true;
                }
            }

            return false;
        }

        private void RecordCircuitBreakerFailure(string dataType)
        {
            if (!_circuitBreakers.TryGetValue(dataType, out var state))
            {
                state = new CircuitBreakerState();
                _circuitBreakers[dataType] = state;
            }

            state.FailureCount++;
            state.LastFailureTime = DateTime.UtcNow;

            if (state.FailureCount >= _circuitBreakerFailureThreshold)
            {
                state.State = CircuitState.Open;
                _logger.LogWarning("Circuit breaker opened for {DataType} after {FailureCount} failures", dataType, state.FailureCount);
            }
        }

        private void RecordCircuitBreakerSuccess(string dataType)
        {
            if (_circuitBreakers.TryGetValue(dataType, out var state))
            {
                state.FailureCount = 0;
                state.State = CircuitState.Closed;
            }
        }

        #endregion

        public void Dispose()
        {
            if (!_disposed)
            {
                _concurrencyLimit?.Dispose();
                _memoryMonitor?.Dispose();
                _disposed = true;
                _logger.LogInformation("AsyncDataLoadingService disposed");
            }
        }
    }

    #region Supporting Types

    /// <summary>
    /// Priority levels for loading operations
    /// </summary>
    public enum LoadingPriority
    {
        Critical = 0,  // Dashboard data, core user data
        Primary = 1,   // Main entity data (Users, Groups, Devices)
        Extended = 2,  // T-029 data (Threats, Governance, Lineage)
        Computed = 3   // Projections, correlations, reports
    }

    /// <summary>
    /// Memory pressure levels for adaptive loading
    /// </summary>
    public enum MemoryPressureLevel
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Critical = 3
    }

    /// <summary>
    /// Request for asynchronous data loading
    /// </summary>
    public class LoadingRequest<T> where T : class
    {
        public string DataType { get; init; } = string.Empty;
        public LoadingPriority Priority { get; init; } = LoadingPriority.Primary;
        public Func<CancellationToken, Task<DataSourceDiscoveryResult>> DiscoverSourcesFunc { get; init; } = null!;
        public Func<DataSource, int, CancellationToken, Task<List<T>>> LoadChunkFunc { get; init; } = null!;
        public Func<List<T>, CancellationToken, Task<List<T>>>? PostProcessFunc { get; init; }
    }

    /// <summary>
    /// Result of data source discovery
    /// </summary>
    public record DataSourceDiscoveryResult(
        List<DataSource> Sources,
        int EstimatedItemCount
    );

    /// <summary>
    /// Represents a data source (file, API endpoint, etc.)
    /// </summary>
    public record DataSource(
        string Id,
        string Path,
        string Type,
        long EstimatedSize,
        DateTime LastModified
    );

    /// <summary>
    /// Result of a loading operation
    /// </summary>
    public class LoadingResult
    {
        public bool IsSuccess { get; init; }
        public bool IsCancelled { get; init; }
        public bool IsDeferred { get; init; }
        public int ItemCount { get; init; }
        public TimeSpan Duration { get; init; }
        public string? ErrorMessage { get; init; }

        private LoadingResult() { }

        public static LoadingResult Success(int itemCount, TimeSpan duration) => new()
        {
            IsSuccess = true,
            ItemCount = itemCount,
            Duration = duration
        };

        public static LoadingResult Failed(string errorMessage) => new()
        {
            IsSuccess = false,
            ErrorMessage = errorMessage
        };

        public static LoadingResult Cancelled() => new()
        {
            IsCancelled = true
        };

        public static LoadingResult Deferred(string reason) => new()
        {
            IsDeferred = true,
            ErrorMessage = reason
        };
    }

    /// <summary>
    /// Represents an active loading operation
    /// </summary>
    public record LoadingOperation(
        string OperationId,
        string DataType,
        LoadingPriority Priority,
        DateTime StartTime
    );

    /// <summary>
    /// Current status of the loading service
    /// </summary>
    public record LoadingStatus(
        List<LoadingOperation> ActiveOperations,
        int AvailableSlots,
        int TotalSlots,
        MemoryPressureLevel MemoryPressure
    );

    /// <summary>
    /// Event args for progress reporting
    /// </summary>
    public class LoadingProgressEventArgs : EventArgs
    {
        public string OperationId { get; }
        public string DataType { get; }
        public int ProgressPercentage { get; }
        public string StatusMessage { get; }
        public DateTime Timestamp { get; }

        public LoadingProgressEventArgs(string operationId, string dataType, int progressPercentage, string statusMessage)
        {
            OperationId = operationId;
            DataType = dataType;
            ProgressPercentage = progressPercentage;
            StatusMessage = statusMessage;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for completion reporting
    /// </summary>
    public class LoadingCompletedEventArgs : EventArgs
    {
        public string OperationId { get; }
        public string DataType { get; }
        public int ItemCount { get; }
        public TimeSpan Duration { get; }
        public DateTime Timestamp { get; }

        public LoadingCompletedEventArgs(string operationId, string dataType, int itemCount, TimeSpan duration)
        {
            OperationId = operationId;
            DataType = dataType;
            ItemCount = itemCount;
            Duration = duration;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for error reporting
    /// </summary>
    public class LoadingErrorEventArgs : EventArgs
    {
        public string OperationId { get; }
        public string DataType { get; }
        public Exception Exception { get; }
        public DateTime Timestamp { get; }

        public LoadingErrorEventArgs(string operationId, string dataType, Exception exception)
        {
            OperationId = operationId;
            DataType = dataType;
            Exception = exception;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Circuit breaker state for reliability
    /// </summary>
    internal class CircuitBreakerState
    {
        public CircuitState State { get; set; } = CircuitState.Closed;
        public int FailureCount { get; set; }
        public DateTime LastFailureTime { get; set; }
    }

    /// <summary>
    /// Circuit breaker states
    /// </summary>
    internal enum CircuitState
    {
        Closed,
        Open,
        HalfOpen
    }

    #endregion
}