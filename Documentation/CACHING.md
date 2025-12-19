# Caching Implementation

This document describes the caching architecture and implementation in the guiv2 application.

## Overview

The application uses a multi-layered caching system to improve performance by reducing redundant data requests, expensive computations, and API calls. The caching system is built on a flexible CacheService that supports multiple eviction strategies and storage backends.

## Architecture

### Components

1. **CacheService** (`src/renderer/services/cacheService.ts`)
   - Core caching engine with pluggable strategies
   - Supports LRU, LFU, FIFO, and TTL eviction policies
   - Multiple storage backends: memory, localStorage, IndexedDB
   - Built-in statistics and monitoring

2. **React Hooks** (`src/renderer/hooks/useCache.ts`)
   - `useCache` - Hook for cached data with automatic refresh
   - `useCacheStats` - Hook for monitoring cache statistics
   - `useCacheManager` - Hook for cache management operations
   - `useCachedQuery` - Hook for cached queries with dependencies

3. **Service Integration**
   - Discovery Service (`src/renderer/services/discoveryService.ts`) uses caching for:
     - Discovery templates
     - Discovery history queries
     - Discovery results
     - Scheduled discoveries
     - Comparison results

## CacheService API

### Configuration

```typescript
const cacheService = getCacheService();

// Configure cache settings
cacheService.configure({
  maxSize: 100 * 1024 * 1024, // 100 MB
  defaultTTL: 5 * 60 * 1000,  // 5 minutes
  evictionStrategy: 'LRU',     // or 'LFU', 'FIFO', 'TTL'
  backend: 'memory',           // or 'localStorage', 'indexedDB'
  enablePersistence: true,
  persistInterval: 60000,      // 1 minute
  enableCompression: false,
});
```

### Basic Operations

```typescript
// Set a value
await cacheService.set('key', value, { ttl: 60000 });

// Get a value
const value = await cacheService.get('key');

// Get or set (fetch if not cached)
const data = await cacheService.getOrSet(
  'key',
  async () => fetchData(),
  { ttl: 5 * 60 * 1000 }
);

// Delete a value
cacheService.delete('key');

// Clear all cache
cacheService.clear();
```

### Advanced Operations

```typescript
// Invalidate by prefix
cacheService.invalidatePrefix('discovery:');

// Invalidate by pattern
cacheService.invalidatePattern(/^user:\d+$/);

// Cache warming (preload data)
await cacheService.warm([
  { key: 'templates', factory: () => loadTemplates() },
  { key: 'settings', factory: () => loadSettings() },
]);

// Get statistics
const stats = cacheService.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
console.log(`Total requests: ${stats.totalRequests}`);
```

## React Hooks Usage

### useCache Hook

The `useCache` hook provides automatic data fetching and caching with React state management.

```typescript
import { useCache } from '../hooks/useCache';

function MyComponent() {
  const {
    data,
    isLoading,
    error,
    invalidate,
    refresh
  } = useCache(
    'user-profile',
    async () => fetchUserProfile(),
    {
      ttl: 5 * 60 * 1000,        // 5 minutes
      refreshInterval: 30000,     // Refresh every 30 seconds
      enabled: true,              // Enable/disable caching
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={invalidate}>Invalidate Cache</button>
      <button onClick={refresh}>Refresh Data</button>
    </div>
  );
}
```

### useCachedQuery Hook

The `useCachedQuery` hook supports query keys with dependencies.

```typescript
import { useCachedQuery } from '../hooks/useCache';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useCachedQuery(
    ['user', userId],  // Query key with dependencies
    async () => fetchUser(userId),
    { ttl: 5 * 60 * 1000 }
  );

  // Cache key: 'user:123'
  // Automatically refreshes when userId changes
}
```

### useCacheStats Hook

Monitor cache performance in real-time.

```typescript
import { useCacheStats } from '../hooks/useCache';

function CacheMonitor() {
  const stats = useCacheStats(); // Updates every second

  return (
    <div>
      <div>Hit Rate: {stats.hitRate.toFixed(2)}%</div>
      <div>Size: {(stats.size / 1024 / 1024).toFixed(2)} MB</div>
      <div>Items: {stats.count}</div>
    </div>
  );
}
```

### useCacheManager Hook

Manage cache operations from components.

