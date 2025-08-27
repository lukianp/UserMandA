using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Main migration planning interface with discovery-driven planning capabilities
    /// </summary>
    public class MigrationPlanningViewModel : BaseViewModel
    {
        #region Private Fields
        private readonly MigrationDataService _migrationDataService;
        private readonly DiscoveryService _discoveryService;
        private readonly ProfileService _profileService;
        private readonly ModuleRegistryService _moduleRegistryService;
        private readonly ILogger<MigrationPlanningViewModel> _logger;
        
        // Discovery Data Analysis
        private ComprehensiveDataLoadResult _discoveryData;
        private DiscoveryAnalysisResult _analysisResult;
        private string _selectedProfile;
        private bool _isAnalyzing;
        private string _analysisStatus = "Select a profile to begin analysis";
        
        // Migration Item Generation
        private ObservableCollection<MigrationItem> _generatedItems;
        private ObservableCollection<MigrationItem> _selectedItems;
        private MigrationGenerationOptions _generationOptions;
        private int _totalGeneratedItems;
        private int _totalSelectedItems;
        
        // Wave Composition
        private ObservableCollection<MigrationWave> _migrationWaves;
        private MigrationWave _selectedWave;
        private ObservableCollection<MigrationItem> _waveItems;
        private string _newWaveName = "New Migration Wave";
        private DateTime _newWaveStartDate = DateTime.Now.AddDays(1);
        private DateTime _newWaveEndDate = DateTime.Now.AddDays(7);
        
        // Group Remapping
        private ObservableCollection<GroupRemappingRule> _remappingRules;
        private GroupRemappingRule _selectedRule;
        private string _newRuleName;
        private string _sourcePattern;
        private string _targetPattern;
        private RemappingStrategy _selectedStrategy = RemappingStrategy.AddPrefix;
        
        // Filtering and Sorting
        private string _searchText;
        private MigrationType? _selectedTypeFilter;
        private MigrationPriority? _selectedPriorityFilter;
        private MigrationComplexity? _selectedComplexityFilter;
        private bool _showOnlyValidationRequired;
        
        // Collections Views
        private ICollectionView _generatedItemsView;
        private ICollectionView _selectedItemsView;
        private ICollectionView _wavesView;
        #endregion
        
        #region Constructor
        public MigrationPlanningViewModel(ILogger<MigrationPlanningViewModel> logger = null) : base(logger)
        {
            _logger = logger;
            _migrationDataService = new MigrationDataService();
            _discoveryService = new DiscoveryService();
            _profileService = new ProfileService();
            _moduleRegistryService = ModuleRegistryService.Instance;
            
            InitializeCollections();
            InitializeCommands();
            InitializeCollectionViews();
            
            TabTitle = "Migration Planning";
        }
        #endregion
        
        #region Properties
        
        // Discovery Data Analysis Properties
        public ObservableCollection<string> AvailableProfiles { get; private set; }
        
        public string SelectedProfile
        {
            get => _selectedProfile;
            set
            {
                if (SetProperty(ref _selectedProfile, value))
                {
                    _ = LoadDiscoveryDataAsync();
                }
            }
        }
        
        public bool IsAnalyzing
        {
            get => _isAnalyzing;
            set => SetProperty(ref _isAnalyzing, value);
        }
        
        public string AnalysisStatus
        {
            get => _analysisStatus;
            set => SetProperty(ref _analysisStatus, value);
        }
        
        public DiscoveryAnalysisResult AnalysisResult
        {
            get => _analysisResult;
            set => SetProperty(ref _analysisResult, value);
        }
        
        // Migration Item Generation Properties
        public ObservableCollection<MigrationItem> GeneratedItems
        {
            get => _generatedItems;
            set => SetProperty(ref _generatedItems, value);
        }
        
        public ObservableCollection<MigrationItem> SelectedItems
        {
            get => _selectedItems;
            set => SetProperty(ref _selectedItems, value);
        }
        
        public MigrationGenerationOptions GenerationOptions
        {
            get => _generationOptions;
            set => SetProperty(ref _generationOptions, value);
        }
        
        public int TotalGeneratedItems
        {
            get => _totalGeneratedItems;
            set => SetProperty(ref _totalGeneratedItems, value);
        }
        
        public int TotalSelectedItems
        {
            get => _totalSelectedItems;
            set => SetProperty(ref _totalSelectedItems, value);
        }
        
        // Wave Composition Properties
        public ObservableCollection<MigrationWave> MigrationWaves
        {
            get => _migrationWaves;
            set => SetProperty(ref _migrationWaves, value);
        }
        
        public MigrationWave SelectedWave
        {
            get => _selectedWave;
            set
            {
                if (SetProperty(ref _selectedWave, value))
                {
                    LoadWaveItems();
                }
            }
        }
        
        public ObservableCollection<MigrationItem> WaveItems
        {
            get => _waveItems;
            set => SetProperty(ref _waveItems, value);
        }
        
        public string NewWaveName
        {
            get => _newWaveName;
            set => SetProperty(ref _newWaveName, value);
        }
        
        public DateTime NewWaveStartDate
        {
            get => _newWaveStartDate;
            set => SetProperty(ref _newWaveStartDate, value);
        }
        
        public DateTime NewWaveEndDate
        {
            get => _newWaveEndDate;
            set => SetProperty(ref _newWaveEndDate, value);
        }
        
        // Group Remapping Properties
        public ObservableCollection<GroupRemappingRule> RemappingRules
        {
            get => _remappingRules;
            set => SetProperty(ref _remappingRules, value);
        }
        
        public GroupRemappingRule SelectedRule
        {
            get => _selectedRule;
            set => SetProperty(ref _selectedRule, value);
        }
        
        public string NewRuleName
        {
            get => _newRuleName;
            set => SetProperty(ref _newRuleName, value);
        }
        
        public string SourcePattern
        {
            get => _sourcePattern;
            set => SetProperty(ref _sourcePattern, value);
        }
        
        public string TargetPattern
        {
            get => _targetPattern;
            set => SetProperty(ref _targetPattern, value);
        }
        
        public RemappingStrategy SelectedStrategy
        {
            get => _selectedStrategy;
            set => SetProperty(ref _selectedStrategy, value);
        }
        
        // Filtering Properties
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        public MigrationType? SelectedTypeFilter
        {
            get => _selectedTypeFilter;
            set
            {
                if (SetProperty(ref _selectedTypeFilter, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        public MigrationPriority? SelectedPriorityFilter
        {
            get => _selectedPriorityFilter;
            set
            {
                if (SetProperty(ref _selectedPriorityFilter, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        public MigrationComplexity? SelectedComplexityFilter
        {
            get => _selectedComplexityFilter;
            set
            {
                if (SetProperty(ref _selectedComplexityFilter, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        public bool ShowOnlyValidationRequired
        {
            get => _showOnlyValidationRequired;
            set
            {
                if (SetProperty(ref _showOnlyValidationRequired, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        // Collection Views
        public ICollectionView GeneratedItemsView
        {
            get => _generatedItemsView;
            private set => SetProperty(ref _generatedItemsView, value);
        }
        
        public ICollectionView SelectedItemsView
        {
            get => _selectedItemsView;
            private set => SetProperty(ref _selectedItemsView, value);
        }
        
        public ICollectionView WavesView
        {
            get => _wavesView;
            private set => SetProperty(ref _wavesView, value);
        }
        
        // Enumerations for UI Binding
        public Array MigrationTypes => Enum.GetValues(typeof(MigrationType));
        public Array MigrationPriorities => Enum.GetValues(typeof(MigrationPriority));
        public Array MigrationComplexities => Enum.GetValues(typeof(MigrationComplexity));
        public Array RemappingStrategies => Enum.GetValues(typeof(RemappingStrategy));
        #endregion
        
        #region Commands
        public ICommand LoadDiscoveryDataCommand { get; private set; }
        public ICommand GenerateMigrationItemsCommand { get; private set; }
        public ICommand SelectAllItemsCommand { get; private set; }
        public ICommand SelectNoneItemsCommand { get; private set; }
        public ICommand AddToWaveCommand { get; private set; }
        public ICommand CreateWaveCommand { get; private set; }
        public ICommand DeleteWaveCommand { get; private set; }
        public ICommand AddRemappingRuleCommand { get; private set; }
        public ICommand DeleteRemappingRuleCommand { get; private set; }
        public ICommand ApplyRemappingCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        public ICommand ExportPlanCommand { get; private set; }
        public ICommand ImportPlanCommand { get; private set; }
        #endregion
        
        #region Private Methods
        private void InitializeCollections()
        {
            AvailableProfiles = new ObservableCollection<string>();
            GeneratedItems = new ObservableCollection<MigrationItem>();
            SelectedItems = new ObservableCollection<MigrationItem>();
            MigrationWaves = new ObservableCollection<MigrationWave>();
            WaveItems = new ObservableCollection<MigrationItem>();
            RemappingRules = new ObservableCollection<GroupRemappingRule>();
            
            GenerationOptions = new MigrationGenerationOptions
            {
                IncludeUsers = true,
                IncludeMailboxes = true,
                IncludeGroups = true,
                IncludeInfrastructure = false,
                TargetDomain = "target.contoso.com"
            };
            
            LoadAvailableProfiles();
        }
        
        private void InitializeCommands()
        {
            LoadDiscoveryDataCommand = new AsyncRelayCommand(LoadDiscoveryDataAsync);
            GenerateMigrationItemsCommand = new AsyncRelayCommand(GenerateMigrationItemsAsync);
            SelectAllItemsCommand = new RelayCommand(SelectAllItems);
            SelectNoneItemsCommand = new RelayCommand(SelectNoneItems);
            AddToWaveCommand = new RelayCommand<MigrationWave>(AddToWave);
            CreateWaveCommand = new RelayCommand(CreateWave);
            DeleteWaveCommand = new RelayCommand<MigrationWave>(DeleteWave);
            AddRemappingRuleCommand = new RelayCommand(AddRemappingRule);
            DeleteRemappingRuleCommand = new RelayCommand<GroupRemappingRule>(DeleteRemappingRule);
            ApplyRemappingCommand = new RelayCommand(ApplyRemapping);
            ClearFiltersCommand = new RelayCommand(ClearFilters);
            ExportPlanCommand = new AsyncRelayCommand(ExportPlanAsync);
            ImportPlanCommand = new AsyncRelayCommand(ImportPlanAsync);
        }
        
        private void InitializeCollectionViews()
        {
            GeneratedItemsView = CollectionViewSource.GetDefaultView(GeneratedItems);
            GeneratedItemsView.Filter = FilterGeneratedItems;
            
            SelectedItemsView = CollectionViewSource.GetDefaultView(SelectedItems);
            WavesView = CollectionViewSource.GetDefaultView(MigrationWaves);
        }
        
        private async void LoadAvailableProfiles()
        {
            try
            {
                var profiles = await _profileService.GetAvailableProfilesAsync();
                AvailableProfiles.Clear();
                
                foreach (var profile in profiles)
                {
                    AvailableProfiles.Add(profile);
                }
                
                if (AvailableProfiles.Any())
                {
                    SelectedProfile = AvailableProfiles.First();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading available profiles");
                HasErrors = true;
                ErrorMessage = $"Failed to load profiles: {ex.Message}";
            }
        }
        
        private async Task LoadDiscoveryDataAsync()
        {
            if (string.IsNullOrWhiteSpace(SelectedProfile))
                return;
                
            try
            {
                IsAnalyzing = true;
                AnalysisStatus = "Loading discovery data...";
                
                _discoveryData = await _migrationDataService.LoadDiscoveryDataAsync(
                    SelectedProfile, 
                    loadUsers: true, 
                    loadGroups: true,
                    loadInfrastructure: true,
                    loadApplications: true);
                
                if (_discoveryData.IsSuccess)
                {
                    AnalysisStatus = "Analyzing discovery data...";
                    AnalysisResult = AnalyzeDiscoveryData(_discoveryData);
                    AnalysisStatus = $"Analysis complete - {AnalysisResult.TotalItems} items discovered";
                    HasData = true;
                }
                else
                {
                    AnalysisStatus = "Failed to load discovery data";
                    HasErrors = true;
                    ErrorMessage = "Discovery data could not be loaded";
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading discovery data");
                HasErrors = true;
                ErrorMessage = $"Discovery analysis failed: {ex.Message}";
                AnalysisStatus = "Discovery analysis failed";
            }
            finally
            {
                IsAnalyzing = false;
            }
        }
        
        private DiscoveryAnalysisResult AnalyzeDiscoveryData(ComprehensiveDataLoadResult data)
        {
            var result = new DiscoveryAnalysisResult
            {
                UserCount = data.Users?.Count ?? 0,
                GroupCount = data.Groups?.Count ?? 0,
                InfrastructureCount = data.Infrastructure?.Count ?? 0,
                ApplicationCount = data.Applications?.Count ?? 0,
                MailboxCount = data.Users?.Count(u => !string.IsNullOrWhiteSpace(u.Mail)) ?? 0,
                SecurityGroupCount = data.Groups?.Count(g => g.MailEnabled != true) ?? 0,
                DistributionListCount = data.Groups?.Count(g => g.MailEnabled == true) ?? 0,
                ComplexityScore = CalculateComplexityScore(data),
                EstimatedDuration = CalculateEstimatedDuration(data),
                RecommendedWaveCount = CalculateRecommendedWaves(data)
            };
            
            result.TotalItems = result.UserCount + result.GroupCount + result.InfrastructureCount + result.ApplicationCount;
            
            return result;
        }
        
        private int CalculateComplexityScore(ComprehensiveDataLoadResult data)
        {
            var score = 0;
            
            // Base complexity from item counts
            score += (data.Users?.Count ?? 0) / 10;
            score += (data.Groups?.Count ?? 0) / 5;
            score += (data.Infrastructure?.Count ?? 0) * 2;
            score += (data.Applications?.Count ?? 0) * 3;
            
            // Additional complexity factors
            var adminUsers = data.Users?.Count(u => u.JobTitle?.Contains("admin") == true) ?? 0;
            score += adminUsers * 2;
            
            return Math.Min(score, 100); // Cap at 100
        }
        
        private TimeSpan CalculateEstimatedDuration(ComprehensiveDataLoadResult data)
        {
            var hours = 0.0;
            
            // User migrations (30 minutes each)
            hours += (data.Users?.Count ?? 0) * 0.5;
            
            // Mailbox migrations (2 hours each)
            var mailboxes = data.Users?.Count(u => !string.IsNullOrWhiteSpace(u.Mail)) ?? 0;
            hours += mailboxes * 2.0;
            
            // Group migrations (15 minutes each)
            hours += (data.Groups?.Count ?? 0) * 0.25;
            
            // Infrastructure migrations (4 hours each)
            hours += (data.Infrastructure?.Count ?? 0) * 4.0;
            
            return TimeSpan.FromHours(Math.Max(hours, 1.0));
        }
        
        private int CalculateRecommendedWaves(ComprehensiveDataLoadResult data)
        {
            var totalItems = (data.Users?.Count ?? 0) + (data.Groups?.Count ?? 0) + (data.Infrastructure?.Count ?? 0);
            
            if (totalItems <= 50) return 1;
            if (totalItems <= 200) return 2;
            if (totalItems <= 500) return 3;
            if (totalItems <= 1000) return 4;
            return 5;
        }
        
        private async Task GenerateMigrationItemsAsync()
        {
            if (_discoveryData == null || !_discoveryData.IsSuccess)
            {
                MessageBox.Show("Please load discovery data first.", "No Discovery Data", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            
            try
            {
                IsLoading = true;
                LoadingMessage = "Generating migration items from discovery data...";
                
                var generatedItems = new List<MigrationItem>();
                
                // Generate User Migration Items
                if (GenerationOptions.IncludeUsers && _discoveryData.Users != null)
                {
                    LoadingMessage = $"Processing {_discoveryData.Users.Count} users...";
                    foreach (var user in _discoveryData.Users)
                    {
                        var migrationItem = CreateUserMigrationItem(user);
                        generatedItems.Add(migrationItem);
                        
                        // Create mailbox migration item if user has email
                        if (GenerationOptions.IncludeMailboxes && !string.IsNullOrWhiteSpace(user.Mail))
                        {
                            var mailboxItem = CreateMailboxMigrationItem(user);
                            generatedItems.Add(mailboxItem);
                        }
                    }
                }
                
                // Generate Group Migration Items
                if (GenerationOptions.IncludeGroups && _discoveryData.Groups != null)
                {
                    LoadingMessage = $"Processing {_discoveryData.Groups.Count} groups...";
                    foreach (var group in _discoveryData.Groups)
                    {
                        var migrationItem = CreateGroupMigrationItem(group);
                        generatedItems.Add(migrationItem);
                    }
                }
                
                // Generate Infrastructure Migration Items
                if (GenerationOptions.IncludeInfrastructure && _discoveryData.Infrastructure != null)
                {
                    LoadingMessage = $"Processing {_discoveryData.Infrastructure.Count} infrastructure items...";
                    foreach (var infra in _discoveryData.Infrastructure)
                    {
                        var migrationItem = CreateInfrastructureMigrationItem(infra);
                        generatedItems.Add(migrationItem);
                    }
                }
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    GeneratedItems.Clear();
                    foreach (var item in generatedItems)
                    {
                        GeneratedItems.Add(item);
                    }
                    
                    TotalGeneratedItems = GeneratedItems.Count;
                    HasData = GeneratedItems.Any();
                });
                
                LoadingMessage = $"Generated {generatedItems.Count} migration items from discovery data";
                
                // Auto-create recommended waves based on analysis
                if (AnalysisResult != null)
                {
                    await CreateRecommendedWavesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error generating migration items");
                HasErrors = true;
                ErrorMessage = $"Failed to generate migration items: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private void SelectAllItems()
        {
            SelectedItems.Clear();
            foreach (var item in GeneratedItems)
            {
                SelectedItems.Add(item);
            }
            TotalSelectedItems = SelectedItems.Count;
        }
        
        private void SelectNoneItems()
        {
            SelectedItems.Clear();
            TotalSelectedItems = 0;
        }
        
        private void AddToWave(MigrationWave wave)
        {
            if (wave == null || !SelectedItems.Any())
                return;
                
            foreach (var item in SelectedItems.ToList())
            {
                item.WaveId = wave.Id;
                item.Wave = wave.Name;
            }
            
            LoadWaveItems();
            MessageBox.Show($"Added {SelectedItems.Count} items to wave '{wave.Name}'", 
                "Items Added", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private void CreateWave()
        {
            if (string.IsNullOrWhiteSpace(NewWaveName))
            {
                MessageBox.Show("Please enter a wave name.", "Invalid Name", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            
            var wave = new MigrationWave
            {
                Id = Guid.NewGuid().ToString(),
                Name = NewWaveName,
                PlannedStartDate = NewWaveStartDate,
                PlannedEndDate = NewWaveEndDate,
                Status = MigrationStatus.Planned,
                CreatedAt = DateTime.Now
            };
            
            MigrationWaves.Add(wave);
            SelectedWave = wave;
            
            // Reset form
            NewWaveName = "New Migration Wave";
            NewWaveStartDate = DateTime.Now.AddDays(1);
            NewWaveEndDate = DateTime.Now.AddDays(7);
        }
        
        private void DeleteWave(MigrationWave wave)
        {
            if (wave == null)
                return;
                
            var result = MessageBox.Show($"Are you sure you want to delete wave '{wave.Name}'?", 
                "Confirm Deletion", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
            if (result == MessageBoxResult.Yes)
            {
                // Remove wave reference from items
                foreach (var item in GeneratedItems.Where(i => i.WaveId == wave.Id))
                {
                    item.WaveId = null;
                    item.Wave = null;
                }
                
                MigrationWaves.Remove(wave);
                if (SelectedWave == wave)
                {
                    SelectedWave = null;
                }
            }
        }
        
        private void LoadWaveItems()
        {
            WaveItems.Clear();
            
            if (SelectedWave != null)
            {
                var waveItems = GeneratedItems.Where(i => i.WaveId == SelectedWave.Id);
                foreach (var item in waveItems)
                {
                    WaveItems.Add(item);
                }
            }
        }
        
        private void AddRemappingRule()
        {
            if (string.IsNullOrWhiteSpace(NewRuleName) || string.IsNullOrWhiteSpace(SourcePattern))
            {
                MessageBox.Show("Please provide a rule name and source pattern.", "Invalid Input", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            
            var rule = new GroupRemappingRule
            {
                Id = Guid.NewGuid().ToString(),
                Name = NewRuleName,
                SourcePattern = SourcePattern,
                TargetPattern = TargetPattern ?? string.Empty,
                Strategy = SelectedStrategy,
                IsEnabled = true
            };
            
            RemappingRules.Add(rule);
            
            // Reset form
            NewRuleName = string.Empty;
            SourcePattern = string.Empty;
            TargetPattern = string.Empty;
        }
        
        private void DeleteRemappingRule(GroupRemappingRule rule)
        {
            if (rule != null)
            {
                RemappingRules.Remove(rule);
            }
        }
        
        private void ApplyRemapping()
        {
            var appliedRules = 0;
            
            foreach (var rule in RemappingRules.Where(r => r.IsEnabled))
            {
                var matchingItems = GeneratedItems.Where(i => 
                    i.Type == MigrationType.SecurityGroup || i.Type == MigrationType.DistributionList)
                    .Where(i => i.SourceIdentity?.Contains(rule.SourcePattern) == true);
                
                foreach (var item in matchingItems)
                {
                    item.TargetIdentity = ApplyRemappingStrategy(item.SourceIdentity, rule);
                    appliedRules++;
                }
            }
            
            MessageBox.Show($"Applied remapping to {appliedRules} items.", "Remapping Complete", 
                MessageBoxButton.OK, MessageBoxImage.Information);
        }
        
        private string ApplyRemappingStrategy(string sourceIdentity, GroupRemappingRule rule)
        {
            return rule.Strategy switch
            {
                RemappingStrategy.AddPrefix => $"{rule.TargetPattern}{sourceIdentity}",
                RemappingStrategy.AddSuffix => $"{sourceIdentity}{rule.TargetPattern}",
                RemappingStrategy.Replace => sourceIdentity.Replace(rule.SourcePattern, rule.TargetPattern),
                RemappingStrategy.Custom => rule.TargetPattern,
                _ => sourceIdentity
            };
        }
        
        private void ApplyFilters()
        {
            GeneratedItemsView?.Refresh();
        }
        
        private bool FilterGeneratedItems(object item)
        {
            if (!(item is MigrationItem migrationItem))
                return false;
            
            // Text search
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchLower = SearchText.ToLowerInvariant();
                if (!migrationItem.DisplayName?.ToLowerInvariant().Contains(searchLower) == true &&
                    !migrationItem.SourceIdentity?.ToLowerInvariant().Contains(searchLower) == true &&
                    !migrationItem.TargetIdentity?.ToLowerInvariant().Contains(searchLower) == true)
                {
                    return false;
                }
            }
            
            // Type filter
            if (SelectedTypeFilter.HasValue && migrationItem.Type != SelectedTypeFilter.Value)
                return false;
            
            // Priority filter
            if (SelectedPriorityFilter.HasValue && migrationItem.Priority != SelectedPriorityFilter.Value)
                return false;
            
            // Complexity filter
            if (SelectedComplexityFilter.HasValue && migrationItem.Complexity != SelectedComplexityFilter.Value)
                return false;
            
            // Validation required filter
            if (ShowOnlyValidationRequired && !migrationItem.IsValidationRequired)
                return false;
            
            return true;
        }
        
        private void ClearFilters()
        {
            SearchText = string.Empty;
            SelectedTypeFilter = null;
            SelectedPriorityFilter = null;
            SelectedComplexityFilter = null;
            ShowOnlyValidationRequired = false;
        }
        
        private async Task ExportPlanAsync()
        {
            try
            {
                // TODO: Implement export functionality
                MessageBox.Show("Export functionality will be implemented in Phase 2", "Feature Coming Soon", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting migration plan");
                MessageBox.Show($"Export failed: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async Task ImportPlanAsync()
        {
            try
            {
                // TODO: Implement import functionality
                MessageBox.Show("Import functionality will be implemented in Phase 2", "Feature Coming Soon", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error importing migration plan");
                MessageBox.Show($"Import failed: {ex.Message}", "Import Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        #endregion
        
        #region Overrides
        public override async Task LoadAsync()
        {
            IsLoading = true;
            HasData = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                _logger?.LogDebug($"[{GetType().Name}] Load start");
                
                LoadAvailableProfiles();
                
                // Initialize with sample remapping rules
                RemappingRules.Add(new GroupRemappingRule
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Add Corp Prefix",
                    SourcePattern = "G_",
                    TargetPattern = "CORP_",
                    Strategy = RemappingStrategy.AddPrefix,
                    IsEnabled = true
                });
                
                HasData = true;
                _logger?.LogInformation($"[{GetType().Name}] Load ok");
            }
            catch (Exception ex)
            {
                LastError = $"Unexpected error: {ex.Message}";
                _logger?.LogError($"[{GetType().Name}] Load fail ex={ex}");
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        protected override void OnDisposing()
        {
            // Cleanup resources
            base.OnDisposing();
        }
        /// <summary>
        /// Create user migration item from discovery data
        /// </summary>
        private MigrationItem CreateUserMigrationItem(UserData user)
        {
            return new MigrationItem
            {
                Id = Guid.NewGuid().ToString(),
                Type = MigrationType.User,
                DisplayName = user.DisplayName ?? user.SamAccountName,
                SourceIdentity = user.UserPrincipalName ?? user.SamAccountName,
                TargetIdentity = GenerateTargetIdentity(user.UserPrincipalName ?? user.SamAccountName, GenerationOptions.TargetDomain),
                Status = MigrationStatus.NotStarted,
                Priority = DeterminePriority(user),
                Complexity = DetermineComplexity(user),
                EstimatedDuration = TimeSpan.FromMinutes(30),
                IsValidationRequired = true,
                SupportsRollback = true,
                Created = DateTime.Now
            };
        }
        
        /// <summary>
        /// Create mailbox migration item from user data
        /// </summary>
        private MigrationItem CreateMailboxMigrationItem(UserData user)
        {
            return new MigrationItem
            {
                Id = Guid.NewGuid().ToString(),
                Type = MigrationType.Mailbox,
                DisplayName = $"Mailbox: {user.DisplayName ?? user.SamAccountName}",
                SourceIdentity = user.Mail,
                TargetIdentity = GenerateTargetIdentity(user.Mail, GenerationOptions.TargetDomain),
                Status = MigrationStatus.NotStarted,
                Priority = DeterminePriority(user),
                Complexity = DetermineMailboxComplexity(user),
                EstimatedDuration = TimeSpan.FromHours(2),
                IsValidationRequired = true,
                SupportsRollback = true,
                Created = DateTime.Now
            };
        }
        
        /// <summary>
        /// Create group migration item from discovery data
        /// </summary>
        private MigrationItem CreateGroupMigrationItem(GroupData group)
        {
            var type = group.MailEnabled == true ? MigrationType.DistributionList : MigrationType.SecurityGroup;
            
            return new MigrationItem
            {
                Id = Guid.NewGuid().ToString(),
                Type = type,
                DisplayName = group.DisplayName ?? "Unknown Group",
                SourceIdentity = group.DisplayName ?? "Unknown Group",
                TargetIdentity = GenerateGroupTargetIdentity(group.DisplayName ?? "Unknown Group", type),
                Status = MigrationStatus.NotStarted,
                Priority = DetermineGroupPriority(group),
                Complexity = DetermineGroupComplexity(group),
                EstimatedDuration = TimeSpan.FromMinutes(15),
                IsValidationRequired = true,
                SupportsRollback = true,
                Created = DateTime.Now
            };
        }
        
        /// <summary>
        /// Create infrastructure migration item from discovery data
        /// </summary>
        private MigrationItem CreateInfrastructureMigrationItem(InfrastructureData infra)
        {
            var type = DetermineInfrastructureMigrationType(infra.Type);
            
            return new MigrationItem
            {
                Id = Guid.NewGuid().ToString(),
                Type = type,
                DisplayName = infra.Name,
                SourceIdentity = infra.Name ?? infra.Description,
                TargetIdentity = GenerateInfrastructureTargetIdentity(infra.Name, infra.Type),
                Status = MigrationStatus.NotStarted,
                Priority = DetermineInfrastructurePriority(infra),
                Complexity = DetermineInfrastructureComplexity(infra),
                EstimatedDuration = GetInfrastructureDuration(infra.Type),
                IsValidationRequired = true,
                SupportsRollback = infra.Type != "VirtualMachine", // VMs might not support rollback
                Created = DateTime.Now
            };
        }
        
        /// <summary>
        /// Generate target identity based on source and target domain
        /// </summary>
        private string GenerateTargetIdentity(string sourceIdentity, string targetDomain)
        {
            if (string.IsNullOrWhiteSpace(sourceIdentity)) return string.Empty;
            
            if (sourceIdentity.Contains("@"))
            {
                var username = sourceIdentity.Split('@')[0];
                return $"{username}@{targetDomain}";
            }
            
            return $"{sourceIdentity}@{targetDomain}";
        }
        
        /// <summary>
        /// Generate group target identity with remapping rules
        /// </summary>
        private string GenerateGroupTargetIdentity(string sourceIdentity, MigrationType type)
        {
            var targetIdentity = sourceIdentity;
            
            // Apply any enabled remapping rules
            foreach (var rule in RemappingRules.Where(r => r.IsEnabled))
            {
                if (sourceIdentity?.Contains(rule.SourcePattern) == true)
                {
                    targetIdentity = ApplyRemappingStrategy(sourceIdentity, rule);
                    break;
                }
            }
            
            return targetIdentity;
        }
        
        /// <summary>
        /// Generate infrastructure target identity
        /// </summary>
        private string GenerateInfrastructureTargetIdentity(string sourceName, string type)
        {
            return type switch
            {
                "FileShare" => $"\\\\{GenerationOptions.TargetDomain}\\{sourceName}",
                "VirtualMachine" => $"{sourceName}-migrated",
                "Application" => $"{sourceName}-target",
                _ => sourceName
            };
        }
        
        /// <summary>
        /// Determine migration priority based on user attributes
        /// </summary>
        private MigrationPriority DeterminePriority(UserData user)
        {
            if (user.JobTitle?.Contains("admin", StringComparison.OrdinalIgnoreCase) == true ||
                user.JobTitle?.Contains("manager", StringComparison.OrdinalIgnoreCase) == true ||
                user.JobTitle?.Contains("director", StringComparison.OrdinalIgnoreCase) == true ||
                user.JobTitle?.Contains("ceo", StringComparison.OrdinalIgnoreCase) == true ||
                user.JobTitle?.Contains("cto", StringComparison.OrdinalIgnoreCase) == true ||
                user.JobTitle?.Contains("cfo", StringComparison.OrdinalIgnoreCase) == true)
            {
                return MigrationPriority.High;
            }
            
            if (!string.IsNullOrWhiteSpace(user.Mail))
            {
                return MigrationPriority.Normal;
            }
            
            return MigrationPriority.Low;
        }
        
        /// <summary>
        /// Determine migration complexity based on user attributes
        /// </summary>
        private MigrationComplexity DetermineComplexity(UserData user)
        {
            var complexityFactors = 0;
            
            if (!string.IsNullOrWhiteSpace(user.Mail)) complexityFactors++;
            // HomeDirectory not available in UserData - skip complexity factor
            // ProfilePath not available in UserData - skip complexity factor
            // MemberOf not available in UserData - skip complexity factor
            if (user.JobTitle?.Contains("admin", StringComparison.OrdinalIgnoreCase) == true) complexityFactors++;
            
            return complexityFactors switch
            {
                >= 4 => MigrationComplexity.Complex,
                >= 2 => MigrationComplexity.Moderate,
                _ => MigrationComplexity.Simple
            };
        }
        
        /// <summary>
        /// Determine mailbox complexity
        /// </summary>
        private MigrationComplexity DetermineMailboxComplexity(UserData user)
        {
            // For now, assume medium complexity for all mailboxes
            // In real implementation, this would check mailbox size, rules, etc.
            return MigrationComplexity.Moderate;
        }
        
        /// <summary>
        /// Create recommended migration waves based on analysis
        /// </summary>
        private async Task CreateRecommendedWavesAsync()
        {
            if (AnalysisResult == null || GeneratedItems.Count == 0) return;
            
            try
            {
                // Clear existing waves
                MigrationWaves.Clear();
                
                var waveCount = AnalysisResult.RecommendedWaveCount;
                var itemsPerWave = Math.Max(1, GeneratedItems.Count / waveCount);
                
                // Group items by priority and type
                var sortedItems = GeneratedItems
                    .OrderBy(i => i.Priority)
                    .ThenBy(i => i.Type)
                    .ThenBy(i => i.Complexity)
                    .ToList();
                
                for (int i = 0; i < waveCount; i++)
                {
                    var wave = new MigrationWave
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = $"Wave {i + 1}",
                        PlannedStartDate = DateTime.Now.AddDays(i * 7), // Weekly waves
                        PlannedEndDate = DateTime.Now.AddDays((i + 1) * 7 - 1),
                        Status = MigrationStatus.Planned,
                        CreatedAt = DateTime.Now
                    };
                    
                    MigrationWaves.Add(wave);
                    
                    // Assign items to wave
                    var waveItems = sortedItems.Skip(i * itemsPerWave).Take(itemsPerWave);
                    foreach (var item in waveItems)
                    {
                        item.WaveId = wave.Id;
                        item.Wave = wave.Name;
                    }
                }
                
                // Handle any remaining items
                var remainingItems = sortedItems.Skip(waveCount * itemsPerWave);
                if (remainingItems.Any() && MigrationWaves.Any())
                {
                    var lastWave = MigrationWaves.Last();
                    foreach (var item in remainingItems)
                    {
                        item.WaveId = lastWave.Id;
                        item.Wave = lastWave.Name;
                    }
                }
                
                // Select first wave
                if (MigrationWaves.Any())
                {
                    SelectedWave = MigrationWaves.First();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating recommended waves");
            }
        }
        
        // Helper methods for infrastructure items
        private MigrationType DetermineInfrastructureMigrationType(string type) => type switch
        {
            "FileShare" => MigrationType.FileShare,
            "VirtualMachine" => MigrationType.VirtualMachine,
            "Application" => MigrationType.Application,
            "SharePointSite" => MigrationType.SharePoint,
            _ => MigrationType.Application
        };
        
        private MigrationPriority DetermineInfrastructurePriority(InfrastructureData infra) => 
            infra.Type == "VirtualMachine" ? MigrationPriority.High : MigrationPriority.Normal;
            
        private MigrationComplexity DetermineInfrastructureComplexity(InfrastructureData infra) => 
            infra.Type == "VirtualMachine" ? MigrationComplexity.Complex : MigrationComplexity.Moderate;
            
        private TimeSpan GetInfrastructureDuration(string type) => type switch
        {
            "FileShare" => TimeSpan.FromHours(1),
            "VirtualMachine" => TimeSpan.FromHours(4),
            "Application" => TimeSpan.FromHours(2),
            "SharePointSite" => TimeSpan.FromHours(3),
            _ => TimeSpan.FromHours(1)
        };
        
        private MigrationPriority DetermineGroupPriority(GroupData group) => 
            group.MailEnabled == true ? MigrationPriority.Normal : MigrationPriority.Low;
            
        private MigrationComplexity DetermineGroupComplexity(GroupData group) =>
            group.MemberCount > 5 ? MigrationComplexity.Moderate : MigrationComplexity.Simple;
        #endregion
    }
    
    #region Supporting Classes
    /// <summary>
    /// Result of discovery data analysis
    /// </summary>
    public class DiscoveryAnalysisResult
    {
        public int UserCount { get; set; }
        public int GroupCount { get; set; }
        public int InfrastructureCount { get; set; }
        public int ApplicationCount { get; set; }
        public int MailboxCount { get; set; }
        public int SecurityGroupCount { get; set; }
        public int DistributionListCount { get; set; }
        public int TotalItems { get; set; }
        public int ComplexityScore { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        public int RecommendedWaveCount { get; set; }
    }
    
    /// <summary>
    /// Group remapping rule for migration planning
    /// </summary>
    public class GroupRemappingRule
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string SourcePattern { get; set; }
        public string TargetPattern { get; set; }
        public RemappingStrategy Strategy { get; set; }
        public bool IsEnabled { get; set; }
    }
    
    /// <summary>
    /// Strategy for remapping group names
    /// </summary>
    public enum RemappingStrategy
    {
        AddPrefix,
        AddSuffix,
        Replace,
        Custom
    }
    #endregion
}