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
    public class InfrastructureViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<InfrastructureData> Infrastructure { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => Infrastructure.Count > 0;
        
        public InfrastructureViewModelNew(
            CsvDataServiceNew csvService, 
            ILogger<InfrastructureViewModelNew> logger, 
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
                
                // Use Infrastructure loader method
                var result = await _csvService.LoadInfrastructureAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection
                Infrastructure.Clear();
                foreach (var item in result.Data) 
                    Infrastructure.Add(item);
                
                HasData = Infrastructure.Count > 0;
                
                Logger?.LogInformation($"[{GetType().Name}] Load ok rows={Infrastructure.Count}");
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