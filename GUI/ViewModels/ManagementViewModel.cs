using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Main ViewModel for the Migration Management module
    /// </summary>
    public class ManagementViewModel : BaseViewModel
    {
        private MigrationProject _currentProject;
        private ManagementDashboardViewModel _dashboardViewModel;
        private GanttViewModel _ganttViewModel;
        private WaveViewModel _waveViewModel;
        private object _selectedViewModel;

        public ManagementViewModel(ILogger<ManagementViewModel> logger) : base(logger)
        {
            InitializeProject();
            InitializeViewModels();
            
            // Commands
            NavigateCommand = new RelayCommand<string>(ExecuteNavigate);
            
            // Set default view
            SelectedViewModel = DashboardViewModel;
        }

        #region Properties

        public MigrationProject CurrentProject
        {
            get => _currentProject;
            set => SetProperty(ref _currentProject, value);
        }

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

        public WaveViewModel WaveViewModel
        {
            get => _waveViewModel;
            set => SetProperty(ref _waveViewModel, value);
        }

        public object SelectedViewModel
        {
            get => _selectedViewModel;
            set => SetProperty(ref _selectedViewModel, value);
        }

        /// <summary>
        /// Collection of management data items
        /// </summary>
        public ObservableCollection<object> Items { get; } = new ObservableCollection<object>();

        /// <summary>
        /// Whether the view has data to display
        /// </summary>
        public override bool HasData => Items?.Count > 0;

        #endregion

        #region Unified Loading Pipeline

        /// <summary>
        /// Loads management data using the unified loading pipeline
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
                Application.Current.Dispatcher.Invoke(() => Items.Clear());
                
                // Load management data from actual CSV data and discovery status
                var configService = ConfigurationService.Instance;
                var dataPath = configService.GetCompanyRawDataPath("ljpops");
                var managementData = new List<object>();
                
                if (Directory.Exists(dataPath))
                {
                    // Load actual data based on discovery results
                    var csvFiles = Directory.GetFiles(dataPath, "*.csv");
                    
                    // Create management items based on discovered data
                    foreach (var csvFile in csvFiles.Take(10)) // Limit to 10 for performance
                    {
                        var fileName = Path.GetFileNameWithoutExtension(csvFile);
                        var fileInfo = new FileInfo(csvFile);
                        var itemCount = 0;
                        
                        try
                        {
                            // Quick count of lines in CSV (excluding header)
                            var lines = File.ReadAllLines(csvFile);
                            itemCount = Math.Max(0, lines.Length - 1);
                        }
                        catch
                        {
                            itemCount = 0;
                        }
                        
                        var status = itemCount > 0 ? "Discovered" : "Empty";
                        var progress = itemCount > 0 ? 100 : 0;
                        
                        managementData.Add(new { 
                            Name = $"{fileName} Discovery", 
                            Status = status, 
                            Progress = progress,
                            Items = itemCount,
                            LastModified = fileInfo.LastWriteTime
                        });
                    }
                }
                
                // If no CSV data found, show default management items
                if (managementData.Count == 0)
                {
                    managementData.Add(new { Name = "Discovery Phase", Status = "Pending", Progress = 0, Items = 0, LastModified = DateTime.Now });
                    managementData.Add(new { Name = "Assessment Phase", Status = "Waiting", Progress = 0, Items = 0, LastModified = DateTime.Now });
                    managementData.Add(new { Name = "Migration Planning", Status = "Not Started", Progress = 0, Items = 0, LastModified = DateTime.Now });
                }

                Application.Current.Dispatcher.Invoke(() =>
                {
                    foreach (var item in managementData) 
                        Items.Add(item);
                    RaiseAllLoadingProperties();
                });
            }
            catch (Exception ex)
            {
                LastError = ex.Message; 
                HasErrors = true;
                RaiseAllLoadingProperties();
            }
            finally
            {
                IsLoading = false; 
                RaiseAllLoadingProperties();
            }
        }

        #endregion

        #region Commands

        public ICommand NavigateCommand { get; }

        private void ExecuteNavigate(string viewName)
        {
            switch (viewName?.ToLower())
            {
                case "dashboard":
                    SelectedViewModel = DashboardViewModel;
                    break;
                case "gantt":
                    SelectedViewModel = GanttViewModel;
                    break;
                case "waves":
                    SelectedViewModel = WaveViewModel;
                    break;
                default:
                    SelectedViewModel = DashboardViewModel;
                    break;
            }
        }

        #endregion

        #region Private Methods

        private void InitializeProject()
        {
            // Create a sample project with flowchart phases
            CurrentProject = new MigrationProject
            {
                ProjectName = "M&A Integration Project",
                StartDate = DateTime.Today,
                EndDate = DateTime.Today.AddDays(150)
            };

            // Initialize with standard project management phases from the flowchart
            CurrentProject.InitializeWithStandardPhases();

            // Add sample stakeholders
            CurrentProject.Stakeholders.Add("John Smith - Project Manager");
            CurrentProject.Stakeholders.Add("Sarah Johnson - Technical Lead");
            CurrentProject.Stakeholders.Add("Mike Chen - Business Analyst");
            CurrentProject.Stakeholders.Add("Lisa Davis - Change Management");

            // Add sample risks
            CurrentProject.Risks.Add(new Models.RiskItem
            {
                Description = "Data migration complexity higher than expected",
                Severity = RiskSeverity.High,
                Mitigation = "Conduct detailed data analysis and create comprehensive mapping"
            });

            CurrentProject.Risks.Add(new Models.RiskItem
            {
                Description = "User adoption resistance",
                Severity = RiskSeverity.Medium,
                Mitigation = "Implement change management program with training"
            });

            CurrentProject.Risks.Add(new Models.RiskItem
            {
                Description = "Integration timeline delays",
                Severity = RiskSeverity.Low,
                Mitigation = "Build buffer time into schedule and track progress weekly"
            });

            // Add sample migration waves
            var wave1 = new MigrationProjectWave
            {
                Name = "Wave 1 - Core Systems",
                Description = "Migration of core business systems",
                StartDate = CurrentProject.StartDate.AddDays(30),
                EndDate = CurrentProject.StartDate.AddDays(60),
                Status = WaveStatus.Planned,
                Progress = 0
            };

            wave1.AssignedUsers.Add(new User { Name = "Tom Wilson", Role = "System Administrator" });
            wave1.AssignedUsers.Add(new User { Name = "Amy Rodriguez", Role = "Database Administrator" });
            wave1.AssociatedPhases.Add("Execution");

            var wave2 = new MigrationProjectWave
            {
                Name = "Wave 2 - User Migration",
                Description = "Migration of user accounts and permissions",
                StartDate = CurrentProject.StartDate.AddDays(45),
                EndDate = CurrentProject.StartDate.AddDays(75),
                Status = WaveStatus.Planned,
                Progress = 0
            };

            wave2.AssignedUsers.Add(new User { Name = "David Park", Role = "Identity Specialist" });
            wave2.AssignedUsers.Add(new User { Name = "Jennifer Lee", Role = "Security Analyst" });
            wave2.AssociatedPhases.Add("Execution");

            var wave3 = new MigrationProjectWave
            {
                Name = "Wave 3 - Application Migration",
                Description = "Migration of business applications",
                StartDate = CurrentProject.StartDate.AddDays(60),
                EndDate = CurrentProject.StartDate.AddDays(90),
                Status = WaveStatus.Planned,
                Progress = 0
            };

            wave3.AssignedUsers.Add(new User { Name = "Chris Thompson", Role = "Application Developer" });
            wave3.AssignedUsers.Add(new User { Name = "Maria Garcia", Role = "QA Engineer" });
            wave3.AssociatedPhases.Add("Execution");
            wave3.AssociatedPhases.Add("Monitoring & Controlling");

            CurrentProject.Waves.Add(wave1);
            CurrentProject.Waves.Add(wave2);
            CurrentProject.Waves.Add(wave3);

            // Set up some sample task assignments and dates
            SetupSampleTaskData();

            // Calculate initial progress
            CurrentProject.CalculateOverallProgress();
        }

        private void SetupSampleTaskData()
        {
            var today = DateTime.Today;
            
            // Setup sample data for demonstration
            foreach (var phase in CurrentProject.Phases)
            {
                for (int i = 0; i < phase.Tasks.Count; i++)
                {
                    var task = phase.Tasks[i];
                    task.Owner = GetSampleOwner(i);
                    task.StartDate = phase.StartDate.AddDays(i * 2);
                    task.EndDate = task.StartDate.AddDays(3 + i);

                    // Set some tasks as completed/in progress for demo
                    if (phase.Name == "Initiation")
                    {
                        if (i < 3)
                        {
                            task.Status = MigrationProjectTaskStatus.Completed;
                            task.Progress = 100;
                        }
                        else if (i == 3)
                        {
                            task.Status = MigrationProjectTaskStatus.InProgress;
                            task.Progress = 65;
                        }
                    }
                    else if (phase.Name == "Planning" && i == 0)
                    {
                        task.Status = MigrationProjectTaskStatus.InProgress;
                        task.Progress = 30;
                    }

                    // Add some dependencies
                    if (i > 0)
                    {
                        task.Dependencies.Add(phase.Tasks[i - 1].Id);
                    }
                }
            }
        }

        private string GetSampleOwner(int index)
        {
            var owners = new[]
            {
                "John Smith", "Sarah Johnson", "Mike Chen", "Lisa Davis",
                "Tom Wilson", "Amy Rodriguez", "David Park", "Jennifer Lee"
            };
            return owners[index % owners.Length];
        }

        private void InitializeViewModels()
        {
            DashboardViewModel = new ManagementDashboardViewModel(CurrentProject);
            GanttViewModel = new GanttViewModel(CurrentProject);
            // Create logger for WaveViewModel
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddDebug());
            var waveLogger = loggerFactory.CreateLogger<WaveViewModel>();
            WaveViewModel = new WaveViewModel(CurrentProject, waveLogger);
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                DashboardViewModel?.Dispose();
                GanttViewModel?.Dispose();
                WaveViewModel?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}