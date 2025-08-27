# Migration Platform Component Specifications
## Detailed Technical Design for ShareGate-Quality Implementation

**Version:** 1.0  
**Date:** 2025-08-23  
**Author:** Senior Technical Architecture Lead

---

## 1. User-by-User Management Component

### 1.1 ViewModel: UserManagementViewModel

```csharp
namespace MandADiscoverySuite.ViewModels
{
    public class UserManagementViewModel : BaseViewModel
    {
        // Properties
        public ObservableCollection<UserMigrationItem> Users { get; set; }
        public ObservableCollection<MigrationWave> AvailableWaves { get; set; }
        public ObservableCollection<GroupMapping> GroupMappings { get; set; }
        public UserMigrationItem SelectedUser { get; set; }
        public List<UserMigrationItem> SelectedUsers { get; set; }
        public string SearchFilter { get; set; }
        public string SourceDomain { get; set; }
        public string TargetDomain { get; set; }
        public bool ShowOnlyConflicts { get; set; }
        public bool ShowOnlyUnmapped { get; set; }
        
        // Statistics
        public int TotalUsers { get; set; }
        public int MappedUsers { get; set; }
        public int UsersWithConflicts { get; set; }
        public int UsersInWaves { get; set; }
        
        // Commands
        public ICommand SelectAllCommand { get; set; }
        public ICommand SelectNoneCommand { get; set; }
        public ICommand InvertSelectionCommand { get; set; }
        public ICommand AssignToWaveCommand { get; set; }
        public ICommand RemoveFromWaveCommand { get; set; }
        public ICommand ValidateUsersCommand { get; set; }
        public ICommand AutoMapUsersCommand { get; set; }
        public ICommand ResolveConflictsCommand { get; set; }
        public ICommand ExportMappingsCommand { get; set; }
        public ICommand ImportMappingsCommand { get; set; }
        
        // Methods
        public async Task LoadUsersAsync(string discoveryPath);
        public async Task ValidateUserMappingsAsync();
        public async Task AutoMapUsersAsync(MappingStrategy strategy);
        public void AssignUsersToWave(List<UserMigrationItem> users, MigrationWave wave);
        public async Task<ValidationResult> PreFlightCheckAsync(List<UserMigrationItem> users);
    }
}
```

### 1.2 Model: UserMigrationItem

```csharp
public class UserMigrationItem : INotifyPropertyChanged
{
    // Identity Properties
    public string SourceSamAccountName { get; set; }
    public string SourceUserPrincipalName { get; set; }
    public string SourceDistinguishedName { get; set; }
    public string SourceSid { get; set; }
    public string SourceDomain { get; set; }
    
    // Target Mapping
    public string TargetSamAccountName { get; set; }
    public string TargetUserPrincipalName { get; set; }
    public string TargetDistinguishedName { get; set; }
    public string TargetDomain { get; set; }
    public MappingStatus MappingStatus { get; set; }
    
    // User Attributes
    public string DisplayName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Department { get; set; }
    public string Title { get; set; }
    public string Manager { get; set; }
    public string Office { get; set; }
    
    // Migration Properties
    public MigrationWave AssignedWave { get; set; }
    public int Priority { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public MigrationStatus Status { get; set; }
    public double ProgressPercentage { get; set; }
    
    // Associated Objects
    public MailboxInfo Mailbox { get; set; }
    public ProfileInfo Profile { get; set; }
    public List<GroupMembership> Groups { get; set; }
    public List<SharePointAccess> SharePointSites { get; set; }
    public List<FileShareAccess> FileShares { get; set; }
    
    // Validation and Conflicts
    public List<ValidationIssue> ValidationIssues { get; set; }
    public List<MappingConflict> Conflicts { get; set; }
    public bool HasConflicts => Conflicts?.Any() ?? false;
    public bool IsValid { get; set; }
    
    // UI Properties
    public bool IsSelected { get; set; }
    public bool IsExpanded { get; set; }
    public string StatusColor { get; set; }
    public string IconPath { get; set; }
}
```

### 1.3 View: UserManagementView.xaml

