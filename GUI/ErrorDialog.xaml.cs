using System;
using System.Diagnostics;
using System.Windows;

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
        
        private Exception exception;
        private string operation;
        private bool detailsVisible = false;

        public ErrorDialog()
        {
            InitializeComponent();
            TimestampText.Text = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
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
            this.exception = ex;
            this.operation = operation;

            ErrorMessageText.Text = message;

            if (!string.IsNullOrEmpty(operation))
            {
                TitleText.Text = $"Error in {operation}";
            }

            if (ex != null)
            {
                DetailsText.Text = $"Exception Type: {ex.GetType().Name}\n" +
                                  $"Message: {ex.Message}\n" +
                                  $"Source: {ex.Source ?? "Unknown"}\n" +
                                  $"Target Site: {ex.TargetSite?.Name ?? "Unknown"}";

                StackTraceText.Text = ex.StackTrace ?? "No stack trace available";
                
                // Show toggle button if we have details
                ToggleDetailsButton.Visibility = Visibility.Visible;
            }
            else
            {
                ToggleDetailsButton.Visibility = Visibility.Collapsed;
            }

            // Hide retry button if no operation specified
            if (string.IsNullOrEmpty(operation))
            {
                RetryButton.Visibility = Visibility.Collapsed;
            }
        }

        private void ToggleDetails_Click(object sender, RoutedEventArgs e)
        {
            detailsVisible = !detailsVisible;
            
            if (detailsVisible)
            {
                DetailsScrollViewer.Visibility = Visibility.Visible;
                ToggleDetailsButton.Content = "▲ Hide Details";
                Height = Math.Max(Height, 600);
            }
            else
            {
                DetailsScrollViewer.Visibility = Visibility.Collapsed;
                ToggleDetailsButton.Content = "▼ Show Details";
                Height = 400;
            }
        }

        private void Retry_Click(object sender, RoutedEventArgs e)
        {
            Result = ErrorDialogResult.Retry;
            Close();
        }

        private void Ignore_Click(object sender, RoutedEventArgs e)
        {
            Result = ErrorDialogResult.Ignore;
            Close();
        }

        private void Copy_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var errorInfo = $"M&A Discovery Suite Error Report\n" +
                               $"================================\n" +
                               $"Timestamp: {TimestampText.Text}\n" +
                               $"Operation: {operation ?? "Unknown"}\n" +
                               $"Message: {ErrorMessageText.Text}\n\n";

                if (exception != null)
                {
                    errorInfo += $"Exception Details:\n" +
                                $"Type: {exception.GetType().Name}\n" +
                                $"Message: {exception.Message}\n" +
                                $"Source: {exception.Source ?? "Unknown"}\n" +
                                $"Stack Trace:\n{exception.StackTrace ?? "No stack trace available"}\n";
                }

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
                var subject = Uri.EscapeDataString($"M&A Discovery Suite Error Report - {operation ?? "General Error"}");
                var body = Uri.EscapeDataString(
                    $"Please describe what you were doing when this error occurred:\n\n" +
                    $"[Your description here]\n\n" +
                    $"Error Details:\n" +
                    $"Timestamp: {TimestampText.Text}\n" +
                    $"Message: {ErrorMessageText.Text}\n" +
                    $"Exception: {exception?.GetType().Name ?? "None"}\n" +
                    $"Stack Trace: {exception?.StackTrace ?? "None"}");

                var mailtoUri = $"mailto:support@example.com?subject={subject}&body={body}";
                Process.Start(new ProcessStartInfo(mailtoUri) { UseShellExecute = true });
            }
            catch
            {
                MessageBox.Show("Failed to open email client. Please manually send error details to support@example.com", 
                    "Report Failed", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Result = ErrorDialogResult.Close;
            Close();
        }
    }
}