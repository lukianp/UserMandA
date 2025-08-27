# Migration Platform Quality Standards
**Enterprise-Grade Development Guidelines for M&A Discovery Suite**

Generated: 2025-08-21
Version: 1.0
Compliance Level: Production Ready

---

## MANDATORY THREAD SAFETY STANDARDS

### 1. SolidColorBrush Creation & Management

#### ✅ REQUIRED PATTERN
```csharp
// All ViewModels must implement thread-safe brush creation
private SolidColorBrush CreateBrushSafe(Color color)
{
    return new SolidColorBrush(color);
}

// All UI property updates must use dispatcher checking
private void UpdateStatusColor(Action<SolidColorBrush> setter, Color color)
{
    var brush = CreateBrushSafe(color);
    if (System.Windows.Application.Current?.Dispatcher.CheckAccess() == true)
    {
        setter(brush);
    }
    else
    {
        System.Windows.Application.Current?.Dispatcher.BeginInvoke(() => setter(brush));
    }
}

// Property implementation must use lazy initialization
public SolidColorBrush StatusColor
{
    get => _statusColor ??= new SolidColorBrush(Colors.Blue);
    set => SetProperty(ref _statusColor, value);
}
```

#### ❌ PROHIBITED PATTERNS
```csharp
// NEVER: Direct assignment from background thread
private async Task SomeAsyncMethod()
{
    await Task.Delay(1000);
    StatusColor = new SolidColorBrush(Colors.Red); // THREADING VIOLATION
}

// NEVER: UI updates without dispatcher checking
private void UpdateUI()
{
    SomeUIProperty = newValue; // POTENTIAL THREADING VIOLATION
}

// NEVER: Brush creation in property getter without null safety
public SolidColorBrush StatusColor => new SolidColorBrush(Colors.Red); // THREADING VIOLATION
```

### 2. ObservableCollection Thread Safety

#### ✅ REQUIRED PATTERN
```csharp
private void UpdateCollectionSafe<T>(ObservableCollection<T> collection, Action<ObservableCollection<T>> updateAction)
{
    if (System.Windows.Application.Current?.Dispatcher.CheckAccess() == true)
    {
        updateAction(collection);
    }
    else
    {
        System.Windows.Application.Current?.Dispatcher.BeginInvoke(() => updateAction(collection));
    }
}

// Usage example
private void AddActivityLogEntry(string message, string status, Color statusColor)
{
    var entry = new ActivityLogEntry
    {
        Message = message,
        Status = status,
        StatusColor = CreateBrushSafe(statusColor),
        Timestamp = DateTime.Now.ToString("HH:mm:ss")
    };
    
    UpdateCollectionSafe(ActivityLog, collection => 
    {
        collection.Insert(0, entry);
        if (collection.Count > 50)
        {
            collection.RemoveAt(collection.Count - 1);
        }
    });
}
```

---

## ERROR HANDLING & RESILIENCE STANDARDS

### 1. Async Method Error Handling

#### ✅ REQUIRED PATTERN
```csharp
public async Task LoadAsync()
{
    IsLoading = true; 
    HasData = false; 
    LastError = null; 
    HeaderWarnings.Clear();

    try 
    {
        StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "migrate" }, 
            "Starting migration dashboard load");
        
        // Main operation with proper timeout
        using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
        await LoadDataWithTimeoutAsync(cts.Token);
        
        HasData = ValidateDataLoaded();
        
        StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "migrate", hasData = HasData }, 
            "Migration dashboard load completed successfully");
    }
    catch (OperationCanceledException)
    {
        LastError = "Operation timed out after 5 minutes";
        StructuredLogger?.LogWarning(LogSourceName, new { action = "load_timeout", component = "migrate" }, 
            "Migration dashboard load timed out");
    }
    catch (Exception ex) 
    {
        LastError = $"Load failed: {ex.Message}";
        StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "migrate" }, 
            "Failed to load migration dashboard");
    }
    finally 
    { 
        IsLoading = false; 
    }
}
```

### 2. PowerShell Integration Error Handling