```xml
<UserControl x:Class="MandADiscoverySuite.Views.UserManagementView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/> <!-- Toolbar -->
            <RowDefinition Height="Auto"/> <!-- Filter Bar -->
            <RowDefinition Height="*"/>    <!-- User Grid -->
            <RowDefinition Height="200"/>  <!-- Details Panel -->
            <RowDefinition Height="Auto"/> <!-- Status Bar -->
        </Grid.RowDefinitions>
        
        <!-- Toolbar -->
        <ToolBar Grid.Row="0">
            <Button Command="{Binding SelectAllCommand}" Content="Select All"/>
            <Button Command="{Binding SelectNoneCommand}" Content="Select None"/>
            <Button Command="{Binding InvertSelectionCommand}" Content="Invert"/>
            <Separator/>
            <Button Command="{Binding AssignToWaveCommand}" Content="Assign to Wave"/>
            <ComboBox ItemsSource="{Binding AvailableWaves}" Width="200"/>
            <Separator/>
            <Button Command="{Binding ValidateUsersCommand}" Content="Validate"/>
            <Button Command="{Binding AutoMapUsersCommand}" Content="Auto-Map"/>
            <Button Command="{Binding ResolveConflictsCommand}" Content="Resolve Conflicts"/>
            <Separator/>
            <Button Command="{Binding ExportMappingsCommand}" Content="Export"/>
            <Button Command="{Binding ImportMappingsCommand}" Content="Import"/>
        </ToolBar>
        
        <!-- Filter Bar -->
        <Grid Grid.Row="1" Margin="5">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="200"/>
                <ColumnDefinition Width="200"/>
                <ColumnDefinition Width="150"/>
                <ColumnDefinition Width="150"/>
                <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>
            
            <TextBox Grid.Column="0" Text="{Binding SearchFilter}" 
                     Tag="Search users..."/>
            <ComboBox Grid.Column="1" SelectedItem="{Binding WaveFilter}"/>
            <CheckBox Grid.Column="2" IsChecked="{Binding ShowOnlyConflicts}" 
                      Content="Conflicts Only"/>
            <CheckBox Grid.Column="3" IsChecked="{Binding ShowOnlyUnmapped}" 
                      Content="Unmapped Only"/>
        </Grid>
        
        <!-- User Grid -->
        <DataGrid Grid.Row="2" 
                  ItemsSource="{Binding Users}"
                  SelectedItem="{Binding SelectedUser}"
                  AutoGenerateColumns="False"
                  CanUserAddRows="False"
                  SelectionMode="Extended"
                  VirtualizingPanel.IsVirtualizing="True"
                  VirtualizingPanel.VirtualizationMode="Recycling">
            <DataGrid.Columns>
                <DataGridCheckBoxColumn Header="" 
                                        Binding="{Binding IsSelected}" 
                                        Width="30"/>
                <DataGridTextColumn Header="Status" 
                                    Binding="{Binding Status}" 
                                    Width="80"/>
                <DataGridTextColumn Header="Display Name" 
                                    Binding="{Binding DisplayName}" 
                                    Width="200"/>
                <DataGridTextColumn Header="Source Account" 
                                    Binding="{Binding SourceSamAccountName}" 
                                    Width="150"/>
                <DataGridTextColumn Header="Target Account" 
                                    Binding="{Binding TargetSamAccountName}" 
                                    Width="150"/>
                <DataGridTextColumn Header="Department" 
                                    Binding="{Binding Department}" 
                                    Width="150"/>
                <DataGridComboBoxColumn Header="Wave" 
                                        SelectedItemBinding="{Binding AssignedWave}" 
                                        Width="150"/>
                <DataGridTextColumn Header="Priority" 
                                    Binding="{Binding Priority}" 
                                    Width="60"/>
                <DataGridTemplateColumn Header="Conflicts" Width="80">
                    <DataGridTemplateColumn.CellTemplate>
                        <DataTemplate>
                            <StackPanel Orientation="Horizontal">
                                <Image Source="/Icons/warning.png" 
                                       Visibility="{Binding HasConflicts, 
                                                   Converter={StaticResource BoolToVisibilityConverter}}"/>
                                <TextBlock Text="{Binding Conflicts.Count}"/>
                            </StackPanel>
                        </DataTemplate>
                    </DataGridTemplateColumn.CellTemplate>
                </DataGridTemplateColumn>
                <DataGridProgressBarColumn Header="Progress" 
                                          Binding="{Binding ProgressPercentage}" 
                                          Width="100"/>
            </DataGrid.Columns>
            
            <!-- Context Menu -->
            <DataGrid.ContextMenu>
                <ContextMenu>
                    <MenuItem Header="Edit Mapping" Command="{Binding EditMappingCommand}"/>
                    <MenuItem Header="View Details" Command="{Binding ViewDetailsCommand}"/>
                    <Separator/>
                    <MenuItem Header="Assign to Wave" Command="{Binding AssignToWaveCommand}"/>
                    <MenuItem Header="Set Priority" Command="{Binding SetPriorityCommand}"/>
                    <Separator/>
                    <MenuItem Header="Validate" Command="{Binding ValidateCommand}"/>
                    <MenuItem Header="Resolve Conflicts" Command="{Binding ResolveConflictsCommand}"/>
                </ContextMenu>
            </DataGrid.ContextMenu>
        </DataGrid>
        
        <!-- Details Panel -->
        <TabControl Grid.Row="3">
            <TabItem Header="User Details">
                <Grid>
                    <!-- User attribute details -->
                </Grid>
            </TabItem>
            <TabItem Header="Group Memberships">
                <DataGrid ItemsSource="{Binding SelectedUser.Groups}"/>
            </TabItem>
            <TabItem Header="Associated Objects">
                <Grid>
                    <!-- Mailbox, Profile, SharePoint, etc. -->
                </Grid>
            </TabItem>
            <TabItem Header="Validation Issues">
                <DataGrid ItemsSource="{Binding SelectedUser.ValidationIssues}"/>
            </TabItem>
        </TabControl>
        
        <!-- Status Bar -->
        <StatusBar Grid.Row="4">
            <StatusBarItem Content="{Binding TotalUsers, StringFormat='Total: {0}'}"/>
            <Separator/>
            <StatusBarItem Content="{Binding MappedUsers, StringFormat='Mapped: {0}'}"/>
            <Separator/>
            <StatusBarItem Content="{Binding UsersWithConflicts, StringFormat='Conflicts: {0}'}"/>
            <Separator/>
            <StatusBarItem Content="{Binding UsersInWaves, StringFormat='In Waves: {0}'}"/>
        </StatusBar>
    </Grid>
</UserControl>
```

