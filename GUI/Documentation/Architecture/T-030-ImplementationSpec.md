# T-030 Implementation Specification for GUI Module Executor

## Overview
This document provides concrete implementation specifications for the asynchronous data loading and caching system. Each section contains ready-to-implement code structures, interfaces, and integration points.

---

## Phase 1: Core Infrastructure Updates

### 1.1 Update ILogicEngineService Interface

**File:** `GUI/Services/ILogicEngineService.cs`

```csharp
public interface ILogicEngineService
{
    // Existing members...
    
    // New async loading methods
    Task<LoadingResult<T>> LoadDataTypeAsync<T>(
        string dataType,
        LoadingPriority priority = LoadingPriority.Primary,
        CancellationToken cancellationToken = default) where T : class;
    
    Task<bool> RefreshDataTypeAsync(
        string dataType,
        RefreshStrategy strategy = RefreshStrategy.Incremental,
        CancellationToken cancellationToken = default);
    
    Task<CacheStatistics> GetCacheStatisticsAsync();
    
    Task InvalidateCacheAsync(string dataType);
    
    // New events
    event EventHandler<DataLoadProgressEventArgs> DataLoadProgress;
    event EventHandler<CacheInvalidatedEventArgs> CacheInvalidated;
}
```

### 1.2 Enhance LogicEngineService with Async Loading

**File:** `GUI/Services/LogicEngineService.cs`

Add these private fields:
```csharp
private readonly MultiTierCacheService _cacheService;
private readonly AsyncDataLoadingService _asyncLoader;
private readonly SemaphoreSlim _loadSemaphore = new(3, 3);
private readonly ConcurrentDictionary<string, DateTime> _lastLoadTimes = new();
private readonly ConcurrentDictionary<string, Task> _activeLoadTasks = new();
```

Modify `LoadAllAsync` method:
```csharp
public override async Task<bool> LoadAllAsync()
{
    if (_isLoading) return false;
    
    _isLoading = true;
    var loadTimer = Stopwatch.StartNew();
    
    try
    {
        // Phase 1: Load critical hot-tier data (blocking)
        _logger.LogInformation("Phase 1: Loading critical data");
        await LoadCriticalDataAsync();
        
        // Fire event - dashboard ready
        DataLoaded?.Invoke(this, new DataLoadedEventArgs 
        { 
            Phase = "Critical",
            ElapsedMs = loadTimer.ElapsedMilliseconds 
        });
        
        // Phase 2: Start warm-tier loading (non-blocking)
        _logger.LogInformation("Phase 2: Starting background data load");
        var warmTask = LoadWarmDataAsync();
        _activeLoadTasks["warm"] = warmTask;
        
        // Phase 3: Register cold-tier providers
        RegisterColdDataProviders();
        
        // Don't wait for warm data to complete
        _ = warmTask.ContinueWith(t => 
        {
            _activeLoadTasks.TryRemove("warm", out _);
            if (t.IsFaulted)
            {
                _logger.LogError(t.Exception, "Warm data loading failed");
            }
        });
        
        _lastLoadTime = DateTime.UtcNow;
        return true;
    }
    finally
    {
        _isLoading = false;
        _logger.LogInformation("Data load completed in {ElapsedMs}ms", 
            loadTimer.ElapsedMilliseconds);
    }
}

private async Task LoadCriticalDataAsync()
{
    var tasks = new[]
    {
        LoadDataTypeInternalAsync("Users", LoadingPriority.Critical),
        LoadDataTypeInternalAsync("Groups", LoadingPriority.Critical),
        LoadDataTypeInternalAsync("Devices", LoadingPriority.Critical)
    };
    
    await Task.WhenAll(tasks);
}
```

### 1.3 Implement LoadDataTypeAsync Method

