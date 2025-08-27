

## Changelog

**2025-08-18**: Verified all missing views are already implemented. Infrastructure, FileServers, Databases, GroupPolicies, Security, Applications, and Management views all exist with complete XAML, ViewModels, and data loading through CsvDataServiceNew. All views use unified MVVM lifecycle with proper header warnings, filtering, and real CSV data binding. Build successful and application running without binding errors.

## Environment & Build Rules

### Execution
- **Root**: `C:\enterprisediscovery\`
- **Active Profile Data**: `C:\discoverydata\ljpops\Raw\`
- **Secondary Data Root**: `C:\discoverydata\Profiles\ljpops\Raw\`
- **Build**: `Build-GUI.ps1` only
- **Logs Directory**: `C:\discoverydata\ljpops\Logs\`

### Log Files
- `gui-debug.log`  structured: `[TIMESTAMP] [LEVEL] [SOURCE] Message`
- `gui-binding.log`  WPF binding warnings/errors
- `gui-clicks.log`  global click telemetry (type/name/xaml-name)

## Core Architecture

### 1. Unified Loading Pipeline

All views follow the same resilient loading pattern with dynamic CSV header verification:

```csharp
public override async Task LoadAsync() {
    IsLoading = true; 
    HasData = false; 
    LastError = null; 
    HeaderWarnings.Clear();

    try {
        _log.Debug($"[{GetType().Name}] Load start");
        var result = await _csvService.LoadDataAsync(_profile);
        
        foreach (var w in result.HeaderWarnings) 
            HeaderWarnings.Add(w);
        
        Items.Clear();
        foreach (var item in result.Data) 
            Items.Add(item);
        
        HasData = Items.Count > 0;
        _log.Info($"[{GetType().Name}] Load ok rows={Items.Count}");
    }
    catch (Exception ex) {
        LastError = $"Unexpected error: {ex.Message}";
        _log.Error($"[{GetType().Name}] Load fail ex={ex}");
    }
    finally { 
        IsLoading = false; 
    }
}
```

### 2. Immutable Record Models

All data models are immutable C# records:

- `UserData` - User account information
- `GroupData` - Security and distribution groups
- `InfrastructureData` - Computers and devices
- `ApplicationData` - Installed applications
- `FileServerData` & `ShareData` - File servers and shares
- `SqlInstanceData` & `DatabaseData` - Database servers
- `PolicyData` - Group Policy Objects

### 3. Dynamic Header Verification

The `CsvDataServiceNew` implements intelligent header mapping:

- Case-insensitive matching
- Normalizes spaces, underscores, hyphens
- Tolerates both comma and semicolon delimiters
- Handles BOM automatically
- Reports missing columns as warnings (not errors)

Example warning format:
```
[Users] File 'AzureUsers.csv': Missing required columns: Department, JobTitle. Values defaulted.
```

### 4. View Structure

Every view follows this XAML pattern:

```xml
<Grid>
    <!-- Header -->
    <StackPanel>...</StackPanel>
    
    <!-- Header Warnings Banner -->
    <ItemsControl ItemsSource="{Binding HeaderWarnings}" 
                  Visibility="{Binding HeaderWarnings.Count, Converter={StaticResource CountToVisibility}}">
        <Border Background="#55FF0000">
            <TextBlock Text="{Binding}"/>
        </Border>
    </ItemsControl>
    
    <!-- Error Banner -->
    <Border Visibility="{Binding LastError, Converter={StaticResource NullToVisibility}}">
        <TextBlock Text="{Binding LastError}"/>
    </Border>
    
    <!-- Loading Spinner -->
    <Border Visibility="{Binding IsLoading, Converter={StaticResource BoolToVisibility}}">
        <ProgressBar IsIndeterminate="True"/>
    </Border>
    
    <!-- Data Grid -->
    <DataGrid ItemsSource="{Binding Items}" 
              Visibility="{Binding HasData, Converter={StaticResource BoolToVisibility}}"/>
