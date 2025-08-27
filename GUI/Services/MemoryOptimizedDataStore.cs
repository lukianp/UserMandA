#nullable enable
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Memory-optimized data store using segmented dictionaries and string pooling
    /// Addresses T-030 memory optimization requirements for large datasets
    /// </summary>
    public class MemoryOptimizedDataStore<TKey, TValue> : IDisposable where TKey : notnull
    {
        private readonly ILogger<MemoryOptimizedDataStore<TKey, TValue>> _logger;
        private readonly int _segmentCount;
        private readonly SegmentedDictionary<TKey, TValue>[] _segments;
        private readonly CompressedStringPool _stringPool;
        private readonly ReaderWriterLockSlim _resizeLock = new();
        private readonly string _storeName;
        private bool _disposed = false;

        // Statistics tracking
        private long _totalItems = 0;
        private long _totalMemoryBytes = 0;
        private DateTime _lastCompactionTime = DateTime.UtcNow;

        public long Count => Volatile.Read(ref _totalItems);
        public long EstimatedMemoryUsage => Volatile.Read(ref _totalMemoryBytes);
        
        /// <summary>
        /// Gets all values in the store (compatibility property)
        /// </summary>
        public IEnumerable<TValue> Values => GetAllValues();

        public MemoryOptimizedDataStore(ILogger<MemoryOptimizedDataStore<TKey, TValue>> logger, string storeName, int segmentCount = 16)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _storeName = storeName;
            _segmentCount = Math.Max(4, segmentCount);
            _segments = new SegmentedDictionary<TKey, TValue>[_segmentCount];
            _stringPool = new CompressedStringPool(logger);

            // Initialize segments
            for (int i = 0; i < _segmentCount; i++)
            {
                _segments[i] = new SegmentedDictionary<TKey, TValue>();
            }

            _logger.LogInformation("MemoryOptimizedDataStore '{StoreName}' initialized with {SegmentCount} segments", storeName, _segmentCount);
        }

        /// <summary>
        /// Adds or updates an item in the store
        /// </summary>
        public bool TryAdd(TKey key, TValue value)
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            var segment = GetSegment(key);
            var added = false;

            _resizeLock.EnterReadLock();
            try
            {
                added = segment.TryAdd(key, OptimizeValue(value));
                if (added)
                {
                    Interlocked.Increment(ref _totalItems);
                    UpdateMemoryUsage(EstimateItemMemoryUsage(key, value), 0);
                }
            }
            finally
            {
                _resizeLock.ExitReadLock();
            }

            return added;
        }

        /// <summary>
        /// Gets a value by key
        /// </summary>
        public TValue? GetValueOrDefault(TKey key, TValue? defaultValue = default)
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            var segment = GetSegment(key);
            
            _resizeLock.EnterReadLock();
            try
            {
                return segment.TryGetValue(key, out var value) ? DeoptimizeValue(value) : defaultValue;
            }
            finally
            {
                _resizeLock.ExitReadLock();
            }
        }

        /// <summary>
        /// Removes an item from the store
        /// </summary>
        public bool TryRemove(TKey key, out TValue? value)
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            var segment = GetSegment(key);
            value = default;
            var removed = false;

            _resizeLock.EnterReadLock();
            try
            {
                if (segment.TryRemove(key, out var removedValue))
                {
                    value = DeoptimizeValue(removedValue);
                    removed = true;
                    Interlocked.Decrement(ref _totalItems);
                    UpdateMemoryUsage(0, EstimateItemMemoryUsage(key, value));
                }
            }
            finally
            {
                _resizeLock.ExitReadLock();
            }

            return removed;
        }

        /// <summary>
        /// Updates an existing item
        /// </summary>
        public bool TryUpdate(TKey key, TValue newValue, TValue comparisonValue)
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            var segment = GetSegment(key);
            var updated = false;

            _resizeLock.EnterReadLock();
            try
            {
                var optimizedNewValue = OptimizeValue(newValue);
                var optimizedComparisonValue = OptimizeValue(comparisonValue);
                
                updated = segment.TryUpdate(key, optimizedNewValue, optimizedComparisonValue);
                if (updated)
                {
                    var oldMemory = EstimateItemMemoryUsage(key, comparisonValue);
                    var newMemory = EstimateItemMemoryUsage(key, newValue);
                    UpdateMemoryUsage(newMemory, oldMemory);
                }
            }
            finally
            {
                _resizeLock.ExitReadLock();
            }

            return updated;
        }

        /// <summary>
        /// Gets all values (use with caution on large datasets)
        /// </summary>
        public IEnumerable<TValue> GetAllValues()
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            _resizeLock.EnterReadLock();
            try
            {
                foreach (var segment in _segments)
                {
                    foreach (var value in segment.Values)
                    {
                        yield return DeoptimizeValue(value);
                    }
                }
            }
            finally
            {
                _resizeLock.ExitReadLock();
            }
        }

        /// <summary>
        /// Gets all key-value pairs in chunks to prevent memory pressure
        /// </summary>
        public IEnumerable<IEnumerable<KeyValuePair<TKey, TValue>>> GetChunkedItems(int chunkSize = 1000)
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            _resizeLock.EnterReadLock();
            try
            {
                var chunk = new List<KeyValuePair<TKey, TValue>>(chunkSize);
                
                foreach (var segment in _segments)
                {
                    foreach (var kvp in segment)
                    {
                        chunk.Add(new KeyValuePair<TKey, TValue>(kvp.Key, DeoptimizeValue(kvp.Value)));
                        
                        if (chunk.Count >= chunkSize)
                        {
                            yield return chunk;
                            chunk = new List<KeyValuePair<TKey, TValue>>(chunkSize);
                        }
                    }
                }
                
                if (chunk.Count > 0)
                {
                    yield return chunk;
                }
            }
            finally
            {
                _resizeLock.ExitReadLock();
            }
        }

        /// <summary>
        /// Compacts the store to reclaim memory
        /// </summary>
        public async Task CompactAsync()
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            var startTime = DateTime.UtcNow;
            var initialMemory = _totalMemoryBytes;

            _logger.LogInformation("Starting compaction for store '{StoreName}' with {ItemCount} items", _storeName, _totalItems);

            _resizeLock.EnterWriteLock();
            try
            {
                // Compact each segment
                await Task.Run(() =>
                {
                    Parallel.For(0, _segmentCount, segmentIndex =>
                    {
                        _segments[segmentIndex].Compact();
                    });
                });

                // Compact string pool
                _stringPool.Compact();

                // Force GC to reclaim memory
                GC.Collect(2, GCCollectionMode.Forced, true);
                GC.WaitForPendingFinalizers();
                
                _lastCompactionTime = DateTime.UtcNow;
            }
            finally
            {
                _resizeLock.ExitWriteLock();
            }

            var duration = DateTime.UtcNow - startTime;
            var finalMemory = _totalMemoryBytes;
            var memoryFreed = initialMemory - finalMemory;

            _logger.LogInformation("Compaction completed for store '{StoreName}': {MemoryFreed}MB freed in {Duration}ms", 
                _storeName, memoryFreed / (1024 * 1024), duration.TotalMilliseconds);
        }

        /// <summary>
        /// Clears all data from the store
        /// </summary>
        public void Clear()
        {
            if (_disposed) throw new ObjectDisposedException(nameof(MemoryOptimizedDataStore<TKey, TValue>));

            _resizeLock.EnterWriteLock();
            try
            {
                foreach (var segment in _segments)
                {
                    segment.Clear();
                }
                _stringPool.Clear();
                
                Interlocked.Exchange(ref _totalItems, 0);
                Interlocked.Exchange(ref _totalMemoryBytes, 0);
            }
            finally
            {
                _resizeLock.ExitWriteLock();
            }

            _logger.LogInformation("Cleared all data from store '{StoreName}'", _storeName);
        }

        /// <summary>
        /// Gets memory usage statistics
        /// </summary>
        public DataStoreStatistics GetStatistics()
        {
            _resizeLock.EnterReadLock();
            try
            {
                var segmentStats = _segments.Select((s, i) => new SegmentStatistics(
                    SegmentIndex: i,
                    ItemCount: s.Count,
                    EstimatedMemoryBytes: s.EstimatedMemoryUsage
                )).ToList();

                return new DataStoreStatistics(
                    StoreName: _storeName,
                    TotalItems: _totalItems,
                    EstimatedMemoryMB: _totalMemoryBytes / (1024 * 1024),
                    SegmentCount: _segmentCount,
                    StringPoolSize: _stringPool.Count,
                    StringPoolMemoryMB: _stringPool.EstimatedMemoryUsage / (1024 * 1024),
                    LastCompactionTime: _lastCompactionTime,
                    Segments: segmentStats
                );
            }
            finally
            {
                _resizeLock.ExitReadLock();
            }
        }

        #region Private Methods

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private SegmentedDictionary<TKey, TValue> GetSegment(TKey key)
        {
            var hashCode = key.GetHashCode();
            var segmentIndex = (hashCode & int.MaxValue) % _segmentCount;
            return _segments[segmentIndex];
        }

        private TValue OptimizeValue(TValue value)
        {
            // Apply string pooling for string values
            if (value is string stringValue)
            {
                var pooledString = _stringPool.GetOrAdd(stringValue);
                return (TValue)(object)pooledString;
            }

            return value;
        }

        private TValue DeoptimizeValue(TValue value)
        {
            // No deoptimization needed currently - string pool returns actual strings
            return value;
        }

        private long EstimateItemMemoryUsage(TKey key, TValue? value)
        {
            // Rough estimation - in practice would be more sophisticated
            long size = 0;
            
            // Key size
            if (key is string keyString)
                size += keyString.Length * 2; // Unicode string
            else
                size += 32; // Rough estimate for other types
            
            // Value size
            if (value is string valueString)
                size += valueString.Length * 2; // Unicode string
            else if (value != null)
                size += 64; // Rough estimate for objects
            
            // Dictionary overhead (hash, pointers, etc.)
            size += 24;
            
            return size;
        }

        private void UpdateMemoryUsage(long added, long removed)
        {
            Interlocked.Add(ref _totalMemoryBytes, added - removed);
        }

        #endregion

        public void Dispose()
        {
            if (!_disposed)
            {
                _resizeLock.EnterWriteLock();
                try
                {
                    foreach (var segment in _segments)
                    {
                        segment.Clear();
                    }
                    _stringPool?.Dispose();
                }
                finally
                {
                    _resizeLock.ExitWriteLock();
                    _resizeLock.Dispose();
                }
                
                _disposed = true;
                _logger.LogInformation("MemoryOptimizedDataStore '{StoreName}' disposed", _storeName);
            }
        }
    }

    /// <summary>
    /// Segmented dictionary for better memory management and reduced GC pressure
    /// </summary>
    internal class SegmentedDictionary<TKey, TValue> : ConcurrentDictionary<TKey, TValue> where TKey : notnull
    {
        private long _estimatedMemoryUsage = 0;

        public long EstimatedMemoryUsage => Volatile.Read(ref _estimatedMemoryUsage);

        public new bool TryAdd(TKey key, TValue value)
        {
            var added = base.TryAdd(key, value);
            if (added)
            {
                Interlocked.Add(ref _estimatedMemoryUsage, 64); // Rough estimate
            }
            return added;
        }

        public new bool TryRemove(TKey key, out TValue? value)
        {
            var removed = base.TryRemove(key, out value);
            if (removed)
            {
                Interlocked.Add(ref _estimatedMemoryUsage, -64); // Rough estimate
            }
            return removed;
        }

        public void Compact()
        {
            // For concurrent dictionary, compaction is limited to triggering GC hints
            if (Count == 0)
            {
                Interlocked.Exchange(ref _estimatedMemoryUsage, 0);
            }
        }

        public new void Clear()
        {
            base.Clear();
            Interlocked.Exchange(ref _estimatedMemoryUsage, 0);
        }
    }

    /// <summary>
    /// Compressed string pool to reduce memory usage for duplicate strings
    /// </summary>
    public class CompressedStringPool : IDisposable
    {
        private readonly ILogger _logger;
        private readonly ConcurrentDictionary<string, WeakReference<string>> _pool = new();
        private readonly Timer _cleanupTimer;
        private long _totalMemoryUsage = 0;
        private bool _disposed = false;

        public int Count => _pool.Count;
        public long EstimatedMemoryUsage => Volatile.Read(ref _totalMemoryUsage);

        public CompressedStringPool(ILogger logger)
        {
            _logger = logger;
            
            // Clean up dead weak references every 2 minutes
            _cleanupTimer = new Timer(CleanupDeadReferences, null, TimeSpan.FromMinutes(2), TimeSpan.FromMinutes(2));
        }

        public string GetOrAdd(string value)
        {
            if (string.IsNullOrEmpty(value))
                return value;

            // Try to get existing string from pool
            if (_pool.TryGetValue(value, out var weakRef))
            {
                if (weakRef.TryGetTarget(out var existingString))
                {
                    return existingString;
                }
                else
                {
                    // Dead reference, remove it
                    _pool.TryRemove(value, out _);
                }
            }

            // Add to pool with weak reference
            var newWeakRef = new WeakReference<string>(value);
            _pool.TryAdd(value, newWeakRef);
            Interlocked.Add(ref _totalMemoryUsage, value.Length * 2);

            return value;
        }

        public void Compact()
        {
            CleanupDeadReferences(null);
        }

        public void Clear()
        {
            _pool.Clear();
            Interlocked.Exchange(ref _totalMemoryUsage, 0);
        }

        private void CleanupDeadReferences(object? state)
        {
            try
            {
                var deadKeys = new List<string>();
                
                foreach (var kvp in _pool)
                {
                    if (!kvp.Value.TryGetTarget(out _))
                    {
                        deadKeys.Add(kvp.Key);
                    }
                }

                var removedCount = 0;
                var memoryFreed = 0L;
                
                foreach (var key in deadKeys)
                {
                    if (_pool.TryRemove(key, out _))
                    {
                        removedCount++;
                        memoryFreed += key.Length * 2;
                    }
                }

                if (removedCount > 0)
                {
                    Interlocked.Add(ref _totalMemoryUsage, -memoryFreed);
                    _logger.LogDebug("String pool cleanup: removed {RemovedCount} dead references, freed {MemoryKB}KB", 
                        removedCount, memoryFreed / 1024);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during string pool cleanup");
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _cleanupTimer?.Dispose();
                Clear();
                _disposed = true;
            }
        }
    }

    #region Supporting Types

    /// <summary>
    /// Statistics for data store performance monitoring
    /// </summary>
    public record DataStoreStatistics(
        string StoreName,
        long TotalItems,
        long EstimatedMemoryMB,
        int SegmentCount,
        int StringPoolSize,
        long StringPoolMemoryMB,
        DateTime LastCompactionTime,
        List<SegmentStatistics> Segments
    );

    /// <summary>
    /// Statistics for individual segments
    /// </summary>
    public record SegmentStatistics(
        int SegmentIndex,
        int ItemCount,
        long EstimatedMemoryBytes
    );

    #endregion
}