using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Health Score Visualization functionality
    /// </summary>
    public class HealthScoreVisualizationViewModel : BaseViewModel
    {
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        
        private DateTime _lastAssessmentDate = DateTime.Now;
        private int _totalSystems = 0;
        private int _healthySystems = 0;
        private int _atRiskSystems = 0;
        private int _criticalIssues = 0;

        public HealthScoreVisualizationViewModel(
            ILogger<HealthScoreVisualizationViewModel> logger,
            IMessenger messenger,
            IDataService dataService,
            IProfileService profileService) : base(logger, messenger)
        {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            HighPriorityRisks = new ObservableCollection<RiskItem>();
            Recommendations = new ObservableCollection<RecommendationItem>();

            InitializeCommands();
            LoadHealthScoresAsync();
        }

        #region Properties

        public ObservableCollection<RiskItem> HighPriorityRisks { get; }
        public ObservableCollection<RecommendationItem> Recommendations { get; }

        public DateTime LastAssessmentDate
        {
            get => _lastAssessmentDate;
            set => SetProperty(ref _lastAssessmentDate, value);
        }

        public int TotalSystems
        {
            get => _totalSystems;
            set => SetProperty(ref _totalSystems, value);
        }

        public int HealthySystems
        {
            get => _healthySystems;
            set => SetProperty(ref _healthySystems, value);
        }

        public int AtRiskSystems
        {
            get => _atRiskSystems;
            set => SetProperty(ref _atRiskSystems, value);
        }

        public int CriticalIssues
        {
            get => _criticalIssues;
            set => SetProperty(ref _criticalIssues, value);
        }

        // Health Score Gauges
        public HealthScoreGauge OverallHealthScore { get; private set; }
        public HealthScoreGauge SecurityScore { get; private set; }
        public HealthScoreGauge MigrationReadinessScore { get; private set; }
        public HealthScoreGauge ComplianceScore { get; private set; }

        // Trend Chart
        public HealthTrendChart HealthTrendChart { get; private set; }

        #endregion

        #region Commands

        public ICommand RefreshAssessmentCommand { get; private set; }
        public ICommand GenerateReportCommand { get; private set; }
        public ICommand ExportDataCommand { get; private set; }
        public ICommand ViewDetailedReportCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            
            RefreshAssessmentCommand = new AsyncRelayCommand(RefreshAssessmentAsync);
            GenerateReportCommand = new AsyncRelayCommand(GenerateReportAsync);
            ExportDataCommand = new AsyncRelayCommand(ExportDataAsync);
            ViewDetailedReportCommand = new RelayCommand(ViewDetailedReport);
        }

        #endregion

        #region Public Methods

        public async Task LoadHealthScoresAsync()
        {
            await ExecuteAsync(async () =>
            {
                var profile = await _profileService.GetCurrentProfileAsync();
                if (profile == null) return;

                // Load data for assessment
                var users = await _dataService.LoadUsersAsync(profile.Name);
                var infrastructure = await _dataService.LoadInfrastructureAsync(profile.Name);
                var groups = await _dataService.LoadGroupsAsync(profile.Name);
                var applications = await _dataService.LoadApplicationsAsync(profile.Name);

                // Calculate scores
                var overallScore = CalculateOverallHealthScore(users, infrastructure, groups, applications);
                var securityScore = CalculateSecurityScore(users, infrastructure);
                var migrationScore = CalculateMigrationReadinessScore(infrastructure, applications);
                var complianceScore = CalculateComplianceScore(users, groups);

                // Create health score gauges
                OverallHealthScore = CreateHealthScoreGauge("Overall Health", overallScore, 
                    GetScoreColor(overallScore), GetOverallHealthDetails(users, infrastructure));

                SecurityScore = CreateHealthScoreGauge("Security", securityScore, 
                    GetScoreColor(securityScore), GetSecurityDetails(users, infrastructure));

                MigrationReadinessScore = CreateHealthScoreGauge("Migration Readiness", migrationScore, 
                    GetScoreColor(migrationScore), GetMigrationDetails(infrastructure, applications));

                ComplianceScore = CreateHealthScoreGauge("Compliance", complianceScore, 
                    GetScoreColor(complianceScore), GetComplianceDetails(users, groups));

                // Update summary statistics
                TotalSystems = infrastructure.Count() + applications.Count();
                HealthySystems = (int)(TotalSystems * (overallScore / 100.0));
                AtRiskSystems = TotalSystems - HealthySystems - CriticalIssues;
                CriticalIssues = CalculateCriticalIssues(users, infrastructure);

                // Load trend chart
                HealthTrendChart = CreateHealthTrendChart();

                // Load risks and recommendations
                LoadHighPriorityRisks(users, infrastructure, applications);
                LoadRecommendations(overallScore, securityScore, migrationScore, complianceScore);

                LastAssessmentDate = DateTime.Now;

                // Notify property changes
                OnPropertyChanged(nameof(OverallHealthScore));
                OnPropertyChanged(nameof(SecurityScore));
                OnPropertyChanged(nameof(MigrationReadinessScore));
                OnPropertyChanged(nameof(ComplianceScore));
                OnPropertyChanged(nameof(HealthTrendChart));

            }, "Loading health scores");
        }

        #endregion

        #region Private Methods

        private int CalculateOverallHealthScore(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure, 
            IEnumerable<GroupData> groups, IEnumerable<ApplicationData> applications)
        {
            var factors = new List<double>();

            // User health factors
            var userList = users.ToList();
            if (userList.Any())
            {
                var enabledUsers = userList.Count(u => u.Enabled);
                var userHealthFactor = (double)enabledUsers / userList.Count * 100;
                factors.Add(userHealthFactor);

                var recentActivity = userList.Count(u => u.LastLogonDate > DateTime.Now.AddDays(-30));
                var activityFactor = (double)recentActivity / userList.Count * 100;
                factors.Add(activityFactor);
            }

            // Infrastructure health factors
            var infraList = infrastructure.ToList();
            if (infraList.Any())
            {
                var onlineSystems = infraList.Count(i => i.IsOnline);
                var infraHealthFactor = (double)onlineSystems / infraList.Count * 100;
                factors.Add(infraHealthFactor);

                var updatedSystems = infraList.Count(i => i.LastUpdateDate > DateTime.Now.AddDays(-90));
                var updateFactor = (double)updatedSystems / infraList.Count * 100;
                factors.Add(updateFactor);
            }

            // Application health factors
            var appList = applications.ToList();
            if (appList.Any())
            {
                var currentApps = appList.Count(a => !a.IsOutdated);
                var appHealthFactor = (double)currentApps / appList.Count * 100;
                factors.Add(appHealthFactor);
            }

            return factors.Any() ? (int)factors.Average() : 75; // Default score
        }

        private int CalculateSecurityScore(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure)
        {
            var factors = new List<double>();

            var userList = users.ToList();
            if (userList.Any())
            {
                // Password policy compliance
                var validPasswords = userList.Count(u => u.PasswordExpiryDate > DateTime.Now.AddDays(30));
                var passwordFactor = (double)validPasswords / userList.Count * 100;
                factors.Add(passwordFactor);

                // Privileged account management
                var privilegedUsers = userList.Count(u => u.IsPrivileged);
                var privilegedFactor = Math.Max(0, 100 - (privilegedUsers * 5)); // Penalty for too many privileged users
                factors.Add(privilegedFactor);
            }

            var infraList = infrastructure.ToList();
            if (infraList.Any())
            {
                // System patching
                var patchedSystems = infraList.Count(i => i.LastUpdateDate > DateTime.Now.AddDays(-30));
                var patchFactor = (double)patchedSystems / infraList.Count * 100;
                factors.Add(patchFactor);
            }

            return factors.Any() ? (int)factors.Average() : 70;
        }

        private int CalculateMigrationReadinessScore(IEnumerable<InfrastructureData> infrastructure, IEnumerable<ApplicationData> applications)
        {
            var factors = new List<double>();

            // Infrastructure readiness
            var infraList = infrastructure.ToList();
            if (infraList.Any())
            {
                var supportedSystems = infraList.Count(i => i.IsSupported);
                var supportFactor = (double)supportedSystems / infraList.Count * 100;
                factors.Add(supportFactor);
            }

            // Application compatibility
            var appList = applications.ToList();
            if (appList.Any())
            {
                var compatibleApps = appList.Count(a => a.IsCompatible);
                var compatibilityFactor = (double)compatibleApps / appList.Count * 100;
                factors.Add(compatibilityFactor);
            }

            return factors.Any() ? (int)factors.Average() : 65;
        }

        private int CalculateComplianceScore(IEnumerable<UserData> users, IEnumerable<GroupData> groups)
        {
            var factors = new List<double>();

            // User compliance
            var userList = users.ToList();
            if (userList.Any())
            {
                var compliantUsers = userList.Count(u => !string.IsNullOrEmpty(u.Department) && !string.IsNullOrEmpty(u.Title));
                var complianceFactor = (double)compliantUsers / userList.Count * 100;
                factors.Add(complianceFactor);
            }

            // Group management
            var groupList = groups.ToList();
            if (groupList.Any())
            {
                var managedGroups = groupList.Count(g => g.MemberCount > 0 && !string.IsNullOrEmpty(g.Description));
                var groupFactor = (double)managedGroups / groupList.Count * 100;
                factors.Add(groupFactor);
            }

            return factors.Any() ? (int)factors.Average() : 80;
        }

        private string GetScoreColor(int score)
        {
            return score switch
            {
                >= 80 => "#FF10B981", // Green
                >= 60 => "#FFEA580C", // Orange
                _ => "#FFDC2626"      // Red
            };
        }

        private HealthScoreGauge CreateHealthScoreGauge(string title, int score, string color, List<HealthDetail> details)
        {
            return new HealthScoreGauge
            {
                Title = title,
                Score = score.ToString(),
                ScoreLabel = GetScoreLabel(score),
                ScoreColor = color,
                ArcGeometry = CreateArcGeometry(score),
                Details = details
            };
        }

        private string GetScoreLabel(int score)
        {
            return score switch
            {
                >= 90 => "Excellent",
                >= 80 => "Good",
                >= 70 => "Fair",
                >= 60 => "Poor",
                _ => "Critical"
            };
        }

        private string CreateArcGeometry(int score)
        {
            // Create SVG path for the arc based on score percentage
            var angle = (score / 100.0) * 270; // 270 degrees for 3/4 circle
            var startAngle = 135; // Start from bottom-left
            var endAngle = startAngle + angle;
            
            var centerX = 60;
            var centerY = 60;
            var radius = 52;
            
            var startX = centerX + radius * Math.Cos(startAngle * Math.PI / 180);
            var startY = centerY + radius * Math.Sin(startAngle * Math.PI / 180);
            var endX = centerX + radius * Math.Cos(endAngle * Math.PI / 180);
            var endY = centerY + radius * Math.Sin(endAngle * Math.PI / 180);
            
            var largeArc = angle > 180 ? 1 : 0;
            
            return $"M {startX:F1},{startY:F1} A {radius},{radius} 0 {largeArc},1 {endX:F1},{endY:F1}";
        }

        private List<HealthDetail> GetOverallHealthDetails(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure)
        {
            return new List<HealthDetail>
            {
                new HealthDetail { Label = "Total Users", Value = users.Count().ToString() },
                new HealthDetail { Label = "Active Users", Value = users.Count(u => u.Enabled).ToString() },
                new HealthDetail { Label = "Systems Online", Value = infrastructure.Count(i => i.IsOnline).ToString() },
                new HealthDetail { Label = "Last Check", Value = DateTime.Now.ToString("HH:mm") }
            };
        }

        private List<HealthDetail> GetSecurityDetails(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure)
        {
            return new List<HealthDetail>
            {
                new HealthDetail { Label = "Password Alerts", Value = users.Count(u => u.PasswordExpiryDate <= DateTime.Now.AddDays(30)).ToString() },
                new HealthDetail { Label = "Privileged Users", Value = users.Count(u => u.IsPrivileged).ToString() },
                new HealthDetail { Label = "Unpatched Systems", Value = infrastructure.Count(i => i.LastUpdateDate <= DateTime.Now.AddDays(-30)).ToString() },
                new HealthDetail { Label = "Security Scan", Value = "Passed" }
            };
        }

        private List<HealthDetail> GetMigrationDetails(IEnumerable<InfrastructureData> infrastructure, IEnumerable<ApplicationData> applications)
        {
            return new List<HealthDetail>
            {
                new HealthDetail { Label = "Ready Systems", Value = infrastructure.Count(i => i.IsSupported).ToString() },
                new HealthDetail { Label = "Compatible Apps", Value = applications.Count(a => a.IsCompatible).ToString() },
                new HealthDetail { Label = "Migration Waves", Value = "3 Planned" },
                new HealthDetail { Label = "Est. Duration", Value = "6 months" }
            };
        }

        private List<HealthDetail> GetComplianceDetails(IEnumerable<UserData> users, IEnumerable<GroupData> groups)
        {
            return new List<HealthDetail>
            {
                new HealthDetail { Label = "Policy Compliance", Value = "98%" },
                new HealthDetail { Label = "Data Classification", Value = "Complete" },
                new HealthDetail { Label = "Access Reviews", Value = "Current" },
                new HealthDetail { Label = "Audit Ready", Value = "Yes" }
            };
        }

        private int CalculateCriticalIssues(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure)
        {
            var issues = 0;
            issues += users.Count(u => u.PasswordExpiryDate <= DateTime.Now); // Expired passwords
            issues += infrastructure.Count(i => !i.IsOnline && i.IsCritical); // Critical systems offline
            return issues;
        }

        private HealthTrendChart CreateHealthTrendChart()
        {
            var dataPoints = new List<TrendDataPoint>();
            var gridLines = new List<GridLine>();
            
            // Generate sample trend data for the last 30 days
            var random = new Random();
            for (int i = 29; i >= 0; i--)
            {
                var date = DateTime.Now.AddDays(-i);
                var score = 70 + random.Next(-10, 15); // Simulate score variation
                
                dataPoints.Add(new TrendDataPoint
                {
                    Date = date,
                    Score = score,
                    X = (29 - i) * 15, // 15 pixels per day
                    Y = 200 - (score * 2), // Invert Y for display
                    Color = GetScoreColor(score),
                    ToolTip = $"{date:MMM dd}: {score}%"
                });
            }

            // Create grid lines
            for (int i = 0; i <= 10; i++)
            {
                gridLines.Add(new GridLine
                {
                    X = 0,
                    Y = i * 20,
                    Width = 450,
                    Height = 0
                });
            }

            // Create trend path
            var pathData = "M " + string.Join(" L ", dataPoints.Select(p => $"{p.X},{p.Y}"));

            return new HealthTrendChart
            {
                Title = "Health Score Trend (30 Days)",
                DataPoints = dataPoints,
                GridLines = gridLines,
                TrendPath = pathData,
                TrendColor = "#FF4F46E5"
            };
        }

        private void LoadHighPriorityRisks(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure, IEnumerable<ApplicationData> applications)
        {
            HighPriorityRisks.Clear();

            // Password expiry risks
            var expiredPasswords = users.Count(u => u.PasswordExpiryDate <= DateTime.Now.AddDays(7));
            if (expiredPasswords > 0)
            {
                HighPriorityRisks.Add(new RiskItem
                {
                    Title = "Password Expiry Warning",
                    Description = $"{expiredPasswords} users have passwords expiring within 7 days",
                    SeverityColor = "#FFEA580C",
                    ImpactScore = "Medium",
                    ImpactColor = "#FFEA580C",
                    ViewDetailsCommand = new RelayCommand(() => ViewRiskDetails("PasswordExpiry"))
                });
            }

            // Offline critical systems
            var offlineCritical = infrastructure.Count(i => !i.IsOnline && i.IsCritical);
            if (offlineCritical > 0)
            {
                HighPriorityRisks.Add(new RiskItem
                {
                    Title = "Critical Systems Offline",
                    Description = $"{offlineCritical} critical systems are currently offline",
                    SeverityColor = "#FFDC2626",
                    ImpactScore = "High",
                    ImpactColor = "#FFDC2626",
                    ViewDetailsCommand = new RelayCommand(() => ViewRiskDetails("CriticalOffline"))
                });
            }

            // Outdated applications
            var outdatedApps = applications.Count(a => a.IsOutdated);
            if (outdatedApps > 0)
            {
                HighPriorityRisks.Add(new RiskItem
                {
                    Title = "Outdated Applications",
                    Description = $"{outdatedApps} applications require updates for security and compatibility",
                    SeverityColor = "#FFEA580C",
                    ImpactScore = "Medium",
                    ImpactColor = "#FFEA580C",
                    ViewDetailsCommand = new RelayCommand(() => ViewRiskDetails("OutdatedApps"))
                });
            }

            // Privileged account risks
            var excessivePrivileged = users.Count(u => u.IsPrivileged);
            if (excessivePrivileged > users.Count() * 0.1) // More than 10% privileged
            {
                HighPriorityRisks.Add(new RiskItem
                {
                    Title = "Excessive Privileged Accounts",
                    Description = $"{excessivePrivileged} privileged accounts may pose security risks",
                    SeverityColor = "#FFDC2626",
                    ImpactScore = "High",
                    ImpactColor = "#FFDC2626",
                    ViewDetailsCommand = new RelayCommand(() => ViewRiskDetails("PrivilegedAccounts"))
                });
            }
        }

        private void LoadRecommendations(int overallScore, int securityScore, int migrationScore, int complianceScore)
        {
            Recommendations.Clear();

            if (securityScore < 80)
            {
                Recommendations.Add(new RecommendationItem
                {
                    Priority = "1",
                    PriorityColor = "#FFDC2626",
                    Title = "Improve Security Posture",
                    Description = "Implement multi-factor authentication and review privileged account assignments"
                });
            }

            if (migrationScore < 70)
            {
                Recommendations.Add(new RecommendationItem
                {
                    Priority = "2",
                    PriorityColor = "#FFEA580C",
                    Title = "Address Migration Blockers",
                    Description = "Update incompatible applications and validate system requirements"
                });
            }

            if (overallScore < 75)
            {
                Recommendations.Add(new RecommendationItem
                {
                    Priority = "3",
                    PriorityColor = "#FF059669",
                    Title = "System Health Maintenance",
                    Description = "Schedule regular system updates and implement monitoring for critical systems"
                });
            }

            Recommendations.Add(new RecommendationItem
            {
                Priority = "4",
                PriorityColor = "#FF4F46E5",
                Title = "Regular Health Assessments",
                Description = "Schedule weekly health assessments to track progress and identify emerging issues"
            });
        }

        private async Task RefreshAssessmentAsync()
        {
            await LoadHealthScoresAsync();
            Logger?.LogInformation("Health assessment refreshed");
        }

        private async Task GenerateReportAsync()
        {
            await ExecuteAsync(async () =>
            {
                Logger?.LogInformation("Generating health assessment report");
                SendMessage(new StatusMessage("Report generation functionality not yet implemented", StatusType.Information));
                
            }, "Generating report");
        }

        private async Task ExportDataAsync()
        {
            await ExecuteAsync(async () =>
            {
                Logger?.LogInformation("Exporting health assessment data");
                SendMessage(new StatusMessage("Export functionality not yet implemented", StatusType.Information));
                
            }, "Exporting data");
        }

        private void ViewDetailedReport()
        {
            SendMessage(new NavigationMessage("DetailedHealthReport"));
        }

        private void ViewRiskDetails(string riskType)
        {
            SendMessage(new NavigationMessage("RiskDetails", riskType));
        }

        #endregion
    }

    #region Supporting Classes

    public class HealthScoreGauge
    {
        public string Title { get; set; }
        public string Score { get; set; }
        public string ScoreLabel { get; set; }
        public string ScoreColor { get; set; }
        public string ArcGeometry { get; set; }
        public List<HealthDetail> Details { get; set; } = new List<HealthDetail>();
    }

    public class HealthDetail
    {
        public string Label { get; set; }
        public string Value { get; set; }
    }

    public class HealthTrendChart
    {
        public string Title { get; set; }
        public List<TrendDataPoint> DataPoints { get; set; } = new List<TrendDataPoint>();
        public List<GridLine> GridLines { get; set; } = new List<GridLine>();
        public string TrendPath { get; set; }
        public string TrendColor { get; set; }
    }

    public class TrendDataPoint
    {
        public DateTime Date { get; set; }
        public int Score { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public string Color { get; set; }
        public string ToolTip { get; set; }
    }

    public class GridLine
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Width { get; set; }
        public double Height { get; set; }
    }

    public class RiskItem
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string SeverityColor { get; set; }
        public string ImpactScore { get; set; }
        public string ImpactColor { get; set; }
        public ICommand ViewDetailsCommand { get; set; }
    }

    public class RecommendationItem
    {
        public string Priority { get; set; }
        public string PriorityColor { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }

    #endregion
}