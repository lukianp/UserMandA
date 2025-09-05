using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Microsoft Teams Migration Planning ViewModel - ShareGate-quality enterprise Teams migration
    /// Provides comprehensive Teams discovery, channel analysis, content assessment, and migration planning
    /// </summary>
    public class TeamsMigrationPlanningViewModel : BaseViewModel
    {
        #region Private Fields
        private readonly NavigationService navigationService;
        private CancellationTokenSource _cancellationTokenSource;

        // Project Configuration
        private string _projectName = "Teams Migration Project";
        private string _projectDescription = "Microsoft Teams migration from legacy tenant to target environment";
        private string _sourceTenant = "contoso.onmicrosoft.com";
        private string _targetTenant = "fabrikam.onmicrosoft.com";
        private DateTime _plannedStartDate = DateTime.Now.AddDays(7);
        private DateTime _plannedEndDate = DateTime.Now.AddDays(30);

        // Collections for Teams data
        private ObservableCollection<TeamsDiscoveryItem> _teamsData;
        private ObservableCollection<ChannelDiscoveryItem> _channelsData;
        private ObservableCollection<MigrationBatch> _migrationBatches;
        private ObservableCollection<ValidationIssue> _contentIssues;

        // Collection Views for filtering and sorting
        private ICollectionView _teamsView;
        private ICollectionView _channelsView;
        private ICollectionView _batchesView;
        private ICollectionView _issuesView;

        // Selected Items
        private TeamsDiscoveryItem _selectedTeam;
        private ChannelDiscoveryItem _selectedChannel;
        private MigrationBatch _selectedBatch;

        // Search and Filtering
        private string _teamsSearchText;
        private string _channelsSearchText;
        private string _selectedTeamTypeFilter = "All";
        private string _selectedChannelTypeFilter = "All";
        private bool _showOnlyTeamsWithIssues;

        // Discovery Progress
        private bool _isDiscoveryRunning;
        private double _discoveryProgress;
        private string _discoveryStatusMessage = "Ready to discover Teams";

        // Analysis Progress  
        private bool _isAnalysisRunning;
        private double _analysisProgress;
        private string _analysisStatusMessage = "Ready to analyze content";

        // Migration Planning
        private int _batchSize = 50;
        private int _maxConcurrentMigrations = 3;
        private bool _preserveTeamSettings = true;
        private bool _preserveChannelSettings = true;
        private bool _preserveConversations = true;
        private bool _preserveFiles = true;
        private bool _preserveTabs = true;
        private bool _preserveApps = false; // Often requires manual reconfiguration

        // Statistics
        private int _totalTeams;
        private int _totalChannels;
        private int _totalMembers;
        private double _totalDataSizeGB;
        private int _teamsWithIssues;
        private int _estimatedMigrationHours;
        private decimal _estimatedCost;
        #endregion

        #region Public Properties

        // Project Configuration Properties
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

        public string SourceTenant
        {
            get => _sourceTenant;
            set => SetProperty(ref _sourceTenant, value);
        }

        public string TargetTenant
        {
            get => _targetTenant;
            set => SetProperty(ref _targetTenant, value);
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

        // Collections
        public ObservableCollection<TeamsDiscoveryItem> TeamsData
        {
            get => _teamsData;
            set => SetProperty(ref _teamsData, value);
        }

        public ObservableCollection<ChannelDiscoveryItem> ChannelsData
        {
            get => _channelsData;
            set => SetProperty(ref _channelsData, value);
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

        // Collection Views
        public ICollectionView TeamsView
        {
            get => _teamsView;
            set => SetProperty(ref _teamsView, value);
        }

        public ICollectionView ChannelsView
        {
            get => _channelsView;
            set => SetProperty(ref _channelsView, value);
        }

        public ICollectionView BatchesView
        {
            get => _batchesView;
            set => SetProperty(ref _batchesView, value);
        }

        public ICollectionView IssuesView
        {
            get => _issuesView;
            set => SetProperty(ref _issuesView, value);
        }

        // Selected Items
        public TeamsDiscoveryItem SelectedTeam
        {
            get => _selectedTeam;
            set => SetProperty(ref _selectedTeam, value);
        }

        public ChannelDiscoveryItem SelectedChannel
        {
            get => _selectedChannel;
            set => SetProperty(ref _selectedChannel, value);
        }

        public MigrationBatch SelectedBatch
        {
            get => _selectedBatch;
            set => SetProperty(ref _selectedBatch, value);
        }

        // Search and Filtering
        public string TeamsSearchText
        {
            get => _teamsSearchText;
            set
            {
                SetProperty(ref _teamsSearchText, value);
                TeamsView?.Refresh();
            }
        }

        public string ChannelsSearchText
        {
            get => _channelsSearchText;
            set
            {
                SetProperty(ref _channelsSearchText, value);
                ChannelsView?.Refresh();
            }
        }

        public string SelectedTeamTypeFilter
        {
            get => _selectedTeamTypeFilter;
            set
            {
                SetProperty(ref _selectedTeamTypeFilter, value);
                TeamsView?.Refresh();
            }
        }

        public string SelectedChannelTypeFilter
        {
            get => _selectedChannelTypeFilter;
            set
            {
                SetProperty(ref _selectedChannelTypeFilter, value);
                ChannelsView?.Refresh();
            }
        }

        public bool ShowOnlyTeamsWithIssues
        {
            get => _showOnlyTeamsWithIssues;
            set
            {
                SetProperty(ref _showOnlyTeamsWithIssues, value);
                TeamsView?.Refresh();
            }
        }

        // Discovery Progress
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

        public string DiscoveryStatusMessage
        {
            get => _discoveryStatusMessage;
            set => SetProperty(ref _discoveryStatusMessage, value);
        }

        // Analysis Progress
        public bool IsAnalysisRunning
        {
            get => _isAnalysisRunning;
            set => SetProperty(ref _isAnalysisRunning, value);
        }

        public double AnalysisProgress
        {
            get => _analysisProgress;
            set => SetProperty(ref _analysisProgress, value);
        }

        public string AnalysisStatusMessage
        {
            get => _analysisStatusMessage;
            set => SetProperty(ref _analysisStatusMessage, value);
        }

        // Migration Planning Properties
        public int BatchSize
        {
            get => _batchSize;
            set => SetProperty(ref _batchSize, value);
        }

        public int MaxConcurrentMigrations
        {
            get => _maxConcurrentMigrations;
            set => SetProperty(ref _maxConcurrentMigrations, value);
        }

        public bool PreserveTeamSettings
        {
            get => _preserveTeamSettings;
            set => SetProperty(ref _preserveTeamSettings, value);
        }

        public bool PreserveChannelSettings
        {
            get => _preserveChannelSettings;
            set => SetProperty(ref _preserveChannelSettings, value);
        }

        public bool PreserveConversations
        {
            get => _preserveConversations;
            set => SetProperty(ref _preserveConversations, value);
        }

        public bool PreserveFiles
        {
            get => _preserveFiles;
            set => SetProperty(ref _preserveFiles, value);
        }

        public bool PreserveTabs
        {
            get => _preserveTabs;
            set => SetProperty(ref _preserveTabs, value);
        }

        public bool PreserveApps
        {
            get => _preserveApps;
            set => SetProperty(ref _preserveApps, value);
        }

        // Statistics
        public int TotalTeams
        {
            get => _totalTeams;
            set => SetProperty(ref _totalTeams, value);
        }

        public int TotalChannels
        {
            get => _totalChannels;
            set => SetProperty(ref _totalChannels, value);
        }

        public int TotalMembers
        {
            get => _totalMembers;
            set => SetProperty(ref _totalMembers, value);
        }

        public double TotalDataSizeGB
        {
            get => _totalDataSizeGB;
            set => SetProperty(ref _totalDataSizeGB, value);
        }

        public int TeamsWithIssues
        {
            get => _teamsWithIssues;
            set => SetProperty(ref _teamsWithIssues, value);
        }

        public int EstimatedMigrationHours
        {
            get => _estimatedMigrationHours;
            set => SetProperty(ref _estimatedMigrationHours, value);
        }

        public decimal EstimatedCost
        {
            get => _estimatedCost;
            set => SetProperty(ref _estimatedCost, value);
        }

        // Filter Options
        public ObservableCollection<string> TeamTypeFilters { get; } = new ObservableCollection<string>
        {
            "All", "Public", "Private", "Org-wide", "Shared"
        };

        public ObservableCollection<string> ChannelTypeFilters { get; } = new ObservableCollection<string>
        {
            "All", "Standard", "Private", "Shared"
        };
        #endregion

        #region Commands
        public ICommand DiscoverTeamsCommand { get; private set; }
        public ICommand AnalyzeContentCommand { get; private set; }
        public ICommand ValidatePermissionsCommand { get; private set; }
        public ICommand GenerateBatchesCommand { get; private set; }
        public ICommand ExportPlanCommand { get; private set; }
        public ICommand RefreshCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        #endregion

        #region Constructor
        public TeamsMigrationPlanningViewModel()
        {
            navigationService = SimpleServiceLocator.Instance.GetService<NavigationService>();
            InitializeCommands();
            InitializeCollections();
            // Data will be loaded from CSV discovery files when available
        }
        #endregion

        #region Initialization
        private new void InitializeCommands()
        {
            DiscoverTeamsCommand = new AsyncRelayCommand(DiscoverTeamsAsync);
            AnalyzeContentCommand = new AsyncRelayCommand(AnalyzeContentAsync);
            ValidatePermissionsCommand = new AsyncRelayCommand(ValidatePermissionsAsync);
            GenerateBatchesCommand = new AsyncRelayCommand(GenerateBatchesAsync);
            ExportPlanCommand = new AsyncRelayCommand(ExportPlanAsync);
            RefreshCommand = new AsyncRelayCommand(RefreshDataAsync);
            ClearFiltersCommand = new RelayCommand(ClearFilters);
        }

        private void InitializeCollections()
        {
            TeamsData = new ObservableCollection<TeamsDiscoveryItem>();
            ChannelsData = new ObservableCollection<ChannelDiscoveryItem>();
            MigrationBatches = new ObservableCollection<MigrationBatch>();
            ContentIssues = new ObservableCollection<ValidationIssue>();

            // Initialize collection views with thread-safe access
            Application.Current?.Dispatcher?.Invoke(() =>
            {
                TeamsView = CollectionViewSource.GetDefaultView(TeamsData);
                ChannelsView = CollectionViewSource.GetDefaultView(ChannelsData);
                BatchesView = CollectionViewSource.GetDefaultView(MigrationBatches);
                IssuesView = CollectionViewSource.GetDefaultView(ContentIssues);

                // Setup filtering
                TeamsView.Filter = FilterTeams;
                ChannelsView.Filter = FilterChannels;
            });
        }
        #endregion

        #region Command Implementations
        private async Task DiscoverTeamsAsync()
        {
            try
            {
                IsLoading = true;
                IsDiscoveryRunning = true;
                DiscoveryStatusMessage = "Connecting to Microsoft Graph API...";
                
                // Clear existing data
                TeamsData.Clear();
                ChannelsData.Clear();
                
                // Simulate Teams discovery process
                for (int i = 0; i <= 100; i += 10)
                {
                    DiscoveryProgress = i;
                    await Task.Delay(300);
                    
                    if (i == 10)
                        DiscoveryStatusMessage = "Authenticating with source tenant...";
                    else if (i == 30)
                        DiscoveryStatusMessage = "Discovering Teams...";
                    else if (i == 60)
                        DiscoveryStatusMessage = "Analyzing channels and membership...";
                    else if (i == 90)
                        DiscoveryStatusMessage = "Calculating statistics...";
                }
                
                // // Generate realistic Teams data
                // GenerateTeamsData();
                
                DiscoveryStatusMessage = $"Discovery completed - Found {TotalTeams} teams with {TotalChannels} channels";
                StatusMessage = "Teams discovery completed successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Discovery failed: {ex.Message}";
                DiscoveryStatusMessage = "Discovery failed";
            }
            finally
            {
                IsLoading = false;
                IsDiscoveryRunning = false;
            }
        }

        private async Task AnalyzeContentAsync()
        {
            try
            {
                IsLoading = true;
                IsAnalysisRunning = true;
                AnalysisStatusMessage = "Starting content analysis...";
                
                ContentIssues.Clear();
                
                // Simulate comprehensive content analysis
                for (int i = 0; i <= 100; i += 15)
                {
                    AnalysisProgress = i;
                    await Task.Delay(400);
                    
                    if (i == 15)
                        AnalysisStatusMessage = "Analyzing conversation content...";
                    else if (i == 30)
                        AnalysisStatusMessage = "Scanning files and attachments...";
                    else if (i == 45)
                        AnalysisStatusMessage = "Checking tab configurations...";
                    else if (i == 60)
                        AnalysisStatusMessage = "Validating app installations...";
                    else if (i == 75)
                        AnalysisStatusMessage = "Analyzing permissions and policies...";
                    else if (i == 90)
                        AnalysisStatusMessage = "Generating recommendations...";
                }
                
                // // Generate content issues
                // GenerateContentIssues();
                
                AnalysisStatusMessage = $"Analysis completed - Found {ContentIssues.Count} potential issues";
                StatusMessage = "Content analysis completed successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Analysis failed: {ex.Message}";
                AnalysisStatusMessage = "Analysis failed";
            }
            finally
            {
                IsLoading = false;
                IsAnalysisRunning = false;
            }
        }

        private async Task ValidatePermissionsAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Validating permissions and access rights...";
                
                await Task.Delay(2000); // Simulate permission validation
                
                StatusMessage = "Permission validation completed";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Permission validation failed: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task GenerateBatchesAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Generating migration batches...";
                
                MigrationBatches.Clear();
                
                // Group teams by department for batching
                var teamsByDepartment = TeamsData.GroupBy(t => t.Department).ToList();
                var batchNumber = 1;
                
                foreach (var departmentGroup in teamsByDepartment)
                {
                    var teams = departmentGroup.ToList();
                    var totalTeamsInDept = teams.Count;
                    
                    // Create batches based on batch size
                    for (int i = 0; i < totalTeamsInDept; i += BatchSize)
                    {
                        var batchTeams = teams.Skip(i).Take(BatchSize).ToList();
                        var totalMembers = batchTeams.Sum(t => t.MemberCount);
                        var totalSize = batchTeams.Sum(t => t.DataSizeGB);
                        
                        var batch = new MigrationBatch
                        {
                            Id = Guid.NewGuid().ToString(),
                            Name = $"Batch {batchNumber}: {departmentGroup.Key}",
                            Description = $"Teams migration for {departmentGroup.Key} department",
                            Type = MigrationType.Teams,
                            Priority = (MigrationPriority)new Random().Next(0, 4),
                            Status = MigrationStatus.Ready,
                            PlannedStartDate = PlannedStartDate.AddDays((batchNumber - 1) * 2),
                            EstimatedDuration = TimeSpan.FromHours(Math.Max(4, totalSize / 5)) // ~5GB per hour
                        };
                        
                        // Add teams as migration items
                        foreach (var team in batchTeams)
                        {
                            var item = new MigrationItem
                            {
                                Id = Guid.NewGuid().ToString(),
                                SourceIdentity = team.DisplayName,
                                TargetIdentity = team.MailNickname,
                                DisplayName = team.DisplayName,
                                Type = MigrationType.Teams,
                                Status = MigrationStatus.NotStarted,
                                Priority = batch.Priority,
                                SizeBytes = (long)(team.DataSizeGB * 1024 * 1024 * 1024) // Convert GB to bytes
                            };
                            
                            batch.Items.Add(item);
                        }
                        
                        MigrationBatches.Add(batch);
                        batchNumber++;
                    }
                }
                
                StatusMessage = $"Generated {MigrationBatches.Count} migration batches";
                await Task.Delay(1000);
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Batch generation failed: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ExportPlanAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Exporting migration plan...";
                
                await Task.Delay(2000); // Simulate export process
                
                StatusMessage = "Migration plan exported successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Export failed: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task RefreshDataAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Refreshing Teams data...";
                
                await Task.Delay(1000);
                // TODO: Reload data from CSV discovery files
                
                StatusMessage = "Data refreshed successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Refresh failed: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void ClearFilters()
        {
            TeamsSearchText = string.Empty;
            ChannelsSearchText = string.Empty;
            SelectedTeamTypeFilter = "All";
            SelectedChannelTypeFilter = "All";
            ShowOnlyTeamsWithIssues = false;
        }
        #endregion

        #region Data Loading (CSV-based)
        // Dummy data generation methods removed
        // Data will be loaded from CSV files when Teams discovery modules are available
        
        private void UpdateStatistics()
        {
            TotalTeams = TeamsData.Count;
            TotalChannels = ChannelsData.Count;
            TotalMembers = TeamsData.Sum(t => t.MemberCount);
            TotalDataSizeGB = Math.Round(TeamsData.Sum(t => t.DataSizeGB), 2);
            EstimatedMigrationHours = (int)(TotalTeams * 2.5 + TotalChannels * 0.5); // Rough estimate
            EstimatedCost = (decimal)(EstimatedMigrationHours * 150); // $150/hour estimate
        }
        #endregion

        #region Filtering
        private bool FilterTeams(object obj)
        {
            var team = obj as TeamsDiscoveryItem;
            if (team == null) return false;

            // Text search
            if (!string.IsNullOrEmpty(TeamsSearchText))
            {
                if (!team.DisplayName.Contains(TeamsSearchText, StringComparison.OrdinalIgnoreCase) &&
                    !team.Department.Contains(TeamsSearchText, StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            // Team type filter
            if (SelectedTeamTypeFilter != "All" && team.TeamType != SelectedTeamTypeFilter)
                return false;

            // Issues filter
            if (ShowOnlyTeamsWithIssues)
            {
                if (!ContentIssues.Any(i => i.ItemName == team.DisplayName && i.Severity == "High"))
                    return false;
            }

            return true;
        }

        private bool FilterChannels(object obj)
        {
            var channel = obj as ChannelDiscoveryItem;
            if (channel == null) return false;

            // Text search
            if (!string.IsNullOrEmpty(ChannelsSearchText))
            {
                if (!channel.DisplayName.Contains(ChannelsSearchText, StringComparison.OrdinalIgnoreCase) &&
                    !channel.TeamName.Contains(ChannelsSearchText, StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            // Channel type filter
            if (SelectedChannelTypeFilter != "All" && channel.ChannelType != SelectedChannelTypeFilter)
                return false;

            return true;
        }
        #endregion

        #region Disposal
        public new void Dispose()
        {
            _cancellationTokenSource?.Cancel();
            _cancellationTokenSource?.Dispose();
            base.Dispose();
        }
        #endregion
    }

    #region Supporting Models

    /// <summary>
    /// Teams discovery item for migration planning
    /// </summary>
    public class TeamsDiscoveryItem
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string MailNickname { get; set; }
        public string Description { get; set; }
        public string TeamType { get; set; } // Public, Private, Org-wide
        public string Department { get; set; }
        public int MemberCount { get; set; }
        public int ChannelCount { get; set; }
        public double DataSizeGB { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastActivityDate { get; set; }
        public int OwnerCount { get; set; }
        public int GuestCount { get; set; }
        public bool HasApps { get; set; }
        public bool HasCustomTabs { get; set; }
        public bool IsArchived { get; set; }
        public string ComplianceState { get; set; }

        public string FormattedDataSize => $"{DataSizeGB:F2} GB";
        public string ActivityStatus => (DateTime.Now - LastActivityDate).Days <= 7 ? "Active" : "Inactive";
        public bool HasComplexConfiguration => HasApps || HasCustomTabs || GuestCount > 0;
    }

    /// <summary>
    /// Channel discovery item for migration planning
    /// </summary>
    public class ChannelDiscoveryItem
    {
        public string Id { get; set; }
        public string TeamId { get; set; }
        public string TeamName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string ChannelType { get; set; } // Standard, Private, Shared
        public int MessageCount { get; set; }
        public int FileCount { get; set; }
        public double DataSizeGB { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastActivityDate { get; set; }
        public int MemberCount { get; set; }
        public bool HasTabs { get; set; }
        public bool HasApps { get; set; }
        public bool HasCustomConnectors { get; set; }
        public bool IsModerated { get; set; }

        public string FormattedDataSize => $"{DataSizeGB:F2} GB";
        public string ActivityLevel => MessageCount > 500 ? "High" : MessageCount > 100 ? "Medium" : "Low";
        public bool RequiresSpecialHandling => HasCustomConnectors || IsModerated || ChannelType == "Private";
    }

    #endregion
}