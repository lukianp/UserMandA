using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using MandADiscoverySuite.Services;
using Newtonsoft.Json;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for customizable data grid functionality
    /// </summary>
    public partial class CustomizableDataGridViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private DataGrid _dataGrid;
        private ObservableCollection<object> _gridItems;
        private object _selectedItem;
        private string _currentLayout = "Default";
        
        // Column management
        private ObservableCollection<DataGridColumnInfo> _availableColumns;
        private ObservableCollection<DataGridColumnInfo> _visibleColumns;
        
        // State tracking
        private int _itemCount;
        private int _selectedItemCount;
        private readonly string _layoutsPath;

        public CustomizableDataGridViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _gridItems = new ObservableCollection<object>();
            _availableColumns = new ObservableCollection<DataGridColumnInfo>();
            _visibleColumns = new ObservableCollection<DataGridColumnInfo>();
            
            _layoutsPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite", "DataGridLayouts");
            
            InitializeCommands();
            CreateSampleData();
        }

        #region Properties

        public ObservableCollection<object> GridItems
        {
            get => _gridItems;
            set => SetProperty(ref _gridItems, value);
        }

        public object SelectedItem
        {
            get => _selectedItem;
            set => SetProperty(ref _selectedItem, value);
        }

        public string CurrentLayout
        {
            get => _currentLayout;
            set => SetProperty(ref _currentLayout, value);
        }

        public ObservableCollection<DataGridColumnInfo> AvailableColumns
        {
            get => _availableColumns;
            set => SetProperty(ref _availableColumns, value);
        }

        public ObservableCollection<DataGridColumnInfo> VisibleColumns
        {
            get => _visibleColumns;
            set => SetProperty(ref _visibleColumns, value);
        }

        public int ItemCount
        {
            get => _itemCount;
            set => SetProperty(ref _itemCount, value);
        }

        public int SelectedItemCount
        {
            get => _selectedItemCount;
            set => SetProperty(ref _selectedItemCount, value);
        }

        // Computed properties
        public bool HasSelectedItems => SelectedItemCount > 0;
        public int VisibleColumnCount => VisibleColumns?.Count(c => c.IsVisible) ?? 0;
        public int TotalColumnCount => AvailableColumns?.Count ?? 0;

        #endregion

        #region Commands

        public ICommand ShowColumnManagerCommand { get; private set; }
        public ICommand SaveLayoutCommand { get; private set; }
        public ICommand LoadLayoutCommand { get; private set; }
        public ICommand ResetLayoutCommand { get; private set; }
        public ICommand HideColumnCommand { get; private set; }
        public ICommand ResizeToFitCommand { get; private set; }
        public ICommand MoveColumnLeftCommand { get; private set; }
        public ICommand MoveColumnRightCommand { get; private set; }
        public ICommand ShowColumnSettingsCommand { get; private set; }
        public ICommand AutoSizeAllColumnsCommand { get; private set; }
        public ICommand ShowAllColumnsCommand { get; private set; }
        public ICommand FindColumnCommand { get; private set; }

        #endregion

        #region Private Methods

        private void InitializeCommands()
        {
            ShowColumnManagerCommand = new RelayCommand(ShowColumnManager);
            SaveLayoutCommand = new RelayCommand(SaveLayoutDialog);
            LoadLayoutCommand = new RelayCommand(LoadLayoutDialog);
            ResetLayoutCommand = new RelayCommand(ResetToDefault);
            HideColumnCommand = new RelayCommand<DataGridColumnHeader>(HideColumn);
            ResizeToFitCommand = new RelayCommand<DataGridColumnHeader>(ResizeToFit);
            MoveColumnLeftCommand = new RelayCommand<DataGridColumnHeader>(MoveColumnLeft);
            MoveColumnRightCommand = new RelayCommand<DataGridColumnHeader>(MoveColumnRight);
            ShowColumnSettingsCommand = new RelayCommand<DataGridColumnHeader>(ShowColumnSettings);
            AutoSizeAllColumnsCommand = new RelayCommand(AutoSizeAllColumns);
            ShowAllColumnsCommand = new RelayCommand(ShowAllColumns);
            FindColumnCommand = new RelayCommand(FindColumn);
        }

        private void CreateSampleData()
        {
            try
            {
                // Create sample data for demonstration
                var sampleItems = new List<SampleDataItem>();
                var random = new Random();
                var statuses = new[] { "Active", "Inactive", "Pending", "Completed", "Error" };
                var types = new[] { "Server", "Database", "Application", "Service", "Network" };
                
                for (int i = 1; i <= 100; i++)
                {
                    sampleItems.Add(new SampleDataItem
                    {
                        Id = i,
                        Name = $"Item {i:D3}",
                        Type = types[random.Next(types.Length)],
                        Status = statuses[random.Next(statuses.Length)],
                        Value = random.Next(1, 1000),
                        Percentage = random.NextDouble() * 100,
                        CreatedDate = DateTime.Now.AddDays(-random.Next(365)),
                        IsEnabled = random.NextDouble() > 0.3,
                        Description = $"Sample description for item {i}",
                        Category = $"Category {random.Next(1, 6)}",
                        Priority = random.Next(1, 6),
                        Owner = $"User{random.Next(1, 11)}"
                    });
                }
                
                foreach (var item in sampleItems)
                {
                    GridItems.Add(item);
                }
                
                ItemCount = GridItems.Count;
                
                Logger?.LogDebug("Created sample data with {Count} items", ItemCount);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error creating sample data");
            }
        }

        private void InitializeDefaultColumns()
        {
            try
            {
                var defaultColumns = new List<DataGridColumnInfo>
                {
                    new DataGridColumnInfo { PropertyName = "Id", Header = "ID", Width = 60, IsVisible = true, DisplayIndex = 0 },
                    new DataGridColumnInfo { PropertyName = "Name", Header = "Name", Width = 150, IsVisible = true, DisplayIndex = 1 },
                    new DataGridColumnInfo { PropertyName = "Type", Header = "Type", Width = 100, IsVisible = true, DisplayIndex = 2 },
                    new DataGridColumnInfo { PropertyName = "Status", Header = "Status", Width = 100, IsVisible = true, DisplayIndex = 3 },
                    new DataGridColumnInfo { PropertyName = "Value", Header = "Value", Width = 80, IsVisible = true, DisplayIndex = 4 },
                    new DataGridColumnInfo { PropertyName = "Percentage", Header = "Percentage", Width = 100, IsVisible = true, DisplayIndex = 5 },
                    new DataGridColumnInfo { PropertyName = "CreatedDate", Header = "Created Date", Width = 120, IsVisible = true, DisplayIndex = 6 },
                    new DataGridColumnInfo { PropertyName = "IsEnabled", Header = "Enabled", Width = 80, IsVisible = true, DisplayIndex = 7 },
                    new DataGridColumnInfo { PropertyName = "Description", Header = "Description", Width = 200, IsVisible = false, DisplayIndex = 8 },
                    new DataGridColumnInfo { PropertyName = "Category", Header = "Category", Width = 100, IsVisible = false, DisplayIndex = 9 },
                    new DataGridColumnInfo { PropertyName = "Priority", Header = "Priority", Width = 80, IsVisible = false, DisplayIndex = 10 },
                    new DataGridColumnInfo { PropertyName = "Owner", Header = "Owner", Width = 100, IsVisible = false, DisplayIndex = 11 }
                };
                
                AvailableColumns.Clear();
                VisibleColumns.Clear();
                
                foreach (var column in defaultColumns)
                {
                    AvailableColumns.Add(column);
                    if (column.IsVisible)
                    {
                        VisibleColumns.Add(column);
                    }
                }
                
                UpdatePropertyCounts();
                Logger?.LogDebug("Initialized default columns");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error initializing default columns");
            }
        }

        private void UpdatePropertyCounts()
        {
            OnPropertyChanged(nameof(HasSelectedItems));
            OnPropertyChanged(nameof(VisibleColumnCount));
            OnPropertyChanged(nameof(TotalColumnCount));
        }

        private void ShowColumnManager()
        {
            try
            {
                var columnsList = string.Join("\n", AvailableColumns.Select(c => 
                    $"• {c.Header} ({c.PropertyName}) - {(c.IsVisible ? "Visible" : "Hidden")} - Width: {c.Width}"));
                
                _notificationService?.AddInfo(
                    "Column Manager", 
                    $"Available Columns:\n{columnsList}\n\nUse the column headers to customize individual columns.");
                
                Logger?.LogDebug("Showed column manager");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing column manager");
            }
        }

        private void SaveLayoutDialog()
        {
            try
            {
                var dialog = new SaveFileDialog
                {
                    Title = "Save Column Layout",
                    Filter = "Layout Files (*.json)|*.json",
                    DefaultExt = ".json",
                    InitialDirectory = _layoutsPath,
                    FileName = $"Layout_{DateTime.Now:yyyyMMdd_HHmmss}.json"
                };
                
                if (dialog.ShowDialog() == true)
                {
                    SaveLayout(Path.GetFileNameWithoutExtension(dialog.FileName));
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing save layout dialog");
            }
        }

        private void LoadLayoutDialog()
        {
            try
            {
                var dialog = new OpenFileDialog
                {
                    Title = "Load Column Layout",
                    Filter = "Layout Files (*.json)|*.json",
                    InitialDirectory = _layoutsPath
                };
                
                if (dialog.ShowDialog() == true)
                {
                    LoadLayout(Path.GetFileNameWithoutExtension(dialog.FileName));
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing load layout dialog");
            }
        }

        private void HideColumn(DataGridColumnHeader header)
        {
            try
            {
                if (header?.Column != null)
                {
                    var column = FindColumnInfo(header.Column);
                    if (column != null)
                    {
                        column.IsVisible = false;
                        header.Column.Visibility = Visibility.Collapsed;
                        
                        _notificationService?.AddInfo(
                            "Column Hidden", 
                            $"Column '{column.Header}' has been hidden");
                        
                        UpdatePropertyCounts();
                        Logger?.LogDebug("Hid column: {ColumnName}", column.Header);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error hiding column");
            }
        }

        private void ResizeToFit(DataGridColumnHeader header)
        {
            try
            {
                if (header?.Column != null)
                {
                    header.Column.Width = DataGridLength.SizeToCells;
                    
                    var column = FindColumnInfo(header.Column);
                    if (column != null)
                    {
                        column.Width = header.Column.ActualWidth;
                        
                        _notificationService?.AddInfo(
                            "Column Resized", 
                            $"Column '{column.Header}' resized to fit content");
                        
                        Logger?.LogDebug("Resized column to fit: {ColumnName}", column.Header);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error resizing column to fit");
            }
        }

        private void MoveColumnLeft(DataGridColumnHeader header)
        {
            try
            {
                if (header?.Column != null && _dataGrid != null)
                {
                    var currentIndex = header.Column.DisplayIndex;
                    if (currentIndex > 0)
                    {
                        header.Column.DisplayIndex = currentIndex - 1;
                        
                        var column = FindColumnInfo(header.Column);
                        if (column != null)
                        {
                            column.DisplayIndex = currentIndex - 1;
                            
                            _notificationService?.AddInfo(
                                "Column Moved", 
                                $"Column '{column.Header}' moved left");
                            
                            Logger?.LogDebug("Moved column left: {ColumnName}", column.Header);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error moving column left");
            }
        }

        private void MoveColumnRight(DataGridColumnHeader header)
        {
            try
            {
                if (header?.Column != null && _dataGrid != null)
                {
                    var currentIndex = header.Column.DisplayIndex;
                    if (currentIndex < _dataGrid.Columns.Count - 1)
                    {
                        header.Column.DisplayIndex = currentIndex + 1;
                        
                        var column = FindColumnInfo(header.Column);
                        if (column != null)
                        {
                            column.DisplayIndex = currentIndex + 1;
                            
                            _notificationService?.AddInfo(
                                "Column Moved", 
                                $"Column '{column.Header}' moved right");
                            
                            Logger?.LogDebug("Moved column right: {ColumnName}", column.Header);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error moving column right");
            }
        }

        private void ShowColumnSettings(DataGridColumnHeader header)
        {
            try
            {
                if (header?.Column != null)
                {
                    var column = FindColumnInfo(header.Column);
                    if (column != null)
                    {
                        var settings = $"Column Settings:\n" +
                                      $"• Property: {column.PropertyName}\n" +
                                      $"• Header: {column.Header}\n" +
                                      $"• Width: {column.Width:F0}\n" +
                                      $"• Display Index: {column.DisplayIndex}\n" +
                                      $"• Visible: {column.IsVisible}\n" +
                                      $"• Sortable: {header.Column.CanUserSort}";
                        
                        _notificationService?.AddInfo("Column Settings", settings);
                        Logger?.LogDebug("Showed column settings: {ColumnName}", column.Header);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing column settings");
            }
        }

        private void AutoSizeAllColumns()
        {
            try
            {
                if (_dataGrid != null)
                {
                    foreach (var column in _dataGrid.Columns)
                    {
                        column.Width = DataGridLength.SizeToCells;
                        
                        var columnInfo = FindColumnInfo(column);
                        if (columnInfo != null)
                        {
                            columnInfo.Width = column.ActualWidth;
                        }
                    }
                    
                    _notificationService?.AddSuccess(
                        "Columns Resized", 
                        "All columns have been auto-sized to fit their content");
                    
                    Logger?.LogDebug("Auto-sized all columns");
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error auto-sizing all columns");
            }
        }

        private void ShowAllColumns()
        {
            try
            {
                if (_dataGrid != null)
                {
                    foreach (var column in AvailableColumns)
                    {
                        column.IsVisible = true;
                    }
                    
                    ApplyColumnLayout();
                    
                    _notificationService?.AddSuccess(
                        "Columns Shown", 
                        "All columns are now visible");
                    
                    UpdatePropertyCounts();
                    Logger?.LogDebug("Showed all columns");
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing all columns");
            }
        }

        private void FindColumn()
        {
            try
            {
                var columnsList = string.Join(", ", AvailableColumns.Select(c => c.Header));
                
                _notificationService?.AddInfo(
                    "Find Column", 
                    $"Available columns: {columnsList}");
                
                Logger?.LogDebug("Showed find column dialog");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing find column dialog");
            }
        }

        private DataGridColumnInfo FindColumnInfo(DataGridColumn column)
        {
            if (column.Header != null)
            {
                return AvailableColumns.FirstOrDefault(c => c.Header == column.Header.ToString());
            }
            return null;
        }

        private void ApplyColumnLayout()
        {
            try
            {
                if (_dataGrid == null) return;

                _dataGrid.Columns.Clear();
                
                var visibleColumns = AvailableColumns
                    .Where(c => c.IsVisible)
                    .OrderBy(c => c.DisplayIndex)
                    .ToList();
                
                foreach (var columnInfo in visibleColumns)
                {
                    var column = CreateDataGridColumn(columnInfo);
                    _dataGrid.Columns.Add(column);
                }
                
                Logger?.LogDebug("Applied column layout with {Count} visible columns", visibleColumns.Count);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error applying column layout");
            }
        }

        private DataGridColumn CreateDataGridColumn(DataGridColumnInfo columnInfo)
        {
            DataGridColumn column;
            
            // Create appropriate column type based on property type
            switch (columnInfo.PropertyName)
            {
                case "IsEnabled":
                    column = new DataGridCheckBoxColumn
                    {
                        Binding = new Binding(columnInfo.PropertyName)
                    };
                    break;
                    
                default:
                    column = new DataGridTextColumn
                    {
                        Binding = new Binding(columnInfo.PropertyName)
                    };
                    break;
            }
            
            column.Header = columnInfo.Header;
            column.Width = new DataGridLength(columnInfo.Width);
            column.DisplayIndex = columnInfo.DisplayIndex;
            column.CanUserSort = true;
            column.CanUserReorder = true;
            column.CanUserResize = true;
            
            return column;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Initializes the data grid with columns
        /// </summary>
        public void InitializeDataGrid(DataGrid dataGrid)
        {
            try
            {
                _dataGrid = dataGrid;
                InitializeDefaultColumns();
                ApplyColumnLayout();
                
                Logger?.LogDebug("Initialized data grid with columns");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error initializing data grid");
            }
        }

        /// <summary>
        /// Sets the data source for the grid
        /// </summary>
        public void SetDataSource(IEnumerable dataSource)
        {
            try
            {
                GridItems.Clear();
                
                if (dataSource != null)
                {
                    foreach (var item in dataSource)
                    {
                        GridItems.Add(item);
                    }
                }
                
                ItemCount = GridItems.Count;
                Logger?.LogDebug("Set data source with {Count} items", ItemCount);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting data source");
            }
        }

        /// <summary>
        /// Adds a column to the grid
        /// </summary>
        public void AddColumn(string propertyName, string header, double width = 100, bool isVisible = true)
        {
            try
            {
                var columnInfo = new DataGridColumnInfo
                {
                    PropertyName = propertyName,
                    Header = header,
                    Width = width,
                    IsVisible = isVisible,
                    DisplayIndex = AvailableColumns.Count
                };
                
                AvailableColumns.Add(columnInfo);
                
                if (isVisible)
                {
                    VisibleColumns.Add(columnInfo);
                    ApplyColumnLayout();
                }
                
                UpdatePropertyCounts();
                Logger?.LogDebug("Added column: {Header}", header);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error adding column: {Header}", header);
            }
        }

        /// <summary>
        /// Removes a column from the grid
        /// </summary>
        public void RemoveColumn(string propertyName)
        {
            try
            {
                var column = AvailableColumns.FirstOrDefault(c => c.PropertyName == propertyName);
                if (column != null)
                {
                    AvailableColumns.Remove(column);
                    VisibleColumns.Remove(column);
                    ApplyColumnLayout();
                    UpdatePropertyCounts();
                    
                    Logger?.LogDebug("Removed column: {PropertyName}", propertyName);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error removing column: {PropertyName}", propertyName);
            }
        }

        /// <summary>
        /// Sets column visibility
        /// </summary>
        public void SetColumnVisibility(string propertyName, bool isVisible)
        {
            try
            {
                var column = AvailableColumns.FirstOrDefault(c => c.PropertyName == propertyName);
                if (column != null)
                {
                    column.IsVisible = isVisible;
                    ApplyColumnLayout();
                    UpdatePropertyCounts();
                    
                    Logger?.LogDebug("Set column visibility: {PropertyName} = {IsVisible}", propertyName, isVisible);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting column visibility: {PropertyName}", propertyName);
            }
        }

        /// <summary>
        /// Saves the current layout
        /// </summary>
        public void SaveLayout(string layoutName)
        {
            try
            {
                Directory.CreateDirectory(_layoutsPath);
                
                var layout = new DataGridLayout
                {
                    Name = layoutName,
                    CreatedDate = DateTime.Now,
                    Columns = AvailableColumns.ToList()
                };
                
                var filePath = Path.Combine(_layoutsPath, $"{layoutName}.json");
                var json = JsonConvert.SerializeObject(layout, Formatting.Indented);
                File.WriteAllText(filePath, json);
                
                CurrentLayout = layoutName;
                
                _notificationService?.AddSuccess(
                    "Layout Saved", 
                    $"Column layout '{layoutName}' has been saved");
                
                Logger?.LogInformation("Saved column layout: {LayoutName}", layoutName);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error saving layout: {LayoutName}", layoutName);
                _notificationService?.AddError(
                    "Save Failed", 
                    "Failed to save column layout");
            }
        }

        /// <summary>
        /// Loads a saved layout
        /// </summary>
        public void LoadLayout(string layoutName)
        {
            try
            {
                var filePath = Path.Combine(_layoutsPath, $"{layoutName}.json");
                
                if (File.Exists(filePath))
                {
                    var json = File.ReadAllText(filePath);
                    var layout = JsonConvert.DeserializeObject<DataGridLayout>(json);
                    
                    if (layout?.Columns != null)
                    {
                        AvailableColumns.Clear();
                        VisibleColumns.Clear();
                        
                        foreach (var column in layout.Columns)
                        {
                            AvailableColumns.Add(column);
                            if (column.IsVisible)
                            {
                                VisibleColumns.Add(column);
                            }
                        }
                        
                        ApplyColumnLayout();
                        UpdatePropertyCounts();
                        CurrentLayout = layoutName;
                        
                        _notificationService?.AddSuccess(
                            "Layout Loaded", 
                            $"Column layout '{layoutName}' has been loaded");
                        
                        Logger?.LogInformation("Loaded column layout: {LayoutName}", layoutName);
                    }
                }
                else
                {
                    _notificationService?.AddWarning(
                        "Layout Not Found", 
                        $"Layout '{layoutName}' was not found");
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error loading layout: {LayoutName}", layoutName);
                _notificationService?.AddError(
                    "Load Failed", 
                    "Failed to load column layout");
            }
        }

        /// <summary>
        /// Resets to default layout
        /// </summary>
        public void ResetToDefault()
        {
            try
            {
                InitializeDefaultColumns();
                ApplyColumnLayout();
                CurrentLayout = "Default";
                
                _notificationService?.AddSuccess(
                    "Layout Reset", 
                    "Column layout has been reset to default");
                
                Logger?.LogInformation("Reset column layout to default");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error resetting layout to default");
            }
        }

        /// <summary>
        /// Handles column reordered event
        /// </summary>
        public void HandleColumnReordered(DataGridColumn column)
        {
            try
            {
                var columnInfo = FindColumnInfo(column);
                if (columnInfo != null)
                {
                    columnInfo.DisplayIndex = column.DisplayIndex;
                    Logger?.LogDebug("Column reordered: {ColumnName} to index {Index}", columnInfo.Header, column.DisplayIndex);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling column reordered");
            }
        }

        /// <summary>
        /// Handles column resized event
        /// </summary>
        public void HandleColumnResized(DataGridColumn column)
        {
            try
            {
                var columnInfo = FindColumnInfo(column);
                if (columnInfo != null)
                {
                    columnInfo.Width = column.ActualWidth;
                    Logger?.LogDebug("Column resized: {ColumnName} to width {Width}", columnInfo.Header, column.ActualWidth);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling column resized");
            }
        }

        /// <summary>
        /// Handles column sorting event
        /// </summary>
        public void HandleColumnSorting(DataGridColumn column, DataGridSortingEventArgs e)
        {
            try
            {
                var columnInfo = FindColumnInfo(column);
                if (columnInfo != null)
                {
                    Logger?.LogDebug("Column sorting: {ColumnName} direction {Direction}", 
                        columnInfo.Header, e.Column.SortDirection);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling column sorting");
            }
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
    /// Column information for data grid customization
    /// </summary>
    public class DataGridColumnInfo : BaseViewModel
    {
        private bool _isVisible = true;
        private double _width = 100;
        private int _displayIndex;

        public string PropertyName { get; set; }
        public string Header { get; set; }
        
        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }
        
        public double Width
        {
            get => _width;
            set => SetProperty(ref _width, value);
        }
        
        public int DisplayIndex
        {
            get => _displayIndex;
            set => SetProperty(ref _displayIndex, value);
        }
    }

    /// <summary>
    /// Data grid layout for saving/loading
    /// </summary>
    public class DataGridLayout
    {
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<DataGridColumnInfo> Columns { get; set; }
    }

    /// <summary>
    /// Sample data item for demonstration
    /// </summary>
    public class SampleDataItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public int Value { get; set; }
        public double Percentage { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsEnabled { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int Priority { get; set; }
        public string Owner { get; set; }
    }
}