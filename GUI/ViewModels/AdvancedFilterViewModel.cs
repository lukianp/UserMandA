using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class AdvancedFilterViewModel : BaseViewModel
    {
        private readonly IAdvancedFilterService _filterService;
        private readonly ILogger<AdvancedFilterViewModel> _logger;
        
        private FilterConfiguration _currentFilter;
        private ObservableCollection<FilterRule> _filterRules;
        private ObservableCollection<FilterConfiguration> _savedFilters;
        private ObservableCollection<QuickFilter> _quickFilters;
        private FilterConfiguration _selectedSavedFilter;
        private string _filterName;
        private bool _isFilterPanelVisible;
        private bool _isQuickFilterMode;

        public AdvancedFilterViewModel(IAdvancedFilterService filterService = null, ILogger<AdvancedFilterViewModel> logger = null)
        {
            _filterService = filterService ?? SimpleServiceLocator.GetService<IAdvancedFilterService>() ?? new AdvancedFilterService();
            _logger = logger;

            FilterRules = new ObservableCollection<FilterRule>();
            SavedFilters = new ObservableCollection<FilterConfiguration>();
            QuickFilters = new ObservableCollection<QuickFilter>();
            
            CurrentFilter = _filterService.CreateEmptyFilter();
            
            // Initialize commands
            AddRuleCommand = new RelayCommand(AddRule);
            RemoveRuleCommand = new RelayCommand<FilterRule>(RemoveRule);
            ApplyFilterCommand = new AsyncRelayCommand(ApplyFilterAsync);
            ClearFilterCommand = new RelayCommand(ClearFilter);
            SaveFilterCommand = new AsyncRelayCommand(SaveFilterAsync);
            LoadFilterCommand = new RelayCommand<FilterConfiguration>(LoadFilter);
            DeleteFilterCommand = new RelayCommand<FilterConfiguration>(filter => Task.Run(() => DeleteFilterAsync(filter)));
            ToggleFilterPanelCommand = new RelayCommand(ToggleFilterPanel);
            ToggleFilterModeCommand = new RelayCommand(ToggleFilterMode);
            ExportFilterCommand = new RelayCommand(ExportFilter);
            ImportFilterCommand = new RelayCommand(ImportFilter);
            ManagePresetsCommand = new RelayCommand(ManagePresets);

            // Load saved filters
            Task.Run(LoadSavedFiltersAsync);
            
            // Setup quick filters for common scenarios
            SetupQuickFilters();
        }

        #region Properties

        public FilterConfiguration CurrentFilter
        {
            get => _currentFilter;
            set
            {
                if (SetProperty(ref _currentFilter, value))
                {
                    UpdateFilterRules();
                }
            }
        }

        public ObservableCollection<FilterRule> FilterRules
        {
            get => _filterRules;
            set => SetProperty(ref _filterRules, value);
        }

        public ObservableCollection<FilterConfiguration> SavedFilters
        {
            get => _savedFilters;
            set => SetProperty(ref _savedFilters, value);
        }

        public ObservableCollection<QuickFilter> QuickFilters
        {
            get => _quickFilters;
            set => SetProperty(ref _quickFilters, value);
        }

        public FilterConfiguration SelectedSavedFilter
        {
            get => _selectedSavedFilter;
            set
            {
                if (SetProperty(ref _selectedSavedFilter, value) && value != null)
                {
                    LoadFilter(value);
                }
            }
        }

        public string FilterName
        {
            get => _filterName;
            set => SetProperty(ref _filterName, value);
        }

        public bool IsFilterPanelVisible
        {
            get => _isFilterPanelVisible;
            set => SetProperty(ref _isFilterPanelVisible, value);
        }

        public bool IsQuickFilterMode
        {
            get => _isQuickFilterMode;
            set => SetProperty(ref _isQuickFilterMode, value);
        }

        public List<FilterLogic> FilterLogicOptions { get; } = new List<FilterLogic> 
        { 
            FilterLogic.And, 
            FilterLogic.Or 
        };

        public List<FilterOperator> AvailableOperators { get; private set; }
        public List<FilterDataType> DataTypes { get; } = Enum.GetValues<FilterDataType>().ToList();

        #endregion

        #region Commands

        public ICommand AddRuleCommand { get; }
        public ICommand RemoveRuleCommand { get; }
        public AsyncRelayCommand ApplyFilterCommand { get; }
        public ICommand ClearFilterCommand { get; }
        public AsyncRelayCommand SaveFilterCommand { get; }
        public ICommand LoadFilterCommand { get; }
        public ICommand DeleteFilterCommand { get; }
        public ICommand ToggleFilterPanelCommand { get; }
        public ICommand ToggleFilterModeCommand { get; }
        public ICommand ExportFilterCommand { get; }
        public ICommand ImportFilterCommand { get; }
        public ICommand ManagePresetsCommand { get; }

        #endregion

        #region Events

        public event EventHandler<FilterAppliedEventArgs> FilterApplied;
        public event EventHandler FilterCleared;

        #endregion

        #region Methods

        public void Initialize<T>()
        {
            try
            {
                // Get available operators and properties for the specific type
                AvailableOperators = _filterService.GetAvailableOperators();
                var filterableProperties = _filterService.GetFilterableProperties<T>();
                
                // Update quick filters based on the type
                SetupQuickFiltersForType<T>(filterableProperties);
                
                OnPropertyChanged(nameof(AvailableOperators));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error initializing filter for type {Type}", typeof(T).Name);
                ErrorMessage = $"Failed to initialize filters: {ex.Message}";
            }
        }

        private void AddRule()
        {
            var newRule = new FilterRule
            {
                PropertyName = "",
                Operator = FilterOperator.Contains,
                DataType = FilterDataType.Text,
                IsEnabled = true
            };

            CurrentFilter.Rules.Add(newRule);
            FilterRules.Add(newRule);
        }

        private void RemoveRule(FilterRule rule)
        {
            if (rule != null)
            {
                CurrentFilter.Rules.Remove(rule);
                FilterRules.Remove(rule);
            }
        }

        private async Task ApplyFilterAsync()
        {
            try
            {
                IsLoading = true;
                ErrorMessage = null;

                // Validate filter rules
                var validRules = CurrentFilter.Rules.Where(r => 
                    r.IsEnabled && 
                    !string.IsNullOrWhiteSpace(r.PropertyName) && 
                    r.Value != null).ToList();

                if (!validRules.Any())
                {
                    StatusMessage = "No valid filter rules to apply";
                    return;
                }

                CurrentFilter.Rules = validRules;

                // Raise event for consumers to handle the actual filtering
                FilterApplied?.Invoke(this, new FilterAppliedEventArgs(CurrentFilter));

                StatusMessage = $"Applied {validRules.Count} filter rule(s)";
                _logger?.LogInformation("Applied filter with {RuleCount} rules", validRules.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error applying filter");
                ErrorMessage = $"Failed to apply filter: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void ClearFilter()
        {
            CurrentFilter = _filterService.CreateEmptyFilter();
            FilterName = null;
            SelectedSavedFilter = null;
            
            FilterCleared?.Invoke(this, EventArgs.Empty);
            StatusMessage = "Filter cleared";
        }

        private async Task SaveFilterAsync()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(FilterName))
                {
                    ErrorMessage = "Please enter a filter name";
                    return;
                }

                if (!CurrentFilter.Rules.Any(r => r.IsEnabled))
                {
                    ErrorMessage = "Please add at least one filter rule";
                    return;
                }

                IsLoading = true;
                
                var savedFilter = await _filterService.SaveFilterAsync(FilterName, CurrentFilter);
                
                // Update saved filters collection
                var existingFilter = SavedFilters.FirstOrDefault(f => f.Id == savedFilter.Id);
                if (existingFilter != null)
                {
                    var index = SavedFilters.IndexOf(existingFilter);
                    SavedFilters[index] = savedFilter;
                }
                else
                {
                    SavedFilters.Insert(0, savedFilter);
                }

                StatusMessage = $"Saved filter: {FilterName}";
                _logger?.LogInformation("Saved filter: {FilterName}", FilterName);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving filter: {FilterName}", FilterName);
                ErrorMessage = $"Failed to save filter: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void LoadFilter(FilterConfiguration filter)
        {
            if (filter == null) return;

            try
            {
                CurrentFilter = new FilterConfiguration
                {
                    Id = Guid.NewGuid().ToString(), // New ID for loaded filter
                    Name = filter.Name,
                    Logic = filter.Logic,
                    Rules = filter.Rules.Select(r => new FilterRule
                    {
                        Id = Guid.NewGuid().ToString(),
                        PropertyName = r.PropertyName,
                        Operator = r.Operator,
                        Value = r.Value,
                        SecondaryValue = r.SecondaryValue,
                        DataType = r.DataType,
                        IsEnabled = r.IsEnabled
                    }).ToList()
                };

                FilterName = filter.Name;
                StatusMessage = $"Loaded filter: {filter.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading filter: {FilterId}", filter.Id);
                ErrorMessage = $"Failed to load filter: {ex.Message}";
            }
        }

        private async Task DeleteFilterAsync(FilterConfiguration filter)
        {
            if (filter == null) return;

            try
            {
                await _filterService.DeleteFilterAsync(filter.Id);
                SavedFilters.Remove(filter);
                
                if (SelectedSavedFilter?.Id == filter.Id)
                {
                    SelectedSavedFilter = null;
                }

                StatusMessage = $"Deleted filter: {filter.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting filter: {FilterId}", filter.Id);
                ErrorMessage = $"Failed to delete filter: {ex.Message}";
            }
        }

        private void ToggleFilterPanel()
        {
            IsFilterPanelVisible = !IsFilterPanelVisible;
        }

        private void ToggleFilterMode()
        {
            IsQuickFilterMode = !IsQuickFilterMode;
        }

        private void ExportFilter()
        {
            // Simple filter export implementation
            try
            {
                var json = System.Text.Json.JsonSerializer.Serialize(FilterRules, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
                var fileName = $"filter_export_{DateTime.Now:yyyyMMdd_HHmmss}.json";
                var filePath = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), fileName);
                System.IO.File.WriteAllText(filePath, json);
                StatusMessage = $"Filter exported to {fileName}";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Export failed: {ex.Message}";
            }
        }

        private void ImportFilter()
        {
            // Simple filter import implementation
            try
            {
                // Simulate file dialog selection
                var documentsPath = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
                var filterFiles = System.IO.Directory.GetFiles(documentsPath, "filter_export_*.json")
                    .OrderByDescending(f => System.IO.File.GetCreationTime(f))
                    .Take(1)
                    .FirstOrDefault();
                    
                if (filterFiles != null)
                {
                    var json = System.IO.File.ReadAllText(filterFiles);
                    var importedRules = System.Text.Json.JsonSerializer.Deserialize<List<FilterRule>>(json);
                    FilterRules.Clear();
                    foreach (var rule in importedRules)
                    {
                        FilterRules.Add(rule);
                    }
                    StatusMessage = "Filter imported successfully";
                }
                else
                {
                    StatusMessage = "No filter files found to import";
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Import failed: {ex.Message}";
            }
        }

        private async Task LoadSavedFiltersAsync()
        {
            try
            {
                var filters = await _filterService.GetSavedFiltersAsync();
                
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    SavedFilters.Clear();
                    foreach (var filter in filters)
                    {
                        SavedFilters.Add(filter);
                    }
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading saved filters");
            }
        }

        private void UpdateFilterRules()
        {
            FilterRules.Clear();
            if (CurrentFilter?.Rules != null)
            {
                foreach (var rule in CurrentFilter.Rules)
                {
                    FilterRules.Add(rule);
                }
            }
        }

        private void SetupQuickFilters()
        {
            QuickFilters.Clear();
            
            // Common quick filters
            QuickFilters.Add(new QuickFilter
            {
                PropertyName = "IsEnabled",
                DisplayName = "Status",
                DataType = FilterDataType.Boolean,
                PredefinedValues = new List<object> { true, false }
            });

            QuickFilters.Add(new QuickFilter
            {
                PropertyName = "CreatedDate",
                DisplayName = "Created",
                DataType = FilterDataType.Date
            });
        }

        private void SetupQuickFiltersForType<T>(List<string> properties)
        {
            // Add type-specific quick filters based on common property patterns
            var typeSpecificFilters = new List<QuickFilter>();

            foreach (var prop in properties)
            {
                var propType = typeof(T).GetProperty(prop)?.PropertyType;
                if (propType == null) continue;

                var underlyingType = Nullable.GetUnderlyingType(propType) ?? propType;

                if (underlyingType == typeof(bool))
                {
                    typeSpecificFilters.Add(new QuickFilter
                    {
                        PropertyName = prop,
                        DisplayName = prop,
                        DataType = FilterDataType.Boolean,
                        PredefinedValues = new List<object> { true, false }
                    });
                }
                else if (underlyingType.IsEnum)
                {
                    typeSpecificFilters.Add(new QuickFilter
                    {
                        PropertyName = prop,
                        DisplayName = prop,
                        DataType = FilterDataType.Enum,
                        PredefinedValues = Enum.GetValues(underlyingType).Cast<object>().ToList(),
                        IsMultiSelect = true
                    });
                }
            }

            // Add type-specific filters to the collection
            foreach (var filter in typeSpecificFilters.Take(5)) // Limit to 5 quick filters
            {
                QuickFilters.Add(filter);
            }
        }

        public List<FilterOperator> GetOperatorsForDataType(FilterDataType dataType)
        {
            return dataType switch
            {
                FilterDataType.Text => new List<FilterOperator>
                {
                    FilterOperator.Contains, FilterOperator.NotContains, FilterOperator.StartsWith, 
                    FilterOperator.EndsWith, FilterOperator.Equals, FilterOperator.NotEquals,
                    FilterOperator.IsEmpty, FilterOperator.IsNotEmpty, FilterOperator.Regex
                },
                FilterDataType.Number => new List<FilterOperator>
                {
                    FilterOperator.Equals, FilterOperator.NotEquals, FilterOperator.GreaterThan,
                    FilterOperator.GreaterThanOrEqual, FilterOperator.LessThan, FilterOperator.LessThanOrEqual
                },
                FilterDataType.Date => new List<FilterOperator>
                {
                    FilterOperator.Equals, FilterOperator.NotEquals, FilterOperator.GreaterThan, FilterOperator.LessThan,
                    FilterOperator.GreaterThanOrEqual, FilterOperator.LessThanOrEqual
                },
                FilterDataType.Boolean => new List<FilterOperator>
                {
                    FilterOperator.Equals, FilterOperator.NotEquals
                },
                FilterDataType.Collection => new List<FilterOperator>
                {
                    FilterOperator.Contains, FilterOperator.NotContains
                },
                FilterDataType.Enum => new List<FilterOperator>
                {
                    FilterOperator.Equals, FilterOperator.NotEquals
                },
                _ => AvailableOperators ?? new List<FilterOperator>()
            };
        }

        #endregion

        private void ManagePresets()
        {
            try
            {
                var dialog = new MandADiscoverySuite.Dialogs.FilterPresetManagerDialog();
                
                // Subscribe to preset load requests
                dialog.ViewModel.PresetLoadRequested += (sender, preset) =>
                {
                    LoadFilter(preset);
                    dialog.Close();
                };

                dialog.ShowDialog();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error opening preset manager");
                ErrorMessage = $"Failed to open preset manager: {ex.Message}";
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                FilterRules?.Clear();
                SavedFilters?.Clear();
                QuickFilters?.Clear();
            }
            base.Dispose(disposing);
        }
    }

    public class FilterAppliedEventArgs : EventArgs
    {
        public FilterConfiguration FilterConfiguration { get; }

        public FilterAppliedEventArgs(FilterConfiguration filterConfiguration)
        {
            FilterConfiguration = filterConfiguration;
        }
    }
}