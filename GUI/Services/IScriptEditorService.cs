using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for script editing and execution functionality
    /// </summary>
    public interface IScriptEditorService
    {
        /// <summary>
        /// Execute a PowerShell script
        /// </summary>
        Task<ScriptExecutionResult> ExecuteScriptAsync(string script, PowerShellExecutionOptions options = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Execute a PowerShell script from file
        /// </summary>
        Task<ScriptExecutionResult> ExecuteScriptFileAsync(string filePath, PowerShellExecutionOptions options = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate PowerShell script syntax
        /// </summary>
        Task<List<ScriptSyntaxError>> ValidateScriptAsync(string script);

        /// <summary>
        /// Get autocomplete suggestions for PowerShell
        /// </summary>
        Task<List<AutocompleteSuggestion>> GetAutocompleteSuggestionsAsync(string script, int cursorPosition);

        /// <summary>
        /// Format PowerShell script
        /// </summary>
        Task<string> FormatScriptAsync(string script);

        /// <summary>
        /// Load script file
        /// </summary>
        Task<ScriptFile> LoadScriptFileAsync(string filePath);

        /// <summary>
        /// Save script file
        /// </summary>
        Task SaveScriptFileAsync(ScriptFile scriptFile);

        /// <summary>
        /// Get default script templates
        /// </summary>
        List<ScriptTemplate> GetDefaultTemplates();

        /// <summary>
        /// Save custom script template
        /// </summary>
        Task SaveTemplateAsync(ScriptTemplate template);

        /// <summary>
        /// Load custom script templates
        /// </summary>
        Task<List<ScriptTemplate>> LoadCustomTemplatesAsync();

        /// <summary>
        /// Delete custom script template
        /// </summary>
        Task DeleteTemplateAsync(string templateId);

        /// <summary>
        /// Get script editor settings
        /// </summary>
        ScriptEditorSettings GetSettings();

        /// <summary>
        /// Save script editor settings
        /// </summary>
        Task SaveSettingsAsync(ScriptEditorSettings settings);

        /// <summary>
        /// Get recent execution results
        /// </summary>
        List<ScriptExecutionResult> GetRecentResults(int count = 20);

        /// <summary>
        /// Clear execution history
        /// </summary>
        Task ClearExecutionHistoryAsync();

        /// <summary>
        /// Cancel running script execution
        /// </summary>
        void CancelExecution();

        /// <summary>
        /// Check if PowerShell is available
        /// </summary>
        bool IsPowerShellAvailable();

        /// <summary>
        /// Get PowerShell version information
        /// </summary>
        Task<PowerShellVersionInfo> GetPowerShellVersionAsync();

        /// <summary>
        /// Event fired when script execution starts
        /// </summary>
        event EventHandler<ScriptExecutionStartedEventArgs> ExecutionStarted;

        /// <summary>
        /// Event fired when script execution completes
        /// </summary>
        event EventHandler<ScriptExecutionCompletedEventArgs> ExecutionCompleted;

        /// <summary>
        /// Event fired when script execution produces output
        /// </summary>
        event EventHandler<ScriptOutputEventArgs> OutputReceived;
    }

    /// <summary>
    /// Script syntax error model
    /// </summary>
    public class ScriptSyntaxError
    {
        public int Line { get; set; }
        public int Column { get; set; }
        public string Message { get; set; }
        public string Severity { get; set; }
        public string ErrorCode { get; set; }
    }

    /// <summary>
    /// PowerShell version information
    /// </summary>
    public class PowerShellVersionInfo
    {
        public string Version { get; set; }
        public string Edition { get; set; }
        public string PSCompatibleVersions { get; set; }
        public string BuildVersion { get; set; }
        public string CLRVersion { get; set; }
        public string WSManStackVersion { get; set; }
    }

    /// <summary>
    /// Event args for script execution started
    /// </summary>
    public class ScriptExecutionStartedEventArgs : EventArgs
    {
        public string Script { get; set; }
        public DateTime StartTime { get; set; }
        public PowerShellExecutionOptions Options { get; set; }
    }

    /// <summary>
    /// Event args for script execution completed
    /// </summary>
    public class ScriptExecutionCompletedEventArgs : EventArgs
    {
        public ScriptExecutionResult Result { get; set; }
    }

    /// <summary>
    /// Event args for script output
    /// </summary>
    public class ScriptOutputEventArgs : EventArgs
    {
        public string Output { get; set; }
        public bool IsError { get; set; }
        public DateTime Timestamp { get; set; }
    }
}