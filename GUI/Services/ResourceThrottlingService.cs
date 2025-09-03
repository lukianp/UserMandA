using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise resource throttling and load balancing service for migration operations
    /// </summary>
    public class ResourceThrottlingService : IDisposable
    {
        private readonly ILogger<ResourceThrottlingService> _logger;
        private readonly ConcurrentDictionary<string, ResourcePool> _resourcePools;
        private readonly ConcurrentDictionary<string, ThrottleConfiguration> _throttleConfigurations;
        private readonly ConcurrentDictionary<string, ActiveOperation> _activeOperations;
        private readonly SemaphoreSlim _coordinationLock;
        private readonly Timer _monitoringTimer;
        private readonly Timer _balancingTimer;
        private readonly ThrottlingPerformanceMetrics _metrics;
        private bool _disposed = false;

        public event EventHandler<ResourceAllocatedEventArgs> ResourceAllocated;
        public event EventHandler<ResourceReleasedEventArgs> ResourceReleased;
        public event EventHandler<ThrottleActivatedEventArgs> ThrottleActivated;
        public event EventHandler<LoadBalancedEventArgs> LoadBalanced;
        public event EventHandler<PerformanceAlertEventArgs> PerformanceAlert;

        public ResourceThrottlingService(ILogger<ResourceThrottlingService> logger = null)
        {
            _logger = logger;
            _resourcePools = new ConcurrentDictionary<string, ResourcePool>();
            _throttleConfigurations = new ConcurrentDictionary<string, ThrottleConfiguration>();
            _activeOperations = new ConcurrentDictionary<string, ActiveOperation>();
            _coordinationLock = new SemaphoreSlim(1, 1);
            _metrics = new ThrottlingPerformanceMetrics();

            // Initialize default resource pools
            InitializeDefaultResourcePools();

            // Start monitoring and balancing timers
            _monitoringTimer = new Timer(
                MonitorResourceUsage, 
                null, 
                TimeSpan.FromSeconds(30), 
                TimeSpan.FromSeconds(30));

            _balancingTimer = new Timer(
                PerformLoadBalancing, 
                null, 
                TimeSpan.FromMinutes(2), 
                TimeSpan.FromMinutes(2));

            _logger?.LogInformation("Resource throttling service initialized");
        }

        /// <summary>
        /// Request resource allocation for migration operation
        /// </summary>
        public async Task<ResourceAllocationResult> RequestResourceAsync(
            ResourceRequest request,
            CancellationToken cancellationToken = default)
        {
            var allocationId = Guid.NewGuid().ToString();
            var result = new ResourceAllocationResult
            {
                AllocationId = allocationId,
                Request = request,
                RequestedAt = DateTime.Now
            };

            try
            {
                await _coordinationLock.WaitAsync(cancellationToken);

                // Validate resource request
                var validationResult = ValidateResourceRequest(request);
                if (!validationResult.IsValid)
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = string.Join(", ", validationResult.Errors);
                    return result;
                }

                // Check throttle limits
                var throttleCheck = CheckThrottleLimits(request);
                if (!throttleCheck.IsAllowed)
                {
                    result.IsSuccess = false;
                    result.IsThrottled = true;
                    result.ErrorMessage = throttleCheck.Reason;
                    result.RetryAfter = throttleCheck.RetryAfter;
                    
                    OnThrottleActivated(new ThrottleActivatedEventArgs
                    {
                        ResourceType = request.ResourceType,
                        OperationType = request.OperationType,
                        Reason = throttleCheck.Reason,
                        RetryAfter = throttleCheck.RetryAfter,
                        ActivatedAt = DateTime.Now
                    });

                    return result;
                }

                // Allocate resources from appropriate pool
                var allocation = await AllocateFromPoolAsync(request, allocationId);
                if (allocation != null)
                {
                    result.IsSuccess = true;
                    result.AllocatedResources = allocation;
                    result.AllocatedAt = DateTime.Now;

                    // Track active operation
                    var operation = new ActiveOperation
                    {
                        OperationId = allocationId,
                        Request = request,
                        Allocation = allocation,
                        StartedAt = DateTime.Now,
                        LastActivity = DateTime.Now
                    };

                    _activeOperations[allocationId] = operation;

                    OnResourceAllocated(new ResourceAllocatedEventArgs
                    {
                        AllocationId = allocationId,
                        ResourceType = request.ResourceType,
                        AllocatedCount = allocation.AllocatedCount,
                        PoolUtilization = GetPoolUtilization(request.ResourceType),
                        AllocatedAt = DateTime.Now
                    });

                    _logger?.LogInformation($"Allocated {allocation.AllocatedCount} {request.ResourceType} resources for operation {allocationId}");
                }
                else
                {
                    result.IsSuccess = false;
                    result.ErrorMessage = "No resources available in pool";
                    result.RetryAfter = TimeSpan.FromMinutes(1);
                }

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = $"Resource allocation failed: {ex.Message}";
                _logger?.LogError(ex, $"Failed to allocate resources for operation {allocationId}");
                return result;
            }
            finally
            {
                _coordinationLock.Release();
            }
        }

        /// <summary>
        /// Release previously allocated resources
        /// </summary>
        public async Task<bool> ReleaseResourceAsync(string allocationId)
        {
            try
            {
                await _coordinationLock.WaitAsync();

                if (!_activeOperations.TryRemove(allocationId, out var operation))
                {
                    _logger?.LogWarning($"No active operation found for allocation {allocationId}");
                    return false;
                }

                // Return resources to pool
                await ReturnToPoolAsync(operation.Allocation);

                // Update metrics
                var duration = DateTime.Now - operation.StartedAt;
                _metrics.RecordOperationCompletion(operation.Request.ResourceType, duration);

                OnResourceReleased(new ResourceReleasedEventArgs
                {
                    AllocationId = allocationId,
                    ResourceType = operation.Request.ResourceType,
                    ReleasedCount = operation.Allocation.AllocatedCount,
                    OperationDuration = duration,
                    ReleasedAt = DateTime.Now
                });

                _logger?.LogInformation($"Released {operation.Allocation.AllocatedCount} {operation.Request.ResourceType} resources from operation {allocationId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to release resources for allocation {allocationId}");
                return false;
            }
            finally
            {
                _coordinationLock.Release();
            }
        }

        /// <summary>
        /// Update throttle configuration for resource type
        /// </summary>
        public void UpdateThrottleConfiguration(string resourceType, ThrottleConfiguration configuration)
        {
            _throttleConfigurations[resourceType] = configuration;
            _logger?.LogInformation($"Updated throttle configuration for {resourceType}: {configuration.MaxConcurrent} max concurrent, {configuration.RateLimit} rate limit");
        }

        /// <summary>
        /// Get current resource utilization statistics
        /// </summary>
        public ResourceUtilizationReport GetUtilizationReport()
        {
            var report = new ResourceUtilizationReport
            {
                GeneratedAt = DateTime.Now,
                PoolUtilizations = new Dictionary<string, PoolUtilization>(),
                ActiveOperations = _activeOperations.Count,
                TotalOperationsToday = _metrics.GetTotalOperationsToday(),
                AverageOperationDuration = _metrics.GetAverageOperationDuration()
            };

            foreach (var pool in _resourcePools)
            {
                var utilization = GetPoolUtilization(pool.Key);
                report.PoolUtilizations[pool.Key] = utilization;
            }

            return report;
        }

        /// <summary>
        /// Configure resource pool
        /// </summary>
        public void ConfigureResourcePool(string resourceType, ResourcePoolConfiguration configuration)
        {
            var pool = new ResourcePool
            {
                ResourceType = resourceType,
                Configuration = configuration,
                Available = configuration.MaxSize,
                Allocated = 0,
                CreatedAt = DateTime.Now
            };

            _resourcePools[resourceType] = pool;
            _logger?.LogInformation($"Configured resource pool for {resourceType}: max {configuration.MaxSize}, min {configuration.MinSize}");
        }

        /// <summary>
        /// Get recommended resource allocation for operation
        /// </summary>
        public ResourceRecommendation GetResourceRecommendation(ResourceRequest request)
        {
            var recommendation = new ResourceRecommendation
            {
                ResourceType = request.ResourceType,
                OperationType = request.OperationType,
                RequestedCount = request.RequestedCount
            };

            try
            {
                // Analyze historical performance for similar operations
                var historicalData = _metrics.GetHistoricalData(request.ResourceType, request.OperationType);
                
                // Calculate optimal allocation based on load patterns
                var currentLoad = GetCurrentLoad(request.ResourceType);
                var optimalCount = CalculateOptimalAllocation(request, currentLoad, historicalData);

                recommendation.RecommendedCount = optimalCount;
                recommendation.Confidence = CalculateConfidence(historicalData);
                recommendation.EstimatedDuration = EstimateOperationDuration(request, optimalCount);
                recommendation.EstimatedCompletion = DateTime.Now.Add(recommendation.EstimatedDuration);

                // Add optimization suggestions
                recommendation.Suggestions = GenerateOptimizationSuggestions(request, currentLoad);

                return recommendation;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Failed to generate resource recommendation for {request.ResourceType}");
                
                recommendation.RecommendedCount = request.RequestedCount;
                recommendation.Confidence = 0.5;
                recommendation.EstimatedDuration = TimeSpan.FromHours(1);
                recommendation.EstimatedCompletion = DateTime.Now.AddHours(1);
                
                return recommendation;
            }
        }

        /// <summary>
        /// Initialize default resource pools
        /// </summary>
        private void InitializeDefaultResourcePools()
        {
            var defaultPools = new Dictionary<string, ResourcePoolConfiguration>
            {
                ["PowerShell"] = new ResourcePoolConfiguration
                {
                    MaxSize = 20,
                    MinSize = 5,
                    GrowthIncrement = 2,
                    ShrinkThreshold = 0.3,
                    IdleTimeout = TimeSpan.FromMinutes(10)
                },
                ["Database"] = new ResourcePoolConfiguration
                {
                    MaxSize = 50,
                    MinSize = 10,
                    GrowthIncrement = 5,
                    ShrinkThreshold = 0.4,
                    IdleTimeout = TimeSpan.FromMinutes(5)
                },
                ["Network"] = new ResourcePoolConfiguration
                {
                    MaxSize = 100,
                    MinSize = 20,
                    GrowthIncrement = 10,
                    ShrinkThreshold = 0.5,
                    IdleTimeout = TimeSpan.FromMinutes(2)
                },
                ["Memory"] = new ResourcePoolConfiguration
                {
                    MaxSize = 1000, // MB
                    MinSize = 200,
                    GrowthIncrement = 100,
                    ShrinkThreshold = 0.6,
                    IdleTimeout = TimeSpan.FromMinutes(1)
                }
            };

            foreach (var poolConfig in defaultPools)
            {
                ConfigureResourcePool(poolConfig.Key, poolConfig.Value);
            }

            // Initialize default throttle configurations
            var defaultThrottles = new Dictionary<string, ThrottleConfiguration>
            {
                ["User"] = new ThrottleConfiguration
                {
                    MaxConcurrent = 10,
                    RateLimit = 100, // operations per minute
                    BurstLimit = 20,
                    BackoffStrategy = BackoffStrategy.Exponential
                },
                ["Mailbox"] = new ThrottleConfiguration
                {
                    MaxConcurrent = 5,
                    RateLimit = 30,
                    BurstLimit = 10,
                    BackoffStrategy = BackoffStrategy.Linear
                },
                ["FileShare"] = new ThrottleConfiguration
                {
                    MaxConcurrent = 15,
                    RateLimit = 200,
                    BurstLimit = 50,
                    BackoffStrategy = BackoffStrategy.Exponential
                }
            };

            foreach (var throttleConfig in defaultThrottles)
            {
                _throttleConfigurations[throttleConfig.Key] = throttleConfig.Value;
            }
        }

        /// <summary>
        /// Monitor resource usage and performance
        /// </summary>
        private async void MonitorResourceUsage(object state)
        {
            try
            {
                await _coordinationLock.WaitAsync();

                // Check for resource pool issues
                foreach (var pool in _resourcePools.Values)
                {
                    var utilization = (double)pool.Allocated / pool.Configuration.MaxSize;
                    
                    if (utilization > 0.9)
                    {
                        OnPerformanceAlert(new PerformanceAlertEventArgs
                        {
                            AlertType = PerformanceAlertType.HighUtilization,
                            ResourceType = pool.ResourceType,
                            CurrentUtilization = utilization,
                            Threshold = 0.9,
                            Message = $"High utilization detected for {pool.ResourceType} pool",
                            DetectedAt = DateTime.Now
                        });
                    }
                }

                // Check for stale operations
                var staleOperations = _activeOperations.Values
                    .Where(op => DateTime.Now - op.LastActivity > TimeSpan.FromMinutes(30))
                    .ToList();

                foreach (var staleOp in staleOperations)
                {
                    _logger?.LogWarning($"Detected stale operation {staleOp.OperationId}, releasing resources");
                    await ReleaseResourceAsync(staleOp.OperationId);
                }

                // Update performance metrics
                _metrics.UpdateCurrentMetrics(_resourcePools.Values, _activeOperations.Values);

                _logger?.LogDebug($"Resource monitoring completed: {_resourcePools.Count} pools, {_activeOperations.Count} active operations");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during resource monitoring");
            }
            finally
            {
                _coordinationLock.Release();
            }
        }

        /// <summary>
        /// Perform load balancing across resource pools
        /// </summary>
        private async void PerformLoadBalancing(object state)
        {
            try
            {
                await _coordinationLock.WaitAsync();

                var balancingActions = new List<LoadBalancingAction>();

                foreach (var pool in _resourcePools.Values)
                {
                    var utilization = (double)pool.Allocated / pool.Configuration.MaxSize;
                    var action = DetermineLoadBalancingAction(pool, utilization);
                    
                    if (action != null)
                    {
                        await ExecuteLoadBalancingActionAsync(action);
                        balancingActions.Add(action);
                    }
                }

                if (balancingActions.Any())
                {
                    OnLoadBalanced(new LoadBalancedEventArgs
                    {
                        Actions = balancingActions,
                        BalancedAt = DateTime.Now
                    });

                    _logger?.LogInformation($"Load balancing completed: {balancingActions.Count} actions executed");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during load balancing");
            }
            finally
            {
                _coordinationLock.Release();
            }
        }

        // Supporting methods for resource management
        private MandADiscoverySuite.Migration.ValidationResult ValidateResourceRequest(ResourceRequest request)
        {
            var result = new MandADiscoverySuite.Migration.ValidationResult { IsSuccess = true };

            if (string.IsNullOrEmpty(request.ResourceType))
            {
                result.Errors.Add("Resource type is required");
                result.Severity = ValidationSeverity.Error;
            }

            if (request.RequestedCount <= 0)
            {
                result.Errors.Add("Requested count must be greater than zero");
                result.Severity = ValidationSeverity.Error;
            }

            return result;
        }

        private ThrottleCheckResult CheckThrottleLimits(ResourceRequest request)
        {
            if (!_throttleConfigurations.TryGetValue(request.OperationType, out var throttleConfig))
            {
                return new ThrottleCheckResult { IsAllowed = true };
            }

            // Check concurrent operations limit
            var currentConcurrent = _activeOperations.Values
                .Count(op => op.Request.OperationType == request.OperationType);

            if (currentConcurrent >= throttleConfig.MaxConcurrent)
            {
                return new ThrottleCheckResult
                {
                    IsAllowed = false,
                    Reason = $"Maximum concurrent operations limit reached ({throttleConfig.MaxConcurrent})",
                    RetryAfter = TimeSpan.FromSeconds(30)
                };
            }

            // Check rate limit
            var recentOperations = _metrics.GetRecentOperationsCount(request.OperationType, TimeSpan.FromMinutes(1));
            if (recentOperations >= throttleConfig.RateLimit)
            {
                return new ThrottleCheckResult
                {
                    IsAllowed = false,
                    Reason = $"Rate limit exceeded ({throttleConfig.RateLimit} operations per minute)",
                    RetryAfter = TimeSpan.FromMinutes(1)
                };
            }

            return new ThrottleCheckResult { IsAllowed = true };
        }

        private async Task<ThrottledResourceAllocation> AllocateFromPoolAsync(ResourceRequest request, string allocationId)
        {
            if (!_resourcePools.TryGetValue(request.ResourceType, out var pool))
            {
                return null;
            }

            if (pool.Available < request.RequestedCount)
            {
                // Try to grow the pool if possible
                await TryGrowPoolAsync(pool, request.RequestedCount);
            }

            if (pool.Available >= request.RequestedCount)
            {
                pool.Available -= request.RequestedCount;
                pool.Allocated += request.RequestedCount;

                return new ThrottledResourceAllocation
                {
                    AllocationId = allocationId,
                    ResourceType = request.ResourceType,
                    AllocatedCount = request.RequestedCount,
                    AllocatedAt = DateTime.Now,
                    Properties = new Dictionary<string, object>
                    {
                        ["PoolUtilization"] = (double)pool.Allocated / pool.Configuration.MaxSize
                    }
                };
            }

            return null;
        }

        private async Task ReturnToPoolAsync(ThrottledResourceAllocation allocation)
        {
            if (_resourcePools.TryGetValue(allocation.ResourceType, out var pool))
            {
                pool.Available += allocation.AllocatedCount;
                pool.Allocated -= allocation.AllocatedCount;

                // Consider shrinking pool if utilization is low
                var utilization = (double)pool.Allocated / pool.Configuration.MaxSize;
                if (utilization < pool.Configuration.ShrinkThreshold)
                {
                    await TryShrinkPoolAsync(pool);
                }
            }
        }

        private async Task TryGrowPoolAsync(ResourcePool pool, int additionalNeeded)
        {
            var currentSize = pool.Available + pool.Allocated;
            var newSize = Math.Min(
                currentSize + pool.Configuration.GrowthIncrement,
                pool.Configuration.MaxSize);

            if (newSize > currentSize)
            {
                var growth = newSize - currentSize;
                pool.Available += growth;
                
                _logger?.LogInformation($"Grew {pool.ResourceType} pool by {growth} to size {newSize}");
            }
        }

        private async Task TryShrinkPoolAsync(ResourcePool pool)
        {
            var currentSize = pool.Available + pool.Allocated;
            var targetSize = Math.Max(
                currentSize - pool.Configuration.GrowthIncrement,
                pool.Configuration.MinSize);

            if (targetSize < currentSize && pool.Available > 0)
            {
                var shrinkage = Math.Min(currentSize - targetSize, pool.Available);
                pool.Available -= shrinkage;
                
                _logger?.LogInformation($"Shrunk {pool.ResourceType} pool by {shrinkage} to size {currentSize - shrinkage}");
            }
        }

        private PoolUtilization GetPoolUtilization(string resourceType)
        {
            if (!_resourcePools.TryGetValue(resourceType, out var pool))
            {
                return new PoolUtilization();
            }

            var totalSize = pool.Available + pool.Allocated;
            return new PoolUtilization
            {
                ResourceType = resourceType,
                TotalSize = totalSize,
                Available = pool.Available,
                Allocated = pool.Allocated,
                UtilizationPercentage = totalSize > 0 ? (double)pool.Allocated / totalSize : 0,
                LastUpdated = DateTime.Now
            };
        }

        private LoadBalancingAction DetermineLoadBalancingAction(ResourcePool pool, double utilization)
        {
            if (utilization > 0.8 && pool.Available + pool.Allocated < pool.Configuration.MaxSize)
            {
                return new LoadBalancingAction
                {
                    ActionType = LoadBalancingActionType.GrowPool,
                    ResourceType = pool.ResourceType,
                    Amount = pool.Configuration.GrowthIncrement
                };
            }
            else if (utilization < pool.Configuration.ShrinkThreshold && 
                     pool.Available + pool.Allocated > pool.Configuration.MinSize)
            {
                return new LoadBalancingAction
                {
                    ActionType = LoadBalancingActionType.ShrinkPool,
                    ResourceType = pool.ResourceType,
                    Amount = Math.Min(pool.Configuration.GrowthIncrement, pool.Available)
                };
            }

            return null;
        }

        private async Task ExecuteLoadBalancingActionAsync(LoadBalancingAction action)
        {
            if (!_resourcePools.TryGetValue(action.ResourceType, out var pool))
            {
                return;
            }

            switch (action.ActionType)
            {
                case LoadBalancingActionType.GrowPool:
                    await TryGrowPoolAsync(pool, action.Amount);
                    break;
                    
                case LoadBalancingActionType.ShrinkPool:
                    await TryShrinkPoolAsync(pool);
                    break;
            }
        }

        // Placeholder implementations for complex calculations
        private double GetCurrentLoad(string resourceType) => 0.5;
        private int CalculateOptimalAllocation(ResourceRequest request, double currentLoad, object historicalData) => request.RequestedCount;
        private double CalculateConfidence(object historicalData) => 0.8;
        private TimeSpan EstimateOperationDuration(ResourceRequest request, int optimalCount) => TimeSpan.FromMinutes(30);
        private List<string> GenerateOptimizationSuggestions(ResourceRequest request, double currentLoad) => new();

        protected virtual void OnResourceAllocated(ResourceAllocatedEventArgs e) => ResourceAllocated?.Invoke(this, e);
        protected virtual void OnResourceReleased(ResourceReleasedEventArgs e) => ResourceReleased?.Invoke(this, e);
        protected virtual void OnThrottleActivated(ThrottleActivatedEventArgs e) => ThrottleActivated?.Invoke(this, e);
        protected virtual void OnLoadBalanced(LoadBalancedEventArgs e) => LoadBalanced?.Invoke(this, e);
        protected virtual void OnPerformanceAlert(PerformanceAlertEventArgs e) => PerformanceAlert?.Invoke(this, e);

        public void Dispose()
        {
            if (_disposed) return;

            _monitoringTimer?.Dispose();
            _balancingTimer?.Dispose();
            _coordinationLock?.Dispose();

            _disposed = true;
            _logger?.LogInformation("Resource throttling service disposed");
        }
    }

    #region Supporting Classes and Enums

    public class ResourceRequest
    {
        public string ResourceType { get; set; }
        public string OperationType { get; set; }
        public int RequestedCount { get; set; }
        public int Priority { get; set; } = 0;
        public TimeSpan EstimatedDuration { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new();
    }

    public class ResourceAllocationResult
    {
        public string AllocationId { get; set; }
        public ResourceRequest Request { get; set; }
        public bool IsSuccess { get; set; }
        public bool IsThrottled { get; set; }
        public string ErrorMessage { get; set; }
        public ThrottledResourceAllocation AllocatedResources { get; set; }
        public TimeSpan? RetryAfter { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? AllocatedAt { get; set; }
    }

    public class ThrottledResourceAllocation
    {
        public string AllocationId { get; set; }
        public string ResourceType { get; set; }
        public int AllocatedCount { get; set; }
        public DateTime AllocatedAt { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new();
    }


    public class ResourcePool
    {
        public string ResourceType { get; set; }
        public ResourcePoolConfiguration Configuration { get; set; }
        public int Available { get; set; }
        public int Allocated { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class ResourcePoolConfiguration
    {
        public int MaxSize { get; set; }
        public int MinSize { get; set; }
        public int GrowthIncrement { get; set; }
        public double ShrinkThreshold { get; set; } = 0.3;
        public TimeSpan IdleTimeout { get; set; } = TimeSpan.FromMinutes(10);
    }

    public class ThrottleConfiguration
    {
        public int MaxConcurrent { get; set; }
        public int RateLimit { get; set; } // operations per minute
        public int BurstLimit { get; set; }
        public BackoffStrategy BackoffStrategy { get; set; } = BackoffStrategy.Exponential;
        public TimeSpan WindowSize { get; set; } = TimeSpan.FromMinutes(1);
    }

    public class ThrottleCheckResult
    {
        public bool IsAllowed { get; set; }
        public string Reason { get; set; }
        public TimeSpan? RetryAfter { get; set; }
    }

    public class ActiveOperation
    {
        public string OperationId { get; set; }
        public ResourceRequest Request { get; set; }
        public ThrottledResourceAllocation Allocation { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class ResourceUtilizationReport
    {
        public DateTime GeneratedAt { get; set; }
        public Dictionary<string, PoolUtilization> PoolUtilizations { get; set; } = new();
        public int ActiveOperations { get; set; }
        public int TotalOperationsToday { get; set; }
        public TimeSpan AverageOperationDuration { get; set; }
    }

    public class PoolUtilization
    {
        public string ResourceType { get; set; }
        public int TotalSize { get; set; }
        public int Available { get; set; }
        public int Allocated { get; set; }
        public double UtilizationPercentage { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class ResourceRecommendation
    {
        public string ResourceType { get; set; }
        public string OperationType { get; set; }
        public int RequestedCount { get; set; }
        public int RecommendedCount { get; set; }
        public double Confidence { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        public DateTime EstimatedCompletion { get; set; }
        public List<string> Suggestions { get; set; } = new();
    }

    public class LoadBalancingAction
    {
        public LoadBalancingActionType ActionType { get; set; }
        public string ResourceType { get; set; }
        public int Amount { get; set; }
        public string Reason { get; set; }
    }

    public class ThrottlingPerformanceMetrics
    {
        private readonly ConcurrentDictionary<string, List<OperationRecord>> _operationHistory = new();
        private readonly object _lockObject = new object();

        public void RecordOperationCompletion(string resourceType, TimeSpan duration)
        {
            lock (_lockObject)
            {
                if (!_operationHistory.ContainsKey(resourceType))
                {
                    _operationHistory[resourceType] = new List<OperationRecord>();
                }

                _operationHistory[resourceType].Add(new OperationRecord
                {
                    CompletedAt = DateTime.Now,
                    Duration = duration
                });

                // Keep only last 1000 records per resource type
                if (_operationHistory[resourceType].Count > 1000)
                {
                    _operationHistory[resourceType].RemoveRange(0, _operationHistory[resourceType].Count - 1000);
                }
            }
        }

        public int GetTotalOperationsToday()
        {
            var today = DateTime.Today;
            return _operationHistory.Values
                .SelectMany(records => records)
                .Count(r => r.CompletedAt.Date == today);
        }

        public TimeSpan GetAverageOperationDuration()
        {
            var allRecords = _operationHistory.Values.SelectMany(records => records).ToList();
            if (!allRecords.Any()) return TimeSpan.Zero;

            var totalTicks = allRecords.Sum(r => r.Duration.Ticks);
            return TimeSpan.FromTicks(totalTicks / allRecords.Count);
        }

        public object GetHistoricalData(string resourceType, string operationType)
        {
            // Placeholder for complex historical analysis
            return new { AverageCount = 5, AverageDuration = TimeSpan.FromMinutes(15) };
        }

        public int GetRecentOperationsCount(string operationType, TimeSpan timeWindow)
        {
            var cutoff = DateTime.Now - timeWindow;
            return _operationHistory.Values
                .SelectMany(records => records)
                .Count(r => r.CompletedAt >= cutoff);
        }

        public void UpdateCurrentMetrics(IEnumerable<ResourcePool> pools, IEnumerable<ActiveOperation> operations)
        {
            // Update real-time metrics
        }
    }

    public class OperationRecord
    {
        public DateTime CompletedAt { get; set; }
        public TimeSpan Duration { get; set; }
    }


    public enum BackoffStrategy
    {
        Linear,
        Exponential,
        Fixed
    }

    public enum LoadBalancingActionType
    {
        GrowPool,
        ShrinkPool,
        RebalanceLoad,
        OptimizeAllocation
    }

    public enum PerformanceAlertType
    {
        HighUtilization,
        LowUtilization,
        SlowOperations,
        HighErrorRate,
        ResourceExhaustion
    }

    #endregion

    #region Event Args

    public class ResourceAllocatedEventArgs : EventArgs
    {
        public string AllocationId { get; set; }
        public string ResourceType { get; set; }
        public int AllocatedCount { get; set; }
        public PoolUtilization PoolUtilization { get; set; }
        public DateTime AllocatedAt { get; set; }
    }

    public class ResourceReleasedEventArgs : EventArgs
    {
        public string AllocationId { get; set; }
        public string ResourceType { get; set; }
        public int ReleasedCount { get; set; }
        public TimeSpan OperationDuration { get; set; }
        public DateTime ReleasedAt { get; set; }
    }

    public class ThrottleActivatedEventArgs : EventArgs
    {
        public string ResourceType { get; set; }
        public string OperationType { get; set; }
        public string Reason { get; set; }
        public TimeSpan? RetryAfter { get; set; }
        public DateTime ActivatedAt { get; set; }
    }

    public class LoadBalancedEventArgs : EventArgs
    {
        public List<LoadBalancingAction> Actions { get; set; } = new();
        public DateTime BalancedAt { get; set; }
    }

    public class PerformanceAlertEventArgs : EventArgs
    {
        public PerformanceAlertType AlertType { get; set; }
        public string ResourceType { get; set; }
        public double CurrentUtilization { get; set; }
        public double Threshold { get; set; }
        public string Message { get; set; }
        public DateTime DetectedAt { get; set; }
    }

    #endregion
}