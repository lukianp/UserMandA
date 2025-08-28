# Data Caching System Documentation

## Overview

The UserMandA Discovery Suite implements a sophisticated multi-tier caching system designed to handle enterprise-scale datasets while maintaining UI responsiveness. This document provides comprehensive guidance on configuring, managing, and monitoring the caching mechanism.

## Architecture Overview

### Multi-Tier Cache Hierarchy

The caching system employs a four-tier hierarchy optimized for different access patterns and memory constraints:

#### **Hot Cache (Tier 1)**
- **Purpose**: Most frequently accessed data
- **Storage**: Uncompressed in-memory
- **Default Limits**: 100 items, 30-minute TTL
- **Target Data**: User core data, Group summaries, Dashboard metrics
- **Access Pattern**: >10 accesses per minute

#### **Warm Cache (Tier 2)**
- **Purpose**: Regularly accessed data
- **Storage**: Uncompressed in-memory
- **Default Limits**: 500 items, 60-minute TTL
- **Target Data**: Extended user attributes, Device inventory, Application lists
- **Access Pattern**: 3-10 accesses per minute

#### **Cold Cache (Tier 3)**
- **Purpose**: Occasionally accessed data
- **Storage**: Compressed in-memory
- **Default Limits**: 2,000 items, 120-minute TTL
- **Target Data**: Deep lineage graphs, Historical data, File share ACLs
- **Access Pattern**: <3 accesses per minute

#### **Archive (Tier 4)**
- **Purpose**: Metadata-only storage
- **Storage**: Key references only
- **Target Data**: Previous discovery snapshots, Compliance reports
- **TTL**: 24 hours

## Configuration

### Cache Size Configuration

Cache sizes adapt automatically to memory pressure:

```csharp
// Low Memory Pressure (Default)
Hot Cache: 100 items, 100MB max
Warm Cache: 500 items, 500MB max
Cold Cache: 2,000 items, 2GB max

// High Memory Pressure
Hot Cache: 50 items, 50MB max
Warm Cache: 150 items, 150MB max
Cold Cache: 500 items, 500MB max

// Critical Memory Pressure
Hot Cache: 25 items, 25MB max
Warm Cache: 75 items, 75MB max
Cold Cache: 200 items, 200MB max
```

### Data Type Configuration

Each data type has configurable cache tier preferences:

| Data Type | Default Tier | Preload | Streaming | Reason |
|-----------|--------------|---------|-----------|---------|
| Users | Hot | Yes | No | Frequently accessed in all views |
| Groups | Hot | Yes | No | Essential for security context |
| Devices | Warm | No | Yes | Medium frequency, large datasets |
| Applications | Warm | No | Yes | Variable access patterns |
| Infrastructure | Cold | No | Yes | Large objects, infrequent access |
| FileServers | Cold | No | Yes | Large ACL data, compressed storage |
| Databases | Cold | No | Yes | Detailed schema info, less frequent |

### TTL (Time-to-Live) Settings

Default TTL values are optimized for different data change frequencies:

- **Users/Groups**: 30 minutes (identity changes require quick propagation)
- **Devices/Applications**: 45 minutes (moderate change frequency)
- **Infrastructure/Databases**: 60 minutes (slower change cycles)
- **Historical/Compliance**: 120 minutes (archival data)

## Configuration Options

### Manual Cache Size Configuration

Administrators can override default cache sizes through the application settings:

```json
{
  "CacheConfiguration": {
    "Enabled": true,
    "MaxMemoryMB": 2048,
    "Tiers": {
      "Hot": {
        "MaxItems": 150,
        "MaxSizeMB": 150,
        "TTLMinutes": 45
      },
      "Warm": {
        "MaxItems": 750,
        "MaxSizeMB": 750,
        "TTLMinutes": 90
      },
      "Cold": {
        "MaxItems": 3000,
        "MaxSizeMB": 3000,
        "TTLMinutes": 180
      }
    }
  }
}
```

### Environment Variables

Override cache settings using environment variables:

- `MANDA_CACHE_ENABLED`: Enable/disable caching (true/false)
- `MANDA_CACHE_MAX_MEMORY_MB`: Maximum total cache memory
- `MANDA_CACHE_HOT_SIZE`: Hot cache maximum items
- `MANDA_CACHE_WARM_SIZE`: Warm cache maximum items
- `MANDA_CACHE_COLD_SIZE`: Cold cache maximum items

Example:
```batch
set MANDA_CACHE_MAX_MEMORY_MB=4096
set MANDA_CACHE_HOT_SIZE=200
```

### File Watcher Configuration

Configure which file patterns trigger cache invalidation:

```json
{
  "FileWatcherPatterns": {
    "Users": ["*users*.csv", "security_*.csv", "*identity*.csv"],
    "Groups": ["*groups*.csv", "*members*.csv", "*security_groups*.csv"],
    "Devices": ["*computer*.csv", "*device*.csv", "*workstation*.csv"],
    "Applications": ["*app*.csv", "*software*.csv", "*application*.csv"],
    "Infrastructure": ["*infrastructure*.csv", "*server*.csv", "*network*.csv"]
  }
}
```

