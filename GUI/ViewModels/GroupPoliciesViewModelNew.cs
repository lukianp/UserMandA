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
    /// Group Policies ViewModel using unified loading pipeline
    /// </summary>
    public class GroupPoliciesViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<PolicyData> GroupPolicies { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => GroupPolicies.Count > 0;
        
        public GroupPoliciesViewModelNew(
            CsvDataServiceNew csvService, 
            ILogger<GroupPoliciesViewModelNew> logger, 
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
                
                // Use GroupPolicies loader method
                var result = await _csvService.LoadGroupPoliciesAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Update data collection
                GroupPolicies.Clear();
                foreach (var item in result.Data) 
                    GroupPolicies.Add(item);
                
                HasData = GroupPolicies.Count > 0;
                
                Logger?.LogInformation($"[{GetType().Name}] Load ok rows={GroupPolicies.Count}");
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