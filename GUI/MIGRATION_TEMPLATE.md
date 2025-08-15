# 🔄 Migration Template: Legacy View → Unified Pipeline

Use this template to systematically migrate legacy views to the unified pipeline architecture.

## 📋 **Pre-Migration Checklist**

- [ ] Identify data model (UserData, GroupData, etc.)
- [ ] Verify CsvDataService loader exists (LoadUsersAsync, LoadGroupsAsync, etc.)
- [ ] Review CSV file patterns and expected headers
- [ ] Check existing view functionality to preserve
- [ ] Plan UI layout using four-state pattern

---

## 🔧 **Step 1: Create New ViewModel**

```csharp
using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// [ViewName] ViewModel using unified loading pipeline
    /// </summary>
    public class [ViewName]ViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<[DataType]> [DataCollection] { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => [DataCollection].Count > 0;
        
        public [ViewName]ViewModelNew(
            CsvDataServiceNew csvService, 
            ILogger<[ViewName]ViewModelNew> logger, 
            ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }
        
        /// <summary>
        /// Unified LoadAsync implementation - follows exact specification pattern
        /// </summary>
        public override async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                _log.LogDebug($"[{GetType().Name}] Load start");
                
                // Use appropriate loader method
                var result = await _csvService.Load[DataType]Async(_profileService.CurrentProfile);
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection
                [DataCollection].Clear();
                foreach (var item in result.Data) 
                    [DataCollection].Add(item);
                
                HasData = [DataCollection].Count > 0;
                
                _log.LogInformation($"[{GetType().Name}] Load ok rows={[DataCollection].Count}");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                _log.LogError($"[{GetType().Name}] Load fail ex={ex}");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}
```

**Template Variables to Replace:**
- `[ViewName]` - e.g., "Groups", "Applications", "Infrastructure"
- `[DataType]` - e.g., "GroupData", "ApplicationData", "InfrastructureData"
- `[DataCollection]` - e.g., "Groups", "Applications", "Infrastructure"

---

## 🎨 **Step 2: Create New XAML View**

