using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace MandADiscoverySuite.Models
{
    public class KeyboardShortcut : INotifyPropertyChanged
    {
        private string _displayName;
        private string _description;
        private ModifierKeys _modifierKeys;
        private Key _key;
        private bool _isEnabled = true;
        private bool _isGlobal;
        private string _context;

        public string Id { get; set; }
        public string ActionId { get; set; }
        
        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public ModifierKeys ModifierKeys
        {
            get => _modifierKeys;
            set
            {
                if (SetProperty(ref _modifierKeys, value))
                {
                    OnPropertyChanged(nameof(KeyCombination));
                    OnPropertyChanged(nameof(DisplayText));
                }
            }
        }

        public Key Key
        {
            get => _key;
            set
            {
                if (SetProperty(ref _key, value))
                {
                    OnPropertyChanged(nameof(KeyCombination));
                    OnPropertyChanged(nameof(DisplayText));
                }
            }
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public bool IsGlobal
        {
            get => _isGlobal;
            set => SetProperty(ref _isGlobal, value);
        }

        public string Context
        {
            get => _context;
            set => SetProperty(ref _context, value);
        }

        public KeyboardShortcutCategory Category { get; set; }
        public int Priority { get; set; } = 0;
        public bool IsCustomizable { get; set; } = true;
        public bool IsDefault { get; set; }

        // Computed properties
        public string KeyCombination => FormatKeyCombination();
        public string DisplayText => $"{DisplayName} ({KeyCombination})";

        public KeyboardShortcut()
        {
            Id = Guid.NewGuid().ToString();
            Category = KeyboardShortcutCategory.General;
        }

        public KeyboardShortcut(string actionId, string displayName, ModifierKeys modifierKeys, Key key) : this()
        {
            ActionId = actionId;
            DisplayName = displayName;
            ModifierKeys = modifierKeys;
            Key = key;
        }

        public bool Matches(ModifierKeys modifiers, Key key)
        {
            return IsEnabled && ModifierKeys == modifiers && Key == key;
        }

        public bool ConflictsWith(KeyboardShortcut other)
        {
            if (other == null || !IsEnabled || !other.IsEnabled)
                return false;

            return ModifierKeys == other.ModifierKeys && Key == other.Key && 
                   (Context == other.Context || IsGlobal || other.IsGlobal);
        }

        private string FormatKeyCombination()
        {
            var parts = new List<string>();

            if (ModifierKeys.HasFlag(ModifierKeys.Control))
                parts.Add("Ctrl");
            if (ModifierKeys.HasFlag(ModifierKeys.Alt))
                parts.Add("Alt");
            if (ModifierKeys.HasFlag(ModifierKeys.Shift))
                parts.Add("Shift");
            if (ModifierKeys.HasFlag(ModifierKeys.Windows))
                parts.Add("Win");

            if (Key != Key.None)
                parts.Add(FormatKey(Key));

            return string.Join(" + ", parts);
        }

        private string FormatKey(Key key)
        {
            return key switch
            {
                Key.Delete => "Del",
                Key.Insert => "Ins",
                Key.Return => "Enter",
                Key.Escape => "Esc",
                Key.Tab => "Tab",
                Key.Space => "Space",
                Key.Back => "Backspace",
                Key.Prior => "Page Up",
                Key.Next => "Page Down",
                Key.Home => "Home",
                Key.End => "End",
                Key.Left => "←",
                Key.Up => "↑",
                Key.Right => "→",
                Key.Down => "↓",
                _ => key.ToString()
            };
        }

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
    }

    public enum KeyboardShortcutCategory
    {
        General,
        Navigation,
        Edit,
        View,
        File,
        Tools,
        Search,
        Debug,
        Window,
        Help,
        Custom
    }

    public class ShortcutAction
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ICommand Command { get; set; }
        public Func<bool> CanExecute { get; set; }
        public KeyboardShortcutCategory Category { get; set; }
        public string Context { get; set; }
        public bool IsGlobal { get; set; }

        public ShortcutAction()
        {
            Id = Guid.NewGuid().ToString();
        }

        public ShortcutAction(string id, string name, ICommand command) : this()
        {
            Id = id;
            Name = name;
            Command = command;
        }
    }

    public class KeyboardShortcutGroup
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public KeyboardShortcutCategory Category { get; set; }
        public List<KeyboardShortcut> Shortcuts { get; set; }
        public bool IsExpanded { get; set; } = true;

        public KeyboardShortcutGroup()
        {
            Shortcuts = new List<KeyboardShortcut>();
        }

        public KeyboardShortcutGroup(string name, KeyboardShortcutCategory category) : this()
        {
            Name = name;
            Category = category;
        }
    }

    public class ShortcutConflict
    {
        public KeyboardShortcut Shortcut1 { get; set; }
        public KeyboardShortcut Shortcut2 { get; set; }
        public ConflictSeverity Severity { get; set; }
        public string Description { get; set; }

        public string DisplayText => $"{Shortcut1?.DisplayName} and {Shortcut2?.DisplayName} both use {Shortcut1?.KeyCombination}";
    }

    public enum ConflictSeverity
    {
        Warning,
        Error
    }

    public class KeyboardShortcutSettings
    {
        public bool GlobalShortcutsEnabled { get; set; } = true;
        public bool ShowTooltipOnHover { get; set; } = true;
        public bool PlaySoundOnAction { get; set; } = false;
        public int TooltipDelay { get; set; } = 1000;
        public bool EnableSequenceShortcuts { get; set; } = false;
        public List<KeyboardShortcut> CustomShortcuts { get; set; }
        public List<string> DisabledShortcuts { get; set; }
        public Dictionary<string, string> ShortcutOverrides { get; set; }

        public KeyboardShortcutSettings()
        {
            CustomShortcuts = new List<KeyboardShortcut>();
            DisabledShortcuts = new List<string>();
            ShortcutOverrides = new Dictionary<string, string>();
        }
    }

    public class KeySequence
    {
        public List<KeyGesture> Keys { get; set; }
        public TimeSpan MaxDelay { get; set; }
        public string ActionId { get; set; }

        public KeySequence()
        {
            Keys = new List<KeyGesture>();
            MaxDelay = TimeSpan.FromSeconds(2);
        }
    }

    public class ShortcutExecutionContext
    {
        public object Source { get; set; }
        public string Context { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
        public DateTime Timestamp { get; set; }

        public ShortcutExecutionContext()
        {
            Parameters = new Dictionary<string, object>();
            Timestamp = DateTime.Now;
        }
    }

    public class ShortcutStatistics
    {
        public string ShortcutId { get; set; }
        public int UsageCount { get; set; }
        public DateTime LastUsed { get; set; }
        public TimeSpan AverageExecutionTime { get; set; }
        public Dictionary<string, int> ContextUsage { get; set; }

        public ShortcutStatistics()
        {
            ContextUsage = new Dictionary<string, int>();
        }
    }
}