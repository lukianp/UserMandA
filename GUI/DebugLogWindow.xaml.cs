using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Media;
using Microsoft.Win32;

namespace MandADiscoverySuite
{
    public partial class DebugLogWindow : Window
    {
        private List<LogEntry> logEntries;
        private string sessionName;

        public DebugLogWindow(string sessionName = "Main")
        {
            InitializeComponent();
            this.sessionName = sessionName;
            this.logEntries = new List<LogEntry>();
            
            SessionInfo.Text = $"Session: {sessionName}";
            Title = $"Debug Log Viewer - {sessionName}";
            
            InitializeLogDisplay();
        }

        private void InitializeLogDisplay()
        {
            AddLogEntry(LogLevel.Info, "Debug Log Viewer", $"Debug session started for: {sessionName}");
            AddLogEntry(LogLevel.Verbose, "System", "Log filtering: All levels enabled");
            UpdateLogCount();
        }

        public void AddLogEntry(LogLevel level, string category, string message, Exception exception = null)
        {
            var entry = new LogEntry
            {
                Timestamp = DateTime.Now,
                Level = level,
                Category = category,
                Message = message,
                Exception = exception
            };

            logEntries.Add(entry);

            // Update UI on main thread
            Dispatcher.BeginInvoke(new Action(() =>
            {
                if (ShouldShowLogLevel(level))
                {
                    AppendLogEntryToDisplay(entry);
                }
                UpdateLogCount();
                
                // Auto-scroll to bottom
                LogScrollViewer.ScrollToEnd();
            }));
        }

        private void AppendLogEntryToDisplay(LogEntry entry)
        {
            var paragraph = new Paragraph();
            paragraph.Margin = new Thickness(0, 2, 0, 2);

            // Timestamp
            var timestampRun = new Run($"[{entry.Timestamp:HH:mm:ss.fff}] ")
            {
                Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)) // Gray
            };
            
            // Log level with color
            var levelColor = GetLogLevelColor(entry.Level);
            var levelRun = new Run($"{entry.Level.ToString().ToUpper().PadRight(7)} ")
            {
                Foreground = new SolidColorBrush(levelColor),
                FontWeight = FontWeights.Bold
            };
            
            // Category
            var categoryRun = new Run($"[{entry.Category}] ")
            {
                Foreground = new SolidColorBrush(Color.FromRgb(66, 153, 225)) // Blue
            };
            
            // Message
            var messageRun = new Run(entry.Message)
            {
                Foreground = new SolidColorBrush(Color.FromRgb(226, 232, 240)) // Light gray
            };
            
            paragraph.Inlines.Add(timestampRun);
            paragraph.Inlines.Add(levelRun);
            paragraph.Inlines.Add(categoryRun);
            paragraph.Inlines.Add(messageRun);
            
            // Exception details if present
            if (entry.Exception != null)
            {
                paragraph.Inlines.Add(new LineBreak());
                var exceptionRun = new Run($"    Exception: {entry.Exception.GetType().Name}: {entry.Exception.Message}")
                {
                    Foreground = new SolidColorBrush(Color.FromRgb(245, 101, 101)), // Red
                    FontStyle = FontStyles.Italic
                };
                paragraph.Inlines.Add(exceptionRun);
                
                if (entry.Exception.StackTrace != null)
                {
                    paragraph.Inlines.Add(new LineBreak());
                    var stackTraceRun = new Run($"    StackTrace: {entry.Exception.StackTrace}")
                    {
                        Foreground = new SolidColorBrush(Color.FromRgb(245, 101, 101)),
                        FontSize = 10
                    };
                    paragraph.Inlines.Add(stackTraceRun);
                }
            }

