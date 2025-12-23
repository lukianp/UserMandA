using System.Windows.Controls;

namespace GUI.Views.Modules
{
    /// <summary>
    /// Interaction logic for ApplicationsViewModule.xaml
    /// </summary>
    public partial class ApplicationsViewModule : UserControl
    {
        public ApplicationsViewModule()
        {
            InitializeComponent();
        }

        private void AppSearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            // Search functionality will be handled by the ViewModel through binding
            // This event handler is maintained for compatibility with existing code patterns
        }

        private void AppFilterCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // Filter functionality will be handled by the ViewModel through binding
            // This event handler is maintained for compatibility with existing code patterns
        }
    }
}