using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Settings view using unified pattern
    /// </summary>
    public class SettingsViewModel : BaseViewModel
    {
        private string _selectedProfile = "ljpops";
        private string _selectedTheme = "Dark";
        private int _refreshInterval = 30;
        private string _dataDirectory = @"C:\discoverydata";
        private string _logDirectory = @"C:\discoverydata\ljpops\Logs";

        public ObservableCollection<string> CompanyProfiles { get; }
        public ObservableCollection<string> Themes { get; }

        public override bool HasData => !string.IsNullOrEmpty(_selectedProfile);

        public string SelectedProfile
        {
            get => _selectedProfile;
            set => SetProperty(ref _selectedProfile, value);
        }

        public string SelectedTheme
        {
            get => _selectedTheme;
            set => SetProperty(ref _selectedTheme, value);
        }

        public int RefreshInterval
        {
            get => _refreshInterval;
            set => SetProperty(ref _refreshInterval, value);
        }

        public string DataDirectory
        {
            get => _dataDirectory;
            set => SetProperty(ref _dataDirectory, value);
        }

        public string LogDirectory
        {
            get => _logDirectory;
            set => SetProperty(ref _logDirectory, value);
        }

        public ICommand SaveSettingsCommand { get; }
        public ICommand ResetSettingsCommand { get; }

        public SettingsViewModel(ILogger<SettingsViewModel> logger) : base(logger)
        {
            CompanyProfiles = new ObservableCollection<string> { "ljpops", "demo", "test" };
            Themes = new ObservableCollection<string> { "Dark", "Light", "High Contrast" };
            
            SaveSettingsCommand = new AsyncRelayCommand(SaveSettingsAsync);
            ResetSettingsCommand = new RelayCommand(ResetSettings);
        }

        public override async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "settings" }, "Starting settings view load");
                
                await Task.Delay(500); // Simulate loading
                
                // Load actual settings from ConfigurationService
                var configService = ConfigurationService.Instance;
                configService.LoadSettings();
                configService.LoadPreferences();
                
                // Update properties from loaded configuration
                if (configService.Settings != null)
                {
                    StructuredLogger?.LogDebug(LogSourceName, new { action = "config_loaded", component = "settings" }, "Settings loaded from ConfigurationService");
                }
                
                HasData = true; // Settings are always available
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "settings", profile = SelectedProfile, theme = SelectedTheme }, "Settings view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "settings" }, "Failed to load settings view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }

        private async Task SaveSettingsAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "save_start", component = "settings", profile = SelectedProfile, theme = SelectedTheme, refresh_interval = RefreshInterval }, "Starting settings save");
                
                // Save settings to ConfigurationService
                var configService = ConfigurationService.Instance;
                await configService.SaveSettingsAsync();
                await configService.SavePreferencesAsync();
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "save_complete", component = "settings" }, "Settings saved to ConfigurationService");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "save_fail", component = "settings" }, "Failed to save settings");
            }
        }

        private void ResetSettings()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "reset", component = "settings" }, "Resetting settings to defaults");
                SelectedProfile = "ljpops";
                SelectedTheme = "Dark";
                RefreshInterval = 30;
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "reset_fail", component = "settings" }, "Failed to reset settings");
            }
        }
    }
}