## Manual Cache Management

### Cache Statistics Access

Monitor cache performance through the Statistics API:

```csharp
var stats = multiTierCacheService.GetStatistics();
Console.WriteLine($"Hit Rate: {stats.HitRate:P2}");
Console.WriteLine($"Memory Usage: {stats.EstimatedMemoryUsageMB}MB");
Console.WriteLine($"Hot Cache: {stats.HotCacheSize} items");
Console.WriteLine($"Warm Cache: {stats.WarmCacheSize} items");
Console.WriteLine($"Cold Cache: {stats.ColdCacheSize} items");
```

### Manual Cache Invalidation

#### Invalidate All Caches
```csharp
await logicEngineService.InvalidateCacheAsync("*");
```

#### Invalidate Specific Data Type
```csharp
await logicEngineService.InvalidateCacheAsync("Users");
await logicEngineService.InvalidateCacheAsync("Groups");
await logicEngineService.InvalidateCacheAsync("Devices");
```

#### Invalidate Specific Keys
```csharp
// Invalidate specific user
await logicEngineService.InvalidateCacheAsync("UserDetail:S-1-5-21-...");

// Invalidate user list projections
await logicEngineService.InvalidateCacheAsync("UserList:*");
```

### Force Cache Refresh

Trigger immediate cache refresh without waiting for file changes:

```csharp
// Incremental refresh (preferred)
await logicEngineService.RefreshDataTypeAsync("Users", RefreshStrategy.Incremental);

// Full refresh (when incremental fails)
await logicEngineService.RefreshDataTypeAsync("Users", RefreshStrategy.Full);
```

### Memory Pressure Management

Monitor and respond to memory pressure:

```csharp
var memoryMonitor = serviceLocator.GetService<MemoryPressureMonitor>();
var currentPressure = await memoryMonitor.GetCurrentPressureAsync();

if (currentPressure >= MemoryPressureLevel.High)
{
    // Trigger cache cleanup
    await multiTierCacheService.PerformEmergencyCleanupAsync();
    
    // Force garbage collection
    GC.Collect(2, GCCollectionMode.Forced, true);
}
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

Monitor these metrics to ensure optimal cache performance:

#### Cache Effectiveness
- **Hit Rate**: Target >90% for hot cache, >80% for warm cache, >60% for cold cache
- **Miss Rate**: Should decrease over time as cache warms up
- **Eviction Rate**: High eviction rates indicate undersized caches

#### Performance Metrics
- **Average Retrieval Time**: <10ms for hot, <50ms for warm, <200ms for cold
- **Cache Load Time**: Initial load should complete within 30 seconds
- **Memory Usage**: Should stabilize below configured limits

#### Data Freshness
- **Average Age**: Items should be refreshed before TTL expiration
- **Stale Data Incidents**: Cache serving outdated information
- **Refresh Success Rate**: >95% of refresh operations should succeed

### Monitoring Dashboard

Access cache monitoring through the Management Dashboard:

1. **Navigate to**: Management Hub → System Status → Cache Performance
2. **Key Views**:
   - Real-time cache hit rates by tier
   - Memory usage trends over time
   - Cache invalidation frequency by data type
   - Performance metrics (load times, retrieval speeds)

### Logging and Diagnostics

#### Cache Event Logging

The system logs all cache operations at appropriate levels:

```log
[INFO] MultiTierCacheService: Hot cache hit for key: UserDetail:S-1-5-21-...
[DEBUG] CacheAwareFileWatcherService: Processing file change: users_20250828.csv
[WARN] MultiTierCacheService: High memory pressure detected, adapting cache sizes
[ERROR] AsyncDataLoadingService: Failed to load data type: Users - Circuit breaker opened
```

#### Performance Logging

Track performance metrics in structured logs:

```json
{
  "timestamp": "2025-08-28T10:30:00Z",
  "logger": "MultiTierCacheService",
  "level": "INFO",
  "message": "Cache statistics",
  "properties": {
    "hitRate": 0.947,
    "memoryUsageMB": 1834,
    "hotCacheSize": 98,
    "warmCacheSize": 445,
    "coldCacheSize": 1567,
    "averageRetrievalTimeMs": 12.4
  }
}
```

### Troubleshooting Cache Issues

#### Common Issues and Solutions

**1. Low Cache Hit Rate (<70%)**
- **Symptoms**: Slow UI response, frequent disk I/O
- **Diagnosis**: Check cache sizes vs. dataset sizes
- **Resolution**: Increase cache limits or optimize data access patterns

**2. High Memory Usage**
- **Symptoms**: System slowdowns, out-of-memory errors
- **Diagnosis**: Monitor memory usage trends
- **Resolution**: Enable compression, reduce cache sizes, or increase system memory

**3. Stale Data Issues**
- **Symptoms**: UI showing outdated information
- **Diagnosis**: Check file watcher events and TTL settings
- **Resolution**: Reduce TTL values or trigger manual refresh

**4. Cache Thrashing**
- **Symptoms**: Frequent evictions, unstable hit rates
- **Diagnosis**: Monitor eviction patterns and access frequencies
- **Resolution**: Rebalance tier sizes or adjust promotion thresholds

#### Diagnostic Commands

**Check Cache Health**
```csharp
var health = await cacheService.PerformHealthCheckAsync();
Console.WriteLine($"Overall Health: {health.Status}");
foreach (var issue in health.Issues)
{
    Console.WriteLine($"- {issue.Severity}: {issue.Description}");
}
```

**Analyze Access Patterns**
```csharp
var patterns = await cacheService.GetAccessPatternsAsync();
foreach (var pattern in patterns.OrderByDescending(p => p.AccessFrequency))
{
    Console.WriteLine($"{pattern.Key}: {pattern.AccessFrequency:F2} accesses/hour");
}
```

**Test Cache Performance**
```csharp
var benchmark = await cacheService.RunPerformanceBenchmarkAsync();
Console.WriteLine($"Hot Cache Avg: {benchmark.HotCacheAverageMs:F2}ms");
Console.WriteLine($"Warm Cache Avg: {benchmark.WarmCacheAverageMs:F2}ms");
Console.WriteLine($"Cold Cache Avg: {benchmark.ColdCacheAverageMs:F2}ms");
```

## Cache Invalidation Strategies

### Automatic Invalidation

The system automatically invalidates caches when:

1. **File System Changes**: CSV files are modified, created, or deleted
2. **Discovery Run Completion**: New discovery cycle generates fresh data
3. **TTL Expiration**: Items exceed their configured time-to-live
4. **Memory Pressure**: Automatic cleanup during high memory usage

### Manual Invalidation Triggers

Administrators should manually invalidate caches when:

1. **Data Migration**: After importing external datasets
2. **System Maintenance**: Before/after major system updates
3. **Troubleshooting**: When investigating data inconsistencies
4. **Testing**: To validate cache behavior under different conditions

### Invalidation Scope

Choose appropriate invalidation scope:

- **Full System**: `InvalidateCacheAsync("*")` - Use sparingly, impacts all users
- **Data Type**: `InvalidateCacheAsync("Users")` - Affects all user-related caches  
- **Specific Items**: `InvalidateCacheAsync("UserDetail:...")` - Surgical precision
- **Pattern-Based**: `InvalidateCacheAsync("UserList:*")` - All list projections

## Best Practices

### Configuration Best Practices

1. **Start Conservative**: Begin with default settings, adjust based on monitoring
2. **Monitor Memory**: Keep total cache usage below 50% of available system memory
3. **Balance Tiers**: Ensure hot cache can hold most frequently accessed data
4. **Adjust TTL**: Shorter TTL for frequently changing data, longer for stable data

### Operational Best Practices

1. **Regular Monitoring**: Review cache statistics weekly
2. **Proactive Management**: Address performance issues before they impact users
3. **Capacity Planning**: Monitor growth trends and plan cache size increases
4. **Documentation**: Keep configuration changes documented with business justification

### Development Best Practices

1. **Cache-Friendly Design**: Design data access patterns to benefit from caching
2. **Avoid Cache Pollution**: Don't cache ephemeral or single-use data
3. **Graceful Degradation**: Ensure system works when cache is unavailable
4. **Test Cache Scenarios**: Include cache testing in development workflows

## Integration Points

### LogicEngineService Integration

The cache system integrates seamlessly with the LogicEngineService:

```csharp
// Cached projection retrieval
var user = await logicEngineService.GetUserDetailProjectionAsync(userSid);

