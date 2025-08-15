using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for FileServersView.xaml
    /// </summary>
    public partial class FileServersView : UserControl
    {
        public FileServersView()
        {
            InitializeComponent();
            DataContext = new FileServersViewModel();
            Loaded += async (s, e) =>
            {
                if (DataContext is FileServersViewModel vm)
                {
                    await vm.LoadAsync();
                }
            };
        }
    }
}