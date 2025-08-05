using System;
using System.ComponentModel;
using System.Windows;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite
{
    public partial class RefreshSettingsDialog : Window, INotifyPropertyChanged
    {
        private RefreshSettings _originalSettings;
        private RefreshService _refreshService;

        public RefreshService RefreshServiceInstance
        {
            get => _refreshService;
            set
            {
                _refreshService = value;
                OnPropertyChanged(nameof(RefreshServiceInstance));
            }
        }

        public RefreshSettings Settings => _refreshService?.Settings;

        public RefreshSettingsDialog()
        {
            InitializeComponent();
            
            RefreshServiceInstance = RefreshService.Instance;
            
            // Create a backup of original settings
            _originalSettings = new RefreshSettings
            {
                GlobalInterval = Settings.GlobalInterval,
                DashboardEnabled = Settings.DashboardEnabled,
                UsersEnabled = Settings.UsersEnabled,
                InfrastructureEnabled = Settings.InfrastructureEnabled,
                GroupsEnabled = Settings.GroupsEnabled,
                RefreshOnlyWhenVisible = Settings.RefreshOnlyWhenVisible,
                PauseWhenDiscoveryRunning = Settings.PauseWhenDiscoveryRunning
            };

            DataContext = this;
            
            // Set the selected interval in the ComboBox
            IntervalComboBox.SelectedValue = (int)Settings.GlobalInterval;
        }

        private void ApplyButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Settings are already bound, just close the dialog
                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error applying refresh settings: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            // Restore original settings
            Settings.GlobalInterval = _originalSettings.GlobalInterval;
            Settings.DashboardEnabled = _originalSettings.DashboardEnabled;
            Settings.UsersEnabled = _originalSettings.UsersEnabled;
            Settings.InfrastructureEnabled = _originalSettings.InfrastructureEnabled;
            Settings.GroupsEnabled = _originalSettings.GroupsEnabled;
            Settings.RefreshOnlyWhenVisible = _originalSettings.RefreshOnlyWhenVisible;
            Settings.PauseWhenDiscoveryRunning = _originalSettings.PauseWhenDiscoveryRunning;
            
            DialogResult = false;
            Close();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            CancelButton_Click(sender, e);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}