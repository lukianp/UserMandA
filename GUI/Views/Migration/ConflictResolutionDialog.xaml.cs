using System.Windows;
using MandADiscoverySuite.ViewModels.Migration;

namespace MandADiscoverySuite.Views.Migration
{
    /// <summary>
    /// Interaction logic for ConflictResolutionDialog.xaml
    /// T-041: User Account Migration and Synchronization - Conflict Resolution UI
    /// </summary>
    public partial class ConflictResolutionDialog : Window
    {
        public ConflictResolutionDialogViewModel ViewModel { get; }
        
        public bool WasCancelled { get; private set; } = true;

        public ConflictResolutionDialog(ConflictResolutionDialogViewModel viewModel)
        {
            InitializeComponent();
            ViewModel = viewModel;
            DataContext = viewModel;
        }

        private void ApplyButton_Click(object sender, RoutedEventArgs e)
        {
            // Validate that all conflicts have resolution strategies selected
            if (!ViewModel.ValidateAllConflictsResolved())
            {
                MessageBox.Show(
                    "Please select a resolution strategy for all detected conflicts before proceeding.",
                    "Incomplete Resolution",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning);
                return;
            }

            // Apply the resolution
            WasCancelled = false;
            DialogResult = true;
            Close();
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            WasCancelled = true;
            DialogResult = false;
            Close();
        }
    }
}