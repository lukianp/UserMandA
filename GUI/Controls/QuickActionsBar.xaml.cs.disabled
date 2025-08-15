using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for QuickActionsBar.xaml
    /// </summary>
    public partial class QuickActionsBar : UserControl
    {
        private QuickActionsBarViewModel _viewModel;

        public QuickActionsBar()
        {
            InitializeComponent();
            _viewModel = new QuickActionsBarViewModel();
            DataContext = _viewModel;
        }

        private void CollapsedIndicator_Click(object sender, MouseButtonEventArgs e)
        {
            _viewModel?.ToggleVisibility();
        }

        private void FloatingActionButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            // Show context menu or popup
            if (FloatingActionButton.ContextMenu != null)
            {
                FloatingActionButton.ContextMenu.IsOpen = true;
            }
        }

        /// <summary>
        /// Gets the view model for the quick actions bar
        /// </summary>
        public QuickActionsBarViewModel ViewModel => _viewModel;

        /// <summary>
        /// Sets the context for dynamic actions
        /// </summary>
        public void SetContext(object context)
        {
            _viewModel?.SetContext(context);
        }

        /// <summary>
        /// Adds a custom action to the bar
        /// </summary>
        public void AddAction(QuickAction action, ActionCategory category = ActionCategory.Primary)
        {
            _viewModel?.AddAction(action, category);
        }

        /// <summary>
        /// Removes an action from the bar
        /// </summary>
        public void RemoveAction(string actionId)
        {
            _viewModel?.RemoveAction(actionId);
        }

        /// <summary>
        /// Updates the status display
        /// </summary>
        public void UpdateStatus(string statusText, string statusColor = "#28A745")
        {
            _viewModel?.UpdateStatus(statusText, statusColor);
        }
    }
}