---

## 2. Group Remapping Component

### 2.1 ViewModel: GroupMappingViewModel

```csharp
public class GroupMappingViewModel : BaseViewModel
{
    // Properties
    public ObservableCollection<GroupMappingRule> MappingRules { get; set; }
    public ObservableCollection<SourceGroup> SourceGroups { get; set; }
    public ObservableCollection<TargetGroup> TargetGroups { get; set; }
    public GroupMappingRule SelectedRule { get; set; }
    public MappingStrategy CurrentStrategy { get; set; }
    
    // Mapping Types
    public bool EnableOneToOne { get; set; }
    public bool EnableOneToMany { get; set; }
    public bool EnableManyToOne { get; set; }
    
    // Naming Conventions
    public string PrefixPattern { get; set; }
    public string SuffixPattern { get; set; }
    public string ReplacementPattern { get; set; }
    public bool PreserveDomainPrefix { get; set; }
    public ConflictResolutionStrategy ConflictStrategy { get; set; }
    
    // Commands
    public ICommand CreateRuleCommand { get; set; }
    public ICommand EditRuleCommand { get; set; }
    public ICommand DeleteRuleCommand { get; set; }
    public ICommand TestRuleCommand { get; set; }
    public ICommand AutoGenerateRulesCommand { get; set; }
    public ICommand ValidateMappingsCommand { get; set; }
    public ICommand PreviewMappingsCommand { get; set; }
    public ICommand ApplyMappingsCommand { get; set; }
    
    // Methods
    public async Task<List<GroupMappingRule>> AutoGenerateRulesAsync();
    public GroupMappingPreview PreviewMapping(GroupMappingRule rule);
    public ValidationResult ValidateMapping(GroupMappingRule rule);
    public async Task ApplyMappingsAsync(List<GroupMappingRule> rules);
}
```

### 2.2 Model: GroupMappingRule

