using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for file system migration management with comprehensive UI support
    /// </summary>
    public class FileSystemMigrationViewModel : BaseViewModel
    {
        #region Private Fields
        private readonly FileSystemMigrationService _migrationService;
        private readonly Timer _progressTimer;
        private CancellationTokenSource _cancellationTokenSource;

        private string _sourcePath;
        private string _destinationPath;
        private bool _preservePermissions = true;
        private bool _preserveTimestamps = true;
        private bool _preserveAttributes = true;
        private bool _overwriteExisting = false;
        private bool _skipExistingFiles = false;
        private bool _verifyIntegrity = true;
        private FileConflictResolution _conflictResolution = FileConflictResolution.Rename;
        private int _maxConcurrency = 10;
        private long _maxFileSizeBytes = 1024 * 1024 * 1024; // 1GB default

        private bool _isMigrationInProgress;
        private double _progressPercentage;
        private string _currentStatus = "Ready";
        private string _currentPhase = "None";
        private int _totalFiles;
        private int _processedFiles;
        private long _totalBytes;
        private long _processedBytes;
        private double _transferRateMBps;
        private TimeSpan _estimatedTimeRemaining;
        private bool _canStartMigration = true;

        private FileSystemMigrationRequest _currentRequest;
        private FileSystemMigrationResult _currentResult;
        #endregion

        #region Constructor
        public FileSystemMigrationViewModel(ILogger<FileSystemMigrationViewModel> logger = null) : base(logger)
        {
            _migrationService = new FileSystemMigrationService();
            
            // Subscribe to migration events
            _migrationService.MigrationProgress += OnMigrationProgress;
            _migrationService.MigrationError += OnMigrationError;
            _migrationService.ItemCompleted += OnItemCompleted;

            // Initialize collections
            MigrationResults = new ObservableCollection<FileSystemMigrationResult>();
            MigrationErrors = new ObservableCollection<FileSystemMigrationError>();
            ExcludePatterns = new ObservableCollection<string>();
            ExcludedExtensions = new ObservableCollection<string>();
            MigrationHistory = new ObservableCollection<FileSystemMigrationHistoryItem>();

            // Initialize commands
            InitializeCommands();

            // Set up progress timer
            _progressTimer = new Timer(UpdateProgressMetrics, null, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1));

            // Add default exclusions
            SetupDefaultExclusions();
        }
        #endregion

        #region Public Properties
        public string SourcePath
        {
            get => _sourcePath;
            set => SetProperty(ref _sourcePath, value);
        }

        public string DestinationPath
        {
            get => _destinationPath;
            set => SetProperty(ref _destinationPath, value);
        }

        public bool PreservePermissions
        {
            get => _preservePermissions;
            set => SetProperty(ref _preservePermissions, value);
        }

        public bool PreserveTimestamps
        {
            get => _preserveTimestamps;
            set => SetProperty(ref _preserveTimestamps, value);
        }

        public bool PreserveAttributes
        {
            get => _preserveAttributes;
            set => SetProperty(ref _preserveAttributes, value);
        }

        public bool OverwriteExisting
        {
            get => _overwriteExisting;
            set => SetProperty(ref _overwriteExisting, value);
        }

        public bool SkipExistingFiles
        {
            get => _skipExistingFiles;
            set => SetProperty(ref _skipExistingFiles, value);
        }

        public bool VerifyIntegrity
        {
            get => _verifyIntegrity;
            set => SetProperty(ref _verifyIntegrity, value);
        }

        public FileConflictResolution ConflictResolution
        {
            get => _conflictResolution;
            set => SetProperty(ref _conflictResolution, value);
        }

        public int MaxConcurrency
        {
            get => _maxConcurrency;
            set => SetProperty(ref _maxConcurrency, Math.Max(1, Math.Min(50, value)));
        }

        public long MaxFileSizeBytes
        {
            get => _maxFileSizeBytes;
            set => SetProperty(ref _maxFileSizeBytes, value);
        }

        public bool IsMigrationInProgress
        {
            get => _isMigrationInProgress;
            set => SetProperty(ref _isMigrationInProgress, value);
        }

        public double ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        public string CurrentStatus
        {
            get => _currentStatus;
            set => SetProperty(ref _currentStatus, value);
        }

        public string CurrentPhase
        {
            get => _currentPhase;
            set => SetProperty(ref _currentPhase, value);
        }

        public int TotalFiles
        {
            get => _totalFiles;
            set => SetProperty(ref _totalFiles, value);
        }

        public int ProcessedFiles
        {
            get => _processedFiles;
            set => SetProperty(ref _processedFiles, value);
        }

        public long TotalBytes
        {
            get => _totalBytes;
            set => SetProperty(ref _totalBytes, value);
        }

        public long ProcessedBytes
        {
            get => _processedBytes;
            set => SetProperty(ref _processedBytes, value);
        }

        public double TransferRateMBps
        {
            get => _transferRateMBps;
            set => SetProperty(ref _transferRateMBps, value);
        }

        public TimeSpan EstimatedTimeRemaining
        {
            get => _estimatedTimeRemaining;
            set => SetProperty(ref _estimatedTimeRemaining, value);
        }

        public bool CanStartMigration
        {
            get => _canStartMigration;
            set => SetProperty(ref _canStartMigration, value);
        }

        public string TotalSizeFormatted => FormatBytes(TotalBytes);
        public string ProcessedSizeFormatted => FormatBytes(ProcessedBytes);
        public string MaxFileSizeFormatted => FormatBytes(MaxFileSizeBytes);

        // Collections
        public ObservableCollection<FileSystemMigrationResult> MigrationResults { get; }
        public ObservableCollection<FileSystemMigrationError> MigrationErrors { get; }
        public ObservableCollection<string> ExcludePatterns { get; }
        public ObservableCollection<string> ExcludedExtensions { get; }
        public ObservableCollection<FileSystemMigrationHistoryItem> MigrationHistory { get; }

        // Current migration info
        public FileSystemMigrationRequest CurrentRequest
        {
            get => _currentRequest;
            set => SetProperty(ref _currentRequest, value);
        }

        public FileSystemMigrationResult CurrentResult
        {
            get => _currentResult;
            set => SetProperty(ref _currentResult, value);
        }
        #endregion

        #region Commands
        public ICommand StartMigrationCommand { get; private set; }
        public ICommand CancelMigrationCommand { get; private set; }
        public ICommand PauseMigrationCommand { get; private set; }
        public ICommand ResumeMigrationCommand { get; private set; }
        public ICommand BrowseSourceCommand { get; private set; }
        public ICommand BrowseDestinationCommand { get; private set; }
        public ICommand AddExcludePatternCommand { get; private set; }
        public ICommand RemoveExcludePatternCommand { get; private set; }
        public ICommand AddExcludedExtensionCommand { get; private set; }
        public ICommand RemoveExcludedExtensionCommand { get; private set; }
        public new ICommand ClearErrorsCommand { get; private set; }
        public ICommand ExportResultsCommand { get; private set; }
        public ICommand ValidatePathsCommand { get; private set; }
        public ICommand EstimateMigrationCommand { get; private set; }
        #endregion

        #region Private Methods
        protected override void InitializeCommands()
        {
            // Call base implementation first
            base.InitializeCommands();
            
            StartMigrationCommand = new RelayCommand(async () => await StartMigrationAsync(), CanExecuteStartMigration);
            CancelMigrationCommand = new RelayCommand(async () => await CancelMigrationAsync(), () => IsMigrationInProgress);
            PauseMigrationCommand = new RelayCommand(async () => await PauseMigrationAsync(), () => IsMigrationInProgress);
            ResumeMigrationCommand = new RelayCommand(async () => await ResumeMigrationAsync(), () => !IsMigrationInProgress && CurrentRequest != null);
            
            BrowseSourceCommand = new RelayCommand(BrowseSourcePath);
            BrowseDestinationCommand = new RelayCommand(BrowseDestinationPath);
            
            AddExcludePatternCommand = new RelayCommand<string>(AddExcludePattern);
            RemoveExcludePatternCommand = new RelayCommand<string>(RemoveExcludePattern);
            AddExcludedExtensionCommand = new RelayCommand<string>(AddExcludedExtension);
            RemoveExcludedExtensionCommand = new RelayCommand<string>(RemoveExcludedExtension);
            
            ClearErrorsCommand = new RelayCommand(() => MigrationErrors.Clear());
            ExportResultsCommand = new RelayCommand(async () => await ExportResultsAsync());
            ValidatePathsCommand = new RelayCommand(ValidatePaths);
            EstimateMigrationCommand = new RelayCommand(async () => await EstimateMigrationAsync());
        }

        private bool CanExecuteStartMigration()
        {
            return !IsMigrationInProgress && 
                   !string.IsNullOrWhiteSpace(SourcePath) && 
                   !string.IsNullOrWhiteSpace(DestinationPath) &&
                   Directory.Exists(SourcePath);
        }

        private async Task StartMigrationAsync()
        {
            try
            {
                if (!ValidateMigrationSettings())
                    return;

                // Reset progress
                ResetProgress();

                // Create migration request
                CurrentRequest = new FileSystemMigrationRequest
                {
                    SourcePath = SourcePath,
                    DestinationPath = DestinationPath,
                    PreservePermissions = PreservePermissions,
                    PreserveTimestamps = PreserveTimestamps,
                    PreserveAttributes = PreserveAttributes,
                    OverwriteExisting = OverwriteExisting,
                    SkipExistingFiles = SkipExistingFiles,
                    VerifyIntegrity = VerifyIntegrity,
                    ConflictResolution = ConflictResolution,
                    MaxConcurrency = MaxConcurrency,
                    MaxFileSizeBytes = MaxFileSizeBytes > 0 ? MaxFileSizeBytes : (long?)null,
                    ExcludePatterns = ExcludePatterns.ToList(),
                    ExcludedExtensions = ExcludedExtensions.ToList(),
                    CreatedBy = Environment.UserName
                };

                IsMigrationInProgress = true;
                CanStartMigration = false;
                CurrentStatus = "Starting migration...";

                _cancellationTokenSource = new CancellationTokenSource();

                // Start migration
                CurrentResult = await _migrationService.MigrateFileSystemAsync(CurrentRequest, _cancellationTokenSource.Token);

                // Add to history
                MigrationHistory.Insert(0, new FileSystemMigrationHistoryItem
                {
                    RequestId = CurrentRequest.RequestId,
                    SourcePath = CurrentRequest.SourcePath,
                    DestinationPath = CurrentRequest.DestinationPath,
                    Status = CurrentResult.Status,
                    StartTime = CurrentResult.StartTime,
                    EndTime = CurrentResult.EndTime,
                    Duration = CurrentResult.Duration,
                    TotalFiles = CurrentResult.TotalFiles,
                    SuccessfulFiles = CurrentResult.SuccessfulFiles,
                    FailedFiles = CurrentResult.FailedFiles,
                    TotalSizeBytes = CurrentResult.TotalSizeBytes
                });

                if (CurrentResult.Status == FileSystemMigrationStatus.Completed)
                {
                    CurrentStatus = $"Migration completed successfully. {CurrentResult.SuccessfulFiles} files migrated.";
                    _log?.LogInformation("File system migration completed successfully. Request: {RequestId}", CurrentRequest.RequestId);
                }
                else if (CurrentResult.Status == FileSystemMigrationStatus.Failed)
                {
                    CurrentStatus = $"Migration failed: {CurrentResult.ErrorMessage}";
                    _log?.LogError("File system migration failed. Request: {RequestId}, Error: {Error}", 
                        CurrentRequest.RequestId, CurrentResult.ErrorMessage);
                }

                MigrationResults.Insert(0, CurrentResult);
            }
            catch (Exception ex)
            {
                CurrentStatus = $"Migration error: {ex.Message}";
                _log?.LogError(ex, "Error during file system migration");
            }
            finally
            {
                IsMigrationInProgress = false;
                CanStartMigration = true;
                _cancellationTokenSource?.Dispose();
                _cancellationTokenSource = null;
            }
        }

        private async Task CancelMigrationAsync()
        {
            if (_cancellationTokenSource != null)
            {
                _cancellationTokenSource.Cancel();
                CurrentStatus = "Cancelling migration...";
                
                await Task.Delay(100); // Give cancellation time to process
                
                if (CurrentRequest != null)
                {
                    await _migrationService.CancelMigrationAsync(CurrentRequest.RequestId);
                }
            }
        }

        private async Task PauseMigrationAsync()
        {
            // Implementation would pause the migration
            await Task.CompletedTask;
            CurrentStatus = "Migration paused";
        }

        private async Task ResumeMigrationAsync()
        {
            // Implementation would resume the migration
            await Task.CompletedTask;
            CurrentStatus = "Resuming migration...";
        }

        private bool ValidateMigrationSettings()
        {
            if (string.IsNullOrWhiteSpace(SourcePath))
            {
                CurrentStatus = "Please specify a source path";
                return false;
            }

            if (string.IsNullOrWhiteSpace(DestinationPath))
            {
                CurrentStatus = "Please specify a destination path";
                return false;
            }

            if (!Directory.Exists(SourcePath))
            {
                CurrentStatus = "Source directory does not exist";
                return false;
            }

            if (SourcePath.Equals(DestinationPath, StringComparison.OrdinalIgnoreCase))
            {
                CurrentStatus = "Source and destination paths cannot be the same";
                return false;
            }

            return true;
        }

        private void ResetProgress()
        {
            ProgressPercentage = 0;
            TotalFiles = 0;
            ProcessedFiles = 0;
            TotalBytes = 0;
            ProcessedBytes = 0;
            TransferRateMBps = 0;
            EstimatedTimeRemaining = TimeSpan.Zero;
            CurrentPhase = "Initializing";
            MigrationErrors.Clear();
        }

        private void BrowseSourcePath()
        {
            var dialog = new Microsoft.Win32.OpenFileDialog
            {
                CheckFileExists = false,
                CheckPathExists = true,
                ValidateNames = false,
                FileName = "Select Folder",
                Title = "Select Source Directory"
            };

            if (dialog.ShowDialog() == true)
            {
                SourcePath = Path.GetDirectoryName(dialog.FileName);
            }
        }

        private void BrowseDestinationPath()
        {
            var dialog = new Microsoft.Win32.SaveFileDialog
            {
                CheckPathExists = false,
                ValidateNames = false,
                FileName = "Select Folder",
                Title = "Select Destination Directory"
            };

            if (dialog.ShowDialog() == true)
            {
                DestinationPath = Path.GetDirectoryName(dialog.FileName);
            }
        }

        private void AddExcludePattern(string pattern)
        {
            if (!string.IsNullOrWhiteSpace(pattern) && !ExcludePatterns.Contains(pattern))
            {
                ExcludePatterns.Add(pattern);
            }
        }

        private void RemoveExcludePattern(string pattern)
        {
            ExcludePatterns.Remove(pattern);
        }

        private void AddExcludedExtension(string extension)
        {
            if (!string.IsNullOrWhiteSpace(extension))
            {
                if (!extension.StartsWith("."))
                    extension = "." + extension;
                    
                if (!ExcludedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
                {
                    ExcludedExtensions.Add(extension);
                }
            }
        }

        private void RemoveExcludedExtension(string extension)
        {
            ExcludedExtensions.Remove(extension);
        }

        private async Task ExportResultsAsync()
        {
            // Implementation would export migration results to CSV or JSON
            await Task.CompletedTask;
        }

        private void ValidatePaths()
        {
            var sourceValid = Directory.Exists(SourcePath);
            var destinationValid = !string.IsNullOrWhiteSpace(DestinationPath);

            if (!sourceValid)
                CurrentStatus = "Source path is invalid or does not exist";
            else if (!destinationValid)
                CurrentStatus = "Destination path is required";
            else
                CurrentStatus = "Paths validated successfully";
        }

        private async Task EstimateMigrationAsync()
        {
            if (!Directory.Exists(SourcePath))
            {
                CurrentStatus = "Cannot estimate: source path does not exist";
                return;
            }

            try
            {
                CurrentStatus = "Estimating migration size...";
                
                await Task.Run(() =>
                {
                    var dirInfo = new DirectoryInfo(SourcePath);
                    var files = dirInfo.GetFiles("*", SearchOption.AllDirectories);
                    var totalSize = files.Sum(f => f.Length);
                    var fileCount = files.Length;

                    TotalFiles = fileCount;
                    TotalBytes = totalSize;
                    
                    // Estimate time based on typical transfer rates
                    var estimatedSeconds = totalSize / (50 * 1024 * 1024.0); // 50 MB/s assumption
                    EstimatedTimeRemaining = TimeSpan.FromSeconds(estimatedSeconds);
                });

                CurrentStatus = $"Estimated: {TotalFiles} files, {TotalSizeFormatted}, ~{EstimatedTimeRemaining:hh\\:mm\\:ss}";
            }
            catch (Exception ex)
            {
                CurrentStatus = $"Estimation failed: {ex.Message}";
                _log?.LogError(ex, "Error estimating migration");
            }
        }

        private void SetupDefaultExclusions()
        {
            // Default file exclusion patterns
            ExcludePatterns.Add("*.tmp");
            ExcludePatterns.Add("*.temp");
            ExcludePatterns.Add("*.log");
            ExcludePatterns.Add("*~");
            ExcludePatterns.Add("Thumbs.db");
            ExcludePatterns.Add(".DS_Store");

            // Default excluded extensions
            ExcludedExtensions.Add(".tmp");
            ExcludedExtensions.Add(".temp");
            ExcludedExtensions.Add(".bak");
            ExcludedExtensions.Add(".swp");
        }

        private void UpdateProgressMetrics(object state)
        {
            if (IsMigrationInProgress && ProcessedBytes > 0 && TotalBytes > 0)
            {
                // Calculate transfer rate (simplified)
                var elapsedSeconds = (DateTime.Now - (CurrentResult?.StartTime ?? DateTime.Now)).TotalSeconds;
                if (elapsedSeconds > 0)
                {
                    TransferRateMBps = (ProcessedBytes / (1024.0 * 1024.0)) / elapsedSeconds;
                    
                    var remainingBytes = TotalBytes - ProcessedBytes;
                    if (TransferRateMBps > 0)
                    {
                        var remainingSeconds = remainingBytes / (TransferRateMBps * 1024 * 1024);
                        EstimatedTimeRemaining = TimeSpan.FromSeconds(remainingSeconds);
                    }
                }
            }
        }

        private string FormatBytes(long bytes)
        {
            if (bytes == 0) return "0 B";
            
            string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
            int suffixIndex = 0;
            double size = bytes;
            
            while (size >= 1024 && suffixIndex < suffixes.Length - 1)
            {
                size /= 1024;
                suffixIndex++;
            }
            
            return $"{size:F2} {suffixes[suffixIndex]}";
        }
        #endregion

        #region Event Handlers
        private void OnMigrationProgress(object sender, FileSystemMigrationProgressEventArgs e)
        {
            // Update progress on UI thread
            System.Windows.Application.Current?.Dispatcher.Invoke(() =>
            {
                ProgressPercentage = e.ProgressPercentage;
                CurrentPhase = e.Phase.ToString();
                CurrentStatus = e.Message;
                ProcessedFiles = e.ProcessedItems;
                TotalFiles = e.TotalItems;
                ProcessedBytes = e.ProcessedBytes;
                TotalBytes = e.TotalBytes;
            });
        }

        private void OnMigrationError(object sender, FileSystemMigrationErrorEventArgs e)
        {
            System.Windows.Application.Current?.Dispatcher.Invoke(() =>
            {
                MigrationErrors.Add(new FileSystemMigrationError
                {
                    Path = e.ItemPath ?? "Unknown",
                    ErrorMessage = e.Error.Message,
                    ErrorType = FileSystemErrorType.Unknown,
                    Timestamp = e.Timestamp
                });
            });
        }

        private void OnItemCompleted(object sender, FileSystemMigrationItemCompleteEventArgs e)
        {
            System.Windows.Application.Current?.Dispatcher.Invoke(() =>
            {
                ProcessedFiles++;
                ProcessedBytes += e.SizeBytes;
            });
        }
        #endregion


        #region IDisposable Implementation
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _progressTimer?.Dispose();
                _cancellationTokenSource?.Dispose();
                _migrationService?.Dispose();
            }
            base.Dispose(disposing);
        }
        #endregion
    }

    #region Supporting Classes
    public class FileSystemMigrationHistoryItem
    {
        public string RequestId { get; set; }
        public string SourcePath { get; set; }
        public string DestinationPath { get; set; }
        public FileSystemMigrationStatus Status { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration { get; set; }
        public int TotalFiles { get; set; }
        public int SuccessfulFiles { get; set; }
        public int FailedFiles { get; set; }
        public long TotalSizeBytes { get; set; }
        
        public string StatusDisplay => Status.ToString();
        public string DurationDisplay => Duration.ToString(@"hh\:mm\:ss");
        public string SizeDisplay => FormatBytes(TotalSizeBytes);
        
        private string FormatBytes(long bytes)
        {
            if (bytes == 0) return "0 B";
            
            string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
            int suffixIndex = 0;
            double size = bytes;
            
            while (size >= 1024 && suffixIndex < suffixes.Length - 1)
            {
                size /= 1024;
                suffixIndex++;
            }
            
            return $"{size:F2} {suffixes[suffixIndex]}";
        }
    }
    #endregion
}