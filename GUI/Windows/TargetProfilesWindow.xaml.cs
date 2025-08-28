using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Windows
{
    public partial class TargetProfilesWindow : Window
    {
        public TargetProfilesWindow()
        {
            InitializeComponent();
            Loaded += (_, __) =>
            {
                if (DataContext is TargetProfilesViewModel vm)
                {
                    vm.LoadCommand.Execute(null);
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

