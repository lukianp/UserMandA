using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Collections;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for displaying application inventory with filtering capabilities
    /// </summary>
    public class ApplicationInventoryViewModel : BaseViewModel
    {
        private readonly CsvDataService _csvDataService;
        private ICollectionView _applicationsView;
        private string _searchText = string.Empty;
        private string _dataDirectory;

        public OptimizedObservableCollection<ApplicationData> Applications { get; }

        public ICollectionView ApplicationsView
        {
            get => _applicationsView;
            private set => SetProperty(ref _applicationsView, value);
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplicationsView?.Refresh();
                }
            }
        }

        public ICommand RefreshApplicationsCommand { get; }
        public ICommand ClearSearchCommand { get; }

        public ApplicationInventoryViewModel(CsvDataService csvDataService = null)
        {
            _csvDataService = csvDataService ?? new CsvDataService();
            Applications = new OptimizedObservableCollection<ApplicationData>();
            ApplicationsView = CollectionViewSource.GetDefaultView(Applications);
            ApplicationsView.Filter = FilterApplications;

            RefreshApplicationsCommand = new AsyncRelayCommand(RefreshApplicationsAsync);
            ClearSearchCommand = new RelayCommand(() => SearchText = string.Empty);
        }

        public async Task InitializeAsync(string dataDirectory)
        {
            _dataDirectory = dataDirectory;
            await RefreshApplicationsAsync();
        }

        private bool FilterApplications(object obj)
        {
            if (obj is not ApplicationData app)
                return false;

            if (string.IsNullOrWhiteSpace(SearchText))
                return true;

            return (app.Name?.IndexOf(SearchText, StringComparison.OrdinalIgnoreCase) >= 0) ||
                   (app.Publisher?.IndexOf(SearchText, StringComparison.OrdinalIgnoreCase) >= 0);
        }

        private async Task RefreshApplicationsAsync()
        {
            if (string.IsNullOrWhiteSpace(_dataDirectory))
                return;

            IsLoading = true;
            try
            {
                var apps = await _csvDataService.LoadApplicationsAsync(_dataDirectory);
                Applications.Clear();
                foreach (var app in apps)
                {
                    Applications.Add(app);
                }
                ApplicationsView.Refresh();
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
