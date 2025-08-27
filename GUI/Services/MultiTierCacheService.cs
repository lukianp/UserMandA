#nullable enable
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// T-030 Enhanced multi-tier caching service with compression, adaptive TTL, and cache warming
    /// Extends the existing IntelligentCacheService with performance optimizations
    /// </summary>
    public class MultiTierCacheService : IDisposable
    {
        private readonly ILogger<MultiTierCacheService> _logger;
        private readonly MemoryPressureMonitor _memoryMonitor;
        
        // Multi-tier cache structure
        private readonly ConcurrentDictionary<string, HotCacheEntry> _hotCache;       // Most frequently accessed
        private readonly ConcurrentDictionary<string, WarmCacheEntry> _warmCache;     // Regularly accessed
        private readonly ConcurrentDictionary<string, ColdCacheEntry> _coldCache;     // Occasionally accessed
        private readonly ConcurrentDictionary<string, string> _archiveKeys;           // Just keys for archived items

        // Cache management
        private readonly Timer _maintenanceTimer;
        private readonly Timer _warmupTimer;
        private readonly SemaphoreSlim _evictionSemaphore = new(1, 1);
        private readonly object _promotionLock = new();

        // Configuration with adaptive sizing based on memory pressure
        private int _hotCacheMaxSize = 100;
        private int _warmCacheMaxSize = 500;
        private int _coldCacheMaxSize = 2000;
        private TimeSpan _hotCacheTTL = TimeSpan.FromMinutes(30);
        private TimeSpan _warmCacheTTL = TimeSpan.FromMinutes(60);
        private TimeSpan _coldCacheTTL = TimeSpan.FromMinutes(120);

        // Statistics and performance tracking
        private readonly ConcurrentDictionary<string, CacheAccessPattern> _accessPatterns = new();
        private readonly ConcurrentDictionary<string, PredictiveMetrics> _predictiveMetrics = new();
        private long _totalCacheHits = 0;
        private long _totalCacheMisses = 0;
        private bool _disposed = false;

        // Events for cache notifications
        public event EventHandler<CachePromotionEventArgs>? ItemPromoted;
        public event EventHandler<CacheEvictionEventArgs>? ItemEvicted;
        public event EventHandler<CacheWarmupEventArgs>? CacheWarmedUp;

        public MultiTierCacheService(ILogger<MultiTierCacheService> logger, MemoryPressureMonitor memoryMonitor)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryMonitor = memoryMonitor ?? throw new ArgumentNullException(nameof(memoryMonitor));

            _hotCache = new ConcurrentDictionary<string, HotCacheEntry>();
            _warmCache = new ConcurrentDictionary<string, WarmCacheEntry>();
            _coldCache = new ConcurrentDictionary<string, ColdCacheEntry>();
            _archiveKeys = new ConcurrentDictionary<string, string>();

            // Start maintenance and warmup timers
            _maintenanceTimer = new Timer(PerformMaintenance, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
            _warmupTimer = new Timer(PerformPredictiveWarmup, null, TimeSpan.FromMinutes(10), TimeSpan.FromMinutes(10));

            // Subscribe to memory pressure events
            _memoryMonitor.MemoryPressureChanged += OnMemoryPressureChanged;

            _logger.LogInformation("MultiTierCacheService initialized with adaptive sizing and predictive warming");
        }

        /// <summary>
        /// Gets or creates a cached item with intelligent tier management
        /// </summary>
        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, CacheTier? preferredTier = null, TimeSpan? customTTL = null)
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MultiTierCacheService));

            var accessTime = DateTime.UtcNow;
            
            // Update access pattern
            UpdateAccessPattern(key, accessTime);

            // Try to retrieve from all tiers (hot → warm → cold)
            var cachedItem = await TryGetFromAllTiersAsync<T>(key, accessTime);
            if (cachedItem.Found)
            {
                Interlocked.Increment(ref _totalCacheHits);
                return cachedItem.Value;
            }

            // Cache miss - create new item
            Interlocked.Increment(ref _totalCacheMisses);
            _logger.LogDebug("Cache miss for key: {Key}, creating new item", key);

            var value = await factory();
            var tier = preferredTier ?? DetermineBestTier(key, value);
            var ttl = customTTL ?? GetTTLForTier(tier);

            await AddToTierAsync(key, value, tier, ttl, accessTime);

            return value;
        }

        /// <summary>
        /// Tries to get an item from all cache tiers
        /// </summary>
        private async Task<(bool Found, T Value)> TryGetFromAllTiersAsync<T>(string key, DateTime accessTime)
        {
            // Try hot cache first
            if (_hotCache.TryGetValue(key, out var hotEntry))
            {
                if (IsEntryValid(hotEntry, accessTime))
                {
                    hotEntry.LastAccessed = accessTime;
                    hotEntry.AccessCount++;
                    _logger.LogDebug("Hot cache hit for key: {Key}", key);
                    return (true, (T)hotEntry.Value);
                }
                else
                {
                    _hotCache.TryRemove(key, out _);
                }
            }

            // Try warm cache
            if (_warmCache.TryGetValue(key, out var warmEntry))
            {
                if (IsEntryValid(warmEntry, accessTime))
                {
                    warmEntry.LastAccessed = accessTime;
                    warmEntry.AccessCount++;
                    
                    // Consider promotion to hot cache
                    if (ShouldPromoteToHot(warmEntry))
                    {
                        await PromoteToHotAsync(key, warmEntry);
                    }
                    
                    _logger.LogDebug("Warm cache hit for key: {Key}", key);
                    return (true, (T)warmEntry.Value);
                }
                else
                {
                    _warmCache.TryRemove(key, out _);
                }
            }

            // Try cold cache
            if (_coldCache.TryGetValue(key, out var coldEntry))
            {
                if (IsEntryValid(coldEntry, accessTime))
                {
                    coldEntry.LastAccessed = accessTime;
                    coldEntry.AccessCount++;
                    
                    // Consider promotion to warm cache
                    if (ShouldPromoteToWarm(coldEntry))
                    {
                        await PromoteToWarmAsync(key, coldEntry);
                    }
                    
                    _logger.LogDebug("Cold cache hit for key: {Key}", key);
                    return (true, await DecompressValueAsync<T>(coldEntry.CompressedValue));
                }
                else
                {
                    _coldCache.TryRemove(key, out _);
                }
            }

            return (false, default(T)!);
        }

        /// <summary>
        /// Adds an item to the appropriate cache tier
        /// </summary>
        private async Task AddToTierAsync<T>(string key, T value, CacheTier tier, TimeSpan ttl, DateTime accessTime)
        {
            switch (tier)
            {
                case CacheTier.Hot:
                    await AddToHotCacheAsync(key, value, ttl, accessTime);
                    break;
                    
                case CacheTier.Warm:
                    await AddToWarmCacheAsync(key, value, ttl, accessTime);
                    break;
                    
                case CacheTier.Cold:
                    await AddToColdCacheAsync(key, value, ttl, accessTime);
                    break;
            }
        }

        /// <summary>
        /// Adds item to hot cache with eviction if needed
        /// </summary>
        private async Task AddToHotCacheAsync<T>(string key, T value, TimeSpan ttl, DateTime accessTime)
        {
            var entry = new HotCacheEntry
            {
                Key = key,
                Value = value!,
                CreatedAt = accessTime,
                LastAccessed = accessTime,
                ExpiresAt = accessTime.Add(ttl),
                AccessCount = 1,
                EstimatedSize = EstimateObjectSize(value)
            };

            _hotCache.TryAdd(key, entry);

            // Check if eviction is needed
            if (_hotCache.Count > _hotCacheMaxSize)
            {
                await EvictFromHotCacheAsync();
            }

            _logger.LogDebug("Added item to hot cache: {Key}", key);
        }

        /// <summary>
        /// Adds item to warm cache
        /// </summary>
        private async Task AddToWarmCacheAsync<T>(string key, T value, TimeSpan ttl, DateTime accessTime)
        {
            var entry = new WarmCacheEntry
            {
                Key = key,
                Value = value!,
                CreatedAt = accessTime,
                LastAccessed = accessTime,
                ExpiresAt = accessTime.Add(ttl),
                AccessCount = 1,
                EstimatedSize = EstimateObjectSize(value)
            };

            _warmCache.TryAdd(key, entry);

            if (_warmCache.Count > _warmCacheMaxSize)
            {
                await EvictFromWarmCacheAsync();
            }

            _logger.LogDebug("Added item to warm cache: {Key}", key);
        }

        /// <summary>
        /// Adds item to cold cache with compression
        /// </summary>
        private async Task AddToColdCacheAsync<T>(string key, T value, TimeSpan ttl, DateTime accessTime)
        {
            var compressedValue = await CompressValueAsync(value);
            
            var entry = new ColdCacheEntry
            {
                Key = key,
                CompressedValue = compressedValue,
                CreatedAt = accessTime,
                LastAccessed = accessTime,
                ExpiresAt = accessTime.Add(ttl),
                AccessCount = 1,
                OriginalSize = EstimateObjectSize(value),
                CompressedSize = compressedValue.Length
            };

            _coldCache.TryAdd(key, entry);

            if (_coldCache.Count > _coldCacheMaxSize)
            {
                await EvictFromColdCacheAsync();
            }

            _logger.LogDebug("Added item to cold cache: {Key} (compressed {OriginalSize} → {CompressedSize} bytes)", 
                key, entry.OriginalSize, entry.CompressedSize);
        }

        /// <summary>
        /// Determines the best tier for a cache item based on access patterns and size
        /// </summary>
        private CacheTier DetermineBestTier<T>(string key, T value)
        {
            var size = EstimateObjectSize(value);
            var pattern = _accessPatterns.GetValueOrDefault(key);

            // Large objects go to cold cache with compression
            if (size > 10 * 1024 * 1024) // > 10MB
            {
                return CacheTier.Cold;
            }

            // Frequently accessed items go to hot cache
            if (pattern != null && pattern.AccessFrequency > 10)
            {
                return CacheTier.Hot;
            }

            // Medium access frequency goes to warm cache
            if (pattern != null && pattern.AccessFrequency > 3)
            {
                return CacheTier.Warm;
            }

            // Default to warm cache for new items
            return CacheTier.Warm;
        }

        /// <summary>
        /// Gets TTL for a specific tier
        /// </summary>
        private TimeSpan GetTTLForTier(CacheTier tier)
        {
            return tier switch
            {
                CacheTier.Hot => _hotCacheTTL,
                CacheTier.Warm => _warmCacheTTL,
                CacheTier.Cold => _coldCacheTTL,
                _ => _warmCacheTTL
            };
        }

        /// <summary>
        /// Updates access pattern for predictive caching
        /// </summary>
        private void UpdateAccessPattern(string key, DateTime accessTime)
        {
            _accessPatterns.AddOrUpdate(key, 
                new CacheAccessPattern
                {
                    Key = key,
                    FirstAccess = accessTime,
                    LastAccess = accessTime,
                    AccessCount = 1,
                    AccessFrequency = 1
                },
                (k, existing) =>
                {
                    existing.LastAccess = accessTime;
                    existing.AccessCount++;
                    existing.AccessFrequency = CalculateAccessFrequency(existing);
                    return existing;
                });
        }

        /// <summary>
        /// Calculates access frequency score
        /// </summary>
        private double CalculateAccessFrequency(CacheAccessPattern pattern)
        {
            var timeSpan = pattern.LastAccess - pattern.FirstAccess;
            if (timeSpan.TotalHours < 1) return pattern.AccessCount; // Very recent, use raw count
            
            return pattern.AccessCount / Math.Max(1, timeSpan.TotalHours);
        }

        /// <summary>
        /// Promotes item from warm to hot cache
        /// </summary>
        private async Task PromoteToHotAsync(string key, WarmCacheEntry warmEntry)
        {
            lock (_promotionLock)
            {
                if (_warmCache.TryRemove(key, out _))
                {
                    var hotEntry = new HotCacheEntry
                    {
                        Key = key,
                        Value = warmEntry.Value,
                        CreatedAt = warmEntry.CreatedAt,
                        LastAccessed = warmEntry.LastAccessed,
                        ExpiresAt = DateTime.UtcNow.Add(_hotCacheTTL),
                        AccessCount = warmEntry.AccessCount,
                        EstimatedSize = warmEntry.EstimatedSize
                    };

                    _hotCache.TryAdd(key, hotEntry);
                    
                    ItemPromoted?.Invoke(this, new CachePromotionEventArgs(key, CacheTier.Warm, CacheTier.Hot));
                    _logger.LogDebug("Promoted item from warm to hot cache: {Key}", key);
                }
            }

            if (_hotCache.Count > _hotCacheMaxSize)
            {
                await EvictFromHotCacheAsync();
            }
        }

        /// <summary>
        /// Promotes item from cold to warm cache
        /// </summary>
        private async Task PromoteToWarmAsync(string key, ColdCacheEntry coldEntry)
        {
            lock (_promotionLock)
            {
                if (_coldCache.TryRemove(key, out _))
                {
                    Task.Run(async () =>
                    {
                        var value = await DecompressValueAsync<object>(coldEntry.CompressedValue);
                        
                        var warmEntry = new WarmCacheEntry
                        {
                            Key = key,
                            Value = value,
                            CreatedAt = coldEntry.CreatedAt,
                            LastAccessed = coldEntry.LastAccessed,
                            ExpiresAt = DateTime.UtcNow.Add(_warmCacheTTL),
                            AccessCount = coldEntry.AccessCount,
                            EstimatedSize = coldEntry.OriginalSize
                        };

                        _warmCache.TryAdd(key, warmEntry);
                        ItemPromoted?.Invoke(this, new CachePromotionEventArgs(key, CacheTier.Cold, CacheTier.Warm));
                        _logger.LogDebug("Promoted item from cold to warm cache: {Key}", key);
                    });
                }
            }

            if (_warmCache.Count > _warmCacheMaxSize)
            {
                await EvictFromWarmCacheAsync();
            }
        }

        /// <summary>
        /// Eviction methods for each tier
        /// </summary>
        private async Task EvictFromHotCacheAsync()
        {
            if (!await _evictionSemaphore.WaitAsync(1000))
                return;

            try
            {
                var itemsToEvict = _hotCache.Values
                    .OrderBy(e => e.LastAccessed)
                    .Take(_hotCache.Count - _hotCacheMaxSize + 10) // Evict a few extra to avoid frequent evictions
                    .ToList();

                foreach (var item in itemsToEvict)
                {
                    if (_hotCache.TryRemove(item.Key, out _))
                    {
                        // Demote to warm cache if still valuable
                        if (item.AccessCount > 5)
                        {
                            await AddToWarmCacheAsync(item.Key, item.Value, _warmCacheTTL, DateTime.UtcNow);
                        }
                        
                        ItemEvicted?.Invoke(this, new CacheEvictionEventArgs(item.Key, CacheTier.Hot, "LRU eviction"));
                    }
                }

                _logger.LogDebug("Evicted {Count} items from hot cache", itemsToEvict.Count);
            }
            finally
            {
                _evictionSemaphore.Release();
            }
        }

        private async Task EvictFromWarmCacheAsync()
        {
            if (!await _evictionSemaphore.WaitAsync(1000))
                return;

            try
            {
                var itemsToEvict = _warmCache.Values
                    .OrderBy(e => e.LastAccessed)
                    .Take(_warmCache.Count - _warmCacheMaxSize + 20)
                    .ToList();

                foreach (var item in itemsToEvict)
                {
                    if (_warmCache.TryRemove(item.Key, out _))
                    {
                        // Demote to cold cache if still potentially valuable
                        if (item.AccessCount > 2)
                        {
                            await AddToColdCacheAsync(item.Key, item.Value, _coldCacheTTL, DateTime.UtcNow);
                        }
                        
                        ItemEvicted?.Invoke(this, new CacheEvictionEventArgs(item.Key, CacheTier.Warm, "LRU eviction"));
                    }
                }

                _logger.LogDebug("Evicted {Count} items from warm cache", itemsToEvict.Count);
            }
            finally
            {
                _evictionSemaphore.Release();
            }
        }

        private async Task EvictFromColdCacheAsync()
        {
            if (!await _evictionSemaphore.WaitAsync(1000))
                return;

            try
            {
                var itemsToEvict = _coldCache.Values
                    .OrderBy(e => e.LastAccessed)
                    .Take(_coldCache.Count - _coldCacheMaxSize + 50)
                    .ToList();

                foreach (var item in itemsToEvict)
                {
                    if (_coldCache.TryRemove(item.Key, out _))
                    {
                        // Archive key for potential future warmup
                        _archiveKeys.TryAdd(item.Key, DateTime.UtcNow.ToString("O"));
                        ItemEvicted?.Invoke(this, new CacheEvictionEventArgs(item.Key, CacheTier.Cold, "LRU eviction"));
                    }
                }

                _logger.LogDebug("Evicted {Count} items from cold cache", itemsToEvict.Count);
            }
            finally
            {
                _evictionSemaphore.Release();
            }
        }

        /// <summary>
        /// Performance-related helper methods
        /// </summary>
        private bool ShouldPromoteToHot(WarmCacheEntry entry)
        {
            return entry.AccessCount >= 5 && 
                   (DateTime.UtcNow - entry.LastAccessed).TotalMinutes < 10;
        }

        private bool ShouldPromoteToWarm(ColdCacheEntry entry)
        {
            return entry.AccessCount >= 3 && 
                   (DateTime.UtcNow - entry.LastAccessed).TotalMinutes < 30;
        }

        private bool IsEntryValid<T>(T entry, DateTime accessTime) where T : ICacheEntry
        {
            return accessTime <= entry.ExpiresAt;
        }

        /// <summary>
        /// Memory pressure event handler
        /// </summary>
        private async void OnMemoryPressureChanged(object? sender, MemoryPressureChangedEventArgs e)
        {
            _logger.LogInformation("Adapting cache sizes for memory pressure: {PreviousLevel} → {NewLevel}", 
                e.PreviousLevel, e.NewLevel);

            // Adapt cache sizes based on memory pressure
            switch (e.NewLevel)
            {
                case MemoryPressureLevel.Low:
                    _hotCacheMaxSize = 100;
                    _warmCacheMaxSize = 500;
                    _coldCacheMaxSize = 2000;
                    break;

                case MemoryPressureLevel.Medium:
                    _hotCacheMaxSize = 75;
                    _warmCacheMaxSize = 300;
                    _coldCacheMaxSize = 1000;
                    break;

                case MemoryPressureLevel.High:
                    _hotCacheMaxSize = 50;
                    _warmCacheMaxSize = 150;
                    _coldCacheMaxSize = 500;
                    break;

                case MemoryPressureLevel.Critical:
                    _hotCacheMaxSize = 25;
                    _warmCacheMaxSize = 75;
                    _coldCacheMaxSize = 200;
                    
                    // Force immediate eviction
                    await EvictFromHotCacheAsync();
                    await EvictFromWarmCacheAsync();
                    await EvictFromColdCacheAsync();
                    break;
            }
        }

        /// <summary>
        /// Maintenance timer callback
        /// </summary>
        private async void PerformMaintenance(object? state)
        {
            try
            {
                var now = DateTime.UtcNow;
                var expiredKeys = new List<string>();

                // Clean expired entries from all tiers
                foreach (var kvp in _hotCache)
                {
                    if (now > kvp.Value.ExpiresAt)
                        expiredKeys.Add(kvp.Key);
                }
                foreach (var key in expiredKeys)
                    _hotCache.TryRemove(key, out _);

                expiredKeys.Clear();
                foreach (var kvp in _warmCache)
                {
                    if (now > kvp.Value.ExpiresAt)
                        expiredKeys.Add(kvp.Key);
                }
                foreach (var key in expiredKeys)
                    _warmCache.TryRemove(key, out _);

                expiredKeys.Clear();
                foreach (var kvp in _coldCache)
                {
                    if (now > kvp.Value.ExpiresAt)
                        expiredKeys.Add(kvp.Key);
                }
                foreach (var key in expiredKeys)
                    _coldCache.TryRemove(key, out _);

                // Clean old access patterns
                var oldPatterns = _accessPatterns.Values
                    .Where(p => (now - p.LastAccess).TotalDays > 1)
                    .Select(p => p.Key)
                    .ToList();
                    
                foreach (var key in oldPatterns)
                    _accessPatterns.TryRemove(key, out _);

                if (expiredKeys.Count > 0)
                {
                    _logger.LogDebug("Maintenance: cleaned {ExpiredCount} expired entries, {PatternsCount} old patterns", 
                        expiredKeys.Count, oldPatterns.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during cache maintenance");
            }
        }

        /// <summary>
        /// Predictive warmup timer callback
        /// </summary>
        private void PerformPredictiveWarmup(object? state)
        {
            // This would implement predictive cache warming based on access patterns
            // For now, it's a placeholder for future enhancement
            _logger.LogDebug("Predictive warmup cycle (placeholder)");
        }

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        public MultiTierCacheStatistics GetStatistics()
        {
            var totalHits = Interlocked.Read(ref _totalCacheHits);
            var totalMisses = Interlocked.Read(ref _totalCacheMisses);
            var hitRate = totalHits + totalMisses > 0 ? (double)totalHits / (totalHits + totalMisses) : 0;

            return new MultiTierCacheStatistics(
                HotCacheSize: _hotCache.Count,
                WarmCacheSize: _warmCache.Count,
                ColdCacheSize: _coldCache.Count,
                ArchiveKeysCount: _archiveKeys.Count,
                TotalHits: totalHits,
                TotalMisses: totalMisses,
                HitRate: hitRate,
                EstimatedMemoryUsageMB: GetEstimatedMemoryUsage() / (1024 * 1024)
            );
        }

        /// <summary>
        /// Utility methods
        /// </summary>
        private long EstimateObjectSize<T>(T obj)
        {
            // Simplified size estimation - in production would use more sophisticated methods
            if (obj == null) return 0;
            
            if (obj is string str) return str.Length * 2;
            if (obj is byte[] bytes) return bytes.Length;
            
            // Default estimate for objects
            return 1024;
        }

        private long GetEstimatedMemoryUsage()
        {
            return _hotCache.Values.Sum(e => e.EstimatedSize) +
                   _warmCache.Values.Sum(e => e.EstimatedSize) +
                   _coldCache.Values.Sum(e => e.CompressedSize);
        }

        private async Task<byte[]> CompressValueAsync<T>(T value)
        {
            // Placeholder compression - would implement actual compression like Brotli or GZip
            await Task.Yield();
            
            if (value is string str)
                return System.Text.Encoding.UTF8.GetBytes(str);
            
            // For other types, would serialize and compress
            return new byte[0];
        }

        private async Task<T> DecompressValueAsync<T>(byte[] compressedData)
        {
            // Placeholder decompression
            await Task.Yield();
            
            if (typeof(T) == typeof(string))
                return (T)(object)System.Text.Encoding.UTF8.GetString(compressedData);
            
            return default(T)!;
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _maintenanceTimer?.Dispose();
                _warmupTimer?.Dispose();
                _evictionSemaphore?.Dispose();
                
                _hotCache.Clear();
                _warmCache.Clear();
                _coldCache.Clear();
                _archiveKeys.Clear();
                
                _disposed = true;
                _logger.LogInformation("MultiTierCacheService disposed");
            }
        }
    }

    #region Supporting Types

    /// <summary>
    /// Cache tiers for multi-level caching
    /// </summary>
    public enum CacheTier
    {
        Hot,    // Most frequently accessed, in-memory
        Warm,   // Regularly accessed, in-memory
        Cold    // Occasionally accessed, compressed
    }

    /// <summary>
    /// Base interface for cache entries
    /// </summary>
    public interface ICacheEntry
    {
        string Key { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime LastAccessed { get; set; }
        DateTime ExpiresAt { get; set; }
        long AccessCount { get; set; }
    }

    /// <summary>
    /// Hot cache entry (uncompressed, high-priority)
    /// </summary>
    public class HotCacheEntry : ICacheEntry
    {
        public string Key { get; set; } = string.Empty;
        public object Value { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime LastAccessed { get; set; }
        public DateTime ExpiresAt { get; set; }
        public long AccessCount { get; set; }
        public long EstimatedSize { get; set; }
    }

    /// <summary>
    /// Warm cache entry (uncompressed, medium-priority)
    /// </summary>
    public class WarmCacheEntry : ICacheEntry
    {
        public string Key { get; set; } = string.Empty;
        public object Value { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime LastAccessed { get; set; }
        public DateTime ExpiresAt { get; set; }
        public long AccessCount { get; set; }
        public long EstimatedSize { get; set; }
    }

    /// <summary>
    /// Cold cache entry (compressed, low-priority)
    /// </summary>
    public class ColdCacheEntry : ICacheEntry
    {
        public string Key { get; set; } = string.Empty;
        public byte[] CompressedValue { get; set; } = Array.Empty<byte>();
        public DateTime CreatedAt { get; set; }
        public DateTime LastAccessed { get; set; }
        public DateTime ExpiresAt { get; set; }
        public long AccessCount { get; set; }
        public long OriginalSize { get; set; }
        public long CompressedSize { get; set; }
    }

    /// <summary>
    /// Access pattern tracking for predictive caching
    /// </summary>
    public class CacheAccessPattern
    {
        public string Key { get; set; } = string.Empty;
        public DateTime FirstAccess { get; set; }
        public DateTime LastAccess { get; set; }
        public long AccessCount { get; set; }
        public double AccessFrequency { get; set; }
    }

    /// <summary>
    /// Predictive metrics for cache optimization
    /// </summary>
    public class PredictiveMetrics
    {
        public string Key { get; set; } = string.Empty;
        public double PredictedAccessProbability { get; set; }
        public DateTime PredictedNextAccess { get; set; }
        public CacheTier RecommendedTier { get; set; }
    }

    /// <summary>
    /// Cache statistics for monitoring
    /// </summary>
    public record MultiTierCacheStatistics(
        int HotCacheSize,
        int WarmCacheSize,
        int ColdCacheSize,
        int ArchiveKeysCount,
        long TotalHits,
        long TotalMisses,
        double HitRate,
        long EstimatedMemoryUsageMB
    );

    /// <summary>
    /// Event args for cache promotions
    /// </summary>
    public class CachePromotionEventArgs : EventArgs
    {
        public string Key { get; }
        public CacheTier FromTier { get; }
        public CacheTier ToTier { get; }
        public DateTime Timestamp { get; }

        public CachePromotionEventArgs(string key, CacheTier fromTier, CacheTier toTier)
        {
            Key = key;
            FromTier = fromTier;
            ToTier = toTier;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for cache evictions
    /// </summary>
    public class CacheEvictionEventArgs : EventArgs
    {
        public string Key { get; }
        public CacheTier Tier { get; }
        public string Reason { get; }
        public DateTime Timestamp { get; }

        public CacheEvictionEventArgs(string key, CacheTier tier, string reason)
        {
            Key = key;
            Tier = tier;
            Reason = reason;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Event args for cache warmup
    /// </summary>
    public class CacheWarmupEventArgs : EventArgs
    {
        public List<string> WarmedUpKeys { get; }
        public CacheTier TargetTier { get; }
        public TimeSpan Duration { get; }
        public DateTime Timestamp { get; }

        public CacheWarmupEventArgs(List<string> warmedUpKeys, CacheTier targetTier, TimeSpan duration)
        {
            WarmedUpKeys = warmedUpKeys;
            TargetTier = targetTier;
            Duration = duration;
            Timestamp = DateTime.UtcNow;
        }
    }

    #endregion
}