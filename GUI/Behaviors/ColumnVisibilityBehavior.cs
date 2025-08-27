using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Behaviors
{
    public static class ColumnVisibilityBehavior
    {
        public static readonly DependencyProperty GridNameProperty =
            DependencyProperty.RegisterAttached(
                "GridName",
                typeof(string),
                typeof(ColumnVisibilityBehavior),
                new PropertyMetadata(null, OnGridNameChanged));

        public static string GetGridName(DependencyObject obj)
        {
            return (string)obj.GetValue(GridNameProperty);
        }

        public static void SetGridName(DependencyObject obj, string value)
        {
            obj.SetValue(GridNameProperty, value);
        }

        private static void OnGridNameChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is DataGrid dataGrid && e.NewValue is string gridName)
            {
                dataGrid.Loaded += (sender, args) => ApplyColumnVisibility(dataGrid, gridName);
                
                // Subscribe to column visibility changes
                ColumnVisibilityService.Instance.PropertyChanged += (sender, args) =>
                {
                    if (args.PropertyName == $"{gridName}ColumnsChanged")
                    {
                        Application.Current.Dispatcher.BeginInvoke(() =>
                        {
                            ApplyColumnVisibility(dataGrid, gridName);
                        });
                    }
                };
            }
        }

        private static void ApplyColumnVisibility(DataGrid dataGrid, string gridName)
        {
            ColumnVisibilityService.Instance.ApplyColumnVisibility(dataGrid, gridName);
        }
    }
}