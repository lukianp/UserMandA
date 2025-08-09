using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Views;

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
                // Create UserDetailData object for the asset owner
                var userData = new UserDetailData
                {
                    DisplayName = asset.Owner,
                    Title = "Asset Owner",
                    LastUpdated = System.DateTime.Now
                };
                var window = new UserDetailWindow(userData);
                window.Owner = Window.GetWindow(this);
                window.ShowDialog();
            }
        }
    }
}
