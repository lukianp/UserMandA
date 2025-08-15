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
    /// Applications ViewModel using unified loading pipeline
    /// </summary>
    public class ApplicationsViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<ApplicationData> Applications { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => Applications.Count > 0;
        
        public ApplicationsViewModelNew(
            CsvDataServiceNew csvService, 
            ILogger<ApplicationsViewModelNew> logger, 
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
                Logger?.LogDebug($"[{GetType().Name}] Load start");
                
                // Use Applications loader method
                var result = await _csvService.LoadApplicationsAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection
                Applications.Clear();
                foreach (var item in result.Data) 
                    Applications.Add(item);
                
                HasData = Applications.Count > 0;
                
                Logger?.LogInformation($"[{GetType().Name}] Load ok rows={Applications.Count}");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                Logger?.LogError(ex, $"[{GetType().Name}] Load fail");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}