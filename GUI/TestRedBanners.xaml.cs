using System;
using System.Windows;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite
{
    public partial class TestRedBanners : Window
    {
        public TestRedBanners()
        {
            InitializeComponent();
            SetupViewModels();
        }

        private void SetupViewModels()
        {
            // Create services
            var loggerFactory = LoggerFactory.Create(builder => 
                builder.AddConsole().SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Debug));
            
            var csvService = new CsvDataServiceNew(loggerFactory.CreateLogger<CsvDataServiceNew>());
            var profileService = new ProfileService();
            
            // Set up ViewModels
            var usersViewModel = new UsersViewModel(csvService, 
                loggerFactory.CreateLogger<UsersViewModel>(), profileService);
            var applicationsViewModel = new ApplicationsViewModel(csvService, 
                loggerFactory.CreateLogger<ApplicationsViewModel>(), profileService);
            var groupsViewModel = new GroupsViewModel(csvService, 
                loggerFactory.CreateLogger<GroupsViewModel>(), profileService);
            var fileServersViewModel = new FileServersViewModel(csvService, 
                loggerFactory.CreateLogger<FileServersViewModel>(), profileService);
            var databasesViewModel = new DatabasesViewModel(csvService, 
                loggerFactory.CreateLogger<DatabasesViewModel>(), profileService);
            var groupPoliciesViewModel = new GroupPoliciesViewModel(csvService, 
                loggerFactory.CreateLogger<GroupPoliciesViewModel>(), profileService);
            
            // Assign DataContext
            UsersView.DataContext = usersViewModel;
            ApplicationsView.DataContext = applicationsViewModel;
            GroupsView.DataContext = groupsViewModel;
            FileServersView.DataContext = fileServersViewModel;
            DatabasesView.DataContext = databasesViewModel;
            GroupPoliciesView.DataContext = groupPoliciesViewModel;
            
            // Load data asynchronously
            _ = LoadAllDataAsync();
        }
        
        private async Task LoadAllDataAsync()
        {
            try
            {
                var tasks = new List<Task>();
                
                if (UsersView.DataContext is UsersViewModel usersVm)
                    tasks.Add(usersVm.LoadAsync());
                if (ApplicationsView.DataContext is ApplicationsViewModel appsVm)
                    tasks.Add(appsVm.LoadAsync());
                if (GroupsView.DataContext is GroupsViewModel groupsVm)
                    tasks.Add(groupsVm.LoadAsync());
                if (FileServersView.DataContext is FileServersViewModel fsVm)
                    tasks.Add(fsVm.LoadAsync());
                if (DatabasesView.DataContext is DatabasesViewModel dbVm)
                    tasks.Add(dbVm.LoadAsync());
                if (GroupPoliciesView.DataContext is GroupPoliciesViewModel gpVm)
                    tasks.Add(gpVm.LoadAsync());
                
                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading data: {ex.Message}", "Load Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}