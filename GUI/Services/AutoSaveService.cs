using System;
using System.Threading;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for automatically saving configuration at regular intervals
    /// </summary>
    public class AutoSaveService : IDisposable
    {
        private readonly ConfigurationService _configurationService;
        private readonly Timer _autoSaveTimer;
        private bool _disposed = false;
        private bool _isEnabled = true;

        public AutoSaveService()
        {
            _configurationService = ConfigurationService.Instance;
            
            // Get auto-save interval from settings (default 5 minutes)
            var intervalMinutes = _configurationService.Settings?.AutoSaveIntervalMinutes ?? 5;
            var intervalMs = intervalMinutes * 60 * 1000;
            
            // Start auto-save timer
            _autoSaveTimer = new Timer(AutoSaveCallback, null, intervalMs, intervalMs);
        }

        /// <summary>
        /// Gets or sets whether auto-save is enabled
        /// </summary>
        public bool IsEnabled
        {
            get => _isEnabled;
            set
            {
                _isEnabled = value;
                if (_isEnabled)
                {
                    RestartTimer();
                }
            }
        }

        /// <summary>
        /// Manually triggers an auto-save
        /// </summary>
        public async Task SaveNowAsync()
        {
            if (!_isEnabled) return;

            try
            {
                await _configurationService.SaveSettingsAsync();
                await _configurationService.SavePreferencesAsync();
                await _configurationService.SaveSessionAsync();
                
                System.Diagnostics.Debug.WriteLine($"Auto-save completed at {DateTime.Now:HH:mm:ss}");
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Auto-save failed");
            }
        }

        /// <summary>
        /// Updates the auto-save interval
        /// </summary>
        public void UpdateInterval(int minutes)
        {
            if (minutes < 1 || minutes > 60)
                throw new ArgumentOutOfRangeException(nameof(minutes), "Interval must be between 1 and 60 minutes");

            var intervalMs = minutes * 60 * 1000;
            _autoSaveTimer?.Change(intervalMs, intervalMs);
            
            System.Diagnostics.Debug.WriteLine($"Auto-save interval updated to {minutes} minutes");
        }

        /// <summary>
        /// Restarts the auto-save timer with current settings
        /// </summary>
        private void RestartTimer()
        {
            var intervalMinutes = _configurationService.Settings?.AutoSaveIntervalMinutes ?? 5;
            var intervalMs = intervalMinutes * 60 * 1000;
            _autoSaveTimer?.Change(intervalMs, intervalMs);
        }

        /// <summary>
        /// Auto-save timer callback
        /// </summary>
        private async void AutoSaveCallback(object state)
        {
            if (!_isEnabled || _disposed) return;

            // Check if auto-save is enabled in settings
            var settings = _configurationService.Settings;
            if (settings?.AutoSaveEnabled != true) return;

            await SaveNowAsync();
        }

        /// <summary>
        /// Performs a final save before disposal
        /// </summary>
        public async Task SaveOnExitAsync()
        {
            try
            {
                // Always save on exit regardless of auto-save setting
                await _configurationService.SaveSettingsAsync();
                await _configurationService.SavePreferencesAsync();
                await _configurationService.SaveSessionAsync();
                
                // Create a backup
                await _configurationService.CreateBackupAsync();
                
                System.Diagnostics.Debug.WriteLine("Configuration saved on exit");
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Failed to save configuration on exit");
            }
        }

        public void Dispose()
        {
            if (_disposed) return;

            _disposed = true;
            _autoSaveTimer?.Dispose();
            
            // Don't call SaveOnExitAsync here as it's async and Dispose should be synchronous
            // SaveOnExitAsync should be called explicitly before disposing
        }
    }
}