```csharp
public class GroupMappingRule
{
    public string RuleId { get; set; }
    public string RuleName { get; set; }
    public MappingType Type { get; set; } // OneToOne, OneToMany, ManyToOne
    public int Priority { get; set; }
    
    // Source Configuration
    public List<string> SourceGroups { get; set; }
    public string SourcePattern { get; set; } // Regex pattern
    public GroupScope SourceScope { get; set; } // Domain, Global, Universal
    public GroupType SourceType { get; set; } // Security, Distribution
    
    // Target Configuration
    public List<string> TargetGroups { get; set; }
    public string TargetNameTemplate { get; set; }
    public GroupScope TargetScope { get; set; }
    public GroupType TargetType { get; set; }
    
    // Transformation Rules
    public string PrefixToAdd { get; set; }
    public string SuffixToAdd { get; set; }
    public Dictionary<string, string> StringReplacements { get; set; }
    public bool ConvertToUpperCase { get; set; }
    public bool ConvertToLowerCase { get; set; }
    
    // Member Handling
    public bool MigrateMembers { get; set; }
    public bool MergeWithExisting { get; set; }
    public bool PreserveNestedGroups { get; set; }
    public ConflictResolution MemberConflictResolution { get; set; }
    
    // Conditions
    public List<RuleCondition> Conditions { get; set; }
    public bool IsEnabled { get; set; }
    
    // Validation
    public List<ValidationIssue> ValidationIssues { get; set; }
    public bool IsValid { get; set; }
}

public class RuleCondition
{
    public string Property { get; set; } // e.g., "MemberCount", "GroupName"
    public ConditionOperator Operator { get; set; } // GreaterThan, Contains, etc.
    public object Value { get; set; }
    public LogicalOperator CombineWith { get; set; } // AND, OR
}
```

### 2.3 Service: GroupMappingService

```csharp
public class GroupMappingService
{
    private readonly PowerShellExecutionService _powerShellService;
    private readonly ILogger<GroupMappingService> _logger;
    
    public async Task<GroupMappingResult> ExecuteMappingAsync(
        GroupMappingRule rule,
        Dictionary<string, object> context)
    {
        var result = new GroupMappingResult();
        
        try
        {
            // Build PowerShell script for group mapping
            var script = BuildMappingScript(rule);
            
            // Execute with progress tracking
            await _powerShellService.ExecuteWithProgressAsync(
                script,
                parameters: new Dictionary<string, object>
                {
                    { "SourceGroups", rule.SourceGroups },
                    { "TargetTemplate", rule.TargetNameTemplate },
                    { "MappingType", rule.Type.ToString() },
                    { "Conditions", SerializeConditions(rule.Conditions) }
                },
                progressCallback: (progress) =>
                {
                    result.ProgressPercentage = progress.PercentComplete;
                    result.CurrentOperation = progress.Activity;
                    OnProgressChanged?.Invoke(progress);
                });
            
            result.Success = true;
            result.MappedGroups = ParseMappingResults();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Group mapping failed for rule {RuleId}", rule.RuleId);
            result.Success = false;
            result.Error = ex.Message;
        }
        
        return result;
    }
    
    private string BuildMappingScript(GroupMappingRule rule)
    {
        return $@"
            Import-Module .\Modules\Migration\UserMigration.psm1
            
            $migration = [UserMigration]::new($SourceDomain, $TargetDomain)
            
            # Configure mapping based on type
            switch ('{rule.Type}') {{
                'OneToOne' {{
                    $migration.AddOneToOneGroupMapping($SourceGroups[0], $TargetGroups[0])
                }}
                'OneToMany' {{
                    $migration.AddOneToManyGroupMapping($SourceGroups[0], $TargetGroups)
                }}
                'ManyToOne' {{
                    $migration.AddManyToOneGroupMapping($SourceGroups, $TargetGroups[0])
                }}
            }}
            
            # Apply naming conventions
            $migration.SetGroupNamingConvention('Prefix', '{rule.PrefixToAdd}')
            $migration.SetGroupNamingConvention('Suffix', '{rule.SuffixToAdd}')
            
            # Execute mapping
            $migration.ExecuteGroupMapping()
        ";
    }
}
```

---

## 3. Real-Time Progress Monitoring Component

### 3.1 ViewModel: MigrationMonitorViewModel

