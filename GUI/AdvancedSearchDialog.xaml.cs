using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite
{
    public partial class AdvancedSearchDialog : Window, INotifyPropertyChanged
    {
        private readonly AdvancedSearchService _searchService;
        private string _viewName;
        private SearchFilter _currentFilter;
        private SearchFilter _selectedSavedFilter;
        private List<string> _availableFields;
        private List<FilterOperator> _availableOperators;

        public string ViewName
        {
            get => _viewName;
            set { _viewName = value; OnPropertyChanged(nameof(ViewName)); }
        }

        public SearchFilter CurrentFilter
        {
            get => _currentFilter;
            set { _currentFilter = value; OnPropertyChanged(nameof(CurrentFilter)); }
        }

        public SearchFilter SelectedSavedFilter
        {
            get => _selectedSavedFilter;
            set { _selectedSavedFilter = value; OnPropertyChanged(nameof(SelectedSavedFilter)); }
        }

        public List<SearchFilter> SavedFilters => _searchService.GetFiltersForView(ViewName);

        public List<string> AvailableFields
        {
            get => _availableFields;
            set { _availableFields = value; OnPropertyChanged(nameof(AvailableFields)); }
        }

        public List<FilterOperator> AvailableOperators
        {
            get => _availableOperators;
            set { _availableOperators = value; OnPropertyChanged(nameof(AvailableOperators)); }
        }

        public AdvancedSearchDialog(string viewName, SearchFilter existingFilter = null)
        {
            InitializeComponent();
            
            _searchService = AdvancedSearchService.Instance;
            ViewName = viewName;
            
            InitializeAvailableOptions();
            
            CurrentFilter = existingFilter ?? new SearchFilter
            {
                Name = "New Filter",
                Description = "",
                LogicalOperator = LogicalOperator.And,
                Criteria = new List<SearchCriteria>
                {
                    new SearchCriteria 
                    { 
                        Field = AvailableFields.FirstOrDefault() ?? "Name", 
                        Operator = FilterOperator.Contains, 
                        Value = "", 
                        IsEnabled = true 
                    }
                }
            };

            DataContext = this;
        }

        private void InitializeAvailableOptions()
        {
            AvailableFields = _searchService.FieldMappings.TryGetValue(ViewName, out var fields) 
                ? fields : new List<string>();

            AvailableOperators = Enum.GetValues<FilterOperator>().ToList();
        }

        private void AddCriteria_Click(object sender, RoutedEventArgs e)
        {
            CurrentFilter.Criteria.Add(new SearchCriteria
            {
                Field = AvailableFields.FirstOrDefault() ?? "Name",
                Operator = FilterOperator.Contains,
                Value = "",
                IsEnabled = true
            });
            
            OnPropertyChanged(nameof(CurrentFilter));
        }

        private void RemoveCriteria_Click(object sender, RoutedEventArgs e)
        {
            if (sender is FrameworkElement element && element.Tag is SearchCriteria criteria)
            {
                CurrentFilter.Criteria.Remove(criteria);
                OnPropertyChanged(nameof(CurrentFilter));
            }
        }

        private void TestFilter_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var enabledCriteria = CurrentFilter.Criteria.Count(c => c.IsEnabled);
                var message = $"Filter '{CurrentFilter.Name}' has {enabledCriteria} active criteria using {CurrentFilter.LogicalOperator} logic.\n\n";
                
                message += "Active Criteria:\n";
                foreach (var criteria in CurrentFilter.Criteria.Where(c => c.IsEnabled))
                {
                    message += $"• {criteria.DisplayText}\n";
                }

                MessageBox.Show(message, "Filter Test", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error testing filter: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void SaveFilter_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(CurrentFilter.Name))
                {
                    MessageBox.Show("Please enter a name for the filter.", "Validation Error", 
                                   MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (!CurrentFilter.Criteria.Any(c => c.IsEnabled))
                {
                    MessageBox.Show("Please add at least one enabled search criteria.", "Validation Error", 
                                   MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                _searchService.SaveFilter(ViewName, CurrentFilter);
                OnPropertyChanged(nameof(SavedFilters));
                
                MessageBox.Show($"Filter '{CurrentFilter.Name}' has been saved successfully.", "Filter Saved", 
                               MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error saving filter: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void LoadFilter_Click(object sender, RoutedEventArgs e)
        {
            if (SelectedSavedFilter != null)
            {
                CurrentFilter = new SearchFilter
                {
                    Name = SelectedSavedFilter.Name,
                    Description = SelectedSavedFilter.Description,
                    LogicalOperator = SelectedSavedFilter.LogicalOperator,
                    IsFavorite = SelectedSavedFilter.IsFavorite,
                    Created = SelectedSavedFilter.Created,
                    LastUsed = DateTime.Now,
                    Criteria = SelectedSavedFilter.Criteria.Select(c => new SearchCriteria
                    {
                        Field = c.Field,
                        Operator = c.Operator,
                        Value = c.Value,
                        IsEnabled = c.IsEnabled
                    }).ToList()
                };
                
                OnPropertyChanged(nameof(CurrentFilter));
            }
        }

        private void DeleteFilter_Click(object sender, RoutedEventArgs e)
        {
            if (SelectedSavedFilter != null)
            {
                var result = MessageBox.Show($"Are you sure you want to delete the filter '{SelectedSavedFilter.Name}'?", 
                                           "Confirm Delete", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
                if (result == MessageBoxResult.Yes)
                {
                    _searchService.DeleteFilter(ViewName, SelectedSavedFilter.Name);
                    OnPropertyChanged(nameof(SavedFilters));
                    SelectedSavedFilter = null;
                }
            }
        }

        private void ToggleFavorite_Click(object sender, RoutedEventArgs e)
        {
            if (SelectedSavedFilter != null)
            {
                SelectedSavedFilter.IsFavorite = !SelectedSavedFilter.IsFavorite;
                _searchService.SaveFilter(ViewName, SelectedSavedFilter);
                OnPropertyChanged(nameof(SavedFilters));
            }
        }

        private void ApplyFilter_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!CurrentFilter.Criteria.Any(c => c.IsEnabled))
                {
                    MessageBox.Show("Please add at least one enabled search criteria.", "Validation Error", 
                                   MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error applying filter: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}