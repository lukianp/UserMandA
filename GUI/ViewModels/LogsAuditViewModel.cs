using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using System.IO;
using LogLevel = Microsoft.Extensions.Logging.LogLevel;

namespace MandADiscoverySuite.ViewModels
{
    public class LogsAuditViewModel : INotifyPropertyChanged
    {
        private readonly ILogManagementService _logManagementService;
        private readonly ILogger<LogsAuditViewModel> _logger;
        
        private ObservableCollection<LogAuditEntry> _logs;
        private ObservableCollection<LogAuditEntry> _filteredLogs;
        private ObservableCollection<LogAuditEntry> _selectedLogs;
        private LogAuditEntry _selectedLogEntry;
        private string _searchText = string.Empty;
        private bool _isLoading = false;
        private string _statusMessage = "Ready";
        private int _totalLogsCount = 0;
        private int _filteredLogsCount = 0;
        
        // Filter properties
        private bool _showBuildLogs = true;
        private bool _showRuntimeLogs = true;
        private bool _showModuleLogs = true;
        private bool _showMigrationLogs = true;
        
        private bool _showErrorLevel = true;
        private bool _showWarningLevel = true;
        private bool _showInfoLevel = true;
        private bool _showDebugLevel = false;
        private bool _showTraceLevel = false;
        private bool _showCriticalLevel = true;
        
        private DateTime? _filterStartDate;
        private DateTime? _filterEndDate;
        private string _sourceFilter = string.Empty;

        public event PropertyChangedEventHandler PropertyChanged;

