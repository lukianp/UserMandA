using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the keyboard shortcuts dialog
    /// </summary>
    public partial class KeyboardShortcutsDialogViewModel : BaseViewModel
    {
        private readonly KeyboardShortcutService _shortcutService;
        private string _searchText = "";
        private ObservableCollection<ShortcutCategoryViewModel> _shortcutCategories;
        private ObservableCollection<ShortcutCategoryViewModel> _filteredCategories;

        public KeyboardShortcutsDialogViewModel() : base()
        {
            _shortcutService = ServiceLocator.GetService<KeyboardShortcutService>();
            
            InitializeCommands();
            LoadShortcuts();
        }

        #region Properties

        public string SearchText
        {
            get => _searchText;
            set
            {
                SetProperty(ref _searchText, value);
                FilterShortcuts();
            }
        }

        public ObservableCollection<ShortcutCategoryViewModel> ShortcutCategories
        {
            get => _filteredCategories ?? _shortcutCategories;
            set => SetProperty(ref _shortcutCategories, value);
        }

        public int ShortcutCount => ShortcutCategories?.SelectMany(c => c.Shortcuts).Count() ?? 0;

        #endregion

        #region Commands

        public ICommand ExportShortcutsCommand { get; private set; }
        public ICommand ResetToDefaultsCommand { get; private set; }
        public ICommand EditShortcutCommand { get; private set; }
        public ICommand PrintShortcutsCommand { get; private set; }

        #endregion

        #region Private Methods

        protected override void InitializeCommands()
        {
            ExportShortcutsCommand = new RelayCommand(ExportShortcuts);
            ResetToDefaultsCommand = new RelayCommand(ResetToDefaults);
            EditShortcutCommand = new RelayCommand<ShortcutViewModel>(EditShortcut);
            PrintShortcutsCommand = new RelayCommand(PrintShortcuts);
        }

        private void LoadShortcuts()
        {
            try
            {
                var shortcutsByCategory = _shortcutService.GetShortcutsByCategory();
                var categories = new ObservableCollection<ShortcutCategoryViewModel>();

                foreach (var category in shortcutsByCategory.OrderBy(kvp => GetCategoryOrder(kvp.Key)))
                {
                    var categoryViewModel = new ShortcutCategoryViewModel
                    {
                        CategoryName = category.Key,
                        Shortcuts = new ObservableCollection<ShortcutViewModel>()
                    };

                    foreach (var shortcut in category.Value.OrderBy(s => s.DisplayName))
                    {
                        var shortcutViewModel = new ShortcutViewModel
                        {
                            Name = shortcut.DisplayName,
                            Description = shortcut.Description,
                            KeyGesture = shortcut.KeyCombination,
                            KeyParts = ParseKeyGesture(shortcut.KeyCombination),
                            Category = shortcut.Category.ToString(),
                            IsCustom = !shortcut.IsDefault
                        };

                        categoryViewModel.Shortcuts.Add(shortcutViewModel);
                    }

                    if (categoryViewModel.Shortcuts.Count > 0)
                    {
                        categories.Add(categoryViewModel);
                    }
                }

                ShortcutCategories = categories;
                OnPropertyChanged(nameof(ShortcutCount));
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error loading shortcuts for dialog");
            }
        }

        private int GetCategoryOrder(string category)
        {
            return category switch
            {
                "Navigation" => 1,
                "Actions" => 2,
                "File" => 3,
                "Edit" => 4,
                "View" => 5,
                "Discovery" => 6,
                "Advanced" => 7,
                "Quick" => 8,
                "Help" => 9,
                _ => 10
            };
        }

        private List<string> ParseKeyGesture(string keyGesture)
        {
            var parts = new List<string>();
            
            if (keyGesture.Contains("Ctrl"))
                parts.Add("Ctrl");
            if (keyGesture.Contains("Alt"))
                parts.Add("Alt");
            if (keyGesture.Contains("Shift"))
                parts.Add("Shift");
            if (keyGesture.Contains("Win"))
                parts.Add("Win");

            // Extract the key part (after the last '+')
            var keyPart = keyGesture.Split('+').LastOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(keyPart))
            {
                // Format special keys
                keyPart = keyPart switch
                {
                    "OemComma" => ",",
                    "OemPeriod" => ".",
                    "OemQuestion" => "?",
                    "OemPlus" => "+",
                    "OemMinus" => "-",
                    "D0" => "0",
                    "D1" => "1",
                    "D2" => "2",
                    "D3" => "3",
                    "D4" => "4",
                    "D5" => "5",
                    "D6" => "6",
                    "D7" => "7",
                    "D8" => "8",
                    "D9" => "9",
                    _ => keyPart
                };
                parts.Add(keyPart);
            }

            return parts;
        }

        private void FilterShortcuts()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(SearchText))
                {
                    _filteredCategories = null;
                    OnPropertyChanged(nameof(ShortcutCategories));
                    OnPropertyChanged(nameof(ShortcutCount));
                    return;
                }

                var searchLower = SearchText.ToLowerInvariant();
                var filteredCategories = new ObservableCollection<ShortcutCategoryViewModel>();

                foreach (var category in _shortcutCategories)
                {
                    var filteredShortcuts = category.Shortcuts
                        .Where(s => s.Name.ToLowerInvariant().Contains(searchLower) ||
                                   s.Description.ToLowerInvariant().Contains(searchLower) ||
                                   s.KeyGesture.ToLowerInvariant().Contains(searchLower))
                        .ToList();

                    if (filteredShortcuts.Any())
                    {
                        var filteredCategory = new ShortcutCategoryViewModel
                        {
                            CategoryName = category.CategoryName,
                            Shortcuts = new ObservableCollection<ShortcutViewModel>(filteredShortcuts)
                        };
                        filteredCategories.Add(filteredCategory);
                    }
                }

                _filteredCategories = filteredCategories;
                OnPropertyChanged(nameof(ShortcutCategories));
                OnPropertyChanged(nameof(ShortcutCount));
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error filtering shortcuts");
            }
        }

        private void ExportShortcuts()
        {
            try
            {
                var dialog = new SaveFileDialog
                {
                    Title = "Export Keyboard Shortcuts",
                    Filter = "JSON Files (*.json)|*.json|Text Files (*.txt)|*.txt",
                    DefaultExt = ".json",
                    FileName = "keyboard-shortcuts.json"
                };

                if (dialog.ShowDialog() == true)
                {
                    _shortcutService.ExportShortcuts(dialog.FileName);
                    Logger?.LogInformation("Exported keyboard shortcuts to {FilePath}", dialog.FileName);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error exporting keyboard shortcuts");
            }
        }

        private void ResetToDefaults()
        {
            try
            {
                var result = System.Windows.MessageBox.Show(
                    "This will reset all keyboard shortcuts to their default values. Any custom shortcuts will be lost.\n\nAre you sure you want to continue?",
                    "Reset Keyboard Shortcuts",
                    System.Windows.MessageBoxButton.YesNo,
                    System.Windows.MessageBoxImage.Warning);

                if (result == System.Windows.MessageBoxResult.Yes)
                {
                    _shortcutService.ResetToDefaults();
                    LoadShortcuts();
                    Logger?.LogInformation("Reset keyboard shortcuts to defaults");
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error resetting keyboard shortcuts to defaults");
            }
        }

        private void EditShortcut(ShortcutViewModel shortcut)
        {
            try
            {
                // TODO: Implement shortcut editing dialog
                Logger?.LogInformation("Edit shortcut requested for: {ShortcutName}", shortcut?.Name);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error editing shortcut: {ShortcutName}", shortcut?.Name);
            }
        }

        private void PrintShortcuts()
        {
            try
            {
                // TODO: Implement print functionality
                Logger?.LogInformation("Print shortcuts requested");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error printing shortcuts");
            }
        }

        #endregion
    }

    /// <summary>
    /// ViewModel for a shortcut category
    /// </summary>
    public class ShortcutCategoryViewModel
    {
        public string CategoryName { get; set; }
        public ObservableCollection<ShortcutViewModel> Shortcuts { get; set; }
    }

    /// <summary>
    /// ViewModel for a single shortcut
    /// </summary>
    public class ShortcutViewModel
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string KeyGesture { get; set; }
        public List<string> KeyParts { get; set; }
        public string Category { get; set; }
        public bool IsCustom { get; set; }
    }
}