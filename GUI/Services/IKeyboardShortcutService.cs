using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public interface IKeyboardShortcutService
    {
        // Shortcut Registration
        void RegisterShortcut(KeyboardShortcut shortcut, ICommand command);
        void RegisterShortcut(string actionId, string displayName, ModifierKeys modifiers, Key key, ICommand command);
        void RegisterAction(ShortcutAction action);
        bool UnregisterShortcut(string shortcutId);
        bool UnregisterAction(string actionId);

        // Shortcut Execution
        bool TryExecuteShortcut(ModifierKeys modifiers, Key key, string context = null);
        Task<bool> TryExecuteShortcutAsync(ModifierKeys modifiers, Key key, string context = null);
        bool ExecuteAction(string actionId, ShortcutExecutionContext context = null);

        // Shortcut Management
        Task<List<KeyboardShortcut>> GetAllShortcutsAsync();
        Task<List<KeyboardShortcut>> GetShortcutsByContextAsync(string context);
        Task<List<KeyboardShortcut>> GetShortcutsByCategoryAsync(KeyboardShortcutCategory category);
        Task<KeyboardShortcut> GetShortcutAsync(string shortcutId);
        Task<ShortcutAction> GetActionAsync(string actionId);

        // Shortcut Configuration
        Task UpdateShortcutAsync(KeyboardShortcut shortcut);
        Task<bool> SetShortcutKeysAsync(string shortcutId, ModifierKeys modifiers, Key key);
        Task<bool> EnableShortcutAsync(string shortcutId, bool enabled = true);
        Task<bool> SetShortcutContextAsync(string shortcutId, string context);

        // Conflict Detection
        Task<List<ShortcutConflict>> DetectConflictsAsync();
        Task<List<ShortcutConflict>> DetectConflictsForShortcutAsync(KeyboardShortcut shortcut);
        bool HasConflict(ModifierKeys modifiers, Key key, string context = null);
        Task<bool> ResolveConflictAsync(string conflictId, string resolution);

        // Shortcut Groups and Categories
        Task<List<KeyboardShortcutGroup>> GetShortcutGroupsAsync();
        Task<KeyboardShortcutGroup> GetShortcutGroupAsync(KeyboardShortcutCategory category);
        Task CreateShortcutGroupAsync(KeyboardShortcutGroup group);
        Task UpdateShortcutGroupAsync(KeyboardShortcutGroup group);

        // Preset and Templates
        Task<List<string>> GetAvailablePresetsAsync();
        Task LoadPresetAsync(string presetName);
        Task SavePresetAsync(string presetName, List<KeyboardShortcut> shortcuts);
        Task ResetToDefaultsAsync();
        Task<List<KeyboardShortcut>> GetDefaultShortcutsAsync();

        // Settings and Preferences
        Task<KeyboardShortcutSettings> GetSettingsAsync();
        Task UpdateSettingsAsync(KeyboardShortcutSettings settings);
        Task<bool> IsShortcutEnabledAsync(string shortcutId);
        Task<bool> IsContextActiveAsync(string context);

        // Statistics and Usage
        Task<List<ShortcutStatistics>> GetUsageStatisticsAsync();
        Task<ShortcutStatistics> GetShortcutStatisticsAsync(string shortcutId);
        Task RecordShortcutUsageAsync(string shortcutId, string context = null);
        Task<List<KeyboardShortcut>> GetMostUsedShortcutsAsync(int count = 10);

        // Import/Export
        Task<string> ExportShortcutsAsync();
        Task<string> ExportShortcutsAsync(List<string> shortcutIds);
        Task ImportShortcutsAsync(string shortcutsJson);
        Task<bool> ValidateShortcutConfigurationAsync(string configJson);

        // Events
        event EventHandler<ShortcutExecutedEventArgs> ShortcutExecuted;
        event EventHandler<ShortcutConflictEventArgs> ConflictDetected;
        event EventHandler<ShortcutRegistrationEventArgs> ShortcutRegistered;
        event EventHandler<ShortcutRegistrationEventArgs> ShortcutUnregistered;
    }

    public class ShortcutExecutedEventArgs : EventArgs
    {
        public KeyboardShortcut Shortcut { get; set; }
        public ShortcutExecutionContext Context { get; set; }
        public bool Success { get; set; }
        public Exception Exception { get; set; }
        public DateTime Timestamp { get; set; }

        public ShortcutExecutedEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }

    public class ShortcutConflictEventArgs : EventArgs
    {
        public ShortcutConflict Conflict { get; set; }
        public DateTime Timestamp { get; set; }

        public ShortcutConflictEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }

    public class ShortcutRegistrationEventArgs : EventArgs
    {
        public KeyboardShortcut Shortcut { get; set; }
        public ShortcutAction Action { get; set; }
        public DateTime Timestamp { get; set; }

        public ShortcutRegistrationEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }
}