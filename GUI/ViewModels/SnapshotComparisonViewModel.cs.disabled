using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class SnapshotComparisonViewModel : BaseViewModel
    {
        private readonly ISnapshotService _snapshotService;
        private readonly ILogger<SnapshotComparisonViewModel> _logger;
        
        private ObservableCollection<Snapshot> _availableSnapshots;
        private Snapshot _baselineSnapshot;
        private Snapshot _compareSnapshot;
        private ComparisonResult _comparisonResult;
        private ObservableCollection<ChangeItem> _changes;
        private ObservableCollection<ChangeItem> _filteredChanges;
        private bool _isComparing;
        private string _selectedChangeType;
        private string _selectedCategory;
        private string _searchText;

        public SnapshotComparisonViewModel(ISnapshotService snapshotService = null, ILogger<SnapshotComparisonViewModel> logger = null)
        {
            _snapshotService = snapshotService ?? SimpleServiceLocator.GetService<ISnapshotService>() ?? new SnapshotService();
            _logger = logger;

            TabTitle = "Snapshot Comparison";
            CanClose = true;

            AvailableSnapshots = new ObservableCollection<Snapshot>();
            Changes = new ObservableCollection<ChangeItem>();
            FilteredChanges = new ObservableCollection<ChangeItem>();

            // Initialize filter options
            ChangeTypes = new ObservableCollection<string> { "All", "Added", "Removed", "Modified" };
            Categories = new ObservableCollection<string> { "All", "Users", "Infrastructure", "Groups", "Applications" };
            
            SelectedChangeType = "All";
            SelectedCategory = "All";

            // Commands
            LoadSnapshotsCommand = new AsyncRelayCommand(LoadSnapshotsAsync);
            CompareSnapshotsCommand = new AsyncRelayCommand(CompareSnapshotsAsync, CanCompareSnapshots);
            CreateSnapshotCommand = new AsyncRelayCommand(CreateSnapshotAsync);
            DeleteSnapshotCommand = new RelayCommand<Snapshot>(snapshot => Task.Run(() => DeleteSnapshotAsync(snapshot)));
            ExportComparisonCommand = new AsyncRelayCommand(ExportComparisonAsync, () => ComparisonResult != null);
            RefreshCommand = new AsyncRelayCommand(LoadSnapshotsAsync);
            ClearFiltersCommand = new RelayCommand(ClearFilters);

            // Load snapshots on initialization
            Task.Run(LoadSnapshotsAsync);
        }

        #region Properties

        public ObservableCollection<Snapshot> AvailableSnapshots
        {
            get => _availableSnapshots;
            set => SetProperty(ref _availableSnapshots, value);
        }

        public Snapshot BaselineSnapshot
        {
            get => _baselineSnapshot;
            set
            {
                SetProperty(ref _baselineSnapshot, value);
            }
        }

        public Snapshot CompareSnapshot
        {
            get => _compareSnapshot;
            set
            {
                SetProperty(ref _compareSnapshot, value);
            }
        }

        public ComparisonResult ComparisonResult
        {
            get => _comparisonResult;
            set
            {
                if (SetProperty(ref _comparisonResult, value) && value != null)
                {
                    Changes.Clear();
                    foreach (var change in value.Changes)
                    {
                        Changes.Add(change);
                    }
                    ApplyFilters();
                }
            }
        }

        public ObservableCollection<ChangeItem> Changes
        {
            get => _changes;
            set => SetProperty(ref _changes, value);
        }

        public ObservableCollection<ChangeItem> FilteredChanges
        {
            get => _filteredChanges;
            set => SetProperty(ref _filteredChanges, value);
        }

        public bool IsComparing
        {
            get => _isComparing;
            set => SetProperty(ref _isComparing, value);
        }

        public string SelectedChangeType
        {
            get => _selectedChangeType;
            set
            {
                if (SetProperty(ref _selectedChangeType, value))
                {
                    ApplyFilters();
                }
            }
        }

        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (SetProperty(ref _selectedCategory, value))
                {
                    ApplyFilters();
                }
            }
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilters();
                }
            }
        }

        public ObservableCollection<string> ChangeTypes { get; }
        public ObservableCollection<string> Categories { get; }

        #endregion

        #region Commands

        public AsyncRelayCommand LoadSnapshotsCommand { get; }
        public AsyncRelayCommand CompareSnapshotsCommand { get; }
        public AsyncRelayCommand CreateSnapshotCommand { get; }
        public ICommand DeleteSnapshotCommand { get; }
        public AsyncRelayCommand ExportComparisonCommand { get; }
        public AsyncRelayCommand RefreshCommand { get; }
        public ICommand ClearFiltersCommand { get; }

        #endregion

        #region Methods

        private async Task LoadSnapshotsAsync()
        {
            try
            {
                IsLoading = true;
                ErrorMessage = null;

                var snapshots = await _snapshotService.GetSnapshotsAsync();

                AvailableSnapshots.Clear();
                foreach (var snapshot in snapshots)
                {
                    AvailableSnapshots.Add(snapshot);
                }

                _logger?.LogInformation("Loaded {Count} snapshots", snapshots.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load snapshots");
                ErrorMessage = $"Failed to load snapshots: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private bool CanCompareSnapshots()
        {
            return BaselineSnapshot != null && CompareSnapshot != null && BaselineSnapshot.Id != CompareSnapshot.Id;
        }

        private async Task CompareSnapshotsAsync()
        {
            if (!CanCompareSnapshots()) return;

            try
            {
                IsComparing = true;
                ErrorMessage = null;

                var result = await _snapshotService.CompareSnapshotsAsync(BaselineSnapshot.Id, CompareSnapshot.Id);
                ComparisonResult = result;

                _logger?.LogInformation("Compared snapshots: {BaselineName} vs {CompareName}, found {ChangeCount} changes",
                    BaselineSnapshot.Name, CompareSnapshot.Name, result.Changes.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to compare snapshots");
                ErrorMessage = $"Failed to compare snapshots: {ex.Message}";
            }
            finally
            {
                IsComparing = false;
            }
        }

        private async Task CreateSnapshotAsync()
        {
            try
            {
                IsLoading = true;
                ErrorMessage = null;

                var snapshot = await _snapshotService.CreateSnapshotAsync();
                AvailableSnapshots.Insert(0, snapshot); // Add to beginning (most recent first)

                _logger?.LogInformation("Created new snapshot: {SnapshotName}", snapshot.Name);
                StatusMessage = $"Created snapshot: {snapshot.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to create snapshot");
                ErrorMessage = $"Failed to create snapshot: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task DeleteSnapshotAsync(Snapshot snapshot)
        {
            if (snapshot == null) return;

            try
            {
                await _snapshotService.DeleteSnapshotAsync(snapshot.Id);
                AvailableSnapshots.Remove(snapshot);

                // Clear selections if deleted snapshot was selected
                if (BaselineSnapshot?.Id == snapshot.Id)
                    BaselineSnapshot = null;
                if (CompareSnapshot?.Id == snapshot.Id)
                    CompareSnapshot = null;

                _logger?.LogInformation("Deleted snapshot: {SnapshotName}", snapshot.Name);
                StatusMessage = $"Deleted snapshot: {snapshot.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to delete snapshot: {SnapshotId}", snapshot.Id);
                ErrorMessage = $"Failed to delete snapshot: {ex.Message}";
            }
        }

        private async Task ExportComparisonAsync()
        {
            if (ComparisonResult == null) return;

            try
            {
                var fileName = $"Comparison_{BaselineSnapshot.Name}_vs_{CompareSnapshot.Name}_{DateTime.Now:yyyyMMdd_HHmmss}.json";
                var filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), fileName);

                // Create a simplified comparison report
                var report = new
                {
                    ComparisonResult.BaselineSnapshotId,
                    ComparisonResult.CompareSnapshotId,
                    BaselineSnapshotName = BaselineSnapshot.Name,
                    CompareSnapshotName = CompareSnapshot.Name,
                    ComparisonResult.ComparisonDate,
                    ComparisonResult.Summary,
                    Changes = ComparisonResult.Changes.Select(c => new
                    {
                        c.Category,
                        c.Type,
                        c.ItemName,
                        c.PropertyName,
                        c.OldValue,
                        c.NewValue,
                        c.Description,
                        c.DetectedAt
                    })
                };

                var json = System.Text.Json.JsonSerializer.Serialize(report, new System.Text.Json.JsonSerializerOptions
                {
                    WriteIndented = true
                });

                await File.WriteAllTextAsync(filePath, json);

                _logger?.LogInformation("Exported comparison to: {FilePath}", filePath);
                StatusMessage = $"Exported comparison to: {fileName}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to export comparison");
                ErrorMessage = $"Failed to export comparison: {ex.Message}";
            }
        }

        private void ApplyFilters()
        {
            if (Changes == null || !Changes.Any())
            {
                FilteredChanges?.Clear();
                return;
            }

            var filtered = Changes.AsEnumerable();

            // Apply change type filter
            if (!string.IsNullOrEmpty(SelectedChangeType) && SelectedChangeType != "All")
            {
                filtered = filtered.Where(c => c.Type == SelectedChangeType);
            }

            // Apply category filter
            if (!string.IsNullOrEmpty(SelectedCategory) && SelectedCategory != "All")
            {
                filtered = filtered.Where(c => c.Category == SelectedCategory);
            }

            // Apply search filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                var search = SearchText.ToLowerInvariant();
                filtered = filtered.Where(c =>
                    (c.ItemName?.ToLowerInvariant().Contains(search) == true) ||
                    (c.Description?.ToLowerInvariant().Contains(search) == true) ||
                    (c.PropertyName?.ToLowerInvariant().Contains(search) == true));
            }

            FilteredChanges.Clear();
            foreach (var change in filtered)
            {
                FilteredChanges.Add(change);
            }
        }

        private void ClearFilters()
        {
            SelectedChangeType = "All";
            SelectedCategory = "All";
            SearchText = string.Empty;
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                AvailableSnapshots?.Clear();
                Changes?.Clear();
                FilteredChanges?.Clear();
            }
            base.Dispose(disposing);
        }
    }
}