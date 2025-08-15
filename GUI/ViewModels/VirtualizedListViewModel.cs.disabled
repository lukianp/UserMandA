using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for virtualized list functionality
    /// </summary>
    public partial class VirtualizedListViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private readonly Stopwatch _renderStopwatch;
        private IVirtualDataSource _dataSource;
        
        // Collection properties
        private ObservableCollection<VirtualListItem> _virtualizedItems;
        private VirtualListItem _selectedItem;
        private string _searchText = "";
        private string _selectedFilter = "All";
        
        // Virtualization properties
        private int _itemsPerPage = 100;
        private int _currentPage = 0;
        private int _totalItems;
        private int _displayedItems;
        private bool _isLoading;
        private string _loadingMessage = "Loading items...";
        
        // Performance tracking
        private double _renderTime;
        private string _memoryUsage = "0 MB";
        private double _scrollPosition;
        private double _viewportHeight;

        public VirtualizedListViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _renderStopwatch = new Stopwatch();
            _virtualizedItems = new ObservableCollection<VirtualListItem>();
            
            InitializeCommands();
            InitializeSampleData();
        }

        #region Properties

        public ObservableCollection<VirtualListItem> VirtualizedItems
        {
            get => _virtualizedItems;
            set => SetProperty(ref _virtualizedItems, value);
        }

        public VirtualListItem SelectedItem
        {
            get => _selectedItem;
            set => SetProperty(ref _selectedItem, value);
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    _ = FilterItemsAsync();
                }
            }
        }

        public string SelectedFilter
        {
            get => _selectedFilter;
            set
            {
                if (SetProperty(ref _selectedFilter, value))
                {
                    _ = FilterItemsAsync();
                }
            }
        }

        public int ItemsPerPage
        {
            get => _itemsPerPage;
            set
            {
                if (SetProperty(ref _itemsPerPage, value))
                {
                    RefreshData();
                }
            }
        }

        public int TotalItems
        {
            get => _totalItems;
            set => SetProperty(ref _totalItems, value);
        }

        public int DisplayedItems
        {
            get => _displayedItems;
            set => SetProperty(ref _displayedItems, value);
        }

        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public new string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        public double RenderTime
        {
            get => _renderTime;
            set => SetProperty(ref _renderTime, value);
        }

        public string MemoryUsage
        {
            get => _memoryUsage;
            set => SetProperty(ref _memoryUsage, value);
        }

        // Computed properties
        public bool IsEmpty => !IsLoading && DisplayedItems == 0;
        public bool HasSelectedItems => SelectedItemsCount > 0;
        public int SelectedItemsCount => VirtualizedItems?.Count(i => i.IsSelected) ?? 0;

        // Options for UI
        public List<string> FilterOptions { get; } = new List<string> 
        { 
            "All", "Active", "Inactive", "Completed", "Pending", "Error" 
        };
        
        public List<int> PageSizeOptions { get; } = new List<int> 
        { 
            50, 100, 200, 500, 1000 
        };

        #endregion

        #region Commands

        public ICommand RefreshCommand { get; private set; }
        public ICommand ShowSettingsCommand { get; private set; }
        public ICommand ViewItemCommand { get; private set; }
        public ICommand EditItemCommand { get; private set; }
        public ICommand ShowPerformanceCommand { get; private set; }

        #endregion

        #region Private Methods

        protected override void InitializeCommands()
        {
            RefreshCommand = new RelayCommand(RefreshData);
            ShowSettingsCommand = new RelayCommand(ShowSettings);
            ViewItemCommand = new RelayCommand<VirtualListItem>(ViewItem);
            EditItemCommand = new RelayCommand<VirtualListItem>(EditItem);
            ShowPerformanceCommand = new RelayCommand(ShowPerformanceDetails);
        }

        private void InitializeSampleData()
        {
            // Create a sample data source for demonstration
            _dataSource = new SampleVirtualDataSource();
            RefreshData();
        }

        public void RefreshData()
        {
            Task.Run(async () =>
            {
                await LoadItemsAsync(0, ItemsPerPage);
            });
        }

        private async Task LoadItemsAsync(int startIndex, int count)
        {
            try
            {
                _renderStopwatch.Restart();
                
                App.Current?.Dispatcher.Invoke(() =>
                {
                    IsLoading = true;
                    LoadingMessage = "Loading items...";
                });

                if (_dataSource != null)
                {
                    var items = await _dataSource.GetItemsAsync(startIndex, count, SearchText, SelectedFilter);
                    var totalCount = await _dataSource.GetTotalCountAsync(SearchText, SelectedFilter);

                    App.Current?.Dispatcher.Invoke(() =>
                    {
                        VirtualizedItems.Clear();
                        foreach (var item in items)
                        {
                            VirtualizedItems.Add(item);
                        }

                        TotalItems = totalCount;
                        DisplayedItems = VirtualizedItems.Count;
                        _currentPage = startIndex / ItemsPerPage;
                        
                        UpdatePerformanceMetrics();
                        IsLoading = false;
                    });
                }

                _renderStopwatch.Stop();
                RenderTime = _renderStopwatch.ElapsedMilliseconds;

                Logger?.LogDebug("Loaded {Count} items in {Time}ms", count, RenderTime);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error loading virtualized items");
                App.Current?.Dispatcher.Invoke(() =>
                {
                    IsLoading = false;
                    _notificationService?.AddError(
                        "Loading Error", 
                        "Failed to load items from data source");
                });
            }
        }

        private async Task FilterItemsAsync()
        {
            try
            {
                await LoadItemsAsync(0, ItemsPerPage);
                
                Logger?.LogDebug("Filtered items with search '{Search}' and filter '{Filter}'", 
                    SearchText, SelectedFilter);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error filtering items");
            }
        }

        private void UpdatePerformanceMetrics()
        {
            try
            {
                // Calculate memory usage (approximation)
                var memoryBytes = VirtualizedItems.Count * 1024; // Assume ~1KB per item
                MemoryUsage = $"{memoryBytes / 1024.0 / 1024.0:F1} MB";

                OnPropertyChanged(nameof(IsEmpty));
                OnPropertyChanged(nameof(HasSelectedItems));
                OnPropertyChanged(nameof(SelectedItemsCount));
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating performance metrics");
            }
        }

        private void ShowSettings()
        {
            try
            {
                var settings = $"Virtualization Settings:\n" +
                              $"• Items per page: {ItemsPerPage}\n" +
                              $"• Current page: {_currentPage + 1}\n" +
                              $"• Total pages: {(TotalItems + ItemsPerPage - 1) / ItemsPerPage}\n" +
                              $"• Scroll position: {_scrollPosition:F0}px\n" +
                              $"• Viewport height: {_viewportHeight:F0}px";

                _notificationService?.AddInfo("Virtualization Settings", settings);
                
                Logger?.LogDebug("Showed virtualization settings");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing virtualization settings");
            }
        }

        private void ViewItem(VirtualListItem item)
        {
            try
            {
                if (item == null) return;

                _notificationService?.AddInfo(
                    "Item Details", 
                    $"Viewing item: {item.Title}\nID: {item.Id}\nStatus: {item.Status}");
                
                Logger?.LogDebug("Viewed item: {ItemId}", item.Id);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error viewing item: {ItemId}", item?.Id);
            }
        }

        private void EditItem(VirtualListItem item)
        {
            try
            {
                if (item == null) return;

                _notificationService?.AddInfo(
                    "Edit Item", 
                    $"Editing item: {item.Title}");
                
                Logger?.LogDebug("Edited item: {ItemId}", item.Id);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error editing item: {ItemId}", item?.Id);
            }
        }

        private void ShowPerformanceDetails()
        {
            try
            {
                var details = $"Performance Metrics:\n" +
                             $"• Render time: {RenderTime}ms\n" +
                             $"• Memory usage: {MemoryUsage}\n" +
                             $"• Items rendered: {DisplayedItems:N0}\n" +
                             $"• Total items: {TotalItems:N0}\n" +
                             $"• Virtualization ratio: {(double)DisplayedItems / Math.Max(TotalItems, 1):P1}\n" +
                             $"• Scroll position: {_scrollPosition:F0}px";

                _notificationService?.AddInfo("Performance Details", details);
                
                Logger?.LogDebug("Showed performance details");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing performance details");
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Sets the data source for virtualization
        /// </summary>
        public void SetDataSource<T>(IVirtualDataSource<T> dataSource) where T : class
        {
            try
            {
                _dataSource = dataSource as IVirtualDataSource;
                RefreshData();
                
                Logger?.LogDebug("Set data source: {DataSourceType}", dataSource?.GetType().Name);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting data source");
            }
        }

        /// <summary>
        /// Loads more items for infinite scrolling
        /// </summary>
        public async Task LoadMoreItemsAsync()
        {
            try
            {
                if (IsLoading || DisplayedItems >= TotalItems) return;

                var nextPage = _currentPage + 1;
                var startIndex = nextPage * ItemsPerPage;
                
                LoadingMessage = $"Loading more items... (Page {nextPage + 1})";
                IsLoading = true;

                if (_dataSource != null)
                {
                    var items = await _dataSource.GetItemsAsync(startIndex, ItemsPerPage, SearchText, SelectedFilter);
                    
                    App.Current?.Dispatcher.Invoke(() =>
                    {
                        foreach (var item in items)
                        {
                            VirtualizedItems.Add(item);
                        }
                        
                        DisplayedItems = VirtualizedItems.Count;
                        _currentPage = nextPage;
                        
                        UpdatePerformanceMetrics();
                        IsLoading = false;
                    });
                }

                Logger?.LogDebug("Loaded more items for page {Page}", nextPage);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error loading more items");
                App.Current?.Dispatcher.Invoke(() => IsLoading = false);
            }
        }

        /// <summary>
        /// Updates scroll position for performance tracking
        /// </summary>
        public void UpdateScrollPosition(double scrollOffset, double viewportHeight)
        {
            _scrollPosition = scrollOffset;
            _viewportHeight = viewportHeight;
        }

        /// <summary>
        /// Logs an error (accessible to code-behind)
        /// </summary>
        public void LogError(Exception ex, string message)
        {
            Logger?.LogError(ex, message);
        }

        #endregion
    }

    /// <summary>
    /// Interface for virtual data sources
    /// </summary>
    public interface IVirtualDataSource
    {
        Task<IEnumerable<VirtualListItem>> GetItemsAsync(int startIndex, int count, string searchText = "", string filter = "");
        Task<int> GetTotalCountAsync(string searchText = "", string filter = "");
    }

    /// <summary>
    /// Generic interface for virtual data sources
    /// </summary>
    public interface IVirtualDataSource<T> : IVirtualDataSource where T : class
    {
        new Task<IEnumerable<T>> GetItemsAsync(int startIndex, int count, string searchText = "", string filter = "");
    }

    /// <summary>
    /// Virtual list item model
    /// </summary>
    public class VirtualListItem : BaseViewModel
    {
        private bool _isSelected;
        
        public string Id { get; set; }
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Icon { get; set; } = "📄";
        public string Status { get; set; }
        public string StatusColor { get; set; } = "#6C757D";
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public object Data { get; set; }

        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }
    }

    /// <summary>
    /// Sample data source for demonstration
    /// </summary>
    public class SampleVirtualDataSource : IVirtualDataSource
    {
        private readonly List<VirtualListItem> _allItems;

        public SampleVirtualDataSource()
        {
            _allItems = GenerateSampleData(10000); // Large dataset for testing
        }

        public async Task<IEnumerable<VirtualListItem>> GetItemsAsync(int startIndex, int count, string searchText = "", string filter = "")
        {
            await Task.Delay(100); // Simulate network delay

            var filteredItems = _allItems.AsEnumerable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(searchText))
            {
                filteredItems = filteredItems.Where(i => 
                    i.Title.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
                    i.Subtitle.Contains(searchText, StringComparison.OrdinalIgnoreCase));
            }

            // Apply status filter
            if (filter != "All")
            {
                filteredItems = filteredItems.Where(i => i.Status == filter);
            }

            return filteredItems.Skip(startIndex).Take(count).ToList();
        }

        public async Task<int> GetTotalCountAsync(string searchText = "", string filter = "")
        {
            await Task.Delay(50); // Simulate network delay

            var filteredItems = _allItems.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                filteredItems = filteredItems.Where(i => 
                    i.Title.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
                    i.Subtitle.Contains(searchText, StringComparison.OrdinalIgnoreCase));
            }

            if (filter != "All")
            {
                filteredItems = filteredItems.Where(i => i.Status == filter);
            }

            return filteredItems.Count();
        }

        private List<VirtualListItem> GenerateSampleData(int count)
        {
            var items = new List<VirtualListItem>();
            var statuses = new[] { "Active", "Inactive", "Completed", "Pending", "Error" };
            var colors = new[] { "#28A745", "#6C757D", "#007BFF", "#FFC107", "#DC3545" };
            var icons = new[] { "📁", "📄", "🔧", "⚙️", "📊", "🔍", "💾", "🌐" };
            var random = new Random();

            for (int i = 0; i < count; i++)
            {
                var statusIndex = random.Next(statuses.Length);
                items.Add(new VirtualListItem
                {
                    Id = $"ITEM-{i:D6}",
                    Title = $"Sample Item {i + 1:N0}",
                    Subtitle = $"Description for item {i + 1} with additional details",
                    Icon = icons[random.Next(icons.Length)],
                    Status = statuses[statusIndex],
                    StatusColor = colors[statusIndex],
                    CreatedDate = DateTime.Now.AddDays(-random.Next(365))
                });
            }

            return items;
        }
    }
}