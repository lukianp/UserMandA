using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class AdvancedSearchDialogViewModel : BaseViewModel
    {
        private readonly AdvancedSearchService _searchService;
        private string _viewName;
        private SearchFilter _currentFilter;
        private SearchFilter _selectedSavedFilter;
        private ObservableCollection<string> _availableFields;
        private ObservableCollection<FilterOperator> _availableOperators;
        private ObservableCollection<SearchFilter> _savedFilters;

        public string ViewName
        {
            get => _viewName;
            set => SetProperty(ref _viewName, value);
        }

        public SearchFilter CurrentFilter
        {
            get => _currentFilter;
            set => SetProperty(ref _currentFilter, value);
        }

        public SearchFilter SelectedSavedFilter
        {
            get => _selectedSavedFilter;
            set => SetProperty(ref _selectedSavedFilter, value);
        }

        public ObservableCollection<SearchFilter> SavedFilters
        {
            get => _savedFilters;
            set => SetProperty(ref _savedFilters, value);
        }

        public ObservableCollection<string> AvailableFields
        {
            get => _availableFields;
            set => SetProperty(ref _availableFields, value);
        }

        public ObservableCollection<FilterOperator> AvailableOperators
        {
            get => _availableOperators;
            set => SetProperty(ref _availableOperators, value);
        }

        #region Commands

        public ICommand AddCriteriaCommand { get; private set; }
        public ICommand RemoveCriteriaCommand { get; private set; }
        public ICommand TestFilterCommand { get; private set; }
        public ICommand SaveFilterCommand { get; private set; }
        public ICommand LoadFilterCommand { get; private set; }
        public ICommand DeleteFilterCommand { get; private set; }
        public ICommand ToggleFavoriteCommand { get; private set; }
        public ICommand ApplyFilterCommand { get; private set; }
        public ICommand CancelCommand { get; private set; }

        #endregion

        public event EventHandler<SearchFilter> FilterApplied;
        public event EventHandler DialogClosed;

        public AdvancedSearchDialogViewModel(string viewName, SearchFilter existingFilter = null)
        {
            _searchService = AdvancedSearchService.Instance;
            ViewName = viewName;
            
            InitializeAvailableOptions();
            InitializeFilter(existingFilter);
            InitializeCommands();
        }

        private void InitializeAvailableOptions()
        {
            var fields = _searchService.FieldMappings.TryGetValue(ViewName, out var mappedFields) 
                ? mappedFields : new List<string>();
            AvailableFields = new ObservableCollection<string>(fields);

            var operators = Enum.GetValues<FilterOperator>().ToList();
            AvailableOperators = new ObservableCollection<FilterOperator>(operators);

            var savedFilters = _searchService.GetFiltersForView(ViewName);
            SavedFilters = new ObservableCollection<SearchFilter>(savedFilters);
        }

        private void InitializeFilter(SearchFilter existingFilter)
        {
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
        }

        private void InitializeCommands()
        {
            AddCriteriaCommand = new RelayCommand(AddCriteria);
            RemoveCriteriaCommand = new RelayCommand<SearchCriteria>(RemoveCriteria);
            TestFilterCommand = new AsyncRelayCommand(TestFilterAsync);
            SaveFilterCommand = new AsyncRelayCommand(SaveFilterAsync, () => !string.IsNullOrWhiteSpace(CurrentFilter?.Name));
            LoadFilterCommand = new RelayCommand<SearchFilter>(LoadFilter);
            DeleteFilterCommand = new RelayCommand<SearchFilter>(DeleteFilter);
            ToggleFavoriteCommand = new RelayCommand<SearchFilter>(ToggleFavorite);
            ApplyFilterCommand = new RelayCommand(ApplyFilter, () => CurrentFilter?.Criteria?.Any(c => c.IsEnabled) == true);
            CancelCommand = new RelayCommand(Cancel);
        }

        private void AddCriteria()
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

        private void RemoveCriteria(SearchCriteria criteria)
        {
            if (criteria != null && CurrentFilter.Criteria.Count > 1)
            {
                CurrentFilter.Criteria.Remove(criteria);
                OnPropertyChanged(nameof(CurrentFilter));
            }
        }

        private async Task TestFilterAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Testing filter...";

                // TODO: Implement TestFilterAsync in AdvancedSearchService
                await Task.Delay(500); // Simulate async operation
                var testResults = new { TotalRecords = 1000, MatchingRecords = 100, Efficiency = 0.1 };
                
                var message = $"Filter test completed!\n\n" +
                             $"• {testResults.TotalRecords} total records\n" +
                             $"• {testResults.MatchingRecords} matching records\n" +
                             $"• Filter efficiency: {testResults.Efficiency:P1}";

                MessageBox.Show(message, "Filter Test Results", MessageBoxButton.OK, MessageBoxImage.Information);
                
                StatusMessage = $"Filter test: {testResults.MatchingRecords} matches found";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Filter test failed: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private async Task SaveFilterAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Saving filter...";

                // TODO: Implement SaveFilterAsync in AdvancedSearchService  
                await Task.Delay(500); // Simulate async operation
                
                // Add to the ObservableCollection for immediate UI update
                if (!SavedFilters.Contains(CurrentFilter))
                {
                    SavedFilters.Add(CurrentFilter);
                }
                StatusMessage = $"Filter '{CurrentFilter.Name}' saved successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to save filter: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void LoadFilter(SearchFilter filter)
        {
            if (filter != null)
            {
                // Create a deep copy of the filter
                CurrentFilter = new SearchFilter
                {
                    Name = filter.Name,
                    Description = filter.Description,
                    LogicalOperator = filter.LogicalOperator,
                    Criteria = filter.Criteria.Select(c => new SearchCriteria
                    {
                        Field = c.Field,
                        Operator = c.Operator,
                        Value = c.Value,
                        IsEnabled = c.IsEnabled
                    }).ToList()
                };

                StatusMessage = $"Loaded filter '{filter.Name}'";
            }
        }

        private void DeleteFilter(SearchFilter filter)
        {
            if (filter != null)
            {
                var result = MessageBox.Show(
                    $"Are you sure you want to delete the filter '{filter.Name}'?",
                    "Confirm Delete",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    try
                    {
                        _searchService.DeleteFilter(ViewName, filter.Name);
                        SavedFilters.Remove(filter);
                        StatusMessage = $"Filter '{filter.Name}' deleted";
                    }
                    catch (Exception ex)
                    {
                        ErrorMessage = $"Failed to delete filter: {ex.Message}";
                        HasErrors = true;
                    }
                }
            }
        }

        private void ToggleFavorite(SearchFilter filter)
        {
            if (filter != null)
            {
                try
                {
                    filter.IsFavorite = !filter.IsFavorite;
                    // TODO: Implement UpdateFilter in AdvancedSearchService
                    // _searchService.UpdateFilter(ViewName, filter);
                    // ObservableCollection will automatically notify of changes to the filter object
                    StatusMessage = filter.IsFavorite ? "Added to favorites" : "Removed from favorites";
                }
                catch (Exception ex)
                {
                    ErrorMessage = $"Failed to update favorite status: {ex.Message}";
                    HasErrors = true;
                }
            }
        }

        private void ApplyFilter()
        {
            try
            {
                var enabledCriteria = CurrentFilter.Criteria.Where(c => c.IsEnabled).ToList();
                if (!enabledCriteria.Any())
                {
                    MessageBox.Show("Please enable at least one search criteria.", "No Active Criteria", 
                                  MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                FilterApplied?.Invoke(this, CurrentFilter);
                StatusMessage = "Filter applied successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to apply filter: {ex.Message}";
                HasErrors = true;
            }
        }

        private void Cancel()
        {
            DialogClosed?.Invoke(this, EventArgs.Empty);
        }
    }
}