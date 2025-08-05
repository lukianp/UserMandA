using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Repository
{
    /// <summary>
    /// Unit of Work implementation for managing multiple repositories and transactions
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ILogger<UnitOfWork> _logger;
        private readonly IRepositoryFactory _repositoryFactory;
        private readonly ConcurrentDictionary<string, object> _repositories;
        private readonly List<IRepositoryTransaction> _activeTransactions;
        private bool _disposed;

        public UnitOfWork(ILogger<UnitOfWork> logger = null, IRepositoryFactory repositoryFactory = null)
        {
            _logger = logger;
            _repositoryFactory = repositoryFactory ?? new InMemoryRepositoryFactory();
            _repositories = new ConcurrentDictionary<string, object>();
            _activeTransactions = new List<IRepositoryTransaction>();
            
            _logger?.LogDebug("Unit of Work initialized");
        }

        #region Public Methods

        /// <summary>
        /// Gets a repository for the specified entity type
        /// </summary>
        public IRepository<TEntity, TKey> GetRepository<TEntity, TKey>()
            where TEntity : class, IEntity<TKey>
            where TKey : IEquatable<TKey>
        {
            var key = $"{typeof(TEntity).FullName}_{typeof(TKey).FullName}";
            
            return (IRepository<TEntity, TKey>)_repositories.GetOrAdd(key, _ =>
            {
                var repository = _repositoryFactory.CreateRepository<TEntity, TKey>();
                _logger?.LogDebug("Created repository for {EntityType} with key type {KeyType}", 
                    typeof(TEntity).Name, typeof(TKey).Name);
                return repository;
            });
        }

        /// <summary>
        /// Begins a new transaction across all repositories
        /// </summary>
        public async Task<IRepositoryTransaction> BeginTransactionAsync()
        {
            try
            {
                var transaction = new UnitOfWorkTransaction(_repositories.Values, _logger);
                _activeTransactions.Add(transaction);
                
                _logger?.LogDebug("Started unit of work transaction");
                return await Task.FromResult(transaction);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error starting unit of work transaction");
                throw;
            }
        }

        /// <summary>
        /// Saves all changes across all repositories
        /// </summary>
        public async Task<int> SaveChangesAsync()
        {
            try
            {
                int totalChanges = 0;

                foreach (var repository in _repositories.Values)
                {
                    if (repository is IRepository<IEntity<object>, object> repo)
                    {
                        var changes = await repo.SaveChangesAsync();
                        totalChanges += changes;
                    }
                }

                _logger?.LogDebug("Saved {TotalChanges} changes across all repositories", totalChanges);
                return totalChanges;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving changes across repositories");
                throw;
            }
        }

        /// <summary>
        /// Executes a function within a transaction
        /// </summary>
        public async Task<TResult> ExecuteInTransactionAsync<TResult>(Func<Task<TResult>> operation)
        {
            if (operation == null)
                throw new ArgumentNullException(nameof(operation));

            using var transaction = await BeginTransactionAsync();
            
            try
            {
                var result = await operation();
                await transaction.CommitAsync();
                
                _logger?.LogDebug("Successfully executed operation in transaction");
                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error executing operation in transaction, rolling back");
                await transaction.RollbackAsync();
                throw;
            }
        }

        /// <summary>
        /// Executes an action within a transaction
        /// </summary>
        public async Task ExecuteInTransactionAsync(Func<Task> operation)
        {
            await ExecuteInTransactionAsync(async () =>
            {
                await operation();
                return 0; // Return dummy value
            });
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    // Dispose all active transactions
                    foreach (var transaction in _activeTransactions)
                    {
                        transaction?.Dispose();
                    }
                    _activeTransactions.Clear();

                    // Dispose all repositories
                    foreach (var repository in _repositories.Values)
                    {
                        if (repository is IDisposable disposable)
                        {
                            disposable.Dispose();
                        }
                    }
                    _repositories.Clear();

                    _logger?.LogDebug("Unit of Work disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing Unit of Work");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }

        #endregion
    }

    /// <summary>
    /// Unit of Work transaction that coordinates multiple repository transactions
    /// </summary>
    internal class UnitOfWorkTransaction : IRepositoryTransaction
    {
        private readonly IEnumerable<object> _repositories;
        private readonly ILogger _logger;
        private readonly List<IRepositoryTransaction> _transactions;
        private bool _disposed;

        public UnitOfWorkTransaction(IEnumerable<object> repositories, ILogger logger = null)
        {
            _repositories = repositories;
            _logger = logger;
            _transactions = new List<IRepositoryTransaction>();
        }

        public async Task CommitAsync()
        {
            try
            {
                // Start transactions on all repositories
                foreach (var repository in _repositories)
                {
                    if (repository is IRepository<IEntity<object>, object> repo)
                    {
                        var transaction = await repo.BeginTransactionAsync();
                        _transactions.Add(transaction);
                    }
                }

                // Commit all transactions
                foreach (var transaction in _transactions)
                {
                    await transaction.CommitAsync();
                }

                _logger?.LogDebug("Committed {Count} repository transactions", _transactions.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error committing unit of work transaction");
                await RollbackAsync();
                throw;
            }
        }

        public async Task RollbackAsync()
        {
            try
            {
                // Rollback all transactions
                foreach (var transaction in _transactions)
                {
                    await transaction.RollbackAsync();
                }

                _logger?.LogDebug("Rolled back {Count} repository transactions", _transactions.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error rolling back unit of work transaction");
                throw;
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    foreach (var transaction in _transactions)
                    {
                        transaction?.Dispose();
                    }
                    _transactions.Clear();
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing unit of work transaction");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }
    }

    /// <summary>
    /// In-memory repository factory implementation
    /// </summary>
    public class InMemoryRepositoryFactory : IRepositoryFactory
    {
        private readonly ILogger<InMemoryRepositoryFactory> _logger;
        private readonly IntelligentCacheService _cacheService;

        public InMemoryRepositoryFactory(ILogger<InMemoryRepositoryFactory> logger = null, IntelligentCacheService cacheService = null)
        {
            _logger = logger;
            _cacheService = cacheService;
        }

        public IRepository<TEntity, TKey> CreateRepository<TEntity, TKey>()
            where TEntity : class, IEntity<TKey>
            where TKey : IEquatable<TKey>
        {
            // Create appropriate repository based on key type
            if (typeof(TKey) == typeof(string))
            {
                return (IRepository<TEntity, TKey>)new GenericStringRepository<TEntity>(_logger as ILogger<BaseRepository<TEntity, string>>, _cacheService);
            }
            else if (typeof(TKey) == typeof(int))
            {
                return (IRepository<TEntity, TKey>)new GenericIntRepository<TEntity>(_logger as ILogger<BaseRepository<TEntity, int>>, _cacheService);
            }
            else if (typeof(TKey) == typeof(Guid))
            {
                return (IRepository<TEntity, TKey>)new GenericGuidRepository<TEntity>(_logger as ILogger<BaseRepository<TEntity, Guid>>, _cacheService);
            }
            else
            {
                throw new NotSupportedException($"Key type {typeof(TKey)} is not supported");
            }
        }

        public IUnitOfWork CreateUnitOfWork()
        {
            return new UnitOfWork(_logger as ILogger<UnitOfWork>, this);
        }
    }

    /// <summary>
    /// Generic string-based repository
    /// </summary>
    internal class GenericStringRepository<TEntity> : StringRepository<TEntity>
        where TEntity : class, IEntity<string>
    {
        public GenericStringRepository(ILogger<BaseRepository<TEntity, string>> logger = null, IntelligentCacheService cacheService = null)
            : base(logger, cacheService)
        {
        }
    }

    /// <summary>
    /// Generic integer-based repository
    /// </summary>
    internal class GenericIntRepository<TEntity> : IntRepository<TEntity>
        where TEntity : class, IEntity<int>
    {
        public GenericIntRepository(ILogger<BaseRepository<TEntity, int>> logger = null, IntelligentCacheService cacheService = null)
            : base(logger, cacheService)
        {
        }
    }

    /// <summary>
    /// Generic GUID-based repository
    /// </summary>
    internal class GenericGuidRepository<TEntity> : GuidRepository<TEntity>
        where TEntity : class, IEntity<Guid>
    {
        public GenericGuidRepository(ILogger<BaseRepository<TEntity, Guid>> logger = null, IntelligentCacheService cacheService = null)
            : base(logger, cacheService)
        {
        }
    }

    /// <summary>
    /// Repository builder for fluent configuration
    /// </summary>
    public class RepositoryBuilder<TEntity, TKey>
        where TEntity : class, IEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        private readonly IRepositoryFactory _factory;
        private readonly RepositoryOptions _options;

        public RepositoryBuilder(IRepositoryFactory factory)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
            _options = new RepositoryOptions();
        }

        public RepositoryBuilder<TEntity, TKey> WithConnectionString(string connectionString)
        {
            _options.ConnectionString = connectionString;
            return this;
        }

        public RepositoryBuilder<TEntity, TKey> WithCommandTimeout(int seconds)
        {
            _options.CommandTimeout = seconds;
            return this;
        }

        public RepositoryBuilder<TEntity, TKey> EnableQueryCache(TimeSpan expiration)
        {
            _options.EnableQueryCache = true;
            _options.QueryCacheExpiration = expiration;
            return this;
        }

        public RepositoryBuilder<TEntity, TKey> EnableRetryOnFailure(int maxRetryCount = 3)
        {
            _options.EnableRetryOnFailure = true;
            _options.MaxRetryCount = maxRetryCount;
            return this;
        }

        public IRepository<TEntity, TKey> Build()
        {
            var repository = _factory.CreateRepository<TEntity, TKey>();
            
            // Apply configuration options here if repository supports it
            // For now, just return the repository
            
            return repository;
        }
    }

    /// <summary>
    /// Extension methods for repository operations
    /// </summary>
    public static class RepositoryExtensions
    {
        /// <summary>
        /// Adds or updates an entity
        /// </summary>
        public static async Task<TEntity> AddOrUpdateAsync<TEntity, TKey>(
            this IRepository<TEntity, TKey> repository,
            TEntity entity)
            where TEntity : class, IEntity<TKey>
            where TKey : IEquatable<TKey>
        {
            var existing = await repository.GetByIdAsync(entity.Id);
            if (existing != null)
            {
                return await repository.UpdateAsync(entity);
            }
            else
            {
                return await repository.AddAsync(entity);
            }
        }

        /// <summary>
        /// Gets entities with includes
        /// </summary>
        public static async Task<IEnumerable<TEntity>> GetWithIncludesAsync<TEntity, TKey>(
            this IRepository<TEntity, TKey> repository,
            params string[] includeProperties)
            where TEntity : class, IEntity<TKey>
            where TKey : IEquatable<TKey>
        {
            // For in-memory implementation, includes are not supported
            // Return all entities
            return await repository.GetAllAsync();
        }

        /// <summary>
        /// Soft deletes an auditable entity
        /// </summary>
        public static async Task<bool> SoftDeleteAsync<TEntity, TKey>(
            this IRepository<TEntity, TKey> repository,
            TKey id,
            string deletedBy = null)
            where TEntity : class, IAuditableEntity<TKey>
            where TKey : IEquatable<TKey>
        {
            var entity = await repository.GetByIdAsync(id);
            if (entity == null)
                return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.DeletedBy = deletedBy;

            await repository.UpdateAsync(entity);
            return true;
        }
    }
}