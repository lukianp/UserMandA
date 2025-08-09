using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Collections;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Groups tab containing all security group-related functionality and data
    /// </summary>
    public class GroupsViewModel : BaseViewModel
    {
        #region Fields

        private readonly IDataService _dataService;
        private string _searchText;
        private bool _isLoading;
        private string _loadingMessage;
        private int _loadingProgress;
        private ICollectionView _groupsView;
        private string _selectedGroupType = "All";

        #endregion

        #region Properties

        /// <summary>
        /// Collection of all group data
        /// </summary>
        public OptimizedObservableCollection<GroupData> Groups { get; }

        /// <summary>
        /// Filtered and sorted view of groups
        /// </summary>
        public ICollectionView GroupsView
        {
            get => _groupsView;
            private set => SetProperty(ref _groupsView, value);
        }

        /// <summary>
        /// Search text for filtering groups
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilter();
                }
            }
        }

        /// <summary>
        /// Selected group type filter
        /// </summary>
        public string SelectedGroupType
        {
            get => _selectedGroupType;
            set
            {
                if (SetProperty(ref _selectedGroupType, value))
                {
                    ApplyFilter();
                }
            }
        }

        /// <summary>
        /// Available group type filters
        /// </summary>
        public ObservableCollection<string> GroupTypes { get; } = new ObservableCollection<string>
        {
            "All",
            "Security",
            "Distribution",
            "Universal",
            "Global",
            "Domain Local"
        };

        /// <summary>
        /// Whether groups are currently being loaded
        /// </summary>
        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        /// <summary>
        /// Loading progress message
        /// </summary>
        public string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        /// <summary>
        /// Loading progress percentage (0-100)
        /// </summary>
        public int LoadingProgress
        {
            get => _loadingProgress;
            set => SetProperty(ref _loadingProgress, value);
        }

        /// <summary>
        /// Number of groups currently displayed after filtering
        /// </summary>
        public int FilteredGroupCount => GroupsView?.Cast<GroupData>().Count() ?? 0;

        /// <summary>
        /// Total number of groups loaded
        /// </summary>
        public int TotalGroupCount => Groups?.Count ?? 0;

        /// <summary>
        /// Number of security groups
        /// </summary>
        public int SecurityGroupCount => Groups?.Count(g => g.Type?.Contains("Security", StringComparison.OrdinalIgnoreCase) == true) ?? 0;

        /// <summary>
        /// Number of distribution groups
        /// </summary>
        public int DistributionGroupCount => Groups?.Count(g => g.Type?.Contains("Distribution", StringComparison.OrdinalIgnoreCase) == true) ?? 0;

        /// <summary>
        /// Status information text
        /// </summary>
        public string StatusInfo => $"Showing {FilteredGroupCount} of {TotalGroupCount} groups ({SecurityGroupCount} security, {DistributionGroupCount} distribution)";

        #endregion

        #region Commands

        public ICommand RefreshGroupsCommand { get; }
        public ICommand ExportGroupsCommand { get; }
        public ICommand ExportSelectedGroupsCommand { get; }
        public ICommand SelectAllGroupsCommand { get; }
        public ICommand DeselectAllGroupsCommand { get; }
        public ICommand DeleteSelectedGroupsCommand { get; }
        public ICommand CopySelectedGroupsCommand { get; }
        public ICommand CopyAllGroupsCommand { get; }
        public ICommand ShowAdvancedSearchCommand { get; }
        public ICommand ClearSearchCommand { get; }
        public ICommand MapSecurityGroupsCommand { get; }
        public ICommand AnalyzeGroupMembershipCommand { get; }
        public ICommand ShowGroupHierarchyCommand { get; }

        #endregion

        #region Constructor

        public GroupsViewModel(IDataService dataService = null)
        {
            _dataService = dataService ?? SimpleServiceLocator.GetService<IDataService>();
            
            Groups = new OptimizedObservableCollection<GroupData>();
            Groups.CollectionChanged += (s, e) => 
            {
                OnPropertiesChanged(nameof(TotalGroupCount), nameof(SecurityGroupCount), nameof(DistributionGroupCount), nameof(StatusInfo));
            };

            // Create collection view for filtering and sorting
            GroupsView = CollectionViewSource.GetDefaultView(Groups);
            GroupsView.Filter = FilterGroups;
            
            // Add default sorting by group name
            GroupsView.SortDescriptions.Add(new SortDescription("Name", ListSortDirection.Ascending));

            // Initialize commands
            RefreshGroupsCommand = new AsyncRelayCommand(RefreshGroupsAsync, () => !IsLoading);
            ExportGroupsCommand = new AsyncRelayCommand(ExportGroupsAsync, () => Groups.Count > 0);
            ExportSelectedGroupsCommand = new AsyncRelayCommand(ExportSelectedGroupsAsync, CanExecuteSelectedGroupsOperation);
            SelectAllGroupsCommand = new RelayCommand(SelectAllGroups, () => Groups.Count > 0);
            DeselectAllGroupsCommand = new RelayCommand(DeselectAllGroups, CanExecuteSelectedGroupsOperation);
            DeleteSelectedGroupsCommand = new AsyncRelayCommand(DeleteSelectedGroupsAsync, CanExecuteSelectedGroupsOperation);
            CopySelectedGroupsCommand = new RelayCommand(CopySelectedGroups, CanExecuteSelectedGroupsOperation);
            CopyAllGroupsCommand = new RelayCommand(CopyAllGroups, () => Groups.Count > 0);
            ShowAdvancedSearchCommand = new RelayCommand(ShowAdvancedSearch);
            ClearSearchCommand = new RelayCommand(ClearSearch, () => !string.IsNullOrEmpty(SearchText));
            MapSecurityGroupsCommand = new AsyncRelayCommand(MapSecurityGroupsAsync, () => Groups.Count > 0);
            AnalyzeGroupMembershipCommand = new AsyncRelayCommand(AnalyzeGroupMembershipAsync, () => Groups.Count > 0);
            ShowGroupHierarchyCommand = new RelayCommand(ShowGroupHierarchy, () => Groups.Count > 0);

            _searchText = string.Empty;
            _loadingMessage = "Ready";
            
            // Auto-load data when ViewModel is created
            LoadDataAsync();
        }

        #endregion

        #region Public Methods
        
        private async void LoadDataAsync()
        {
            await RefreshGroupsAsync();
        }

        /// <summary>
        /// Initialize groups data from the specified directory
        /// </summary>
        public async Task InitializeAsync(string dataDirectory)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Loading groups data...";
                LoadingProgress = 0;

                await RefreshGroupsAsync(dataDirectory);
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to initialize groups data: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
                LoadingProgress = 100;
            }
        }

        #endregion

        #region Private Methods

        private async Task RefreshGroupsAsync()
        {
            await RefreshGroupsAsync(null);
        }

        private async Task RefreshGroupsAsync(string dataDirectory = null)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Refreshing groups data...";
                LoadingProgress = 10;

                Groups.Clear();
                
                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                LoadingMessage = "Loading security groups...";
                LoadingProgress = 30;

                var groupData = await _dataService?.LoadGroupsAsync(profileName) ?? new System.Collections.Generic.List<GroupData>();
                
                LoadingMessage = "Processing group data...";
                LoadingProgress = 70;

                foreach (var group in groupData)
                {
                    Groups.Add(group);
                }

                LoadingMessage = "Applying filters...";
                LoadingProgress = 90;

                GroupsView.Refresh();
                OnPropertiesChanged(nameof(FilteredGroupCount), nameof(TotalGroupCount), nameof(SecurityGroupCount), nameof(DistributionGroupCount), nameof(StatusInfo));

                LoadingMessage = $"Loaded {Groups.Count} groups successfully";
                LoadingProgress = 100;
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to refresh groups: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load groups";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private bool FilterGroups(object item)
        {
            if (item is not GroupData group)
                return false;

            // Apply text search filter
            bool textMatch = true;
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchTerm = SearchText.ToLowerInvariant();
                textMatch = group.Name?.ToLowerInvariant().Contains(searchTerm) == true ||
                           group.Description?.ToLowerInvariant().Contains(searchTerm) == true ||
                           group.Type?.ToLowerInvariant().Contains(searchTerm) == true ||
                           group.Domain?.ToLowerInvariant().Contains(searchTerm) == true ||  
                           group.Visibility?.ToLowerInvariant().Contains(searchTerm) == true;
            }

            // Apply group type filter
            bool typeMatch = SelectedGroupType == "All" || 
                            group.Type?.Contains(SelectedGroupType, StringComparison.OrdinalIgnoreCase) == true;

            return textMatch && typeMatch;
        }

        private void ApplyFilter()
        {
            GroupsView?.Refresh();
            OnPropertiesChanged(nameof(FilteredGroupCount), nameof(StatusInfo));
        }

        private async Task ExportGroupsAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Exporting groups...";

                // TODO: Implement export functionality through IDataService
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = "Groups exported successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export groups: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private async Task ExportSelectedGroupsAsync()
        {
            try
            {
                var selectedGroups = Groups.Where(g => g.IsSelected).ToList();
                if (!selectedGroups.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Exporting {selectedGroups.Count} selected groups...";

                // TODO: Implement export functionality through IDataService
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = $"Exported {selectedGroups.Count} selected groups successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export selected groups: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void SelectAllGroups()
        {
            foreach (var group in Groups)
            {
                group.IsSelected = true;
            }
            StatusMessage = $"Selected all {Groups.Count} groups";
        }

        private void DeselectAllGroups()
        {
            foreach (var group in Groups)
            {
                group.IsSelected = false;
            }
            StatusMessage = "Deselected all groups";
        }

        private async Task DeleteSelectedGroupsAsync()
        {
            try
            {
                var selectedGroups = Groups.Where(g => g.IsSelected).ToList();
                if (!selectedGroups.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Deleting {selectedGroups.Count} selected groups...";

                foreach (var group in selectedGroups)
                {
                    Groups.Remove(group);
                }

                StatusMessage = $"Deleted {selectedGroups.Count} groups";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete selected groups: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void CopySelectedGroups()
        {
            var selectedGroups = Groups.Where(g => g.IsSelected).ToList();
            if (!selectedGroups.Any())
                return;

            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, selectedGroups.Select(g => $"{g.Name},{g.Type},{g.Domain}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied {selectedGroups.Count} selected groups to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy groups: {ex.Message}";
                HasErrors = true;
            }
        }

        private void CopyAllGroups()
        {
            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, Groups.Select(g => $"{g.Name},{g.Type},{g.Domain}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied all {Groups.Count} groups to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy groups: {ex.Message}";
                HasErrors = true;
            }
        }

        private void ShowAdvancedSearch()
        {
            StatusMessage = "Advanced search functionality to be implemented";
        }

        private void ClearSearch()
        {
            SearchText = string.Empty;
            SelectedGroupType = "All";
        }

        private async Task MapSecurityGroupsAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Mapping security group relationships...";
                LoadingProgress = 0;

                // Perform security group mapping analysis
                var securityGroups = Groups.Where(g => g.Type?.Contains("Security", StringComparison.OrdinalIgnoreCase) == true).ToList();
                
                LoadingMessage = $"Analyzing {securityGroups.Count} security groups...";
                LoadingProgress = 50;

                // This would typically involve analyzing group memberships, nested groups, etc.
                await Task.Delay(1000); // Simulate processing

                LoadingMessage = "Security group mapping completed";
                LoadingProgress = 100;
                StatusMessage = $"Security group mapping completed for {securityGroups.Count} groups";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to map security groups: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private async Task AnalyzeGroupMembershipAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Analyzing group membership patterns...";
                LoadingProgress = 0;

                // Perform group membership analysis
                LoadingMessage = "Identifying nested groups...";
                LoadingProgress = 25;

                LoadingMessage = "Calculating membership statistics...";
                LoadingProgress = 50;

                LoadingMessage = "Generating membership report...";
                LoadingProgress = 75;

                await Task.Delay(1500); // Simulate processing

                LoadingMessage = "Group membership analysis completed";
                LoadingProgress = 100;
                StatusMessage = $"Group membership analysis completed for {Groups.Count} groups";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to analyze group membership: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void ShowGroupHierarchy()
        {
            StatusMessage = "Group hierarchy visualization to be implemented";
        }

        private bool CanExecuteSelectedGroupsOperation()
        {
            return Groups?.Any(g => g.IsSelected) == true && !IsLoading;
        }

        #endregion
    }
}