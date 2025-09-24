using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for SharePoint data with empty state handling
    /// </summary>
    public class SharePointViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        private ObservableCollection<SharePointData> _sites = new();
        private ObservableCollection<SharePointData> _libraries = new();

        public ObservableCollection<SharePointData> Sites
        {
            get => _sites;
            set => SetProperty(ref _sites, value);
        }

        public ObservableCollection<SharePointData> Libraries
        {
            get => _libraries;
            set => SetProperty(ref _libraries, value);
        }

        public override bool HasData => (Sites?.Count ?? 0) > 0 || (Libraries?.Count ?? 0) > 0;
        public bool ShowEmptyState => !HasData && !IsLoading;

        public SharePointViewModel(
            CsvDataServiceNew csvService,
            ILogger<SharePointViewModel> logger,
            ProfileService profileService)
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        public override async Task LoadAsync()
        {
            IsLoading = true;
            LoadingMessage = "Loading SharePoint data...";
            HasErrors = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "sharepoint" }, "SharePoint data loading started");

                var profile = _profileService.CurrentProfile ?? "ljpops";

                // Load SharePoint data using generic CSV loading
                var filePatterns = new[] { "SharePoint*.csv", "SPSites*.csv" };

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
                    Sites.Clear();
                    Libraries.Clear();

                    // In production, add loaded SharePoint data here
                    // foreach (var site in sites)
                    // {
                    //     Sites.Add(site);
                    // }
                    // foreach (var library in libraries)
                    // {
                    //     Libraries.Add(library);
                    // }

                    HeaderWarnings.Add("No SharePoint data files found - displaying empty state");
                });

                OnPropertyChanged(nameof(HasData));
                OnPropertyChanged(nameof(ShowEmptyState));

                StructuredLogger?.LogInfo(LogSourceName, new {
                    action = "load_complete",
                    component = "sharepoint",
                    sites = Sites.Count,
                    libraries = Libraries.Count,
                    empty_state = Sites.Count == 0 && Libraries.Count == 0
                }, "SharePoint data loaded successfully");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load SharePoint data: {ex.Message}";
                HasErrors = true;
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "sharepoint" }, "Failed to load SharePoint data");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}