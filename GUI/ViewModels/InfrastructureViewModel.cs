using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
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