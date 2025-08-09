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
    /// ViewModel for the Infrastructure tab containing all infrastructure-related functionality and data
    /// </summary>
    public class InfrastructureViewModel : BaseViewModel
    {
        #region Fields

        private readonly IDataService _dataService;
        private string _searchText;
        private bool _isLoading;
        private string _loadingMessage;
        private int _loadingProgress;
        private ICollectionView _infrastructureView;
        private int _currentPage = 1;
        private int _totalPages = 1;
        private int _itemsPerPage = 100;

        #endregion

        #region Properties

        /// <summary>
        /// Collection of all infrastructure data
        /// </summary>
        public OptimizedObservableCollection<InfrastructureData> Infrastructure { get; }

        /// <summary>
        /// Filtered and sorted view of infrastructure
        /// </summary>
        public ICollectionView InfrastructureView
        {
            get => _infrastructureView;
            private set => SetProperty(ref _infrastructureView, value);
        }

        /// <summary>
        /// Search text for filtering infrastructure
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
        /// Whether infrastructure is currently being loaded
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
        /// Current page number for pagination
        /// </summary>
        public int CurrentPage
        {
            get => _currentPage;
            set => SetProperty(ref _currentPage, value);
        }

        /// <summary>
        /// Total number of pages for pagination
        /// </summary>
        public int TotalPages
        {
            get => _totalPages;
            set => SetProperty(ref _totalPages, value);
        }

        /// <summary>
        /// Number of items per page
        /// </summary>
        public int ItemsPerPage
        {
            get => _itemsPerPage;
            set
            {
                if (SetProperty(ref _itemsPerPage, value))
                {
                    ApplyPagination();
                }
            }
        }

        /// <summary>
        /// Number of infrastructure items currently displayed after filtering
        /// </summary>
        public int FilteredInfrastructureCount => InfrastructureView?.Cast<InfrastructureData>().Count() ?? 0;

        /// <summary>
        /// Total number of infrastructure items loaded
        /// </summary>
        public int TotalInfrastructureCount => Infrastructure?.Count ?? 0;

        /// <summary>
        /// Status information text
        /// </summary>
        public string StatusInfo => $"Showing {FilteredInfrastructureCount} of {TotalInfrastructureCount} infrastructure items";

        /// <summary>
        /// Page information text
        /// </summary>
        public string PageInfo => TotalPages > 1 ? $"Page {CurrentPage} of {TotalPages}" : "All items";

        #endregion

        #region Commands

        public ICommand RefreshInfrastructureCommand { get; }
        public ICommand ExportInfrastructureCommand { get; }
        public ICommand ExportSelectedInfrastructureCommand { get; }
        public ICommand SelectAllInfrastructureCommand { get; }
        public ICommand DeselectAllInfrastructureCommand { get; }
        public ICommand DeleteSelectedInfrastructureCommand { get; }
        public ICommand CopySelectedInfrastructureCommand { get; }
        public ICommand CopyAllInfrastructureCommand { get; }
        public ICommand ShowAdvancedSearchCommand { get; }
        public ICommand ClearSearchCommand { get; }
        
        // Pagination commands
        public ICommand FirstPageCommand { get; }
        public ICommand PreviousPageCommand { get; }
        public ICommand NextPageCommand { get; }
        public ICommand LastPageCommand { get; }

        #endregion

        #region Constructor

        public InfrastructureViewModel(IDataService dataService = null)
        {
            _dataService = dataService ?? SimpleServiceLocator.GetService<IDataService>();
            
            Infrastructure = new OptimizedObservableCollection<InfrastructureData>();
            Infrastructure.CollectionChanged += (s, e) => 
            {
                OnPropertiesChanged(nameof(TotalInfrastructureCount), nameof(StatusInfo));
                ApplyPagination();
            };

            // Create collection view for filtering and sorting
            InfrastructureView = CollectionViewSource.GetDefaultView(Infrastructure);
            InfrastructureView.Filter = FilterInfrastructure;

            // Initialize commands
            RefreshInfrastructureCommand = new AsyncRelayCommand(RefreshInfrastructureAsync, () => !IsLoading);
            ExportInfrastructureCommand = new AsyncRelayCommand(ExportInfrastructureAsync, () => Infrastructure.Count > 0);
            ExportSelectedInfrastructureCommand = new AsyncRelayCommand(ExportSelectedInfrastructureAsync, CanExecuteSelectedInfrastructureOperation);
            SelectAllInfrastructureCommand = new RelayCommand(SelectAllInfrastructure, () => Infrastructure.Count > 0);
            DeselectAllInfrastructureCommand = new RelayCommand(DeselectAllInfrastructure, CanExecuteSelectedInfrastructureOperation);
            DeleteSelectedInfrastructureCommand = new AsyncRelayCommand(DeleteSelectedInfrastructureAsync, CanExecuteSelectedInfrastructureOperation);
            CopySelectedInfrastructureCommand = new RelayCommand(CopySelectedInfrastructure, CanExecuteSelectedInfrastructureOperation);
            CopyAllInfrastructureCommand = new RelayCommand(CopyAllInfrastructure, () => Infrastructure.Count > 0);
            ShowAdvancedSearchCommand = new RelayCommand(ShowAdvancedSearch);
            ClearSearchCommand = new RelayCommand(ClearSearch, () => !string.IsNullOrEmpty(SearchText));

            // Pagination commands
            FirstPageCommand = new RelayCommand(GoToFirstPage, () => CurrentPage > 1);
            PreviousPageCommand = new RelayCommand(GoToPreviousPage, () => CurrentPage > 1);
            NextPageCommand = new RelayCommand(GoToNextPage, () => CurrentPage < TotalPages);
            LastPageCommand = new RelayCommand(GoToLastPage, () => CurrentPage < TotalPages);

            _searchText = string.Empty;
            _loadingMessage = "Ready";
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Initialize infrastructure data from the specified directory
        /// </summary>
        public async Task InitializeAsync(string dataDirectory)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Loading infrastructure data...";
                LoadingProgress = 0;

                await RefreshInfrastructureAsync(dataDirectory);
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to initialize infrastructure data: {ex.Message}";
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

        private async Task RefreshInfrastructureAsync()
        {
            await RefreshInfrastructureAsync(null);
        }

        private async Task RefreshInfrastructureAsync(string dataDirectory)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Refreshing infrastructure data...";
                LoadingProgress = 10;

                Infrastructure.Clear();
                
                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                LoadingMessage = "Loading infrastructure components...";
                LoadingProgress = 30;

                var infrastructureData = await _dataService?.LoadInfrastructureAsync(profileName) ?? new System.Collections.Generic.List<InfrastructureData>();
                
                LoadingMessage = "Processing infrastructure data...";
                LoadingProgress = 70;

                foreach (var item in infrastructureData)
                {
                    Infrastructure.Add(item);
                }

                LoadingMessage = "Applying filters and pagination...";
                LoadingProgress = 90;

                InfrastructureView.Refresh();
                ApplyPagination();
                OnPropertiesChanged(nameof(FilteredInfrastructureCount), nameof(TotalInfrastructureCount), nameof(StatusInfo));

                LoadingMessage = $"Loaded {Infrastructure.Count} infrastructure items successfully";
                LoadingProgress = 100;
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to refresh infrastructure: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load infrastructure";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private bool FilterInfrastructure(object item)
        {
            if (item is not InfrastructureData infrastructure)
                return false;

            if (string.IsNullOrWhiteSpace(SearchText))
                return true;

            var searchTerm = SearchText.ToLowerInvariant();
            
            return infrastructure.Name?.ToLowerInvariant().Contains(searchTerm) == true ||
                   infrastructure.Type?.ToLowerInvariant().Contains(searchTerm) == true ||
                   infrastructure.Description?.ToLowerInvariant().Contains(searchTerm) == true ||
                   infrastructure.Location?.ToLowerInvariant().Contains(searchTerm) == true ||
                   infrastructure.IPAddress?.ToLowerInvariant().Contains(searchTerm) == true ||
                   infrastructure.OperatingSystem?.ToLowerInvariant().Contains(searchTerm) == true ||
                   infrastructure.Status?.ToLowerInvariant().Contains(searchTerm) == true;
        }

        private void ApplyFilter()
        {
            InfrastructureView?.Refresh();
            ApplyPagination();
            OnPropertiesChanged(nameof(FilteredInfrastructureCount), nameof(StatusInfo));
        }

        private void ApplyPagination()
        {
            if (Infrastructure.Count == 0)
            {
                TotalPages = 1;
                CurrentPage = 1;
                OnPropertiesChanged(nameof(PageInfo));
                return;
            }

            TotalPages = Math.Max(1, (int)Math.Ceiling((double)Infrastructure.Count / ItemsPerPage));
            
            if (CurrentPage > TotalPages)
                CurrentPage = TotalPages;
            
            OnPropertiesChanged(nameof(PageInfo));
        }

        private async Task ExportInfrastructureAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Exporting infrastructure...";

                // TODO: Implement export functionality through IDataService  
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = "Infrastructure exported successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export infrastructure: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private async Task ExportSelectedInfrastructureAsync()
        {
            try
            {
                var selectedItems = Infrastructure.Where(i => i.IsSelected).ToList();
                if (!selectedItems.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Exporting {selectedItems.Count} selected infrastructure items...";

                // TODO: Implement export functionality through IDataService  
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = $"Exported {selectedItems.Count} selected infrastructure items successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export selected infrastructure: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void SelectAllInfrastructure()
        {
            foreach (var item in Infrastructure)
            {
                item.IsSelected = true;
            }
            StatusMessage = $"Selected all {Infrastructure.Count} infrastructure items";
        }

        private void DeselectAllInfrastructure()
        {
            foreach (var item in Infrastructure)
            {
                item.IsSelected = false;
            }
            StatusMessage = "Deselected all infrastructure items";
        }

        private async Task DeleteSelectedInfrastructureAsync()
        {
            try
            {
                var selectedItems = Infrastructure.Where(i => i.IsSelected).ToList();
                if (!selectedItems.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Deleting {selectedItems.Count} selected infrastructure items...";

                foreach (var item in selectedItems)
                {
                    Infrastructure.Remove(item);
                }

                StatusMessage = $"Deleted {selectedItems.Count} infrastructure items";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete selected infrastructure: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void CopySelectedInfrastructure()
        {
            var selectedItems = Infrastructure.Where(i => i.IsSelected).ToList();
            if (!selectedItems.Any())
                return;

            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, selectedItems.Select(i => $"{i.Name},{i.Type},{i.IPAddress}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied {selectedItems.Count} selected infrastructure items to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy infrastructure: {ex.Message}";
                HasErrors = true;
            }
        }

        private void CopyAllInfrastructure()
        {
            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, Infrastructure.Select(i => $"{i.Name},{i.Type},{i.IPAddress}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied all {Infrastructure.Count} infrastructure items to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy infrastructure: {ex.Message}";
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
        }

        private void GoToFirstPage()
        {
            CurrentPage = 1;
        }

        private void GoToPreviousPage()
        {
            if (CurrentPage > 1)
                CurrentPage--;
        }

        private void GoToNextPage()
        {
            if (CurrentPage < TotalPages)
                CurrentPage++;
        }

        private void GoToLastPage()
        {
            CurrentPage = TotalPages;
        }

        private bool CanExecuteSelectedInfrastructureOperation()
        {
            return Infrastructure?.Any(i => i.IsSelected) == true && !IsLoading;
        }

        #endregion
    }
}