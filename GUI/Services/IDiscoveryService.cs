using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for discovery operations
    /// </summary>
    public interface IDiscoveryService
    {
        /// <summary>
        /// Event raised when discovery progress changes
        /// </summary>
        event EventHandler<DiscoveryProgressEventArgs> ProgressChanged;

        /// <summary>
        /// Event raised when discovery is completed
        /// </summary>
        event EventHandler<DiscoveryCompletedEventArgs> DiscoveryCompleted;

        /// <summary>
        /// Gets all available discovery modules
        /// </summary>
        /// <returns>Collection of discovery modules</returns>
        Task<IEnumerable<DiscoveryModule>> GetDiscoveryModulesAsync();

        /// <summary>
        /// Executes a specific discovery module
        /// </summary>
        /// <param name="module">Module to execute</param>
        /// <param name="profileName">Company profile name</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Discovery result</returns>
        Task<DiscoveryExecutionResult> ExecuteDiscoveryAsync(DiscoveryModule module, string profileName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Executes multiple discovery modules in parallel
        /// </summary>
        /// <param name="modules">Modules to execute</param>
        /// <param name="profileName">Company profile name</param>
        /// <param name="maxConcurrency">Maximum concurrent executions</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Collection of discovery results</returns>
        Task<IEnumerable<DiscoveryExecutionResult>> ExecuteDiscoveryBatchAsync(
            IEnumerable<DiscoveryModule> modules, 
            string profileName, 
            int maxConcurrency = 3,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the last discovery execution time for a module
        /// </summary>
        /// <param name="moduleName">Module name</param>
        /// <param name="profileName">Company profile name</param>
        /// <returns>Last execution time or null if never executed</returns>
        Task<DateTime?> GetLastExecutionTimeAsync(string moduleName, string profileName);

        /// <summary>
        /// Validates discovery prerequisites and environment
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <returns>Validation result</returns>
        Task<ValidationResult> ValidateEnvironmentAsync(string profileName);

        /// <summary>
        /// Gets discovery results for a profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <returns>Collection of discovery results</returns>
        Task<IEnumerable<DiscoveryExecutionResult>> GetResultsAsync(string profileName);

        /// <summary>
        /// Exports discovery results to specified format
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="exportPath">Export file path</param>
        /// <param name="format">Export format</param>
        /// <returns>True if successful</returns>
        Task<bool> ExportResultsAsync(string profileName, string exportPath, string format = "CSV");

        /// <summary>
        /// Starts discovery for specified modules and profile
        /// </summary>
        /// <param name="profileName">Company profile name</param>
        /// <param name="moduleNames">Module names to execute</param>
        /// <returns>True if started successfully</returns>
        Task<bool> StartDiscoveryAsync(string profileName, string[] moduleNames);
    }

    /// <summary>
    /// Discovery progress event arguments
    /// </summary>
    public class DiscoveryProgressEventArgs : EventArgs
    {
        public string ModuleName { get; set; }
        public int ProgressPercentage { get; set; }
        public string CurrentOperation { get; set; }
        public TimeSpan Elapsed { get; set; }
        public TimeSpan? EstimatedRemaining { get; set; }
    }

    /// <summary>
    /// Discovery completed event arguments
    /// </summary>
    public class DiscoveryCompletedEventArgs : EventArgs
    {
        public string ModuleName { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public TimeSpan Duration { get; set; }
        public int ItemsDiscovered { get; set; }
    }

    /// <summary>
    /// Discovery validation result
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public List<string> Info { get; set; } = new List<string>();
        public Dictionary<string, object> Context { get; set; } = new Dictionary<string, object>();

        public void AddError(string error)
        {
            Errors.Add(error);
            IsValid = false;
        }

        public void AddWarning(string warning)
        {
            Warnings.Add(warning);
        }

        public void AddInfo(string info)
        {
            Info.Add(info);
        }

        public string GetSummaryMessage()
        {
            if (!IsValid && Errors.Any())
                return string.Join("; ", Errors);
            
            if (Warnings.Any())
                return string.Join("; ", Warnings);
            
            return IsValid ? "Valid" : "Invalid";
        }
    }

    /// <summary>
    /// Discovery execution result
    /// </summary>
    public class DiscoveryExecutionResult
    {
        public string ModuleName { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration => EndTime - StartTime;
        public int ItemsDiscovered { get; set; }
        public string OutputPath { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }
}