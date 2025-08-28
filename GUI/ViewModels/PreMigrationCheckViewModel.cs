#nullable enable
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
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Pre-Migration Check functionality following MVVM patterns
    /// </summary>
    public class PreMigrationCheckViewModel : BaseViewModel
    {
        private readonly PreMigrationCheckService _preMigrationCheckService;
        private readonly ILogger<PreMigrationCheckViewModel> _logger;
        
        // Observable collections for UI binding
        public ObservableCollection<EligibilityItemViewModel> AllItems { get; } = new();
        public ObservableCollection<EligibilityItemViewModel> FilteredItems { get; } = new();
        public ObservableCollection<ObjectMappingViewModel> PendingMappings { get; } = new();
        
        // Collection views for filtering and sorting
        private ICollectionView? _itemsView;
        
        // Properties for UI binding
        private bool _isLoading;
        private string _searchText = string.Empty;
        private string _selectedTypeFilter = "All";
        private string _selectedStatusFilter = "All";
        private string _selectedMappingFilter = "All";
        private EligibilityReport? _currentReport;
        private EligibilityItemViewModel? _selectedItem;
        private bool _showMappingPanel;
        private string _progressMessage = string.Empty;
        private int _progressPercentage;

        // Summary properties
        private int _totalEligible;
        private int _totalBlocked;
        private int _totalUnmapped;
        private int _totalMapped;

        public PreMigrationCheckViewModel(
            PreMigrationCheckService preMigrationCheckService,
            ILogger<PreMigrationCheckViewModel> logger)
        {
            _preMigrationCheckService = preMigrationCheckService ?? throw new ArgumentNullException(nameof(preMigrationCheckService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Initialize commands
            RunChecksCommand = new AsyncRelayCommand(ExecuteRunChecksAsync, CanExecuteRunChecks);
            RefreshCommand = new AsyncRelayCommand(ExecuteRefreshAsync);
            SaveMappingsCommand = new AsyncRelayCommand(ExecuteSaveMappingsAsync, CanExecuteSaveMappings);
            ExportReportCommand = new AsyncRelayCommand(ExecuteExportReportAsync, CanExecuteExportReport);
            ClearFiltersCommand = new RelayCommand(ExecuteClearFilters);
            ShowMappingPanelCommand = new RelayCommand(ExecuteShowMappingPanel);
            CreateMappingCommand = new RelayCommand<EligibilityItemViewModel>(ExecuteCreateMapping);
            RemoveMappingCommand = new RelayCommand<ObjectMappingViewModel>(ExecuteRemoveMapping);
            ApplyMappingCommand = new AsyncRelayCommand<ObjectMappingViewModel>(ExecuteApplyMappingAsync);

            // Initialize collection view
            InitializeCollectionView();
            
            // Initialize filter collections
            InitializeFilterCollections();
        }

        #region Properties

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

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

        public string SelectedTypeFilter
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

        public string SelectedStatusFilter
        {
            get => _selectedStatusFilter;
            set
            {
                if (SetProperty(ref _selectedStatusFilter, value))
                {
                    ApplyFilters();
                }
            }
        }

        public string SelectedMappingFilter
        {
            get => _selectedMappingFilter;
            set
            {
                if (SetProperty(ref _selectedMappingFilter, value))
                {
                    ApplyFilters();
                }
            }
        }

        public EligibilityItemViewModel? SelectedItem
        {
            get => _selectedItem;
            set => SetProperty(ref _selectedItem, value);
        }

        public bool ShowMappingPanel
        {
            get => _showMappingPanel;
            set => SetProperty(ref _showMappingPanel, value);
        }

        public string ProgressMessage
        {
            get => _progressMessage;
            set => SetProperty(ref _progressMessage, value);
        }

        public int ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        // Summary properties
        public int TotalEligible
        {
            get => _totalEligible;
            set => SetProperty(ref _totalEligible, value);
        }

        public int TotalBlocked
        {
            get => _totalBlocked;
            set => SetProperty(ref _totalBlocked, value);
        }

        public int TotalUnmapped
        {
            get => _totalUnmapped;
            set => SetProperty(ref _totalUnmapped, value);
        }

        public int TotalMapped
        {
            get => _totalMapped;
            set => SetProperty(ref _totalMapped, value);
        }

        // Filter options
        public ObservableCollection<string> TypeFilterOptions { get; } = new() { "All", "User", "Mailbox", "FileShare", "Database" };
        public ObservableCollection<string> StatusFilterOptions { get; } = new() { "All", "Eligible", "Blocked" };
        public ObservableCollection<string> MappingFilterOptions { get; } = new() { "All", "Mapped", "Unmapped", "Exact Match", "Fuzzy Match", "Manual" };

        #endregion

        #region Commands

        public ICommand RunChecksCommand { get; }
        public ICommand RefreshCommand { get; }
        public ICommand SaveMappingsCommand { get; }
        public ICommand ExportReportCommand { get; }
        public ICommand ClearFiltersCommand { get; }
        public ICommand ShowMappingPanelCommand { get; }
        public ICommand CreateMappingCommand { get; }
        public ICommand RemoveMappingCommand { get; }
        public ICommand ApplyMappingCommand { get; }

        #endregion

        #region Command Implementations

        private async Task ExecuteRunChecksAsync()
        {
            try
            {
                IsLoading = true;
                ProgressMessage = "Starting pre-migration eligibility checks...";
                ProgressPercentage = 0;

                // Clear previous results
                AllItems.Clear();
                FilteredItems.Clear();
                PendingMappings.Clear();

                // Update progress
                ProgressMessage = "Checking user eligibility...";
                ProgressPercentage = 25;
                await Task.Delay(100); // Allow UI to update

                // Run the eligibility checks
                _currentReport = await _preMigrationCheckService.GetEligibilityReportAsync();

                // Update progress
                ProgressMessage = "Processing results...";
                ProgressPercentage = 75;

                // Convert report to view models
                await ConvertReportToViewModels(_currentReport);

                // Update progress
                ProgressMessage = "Finalizing results...";
                ProgressPercentage = 100;

                // Update summary statistics
                UpdateSummaryStatistics();

                _logger.LogInformation($"Pre-migration checks completed. Total items: {AllItems.Count}");
                
                ProgressMessage = "Checks completed successfully!";
                await Task.Delay(2000); // Show success message briefly
                ProgressMessage = string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during pre-migration checks");
                ProgressMessage = $"Error: {ex.Message}";
                MessageBox.Show($"Error during pre-migration checks: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
                ProgressPercentage = 0;
            }
        }

        private bool CanExecuteRunChecks() => !IsLoading;

        private async Task ExecuteRefreshAsync()
        {
            await ExecuteRunChecksAsync();
        }

        private async Task ExecuteSaveMappingsAsync()
        {
            try
            {
                var mappings = PendingMappings.Select(vm => new ObjectMapping
                {
                    SourceId = vm.SourceId,
                    TargetId = vm.TargetId,
                    TargetName = vm.TargetName,
                    MappingType = "Manual",
                    Confidence = 1.0,
                    Notes = vm.Notes
                }).ToList();

                await _preMigrationCheckService.SaveManualmappingsAsync(mappings);
                
                // Clear pending mappings after save
                PendingMappings.Clear();
                
                _logger.LogInformation($"Saved {mappings.Count} manual mappings");
                MessageBox.Show($"Successfully saved {mappings.Count} manual mappings.", "Save Complete", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving manual mappings");
                MessageBox.Show($"Error saving mappings: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private bool CanExecuteSaveMappings() => PendingMappings.Count > 0;

        private async Task ExecuteExportReportAsync()
        {
            try
            {
                if (_currentReport == null)
                {
                    MessageBox.Show("No report available to export. Please run checks first.", "Export Error", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                // Placeholder for export functionality
                // In real implementation, this would open a save dialog and export to CSV/Excel/PDF
                await Task.Delay(500);
                MessageBox.Show("Export functionality will be implemented in future version.", "Export", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report");
                MessageBox.Show($"Error exporting report: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private bool CanExecuteExportReport() => _currentReport != null;

        private void ExecuteClearFilters()
        {
            SearchText = string.Empty;
            SelectedTypeFilter = "All";
            SelectedStatusFilter = "All";
            SelectedMappingFilter = "All";
        }

        private void ExecuteShowMappingPanel()
        {
            ShowMappingPanel = !ShowMappingPanel;
        }

        private void ExecuteCreateMapping(EligibilityItemViewModel? item)
        {
            if (item == null || !item.IsEligible) return;

            var mappingVm = new ObjectMappingViewModel
            {
                SourceId = item.Id,
                SourceName = item.Name,
                SourceType = item.Type,
                MappingType = "Manual"
            };

            PendingMappings.Add(mappingVm);
            ShowMappingPanel = true;
        }

        private void ExecuteRemoveMapping(ObjectMappingViewModel? mapping)
        {
            if (mapping != null)
            {
                PendingMappings.Remove(mapping);
            }
        }

        private async Task ExecuteApplyMappingAsync(ObjectMappingViewModel? mapping)
        {
            if (mapping == null) return;

            try
            {
                // Find the corresponding item and update its mapping
                var item = AllItems.FirstOrDefault(i => i.Id == mapping.SourceId);
                if (item != null)
                {
                    item.TargetMapping = new ObjectMapping
                    {
                        SourceId = mapping.SourceId,
                        TargetId = mapping.TargetId,
                        TargetName = mapping.TargetName,
                        MappingType = "Manual",
                        Confidence = 1.0,
                        Notes = mapping.Notes
                    };
                    item.MappingStatus = "Manually Mapped";
                    
                    // Update summary
                    UpdateSummaryStatistics();
                }

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying manual mapping");
                MessageBox.Show($"Error applying mapping: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        #endregion

        #region Helper Methods

        private void InitializeCollectionView()
        {
            _itemsView = CollectionViewSource.GetDefaultView(AllItems);
            _itemsView.Filter = ItemFilter;
        }

        private void InitializeFilterCollections()
        {
            // Filter collections are already initialized in properties
        }

        private async Task ConvertReportToViewModels(EligibilityReport report)
        {
            await Task.Run(() =>
            {
                var allItems = new List<EligibilityItemViewModel>();

                // Convert users
                foreach (var user in report.Users)
                {
                    allItems.Add(new EligibilityItemViewModel(user));
                }

                // Convert mailboxes
                foreach (var mailbox in report.Mailboxes)
                {
                    allItems.Add(new EligibilityItemViewModel(mailbox));
                }

                // Convert files
                foreach (var file in report.Files)
                {
                    allItems.Add(new EligibilityItemViewModel(file));
                }

                // Convert databases
                foreach (var database in report.Databases)
                {
                    allItems.Add(new EligibilityItemViewModel(database));
                }

                // Update UI on dispatcher thread
                Application.Current.Dispatcher.Invoke(() =>
                {
                    AllItems.Clear();
                    foreach (var item in allItems)
                    {
                        AllItems.Add(item);
                    }
                    
                    ApplyFilters();
                });
            });
        }

        private void ApplyFilters()
        {
            _itemsView?.Refresh();
        }

        private bool ItemFilter(object obj)
        {
            if (obj is not EligibilityItemViewModel item) return false;

            // Search text filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                var searchLower = SearchText.ToLowerInvariant();
                if (!item.Name.ToLowerInvariant().Contains(searchLower) &&
                    !item.Id.ToLowerInvariant().Contains(searchLower) &&
                    !item.IssuesSummary.ToLowerInvariant().Contains(searchLower))
                {
                    return false;
                }
            }

            // Type filter
            if (SelectedTypeFilter != "All" && item.Type != SelectedTypeFilter)
            {
                return false;
            }

            // Status filter
            if (SelectedStatusFilter != "All")
            {
                var isEligible = SelectedStatusFilter == "Eligible";
                if (item.IsEligible != isEligible)
                {
                    return false;
                }
            }

            // Mapping filter
            if (SelectedMappingFilter != "All")
            {
                switch (SelectedMappingFilter)
                {
                    case "Mapped":
                        if (item.MappingStatus == "Unmapped" || item.MappingStatus == "Not Processed")
                            return false;
                        break;
                    case "Unmapped":
                        if (item.MappingStatus != "Unmapped")
                            return false;
                        break;
                    default:
                        if (!item.MappingStatus.Contains(SelectedMappingFilter))
                            return false;
                        break;
                }
            }

            return true;
        }

        private void UpdateSummaryStatistics()
        {
            TotalEligible = AllItems.Count(i => i.IsEligible);
            TotalBlocked = AllItems.Count(i => !i.IsEligible);
            TotalUnmapped = AllItems.Count(i => i.IsEligible && i.MappingStatus == "Unmapped");
            TotalMapped = AllItems.Count(i => i.IsEligible && i.MappingStatus != "Unmapped" && i.MappingStatus != "Not Processed");
        }

        #endregion
    }

    /// <summary>
    /// ViewModel wrapper for EligibilityItem
    /// </summary>
    public class EligibilityItemViewModel : BaseViewModel
    {
        private readonly EligibilityItem _eligibilityItem;

        public EligibilityItemViewModel(EligibilityItem eligibilityItem)
        {
            _eligibilityItem = eligibilityItem ?? throw new ArgumentNullException(nameof(eligibilityItem));
        }

        public string Id => _eligibilityItem.Id;
        public string Name => _eligibilityItem.Name;
        public string Type => _eligibilityItem.Type;
        public bool IsEligible => _eligibilityItem.IsEligible;
        public List<string> Issues => _eligibilityItem.Issues;
        public string IssuesSummary => _eligibilityItem.IssuesSummary;
        public string EligibilityStatus => _eligibilityItem.EligibilityStatus;

        public string MappingStatus
        {
            get => _eligibilityItem.MappingStatus;
            set
            {
                _eligibilityItem.MappingStatus = value;
                OnPropertyChanged();
            }
        }

        public ObjectMapping? TargetMapping
        {
            get => _eligibilityItem.TargetMapping;
            set
            {
                _eligibilityItem.TargetMapping = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(HasMapping));
                OnPropertyChanged(nameof(MappingDetails));
            }
        }

        public bool HasMapping => TargetMapping != null;
        public string MappingDetails => TargetMapping?.TargetName ?? "No mapping";
        public double MappingConfidence => TargetMapping?.Confidence ?? 0.0;
    }

    /// <summary>
    /// ViewModel for object mapping creation/editing
    /// </summary>
    public class ObjectMappingViewModel : BaseViewModel
    {
        private string _sourceId = string.Empty;
        private string _sourceName = string.Empty;
        private string _sourceType = string.Empty;
        private string _targetId = string.Empty;
        private string _targetName = string.Empty;
        private string _mappingType = string.Empty;
        private string _notes = string.Empty;

        public string SourceId
        {
            get => _sourceId;
            set => SetProperty(ref _sourceId, value);
        }

        public string SourceName
        {
            get => _sourceName;
            set => SetProperty(ref _sourceName, value);
        }

        public string SourceType
        {
            get => _sourceType;
            set => SetProperty(ref _sourceType, value);
        }

        public string TargetId
        {
            get => _targetId;
            set => SetProperty(ref _targetId, value);
        }

        public string TargetName
        {
            get => _targetName;
            set => SetProperty(ref _targetName, value);
        }

        public string MappingType
        {
            get => _mappingType;
            set => SetProperty(ref _mappingType, value);
        }

        public string Notes
        {
            get => _notes;
            set => SetProperty(ref _notes, value);
        }
    }
}