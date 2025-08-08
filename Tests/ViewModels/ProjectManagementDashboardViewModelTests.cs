using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Messages;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Xunit;

namespace MandADiscoverySuite.Tests.ViewModels
{
    public class ProjectManagementDashboardViewModelTests
    {
        private class FakeDataService : IDataService
        {
            public DataSummary Summary { get; set; } = new DataSummary();

            public Task<IEnumerable<UserData>> LoadUsersAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default) =>
                Task.FromResult<IEnumerable<UserData>>(Array.Empty<UserData>());
            public Task<IEnumerable<InfrastructureData>> LoadInfrastructureAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default) =>
                Task.FromResult<IEnumerable<InfrastructureData>>(Array.Empty<InfrastructureData>());
            public Task<IEnumerable<GroupData>> LoadGroupsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default) =>
                Task.FromResult<IEnumerable<GroupData>>(Array.Empty<GroupData>());
            public Task<IEnumerable<ApplicationData>> LoadApplicationsAsync(string profileName, bool forceRefresh = false, CancellationToken cancellationToken = default) =>
                Task.FromResult<IEnumerable<ApplicationData>>(Array.Empty<ApplicationData>());
            public Task<DataSummary> GetDataSummaryAsync(string profileName, CancellationToken cancellationToken = default) =>
                Task.FromResult(Summary);
            public Task<SearchResults> SearchAsync(string profileName, string searchTerm, SearchOptions searchOptions = null, CancellationToken cancellationToken = default) =>
                Task.FromResult(new SearchResults());
            public Task<ExportResult> ExportDataAsync(string profileName, ExportOptions exportOptions, CancellationToken cancellationToken = default) =>
                Task.FromResult(new ExportResult());
            public Task ClearCacheAsync(string profileName) => Task.CompletedTask;
            public Task<CacheStatistics> GetCacheStatisticsAsync() => Task.FromResult(new CacheStatistics());
        }

        [Fact]
        public async Task RefreshMetricsAsync_PopulatesCounts()
        {
            var messenger = new WeakReferenceMessenger();
            var dataService = new FakeDataService
            {
                Summary = new DataSummary
                {
                    TotalUsers = 10,
                    TotalComputers = 5,
                    TotalApplications = 3
                }
            };

            var vm = new ProjectManagementDashboardViewModel(dataService, messenger: messenger);
            var project = new IntegrationProject();
            var phase = new ProjectPhase();
            var component = new ProjectComponent();
            component.Tasks.Add(new ProjectTask { Name = "Database Migration", Status = TaskStatus.InProgress });
            component.Tasks.Add(new ProjectTask { Name = "Completed Migration", Status = TaskStatus.Completed });
            phase.Components.Add(component);
            project.Phases.Add(phase);
            vm.CurrentProject = project;

            await vm.RefreshMetricsAsync();

            Assert.Equal(10, vm.TotalUsers);
            Assert.Equal(5, vm.TotalAssets);
            Assert.Equal(3, vm.TotalApplications);
            Assert.Equal(1, vm.PendingMigrations);
        }

        [Fact]
        public async Task DiscoveryCompletedMessage_TriggersRefresh()
        {
            var messenger = new WeakReferenceMessenger();
            var dataService = new FakeDataService
            {
                Summary = new DataSummary { TotalUsers = 1, TotalComputers = 1, TotalApplications = 1 }
            };

            var vm = new ProjectManagementDashboardViewModel(dataService, messenger: messenger);
            await vm.RefreshMetricsAsync();
            Assert.Equal(1, vm.TotalUsers);

            dataService.Summary = new DataSummary { TotalUsers = 2, TotalComputers = 3, TotalApplications = 4 };
            messenger.Send(new DiscoveryCompletedMessage("DefaultCompany", true));
            await Task.Delay(50); // allow async refresh

            Assert.Equal(2, vm.TotalUsers);
            Assert.Equal(3, vm.TotalAssets);
            Assert.Equal(4, vm.TotalApplications);
        }
    }
}
