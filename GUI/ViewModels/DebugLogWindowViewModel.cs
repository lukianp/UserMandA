using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Win32;

namespace MandADiscoverySuite.ViewModels
{
    public class DebugLogWindowViewModel : BaseViewModel
    {
        private List<LogEntry> _logEntries;
        private string _sessionName;
        private bool _showVerbose = true;
        private bool _showDebug = true;
        private bool _showInfo = true;
        private bool _showWarning = true;
        private bool _showError = true;
        private string _logCount = "0 entries";

        public string SessionName
        {
            get => _sessionName;
            set
            {
                SetProperty(ref _sessionName, value);
                WindowTitle = $"Debug Log Viewer - {value}";
                SessionInfo = $"Session: {value}";
            }
        }

        public string WindowTitle { get; private set; } = "Debug Log Viewer";
        public string SessionInfo { get; private set; } = "Session: Main";

        public bool ShowVerbose
        {
            get => _showVerbose;
            set
            {
                SetProperty(ref _showVerbose, value);
                OnFilterChanged();
            }
        }

        public bool ShowDebug
        {
            get => _showDebug;
            set
            {
                SetProperty(ref _showDebug, value);
                OnFilterChanged();
            }
        }

        public bool ShowInfo
        {
            get => _showInfo;
            set
            {
                SetProperty(ref _showInfo, value);
                OnFilterChanged();
            }
        }

        public bool ShowWarning
        {
            get => _showWarning;
            set
            {
                SetProperty(ref _showWarning, value);
                OnFilterChanged();
            }
        }

        public bool ShowError
        {
            get => _showError;
            set
            {
                SetProperty(ref _showError, value);
                OnFilterChanged();
            }
        }

        public string LogCount
        {
            get => _logCount;
            set => SetProperty(ref _logCount, value);
        }

        public List<LogEntry> LogEntries => _logEntries;

        #region Commands

        public ICommand ClearLogCommand { get; private set; }
        public ICommand ExportLogCommand { get; private set; }
        public ICommand RefreshLogCommand { get; private set; }
        public ICommand CloseCommand { get; private set; }

        #endregion

        public event EventHandler<LogEntry> LogEntryAdded;
        public event EventHandler LogCleared;
        public event EventHandler LogRefreshed;
        public event EventHandler WindowClosing;

        public DebugLogWindowViewModel(string sessionName = "Main")
        {
            _logEntries = new List<LogEntry>();
            SessionName = sessionName;

            InitializeCommands();
            InitializeLogDisplay();
        }

        private void InitializeCommands()
        {
            ClearLogCommand = new RelayCommand(ClearLog);
            ExportLogCommand = new AsyncRelayCommand(ExportLogAsync);
            RefreshLogCommand = new RelayCommand(RefreshLog);
            CloseCommand = new RelayCommand(CloseWindow);
        }

        private void InitializeLogDisplay()
        {
            AddLogEntry(LogLevel.Info, "Debug Log Viewer", $"Debug session started for: {SessionName}");
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

            _logEntries.Add(entry);

            if (ShouldShowLogLevel(level))
            {
                LogEntryAdded?.Invoke(this, entry);
            }

            UpdateLogCount();
        }

        private void UpdateLogCount()
        {
            var visibleCount = _logEntries.Count(entry => ShouldShowLogLevel(entry.Level));
            LogCount = $"{visibleCount} of {_logEntries.Count} entries";
        }

        private bool ShouldShowLogLevel(LogLevel level)
        {
            return level switch
            {
                LogLevel.Verbose => ShowVerbose,
                LogLevel.Debug => ShowDebug,
                LogLevel.Info => ShowInfo,
                LogLevel.Warning => ShowWarning,
                LogLevel.Error => ShowError,
                _ => true
            };
        }

        private void OnFilterChanged()
        {
            UpdateLogCount();
            LogRefreshed?.Invoke(this, EventArgs.Empty);
        }

        private void ClearLog()
        {
            var result = MessageBox.Show(
                "Are you sure you want to clear all log entries?",
                "Clear Log",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                _logEntries.Clear();
                LogCleared?.Invoke(this, EventArgs.Empty);
                InitializeLogDisplay();
            }
        }

        private async Task ExportLogAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Exporting log...";

                var saveDialog = new SaveFileDialog
                {
                    FileName = $"DebugLog_{SessionName}_{DateTime.Now:yyyyMMdd_HHmmss}.txt",
                    Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*",
                    DefaultExt = "txt"
                };

                if (saveDialog.ShowDialog() == true)
                {
                    await Task.Run(() =>
                    {
                        using (var writer = new StreamWriter(saveDialog.FileName))
                        {
                            writer.WriteLine($"Debug Log Export - Session: {SessionName}");
                            writer.WriteLine($"Export Time: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                            writer.WriteLine($"Total Entries: {_logEntries.Count}");
                            writer.WriteLine(new string('=', 80));
                            writer.WriteLine();

                            foreach (var entry in _logEntries)
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
                    });

                    StatusMessage = $"Log exported successfully to: {saveDialog.FileName}";
                    MessageBox.Show($"Log exported successfully to:\n{saveDialog.FileName}", "Export Complete",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Error exporting log: {ex.Message}";
                HasErrors = true;
                MessageBox.Show($"Error exporting log:\n{ex.Message}", "Export Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void RefreshLog()
        {
            LogRefreshed?.Invoke(this, EventArgs.Empty);
        }

        private void CloseWindow()
        {
            WindowClosing?.Invoke(this, EventArgs.Empty);
        }

        public IEnumerable<LogEntry> GetVisibleEntries()
        {
            return _logEntries.Where(entry => ShouldShowLogLevel(entry.Level));
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