```xml
<UserControl x:Class="MandADiscoverySuite.Views.[ViewName]ViewNew"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             mc:Ignorable="d"
             d:DesignHeight="600" d:DesignWidth="1000">
    
    <UserControl.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary Source="/GUI/Resources/Converters.xaml"/>
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </UserControl.Resources>
    
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>  <!-- Header -->
            <RowDefinition Height="Auto"/>  <!-- Warning Banners -->
            <RowDefinition Height="Auto"/>  <!-- Error Banner -->
            <RowDefinition Height="Auto"/>  <!-- Loading -->
            <RowDefinition Height="*"/>     <!-- Data -->
        </Grid.RowDefinitions>
        
        <!-- Header Section -->
        <StackPanel Grid.Row="0" Orientation="Horizontal" Margin="10">
            <TextBlock Text="[ViewName]" FontSize="24" FontWeight="Bold" 
                       VerticalAlignment="Center"/>
            <TextBlock Text="{Binding [DataCollection].Count, StringFormat='({0} items)'}" 
                       FontSize="16" Margin="10,0,0,0" VerticalAlignment="Center"
                       Visibility="{Binding HasData, Converter={StaticResource BoolToVisibility}}"/>
        </StackPanel>
        
        <!-- Red Warning Banners for Missing CSV Headers -->
        <ItemsControl Grid.Row="1" ItemsSource="{Binding HeaderWarnings}" 
                      Margin="10,0,10,10"
                      Visibility="{Binding HeaderWarnings.Count, Converter={StaticResource CountToVisibility}}">
            <ItemsControl.ItemTemplate>
                <DataTemplate>
                    <Border Background="#55FF0000" BorderBrush="#FF0000" BorderThickness="1" 
                            CornerRadius="4" Margin="0,0,0,8" Padding="8">
                        <StackPanel Orientation="Horizontal">
                            <TextBlock Text="⚠" FontSize="16" Foreground="White" 
                                       VerticalAlignment="Center" Margin="0,0,8,0"/>
                            <TextBlock Text="{Binding}" TextWrapping="Wrap" Foreground="White"
                                       VerticalAlignment="Center"/>
                        </StackPanel>
                    </Border>
                </DataTemplate>
            </ItemsControl.ItemTemplate>
        </ItemsControl>
        
        <!-- Error Banner -->
        <Border Grid.Row="2" Background="#55FF4444" BorderBrush="#FF4444" BorderThickness="1" 
                CornerRadius="4" Margin="10,0,10,10" Padding="8"
                Visibility="{Binding LastError, Converter={StaticResource NullToVisibility}}">
            <StackPanel Orientation="Horizontal">
                <TextBlock Text="❌" FontSize="16" Foreground="White" 
                           VerticalAlignment="Center" Margin="0,0,8,0"/>
                <TextBlock Text="{Binding LastError}" TextWrapping="Wrap" Foreground="White"
                           VerticalAlignment="Center"/>
            </StackPanel>
        </Border>
        
        <!-- Loading Spinner -->
        <Border Grid.Row="3" HorizontalAlignment="Center" Margin="10"
                Visibility="{Binding IsLoading, Converter={StaticResource BoolToVisibility}}">
            <StackPanel Orientation="Horizontal">
                <ProgressBar IsIndeterminate="True" Width="200" Height="20" 
                             VerticalAlignment="Center"/>
                <TextBlock Text="Loading [ViewName]..." Margin="10,0,0,0" 
                           VerticalAlignment="Center"/>
            </StackPanel>
        </Border>
        
        <!-- Data Grid -->
        <DataGrid Grid.Row="4" ItemsSource="{Binding [DataCollection]}" 
                  AutoGenerateColumns="False" Margin="10"
                  Visibility="{Binding HasData, Converter={StaticResource BoolToVisibility}}"
                  CanUserAddRows="False" CanUserDeleteRows="False" 
                  SelectionMode="Extended" GridLinesVisibility="Horizontal">
            
            <DataGrid.Columns>
                <!-- Add columns matching your data model properties -->
                <!-- Example for UserData: -->
                <DataGridTextColumn Header="Display Name" Binding="{Binding DisplayName}" Width="*"/>
                <DataGridTextColumn Header="Email" Binding="{Binding Mail}" Width="*"/>
                <DataGridTextColumn Header="Department" Binding="{Binding Department}" Width="*"/>
                <DataGridTextColumn Header="Job Title" Binding="{Binding JobTitle}" Width="*"/>
                <DataGridCheckBoxColumn Header="Enabled" Binding="{Binding AccountEnabled}" Width="Auto"/>
                <!-- Add more columns as needed -->
            </DataGrid.Columns>
            
        </DataGrid>
        
        <!-- No Data Message -->
        <Border Grid.Row="4" HorizontalAlignment="Center" VerticalAlignment="Center"
                Visibility="{Binding HasData, Converter={StaticResource InverseBoolToVisibility}}">
            <StackPanel Orientation="Vertical" HorizontalAlignment="Center">
                <TextBlock Text="📊" FontSize="48" HorizontalAlignment="Center" Opacity="0.5"/>
                <TextBlock Text="No [ViewName] data found" FontSize="16" HorizontalAlignment="Center" 
                           Margin="0,10,0,0" Opacity="0.7"/>
                <TextBlock Text="Check CSV files in data directory" FontSize="12" HorizontalAlignment="Center" 
                           Margin="0,5,0,0" Opacity="0.5"/>
            </StackPanel>
        </Border>
        
    </Grid>
</UserControl>
```

---

## 🔗 **Step 3: Create Code-Behind**

