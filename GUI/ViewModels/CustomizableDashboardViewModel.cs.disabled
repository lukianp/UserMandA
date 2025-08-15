using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Customizable Dashboard functionality
    /// </summary>
    public class CustomizableDashboardViewModel : BaseViewModel
    {
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        
        private string _dashboardName = "My Dashboard";
        private string _dashboardDescription = "Drag widgets from the palette to customize your dashboard";
        private bool _showWidgetPalette = false;
        private bool _showDropZones = false;

        public CustomizableDashboardViewModel(
            ILogger<CustomizableDashboardViewModel> logger,
            IMessenger messenger,
            IDataService dataService,
            IProfileService profileService) : base(logger, messenger)
        {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            Widgets = new ObservableCollection<DashboardWidget>();
            DropZones = new ObservableCollection<DropZone>();
            AnalyticsWidgets = new ObservableCollection<WidgetDefinition>();
            DataWidgets = new ObservableCollection<WidgetDefinition>();
            ChartWidgets = new ObservableCollection<WidgetDefinition>();
            UtilityWidgets = new ObservableCollection<WidgetDefinition>();

            InitializeCommands();
            LoadWidgetDefinitions();
            LoadDefaultDashboard();
        }

        #region Properties

        public ObservableCollection<DashboardWidget> Widgets { get; }
        public ObservableCollection<DropZone> DropZones { get; }
        public ObservableCollection<WidgetDefinition> AnalyticsWidgets { get; }
        public ObservableCollection<WidgetDefinition> DataWidgets { get; }
        public ObservableCollection<WidgetDefinition> ChartWidgets { get; }
        public ObservableCollection<WidgetDefinition> UtilityWidgets { get; }

        public string DashboardName
        {
            get => _dashboardName;
            set => SetProperty(ref _dashboardName, value);
        }

        public string DashboardDescription
        {
            get => _dashboardDescription;
            set => SetProperty(ref _dashboardDescription, value);
        }

        public bool ShowWidgetPalette
        {
            get => _showWidgetPalette;
            set => SetProperty(ref _showWidgetPalette, value);
        }

        public bool ShowDropZones
        {
            get => _showDropZones;
            set => SetProperty(ref _showDropZones, value);
        }

        #endregion

        #region Commands

        public ICommand ToggleWidgetPaletteCommand { get; private set; }
        public ICommand ShowLayoutOptionsCommand { get; private set; }
        public ICommand ExportDashboardCommand { get; private set; }
        public ICommand ResetDashboardCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            
            ToggleWidgetPaletteCommand = new RelayCommand(ToggleWidgetPalette);
            ShowLayoutOptionsCommand = new RelayCommand(ShowLayoutOptions);
            ExportDashboardCommand = new AsyncRelayCommand(ExportDashboardAsync);
            ResetDashboardCommand = new RelayCommand(ResetDashboard);
        }

        #endregion

        #region Public Methods

        public void AddWidget(WidgetDefinition widgetDef, int row, int column)
        {
            if (widgetDef == null) return;

            // Check if position is already occupied
            var existingWidget = Widgets.FirstOrDefault(w => w.GridRow == row && w.GridColumn == column);
            if (existingWidget != null)
            {
                // Find next available position
                var position = FindNextAvailablePosition();
                row = position.Row;
                column = position.Column;
            }

            var widget = new DashboardWidget
            {
                Id = Guid.NewGuid().ToString(),
                Title = widgetDef.Title,
                Icon = widgetDef.Icon,
                IconColor = widgetDef.IconColor,
                WidgetType = widgetDef.WidgetType,
                GridRow = row,
                GridColumn = column,
                GridRowSpan = widgetDef.DefaultRowSpan,
                GridColumnSpan = widgetDef.DefaultColumnSpan,
                Data = null, // Will be loaded based on widget type
                HasFooter = false,
                FooterText = string.Empty
            };

            // Set up widget commands
            widget.RefreshCommand = new AsyncRelayCommand(() => RefreshWidgetAsync(widget));
            widget.SettingsCommand = new RelayCommand(() => ShowWidgetSettings(widget));
            widget.RemoveCommand = new RelayCommand(() => RemoveWidget(widget));

            Widgets.Add(widget);
            
            // Load widget data
            _ = LoadWidgetDataAsync(widget);
            
            Logger?.LogInformation("Added widget: {WidgetTitle} at position {Row},{Column}", 
                widget.Title, row, column);
        }

        public void ReplaceWidget(DashboardWidget existingWidget, WidgetDefinition newWidgetDef)
        {
            if (existingWidget == null || newWidgetDef == null) return;

            var index = Widgets.IndexOf(existingWidget);
            if (index >= 0)
            {
                // Remove existing widget
                Widgets.RemoveAt(index);
                
                // Add new widget at same position
                AddWidget(newWidgetDef, existingWidget.GridRow, existingWidget.GridColumn);
            }
        }

        public void RemoveWidget(DashboardWidget widget)
        {
            if (widget != null)
            {
                Widgets.Remove(widget);
                Logger?.LogInformation("Removed widget: {WidgetTitle}", widget.Title);
            }
        }

        public void SetDropZonesVisibility(bool show)
        {
            ShowDropZones = show;
            
            if (show)
            {
                DropZones.Clear();
                
                // Add drop zones for each grid cell
                for (int row = 0; row < 4; row++)
                {
                    for (int column = 0; column < 4; column++)
                    {
                        // Only show empty cells as drop zones
                        if (!Widgets.Any(w => w.GridRow == row && w.GridColumn == column))
                        {
                            DropZones.Add(new DropZone { Row = row, Column = column });
                        }
                    }
                }
            }
            else
            {
                DropZones.Clear();
            }
        }

        #endregion

        #region Private Methods

        private void LoadWidgetDefinitions()
        {
            // Analytics Widgets
            AnalyticsWidgets.Add(new WidgetDefinition
            {
                WidgetType = "UserCount",
                Title = "User Count",
                Description = "Total number of users discovered",
                Icon = "\uE716",
                IconColor = "#FF4F46E5",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 1
            });

            AnalyticsWidgets.Add(new WidgetDefinition
            {
                WidgetType = "ComputerCount",
                Title = "Computer Count",
                Description = "Total number of computers discovered",
                Icon = "\uE977",
                IconColor = "#FF059669",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 1
            });

            AnalyticsWidgets.Add(new WidgetDefinition
            {
                WidgetType = "SecurityRisk",
                Title = "Security Risk",
                Description = "Overall security risk assessment",
                Icon = "\uE730",
                IconColor = "#FFDC2626",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 1
            });

            AnalyticsWidgets.Add(new WidgetDefinition
            {
                WidgetType = "MigrationProgress",
                Title = "Migration Progress",
                Description = "Overall migration completion percentage",
                Icon = "\uE8F4",
                IconColor = "#FFEA580C",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 2
            });

            // Data Widgets
            DataWidgets.Add(new WidgetDefinition
            {
                WidgetType = "RecentUsers",
                Title = "Recent Users",
                Description = "List of recently discovered users",
                Icon = "\uE8C4",
                IconColor = "#FF7C3AED",
                DefaultRowSpan = 2,
                DefaultColumnSpan = 2
            });

            DataWidgets.Add(new WidgetDefinition
            {
                WidgetType = "CriticalSystems",
                Title = "Critical Systems",
                Description = "List of critical infrastructure components",
                Icon = "\uE968",
                IconColor = "#FFDC2626",
                DefaultRowSpan = 2,
                DefaultColumnSpan = 2
            });

            DataWidgets.Add(new WidgetDefinition
            {
                WidgetType = "ActiveAlerts",
                Title = "Active Alerts",
                Description = "Current system alerts and warnings",
                Icon = "\uE7E7",
                IconColor = "#FFEA580C",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 2
            });

            // Chart Widgets
            ChartWidgets.Add(new WidgetDefinition
            {
                WidgetType = "OSDistribution",
                Title = "OS Distribution",
                Description = "Operating system distribution pie chart",
                Icon = "\uE9A9",
                IconColor = "#FF059669",
                DefaultRowSpan = 2,
                DefaultColumnSpan = 2
            });

            ChartWidgets.Add(new WidgetDefinition
            {
                WidgetType = "DepartmentBreakdown",
                Title = "Department Breakdown",
                Description = "User distribution by department",
                Icon = "\uE9A9",
                IconColor = "#FF4F46E5",
                DefaultRowSpan = 2,
                DefaultColumnSpan = 2
            });

            ChartWidgets.Add(new WidgetDefinition
            {
                WidgetType = "TimelineChart",
                Title = "Discovery Timeline",
                Description = "Discovery progress over time",
                Icon = "\uE9A9",
                IconColor = "#FF7C3AED",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 2
            });

            // Utility Widgets
            UtilityWidgets.Add(new WidgetDefinition
            {
                WidgetType = "QuickActions",
                Title = "Quick Actions",
                Description = "Frequently used actions and shortcuts",
                Icon = "\uE8C6",
                IconColor = "#FF6B7280",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 1
            });

            UtilityWidgets.Add(new WidgetDefinition
            {
                WidgetType = "SystemStatus",
                Title = "System Status",
                Description = "Current system health and status",
                Icon = "\uE9A9",
                IconColor = "#FF059669",
                DefaultRowSpan = 1,
                DefaultColumnSpan = 1
            });

            UtilityWidgets.Add(new WidgetDefinition
            {
                WidgetType = "Notes",
                Title = "Notes",
                Description = "Personal notes and reminders",
                Icon = "\uE8A5",
                IconColor = "#FF7C3AED",
                DefaultRowSpan = 2,
                DefaultColumnSpan = 1
            });
        }

        private void LoadDefaultDashboard()
        {
            // Add some default widgets
            AddWidget(AnalyticsWidgets.First(w => w.WidgetType == "UserCount"), 0, 0);
            AddWidget(AnalyticsWidgets.First(w => w.WidgetType == "ComputerCount"), 0, 1);
            AddWidget(AnalyticsWidgets.First(w => w.WidgetType == "SecurityRisk"), 0, 2);
            AddWidget(ChartWidgets.First(w => w.WidgetType == "OSDistribution"), 1, 0);
            AddWidget(DataWidgets.First(w => w.WidgetType == "ActiveAlerts"), 0, 3);
            AddWidget(DataWidgets.First(w => w.WidgetType == "RecentUsers"), 1, 2);
        }

        private async Task LoadWidgetDataAsync(DashboardWidget widget)
        {
            await ExecuteAsync(async () =>
            {
                var profile = await _profileService.GetCurrentProfileAsync();
                if (profile == null) return;

                switch (widget.WidgetType)
                {
                    case "UserCount":
                        var users = await _dataService.LoadUsersAsync(profile.Name);
                        widget.Data = users.Count();
                        widget.FooterText = $"Last updated: {DateTime.Now:HH:mm}";
                        widget.HasFooter = true;
                        break;

                    case "ComputerCount":
                        var computers = await _dataService.LoadInfrastructureAsync(profile.Name);
                        widget.Data = computers.Count();
                        widget.FooterText = $"Last updated: {DateTime.Now:HH:mm}";
                        widget.HasFooter = true;
                        break;

                    case "SecurityRisk":
                        var riskScore = CalculateSecurityRisk(profile);
                        widget.Data = riskScore;
                        widget.FooterText = GetRiskLevel(riskScore);
                        widget.HasFooter = true;
                        break;

                    case "MigrationProgress":
                        var progress = CalculateMigrationProgress(profile);
                        widget.Data = progress;
                        widget.FooterText = $"{progress:P0} complete";
                        widget.HasFooter = true;
                        break;

                    case "RecentUsers":
                        var recentUsers = await _dataService.LoadUsersAsync(profile.Name);
                        widget.Data = recentUsers.Take(10).ToList();
                        break;

                    case "CriticalSystems":
                        var criticalSystems = await _dataService.LoadInfrastructureAsync(profile.Name);
                        widget.Data = criticalSystems.Where(c => c.IsCritical).Take(10).ToList();
                        break;

                    case "ActiveAlerts":
                        var alerts = GenerateActiveAlerts(profile);
                        widget.Data = alerts;
                        break;

                    case "OSDistribution":
                        var osData = await CalculateOSDistribution(profile);
                        widget.Data = osData;
                        break;

                    case "DepartmentBreakdown":
                        var deptData = await CalculateDepartmentBreakdown(profile);
                        widget.Data = deptData;
                        break;

                    case "TimelineChart":
                        var timelineData = GenerateTimelineData(profile);
                        widget.Data = timelineData;
                        break;

                    case "QuickActions":
                        widget.Data = GetQuickActions();
                        break;

                    case "SystemStatus":
                        var systemStatus = GetSystemStatus();
                        widget.Data = systemStatus;
                        break;

                    case "Notes":
                        widget.Data = LoadUserNotes();
                        break;
                }

            }, $"Loading data for {widget.Title}");
        }

        private async Task RefreshWidgetAsync(DashboardWidget widget)
        {
            await LoadWidgetDataAsync(widget);
            Logger?.LogInformation("Refreshed widget: {WidgetTitle}", widget.Title);
        }

        private void ShowWidgetSettings(DashboardWidget widget)
        {
            SendMessage(new NavigationMessage("WidgetSettings", widget));
        }

        private (int Row, int Column) FindNextAvailablePosition()
        {
            for (int row = 0; row < 4; row++)
            {
                for (int column = 0; column < 4; column++)
                {
                    if (!Widgets.Any(w => w.GridRow == row && w.GridColumn == column))
                    {
                        return (row, column);
                    }
                }
            }
            
            // If no space available, return 0,0 (will overlap)
            return (0, 0);
        }

        private void ToggleWidgetPalette()
        {
            ShowWidgetPalette = !ShowWidgetPalette;
        }

        private void ShowLayoutOptions()
        {
            SendMessage(new NavigationMessage("DashboardLayoutOptions"));
        }

        private async Task ExportDashboardAsync()
        {
            await ExecuteAsync(async () =>
            {
                // Export dashboard configuration and data
                Logger?.LogInformation("Exporting dashboard configuration");
                SendMessage(new StatusMessage("Dashboard export functionality not yet implemented", Messages.StatusType.Information));
                
            }, "Exporting dashboard");
        }

        private void ResetDashboard()
        {
            if (MessageBox.Show("Are you sure you want to reset the dashboard to default layout?", 
                "Reset Dashboard", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                Widgets.Clear();
                LoadDefaultDashboard();
                
                Logger?.LogInformation("Reset dashboard to default layout");
            }
        }

        // Helper methods for data calculations
        private int CalculateSecurityRisk(CompanyProfile profile)
        {
            // Simulate security risk calculation
            var random = new Random();
            return random.Next(1, 100);
        }

        private double CalculateMigrationProgress(CompanyProfile profile)
        {
            // Simulate migration progress calculation
            var random = new Random();
            return random.NextDouble() * 0.8; // 0-80% progress
        }

        private string GetRiskLevel(int riskScore)
        {
            return riskScore switch
            {
                <= 30 => "Low Risk",
                <= 70 => "Medium Risk",
                _ => "High Risk"
            };
        }

        private List<AlertItem> GenerateActiveAlerts(CompanyProfile profile)
        {
            return new List<AlertItem>
            {
                new AlertItem { Title = "Password Expiry Warning", Severity = "Medium", Count = 5 },
                new AlertItem { Title = "Stale Computer Accounts", Severity = "Low", Count = 12 },
                new AlertItem { Title = "Privileged Account Activity", Severity = "High", Count = 2 }
            };
        }

        private async Task<Dictionary<string, int>> CalculateOSDistribution(CompanyProfile profile)
        {
            var computers = await _dataService.LoadInfrastructureAsync(profile.Name);
            return computers.GroupBy(c => c.OperatingSystem)
                           .ToDictionary(g => g.Key ?? "Unknown", g => g.Count());
        }

        private async Task<Dictionary<string, int>> CalculateDepartmentBreakdown(CompanyProfile profile)
        {
            var users = await _dataService.LoadUsersAsync(profile.Name);
            return users.GroupBy(u => u.Department)
                       .ToDictionary(g => g.Key ?? "Unknown", g => g.Count());
        }

        private List<TimelineDataPoint> GenerateTimelineData(CompanyProfile profile)
        {
            var data = new List<TimelineDataPoint>();
            var startDate = DateTime.Now.AddDays(-30);
            
            for (int i = 0; i < 30; i++)
            {
                data.Add(new TimelineDataPoint
                {
                    Date = startDate.AddDays(i),
                    Value = new Random().Next(0, 100)
                });
            }
            
            return data;
        }

        private List<QuickAction> GetQuickActions()
        {
            return new List<QuickAction>
            {
                new QuickAction { Id = "RunDiscovery", DisplayText = "Run Discovery", Tooltip = "Start discovery process" },
                new QuickAction { Id = "ExportData", DisplayText = "Export Data", Tooltip = "Export discovery data" },
                new QuickAction { Id = "ViewReports", DisplayText = "View Reports", Tooltip = "View discovery reports" }
            };
        }

        private SystemStatusInfo GetSystemStatus()
        {
            return new SystemStatusInfo
            {
                Status = "Healthy",
                LastCheck = DateTime.Now,
                ActiveConnections = 5,
                MemoryUsage = 68,
                DiskUsage = 45
            };
        }

        private string LoadUserNotes()
        {
            return "Add your notes here...";
        }

        #endregion
    }

    #region Supporting Classes

    public class DashboardWidget : BaseViewModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public string IconColor { get; set; }
        public string WidgetType { get; set; }
        public int GridRow { get; set; }
        public int GridColumn { get; set; }
        public int GridRowSpan { get; set; } = 1;
        public int GridColumnSpan { get; set; } = 1;
        public object Data { get; set; }
        public bool HasFooter { get; set; }
        public string FooterText { get; set; }

        public ICommand RefreshCommand { get; set; }
        public ICommand SettingsCommand { get; set; }
        public ICommand RemoveCommand { get; set; }
    }

    public class WidgetDefinition
    {
        public string WidgetType { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string IconColor { get; set; }
        public int DefaultRowSpan { get; set; } = 1;
        public int DefaultColumnSpan { get; set; } = 1;
    }

    public class DropZone
    {
        public int Row { get; set; }
        public int Column { get; set; }
    }

    public class AlertItem
    {
        public string Title { get; set; }
        public string Severity { get; set; }
        public int Count { get; set; }
    }

    public class TimelineDataPoint
    {
        public DateTime Date { get; set; }
        public int Value { get; set; }
    }

    public class SystemStatusInfo
    {
        public string Status { get; set; }
        public DateTime LastCheck { get; set; }
        public int ActiveConnections { get; set; }
        public int MemoryUsage { get; set; }
        public int DiskUsage { get; set; }
    }

    #endregion
}