using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Visual indicator for sort order in data grids and lists
    /// </summary>
    public partial class SortIndicator : UserControl
    {
        public static readonly DependencyProperty SortDirectionProperty =
            DependencyProperty.Register(nameof(SortDirection), typeof(SortDirection), typeof(SortIndicator),
                new PropertyMetadata(SortDirection.None, OnSortDirectionChanged));

        public static readonly DependencyProperty SortOrderProperty =
            DependencyProperty.Register(nameof(SortOrder), typeof(int), typeof(SortIndicator),
                new PropertyMetadata(0));

        public static readonly DependencyProperty ShowSortOrderProperty =
            DependencyProperty.Register(nameof(ShowSortOrder), typeof(bool), typeof(SortIndicator),
                new PropertyMetadata(false));

        public static readonly DependencyProperty SortColorProperty =
            DependencyProperty.Register(nameof(SortColor), typeof(Brush), typeof(SortIndicator),
                new PropertyMetadata(new SolidColorBrush(Color.FromRgb(33, 150, 243))));

        public static readonly DependencyProperty IsAscendingProperty =
            DependencyProperty.Register(nameof(IsAscending), typeof(bool), typeof(SortIndicator),
                new PropertyMetadata(false));

        public static readonly DependencyProperty IsDescendingProperty =
            DependencyProperty.Register(nameof(IsDescending), typeof(bool), typeof(SortIndicator),
                new PropertyMetadata(false));

        public static readonly DependencyProperty IsUnsortedProperty =
            DependencyProperty.Register(nameof(IsUnsorted), typeof(bool), typeof(SortIndicator),
                new PropertyMetadata(true));

        public SortIndicator()
        {
            InitializeComponent();
        }

        /// <summary>
        /// Gets or sets the sort direction
        /// </summary>
        public SortDirection SortDirection
        {
            get => (SortDirection)GetValue(SortDirectionProperty);
            set => SetValue(SortDirectionProperty, value);
        }

        /// <summary>
        /// Gets or sets the sort order (for multi-column sorting)
        /// </summary>
        public int SortOrder
        {
            get => (int)GetValue(SortOrderProperty);
            set => SetValue(SortOrderProperty, value);
        }

        /// <summary>
        /// Gets or sets whether to show the sort order number
        /// </summary>
        public bool ShowSortOrder
        {
            get => (bool)GetValue(ShowSortOrderProperty);
            set => SetValue(ShowSortOrderProperty, value);
        }

        /// <summary>
        /// Gets or sets the color of the sort indicator
        /// </summary>
        public Brush SortColor
        {
            get => (Brush)GetValue(SortColorProperty);
            set => SetValue(SortColorProperty, value);
        }

        /// <summary>
        /// Gets whether the sort direction is ascending
        /// </summary>
        public bool IsAscending
        {
            get => (bool)GetValue(IsAscendingProperty);
            private set => SetValue(IsAscendingProperty, value);
        }

        /// <summary>
        /// Gets whether the sort direction is descending
        /// </summary>
        public bool IsDescending
        {
            get => (bool)GetValue(IsDescendingProperty);
            private set => SetValue(IsDescendingProperty, value);
        }

        /// <summary>
        /// Gets whether the column is unsorted
        /// </summary>
        public bool IsUnsorted
        {
            get => (bool)GetValue(IsUnsortedProperty);
            private set => SetValue(IsUnsortedProperty, value);
        }

        /// <summary>
        /// Event raised when sort direction changes
        /// </summary>
        public event EventHandler<SortDirectionChangedEventArgs> SortDirectionChanged;

        /// <summary>
        /// Cycles to the next sort direction
        /// </summary>
        public void CycleSort()
        {
            var newDirection = SortDirection switch
            {
                SortDirection.None => SortDirection.Ascending,
                SortDirection.Ascending => SortDirection.Descending,
                SortDirection.Descending => SortDirection.None,
                _ => SortDirection.Ascending
            };

            SortDirection = newDirection;
        }

        /// <summary>
        /// Sets the sort priority color
        /// </summary>
        public void SetSortPriority(SortPriority priority)
        {
            SortColor = priority switch
            {
                SortPriority.Primary => new SolidColorBrush(Color.FromRgb(33, 150, 243)),
                SortPriority.Secondary => new SolidColorBrush(Color.FromRgb(76, 175, 80)),
                SortPriority.Tertiary => new SolidColorBrush(Color.FromRgb(255, 152, 0)),
                SortPriority.Low => new SolidColorBrush(Color.FromRgb(158, 158, 158)),
                _ => new SolidColorBrush(Color.FromRgb(33, 150, 243))
            };
        }

        private static void OnSortDirectionChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is SortIndicator indicator)
            {
                var direction = (SortDirection)e.NewValue;
                
                indicator.IsAscending = direction == SortDirection.Ascending;
                indicator.IsDescending = direction == SortDirection.Descending;
                indicator.IsUnsorted = direction == SortDirection.None;

                indicator.SortDirectionChanged?.Invoke(indicator, 
                    new SortDirectionChangedEventArgs((SortDirection)e.OldValue, direction));
            }
        }
    }

    /// <summary>
    /// Sort direction enumeration
    /// </summary>
    public enum SortDirection
    {
        None,
        Ascending,
        Descending
    }

    /// <summary>
    /// Sort priority for color coding
    /// </summary>
    public enum SortPriority
    {
        Primary,
        Secondary,
        Tertiary,
        Low
    }

    /// <summary>
    /// Event args for sort direction changes
    /// </summary>
    public class SortDirectionChangedEventArgs : EventArgs
    {
        public SortDirection OldDirection { get; }
        public SortDirection NewDirection { get; }

        public SortDirectionChangedEventArgs(SortDirection oldDirection, SortDirection newDirection)
        {
            OldDirection = oldDirection;
            NewDirection = newDirection;
        }
    }
}