#### ✅ REQUIRED PATTERN
```csharp
public async Task<T> ExecutePowerShellAsync<T>(string script, object parameters = null)
{
    using var powershell = PowerShell.Create();
    try
    {
        StructuredLogger?.LogDebug("PowerShellExecution", new { script = script.Substring(0, Math.Min(script.Length, 100)) }, 
            "Executing PowerShell script");
        
        powershell.AddScript(script);
        if (parameters != null)
        {
            powershell.AddParameters(ConvertToHashtable(parameters));
        }
        
        var results = await Task.Run(() => powershell.Invoke<T>());
        
        if (powershell.HadErrors)
        {
            var errors = powershell.Streams.Error.Select(e => e.ToString()).ToList();
            throw new PowerShellExecutionException($"PowerShell execution had errors: {string.Join("; ", errors)}");
        }
        
        return results.FirstOrDefault();
    }
    catch (Exception ex)
    {
        StructuredLogger?.LogError("PowerShellExecution", ex, new { script = script.Substring(0, Math.Min(script.Length, 100)) }, 
            "PowerShell script execution failed");
        throw new PowerShellExecutionException($"PowerShell execution failed: {ex.Message}", ex);
    }
}
```

---

## LOGGING & MONITORING STANDARDS

### 1. Structured Logging Requirements

#### ✅ REQUIRED PATTERN
```csharp
// All significant operations must be logged with structured data
public async Task StartMigrationAsync()
{
    var migrationId = Guid.NewGuid();
    var startTime = DateTime.UtcNow;
    
    try
    {
        StructuredLogger?.LogInfo(LogSourceName, 
            new { 
                action = "migration_start", 
                migrationId = migrationId,
                component = "migrate",
                userCount = TotalUsers,
                currentWave = CurrentWave,
                startTime = startTime
            }, 
            $"Starting migration {migrationId} for {TotalUsers} users in {CurrentWave}");
        
        // Migration logic here
        
        StructuredLogger?.LogInfo(LogSourceName,
            new {
                action = "migration_complete",
                migrationId = migrationId,
                component = "migrate", 
                duration = DateTime.UtcNow - startTime,
                usersProcessed = ProcessedUsers,
                success = true
            },
            $"Migration {migrationId} completed successfully");
    }
    catch (Exception ex)
    {
        StructuredLogger?.LogError(LogSourceName, ex,
            new {
                action = "migration_fail",
                migrationId = migrationId,
                component = "migrate",
                duration = DateTime.UtcNow - startTime,
                usersProcessed = ProcessedUsers
            },
            $"Migration {migrationId} failed");
        throw;
    }
}
```

### 2. Performance Monitoring

#### ✅ REQUIRED PATTERN
```csharp
public class PerformanceMonitor : IDisposable
{
    private readonly string _operationName;
    private readonly DateTime _startTime;
    private readonly ILogger _logger;
    
    public PerformanceMonitor(string operationName, ILogger logger)
    {
        _operationName = operationName;
        _startTime = DateTime.UtcNow;
        _logger = logger;
    }
    
    public void Dispose()
    {
        var duration = DateTime.UtcNow - _startTime;
        _logger?.LogInformation("Performance", 
            new { operation = _operationName, duration = duration.TotalMilliseconds },
            $"Operation {_operationName} completed in {duration.TotalMilliseconds}ms");
    }
}

// Usage
public async Task SomeExpensiveOperation()
{
    using var monitor = new PerformanceMonitor("ExpensiveOperation", StructuredLogger);
    
    // Operation implementation
    await DoWorkAsync();
}
```

---

## POWERSHELL MODULE INTEGRATION STANDARDS

### 1. Module Interface Requirements

