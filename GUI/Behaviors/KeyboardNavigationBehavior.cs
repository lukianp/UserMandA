using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Media;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Behavior that provides enhanced keyboard navigation for better accessibility and performance
    /// </summary>
    public static class KeyboardNavigationBehavior
    {
        #region EnableEnhancedNavigation Attached Property

        public static readonly DependencyProperty EnableEnhancedNavigationProperty =
            DependencyProperty.RegisterAttached(
                "EnableEnhancedNavigation",
                typeof(bool),
                typeof(KeyboardNavigationBehavior),
                new PropertyMetadata(false, OnEnableEnhancedNavigationChanged));

        public static bool GetEnableEnhancedNavigation(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableEnhancedNavigationProperty);
        }

        public static void SetEnableEnhancedNavigation(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableEnhancedNavigationProperty, value);
        }

        private static void OnEnableEnhancedNavigationChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FrameworkElement element)
            {
                if ((bool)e.NewValue)
                {
                    AttachKeyboardNavigation(element);
                }
                else
                {
                    DetachKeyboardNavigation(element);
                }
            }
        }

        #endregion

        #region NavigationAcceleration Attached Property

        public static readonly DependencyProperty NavigationAccelerationProperty =
            DependencyProperty.RegisterAttached(
                "NavigationAcceleration",
                typeof(double),
                typeof(KeyboardNavigationBehavior),
                new PropertyMetadata(1.0));

        public static double GetNavigationAcceleration(DependencyObject obj)
        {
            return (double)obj.GetValue(NavigationAccelerationProperty);
        }

        public static void SetNavigationAcceleration(DependencyObject obj, double value)
        {
            obj.SetValue(NavigationAccelerationProperty, value);
        }

        #endregion

        #region EnableVirtualizedNavigation Attached Property

        public static readonly DependencyProperty EnableVirtualizedNavigationProperty =
            DependencyProperty.RegisterAttached(
                "EnableVirtualizedNavigation",
                typeof(bool),
                typeof(KeyboardNavigationBehavior),
                new PropertyMetadata(false, OnEnableVirtualizedNavigationChanged));

        public static bool GetEnableVirtualizedNavigation(DependencyObject obj)
        {
            return (bool)obj.GetValue(EnableVirtualizedNavigationProperty);
        }

        public static void SetEnableVirtualizedNavigation(DependencyObject obj, bool value)
        {
            obj.SetValue(EnableVirtualizedNavigationProperty, value);
        }

        private static void OnEnableVirtualizedNavigationChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ItemsControl itemsControl && (bool)e.NewValue)
            {
                AttachVirtualizedNavigation(itemsControl);
            }
        }

        #endregion

        #region Private Methods

        private static void AttachKeyboardNavigation(FrameworkElement element)
        {
            element.KeyDown += OnKeyDown;
            element.PreviewKeyDown += OnPreviewKeyDown;
        }

        private static void DetachKeyboardNavigation(FrameworkElement element)
        {
            element.KeyDown -= OnKeyDown;
            element.PreviewKeyDown -= OnPreviewKeyDown;
        }

        private static void AttachVirtualizedNavigation(ItemsControl itemsControl)
        {
            itemsControl.KeyDown += OnVirtualizedKeyDown;
        }

        private static void OnPreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                // Handle common navigation shortcuts
                switch (e.Key)
                {
                    case Key.F3:
                        // Quick search functionality
                        HandleQuickSearch(element);
                        e.Handled = true;
                        break;

                    case Key.Escape:
                        // Clear focus or close dialogs
                        HandleEscape(element);
                        e.Handled = true;
                        break;

                    case Key.Enter:
                        // Activate focused element
                        if (Keyboard.Modifiers == ModifierKeys.Control)
                        {
                            HandleControlEnter(element);
                            e.Handled = true;
                        }
                        break;
                }
            }
        }

        private static void OnKeyDown(object sender, KeyEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                var acceleration = GetNavigationAcceleration(element);

                switch (e.Key)
                {
                    case Key.PageUp:
                    case Key.PageDown:
                        HandlePageNavigation(element, e.Key == Key.PageDown, acceleration);
                        e.Handled = true;
                        break;

                    case Key.Home:
                    case Key.End:
                        if (Keyboard.Modifiers == ModifierKeys.Control)
                        {
                            HandleDocumentNavigation(element, e.Key == Key.End);
                            e.Handled = true;
                        }
                        break;

                    case Key.Tab:
                        // Enhanced tab navigation
                        if (Keyboard.Modifiers == ModifierKeys.Control)
                        {
                            HandleSmartTabNavigation(element, Keyboard.Modifiers.HasFlag(ModifierKeys.Shift));
                            e.Handled = true;
                        }
                        break;
                }
            }
        }

        private static void OnVirtualizedKeyDown(object sender, KeyEventArgs e)
        {
            if (sender is ItemsControl itemsControl)
            {
                switch (e.Key)
                {
                    case Key.Up:
                    case Key.Down:
                    case Key.Left:
                    case Key.Right:
                        HandleVirtualizedNavigation(itemsControl, e.Key);
                        e.Handled = true;
                        break;

                    case Key.PageUp:
                    case Key.PageDown:
                        HandleVirtualizedPageNavigation(itemsControl, e.Key == Key.PageDown);
                        e.Handled = true;
                        break;
                }
            }
        }

        private static void HandleQuickSearch(FrameworkElement element)
        {
            // Find search textbox in the visual tree
            var searchBox = FindChildByName<TextBox>(element, "SearchTextBox") ??
                           FindChildByType<TextBox>(element);

            if (searchBox != null)
            {
                searchBox.Focus();
                searchBox.SelectAll();
            }
        }

        private static void HandleEscape(FrameworkElement element)
        {
            // Clear selection or focus
            if (element is Selector selector)
            {
                selector.SelectedItem = null;
            }
            else if (element is TextBox textBox)
            {
                textBox.Clear();
            }
            else
            {
                // Try to focus parent container
                var parent = element.Parent as FrameworkElement;
                parent?.Focus();
            }
        }

        private static void HandleControlEnter(FrameworkElement element)
        {
            // Execute default action
            if (element is Button button)
            {
                button.Command?.Execute(button.CommandParameter);
            }
            else if (element is ListBoxItem listBoxItem)
            {
                // Double-click behavior
                var mouseEventArgs = new MouseButtonEventArgs(Mouse.PrimaryDevice, 0, MouseButton.Left)
                {
                    RoutedEvent = Control.MouseDoubleClickEvent
                };
                listBoxItem.RaiseEvent(mouseEventArgs);
            }
        }

        private static void HandlePageNavigation(FrameworkElement element, bool pageDown, double acceleration)
        {
            if (element is ScrollViewer scrollViewer)
            {
                var delta = scrollViewer.ViewportHeight * acceleration;
                if (pageDown)
                {
                    scrollViewer.ScrollToVerticalOffset(scrollViewer.VerticalOffset + delta);
                }
                else
                {
                    scrollViewer.ScrollToVerticalOffset(scrollViewer.VerticalOffset - delta);
                }
            }
            else
            {
                // Find parent scroll viewer
                var parentScrollViewer = FindParentByType<ScrollViewer>(element);
                if (parentScrollViewer != null)
                {
                    HandlePageNavigation(parentScrollViewer, pageDown, acceleration);
                }
            }
        }

        private static void HandleDocumentNavigation(FrameworkElement element, bool toEnd)
        {
            if (element is ScrollViewer scrollViewer)
            {
                if (toEnd)
                {
                    scrollViewer.ScrollToEnd();
                }
                else
                {
                    scrollViewer.ScrollToHome();
                }
            }
            else
            {
                var parentScrollViewer = FindParentByType<ScrollViewer>(element);
                if (parentScrollViewer != null)
                {
                    HandleDocumentNavigation(parentScrollViewer, toEnd);
                }
            }
        }

        private static void HandleSmartTabNavigation(FrameworkElement element, bool reverse)
        {
            // Find all focusable elements in logical order
            var focusableElements = GetFocusableChildren(element).ToList();
            var currentIndex = focusableElements.IndexOf(element);

            if (currentIndex >= 0)
            {
                var nextIndex = reverse 
                    ? (currentIndex - 1 + focusableElements.Count) % focusableElements.Count
                    : (currentIndex + 1) % focusableElements.Count;

                focusableElements[nextIndex].Focus();
            }
        }

        private static void HandleVirtualizedNavigation(ItemsControl itemsControl, Key key)
        {
            if (itemsControl is Selector selector)
            {
                if (selector.SelectedItem == null) return;

                var currentIndex = selector.SelectedIndex;
                var newIndex = currentIndex;

                switch (key)
                {
                    case Key.Up:
                        newIndex = Math.Max(0, currentIndex - 1);
                        break;
                    case Key.Down:
                        newIndex = Math.Min(itemsControl.Items.Count - 1, currentIndex + 1);
                        break;
                    case Key.Left:
                        newIndex = Math.Max(0, currentIndex - 10);
                        break;
                    case Key.Right:
                        newIndex = Math.Min(itemsControl.Items.Count - 1, currentIndex + 10);
                        break;
                }

                if (newIndex != currentIndex)
                {
                    selector.SelectedIndex = newIndex;
                    if (itemsControl is ListBox listBox)
                    {
                        listBox.ScrollIntoView(selector.SelectedItem);
                    }
                }
            }
        }

        private static void HandleVirtualizedPageNavigation(ItemsControl itemsControl, bool pageDown)
        {
            if (itemsControl is Selector selector)
            {
                var currentIndex = selector.SelectedIndex;
                var pageSize = 20; // Configurable page size

                var newIndex = pageDown
                    ? Math.Min(itemsControl.Items.Count - 1, currentIndex + pageSize)
                    : Math.Max(0, currentIndex - pageSize);

                selector.SelectedIndex = newIndex;
                if (itemsControl is ListBox listBox)
                {
                    listBox.ScrollIntoView(selector.SelectedItem);
                }
            }
        }

        private static T FindChildByName<T>(DependencyObject parent, string name) where T : FrameworkElement
        {
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                
                if (child is T element && element.Name == name)
                {
                    return element;
                }

                var result = FindChildByName<T>(child, name);
                if (result != null)
                {
                    return result;
                }
            }
            return null;
        }

        private static T FindChildByType<T>(DependencyObject parent) where T : DependencyObject
        {
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                
                if (child is T element)
                {
                    return element;
                }

                var result = FindChildByType<T>(child);
                if (result != null)
                {
                    return result;
                }
            }
            return null;
        }

        private static T FindParentByType<T>(DependencyObject child) where T : DependencyObject
        {
            var parent = VisualTreeHelper.GetParent(child);
            
            if (parent == null)
                return null;
            
            if (parent is T parentT)
                return parentT;
            
            return FindParentByType<T>(parent);
        }

        private static System.Collections.Generic.IEnumerable<FrameworkElement> GetFocusableChildren(DependencyObject parent)
        {
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                
                if (child is FrameworkElement element && element.Focusable && element.IsEnabled)
                {
                    yield return element;
                }

                foreach (var grandChild in GetFocusableChildren(child))
                {
                    yield return grandChild;
                }
            }
        }

        #endregion
    }
}