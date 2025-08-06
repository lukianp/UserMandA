using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Helper class for optimizing DataGrid bindings and performance
    /// </summary>
    public static class DataGridOptimizer
    {
        /// <summary>
        /// Creates an optimized text column with minimal verbosity
        /// </summary>
        public static DataGridTextColumn CreateTextColumn(string header, string binding, 
            double width = double.NaN, string format = null, bool canSort = true)
        {
            var column = new DataGridTextColumn
            {
                Header = header,
                CanUserSort = canSort,
                SortMemberPath = canSort ? binding : null
            };

            // Create optimized binding
            var bindingObj = new Binding(binding)
            {
                Mode = BindingMode.OneWay,
                UpdateSourceTrigger = UpdateSourceTrigger.PropertyChanged
            };

            if (!string.IsNullOrEmpty(format))
                bindingObj.StringFormat = format;

            column.Binding = bindingObj;

            if (!double.IsNaN(width))
                column.Width = width;

            return column;
        }

        /// <summary>
        /// Creates an optimized template column
        /// </summary>
        public static DataGridTemplateColumn CreateTemplateColumn(string header, DataTemplate cellTemplate,
            DataTemplate editTemplate = null, double width = double.NaN, bool canSort = false)
        {
            var column = new DataGridTemplateColumn
            {
                Header = header,
                CellTemplate = cellTemplate,
                CanUserSort = canSort
            };

            if (editTemplate != null)
                column.CellEditingTemplate = editTemplate;

            if (!double.IsNaN(width))
                column.Width = width;

            return column;
        }

        /// <summary>
        /// Creates an optimized checkbox column
        /// </summary>
        public static DataGridCheckBoxColumn CreateCheckBoxColumn(string header, string binding,
            double width = double.NaN, bool isReadOnly = true)
        {
            var column = new DataGridCheckBoxColumn
            {
                Header = header,
                IsReadOnly = isReadOnly,
                CanUserSort = true,
                SortMemberPath = binding
            };

            column.Binding = new Binding(binding)
            {
                Mode = isReadOnly ? BindingMode.OneWay : BindingMode.TwoWay,
                UpdateSourceTrigger = UpdateSourceTrigger.PropertyChanged
            };

            if (!double.IsNaN(width))
                column.Width = width;

            return column;
        }

        /// <summary>
        /// Applies performance optimizations to a DataGrid
        /// </summary>
        public static void OptimizeDataGrid(DataGrid dataGrid)
        {
            if (dataGrid == null) return;

            // Enable virtualization for better performance with large datasets
            dataGrid.EnableRowVirtualization = true;
            dataGrid.EnableColumnVirtualization = true;
            VirtualizingPanel.SetIsVirtualizing(dataGrid, true);
            VirtualizingPanel.SetVirtualizationMode(dataGrid, VirtualizationMode.Recycling);

            // Enable deferred scrolling for better performance
            ScrollViewer.SetIsDeferredScrollingEnabled(dataGrid, true);

            // Disable unnecessary features for performance
            dataGrid.CanUserResizeRows = false; // Usually not needed
            dataGrid.SelectionUnit = DataGridSelectionUnit.FullRow; // More efficient

            // Set optimal column sizing
            foreach (var column in dataGrid.Columns)
            {
                if (column.Width.IsAuto)
                {
                    // Auto sizing can be expensive with large datasets
                    column.Width = new DataGridLength(100, DataGridLengthUnitType.Pixel);
                }
            }
        }

        /// <summary>
        /// Creates optimized column definitions for common data types
        /// </summary>
        public static class CommonColumns
        {
            /// <summary>
            /// Creates a name column with standard formatting
            /// </summary>
            public static DataGridTextColumn Name(string binding = "Name", double width = 150)
            {
                return CreateTextColumn("Name", binding, width);
            }

            /// <summary>
            /// Creates a name column with custom header and standard formatting
            /// </summary>
            public static DataGridTextColumn Name(string header, string binding, double width)
            {
                return CreateTextColumn(header, binding, width);
            }

            /// <summary>
            /// Creates an email column with standard formatting
            /// </summary>
            public static DataGridTextColumn Email(string binding = "Email", double width = 200)
            {
                return CreateTextColumn("Email", binding, width);
            }

            /// <summary>
            /// Creates an email column with custom header and standard formatting
            /// </summary>
            public static DataGridTextColumn Email(string header, string binding, double width)
            {
                return CreateTextColumn(header, binding, width);
            }

            /// <summary>
            /// Creates a status column with standard formatting
            /// </summary>
            public static DataGridTextColumn Status(string binding = "Status", double width = 100)
            {
                return CreateTextColumn("Status", binding, width);
            }

            /// <summary>
            /// Creates a date column with standard formatting
            /// </summary>
            public static DataGridTextColumn Date(string header, string binding, double width = 120, 
                string format = "MM/dd/yyyy")
            {
                return CreateTextColumn(header, binding, width, format);
            }

            /// <summary>
            /// Creates a numeric column with standard formatting
            /// </summary>
            public static DataGridTextColumn Numeric(string header, string binding, double width = 80, 
                string format = "N0")
            {
                return CreateTextColumn(header, binding, width, format);
            }

            /// <summary>
            /// Creates a percentage column with standard formatting
            /// </summary>
            public static DataGridTextColumn Percentage(string header, string binding, double width = 80)
            {
                return CreateTextColumn(header, binding, width, "P1");
            }

            /// <summary>
            /// Creates a currency column with standard formatting
            /// </summary>
            public static DataGridTextColumn Currency(string header, string binding, double width = 100)
            {
                return CreateTextColumn(header, binding, width, "C");
            }

            /// <summary>
            /// Creates a boolean column as checkbox
            /// </summary>
            public static DataGridCheckBoxColumn Boolean(string header, string binding, double width = 60)
            {
                return CreateCheckBoxColumn(header, binding, width);
            }
        }

    }

    /// <summary>
    /// Extension methods for easier DataGrid optimization
    /// </summary>
    public static class DataGridExtensions
    {
        /// <summary>
        /// Applies optimizations to the DataGrid
        /// </summary>
        public static DataGrid Optimize(this DataGrid dataGrid)
        {
            DataGridOptimizer.OptimizeDataGrid(dataGrid);
            return dataGrid;
        }

        /// <summary>
        /// Adds an optimized text column
        /// </summary>
        public static DataGrid AddTextColumn(this DataGrid dataGrid, string header, string binding,
            double width = double.NaN, string format = null, bool canSort = true)
        {
            dataGrid.Columns.Add(DataGridOptimizer.CreateTextColumn(header, binding, width, format, canSort));
            return dataGrid;
        }

        /// <summary>
        /// Adds an optimized checkbox column
        /// </summary>
        public static DataGrid AddCheckBoxColumn(this DataGrid dataGrid, string header, string binding,
            double width = double.NaN, bool isReadOnly = true)
        {
            dataGrid.Columns.Add(DataGridOptimizer.CreateCheckBoxColumn(header, binding, width, isReadOnly));
            return dataGrid;
        }

        /// <summary>
        /// Sets up common user columns
        /// </summary>
        public static DataGrid SetupUserColumns(this DataGrid dataGrid)
        {
            dataGrid.Columns.Clear();
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("DisplayName", 180));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Email("Email", 200));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Department", 150));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Status("Status", 100));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Email("UserPrincipalName", 200));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Date("Last Sign-In", "LastSignInDateTime", 140));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Numeric("Groups", "GroupMembershipCount", 60));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Manager", "ManagerDisplayName", 150));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Job Title", "JobTitle", 150));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("City", "City", 120));
            return dataGrid;
        }

        /// <summary>
        /// Sets up common infrastructure columns
        /// </summary>
        public static DataGrid SetupInfrastructureColumns(this DataGrid dataGrid)
        {
            dataGrid.Columns.Clear();
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Device Name", "Name", 200));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Type", "Type", 150));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("IP Address", "IPAddress", 120));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Status("Status", 100));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("OS", "OperatingSystem", 150));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Version", "Version", 120));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Location", "Location", 120));
            dataGrid.Columns.Add(DataGridOptimizer.CommonColumns.Name("Manufacturer", "Manufacturer", 120));
            return dataGrid;
        }
    }

    /// <summary>
    /// Provides extension methods for framework elements to optimize bindings
    /// </summary>
    public static class BindingOptimizationExtensions
    {
        /// <summary>
        /// Sets an optimized OneWay binding
        /// </summary>
        public static T BindOneWay<T>(this T element, DependencyProperty property, string path)
            where T : DependencyObject
        {
            var binding = new Binding(path) { Mode = BindingMode.OneWay };
            BindingOperations.SetBinding(element, property, binding);
            return element;
        }

        /// <summary>
        /// Sets an optimized OneTime binding
        /// </summary>
        public static T BindOneTime<T>(this T element, DependencyProperty property, string path)
            where T : DependencyObject
        {
            var binding = new Binding(path) { Mode = BindingMode.OneTime };
            BindingOperations.SetBinding(element, property, binding);
            return element;
        }

        /// <summary>
        /// Sets an optimized TwoWay binding
        /// </summary>
        public static T BindTwoWay<T>(this T element, DependencyProperty property, string path, 
            UpdateSourceTrigger trigger = UpdateSourceTrigger.PropertyChanged)
            where T : DependencyObject
        {
            var binding = new Binding(path) 
            { 
                Mode = BindingMode.TwoWay, 
                UpdateSourceTrigger = trigger 
            };
            BindingOperations.SetBinding(element, property, binding);
            return element;
        }

        /// <summary>
        /// Sets an optimized collection binding with async loading
        /// </summary>
        public static T BindCollection<T>(this T element, DependencyProperty property, string path, 
            bool async = true) where T : DependencyObject
        {
            var binding = new Binding(path) 
            { 
                Mode = BindingMode.OneWay, 
                IsAsync = async 
            };
            BindingOperations.SetBinding(element, property, binding);
            return element;
        }

        /// <summary>
        /// Optimizes all bindings on a framework element
        /// </summary>
        public static T OptimizeBindings<T>(this T element) where T : FrameworkElement
        {
            BindingHelper.OptimizeElement(element);
            return element;
        }
    }
}