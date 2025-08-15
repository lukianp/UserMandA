using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for DatabasesView.xaml
    /// </summary>
    public partial class DatabasesView : UserControl
    {
        public DatabasesView()
        {
            InitializeComponent();
            DataContext = new DatabasesViewModel();
            Loaded += async (s, e) =>
            {
                if (DataContext is DatabasesViewModel vm)
                {
                    await vm.LoadAsync();
                }
            };
        }
    }
}