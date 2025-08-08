using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class SecurityGroupInventoryViewModel : BaseViewModel
    {
        private readonly IDetailWindowService _detailWindowService;
        public ObservableCollection<SecurityGroupInfo> Groups { get; }

        private SecurityGroupInfo _selectedGroup;
        public SecurityGroupInfo SelectedGroup
        {
            get => _selectedGroup;
            set { _selectedGroup = value; OnPropertyChanged(); }
        }

        public ICommand OpenGroupCommand { get; }

        public SecurityGroupInventoryViewModel() : this(new DetailWindowService()) { }

        public SecurityGroupInventoryViewModel(IDetailWindowService detailWindowService)
        {
            _detailWindowService = detailWindowService;
            Groups = new ObservableCollection<SecurityGroupInfo>();
            OpenGroupCommand = new AsyncRelayCommand(OpenSelectedGroupAsync, () => SelectedGroup != null);
        }

        private async Task OpenSelectedGroupAsync()
        {
            if (SelectedGroup == null) return;
            var detail = new GroupDetailData
            {
                Id = SelectedGroup.SamAccountName,
                GroupName = SelectedGroup.Name,
                Description = SelectedGroup.Description,
                GroupType = SelectedGroup.GroupType,
                Scope = SelectedGroup.Scope
            };
            await _detailWindowService.ShowDetailWindowAsync(detail);
        }
    }
}
