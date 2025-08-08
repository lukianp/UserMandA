using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for managing DataGrid column configurations
    /// </summary>
    public interface IDataGridColumnService
    {
        /// <summary>
        /// Get column configuration for a specific view
        /// </summary>
        Task<DataGridColumnConfiguration> GetColumnConfigurationAsync(string viewName, string configurationName = "Default");

        /// <summary>
        /// Save column configuration
        /// </summary>
        Task SaveColumnConfigurationAsync(DataGridColumnConfiguration configuration);

        /// <summary>
        /// Get all saved configurations for a view
        /// </summary>
        Task<IEnumerable<DataGridColumnConfiguration>> GetSavedConfigurationsAsync(string viewName);

        /// <summary>
        /// Delete a configuration
        /// </summary>
        Task DeleteConfigurationAsync(string viewName, string configurationName);

        /// <summary>
        /// Reset to default configuration
        /// </summary>
        Task<DataGridColumnConfiguration> ResetToDefaultAsync(string viewName);

        /// <summary>
        /// Export configuration to file
        /// </summary>
        Task ExportConfigurationAsync(DataGridColumnConfiguration configuration, string filePath);

        /// <summary>
        /// Import configuration from file
        /// </summary>
        Task<DataGridColumnConfiguration> ImportConfigurationAsync(string filePath);

        /// <summary>
        /// Create default column configuration for a data type
        /// </summary>
        DataGridColumnConfiguration CreateDefaultConfiguration<T>(string viewName);

        /// <summary>
        /// Apply configuration to DataGrid
        /// </summary>
        void ApplyConfiguration(System.Windows.Controls.DataGrid dataGrid, DataGridColumnConfiguration configuration);

        /// <summary>
        /// Event fired when a configuration changes
        /// </summary>
        event EventHandler<ColumnConfigurationChangedEventArgs> ConfigurationChanged;
    }

    /// <summary>
    /// Event args for configuration changes
    /// </summary>
    public class ColumnConfigurationChangedEventArgs : EventArgs
    {
        public string ViewName { get; set; }
        public string ConfigurationName { get; set; }
        public DataGridColumnConfiguration Configuration { get; set; }
    }
}