</Grid>
```

## Data Loader Contracts

| Loader | File Patterns | Expected Properties |
|--------|---------------|-------------------|
| LoadUsersAsync | *Users*.csv, AzureUsers.csv, ActiveDirectoryUsers.csv | DisplayName, UserPrincipalName, Mail, Department, JobTitle, AccountEnabled, SamAccountName, CompanyName, ManagerDisplayName, CreatedDateTime |
| LoadGroupsAsync | *Groups*.csv, AzureGroups.csv, ActiveDirectoryGroups.csv, ExchangeDistributionGroups.csv | DisplayName, GroupType, MailEnabled, SecurityEnabled, Mail, CreatedDateTime, MemberCount, OwnerCount, Visibility, Description |
| LoadInfrastructureAsync | *Computer*.csv, *VM*.csv, *Server*.csv, NetworkInfrastructure*.csv, AzureVMs*.csv | Name, Type, Description, IPAddress, OperatingSystem, Version, Location, Status, Manufacturer, Model, LastSeen |
| LoadApplicationsAsync | Applications.csv, ServicePrincipals.csv, AzureApplications*.csv | Name, Version, Publisher, Type, UserCount, GroupCount, DeviceCount, LastSeen |
| LoadFileServersAsync | FileServers.csv, Shares.csv, NTFS*.csv | ServerName, OS, Version, Location, ShareCount, TotalSizeGB, LastScan |
| LoadDatabasesAsync | SqlServers.csv, SqlInstances.csv, Databases.csv | Server, Instance, Version, Edition, DatabaseCount, TotalSizeGB, LastSeen, Engine |
| LoadGroupPoliciesAsync | GPO_*.csv | Name, Path, Scope, LinkedOUs, Enabled, ComputerSettingsEnabled, UserSettingsEnabled, CreatedTime, ModifiedTime, Description |


## Services

### ViewRegistry
- Maps navigation keys to view factories
- Singleton pattern
- Supports dynamic view registration

### TabsService
- Manages tab lifecycle
- Prevents duplicate tabs
- Handles view activation and data loading
- Logs all tab operations to gui-clicks.log

### ProfileService
- Manages current discovery profile
- Currently hardcoded to "ljpops"
- Singleton pattern

### CsvDataServiceNew
- Implements dynamic header verification
- Probes both primary and secondary data paths
- Returns DataLoaderResult<T> with data + warnings
- Structured logging of all operations

## Structured Logging

All components use structured logging with the following format:

```
[2024-08-15 10:30:45.123] [INFO] [CsvDataServiceNew] loader=Users patterns=*Users*.csv,AzureUsers.csv matched=2 rowsPerFile=Users.csv:123;AzureUsers.csv:45 total=168 ms=830
[2024-08-15 10:30:45.234] [WARN] [CsvDataServiceNew] [Users] File 'Users.csv': Missing required columns: Department, JobTitle. Values defaulted.
[2024-08-15 10:30:45.345] [INFO] [UsersViewModel] Load ok rows=168 warnings=1 ms=950
```


### **DEFINITION OF DONE VERIFICATION:**
- ✅ **Every Left-Menu View Exists**: All required views properly implemented and registered
- ✅ **Proper Loading States**: Views show spinner→grid transition or clear "No data" states  
- ✅ **Header Warnings**: CSV mismatches appear as red banners (non-blocking)
- ✅ **Clean Binding Logs**: No indefinite spinners, clean gui-binding.log
- ✅ **Tab Reuse**: TabsService prevents duplicate tabs and manages navigation properly
- ✅ **Assets Merged**: Assets tab removed, functionality integrated into ComputersView

**FINAL OUTCOME:** Complete architectural verification confirms all requirements met. GUI solution demonstrates enterprise-grade MVVM architecture with unified patterns, comprehensive error handling, verified runtime stability, and all user-reported navigation issues resolved.

