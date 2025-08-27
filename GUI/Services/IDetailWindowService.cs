using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing detail pop-out windows
    /// </summary>
    public interface IDetailWindowService
    {
        #region Window Management

        /// <summary>
        /// Shows a detail window for the specified data
        /// </summary>
        Task<Window> ShowDetailWindowAsync<T>(T data, DetailWindowConfiguration config = null) where T : DetailWindowDataBase;

        /// <summary>
        /// Shows a detail window with custom content
        /// </summary>
        Task<Window> ShowCustomDetailWindowAsync(string title, object content, DetailWindowConfiguration config = null);

        /// <summary>
        /// Closes a specific detail window
        /// </summary>
        bool CloseDetailWindow(string windowId);

        /// <summary>
        /// Closes all detail windows of a specific type
        /// </summary>
        int CloseDetailWindowsByType(string windowType);

        /// <summary>
        /// Closes all detail windows
        /// </summary>
        void CloseAllDetailWindows();

        /// <summary>
        /// Gets all currently open detail windows
        /// </summary>
        List<Window> GetOpenDetailWindows();

        /// <summary>
        /// Gets detail windows by type
        /// </summary>
        List<Window> GetDetailWindowsByType(string windowType);

        /// <summary>
        /// Checks if a detail window is already open for specific data
        /// </summary>
        bool IsDetailWindowOpen(string dataId, string windowType);

        #endregion

        #region Window Configuration

        /// <summary>
        /// Gets default configuration for a window type
        /// </summary>
        DetailWindowConfiguration GetDefaultConfiguration(string windowType);

        /// <summary>
        /// Sets default configuration for a window type
        /// </summary>
        void SetDefaultConfiguration(string windowType, DetailWindowConfiguration config);

        /// <summary>
        /// Gets user-customized configuration for a window type
        /// </summary>
        Task<DetailWindowConfiguration> GetUserConfigurationAsync(string windowType);

        /// <summary>
        /// Saves user configuration for a window type
        /// </summary>
        Task SaveUserConfigurationAsync(string windowType, DetailWindowConfiguration config);

        /// <summary>
        /// Resets configuration to defaults for a window type
        /// </summary>
        void ResetConfigurationToDefaults(string windowType);

        #endregion

        #region Template Management

        /// <summary>
        /// Registers a custom detail window template
        /// </summary>
        void RegisterTemplate(string templateName, Type viewType, Type viewModelType = null);

        /// <summary>
        /// Unregisters a detail window template
        /// </summary>
        bool UnregisterTemplate(string templateName);

        /// <summary>
        /// Gets all registered templates
        /// </summary>
        Dictionary<string, Type> GetRegisteredTemplates();

        /// <summary>
        /// Checks if a template is registered
        /// </summary>
        bool IsTemplateRegistered(string templateName);

        #endregion

        #region Positioning and Layout

        /// <summary>
        /// Arranges detail windows in a cascading layout
        /// </summary>
        void ArrangeWindowsCascade();

        /// <summary>
        /// Arranges detail windows in a tile layout
        /// </summary>
        void ArrangeWindowsTile();

        /// <summary>
        /// Minimizes all detail windows
        /// </summary>
        void MinimizeAllWindows();

        /// <summary>
        /// Restores all minimized detail windows
        /// </summary>
        void RestoreAllWindows();

        /// <summary>
        /// Brings a specific detail window to front
        /// </summary>
        void BringWindowToFront(string windowId);

        #endregion

        #region Data Integration

        /// <summary>
        /// Refreshes data in all windows of a specific type
        /// </summary>
        Task RefreshWindowsByTypeAsync(string windowType);

        /// <summary>
        /// Refreshes data in a specific window
        /// </summary>
        Task RefreshWindowAsync(string windowId);

        /// <summary>
        /// Updates data in windows that match specific criteria
        /// </summary>
        Task UpdateWindowDataAsync(string dataId, object updatedData);

        #endregion

        #region Events

        /// <summary>
        /// Fired when a detail window is opened
        /// </summary>
        event EventHandler<DetailWindowEventArgs> WindowOpened;

        /// <summary>
        /// Fired when a detail window is closed
        /// </summary>
        event EventHandler<DetailWindowEventArgs> WindowClosed;

        /// <summary>
        /// Fired when a detail window is activated
        /// </summary>
        event EventHandler<DetailWindowEventArgs> WindowActivated;

        /// <summary>
        /// Fired when data in a detail window is updated
        /// </summary>
        event EventHandler<DetailWindowDataUpdatedEventArgs> WindowDataUpdated;

        #endregion

        #region Settings

        /// <summary>
        /// Gets current service settings
        /// </summary>
        DetailWindowServiceSettings GetSettings();

        /// <summary>
        /// Updates service settings
        /// </summary>
        Task UpdateSettingsAsync(DetailWindowServiceSettings settings);

        /// <summary>
        /// Exports all window configurations and settings
        /// </summary>
        Task<string> ExportSettingsAsync();

        /// <summary>
        /// Imports window configurations and settings
        /// </summary>
        Task ImportSettingsAsync(string settingsJson);

        #endregion
    }

    /// <summary>
    /// Event arguments for detail window events
    /// </summary>
    public class DetailWindowEventArgs : EventArgs
    {
        public string WindowId { get; set; }
        public string WindowType { get; set; }
        public Window Window { get; set; }
        public object Data { get; set; }
        public DateTime Timestamp { get; set; }

        public DetailWindowEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }

    /// <summary>
    /// Event arguments for detail window data updates
    /// </summary>
    public class DetailWindowDataUpdatedEventArgs : EventArgs
    {
        public string WindowId { get; set; }
        public string DataId { get; set; }
        public object OldData { get; set; }
        public object NewData { get; set; }
        public DateTime Timestamp { get; set; }

        public DetailWindowDataUpdatedEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }

    /// <summary>
    /// Settings for the detail window service
    /// </summary>
    public class DetailWindowServiceSettings
    {
        public bool AllowMultipleInstances { get; set; } = true;
        public bool RememberWindowPositions { get; set; } = true;
        public bool AutoRefreshData { get; set; } = true;
        public int AutoRefreshIntervalSeconds { get; set; } = 30;
        public bool ShowInTaskbar { get; set; } = false;
        public bool UseAnimations { get; set; } = true;
        public DetailWindowTheme DefaultTheme { get; set; } = DetailWindowTheme.Default;
        public double DefaultWindowWidth { get; set; } = 800;
        public double DefaultWindowHeight { get; set; } = 600;
        public bool EnableKeyboardShortcuts { get; set; } = true;
        public int MaximumOpenWindows { get; set; } = 10;
        public bool WarnBeforeClosingMultiple { get; set; } = true;
    }
}