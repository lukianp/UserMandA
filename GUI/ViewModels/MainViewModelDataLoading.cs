using System;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Performance-optimized data loading methods for MainViewModel
    /// </summary>
    public partial class MainViewModel
    {
        #region Async Data Loading Methods

        /// <summary>
        /// Loads users data asynchronously with progress reporting
        /// </summary>
        private async Task LoadUsersDataAsync()
        {
            if (IsUsersLoading) return;

            IsUsersLoading = true;
            UsersLoadingMessage = "Loading users...";
            UsersLoadingProgress = 0;

            try
            {
                var companyName = SelectedProfile?.CompanyName ?? "DefaultCompany";
                var dataPath = ConfigurationService.Instance.GetCompanyDataPath(companyName);

                var progress = new Progress<LoadingProgress>(p =>
                {
                    Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        UsersLoadingMessage = p.Message;
                        UsersLoadingProgress = p.Percentage;
                    });
                });

                var cancellationToken = _cancellationTokenSource?.Token ?? CancellationToken.None;
                var count = await _asyncDataService.LoadUsersAsync(Users, dataPath, _userSearchText, progress, cancellationToken);

                Application.Current.Dispatcher.Invoke(() =>
                {
                    _allUsers = Users.ToList();
                    _userPagination.SetAllItems(_allUsers);
                    RefreshUserPage();
                    OnPropertiesChangedBatched(nameof(UserPageInfo), nameof(CurrentUserPage), nameof(TotalUserPages));
                });

                StatusMessage = $"Loaded {count} users successfully";
            }
            catch (OperationCanceledException)
            {
                StatusMessage = "User loading cancelled";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading users: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Error loading users: {ex}");
            }
            finally
            {
                IsUsersLoading = false;
                UsersLoadingMessage = "";
                UsersLoadingProgress = 0;
            }
        }

        /// <summary>
        /// Loads infrastructure data asynchronously with progress reporting
        /// </summary>
        private async Task LoadInfrastructureDataAsync()
        {
            if (IsInfrastructureLoading) return;

            IsInfrastructureLoading = true;
            InfrastructureLoadingMessage = "Loading infrastructure...";
            InfrastructureLoadingProgress = 0;

            try
            {
                var companyName = SelectedProfile?.CompanyName ?? "DefaultCompany";
                var dataPath = ConfigurationService.Instance.GetCompanyDataPath(companyName);

                var progress = new Progress<LoadingProgress>(p =>
                {
                    Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        InfrastructureLoadingMessage = p.Message;
                        InfrastructureLoadingProgress = p.Percentage;
                    });
                });

                var cancellationToken = _cancellationTokenSource?.Token ?? CancellationToken.None;
                var count = await _asyncDataService.LoadInfrastructureAsync(Infrastructure, dataPath, _infrastructureSearchText, progress, cancellationToken);

                Application.Current.Dispatcher.Invoke(() =>
                {
                    _allInfrastructure = Infrastructure.ToList();
                    _infrastructurePagination.SetAllItems(_allInfrastructure);
                    RefreshInfrastructurePage();
                    OnPropertiesChangedBatched(nameof(InfrastructurePageInfo), nameof(CurrentInfrastructurePage), nameof(TotalInfrastructurePages));
                });

                StatusMessage = $"Loaded {count} infrastructure items successfully";
            }
            catch (OperationCanceledException)
            {
                StatusMessage = "Infrastructure loading cancelled";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading infrastructure: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Error loading infrastructure: {ex}");
            }
            finally
            {
                IsInfrastructureLoading = false;
                InfrastructureLoadingMessage = "";
                InfrastructureLoadingProgress = 0;
            }
        }

        /// <summary>
        /// Loads groups data asynchronously with progress reporting
        /// </summary>
        private async Task LoadGroupsDataAsync()
        {
            if (IsGroupsLoading) return;

            IsGroupsLoading = true;
            GroupsLoadingMessage = "Loading groups...";
            GroupsLoadingProgress = 0;

            try
            {
                var companyName = SelectedProfile?.CompanyName ?? "DefaultCompany";
                var dataPath = ConfigurationService.Instance.GetCompanyDataPath(companyName);

                var progress = new Progress<LoadingProgress>(p =>
                {
                    Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        GroupsLoadingMessage = p.Message;
                        GroupsLoadingProgress = p.Percentage;
                    });
                });

                var cancellationToken = _cancellationTokenSource?.Token ?? CancellationToken.None;
                var count = await _asyncDataService.LoadGroupsAsync(Groups, dataPath, _groupSearchText, progress, cancellationToken);

                Application.Current.Dispatcher.Invoke(() =>
                {
                    _allGroups = Groups.ToList();
                    _groupPagination.SetAllItems(_allGroups);
                    RefreshGroupPage();
                    OnPropertiesChangedBatched(nameof(GroupPageInfo), nameof(CurrentGroupPage), nameof(TotalGroupPages));
                });

                StatusMessage = $"Loaded {count} groups successfully";
            }
            catch (OperationCanceledException)
            {
                StatusMessage = "Groups loading cancelled";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading groups: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Error loading groups: {ex}");
            }
            finally
            {
                IsGroupsLoading = false;
                GroupsLoadingMessage = "";
                GroupsLoadingProgress = 0;
            }
        }

        /// <summary>
        /// Handles view changes and triggers appropriate data loading
        /// </summary>
        private async void OnCurrentViewChanged()
        {
            // Cancel any ongoing operations
            _cancellationTokenSource?.Cancel();
            _cancellationTokenSource = new CancellationTokenSource();

            // Update visibility properties using batched notifications for better performance
            OnPropertiesChangedBatched(
                nameof(IsDashboardVisible),
                nameof(IsDiscoveryVisible),
                nameof(IsUsersVisible),
                nameof(IsComputersVisible),
                nameof(IsInfrastructureVisible),
                nameof(IsGroupsVisible),
                nameof(IsDomainDiscoveryVisible),
                nameof(IsFileServersVisible),
                nameof(IsDatabasesVisible),
                nameof(IsSecurityVisible),
                nameof(IsApplicationsVisible),
                nameof(IsWavesVisible),
                nameof(IsMigrateVisible),
                nameof(IsReportsVisible),
                nameof(IsAnalyticsVisible),
                nameof(IsSettingsVisible)
            );

            // Load data asynchronously based on the current view
            switch (CurrentView)
            {
                case "Users":
                    await LoadUsersDataAsync();
                    break;
                case "Infrastructure":
                    await LoadInfrastructureDataAsync();
                    break;
                case "Groups":
                    await LoadGroupsDataAsync();
                    break;
                case "Dashboard":
                    await RefreshDashboardDataAsync();
                    break;
                case "Analytics":
                    await RefreshAnalyticsDataAsync();
                    break;
            }
        }

        /// <summary>
        /// Refreshes dashboard data asynchronously
        /// </summary>
        private async Task RefreshDashboardDataAsync()
        {
            try
            {
                StatusMessage = "Refreshing dashboard...";

                await Task.Run(() =>
                {
                    // Load dashboard metrics in background
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        using (DashboardMetrics.SuppressNotifications())
                        {
                            DashboardMetrics.Clear();
                            
                            // Add basic metrics
                            DashboardMetrics.Add(new DashboardMetric
                            {
                                Name = "Total Users",
                                Value = Users.Count.ToString(),
                                Icon = "👥",
                                Trend = Users.Count > 0 ? "↗" : "→"
                            });

                            DashboardMetrics.Add(new DashboardMetric
                            {
                                Name = "Infrastructure Items",
                                Value = Infrastructure.Count.ToString(),
                                Icon = "🖥️",
                                Trend = Infrastructure.Count > 0 ? "↗" : "→"
                            });

                            DashboardMetrics.Add(new DashboardMetric
                            {
                                Name = "Groups",
                                Value = Groups.Count.ToString(),
                                Icon = "👥",
                                Trend = Groups.Count > 0 ? "↗" : "→"
                            });

                            DashboardMetrics.Add(new DashboardMetric
                            {
                                Name = "Discovery Status",
                                Value = IsDiscoveryRunning ? "Running" : "Ready",
                                Icon = IsDiscoveryRunning ? "🔄" : "✅",
                                Trend = IsDiscoveryRunning ? "↗" : "→"
                            });
                        }
                    });
                });

                StatusMessage = "Dashboard refreshed successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error refreshing dashboard: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Error refreshing dashboard: {ex}");
            }
        }

        /// <summary>
        /// Refreshes analytics data asynchronously
        /// </summary>
        private async Task RefreshAnalyticsDataAsync()
        {
            try
            {
                StatusMessage = "Refreshing analytics...";

                await Task.Run(() =>
                {
                    // Update analytics data in background
                    if (DataVisualization != null)
                    {
                        Application.Current.Dispatcher.Invoke(() =>
                        {
                            DataVisualization.RefreshChartData();
                        });
                    }
                });

                StatusMessage = "Analytics refreshed successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error refreshing analytics: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Error refreshing analytics: {ex}");
            }
        }

        #endregion
    }
}