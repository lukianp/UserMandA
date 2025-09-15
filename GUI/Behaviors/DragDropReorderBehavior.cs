using System;
using System.Collections;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Attached behavior to enable drag-and-drop reordering on ItemsControl (e.g., ListBox, ListView).
    /// Keeps logic out of code-behind and aligned with MVVM.
    /// </summary>
    public static class DragDropReorderBehavior
    {
        #region Attached properties

        public static readonly DependencyProperty IsEnabledProperty = DependencyProperty.RegisterAttached(
            "IsEnabled",
            typeof(bool),
            typeof(DragDropReorderBehavior),
            new PropertyMetadata(false, OnIsEnabledChanged));

        public static void SetIsEnabled(DependencyObject element, bool value) => element.SetValue(IsEnabledProperty, value);
        public static bool GetIsEnabled(DependencyObject element) => (bool)element.GetValue(IsEnabledProperty);

        public static readonly DependencyProperty AllowReorderProperty = DependencyProperty.RegisterAttached(
            "AllowReorder",
            typeof(bool),
            typeof(DragDropReorderBehavior),
            new PropertyMetadata(true));

        public static void SetAllowReorder(DependencyObject element, bool value) => element.SetValue(AllowReorderProperty, value);
        public static bool GetAllowReorder(DependencyObject element) => (bool)element.GetValue(AllowReorderProperty);

        public static readonly DependencyProperty ReorderCommandProperty = DependencyProperty.RegisterAttached(
            "ReorderCommand",
            typeof(ICommand),
            typeof(DragDropReorderBehavior),
            new PropertyMetadata(null));

        public static void SetReorderCommand(DependencyObject element, ICommand value) => element.SetValue(ReorderCommandProperty, value);
        public static ICommand GetReorderCommand(DependencyObject element) => (ICommand)element.GetValue(ReorderCommandProperty);

        // Internal state per control
        private static readonly DependencyProperty DragStateProperty = DependencyProperty.RegisterAttached(
            "DragState",
            typeof(DragState),
            typeof(DragDropReorderBehavior),
            new PropertyMetadata(null));

        private static void SetDragState(DependencyObject element, DragState value) => element.SetValue(DragStateProperty, value);
        private static DragState GetDragState(DependencyObject element) => (DragState)element.GetValue(DragStateProperty);

        #endregion

        #region Event wiring

        private static void OnIsEnabledChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is not ItemsControl itemsControl)
                return;

            if ((bool)e.NewValue)
            {
                AttachHandlers(itemsControl);
            }
            else
            {
                DetachHandlers(itemsControl);
            }
        }

        private static void AttachHandlers(ItemsControl items)
        {
            DetachHandlers(items);
            items.PreviewMouseLeftButtonDown += OnPreviewMouseLeftButtonDown;
            items.PreviewMouseMove += OnPreviewMouseMove;
            items.PreviewMouseLeftButtonUp += OnPreviewMouseLeftButtonUp;
            items.AllowDrop = true;
            items.DragOver += OnDragOver;
            items.Drop += OnDrop;
            SetDragState(items, new DragState());
        }

        private static void DetachHandlers(ItemsControl items)
        {
            items.PreviewMouseLeftButtonDown -= OnPreviewMouseLeftButtonDown;
            items.PreviewMouseMove -= OnPreviewMouseMove;
            items.PreviewMouseLeftButtonUp -= OnPreviewMouseLeftButtonUp;
            items.DragOver -= OnDragOver;
            items.Drop -= OnDrop;
            SetDragState(items, null);
        }

        #endregion

        #region Event handlers

        private static void OnPreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is not ItemsControl items) return;
            if (!GetAllowReorder(items)) return;

            var state = GetDragState(items) ?? new DragState();
            state.StartPoint = e.GetPosition(items);
            state.DraggedContainer = GetItemContainerAtPoint(items, state.StartPoint);
            state.IsDragging = false;
            SetDragState(items, state);
        }

        private static void OnPreviewMouseMove(object sender, MouseEventArgs e)
        {
            if (sender is not ItemsControl items) return;
            if (!GetAllowReorder(items)) return;

            var state = GetDragState(items);
            if (state == null || state.DraggedContainer == null || state.IsDragging)
                return;

            var current = e.GetPosition(items);
            var delta = current - state.StartPoint;
            if (Math.Abs(delta.X) > SystemParameters.MinimumHorizontalDragDistance ||
                Math.Abs(delta.Y) > SystemParameters.MinimumVerticalDragDistance)
            {
                // Start drag
                state.IsDragging = true;
                try
                {
                    var data = new DataObject(typeof(object), state.DraggedContainer.DataContext);
                    DragDrop.DoDragDrop(items, data, DragDropEffects.Move);
                }
                catch { /* ignore */ }
            }
        }

        private static void OnPreviewMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (sender is not ItemsControl items) return;
            var state = GetDragState(items);
            if (state == null) return;
            state.IsDragging = false;
            state.DraggedContainer = null;
        }

        private static void OnDragOver(object sender, DragEventArgs e)
        {
            if (sender is not ItemsControl items) return;
            e.Effects = GetAllowReorder(items) ? DragDropEffects.Move : DragDropEffects.None;
            e.Handled = true;
        }

        private static void OnDrop(object sender, DragEventArgs e)
        {
            if (sender is not ItemsControl items) return;
            if (!GetAllowReorder(items)) return;

            var state = GetDragState(items);
            if (state == null || state.DraggedContainer == null)
                return;

            var sourceIndex = items.ItemContainerGenerator.IndexFromContainer(state.DraggedContainer);
            if (sourceIndex < 0) return;

            var dropPoint = e.GetPosition(items);
            var targetIndex = GetInsertionIndex(items, dropPoint);

            if (targetIndex == sourceIndex || sourceIndex < 0 || targetIndex < 0)
                return;

            Move(items, sourceIndex, targetIndex);

            var command = GetReorderCommand(items);
            if (command != null && command.CanExecute(null))
            {
                command.Execute(new { OldIndex = sourceIndex, NewIndex = targetIndex });
            }

            state.IsDragging = false;
            state.DraggedContainer = null;
        }

        #endregion

        #region Core helpers

        private static void Move(ItemsControl items, int fromIndex, int toIndex)
        {
            try
            {
                if (items.ItemsSource is IList list)
                {
                    if (fromIndex < 0 || fromIndex >= list.Count) return;

                    var item = list[fromIndex];
                    list.RemoveAt(fromIndex);
                    if (toIndex > fromIndex) toIndex--; // Adjust for removal
                    if (toIndex < 0) toIndex = 0;
                    if (toIndex > list.Count) toIndex = list.Count;
                    list.Insert(toIndex, item);
                }
                else
                {
                    // Fallback to Items collection (less MVVM-friendly)
                    if (fromIndex < 0 || fromIndex >= items.Items.Count) return;
                    var item = items.Items[fromIndex];
                    items.Items.RemoveAt(fromIndex);
                    if (toIndex > fromIndex) toIndex--;
                    if (toIndex < 0) toIndex = 0;
                    if (toIndex > items.Items.Count) toIndex = items.Items.Count;
                    items.Items.Insert(toIndex, item);
                }
            }
            catch
            {
                // swallow: behavior should not crash UI
            }
        }

        private static int GetInsertionIndex(ItemsControl items, Point point)
        {
            for (int i = 0; i < items.Items.Count; i++)
            {
                if (items.ItemContainerGenerator.ContainerFromIndex(i) is not FrameworkElement container)
                    continue;
                var bounds = container.TransformToAncestor((Visual)items).TransformBounds(new Rect(container.RenderSize));
                if (point.Y < bounds.Top + bounds.Height / 2)
                    return i;
            }
            return items.Items.Count;
        }

        private static FrameworkElement GetItemContainerAtPoint(ItemsControl items, Point point)
        {
            var element = items.InputHitTest(point) as DependencyObject;
            while (element != null)
            {
                if (element is FrameworkElement fe && items.ItemContainerGenerator.IndexFromContainer(fe) >= 0)
                    return fe;
                element = VisualTreeHelper.GetParent(element);
            }
            return null;
        }

        private sealed class DragState
        {
            public Point StartPoint { get; set; }
            public bool IsDragging { get; set; }
            public FrameworkElement DraggedContainer { get; set; }
        }

        #endregion
    }
}