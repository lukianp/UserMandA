using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for TaskSchedulerView.xaml
    /// </summary>
    public partial class TaskSchedulerView : UserControl
    {
        public TaskSchedulerView()
        {
            InitializeComponent();
        }

        public TaskSchedulerView(TaskSchedulerViewModel viewModel) : this()
        {
            DataContext = viewModel;
        }
    }
}