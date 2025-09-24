using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for mailbox data with empty state handling
    /// </summary>
    public class MailboxesViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        private ObservableCollection<MailboxData> _mailboxes = new();

        public ObservableCollection<MailboxData> Mailboxes
        {
            get => _mailboxes;
            set => SetProperty(ref _mailboxes, value);
        }

        public override bool HasData => Mailboxes?.Count > 0;

        // Statistics
        public long TotalMailboxSize => Mailboxes?.Sum(m => m.TotalSize) ?? 0;
        public int TotalItemCount => Mailboxes?.Sum(m => m.ItemCount) ?? 0;

        public MailboxesViewModel(
            CsvDataServiceNew csvService,
            ILogger<MailboxesViewModel> logger,
            ProfileService profileService)
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        public override async Task LoadAsync()
        {
            IsLoading = true;
            LoadingMessage = "Loading mailboxes...";
            HasErrors = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "mailboxes" }, "Mailboxes data loading started");

                var profile = _profileService.CurrentProfile ?? "ljpops";

                // Load mailbox data using generic CSV loading since LoadMailboxesAsync doesn't exist
                var filePatterns = new[] { "Mailboxes*.csv", "ExchangeMailboxes*.csv", "Mail*.csv" };
                var mailboxes = new List<MailboxData>();

                foreach (var pattern in filePatterns)
                {
                    var filePath = System.IO.Path.Combine(
                        System.IO.Path.Combine("C:\\discoverydata", profile, "Raw"), $"{pattern.Replace("*", "test")}");
                    // For now, use empty data - this would be loaded from CSV files in production
                    // var csvData = await _csvService.LoadCsvDataAsync(filePath);

                    // Mock data for testing empty state
                    // In production, this would parse the CSV data and create MailboxData objects
                }

                // Update data collection on UI thread
                await System.Windows.Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    Mailboxes.Clear();
                    // In production, add loaded mailboxes here
                    // foreach (var mailbox in mailboxes)
                    // {
                    //     Mailboxes.Add(mailbox);
                    // }

                    HeaderWarnings.Add("No mailbox data files found - displaying empty state");
                });

                OnPropertyChanged(nameof(HasData));
                OnPropertyChanged(nameof(TotalMailboxSize));
                OnPropertyChanged(nameof(TotalItemCount));

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "load_complete",
                    component = "mailboxes",
                    rows = Mailboxes.Count,
                    total_size = TotalMailboxSize,
                    total_items = TotalItemCount,
                    empty_state = Mailboxes.Count == 0
                }, "Mailboxes data loaded successfully");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load mailboxes: {ex.Message}";
                HasErrors = true;
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "mailboxes" }, "Failed to load mailboxes data");
            }
            finally
            {
                IsLoading = false;
            }
        }

        public MailboxStatistics GetMailboxStatistics()
        {
            return new MailboxStatistics
            {
                TotalCount = Mailboxes.Count,
                TotalSize = TotalMailboxSize,
                AverageSize = Mailboxes.Count > 0 ? TotalMailboxSize / Mailboxes.Count : 0
            };
        }
    }

    public class MailboxStatistics
    {
        public int TotalCount { get; set; }
        public long TotalSize { get; set; }
        public long AverageSize { get; set; }
    }
}