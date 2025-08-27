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
    /// Group Policies ViewModel using unified loading pipeline
    /// </summary>
    public class GroupPoliciesViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<PolicyData> GroupPolicies { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => GroupPolicies.Count > 0;
        
        public GroupPoliciesViewModel(
            CsvDataServiceNew csvService, 
            ILogger<GroupPoliciesViewModel> logger, 
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
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "group_policies" }, "Starting group policies view load");
                
                // Use GroupPolicies loader method
                var result = await _csvService.LoadGroupPoliciesAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners (must be done on UI thread)
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    foreach (var warning in result.HeaderWarnings) 
                        HeaderWarnings.Add(warning);
                });
                
                // Update data collection (must be done on UI thread)
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    GroupPolicies.Clear();
                    foreach (var item in result.Data) 
                        GroupPolicies.Add(item);
                });
                
                HasData = GroupPolicies.Count > 0;
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "group_policies", rows = GroupPolicies.Count, warnings = HeaderWarnings.Count }, "Group policies view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "group_policies" }, "Failed to load group policies view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}