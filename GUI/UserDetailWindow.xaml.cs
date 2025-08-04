using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite
{
    public partial class UserDetailWindow : Window
    {
        public UserDetailViewModel ViewModel { get; private set; }

        public UserDetailWindow(dynamic selectedUser, string rawDataPath)
        {
            InitializeComponent();
            
            ViewModel = new UserDetailViewModel(selectedUser, rawDataPath);
            DataContext = ViewModel;
            
            // Handle close request from ViewModel
            ViewModel.CloseRequested += () => Close();
            
            // Bind window title
            SetBinding(TitleProperty, new System.Windows.Data.Binding(nameof(UserDetailViewModel.WindowTitle)));
        }
    }
}