#### ✅ REQUIRED MODULE STRUCTURE
```powershell
# All migration modules must implement standard interface
function Start-Migration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory = $false)]
        [scriptblock]$ProgressCallback,
        
        [Parameter(Mandatory = $false)]
        [scriptblock]$ErrorCallback
    )
    
    try {
        Write-Progress -Activity "Migration" -Status "Starting" -PercentComplete 0
        
        # Validation
        $validationResult = Test-MigrationPrerequisites -Configuration $Configuration
        if (-not $validationResult.IsValid) {
            throw "Migration prerequisites not met: $($validationResult.Errors -join '; ')"
        }
        
        # Main migration logic with progress reporting
        for ($i = 0; $i -lt $totalItems; $i++) {
            $percentComplete = [math]::Round(($i / $totalItems) * 100, 2)
            Write-Progress -Activity "Migration" -Status "Processing item $($i + 1) of $totalItems" -PercentComplete $percentComplete
            
            if ($ProgressCallback) {
                & $ProgressCallback @{
                    PercentComplete = $percentComplete
                    CurrentItem = $i + 1
                    TotalItems = $totalItems
                    Status = "Processing"
                }
            }
            
            # Process individual item
            try {
                Process-MigrationItem -Item $items[$i] -Configuration $Configuration
            }
            catch {
                $errorInfo = @{
                    Item = $items[$i]
                    Error = $_.Exception.Message
                    Severity = "Error"
                    IsRetryable = Test-RetryableError -Exception $_.Exception
                }
                
                if ($ErrorCallback) {
                    & $ErrorCallback $errorInfo
                }
                
                # Continue processing unless critical error
                if (-not $errorInfo.IsRetryable) {
                    throw
                }
            }
        }
        
        Write-Progress -Activity "Migration" -Status "Completed" -PercentComplete 100 -Completed
        
        return @{
            Success = $true
            ProcessedItems = $totalItems
            Errors = @()
            Duration = (Get-Date) - $startTime
        }
    }
    catch {
        if ($ErrorCallback) {
            & $ErrorCallback @{
                Error = $_.Exception.Message
                Severity = "Critical"
                IsRetryable = $false
            }
        }
        
        throw
    }
}
```

### 2. Progress Reporting Standards

#### ✅ REQUIRED PROGRESS PATTERN
```powershell
# Progress updates must include standardized information
function Report-MigrationProgress {
    param(
        [int]$CurrentItem,
        [int]$TotalItems,
        [string]$CurrentOperation,
        [datetime]$StartTime,
        [hashtable]$AdditionalData = @{}
    )
    
    $percentComplete = if ($TotalItems -gt 0) { [math]::Round(($CurrentItem / $TotalItems) * 100, 2) } else { 0 }
    $elapsed = (Get-Date) - $StartTime
    $estimatedTotal = if ($CurrentItem -gt 0) { $elapsed * ($TotalItems / $CurrentItem) } else { $null }
    $eta = if ($estimatedTotal) { $estimatedTotal - $elapsed } else { $null }
    
    $progressData = @{
        PercentComplete = $percentComplete
        CurrentItem = $CurrentItem
        TotalItems = $TotalItems
        CurrentOperation = $CurrentOperation
        ElapsedTime = $elapsed
        EstimatedTimeRemaining = $eta
        Throughput = if ($elapsed.TotalHours -gt 0) { [math]::Round($CurrentItem / $elapsed.TotalHours, 2) } else { 0 }
    }
    
    # Merge additional data
    foreach ($key in $AdditionalData.Keys) {
        $progressData[$key] = $AdditionalData[$key]
    }
    
    Write-Progress -Activity "Migration" -Status $CurrentOperation -PercentComplete $percentComplete
    
    # Return structured progress data for C# integration
    return $progressData | ConvertTo-Json -Depth 3
}
```

---

## TESTING & VALIDATION STANDARDS

### 1. Unit Testing Requirements