```csharp
public async Task<LoadingResult<T>> LoadDataTypeAsync<T>(
    string dataType,
    LoadingPriority priority = LoadingPriority.Primary,
    CancellationToken cancellationToken = default) where T : class
{
    // Check cache first
    var cacheKey = $"{dataType}:all";
    var cached = await _cacheService.GetOrCreateAsync<List<T>>(
        cacheKey,
        async () => await LoadFromCsvAsync<T>(dataType, cancellationToken),
        DetermineCacheTier(dataType),
        GetTTLForDataType(dataType)
    );
    
    if (cached != null)
    {
        return LoadingResult.Success(cached.Count, TimeSpan.Zero);
    }
    
    // Load from CSV if not cached
    var loadRequest = new LoadingRequest<T>
    {
        DataType = dataType,
        Priority = priority,
        DiscoverSourcesFunc = ct => DiscoverCsvSourcesAsync(dataType, ct),
        LoadChunkFunc = (source, size, ct) => LoadCsvChunkAsync<T>(source, size, ct),
        PostProcessFunc = (items, ct) => PostProcessItemsAsync(items, dataType, ct)
    };
    
    return await _asyncLoader.LoadAsync(loadRequest, cancellationToken);
}

private CacheTier DetermineCacheTier(string dataType)
{
    return dataType switch
    {
        "Users" or "Groups" or "Devices" => CacheTier.Hot,
        "Applications" or "Mailboxes" or "Infrastructure" => CacheTier.Warm,
        "FileServers" or "Databases" or "GPOs" => CacheTier.Cold,
        _ => CacheTier.Warm
    };
}

private TimeSpan GetTTLForDataType(string dataType)
{
    return dataType switch
    {
        "Users" or "Groups" => TimeSpan.FromMinutes(30),
        "Devices" or "Applications" => TimeSpan.FromMinutes(45),
        "Infrastructure" or "Mailboxes" => TimeSpan.FromMinutes(60),
        _ => TimeSpan.FromMinutes(120)
    };
}
```

---

## Phase 2: CsvDataServiceNew Async Enhancement

### 2.1 Add Streaming Support

**File:** `GUI/Services/CsvDataServiceNew.cs`

Add new methods:
```csharp
public async IAsyncEnumerable<T> StreamCsvAsync<T>(
    string pattern,
    Func<Dictionary<string, string>, T> mapper,
    [EnumeratorCancellation] CancellationToken cancellationToken = default) 
    where T : class
{
    var files = FindFiles(_activeProfilePath, pattern);
    
    foreach (var file in files)
    {
        await foreach (var item in StreamFileInternalAsync(file, mapper, cancellationToken)
            .WithCancellation(cancellationToken))
        {
            yield return item;
        }
    }
}

private async IAsyncEnumerable<T> StreamFileInternalAsync<T>(
    string filePath,
    Func<Dictionary<string, string>, T> mapper,
    [EnumeratorCancellation] CancellationToken cancellationToken) 
    where T : class
{
    await _fileSemaphore.WaitAsync(cancellationToken);
    try
    {
        using var fileStream = new FileStream(
            filePath, 
            FileMode.Open, 
            FileAccess.Read, 
            FileShare.ReadWrite,
            bufferSize: 131072, // 128KB buffer
            useAsync: true);
            
        using var reader = new StreamReader(fileStream, Encoding.UTF8, true, 131072);
        
        // Read and parse header
        var headerLine = await reader.ReadLineAsync();
        if (string.IsNullOrEmpty(headerLine)) yield break;
        
        var headers = ParseCsvLine(headerLine);
        var columnIndices = BuildColumnIndexMap(headers);
        
        // Stream data rows
        while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var values = ParseCsvLine(line);
            var rowData = MapToRowData(headers, values);
            
            var item = mapper(rowData);
            if (item != null)
            {
                yield return item;
            }
        }
    }
    finally
    {
        _fileSemaphore.Release();
    }
}

public async Task<LoadingResult<T>> LoadBatchAsync<T>(
    string pattern,
    int batchSize,
    Func<List<T>, Task> processor,
    CancellationToken cancellationToken = default) 
    where T : class
{
    var totalItems = 0;
    var batch = new List<T>(batchSize);
    var stopwatch = Stopwatch.StartNew();
    
    await foreach (var item in StreamCsvAsync<T>(pattern, MapToEntity<T>, cancellationToken))
    {
        batch.Add(item);
        totalItems++;
        
        if (batch.Count >= batchSize)
        {
            await processor(batch);
            batch.Clear();
        }
    }
    
    // Process remaining items
    if (batch.Count > 0)
    {
        await processor(batch);
    }
    
    return LoadingResult.Success(totalItems, stopwatch.Elapsed);
}
```

