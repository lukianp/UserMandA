using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Threading;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Intelligent caching service with LRU eviction, TTL, and performance optimization
    /// </summary>
    public class IntelligentCacheService : IDisposable
    {
        private readonly ConcurrentDictionary<string, CacheEntry> _cache;
        private readonly ConcurrentDictionary<string, CacheStatistics> _statistics;
        private readonly Timer _cleanupTimer;
        private readonly object _lockObject = new object();
        private bool _disposed;

        public int MaxCacheSize { get; set; } = 1000;
        public TimeSpan DefaultTTL { get; set; } = TimeSpan.FromMinutes(10);
        public TimeSpan CleanupInterval { get; set; } = TimeSpan.FromMinutes(2);

        public IntelligentCacheService()
        {
            _cache = new ConcurrentDictionary<string, CacheEntry>();
            _statistics = new ConcurrentDictionary<string, CacheStatistics>();
            
            _cleanupTimer = new Timer(PerformCleanup, null, CleanupInterval, CleanupInterval);
        }

        /// <summary>
        /// Gets or creates a cached item with intelligent loading
        /// </summary>
        /// <typeparam name="T">Type of cached item</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="factory">Factory function to create item if not cached</param>
        /// <param name="ttl">Time to live (optional)</param>
        /// <returns>Cached or newly created item</returns>
        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? ttl = null)
        {
            var effectiveTTL = ttl ?? DefaultTTL;

            // Try to get from cache first
            if (_cache.TryGetValue(key, out var existingEntry))
            {
                // Check if still valid
                if (DateTime.UtcNow <= existingEntry.ExpiresAt)
                {
                    existingEntry.LastAccessed = DateTime.UtcNow;
                    existingEntry.AccessCount++;
                    UpdateStatistics(key, hit: true);
                    return (T)existingEntry.Value;
                }
                else
                {
                    // Remove expired entry
                    _cache.TryRemove(key, out _);
                }
            }

            // Cache miss - create new item
            UpdateStatistics(key, hit: false);
            
            var value = await factory();
            var entry = new CacheEntry
            {
                Key = key,
                Value = value,
                CreatedAt = DateTime.UtcNow,
                LastAccessed = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(effectiveTTL),
                AccessCount = 1,
                Size = EstimateObjectSize(value)
            };

            // Add to cache with LRU eviction if needed
            AddToCache(key, entry);

            return value;
        }

        /// <summary>
        /// Gets a cached item synchronously
        /// </summary>
        /// <typeparam name="T">Type of cached item</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="factory">Factory function to create item if not cached</param>
        /// <param name="ttl">Time to live (optional)</param>
        /// <returns>Cached or newly created item</returns>
        public T GetOrCreate<T>(string key, Func<T> factory, TimeSpan? ttl = null)
        {
            var effectiveTTL = ttl ?? DefaultTTL;

            // Try to get from cache first
            if (_cache.TryGetValue(key, out var existingEntry))
            {
                // Check if still valid
                if (DateTime.UtcNow <= existingEntry.ExpiresAt)
                {
                    existingEntry.LastAccessed = DateTime.UtcNow;
                    existingEntry.AccessCount++;
                    UpdateStatistics(key, hit: true);
                    return (T)existingEntry.Value;
                }
                else
                {
                    // Remove expired entry
                    _cache.TryRemove(key, out _);
                }
            }

            // Cache miss - create new item
            UpdateStatistics(key, hit: false);
            
            var value = factory();
            var entry = new CacheEntry
            {
                Key = key,
                Value = value,
                CreatedAt = DateTime.UtcNow,
                LastAccessed = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(effectiveTTL),
                AccessCount = 1,
                Size = EstimateObjectSize(value)
            };

            // Add to cache with LRU eviction if needed
            AddToCache(key, entry);

            return value;
        }

        /// <summary>
        /// Preloads data into cache for faster access
        /// </summary>
        /// <param name="key">Cache key</param>
        /// <param name="value">Value to cache</param>
        /// <param name="ttl">Time to live (optional)</param>
        public void Preload<T>(string key, T value, TimeSpan? ttl = null)
        {
            var effectiveTTL = ttl ?? DefaultTTL;
            
            var entry = new CacheEntry
            {
                Key = key,
                Value = value,
                CreatedAt = DateTime.UtcNow,
                LastAccessed = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(effectiveTTL),
                AccessCount = 0,
                Size = EstimateObjectSize(value)
            };

            AddToCache(key, entry);
        }

        /// <summary>
        /// Invalidates a specific cache entry
        /// </summary>
        /// <param name="key">Cache key to invalidate</param>
        public void Invalidate(string key)
        {
            _cache.TryRemove(key, out _);
        }

        /// <summary>
        /// Invalidates all cache entries matching a pattern
        /// </summary>
        /// <param name="pattern">Pattern to match (supports wildcards)</param>
        public void InvalidatePattern(string pattern)
        {
            var regex = new System.Text.RegularExpressions.Regex(
                "^" + System.Text.RegularExpressions.Regex.Escape(pattern).Replace("\\*", ".*") + "$",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            var keysToRemove = _cache.Keys.Where(key => regex.IsMatch(key)).ToList();
            
            foreach (var key in keysToRemove)
            {
                _cache.TryRemove(key, out _);
            }
        }

        /// <summary>
        /// Gets cache statistics
        /// </summary>
        /// <returns>Cache performance statistics</returns>
        public CachePerformanceStats GetStatistics()
        {
            var totalHits = _statistics.Values.Sum(s => s.Hits);
            var totalMisses = _statistics.Values.Sum(s => s.Misses);
            var totalRequests = totalHits + totalMisses;
            
            return new CachePerformanceStats
            {
                TotalEntries = _cache.Count,
                TotalHits = totalHits,
                TotalMisses = totalMisses,
                HitRatio = totalRequests > 0 ? (double)totalHits / totalRequests : 0,
                TotalMemoryUsageMB = _cache.Values.Sum(e => e.Size) / 1024 / 1024,
                AverageAccessesPerEntry = _cache.Values.Count > 0 ? _cache.Values.Average(e => e.AccessCount) : 0,
                MostAccessedKeys = _cache.Values
                    .OrderByDescending(e => e.AccessCount)
                    .Take(10)
                    .Select(e => new { Key = e.Key, AccessCount = e.AccessCount })
                    .ToList()
            };
        }

        /// <summary>
        /// Clears all cached entries
        /// </summary>
        public void Clear()
        {
            _cache.Clear();
            _statistics.Clear();
        }

        private void AddToCache(string key, CacheEntry entry)
        {
            // Check if we need to evict entries
            if (_cache.Count >= MaxCacheSize)
            {
                EvictLeastRecentlyUsed();
            }

            _cache.TryAdd(key, entry);
        }

        private void EvictLeastRecentlyUsed()
        {
            var entriesToEvict = _cache.Values
                .OrderBy(e => e.LastAccessed)
                .Take(MaxCacheSize / 10) // Evict 10% of entries
                .ToList();

            foreach (var entry in entriesToEvict)
            {
                _cache.TryRemove(entry.Key, out _);
            }
        }

        private void UpdateStatistics(string key, bool hit)
        {
            _statistics.AddOrUpdate(key, 
                new CacheStatistics { Hits = hit ? 1 : 0, Misses = hit ? 0 : 1 },
                (k, existing) => 
                {
                    if (hit) existing.Hits++;
                    else existing.Misses++;
                    return existing;
                });
        }

        private long EstimateObjectSize(object obj)
        {
            if (obj == null) return 0;

            // Simple size estimation based on type
            return obj switch
            {
                string str => str.Length * 2, // Unicode chars
                ICollection<object> collection => collection.Count * 100, // Rough estimate
                _ => 100 // Default estimate
            };
        }

        private void PerformCleanup(object state)
        {
            try
            {
                var now = DateTime.UtcNow;
                var expiredKeys = _cache
                    .Where(kvp => now > kvp.Value.ExpiresAt)
                    .Select(kvp => kvp.Key)
                    .ToList();

                foreach (var key in expiredKeys)
                {
                    _cache.TryRemove(key, out _);
                }

                // Cleanup old statistics
                var oldStatKeys = _statistics
                    .Where(kvp => !_cache.ContainsKey(kvp.Key))
                    .Select(kvp => kvp.Key)
                    .ToList();

                foreach (var key in oldStatKeys)
                {
                    _statistics.TryRemove(key, out _);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Cache cleanup error: {ex.Message}");
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _cleanupTimer?.Dispose();
                _cache?.Clear();
                _statistics?.Clear();
                _disposed = true;
            }
        }

        private class CacheEntry
        {
            public string Key { get; set; }
            public object Value { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime LastAccessed { get; set; }
            public DateTime ExpiresAt { get; set; }
            public int AccessCount { get; set; }
            public long Size { get; set; }
        }

        private class CacheStatistics
        {
            public long Hits { get; set; }
            public long Misses { get; set; }
        }
    }

    /// <summary>
    /// Cache performance statistics
    /// </summary>
    public class CachePerformanceStats
    {
        public int TotalEntries { get; set; }
        public long TotalHits { get; set; }
        public long TotalMisses { get; set; }
        public double HitRatio { get; set; }
        public long TotalMemoryUsageMB { get; set; }
        public double AverageAccessesPerEntry { get; set; }
        public IList<object> MostAccessedKeys { get; set; }
    }
}