using System;
using System.Windows;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for UserDetailWindow.xaml
    /// </summary>
    public partial class UserDetailWindow : Window
    {
        public UserDetailWindow()
        {
            InitializeComponent();
            Loaded += UserDetailWindow_Loaded;
        }

        public UserDetailWindow(UserDetailData userData) : this()
        {
            DataContext = userData;
        }

        private void UserDetailWindow_Loaded(object sender, RoutedEventArgs e)
        {
            if (DataContext is UserDetailData userData)
            {
                Title = $"User Details - {userData.DisplayName}";
            }
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        protected override void OnKeyDown(System.Windows.Input.KeyEventArgs e)
        {
            // Handle keyboard shortcuts
            switch (e.Key)
            {
                case System.Windows.Input.Key.Escape:
                    Close();
                    e.Handled = true;
                    break;
                case System.Windows.Input.Key.F5:
                    RefreshUserData();
                    e.Handled = true;
                    break;
            }

            base.OnKeyDown(e);
        }

        private void RefreshUserData()
        {
            if (DataContext is UserDetailData userData)
            {
                userData.IsLoading = true;
                
                // Simulate data refresh
                var timer = new System.Windows.Threading.DispatcherTimer();
                timer.Interval = TimeSpan.FromSeconds(1);
                timer.Tick += (s, e) =>
                {
                    timer.Stop();
                    userData.LastUpdated = DateTime.Now;
                    userData.IsLoading = false;
                };
                timer.Start();
            }
        }

        protected override void OnSourceInitialized(EventArgs e)
        {
            base.OnSourceInitialized(e);
            
            // Initialize keyboard shortcuts for this window
            try
            {
                MandADiscoverySuite.Helpers.KeyboardShortcutIntegration.InitializeForWindow(this, "UserDetailWindow");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing keyboard shortcuts: {ex.Message}");
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            try
            {
                MandADiscoverySuite.Helpers.KeyboardShortcutIntegration.CleanupForWindow(this);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error cleaning up keyboard shortcuts: {ex.Message}");
            }
            
            base.OnClosed(e);
        }
    }
}