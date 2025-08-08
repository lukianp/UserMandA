using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Script execution result model
    /// </summary>
    public class ScriptExecutionResult
    {
        public DateTime Timestamp { get; set; }
        public string Script { get; set; }
        public bool IsSuccess { get; set; }
        public string Output { get; set; }
        public string Error { get; set; }
        public TimeSpan ExecutionTime { get; set; }
        public int ExitCode { get; set; }
        public ScriptExecutionState State { get; set; }
        public string WorkingDirectory { get; set; }
    }

    /// <summary>
    /// Script execution state enumeration
    /// </summary>
    public enum ScriptExecutionState
    {
        NotStarted,
        Running,
        Completed,
        CompletedWithErrors,
        Cancelled,
        Failed
    }

    /// <summary>
    /// Script template model
    /// </summary>
    public class ScriptTemplate : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private string _content;
        private ScriptTemplateCategory _category;

        public event PropertyChangedEventHandler PropertyChanged;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public string Content
        {
            get => _content;
            set => SetProperty(ref _content, value);
        }

        public ScriptTemplateCategory Category
        {
            get => _category;
            set => SetProperty(ref _category, value);
        }

        public DateTime Created { get; set; } = DateTime.Now;
        public DateTime Modified { get; set; } = DateTime.Now;
        public List<string> Tags { get; set; } = new List<string>();
        public bool IsReadOnly { get; set; } = false;

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Script template categories
    /// </summary>
    public enum ScriptTemplateCategory
    {
        Discovery,
        Analysis,
        Export,
        Maintenance,
        Testing,
        Migration,
        Reporting,
        Custom
    }

    /// <summary>
    /// Script editor settings
    /// </summary>
    public class ScriptEditorSettings : INotifyPropertyChanged
    {
        private bool _wordWrap;
        private bool _showLineNumbers;
        private bool _enableAutoComplete;
        private bool _enableSyntaxHighlighting = true;
        private string _fontFamily = "Consolas";
        private int _fontSize = 12;
        private string _theme = "Default";
        private bool _enableBracketMatching = true;
        private bool _enableFolding = true;
        private bool _autoSave = true;
        private int _autoSaveInterval = 30; // seconds

        public event PropertyChangedEventHandler PropertyChanged;

        public bool WordWrap
        {
            get => _wordWrap;
            set => SetProperty(ref _wordWrap, value);
        }

        public bool ShowLineNumbers
        {
            get => _showLineNumbers;
            set => SetProperty(ref _showLineNumbers, value);
        }

        public bool EnableAutoComplete
        {
            get => _enableAutoComplete;
            set => SetProperty(ref _enableAutoComplete, value);
        }

        public bool EnableSyntaxHighlighting
        {
            get => _enableSyntaxHighlighting;
            set => SetProperty(ref _enableSyntaxHighlighting, value);
        }

        public string FontFamily
        {
            get => _fontFamily;
            set => SetProperty(ref _fontFamily, value);
        }

        public int FontSize
        {
            get => _fontSize;
            set => SetProperty(ref _fontSize, value);
        }

        public string Theme
        {
            get => _theme;
            set => SetProperty(ref _theme, value);
        }

        public bool EnableBracketMatching
        {
            get => _enableBracketMatching;
            set => SetProperty(ref _enableBracketMatching, value);
        }

        public bool EnableFolding
        {
            get => _enableFolding;
            set => SetProperty(ref _enableFolding, value);
        }

        public bool AutoSave
        {
            get => _autoSave;
            set => SetProperty(ref _autoSave, value);
        }

        public int AutoSaveInterval
        {
            get => _autoSaveInterval;
            set => SetProperty(ref _autoSaveInterval, value);
        }

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Script file information
    /// </summary>
    public class ScriptFile : INotifyPropertyChanged
    {
        private string _fileName;
        private string _content;
        private bool _isModified;
        private bool _isReadOnly;

        public event PropertyChangedEventHandler PropertyChanged;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FilePath { get; set; }
        
        public string FileName
        {
            get => _fileName;
            set => SetProperty(ref _fileName, value);
        }

        public string Content
        {
            get => _content;
            set => SetProperty(ref _content, value);
        }

        public bool IsModified
        {
            get => _isModified;
            set => SetProperty(ref _isModified, value);
        }

        public bool IsReadOnly
        {
            get => _isReadOnly;
            set => SetProperty(ref _isReadOnly, value);
        }

        public DateTime LastModified { get; set; } = DateTime.Now;
        public string Language { get; set; } = "PowerShell";
        public long FileSize { get; set; }

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// PowerShell execution options
    /// </summary>
    public class PowerShellExecutionOptions
    {
        public string WorkingDirectory { get; set; }
        public Dictionary<string, object> Variables { get; set; } = new Dictionary<string, object>();
        public bool CaptureOutput { get; set; } = true;
        public bool CaptureError { get; set; } = true;
        public int TimeoutSeconds { get; set; } = 300; // 5 minutes default
        public PowerShellExecutionPolicy ExecutionPolicy { get; set; } = PowerShellExecutionPolicy.Bypass;
        public bool NoProfile { get; set; } = true;
        public bool NoLogo { get; set; } = true;
        public bool WindowStyle { get; set; } = false; // Hidden
    }

    /// <summary>
    /// PowerShell execution policy enumeration
    /// </summary>
    public enum PowerShellExecutionPolicy
    {
        Bypass,
        RemoteSigned,
        Unrestricted,
        AllSigned,
        Restricted
    }

    /// <summary>
    /// Autocomplete suggestion model
    /// </summary>
    public class AutocompleteSuggestion
    {
        public string Text { get; set; }
        public string DisplayText { get; set; }
        public string Description { get; set; }
        public AutocompleteSuggestionType Type { get; set; }
        public string Icon { get; set; }
        public int Priority { get; set; } = 0;
    }

    /// <summary>
    /// Autocomplete suggestion types
    /// </summary>
    public enum AutocompleteSuggestionType
    {
        Cmdlet,
        Function,
        Variable,
        Parameter,
        Property,
        Method,
        Keyword,
        Snippet,
        Module,
        Type
    }
}