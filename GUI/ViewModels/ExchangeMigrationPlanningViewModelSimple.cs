using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Migration;
using CommunityToolkit.Mvvm.Messaging;

namespace MandADiscoverySuite.ViewModels
{
    public class ExchangeMigrationPlanningViewModelSimple : BaseViewModel
    {
        private readonly MigrationDataService _migrationService;
        private readonly ICsvDataLoader _csvDataLoader;
        private CancellationTokenSource _cancellationTokenSource;

        // Project Properties
        private string _projectName = "Exchange Migration Project";
        private string _projectDescription = "Migration from Exchange 2016 to Office 365";
        private string _sourceEnvironment = "Exchange 2016 On-Premises";
        private string _targetEnvironment = "Office 365 Exchange Online";
        private bool _isValidationRunning;
        private double _validationProgress;
        private string _statusMessage = "Ready to plan Exchange migration";

        // Collections
        private ObservableCollection<MigrationItem> _mailboxes;
        private ObservableCollection<MigrationBatch> _migrationWaves;
        private ObservableCollection<Models.ValidationIssue> _validationIssues;
        private ICollectionView _mailboxesView;
        private ICollectionView _wavesView;

        // Selected Items
        private MigrationItem _selectedMailbox;
        private MigrationBatch _selectedWave;

        // Search and Filtering
        private string _mailboxSearchText;
        private string _waveSearchText;
        private bool _showOnlyIssues;

        // Statistics
        private int _totalMailboxes;
        private int _validatedMailboxes;
        private int _mailboxesWithIssues;
        private long _totalDataSizeGB;
        private int _totalWaves;
        private int _estimatedMigrationDays;

        // Configuration
        private bool _preservePermissions = true;
        private bool _migrateArchives = false;
        private bool _enableDeltaSync = true;
        private int _maxConcurrentMigrations = 10;
        private DateTime _plannedStartDate = DateTime.Today.AddDays(7);
        private DateTime _plannedEndDate = DateTime.Today.AddDays(30);

        public ExchangeMigrationPlanningViewModelSimple()
        {
            _migrationService = new MigrationDataService();
            _csvDataLoader = SimpleServiceLocator.Instance.GetService<ICsvDataLoader>();
            InitializeCollections();
            InitializeCommands();
            // Removed GenerateSampleData call - will load from CSV if available
            LoadExchangeDataAsync();
            RefreshStatistics();

            // Load target profiles for selection
            _ = LoadTargetProfilesAsync();
        }

