# Phase 2 Quick Start Guide - Development Team

## 🚀 **GETTING STARTED WITH PHASE 2 INTEGRATION**

This guide provides step-by-step instructions for developers to begin Phase 2 PowerShell integration immediately.

---

## 📋 **PRE-REQUISITES CHECKLIST**

### ✅ **Phase 1 Completion Verified**
- [ ] Application builds and runs without errors
- [ ] All 6 migration tabs display real-time data
- [ ] Zero crashes during normal operation
- [ ] Memory usage stable around 229MB
- [ ] Real-time updates working (2-30 second intervals)

### ✅ **Development Environment**
- [ ] Visual Studio 2022 with .NET 6.0 WPF support
- [ ] PowerShell 5.1+ installed and accessible
- [ ] Access to existing PowerShell migration modules
- [ ] Git repository access for collaboration

---

## 🔧 **STEP 1: INTEGRATE POWERSHELL EXECUTION SERVICE**

### **1.1 Add PowerShell Integration Components**
The Phase 2 framework components are already created in your project:

```
GUI/Services/Migration/PowerShell/
├── PowerShellExecutionService.cs       ← Core execution engine
├── MigrationStateManager.cs            ← State management  
├── PowerShellProgressBridge.cs         ← Progress streaming
├── EnhancedMigrationCommands.cs        ← Command infrastructure
└── Phase2IntegrationService.cs         ← Integration coordinator
```

### **1.2 Update MigrateViewModel Constructor**
Replace the current data generator initialization:

```csharp
// OLD (Phase 1 - Simulation):
private readonly MigrationDataGenerator _dataGenerator;

// NEW (Phase 2 - Real Integration):
private readonly PowerShellExecutionService _powershellService;
private readonly PowerShellProgressBridge _progressBridge;
private readonly Phase2IntegrationService _integrationService;

public MigrateViewModel(CsvDataServiceNew csvDataService)
{
    _csvDataService = csvDataService;
    
    // Initialize Phase 2 services
    _powershellService = new PowerShellExecutionService();
    _progressBridge = new PowerShellProgressBridge(_powershellService);
    _integrationService = new Phase2IntegrationService(_powershellService, _progressBridge);
    
    // Rest of existing initialization...
}
```

### **1.3 Test Basic Integration**
Create a simple test to verify PowerShell service is working:

```csharp
private async Task TestPowerShellIntegration()
{
    try 
    {
        var modules = await _powershellService.DiscoverAvailableModulesAsync();
        WriteLog($"Found {modules.Count} PowerShell modules", "INFO");
        
        // Test basic execution
        var result = await _powershellService.ExecuteScriptAsync("Get-Date");
        WriteLog($"PowerShell test successful: {result.Output}", "SUCCESS");
    }
    catch (Exception ex)
    {
        WriteLog($"PowerShell integration test failed: {ex.Message}", "ERROR");
        // Fall back to simulation mode
        await LoadSimulatedDataAsync();
    }
}
```

---

## 🔗 **STEP 2: REPLACE DATA GENERATORS WITH REAL EXECUTION**

### **2.1 Discovery Tab Integration**
Replace simulated discovery with real module execution:

```csharp
// OLD (Phase 1):
private async Task LoadDiscoveryDataAsync()
{
    _discoveryMetrics = DiscoveryDataGenerator.GenerateDiscoveryMetrics();
    // ... simulation code
}

// NEW (Phase 2):
private async Task LoadDiscoveryDataAsync()  
{
    try
    {
        // Execute real discovery modules
        var discoveryResult = await _integrationService.ExecuteDiscoveryAsync(
            selectedCompany: CurrentCompanyProfile?.CompanyName ?? "ljpops",
            modules: new[] { "ActiveDirectoryDiscovery", "AzureDiscovery", "ExchangeDiscovery" }
        );
        
        // Convert real results to UI metrics
        _discoveryMetrics = _progressBridge.ConvertToDiscoveryMetrics(discoveryResult);
        
        // Maintain real-time updates
        StartRealTimeDiscoveryMonitoring();
    }
    catch (Exception ex)
    {
        WriteLog($"Discovery execution failed, falling back to simulation: {ex.Message}", "WARNING");
        _discoveryMetrics = DiscoveryDataGenerator.GenerateDiscoveryMetrics();
    }
    
    OnPropertyChanged(nameof(DiscoveryMetrics));
}
```

### **2.2 Dashboard Metrics Integration**  
Connect dashboard to real migration data:

