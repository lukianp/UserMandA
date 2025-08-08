using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public class KeyboardShortcutService : IKeyboardShortcutService
    {
        private readonly ConcurrentDictionary<string, KeyboardShortcut> _shortcuts;
        private readonly ConcurrentDictionary<string, ShortcutAction> _actions;
        private readonly Dictionary<string, KeyboardShortcutGroup> _groups;
        private readonly List<ShortcutConflict> _conflicts;
        private readonly ConcurrentDictionary<string, ShortcutStatistics> _statistics;
        private KeyboardShortcutSettings _settings;
        private readonly string _settingsPath;
        private readonly string _shortcutsPath;

        // Events
        public event EventHandler<ShortcutExecutedEventArgs> ShortcutExecuted;
        public event EventHandler<ShortcutConflictEventArgs> ConflictDetected;
        public event EventHandler<ShortcutRegistrationEventArgs> ShortcutRegistered;
        public event EventHandler<ShortcutRegistrationEventArgs> ShortcutUnregistered;

        public KeyboardShortcutService()
        {
            _shortcuts = new ConcurrentDictionary<string, KeyboardShortcut>();
            _actions = new ConcurrentDictionary<string, ShortcutAction>();
            _groups = new Dictionary<string, KeyboardShortcutGroup>();
            _conflicts = new List<ShortcutConflict>();
            _statistics = new ConcurrentDictionary<string, ShortcutStatistics>();
            
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var appFolder = Path.Combine(appData, "MandADiscoverySuite");
            Directory.CreateDirectory(appFolder);
            
            _settingsPath = Path.Combine(appFolder, "keyboard_shortcuts_settings.json");
            _shortcutsPath = Path.Combine(appFolder, "keyboard_shortcuts.json");
            
            _ = InitializeAsync();
        }

        #region Shortcut Registration

        public void RegisterShortcut(KeyboardShortcut shortcut, ICommand command)
        {
            if (shortcut == null) throw new ArgumentNullException(nameof(shortcut));
            if (command == null) throw new ArgumentNullException(nameof(command));

            var action = new ShortcutAction(shortcut.ActionId ?? Guid.NewGuid().ToString(), shortcut.DisplayName, command)
            {
                Category = shortcut.Category,
                Context = shortcut.Context,
                IsGlobal = shortcut.IsGlobal
            };

            RegisterAction(action);
            shortcut.ActionId = action.Id;
            _shortcuts[shortcut.Id] = shortcut;

            ShortcutRegistered?.Invoke(this, new ShortcutRegistrationEventArgs { Shortcut = shortcut, Action = action });
            _ = DetectConflictsAsync();
        }

        public void RegisterShortcut(string actionId, string displayName, ModifierKeys modifiers, Key key, ICommand command)
        {
            var shortcut = new KeyboardShortcut(actionId, displayName, modifiers, key);
            RegisterShortcut(shortcut, command);
        }

        public void RegisterAction(ShortcutAction action)
        {
            if (action == null) throw new ArgumentNullException(nameof(action));
            _actions[action.Id] = action;
        }

        public bool UnregisterShortcut(string shortcutId)
        {
            if (_shortcuts.TryRemove(shortcutId, out var shortcut))
            {
                if (_actions.TryGetValue(shortcut.ActionId, out var action))
                {
                    ShortcutUnregistered?.Invoke(this, new ShortcutRegistrationEventArgs { Shortcut = shortcut, Action = action });
                }
                return true;
            }
            return false;
        }

        public bool UnregisterAction(string actionId)
        {
            return _actions.TryRemove(actionId, out _);
        }

        #endregion

        #region Shortcut Execution

        public bool TryExecuteShortcut(ModifierKeys modifiers, Key key, string context = null)
        {
            var matchingShortcuts = _shortcuts.Values.Where(s => s.Matches(modifiers, key)).ToList();
            
            // Filter by context
            if (!string.IsNullOrEmpty(context))
            {
                matchingShortcuts = matchingShortcuts.Where(s => 
                    s.Context == context || s.IsGlobal || string.IsNullOrEmpty(s.Context)).ToList();
            }

            var shortcut = matchingShortcuts.OrderByDescending(s => s.Priority).FirstOrDefault();
            if (shortcut == null) return false;

            return ExecuteAction(shortcut.ActionId, new ShortcutExecutionContext { Context = context });
        }

        public async Task<bool> TryExecuteShortcutAsync(ModifierKeys modifiers, Key key, string context = null)
        {
            return await Task.Run(() => TryExecuteShortcut(modifiers, key, context));
        }

        public bool ExecuteAction(string actionId, ShortcutExecutionContext context = null)
        {
            if (!_actions.TryGetValue(actionId, out var action)) return false;

            var eventArgs = new ShortcutExecutedEventArgs();
            var shortcut = _shortcuts.Values.FirstOrDefault(s => s.ActionId == actionId);
            eventArgs.Shortcut = shortcut;
            eventArgs.Context = context;

            try
            {
                if (action.CanExecute?.Invoke() != false)
                {
                    action.Command?.Execute(null);
                    eventArgs.Success = true;
                    
                    // Record usage statistics
                    _ = RecordShortcutUsageAsync(shortcut?.Id, context?.Context);
                }
                else
                {
                    eventArgs.Success = false;
                }
            }
            catch (Exception ex)
            {
                eventArgs.Success = false;
                eventArgs.Exception = ex;
            }

            ShortcutExecuted?.Invoke(this, eventArgs);
            return eventArgs.Success;
        }

        #endregion

        #region Shortcut Management

        public async Task<List<KeyboardShortcut>> GetAllShortcutsAsync()
        {
            return await Task.FromResult(_shortcuts.Values.ToList());
        }

        public async Task<List<KeyboardShortcut>> GetShortcutsByContextAsync(string context)
        {
            return await Task.FromResult(_shortcuts.Values.Where(s => s.Context == context).ToList());
        }

        public async Task<List<KeyboardShortcut>> GetShortcutsByCategoryAsync(KeyboardShortcutCategory category)
        {
            return await Task.FromResult(_shortcuts.Values.Where(s => s.Category == category).ToList());
        }

        public async Task<KeyboardShortcut> GetShortcutAsync(string shortcutId)
        {
            _shortcuts.TryGetValue(shortcutId, out var shortcut);
            return await Task.FromResult(shortcut);
        }

        public async Task<ShortcutAction> GetActionAsync(string actionId)
        {
            _actions.TryGetValue(actionId, out var action);
            return await Task.FromResult(action);
        }

        #endregion

        #region Shortcut Configuration

        public async Task UpdateShortcutAsync(KeyboardShortcut shortcut)
        {
            if (shortcut != null && _shortcuts.ContainsKey(shortcut.Id))
            {
                _shortcuts[shortcut.Id] = shortcut;
                await SaveShortcutsAsync();
                await DetectConflictsAsync();
            }
        }

        public async Task<bool> SetShortcutKeysAsync(string shortcutId, ModifierKeys modifiers, Key key)
        {
            if (_shortcuts.TryGetValue(shortcutId, out var shortcut))
            {
                shortcut.ModifierKeys = modifiers;
                shortcut.Key = key;
                await UpdateShortcutAsync(shortcut);
                return true;
            }
            return false;
        }

        public async Task<bool> EnableShortcutAsync(string shortcutId, bool enabled = true)
        {
            if (_shortcuts.TryGetValue(shortcutId, out var shortcut))
            {
                shortcut.IsEnabled = enabled;
                await UpdateShortcutAsync(shortcut);
                return true;
            }
            return false;
        }

        public async Task<bool> SetShortcutContextAsync(string shortcutId, string context)
        {
            if (_shortcuts.TryGetValue(shortcutId, out var shortcut))
            {
                shortcut.Context = context;
                await UpdateShortcutAsync(shortcut);
                return true;
            }
            return false;
        }

        #endregion

        #region Conflict Detection

        public async Task<List<ShortcutConflict>> DetectConflictsAsync()
        {
            return await Task.Run(() =>
            {
                var conflicts = new List<ShortcutConflict>();
                var shortcuts = _shortcuts.Values.Where(s => s.IsEnabled).ToList();

                for (int i = 0; i < shortcuts.Count; i++)
                {
                    for (int j = i + 1; j < shortcuts.Count; j++)
                    {
                        if (shortcuts[i].ConflictsWith(shortcuts[j]))
                        {
                            var conflict = new ShortcutConflict
                            {
                                Shortcut1 = shortcuts[i],
                                Shortcut2 = shortcuts[j],
                                Severity = (shortcuts[i].IsGlobal || shortcuts[j].IsGlobal) ? 
                                          ConflictSeverity.Error : ConflictSeverity.Warning,
                                Description = $"Key combination {shortcuts[i].KeyCombination} is used by both shortcuts"
                            };
                            conflicts.Add(conflict);
                        }
                    }
                }

                _conflicts.Clear();
                _conflicts.AddRange(conflicts);

                foreach (var conflict in conflicts)
                {
                    ConflictDetected?.Invoke(this, new ShortcutConflictEventArgs { Conflict = conflict });
                }

                return conflicts;
            });
        }

        public async Task<List<ShortcutConflict>> DetectConflictsForShortcutAsync(KeyboardShortcut shortcut)
        {
            return await Task.Run(() =>
            {
                var conflicts = new List<ShortcutConflict>();
                var otherShortcuts = _shortcuts.Values.Where(s => s.Id != shortcut.Id && s.IsEnabled).ToList();

                foreach (var other in otherShortcuts)
                {
                    if (shortcut.ConflictsWith(other))
                    {
                        conflicts.Add(new ShortcutConflict
                        {
                            Shortcut1 = shortcut,
                            Shortcut2 = other,
                            Severity = (shortcut.IsGlobal || other.IsGlobal) ? ConflictSeverity.Error : ConflictSeverity.Warning,
                            Description = $"Key combination {shortcut.KeyCombination} conflicts with {other.DisplayName}"
                        });
                    }
                }

                return conflicts;
            });
        }

        public bool HasConflict(ModifierKeys modifiers, Key key, string context = null)
        {
            var matchingShortcuts = _shortcuts.Values.Where(s => 
                s.IsEnabled && s.ModifierKeys == modifiers && s.Key == key).ToList();

            if (!string.IsNullOrEmpty(context))
            {
                matchingShortcuts = matchingShortcuts.Where(s => 
                    s.Context == context || s.IsGlobal || string.IsNullOrEmpty(s.Context)).ToList();
            }

            return matchingShortcuts.Count > 1;
        }

        public async Task<bool> ResolveConflictAsync(string conflictId, string resolution)
        {
            // Implementation for conflict resolution would go here
            // This could involve disabling one shortcut, changing key bindings, etc.
            await Task.Delay(1); // Placeholder
            return true;
        }

        #endregion

        #region Shortcut Groups and Categories

        public async Task<List<KeyboardShortcutGroup>> GetShortcutGroupsAsync()
        {
            return await Task.FromResult(_groups.Values.ToList());
        }

        public async Task<KeyboardShortcutGroup> GetShortcutGroupAsync(KeyboardShortcutCategory category)
        {
            var group = _groups.Values.FirstOrDefault(g => g.Category == category);
            if (group == null)
            {
                group = new KeyboardShortcutGroup(category.ToString(), category);
                group.Shortcuts = _shortcuts.Values.Where(s => s.Category == category).ToList();
                _groups[category.ToString()] = group;
            }
            return await Task.FromResult(group);
        }

        public async Task CreateShortcutGroupAsync(KeyboardShortcutGroup group)
        {
            _groups[group.Name] = group;
            await Task.CompletedTask;
        }

        public async Task UpdateShortcutGroupAsync(KeyboardShortcutGroup group)
        {
            if (_groups.ContainsKey(group.Name))
            {
                _groups[group.Name] = group;
            }
            await Task.CompletedTask;
        }

        #endregion

        #region Presets and Templates

        public async Task<List<string>> GetAvailablePresetsAsync()
        {
            return await Task.FromResult(new List<string> { "Default", "Visual Studio", "IntelliJ", "Sublime Text" });
        }

        public async Task LoadPresetAsync(string presetName)
        {
            var defaults = await GetDefaultShortcutsAsync();
            _shortcuts.Clear();
            
            foreach (var shortcut in defaults)
            {
                _shortcuts[shortcut.Id] = shortcut;
            }
            
            await SaveShortcutsAsync();
        }

        public async Task SavePresetAsync(string presetName, List<KeyboardShortcut> shortcuts)
        {
            var presetPath = Path.Combine(Path.GetDirectoryName(_shortcutsPath), $"preset_{presetName.ToLower()}.json");
            var json = JsonConvert.SerializeObject(shortcuts, Formatting.Indented);
            await File.WriteAllTextAsync(presetPath, json);
        }

        public async Task ResetToDefaultsAsync()
        {
            await LoadPresetAsync("Default");
        }

        public async Task<List<KeyboardShortcut>> GetDefaultShortcutsAsync()
        {
            return await Task.FromResult(new List<KeyboardShortcut>
            {
                new KeyboardShortcut("file.new", "New File", ModifierKeys.Control, Key.N) { Category = KeyboardShortcutCategory.File },
                new KeyboardShortcut("file.open", "Open File", ModifierKeys.Control, Key.O) { Category = KeyboardShortcutCategory.File },
                new KeyboardShortcut("file.save", "Save File", ModifierKeys.Control, Key.S) { Category = KeyboardShortcutCategory.File },
                new KeyboardShortcut("edit.copy", "Copy", ModifierKeys.Control, Key.C) { Category = KeyboardShortcutCategory.Edit },
                new KeyboardShortcut("edit.paste", "Paste", ModifierKeys.Control, Key.V) { Category = KeyboardShortcutCategory.Edit },
                new KeyboardShortcut("edit.cut", "Cut", ModifierKeys.Control, Key.X) { Category = KeyboardShortcutCategory.Edit },
                new KeyboardShortcut("edit.undo", "Undo", ModifierKeys.Control, Key.Z) { Category = KeyboardShortcutCategory.Edit },
                new KeyboardShortcut("edit.redo", "Redo", ModifierKeys.Control, Key.Y) { Category = KeyboardShortcutCategory.Edit },
                new KeyboardShortcut("search.find", "Find", ModifierKeys.Control, Key.F) { Category = KeyboardShortcutCategory.Search },
                new KeyboardShortcut("search.replace", "Replace", ModifierKeys.Control, Key.H) { Category = KeyboardShortcutCategory.Search },
                new KeyboardShortcut("view.refresh", "Refresh", ModifierKeys.None, Key.F5) { Category = KeyboardShortcutCategory.View },
                new KeyboardShortcut("help.about", "About", ModifierKeys.None, Key.F1) { Category = KeyboardShortcutCategory.Help }
            });
        }

        #endregion

        #region Settings and Preferences

        public async Task<KeyboardShortcutSettings> GetSettingsAsync()
        {
            if (_settings == null)
            {
                await LoadSettingsAsync();
            }
            return _settings;
        }

        public async Task UpdateSettingsAsync(KeyboardShortcutSettings settings)
        {
            _settings = settings;
            await SaveSettingsAsync();
        }

        public async Task<bool> IsShortcutEnabledAsync(string shortcutId)
        {
            if (_shortcuts.TryGetValue(shortcutId, out var shortcut))
            {
                return await Task.FromResult(shortcut.IsEnabled);
            }
            return false;
        }

        public async Task<bool> IsContextActiveAsync(string context)
        {
            // Implementation would depend on application state
            return await Task.FromResult(true);
        }

        #endregion

        #region Statistics and Usage

        public async Task<List<ShortcutStatistics>> GetUsageStatisticsAsync()
        {
            return await Task.FromResult(_statistics.Values.ToList());
        }

        public async Task<ShortcutStatistics> GetShortcutStatisticsAsync(string shortcutId)
        {
            _statistics.TryGetValue(shortcutId, out var stats);
            return await Task.FromResult(stats);
        }

        public async Task RecordShortcutUsageAsync(string shortcutId, string context = null)
        {
            if (string.IsNullOrEmpty(shortcutId)) return;

            var stats = _statistics.GetOrAdd(shortcutId, _ => new ShortcutStatistics { ShortcutId = shortcutId });
            stats.UsageCount++;
            stats.LastUsed = DateTime.Now;

            if (!string.IsNullOrEmpty(context))
            {
                if (stats.ContextUsage.ContainsKey(context))
                    stats.ContextUsage[context]++;
                else
                    stats.ContextUsage[context] = 1;
            }

            await Task.CompletedTask;
        }

        public async Task<List<KeyboardShortcut>> GetMostUsedShortcutsAsync(int count = 10)
        {
            var topStats = _statistics.Values
                .OrderByDescending(s => s.UsageCount)
                .Take(count)
                .ToList();

            var shortcuts = new List<KeyboardShortcut>();
            foreach (var stat in topStats)
            {
                if (_shortcuts.TryGetValue(stat.ShortcutId, out var shortcut))
                {
                    shortcuts.Add(shortcut);
                }
            }

            return await Task.FromResult(shortcuts);
        }

        #endregion

        #region Import/Export

        public async Task<string> ExportShortcutsAsync()
        {
            var shortcuts = _shortcuts.Values.ToList();
            return await Task.FromResult(JsonConvert.SerializeObject(shortcuts, Formatting.Indented));
        }

        public async Task<string> ExportShortcutsAsync(List<string> shortcutIds)
        {
            var shortcuts = _shortcuts.Values.Where(s => shortcutIds.Contains(s.Id)).ToList();
            return await Task.FromResult(JsonConvert.SerializeObject(shortcuts, Formatting.Indented));
        }

        // Non-async wrapper methods for backward compatibility
        public string ExportShortcuts()
        {
            return ExportShortcutsAsync().Result;
        }

        public void ExportShortcuts(string filePath)
        {
            var json = ExportShortcuts();
            System.IO.File.WriteAllText(filePath, json);
        }

        public void ResetToDefaults()
        {
            ResetToDefaultsAsync().Wait();
        }

        public Dictionary<string, List<KeyboardShortcut>> GetShortcutsByCategory()
        {
            return _shortcuts.Values
                .GroupBy(s => s.Category.ToString())
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        public async Task ImportShortcutsAsync(string shortcutsJson)
        {
            try
            {
                var shortcuts = JsonConvert.DeserializeObject<List<KeyboardShortcut>>(shortcutsJson);
                if (shortcuts != null)
                {
                    foreach (var shortcut in shortcuts)
                    {
                        _shortcuts[shortcut.Id] = shortcut;
                    }
                    await SaveShortcutsAsync();
                    await DetectConflictsAsync();
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to import shortcuts: {ex.Message}", ex);
            }
        }

        public async Task<bool> ValidateShortcutConfigurationAsync(string configJson)
        {
            try
            {
                var shortcuts = JsonConvert.DeserializeObject<List<KeyboardShortcut>>(configJson);
                return await Task.FromResult(shortcuts != null);
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Private Methods

        private async Task InitializeAsync()
        {
            await LoadSettingsAsync();
            await LoadShortcutsAsync();
            
            if (!_shortcuts.Any())
            {
                await ResetToDefaultsAsync();
            }
        }

        private async Task LoadSettingsAsync()
        {
            try
            {
                if (File.Exists(_settingsPath))
                {
                    var json = await File.ReadAllTextAsync(_settingsPath);
                    _settings = JsonConvert.DeserializeObject<KeyboardShortcutSettings>(json);
                }
                
                _settings ??= new KeyboardShortcutSettings();
            }
            catch
            {
                _settings = new KeyboardShortcutSettings();
            }
        }

        private async Task SaveSettingsAsync()
        {
            try
            {
                var json = JsonConvert.SerializeObject(_settings, Formatting.Indented);
                await File.WriteAllTextAsync(_settingsPath, json);
            }
            catch
            {
                // Handle save error
            }
        }

        private async Task LoadShortcutsAsync()
        {
            try
            {
                if (File.Exists(_shortcutsPath))
                {
                    var json = await File.ReadAllTextAsync(_shortcutsPath);
                    var shortcuts = JsonConvert.DeserializeObject<List<KeyboardShortcut>>(json);
                    if (shortcuts != null)
                    {
                        _shortcuts.Clear();
                        foreach (var shortcut in shortcuts)
                        {
                            _shortcuts[shortcut.Id] = shortcut;
                        }
                    }
                }
            }
            catch
            {
                // Handle load error
            }
        }

        private async Task SaveShortcutsAsync()
        {
            try
            {
                var shortcuts = _shortcuts.Values.ToList();
                var json = JsonConvert.SerializeObject(shortcuts, Formatting.Indented);
                await File.WriteAllTextAsync(_shortcutsPath, json);
            }
            catch
            {
                // Handle save error
            }
        }

        #endregion
    }
}