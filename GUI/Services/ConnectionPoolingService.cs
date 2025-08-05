using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using System.Net.Http;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing connection pools to optimize resource usage and performance
    /// </summary>
    public class ConnectionPoolingService : IDisposable
    {
        private readonly ILogger<ConnectionPoolingService> _logger;
        private readonly NotificationService _notificationService;
        private readonly ConcurrentDictionary<string, ConnectionPool> _connectionPools;
        private readonly Timer _maintenanceTimer;
        private readonly object _lockObject = new object();
        
        private readonly ConnectionPoolConfiguration _configuration;
        private bool _disposed;

        public ConnectionPoolingService(
            ILogger<ConnectionPoolingService> logger = null,
            NotificationService notificationService = null)
        {
            _logger = logger;
            _notificationService = notificationService;
            _connectionPools = new ConcurrentDictionary<string, ConnectionPool>();
            _configuration = new ConnectionPoolConfiguration();
            
            // Run maintenance every 30 seconds
            _maintenanceTimer = new Timer(PerformMaintenance, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));
            
            _logger?.LogInformation("Connection pooling service initialized");
        }

        #region Public Properties

        /// <summary>
        /// Gets the count of active connection pools
        /// </summary>
        public int PoolCount => _connectionPools.Count;

        /// <summary>
        /// Gets the total number of connections across all pools
        /// </summary>
        public int TotalConnections => _connectionPools.Values.Sum(pool => pool.TotalConnections);

        /// <summary>
        /// Gets the total number of active connections
        /// </summary>
        public int ActiveConnections => _connectionPools.Values.Sum(pool => pool.ActiveConnections);

        /// <summary>
        /// Gets the total number of idle connections
        /// </summary>
        public int IdleConnections => _connectionPools.Values.Sum(pool => pool.IdleConnections);

        #endregion

        #region Events

        /// <summary>
        /// Raised when a connection pool is created
        /// </summary>
        public event Action<string> OnPoolCreated;

        /// <summary>
        /// Raised when a connection pool is destroyed
        /// </summary>
        public event Action<string> OnPoolDestroyed;

        /// <summary>
        /// Raised when pool statistics are updated
        /// </summary>
        public event Action<ConnectionPoolingStats> OnPoolStatsUpdated;

        #endregion

        #region Public Methods

        /// <summary>
        /// Gets or creates a connection pool for the specified endpoint
        /// </summary>
        public async Task<IPooledConnection> GetConnectionAsync(string endpoint, ConnectionType connectionType = ConnectionType.Http)
        {
            if (string.IsNullOrEmpty(endpoint))
                throw new ArgumentException("Endpoint cannot be null or empty", nameof(endpoint));

            try
            {
                var poolKey = GetPoolKey(endpoint, connectionType);
                var pool = _connectionPools.GetOrAdd(poolKey, key => CreateConnectionPool(endpoint, connectionType));
                
                return await pool.GetConnectionAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting connection for endpoint: {Endpoint}", endpoint);
                throw;
            }
        }

        /// <summary>
        /// Returns a connection to its pool
        /// </summary>
        public void ReturnConnection(IPooledConnection connection)
        {
            if (connection?.Pool != null)
            {
                connection.Pool.ReturnConnection(connection);
            }
        }

        /// <summary>
        /// Creates a Microsoft Graph client with connection pooling
        /// </summary>
        public async Task<GraphServiceClient> GetGraphClientAsync(string tenantId, string clientId, string clientSecret)
        {
            try
            {
                var endpoint = $"graph://{tenantId}";
                var connection = await GetConnectionAsync(endpoint, ConnectionType.Graph);
                
                if (connection is GraphPooledConnection graphConnection)
                {
                    return graphConnection.GraphClient;
                }
                
                // Fallback: create new client
                return CreateGraphClient(tenantId, clientId, clientSecret);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting Graph client for tenant: {TenantId}", tenantId);
                return CreateGraphClient(tenantId, clientId, clientSecret);
            }
        }

        /// <summary>
        /// Creates an HTTP client with connection pooling
        /// </summary>
        public async Task<HttpClient> GetHttpClientAsync(string baseAddress = null)
        {
            try
            {
                var endpoint = baseAddress ?? "http://default";
                var connection = await GetConnectionAsync(endpoint, ConnectionType.Http);
                
                if (connection is HttpPooledConnection httpConnection)
                {
                    return httpConnection.HttpClient;
                }
                
                // Fallback: create new client
                return new HttpClient();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting HTTP client for endpoint: {BaseAddress}", baseAddress);
                return new HttpClient();
            }
        }

        /// <summary>
        /// Gets statistics for all connection pools
        /// </summary>
        public ConnectionPoolingStats GetStatistics()
        {
            try
            {
                var stats = new ConnectionPoolingStats
                {
                    Timestamp = DateTime.UtcNow,
                    TotalPools = _connectionPools.Count,
                    TotalConnections = TotalConnections,
                    ActiveConnections = ActiveConnections,
                    IdleConnections = IdleConnections,
                    PoolStats = new List<ConnectionPoolStats>()
                };

                foreach (var kvp in _connectionPools)
                {
                    var poolStats = kvp.Value.GetStatistics();
                    poolStats.PoolKey = kvp.Key;
                    stats.PoolStats.Add(poolStats);
                }

                return stats;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting pooling statistics");
                return new ConnectionPoolingStats { Timestamp = DateTime.UtcNow };
            }
        }

        /// <summary>
        /// Gets statistics for a specific pool
        /// </summary>
        public ConnectionPoolStats GetPoolStatistics(string endpoint, ConnectionType connectionType = ConnectionType.Http)
        {
            try
            {
                var poolKey = GetPoolKey(endpoint, connectionType);
                if (_connectionPools.TryGetValue(poolKey, out var pool))
                {
                    var stats = pool.GetStatistics();
                    stats.PoolKey = poolKey;
                    return stats;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting pool statistics for: {Endpoint}", endpoint);
            }

            return new ConnectionPoolStats { PoolKey = GetPoolKey(endpoint, connectionType) };
        }

        /// <summary>
        /// Clears idle connections from all pools
        /// </summary>
        public async Task ClearIdleConnectionsAsync()
        {
            try
            {
                var clearTasks = _connectionPools.Values.Select(pool => pool.ClearIdleConnectionsAsync());
                await Task.WhenAll(clearTasks);
                
                _logger?.LogDebug("Cleared idle connections from all pools");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error clearing idle connections");
            }
        }

        /// <summary>
        /// Destroys a connection pool
        /// </summary>
        public async Task DestroyPoolAsync(string endpoint, ConnectionType connectionType = ConnectionType.Http)
        {
            try
            {
                var poolKey = GetPoolKey(endpoint, connectionType);
                if (_connectionPools.TryRemove(poolKey, out var pool))
                {
                    await pool.DisposeAsync();
                    OnPoolDestroyed?.Invoke(poolKey);
                    _logger?.LogDebug("Destroyed connection pool: {PoolKey}", poolKey);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error destroying pool for endpoint: {Endpoint}", endpoint);
            }
        }

        /// <summary>
        /// Sets connection pool configuration
        /// </summary>
        public void SetConfiguration(ConnectionPoolConfiguration configuration)
        {
            if (configuration == null)
                throw new ArgumentNullException(nameof(configuration));

            lock (_lockObject)
            {
                _configuration.MaxPoolSize = configuration.MaxPoolSize;
                _configuration.MinPoolSize = configuration.MinPoolSize;
                _configuration.ConnectionTimeout = configuration.ConnectionTimeout;
                _configuration.IdleTimeout = configuration.IdleTimeout;
                _configuration.MaxIdleTime = configuration.MaxIdleTime;
                _configuration.EnableConnectionValidation = configuration.EnableConnectionValidation;
                _configuration.ValidationInterval = configuration.ValidationInterval;
            }

            _logger?.LogDebug("Updated connection pool configuration");
        }

        #endregion

        #region Private Methods

        private string GetPoolKey(string endpoint, ConnectionType connectionType)
        {
            return $"{connectionType}:{endpoint}";
        }

        private ConnectionPool CreateConnectionPool(string endpoint, ConnectionType connectionType)
        {
            var pool = new ConnectionPool(endpoint, connectionType, _configuration, _logger);
            OnPoolCreated?.Invoke(GetPoolKey(endpoint, connectionType));
            _logger?.LogDebug("Created connection pool for: {Endpoint} ({Type})", endpoint, connectionType);
            return pool;
        }

        private GraphServiceClient CreateGraphClient(string tenantId, string clientId, string clientSecret)
        {
            try
            {
                // This is a simplified implementation
                // In a real application, you would configure proper authentication
                return new GraphServiceClient(new HttpClient());
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating Graph client");
                throw;
            }
        }

        private void PerformMaintenance(object state)
        {
            try
            {
                var maintenanceTasks = _connectionPools.Values.Select(pool => pool.PerformMaintenanceAsync());
                Task.WhenAll(maintenanceTasks).Wait();
                
                // Update statistics
                var stats = GetStatistics();
                OnPoolStatsUpdated?.Invoke(stats);
                
                _logger?.LogDebug("Performed connection pool maintenance");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during connection pool maintenance");
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    _maintenanceTimer?.Dispose();
                    
                    var disposeTasks = _connectionPools.Values.Select(pool => pool.DisposeAsync().AsTask());
                    Task.WhenAll(disposeTasks).Wait();
                    
                    _connectionPools.Clear();
                    
                    _logger?.LogInformation("Connection pooling service disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing connection pooling service");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }

        #endregion
    }

    #region Connection Pool Implementation

    /// <summary>
    /// Individual connection pool for a specific endpoint
    /// </summary>
    public class ConnectionPool : IAsyncDisposable
    {
        private readonly string _endpoint;
        private readonly ConnectionType _connectionType;
        private readonly ConnectionPoolConfiguration _configuration;
        private readonly ILogger _logger;
        private readonly ConcurrentQueue<IPooledConnection> _idleConnections;
        private readonly ConcurrentDictionary<string, IPooledConnection> _activeConnections;
        private readonly SemaphoreSlim _connectionSemaphore;
        private readonly object _lockObject = new object();
        
        private int _totalConnections;
        private DateTime _lastMaintenanceTime;
        private bool _disposed;

        public ConnectionPool(string endpoint, ConnectionType connectionType, ConnectionPoolConfiguration configuration, ILogger logger)
        {
            _endpoint = endpoint;
            _connectionType = connectionType;
            _configuration = configuration;
            _logger = logger;
            _idleConnections = new ConcurrentQueue<IPooledConnection>();
            _activeConnections = new ConcurrentDictionary<string, IPooledConnection>();
            _connectionSemaphore = new SemaphoreSlim(configuration.MaxPoolSize, configuration.MaxPoolSize);
            _lastMaintenanceTime = DateTime.UtcNow;
        }

        public int TotalConnections => _totalConnections;
        public int ActiveConnections => _activeConnections.Count;
        public int IdleConnections => _idleConnections.Count;

        public async Task<IPooledConnection> GetConnectionAsync()
        {
            await _connectionSemaphore.WaitAsync();

            try
            {
                // Try to get an idle connection first
                if (_idleConnections.TryDequeue(out var idleConnection))
                {
                    if (idleConnection.IsValid)
                    {
                        idleConnection.LastUsed = DateTime.UtcNow;
                        _activeConnections.TryAdd(idleConnection.Id, idleConnection);
                        return idleConnection;
                    }
                    else
                    {
                        // Connection is invalid, dispose it
                        idleConnection.Dispose();
                        Interlocked.Decrement(ref _totalConnections);
                    }
                }

                // Create new connection if under limit
                if (_totalConnections < _configuration.MaxPoolSize)
                {
                    var newConnection = await CreateConnectionAsync();
                    _activeConnections.TryAdd(newConnection.Id, newConnection);
                    Interlocked.Increment(ref _totalConnections);
                    return newConnection;
                }

                // Pool is full, wait and retry
                _connectionSemaphore.Release();
                await Task.Delay(100); // Brief delay before retry
                return await GetConnectionAsync();
            }
            catch
            {
                _connectionSemaphore.Release();
                throw;
            }
        }

        public void ReturnConnection(IPooledConnection connection)
        {
            if (connection == null || _disposed)
                return;

            try
            {
                _activeConnections.TryRemove(connection.Id, out _);

                if (connection.IsValid && !_disposed)
                {
                    connection.LastUsed = DateTime.UtcNow;
                    _idleConnections.Enqueue(connection);
                }
                else
                {
                    connection.Dispose();
                    Interlocked.Decrement(ref _totalConnections);
                }

                _connectionSemaphore.Release();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error returning connection to pool");
            }
        }

        public async Task ClearIdleConnectionsAsync()
        {
            try
            {
                var connectionsToDispose = new List<IPooledConnection>();

                // Collect all idle connections
                while (_idleConnections.TryDequeue(out var connection))
                {
                    connectionsToDispose.Add(connection);
                }

                // Dispose them
                foreach (var connection in connectionsToDispose)
                {
                    connection.Dispose();
                    Interlocked.Decrement(ref _totalConnections);
                }

                _logger?.LogDebug("Cleared {Count} idle connections from pool: {Endpoint}", 
                    connectionsToDispose.Count, _endpoint);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error clearing idle connections from pool: {Endpoint}", _endpoint);
            }
        }

        public async Task PerformMaintenanceAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                var connectionsToRemove = new List<IPooledConnection>();

                // Check idle connections for expiration
                var idleConnections = new List<IPooledConnection>();
                while (_idleConnections.TryDequeue(out var connection))
                {
                    if (now - connection.LastUsed > _configuration.MaxIdleTime || !connection.IsValid)
                    {
                        connectionsToRemove.Add(connection);
                    }
                    else
                    {
                        idleConnections.Add(connection);
                    }
                }

                // Re-queue valid idle connections
                foreach (var connection in idleConnections)
                {
                    _idleConnections.Enqueue(connection);
                }

                // Dispose expired connections
                foreach (var connection in connectionsToRemove)
                {
                    connection.Dispose();
                    Interlocked.Decrement(ref _totalConnections);
                }

                // Ensure minimum pool size
                await EnsureMinimumPoolSizeAsync();

                _lastMaintenanceTime = now;

                if (connectionsToRemove.Count > 0)
                {
                    _logger?.LogDebug("Removed {Count} expired connections from pool: {Endpoint}", 
                        connectionsToRemove.Count, _endpoint);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during pool maintenance: {Endpoint}", _endpoint);
            }
        }

        public ConnectionPoolStats GetStatistics()
        {
            return new ConnectionPoolStats
            {
                Endpoint = _endpoint,
                ConnectionType = _connectionType,
                TotalConnections = _totalConnections,
                ActiveConnections = _activeConnections.Count,
                IdleConnections = _idleConnections.Count,
                MaxPoolSize = _configuration.MaxPoolSize,
                MinPoolSize = _configuration.MinPoolSize,
                LastMaintenanceTime = _lastMaintenanceTime
            };
        }

        private async Task<IPooledConnection> CreateConnectionAsync()
        {
            try
            {
                return _connectionType switch
                {
                    ConnectionType.Http => new HttpPooledConnection(_endpoint, this),
                    ConnectionType.Graph => new GraphPooledConnection(_endpoint, this),
                    ConnectionType.Database => new DatabasePooledConnection(_endpoint, this),
                    _ => throw new NotSupportedException($"Connection type {_connectionType} not supported")
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating connection for endpoint: {Endpoint}", _endpoint);
                throw;
            }
        }

        private async Task EnsureMinimumPoolSizeAsync()
        {
            try
            {
                while (_totalConnections < _configuration.MinPoolSize)
                {
                    var connection = await CreateConnectionAsync();
                    _idleConnections.Enqueue(connection);
                    Interlocked.Increment(ref _totalConnections);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error ensuring minimum pool size for: {Endpoint}", _endpoint);
            }
        }

        public async ValueTask DisposeAsync()
        {
            if (!_disposed)
            {
                _disposed = true;

                try
                {
                    // Dispose all active connections
                    foreach (var connection in _activeConnections.Values)
                    {
                        connection.Dispose();
                    }
                    _activeConnections.Clear();

                    // Dispose all idle connections
                    while (_idleConnections.TryDequeue(out var connection))
                    {
                        connection.Dispose();
                    }

                    _connectionSemaphore?.Dispose();
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing connection pool: {Endpoint}", _endpoint);
                }
            }
        }
    }

    #endregion

    #region Connection Implementations

    /// <summary>
    /// Base interface for pooled connections
    /// </summary>
    public interface IPooledConnection : IDisposable
    {
        string Id { get; }
        DateTime Created { get; }
        DateTime LastUsed { get; set; }
        bool IsValid { get; }
        ConnectionPool Pool { get; }
    }

    /// <summary>
    /// HTTP pooled connection
    /// </summary>
    public class HttpPooledConnection : IPooledConnection
    {
        public string Id { get; }
        public DateTime Created { get; }
        public DateTime LastUsed { get; set; }
        public bool IsValid => HttpClient != null && !_disposed;
        public ConnectionPool Pool { get; }
        public HttpClient HttpClient { get; private set; }

        private bool _disposed;

        public HttpPooledConnection(string endpoint, ConnectionPool pool)
        {
            Id = Guid.NewGuid().ToString();
            Created = DateTime.UtcNow;
            LastUsed = DateTime.UtcNow;
            Pool = pool;
            
            HttpClient = new HttpClient();
            if (!string.IsNullOrEmpty(endpoint) && Uri.TryCreate(endpoint, UriKind.Absolute, out var uri))
            {
                HttpClient.BaseAddress = uri;
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                HttpClient?.Dispose();
                HttpClient = null;
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Microsoft Graph pooled connection
    /// </summary>
    public class GraphPooledConnection : IPooledConnection
    {
        public string Id { get; }
        public DateTime Created { get; }
        public DateTime LastUsed { get; set; }
        public bool IsValid => GraphClient != null && !_disposed;
        public ConnectionPool Pool { get; }
        public GraphServiceClient GraphClient { get; private set; }

        private bool _disposed;

        public GraphPooledConnection(string endpoint, ConnectionPool pool)
        {
            Id = Guid.NewGuid().ToString();
            Created = DateTime.UtcNow;
            LastUsed = DateTime.UtcNow;
            Pool = pool;
            
            // Simplified Graph client creation
            GraphClient = new GraphServiceClient(new HttpClient());
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                GraphClient?.Dispose();
                GraphClient = null;
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Database pooled connection
    /// </summary>
    public class DatabasePooledConnection : IPooledConnection
    {
        public string Id { get; }
        public DateTime Created { get; }
        public DateTime LastUsed { get; set; }
        public bool IsValid => !_disposed;
        public ConnectionPool Pool { get; }

        private bool _disposed;

        public DatabasePooledConnection(string connectionString, ConnectionPool pool)
        {
            Id = Guid.NewGuid().ToString();
            Created = DateTime.UtcNow;
            LastUsed = DateTime.UtcNow;
            Pool = pool;
            
            // Database connection implementation would go here
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                // Close database connection
                _disposed = true;
            }
        }
    }

    #endregion

    #region Support Classes

    /// <summary>
    /// Connection pool configuration
    /// </summary>
    public class ConnectionPoolConfiguration
    {
        public int MaxPoolSize { get; set; } = 10;
        public int MinPoolSize { get; set; } = 2;
        public TimeSpan ConnectionTimeout { get; set; } = TimeSpan.FromSeconds(30);
        public TimeSpan IdleTimeout { get; set; } = TimeSpan.FromMinutes(5);
        public TimeSpan MaxIdleTime { get; set; } = TimeSpan.FromMinutes(10);
        public bool EnableConnectionValidation { get; set; } = true;
        public TimeSpan ValidationInterval { get; set; } = TimeSpan.FromMinutes(1);
    }

    /// <summary>
    /// Connection types
    /// </summary>
    public enum ConnectionType
    {
        Http,
        Graph,
        Database
    }

    /// <summary>
    /// Connection pool statistics
    /// </summary>
    public class ConnectionPoolStats
    {
        public string PoolKey { get; set; }
        public string Endpoint { get; set; }
        public ConnectionType ConnectionType { get; set; }
        public int TotalConnections { get; set; }
        public int ActiveConnections { get; set; }
        public int IdleConnections { get; set; }
        public int MaxPoolSize { get; set; }
        public int MinPoolSize { get; set; }
        public DateTime LastMaintenanceTime { get; set; }
    }

    /// <summary>
    /// Overall pooling statistics
    /// </summary>
    public class ConnectionPoolingStats
    {
        public DateTime Timestamp { get; set; }
        public int TotalPools { get; set; }
        public int TotalConnections { get; set; }
        public int ActiveConnections { get; set; }
        public int IdleConnections { get; set; }
        public List<ConnectionPoolStats> PoolStats { get; set; } = new List<ConnectionPoolStats>();
    }

    #endregion
}