            LogTextBox.Document.Blocks.Add(paragraph);
        }

        private Color GetLogLevelColor(LogLevel level)
        {
            return level switch
            {
                LogLevel.Verbose => Color.FromRgb(160, 174, 192), // Gray
                LogLevel.Debug => Color.FromRgb(139, 92, 246),    // Purple
                LogLevel.Info => Color.FromRgb(72, 187, 120),     // Green
                LogLevel.Warning => Color.FromRgb(237, 137, 54),  // Orange
                LogLevel.Error => Color.FromRgb(245, 101, 101),   // Red
                _ => Color.FromRgb(226, 232, 240)                 // Default light gray
            };
        }

        private bool ShouldShowLogLevel(LogLevel level)
        {
            return level switch
            {
                LogLevel.Verbose => ShowVerbose.IsChecked == true,
                LogLevel.Debug => ShowDebug.IsChecked == true,
                LogLevel.Info => ShowInfo.IsChecked == true,
                LogLevel.Warning => ShowWarning.IsChecked == true,
                LogLevel.Error => ShowError.IsChecked == true,
                _ => true
            };
        }

        private void UpdateLogCount()
        {
            var visibleCount = logEntries.Count(entry => ShouldShowLogLevel(entry.Level));
            LogCount.Text = $"{visibleCount} of {logEntries.Count} entries";
        }

        private void LogFilter_Changed(object sender, RoutedEventArgs e)
        {
            RefreshLogDisplay();
        }

        private void RefreshLogDisplay()
        {
            // Clear current display
            LogTextBox.Document.Blocks.Clear();
            
            // Re-add filtered entries
            foreach (var entry in logEntries.Where(entry => ShouldShowLogLevel(entry.Level)))
            {
                AppendLogEntryToDisplay(entry);
            }
            
            UpdateLogCount();
            LogScrollViewer.ScrollToEnd();
        }

        private void ClearLog_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show(
                "Are you sure you want to clear all log entries?",
                "Clear Log",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                logEntries.Clear();
                LogTextBox.Document.Blocks.Clear();
                InitializeLogDisplay();
            }
        }

        private void ExportLog_Click(object sender, RoutedEventArgs e)
        {
            var saveDialog = new SaveFileDialog
            {
                FileName = $"DebugLog_{sessionName}_{DateTime.Now:yyyyMMdd_HHmmss}.txt",
                Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*",
                DefaultExt = "txt"
            };

            if (saveDialog.ShowDialog() == true)
            {
                try
                {
                    using (var writer = new StreamWriter(saveDialog.FileName))
                    {
                        writer.WriteLine($"Debug Log Export - Session: {sessionName}");
                        writer.WriteLine($"Export Time: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                        writer.WriteLine($"Total Entries: {logEntries.Count}");
                        writer.WriteLine(new string('=', 80));
                        writer.WriteLine();

                        foreach (var entry in logEntries)
                        {
                            writer.WriteLine($"[{entry.Timestamp:yyyy-MM-dd HH:mm:ss.fff}] {entry.Level.ToString().ToUpper().PadRight(7)} [{entry.Category}] {entry.Message}");
                            
                            if (entry.Exception != null)
                            {
                                writer.WriteLine($"    Exception: {entry.Exception.GetType().Name}: {entry.Exception.Message}");
                                if (entry.Exception.StackTrace != null)
                                {
                                    writer.WriteLine($"    StackTrace: {entry.Exception.StackTrace}");
                                }
                            }
                        }
                    }

                    MessageBox.Show($"Log exported successfully to:\n{saveDialog.FileName}", "Export Complete", 
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error exporting log:\n{ex.Message}", "Export Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private void RefreshLog_Click(object sender, RoutedEventArgs e)
        {
            RefreshLogDisplay();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        // Public methods for external logging
        public void LogVerbose(string category, string message) => AddLogEntry(LogLevel.Verbose, category, message);
        public void LogDebug(string category, string message) => AddLogEntry(LogLevel.Debug, category, message);
        public void LogInfo(string category, string message) => AddLogEntry(LogLevel.Info, category, message);
        public void LogWarning(string category, string message) => AddLogEntry(LogLevel.Warning, category, message);
        public void LogError(string category, string message, Exception exception = null) => AddLogEntry(LogLevel.Error, category, message, exception);
    }

    public enum LogLevel
    {
        Verbose,
        Debug,
        Info,
        Warning,
        Error
    }

    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public LogLevel Level { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Exception? Exception { get; set; }
    }
}