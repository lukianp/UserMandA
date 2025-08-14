using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace MandADiscoverySuite.ViewModels.Widgets
{
    public class DiscoveryStatusItem
    {
        public string ModuleName { get; set; }
        public string Status { get; set; }
        public string StatusIcon { get; set; }
        public DateTime? LastRun { get; set; }
    }

    public class DiscoveryStatusWidget : WidgetViewModel
    {
        private ObservableCollection<DiscoveryStatusItem> _discoveryModules;
        private int _runningModules;
        private int _completedModules;
        private int _failedModules;

        public DiscoveryStatusWidget()
        {
            Title = "Discovery Status";
            Icon = "🔍";
            RowSpan = 2;
            ColumnSpan = 1;
            DiscoveryModules = new ObservableCollection<DiscoveryStatusItem>();
        }

        public override string WidgetType => "DiscoveryStatus";

        public ObservableCollection<DiscoveryStatusItem> DiscoveryModules
        {
            get => _discoveryModules;
            set => SetProperty(ref _discoveryModules, value);
        }

        public int RunningModules
        {
            get => _runningModules;
            set => SetProperty(ref _runningModules, value);
        }

        public int CompletedModules
        {
            get => _completedModules;
            set => SetProperty(ref _completedModules, value);
        }

        public int FailedModules
        {
            get => _failedModules;
            set => SetProperty(ref _failedModules, value);
        }

        public override async Task RefreshAsync()
        {
            try
            {
                IsLoading = true;

                await Task.Delay(100);

                // Clear existing modules
                DiscoveryModules.Clear();
                
                // Reset counters
                RunningModules = 0;
                CompletedModules = 0;
                FailedModules = 0;

                // TODO: Get actual status from DiscoveryDashboardViewModel or discovery service
                // For now, just show empty state
                
                OnRefreshCompleted();
            }
            catch (Exception ex)
            {
                OnRefreshError($"Failed to refresh discovery status: {ex.Message}");
            }
        }
    }
}