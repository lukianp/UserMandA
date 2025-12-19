# Profile Management Gap Analysis: GUI/ vs guiv2/

## Executive Summary

This document analyzes the profile management architecture differences between the legacy GUI/ (C# WPF) application and the new guiv2/ (Electron/React/TypeScript) application. It identifies critical missing functionality that must be replicated to achieve feature parity.

**Date**: 2025-10-15
**Status**: Task 1 - Gap Analysis Complete
**Next Steps**: Implement missing features per Tasks 2-10

---

## 1. Company Profile Creation, Selection, and Deletion

### GUI/ Implementation (`MainViewModel.cs`)

**Profile Creation** (Lines 2163-2283):
- Shows styled input dialog with company name input
- Creates directory structure: `C:\DiscoveryData\{CompanyName}\{Raw|Logs|Credentials}`
- Initializes `CompanyProfile` object with:
  - `CompanyName`, `TenantId`, `ClientId`, `ClientSecret`
  - `DomainController`, `DataPath`
  - `IsActive` flag, `CreatedDate`, `ModifiedDate`
- Persists profile to JSON file: `C:\DiscoveryData\{CompanyName}\profile.json`
- Loads profile into `_companyProfiles` ObservableCollection
- Automatically selects newly created profile

**Profile Selection** (Lines 296-322):
- Changes `SelectedProfile` property
- Calls `ProfileService.SetCurrentProfileAsync(profile)`
- Reloads LogicEngine data for new profile path
- Updates UI status bar with current profile
- Triggers `RefreshEnvironmentStatusAsync()` for T-000 checks
- Raises `PropertyChanged` event to update all views

**Profile Deletion** (Lines 2284-2356):
- Shows confirmation dialog with warning
- Checks if profile is currently active (prevents deletion)
- Removes from `_companyProfiles` collection
- Optionally deletes physical directory and files
- Updates UI and selects next available profile

### guiv2/ Current Implementation (`useProfileStore.ts`)

**Profile Creation** (Lines 130-149):
- ✅ Has `createSourceProfile` method
- ✅ Calls IPC handler `electronAPI.createSourceProfile`
- ✅ Adds to local state `sourceProfiles`
- ⚠️ **MISSING**: Dialog UI component for profile creation
- ⚠️ **MISSING**: Directory structure initialization
- ⚠️ **MISSING**: Automatic credential setup workflow

**Profile Selection** (Lines 200-250):
- ✅ Has `setSelectedSourceProfile` method
- ✅ Calls IPC `setActiveSourceProfile`
- ✅ Triggers LogicEngine reload: `logic-engine:load-all`
- ✅ Updates Zustand state (triggers view reloads)
- ⚠️ **MISSING**: Environment status refresh (T-000)
- ⚠️ **MISSING**: UI status bar updates

**Profile Deletion** (Lines 173-186):
- ✅ Has `deleteSourceProfile` method
- ✅ Removes from state and IPC backend
- ⚠️ **MISSING**: Confirmation dialog UI
- ⚠️ **MISSING**: Active profile protection
- ⚠️ **MISSING**: Physical file deletion options

### Gap Summary

| Feature | GUI/ | guiv2/ | Status |
|---------|------|--------|--------|
| Profile creation dialog | ✅ | ❌ | **MISSING** |
| Directory structure setup | ✅ | ❌ | **MISSING** |
| Profile selection workflow | ✅ | ⚠️ | **PARTIAL** |
| Profile deletion with confirmation | ✅ | ❌ | **MISSING** |
| Active profile protection | ✅ | ❌ | **MISSING** |
| Auto-credential setup | ✅ | ❌ | **MISSING** |

---

## 2. Target Profile Management

### GUI/ Implementation (`MainViewModel.cs`)

**Target Profile Structure** (Lines 48-51):
- `ObservableCollection<CompanyProfile> _targetCompanyProfiles` - Available target companies
- `ObservableCollection<TargetProfile> _targetProfiles` - Configured target profiles
- `CompanyProfile? _selectedTargetCompany` - Selected target company
- `TargetProfile? _selectedTargetProfile` - Active target profile for migration

**TargetProfile Model** (`Models/TargetProfile.cs`):
```csharp
public class TargetProfile
{
    public string Id { get; set; }
    public string SourceProfileId { get; set; }  // Link to source profile
    public string TargetCompanyName { get; set; }
    public string TargetTenantId { get; set; }
    public string TargetClientId { get; set; }
    public string TargetClientSecret { get; set; }
    public string TargetDomainController { get; set; }
    public string MigrationWaveName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime ModifiedDate { get; set; }
}
```

**Target Profile Operations** (Lines 1054-1285):
- `RunTargetAppRegistrationAsync()` - Setup Azure AD app for target tenant
- `ImportTargetAppRegistrationAsync()` - Import existing app credentials
- `ShowTargetProfilesAsync()` - Display target profile management dialog
- `AddTargetProfileAsync()` - Create new target profile with wizard
- `SetActiveTargetProfileAsync()` - Set current migration target
- `LoadTargetProfilesAsync()` - Load target profiles from disk

**Target Profile Persistence**:
- Location: `C:\DiscoveryData\{SourceCompany}\TargetProfiles\{TargetCompany}.json`
- Stores mapping between source and target environments
- Includes migration wave assignments
- Tracks connection credentials separately

### guiv2/ Current Implementation (`useProfileStore.ts`)

**Target Profile Structure** (Lines 28-31):
```typescript
export interface TargetProfile extends Profile {
  sourceProfileId: string;
  targetEnvironment: string;
}
```

**State Management** (Lines 33-41):
- ✅ Has `targetProfiles: TargetProfile[]` array
- ✅ Has `selectedTargetProfile: TargetProfile | null`
- ✅ Has `loadTargetProfiles()` method (Lines 110-124)
- ✅ Has `setSelectedTargetProfile()` method (Lines 255-257)

**Missing Target Profile Features**:
- ❌ No `createTargetProfile()` method
- ❌ No `updateTargetProfile()` method
- ❌ No `deleteTargetProfile()` method
- ❌ No target app registration workflow
- ❌ No target company selection
- ❌ No migration wave assignment
- ❌ No source-to-target mapping UI
- ❌ No target profile validation

### Gap Summary

| Feature | GUI/ | guiv2/ | Status |
|---------|------|--------|--------|
| Target profile CRUD operations | ✅ | ❌ | **MISSING** |
| Target app registration setup | ✅ | ❌ | **MISSING** |
| Source-to-target mapping | ✅ | ❌ | **MISSING** |
| Migration wave management | ✅ | ❌ | **MISSING** |
| Target profile UI dialogs | ✅ | ❌ | **MISSING** |
| Target credential import | ✅ | ❌ | **MISSING** |

---

## 3. Azure App Registration Integration

### GUI/ Implementation

**Source App Registration** (`RunAppRegistrationAsync`, Lines 2041-2087):
```csharp
private void RunAppRegistrationAsync()
{
    // 1. Get script path from ConfigurationService
    var scriptPath = ConfigurationService.Instance.GetAppRegistrationScriptPath();

    // 2. Fallback to application directory
    if (!File.Exists(scriptPath))
        scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
                                  "Scripts", "DiscoveryCreateAppRegistration.ps1");

    // 3. Get current company name
    var companyName = SelectedProfile?.CompanyName ?? CurrentProfileName ?? "ljpops";

    // 4. Launch PowerShell script in new window
    var startInfo = new ProcessStartInfo
    {
        FileName = "powershell.exe",
        Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\" " +
                   $"-CompanyName \"{companyName}\"",
        UseShellExecute = true,
        WorkingDirectory = Path.GetDirectoryName(scriptPath)
    };

    Process.Start(startInfo);

    // 5. Show user notification
    MessageBox.Show("App Registration setup script has been launched...");
}
```

**Script Path**: `Scripts/DiscoveryCreateAppRegistration.ps1`

**Script Actions**:
1. Prompts for Azure AD admin credentials
2. Connects to Azure AD tenant
3. Creates new App Registration with required permissions:
   - `Directory.Read.All`
   - `User.Read.All`
   - `Group.Read.All`
   - `Application.Read.All`
4. Generates ClientId and ClientSecret
5. Stores credentials in: `C:\DiscoveryData\{CompanyName}\Credentials\discoverycredentials.config`
6. Credential format:
```json
{
  "TenantId": "guid",
  "ClientId": "guid",
  "ClientSecret": "encrypted-string",
  "DomainController": "dc.company.com"
}
```

**Target App Registration** (`RunTargetAppRegistrationAsync`, Lines 1054-1104):
- Nearly identical workflow but for target tenant
- Uses `DiscoveryCreateTargetAppRegistration.ps1`
- Stores in target profile credentials directory
- Validates target company selection first

### guiv2/ Current Implementation

**Current State**:
- ❌ No app registration UI workflow
- ❌ No PowerShell script integration for app setup
- ❌ No credential storage/retrieval from config files
- ❌ No Azure AD permission request dialogs
- ⚠️ Profile store has basic credential properties but no setup workflow

**Partial Implementation**:
- `testConnection()` method exists (Lines 263-287) but incomplete
- Uses `Test-Connection.psm1` which may not exist
- No UI components for app registration

### Gap Summary

| Feature | GUI/ | guiv2/ | Status |
|---------|------|--------|--------|
| Source app registration workflow | ✅ | ❌ | **MISSING** |
| Target app registration workflow | ✅ | ❌ | **MISSING** |
| PowerShell script execution | ✅ | ❌ | **MISSING** |
| Credential storage | ✅ | ❌ | **MISSING** |
| Credential encryption | ✅ | ❌ | **MISSING** |
| Azure AD permission grants | ✅ | ❌ | **MISSING** |
| Connection validation | ✅ | ⚠️ | **PARTIAL** |
| UI dialogs and wizards | ✅ | ❌ | **MISSING** |

---

## 4. Environment Detection and Connection Testing (T-000)

### GUI/ Implementation

**Service Integration** (Lines 43-44):
```csharp
private readonly IEnvironmentDetectionService _environmentDetectionService = null!;
private readonly IConnectionTestService _connectionTestService = null!;
```

**Status Properties** (Lines 58-62, 350-388):
- `SourceEnvironmentStatus` - "Unknown", "On-Premises", "Azure AD", "Hybrid"
- `TargetEnvironmentStatus` - Same values as source
- `SourceConnectionStatus` - "Not Tested", "Connected", "Failed", "Testing..."
- `TargetConnectionStatus` - Same values as source

**Environment Detection** (`RefreshEnvironmentStatusAsync`, Lines 3012-3180):
```csharp
private async Task RefreshEnvironmentStatusAsync()
{
    try
    {
        // 1. Detect source environment
        if (SelectedProfile != null)
        {
            var sourceEnv = await _environmentDetectionService
                .DetectEnvironmentAsync(SelectedProfile);
            SourceEnvironmentStatus = sourceEnv.ToString();
        }

        // 2. Detect target environment
        if (SelectedTargetProfile != null || SelectedTargetCompany != null)
        {
            var targetEnv = await _environmentDetectionService
                .DetectEnvironmentAsync(GetTargetProfile());
            TargetEnvironmentStatus = targetEnv.ToString();
        }

        // 3. Auto-trigger connection tests if environments detected
        await TestSourceConnectionAsync();
        await TestTargetConnectionAsync();
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, "Error refreshing environment status");
    }
}
```

**Connection Testing** (`TestSourceConnectionAsync`, Lines 3182-3245):
```csharp
private async Task TestSourceConnectionAsync()
{
    try
    {
        SourceConnectionStatus = "Testing...";

        var result = await _connectionTestService
            .TestConnectionAsync(SelectedProfile);

        if (result.Success)
        {
            SourceConnectionStatus = "Connected";
            // Store connection timestamp
            SelectedProfile.LastConnectionTest = DateTime.Now;
        }
        else
        {
            SourceConnectionStatus = $"Failed: {result.ErrorMessage}";
        }
    }
    catch (Exception ex)
    {
        SourceConnectionStatus = $"Error: {ex.Message}";
        _logger?.LogError(ex, "Source connection test failed");
    }
}
```

**Test Target Connection** (`TestTargetConnectionAsync`, Lines 3246-3310):
- Nearly identical to source connection test
- Uses target profile credentials
- Updates `TargetConnectionStatus`

**UI Integration**:
- Status displayed in main window status bar
- Automatic refresh when profile changes
- Manual refresh button available
- Color-coded indicators (Green=Connected, Red=Failed, Yellow=Testing)

### guiv2/ Current Implementation

**Current State** (`useProfileStore.ts`):
- ✅ Has `connectionStatus` property (Line 39)
- ✅ Has `testConnection()` method (Lines 263-287)
- ❌ No environment detection service
- ❌ No separate source/target connection status
- ❌ No auto-refresh on profile change
- ❌ No connection test UI components
- ❌ No status indicators in UI

**Partial Implementation**:
```typescript
testConnection: async (profile) => {
  set({ connectionStatus: 'connecting' });
  try {
    const result = await electronAPI.executeModule({
      modulePath: 'Modules/Connection/Test-Connection.psm1',  // May not exist
      functionName: 'Test-ProfileConnection',
      parameters: { profileId: profile.id },
    });

    if (result.success) {
      set({ connectionStatus: 'connected' });
      return result.data;
    }
  } catch (error) {
    set({ connectionStatus: 'error' });
    throw error;
  }
}
```

### Gap Summary

| Feature | GUI/ | guiv2/ | Status |
|---------|------|--------|--------|
| Environment detection service | ✅ | ❌ | **MISSING** |
| Connection test service | ✅ | ⚠️ | **PARTIAL** |
| Source environment status | ✅ | ❌ | **MISSING** |
| Target environment status | ✅ | ❌ | **MISSING** |
| Auto-refresh on profile change | ✅ | ❌ | **MISSING** |
| Manual refresh command | ✅ | ❌ | **MISSING** |
| Status bar UI integration | ✅ | ❌ | **MISSING** |
| Color-coded status indicators | ✅ | ❌ | **MISSING** |

---

## 5. Profile Persistence and Restoration

### GUI/ Implementation

**Persistence Locations**:
- Company profiles: `C:\DiscoveryData\{CompanyName}\profile.json`
- Target profiles: `C:\DiscoveryData\{SourceCompany}\TargetProfiles\{TargetCompany}.json`
- Active selections: `C:\DiscoveryData\AppSettings\active-profiles.json`

**Persistence Format** (`profile.json`):
```json
{
  "Id": "guid",
  "CompanyName": "CompanyA",
  "TenantId": "tenant-guid",
  "ClientId": "client-guid",
  "ClientSecret": "encrypted-secret",
  "DomainController": "dc.companya.com",
  "DataPath": "C:\\DiscoveryData\\CompanyA",
  "IsActive": true,
  "CreatedDate": "2025-01-15T10:30:00",
  "ModifiedDate": "2025-10-15T14:22:00",
  "LastConnectionTest": "2025-10-15T14:22:00"
}
```

**Session Restoration** (`LoadPersistedProfileSelectionsAsync`, Lines 1600-1700):
```csharp
private async Task LoadPersistedProfileSelectionsAsync()
{
    try
    {
        var settingsPath = Path.Combine(
            ConfigurationService.Instance.DataPath,
            "AppSettings",
            "active-profiles.json"
        );

        if (File.Exists(settingsPath))
        {
            var json = await File.ReadAllTextAsync(settingsPath);
            var settings = JsonSerializer.Deserialize<ActiveProfileSettings>(json);

            // Restore source profile selection
            if (!string.IsNullOrWhiteSpace(settings?.SourceProfileId))
            {
                var profile = _companyProfiles
                    .FirstOrDefault(p => p.Id == settings.SourceProfileId);
                if (profile != null)
                {
                    SelectedProfile = profile;
                }
            }

            // Restore target profile selection
            if (!string.IsNullOrWhiteSpace(settings?.TargetProfileId))
            {
                var targetProfile = _targetProfiles
                    .FirstOrDefault(p => p.Id == settings.TargetProfileId);
                if (targetProfile != null)
                {
                    SelectedTargetProfile = targetProfile;
                }
            }
        }
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, "Failed to load persisted profile selections");
    }
}
```

**Auto-Save on Change**:
- Saves active profile selections immediately when changed
- Persists on application shutdown
- Restores on application startup

### guiv2/ Current Implementation

**Current State** (`useProfileStore.ts`):
- ⚠️ Uses Zustand persist middleware but limited scope
- ⚠️ Persists to `localStorage` not file system
- ❌ No profile-to-disk serialization
- ❌ No session restoration on startup
- ❌ No active profile persistence across sessions

**Zustand Persist Middleware**:
- Not currently configured in the store
- Would only persist simple state to browser localStorage
- Does not replicate file-based persistence from GUI/

### Gap Summary

| Feature | GUI/ | guiv2/ | Status |
|---------|------|--------|--------|
| Profile file persistence | ✅ | ❌ | **MISSING** |
| Active selection persistence | ✅ | ❌ | **MISSING** |
| Session restoration on startup | ✅ | ❌ | **MISSING** |
| Credential encryption | ✅ | ❌ | **MISSING** |
| Auto-save on changes | ✅ | ❌ | **MISSING** |
| File-based storage | ✅ | ❌ | **MISSING** |

---

## 6. PowerShell Module Integration Patterns

### GUI/ Implementation

**Module Registry** (`ModuleRegistryService`):
- Scans `Modules/Discovery/*.psm1` directory
- Registers each module with metadata
- Tracks module dependencies
- Provides module execution interface

**Module Execution Pattern** (Throughout `MainViewModel.cs`):
```csharp
// Example from StartDiscoveryAsync
private async Task StartDiscoveryAsync()
{
    var module = _moduleRegistryService.GetModule("DomainDiscovery");

    var parameters = new Dictionary<string, object>
    {
        { "CompanyName", SelectedProfile.CompanyName },
        { "TenantId", SelectedProfile.TenantId },
        { "ClientId", SelectedProfile.ClientId },
        { "ClientSecret", SelectedProfile.ClientSecret },
        { "OutputPath", SelectedProfile.DataPath + "\\Raw" }
    };

    var result = await _discoveryService.ExecuteModuleAsync(module, parameters);

    if (result.Success)
    {
        // Reload CSV data
        await _logicEngineService.ReloadDataAsync();

        // Refresh UI
        await RefreshDashboardAsync();
    }
}
```

**CSV Data Loading After Discovery**:
- Discovery modules write CSV files to `C:\DiscoveryData\{Company}\Raw\`
- LogicEngine automatically detects new CSV files
- Data is loaded into memory models (UserDto, GroupDto, etc.)
- UI views refresh automatically

### guiv2/ Current Implementation

**Current State**:
- ⚠️ Has `powerShellService.ts` (basic PowerShell execution)
- ⚠️ Has `executeModule` IPC handler
- ❌ No module registry service
- ❌ No automatic CSV reload after discovery
- ❌ No module metadata or discovery
- ❌ No module dependency tracking

**Partial Implementation** (`powerShellService.ts`):
```typescript
export const powerShellService = {
  async executeModule(params: {
    modulePath: string;
    functionName: string;
    parameters?: Record<string, any>;
  }) {
    const result = await window.electronAPI.executeModule(params);
    return result;
  }
};
```

### Gap Summary

| Feature | GUI/ | guiv2/ | Status |
|---------|------|--------|--------|
| Module registry service | ✅ | ❌ | **MISSING** |
| Module auto-discovery | ✅ | ❌ | **MISSING** |
| Module metadata | ✅ | ❌ | **MISSING** |
| CSV auto-reload | ✅ | ❌ | **MISSING** |
| Module execution tracking | ✅ | ❌ | **MISSING** |
| Progress reporting | ✅ | ⚠️ | **PARTIAL** |

---

## Implementation Priority Recommendations

Based on criticality and dependencies, implement in this order:

### Phase 1: Core Profile Infrastructure (Tasks 2-3)
1. **Document Complete Architecture** (Task 2) - Foundation for all work
2. **Implement Azure App Registration** (Task 3) - Blocks all discovery work

### Phase 2: Profile Management (Tasks 4-5)
3. **Create Target Profile Management** (Task 4) - Required for migration
4. **Implement Environment Detection (T-000)** (Task 5) - Critical for validation

### Phase 3: Integration (Tasks 6-7)
5. **Add PowerShell Module Discovery** (Task 6) - Enables discovery execution
6. **Create Migration Planning Views** (Task 7) - User-facing migration features

### Phase 4: Data Operations (Task 8)
7. **Implement Data Export/Import** (Task 8) - Data management features

### Phase 5: Quality (Tasks 9-10)
8. **Add Error Handling/Logging** (Task 9) - Production readiness
9. **Test and Validate** (Task 10) - Quality assurance

---

## Conclusion

The guiv2/ implementation has a **solid foundation** but is **missing critical profile management functionality** that exists in GUI/. Specifically:

**✅ What's Working**:
- Basic profile CRUD operations
- Profile selection with LogicEngine reload
- IPC communication architecture
- State management with Zustand

**❌ Critical Gaps**:
- No Azure App Registration workflow
- No target profile management
- No environment detection (T-000)
- No PowerShell module discovery
- No credential encryption/storage
- No profile persistence to disk
- Incomplete UI components

**Impact**: Users cannot:
- Set up new environments from scratch
- Configure Azure AD connections
- Plan migrations between tenants
- Validate environment connectivity
- Persist profiles across sessions

**Recommendation**: Follow Tasks 2-10 systematically to achieve feature parity. Estimated effort: 40-60 development hours across all tasks.