```csharp
private async Task RefreshDashboardMetricsAsync()
{
    try
    {
        // Get real metrics from PowerShell execution
        var realMetrics = await _progressBridge.GetCurrentDashboardMetricsAsync();
        
        if (realMetrics != null)
        {
            Metrics = realMetrics;
        }
        else
        {
            // Fallback to simulation if no real data available
            Metrics = MigrationDataGenerator.GenerateRealtimeMetrics();
        }
    }
    catch (Exception ex)
    {
        WriteLog($"Dashboard metrics refresh failed: {ex.Message}", "ERROR");
        Metrics = MigrationDataGenerator.GenerateRealtimeMetrics();
    }
}
```

---

## ⏱️ **STEP 3: MAINTAIN REAL-TIME UPDATES**

### **3.1 Enhanced Timer Management**
Update the timer system to handle both real and simulated data:

```csharp
private void StartRealTimeMonitoring()
{
    // Dashboard: Every 3 seconds
    _dashboardTimer = new DispatcherTimer 
    { 
        Interval = TimeSpan.FromSeconds(3) 
    };
    _dashboardTimer.Tick += async (s, e) => await RefreshDashboardMetricsAsync();
    _dashboardTimer.Start();
    
    // Discovery: Every 10 seconds  
    _discoveryTimer = new DispatcherTimer 
    { 
        Interval = TimeSpan.FromSeconds(10) 
    };
    _discoveryTimer.Tick += async (s, e) => await RefreshDiscoveryDataAsync();
    _discoveryTimer.Start();
    
    // Execution: Every 2 seconds (critical path)
    _executionTimer = new DispatcherTimer 
    { 
        Interval = TimeSpan.FromSeconds(2) 
    };
    _executionTimer.Tick += async (s, e) => await RefreshExecutionDataAsync();
    _executionTimer.Start();
}
```

### **3.2 Progress Streaming Integration**
Connect to real-time PowerShell progress updates:

```csharp
private async Task StartProgressStreaming()
{
    await foreach (var progress in _powershellService.StreamProgressAsync())
    {
        // Convert PowerShell progress to UI updates
        var uiUpdate = _progressBridge.ConvertProgressUpdate(progress);
        
        // Update appropriate tab based on operation type
        switch (progress.OperationType)
        {
            case "Discovery":
                await UpdateDiscoveryProgress(uiUpdate);
                break;
            case "Migration":
                await UpdateExecutionProgress(uiUpdate);
                break;
            case "Validation":  
                await UpdateValidationProgress(uiUpdate);
                break;
        }
    }
}
```

---

## 🧪 **STEP 4: TESTING & VALIDATION**

### **4.1 Create Integration Tests**
Use the provided test framework:

```csharp
[Test]
public async Task TestDashboardIntegration()
{
    var testFramework = new PowerShellIntegrationTestFramework();
    
    // Test real PowerShell execution
    var result = await testFramework.TestDashboardMetricsIntegrationAsync();
    
    Assert.IsTrue(result.Success);
    Assert.IsTrue(result.ResponseTime < TimeSpan.FromMilliseconds(100));
    Assert.IsNotNull(result.Metrics);
}

[Test]
public async Task TestDiscoveryIntegration()
{
    var testFramework = new PowerShellIntegrationTestFramework();
    
    // Test discovery module execution
    var result = await testFramework.TestDiscoveryIntegrationAsync("ljpops");
    
    Assert.IsTrue(result.Success);
    Assert.IsTrue(result.DiscoveredItems.Count > 0);
}
```

### **4.2 Performance Validation**
Monitor performance during integration:

```csharp
private async Task ValidatePerformance()
{
    var memoryBefore = GC.GetTotalMemory(false);
    var stopwatch = Stopwatch.StartNew();
    
    // Execute operation
    await RefreshDashboardMetricsAsync();
    
    stopwatch.Stop();
    var memoryAfter = GC.GetTotalMemory(false);
    
    // Validate against Phase 1 baselines
    Assert.IsTrue(stopwatch.ElapsedMilliseconds < 100, "Response time exceeded 100ms");
    Assert.IsTrue(memoryAfter - memoryBefore < 1024 * 1024, "Memory usage increased by >1MB");
}
```

---

## 🔄 **STEP 5: GRACEFUL FALLBACK STRATEGY**

### **5.1 Dual Mode Operation**
Implement feature flag control for seamless fallback:

