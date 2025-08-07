using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Control for displaying active filter indicators
    /// </summary>
    public partial class FilterIndicator : UserControl
    {
        public static readonly DependencyProperty HasActiveFiltersProperty =
            DependencyProperty.Register(nameof(HasActiveFilters), typeof(bool), typeof(FilterIndicator),
                new PropertyMetadata(false));

        public static readonly DependencyProperty FilterTextProperty =
            DependencyProperty.Register(nameof(FilterText), typeof(string), typeof(FilterIndicator),
                new PropertyMetadata("Filters Active"));

        public static readonly DependencyProperty ActiveFilterCountProperty =
            DependencyProperty.Register(nameof(ActiveFilterCount), typeof(int), typeof(FilterIndicator),
                new PropertyMetadata(0, OnActiveFilterCountChanged));

        public static readonly DependencyProperty ShowCountProperty =
            DependencyProperty.Register(nameof(ShowCount), typeof(bool), typeof(FilterIndicator),
                new PropertyMetadata(true));

        public static readonly DependencyProperty ShowClearButtonProperty =
            DependencyProperty.Register(nameof(ShowClearButton), typeof(bool), typeof(FilterIndicator),
                new PropertyMetadata(true));

        public static readonly DependencyProperty ActiveFiltersProperty =
            DependencyProperty.Register(nameof(ActiveFilters), typeof(ObservableCollection<FilterInfo>), typeof(FilterIndicator),
                new PropertyMetadata(new ObservableCollection<FilterInfo>()));

        public FilterIndicator()
        {
            InitializeComponent();
            
            // Initialize render transform
            FilterBadge.RenderTransform = new ScaleTransform(1.0, 1.0, 0.5, 0.5);
            
            // Set up event handlers
            FilterBadge.MouseLeftButtonUp += FilterBadge_Click;
            
            // Initialize collections
            ActiveFilters = new ObservableCollection<FilterInfo>();
        }

        /// <summary>
        /// Gets or sets whether there are active filters
        /// </summary>
        public bool HasActiveFilters
        {
            get => (bool)GetValue(HasActiveFiltersProperty);
            set => SetValue(HasActiveFiltersProperty, value);
        }

        /// <summary>
        /// Gets or sets the filter text
        /// </summary>
        public string FilterText
        {
            get => (string)GetValue(FilterTextProperty);
            set => SetValue(FilterTextProperty, value);
        }

        /// <summary>
        /// Gets or sets the active filter count
        /// </summary>
        public int ActiveFilterCount
        {
            get => (int)GetValue(ActiveFilterCountProperty);
            set => SetValue(ActiveFilterCountProperty, value);
        }

        /// <summary>
        /// Gets or sets whether to show the filter count
        /// </summary>
        public bool ShowCount
        {
            get => (bool)GetValue(ShowCountProperty);
            set => SetValue(ShowCountProperty, value);
        }

        /// <summary>
        /// Gets or sets whether to show the clear button
        /// </summary>
        public bool ShowClearButton
        {
            get => (bool)GetValue(ShowClearButtonProperty);
            set => SetValue(ShowClearButtonProperty, value);
        }

        /// <summary>
        /// Gets or sets the active filters collection
        /// </summary>
        public ObservableCollection<FilterInfo> ActiveFilters
        {
            get => (ObservableCollection<FilterInfo>)GetValue(ActiveFiltersProperty);
            set => SetValue(ActiveFiltersProperty, value);
        }

        /// <summary>
        /// Event raised when filters should be cleared
        /// </summary>
        public event EventHandler ClearFiltersRequested;

        /// <summary>
        /// Event raised when a specific filter should be removed
        /// </summary>
        public event EventHandler<FilterRemovedEventArgs> FilterRemovalRequested;

        /// <summary>
        /// Adds a filter to the active filters list
        /// </summary>
        public void AddFilter(string filterType, string filterValue, object tag = null)
        {
            var filter = new FilterInfo
            {
                FilterType = filterType,
                FilterValue = filterValue,
                Tag = tag,
                Id = Guid.NewGuid().ToString()
            };

            ActiveFilters.Add(filter);
            UpdateFilterState();
        }

        /// <summary>
        /// Removes a filter by ID
        /// </summary>
        public void RemoveFilter(string filterId)
        {
            var filter = ActiveFilters.FirstOrDefault(f => f.Id == filterId);
            if (filter != null)
            {
                ActiveFilters.Remove(filter);
                UpdateFilterState();
            }
        }

        /// <summary>
        /// Removes all filters of a specific type
        /// </summary>
        public void RemoveFiltersByType(string filterType)
        {
            var filtersToRemove = ActiveFilters.Where(f => f.FilterType == filterType).ToList();
            foreach (var filter in filtersToRemove)
            {
                ActiveFilters.Remove(filter);
            }
            UpdateFilterState();
        }

        /// <summary>
        /// Clears all filters
        /// </summary>
        public void ClearAllFilters()
        {
            ActiveFilters.Clear();
            UpdateFilterState();
        }

        /// <summary>
        /// Updates the filter state based on color coding
        /// </summary>
        public void UpdateFilterColor(FilterPriority priority)
        {
            var brush = priority switch
            {
                FilterPriority.Low => new SolidColorBrush(Color.FromRgb(76, 175, 80)),     // Green
                FilterPriority.Medium => new SolidColorBrush(Color.FromRgb(255, 193, 7)),  // Amber
                FilterPriority.High => new SolidColorBrush(Color.FromRgb(244, 67, 54)),    // Red
                FilterPriority.Critical => new SolidColorBrush(Color.FromRgb(156, 39, 176)), // Purple
                _ => new SolidColorBrush(Color.FromRgb(76, 175, 80))
            };

            FilterBadge.Background = brush;
        }

        private void UpdateFilterState()
        {
            ActiveFilterCount = ActiveFilters.Count;
            HasActiveFilters = ActiveFilters.Count > 0;
            
            // Update text based on filter count
            FilterText = ActiveFilterCount switch
            {
                0 => "No Filters",
                1 => "Filter Active",
                _ => "Filters Active"
            };
        }

        private void FilterBadge_Click(object sender, MouseButtonEventArgs e)
        {
            if (HasActiveFilters)
            {
                FilterDetailsPopup.IsOpen = !FilterDetailsPopup.IsOpen;
            }
        }

        private void ClearFiltersButton_Click(object sender, RoutedEventArgs e)
        {
            ClearFiltersRequested?.Invoke(this, EventArgs.Empty);
            ClearAllFilters();
        }

        private static void OnActiveFilterCountChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FilterIndicator indicator)
            {
                indicator.HasActiveFilters = (int)e.NewValue > 0;
            }
        }
    }

    /// <summary>
    /// Information about a filter
    /// </summary>
    public class FilterInfo
    {
        public string Id { get; set; }
        public string FilterType { get; set; }
        public string FilterValue { get; set; }
        public object Tag { get; set; }
        public DateTime AppliedTime { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Event args for filter removal
    /// </summary>
    public class FilterRemovedEventArgs : EventArgs
    {
        public FilterInfo FilterInfo { get; }

        public FilterRemovedEventArgs(FilterInfo filterInfo)
        {
            FilterInfo = filterInfo;
        }
    }

    /// <summary>
    /// Filter priority levels for color coding
    /// </summary>
    public enum FilterPriority
    {
        Low,
        Medium,
        High,
        Critical
    }
}