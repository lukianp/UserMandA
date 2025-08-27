using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Views;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Unified ViewModel for the Management Hub that orchestrates all management views
    /// </summary>
    public class ManagementHubViewModel : BaseViewModel
    {
        private MigrationProject _currentProject;
        private object _selectedViewModel;
        private string _activeTab = "Dashboard";

        // Sub-ViewModels
        private ManagementDashboardViewModel _dashboardViewModel;
        private GanttViewModel _ganttViewModel;
        private ProjectManagementViewModel _projectManagementViewModel;
        private WaveViewModel _waveViewModel;

        public ManagementHubViewModel(ILogger<ManagementHubViewModel> logger) : base(logger)
        {
            InitializeProject();
            InitializeViewModels();
            InitializeCommands();
            
            // Set default view
            SelectedViewModel = DashboardViewModel;
        }

        #region Properties

        public MigrationProject CurrentProject
        {
            get => _currentProject;
            set
            {
                if (SetProperty(ref _currentProject, value))
                {
                    UpdateSubViewModels();
                }
            }
        }

        public object SelectedViewModel
        {
            get => _selectedViewModel;
            set => SetProperty(ref _selectedViewModel, value);
        }

        public string ActiveTab
        {
            get => _activeTab;
            set => SetProperty(ref _activeTab, value);
        }

        // Sub-ViewModels
        public ManagementDashboardViewModel DashboardViewModel
        {
            get => _dashboardViewModel;
            set => SetProperty(ref _dashboardViewModel, value);
        }

        public GanttViewModel GanttViewModel
        {
            get => _ganttViewModel;
            set => SetProperty(ref _ganttViewModel, value);
        }

        public ProjectManagementViewModel ProjectManagementViewModel
        {
            get => _projectManagementViewModel;
            set => SetProperty(ref _projectManagementViewModel, value);
        }

        public WaveViewModel WaveViewModel
        {
            get => _waveViewModel;
            set => SetProperty(ref _waveViewModel, value);
        }

        // Quick access properties for header display
        public string OverallProgressText => DashboardViewModel?.OverallProgressText ?? "0%";
        public string ProjectName => CurrentProject?.ProjectName ?? "M&A Integration Project";
        public string CurrentPhase => DashboardViewModel?.CurrentPhase ?? "Planning";

        /// <summary>
        /// Collection of management hub items
        /// </summary>
        public ObservableCollection<object> Items { get; } = new ObservableCollection<object>();

        /// <summary>
        /// Whether the view has data to display
        /// </summary>
        public override bool HasData => Items?.Count > 0;

        #endregion

        #region Commands

        public ICommand NavigateCommand { get; private set; }
        public ICommand RefreshCommand { get; private set; }

        #endregion

        #region Unified Loading Pipeline

        /// <summary>
        /// Loads management hub data using the unified loading pipeline
        /// </summary>
        public override async Task LoadAsync()
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            try
            {
                IsLoading = true;
                LastError = null;
                HasErrors = false;
                RaiseAllLoadingProperties();

                // Clear existing data
                System.Windows.Application.Current.Dispatcher.Invoke(() => Items.Clear());

                // Initialize or refresh project data
                if (CurrentProject == null)
                {
                    InitializeProject();
                }

                // Update all sub-viewmodels
                UpdateSubViewModels();

                // Create summary items for the hub
                var hubItems = new object[]
                {
                    new { 
                        Name = "Project Dashboard", 
                        Status = "Active", 
                        Progress = DashboardViewModel?.OverallProgress ?? 0,
                        Description = "Overall project metrics and KPIs",
                        LastUpdated = DateTime.Now
                    },
                    new { 
                        Name = "Gantt Chart", 
                        Status = "Active", 
                        Progress = 100,
                        Description = "Project timeline and critical path analysis",
                        LastUpdated = DateTime.Now
                    },
                    new { 
                        Name = "Wave Management", 
                        Status = "Active", 
                        Progress = WaveViewModel?.GetOverallWaveProgress() ?? 0,
                        Description = "Migration wave planning and execution",
                        LastUpdated = DateTime.Now
                    },
                    new { 
                        Name = "Risk Management", 
                        Status = "Active", 
                        Progress = CalculateRiskManagementProgress(),
                        Description = "Risk identification and mitigation tracking",
                        LastUpdated = DateTime.Now
                    }
                };

                System.Windows.Application.Current.Dispatcher.Invoke(() =>
                {
                    foreach (var item in hubItems)
                        Items.Add(item);
                    RaiseAllLoadingProperties();
                });

                // Simulate some loading time for demonstration
                await Task.Delay(500);
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
                HasErrors = true;
                Logger?.LogError(ex, "Failed to load management hub data");
                RaiseAllLoadingProperties();
            }
            finally
            {
                IsLoading = false;
                RaiseAllLoadingProperties();
                Logger?.LogInformation($"Management hub loaded in {sw.ElapsedMilliseconds}ms");
            }
        }

        #endregion

        #region Private Methods

        private new void InitializeCommands()
        {
            NavigateCommand = new RelayCommand<string>(ExecuteNavigate);
            RefreshCommand = new AsyncRelayCommand(LoadAsync);
        }

        private void ExecuteNavigate(string viewName)
        {
            try
            {
                Logger?.LogDebug($"Navigation Attempt: viewName={viewName}, Current ActiveTab={ActiveTab}");

                ActiveTab = viewName ?? "Dashboard";

                switch (viewName?.ToLower())
                {
                    case "dashboard":
                        Logger?.LogDebug($"Navigating to Dashboard. DashboardViewModel null: {DashboardViewModel == null}");
                        SelectedViewModel = DashboardViewModel;
                        break;
                    case "gantt":
                        // Ensure the Gantt chart data is refreshed when navigating to it
                        if (GanttViewModel != null)
                        {
                            GanttViewModel.UpdateGantt();
                        }
                        SelectedViewModel = GanttViewModel;
                        break;
                    case "projectdetails":
                        SelectedViewModel = ProjectManagementViewModel;
                        break;
                    case "waves":
                        SelectedViewModel = WaveViewModel;
                        break;
                    case "risks":
                        // For now, use dashboard view which includes risk overview
                        SelectedViewModel = DashboardViewModel;
                        break;
                    default:
                        SelectedViewModel = DashboardViewModel;
                        break;
                }

                // Update header properties
                OnPropertyChanged(nameof(OverallProgressText));
                OnPropertyChanged(nameof(CurrentPhase));
                
                Logger?.LogInformation($"Navigated to view: {viewName}, SelectedViewModel: {SelectedViewModel?.GetType().Name}");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, $"Failed to navigate to view: {viewName}");
            }
        }

        private void InitializeProject()
        {
            try
            {
                // Create a comprehensive sample project
                CurrentProject = new MigrationProject
                {
                    ProjectName = "TechCorp M&A Integration",
                    Description = "Complete integration of TechCorp acquisition including systems, users, and processes",
                    StartDate = DateTime.Today.AddDays(-30),
                    EndDate = DateTime.Today.AddDays(120),
                    OverallProgress = 35.5
                };

                // Initialize with standard project management phases
                CurrentProject.InitializeWithStandardPhases();

                // Add comprehensive stakeholders
                CurrentProject.Stakeholders.AddRange(new[]
                {
                    "John Smith - Project Manager",
                    "Sarah Johnson - Technical Lead", 
                    "Mike Chen - Business Analyst",
                    "Lisa Davis - Change Management Lead",
                    "Tom Wilson - Infrastructure Lead",
                    "Amy Rodriguez - Security Specialist",
                    "David Park - Application Migration Lead",
                    "Jennifer Lee - Data Migration Specialist"
                });

                // Add detailed risks
                CurrentProject.Risks.AddRange(new[]
                {
                    new RiskItem
                    {
                        Description = "Legacy system compatibility issues may cause migration delays",
                        Severity = RiskSeverity.High,
                        Mitigation = "Conduct thorough compatibility testing and develop fallback procedures"
                    },
                    new RiskItem
                    {
                        Description = "User resistance to new systems and processes",
                        Severity = RiskSeverity.Medium,
                        Mitigation = "Implement comprehensive change management and training program"
                    },
                    new RiskItem
                    {
                        Description = "Data integrity issues during migration",
                        Severity = RiskSeverity.High,
                        Mitigation = "Implement data validation checkpoints and rollback procedures"
                    },
                    new RiskItem
                    {
                        Description = "Network bandwidth limitations affecting migration timeline",
                        Severity = RiskSeverity.Medium,
                        Mitigation = "Upgrade network infrastructure and schedule migrations during off-peak hours"
                    },
                    new RiskItem
                    {
                        Description = "Regulatory compliance gaps in integrated environment",
                        Severity = RiskSeverity.High,
                        Mitigation = "Engage compliance experts and conduct regulatory impact assessment"
                    }
                });

                // Add migration waves
                AddMigrationWaves();
                
                // Calculate initial progress
                CurrentProject.CalculateOverallProgress();
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Failed to initialize project");
            }
        }

        private void AddMigrationWaves()
        {
            var waves = new[]
            {
                new MigrationProjectWave
                {
                    Name = "Wave 1 - Infrastructure & Core Services",
                    Description = "Migration of core infrastructure services including Active Directory, DNS, and networking",
                    StartDate = CurrentProject.StartDate.AddDays(20),
                    EndDate = CurrentProject.StartDate.AddDays(45),
                    Status = WaveStatus.Active,
                    Progress = 65
                },
                new MigrationProjectWave
                {
                    Name = "Wave 2 - Business Applications",
                    Description = "Migration of critical business applications and databases",
                    StartDate = CurrentProject.StartDate.AddDays(40),
                    EndDate = CurrentProject.StartDate.AddDays(70),
                    Status = WaveStatus.Planned,
                    Progress = 10
                },
                new MigrationProjectWave
                {
                    Name = "Wave 3 - User Migration",
                    Description = "Migration of user accounts, mailboxes, and personal data",
                    StartDate = CurrentProject.StartDate.AddDays(60),
                    EndDate = CurrentProject.StartDate.AddDays(85),
                    Status = WaveStatus.Planned,
                    Progress = 0
                },
                new MigrationProjectWave
                {
                    Name = "Wave 4 - Legacy System Decommission",
                    Description = "Decommissioning of legacy systems and final cleanup",
                    StartDate = CurrentProject.StartDate.AddDays(90),
                    EndDate = CurrentProject.StartDate.AddDays(120),
                    Status = WaveStatus.Planned,
                    Progress = 0
                }
            };

            foreach (var wave in waves)
            {
                // Add sample users to each wave
                wave.AssignedUsers.AddRange(new[]
                {
                    new User { Name = "Technical Lead", Role = "Lead Engineer" },
                    new User { Name = "Migration Specialist", Role = "Migration Engineer" },
                    new User { Name = "QA Engineer", Role = "Quality Assurance" }
                });

                CurrentProject.Waves.Add(wave);
            }
        }

        private void InitializeViewModels()
        {
            try
            {
                // Initialize all sub-viewmodels with the current project
                DashboardViewModel = new ManagementDashboardViewModel(CurrentProject);
                GanttViewModel = new GanttViewModel(CurrentProject);
                ProjectManagementViewModel = new ProjectManagementViewModel();

                // Create logger for WaveViewModel
                var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddDebug());
                var waveLogger = loggerFactory.CreateLogger<WaveViewModel>();
                WaveViewModel = new WaveViewModel(CurrentProject, waveLogger);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Failed to initialize view models");
            }
        }

        private void UpdateSubViewModels()
        {
            try
            {
                if (CurrentProject == null) return;

                // Update all sub-viewmodels with the current project
                if (DashboardViewModel != null)
                    DashboardViewModel.CurrentProject = CurrentProject;

                if (GanttViewModel != null)
                    GanttViewModel.Project = CurrentProject;

                if (WaveViewModel != null)
                    WaveViewModel.CurrentProject = CurrentProject;

                // Update header display properties
                OnPropertyChanged(nameof(OverallProgressText));
                OnPropertyChanged(nameof(ProjectName));
                OnPropertyChanged(nameof(CurrentPhase));
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Failed to update sub-view models");
            }
        }

        private double CalculateRiskManagementProgress()
        {
            if (CurrentProject?.Risks == null || CurrentProject.Risks.Count == 0)
                return 100; // No risks is 100% complete

            var mitigatedRisks = 0;
            foreach (var risk in CurrentProject.Risks)
            {
                // Count risks that have mitigation plans as "managed"
                if (!string.IsNullOrEmpty(risk.Mitigation))
                    mitigatedRisks++;
            }

            return (double)mitigatedRisks / CurrentProject.Risks.Count * 100;
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                DashboardViewModel?.Dispose();
                GanttViewModel?.Dispose();
                ProjectManagementViewModel?.Dispose();
                WaveViewModel?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}