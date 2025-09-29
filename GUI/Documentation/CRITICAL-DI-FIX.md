# CRITICAL FIX REQUIRED - Dependency Injection

**Status:** 🔴 BLOCKER - Application will not start
**Severity:** CRITICAL
**Time to Fix:** 5 minutes
**Files Affected:** 1 file (`App.xaml.cs`)

---

## Problem

MainViewModel requires two services that are **NOT registered** in the DI container:
1. **DataExportService** ❌
2. **LogicEngineService** ❌

**Exception Expected:**
```
InvalidOperationException: Unable to resolve service for type
'MandADiscoverySuite.Services.DataExportService' while attempting
to activate 'MandADiscoverySuite.ViewModels.MainViewModel'.
```

---

## Solution

### Step 1: Open File
**File:** `D:\Scripts\UserMandA\GUI\App.xaml.cs`

### Step 2: Locate Insertion Point
Find line 120:
```csharp
services.AddSingleton<AnimationOptimizationService>();
```

### Step 3: Add Missing Services
**Insert AFTER line 120, BEFORE line 124 (BuildServiceProvider):**

```csharp
// ========== CRITICAL MISSING SERVICES ==========

// Data Export Service (Required by MainViewModel)
// Uses Singleton pattern with Instance property
services.AddSingleton<DataExportService>(sp => DataExportService.Instance);

// Logic Engine Service (Required by MainViewModel)
// Constructor: LogicEngineService(ILogger<LogicEngineService>, MultiTierCacheService? = null, string? dataRoot = null)
services.AddSingleton<LogicEngineService>(sp =>
{
    var logger = sp.GetRequiredService<ILogger<LogicEngineService>>();
    return new LogicEngineService(logger); // Optional params use defaults
});

// ========== END CRITICAL MISSING SERVICES ==========
```

### Step 4: Verify Order
Ensure registration order is:
1. Line 120: `AnimationOptimizationService`
2. **NEW:** `DataExportService`
3. **NEW:** `LogicEngineService`
4. Line 117: `MainViewModel` (already exists)
5. Line 124: `BuildServiceProvider()` (already exists)

**IMPORTANT:** MainViewModel is already registered at line 117. Leave it there - it will now resolve correctly after adding the two missing services.

---

## Complete Code Block to Insert

```csharp
                services.AddSingleton<AnimationOptimizationService>();

                // ========== CRITICAL MISSING SERVICES (Added 2025-09-30) ==========
                // These services are required by MainViewModel constructor

                // Data Export Service - uses Singleton pattern
                services.AddSingleton<DataExportService>(sp => DataExportService.Instance);

                // Logic Engine Service - requires ILogger, optional params use defaults
                services.AddSingleton<LogicEngineService>(sp =>
                {
                    var logger = sp.GetRequiredService<ILogger<LogicEngineService>>();
                    return new LogicEngineService(logger);
                });
                // ========== END CRITICAL MISSING SERVICES ==========


                // Build the service provider
                ServiceProvider = services.BuildServiceProvider();
```

---

## Verification

### After Making Changes:

1. **Build the solution:**
   ```powershell
   dotnet build GUI/MandADiscoverySuite.csproj
   ```

2. **Check for build errors:**
   - Should build successfully with 0 errors
   - Warnings are acceptable

3. **Run the application:**
   ```powershell
   dotnet run --project GUI/MandADiscoverySuite.csproj
   ```

4. **Check logs:**
   - **Emergency log:** `C:\Temp\manda-emergency-startup.log`
   - **Main log:** `C:\discoverydata\ljpops\Logs\MandADiscoverySuite_YYYYMMDD.log`

5. **Expected output:**
   ```
   [INFO] [MainViewModel] Constructor started with DI services
   [INFO] MainWindow created successfully
   [INFO] Startup completed in X.X seconds
   ```

### Success Criteria:
- ✅ Application starts without exceptions
- ✅ MainWindow displays
- ✅ No "Unable to resolve service" errors in logs
- ✅ Navigation works (clicking sidebar buttons)

---

## Service Details

### DataExportService
- **File:** `D:\Scripts\UserMandA\GUI\Services\DataExportService.cs`
- **Pattern:** Singleton with private constructor
- **Constructor:** `private DataExportService()`
- **Access:** Via `DataExportService.Instance` property
- **Dependencies:** NONE
- **Purpose:** Export data to CSV/Excel files

### LogicEngineService
- **File:** `D:\Scripts\UserMandA\GUI\Services\LogicEngineService.cs`
- **Constructor:** `public LogicEngineService(ILogger<LogicEngineService> logger, MultiTierCacheService? cacheService = null, string? dataRoot = null)`
- **Required Dependencies:**
  - `ILogger<LogicEngineService>` (provided by `services.AddLogging()`)
- **Optional Dependencies:**
  - `cacheService`: defaults to null
  - `dataRoot`: defaults to `"C:\discoverydata\ljpops\RawData\"`
- **Purpose:** Business logic engine for data correlation and analysis

---

## Rollback Plan

If issues occur after adding these services:

1. **Remove the added lines** (revert to before the change)
2. **Check for other compilation errors**
3. **Review the detailed analysis:** `D:\Scripts\UserMandA\GUI\Documentation\Startup-DI-Analysis.md`

---

## Additional Context

**Full Analysis Available:**
- **File:** `D:\Scripts\UserMandA\GUI\Documentation\Startup-DI-Analysis.md`
- **Contents:**
  - Complete dependency chain analysis
  - Startup sequence flow
  - Exception handling architecture
  - Service registration best practices
  - Testing recommendations

**MainViewModel Constructor Signature:**
```csharp
public MainViewModel(
    ILogger<MainViewModel> logger,           // ✅ Registered
    TabsService tabsService,                 // ✅ Registered
    NavigationService navigationService,     // ✅ Registered
    IDiscoveryService discoveryService,      // ✅ Registered
    DataExportService dataExportService,     // ❌ NOT REGISTERED <- FIX
    ModuleRegistryService moduleRegistryService, // ✅ Registered
    LogicEngineService logicEngineService)   // ❌ NOT REGISTERED <- FIX
```

---

## Contact / Support

If this fix does not resolve the issue:

1. Check the logs for detailed error messages
2. Review the full analysis document
3. Verify all service constructors match expected signatures
4. Ensure no merge conflicts in App.xaml.cs

---

**Last Updated:** 2025-09-30
**Issue ID:** DI-MISSING-SERVICES-001
**Priority:** P0 - CRITICAL BLOCKER