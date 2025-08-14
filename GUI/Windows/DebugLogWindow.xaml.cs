using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Documents;
using System.Windows.Media;
using Microsoft.Win32;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Windows
{
    public partial class DebugLogWindow : Window
    {
        private readonly DebugLogWindowViewModel _viewModel;

        public DebugLogWindowViewModel ViewModel => _viewModel;

        public DebugLogWindow(string sessionName = "Main")
        {
            InitializeComponent();
            
            _viewModel = new DebugLogWindowViewModel(sessionName);
            _viewModel.LogEntryAdded += OnLogEntryAdded;
            _viewModel.LogCleared += OnLogCleared;
            _viewModel.LogRefreshed += OnLogRefreshed;
            _viewModel.WindowClosing += OnWindowClosing;
            
            DataContext = _viewModel;
            
            SessionInfo.Text = _viewModel.SessionInfo;
            Title = _viewModel.WindowTitle;
            
            InitializeLogDisplay();
        }

        private void InitializeLogDisplay()
        {
            RefreshLogDisplay();
        }

        private void OnLogEntryAdded(object sender, LogEntry entry)
        {
            // Update UI on main thread
            Dispatcher.BeginInvoke(new Action(() =>
            {
                AppendLogEntryToDisplay(entry);
                
                // Auto-scroll to bottom
                LogScrollViewer.ScrollToEnd();
            }));
        }

        private void OnLogCleared(object sender, EventArgs e)
        {
            Dispatcher.BeginInvoke(new Action(() =>
            {
                LogTextBox.Document.Blocks.Clear();
                RefreshLogDisplay();
            }));
        }

        private void OnLogRefreshed(object sender, EventArgs e)
        {
            Dispatcher.BeginInvoke(new Action(() =>
            {
                RefreshLogDisplay();
            }));
        }

        private void OnWindowClosing(object sender, EventArgs e)
        {
            Close();
        }

        public void AddLogEntry(LogLevel level, string category, string message, Exception exception = null)
        {
            _viewModel.AddLogEntry(level, category, message, exception);
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
                LogLevel.Verbose => _viewModel.ShowVerbose,
                LogLevel.Debug => _viewModel.ShowDebug,
                LogLevel.Info => _viewModel.ShowInfo,
                LogLevel.Warning => _viewModel.ShowWarning,
                LogLevel.Error => _viewModel.ShowError,
                _ => true
            };
        }



        private void RefreshLogDisplay()
        {
            // Clear current display
            LogTextBox.Document.Blocks.Clear();
            
            // Re-add filtered entries
            foreach (var entry in _viewModel.GetVisibleEntries())
            {
                AppendLogEntryToDisplay(entry);
            }
            
            LogScrollViewer.ScrollToEnd();
        }





        protected override void OnClosed(EventArgs e)
        {
            _viewModel.LogEntryAdded -= OnLogEntryAdded;
            _viewModel.LogCleared -= OnLogCleared;
            _viewModel.LogRefreshed -= OnLogRefreshed;
            _viewModel.WindowClosing -= OnWindowClosing;
            base.OnClosed(e);
        }

        // Public methods for external logging
        public void LogVerbose(string category, string message) => _viewModel.LogVerbose(category, message);
        public void LogDebug(string category, string message) => _viewModel.LogDebug(category, message);
        public void LogInfo(string category, string message) => _viewModel.LogInfo(category, message);
        public void LogWarning(string category, string message) => _viewModel.LogWarning(category, message);
        public void LogError(string category, string message, Exception exception = null) => _viewModel.LogError(category, message, exception);
    }
}