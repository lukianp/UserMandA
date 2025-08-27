using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for loading data asynchronously with performance optimizations
    /// </summary>
    public class AsyncDataService
    {
        private readonly CsvDataServiceNew _csvDataService;
        private readonly object _loadingLock = new object();
        private CancellationTokenSource _currentLoadingCancellation;

        public AsyncDataService(CsvDataServiceNew csvDataService)
        {
            _csvDataService = csvDataService;
        }

        /// <summary>
        /// Loads user data asynchronously with progress reporting
        /// </summary>
        /// <param name="collection">Collection to populate</param>
        /// <param name="dataPath">Path to data files</param>
        /// <param name="searchText">Optional search filter</param>
        /// <param name="progressCallback">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items loaded</returns>
        public async Task<int> LoadUsersAsync(
            OptimizedObservableCollection<UserData> collection,
            string dataPath,
            string searchText = null,
            IProgress<LoadingProgress> progressCallback = null,
            CancellationToken cancellationToken = default)
        {
            return await LoadDataAsync(
                collection,
                dataPath,
                "users*.csv",
                async (file) => 
                {
                    var result = await _csvDataService.LoadUsersAsync(file);
                    return result.Data;
                },
                searchText,
                progressCallback,
                cancellationToken,
                FilterUser);
        }

        /// <summary>
        /// Loads infrastructure data asynchronously with progress reporting
        /// </summary>
        /// <param name="collection">Collection to populate</param>
        /// <param name="dataPath">Path to data files</param>
        /// <param name="searchText">Optional search filter</param>
        /// <param name="progressCallback">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items loaded</returns>
        public async Task<int> LoadInfrastructureAsync(
            OptimizedObservableCollection<InfrastructureData> collection,
            string dataPath,
            string searchText = null,
            IProgress<LoadingProgress> progressCallback = null,
            CancellationToken cancellationToken = default)
        {
            return await LoadDataAsync(
                collection,
                dataPath,
                "infrastructure*.csv",
                async (file) => 
                {
                    var result = await _csvDataService.LoadInfrastructureAsync(file);
                    return result.Data;
                },
                searchText,
                progressCallback,
                cancellationToken,
                FilterInfrastructure);
        }

        /// <summary>
        /// Loads group data asynchronously with progress reporting
        /// </summary>
        /// <param name="collection">Collection to populate</param>
        /// <param name="dataPath">Path to data files</param>
        /// <param name="searchText">Optional search filter</param>
        /// <param name="progressCallback">Progress reporting callback</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of items loaded</returns>
        public async Task<int> LoadGroupsAsync(
            OptimizedObservableCollection<GroupData> collection,
            string dataPath,
            string searchText = null,
            IProgress<LoadingProgress> progressCallback = null,
            CancellationToken cancellationToken = default)
        {
            return await LoadDataAsync(
                collection,
                dataPath,
                "groups*.csv",
                async (file) => 
                {
                    var result = await _csvDataService.LoadGroupsAsync(file);
                    return result.Data;
                },
                searchText,
                progressCallback,
                cancellationToken,
                FilterGroup);
        }

        /// <summary>
        /// Cancels any ongoing data loading operations
        /// </summary>
        public void CancelLoading()
        {
            lock (_loadingLock)
            {
                _currentLoadingCancellation?.Cancel();
            }
        }

        private async Task<int> LoadDataAsync<T>(
            OptimizedObservableCollection<T> collection,
            string dataPath,
            string filePattern,
            Func<string, Task<List<T>>> loadFunction,
            string searchText,
            IProgress<LoadingProgress> progressCallback,
            CancellationToken cancellationToken,
            Func<T, string, bool> filterFunction) where T : class
        {
            lock (_loadingLock)
            {
                _currentLoadingCancellation?.Cancel();
                _currentLoadingCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            }

            var token = _currentLoadingCancellation.Token;

            try
            {
                progressCallback?.Report(new LoadingProgress { Message = "Scanning files...", Percentage = 0 });

                if (!Directory.Exists(dataPath))
                {
                    await Application.Current.Dispatcher.InvokeAsync(() => collection.Clear());
                    return 0;
                }

                var files = Directory.GetFiles(dataPath, filePattern, SearchOption.AllDirectories);
                if (files.Length == 0)
                {
                    await Application.Current.Dispatcher.InvokeAsync(() => collection.Clear());
                    return 0;
                }

                var allData = new List<T>();
                var processedFiles = 0;

                // Load data from files in background
                await Task.Run(() =>
                {
                    foreach (var file in files)
                    {
                        token.ThrowIfCancellationRequested();

                        progressCallback?.Report(new LoadingProgress
                        {
                            Message = $"Loading {Path.GetFileName(file)}...",
                            Percentage = (processedFiles * 100) / files.Length
                        });

                        try
                        {
                            var fileData = loadFunction(file).GetAwaiter().GetResult();
                            allData.AddRange(fileData);
                        }
                        catch (Exception ex)
                        {
                            // Log error but continue with other files
                            System.Diagnostics.Debug.WriteLine($"Error loading {file}: {ex.Message}");
                        }

                        processedFiles++;
                    }
                }, token);

                token.ThrowIfCancellationRequested();

                // Apply search filter if provided
                if (!string.IsNullOrWhiteSpace(searchText) && searchText != "Search..." && filterFunction != null)
                {
                    progressCallback?.Report(new LoadingProgress { Message = "Applying filters...", Percentage = 90 });

                    await Task.Run(() =>
                    {
                        allData = allData.Where(item => filterFunction(item, searchText)).ToList();
                    }, token);
                }

                token.ThrowIfCancellationRequested();

                // Update UI on main thread using bulk operation
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    progressCallback?.Report(new LoadingProgress { Message = "Updating display...", Percentage = 95 });
                    collection.ReplaceAll(allData);
                });

                progressCallback?.Report(new LoadingProgress { Message = "Complete", Percentage = 100 });

                return allData.Count;
            }
            catch (OperationCanceledException)
            {
                progressCallback?.Report(new LoadingProgress { Message = "Cancelled", Percentage = 0 });
                return 0;
            }
            finally
            {
                lock (_loadingLock)
                {
                    if (_currentLoadingCancellation?.Token == token)
                    {
                        _currentLoadingCancellation = null;
                    }
                }
            }
        }

        private static bool FilterUser(UserData user, string searchText)
        {
            var searchLower = searchText.ToLowerInvariant();
            return (user.Name?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (user.Email?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (user.Department?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (user.JobTitle?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (user.UserPrincipalName?.ToLowerInvariant().Contains(searchLower) ?? false);
        }

        private static bool FilterInfrastructure(InfrastructureData infrastructure, string searchText)
        {
            var searchLower = searchText.ToLowerInvariant();
            return (infrastructure.Name?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (infrastructure.Type?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (infrastructure.IPAddress?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (infrastructure.OperatingSystem?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (infrastructure.Location?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (infrastructure.Description?.ToLowerInvariant().Contains(searchLower) ?? false);
        }

        private static bool FilterGroup(GroupData group, string searchText)
        {
            var searchLower = searchText.ToLowerInvariant();
            return (group.Name?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (group.Description?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (group.Type?.ToLowerInvariant().Contains(searchLower) ?? false) ||
                   (group.GroupType?.ToLowerInvariant().Contains(searchLower) ?? false);
        }
    }

    /// <summary>
    /// Progress information for data loading operations
    /// </summary>
    public class LoadingProgress
    {
        public string Message { get; set; }
        public int Percentage { get; set; }
    }
}