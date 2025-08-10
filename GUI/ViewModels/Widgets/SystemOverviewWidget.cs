using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.ViewModels.Widgets
{
    public class SystemOverviewWidget : WidgetViewModel
    {
        private int _totalUsers;
        private int _totalComputers;
        private int _totalGroups;
        private int _totalApplications;
        private string _healthStatus;

        public SystemOverviewWidget()
        {
            Title = "System Overview";
            Icon = "📊";
            RowSpan = 1;
            ColumnSpan = 2;
            HealthStatus = "Unknown";
        }

        public override string WidgetType => "SystemOverview";

        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        public int TotalComputers
        {
            get => _totalComputers;
            set => SetProperty(ref _totalComputers, value);
        }

        public int TotalGroups
        {
            get => _totalGroups;
            set => SetProperty(ref _totalGroups, value);
        }

        public int TotalApplications
        {
            get => _totalApplications;
            set => SetProperty(ref _totalApplications, value);
        }

        public string HealthStatus
        {
            get => _healthStatus;
            set => SetProperty(ref _healthStatus, value);
        }

        public override async Task RefreshAsync()
        {
            try
            {
                IsLoading = true;

                // Simulate data loading - in real implementation, this would load from CSV data service
                await Task.Delay(1000);

                // Mock data - replace with actual data service calls
                TotalUsers = new Random().Next(1000, 5000);
                TotalComputers = new Random().Next(500, 2000);
                TotalGroups = new Random().Next(50, 200);
                TotalApplications = new Random().Next(100, 500);
                
                var healthValues = new[] { "Excellent", "Good", "Warning", "Critical" };
                HealthStatus = healthValues[new Random().Next(healthValues.Length)];

                OnRefreshCompleted();
            }
            catch (Exception ex)
            {
                OnRefreshError($"Failed to refresh system overview: {ex.Message}");
            }
        }
    }
}