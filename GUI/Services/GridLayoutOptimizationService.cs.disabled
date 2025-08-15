using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Data;
using System.Diagnostics;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing Grid layouts using SharedSizeGroup and other performance techniques
    /// </summary>
    public class GridLayoutOptimizationService
    {
        private readonly Dictionary<string, HashSet<FrameworkElement>> _registeredGrids = new();
        private readonly Dictionary<string, GridSizeInfo> _sizeGroups = new();
        private readonly object _lock = new object();

        /// <summary>
        /// Registers a Grid for SharedSizeGroup optimization
        /// </summary>
        public void RegisterGrid(Grid grid, string sizeGroupName, GridSizeScope scope = GridSizeScope.Global)
        {
            if (grid == null || string.IsNullOrEmpty(sizeGroupName))
                return;

            lock (_lock)
            {
                // Enable SharedSizeGroup on the grid
                Grid.SetIsSharedSizeScope(grid, scope == GridSizeScope.Local);

                // Register the grid in our tracking
                if (!_registeredGrids.ContainsKey(sizeGroupName))
                {
                    _registeredGrids[sizeGroupName] = new HashSet<FrameworkElement>();
                }

                _registeredGrids[sizeGroupName].Add(grid);

                // Apply optimization settings
                OptimizeGridPerformance(grid);

                Debug.WriteLine($"Grid registered for SharedSizeGroup: {sizeGroupName}");
            }
        }

        /// <summary>
        /// Applies SharedSizeGroup to column definitions
        /// </summary>
        public void ApplySharedColumnSizes(Grid grid, params string[] groupNames)
        {
            if (grid?.ColumnDefinitions == null || groupNames == null)
                return;

            for (int i = 0; i < Math.Min(grid.ColumnDefinitions.Count, groupNames.Length); i++)
            {
                if (!string.IsNullOrEmpty(groupNames[i]))
                {
                    grid.ColumnDefinitions[i].SharedSizeGroup = groupNames[i];
                    
                    lock (_lock)
                    {
                        if (!_sizeGroups.ContainsKey(groupNames[i]))
                        {
                            _sizeGroups[groupNames[i]] = new GridSizeInfo();
                        }
                        _sizeGroups[groupNames[i]].ColumnCount++;
                    }
                }
            }
        }

        /// <summary>
        /// Applies SharedSizeGroup to row definitions
        /// </summary>
        public void ApplySharedRowSizes(Grid grid, params string[] groupNames)
        {
            if (grid?.RowDefinitions == null || groupNames == null)
                return;

            for (int i = 0; i < Math.Min(grid.RowDefinitions.Count, groupNames.Length); i++)
            {
                if (!string.IsNullOrEmpty(groupNames[i]))
                {
                    grid.RowDefinitions[i].SharedSizeGroup = groupNames[i];
                    
                    lock (_lock)
                    {
                        if (!_sizeGroups.ContainsKey(groupNames[i]))
                        {
                            _sizeGroups[groupNames[i]] = new GridSizeInfo();
                        }
                        _sizeGroups[groupNames[i]].RowCount++;
                    }
                }
            }
        }

        /// <summary>
        /// Creates optimized column definitions with SharedSizeGroup
        /// </summary>
        public System.Windows.Controls.ColumnDefinition[] CreateSharedColumns(params (GridLength width, string shareGroup)[] columns)
        {
            var result = new System.Windows.Controls.ColumnDefinition[columns.Length];
            
            for (int i = 0; i < columns.Length; i++)
            {
                result[i] = new System.Windows.Controls.ColumnDefinition
                {
                    Width = columns[i].width
                };

                if (!string.IsNullOrEmpty(columns[i].shareGroup))
                {
                    result[i].SharedSizeGroup = columns[i].shareGroup;
                }
            }

            return result;
        }

        /// <summary>
        /// Creates optimized row definitions with SharedSizeGroup
        /// </summary>
        public System.Windows.Controls.RowDefinition[] CreateSharedRows(params (GridLength height, string shareGroup)[] rows)
        {
            var result = new System.Windows.Controls.RowDefinition[rows.Length];
            
            for (int i = 0; i < rows.Length; i++)
            {
                result[i] = new System.Windows.Controls.RowDefinition
                {
                    Height = rows[i].height
                };

                if (!string.IsNullOrEmpty(rows[i].shareGroup))
                {
                    result[i].SharedSizeGroup = rows[i].shareGroup;
                }
            }

            return result;
        }

        /// <summary>
        /// Optimizes Grid performance settings
        /// </summary>
        public void OptimizeGridPerformance(Grid grid)
        {
            if (grid == null) return;

            // Enable hardware acceleration if possible
            RenderOptions.SetBitmapScalingMode(grid, BitmapScalingMode.NearestNeighbor);
            
            // Optimize for performance over quality in layouts
            grid.UseLayoutRounding = true;
            grid.SnapsToDevicePixels = true;

            // Set render transform origin for better performance
            grid.RenderTransformOrigin = new Point(0.5, 0.5);
        }

        /// <summary>
        /// Applies common SharedSizeGroup patterns for forms
        /// </summary>
        public void ApplyFormLayoutPattern(Grid grid, FormLayoutType layoutType = FormLayoutType.TwoColumn)
        {
            switch (layoutType)
            {
                case FormLayoutType.TwoColumn:
                    ApplyTwoColumnFormLayout(grid);
                    break;
                case FormLayoutType.ThreeColumn:
                    ApplyThreeColumnFormLayout(grid);
                    break;
                case FormLayoutType.Dashboard:
                    ApplyDashboardLayout(grid);
                    break;
                case FormLayoutType.DataEntry:
                    ApplyDataEntryLayout(grid);
                    break;
            }
        }

        /// <summary>
        /// Gets statistics about SharedSizeGroup usage
        /// </summary>
        public GridOptimizationStats GetOptimizationStats()
        {
            lock (_lock)
            {
                return new GridOptimizationStats
                {
                    RegisteredGridCount = _registeredGrids.Values.Sum(set => set.Count),
                    SharedSizeGroupCount = _sizeGroups.Count,
                    TotalSharedColumns = _sizeGroups.Values.Sum(info => info.ColumnCount),
                    TotalSharedRows = _sizeGroups.Values.Sum(info => info.RowCount),
                    SizeGroups = new Dictionary<string, GridSizeInfo>(_sizeGroups)
                };
            }
        }

        /// <summary>
        /// Clears all registered grids and size groups
        /// </summary>
        public void ClearRegistrations()
        {
            lock (_lock)
            {
                _registeredGrids.Clear();
                _sizeGroups.Clear();
            }
        }

        /// <summary>
        /// Creates a grid optimized for specific layouts
        /// </summary>
        public static Grid CreateOptimizedGrid(GridLayoutType layoutType)
        {
            var grid = new Grid();
            var service = ServiceLocator.GetService<GridLayoutOptimizationService>();
            
            switch (layoutType)
            {
                case GridLayoutType.Form:
                    SetupFormGrid(grid);
                    break;
                case GridLayoutType.Dashboard:
                    SetupDashboardGrid(grid);
                    break;
                case GridLayoutType.List:
                    SetupListGrid(grid);
                    break;
                case GridLayoutType.Detail:
                    SetupDetailGrid(grid);
                    break;
            }

            service?.OptimizeGridPerformance(grid);
            return grid;
        }

        #region Private Layout Methods

        private void ApplyTwoColumnFormLayout(Grid grid)
        {
            // Standard two-column form: Label | Input
            ApplySharedColumnSizes(grid, "FormLabel", "FormInput");
            RegisterGrid(grid, "TwoColumnForm", GridSizeScope.Global);
        }

        private void ApplyThreeColumnFormLayout(Grid grid)
        {
            // Three-column form: Label | Input | Action
            ApplySharedColumnSizes(grid, "FormLabel", "FormInput", "FormAction");
            RegisterGrid(grid, "ThreeColumnForm", GridSizeScope.Global);
        }

        private void ApplyDashboardLayout(Grid grid)
        {
            // Dashboard layout with consistent card sizes
            ApplySharedColumnSizes(grid, "DashCard", "DashCard", "DashCard");
            ApplySharedRowSizes(grid, "DashRow", "DashRow");
            RegisterGrid(grid, "Dashboard", GridSizeScope.Global);
        }

        private void ApplyDataEntryLayout(Grid grid)
        {
            // Data entry form with validation column
            ApplySharedColumnSizes(grid, "DataLabel", "DataInput", "DataValidation");
            RegisterGrid(grid, "DataEntry", GridSizeScope.Local);
        }

        private static void SetupFormGrid(Grid grid)
        {
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "FormLabel" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "FormInput" });
            Grid.SetIsSharedSizeScope(grid, true);
        }

        private static void SetupDashboardGrid(Grid grid)
        {
            // 3x2 dashboard layout
            for (int i = 0; i < 3; i++)
            {
                grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "DashCard" });
            }
            for (int i = 0; i < 2; i++)
            {
                grid.RowDefinitions.Add(new System.Windows.Controls.RowDefinition { Height = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "DashRow" });
            }
            Grid.SetIsSharedSizeScope(grid, true);
        }

        private static void SetupListGrid(Grid grid)
        {
            // List with icon, content, and action columns
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "ListIcon" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "ListContent" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "ListAction" });
            Grid.SetIsSharedSizeScope(grid, true);
        }

        private static void SetupDetailGrid(Grid grid)
        {
            // Detail view with label and value columns
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "DetailLabel" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "DetailValue" });
            Grid.SetIsSharedSizeScope(grid, true);
        }

        #endregion
    }

    /// <summary>
    /// Extension methods for Grid optimization
    /// </summary>
    public static class GridOptimizationExtensions
    {
        /// <summary>
        /// Optimizes a Grid with SharedSizeGroup
        /// </summary>
        public static Grid OptimizeLayout(this Grid grid, string sizeGroupName = null, GridSizeScope scope = GridSizeScope.Global)
        {
            var service = ServiceLocator.GetService<GridLayoutOptimizationService>();
            service?.OptimizeGridPerformance(grid);
            
            if (!string.IsNullOrEmpty(sizeGroupName))
            {
                service?.RegisterGrid(grid, sizeGroupName, scope);
            }

            return grid;
        }

        /// <summary>
        /// Applies SharedSizeGroup to columns using fluent API
        /// </summary>
        public static Grid WithSharedColumns(this Grid grid, params string[] groupNames)
        {
            var service = ServiceLocator.GetService<GridLayoutOptimizationService>();
            service?.ApplySharedColumnSizes(grid, groupNames);
            return grid;
        }

        /// <summary>
        /// Applies SharedSizeGroup to rows using fluent API
        /// </summary>
        public static Grid WithSharedRows(this Grid grid, params string[] groupNames)
        {
            var service = ServiceLocator.GetService<GridLayoutOptimizationService>();
            service?.ApplySharedRowSizes(grid, groupNames);
            return grid;
        }

        /// <summary>
        /// Applies a common form layout pattern
        /// </summary>
        public static Grid WithFormLayout(this Grid grid, FormLayoutType layoutType = FormLayoutType.TwoColumn)
        {
            var service = ServiceLocator.GetService<GridLayoutOptimizationService>();
            service?.ApplyFormLayoutPattern(grid, layoutType);
            return grid;
        }

        /// <summary>
        /// Adds a column with SharedSizeGroup
        /// </summary>
        public static Grid AddColumn(this Grid grid, GridLength width, string sharedSizeGroup = null)
        {
            var column = new System.Windows.Controls.ColumnDefinition { Width = width };
            if (!string.IsNullOrEmpty(sharedSizeGroup))
            {
                column.SharedSizeGroup = sharedSizeGroup;
            }
            grid.ColumnDefinitions.Add(column);
            return grid;
        }

        /// <summary>
        /// Adds a row with SharedSizeGroup
        /// </summary>
        public static Grid AddRow(this Grid grid, GridLength height, string sharedSizeGroup = null)
        {
            var row = new System.Windows.Controls.RowDefinition { Height = height };
            if (!string.IsNullOrEmpty(sharedSizeGroup))
            {
                row.SharedSizeGroup = sharedSizeGroup;
            }
            grid.RowDefinitions.Add(row);
            return grid;
        }
    }

    /// <summary>
    /// Scope for SharedSizeGroup
    /// </summary>
    public enum GridSizeScope
    {
        Local,  // Only within the current Grid
        Global  // Across all Grids in the application
    }

    /// <summary>
    /// Layout patterns for forms
    /// </summary>
    public enum FormLayoutType
    {
        TwoColumn,   // Label | Input
        ThreeColumn, // Label | Input | Action
        Dashboard,   // Multiple cards
        DataEntry    // Label | Input | Validation
    }

    /// <summary>
    /// Common grid layout types
    /// </summary>
    public enum GridLayoutType
    {
        Form,
        Dashboard,
        List,
        Detail
    }

    /// <summary>
    /// Information about a SharedSizeGroup
    /// </summary>
    public class GridSizeInfo
    {
        public int ColumnCount { get; set; }
        public int RowCount { get; set; }
        public DateTime LastUsed { get; set; } = DateTime.Now;

        public override string ToString()
        {
            return $"Columns: {ColumnCount}, Rows: {RowCount}";
        }
    }

    /// <summary>
    /// Statistics about grid optimization
    /// </summary>
    public class GridOptimizationStats
    {
        public int RegisteredGridCount { get; set; }
        public int SharedSizeGroupCount { get; set; }
        public int TotalSharedColumns { get; set; }
        public int TotalSharedRows { get; set; }
        public Dictionary<string, GridSizeInfo> SizeGroups { get; set; } = new();

        public double AverageColumnsPerGroup => SharedSizeGroupCount > 0 ? (double)TotalSharedColumns / SharedSizeGroupCount : 0;
        public double AverageRowsPerGroup => SharedSizeGroupCount > 0 ? (double)TotalSharedRows / SharedSizeGroupCount : 0;

        public override string ToString()
        {
            return $"Grids: {RegisteredGridCount}, SizeGroups: {SharedSizeGroupCount}, " +
                   $"Columns: {TotalSharedColumns}, Rows: {TotalSharedRows}";
        }
    }
}