```typescript
import { useCacheManager } from '../hooks/useCache';

function CacheControls() {
  const { clear, invalidatePrefix, saveToStorage } = useCacheManager();

  return (
    <div>
      <button onClick={clear}>Clear All Cache</button>
      <button onClick={() => invalidatePrefix('discovery:')}>
        Clear Discovery Cache
      </button>
      <button onClick={saveToStorage}>Save to Storage</button>
    </div>
  );
}
```

## Integration Examples

### Discovery Service Integration

The discovery service uses caching to improve performance for frequently accessed data.

#### Templates Caching

```typescript
// In discoveryService.ts
async getTemplates(): Promise<DiscoveryTemplate[]> {
  return this.cacheService.getOrSet(
    'discovery:templates',
    async () => Array.from(this.discoveryTemplates.values()),
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );
}

async saveTemplate(template: DiscoveryTemplate): Promise<void> {
  this.discoveryTemplates.set(template.id, template);
  await this.saveDiscoveryTemplates();

  // Invalidate cache after modification
  this.cacheService.delete('discovery:templates');
}
```

#### History Queries Caching

```typescript
async getHistory(filter?: HistoryFilter): Promise<DiscoveryRun[]> {
  // Generate cache key based on filter
  const cacheKey = `discovery:history:${JSON.stringify(filter || {})}`;

  return this.cacheService.getOrSet(
    cacheKey,
    async () => {
      // Perform filtering and sorting
      let runs = Array.from(this.discoveryHistory.values());
      // ... filtering logic
      return runs;
    },
    { ttl: 30 * 1000 } // 30 seconds
  );
}
```

#### Expensive Computations Caching

```typescript
async compareResults(runId1: string, runId2: string): Promise<ComparisonResult> {
  const cacheKey = `discovery:comparison:${runId1}:${runId2}`;

  return this.cacheService.getOrSet(
    cacheKey,
    async () => {
      // Expensive comparison computation
      const result1 = await this.getResults(runId1);
      const result2 = await this.getResults(runId2);
      // ... comparison logic
      return comparisonResult;
    },
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );
}
```

## Cache Invalidation Strategies

### Manual Invalidation

Invalidate cache when data is modified:

```typescript
async deleteHistory(runId: string): Promise<void> {
  this.discoveryHistory.delete(runId);
  await this.saveDiscoveryHistory();

  // Invalidate related caches
  this.cacheService.delete(`discovery:results:${runId}`);
  this.cacheService.invalidatePrefix('discovery:history:');
  this.cacheService.invalidatePrefix('discovery:comparison:');
}
```

### Time-Based Invalidation (TTL)

Set appropriate TTL values based on data volatility:

```typescript
// Frequently changing data - short TTL
{ ttl: 30 * 1000 }  // 30 seconds

// Moderately changing data - medium TTL
{ ttl: 5 * 60 * 1000 }  // 5 minutes

// Rarely changing data - long TTL
{ ttl: 30 * 60 * 1000 }  // 30 minutes

// Expensive computations - very long TTL
{ ttl: 60 * 60 * 1000 }  // 1 hour
```

### Pattern-Based Invalidation

Invalidate multiple related cache entries:

```typescript
// Invalidate all discovery-related caches
cacheService.invalidatePrefix('discovery:');

// Invalidate user caches by pattern
cacheService.invalidatePattern(/^user:\d+$/);
```

## Cache Key Naming Conventions

Use consistent naming patterns for cache keys:

```typescript
// Service-scoped keys
'discovery:templates'
'discovery:scheduled'

// Entity-specific keys
'discovery:results:{runId}'
'user:profile:{userId}'

// Query-based keys
'discovery:history:{filterJson}'
'users:search:{queryParams}'

// Comparison/computed keys
'discovery:comparison:{runId1}:{runId2}'
```

## Performance Recommendations

### TTL Guidelines

| Data Type | Recommended TTL | Reason |
|-----------|----------------|--------|
| User sessions | 15 minutes | Balance security and UX |
| Discovery templates | 5 minutes | Changes infrequently |
| Discovery history | 30 seconds | May update frequently |
| Discovery results | 5 minutes | Historical, rarely changes |
| Scheduled tasks | 1 minute | May be modified often |
| Expensive computations | 10-30 minutes | High computation cost |
| Static configuration | 1 hour | Rarely changes |

### Memory Management

```typescript
// Configure reasonable max size
cacheService.configure({
  maxSize: 100 * 1024 * 1024, // 100 MB
  evictionStrategy: 'LRU',     // Remove least recently used
});

// Monitor cache size
const stats = cacheService.getStats();
if (stats.size > 80 * 1024 * 1024) {
  // Cache is getting full, consider clearing old entries
  cacheService.invalidatePattern(/^old-data:/);
}
```

