using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Applications ViewModel using unified loading pipeline
    /// </summary>
    public class ApplicationsViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<ApplicationData> Applications { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => Applications.Count > 0;
        
        public ApplicationsViewModel(
            CsvDataServiceNew csvService, 
            ILogger<ApplicationsViewModel> logger, 
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
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "applications" }, "Starting applications view load");
                
                // Use Applications loader method
                var result = await _csvService.LoadApplicationsAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners (must be done on UI thread)
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    foreach (var warning in result.HeaderWarnings) 
                        HeaderWarnings.Add(warning);
                });
                
                // Update data collection (must be done on UI thread)
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    Applications.Clear();
                    foreach (var item in result.Data) 
                        Applications.Add(item);
                });
                
                HasData = Applications.Count > 0;
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "applications", rows = Applications.Count, warnings = HeaderWarnings.Count }, "Applications view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "applications" }, "Failed to load applications view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}