using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Behavior that provides responsive layout capabilities for better UI scaling and performance
    /// </summary>
    public static class ResponsiveLayoutBehavior
    {
        #region EnableResponsiveLayout Attached Property

        public static readonly DependencyProperty EnableResponsiveLayoutProperty =
            DependencyProperty.RegisterAttached(
                "EnableResponsiveLayout",
                typeof(bool),
                typeof(ResponsiveLayoutBehavior),
                new PropertyMetadata(false, OnEnableResponsiveLayoutChanged));

        public static bool GetEnableResponsiveLayout(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableResponsiveLayoutProperty);
        }

        public static void SetEnableResponsiveLayout(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableResponsiveLayoutProperty, value);
        }

        private static void OnEnableResponsiveLayoutChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FrameworkElement element)
            {
                if ((bool)e.NewValue)
                {
                    AttachResponsiveLayout(element);
                }
                else
                {
                    DetachResponsiveLayout(element);
                }
            }
        }

        #endregion

        #region SmallScreenThreshold Attached Property

        public static readonly DependencyProperty SmallScreenThresholdProperty =
            DependencyProperty.RegisterAttached(
                "SmallScreenThreshold",
                typeof(double),
                typeof(ResponsiveLayoutBehavior),
                new PropertyMetadata(800.0));

        public static double GetSmallScreenThreshold(DependencyObject obj)
        {
            return (double)obj.GetValue(SmallScreenThresholdProperty);
        }

        public static void SetSmallScreenThreshold(DependencyObject obj, double value)
        {
            obj.SetValue(SmallScreenThresholdProperty, value);
        }

        #endregion

        #region MediumScreenThreshold Attached Property

        public static readonly DependencyProperty MediumScreenThresholdProperty =
            DependencyProperty.RegisterAttached(
                "MediumScreenThreshold",
                typeof(double),
                typeof(ResponsiveLayoutBehavior),
                new PropertyMetadata(1200.0));

        public static double GetMediumScreenThreshold(DependencyObject obj)
        {
            return (double)obj.GetValue(MediumScreenThresholdProperty);
        }

        public static void SetMediumScreenThreshold(DependencyObject obj, double value)
        {
            obj.SetValue(MediumScreenThresholdProperty, value);
        }

        #endregion

        #region AdaptiveColumns Attached Property

        public static readonly DependencyProperty AdaptiveColumnsProperty =
            DependencyProperty.RegisterAttached(
                "AdaptiveColumns",
                typeof(bool),
                typeof(ResponsiveLayoutBehavior),
                new PropertyMetadata(false));

        public static bool GetAdaptiveColumns(DependencyObject obj)
        {
            return (bool)obj.GetValue(AdaptiveColumnsProperty);
        }

        public static void SetAdaptiveColumns(DependencyObject obj, bool value)
        {
            obj.SetValue(AdaptiveColumnsProperty, value);
        }

        #endregion

        #region Current Screen Size (Read-only)

        private static readonly DependencyPropertyKey CurrentScreenSizePropertyKey =
            DependencyProperty.RegisterAttachedReadOnly(
                "CurrentScreenSize",
                typeof(ScreenSize),
                typeof(ResponsiveLayoutBehavior),
                new PropertyMetadata(ScreenSize.Large));

        public static readonly DependencyProperty CurrentScreenSizeProperty =
            CurrentScreenSizePropertyKey.DependencyProperty;

        public static ScreenSize GetCurrentScreenSize(DependencyObject obj)
        {
            return (ScreenSize)obj.GetValue(CurrentScreenSizeProperty);
        }

        private static void SetCurrentScreenSize(DependencyObject obj, ScreenSize value)
        {
            obj.SetValue(CurrentScreenSizePropertyKey, value);
        }

        #endregion

        #region Private Methods

        private static void AttachResponsiveLayout(FrameworkElement element)
        {
            element.SizeChanged += OnElementSizeChanged;
            element.Loaded += OnElementLoaded;
            
            // Initial layout update
            if (element.IsLoaded)
            {
                UpdateResponsiveLayout(element);
            }
        }

        private static void DetachResponsiveLayout(FrameworkElement element)
        {
            element.SizeChanged -= OnElementSizeChanged;
            element.Loaded -= OnElementLoaded;
        }

        private static void OnElementLoaded(object sender, RoutedEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                UpdateResponsiveLayout(element);
            }
        }

        private static void OnElementSizeChanged(object sender, SizeChangedEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                UpdateResponsiveLayout(element);
            }
        }

        private static void UpdateResponsiveLayout(FrameworkElement element)
        {
            var width = element.ActualWidth;
            var smallThreshold = GetSmallScreenThreshold(element);
            var mediumThreshold = GetMediumScreenThreshold(element);

            var newScreenSize = DetermineScreenSize(width, smallThreshold, mediumThreshold);
            var currentScreenSize = GetCurrentScreenSize(element);

            if (newScreenSize != currentScreenSize)
            {
                SetCurrentScreenSize(element, newScreenSize);
                ApplyResponsiveChanges(element, newScreenSize);
            }
        }

        private static ScreenSize DetermineScreenSize(double width, double smallThreshold, double mediumThreshold)
        {
            if (width < smallThreshold)
                return ScreenSize.Small;
            else if (width < mediumThreshold)
                return ScreenSize.Medium;
            else
                return ScreenSize.Large;
        }

        private static void ApplyResponsiveChanges(FrameworkElement element, ScreenSize screenSize)
        {
            // Apply general responsive changes
            ApplyResponsivePadding(element, screenSize);
            ApplyResponsiveMargins(element, screenSize);
            ApplyResponsiveFontSizes(element, screenSize);

            // Apply specific control optimizations
            if (element is Grid grid)
            {
                ApplyResponsiveGridLayout(grid, screenSize);
            }
            else if (element is DataGrid dataGrid)
            {
                ApplyResponsiveDataGridLayout(dataGrid, screenSize);
            }
            else if (element is ItemsControl itemsControl)
            {
                ApplyResponsiveItemsLayout(itemsControl, screenSize);
            }

            // Apply adaptive columns if enabled
            if (GetAdaptiveColumns(element))
            {
                ApplyAdaptiveColumns(element, screenSize);
            }
        }

        private static void ApplyResponsivePadding(FrameworkElement element, ScreenSize screenSize)
        {
            var scaleFactor = GetScaleFactor(screenSize);
            var basePadding = 10.0;
            
            if (element is Control control)
            {
                control.Padding = new Thickness(basePadding * scaleFactor);
            }
        }

        private static void ApplyResponsiveMargins(FrameworkElement element, ScreenSize screenSize)
        {
            var scaleFactor = GetScaleFactor(screenSize);
            var baseMargin = 5.0;
            
            element.Margin = new Thickness(baseMargin * scaleFactor);
        }

        private static void ApplyResponsiveFontSizes(FrameworkElement element, ScreenSize screenSize)
        {
            var scaleFactor = GetFontScaleFactor(screenSize);
            
            if (element is Control control)
            {
                var currentFontSize = control.FontSize;
                if (double.IsNaN(currentFontSize) || currentFontSize == 0)
                {
                    currentFontSize = SystemFonts.MessageFontSize;
                }
                
                control.FontSize = currentFontSize * scaleFactor;
            }
        }

        private static void ApplyResponsiveGridLayout(Grid grid, ScreenSize screenSize)
        {
            // Adjust column widths based on screen size
            foreach (var columnDef in grid.ColumnDefinitions)
            {
                if (screenSize == ScreenSize.Small)
                {
                    // Stack columns on small screens
                    if (columnDef.Width.IsAbsolute && columnDef.Width.Value > 200)
                    {
                        columnDef.Width = new GridLength(1, GridUnitType.Star);
                    }
                }
            }
        }

        private static void ApplyResponsiveDataGridLayout(DataGrid dataGrid, ScreenSize screenSize)
        {
            switch (screenSize)
            {
                case ScreenSize.Small:
                    // Hide less important columns on small screens
                    HideOptionalColumns(dataGrid);
                    dataGrid.ColumnWidth = new DataGridLength(1, DataGridLengthUnitType.Star);
                    break;

                case ScreenSize.Medium:
                    // Show essential columns
                    ShowEssentialColumns(dataGrid);
                    break;

                case ScreenSize.Large:
                    // Show all columns
                    ShowAllColumns(dataGrid);
                    break;
            }
        }

        private static void ApplyResponsiveItemsLayout(ItemsControl itemsControl, ScreenSize screenSize)
        {
            if (itemsControl.ItemsPanel != null)
            {
                // Adjust item panel based on screen size
                var panelTemplate = itemsControl.ItemsPanel;
                
                // This could be extended to change panel types based on screen size
                // For example, switching from WrapPanel to StackPanel on small screens
            }
        }

        private static void ApplyAdaptiveColumns(FrameworkElement element, ScreenSize screenSize)
        {
            var columnCount = GetOptimalColumnCount(screenSize);
            
            if (element is UniformGrid uniformGrid)
            {
                uniformGrid.Columns = columnCount;
            }
            else if (element is WrapPanel wrapPanel)
            {
                // Adjust item width to achieve desired column count
                var availableWidth = element.ActualWidth;
                var itemWidth = availableWidth / columnCount - 20; // Account for margins
                
                foreach (FrameworkElement child in wrapPanel.Children)
                {
                    child.Width = Math.Max(itemWidth, 100); // Minimum width
                }
            }
        }

        private static void HideOptionalColumns(DataGrid dataGrid)
        {
            foreach (var column in dataGrid.Columns)
            {
                // Hide columns based on priority (you might want to use attached properties for this)
                if (column.Header?.ToString()?.Contains("Detail") == true ||
                    column.Header?.ToString()?.Contains("Description") == true)
                {
                    column.Visibility = Visibility.Collapsed;
                }
            }
        }

        private static void ShowEssentialColumns(DataGrid dataGrid)
        {
            foreach (var column in dataGrid.Columns)
            {
                if (column.Header?.ToString()?.Contains("Name") == true ||
                    column.Header?.ToString()?.Contains("Status") == true ||
                    column.Header?.ToString()?.Contains("Type") == true)
                {
                    column.Visibility = Visibility.Visible;
                }
            }
        }

        private static void ShowAllColumns(DataGrid dataGrid)
        {
            foreach (var column in dataGrid.Columns)
            {
                column.Visibility = Visibility.Visible;
            }
        }

        private static double GetScaleFactor(ScreenSize screenSize)
        {
            return screenSize switch
            {
                ScreenSize.Small => 0.8,
                ScreenSize.Medium => 0.9,
                ScreenSize.Large => 1.0,
                _ => 1.0
            };
        }

        private static double GetFontScaleFactor(ScreenSize screenSize)
        {
            return screenSize switch
            {
                ScreenSize.Small => 0.9,
                ScreenSize.Medium => 0.95,
                ScreenSize.Large => 1.0,
                _ => 1.0
            };
        }

        private static int GetOptimalColumnCount(ScreenSize screenSize)
        {
            return screenSize switch
            {
                ScreenSize.Small => 1,
                ScreenSize.Medium => 2,
                ScreenSize.Large => 3,
                _ => 3
            };
        }

        #endregion
    }

    /// <summary>
    /// Enumeration for screen sizes
    /// </summary>
    public enum ScreenSize
    {
        Small,
        Medium,
        Large
    }
}