### 2.2 Add Change Detection

```csharp
public async Task<DeltaDetectionResult> DetectChangesAsync(
    string filePath,
    DateTime lastCheckTime,
    CancellationToken cancellationToken = default)
{
    var fileInfo = new FileInfo(filePath);
    if (!fileInfo.Exists)
    {
        return new DeltaDetectionResult { IsDeleted = true };
    }
    
    if (fileInfo.LastWriteTimeUtc <= lastCheckTime)
    {
        return new DeltaDetectionResult { HasChanges = false };
    }
    
    // Quick hash check for small files
    if (fileInfo.Length < 10 * 1024 * 1024) // < 10MB
    {
        var currentHash = await ComputeFileHashAsync(filePath, cancellationToken);
        var cachedHash = _fileHashCache.GetValueOrDefault(filePath);
        
        if (currentHash == cachedHash)
        {
            return new DeltaDetectionResult { HasChanges = false };
        }
        
        _fileHashCache[filePath] = currentHash;
    }
    
    // For larger files, use row count and sampling
    var rowCount = await GetRowCountAsync(filePath, cancellationToken);
    var cachedCount = _rowCountCache.GetValueOrDefault(filePath);
    
    return new DeltaDetectionResult
    {
        HasChanges = true,
        IsIncremental = Math.Abs(rowCount - cachedCount) < 100,
        AddedRows = Math.Max(0, rowCount - cachedCount),
        RemovedRows = Math.Max(0, cachedCount - rowCount)
    };
}
```

---

## Phase 3: File Watcher Integration

### 3.1 Enhanced OptimizedCsvFileWatcherService

**File:** `GUI/Services/OptimizedCsvFileWatcherService.cs`

Add cache invalidation logic:
```csharp
private async Task ProcessFileChangeAsync(string filePath, string dataType)
{
    try
    {
        // Debounce check
        if (!ShouldProcessChange(filePath)) return;
        
        // Detect type of change
        var deltaResult = await _csvService.DetectChangesAsync(
            filePath, 
            _lastProcessed[filePath]);
        
        if (!deltaResult.HasChanges) return;
        
        // Determine invalidation strategy
        if (deltaResult.IsIncremental && deltaResult.AddedRows < 1000)
        {
            // Incremental update
            await _logicEngine.RefreshDataTypeAsync(
                dataType, 
                RefreshStrategy.Incremental);
        }
        else
        {
            // Full invalidation
            await _logicEngine.InvalidateCacheAsync(dataType);
            
            // Trigger reload if it's hot/warm data
            if (IsHighPriorityDataType(dataType))
            {
                _ = Task.Run(async () => 
                {
                    await Task.Delay(1000); // Brief delay
                    await _logicEngine.LoadDataTypeAsync<object>(
                        dataType, 
                        LoadingPriority.Primary);
                });
            }
        }
        
        // Update tracking
        _lastProcessed[filePath] = DateTime.UtcNow;
        
        // Notify UI
        DataChanged?.Invoke(this, new OptimizedDataChangeEventArgs
        {
            DataType = dataType,
            FilePath = filePath,
            ChangeType = deltaResult.IsIncremental ? "Incremental" : "Full",
            Timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error processing file change for {FilePath}", filePath);
    }
}

private bool IsHighPriorityDataType(string dataType)
{
    return dataType switch
    {
        "Users" or "Groups" or "Devices" => true,
        "Applications" or "Mailboxes" => true,
        _ => false
    };
}
```

