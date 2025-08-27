using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Repository
{
    /// <summary>
    /// Generic repository interface for data access operations
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    /// <typeparam name="TKey">Primary key type</typeparam>
    public interface IRepository<TEntity, TKey> : IDisposable 
        where TEntity : class, IEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        #region Query Operations

        /// <summary>
        /// Gets an entity by its primary key
        /// </summary>
        Task<TEntity> GetByIdAsync(TKey id);

        /// <summary>
        /// Gets all entities
        /// </summary>
        Task<IEnumerable<TEntity>> GetAllAsync();

        /// <summary>
        /// Finds entities matching the specified criteria
        /// </summary>
        Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate);

        /// <summary>
        /// Gets the first entity matching the criteria or null if none found
        /// </summary>
        Task<TEntity> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate);

        /// <summary>
        /// Gets a single entity matching the criteria or throws exception if more than one found
        /// </summary>
        Task<TEntity> SingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate);

        /// <summary>
        /// Checks if any entity matches the criteria
        /// </summary>
        Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate);

        /// <summary>
        /// Counts entities matching the criteria
        /// </summary>
        Task<int> CountAsync(Expression<Func<TEntity, bool>> predicate = null);

        /// <summary>
        /// Gets entities with paging support
        /// </summary>
        Task<PagedResult<TEntity>> GetPagedAsync(
            int pageNumber, 
            int pageSize, 
            Expression<Func<TEntity, bool>> predicate = null,
            Expression<Func<TEntity, object>> orderBy = null,
            bool ascending = true);

        #endregion

        #region Command Operations

        /// <summary>
        /// Adds a new entity
        /// </summary>
        Task<TEntity> AddAsync(TEntity entity);

        /// <summary>
        /// Adds multiple entities
        /// </summary>
        Task AddRangeAsync(IEnumerable<TEntity> entities);

        /// <summary>
        /// Updates an existing entity
        /// </summary>
        Task<TEntity> UpdateAsync(TEntity entity);

        /// <summary>
        /// Updates multiple entities
        /// </summary>
        Task UpdateRangeAsync(IEnumerable<TEntity> entities);

        /// <summary>
        /// Removes an entity by its primary key
        /// </summary>
        Task<bool> RemoveAsync(TKey id);

        /// <summary>
        /// Removes an entity
        /// </summary>
        Task<bool> RemoveAsync(TEntity entity);

        /// <summary>
        /// Removes multiple entities
        /// </summary>
        Task<int> RemoveRangeAsync(IEnumerable<TEntity> entities);

        /// <summary>
        /// Removes entities matching the criteria
        /// </summary>
        Task<int> RemoveAsync(Expression<Func<TEntity, bool>> predicate);

        #endregion

        #region Transaction Operations

        /// <summary>
        /// Begins a new transaction
        /// </summary>
        Task<IRepositoryTransaction> BeginTransactionAsync();

        /// <summary>
        /// Saves all pending changes
        /// </summary>
        Task<int> SaveChangesAsync();

        #endregion

        #region Advanced Operations

        /// <summary>
        /// Executes a raw SQL query
        /// </summary>
        Task<IEnumerable<TResult>> ExecuteQueryAsync<TResult>(string sql, params object[] parameters);

        /// <summary>
        /// Executes a raw SQL command
        /// </summary>
        Task<int> ExecuteCommandAsync(string sql, params object[] parameters);

        /// <summary>
        /// Bulk insert entities for performance
        /// </summary>
        Task BulkInsertAsync(IEnumerable<TEntity> entities);

        /// <summary>
        /// Bulk update entities for performance
        /// </summary>
        Task BulkUpdateAsync(IEnumerable<TEntity> entities);

        /// <summary>
        /// Bulk delete entities for performance
        /// </summary>
        Task BulkDeleteAsync(Expression<Func<TEntity, bool>> predicate);

        #endregion
    }

    /// <summary>
    /// Base entity interface
    /// </summary>
    /// <typeparam name="TKey">Primary key type</typeparam>
    public interface IEntity<TKey> where TKey : IEquatable<TKey>
    {
        TKey Id { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Auditable entity interface
    /// </summary>
    /// <typeparam name="TKey">Primary key type</typeparam>
    public interface IAuditableEntity<TKey> : IEntity<TKey> where TKey : IEquatable<TKey>
    {
        string CreatedBy { get; set; }
        string UpdatedBy { get; set; }
        bool IsDeleted { get; set; }
        DateTime? DeletedAt { get; set; }
        string DeletedBy { get; set; }
    }

    /// <summary>
    /// Repository transaction interface
    /// </summary>
    public interface IRepositoryTransaction : IDisposable
    {
        Task CommitAsync();
        Task RollbackAsync();
    }

    /// <summary>
    /// Paged result container
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => PageNumber < TotalPages;
        public bool HasPreviousPage => PageNumber > 1;
    }

    /// <summary>
    /// Unit of Work interface for managing multiple repositories
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// Gets a repository for the specified entity type
        /// </summary>
        IRepository<TEntity, TKey> GetRepository<TEntity, TKey>() 
            where TEntity : class, IEntity<TKey>
            where TKey : IEquatable<TKey>;

        /// <summary>
        /// Begins a new transaction across all repositories
        /// </summary>
        Task<IRepositoryTransaction> BeginTransactionAsync();

        /// <summary>
        /// Saves all changes across all repositories
        /// </summary>
        Task<int> SaveChangesAsync();

        /// <summary>
        /// Executes a function within a transaction
        /// </summary>
        Task<TResult> ExecuteInTransactionAsync<TResult>(Func<Task<TResult>> operation);

        /// <summary>
        /// Executes an action within a transaction
        /// </summary>
        Task ExecuteInTransactionAsync(Func<Task> operation);
    }

    /// <summary>
    /// Repository factory interface
    /// </summary>
    public interface IRepositoryFactory
    {
        /// <summary>
        /// Creates a repository for the specified entity type
        /// </summary>
        IRepository<TEntity, TKey> CreateRepository<TEntity, TKey>() 
            where TEntity : class, IEntity<TKey>
            where TKey : IEquatable<TKey>;

        /// <summary>
        /// Creates a unit of work
        /// </summary>
        IUnitOfWork CreateUnitOfWork();
    }

    /// <summary>
    /// Repository configuration options
    /// </summary>
    public class RepositoryOptions
    {
        public string ConnectionString { get; set; }
        public int CommandTimeout { get; set; } = 30;
        public bool EnableSensitiveDataLogging { get; set; } = false;
        public bool EnableRetryOnFailure { get; set; } = true;
        public int MaxRetryCount { get; set; } = 3;
        public TimeSpan MaxRetryDelay { get; set; } = TimeSpan.FromSeconds(30);
        public bool EnableQueryCache { get; set; } = true;
        public TimeSpan QueryCacheExpiration { get; set; } = TimeSpan.FromMinutes(10);
    }

    /// <summary>
    /// Query options for advanced scenarios
    /// </summary>
    public class QueryOptions
    {
        public bool AsNoTracking { get; set; } = false;
        public bool IgnoreQueryFilters { get; set; } = false;
        public string[] IncludeProperties { get; set; } = new string[0];
        public int? Take { get; set; }
        public int? Skip { get; set; }
    }

    /// <summary>
    /// Bulk operation options
    /// </summary>
    public class BulkOptions
    {
        public int BatchSize { get; set; } = 1000;
        public int TimeoutSeconds { get; set; } = 300;
        public bool EnableLogging { get; set; } = true;
        public bool UseTransaction { get; set; } = true;
    }
}