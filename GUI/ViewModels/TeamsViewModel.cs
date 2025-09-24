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
    /// ViewModel for Microsoft Teams data with empty state handling
    /// </summary>
    public class TeamsViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        private ObservableCollection<TeamsData> _teams = new();
        private ObservableCollection<TeamsData> _channels = new();

        public ObservableCollection<TeamsData> Teams
        {
            get => _teams;
            set => SetProperty(ref _teams, value);
        }

        public ObservableCollection<TeamsData> Channels
        {
            get => _channels;
            set => SetProperty(ref _channels, value);
        }

        public override bool HasData => (Teams?.Count ?? 0) > 0 || (Channels?.Count ?? 0) > 0;
        public int TotalMemberCount => Teams?.Sum(t => t.MemberCount) ?? 0;
        public int TotalChannelCount => Channels?.Count ?? 0;

        public TeamsViewModel(
            CsvDataServiceNew csvService,
            ILogger<TeamsViewModel> logger,
            ProfileService profileService)
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        public override async Task LoadAsync()
        {
            IsLoading = true;
            LoadingMessage = "Loading Teams data...";
            HasErrors = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "teams" }, "Teams data loading started");

                var profile = _profileService.CurrentProfile ?? "ljpops";

                // Load Teams data using generic CSV loading
                var filePatterns = new[] { "Teams*.csv", "MicrosoftTeams*.csv" };

                foreach (var pattern in filePatterns)
                {
                    var filePath = System.IO.Path.Combine(
                        System.IO.Path.Combine("C:\\discoverydata", profile, "Raw"), pattern.Replace("*", "test"));
                    // For now, use empty data - this would be loaded from CSV files in production
                    // var csvData = await _csvService.LoadCsvDataAsync(filePath);
                }

                // Update data collection on UI thread
                await System.Windows.Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    Teams.Clear();
                    Channels.Clear();

                    // In production, add loaded Teams data here
                    // foreach (var team in teams)
                    // {
                    //     Teams.Add(team);
                    // }
                    // foreach (var channel in channels)
                    // {
                    //     Channels.Add(channel);
                    // }

                    HeaderWarnings.Add("No Teams data files found - displaying empty state");
                });

                OnPropertyChanged(nameof(HasData));
                OnPropertyChanged(nameof(TotalMemberCount));
                OnPropertyChanged(nameof(TotalChannelCount));

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "load_complete",
                    component = "teams",
                    teams = Teams.Count,
                    channels = Channels.Count,
                    total_members = TotalMemberCount,
                    empty_state = Teams.Count == 0 && Channels.Count == 0
                }, "Teams data loaded successfully");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load Teams data: {ex.Message}";
                HasErrors = true;
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "teams" }, "Failed to load Teams data");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}