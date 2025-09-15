using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Views;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for ComputersView - manages infrastructure assets discovery and display
    /// </summary>
    public class ComputersViewModel : BaseViewModel
    {
        private readonly ILogicEngineService _logicEngineService;
        private readonly ILogger<ComputersViewModel> _logger;

        // Simple custom DTO for infrastructure data
        public class InfrastructureItem
        {
            public string? Name { get; set; }
            public string? Type { get; set; }
            public string? Description { get; set; }
            public string? IPAddress { get; set; }
            public string? OperatingSystem { get; set; }
            public string? Version { get; set; }
            public string? Location { get; set; }
            public string? Status { get; set; }
            public string? Manufacturer { get; set; }
            public string? Model { get; set; }
            public DateTime? LastSeen { get; set; }
        }

        // Data collections
        private ObservableCollection<InfrastructureItem> _infrastructure = new();
        private InfrastructureItem? _selectedInfra;
        private InfrastructureItem? _selectedAsset;

        // Commands
        public ICommand RefreshCommand { get; private set; }
        public ICommand ShowAssetDetailCommand { get; private set; }
        public ICommand DoubleClickCommand { get; private set; }

        public ComputersViewModel(
            ILogicEngineService logicEngineService,
            ILogger<ComputersViewModel> logger)
            : base(logger)
        {
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _logger = logger;

            TabTitle = "Computer Inventory";
        }

        #region Properties

        /// <summary>
        /// Infrastructure devices collection
        /// </summary>
        public ObservableCollection<InfrastructureItem> Infrastructure
        {
            get => _infrastructure;
            private set => SetProperty(ref _infrastructure, value);
        }

        /// <summary>
        /// Currently selected infrastructure item
        /// </summary>
        public InfrastructureItem? SelectedInfra
        {
            get => _selectedInfra;
            set => SetProperty(ref _selectedInfra, value);
        }

        /// <summary>
        /// Currently selected asset for detail view
        /// </summary>
        public InfrastructureItem? SelectedAsset
        {
            get => _selectedAsset;
            set => SetProperty(ref _selectedAsset, value);
        }

        #endregion

        #region Command Implementation

        protected override void InitializeCommands()
        {
            base.InitializeCommands();

            RefreshCommand = new AsyncRelayCommand(RefreshAsync);
            ShowAssetDetailCommand = new RelayCommand<InfrastructureItem>(ShowAssetDetail);
            DoubleClickCommand = new RelayCommand<InfrastructureItem>(DoubleClickAssetDetails);
        }

        /// <summary>
        /// Show asset detail window for selected infrastructure item
        /// </summary>
        private void ShowAssetDetail(InfrastructureItem? asset)
        {
            if (asset == null) return;

            StructuredLogger?.LogInfo(LogSourceName,
                new { action = "show_asset_detail", asset_name = asset.Name },
                $"Opening asset detail view for {asset.Name}");

            try
            {
                // Create or get AssetDetailViewModel
                var assetDetailViewModel = GetAssetDetailViewModel(asset);

                // Create AssetDetailWindow
                var assetDetailWindow = new AssetDetailWindow();
                assetDetailWindow.DataContext = assetDetailViewModel;
                assetDetailWindow.Show();

                StructuredLogger?.LogInfo(LogSourceName,
                    new { action = "asset_detail_window_opened", asset_name = asset.Name },
                    $"Asset detail window opened successfully");

            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName,
                    new { action = "show_asset_detail_failed", asset_name = asset.Name, error = ex.Message },
                    $"Failed to open asset detail: {ex.Message}");

                StatusMessage = $"Failed to open asset details: {ex.Message}";
            }
        }

        /// <summary>
        /// Handle double-click on asset item
        /// </summary>
        private void DoubleClickAssetDetails(InfrastructureItem? asset)
        {
            if (asset != null)
            {
                ShowAssetDetail(asset);
            }
        }

        /// <summary>
        /// Get or create AssetDetailViewModel for the asset
        /// </summary>
        private AssetDetailViewModel GetAssetDetailViewModel(InfrastructureItem asset)
        {
            // For now, create a new instance with the asset name
            // In a more advanced implementation, this could be cached or resolved through dependency injection
            var assetDetailViewModel = new AssetDetailViewModel(
                _logicEngineService,
                _logger);

            // Set the selected device name to load asset details
            assetDetailViewModel.SelectedDeviceName = asset.Name;

            return assetDetailViewModel;
        }

        /// <summary>
        /// Refresh the infrastructure data
        /// </summary>
        private async Task RefreshAsync()
        {
            await LoadInfrastructureAsync();
        }

        #endregion

        #region Data Loading

        /// <summary>
        /// Load infrastructure devices from LogicEngineService
        /// </summary>
        private async Task LoadInfrastructureAsync()
        {
            await ExecuteAsync(async () =>
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "loading_start" }, "Loading infrastructure devices");

                // Get infrastructure devices from LogicEngineService
                var devices = await _logicEngineService.GetDevicesAsync();

                Infrastructure.Clear();
                foreach (var device in devices)
                {
                    var infraItem = new InfrastructureItem
                    {
                        Name = device.Name,
                        Type = "Computer", // Default type for devices
                        Description = $"{device.OS ?? "Unknown OS"} device in {device.OU ?? "Unknown OU"}",
                        IPAddress = device.DNS, // Use DNS as IP address approximation
                        OperatingSystem = device.OS,
                        Version = null, // Not available in DeviceDto
                        Location = device.OU,
                        Status = "Unknown", // Not available in DeviceDto
                        Manufacturer = null, // Not available in DeviceDto
                        Model = null, // Not available in DeviceDto
                        LastSeen = device.DiscoveryTimestamp
                    };
                    Infrastructure.Add(infraItem);
                }

                StructuredLogger?.LogInfo(LogSourceName,
                    new { action = "infrastructure_loaded", device_count = Infrastructure.Count },
                    $"Loaded {Infrastructure.Count} infrastructure devices");

            }, "Loading infrastructure devices");
        }

        /// <summary>
        /// Generate mock infrastructure data for testing
        /// </summary>
        private List<InfrastructureItem> GenerateMockInfrastructure()
        {
            return new List<InfrastructureItem>
            {
                new InfrastructureItem
                {
                    Name = "WORKSTATION-001",
                    Type = "Windows Workstation",
                    Description = "Primary workstation in IT Department",
                    IPAddress = "192.168.1.100",
                    OperatingSystem = "Windows 10 Pro",
                    Version = "21H2",
                    Location = "IT Department",
                    Status = "Online",
                    Manufacturer = "Dell Inc.",
                    Model = "Latitude 5420",
                    LastSeen = DateTime.Now.AddMinutes(-5)
                },
                new InfrastructureItem
                {
                    Name = "SERVER-AD-01",
                    Type = "Windows Server",
                    Description = "Active Directory Domain Controller",
                    IPAddress = "192.168.1.10",
                    OperatingSystem = "Windows Server 2022",
                    Version = "21H2",
                    Location = "Server Room",
                    Status = "Online",
                    Manufacturer = "HPE",
                    Model = "ProLiant DL380 Gen10",
                    LastSeen = DateTime.Now.AddMinutes(-2)
                },
                new InfrastructureItem
                {
                    Name = "LAPTOP-FINANCE-005",
                    Type = "Laptop",
                    Description = "Finance Department laptop",
                    IPAddress = "192.168.1.150",
                    OperatingSystem = "Windows 11 Pro",
                    Version = "22H2",
                    Location = "Finance Department",
                    Status = "Offline",
                    Manufacturer = "Lenovo",
                    Model = "ThinkPad X1 Carbon",
                    LastSeen = DateTime.Now.AddHours(-2)
                }
            };
        }

        #endregion

        #region Lifecycle

        public override async Task LoadAsync()
        {
            await LoadInfrastructureAsync();
        }

        #endregion
    }
}