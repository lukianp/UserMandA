using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Views;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Controls
{
    public partial class FilterableDataGrid : UserControl, INotifyPropertyChanged
    {
        private readonly IAdvancedFilterService _filterService;
        private readonly ILogger<FilterableDataGrid> _logger;
        private readonly SemaphoreSlim _dataOperationLock = new SemaphoreSlim(1, 1);
        
        private IEnumerable _originalItems;
        private ObservableCollection<object> _filteredItems;
        private AdvancedFilterViewModel _filterViewModel;
        private string _globalSearchText;
        private object _selectedItem;
        private bool _isLoading;
        private bool _isReadOnly;

        public FilterableDataGrid()
        {
            InitializeComponent();
            
            _filterService = SimpleServiceLocator.Instance.GetService<IAdvancedFilterService>() ?? new AdvancedFilterService();
            _logger = SimpleServiceLocator.Instance.GetService<ILogger<FilterableDataGrid>>();
            
            FilteredItems = new ObservableCollection<object>();
            FilterViewModel = new AdvancedFilterViewModel(_filterService, null);
            
            // Subscribe to filter events
            FilterViewModel.FilterApplied += OnFilterApplied;
            FilterViewModel.FilterCleared += OnFilterCleared;
            
            DataContext = this;
            
            // Initialize commands
            ClearSearchCommand = new ViewModels.RelayCommand(ClearSearch);
            ExportDataCommand = new ViewModels.RelayCommand(ExportData);
            ShowColumnConfigCommand = new ViewModels.RelayCommand(ShowColumnConfiguration);
            
            // Subscribe to Unloaded event
            Unloaded += OnUnloadedHandler;
        }

        #region Dependency Properties

        public static readonly DependencyProperty ItemsSourceProperty =
            DependencyProperty.Register(nameof(ItemsSource), typeof(IEnumerable), typeof(FilterableDataGrid),
                new PropertyMetadata(null, OnItemsSourceChanged));

        public static readonly DependencyProperty ColumnsProperty =
            DependencyProperty.Register(nameof(Columns), typeof(ObservableCollection<DataGridColumn>), typeof(FilterableDataGrid),
                new PropertyMetadata(null));

        public static readonly DependencyProperty AutoGenerateColumnsProperty =
            DependencyProperty.Register(nameof(AutoGenerateColumns), typeof(bool), typeof(FilterableDataGrid),
                new PropertyMetadata(true));

        public static readonly DependencyProperty ItemTypeProperty =
            DependencyProperty.Register(nameof(ItemType), typeof(Type), typeof(FilterableDataGrid),
                new PropertyMetadata(null, OnItemTypeChanged));

        #endregion

        #region Properties

        public IEnumerable ItemsSource
        {
            get => (IEnumerable)GetValue(ItemsSourceProperty);
            set => SetValue(ItemsSourceProperty, value);
        }

        public ObservableCollection<DataGridColumn> Columns
        {
            get => (ObservableCollection<DataGridColumn>)GetValue(ColumnsProperty);
            set => SetValue(ColumnsProperty, value);
        }

        public bool AutoGenerateColumns
        {
            get => (bool)GetValue(AutoGenerateColumnsProperty);
            set => SetValue(AutoGenerateColumnsProperty, value);
        }

        public Type ItemType
        {
            get => (Type)GetValue(ItemTypeProperty);
            set => SetValue(ItemTypeProperty, value);
        }

        public ObservableCollection<object> FilteredItems
        {
            get => _filteredItems;
            private set => SetProperty(ref _filteredItems, value);
        }

        public AdvancedFilterViewModel FilterViewModel
        {
            get => _filterViewModel;
            private set => SetProperty(ref _filterViewModel, value);
        }

        public string GlobalSearchText
        {
            get => _globalSearchText;
            set
            {
                if (SetProperty(ref _globalSearchText, value))
                {
                    Task.Run(ApplyGlobalSearchAsync);
                    OnPropertyChanged(nameof(HasSearchText));
                }
            }
        }

        public object SelectedItem
        {
            get => _selectedItem;
            set => SetProperty(ref _selectedItem, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public bool IsReadOnly
        {
            get => _isReadOnly;
            set => SetProperty(ref _isReadOnly, value);
        }

        public bool HasSearchText => !string.IsNullOrEmpty(GlobalSearchText);
        public bool HasActiveFilters => FilterViewModel?.CurrentFilter?.Rules?.Any(r => r.IsEnabled) == true;
        public int ActiveFilterCount => FilterViewModel?.CurrentFilter?.Rules?.Count(r => r.IsEnabled) ?? 0;
        public int ItemCount => FilteredItems?.Count ?? 0;
        public bool IsEmpty => ItemCount == 0 && !IsLoading;

        #endregion

        #region Commands

        public ICommand ClearSearchCommand { get; }
        public ICommand ExportDataCommand { get; }
        public ICommand ShowColumnConfigCommand { get; }

        #endregion

        #region Event Handlers

        private static void OnItemsSourceChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FilterableDataGrid control)
            {
                control.OnItemsSourceChanged(e.NewValue as IEnumerable);
            }
        }

        private static void OnItemTypeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FilterableDataGrid control)
            {
                try
                {
                    if (e.NewValue is Type itemType && control.FilterViewModel != null)
                    {
                        var initializeMethod = typeof(AdvancedFilterViewModel).GetMethod("Initialize");
                        var genericMethod = initializeMethod?.MakeGenericMethod(itemType);
                        genericMethod?.Invoke(control.FilterViewModel, null);
                    }
                }
                catch (Exception ex)
                {
                    control._logger?.LogError(ex, "Error initializing filter for ItemType change");
                }
            }
        }

        private void OnItemsSourceChanged(IEnumerable newItemsSource)
        {
            // Serialize ItemsSource updates with other data operations
            Task.Run(async () =>
            {
                await _dataOperationLock.WaitAsync().ConfigureAwait(false);
                try
                {
                    _originalItems = newItemsSource;

                    if (newItemsSource != null)
                    {
                        // Initialize filter for the item type (prefer explicit ItemType)
                        var itemType = ItemType ?? GetItemType(newItemsSource);
                        if (itemType != null && itemType != typeof(object))
                        {
                            var initializeMethod = typeof(AdvancedFilterViewModel).GetMethod("Initialize");
                            var genericMethod = initializeMethod?.MakeGenericMethod(itemType);
                            genericMethod?.Invoke(FilterViewModel, null);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error handling ItemsSource change");
                }
                finally
                {
                    _dataOperationLock.Release();
                }

                // Refresh after updating source to reflect changes
                await RefreshFilteredItemsAsync().ConfigureAwait(false);
            });
        }

        private async void OnFilterApplied(object sender, FilterAppliedEventArgs e)
        {
            await RefreshFilteredItemsAsync();
        }

        private async void OnFilterCleared(object sender, EventArgs e)
        {
            await RefreshFilteredItemsAsync();
            OnPropertyChanged(nameof(HasActiveFilters));
            OnPropertyChanged(nameof(ActiveFilterCount));
        }

        #endregion

        #region Methods

        private async Task RefreshFilteredItemsAsync()
        {
            await _dataOperationLock.WaitAsync().ConfigureAwait(false);
            try
            {
                if (_originalItems == null)
                {
                    await Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        IsLoading = false;
                        FilteredItems.Clear();
                        UpdatePropertyNotifications();
                    });
                    return;
                }

                await Application.Current.Dispatcher.InvokeAsync(() => IsLoading = true);

                var items = _originalItems.Cast<object>().ToList();

                // Apply advanced filters
                if (FilterViewModel?.CurrentFilter?.Rules?.Any(r => r.IsEnabled) == true)
                {
                    var itemType = ItemType ?? GetItemType(_originalItems);
                    if (itemType != null && itemType != typeof(object))
                    {
                        var filterMethod = typeof(IAdvancedFilterService).GetMethod("ApplyFiltersAsync");
                        var genericMethod = filterMethod?.MakeGenericMethod(itemType);

                        if (genericMethod != null)
                        {
                            var task = (Task)genericMethod.Invoke(_filterService, new object[] { items, FilterViewModel.CurrentFilter });
                            await task.ConfigureAwait(false);

                            var resultProperty = task.GetType().GetProperty("Result");
                            if (resultProperty != null)
                            {
                                items = ((IEnumerable)resultProperty.GetValue(task)).Cast<object>().ToList();
                            }
                        }
                    }
                }

                // Apply global search
                if (!string.IsNullOrEmpty(GlobalSearchText))
                {
                    items = ApplyGlobalSearch(items, GlobalSearchText).ToList();
                }

                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    FilteredItems.Clear();
                    foreach (var item in items)
                    {
                        FilteredItems.Add(item);
                    }

                    UpdatePropertyNotifications();
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error refreshing filtered items");
            }
            finally
            {
                await Application.Current.Dispatcher.InvokeAsync(() => IsLoading = false);
                _dataOperationLock.Release();
            }
        }

        private async Task ApplyGlobalSearchAsync()
        {
            await RefreshFilteredItemsAsync();
        }

        private IEnumerable<object> ApplyGlobalSearch(IEnumerable<object> items, string searchText)
        {
            if (string.IsNullOrEmpty(searchText) || items == null)
                return items ?? Enumerable.Empty<object>();

            var searchLower = searchText.ToLowerInvariant();
            
            return items.Where(item =>
            {
                if (item == null) return false;
                
                // Search through all string properties
                var properties = item.GetType().GetProperties()
                    .Where(p => p.CanRead && p.PropertyType == typeof(string));
                
                foreach (var prop in properties)
                {
                    try
                    {
                        var value = prop.GetValue(item) as string;
                        if (!string.IsNullOrEmpty(value) && 
                            value.ToLowerInvariant().Contains(searchLower))
                        {
                            return true;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogDebug(ex, "Error accessing property {PropertyName} for search", prop.Name);
                    }
                }
                
                return false;
            });
        }

        private Type GetItemType(IEnumerable items)
        {
            // Prefer explicitly provided ItemType
            if (ItemType != null)
                return ItemType;

            if (items == null) return null;

            var enumerableType = items.GetType();

            if (enumerableType.IsGenericType)
            {
                var genericArgs = enumerableType.GetGenericArguments();
                if (genericArgs.Length > 0)
                {
                    return genericArgs[0];
                }
            }

            // Fallback: try to get type from first item
            foreach (var item in items)
            {
                return item?.GetType();
            }

            // If we cannot infer, fall back to object (filters won't be applied generically)
            return typeof(object);
        }

        private void ClearSearch()
        {
            GlobalSearchText = null;
        }

        private void ExportData()
        {
            try
            {
                // Simple CSV export implementation
                var items = FilteredItems?.Cast<object>().ToList() ?? new List<object>();
                if (items.Count == 0)
                {
                    MessageBox.Show("No data to export.", "Export Data", MessageBoxButton.OK, MessageBoxImage.Information);
                    return;
                }
                
                var fileName = $"data_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
                var filePath = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), fileName);
                
                using (var writer = new System.IO.StreamWriter(filePath))
                {
                    // Export visible columns as CSV
                    var visibleColumns = MainDataGrid.Columns.Where(c => c.Visibility == Visibility.Visible).ToList();
                    var headers = visibleColumns.Select(c => c.Header?.ToString() ?? "Column");
                    writer.WriteLine(string.Join(",", headers));
                    
                    foreach (var item in items.Take(1000)) // Limit to 1000 rows
                    {
                        var values = visibleColumns.Select(c => GetColumnValue(item, c) ?? "");
                        writer.WriteLine(string.Join(",", values.Select(v => $"\"{v}\"")));
                    }
                }
                
                MessageBox.Show($"Exported {Math.Min(items.Count, 1000)} items to {fileName}", 
                    "Export Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting data");
                MessageBox.Show($"Export failed: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ShowColumnConfiguration()
        {
            try
            {
                // Build configuration from current DataGrid columns
                var configuration = new DataGridColumnConfiguration
                {
                    ViewName = this.Name ?? "FilterableDataGrid",
                    ConfigurationName = "Current",
                    IsDefault = false,
                    CreatedDate = DateTime.Now,
                    ModifiedDate = DateTime.Now
                };

                foreach (var col in MainDataGrid.Columns.OrderBy(c => c.DisplayIndex))
                {
                    string propertyName = null;
                    if (col is DataGridBoundColumn bound && bound.Binding is Binding binding)
                    {
                        propertyName = binding.Path?.Path;
                    }

                    configuration.Columns.Add(new ColumnViewModel
                    {
                        Header = col.Header?.ToString() ?? propertyName ?? "Column",
                        PropertyName = propertyName ?? col.Header?.ToString(),
                        IsVisible = col.Visibility == Visibility.Visible,
                        IsSortable = col.CanUserSort,
                        IsResizable = col.CanUserResize,
                        Width = col.Width.IsSizeToCells || col.Width.IsAuto ? double.NaN : (col.ActualWidth > 0 ? col.ActualWidth : col.Width.Value),
                        MinWidth = col.MinWidth,
                        MaxWidth = col.MaxWidth,
                        DisplayOrder = col.DisplayIndex
                    });
                }

                var viewModel = new ColumnChooserViewModel(configuration);
                var dialog = new ColumnChooserDialog
                {
                    Owner = Window.GetWindow(this),
                    DataContext = viewModel
                };

                var result = dialog.ShowDialog();
                if (result == true)
                {
                    // Apply the chosen configuration
                    var orderedVisible = configuration.VisibleColumns.ToList();
                    for (int i = 0; i < orderedVisible.Count; i++)
                    {
                        var vm = orderedVisible[i];
                        var column = FindColumn(vm);
                        if (column != null)
                        {
                            column.Visibility = Visibility.Visible;
                            column.DisplayIndex = i;
                            column.CanUserSort = vm.IsSortable;
                            column.CanUserResize = vm.IsResizable;
                            if (!double.IsNaN(vm.Width) && vm.Width > 0)
                            {
                                column.Width = new DataGridLength(vm.Width);
                            }
                        }
                    }

                    // Hide remaining columns
                    var toHide = configuration.HiddenColumns.ToList();
                    foreach (var vm in toHide)
                    {
                        var column = FindColumn(vm);
                        if (column != null)
                        {
                            column.Visibility = Visibility.Collapsed;
                        }
                    }
                }

                DataGridColumn FindColumn(ColumnViewModel vm)
                {
                    // Prefer match by binding path
                    foreach (var c in MainDataGrid.Columns)
                    {
                        if (c is DataGridBoundColumn dbc && dbc.Binding is Binding b && !string.IsNullOrEmpty(vm.PropertyName))
                        {
                            if (string.Equals(b.Path?.Path, vm.PropertyName, StringComparison.Ordinal))
                                return c;
                        }
                    }
                    // Fallback by header text
                    return MainDataGrid.Columns.FirstOrDefault(c => string.Equals(c.Header?.ToString(), vm.Header, StringComparison.Ordinal));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error showing column configuration");
                MessageBox.Show($"Column configuration failed: {ex.Message}", "Configuration Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void UpdatePropertyNotifications()
        {
            OnPropertyChanged(nameof(ItemCount));
            OnPropertyChanged(nameof(IsEmpty));
            OnPropertyChanged(nameof(HasActiveFilters));
            OnPropertyChanged(nameof(ActiveFilterCount));
        }
        
        private string GetColumnValue(object item, DataGridColumn column)
        {
            try
            {
                if (column is DataGridBoundColumn boundColumn && boundColumn.Binding is Binding binding)
                {
                    var propertyPath = binding.Path?.Path;
                    if (!string.IsNullOrEmpty(propertyPath))
                    {
                        var propertyInfo = item.GetType().GetProperty(propertyPath);
                        var value = propertyInfo?.GetValue(item);
                        return value?.ToString() ?? "";
                    }
                }
                return item?.ToString() ?? "";
            }
            catch
            {
                return "";
            }
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(storage, value))
                return false;

            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        #endregion

        #region Cleanup

        private void OnUnloadedHandler(object sender, RoutedEventArgs e)
        {
            if (FilterViewModel != null)
            {
                FilterViewModel.FilterApplied -= OnFilterApplied;
                FilterViewModel.FilterCleared -= OnFilterCleared;
                FilterViewModel.Dispose();
            }
        }

        #endregion
    }
}