---

## Phase 4: ViewModel Integration

### 4.1 Base ViewModel Enhancement

**File:** `GUI/ViewModels/BaseViewModel.cs`

```csharp
public abstract class BaseViewModel : INotifyPropertyChanged
{
    protected readonly ILogicEngineService _logicEngine;
    private readonly Dictionary<string, CancellationTokenSource> _loadingTokens = new();
    
    protected async Task<T> LoadDataAsync<T>(
        string dataType,
        Action<T> onSuccess = null,
        Action<Exception> onError = null) where T : class
    {
        // Cancel any existing load for this data type
        if (_loadingTokens.TryGetValue(dataType, out var existingCts))
        {
            existingCts.Cancel();
        }
        
        var cts = new CancellationTokenSource();
        _loadingTokens[dataType] = cts;
        
        try
        {
            IsLoading = true;
            LoadingMessage = $"Loading {dataType}...";
            
            var result = await _logicEngine.LoadDataTypeAsync<T>(
                dataType,
                LoadingPriority.Primary,
                cts.Token);
            
            if (result.IsSuccess && !cts.Token.IsCancellationRequested)
            {
                onSuccess?.Invoke(result.Data);
                LoadingMessage = null;
            }
        }
        catch (OperationCanceledException)
        {
            // Cancelled, ignore
        }
        catch (Exception ex)
        {
            onError?.Invoke(ex);
            ShowError($"Failed to load {dataType}: {ex.Message}");
        }
        finally
        {
            _loadingTokens.Remove(dataType);
            IsLoading = _loadingTokens.Count > 0;
        }
    }
    
    protected virtual void OnDataInvalidated(string dataType)
    {
        // Override in derived classes to handle cache invalidation
        _ = LoadDataAsync<object>(dataType);
    }
}
```

### 4.2 Example ViewModel Implementation

**File:** `GUI/ViewModels/UsersViewModel.cs`

```csharp
public class UsersViewModel : BaseViewModel
{
    private ObservableCollection<UserProjection> _users;
    private bool _isInitialLoadComplete;
    
    public ObservableCollection<UserProjection> Users
    {
        get => _users;
        set => SetProperty(ref _users, value);
    }
    
    public async Task InitializeAsync()
    {
        if (_isInitialLoadComplete) return;
        
        // Subscribe to cache invalidation
        _logicEngine.CacheInvalidated += OnCacheInvalidated;
        
        // Load users asynchronously
        await LoadDataAsync<List<UserDto>>(
            "Users",
            onSuccess: users =>
            {
                var projections = users.Select(u => CreateProjection(u));
                Users = new ObservableCollection<UserProjection>(projections);
                _isInitialLoadComplete = true;
            }
        );
    }
    
    private void OnCacheInvalidated(object sender, CacheInvalidatedEventArgs e)
    {
        if (e.DataType == "Users")
        {
            Application.Current.Dispatcher.InvokeAsync(async () =>
            {
                await RefreshUsersAsync();
            });
        }
    }
    
    private async Task RefreshUsersAsync()
    {
        var result = await _logicEngine.RefreshDataTypeAsync(
            "Users",
            RefreshStrategy.Incremental);
            
        if (result)
        {
            // Incremental update succeeded
            ShowNotification("User data refreshed");
        }
    }
}
```

---

## Phase 5: Configuration

### 5.1 Add Configuration File

**File:** `GUI/Configuration/CacheSettings.json`

