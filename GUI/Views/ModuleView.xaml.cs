using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Base view for all discovery modules, providing common UI components
    /// and error handling for CSV data loading and module execution.
    /// </summary>
    public partial class ModuleView : UserControl
    {
        public ModuleView()
        {
            InitializeComponent();
        }
    }
}