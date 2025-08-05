using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Drill-Down Dashboard functionality
    /// </summary>
    public class DrillDownDashboardViewModel : BaseViewModel
    {
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        
        private string _dashboardTitle = "Overview Dashboard";
        private string _dashboardDescription = "Click on any metric to drill down into detailed data";
        private string _currentDrillDownTitle = string.Empty;
        private string _filterText = string.Empty;
        private string _selectedFilter = "All";
        private string _selectedSort = "Name";
        private bool _sortAscending = true;
        private bool _showDetailView = false;
        private int _currentPage = 1;
        private int _pageSize = 50;
        private int _totalItemsCount = 0;
        private int _filteredItemsCount = 0;
        private DateTime _lastUpdated = DateTime.Now;
        private MetricCard _currentDrillDownMetric;

        public DrillDownDashboardViewModel(
            ILogger<DrillDownDashboardViewModel> logger,
            IMessenger messenger,
            IDataService dataService,
            IProfileService profileService) : base(logger, messenger)
        {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            MetricCards = new ObservableCollection<MetricCard>();
            DetailItems = new ObservableCollection<DetailItem>();
            FilteredDetailItems = CollectionViewSource.GetDefaultView(DetailItems);
            FilteredDetailItems.Filter = FilterDetailItems;

            FilterOptions = new[] { "All", "Active", "Inactive", "Critical", "Warning", "Healthy" };
            SortOptions = new[] { "Name", "Status", "Last Activity", "Risk Score", "Department" };

            InitializeCommands();
            LoadMetricCards();
        }

        #region Properties

        public ObservableCollection<MetricCard> MetricCards { get; }
        public ObservableCollection<DetailItem> DetailItems { get; }
        public ICollectionView FilteredDetailItems { get; }

        public string[] FilterOptions { get; }
        public string[] SortOptions { get; }

        public string DashboardTitle
        {
            get => _dashboardTitle;
            set => SetProperty(ref _dashboardTitle, value);
        }

        public string DashboardDescription
        {
            get => _dashboardDescription;
            set => SetProperty(ref _dashboardDescription, value);
        }

        public string CurrentDrillDownTitle
        {
            get => _currentDrillDownTitle;
            set => SetProperty(ref _currentDrillDownTitle, value);
        }

        public string FilterText
        {
            get => _filterText;
            set
            {
                if (SetProperty(ref _filterText, value))
                {
                    FilteredDetailItems.Refresh();
                    UpdateFilteredCount();
                }
            }
        }

        public string SelectedFilter
        {
            get => _selectedFilter;
            set
            {
                if (SetProperty(ref _selectedFilter, value))
                {
                    FilteredDetailItems.Refresh();
                    UpdateFilteredCount();
                }
            }
        }

        public string SelectedSort
        {
            get => _selectedSort;
            set
            {
                if (SetProperty(ref _selectedSort, value))
                {
                    ApplySorting();
                }
            }
        }

        public bool SortAscending
        {
            get => _sortAscending;
            set
            {
                if (SetProperty(ref _sortAscending, value))
                {
                    ApplySorting();
                }
            }
        }

        public bool ShowDetailView
        {
            get => _showDetailView;
            set => SetProperty(ref _showDetailView, value);
        }

        public int CurrentPage
        {
            get => _currentPage;
            set => SetProperty(ref _currentPage, value);
        }

        public int TotalItemsCount
        {
            get => _totalItemsCount;
            set => SetProperty(ref _totalItemsCount, value);
        }

        public int FilteredItemsCount
        {
            get => _filteredItemsCount;
            set => SetProperty(ref _filteredItemsCount, value);
        }

        public DateTime LastUpdated
        {
            get => _lastUpdated;
            set => SetProperty(ref _lastUpdated, value);
        }

        public bool CanGoPrevious => CurrentPage > 1;
        public bool CanGoNext => CurrentPage * _pageSize < FilteredItemsCount;

        #endregion

        #region Commands

        public ICommand RefreshCommand { get; private set; }
        public ICommand ExportCommand { get; private set; }
        public ICommand SettingsCommand { get; private set; }
        public ICommand CloseDetailCommand { get; private set; }
        public ICommand ApplyFilterCommand { get; private set; }
        public ICommand ToggleSortDirectionCommand { get; private set; }
        public ICommand PreviousPageCommand { get; private set; }
        public ICommand NextPageCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            
            RefreshCommand = new AsyncRelayCommand(RefreshDataAsync);
            ExportCommand = new AsyncRelayCommand(ExportDataAsync);
            SettingsCommand = new RelayCommand(ShowSettings);
            CloseDetailCommand = new RelayCommand(CloseDetailView);
            ApplyFilterCommand = new RelayCommand(ApplyFilter);
            ToggleSortDirectionCommand = new RelayCommand(ToggleSortDirection);
            PreviousPageCommand = new RelayCommand(GoToPreviousPage);
            NextPageCommand = new RelayCommand(GoToNextPage);
        }

        #endregion

        #region Public Methods

        public async Task LoadMetricCards()
        {
            await ExecuteAsync(async () =>
            {
                var profile = await _profileService.GetCurrentProfileAsync();
                if (profile == null) return;

                // Load summary data
                var users = await _dataService.LoadUsersAsync(profile.Name);
                var infrastructure = await _dataService.LoadInfrastructureAsync(profile.Name);
                var groups = await _dataService.LoadGroupsAsync(profile.Name);
                var applications = await _dataService.LoadApplicationsAsync(profile.Name);

                MetricCards.Clear();

                // Users Metrics
                AddUserMetrics(users);
                
                // Infrastructure Metrics
                AddInfrastructureMetrics(infrastructure);
                
                // Groups Metrics
                AddGroupMetrics(groups);
                
                // Application Metrics
                AddApplicationMetrics(applications);
                
                // Security Metrics
                AddSecurityMetrics(users, infrastructure);

                LastUpdated = DateTime.Now;

            }, "Loading dashboard metrics");
        }

        public void DrillDownIntoMetric(MetricCard metric)
        {
            _currentDrillDownMetric = metric;
            CurrentDrillDownTitle = metric.Title;
            ShowDetailView = true;
            
            Logger?.LogInformation("Drilling down into metric: {MetricTitle}", metric.Title);
            
            _ = LoadDetailDataAsync(metric);
        }

        public void CloseDetailView()
        {
            ShowDetailView = false;
            CurrentDrillDownTitle = string.Empty;
            DetailItems.Clear();
            _currentDrillDownMetric = null;
        }

        #endregion

        #region Private Methods

        private void AddUserMetrics(IEnumerable<UserData> users)
        {
            var userList = users.ToList();
            var totalUsers = userList.Count;
            var activeUsers = userList.Count(u => u.Enabled);
            var inactiveUsers = totalUsers - activeUsers;
            var privilegedUsers = userList.Count(u => u.IsPrivileged);

            MetricCards.Add(new MetricCard
            {
                Title = "Total Users",
                Value = totalUsers.ToString("N0"),
                Icon = "\uE716",
                IconColor = "#FF4F46E5",
                ChangeText = $"+{userList.Count(u => u.CreatedDate > DateTime.Now.AddDays(-30))} this month",
                ChangeIcon = "\uE70E",
                ChangeColor = "#FF059669",
                MetricType = "Users",
                DrillDownData = userList
            });

            MetricCards.Add(new MetricCard
            {
                Title = "Active Users",
                Value = activeUsers.ToString("N0"),
                Icon = "\uE8C8",
                IconColor = "#FF059669",
                ChangeText = $"{(double)activeUsers / totalUsers:P1} of total",
                ChangeIcon = "\uE946",
                ChangeColor = "#FF6B7280",
                MetricType = "ActiveUsers",
                DrillDownData = userList.Where(u => u.Enabled).ToList()
            });

            MetricCards.Add(new MetricCard
            {
                Title = "Privileged Users",
                Value = privilegedUsers.ToString("N0"),
                Icon = "\uE7EF",
                IconColor = "#FFDC2626",
                ChangeText = $"{(double)privilegedUsers / totalUsers:P1} of total",
                ChangeIcon = "\uE946",
                ChangeColor = "#FFDC2626",
                MetricType = "PrivilegedUsers",
                DrillDownData = userList.Where(u => u.IsPrivileged).ToList()
            });
        }

        private void AddInfrastructureMetrics(IEnumerable<InfrastructureData> infrastructure)
        {
            var infraList = infrastructure.ToList();
            var totalComputers = infraList.Count;
            var servers = infraList.Count(i => i.IsServer);
            var workstations = totalComputers - servers;
            var criticalSystems = infraList.Count(i => i.IsCritical);

            MetricCards.Add(new MetricCard
            {
                Title = "Total Computers",
                Value = totalComputers.ToString("N0"),
                Icon = "\uE977",
                IconColor = "#FF7C3AED",
                ChangeText = $"{servers} servers, {workstations} workstations",
                ChangeIcon = "\uE946",
                ChangeColor = "#FF6B7280",
                MetricType = "Infrastructure",
                DrillDownData = infraList
            });

            MetricCards.Add(new MetricCard
            {
                Title = "Servers",
                Value = servers.ToString("N0"),
                Icon = "\uE968",
                IconColor = "#FFEA580C",
                ChangeText = $"{criticalSystems} critical systems",
                ChangeIcon = "\uE730",
                ChangeColor = criticalSystems > 0 ? "#FFDC2626" : "#FF059669",
                MetricType = "Servers",
                DrillDownData = infraList.Where(i => i.IsServer).ToList()
            });
        }

        private void AddGroupMetrics(IEnumerable<GroupData> groups)
        {
            var groupList = groups.ToList();
            var totalGroups = groupList.Count;
            var securityGroups = groupList.Count(g => g.Type == "Security");
            var distributionGroups = groupList.Count(g => g.Type == "Distribution");

            MetricCards.Add(new MetricCard
            {
                Title = "Security Groups",
                Value = securityGroups.ToString("N0"),
                Icon = "\uE72E",
                IconColor = "#FFDC2626",
                ChangeText = $"{totalGroups} total groups",
                ChangeIcon = "\uE946",
                ChangeColor = "#FF6B7280",
                MetricType = "SecurityGroups",
                DrillDownData = groupList.Where(g => g.Type == "Security").ToList()
            });
        }

        private void AddApplicationMetrics(IEnumerable<ApplicationData> applications)
        {
            var appList = applications.ToList();
            var totalApps = appList.Count;
            var outdatedApps = appList.Count(a => a.IsOutdated);

            MetricCards.Add(new MetricCard
            {
                Title = "Applications",
                Value = totalApps.ToString("N0"),
                Icon = "\uE8B7",
                IconColor = "#FF059669",
                ChangeText = $"{outdatedApps} need updates",
                ChangeIcon = outdatedApps > 0 ? "\uE730" : "\uE73E",
                ChangeColor = outdatedApps > 0 ? "#FFEA580C" : "#FF059669",
                MetricType = "Applications",
                DrillDownData = appList
            });
        }

        private void AddSecurityMetrics(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure)
        {
            var userList = users.ToList();
            var infraList = infrastructure.ToList();
            
            var passwordExpiringSoon = userList.Count(u => u.PasswordExpiryDate.HasValue && 
                u.PasswordExpiryDate.Value <= DateTime.Now.AddDays(30));
            var staleComputers = infraList.Count(i => i.LastLogonDate.HasValue && 
                i.LastLogonDate.Value <= DateTime.Now.AddDays(-90));

            MetricCards.Add(new MetricCard
            {
                Title = "Security Alerts",
                Value = (passwordExpiringSoon + staleComputers).ToString("N0"),
                Icon = "\uE730",
                IconColor = "#FFDC2626",
                ChangeText = $"{passwordExpiringSoon} password alerts, {staleComputers} stale computers",
                ChangeIcon = "\uE730",
                ChangeColor = "#FFDC2626",
                MetricType = "SecurityAlerts",
                DrillDownData = new { PasswordAlerts = passwordExpiringSoon, StaleComputers = staleComputers }
            });
        }

        private async Task LoadDetailDataAsync(MetricCard metric)
        {
            await ExecuteAsync(async () =>
            {
                DetailItems.Clear();
                
                switch (metric.MetricType)
                {
                    case "Users":
                    case "ActiveUsers":
                    case "PrivilegedUsers":
                        LoadUserDetails(metric.DrillDownData as IEnumerable<UserData>);
                        break;
                        
                    case "Infrastructure":
                    case "Servers":
                        LoadInfrastructureDetails(metric.DrillDownData as IEnumerable<InfrastructureData>);
                        break;
                        
                    case "SecurityGroups":
                        LoadGroupDetails(metric.DrillDownData as IEnumerable<GroupData>);
                        break;
                        
                    case "Applications":
                        LoadApplicationDetails(metric.DrillDownData as IEnumerable<ApplicationData>);
                        break;
                        
                    case "SecurityAlerts":
                        await LoadSecurityAlertDetails();
                        break;
                }

                TotalItemsCount = DetailItems.Count;
                UpdateFilteredCount();
                CurrentPage = 1;

            }, $"Loading details for {metric.Title}");
        }

        private void LoadUserDetails(IEnumerable<UserData> users)
        {
            if (users == null) return;

            foreach (var user in users)
            {
                DetailItems.Add(new DetailItem
                {
                    PrimaryText = user.Name ?? user.UserPrincipalName,
                    SecondaryText = $"{user.UserPrincipalName} - {user.Department}",
                    StatusIcon = user.Enabled ? "\uE73E" : "\uE894",
                    StatusColor = user.Enabled ? "#FF059669" : "#FF6B7280",
                    MetricValue = user.LastLogonDate?.ToString("MMM dd") ?? "Never",
                    Tags = new[]
                    {
                        new DetailTag { Text = user.Domain, Color = "#FF4F46E5" },
                        new DetailTag { Text = user.Department, Color = "#FF7C3AED" },
                        new DetailTag { Text = user.IsPrivileged ? "Privileged" : "Standard", Color = user.IsPrivileged ? "#FFDC2626" : "#FF6B7280" }
                    }.Where(t => !string.IsNullOrEmpty(t.Text)).ToArray(),
                    Data = user,
                    ViewDetailsCommand = new RelayCommand(() => ShowUserDetails(user)),
                    ShowActionsCommand = new RelayCommand(() => ShowUserActions(user))
                });
            }
        }

        private void LoadInfrastructureDetails(IEnumerable<InfrastructureData> infrastructure)
        {
            if (infrastructure == null) return;

            foreach (var computer in infrastructure)
            {
                DetailItems.Add(new DetailItem
                {
                    PrimaryText = computer.Name,
                    SecondaryText = $"{computer.OperatingSystem} - {computer.Domain}",
                    StatusIcon = computer.IsOnline ? "\uE73E" : "\uE894",
                    StatusColor = computer.IsOnline ? "#FF059669" : "#FFDC2626",
                    MetricValue = computer.LastLogonDate?.ToString("MMM dd") ?? "Unknown",
                    Tags = new[]
                    {
                        new DetailTag { Text = computer.Domain, Color = "#FF4F46E5" },
                        new DetailTag { Text = computer.IsServer ? "Server" : "Workstation", Color = computer.IsServer ? "#FFEA580C" : "#FF7C3AED" },
                        new DetailTag { Text = computer.IsCritical ? "Critical" : "Standard", Color = computer.IsCritical ? "#FFDC2626" : "#FF6B7280" }
                    }.Where(t => !string.IsNullOrEmpty(t.Text)).ToArray(),
                    Data = computer,
                    ViewDetailsCommand = new RelayCommand(() => ShowInfrastructureDetails(computer)),
                    ShowActionsCommand = new RelayCommand(() => ShowInfrastructureActions(computer))
                });
            }
        }

        private void LoadGroupDetails(IEnumerable<GroupData> groups)
        {
            if (groups == null) return;

            foreach (var group in groups)
            {
                DetailItems.Add(new DetailItem
                {
                    PrimaryText = group.Name,
                    SecondaryText = group.Description,
                    StatusIcon = "\uE902",
                    StatusColor = "#FFDC2626",
                    MetricValue = $"{group.MemberCount} members",
                    Tags = new[]
                    {
                        new DetailTag { Text = group.Domain, Color = "#FF4F46E5" },
                        new DetailTag { Text = group.Type, Color = "#FFDC2626" }
                    }.Where(t => !string.IsNullOrEmpty(t.Text)).ToArray(),
                    Data = group,
                    ViewDetailsCommand = new RelayCommand(() => ShowGroupDetails(group)),
                    ShowActionsCommand = new RelayCommand(() => ShowGroupActions(group))
                });
            }
        }

        private void LoadApplicationDetails(IEnumerable<ApplicationData> applications)
        {
            if (applications == null) return;

            foreach (var app in applications)
            {
                DetailItems.Add(new DetailItem
                {
                    PrimaryText = app.Name,
                    SecondaryText = $"{app.Version} - {app.Publisher}",
                    StatusIcon = app.IsOutdated ? "\uE730" : "\uE73E",
                    StatusColor = app.IsOutdated ? "#FFEA580C" : "#FF059669",
                    MetricValue = app.InstallDate?.ToString("MMM dd, yyyy") ?? "Unknown",
                    Tags = new[]
                    {
                        new DetailTag { Text = app.Publisher, Color = "#FF7C3AED" },
                        new DetailTag { Text = app.IsOutdated ? "Needs Update" : "Current", Color = app.IsOutdated ? "#FFEA580C" : "#FF059669" }
                    }.Where(t => !string.IsNullOrEmpty(t.Text)).ToArray(),
                    Data = app,
                    ViewDetailsCommand = new RelayCommand(() => ShowApplicationDetails(app)),
                    ShowActionsCommand = new RelayCommand(() => ShowApplicationActions(app))
                });
            }
        }

        private async Task LoadSecurityAlertDetails()
        {
            var profile = await _profileService.GetCurrentProfileAsync();
            if (profile == null) return;

            var users = await _dataService.LoadUsersAsync(profile.Name);
            var infrastructure = await _dataService.LoadInfrastructureAsync(profile.Name);

            // Password expiry alerts
            foreach (var user in users.Where(u => u.PasswordExpiryDate.HasValue && 
                u.PasswordExpiryDate.Value <= DateTime.Now.AddDays(30)))
            {
                var daysUntilExpiry = (user.PasswordExpiryDate.Value - DateTime.Now).Days;
                DetailItems.Add(new DetailItem
                {
                    PrimaryText = $"Password expiring for {user.Name}",
                    SecondaryText = $"Password expires in {daysUntilExpiry} days",
                    StatusIcon = "\uE730",
                    StatusColor = daysUntilExpiry <= 7 ? "#FFDC2626" : "#FFEA580C",
                    MetricValue = user.PasswordExpiryDate.Value.ToString("MMM dd"),
                    Tags = new[]
                    {
                        new DetailTag { Text = "Password Alert", Color = "#FFDC2626" },
                        new DetailTag { Text = user.Department, Color = "#FF7C3AED" }
                    }.Where(t => !string.IsNullOrEmpty(t.Text)).ToArray(),
                    Data = user,
                    ViewDetailsCommand = new RelayCommand(() => ShowUserDetails(user)),
                    ShowActionsCommand = new RelayCommand(() => ShowPasswordActions(user))
                });
            }

            // Stale computer alerts
            foreach (var computer in infrastructure.Where(i => i.LastLogonDate.HasValue && 
                i.LastLogonDate.Value <= DateTime.Now.AddDays(-90)))
            {
                var daysSinceLogon = (DateTime.Now - computer.LastLogonDate.Value).Days;
                DetailItems.Add(new DetailItem
                {
                    PrimaryText = $"Stale computer: {computer.Name}",
                    SecondaryText = $"No activity for {daysSinceLogon} days",
                    StatusIcon = "\uE730",
                    StatusColor = "#FFEA580C",
                    MetricValue = computer.LastLogonDate.Value.ToString("MMM dd"),
                    Tags = new[]
                    {
                        new DetailTag { Text = "Stale System", Color = "#FFEA580C" },
                        new DetailTag { Text = computer.IsServer ? "Server" : "Workstation", Color = computer.IsServer ? "#FFDC2626" : "#FF7C3AED" }
                    }.Where(t => !string.IsNullOrEmpty(t.Text)).ToArray(),
                    Data = computer,
                    ViewDetailsCommand = new RelayCommand(() => ShowInfrastructureDetails(computer)),
                    ShowActionsCommand = new RelayCommand(() => ShowStaleComputerActions(computer))
                });
            }
        }

        private bool FilterDetailItems(object item)
        {
            if (item is not DetailItem detail) return false;

            // Apply text filter
            if (!string.IsNullOrWhiteSpace(FilterText))
            {
                var filterLower = FilterText.ToLowerInvariant();
                if (!detail.PrimaryText.ToLowerInvariant().Contains(filterLower) &&
                    !detail.SecondaryText.ToLowerInvariant().Contains(filterLower))
                {
                    return false;
                }
            }

            // Apply status filter
            if (SelectedFilter != "All")
            {
                // This would be implemented based on specific filtering logic
                // For now, just return true for non-"All" filters
            }

            return true;
        }

        private void ApplySorting()
        {
            var direction = SortAscending ? ListSortDirection.Ascending : ListSortDirection.Descending;
            
            FilteredDetailItems.SortDescriptions.Clear();
            
            switch (SelectedSort)
            {
                case "Name":
                    FilteredDetailItems.SortDescriptions.Add(new SortDescription(nameof(DetailItem.PrimaryText), direction));
                    break;
                case "Status":
                    FilteredDetailItems.SortDescriptions.Add(new SortDescription(nameof(DetailItem.StatusColor), direction));
                    break;
                case "Last Activity":
                    FilteredDetailItems.SortDescriptions.Add(new SortDescription(nameof(DetailItem.MetricValue), direction));
                    break;
                default:
                    FilteredDetailItems.SortDescriptions.Add(new SortDescription(nameof(DetailItem.PrimaryText), direction));
                    break;
            }
        }

        private void UpdateFilteredCount()
        {
            FilteredItemsCount = FilteredDetailItems.Cast<DetailItem>().Count();
            OnPropertyChanged(nameof(CanGoPrevious));
            OnPropertyChanged(nameof(CanGoNext));
        }

        private async Task RefreshDataAsync()
        {
            await LoadMetricCards();
            if (_currentDrillDownMetric != null)
            {
                await LoadDetailDataAsync(_currentDrillDownMetric);
            }
        }

        private async Task ExportDataAsync()
        {
            // Implementation for data export
            Logger?.LogInformation("Exporting drill-down data");
            SendMessage(new StatusMessage("Export functionality not yet implemented", StatusType.Information));
        }

        private void ShowSettings()
        {
            SendMessage(new NavigationMessage("DashboardSettings"));
        }

        private void ApplyFilter()
        {
            FilteredDetailItems.Refresh();
            UpdateFilteredCount();
        }

        private void ToggleSortDirection()
        {
            SortAscending = !SortAscending;
        }

        private void GoToPreviousPage()
        {
            if (CurrentPage > 1)
            {
                CurrentPage--;
            }
        }

        private void GoToNextPage()
        {
            if (CanGoNext)
            {
                CurrentPage++;
            }
        }

        // Detail action methods
        private void ShowUserDetails(UserData user)
        {
            SendMessage(new NavigationMessage("UserDetail", user));
        }

        private void ShowUserActions(UserData user)
        {
            // Show context menu for user actions
        }

        private void ShowInfrastructureDetails(InfrastructureData computer)
        {
            SendMessage(new NavigationMessage("InfrastructureDetail", computer));
        }

        private void ShowInfrastructureActions(InfrastructureData computer)
        {
            // Show context menu for infrastructure actions
        }

        private void ShowGroupDetails(GroupData group)
        {
            SendMessage(new NavigationMessage("GroupDetail", group));
        }

        private void ShowGroupActions(GroupData group)
        {
            // Show context menu for group actions
        }

        private void ShowApplicationDetails(ApplicationData app)
        {
            SendMessage(new NavigationMessage("ApplicationDetail", app));
        }

        private void ShowApplicationActions(ApplicationData app)
        {
            // Show context menu for application actions
        }

        private void ShowPasswordActions(UserData user)
        {
            // Show context menu for password-related actions
        }

        private void ShowStaleComputerActions(InfrastructureData computer)
        {
            // Show context menu for stale computer actions
        }

        #endregion
    }

    /// <summary>
    /// Represents a metric card for drill-down functionality
    /// </summary>
    public class MetricCard
    {
        public string Title { get; set; }
        public string Value { get; set; }
        public string Icon { get; set; }
        public string IconColor { get; set; }
        public string ChangeText { get; set; }
        public string ChangeIcon { get; set; }
        public string ChangeColor { get; set; }
        public string MetricType { get; set; }
        public object DrillDownData { get; set; }
    }

    /// <summary>
    /// Represents a detail item in the drill-down view
    /// </summary>
    public class DetailItem
    {
        public string PrimaryText { get; set; }
        public string SecondaryText { get; set; }
        public string StatusIcon { get; set; }
        public string StatusColor { get; set; }
        public string MetricValue { get; set; }
        public DetailTag[] Tags { get; set; } = Array.Empty<DetailTag>();
        public object Data { get; set; }
        public ICommand ViewDetailsCommand { get; set; }
        public ICommand ShowActionsCommand { get; set; }
    }

    /// <summary>
    /// Represents a tag in a detail item
    /// </summary>
    public class DetailTag
    {
        public string Text { get; set; }
        public string Color { get; set; }
    }
}