```json
{
  "CacheConfiguration": {
    "Enabled": true,
    "DefaultTTLMinutes": 60,
    "MaxMemoryMB": 2048,
    "EnableCompression": true,
    "EnableFileWatcher": true,
    "Tiers": {
      "Hot": {
        "MaxItems": 10000,
        "MaxSizeMB": 100,
        "TTLMinutes": 30
      },
      "Warm": {
        "MaxItems": 50000,
        "MaxSizeMB": 500,
        "TTLMinutes": 60
      },
      "Cold": {
        "MaxItems": 200000,
        "MaxSizeMB": 2000,
        "TTLMinutes": 120,
        "CompressionEnabled": true
      }
    },
    "DataTypeSettings": {
      "Users": {
        "Tier": "Hot",
        "PreloadOnStartup": true,
        "EnableStreaming": false,
        "BatchSize": 1000
      },
      "Groups": {
        "Tier": "Hot",
        "PreloadOnStartup": true,
        "EnableStreaming": false,
        "BatchSize": 500
      },
      "Devices": {
        "Tier": "Warm",
        "PreloadOnStartup": false,
        "EnableStreaming": true,
        "BatchSize": 2000
      },
      "Applications": {
        "Tier": "Warm",
        "PreloadOnStartup": false,
        "EnableStreaming": true,
        "BatchSize": 5000
      }
    },
    "Performance": {
      "MaxConcurrentCsvReads": 3,
      "MaxConcurrentCacheOps": 10,
      "FileReadBufferKB": 128,
      "StreamingBatchSize": 100
    }
  }
}
```

### 5.2 Configuration Service

**File:** `GUI/Services/CacheConfigurationService.cs`

```csharp
public class CacheConfigurationService
{
    private readonly CacheConfiguration _config;
    
    public CacheConfigurationService(string configPath = null)
    {
        configPath ??= Path.Combine(AppDomain.CurrentDomain.BaseDirectory, 
            "Configuration", "CacheSettings.json");
            
        var json = File.ReadAllText(configPath);
        _config = JsonSerializer.Deserialize<CacheConfiguration>(json);
    }
    
    public CacheTier GetTierForDataType(string dataType)
    {
        if (_config.DataTypeSettings.TryGetValue(dataType, out var settings))
        {
            return Enum.Parse<CacheTier>(settings.Tier);
        }
        return CacheTier.Warm;
    }
    
    public bool ShouldPreload(string dataType)
    {
        return _config.DataTypeSettings
            .GetValueOrDefault(dataType)?.PreloadOnStartup ?? false;
    }
    
    public int GetBatchSize(string dataType)
    {
        return _config.DataTypeSettings
            .GetValueOrDefault(dataType)?.BatchSize ?? 1000;
    }
}
```

---

## Testing Requirements

### Unit Tests Required

1. **CacheService Tests**
   - Test tier promotion/demotion
   - Test eviction under memory pressure
   - Test TTL expiration
   - Test compression/decompression

2. **AsyncLoader Tests**
   - Test concurrent loading
   - Test cancellation
   - Test circuit breaker
   - Test memory pressure handling

3. **FileWatcher Tests**
   - Test debouncing
   - Test delta detection
   - Test invalidation cascading

### Integration Tests Required

1. **End-to-End Loading**
   - Load 50,000 users without blocking UI
   - Verify cache hit rates
   - Test memory usage stays under limits

2. **File Change Handling**
   - Modify CSV files while app is running
   - Verify incremental updates work
   - Test full invalidation scenarios

3. **Performance Tests**
   - Measure initial load time
   - Measure cache retrieval time
   - Test under memory pressure

---

## Deployment Checklist

1. [ ] Update `LogicEngineService` with async methods
2. [ ] Enhance `CsvDataServiceNew` with streaming
3. [ ] Integrate `MultiTierCacheService`
4. [ ] Update `OptimizedCsvFileWatcherService`
5. [ ] Modify ViewModels to use async loading
6. [ ] Add configuration files
7. [ ] Update dependency injection registration
8. [ ] Add telemetry and logging
9. [ ] Create unit tests
10. [ ] Perform integration testing
11. [ ] Document API changes
12. [ ] Update user documentation

---

*Implementation Specification Version: 1.0*  
*Date: 2025-01-08*  
*Author: Architecture Lead*  
*For: GUI Module Executor*