```csharp
public class MigrationMonitorViewModel : BaseViewModel
{
    // Real-time Metrics
    public ObservableCollection<MigrationSession> ActiveSessions { get; set; }
    public MigrationSession SelectedSession { get; set; }
    public ObservableCollection<ProgressMetric> CurrentMetrics { get; set; }
    public ObservableCollection<LogEntry> LiveLogs { get; set; }
    
    // Progress Tracking
    public double OverallProgress { get; set; }
    public string CurrentPhase { get; set; }
    public int ItemsCompleted { get; set; }
    public int ItemsTotal { get; set; }
    public double ItemsPerSecond { get; set; }
    public double DataTransferRate { get; set; } // MB/s
    public TimeSpan ElapsedTime { get; set; }
    public TimeSpan EstimatedTimeRemaining { get; set; }
    
    // Type-specific Progress
    public TypeProgress UserProgress { get; set; }
    public TypeProgress GroupProgress { get; set; }
    public TypeProgress MailboxProgress { get; set; }
    public TypeProgress SharePointProgress { get; set; }
    public TypeProgress FileSystemProgress { get; set; }
    public TypeProgress VMProgress { get; set; }
    
    // Performance Metrics
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double NetworkUtilization { get; set; }
    public double DiskIORate { get; set; }
    public int ActiveThreads { get; set; }
    public int QueueDepth { get; set; }
    
    // Error Tracking
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public ObservableCollection<ErrorDetail> RecentErrors { get; set; }
    public bool HasCriticalErrors { get; set; }
    
    // Commands
    public ICommand PauseSessionCommand { get; set; }
    public ICommand ResumeSessionCommand { get; set; }
    public ICommand CancelSessionCommand { get; set; }
    public ICommand ViewDetailsCommand { get; set; }
    public ICommand ExportLogsCommand { get; set; }
    public ICommand ClearLogsCommand { get; set; }
    
    // Real-time Update Timer
    private Timer _updateTimer;
    private readonly IProgressStreamingService _progressService;
    
    public MigrationMonitorViewModel(IProgressStreamingService progressService)
    {
        _progressService = progressService;
        InitializeRealTimeUpdates();
    }
    
    private void InitializeRealTimeUpdates()
    {
        _updateTimer = new Timer(UpdateMetrics, null, 
            TimeSpan.FromSeconds(2), 
            TimeSpan.FromSeconds(2));
        
        _progressService.ProgressStream.Subscribe(OnProgressUpdate);
    }
    
    private void OnProgressUpdate(MigrationProgress progress)
    {
        Application.Current.Dispatcher.InvokeAsync(() =>
        {
            UpdateProgressMetrics(progress);
            UpdatePerformanceMetrics(progress);
            UpdateLiveLogs(progress);
        });
    }
}
```

### 3.2 Service: ProgressStreamingService

```csharp
public class ProgressStreamingService : IProgressStreamingService
{
    private readonly Subject<MigrationProgress> _progressSubject;
    private readonly ConcurrentDictionary<string, SessionProgress> _sessions;
    private readonly Timer _aggregationTimer;
    
    public IObservable<MigrationProgress> ProgressStream => 
        _progressSubject.AsObservable();
    
    public ProgressStreamingService()
    {
        _progressSubject = new Subject<MigrationProgress>();
        _sessions = new ConcurrentDictionary<string, SessionProgress>();
        _aggregationTimer = new Timer(AggregateMetrics, null, 
            TimeSpan.FromSeconds(5), 
            TimeSpan.FromSeconds(5));
    }
    
    public void StreamProgress(string sessionId, ProgressUpdate update)
    {
        var progress = new MigrationProgress
        {
            SessionId = sessionId,
            Timestamp = DateTime.Now,
            ItemType = update.ItemType,
            ItemName = update.ItemName,
            PercentComplete = update.PercentComplete,
            Status = update.Status,
            Message = update.Message,
            BytesTransferred = update.BytesTransferred,
            ItemsProcessed = update.ItemsProcessed,
            Errors = update.Errors
        };
        
        // Update session tracking
        _sessions.AddOrUpdate(sessionId, 
            new SessionProgress { SessionId = sessionId },
            (key, existing) => 
            {
                existing.LastUpdate = DateTime.Now;
                existing.TotalItems += update.ItemsProcessed;
                existing.TotalBytes += update.BytesTransferred;
                return existing;
            });
        
        // Stream to subscribers
        _progressSubject.OnNext(progress);
    }
    
    private void AggregateMetrics(object state)
    {
        var aggregated = new AggregatedMetrics
        {
            TotalSessions = _sessions.Count,
            ActiveSessions = _sessions.Count(s => s.Value.IsActive),
            TotalItemsProcessed = _sessions.Sum(s => s.Value.TotalItems),
            TotalBytesTransferred = _sessions.Sum(s => s.Value.TotalBytes),
            AverageSpeed = CalculateAverageSpeed(),
            EstimatedCompletion = CalculateEstimatedCompletion()
        };
        
        _progressSubject.OnNext(new MigrationProgress
        {
            Type = ProgressType.Aggregated,
            Metrics = aggregated
        });
    }
}
```