        public LogsAuditViewModel(ILogManagementService logManagementService, ILogger<LogsAuditViewModel> logger)
        {
            _logManagementService = logManagementService ?? throw new ArgumentNullException(nameof(logManagementService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            _logs = new ObservableCollection<LogAuditEntry>();
            _filteredLogs = new ObservableCollection<LogAuditEntry>();
            _selectedLogs = new ObservableCollection<LogAuditEntry>();
            
            // Subscribe to log updates
            _logManagementService.LogsUpdated += OnLogsUpdated;
            
            InitializeCommands();
        }

        #region Properties

        public ObservableCollection<LogAuditEntry> FilteredLogs
        {
            get => _filteredLogs;
            private set
            {
                _filteredLogs = value;
                OnPropertyChanged();
                FilteredLogsCount = value?.Count ?? 0;
            }
        }

        public ObservableCollection<LogAuditEntry> SelectedLogs
        {
            get => _selectedLogs;
            set
            {
                _selectedLogs = value;
                OnPropertyChanged();
            }
        }

        public LogAuditEntry SelectedLogEntry
        {
            get => _selectedLogEntry;
            set
            {
                _selectedLogEntry = value;
                OnPropertyChanged();
            }
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                _searchText = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set
            {
                _isLoading = value;
                OnPropertyChanged();
            }
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set
            {
                _statusMessage = value;
                OnPropertyChanged();
            }
        }

        public int TotalLogsCount
        {
            get => _totalLogsCount;
            set
            {
                _totalLogsCount = value;
                OnPropertyChanged();
                UpdateStatusMessage();
            }
        }

        public int FilteredLogsCount
        {
            get => _filteredLogsCount;
            set
            {
                _filteredLogsCount = value;
                OnPropertyChanged();
                UpdateStatusMessage();
            }
        }

        // Category filters
        public bool ShowBuildLogs
        {
            get => _showBuildLogs;
            set
            {
                _showBuildLogs = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowRuntimeLogs
        {
            get => _showRuntimeLogs;
            set
            {
                _showRuntimeLogs = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowModuleLogs
        {
            get => _showModuleLogs;
            set
            {
                _showModuleLogs = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowMigrationLogs
        {
            get => _showMigrationLogs;
            set
            {
                _showMigrationLogs = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        // Level filters
        public bool ShowErrorLevel
        {
            get => _showErrorLevel;
            set
            {
                _showErrorLevel = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowWarningLevel
        {
            get => _showWarningLevel;
            set
            {
                _showWarningLevel = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowInfoLevel
        {
            get => _showInfoLevel;
            set
            {
                _showInfoLevel = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowDebugLevel
        {
            get => _showDebugLevel;
            set
            {
                _showDebugLevel = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowTraceLevel
        {
            get => _showTraceLevel;
            set
            {
                _showTraceLevel = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public bool ShowCriticalLevel
        {
            get => _showCriticalLevel;
            set
            {
                _showCriticalLevel = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        // Date filters
        public DateTime? FilterStartDate
        {
            get => _filterStartDate;
            set
            {
                _filterStartDate = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public DateTime? FilterEndDate
        {
            get => _filterEndDate;
            set
            {
                _filterEndDate = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        public string SourceFilter
        {
            get => _sourceFilter;
            set
            {
                _sourceFilter = value;
                OnPropertyChanged();
                ApplyFiltersAsync();
            }
        }

        #endregion

        #region Commands

        public ICommand LoadLogsCommand { get; private set; }
        public ICommand RefreshLogsCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        public ICommand ExportSelectedCommand { get; private set; }
        public ICommand ExportFilteredCommand { get; private set; }
        public ICommand ExportAllCommand { get; private set; }
        public ICommand CopyToClipboardCommand { get; private set; }
        public ICommand ShowLogDetailsCommand { get; private set; }
        public ICommand SetTodayFilterCommand { get; private set; }
        public ICommand SetLastHourFilterCommand { get; private set; }
        public ICommand SetLast24HoursFilterCommand { get; private set; }
        public ICommand SetLastWeekFilterCommand { get; private set; }

        #endregion

        #region Public Methods

        public async Task InitializeAsync()
        {
            _logger.LogInformation("Initializing LogsAuditViewModel");
            await LoadLogsAsync();
        }

        #endregion

        #region Private Methods

        private void InitializeCommands()
        {
            LoadLogsCommand = new AsyncRelayCommand(LoadLogsAsync);
            RefreshLogsCommand = new AsyncRelayCommand(RefreshLogsAsync);
            ClearFiltersCommand = new RelayCommand(ClearFilters);
            ExportSelectedCommand = new AsyncRelayCommand(ExportSelectedLogsAsync);
            ExportFilteredCommand = new AsyncRelayCommand(ExportFilteredLogsAsync);
            ExportAllCommand = new AsyncRelayCommand(ExportAllLogsAsync);
            CopyToClipboardCommand = new RelayCommand(CopySelectedToClipboard);
            ShowLogDetailsCommand = new RelayCommand<LogAuditEntry>(ShowLogDetails);
            SetTodayFilterCommand = new RelayCommand(() => SetDateFilter(DateTime.Today, DateTime.Today.AddDays(1).AddTicks(-1)));
            SetLastHourFilterCommand = new RelayCommand(() => SetDateFilter(DateTime.Now.AddHours(-1), DateTime.Now));
            SetLast24HoursFilterCommand = new RelayCommand(() => SetDateFilter(DateTime.Now.AddDays(-1), DateTime.Now));
            SetLastWeekFilterCommand = new RelayCommand(() => SetDateFilter(DateTime.Now.AddDays(-7), DateTime.Now));
        }

        private async Task LoadLogsAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Loading logs...";

                var logs = await _logManagementService.GetLogsAsync();
                
                _logs.Clear();
                foreach (var log in logs)
                {
                    _logs.Add(log);
                }

                TotalLogsCount = _logs.Count;
                await ApplyFiltersAsync();

                StatusMessage = "Logs loaded successfully";
                _logger.LogInformation("Loaded {Count} log entries", _logs.Count);
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading logs: {ex.Message}";
                _logger.LogError(ex, "Failed to load logs");
                
                // Show error message to user
                MessageBox.Show($"Failed to load logs: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task RefreshLogsAsync()
        {
            try
            {
                StatusMessage = "Refreshing logs...";
                await _logManagementService.RefreshLogsAsync();
                await LoadLogsAsync();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error refreshing logs: {ex.Message}";
                _logger.LogError(ex, "Failed to refresh logs");
            }
        }

        private async Task ApplyFiltersAsync()
        {
            try
            {
                if (_logs == null || !_logs.Any())
                {
                    FilteredLogs = new ObservableCollection<LogAuditEntry>();
                    return;
                }

                var filter = CreateCurrentFilter();
                var filteredLogs = await _logManagementService.GetFilteredLogsAsync(filter);
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    FilteredLogs = filteredLogs;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying filters");
                StatusMessage = $"Error applying filters: {ex.Message}";
            }
        }

        private LogFilter CreateCurrentFilter()
        {
            var categories = new List<LogCategory>();
            if (ShowBuildLogs) categories.Add(LogCategory.Build);
            if (ShowRuntimeLogs) categories.Add(LogCategory.Runtime);
            if (ShowModuleLogs) categories.Add(LogCategory.Modules);
            if (ShowMigrationLogs) categories.Add(LogCategory.Migration);

            var levels = new List<Microsoft.Extensions.Logging.LogLevel>();
            if (ShowCriticalLevel) levels.Add(Microsoft.Extensions.Logging.LogLevel.Critical);
            if (ShowErrorLevel) levels.Add(Microsoft.Extensions.Logging.LogLevel.Error);
            if (ShowWarningLevel) levels.Add(Microsoft.Extensions.Logging.LogLevel.Warning);
            if (ShowInfoLevel) levels.Add(Microsoft.Extensions.Logging.LogLevel.Information);
            if (ShowDebugLevel) levels.Add(Microsoft.Extensions.Logging.LogLevel.Debug);
            if (ShowTraceLevel) levels.Add(Microsoft.Extensions.Logging.LogLevel.Trace);

            return new LogFilter
            {
                Categories = categories,
                Levels = levels,
                StartDate = FilterStartDate,
                EndDate = FilterEndDate,
                SearchText = SearchText,
                SourceFilter = SourceFilter
            };
        }

        private void ClearFilters()
        {
            SearchText = string.Empty;
            SourceFilter = string.Empty;
            FilterStartDate = null;
            FilterEndDate = null;
            
            // Reset all category filters
            ShowBuildLogs = true;
            ShowRuntimeLogs = true;
            ShowModuleLogs = true;
            ShowMigrationLogs = true;
            
            // Reset level filters to default
            ShowErrorLevel = true;
            ShowWarningLevel = true;
            ShowInfoLevel = true;
            ShowDebugLevel = false;
            ShowTraceLevel = false;
            ShowCriticalLevel = true;
            
            StatusMessage = "Filters cleared";
        }

        private void SetDateFilter(DateTime start, DateTime end)
        {
            FilterStartDate = start;
            FilterEndDate = end;
        }

        private async Task ExportSelectedLogsAsync()
        {
            if (SelectedLogs?.Any() != true)
            {
                MessageBox.Show("Please select logs to export.", "No Selection", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            await ExportLogsAsync(SelectedLogs, "Export Selected Logs");
        }

        private async Task ExportFilteredLogsAsync()
        {
            if (FilteredLogs?.Any() != true)
            {
                MessageBox.Show("No logs to export with current filters.", "No Data", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            await ExportLogsAsync(FilteredLogs, "Export Filtered Logs");
        }

        private async Task ExportAllLogsAsync()
        {
            if (_logs?.Any() != true)
            {
                MessageBox.Show("No logs available to export.", "No Data", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            await ExportLogsAsync(_logs, "Export All Logs");
        }

        private async Task ExportLogsAsync(IEnumerable<LogAuditEntry> logs, string dialogTitle)
        {
            try
            {
                var saveDialog = new SaveFileDialog
                {
                    Title = dialogTitle,
                    Filter = "CSV files (*.csv)|*.csv|JSON files (*.json)|*.json|All files (*.*)|*.*",
                    DefaultExt = "csv",
                    FileName = $"logs_export_{DateTime.Now:yyyyMMdd_HHmmss}"
                };

                if (saveDialog.ShowDialog() != true) return;

                var format = Path.GetExtension(saveDialog.FileName).ToLowerInvariant() switch
                {
                    ".json" => LogExportFormat.JSON,
                    _ => LogExportFormat.CSV
                };

                StatusMessage = "Exporting logs...";
                var success = await _logManagementService.ExportLogsAsync(logs, saveDialog.FileName, format);

                if (success)
                {
                    StatusMessage = $"Exported {logs.Count()} logs to {saveDialog.FileName}";
                    MessageBox.Show($"Successfully exported {logs.Count()} logs to:\n{saveDialog.FileName}", 
                                  "Export Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    StatusMessage = "Export failed";
                    MessageBox.Show("Failed to export logs. Please check the log for details.", 
                                  "Export Failed", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Export error: {ex.Message}";
                _logger.LogError(ex, "Error exporting logs");
                MessageBox.Show($"Error during export: {ex.Message}", "Export Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void CopySelectedToClipboard()
        {
            if (SelectedLogEntry == null)
            {
                MessageBox.Show("Please select a log entry to copy.", "No Selection", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            try
            {
                var content = $"[{SelectedLogEntry.FormattedTimestamp}] [{SelectedLogEntry.LevelString}] [{SelectedLogEntry.CategoryString}] {SelectedLogEntry.Source}: {SelectedLogEntry.Message}";
                
                if (!string.IsNullOrEmpty(SelectedLogEntry.Exception))
                {
                    content += $"\n\nException:\n{SelectedLogEntry.Exception}";
                }

                Clipboard.SetText(content);
                StatusMessage = "Log entry copied to clipboard";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error copying to clipboard");
                MessageBox.Show($"Error copying to clipboard: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ShowLogDetails(LogAuditEntry logEntry)
        {
            if (logEntry == null) return;

            var details = $"Timestamp: {logEntry.FormattedTimestamp}\n" +
                         $"Level: {logEntry.LevelString}\n" +
                         $"Category: {logEntry.CategoryString}\n" +
                         $"Source: {logEntry.Source}\n" +
                         $"Message: {logEntry.Message}";

            if (!string.IsNullOrEmpty(logEntry.Exception))
            {
                details += $"\n\nException:\n{logEntry.Exception}";
            }

            if (!string.IsNullOrEmpty(logEntry.RawContent))
            {
                details += $"\n\nRaw Content:\n{logEntry.RawContent}";
            }

            MessageBox.Show(details, "Log Entry Details", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void OnLogsUpdated(object sender, LogsUpdatedEventArgs e)
        {
            Application.Current.Dispatcher.BeginInvoke(new Action(async () =>
            {
                StatusMessage = $"Logs updated ({e.TotalCount} entries)";
                await LoadLogsAsync();
            }));
        }

        private void UpdateStatusMessage()
        {
            if (TotalLogsCount == 0)
            {
                StatusMessage = "No logs loaded";
            }
            else if (FilteredLogsCount == TotalLogsCount)
            {
                StatusMessage = $"Showing all {TotalLogsCount} logs";
            }
            else
            {
                StatusMessage = $"Showing {FilteredLogsCount} of {TotalLogsCount} logs";
            }
        }

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }
}