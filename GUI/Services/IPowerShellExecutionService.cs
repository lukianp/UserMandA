using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for PowerShell execution service with enterprise-grade capabilities
    /// </summary>
    public interface IPowerShellExecutionService : IDisposable
    {
        /// <summary>
        /// Execute PowerShell module with real-time progress and output streaming
        /// </summary>
        Task<PowerShellExecutionResult> ExecuteModuleAsync(
            string modulePath,
            string functionName,
            Dictionary<string, object> parameters = null,
            PowerShellExecutionOptions options = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Execute PowerShell script directly with specified parameters
        /// </summary>
        Task<PowerShellExecutionResult> ExecuteScriptAsync(
            string script,
            Dictionary<string, object> parameters = null,
            PowerShellExecutionOptions options = null,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Execute migration item using appropriate PowerShell module
        /// </summary>
        Task<MigrationItemResult> ExecuteMigrationItemAsync(
            MigrationItem item,
            MigrationBatch batch,
            MigrationExecutionContext context,
            CancellationToken cancellationToken = default);

        // Events for real-time feedback
        event EventHandler<PowerShellProgressEventArgs> ProgressReported;
        event EventHandler<PowerShellOutputEventArgs> OutputReceived;
        event EventHandler<PowerShellErrorEventArgs> ErrorOccurred;
    }
}