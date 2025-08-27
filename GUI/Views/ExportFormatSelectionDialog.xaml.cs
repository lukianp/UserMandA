using System.Windows;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Dialog for selecting export format and options
    /// </summary>
    public partial class ExportFormatSelectionDialog : Window
    {
        public ExportFormatSelectionDialog()
        {
            InitializeComponent();
        }

        public string SelectedFormat { get; private set; } = "CSV";
        public string WorksheetName { get; private set; } = "Data";
        public bool IncludeCharts { get; private set; } = true;

        private void ExportButton_Click(object sender, RoutedEventArgs e)
        {
            // Determine selected format
            if (ExcelRadioButton.IsChecked == true)
            {
                SelectedFormat = "Excel";
                WorksheetName = WorksheetNameTextBox.Text?.Trim();
                if (string.IsNullOrEmpty(WorksheetName))
                    WorksheetName = "Data";
                IncludeCharts = IncludeChartsCheckBox.IsChecked == true;
            }
            else if (JsonRadioButton.IsChecked == true)
            {
                SelectedFormat = "JSON";
            }
            else
            {
                SelectedFormat = "CSV";
            }

            DialogResult = true;
            Close();
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }
    }
}