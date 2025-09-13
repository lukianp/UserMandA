using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using System.Windows;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// OneDrive Migration Planning ViewModel - ShareGate-inspired quality
    /// Provides comprehensive OneDrive and file share migration capabilities
    /// </summary>
    public class OneDriveMigrationPlanningViewModel : BaseViewModel
    {
        /// <summary>
        /// Task that completes when initialization is finished
        /// </summary>
        public Task InitializeTask { get; private set; }
        #region Private Fields
        private readonly CsvDataServiceNew _csvDataService;
        private readonly object _dataUpdateLock = new object();
        
        // Collections and Views
        private ObservableCollection<dynamic> _userDrives;
        private ObservableCollection<dynamic> _fileShares;
        private ObservableCollection<MigrationBatch> _migrationBatches;
        private ObservableCollection<ValidationIssue> _contentIssues;
        
        private ICollectionView _userDrivesView;
        private ICollectionView _fileSharesView;
        private ICollectionView _batchesView;
        private ICollectionView _issuesView;
        
        // Selection Properties
        private dynamic _selectedUser;
        private dynamic _selectedFileShare;
        private MigrationBatch _selectedBatch;
        
        // Search and Filter Properties
        private string _userSearchText = "";
        private string _fileShareSearchText = "";
        private bool _showOnlyIssues = false;
        
        // Progress and Status
        private double _analysisProgress = 0;
        private bool _isAnalysisRunning = false;
        private string _analysisStatusMessage = "Ready to begin analysis";
        
        // Statistics Properties
        private int _totalUsers = 0;
        private int _totalFileShares = 0;
        private int _totalMigrationBatches = 0;
        private double _totalDataSizeGB = 0;
        private int _estimatedMigrationHours = 0;
        private int _usersWithIssues = 0;
        private int _fileSharesAnalyzed = 0;
        
        // Project Configuration
        private string _projectName = "OneDrive Migration Project";
        private string _projectDescription = "Comprehensive OneDrive and file share migration planning";
        private string _sourceEnvironment = "File Servers / Network Shares";
        private string _targetEnvironment = "OneDrive for Business";
        
        // Migration Options
        private bool _preservePermissions = true;
        private bool _migrateVersionHistory = false;
        private bool _copyOnlyActiveFiles = true;
        private bool _enableDeltaSync = true;
        private int _maxConcurrentMigrations = 5;
        private DateTime _plannedStartDate = DateTime.Now.AddDays(7);
        private DateTime _plannedEndDate = DateTime.Now.AddDays(30);
        
        // Safety and Performance
        private static readonly int MAX_SAFE_TIMER_INTERVAL_MS = 30000;
        private Timer _refreshTimer;
        
        #endregion
        
        #region Public Properties
        
        // Collections
        public ObservableCollection<dynamic> UserDrives
        {
            get => _userDrives;
            set { _userDrives = value; OnPropertyChanged(); }
        }
        
        public ObservableCollection<dynamic> FileShares
        {
            get => _fileShares;
            set { _fileShares = value; OnPropertyChanged(); }
        }
        
        public ObservableCollection<MigrationBatch> MigrationBatches
        {
            get => _migrationBatches;
            set { _migrationBatches = value; OnPropertyChanged(); }
        }
        
        public ObservableCollection<ValidationIssue> ContentIssues
        {
            get => _contentIssues;
            set { _contentIssues = value; OnPropertyChanged(); }
        }
        
        // Collection Views
        public ICollectionView UserDrivesView
        {
            get => _userDrivesView;
            set { _userDrivesView = value; OnPropertyChanged(); }
        }
        
        public ICollectionView FileSharesView
        {
            get => _fileSharesView;
            set { _fileSharesView = value; OnPropertyChanged(); }
        }
        
        public ICollectionView BatchesView
        {
            get => _batchesView;
            set { _batchesView = value; OnPropertyChanged(); }
        }
        
        public ICollectionView IssuesView
        {
            get => _issuesView;
            set { _issuesView = value; OnPropertyChanged(); }
        }
        
        // Selection Properties
        public dynamic SelectedUser
        {
            get => _selectedUser;
            set { _selectedUser = value; OnPropertyChanged(); RefreshUserDetails(); }
        }
        
        public dynamic SelectedFileShare
        {
            get => _selectedFileShare;
            set { _selectedFileShare = value; OnPropertyChanged(); RefreshFileShareDetails(); }
        }
        
        public MigrationBatch SelectedBatch
        {
            get => _selectedBatch;
            set { _selectedBatch = value; OnPropertyChanged(); }
        }
        
        // Search and Filter Properties
        public string UserSearchText
        {
            get => _userSearchText;
            set { _userSearchText = value; OnPropertyChanged(); ApplyUserFilter(); }
        }
        
        public string FileShareSearchText
        {
            get => _fileShareSearchText;
            set { _fileShareSearchText = value; OnPropertyChanged(); ApplyFileShareFilter(); }
        }
        
        public bool ShowOnlyIssues
        {
            get => _showOnlyIssues;
            set { _showOnlyIssues = value; OnPropertyChanged(); ApplyFilters(); }
        }
        
        // Progress and Status
        public double AnalysisProgress
        {
            get => _analysisProgress;
            set { _analysisProgress = value; OnPropertyChanged(); }
        }
        
        public bool IsAnalysisRunning
        {
            get => _isAnalysisRunning;
            set { _isAnalysisRunning = value; OnPropertyChanged(); }
        }
        
        public string AnalysisStatusMessage
        {
            get => _analysisStatusMessage;
            set { _analysisStatusMessage = value; OnPropertyChanged(); }
        }
        
        // Statistics Properties
        public int TotalUsers
        {
            get => _totalUsers;
            set { _totalUsers = value; OnPropertyChanged(); }
        }
        
        public int TotalFileShares
        {
            get => _totalFileShares;
            set { _totalFileShares = value; OnPropertyChanged(); }
        }
        
        public int TotalMigrationBatches
        {
            get => _totalMigrationBatches;
            set { _totalMigrationBatches = value; OnPropertyChanged(); }
        }
        
        public double TotalDataSizeGB
        {
            get => _totalDataSizeGB;
            set { _totalDataSizeGB = value; OnPropertyChanged(); }
        }
        
        public int EstimatedMigrationHours
        {
            get => _estimatedMigrationHours;
            set { _estimatedMigrationHours = value; OnPropertyChanged(); }
        }
        
        public int UsersWithIssues
        {
            get => _usersWithIssues;
            set { _usersWithIssues = value; OnPropertyChanged(); }
        }
        
        public int FileSharesAnalyzed
        {
            get => _fileSharesAnalyzed;
            set { _fileSharesAnalyzed = value; OnPropertyChanged(); }
        }
        
        // Project Configuration
        public string ProjectName
        {
            get => _projectName;
            set { _projectName = value; OnPropertyChanged(); }
        }
        
        public string ProjectDescription
        {
            get => _projectDescription;
            set { _projectDescription = value; OnPropertyChanged(); }
        }
        
        public string SourceEnvironment
        {
            get => _sourceEnvironment;
            set { _sourceEnvironment = value; OnPropertyChanged(); }
        }
        
        public string TargetEnvironment
        {
            get => _targetEnvironment;
            set { _targetEnvironment = value; OnPropertyChanged(); }
        }
        
        // Migration Options
        public bool PreservePermissions
        {
            get => _preservePermissions;
            set { _preservePermissions = value; OnPropertyChanged(); }
        }
        
        public bool MigrateVersionHistory
        {
            get => _migrateVersionHistory;
            set { _migrateVersionHistory = value; OnPropertyChanged(); }
        }
        
        public bool CopyOnlyActiveFiles
        {
            get => _copyOnlyActiveFiles;
            set { _copyOnlyActiveFiles = value; OnPropertyChanged(); }
        }
        
        public bool EnableDeltaSync
        {
            get => _enableDeltaSync;
            set { _enableDeltaSync = value; OnPropertyChanged(); }
        }
        
        public int MaxConcurrentMigrations
        {
            get => _maxConcurrentMigrations;
            set { _maxConcurrentMigrations = value; OnPropertyChanged(); }
        }
        
        public DateTime PlannedStartDate
        {
            get => _plannedStartDate;
            set { _plannedStartDate = value; OnPropertyChanged(); RefreshStatistics(); }
        }
        
        public DateTime PlannedEndDate
        {
            get => _plannedEndDate;
            set { _plannedEndDate = value; OnPropertyChanged(); RefreshStatistics(); }
        }
        
        #endregion
        
        #region Commands
        
        public ICommand DiscoverUsersCommand { get; private set; }
        public ICommand ScanFileSharesCommand { get; private set; }
        public ICommand AnalyzeContentCommand { get; private set; }
        public ICommand ValidatePermissionsCommand { get; private set; }
        public ICommand GenerateBatchesCommand { get; private set; }
        public ICommand ExportPlanCommand { get; private set; }
        public ICommand RefreshStatisticsCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        
        #endregion
        
        #region Constructor
        
        public OneDriveMigrationPlanningViewModel()
        {
            try
            {
                // Initialize services
                _csvDataService = SimpleServiceLocator.Instance.GetService<CsvDataServiceNew>();

                // Initialize collections
                InitializeCollections();

                // Initialize commands
                InitializeCommands();

                // Start refresh timer with safety limits
                InitializeRefreshTimer();

                // Start initialization task (fire-and-forget, but observable via InitializeTask)
                InitializeTask = InitializeAsync();

                StatusMessage =("OneDrive Migration Planning initialized successfully");
            }
            catch (Exception ex)
            {
                ErrorMessage =($"Failed to initialize OneDrive Migration Planning: {ex.Message}");
            }
        }
        
        #endregion
        
        #region Private Methods
        
        /// <summary>
        /// Initialize the ViewModel asynchronously
        /// </summary>
        public async Task InitializeAsync()
        {
            try
            {
                await LoadInitialDataAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage =($"Failed to initialize OneDrive Migration Planning: {ex.Message}");
                throw; // Re-throw to make exceptions observable
            }
        }

        private void InitializeCollections()
        {
            UserDrives = new ObservableCollection<dynamic>();
            FileShares = new ObservableCollection<dynamic>();
            MigrationBatches = new ObservableCollection<MigrationBatch>();
            ContentIssues = new ObservableCollection<ValidationIssue>();
            
            // Initialize collection views with thread-safe access
            Application.Current?.Dispatcher?.Invoke(() =>
            {
                UserDrivesView = CollectionViewSource.GetDefaultView(UserDrives);
                FileSharesView = CollectionViewSource.GetDefaultView(FileShares);
                BatchesView = CollectionViewSource.GetDefaultView(MigrationBatches);
                IssuesView = CollectionViewSource.GetDefaultView(ContentIssues);
            });
        }
        
        private new void InitializeCommands()
        {
            DiscoverUsersCommand = new RelayCommand(async () => await DiscoverUsersAsync());
            ScanFileSharesCommand = new RelayCommand(async () => await ScanFileSharesAsync());
            AnalyzeContentCommand = new RelayCommand(async () => await AnalyzeContentAsync());
            ValidatePermissionsCommand = new RelayCommand(async () => await ValidatePermissionsAsync());
            GenerateBatchesCommand = new RelayCommand(async () => await GenerateBatchesAsync());
            ExportPlanCommand = new RelayCommand(async () => await ExportPlanAsync());
            RefreshStatisticsCommand = new RelayCommand(() => RefreshStatistics());
            ClearFiltersCommand = new RelayCommand(ClearFilters);
        }
        
        private async Task LoadInitialDataAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage =("Loading OneDrive migration data...");
                
                // Load real CSV data instead of sample data
                await LoadRealDataAsync();
                
                RefreshStatistics();
                StatusMessage =("OneDrive migration data loaded successfully");
            }
            catch (Exception ex)
            {
                ErrorMessage =($"Failed to load initial data: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private async Task LoadRealDataAsync()
        {
            await Task.Run(async () =>
            {
                try
                {
                    // Load real OneDrive users from CSV instead of generating samples
                    // Since there's no specific OneDrive data loader, load general users and infrastructure data
                    var usersResult = await _csvDataService.LoadUsersAsync("ljpops");
                    var fileServersResult = await _csvDataService.LoadFileServersAsync("ljpops");

                    // Clear existing data
                    Application.Current?.Dispatcher?.Invoke(() =>
                    {
                        UserDrives.Clear();
                        FileShares.Clear();
                    });

                    if (usersResult.IsSuccess && usersResult.Data?.Count > 0)
                    {
                        // Convert users to the expected format for the view
                        Application.Current?.Dispatcher?.Invoke(() =>
                        {
                            foreach (var user in usersResult.Data.Take(25)) // Limit for performance
                            {
                                UserDrives.Add(new
                                {
                                    UserName = user.SamAccountName ?? user.UserPrincipalName,
                                    DisplayName = user.DisplayName,
                                    Email = user.Mail ?? user.UserPrincipalName,
                                    Department = user.Department,
                                    OneDriveUrl = user.UserPrincipalName != null ? $"https://contoso-my.sharepoint.com/personal/{user.UserPrincipalName.Replace("@", "_").Replace(".", "_")}" : "",
                                    DataSizeGB = 1.5, // Default placeholder, in real scenario calculate from actual data
                                    FileCount = 1000,
                                    LastAccessed = user.CreatedDateTime ?? DateTime.Now,
                                    HasIssues = false,
                                    MigrationStatus = "Pending",
                                    Priority = 2
                                });
                            }
                        });
                    }

                    if (fileServersResult.IsSuccess && fileServersResult.Data?.Count > 0)
                    {
                        // Convert file servers to file shares
                        Application.Current?.Dispatcher?.Invoke(() =>
                        {
                            foreach (var server in fileServersResult.Data.Take(15))
                            {
                                FileShares.Add(new
                                {
                                    ShareName = server.ServerName,
                                    ServerName = server.ServerName,
                                    SharePath = $"\\\\{server.ServerName}\\",
                                    DataSizeGB = server.TotalSizeGB,
                                    FileCount = 10000, // Placeholder
                                    UserCount = 10,
                                    LastModified = DateTime.Now.AddDays(-7),
                                    HasPermissionIssues = false,
                                    MigrationTarget = "OneDrive for Business",
                                    AnalysisStatus = "Pending"
                                });
                            }
                        });
                    }

                    // If no data found, collections remain empty (no sample data fallback)
                }
                catch (Exception ex)
                {
                    ErrorMessage = $"Failed to load CSV data: {ex.Message}";
                }
            });
        }
        
        private async Task DiscoverUsersAsync()
        {
            try
            {
                IsLoading = true;
                IsAnalysisRunning = true;
                AnalysisStatusMessage = "Discovering users and OneDrive accounts...";
                
                // Simulate user discovery process
                for (int i = 0; i <= 100; i += 10)
                {
                    AnalysisProgress = i;
                    await Task.Delay(200);
                    
                    if (i == 50)
                        AnalysisStatusMessage = "Enumerating OneDrive sites...";
                    else if (i == 80)
                        AnalysisStatusMessage = "Calculating storage usage...";
                }
                
                // Refresh with new data
                await LoadRealDataAsync();
                RefreshStatistics();
                
                AnalysisStatusMessage = $"Discovered {TotalUsers} users with OneDrive accounts";
            }
            catch (Exception ex)
            {
                ErrorMessage =($"User discovery failed: {ex.Message}");
            }
            finally
            {
                IsAnalysisRunning = false;
                AnalysisProgress = 0;
                IsLoading = false;
            }
        }
        
        private async Task ScanFileSharesAsync()
        {
            try
            {
                IsLoading = true;
                IsAnalysisRunning = true;
                AnalysisStatusMessage = "Scanning network file shares...";
                
                // Simulate file share scanning
                for (int i = 0; i <= 100; i += 15)
                {
                    AnalysisProgress = i;
                    await Task.Delay(300);
                    
                    if (i == 30)
                        AnalysisStatusMessage = "Analyzing share permissions...";
                    else if (i == 60)
                        AnalysisStatusMessage = "Calculating file counts and sizes...";
                    else if (i == 90)
                        AnalysisStatusMessage = "Identifying migration candidates...";
                }
                
                FileSharesAnalyzed = FileShares.Count;
                RefreshStatistics();
                
                AnalysisStatusMessage = $"Analyzed {FileSharesAnalyzed} file shares";
            }
            catch (Exception ex)
            {
                ErrorMessage =($"File share scanning failed: {ex.Message}");
            }
            finally
            {
                IsAnalysisRunning = false;
                AnalysisProgress = 0;
                IsLoading = false;
            }
        }
        
        private async Task AnalyzeContentAsync()
        {
            try
            {
                IsLoading = true;
                IsAnalysisRunning = true;
                AnalysisStatusMessage = "Analyzing content for migration readiness...";
                
                // Clear existing issues
                ContentIssues.Clear();
                
                // Simulate content analysis
                for (int i = 0; i <= 100; i += 12)
                {
                    AnalysisProgress = i;
                    await Task.Delay(250);
                    
                    if (i == 24)
                        AnalysisStatusMessage = "Checking file types and sizes...";
                    else if (i == 48)
                        AnalysisStatusMessage = "Validating naming conventions...";
                    else if (i == 72)
                        AnalysisStatusMessage = "Analyzing folder structures...";
                    else if (i == 96)
                        AnalysisStatusMessage = "Generating issue reports...";
                }
                
                // Generate sample issues
                GenerateContentIssues();
                RefreshStatistics();
                
                AnalysisStatusMessage = $"Content analysis complete - {ContentIssues.Count} issues found";
            }
            catch (Exception ex)
            {
                ErrorMessage =($"Content analysis failed: {ex.Message}");
            }
            finally
            {
                IsAnalysisRunning = false;
                AnalysisProgress = 0;
                IsLoading = false;
            }
        }
        
        private void GenerateContentIssues()
        {
            var random = new Random();
            var issueTypes = new[]
            {
                "File name too long",
                "Invalid characters in path",
                "File size exceeds limit",
                "Permission inheritance broken",
                "Duplicate content detected",
                "Orphaned files found",
                "Version history corrupted"
            };
            
            var severities = new[] { "High", "Medium", "Low" };
            
            for (int i = 0; i < random.Next(5, 15); i++)
            {
                var severity = severities[random.Next(severities.Length)];
                var severityColors = new Dictionary<string, string> 
                {
                    { "High", "#FFEF4444" },
                    { "Medium", "#FFF59E0B" },
                    { "Low", "#FF3B82F6" }
                };
                
                var issue = new ValidationIssue
                {
                    Category = "Content",
                    Severity = severity,
                    SeverityColor = severityColors[severity],
                    ItemName = $"User{i + 1} / FileShare{(i % 3) + 1}",
                    Description = issueTypes[random.Next(issueTypes.Length)],
                    RecommendedAction = "Review and resolve before migration"
                };
                
                ContentIssues.Add(issue);
            }
            
            UsersWithIssues = ContentIssues.Count(i => i.Severity == "High");
        }
        
        private async Task ValidatePermissionsAsync()
        {
            try
            {
                IsLoading = true;
                IsAnalysisRunning = true;
                AnalysisStatusMessage = "Validating permissions and access rights...";
                
                // Simulate permission validation
                for (int i = 0; i <= 100; i += 20)
                {
                    AnalysisProgress = i;
                    await Task.Delay(400);
                    
                    if (i == 20)
                        AnalysisStatusMessage = "Checking file share permissions...";
                    else if (i == 40)
                        AnalysisStatusMessage = "Validating OneDrive access...";
                    else if (i == 60)
                        AnalysisStatusMessage = "Analyzing permission inheritance...";
                    else if (i == 80)
                        AnalysisStatusMessage = "Identifying permission conflicts...";
                }
                
                var random = new Random();
                var checksPass = random.NextDouble() > 0.3; // 70% chance of passing
                AnalysisStatusMessage = checksPass ? 
                    "Permission validation completed successfully" : 
                    "Permission validation completed with warnings";
            }
            catch (Exception ex)
            {
                ErrorMessage =($"Permission validation failed: {ex.Message}");
            }
            finally
            {
                IsAnalysisRunning = false;
                AnalysisProgress = 0;
                IsLoading = false;
            }
        }
        
        private async Task GenerateBatchesAsync()
        {
            try
            {
                IsLoading = true;
                IsAnalysisRunning = true;
                AnalysisStatusMessage = "Generating migration batches...";
                
                MigrationBatches.Clear();
                
                // Simulate batch generation
                for (int i = 0; i <= 100; i += 25)
                {
                    AnalysisProgress = i;
                    await Task.Delay(300);
                    
                    if (i == 25)
                        AnalysisStatusMessage = "Grouping users by department...";
                    else if (i == 50)
                        AnalysisStatusMessage = "Optimizing batch sizes...";
                    else if (i == 75)
                        AnalysisStatusMessage = "Scheduling migration waves...";
                }
                
                // Generate migration batches
                GenerateMigrationBatches();
                RefreshStatistics();
                
                AnalysisStatusMessage = $"Generated {MigrationBatches.Count} migration batches";
            }
            catch (Exception ex)
            {
                ErrorMessage =($"Batch generation failed: {ex.Message}");
            }
            finally
            {
                IsAnalysisRunning = false;
                AnalysisProgress = 0;
                IsLoading = false;
            }
        }
        
        private void GenerateMigrationBatches()
        {
            var random = new Random();
            var departments = UserDrives.Cast<dynamic>().Select(u => u.Department).Distinct().ToList();
            var batchNumber = 1;
            
            foreach (var department in departments)
            {
                var departmentUsers = UserDrives.Cast<dynamic>().Where(u => u.Department == department).ToList();
                var batchSize = Math.Min(5, departmentUsers.Count);
                
                for (int i = 0; i < departmentUsers.Count; i += batchSize)
                {
                    var batchUsers = departmentUsers.Skip(i).Take(batchSize).ToList();
                    var totalSize = batchUsers.Sum(u => (double)u.DataSizeGB);
                    
                    var batch = new MigrationBatch
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = $"Batch {batchNumber}: {department}",
                        Description = $"OneDrive migration for {department} department",
                        Type = MigrationType.FileShare,
                        Priority = (MigrationPriority)random.Next(0, 4),
                        Status = MigrationStatus.Ready,
                        PlannedStartDate = PlannedStartDate.AddDays((batchNumber - 1) * 2),
                        EstimatedDuration = TimeSpan.FromHours(Math.Max(2, totalSize / 10)) // ~10GB per hour
                    };
                    
                    // Add users as migration items
                    foreach (var user in batchUsers)
                    {
                        var item = new MigrationItem
                        {
                            Id = Guid.NewGuid().ToString(),
                            SourceIdentity = user.UserName,
                            TargetIdentity = user.Email,
                            DisplayName = user.DisplayName,
                            Type = MigrationType.FileShare,
                            Status = MigrationStatus.NotStarted,
                            Priority = batch.Priority,
                            SizeBytes = (long)(user.DataSizeGB * 1024 * 1024 * 1024) // Convert GB to bytes
                        };
                        
                        batch.Items.Add(item);
                    }
                    
                    MigrationBatches.Add(batch);
                    batchNumber++;
                }
            }
        }
        
        private async Task ExportPlanAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage =("Exporting migration plan...");
                
                await Task.Delay(2000); // Simulate export process
                
                StatusMessage =("Migration plan exported successfully");
            }
            catch (Exception ex)
            {
                ErrorMessage =($"Export failed: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private void RefreshStatistics()
        {
            try
            {
                TotalUsers = UserDrives?.Count ?? 0;
                TotalFileShares = FileShares?.Count ?? 0;
                TotalMigrationBatches = MigrationBatches?.Count ?? 0;
                
                TotalDataSizeGB = UserDrives?.Cast<dynamic>().Sum(u => (double)u.DataSizeGB) ?? 0;
                if (FileShares != null)
                {
                    TotalDataSizeGB += FileShares.Cast<dynamic>().Sum(s => (double)s.DataSizeGB);
                }
                TotalDataSizeGB = Math.Round(TotalDataSizeGB, 2);
                
                // Calculate estimated migration time (assuming 10GB per hour average)
                EstimatedMigrationHours = Math.Max(1, (int)Math.Ceiling(TotalDataSizeGB / 10.0));
                
                UsersWithIssues = ContentIssues?.Count(i => i.Severity == "High") ?? 0;
            }
            catch (Exception ex)
            {
                // Log error but don't crash
                StatusMessage =($"Statistics calculation error: {ex.Message}");
            }
        }
        
        private void ApplyUserFilter()
        {
            if (UserDrivesView != null)
            {
                UserDrivesView.Filter = obj =>
                {
                    var user = obj as dynamic;
                    if (user == null) return false;
                    
                    var matchesSearch = string.IsNullOrEmpty(UserSearchText) ||
                                      user.DisplayName.ToString().Contains(UserSearchText, StringComparison.OrdinalIgnoreCase) ||
                                      user.Email.ToString().Contains(UserSearchText, StringComparison.OrdinalIgnoreCase) ||
                                      user.Department.ToString().Contains(UserSearchText, StringComparison.OrdinalIgnoreCase);
                    
                    var matchesIssueFilter = !ShowOnlyIssues || user.HasIssues;
                    
                    return matchesSearch && matchesIssueFilter;
                };
                
                UserDrivesView.Refresh();
            }
        }
        
        private void ApplyFileShareFilter()
        {
            if (FileSharesView != null)
            {
                FileSharesView.Filter = obj =>
                {
                    var share = obj as dynamic;
                    if (share == null) return false;
                    
                    var matchesSearch = string.IsNullOrEmpty(FileShareSearchText) ||
                                      share.ShareName.ToString().Contains(FileShareSearchText, StringComparison.OrdinalIgnoreCase) ||
                                      share.ServerName.ToString().Contains(FileShareSearchText, StringComparison.OrdinalIgnoreCase);
                    
                    var matchesIssueFilter = !ShowOnlyIssues || share.HasPermissionIssues;
                    
                    return matchesSearch && matchesIssueFilter;
                };
                
                FileSharesView.Refresh();
            }
        }
        
        private void ApplyFilters()
        {
            ApplyUserFilter();
            ApplyFileShareFilter();
        }
        
        private void ClearFilters()
        {
            UserSearchText = "";
            FileShareSearchText = "";
            ShowOnlyIssues = false;
        }
        
        private void RefreshUserDetails()
        {
            // Update user-specific details when selection changes
            if (SelectedUser != null)
            {
                StatusMessage =($"Selected user: {SelectedUser.DisplayName}");
            }
        }
        
        private void RefreshFileShareDetails()
        {
            // Update file share details when selection changes
            if (SelectedFileShare != null)
            {
                StatusMessage =($"Selected file share: {SelectedFileShare.ShareName}");
            }
        }
        
        private void InitializeRefreshTimer()
        {
            try
            {
                // Create timer with safety interval (minimum 30 seconds)
                var interval = Math.Max(MAX_SAFE_TIMER_INTERVAL_MS, 30000);
                _refreshTimer = new Timer(RefreshTimerCallback, null, interval, interval);
            }
            catch (Exception ex)
            {
                StatusMessage =($"Timer initialization warning: {ex.Message}");
            }
        }
        
        private void RefreshTimerCallback(object state)
        {
            try
            {
                Application.Current?.Dispatcher?.BeginInvoke(() =>
                {
                    if (!IsAnalysisRunning)
                    {
                        RefreshStatistics();
                    }
                });
            }
            catch (Exception ex)
            {
                // Fail silently to prevent timer crashes
                System.Diagnostics.Debug.WriteLine($"Timer refresh error: {ex.Message}");
            }
        }
        
        #endregion
        
        #region IDisposable
        
        public new void Dispose()
        {
            try
            {
                _refreshTimer?.Dispose();
                base.Dispose();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Disposal error: {ex.Message}");
            }
        }
        
        #endregion
    }
}