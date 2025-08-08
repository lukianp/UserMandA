using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Controls
{
    public partial class FilterableDataGrid : UserControl, INotifyPropertyChanged
    {
        private readonly IAdvancedFilterService _filterService;
        private readonly ILogger<FilterableDataGrid> _logger;
        
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
            
            _filterService = SimpleServiceLocator.GetService<IAdvancedFilterService>() ?? new AdvancedFilterService();
            _logger = SimpleServiceLocator.GetService<ILogger<FilterableDataGrid>>();
            
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

        private void OnItemsSourceChanged(IEnumerable newItemsSource)
        {
            _originalItems = newItemsSource;
            
            if (newItemsSource != null)
            {
                // Initialize filter for the item type
                var itemType = GetItemType(newItemsSource);
                if (itemType != null)
                {
                    var initializeMethod = typeof(AdvancedFilterViewModel).GetMethod("Initialize");
                    var genericMethod = initializeMethod?.MakeGenericMethod(itemType);
                    genericMethod?.Invoke(FilterViewModel, null);
                }
            }
            
            Task.Run(RefreshFilteredItemsAsync);
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
            if (_originalItems == null)
            {
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    FilteredItems.Clear();
                    UpdatePropertyNotifications();
                });
                return;
            }

            try
            {
                IsLoading = true;
                
                var items = _originalItems.Cast<object>().ToList();
                
                // Apply advanced filters
                if (FilterViewModel?.CurrentFilter?.Rules?.Any(r => r.IsEnabled) == true)
                {
                    var itemType = GetItemType(_originalItems);
                    if (itemType != null)
                    {
                        var filterMethod = typeof(IAdvancedFilterService).GetMethod("ApplyFiltersAsync");
                        var genericMethod = filterMethod?.MakeGenericMethod(itemType);
                        
                        if (genericMethod != null)
                        {
                            var task = (Task)genericMethod.Invoke(_filterService, new object[] { items, FilterViewModel.CurrentFilter });
                            await task;
                            
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
                IsLoading = false;
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
                // TODO: Implement data export functionality
                // This could export to CSV, Excel, JSON, etc.
                var itemCount = FilteredItems?.Count ?? 0;
                MessageBox.Show($"Export functionality not yet implemented.\nWould export {itemCount} items.", 
                    "Export Data", MessageBoxButton.OK, MessageBoxImage.Information);
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
                // TODO: Implement column configuration dialog
                MessageBox.Show("Column configuration not yet implemented.", 
                    "Column Configuration", MessageBoxButton.OK, MessageBoxImage.Information);
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