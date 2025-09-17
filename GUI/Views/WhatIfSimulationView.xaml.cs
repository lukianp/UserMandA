#nullable enable

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
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            var selectedTab = (DataContext as WhatIfSimulationViewModel)?.SelectedTab ?? "Parameters";
            UpdateTabVisibility(selectedTab);
        }

        private void OnTabClicked(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string tabName)
            {
                UpdateTabVisibility(tabName);

                if (DataContext is WhatIfSimulationViewModel viewModel)
                {
                    viewModel.SelectedTab = tabName;
                }
            }
        }

        private void UpdateTabVisibility(string tabName)
        {
            var parametersTab = this.FindName("ParametersTab") as FrameworkElement;
            if (parametersTab != null) parametersTab.Visibility = tabName == "Parameters" ? Visibility.Visible : Visibility.Collapsed;

            var scenariosTab = this.FindName("ScenariosTab") as FrameworkElement;
            if (scenariosTab != null) scenariosTab.Visibility = tabName == "Scenarios" ? Visibility.Visible : Visibility.Collapsed;

            var resultsTab = this.FindName("ResultsTab") as FrameworkElement;
            if (resultsTab != null) resultsTab.Visibility = tabName == "Results" ? Visibility.Visible : Visibility.Collapsed;

            var analysisTab = this.FindName("AnalysisTab") as FrameworkElement;
            if (analysisTab != null) analysisTab.Visibility = tabName == "Analysis" ? Visibility.Visible : Visibility.Collapsed;
        }
    }
}