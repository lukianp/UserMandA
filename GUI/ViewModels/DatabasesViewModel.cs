using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using DatabaseServerData = MandADiscoverySuite.Models.DatabaseServerData;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class DatabasesViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private ObservableCollection<DatabaseServerData> _databaseServers;
        private DatabaseServerData _selectedServer;
        private string _searchText;
        private string _selectedEngine;

        public DatabasesViewModel()
        {
            _csvDataService = SimpleServiceLocator.GetService<CsvDataService>() ?? new CsvDataService();
            _databaseServers = new ObservableCollection<DatabaseServerData>();
            
            // Initialize filter options
            EngineFilter = new List<string> { "All", "SQL Server", "MySQL", "PostgreSQL", "Oracle", "MongoDB" };
            _selectedEngine = "All";
            
            // Initialize commands
            SearchCommand = new RelayCommand(PerformSearch);
            ViewDatabasesCommand = new RelayCommand(ViewDatabases, () => SelectedServer != null);
            ViewConfigurationCommand = new RelayCommand(ViewConfiguration, () => SelectedServer != null);
            ViewSecurityCommand = new RelayCommand(ViewSecurity, () => SelectedServer != null);
        }

        public ObservableCollection<DatabaseServerData> DatabaseServers
        {
            get => _databaseServers;
            set => SetProperty(ref _databaseServers, value);
        }

        public DatabaseServerData SelectedServer
        {
            get => _selectedServer;
            set
            {
                SetProperty(ref _selectedServer, value);
                OnPropertyChanged(nameof(HasSelectedServer));
                OnPropertyChanged(nameof(HasNoSelectedServer));
            }
        }

        public string SearchText
        {
            get => _searchText;
            set => SetProperty(ref _searchText, value);
        }

        public string SelectedEngine
        {
            get => _selectedEngine;
            set => SetProperty(ref _selectedEngine, value);
        }

        public List<string> EngineFilter { get; }

        public override bool HasData => _databaseServers?.Count > 0;
        public bool HasNoData => !IsLoading && _databaseServers?.Count == 0;
        public bool HasSelectedServer => _selectedServer != null;
        public bool HasNoSelectedServer => _selectedServer == null;

        public int ServersCount => _databaseServers?.Count ?? 0;
        public int DatabasesCount => _databaseServers?.Count * 5 ?? 0; // Estimate - will be calculated from actual data
        public decimal TotalSizeGB => _databaseServers?.Count * 100m ?? 0; // Estimate - will be calculated from actual data  
        public int CriticalDatabasesCount => _databaseServers?.Count(s => s.Edition?.Contains("Enterprise") == true) ?? 0;

        public ICommand SearchCommand { get; }
        public ICommand ViewDatabasesCommand { get; }
        public ICommand ViewConfigurationCommand { get; }
        public ICommand ViewSecurityCommand { get; }

        public async Task LoadAsync()
        {
            try
            {
                IsLoading = true;
                LastError = null;
                
                await EnhancedLoggingService.Instance.LogInformationAsync("DatabasesViewModel: Starting LoadAsync");

                // Load database servers from CSV
                var databaseServers = await _csvDataService.LoadDatabasesAsync("ljpops");
                
                DatabaseServers.Clear();
                foreach (var server in databaseServers)
                {
                    DatabaseServers.Add(server);
                }

                await EnhancedLoggingService.Instance.LogInformationAsync($"DatabasesViewModel: Loaded {DatabaseServers.Count} database servers");

                // Update counts
                OnPropertyChanged(nameof(HasData));
                OnPropertyChanged(nameof(HasNoData));
                OnPropertyChanged(nameof(ServersCount));
                OnPropertyChanged(nameof(DatabasesCount));
                OnPropertyChanged(nameof(TotalSizeGB));
                OnPropertyChanged(nameof(CriticalDatabasesCount));
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
                await EnhancedLoggingService.Instance.LogErrorAsync($"DatabasesViewModel.LoadAsync failed: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void PerformSearch()
        {
            // Implement search logic
            OnPropertyChanged(nameof(DatabaseServers));
        }

        private void ViewDatabases()
        {
            if (SelectedServer != null)
            {
                // Open databases list for selected server
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"DatabasesViewModel: Viewing databases for {SelectedServer.InstanceName}");
            }
        }

        private void ViewConfiguration()
        {
            if (SelectedServer != null)
            {
                // Open configuration view for selected server
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"DatabasesViewModel: Viewing configuration for {SelectedServer.InstanceName}");
            }
        }

        private void ViewSecurity()
        {
            if (SelectedServer != null)
            {
                // Open security analysis for selected server
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"DatabasesViewModel: Viewing security for {SelectedServer.InstanceName}");
            }
        }
    }
}