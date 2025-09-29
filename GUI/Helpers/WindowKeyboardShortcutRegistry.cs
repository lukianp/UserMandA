#nullable enable

using System;
using System.Collections.Generic;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Constants;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Dictionary-based keyboard shortcut registry for MainWindow
    /// Replaces large switch statement with maintainable configuration
    /// </summary>
    public class WindowKeyboardShortcutRegistry
    {
        private readonly Dictionary<KeyCombination, Action> _shortcuts = new();
        private readonly MainViewModel _viewModel;

        /// <summary>
        /// Represents a keyboard combination (key + modifiers)
        /// </summary>
        public readonly struct KeyCombination : IEquatable<KeyCombination>
        {
            public Key Key { get; }
            public ModifierKeys Modifiers { get; }

            public KeyCombination(Key key, ModifierKeys modifiers = ModifierKeys.None)
            {
                Key = key;
                Modifiers = modifiers;
            }

            public bool Equals(KeyCombination other) => Key == other.Key && Modifiers == other.Modifiers;
            public override bool Equals(object? obj) => obj is KeyCombination other && Equals(other);
            public override int GetHashCode() => HashCode.Combine(Key, Modifiers);
        }

        public WindowKeyboardShortcutRegistry(MainViewModel viewModel)
        {
            _viewModel = viewModel ?? throw new ArgumentNullException(nameof(viewModel));
            RegisterDefaultShortcuts();
        }

        /// <summary>
        /// Register all default keyboard shortcuts
        /// </summary>
        private void RegisterDefaultShortcuts()
        {
            // Discovery Operations
            Register(Key.F5, ModifierKeys.None, () => _viewModel.StartDiscoveryCommand?.Execute(null));
            Register(Key.Escape, ModifierKeys.None, () => _viewModel.StopDiscoveryCommand?.Execute(null));

            // Navigation Shortcuts (Ctrl + Number) - using ViewNames constants
            Register(Key.D1, ModifierKeys.Control, () => _viewModel.NavigateCommand?.Execute(ViewNames.Dashboard));
            Register(Key.D2, ModifierKeys.Control, () => _viewModel.NavigateCommand?.Execute(ViewNames.Discovery));
            Register(Key.D3, ModifierKeys.Control, () => _viewModel.NavigateCommand?.Execute(ViewNames.Users));
            Register(Key.D4, ModifierKeys.Control, () => _viewModel.NavigateCommand?.Execute(ViewNames.Infrastructure));
            Register(Key.D5, ModifierKeys.Control, () => _viewModel.NavigateCommand?.Execute(ViewNames.Groups));
            Register(Key.D6, ModifierKeys.Control, () => _viewModel.NavigateCommand?.Execute(ViewNames.Analytics));

            // Data Operations
            Register(Key.R, ModifierKeys.Control, () => _viewModel.RefreshCurrentViewCommand?.Execute(null));
            Register(Key.R, ModifierKeys.Control | ModifierKeys.Shift, () => _viewModel.ShowRefreshSettingsCommand?.Execute(null));
            Register(Key.E, ModifierKeys.Control, ExecuteExportForCurrentView);
            Register(Key.A, ModifierKeys.Control, ExecuteSelectAllForCurrentView);
            Register(Key.C, ModifierKeys.Control, ExecuteCopyForCurrentView);

            // Search Operations
            Register(Key.F, ModifierKeys.Control, ExecuteFocusSearchBox);
            Register(Key.F, ModifierKeys.Control | ModifierKeys.Shift, ExecuteAdvancedSearchForCurrentView);

            // Theme Toggle
            Register(Key.T, ModifierKeys.Control, () => _viewModel.ToggleThemeCommand?.Execute(null));

            // Column Visibility
            Register(Key.H, ModifierKeys.Control, () => _viewModel.ShowColumnVisibilityCommand?.Execute(_viewModel.CurrentView));

            // Pagination
            Register(Key.PageUp, ModifierKeys.Control, ExecutePreviousPageForCurrentView);
            Register(Key.PageDown, ModifierKeys.Control, ExecuteNextPageForCurrentView);
            Register(Key.Home, ModifierKeys.Control, ExecuteFirstPageForCurrentView);
            Register(Key.End, ModifierKeys.Control, ExecuteLastPageForCurrentView);

            // Help
            Register(Key.F1, ModifierKeys.None, () => { }); // Handled separately in MainWindow

            // Quick Actions
            Register(Key.N, ModifierKeys.Control, () => _viewModel.CreateProfileCommand?.Execute(null));
            Register(Key.Delete, ModifierKeys.Shift, ExecuteDeleteForCurrentView);
        }

        /// <summary>
        /// Register a keyboard shortcut
        /// </summary>
        public void Register(Key key, ModifierKeys modifiers, Action action)
        {
            var combination = new KeyCombination(key, modifiers);
            _shortcuts[combination] = action;
        }

        /// <summary>
        /// Execute shortcut for given key event
        /// </summary>
        public bool TryExecute(KeyEventArgs e)
        {
            var combination = new KeyCombination(e.Key, Keyboard.Modifiers);

            if (_shortcuts.TryGetValue(combination, out var action))
            {
                action?.Invoke();
                e.Handled = true;
                return true;
            }

            return false;
        }

        // Context-aware command execution methods
        private void ExecuteExportForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.ExportUsersCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.ExportInfrastructureCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.ExportGroupsCommand?.Execute(null);
                    break;
                default:
                    _viewModel.ExportResultsCommand?.Execute(null);
                    break;
            }
        }

        private void ExecuteSelectAllForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.SelectAllUsersCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.SelectAllInfrastructureCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.SelectAllGroupsCommand?.Execute(null);
                    break;
            }
        }

        private void ExecuteCopyForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.CopySelectedUsersCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.CopySelectedInfrastructureCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.CopySelectedGroupsCommand?.Execute(null);
                    break;
            }
        }

        private void ExecuteFocusSearchBox()
        {
            // This needs to be handled by MainWindow as it requires UI element access
            // Dispatched as event or message
        }

        private void ExecuteAdvancedSearchForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.ShowUsersAdvancedSearchCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.ShowInfrastructureAdvancedSearchCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.ShowGroupsAdvancedSearchCommand?.Execute(null);
                    break;
            }
        }

        private void ExecutePreviousPageForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.PreviousPageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.PreviousInfrastructurePageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.PreviousGroupPageCommand?.Execute(null);
                    break;
            }
        }

        private void ExecuteNextPageForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.NextPageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.NextInfrastructurePageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.NextGroupPageCommand?.Execute(null);
                    break;
            }
        }

        private void ExecuteFirstPageForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.FirstPageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.FirstInfrastructurePageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.FirstGroupPageCommand?.Execute(null);
                    break;
            }
        }

        private void ExecuteLastPageForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.LastPageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Infrastructure:
                    _viewModel.LastInfrastructurePageCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.LastGroupPageCommand?.Execute(null);
                    break;
            }
        }

        private void ExecuteDeleteForCurrentView()
        {
            switch (_viewModel.CurrentView)
            {
                case var view when view == ViewNames.Users:
                    _viewModel.DeleteSelectedUsersCommand?.Execute(null);
                    break;
                case var view when view == ViewNames.Groups:
                    _viewModel.DeleteSelectedGroupsCommand?.Execute(null);
                    break;
            }
        }
    }
}