### 3.3 View: MigrationMonitorView.xaml

```xml
<UserControl x:Class="MandADiscoverySuite.Views.MigrationMonitorView">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="150"/> <!-- Metrics Dashboard -->
            <RowDefinition Height="*"/>   <!-- Progress Details -->
            <RowDefinition Height="200"/> <!-- Live Logs -->
        </Grid.RowDefinitions>
        
        <!-- Metrics Dashboard -->
        <Grid Grid.Row="0">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>
            
            <!-- Overall Progress -->
            <Border Grid.Column="0" Style="{StaticResource MetricCard}">
                <StackPanel>
                    <TextBlock Text="Overall Progress" Style="{StaticResource MetricTitle}"/>
                    <Grid>
                        <ProgressBar Value="{Binding OverallProgress}" Height="30"/>
                        <TextBlock Text="{Binding OverallProgress, StringFormat='{}{0:F1}%'}" 
                                   HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Grid>
                    <TextBlock Text="{Binding CurrentPhase}" Style="{StaticResource MetricSubtitle}"/>
                </StackPanel>
            </Border>
            
            <!-- Items Progress -->
            <Border Grid.Column="1" Style="{StaticResource MetricCard}">
                <StackPanel>
                    <TextBlock Text="Items Progress" Style="{StaticResource MetricTitle}"/>
                    <TextBlock>
                        <Run Text="{Binding ItemsCompleted}"/>
                        <Run Text=" / "/>
                        <Run Text="{Binding ItemsTotal}"/>
                    </TextBlock>
                    <TextBlock Text="{Binding ItemsPerSecond, StringFormat='{}{0:F1} items/sec'}"/>
                </StackPanel>
            </Border>
            
            <!-- Data Transfer -->
            <Border Grid.Column="2" Style="{StaticResource MetricCard}">
                <StackPanel>
                    <TextBlock Text="Data Transfer" Style="{StaticResource MetricTitle}"/>
                    <TextBlock Text="{Binding DataTransferRate, StringFormat='{}{0:F1} MB/s'}"/>
                    <TextBlock Text="{Binding TotalDataTransferred, StringFormat='{}{0:F1} GB'}"/>
                </StackPanel>
            </Border>
            
            <!-- Time Metrics -->
            <Border Grid.Column="3" Style="{StaticResource MetricCard}">
                <StackPanel>
                    <TextBlock Text="Time" Style="{StaticResource MetricTitle}"/>
                    <TextBlock Text="{Binding ElapsedTime, StringFormat='Elapsed: {0:hh\\:mm\\:ss}'}"/>
                    <TextBlock Text="{Binding EstimatedTimeRemaining, StringFormat='Remaining: {0:hh\\:mm\\:ss}'}"/>
                </StackPanel>
            </Border>
        </Grid>
        
        <!-- Progress Details -->
        <TabControl Grid.Row="1">
            <TabItem Header="By Type">
                <ItemsControl ItemsSource="{Binding TypeProgressList}">
                    <ItemsControl.ItemTemplate>
                        <DataTemplate>
                            <Grid Margin="5">
                                <Grid.ColumnDefinitions>
                                    <ColumnDefinition Width="150"/>
                                    <ColumnDefinition Width="*"/>
                                    <ColumnDefinition Width="100"/>
                                </Grid.ColumnDefinitions>
                                
                                <TextBlock Grid.Column="0" Text="{Binding TypeName}"/>
                                <ProgressBar Grid.Column="1" Value="{Binding PercentComplete}"/>
                                <TextBlock Grid.Column="2" Text="{Binding Status}"/>
                            </Grid>
                        </DataTemplate>
                    </ItemsControl.ItemTemplate>
                </ItemsControl>
            </TabItem>
            
            <TabItem Header="Active Items">
                <DataGrid ItemsSource="{Binding ActiveItems}" AutoGenerateColumns="False">
                    <DataGrid.Columns>
                        <DataGridTextColumn Header="Item" Binding="{Binding ItemName}" Width="300"/>
                        <DataGridTextColumn Header="Type" Binding="{Binding ItemType}" Width="100"/>
                        <DataGridTextColumn Header="Status" Binding="{Binding Status}" Width="100"/>
                        <DataGridProgressBarColumn Header="Progress" Binding="{Binding Progress}" Width="150"/>
                        <DataGridTextColumn Header="Speed" Binding="{Binding Speed}" Width="100"/>
                        <DataGridTextColumn Header="ETA" Binding="{Binding EstimatedCompletion}" Width="100"/>
                    </DataGrid.Columns>
                </DataGrid>
            </TabItem>
            
            <TabItem Header="Performance">
                <Grid>
                    <!-- Performance charts for CPU, Memory, Network, Disk -->
                </Grid>
            </TabItem>
        </TabControl>
        
        <!-- Live Logs -->
        <Grid Grid.Row="2">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="*"/>
            </Grid.RowDefinitions>
            
            <ToolBar Grid.Row="0">
                <ComboBox SelectedItem="{Binding LogLevelFilter}" Width="100">
                    <ComboBoxItem>All</ComboBoxItem>
                    <ComboBoxItem>Info</ComboBoxItem>
                    <ComboBoxItem>Warning</ComboBoxItem>
                    <ComboBoxItem>Error</ComboBoxItem>
                </ComboBox>
                <TextBox Text="{Binding LogSearchFilter}" Width="200"/>
                <Button Command="{Binding ClearLogsCommand}" Content="Clear"/>
                <Button Command="{Binding ExportLogsCommand}" Content="Export"/>
            </ToolBar>
            
            <DataGrid Grid.Row="1" 
                      ItemsSource="{Binding LiveLogs}" 
                      AutoGenerateColumns="False"
                      ScrollViewer.CanContentScroll="True"
                      VirtualizingPanel.IsVirtualizing="True">
                <DataGrid.Columns>
                    <DataGridTextColumn Header="Time" Binding="{Binding Timestamp, StringFormat='HH:mm:ss.fff'}" Width="100"/>
                    <DataGridTextColumn Header="Level" Binding="{Binding Level}" Width="60"/>
                    <DataGridTextColumn Header="Source" Binding="{Binding Source}" Width="150"/>
                    <DataGridTextColumn Header="Message" Binding="{Binding Message}" Width="*"/>
                </DataGrid.Columns>
                
                <DataGrid.RowStyle>
                    <Style TargetType="DataGridRow">
                        <Style.Triggers>
                            <DataTrigger Binding="{Binding Level}" Value="Error">
                                <Setter Property="Background" Value="#FFE5E5"/>
                            </DataTrigger>
                            <DataTrigger Binding="{Binding Level}" Value="Warning">
                                <Setter Property="Background" Value="#FFFDE5"/>
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </DataGrid.RowStyle>
            </DataGrid>
        </Grid>
    </Grid>
</UserControl>
```

