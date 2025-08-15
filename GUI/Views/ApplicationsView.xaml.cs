using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ApplicationsView.xaml
    /// </summary>
    public partial class ApplicationsView : UserControl
    {
        public ApplicationsView()
        {
            InitializeComponent();
            DataContext = new ApplicationsMainViewModel();
            Loaded += async (s, e) =>
            {
                if (DataContext is ApplicationsMainViewModel vm)
                {
                    await vm.LoadAsync();
                }
            };
        }
    }
}