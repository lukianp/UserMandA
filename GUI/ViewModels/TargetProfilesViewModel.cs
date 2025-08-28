using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace MandADiscoverySuite.ViewModels
{
    public partial class TargetProfilesViewModel : ObservableObject
    {
        public ObservableCollection<TargetProfile> Profiles { get; } = new();

        private TargetProfile _selected;
        public TargetProfile Selected
        {
            get => _selected;
            set => SetProperty(ref _selected, value);
        }

        private string _name;
        public string Name { get => _name; set => SetProperty(ref _name, value); }
        private string _tenantId;
        public string TenantId { get => _tenantId; set => SetProperty(ref _tenantId, value); }
        private string _clientId;
        public string ClientId { get => _clientId; set => SetProperty(ref _clientId, value); }
        private string _clientSecret;
        // Plain text input only; never persisted directly
        public string ClientSecret { get => _clientSecret; set => SetProperty(ref _clientSecret, value); }
        private string _scopesCsv = "User.Read.All,Group.Read.All";
        public string ScopesCsv { get => _scopesCsv; set => SetProperty(ref _scopesCsv, value); }

        public IAsyncRelayCommand LoadCommand { get; }
        public IAsyncRelayCommand SaveCommand { get; }
        public IAsyncRelayCommand DeleteCommand { get; }
        public IAsyncRelayCommand TestConnectionCommand { get; }
        public IRelayCommand NewCommand { get; }

        public TargetProfilesViewModel()
        {
            LoadCommand = new AsyncRelayCommand(LoadAsync);
            SaveCommand = new AsyncRelayCommand(SaveAsync);
            DeleteCommand = new AsyncRelayCommand(DeleteAsync);
            TestConnectionCommand = new AsyncRelayCommand(TestConnectionAsync);
            NewCommand = new RelayCommand(NewProfile);
        }

        private async Task<string> GetCompanyAsync()
        {
            var p = await ProfileService.Instance.GetCurrentProfileAsync();
            return p?.CompanyName ?? "default";
        }

        private async Task LoadAsync()
        {
            Profiles.Clear();
            var company = await GetCompanyAsync();
            var items = await TargetProfileService.Instance.GetProfilesAsync(company);
            foreach (var p in items.OrderBy(x => x.Name)) Profiles.Add(p);
        }

        private void NewProfile()
        {
            Selected = null;
            Name = string.Empty;
            TenantId = string.Empty;
            ClientId = string.Empty;
            ClientSecret = string.Empty;
            ScopesCsv = "User.Read.All,Group.Read.All";
        }

        private async Task SaveAsync()
        {
            var company = await GetCompanyAsync();
            var profile = Selected ?? new TargetProfile();
            profile.Name = Name?.Trim() ?? string.Empty;
            profile.TenantId = TenantId?.Trim() ?? string.Empty;
            profile.ClientId = ClientId?.Trim() ?? string.Empty;
            profile.Scopes = (ScopesCsv ?? string.Empty)
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim()).Where(s => !string.IsNullOrWhiteSpace(s)).ToList();

            await TargetProfileService.Instance.CreateOrUpdateAsync(company, profile, ClientSecret);
            ClientSecret = string.Empty; // clear from memory/UI
            await LoadAsync();
            Selected = Profiles.FirstOrDefault(p => p.Id == profile.Id);
        }

        private async Task DeleteAsync()
        {
            if (Selected == null) return;
            var company = await GetCompanyAsync();
            await TargetProfileService.Instance.DeleteAsync(company, Selected.Id);
            await LoadAsync();
            NewProfile();
        }

        private async Task TestConnectionAsync()
        {
            if (Selected == null)
            {
                System.Windows.MessageBox.Show("Select a profile first.");
                return;
            }
            var company = await GetCompanyAsync();
            var secret = await TargetProfileService.Instance.GetClientSecretAsync(company, Selected.Id);
            if (string.IsNullOrWhiteSpace(Selected.TenantId) || string.IsNullOrWhiteSpace(Selected.ClientId) || string.IsNullOrWhiteSpace(secret))
            {
                System.Windows.MessageBox.Show("Missing credentials. Please fill Tenant ID, Client ID and Client Secret.");
                return;
            }
            // Stubbed: real implementation would attempt token acquisition.
            System.Windows.MessageBox.Show("Connectivity test succeeded (stub).", "Target Profiles", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Information);
        }
    }
}
