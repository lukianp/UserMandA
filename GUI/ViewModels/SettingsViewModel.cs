using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Settings view
    /// </summary>
    public class SettingsViewModel : BaseViewModel, IAutoLoadable
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

        public SettingsViewModel()
        {
            CompanyProfiles = new ObservableCollection<string> { "ljpops", "demo", "test" };
            Themes = new ObservableCollection<string> { "Dark", "Light", "High Contrast" };
            
            SaveSettingsCommand = new AsyncRelayCommand(SaveSettingsAsync);
            ResetSettingsCommand = new RelayCommand(ResetSettings);
        }

        public override async Task LoadAsync()
        {
            try
            {
                _ = EnhancedLoggingService.Instance.LogInformationAsync("SettingsViewModel: LoadAsync started");
                IsLoading = true;
                LoadingMessage = "Loading settings...";
                
                await Task.Delay(500); // Simulate loading
                
                // TODO: Load actual settings from ConfigurationService
                // HasData is automatically true since _selectedProfile has a default value
                
                _ = EnhancedLoggingService.Instance.LogInformationAsync("SettingsViewModel: LoadAsync completed");
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SettingsViewModel.LoadAsync failed: {ex.Message}");
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
                _ = EnhancedLoggingService.Instance.LogUserActionAsync("Save Settings", $"Profile: {SelectedProfile}, Theme: {SelectedTheme}");
                // TODO: Save settings to ConfigurationService
                await Task.Delay(100);
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SettingsViewModel.SaveSettingsAsync failed: {ex.Message}");
            }
        }

        private void ResetSettings()
        {
            try
            {
                _ = EnhancedLoggingService.Instance.LogUserActionAsync("Reset Settings", "Resetting to defaults");
                SelectedProfile = "ljpops";
                SelectedTheme = "Dark";
                RefreshInterval = 30;
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"SettingsViewModel.ResetSettings failed: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Interface for ViewModels that support auto-loading
    /// </summary>
    public interface IAutoLoadable
    {
        Task LoadAsync();
    }
}