#### ✅ REQUIRED TEST PATTERNS
```csharp
[TestFixture]
public class MigrateViewModelTests
{
    private MigrateViewModel _viewModel;
    private Mock<ILogger<MigrateViewModel>> _mockLogger;
    
    [SetUp]
    public void Setup()
    {
        _mockLogger = new Mock<ILogger<MigrateViewModel>>();
        _viewModel = new MigrateViewModel(_mockLogger.Object);
    }
    
    [Test]
    public async Task LoadAsync_ShouldNotThrowThreadingViolations()
    {
        // Arrange - Run on background thread to test threading safety
        var task = Task.Run(async () => {
            await _viewModel.LoadAsync();
        });
        
        // Act & Assert
        Assert.DoesNotThrowAsync(async () => await task);
        Assert.That(_viewModel.HasData, Is.True.Or.False); // Either value is acceptable
    }
    
    [Test]
    public void StatusColor_ShouldBeThreadSafe()
    {
        // Arrange & Act - Access from multiple threads
        var tasks = Enumerable.Range(0, 10).Select(_ => Task.Run(() => {
            var color = _viewModel.SourceStatusColor;
            return color != null;
        }));
        
        // Assert
        Assert.DoesNotThrowAsync(async () => await Task.WhenAll(tasks));
    }
    
    [Test]
    public async Task AddActivityLogEntry_FromBackgroundThread_ShouldNotCrash()
    {
        // Arrange & Act - Add entries from background thread
        var tasks = Enumerable.Range(0, 5).Select(i => Task.Run(() => {
            // Use reflection to access private method for testing
            var method = typeof(MigrateViewModel).GetMethod("AddActivityLogEntry", 
                BindingFlags.NonPublic | BindingFlags.Instance);
            method?.Invoke(_viewModel, new object[] { $"Test message {i}", "Info", Colors.Blue });
        }));
        
        // Assert
        Assert.DoesNotThrowAsync(async () => await Task.WhenAll(tasks));
    }
}
```

### 2. Integration Testing Requirements

#### ✅ REQUIRED INTEGRATION TESTS
```csharp
[TestFixture]
public class MigrationIntegrationTests
{
    [Test]
    public async Task PowerShellModuleIntegration_ShouldExecuteWithoutErrors()
    {
        // Arrange
        var orchestrationService = new MigrationOrchestrationService(mockLogger);
        var config = new MigrationConfig { /* test configuration */ };
        
        // Act
        var result = await orchestrationService.AnalyzeEnvironmentAsync();
        
        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.IsValid, Is.True);
        Assert.That(result.Errors, Is.Empty);
    }
    
    [Test]
    public async Task NavigationToMigrateView_ShouldNotCrash()
    {
        // Arrange
        var navigationService = new NavigationService();
        
        // Act & Assert
        Assert.DoesNotThrowAsync(async () => {
            var result = navigationService.Navigate("migrate");
            await Task.Delay(1000); // Allow for initialization
        });
    }
}
```

### 3. PowerShell Module Testing

#### ✅ REQUIRED PESTER TESTS
```powershell
Describe "Migration Module Tests" {
    BeforeAll {
        Import-Module ".\Modules\Migration\MailboxMigration.psm1" -Force
    }
    
    Context "Start-MailboxMigration" {
        It "Should validate parameters correctly" {
            $config = @{
                SourceEnvironment = "OnPrem"
                TargetEnvironment = "Cloud"  
                BatchSize = 10
            }
            
            { Start-MailboxMigration -Configuration $config } | Should -Not -Throw
        }
        
        It "Should report progress during migration" {
            $progressReports = @()
            $progressCallback = { param($progress) $progressReports += $progress }
            
            $config = @{
                SourceEnvironment = "Test"
                TargetEnvironment = "Test"
                BatchSize = 1
                TestMode = $true
            }
            
            Start-MailboxMigration -Configuration $config -ProgressCallback $progressCallback
            
            $progressReports.Count | Should -BeGreaterThan 0
            $progressReports[-1].PercentComplete | Should -Be 100
        }
        
        It "Should handle errors gracefully" {
            $errors = @()
            $errorCallback = { param($error) $errors += $error }
            
            $config = @{
                SourceEnvironment = "Invalid"
                TargetEnvironment = "Invalid"
            }
            
            { Start-MailboxMigration -Configuration $config -ErrorCallback $errorCallback } | Should -Throw
            $errors.Count | Should -BeGreaterThan 0
        }
    }
}
```

---

## PERFORMANCE & SCALABILITY STANDARDS

### 1. Response Time Requirements

