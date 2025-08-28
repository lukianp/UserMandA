using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Dialogs
{
    /// <summary>
    /// Wave scheduling dialog with comprehensive scheduling controls, blackout periods,
    /// and notification settings. Implements T-033 scheduling UI requirements.
    /// </summary>
    public partial class WaveSchedulingDialog : Window
    {
        public WaveSchedulingDialogViewModel ViewModel => DataContext as WaveSchedulingDialogViewModel;

        public WaveSchedulingDialog()
        {
            InitializeComponent();
            DataContext = new WaveSchedulingDialogViewModel();
            
            // Handle dialog result from view model
            if (ViewModel != null)
            {
                ViewModel.DialogResultRequested += (sender, result) =>
                {
                    DialogResult = result;
                    Close();
                };
            }
        }

        public WaveSchedulingDialog(WaveSchedulingDialogViewModel viewModel) : this()
        {
            if (viewModel != null)
            {
                DataContext = viewModel;
                viewModel.DialogResultRequested += (sender, result) =>
                {
                    DialogResult = result;
                    Close();
                };
            }
        }

        protected override void OnSourceInitialized(System.EventArgs e)
        {
            base.OnSourceInitialized(e);
            
            // Initialize view model after window is loaded
            ViewModel?.InitializeAsync();
        }
    }
}