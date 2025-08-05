using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for CustomizableDashboard.xaml
    /// </summary>
    public partial class CustomizableDashboard : UserControl
    {
        private CustomizableDashboardViewModel _viewModel;
        private bool _isDragging = false;
        private object _draggedWidget = null;

        public CustomizableDashboard()
        {
            InitializeComponent();
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            _viewModel = DataContext as CustomizableDashboardViewModel;
        }

        private void PaletteWidget_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && element.DataContext is WidgetDefinition widgetDef)
            {
                _isDragging = true;
                _draggedWidget = widgetDef;
                
                var data = new DataObject("WidgetDefinition", widgetDef);
                DragDrop.DoDragDrop(element, data, DragDropEffects.Copy);
                
                _isDragging = false;
                _draggedWidget = null;
            }
        }

        private void DashboardGrid_DragOver(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent("WidgetDefinition"))
            {
                e.Effects = DragDropEffects.Copy;
                
                // Show drop zones
                _viewModel?.ShowDropZones(true);
            }
            else
            {
                e.Effects = DragDropEffects.None;
            }
            
            e.Handled = true;
        }

        private void DashboardGrid_Drop(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent("WidgetDefinition"))
            {
                var widgetDef = e.Data.GetData("WidgetDefinition") as WidgetDefinition;
                var position = e.GetPosition(DashboardGrid);
                
                // Calculate grid position based on drop location
                var cellWidth = DashboardGrid.ActualWidth / 4;
                var cellHeight = DashboardGrid.ActualHeight / 4;
                
                int column = (int)(position.X / cellWidth);
                int row = (int)(position.Y / cellHeight);
                
                // Ensure within bounds
                column = Math.Max(0, Math.Min(3, column));
                row = Math.Max(0, Math.Min(3, row));
                
                _viewModel?.AddWidget(widgetDef, row, column);
            }
            
            // Hide drop zones
            _viewModel?.ShowDropZones(false);
            e.Handled = true;
        }

        private void Widget_DragOver(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent("WidgetDefinition"))
            {
                e.Effects = DragDropEffects.Copy;
            }
            else
            {
                e.Effects = DragDropEffects.None;
            }
            
            e.Handled = true;
        }

        private void Widget_Drop(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent("WidgetDefinition") && sender is FrameworkElement element)
            {
                var widgetDef = e.Data.GetData("WidgetDefinition") as WidgetDefinition;
                var targetWidget = element.DataContext as DashboardWidget;
                
                if (targetWidget != null)
                {
                    // Replace the target widget
                    _viewModel?.ReplaceWidget(targetWidget, widgetDef);
                }
            }
            
            e.Handled = true;
        }
    }
}