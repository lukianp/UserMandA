using System;
using System.Diagnostics;
using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite
{
    public partial class ErrorDialog : Window
    {
        public enum ErrorDialogResult
        {
            Close,
            Retry,
            Ignore
        }

        public ErrorDialogResult Result { get; private set; } = ErrorDialogResult.Close;
        
        private readonly ErrorDialogViewModel _viewModel;

        public ErrorDialog()
        {
            InitializeComponent();
            
            _viewModel = new ErrorDialogViewModel();
            _viewModel.DialogClosed += OnDialogClosed;
            DataContext = _viewModel;
        }

        private void OnDialogClosed(object sender, ErrorDialogViewModel.ErrorDialogResult result)
        {
            Result = (ErrorDialogResult)result;
            DialogResult = result != ErrorDialogViewModel.ErrorDialogResult.Close;
            Close();
        }

        public static ErrorDialogResult ShowError(Window owner, string message, Exception ex = null, string operation = null)
        {
            var dialog = new ErrorDialog();
            dialog.Owner = owner;
            dialog.SetError(message, ex, operation);
            dialog.ShowDialog();
            return dialog.Result;
        }

        public void SetError(string message, Exception ex, string operation = null)
        {
            _viewModel.SetError(message, ex, operation);
        }



        private void Copy_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var errorInfo = $"M&A Discovery Suite Error Report\n" +
                               $"================================\n" +
                               $"Timestamp: {_viewModel.Timestamp}\n" +
                               $"Title: {_viewModel.Title}\n" +
                               $"Message: {_viewModel.ErrorMessage}\n" +
                               $"Details: {_viewModel.ExceptionDetails}\n";

                Clipboard.SetText(errorInfo);
                
                // Show brief feedback
                CopyButton.Content = "✅ Copied!";
                var timer = new System.Windows.Threading.DispatcherTimer();
                timer.Interval = TimeSpan.FromSeconds(2);
                timer.Tick += (s, args) =>
                {
                    CopyButton.Content = "📋 Copy Error";
                    timer.Stop();
                };
                timer.Start();
            }
            catch
            {
                MessageBox.Show("Failed to copy error information to clipboard.", "Copy Failed", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void Report_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var subject = Uri.EscapeDataString($"M&A Discovery Suite Error Report - {_viewModel.Title}");
                var body = Uri.EscapeDataString(
                    $"Please describe what you were doing when this error occurred:\n\n" +
                    $"[Your description here]\n\n" +
                    $"Error Details:\n" +
                    $"Timestamp: {_viewModel.Timestamp}\n" +
                    $"Message: {_viewModel.ErrorMessage}\n" +
                    $"Details: {_viewModel.ExceptionDetails}");

                var mailtoUri = $"mailto:support@example.com?subject={subject}&body={body}";
                Process.Start(new ProcessStartInfo(mailtoUri) { UseShellExecute = true });
            }
            catch
            {
                MessageBox.Show("Failed to open email client. Please manually send error details to support@example.com", 
                    "Report Failed", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            _viewModel.DialogClosed -= OnDialogClosed;
            base.OnClosed(e);
        }
    }
}