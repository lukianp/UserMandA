using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class FilterPresetManagerViewModel : BaseViewModel
    {
        private readonly IAdvancedFilterService _filterService;
        private readonly ILogger<FilterPresetManagerViewModel> _logger;
        
        private ObservableCollection<FilterConfiguration> _allPresets;
        private ICollectionView _filteredPresets;
        private ObservableCollection<CategoryItem> _categories;
        private CategoryItem _selectedCategory;
        private string _searchText = string.Empty;
        private FilterPresetSortOption _sortOption;
        private bool _showFavoritesOnly;
        private bool _showRecentOnly;
        private FilterConfiguration _selectedPreset;

        public FilterPresetManagerViewModel()
        {
            _filterService = SimpleServiceLocator.GetService<IAdvancedFilterService>() ?? new AdvancedFilterService();
            _logger = SimpleServiceLocator.GetService<ILogger<FilterPresetManagerViewModel>>();

            _allPresets = new ObservableCollection<FilterConfiguration>();
            _categories = new ObservableCollection<CategoryItem>();
            
            SetupCollectionView();
            InitializeCommands();
            SetupSortOptions();
        }

        #region Properties

        public ICollectionView FilteredPresets
        {
            get => _filteredPresets;
            private set => SetProperty(ref _filteredPresets, value);
        }

        public ObservableCollection<CategoryItem> Categories
        {
            get => _categories;
            set => SetProperty(ref _categories, value);
        }

        public CategoryItem SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (SetProperty(ref _selectedCategory, value))
                {
                    ApplyFilters();
                }
            }
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilters();
                }
            }
        }

        public FilterPresetSortOption SortOption
        {
            get => _sortOption;
            set
            {
                if (SetProperty(ref _sortOption, value))
                {
                    ApplySorting();
                }
            }
        }

        public bool ShowFavoritesOnly
        {
            get => _showFavoritesOnly;
            set
            {
                if (SetProperty(ref _showFavoritesOnly, value))
                {
                    ApplyFilters();
                }
            }
        }

        public bool ShowRecentOnly
        {
            get => _showRecentOnly;
            set
            {
                if (SetProperty(ref _showRecentOnly, value))
                {
                    ApplyFilters();
                }
            }
        }

        public FilterConfiguration SelectedPreset
        {
            get => _selectedPreset;
            set
            {
                if (SetProperty(ref _selectedPreset, value))
                {
                    OnPropertyChanged(nameof(HasSelection));
                }
            }
        }

        public bool HasSelection => SelectedPreset != null;

        public List<FilterPresetSortOption> SortOptions { get; private set; }

        #endregion

        #region Commands

        public ICommand SelectCategoryCommand { get; private set; }
        public ICommand LoadPresetCommand { get; private set; }
        public ICommand ToggleFavoriteCommand { get; private set; }
        public ICommand DuplicatePresetCommand { get; private set; }
        public ICommand DeletePresetCommand { get; private set; }
        public ICommand ImportPresetCommand { get; private set; }
        public ICommand ExportSelectedCommand { get; private set; }
        public ICommand LoadSelectedCommand { get; private set; }

        #endregion

        #region Events

        public event EventHandler<FilterConfiguration> PresetLoadRequested;

        #endregion

        #region Initialization

        protected override void InitializeCommands()
        {
            SelectCategoryCommand = new RelayCommand<CategoryItem>(SelectCategory);
            LoadPresetCommand = new RelayCommand<FilterConfiguration>(preset => Task.Run(() => LoadPresetAsync(preset)));
            ToggleFavoriteCommand = new RelayCommand<FilterConfiguration>(preset => Task.Run(() => ToggleFavoriteAsync(preset)));
            DuplicatePresetCommand = new RelayCommand<FilterConfiguration>(preset => Task.Run(() => DuplicatePresetAsync(preset)));
            DeletePresetCommand = new RelayCommand<FilterConfiguration>(preset => Task.Run(() => DeletePresetAsync(preset)));
            ImportPresetCommand = new AsyncRelayCommand(ImportPresetAsync);
            ExportSelectedCommand = new AsyncRelayCommand(ExportSelectedAsync);
            LoadSelectedCommand = new RelayCommand(LoadSelected, () => HasSelection);
        }

        private void SetupCollectionView()
        {
            FilteredPresets = CollectionViewSource.GetDefaultView(_allPresets);
            FilteredPresets.Filter = FilterPreset;
        }

        private void SetupSortOptions()
        {
            SortOptions = new List<FilterPresetSortOption>
            {
                new FilterPresetSortOption("Name", "Name", ListSortDirection.Ascending),
                new FilterPresetSortOption("Recent", "LastModified", ListSortDirection.Descending),
                new FilterPresetSortOption("Most Used", "UsageCount", ListSortDirection.Descending),
                new FilterPresetSortOption("Category", "Category", ListSortDirection.Ascending),
                new FilterPresetSortOption("Created", "CreatedDate", ListSortDirection.Descending)
            };
            
            SortOption = SortOptions.First();
        }

        #endregion

        #region Public Methods

        public async Task LoadPresetsAsync()
        {
            try
            {
                IsLoading = true;
                
                var presets = await _filterService.GetSavedFiltersAsync();
                var categories = await _filterService.GetFilterCategoriesAsync();
                
                _allPresets.Clear();
                foreach (var preset in presets)
                {
                    _allPresets.Add(preset);
                }

                UpdateCategories(categories);
                ApplyFilters();
                ApplySorting();
                
                StatusMessage = $"Loaded {presets.Count} presets";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading presets");
                ErrorMessage = $"Failed to load presets: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        #endregion

        #region Private Methods

        private void SelectCategory(CategoryItem category)
        {
            // Deselect all categories
            foreach (var cat in Categories)
            {
                cat.IsSelected = false;
            }
            
            // Select the clicked category
            if (category != null)
            {
                category.IsSelected = true;
                SelectedCategory = category;
            }
        }

        private async Task LoadPresetAsync(FilterConfiguration preset)
        {
            if (preset == null) return;

            try
            {
                await _filterService.MarkFilterAsUsedAsync(preset.Id);
                PresetLoadRequested?.Invoke(this, preset);
                
                StatusMessage = $"Loaded preset: {preset.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading preset: {PresetName}", preset.Name);
                ErrorMessage = $"Failed to load preset: {ex.Message}";
            }
        }

        private async Task ToggleFavoriteAsync(FilterConfiguration preset)
        {
            if (preset == null) return;

            try
            {
                await _filterService.ToggleFavoriteAsync(preset.Id);
                preset.IsFavorite = !preset.IsFavorite;
                
                StatusMessage = preset.IsFavorite ? "Added to favorites" : "Removed from favorites";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error toggling favorite for preset: {PresetName}", preset.Name);
                ErrorMessage = $"Failed to update favorite status: {ex.Message}";
            }
        }

        private async Task DuplicatePresetAsync(FilterConfiguration preset)
        {
            if (preset == null) return;

            try
            {
                var duplicate = new FilterConfiguration
                {
                    Name = $"{preset.Name} (Copy)",
                    Description = preset.Description,
                    Category = preset.Category,
                    Tags = new List<string>(preset.Tags),
                    Rules = preset.Rules.Select(r => new FilterRule
                    {
                        PropertyName = r.PropertyName,
                        Operator = r.Operator,
                        Value = r.Value,
                        SecondaryValue = r.SecondaryValue,
                        DataType = r.DataType,
                        IsEnabled = r.IsEnabled
                    }).ToList(),
                    Logic = preset.Logic
                };

                var saved = await _filterService.SaveFilterAsync(duplicate.Name, duplicate);
                _allPresets.Add(saved);
                
                StatusMessage = $"Duplicated preset: {preset.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error duplicating preset: {PresetName}", preset.Name);
                ErrorMessage = $"Failed to duplicate preset: {ex.Message}";
            }
        }

        private async Task DeletePresetAsync(FilterConfiguration preset)
        {
            if (preset == null) return;

            var result = System.Windows.MessageBox.Show(
                $"Are you sure you want to delete the preset '{preset.Name}'?",
                "Confirm Delete",
                System.Windows.MessageBoxButton.YesNo,
                System.Windows.MessageBoxImage.Warning);

            if (result != System.Windows.MessageBoxResult.Yes) return;

            try
            {
                await _filterService.DeleteFilterAsync(preset.Id);
                _allPresets.Remove(preset);
                
                if (SelectedPreset?.Id == preset.Id)
                {
                    SelectedPreset = null;
                }
                
                StatusMessage = $"Deleted preset: {preset.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting preset: {PresetName}", preset.Name);
                ErrorMessage = $"Failed to delete preset: {ex.Message}";
            }
        }

        private async Task ImportPresetAsync()
        {
            try
            {
                var dialog = new Microsoft.Win32.OpenFileDialog
                {
                    Title = "Import Filter Preset",
                    Filter = "JSON Files (*.json)|*.json|All Files (*.*)|*.*",
                    Multiselect = true
                };

                if (dialog.ShowDialog() != true) return;

                foreach (var fileName in dialog.FileNames)
                {
                    var json = await System.IO.File.ReadAllTextAsync(fileName);
                    var preset = System.Text.Json.JsonSerializer.Deserialize<FilterConfiguration>(json);
                    
                    if (preset != null)
                    {
                        // Ensure unique ID and name
                        preset.Id = Guid.NewGuid().ToString();
                        preset.Name = await GetUniquePresetName(preset.Name);
                        
                        var saved = await _filterService.SaveFilterAsync(preset.Name, preset);
                        _allPresets.Add(saved);
                    }
                }
                
                StatusMessage = $"Imported {dialog.FileNames.Length} preset(s)";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error importing presets");
                ErrorMessage = $"Failed to import presets: {ex.Message}";
            }
        }

        private async Task ExportSelectedAsync()
        {
            if (SelectedPreset == null) return;

            try
            {
                var dialog = new Microsoft.Win32.SaveFileDialog
                {
                    Title = "Export Filter Preset",
                    FileName = $"{SelectedPreset.Name}.json",
                    Filter = "JSON Files (*.json)|*.json",
                    DefaultExt = "json"
                };

                if (dialog.ShowDialog() != true) return;

                var json = System.Text.Json.JsonSerializer.Serialize(SelectedPreset, new System.Text.Json.JsonSerializerOptions
                {
                    WriteIndented = true
                });
                
                await System.IO.File.WriteAllTextAsync(dialog.FileName, json);
                StatusMessage = $"Exported preset: {SelectedPreset.Name}";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting preset: {PresetName}", SelectedPreset.Name);
                ErrorMessage = $"Failed to export preset: {ex.Message}";
            }
        }

        private void LoadSelected()
        {
            if (SelectedPreset != null)
            {
                _ = LoadPresetAsync(SelectedPreset);
            }
        }

        private async Task<string> GetUniquePresetName(string baseName)
        {
            var existingNames = _allPresets.Select(p => p.Name).ToHashSet();
            
            if (!existingNames.Contains(baseName))
                return baseName;

            var counter = 1;
            string uniqueName;
            
            do
            {
                uniqueName = $"{baseName} ({counter++})";
            }
            while (existingNames.Contains(uniqueName));

            return uniqueName;
        }

        private void UpdateCategories(List<string> categoryNames)
        {
            Categories.Clear();
            
            // Add "All" category
            Categories.Add(new CategoryItem("All", true));
            
            // Add specific categories
            foreach (var categoryName in categoryNames)
            {
                Categories.Add(new CategoryItem(categoryName, false));
            }
        }

        private void ApplyFilters()
        {
            FilteredPresets?.Refresh();
        }

        private void ApplySorting()
        {
            if (FilteredPresets?.SortDescriptions == null || SortOption == null) return;

            FilteredPresets.SortDescriptions.Clear();
            FilteredPresets.SortDescriptions.Add(new SortDescription(
                SortOption.PropertyName, 
                SortOption.Direction));
        }

        private bool FilterPreset(object obj)
        {
            if (obj is not FilterConfiguration preset) return false;

            // Category filter
            if (SelectedCategory != null && SelectedCategory.Name != "All")
            {
                if (!string.Equals(preset.Category, SelectedCategory.Name, StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            // Search filter
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchLower = SearchText.ToLower();
                if (!preset.Name?.ToLower().Contains(searchLower) == true &&
                    !preset.Description?.ToLower().Contains(searchLower) == true &&
                    !preset.Tags?.Any(t => t.ToLower().Contains(searchLower)) == true)
                    return false;
            }

            // Favorites filter
            if (ShowFavoritesOnly && !preset.IsFavorite)
                return false;

            // Recent filter (last 30 days)
            if (ShowRecentOnly && preset.LastModified < DateTime.Now.AddDays(-30))
                return false;

            return true;
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                FilteredPresets = null;
            }
            base.Dispose(disposing);
        }
    }

    public class CategoryItem
    {
        public string Name { get; set; }
        public bool IsSelected { get; set; }

        public CategoryItem(string name, bool isSelected)
        {
            Name = name;
            IsSelected = isSelected;
        }
    }

    public class FilterPresetSortOption
    {
        public string DisplayName { get; set; }
        public string PropertyName { get; set; }
        public ListSortDirection Direction { get; set; }

        public FilterPresetSortOption(string displayName, string propertyName, ListSortDirection direction)
        {
            DisplayName = displayName;
            PropertyName = propertyName;
            Direction = direction;
        }
    }
}