```csharp
using System.Windows.Controls;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for [ViewName]ViewNew.xaml
    /// </summary>
    public partial class [ViewName]ViewNew : UserControl
    {
        public [ViewName]ViewNew()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            var vmLogger = loggerFactory.CreateLogger<[ViewName]ViewModelNew>();
            
            var csvService = new CsvDataServiceNew(csvLogger);
            var profileService = ProfileService.Instance;
            
            // Create and set ViewModel
            var vm = new [ViewName]ViewModelNew(csvService, vmLogger, profileService);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }
    }
}
```

---

## 🔧 **Step 4: Update ViewRegistry**

Add to ViewRegistry registration:

```csharp
public void RegisterViews()
{
    // ... existing registrations ...
    Register("[ViewName]", () => new [ViewName]ViewNew());
}
```

---

## ✅ **Step 5: Testing Checklist**

### **Basic Functionality**
- [ ] View loads without errors
- [ ] Data displays correctly
- [ ] Loading spinner shows during load
- [ ] No infinite spinners

### **Header Verification**
- [ ] Complete CSV files load cleanly (no warnings)
- [ ] CSV files with missing columns show red warning banners
- [ ] Warning messages include file name and missing columns
- [ ] Data still loads with default values for missing columns

### **Error Handling**
- [ ] File not found shows appropriate error
- [ ] Malformed CSV shows error message
- [ ] Network issues handled gracefully
- [ ] Error banner displays correctly

### **Performance**
- [ ] Large CSV files load in reasonable time
- [ ] Memory usage is reasonable
- [ ] UI remains responsive during loading

---

## 📊 **Common Data Model Mappings**

### **Users** → **UserData**
```csharp
var result = await _csvService.LoadUsersAsync(_profileService.CurrentProfile);
// Expected: DisplayName, UserPrincipalName, Mail, Department, JobTitle, AccountEnabled, SamAccountName, CompanyName, ManagerDisplayName, CreatedDateTime
```

### **Groups** → **GroupData**
```csharp
var result = await _csvService.LoadGroupsAsync(_profileService.CurrentProfile);
// Expected: DisplayName, GroupType, MailEnabled, SecurityEnabled, Mail, CreatedDateTime, MemberCount, OwnerCount, Visibility, Description
```

### **Infrastructure** → **InfrastructureData**
```csharp
var result = await _csvService.LoadInfrastructureAsync(_profileService.CurrentProfile);
// Expected: Name, Type, Description, IPAddress, OperatingSystem, Version, Location, Status, Manufacturer, Model, LastSeen
```

### **Applications** → **ApplicationData**
```csharp
var result = await _csvService.LoadApplicationsAsync(_profileService.CurrentProfile);
// Expected: Name, Version, Publisher, Type, UserCount, GroupCount, DeviceCount, LastSeen
```

### **FileServers** → **FileServerData**
```csharp
var result = await _csvService.LoadFileServersAsync(_profileService.CurrentProfile);
// Expected: ServerName, OS, Version, Location, ShareCount, TotalSizeGB, LastScan
```

### **Databases** → **DatabaseData**
```csharp
var result = await _csvService.LoadDatabasesAsync(_profileService.CurrentProfile);
// Expected: Server, Instance, Version, Edition, DatabaseCount, TotalSizeGB, LastSeen, Engine
```

### **GroupPolicies** → **PolicyData**
```csharp
var result = await _csvService.LoadGroupPoliciesAsync(_profileService.CurrentProfile);
// Expected: Name, Path, Scope, LinkedOUs, Enabled, ComputerSettingsEnabled, UserSettingsEnabled, CreatedTime, ModifiedTime, Description
```

---

## 🎯 **Success Criteria**

Your migrated view is complete when:

- ✅ **Four UI states work**: loading, error, warnings, data
- ✅ **Red warning banners appear** for missing CSV columns
- ✅ **Structured logging works** (check gui-debug.log)
- ✅ **Data loads correctly** from CSV files
- ✅ **Error handling works** for various failure scenarios
- ✅ **Performance is acceptable** for expected data volumes
- ✅ **Code follows unified patterns** established in the architecture

Use UsersViewNew as your reference implementation - it demonstrates all these patterns working correctly.