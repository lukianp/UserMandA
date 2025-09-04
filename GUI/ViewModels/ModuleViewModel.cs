using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Media;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Base ViewModel for all discovery modules, providing common properties and commands.
    /// </summary>
    public abstract class ModuleViewModel : BaseViewModel
    {
        #region Fields
        private string _icon = "📄";
        private string _displayName = "Module";
        private string _description = "Discovery module";
        private string _category = "General";
        private int _priority = 0;
        private int _timeout = 300;
        private string _filePath = string.Empty;

        private ObservableCollection<dynamic> _results = new ObservableCollection<dynamic>();
        private bool _isProcessing = false;
        private double _progressValue = 0.0;
        private string _processingMessage = string.Empty;

        private string _statusText = "Ready";
        private string _statusDetailText = "Not running";
        private Color _statusColor = Colors.Green;
        private DateTime _lastUpdated = DateTime.MinValue;

        private bool _hasErrors = false;
        private string _errorTitle = string.Empty;
        private string _errorMessage = string.Empty;

        private string _csvFileName = string.Empty;
        #endregion

        #region Commands
        public AsyncRelayCommand RunModuleCommand { get; }
        public AsyncRelayCommand ViewLogsCommand { get; }
        public AsyncRelayCommand ExportResultsCommand { get; }
        public RelayCommand DismissErrorCommand { get; }
        #endregion

        #region Constructor
        protected ModuleViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<ModuleViewModel>? logger = null)
            : base(logger)
        {
            // Initialize module properties from registry info
            _icon = moduleInfo.Icon ?? "📄";
            _displayName = moduleInfo.DisplayName ?? "Unknown Module";
            _description = moduleInfo.Description ?? "Discovery module";
            _category = moduleInfo.Category ?? "General";
            _priority = moduleInfo.Priority;
            _timeout = moduleInfo.Timeout;
            _filePath = moduleInfo.FilePath ?? string.Empty;

            // Initialize commands
            RunModuleCommand = new AsyncRelayCommand(RunModuleAsync, CanRunModule);
            ViewLogsCommand = new AsyncRelayCommand(ViewLogsAsync);
            ExportResultsCommand = new AsyncRelayCommand(ExportResultsAsync, CanExportResults);
            DismissErrorCommand = new RelayCommand(DismissError);
        }
        #endregion

        #region Properties - Module Metadata
        public string Icon
        {
            get => _icon;
            protected set => SetProperty(ref _icon, value);
        }

        public string DisplayName
        {
            get => _displayName;
            protected set => SetProperty(ref _displayName, value);
        }

        public string Description
        {
            get => _description;
            protected set => SetProperty(ref _description, value);
        }

        public string Category
        {
            get => _category;
            protected set => SetProperty(ref _category, value);
        }

        public int Priority
        {
            get => _priority;
            protected set => SetProperty(ref _priority, value);
        }

        public string PriorityText
        {
            get
            {
                return _priority switch
                {
                    1 => "Critical",
                    2 => "High",
                    3 => "Normal",
                    _ => "Unknown"
                };
            }
        }

        public int Timeout
        {
            get => _timeout;
            protected set => SetProperty(ref _timeout, value);
        }

        public string TimeoutText => $"{_timeout} seconds";

        public string FilePath
        {
            get => _filePath;
            protected set => SetProperty(ref _filePath, value);
        }
        #endregion

        #region Properties - State
        public ObservableCollection<dynamic> Results
        {
            get => _results;
            set => SetProperty(ref _results, value);
        }

        public bool IsProcessing
        {
            get => _isProcessing;
            set => SetProperty(ref _isProcessing, value);
        }

        public double ProgressValue
        {
            get => _progressValue;
            set => SetProperty(ref _progressValue, value);
        }

        public string ProcessingMessage
        {
            get => _processingMessage;
            set => SetProperty(ref _processingMessage, value);
        }

        public string StatusText
        {
            get => _statusText;
            set => SetProperty(ref _statusText, value);
        }

        public string StatusDetailText
        {
            get => _statusDetailText;
            set => SetProperty(ref _statusDetailText, value);
        }

        public Color StatusColor
        {
            get => _statusColor;
            set => SetProperty(ref _statusColor, value);
        }

        public DateTime LastUpdated
        {
            get => _lastUpdated;
            set => SetProperty(ref _lastUpdated, value);
        }

        public string LastUpdatedText
        {
            get
            {
                if (_lastUpdated == DateTime.MinValue)
                    return "Never";

                var timeSpan = DateTime.Now - _lastUpdated;
                if (timeSpan.TotalMinutes < 1)
                    return "Just now";
                if (timeSpan.TotalMinutes < 60)
                    return $"{(int)timeSpan.TotalMinutes} min ago";
                if (timeSpan.TotalHours < 24)
                    return $"{(int)timeSpan.TotalHours} hours ago";
                return $"{(int)timeSpan.TotalDays} days ago";
            }
        }

        public int ResultsCount => _results.Count;

        public bool HasResults => _results.Count > 0;
        #endregion

        #region Properties - Error Handling
        public bool HasErrors
        {
            get => _hasErrors;
            set => SetProperty(ref _hasErrors, value);
        }

        public string ErrorTitle
        {
            get => _errorTitle;
            set => SetProperty(ref _errorTitle, value);
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }
        #endregion

        #region Properties - CSV Status
        public string CsvFileName
        {
            get => _csvFileName;
            protected set => SetProperty(ref _csvFileName, value);
        }

        public string CsvStatusText
        {
            get
            {
                if (string.IsNullOrEmpty(_csvFileName))
                    return "No CSV file detected";

                return $"CSV data loaded: {_results.Count} records";
            }
        }

        public Color CsvStatusColor
        {
            get => string.IsNullOrEmpty(_csvFileName) ? Colors.Orange : Colors.Green;
        }
        #endregion

        #region Command Implementations
        protected virtual async Task RunModuleAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running";
                StatusColor = Colors.Blue;
                StatusDetailText = "Executing discovery module...";
                ProgressValue = 0.0;
                ProcessingMessage = "Starting module...";

                _logger?.LogInformation($"Running module: {DisplayName}");

                // Call the abstract method that derived classes must implement
                await ExecuteModuleAsync();

                // Update status
                StatusText = "Completed";
                StatusColor = Colors.Green;
                StatusDetailText = $"Discovery completed - {_results.Count} results";
                LastUpdated = DateTime.Now;

                ProgressValue = 100.0;
                ProcessingMessage = "Module execution completed";

                _logger?.LogInformation($"Module {DisplayName} completed successfully");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error running module: {DisplayName}");

                StatusText = "Failed";
                StatusColor = Colors.Red;
                StatusDetailText = "Execution failed";

                ShowError("Module Execution Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        protected virtual async Task ViewLogsAsync()
        {
            try
            {
                _logger?.LogInformation($"Opening logs for module: {DisplayName}");

                // TODO: Implement log viewing - could open a dedicated log window
                // For now, just log the intention
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error opening logs for module: {DisplayName}");
            }
        }

        protected virtual async Task ExportResultsAsync()
        {
            try
            {
                if (_results.Count == 0)
                    return;

                _logger?.LogInformation($"Exporting results for module: {DisplayName}");

                // TODO: Implement export functionality
                // Could use DataExportService or build CSV/XLSX export

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error exporting results for module: {DisplayName}");
                ShowError("Export Failed", ex.Message);
            }
        }

        protected virtual void DismissError()
        {
            HasErrors = false;
            ErrorTitle = string.Empty;
            ErrorMessage = string.Empty;
        }
        #endregion

        #region Abstract Methods for Derived Classes
        /// <summary>
        /// Executes the actual module logic - to be implemented by derived classes
        /// </summary>
        protected abstract Task ExecuteModuleAsync();

        /// <summary>
        /// Loads CSV data for this specific module type - to be implemented by derived classes
        /// </summary>
        /// <param name="csvData">The CSV data to process</param>
        protected virtual async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                _results.Clear();
                foreach (var item in csvData)
                {
                    _results.Add(item);
                }

                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                _logger?.LogInformation($"Loaded {csvData.Count} records for module {DisplayName}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error loading CSV data for module {DisplayName}");
                ShowError("CSV Loading Failed", ex.Message);
            }
        }
        #endregion

        #region Helper Methods
        protected void ShowError(string title, string message)
        {
            HasErrors = true;
            ErrorTitle = title;
            ErrorMessage = message;
            StatusText = "Error";
            StatusColor = Colors.Red;
            StatusDetailText = "An error occurred";
        }

        protected void ShowSuccess(string message)
        {
            StatusText = "Success";
            StatusColor = Colors.Green;
            StatusDetailText = message;
        }

        protected void ShowInformation(string message)
        {
            StatusText = "Information";
            StatusColor = Colors.Blue;
            StatusDetailText = message;
        }
        #endregion

        #region Command CanExecute Methods
        protected virtual bool CanRunModule()
        {
            return !IsProcessing;
        }

        protected virtual bool CanExportResults()
        {
            return HasResults && !IsProcessing;
        }
        #endregion
    }
}