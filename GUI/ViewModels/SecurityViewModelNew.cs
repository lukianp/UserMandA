using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Security ViewModel using new unified architecture
    /// Handles security groups, policies, and security-related data
    /// </summary>
    public class SecurityViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ILogger<SecurityViewModelNew> _logger;
        private readonly ProfileService _profileService;

        private ObservableCollection<GroupData> _securityGroups;
        private ObservableCollection<PolicyData> _groupPolicies;
        private bool _isLoading;
        private string _searchText = string.Empty;

        public ObservableCollection<GroupData> SecurityGroups
        {
            get => _securityGroups;
            set => SetProperty(ref _securityGroups, value);
        }

        public ObservableCollection<PolicyData> GroupPolicies
        {
            get => _groupPolicies;
            set => SetProperty(ref _groupPolicies, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public string SearchText
        {
            get => _searchText;
            set => SetProperty(ref _searchText, value);
        }

        public SecurityViewModelNew(CsvDataServiceNew csvService, ILogger<SecurityViewModelNew> logger, ProfileService profileService)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            SecurityGroups = new ObservableCollection<GroupData>();
            GroupPolicies = new ObservableCollection<PolicyData>();

            _logger.LogInformation("SecurityViewModelNew initialized");
        }

        /// <summary>
        /// Load security-related data
        /// </summary>
        public override async Task LoadAsync()
        {
            if (IsLoading) return;

            try
            {
                IsLoading = true;
                _logger.LogInformation("Loading security data...");

                // Load security groups and policies in parallel
                var groupsTask = LoadSecurityGroupsAsync();
                var policiesTask = LoadGroupPoliciesAsync();

                await Task.WhenAll(groupsTask, policiesTask);

                _logger.LogInformation($"Security data loaded - Groups: {SecurityGroups.Count}, Policies: {GroupPolicies.Count}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading security data");
                ErrorMessage = "Failed to load security data: " + ex.Message;
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadSecurityGroupsAsync()
        {
            try
            {
                var result = await _csvService.LoadGroupsAsync(_profileService.CurrentProfile ?? "default");
                
                SecurityGroups.Clear();
                if (result.Data != null)
                {
                    foreach (var group in result.Data)
                    {
                        SecurityGroups.Add(group);
                    }
                }

                _logger.LogInformation($"Loaded {SecurityGroups.Count} security groups");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load security groups");
                ErrorMessage = "Failed to load security groups: " + ex.Message;
                HasErrors = true;
            }
        }

        private async Task LoadGroupPoliciesAsync()
        {
            try
            {
                var result = await _csvService.LoadGroupPoliciesAsync(_profileService.CurrentProfile ?? "default");
                
                GroupPolicies.Clear();
                if (result.Data != null)
                {
                    foreach (var policy in result.Data)
                    {
                        GroupPolicies.Add(policy);
                    }
                }

                _logger.LogInformation($"Loaded {GroupPolicies.Count} group policies");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load group policies");
                ErrorMessage = "Failed to load group policies: " + ex.Message;
                HasErrors = true;
            }
        }
    }
}