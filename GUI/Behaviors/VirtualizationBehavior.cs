using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Behavior to enable UI virtualization for better performance with large datasets
    /// </summary>
    public static class VirtualizationBehavior
    {
        #region EnableVirtualization Attached Property

        public static readonly DependencyProperty EnableVirtualizationProperty =
            DependencyProperty.RegisterAttached(
                "EnableVirtualization",
                typeof(bool),
                typeof(VirtualizationBehavior),
                new PropertyMetadata(false, OnEnableVirtualizationChanged));

        public static bool GetEnableVirtualization(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableVirtualizationProperty);
        }

        public static void SetEnableVirtualization(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableVirtualizationProperty, value);
        }

        private static void OnEnableVirtualizationChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is DataGrid dataGrid && (bool)e.NewValue)
            {
                SetupVirtualization(dataGrid);
            }
            else if (d is ListBox listBox && (bool)e.NewValue)
            {
                SetupVirtualization(listBox);
            }
            else if (d is ListView listView && (bool)e.NewValue)
            {
                SetupVirtualization(listView);
            }
        }

        #endregion

        #region VirtualizationMode Attached Property

        public static readonly DependencyProperty VirtualizationModeProperty =
            DependencyProperty.RegisterAttached(
                "VirtualizationMode",
                typeof(VirtualizationMode),
                typeof(VirtualizationBehavior),
                new PropertyMetadata(VirtualizationMode.Recycling));

        public static VirtualizationMode GetVirtualizationMode(DependencyObject obj)
        {
            return (VirtualizationMode)obj.GetValue(VirtualizationModeProperty);
        }

        public static void SetVirtualizationMode(DependencyObject obj, VirtualizationMode value)
        {
            obj.SetValue(VirtualizationModeProperty, value);
        }

        #endregion

        #region ScrollUnit Attached Property

        public static readonly DependencyProperty ScrollUnitProperty =
            DependencyProperty.RegisterAttached(
                "ScrollUnit",
                typeof(ScrollUnit),
                typeof(VirtualizationBehavior),
                new PropertyMetadata(ScrollUnit.Item));

        public static ScrollUnit GetScrollUnit(DependencyObject obj)
        {
            return (ScrollUnit)obj.GetValue(ScrollUnitProperty);
        }

        public static void SetScrollUnit(DependencyObject obj, ScrollUnit value)
        {
            obj.SetValue(ScrollUnitProperty, value);
        }

        #endregion

        #region Performance Optimization Properties

        public static readonly DependencyProperty EnableColumnVirtualizationProperty =
            DependencyProperty.RegisterAttached(
                "EnableColumnVirtualization",
                typeof(bool),
                typeof(VirtualizationBehavior),
                new PropertyMetadata(true));

        public static bool GetEnableColumnVirtualization(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableColumnVirtualizationProperty);
        }

        public static void SetEnableColumnVirtualization(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableColumnVirtualizationProperty, value);
        }

        public static readonly DependencyProperty EnableRowVirtualizationProperty =
            DependencyProperty.RegisterAttached(
                "EnableRowVirtualization",
                typeof(bool),
                typeof(VirtualizationBehavior),
                new PropertyMetadata(true));

        public static bool GetEnableRowVirtualization(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableRowVirtualizationProperty);
        }

        public static void SetEnableRowVirtualization(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableRowVirtualizationProperty, value);
        }

        #endregion

        #region Private Methods

        private static void SetupVirtualization(DataGrid dataGrid)
        {
            // Enable virtualization for better performance with large datasets
            VirtualizingPanel.SetIsVirtualizing(dataGrid, true);
            VirtualizingPanel.SetVirtualizationMode(dataGrid, GetVirtualizationMode(dataGrid));
            VirtualizingPanel.SetScrollUnit(dataGrid, GetScrollUnit(dataGrid));

            // Enable column and row virtualization
            dataGrid.EnableColumnVirtualization = GetEnableColumnVirtualization(dataGrid);
            dataGrid.EnableRowVirtualization = GetEnableRowVirtualization(dataGrid);

            // Performance optimizations
            dataGrid.CanUserResizeRows = false; // Disable row resizing for better performance
            dataGrid.GridLinesVisibility = DataGridGridLinesVisibility.None; // Remove grid lines for better performance
            
            // Use recycling mode for better memory usage
            VirtualizingPanel.SetCacheLengthUnit(dataGrid, VirtualizationCacheLengthUnit.Item);
            VirtualizingPanel.SetCacheLength(dataGrid, new VirtualizationCacheLength(10, 10));
        }

        private static void SetupVirtualization(ListBox listBox)
        {
            // Enable virtualization
            VirtualizingPanel.SetIsVirtualizing(listBox, true);
            VirtualizingPanel.SetVirtualizationMode(listBox, GetVirtualizationMode(listBox));
            VirtualizingPanel.SetScrollUnit(listBox, GetScrollUnit(listBox));

            // Performance optimizations
            VirtualizingPanel.SetCacheLengthUnit(listBox, VirtualizationCacheLengthUnit.Item);
            VirtualizingPanel.SetCacheLength(listBox, new VirtualizationCacheLength(5, 5));
        }

        private static void SetupVirtualization(ListView listView)
        {
            // Enable virtualization
            VirtualizingPanel.SetIsVirtualizing(listView, true);
            VirtualizingPanel.SetVirtualizationMode(listView, GetVirtualizationMode(listView));
            VirtualizingPanel.SetScrollUnit(listView, GetScrollUnit(listView));

            // Performance optimizations
            VirtualizingPanel.SetCacheLengthUnit(listView, VirtualizationCacheLengthUnit.Item);
            VirtualizingPanel.SetCacheLength(listView, new VirtualizationCacheLength(5, 5));
        }

        #endregion
    }
}