// Batch operations with cache warming
var users = await logicEngineService.LoadDataTypeAsync<UserDto>("Users");
```

### ViewModel Integration

ViewModels automatically benefit from caching:

```csharp
public async Task LoadUsersAsync()
{
    IsLoading = true;
    try
    {
        var users = await logicEngineService.GetAllUsersAsync();
        Users = new ObservableCollection<UserProjection>(users);
    }
    finally
    {
        IsLoading = false;
    }
}
```

### File Watcher Integration

Automatic cache invalidation through file system monitoring:

```csharp
fileWatcher.DataChanged += async (sender, e) =>
{
    await logicEngineService.InvalidateCacheAsync(e.DataType);
    await RefreshDataAsync(e.DataType);
};
```

## Security Considerations

### Cache Data Protection

- **No Sensitive Data**: Passwords, tokens, and keys are never cached
- **Access Control**: Cache access respects existing security boundaries
- **Audit Trail**: Cache operations are logged for security monitoring

### Memory Security

- **Secure Disposal**: Cached objects are securely disposed when evicted
- **Memory Encryption**: Consider OS-level memory encryption for sensitive environments
- **Process Isolation**: Cache memory is isolated within the application process

## Conclusion

The UserMandA Discovery Suite caching system provides enterprise-grade performance and scalability while maintaining simplicity for administrators. By following the guidelines in this document, administrators can achieve optimal cache performance and ensure reliable system operation.

For additional support or advanced configuration scenarios, consult the technical team or refer to the architectural documentation in the `/GUI/Documentation/Architecture/` directory.

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-28  
**Author**: Documentation & QA Guardian  
**Related Tasks**: T-030 - Implement Asynchronous Data Loading and Caching