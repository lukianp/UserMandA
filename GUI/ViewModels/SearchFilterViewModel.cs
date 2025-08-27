using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// View model for advanced search and filtering functionality
    /// </summary>
    public class SearchFilterViewModel : BaseViewModel
    {
        #region Private Fields

        private string _searchText = string.Empty;
        private string _selectedModule = "All";
        private string _selectedStatus = "All";
        private DateTime? _dateFrom;
        private DateTime? _dateTo;
        private int _minItems = 0;
        private int _maxItems = int.MaxValue;
        private string _sortBy = "DiscoveryTime";
        private bool _sortDescending = true;
        private bool _isAdvancedFilterVisible;

        #endregion

        #region Properties

        /// <summary>
        /// Search text for filtering results
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set => SetProperty(ref _searchText, value, OnFilterChanged);
        }

        /// <summary>
        /// Selected module filter
        /// </summary>
        public string SelectedModule
        {
            get => _selectedModule;
            set => SetProperty(ref _selectedModule, value, OnFilterChanged);
        }

        /// <summary>
        /// Selected status filter
        /// </summary>
        public string SelectedStatus
        {
            get => _selectedStatus;
            set => SetProperty(ref _selectedStatus, value, OnFilterChanged);
        }

        /// <summary>
        /// Date range filter - from date
        /// </summary>
        public DateTime? DateFrom
        {
            get => _dateFrom;
            set => SetProperty(ref _dateFrom, value, OnFilterChanged);
        }

        /// <summary>
        /// Date range filter - to date
        /// </summary>
        public DateTime? DateTo
        {
            get => _dateTo;
            set => SetProperty(ref _dateTo, value, OnFilterChanged);
        }

        /// <summary>
        /// Minimum item count filter
        /// </summary>
        public int MinItems
        {
            get => _minItems;
            set => SetProperty(ref _minItems, value, OnFilterChanged);
        }

        /// <summary>
        /// Maximum item count filter
        /// </summary>
        public int MaxItems
        {
            get => _maxItems;
            set => SetProperty(ref _maxItems, value, OnFilterChanged);
        }

        /// <summary>
        /// Sort property
        /// </summary>
        public string SortBy
        {
            get => _sortBy;
            set => SetProperty(ref _sortBy, value, OnFilterChanged);
        }

        /// <summary>
        /// Sort direction
        /// </summary>
        public bool SortDescending
        {
            get => _sortDescending;
            set => SetProperty(ref _sortDescending, value, OnFilterChanged);
        }

        /// <summary>
        /// Whether advanced filter panel is visible
        /// </summary>
        public bool IsAdvancedFilterVisible
        {
            get => _isAdvancedFilterVisible;
            set => SetProperty(ref _isAdvancedFilterVisible, value);
        }

        /// <summary>
        /// Available modules for filtering
        /// </summary>
        public List<string> AvailableModules { get; } = new List<string>
        {
            "All",
            "ActiveDirectory",
            "AzureAD",
            "Exchange",
            "SharePoint",
            "Teams",
            "Intune",
            "NetworkInfrastructure",
            "SQLServer",
            "FileServers",
            "Applications",
            "Certificates",
            "Printers",
            "VMware",
            "DataClassification",
            "SecurityGroups"
        };

        /// <summary>
        /// Available statuses for filtering
        /// </summary>
        public List<string> AvailableStatuses { get; } = new List<string>
        {
            "All",
            "Completed",
            "Failed",
            "Running",
            "Cancelled"
        };

        /// <summary>
        /// Available sort options
        /// </summary>
        public List<SortOption> SortOptions { get; } = new List<SortOption>
        {
            new SortOption("Discovery Time", "DiscoveryTime"),
            new SortOption("Module Name", "ModuleName"),
            new SortOption("Item Count", "ItemCount"),
            new SortOption("Duration", "Duration"),
            new SortOption("Status", "Status")
        };

        /// <summary>
        /// Whether any filters are applied
        /// </summary>
        public bool HasActiveFilters =>
            !string.IsNullOrWhiteSpace(SearchText) ||
            SelectedModule != "All" ||
            SelectedStatus != "All" ||
            DateFrom.HasValue ||
            DateTo.HasValue ||
            MinItems > 0 ||
            MaxItems < int.MaxValue;

        #endregion

        #region Commands

        public ICommand ClearFiltersCommand { get; }
        public ICommand ToggleAdvancedFiltersCommand { get; }
        public ICommand ApplyQuickFilterCommand { get; }

        #endregion

        #region Events

        /// <summary>
        /// Event raised when filter criteria changes
        /// </summary>
        public event EventHandler FiltersChanged;

        #endregion

        #region Constructor

        public SearchFilterViewModel()
        {
            // Initialize commands
            ClearFiltersCommand = new RelayCommand(ClearAllFilters);
            ToggleAdvancedFiltersCommand = new RelayCommand(ToggleAdvancedFilters);
            ApplyQuickFilterCommand = new RelayCommand<string>(ApplyQuickFilter);
        }

        #endregion

        #region Methods

        /// <summary>
        /// Applies the current filter criteria to a collection view
        /// </summary>
        public void ApplyFilter(ICollectionView collectionView)
        {
            try
            {
                if (collectionView == null) return;

                collectionView.Filter = FilterPredicate;
                
                // Apply sorting
                collectionView.SortDescriptions.Clear();
                var direction = SortDescending ? ListSortDirection.Descending : ListSortDirection.Ascending;
                collectionView.SortDescriptions.Add(new SortDescription(SortBy, direction));
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SearchFilterViewModel.ApplyFilter failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Filter predicate for discovery results
        /// </summary>
        public bool FilterPredicate(object item)
        {
            try
            {
                if (!(item is DiscoveryResult result))
                    return false;

                // Text search
                if (!string.IsNullOrWhiteSpace(SearchText))
                {
                    var searchLower = SearchText.ToLowerInvariant();
                    if (!result.ModuleName.ToLowerInvariant().Contains(searchLower) &&
                        !result.DisplayName.ToLowerInvariant().Contains(searchLower) &&
                        !result.Status.ToLowerInvariant().Contains(searchLower))
                    {
                        return false;
                    }
                }

                // Module filter
                if (SelectedModule != "All" && result.ModuleName != SelectedModule)
                    return false;

                // Status filter
                if (SelectedStatus != "All" && result.Status != SelectedStatus)
                    return false;

                // Date range filter
                if (DateFrom.HasValue && result.DiscoveryTime.Date < DateFrom.Value.Date)
                    return false;

                if (DateTo.HasValue && result.DiscoveryTime.Date > DateTo.Value.Date)
                    return false;

                // Item count range filter
                if (result.ItemCount < MinItems || result.ItemCount > MaxItems)
                    return false;

                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SearchFilterViewModel.FilterPredicate failed: {ex.Message}");
                return false; // If filter fails, exclude the item
            }
        }

        /// <summary>
        /// Clears all filters
        /// </summary>
        public void ClearAllFilters()
        {
            SearchText = string.Empty;
            SelectedModule = "All";
            SelectedStatus = "All";
            DateFrom = null;
            DateTo = null;
            MinItems = 0;
            MaxItems = int.MaxValue;
            SortBy = "DiscoveryTime";
            SortDescending = true;
        }

        /// <summary>
        /// Applies a predefined quick filter
        /// </summary>
        private void ApplyQuickFilter(string filterType)
        {
            switch (filterType?.ToLowerInvariant())
            {
                case "today":
                    DateFrom = DateTime.Today;
                    DateTo = DateTime.Today;
                    break;

                case "thisweek":
                    var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
                    DateFrom = startOfWeek;
                    DateTo = DateTime.Today;
                    break;

                case "thismonth":
                    DateFrom = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
                    DateTo = DateTime.Today;
                    break;

                case "failed":
                    SelectedStatus = "Failed";
                    break;

                case "highvolume":
                    MinItems = 1000;
                    MaxItems = int.MaxValue;
                    break;

                case "lowvolume":
                    MinItems = 0;
                    MaxItems = 100;
                    break;
            }
        }

        private void ToggleAdvancedFilters()
        {
            IsAdvancedFilterVisible = !IsAdvancedFilterVisible;
        }

        private void OnFilterChanged()
        {
            OnPropertyChanged(nameof(HasActiveFilters));
            FiltersChanged?.Invoke(this, EventArgs.Empty);
        }

        #endregion
    }

    /// <summary>
    /// Sort option for dropdown
    /// </summary>
    public class SortOption
    {
        public string DisplayName { get; }
        public string PropertyName { get; }

        public SortOption(string displayName, string propertyName)
        {
            DisplayName = displayName;
            PropertyName = propertyName;
        }

        public override string ToString() => DisplayName;
    }
}