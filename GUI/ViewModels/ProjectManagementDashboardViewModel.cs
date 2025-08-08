using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Messaging;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Messages;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Project Management Dashboard metrics.
    /// </summary>
    public class ProjectManagementDashboardViewModel : BaseViewModel, IRecipient<DiscoveryCompletedMessage>
    {
        private readonly IDataService _dataService;
        private string _profileName = "DefaultCompany";
        private int _totalUsers;
        private int _totalAssets;
        private int _totalApplications;
        private int _pendingMigrations;
        private IntegrationProject _currentProject;

        public ProjectManagementDashboardViewModel(IDataService dataService = null, ILogger<ProjectManagementDashboardViewModel> logger = null, IMessenger messenger = null)
            : base(logger, messenger)
        {
            _dataService = dataService ?? new CsvDataService();

            RefreshMetricsCommand = new AsyncRelayCommand(RefreshMetricsAsync);
            NavigateUsersCommand = new RelayCommand(() => Messenger.Send(new NavigationMessage("Users")));
            NavigateAssetsCommand = new RelayCommand(() => Messenger.Send(new NavigationMessage("Infrastructure")));
            NavigateApplicationsCommand = new RelayCommand(() => Messenger.Send(new NavigationMessage("Applications")));
            NavigateMigrationsCommand = new RelayCommand(() => Messenger.Send(new NavigationMessage("TaskScheduler")));

            Messenger.Register<DiscoveryCompletedMessage>(this);
        }

        #region Properties

        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        public int TotalAssets
        {
            get => _totalAssets;
            set => SetProperty(ref _totalAssets, value);
        }

        public int TotalApplications
        {
            get => _totalApplications;
            set => SetProperty(ref _totalApplications, value);
        }

        public int PendingMigrations
        {
            get => _pendingMigrations;
            set => SetProperty(ref _pendingMigrations, value);
        }

        /// <summary>
        /// Current integration project used to calculate pending migrations.
        /// </summary>
        public IntegrationProject CurrentProject
        {
            get => _currentProject;
            set
            {
                if (SetProperty(ref _currentProject, value))
                {
                    UpdatePendingMigrations();
                }
            }
        }

        #endregion

        #region Commands

        public ICommand RefreshMetricsCommand { get; }
        public ICommand NavigateUsersCommand { get; }
        public ICommand NavigateAssetsCommand { get; }
        public ICommand NavigateApplicationsCommand { get; }
        public ICommand NavigateMigrationsCommand { get; }

        #endregion

        #region Methods

        /// <summary>
        /// Refreshes metric values from the data service.
        /// </summary>
        public async Task RefreshMetricsAsync()
        {
            try
            {
                IsLoading = true;
                var summary = await _dataService.GetDataSummaryAsync(_profileName);
                TotalUsers = summary.TotalUsers;
                TotalAssets = summary.TotalComputers;
                TotalApplications = summary.TotalApplications;
                UpdatePendingMigrations();
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void UpdatePendingMigrations()
        {
            if (CurrentProject == null)
            {
                PendingMigrations = 0;
                return;
            }

            var count = CurrentProject.Phases
                .SelectMany(p => p.Components)
                .SelectMany(c => c.Tasks)
                .Count(t => t.Name?.IndexOf("migration", StringComparison.OrdinalIgnoreCase) >= 0 &&
                            t.Status != TaskStatus.Completed);
            PendingMigrations = count;
        }

        public void Receive(DiscoveryCompletedMessage message)
        {
            _profileName = message.ProfileName;
            RefreshMetricsCommand.Execute(null);
        }

        #endregion
    }
}
