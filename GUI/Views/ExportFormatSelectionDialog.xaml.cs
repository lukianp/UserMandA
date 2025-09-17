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
            if (ExcelRadioButton?.IsChecked == true)
            {
                SelectedFormat = "Excel";
                WorksheetName = string.IsNullOrWhiteSpace(WorksheetNameTextBox?.Text)
                    ? "Data"
                    : WorksheetNameTextBox.Text.Trim();
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
