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
    /// File Servers ViewModel using unified loading pipeline
    /// </summary>
    public class FileServersViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<FileServerData> FileServers { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => FileServers.Count > 0;
        
        public FileServersViewModel(
            CsvDataServiceNew csvService, 
            ILogger<FileServersViewModel> logger, 
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
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "file_servers" }, "Starting file servers view load");
                
                // Use FileServers loader method
                var result = await _csvService.LoadFileServersAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection on UI thread to prevent CollectionView threading violations
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    FileServers.Clear();
                    foreach (var item in result.Data) 
                        FileServers.Add(item);
                });
                
                HasData = FileServers.Count > 0;
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "file_servers", rows = FileServers.Count, warnings = HeaderWarnings.Count }, "File servers view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "file_servers" }, "Failed to load file servers view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}