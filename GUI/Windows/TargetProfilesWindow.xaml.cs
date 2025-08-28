using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Windows
{
    public partial class TargetProfilesWindow : Window
    {
        public TargetProfilesWindow()
        {
            InitializeComponent();
            Loaded += async (_, __) =>
            {
                if (DataContext is TargetProfilesViewModel vm)
                {
                    await vm.LoadCommand.ExecuteAsync(null);
                }
            };
        }

        private void SecretBox_PasswordChanged(object sender, System.Windows.RoutedEventArgs e)
        {
            if (DataContext is TargetProfilesViewModel vm && sender is System.Windows.Controls.PasswordBox pb)
            {
                // Set plain secret to VM; it's encrypted on save and cleared after
                vm.ClientSecret = pb.Password;
            }
        }
    }
}