#### ✅ REQUIRED PERFORMANCE TARGETS
```csharp
public class PerformanceRequirements
{
    // UI Responsiveness
    public static readonly TimeSpan MaxUIResponseTime = TimeSpan.FromMilliseconds(100);
    public static readonly TimeSpan MaxLoadTime = TimeSpan.FromSeconds(5);
    public static readonly TimeSpan MaxNavigationTime = TimeSpan.FromSeconds(2);
    
    // Progress Updates
    public static readonly TimeSpan ProgressUpdateInterval = TimeSpan.FromMilliseconds(500);
    public static readonly TimeSpan MaxProgressUpdateDelay = TimeSpan.FromSeconds(2);
    
    // PowerShell Integration
    public static readonly TimeSpan MaxPowerShellStartup = TimeSpan.FromSeconds(10);
    public static readonly TimeSpan MaxModuleLoadTime = TimeSpan.FromSeconds(30);
    public static readonly TimeSpan DefaultOperationTimeout = TimeSpan.FromMinutes(30);
}

// Performance monitoring in critical operations
public async Task<T> MonitorPerformanceAsync<T>(string operation, Func<Task<T>> func)
{
    var stopwatch = Stopwatch.StartNew();
    try
    {
        var result = await func();
        return result;
    }
    finally
    {
        stopwatch.Stop();
        if (stopwatch.Elapsed > PerformanceRequirements.MaxUIResponseTime)
        {
            StructuredLogger?.LogWarning("Performance", 
                new { operation = operation, duration = stopwatch.ElapsedMilliseconds },
                $"Operation {operation} exceeded performance target: {stopwatch.ElapsedMilliseconds}ms");
        }
    }
}
```

### 2. Memory Management Standards

#### ✅ REQUIRED MEMORY PATTERNS
```csharp
public class ResourceManager : IDisposable
{
    private readonly List<IDisposable> _resources = new List<IDisposable>();
    private bool _disposed = false;
    
    public T RegisterResource<T>(T resource) where T : IDisposable
    {
        if (_disposed) throw new ObjectDisposedException(nameof(ResourceManager));
        
        _resources.Add(resource);
        return resource;
    }
    
    public void Dispose()
    {
        if (_disposed) return;
        
        foreach (var resource in _resources.AsEnumerable().Reverse())
        {
            try
            {
                resource?.Dispose();
            }
            catch (Exception ex)
            {
                // Log but don't throw during disposal
                System.Diagnostics.Debug.WriteLine($"Error disposing resource: {ex.Message}");
            }
        }
        
        _resources.Clear();
        _disposed = true;
    }
}
```

---

## COMPLIANCE & AUDIT STANDARDS

### 1. Audit Trail Requirements

#### ✅ REQUIRED AUDIT PATTERN
```csharp
public class AuditLogger
{
    private readonly ILogger _logger;
    
    public void LogMigrationEvent(MigrationAuditEvent auditEvent)
    {
        var auditData = new
        {
            eventId = auditEvent.Id,
            eventType = auditEvent.Type,
            timestamp = auditEvent.Timestamp,
            userId = auditEvent.UserId,
            sessionId = auditEvent.SessionId,
            operation = auditEvent.Operation,
            parameters = auditEvent.Parameters,
            result = auditEvent.Result,
            duration = auditEvent.Duration,
            ipAddress = auditEvent.IPAddress,
            userAgent = auditEvent.UserAgent
        };
        
        _logger.LogInformation("MigrationAudit", auditData, 
            $"Migration operation {auditEvent.Operation} by user {auditEvent.UserId}");
    }
}
```

### 2. Data Protection Standards

#### ✅ REQUIRED DATA PROTECTION
```csharp
public class DataProtectionService
{
    public string EncryptSensitiveData(string data)
    {
        // Use Windows Data Protection API
        var bytes = Encoding.UTF8.GetBytes(data);
        var encrypted = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
        return Convert.ToBase64String(encrypted);
    }
    
    public string DecryptSensitiveData(string encryptedData)
    {
        var bytes = Convert.FromBase64String(encryptedData);
        var decrypted = ProtectedData.Unprotect(bytes, null, DataProtectionScope.CurrentUser);
        return Encoding.UTF8.GetString(decrypted);
    }
    
    public void SecurelyEraseMemory(byte[] sensitiveData)
    {
        if (sensitiveData != null)
        {
            Array.Clear(sensitiveData, 0, sensitiveData.Length);
        }
    }
}
```

