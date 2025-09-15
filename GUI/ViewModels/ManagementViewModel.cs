using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Interfaces;
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
        private readonly ICsvDataLoader _csvDataLoader;
        private MigrationProject _currentProject;
        private ManagementDashboardViewModel _dashboardViewModel;
        private GanttViewModel _ganttViewModel;
        private WaveViewModel _waveViewModel;
        private object _selectedViewModel;

        public ManagementViewModel(ILogger<ManagementViewModel> logger, ICsvDataLoader csvDataLoader = null) : base(logger)
        {
            _csvDataLoader = csvDataLoader ?? SimpleServiceLocator.Instance.GetService<ICsvDataLoader>();
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
                
                // Load management data from actual CSV data files via ICsvDataLoader
                var configService = ConfigurationService.Instance;
                var dataPath = configService.GetCompanyRawDataPath("ljpops");
                var managementData = new List<object>();

                if (Directory.Exists(dataPath))
                {
                    // Load actual data based on discovery results using ICsvDataLoader
                    var csvFiles = Directory.GetFiles(dataPath, "*.csv");

                    if (csvFiles.Length > 0)
                    {
                        // Use CsvDataLoader to load actual data (users, groups, etc.) and create summaries
                        await LoadDiscoverySummariesAsync(managementData);
                    }
                }

                // If no CSV data found, leave management data empty (no fallback defaults)
                // Empty collection will result in empty UI grid

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

        /// <summary>
        /// Load discovery data summaries using ICsvDataLoader
        /// </summary>
        private async Task LoadDiscoverySummariesAsync(List<object> managementData)
        {
            try
            {
                // Load summary data from various CSV sources
                var userResult = await _csvDataLoader.LoadUsersAsync("ljpops");
                var groupResult = await _csvDataLoader.LoadGroupsAsync("ljpops");
                var infraResult = await _csvDataLoader.LoadInfrastructureAsync("ljpops");
                var appResult = await _csvDataLoader.LoadApplicationsAsync("ljpops");
                var migrationResult = await _csvDataLoader.LoadMigrationItemsAsync("ljpops");

                // Create management dashboard items based on loaded data
                if (userResult.IsSuccess && userResult.Data?.Count > 0)
                {
                    managementData.Add(new {
                        Name = "User Discovery",
                        Status = "Completed",
                        Progress = 100,
                        Items = userResult.Data.Count,
                        LastModified = DateTime.Now
                    });
                }

                if (groupResult.IsSuccess && groupResult.Data?.Count > 0)
                {
                    managementData.Add(new {
                        Name = "Group Discovery",
                        Status = "Completed",
                        Progress = 100,
                        Items = groupResult.Data.Count,
                        LastModified = DateTime.Now
                    });
                }

                if (infraResult.IsSuccess && infraResult.Data?.Count > 0)
                {
                    managementData.Add(new {
                        Name = "Infrastructure Discovery",
                        Status = "Completed",
                        Progress = 100,
                        Items = infraResult.Data.Count,
                        LastModified = DateTime.Now
                    });
                }

                if (appResult.IsSuccess && appResult.Data?.Count > 0)
                {
                    managementData.Add(new {
                        Name = "Application Discovery",
                        Status = "Completed",
                        Progress = 100,
                        Items = appResult.Data.Count,
                        LastModified = DateTime.Now
                    });
                }

                if (migrationResult.IsSuccess && migrationResult.Data?.Count > 0)
                {
                    managementData.Add(new {
                        Name = "Migration Planning",
                        Status = "In Progress",
                        Progress = 50,
                        Items = migrationResult.Data.Count,
                        LastModified = DateTime.Now
                    });
                }

                // Log any warnings from CSV loading
                var allWarnings = userResult.HeaderWarnings
                    .Concat(groupResult.HeaderWarnings)
                    .Concat(infraResult.HeaderWarnings)
                    .Concat(appResult.HeaderWarnings)
                    .Concat(migrationResult.HeaderWarnings);

                foreach (var warning in allWarnings)
                {
                    Logger?.LogWarning(warning);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Failed to load discovery summaries");
                // Don't throw - let UI handle empty data gracefully
            }
        }

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
            // Create empty project with standard phases
            CurrentProject = new MigrationProject
            {
                ProjectName = "M&A Integration Project",
                StartDate = DateTime.Today,
                EndDate = DateTime.Today.AddDays(150)
            };

            // Initialize with standard project management phases from the flowchart
            CurrentProject.InitializeWithStandardPhases();

            // Project data will be loaded from discovery/CSV files
            // No dummy data initialization
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