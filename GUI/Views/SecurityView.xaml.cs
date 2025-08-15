using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SecurityView.xaml
    /// </summary>
    public partial class SecurityView : UserControl
    {
        public SecurityView()
        {
            InitializeComponent();
            DataContext = new SecurityViewModel();
            Loaded += async (s, e) =>
            {
                if (DataContext is SecurityViewModel vm)
                {
                    await vm.LoadAsync();
                }
            };
        }
    }
}