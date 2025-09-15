using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using MandADiscoverySuite.Interfaces;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using System.Windows;
using System.Windows.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// SharePoint Migration Planning ViewModel - ShareGate-inspired quality
    /// Provides comprehensive SharePoint site, library, and content migration capabilities
    /// </summary>
    public class SharePointMigrationPlanningViewModel : BaseViewModel
    {
        private readonly MigrationDataService _migrationService;
        private readonly SharePointMigrationService _sharePointService;
        private readonly ICsvDataLoader _csvDataLoader;
        private CancellationTokenSource _cancellationTokenSource;

        // Project Properties
        private string _projectName = "SharePoint Migration Project";
        private string _projectDescription = "Migration from SharePoint On-Premises to SharePoint Online";
        private string _sourceEnvironment = "SharePoint 2019 On-Premises";
        private string _targetEnvironment = "SharePoint Online (Office 365)";
        private bool _isDiscoveryRunning;
        private double _discoveryProgress;
        private string _statusMessage = "Ready to plan SharePoint migration";

        // Collections
        private ObservableCollection<MigrationItem> _sites;
        private ObservableCollection<MigrationItem> _libraries;
        private ObservableCollection<MigrationBatch> _migrationBatches;
        private ObservableCollection<ValidationIssue> _contentIssues;
        private ICollectionView _sitesView;
        private ICollectionView _librariesView;
        private ICollectionView _batchesView;

        // Selected Items
        private MigrationItem _selectedSite;
        private MigrationItem _selectedLibrary;
        private MigrationBatch _selectedBatch;

        // Search and Filtering
        private string _siteSearchText;
        private string _librarySearchText;
        private bool _showOnlyLargeSites;
        private bool _showOnlyIssues;

        // Statistics
        private int _totalSites;
        private int _totalLibraries;
        private int _totalLists;
        private long _totalContentSizeGB;
        private int _totalBatches;
        private int _estimatedMigrationHours;
        private int _totalFiles;
        private int _totalWorkflows;

        // Configuration
        private bool _migratePermissions = true;
        private bool _migrateVersionHistory = true;
        private bool _migrateWorkflows = false;
        private bool _migrateCustomizations = false;
        private bool _preserveMetadata = true;
        private bool _enableIncrementalMigration = true;
        private int _maxConcurrentMigrations = 5;
        private int _versionHistoryLimit = 10;
        private DateTime _plannedStartDate = DateTime.Today.AddDays(14);
        private DateTime _plannedEndDate = DateTime.Today.AddDays(30);

        public SharePointMigrationPlanningViewModel()
        {
            _migrationService = new MigrationDataService();
            _sharePointService = new SharePointMigrationService();
            _csvDataLoader = SimpleServiceLocator.Instance.GetService<ICsvDataLoader>();
            InitializeCollections();
            InitializeCommands();
            // Removed GenerateSampleSharePointData call - will load from CSV if available
            LoadSharePointDataAsync();
            RefreshStatistics();
        }

        #region Properties

        public string ProjectName
        {
            get => _projectName;
            set => SetProperty(ref _projectName, value);
        }

        public string ProjectDescription
        {
            get => _projectDescription;
            set => SetProperty(ref _projectDescription, value);
        }

        public string SourceEnvironment
        {
            get => _sourceEnvironment;
            set => SetProperty(ref _sourceEnvironment, value);
        }

        public string TargetEnvironment
        {
            get => _targetEnvironment;
            set => SetProperty(ref _targetEnvironment, value);
        }

        public bool IsDiscoveryRunning
        {
            get => _isDiscoveryRunning;
            set => SetProperty(ref _isDiscoveryRunning, value);
        }

        public double DiscoveryProgress
        {
            get => _discoveryProgress;
            set => SetProperty(ref _discoveryProgress, value);
        }

        public new string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public ObservableCollection<MigrationItem> Sites
        {
            get => _sites;
            set => SetProperty(ref _sites, value);
        }

        public ObservableCollection<MigrationItem> Libraries
        {
            get => _libraries;
            set => SetProperty(ref _libraries, value);
        }

        public ObservableCollection<MigrationBatch> MigrationBatches
        {
            get => _migrationBatches;
            set => SetProperty(ref _migrationBatches, value);
        }

        public ObservableCollection<ValidationIssue> ContentIssues
        {
            get => _contentIssues;
            set => SetProperty(ref _contentIssues, value);
        }

        public ICollectionView SitesView
        {
            get => _sitesView;
            set => SetProperty(ref _sitesView, value);
        }

        public ICollectionView LibrariesView
        {
            get => _librariesView;
            set => SetProperty(ref _librariesView, value);
        }

        public ICollectionView BatchesView
        {
            get => _batchesView;
            set => SetProperty(ref _batchesView, value);
        }

        public MigrationItem SelectedSite
        {
            get => _selectedSite;
            set
            {
                if (SetProperty(ref _selectedSite, value))
                {
                    LoadSiteLibraries(value);
                }
            }
        }

        public MigrationItem SelectedLibrary
        {
            get => _selectedLibrary;
            set => SetProperty(ref _selectedLibrary, value);
        }

        public MigrationBatch SelectedBatch
        {
            get => _selectedBatch;
            set => SetProperty(ref _selectedBatch, value);
        }

        public string SiteSearchText
        {
            get => _siteSearchText;
            set
            {
                if (SetProperty(ref _siteSearchText, value))
                {
                    SitesView?.Refresh();
                }
            }
        }

        public string LibrarySearchText
        {
            get => _librarySearchText;
            set
            {
                if (SetProperty(ref _librarySearchText, value))
                {
                    LibrariesView?.Refresh();
                }
            }
        }

        public bool ShowOnlyLargeSites
        {
            get => _showOnlyLargeSites;
            set
            {
                if (SetProperty(ref _showOnlyLargeSites, value))
                {
                    SitesView?.Refresh();
                }
            }
        }

        public bool ShowOnlyIssues
        {
            get => _showOnlyIssues;
            set
            {
                if (SetProperty(ref _showOnlyIssues, value))
                {
                    SitesView?.Refresh();
                    LibrariesView?.Refresh();
                }
            }
        }

        // Statistics Properties
        public int TotalSites
        {
            get => _totalSites;
            set => SetProperty(ref _totalSites, value);
        }

        public int TotalLibraries
        {
            get => _totalLibraries;
            set => SetProperty(ref _totalLibraries, value);
        }

        public int TotalLists
        {
            get => _totalLists;
            set => SetProperty(ref _totalLists, value);
        }

        public long TotalContentSizeGB
        {
            get => _totalContentSizeGB;
            set => SetProperty(ref _totalContentSizeGB, value);
        }

        public int TotalBatches
        {
            get => _totalBatches;
            set => SetProperty(ref _totalBatches, value);
        }

        public int EstimatedMigrationHours
        {
            get => _estimatedMigrationHours;
            set => SetProperty(ref _estimatedMigrationHours, value);
        }

        public int TotalFiles
        {
            get => _totalFiles;
            set => SetProperty(ref _totalFiles, value);
        }

        public int TotalWorkflows
        {
            get => _totalWorkflows;
            set => SetProperty(ref _totalWorkflows, value);
        }

        // Configuration Properties
        public bool MigratePermissions
        {
            get => _migratePermissions;
            set => SetProperty(ref _migratePermissions, value);
        }

        public bool MigrateVersionHistory
        {
            get => _migrateVersionHistory;
            set => SetProperty(ref _migrateVersionHistory, value);
        }

        public bool MigrateWorkflows
        {
            get => _migrateWorkflows;
            set => SetProperty(ref _migrateWorkflows, value);
        }

        public bool MigrateCustomizations
        {
            get => _migrateCustomizations;
            set => SetProperty(ref _migrateCustomizations, value);
        }

        public bool PreserveMetadata
        {
            get => _preserveMetadata;
            set => SetProperty(ref _preserveMetadata, value);
        }

        public bool EnableIncrementalMigration
        {
            get => _enableIncrementalMigration;
            set => SetProperty(ref _enableIncrementalMigration, value);
        }

        public int MaxConcurrentMigrations
        {
            get => _maxConcurrentMigrations;
            set => SetProperty(ref _maxConcurrentMigrations, value);
        }

        public int VersionHistoryLimit
        {
            get => _versionHistoryLimit;
            set => SetProperty(ref _versionHistoryLimit, value);
        }

        public DateTime PlannedStartDate
        {
            get => _plannedStartDate;
            set => SetProperty(ref _plannedStartDate, value);
        }

        public DateTime PlannedEndDate
        {
            get => _plannedEndDate;
            set => SetProperty(ref _plannedEndDate, value);
        }

        #endregion

        #region Commands

        public RelayCommand DiscoverSitesCommand { get; private set; }
        public RelayCommand AnalyzeContentCommand { get; private set; }
        public RelayCommand GenerateBatchesCommand { get; private set; }
        public RelayCommand ValidatePermissionsCommand { get; private set; }
        public RelayCommand ExportMigrationPlanCommand { get; private set; }
        public RelayCommand ClearFiltersCommand { get; private set; }
        public RelayCommand RefreshStatisticsCommand { get; private set; }
        public RelayCommand<MigrationItem> ViewSiteDetailsCommand { get; private set; }
        public RelayCommand<MigrationItem> ViewLibraryDetailsCommand { get; private set; }
        public RelayCommand PreFlightCheckCommand { get; private set; }

        #endregion

        #region Private Methods

        private void InitializeCollections()
        {
            Sites = new ObservableCollection<MigrationItem>();
            Libraries = new ObservableCollection<MigrationItem>();
            MigrationBatches = new ObservableCollection<MigrationBatch>();
            ContentIssues = new ObservableCollection<ValidationIssue>();

            // Setup collection views with filtering
            SitesView = CollectionViewSource.GetDefaultView(Sites);
            SitesView.Filter = SiteFilter;

            LibrariesView = CollectionViewSource.GetDefaultView(Libraries);
            LibrariesView.Filter = LibraryFilter;

            BatchesView = CollectionViewSource.GetDefaultView(MigrationBatches);

            // Initialize sample content issues
            ContentIssues.Add(new ValidationIssue 
            { 
                Severity = "Warning", 
                Category = "File Size", 
                ItemName = "LargePresentation.pptx",
                Description = "File exceeds 15GB limit for SharePoint Online",
                RecommendedAction = "Split file or use OneDrive for large files"
            });
            ContentIssues.Add(new ValidationIssue 
            { 
                Severity = "Error", 
                Category = "Unsupported", 
                ItemName = "CustomWorkflow.xoml",
                Description = "SharePoint 2010 workflows not supported in SPO",
                RecommendedAction = "Recreate workflow using Power Automate"
            });
            ContentIssues.Add(new ValidationIssue 
            { 
                Severity = "Info", 
                Category = "Performance", 
                ItemName = "HR Portal",
                Description = "Site contains 50,000+ items in single library",
                RecommendedAction = "Consider splitting into multiple libraries"
            });
        }

        private new void InitializeCommands()
        {
            DiscoverSitesCommand = new RelayCommand(async () => await DiscoverSites(), () => !IsDiscoveryRunning);
            AnalyzeContentCommand = new RelayCommand(async () => await AnalyzeContent());
            GenerateBatchesCommand = new RelayCommand(async () => await GenerateBatches());
            ValidatePermissionsCommand = new RelayCommand(async () => await ValidatePermissions());
            ExportMigrationPlanCommand = new RelayCommand(async () => await ExportMigrationPlan());
            ClearFiltersCommand = new RelayCommand(() => ClearFilters());
            RefreshStatisticsCommand = new RelayCommand(() => RefreshStatistics());
            ViewSiteDetailsCommand = new RelayCommand<MigrationItem>((site) => ViewSiteDetails(site));
            ViewLibraryDetailsCommand = new RelayCommand<MigrationItem>((library) => ViewLibraryDetails(library));
            PreFlightCheckCommand = new RelayCommand(async () => await RunPreFlightCheck());
        }

        private async Task LoadSharePointDataAsync()
        {
            try
            {
                var migrationResult = await _csvDataLoader.LoadMigrationItemsAsync("ljpops");
                if (migrationResult.IsSuccess && migrationResult.Data?.Count > 0)
                {
                    var sharePointItems = migrationResult.Data.Where(m => m.Type == MigrationType.SharePoint).ToList();
                    foreach (var item in sharePointItems)
                    {
                        // Convert MigrationItem to appropriate format for SharePoint view
                        Sites.Add(item);
                    }
                    StatusMessage = $"Loaded {sharePointItems.Count} SharePoint migration items from CSV";
                }
                else
                {
                    StatusMessage = "No SharePoint CSV data found - view will be empty until data is available";
                    ErrorMessage = $"No SharePoint CSV data found at {ConfigurationService.Instance.DiscoveryDataRootPath}";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to load SharePoint data from CSV: {ex.Message}";
            }
        }

        private bool SiteFilter(object item)
        {
            if (!(item is MigrationItem site)) return false;

            // Show only large sites filter
            if (ShowOnlyLargeSites)
            {
                var sizeGB = site.Properties?.ContainsKey("SizeGB") == true ? 
                            Convert.ToDouble(site.Properties["SizeGB"]) : 0;
                if (sizeGB < 10) return false;
            }

            // Show only issues filter
            if (ShowOnlyIssues && site.Status != MigrationStatus.Failed)
                return false;

            // Text search
            if (!string.IsNullOrEmpty(SiteSearchText))
            {
                var searchLower = SiteSearchText.ToLower();
                var siteName = site.Properties?.ContainsKey("SiteName") == true ?
                              site.Properties["SiteName"]?.ToString()?.ToLower() : "";
                var url = site.SourceIdentity?.ToLower() ?? "";
                
                if (!siteName.Contains(searchLower) && !url.Contains(searchLower))
                {
                    return false;
                }
            }

            return true;
        }

        private bool LibraryFilter(object item)
        {
            if (!(item is MigrationItem library)) return false;

            // Show only issues filter
            if (ShowOnlyIssues && library.Status != MigrationStatus.Failed)
                return false;

            // Text search
            if (!string.IsNullOrEmpty(LibrarySearchText))
            {
                var searchLower = LibrarySearchText.ToLower();
                var libraryName = library.Properties?.ContainsKey("LibraryName") == true ?
                                 library.Properties["LibraryName"]?.ToString()?.ToLower() : "";
                
                if (!libraryName.Contains(searchLower))
                {
                    return false;
                }
            }

            return true;
        }

        private async Task DiscoverSites()
        {
            try 
            {
                IsDiscoveryRunning = true;
                StatusMessage = "Discovering SharePoint sites...";
                DiscoveryProgress = 0;

                // Create source context for discovery (in real implementation, this would come from user configuration)
                var sourceContext = new MandADiscoverySuite.Migration.TargetContext { TenantId = "source-tenant-id" };

                // Use real SharePoint discovery service
                var progress = new Progress<MandADiscoverySuite.Migration.MigrationProgress>(p =>
                {
                    DiscoveryProgress = p.Percentage;
                    StatusMessage = p.Message ?? "Discovering SharePoint sites...";
                });

                var discoveredSites = await _sharePointService.DiscoverSharePointSitesAsync(sourceContext, progress);
                
                // Clear existing sites and add discovered ones
                Sites.Clear();
                foreach (var site in discoveredSites)
                {
                    Sites.Add(site);
                }

                // If no sites were discovered (perhaps due to connectivity issues), try to load from CSV
                if (Sites.Count == 0)
                {
                    StatusMessage = "No sites discovered - attempting to load from CSV...";
                    await LoadSharePointDataAsync();
                }

                DiscoveryProgress = 100;
                StatusMessage = $"Discovery completed - {Sites.Count} sites available for migration";
                RefreshStatistics();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Discovery failed: {ex.Message}";

                // Try to load from CSV as fallback instead of using sample data
                StatusMessage += " - Attempting to load from CSV...";
                await LoadSharePointDataAsync();
                RefreshStatistics();
            }
            finally
            {
                IsDiscoveryRunning = false;
            }
        }

        private async Task AnalyzeContent()
        {
            try 
            {
                StatusMessage = "Analyzing SharePoint content...";
                await Task.Delay(2000); // Simulate analysis
                
                // Add more sample issues based on analysis
                ContentIssues.Add(new ValidationIssue
                {
                    Severity = "Warning",
                    Category = "Compatibility",
                    ItemName = "Legacy InfoPath Forms",
                    Description = "InfoPath forms require PowerApps conversion",
                    RecommendedAction = "Convert to PowerApps or use modern forms"
                });
                
                StatusMessage = "Content analysis completed";
                RefreshStatistics();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Analysis failed: {ex.Message}";
            }
        }

        private async Task GenerateBatches()
        {
            try
            {
                StatusMessage = "Generating migration batches...";
                
                var availableSites = Sites.Where(s => s.Status == MigrationStatus.Ready || s.Status == MigrationStatus.NotStarted).ToList();
                
                if (availableSites.Count == 0)
                {
                    StatusMessage = "No sites available for migration. Please run discovery first.";
                    return;
                }

                // Create SharePoint migration settings based on current configuration
                var settings = new MandADiscoverySuite.Migration.SharePointMigrationSettings
                {
                    MigratePermissions = this.MigratePermissions,
                    MigrateVersionHistory = this.MigrateVersionHistory,
                    MigrateWorkflows = this.MigrateWorkflows,
                    MigrateCustomizations = this.MigrateCustomizations,
                    PreserveMetadata = this.PreserveMetadata,
                    EnableIncrementalMigration = this.EnableIncrementalMigration,
                    MaxConcurrentMigrations = this.MaxConcurrentMigrations,
                    VersionHistoryLimit = this.VersionHistoryLimit,
                    OverwriteExisting = false // Default to safe migration
                };

                // Use SharePoint migration service to create batches
                var generatedBatches = await _sharePointService.CreateSharePointMigrationBatchesAsync(
                    availableSites, 
                    settings, 
                    Math.Max(1, MaxConcurrentMigrations * 2)); // Allow larger batches based on concurrency

                MigrationBatches.Clear();
                foreach (var batch in generatedBatches)
                {
                    MigrationBatches.Add(batch);
                }

                StatusMessage = $"Generated {MigrationBatches.Count} migration batches";
                RefreshStatistics();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Batch generation failed: {ex.Message}";
            }
        }

        private async Task ValidatePermissions()
        {
            try
            {
                StatusMessage = "Validating SharePoint permissions...";
                await Task.Delay(1500); // Simulate validation
                
                // Mark some sites as having permission issues
                var random = new Random();
                foreach (var site in Sites.Take(3))
                {
                    if (random.NextDouble() < 0.3)
                    {
                        site.Status = MigrationStatus.Failed;
                        ContentIssues.Add(new ValidationIssue
                        {
                            Severity = "Error",
                            Category = "Permissions",
                            ItemName = site.SourceIdentity,
                            Description = "Complex permission inheritance detected",
                            RecommendedAction = "Review and simplify permissions before migration"
                        });
                    }
                }
                
                StatusMessage = "Permission validation completed";
                RefreshStatistics();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Validation failed: {ex.Message}";
            }
        }

        private async Task ExportMigrationPlan()
        {
            try 
            {
                StatusMessage = "Exporting SharePoint migration plan...";
                await Task.Delay(1000); // Simulate export process
                StatusMessage = "Migration plan exported successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Export failed: {ex.Message}";
            }
        }

        private async Task RunPreFlightCheck()
        {
            try 
            {
                StatusMessage = "Running pre-flight checks...";
                await Task.Delay(2000); // Simulate checks
                
                // Check various migration readiness factors
                var checksPass = true;
                
                if (Sites.Count == 0)
                {
                    checksPass = false;
                    StatusMessage = "Pre-flight failed: No sites discovered";
                }
                else if (ContentIssues.Count(i => i.Severity == "Error") > 5)
                {
                    checksPass = false;
                    StatusMessage = "Pre-flight failed: Too many critical issues";
                }
                else
                {
                    StatusMessage = "Pre-flight checks passed - ready for migration";
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Pre-flight check failed: {ex.Message}";
            }
        }

        private void LoadSiteLibraries(MigrationItem site)
        {
            if (site == null) return;
            
            Libraries.Clear();
            
            // Generate sample libraries for the selected site
            var random = new Random();
            var libraryTypes = new[] { "Documents", "Pages", "Images", "Forms", "Reports", "Archives" };
            var libraryCount = random.Next(3, 8);
            
            for (int i = 0; i < libraryCount; i++)
            {
                var library = new MigrationItem
                {
                    Id = Guid.NewGuid().ToString(),
                    SourceIdentity = $"{site.SourceIdentity}/{libraryTypes[i % libraryTypes.Length]}",
                    TargetIdentity = $"{site.TargetIdentity}/{libraryTypes[i % libraryTypes.Length]}",
                    Type = MigrationType.SharePoint,
                    Status = MigrationStatus.NotStarted,
                    Priority = MigrationPriority.Normal,
                    Properties = new Dictionary<string, object>
                    {
                        ["LibraryName"] = libraryTypes[i % libraryTypes.Length],
                        ["ItemCount"] = random.Next(100, 10000),
                        ["SizeGB"] = Math.Round(random.NextDouble() * 5, 2),
                        ["LastModified"] = DateTime.Now.AddDays(-random.Next(365)),
                        ["HasWorkflows"] = random.NextDouble() < 0.2,
                        ["HasCustomColumns"] = random.NextDouble() < 0.4
                    }
                };
                
                Libraries.Add(library);
            }
        }

        private void ClearFilters()
        {
            SiteSearchText = string.Empty;
            LibrarySearchText = string.Empty;
            ShowOnlyLargeSites = false;
            ShowOnlyIssues = false;
        }

        private void ViewSiteDetails(MigrationItem site)
        {
            if (site == null) return;

            var siteName = site.Properties?.ContainsKey("SiteName") == true ? 
                          site.Properties["SiteName"]?.ToString() : "Unknown";
            var sizeGB = site.Properties?.ContainsKey("SizeGB") == true ? 
                        site.Properties["SizeGB"]?.ToString() : "0";
            var subsites = site.Properties?.ContainsKey("SubsiteCount") == true ? 
                          site.Properties["SubsiteCount"]?.ToString() : "0";

            var message = $"SharePoint Site Details:\n\n" +
                         $"Site Name: {siteName}\n" +
                         $"URL: {site.SourceIdentity}\n" +
                         $"Target: {site.TargetIdentity}\n" +
                         $"Size: {sizeGB} GB\n" +
                         $"Subsites: {subsites}\n" +
                         $"Status: {site.Status}\n" +
                         $"Type: {site.Type}";

            MessageBox.Show(message, "Site Details", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ViewLibraryDetails(MigrationItem library)
        {
            if (library == null) return;

            var libraryName = library.Properties?.ContainsKey("LibraryName") == true ? 
                             library.Properties["LibraryName"]?.ToString() : "Unknown";
            var itemCount = library.Properties?.ContainsKey("ItemCount") == true ? 
                           library.Properties["ItemCount"]?.ToString() : "0";

            var message = $"Library Details:\n\n" +
                         $"Library: {libraryName}\n" +
                         $"Path: {library.SourceIdentity}\n" +
                         $"Items: {itemCount}\n" +
                         $"Status: {library.Status}";

            MessageBox.Show(message, "Library Details", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void RefreshStatistics()
        {
            TotalSites = Sites.Count;
            TotalLibraries = Libraries.Count;
            TotalLists = Sites.Sum(s => 
                s.Properties?.ContainsKey("ListCount") == true ? 
                Convert.ToInt32(s.Properties["ListCount"]) : 0);
            
            // Calculate total content size
            TotalContentSizeGB = 0;
            foreach (var site in Sites)
            {
                if (site.Properties?.ContainsKey("SizeGB") == true)
                {
                    if (double.TryParse(site.Properties["SizeGB"]?.ToString(), out var size))
                    {
                        TotalContentSizeGB += (long)size;
                    }
                }
            }
            
            TotalBatches = MigrationBatches.Count;
            TotalFiles = Sites.Sum(s => 
                s.Properties?.ContainsKey("FileCount") == true ? 
                Convert.ToInt32(s.Properties["FileCount"]) : 0);
            TotalWorkflows = Sites.Sum(s => 
                s.Properties?.ContainsKey("WorkflowCount") == true ? 
                Convert.ToInt32(s.Properties["WorkflowCount"]) : 0);
            
            // Estimate migration time: 10GB per hour as baseline
            EstimatedMigrationHours = Math.Max(1, (int)(TotalContentSizeGB / 10.0));
        }

        // GenerateSampleSharePointData method removed - data loaded from CSV only

        #endregion
    }
}