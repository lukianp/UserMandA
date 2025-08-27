using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Security ViewModel using unified loading pipeline
    /// </summary>
    public class SecurityViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collections
        public ObservableCollection<GroupData> SecurityGroups { get; } = new();
        public ObservableCollection<PolicyData> GroupPolicies { get; } = new();
        
        // Implement HasData for this specific view
        public override bool HasData => SecurityGroups.Count > 0 || GroupPolicies.Count > 0;
        
        public SecurityViewModel(
            CsvDataServiceNew csvService, 
            ILogger<SecurityViewModel> logger, 
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
            var sw = Stopwatch.StartNew();
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "security" }, "Starting security view load");
                
                // Get current profile
                var profile = _profileService.CurrentProfile ?? "ljpops";
                
                // Load security groups and policies with header verification
                var groupsResult = await _csvService.LoadGroupsAsync(profile);
                var policiesResult = await _csvService.LoadGroupPoliciesAsync(profile);
                
                // Collect header warnings from both results
                foreach (var warning in groupsResult.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                foreach (var warning in policiesResult.HeaderWarnings) 
                    HeaderWarnings.Add(warning);
                
                // Clear existing data
                SecurityGroups.Clear();
                GroupPolicies.Clear();
                
                // Load groups
                foreach (var group in groupsResult.Data) 
                    SecurityGroups.Add(group);
                    
                // Load policies  
                foreach (var policy in policiesResult.Data) 
                    GroupPolicies.Add(policy);
                
                HasData = SecurityGroups.Count > 0 || GroupPolicies.Count > 0;
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "security", groups = SecurityGroups.Count, policies = GroupPolicies.Count, warnings = HeaderWarnings.Count, elapsed_ms = sw.ElapsedMilliseconds }, "Security view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Failed to load security data: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "security" }, "Failed to load security view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }

    }
}