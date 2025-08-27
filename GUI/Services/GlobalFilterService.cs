using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using MandADiscoverySuite.Controls;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing global filters across the application
    /// </summary>
    public class GlobalFilterService
    {
        private readonly ObservableCollection<FilterInfo> _globalFilters;
        private readonly Dictionary<string, List<FilterIndicator>> _registeredIndicators;
        
        public GlobalFilterService()
        {
            _globalFilters = new ObservableCollection<FilterInfo>();
            _registeredIndicators = new Dictionary<string, List<FilterIndicator>>();
        }

        /// <summary>
        /// Gets the global filters collection
        /// </summary>
        public ObservableCollection<FilterInfo> GlobalFilters => _globalFilters;

        /// <summary>
        /// Gets whether any filters are active
        /// </summary>
        public bool HasActiveFilters => _globalFilters.Count > 0;

        /// <summary>
        /// Gets the count of active filters
        /// </summary>
        public int ActiveFilterCount => _globalFilters.Count;

        /// <summary>
        /// Event raised when filters change
        /// </summary>
        public event EventHandler<FilterChangedEventArgs> FiltersChanged;

        /// <summary>
        /// Registers a filter indicator with the service
        /// </summary>
        public void RegisterIndicator(FilterIndicator indicator, string context = "global")
        {
            if (indicator == null) return;

            if (!_registeredIndicators.ContainsKey(context))
            {
                _registeredIndicators[context] = new List<FilterIndicator>();
            }

            _registeredIndicators[context].Add(indicator);
            
            // Sync current filters to the indicator
            SyncFiltersToIndicator(indicator, context);
            
            // Subscribe to indicator events
            indicator.ClearFiltersRequested += (s, e) => ClearFilters(context);
            indicator.FilterRemovalRequested += (s, e) => RemoveFilter(e.FilterInfo.Id);
        }

        /// <summary>
        /// Unregisters a filter indicator
        /// </summary>
        public void UnregisterIndicator(FilterIndicator indicator, string context = "global")
        {
            if (indicator == null || !_registeredIndicators.ContainsKey(context)) return;

            _registeredIndicators[context].Remove(indicator);
            
            if (_registeredIndicators[context].Count == 0)
            {
                _registeredIndicators.Remove(context);
            }
        }

        /// <summary>
        /// Adds a filter
        /// </summary>
        public void AddFilter(string filterType, string filterValue, object tag = null, string context = "global")
        {
            // Check if filter already exists
            var existingFilter = _globalFilters.FirstOrDefault(f => 
                f.FilterType == filterType && f.FilterValue == filterValue);

            if (existingFilter != null) return;

            var filter = new FilterInfo
            {
                Id = Guid.NewGuid().ToString(),
                FilterType = filterType,
                FilterValue = filterValue,
                Tag = tag,
                AppliedTime = DateTime.Now
            };

            _globalFilters.Add(filter);
            
            // Update all indicators in the context
            UpdateIndicators(context);
            
            // Raise event
            FiltersChanged?.Invoke(this, new FilterChangedEventArgs(FilterChangeType.Added, filter));
        }

        /// <summary>
        /// Removes a specific filter
        /// </summary>
        public void RemoveFilter(string filterId, string context = "global")
        {
            var filter = _globalFilters.FirstOrDefault(f => f.Id == filterId);
            if (filter != null)
            {
                _globalFilters.Remove(filter);
                UpdateIndicators(context);
                
                FiltersChanged?.Invoke(this, new FilterChangedEventArgs(FilterChangeType.Removed, filter));
            }
        }

        /// <summary>
        /// Removes all filters of a specific type
        /// </summary>
        public void RemoveFiltersByType(string filterType, string context = "global")
        {
            var filtersToRemove = _globalFilters.Where(f => f.FilterType == filterType).ToList();
            
            foreach (var filter in filtersToRemove)
            {
                _globalFilters.Remove(filter);
                FiltersChanged?.Invoke(this, new FilterChangedEventArgs(FilterChangeType.Removed, filter));
            }
            
            UpdateIndicators(context);
        }

        /// <summary>
        /// Clears all filters
        /// </summary>
        public void ClearFilters(string context = "global")
        {
            var clearedFilters = _globalFilters.ToList();
            _globalFilters.Clear();
            
            UpdateIndicators(context);
            
            foreach (var filter in clearedFilters)
            {
                FiltersChanged?.Invoke(this, new FilterChangedEventArgs(FilterChangeType.Removed, filter));
            }
        }

        /// <summary>
        /// Gets filters by type
        /// </summary>
        public IEnumerable<FilterInfo> GetFiltersByType(string filterType)
        {
            return _globalFilters.Where(f => f.FilterType == filterType);
        }

        /// <summary>
        /// Gets filter statistics
        /// </summary>
        public FilterStats GetFilterStats()
        {
            var stats = new FilterStats
            {
                TotalFilters = _globalFilters.Count,
                FiltersByType = _globalFilters.GroupBy(f => f.FilterType)
                    .ToDictionary(g => g.Key, g => g.Count()),
                RegisteredIndicators = _registeredIndicators.Sum(kvp => kvp.Value.Count)
            };

            return stats;
        }

        /// <summary>
        /// Applies quick filters based on common patterns
        /// </summary>
        public void ApplyQuickFilter(QuickFilterType filterType, string value)
        {
            var filterTypeName = filterType switch
            {
                QuickFilterType.DateRange => "Date",
                QuickFilterType.Status => "Status",
                QuickFilterType.Category => "Category",
                QuickFilterType.Priority => "Priority",
                QuickFilterType.User => "User",
                QuickFilterType.SearchText => "Search",
                _ => "General"
            };

            AddFilter(filterTypeName, value);
        }

        /// <summary>
        /// Creates a filter preset
        /// </summary>
        public void SaveFilterPreset(string presetName, List<FilterInfo> filters)
        {
            // Implementation would save to user settings or database
            // For now, just apply the filters
            ClearFilters();
            foreach (var filter in filters)
            {
                AddFilter(filter.FilterType, filter.FilterValue, filter.Tag);
            }
        }

        #region Private Methods

        private void UpdateIndicators(string context)
        {
            if (!_registeredIndicators.ContainsKey(context)) return;

            foreach (var indicator in _registeredIndicators[context])
            {
                SyncFiltersToIndicator(indicator, context);
            }
        }

        private void SyncFiltersToIndicator(FilterIndicator indicator, string context)
        {
            // Clear existing filters in indicator
            indicator.ActiveFilters.Clear();
            
            // Add current global filters
            foreach (var filter in _globalFilters)
            {
                indicator.ActiveFilters.Add(filter);
            }
            
            // Update indicator properties
            indicator.ActiveFilterCount = _globalFilters.Count;
            indicator.HasActiveFilters = _globalFilters.Count > 0;
        }

        #endregion
    }

    /// <summary>
    /// Event args for filter changes
    /// </summary>
    public class FilterChangedEventArgs : EventArgs
    {
        public FilterChangeType ChangeType { get; }
        public FilterInfo FilterInfo { get; }

        public FilterChangedEventArgs(FilterChangeType changeType, FilterInfo filterInfo)
        {
            ChangeType = changeType;
            FilterInfo = filterInfo;
        }
    }

    /// <summary>
    /// Types of filter changes
    /// </summary>
    public enum FilterChangeType
    {
        Added,
        Removed,
        Modified,
        Cleared
    }

    /// <summary>
    /// Quick filter types
    /// </summary>
    public enum QuickFilterType
    {
        DateRange,
        Status,
        Category,
        Priority,
        User,
        SearchText
    }

    /// <summary>
    /// Filter statistics
    /// </summary>
    public class FilterStats
    {
        public int TotalFilters { get; set; }
        public Dictionary<string, int> FiltersByType { get; set; } = new();
        public int RegisteredIndicators { get; set; }

        public override string ToString()
        {
            return $"Filters: {TotalFilters}, Types: {FiltersByType.Count}, Indicators: {RegisteredIndicators}";
        }
    }
}