using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class GroupPoliciesViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private readonly MainViewModel _mainViewModel;
        private PolicyData _selectedPolicy;

        public ObservableCollection<PolicyData> Policies { get; } = new();

        public PolicyData SelectedPolicy
        {
            get => _selectedPolicy;
            set => SetProperty(ref _selectedPolicy, value);
        }

        public ICommand OpenPolicyDetailCommand { get; }
        public ICommand RefreshPoliciesCommand { get; }

        public GroupPoliciesViewModel(CsvDataService csvDataService, MainViewModel mainViewModel)
        {
            _csvDataService = csvDataService;
            _mainViewModel = mainViewModel;

            OpenPolicyDetailCommand = new RelayCommand<PolicyData>(p => OpenPolicyDetail(p ?? SelectedPolicy));
            RefreshPoliciesCommand = new AsyncRelayCommand(RefreshPoliciesAsync);

            _ = RefreshPoliciesAsync();
        }

        private void OpenPolicyDetail(PolicyData policy)
        {
            if (policy == null) return;

            var vm = new PolicyDetailViewModel(policy, _csvDataService, _mainViewModel);
            var view = new MandADiscoverySuite.Views.PolicyDetailView { DataContext = vm };
            var window = new System.Windows.Window
            {
                Title = $"Policy Details - {policy.Name}",
                Content = view,
                Width = 900,
                Height = 600
            };
            window.Show();
        }

        public async Task RefreshPoliciesAsync()
        {
            var profileService = SimpleServiceLocator.GetService<IProfileService>();
            var currentProfile = await profileService?.GetCurrentProfileAsync();
            var profileName = currentProfile?.CompanyName ?? "ljpops";

            var list = await _csvDataService.LoadGroupPoliciesAsync(profileName);
            Policies.Clear();
            foreach (var p in list)
                Policies.Add(p);
        }
    }
}
