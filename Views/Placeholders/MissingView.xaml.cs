using System.Windows.Controls;
using MandADiscoverySuite.ViewModels.Placeholders;

namespace MandADiscoverySuite.Views.Placeholders
{
    /// <summary>
    /// Placeholder view for missing or unregistered views
    /// </summary>
    public partial class MissingView : UserControl
    {
        public MissingView()
        {
            InitializeComponent();
            DataContext = new MissingViewModel();
        }
    }
}