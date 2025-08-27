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
    /// Databases ViewModel using unified loading pipeline
    /// </summary>
    public class DatabasesViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<SqlInstanceData> Databases { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => Databases.Count > 0;
        
        public DatabasesViewModel(
            CsvDataServiceNew csvService, 
            ILogger<DatabasesViewModel> logger, 
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
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "databases" }, "Starting databases view load");
                
                // Use Databases loader method
                var result = await _csvService.LoadDatabasesAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection
                Databases.Clear();
                foreach (var item in result.Data) 
                    Databases.Add(item);
                
                HasData = Databases.Count > 0;
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "databases", rows = Databases.Count, warnings = HeaderWarnings.Count }, "Databases view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "databases" }, "Failed to load databases view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}