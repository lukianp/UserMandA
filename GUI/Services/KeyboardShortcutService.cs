using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Messages;
using Newtonsoft.Json;
using System.IO;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing keyboard shortcuts throughout the application
    /// </summary>
    public class KeyboardShortcutService
    {
        private readonly ILogger<KeyboardShortcutService> _logger;
        private readonly IMessenger _messenger;
        private readonly Dictionary<KeyGesture, ShortcutAction> _shortcuts;
        private readonly Dictionary<string, KeyGesture> _namedShortcuts;
        private readonly string _shortcutsConfigPath;
        private bool _isEnabled = true;

        public KeyboardShortcutService(ILogger<KeyboardShortcutService> logger, IMessenger messenger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _messenger = messenger ?? throw new ArgumentNullException(nameof(messenger));
            
            _shortcuts = new Dictionary<KeyGesture, ShortcutAction>();
            _namedShortcuts = new Dictionary<string, KeyGesture>();
            
            _shortcutsConfigPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite", "keyboard-shortcuts.json");
            
            InitializeDefaultShortcuts();
            LoadCustomShortcuts();
        }

        #region Properties

        public bool IsEnabled
        {
            get => _isEnabled;
            set
            {
                _isEnabled = value;
                _logger.LogInformation("Keyboard shortcuts {Status}", value ? "enabled" : "disabled");
            }
        }

        public IReadOnlyDictionary<KeyGesture, ShortcutAction> RegisteredShortcuts => _shortcuts;

        #endregion

        #region Public Methods

        /// <summary>
        /// Registers a keyboard shortcut with an action
        /// </summary>
        public void RegisterShortcut(string name, KeyGesture keyGesture, Action action, string description = null, string category = "General")
        {
            try
            {
                var shortcutAction = new ShortcutAction
                {
                    Name = name,
                    Action = action,
                    Description = description ?? name,
                    Category = category,
                    KeyGesture = keyGesture
                };

                _shortcuts[keyGesture] = shortcutAction;
                _namedShortcuts[name] = keyGesture;

                _logger.LogDebug("Registered keyboard shortcut: {Name} ({KeyGesture})", name, keyGesture);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering keyboard shortcut: {Name}", name);
            }
        }

        /// <summary>
        /// Registers a keyboard shortcut with a command
        /// </summary>
        public void RegisterShortcut(string name, KeyGesture keyGesture, ICommand command, object parameter = null, string description = null, string category = "General")
        {
            RegisterShortcut(name, keyGesture, () => 
            {
                if (command?.CanExecute(parameter) == true)
                {
                    command.Execute(parameter);
                }
            }, description, category);
        }

        /// <summary>
        /// Unregisters a keyboard shortcut
        /// </summary>
        public void UnregisterShortcut(string name)
        {
            try
            {
                if (_namedShortcuts.TryGetValue(name, out var keyGesture))
                {
                    _shortcuts.Remove(keyGesture);
                    _namedShortcuts.Remove(name);
                    _logger.LogDebug("Unregistered keyboard shortcut: {Name}", name);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unregistering keyboard shortcut: {Name}", name);
            }
        }

        /// <summary>
        /// Handles a key press event
        /// </summary>
        public bool HandleKeyPress(KeyEventArgs e)
        {
            if (!IsEnabled) return false;

            try
            {
                var keyGesture = new KeyGesture(e.Key, Keyboard.Modifiers);
                
                if (_shortcuts.TryGetValue(keyGesture, out var shortcutAction))
                {
                    shortcutAction.Action?.Invoke();
                    e.Handled = true;
                    
                    _logger.LogDebug("Executed keyboard shortcut: {Name} ({KeyGesture})", shortcutAction.Name, keyGesture);
                    
                    // Send notification message
                    _messenger.Send(new ShortcutExecutedMessage(shortcutAction.Name, keyGesture.ToString()));
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling keyboard shortcut");
            }

            return false;
        }

        /// <summary>
        /// Gets all shortcuts grouped by category
        /// </summary>
        public Dictionary<string, List<ShortcutAction>> GetShortcutsByCategory()
        {
            return _shortcuts.Values
                .GroupBy(s => s.Category)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        /// <summary>
        /// Updates a keyboard shortcut
        /// </summary>
        public void UpdateShortcut(string name, KeyGesture newKeyGesture)
        {
            try
            {
                if (_namedShortcuts.TryGetValue(name, out var oldKeyGesture))
                {
                    var shortcutAction = _shortcuts[oldKeyGesture];
                    
                    // Remove old mapping
                    _shortcuts.Remove(oldKeyGesture);
                    
                    // Add new mapping
                    shortcutAction.KeyGesture = newKeyGesture;
                    _shortcuts[newKeyGesture] = shortcutAction;
                    _namedShortcuts[name] = newKeyGesture;
                    
                    _logger.LogDebug("Updated keyboard shortcut: {Name} from {OldGesture} to {NewGesture}", 
                        name, oldKeyGesture, newKeyGesture);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating keyboard shortcut: {Name}", name);
            }
        }

        /// <summary>
        /// Saves custom shortcuts to file
        /// </summary>
        public void SaveCustomShortcuts()
        {
            try
            {
                var customShortcuts = _shortcuts.Values
                    .Where(s => s.IsCustom)
                    .Select(s => new ShortcutConfig
                    {
                        Name = s.Name,
                        KeyGesture = s.KeyGesture.ToString(),
                        Description = s.Description,
                        Category = s.Category
                    })
                    .ToList();

                var directory = Path.GetDirectoryName(_shortcutsConfigPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                var json = JsonConvert.SerializeObject(customShortcuts, Formatting.Indented);
                File.WriteAllText(_shortcutsConfigPath, json);

                _logger.LogInformation("Saved {Count} custom keyboard shortcuts", customShortcuts.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving custom keyboard shortcuts");
            }
        }

        /// <summary>
        /// Exports all shortcuts to a file
        /// </summary>
        public void ExportShortcuts(string filePath)
        {
            try
            {
                var allShortcuts = _shortcuts.Values
                    .Select(s => new ShortcutConfig
                    {
                        Name = s.Name,
                        KeyGesture = s.KeyGesture.ToString(),
                        Description = s.Description,
                        Category = s.Category
                    })
                    .OrderBy(s => s.Category)
                    .ThenBy(s => s.Name)
                    .ToList();

                var json = JsonConvert.SerializeObject(allShortcuts, Formatting.Indented);
                File.WriteAllText(filePath, json);

                _logger.LogInformation("Exported {Count} keyboard shortcuts to {FilePath}", allShortcuts.Count, filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting keyboard shortcuts to {FilePath}", filePath);
                throw;
            }
        }

        /// <summary>
        /// Resets all shortcuts to defaults
        /// </summary>
        public void ResetToDefaults()
        {
            try
            {
                _shortcuts.Clear();
                _namedShortcuts.Clear();
                InitializeDefaultShortcuts();
                
                _logger.LogInformation("Reset keyboard shortcuts to defaults");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting keyboard shortcuts to defaults");
            }
        }

        #endregion

        #region Private Methods

        private void InitializeDefaultShortcuts()
        {
            // Navigation shortcuts
            RegisterShortcut("ShowDashboard", new KeyGesture(Key.F1), () => NavigateTo("Dashboard"), "Show Dashboard", "Navigation");
            RegisterShortcut("ShowDiscovery", new KeyGesture(Key.F2), () => NavigateTo("Discovery"), "Show Discovery", "Navigation");
            RegisterShortcut("ShowUsers", new KeyGesture(Key.F3), () => NavigateTo("Users"), "Show Users", "Navigation");
            RegisterShortcut("ShowComputers", new KeyGesture(Key.F4), () => NavigateTo("Computers"), "Show Computers", "Navigation");
            RegisterShortcut("ShowGroups", new KeyGesture(Key.F5), () => NavigateTo("Groups"), "Show Groups", "Navigation");
            RegisterShortcut("ShowReports", new KeyGesture(Key.F6), () => NavigateTo("Reports"), "Show Reports", "Navigation");

            // Action shortcuts
            RegisterShortcut("Refresh", new KeyGesture(Key.F5), () => ExecuteAction("Refresh"), "Refresh Current View", "Actions");
            RegisterShortcut("Search", new KeyGesture(Key.F, ModifierKeys.Control), () => ExecuteAction("Search"), "Open Search", "Actions");
            RegisterShortcut("CommandPalette", new KeyGesture(Key.P, ModifierKeys.Control | ModifierKeys.Shift), () => ExecuteAction("CommandPalette"), "Open Command Palette", "Actions");
            RegisterShortcut("Settings", new KeyGesture(Key.OemComma, ModifierKeys.Control), () => ExecuteAction("Settings"), "Open Settings", "Actions");
            
            // File operations
            RegisterShortcut("NewProfile", new KeyGesture(Key.N, ModifierKeys.Control), () => ExecuteAction("NewProfile"), "New Company Profile", "File");
            RegisterShortcut("Save", new KeyGesture(Key.S, ModifierKeys.Control), () => ExecuteAction("Save"), "Save Current", "File");
            RegisterShortcut("Export", new KeyGesture(Key.E, ModifierKeys.Control), () => ExecuteAction("Export"), "Export Data", "File");
            RegisterShortcut("Import", new KeyGesture(Key.I, ModifierKeys.Control), () => ExecuteAction("Import"), "Import Data", "File");

            // Discovery operations
            RegisterShortcut("RunDiscovery", new KeyGesture(Key.R, ModifierKeys.Control | ModifierKeys.Shift), () => ExecuteAction("RunDiscovery"), "Run Discovery", "Discovery");
            RegisterShortcut("StopDiscovery", new KeyGesture(Key.Escape), () => ExecuteAction("StopDiscovery"), "Stop Discovery", "Discovery");
            RegisterShortcut("ModuleConfig", new KeyGesture(Key.M, ModifierKeys.Control), () => ExecuteAction("ModuleConfig"), "Configure Modules", "Discovery");

            // View operations
            RegisterShortcut("ToggleTheme", new KeyGesture(Key.T, ModifierKeys.Control | ModifierKeys.Alt), () => ExecuteAction("ToggleTheme"), "Toggle Dark/Light Theme", "View");
            RegisterShortcut("ZoomIn", new KeyGesture(Key.OemPlus, ModifierKeys.Control), () => ExecuteAction("ZoomIn"), "Zoom In", "View");
            RegisterShortcut("ZoomOut", new KeyGesture(Key.OemMinus, ModifierKeys.Control), () => ExecuteAction("ZoomOut"), "Zoom Out", "View");
            RegisterShortcut("ResetZoom", new KeyGesture(Key.D0, ModifierKeys.Control), () => ExecuteAction("ResetZoom"), "Reset Zoom", "View");

            // Selection and editing
            RegisterShortcut("SelectAll", new KeyGesture(Key.A, ModifierKeys.Control), () => ExecuteAction("SelectAll"), "Select All", "Edit");
            RegisterShortcut("Copy", new KeyGesture(Key.C, ModifierKeys.Control), () => ExecuteAction("Copy"), "Copy", "Edit");
            RegisterShortcut("Paste", new KeyGesture(Key.V, ModifierKeys.Control), () => ExecuteAction("Paste"), "Paste", "Edit");
            RegisterShortcut("Delete", new KeyGesture(Key.Delete), () => ExecuteAction("Delete"), "Delete Selected", "Edit");

            // Advanced features
            RegisterShortcut("AdvancedFilter", new KeyGesture(Key.F, ModifierKeys.Control | ModifierKeys.Shift), () => ExecuteAction("AdvancedFilter"), "Advanced Filtering", "Advanced");
            RegisterShortcut("DataVisualization", new KeyGesture(Key.D, ModifierKeys.Control | ModifierKeys.Shift), () => ExecuteAction("DataVisualization"), "Data Visualization", "Advanced");
            RegisterShortcut("NetworkGraph", new KeyGesture(Key.G, ModifierKeys.Control | ModifierKeys.Shift), () => ExecuteAction("NetworkGraph"), "Network Graph", "Advanced");
            RegisterShortcut("ExportWizard", new KeyGesture(Key.W, ModifierKeys.Control | ModifierKeys.Shift), () => ExecuteAction("ExportWizard"), "Export Wizard", "Advanced");

            // Help and support
            RegisterShortcut("Help", new KeyGesture(Key.F1, ModifierKeys.Shift), () => ExecuteAction("Help"), "Show Help", "Help");
            RegisterShortcut("Shortcuts", new KeyGesture(Key.OemQuestion, ModifierKeys.Control), () => ExecuteAction("ShowShortcuts"), "Show Keyboard Shortcuts", "Help");
            RegisterShortcut("About", new KeyGesture(Key.F1, ModifierKeys.Control), () => ExecuteAction("About"), "About Application", "Help");

            // Quick actions
            RegisterShortcut("QuickExport", new KeyGesture(Key.Q, ModifierKeys.Control | ModifierKeys.Shift), () => ExecuteAction("QuickExport"), "Quick Export", "Quick");
            RegisterShortcut("QuickSearch", new KeyGesture(Key.Q, ModifierKeys.Control), () => ExecuteAction("QuickSearch"), "Quick Search", "Quick");
            RegisterShortcut("QuickFilter", new KeyGesture(Key.Q, ModifierKeys.Alt), () => ExecuteAction("QuickFilter"), "Quick Filter", "Quick");

            _logger.LogInformation("Initialized {Count} default keyboard shortcuts", _shortcuts.Count);
        }

        private void LoadCustomShortcuts()
        {
            try
            {
                if (!File.Exists(_shortcutsConfigPath)) return;

                var json = File.ReadAllText(_shortcutsConfigPath);
                var customShortcuts = JsonConvert.DeserializeObject<List<ShortcutConfig>>(json);

                foreach (var config in customShortcuts)
                {
                    try
                    {
                        var keyGesture = (KeyGesture)new KeyGestureConverter().ConvertFromString(config.KeyGesture);
                        RegisterShortcut(config.Name, keyGesture, () => ExecuteAction(config.Name), config.Description, config.Category);
                        
                        // Mark as custom
                        if (_shortcuts.TryGetValue(keyGesture, out var action))
                        {
                            action.IsCustom = true;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to load custom shortcut: {Name} ({KeyGesture})", config.Name, config.KeyGesture);
                    }
                }

                _logger.LogInformation("Loaded {Count} custom keyboard shortcuts", customShortcuts.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading custom keyboard shortcuts");
            }
        }

        private void NavigateTo(string viewName)
        {
            _messenger.Send(new NavigationMessage(viewName));
        }

        private void ExecuteAction(string actionName)
        {
            _messenger.Send(new KeyboardShortcutMessage(actionName));
        }

        #endregion
    }

    /// <summary>
    /// Represents a keyboard shortcut action
    /// </summary>
    public class ShortcutAction
    {
        public string Name { get; set; }
        public Action Action { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public KeyGesture KeyGesture { get; set; }
        public bool IsCustom { get; set; }
    }

    /// <summary>
    /// Configuration for saving/loading shortcuts
    /// </summary>
    public class ShortcutConfig
    {
        public string Name { get; set; }
        public string KeyGesture { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
    }
}