using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class PolicyDetailViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private readonly MainViewModel _mainViewModel;

        public PolicyData Policy { get; }
        public ObservableCollection<UserData> AffectedUsers { get; } = new();
        public ObservableCollection<InfrastructureData> AffectedComputers { get; } = new();
        public ObservableCollection<GroupData> AffectedGroups { get; } = new();
        public ObservableCollection<ApplicationData> AffectedApplications { get; } = new();
        public ObservableCollection<PolicyData> ChildPolicies { get; } = new();
        public ObservableCollection<PolicyData> LinkedPolicies { get; } = new();

        public PolicyDetailViewModel(PolicyData policy, CsvDataService csvDataService, MainViewModel mainViewModel)
        {
            Policy = policy;
            _csvDataService = csvDataService;
            _mainViewModel = mainViewModel;
            _ = LoadAsync();
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            try
            {
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                if (!string.IsNullOrWhiteSpace(Policy.SecurityFiltering))
                {
                    var ids = Policy.SecurityFiltering.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => s.Trim());
                    var users = (await _csvDataService.LoadUsersAsync(profileName)).ToDictionary(u => u.Id ?? u.UserPrincipalName);
                    var groups = (await _csvDataService.LoadGroupsAsync(profileName)).ToDictionary(g => g.Id ?? g.DisplayName);
                    foreach (var id in ids)
                    {
                        if (users.TryGetValue(id, out var user))
                            AffectedUsers.Add(user);
                        if (groups.TryGetValue(id, out var group))
                            AffectedGroups.Add(group);
                    }
                }

                if (!string.IsNullOrWhiteSpace(Policy.LinkedOUs))
                {
                    var computers = await _csvDataService.LoadInfrastructureAsync(profileName);
                    foreach (var comp in computers)
                    {
                        var ou = comp.Location ?? comp.Domain ?? comp.Name;
                        if (!string.IsNullOrEmpty(ou) && Policy.LinkedOUs.Contains(ou, StringComparison.OrdinalIgnoreCase))
                            AffectedComputers.Add(comp);
                    }
                }

                var apps = await _csvDataService.LoadApplicationsAsync(profileName);
                foreach (var app in apps)
                {
                    if (!string.IsNullOrWhiteSpace(app.Description) && Policy.Name != null &&
                        app.Description.Contains(Policy.Name, StringComparison.OrdinalIgnoreCase))
                    {
                        AffectedApplications.Add(app);
                    }
                }

                // Update relationship graph
                var rel = AssetRelationshipService.Instance;
                rel.AddOrUpdatePolicy(Policy);
                foreach (var u in AffectedUsers)
                    rel.CreateRelationship("policy", Policy.Id ?? Policy.Name, "user", u.Id ?? u.UserPrincipalName, "applies_to");
                foreach (var g in AffectedGroups)
                    rel.CreateRelationship("policy", Policy.Id ?? Policy.Name, "group", g.Id ?? g.DisplayName, "applies_to");
                foreach (var c in AffectedComputers)
                    rel.CreateRelationship("policy", Policy.Id ?? Policy.Name, "asset", c.Id ?? c.Name, "applies_to");
                foreach (var a in AffectedApplications)
                    rel.CreateRelationship("policy", Policy.Id ?? Policy.Name, "application", a.Id ?? a.Name, "applies_to");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
