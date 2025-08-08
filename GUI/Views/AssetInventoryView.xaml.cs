using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    public partial class AssetInventoryView : UserControl
    {
        public AssetInventoryView()
        {
            InitializeComponent();
        }

        private void AssetGrid_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            if (sender is DataGrid grid && grid.SelectedItem is AssetData asset && !string.IsNullOrEmpty(asset.Owner))
            {
                // For demo purposes we use the owner's name to resolve data path.
                var rawPath = ConfigurationService.Instance.GetCompanyRawDataPath("DefaultCompany");
                var window = new UserDetailWindow(new { DisplayName = asset.Owner }, rawPath);
                window.Owner = Window.GetWindow(this);
                window.ShowDialog();
            }
        }
    }
}
