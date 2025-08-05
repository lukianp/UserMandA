using System;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows.Threading;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the System Status Panel
    /// </summary>
    public class SystemStatusPanelViewModel : BaseViewModel
    {
        private readonly IDiscoveryService _discoveryService;
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        private readonly DispatcherTimer _statusUpdateTimer;
        
        private DateTime _lastUpdated = DateTime.Now;

        public SystemStatusPanelViewModel(
            ILogger<SystemStatusPanelViewModel> logger,
            IMessenger messenger,
            IDiscoveryService discoveryService,
            IDataService dataService,
            IProfileService profileService) : base(logger, messenger)
        {
            _discoveryService = discoveryService ?? throw new ArgumentNullException(nameof(discoveryService));
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            // Initialize status indicators
            DiscoveryServiceStatus = new StatusIndicatorViewModel(logger, messenger);
            DataServiceStatus = new StatusIndicatorViewModel(logger, messenger);
            ProfileServiceStatus = new StatusIndicatorViewModel(logger, messenger);
            ConfigurationServiceStatus = new StatusIndicatorViewModel(logger, messenger);
            CurrentOperationStatus = new StatusIndicatorViewModel(logger, messenger);
            ConnectionStatus = new StatusIndicatorViewModel(logger, messenger);
            MemoryUsageStatus = new StatusIndicatorViewModel(logger, messenger);
            SystemHealthStatus = new StatusIndicatorViewModel(logger, messenger);

            InitializeCommands();
            InitializeStatusUpdates();
            
            // Start periodic updates
            _statusUpdateTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(5)
            };
            _statusUpdateTimer.Tick += async (s, e) => await UpdateAllStatusAsync();
            _statusUpdateTimer.Start();

            // Initial status update
            _ = UpdateAllStatusAsync();
        }

        #region Properties

        public StatusIndicatorViewModel DiscoveryServiceStatus { get; }
        public StatusIndicatorViewModel DataServiceStatus { get; }
        public StatusIndicatorViewModel ProfileServiceStatus { get; }
        public StatusIndicatorViewModel ConfigurationServiceStatus { get; }
        public StatusIndicatorViewModel CurrentOperationStatus { get; }
        public StatusIndicatorViewModel ConnectionStatus { get; }
        public StatusIndicatorViewModel MemoryUsageStatus { get; }
        public StatusIndicatorViewModel SystemHealthStatus { get; }

        public DateTime LastUpdated
        {
            get => _lastUpdated;
            set => SetProperty(ref _lastUpdated, value);
        }

        #endregion

        #region Commands

        public ICommand RefreshStatusCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            RefreshStatusCommand = new AsyncRelayCommand(RefreshStatusAsync);
        }

        #endregion

        #region Public Methods

        public async Task UpdateAllStatusAsync()
        {
            try
            {
                await Task.WhenAll(
                    UpdateDiscoveryServiceStatusAsync(),
                    UpdateDataServiceStatusAsync(),
                    UpdateProfileServiceStatusAsync(),
                    UpdateConfigurationServiceStatusAsync(),
                    UpdateCurrentOperationStatusAsync(),
                    UpdateConnectionStatusAsync(),
                    UpdateMemoryUsageStatusAsync(),
                    UpdateSystemHealthStatusAsync()
                );

                LastUpdated = DateTime.Now;
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating system status");
            }
        }

        public void UpdateOperationProgress(string operationName, double progress)
        {
            CurrentOperationStatus.UpdateStatus(StatusType.Processing, operationName, progress, 
                $"Operation: {operationName} ({progress:F1}% complete)");
        }

        public void SetOperationCompleted(string operationName)
        {
            CurrentOperationStatus.UpdateStatus(StatusType.Completed, $"{operationName} Complete", null,
                $"Operation completed successfully: {operationName}");
        }

        public void SetOperationError(string operationName, string error)
        {
            CurrentOperationStatus.UpdateStatus(StatusType.Error, $"{operationName} Failed", null,
                $"Operation failed: {operationName} - {error}");
        }

        #endregion

        #region Private Methods

        private void InitializeStatusUpdates()
        {
            // Subscribe to service events if available
            // This would be implemented based on actual service interfaces
            
            // Example: Subscribe to discovery service events
            // _discoveryService.ProgressChanged += OnDiscoveryProgressChanged;
            // _discoveryService.StatusChanged += OnDiscoveryStatusChanged;
        }

        private async Task UpdateDiscoveryServiceStatusAsync()
        {
            try
            {
                // Check if discovery service is available and responsive
                var isHealthy = await CheckServiceHealthAsync("DiscoveryService");
                
                if (isHealthy)
                {
                    // Check if discovery is currently running
                    var isRunning = IsDiscoveryRunning();
                    if (isRunning)
                    {
                        DiscoveryServiceStatus.UpdateStatus(StatusType.Running, "Discovering", null,
                            "Discovery operation is currently running");
                    }
                    else
                    {
                        DiscoveryServiceStatus.UpdateStatus(StatusType.Ready, "Ready", null,
                            "Discovery service is ready and operational");
                    }
                }
                else
                {
                    DiscoveryServiceStatus.UpdateStatus(StatusType.Error, "Error", null,
                        "Discovery service is not responding");
                }
            }
            catch (Exception ex)
            {
                DiscoveryServiceStatus.UpdateStatus(StatusType.Error, "Error", null,
                    $"Discovery service error: {ex.Message}");
            }
        }

        private async Task UpdateDataServiceStatusAsync()
        {
            try
            {
                var isHealthy = await CheckServiceHealthAsync("DataService");
                
                if (isHealthy)
                {
                    // Check current profile
                    var currentProfile = await _profileService.GetCurrentProfileAsync();
                    if (currentProfile != null)
                    {
                        DataServiceStatus.UpdateStatus(StatusType.Ready, $"Profile: {currentProfile.Name}", null,
                            $"Data service is operational with profile: {currentProfile.Name}");
                    }
                    else
                    {
                        DataServiceStatus.UpdateStatus(StatusType.Warning, "No Profile", null,
                            "Data service is running but no profile is selected");
                    }
                }
                else
                {
                    DataServiceStatus.UpdateStatus(StatusType.Error, "Error", null,
                        "Data service is not responding");
                }
            }
            catch (Exception ex)
            {
                DataServiceStatus.UpdateStatus(StatusType.Error, "Error", null,
                    $"Data service error: {ex.Message}");
            }
        }

        private async Task UpdateProfileServiceStatusAsync()
        {
            try
            {
                var profiles = await _profileService.GetProfilesAsync();
                var profileCount = profiles?.Count() ?? 0;
                
                if (profileCount > 0)
                {
                    ProfileServiceStatus.UpdateStatus(StatusType.Ready, $"{profileCount} Profiles", null,
                        $"Profile service is operational with {profileCount} profiles");
                }
                else
                {
                    ProfileServiceStatus.UpdateStatus(StatusType.Warning, "No Profiles", null,
                        "Profile service is running but no profiles are configured");
                }
            }
            catch (Exception ex)
            {
                ProfileServiceStatus.UpdateStatus(StatusType.Error, "Error", null,
                    $"Profile service error: {ex.Message}");
            }
        }

        private async Task UpdateConfigurationServiceStatusAsync()
        {
            try
            {
                // Check configuration file accessibility and validity
                var configValid = await CheckConfigurationValidityAsync();
                
                if (configValid)
                {
                    ConfigurationServiceStatus.UpdateStatus(StatusType.Ready, "Valid", null,
                        "Configuration is valid and accessible");
                }
                else
                {
                    ConfigurationServiceStatus.UpdateStatus(StatusType.Warning, "Issues", null,
                        "Configuration has validation issues");
                }
            }
            catch (Exception ex)
            {
                ConfigurationServiceStatus.UpdateStatus(StatusType.Error, "Error", null,
                    $"Configuration error: {ex.Message}");
            }
        }

        private async Task UpdateCurrentOperationStatusAsync()
        {
            // This is typically updated by other components calling UpdateOperationProgress
            // If no operation is running, ensure it shows ready state
            if (CurrentOperationStatus.CurrentStatus == StatusType.Processing)
            {
                // Keep current processing status
                return;
            }

            // Check if there are any background operations
            var hasBackgroundOperations = await CheckBackgroundOperationsAsync();
            
            if (!hasBackgroundOperations)
            {
                CurrentOperationStatus.UpdateStatus(StatusType.Ready, "Idle", null,
                    "No operations currently running");
            }
        }

        private async Task UpdateConnectionStatusAsync()
        {
            try
            {
                // Test network connectivity and service availability
                var connectionStatus = await TestNetworkConnectivityAsync();
                
                switch (connectionStatus)
                {
                    case NetworkStatus.Connected:
                        ConnectionStatus.UpdateStatus(StatusType.Ready, "Connected", null,
                            "Network connection is stable");
                        break;
                    case NetworkStatus.Limited:
                        ConnectionStatus.UpdateStatus(StatusType.Warning, "Limited", null,
                            "Network connection has limited functionality");
                        break;
                    case NetworkStatus.Disconnected:
                        ConnectionStatus.UpdateStatus(StatusType.Offline, "Offline", null,
                            "No network connection available");
                        break;
                }
            }
            catch (Exception ex)
            {
                ConnectionStatus.UpdateStatus(StatusType.Error, "Error", null,
                    $"Connection status error: {ex.Message}");
            }
        }

        private async Task UpdateMemoryUsageStatusAsync()
        {
            try
            {
                var memoryUsage = GetMemoryUsagePercentage();
                var memoryMB = GetMemoryUsageMB();
                
                StatusType status;
                string statusText;
                
                if (memoryUsage < 70)
                {
                    status = StatusType.Ready;
                    statusText = $"{memoryUsage:F0}% ({memoryMB:F0} MB)";
                }
                else if (memoryUsage < 85)
                {
                    status = StatusType.Warning;
                    statusText = $"{memoryUsage:F0}% ({memoryMB:F0} MB)";
                }
                else
                {
                    status = StatusType.Critical;
                    statusText = $"{memoryUsage:F0}% ({memoryMB:F0} MB)";
                }
                
                MemoryUsageStatus.UpdateStatus(status, statusText, memoryUsage,
                    $"Memory usage: {memoryUsage:F1}% ({memoryMB:F0} MB of available memory)");
            }
            catch (Exception ex)
            {
                MemoryUsageStatus.UpdateStatus(StatusType.Error, "Error", null,
                    $"Memory status error: {ex.Message}");
            }
        }

        private async Task UpdateSystemHealthStatusAsync()
        {
            try
            {
                // Aggregate health from all other indicators
                var healthScore = CalculateOverallHealthScore();
                
                StatusType status;
                string statusText;
                
                if (healthScore >= 90)
                {
                    status = StatusType.Ready;
                    statusText = "Excellent";
                }
                else if (healthScore >= 75)
                {
                    status = StatusType.Ready;
                    statusText = "Good";
                }
                else if (healthScore >= 60)
                {
                    status = StatusType.Warning;
                    statusText = "Fair";
                }
                else if (healthScore >= 40)
                {
                    status = StatusType.Warning;
                    statusText = "Poor";
                }
                else
                {
                    status = StatusType.Critical;
                    statusText = "Critical";
                }
                
                SystemHealthStatus.UpdateStatus(status, statusText, null,
                    $"Overall system health score: {healthScore:F0}%");
            }
            catch (Exception ex)
            {
                SystemHealthStatus.UpdateStatus(StatusType.Error, "Error", null,
                    $"System health error: {ex.Message}");
            }
        }

        private async Task RefreshStatusAsync()
        {
            await UpdateAllStatusAsync();
            Logger?.LogInformation("System status refreshed manually");
        }

        // Helper methods for status checking
        private async Task<bool> CheckServiceHealthAsync(string serviceName)
        {
            // Simulate service health check
            await Task.Delay(50); // Small delay to simulate async operation
            return true; // In real implementation, this would check actual service health
        }

        private bool IsDiscoveryRunning()
        {
            // Check if discovery is currently running
            // This would be implemented based on actual discovery service state
            return false;
        }

        private async Task<bool> CheckConfigurationValidityAsync()
        {
            // Check configuration validity
            await Task.Delay(50);
            return true;
        }

        private async Task<bool> CheckBackgroundOperationsAsync()
        {
            // Check for background operations
            await Task.Delay(50);
            return false;
        }

        private async Task<NetworkStatus> TestNetworkConnectivityAsync()
        {
            // Test network connectivity
            await Task.Delay(50);
            return NetworkStatus.Connected;
        }

        private double GetMemoryUsagePercentage()
        {
            // Get actual memory usage
            var process = System.Diagnostics.Process.GetCurrentProcess();
            var totalMemory = GC.GetTotalMemory(false);
            var workingSet = process.WorkingSet64;
            
            // Simulate percentage calculation
            return (workingSet / (1024.0 * 1024.0 * 1024.0)) * 100; // Convert to percentage of 1GB
        }

        private double GetMemoryUsageMB()
        {
            var process = System.Diagnostics.Process.GetCurrentProcess();
            return process.WorkingSet64 / (1024.0 * 1024.0);
        }

        private double CalculateOverallHealthScore()
        {
            var statuses = new[]
            {
                DiscoveryServiceStatus.CurrentStatus,
                DataServiceStatus.CurrentStatus,
                ProfileServiceStatus.CurrentStatus,
                ConfigurationServiceStatus.CurrentStatus,
                ConnectionStatus.CurrentStatus,
                MemoryUsageStatus.CurrentStatus
            };

            var totalScore = 0.0;
            var count = statuses.Length;

            foreach (var status in statuses)
            {
                totalScore += status switch
                {
                    StatusType.Ready => 100,
                    StatusType.Completed => 100,
                    StatusType.Running => 90,
                    StatusType.Processing => 85,
                    StatusType.Syncing => 85,
                    StatusType.Connecting => 80,
                    StatusType.Paused => 70,
                    StatusType.Warning => 60,
                    StatusType.Offline => 40,
                    StatusType.Error => 20,
                    StatusType.Critical => 10,
                    StatusType.Cancelled => 30,
                    _ => 50
                };
            }

            return totalScore / count;
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _statusUpdateTimer?.Stop();
                _statusUpdateTimer?.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    public enum NetworkStatus
    {
        Connected,
        Limited,
        Disconnected
    }
}