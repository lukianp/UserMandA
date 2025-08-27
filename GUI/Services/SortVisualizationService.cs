using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using MandADiscoverySuite.Controls;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing visual sort indicators and multi-column sorting
    /// </summary>
    public class SortVisualizationService
    {
        private readonly Dictionary<DataGrid, List<SortColumnInfo>> _sortedColumns;
        private readonly Dictionary<string, SortIndicator> _sortIndicators;

        public SortVisualizationService()
        {
            _sortedColumns = new Dictionary<DataGrid, List<SortColumnInfo>>();
            _sortIndicators = new Dictionary<string, SortIndicator>();
        }

        /// <summary>
        /// Applies sort visualization to a DataGrid
        /// </summary>
        public void ApplySortVisualization(DataGrid dataGrid)
        {
            if (dataGrid == null) return;

            // Subscribe to sorting events
            dataGrid.Sorting += OnDataGridSorting;
            
            // Initialize sort column tracking
            if (!_sortedColumns.ContainsKey(dataGrid))
            {
                _sortedColumns[dataGrid] = new List<SortColumnInfo>();
            }

            // Apply sort indicators to column headers
            ApplySortIndicatorsToHeaders(dataGrid);
        }

        /// <summary>
        /// Removes sort visualization from a DataGrid
        /// </summary>
        public void RemoveSortVisualization(DataGrid dataGrid)
        {
            if (dataGrid == null) return;

            dataGrid.Sorting -= OnDataGridSorting;
            
            if (_sortedColumns.ContainsKey(dataGrid))
            {
                _sortedColumns.Remove(dataGrid);
            }
        }

        /// <summary>
        /// Applies sort to a column with visual feedback
        /// </summary>
        public void ApplySortToColumn(DataGrid dataGrid, string columnName, SortDirection direction, bool addToExisting = false)
        {
            if (dataGrid == null || string.IsNullOrEmpty(columnName)) return;

            var column = dataGrid.Columns.FirstOrDefault(c => c.Header?.ToString() == columnName);
            if (column == null) return;

            if (!_sortedColumns.ContainsKey(dataGrid))
            {
                _sortedColumns[dataGrid] = new List<SortColumnInfo>();
            }

            var sortedColumns = _sortedColumns[dataGrid];
            
            if (!addToExisting)
            {
                // Clear existing sorts
                foreach (var sortInfo in sortedColumns)
                {
                    UpdateColumnSortIndicator(dataGrid, sortInfo.ColumnName, SortDirection.None, 0, false);
                }
                sortedColumns.Clear();
            }

            // Add or update sort for this column
            var existingSort = sortedColumns.FirstOrDefault(s => s.ColumnName == columnName);
            if (existingSort != null)
            {
                existingSort.Direction = direction;
                existingSort.SortOrder = direction == SortDirection.None ? 0 : sortedColumns.Count;
            }
            else if (direction != SortDirection.None)
            {
                sortedColumns.Add(new SortColumnInfo
                {
                    ColumnName = columnName,
                    Direction = direction,
                    SortOrder = sortedColumns.Count + 1
                });
            }

            // Remove if direction is None
            if (direction == SortDirection.None)
            {
                sortedColumns.RemoveAll(s => s.ColumnName == columnName);
            }

            // Update sort orders
            for (int i = 0; i < sortedColumns.Count; i++)
            {
                sortedColumns[i].SortOrder = i + 1;
            }

            // Apply visual updates
            UpdateAllSortIndicators(dataGrid);

            // Apply actual sorting to data
            ApplyDataSorting(dataGrid);
        }

        /// <summary>
        /// Clears all sorting from a DataGrid
        /// </summary>
        public void ClearAllSorting(DataGrid dataGrid)
        {
            if (dataGrid == null || !_sortedColumns.ContainsKey(dataGrid)) return;

            var sortedColumns = _sortedColumns[dataGrid];
            
            foreach (var sortInfo in sortedColumns)
            {
                UpdateColumnSortIndicator(dataGrid, sortInfo.ColumnName, SortDirection.None, 0, false);
            }
            
            sortedColumns.Clear();
            
            // Clear DataGrid sorting
            dataGrid.Items.SortDescriptions.Clear();
        }

        /// <summary>
        /// Gets the current sort information for a DataGrid
        /// </summary>
        public List<SortColumnInfo> GetSortInfo(DataGrid dataGrid)
        {
            if (!_sortedColumns.ContainsKey(dataGrid))
                return new List<SortColumnInfo>();

            return new List<SortColumnInfo>(_sortedColumns[dataGrid]);
        }

        /// <summary>
        /// Gets sort visualization statistics
        /// </summary>
        public SortVisualizationStats GetStats()
        {
            return new SortVisualizationStats
            {
                TrackedDataGrids = _sortedColumns.Count,
                TotalSortedColumns = _sortedColumns.Values.Sum(list => list.Count),
                ActiveSortIndicators = _sortIndicators.Count
            };
        }

        #region Private Methods

        private void ApplySortIndicatorsToHeaders(DataGrid dataGrid)
        {
            foreach (var column in dataGrid.Columns)
            {
                if (column.Header is string headerText)
                {
                    ApplySortIndicatorToColumn(dataGrid, column, headerText);
                }
            }
        }

        private void ApplySortIndicatorToColumn(DataGrid dataGrid, DataGridColumn column, string columnName)
        {
            // Create a container for the header with sort indicator
            var headerPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center
            };

            var headerText = new TextBlock
            {
                Text = columnName,
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 4, 0)
            };

            var sortIndicator = new SortIndicator
            {
                Width = 16,
                Height = 16,
                VerticalAlignment = VerticalAlignment.Center
            };

            var indicatorKey = $"{dataGrid.GetHashCode()}_{columnName}";
            _sortIndicators[indicatorKey] = sortIndicator;

            headerPanel.Children.Add(headerText);
            headerPanel.Children.Add(sortIndicator);

            column.Header = headerPanel;

            // Handle click events for sorting
            headerPanel.MouseLeftButtonUp += (s, e) =>
            {
                var isMultiSort = System.Windows.Input.Keyboard.Modifiers.HasFlag(System.Windows.Input.ModifierKeys.Control);
                CycleSortDirection(dataGrid, columnName, isMultiSort);
            };
        }

        private void CycleSortDirection(DataGrid dataGrid, string columnName, bool addToExisting)
        {
            var currentDirection = GetCurrentSortDirection(dataGrid, columnName);
            var newDirection = currentDirection switch
            {
                SortDirection.None => SortDirection.Ascending,
                SortDirection.Ascending => SortDirection.Descending,
                SortDirection.Descending => SortDirection.None,
                _ => SortDirection.Ascending
            };

            ApplySortToColumn(dataGrid, columnName, newDirection, addToExisting);
        }

        private SortDirection GetCurrentSortDirection(DataGrid dataGrid, string columnName)
        {
            if (!_sortedColumns.ContainsKey(dataGrid)) return SortDirection.None;

            var sortInfo = _sortedColumns[dataGrid].FirstOrDefault(s => s.ColumnName == columnName);
            return sortInfo?.Direction ?? SortDirection.None;
        }

        private void UpdateColumnSortIndicator(DataGrid dataGrid, string columnName, SortDirection direction, int sortOrder, bool showOrder)
        {
            var indicatorKey = $"{dataGrid.GetHashCode()}_{columnName}";
            if (_sortIndicators.ContainsKey(indicatorKey))
            {
                var indicator = _sortIndicators[indicatorKey];
                indicator.SortDirection = direction;
                indicator.SortOrder = sortOrder;
                indicator.ShowSortOrder = showOrder && sortOrder > 0;
                
                // Set priority color based on sort order
                var priority = sortOrder switch
                {
                    1 => SortPriority.Primary,
                    2 => SortPriority.Secondary,
                    3 => SortPriority.Tertiary,
                    _ => SortPriority.Low
                };
                
                indicator.SetSortPriority(priority);
            }
        }

        private void UpdateAllSortIndicators(DataGrid dataGrid)
        {
            if (!_sortedColumns.ContainsKey(dataGrid)) return;

            var sortedColumns = _sortedColumns[dataGrid];
            var hasMultipleSorts = sortedColumns.Count > 1;

            // Update all sorted columns
            foreach (var sortInfo in sortedColumns)
            {
                UpdateColumnSortIndicator(dataGrid, sortInfo.ColumnName, sortInfo.Direction, 
                    sortInfo.SortOrder, hasMultipleSorts);
            }

            // Update unsorted columns
            foreach (var column in dataGrid.Columns)
            {
                if (column.Header is StackPanel panel && panel.Children.Count > 1)
                {
                    if (panel.Children[0] is TextBlock textBlock)
                    {
                        var columnName = textBlock.Text;
                        if (!sortedColumns.Any(s => s.ColumnName == columnName))
                        {
                            UpdateColumnSortIndicator(dataGrid, columnName, SortDirection.None, 0, false);
                        }
                    }
                }
            }
        }

        private void ApplyDataSorting(DataGrid dataGrid)
        {
            if (!_sortedColumns.ContainsKey(dataGrid)) return;

            var collectionView = CollectionViewSource.GetDefaultView(dataGrid.ItemsSource);
            if (collectionView == null) return;

            collectionView.SortDescriptions.Clear();

            var sortedColumns = _sortedColumns[dataGrid].OrderBy(s => s.SortOrder);

            foreach (var sortInfo in sortedColumns)
            {
                var direction = sortInfo.Direction == SortDirection.Ascending 
                    ? ListSortDirection.Ascending 
                    : ListSortDirection.Descending;

                collectionView.SortDescriptions.Add(new SortDescription(sortInfo.ColumnName, direction));
            }
        }

        private void OnDataGridSorting(object sender, DataGridSortingEventArgs e)
        {
            // Prevent default sorting behavior - we handle it ourselves
            e.Handled = true;

            if (sender is DataGrid dataGrid && e.Column?.Header is StackPanel panel)
            {
                if (panel.Children[0] is TextBlock textBlock)
                {
                    var columnName = textBlock.Text;
                    var isMultiSort = System.Windows.Input.Keyboard.Modifiers.HasFlag(System.Windows.Input.ModifierKeys.Control);
                    CycleSortDirection(dataGrid, columnName, isMultiSort);
                }
            }
        }

        #endregion
    }

    /// <summary>
    /// Information about a sorted column
    /// </summary>
    public class SortColumnInfo
    {
        public string ColumnName { get; set; }
        public SortDirection Direction { get; set; }
        public int SortOrder { get; set; }
    }

    /// <summary>
    /// Statistics for sort visualization
    /// </summary>
    public class SortVisualizationStats
    {
        public int TrackedDataGrids { get; set; }
        public int TotalSortedColumns { get; set; }
        public int ActiveSortIndicators { get; set; }

        public override string ToString()
        {
            return $"Sort Visualization: DataGrids={TrackedDataGrids}, Columns={TotalSortedColumns}, Indicators={ActiveSortIndicators}";
        }
    }
}