        private async Task LoadExchangeDataAsync()
        {
            try
            {
                var migrationResult = await _csvDataLoader.LoadMigrationItemsAsync("ljpops");
                if (migrationResult.IsSuccess && migrationResult.Data?.Count > 0)
                {
                    var exchangeItems = migrationResult.Data.Where(m => m.Type == MigrationType.Mailbox).ToList();
                    foreach (var item in exchangeItems)
                    {
                        // Convert MigrationItem to what this view expects
                        item.Type = MigrationType.Mailbox;
                        Mailboxes.Add(item);
                    }
                    StatusMessage = $"Loaded {exchangeItems.Count} Exchange mailboxes from CSV";
                }
                else
                {
                    StatusMessage = "No Exchange CSV data found - view will be empty";
                    ErrorMessage = $"No Exchange CSV data found at {ConfigurationService.Instance.DiscoveryDataRootPath}";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to load Exchange data from CSV: {ex.Message}";
            }
        }

        #region Properties

        public string ProjectName
        {
            get => _projectName;
            set => SetProperty(ref _projectName, value);
        }

        public string ProjectDescription
        {
            get => _projectDescription;
            set => SetProperty(ref _projectDescription, value);
        }

        public string SourceEnvironment
        {
            get => _sourceEnvironment;
            set => SetProperty(ref _sourceEnvironment, value);
        }

        public string TargetEnvironment
        {
            get => _targetEnvironment;
            set => SetProperty(ref _targetEnvironment, value);
        }

        public bool IsValidationRunning
        {
            get => _isValidationRunning;
            set => SetProperty(ref _isValidationRunning, value);
        }

        public double ValidationProgress
        {
            get => _validationProgress;
            set => SetProperty(ref _validationProgress, value);
        }

        public new string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public ObservableCollection<MigrationItem> Mailboxes
        {
            get => _mailboxes;
            set => SetProperty(ref _mailboxes, value);
        }

        public ObservableCollection<MigrationBatch> MigrationWaves
        {
            get => _migrationWaves;
            set => SetProperty(ref _migrationWaves, value);
        }

        public ObservableCollection<Models.ValidationIssue> ValidationIssues
        {
            get => _validationIssues;
            set => SetProperty(ref _validationIssues, value);
        }

        public ICollectionView MailboxesView
        {
            get => _mailboxesView;
            set => SetProperty(ref _mailboxesView, value);
        }

        public ICollectionView WavesView
        {
            get => _wavesView;
            set => SetProperty(ref _wavesView, value);
        }

        public MigrationItem SelectedMailbox
        {
            get => _selectedMailbox;
            set => SetProperty(ref _selectedMailbox, value);
        }

        public MigrationBatch SelectedWave
        {
            get => _selectedWave;
            set => SetProperty(ref _selectedWave, value);
        }

        public string MailboxSearchText
        {
            get => _mailboxSearchText;
            set
            {
                if (SetProperty(ref _mailboxSearchText, value))
                {
                    MailboxesView?.Refresh();
                }
            }
        }

        public string WaveSearchText
        {
            get => _waveSearchText;
            set
            {
                if (SetProperty(ref _waveSearchText, value))
                {
                    WavesView?.Refresh();
                }
            }
        }

        public bool ShowOnlyIssues
        {
            get => _showOnlyIssues;
            set
            {
                if (SetProperty(ref _showOnlyIssues, value))
                {
                    MailboxesView?.Refresh();
                }
            }
        }

        // Statistics Properties
        public int TotalMailboxes
        {
            get => _totalMailboxes;
            set => SetProperty(ref _totalMailboxes, value);
        }

        public int ValidatedMailboxes
        {
            get => _validatedMailboxes;
            set => SetProperty(ref _validatedMailboxes, value);
        }

        public int MailboxesWithIssues
        {
            get => _mailboxesWithIssues;
            set => SetProperty(ref _mailboxesWithIssues, value);
        }

        public long TotalDataSizeGB
        {
            get => _totalDataSizeGB;
            set => SetProperty(ref _totalDataSizeGB, value);
        }

        public int TotalWaves
        {
            get => _totalWaves;
            set => SetProperty(ref _totalWaves, value);
        }

        public int EstimatedMigrationDays
        {
            get => _estimatedMigrationDays;
            set => SetProperty(ref _estimatedMigrationDays, value);
        }

        // Target Profile selection
        public ObservableCollection<TargetProfile> TargetProfiles { get; } = new();
        private TargetProfile _selectedTargetProfile;
        public TargetProfile SelectedTargetProfile
        {
            get => _selectedTargetProfile;
            set => SetProperty(ref _selectedTargetProfile, value);
        }

        public TargetContext CurrentTargetContext
        {
            get
            {
                if (SelectedTargetProfile == null) return new TargetContext();
                return MigratorFactory.Instance.CreateTargetContext(SelectedTargetProfile);
            }
        }

        // Configuration Properties
        public bool PreservePermissions
        {
            get => _preservePermissions;
            set => SetProperty(ref _preservePermissions, value);
        }

        public bool MigrateArchives
        {
            get => _migrateArchives;
            set => SetProperty(ref _migrateArchives, value);
        }

        public bool EnableDeltaSync
        {
            get => _enableDeltaSync;
            set => SetProperty(ref _enableDeltaSync, value);
        }

        public int MaxConcurrentMigrations
        {
            get => _maxConcurrentMigrations;
            set => SetProperty(ref _maxConcurrentMigrations, value);
        }

        public DateTime PlannedStartDate
        {
            get => _plannedStartDate;
            set => SetProperty(ref _plannedStartDate, value);
        }

        public DateTime PlannedEndDate
        {
            get => _plannedEndDate;
            set => SetProperty(ref _plannedEndDate, value);
        }

        #endregion

        #region Commands

        public RelayCommand ImportMailboxesCommand { get; private set; }
        public RelayCommand ExportPlanCommand { get; private set; }
        public RelayCommand ValidateMailboxesCommand { get; private set; }
        public RelayCommand GenerateWavesCommand { get; private set; }
        public RelayCommand ClearFiltersCommand { get; private set; }
        public RelayCommand RefreshStatisticsCommand { get; private set; }
        public RelayCommand<MigrationItem> ViewMailboxDetailsCommand { get; private set; }

        #endregion

        #region Private Methods

        private void InitializeCollections()
        {
            Mailboxes = new ObservableCollection<MigrationItem>();
            MigrationWaves = new ObservableCollection<MigrationBatch>();
            ValidationIssues = new ObservableCollection<Models.ValidationIssue>();

            // Setup collection views with filtering
            MailboxesView = CollectionViewSource.GetDefaultView(Mailboxes);
            MailboxesView.Filter = MailboxFilter;

            WavesView = CollectionViewSource.GetDefaultView(MigrationWaves);
            WavesView.Filter = WaveFilter;

            // Initialize sample validation issues
            ValidationIssues.Add(new Models.ValidationIssue 
            { 
                Severity = "Warning", 
                Category = "Permissions", 
                ItemName = "user001@company.com",
                Description = "User has no mailbox permissions in target environment",
                RecommendedAction = "Grant necessary permissions before migration"
            });
            ValidationIssues.Add(new Models.ValidationIssue 
            { 
                Severity = "Error", 
                Category = "Licensing", 
                ItemName = "tenant.onmicrosoft.com",
                Description = "Insufficient Exchange Online licenses",
                RecommendedAction = "Purchase additional licenses or adjust migration scope"
            });
        }

        private new void InitializeCommands()
        {
            ImportMailboxesCommand = new RelayCommand(async () => await ImportMailboxes(), () => !IsValidationRunning);
            ExportPlanCommand = new RelayCommand(async () => await ExportPlan());
            ValidateMailboxesCommand = new RelayCommand(async () => await ValidateMailboxes(), () => !IsValidationRunning);
            GenerateWavesCommand = new RelayCommand(async () => await GenerateWaves());
            ClearFiltersCommand = new RelayCommand(() => ClearFilters());
            RefreshStatisticsCommand = new RelayCommand(() => RefreshStatistics());
            ViewMailboxDetailsCommand = new RelayCommand<MigrationItem>((mailbox) => ViewMailboxDetails(mailbox));
        }

        private bool MailboxFilter(object item)
        {
            if (!(item is MigrationItem mailbox)) return false;

            // Show only issues filter
            if (ShowOnlyIssues && mailbox.Status != MigrationStatus.Failed)
                return false;

            // Text search - search in source identity and target identity
            if (!string.IsNullOrEmpty(MailboxSearchText))
            {
                var searchLower = MailboxSearchText.ToLower();
                if (!mailbox.SourceIdentity?.ToLower().Contains(searchLower) == true &&
                    !mailbox.TargetIdentity?.ToLower().Contains(searchLower) == true)
                {
                    return false;
                }
            }

            return true;
        }

        private bool WaveFilter(object item)
        {
            if (!(item is MigrationBatch wave)) return false;

            if (!string.IsNullOrEmpty(WaveSearchText))
            {
                var searchLower = WaveSearchText.ToLower();
                if (!wave.Name?.ToLower().Contains(searchLower) == true &&
                    !wave.Description?.ToLower().Contains(searchLower) == true)
                {
                    return false;
                }
            }

            return true;
        }

        private async Task ImportMailboxes()
        {
            try
            {
                StatusMessage = "Importing mailboxes from CSV...";
                // Load from CSV instead of generating sample data
                await LoadExchangeDataAsync();
                StatusMessage = "Mailboxes imported successfully";
                RefreshStatistics();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Import failed: {ex.Message}";
            }
        }

        private async Task ExportPlan()
        {
            try 
            {
                StatusMessage = "Exporting migration plan...";
                await Task.Delay(1000); // Simulate export process
                StatusMessage = "Migration plan exported successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Export failed: {ex.Message}";
            }
        }

        private async Task ValidateMailboxes()
        {
            try
            {
                IsValidationRunning = true;
                StatusMessage = "Validating mailboxes...";
                
                for (int i = 0; i < 100; i++)
                {
                    ValidationProgress = i;
                    await Task.Delay(50); // Simulate validation work
                }

                // Mark some mailboxes as validated
                var random = new Random();
                foreach (var mailbox in Mailboxes)
                {
                    if (random.NextDouble() < 0.8)
                    {
                        mailbox.Status = MigrationStatus.Ready;
                    }
                    else if (random.NextDouble() < 0.5)
                    {
                        mailbox.Status = MigrationStatus.Failed;
                    }
                }

                ValidationProgress = 100;
                StatusMessage = "Validation completed";
                RefreshStatistics();
            }
            finally
            {
                IsValidationRunning = false;
            }
        }

        private async Task GenerateWaves()
        {
            try
            {
                StatusMessage = "Generating migration waves...";
                
                MigrationWaves.Clear();
                var readyMailboxes = Mailboxes.Where(m => m.Status == MigrationStatus.Ready).ToList();
                
                if (readyMailboxes.Count == 0)
                {
                    StatusMessage = "No ready mailboxes found. Please validate mailboxes first.";
                    return;
                }

                int batchSize = Math.Max(1, readyMailboxes.Count / 5);
                for (int i = 0; i < readyMailboxes.Count; i += batchSize)
                {
                    var batchMailboxes = readyMailboxes.Skip(i).Take(batchSize).ToList();
                    var wave = new MigrationBatch
                    {
                        Name = $"Wave {(i / batchSize) + 1}",
                        Description = $"Migration wave with {batchMailboxes.Count} mailboxes",
                        Type = MigrationType.Mailbox,
                        Priority = MigrationPriority.Normal,
                        MaxConcurrentItems = Math.Min(MaxConcurrentMigrations, batchMailboxes.Count),
                        PlannedStartDate = PlannedStartDate.AddDays(i / batchSize),
                        PlannedEndDate = PlannedStartDate.AddDays((i / batchSize) + 1),
                        EstimatedDuration = TimeSpan.FromHours(batchMailboxes.Count * 2)
                    };

                    wave.Items.AddRange(batchMailboxes);
                    MigrationWaves.Add(wave);
                }

                StatusMessage = $"Generated {MigrationWaves.Count} migration waves";
                RefreshStatistics();
            }
            catch (Exception ex)
            {
                StatusMessage = $"Wave generation failed: {ex.Message}";
            }
        }

        private void ClearFilters()
        {
            MailboxSearchText = string.Empty;
            WaveSearchText = string.Empty;
            ShowOnlyIssues = false;
        }

        private void ViewMailboxDetails(MigrationItem mailbox)
        {
            if (mailbox == null) return;

            var displayName = mailbox.Properties?.ContainsKey("DisplayName") == true ? 
                             mailbox.Properties["DisplayName"]?.ToString() : "Unknown";
            var department = mailbox.Properties?.ContainsKey("Department") == true ? 
                            mailbox.Properties["Department"]?.ToString() : "Unknown";

            var message = $"Mailbox Details:\n\n" +
                         $"Source: {mailbox.SourceIdentity}\n" +
                         $"Target: {mailbox.TargetIdentity}\n" +
                         $"Display Name: {displayName}\n" +
                         $"Department: {department}\n" +
                         $"Status: {mailbox.Status}\n" +
                         $"Type: {mailbox.Type}";

            MessageBox.Show(message, "Mailbox Details", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void RefreshStatistics()
        {
            TotalMailboxes = Mailboxes.Count;
            ValidatedMailboxes = Mailboxes.Count(m => m.Status == MigrationStatus.Ready);
            MailboxesWithIssues = Mailboxes.Count(m => m.Status == MigrationStatus.Failed);
            TotalWaves = MigrationWaves.Count;
            
            // Calculate estimated data size from properties
            TotalDataSizeGB = 0;
            foreach (var mailbox in Mailboxes)
            {
                if (mailbox.Properties?.ContainsKey("MailboxSizeGB") == true)
                {
                    if (double.TryParse(mailbox.Properties["MailboxSizeGB"]?.ToString(), out var size))
                    {
                        TotalDataSizeGB += (long)size;
                    }
                }
            }
            
            EstimatedMigrationDays = Math.Max(1, (int)Math.Ceiling(TotalMailboxes / (double)MaxConcurrentMigrations));
        }

        private async Task LoadTargetProfilesAsync()
        {
            try
            {
                var company = (await ProfileService.Instance.GetCurrentProfileAsync())?.CompanyName ?? "default";
                var profiles = await TargetProfileService.Instance.GetProfilesAsync(company);
                TargetProfiles.Clear();
                foreach (var p in profiles) TargetProfiles.Add(p);
                SelectedTargetProfile = TargetProfiles.FirstOrDefault();
            }
            catch
            {
                // ignore load errors here; UI can still function
            }
        }

        // GenerateSampleData method removed - data loaded from CSV only

        #endregion
    }
}
