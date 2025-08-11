using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Windows;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Computers tab containing all computer-related functionality and data
    /// </summary>
    public class ComputersViewModel : BaseViewModel
    {
        #region Fields

        private readonly IDataService _dataService;
        private readonly CsvDataService _csvDataService;
        private readonly MainViewModel _mainViewModel;
        private string _searchText;
        private string _selectedTypeFilter;
        private ICollectionView _computersView;
        private InfrastructureData _selectedComputer;

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
        /// Selected type filter for computers
        /// </summary>
        public string SelectedTypeFilter
        {
            get => _selectedTypeFilter;
            set
            {
                if (SetProperty(ref _selectedTypeFilter, value))
                {
                    ApplyFilter();
                }
            }
        }

        /// <summary>
        /// Available computer types for filtering
        /// </summary>
        public ObservableCollection<string> ComputerTypes { get; }

        /// <summary>
        /// Whether there are computers to display
        /// </summary>
        public bool HasComputers => TotalComputerCount > 0;

        /// <summary>
        /// Currently selected computer for detail view
        /// </summary>
        public InfrastructureData SelectedComputer
        {
            get => _selectedComputer;
            set => SetProperty(ref _selectedComputer, value);
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
        public ICommand ClearSearchCommand { get; }
        public ICommand ClearFiltersCommand { get; }
        public ICommand OpenComputerDetailCommand { get; }

        #endregion

        #region Constructor

        public ComputersViewModel(IDataService dataService = null, CsvDataService csvDataService = null, MainViewModel mainViewModel = null)
        {
            _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersViewModel constructor: Starting initialization");
            _dataService = dataService ?? SimpleServiceLocator.GetService<IDataService>();
            _csvDataService = csvDataService ?? SimpleServiceLocator.GetService<CsvDataService>();
            _mainViewModel = mainViewModel;
            _ = EnhancedLoggingService.Instance.LogInformationAsync($"ComputersViewModel constructor: Services initialized - _csvDataService is {(_csvDataService != null ? "not null" : "null")}");
            
            Computers = new OptimizedObservableCollection<InfrastructureData>();
            Computers.CollectionChanged += (s, e) => 
            {
                OnPropertiesChanged(nameof(TotalComputerCount), nameof(StatusInfo), nameof(HasComputers));
                UpdateComputerTypes();
            };

            ComputerTypes = new ObservableCollection<string>();

            // Create collection view for filtering and sorting
            ComputersView = CollectionViewSource.GetDefaultView(Computers);
            ComputersView.Filter = FilterComputers;

            // Initialize commands
            RefreshComputersCommand = new AsyncRelayCommand(RefreshComputersAsync, () => !IsLoading);
            ExportComputersCommand = new AsyncRelayCommand(ExportComputersAsync, () => Computers.Count > 0);
            ClearSearchCommand = new RelayCommand(ClearSearch, () => !string.IsNullOrEmpty(SearchText));
            ClearFiltersCommand = new RelayCommand(ClearFilters, () => !string.IsNullOrEmpty(SelectedTypeFilter));
            OpenComputerDetailCommand = new RelayCommand<InfrastructureData>(OpenComputerDetail, computer => computer != null);

            _searchText = string.Empty;
            _selectedTypeFilter = string.Empty;
            LoadingMessage = "Ready";
            
            // Auto-load data when ViewModel is created
            _ = LoadDataAsync();
        }
        
        private async Task LoadDataAsync()
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

        private async Task RefreshComputersAsync(string dataDirectory = null)
        {
            try
            {
                _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersViewModel.RefreshComputersAsync: Starting data refresh");
                IsLoading = true;
                LoadingMessage = "Refreshing computer data...";
                LoadingProgress = 10;

                Computers.Clear();
                
                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"ComputersViewModel.RefreshComputersAsync: Using profile name: {profileName}");

                LoadingMessage = "Loading infrastructure data...";
                LoadingProgress = 30;

                // Use CsvDataService to load infrastructure data
                IEnumerable<InfrastructureData> infrastructureData;
                if (_csvDataService != null)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersViewModel.RefreshComputersAsync: Using CsvDataService to load infrastructure data");
                    infrastructureData = await _csvDataService.LoadInfrastructureAsync(profileName) ?? new List<InfrastructureData>();
                    _ = EnhancedLoggingService.Instance.LogInformationAsync($"ComputersViewModel.RefreshComputersAsync: Loaded {infrastructureData.Count()} infrastructure items from CsvDataService");
                }
                else
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync("ComputersViewModel.RefreshComputersAsync: CsvDataService is null, using fallback IDataService");
                    infrastructureData = await _dataService?.LoadInfrastructureAsync(profileName) ?? new List<InfrastructureData>();
                    _ = EnhancedLoggingService.Instance.LogInformationAsync($"ComputersViewModel.RefreshComputersAsync: Loaded {infrastructureData.Count()} infrastructure items from IDataService");
                }

                LoadingMessage = "Processing computer data...";
                LoadingProgress = 70;

                var computerList = infrastructureData.ToList();

                // Ensure UI updates happen on UI thread
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    foreach (var computer in computerList)
                    {
                        Computers.Add(computer);
                    }

                    LoadingMessage = "Applying filters...";
                    LoadingProgress = 90;

                    ComputersView.Refresh();
                    OnPropertiesChanged(nameof(FilteredComputerCount), nameof(TotalComputerCount), nameof(StatusInfo), nameof(HasComputers));

                    LoadingMessage = $"Loaded {Computers.Count} computers successfully";
                    LoadingProgress = 100;
                });
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync("ComputersViewModel.RefreshComputersAsync: Error during data refresh", ex);
                ErrorMessage = $"Failed to refresh computers: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load computers";
            }
            finally
            {
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    IsLoading = false;
                });
            }
        }

        private bool FilterComputers(object item)
        {
            if (item is not InfrastructureData computer)
                return false;

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchTerm = SearchText.ToLowerInvariant();
                var nameMatch = computer.Name?.ToLowerInvariant().Contains(searchTerm) == true;
                var ipMatch = computer.IPAddress?.ToLowerInvariant().Contains(searchTerm) == true;
                var typeMatch = computer.Type?.ToLowerInvariant().Contains(searchTerm) == true;
                var osMatch = computer.OperatingSystem?.ToLowerInvariant().Contains(searchTerm) == true;
                var locationMatch = computer.Location?.ToLowerInvariant().Contains(searchTerm) == true;

                if (!nameMatch && !ipMatch && !typeMatch && !osMatch && !locationMatch)
                    return false;
            }

            // Apply type filter
            if (!string.IsNullOrWhiteSpace(SelectedTypeFilter) && SelectedTypeFilter != "All")
            {
                if (computer.Type != SelectedTypeFilter)
                    return false;
            }

            return true;
        }

        private void ApplyFilter()
        {
            ComputersView?.Refresh();
            OnPropertiesChanged(nameof(FilteredComputerCount), nameof(StatusInfo), nameof(HasComputers));
        }

        private void UpdateComputerTypes()
        {
            var types = Computers.Select(c => c.Type)
                                .Where(t => !string.IsNullOrEmpty(t))
                                .Distinct()
                                .OrderBy(t => t)
                                .ToList();

            System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
            {
                ComputerTypes.Clear();
                ComputerTypes.Add("All");
                foreach (var type in types)
                {
                    ComputerTypes.Add(type);
                }
            });
        }

        private async Task ExportComputersAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Exporting computers...";

                // Get filtered computers
                var computersToExport = ComputersView?.Cast<InfrastructureData>().ToList() ?? new List<InfrastructureData>();
                
                if (!computersToExport.Any())
                {
                    StatusMessage = "No computers to export";
                    return;
                }

                var saveDialog = new Microsoft.Win32.SaveFileDialog
                {
                    Title = "Export Computers",
                    Filter = "CSV files (*.csv)|*.csv|All files (*.*)|*.*",
                    DefaultExt = "csv",
                    FileName = $"Computers_Export_{DateTime.Now:yyyyMMdd_HHmmss}.csv"
                };

                if (saveDialog.ShowDialog() == true)
                {
                    // Use fallback export method since ExportInfrastructureAsync may not exist
                    await ExportComputersFallbackAsync(computersToExport, saveDialog.FileName);
                    
                    StatusMessage = $"Exported {computersToExport.Count} computers to {System.IO.Path.GetFileName(saveDialog.FileName)}";
                }
                else
                {
                    StatusMessage = "Export cancelled";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export computers: {ex.Message}";
                HasErrors = true;
                StatusMessage = "Export failed";
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        /// <summary>
        /// Fallback export method when CsvDataService is not available
        /// </summary>
        private async Task ExportComputersFallbackAsync(List<InfrastructureData> computers, string filePath)
        {
            var csvLines = new List<string>();
            
            // Header
            csvLines.Add("Name,Type,OperatingSystem,Version,IPAddress,Status,Location,Manufacturer,Model,LastSeen");
            
            // Data rows
            foreach (var computer in computers)
            {
                var line = $"\"{computer.Name?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.Type?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.OperatingSystem?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.Version?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.IPAddress?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.Status?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.Location?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.Manufacturer?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.Model?.Replace("\"", "\"\"")}\"," +
                          $"\"{computer.LastSeen?.Replace("\"", "\"\"")}\"";
                
                csvLines.Add(line);
            }
            
            await System.IO.File.WriteAllLinesAsync(filePath, csvLines);
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

        private void ClearFilters()
        {
            SelectedTypeFilter = string.Empty;
        }

        /// <summary>
        /// Opens the computer detail pane for the specified computer
        /// </summary>
        /// <param name="computer">Computer to show details for</param>
        private void OpenComputerDetail(InfrastructureData computer)
        {
            if (computer == null) return;

            try
            {
                SelectedComputer = computer;
                
                // Create and show computer detail view
                if (_csvDataService != null)
                {
                    var detailViewModel = new ComputerDetailViewModel(computer, _csvDataService);
                    
                    // For now, create a modal window (similar to UserDetailWindow)
                    var detailWindow = new ComputerDetailWindow();
                    detailWindow.DataContext = detailViewModel;
                    detailWindow.Owner = System.Windows.Application.Current.MainWindow;
                    detailWindow.ShowDialog();
                }
                
                StatusMessage = $"Opened details for {computer.Name}";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to open computer details: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Error opening computer detail for {computer?.Name}: {ex}");
            }
        }

        private bool CanExecuteSelectedComputersOperation()
        {
            return Computers?.Any(c => c.IsSelected) == true && !IsLoading;
        }

        #endregion
    }
}