using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Microsoft.Xaml.Behaviors;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Behavior that automatically adds context menus to UI elements based on their data context
    /// </summary>
    public class ContextMenuBehavior : Behavior<FrameworkElement>
    {
        public static readonly DependencyProperty ContextMenuServiceProperty =
            DependencyProperty.Register(nameof(ContextMenuService), typeof(Services.ContextMenuService), typeof(ContextMenuBehavior));

        public static readonly DependencyProperty DataContextProperty =
            DependencyProperty.Register(nameof(DataContext), typeof(object), typeof(ContextMenuBehavior));

        public static readonly DependencyProperty IsEnabledProperty =
            DependencyProperty.Register(nameof(IsEnabled), typeof(bool), typeof(ContextMenuBehavior), new PropertyMetadata(true));

        public Services.ContextMenuService ContextMenuService
        {
            get => (Services.ContextMenuService)GetValue(ContextMenuServiceProperty);
            set => SetValue(ContextMenuServiceProperty, value);
        }

        public object DataContext
        {
            get => GetValue(DataContextProperty);
            set => SetValue(DataContextProperty, value);
        }

        public bool IsEnabled
        {
            get => (bool)GetValue(IsEnabledProperty);
            set => SetValue(IsEnabledProperty, value);
        }

        protected override void OnAttached()
        {
            base.OnAttached();
            AssociatedObject.MouseRightButtonUp += OnMouseRightButtonUp;
            AssociatedObject.DataContextChanged += OnDataContextChanged;
        }

        protected override void OnDetaching()
        {
            if (AssociatedObject != null)
            {
                AssociatedObject.MouseRightButtonUp -= OnMouseRightButtonUp;
                AssociatedObject.DataContextChanged -= OnDataContextChanged;
            }
            base.OnDetaching();
        }

        private void OnDataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            // Update our DataContext property when the associated object's DataContext changes
            DataContext = e.NewValue;
        }

        private void OnMouseRightButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (!IsEnabled || ContextMenuService == null)
                return;

            var data = DataContext ?? AssociatedObject.DataContext;
            if (data == null)
                return;

            var position = e.GetPosition(AssociatedObject);
            var contextMenu = ContextMenuService.CreateContextMenu(data, position);
            
            if (contextMenu != null)
            {
                // Remove any existing context menu
                AssociatedObject.ContextMenu = null;
                
                // Set the new context menu
                AssociatedObject.ContextMenu = contextMenu;
                
                // Open the context menu
                contextMenu.IsOpen = true;
            }

            e.Handled = true;
        }
    }

    /// <summary>
    /// Attached property for easily adding context menu behavior to any FrameworkElement
    /// </summary>
    public static class ContextMenuAttachedBehavior
    {
        public static readonly DependencyProperty EnableContextMenuProperty =
            DependencyProperty.RegisterAttached("EnableContextMenu", typeof(bool), typeof(ContextMenuAttachedBehavior),
                new PropertyMetadata(false, OnEnableContextMenuChanged));

        public static readonly DependencyProperty ContextMenuServiceProperty =
            DependencyProperty.RegisterAttached("ContextMenuService", typeof(Services.ContextMenuService), typeof(ContextMenuAttachedBehavior));

        public static bool GetEnableContextMenu(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableContextMenuProperty);
        }

        public static void SetEnableContextMenu(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableContextMenuProperty, value);
        }

        public static Services.ContextMenuService GetContextMenuService(DependencyObject obj)
        {
            return (Services.ContextMenuService)obj.GetValue(ContextMenuServiceProperty);
        }

        public static void SetContextMenuService(DependencyObject obj, Services.ContextMenuService value)
        {
            obj.SetValue(ContextMenuServiceProperty, value);
        }

        private static void OnEnableContextMenuChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is not FrameworkElement element)
                return;

            var enable = (bool)e.NewValue;

            if (enable)
            {
                element.MouseRightButtonUp += OnElementMouseRightButtonUp;
            }
            else
            {
                element.MouseRightButtonUp -= OnElementMouseRightButtonUp;
            }
        }

        private static void OnElementMouseRightButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (sender is not FrameworkElement element)
                return;

            var contextMenuService = GetContextMenuService(element);
            if (contextMenuService == null)
                return;

            var data = element.DataContext;
            if (data == null)
                return;

            var position = e.GetPosition(element);
            contextMenuService.ShowContextMenu(data, element, position);
            
            e.Handled = true;
        }
    }
}