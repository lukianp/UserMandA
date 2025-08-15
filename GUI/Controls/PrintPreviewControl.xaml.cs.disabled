using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for PrintPreviewControl.xaml
    /// </summary>
    public partial class PrintPreviewControl : UserControl
    {
        public PrintPreviewControl()
        {
            InitializeComponent();
            DataContext = new PrintPreviewViewModel();
        }

        /// <summary>
        /// Gets the print preview view model
        /// </summary>
        public PrintPreviewViewModel ViewModel => DataContext as PrintPreviewViewModel;

        /// <summary>
        /// Sets the content to be previewed for printing
        /// </summary>
        public void SetPrintContent(object content, string title = "")
        {
            ViewModel?.SetPrintContent(content, title);
        }
    }
}