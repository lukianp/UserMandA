using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// ShareGate-quality file system migration control with comprehensive UI
    /// </summary>
    public partial class FileSystemMigrationControl : UserControl
    {
        public FileSystemMigrationControl()
        {
            InitializeComponent();
            
            // Set up the ViewModel
            DataContext = new FileSystemMigrationViewModel();
        }

        /// <summary>
        /// Get the current migration ViewModel
        /// </summary>
        public FileSystemMigrationViewModel ViewModel => DataContext as FileSystemMigrationViewModel;
    }
}