### Cache Warming

Preload frequently accessed data on application startup:

```typescript
// In App.tsx or initialization code
useEffect(() => {
  const warmCache = async () => {
    await cacheService.warm([
      {
        key: 'discovery:templates',
        factory: () => discoveryService.getTemplates(),
      },
      {
        key: 'app:settings',
        factory: () => loadSettings(),
      },
    ]);
  };

  warmCache();
}, []);
```

### Avoid Over-Caching

Don't cache everything:

- ❌ Don't cache: User input, temporary UI state, real-time data
- ✅ Do cache: API responses, expensive computations, static data

```typescript
// Bad - caching user input
const [searchTerm, setSearchTerm] = useState('');
// Don't cache this!

// Good - caching search results
const { data: searchResults } = useCache(
  `search:${searchTerm}`,
  async () => performSearch(searchTerm),
  { ttl: 60000 }
);
```

## Monitoring and Debugging

### Cache Statistics

```typescript
const stats = cacheService.getStats();
console.log({
  hitRate: `${stats.hitRate.toFixed(2)}%`,
  missRate: `${stats.missRate.toFixed(2)}%`,
  size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
  count: stats.count,
  evictions: stats.evictions,
});
```

### Debugging Cache Behavior

Enable detailed logging:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  const originalGet = cacheService.get.bind(cacheService);
  cacheService.get = async (key: string) => {
    const value = await originalGet(key);
    console.log(`[Cache] ${value ? 'HIT' : 'MISS'}: ${key}`);
    return value;
  };
}
```

## Migration Guide

### Before Caching

```typescript
async function loadUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// Called multiple times - multiple API calls
const user1 = await loadUserData('123');
const user2 = await loadUserData('123'); // Redundant API call
```

### After Caching

```typescript
async function loadUserData(userId: string) {
  return cacheService.getOrSet(
    `user:${userId}`,
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    { ttl: 5 * 60 * 1000 }
  );
}

// Called multiple times - one API call
const user1 = await loadUserData('123'); // API call
const user2 = await loadUserData('123'); // Cached!
```

## Best Practices

1. **Use descriptive cache keys** - Include service/entity type in key names
2. **Set appropriate TTLs** - Balance freshness vs. performance
3. **Invalidate on mutations** - Clear cache when data changes
4. **Monitor cache stats** - Track hit rates and adjust strategy
5. **Use cache warming** - Preload critical data on app startup
6. **Handle cache misses** - Always have fallback data fetching
7. **Avoid caching sensitive data** - Don't cache passwords, tokens, etc.
8. **Test cache behavior** - Verify cache invalidation and TTL expiry
9. **Document cache keys** - Maintain a registry of cache key patterns
10. **Clean up old entries** - Implement periodic cache cleanup

## Troubleshooting

### High Memory Usage

```typescript
// Check cache size
const stats = cacheService.getStats();
if (stats.size > threshold) {
  // Clear old entries
  cacheService.clear();
  // Or reduce TTL
  cacheService.configure({ defaultTTL: 60000 });
}
```

### Stale Data

```typescript
// Force refresh by invalidating cache
cacheService.delete('key');
// Or reduce TTL
const data = await cacheService.getOrSet(
  'key',
  factory,
  { ttl: 10000 } // Shorter TTL
);
```

### Cache Not Persisting

```typescript
// Enable persistence
cacheService.configure({
  enablePersistence: true,
  backend: 'localStorage', // or 'indexedDB'
});

// Manually save
cacheService.saveToStorage();
```

## Future Enhancements

1. **Distributed caching** - Share cache across multiple windows/tabs
2. **Cache tags** - Group related cache entries for bulk invalidation
3. **Automatic revalidation** - Background refresh of stale data
4. **Cache compression** - Reduce memory footprint for large datasets
5. **Analytics integration** - Track cache performance metrics
6. **Smart prefetching** - Predict and preload data based on usage patterns

## Related Files

- `src/renderer/services/cacheService.ts` - Core cache service
- `src/renderer/hooks/useCache.ts` - React hooks for caching
- `src/renderer/services/discoveryService.ts` - Example integration
- `guiv2/TESTING_ARCHITECTURE.md` - Testing guidelines

## References

- [Cache Replacement Policies](https://en.wikipedia.org/wiki/Cache_replacement_policies)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
