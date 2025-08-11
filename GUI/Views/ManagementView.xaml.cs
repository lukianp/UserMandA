using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ManagementView.xaml
    /// </summary>
    public partial class ManagementView : UserControl
    {
        public ManagementView()
        {
            InitializeComponent();
        }

        private void UserControl_Loaded(object sender, System.Windows.RoutedEventArgs e)
        {
            // Ensure DataContext is properly set - this is for debugging
            if (DataContext is ManagementViewModel viewModel)
            {
                // DataContext is properly inherited, this is good
                System.Diagnostics.Debug.WriteLine($"ManagementView loaded with DataContext: {viewModel.GetType().Name}");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"ManagementView loaded with unexpected DataContext: {DataContext?.GetType().Name ?? "null"}");
                // If DataContext is null or incorrect, try to set it manually
                if (DataContext == null)
                {
                    // Create a new ManagementViewModel if none exists
                    DataContext = new ManagementViewModel();
                    System.Diagnostics.Debug.WriteLine("ManagementView: Created new ManagementViewModel");
                }
            }
        }
    }
}