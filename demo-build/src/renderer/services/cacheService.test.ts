/**
 * CacheService Tests
 */

// Mock logging service BEFORE importing CacheService
// This must be hoisted to prevent errors when the global instance is created
jest.mock('./loggingService', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { CacheService } from './cacheService';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new CacheService({
      strategy: 'LRU',
      backend: 'memory',
      maxSize: 100,
      maxMemoryMB: 10,
      namespace: 'test',
    });
  });

  afterEach(() => {
    cache.shutdown();
    jest.useRealTimers();
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for missing keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should check key existence', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should delete keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should get all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });
  });

  describe('TTL Expiration', () => {
    it('should expire entries after TTL', () => {
      cache.set('key1', 'value1', 1000); // 1 second TTL

      expect(cache.get('key1')).toBe('value1');

      // Fast-forward time
      jest.advanceTimersByTime(1500);

      expect(cache.get('key1')).toBeUndefined();
    });

    it('should not expire entries without TTL', () => {
      cache.set('key1', 'value1');

      jest.advanceTimersByTime(100000);

      expect(cache.get('key1')).toBe('value1');
    });

    it('should use default TTL', () => {
      const cacheWithDefaultTTL = new CacheService({
        defaultTTL: 1000,
        namespace: 'ttl-test',
      });

      cacheWithDefaultTTL.set('key1', 'value1');

      jest.advanceTimersByTime(1500);

      expect(cacheWithDefaultTTL.get('key1')).toBeUndefined();

      cacheWithDefaultTTL.shutdown();
    });
  });

  describe('LRU Eviction', () => {
    beforeEach(() => {
      cache = new CacheService({
        strategy: 'LRU',
        maxSize: 3,
        namespace: 'lru-test',
      });
    });

    it('should evict least recently used entry', () => {
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(10);
      cache.set('key2', 'value2');
      jest.advanceTimersByTime(10);
      cache.set('key3', 'value3');
      jest.advanceTimersByTime(10);

      // Access key1 and key2 to make key3 least recently used
      cache.get('key1');
      jest.advanceTimersByTime(10);
      cache.get('key2');
      jest.advanceTimersByTime(10);

      // Add new entry, should evict key3
      cache.set('key4', 'value4');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(false);
      expect(cache.has('key4')).toBe(true);
    });
  });

  describe('LFU Eviction', () => {
    beforeEach(() => {
      cache = new CacheService({
        strategy: 'LFU',
        maxSize: 3,
        namespace: 'lfu-test',
      });
    });

    it('should evict least frequently used entry', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1 and key2 multiple times
      cache.get('key1');
      cache.get('key1');
      cache.get('key2');

      // key3 has 0 accesses, should be evicted
      cache.set('key4', 'value4');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(false);
      expect(cache.has('key4')).toBe(true);
    });
  });

  describe('FIFO Eviction', () => {
    beforeEach(() => {
      cache = new CacheService({
        strategy: 'FIFO',
        maxSize: 3,
        namespace: 'fifo-test',
      });
    });

    it('should evict first in entry', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Add new entry, should evict key1 (first in)
      cache.set('key4', 'value4');

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });
  });

  describe('Batch Operations', () => {
    it('should get multiple keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const results = cache.getMany(['key1', 'key2', 'nonexistent']);

      expect(results.size).toBe(2);
      expect(results.get('key1')).toBe('value1');
      expect(results.get('key2')).toBe('value2');
      expect(results.has('nonexistent')).toBe(false);
    });

    it('should set multiple entries', () => {
      const entries = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ]);

      cache.setMany(entries);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('Get or Set', () => {
    it('should return cached value if exists', async () => {
      cache.set('key1', 'cached');

      const factory = jest.fn().mockResolvedValue('fresh');
      const result = await cache.getOrSet('key1', factory);

      expect(result).toBe('cached');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should fetch and cache if not exists', async () => {
      const factory = jest.fn().mockResolvedValue('fresh');
      const result = await cache.getOrSet('key1', factory);

      expect(result).toBe('fresh');
      expect(factory).toHaveBeenCalled();
      expect(cache.get('key1')).toBe('fresh');
    });

    it('should support TTL with getOrSet', async () => {
      const factory = jest.fn().mockResolvedValue('value');
      await cache.getOrSet('key1', factory, 1000);

      jest.advanceTimersByTime(1500);

      // Should be expired and fetch again
      await cache.getOrSet('key1', factory, 1000);
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with data', async () => {
      const factory = jest.fn((key: string) =>
        Promise.resolve(`value-${key}`)
      );

      await cache.warm(['key1', 'key2', 'key3'], factory);

      expect(cache.get('key1')).toBe('value-key1');
      expect(cache.get('key2')).toBe('value-key2');
      expect(cache.get('key3')).toBe('value-key3');
      expect(factory).toHaveBeenCalledTimes(3);
    });

    it('should skip existing keys during warming', async () => {
      cache.set('key1', 'existing');

      const factory = jest.fn((key: string) =>
        Promise.resolve(`value-${key}`)
      );

      await cache.warm(['key1', 'key2'], factory);

      expect(cache.get('key1')).toBe('existing');
      expect(cache.get('key2')).toBe('value-key2');
      expect(factory).toHaveBeenCalledTimes(1); // Only for key2
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('key2'); // Miss
      cache.get('key1'); // Hit

      const stats = cache.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });

    it('should track evictions', () => {
      const smallCache = new CacheService({
        maxSize: 2,
        namespace: 'small',
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3'); // Triggers eviction

      const stats = smallCache.getStats();
      expect(stats.evictions).toBe(1);

      smallCache.shutdown();
    });

    it('should track memory usage', () => {
      cache.set('key1', { data: 'test data' });

      const stats = cache.getStats();
      expect(stats.memoryUsageMB).toBeGreaterThan(0);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key2');

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('Automatic Cleanup', () => {
    it('should automatically clean expired entries', () => {
      cache.set('key1', 'value1', 5000);
      cache.set('key2', 'value2', 100000);

      // Fast-forward past key1 expiration
      jest.advanceTimersByTime(10000);

      // Trigger cleanup
      jest.advanceTimersByTime(60000);

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
    });
  });

  describe('Namespaces', () => {
    it('should isolate different namespaces', () => {
      const cache1 = new CacheService({ namespace: 'ns1' });
      const cache2 = new CacheService({ namespace: 'ns2' });

      cache1.set('key1', 'value1');
      cache2.set('key1', 'value2');

      expect(cache1.get('key1')).toBe('value1');
      expect(cache2.get('key1')).toBe('value2');

      cache1.shutdown();
      cache2.shutdown();
    });
  });

  describe('Complex Data Types', () => {
    it('should cache objects', () => {
      const obj = { name: 'test', value: 123 };
      cache.set('obj', obj);

      expect(cache.get('obj')).toEqual(obj);
    });

    it('should cache arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set('arr', arr);

      expect(cache.get('arr')).toEqual(arr);
    });

    it('should cache nested structures', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep value',
            array: [1, 2, 3],
          },
        },
      };

      cache.set('nested', nested);
      expect(cache.get('nested')).toEqual(nested);
    });
  });
});



