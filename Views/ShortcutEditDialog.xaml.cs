using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

#pragma warning disable CS0618 // SimpleServiceLocator is obsolete

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ShortcutEditDialog.xaml
    /// </summary>
    public partial class ShortcutEditDialog : Window, INotifyPropertyChanged
    {
        private readonly IKeyboardShortcutService _shortcutService;
        private KeyboardShortcut _editingShortcut;
        private KeyboardShortcut _originalShortcut;
        private List<KeyboardShortcut> _conflictingShortcuts;
        private bool _hasConflict;
        private string _conflictMessage;

        public ShortcutEditDialog(KeyboardShortcut shortcut)
        {
            InitializeComponent();
            DataContext = this;
            
            _shortcutService = SimpleServiceLocator.Instance.GetService<IKeyboardShortcutService>();
            _originalShortcut = shortcut ?? throw new ArgumentNullException(nameof(shortcut));
            
            // Create a copy for editing
            EditingShortcut = new KeyboardShortcut
            {
                Id = _originalShortcut.Id,
                ActionId = _originalShortcut.ActionId,
                DisplayName = _originalShortcut.DisplayName,
                Description = _originalShortcut.Description,
                ModifierKeys = _originalShortcut.ModifierKeys,
                Key = _originalShortcut.Key,
                IsEnabled = _originalShortcut.IsEnabled,
                IsGlobal = _originalShortcut.IsGlobal,
                Context = _originalShortcut.Context,
                Category = _originalShortcut.Category,
                Priority = _originalShortcut.Priority,
                IsCustomizable = _originalShortcut.IsCustomizable,
                IsDefault = _originalShortcut.IsDefault
            };
            
            ConflictingShortcuts = new List<KeyboardShortcut>();
            
            // Check for initial conflicts
            _ = CheckConflictsAsync();
        }

        #region Properties

        public KeyboardShortcut EditingShortcut
        {
            get => _editingShortcut;
            set
            {
                if (SetProperty(ref _editingShortcut, value))
                {
                    _ = CheckConflictsAsync();
                }
            }
        }

        public List<KeyboardShortcut> ConflictingShortcuts
        {
            get => _conflictingShortcuts;
            set => SetProperty(ref _conflictingShortcuts, value);
        }

        public bool HasConflict
        {
            get => _hasConflict;
            set => SetProperty(ref _hasConflict, value);
        }

        public string ConflictMessage
        {
            get => _conflictMessage;
            set => SetProperty(ref _conflictMessage, value);
        }

        public Array Categories => Enum.GetValues(typeof(KeyboardShortcutCategory));

        #endregion

        #region Event Handlers

        private void ShortcutTextBox_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            e.Handled = true;
            
            var key = e.Key;
            var modifiers = Keyboard.Modifiers;
            
            // Handle special keys
            if (key == Key.System)
            {
                key = e.SystemKey;
            }
            
            // Ignore modifier-only keys
            if (key == Key.LeftCtrl || key == Key.RightCtrl ||
                key == Key.LeftAlt || key == Key.RightAlt ||
                key == Key.LeftShift || key == Key.RightShift ||
                key == Key.LWin || key == Key.RWin)
            {
                return;
            }
            
            // Update the shortcut
            EditingShortcut.ModifierKeys = modifiers;
            EditingShortcut.Key = key;
            
            OnPropertyChanged(nameof(EditingShortcut));
        }

        private void ClearShortcut_Click(object sender, RoutedEventArgs e)
        {
            EditingShortcut.ModifierKeys = ModifierKeys.None;
            EditingShortcut.Key = Key.None;
            OnPropertyChanged(nameof(EditingShortcut));
        }

        private void TestShortcut_Click(object sender, RoutedEventArgs e)
        {
            if (EditingShortcut.Key != Key.None)
            {
                var result = _shortcutService.TryExecuteShortcut(
                    EditingShortcut.ModifierKeys, 
                    EditingShortcut.Key, 
                    EditingShortcut.Context);
                    
                MessageBox.Show(result ? "Shortcut executed successfully!" : "Shortcut not found or disabled.", 
                               "Test Result", MessageBoxButton.OK, 
                               result ? MessageBoxImage.Information : MessageBoxImage.Warning);
            }
            else
            {
                MessageBox.Show("Please assign a key combination first.", "Test Shortcut", 
                               MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private async void OK_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Validate the shortcut
                if (string.IsNullOrWhiteSpace(EditingShortcut.DisplayName))
                {
                    MessageBox.Show("Please enter a name for the shortcut.", "Validation Error", 
                                   MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (EditingShortcut.Key == Key.None)
                {
                    var result = MessageBox.Show("No key combination assigned. Continue anyway?", 
                                                "Confirm", MessageBoxButton.YesNo, MessageBoxImage.Question);
                    if (result == MessageBoxResult.No)
                        return;
                }

                // Check for conflicts if key changed
                if (EditingShortcut.ModifierKeys != _originalShortcut.ModifierKeys || 
                    EditingShortcut.Key != _originalShortcut.Key)
                {
                    await CheckConflictsAsync();
                    
                    if (HasConflict)
                    {
                        var result = MessageBox.Show($"This shortcut conflicts with existing shortcuts:\n\n{ConflictMessage}\n\nContinue anyway?", 
                                                    "Conflict Warning", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                        if (result == MessageBoxResult.No)
                            return;
                    }
                }

                // Apply changes to original
                _originalShortcut.DisplayName = EditingShortcut.DisplayName;
                _originalShortcut.Description = EditingShortcut.Description;
                _originalShortcut.ModifierKeys = EditingShortcut.ModifierKeys;
                _originalShortcut.Key = EditingShortcut.Key;
                _originalShortcut.IsEnabled = EditingShortcut.IsEnabled;
                _originalShortcut.IsGlobal = EditingShortcut.IsGlobal;
                _originalShortcut.Context = EditingShortcut.Context;
                _originalShortcut.Category = EditingShortcut.Category;
                _originalShortcut.Priority = EditingShortcut.Priority;

                // Update in service
                await _shortcutService.UpdateShortcutAsync(_originalShortcut);

                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error saving shortcut: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        #endregion

        #region Private Methods

        private async System.Threading.Tasks.Task CheckConflictsAsync()
        {
            try
            {
                if (EditingShortcut?.Key == Key.None)
                {
                    HasConflict = false;
                    ConflictingShortcuts = new List<KeyboardShortcut>();
                    ConflictMessage = string.Empty;
                    return;
                }

                var conflicts = await _shortcutService.DetectConflictsForShortcutAsync(EditingShortcut);
                
                // Filter out conflicts with the original shortcut (self-conflict)
                var actualConflicts = conflicts.Where(c => 
                    (c.Shortcut1?.Id != EditingShortcut.Id) && 
                    (c.Shortcut2?.Id != EditingShortcut.Id)).ToList();

                HasConflict = actualConflicts.Any();
                
                if (HasConflict)
                {
                    ConflictingShortcuts = actualConflicts.SelectMany(c => 
                        new[] { c.Shortcut1, c.Shortcut2 }
                        .Where(s => s != null && s.Id != EditingShortcut.Id))
                        .Distinct()
                        .ToList();
                        
                    ConflictMessage = string.Join("\n", actualConflicts.Select(c => c.Description));
                }
                else
                {
                    ConflictingShortcuts = new List<KeyboardShortcut>();
                    ConflictMessage = string.Empty;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error checking conflicts: {ex.Message}");
            }
        }

        #endregion

        #region INotifyPropertyChanged Implementation

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        #endregion
    }
}