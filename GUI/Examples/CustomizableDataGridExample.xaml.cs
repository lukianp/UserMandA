using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.Behaviors;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Views;

namespace MandADiscoverySuite.Examples
{
    /// <summary>
    /// Interaction logic for CustomizableDataGridExample.xaml
    /// </summary>
    public partial class CustomizableDataGridExample : UserControl
    {
        public CustomizableDataGridExample()
        {
            InitializeComponent();
            DataContext = new CustomizableDataGridExampleViewModel();
        }

        private void ColumnChooserButton_Click(object sender, RoutedEventArgs e)
        {
            var configuration = DataGridColumnCustomizationBehavior.GetColumnConfiguration(MainDataGrid);
            if (configuration != null)
            {
                var chooserViewModel = new ColumnChooserViewModel(configuration);
                var chooserDialog = new ColumnChooserDialog
                {
                    DataContext = chooserViewModel,
                    Owner = Window.GetWindow(this),
                    WindowStartupLocation = WindowStartupLocation.CenterOwner
                };

                if (chooserDialog.ShowDialog() == true)
                {
                    DataGridColumnCustomizationBehavior.SetColumnConfiguration(MainDataGrid, chooserViewModel.Configuration);
                }
            }
        }
    }
}