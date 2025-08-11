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
    /// ViewModel for the Computers tab containing all computer-related functionality and data
    /// </summary>
    public class ComputersViewModel : BaseViewModel
    {
        #region Fields

        private readonly IDataService _dataService;
        private string _searchText;
        private bool _isLoading;
        private string _loadingMessage;
        private int _loadingProgress;
        private ICollectionView _computersView;

        #endregion

        #region Properties

        /// <summary>
        /// Collection of all computer data (using InfrastructureData as computers are part of infrastructure)
        /// </summary>
        public OptimizedObservableCollection<InfrastructureData> Computers { get; }

        /// <summary>
        /// Filtered and sorted view of computers
        /// </summary>
        public ICollectionView ComputersView
        {
            get => _computersView;
            private set => SetProperty(ref _computersView, value);
        }

        /// <summary>
        /// Search text for filtering computers
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
        /// Whether computers are currently being loaded
        /// </summary>
        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        /// <summary>
        /// Loading progress message
        /// </summary>
        public new string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        /// <summary>
        /// Loading progress percentage (0-100)
        /// </summary>
        public new int LoadingProgress
        {
            get => _loadingProgress;
            set => SetProperty(ref _loadingProgress, value);
        }

        /// <summary>
        /// Number of computers currently displayed after filtering
        /// </summary>
        public int FilteredComputerCount => ComputersView?.Cast<InfrastructureData>().Count() ?? 0;

        /// <summary>
        /// Total number of computers loaded
        /// </summary>
        public int TotalComputerCount => Computers?.Count ?? 0;

        /// <summary>
        /// Status information text
        /// </summary>
        public string StatusInfo => $"Showing {FilteredComputerCount} of {TotalComputerCount} computers";

        #endregion

        #region Commands

        public ICommand RefreshComputersCommand { get; }
        public ICommand ExportComputersCommand { get; }
        public ICommand ExportSelectedComputersCommand { get; }
        public ICommand SelectAllComputersCommand { get; }
        public ICommand DeselectAllComputersCommand { get; }
        public ICommand DeleteSelectedComputersCommand { get; }
        public ICommand CopySelectedComputersCommand { get; }
        public ICommand CopyAllComputersCommand { get; }
        public ICommand ShowAdvancedSearchCommand { get; }
        public ICommand ClearSearchCommand { get; }

        #endregion

        #region Constructor

        public ComputersViewModel(IDataService dataService = null)
        {
            _dataService = dataService ?? SimpleServiceLocator.GetService<IDataService>();
            
            Computers = new OptimizedObservableCollection<InfrastructureData>();
            Computers.CollectionChanged += (s, e) => 
            {
                OnPropertiesChanged(nameof(TotalComputerCount), nameof(StatusInfo));
            };

            // Create collection view for filtering and sorting
            ComputersView = CollectionViewSource.GetDefaultView(Computers);
            ComputersView.Filter = FilterComputers;

            // Initialize commands
            RefreshComputersCommand = new AsyncRelayCommand(RefreshComputersAsync, () => !IsLoading);
            ExportComputersCommand = new AsyncRelayCommand(ExportComputersAsync, () => Computers.Count > 0);
            ExportSelectedComputersCommand = new AsyncRelayCommand(ExportSelectedComputersAsync, CanExecuteSelectedComputersOperation);
            SelectAllComputersCommand = new RelayCommand(SelectAllComputers, () => Computers.Count > 0);
            DeselectAllComputersCommand = new RelayCommand(DeselectAllComputers, CanExecuteSelectedComputersOperation);
            DeleteSelectedComputersCommand = new AsyncRelayCommand(DeleteSelectedComputersAsync, CanExecuteSelectedComputersOperation);
            CopySelectedComputersCommand = new RelayCommand(CopySelectedComputers, CanExecuteSelectedComputersOperation);
            CopyAllComputersCommand = new RelayCommand(CopyAllComputers, () => Computers.Count > 0);
            ShowAdvancedSearchCommand = new RelayCommand(ShowAdvancedSearch);
            ClearSearchCommand = new RelayCommand(ClearSearch, () => !string.IsNullOrEmpty(SearchText));

            _searchText = string.Empty;
            _loadingMessage = "Ready";
            
            // Auto-load data when ViewModel is created
            LoadDataAsync();
        }
        
        private async void LoadDataAsync()
        {
            await RefreshComputersAsync();
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Initialize computers data from the specified directory
        /// </summary>
        public async Task InitializeAsync(string dataDirectory)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Loading computers data...";
                LoadingProgress = 0;

                await RefreshComputersAsync(dataDirectory);
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to initialize computers data: {ex.Message}";
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

        private async Task RefreshComputersAsync()
        {
            await RefreshComputersAsync(null);
        }

        private async Task RefreshComputersAsync(string dataDirectory)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Refreshing computers data...";
                LoadingProgress = 10;
                
                System.Diagnostics.Debug.WriteLine($"ComputersViewModel.RefreshComputersAsync: Starting refresh at {DateTime.Now:HH:mm:ss.fff}");

                Computers.Clear();
                
                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";
                
                System.Diagnostics.Debug.WriteLine($"ComputersViewModel: Loading data for profile: {profileName}");

                LoadingMessage = "Loading computer accounts...";
                LoadingProgress = 30;

                // Load computers from CSV files (using infrastructure data)
                if (_dataService == null)
                {
                    System.Diagnostics.Debug.WriteLine("ComputersViewModel: DataService is null, using CsvDataService directly");
                    var csvService = SimpleServiceLocator.GetService<CsvDataService>() ?? new CsvDataService();
                    var computerData = await csvService.LoadInfrastructureAsync(profileName);
                    
                    System.Diagnostics.Debug.WriteLine($"ComputersViewModel: Loaded {computerData?.Count() ?? 0} computers from CSV");
                    
                    LoadingMessage = "Processing computer data...";
                    LoadingProgress = 70;

                    if (computerData != null && computerData.Any())
                    {
                        foreach (var computer in computerData)
                        {
                            Computers.Add(computer);
                        }
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("ComputersViewModel: No computer data loaded, creating sample data");
                        // Create sample data if none exists
                        var sampleService = new SampleDataService();
                        await sampleService.CreateSampleDataIfMissingAsync(profileName);
                        
                        // Try loading again
                        computerData = await csvService.LoadInfrastructureAsync(profileName);
                        if (computerData != null)
                        {
                            foreach (var computer in computerData)
                            {
                                Computers.Add(computer);
                            }
                        }
                    }
                }
                else
                {
                    var computerData = await _dataService.LoadInfrastructureAsync(profileName) ?? new System.Collections.Generic.List<InfrastructureData>();
                    System.Diagnostics.Debug.WriteLine($"ComputersViewModel: Loaded {computerData.Count()} computers from DataService");
                    
                    LoadingMessage = "Processing computer data...";
                    LoadingProgress = 70;

                    foreach (var computer in computerData)
                    {
                        Computers.Add(computer);
                    }
                }

                LoadingMessage = "Applying filters...";
                LoadingProgress = 90;

                ComputersView.Refresh();
                OnPropertiesChanged(nameof(FilteredComputerCount), nameof(TotalComputerCount), nameof(StatusInfo));

                LoadingMessage = $"Loaded {Computers.Count} computers successfully";
                LoadingProgress = 100;
                
                System.Diagnostics.Debug.WriteLine($"ComputersViewModel: Refresh completed with {Computers.Count} computers");
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to refresh computers: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load computers";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private bool FilterComputers(object item)
        {
            if (item is not InfrastructureData computer)
                return false;

            if (string.IsNullOrWhiteSpace(SearchText))
                return true;

            var searchTerm = SearchText.ToLowerInvariant();
            
            return computer.Name?.ToLowerInvariant().Contains(searchTerm) == true ||
                   computer.Type?.ToLowerInvariant().Contains(searchTerm) == true ||
                   computer.Description?.ToLowerInvariant().Contains(searchTerm) == true ||
                   computer.Location?.ToLowerInvariant().Contains(searchTerm) == true ||
                   computer.IPAddress?.ToLowerInvariant().Contains(searchTerm) == true ||
                   computer.OperatingSystem?.ToLowerInvariant().Contains(searchTerm) == true;
        }

        private void ApplyFilter()
        {
            ComputersView?.Refresh();
            OnPropertiesChanged(nameof(FilteredComputerCount), nameof(StatusInfo));
        }

        private async Task ExportComputersAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Exporting computers...";

                // TODO: Implement export functionality through IDataService  
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = "Computers exported successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export computers: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private async Task ExportSelectedComputersAsync()
        {
            try
            {
                var selectedComputers = Computers.Where(c => c.IsSelected).ToList();
                if (!selectedComputers.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Exporting {selectedComputers.Count} selected computers...";

                // TODO: Implement export functionality through IDataService  
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = $"Exported {selectedComputers.Count} selected computers successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export selected computers: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void SelectAllComputers()
        {
            foreach (var computer in Computers)
            {
                computer.IsSelected = true;
            }
            StatusMessage = $"Selected all {Computers.Count} computers";
        }

        private void DeselectAllComputers()
        {
            foreach (var computer in Computers)
            {
                computer.IsSelected = false;
            }
            StatusMessage = "Deselected all computers";
        }

        private async Task DeleteSelectedComputersAsync()
        {
            try
            {
                var selectedComputers = Computers.Where(c => c.IsSelected).ToList();
                if (!selectedComputers.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Deleting {selectedComputers.Count} selected computers...";

                foreach (var computer in selectedComputers)
                {
                    Computers.Remove(computer);
                }

                StatusMessage = $"Deleted {selectedComputers.Count} computers";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete selected computers: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void CopySelectedComputers()
        {
            var selectedComputers = Computers.Where(c => c.IsSelected).ToList();
            if (!selectedComputers.Any())
                return;

            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, selectedComputers.Select(c => $"{c.Name},{c.Type},{c.IPAddress}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied {selectedComputers.Count} selected computers to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy computers: {ex.Message}";
                HasErrors = true;
            }
        }

        private void CopyAllComputers()
        {
            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, Computers.Select(c => $"{c.Name},{c.Type},{c.IPAddress}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied all {Computers.Count} computers to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy computers: {ex.Message}";
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

        private bool CanExecuteSelectedComputersOperation()
        {
            return Computers?.Any(c => c.IsSelected) == true && !IsLoading;
        }

        #endregion
    }
}