using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Repository
{
    /// <summary>
    /// Base repository implementation with in-memory storage and caching
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    /// <typeparam name="TKey">Primary key type</typeparam>
    public abstract class BaseRepository<TEntity, TKey> : IRepository<TEntity, TKey>
        where TEntity : class, IEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        protected readonly ILogger<BaseRepository<TEntity, TKey>> _logger;
        protected readonly IntelligentCacheService _cacheService;
        protected readonly List<TEntity> _entities;
        protected readonly object _lockObject = new object();
        protected bool _disposed;

        protected BaseRepository(ILogger<BaseRepository<TEntity, TKey>> logger = null, IntelligentCacheService cacheService = null)
        {
            _logger = logger;
            _cacheService = cacheService;
            _entities = new List<TEntity>();
            
            _logger?.LogDebug("Initialized repository for {EntityType}", typeof(TEntity).Name);
        }

        #region Query Operations

        public virtual async Task<TEntity> GetByIdAsync(TKey id)
        {
            try
            {
                var cacheKey = $"{typeof(TEntity).Name}:GetById:{id}";
                
                if (_cacheService != null)
                {
                    var cached = await _cacheService.GetOrCreateAsync(cacheKey, 
                        () => Task.FromResult(FindEntityById(id)),
                        TimeSpan.FromMinutes(5));
                    
                    if (cached != null)
                        return cached;
                }

                return FindEntityById(id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting entity by id: {Id}", id);
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            try
            {
                var cacheKey = $"{typeof(TEntity).Name}:GetAll";
                
                if (_cacheService != null)
                {
                    return await _cacheService.GetOrCreateAsync(cacheKey,
                        () => Task.FromResult(GetAllEntities()),
                        TimeSpan.FromMinutes(2));
                }

                return GetAllEntities();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting all entities");
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var cacheKey = $"{typeof(TEntity).Name}:Find:{predicate.ToString().GetHashCode()}";
                
                if (_cacheService != null)
                {
                    return await _cacheService.GetOrCreateAsync(cacheKey,
                        () => Task.FromResult(QueryEntities(predicate)),
                        TimeSpan.FromMinutes(3));
                }

                return QueryEntities(predicate);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error finding entities with predicate");
                throw;
            }
        }

        public virtual async Task<TEntity> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var results = await FindAsync(predicate);
                return results.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting first entity with predicate");
                throw;
            }
        }

        public virtual async Task<TEntity> SingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var results = await FindAsync(predicate);
                return results.SingleOrDefault();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting single entity with predicate");
                throw;
            }
        }

        public virtual async Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var results = await FindAsync(predicate);
                return results.Any();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error checking if any entity matches predicate");
                throw;
            }
        }

        public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>> predicate = null)
        {
            try
            {
                if (predicate == null)
                {
                    var all = await GetAllAsync();
                    return all.Count();
                }

                var results = await FindAsync(predicate);
                return results.Count();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error counting entities");
                throw;
            }
        }

        public virtual async Task<PagedResult<TEntity>> GetPagedAsync(
            int pageNumber, 
            int pageSize, 
            Expression<Func<TEntity, bool>> predicate = null,
            Expression<Func<TEntity, object>> orderBy = null,
            bool ascending = true)
        {
            try
            {
                IEnumerable<TEntity> query;
                
                if (predicate != null)
                {
                    query = await FindAsync(predicate);
                }
                else
                {
                    query = await GetAllAsync();
                }

                var totalCount = query.Count();

                if (orderBy != null)
                {
                    var compiled = orderBy.Compile();
                    query = ascending ? query.OrderBy(compiled) : query.OrderByDescending(compiled);
                }

                var items = query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return new PagedResult<TEntity>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting paged entities");
                throw;
            }
        }

        #endregion

        #region Command Operations

        public virtual async Task<TEntity> AddAsync(TEntity entity)
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                entity.CreatedAt = DateTime.UtcNow;
                if (entity.Id.Equals(default(TKey)))
                {
                    entity.Id = GenerateNewId();
                }

                lock (_lockObject)
                {
                    _entities.Add(entity);
                }

                InvalidateCache();
                _logger?.LogDebug("Added entity with id: {Id}", entity.Id);
                
                return await Task.FromResult(entity);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error adding entity");
                throw;
            }
        }

        public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                if (entities == null)
                    throw new ArgumentNullException(nameof(entities));

                var entitiesList = entities.ToList();
                var now = DateTime.UtcNow;

                foreach (var entity in entitiesList)
                {
                    entity.CreatedAt = now;
                    if (entity.Id.Equals(default(TKey)))
                    {
                        entity.Id = GenerateNewId();
                    }
                }

                lock (_lockObject)
                {
                    _entities.AddRange(entitiesList);
                }

                InvalidateCache();
                _logger?.LogDebug("Added {Count} entities", entitiesList.Count);
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error adding entity range");
                throw;
            }
        }

        public virtual async Task<TEntity> UpdateAsync(TEntity entity)
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                lock (_lockObject)
                {
                    var existingIndex = _entities.FindIndex(e => e.Id.Equals(entity.Id));
                    if (existingIndex == -1)
                        throw new InvalidOperationException($"Entity with id {entity.Id} not found");

                    entity.UpdatedAt = DateTime.UtcNow;
                    _entities[existingIndex] = entity;
                }

                InvalidateCache();
                _logger?.LogDebug("Updated entity with id: {Id}", entity.Id);
                
                return await Task.FromResult(entity);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating entity");
                throw;
            }
        }

        public virtual async Task UpdateRangeAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                if (entities == null)
                    throw new ArgumentNullException(nameof(entities));

                var entitiesList = entities.ToList();
                var now = DateTime.UtcNow;

                lock (_lockObject)
                {
                    foreach (var entity in entitiesList)
                    {
                        var existingIndex = _entities.FindIndex(e => e.Id.Equals(entity.Id));
                        if (existingIndex != -1)
                        {
                            entity.UpdatedAt = now;
                            _entities[existingIndex] = entity;
                        }
                    }
                }

                InvalidateCache();
                _logger?.LogDebug("Updated {Count} entities", entitiesList.Count);
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating entity range");
                throw;
            }
        }

        public virtual async Task<bool> RemoveAsync(TKey id)
        {
            try
            {
                bool removed;
                lock (_lockObject)
                {
                    var entityIndex = _entities.FindIndex(e => e.Id.Equals(id));
                    if (entityIndex == -1)
                        return false;

                    _entities.RemoveAt(entityIndex);
                    removed = true;
                }

                if (removed)
                {
                    InvalidateCache();
                    _logger?.LogDebug("Removed entity with id: {Id}", id);
                }

                return await Task.FromResult(removed);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error removing entity by id: {Id}", id);
                throw;
            }
        }

        public virtual async Task<bool> RemoveAsync(TEntity entity)
        {
            try
            {
                if (entity == null)
                    return false;

                return await RemoveAsync(entity.Id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error removing entity");
                throw;
            }
        }

        public virtual async Task<int> RemoveRangeAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                if (entities == null)
                    return 0;

                var entitiesList = entities.ToList();
                var removedCount = 0;

                foreach (var entity in entitiesList)
                {
                    if (await RemoveAsync(entity.Id))
                    {
                        removedCount++;
                    }
                }

                _logger?.LogDebug("Removed {Count} entities", removedCount);
                return removedCount;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error removing entity range");
                throw;
            }
        }

        public virtual async Task<int> RemoveAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var entitiesToRemove = await FindAsync(predicate);
                return await RemoveRangeAsync(entitiesToRemove);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error removing entities with predicate");
                throw;
            }
        }

        #endregion

        #region Transaction Operations

        public virtual async Task<IRepositoryTransaction> BeginTransactionAsync()
        {
            // For in-memory implementation, return a mock transaction
            return await Task.FromResult(new InMemoryTransaction());
        }

        public virtual async Task<int> SaveChangesAsync()
        {
            // For in-memory implementation, changes are applied immediately
            return await Task.FromResult(0);
        }

        #endregion

        #region Advanced Operations

        public virtual Task<IEnumerable<TResult>> ExecuteQueryAsync<TResult>(string sql, params object[] parameters)
        {
            // For in-memory implementation, throw not supported
            throw new NotSupportedException("Raw SQL queries are not supported in in-memory repository");
        }

        public virtual Task<int> ExecuteCommandAsync(string sql, params object[] parameters)
        {
            // For in-memory implementation, throw not supported
            throw new NotSupportedException("Raw SQL commands are not supported in in-memory repository");
        }

        public virtual async Task BulkInsertAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                await AddRangeAsync(entities);
                _logger?.LogDebug("Bulk inserted {Count} entities", entities.Count());
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error bulk inserting entities");
                throw;
            }
        }

        public virtual async Task BulkUpdateAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                await UpdateRangeAsync(entities);
                _logger?.LogDebug("Bulk updated {Count} entities", entities.Count());
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error bulk updating entities");
                throw;
            }
        }

        public virtual async Task BulkDeleteAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var count = await RemoveAsync(predicate);
                _logger?.LogDebug("Bulk deleted {Count} entities", count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error bulk deleting entities");
                throw;
            }
        }

        #endregion

        #region Protected Methods

        protected virtual TEntity FindEntityById(TKey id)
        {
            lock (_lockObject)
            {
                return _entities.FirstOrDefault(e => e.Id.Equals(id));
            }
        }

        protected virtual IEnumerable<TEntity> GetAllEntities()
        {
            lock (_lockObject)
            {
                return _entities.ToList();
            }
        }

        protected virtual IEnumerable<TEntity> QueryEntities(Expression<Func<TEntity, bool>> predicate)
        {
            lock (_lockObject)
            {
                var compiled = predicate.Compile();
                return _entities.Where(compiled).ToList();
            }
        }

        protected abstract TKey GenerateNewId();

        protected virtual void InvalidateCache()
        {
            if (_cacheService != null)
            {
                var pattern = $"{typeof(TEntity).Name}:*";
                _cacheService.InvalidatePattern(pattern);
            }
        }

        #endregion

        #region IDisposable

        public virtual void Dispose()
        {
            if (!_disposed)
            {
                lock (_lockObject)
                {
                    _entities.Clear();
                }
                
                _disposed = true;
                _logger?.LogDebug("Disposed repository for {EntityType}", typeof(TEntity).Name);
            }
        }

        #endregion
    }

    /// <summary>
    /// In-memory transaction implementation
    /// </summary>
    internal class InMemoryTransaction : IRepositoryTransaction
    {
        private bool _disposed;

        public async Task CommitAsync()
        {
            // In-memory changes are already committed
            await Task.CompletedTask;
        }

        public async Task RollbackAsync()
        {
            // In-memory rollback not supported in this simple implementation
            await Task.CompletedTask;
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// String-based repository implementation
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    public abstract class StringRepository<TEntity> : BaseRepository<TEntity, string>
        where TEntity : class, IEntity<string>
    {
        protected StringRepository(ILogger<BaseRepository<TEntity, string>> logger = null, IntelligentCacheService cacheService = null)
            : base(logger, cacheService)
        {
        }

        protected override string GenerateNewId()
        {
            return Guid.NewGuid().ToString();
        }
    }

    /// <summary>
    /// Integer-based repository implementation
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    public abstract class IntRepository<TEntity> : BaseRepository<TEntity, int>
        where TEntity : class, IEntity<int>
    {
        private int _nextId = 1;

        protected IntRepository(ILogger<BaseRepository<TEntity, int>> logger = null, IntelligentCacheService cacheService = null)
            : base(logger, cacheService)
        {
        }

        protected override int GenerateNewId()
        {
            lock (_lockObject)
            {
                // Find the maximum existing ID and increment
                var maxId = _entities.Any() ? _entities.Max(e => e.Id) : 0;
                _nextId = Math.Max(_nextId, maxId + 1);
                return _nextId++;
            }
        }
    }

    /// <summary>
    /// GUID-based repository implementation
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    public abstract class GuidRepository<TEntity> : BaseRepository<TEntity, Guid>
        where TEntity : class, IEntity<Guid>
    {
        protected GuidRepository(ILogger<BaseRepository<TEntity, Guid>> logger = null, IntelligentCacheService cacheService = null)
            : base(logger, cacheService)
        {
        }

        protected override Guid GenerateNewId()
        {
            return Guid.NewGuid();
        }
    }
}