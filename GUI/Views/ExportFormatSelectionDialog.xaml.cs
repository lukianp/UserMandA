using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Dialog for selecting export format and options
    /// </summary>
    public partial class ExportFormatSelectionDialog : Window
    {
        public string SelectedFormat { get; private set; } = "CSV";
        public string WorksheetName { get; private set; } = "Data";
        public bool IncludeCharts { get; private set; } = true;

        public ExportFormatSelectionDialog()
        {
            InitializeComponent();
            DataContext = this;
        }

        private void ExportButton_Click(object sender, RoutedEventArgs e)
        {
            // Determine selected format with null safety checks
            if (ExcelRadioButton?.IsChecked == true)
            {
                SelectedFormat = "Excel";
                WorksheetName = WorksheetNameTextBox?.Text?.Trim();
                if (string.IsNullOrEmpty(WorksheetName))
                    WorksheetName = "Data";
                IncludeCharts = IncludeChartsCheckBox?.IsChecked == true;
            }
            else if (JsonRadioButton?.IsChecked == true)
            {
                SelectedFormat = "JSON";
            }
            else if (CsvRadioButton?.IsChecked == true)
            {
                SelectedFormat = "CSV";
            }
            else
            {
                // Default to CSV if no radio button is selected (shouldn't happen, but defensive programming)
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