using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ReportBuilderView.xaml
    /// </summary>
    public partial class ReportBuilderView : UserControl
    {
        public ReportBuilderView()
        {
            InitializeComponent();
            DataContext = new ReportBuilderViewModel();
        }

        private void UserControl_Loaded(object sender, System.Windows.RoutedEventArgs e)
        {
            // Set up WebBrowser for preview if needed
            if (DataContext is ReportBuilderViewModel viewModel)
            {
                viewModel.PropertyChanged += ViewModel_PropertyChanged;
            }
        }

        private void ViewModel_PropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(ReportBuilderViewModel.PreviewContent))
            {
                if (DataContext is ReportBuilderViewModel viewModel && !string.IsNullOrEmpty(viewModel.PreviewContent))
                {
                    PreviewBrowser.NavigateToString(viewModel.PreviewContent);
                }
            }
        }
    }
}