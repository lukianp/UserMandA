using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Script Editor functionality
    /// </summary>
    public class ScriptEditorViewModel : BaseViewModel
    {
        private readonly IScriptEditorService _scriptEditorService;
        private string _scriptText = string.Empty;
        private string _output = string.Empty;
        private bool _isExecuting = false;
        private ScriptFile _currentFile;
        private ScriptEditorSettings _settings;
        private CancellationTokenSource _cancellationTokenSource;
        private string _statusMessage = "Ready";
        private bool _hasUnsavedChanges = false;
        private string _executionOutput = string.Empty;
        private bool _showOutput = true;
        private bool _showTemplates = false;
        private ScriptTemplate _selectedTemplate;

        public ScriptEditorViewModel(IScriptEditorService scriptEditorService)
        {
            _scriptEditorService = scriptEditorService ?? throw new ArgumentNullException(nameof(scriptEditorService));
            
            _settings = _scriptEditorService.GetSettings();
            
            // Initialize collections
            ExecutionResults = new ObservableCollection<ScriptExecutionResult>();
            ScriptTemplates = new ObservableCollection<ScriptTemplate>();
            AutocompleteSuggestions = new ObservableCollection<AutocompleteSuggestion>();
            SyntaxErrors = new ObservableCollection<ScriptSyntaxError>();
            
            // Initialize commands
            ExecuteScriptCommand = new RelayCommand(async () => await ExecuteScriptAsync(), () => !IsExecuting && !string.IsNullOrWhiteSpace(ScriptText));
            CancelExecutionCommand = new RelayCommand(CancelExecution, () => IsExecuting);
            NewFileCommand = new RelayCommand(NewFile);
            OpenFileCommand = new RelayCommand(async () => await OpenFileAsync());
            SaveFileCommand = new RelayCommand(async () => await SaveFileAsync(), () => CurrentFile != null);
            SaveAsFileCommand = new RelayCommand(async () => await SaveAsFileAsync());
            FormatScriptCommand = new RelayCommand(async () => await FormatScriptAsync(), () => !string.IsNullOrWhiteSpace(ScriptText));
            ValidateScriptCommand = new RelayCommand(async () => await ValidateScriptAsync(), () => !string.IsNullOrWhiteSpace(ScriptText));
            ClearOutputCommand = new RelayCommand(ClearOutput);
            LoadTemplateCommand = new RelayCommand<ScriptTemplate>(LoadTemplate);
            SaveAsTemplateCommand = new RelayCommand(async () => await SaveAsTemplateAsync(), () => !string.IsNullOrWhiteSpace(ScriptText));
            ToggleOutputCommand = new RelayCommand(() => ShowOutput = !ShowOutput);
            ToggleTemplatesCommand = new RelayCommand(() => ShowTemplates = !ShowTemplates);
            
            // Subscribe to service events
            _scriptEditorService.ExecutionStarted += OnExecutionStarted;
            _scriptEditorService.ExecutionCompleted += OnExecutionCompleted;
            _scriptEditorService.OutputReceived += OnOutputReceived;
            
            // Load initial data
            _ = LoadTemplatesAsync();
            LoadRecentResults();
        }

        #region Properties

        /// <summary>
        /// Current script text
        /// </summary>
        public string ScriptText
        {
            get => _scriptText;
            set
            {
                if (SetProperty(ref _scriptText, value))
                {
                    HasUnsavedChanges = CurrentFile != null && CurrentFile.Content != value;
                    ValidateScriptCommand.RaiseCanExecuteChanged();
                    FormatScriptCommand.RaiseCanExecuteChanged();
                    ExecuteScriptCommand.RaiseCanExecuteChanged();
                    SaveAsTemplateCommand.RaiseCanExecuteChanged();
                }
            }
        }

        /// <summary>
        /// Script execution output
        /// </summary>
        public string ExecutionOutput
        {
            get => _executionOutput;
            set => SetProperty(ref _executionOutput, value);
        }

        /// <summary>
        /// Whether script is currently executing
        /// </summary>
        public bool IsExecuting
        {
            get => _isExecuting;
            set
            {
                if (SetProperty(ref _isExecuting, value))
                {
                    ExecuteScriptCommand.RaiseCanExecuteChanged();
                    CancelExecutionCommand.RaiseCanExecuteChanged();
                }
            }
        }

        /// <summary>
        /// Current script file
        /// </summary>
        public ScriptFile CurrentFile
        {
            get => _currentFile;
            set
            {
                if (SetProperty(ref _currentFile, value))
                {
                    SaveFileCommand.RaiseCanExecuteChanged();
                    OnPropertyChanged(nameof(WindowTitle));
                }
            }
        }

        /// <summary>
        /// Script editor settings
        /// </summary>
        public ScriptEditorSettings Settings
        {
            get => _settings;
            set => SetProperty(ref _settings, value);
        }

        /// <summary>
        /// Status message
        /// </summary>
        public new string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        /// <summary>
        /// Whether there are unsaved changes
        /// </summary>
        public bool HasUnsavedChanges
        {
            get => _hasUnsavedChanges;
            set
            {
                if (SetProperty(ref _hasUnsavedChanges, value))
                {
                    OnPropertyChanged(nameof(WindowTitle));
                }
            }
        }

        /// <summary>
        /// Whether to show output panel
        /// </summary>
        public bool ShowOutput
        {
            get => _showOutput;
            set => SetProperty(ref _showOutput, value);
        }

        /// <summary>
        /// Whether to show templates panel
        /// </summary>
        public bool ShowTemplates
        {
            get => _showTemplates;
            set => SetProperty(ref _showTemplates, value);
        }

        /// <summary>
        /// Selected script template
        /// </summary>
        public ScriptTemplate SelectedTemplate
        {
            get => _selectedTemplate;
            set => SetProperty(ref _selectedTemplate, value);
        }

        /// <summary>
        /// Window title including file name and modification status
        /// </summary>
        public string WindowTitle
        {
            get
            {
                var title = "Script Editor";
                if (CurrentFile != null)
                {
                    title += $" - {CurrentFile.FileName}";
                }
                if (HasUnsavedChanges)
                {
                    title += "*";
                }
                return title;
            }
        }

        /// <summary>
        /// Collection of execution results
        /// </summary>
        public ObservableCollection<ScriptExecutionResult> ExecutionResults { get; }

        /// <summary>
        /// Collection of available script templates
        /// </summary>
        public ObservableCollection<ScriptTemplate> ScriptTemplates { get; }

        /// <summary>
        /// Collection of autocomplete suggestions
        /// </summary>
        public ObservableCollection<AutocompleteSuggestion> AutocompleteSuggestions { get; }

        /// <summary>
        /// Collection of syntax errors
        /// </summary>
        public ObservableCollection<ScriptSyntaxError> SyntaxErrors { get; }

        #endregion

        #region Commands

        public RelayCommand ExecuteScriptCommand { get; }
        public RelayCommand CancelExecutionCommand { get; }
        public RelayCommand NewFileCommand { get; }
        public RelayCommand OpenFileCommand { get; }
        public RelayCommand SaveFileCommand { get; }
        public RelayCommand SaveAsFileCommand { get; }
        public RelayCommand FormatScriptCommand { get; }
        public RelayCommand ValidateScriptCommand { get; }
        public RelayCommand ClearOutputCommand { get; }
        public RelayCommand<ScriptTemplate> LoadTemplateCommand { get; }
        public RelayCommand SaveAsTemplateCommand { get; }
        public RelayCommand ToggleOutputCommand { get; }
        public RelayCommand ToggleTemplatesCommand { get; }

        #endregion

        #region Methods

        /// <summary>
        /// Execute the current script
        /// </summary>
        private async Task ExecuteScriptAsync()
        {
            if (string.IsNullOrWhiteSpace(ScriptText))
                return;

            try
            {
                IsExecuting = true;
                StatusMessage = "Executing script...";
                ExecutionOutput = string.Empty;
                
                _cancellationTokenSource = new CancellationTokenSource();
                
                var options = new PowerShellExecutionOptions
                {
                    WorkingDirectory = CurrentFile != null ? Path.GetDirectoryName(CurrentFile.FilePath) : null,
                    TimeoutSeconds = 300
                };

                var result = await _scriptEditorService.ExecuteScriptAsync(ScriptText, options, _cancellationTokenSource.Token);
                
                ExecutionResults.Insert(0, result);
                
                if (result.IsSuccess)
                {
                    StatusMessage = $"Script executed successfully in {result.ExecutionTime.TotalSeconds:F2}s";
                }
                else
                {
                    StatusMessage = $"Script execution failed: {result.Error}";
                }
            }
            catch (OperationCanceledException)
            {
                StatusMessage = "Script execution was cancelled";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Execution error: {ex.Message}";
                MessageBox.Show($"Script execution failed: {ex.Message}", "Execution Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsExecuting = false;
                _cancellationTokenSource?.Dispose();
                _cancellationTokenSource = null;
            }
        }

        /// <summary>
        /// Cancel script execution
        /// </summary>
        private void CancelExecution()
        {
            _cancellationTokenSource?.Cancel();
            _scriptEditorService.CancelExecution();
        }

        /// <summary>
        /// Create a new script file
        /// </summary>
        private void NewFile()
        {
            if (HasUnsavedChanges)
            {
                var result = MessageBox.Show("You have unsaved changes. Do you want to save before creating a new file?", 
                    "Unsaved Changes", MessageBoxButton.YesNoCancel, MessageBoxImage.Question);
                
                if (result == MessageBoxResult.Cancel)
                    return;
                    
                if (result == MessageBoxResult.Yes)
                {
                    SaveFileAsync().Wait();
                }
            }

            CurrentFile = null;
            ScriptText = string.Empty;
            HasUnsavedChanges = false;
            StatusMessage = "New file created";
        }

        /// <summary>
        /// Open a script file
        /// </summary>
        private async Task OpenFileAsync()
        {
            var openFileDialog = new Microsoft.Win32.OpenFileDialog
            {
                Filter = "PowerShell Files (*.ps1)|*.ps1|All Files (*.*)|*.*",
                DefaultExt = "ps1"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                try
                {
                    var file = await _scriptEditorService.LoadScriptFileAsync(openFileDialog.FileName);
                    CurrentFile = file;
                    ScriptText = file.Content;
                    HasUnsavedChanges = false;
                    StatusMessage = $"Opened: {file.FileName}";
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Failed to open file: {ex.Message}", "Open Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        /// <summary>
        /// Save the current file
        /// </summary>
        private async Task SaveFileAsync()
        {
            if (CurrentFile == null)
            {
                await SaveAsFileAsync();
                return;
            }

            try
            {
                CurrentFile.Content = ScriptText;
                await _scriptEditorService.SaveScriptFileAsync(CurrentFile);
                HasUnsavedChanges = false;
                StatusMessage = $"Saved: {CurrentFile.FileName}";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to save file: {ex.Message}", "Save Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        /// <summary>
        /// Save the current script as a new file
        /// </summary>
        private async Task SaveAsFileAsync()
        {
            var saveFileDialog = new Microsoft.Win32.SaveFileDialog
            {
                Filter = "PowerShell Files (*.ps1)|*.ps1|All Files (*.*)|*.*",
                DefaultExt = "ps1"
            };

            if (saveFileDialog.ShowDialog() == true)
            {
                try
                {
                    var file = new ScriptFile
                    {
                        FilePath = saveFileDialog.FileName,
                        FileName = Path.GetFileName(saveFileDialog.FileName),
                        Content = ScriptText
                    };

                    await _scriptEditorService.SaveScriptFileAsync(file);
                    CurrentFile = file;
                    HasUnsavedChanges = false;
                    StatusMessage = $"Saved as: {file.FileName}";
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Failed to save file: {ex.Message}", "Save Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        /// <summary>
        /// Format the current script
        /// </summary>
        private async Task FormatScriptAsync()
        {
            try
            {
                var formattedScript = await _scriptEditorService.FormatScriptAsync(ScriptText);
                ScriptText = formattedScript;
                StatusMessage = "Script formatted";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to format script: {ex.Message}", "Format Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        /// <summary>
        /// Validate the current script syntax
        /// </summary>
        private async Task ValidateScriptAsync()
        {
            try
            {
                var errors = await _scriptEditorService.ValidateScriptAsync(ScriptText);
                SyntaxErrors.Clear();
                
                foreach (var error in errors)
                {
                    SyntaxErrors.Add(error);
                }

                StatusMessage = errors.Count == 0 ? "No syntax errors found" : $"Found {errors.Count} syntax error(s)";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to validate script: {ex.Message}", "Validation Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        /// <summary>
        /// Clear the output window
        /// </summary>
        private void ClearOutput()
        {
            ExecutionOutput = string.Empty;
            ExecutionResults.Clear();
            StatusMessage = "Output cleared";
        }

        /// <summary>
        /// Load a script template
        /// </summary>
        private void LoadTemplate(ScriptTemplate template)
        {
            if (template == null) return;

            if (HasUnsavedChanges)
            {
                var result = MessageBox.Show("You have unsaved changes. Do you want to load the template anyway?", 
                    "Unsaved Changes", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
                if (result != MessageBoxResult.Yes)
                    return;
            }

            ScriptText = template.Content;
            CurrentFile = null;
            HasUnsavedChanges = false;
            StatusMessage = $"Loaded template: {template.Name}";
        }

        /// <summary>
        /// Save current script as a template
        /// </summary>
        private async Task SaveAsTemplateAsync()
        {
            // This would typically open a dialog to get template details
            // For now, we'll use a simple implementation
            var template = new ScriptTemplate
            {
                Name = "Custom Template",
                Description = "User-created template",
                Content = ScriptText,
                Category = ScriptTemplateCategory.Custom
            };

            try
            {
                await _scriptEditorService.SaveTemplateAsync(template);
                ScriptTemplates.Add(template);
                StatusMessage = "Template saved";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to save template: {ex.Message}", "Save Template Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        /// <summary>
        /// Load script templates
        /// </summary>
        private async void LoadTemplatesAsync()
        {
            try
            {
                ScriptTemplates.Clear();
                
                // Load default templates
                var defaultTemplates = _scriptEditorService.GetDefaultTemplates();
                foreach (var template in defaultTemplates)
                {
                    ScriptTemplates.Add(template);
                }
                
                // Load custom templates
                var customTemplates = await _scriptEditorService.LoadCustomTemplatesAsync();
                foreach (var template in customTemplates)
                {
                    ScriptTemplates.Add(template);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to load templates: {ex.Message}";
            }
        }

        /// <summary>
        /// Load recent execution results
        /// </summary>
        private void LoadRecentResults()
        {
            try
            {
                var recentResults = _scriptEditorService.GetRecentResults(10);
                ExecutionResults.Clear();
                
                foreach (var result in recentResults)
                {
                    ExecutionResults.Add(result);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to load recent results: {ex.Message}";
            }
        }

        /// <summary>
        /// Get autocomplete suggestions
        /// </summary>
        public async Task<List<AutocompleteSuggestion>> GetAutocompleteSuggestionsAsync(int cursorPosition)
        {
            try
            {
                return await _scriptEditorService.GetAutocompleteSuggestionsAsync(ScriptText, cursorPosition);
            }
            catch
            {
                return new List<AutocompleteSuggestion>();
            }
        }

        #endregion

        #region Event Handlers

        private void OnExecutionStarted(object sender, ScriptExecutionStartedEventArgs e)
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                StatusMessage = "Script execution started...";
                ExecutionOutput += $"[{e.StartTime:HH:mm:ss}] Starting script execution...\n";
            });
        }

        private void OnExecutionCompleted(object sender, ScriptExecutionCompletedEventArgs e)
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                var result = e.Result;
                ExecutionOutput += $"[{DateTime.Now:HH:mm:ss}] Execution completed in {result.ExecutionTime.TotalSeconds:F2}s\n";
                ExecutionOutput += $"Status: {result.State}\n";
                
                if (!string.IsNullOrEmpty(result.Output))
                {
                    ExecutionOutput += $"Output:\n{result.Output}\n";
                }
                
                if (!string.IsNullOrEmpty(result.Error))
                {
                    ExecutionOutput += $"Errors:\n{result.Error}\n";
                }
                
                ExecutionOutput += new string('-', 50) + "\n";
            });
        }

        private void OnOutputReceived(object sender, ScriptOutputEventArgs e)
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                ExecutionOutput += $"[{e.Timestamp:HH:mm:ss}] {e.Output}\n";
            });
        }

        #endregion

        #region IDisposable

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _scriptEditorService.ExecutionStarted -= OnExecutionStarted;
                _scriptEditorService.ExecutionCompleted -= OnExecutionCompleted;
                _scriptEditorService.OutputReceived -= OnOutputReceived;
                
                _cancellationTokenSource?.Dispose();
            }
            
            base.Dispose(disposing);
        }

        #endregion
    }
}