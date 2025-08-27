using System;
using System.Collections;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// ListBox with built-in drag and drop reordering capabilities
    /// </summary>
    public partial class DragDropListBox : ListBox, INotifyPropertyChanged
    {
        private Point _startPoint;
        private bool _isDragging;
        private ListBoxItem _draggedItem;
        private int _insertionIndex = -1;

        public DragDropListBox()
        {
            InitializeComponent();
            AllowDrop = true;
            
            // Enable drag-drop feedback
            DragDropFeedbackService.Instance.SetupDropZone(this, new DropZoneOptions
            {
                ShowDropIndicator = true,
                EnableHapticFeedback = true
            });
        }

        #region Dependency Properties

        public static readonly DependencyProperty AllowReorderProperty =
            DependencyProperty.Register("AllowReorder", typeof(bool), typeof(DragDropListBox),
                new PropertyMetadata(true, OnAllowReorderChanged));

        public static readonly DependencyProperty ShowDragHandleProperty =
            DependencyProperty.Register("ShowDragHandle", typeof(bool), typeof(DragDropListBox),
                new PropertyMetadata(true, OnShowDragHandleChanged));

        public static readonly DependencyProperty DragFeedbackEnabledProperty =
            DependencyProperty.Register("DragFeedbackEnabled", typeof(bool), typeof(DragDropListBox),
                new PropertyMetadata(true));

        public static readonly DependencyProperty ItemReorderedCommandProperty =
            DependencyProperty.Register("ItemReorderedCommand", typeof(ICommand), typeof(DragDropListBox));

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets whether items can be reordered by drag and drop
        /// </summary>
        public bool AllowReorder
        {
            get { return (bool)GetValue(AllowReorderProperty); }
            set { SetValue(AllowReorderProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether drag handles are visible
        /// </summary>
        public bool ShowDragHandle
        {
            get { return (bool)GetValue(ShowDragHandleProperty); }
            set { SetValue(ShowDragHandleProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether visual drag feedback is enabled
        /// </summary>
        public bool DragFeedbackEnabled
        {
            get { return (bool)GetValue(DragFeedbackEnabledProperty); }
            set { SetValue(DragFeedbackEnabledProperty, value); }
        }

        /// <summary>
        /// Gets or sets the command to execute when an item is reordered
        /// </summary>
        public ICommand ItemReorderedCommand
        {
            get { return (ICommand)GetValue(ItemReorderedCommandProperty); }
            set { SetValue(ItemReorderedCommandProperty, value); }
        }

        #endregion

        #region Events

        /// <summary>
        /// Raised when an item is reordered
        /// </summary>
        public event EventHandler<ItemReorderedEventArgs> ItemReordered;

        /// <summary>
        /// Raised when drag operation starts
        /// </summary>
        public event EventHandler<ItemDragStartedEventArgs> ItemDragStarted;

        /// <summary>
        /// Raised when drag operation completes
        /// </summary>
        public event EventHandler<ItemDragCompletedEventArgs> ItemDragCompleted;

        #endregion

        #region Public Methods

        /// <summary>
        /// Moves an item from one index to another
        /// </summary>
        public void MoveItem(int fromIndex, int toIndex)
        {
            if (!AllowReorder || fromIndex == toIndex || fromIndex < 0 || toIndex < 0)
                return;

            if (Items.Count <= Math.Max(fromIndex, toIndex))
                return;

            var item = Items[fromIndex];
            Items.RemoveAt(fromIndex);
            
            // Adjust insertion index if necessary
            if (toIndex > fromIndex)
                toIndex--;
                
            Items.Insert(toIndex, item);

            // Raise events
            var args = new ItemReorderedEventArgs(item, fromIndex, toIndex);
            ItemReordered?.Invoke(this, args);
            ItemReorderedCommand?.Execute(args);
        }

        /// <summary>
        /// Gets the insertion index for a drop operation at the specified point
        /// </summary>
        public int GetInsertionIndex(Point point)
        {
            for (int i = 0; i < Items.Count; i++)
            {
                var container = ItemContainerGenerator.ContainerFromIndex(i) as ListBoxItem;
                if (container != null)
                {
                    var bounds = container.TransformToAncestor(this).TransformBounds(new Rect(container.RenderSize));
                    
                    if (point.Y < bounds.Top + bounds.Height / 2)
                        return i;
                }
            }
            
            return Items.Count;
        }

        #endregion

        #region Protected Methods

        protected override void OnPreviewMouseLeftButtonDown(MouseButtonEventArgs e)
        {
            if (!AllowReorder)
            {
                base.OnPreviewMouseLeftButtonDown(e);
                return;
            }

            _startPoint = e.GetPosition(this);
            _draggedItem = GetListBoxItemUnderPoint(_startPoint);
            
            if (_draggedItem != null)
            {
                // Enable drag feedback
                if (DragFeedbackEnabled)
                {
                    var options = new DragDropOptions
                    {
                        ShowHoverEffect = true,
                        ShowGhost = true,
                        EnableHapticFeedback = true,
                        DragOpacity = 0.7,
                        HoverEffect = HoverEffectType.Glow
                    };
                    
                    DragDropFeedbackService.Instance.EnableDragDropFeedback(_draggedItem, options);
                }
            }
            
            base.OnPreviewMouseLeftButtonDown(e);
        }

        protected override void OnPreviewMouseMove(MouseEventArgs e)
        {
            if (!AllowReorder || _draggedItem == null || _isDragging)
            {
                base.OnPreviewMouseMove(e);
                return;
            }

            var currentPosition = e.GetPosition(this);
            var distance = (currentPosition - _startPoint).Length;

            if (distance > SystemParameters.MinimumHorizontalDragDistance)
            {
                StartDragOperation();
            }

            base.OnPreviewMouseMove(e);
        }

        protected override void OnPreviewMouseLeftButtonUp(MouseButtonEventArgs e)
        {
            if (_isDragging)
            {
                EndDragOperation(false);
            }

            CleanupDragState();
            base.OnPreviewMouseLeftButtonUp(e);
        }

        protected override void OnDragEnter(DragEventArgs e)
        {
            UpdateDropIndicators(e.GetPosition(this));
            base.OnDragEnter(e);
        }

        protected override void OnDragOver(DragEventArgs e)
        {
            e.Effects = AllowReorder ? DragDropEffects.Move : DragDropEffects.None;
            UpdateDropIndicators(e.GetPosition(this));
            base.OnDragOver(e);
        }

        protected override void OnDragLeave(DragEventArgs e)
        {
            ClearDropIndicators();
            base.OnDragLeave(e);
        }

        protected override void OnDrop(DragEventArgs e)
        {
            if (!AllowReorder || _draggedItem == null)
            {
                base.OnDrop(e);
                return;
            }

            var dropPoint = e.GetPosition(this);
            var targetIndex = GetInsertionIndex(dropPoint);
            var sourceIndex = ItemContainerGenerator.IndexFromContainer(_draggedItem);

            if (sourceIndex != -1 && targetIndex != sourceIndex)
            {
                MoveItem(sourceIndex, targetIndex);
                EndDragOperation(true);
            }
            else
            {
                EndDragOperation(false);
            }

            ClearDropIndicators();
            CleanupDragState();
            
            base.OnDrop(e);
        }

        #endregion

        #region Private Methods

        private void StartDragOperation()
        {
            if (_draggedItem == null) return;

            _isDragging = true;
            _draggedItem.Tag = "Dragging";

            // Raise drag started event
            var dragStartedArgs = new ItemDragStartedEventArgs(_draggedItem.Content, 
                ItemContainerGenerator.IndexFromContainer(_draggedItem));
            ItemDragStarted?.Invoke(this, dragStartedArgs);

            // Start drag-drop operation
            var data = new DataObject(typeof(ListBoxItem), _draggedItem);
            
            try
            {
                DragDrop.DoDragDrop(this, data, DragDropEffects.Move);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Drag drop error: {ex.Message}");
            }
        }

        private void EndDragOperation(bool successful)
        {
            if (!_isDragging) return;

            _isDragging = false;
            
            if (_draggedItem != null)
            {
                _draggedItem.Tag = null;
            }

            // Raise drag completed event
            var dragCompletedArgs = new ItemDragCompletedEventArgs(_draggedItem?.Content, 
                _draggedItem != null ? ItemContainerGenerator.IndexFromContainer(_draggedItem) : -1, 
                successful);
            ItemDragCompleted?.Invoke(this, dragCompletedArgs);

            // Show completion animation
            if (successful && _draggedItem != null)
            {
                AnimateItemDrop(_draggedItem);
            }
        }

        private void CleanupDragState()
        {
            if (_draggedItem != null && DragFeedbackEnabled)
            {
                DragDropFeedbackService.Instance.DisableDragDropFeedback(_draggedItem);
            }

            _draggedItem = null;
            _startPoint = default;
            _insertionIndex = -1;
        }

        private void UpdateDropIndicators(Point point)
        {
            ClearDropIndicators();
            
            var targetIndex = GetInsertionIndex(point);
            _insertionIndex = targetIndex;

            // Show drop indicator
            if (targetIndex < Items.Count)
            {
                var container = ItemContainerGenerator.ContainerFromIndex(targetIndex) as ListBoxItem;
                if (container != null)
                {
                    container.Tag = "DropTarget";
                }
            }
            else if (Items.Count > 0)
            {
                // Show indicator at the end
                var lastContainer = ItemContainerGenerator.ContainerFromIndex(Items.Count - 1) as ListBoxItem;
                if (lastContainer != null)
                {
                    lastContainer.Tag = "DropTarget";
                }
            }
        }

        private void ClearDropIndicators()
        {
            for (int i = 0; i < Items.Count; i++)
            {
                var container = ItemContainerGenerator.ContainerFromIndex(i) as ListBoxItem;
                if (container?.Tag?.ToString() == "DropTarget")
                {
                    container.Tag = null;
                }
            }
        }

        private void AnimateItemDrop(ListBoxItem item)
        {
            // Simple scale animation to indicate successful drop
            item.RenderTransform = new System.Windows.Media.ScaleTransform(1.1, 1.1);
            item.RenderTransformOrigin = new Point(0.5, 0.5);

            var animation = new System.Windows.Media.Animation.DoubleAnimation
            {
                From = 1.1,
                To = 1.0,
                Duration = TimeSpan.FromMilliseconds(200),
                EasingFunction = new System.Windows.Media.Animation.BackEase 
                { 
                    EasingMode = System.Windows.Media.Animation.EasingMode.EaseOut 
                }
            };

            var scaleTransform = (System.Windows.Media.ScaleTransform)item.RenderTransform;
            scaleTransform.BeginAnimation(System.Windows.Media.ScaleTransform.ScaleXProperty, animation);
            scaleTransform.BeginAnimation(System.Windows.Media.ScaleTransform.ScaleYProperty, animation);
        }

        private ListBoxItem GetListBoxItemUnderPoint(Point point)
        {
            var element = InputHitTest(point) as DependencyObject;
            
            while (element != null)
            {
                if (element is ListBoxItem listBoxItem)
                    return listBoxItem;
                    
                element = System.Windows.Media.VisualTreeHelper.GetParent(element);
            }
            
            return null;
        }

        #endregion

        #region Event Handlers

        private static void OnAllowReorderChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is DragDropListBox listBox)
            {
                listBox.AllowDrop = (bool)e.NewValue;
            }
        }

        private static void OnShowDragHandleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            // This would be handled in the item template binding
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }

    /// <summary>
    /// Event args for item reordered events
    /// </summary>
    public class ItemReorderedEventArgs : EventArgs
    {
        public object Item { get; }
        public int OldIndex { get; }
        public int NewIndex { get; }

        public ItemReorderedEventArgs(object item, int oldIndex, int newIndex)
        {
            Item = item;
            OldIndex = oldIndex;
            NewIndex = newIndex;
        }
    }

    /// <summary>
    /// Event args for item drag started events
    /// </summary>
    public class ItemDragStartedEventArgs : EventArgs
    {
        public object Item { get; }
        public int Index { get; }

        public ItemDragStartedEventArgs(object item, int index)
        {
            Item = item;
            Index = index;
        }
    }

    /// <summary>
    /// Event args for item drag completed events
    /// </summary>
    public class ItemDragCompletedEventArgs : EventArgs
    {
        public object Item { get; }
        public int Index { get; }
        public bool Successful { get; }

        public ItemDragCompletedEventArgs(object item, int index, bool successful)
        {
            Item = item;
            Index = index;
            Successful = successful;
        }
    }
}