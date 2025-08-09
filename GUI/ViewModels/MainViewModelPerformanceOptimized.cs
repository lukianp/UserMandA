using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Performance-optimized extensions for MainViewModel
    /// </summary>
    public partial class MainViewModel
    {
        #region Performance Services

        private DebouncedSearchService _debouncedSearchService;
        private MemoryOptimizationService _memoryOptimizationService;
        private SmartPaginationService<UserData> _smartUserPagination;
        private SmartPaginationService<InfrastructureData> _smartInfraPagination;
        private SmartPaginationService<GroupData> _smartGroupPagination;

        #endregion

        #region Enhanced Initialization

        /// <summary>
        /// Initializes performance optimization services
        /// </summary>
        private void InitializePerformanceServices()
        {
            // Initialize performance services
            var performanceMonitor = new PerformanceMonitorService();
            performanceMonitor.PerformanceWarning += OnPerformanceWarning;

            _memoryOptimizationService = new MemoryOptimizationService(performanceMonitor);
            _memoryOptimizationService.ConfigureForOptimalMemoryUsage();

            _debouncedSearchService = new DebouncedSearchService();

            // Initialize smart pagination services
            _smartUserPagination = new SmartPaginationService<UserData>();
            _smartInfraPagination = new SmartPaginationService<InfrastructureData>();
            _smartGroupPagination = new SmartPaginationService<GroupData>();

            // Configure pagination
            ConfigurePaginationServices();
        }

        private void ConfigurePaginationServices()
        {
            // Configure user pagination
            _smartUserPagination.PageSize = 100;
            _smartUserPagination.IsInfiniteScrollEnabled = true;
            _smartUserPagination.LoadMoreRequested += async (s, e) =>
            {
                await LoadMoreUsersAsync(e);
            };

            // Configure infrastructure pagination
            _smartInfraPagination.PageSize = 100;
            _smartInfraPagination.IsInfiniteScrollEnabled = true;
            _smartInfraPagination.LoadMoreRequested += async (s, e) =>
            {
                await LoadMoreInfrastructureAsync(e);
            };

            // Configure groups pagination
            _smartGroupPagination.PageSize = 100;
            _smartGroupPagination.IsInfiniteScrollEnabled = true;
            _smartGroupPagination.LoadMoreRequested += async (s, e) =>
            {
                await LoadMoreGroupsAsync(e);
            };
        }

        #endregion

        #region Optimized Search Implementation

        /// <summary>
        /// Performs optimized, debounced user search
        /// </summary>
        /// <param name="searchTerm">Search term</param>
        private void PerformOptimizedUserSearch(string searchTerm)
        {
            _debouncedSearchService.DebounceSearch(async () =>
            {
                await SearchUsersAsync(searchTerm, CancellationToken.None);
            });
        }

        /// <summary>
        /// Performs optimized, debounced infrastructure search
        /// </summary>
        /// <param name="searchTerm">Search term</param>
        private void PerformOptimizedInfrastructureSearch(string searchTerm)
        {
            _debouncedSearchService.DebounceSearch(async () =>
            {
                await SearchInfrastructureAsync(searchTerm, CancellationToken.None);
            });
        }

        /// <summary>
        /// Performs optimized, debounced groups search
        /// </summary>
        /// <param name="searchTerm">Search term</param>
        private void PerformOptimizedGroupsSearch(string searchTerm)
        {
            _debouncedSearchService.DebounceSearch(async () =>
            {
                await SearchGroupsAsync(searchTerm, CancellationToken.None);
            });
        }

        #endregion

        #region Cached Data Loading

        /// <summary>
        /// Loads users with intelligent caching
        /// </summary>
        private async Task<System.Collections.Generic.List<UserData>> LoadUsersCachedAsync(string companyName)
        {
            var cacheKey = $"Users_{companyName}_{DateTime.Now:yyyyMMdd}";
            
            return await _cacheService.GetOrCreateAsync(cacheKey, async () =>
            {
                var dataPath = ConfigurationService.Instance.GetCompanyDataPath(companyName);
                return await Task.Run(() =>
                {
                    // Load from CSV files
                    var allUsers = new System.Collections.Generic.List<UserData>();
                    var files = System.IO.Directory.GetFiles(dataPath, "users*.csv", System.IO.SearchOption.AllDirectories);
                    
                    foreach (var file in files)
                    {
                        try
                        {
                            var fileUsers = Task.Run(async () => await _csvDataService.LoadUsersAsync(file)).GetAwaiter().GetResult();
                            allUsers.AddRange(fileUsers);
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Error loading users from {file}: {ex.Message}");
                        }
                    }
                    
                    return allUsers;
                });
            }, TimeSpan.FromMinutes(15)); // Cache for 15 minutes
        }

        /// <summary>
        /// Loads infrastructure with intelligent caching
        /// </summary>
        private async Task<System.Collections.Generic.List<InfrastructureData>> LoadInfrastructureCachedAsync(string companyName)
        {
            var cacheKey = $"Infrastructure_{companyName}_{DateTime.Now:yyyyMMdd}";
            
            return await _cacheService.GetOrCreateAsync(cacheKey, async () =>
            {
                var dataPath = ConfigurationService.Instance.GetCompanyDataPath(companyName);
                return await Task.Run(() =>
                {
                    var allInfrastructure = new System.Collections.Generic.List<InfrastructureData>();
                    var files = System.IO.Directory.GetFiles(dataPath, "infrastructure*.csv", System.IO.SearchOption.AllDirectories);
                    
                    foreach (var file in files)
                    {
                        try
                        {
                            var fileData = Task.Run(async () => await _csvDataService.LoadInfrastructureAsync(file)).GetAwaiter().GetResult();
                            allInfrastructure.AddRange(fileData);
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Error loading infrastructure from {file}: {ex.Message}");
                        }
                    }
                    
                    return allInfrastructure;
                });
            }, TimeSpan.FromMinutes(15));
        }

        /// <summary>
        /// Loads groups with intelligent caching
        /// </summary>
        private async Task<System.Collections.Generic.List<GroupData>> LoadGroupsCachedAsync(string companyName)
        {
            var cacheKey = $"Groups_{companyName}_{DateTime.Now:yyyyMMdd}";
            
            return await _cacheService.GetOrCreateAsync(cacheKey, async () =>
            {
                var dataPath = ConfigurationService.Instance.GetCompanyDataPath(companyName);
                return await Task.Run(() =>
                {
                    var allGroups = new System.Collections.Generic.List<GroupData>();
                    var files = System.IO.Directory.GetFiles(dataPath, "groups*.csv", System.IO.SearchOption.AllDirectories);
                    
                    foreach (var file in files)
                    {
                        try
                        {
                            var fileData = Task.Run(async () => await _csvDataService.LoadGroupsAsync(file)).GetAwaiter().GetResult();
                            allGroups.AddRange(fileData);
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Error loading groups from {file}: {ex.Message}");
                        }
                    }
                    
                    return allGroups;
                });
            }, TimeSpan.FromMinutes(15));
        }

        #endregion

        #region Infinite Scroll Implementation

        private async Task LoadMoreUsersAsync(LoadMoreEventArgs e)
        {
            try
            {
                // Simulate loading more data
                await Task.Delay(500, e.CancellationToken);
                
                var companyName = SelectedProfile?.CompanyName ?? "ljpops";
                var allUsers = await LoadUsersCachedAsync(companyName);
                
                var skipCount = e.CurrentItemCount;
                var moreUsers = allUsers.Skip(skipCount).Take(e.PageSize).ToList();
                var hasMore = skipCount + moreUsers.Count < allUsers.Count;
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _smartUserPagination.AddItems(moreUsers, hasMore);
                });
            }
            catch (OperationCanceledException)
            {
                // Expected when cancelled
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading more users: {ex.Message}";
            }
        }

        private async Task LoadMoreInfrastructureAsync(LoadMoreEventArgs e)
        {
            try
            {
                await Task.Delay(500, e.CancellationToken);
                
                var companyName = SelectedProfile?.CompanyName ?? "ljpops";
                var allInfrastructure = await LoadInfrastructureCachedAsync(companyName);
                
                var skipCount = e.CurrentItemCount;
                var moreItems = allInfrastructure.Skip(skipCount).Take(e.PageSize).ToList();
                var hasMore = skipCount + moreItems.Count < allInfrastructure.Count;
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _smartInfraPagination.AddItems(moreItems, hasMore);
                });
            }
            catch (OperationCanceledException)
            {
                // Expected when cancelled
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading more infrastructure: {ex.Message}";
            }
        }

        private async Task LoadMoreGroupsAsync(LoadMoreEventArgs e)
        {
            try
            {
                await Task.Delay(500, e.CancellationToken);
                
                var companyName = SelectedProfile?.CompanyName ?? "ljpops";
                var allGroups = await LoadGroupsCachedAsync(companyName);
                
                var skipCount = e.CurrentItemCount;
                var moreItems = allGroups.Skip(skipCount).Take(e.PageSize).ToList();
                var hasMore = skipCount + moreItems.Count < allGroups.Count;
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _smartGroupPagination.AddItems(moreItems, hasMore);
                });
            }
            catch (OperationCanceledException)
            {
                // Expected when cancelled
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading more groups: {ex.Message}";
            }
        }

        #endregion

        #region Memory Management

        /// <summary>
        /// Handles performance warnings
        /// </summary>
        private void OnPerformanceWarning(object sender, PerformanceWarningEventArgs e)
        {
            Application.Current.Dispatcher.BeginInvoke(() =>
            {
                StatusMessage = $"Performance: {e.Message}";
                
                // Take action based on warning type
                switch (e.WarningType)
                {
                    case PerformanceWarningType.HighMemoryUsage:
                        _memoryOptimizationService.OptimizeMemoryNow();
                        break;
                    case PerformanceWarningType.SlowOperation:
                        // Could show a warning to user or optimize operations
                        break;
                }
            });
        }

        /// <summary>
        /// Prepares system for large data operations
        /// </summary>
        /// <param name="expectedDataSizeMB">Expected data size in MB</param>
        private void PrepareForLargeOperation(long expectedDataSizeMB)
        {
            _memoryOptimizationService.PrepareForLargeDataOperation(expectedDataSizeMB);
        }

        /// <summary>
        /// Cleans up after large data operations
        /// </summary>
        private void CleanupAfterLargeOperation()
        {
            _memoryOptimizationService.CleanupAfterLargeDataOperation();
        }

        #endregion

        #region Enhanced Search Methods

        private async Task SearchUsersAsync(string searchTerm, System.Threading.CancellationToken cancellationToken)
        {
            var companyName = SelectedProfile?.CompanyName ?? "ljpops";
            var cacheKey = $"UserSearch_{companyName}_{searchTerm}";
            
            var filteredUsers = await _cacheService.GetOrCreateAsync(cacheKey, async () =>
            {
                var allUsers = await LoadUsersCachedAsync(companyName);
                
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return allUsers;
                
                var searchLower = searchTerm.ToLowerInvariant();
                return allUsers.Where(u =>
                    (u.Name?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                    (u.Email?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                    (u.Department?.ToLowerInvariant().Contains(searchLower) ?? false)
                ).ToList();
            }, TimeSpan.FromMinutes(5));

            if (!cancellationToken.IsCancellationRequested)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _smartUserPagination.SetAllItems(filteredUsers);
                });
            }
        }

        private async Task SearchInfrastructureAsync(string searchTerm, System.Threading.CancellationToken cancellationToken)
        {
            var companyName = SelectedProfile?.CompanyName ?? "ljpops";
            var cacheKey = $"InfrastructureSearch_{companyName}_{searchTerm}";
            
            var filteredItems = await _cacheService.GetOrCreateAsync(cacheKey, async () =>
            {
                var allItems = await LoadInfrastructureCachedAsync(companyName);
                
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return allItems;
                
                var searchLower = searchTerm.ToLowerInvariant();
                return allItems.Where(i =>
                    (i.Name?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                    (i.Type?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                    (i.IPAddress?.ToLowerInvariant().Contains(searchLower) ?? false)
                ).ToList();
            }, TimeSpan.FromMinutes(5));

            if (!cancellationToken.IsCancellationRequested)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _smartInfraPagination.SetAllItems(filteredItems);
                });
            }
        }

        private async Task SearchGroupsAsync(string searchTerm, System.Threading.CancellationToken cancellationToken)
        {
            var companyName = SelectedProfile?.CompanyName ?? "ljpops";
            var cacheKey = $"GroupsSearch_{companyName}_{searchTerm}";
            
            var filteredItems = await _cacheService.GetOrCreateAsync(cacheKey, async () =>
            {
                var allItems = await LoadGroupsCachedAsync(companyName);
                
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return allItems;
                
                var searchLower = searchTerm.ToLowerInvariant();
                return allItems.Where(g =>
                    (g.Name?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                    (g.Description?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                    (g.Type?.ToLowerInvariant().Contains(searchLower) ?? false)
                ).ToList();
            }, TimeSpan.FromMinutes(5));

            if (!cancellationToken.IsCancellationRequested)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _smartGroupPagination.SetAllItems(filteredItems);
                });
            }
        }

        #endregion

        #region Cleanup

        /// <summary>
        /// Enhanced cleanup with performance service disposal
        /// </summary>
        private void DisposePerformanceServices()
        {
            _debouncedSearchService?.Dispose();
            _cacheService?.Dispose();
            _memoryOptimizationService?.Dispose();
            _smartUserPagination?.Dispose();
            _smartInfraPagination?.Dispose();
            _smartGroupPagination?.Dispose();
        }

        #endregion
    }
}