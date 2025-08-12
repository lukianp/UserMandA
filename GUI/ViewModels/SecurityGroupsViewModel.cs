using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Security Groups view with comprehensive filtering and detail navigation
    /// </summary>
    public partial class SecurityGroupsViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private readonly MainViewModel _mainViewModel;
        private readonly ICollectionView _securityGroupsView;

        private OptimizedObservableCollection<GroupData> _securityGroups = new();
        private GroupData? _selectedGroup;
        private string _searchText = string.Empty;
        private string _selectedGroupTypeFilter = "All";
        private bool _isLoading;
        private string _loadingMessage = "Ready";
        private bool _hasErrors;
        private string? _errorMessage;

        public OptimizedObservableCollection<GroupData> SecurityGroups
        {
            get => _securityGroups;
            set => SetProperty(ref _securityGroups, value);
        }

        public ICollectionView SecurityGroupsView => _securityGroupsView;

        public GroupData? SelectedGroup
        {
            get => _selectedGroup;
            set => SetProperty(ref _selectedGroup, value);
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

        public string SelectedGroupTypeFilter
        {
            get => _selectedGroupTypeFilter;
            set
            {
                if (SetProperty(ref _selectedGroupTypeFilter, value))
                {
                    ApplyFilters();
                }
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        public bool HasErrors
        {
            get => _hasErrors;
            set => SetProperty(ref _hasErrors, value);
        }

        public string? ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        public ObservableCollection<string> GroupTypeFilters { get; } = new();

        public ICommand OpenSecurityGroupDetailCommand { get; }
        public ICommand RefreshGroupsCommand { get; }
        public ICommand ClearFiltersCommand { get; }
        public ICommand ExportGroupsCommand { get; }

        public SecurityGroupsViewModel(CsvDataService csvDataService, MainViewModel mainViewModel)
        {
            _csvDataService = csvDataService ?? throw new ArgumentNullException(nameof(csvDataService));
            _mainViewModel = mainViewModel ?? throw new ArgumentNullException(nameof(mainViewModel));

            _securityGroupsView = CollectionViewSource.GetDefaultView(SecurityGroups);
            _securityGroupsView.Filter = FilterGroups;

            OpenSecurityGroupDetailCommand = new AsyncRelayCommand(OpenSecurityGroupDetailAsync);
            RefreshGroupsCommand = new AsyncRelayCommand(LoadGroupsAsync);
            ClearFiltersCommand = new RelayCommand(ClearFilters);
            ExportGroupsCommand = new AsyncRelayCommand(ExportGroupsAsync);

            GroupTypeFilters.Add("All");
            GroupTypeFilters.Add("Security");
            GroupTypeFilters.Add("Distribution");
            GroupTypeFilters.Add("Mail-Enabled Security");
            GroupTypeFilters.Add("Unified");

            _ = InitializeAsync();
        }

        private async Task InitializeAsync()
        {
            await LoadGroupsAsync();
        }

        private async Task LoadGroupsAsync()
        {
            try
            {
                IsLoading = true;
                HasErrors = false;
                ErrorMessage = null;
                LoadingMessage = "Loading security groups...";

                SecurityGroups.Clear();
                
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                LoadingMessage = "Scanning group CSV files...";
                var loadedGroups = await _csvDataService.LoadGroupsAsync(profileName);

                LoadingMessage = "Processing group data...";
                var groupsList = loadedGroups.ToList();

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    foreach (var group in groupsList)
                    {
                        SecurityGroups.Add(group);
                    }

                    UpdateGroupTypeFilters();
                    _securityGroupsView.Refresh();
                    OnPropertiesChanged(nameof(FilteredGroupsCount), nameof(TotalGroupsCount), nameof(HasGroups));

                    LoadingMessage = $"Loaded {SecurityGroups.Count} security groups successfully";
                });
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to load security groups: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load security groups";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void UpdateGroupTypeFilters()
        {
            var currentTypes = SecurityGroups.Select(g => g.Type).Where(t => !string.IsNullOrEmpty(t)).Distinct().OrderBy(t => t);
            
            // Keep "All" and add unique types
            GroupTypeFilters.Clear();
            GroupTypeFilters.Add("All");
            foreach (var type in currentTypes)
            {
                if (!GroupTypeFilters.Contains(type))
                {
                    GroupTypeFilters.Add(type);
                }
            }
        }

        private bool FilterGroups(object obj)
        {
            if (obj is not GroupData group)
                return false;

            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchLower = SearchText.ToLower();
                var matchesSearch = (group.DisplayName?.ToLower().Contains(searchLower) ?? false) ||
                                   (group.Description?.ToLower().Contains(searchLower) ?? false) ||
                                   (group.Mail?.ToLower().Contains(searchLower) ?? false) ||
                                   (group.GroupType?.ToLower().Contains(searchLower) ?? false);
                
                if (!matchesSearch)
                    return false;
            }

            if (SelectedGroupTypeFilter != "All" && group.Type != SelectedGroupTypeFilter)
                return false;

            return true;
        }

        private void ApplyFilters()
        {
            _securityGroupsView?.Refresh();
            OnPropertyChanged(nameof(FilteredGroupsCount));
        }

        private void ClearFilters()
        {
            SearchText = string.Empty;
            SelectedGroupTypeFilter = "All";
        }

        private async Task OpenSecurityGroupDetailAsync()
        {
            if (SelectedGroup == null)
                return;

            try
            {
                var detailViewModel = new SecurityGroupDetailViewModel(SelectedGroup, _csvDataService, _mainViewModel);
                await detailViewModel.LoadAsync();
                // TODO: Add the detail view to tabs or navigate to it
                // _mainViewModel.OpenTabs.Add(detailViewModel);
            }
            catch (Exception ex)
            {
                DialogService.Instance.ShowErrorDialog("Error", $"Failed to open group details: {ex.Message}");
            }
        }

        private async Task ExportGroupsAsync()
        {
            try
            {
                var exportPath = $@"C:\DiscoveryData\{_mainViewModel.SelectedProfile?.CompanyName ?? "ljpops"}\Exports\SecurityGroups_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                await _csvDataService.ExportToCsvAsync(SecurityGroups.ToList(), exportPath);
                DialogService.Instance.ShowInformationDialog("Export Successful", $"Security groups exported to {exportPath}");
            }
            catch (Exception ex)
            {
                DialogService.Instance.ShowErrorDialog("Export Failed", $"Failed to export groups: {ex.Message}");
            }
        }

        public int TotalGroupsCount => SecurityGroups.Count;
        public int FilteredGroupsCount => _securityGroupsView?.Cast<GroupData>()?.Count() ?? 0;
        public bool HasGroups => SecurityGroups.Count > 0;

        public int SecurityGroupsCount => SecurityGroups.Count(g => g.SecurityEnabled);
        public int DistributionGroupsCount => SecurityGroups.Count(g => g.MailEnabled && !g.SecurityEnabled);
        public int MailEnabledSecurityGroupsCount => SecurityGroups.Count(g => g.MailEnabled && g.SecurityEnabled);
        public int UnifiedGroupsCount => SecurityGroups.Count(g => g.Type?.Contains("Unified") ?? false);

        public string StatusInfo => HasGroups 
            ? $"Showing {FilteredGroupsCount} of {TotalGroupsCount} groups" 
            : IsLoading ? LoadingMessage : "No groups found";
    }
}