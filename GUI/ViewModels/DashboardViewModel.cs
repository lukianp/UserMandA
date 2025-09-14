using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Dashboard ViewModel using new unified architecture
    /// Provides overview and statistics for the discovery suite
    /// </summary>
    public class DashboardViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ILogger<DashboardViewModel> _logger;
        private readonly ProfileService _profileService;

        // Dashboard Statistics
        private int _totalUsers;
        private int _totalComputers;
        private int _totalApplications;
        private int _totalGroups;
        private int _totalFileServers;
        private int _totalDatabases;
        private bool _isLoading;

        // Project countdown properties
        private string? _projectName;
        private DateTimeOffset? _targetCutover;
        private TimeSpan? _daysToCutover;
        private DateTimeOffset? _nextWave;
        private TimeSpan? _daysToNextWave;

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

        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        // Project countdown properties
        public string? ProjectName
        {
            get => _projectName;
            private set => SetProperty(ref _projectName, value);
        }

        public DateTimeOffset? TargetCutover
        {
            get => _targetCutover;
            private set => SetProperty(ref _targetCutover, value);
        }

        public TimeSpan? DaysToCutover
        {
            get => _daysToCutover;
            private set => SetProperty(ref _daysToCutover, value);
        }

        public DateTimeOffset? NextWave
        {
            get => _nextWave;
            private set => SetProperty(ref _nextWave, value);
        }

        public TimeSpan? DaysToNextWave
        {
            get => _daysToNextWave;
            private set => SetProperty(ref _daysToNextWave, value);
        }

        // Commands
        public ICommand ConfigureProjectCommand { get; }

        public DashboardViewModel(CsvDataServiceNew csvService, ILogger<DashboardViewModel> logger, ProfileService profileService)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _logger = logger; // Allow null logger
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            // Initialize commands
            ConfigureProjectCommand = new AsyncRelayCommand(ConfigureProjectAsync);

            _logger?.LogInformation("DashboardViewModelNew initialized");
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
                _logger?.LogInformation("Loading dashboard statistics...");

                // Load data counts from all sources
                await LoadStatisticsAsync();
                
                // Load project countdown data
                await LoadProjectCountdownsAsync();

                _logger?.LogInformation("Dashboard statistics loaded successfully");
                _logger?.LogInformation($"Dashboard Stats - Users: {TotalUsers}, Computers: {TotalComputers}, Apps: {TotalApplications}, Groups: {TotalGroups}, FileServers: {TotalFileServers}, Databases: {TotalDatabases}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading dashboard statistics");
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
                _logger?.LogWarning(ex, "Failed to load users count for dashboard");
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
                _logger?.LogWarning(ex, "Failed to load computers count for dashboard");
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
                _logger?.LogWarning(ex, "Failed to load applications count for dashboard");
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
                _logger?.LogWarning(ex, "Failed to load groups count for dashboard");
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
                _logger?.LogWarning(ex, "Failed to load file servers count for dashboard");
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
                _logger?.LogWarning(ex, "Failed to load databases count for dashboard");
                TotalDatabases = 0;
            }
        }

        private async Task LoadProjectCountdownsAsync()
        {
            try
            {
                // Get dynamic project configuration path
                var profileName = _profileService.CurrentProfile ?? "default";
                var projectPath = Path.Combine(ConfigurationService.Instance.GetCompanyDataPath(profileName), "Project.json");

                // Fallback paths for backward compatibility
                var fallbackPaths = new[]
                {
                    projectPath,
                    @"C:\discoverydata\ljpops\Project.json", // Legacy hardcoded path
                    Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "Project.json")
                };

                string? foundProjectPath = null;
                foreach (var path in fallbackPaths)
                {
                    if (File.Exists(path))
                    {
                        foundProjectPath = path;
                        break;
                    }
                }

                if (!string.IsNullOrEmpty(foundProjectPath))
                {
                    var json = await File.ReadAllTextAsync(foundProjectPath);
                    var project = JsonSerializer.Deserialize<JsonElement>(json);

                    ProjectName = project.GetProperty("ProjectName").GetString();

                    if (project.TryGetProperty("TargetCutover", out var cutover))
                    {
                        TargetCutover = DateTimeOffset.Parse(cutover.GetString() ?? "");
                        DaysToCutover = TargetCutover - DateTimeOffset.Now;
                    }

                    if (project.TryGetProperty("NextWave", out var wave))
                    {
                        NextWave = DateTimeOffset.Parse(wave.GetString() ?? "");
                        DaysToNextWave = NextWave - DateTimeOffset.Now;
                    }

                    _logger?.LogInformation("Project configuration loaded from: {Path}", foundProjectPath);
                }
                else
                {
                    ProjectName = "Not configured";
                    _logger?.LogInformation("No project configuration found for profile: {Profile}", profileName);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to load project countdowns");
                ProjectName = "Error loading";
                ErrorMessage = $"Failed to load project configuration: {ex.Message}";
                HasErrors = true;
            }
        }

        private async Task ConfigureProjectAsync()
        {
            try
            {
                // Get dynamic project configuration path
                var profileName = _profileService.CurrentProfile ?? "default";
                var projectPath = Path.Combine(ConfigurationService.Instance.GetCompanyDataPath(profileName), "Project.json");

                // Ensure directory exists
                var directory = Path.GetDirectoryName(projectPath);
                if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Create default project configuration
                var projectData = new
                {
                    ProjectName = $"M&A — {profileName}",
                    TargetCutover = "2025-12-15T09:00:00Z",
                    NextWave = "2025-10-01T09:00:00Z"
                };

                var json = JsonSerializer.Serialize(projectData, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(projectPath, json);

                await LoadProjectCountdownsAsync();

                _logger?.LogInformation("Project configuration updated for profile: {Profile}", profileName);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to configure project");
                ErrorMessage = $"Failed to configure project: {ex.Message}";
                HasErrors = true;
            }
        }
    }
}