using System;
using System.Diagnostics;
using System.Threading.Tasks;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Analytics view using unified MVVM pipeline with real CSV data
    /// </summary>
    public class AnalyticsViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        private int _totalUsers = 0;
        private int _totalGroups = 0;
        private int _totalInfrastructure = 0;
        private int _totalApplications = 0;
        private int _totalFileServers = 0;
        private int _totalDatabases = 0;
        private int _totalPolicies = 0;
        private int _totalAssets = 0;

        public override bool HasData => _totalUsers > 0 || _totalAssets > 0;

        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        public int TotalGroups
        {
            get => _totalGroups;
            set => SetProperty(ref _totalGroups, value);
        }

        public int TotalInfrastructure
        {
            get => _totalInfrastructure;
            set => SetProperty(ref _totalInfrastructure, value);
        }

        public int TotalApplications
        {
            get => _totalApplications;
            set => SetProperty(ref _totalApplications, value);
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

        public int TotalPolicies
        {
            get => _totalPolicies;
            set => SetProperty(ref _totalPolicies, value);
        }

        public int TotalAssets
        {
            get => _totalAssets;
            set => SetProperty(ref _totalAssets, value);
        }

        public AnalyticsViewModel(CsvDataServiceNew csvService, ILogger<AnalyticsViewModel> logger, ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        public override async Task LoadAsync()
        {
            var sw = Stopwatch.StartNew();
            IsLoading = true; 
            HasErrors = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "analytics" }, "Analytics data loading started");
                
                // Get current profile
                var profile = _profileService.CurrentProfile ?? "ljpops";
                
                // Load all data types in parallel for analytics aggregation
                var usersTask = _csvService.LoadUsersAsync(profile);
                var groupsTask = _csvService.LoadGroupsAsync(profile);
                var infraTask = _csvService.LoadInfrastructureAsync(profile);
                var appsTask = _csvService.LoadApplicationsAsync(profile);
                var fileServersTask = _csvService.LoadFileServersAsync(profile);
                var databasesTask = _csvService.LoadDatabasesAsync(profile);
                var policiesTask = _csvService.LoadGroupPoliciesAsync(profile);

                // Wait for all tasks to complete
                await Task.WhenAll(usersTask, groupsTask, infraTask, appsTask, fileServersTask, databasesTask, policiesTask);

                // Get results
                var usersResult = await usersTask;
                var groupsResult = await groupsTask;
                var infraResult = await infraTask;
                var appsResult = await appsTask;
                var fileServersResult = await fileServersTask;
                var databasesResult = await databasesTask;
                var policiesResult = await policiesTask;
                
                // Aggregate header warnings from all sources
                void AddWarnings<T>(DataLoaderResult<T> result) where T : class
                {
                    foreach (var warning in result.HeaderWarnings)
                    {
                        if (!HeaderWarnings.Contains(warning))
                        {
                            HeaderWarnings.Add(warning);
                        }
                    }
                }

                AddWarnings(usersResult);
                AddWarnings(groupsResult);
                AddWarnings(infraResult);
                AddWarnings(appsResult);
                AddWarnings(fileServersResult);
                AddWarnings(databasesResult);
                AddWarnings(policiesResult);

                // Update counts from actual data
                TotalUsers = usersResult.Data?.Count ?? 0;
                TotalGroups = groupsResult.Data?.Count ?? 0;
                TotalInfrastructure = infraResult.Data?.Count ?? 0;
                TotalApplications = appsResult.Data?.Count ?? 0;
                TotalFileServers = fileServersResult.Data?.Count ?? 0;
                TotalDatabases = databasesResult.Data?.Count ?? 0;
                TotalPolicies = policiesResult.Data?.Count ?? 0;
                
                // Calculate total assets (infrastructure + applications + fileservers + databases)
                TotalAssets = TotalInfrastructure + TotalApplications + TotalFileServers + TotalDatabases;
                
                OnPropertyChanged(nameof(HasData));
                
                StructuredLogger?.LogInfo(LogSourceName, new { 
                    action = "load_complete", 
                    component = "analytics",
                    users = TotalUsers,
                    groups = TotalGroups,
                    infrastructure = TotalInfrastructure,
                    applications = TotalApplications,
                    file_servers = TotalFileServers,
                    databases = TotalDatabases,
                    policies = TotalPolicies,
                    total_assets = TotalAssets,
                    warnings = HeaderWarnings.Count,
                    elapsed_ms = sw.ElapsedMilliseconds
                }, "Analytics data loaded successfully with aggregated metrics");
            }
            catch (Exception ex) 
            {
                LastError = $"Failed to load analytics data: {ex.Message}";
                HasErrors = true;
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "analytics" }, "Failed to load analytics data");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}