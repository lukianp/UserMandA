using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Helper class for integrating keyboard shortcuts throughout the application
    /// </summary>
    public static class KeyboardShortcutIntegration
    {
        private static readonly Dictionary<Window, KeyboardShortcutManager> _windowManagers 
            = new Dictionary<Window, KeyboardShortcutManager>();

        #region Window Integration

        /// <summary>
        /// Initializes keyboard shortcuts for a window
        /// </summary>
        public static void InitializeForWindow(Window window, string context = null)
        {
            if (window == null) return;

            try
            {
                var shortcutService = SimpleServiceLocator.GetService<IKeyboardShortcutService>();
                if (shortcutService != null)
                {
                    var manager = new KeyboardShortcutManager(shortcutService);
                    manager.RegisterWindowShortcuts(window, context ?? window.GetType().Name);
                    
                    _windowManagers[window] = manager;
                    
                    // Cleanup when window closes
                    window.Closed += (s, e) => CleanupForWindow(window);
                    
                    System.Diagnostics.Debug.WriteLine($"Keyboard shortcuts initialized for {window.GetType().Name}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing shortcuts for {window.GetType().Name}: {ex.Message}");
            }
        }

        /// <summary>
        /// Cleans up keyboard shortcuts for a window
        /// </summary>
        public static void CleanupForWindow(Window window)
        {
            if (window == null) return;

            try
            {
                if (_windowManagers.TryGetValue(window, out var manager))
                {
                    manager.UnregisterWindowShortcuts(window);
                    manager.Dispose();
                    _windowManagers.Remove(window);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error cleaning up shortcuts for {window.GetType().Name}: {ex.Message}");
            }
        }

        #endregion

        #region Common Shortcuts Registration

        /// <summary>
        /// Registers common data grid shortcuts
        /// </summary>
        public static void RegisterDataGridShortcuts(IKeyboardShortcutService shortcutService)
        {
            if (shortcutService == null) return;

            var shortcuts = new (string Id, string Name, ModifierKeys Modifiers, Key Key, Action Action)[]
            {
                ("datagrid.selectall", "Select All", ModifierKeys.Control, Key.A, 
                      new Action(() => ExecuteDataGridAction("SelectAll"))),
                ("datagrid.copy", "Copy Selected", ModifierKeys.Control, Key.C, 
                      new Action(() => ExecuteDataGridAction("Copy"))),
                ("datagrid.export", "Export Data", ModifierKeys.Control, Key.E, 
                      new Action(() => ExecuteDataGridAction("Export"))),
                ("datagrid.refresh", "Refresh Data", ModifierKeys.None, Key.F5, 
                      new Action(() => ExecuteDataGridAction("Refresh"))),
                ("datagrid.delete", "Delete Selected", ModifierKeys.None, Key.Delete, 
                      new Action(() => ExecuteDataGridAction("Delete"))),
                ("datagrid.edit", "Edit Selected", ModifierKeys.None, Key.F2, 
                      new Action(() => ExecuteDataGridAction("Edit"))),
                ("datagrid.properties", "Show Properties", ModifierKeys.None, Key.Enter, 
                      new Action(() => ExecuteDataGridAction("Properties")))
            };

            foreach (var shortcut in shortcuts)
            {
                var keyboardShortcut = new KeyboardShortcut(shortcut.Id, shortcut.Name, shortcut.Modifiers, shortcut.Key)
                {
                    Category = KeyboardShortcutCategory.View,
                    Context = "DataGrid",
                    IsGlobal = false
                };

                var command = new RelayCommand(shortcut.Action);
                shortcutService.RegisterShortcut(keyboardShortcut, command);
            }
        }

        /// <summary>
        /// Registers common dialog shortcuts
        /// </summary>
        public static void RegisterDialogShortcuts(IKeyboardShortcutService shortcutService)
        {
            if (shortcutService == null) return;

            var shortcuts = new (string Id, string Name, ModifierKeys Modifiers, Key Key, Action Action)[]
            {
                ("dialog.ok", "OK/Accept", ModifierKeys.None, Key.Enter, 
                      new Action(() => ExecuteDialogAction("OK"))),
                ("dialog.cancel", "Cancel/Close", ModifierKeys.None, Key.Escape, 
                      new Action(() => ExecuteDialogAction("Cancel"))),
                ("dialog.apply", "Apply Changes", ModifierKeys.Control, Key.S, 
                      new Action(() => ExecuteDialogAction("Apply"))),
                ("dialog.reset", "Reset to Defaults", ModifierKeys.Control, Key.R, 
                      new Action(() => ExecuteDialogAction("Reset"))),
                ("dialog.help", "Show Help", ModifierKeys.None, Key.F1, 
                      new Action(() => ExecuteDialogAction("Help")))
            };

            foreach (var shortcut in shortcuts)
            {
                var keyboardShortcut = new KeyboardShortcut(shortcut.Id, shortcut.Name, shortcut.Modifiers, shortcut.Key)
                {
                    Category = KeyboardShortcutCategory.Window,
                    Context = "Dialog",
                    IsGlobal = false
                };

                var command = new RelayCommand(shortcut.Action);
                shortcutService.RegisterShortcut(keyboardShortcut, command);
            }
        }

        /// <summary>
        /// Registers common navigation shortcuts
        /// </summary>
        public static void RegisterNavigationShortcuts(IKeyboardShortcutService shortcutService)
        {
            if (shortcutService == null) return;

            var shortcuts = new[]
            {
                new { Id = "nav.dashboard", Name = "Go to Dashboard", Modifiers = ModifierKeys.Control, Key = Key.D1, 
                      Action = new Action(() => ExecuteNavigationAction("Dashboard")) },
                new { Id = "nav.discovery", Name = "Go to Discovery", Modifiers = ModifierKeys.Control, Key = Key.D2, 
                      Action = new Action(() => ExecuteNavigationAction("Discovery")) },
                new { Id = "nav.users", Name = "Go to Users", Modifiers = ModifierKeys.Control, Key = Key.D3, 
                      Action = new Action(() => ExecuteNavigationAction("Users")) },
                new { Id = "nav.computers", Name = "Go to Computers", Modifiers = ModifierKeys.Control, Key = Key.D4, 
                      Action = new Action(() => ExecuteNavigationAction("Computers")) },
                new { Id = "nav.groups", Name = "Go to Groups", Modifiers = ModifierKeys.Control, Key = Key.D5, 
                      Action = new Action(() => ExecuteNavigationAction("Groups")) },
                new { Id = "nav.reports", Name = "Go to Reports", Modifiers = ModifierKeys.Control, Key = Key.D6, 
                      Action = new Action(() => ExecuteNavigationAction("Reports")) },
                new { Id = "nav.back", Name = "Go Back", Modifiers = ModifierKeys.Alt, Key = Key.Left, 
                      Action = new Action(() => ExecuteNavigationAction("Back")) },
                new { Id = "nav.forward", Name = "Go Forward", Modifiers = ModifierKeys.Alt, Key = Key.Right, 
                      Action = new Action(() => ExecuteNavigationAction("Forward")) }
            };

            foreach (var shortcut in shortcuts)
            {
                var keyboardShortcut = new KeyboardShortcut(shortcut.Id, shortcut.Name, shortcut.Modifiers, shortcut.Key)
                {
                    Category = KeyboardShortcutCategory.Navigation,
                    Context = "Navigation",
                    IsGlobal = false
                };

                var command = new RelayCommand(shortcut.Action);
                shortcutService.RegisterShortcut(keyboardShortcut, command);
            }
        }

        /// <summary>
        /// Registers common search shortcuts
        /// </summary>
        public static void RegisterSearchShortcuts(IKeyboardShortcutService shortcutService)
        {
            if (shortcutService == null) return;

            var shortcuts = new (string Id, string Name, ModifierKeys Modifiers, Key Key, Action Action)[]
            {
                ("search.find", "Find/Search", ModifierKeys.Control, Key.F, 
                      new Action(() => ExecuteSearchAction("Find"))),
                ("search.advanced", "Advanced Search", ModifierKeys.Control | ModifierKeys.Shift, Key.F, 
                      new Action(() => ExecuteSearchAction("Advanced"))),
                ("search.clear", "Clear Search", ModifierKeys.None, Key.Escape, 
                      new Action(() => ExecuteSearchAction("Clear"))),
                ("search.next", "Find Next", ModifierKeys.None, Key.F3, 
                      new Action(() => ExecuteSearchAction("Next"))),
                ("search.previous", "Find Previous", ModifierKeys.Shift, Key.F3, 
                      new Action(() => ExecuteSearchAction("Previous"))),
                ("search.global", "Global Search", ModifierKeys.Control, Key.G, 
                      new Action(() => ExecuteSearchAction("Global")))
            };

            foreach (var shortcut in shortcuts)
            {
                var keyboardShortcut = new KeyboardShortcut(shortcut.Id, shortcut.Name, shortcut.Modifiers, shortcut.Key)
                {
                    Category = KeyboardShortcutCategory.Search,
                    Context = "Search",
                    IsGlobal = false
                };

                var command = new RelayCommand(shortcut.Action);
                shortcutService.RegisterShortcut(keyboardShortcut, command);
            }
        }

        #endregion

        #region Action Execution Helpers

        private static void ExecuteDataGridAction(string action)
        {
            try
            {
                var activeWindow = Application.Current.Windows.OfType<Window>()
                    .FirstOrDefault(w => w.IsActive);
                
                if (activeWindow?.DataContext is BaseViewModel viewModel)
                {
                    // Use reflection to find and execute appropriate command
                    var commandName = $"{action}Command";
                    var property = viewModel.GetType().GetProperty(commandName);
                    if (property?.GetValue(viewModel) is ICommand command && command.CanExecute(null))
                    {
                        command.Execute(null);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error executing DataGrid action {action}: {ex.Message}");
            }
        }

        private static void ExecuteDialogAction(string action)
        {
            try
            {
                var activeWindow = Application.Current.Windows.OfType<Window>()
                    .FirstOrDefault(w => w.IsActive);

                if (activeWindow != null)
                {
                    switch (action)
                    {
                        case "OK":
                            activeWindow.DialogResult = true;
                            break;
                        case "Cancel":
                            activeWindow.DialogResult = false;
                            break;
                        case "Apply":
                            // Look for Apply command in DataContext
                            if (activeWindow.DataContext is BaseViewModel viewModel)
                            {
                                var applyCommand = viewModel.GetType().GetProperty("ApplyCommand")?.GetValue(viewModel) as ICommand;
                                if (applyCommand?.CanExecute(null) == true)
                                {
                                    applyCommand.Execute(null);
                                }
                            }
                            break;
                        case "Reset":
                            // Look for Reset command in DataContext
                            if (activeWindow.DataContext is BaseViewModel viewModel2)
                            {
                                var resetCommand = viewModel2.GetType().GetProperty("ResetCommand")?.GetValue(viewModel2) as ICommand;
                                if (resetCommand?.CanExecute(null) == true)
                                {
                                    resetCommand.Execute(null);
                                }
                            }
                            break;
                        case "Help":
                            // Show context-specific help
                            ShowContextualHelp(activeWindow);
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error executing Dialog action {action}: {ex.Message}");
            }
        }

        private static void ExecuteNavigationAction(string target)
        {
            try
            {
                var mainWindow = Application.Current.MainWindow;
                if (mainWindow?.DataContext is MainViewModel mainViewModel)
                {
                    switch (target)
                    {
                        case "Back":
                            // Implementation for back navigation
                            break;
                        case "Forward":
                            // Implementation for forward navigation
                            break;
                        default:
                            mainViewModel.NavigateCommand?.Execute(target);
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error executing Navigation action {target}: {ex.Message}");
            }
        }

        private static void ExecuteSearchAction(string action)
        {
            try
            {
                var activeWindow = Application.Current.Windows.OfType<Window>()
                    .FirstOrDefault(w => w.IsActive);

                if (activeWindow?.DataContext is BaseViewModel viewModel)
                {
                    switch (action)
                    {
                        case "Find":
                            // Focus search box or show search dialog
                            FocusSearchControl(activeWindow);
                            break;
                        case "Advanced":
                            // Show advanced search dialog
                            var advancedCommand = viewModel.GetType().GetProperty("ShowAdvancedSearchCommand")?.GetValue(viewModel) as ICommand;
                            if (advancedCommand?.CanExecute(null) == true)
                            {
                                advancedCommand.Execute(null);
                            }
                            break;
                        case "Clear":
                            // Clear search
                            var clearCommand = viewModel.GetType().GetProperty("ClearSearchCommand")?.GetValue(viewModel) as ICommand;
                            if (clearCommand?.CanExecute(null) == true)
                            {
                                clearCommand.Execute(null);
                            }
                            break;
                        case "Global":
                            // Show global search
                            var globalSearchService = SimpleServiceLocator.GetService<IGlobalSearchService>();
                            // Implementation would show global search UI
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error executing Search action {action}: {ex.Message}");
            }
        }

        private static void FocusSearchControl(Window window)
        {
            try
            {
                // Try to find common search control names
                var searchControlNames = new[] { "SearchBox", "SearchTextBox", "FilterBox", "QueryBox" };
                
                foreach (var controlName in searchControlNames)
                {
                    var searchControl = window.FindName(controlName) as UIElement;
                    if (searchControl != null)
                    {
                        searchControl.Focus();
                        return;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error focusing search control: {ex.Message}");
            }
        }

        private static void ShowContextualHelp(Window window)
        {
            try
            {
                var windowType = window.GetType().Name;
                var helpText = $"Help for {windowType}";
                
                // Implementation would show context-specific help
                MessageBox.Show(helpText, "Help", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error showing contextual help: {ex.Message}");
            }
        }

        #endregion

        #region Cleanup

        /// <summary>
        /// Cleans up all window managers
        /// </summary>
        public static void CleanupAll()
        {
            try
            {
                foreach (var kvp in _windowManagers.ToArray())
                {
                    kvp.Value.Dispose();
                }
                _windowManagers.Clear();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error during cleanup: {ex.Message}");
            }
        }

        #endregion
    }
}