using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Dashboard ViewModel using new unified architecture
    /// Provides overview and statistics for the discovery suite
    /// </summary>
    public class DashboardViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ILogger<DashboardViewModelNew> _logger;
        private readonly ProfileService _profileService;

        // Dashboard Statistics
        private int _totalUsers;
        private int _totalComputers;
        private int _totalApplications;
        private int _totalGroups;
        private int _totalFileServers;
        private int _totalDatabases;
        private bool _isLoading;

        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        public int TotalComputers
        {
            get => _totalComputers;
            set => SetProperty(ref _totalComputers, value);
        }

        public int TotalApplications
        {
            get => _totalApplications;
            set => SetProperty(ref _totalApplications, value);
        }

        public int TotalGroups
        {
            get => _totalGroups;
            set => SetProperty(ref _totalGroups, value);
        }

        public int TotalFileServers
        {
            get => _totalFileServers;
            set => SetProperty(ref _totalFileServers, value);
        }

        public int TotalDatabases
        {
            get => _totalDatabases;
            set => SetProperty(ref _totalDatabases, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public DashboardViewModelNew(CsvDataServiceNew csvService, ILogger<DashboardViewModelNew> logger, ProfileService profileService)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            _logger.LogInformation("DashboardViewModelNew initialized");
        }

        /// <summary>
        /// Load dashboard statistics from all data sources
        /// </summary>
        public override async Task LoadAsync()
        {
            if (IsLoading) return;

            try
            {
                IsLoading = true;
                _logger.LogInformation("Loading dashboard statistics...");

                // Load data counts from all sources
                await LoadStatisticsAsync();

                _logger.LogInformation("Dashboard statistics loaded successfully");
                _logger.LogInformation($"Dashboard Stats - Users: {TotalUsers}, Computers: {TotalComputers}, Apps: {TotalApplications}, Groups: {TotalGroups}, FileServers: {TotalFileServers}, Databases: {TotalDatabases}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading dashboard statistics");
                ErrorMessage = "Failed to load dashboard statistics: " + ex.Message;
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadStatisticsAsync()
        {
            // Use parallel loading for better performance
            var tasks = new[]
            {
                LoadUsersCountAsync(),
                LoadComputersCountAsync(), 
                LoadApplicationsCountAsync(),
                LoadGroupsCountAsync(),
                LoadFileServersCountAsync(),
                LoadDatabasesCountAsync()
            };

            await Task.WhenAll(tasks);
        }

        private async Task LoadUsersCountAsync()
        {
            try
            {
                var result = await _csvService.LoadUsersAsync(_profileService.CurrentProfile ?? "default");
                TotalUsers = result.Data?.Count ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load users count for dashboard");
                TotalUsers = 0;
            }
        }

        private async Task LoadComputersCountAsync()
        {
            try
            {
                var result = await _csvService.LoadInfrastructureAsync(_profileService.CurrentProfile ?? "default");
                TotalComputers = result.Data?.Count ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load computers count for dashboard");
                TotalComputers = 0;
            }
        }

        private async Task LoadApplicationsCountAsync()
        {
            try
            {
                var result = await _csvService.LoadApplicationsAsync(_profileService.CurrentProfile ?? "default");
                TotalApplications = result.Data?.Count ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load applications count for dashboard");
                TotalApplications = 0;
            }
        }

        private async Task LoadGroupsCountAsync()
        {
            try
            {
                var result = await _csvService.LoadGroupsAsync(_profileService.CurrentProfile ?? "default");
                TotalGroups = result.Data?.Count ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load groups count for dashboard");
                TotalGroups = 0;
            }
        }

        private async Task LoadFileServersCountAsync()
        {
            try
            {
                var result = await _csvService.LoadFileServersAsync(_profileService.CurrentProfile ?? "default");
                TotalFileServers = result.Data?.Count ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load file servers count for dashboard");
                TotalFileServers = 0;
            }
        }

        private async Task LoadDatabasesCountAsync()
        {
            try
            {
                var result = await _csvService.LoadDatabasesAsync(_profileService.CurrentProfile ?? "default");
                TotalDatabases = result.Data?.Count ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load databases count for dashboard");
                TotalDatabases = 0;
            }
        }
    }
}