```csharp
public enum OperationMode
{
    Simulation,  // Phase 1 behavior
    Integration, // Phase 2 real PowerShell
    Hybrid      // Mix based on availability
}

private OperationMode _currentMode = OperationMode.Hybrid;

private async Task<T> ExecuteWithFallback<T>(
    Func<Task<T>> realOperation, 
    Func<Task<T>> simulationOperation)
{
    if (_currentMode == OperationMode.Simulation)
    {
        return await simulationOperation();
    }
    
    try 
    {
        var result = await realOperation();
        return result;
    }
    catch (Exception ex)
    {
        WriteLog($"Real operation failed, falling back to simulation: {ex.Message}", "WARNING");
        
        if (_currentMode == OperationMode.Hybrid)
        {
            return await simulationOperation();
        }
        throw;
    }
}
```

---

## 📊 **STEP 6: MONITORING & DEBUGGING**

### **6.1 Enhanced Logging**
Add comprehensive logging for Phase 2 operations:

```csharp
private void LogIntegrationActivity(string operation, TimeSpan duration, bool success, string details = null)
{
    var logEntry = new
    {
        Timestamp = DateTime.UtcNow,
        Operation = operation,
        Duration = duration.TotalMilliseconds,
        Success = success,
        Details = details,
        MemoryUsage = GC.GetTotalMemory(false),
        ThreadId = Thread.CurrentThread.ManagedThreadId
    };
    
    StructuredLogger?.LogInformation("PowerShellIntegration", logEntry);
}
```

### **6.2 Performance Metrics**
Track key performance indicators:

```csharp
private void TrackPerformanceMetrics()
{
    var metrics = new
    {
        PowerShellExecutions = _powershellService.ExecutionCount,
        AverageExecutionTime = _powershellService.AverageExecutionTime,
        SuccessRate = _powershellService.SuccessRate,
        ActiveRunspaces = _powershellService.ActiveRunspaceCount,
        MemoryUsage = Process.GetCurrentProcess().WorkingSet64,
        UIResponseTime = _lastUIUpdateDuration.TotalMilliseconds
    };
    
    // Send to monitoring system
    PerformanceTracker?.RecordMetrics(metrics);
}
```

---

## ✅ **SUCCESS CHECKLIST**

### **Week 1 Goals**
- [ ] PowerShell execution service integrated and functional
- [ ] Basic module discovery and execution working
- [ ] Dashboard tab showing real PowerShell data  
- [ ] Fallback to simulation working seamlessly
- [ ] No regressions in UI responsiveness or stability

### **Week 2 Goals**  
- [ ] Discovery tab integrated with real discovery modules
- [ ] Real-time progress streaming working end-to-end
- [ ] State management and checkpointing functional
- [ ] Performance meets Phase 1 baselines
- [ ] Comprehensive error handling implemented

### **Quality Gates**
- [ ] Zero crashes during PowerShell operations
- [ ] Memory usage remains stable (<500MB under load)
- [ ] UI response time stays <100ms
- [ ] Real-time updates maintain 2-30 second frequencies  
- [ ] Professional ShareGate-quality experience preserved

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues & Solutions**

**Issue**: PowerShell modules not found
- **Solution**: Verify module paths and import statements
- **Check**: `$env:PSModulePath` includes your Modules directory

**Issue**: UI freezing during PowerShell execution  
- **Solution**: Ensure all PowerShell operations use async/await
- **Check**: No blocking calls on UI thread

**Issue**: Memory leaks with PowerShell runspaces
- **Solution**: Properly dispose runspaces and implement pooling
- **Check**: PowerShellExecutionService disposal pattern

**Issue**: Progress updates not appearing
- **Solution**: Verify progress bridge conversion logic
- **Check**: PowerShell modules are generating progress events

### **Debug Tools**
- Use Visual Studio diagnostics to monitor memory and performance
- Enable detailed PowerShell logging for execution tracing  
- Monitor real-time updates with performance profiler
- Use integration test framework for systematic validation

---

## 📞 **SUPPORT RESOURCES**

- **Architecture Documentation**: See PHASE_2_IMPLEMENTATION_PLAN.md
- **Integration Framework**: All services created and ready in /Services/Migration/PowerShell/
- **Test Framework**: PowerShellIntegrationTestFramework.cs provides comprehensive testing
- **Examples**: Phase2ActivationExample.cs shows complete usage patterns

**Ready to begin Phase 2 integration! The foundation is solid and the path forward is clear.** 🚀