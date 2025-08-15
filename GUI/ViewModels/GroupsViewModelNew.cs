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
    /// Groups ViewModel using unified loading pipeline
    /// </summary>
    public class GroupsViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<GroupData> Groups { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => Groups.Count > 0;
        
        public GroupsViewModelNew(
            CsvDataServiceNew csvService, 
            ILogger<GroupsViewModelNew> logger, 
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
                
                // Use Groups loader method
                var result = await _csvService.LoadGroupsAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection
                Groups.Clear();
                foreach (var item in result.Data) 
                    Groups.Add(item);
                
                HasData = Groups.Count > 0;
                
                Logger?.LogInformation($"[{GetType().Name}] Load ok rows={Groups.Count}");
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