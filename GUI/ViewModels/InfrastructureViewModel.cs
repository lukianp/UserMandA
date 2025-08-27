using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Infrastructure ViewModel using unified loading pipeline
    /// </summary>
    public class InfrastructureViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<InfrastructureData> Infrastructure { get; } = new();
        
        // Commands
        public ICommand ShowAssetDetailCommand { get; private set; }
        
        // Implement HasData for this specific view
        public override bool HasData => Infrastructure.Count > 0;
        
        public InfrastructureViewModel(
            CsvDataServiceNew csvService, 
            ILogger<InfrastructureViewModel> logger, 
            ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            ShowAssetDetailCommand = new RelayCommand<InfrastructureData>(ShowAssetDetail, asset => asset != null);
        }

        /// <summary>
        /// Show detailed asset information in a new tab using TabsService
        /// </summary>
        private async void ShowAssetDetail(InfrastructureData asset)
        {
            if (asset == null) return;

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, 
                    new { action = "show_asset_detail", asset_name = asset.Name }, 
                    "Opening asset detail tab");

                // Use TabsService from MainViewModel to open asset detail tab
                if (MainViewModel.CurrentTabsService != null)
                {
                    var deviceName = asset.Name ?? asset.IPAddress ?? "Unknown Asset";
                    var displayName = asset.Name ?? asset.IPAddress ?? "Unknown Asset";
                    
                    var success = await MainViewModel.CurrentTabsService.OpenAssetDetailTabAsync(
                        deviceName, 
                        displayName);

                    if (success)
                    {
                        _log?.LogInformation("Opened asset detail tab for {AssetName}", asset.Name);
                    }
                    else
                    {
                        _log?.LogWarning("Failed to open asset detail tab for {AssetName}", asset.Name);
                        StatusMessage = "Failed to open asset details";
                    }
                }
                else
                {
                    _log?.LogError("TabsService not available");
                    StatusMessage = "TabsService not available";
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, 
                    new { action = "show_asset_detail_error", asset_name = asset.Name }, 
                    "Failed to open asset detail tab");
                
                _log?.LogError(ex, "Failed to open asset detail tab for {AssetName}", asset.Name);
                StatusMessage = $"Failed to open asset details: {ex.Message}";
            }
        }
        
        /// <summary>
        /// Unified LoadAsync implementation - follows exact specification pattern
        /// </summary>
        public override async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "infrastructure" }, "Starting infrastructure view load");
                
                // Use Infrastructure loader method
                var result = await _csvService.LoadInfrastructureAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners (must be done on UI thread)
                await System.Windows.Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    foreach (var warning in result.HeaderWarnings) 
                        HeaderWarnings.Add(warning);
                });
                
                // Update data collection on UI thread for instant display
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    Infrastructure.Clear();
                    foreach (var item in result.Data) 
                        Infrastructure.Add(item);
                }, System.Windows.Threading.DispatcherPriority.Background);
                
                HasData = Infrastructure.Count > 0;
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "infrastructure", rows = Infrastructure.Count, warnings = HeaderWarnings.Count }, "Infrastructure view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "infrastructure" }, "Failed to load infrastructure view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}