---

## 4. ACL Re-Assignment Component

### 4.1 Service: ACLMigrationService

```csharp
public class ACLMigrationService
{
    private readonly Dictionary<string, string> _sidMappingCache;
    private readonly PowerShellExecutionService _powerShellService;
    
    public async Task<ACLMigrationResult> MigrateACLsAsync(
        string sourcePath, 
        string targetPath,
        string sourceDomain,
        string targetDomain)
    {
        var result = new ACLMigrationResult();
        
        try
        {
            // Step 1: Capture source ACLs
            var sourceACLs = await CaptureSourceACLsAsync(sourcePath);
            result.SourceACLCount = sourceACLs.Count;
            
            // Step 2: Translate SIDs
            var translatedACLs = await TranslateSIDsAsync(
                sourceACLs, 
                sourceDomain, 
                targetDomain);
            
            // Step 3: Apply to target
            var applyResult = await ApplyACLsToTargetAsync(
                targetPath, 
                translatedACLs);
            
            result.Success = applyResult.Success;
            result.AppliedACLCount = applyResult.AppliedCount;
            result.FailedACLCount = applyResult.FailedCount;
            result.OrphanedSIDs = applyResult.OrphanedSIDs;
            
            // Step 4: Validate
            if (result.Success)
            {
                var validation = await ValidateACLsAsync(sourcePath, targetPath);
                result.ValidationPassed = validation.IsValid;
                result.ValidationIssues = validation.Issues;
            }
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Error = ex.Message;
        }
        
        return result;
    }
    
    private async Task<List<ACLEntry>> CaptureSourceACLsAsync(string path)
    {
        var script = @"
            $acl = Get-Acl -Path $path
            $entries = @()
            
            foreach ($access in $acl.Access) {
                $entry = @{
                    IdentityReference = $access.IdentityReference.Value
                    FileSystemRights = $access.FileSystemRights
                    AccessControlType = $access.AccessControlType
                    IsInherited = $access.IsInherited
                    InheritanceFlags = $access.InheritanceFlags
                    PropagationFlags = $access.PropagationFlags
                }
                $entries += $entry
            }
            
            return $entries | ConvertTo-Json
        ";
        
        var result = await _powerShellService.ExecuteScriptAsync(script, 
            new Dictionary<string, object> { { "path", path } });
        
        return JsonConvert.DeserializeObject<List<ACLEntry>>(result);
    }
    
    private async Task<List<TranslatedACL>> TranslateSIDsAsync(
        List<ACLEntry> sourceACLs,
        string sourceDomain,
        string targetDomain)
    {
        var translated = new List<TranslatedACL>();
        
        foreach (var acl in sourceACLs)
        {
            var translatedACL = new TranslatedACL
            {
                Original = acl,
                TranslatedIdentity = await TranslateIdentityAsync(
                    acl.IdentityReference, 
                    sourceDomain, 
                    targetDomain)
            };
            
            translated.Add(translatedACL);
        }
        
        return translated;
    }
    
    private async Task<string> TranslateIdentityAsync(
        string sourceIdentity,
        string sourceDomain,
        string targetDomain)
    {
        // Check cache first
        if (_sidMappingCache.ContainsKey(sourceIdentity))
            return _sidMappingCache[sourceIdentity];
        
        var script = @"
            # Try to resolve the source identity
            try {
                $sourceSid = (New-Object System.Security.Principal.NTAccount($sourceIdentity)).Translate([System.Security.Principal.SecurityIdentifier])
                
                # Look up corresponding account in target domain
                $targetAccount = Get-ADUser -Filter ""objectSid -eq '$sourceSid'"" -Server $targetDomain -ErrorAction SilentlyContinue
                
                if ($targetAccount) {
                    return ""$targetDomain\$($targetAccount.SamAccountName)""
                } else {
                    # Try to find by name
                    $userName = $sourceIdentity.Split('\')[1]
                    $targetAccount = Get-ADUser -Filter ""SamAccountName -eq '$userName'"" -Server $targetDomain -ErrorAction SilentlyContinue
                    
                    if ($targetAccount) {
                        return ""$targetDomain\$($targetAccount.SamAccountName)""
                    }
                }
            } catch {
                # Handle built-in accounts
                if ($sourceIdentity -match 'BUILTIN\\|NT AUTHORITY\\') {
                    return $sourceIdentity
                }
            }
            
            return $null
        ";
        
        var targetIdentity = await _powerShellService.ExecuteScriptAsync(script,
            new Dictionary<string, object>
            {
                { "sourceIdentity", sourceIdentity },
                { "targetDomain", targetDomain }
            });
        
        if (!string.IsNullOrEmpty(targetIdentity))
        {
            _sidMappingCache[sourceIdentity] = targetIdentity;
        }
        
        return targetIdentity;
    }
}
```

---

## Conclusion

These component specifications provide the detailed technical blueprint for implementing a ShareGate/Quest-quality migration platform. Each component is designed with enterprise requirements in mind:

1. **User Management**: Comprehensive user-by-user interface with bulk operations, conflict resolution, and wave assignment
2. **Group Remapping**: Advanced one-to-many and many-to-one mapping capabilities with intelligent naming conventions
3. **Progress Monitoring**: Real-time streaming updates with 2-30 second refresh intervals
4. **ACL Migration**: Complete permission preservation with SID translation and validation

The architecture leverages the existing 15,000+ lines of PowerShell modules while providing a modern, responsive UI that exceeds commercial alternatives in both functionality and user experience.

**Next Steps:**
1. Begin implementation of UserManagementViewModel and associated views
2. Integrate PowerShellExecutionService with real-time progress streaming
3. Implement GroupMappingService with advanced transformation rules
4. Deploy ACLMigrationService for cross-domain permission handling

---

**Document Status:** Complete  
**Implementation Priority:** High  
**Estimated Development Time:** 8-12 weeks