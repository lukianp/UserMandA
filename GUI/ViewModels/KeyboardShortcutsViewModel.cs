using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.ViewModels
{
    public class KeyboardShortcutsViewModel : BaseViewModel
    {
        private readonly IKeyboardShortcutService _shortcutService;
        private ObservableCollection<KeyboardShortcut> _shortcuts;
        private ObservableCollection<KeyboardShortcutGroup> _shortcutGroups;
        private ObservableCollection<ShortcutConflict> _conflicts;
        private ICollectionView _shortcutsView;
        private KeyboardShortcut _selectedShortcut;
        private KeyboardShortcutSettings _settings;
        private string _searchText;
        private KeyboardShortcutCategory? _selectedCategory;
        private bool _showConflictsOnly;
        private bool _isLoading;

        public KeyboardShortcutsViewModel()
        {
            _shortcutService = SimpleServiceLocator.GetService<IKeyboardShortcutService>();
            
            Shortcuts = new ObservableCollection<KeyboardShortcut>();
            ShortcutGroups = new ObservableCollection<KeyboardShortcutGroup>();
            Conflicts = new ObservableCollection<ShortcutConflict>();
            
            InitializeCommands();
            _ = LoadDataAsync();
        }

        #region Properties

        public ObservableCollection<KeyboardShortcut> Shortcuts
        {
            get => _shortcuts;
            set => SetProperty(ref _shortcuts, value);
        }

        public ObservableCollection<KeyboardShortcutGroup> ShortcutGroups
        {
            get => _shortcutGroups;
            set => SetProperty(ref _shortcutGroups, value);
        }

        public ObservableCollection<ShortcutConflict> Conflicts
        {
            get => _conflicts;
            set => SetProperty(ref _conflicts, value);
        }

        public ICollectionView ShortcutsView
        {
            get => _shortcutsView;
            set => SetProperty(ref _shortcutsView, value);
        }

        public KeyboardShortcut SelectedShortcut
        {
            get => _selectedShortcut;
            set => SetProperty(ref _selectedShortcut, value);
        }

        public KeyboardShortcutSettings Settings
        {
            get => _settings;
            set => SetProperty(ref _settings, value);
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

        public KeyboardShortcutCategory? SelectedCategory
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

        public bool ShowConflictsOnly
        {
            get => _showConflictsOnly;
            set
            {
                if (SetProperty(ref _showConflictsOnly, value))
                {
                    ApplyFilters();
                }
            }
        }

        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public Array Categories => Enum.GetValues(typeof(KeyboardShortcutCategory));

        #endregion

        #region Commands

        public ICommand RefreshCommand { get; private set; }
        public ICommand SaveSettingsCommand { get; private set; }
        public ICommand ResetToDefaultsCommand { get; private set; }
        public ICommand ExportShortcutsCommand { get; private set; }
        public ICommand ImportShortcutsCommand { get; private set; }
        public ICommand EditShortcutCommand { get; private set; }
        public ICommand DeleteShortcutCommand { get; private set; }
        public ICommand AddShortcutCommand { get; private set; }
        public ICommand ResolveConflictCommand { get; private set; }
        public ICommand DetectConflictsCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        public ICommand LoadPresetCommand { get; private set; }
        public ICommand SavePresetCommand { get; private set; }

        protected override void InitializeCommands()
        {
            RefreshCommand = new RelayCommand(async () => await LoadDataAsync());
            SaveSettingsCommand = new RelayCommand(async () => await SaveSettingsAsync(), () => Settings != null);
            ResetToDefaultsCommand = new RelayCommand(async () => await ResetToDefaultsAsync());
            ExportShortcutsCommand = new RelayCommand(async () => await ExportShortcutsAsync());
            ImportShortcutsCommand = new RelayCommand(async () => await ImportShortcutsAsync());
            EditShortcutCommand = new RelayCommand<KeyboardShortcut>(EditShortcut, s => s != null);
            DeleteShortcutCommand = new RelayCommand<KeyboardShortcut>(async s => await DeleteShortcutAsync(s), s => s != null && s.IsCustomizable);
            AddShortcutCommand = new RelayCommand(AddShortcut);
            ResolveConflictCommand = new RelayCommand<ShortcutConflict>(async c => await ResolveConflictAsync(c), c => c != null);
            DetectConflictsCommand = new RelayCommand(async () => await DetectConflictsAsync());
            ClearFiltersCommand = new RelayCommand(ClearFilters);
            LoadPresetCommand = new RelayCommand<string>(async preset => await LoadPresetAsync(preset));
            SavePresetCommand = new RelayCommand(async () => await SavePresetAsync());
        }

        #endregion

        #region Public Methods

        public async Task LoadDataAsync()
        {
            IsLoading = true;
            try
            {
                var shortcuts = await _shortcutService.GetAllShortcutsAsync();
                var settings = await _shortcutService.GetSettingsAsync();
                var conflicts = await _shortcutService.DetectConflictsAsync();

                Shortcuts.Clear();
                foreach (var shortcut in shortcuts)
                {
                    Shortcuts.Add(shortcut);
                }

                Settings = settings;

                Conflicts.Clear();
                foreach (var conflict in conflicts)
                {
                    Conflicts.Add(conflict);
                }

                await LoadShortcutGroupsAsync();
                SetupCollectionView();
            }
            catch (Exception ex)
            {
                // Handle error
                System.Diagnostics.Debug.WriteLine($"Error loading shortcuts: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        public async Task SaveSettingsAsync()
        {
            if (Settings != null)
            {
                await _shortcutService.UpdateSettingsAsync(Settings);
            }
        }

        public async Task ResetToDefaultsAsync()
        {
            await _shortcutService.ResetToDefaultsAsync();
            await LoadDataAsync();
        }

        public async Task ExportShortcutsAsync()
        {
            try
            {
                var json = await _shortcutService.ExportShortcutsAsync();
                // Implementation would show save file dialog and save the JSON
                System.Diagnostics.Debug.WriteLine("Exported shortcuts: " + json);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error exporting shortcuts: {ex.Message}");
            }
        }

        public async Task ImportShortcutsAsync()
        {
            try
            {
                // Implementation would show open file dialog and load JSON
                // For now, using a placeholder
                var json = "[]"; // Placeholder
                await _shortcutService.ImportShortcutsAsync(json);
                await LoadDataAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error importing shortcuts: {ex.Message}");
            }
        }

        #endregion

        #region Private Methods

        private async Task LoadShortcutGroupsAsync()
        {
            ShortcutGroups.Clear();
            var categories = Enum.GetValues(typeof(KeyboardShortcutCategory)).Cast<KeyboardShortcutCategory>();
            
            foreach (var category in categories)
            {
                var group = await _shortcutService.GetShortcutGroupAsync(category);
                if (group != null)
                {
                    ShortcutGroups.Add(group);
                }
            }
        }

        private void SetupCollectionView()
        {
            ShortcutsView = CollectionViewSource.GetDefaultView(Shortcuts);
            ShortcutsView.Filter = FilterShortcuts;
            ShortcutsView.GroupDescriptions.Clear();
            ShortcutsView.GroupDescriptions.Add(new PropertyGroupDescription(nameof(KeyboardShortcut.Category)));
        }

        private bool FilterShortcuts(object obj)
        {
            if (obj is not KeyboardShortcut shortcut) return false;

            // Search text filter
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchLower = SearchText.ToLower();
                if (!shortcut.DisplayName.ToLower().Contains(searchLower) &&
                    !shortcut.Description?.ToLower().Contains(searchLower) == true &&
                    !shortcut.KeyCombination.ToLower().Contains(searchLower))
                {
                    return false;
                }
            }

            // Category filter
            if (SelectedCategory.HasValue && shortcut.Category != SelectedCategory.Value)
            {
                return false;
            }

            // Conflicts filter
            if (ShowConflictsOnly)
            {
                var hasConflict = Conflicts.Any(c => 
                    c.Shortcut1?.Id == shortcut.Id || c.Shortcut2?.Id == shortcut.Id);
                if (!hasConflict)
                {
                    return false;
                }
            }

            return true;
        }

        private void ApplyFilters()
        {
            ShortcutsView?.Refresh();
        }

        private void ClearFilters()
        {
            SearchText = string.Empty;
            SelectedCategory = null;
            ShowConflictsOnly = false;
        }

        private void EditShortcut(KeyboardShortcut shortcut)
        {
            if (shortcut == null) return;

            try
            {
                var dialog = new MandADiscoverySuite.Views.ShortcutEditDialog(shortcut);
                var result = dialog.ShowDialog();
                
                if (result == true)
                {
                    // Refresh the data to reflect changes
                    _ = LoadDataAsync();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error editing shortcut: {ex.Message}");
            }
        }

        private async Task DeleteShortcutAsync(KeyboardShortcut shortcut)
        {
            if (shortcut == null || !shortcut.IsCustomizable) return;

            // Implementation would show confirmation dialog
            var result = true; // Placeholder for dialog result

            if (result)
            {
                _shortcutService.UnregisterShortcut(shortcut.Id);
                Shortcuts.Remove(shortcut);
                await DetectConflictsAsync();
            }
        }

        private void AddShortcut()
        {
            // Implementation would show add shortcut dialog
            var newShortcut = new KeyboardShortcut
            {
                DisplayName = "New Shortcut",
                Category = KeyboardShortcutCategory.Custom,
                IsCustomizable = true
            };

            Shortcuts.Add(newShortcut);
            SelectedShortcut = newShortcut;
        }

        private async Task ResolveConflictAsync(ShortcutConflict conflict)
        {
            if (conflict == null) return;

            // Implementation would show conflict resolution dialog
            // For now, disable one of the conflicting shortcuts
            if (conflict.Shortcut1 != null)
            {
                conflict.Shortcut1.IsEnabled = false;
                await _shortcutService.UpdateShortcutAsync(conflict.Shortcut1);
            }

            await DetectConflictsAsync();
        }

        private async Task DetectConflictsAsync()
        {
            try
            {
                var conflicts = await _shortcutService.DetectConflictsAsync();
                Conflicts.Clear();
                foreach (var conflict in conflicts)
                {
                    Conflicts.Add(conflict);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error detecting conflicts: {ex.Message}");
            }
        }

        private async Task LoadPresetAsync(string presetName)
        {
            if (string.IsNullOrEmpty(presetName)) return;

            try
            {
                await _shortcutService.LoadPresetAsync(presetName);
                await LoadDataAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading preset: {ex.Message}");
            }
        }

        private async Task SavePresetAsync()
        {
            try
            {
                var presetName = "Custom Preset"; // Placeholder - would get from dialog
                await _shortcutService.SavePresetAsync(presetName, Shortcuts.ToList());
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving preset: {ex.Message}");
            }
        }

        #endregion
    }
}