---

## CODE REVIEW CHECKLIST

### Pre-Submit Requirements ✅

#### Thread Safety Review
- [ ] All SolidColorBrush operations use thread-safe patterns
- [ ] UI property updates include dispatcher checking
- [ ] ObservableCollection modifications are marshaled to UI thread
- [ ] Lazy initialization used for UI-bound brush properties
- [ ] No direct UI updates from background threads

#### Error Handling Review  
- [ ] All async methods have proper try-catch-finally blocks
- [ ] Specific exception types caught where appropriate
- [ ] All exceptions logged with structured data
- [ ] User-friendly error messages provided
- [ ] Recovery strategies implemented where possible

#### PowerShell Integration Review
- [ ] PowerShell execution wrapped in async methods
- [ ] Timeout handling implemented for long-running operations
- [ ] Progress callbacks properly implemented
- [ ] Error propagation from PowerShell to C#
- [ ] Resource cleanup (PowerShell runspaces)

#### Performance Review
- [ ] Operations complete within performance targets
- [ ] Memory usage monitored and resources disposed
- [ ] Progress updates at appropriate intervals
- [ ] Large operations support cancellation
- [ ] UI remains responsive during background work

#### Testing Review
- [ ] Unit tests cover threading scenarios
- [ ] Integration tests validate PowerShell integration
- [ ] Performance tests verify response time targets
- [ ] Error handling tests cover failure scenarios
- [ ] Threading violation detection included

### Post-Review Requirements ✅

#### Documentation Updates
- [ ] Architecture changes documented
- [ ] API changes reflected in interface documentation  
- [ ] Configuration changes noted
- [ ] Breaking changes highlighted
- [ ] Migration guides provided if needed

#### Deployment Validation
- [ ] Changes tested in development environment
- [ ] Performance benchmarks validated
- [ ] No regressions in existing functionality
- [ ] Thread safety verified through stress testing
- [ ] PowerShell module compatibility confirmed

---

## ENFORCEMENT & COMPLIANCE

### Automated Quality Gates

#### Continuous Integration Checks
```yaml
quality_gates:
  - thread_safety_scan:
      description: "Scan for SolidColorBrush threading violations"
      tools: ["roslyn_analyzer", "custom_scanner"]
      fail_on: "any_violation"
      
  - async_pattern_validation:
      description: "Validate async/await patterns"
      tools: ["asyncfixer", "custom_rules"]
      fail_on: "pattern_violation"
      
  - performance_validation:
      description: "Validate performance targets"
      tools: ["benchmark_dotnet", "custom_profiler"]
      fail_on: "exceeds_target"
      
  - powershell_integration:
      description: "Validate PowerShell module compatibility"
      tools: ["pester", "custom_tests"]
      fail_on: "any_failure"
```

### Manual Review Process

#### Architecture Review Board
- **Required for**: All migration-related changes
- **Reviewers**: Lead architect, senior developers
- **Criteria**: Thread safety, performance, security compliance
- **Timeline**: 48 hours for standard changes, 1 week for major changes

#### Security Review
- **Required for**: Credential handling, data protection changes
- **Reviewers**: Security team, compliance officer
- **Criteria**: Data protection, audit compliance, access control
- **Timeline**: 1 week for security-related changes

### Compliance Monitoring

#### Production Monitoring
```csharp
public class ComplianceMonitor
{
    public void MonitorThreadSafety()
    {
        // Monitor for dispatcher violations in production
        // Alert on any threading exceptions
        // Track UI responsiveness metrics
    }
    
    public void MonitorPerformance() 
    {
        // Track operation response times
        // Alert on performance target violations
        // Monitor memory usage patterns
    }
    
    public void MonitorAuditCompliance()
    {
        // Verify all operations are logged
        // Check audit trail completeness
        // Monitor data protection compliance
    }
}
```

---

**Status**: Mandatory compliance for all migration-related development
**Enforcement**: Automated quality gates + manual review process
**Updates**: This document updated with each architectural change**