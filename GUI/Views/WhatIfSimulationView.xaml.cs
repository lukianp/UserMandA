using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for WhatIfSimulationView.xaml
    /// </summary>
    public partial class WhatIfSimulationView : UserControl
    {
        public WhatIfSimulationView()
        {
            InitializeComponent();
        }

        /// <summary>
        /// Handle tab switching
        /// </summary>
        private void OnTabClicked(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string tabName)
            {
                // Hide all tabs
                ParametersTab.Visibility = Visibility.Collapsed;
                ScenariosTab.Visibility = Visibility.Collapsed;
                ResultsTab.Visibility = Visibility.Collapsed;
                AnalysisTab.Visibility = Visibility.Collapsed;

                // Show selected tab
                switch (tabName)
                {
                    case "Parameters":
                        ParametersTab.Visibility = Visibility.Visible;
                        break;
                    case "Scenarios":
                        ScenariosTab.Visibility = Visibility.Visible;
                        break;
                    case "Results":
                        ResultsTab.Visibility = Visibility.Visible;
                        break;
                    case "Analysis":
                        AnalysisTab.Visibility = Visibility.Visible;
                        break;
                }

                // Update ViewModel if needed
                if (DataContext is WhatIfSimulationViewModel viewModel)
                {
                    viewModel.SelectedTab = tabName;
                }
            }
        }
    }
}