using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for SecurityPolicyView.xaml
    /// </summary>
    public partial class SecurityPolicyView : UserControl
    {
        public SecurityPolicyView()
        {
            InitializeComponent();
            
            // Set the DataContext to the SecurityPolicyViewModel
            DataContext = new SecurityPolicyViewModel();
        }
    }
}